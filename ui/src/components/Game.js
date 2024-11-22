import React, { useState, useEffect, useRef } from 'react';
import { webSocketService } from './websocket';
import { Box, Typography, Button, TextField, Card, CardContent, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Badge } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ChatIcon from '@mui/icons-material/Chat';
import { useLocation, useNavigate } from 'react-router-dom';
import Navi from './NavigationBar';
import Dice from './Dice';
import { jwtDecode } from 'jwt-decode';
import notificationSound from '../assets/notification-sound.mp3';

const Game = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [game, setGame] = useState(state?.game || {});
  const [userAnswer, setUserAnswer] = useState('');
  const [error, setError] = useState(null);
  const [disconnectDialog, setDisconnectDialog] = useState(false);
  const [disconnectMessage, setDisconnectMessage] = useState('');
  const [showDisconnectAlert, setShowDisconnectAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatInput, setChatInput] = useState('');
  const chatContainerRef = useRef(null);
  const [showDiceAnimation, setShowDiceAnimation] = useState(false);
  const audioRef = useRef(new Audio(notificationSound));

  useEffect(() => {
    if (!game?.id) {
      navigate('/home');
      return;
    }

    const setupGameSubscriptions = async () => {
      try {
        await webSocketService.subscribe(`/topic/chat/${game.id}`, (message) => {
          setChatMessages(prev => [...prev, message]);

          const jwtToken = localStorage.getItem('jwtToken');
          const decodedToken = jwtDecode(jwtToken);
          const currentUsername = decodedToken.sub;

          if (!isChatOpen && message.sender !== currentUsername) {
            setUnreadCount(prev => prev + 1);
            const audio = new Audio(notificationSound);
            audio.play();
          }

          if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
          }
        });

        await webSocketService.subscribe(`/topic/game-progress/${game.id}`, (updatedGame) => {
          console.log('Received game progress update:', updatedGame);
          setGame(updatedGame);
          setIsLoading(false);
        });

        await webSocketService.subscribe(`/topic/dice-rolled/${game.id}`, (updatedGame) => {
          console.log('Received dice roll update:', updatedGame);
          setGame(updatedGame);
          setIsLoading(false);
        });

        await webSocketService.subscribe(`/topic/game/${game.id}`, (message) => {
          console.log('Received disconnect notification:', JSON.stringify(message));
          const disconnectedUser = message.disconnectedPlayer;
          setDisconnectMessage(`${disconnectedUser} has disconnected from the game!`);
          setDisconnectDialog(true);
          setShowDisconnectAlert(true);
        });

        const jwtToken = localStorage.getItem('jwtToken');
        const response = await fetch(`http://localhost:8080/api/game/${game.id}`, {
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
          },
        });
        
        if (response.ok) {
          const currentGame = await response.json();
          console.log('Initial game state:', currentGame);
          setGame(currentGame);
          setIsLoading(false);
        }

      } catch (error) {
        console.error('Failed to setup game:', error);
        setError('Failed to setup game. Please try again.');
        setIsLoading(false);
      }
    };

    setupGameSubscriptions();

    return () => {
      audioRef.current.pause();
      audioRef.current.src = '';
      webSocketService.unsubscribe(`/topic/game-progress/${game.id}`);
      webSocketService.unsubscribe(`/topic/dice-rolled/${game.id}`);
      webSocketService.unsubscribe(`/topic/game/${game.id}`);
      webSocketService.unsubscribe(`/topic/chat/${game.id}`);
    };
  }, [game?.id, navigate, isChatOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const jwtToken = localStorage.getItem('jwtToken');
    const decodedToken = jwtDecode(jwtToken);
    const username = decodedToken.sub;
    try {
      await webSocketService.send(`/app/chat/${game.id}`, {
        gameId: game.id,
        sender: username,
        content: chatInput,
        timestamp: new Date().toISOString()
      });
      setChatInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen) {
      setUnreadCount(0); 
    }
  };

  const handleSubmitAnswer = async (answer) => {
    if (!answer.trim()) {
      setError('Answer cannot be empty');
      return;
    }

    try {
      const jwtToken = localStorage.getItem('jwtToken');
      const decodedToken = jwtDecode(jwtToken);
      const username = decodedToken.sub;

      const response = await fetch('http://localhost:8080/api/game/gameplay', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: '',
          gameId: game.id,
          userAnswer: answer,
          questionId: game.currentQuestion?.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }

      const updatedGame = await response.json();
      setGame(updatedGame);
      setUserAnswer('');
      setError(null);
      setShowDiceAnimation(true);
    } catch (error) {
      console.error('Error submitting answer:', error);
      setError('Wrong answer! Try again.');
    }
  };

  const renderGameContent = () => {
    if (isLoading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      );
    }

    if (!game.currentQuestion) {
      return (
        <Typography align="center" color="textSecondary">
          Waiting for question...
        </Typography>
      );
    }

    return (
      <>
        <Typography variant="h6" gutterBottom>Current Question</Typography>
        <Typography>Letter: {game.currentLetter}</Typography>
        <Typography>Question: {game.currentQuestion.text}</Typography>
        <Typography>Points: {game.currentQuestion.points}</Typography>
        <Typography>Difficulty Level: {game.currentDice}</Typography>
        
        <Box mt={3}>
          <TextField
            fullWidth
            variant="outlined"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Type your answer here"
            sx={{ mt: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleSubmitAnswer(userAnswer)}
            sx={{ mt: 2, backgroundColor: '#726eff' }}
          >
            Submit Answer
          </Button>
        </Box>
      </>
    );
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: '#f0f2f5',
      backgroundImage: 'linear-gradient(135deg, #f0f2f5 0%, #e0e7ff 100%)',
      position: 'relative',
      p: 4 
    }}>
      <Navi />
      
      <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4 }}>
        <Typography variant="h4" align="center" sx={{ 
          mb: 4,
          color: '#333',
          fontWeight: 600,
          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          Game #{game.id}
        </Typography>

        <Box sx={{ 
          display: 'flex', 
          gap: 3,
          flexDirection: { xs: 'column', md: 'row' }
        }}>
          {/* Score Cards */}
          <Card sx={{ 
            flex: 1,
            bgcolor: 'white',
            borderRadius: 3,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            overflow: 'hidden'
          }}>
            <Box sx={{
              bgcolor: '#726eff',
              py: 2,
              px: 3,
              color: 'white'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Score Board
              </Typography>
            </Box>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{
                  p: 2,
                  bgcolor: '#f8f9fa',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}>
                  <Box sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: '#726eff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 600
                  }}>
                    P1
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {game.firstUser?.username}
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#726eff', fontWeight: 600 }}>
                      {game.firstUserPoints || 0} points
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{
                  p: 2,
                  bgcolor: '#f8f9fa',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}>
                  <Box sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: '#ff7043',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 600
                  }}>
                    P2
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {game.secondUser?.username}
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#ff7043', fontWeight: 600 }}>
                      {game.secondUserPoints || 0} points
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Game Content */}
          <Card sx={{ 
            flex: 2,
            bgcolor: 'white',
            borderRadius: 3,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            overflow: 'hidden'
          }}>
            <Box sx={{
              bgcolor: '#726eff',
              py: 2,
              px: 3,
              color: 'white'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {game.gameStatusEnum === 'FINISHED' ? 'Game Over' : 'Current Round'}
              </Typography>
            </Box>
            <CardContent sx={{ p: 4 }}>
              {game.gameStatusEnum === 'FINISHED' ? (
                <Box sx={{
                  textAlign: 'center',
                  py: 4
                }}>
                  <Typography variant="h4" sx={{ color: '#726eff', fontWeight: 600, mb: 2 }}>
                    🎉 Game Over! 🎉
                  </Typography>
                  <Typography variant="h5" sx={{ color: '#333' }}>
                    Winner: {game.winner?.username}
                  </Typography>
                </Box>
              ) : (
                isLoading ? (
                  <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                    <CircularProgress sx={{ color: '#726eff' }} />
                  </Box>
                ) : !game.currentQuestion ? (
                  <Typography align="center" sx={{ color: '#666', py: 4 }}>
                    Waiting for question...
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box sx={{
                      display: 'flex',
                      gap: 2,
                      flexWrap: 'wrap'
                    }}>
                      <Box sx={{
                        px: 2,
                        py: 1,
                        bgcolor: '#f0f2f5',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <Typography sx={{ color: '#666' }}>Letter:</Typography>
                        <Typography sx={{ fontWeight: 600, color: '#726eff' }}>
                          {game.currentLetter}
                        </Typography>
                      </Box>
                      <Box sx={{
                        px: 2,
                        py: 1,
                        bgcolor: '#f0f2f5',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <Typography sx={{ color: '#666' }}>Points:</Typography>
                        <Typography sx={{ fontWeight: 600, color: '#726eff' }}>
                          {game.currentQuestion.points}
                        </Typography>
                      </Box>
                      <Box sx={{
                        px: 2,
                        py: 1,
                        bgcolor: '#f0f2f5',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <Typography sx={{ color: '#666' }}>Difficulty:</Typography>
                        <Typography sx={{ fontWeight: 600, color: '#726eff' }}>
                          Level {game.currentDice}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{
                      p: 3,
                      bgcolor: '#f8f9fa',
                      borderRadius: 2,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}>
                      <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
                        {game.currentQuestion.text}
                      </Typography>
                      <TextField
                        fullWidth
                        variant="outlined"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Type your answer here"
                        sx={{
                          mt: 2,
                          '& .MuiOutlinedInput-root': {
                            bgcolor: 'white'
                          }
                        }}
                      />
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => handleSubmitAnswer(userAnswer)}
                        sx={{
                          mt: 2,
                          bgcolor: '#726eff',
                          height: 48,
                          '&:hover': {
                            bgcolor: '#5b57cc'
                          }
                        }}
                      >
                        Submit Answer
                      </Button>
                    </Box>
                  </Box>
                )
              )}
            </CardContent>
          </Card>
        </Box>

        {showDiceAnimation && (
          <Box
            sx={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1100,
              bgcolor: 'rgba(0,0,0,0.5)',
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Dice
              finalValue={game.currentDice}
              onAnimationComplete={() => setShowDiceAnimation(false)}
            />
          </Box>
        )}

        {error && (
          <Alert 
            severity="error" 
            onClose={() => setError(null)}
            sx={{
              mt: 3,
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}
          >
            {error}
          </Alert>
        )}

        <Dialog 
          open={disconnectDialog} 
          onClose={() => setDisconnectDialog(false)}
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
            }
          }}
        >
          <DialogTitle sx={{ 
            bgcolor: '#ffebee',
            color: '#d32f2f',
            fontWeight: 600
          }}>
            Player Disconnected
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Typography>{disconnectMessage}</Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button 
              onClick={() => {
                setDisconnectDialog(false);
                navigate('/home');
              }}
              variant="contained"
              sx={{
                bgcolor: '#d32f2f',
                '&:hover': {
                  bgcolor: '#b71c1c'
                }
              }}
            >
              Return to Home
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

      {!isChatOpen && (
        <Box
          onClick={toggleChat}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: '#726eff',
            color: 'white',
            py: 1.5,
            px: 3,
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              bgcolor: '#5b57cc'
            }
          }}
        >
          <Badge 
            variant='dot'
            invisible={unreadCount === 0} 
            color="warning"
            sx={{
              '& .MuiBadge-badge': {
                bgcolor: '#ff9800',
                color: 'white'
              }
            }}
          >
            <ChatIcon />
          </Badge>
          <Typography variant="button" sx={{ fontWeight: 600 }}>
            Chat
          </Typography>
        </Box>
      )}

      {/* Chat Window */}
      {isChatOpen && (
        <Box sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: '300px',
          height: '400px',
          bgcolor: 'white',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 1000,
          animation: 'slideUp 0.3s ease-out',
          '@keyframes slideUp': {
            from: {
              transform: 'translateY(100%)',
              opacity: 0
            },
            to: {
              transform: 'translateY(0)',
              opacity: 1
            }
          }
        }}>
          
        </Box>
      )}

      {isChatOpen && (
        <Box sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: '300px',
          height: '400px',
          bgcolor: 'white',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 1000
        }}>
          <Box sx={{
            bgcolor: '#726eff',
            py: 2,
            px: 3,
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Game Chat
            </Typography>
            <IconButton 
              size="small" 
              onClick={toggleChat}
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Messages Container */}
          <Box
            ref={chatContainerRef}
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              bgcolor: '#f8f9fa'
            }}
          >
            {chatMessages.map((msg, index) => {
              const jwtToken = localStorage.getItem('jwtToken');
              const decodedToken = jwtDecode(jwtToken);
              const username = decodedToken.sub;
              const isOwnMessage = msg.sender === username;

              return (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isOwnMessage ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    alignSelf: isOwnMessage ? 'flex-end' : 'flex-start'
                  }}
                >
                  <Box sx={{
                    bgcolor: isOwnMessage ? '#726eff' : '#f0f2f5',
                    color: 'black',
                    py: 1,
                    px: 2,
                    borderRadius: 2,
                    maxWidth: '100%',
                    wordBreak: 'break-word'
                  }}>
                    <Typography variant="body2" color='black'>
                      {msg.content}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ mt: 0.5, color: '#666' }}>
                    {isOwnMessage ? 'You' : msg.sender} • {msg.timestamp}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          {/* Message Input */}
          <Box
            component="form"
            onSubmit={handleSendMessage}
            sx={{
              p: 2,
              borderTop: '1px solid #eee',
              display: 'flex',
              gap: 1
            }}
          >
            <TextField
              size="small"
              fullWidth
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type a message..."
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={!chatInput.trim()}
              sx={{
                minWidth: 'unset',
                px: 3,
                bgcolor: '#726eff',
                borderRadius: 2,
                '&:hover': {
                  bgcolor: '#5b57cc'
                }
              }}
            >
              Send
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Game;
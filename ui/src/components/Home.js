import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { webSocketService } from './websocket';
import Navi from './NavigationBar';
import {
  Container,
  Button,
  TextField,
  Box,
  Typography,
  Autocomplete,
  Grid,
  CardContent,
  Card,
  Divider,
  Dialog,
  DialogTitle, 
  DialogContent, 
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const Home = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [friendGameId, setFriendGameId] = useState('');
  const [userList, setUserList] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showGameResult, setShowGameResult] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const [friendUsername, setFriendUsername] = useState('');
  const [friendRequests, setFriendRequests] = useState([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  useEffect(() => {

    if (location.state?.gameResult) {
      setGameResult(location.state.gameResult);
      setShowGameResult(true);

      window.history.replaceState({}, document.title);
    }

    const initializeWebSocket = async () => {
      try {
        await webSocketService.connect();
      } catch (error) {
        console.error('Failed to initialize WebSocket:', error);
      }
    };

    const fetchUsers = async () => {
      const jwtToken = localStorage.getItem('jwtToken');
      try {
        const response = await axios.get('http://localhost:8080/api/user/getAllUsers', {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            'Content-Type': 'application/json',
          },
        });
        const users = response.data;
        setUserList(users);
        setFilteredUsers(users);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    initializeWebSocket();
    fetchUsers();
    fetchFriendRequests();
  }, [location]);

  const fetchFriendRequests = async () => {
    const jwtToken = localStorage.getItem('jwtToken');
    const response = await axios.get('http://localhost:8080/api/user/friend-requests', {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        'Content-Type': 'application/json',
      }
    }); 

    if (Array.isArray(response.data)) {
      const unacceptedRequests = response.data.filter(request => !request.accepted);
      setFriendRequests(unacceptedRequests);
    } else {
        console.error("Expected an array but received:", response.data);
        setFriendRequests([]); 
    }
  };

  const handleSearchChange = (inputValue) => {
    const filtered = userList.filter((user) =>
      user.username.toLowerCase().includes(inputValue.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const sendFriendRequest = async () => {
    const jwtToken = localStorage.getItem('jwtToken');
    try {
      await axios.post('http://localhost:8080/api/user/friend-requests/send', 
      { username: friendUsername }, 
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        }
      },);
      setDialogMessage(`Friend request sent to ${friendUsername}`);
      setDialogOpen(true);
      setFriendUsername(''); 
    } catch (error) {
      setDialogMessage(`Failed to send friend request: ${error.message}`);
      setDialogOpen(true);
    }
  };

  const acceptFriendRequest = async (requestId) => {
    const jwtToken = localStorage.getItem('jwtToken');
    await axios.post(`http://localhost:8080/api/user/friend-requests/accept/${requestId}`,
      {}, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        'Content-Type': 'application/json',
      }
    });
    fetchFriendRequests(); 
  };

  const denyFriendRequest = async (requestId) => {
    const jwtToken = localStorage.getItem('jwtToken');
    await axios.delete(`http://localhost:8080/api/user/friend-requests/deny/${requestId}`, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        'Content-Type': 'application/json',
      }
    });
    fetchFriendRequests(); 
  };

  const addFriend = async () => {
    const jwtToken = localStorage.getItem('jwtToken');
    if (selectedUser) {
      const username = selectedUser.username;
      try {
        await axios.post(
          'http://localhost:8080/api/user/addFriend',
          { username },
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
        setDialogMessage(`Friend request sent to ${selectedUser.username}`);
        setDialogOpen(true);
      } catch (error) {
        console.error('Error adding friend:', error);
        setDialogMessage(`Failed to send friend request: ${error.response?.data?.message || error.message}`);
        setDialogOpen(true);
      }
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setDialogMessage('');
  };

  const createGame = async () => {
    const jwtToken = localStorage.getItem('jwtToken');
    
    try {
      await webSocketService.connect();
      const sessionId = webSocketService.getSessionId();
      
      if (!sessionId) {
        console.error('No WebSocket session ID available');
        return;
      }
      
      const response = await axios.post(
        'http://localhost:8080/api/game/create',
        { sessionId },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      const game = response.data;
      navigate('/lobby', { state: { game }, replace: true });
    } catch (error) {
      console.error('Error creating game:', error);
    }
  };

  const joinRandomGame = async () => {
    const jwtToken = localStorage.getItem('jwtToken');
    try {
      await webSocketService.connect();
      const sessionId = webSocketService.getSessionId();
      
      if (!sessionId) {
        console.error('No WebSocket session available');
        return;
      }

      const response = await axios.post(
        'http://localhost:8080/api/game/connect/random',
        { sessionId },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      const game = response.data;
      navigate('/lobby', { state: { game }, replace: true });
    } catch (error) {
      console.error('Error joining random game:', error);
    }
  };

  const joinFriendsGame = async () => {
    const jwtToken = localStorage.getItem('jwtToken');
    try {
      await webSocketService.connect();
      const sessionId = webSocketService.getSessionId();
      
      const response = await axios.post(
        'http://localhost:8080/api/game/connect',
        { username: '', gameId: friendGameId, sessionId: sessionId },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      const game = response.data;
      navigate('/lobby', { state: { game }, replace: true });
    } catch (error) {
      console.error('Error joining friend\'s game:', error);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: '#f0f2f5',
      backgroundImage: 'linear-gradient(135deg, #f0f2f5 0%, #e0e7ff 100%)'
    }}>
      <Navi onLogout={onLogout}/>
      <br />
      <Dialog 
        open={showGameResult} 
        onClose={() => setShowGameResult(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#726eff', color: 'white' }}>
          Game Finished!
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {gameResult && (
            <>
              <Typography variant="h6" gutterBottom>
                Winner: {gameResult.winner?.username}
              </Typography>
              <Typography>
                Final Scores:
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Typography>
                  Player 1: {gameResult.firstUserPoints} points
                </Typography>
                <Typography>
                  Player 2: {gameResult.secondUserPoints} points
                </Typography>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowGameResult(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Container maxWidth="md" sx={{ pt: 8, pb: 6 }}>
        <Box sx={{
          textAlign: 'center',
          mb: 6
        }}>
          <Typography variant="h3" sx={{
            fontWeight: 700,
            color: '#1a237e',
            mb: 2,
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
          }}>
            Welcome to AliPetek
          </Typography>
          <Typography variant="h6" sx={{
            color: '#666',
            mb: 4
          }}>
            Challenge your friends or join random matches!
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 3,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)'
              }
            }}>
              <Box sx={{
                bgcolor: '#726eff',
                py: 2,
                px: 3,
                color: 'white',
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12
              }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Create New Game
                </Typography>
              </Box>
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2, p: 3 }}>
                <Typography variant="body1" sx={{ color: '#666', mb: 2 }}>
                  Start a new game and invite your friends to join!
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={createGame}
                  sx={{
                    bgcolor: '#726eff',
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: '#5b57cc'
                    }
                  }}
                >
                  Create Game
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 3,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)'
              }
            }}>
              <Box sx={{
                bgcolor: '#ff7043',
                py: 2,
                px: 3,
                color: 'white',
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12
              }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Join Game
                </Typography>
              </Box>
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2, p: 3 }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={joinRandomGame}
                  sx={{
                    bgcolor: '#ff7043',
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: '#f4511e'
                    }
                  }}
                >
                  Join Random Game
                </Button>

                <Box sx={{ position: 'relative' }}>
                  <Divider>
                    <Typography variant="body2" sx={{ color: '#666', px: 2 }}>
                      or
                    </Typography>
                  </Divider>
                </Box>

                <Box sx={{
                  display: 'flex',
                  gap: 2,
                  alignItems: 'flex-start'
                }}>
                  <TextField
                    label="Friend's Game ID"
                    variant="outlined"
                    value={friendGameId}
                    onChange={(e) => setFriendGameId(e.target.value)}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: 'white'
                      }
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={joinFriendsGame}
                    sx={{
                      bgcolor: '#ff7043',
                      height: 56,
                      minWidth: 120,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        bgcolor: '#f4511e'
                      }
                    }}
                  >
                    Join
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card sx={{
              borderRadius: 3,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)'
              }
            }}>
              <Box sx={{
                bgcolor: '#4caf50',
                py: 2,
                px: 3,
                color: 'white',
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12
              }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Add Friends
                </Typography>
              </Box>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  
                <TextField
                  label="Friend Username"
                  value={friendUsername}
                  onChange={(e) => setFriendUsername(e.target.value)}
                />
                <Button onClick={sendFriendRequest} variant="contained" color="primary">
                  Send Request
                </Button>

                <Typography variant="h5">Friend Requests</Typography>
                <List>
                {friendRequests.length === 0 ? (
                  <ListItem>
                    <ListItemText primary="No friend requests available." />
                  </ListItem>
                ) : (
                  friendRequests.map((request) => (
                    <ListItem key={request.id}>
                      <ListItemText primary={`Request from ${request.sender.username}`} />
                      <Button onClick={() => acceptFriendRequest(request.id)} color="primary">
                        Accept
                      </Button>
                      <Button onClick={() => denyFriendRequest(request.id)} color="secondary">
                        Deny
                      </Button>
                    </ListItem>
                  ))
                )}
                </List>

                {/* Dialog for notifications */}
                <Dialog open={dialogOpen} onClose={handleDialogClose}>
                  <DialogTitle>Notification</DialogTitle>
                  <DialogContent>
                    <Typography>{dialogMessage}</Typography>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleDialogClose} color="primary">Close</Button>
                  </DialogActions>
                </Dialog>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Home;
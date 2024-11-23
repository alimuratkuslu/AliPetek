import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navi from './NavigationBar';
import { webSocketService } from './websocket';
import { Box, Typography, Card, CardContent, CircularProgress, Grid } from '@mui/material';

const COUNTDOWN_SECONDS = 5;

const Lobby = ({ onLogout }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const initialGame = location.state?.game;
    const [game, setGame] = useState(initialGame);
    const [timer, setTimer] = useState(COUNTDOWN_SECONDS);
    const countdownIntervalRef = useRef(null);
    const navigationTriggeredRef = useRef(false);
    const mounted = useRef(true);

    useEffect(() => {
        mounted.current = true;
        navigationTriggeredRef.current = false;

        if (!initialGame?.id) {
            navigate('/home');
            return;
        }

        const startCountdown = (startTime) => {
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
                countdownIntervalRef.current = null;
            }

            console.log('Starting countdown with startTime:', startTime);
            
            let remainingTime;
            if (startTime) {
                const now = Date.now();
                remainingTime = Math.ceil((startTime - now) / 1000);
                console.log('Calculated remaining time:', remainingTime);
            } else {
                remainingTime = COUNTDOWN_SECONDS;
            }

            remainingTime = Math.max(remainingTime, 1);
            setTimer(remainingTime);
            
            countdownIntervalRef.current = setInterval(() => {
                setTimer(prev => {
                    const newValue = prev - 1;
                    if (newValue <= 0) {
                        clearInterval(countdownIntervalRef.current);
                        countdownIntervalRef.current = null;
                        if (mounted.current && !navigationTriggeredRef.current) {
                            console.log('Countdown finished, navigating to game');
                            navigationTriggeredRef.current = true;
                            navigate('/game', { state: { game }, replace: true });
                        }
                        return 0;
                    }
                    return newValue;
                });
            }, 1000);
        };

        const setupGameSubscription = async () => {
            try {
                await webSocketService.connect();

                console.log('Setting up subscription for game:', initialGame.id);
                await webSocketService.subscribe(
                    `/topic/game-progress/${initialGame.id}`,
                    (update) => {
                        console.log('Received game update:', update);
                        if (!mounted.current || navigationTriggeredRef.current) return;

                        const updatedGame = update.game || update;
                        console.log('Processing game update:', updatedGame);
                        setGame(updatedGame);

                        if (updatedGame.gameStatusEnum === 'IN_PROGRESS') {
                            console.log('Game is in progress, starting countdown');
                            const startTimestamp = update.startTimestamp;
                            startCountdown(startTimestamp);
                        }
                    }
                );

                const jwtToken = localStorage.getItem('jwtToken');
                const response = await fetch(`http://localhost:8080/api/game/${initialGame.id}`, {
                    headers: {
                        'Authorization': `Bearer ${jwtToken}`,
                    },
                });
                
                if (response.ok) {
                    const currentGame = await response.json();
                    console.log('Fetched initial game state:', currentGame);
                    setGame(currentGame);

                    if (currentGame.gameStatusEnum === 'IN_PROGRESS') {
                        startCountdown();
                    }
                }
            } catch (error) {
                console.error('Failed to setup game subscription:', error);
                if (mounted.current) {
                    navigate('/home');
                }
            }
        };

        setupGameSubscription();

        return () => {
            console.log('Cleaning up Lobby component');
            mounted.current = false;
            
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
                countdownIntervalRef.current = null;
            }

            if (!navigationTriggeredRef.current && initialGame?.id) {
                webSocketService.unsubscribe(`/topic/game-progress/${initialGame.id}`);
            }
        };
    }, [initialGame?.id, navigate]);

    if (!game) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: '100vh', 
            bgcolor: '#f0f2f5',
            backgroundImage: 'linear-gradient(135deg, #f0f2f5 0%, #e0e7ff 100%)'
        }}>
            <Navi onLogout={onLogout}/>
            <Box sx={{ 
                flexGrow: 1, 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                p: 3 
            }}>
                <Card sx={{ 
                    minWidth: 350,
                    maxWidth: 600,
                    width: '100%',
                    bgcolor: 'white',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    borderRadius: 3,
                    overflow: 'hidden'
                }}>
                    <Box sx={{
                        bgcolor: '#726eff',
                        py: 2,
                        px: 3,
                        color: 'white',
                        textAlign: 'center'
                    }}>
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                            Game Lobby
                        </Typography>
                    </Box>
                    <CardContent sx={{ p: 4 }}>
                        <Grid container spacing={3} direction="column" alignItems="center">
                            <Grid item container justifyContent="center" spacing={2}>
                                <Grid item xs={12}>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 1,
                                        mb: 2
                                    }}>
                                        <Typography variant="body1" sx={{ color: '#666' }}>
                                            Game ID:
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                            {game.id}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12}>
                                    <Box sx={{
                                        p: 2,
                                        bgcolor: '#f8f9fa',
                                        borderRadius: 2,
                                        textAlign: 'center'
                                    }}>
                                        <Typography variant="body1" sx={{ color: '#666', mb: 2 }}>
                                            Game Status
                                        </Typography>
                                        <Typography variant="h6" sx={{
                                            color: game.gameStatusEnum === 'IN_PROGRESS' ? '#4caf50' : '#726eff',
                                            fontWeight: 600
                                        }}>
                                            {game.gameStatusEnum === 'IN_PROGRESS' ? 'Starting Soon' : 'Waiting for Players'}
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                            
                            <Grid item xs={12} sx={{ width: '100%' }}>
                                <Box sx={{
                                    mt: 2,
                                    p: 3,
                                    bgcolor: '#f8f9fa',
                                    borderRadius: 2,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                                }}>
                                    <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 600 }}>
                                        Players
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2,
                                            p: 2,
                                            bgcolor: 'white',
                                            borderRadius: 1,
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
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
                                            <Typography>
                                                {game.firstUser?.username || 'Waiting...'}
                                            </Typography>
                                        </Box>
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2,
                                            p: 2,
                                            bgcolor: 'white',
                                            borderRadius: 1,
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
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
                                            <Typography>
                                                {game.secondUser?.username || 'Waiting...'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </Grid>
                            
                            {game.gameStatusEnum === 'IN_PROGRESS' && (
                                <Grid item>
                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: 2,
                                        mt: 2
                                    }}>
                                        <CircularProgress 
                                            variant="determinate" 
                                            value={(timer / COUNTDOWN_SECONDS) * 100}
                                            size={60}
                                            thickness={4}
                                            sx={{ color: '#726eff' }}
                                        />
                                        <Typography variant="h6" sx={{ color: '#726eff', fontWeight: 600 }}>
                                            Game starting in {timer} seconds
                                        </Typography>
                                    </Box>
                                </Grid>
                            )}
                        </Grid>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
};

export default Lobby;
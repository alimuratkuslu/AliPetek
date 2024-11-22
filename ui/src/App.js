import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { webSocketService } from './components/websocket';
import Auth from './components/Auth';
import Home from './components/Home';
import Profile from './components/Profile';
import Leaderboard from './components/Leaderboard';
import Lobby from './components/Lobby';
import Game from './components/Game';
import QuestionRecommend from './components/QuestionRecommend';
import UserMap from './components/UserMap';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import './App.css';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('jwtToken');
        if (token) {
            // TODO: Verify token with backend api call
            setIsAuthenticated(true);
            connectWebSocket();
        }
    }, []);

    const connectWebSocket = async () => {
        if (!isConnecting && !webSocketService.isConnected()) {
            setIsConnecting(true);
            try {
                await webSocketService.connect();
                console.log('WebSocket connected with session:', webSocketService.getSessionId());
            } catch (error) {
                console.error('Failed to connect to WebSocket:', error);
            } finally {
                setIsConnecting(false);
            }
        }
    };

    const handleLogin = () => {
        setIsAuthenticated(true);
        connectWebSocket();
    };

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('jwtToken');
            localStorage.setItem('jwtToken', token);
            const decodedToken = jwtDecode(token);
            const username = decodedToken.sub;
            if (username) {
                await axios.post(`/api/locations/offline/${username}`);
            }
        } catch (error) {
            console.error('Error updating offline status:', error);
        } finally {
            localStorage.removeItem('jwtToken');
            localStorage.removeItem('username');
            setIsAuthenticated(false);
            webSocketService.disconnect();
        }
    };

     return (
        <Router>
                <Routes>
                <Route path="/" element={<div className="auth-container-wrapper"><Auth onLogin={handleLogin} /></div>} />
                    {isAuthenticated ? (
                        <>
                            <Route path="/home" element={<div className="full-screen"><Home /></div>} />
                            <Route path="/profile" element={<div className="full-screen"><Profile /></div>} />
                            <Route path="/leaderboard" element={<div className="full-screen"><Leaderboard /></div>} />
                            <Route path="/lobby" element={<div className="full-screen"><Lobby /></div>} />
                            <Route path="/game" element={<div className="full-screen"><Game /></div>} />
                            <Route path="/recommend-question" element={<div className="full-screen"><QuestionRecommend /></div>} />
                            <Route path="/map" element={<div className="full-screen"><UserMap /></div>} />
                        </>
                    ) : (
                        <Route path="*" element={<Navigate to="/" replace />} />
                    )}
                </Routes>
        </Router>
    );
}

export default App;
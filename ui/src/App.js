import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate, Outlet } from 'react-router-dom';
import { webSocketService } from './components/websocket';
import NavigationBar from './components/NavigationBar';
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

const Layout = ({ onLogout, children }) => {
    return (
        <>
            <NavigationBar onLogout={onLogout} />
            {children}
        </>
    );
};

const ProtectedRoute = ({ children, onLogout }) => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        return <Navigate to="/" replace />;
    }
    
    const childrenWithProps = React.Children.map(children, child => {
        if (React.isValidElement(child)) {
            return React.cloneElement(child, { onLogout });
        }
        return child;
    });
    
    return <Layout onLogout={onLogout}>{childrenWithProps}</Layout>;
};

const AppContent = () => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('jwtToken');
            if (token) {
                try {
                    const decodedToken = jwtDecode(token);
                    const currentTime = Date.now() / 1000;
                    
                    if (decodedToken.exp > currentTime) {
                        setIsAuthenticated(true);
                        await connectWebSocket();
                    } else {
                        handleLogout();
                    }
                } catch (error) {
                    console.error('Token verification failed:', error);
                    handleLogout();
                }
            }
            setLoading(false);
        };
        
        checkAuth();
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

    const handleLogout = useCallback(async () => {
        try {
            const token = localStorage.getItem('jwtToken');
            if (!token) {
                return;
            }
            const decodedToken = jwtDecode(token);
            const username = decodedToken.sub;
            if (username) {
                await axios.post(`/api/locations/offline/${username}`,
                {},
                {
                    headers: {
                      Authorization: `Bearer ${token}`,
                      'Content-Type': 'application/json',
                    },
                });
            }
        } catch (error) {
            console.error('Error updating offline status:', error);
        } finally {
            localStorage.removeItem('jwtToken');
            localStorage.removeItem('username');
            setIsAuthenticated(false);
            webSocketService.disconnect();
            navigate('/', { replace: true });
        }
    });

    if (loading) {
        return <div>Loading...</div>; 
    }

    return (
        <Routes>
            <Route 
                path="/" 
                element={
                    isAuthenticated ? 
                    <Navigate to="/home" replace /> : 
                    <div className="auth-container-wrapper">
                        <Auth onLogin={handleLogin} />
                    </div>
                } 
            />
            
            <Route
                path="/home"
                element={
                    <ProtectedRoute onLogout={handleLogout}>
                        <div className="full-screen">
                            <Home onLogout={handleLogout} />
                        </div>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/profile"
                element={
                    <ProtectedRoute onLogout={handleLogout}>
                        <div className="full-screen">
                            <Profile onLogout={handleLogout} />
                        </div>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/leaderboard"
                element={
                    <ProtectedRoute onLogout={handleLogout}>
                        <div className="full-screen">
                            <Leaderboard onLogout={handleLogout} />
                        </div>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/lobby"
                element={
                    <ProtectedRoute onLogout={handleLogout}>
                        <div className="full-screen">
                            <Lobby onLogout={handleLogout} />
                        </div>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/game"
                element={
                    <ProtectedRoute onLogout={handleLogout}>
                        <div className="full-screen">
                            <Game onLogout={handleLogout} />
                        </div>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/recommend-question"
                element={
                    <ProtectedRoute onLogout={handleLogout}>
                        <div className="full-screen">
                            <QuestionRecommend onLogout={handleLogout} />
                        </div>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/map"
                element={
                    <ProtectedRoute onLogout={handleLogout}>
                        <div className="full-screen">
                            <UserMap onLogout={handleLogout} />
                        </div>
                    </ProtectedRoute>
                }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;
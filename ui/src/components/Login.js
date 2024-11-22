import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { GoogleLogin } from '@react-oauth/google';
import { 
    Container, 
    Box, 
    TextField, 
    Button, 
    Typography, 
    Paper,
    Alert,
    IconButton,
    CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const StyledPaper = styled(Paper)(({ theme }) => ({
    marginTop: theme.spacing(8),
    padding: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    maxWidth: '400px',
    margin: 'auto'
}));

const GoogleLoginWrapper = styled(Box)({
    position: 'absolute',
    top: 16,
    right: 16,
});

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [alertSeverity, setAlertSeverity] = useState('success');
    const navigate = useNavigate();

    const updateUserLocation = async (username) => {
        if (navigator.geolocation) {
            try {
                const jwtToken = localStorage.getItem('jwtToken');
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject);
                });

                await axios.post('/api/locations/update', {
                    username,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                },
                {
                    headers: {
                        Authorization: `Bearer ${jwtToken}`,
                    },
                });
            } catch (error) {
                console.error('Error updating location:', error);
            }
        }
    };

    const handleLogin = async () => {
        setIsLoading(true);
        setError('');
        setMessage('');
        setAlertSeverity('success');
        try {
            const response = await axios.post('/auth/login', {
                username,
                password,
            });
            setMessage('Login successful!');
            const token = response.data.token;
            localStorage.setItem('jwtToken', token);
            setMessage('Login successful!');
            setAlertSeverity('success');

            await updateUserLocation(username);
            onLogin();
            navigate('/home');
        } catch (error) {
            if (error.response) {
                console.error('Server error:', {
                    status: error.response.status,
                    data: error.response.data
                });
                
                const errorMessage = error.response.data.message || 'Invalid username or password';
                setError(errorMessage);
            } else if (error.request) {
                setError('Unable to reach the server. Please check your connection.');
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
            setAlertSeverity('error');
        } finally {
            setIsLoading(false);
        }
    };

    const responseMessage = async (credentialResponse) => {
        console.log("response:", credentialResponse.credential);
        try {
            const response = await axios.post('/auth/google/login', {
                credential: credentialResponse.credential
            });

            setMessage('Login successful!');
            setError('');
            const token = response.data.token;
            localStorage.setItem('jwtToken', token);

            const { username } = response.data;
            await updateUserLocation(username);

            setMessage('Login successful!');
            setAlertSeverity('success');
            
            onLogin();
            navigate('/home');
        } catch (error) {
            if (error.response) {
                console.error('Server error:', {
                    status: error.response.status,
                    data: error.response.data
                });
                setError('Google login failed: ' + (error.response.data.message || 'Unknown error'));
            } else if (error.request) {
                setError('Unable to reach the server. Please check your connection.');
            } else {
                setError('An unexpected error occurred during Google login.');
            }
            setAlertSeverity('error');
        } finally {
            setIsLoading(false);
        }
    };
    const errorMessage = (error) => {
        setError('Google login failed. Please try again.');
        setAlertSeverity('error');
    };

    const isFormValid = username && password;

    return (
        <Container component="main">
            <StyledPaper elevation={3}>
                <GoogleLoginWrapper>
                    <GoogleLogin 
                        onSuccess={responseMessage} 
                        onError={errorMessage}
                        size="medium"
                    />
                </GoogleLoginWrapper>
                
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%',
                    }}
                >
                    <IconButton
                        sx={{
                            bgcolor: 'primary.main',
                            color: 'white',
                            '&:hover': {
                                bgcolor: 'primary.dark',
                            },
                            mb: 2,
                        }}
                    >
                        <LockOutlinedIcon />
                    </IconButton>
                    
                    <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
                        Sign In
                    </Typography>

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        variant="outlined"
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        variant="outlined"
                        sx={{ mb: 3 }}
                    />

                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handleLogin}
                        disabled={!isFormValid}
                        sx={{ 
                            mb: 2,
                            height: '48px',
                            textTransform: 'none',
                            fontSize: '1rem'
                        }}
                    >
                        {isLoading ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            'Sign In'
                        )}
                    </Button>

                    {(message || error) && (
                        <Alert 
                            severity={alertSeverity}
                            sx={{ 
                                width: '100%', 
                                mb: 2,
                                '& .MuiAlert-message': {
                                    width: '100%',
                                    wordBreak: 'break-word'
                                }
                            }}
                        >
                            {message || error}
                        </Alert>
                    )}
                </Box>
            </StyledPaper>
        </Container>
    );
};

export default Login;
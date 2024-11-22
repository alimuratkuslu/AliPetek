import React, { useState } from 'react';
import axios from 'axios';
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
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';

const StyledPaper = styled(Paper)(({ theme }) => ({
    marginTop: theme.spacing(8),
    padding: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: '400px',
    margin: 'auto'
}));

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [showVerificationForm, setShowVerificationForm] = useState(false);

    const handleSignUp = async () => {
        setIsLoading(true);
        try {
            const response = await axios.post('/auth/signup', {
                username,
                email,
                password,
            });
            setMessage('Verification email sent. Please check your inbox.');
            setShowVerificationForm(true); 
        } catch (error) {
            setMessage('Error during signup: ' + error.response.data.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async () => {
        try {
            await axios.post('/auth/verify', {
                email,
                verificationCode,
            });
            setIsVerified(true);
            setMessage('Account verified successfully!');
        } catch (error) {
            setMessage('Verification failed: ' + error.response.data.message);
        }
    };

    const isFormValid = username && email && password;

    return (
        <Container component="main">
            <StyledPaper elevation={3}>
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
                        {showVerificationForm ? <VerifiedUserOutlinedIcon /> : <PersonAddOutlinedIcon />}
                    </IconButton>

                    <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
                        {showVerificationForm ? 'Verify Account' : 'Sign Up'}
                    </Typography>

                    {!showVerificationForm ? (
                        <>
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
                                label="Email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                                onClick={handleSignUp}
                                disabled={!isFormValid || isLoading}
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
                                    'Sign Up'
                                )}
                            </Button>
                        </>
                    ) : (
                        <Box sx={{ width: '100%' }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Verification Code"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                variant="outlined"
                                sx={{ mb: 3 }}
                            />

                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleVerify}
                                disabled={!verificationCode || isLoading}
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
                                    'Verify Account'
                                )}
                            </Button>
                        </Box>
                    )}

                    {message && (
                        <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
                            {message}
                        </Alert>
                    )}
                    
                    {error && (
                        <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {isVerified && (
                        <Alert severity="success" sx={{ width: '100%' }}>
                            Your account is verified! You can now log in.
                        </Alert>
                    )}
                </Box>
            </StyledPaper>
        </Container>
    );
};

export default SignUp;
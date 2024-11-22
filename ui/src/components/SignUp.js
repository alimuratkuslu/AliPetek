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
    CircularProgress,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    LinearProgress,
    Collapse
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
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

const PasswordStrengthBar = styled(LinearProgress)(({ theme, strength }) => ({
    height: 8,
    borderRadius: 4,
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    '& .MuiLinearProgress-bar': {
        backgroundColor: 
            strength === 0 ? theme.palette.error.main :
            strength === 1 ? theme.palette.warning.main :
            strength === 2 ? theme.palette.info.main :
            theme.palette.success.main
    }
}));

const SignUp = () => {
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        verificationCode: ''
    });
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [passwordCriteria, setPasswordCriteria] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
    });
    const [verificationCode, setVerificationCode] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [alert, setAlert] = useState({
        show: false,
        message: '',
        severity: 'info'
    });
    const [errors, setErrors] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [showVerificationForm, setShowVerificationForm] = useState(false);

    const checkPasswordCriteria = (value) => {
        const criteria = {
            length: value.length >= 8,
            uppercase: /[A-Z]/.test(value),
            lowercase: /[a-z]/.test(value),
            number: /[0-9]/.test(value),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(value)
        };
        
        const strength = Object.values(criteria).filter(Boolean).length;
        return { criteria, strength: Math.min(Math.floor((strength / 5) * 3), 3) };
    };

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        const { criteria, strength } = checkPasswordCriteria(newPassword);
        
        setFormData(prev => ({
            ...prev,
            password: newPassword
        }));
        setPasswordCriteria(criteria);
        setPasswordStrength(strength);
    };

    const isPasswordValid = (password) => {
        return Object.values(checkPasswordCriteria(password).criteria).every(Boolean);
    };

    const getStrengthLabel = () => {
        if (passwordStrength === 0) return 'Weak';
        if (passwordStrength === 1) return 'Fair';
        if (passwordStrength === 2) return 'Good';
        return 'Strong';
    };

    const getStrengthColor = () => {
        if (passwordStrength === 0) return 'error.main';
        if (passwordStrength === 1) return 'warning.main';
        if (passwordStrength === 2) return 'info.main';
        return 'success.main';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setErrors(prev => ({
            ...prev,
            [name]: ''
        }));
    };

    const handleSignUp = async () => {
        setIsLoading(true);
        setErrors({
            username: '',
            email: '',
            password: ''
        });
        try {
            const response = await axios.post('/auth/signup', formData);
            console.log('Signup successful:', response.data);
            setAlert({
                show: true,
                message: 'Verification email sent. Please check your inbox.',
                severity: 'success'
            });
            setShowVerificationForm(true); 
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'An error occurred during signup';
            
            if (errorMessage.includes('Username')) {
                setErrors(prev => ({
                    ...prev,
                    username: errorMessage
                }));
                setAlert({
                    show: true,
                    message: errorMessage,
                    severity: 'error'  
                });
            } else if (errorMessage.includes('Email')) {
                setErrors(prev => ({
                    ...prev,
                    email: errorMessage
                }));
                setAlert({
                    show: true,
                    message: errorMessage,
                    severity: 'error'  
                });
            } else {
                setAlert({
                    show: true,
                    message: errorMessage,
                    severity: 'error'
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async () => {
        try {
            await axios.post('/auth/verify', {
                email: formData.email,
                verificationCode,
            });
            setIsVerified(true);
            setAlert({
                show: true,
                message: 'Account verified successfully!',
                severity: 'success'
            });
        } catch (error) {
            setAlert({
                show: true,
                message: error.response?.data?.message || 'Verification failed',
                severity: 'error'
            });
        }
    };

    return (
        <Container component="main">
            <StyledPaper elevation={3}>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                }}>
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

                    <Collapse in={alert.show} sx={{ width: '90%', mb: 2 }}>
                        <Alert 
                            variant="filled"
                            severity={alert.severity}
                            onClose={() => setAlert(prev => ({ ...prev, show: false }))}
                            sx={{
                                width: '100%',
                                '&.MuiAlert-filledError': {
                                    backgroundColor: '#d32f2f',
                                    color: '#fff'
                                },
                                '&.MuiAlert-filledSuccess': {
                                    backgroundColor: '#2e7d32',
                                    color: '#fff'
                                }
                            }}
                        >
                            {alert.message}
                        </Alert>
                    </Collapse>

                    {!showVerificationForm ? (
                        <>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="username"
                                label="Username"
                                value={formData.username}
                                onChange={handleChange}
                                error={!!errors.username}
                                helperText={errors.username}
                                disabled={isLoading}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="email"
                                label="Email Address"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                error={!!errors.email}
                                helperText={errors.email}
                                disabled={isLoading}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Password"
                                type="password"
                                value={formData.password}
                                onChange={handlePasswordChange}
                                variant="outlined"
                                sx={{ mb: 1 }}
                                error={formData.password.length > 0 && !isPasswordValid(formData.password)}
                                helperText={
                                    formData.password.length > 0 && !isPasswordValid(formData.password)
                                        ? "Password doesn't meet all requirements" 
                                        : ""
                                }
                            />

                            {formData.password.length > 0 && (
                                <Box sx={{ width: '100%', mb: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <PasswordStrengthBar 
                                            variant="determinate" 
                                            value={(passwordStrength / 3) * 100}
                                            strength={passwordStrength}
                                        />
                                        <Typography 
                                            variant="caption" 
                                            sx={{ 
                                                ml: 1,
                                                color: getStrengthColor(),
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {getStrengthLabel()}
                                        </Typography>
                                    </Box>

                                    <List dense sx={{ bgcolor: 'background.paper' }}>
                                        <ListItem>
                                            <ListItemIcon>
                                                {passwordCriteria.length ? 
                                                    <CheckCircleOutlineIcon color="success" /> : 
                                                    <ErrorOutlineIcon color="error" />
                                                }
                                            </ListItemIcon>
                                            <ListItemText primary="At least 8 characters" />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon>
                                                {passwordCriteria.uppercase ? 
                                                    <CheckCircleOutlineIcon color="success" /> : 
                                                    <ErrorOutlineIcon color="error" />
                                                }
                                            </ListItemIcon>
                                            <ListItemText primary="One uppercase letter" />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon>
                                                {passwordCriteria.lowercase ? 
                                                    <CheckCircleOutlineIcon color="success" /> : 
                                                    <ErrorOutlineIcon color="error" />
                                                }
                                            </ListItemIcon>
                                            <ListItemText primary="One lowercase letter" />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon>
                                                {passwordCriteria.number ? 
                                                    <CheckCircleOutlineIcon color="success" /> : 
                                                    <ErrorOutlineIcon color="error" />
                                                }
                                            </ListItemIcon>
                                            <ListItemText primary="One number" />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon>
                                                {passwordCriteria.special ? 
                                                    <CheckCircleOutlineIcon color="success" /> : 
                                                    <ErrorOutlineIcon color="error" />
                                                }
                                            </ListItemIcon>
                                            <ListItemText primary={'One special character (!@#$%^&*(),.?:{}|<>)'} />
                                        </ListItem>
                                    </List>
                                </Box>
                            )}
                            <Button
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                                onClick={handleSignUp}
                                disabled={isLoading || !formData.username || !formData.email || !formData.password}
                            >
                                {isLoading ? <CircularProgress size={24} /> : 'Sign Up'}
                            </Button>
                        </>
                    ) : (
                        <>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="verificationCode"
                                label="Verification Code"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                disabled={isLoading || isVerified}
                            />
                            <Button
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                                onClick={handleVerify}
                                disabled={isLoading || isVerified || !verificationCode}
                            >
                                {isLoading ? <CircularProgress size={24} /> : 'Verify'}
                            </Button>
                        </>
                    )}
                </Box>
            </StyledPaper>
        </Container>
    );
};

export default SignUp;
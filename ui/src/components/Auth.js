import React, { useState } from 'react';
import SignUp from './SignUp';
import Login from './Login';
import { 
    Container, 
    Box,
    Button,
    Typography,
    Paper,
    useTheme,
    useMediaQuery,
    Avatar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { GoogleOAuthProvider } from '@react-oauth/google';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import GroupsIcon from '@mui/icons-material/Groups';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const StyledContainer = styled(Container)(({ theme }) => ({
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(3),
    background: 'linear-gradient(135deg, #d9d9d9 0%, #c3cfe2 100%)'
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
    width: '100%',
    maxWidth: '1000px',
    margin: 'auto',
    overflow: 'hidden',
    borderRadius: theme.spacing(2),
    boxShadow: '0 8px 40px rgba(0,0,0,0.12)'
}));

const LogoContainer = styled(Box)(({ theme }) => ({
    width: 120,
    height: 120,
    margin: '0 auto',
    marginBottom: theme.spacing(4),
    position: 'relative',
    '&::after': {
        content: '""',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '140px',
        height: '140px',
        background: 'radial-gradient(circle, rgba(114, 110, 255,0.2) 0%, rgba(114, 110, 255,0) 70%)',
        borderRadius: '50%',
        zIndex: 0
    },
    '& img': {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        position: 'relative',
        zIndex: 1,
        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
    }
}));

const FeatureBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
    backgroundColor: '#726eff',
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    '&:hover': {
        transform: 'translateX(10px)',
        backgroundColor: 'rgba(114, 110, 255, 0.15)',
        boxShadow: '0 4px 12px rgba(114, 110, 255,0.1)'
    }
}));

const FeatureIcon = styled(Avatar)(({ theme }) => ({
    backgroundColor: '#726eff',
    marginRight: theme.spacing(2),
    width: 40,
    height: 40,
    transition: 'transform 0.3s ease',
    '&:hover': {
        transform: 'scale(1.1)'
    }
}));

const ToggleButton = styled(Button)(({ theme }) => ({
    textTransform: 'none',
    fontWeight: 500,
    padding: '10px 24px',
    borderColor: '#726eff',
    color: '#726eff',
    borderRadius: '25px',
    transition: 'all 0.3s ease',
    '&:hover': {
        borderColor: '#5753cc',
        backgroundColor: 'rgba(114, 110, 255, 0.1)'
    }
}));

const WelcomeBox = styled(Box)(({ theme }) => ({
    position: 'relative',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at top left, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 60%)',
        pointerEvents: 'none'
    }
}));

const Auth = ({ onLogin }) => {
    const [isSignUp, setIsSignUp] = useState(true); 
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const toggleForm = () => setIsSignUp(!isSignUp);

    const features = [
        {
            icon: <SportsEsportsIcon />,
            title: 'Play Games',
            description: 'Enjoy multiplayer gaming experiences'
        },
        {
            icon: <GroupsIcon />,
            title: 'Join Community',
            description: 'Connect with fellow gamers'
        },
        {
            icon: <EmojiEventsIcon />,
            title: 'Compete',
            description: 'Participate in tournaments'
        }
    ];

    return (
        <StyledContainer maxWidth={false}>
                <StyledPaper>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: isMobile ? 'column' : 'row',
                            minHeight: '600px'
                        }}
                    >
                        {/* Left Side - Welcome Message */}
                        <WelcomeBox
                            sx={{
                                flex: '0 0 40%',
                                background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
                                color: 'white',
                                padding: 4,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <Box sx={{ position: 'relative', zIndex: 1 }}>
                                <LogoContainer>
                                    <img 
                                        src="/logo.png"
                                        alt="Ali Petek Logo"
                                    />
                                </LogoContainer>
                                
                                <Typography 
                                    variant="h6" 
                                    sx={{ 
                                        mb: 4,
                                        opacity: 0.9,
                                        fontWeight: 500,
                                        textAlign: 'center'
                                    }}
                                >
                                    {isSignUp 
                                        ? "Begin your gaming adventure!"
                                        : "Welcome back to the arena!"}
                                </Typography>

                                <Box sx={{ mb: 4 }}>
                                    {features.map((feature, index) => (
                                        <FeatureBox key={index}>
                                            <FeatureIcon>
                                                {feature.icon}
                                            </FeatureIcon>
                                            <Box>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                    {feature.title}
                                                </Typography>
                                                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                                    {feature.description}
                                                </Typography>
                                            </Box>
                                        </FeatureBox>
                                    ))}
                                </Box>

                                <Box sx={{ mt: 'auto', textAlign: 'center' }}>
                                    <Typography variant="body1" sx={{ mb: 2 }}>
                                        {isSignUp 
                                            ? "Already have an account?"
                                            : "Don't have an account?"}
                                    </Typography>
                                    <ToggleButton
                                        onClick={toggleForm}
                                        variant="outlined"
                                        size="large"
                                    >
                                        {isSignUp ? 'Sign In' : 'Sign Up'}
                                    </ToggleButton>
                                </Box>
                            </Box>
                        </WelcomeBox>

                        {/* Right Side - Auth Form */}
                        <Box
                            sx={{
                                flex: '1 1 60%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                position: 'relative',
                                backgroundColor: '#ffffff'
                            }}
                        >
                            {isSignUp ? (
                                <SignUp />
                            ) : (
                                <Login onLogin={onLogin} />
                            )}
                        </Box>
                    </Box>
                </StyledPaper>
            </StyledContainer>
    );
};

export default Auth;
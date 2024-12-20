import React, { useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Box,
    Tooltip,
    useTheme,
    useMediaQuery,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Avatar,
    Menu,
    MenuItem,
    Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupsIcon from '@mui/icons-material/Groups';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HelpIcon from '@mui/icons-material/Help';
import PersonIcon from '@mui/icons-material/Person';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
    background: 'linear-gradient(135deg, #726eff 0%, #5753cc 100%)',
    boxShadow: '0 3px 5px 2px rgba(0, 0, 0, 0.1)',
}));

const LogoTypography = styled(Typography)(({ theme }) => ({
    fontWeight: 700,
    background: 'linear-gradient(45deg, #fff 30%, #e3f2fd 90%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
    letterSpacing: '1px'
}));

const StyledIconButton = styled(IconButton)(({ theme, active }) => ({
    color: active ? '#64b5f6' : 'white',
    margin: theme.spacing(0, 1),
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-2px)',
        color: '#64b5f6',
        background: 'rgba(255, 255, 255, 0.1)',
    },
    '&::after': active ? {
        content: '""',
        position: 'absolute',
        bottom: -2,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '5px',
        height: '5px',
        backgroundColor: '#64b5f6',
        borderRadius: '50%'
    } : {}
}));

const NavigationBar = ({ onLogout }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleProfileMenuClose = () => {
        setAnchorEl(null);
    };

    const handleSignOut = useCallback(async () => {
        console.log('handleSignOut clicked');
        handleProfileMenuClose();
        if (typeof onLogout === 'function') {
            try {
                await onLogout();
            } catch (error) {
                console.error('Error during logout:', error);
            }
        } else {
            console.error('onLogout is not a function:', onLogout);
        }
    });

    const handleProfileClick = () => {
        handleProfileMenuClose();
        navigate('/profile');
    };

    const navItems = [
        { path: '/home', icon: <HomeIcon />, label: 'Home' },
        { path: '/leaderboard', icon: <EmojiEventsIcon />, label: 'Leaderboard' },
        { path: '/lobby', icon: <GroupsIcon />, label: 'Lobby' },
        { path: '/game', icon: <SportsEsportsIcon />, label: 'Game' },
        { path: '/map', icon: <LocationOnIcon />, label: 'Map' },
        { path: '/recommend-question', icon: <HelpIcon />, label: 'Questions' },
        { path: '/profile', icon: <PersonIcon />, label: 'Profile' }
    ];

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const drawer = (
        <Box sx={{ width: 250, bgcolor: '#1a237e', height: '100%', color: 'white' }}>
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LogoTypography variant="h6">
                    AliPetek
                </LogoTypography>
            </Box>
            <List>
                {navItems.map((item) => (
                    <ListItem 
                        button 
                        key={item.path}
                        onClick={() => {
                            navigate(item.path);
                            handleDrawerToggle();
                        }}
                        sx={{
                            color: location.pathname === item.path ? '#64b5f6' : 'white',
                            '&:hover': {
                                bgcolor: 'rgba(255, 255, 255, 0.1)'
                            }
                        }}
                    >
                        <ListItemIcon sx={{ color: 'inherit' }}>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={item.label} />
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <>
            <StyledAppBar position="fixed">
                <Toolbar>
                    {isMobile ? (
                        <IconButton
                            color="inherit"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2 }}
                        >
                            <MenuIcon />
                        </IconButton>
                    ) : null}
                    
                    <LogoTypography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        AliPetek
                    </LogoTypography>

                    {!isMobile && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {navItems.map((item) => (
                                <Tooltip key={item.path} title={item.label}>
                                    <StyledIconButton
                                        onClick={() => navigate(item.path)}
                                        active={location.pathname === item.path ? 1 : 0}
                                    >
                                        {item.icon}
                                    </StyledIconButton>
                                </Tooltip>
                            ))}
                            <Tooltip title="Account">
                                <IconButton
                                    onClick={handleProfileMenuOpen}
                                    sx={{
                                        ml: 2,
                                        color: 'white',
                                        '&:hover': {
                                            color: '#64b5f6',
                                        },
                                    }}
                                >
                                    <AccountCircleIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    )}

                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleProfileMenuClose}
                        PaperProps={{
                            elevation: 0,
                            sx: {
                                overflow: 'visible',
                                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                mt: 1.5,
                                '& .MuiAvatar-root': {
                                    width: 32,
                                    height: 32,
                                    ml: -0.5,
                                    mr: 1,
                                },
                            },
                        }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        <MenuItem onClick={handleProfileClick}>
                            <ListItemIcon>
                                <PersonIcon fontSize="small" />
                            </ListItemIcon>
                            Profile
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={handleSignOut}>
                            <ListItemIcon>
                                <LogoutIcon fontSize="small" />
                            </ListItemIcon>
                            Sign out
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </StyledAppBar>

            {isMobile && (
                <Drawer
                    variant="temporary"
                    anchor="left"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true
                    }}
                >
                    {drawer}
                </Drawer>
            )}
            
            <Toolbar />
        </>
    );
};

export default NavigationBar;
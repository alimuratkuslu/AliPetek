import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navi from './NavigationBar';
import ProfileAvatar from './ProfileAvatar';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  List,
  ListItem,
  Divider,
  Grid,
  Container,
  Avatar,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocationOffIcon from '@mui/icons-material/LocationOff';

const Profile = ({ onLogout }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [previousGames, setPreviousGames] = useState([]);
  const [locationSharing, setLocationSharing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const updateAvatar = (newAvatar) => {
    setUserProfile((prevProfile) => ({
      ...prevProfile,
      avatar: newAvatar,
    }));
  };

  const handleLocationSharingChange = async (event) => {
    const newValue = event.target.checked;
    const jwtToken = localStorage.getItem('jwtToken');

    try {
      await axios.post(`/api/user/sharing-preference?enabled=${newValue}`, null, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      setLocationSharing(newValue);
      setSnackbar({
        open: true,
        message: `Location sharing ${newValue ? 'enabled' : 'disabled'}`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating location sharing preference:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update location sharing preference',
        severity: 'error'
      });
    }
  };

  useEffect(() => {
    const jwtToken = localStorage.getItem('jwtToken');
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/profile', {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            'Content-Type': 'application/json',
          },
        });
        setUserProfile(response.data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    const fetchLocationSharingPreference = async () => {
      try {
        const response = await axios.get('/api/user/sharing-preference', {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            'Content-Type': 'application/json',
          },
        });
        setLocationSharing(response.data);
      } catch (error) {
        console.error('Error fetching location sharing preference:', error);
      }
    };

    const fetchPreviousGames = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/profile/prevGames', {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            'Content-Type': 'application/json',
          },
        });
        const sortedGames = response.data.sort((a, b) => b.id - a.id); 
        setPreviousGames(sortedGames);
      } catch (error) {
        console.error('Error fetching previous games:', error);
      }
    };

    fetchUserProfile();
    fetchLocationSharingPreference();
    fetchPreviousGames();
  }, []);

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (!userProfile) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Navi onLogout={onLogout}/>
        <CircularProgress />
      </Box>
    );
  };

  return (
    <Box sx={{
      minHeight: '200vh',
      minWidth: '200vh',
      bgcolor: '#f0f2f5',
      backgroundImage: 'linear-gradient(135deg, #f0f2f5 0%, #e0e7ff 100%)',
      pb: 6
    }}>
      <Navi onLogout={onLogout}/>
      
      <Container maxWidth="lg" sx={{ pt: 8 }}>
      <Box sx={{
        pt: { xs: 12, sm: 7 }, // Increased top padding to avoid navbar overlap
        pb: { xs: 6, sm: 8 },
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* Background Decoration */}
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          maxWidth: '600px',
          height: '120px',
          background: 'linear-gradient(90deg, rgba(114,110,255,0.15) 0%, rgba(114,110,255,0.05) 100%)',
          borderRadius: '60px',
          filter: 'blur(20px)',
          zIndex: 0
        }} />

        {/* Trophy Icon */}
        <Box sx={{
          position: 'relative',
          zIndex: 1,
          mb: 2,
          '& svg': {
            fontSize: '3rem',
            color: '#726eff',
            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))'
          }
        }}>
          <Typography variant="h1" sx={{
            fontSize: '3rem',
            color: '#726eff'
          }}>
             👤
          </Typography>
        </Box>

        {/* Main Title */}
        <Typography variant="h2" sx={{
          position: 'relative',
          zIndex: 1,
          fontWeight: 800,
          fontSize: { xs: '2.5rem', sm: '3.5rem' },
          background: 'linear-gradient(45deg, #1a237e 30%, #726eff 90%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          mb: 2,
          textShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          Profile
        </Typography>

        {/* Subtitle */}
        <Typography variant="h6" sx={{
          position: 'relative',
          zIndex: 1,
          color: '#666',
          fontWeight: 500,
          maxWidth: '600px',
          mx: 'auto',
          px: 2
        }}>
          Top players competing for glory
        </Typography>
      </Box>

        <Grid container spacing={4}>
          {/* Profile Info Card */}
          <Grid item xs={12} md={8}>
            <Card sx={{
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
                  Profile Information
                </Typography>
              </Box>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 4,
                  flexDirection: { xs: 'column', sm: 'row' }
                }}>
                  <Box sx={{ flex: 'none' }}>
                    <ProfileAvatar userProfile={userProfile} updateAvatar={updateAvatar} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                      {userProfile.username}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        color: '#666'
                      }}>
                        <Typography variant="body1">Email:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {userProfile.email}
                        </Typography>
                      </Box>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <Typography variant="body1" sx={{ color: '#666' }}>
                          Total Score:
                        </Typography>
                        <Typography variant="h6" sx={{
                          color: '#726eff',
                          fontWeight: 600
                        }}>
                          {userProfile.score} points
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        mt: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: 'rgba(114,110,255,0.05)',
                        border: '1px solid rgba(114,110,255,0.1)',
                      }}>
                        <Box sx={{
                          width: 36,
                          height: 36,
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: locationSharing 
                            ? 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)' 
                            : 'linear-gradient(135deg, #9e9e9e 0%, #bdbdbd 100%)',
                          transition: 'background 0.3s ease'
                        }}>
                          {locationSharing ? (
                            <LocationOnIcon sx={{ color: 'white', fontSize: 20 }} />
                          ) : (
                            <LocationOffIcon sx={{ color: 'white', fontSize: 20 }} />
                          )}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" sx={{ 
                            fontWeight: 600,
                            color: 'text.primary',
                            mb: 0.25
                          }}>
                            Location Sharing
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            color: 'text.secondary',
                            lineHeight: 1.2,
                            display: 'block'
                          }}>
                            {locationSharing 
                              ? 'Your location is visible to friends' 
                              : 'Your location is hidden'}
                          </Typography>
                        </Box>
                        <Switch
                          checked={locationSharing}
                          onChange={handleLocationSharingChange}
                          color="primary"
                          size="small"
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#4CAF50'
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: '#81C784'
                            }
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Friends Card */}
          <Grid item xs={12} md={4}>
            <Card sx={{
              borderRadius: 3,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              overflow: 'hidden',
              height: '100%'
            }}>
              <Box sx={{
                bgcolor: '#4caf50',
                py: 2,
                px: 3,
                color: 'white'
              }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Friends
                </Typography>
              </Box>
              <CardContent sx={{ p: 0 }}>
                <List sx={{ p: 0 }}>
                  {userProfile.friendsSet.length > 0 ? (
                    userProfile.friendsSet.map((friend, index) => (
                      <React.Fragment key={friend.id}>
                        <ListItem sx={{
                          px: 3,
                          py: 2,
                          '&:hover': {
                            bgcolor: 'rgba(0,0,0,0.02)'
                          }
                        }}>
                          <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            width: '100%'
                          }}>
                            <Avatar sx={{
                              bgcolor: '#4caf50',
                              width: 40,
                              height: 40
                            }}>
                              {friend.username?.[0]?.toUpperCase()}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {friend.username || 'No Username'}
                              </Typography>
                              {friend.score !== undefined && (
                                <Typography variant="body2" sx={{ color: '#666' }}>
                                  Score: {friend.score}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </ListItem>
                        {index < userProfile.friendsSet.length - 1 && (
                          <Divider />
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <Typography variant="body1" sx={{ color: '#666' }}>
                        No friends added yet.
                      </Typography>
                    </Box>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Previous Games Card */}
          <Grid item xs={12}>
            <Card sx={{
              borderRadius: 3,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              overflow: 'hidden'
            }}>
              <Box sx={{
                bgcolor: '#ff7043',
                py: 2,
                px: 3,
                color: 'white'
              }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Match History
                </Typography>
              </Box>
              <CardContent sx={{ p: 0 }}>
                <List sx={{ p: 0 }}>
                  {previousGames.length > 0 ? (
                    previousGames.map((game, index) => {
                      const isWinner = game.winner?.username === userProfile.username;
                      return (
                        <React.Fragment key={index}>
                          <ListItem sx={{
                            px: 3,
                            py: 3,
                            '&:hover': {
                              bgcolor: 'rgba(0,0,0,0.02)'
                            }
                          }}>
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={4}>
                                <Box>
                                  <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                                    Game #{game.id}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: '#666' }}>
                                    {new Date(game.createdDate).toLocaleDateString()}
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={12} sm={4}>
                                <Box>
                                  <Typography variant="body1" sx={{ mb: 1 }}>
                                    {game.firstUser.username} vs {game.secondUser.username}
                                  </Typography>
                                  <Typography variant="body2" sx={{
                                    color: game.gameStatusEnum === 'FINISHED' ? '#4caf50' : '#ff9800'
                                  }}>
                                    {game.gameStatusEnum}
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={12} sm={4}>
                                <Box sx={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: { xs: 'flex-start', sm: 'flex-end' }
                                }}>
                                  {game.winner && (
                                    <Typography variant="body1" sx={{
                                      color: isWinner ? '#4caf50' : '#f44336',
                                      fontWeight: 600,
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 1
                                    }}>
                                      {isWinner ? '🏆 Victory' : '❌ Defeat'}
                                    </Typography>
                                  )}
                                  <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                                    Winner: {game.winner ? game.winner.username : 'No Winner'}
                                  </Typography>
                                </Box>
                              </Grid>
                            </Grid>
                          </ListItem>
                          {index < previousGames.length - 1 && <Divider />}
                        </React.Fragment>
                      );
                    })
                  ) : (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                      <Typography variant="body1" sx={{ color: '#666' }}>
                        No previous games found.
                      </Typography>
                    </Box>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Profile;

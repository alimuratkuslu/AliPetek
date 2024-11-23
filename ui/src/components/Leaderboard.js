import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid, Avatar, CircularProgress, Badge, Container } from '@mui/material';
import axios from 'axios';
import Navi from './NavigationBar';

const Leaderboard = ({ onLogout }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const jwtToken = localStorage.getItem('jwtToken');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/user/getAllUsersByScore', {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            'Content-Type': 'application/json',
          },
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  const getRankBadge = (index) => {
    if (index === 0) return '#FFD700'; // Gold
    if (index === 1) return '#C0C0C0'; // Silver
    if (index === 2) return '#CD7F32'; // Bronze
    return 'transparent';
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
            🏆
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
          Leaderboard
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

        <Box sx={{ position: 'relative', height: '400px', mb: 8 }}>
          {/* First Place */}
          {users[0] && (
            <Box sx={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              top: 0,
              zIndex: 3
            }}>
              <Card sx={{
                width: 300,
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                transition: 'transform 0.3s ease',
                '&:hover': { transform: 'scale(1.05)' }
              }}>
                <CardContent sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 4
                }}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    badgeContent={
                      <Avatar sx={{
                        bgcolor: getRankBadge(0),
                        width: 36,
                        height: 36,
                        border: '2px solid white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        fontSize: '1.2rem',
                        fontWeight: 'bold'
                      }}>
                        1
                      </Avatar>
                    }
                  >
                    <Avatar
                      alt={users[0].username}
                      src={users[0].avatarUrl}
                      sx={{
                        width: 120,
                        height: 120,
                        border: `4px solid ${getRankBadge(0)}`,
                        mb: 2,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }}
                    >
                      {!users[0].avatarUrl && users[0].username[0].toUpperCase()}
                    </Avatar>
                  </Badge>
                  <Typography variant="h5" sx={{
                    fontWeight: 'bold',
                    mb: 1,
                    color: '#1a237e'
                  }}>
                    {users[0].username}
                  </Typography>
                  <Typography variant="h6" sx={{
                    color: '#ffd700',
                    fontWeight: 'bold',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    {users[0].score} points
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Second Place */}
          {users[1] && (
            <Box sx={{
              position: 'absolute',
              left: '20%',
              top: '130px',
              zIndex: 2
            }}>
              <Card sx={{
                width: 260,
                borderRadius: 3,
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                transition: 'transform 0.3s ease',
                '&:hover': { transform: 'scale(1.05)' }
              }}>
                <CardContent sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 3
                }}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    badgeContent={
                      <Avatar sx={{
                        bgcolor: getRankBadge(1),
                        width: 32,
                        height: 32,
                        border: '2px solid white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        fontSize: '1.1rem',
                        fontWeight: 'bold'
                      }}>
                        2
                      </Avatar>
                    }
                  >
                    <Avatar
                      alt={users[1].username}
                      src={users[1].avatarUrl}
                      sx={{
                        width: 100,
                        height: 100,
                        border: `4px solid ${getRankBadge(1)}`,
                        mb: 2,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
                      }}
                    >
                      {!users[1].avatarUrl && users[1].username[0].toUpperCase()}
                    </Avatar>
                  </Badge>
                  <Typography variant="h6" sx={{
                    fontWeight: 'bold',
                    mb: 1,
                    color: '#1a237e'
                  }}>
                    {users[1].username}
                  </Typography>
                  <Typography variant="subtitle1" sx={{
                    color: '#9e9e9e',
                    fontWeight: 'bold'
                  }}>
                    {users[1].score} points
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Third Place */}
          {users[2] && (
            <Box sx={{
              position: 'absolute',
              right: '20%',
              top: '180px',
              zIndex: 1
            }}>
              <Card sx={{
                width: 240,
                borderRadius: 3,
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                transition: 'transform 0.3s ease',
                '&:hover': { transform: 'scale(1.05)' }
              }}>
                <CardContent sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 3
                }}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    badgeContent={
                      <Avatar sx={{
                        bgcolor: getRankBadge(2),
                        width: 32,
                        height: 32,
                        border: '2px solid white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        fontSize: '1.1rem',
                        fontWeight: 'bold'
                      }}>
                        3
                      </Avatar>
                    }
                  >
                    <Avatar
                      alt={users[2].username}
                      src={users[2].avatarUrl}
                      sx={{
                        width: 90,
                        height: 90,
                        border: `4px solid ${getRankBadge(2)}`,
                        mb: 2,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
                      }}
                    >
                      {!users[2].avatarUrl && users[2].username[0].toUpperCase()}
                    </Avatar>
                  </Badge>
                  <Typography variant="h6" sx={{
                    fontWeight: 'bold',
                    mb: 1,
                    color: '#1a237e'
                  }}>
                    {users[2].username}
                  </Typography>
                  <Typography variant="subtitle1" sx={{
                    color: '#9e9e9e',
                    fontWeight: 'bold'
                  }}>
                    {users[2].score} points
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          )}
        </Box>

        {/* Other Players */}
        <Box sx={{ mt: 8 }}>
          <Typography variant="h5" sx={{
            fontWeight: 600,
            color: '#1a237e',
            mb: 4,
            textAlign: 'center'
          }}>
            Other Players
          </Typography>
          <Grid container spacing={3} justifyContent="center">
            {users.slice(3).map((user, index) => (
              <Grid item xs={12} sm={6} md={4} key={user.id}>
                <Card sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 2,
                  borderRadius: 3,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' }
                }}>
                  <Avatar
                    alt={user.username}
                    src={user.avatarUrl}
                    sx={{
                      width: 50,
                      height: 50,
                      mr: 2,
                      bgcolor: '#e0e0e0'
                    }}
                  >
                    {!user.avatarUrl && user.username[0].toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {user.username}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      {user.score} points
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      ml: 'auto',
                      color: '#9e9e9e',
                      fontWeight: 500
                    }}
                  >
                    #{index + 4}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default Leaderboard;
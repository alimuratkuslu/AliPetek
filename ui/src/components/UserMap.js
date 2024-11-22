import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import axios from 'axios';
import {
    Box,
    Typography,
    Paper,
    Container,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    Chip,
    Avatar,
    Grid,
    Divider,
    useTheme,
} from '@mui/material';
import {
    LocationOn as LocationIcon,
    AccessTime as TimeIcon,
    Person as PersonIcon,
  } from '@mui/icons-material';
import { jwtDecode } from 'jwt-decode';
import NavigationBar from './NavigationBar';

const UserMap = () => {
  const [userLocations, setUserLocations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  const GOOGLE_MAPS_API_KEY = 'AIzaSyADnINMVDc1ppORxv52mp2sNo-CTEtXPTE';

  const mapContainerStyle = {
    width: '100vh',
    height: '600px',
    borderRadius: '8px',
  };

  const [center, setCenter] = useState({
    lat: 0,
    lng: 0,
  });

  const mapOptions = {
    styles: [
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#e9e9e9' }, { lightness: 17 }],
      },
      {
        featureType: 'landscape',
        elementType: 'geometry',
        stylers: [{ color: '#f5f5f5' }, { lightness: 20 }],
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry.fill',
        stylers: [{ color: '#ffffff' }, { lightness: 17 }],
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#ffffff' }, { lightness: 29 }, { weight: 0.2 }],
      },
      {
        featureType: 'administrative',
        elementType: 'geometry',
        stylers: [{ color: '#fefefe' }, { lightness: 20 }],
      },
    ],
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: true,
    scaleControl: true,
    streetViewControl: true,
    rotateControl: true,
    fullscreenControl: true,
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          updateUserLocation(latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Unable to get your location. Please enable location services.');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }

    const intervalId = setInterval(fetchUserLocations, 10000); // Update every 10 seconds

    return () => clearInterval(intervalId);
  }, []);

  const updateUserLocation = async (latitude, longitude) => {
    try {
      const jwtToken = localStorage.getItem('jwtToken');
      const decodedToken = jwtDecode(jwtToken);
      const username = decodedToken.sub;
      await axios.post('/api/locations/update', {
        username,
        latitude,
        longitude,
      },
      {
        headers: {
            Authorization: `Bearer ${jwtToken}`,
        },
     });
      await fetchUserLocations();
    } catch (error) {
      console.error('Error updating location:', error);
      setError('Failed to update your location.');
    }
  };

  const fetchUserLocations = async () => {
    try {
      const jwtToken = localStorage.getItem('jwtToken');
      const response = await axios.get('/api/locations/online',
       {
            headers: {
                Authorization: `Bearer ${jwtToken}`,
            },
        });
      console.log('User locations:', response.data);
      setUserLocations(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setError('Failed to fetch user locations.');
      setLoading(false);
    }
  };

  const formatLastLogin = (lastLogin) => {
    if (!lastLogin) return 'N/A';
    const date = new Date(lastLogin);
    return date.toLocaleString();
  };

  const CustomMarker = ({ location }) => (
    <Marker
      position={{
        lat: location.latitude,
        lng: location.longitude,
      }}
      onClick={() => setSelectedUser(location)}
      icon={{
        url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
        scaledSize: new window.google.maps.Size(40, 40),
      }}
    />
  );

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
        flexDirection="column"
        gap={2}
      >
        <NavigationBar />
        <CircularProgress size={60} />
        <Typography variant="h6" color="textSecondary">
          Loading user locations...
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 15, mb: 7 }}>
      <NavigationBar />
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card
            elevation={3}
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(to right bottom, #ffffff, #f8f9fa)',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <LocationIcon
                  sx={{ fontSize: 40, color: theme.palette.primary.main, mr: 2 }}
                />
                <Typography variant="h4" component="h1" color="primary" fontWeight="500">
                  Active Users Map
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                  {userLocations.length} Active Users Online
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {userLocations.map((location) => (
                    <Chip
                      key={location.username}
                      avatar={<Avatar>{location.user.username[0].toUpperCase()}</Avatar>}
                      label={location.username}
                      color="primary"
                      variant="outlined"
                      onClick={() => {
                        setSelectedUser(location);
                        setCenter({
                          lat: location.latitude,
                          lng: location.longitude,
                        });
                      }}
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </Box>
              </Box>

              <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={center}
                  zoom={3}
                  options={mapOptions}
                >
                  {userLocations.map((location) => (
                    <CustomMarker key={location.username} location={location} />
                  ))}

                  {selectedUser && (
                    <InfoWindow
                      position={{
                        lat: selectedUser.latitude,
                        lng: selectedUser.longitude,
                      }}
                      onCloseClick={() => setSelectedUser(null)}
                    >
                      <Paper sx={{ p: 2, minWidth: 200 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <PersonIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                          <Typography variant="subtitle1" fontWeight="bold">
                            {selectedUser.username}
                          </Typography>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <TimeIcon sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            Last Login: {formatLastLogin(selectedUser.lastLogin)}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" mt={1}>
                          Lat: {selectedUser.latitude.toFixed(6)}
                          <br />
                          Lng: {selectedUser.longitude.toFixed(6)}
                        </Typography>
                      </Paper>
                    </InfoWindow>
                  )}
                </GoogleMap>
              </LoadScript>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default UserMap;
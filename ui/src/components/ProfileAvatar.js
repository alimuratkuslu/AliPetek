import React, { useState } from 'react';
import { Box, Avatar, Modal, Grid, Card, CardContent, Typography } from '@mui/material';
import axios from 'axios';

const ProfileAvatar = ({ userProfile, updateAvatar }) => {
  const [openModal, setOpenModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(userProfile.avatarUrl || null);

  const randomAvatars = [
    'https://robohash.org/avatar1?size=150x150',
    'https://robohash.org/avatar2?size=150x150',
    'https://robohash.org/avatar3?size=150x150',
    'https://robohash.org/avatar4?size=150x150',
    'https://robohash.org/avatar5?size=150x150',
  ];

  const handleAvatarClick = () => {
    setOpenModal(true);
  };

  const handleAvatarSelect = async (avatarUrl) => {
    const jwtToken = localStorage.getItem('jwtToken');

    try {
      const response = await axios.post(
        'http://localhost:8080/api/profile/updateAvatar', 
        { avatarUrl: avatarUrl } , 
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`, 
            'Content-Type': 'application/json',
          },
        }
      );

      const updatedProfile = response.data;

      setSelectedAvatar(avatarUrl);
      updateAvatar(avatarUrl);
      setOpenModal(false);
    } catch (error) {
      console.error('Error updating avatar:', error);
    }
  };

  return (
    <Box display="flex" alignItems="center" gap={3}>
      <Avatar
        alt={userProfile.username}
        sx={{
          width: 80,
          height: 80,
          bgcolor: 'primary.main',
          fontSize: '1.5rem',
          cursor: 'pointer',
        }}
        src={selectedAvatar}
        onClick={handleAvatarClick} 
      >
        {!selectedAvatar && userProfile.username[0].toUpperCase()}
      </Avatar>

      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        aria-labelledby="choose-avatar"
        aria-describedby="select-an-avatar-image"
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Card sx={{ width: 400, padding: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Choose an Avatar
              </Typography>
              <Grid container spacing={2}>
                {randomAvatars.map((avatar, index) => (
                  <Grid item xs={4} key={index}>
                    <Avatar
                      src={avatar}
                      sx={{
                        width: 60,
                        height: 60,
                        cursor: 'pointer',
                        border: avatar === selectedAvatar ? '2px solid green' : 'none',
                      }}
                      onClick={() => handleAvatarSelect(avatar)} 
                    />
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Box>
      </Modal>
    </Box>
  );
};

export default ProfileAvatar;
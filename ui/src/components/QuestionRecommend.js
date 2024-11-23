import React, { useState } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Container,
    Stepper,
    Step,
    StepLabel,
    Card,
    CardContent,
    Alert,
    Snackbar,
    Fade,
    useTheme,
} from '@mui/material';
import {
    Send as SendIcon,
    Clear as ClearIcon,
    Help as HelpIcon,
    Star as StarIcon,
  } from '@mui/icons-material';
import NavigationBar from './NavigationBar';
import axios from 'axios';

const QuestionRecommend = ({ onLogout }) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [formData, setFormData] = useState({
    text: '',
    answer: '',
    letter: '',
    questionDifficultyEnum: '',
    points: 0,
  });

  const steps = ['Question Details', 'Answer & Letter', 'Difficulty & Points'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleReset = () => {
    setFormData({
      text: '',
      answer: '',
      letter: '',
      questionDifficultyEnum: '',
      points: 0,
    });
    setActiveStep(0);
  };

  const showNotification = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const jwtToken = localStorage.getItem('jwtToken');
      
      const response = await axios.post(
        'http://localhost:8080/api/recommend/create',
        formData, 
        {
            headers: {
                Authorization: `Bearer ${jwtToken}`,
            },
        });
      
      showNotification('Question recommended successfully!');
      handleReset();
    } catch (error) {
      console.error('Error recommending question:', error);
      showNotification('Error submitting question. Please try again.', 'error');
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Fade in={activeStep === 0}>
            <Box>
              <Typography variant="h6" gutterBottom color="primary">
                Enter Question Details
              </Typography>
              <TextField
                fullWidth
                label="Question Text"
                name="text"
                value={formData.text}
                onChange={handleChange}
                margin="normal"
                required
                multiline
                rows={4}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                }}
              />
            </Box>
          </Fade>
        );
      case 1:
        return (
          <Fade in={activeStep === 1}>
            <Box>
              <Typography variant="h6" gutterBottom color="primary">
                Provide Answer Details
              </Typography>
              <TextField
                fullWidth
                label="Answer"
                name="answer"
                value={formData.answer}
                onChange={handleChange}
                margin="normal"
                required
                sx={{ mb: 3 }}
              />
              <TextField
                fullWidth
                label="Letter"
                name="letter"
                value={formData.letter}
                onChange={handleChange}
                required
                inputProps={{ maxLength: 1 }}
                helperText="Enter a single letter"
              />
            </Box>
          </Fade>
        );
      case 2:
        return (
          <Fade in={activeStep === 2}>
            <Box>
              <Typography variant="h6" gutterBottom color="primary">
                Set Difficulty and Points
              </Typography>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Difficulty</InputLabel>
                <Select
                  name="questionDifficultyEnum"
                  value={formData.questionDifficultyEnum}
                  onChange={handleChange}
                  label="Difficulty"
                >
                  <MenuItem value="ONE">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <StarIcon sx={{ color: '#4CAF50', mr: 1 }} />
                      1
                    </Box>
                  </MenuItem>
                  <MenuItem value="TWO">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <StarIcon sx={{ color: '#4CAF50', mr: 1 }} />
                      <StarIcon sx={{ color: '#FFC107', mr: 1 }} />
                      2
                    </Box>
                  </MenuItem>
                  <MenuItem value="THREE">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <StarIcon sx={{ color: '#4CAF50', mr: 1 }} />
                      <StarIcon sx={{ color: '#FFC107', mr: 1 }} />
                      <StarIcon sx={{ color: '#FFC107', mr: 1 }} />
                      3
                    </Box>
                  </MenuItem>

                  <MenuItem value="FOUR">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <StarIcon sx={{ color: '#FFC107', mr: 1 }} />
                      <StarIcon sx={{ color: '#FFC107', mr: 1 }} />
                      <StarIcon sx={{ color: '#FFC107', mr: 1 }} />
                      <StarIcon sx={{ color: '#f44336', mr: 1 }} />
                      4
                    </Box>
                  </MenuItem>
                  <MenuItem value="FIVE">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <StarIcon sx={{ color: '#FFC107', mr: 1 }} />
                      <StarIcon sx={{ color: '#FFC107', mr: 1 }} />
                      <StarIcon sx={{ color: '#FFC107', mr: 1 }} />
                      <StarIcon sx={{ color: '#f44336', mr: 1 }} />
                      <StarIcon sx={{ color: '#f44336', mr: 1 }} />
                      5
                    </Box>
                  </MenuItem>
                  <MenuItem value="SIX">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <StarIcon sx={{ color: '#f44336', mr: 1 }} />
                      <StarIcon sx={{ color: '#f44336', mr: 1 }} />
                      <StarIcon sx={{ color: '#f44336', mr: 1 }} />
                      <StarIcon sx={{ color: '#f44336', mr: 1 }} />
                      <StarIcon sx={{ color: '#f44336', mr: 1 }} />
                      <StarIcon sx={{ color: '#f44336', mr: 1 }} />
                      6
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Points"
                name="points"
                type="number"
                value={formData.points}
                onChange={handleChange}
                margin="normal"
                required
                inputProps={{ min: 0 }}
                sx={{ mt: 3 }}
              />
            </Box>
          </Fade>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 14, mb: 2 }}>
      <NavigationBar onLogout={onLogout}/>
      <Card elevation={3} sx={{
        borderRadius: 2,
        background: 'linear-gradient(to right bottom, #ffffff, #f8f9fa)',
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <HelpIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mr: 2 }} />
            <Typography variant="h4" component="h1" color="primary" fontWeight="500">
              Recommend a Question
            </Typography>
          </Box>
          
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <form onSubmit={handleSubmit}>
            <Box sx={{ mt: 2, minHeight: '250px' }}>
              {getStepContent(activeStep)}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                onClick={handleReset}
                startIcon={<ClearIcon />}
                color="inherit"
                sx={{ mr: 1 }}
              >
                Reset
              </Button>
              <Box>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  sx={{ mr: 1 }}
                >
                  Back
                </Button>
                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    type="submit"
                    endIcon={<SendIcon />}
                    sx={{
                      background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                      boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                    }}
                  >
                    Submit
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    sx={{
                      background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                      boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                    }}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default QuestionRecommend;
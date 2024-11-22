import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';

const Dice = ({ finalValue, onAnimationComplete }) => {
  const [currentValue, setCurrentValue] = useState(1);
  const [isRolling, setIsRolling] = useState(true);

  const dotPositions = {
    1: [[50, 50]],
    2: [[25, 25], [75, 75]],
    3: [[25, 25], [50, 50], [75, 75]],
    4: [[25, 25], [25, 75], [75, 25], [75, 75]],
    5: [[25, 25], [25, 75], [50, 50], [75, 25], [75, 75]],
    6: [[25, 25], [25, 50], [25, 75], [75, 25], [75, 50], [75, 75]]
  };

  useEffect(() => {
    if (isRolling) {
      let rolls = 0;
      const maxRolls = 10; 
      const interval = setInterval(() => {
        rolls++;
        if (rolls < maxRolls) {
          setCurrentValue(Math.floor(Math.random() * 6) + 1);
        } else {
          setCurrentValue(finalValue);
          setIsRolling(false);
          clearInterval(interval);
          if (onAnimationComplete) {
            setTimeout(onAnimationComplete, 500); // Delay before callback
          }
        }
      }, 500); // Time between each roll

      return () => clearInterval(interval);
    }
  }, [isRolling, finalValue, onAnimationComplete]);

  const renderDots = (value) => {
    return dotPositions[value].map(([x, y], index) => (
      <Box
        key={index}
        sx={{
          position: 'absolute',
          left: `${x}%`,
          top: `${y}%`,
          transform: 'translate(-50%, -50%)',
          width: '15px',
          height: '15px',
          borderRadius: '50%',
          backgroundColor: '#333',
          transition: 'all 0.1s ease-in-out'
        }}
      />
    ));
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100px',
        height: '100px',
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 0 10px rgba(0,0,0,0.3)',
        transform: isRolling ? 'rotate(10deg)' : 'rotate(0deg)',
        transition: 'transform 0.1s ease-in-out',
        animation: isRolling ? 'shake 0.5s infinite' : 'none',
        '@keyframes shake': {
          '0%': { transform: 'rotate(-10deg)' },
          '50%': { transform: 'rotate(10deg)' },
          '100%': { transform: 'rotate(-10deg)' }
        }
      }}
    >
      {renderDots(currentValue)}
    </Box>
  );
};

export default Dice;
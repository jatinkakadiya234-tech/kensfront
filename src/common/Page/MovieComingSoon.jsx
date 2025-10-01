import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Container,
  Button,
  TextField,
  Grid,
  IconButton
} from "@mui/material";
import { 
  PlayCircleOutline,
  Facebook,
  Twitter,
  Instagram,
  YouTube,
  Email
} from "@mui/icons-material";

const MovieComingSoon = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [email, setEmail] = useState("");

  // Set launch date (example: 1 month from now)
  const launchDate = new Date();
  launchDate.setMonth(launchDate.getMonth() + 1);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const difference = launchDate - now;

      if (difference <= 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Subscribed with:", email);
    // Add your subscription logic here
    setEmail("");
  };

  return (
    <Container 
      maxWidth={false}
      sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), url(https://source.unsplash.com/random/1920x1080/?movie) center/cover no-repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        textAlign: 'center',
        py: 8
      }}
    >
      <Box sx={{ maxWidth: '800px', width: '100%' }}>
        <Typography 
          variant="h2" 
          sx={{ 
            fontWeight: 'bold',
            mb: 2,
            color: 'red',
            textShadow: '0 0 10px rgba(255,0,0,0.5)'
          }}
        >
          COMING SOON
        </Typography>

        <Typography variant="h4" sx={{ mb: 4 }}>
          The Most Awaited Movie of The Year
        </Typography>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          gap: 2,
          my: 4,
          flexWrap: 'wrap'
        }}>
          {Object.entries(timeLeft).map(([unit, value]) => (
            <Box key={unit} sx={{ 
              bgcolor: '#111',
              p: 2,
              borderRadius: 1,
              minWidth: '80px'
            }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {value.toString().padStart(2, '0')}
              </Typography>
              <Typography variant="body1" sx={{ textTransform: 'uppercase' }}>
                {unit}
              </Typography>
            </Box>
          ))}
        </Box>

        <Button
          variant="contained"
          startIcon={<PlayCircleOutline />}
          sx={{
            bgcolor: 'red',
            px: 4,
            py: 1.5,
            fontSize: '1.1rem',
            '&:hover': { bgcolor: 'darkred' },
            mb: 4
          }}
        >
          Watch Trailer
        </Button>

        <Typography variant="h6" sx={{ mb: 2 }}>
          Get notified when we launch
        </Typography>

        <Box 
          component="form" 
          onSubmit={handleSubmit}
          sx={{ 
            maxWidth: '500px',
            mx: 'auto',
            display: 'flex',
            gap: 1
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              startAdornment: (
                <Email sx={{ color: 'red', mr: 1 }} />
              ),
              sx: { 
                bgcolor: '#111',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#333'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'red'
                }
              }
            }}
          />
          <Button
            type="submit"
            variant="contained"
            sx={{
              bgcolor: 'red',
              px: 3,
              '&:hover': { bgcolor: 'darkred' }
            }}
          >
            Notify Me
          </Button>
        </Box>

        <Box sx={{ mt: 6 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Follow us for updates
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            {[Facebook, Twitter, Instagram, YouTube].map((Icon, index) => (
              <IconButton
                key={index}
                sx={{ 
                  color: 'white',
                  bgcolor: '#111',
                  '&:hover': { bgcolor: 'red' }
                }}
              >
                <Icon />
              </IconButton>
            ))}
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default MovieComingSoon;
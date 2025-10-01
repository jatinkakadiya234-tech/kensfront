import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Container,
  InputAdornment,
  IconButton,
  CircularProgress,
  Paper
} from "@mui/material";
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Cloud as CloudIcon
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Apihelper } from "../service/ApiHelper";
import { jwtDecode } from "jwt-decode";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Cloud-based image URLs
  const backgroundImageUrl = "https://images.unsplash.com/photo-1536240478700-b869070f9279?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80";
  const logoImageUrl = "./src/assets/Kensdrive logo.png"
  const cloudImages = [
    "https://cdn-icons-png.flaticon.com/512/2920/2920244.png",
    "https://cdn-icons-png.flaticon.com/512/1005/1005141.png",
    "https://cdn-icons-png.flaticon.com/512/2921/2921228.png"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Email is required");
    if (!password) return toast.error("Password is required");

    try {
      setLoading(true);

      const data = {
        emailOrPhone: email,
        password
      };

      const result = await Apihelper.Login(data);

      if (result.status === 200) {
        toast.success("Login successful!");
        localStorage.setItem("token", JSON.stringify(result.data.token));
        let user = jwtDecode(result.data.token);
        localStorage.setItem("userinfo", JSON.stringify(user));

        if (user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/home");
        }
      } else {
        toast.error(result.data.message || "Login failed");
      }
    } catch (error) {
      toast.error( error.response.data.message||"An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/home");
    }
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        background: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Background Cloud Elements */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `url('${backgroundImageUrl}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.1,
          filter: "blur(2px)"
        }}
      />
      
      {/* Left Side - Cloud Theme */}
      <Box
        sx={{
          flex: 1,
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          zIndex: 2,
          padding: 4
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            position: "absolute",
            top: 40,
            left: 40,
            display: "flex",
            alignItems: "center",
            gap: 2
          }}
        >
         <Box
            component="img"
            src="./src/assets/Kensdrive logo.png"
            alt="CloudDrive"
            sx={{
              height: 50,
              filter: "brightness(0) invert(1)"
            }}
          />
         
        </Box>

        {/* Cloud Content */}
        <Box
          sx={{
            textAlign: "center",
            color: "white",
            maxWidth: 500
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontWeight: "bold",
              mb: 3,
              textShadow: "3px 3px 6px rgba(0,0,0,0.7)",
              background: "linear-gradient(45deg, #4facfe, #00f2fe)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
          >
            Secure Cloud Storage
          </Typography>
          
          <Typography
            variant="h5"
            sx={{
              mb: 4,
              opacity: 0.9,
              textShadow: "2px 2px 4px rgba(0,0,0,0.5)"
            }}
          >
            Access your files from anywhere, anytime
          </Typography>

          {/* Cloud Icons Preview */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              mt: 4
            }}
          >
            {cloudImages.map((imageUrl, i) => (
              <Box
                key={i}
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  overflow: "hidden",
                  boxShadow: "0 8px 32px rgba(79,172,254,0.3)",
                  background: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(10px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: `translateY(${i % 2 === 0 ? '10px' : '-10px'})`,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: `translateY(${i % 2 === 0 ? '0px' : '0px'}) scale(1.1)`
                  }
                }}
              >
                <Box
                  component="img"
                  src={[imageUrl]}
                  alt={`Cloud ${i+1}`}
                  sx={{
                    width: "60%",
                    height: "60%",
                    objectFit: "contain",
                    filter: "brightness(1) invert(1)"
                  }}
                />
              </Box>
            ))}
          </Box>

          {/* Features */}
          <Box
            sx={{
              mt: 4,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              alignItems: "center"
            }}
          >
            {[
              "☁️ Access files from any device",
              "🔒 Bank-level security encryption",
              "📤 Easy file sharing & collaboration",
              "⚡ Fast uploads and downloads"
            ].map((feature, index) => (
              <Typography
                key={index}
                variant="body1"
                sx={{
                  opacity: 0.8,
                  textShadow: "1px 1px 2px rgba(0,0,0,0.5)"
                }}
              >
                {feature}
              </Typography>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Right Side - Login Form */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 4,
          position: "relative",
          zIndex: 2
        }}
      >
        <Paper
          elevation={24}
          sx={{
            width: "100%",
            maxWidth: 450,
            padding: 4,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            borderRadius: 3,
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 25px 50px rgba(0,0,0,0.25)"
          }}
        >
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                color: "#1a1a2e",
                fontWeight: "bold",
                mb: 1
              }}
            >
              Sign In
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#666",
                mb: 3
              }}
            >
              Access your secure cloud storage
            </Typography>
          </Box>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              width: "100%"
            }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address or Phone Number"
              placeholder="Enter Email or Phone"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: "#4facfe" }} />
                  </InputAdornment>
                )
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#e0e0e0" },
                  "&:hover fieldset": { borderColor: "#4facfe" },
                  "&.Mui-focused fieldset": { borderColor: "#4facfe" }
                }
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              placeholder="Enter Password"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: "#4facfe" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: "#666" }}
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#e0e0e0" },
                  "&:hover fieldset": { borderColor: "#4facfe" },
                  "&.Mui-focused fieldset": { borderColor: "#4facfe" }
                }
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 4,
                mb: 3,
                py: 1.5,
                background: "linear-gradient(45deg, #4facfe, #00f2fe)",
                borderRadius: 2,
                fontSize: "1.1rem",
                fontWeight: "bold",
                textTransform: "none",
                boxShadow: "0 8px 25px rgba(79,172,254,0.3)",
                "&:hover": {
                  background: "linear-gradient(45deg, #3a8dcf, #00c9e0)",
                  boxShadow: "0 12px 35px rgba(79,172,254,0.4)"
                },
                position: "relative"
              }}
            >
              {loading ? (
                <>
                  <CircularProgress
                    size={24}
                    sx={{
                      color: "white",
                      position: "absolute",
                      left: "50%",
                      marginLeft: "-12px"
                    }}
                  />
                  <span style={{ opacity: 0 }}>Sign In</span>
                </>
              ) : (
                <>
                  <CloudIcon sx={{ mr: 1 }} />
                  Sign In to CloudDrive
                </>
              )}
            </Button>

            <Box
              sx={{
                textAlign: "center",
                color: "#666"
              }}
            >
              <Link
                to="/register"
                style={{
                  color: "#4facfe",
                  textDecoration: "none",
                  fontWeight: "500"
                }}
              >
                Don't have an account? Sign Up
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
      
      <ToastContainer autoClose={600} />
    </Box>
  );
};

export default LoginForm;
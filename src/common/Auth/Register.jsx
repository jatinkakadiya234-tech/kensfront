import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Link,
  Box,
  Typography,
  Container,
  InputAdornment,
  IconButton,
  CircularProgress,
  Paper
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Phone as PhoneIcon,
  Visibility,
  VisibilityOff,
  CloudUpload as UploadIcon,
  Storage as StorageIcon
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Apihelper } from "../service/ApiHelper";

const RegisterForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [referral, setReferral] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      setReferral(ref);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!name) {
        toast.error("Name is required");
        return;
      }
      if (!phone || phone.length !== 10) {
        toast.error("Valid 10-digit phone number is required");
        return;
      }
      if (!email) {
        toast.error("Email is required");
        return;
      }
      if (!password) {
        toast.error("Password is required");
        return;
      }

      const data = {
        phonenumber: phone,
        name,
        email,
        password,
        role:"user",
        referralCode: referral // send referral code as freeTrial
      };

      const result = await Apihelper.Register(data);
      
      if (result.status === 201) {
        toast.success("Registration successful!");
        navigate("/login");
      } else {
        toast.error(result?.message || "Registration failed");
      }
    } catch (error) {
    
      toast.error(error.response.data.message||"An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

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
          background: "url('/assets/clouds/cloud-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.1,
          filter: "blur(2px)"
        }}
      />
      
      {/* Left Side - Cloud Storage Theme */}
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
            Store, access, and share your files from anywhere
          </Typography>

          {/* Free Storage Badge */}
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              background: "linear-gradient(45deg, #4facfe, #00f2fe)",
              padding: "12px 24px",
              borderRadius: "25px",
              mb: 4,
              boxShadow: "0 8px 25px rgba(79,172,254,0.3)"
            }}
          >
            <StorageIcon sx={{ color: "white", fontSize: 24 }} />
            <Typography variant="h6" sx={{ color: "white", fontWeight: "bold" }}>
              15GB Free Storage
            </Typography>
          </Box>

          {/* Cloud Icons Preview */}
          <Box
            sx={{
              display: "flex",
              gap: 3,
              justifyContent: "center",
              mt: 4
            }}
          >
            {[
              {icon: "📷", label: "Photos"},
              {icon: "📄", label: "Documents"},
              {icon: "🎵", label: "Music"},
              {icon: "🎥", label: "Videos"}
            ].map((item, i) => (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(255,255,255,0.1)",
                    backdropFilter: "blur(10px)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                    fontSize: "2rem"
                  }}
                >
                  {item.icon}
                </Box>
                <Typography variant="body2" sx={{ color: "white", opacity: 0.9 }}>
                  {item.label}
                </Typography>
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

      {/* Right Side - Registration Form */}
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
            maxWidth: 500,
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
              Create Account
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#666",
                mb: 3
              }}
            >
              Join our secure cloud storage platform
            </Typography>
          </Box>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              width: "100%"
            }}
          >
            {/* Name Field */}
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Full Name"
              name="name"
              autoComplete="name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: "#4facfe" }} />
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

            {/* Email Field */}
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
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

            {/* Password Field */}
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="new-password"
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

            {/* Phone Number Field */}
            <TextField
              margin="normal"
              required
              fullWidth
              id="phone"
              label="Phone Number"
              name="phone"
              autoComplete="tel"
              value={phone}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                setPhone(value);
              }}
              inputProps={{
                inputMode: 'numeric',
                pattern: '[0-9]{10}',
                maxLength: 10,
                minLength: 10,
              }}
              error={phone.length > 0 && phone.length !== 10}
              helperText={phone.length > 0 && phone.length !== 10 ? 'Must be 10 digits' : ''}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon sx={{ color: "#4facfe" }} />
                  </InputAdornment>
                )
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#e0e0e0" },
                  "&:hover fieldset": { borderColor: "#4facfe" },
                  "&.Mui-focused fieldset": { borderColor: "#4facfe" },
                  "&.Mui-error fieldset": { borderColor: "#ff6b6b" }
                }
              }}
            />

            {/* Referral Code Field */}
            <TextField
              margin="normal"
              fullWidth
              id="referral"
              label="Referral Code (optional)"
              name="referral"
              autoComplete="off"
              value={referral}
              onChange={e => setReferral(e.target.value)}
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
                  <span style={{ opacity: 0 }}>Create Account</span>
                </>
              ) : (
                <>
                  <UploadIcon sx={{ mr: 1 }} />
                  Create Account
                </>
              )}
            </Button>

            {/* Free Storage Message */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="body1" sx={{ color: '#666', fontWeight: 500 }}>
                <span style={{ verticalAlign: 'middle', marginRight: 6, color: '#4facfe' }}>ⓘ</span>
                Register now and get
                <span style={{ color: '#4facfe', fontWeight: 'bold', marginLeft: 6 }}>15GB free storage!</span>
              </Typography>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Link
                component="button"
                variant="body2"
                sx={{
                  color: "#4facfe",
                  textDecoration: "none",
                  fontWeight: "500",
                  cursor: "pointer",
                  "&:hover": { textDecoration: "underline" }
                }}
                onClick={() => navigate("/login")}
              >
                Already have an account? Login
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
      
      <ToastContainer
        position="top-right"
        autoClose={600}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </Box>
  );
};

export default RegisterForm;
import React from "react";
import { Box, Button, Typography, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { keyframes } from "@emotion/react";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";

const Landing = () => {
  const navigate = useNavigate();

  const cloudImages = [
    "https://cdn-icons-png.flaticon.com/512/2920/2920244.png",
    "https://cdn-icons-png.flaticon.com/512/1005/1005141.png",
    "https://cdn-icons-png.flaticon.com/512/2921/2921228.png"
  ];

  // Animations
  const float = keyframes`
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  `;
  const pulseGlow = keyframes`
    0% { box-shadow: 0 0 0 0 rgba(79,172,254,0.45); }
    70% { box-shadow: 0 0 0 18px rgba(79,172,254,0); }
    100% { box-shadow: 0 0 0 0 rgba(79,172,254,0); }
  `;
  const shimmer = keyframes`
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  `;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
        position: "relative",
        overflow: "hidden",
        px: 2
        
        
      }}

      
      
    >
      {/* Decorative blurred gradients */}
      <Box sx={{ position: "absolute", width: 420, height: 420, borderRadius: "50%", top: -90, left: -90, background: "radial-gradient(circle at 30% 30%, rgba(79,172,254,0.35), rgba(0,0,0,0))", filter: "blur(30px)" }} />
      <Box sx={{ position: "absolute", width: 520, height: 520, borderRadius: "50%", bottom: -120, right: -120, background: "radial-gradient(circle at 70% 70%, rgba(0,242,254,0.3), rgba(0,0,0,0))", filter: "blur(32px)" }} />

      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "url('https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=1600&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.1,
          filter: "blur(2px)"
        }}
        display={{ xs: "none", md: "block" , sm: "justify-content" }}
        justifyContent={{ xs: "center", md: "flex-start" }}
        alignItems={{ xs: "center", md: "flex-start" }}
        position={{ xs: "absolute", md: "relative" }}
        top={{ xs: 0, md: "auto" }}
        left={{ xs: 0, md: "auto" }}
        right={{ xs: 0, md: "auto" }}
        bottom={{ xs: 0, md: "auto" }}
      />

      <Paper
        elevation={24}
        sx={{
          width: "100%",
          maxWidth: 960,
          borderRadius: 3,
          overflow: "hidden",
          position: "relative",
          zIndex: 2,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.15)",
          backdropFilter: "blur(16px)"
        }}
      >
        {/* Animated top gradient bar */}
        <Box sx={{ height: 4, background: "linear-gradient(90deg, #4facfe, #00f2fe, #4facfe)", backgroundSize: "200% 100%", animation: `${shimmer} 6s ease infinite` }} />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.2fr 1fr" },
            alignItems: "stretch"
          }}
        >
          <Box sx={{ p: { xs: 4, md: 6 }, display: "flex", flexDirection: "column", alignItems: { xs: "center", md: "flex-start" } }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3, width: "100%", justifyContent: { xs: "center", md: "flex-start" } }}>
              <Box
                component="img"
                src="./src/assets/Kensdrive logo.png"
                alt="KensDrive"
                sx={{ height: 48, filter: "brightness(0) invert(1)" }}
              />
              <Typography
                variant="h6"
                sx={{ color: "#e6f7ff", letterSpacing: 0.5, opacity: 0.9, textAlign: { xs: "center", md: "left" } }}
              >
                KensDrive Cloud
              </Typography>
            </Box>

            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                lineHeight: 1.15,
                mb: 2,
                background: "linear-gradient(45deg, #4facfe, #00f2fe)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: { xs: "1.85rem", sm: "2.25rem", md: "2.75rem" },
                textAlign: { xs: "center", md: "left" }
              }}
            >
              Secure cloud storage for your photos, videos and files
            </Typography>

            <Typography sx={{ color: "#d1d5db", mb: 4, maxWidth: 520, fontSize: { xs: 14, md: 16 }, textAlign: { xs: "center", md: "left" } }}>
              Access your content anywhere, anytime. Simple sharing, strong security, and
              15GB free to get started.
            </Typography>

            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: { xs: "center", md: "flex-start" }, width: "100%" }}>
              <Button
                onClick={() => navigate("/login")}
                variant="contained"
                sx={{
                  py: 1.25,
                  px: 3,
                  fontWeight: 700,
                  textTransform: "none",
                  background: "linear-gradient(45deg, #4facfe, #00f2fe)",
                  boxShadow: "0 12px 30px rgba(79,172,254,0.35)",
                  borderRadius: 2,
                  animation: `${pulseGlow} 3.5s ease-out infinite`,
                  width: { xs: "100%", sm: "auto" },
                  maxWidth: { xs: 420, sm: "none" }
                }}
              >
                <LoginIcon sx={{ mr: 1 }} /> Login
              </Button>
              <Button
                onClick={() => navigate("/register")}
                variant="outlined"
                sx={{
                  py: 1.25,
                  px: 3,
                  fontWeight: 700,
                  textTransform: "none",
                  color: "#e6f7ff",
                  borderColor: "#4facfe",
                  borderRadius: 2,
                  ":hover": { borderColor: "#00f2fe", background: "rgba(79,172,254,0.12)" },
                  width: { xs: "100%", sm: "auto" },
                  maxWidth: { xs: 420, sm: "none" }
                }}
              >
                <PersonAddAlt1Icon sx={{ mr: 1 }} /> Register
              </Button>
            </Box>

            {/* Floating icons */}
            <Box sx={{ display: "flex", gap: 2, mt: 5, flexWrap: "wrap", justifyContent: { xs: "center", md: "flex-start" }, width: "100%" }}>
              {cloudImages.map((src, i) => (
                <Box
                  key={i}
                  sx={{
                    width: { xs: 56, md: 72 },
                    height: { xs: 56, md: 72 },
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "inset 0 0 24px rgba(79,172,254,0.15)",
                    animation: `${float} ${3 + i}s ease-in-out infinite`
                  }}
                >
                  <Box component="img" src={src} alt="icon" sx={{ width: { xs: 28, md: 36 }, height: { xs: 28, md: 36 }, filter: "brightness(1) invert(1)" }} />
                </Box>
              ))}
            </Box>

            {/* Trust stats */}
            <Box sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr" },
              gap: 2,
              mt: 5,
              color: "#e6f7ff"
            }}>
              {[{
                value: "15GB",
                label: "Free storage"
              },{
                value: "99.99%",
                label: "Uptime"
              }].map((item, idx) => (
                <Box key={idx} sx={{
                  p: 2,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 2,
                  textAlign: "center"
                }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, background: "linear-gradient(45deg, #4facfe, #00f2fe)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{item.value}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>{item.label}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Box
            sx={{
              p: { xs: 4, md: 6 },
              borderLeft: { md: "1px solid rgba(255,255,255,0.12)" },
              background: "linear-gradient(180deg, rgba(79,172,254,0.12), rgba(0,0,0,0))"
            }}
          >
            <Typography variant="h5" sx={{ color: "#e6f7ff", fontWeight: 700, mb: 2 }}>
              Why KensDrive?
            </Typography>
            <Box sx={{ display: "grid", gap: 2 }}>
              {["Access from any device", "Bank-level encryption", "Share with anyone", "Fast uploads/downloads"].map((text, idx) => (
                <Box key={idx} sx={{
                  color: "#d1d5db",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  p: 2,
                  borderRadius: 2
                }}>• {text}</Box>
              ))}
            </Box>

            {/* Mini testimonials */}
            <Box sx={{ mt: 4, display: "grid", gap: 2 }}>
              {["Lightning fast and super secure!", "The UI is clean and intuitive."].map((quote, i) => (
                <Box key={i} sx={{
                  p: 2,
                  borderRadius: 2,
                  background: "rgba(0,0,0,0.25)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#e5e7eb",
                  fontStyle: "italic"
                }}>
                  “{quote}”
                  <Box sx={{ mt: 1, opacity: 0.7, fontSize: 12 }}>— Verified user</Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Landing;



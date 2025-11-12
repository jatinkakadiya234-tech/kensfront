import React, { useState, useRef, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";
import {
  Sms as SmsIcon,
  Cloud as CloudIcon,
  Timer as TimerIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Apihelper } from "../service/ApiHelper";

const OtpVerification = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  const { email, phone, userData } = location.state || {};

  // Countdown timer
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // ✅ Auto move to next & handle paste full OTP
  const handleOtpChange = (index, value) => {
    if (!/^[0-9]*$/.test(value)) return; // allow only numbers

    // Handle paste (if user pastes full 6 digits)
    if (value.length > 1) {
      const values = value.slice(0, 6).split("");
      setOtp(values);
      inputRefs.current[values.length - 1]?.focus();
      return;
    }

    // Normal typing
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move focus to next input automatically
    if (value && index < 5) {
      requestAnimationFrame(() => {
        inputRefs.current[index + 1]?.focus();
      });
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      return toast.error("Please enter complete OTP");
    }

    try {
      setLoading(true);
      const result = await Apihelper.verifyOtp({
        email: email || userData?.email,
        otp: otpString,
        userData,
      });

      if (result.status === 201) {
        toast.success("Registration successful!");
        navigate("/login");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setResendLoading(true);
      await Apihelper.resendOtp({ email: email || userData?.email });
      toast.success("OTP sent successfully!");
      setTimer(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (error) {
      toast.error("Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        background:
          "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Left Side */}
      <Box
        sx={{
          flex: 1,
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          zIndex: 2,
          padding: { xs: 2, md: 4 },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: { xs: 20, md: 40 },
            left: { xs: 20, md: 40 },
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box
            component="img"
            src="https://idr01.zata.ai/kenskensdrive/thumbnails/1759582246304-627777139.png"
            alt="CloudDrive"
            sx={{
              height: 50,
              filter: "brightness(0) invert(1)",
            }}
          />
        </Box>

        <Box sx={{ textAlign: "center", color: "white", maxWidth: 500 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: "bold",
              mb: 3,
              fontSize: { xs: "2rem", md: "3rem" },
              textShadow: "3px 3px 6px rgba(0,0,0,0.7)",
              background: "linear-gradient(45deg, #4facfe, #00f2fe)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Verify Your Account
          </Typography>

          <Typography
            variant="h5"
            sx={{
              mb: 4,
              fontSize: { xs: "1.2rem", md: "1.5rem" },
              opacity: 0.9,
              textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
            }}
          >
            Secure your cloud storage access
          </Typography>

          <Box
            sx={{
              mt: 4,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              alignItems: "center",
            }}
          >
            {[
              "📱 OTP sent to your phone",
              "🔐 Secure verification process",
              "⚡ Quick and easy setup",
              "☁️ Access your files securely",
            ].map((feature, index) => (
              <Typography
                key={index}
                variant="body1"
                sx={{
                  opacity: 0.8,
                  textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                }}
              >
                {feature}
              </Typography>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Right Side - OTP Form */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: { xs: 2, md: 4 },
          position: "relative",
          zIndex: 2,
        }}
      >
        <Paper
          elevation={24}
          sx={{
            width: "100%",
            maxWidth: { xs: 350, md: 450 },
            padding: { xs: 3, md: 4 },
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            borderRadius: 3,
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
          }}
        >
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <SmsIcon sx={{ fontSize: 60, color: "#4facfe", mb: 2 }} />
            <Typography
              variant="h4"
              sx={{
                color: "#1a1a2e",
                fontWeight: "bold",
                mb: 1,
                fontSize: { xs: "1.8rem", md: "2.125rem" },
              }}
            >
              Verify OTP
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#666",
                mb: 3,
              }}
            >
              Enter the 6-digit code sent to {phone || email}
            </Typography>
          </Box>

          {/* OTP Input */}
          <Box
            sx={{
              display: "flex",
              gap: { xs: 0.5, md: 1 },
              justifyContent: "center",
              mb: 3,
            }}
          >
            {otp.map((digit, index) => (
              <TextField
                key={index}
                inputRef={(el) => (inputRefs.current[index] = el)}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                inputProps={{
                  maxLength: 1,
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                  style: {
                    textAlign: "center",
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                    padding: "8px",
                  },
                }}
                sx={{
                  width: { xs: 40, md: 45 },
                  height: { xs: 45, md: 50 },
                  "& .MuiOutlinedInput-root": {
                    height: "100%",
                    "& fieldset": {
                      borderColor: "#e0e0e0",
                      borderWidth: 2,
                    },
                    "&:hover fieldset": { borderColor: "#4facfe" },
                    "&.Mui-focused fieldset": {
                      borderColor: "#4facfe",
                      borderWidth: 2,
                    },
                  },
                }}
              />
            ))}
          </Box>

          {/* Timer */}
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography
              variant="body2"
              sx={{
                color: "#666",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
              }}
            >
              <TimerIcon sx={{ fontSize: 16 }} />
              {canResend ? "You can resend OTP now" : `Resend OTP in ${timer}s`}
            </Typography>
          </Box>

          {/* Verify Button */}
          <Button
            fullWidth
            variant="contained"
            onClick={handleVerifyOtp}
            disabled={loading}
            sx={{
              mb: 2,
              py: { xs: 1.2, md: 1.5 },
              background: "linear-gradient(45deg, #4facfe, #00f2fe)",
              borderRadius: 2,
              fontSize: { xs: "1rem", md: "1.1rem" },
              fontWeight: "bold",
              textTransform: "none",
              boxShadow: "0 8px 25px rgba(79,172,254,0.3)",
              "&:hover": {
                background: "linear-gradient(45deg, #3a8dcf, #00c9e0)",
                boxShadow: "0 12px 35px rgba(79,172,254,0.4)",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : (
              <>
                <CloudIcon sx={{ mr: 1 }} />
                Verify & Complete Registration
              </>
            )}
          </Button>

          {/* Resend Button */}
          <Button
            fullWidth
            variant="outlined"
            onClick={handleResendOtp}
            disabled={!canResend || resendLoading}
            sx={{
              py: { xs: 1, md: 1.2 },
              borderColor: "#4facfe",
              color: "#4facfe",
              borderRadius: 2,
              fontSize: { xs: "0.9rem", md: "1rem" },
              fontWeight: "bold",
              textTransform: "none",
              "&:hover": {
                borderColor: "#3a8dcf",
                backgroundColor: "rgba(79,172,254,0.1)",
              },
              "&:disabled": {
                borderColor: "#ccc",
                color: "#999",
              },
            }}
          >
            {resendLoading ? (
              <CircularProgress size={20} sx={{ color: "#4facfe" }} />
            ) : (
              "Resend OTP"
            )}
          </Button>
        </Paper>
      </Box>

      <ToastContainer autoClose={600} />
    </Box>
  );
};

export default OtpVerification;

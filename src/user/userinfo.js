import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  TextField,
  Button,
  Grid,
  Divider,
  IconButton,
  Card,
  CardContent,
  Chip
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  Security as SecurityIcon
} from "@mui/icons-material";

const UserInfo = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    // Get user info from localStorage
    const storedUserInfo = localStorage.getItem("userinfo");
    if (storedUserInfo) {
      const user = JSON.parse(storedUserInfo);
      setUserInfo(user);
      setEditData(user);
    }
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // Update localStorage with new data
    localStorage.setItem("userinfo", JSON.stringify(editData));
    setUserInfo(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(userInfo);
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!userInfo) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6">No user information found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: "bold", color: "#1a1a2e" }}>
            User Profile
          </Typography>
          {!isEditing ? (
            <IconButton onClick={handleEdit} sx={{ color: "#ff6b6b" }}>
              <EditIcon />
            </IconButton>
          ) : (
            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton onClick={handleSave} sx={{ color: "#4caf50" }}>
                <SaveIcon />
              </IconButton>
              <IconButton onClick={handleCancel} sx={{ color: "#f44336" }}>
                <CancelIcon />
              </IconButton>
            </Box>
          )}
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Profile Section */}
        <Grid container spacing={3}>
          {/* Avatar and Basic Info */}
          <Grid item xs={12} md={4}>
            <Card sx={{ textAlign: "center", p: 2 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: "auto",
                  mb: 2,
                  bgcolor: "#ff6b6b",
                  fontSize: "3rem"
                }}
              >
                {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : <PersonIcon />}
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                {userInfo.name || "User"}
              </Typography>
              <Chip
                label={userInfo.role || "User"}
                color={userInfo.role === "admin" ? "error" : "primary"}
                sx={{ mt: 1 }}
              />
            </Card>
          </Grid>

          {/* User Details */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              {/* Name */}
              <Grid item xs={12}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <PersonIcon sx={{ mr: 1, color: "#666" }} />
                  <Typography variant="subtitle2" sx={{ color: "#666" }}>
                    Full Name
                  </Typography>
                </Box>
                {isEditing ? (
                  <TextField
                    fullWidth
                    value={editData.name || ""}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    variant="outlined"
                    size="small"
                  />
                ) : (
                  <Typography variant="body1" sx={{ fontWeight: "500" }}>
                    {userInfo.name || "Not provided"}
                  </Typography>
                )}
              </Grid>

              {/* Email */}
              <Grid item xs={12}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <EmailIcon sx={{ mr: 1, color: "#666" }} />
                  <Typography variant="subtitle2" sx={{ color: "#666" }}>
                    Email Address
                  </Typography>
                </Box>
                {isEditing ? (
                  <TextField
                    fullWidth
                    value={editData.email || ""}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    variant="outlined"
                    size="small"
                    type="email"
                  />
                ) : (
                  <Typography variant="body1" sx={{ fontWeight: "500" }}>
                    {userInfo.email || "Not provided"}
                  </Typography>
                )}
              </Grid>

              {/* Phone */}
              <Grid item xs={12}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <PhoneIcon sx={{ mr: 1, color: "#666" }} />
                  <Typography variant="subtitle2" sx={{ color: "#666" }}>
                    Phone Number
                  </Typography>
                </Box>
                {isEditing ? (
                  <TextField
                    fullWidth
                    value={editData.phone || ""}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    variant="outlined"
                    size="small"
                  />
                ) : (
                  <Typography variant="body1" sx={{ fontWeight: "500" }}>
                    {userInfo.phone || "Not provided"}
                  </Typography>
                )}
              </Grid>

              {/* Role */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <SecurityIcon sx={{ mr: 1, color: "#666" }} />
                  <Typography variant="subtitle2" sx={{ color: "#666" }}>
                    Role
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: "500" }}>
                  {userInfo.role || "User"}
                </Typography>
              </Grid>

              {/* User ID */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <CalendarIcon sx={{ mr: 1, color: "#666" }} />
                  <Typography variant="subtitle2" sx={{ color: "#666" }}>
                    User ID
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: "500" }}>
                  {userInfo.id || userInfo._id || "N/A"}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Additional Info */}
        {userInfo.exp && (
          <Box sx={{ mt: 3, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ color: "#666", mb: 1 }}>
              Token Expiry
            </Typography>
            <Typography variant="body2">
              {new Date(userInfo.exp * 1000).toLocaleString()}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default UserInfo;
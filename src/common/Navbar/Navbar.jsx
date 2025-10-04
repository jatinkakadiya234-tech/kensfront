import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import SegmentOutlinedIcon from '@mui/icons-material/SegmentOutlined';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import CloudIcon from '@mui/icons-material/Cloud';
import StorageIcon from '@mui/icons-material/Storage';
import SecurityIcon from '@mui/icons-material/Security';
import Path from '../Path';
import { Box } from '@mui/material';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [userInfo, setUserInfo] = useState(null);

  const isHome = location.pathname === Path.home;

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token && token !== 'undefined' && token !== 'null');
    const userStr = localStorage.getItem('userinfo');
    if (userStr) {
      try {
        setUserInfo(JSON.parse(userStr));
      } catch {
        setUserInfo(null);
      }
    } else {
      setUserInfo(null);
    }
  }, [location.pathname]);

  const handleUserClick = () => {
    navigate(isLoggedIn ? "/userprofile" : "/login");
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('videoHistory');
    setIsLoggedIn(false);
    setOpen(false);
    navigate('/login');
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) setOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [open]);

  return (
    <div
      className="w-full z-50 fixed top-0 left-0 shadow-lg border-b backdrop-blur-md"
      style={{
        background: "rgba(15, 32, 39, 0.95)",
        borderColor: "rgba(79, 172, 254, 0.3)"
      }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-4 md:py-2">
          <div className="flex items-center gap-2">
          <Box
            component="img"
            src="https://idr01.zata.ai/kenskensdrive/thumbnails/1759582246304-627777139.png"
            alt="CloudDrive"
            sx={{
              height: 50,
              filter: "brightness(0) invert(1)"
            }}
          />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => navigate(Path.home)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${location.pathname === Path.home
                  ? 'text-white'
                  : 'text-gray-300 hover:text-white'
                }`}
              style={{
                background: location.pathname === Path.home
                  ? "linear-gradient(45deg, #4facfe, #00f2fe)"
                  : "transparent"
              }}
            >
              <CloudIcon className="mr-2" />
              My Files
            </button>

            <button
              onClick={() => navigate(Path.movie)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${location.pathname === Path.movie
                  ? 'text-white'
                  : 'text-gray-300 hover:text-white'
                }`}
              style={{
                background: location.pathname === Path.movie
                  ? "linear-gradient(45deg, #4facfe, #00f2fe)"
                  : "transparent"
              }}
            >
              <StorageIcon className="mr-2" />
              Storage
            </button>

            <button
              onClick={() => navigate('/subscription')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${location.pathname === '/subscription'
                  ? 'text-white'
                  : 'text-gray-300 hover:text-white'
                }`}
              style={{
                background: location.pathname === '/subscription'
                  ? "linear-gradient(45deg, #4facfe, #00f2fe)"
                  : "transparent"
              }}
            >
              <SecurityIcon className="mr-2" />
              Plans
            </button>


          </div>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                {/* Desktop User Actions - Hidden on Mobile */}
                <div className="hidden md:flex items-center gap-3">
                  <button
                    onClick={() => navigate('/userprofile')}
                    className="p-2 rounded-full transition-all duration-300 hover:scale-105 flex items-center justify-center"
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      minWidth: "40px",
                      minHeight: "40px"
                    }}
                    title="User Profile"
                    aria-label="User Profile"
                  >
                    <PersonIcon className="text-white" />
                  </button>

                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-lg font-medium text-white transition-all duration-300 hover:scale-105 flex items-center"
                    style={{
                      background: "linear-gradient(45deg, #4facfe, #00f2fe)",
                      boxShadow: "0 4px 15px rgba(79,172,254,0.3)"
                    }}
                  >
                    <LogoutIcon className="mr-2" />
                    Logout
                  </button>
                </div>

                {/* Mobile User Icon - Hidden on Desktop */}
               
              </>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 rounded-lg font-medium text-white transition-all duration-300 hover:scale-105"
                style={{
                  background: "linear-gradient(45deg, #4facfe, #00f2fe)",
                  boxShadow: "0 4px 15px rgba(79,172,254,0.3)"
                }}
              >
                <LoginIcon className="mr-1" />
                Login
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setOpen(true)}
              className="md:hidden p-2 rounded-lg transition-all duration-300 hover:scale-110"
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                color: "white"
              }}
            >
              <SegmentOutlinedIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Right Side Drawer */}
      {open && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Drawer */}
          <div
            className={`fixed top-0 right-0 h-screen w-80 max-w-[90vw] z-50 transform transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'
              }`}
            style={{
              background: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
              borderLeft: "1px solid rgba(79, 172, 254, 0.3)"
            }}
          >
            {/* Drawer Header - Fixed */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gradient-to-r from-[#0f2027] to-[#203a43]">
              <h2
                className="text-xl font-bold"
                style={{
                  background: "linear-gradient(45deg, #4facfe, #00f2fe)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}
              >
                CloudDrive Menu
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-white text-xl"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="h-full overflow-y-auto">
              {/* User Profile Section */}
              {isLoggedIn && userInfo && (
                <div className="p-6 border-b border-gray-700">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                      style={{
                        background: "linear-gradient(45deg, #4facfe, #00f2fe)"
                      }}
                    >
                      {userInfo.name ? userInfo.name.charAt(0).toUpperCase() :
                        userInfo.username ? userInfo.username.charAt(0).toUpperCase() :
                          userInfo.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">
                        {userInfo.name || userInfo.username || 'User'}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {userInfo.email}
                      </p>
                      <p className="text-blue-300 text-xs mt-1">
                        {userInfo.storage ? `Storage: ${userInfo.storage}` : '15GB Free Storage'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <div className="p-6 space-y-4">
                <button
                  onClick={() => { setOpen(false); navigate(Path.home); }}
                  className={`w-full flex items-center text-left px-4 py-3 rounded-lg font-medium transition-all duration-300 ${location.pathname === Path.home
                      ? 'text-white'
                      : 'text-gray-300 hover:text-white'
                    }`}
                  style={{
                    background: location.pathname === Path.home
                      ? "linear-gradient(45deg, #4facfe, #00f2fe)"
                      : "rgba(255, 255, 255, 0.05)"
                  }}
                >
                  <CloudIcon className="mr-3" />
                  My Files
                </button>

                <button
                  onClick={() => { setOpen(false); navigate(Path.movie); }}
                  className={`w-full flex items-center text-left px-4 py-3 rounded-lg font-medium transition-all duration-300 ${location.pathname === Path.movie
                      ? 'text-white'
                      : 'text-gray-300 hover:text-white'
                    }`}
                  style={{
                    background: location.pathname === Path.movie
                      ? "linear-gradient(45deg, #4facfe, #00f2fe)"
                      : "rgba(255, 255, 255, 0.05)"
                  }}
                >
                  <StorageIcon className="mr-3" />
                  Storage
                </button>

                <button
                  onClick={() => { setOpen(false); navigate('/subscription'); }}
                  className={`w-full flex items-center text-left px-4 py-3 rounded-lg font-medium transition-all duration-300 ${location.pathname === '/subscription'
                      ? 'text-white'
                      : 'text-gray-300 hover:text-white'
                    }`}
                  style={{
                    background: location.pathname === '/subscription'
                      ? "linear-gradient(45deg, #4facfe, #00f2fe)"
                      : "rgba(255, 255, 255, 0.05)"
                  }}
                >
                  <SecurityIcon className="mr-3" />
                  Plans
                </button>

               
              </div>

              {/* User Actions Section */}
              {isLoggedIn && (
                <div className="p-6 space-y-4 border-t border-gray-700">
                  <button
                    onClick={() => { setOpen(false); navigate('/userprofile'); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-300 hover:text-white transition-all duration-300 hover:bg-white/5"
                  >
                    <PersonIcon />
                    User Profile
                  </button>

               

                  <button
                    onClick={() => { setOpen(false); handleLogout(); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-white transition-all duration-300 hover:scale-105"
                    style={{
                      background: "linear-gradient(45deg, #4facfe, #00f2fe)",
                      boxShadow: "0 4px 15px rgba(79,172,254,0.3)"
                    }}
                  >
                    <LogoutIcon />
                    Logout
                  </button>
                </div>
              )}

              {/* Guest Actions */}
              {!isLoggedIn && (
                <div className="p-6 border-t border-gray-700">
                  <button
                    onClick={() => { setOpen(false); navigate('/login'); }}
                    className="w-full px-4 py-3 rounded-lg font-medium text-white transition-all duration-300 hover:scale-105"
                    style={{
                      background: "linear-gradient(45deg, #4facfe, #00f2fe)",
                      boxShadow: "0 4px 15px rgba(79,172,254,0.3)"
                    }}
                  >
                    <LoginIcon className="mr-2" />
                    Login
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
import React, { useState, useRef, useEffect } from 'react';
import {
  Edit as EditIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Language as LanguageIcon,
  CreditCard as CreditCardIcon,
  Shield as ShieldIcon,
  PlayArrow as PlayArrowIcon,
  History as HistoryIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Favorite as FavoriteIcon
} from '@mui/icons-material';
import { Snackbar, Alert } from '@mui/material';
import { Apihelper } from '../common/service/ApiHelper';

export default function UserScreen() {
  const [user, setUser] = useState({
    premiumType: 'yearly',
    autoplayControls: true,
    watchHistory: true,
    maturitySettings: 'All Maturity Ratings'
  });

  async function fetchUser() {
    try {
      let token = JSON.parse(localStorage.getItem("token"));
      let user = await Apihelper.userInfo(token);
      setUser(user.data.decode);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    let token = JSON.parse(localStorage.getItem("token"));
    if (token) {
      fetchUser();
    }
  }, []);

  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUser(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await Apihelper.editUser(user, user._id);
    setIsEditing(false);
    fetchUser();
    setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser(prev => ({ ...prev, userimage: reader.result }));
        setSnackbar({ open: true, message: 'Profile picture updated!', severity: 'success' });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <div className="min-h-screen py-8 px-2 md:px-0" style={{ background: 'linear-gradient(135deg, #0f0f0f 0%, #1f1f1f 100%)' }}>
      <div className="container mx-auto flex flex-col lg:flex-row gap-8 mt-12">
        {/* Profile Card */}
        <div className="w-full lg:w-1/3 flex flex-col">
          <div className="rounded-2xl overflow-hidden shadow-lg bg-[#232323] bg-opacity-95 backdrop-blur-md flex flex-col h-full">
            {/* Admin Button (only for admin users) */}
            {user.role === 'admin' && (
              <div className="flex justify-end p-4">
                <a
                  href="/admin"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-full shadow-lg transition"
                  style={{ fontSize: '1.1rem' }}
                >
                  Admin
                </a>
              </div>
            )}
            <div className="relative">
              <div className="w-full h-[140px] bg-gradient-to-r from-red-700 to-pink-300"></div>
              <div className="flex justify-center -mt-[70px]">
                <div className="relative inline-block">
                  <img
                    src={user.userimage}
                    alt="Profile"
                    className="rounded-full border-4 border-black w-[140px] h-[140px] object-cover cursor-pointer transition-transform duration-300 shadow-lg"
                    onClick={handleImageClick}
                    onMouseOver={e => e.target.style.transform = 'scale(1.05)'}
                    onMouseOut={e => e.target.style.transform = 'scale(1)'}
                  />
                  <div
                    className="absolute bottom-2 right-2 bg-red-600 rounded-full p-2 border-2 border-black cursor-pointer shadow"
                    onClick={handleImageClick}
                  >
                    <PhotoCameraIcon style={{ fontSize: '20px' }} />
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
              </div>
            </div>
            <div className="text-center pt-4 pb-6 px-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-white mb-1 text-2xl font-bold tracking-tight">{user.name}</h3>
                <div className="inline-block bg-red-600 px-3 py-1 rounded-full mb-2 text-white text-xs font-semibold">
                  {user.isPremium ? 'Premium' : 'Free'} Member
                </div>
                {user.isPremium && (
                  <div className="text-white text-xs mb-2">
                    {user.premiumType && (user.premiumType.charAt(0).toUpperCase() + user.premiumType.slice(1))} Plan<br />
                    Expires: {user.premiumExpiresAt && new Date(user.premiumExpiresAt).toLocaleDateString()}
                  </div>
                )}
                <p className="text-white text-xs mb-4">
                  Member since {user.createdAt && new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex justify-around mt-2">
                <div className="text-center">
                  <div className="bg-black text-white rounded-full mb-1 p-3 flex items-center justify-center shadow">
                    <NotificationsIcon />
                  </div>
                  <div className="text-white text-xs">Notifications</div>
                </div>
                <div className="text-center">
                  <div className="bg-black text-white rounded-full mb-1 p-3 flex items-center justify-center shadow">
                    <SettingsIcon />
                  </div>
                  <div className="text-white text-xs">Settings</div>
                </div>
                <div className="text-center">
                  <div className="bg-black text-white rounded-full mb-1 p-3 flex items-center justify-center shadow">
                    <FavoriteIcon />
                  </div>
                  <div className="text-white text-xs">Favorites</div>
                </div>
              </div>
            </div>
          </div>
          {/* Go to Dashboard Button (only for admin users) */}
          {user.role === 'admin' && (
            <div className="flex justify-center mt-6">
              <a
                href="/admin/dashboard"
                className="bg-red-700 hover:bg-red-800 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition text-lg"
              >
                Go to Dashboard
              </a>
            </div>
          )}
        </div>

        {/* Account Settings */}
        <div className="w-full lg:w-2/3 flex flex-col">
          <div className="rounded-2xl shadow-lg bg-[#232323] bg-opacity-95 backdrop-blur-md flex flex-col h-full">
            <div className="py-4 px-6 border-b border-transparent bg-transparent">
              <h4 className="text-white m-0 flex items-center gap-2 text-xl font-semibold">
                <SettingsIcon /> Account Settings
              </h4>
            </div>
            <div className="px-6 py-4 flex-1 flex flex-col justify-between">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="py-3">
                  <div className="flex flex-wrap gap-4">
                    <div className="w-full md:w-1/2">
                      <label className="block text-white mb-1">Name</label>
                      <div className="flex items-center bg-black rounded">
                        <span className="px-2"><EditIcon fontSize="small" style={{ color: '#dc3545' }} /></span>
                        <input
                          type="text"
                          className="flex-1 bg-black border-0 text-white px-2 py-2 rounded focus:outline-none"
                          name="name"
                          value={user.name || ''}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="w-full md:w-1/2">
                      <label className="block text-white mb-1">Email</label>
                      <div className="flex items-center bg-black rounded">
                        <span className="px-2"><EmailIcon fontSize="small" style={{ color: '#dc3545' }} /></span>
                        <input
                          type="email"
                          className="flex-1 bg-black border-0 text-white px-2 py-2 rounded focus:outline-none"
                          name="email"
                          value={user.email || ''}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="w-full md:w-1/2">
                      <label className="block text-white mb-1">Phone</label>
                      <div className="flex items-center bg-black rounded">
                        <span className="px-2"><PhoneIcon fontSize="small" style={{ color: '#dc3545' }} /></span>
                        <input
                          type="tel"
                          className="flex-1 bg-black border-0 text-white px-2 py-2 rounded focus:outline-none"
                          name="phonenumber"
                          value={user.phonenumber || ''}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="w-full md:w-1/2">
                      <label className="block text-white mb-1">Language</label>
                      <div className="flex items-center bg-black rounded">
                        <span className="px-2"><LanguageIcon fontSize="small" style={{ color: '#dc3545' }} /></span>
                        <select
                          className="flex-1 bg-black border-0 text-white px-2 py-2 rounded focus:outline-none"
                          name="language"
                          value={user.language || ''}
                          onChange={handleChange}
                        >
                          <option value="English">English</option>
                          <option value="Spanish">Spanish</option>
                          <option value="French">French</option>
                          <option value="German">German</option>
                        </select>
                      </div>
                    </div>
                    <div className="w-full">
                      <div className="p-4 rounded bg-black bg-opacity-20">
                        <h6 className="text-white mb-3">Preferences</h6>
                        <div className="flex items-center mb-3">
                          <input
                            type="checkbox"
                            className="form-checkbox h-5 w-5 text-red-600 rounded mr-2"
                            id="autoplayControls"
                            name="autoplayControls"
                            checked={user.autoplayControls}
                            onChange={handleChange}
                          />
                          <label className="text-white" htmlFor="autoplayControls">
                            Autoplay next episode
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="form-checkbox h-5 w-5 text-red-600 rounded mr-2"
                            id="watchHistory"
                            name="watchHistory"
                            checked={user.watchHistory}
                            onChange={handleChange}
                          />
                          <label className="text-white" htmlFor="watchHistory">
                            Save watch history
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      type="button"
                      className="border border-white text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-white hover:text-black transition"
                      onClick={() => setIsEditing(false)}
                    >
                      <CancelIcon fontSize="small" /> Cancel
                    </button>
                    <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-red-700 transition">
                      <SaveIcon fontSize="small" /> Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-wrap gap-4">
                  <div className="w-full md:w-1/2">
                    <div className="flex items-center gap-3 p-4 rounded h-full bg-black bg-opacity-20 transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
                      <div className="rounded-full flex items-center justify-center w-12 h-12 bg-red-600 bg-opacity-10">
                        <EmailIcon style={{ color: '#dc3545' }} />
                      </div>
                      <div>
                        <div className="text-white text-xs">Email</div>
                        <div className="text-white">{user.email}</div>
                      </div>
                    </div>
                  </div>
                  <div className="w-full md:w-1/2">
                    <div className="flex items-center gap-3 p-4 rounded h-full bg-black bg-opacity-20 transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
                      <div className="rounded-full flex items-center justify-center w-12 h-12 bg-red-600 bg-opacity-10">
                        <PhoneIcon style={{ color: '#dc3545' }} />
                      </div>
                      <div>
                        <div className="text-white text-xs">Phone</div>
                        <div className="text-white">{user.phonenumber}</div>
                      </div>
                    </div>
                  </div>
                  <div className="w-full md:w-1/2">
                    <div className="flex items-center gap-3 p-4 rounded h-full bg-black bg-opacity-20 transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
                      <div className="rounded-full flex items-center justify-center w-12 h-12 bg-red-600 bg-opacity-10">
                        <CreditCardIcon style={{ color: '#dc3545' }} />
                      </div>
                      <div>
                        <div className="text-white text-xs">Subscription</div>
                        <div className="text-white">
                          {user.isPremium ? (
                            <>
                              {user.premiumType && (user.premiumType.charAt(0).toUpperCase() + user.premiumType.slice(1))} Plan
                              <div className="text-white text-xs">
                                Expires: {user.premiumExpiresAt && new Date(user.premiumExpiresAt).toLocaleDateString()}
                              </div>
                            </>
                          ) : (
                            'Free Plan'
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-full md:w-1/2">
                    <div className="flex items-center gap-3 p-4 rounded h-full bg-black bg-opacity-20 transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
                      <div className="rounded-full flex items-center justify-center w-12 h-12 bg-red-600 bg-opacity-10">
                        <LanguageIcon style={{ color: '#dc3545' }} />
                      </div>
                      <div>
                        <div className="text-white text-xs">Language</div>
                        <div className="text-white">{user.language}</div>
                      </div>
                    </div>
                  </div>
                  <div className="w-full">
                    <div className="p-4 rounded bg-black bg-opacity-20">
                      <h6 className="text-white mb-4">Preferences</h6>
                      <div className="flex flex-wrap gap-4">
                        <div className="w-full md:w-1/2">
                          <div className="flex items-center gap-3">
                            <div className="rounded-full flex items-center justify-center w-10 h-10 bg-red-600 bg-opacity-10">
                              <PlayArrowIcon style={{ color: '#dc3545' }} />
                            </div>
                            <div>
                              <div className="text-white text-xs">Autoplay Controls</div>
                              <div className="text-white">{user.autoplayControls ? 'Enabled' : 'Disabled'}</div>
                            </div>
                          </div>
                        </div>
                        <div className="w-full md:w-1/2">
                          <div className="flex items-center gap-3">
                            <div className="rounded-full flex items-center justify-center w-10 h-10 bg-red-600 bg-opacity-10">
                              <HistoryIcon style={{ color: '#dc3545' }} />
                            </div>
                            <div>
                              <div className="text-white text-xs">Watch History</div>
                              <div className="text-white">{user.watchHistory ? 'Saved' : 'Not saved'}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end px-6 pb-4">
              {!isEditing && (
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-red-700 transition"
                  onClick={() => setIsEditing(true)}
                >
                  <EditIcon fontSize="small" /> Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
} 
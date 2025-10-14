import React, { useRef, useState } from 'react';
import { FaLock, FaExpand, FaCompress } from 'react-icons/fa';
import { FaUnlock } from "react-icons/fa6";
import { useParams, useNavigate } from 'react-router-dom';


export default function MovieDetailsScreen() {
  const [locked, setLocked] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [requestedMobileFullscreen, setRequestedMobileFullscreen] = useState(false);
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const url = useParams()
  // Dummy movie details for demonstration
  const movieDetails = {
    name: 'Movie Name',
    streamingUrl: 'https://videos.pexels.com/video-files/19022223/19022223-uhd_2560_1440_60fps.mp4',
  };

  // Get video URL from query param if present
  let videoUrl = movieDetails.streamingUrl;
  try {
    const params = new URLSearchParams(window.location.search);
    const videoParam = params.get('video');
    if (videoParam) {
      videoUrl = videoParam;
    }
  } catch { }

  // Fullscreen handlers
  const handleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (containerRef.current.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen();
      } else if (containerRef.current.mozRequestFullScreen) {
        containerRef.current.mozRequestFullScreen();
      } else if (containerRef.current.msRequestFullscreen) {
        containerRef.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  // Mobile helpers
  const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isAndroid = () => /Android/.test(navigator.userAgent);
  const isSmallScreen = () => window.matchMedia && window.matchMedia('(max-width: 768px)').matches;

  const requestMobileFullscreenAndLandscape = async () => {
    if (!videoRef.current) return;
    try {
      // Prefer native video fullscreen on iOS
      if (isIOS() && videoRef.current.webkitEnterFullscreen) {
        videoRef.current.webkitEnterFullscreen();
      } else if (!document.fullscreenElement && containerRef.current) {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else if (containerRef.current.webkitRequestFullscreen) {
          await containerRef.current.webkitRequestFullscreen();
        } else if (containerRef.current.mozRequestFullScreen) {
          await containerRef.current.mozRequestFullScreen();
        } else if (containerRef.current.msRequestFullscreen) {
          await containerRef.current.msRequestFullscreen();
        }
      }
      // Try to lock orientation to landscape when possible
      if (screen.orientation && screen.orientation.lock) {
        try {
          await screen.orientation.lock('landscape');
        } catch {}
      }
      setRequestedMobileFullscreen(true);
    } catch {}
  };

  // Auto-attempt on first user gesture for mobile
  React.useEffect(() => {
    if (!isSmallScreen()) return;
    const container = containerRef.current;
    if (!container) return;

    const onFirstInteract = () => {
      if (!requestedMobileFullscreen) {
        requestMobileFullscreenAndLandscape();
      }
    };

    container.addEventListener('touchstart', onFirstInteract, { once: true, passive: true });
    container.addEventListener('click', onFirstInteract, { once: true });

    return () => {
      container.removeEventListener('touchstart', onFirstInteract);
      container.removeEventListener('click', onFirstInteract);
    };
  }, [requestedMobileFullscreen]);
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      // If we just entered fullscreen on mobile, try locking orientation
      if (!!document.fullscreenElement && isSmallScreen()) {
        if (screen.orientation && screen.orientation.lock) {
          screen.orientation.lock('landscape').catch(() => {});
        }
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  React.useEffect(() => {
    // Premium check logic from localStorage
    try {
      const userInfo = localStorage.getItem('userinfo');
      if (userInfo) {
        const user = JSON.parse(userInfo);
        setIsPremium(!!user.isPremium);
        console.log('User premium status:', user.isPremium);
      } else {
        // If no user info, assume non-premium
        setIsPremium(false);
      }
    } catch (error) {
      console.error('Error parsing user info:', error);
      setIsPremium(false);
    }
  }, []);

  React.useEffect(() => {
    if (isPremium) {
      // Show premium popup immediately for premium users
      setShowPopup(true);
    } else if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      const timer = setTimeout(() => {
        videoRef.current.pause();
        setShowPopup(true);
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [isPremium, videoUrl]);

  return (
    <div
      ref={containerRef}
      className=" relative w-[100%] h-screen overflow-hidden bg-[#37353E] flex flex-col justify-center items-center "
      style={{ padding: 0, margin: 0 }}
    >
      {/* Movie Name */}
      {/* Video Player */}
      <div className="relative w-[100%] h-full flex justify-center items-center  ">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-cover"
          controls={!locked}
          autoPlay
          playsInline={false}
          onPlay={() => {
            if (isSmallScreen() && !requestedMobileFullscreen) {
              requestMobileFullscreenAndLandscape();
            }
          }}
          controlsList={isPremium ? "nofullscreen download" : "nofullscreen nodownload"}
        // style={{ minHeight: '100vh', minWidth: '100vw', background: 'black' }}
        />
        {/* Popup for premium users */}
        {/* {showPopup && isPremium && (
          <div className="fixed inset-0 z-50 flex items-center justify-centerbg-[#0f2027] bg-opacity-90">
            <div className="bg-gradient-to-br from-[#2c5364] to-[#203a43] rounded-lg shadow-lg p-8 max-w-sm w-full text-center border border-[#715A5A]">
              <h2 className="text-xl font-bold mb-4 text-white">🎉 Premium Access</h2>
              <p className="mb-6 text-[#d3dad9]">Welcome! You have premium access to watch unlimited content without restrictions.</p>
              <button
                className="bg-[#715A5A] text-white px-6 py-2 rounded hover:bg-[#44444E] font-semibold transition-colors"
                onClick={() => {
                  setShowPopup(false);
                }}
              >
                Start Watching
              </button>
            </div>
          </div>
        )} */}
        
        {/* Popup for non-premium users after 15s */}
       {showPopup && !isPremium && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f2027] bg-opacity-95">
    <div className="bg-gradient-to-br from-[#2c5364] to-[#203a43] rounded-xl shadow-2xl p-8 max-w-sm w-full text-center border-2 border-[#4facfe]">
      <div className="mb-4 flex justify-center">
        <div className="w-16 h-16 bg-gradient-to-r from-[#4facfe] to-[#00f2fe] rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      </div>
      <h2 className="text-2xl font-bold mb-4 text-white">Premium Upgrade Required</h2>
      <p className="mb-6 text-[#c3dce3]">This is a preview feature. Upgrade to premium to access the full content.</p>
      <button
        className="bg-gradient-to-r from-[#4facfe] to-[#00f2fe] text-white px-8 py-3 rounded-full font-semibold transition-all hover:scale-105 hover:shadow-lg transform duration-300"
        onClick={() => {
          setShowPopup(false);
          navigate('/subscription');
        }}
      >
        Upgrade Now
      </button>
    
    </div>
  </div>
)}
        {/* Center Lock Button (only when locked) */}
        {locked && (
          <button
            onClick={() => setLocked(false)}
            className="absolute z-40 flex items-center justify-center  top-[80%] left-[1%] bg-[#37353E]/70 text-white p-2 rounded-full hover:bg-[#37353E]/90 focus:outline-none"
            style={{
              // top: '90%',
              // left: '3%',
              // transform: 'translate(-20%, -20%)',

              cursor: 'pointer',
            }}
            title="Unlock"
          >
            {/* <FaUnlock size={20} color="green" /> */}
            <FaLock size={20} color="white" />
          </button>
        )}
        {/* Fullscreen Button (top right) */}
        <button
          onClick={handleFullscreen}

          className="absolute top-[80%] left-16 bg-[#37353E]/70 text-white p-2 rounded-full hover:bg-[#37353E]/90 focus:outline-none z-10"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? <FaCompress size={20} /> : <FaExpand size={20} />}
        </button>
        {/* Lock Button (top right, only when unlocked) */}
        {!locked && (
          <button
            onClick={() => setLocked(true)}
            className="absolute top-[80%] left-[1%] bg-[#37353E]/70 text-white p-2 rounded-full hover:bg-[#37353E]/90 focus:outline-none z-10"
            title="Lock"
          >
            <FaUnlock size={20} color="silver" />
          </button>
        )}
        {/* Overlay to block interaction when locked */}
        {locked && (
          <div
            className="absolute inset-0 z-30"
            style={{ pointerEvents: 'auto', background: 'transparent' }}
            onClick={e => e.stopPropagation()}
          ></div>
        )}
      </div>
    </div>
  );
} 
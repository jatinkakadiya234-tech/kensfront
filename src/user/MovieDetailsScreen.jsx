import React, { useRef, useState, useEffect } from "react";
import Hls from "hls.js";
import { useNavigate } from "react-router-dom";
import VideoPlayer from "../components/VideoPlayer";

export default function MovieDetailsScreen() {
  const [showPopup, setShowPopup] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [showNoMoviePopup, setShowNoMoviePopup] = useState(false);

  const videoRef = useRef(null);
  const navigate = useNavigate();

  // ✅ Redirect Telegram in-app browser → Chrome or Safari
  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const isTelegram = /Telegram/i.test(ua);
    if (isTelegram) {
      const url = window.location.href;
      if (/iPhone|iPad|iPod/i.test(ua)) {
        window.location.href = `https://www.google.com/search?q=${encodeURIComponent(
          url
        )}`;
      } else {
        window.location.href = `intent://${url.replace(
          /^https?:\/\//,
          ""
        )}#Intent;scheme=https;package=com.android.chrome;end`;
      }
    }
  }, []);

  // ✅ Get video URL from query param or use default
  let videoUrl = "";
  try {
    const params = new URLSearchParams(window.location.search);
    const videoParam = params.get("video");
    if (videoParam) {
      videoUrl = decodeURIComponent(videoParam);
      console.log("Decoded video URL:", videoUrl);
    }
  } catch (error) {
    console.error("Error getting video URL:", error);
  }

  const hasVideo = !!videoUrl;
  const isHls = /\.m3u8(\?|$)/i.test(videoUrl);

  // Show no movie popup if no video URL
  useEffect(() => {
    if (!videoUrl) {
      setShowNoMoviePopup(true);
    }
  }, [videoUrl]);

  // ✅ Initialize video playback - removed complex HLS logic for MP4
  useEffect(() => {
    if (!showVideo) return;
    const video = videoRef.current;
    if (!video) return;

    // Direct MP4 playback
    video.src = videoUrl;
    video.load();
    video.play().catch((e) => {
      console.warn("Autoplay blocked:", e);
      setVideoError(false); // Don't treat autoplay block as error
    });
  }, [showVideo, videoUrl]);

  // ✅ Premium check
  useEffect(() => {
    try {
      // Check URL parameter first
      const params = new URLSearchParams(window.location.search);
      const premiumParam = params.get("premium");
      
      if (premiumParam === "true") {
        setIsPremium(true);
      } else {
        // Fallback to localStorage
        const userInfo = localStorage.getItem("userinfo");
        if (userInfo) {
          const user = JSON.parse(userInfo);
          setIsPremium(!!user.isPremium);
        }
      }
    } catch (error) {
      console.error("Error checking premium status:", error);
    }
  }, []);

  // ✅ Non-premium 5-second limit
  useEffect(() => {
    if (isPremium || !hasVideo || !showVideo) return;
    const video = videoRef.current;
    if (!video) return;

    const timer = setTimeout(() => {
      video.pause();
      setShowPopup(true);
      setIsFullscreen(true);
    }, 5000); // 5 seconds

    return () => clearTimeout(timer);
  }, [isPremium, videoUrl, hasVideo, showVideo]);

  const handlePlayClick = () => {
    const video = videoRef.current;
    setShowVideo(true);
    setVideoError(false);

    setTimeout(() => {
      if (video) {
        video.muted = false;
        video.play().catch((e) => {
          console.log("Play error:", e);
          setVideoError(true);
        });
      }
    }, 500);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setIsFullscreen(false);
    setShowVideo(false);
  };

  const handleFullscreenChange = (isFS) => {
    setIsFullscreen(isFS);
    
    // Show popup when non-premium user exits fullscreen but keep fullscreen
    if (!isPremium && !isFS && showVideo) {
      setShowPopup(true);
      setIsFullscreen(true); // Keep fullscreen active
    }
  };

  const handleVideoError = (e) => {
    console.error("Video Error:", e.target.error);
    setVideoError(true);
  };

  return (
    <div className="relative w-full h-screen flex flex-col justify-center items-center bg-[#0f171e] overflow-hidden">
      {!hasVideo && (
        <div className="flex flex-col justify-center items-center h-full text-white">
          <div className="bg-[#1a242f] rounded-lg p-6 border border-[#00a8e1] text-center max-w-md">
            <img
              src="https://cdn-icons-png.flaticon.com/512/1661/1661901.png"
              alt="No Video"
              className="w-16 h-16 mx-auto mb-4 opacity-80"
            />
            <h3 className="text-2xl font-bold mb-3 text-white">Video Not Available</h3>
            <p className="text-gray-400">
              The video content for this movie is currently unavailable.
            </p>
          </div>
        </div>
      )}

      {hasVideo && (
        <div className="relative w-full h-full flex justify-center items-center">
          {!showVideo ? (
            // ✅ Amazon Prime Style Thumbnail
            <div
              className="relative w-full h-full bg-black flex items-center justify-center cursor-pointer group"
              onClick={handlePlayClick}
            >
              {/* Background Blur Effect */}
              <div 
                className="absolute inset-0 bg-cover bg-center blur-sm scale-110"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1489599809505-7c8c62a0f4d4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
                }}
              ></div>
              
              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-black/70"></div>
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/50"></div>

              {/* Play Button - Amazon Prime Style */}
              <div className="relative z-20 flex flex-col items-center">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all duration-300 backdrop-blur-sm border border-white/30">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                    <svg
                      className="w-10 h-10 text-[#00a8e1] ml-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                
                {/* Text */}
                <div className="mt-6 text-center">
                  <p className="text-white text-lg font-semibold tracking-wide">
                    Watch Now
                  </p>
                  <p className="text-gray-300 text-sm mt-2">
                    Click to start streaming
                  </p>
                </div>
              </div>

              {/* Movie Info Bottom */}
       

              {/* Prime Logo */}
              <div className="absolute top-6 left-6 z-20">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#00a8e1] to-[#00d4ff] rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">Prime</span>
                  </div>
                  <span className="text-white font-semibold text-sm">Included with Prime</span>
                </div>
              </div>
            </div>
          ) : (
            // ✅ Enhanced Video Player
            <VideoPlayer
              videoUrl={videoUrl}
              thumbnailUrl="https://images.unsplash.com/photo-1489599809505-7c8c62a0f4d4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
              animeId={123}
              hasNextEpisode={true}
              hasPreviousEpisode={false}
              onNextEpisode={() => console.log("Next episode")}
              onPreviousEpisode={() => console.log("Previous episode")}
              onFullscreenChange={handleFullscreenChange}
              isPremium={isPremium}
            />
          )}

          {/* ✅ Fullscreen Premium Popup */}
          
        </div>
      )}

      {/* No Movie Popup */}
      {showNoMoviePopup && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-[#0f171e] to-[#1a242f] p-2 sm:p-4">
          <div className="w-full max-w-xs sm:max-w-lg mx-auto bg-gradient-to-br from-[#0f171e] to-[#1a242f] rounded-xl sm:rounded-2xl p-3 sm:p-6 overflow-y-auto max-h-screen border border-white/10">
            <div className="text-center mb-4 sm:mb-8">
              <div className="w-12 h-12 sm:w-24 sm:h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-6 shadow-2xl">
                <svg className="w-6 h-6 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <h1 className="text-lg sm:text-4xl font-bold text-white mb-2 sm:mb-4">
                No Movie Available
              </h1>
              
              <p className="text-sm sm:text-xl text-gray-300 mb-1 sm:mb-2">
                This movie is currently unavailable
              </p>
              
              <p className="text-gray-400 mb-3 sm:mb-6 text-xs sm:text-base px-1 sm:px-2">
                The movie you're trying to watch is not available at the moment. Please try again later or contact support.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:gap-4 w-full">
              <button
                onClick={() => window.history.back()}
                className="w-full bg-gradient-to-r from-[#00a8e1] to-[#00d4ff] text-white py-3 px-6 rounded-lg font-bold text-base hover:from-[#0098d1] hover:to-[#00c4ef] transition-all duration-300 shadow-2xl"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
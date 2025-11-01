import React, { useRef, useState, useEffect } from "react";
import Hls from "hls.js";
import { useNavigate } from "react-router-dom";

export default function MovieDetailsScreen() {
  const [showPopup, setShowPopup] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoError, setVideoError] = useState(false);

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

  // ✅ Get video URL from query param
  let videoUrl = "";
  try {
    const params = new URLSearchParams(window.location.search);
    const videoParam = params.get("video");
    if (videoParam) videoUrl = videoParam;
  } catch (error) {
    console.error("Error getting video URL:", error);
  }

  const hasVideo = Boolean(videoUrl);
  const isHls = hasVideo && /\.m3u8(\?|$)/i.test(videoUrl);

  // ✅ Initialize video playback
  useEffect(() => {
    if (!showVideo || !hasVideo) return;
    const video = videoRef.current;
    if (!video) return;

    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isHls) {
      if (isSafari) {
        video.src = videoUrl;
        video.load();
        video
          .play()
          .catch((e) => console.warn("Autoplay blocked on Safari:", e));
      } else if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          debug: false,
        });
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video
            .play()
            .catch((e) => console.warn("Autoplay blocked (HLS):", e));
        });
        
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error("HLS Error:", data);
          setVideoError(true);
        });
        
        return () => hls.destroy();
      } else {
        video.src = videoUrl;
        video.load();
      }
    } else {
      video.src = videoUrl;
      video.load();
    }
  }, [showVideo, hasVideo, isHls, videoUrl]);

  // ✅ Premium check
  useEffect(() => {
    try {
      const userInfo = localStorage.getItem("userinfo");
      if (userInfo) {
        const user = JSON.parse(userInfo);
        setIsPremium(!!user.isPremium);
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

              {/* Movie Info Bottom - FIXED: Added back the movie info */}
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white z-20">
                <div className="max-w-4xl mx-auto">
                  <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">
                    The Grand Adventure
                  </h1>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="bg-[#00a8e1] text-white px-3 py-1 rounded text-sm font-semibold">
                      HD
                    </span>
                    <span className="text-gray-300">2024</span>
                    <span className="text-gray-300">2h 18m</span>
                    <span className="border border-gray-400 px-2 py-1 rounded text-xs text-gray-300">
                      13+
                    </span>
                  </div>
                  <p className="text-gray-300 text-lg max-w-2xl">
                    An epic journey through uncharted territories. Join our heroes as they discover the secrets of the ancient world.
                  </p>
                </div>
              </div>

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
            // ✅ Video Player
            <div className="relative w-full h-full bg-black">
              {videoError && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="text-white text-center">
                    <p className="text-xl">Video playback error</p>
                    <button 
                      onClick={() => setShowVideo(false)}
                      className="mt-4 bg-[#00a8e1] px-4 py-2 rounded"
                    >
                      Go Back
                    </button>
                  </div>
                </div>
              )}
              <video
                ref={videoRef}
                className="w-full h-full object-contain"
                controls
                playsInline
                muted={false}
                preload="auto"
                autoPlay
                controlsList="nodownload"
                onError={handleVideoError}
              />
            </div>
          )}

          {/* ✅ Fullscreen Premium Popup */}
          {showPopup && !isPremium && isFullscreen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#0f171e] to-[#1a242f]">
              <div className="w-full h-full flex flex-col items-center justify-center p-6 max-w-2xl mx-auto">
                
                {/* Prime Logo - FIXED: w-30 to w-32 */}
                <div className="mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-12 bg-gradient-to-r from-[#00a8e1] to-[#00d4ff] rounded-lg flex items-center justify-center shadow-2xl">
                      <span className="text-white font-bold text-lg">kensdrive</span>
                    </div>
                    <div>
                      <h2 className="text-white text-2xl font-bold">kensdrive Video</h2>
                      <p className="text-gray-400 text-sm">Exclusive content</p>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="text-center mb-8">
                  <div className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  
                  <h1 className="text-4xl font-bold text-white mb-4">
                    Premium Required
                  </h1>
                  
                  <p className="text-xl text-gray-300 mb-2">
                    Upgrade to continue watching
                  </p>
                  
                  <p className="text-gray-400 mb-6 max-w-md mx-auto">
                    Enjoy unlimited access to all our premium content without any interruptions. 
                    Start your free trial today!
                  </p>

                  {/* Features */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
                    <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="w-8 h-8 bg-[#00a8e1] rounded-full flex items-center justify-center mx-auto mb-2">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-white text-sm">HD Quality</p>
                    </div>
                    
                    <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="w-8 h-8 bg-[#00a8e1] rounded-full flex items-center justify-center mx-auto mb-2">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-white text-sm">No Ads</p>
                    </div>
                    
                    <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="w-8 h-8 bg-[#00a8e1] rounded-full flex items-center justify-center mx-auto mb-2">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-white text-sm">All Content</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                  <button
                    onClick={() => navigate("/subscription")}
                    className="flex-1 bg-gradient-to-r from-[#00a8e1] to-[#00d4ff] text-white py-4 px-8 rounded-lg font-bold text-lg hover:from-[#0098d1] hover:to-[#00c4ef] transition-all duration-300 shadow-2xl"
                  >
                    Get Premium 
                  </button>
                  
                  <button
                    onClick={handleClosePopup}
                    className="flex-1 bg-white/10 text-white py-4 px-8 rounded-lg font-semibold text-lg border border-white/20 hover:bg-white/20 transition-all duration-300"
                  >
                    Maybe Later
                  </button>
                </div>

                {/* Footer Text */}
                <p className="text-gray-500 text-sm mt-8 text-center">
                  First month free, then $9.99/month. Cancel anytime.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
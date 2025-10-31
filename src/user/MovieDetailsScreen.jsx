import React, { useRef, useState, useEffect } from "react";
import Hls from "hls.js";
import { useNavigate } from "react-router-dom";

export default function MovieDetailsScreen() {
  const [showPopup, setShowPopup] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  const videoRef = useRef(null);
  const navigate = useNavigate();
  // Get video URL from query param
  let videoUrl = "";
  try {
    const params = new URLSearchParams(window.location.search);
    const videoParam = params.get("video");
    if (videoParam) videoUrl = videoParam;
  } catch {}

  const hasVideo = Boolean(videoUrl);
  const isHls = hasVideo && /\.m3u8(\?|$)/i.test(videoUrl);

  // Initialize video source
useEffect(() => {
  if (!showVideo || !hasVideo) return;

  const video = videoRef.current;
  if (!video) return;

  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  // Direct HLS support for Safari and iPhone browsers
  if (isHls) {
    if (isSafari) {
      video.src = videoUrl;
      video.load();
      video.play().catch(e => console.warn("Autoplay blocked:", e));
    } else if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        debug: false,
      });
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(e => console.warn("Play error:", e));
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


  // Premium check
  useEffect(() => {
    try {
      const userInfo = localStorage.getItem("userinfo");
      if (userInfo) {
        const user = JSON.parse(userInfo);
        setIsPremium(!!user.isPremium);
      }
    } catch {}
  }, []);

  // Non-premium timer
  useEffect(() => {
    if (isPremium || !hasVideo || !showVideo) return;
    const video = videoRef.current;
    if (!video) return;

    const timer = setTimeout(() => {
      video.pause();
      setShowPopup(true);
    }, 10000);
    return () => clearTimeout(timer);
  }, [isPremium, videoUrl, hasVideo, showVideo]);

  const handlePlayClick = () => {
    setShowVideo(true);
  };

  return (
    <div className="relative w-full h-screen flex flex-col justify-center items-center bg-[#37353E] overflow-hidden">
      {!hasVideo && (
        <div className="flex flex-col justify-center items-center h-full text-white">
          <div className="bg-[#2c5364] rounded-lg p-4 border border-[#4facfe] text-center max-w-md">
            <img
              src="https://cdn-icons-png.flaticon.com/512/1661/1661901.png"
              alt="No Video"
              className="w-12 h-12 mx-auto mb-2"
            />
            <h3 className="text-xl font-semibold mb-2">Video Not Available</h3>
            <p className="text-sm text-gray-300">
              The video content for this movie is currently unavailable.
            </p>
          </div>
        </div>
      )}

      {hasVideo && (
        <div className="relative w-full h-full flex justify-center items-center">
          {!showVideo ? (
            // YouTube-like thumbnail with play button
            <div
              className="relative w-full h-full bg-black flex items-center justify-center cursor-pointer"
              onClick={handlePlayClick}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60"></div>

              {/* Play Button */}
              <div className="relative z-10 w-20 h-20 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors shadow-2xl">
                <svg
                  className="w-8 h-8 text-white ml-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>

              {/* Movie Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
                <h1 className="text-2xl md:text-4xl font-bold mb-2">
                  Movie Title
                </h1>
                <p className="text-sm md:text-base text-gray-300 mb-4">
                  Click to play this movie
                </p>
              </div>
            </div>
          ) : (
          <video
  ref={videoRef}
  className="w-full h-full object-cover"
  controls
  playsInline
  webkit-playsinline="true"
  preload="auto"

  autoPlay={true}
  controlsList="nodownload unmuted"
  onError={(e) => console.error("Video Error:", e.target.error)}
/>

          )}

          {/* Premium popup */}
          {showPopup && !isPremium && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95">
              <div className="bg-gradient-to-br from-[#2c5364] to-[#203a43] rounded-xl shadow-2xl p-8 max-w-sm w-full text-center border-2 border-[#4facfe]">
                <h3 className="text-xl font-bold text-white mb-4">
                  Premium Required
                </h3>
                <p className="text-gray-300 mb-6">
                  Upgrade to premium to continue watching
                </p>
                <button
                  onClick={() => navigate("/subscription")}
                  className="w-full bg-gradient-to-r from-[#4facfe] to-[#00f2fe] text-white py-3 px-6 rounded-lg font-semibold"
                >
                  Get Premium
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

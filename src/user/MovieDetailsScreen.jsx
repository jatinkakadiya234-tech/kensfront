import React, { useRef, useState, useEffect } from "react";
import Hls from "hls.js";
import { useNavigate } from "react-router-dom";

export default function MovieDetailsScreen() {
  const [showPopup, setShowPopup] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  const videoRef = useRef(null);
  const navigate = useNavigate();

  // ✅ Redirect Telegram in-app browser → Chrome or Safari
  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const isTelegram = /Telegram/i.test(ua);
    if (isTelegram) {
      const url = window.location.href;
      if (/iPhone|iPad|iPod/i.test(ua)) {
        // iPhone Safari redirect
        window.location.href = `https://www.google.com/search?q=${encodeURIComponent(
          url
        )}`;
      } else {
        // Android → Chrome redirect
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
  } catch {}

  const hasVideo = Boolean(videoUrl);
  const isHls = hasVideo && /\.m3u8(\?|$)/i.test(videoUrl);

  // ✅ Initialize video playback (Safari + HLS.js)
  useEffect(() => {
    if (!showVideo || !hasVideo) return;
    const video = videoRef.current;
    if (!video) return;

    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isHls) {
      if (isSafari) {
        // Native Safari HLS
        video.src = videoUrl;
        video.load();
        video
          .play()
          .catch((e) => console.warn("Autoplay blocked on Safari:", e));
      } else if (Hls.isSupported()) {
        // Android / Chrome HLS.js
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
    } catch {}
  }, []);

  // ✅ Non-premium 10-second limit
  useEffect(() => {
    if (isPremium || !hasVideo || !showVideo) return;
    const video = videoRef.current;
    if (!video) return;

    const timer = setTimeout(() => {
      video.pause();
      setShowPopup(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, [isPremium, videoUrl, hasVideo, showVideo]);

  const handlePlayClick = () => {
    const video = videoRef.current;
    setShowVideo(true);

    // ✅ Unmute and play after interaction (solves iPhone mute issue)
    setTimeout(() => {
      if (video) {
        video.muted = false;
        video.play().catch((e) => console.log("Play error:", e));
      }
    }, 500);
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
            // ✅ Thumbnail view before play
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

              {/* Movie Info */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
                <h1 className="text-2xl md:text-4xl font-bold mb-2">
                  Movie Title
                </h1>
                <p className="text-sm md:text-base text-gray-300 mb-4">
                  Tap to start playing
                </p>
              </div>
            </div>
          ) : (
            // ✅ Video Player
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              controls
              playsInline
              muted={false}
              preload="auto"
              autoPlay
              controlsList="nodownload"
              onError={(e) => console.error("Video Error:", e.target.error)}
            />
          )}

          {/* ✅ Premium popup */}
          {showPopup && !isPremium && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95">
              <div className="bg-gradient-to-br from-[#2c5364] to-[#203a43] rounded-xl shadow-2xl p-8 max-w-sm w-full text-center border-2 border-[#4facfe]">
                <h3 className="text-xl font-bold text-white mb-4">
                  Premium Required
                </h3>
                <p className="text-gray-300 mb-6">
                  Upgrade to premium to continue watching.
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

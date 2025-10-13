import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function MovieDetailsScreen() {
  const [showPopup, setShowPopup] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  // ✅ Get video URL from query param
  const params = new URLSearchParams(window.location.search);
  const videoUrl = params.get("video") || "";

  const hasVideo = Boolean(videoUrl);

  // ✅ Load user info (for premium check)
  useEffect(() => {
    try {
      const userInfo = localStorage.getItem("userinfo");
      if (userInfo) {
        const user = JSON.parse(userInfo);
        setIsPremium(!!user.isPremium);
      }
    } catch {
      setIsPremium(false);
    }
  }, []);

  // ✅ Show popup after 15s for non-premium users
  useEffect(() => {
    if (!hasVideo) return;

    if (isPremium) {
      setShowPopup(false);
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
    <div className="w-full h-screen bg-black flex flex-col items-center justify-center">
      {/* 🎬 Simple Video Player */}
      {hasVideo ? (
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain bg-black"
          controls
          autoPlay
          playsInline
          webkit-playsinline="true"
          controlsList={isPremium ? "nodownload" : "nodownload"}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-white">
          <img
            src="https://cdn-icons-png.flaticon.com/512/1661/1661901.png"
            alt="No Video"
            className="w-16 h-16 mb-4"
          />
          <h3 className="text-xl font-semibold">Video Not Available</h3>
        </div>
      )}

      {/* 🔒 Premium Popup */}
      {showPopup && !isPremium && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/90 z-50">
          <div className="bg-[#2c5364] rounded-xl p-8 max-w-sm text-center border-2 border-[#4facfe]">
            <h2 className="text-2xl font-bold text-white mb-2">
              Premium Upgrade Required
            </h2>
            <p className="text-gray-300 mb-6">
              Upgrade to premium to watch the full video.
            </p>
            <button
              onClick={() => navigate("/subscription")}
              className="bg-gradient-to-r from-[#4facfe] to-[#00f2fe] px-8 py-3 rounded-full text-white font-semibold"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

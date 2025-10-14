import React, { useRef, useState, useEffect } from "react";
import { FaLock, FaExpand, FaCompress } from "react-icons/fa";
import { FaUnlock } from "react-icons/fa6";
import { useParams, useNavigate } from "react-router-dom";

export default function MovieDetailsScreen() {
  const [locked, setLocked] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [requestedMobileFullscreen, setRequestedMobileFullscreen] = useState(false);
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const url = useParams();

  // ✅ Telegram Detection + Chrome Redirect
  useEffect(() => {
    const ua = navigator.userAgent || "";
    const isTelegram = ua.toLowerCase().includes("telegram");

    if (isTelegram) {
      const currentUrl = window.location.href;
      const chromeUrl = "googlechrome://" + currentUrl.replace(/^https?:\/\//, "");

      // --- Try Chrome redirect (Android)
      let redirected = false;
      try {
        window.location.href = chromeUrl;
        redirected = true;
      } catch (err) {
        console.log("Chrome redirect error:", err);
      }

      // --- Fallback: If Telegram blocked redirect, show manual open dialog
      setTimeout(() => {
        if (!document.hidden && !redirected) {
          const confirmOpen = window.confirm(
            "Telegram may block fullscreen video.\nOpen this in Chrome for best experience?"
          );
          if (confirmOpen) {
            window.open(currentUrl, "_blank");
          }
        }
      }, 1200);
    }
  }, []);

  // Dummy movie data
  const movieDetails = {
    title: "Movie Title",
    poster:
      "https://via.placeholder.com/500x750/37353E/FFFFFF?text=No+Poster+Available",
    description: "This is a movie description that would normally appear here.",
    year: "2024",
    rating: "PG-13",
  };

  // --- Get video param ---
  let videoUrl = "";
  try {
    const params = new URLSearchParams(window.location.search);
    const videoParam = params.get("video");
    if (videoParam) {
      videoUrl = videoParam;
    }
  } catch {}

  const hasVideo = Boolean(videoUrl);

  // --- Fullscreen logic ---
  const handleFullscreen = async () => {
    const element = videoRef.current || containerRef.current;
    if (!element) return;

    try {
      if (!isFullscreen) {
        if (isIOS() && videoRef.current?.webkitEnterFullscreen) {
          videoRef.current.webkitEnterFullscreen();
          return;
        }
        if (element.requestFullscreen) await element.requestFullscreen();
        else if (element.webkitRequestFullscreen) await element.webkitRequestFullscreen();
      } else {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if (document.webkitExitFullscreen) await document.webkitExitFullscreen();
      }
    } catch (error) {
      console.log("Fullscreen error:", error);
    }
  };

  const isIOS = () =>
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isSmallScreen = () =>
    window.matchMedia && window.matchMedia("(max-width: 768px)").matches;

  const requestMobileFullscreenAndLandscape = async () => {
    if (!videoRef.current) return;
    try {
      if (isIOS() && videoRef.current.webkitEnterFullscreen) {
        videoRef.current.webkitEnterFullscreen();
        setRequestedMobileFullscreen(true);
        return;
      }

      if (!document.fullscreenElement) {
        const element = containerRef.current;
        if (element.requestFullscreen) await element.requestFullscreen();
        else if (element.webkitRequestFullscreen) await element.webkitRequestFullscreen();
      }

      if (screen.orientation && screen.orientation.lock) {
        try {
          await screen.orientation.lock("landscape");
        } catch (e) {
          console.log("Orientation lock failed:", e);
        }
      }
      setRequestedMobileFullscreen(true);
    } catch (error) {
      console.log("Mobile fullscreen error:", error);
    }
  };

  useEffect(() => {
    if (!isSmallScreen() || !hasVideo) return;
    const container = containerRef.current;
    if (!container) return;

    const onFirstInteract = () => {
      if (!requestedMobileFullscreen) {
        requestMobileFullscreenAndLandscape();
      }
    };

    container.addEventListener("touchstart", onFirstInteract, { once: true, passive: true });
    container.addEventListener("click", onFirstInteract, { once: true });

    return () => {
      container.removeEventListener("touchstart", onFirstInteract);
      container.removeEventListener("click", onFirstInteract);
    };
  }, [requestedMobileFullscreen, hasVideo]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isInFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement
      );
      setIsFullscreen(isInFullscreen);
      if (isInFullscreen && isSmallScreen()) {
        if (screen.orientation && screen.orientation.lock) {
          screen.orientation.lock("landscape").catch(() => {});
        }
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    try {
      const userInfo = localStorage.getItem("userinfo");
      if (userInfo) {
        const user = JSON.parse(userInfo);
        setIsPremium(!!user.isPremium);
      } else {
        setIsPremium(false);
      }
    } catch {
      setIsPremium(false);
    }
  }, []);

  useEffect(() => {
    if (isPremium && hasVideo) {
      setShowPopup(true);
    } else if (videoRef.current && hasVideo) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      const timer = setTimeout(() => {
        videoRef.current.pause();
        setShowPopup(true);
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [isPremium, videoUrl, hasVideo]);

  return (
    <div
      ref={containerRef}
      className="relative w-[100%] h-screen overflow-hidden bg-[#37353E] flex flex-col justify-center items-center"
    >
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
              The video content for this movie is currently unavailable. Please check back later.
            </p>
          </div>
        </div>
      )}

      {hasVideo && (
        <div className="relative w-full h-full flex justify-center items-center">
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-cover"
            controls={!locked}
            autoPlay
            playsInline
            preload="metadata"
            controlsList="nodownload"
            onPlay={() => {
              if (isSmallScreen() && !requestedMobileFullscreen) {
                requestMobileFullscreenAndLandscape();
              }
            }}
          />

          {showPopup && !isPremium && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f2027] bg-opacity-95">
              <div className="bg-gradient-to-br from-[#2c5364] to-[#203a43] rounded-xl shadow-2xl p-8 max-w-sm w-full text-center border-2 border-[#4facfe]">
                <div className="mb-4 flex justify-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#4facfe] to-[#00f2fe] rounded-full flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-4 text-white">
                  Premium Upgrade Required
                </h2>
                <p className="mb-6 text-[#c3dce3]">
                  This is a preview feature. Upgrade to premium to access full content.
                </p>
                <button
                  className="bg-gradient-to-r from-[#4facfe] to-[#00f2fe] text-white px-8 py-3 rounded-full font-semibold hover:scale-105 transition-all"
                  onClick={() => navigate("/subscription")}
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          )}

          {!locked && (
            <button
              onClick={handleFullscreen}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? <FaCompress size={20} /> : <FaExpand size={20} />}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

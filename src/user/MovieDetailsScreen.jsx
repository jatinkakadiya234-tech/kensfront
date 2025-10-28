import React, { useRef, useState, useEffect } from "react";
import Hls from "hls.js";
import { FaExpand, FaCompress } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";

export default function MovieDetailsScreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [requestedMobileFullscreen, setRequestedMobileFullscreen] = useState(false);
  const [isTelegramApp, setIsTelegramApp] = useState(false);
  const [platform, setPlatform] = useState(""); // "ios" | "android" | "other"

  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  // --- Dummy movie details ---
  const movieDetails = {
    title: "Movie Title",
    poster: "https://via.placeholder.com/500x750/37353E/FFFFFF?text=No+Poster+Available",
    description: "This is a movie description that would normally appear here.",
  };

  // --- Get video URL from query param ---
  let videoUrl = "";
  try {
    const params = new URLSearchParams(window.location.search);
    const videoParam = params.get("video");
    if (videoParam) videoUrl = videoParam;
  } catch {}

  const hasVideo = Boolean(videoUrl);

  const isHls = hasVideo && /\.m3u8(\?|$)/i.test(videoUrl);

  // --- Telegram in-app browser detection ---
  useEffect(() => {
    const ua = navigator.userAgent || "";
    const isTg = /Telegram/i.test(ua);
    const isiOS = /iPhone|iPad|iPod/i.test(ua);
    const isAnd = /Android/i.test(ua);
    setIsTelegramApp(isTg);
    setPlatform(isiOS ? "ios" : isAnd ? "android" : "other");
  }, []);

  // --- Fullscreen handler ---
  const handleFullscreen = async () => {
    const element = videoRef.current || containerRef.current;
    if (!element) return;

    try {
      if (!isFullscreen) {
        if (videoRef.current?.webkitEnterFullscreen) {
          videoRef.current.webkitEnterFullscreen();
          return;
        }
        if (element.requestFullscreen) await element.requestFullscreen();
        else if (element.webkitRequestFullscreen) await element.webkitRequestFullscreen();
      } else {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if (document.webkitExitFullscreen) await document.webkitExitFullscreen();
      }
    } catch (err) {
      console.log("Fullscreen error:", err);
    }
  };

  const isSmallScreen = () => window.matchMedia && window.matchMedia("(max-width: 768px)").matches;

  const requestMobileFullscreen = async () => {
    if (!videoRef.current) return;
    try {
      if (videoRef.current.webkitEnterFullscreen) {
        videoRef.current.webkitEnterFullscreen();
      } else if (containerRef.current?.requestFullscreen) {
        await containerRef.current.requestFullscreen();
      }
      setRequestedMobileFullscreen(true);
    } catch (err) {
      console.log("Mobile fullscreen error:", err);
    }
  };

  // --- Play video & mobile fullscreen auto ---
  useEffect(() => {
    if (!isSmallScreen() || !hasVideo) return;

    const container = containerRef.current;
    if (!container) return;

    const onFirstInteract = () => {
      if (!requestedMobileFullscreen) requestMobileFullscreen();
    };

    container.addEventListener("touchstart", onFirstInteract, { once: true, passive: true });
    container.addEventListener("click", onFirstInteract, { once: true });

    return () => {
      container.removeEventListener("touchstart", onFirstInteract);
      container.removeEventListener("click", onFirstInteract);
    };
  }, [requestedMobileFullscreen, hasVideo]);

  // --- Initialize HLS if needed ---
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hasVideo) return;

    // If HLS source
    if (isHls) {
      const canPlayNative = video.canPlayType("application/vnd.apple.mpegurl");
      if (canPlayNative) {
        video.src = videoUrl;
      } else if (Hls.isSupported()) {
        const hls = new Hls({
          autoStartLoad: true,
          capLevelToPlayerSize: true,
          maxBufferLength: 30,
        });
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
        const onError = (event, data) => {
          if (data?.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                break;
            }
          }
        };
        hls.on(Hls.Events.ERROR, onError);
        return () => {
          hls.off(Hls.Events.ERROR, onError);
          hls.destroy();
        };
      } else {
        // Fallback: set src, some browsers may still try
        video.src = videoUrl;
      }
    } else {
      // Non-HLS: set src normally
      video.src = videoUrl;
    }
  }, [videoUrl, hasVideo, isHls]);

  // --- Fullscreen state change ---
  useEffect(() => {
    const handler = () => {
      const isInFullscreen = !!(
        document.fullscreenElement || document.webkitFullscreenElement
      );
      setIsFullscreen(isInFullscreen);
    };

    document.addEventListener("fullscreenchange", handler);
    document.addEventListener("webkitfullscreenchange", handler);
    return () => {
      document.removeEventListener("fullscreenchange", handler);
      document.removeEventListener("webkitfullscreenchange", handler);
    };
  }, []);

  // --- Premium check ---
  useEffect(() => {
    try {
      const userInfo = localStorage.getItem("userinfo");
      if (userInfo) {
        const user = JSON.parse(userInfo);
        setIsPremium(!!user.isPremium);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (isPremium || !hasVideo) return;
    const video = videoRef.current;
    if (!video) return;
    video.muted = true; // ensure autoplay works on mobile
    video.currentTime = 0;
    video.play().catch(() => {});
    const timer = setTimeout(() => {
      video.pause();
      setShowPopup(true);
    }, 15000);
    return () => clearTimeout(timer);
  }, [isPremium, videoUrl, hasVideo]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen flex flex-col justify-center items-center bg-[#37353E] overflow-hidden"
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
              The video content for this movie is currently unavailable.
            </p>
          </div>
        </div>
      )}

      {hasVideo && (
        <div className="relative w-full h-full flex justify-center items-center">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            controls
            autoPlay
            playsInline
            muted
            preload="metadata"
            controlsList="nodownload"
            onPlay={() => {
              if (isSmallScreen() && !requestedMobileFullscreen) requestMobileFullscreen();
              // If premium, allow audio after interaction
              if (isPremium && videoRef.current) {
                videoRef.current.muted = false;
              }
            }}
            onClick={() => {
              if (isPremium && videoRef.current) {
                videoRef.current.muted = false;
              }
            }}
          />

          {isTelegramApp && (
            <div className="absolute top-0 left-0 right-0 z-20 p-3 flex flex-col gap-2 items-center bg-black bg-opacity-70 text-white">
              <div className="text-sm">
                Telegram in-app browser ma fullscreen limited che. Best experience mate {platform === "ios" ? "Safari" : platform === "android" ? "Chrome" : "external browser"} ma kholo.
              </div>
              <div className="flex gap-3">
                <button
                  className="px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-sm"
                  onClick={() => {
                    try {
                      window.open(window.location.href, "_blank");
                    } catch {}
                  }}
                >
                  Open in {platform === "ios" ? "Safari" : "Chrome"}
                </button>
                <button
                  className="px-3 py-1 rounded bg-gray-600 hover:bg-gray-700 text-sm"
                  onClick={handleFullscreen}
                >
                  Go Fullscreen
                </button>
              </div>
            </div>
          )}

          {showPopup && !isPremium && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f2027] bg-opacity-95">
              <div className="bg-gradient-to-br from-[#2c5364] to-[#203a43] rounded-xl shadow-2xl p-8 max-w-sm w-full text-center border-2 border-[#4facfe]">
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

          <button
            onClick={handleFullscreen}
            className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <FaCompress size={20} /> : <FaExpand size={20} />}
          </button>
        </div>
      )}
    </div>
  );
}

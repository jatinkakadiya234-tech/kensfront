import React, { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function MovieDetailsScreen() {
  const [locked, setLocked] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [requestedMobileFullscreen, setRequestedMobileFullscreen] = useState(false);
  const [showRotateOverlay, setShowRotateOverlay] = useState(false);
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const url = useParams();

  // Dummy movie details
  const movieDetails = {
    title: "Movie Title",
    poster:
      "https://via.placeholder.com/500x750/37353E/FFFFFF?text=No+Poster+Available",
    description: "This is a movie description that would normally appear here.",
    year: "2024",
    rating: "PG-13",
  };

  // --- Extract video URL from query ---
  let videoUrl = "";
  try {
    const params = new URLSearchParams(window.location.search);
    const videoParam = params.get("video");
    if (videoParam) {
      videoUrl = videoParam;
    }
  } catch {}

  const hasVideo = Boolean(videoUrl);

  // --- Device helpers ---
  const isIOS = () =>
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isAndroid = () => /Android/.test(navigator.userAgent);
  const isSmallScreen = () =>
    window.matchMedia && window.matchMedia("(max-width: 768px)").matches;

  // --- Fullscreen toggle handler ---
  const handleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (containerRef.current?.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen();
      } else if (containerRef.current?.mozRequestFullScreen) {
        containerRef.current.mozRequestFullScreen();
      } else if (containerRef.current?.msRequestFullscreen) {
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

  // --- Try fullscreen + orientation ---
  const requestMobileFullscreenAndLandscape = async () => {
    if (!videoRef.current) return;
    try {
      // iOS native fullscreen
      if (isIOS() && videoRef.current.webkitEnterFullscreen) {
        videoRef.current.webkitEnterFullscreen();
      } else if (!document.fullscreenElement && containerRef.current) {
        await containerRef.current.requestFullscreen?.();
      }

      // Try orientation lock (supported on Chrome/Android)
      if (screen.orientation && screen.orientation.lock) {
        try {
          await screen.orientation.lock("landscape");
        } catch (err) {
          console.warn("Orientation lock failed:", err);
          setShowRotateOverlay(true);
        }
      } else {
        // Not supported → show rotate overlay
        setShowRotateOverlay(true);
      }

      setRequestedMobileFullscreen(true);
    } catch (err) {
      console.error("Fullscreen/orientation error:", err);
      setShowRotateOverlay(true);
    }
  };

  // --- Detect orientation & show rotate overlay ---
  useEffect(() => {
    const handleOrientationChange = () => {
      if (
        window.matchMedia("(orientation: portrait)").matches &&
        isSmallScreen() &&
        hasVideo
      ) {
        setShowRotateOverlay(true);
      } else {
        setShowRotateOverlay(false);
      }
    };

    window.addEventListener("orientationchange", handleOrientationChange);
    handleOrientationChange();

    return () => {
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, [hasVideo]);

  // --- Auto fullscreen on first tap ---
  useEffect(() => {
    if (!isSmallScreen() || !hasVideo) return;
    const container = containerRef.current;
    if (!container) return;

    const onFirstInteract = () => {
      if (!requestedMobileFullscreen) {
        requestMobileFullscreenAndLandscape();
      }
    };

    container.addEventListener("touchstart", onFirstInteract, {
      once: true,
      passive: true,
    });
    container.addEventListener("click", onFirstInteract, { once: true });

    return () => {
      container.removeEventListener("touchstart", onFirstInteract);
      container.removeEventListener("click", onFirstInteract);
    };
  }, [requestedMobileFullscreen, hasVideo]);

  // --- Fullscreen change listener ---
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // --- Premium user check ---
  useEffect(() => {
    try {
      const userInfo = localStorage.getItem("userinfo");
      if (userInfo) {
        const user = JSON.parse(userInfo);
        setIsPremium(!!user.isPremium);
      } else {
        setIsPremium(false);
      }
    } catch (error) {
      console.error("Error parsing user info:", error);
      setIsPremium(false);
    }
  }, []);

  // --- Show popup for non-premium after 15s ---
  useEffect(() => {
    if (!hasVideo) return;

    if (isPremium) {
      setShowPopup(false);
    } else {
      const timer = setTimeout(() => {
        setShowPopup(true);
        videoRef.current?.pause();
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [isPremium, videoUrl, hasVideo]);

  return (
    <div
      ref={containerRef}
      className="relative w-[100%] h-screen overflow-hidden bg-[#37353E] flex flex-col justify-center items-center"
      style={{ padding: 0, margin: 0 }}
    >
      {/* No video fallback */}
      {!hasVideo && (
        <div className="relative w-full h-full flex flex-col justify-center items-center bg-[#37353E] p-4">
          <div className="max-w-md w-full flex flex-col items-center">
            <div className="text-center text-white">
              <div className="bg-[#2c5364] rounded-lg p-4 border border-[#4facfe]">
                <div className="flex items-center justify-center mb-2">
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/1661/1661901.png"
                    alt="No Video"
                    className="w-12 h-12"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Video Not Available
                </h3>
                <p className="text-sm text-gray-300">
                  The video content for this movie is currently unavailable.
                  Please check back later or browse other movies.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Player */}
      {hasVideo && (
        <div className="relative w-[100%] h-full flex justify-center items-center">
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-contain bg-black"
            controls={!locked}
            autoPlay
            playsInline
            preload="metadata"
            muted={false}
            onCanPlay={() => videoRef.current?.play().catch(() => {})}
            onError={(e) => console.error("Video load error:", e)}
            onClick={() => {
              if (!isFullscreen) handleFullscreen();
            }}
          />

          {/* Premium upgrade popup */}
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
                  This is a preview feature. Upgrade to premium to access the
                  full content.
                </p>
                <button
                  className="bg-gradient-to-r from-[#4facfe] to-[#00f2fe] text-white px-8 py-3 rounded-full font-semibold transition-all hover:scale-105 hover:shadow-lg transform duration-300"
                  onClick={() => {
                    setShowPopup(false);
                    navigate("/subscription");
                  }}
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          )}

          {/* Rotate overlay for unsupported browsers */}
          {showRotateOverlay && (
            <div className="absolute inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center text-white z-50 text-center p-6">
              <img
                src="https://cdn-icons-png.flaticon.com/512/61/61168.png"
                alt="Rotate"
                className="w-16 h-16 mb-4 animate-spin-slow"
              />
              <h2 className="text-xl font-semibold mb-2">Rotate your device</h2>
              <p className="text-gray-300 max-w-xs">
                Please rotate your phone to landscape mode for the best viewing
                experience.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

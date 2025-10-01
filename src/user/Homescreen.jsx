import React, { useState, useRef } from 'react';
import { FaCompress, FaExpand, FaPlay, FaUpload, FaLink } from 'react-icons/fa';

export default function HomeScreen() {
  const [videoFile, setVideoFile] = useState(null);
  const [videoURL, setVideoURL] = useState(null);
  const [urlInput, setUrlInput] = useState('');
  const [showOverlay, setShowOverlay] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const LOCAL_STORAGE_KEY = 'videoHistory';

  function addToHistory(entry) {
    let history = [];
    try {
      history = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
    } catch {}
    history.unshift(entry);
    if (history.length > 20) history = history.slice(0, 20);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(history));
  }

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const objectURL = URL.createObjectURL(file);
      setVideoFile(file);
      setVideoURL(objectURL);
      setShowOverlay(true);
      addToHistory({
        type: 'file',
        name: file.name,
        url: objectURL,
        added: Date.now(),
      });
    }
  };

  const handleUrlAdd = () => {
    if (urlInput.trim()) {
      setVideoFile(null);
      setVideoURL(urlInput.trim());
      setShowOverlay(true);
      addToHistory({
        type: 'url',
        url: urlInput.trim(),
        added: Date.now(),
      });
      setUrlInput('');
    }
  };

  const handleCloseOverlay = () => {
    setShowOverlay(false);
    setVideoFile(null);
    setVideoURL(null);
  };

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

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center py-6 px-2 sm:px-4 md:px-0 gap-6 mt-14"
      style={{
        background: "rgba(15, 32, 39, 0.95)", 
      }}
    >
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 
          className="text-4xl md:text-5xl font-bold mb-4"
          style={{
            background: "linear-gradient(45deg, #4facfe, #00f2fe)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}
        >
          Welcome to KensDrive
        </h1>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Your personal video streaming paradise. Upload, stream, and enjoy your favorite content anytime, anywhere.
        </p>
      </div>

      {/* Main Content Cards - Separated */}
      <div className="grid md:grid-cols-2 gap-8 w-full max-w-6xl mb-8">
        {/* Local Video Upload Card */}
        <div 
          className="rounded-2xl shadow-lg p-8 flex flex-col items-center text-center"
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 25px 50px rgba(0,0,0,0.25)"
          }}
        >
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
            style={{
              background: "linear-gradient(45deg, #4facfe, #00f2fe)",
            }}
          >
            <FaUpload className="text-white text-2xl" />
          </div>
          
          <h2 className="text-2xl font-bold mb-4 text-white">Upload Local Videos</h2>
          <p className="text-gray-300 mb-6">
            Choose videos from your device gallery and enjoy high-quality streaming with our advanced player.
          </p>
          
          {/* File Input */}
          <div className="w-full">
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              ref={inputRef}
              className="hidden"
            />
            <button
              onClick={() => inputRef.current?.click()}
              className="w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3"
              style={{
                background: "linear-gradient(45deg, #4facfe, #00f2fe)",

                boxShadow: "0 4px 15px rgba(78,205,196,0.3)"
              }}
            >
              <FaUpload />
              Choose Video File
            </button>
          </div>
        </div>

        {/* URL Streaming Card */}
        <div 
          className="rounded-2xl shadow-lg p-8 flex flex-col items-center text-center"
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 25px 50px rgba(0,0,0,0.25)"
          }}
        >
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
            style={{
              background: "linear-gradient(45deg, #4facfe, #00f2fe)"
            }}
          >
            <FaLink className="text-white text-2xl" />
          </div>
          
          <h2 className="text-2xl font-bold mb-4 text-white">Stream from URL</h2>
          <p className="text-gray-300 mb-6">
            Paste any video URL and start streaming instantly. Support for MP4, WebM, and more formats.
          </p>
          
          {/* URL Input */}
          <div className="w-full">
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Enter video URL here..."
                className="flex-1 px-4 py-3 rounded-lg border-2 transition-all duration-300 focus:outline-none focus:border-[#4ecdc4] placeholder-white"
                style={{
                  background: "rgba(255, 255, 255, 0.9)",
                  borderColor: "#e0e0e0",
                  color: "#333"
                }}
              />
            </div>
            <button
              onClick={handleUrlAdd}
              className="w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(45deg, #4facfe, #00f2fe)",

                boxShadow: "0 4px 15px rgba(78,205,196,0.3)"
              }}
            >
              <FaPlay />
              Start Streaming
            </button>
          </div>
        </div>
      </div>

      {/* History Section */}
      <div 
        className="w-full max-w-4xl rounded-2xl p-6"
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)"
        }}
      >
        <h3 className="text-xl font-semibold mb-4 text-white text-center">Recent Videos</h3>
        <div className="max-h-60 overflow-y-auto space-y-3">
          {(() => {
            try {
              const history = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
              if (history.length === 0) {
                return (
                  <div className="text-center py-8">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{
                        background: "rgba(255, 255, 255, 0.1)"
                      }}
                    >
                      <FaPlay className="text-gray-400 text-xl" />
                    </div>
                    <p className="text-gray-400">No videos in history yet</p>
                    <p className="text-gray-500 text-sm">Start by uploading a video or streaming from URL</p>
                  </div>
                );
              }
              
              return history.map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all duration-300 hover:bg-white hover:bg-opacity-10"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)"
                  }}
                  onClick={() => {
                    setVideoURL(entry.url);
                    setShowOverlay(true);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{
                        background: entry.type === 'file' 
                          ? "linear-gradient(45deg, #ff6b6b, #4ecdc4)"
                          : "linear-gradient(45deg, #4ecdc4, #45b7d1)"
                      }}
                    >
                      {entry.type === 'file' ? <FaUpload /> : <FaLink />}
                    </div>
                    <div>
                      <span className="text-white font-medium block">
                        {entry.type === 'file' ? entry.name : 'URL Video'}
                      </span>
                      <span className="text-gray-400 text-sm">
                        {new Date(entry.added).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      background: "rgba(255, 255, 255, 0.1)"
                    }}
                  >
                    <FaPlay className="text-white text-sm" />
                  </div>
                </div>
              ));
            } catch {
              return <p className="text-gray-400 text-center">No history available</p>;
            }
          })()}
        </div>
      </div>

      {/* Simple Video Player Overlay */}
      {showOverlay && (
        <div 
          className="fixed inset-0 z-50 bg-black"
          style={{
            background: "rgba(0, 0, 0, 0.98)"
          }}
        >
          {/* Video Player - Simple and Mobile Friendly */}
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              ref={containerRef}
              src={videoURL}
              controls
              className="w-full h-full object-contain"
              autoPlay
              muted
              playsInline
              webkit-playsinline="true"
              style={{
                maxWidth: '100vw',
                maxHeight: '100vh'
              }}
            />

            {/* Simple Close Button */}
            <button
              onClick={handleCloseOverlay}
              className="absolute top-4 right-4 p-3 rounded-full bg-black bg-opacity-50 text-white text-xl hover:bg-opacity-70 transition-all duration-300"
            >
              ✕
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={handleFullscreen}
              className="absolute top-4 left-4 p-3 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all duration-300"
            >
              {isFullscreen ? <FaCompress /> : <FaExpand />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
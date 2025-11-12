import React, { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import { Settings, Volume2, VolumeX, Subtitles, Gauge, Play, Pause, Maximize, Minimize, SkipForward, SkipBack, Zap } from "lucide-react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

const VideoPlayer = ({
  videoUrl,
  thumbnailUrl,
  animeId,
  episodeId,
  onNextEpisode,
  onPreviousEpisode,
  hasNextEpisode = false,
  hasPreviousEpisode = false,
  episodeTitle = "",
  onFullscreenChange,
  isPremium = false
}) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [hlsInstance, setHlsInstance] = useState(null);
 

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
 
  const [lastTap, setLastTap] = useState(0);
  const [showPremiumPopup, setShowPremiumPopup] = useState(false);

  const controlsTimeoutRef = useRef(null);
  const longPressTimerRef = useRef(null);
  const normalSpeedRef = useRef(1);
  const volumeIndicatorTimerRef = useRef(null);

  // Initialize video
  useEffect(() => {
    if (!videoRef.current || !videoUrl) return;
    const video = videoRef.current;
    
    if (hlsInstance) {
      hlsInstance.destroy();
      setHlsInstance(null);
    }

    if (videoUrl.includes('.m3u8') && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
      setHlsInstance(hls);
      
      return () => hls.destroy();
    } else {
      video.src = videoUrl;
      video.load();
      
      // Auto-play for mobile after user interaction
      const playVideo = () => {
        video.muted = false;
        video.play().catch(e => console.log('Play failed:', e));
      };
      
      // Try to play after a short delay
      setTimeout(playVideo, 100);
    }
  }, [videoUrl]);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handlePlay = () => {
      setIsPlaying(true);
      // Auto-enter fullscreen on play
      if (!isFullscreen) {
        setTimeout(() => toggleFullscreen(), 100);
      }
      
      // Start 10-second timer for non-premium users
      console.log('isPremium value:', isPremium);
      if (!isPremium) {
        console.log('Starting 10-second timer for popup');
        setTimeout(() => {
          video.pause();
          setShowPremiumPopup(true);
          // Exit fullscreen when popup shows
          if (isFullscreen) {
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
        }, 10000); // 10 seconds
      } else {
        console.log('Premium user - no popup timer');
      }
    };
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };
    const handleWaiting = () => setIsBuffering(true);
    const handleCanPlay = () => setIsBuffering(false);
    const handleEnded = () => {
      if (hasNextEpisode) {
        setShowAutoPlayCountdown(true);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('ended', handleEnded);
    };
  }, [hasNextEpisode]);

  // Controls visibility
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  }, [isPlaying]);

  useEffect(() => {
    showControlsTemporarily();
  }, [isPlaying, showControlsTemporarily]);

  // Player controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleVolumeChange = (value) => {
    const newVolume = value[0];
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
      setVolume(newVolume);
      setIsMuted(videoRef.current.muted);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !videoRef.current.muted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
    }
  };

  const handleProgressChange = (value) => {
    const newTime = value[0];
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      const element = containerRef.current;
      
      // Try different fullscreen methods for Telegram and other browsers
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      } else {
        // Fallback for Telegram - simulate fullscreen
        setIsFullscreen(true);
        document.body.style.overflow = 'hidden';
        element.style.position = 'fixed';
        element.style.top = '0';
        element.style.left = '0';
        element.style.width = '100vw';
        element.style.height = '100vh';
        element.style.zIndex = '9999';
      }
      
      // Force landscape on mobile
      if (screen.orientation?.lock) {
        screen.orientation.lock('landscape').catch(() => {});
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
      } else {
        // Fallback exit
        setIsFullscreen(false);
        document.body.style.overflow = '';
        const element = containerRef.current;
        element.style.position = '';
        element.style.top = '';
        element.style.left = '';
        element.style.width = '';
        element.style.height = '';
        element.style.zIndex = '';
        
        // Notify parent component
        if (onFullscreenChange) {
          onFullscreenChange(false);
        }
      }
      
      // Unlock orientation
      if (screen.orientation?.unlock) {
        screen.orientation.unlock();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFS = !!(document.fullscreenElement || 
                     document.webkitFullscreenElement || 
                     document.mozFullScreenElement || 
                     document.msFullscreenElement);
      setIsFullscreen(isFS);
      
      // Notify parent component about fullscreen change
      if (onFullscreenChange) {
        onFullscreenChange(isFS);
      }
    };

    // Listen to all fullscreen events
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [onFullscreenChange]);

  const handleSpeedChange = (speed) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-full bg-black rounded-lg overflow-hidden group"
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onTouchStart={showControlsTemporarily}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className={`w-full ${isFullscreen ? 'h-full w-screen object-cover' : 'h-screen w-screen object-cover'} `}
        poster={thumbnailUrl}
        onClick={(e) => {
          const now = Date.now();
          const timeDiff = now - lastTap;
          const isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;
          
          if (timeDiff < 300 && timeDiff > 0) {
            // Double tap - skip 10 seconds (works in both normal and fullscreen)
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const centerX = rect.width / 2;
            
            if (clickX > centerX) {
              // Right side - forward 10s
              videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 10, duration);
            } else {
              // Left side - backward 10s
              videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 10, 0);
            }
          } else {
            // Single tap
            setTimeout(() => {
              if (Date.now() - lastTap > 300) {
                if (isMobile && !isFullscreen) {
                  // Mobile: Enter fullscreen on first click
                  toggleFullscreen();
                } else {
                  // Desktop or already fullscreen: Toggle play
                  togglePlay();
                }
              }
            }, 300);
          }
          setLastTap(now);
        }}
        controls={false}
        playsInline
        muted
        preload="metadata"
        onError={(e) => {
          console.error('Video error:', e.target.error);
          setIsBuffering(false);
        }}
        onLoadStart={() => setIsBuffering(true)}
        onCanPlay={() => setIsBuffering(false)}
      />

      {/* Buffering Loader */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#00a8e1] border-t-transparent"></div>
        </div>
      )}

      {/* Custom Controls Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/60 transition-opacity duration-300 pointer-events-none ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Bottom Controls Bar */}
        <div className={`absolute bottom-0 left-0 right-0 ${isFullscreen ? 'p-4 sm:p-6 space-y-3 sm:space-y-4' : 'p-2 space-y-2'} pointer-events-auto`}>
          {/* Progress Bar */}
          <div className="space-y-1">
            <div className={`relative ${isFullscreen ? 'h-3 sm:h-4' : 'h-3 sm:h-2'} w-full bg-gray-600 rounded-full cursor-pointer`} onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const percent = (e.clientX - rect.left) / rect.width;
              const newTime = percent * duration;
              handleProgressChange([newTime]);
            }}>
              <div 
                className="absolute top-0 left-0 h-full bg-[#00a8e1] rounded-full"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
              <div 
                className={`absolute top-1/2 ${isFullscreen ? 'w-5 h-5 sm:w-6 sm:h-6' : 'w-5 h-5 sm:w-4 sm:h-4'} bg-[#00a8e1] rounded-full border-2 border-white transform -translate-y-1/2 -translate-x-1/2`}
                style={{ left: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
            <div className={`flex justify-between ${isFullscreen ? 'text-sm' : 'text-sm sm:text-xs'} text-white/70`}>
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 sm:gap-2">
              <TooltipProvider>
                {/* Play/Pause */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size={isFullscreen ? "default" : "sm"}
                      variant="ghost"
                      onClick={togglePlay}
                      className={`text-[#00a8e1] hover:bg-[#00a8e1]/20 ${isFullscreen ? 'h-12 w-12 sm:h-14 sm:w-14' : 'h-12 w-12 sm:h-10 sm:w-10'} p-0`}
                    >
                      {isPlaying ? <Pause className={`${isFullscreen ? 'h-6 w-6 sm:h-7 sm:w-7' : 'h-6 w-6 sm:h-5 sm:w-5'} text-[#00a8e1]`} /> : <Play className={`${isFullscreen ? 'h-6 w-6 sm:h-7 sm:w-7' : 'h-6 w-6 sm:h-5 sm:w-5'} text-[#00a8e1]`} />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>{isPlaying ? 'Pause' : 'Play'}</p>
                  </TooltipContent>
                </Tooltip>

                {/* Volume */}
                <div className="flex items-center gap-1 sm:gap-2 group/volume">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size={isFullscreen ? "default" : "sm"}
                        variant="ghost"
                        onClick={toggleMute}
                        className={`text-[#00a8e1] hover:bg-[#00a8e1]/20 ${isFullscreen ? 'h-12 w-12 sm:h-14 sm:w-14' : 'h-12 w-12 sm:h-10 sm:w-10'} p-0`}
                      >
                        {isMuted || volume === 0 ? <VolumeX className={`${isFullscreen ? 'h-6 w-6 sm:h-7 sm:w-7' : 'h-6 w-6 sm:h-5 sm:w-5'} text-[#00a8e1]`} /> : <Volume2 className={`${isFullscreen ? 'h-6 w-6 sm:h-7 sm:w-7' : 'h-6 w-6 sm:h-5 sm:w-5'} text-[#00a8e1]`} />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Mute/Unmute</p>
                    </TooltipContent>
                  </Tooltip>
                  <div className="hidden lg:block w-0 group-hover/volume:w-24 opacity-0 group-hover/volume:opacity-100 transition-all overflow-hidden">
                    <div className="relative h-3 w-full bg-gray-600 rounded-full cursor-pointer overflow-hidden" onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const percent = (e.clientX - rect.left) / rect.width;
                      handleVolumeChange([percent]);
                    }}>
                      <div 
                        className="absolute  left-0 h-full bg-[#00a8e1] rounded-full"
                        style={{ width: `${volume * 100}%` }}
                      />
                      <div 
                        className="absolute top-1.5 w-3 h-3 bg-[#00a8e1] rounded-full border-2 border-white transform -translate-y-1/2 -translate-x-1/2"
                        style={{ left: `${volume * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Speed Control - Hidden on mobile */}
                <div className="hidden sm:block">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-[#00a8e1] hover:bg-[#00a8e1]/20 gap-1"
                      >
                        <Zap className="h-4 w-4 text-[#00a8e1]" />
                        <span className="text-xs">{playbackSpeed}x</span>
                      </Button>
                    </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-black/95 backdrop-blur-sm border-white/10 text-white">
                    <DropdownMenuLabel>Playback Speed</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/10" />
                    {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((speed) => (
                      <DropdownMenuItem
                        key={speed}
                        onClick={() => handleSpeedChange(speed)}
                        className={`cursor-pointer ${playbackSpeed === speed
                          ? "bg-[#00a8e1] text-white"
                          : "hover:bg-white/10"
                          }`}
                      >
                        {speed}x
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TooltipProvider>
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-1 sm:gap-2">
              <TooltipProvider>
                {/* Fullscreen */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size={isFullscreen ? "default" : "sm"}
                      variant="ghost"
                      onClick={toggleFullscreen}
                      className={`text-[#00a8e1] hover:bg-[#00a8e1]/20 ${isFullscreen ? 'h-12 w-12 sm:h-14 sm:w-14' : 'h-12 w-12 sm:h-10 sm:w-10'} p-0`}
                    >
                      {isFullscreen ? <Minimize className={`h-6 w-6 sm:h-7 sm:w-7 text-[#00a8e1]`} /> : <Maximize className={`h-6 w-6 sm:h-5 sm:w-5 text-[#00a8e1]`} />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Fullscreen</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>
      
      {/* Premium Popup */}
      {showPremiumPopup && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-[#0f171e] to-[#1a242f] p-2 sm:p-4">
          <div className="w-full max-w-xs sm:max-w-lg mx-auto bg-gradient-to-br from-[#0f171e] to-[#1a242f] rounded-xl sm:rounded-2xl p-3 sm:p-6 overflow-y-auto max-h-screen">
            
            {/* Prime Logo */}
          

            {/* Main Content */}
            <div className="text-center mb-4 sm:mb-8">
              <div className="w-12 h-12 sm:w-24 sm:h-24 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-6 shadow-2xl">
                <svg className="w-6 h-6 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              
              <h1 className="text-lg sm:text-4xl font-bold text-white mb-2 sm:mb-4">
                Premium Required
              </h1>
              
              <p className="text-sm sm:text-xl text-gray-300 mb-1 sm:mb-2">
                Upgrade to continue watching
              </p>
              
              <p className="text-gray-400 mb-3 sm:mb-6 text-xs sm:text-base px-1 sm:px-2">
                Enjoy unlimited access to all our premium content without any interruptions. 
                Start your free trial today!
              </p>

              {/* Features */}
              <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-8">
                <div className="text-center p-2 sm:p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="w-5 h-5 sm:w-8 sm:h-8 bg-[#00a8e1] rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-white text-xs">HD Quality</p>
                </div>
                
                <div className="text-center p-2 sm:p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="w-5 h-5 sm:w-8 sm:h-8 bg-[#00a8e1] rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-white text-xs">No Ads</p>
                </div>
                
                <div className="text-center p-2 sm:p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="w-5 h-5 sm:w-8 sm:h-8 bg-[#00a8e1] rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-white text-xs">All Content</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 sm:gap-4 w-full">
              <button
                onClick={() => window.location.href = '/subscription'}
                className="w-full bg-gradient-to-r from-[#00a8e1] to-[#00d4ff] text-white py-3 px-6 rounded-lg font-bold text-base hover:from-[#0098d1] hover:to-[#00c4ef] transition-all duration-300 shadow-2xl"
              >
                Get Premium 
              </button>
              
             
            </div>

            {/* Footer Text */}
            <p className="text-gray-500 text-xs sm:text-sm mt-3 sm:mt-8 text-center">
              First month free, then $9.99/month. Cancel anytime.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
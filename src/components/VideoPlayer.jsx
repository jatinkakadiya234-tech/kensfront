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
  episodeTitle = ""
}) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [hlsInstance, setHlsInstance] = useState(null);
  const [audioTracks, setAudioTracks] = useState([]);
  const [subtitleTracks, setSubtitleTracks] = useState([]);
  const [qualityLevels, setQualityLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(-1);
  const [currentAudio, setCurrentAudio] = useState(0);
  const [currentSubtitle, setCurrentSubtitle] = useState(-1);

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
  const [showAutoPlayCountdown, setShowAutoPlayCountdown] = useState(false);
  const [autoPlayCountdown, setAutoPlayCountdown] = useState(10);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [is2xSpeed, setIs2xSpeed] = useState(false);
  const [showVolumeIndicator, setShowVolumeIndicator] = useState(false);

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
    }
  }, [videoUrl]);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
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
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

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
      className="relative w-full bg-black rounded-lg overflow-hidden group"
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onTouchStart={showControlsTemporarily}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className={`w-full ${thumbnailUrl ? 'object-contain' : 'object-cover aspect-video'} ${isFullscreen ? 'h-screen' : isTheaterMode ? 'h-auto max-h-[85vh]' : 'h-auto max-h-[70vh]'}`}
        poster={thumbnailUrl}
        crossOrigin="anonymous"
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
        onTouchEnd={togglePlay}
        controls={false}
        autoPlay
        playsInline
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
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2 pointer-events-auto">
          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="relative h-2 w-full bg-gray-600 rounded-full cursor-pointer" onClick={(e) => {
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
                className="absolute top-1/2 w-4 h-4 bg-[#00a8e1] rounded-full border-2 border-white transform -translate-y-1/2 -translate-x-1/2"
                style={{ left: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-white/70">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TooltipProvider>
                {/* Play/Pause */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={togglePlay}
                      className="text-[#00a8e1] hover:bg-[#00a8e1]/20 h-10 w-10 p-0"
                    >
                      {isPlaying ? <Pause className="h-5 w-5 text-[#00a8e1]" /> : <Play className="h-5 w-5 text-[#00a8e1]" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>{isPlaying ? 'Pause' : 'Play'}</p>
                  </TooltipContent>
                </Tooltip>

                {/* Volume */}
                <div className="flex items-center gap-2 group/volume">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={toggleMute}
                        className="text-[#00a8e1] hover:bg-[#00a8e1]/20 h-10 w-10 p-0"
                      >
                        {isMuted || volume === 0 ? <VolumeX className="h-5 w-5 text-[#00a8e1]" /> : <Volume2 className="h-5 w-5 text-[#00a8e1]" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Mute/Unmute</p>
                    </TooltipContent>
                  </Tooltip>
                  <div className="hidden md:block w-0 group-hover/volume:w-24 opacity-0 group-hover/volume:opacity-100 transition-all overflow-hidden">
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

                {/* Speed Control */}
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
              </TooltipProvider>
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-2">
              <TooltipProvider>
                {/* Fullscreen */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={toggleFullscreen}
                      className="text-[#00a8e1] hover:bg-[#00a8e1]/20 h-10 w-10 p-0"
                    >
                      {isFullscreen ? <Minimize className="h-5 w-5 text-[#00a8e1]" /> : <Maximize className="h-5 w-5 text-[#00a8e1]" />}
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
    </div>
  );
};

export default VideoPlayer;
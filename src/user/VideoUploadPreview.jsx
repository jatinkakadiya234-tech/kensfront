import React, { useState, useRef } from 'react';
import Plyr from 'plyr-react';
import 'plyr-react/plyr.css';
import { FaLock, FaUnlock } from 'react-icons/fa';

function VideoUploadPreview() {
  const [videoUrl, setVideoUrl] = useState(null);
  const [locked, setLocked] = useState(false);
  const playerContainerRef = useRef();

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoUrl(URL.createObjectURL(file));
      setLocked(false);
    } else {
      setVideoUrl(null);
      setLocked(false);
    }
  };

  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center"
      style={{ 
        minHeight: '100vh', 
        backgroundColor: '#181a20', 
        padding: 20,
        position: 'relative'
      }}
    >
      <div className="text-light mb-4 text-center">
        <h3>Upload your local video</h3>
        <input
          type="file"
          accept="video/*"
          className="form-control mt-3"
          style={{ maxWidth: 400 }}
          onChange={handleVideoChange}
        />
      </div>

      {videoUrl && (
        <div
          style={{
            width: '100%',
            maxWidth: '1000px',
            position: 'relative'
          }}
        >
          <div
            ref={playerContainerRef}
            style={{
              position: 'relative',
              width: '100%',
              height: '70vh',
              borderRadius: 10,
              overflow: 'hidden',
            }}
          >
            <Plyr
              source={{
                type: 'video',
                sources: [
                  {
                    src: videoUrl,
                    type: 'video/mp4',
                  },
                ],
              }}
              options={{
                controls: [
                  'play-large',
                  'play',
                  'progress',
                  'current-time',
                  'mute',
                  'volume',
                  'settings',
                  'fullscreen',
                ],
              }}
              style={{ height: '100%', width: '100%' }}
            />

            {locked && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: '100%',
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  zIndex: 1000,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'column',
                  color: 'white'
                }}
              >
                <FaLock size={64} color="#ff3b3b" />
                <p className="mt-3">Video is locked</p>
              </div>
            )}
          </div>

          <div className="text-center mt-3">
            <button
              className={`btn ${locked ? 'btn-success' : 'btn-danger'} mt-3`}
              onClick={() => setLocked(!locked)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '0 auto'
              }}
            >
              {locked ? (
                <>
                  <FaUnlock /> Unlock Video
                </>
              ) : (
                <>
                  <FaLock /> Lock Video
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoUploadPreview;
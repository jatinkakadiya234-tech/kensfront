import React from 'react';

const UploadProgress = ({ progress, fileName, status, uploadedChunks, totalChunks }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'initialized':
        return 'text-blue-400';
      case 'uploading':
        return 'text-yellow-400';
      case 'assembling':
        return 'text-orange-400';
      case 'completed':
        return 'text-green-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'initialized':
        return 'Upload Initialized';
      case 'uploading':
        return 'Uploading...';
      case 'assembling':
        return 'Assembling File...';
      case 'completed':
        return 'Upload Complete';
      case 'failed':
        return 'Upload Failed';
      default:
        return 'Unknown Status';
    }
  };

  return (
    <div className="w-full p-4 rounded-lg" style={{ 
      background: 'rgba(255, 255, 255, 0.05)', 
      border: '1px solid rgba(255, 255, 255, 0.1)' 
    }}>
      {/* File Name */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-200 truncate max-w-xs" title={fileName}>
          {fileName}
        </span>
        <span className={`text-sm font-medium ${getStatusColor(status)}`}>
          {getStatusText(status)}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-700 rounded-full h-3 mb-2 overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{ 
            width: `${progress}%`,
            background: status === 'completed' 
              ? 'linear-gradient(90deg, #10b981, #34d399)'
              : status === 'failed'
              ? 'linear-gradient(90deg, #ef4444, #f87171)'
              : 'linear-gradient(90deg, #4facfe, #00f2fe)',
            boxShadow: status === 'completed' 
              ? '0 0 10px rgba(16, 185, 129, 0.5)'
              : status === 'failed'
              ? '0 0 10px rgba(239, 68, 68, 0.5)'
              : '0 0 10px rgba(79, 172, 254, 0.3)'
          }}
        />
      </div>

      {/* Progress Details */}
      <div className="flex items-center justify-between text-xs text-gray-300">
        <span>{progress}% Complete</span>
        {uploadedChunks !== undefined && totalChunks !== undefined && (
          <span>
            Chunk {uploadedChunks} of {totalChunks}
          </span>
        )}
      </div>

      {/* Animated dots for loading states */}
      {status === 'uploading' && (
        <div className="flex justify-center mt-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      )}

      {status === 'assembling' && (
        <div className="flex justify-center mt-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
          </div>
        </div>
      )}

      {/* Success checkmark */}
      {status === 'completed' && (
        <div className="flex justify-center mt-2">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}

      {/* Error icon */}
      {status === 'failed' && (
        <div className="flex justify-center mt-2">
          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadProgress;

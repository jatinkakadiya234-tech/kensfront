import React, { useState } from "react";
import TrophySpin from "../../common/Loader/TrophySpin";
import UploadProgress from "../../common/Loader/UploadProgress";
import { Apihelper } from "../../common/service/ApiHelper";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MovieCreateForm = ({ handleCloseModal, ListMovis }) => {
  const [contentType, setContentType] = useState('movie'); // movie | series
  const [form, setForm] = useState({
    name: '',
    image: [], // array of files
    video: [], // array of { quality, file }
    isPremium: false
  });
  const [isLoading, setIsLoading] = useState(false);

  // Chunked upload state
  const [uploadMode, setUploadMode] = useState('chunked'); // 'regular' | 'chunked'
  const [uploadProgress, setUploadProgress] = useState({
    720: { progress: 0, status: 'idle', fileName: '', uploadId: null },
    1080: { progress: 0, status: 'idle', fileName: '', uploadId: null }
  });
  const [isUploading, setIsUploading] = useState(false);

  // Series state (minimal: title only, and quick add season/episode helpers)
  const [seriesTitle, setSeriesTitle] = useState('');
  const [seriesId, setSeriesId] = useState('');
  const [seasonNumber, setSeasonNumber] = useState('');
  const [episodeNumber, setEpisodeNumber] = useState('');
  const [episodeUrl, setEpisodeUrl] = useState('');
  const [recentSeries, setRecentSeries] = useState([]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Chunked upload utility functions
  const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks

  const splitFileIntoChunks = (file) => {
    const chunks = [];
    let start = 0;
    let chunkIndex = 0;

    while (start < file.size) {
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);
      chunks.push({ chunk, index: chunkIndex });
      start = end;
      chunkIndex++;
    }

    return chunks;
  };

  const uploadFileInChunks = async (file, quality) => {
    try {
      const chunks = splitFileIntoChunks(file);
      
      // Initialize upload
      const initResponse = await Apihelper.initializeChunkedUpload({
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        totalChunks: chunks.length
      });

      const uploadId = initResponse.data.uploadId;
      
      setUploadProgress(prev => ({
        ...prev,
        [quality]: {
          ...prev[quality],
          status: 'uploading',
          fileName: file.name,
          uploadId: uploadId,
          progress: 0
        }
      }));

      // Upload chunks sequentially
      for (let i = 0; i < chunks.length; i++) {
        const { chunk, index } = chunks[i];
        
        await Apihelper.uploadChunk(
          uploadId,
          index,
          chunks.length,
          chunk,
          (progressEvent) => {
            const chunkProgress = (progressEvent.loaded / progressEvent.total) * 100;
            const overallProgress = ((index * 100 + chunkProgress) / chunks.length);
            
            setUploadProgress(prev => ({
              ...prev,
              [quality]: {
                ...prev[quality],
                progress: Math.round(overallProgress)
              }
            }));
          }
        );
      }

      // Poll for completion
      const pollCompletion = async () => {
        const maxAttempts = 60; // 5 minutes max
        let attempts = 0;
        
        while (attempts < maxAttempts) {
          try {
            const progressResponse = await Apihelper.getUploadProgress(uploadId);
            const { status, progress } = progressResponse.data;
            
            setUploadProgress(prev => ({
              ...prev,
              [quality]: {
                ...prev[quality],
                status: status,
                progress: progress
              }
            }));

            if (status === 'completed') {
              return uploadId;
            } else if (status === 'failed') {
              throw new Error('Upload failed');
            }
            
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
            attempts++;
          } catch (error) {
            console.error('Error polling upload progress:', error);
            attempts++;
          }
        }
        
        throw new Error('Upload timeout');
      };

      return await pollCompletion();
    } catch (error) {
      setUploadProgress(prev => ({
        ...prev,
        [quality]: {
          ...prev[quality],
          status: 'failed',
          progress: 0
        }
      }));
      throw error;
    }
  };

  const handleChange = (e) => {
    const { name, type, value, checked, files } = e.target;
    if (type === 'file') {
      if (name === 'image') {
        setForm({ ...form, image: Array.from(files) });
      }
    } else if (type === 'checkbox') {
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleVideoChange = (e, quality) => {
    const file = e.target.files[0];
    setForm(prev => {
      const filtered = prev.video.filter(v => v.quality !== quality);
      return { ...prev, video: [...filtered, { quality, file }] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setIsUploading(true);

    try {
      if (contentType === 'series') {
        if (!seriesTitle.trim()) throw new Error('Series title required');
        const { data } = await Apihelper.createWebSeries({ title: seriesTitle.trim() });
        setSeriesId(data.series?._id || '');
        toast.success('Series created');
        setSeriesTitle('');
        try {
          const listRes = await Apihelper.listWebSeries();
          setRecentSeries(Array.isArray(listRes.data.series) ? listRes.data.series : []);
        } catch { }
        return;
      }

      if (uploadMode === 'chunked') {
        // Chunked upload logic
        if (!form.video.length || form.video.length < 2) {
          throw new Error('Please select both 720p and 1080p videos');
        }

        const video720 = form.video.find(v => v.quality === '720p')?.file;
        const video1080 = form.video.find(v => v.quality === '1080p')?.file;

        if (!video720 || !video1080) {
          throw new Error('Please select both 720p and 1080p videos');
        }

        // Upload both videos in parallel
        const [uploadId720, uploadId1080] = await Promise.all([
          uploadFileInChunks(video720, '720'),
          uploadFileInChunks(video1080, '1080')
        ]);

        // Create movie with chunked upload
        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('isPremium', form.isPremium);
        formData.append('uploadId720', uploadId720);
        formData.append('uploadId1080', uploadId1080);
        
        // Append image
        form.image.forEach(imgFile => {
          formData.append('image', imgFile);
        });

        const res = await Apihelper.createMovieWithChunks(formData);
        
        if (res.status !== 201) throw new Error('Movie creation failed');
        
        ListMovis();
        handleCloseModal();
        toast.success('Movie created successfully with chunked upload');
      } else {
        // Regular upload logic
        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('isPremium', form.isPremium);

        // Append all images with field name 'image'
        form.image.forEach(imgFile => {
          formData.append('image', imgFile);
        });

        // Append all videos with field name 'video'
        form.video.forEach(({ file }) => {
          formData.append('video', file);
        });

        const res = await Apihelper.createMovise(formData);
        console.log(res)
        if (!res.status === 201) throw new Error('Upload failed');
        ListMovis()
        handleCloseModal()
        toast.success('Movie created successfully');
      }

      // Reset form after successful submission
      setForm({
        name: '',
        image: [],
        video: [],
        isPremium: false
      });
      
      // Reset upload progress
      setUploadProgress({
        720: { progress: 0, status: 'idle', fileName: '', uploadId: null },
        1080: { progress: 0, status: 'idle', fileName: '', uploadId: null }
      });
    } catch (err) {
      toast.error(`${err.message}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      toast.error('Movie creation failed');
      handleCloseModal()
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  const handleAddSeason = async () => {
    if (!seriesId || !seasonNumber) return toast.warn('Series ID and Season # required');
    try {
      await Apihelper.addSeasonToSeries(seriesId, Number(seasonNumber));
      toast.success('Season added');
      setSeasonNumber('');
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleAddEpisode = async () => {
    if (!seriesId || !seasonNumber || !episodeNumber || !episodeUrl.trim()) {
      return toast.warn('Series ID, Season #, Episode # and URL required');
    }
    try {
      await Apihelper.addEpisodeToSeason(seriesId, Number(seasonNumber), Number(episodeNumber), episodeUrl.trim());
      toast.success('Episode added');
      setEpisodeNumber('');
      setEpisodeUrl('');
    } catch (e) {
      toast.error(e.message);
    }
  };

  React.useEffect(() => {
    const loadRecent = async () => {
      if (contentType !== 'series') return;
      try {
        const res = await Apihelper.listWebSeries();
        setRecentSeries(Array.isArray(res.data.series) ? res.data.series : []);
      } catch { }
    };
    loadRecent();
  }, [contentType]);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ background: 'transparent' }}>
      <ToastContainer />
      <div className="max-w-3xl mx-auto relative">
        {/* {isLoading && (
              <TrophySpin color="#ffffff" size="large" text={contentType === 'movie' ? 'Creating Movie...' : 'Creating Series...'} textColor="#ffffff" />
          
        )} */}
        <div className="shadow-xl rounded-lg overflow-hidden" style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div className="py-4 px-6" style={{
            background: 'rgba(15, 32, 39, 0.95)',
            borderBottom: '1px solid rgba(79, 172, 254, 0.3)'
          }}>
            <h2 className="text-2xl font-bold" style={{
              background: 'linear-gradient(45deg, #4facfe, #00f2fe)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>{contentType === 'movie' ? 'Create New Movie' : 'Create New Web Series'}</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Type Switcher */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-200">Content Type</label>
              <select
                value={contentType}
                onChange={e => setContentType(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none"
                style={{ background: 'rgba(255, 255, 255, 0.9)', borderColor: '#e0e0e0', color: '#333' }}
              >
                <option value="movie">Movie</option>
                
              </select>
            </div>

            {/* Upload Mode Switcher */}
            {contentType === 'movie' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-200">Upload Mode</label>
                <select
                  value={uploadMode}
                  onChange={e => setUploadMode(e.target.value)}
                  disabled={isUploading}
                  className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'rgba(255, 255, 255, 0.9)', borderColor: '#e0e0e0', color: '#333' }}
                >
                  <option value="chunked">Chunked Upload (Recommended for Large Files)</option>
                </select>
                {uploadMode === 'chunked' && (
                  <p className="text-xs text-gray-300 mt-1">
                    Chunked upload provides better reliability for large video files with progress tracking.
                  </p>
                )}
              </div>
            )}
            {contentType === 'movie' && (
              <>
                {/* Movie Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">Movie Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: 'rgba(255, 255, 255, 0.9)', borderColor: '#e0e0e0', color: '#333' }}
                    placeholder="Enter movie name"
                  />
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">Movie Poster</label>
                  <div className="mt-1">
                    <label className="cursor-pointer block">
                      <div className="group relative">
                        <div className="w-full h-56 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition" style={{ borderColor: 'rgba(255, 255, 255, 0.2)', background: 'rgba(255, 255, 255, 0.05)' }}>
                          {form.image.length > 0 ? (
                            <div className="absolute inset-0 flex items-center justify-center p-1">
                              <img
                                src={URL.createObjectURL(form.image[0])}
                                alt="Preview"
                                className="w-full h-full object-cover rounded-lg"
                              />
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center p-4">
                              <svg className="w-12 h-12 text-gray-300 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="mt-2 text-sm text-gray-200">Click to upload images or drag and drop</span>
                              <span className="text-xs text-gray-300 mt-1">PNG, JPG, GIF up to 10MB</span>
                            </div>
                          )}
                        </div>
                        <input
                          type="file"
                          name="image"
                          accept="image/*"
                          multiple
                          onChange={e => setForm({ ...form, image: Array.from(e.target.files) })}
                          required
                          disabled={isLoading}
                          className="sr-only"
                        />
                      </div>
                    </label>
                    {form.image.length > 0 && (
                      <div className="mt-2 text-center text-sm text-gray-300">
                        {form.image.length} file(s) selected
                      </div>
                    )}
                  </div>
                </div>

                

                {/* Video Quality Uploads */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-200">Video Files</label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 720p */}
                    <div className="border rounded-lg p-4" style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                      <label className="block text-sm font-medium text-gray-200 mb-2">720p Version</label>
                      <div className="flex items-center space-x-4">
                        <label className="flex-1">
                          <div className="relative">
                            <div className="border-2 border-dashed rounded-md px-3 py-8 text-center transition" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                              {form.video.find(v => v.quality === '720p') ? (
                                <div className="text-green-400">
                                  <div className="flex items-center justify-center mb-1">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    File Selected
                                  </div>
                                  <div className="text-xs text-gray-300">
                                    {formatFileSize(form.video.find(v => v.quality === '720p')?.file?.size || 0)}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-gray-200">
                                  <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                  <span className="mt-2 block text-sm">Upload 720p Video</span>
                                </div>
                              )}
                            </div>
                            <input
                              type="file"
                              name="video720"
                              accept="*/*"
                              onChange={e => handleVideoChange(e, '720p')}
                              disabled={isLoading}
                              className="sr-only"
                            />
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* 1080p */}
                    <div className="border rounded-lg p-4" style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                      <label className="block text-sm font-medium text-gray-200 mb-2">1080p Version</label>
                      <div className="flex items-center space-x-4">
                        <label className="flex-1">
                          <div className="relative">
                            <div className="border-2 border-dashed rounded-md px-3 py-8 text-center transition" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                              {form.video.find(v => v.quality === '1080p') ? (
                                <div className="text-green-400">
                                  <div className="flex items-center justify-center mb-1">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    File Selected
                                  </div>
                                  <div className="text-xs text-gray-300">
                                    {formatFileSize(form.video.find(v => v.quality === '1080p')?.file?.size || 0)}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-gray-200">
                                  <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                  <span className="mt-2 block text-sm">Upload 1080p Video</span>
                                </div>
                              )}
                            </div>
                            <input
                              type="file"
                              name="video1080"
                              accept="*/*"
                              onChange={e => handleVideoChange(e, '1080p')}
                              disabled={isLoading}
                              className="sr-only"
                            />
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Upload Progress Display */}
                {uploadMode === 'chunked' && (uploadProgress[720].status !== 'idle' || uploadProgress[1080].status !== 'idle') && (
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-200">Upload Progress</label>
                    
                    {/* 720p Progress */}
                    {uploadProgress[720].status !== 'idle' && (
                      <div>
                        <div className="text-sm text-gray-300 mb-2">720p Video</div>
                        <UploadProgress
                          progress={uploadProgress[720].progress}
                          fileName={uploadProgress[720].fileName}
                          status={uploadProgress[720].status}
                        />
                      </div>
                    )}
                    
                    {/* 1080p Progress */}
                    {uploadProgress[1080].status !== 'idle' && (
                      <div>
                        <div className="text-sm text-gray-300 mb-2">1080p Video</div>
                        <UploadProgress
                          progress={uploadProgress[1080].progress}
                          fileName={uploadProgress[1080].fileName}
                          status={uploadProgress[1080].status}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Premium Checkbox */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isPremium"
                    checked={form.isPremium}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="h-4 w-4 border-gray-500 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <label className="ml-2 block text-sm text-gray-200">
                    Premium Content
                  </label>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{ background: 'linear-gradient(45deg, #4facfe, #00f2fe)', boxShadow: '0 4px 15px rgba(79,172,254,0.3)' }}
                  >
                    {isLoading ? (
                      <TrophySpin 
                        color="#ffffff" 
                        size="medium" 
                        text={uploadMode === 'chunked' ? "Uploading Movie..." : "Creating Movie..."} 
                        textColor="#ffffff" 
                      />
                    ) : (
                      uploadMode === 'chunked' ? 'Upload Movie (Chunked)' : 'Create Movie'
                    )}
                  </button>
                </div>
              </>
            )}

            {contentType === 'series' && (
              <>
                {/* Series Title (key: title) */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">Series Title (title)</label>
                  <input
                    type="text"
                    name="title"
                    value={seriesTitle}
                    onChange={e => setSeriesTitle(e.target.value)}
                    required
                    disabled={isLoading}
                    className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: 'rgba(255, 255, 255, 0.9)', borderColor: '#e0e0e0', color: '#333' }}
                    placeholder="Enter series title"
                  />
                </div>
                {/* Create Series */}
                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{ background: 'linear-gradient(45deg, #4facfe, #00f2fe)', boxShadow: '0 4px 15px rgba(79,172,254,0.3)' }}
                  >
                    {isLoading ? (
                      <TrophySpin color="#ffffff" size="medium" text="Creating Series..." textColor="#ffffff" />
                    ) : (
                      'Create Series'
                    )}
                  </button>
                </div>

                {/* Quick Add Season/Episode (after you have a seriesId) */}
                <div className="mt-6 p-4 rounded-md" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="text-sm text-gray-300 mb-3">Use newly created Series ID (auto-filled if just created)</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      name="seriesId"
                      value={seriesId}
                      onChange={e => setSeriesId(e.target.value)}
                      placeholder="Series ID"
                      className="px-3 py-2 rounded-md"
                      style={{ background: 'rgba(255, 255, 255, 0.9)', borderColor: '#e0e0e0', color: '#333' }}
                    />
                    <input
                      type="number"
                      min={1}
                      name="seasonNumber"
                      value={seasonNumber}
                      onChange={e => setSeasonNumber(e.target.value)}
                      placeholder="Season # (seasonNumber)"
                      className="px-3 py-2 rounded-md"
                      style={{ background: 'rgba(255, 255, 255, 0.9)', borderColor: '#e0e0e0', color: '#333' }}
                    />
                  </div>
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={handleAddSeason}
                      className="px-4 py-2 rounded-md text-white"
                      style={{ background: 'linear-gradient(45deg, #4facfe, #00f2fe)' }}
                    >
                      Add Season
                    </button>
                  </div>

                  <div className="mt-5 grid grid-cols-1 md-grid-cols-3 gap-3">
                    <input
                      type="number"
                      min={1}
                      name="episodeNumber"
                      value={episodeNumber}
                      onChange={e => setEpisodeNumber(e.target.value)}
                      placeholder="Episode # (episodeNumber)"
                      className="px-3 py-2 rounded-md"
                      style={{ background: 'rgba(255, 255, 255, 0.9)', borderColor: '#e0e0e0', color: '#333' }}
                    />
                    <input
                      type="url"
                      name="videoUrl"
                      value={episodeUrl}
                      onChange={e => setEpisodeUrl(e.target.value)}
                      placeholder="Video URL (videoUrl)"
                      className="px-3 py-2 rounded-md"
                      style={{ background: 'rgba(255, 255, 255, 0.9)', borderColor: '#e0e0e0', color: '#333' }}
                    />
                    <button
                      type="button"
                      onClick={handleAddEpisode}
                      className="px-4 py-2 rounded-md text-white"
                      style={{ background: 'linear-gradient(45deg, #4facfe, #00f2fe)' }}
                    >
                      Add Episode
                    </button>
                  </div>

                  <div className="mt-6">
                    <div className="text-sm text-gray-300 mb-2">Recent Series</div>
                    <div className="grid gap-2">
                      {recentSeries.slice(0, 5).map(s => (
                        <div key={s._id} className="flex items-center justify-between px-3 py-2 rounded" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
                          <div className="text-gray-200 text-sm truncate">{s.title}</div>
                          <button
                            type="button"
                            onClick={() => setSeriesId(s._id)}
                            className="px-3 py-1 rounded text-xs text-white"
                            style={{ background: 'linear-gradient(45deg, #4facfe, #00f2fe)' }}
                          >
                            Use ID
                          </button>
                        </div>
                      ))}
                      {recentSeries.length === 0 && (
                        <div className="text-xs text-gray-400">No series yet.</div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default MovieCreateForm;
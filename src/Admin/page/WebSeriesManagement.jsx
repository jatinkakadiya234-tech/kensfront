import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  TextField,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Grid,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Collapse,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  PlayArrow as PlayIcon,
  VideoLibrary as AddSeasonIcon,
  PlaylistAdd as AddEpisodeIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ContentCopy as CopyIcon,
  ExpandMore as ExpandMoreIcon,
  Visibility as ViewIcon,
  Movie as MovieIcon,
  Check as CheckIcon,
  Numbers,
  VideoFileOutlined,
  HighQualityOutlined
} from '@mui/icons-material';

import { Apihelper } from '../../common/service/ApiHelper';
import { toast } from 'react-toastify';
import TrophySpin from '../../common/Loader/TrophySpin';
import UploadProgress from '../../common/Loader/UploadProgress';
import { CloudUploadIcon } from 'lucide-react';

const WebSeriesManagement = () => {
  // State management
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creatingSeries, setCreatingSeries] = useState(false);
  const [addingSeason, setAddingSeason] = useState(false);
  const [addingEpisode, setAddingEpisode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [expandedSeries, setExpandedSeries] = useState({});
  
  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // Dialog states
  const [createSeriesDialog, setCreateSeriesDialog] = useState(false);
  const [addSeasonDialog, setAddSeasonDialog] = useState(false);
  const [addEpisodeDialog, setAddEpisodeDialog] = useState(false);
  const [editEpisodeDialog, setEditEpisodeDialog] = useState(false);
  
  // Form states
  const [newSeriesTitle, setNewSeriesTitle] = useState('');
  const [newSeasonNumber, setNewSeasonNumber] = useState('');
  const [newEpisodeNumber, setNewEpisodeNumber] = useState('');
  const [video720, setVideo720] = useState(null);
  const [video1080, setVideo1080] = useState(null);
  const [wsUploadProgress, setWsUploadProgress] = useState({
    720: { progress: 0, status: 'idle', fileName: '', uploadId: null },
    1080: { progress: 0, status: 'idle', fileName: '', uploadId: null }
  });
  const [editSeasonNum, setEditSeasonNum] = useState('');
  const [editEpisodeNum, setEditEpisodeNum] = useState('');
  const [editVideo720, setEditVideo720] = useState(null);
  const [editVideo1080, setEditVideo1080] = useState(null);
  const [isEditUploading, setIsEditUploading] = useState(false);

  const WATCH_BASE = 'http://localhost:5173/watch?video=';

  const getQualitySourceUrl = (episode, quality) => {
    // Backend may store either episode.videoUrl (string) or episode.qualities { '720p': url, '1080p': url }
    if (episode && episode.qualities && episode.qualities[quality]) return episode.qualities[quality];
    if (episode && episode.videoUrl) return episode.videoUrl; // fallback for older data
    return '';
  };

  const [copiedKeys, setCopiedKeys] = useState({});
  
  // Fixed copy function
  const handleCopy = async (text, key, successMsg = 'Copied!') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKeys(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopiedKeys(prev => {
          const newState = { ...prev };
          delete newState[key];
          return newState;
        });
      }, 2000);
      toast.success(successMsg);
    } catch (err) {
      console.error('Copy failed:', err);
      toast.error('Copy failed. Please try again.');
    }
  };

  // Load all series on component mount
  useEffect(() => {
    loadAllSeries();
  }, []);

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Toggle series expansion
  const toggleSeriesExpansion = (seriesId) => {
    setExpandedSeries(prev => ({
      ...prev,
      [seriesId]: !prev[seriesId]
    }));
  };

  // Delete handlers
  const deleteSeries = async (seriesId) => {
    try {
      if (!window.confirm('Delete this series? This will remove all seasons and episodes.')) return;
      setLoading(true);
      await Apihelper.deleteWebSeries(seriesId);
      toast.success('Series deleted');
      await loadAllSeries();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to delete series');
    } finally {
      setLoading(false);
    }
  };

  const deleteSeason = async (seriesId, seasonNumber) => {
    try {
      if (!window.confirm(`Delete Season ${seasonNumber}? All its episodes will be removed.`)) return;
      setLoading(true);
      await Apihelper.deleteSeason(seriesId, seasonNumber);
      toast.success(`Season ${seasonNumber} deleted`);
      await loadAllSeries();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to delete season');
    } finally {
      setLoading(false);
    }
  };

  const deleteEpisode = async (seriesId, seasonNumber, episodeNumber) => {
    try {
      if (!window.confirm(`Delete Episode ${episodeNumber} from Season ${seasonNumber}?`)) return;
      setLoading(true);
      await Apihelper.deleteEpisode(seriesId, seasonNumber, episodeNumber);
      toast.success(`Episode ${episodeNumber} deleted`);
      await loadAllSeries();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to delete episode');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Load All Web Series
  const loadAllSeries = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading all web series...');
      
      const response = await Apihelper.listWebSeries();
      console.log('✅ Series loaded:', response.data);
      
      setSeries(response.data.series || []);
      toast.success(`Loaded ${response.data.total} series`);
      
    } catch (error) {
      console.error('❌ Error loading series:', error);
      toast.error('Failed to load series');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Create New Web Series
  const createNewSeries = async () => {
    try {
      setCreatingSeries(true);
      if (!newSeriesTitle.trim()) {
        toast.error('Please enter series title');
        return;
      }

      console.log('🔄 Creating new series:', newSeriesTitle);
      
      const payload = {
        title: newSeriesTitle.trim()
      };
      
      const response = await Apihelper.createWebSeries(payload);
      console.log('✅ Series created:', response.data);
      
      toast.success('Series created successfully!');
      setNewSeriesTitle('');
      setCreateSeriesDialog(false);
      
      // Reload the list
      await loadAllSeries();
      
    } catch (error) {
      console.error('❌ Error creating series:', error);
      toast.error(error?.response?.data?.message || 'Failed to create series');
    }
    finally {
      setCreatingSeries(false);
    }
  };

  // Step 3: Add Season to Series
  const addSeasonToSeries = async () => {
    try {
      setAddingSeason(true);
      if (!selectedSeries || !newSeasonNumber) {
        toast.error('Please select series and enter season number');
        return;
      }

      console.log('🔄 Adding season to series:', {
        seriesId: selectedSeries._id,
        seasonNumber: parseInt(newSeasonNumber)
      });
      
      const response = await Apihelper.addSeasonToSeries(
        selectedSeries._id, 
        parseInt(newSeasonNumber)
      );
      
      console.log('✅ Season added:', response.data);
      toast.success(`Season ${newSeasonNumber} added successfully!`);
      
      setNewSeasonNumber('');
      setAddSeasonDialog(false);
      
      // Reload the list
      await loadAllSeries();
      
    } catch (error) {
      console.error('❌ Error adding season:', error);
      toast.error(error?.response?.data?.message || 'Failed to add season');
    }
    finally {
      setAddingSeason(false);
    }
  };

  const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

  const splitFileIntoChunks = (file) => {
    const chunks = [];
    let start = 0;
    let index = 0;
    while (start < file.size) {
      const end = Math.min(start + CHUNK_SIZE, file.size);
      chunks.push({ chunk: file.slice(start, end), index });
      start = end;
      index++;
    }
    return chunks;
  };

  const wsUploadFileInChunks = async (file, quality) => {
    const chunks = splitFileIntoChunks(file);
    const init = await Apihelper.wsInitializeChunkedUpload({
      fileName: file.name,
      fileSize: file.size,
      totalChunks: chunks.length
    });
    const uploadId = init.data.uploadId;

    setWsUploadProgress(prev => ({
      ...prev,
      [quality]: { progress: 0, status: 'uploading', fileName: file.name, uploadId }
    }));

    for (let i = 0; i < chunks.length; i++) {
      const { chunk, index } = chunks[i];
      await Apihelper.wsUploadChunk(uploadId, index, chunks.length, chunk, (pe) => {
        const chunkProgress = (pe.loaded / pe.total) * 100;
        const overall = ((index * 100 + chunkProgress) / chunks.length);
        setWsUploadProgress(prev => ({
          ...prev,
          [quality]: { ...prev[quality], progress: Math.round(overall) }
        }));
      });
    }

    // poll for completion
    const maxAttempts = 60;
    let attempts = 0;
    while (attempts < maxAttempts) {
      const resp = await Apihelper.wsGetUploadProgress(uploadId);
      const { status, progress } = resp.data;
      setWsUploadProgress(prev => ({ ...prev, [quality]: { ...prev[quality], progress, status } }));
      if (status === 'completed') return uploadId;
      if (status === 'failed') throw new Error('Upload failed');
      await new Promise(r => setTimeout(r, 3000));
      attempts++;
    }
    throw new Error('Upload timeout');
  };
  const wsEditUploadFileInChunks = async (file, quality) => {
    const chunks = splitFileIntoChunks(file);
    const init = await Apihelper.wsInitializeChunkedUpload({
      fileName: file.name,
      fileSize: file.size,
      totalChunks: chunks.length
    });
    const uploadId = init.data.uploadId;

    setWsUploadProgress(prev => ({
      ...prev,
      [quality]: { progress: 0, status: 'uploading', fileName: file.name, uploadId }
    }));

    for (let i = 0; i < chunks.length; i++) {
      const { chunk, index } = chunks[i];
      await Apihelper.wsUploadChunk(uploadId, index, chunks.length, chunk, (pe) => {
        const chunkProgress = (pe.loaded / pe.total) * 100;
        const overall = ((index * 100 + chunkProgress) / chunks.length);
        setWsUploadProgress(prev => ({
          ...prev,
          [quality]: { ...prev[quality], progress: Math.round(overall) }
        }));
      });
    }

    const maxAttempts = 60;
    let attempts = 0;
    while (attempts < maxAttempts) {
      const resp = await Apihelper.wsGetUploadProgress(uploadId);
      const { status, progress } = resp.data;
      setWsUploadProgress(prev => ({ ...prev, [quality]: { ...prev[quality], progress, status } }));
      if (status === 'completed') return uploadId;
      if (status === 'failed') throw new Error('Upload failed');
      await new Promise(r => setTimeout(r, 3000));
      attempts++;
    }
    throw new Error('Upload timeout');
  };

  // Step 4: Add Episode to Season (chunked, optional qualities)
  const addEpisodeToSeason = async () => {
    try {
      setAddingEpisode(true);
      if (!selectedSeries || !newSeasonNumber || !newEpisodeNumber) {
        toast.error('Please select series, season and episode number');
        return;
      }

      setIsUploading(true);
      let uploadId720 = null;
      let uploadId1080 = null;
      if (video720 && video1080) {
        const [id720, id1080] = await Promise.all([
          wsUploadFileInChunks(video720, 720),
          wsUploadFileInChunks(video1080, 1080)
        ]);
        uploadId720 = id720; uploadId1080 = id1080;
      } else if (video720) {
        uploadId720 = await wsUploadFileInChunks(video720, 720);
      } else if (video1080) {
        uploadId1080 = await wsUploadFileInChunks(video1080, 1080);
      }

      const payload = { episodeNumber: parseInt(newEpisodeNumber) };
      if (uploadId720) payload.uploadId720 = uploadId720;
      if (uploadId1080) payload.uploadId1080 = uploadId1080;

      const response = await Apihelper.addEpisodeWithChunks(
        selectedSeries._id,
        parseInt(newSeasonNumber),
        payload
      );

      console.log('✅ Episode added:', response.data);
      toast.success(`Episode ${newEpisodeNumber} added to Season ${newSeasonNumber}!`);
      
      setNewEpisodeNumber('');
      setVideo720(null);
      setVideo1080(null);
      setAddEpisodeDialog(false);
      setWsUploadProgress({
        720: { progress: 0, status: 'idle', fileName: '', uploadId: null },
        1080: { progress: 0, status: 'idle', fileName: '', uploadId: null }
      });
      
      // Reload the list
      await loadAllSeries();
      
    } catch (error) {
      console.error('❌ Error adding episode:', error);
      toast.error(error?.response?.data?.message || 'Failed to add episode');
    }
    finally {
      setAddingEpisode(false);
      setIsUploading(false);
    }
  };

  // Improved file upload handlers
  const handleFile720Change = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideo720(file);
    }
  };

  const handleFile1080Change = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideo1080(file);
    }
  };
  const handleEditFile720Change = (event) => {
    const file = event.target.files?.[0];
    if (file) setEditVideo720(file);
  };
  const handleEditFile1080Change = (event) => {
    const file = event.target.files?.[0];
    if (file) setEditVideo1080(file);
  };

  // Reset episode form
  const resetEpisodeForm = () => {
    setNewSeasonNumber('');
    setNewEpisodeNumber('');
    setVideo720(null);
    setVideo1080(null);
    setAddEpisodeDialog(false);
  };

  return (
    <Box sx={{ bgcolor: 'transparent', minHeight: '100vh', py: 4 }}>
      <Box sx={{ maxWidth: '1400px', mx: 'auto', px: 3 }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: 2,
            mb: 4
          }}
        >
          <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', mb: { xs: 2, sm: 0 } }}>
            Web Series Management
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateSeriesDialog(true)}
              sx={{
                background: 'linear-gradient(45deg, #4facfe, #00f2fe)',
                boxShadow: '0 4px 15px rgba(79,172,254,0.3)',
                '&:hover': { opacity: 0.95 },
                textTransform: 'none',
                px: 3,
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              Create New Series
            </Button>
            
            <Button
              variant="outlined"
              onClick={async () => { setRefreshing(true); await loadAllSeries(); setRefreshing(false); }}
              disabled={loading || refreshing}
              sx={{
                borderColor: '#4facfe',
                color: '#4facfe',
                '&:hover': {
                  borderColor: '#00f2fe',
                  backgroundColor: 'rgba(79,172,254,0.1)'
                },
                textTransform: 'none',
                px: 3,
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              {refreshing || loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={16} sx={{ color: '#4facfe' }} />
                  Loading...
                </Box>
              ) : 'Refresh List'}
            </Button>
          </Box>
        </Box>

        {/* Series List in Table Format */}
        <Box sx={{ width: '100%', overflowX: 'auto', mb: 3, position: 'relative' }}>
          {loading && (
            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, bgcolor: 'rgba(0,0,0,0.4)', borderRadius: 2 }}>
              <TrophySpin color="#fff" size="large" text="Loading..." textColor="#fff" />
            </Box>
          )}
          <Paper sx={{ borderRadius: 2, minWidth: 600, background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#cbd5e1', borderColor: 'rgba(255,255,255,0.1)', fontWeight: 'bold', px: { xs: 1, sm: 2 }, py: { xs: 1, sm: 2 }, fontSize: { xs: 12, sm: 14 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MovieIcon sx={{ color: '#4facfe' }} />
                        Series Details
                      </Box>
                    </TableCell>
                    <TableCell align="center" sx={{ color: '#cbd5e1', borderColor: 'rgba(255,255,255,0.1)', fontWeight: 'bold', px: { xs: 1, sm: 2 }, py: { xs: 1, sm: 2 }, fontSize: { xs: 12, sm: 14 } }}>
                      Seasons
                    </TableCell>
                    <TableCell align="center" sx={{ color: '#cbd5e1', borderColor: 'rgba(255,255,255,0.1)', fontWeight: 'bold', px: { xs: 1, sm: 2 }, py: { xs: 1, sm: 2 }, fontSize: { xs: 12, sm: 14 } }}>
                      Episodes
                    </TableCell>
                    <TableCell align="center" sx={{ color: '#cbd5e1', borderColor: 'rgba(255,255,255,0.1)', fontWeight: 'bold', px: { xs: 1, sm: 2 }, py: { xs: 1, sm: 2 }, fontSize: { xs: 12, sm: 14 } }}>
                      Created Date
                    </TableCell>
                    <TableCell align="center" sx={{ color: '#cbd5e1', borderColor: 'rgba(255,255,255,0.1)', fontWeight: 'bold', px: { xs: 1, sm: 2 }, py: { xs: 1, sm: 2 }, fontSize: { xs: 12, sm: 14 } }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {series
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((seriesItem) => (
                    <React.Fragment key={seriesItem._id}>
                      <TableRow
                        sx={{
                          '&:last-child td': { borderBottom: 0 },
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' }
                        }}
                      >
                        <TableCell sx={{ color: 'white', borderColor: '#333', px: { xs: 1, sm: 2 }, py: { xs: 1, sm: 2 }, fontSize: { xs: 12, sm: 14 } }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <IconButton
                              onClick={() => toggleSeriesExpansion(seriesItem._id)}
                              sx={{ 
                                color: expandedSeries[seriesItem._id] ? '#4facfe' : '#cbd5e1',
                                transform: expandedSeries[seriesItem._id] ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'all 0.3s ease'
                              }}
                            >
                              <ExpandMoreIcon />
                            </IconButton>
                            <Box>
                              <Typography variant="body2" sx={{ fontSize: { xs: 13, sm: 16 }, color: 'white' }}>
                                {seriesItem.title}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#cbd5e1' }}>
                                ID: {seriesItem._id.slice(-8)}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="center" sx={{ color: 'white', borderColor: '#333', px: { xs: 1, sm: 2 }, py: { xs: 1, sm: 2 }, fontSize: { xs: 12, sm: 14 } }}>
                          <Chip 
                            label={`${seriesItem.seasons?.length || 0} Seasons`} 
                            sx={{ 
                              backgroundColor: '#4facfe',
                              color: 'white',
                              fontWeight: 'bold',
                              fontSize: '0.75rem'
                            }}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center" sx={{ color: 'white', borderColor: '#333', px: { xs: 1, sm: 2 }, py: { xs: 1, sm: 2 }, fontSize: { xs: 12, sm: 14 } }}>
                          <Chip 
                            label={`${seriesItem.seasons?.reduce((total, season) => total + (season.episodes?.length || 0), 0) || 0} Episodes`} 
                            sx={{ 
                              backgroundColor: '#00f2fe',
                              color: 'white',
                              fontWeight: 'bold',
                              fontSize: '0.75rem'
                            }}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center" sx={{ color: 'white', borderColor: '#333', px: { xs: 1, sm: 2 }, py: { xs: 1, sm: 2 }, fontSize: { xs: 12, sm: 14 } }}>
                          <Typography variant="caption" sx={{ color: '#cbd5e1' }}>
                            {new Date(seriesItem.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </Typography>
                        </TableCell>
                        <TableCell align="center" sx={{ color: 'white', borderColor: '#333', px: { xs: 1, sm: 2 }, py: { xs: 1, sm: 2 }, fontSize: { xs: 12, sm: 14 } }}>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<AddSeasonIcon />}
                              onClick={() => {
                                setSelectedSeries(seriesItem);
                                setAddSeasonDialog(true);
                              }}
                              sx={{ 
                                fontSize: '0.7rem',
                                borderColor: '#4facfe',
                                color: '#4facfe',
                                '&:hover': {
                                  borderColor: '#00f2fe',
                                  backgroundColor: 'rgba(79,172,254,0.1)'
                                }
                              }}
                            >
                              Add Season
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<AddEpisodeIcon />}
                              onClick={() => {
                                setSelectedSeries(seriesItem);
                                setAddEpisodeDialog(true);
                              }}
                              sx={{ 
                                fontSize: '0.7rem',
                                borderColor: '#00f2fe',
                                color: '#00f2fe',
                                '&:hover': {
                                  borderColor: '#4facfe',
                                  backgroundColor: 'rgba(0,242,254,0.1)'
                                }
                              }}
                            >
                              Add Episode 
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<DeleteIcon />}
                              onClick={() => deleteSeries(seriesItem._id)}
                              sx={{ fontSize: '0.7rem', borderColor: 'rgba(239,68,68,0.6)', color: '#ef4444', '&:hover': { borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.08)' } }}
                            >
                              Delete Series
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                  
                      {/* Expandable Episodes Row */}
                      <TableRow>
                        <TableCell colSpan={5} sx={{ p: 0, border: 'none' }}>
                          <Collapse in={expandedSeries[seriesItem._id]} timeout="auto" unmountOnExit>
                            <Box sx={{ p: 2, backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                              <Typography variant="h6" gutterBottom sx={{ color: '#4facfe', mb: 2, fontWeight: 'bold' }}>
                                📺 Episodes Details
                              </Typography>
                          
                          {seriesItem.seasons && seriesItem.seasons.length > 0 ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              {seriesItem.seasons.map((season) => (
                                <Accordion key={season.seasonNumber} sx={{ 
                                  boxShadow: '0 4px 15px rgba(79,172,254,0.2)',
                                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                  border: '1px solid rgba(255, 255, 255, 0.1)',
                                  borderRadius: 2,
                                  mb: 1
                                }}>
                                  <AccordionSummary
                                    expandIcon={<ExpandMoreIcon sx={{ color: '#4facfe' }} />}
                                    sx={{ 
                                      backgroundColor: 'rgba(79,172,254,0.1)',
                                      '&:hover': { backgroundColor: 'rgba(79,172,254,0.2)' },
                                      borderRadius: 2
                                    }}
                                  >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                      <Chip 
                                        label={`Season ${season.seasonNumber}`} 
                                        sx={{ 
                                          backgroundColor: '#4facfe',
                                          color: 'white',
                                          fontWeight: 'bold'
                                        }}
                                        size="small"
                                      />
                                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'white' }}>
                                        {season.episodes?.length || 0} Episodes
                                      </Typography>
                                      <Box sx={{ marginLeft: 'auto' }}>
                                        <Button size="small" color="error" variant="text" startIcon={<DeleteIcon />} onClick={() => deleteSeason(seriesItem._id, season.seasonNumber)}>
                                          Delete Season
                                        </Button>
                                      </Box>
                                    </Box>
                                  </AccordionSummary>
                                  <AccordionDetails sx={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                                    {season.episodes && season.episodes.length > 0 ? (
                                      <TableContainer>
                                        <Table size="small">
                                          <TableHead>
                                            <TableRow>
                                              <TableCell sx={{ color: '#cbd5e1', fontWeight: 'bold', borderColor: 'rgba(255,255,255,0.1)' }}>Episode #</TableCell>
                                              <TableCell sx={{ color: '#cbd5e1', fontWeight: 'bold', borderColor: 'rgba(255,255,255,0.1)' }}>Watch URLs</TableCell>
                                              <TableCell sx={{ color: '#cbd5e1', fontWeight: 'bold', borderColor: 'rgba(255,255,255,0.1)' }}>Quality</TableCell>
                                              <TableCell sx={{ color: '#cbd5e1', fontWeight: 'bold', borderColor: 'rgba(255,255,255,0.1)' }}>Actions</TableCell>
                                            </TableRow>
                                          </TableHead>
                                          <TableBody>
                                            {season.episodes.map((episode, index) => (
                                              <TableRow key={index} hover sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' } }}>
                                                <TableCell sx={{ color: 'white', borderColor: '#333' }}>
                                                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#4facfe' }}>
                                                    Episode {episode.episodeNumber}
                                                  </Typography>
                                                </TableCell>
                                                <TableCell sx={{ color: 'white', borderColor: '#333' }}>
                                                  {(() => {
                                                    const source720 = getQualitySourceUrl(episode, '720p');
                                                    const source1080 = getQualitySourceUrl(episode, '1080p');
                                                    const watchUrl720 = WATCH_BASE + encodeURIComponent(source720 || '');
                                                    const watchUrl1080 = WATCH_BASE + encodeURIComponent(source1080  || '');
                                                    const copyKey720 = `${seriesItem._id}-${season.seasonNumber}-${episode.episodeNumber}-720`;
                                                    const copyKey1080 = `${seriesItem._id}-${season.seasonNumber}-${episode.episodeNumber}-1080`;
                                                    
                                                    return (
                                                      <Box sx={{ display: 'grid', gap: 1 }}>
                                                        {/* 720p URL */}
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                          <Tooltip title={watchUrl720} arrow>
                                                            <Typography 
                                                              variant="caption" 
                                                              sx={{ 
                                                                fontFamily: 'monospace',
                                                                backgroundColor: 'rgba(79,172,254,0.1)',
                                                                color: '#4facfe',
                                                                padding: '4px 8px',
                                                                borderRadius: '4px',
                                                                display: 'block',
                                                                maxWidth: '300px',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap',
                                                                border: '1px solid rgba(79,172,254,0.3)',
                                                                cursor: 'pointer',
                                                                userSelect: 'all'
                                                              }}
                                                              onClick={() => handleCopy(watchUrl720, copyKey720, '720p URL copied!')}
                                                            >
                                                              720p: {watchUrl720.length >38 ? watchUrl720 : 'N/A'}
                                                            </Typography>
                                                          </Tooltip>
                                                          <IconButton 
                                                            size="small" 
                                                            onClick={() => handleCopy(watchUrl720, copyKey720, '720p URL copied!')}
                                                            sx={{ 
                                                              color: copiedKeys[copyKey720] ? '#10b981' : '#4facfe',
                                                              border: '1px solid',
                                                              borderColor: copiedKeys[copyKey720] ? '#10b981' : '#4facfe',
                                                              width: 32,
                                                              height: 32
                                                            }}
                                                          >
                                                            {copiedKeys[copyKey720] ? <CheckIcon fontSize="small" /> : <CopyIcon fontSize="small" />}
                                                          </IconButton>
                                                        </Box>
                                                        
                                                        {/* 1080p URL */}
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                          <Tooltip title={watchUrl1080} arrow>
                                                            <Typography 
                                                              variant="caption" 
                                                              sx={{ 
                                                                fontFamily: 'monospace',
                                                                backgroundColor: 'rgba(79,172,254,0.1)',
                                                                color: '#4facfe',
                                                                padding: '4px 8px',
                                                                borderRadius: '4px',
                                                                display: 'block',
                                                                maxWidth: '300px',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap',
                                                                border: '1px solid rgba(79,172,254,0.3)',
                                                                cursor: 'pointer',
                                                                userSelect: 'all'
                                                              }}
                                                              onClick={() => handleCopy(watchUrl1080, copyKey1080, '1080p URL copied!')}
                                                            >
                                                              1080p: {watchUrl1080.length >38 ? watchUrl1080 : 'N/A'}
                                                            </Typography>
                                                          </Tooltip>
                                                          <IconButton 
                                                            size="small" 
                                                            onClick={() => handleCopy(watchUrl1080, copyKey1080, '1080p URL copied!')}
                                                            sx={{ 
                                                              color: copiedKeys[copyKey1080] ? '#10b981' : '#4facfe',
                                                              border: '1px solid',
                                                              borderColor: copiedKeys[copyKey1080] ? '#10b981' : '#4facfe',
                                                              width: 32,
                                                              height: 32
                                                            }}
                                                          >
                                                            {copiedKeys[copyKey1080] ? <CheckIcon fontSize="small" /> : <CopyIcon fontSize="small" />}
                                                          </IconButton>
                                                        </Box>
                                                      </Box>
                                                    );
                                                  })()}
                                                </TableCell>
                                                <TableCell sx={{ color: 'white', borderColor: '#333' }}>
                                                  <Chip 
                                                    label="HD" 
                                                    size="small" 
                                                    sx={{ 
                                                      backgroundColor: '#00f2fe',
                                                      color: 'white',
                                                      fontWeight: 'bold',
                                                      height: 24
                                                    }}
                                                  />
                                                </TableCell>
                                                <TableCell sx={{ color: 'white', borderColor: '#333' }}>
                                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Button
                                                      size="small"
                                                      color="error"
                                                      variant="outlined"
                                                      startIcon={<DeleteIcon />}
                                                      onClick={() => deleteEpisode(seriesItem._id, season.seasonNumber, episode.episodeNumber)}
                                                      sx={{ fontSize: '0.7rem', borderColor: 'rgba(239,68,68,0.6)', color: '#ef4444', '&:hover': { borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.08)' } }}
                                                    >
                                                      Delete
                                                    </Button>
                                                <Button
                                                  size="small"
                                                  variant="outlined"
                                                  startIcon={<EditIcon />}
                                                  onClick={() => {
                                                    setSelectedSeries(seriesItem);
                                                    setEditSeasonNum(String(season.seasonNumber));
                                                    setEditEpisodeNum(String(episode.episodeNumber));
                                                    setEditVideo720(null);
                                                    setEditVideo1080(null);
                                                    setEditEpisodeDialog(true);
                                                  }}
                                                  sx={{ fontSize: '0.7rem', borderColor: '#4facfe', color: '#4facfe' }}
                                                >
                                                  Edit
                                                </Button>
                                                  </Box>
                                                </TableCell>
                                              </TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      </TableContainer>
                                    ) : (
                                      <Box sx={{ textAlign: 'center', py: 3 }}>
                                        <Typography variant="body2" sx={{ color: '#cbd5e1', fontStyle: 'italic' }}>
                                          No episodes added to this season yet
                                        </Typography>
                                      </Box>
                                    )}
                                  </AccordionDetails>
                                </Accordion>
                              ))}
                            </Box>
                          ) : (
                            <Box sx={{ textAlign: 'center', py: 3 }}>
                              <Typography variant="body2" sx={{ color: '#cbd5e1', fontStyle: 'italic' }}>
                                No seasons added to this series yet
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={series.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Series per page:"
              labelDisplayedRows={({ from, to, count }) => 
                `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
              }
              sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#cbd5e1',
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                  color: '#cbd5e1'
                },
                '& .MuiTablePagination-select': {
                  color: '#4facfe'
                }
              }}
            />
          </Paper>
        </Box>
      </Box>

      {/* Create Series Dialog */}
      <Dialog open={createSeriesDialog} onClose={() => setCreateSeriesDialog(false)} fullWidth maxWidth="sm" PaperProps={{
        sx: {
          background: 'rgba(15, 32, 39, 0.98)',
          border: '1px solid rgba(79,172,254,0.25)',
          backdropFilter: 'blur(12px)',
          color: 'white',
        }
      }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Create New Web Series</DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'rgba(79,172,254,0.15)' }}>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>
            Enter a clear, descriptive title for your new web series.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Series Title"
            placeholder="e.g. Galactic Adventures"
            fullWidth
            size="small"
            value={newSeriesTitle}
            onChange={(e) => setNewSeriesTitle(e.target.value)}
            variant="filled"
            InputLabelProps={{ sx: { color: '#9ca3af' } }}
            sx={{
              input: { color: 'white' },
              '.MuiFilledInput-root': {
                backgroundColor: 'rgba(255,255,255,0.06)'
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateSeriesDialog(false)} sx={{ color: '#cbd5e1' }}>Cancel</Button>
          <Button onClick={createNewSeries} variant="contained" disabled={!newSeriesTitle.trim() || creatingSeries} sx={{
            background: 'linear-gradient(45deg, #4facfe, #00f2fe)'
          }}>
            {creatingSeries ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} sx={{ color: 'white' }} />
                Creating...
              </Box>
            ) : 'Create Series'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Season Dialog */}
      <Dialog open={addSeasonDialog} onClose={() => setAddSeasonDialog(false)} fullWidth maxWidth="xs" PaperProps={{
        sx: {
          background: 'rgba(15, 32, 39, 0.98)',
          border: '1px solid rgba(79,172,254,0.25)',
          backdropFilter: 'blur(12px)',
          color: 'white',
        }
      }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Add Season</DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'rgba(79,172,254,0.15)' }}>
          <Typography variant="caption" sx={{ color: '#64748b' }}>Series</Typography>
          <Typography variant="body2" sx={{ mb: 2, fontWeight: 'bold' }}>{selectedSeries?.title || '—'}</Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Season Number"
            type="number"
            inputProps={{ min: 1 }}
            fullWidth
            size="small"
            value={newSeasonNumber}
            onChange={(e) => setNewSeasonNumber(e.target.value)}
            variant="filled"
            InputLabelProps={{ sx: { color: '#9ca3af' } }}
            sx={{
              input: { color: 'white' },
              '.MuiFilledInput-root': {
                backgroundColor: 'rgba(255,255,255,0.06)'
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddSeasonDialog(false)} sx={{ color: '#cbd5e1' }}>Cancel</Button>
          <Button onClick={addSeasonToSeries} variant="contained" disabled={!newSeasonNumber || addingSeason} sx={{
            background: 'linear-gradient(45deg, #4facfe, #00f2fe)'
          }}>
            {addingSeason ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} sx={{ color: 'white' }} />
                Adding...
              </Box>
            ) : 'Add Season'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Improved Add Episode Dialog */}
     <Dialog 
  open={addEpisodeDialog} 
  onClose={resetEpisodeForm} 
  fullWidth 
  maxWidth="md" 
  PaperProps={{
    sx: {
      background: 'rgba(15, 32, 39, 0.98)',
      border: '1px solid rgba(79,172,254,0.25)',
      backdropFilter: 'blur(12px)',
      color: 'white',
      borderRadius: 3
    }
  }}
>
  {/* Header */}
  <DialogTitle sx={{ 
    fontWeight: 'bold', 
    borderBottom: '1px solid rgba(79,172,254,0.15)',
    py: 2.5,
    background: 'linear-gradient(135deg, rgba(79,172,254,0.1) 0%, rgba(0,242,254,0.05) 100%)'
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <AddIcon sx={{ color: '#4facfe' }} />
      Add New Episode
    </Box>
  </DialogTitle>

  <DialogContent dividers sx={{ borderColor: 'rgba(79,172,254,0.15)', py: 3, px: 3 }}>
    <Grid container spacing={3}>
      {/* Series Info Section */}
      <Grid item xs={12}>
        <Card sx={{ 
          background: 'linear-gradient(135deg, rgba(79,172,254,0.1) 0%, rgba(0,242,254,0.05) 100%)',
          border: '1px solid rgba(79,172,254,0.2)',
          borderRadius: 2
        }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{
                p: 1.5,
                backgroundColor: 'rgba(79,172,254,0.2)',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <MovieIcon sx={{ color: '#4facfe', fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', fontWeight: 'medium' }}>
                  Selected Series
                </Typography>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mt: 0.5 }}>
                  {selectedSeries?.title || 'No series selected'}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Episode Details Section */}
      <Grid item xs={12}>
        <Typography variant="h6" sx={{ color: '#e2e8f0', mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Numbers sx={{ fontSize: 20, color: '#4facfe' }} />
          Episode Details
        </Typography>
      </Grid>

      {/* Season and Episode Numbers */}
      <Grid item xs={12} sm={6}>
        <TextField
          label="Season Number"
          type="number"
          inputProps={{ min: 1 }}
          fullWidth
          value={newSeasonNumber}
          onChange={(e) => setNewSeasonNumber(e.target.value)}
          variant="outlined"
          InputLabelProps={{ sx: { color: '#94a3b8' } }}
          sx={{
            input: { 
              color: 'white',
              fontSize: '16px',
              py: 1.5
            },
            '.MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255,255,255,0.06)',
              borderRadius: 2,
              '& fieldset': { 
                borderColor: 'rgba(255,255,255,0.2)',
                borderRadius: 2
              },
              '&:hover fieldset': { 
                borderColor: '#4facfe',
                boxShadow: '0 0 0 2px rgba(79,172,254,0.1)'
              },
              '&.Mui-focused fieldset': { 
                borderColor: '#00f2fe',
                boxShadow: '0 0 0 3px rgba(0,242,254,0.1)'
              }
            }
          }}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          label="Episode Number"
          type="number"
          inputProps={{ min: 1 }}
          fullWidth
          value={newEpisodeNumber}
          onChange={(e) => setNewEpisodeNumber(e.target.value)}
          variant="outlined"
          InputLabelProps={{ sx: { color: '#94a3b8' } }}
          sx={{
            input: { 
              color: 'white',
              fontSize: '16px',
              py: 1.5
            },
            '.MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255,255,255,0.06)',
              borderRadius: 2,
              '& fieldset': { 
                borderColor: 'rgba(255,255,255,0.2)',
                borderRadius: 2
              },
              '&:hover fieldset': { 
                borderColor: '#4facfe',
                boxShadow: '0 0 0 2px rgba(79,172,254,0.1)'
              },
              '&.Mui-focused fieldset': { 
                borderColor: '#00f2fe',
                boxShadow: '0 0 0 3px rgba(0,242,254,0.1)'
              }
            }
          }}
        />
      </Grid>

      {/* File Uploads Section */}
      <Grid item xs={12}>
        <Typography variant="h6" sx={{ color: '#e2e8f0', mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <CloudUploadIcon sx={{ fontSize: 20, color: '#4facfe' }} />
          Upload Video Files (optional 720p/1080p)
        </Typography>
      </Grid>

      {/* 720p Upload */}
      <Grid item xs={12} md={6}>
        <Card sx={{ 
          backgroundColor: 'rgba(255,255,255,0.05)', 
          border: video720 ? '2px solid #4facfe' : '1px solid rgba(255,255,255,0.15)',
          transition: 'all 0.3s ease',
          borderRadius: 2,
          height: '100%',
          '&:hover': {
            borderColor: video720 ? '#4facfe' : 'rgba(79,172,254,0.4)',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
          }
        }}>
          <CardContent sx={{ p: 3, textAlign: 'center' }}>
            <Box sx={{
              width: 60,
              height: 60,
              backgroundColor: video720 ? 'rgba(79,172,254,0.2)' : 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              border: `2px solid ${video720 ? '#4facfe' : 'rgba(255,255,255,0.3)'}`
            }}>
              <VideoFileOutlined sx={{ 
                fontSize: 30, 
                color: video720 ? '#4facfe' : '#94a3b8' 
              }} />
            </Box>
            
            <Typography variant="h6" sx={{ color: '#4facfe', mb: 1, fontWeight: 'bold' }}>
              720p Quality
            </Typography>
            <Typography variant="body2" sx={{ color: '#cbd5e1', mb: 3 }}>
              Standard HD quality video file
            </Typography>
            
            <Button 
              fullWidth 
              variant="contained" 
              component="label"
              startIcon={video720 ? <CheckIcon /> : <CloudUploadIcon />}
              sx={{
                background: video720 ? 
                  'linear-gradient(45deg, #10b981, #34d399)' : 
                  'linear-gradient(45deg, #4facfe, #00f2fe)',
                borderRadius: 2,
                py: 1.2,
                fontWeight: 'bold',
                textTransform: 'none',
                fontSize: '15px',
                '&:hover': { 
                  opacity: 0.9,
                  transform: 'translateY(-1px)'
                }
              }}
            >
              {video720 ? 'File Selected' : 'Select 720p Video'}
              <input 
                type="file" 
                accept="video/*" 
                hidden 
                onChange={handleFile720Change}
              />
            </Button>
            
            {video720 && (
              <Box sx={{ 
                mt: 3, 
                p: 2, 
                backgroundColor: 'rgba(79,172,254,0.1)', 
                borderRadius: 2,
                border: '1px solid rgba(79,172,254,0.2)'
              }}>
                <Typography variant="caption" sx={{ color: '#4facfe', fontWeight: 'bold', display: 'block' }}>
                  ✓ {video720.name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#cbd5e1', display: 'block', mt: 0.5 }}>
                  Size: {(video720.size / (1024 * 1024)).toFixed(2)} MB
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* 1080p Upload */}
      <Grid item xs={12} md={6}>
        <Card sx={{ 
          backgroundColor: 'rgba(255,255,255,0.05)', 
          border: video1080 ? '2px solid #00f2fe' : '1px solid rgba(255,255,255,0.15)',
          transition: 'all 0.3s ease',
          borderRadius: 2,
          height: '100%',
          '&:hover': {
            borderColor: video1080 ? '#00f2fe' : 'rgba(0,242,254,0.4)',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
          }
        }}>
          <CardContent sx={{ p: 3, textAlign: 'center' }}>
            <Box sx={{
              width: 60,
              height: 60,
              backgroundColor: video1080 ? 'rgba(0,242,254,0.2)' : 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              border: `2px solid ${video1080 ? '#00f2fe' : 'rgba(255,255,255,0.3)'}`
            }}>
              <HighQualityOutlined sx={{ 
                fontSize: 30, 
                color: video1080 ? '#00f2fe' : '#94a3b8' 
              }} />
            </Box>
            
            <Typography variant="h6" sx={{ color: '#00f2fe', mb: 1, fontWeight: 'bold' }}>
              1080p Quality
            </Typography>
            <Typography variant="body2" sx={{ color: '#cbd5e1', mb: 3 }}>
              Full HD quality video file
            </Typography>
            
            <Button 
              fullWidth 
              variant="contained" 
              component="label"
              startIcon={video1080 ? <CheckIcon /> : <CloudUploadIcon />}
              sx={{
                background: video1080 ? 
                  'linear-gradient(45deg, #10b981, #34d399)' : 
                  'linear-gradient(45deg, #00f2fe, #4facfe)',
                borderRadius: 2,
                py: 1.2,
                fontWeight: 'bold',
                textTransform: 'none',
                fontSize: '15px',
                '&:hover': { 
                  opacity: 0.9,
                  transform: 'translateY(-1px)'
                }
              }}
            >
              {video1080 ? 'File Selected' : 'Select 1080p Video'}
              <input 
                type="file" 
                accept="video/*" 
                hidden 
                onChange={handleFile1080Change}
              />
            </Button>
            
            {video1080 && (
              <Box sx={{ 
                mt: 3, 
                p: 2, 
                backgroundColor: 'rgba(0,242,254,0.1)', 
                borderRadius: 2,
                border: '1px solid rgba(0,242,254,0.2)'
              }}>
                <Typography variant="caption" sx={{ color: '#00f2fe', fontWeight: 'bold', display: 'block' }}>
                  ✓ {video1080.name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#cbd5e1', display: 'block', mt: 0.5 }}>
                  Size: {(video1080.size / (1024 * 1024)).toFixed(2)} MB
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Requirements Info */}
      <Grid item xs={12}>
        <Alert 
          severity="info" 
          sx={{ 
            backgroundColor: 'rgba(79,172,254,0.1)',
            color: '#cbd5e1',
            border: '1px solid rgba(79,172,254,0.3)',
            borderRadius: 2,
            '& .MuiAlert-icon': {
              color: '#4facfe'
            }
          }}
        >
          <Typography variant="body2">
            <strong>Requirements:</strong> Both 720p and 1080p video files are required. 
            Supported formats: MP4, MKV, AVI, MOV. Maximum file size: 2GB each.
          </Typography>
        </Alert>
      </Grid>
    </Grid>
  </DialogContent>

  {/* Footer Actions */}
  <DialogActions sx={{ 
    p: 3, 
    borderTop: '1px solid rgba(79,172,254,0.15)',
    background: 'rgba(15, 32, 39, 0.8)'
  }}>
    <Button 
      onClick={resetEpisodeForm} 
      variant="outlined"
      sx={{ 
        color: '#cbd5e1',
        borderColor: 'rgba(255,255,255,0.2)',
        borderRadius: 2,
        px: 4,
        py: 1,
        '&:hover': { 
          backgroundColor: 'rgba(255,255,255,0.05)',
          borderColor: 'rgba(255,255,255,0.3)'
        }
      }}
    >
      Cancel
    </Button>
    <Button 
      onClick={addEpisodeToSeason} 
      variant="contained" 
      disabled={!newSeasonNumber || !newEpisodeNumber || addingEpisode || isUploading}
      sx={{
        background: 'linear-gradient(45deg, #4facfe, #00f2fe)',
        borderRadius: 2,
        px: 4,
        py: 1,
        fontWeight: 'bold',
        textTransform: 'none',
        fontSize: '15px',
        boxShadow: '0 4px 15px rgba(79,172,254,0.3)',
        '&:hover': {
          background: 'linear-gradient(45deg, #00f2fe, #4facfe)',
          boxShadow: '0 6px 20px rgba(79,172,254,0.4)',
          transform: 'translateY(-1px)'
        },
        '&:disabled': {
          background: 'rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.3)',
          transform: 'none',
          boxShadow: 'none'
        }
      }}
    >
      {addingEpisode ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <CircularProgress size={18} sx={{ color: 'white' }} />
          Uploading Episode...
        </Box>
      ) : (
        `Add Episode ${newEpisodeNumber} to Season ${newSeasonNumber}`
      )}
    </Button>
  </DialogActions>

  {/* Upload Progress */}
  {(wsUploadProgress[720].status !== 'idle' || wsUploadProgress[1080].status !== 'idle') && (
    <Box sx={{ p: 3, pt: 0 }}>
      <Typography variant="body2" sx={{ color: '#cbd5e1', mb: 1 }}>Upload Progress</Typography>
      {wsUploadProgress[720].status !== 'idle' && (
        <UploadProgress
          progress={wsUploadProgress[720].progress}
          fileName={wsUploadProgress[720].fileName}
          status={wsUploadProgress[720].status}
        />
      )}
      {wsUploadProgress[1080].status !== 'idle' && (
        <UploadProgress
          progress={wsUploadProgress[1080].progress}
          fileName={wsUploadProgress[1080].fileName}
          status={wsUploadProgress[1080].status}
        />
      )}
    </Box>
  )}
</Dialog>

{/* Edit Episode Dialog */}
<Dialog 
  open={editEpisodeDialog} 
  onClose={() => setEditEpisodeDialog(false)} 
  fullWidth 
  maxWidth="sm"
  PaperProps={{ sx: { background: 'rgba(15,32,39,0.98)', border: '1px solid rgba(79,172,254,0.25)', color: 'white' } }}
>
  <DialogTitle>Edit Episode (replace qualities optional)</DialogTitle>
  <DialogContent dividers>
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <TextField
          label="Season"
          type="number"
          value={editSeasonNum}
          onChange={(e)=>setEditSeasonNum(e.target.value)}
          fullWidth
          size="small"
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Episode"
          type="number"
          value={editEpisodeNum}
          onChange={(e)=>setEditEpisodeNum(e.target.value)}
          fullWidth
          size="small"
        />
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body2" sx={{ mb: 1, color: '#4facfe', fontWeight: 'bold' }}>Replace 720p (optional)</Typography>
        <Button 
          variant="outlined" 
          component="label" 
          fullWidth
          startIcon={editVideo720 ? <CheckIcon /> : <CloudUploadIcon />}
          sx={{
            borderColor: editVideo720 ? '#10b981' : '#4facfe',
            color: editVideo720 ? '#10b981' : '#4facfe'
          }}
        >
          {editVideo720 ? `✓ ${editVideo720.name}` : 'Select 720p file'}
          <input type="file" hidden accept="video/*" onChange={handleEditFile720Change} />
        </Button>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body2" sx={{ mb: 1, color: '#00f2fe', fontWeight: 'bold' }}>Replace 1080p (optional)</Typography>
        <Button 
          variant="outlined" 
          component="label" 
          fullWidth
          startIcon={editVideo1080 ? <CheckIcon /> : <CloudUploadIcon />}
          sx={{
            borderColor: editVideo1080 ? '#10b981' : '#00f2fe',
            color: editVideo1080 ? '#10b981' : '#00f2fe'
          }}
        >
          {editVideo1080 ? `✓ ${editVideo1080.name}` : 'Select 1080p file'}
          <input type="file" hidden accept="video/*" onChange={handleEditFile1080Change} />
        </Button>
      </Grid>
    </Grid>

    {/* Upload Progress for Edit */}
    {(wsUploadProgress[720].status !== 'idle' || wsUploadProgress[1080].status !== 'idle') && (
      <Box sx={{ mt: 3 }}>
        <Typography variant="body2" sx={{ color: '#cbd5e1', mb: 2, fontWeight: 'bold' }}>Upload Progress</Typography>
        {wsUploadProgress[720].status !== 'idle' && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ color: '#4facfe', fontWeight: 'bold' }}>720p Upload</Typography>
            <UploadProgress
              progress={wsUploadProgress[720].progress}
              fileName={wsUploadProgress[720].fileName}
              status={wsUploadProgress[720].status}
            />
          </Box>
        )}
        {wsUploadProgress[1080].status !== 'idle' && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ color: '#00f2fe', fontWeight: 'bold' }}>1080p Upload</Typography>
            <UploadProgress
              progress={wsUploadProgress[1080].progress}
              fileName={wsUploadProgress[1080].fileName}
              status={wsUploadProgress[1080].status}
            />
          </Box>
        )}
      </Box>
    )}
  </DialogContent>
  <DialogActions>
    <Button 
      onClick={()=>{
        setEditEpisodeDialog(false);
        setWsUploadProgress({
          720: { progress: 0, status: 'idle', fileName: '', uploadId: null },
          1080: { progress: 0, status: 'idle', fileName: '', uploadId: null }
        });
      }} 
      sx={{ color: '#cbd5e1' }}
      disabled={isEditUploading}
    >
      Cancel
    </Button>
    <Button
      variant="contained"
      disabled={isEditUploading}
      onClick={async ()=>{
        try {
          if (!selectedSeries || !editSeasonNum || !editEpisodeNum) return;
          
          setIsEditUploading(true);
          let uploadId720=null, uploadId1080=null;
          
          if (editVideo720) {
            uploadId720 = await wsEditUploadFileInChunks(editVideo720, 720);
          }
          if (editVideo1080) {
            uploadId1080 = await wsEditUploadFileInChunks(editVideo1080, 1080);
          }
          
          const payload = {};
          if (uploadId720) payload.uploadId720 = uploadId720;
          if (uploadId1080) payload.uploadId1080 = uploadId1080;
          
          const res = await Apihelper.updateEpisodeWithChunks(selectedSeries._id, Number(editSeasonNum), Number(editEpisodeNum), payload);
          
          if (res.status === 200) {
            toast.success('Episode updated successfully!');
            setEditEpisodeDialog(false);
            setWsUploadProgress({
              720: { progress: 0, status: 'idle', fileName: '', uploadId: null },
              1080: { progress: 0, status: 'idle', fileName: '', uploadId: null }
            });
            await loadAllSeries();
          }
        } catch (e) {
          toast.error(e?.response?.data?.message || 'Failed to update episode');
        } finally {
          setIsEditUploading(false);
        }
      }}
      sx={{ 
        background: isEditUploading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(45deg,#4facfe,#00f2fe)',
        '&:disabled': {
          background: 'rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.3)'
        }
      }}
    >
      {isEditUploading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={16} sx={{ color: 'white' }} />
          Updating...
        </Box>
      ) : 'Save Changes'}
    </Button>
  </DialogActions>
</Dialog>
    </Box>
  );
};

export default WebSeriesManagement;
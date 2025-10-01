import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
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
  Movie as MovieIcon
} from '@mui/icons-material';
import { Apihelper } from '../../common/service/ApiHelper';
import { toast } from 'react-toastify';

const WebSeriesManagement = () => {
  // State management
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [expandedSeries, setExpandedSeries] = useState({});
  
  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // Dialog states
  const [createSeriesDialog, setCreateSeriesDialog] = useState(false);
  const [addSeasonDialog, setAddSeasonDialog] = useState(false);
  const [addEpisodeDialog, setAddEpisodeDialog] = useState(false);
  
  // Form states
  const [newSeriesTitle, setNewSeriesTitle] = useState('');
  const [newSeasonNumber, setNewSeasonNumber] = useState('');
  const [newEpisodeNumber, setNewEpisodeNumber] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');

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
  };

  // Step 3: Add Season to Series
  const addSeasonToSeries = async () => {
    try {
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
  };

  // Step 4: Add Episode to Season
  const addEpisodeToSeason = async () => {
    try {
      if (!selectedSeries || !newSeasonNumber || !newEpisodeNumber || !newVideoUrl) {
        toast.error('Please fill all fields');
        return;
      }

      console.log('🔄 Adding episode to season:', {
        seriesId: selectedSeries._id,
        seasonNumber: parseInt(newSeasonNumber),
        episodeNumber: parseInt(newEpisodeNumber),
        videoUrl: newVideoUrl
      });
      
      const response = await Apihelper.addEpisodeToSeason(
        selectedSeries._id,
        parseInt(newSeasonNumber),
        parseInt(newEpisodeNumber),
        newVideoUrl
      );
      
      console.log('✅ Episode added:', response.data);
      toast.success(`Episode ${newEpisodeNumber} added to Season ${newSeasonNumber}!`);
      
      setNewEpisodeNumber('');
      setNewVideoUrl('');
      setAddEpisodeDialog(false);
      
      // Reload the list
      await loadAllSeries();
      
    } catch (error) {
      console.error('❌ Error adding episode:', error);
      toast.error(error?.response?.data?.message || 'Failed to add episode');
    }
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
          onClick={loadAllSeries}
          disabled={loading}
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
          {loading ? 'Loading...' : 'Refresh List'}
        </Button>
          </Box>
      </Box>

        {/* Series List in Table Format */}
        <Box sx={{ width: '100%', overflowX: 'auto', mb: 3 }}>
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
                                    </Box>
                                  </AccordionSummary>
                                  <AccordionDetails sx={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                                    {season.episodes && season.episodes.length > 0 ? (
                                      <TableContainer>
                                        <Table size="small">
                                          <TableHead>
                                            <TableRow>
                                              <TableCell sx={{ color: '#cbd5e1', fontWeight: 'bold', borderColor: 'rgba(255,255,255,0.1)' }}>Episode #</TableCell>
                                              <TableCell sx={{ color: '#cbd5e1', fontWeight: 'bold', borderColor: 'rgba(255,255,255,0.1)' }}>Video URL</TableCell>
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
                                                  <Tooltip title={episode.videoUrl} arrow>
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
                                                        border: '1px solid rgba(79,172,254,0.3)'
                                                      }}
                                                    >
                                                      {episode.videoUrl}
                                                    </Typography>
                                                  </Tooltip>
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
                                                      variant="contained"
                                                      startIcon={<PlayIcon />}
                                                      onClick={() => window.open(episode.videoUrl, '_blank')}
                                                      sx={{ 
                                                        fontSize: '0.7rem',
                                                        backgroundColor: '#4facfe',
                                                        '&:hover': { backgroundColor: '#00f2fe' }
                                                      }}
                                                    >
                                                      Play
                                                    </Button>
                                                    <Button
                                                      size="small"
                                                      variant="outlined"
                                                      startIcon={<CopyIcon />}
                                                      onClick={() => {
                                                        navigator.clipboard.writeText(episode.videoUrl);
                                                        toast.success('Video URL copied to clipboard!');
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
                                                      Copy
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
      <Dialog open={createSeriesDialog} onClose={() => setCreateSeriesDialog(false)}>
        <DialogTitle>Create New Web Series</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Series Title"
            fullWidth
            variant="outlined"
            value={newSeriesTitle}
            onChange={(e) => setNewSeriesTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateSeriesDialog(false)}>Cancel</Button>
          <Button onClick={createNewSeries} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Season Dialog */}
      <Dialog open={addSeasonDialog} onClose={() => setAddSeasonDialog(false)}>
        <DialogTitle>
          Add Season to "{selectedSeries?.title}"
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Season Number"
            type="number"
            fullWidth
            variant="outlined"
            value={newSeasonNumber}
            onChange={(e) => setNewSeasonNumber(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddSeasonDialog(false)}>Cancel</Button>
          <Button onClick={addSeasonToSeries} variant="contained">
            Add Season
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Episode Dialog */}
      <Dialog open={addEpisodeDialog} onClose={() => setAddEpisodeDialog(false)}>
        <DialogTitle>
          Add Episode to "{selectedSeries?.title}"
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Season Number"
            type="number"
            fullWidth
            variant="outlined"
            value={newSeasonNumber}
            onChange={(e) => setNewSeasonNumber(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Episode Number"
            type="number"
            fullWidth
            variant="outlined"
            value={newEpisodeNumber}
            onChange={(e) => setNewEpisodeNumber(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Video URL"
            fullWidth
            variant="outlined"
            value={newVideoUrl}
            onChange={(e) => setNewVideoUrl(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddEpisodeDialog(false)}>Cancel</Button>
          <Button onClick={addEpisodeToSeason} variant="contained">
            Add Episode
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WebSeriesManagement;
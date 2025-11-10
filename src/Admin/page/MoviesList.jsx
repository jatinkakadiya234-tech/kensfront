import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Dialog,
  DialogContent,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Movie,
  Edit,
  Delete,
  Add as AddIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import MovieCreateForm from './MovieCreateForm';
import { Apihelper } from '../../common/service/ApiHelper';

const MoviesList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [movies, setMovies] = useState([]);
  const [editMovie, setEditMovie] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMovies, setTotalMovies] = useState(0);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState({});
  const pageSize = 7;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // ---------- Modal Handlers ----------
  const handleOpenModal = (movie = null) => {
    setEditMovie(movie);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditMovie(null);
  };

  // ---------- Fetch Movies ----------
  const ListMovis = async (currentPage = 1) => {
    try {
      setLoading(true);
      const res = await Apihelper.ListMovise(currentPage, pageSize);
      const data = res?.data?.data;
      setMovies(data?.movies || []);
      setTotalMovies(data?.total || 0);
      setTotalPages(data?.pages || 1);
      setPage(data?.page || 1);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    ListMovis(page);
  }, [page]);

  // ---------- Delete Movie ----------
  const handleDeleteMovie = async (id) => {
    try {
      await Apihelper.DeleteMovise(id);
      ListMovis(page);
    } catch (error) {
      console.error('Delete Error:', error);
    }
  };

  // ---------- Copy Link ----------
  const handleCopy = (movieId, quality, url) => {
    try {
      navigator.clipboard.writeText(url);
      const key = `${movieId}_${quality}`;
      setCopied((prev) => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopied((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      }, 1200);
    } catch (err) {
      console.error('Copy failed', err);
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
            mb: 4,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              mb: { xs: 2, sm: 0 },
            }}
          >
            Movies List
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenModal}
            sx={{
              background: 'linear-gradient(45deg, #4facfe, #00f2fe)',
              boxShadow: '0 4px 15px rgba(79,172,254,0.3)',
              '&:hover': { opacity: 0.95 },
              textTransform: 'none',
              px: 3,
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            Add New Movie
          </Button>
        </Box>

        {/* Movies Table */}
        <Box sx={{ width: '100%', overflowX: 'auto', mb: 3 }}>
          <Paper
            sx={{
              borderRadius: 2,
              minWidth: 600,
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {loading ? (
              <Typography sx={{ color: 'white', p: 3, textAlign: 'center' }}>
                Loading movies...
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#cbd5e1', fontWeight: 'bold' }}>
                        Movie
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ color: '#cbd5e1', fontWeight: 'bold' }}
                      >
                        720
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ color: '#cbd5e1', fontWeight: 'bold' }}
                      >
                        1080
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ color: '#cbd5e1', fontWeight: 'bold' }}
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {movies.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          align="center"
                          sx={{ color: 'white', py: 3 }}
                        >
                          No movies found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      movies.map((movie) => (
                        <TableRow
                          key={movie._id}
                          sx={{
                            '&:last-child td': { borderBottom: 0 },
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' },
                          }}
                        >
                          <TableCell sx={{ color: 'white' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Movie sx={{ color: '#4facfe', mr: 1 }} />
                              <Box>
                                <Typography variant="body2">
                                  {movie.name}
                                </Typography>
                                {movie.isPremium && (
                                  <Typography
                                    variant="caption"
                                    sx={{ color: 'gold' }}
                                  >
                                    Premium
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </TableCell>

                          {/* 720p */}
                          <TableCell align="right" sx={{ color: 'white' }}>
                            {movie?.qualities?.['720p'] ? (
                              (() => {
                                const fullLink = `http://localhost:5173/watch?video=${encodeURIComponent(
                                  movie.qualities['720p']
                                )}`;
                                const key = `${movie._id}_720p`;
                                return (
                                  <>
                                    <a
                                      href={fullLink}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleCopy(
                                          movie._id,
                                          '720p',
                                          fullLink
                                        );
                                      }}
                                      style={{
                                        color: '#4FC3F7',
                                        textDecoration: 'underline',
                                        cursor: 'pointer',
                                      }}
                                    >
                                      Copy 720p
                                    </a>
                                    {copied[key] && (
                                      <span
                                        style={{
                                          color: '#4FC3F7',
                                          marginLeft: 6,
                                          fontSize: 11,
                                        }}
                                      >
                                        Copied!
                                      </span>
                                    )}
                                  </>
                                );
                              })()
                            ) : (
                              '-'
                            )}
                          </TableCell>

                          {/* 1080p */}
                          <TableCell align="right" sx={{ color: 'white' }}>
                            {movie?.qualities?.['1080p'] ? (
                              (() => {
                                const fullLink = `https://kensdrive.co.in/watch?video=${encodeURIComponent(
                                  movie.qualities['1080p']
                                )}`;
                                const key = `${movie._id}_1080p`;
                                return (
                                  <>
                                    <a
                                      href={fullLink}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleCopy(
                                          movie._id,
                                          '1080p',
                                          fullLink
                                        );
                                      }}
                                      style={{
                                        color: '#4FC3F7',
                                        textDecoration: 'underline',
                                        cursor: 'pointer',
                                      }}
                                    >
                                      Copy 1080p
                                    </a>
                                    {copied[key] && (
                                      <span
                                        style={{
                                          color: '#4FC3F7',
                                          marginLeft: 6,
                                          fontSize: 11,
                                        }}
                                      >
                                        Copied!
                                      </span>
                                    )}
                                  </>
                                );
                              })()
                            ) : (
                              '-'
                            )}
                          </TableCell>

                          {/* Actions */}
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteMovie(movie._id)}
                            >
                              <Delete sx={{ color: '#f44336' }} />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenModal(movie)}
                            >
                              <Edit sx={{ color: '#4fc3f7' }} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Box>

        {/* Pagination */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mt: 2,
            color: 'white',
          }}
        >
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Showing page {page} of {totalPages} — Total {totalMovies} movies
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="outlined"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}
            >
              Previous
            </Button>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Page {page}
            </Typography>
            <Button
              variant="outlined"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}
            >
              Next
            </Button>
          </Box>
        </Box>

        {/* Modal */}
        <Dialog
          open={isModalOpen}
          onClose={handleCloseModal}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            style: {
              backgroundColor: 'transparent',
              boxShadow: 'none',
            },
          }}
        >
          <DialogContent sx={{ p: 0, bgcolor: 'transparent' }}>
            <Box sx={{ position: 'relative' }}>
              <IconButton
                onClick={handleCloseModal}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: 'white',
                  bgcolor: 'rgba(0,0,0,0.5)',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                  zIndex: 1,
                }}
              >
                <CloseIcon />
              </IconButton>
              <MovieCreateForm
                ListMovis={() => ListMovis(page)}
                handleCloseModal={handleCloseModal}
                editMovie={editMovie}
              />
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    </Box>
  );
};

export default MoviesList;

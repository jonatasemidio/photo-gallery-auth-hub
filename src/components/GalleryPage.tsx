import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Pagination,
  CircularProgress,
  Alert,
  InputAdornment,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Search,
  PhotoLibrary,
  AccountCircle,
  Logout,
  Refresh,
} from '@mui/icons-material';
import PhotoCard from './PhotoCard';
import PhotoDialog from './PhotoDialog';
import { Photo, photoContent, PhotoManifest } from '../services/photoContent';
import { googleSheets, PhotoData } from '../services/googleSheets';
import { googleAuth, AuthState } from '../services/googleAuth';

interface GalleryPageProps {
  authState: AuthState;
  onSignOut: () => void;
}

const PHOTOS_PER_PAGE = 12;

const GalleryPage: React.FC<GalleryPageProps> = ({ authState, onSignOut }) => {
  const [manifest, setManifest] = useState<PhotoManifest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filter and paginate photos
  const filteredPhotos = useMemo(() => {
    if (!manifest) return [];
    return photoContent.filterPhotos(manifest.photos, searchTerm);
  }, [manifest, searchTerm]);

  const paginatedPhotos = useMemo(() => {
    return photoContent.getPaginatedPhotos(filteredPhotos, currentPage, PHOTOS_PER_PAGE);
  }, [filteredPhotos, currentPage]);

  const totalPages = Math.ceil(filteredPhotos.length / PHOTOS_PER_PAGE);

  // Load photo manifest on component mount
  useEffect(() => {
    loadPhotoManifest();
  }, []);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm]);

  const loadPhotoManifest = async () => {
    try {
      setError(null);
      
      // Check for cached manifest first
      const cached = photoContent.getCachedManifest();
      if (cached) {
        setManifest(cached);
        setLoading(false);
      }

      // TODO: Initialize Google Sheets service
      // const API_KEY = 'your-google-sheets-api-key';
      // const SPREADSHEET_ID = 'your-spreadsheet-id';
      // await googleSheets.initialize(API_KEY, SPREADSHEET_ID);
      
      // For now, use empty sheets data
      const sheetsData: PhotoData[] = [];
      
      // Build fresh manifest
      const freshManifest = await photoContent.buildPhotoManifest(sheetsData);
      setManifest(freshManifest);
      
    } catch (error) {
      console.error('Error loading photo manifest:', error);
      setError('Failed to load photo gallery. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPhotoManifest();
    setRefreshing(false);
  };

  const handleToggleFavorite = async (path: string, currentFavorite: boolean) => {
    try {
      // TODO: Update Google Sheets
      // await googleSheets.toggleFavorite(path, currentFavorite);
      
      // Update local manifest
      photoContent.updatePhotoInManifest(path, { favorite: !currentFavorite });
      
      // Refresh manifest
      const updatedManifest = photoContent.getCachedManifest();
      if (updatedManifest) {
        setManifest({ ...updatedManifest });
      }
      
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  };

  const handleSavePhoto = async (photo: Photo) => {
    try {
      // TODO: Update Google Sheets
      // const photoData: PhotoData = {
      //   path: photo.path,
      //   name: photo.name,
      //   favorite: photo.favorite,
      //   description: photo.description,
      // };
      // await googleSheets.updatePhoto(photoData);
      
      // Update local manifest
      photoContent.updatePhotoInManifest(photo.path, photo);
      
      // Refresh manifest
      const updatedManifest = photoContent.getCachedManifest();
      if (updatedManifest) {
        setManifest({ ...updatedManifest });
      }
      
    } catch (error) {
      console.error('Error saving photo:', error);
      throw error;
    }
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleSignOut = () => {
    handleUserMenuClose();
    onSignOut();
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'hsl(var(--background))',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ color: 'hsl(var(--primary))' }} />
          <Typography sx={{ mt: 2, color: 'hsl(var(--muted-foreground))' }}>
            Loading your photo gallery...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'hsl(var(--background))' }}>
      {/* App Bar */}
      <AppBar
        position="sticky"
        elevation={1}
        sx={{
          bgcolor: 'hsl(var(--card))',
          borderBottom: '1px solid hsl(var(--border))',
          backdropFilter: 'blur(8px)',
        }}
      >
        <Toolbar>
          <PhotoLibrary sx={{ mr: 2, color: 'hsl(var(--primary))' }} />
          <Typography
            variant="h6"
            component="h1"
            sx={{ flexGrow: 1, color: 'hsl(var(--foreground))' }}
          >
            Photo Gallery
          </Typography>
          
          <IconButton
            onClick={handleRefresh}
            disabled={refreshing}
            sx={{ mr: 1, color: 'hsl(var(--muted-foreground))' }}
          >
            <Refresh />
          </IconButton>

          <IconButton
            onClick={handleUserMenuOpen}
            sx={{ color: 'hsl(var(--foreground))' }}
          >
            {authState.user?.picture ? (
              <Avatar
                src={authState.user.picture}
                alt={authState.user.name}
                sx={{ width: 32, height: 32 }}
              />
            ) : (
              <AccountCircle />
            )}
          </IconButton>

          <Menu
            anchorEl={userMenuAnchor}
            open={Boolean(userMenuAnchor)}
            onClose={handleUserMenuClose}
            PaperProps={{
              sx: {
                bgcolor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
              },
            }}
          >
            <MenuItem onClick={handleUserMenuClose} disabled>
              <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                {authState.user?.email}
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleSignOut}>
              <Logout sx={{ mr: 1 }} />
              Sign Out
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 2 }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* Search and Stats */}
        <Box sx={{ mb: 4 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              mb: 3,
            }}
          >
            <Typography
              variant="h4"
              sx={{
                color: 'hsl(var(--foreground))',
                fontWeight: 600,
              }}
            >
              Your Photos
              {manifest && (
                <Typography
                  variant="body2"
                  component="span"
                  sx={{
                    ml: 2,
                    color: 'hsl(var(--muted-foreground))',
                    fontWeight: 400,
                  }}
                >
                  ({filteredPhotos.length} of {manifest.totalCount})
                </Typography>
              )}
            </Typography>

            <TextField
              placeholder="Search photos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'hsl(var(--muted-foreground))' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                minWidth: 250,
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'hsl(var(--card))',
                  '& fieldset': {
                    borderColor: 'hsl(var(--border))',
                  },
                  '&:hover fieldset': {
                    borderColor: 'hsl(var(--primary))',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'hsl(var(--primary))',
                  },
                },
                '& .MuiOutlinedInput-input': {
                  color: 'hsl(var(--foreground))',
                },
              }}
            />
          </Box>

          {/* Empty State */}
          {filteredPhotos.length === 0 && !loading && (
            <Box
              sx={{
                textAlign: 'center',
                py: 8,
                color: 'hsl(var(--muted-foreground))',
              }}
            >
              <PhotoLibrary sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                {searchTerm ? 'No photos found' : 'No photos yet'}
              </Typography>
              <Typography variant="body2">
                {searchTerm
                  ? 'Try adjusting your search terms'
                  : 'Add some photos to your /content folder to get started'
                }
              </Typography>
            </Box>
          )}
        </Box>

        {/* Photo Grid */}
        {filteredPhotos.length > 0 && (
          <>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                  lg: 'repeat(4, 1fr)',
                },
                gap: 3,
                mb: 4,
              }}
            >
              {paginatedPhotos.map((photo) => (
                <PhotoCard
                  key={photo.path}
                  photo={photo}
                  onToggleFavorite={handleToggleFavorite}
                  onPhotoClick={setSelectedPhoto}
                />
              ))}
            </Box>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage + 1}
                  onChange={(_, page) => setCurrentPage(page - 1)}
                  color="primary"
                  size="large"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: 'hsl(var(--muted-foreground))',
                      '&.Mui-selected': {
                        bgcolor: 'hsl(var(--primary))',
                        color: 'hsl(var(--primary-foreground))',
                      },
                      '&:hover': {
                        bgcolor: 'hsl(var(--accent))',
                      },
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Container>

      {/* Photo Dialog */}
      <PhotoDialog
        open={Boolean(selectedPhoto)}
        photo={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        onSave={handleSavePhoto}
      />
    </Box>
  );
};

export default GalleryPage;
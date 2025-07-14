import React, { useState, useEffect } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  IconButton,
  Box,
  Skeleton,
  Fade,
} from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { Photo } from '../services/photoContent';

interface PhotoCardProps {
  photo: Photo;
  onToggleFavorite: (path: string, currentFavorite: boolean) => Promise<void>;
  onPhotoClick: (photo: Photo) => void;
}

const PhotoCard: React.FC<PhotoCardProps> = ({
  photo,
  onToggleFavorite,
  onPhotoClick,
}) => {
  const [imageLoaded, setImageLoaded] = useState(photo.loaded);
  const [imageError, setImageError] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    if (!imageLoaded && !imageError) {
      // Preload image
      const img = new Image();
      img.onload = () => setImageLoaded(true);
      img.onerror = () => setImageError(true);
      img.src = photo.url;
    }
  }, [photo.url, imageLoaded, imageError]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoriteLoading(true);
    
    try {
      await onToggleFavorite(photo.path, photo.favorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleCardClick = () => {
    if (imageLoaded) {
      onPhotoClick(photo);
    }
  };

  return (
    <Fade in timeout={300}>
      <Card
        className="polaroid-card"
        sx={{
          cursor: imageLoaded ? 'pointer' : 'default',
          maxWidth: 280,
          margin: 'auto',
          position: 'relative',
          transform: imageLoaded ? 'none' : 'scale(0.98)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': imageLoaded ? {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: 'var(--shadow-floating)',
          } : {},
        }}
        onClick={handleCardClick}
      >
        {/* Photo Container */}
        <Box
          sx={{
            position: 'relative',
            paddingTop: '100%', // 1:1 Aspect Ratio for Polaroid style
            background: 'hsl(var(--skeleton))',
            overflow: 'hidden',
          }}
        >
          {/* Loading Skeleton */}
          {!imageLoaded && !imageError && (
            <Skeleton
              variant="rectangular"
              animation="wave"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                bgcolor: 'hsl(var(--skeleton))',
              }}
            />
          )}

          {/* Error State */}
          {imageError && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'hsl(var(--muted))',
                color: 'hsl(var(--muted-foreground))',
              }}
            >
              <Typography variant="body2">Failed to load</Typography>
            </Box>
          )}

          {/* Actual Image */}
          {imageLoaded && (
            <CardMedia
              component="img"
              image={photo.url}
              alt={photo.name}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.3s ease',
              }}
            />
          )}

          {/* Favorite Button */}
          <IconButton
            className={`heart-button ${photo.favorite ? 'favorited' : ''}`}
            onClick={handleToggleFavorite}
            disabled={favoriteLoading}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.95)',
                transform: 'scale(1.1)',
              },
              '&.favorited': {
                bgcolor: 'rgba(255, 192, 203, 0.9)',
              },
            }}
          >
            {photo.favorite ? (
              <Favorite sx={{ color: 'hsl(var(--favorite-filled))' }} />
            ) : (
              <FavoriteBorder sx={{ color: 'hsl(var(--muted-foreground))' }} />
            )}
          </IconButton>

          {/* Gradient Overlay for Text Readability */}
          {imageLoaded && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '30%',
                background: 'var(--gradient-overlay)',
                pointerEvents: 'none',
              }}
            />
          )}
        </Box>

        {/* Photo Title - Polaroid Style */}
        <CardContent
          sx={{
            textAlign: 'center',
            py: 2,
            bgcolor: 'hsl(var(--card))',
            borderTop: '1px solid hsl(var(--border))',
          }}
        >
          <Typography
            variant="body1"
            component="h3"
            sx={{
              fontWeight: 500,
              color: 'hsl(var(--foreground))',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontSize: '0.95rem',
            }}
          >
            {photo.name}
          </Typography>
          
          {photo.description && (
            <Typography
              variant="caption"
              sx={{
                color: 'hsl(var(--muted-foreground))',
                display: 'block',
                mt: 0.5,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {photo.description}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Fade>
  );
};

export default PhotoCard;
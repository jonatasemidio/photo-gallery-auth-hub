import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  FormControlLabel,
  Switch,
  Divider,
} from '@mui/material';
import { Close, Favorite, FavoriteBorder } from '@mui/icons-material';
import { Photo } from '../services/photoContent';

interface PhotoDialogProps {
  open: boolean;
  photo: Photo | null;
  onClose: () => void;
  onSave: (photo: Photo) => Promise<void>;
}

const PhotoDialog: React.FC<PhotoDialogProps> = ({
  open,
  photo,
  onClose,
  onSave,
}) => {
  const [editedPhoto, setEditedPhoto] = useState<Photo | null>(null);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (photo) {
      setEditedPhoto({ ...photo });
    }
  }, [photo]);

  const handleSave = async () => {
    if (!editedPhoto) return;

    setSaving(true);
    try {
      await onSave(editedPhoto);
      onClose();
    } catch (error) {
      console.error('Error saving photo:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (field: keyof Photo, value: any) => {
    if (editedPhoto) {
      setEditedPhoto({
        ...editedPhoto,
        [field]: value,
      });
    }
  };

  if (!photo || !editedPhoto) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh',
          bgcolor: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
          borderBottom: '1px solid hsl(var(--border))',
        }}
      >
        <Typography variant="h6" component="h2" sx={{ color: 'hsl(var(--foreground))' }}>
          Edit Photo Details
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Photo Preview */}
          <Box sx={{ flex: 1, minWidth: 250 }}>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                paddingTop: '100%',
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: 'hsl(var(--muted))',
                border: '1px solid hsl(var(--border))',
              }}
            >
              <img
                src={photo.url}
                alt={photo.name}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </Box>
            
            {/* Photo Stats */}
            <Box sx={{ mt: 2, p: 2, bgcolor: 'hsl(var(--muted))', borderRadius: 1 }}>
              <Typography variant="caption" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                <strong>Path:</strong> {photo.path}
              </Typography>
            </Box>
          </Box>

          {/* Edit Form */}
          <Box sx={{ flex: 1, minWidth: 300 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Favorite Toggle */}
              <FormControlLabel
                control={
                  <Switch
                    checked={editedPhoto.favorite}
                    onChange={(e) => handleFieldChange('favorite', e.target.checked)}
                    icon={<FavoriteBorder />}
                    checkedIcon={<Favorite sx={{ color: 'hsl(var(--favorite-filled))' }} />}
                    sx={{
                      '& .MuiSwitch-thumb': {
                        color: editedPhoto.favorite ? 'hsl(var(--favorite-filled))' : 'inherit',
                      },
                    }}
                  />
                }
                label={
                  <Typography sx={{ color: 'hsl(var(--foreground))' }}>
                    Mark as Favorite
                  </Typography>
                }
              />

              <Divider />

              {/* Photo Name */}
              <TextField
                label="Photo Name"
                fullWidth
                value={editedPhoto.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'hsl(var(--background))',
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
                  '& .MuiInputLabel-root': {
                    color: 'hsl(var(--muted-foreground))',
                    '&.Mui-focused': {
                      color: 'hsl(var(--primary))',
                    },
                  },
                  '& .MuiOutlinedInput-input': {
                    color: 'hsl(var(--foreground))',
                  },
                }}
              />

              {/* Description */}
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={4}
                value={editedPhoto.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                variant="outlined"
                placeholder="Add a description for this photo..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'hsl(var(--background))',
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
                  '& .MuiInputLabel-root': {
                    color: 'hsl(var(--muted-foreground))',
                    '&.Mui-focused': {
                      color: 'hsl(var(--primary))',
                    },
                  },
                  '& .MuiOutlinedInput-input': {
                    color: 'hsl(var(--foreground))',
                  },
                }}
              />

              {/* Helper Text */}
              <Typography
                variant="caption"
                sx={{
                  color: 'hsl(var(--muted-foreground))',
                  fontStyle: 'italic',
                  mt: 1,
                }}
              >
                Changes will be saved to your Google Spreadsheet
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          p: 3,
          pt: 2,
          borderTop: '1px solid hsl(var(--border))',
          gap: 1,
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderColor: 'hsl(var(--border))',
            color: 'hsl(var(--muted-foreground))',
            '&:hover': {
              borderColor: 'hsl(var(--primary))',
              bgcolor: 'hsl(var(--accent))',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          variant="contained"
          sx={{
            bgcolor: 'hsl(var(--primary))',
            color: 'hsl(var(--primary-foreground))',
            '&:hover': {
              bgcolor: 'hsl(var(--primary-hover))',
            },
            '&:disabled': {
              bgcolor: 'hsl(var(--muted))',
              color: 'hsl(var(--muted-foreground))',
            },
          }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PhotoDialog;
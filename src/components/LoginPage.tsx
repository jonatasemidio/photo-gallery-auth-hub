import React, { useEffect, useRef, useState } from 'react';
import { Container, Box, Typography, Alert, Paper } from '@mui/material';
import { PhotoLibrary } from '@mui/icons-material';
import { googleAuth, AuthState } from '../services/googleAuth';

interface LoginPageProps {
  onAuthStateChange: (state: AuthState) => void;
  authState: AuthState;
}

const LoginPage: React.FC<LoginPageProps> = ({ onAuthStateChange, authState }) => {
  const signInButtonRef = useRef<HTMLDivElement>(null);
  const [setupError, setSetupError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize Google Auth with your client ID
    const initializeAuth = async () => {
      try {
        // TODO: Replace with your actual Google OAuth Client ID
        // Get it from: https://console.cloud.google.com/
        const CLIENT_ID = 'your-google-client-id.apps.googleusercontent.com';
        
        // Check if still using placeholder
        if (CLIENT_ID.includes('your-google-client-id')) {
          setSetupError('Google OAuth not configured. Please set up your credentials first.');
          return;
        }
        
        await googleAuth.initialize(CLIENT_ID);
        
        // Render sign-in button
        if (signInButtonRef.current) {
          signInButtonRef.current.id = 'google-signin-button';
          googleAuth.renderSignInButton('google-signin-button');
        }
      } catch (error) {
        console.error('Failed to initialize Google Auth:', error);
        setSetupError('Failed to initialize Google Authentication. Please check your setup.');
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = googleAuth.onAuthStateChange(onAuthStateChange);
    return unsubscribe;
  }, [onAuthStateChange]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(35 60% 60%) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={8}
          sx={{
            padding: 4,
            borderRadius: 3,
            textAlign: 'center',
            background: 'hsl(var(--card))',
            backdropFilter: 'blur(10px)',
            border: '1px solid hsl(var(--border))',
          }}
        >
          {/* Logo and Title */}
          <Box sx={{ mb: 4 }}>
            <PhotoLibrary
              sx={{
                fontSize: 64,
                color: 'hsl(var(--primary))',
                mb: 2,
              }}
            />
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 700,
                color: 'hsl(var(--foreground))',
                mb: 1,
              }}
            >
              Photo Gallery
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'hsl(var(--muted-foreground))',
                fontWeight: 400,
              }}
            >
              Organize and share your beautiful memories
            </Typography>
          </Box>

          {/* Setup Error Message */}
          {setupError && (
            <Alert
              severity="warning"
              sx={{
                mb: 3,
                borderRadius: 2,
                textAlign: 'left',
                '& .MuiAlert-message': {
                  fontSize: '1rem',
                },
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Setup Required
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {setupError}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                Quick Setup Steps:
              </Typography>
              <Box component="ol" sx={{ pl: 2, m: 0 }}>
                <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener" style={{ color: 'inherit' }}>Google Cloud Console</a></li>
                <li>Create a new project or select existing</li>
                <li>Enable "Google Identity Services API"</li>
                <li>Create OAuth 2.0 credentials (Web application)</li>
                <li>Add your domain to authorized origins</li>
                <li>Copy Client ID and update <code>src/services/googleAuth.ts</code></li>
              </Box>
            </Alert>
          )}

          {/* Auth Error Message */}
          {authState.error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
                '& .MuiAlert-message': {
                  fontSize: '1rem',
                },
              }}
            >
              {authState.error}
            </Alert>
          )}

          {/* Sign In Instructions */}
          <Typography
            variant="body1"
            sx={{
              mb: 3,
              color: 'hsl(var(--muted-foreground))',
              lineHeight: 1.6,
            }}
          >
            Sign in with your Google account to access your photo gallery. 
            Only authorized users can view and manage photos.
          </Typography>

          {/* Google Sign-In Button Container */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <div ref={signInButtonRef} />
          </Box>

          {/* Features List */}
          <Box sx={{ mt: 4, textAlign: 'left' }}>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                color: 'hsl(var(--foreground))',
                fontWeight: 600,
              }}
            >
              Features
            </Typography>
            <Box sx={{ pl: 2 }}>
              {[
                'View and organize your photo collection',
                'Mark photos as favorites with a heart icon',
                'Search photos by name or description',
                'Edit photo details and descriptions',
                'Beautiful Polaroid-style photo cards',
                'Responsive design for all devices',
              ].map((feature, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{
                    mb: 1,
                    color: 'hsl(var(--muted-foreground))',
                    '&:before': {
                      content: '"•"',
                      color: 'hsl(var(--primary))',
                      mr: 1,
                    },
                  }}
                >
                  {feature}
                </Typography>
              ))}
            </Box>
          </Box>

          {/* Footer */}
          <Typography
            variant="caption"
            sx={{
              mt: 4,
              display: 'block',
              color: 'hsl(var(--muted-foreground))',
              fontStyle: 'italic',
            }}
          >
            Powered by Google Sheets and Material UI
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
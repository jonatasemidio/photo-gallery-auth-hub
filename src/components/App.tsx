import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import LoginPage from './LoginPage';
import GalleryPage from './GalleryPage';
import { googleAuth, AuthState } from '../services/googleAuth';

// Create Material UI theme with our design system colors
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: 'hsl(39, 84%, 56%)', // --primary
      contrastText: 'hsl(0, 0%, 100%)', // --primary-foreground
    },
    secondary: {
      main: 'hsl(45, 25%, 94%)', // --secondary
      contrastText: 'hsl(24, 20%, 15%)', // --secondary-foreground
    },
    background: {
      default: 'hsl(45, 23%, 97%)', // --background
      paper: 'hsl(0, 0%, 100%)', // --card
    },
    text: {
      primary: 'hsl(24, 20%, 15%)', // --foreground
      secondary: 'hsl(25, 15%, 45%)', // --muted-foreground
    },
    error: {
      main: 'hsl(0, 72%, 51%)', // --destructive
      contrastText: 'hsl(0, 0%, 100%)', // --destructive-foreground
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: 'var(--shadow-card)',
          '&:hover': {
            boxShadow: 'var(--shadow-floating)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid hsl(var(--border))',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
  },
});

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isAuthorized: false,
    user: null,
    error: null,
  });

  useEffect(() => {
    // Initialize auth state from session storage
    const currentAuthState = googleAuth.getCurrentAuthState();
    setAuthState(currentAuthState);

    // Subscribe to auth state changes
    const unsubscribe = googleAuth.onAuthStateChange(setAuthState);
    return unsubscribe;
  }, []);

  const handleSignOut = () => {
    googleAuth.signOut();
  };

  // Show login page if not authenticated or not authorized
  if (!authState.isAuthenticated || !authState.isAuthorized) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LoginPage
          authState={authState}
          onAuthStateChange={setAuthState}
        />
      </ThemeProvider>
    );
  }

  // Show gallery if authenticated and authorized
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GalleryPage
        authState={authState}
        onSignOut={handleSignOut}
      />
    </ThemeProvider>
  );
};

export default App;
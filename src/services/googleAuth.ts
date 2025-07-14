// Google Authentication Service
// Handles Google OAuth login and user validation

export interface GoogleUser {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isAuthorized: boolean;
  user: GoogleUser | null;
  error: string | null;
}

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

class GoogleAuthService {
  private clientId: string = '';
  private isInitialized: boolean = false;
  private authStateCallbacks: ((state: AuthState) => void)[] = [];

  // Replace this with your actual Google OAuth Client ID
  // Get it from: https://console.cloud.google.com/
  
  // TODO: REPLACE THIS WITH YOUR REAL GOOGLE OAUTH CLIENT ID
  // Get it from: https://console.cloud.google.com/
  // Go to: APIs & Services > Credentials > Create Credentials > OAuth 2.0 Client IDs
  // Application type: Web application
  // Add your domain to "Authorized JavaScript origins"
  // Copy the Client ID and replace the placeholder below:
  private readonly PLACEHOLDER_CLIENT_ID = 'your-google-client-id.apps.googleusercontent.com';

  // Initialize Google Identity Services
  async initialize(clientId: string): Promise<void> {
    this.clientId = clientId;
    
    return new Promise((resolve, reject) => {
      if (window.google) {
        this.setupGoogleAuth();
        this.isInitialized = true;
        resolve();
        return;
      }

      // Load Google Identity Services script
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        this.setupGoogleAuth();
        this.isInitialized = true;
        resolve();
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load Google Identity Services'));
      };
      
      document.head.appendChild(script);
    });
  }

  private setupGoogleAuth(): void {
    if (!window.google) return;

    window.google.accounts.id.initialize({
      client_id: this.clientId,
      callback: this.handleCredentialResponse.bind(this),
      auto_select: false,
      cancel_on_tap_outside: true,
    });
  }

  private async handleCredentialResponse(response: any): Promise<void> {
    try {
      // Decode JWT token to get user info
      const userInfo = this.decodeJWT(response.credential);
      
      const user: GoogleUser = {
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        sub: userInfo.sub,
      };

      // Check if user is authorized (in whitelist)
      const isAuthorized = await this.checkUserAuthorization(user.email);

      const authState: AuthState = {
        isAuthenticated: true,
        isAuthorized,
        user,
        error: isAuthorized ? null : 'Access denied. Your email is not authorized.',
      };

      // Store auth state
      sessionStorage.setItem('authState', JSON.stringify(authState));
      
      // Notify all listeners
      this.notifyAuthStateChange(authState);

    } catch (error) {
      const authState: AuthState = {
        isAuthenticated: false,
        isAuthorized: false,
        user: null,
        error: 'Authentication failed',
      };
      
      this.notifyAuthStateChange(authState);
    }
  }

  private decodeJWT(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('Invalid JWT token');
    }
  }

  // Check if user email is in the authorized list
  private async checkUserAuthorization(email: string): Promise<boolean> {
    try {
      // TODO: Replace with actual Google Sheets API call
      // For now, using a static whitelist for demo
      const authorizedEmails = [
        'admin@example.com',
        'user1@gmail.com',
        'user2@gmail.com',
        'jonatasemidio@gmail.com', // Your email - you can access once OAuth is set up
        // Add more authorized emails here
      ];

      return authorizedEmails.includes(email.toLowerCase());
    } catch (error) {
      console.error('Error checking user authorization:', error);
      return false;
    }
  }

  // Render Google Sign-In button
  renderSignInButton(elementId: string): void {
    if (!this.isInitialized || !window.google) {
      console.error('Google Auth not initialized');
      return;
    }

    window.google.accounts.id.renderButton(
      document.getElementById(elementId),
      {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        shape: 'rectangular',
        text: 'signin_with',
        logo_alignment: 'left',
        width: 300,
      }
    );
  }

  // Subscribe to auth state changes
  onAuthStateChange(callback: (state: AuthState) => void): () => void {
    this.authStateCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateCallbacks.indexOf(callback);
      if (index > -1) {
        this.authStateCallbacks.splice(index, 1);
      }
    };
  }

  private notifyAuthStateChange(state: AuthState): void {
    this.authStateCallbacks.forEach(callback => callback(state));
  }

  // Get current auth state
  getCurrentAuthState(): AuthState {
    const stored = sessionStorage.getItem('authState');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // Invalid stored state, return default
      }
    }

    return {
      isAuthenticated: false,
      isAuthorized: false,
      user: null,
      error: null,
    };
  }

  // Sign out
  signOut(): void {
    sessionStorage.removeItem('authState');
    
    const authState: AuthState = {
      isAuthenticated: false,
      isAuthorized: false,
      user: null,
      error: null,
    };

    this.notifyAuthStateChange(authState);

    if (window.google && window.google.accounts.id) {
      window.google.accounts.id.disableAutoSelect();
    }
  }
}

export const googleAuth = new GoogleAuthService();
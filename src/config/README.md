# Photo Gallery Configuration

## Setup Instructions

### 1. Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Identity API
4. Create OAuth 2.0 credentials:
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
   - Application type: Web application
   - Add your domain to authorized origins (e.g., `https://yourdomain.github.io`)
5. Copy your Client ID and update `src/services/googleAuth.ts`:
   ```typescript
   const CLIENT_ID = 'your-google-client-id.apps.googleusercontent.com';
   ```

### 2. Google Sheets Setup

1. Create a Google Spreadsheet with two tabs:
   
   **Users Tab:**
   - Column A: email addresses of authorized users
   
   **Content Tab:**
   - Column A: path (e.g., "/content/photo1.jpg")
   - Column B: name (display name for the photo)
   - Column C: favorite (TRUE/FALSE)
   - Column D: description

2. Make the spreadsheet publicly readable:
   - Share → Anyone with the link can view

3. Get your Spreadsheet ID from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`

4. Enable Google Sheets API:
   - Go to Google Cloud Console → APIs & Services → Library
   - Search for "Google Sheets API" and enable it
   - Create an API key in Credentials

5. Update `src/services/googleSheets.ts` and `src/components/GalleryPage.tsx`:
   ```typescript
   const API_KEY = 'your-google-sheets-api-key';
   const SPREADSHEET_ID = 'your-spreadsheet-id';
   ```

### 3. Content Setup

1. Create a `/content` folder in your repository root (same level as `src/`)
2. Add your image files to this folder
3. Update `/content/index.json` with the list of image paths:
   ```json
   [
     "/content/photo1.jpg",
     "/content/photo2.jpg",
     "/content/photo3.jpg"
   ]
   ```

### 4. Deploy to GitHub Pages

1. In your repository settings, go to Pages
2. Set source to "Deploy from a branch"
3. Select main branch and / (root) folder
4. Your app will be available at `https://yourusername.github.io/yourrepo`

### 5. Update Authorized Domains

Make sure to add your GitHub Pages domain to:
- Google OAuth credentials (authorized origins)
- Any CORS settings if needed

## File Structure

```
/
├── public/
│   └── content/
│       ├── index.json          # List of image files
│       ├── photo1.jpg          # Your images
│       └── photo2.jpg
├── src/
│   ├── components/
│   │   ├── App.tsx            # Main app component
│   │   ├── LoginPage.tsx      # Google OAuth login
│   │   ├── GalleryPage.tsx    # Photo gallery
│   │   ├── PhotoCard.tsx      # Individual photo cards
│   │   └── PhotoDialog.tsx    # Photo edit dialog
│   └── services/
│       ├── googleAuth.ts      # Google authentication
│       ├── googleSheets.ts    # Google Sheets integration
│       └── photoContent.ts    # Photo content management
└── README.md
```

## Features

- **Google OAuth Authentication**: Secure login with Google accounts
- **Email Whitelist**: Only authorized users can access the gallery
- **Google Sheets Backend**: Manage photo metadata in a spreadsheet
- **Responsive Design**: Works on desktop and mobile devices
- **Favorite System**: Mark photos as favorites with heart icons
- **Search Functionality**: Filter photos by name or description
- **Photo Details**: Edit photo names and descriptions
- **Pagination**: Handle large photo collections efficiently
- **Skeleton Loading**: Smooth loading experience

## Security Notes

- All API keys should be public-safe (client-side only)
- The Google Sheets spreadsheet can be public since it only contains photo metadata
- Actual photo files in `/content` are served as static assets
- Authentication is handled client-side through Google Identity Services
- User authorization is checked against the Users tab in Google Sheets

## Customization

### Design System
All colors and styles are defined in `src/index.css` using CSS custom properties. You can customize:
- Color palette (primary, secondary, accent colors)
- Typography (fonts, sizes, weights)
- Spacing and border radius
- Animation timing and effects

### Photo Layout
The gallery uses CSS Grid for responsive layout. You can modify the grid breakpoints in `GalleryPage.tsx`:
```typescript
gridTemplateColumns: {
  xs: '1fr',
  sm: 'repeat(2, 1fr)',
  md: 'repeat(3, 1fr)',
  lg: 'repeat(4, 1fr)',
}
```

### Material UI Theme
The Material UI theme is configured in `src/components/App.tsx` and can be customized for:
- Color palette
- Typography
- Component styles
- Spacing system
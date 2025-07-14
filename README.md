# Photo Gallery Web App

A beautiful, secure photo organization webapp with Google authentication and Google Sheets integration. Built with React, Material UI, and modern web technologies.

![Photo Gallery Demo](https://github.com/user-attachments/assets/photo-gallery-preview.png)

## ✨ Features

- **🔐 Secure Google OAuth Authentication** - Only authorized users can access
- **📊 Google Sheets Backend** - Manage photo metadata in a spreadsheet
- **🎨 Beautiful Material UI Design** - Responsive, Polaroid-style photo cards
- **❤️ Favorite System** - Mark photos as favorites with animated heart icons
- **🔍 Real-time Search** - Filter photos by name or description
- **📝 Photo Management** - Edit photo names and descriptions
- **📱 Responsive Design** - Works perfectly on desktop and mobile
- **⚡ Fast Loading** - Skeleton loaders and optimized image handling
- **🎭 Pagination** - Handle large photo collections efficiently

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd photo-gallery
npm install
npm run dev
```

### 2. Setup Google Authentication
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Google Identity API
3. Create OAuth 2.0 credentials
4. Update `src/services/googleAuth.ts` with your Client ID:
   ```typescript
   const CLIENT_ID = 'your-google-client-id.apps.googleusercontent.com';
   ```

### 3. Setup Google Sheets
1. Create a spreadsheet with tabs: **Users** (email column) and **Content** (path, name, favorite, description)
2. Enable Google Sheets API and get API key
3. Update `src/components/GalleryPage.tsx` with your credentials:
   ```typescript
   const API_KEY = 'your-api-key';
   const SPREADSHEET_ID = 'your-spreadsheet-id';
   ```

### 4. Add Your Photos
1. Place images in `/public/content/` folder
2. Update `/public/content/index.json` with image paths
3. Deploy to GitHub Pages or your preferred hosting

## 🏗️ Architecture

```
src/
├── components/
│   ├── App.tsx           # Main app with Material UI theme
│   ├── LoginPage.tsx     # Google OAuth login interface
│   ├── GalleryPage.tsx   # Main photo gallery with search
│   ├── PhotoCard.tsx     # Polaroid-style photo cards
│   └── PhotoDialog.tsx   # Photo editing modal
├── services/
│   ├── googleAuth.ts     # Google OAuth integration
│   ├── googleSheets.ts   # Google Sheets API client
│   └── photoContent.ts   # Photo content management
└── index.css             # Design system with HSL colors
```

## 🎨 Design System

The app uses a warm, photo-centric color palette with HSL color variables:
- **Primary**: Warm amber (`hsl(39, 84%, 56%)`)
- **Background**: Soft cream (`hsl(45, 23%, 97%)`)
- **Cards**: Pure white with elegant shadows
- **Favorites**: Heart red (`hsl(0, 84%, 60%)`)

### Customizing Colors
Edit `src/index.css` to customize the color scheme:
```css
:root {
  --primary: 39 84% 56%;        /* Your brand color */
  --background: 45 23% 97%;     /* Page background */
  --card: 0 0% 100%;            /* Card background */
  /* ... more color variables */
}
```

## 🔧 Configuration

### Environment Setup
No `.env` files needed! All configuration is done in source files:

**Google OAuth**: `src/services/googleAuth.ts`
```typescript
const CLIENT_ID = 'your-google-oauth-client-id';
```

**Google Sheets**: `src/components/GalleryPage.tsx`
```typescript
const API_KEY = 'your-google-sheets-api-key';
const SPREADSHEET_ID = 'your-spreadsheet-id';
```

### Content Management
Images are served from `/public/content/` with an index file listing all photos:

**`/public/content/index.json`**
```json
[
  "/content/photo1.jpg",
  "/content/photo2.jpg",
  "/content/photo3.jpg"
]
```

## 🔒 Security Features

- **Client-side OAuth** - Secure Google authentication
- **Email Whitelist** - Only authorized users in Google Sheets can access
- **Public API Keys** - Uses only client-safe, public API keys
- **HTTPS Only** - All API communication over HTTPS
- **No Passwords** - No password storage or management needed

## 📱 Responsive Design

The gallery adapts to all screen sizes:
- **Mobile**: 1 column layout
- **Tablet**: 2 column layout  
- **Desktop**: 3-4 column layout
- **Large screens**: Up to 4 columns

## 🚀 Deployment

### GitHub Pages
1. Push code to GitHub repository
2. Enable GitHub Pages in repository settings
3. Update OAuth credentials with your GitHub Pages URL
4. Your app will be live at `https://yourusername.github.io/yourrepo`

### Other Hosting
This is a static React app that can be deployed anywhere:
- Vercel, Netlify, AWS S3, etc.
- Just run `npm run build` and deploy the `dist/` folder

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/) and [Material UI](https://mui.com/)
- Authentication via [Google Identity Services](https://developers.google.com/identity)
- Backend powered by [Google Sheets API](https://developers.google.com/sheets/api)
- Styled with custom CSS design system
- Icons from [Material UI Icons](https://mui.com/material-ui/material-icons/)

---

**Built with ❤️ using modern web technologies**

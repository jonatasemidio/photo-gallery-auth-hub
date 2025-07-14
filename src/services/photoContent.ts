// Photo Content Management Service
// Handles scanning local /content folder and merging with Google Sheets data

import { PhotoData } from './googleSheets';

export interface Photo {
  path: string;
  name: string;
  favorite: boolean;
  description: string;
  url: string;
  loaded: boolean;
}

export interface PhotoManifest {
  photos: Photo[];
  totalCount: number;
  lastUpdated: Date;
}

class PhotoContentService {
  private manifest: PhotoManifest | null = null;
  private supportedFormats = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];

  // Build photo manifest by scanning /content folder and merging with sheets data
  async buildPhotoManifest(sheetsData: PhotoData[] = []): Promise<PhotoManifest> {
    try {
      // Get list of images from /content folder
      const localPhotos = await this.scanContentFolder();
      
      // Merge with Google Sheets data
      const photos = this.mergePhotoData(localPhotos, sheetsData);
      
      const manifest: PhotoManifest = {
        photos,
        totalCount: photos.length,
        lastUpdated: new Date(),
      };

      // Cache manifest in session storage
      sessionStorage.setItem('photoManifest', JSON.stringify(manifest));
      this.manifest = manifest;

      return manifest;
    } catch (error) {
      console.error('Error building photo manifest:', error);
      throw error;
    }
  }

  // Scan /content folder for images
  private async scanContentFolder(): Promise<string[]> {
    try {
      // In a static GitHub Pages deployment, we need to fetch a pre-generated index
      // For development, we'll use a mock list
      
      // TODO: In production, you would need to generate this list at build time
      // or use GitHub API to list files in the /content directory
      
      const response = await fetch('/content/index.json').catch(() => null);
      
      if (response && response.ok) {
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      }

      // Fallback: Try to fetch some common image files
      const possibleImages = [
        '/content/sample1.jpg',
        '/content/sample2.jpg',
        '/content/sample3.png',
        '/content/photo1.jpg',
        '/content/photo2.jpg',
        '/content/image1.png',
        '/content/image2.png',
        '/content/gallery1.jpg',
        '/content/gallery2.jpg',
        '/content/gallery3.jpg',
      ];

      const existingImages: string[] = [];
      
      // Check which images exist by attempting to load them
      for (const imagePath of possibleImages) {
        try {
          const imageResponse = await fetch(imagePath, { method: 'HEAD' });
          if (imageResponse.ok) {
            existingImages.push(imagePath);
          }
        } catch {
          // Image doesn't exist, skip
        }
      }

      return existingImages;
    } catch (error) {
      console.error('Error scanning content folder:', error);
      return [];
    }
  }

  // Merge local photos with Google Sheets data
  private mergePhotoData(localPhotos: string[], sheetsData: PhotoData[]): Photo[] {
    const sheetsMap = new Map<string, PhotoData>();
    
    // Create lookup map for sheets data
    sheetsData.forEach(data => {
      sheetsMap.set(data.path, data);
    });

    // Merge data for each local photo
    return localPhotos.map(path => {
      const sheetData = sheetsMap.get(path);
      const fileName = path.split('/').pop() || path;
      
      return {
        path,
        name: sheetData?.name || fileName,
        favorite: sheetData?.favorite || false,
        description: sheetData?.description || '',
        url: path,
        loaded: false,
      };
    });
  }

  // Get cached manifest
  getCachedManifest(): PhotoManifest | null {
    if (this.manifest) {
      return this.manifest;
    }

    try {
      const cached = sessionStorage.getItem('photoManifest');
      if (cached) {
        const manifest = JSON.parse(cached);
        // Check if cache is still fresh (less than 5 minutes old)
        const lastUpdated = new Date(manifest.lastUpdated);
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        
        if (lastUpdated > fiveMinutesAgo) {
          this.manifest = manifest;
          return manifest;
        }
      }
    } catch {
      // Invalid cached data
    }

    return null;
  }

  // Filter photos by search term
  filterPhotos(photos: Photo[], searchTerm: string): Photo[] {
    if (!searchTerm.trim()) {
      return photos;
    }

    const term = searchTerm.toLowerCase();
    return photos.filter(photo => 
      photo.name.toLowerCase().includes(term) ||
      photo.description.toLowerCase().includes(term)
    );
  }

  // Get paginated photos
  getPaginatedPhotos(photos: Photo[], page: number, perPage: number): Photo[] {
    const startIndex = page * perPage;
    const endIndex = startIndex + perPage;
    return photos.slice(startIndex, endIndex);
  }

  // Update photo in manifest
  updatePhotoInManifest(path: string, updates: Partial<Photo>): void {
    if (!this.manifest) return;

    const photoIndex = this.manifest.photos.findIndex(p => p.path === path);
    if (photoIndex >= 0) {
      this.manifest.photos[photoIndex] = {
        ...this.manifest.photos[photoIndex],
        ...updates,
      };

      // Update cached manifest
      sessionStorage.setItem('photoManifest', JSON.stringify(this.manifest));
    }
  }

  // Preload image
  async preloadImage(photo: Photo): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.updatePhotoInManifest(photo.path, { loaded: true });
        resolve();
      };
      img.onerror = () => {
        reject(new Error(`Failed to load image: ${photo.path}`));
      };
      img.src = photo.url;
    });
  }
}

export const photoContent = new PhotoContentService();
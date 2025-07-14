// Google Sheets API Service
// Handles reading from and writing to Google Spreadsheet

export interface PhotoData {
  path: string;
  name: string;
  favorite: boolean;
  description: string;
}

export interface UserData {
  email: string;
}

class GoogleSheetsService {
  private apiKey: string = '';
  private spreadsheetId: string = '';
  private isInitialized: boolean = false;

  // Initialize with API key and spreadsheet ID
  async initialize(apiKey: string, spreadsheetId: string): Promise<void> {
    this.apiKey = apiKey;
    this.spreadsheetId = spreadsheetId;

    return new Promise((resolve, reject) => {
      if (window.gapi) {
        this.loadSheetsAPI().then(resolve).catch(reject);
        return;
      }

      // Load Google APIs script
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.async = true;
      script.defer = true;

      script.onload = () => {
        this.loadSheetsAPI().then(resolve).catch(reject);
      };

      script.onerror = () => {
        reject(new Error('Failed to load Google APIs'));
      };

      document.head.appendChild(script);
    });
  }

  private async loadSheetsAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      window.gapi.load('client', {
        callback: async () => {
          try {
            await window.gapi.client.init({
              apiKey: this.apiKey,
              discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
            });
            
            this.isInitialized = true;
            resolve();
          } catch (error) {
            reject(error);
          }
        },
        onerror: () => {
          reject(new Error('Failed to load Google Sheets API'));
        },
      });
    });
  }

  // Get authorized users from Users sheet
  async getAuthorizedUsers(): Promise<UserData[]> {
    if (!this.isInitialized) {
      throw new Error('Google Sheets API not initialized');
    }

    try {
      const response = await window.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Users!A:A', // Assuming emails are in column A
        majorDimension: 'ROWS',
      });

      const rows = response.result.values || [];
      
      // Skip header row and convert to UserData objects
      return rows.slice(1).map(row => ({
        email: row[0] || '',
      })).filter(user => user.email.trim() !== '');

    } catch (error) {
      console.error('Error fetching authorized users:', error);
      throw error;
    }
  }

  // Get photo content data from Content sheet
  async getPhotoContent(): Promise<PhotoData[]> {
    if (!this.isInitialized) {
      throw new Error('Google Sheets API not initialized');
    }

    try {
      const response = await window.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Content!A:D', // path, name, favorite, description
        majorDimension: 'ROWS',
      });

      const rows = response.result.values || [];
      
      // Skip header row and convert to PhotoData objects
      return rows.slice(1).map(row => ({
        path: row[0] || '',
        name: row[1] || '',
        favorite: row[2] === 'TRUE' || row[2] === 'true',
        description: row[3] || '',
      })).filter(photo => photo.path.trim() !== '');

    } catch (error) {
      console.error('Error fetching photo content:', error);
      throw error;
    }
  }

  // Update photo data in Content sheet
  async updatePhoto(photo: PhotoData): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Google Sheets API not initialized');
    }

    try {
      // First, find the row index for this photo
      const response = await window.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Content!A:A', // Get all paths
        majorDimension: 'ROWS',
      });

      const rows = response.result.values || [];
      const rowIndex = rows.findIndex((row, index) => 
        index > 0 && row[0] === photo.path // Skip header row
      );

      if (rowIndex === -1) {
        // Photo not found, add new row
        await this.addNewPhoto(photo);
        return;
      }

      // Update existing row (add 1 for header row)
      const actualRowIndex = rowIndex + 1;
      
      await window.gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `Content!A${actualRowIndex}:D${actualRowIndex}`,
        valueInputOption: 'RAW',
        resource: {
          values: [[
            photo.path,
            photo.name,
            photo.favorite.toString(),
            photo.description,
          ]],
        },
      });

    } catch (error) {
      console.error('Error updating photo:', error);
      throw error;
    }
  }

  // Add new photo to Content sheet
  private async addNewPhoto(photo: PhotoData): Promise<void> {
    try {
      await window.gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'Content!A:D',
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: {
          values: [[
            photo.path,
            photo.name,
            photo.favorite.toString(),
            photo.description,
          ]],
        },
      });
    } catch (error) {
      console.error('Error adding new photo:', error);
      throw error;
    }
  }

  // Toggle favorite status
  async toggleFavorite(path: string, currentFavorite: boolean): Promise<void> {
    const photoData = await this.getPhotoContent();
    const photo = photoData.find(p => p.path === path);
    
    if (photo) {
      photo.favorite = !currentFavorite;
      await this.updatePhoto(photo);
    } else {
      // Create new photo entry with default values
      const newPhoto: PhotoData = {
        path,
        name: path.split('/').pop() || path,
        favorite: !currentFavorite,
        description: '',
      };
      await this.updatePhoto(newPhoto);
    }
  }
}

export const googleSheets = new GoogleSheetsService();
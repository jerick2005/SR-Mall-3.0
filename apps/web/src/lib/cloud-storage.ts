// Cloud Storage Service for SR Mall Ads
// Supports multiple providers: Local, AWS S3, Cloudinary, etc.

export interface CloudStorageProvider {
  name: string;
  uploadFile: (file: File, folder?: string) => Promise<{ url: string; key: string }>;
  deleteFile: (key: string) => Promise<boolean>;
  getUrl: (key: string) => Promise<string>;
}

// Local Storage Provider (Development)
class LocalStorageProvider implements CloudStorageProvider {
  name = 'local';
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_CLOUD_URL || 'http://localhost:3000/uploads';
  }

  async uploadFile(file: File, folder = 'ads'): Promise<{ url: string; key: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      return {
        url: result.url,
        key: result.key
      };
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  async deleteFile(key: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/upload?key=${encodeURIComponent(key)}`, {
        method: 'DELETE',
      });

      return response.ok;
    } catch (error) {
      console.error('Delete error:', error);
      return false;
    }
  }

  async getUrl(key: string): Promise<string> {
    return `${this.baseUrl}/${key}`;
  }
}

// Cloudinary Provider (Production)
class CloudinaryProvider implements CloudStorageProvider {
  name = 'cloudinary';
  private cloudName: string;
  private uploadPreset: string;

  constructor() {
    this.cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
    this.uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default';
  }

  async uploadFile(file: File, folder = 'ads'): Promise<{ url: string; key: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);
    formData.append('folder', folder);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Cloudinary upload failed');
      }

      const result = await response.json();
      return {
        url: result.secure_url,
        key: result.public_id
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  }

  async deleteFile(key: string): Promise<boolean> {
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/destroy`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ public_id: key }),
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      return false;
    }
  }

  async getUrl(key: string): Promise<string> {
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${key}`;
  }
}

// Factory function to get the appropriate storage provider
export function getCloudStorageProvider(): CloudStorageProvider {
  const provider = process.env.NEXT_PUBLIC_CLOUD_PROVIDER || 'local';
  
  switch (provider) {
    case 'cloudinary':
      return new CloudinaryProvider();
    case 'aws':
      // TODO: Implement AWS S3 provider
      throw new Error('AWS S3 provider not implemented yet');
    case 'local':
    default:
      return new LocalStorageProvider();
  }
}

// Utility functions
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only images and videos are allowed.'
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size must be less than 10MB.'
    };
  }

  return { valid: true };
};

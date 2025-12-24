/**
 * Image Compression Utility
 * Resizes and compresses images in the browser before upload using HTML5 Canvas.
 */

interface CompressionOptions {
  maxWidth?: number; // default 1024
  maxHeight?: number; // default 1024
  quality?: number; // 0.0 to 1.0, default 0.7
  mimeType?: string; // 'image/jpeg' or 'image/webp'
}

interface CompressedResult {
  base64: string;
  originalSize: number; // in bytes
  compressedSize: number; // in bytes
  width: number;
  height: number;
}

export const compressImage = (file: File, options: CompressionOptions = {}): Promise<CompressedResult> => {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 1024,
      maxHeight = 1024,
      quality = 0.7,
      mimeType = 'image/jpeg',
    } = options;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // 1. Calculate new dimensions (maintain aspect ratio)
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        // 2. Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // 3. Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // 4. Export compressed data URL
        const base64 = canvas.toDataURL(mimeType, quality);

        // Calculate size roughly
        // Base64 length * 0.75 gives approx byte size
        const compressedSize = Math.round((base64.length - `data:${mimeType};base64,`.length) * 3 / 4);

        resolve({
          base64,
          originalSize: file.size,
          compressedSize,
          width,
          height
        });
      };

      img.onerror = (err) => reject(err);
    };

    reader.onerror = (err) => reject(err);
  });
};

// Helper to format bytes to KB/MB
export const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};
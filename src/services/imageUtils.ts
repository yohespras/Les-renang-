/**
 * Utility for reading, resizing, and compressing images from file input
 * to lightweight Base64 data URLs suitable for localStorage persistence.
 */
export const compressAndResizeImage = (
  file: File,
  maxWidth = 480,
  maxHeight = 480,
  quality = 0.85
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      reject(new Error('File yang dipilih bukan merupakan format gambar yang valid.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar dari perangkat.'));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Gagal memuat elemen gambar.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio preserved dimensions
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

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          // Fallback to original read result if canvas not supported
          resolve(event.target?.result as string);
          return;
        }

        // Draw image with smooth scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to lightweight JPEG
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      if (event.target?.result) {
        img.src = event.target.result as string;
      } else {
        reject(new Error('Data gambar kosong.'));
      }
    };

    reader.readAsDataURL(file);
  });
};

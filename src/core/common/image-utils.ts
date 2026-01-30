/**
 * Image Utilities
 * 
 * Centralized utilities for image processing, conversion, and validation.
 * These utilities are reusable across the entire application.
 */

export interface ImageConversionOptions {
  maxSize?: number; // Max file size in bytes
  quality?: number; // Image quality (0-1) for compression
  maxWidth?: number; // Max width for resizing
  maxHeight?: number; // Max height for resizing
  outputFormat?: string; // Output format: 'jpeg', 'png', 'webp'
}

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
  file?: File;
}

export interface ImageConversionResult {
  success: boolean;
  base64?: string;
  error?: string;
  fileSize?: number; // Size after conversion in bytes
  dimensions?: { width: number; height: number };
}

/**
 * Validates an image file
 * @param file - The file to validate
 * @param options - Validation options
 * @returns Validation result with error message if invalid
 */
export function validateImageFile(
  file: File,
  options: { maxSize?: number; allowedTypes?: string[] } = {}
): ImageValidationResult {
  const { maxSize = 5 * 1024 * 1024, allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'] } = options;

  // Check if file exists
  if (!file) {
    return {
      isValid: false,
      error: 'No file provided',
    };
  }

  // Check file type
  if (!file.type.startsWith('image/')) {
    return {
      isValid: false,
      error: 'Invalid file type. Please select an image file.',
    };
  }

  // Check if type is in allowed types
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type not allowed. Allowed types: ${allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}`,
    };
  }

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    return {
      isValid: false,
      error: `File is too large. Maximum size is ${maxSizeMB}MB.`,
    };
  }

  return {
    isValid: true,
    file,
  };
}

/**
 * Converts a File object to base64 string
 * @param file - The file to convert
 * @param options - Conversion options
 * @returns Promise with conversion result
 */
export async function convertFileToBase64(
  file: File,
  options: ImageConversionOptions = {}
): Promise<ImageConversionResult> {
  try {
    // Validate the file first
    const validation = validateImageFile(file, {
      maxSize: options.maxSize,
    });

    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    // If resize options are provided, process the image first
    if (options.maxWidth || options.maxHeight) {
      return await convertAndResizeImage(file, options);
    }

    // Simple conversion without resizing
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        resolve({
          success: true,
          base64,
          fileSize: file.size,
        });
      };

      reader.onerror = () => {
        resolve({
          success: false,
          error: 'Failed to read file',
        });
      };

      reader.readAsDataURL(file);
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Converts and optionally resizes an image to base64
 * @param file - The image file
 * @param options - Conversion and resize options
 * @returns Promise with conversion result including dimensions
 */
async function convertAndResizeImage(
  file: File,
  options: ImageConversionOptions
): Promise<ImageConversionResult> {
  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      // Calculate new dimensions maintaining aspect ratio
      if (options.maxWidth || options.maxHeight) {
        const maxWidth = options.maxWidth || Infinity;
        const maxHeight = options.maxHeight || Infinity;

        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          
          if (width > height) {
            width = Math.min(width, maxWidth);
            height = width / aspectRatio;
            if (height > maxHeight) {
              height = maxHeight;
              width = height * aspectRatio;
            }
          } else {
            height = Math.min(height, maxHeight);
            width = height * aspectRatio;
            if (width > maxWidth) {
              width = maxWidth;
              height = width / aspectRatio;
            }
          }
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({
          success: false,
          error: 'Failed to get canvas context',
        });
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Get output format
      const outputFormat = options.outputFormat || 'jpeg';
      const mimeType = outputFormat === 'png' ? 'image/png' : 
                      outputFormat === 'webp' ? 'image/webp' : 
                      'image/jpeg';

      // Convert to base64
      const quality = options.quality !== undefined ? options.quality : 0.9;
      const base64 = canvas.toDataURL(mimeType, quality);

      resolve({
        success: true,
        base64,
        fileSize: base64.length, // Approximate size
        dimensions: { width, height },
      });
    };

    img.onerror = () => {
      resolve({
        success: false,
        error: 'Failed to load image',
      });
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Extracts base64 data from a data URL string
 * @param dataUrl - The data URL (e.g., "data:image/png;base64,...")
 * @returns Just the base64 string without the data URL prefix
 */
export function extractBase64FromDataUrl(dataUrl: string): string {
  if (!dataUrl || !dataUrl.includes(',')) {
    return dataUrl;
  }
  return dataUrl.split(',')[1];
}

/**
 * Gets image dimensions from a base64 string
 * @param base64 - Base64 image string or data URL
 * @returns Promise with image dimensions
 */
export function getImageDimensions(base64: string): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };

    img.onerror = () => {
      resolve(null);
    };

    img.src = base64;
  });
}

/**
 * Formats file size to human-readable string
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}


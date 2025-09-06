import sharp from 'sharp';
import crypto from 'crypto';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: "dtfpq268d",
  api_key: "892141439684582",
  api_secret: "0tEhxpENVxAghzlObVPdes-b1LY",
});

export interface ProcessedImage {
  url: string;
  hash: string;
  size: number;
}

/**
 * Process and compress image
 */
export const processImage = async (buffer: Buffer): Promise<Buffer> => {
  return sharp(buffer)
    .resize(800, 600, { 
      fit: 'inside',
      withoutEnlargement: true 
    })
    .jpeg({ 
      quality: 80,
      progressive: true 
    })
    .toBuffer();
};

/**
 * Generate perceptual hash for image deduplication
 */
export const generateImageHash = async (buffer: Buffer): Promise<string> => {
  // Create a simple perceptual hash by resizing to 8x8 and getting average
  const resized = await sharp(buffer)
    .resize(8, 8, { fit: 'fill' })
    .greyscale()
    .raw()
    .toBuffer();

  // Calculate average pixel value
  const pixels = Array.from(resized);
  const average = pixels.reduce((sum, pixel) => sum + pixel, 0) / pixels.length;

  // Create hash based on pixels above/below average
  let hash = '';
  for (const pixel of pixels) {
    hash += pixel > average ? '1' : '0';
  }

  return hash;
};

/**
 * Calculate Hamming distance between two hashes
 */
export const calculateHammingDistance = (hash1: string, hash2: string): number => {
  if (hash1.length !== hash2.length) return Infinity;
  
  let distance = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) distance++;
  }
  
  return distance;
};

/**
 * Check if two images are similar based on perceptual hash
 */
export const areImagesSimilar = (hash1: string, hash2: string, threshold: number = 10): boolean => {
  const distance = calculateHammingDistance(hash1, hash2);
  return distance <= threshold;
};

/**
 * Upload image to Cloudinary
 */
export const uploadToCloudinary = async (buffer: Buffer, folder: string = 'civic-issues'): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 800, height: 600, crop: 'limit' },
          { quality: 'auto:good' },
          { format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result!.secure_url);
        }
      }
    );
    
    uploadStream.end(buffer);
  });
};

/**
 * Generate MD5 hash for exact duplicate detection
 */
export const generateMD5Hash = (buffer: Buffer): string => {
  return crypto.createHash('md5').update(buffer).digest('hex');
};

/**
 * Process multiple images
 */
export const processImages = async (files: Express.Multer.File[]): Promise<ProcessedImage[]> => {
  const processedImages: ProcessedImage[] = [];
  const seenHashes = new Set<string>();

  for (const file of files) {
    try {
      // Generate MD5 hash for exact duplicate detection
      const md5Hash = generateMD5Hash(file.buffer);
      
      // Skip exact duplicates
      if (seenHashes.has(md5Hash)) {
        continue;
      }
      seenHashes.add(md5Hash);

      // Process image
      const processedBuffer = await processImage(file.buffer);
      
      // Generate perceptual hash
      const perceptualHash = await generateImageHash(processedBuffer);
      
      // Upload to Cloudinary
      const url = await uploadToCloudinary(processedBuffer);
      
      processedImages.push({
        url,
        hash: perceptualHash,
        size: processedBuffer.length
      });
    } catch (error) {
      console.error('Error processing image:', error);
      // Continue with other images
    }
  }

  return processedImages;
};

/**
 * Validate image file
 */
export const validateImageFile = (file: Express.Multer.File): boolean => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  // Check mime type
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return false;
  }

  // Check size if available (might not be available during filter phase)
  if (file.size && file.size > maxSize) {
    return false;
  }

  // Check buffer size if file.size is not available
  if (file.buffer && file.buffer.length > maxSize) {
    return false;
  }

  return true;
};
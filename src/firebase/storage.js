import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

/**
 * Upload image to Firebase Storage
 * @param {File} file - The image file to upload
 * @param {string} path - Storage path (e.g., 'menu/item123')
 * @returns {Promise<string>} Download URL of the uploaded image
 */
export const uploadImage = async (file, path) => {
  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * Delete image from Firebase Storage
 * @param {string} imageUrl - The full URL of the image to delete
 * @returns {Promise<void>}
 */
export const deleteImage = async (imageUrl) => {
  if (!imageUrl) return;
  
  try {
    // Extract the path from the full URL
    // Firebase Storage URLs typically look like:
    // https://firebasestorage.googleapis.com/v0/b/bucket/o/path%2Fto%2Fimage?alt=media&token=...
    const urlParts = imageUrl.split('/');
    const pathIndex = urlParts.findIndex(part => part === 'o');
    
    if (pathIndex === -1 || pathIndex === urlParts.length - 1) {
      console.warn('Could not extract path from image URL:', imageUrl);
      return;
    }
    
    const encodedPath = urlParts[pathIndex + 1];
    const decodedPath = decodeURIComponent(encodedPath.split('?')[0]);
    
    const imageRef = ref(storage, decodedPath);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    // Don't throw - image deletion failure shouldn't break the flow
  }
};

/**
 * Generate a unique path for menu item images
 * @param {string} itemId - Optional item ID (for updates)
 * @returns {string} Storage path
 */
export const getMenuImagePath = (itemId = null) => {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 9);
  const fileName = itemId ? `${itemId}_${timestamp}` : `menu_${timestamp}_${randomId}`;
  return `menu/${fileName}`;
};


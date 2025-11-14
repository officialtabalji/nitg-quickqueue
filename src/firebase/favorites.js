import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from './config';

// Get user favorites
export const getFavorites = async (userId) => {
  try {
    const favRef = doc(db, 'favorites', userId);
    const favDoc = await getDoc(favRef);
    if (favDoc.exists()) {
      return favDoc.data().items || [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }
};

// Add item to favorites
export const addToFavorites = async (userId, itemId) => {
  try {
    const favRef = doc(db, 'favorites', userId);
    const favDoc = await getDoc(favRef);
    
    if (favDoc.exists()) {
      await updateDoc(favRef, {
        items: arrayUnion(itemId)
      });
    } else {
      await setDoc(favRef, {
        items: [itemId],
        createdAt: new Date()
      });
    }
    return { success: true };
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return { success: false, error: error.message };
  }
};

// Remove item from favorites
export const removeFromFavorites = async (userId, itemId) => {
  try {
    const favRef = doc(db, 'favorites', userId);
    await updateDoc(favRef, {
      items: arrayRemove(itemId)
    });
    return { success: true };
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return { success: false, error: error.message };
  }
};

// Check if item is favorite
export const isFavorite = async (userId, itemId) => {
  try {
    const favorites = await getFavorites(userId);
    return favorites.includes(itemId);
  } catch (error) {
    return false;
  }
};


import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from './config';

// Get all menu items
export const getMenuItems = async () => {
  try {
    const menuRef = collection(db, 'menu');
    const snapshot = await getDocs(menuRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching menu:', error);
    return [];
  }
};

// Get available menu items only
export const getAvailableMenuItems = async () => {
  try {
    const menuRef = collection(db, 'menu');
    const q = query(menuRef, where('available', '==', true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching available menu:', error);
    return [];
  }
};

// Add menu item (admin only)
export const addMenuItem = async (itemData) => {
  try {
    const menuRef = collection(db, 'menu');
    const docRef = await addDoc(menuRef, {
      ...itemData,
      createdAt: Timestamp.now()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding menu item:', error);
    return { success: false, error: error.message };
  }
};

// Update menu item (admin only)
export const updateMenuItem = async (itemId, itemData) => {
  try {
    const menuRef = doc(db, 'menu', itemId);
    await updateDoc(menuRef, {
      ...itemData,
      updatedAt: Timestamp.now()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating menu item:', error);
    return { success: false, error: error.message };
  }
};

// Delete menu item (admin only)
export const deleteMenuItem = async (itemId) => {
  try {
    const menuRef = doc(db, 'menu', itemId);
    await deleteDoc(menuRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return { success: false, error: error.message };
  }
};

// Toggle item availability
export const toggleItemAvailability = async (itemId, available) => {
  try {
    const menuRef = doc(db, 'menu', itemId);
    await updateDoc(menuRef, { available, updatedAt: Timestamp.now() });
    return { success: true };
  } catch (error) {
    console.error('Error toggling availability:', error);
    return { success: false, error: error.message };
  }
};

// Subscribe to menu items in real-time (for admin)
export const subscribeToMenuItems = (callback) => {
  try {
    const menuRef = collection(db, 'menu');
    const unsubscribe = onSnapshot(menuRef, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(items);
    }, (error) => {
      console.error('Error in menu subscription:', error);
      callback([]);
    });
    return unsubscribe;
  } catch (error) {
    console.error('Error setting up menu subscription:', error);
    return () => {};
  }
};


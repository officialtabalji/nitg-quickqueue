import { collection, addDoc, getDocs, query, orderBy, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from './config';

/**
 * Submit feedback for an order
 * @param {string} userId - User ID
 * @param {string} orderId - Order ID
 * @param {number} rating - Rating (1-5)
 * @param {string} message - Feedback message
 * @returns {Promise<{success: boolean, id?: string, error?: string}>}
 */
export const submitFeedback = async (userId, orderId, rating, message) => {
  try {
    const feedbackRef = collection(db, 'feedback');
    const docRef = await addDoc(feedbackRef, {
      userId,
      orderId,
      rating,
      message: message.trim() || '',
      createdAt: Timestamp.now()
    });
    
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all feedback (admin only)
 * @returns {Promise<Array>}
 */
export const getAllFeedback = async () => {
  try {
    const feedbackRef = collection(db, 'feedback');
    const q = query(feedbackRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return [];
  }
};

/**
 * Subscribe to all feedback in real-time (admin only)
 * @param {Function} callback - Callback function that receives feedback array
 * @returns {Function} Unsubscribe function
 */
export const subscribeToFeedback = (callback) => {
  try {
    const feedbackRef = collection(db, 'feedback');
    const q = query(feedbackRef, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const feedback = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
      }));
      callback(feedback);
    }, (error) => {
      console.error('Error in feedback subscription:', error);
      callback([]);
    });
    return unsubscribe;
  } catch (error) {
    console.error('Error setting up feedback subscription:', error);
    return () => {};
  }
};

/**
 * Check if feedback already exists for an order
 * @param {string} orderId - Order ID
 * @returns {Promise<boolean>}
 */
export const checkFeedbackExists = async (orderId) => {
  try {
    const feedbackRef = collection(db, 'feedback');
    const q = query(feedbackRef, where('orderId', '==', orderId));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking feedback:', error);
    return false;
  }
};


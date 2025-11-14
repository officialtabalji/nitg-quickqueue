import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthChange, getUserRole } from '../firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { requestNotificationPermission } from '../utils/notifications';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Get user role and data from Firestore
        const role = await getUserRole(currentUser.uid);
        
        // Request notification permission and save FCM token
        // This happens after login, so we have the user ID
        requestNotificationPermission(currentUser.uid).catch(error => {
          console.error('Error setting up notifications:', error);
        });
        
        // Subscribe to user document for real-time updates
        const userDocRef = doc(db, 'users', currentUser.uid);
        const unsubscribeUser = onSnapshot(
          userDocRef, 
          (doc) => {
            if (doc.exists()) {
              setUserData(doc.data());
            } else {
              // User document doesn't exist yet, set empty data
              setUserData(null);
            }
          },
          (error) => {
            // Handle permission errors gracefully
            console.warn('Error fetching user data:', error);
            setUserData(null);
            setLoading(false);
          }
        );
        
        setLoading(false);
        return () => unsubscribeUser();
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    userData,
    loading,
    isAdmin: userData?.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


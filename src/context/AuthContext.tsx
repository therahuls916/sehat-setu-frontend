// src/context/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth';
import { auth } from '@/utils/firebase';
import apiClient from '@/utils/api';

interface UserProfile {
  name: string;
  role: 'doctor' | 'pharmacy' | 'patient';
  specialization?: string;
}

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  userProfile: UserProfile | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFirebaseUser(user);
        try {
          // --- THE FIX IS HERE ---
          // We change .get() to .post() and send the user's display name.
          // This allows the backend to create a user record if it's missing.
          const { data } = await apiClient.post('/api/auth/sync', {
            name: user.displayName, // Send the name from Firebase
            // The role will be undefined here on login, which is fine.
            // The backend's syncUser controller is smart enough to handle this.
            // It will only use the role on registration, not on login.
          });
          setUserProfile(data);
          
        } catch (error) {
          console.error("Failed to sync user and fetch profile:", error);
          setUserProfile(null);
          setFirebaseUser(null);
          await signOut(auth);
        }
      } else {
        setFirebaseUser(null);
        setUserProfile(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ firebaseUser, isLoading, userProfile }}>
      {children} 
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
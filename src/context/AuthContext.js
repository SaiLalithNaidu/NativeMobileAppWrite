import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    updateProfile
} from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../api/firebase/config';

// ============================================================================
// AUTH CONTEXT
// ============================================================================

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Monitor authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Sign up a new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} name - User display name
   * @returns {Promise<Object>} Result object with success status
   */
  const signup = async (email, password, name) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      await updateProfile(userCredential.user, {
        displayName: name
      });

      const currentUser = auth.currentUser;
      setUser(currentUser);
      setIsAuthenticated(true);

      console.log('[Auth] Signup successful:', currentUser.email);
      return { success: true, user: currentUser };
    } catch (error) {
      console.error('[Auth] Signup error:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Sign in an existing user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Result object with success status
   */
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      setUser(userCredential.user);
      setIsAuthenticated(true);

      console.log('[Auth] Login successful:', userCredential.user.email);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('[Auth] Login error:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Sign out the current user
   * @returns {Promise<Object>} Result object with success status
   */
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsAuthenticated(false);

      console.log('[Auth] Logout successful');
      return { success: true };
    } catch (error) {
      console.error('[Auth] Logout error:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    isAuthenticated,
    user,
    login,
    signup,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use authentication context
 * @returns {Object} Auth context value
 * @throws {Error} If used outside AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

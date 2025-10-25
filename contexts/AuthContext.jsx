import React, { createContext, useContext, useEffect, useState } from 'react';
import { account, ID } from '../lib/appwrite';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on app start
  useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    try {
      const currentUser = await account.get();
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch (error) {
      // User is not logged in
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password, name) => {
    try {
      // Create new account
      const newAccount = await account.create(
        ID.unique(),
        email,
        password,
        name
      );

      // Automatically log in after signup
      await account.createEmailPasswordSession(email, password);
      
      // Get user details
      const currentUser = await account.get();
      setUser(currentUser);
      setIsAuthenticated(true);

      return { success: true, user: currentUser };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: error.message };
    }
  };

  const login = async (email, password) => {
    try {
      // Try to delete any existing session first
      try {
        await account.deleteSession('current');
      } catch (e) {
        // Ignore if no session exists
      }
      
      // Create email session
      await account.createEmailPasswordSession(email, password);
      
      // Get user details
      const currentUser = await account.get();
      setUser(currentUser);
      setIsAuthenticated(true);

      return { success: true, user: currentUser };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try 
    {
        if (user && user.$id) 
        {
          await account.deleteSession('current');
        }
        setUser(null);
        setIsAuthenticated(false);
        return { success: true };
    } 
    catch (error) 
    {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

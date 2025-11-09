/**
 * Profile Context
 * Manages profile-related state across the app with persistence
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const ProfileContext = createContext();

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

export const ProfileProvider = ({ children }) => {
  const [profileImage, setProfileImageState] = useState(null);
  const [userName, setUserName] = useState('');
  const { user } = useAuth();

  const loadProfileData = useCallback(async () => {
    try {
      if (!user?.uid) return;
      
      const userProfileKey = `profile_${user.uid}`;
      const savedProfileImage = await AsyncStorage.getItem(`${userProfileKey}_image`);
      const savedUserName = await AsyncStorage.getItem(`${userProfileKey}_name`);
      
      if (savedProfileImage) {
        setProfileImageState(savedProfileImage);
      }
      if (savedUserName) {
        setUserName(savedUserName);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  }, [user?.uid]);

  // Load profile data when user changes
  useEffect(() => {
    if (user?.uid) {
      loadProfileData();
    } else {
      // Clear profile data when user logs out
      setProfileImageState(null);
      setUserName('');
    }
  }, [user?.uid, loadProfileData]);

  const setProfileImage = async (imageUri) => {
    try {
      setProfileImageState(imageUri);
      if (user?.uid && imageUri) {
        const userProfileKey = `profile_${user.uid}`;
        await AsyncStorage.setItem(`${userProfileKey}_image`, imageUri);
      }
    } catch (error) {
      console.error('Error saving profile image:', error);
    }
  };

  const saveUserName = async (name) => {
    try {
      setUserName(name);
      if (user?.uid && name) {
        const userProfileKey = `profile_${user.uid}`;
        await AsyncStorage.setItem(`${userProfileKey}_name`, name);
      }
    } catch (error) {
      console.error('Error saving user name:', error);
    }
  };

  const value = {
    profileImage,
    setProfileImage,
    userName,
    setUserName: saveUserName,
    loadProfileData,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};
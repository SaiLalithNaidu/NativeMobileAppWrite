import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';

const ThemeContext = createContext();

export const lightTheme = {
    // Background Colors
    background: '#f5f5f5',
    cardBackground: '#ffffff',
    headerBackground: '#002147',

    // Text Colors
    text: '#1f2937',
    textSecondary: '#6b7280',
    textLight: '#9ca3af',
    textInverse: '#ffffff',

    // Primary Colors
    primary: '#0080ff',
    primaryDark: '#002147',
    primaryLight: '#b3d9ff',

    // UI Elements
    border: '#e5e7eb',
    iconBackground: '#f3f4f6',
    inputBackground: '#f9fafb',

    // Status Colors
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',

    // Shadows
    shadowColor: '#000000',

    // Gradients
    gradientStart: '#002147',
    gradientEnd: '#004080',
};

export const darkTheme = {
    // Background Colors
    background: '#0f172a',
    cardBackground: '#1e293b',
    headerBackground: '#1e293b',

    // Text Colors
    text: '#f1f5f9',
    textSecondary: '#cbd5e1',
    textLight: '#94a3b8',
    textInverse: '#0f172a',

    // Primary Colors
    primary: '#3b82f6',
    primaryDark: '#1e40af',
    primaryLight: '#93c5fd',

    // UI Elements
    border: '#334155',
    iconBackground: '#334155',
    inputBackground: '#1e293b',

    // Status Colors
    success: '#22c55e',
    error: '#f87171',
    warning: '#fbbf24',
    info: '#60a5fa',

    // Shadows
    shadowColor: '#000000',

    // Gradients
    gradientStart: '#1e293b',
    gradientEnd: '#334155',
};

export function ThemeProvider({ children }) {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Load saved theme preference
    useEffect(() => {
        loadThemePreference();
    }, []);

    const loadThemePreference = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('theme');
            if (savedTheme !== null) {
                setIsDarkMode(savedTheme === 'dark');
            } else {
                // Use system preference if no saved preference
                const colorScheme = Appearance.getColorScheme();
                setIsDarkMode(colorScheme === 'dark');
            }
        } catch (error) {
            console.error('Error loading theme preference:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleTheme = async () => {
        try {
            const newTheme = !isDarkMode;
            setIsDarkMode(newTheme);
            await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
        } catch (error) {
            console.error('Error saving theme preference:', error);
        }
    };

    const theme = isDarkMode ? darkTheme : lightTheme;

    return (
        <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme, isLoading }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

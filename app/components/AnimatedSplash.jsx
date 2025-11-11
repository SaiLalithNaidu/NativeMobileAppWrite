/**
 * AnimatedSplash Component
 * Custom animated splash screen with swinging logo animation
 */

import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

// Keep the native splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const AnimatedSplash = ({ onFinish, children }) => {
  const [appIsReady, setAppIsReady] = React.useState(false);
  const swing = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start swing animation
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(swing, { 
          toValue: 1, 
          duration: 500, 
          useNativeDriver: true 
        }),
        Animated.timing(swing, { 
          toValue: -1, 
          duration: 500, 
          useNativeDriver: true 
        }),
        Animated.timing(swing, { 
          toValue: 0, 
          duration: 500, 
          useNativeDriver: true 
        }),
      ])
    );
    animation.start();

    // Simulate app loading (replace with actual loading logic)
    prepareApp();

    // Cleanup animation on unmount
    return () => animation.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const prepareApp = async () => {
    try {
      // Add your app initialization logic here
      // For example: load fonts, check auth, etc.
      await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second splash

      setAppIsReady(true);
    } catch (e) {
      console.warn('Error preparing app:', e);
    }
  };

  useEffect(() => {
    if (appIsReady) {
      // Fade out splash screen
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        SplashScreen.hideAsync();
        if (onFinish) onFinish();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appIsReady]);

  const rotate = swing.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-10deg', '10deg'],
  });

  if (!appIsReady) {
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <Animated.Image
          source={require('../../assets/images/app_logo.png')}
          style={[
            styles.logo,
            {
              transform: [{ rotate }],
            },
          ]}
          resizeMode="contain"
        />
      </Animated.View>
    );
  }

  return children;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#002147', // Your brand color (dark blue)
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
});

export default AnimatedSplash;

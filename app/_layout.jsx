import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../contexts/AuthContext";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {
  // Handle the case where splash screen is already hidden
});

export default function RootLayout() 
{
  useEffect(() => {
    // Hide splash screen after 2 seconds
    const timer = setTimeout(async () => {
      try {
        await SplashScreen.hideAsync();
      } catch (error) {
        // Splash screen already hidden or not available
        console.log('Splash screen hide error:', error);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return  (
    <AuthProvider>
      <SafeAreaProvider>
          <Stack>
            <Stack.Screen name='index' options={{headerShown:false}}/>
            <Stack.Screen name='auth' options={{headerShown:false}}/>
            <Stack.Screen name='signup' options={{headerShown:false}}/>
            <Stack.Screen name='(tabs)' options={{headerShown:false}}/>
          </Stack>
        </SafeAreaProvider>
      </AuthProvider>
  );
}

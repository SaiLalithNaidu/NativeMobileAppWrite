import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../contexts/AuthContext";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() 
{
  useEffect(() => {
    // Hide splash screen after 2 seconds
    setTimeout(async () => {
      await SplashScreen.hideAsync();
    }, 2000);
  }, []);

  return  (
    <AuthProvider>
      <SafeAreaProvider>
          <Stack>
            <Stack.Screen name='auth' options={{headerShown:false}}/>
            <Stack.Screen name='signup' options={{headerShown:false}}/>
            <Stack.Screen name='(tabs)' options={{headerShown:false}}/>
          </Stack>
        </SafeAreaProvider>
      </AuthProvider>
  );
}

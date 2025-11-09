import { Stack } from "expo-router";
import { useState } from 'react';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../contexts/AuthContext";
import { CartProvider } from "../contexts/CartContext";
import AnimatedSplash from "./components/AnimatedSplash";

export default function RootLayout() 
{
  const [isReady, setIsReady] = useState(false);

  if (!isReady) {
    return (
      <AnimatedSplash onFinish={() => setIsReady(true)}>
        {/* This will be shown after splash finishes */}
      </AnimatedSplash>
    );
  }

  return  (
    <AuthProvider>
      <CartProvider>
        <SafeAreaProvider>
            <Stack>
              <Stack.Screen name='index' options={{headerShown:false}}/>
              <Stack.Screen name='auth' options={{headerShown:false}}/>
              <Stack.Screen name='signup' options={{headerShown:false}}/>
              <Stack.Screen name='(tabs)' options={{headerShown:false}}/>
              <Stack.Screen name='CategoriesScreen' options={{headerShown:false}}/>
              <Stack.Screen 
                name='products' 
                options={{
                  headerShown: true,
                  headerTitle: 'Products',
                  presentation: 'card',
                  animation: 'slide_from_right'
                }}
              />
              <Stack.Screen 
                name='adminProducts' 
                options={{
                  headerShown: true,
                  headerTitle: 'Admin Products',
                  presentation: 'card',
                  animation: 'slide_from_right'
                }}
              />
              <Stack.Screen 
                name='editProduct' 
                options={{
                  headerShown: true,
                  headerTitle: 'Edit Product',
                  presentation: 'card',
                  animation: 'slide_from_right'
                }}
              />
              <Stack.Screen 
                name='productDetail' 
                options={{
                  headerShown: true,
                  headerTitle: 'Product Details',
                  presentation: 'card',
                  animation: 'slide_from_right'
                }}
              />
              <Stack.Screen 
                name='checkout' 
                options={{
                  headerShown: true,
                  headerTitle: 'Checkout',
                  presentation: 'card',
                  animation: 'slide_from_right'
                }}
              />
              <Stack.Screen 
                name='orderConfirmation' 
                options={{
                  headerShown: true,
                  headerTitle: 'Order Confirmation',
                  presentation: 'card',
                  animation: 'slide_from_right'
                }}
              />
            </Stack>
          </SafeAreaProvider>
        </CartProvider>
      </AuthProvider>
  );
}

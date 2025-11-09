import { Stack } from "expo-router";
import { useState } from 'react';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../contexts/AuthContext";
import { CartProvider } from "../contexts/CartContext";
import { ProfileProvider } from "../contexts/ProfileContext";
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
        <ProfileProvider>
          <SafeAreaProvider>
            <Stack>
              <Stack.Screen name='index' options={{headerShown:false}}/>
              <Stack.Screen name='auth' options={{headerShown:false}}/>
              <Stack.Screen name='signup' options={{headerShown:false}}/>
              <Stack.Screen name='(tabs)' options={{headerShown:false}}/>
              <Stack.Screen name='CategoriesScreen' options={{headerShown:false}}/>
              {/* <Stack.Screen 
                name='profile' 
                options={{
                  headerShown: true,
                  headerTitle: 'Profile',
                  presentation: 'card',
                  animation: 'slide_from_right',
                  headerStyle: {
                    backgroundColor: '#fff',
                    height: 85,
                  },
                  headerTitleStyle: {
                    fontSize: 18,
                    fontWeight: '600',
                    color: '#1f2937',
                  },
                  headerTintColor: '#374151',
                }}
              /> */}
              <Stack.Screen 
                name='products' 
                options={{
                  headerShown: true,
                  headerTitle: 'Products',
                  presentation: 'card',
                  animation: 'slide_from_right',
                  headerStyle: {
                    backgroundColor: '#fff',
                    height: 85,
                  },
                  headerTitleStyle: {
                    fontSize: 18,
                    fontWeight: '600',
                    color: '#1f2937',
                  },
                  headerTintColor: '#374151',
                }}
              />
              <Stack.Screen 
                name='adminProducts' 
                options={{
                  headerShown: true,
                  headerTitle: 'Admin Products',
                  presentation: 'card',
                  animation: 'slide_from_right',
                  headerStyle: {
                    backgroundColor: '#fff',
                    height: 85,
                  },
                  headerTitleStyle: {
                    fontSize: 18,
                    fontWeight: '600',
                    color: '#1f2937',
                  },
                  headerTintColor: '#374151',
                }}
              />
              <Stack.Screen 
                name='editProduct' 
                options={{
                  headerShown: true,
                  headerTitle: 'Edit Product',
                  presentation: 'card',
                  animation: 'slide_from_right',
                  headerStyle: {
                    backgroundColor: '#fff',
                    height: 85,
                  },
                  headerTitleStyle: {
                    fontSize: 18,
                    fontWeight: '600',
                    color: '#1f2937',
                  },
                  headerTintColor: '#374151',
                }}
              />
              <Stack.Screen 
                name='productDetail' 
                options={{
                  headerShown: true,
                  headerTitle: 'Product Details',
                  presentation: 'card',
                  animation: 'slide_from_right',
                  headerStyle: {
                    backgroundColor: '#fff',
                    height: 85,
                  },
                  headerTitleStyle: {
                    fontSize: 18,
                    fontWeight: '600',
                    color: '#1f2937',
                  },
                  headerTintColor: '#374151',
                }}
              />
              <Stack.Screen 
                name='checkout' 
                options={{
                  headerShown: true,
                  headerTitle: 'Checkout',
                  presentation: 'card',
                  animation: 'slide_from_right',
                  headerStyle: {
                    backgroundColor: '#fff',
                    height: 85,
                  },
                  headerTitleStyle: {
                    fontSize: 18,
                    fontWeight: '600',
                    color: '#1f2937',
                  },
                  headerTintColor: '#374151',
                }}
              />
              <Stack.Screen 
                name='orderConfirmation' 
                options={{
                  headerShown: true,
                  headerTitle: 'Order Confirmation',
                  presentation: 'card',
                  animation: 'slide_from_right',
                  headerStyle: {
                    backgroundColor: '#fff',
                    height: 85,
                  },
                  headerTitleStyle: {
                    fontSize: 18,
                    fontWeight: '600',
                    color: '#1f2937',
                  },
                  headerTintColor: '#374151',
                }}
              />
            </Stack>
          </SafeAreaProvider>
        </ProfileProvider>
      </CartProvider>
    </AuthProvider>
  );
}

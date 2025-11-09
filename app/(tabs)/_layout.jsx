import { FontAwesome5 } from '@expo/vector-icons';
import { Tabs, useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCart } from '../../contexts/CartContext';
import { useProfile } from '../../contexts/ProfileContext';
import { COLORS } from '../../src/utils/constants';

export default function TabsLayout() {

  const { getTotalItems } = useCart();
  const { profileImage } = useProfile();
  const router = useRouter();

  const handleProfilePress = () => {
    router.push('/profile');
  };

  return (
    <Tabs 
      screenOptions={{
        tabBarActiveTintColor: COLORS.PRIMARY,
        tabBarInactiveTintColor: '#999',
        tabBarStyle: { 
          backgroundColor: '#fff',
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        headerStyle: {
          backgroundColor: '#fff',
          height: 85,
          borderBottomWidth: 1,
          borderBottomColor: '#f3f4f6',
        },
        headerTitleStyle: { 
          fontSize: 18,
          fontWeight: '600',
          color: '#1f2937',
        },
      }} 
      initialRouteName="home"
    >
        <Tabs.Screen 
          name="home" 
          options={{ 
            title: "Home", 
            tabBarIcon:({color})=> <FontAwesome5 name="home" size={18} color={color} />,
            headerLeft: () => (
              <View style={styles.logoContainer}>
                <Image 
                  source={require('../../assets/images/app-logo.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
                <Text style={styles.logoText}>Ramesh Aqua</Text>
              </View>
            ),
            headerRight: () => (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
                {/* Cart Icon */}
                <View style={{ position: 'relative', marginRight: 16 }}>
                  {/* <FontAwesome5 name="shopping-cart" size={24} color="#666" /> */}
                  {getTotalItems() > 0 && (
                    <View style={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      backgroundColor: '#007AFF',
                      borderRadius: 10,
                      minWidth: 20,
                      height: 20,
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      <Text style={{ color: 'white', fontSize: 11, fontWeight: 'bold' }}>
                        {getTotalItems()}
                      </Text>
                    </View>
                  )}
                </View>
                
                {/* PhonePe-style Profile Section */}
                <TouchableOpacity 
                  onPress={handleProfilePress}
                  style={{
                    backgroundColor: '#f3f4f6',
                    padding: 3,
                    borderRadius: 10,
                    borderWidth: 0.5,
                    borderColor: '#e5e7eb',
                  }}
                >
                  {/* Profile Image */}
                  <View style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    backgroundColor: '#007AFF',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden'
                  }}>
                    {profileImage ? (
                      <Image 
                        source={{ uri: profileImage }} 
                        style={{ width: 34, height: 34, borderRadius: 8 }}
                      />
                    ) : (
                      <FontAwesome5 name="user" size={16} color="white" />
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            ),
            headerTitle: ""
          }} 
        />
        <Tabs.Screen 
          name="search" 
          options={{ 
            title: "Search", 
            tabBarIcon:({color})=><FontAwesome5 name="search" size={18} color={color} /> 
          }} 
        />
        <Tabs.Screen 
          name="cart" 
          options={{ 
            title: "Cart", 
            tabBarIcon:({color})=> {
              const itemCount = getTotalItems();
              return (
                <View>
                  <FontAwesome5 name="shopping-cart" size={18} color={color} />
                  {itemCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{itemCount > 99 ? '99+' : itemCount}</Text>
                    </View>
                  )}
                </View>
              );
            }
          }} 
        />
        <Tabs.Screen 
          name="adminPanel" 
          options={{ 
            title: "Admin Panel", 
            tabBarIcon:({color})=><FontAwesome5 name="tools" size={18} color={color} /> 
          }} 
        />
        <Tabs.Screen 
          name="warehouse" 
          options={{ 
            title: "Warehouse", 
            tabBarIcon:({color})=><FontAwesome5 name="warehouse" size={18} color={color} /> 
          }} 
        />
        <Tabs.Screen 
          name="orders" 
          options={{ 
            title: "Orders", 
            tabBarIcon:({color})=><FontAwesome5 name="receipt" size={18} color={color} /> 
          }} 
        />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: -8,
    top: -6,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    gap: 8,
  },
  logoImage: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  logoText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.PRIMARY_DARK,
  },
});
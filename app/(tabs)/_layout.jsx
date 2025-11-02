import { AntDesign, FontAwesome5 } from '@expo/vector-icons';
import { Tabs, useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

export default function TabsLayout() {

  const { user, logout } = useAuth();
  const { getTotalItems } = useCart();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/auth');
  };

  return (
    <Tabs screenOptions={{tabBarActiveTintColor:"coral"}} initialRouteName="home">
        <Tabs.Screen 
          name="home" 
          options={{ 
            title: "Home", 
            tabBarIcon:({color})=> <FontAwesome5 name="home" size={18} color={color} />,
            headerRight: () => (
              <View style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                <Text style={{ flexDirection: "row", alignItems: "center", fontSize: 8, paddingRight: 5 }}>Hi, {user ? user.email : 'Guest'}</Text>
                <TouchableOpacity onPress={handleLogout}>
                  <AntDesign name="logout" size={22} color="black" style={{ marginRight: 15 }} />
                </TouchableOpacity>
              </View>
            )
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
          name="profile" 
          options={{ 
            title: "Profile", 
            tabBarIcon:({color})=><FontAwesome5 name="user" size={18} color={color} /> 
          }} 
        />
        <Tabs.Screen 
          name="adminPanel" 
          options={{ 
            title: "Admin Panel", 
            tabBarIcon:({color})=><FontAwesome5 name="tools" size={18} color={color} /> 
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
    backgroundColor: '#ff3b30',
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
});
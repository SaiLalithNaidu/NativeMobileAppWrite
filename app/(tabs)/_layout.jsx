import { AntDesign, FontAwesome5 } from '@expo/vector-icons';
import { Tabs, useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function TabsLayout() {

  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/auth');
  };

  return (
    <Tabs screenOptions={{tabBarActiveTintColor:"coral"}} initialRouteName="home">
        <Tabs.Screen name="home" options={{ title: "Home", tabBarIcon:({color})=>
          <FontAwesome5 name="home" size={18} color={color} />,
            headerRight: () => (
              <View style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                <Text style={{ flexDirection: "row", alignItems: "center", fontSize: 8, paddingRight: 5 }}>Hi, {user ? user.email : 'Guest'}</Text>
                <TouchableOpacity onPress={handleLogout}>
                  <AntDesign name="logout" size={22} color="black" style={{ marginRight: 15 }} />
                </TouchableOpacity>
              </View>
            ), }} />
        <Tabs.Screen name="categories" options={{ title: "Categories", tabBarIcon:({color})=><FontAwesome5 name="th-list" size={18} color={color} /> }} />
        <Tabs.Screen name="cart" options={{ title: "Cart", tabBarIcon:({color})=><FontAwesome5 name="shopping-cart" size={18} color={color} /> }} />
        <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon:({color})=><FontAwesome5 name="user" size={18} color={color} /> }} />
    </Tabs>
  );
}
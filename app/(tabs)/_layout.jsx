import { AntDesign } from '@expo/vector-icons';
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{tabBarActiveTintColor:"coral"}} initialRouteName="home">
        <Tabs.Screen name="home" options={{ title: "Home", tabBarIcon:({color})=><AntDesign name="home" size={24} color={color} /> }} />
        <Tabs.Screen name="categories" options={{ title: "Categories", tabBarIcon:({color})=><AntDesign name="appstore-o" size={24} color={color} /> }} />
        <Tabs.Screen name="cart" options={{ title: "Cart", tabBarIcon:({color})=><AntDesign name="shopping-cart" size={24} color={color} /> }} />
        <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon:({color})=><AntDesign name="user" size={24} color={color} /> }} />
    </Tabs>
  );
}
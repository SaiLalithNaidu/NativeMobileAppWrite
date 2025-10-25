import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from '../../contexts/AuthContext';

export default function Index() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/auth');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Home Screen!</Text>
      {user && <Text style={styles.userText}>Logged in as: {user.email}</Text>}
      
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  userText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  logoutButton: {
    backgroundColor: 'coral',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
import { AntDesign, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useProfile } from '../contexts/ProfileContext';
import { COLORS } from '../src/utils/constants';

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const { clearCart, getTotalItems, getTotal } = useCart();
  const { profileImage, setProfileImage } = useProfile();
  const router = useRouter();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Profile Picture Upload
  const selectProfileImage = async () => {
    Alert.alert(
      'Select Profile Picture',
      'Choose how you want to select your profile picture',
      [
        { text: 'Camera', onPress: openCamera },
        { text: 'Gallery', onPress: openGallery },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Camera permission is required to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
      Toast.show({
        type: 'success',
        text1: 'Profile Picture Updated',
        text2: 'Your profile picture has been updated successfully',
      });
    }
  };

  const openGallery = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Gallery permission is required to select photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
      Toast.show({
        type: 'success',
        text1: 'Profile Picture Updated',
        text2: 'Your profile picture has been updated successfully',
      });
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            clearCart();
            router.replace('/auth');
          }
        }
      ]
    );
  };

  const ProfileSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const ProfileItem = ({ icon, title, subtitle, onPress, rightIcon = 'chevron-right', rightComponent }) => (
    <TouchableOpacity style={styles.profileItem} onPress={onPress}>
      <View style={styles.profileItemLeft}>
        <View style={styles.iconContainer}>
          <FontAwesome5 name={icon} size={18} color={COLORS.PRIMARY} />
        </View>
        <View style={styles.itemContent}>
          <Text style={styles.itemTitle}>{title}</Text>
          {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent || (
        <AntDesign name={rightIcon} size={16} color="#ccc" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <LinearGradient
          colors={[COLORS.PRIMARY, COLORS.PRIMARY_DARK]}
          style={styles.headerGradient}
        >
          <View style={styles.profileHeader}>
            <TouchableOpacity 
              style={styles.profileImageContainer}
              onPress={selectProfileImage}
            >
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <FontAwesome5 name="user" size={40} color="white" />
                </View>
              )}
              <View style={styles.cameraIcon}>
                <FontAwesome5 name="camera" size={14} color="white" />
              </View>
            </TouchableOpacity>
            
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.displayName || user?.email || 'Guest User'}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <View style={styles.userStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{getTotalItems()}</Text>
                  <Text style={styles.statLabel}>Cart Items</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>₹{getTotal().toFixed(0)}</Text>
                  <Text style={styles.statLabel}>Cart Value</Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Account Section */}
          <ProfileSection title="Account">
            <ProfileItem
              icon="user-edit"
              title="Edit Profile"
              subtitle="Update your personal information"
              onPress={() => Toast.show({ type: 'info', text1: 'Feature Coming Soon' })}
            />
            <ProfileItem
              icon="map-marker-alt"
              title="Manage Addresses"
              subtitle="Add or edit delivery addresses"
              onPress={() => Toast.show({ type: 'info', text1: 'Feature Coming Soon' })}
            />
            <ProfileItem
              icon="credit-card"
              title="Payment Methods"
              subtitle="Manage your payment options"
              onPress={() => Toast.show({ type: 'info', text1: 'Feature Coming Soon' })}
            />
          </ProfileSection>

          {/* Business Section */}
          <ProfileSection title="Business">
            <ProfileItem
              icon="building"
              title="Company Details"
              subtitle="Manage your business information"
              onPress={() => Toast.show({ type: 'info', text1: 'Feature Coming Soon' })}
            />
            <ProfileItem
              icon="fish"
              title="Farm Details"
              subtitle="Add your aquaculture farm info"
              onPress={() => Toast.show({ type: 'info', text1: 'Feature Coming Soon' })}
            />
            <ProfileItem
              icon="receipt"
              title="Order History"
              subtitle="View your past orders"
              onPress={() => router.push('/orders')}
            />
          </ProfileSection>

          {/* Settings Section */}
          <ProfileSection title="Settings">
            <ProfileItem
              icon="bell"
              title="Notifications"
              subtitle="Manage notification preferences"
              rightComponent={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: '#ccc', true: COLORS.PRIMARY }}
                  thumbColor={notificationsEnabled ? 'white' : '#f4f3f4'}
                />
              }
            />
            <ProfileItem
              icon="moon"
              title="Dark Mode"
              subtitle="Switch to dark theme"
              rightComponent={
                <Switch
                  value={darkMode}
                  onValueChange={setDarkMode}
                  trackColor={{ false: '#ccc', true: COLORS.PRIMARY }}
                  thumbColor={darkMode ? 'white' : '#f4f3f4'}
                />
              }
            />
            <ProfileItem
              icon="globe"
              title="Language"
              subtitle="English"
              onPress={() => Toast.show({ type: 'info', text1: 'Feature Coming Soon' })}
            />
          </ProfileSection>

          {/* Support Section */}
          <ProfileSection title="Support">
            <ProfileItem
              icon="question-circle"
              title="Help & Support"
              subtitle="Get help with your account"
              onPress={() => Toast.show({ type: 'info', text1: 'Feature Coming Soon' })}
            />
            <ProfileItem
              icon="star"
              title="Rate App"
              subtitle="Rate us on the app store"
              onPress={() => Toast.show({ type: 'success', text1: 'Thank you for your feedback!' })}
            />
            <ProfileItem
              icon="shield-alt"
              title="Privacy Policy"
              subtitle="Read our privacy policy"
              onPress={() => Toast.show({ type: 'info', text1: 'Feature Coming Soon' })}
            />
            <ProfileItem
              icon="info-circle"
              title="About App"
              subtitle="Version 1.0.0"
              onPress={() => Toast.show({ type: 'info', text1: 'Ramesh Aqua - Version 1.0.0' })}
            />
          </ProfileSection>

          {/* Logout Section */}
          <View style={styles.section}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <MaterialIcons name="logout" size={20} color="#dc2626" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  profileHeader: {
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: 'white',
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: COLORS.PRIMARY_DARK,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
  },
  userStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 2,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.PRIMARY}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 13,
    color: '#6b7280',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    gap: 10,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
  },
});

export default ProfileScreen;
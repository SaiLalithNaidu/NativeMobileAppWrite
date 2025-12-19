import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, updateProfile } from 'firebase/auth';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { auth } from '../../lib/firebase';

const ProfileScreen = () => {
    const { user, logout } = useAuth();
    const { theme, isDarkMode, toggleTheme } = useTheme();

    // Modal states
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);

    // Edit profile states
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [isUpdating, setIsUpdating] = useState(false);

    // Password change states
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Handle profile update
    const handleUpdateProfile = async () => {
        if (!displayName.trim()) {
            Alert.alert('Error', 'Name cannot be empty');
            return;
        }

        try {
            setIsUpdating(true);
            await updateProfile(auth.currentUser, {
                displayName: displayName.trim()
            });
            Alert.alert('Success', 'Profile updated successfully!');
            setEditModalVisible(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', error.message);
        } finally {
            setIsUpdating(false);
        }
    };

    // Handle password change
    const handleChangePassword = async () => {
        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Error', 'New password must be at least 6 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }

        try {
            setIsChangingPassword(true);

            // Re-authenticate user
            const credential = EmailAuthProvider.credential(
                auth.currentUser.email,
                currentPassword
            );

            await reauthenticateWithCredential(auth.currentUser, credential);

            // Update password
            await updatePassword(auth.currentUser, newPassword);

            Alert.alert('Success', 'Password changed successfully!');
            setPasswordModalVisible(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error('Error changing password:', error);
            if (error.code === 'auth/wrong-password') {
                Alert.alert('Error', 'Current password is incorrect');
            } else {
                Alert.alert('Error', error.message);
            }
        } finally {
            setIsChangingPassword(false);
        }
    };

    // Handle logout
    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        const result = await logout();
                        if (result.success) {
                            // Navigation handled by auth state change
                        }
                    }
                }
            ]
        );
    };

    const renderMenuItem = (icon, title, onPress, showArrow = true, rightContent = null) => (
        <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconContainer, { backgroundColor: theme.iconBackground }]}>
                    <FontAwesome5 name={icon} size={18} color={theme.primary} />
                </View>
                <Text style={[styles.menuItemText, { color: theme.text }]}>{title}</Text>
            </View>
            {rightContent || (showArrow && <FontAwesome5 name="chevron-right" size={16} color={theme.textLight} />)}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <LinearGradient
                    colors={[theme.gradientStart, theme.gradientEnd]}
                    style={styles.header}
                >
                    <View style={styles.profileImageContainer}>
                        <View style={styles.profileImageWrapper}>
                            {user?.photoURL ? (
                                <Image source={{ uri: user.photoURL }} style={styles.profileImage} />
                            ) : (
                                <View style={[styles.profileImagePlaceholder, { backgroundColor: theme.primary }]}>
                                    <FontAwesome5 name="user" size={40} color="white" />
                                </View>
                            )}
                        </View>
                    </View>

                    <Text style={styles.userName}>{user?.displayName || 'User'}</Text>
                    <Text style={styles.userEmail}>{user?.email}</Text>
                </LinearGradient>

                {/* Account Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>ACCOUNT</Text>
                    {renderMenuItem('user-edit', 'Edit Profile', () => setEditModalVisible(true))}
                    {renderMenuItem('lock', 'Change Password', () => setPasswordModalVisible(true))}
                </View>

                {/* Preferences Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>PREFERENCES</Text>
                    {renderMenuItem(
                        isDarkMode ? 'moon' : 'sun',
                        'Dark Mode',
                        toggleTheme,
                        false,
                        <Switch
                            value={isDarkMode}
                            onValueChange={toggleTheme}
                            trackColor={{ false: '#cbd5e1', true: theme.primary }}
                            thumbColor={isDarkMode ? '#ffffff' : '#f3f4f6'}
                        />
                    )}
                    {renderMenuItem('bell', 'Notifications', () => Alert.alert('Coming Soon', 'Notification settings will be available soon'))}
                </View>

                {/* Support Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>SUPPORT</Text>
                    {renderMenuItem('question-circle', 'Help & Support', () => Alert.alert('Help', 'Contact support at support@rameshaqua.com'))}
                    {renderMenuItem('info-circle', 'About', () => Alert.alert('About', 'Ramesh Aqua v1.0.0\nYour trusted aquatic collection partner'))}
                    {renderMenuItem('shield-alt', 'Privacy Policy', () => Alert.alert('Privacy', 'Privacy policy coming soon'))}
                </View>

                {/* Logout Button */}
                <TouchableOpacity
                    style={[styles.logoutButton, { backgroundColor: theme.cardBackground, borderColor: theme.error }]}
                    onPress={handleLogout}
                    activeOpacity={0.7}
                >
                    <FontAwesome5 name="sign-out-alt" size={18} color={theme.error} />
                    <Text style={[styles.logoutText, { color: theme.error }]}>Logout</Text>
                </TouchableOpacity>

                {/* App Version */}
                <Text style={[styles.versionText, { color: theme.textLight }]}>Version 1.0.0</Text>
            </ScrollView>

            {/* Edit Profile Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={editModalVisible}
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, { backgroundColor: theme.cardBackground }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Profile</Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                <FontAwesome5 name="times" size={20} color={theme.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalContent}>
                            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Display Name</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                                value={displayName}
                                onChangeText={setDisplayName}
                                placeholder="Enter your name"
                                placeholderTextColor={theme.textLight}
                            />

                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: theme.primary }]}
                                onPress={handleUpdateProfile}
                                disabled={isUpdating}
                            >
                                {isUpdating ? (
                                    <Text style={styles.modalButtonText}>Updating...</Text>
                                ) : (
                                    <Text style={styles.modalButtonText}>Save Changes</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Change Password Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={passwordModalVisible}
                onRequestClose={() => setPasswordModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, { backgroundColor: theme.cardBackground }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Change Password</Text>
                            <TouchableOpacity onPress={() => setPasswordModalVisible(false)}>
                                <FontAwesome5 name="times" size={20} color={theme.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalContent}>
                            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Current Password</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                placeholder="Enter current password"
                                placeholderTextColor={theme.textLight}
                                secureTextEntry
                            />

                            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>New Password</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                                value={newPassword}
                                onChangeText={setNewPassword}
                                placeholder="Enter new password"
                                placeholderTextColor={theme.textLight}
                                secureTextEntry
                            />

                            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Confirm New Password</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="Confirm new password"
                                placeholderTextColor={theme.textLight}
                                secureTextEntry
                            />

                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: theme.primary }]}
                                onPress={handleChangePassword}
                                disabled={isChangingPassword}
                            >
                                {isChangingPassword ? (
                                    <Text style={styles.modalButtonText}>Changing...</Text>
                                ) : (
                                    <Text style={styles.modalButtonText}>Change Password</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 40,
        paddingBottom: 30,
        alignItems: 'center',
    },
    profileImageContainer: {
        marginBottom: 16,
    },
    profileImageWrapper: {
        width: 100,
        height: 100,
        borderRadius: 50,
        overflow: 'hidden',
        borderWidth: 4,
        borderColor: 'white',
    },
    profileImage: {
        width: 100,
        height: 100,
    },
    profileImagePlaceholder: {
        width: 100,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: '#b3d9ff',
    },
    section: {
        marginTop: 24,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.5,
        marginBottom: 12,
        marginLeft: 4,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    menuItemText: {
        fontSize: 16,
        fontWeight: '500',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 16,
        marginTop: 32,
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 1,
        gap: 10,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
    },
    versionText: {
        textAlign: 'center',
        fontSize: 12,
        marginTop: 24,
        marginBottom: 40,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    modalContent: {
        padding: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
        marginTop: 12,
    },
    input: {
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
    },
    modalButton: {
        marginTop: 24,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ProfileScreen;

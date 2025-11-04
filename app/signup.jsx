import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import AlertCard from './components/AlertCard';
import { formatAuthError, getPasswordStrength, isValidEmail, validatePasswordStrength } from './services/validationService';

export default function SignupScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [passwordStrength, setPasswordStrength] = useState('weak');
    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ title: '', message: '' });
    const router = useRouter();
    const { signup } = useAuth();

    // Update password strength indicator as user types
    const handlePasswordChange = (text) => {
        setPassword(text);
        if (text) {
            setPasswordStrength(getPasswordStrength(text));
        } else {
            setPasswordStrength('weak');
        }
    };

    const handleSignup = async () => {
        // Validation - Required fields
        if (!name || !email || !password || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        // Validate name
        if (name.trim().length < 2) {
            setError('Name must be at least 2 characters');
            return;
        }

        // Validate email format
        if (!isValidEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        // Validate password strength
        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.isValid) {
            const errorList = passwordValidation.errors.join('\n• ');
            const errorMsg = `Password must contain:\n• ${errorList}`;
            setError(errorMsg);
            
            // Show AlertCard
            setAlertConfig({
                title: 'Weak Password',
                message: `Your password must contain:\n\n• ${errorList}`
            });
            setShowAlert(true);
            return;
        }

        // Validate password confirmation
        if (password !== confirmPassword) {
            const errorMsg = 'Passwords do not match';
            setError(errorMsg);
            
            // Show AlertCard
            setAlertConfig({
                title: 'Password Mismatch',
                message: 'The passwords you entered do not match. Please try again.'
            });
            setShowAlert(true);
            return;
        }

        setLoading(true);
        setError('');

        const result = await signup(email, password, name);

        setLoading(false);

        if (result.success) {
            // Navigate to main screen after successful signup
            router.replace('/(tabs)/home');
        } else {
            // Format Firebase error to user-friendly message
            const friendlyMessage = formatAuthError(result.error);
            setError(friendlyMessage);
            
            // Show AlertCard for signup errors
            setAlertConfig({
                title: 'Sign Up Failed',
                message: friendlyMessage
            });
            setShowAlert(true);
        }
    };

    return (
        <LinearGradient
            colors={['#002147', '#004080', '#0066b3']}
            style={styles.container}
        >
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"} 
                style={styles.keyboardView}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.logoContainer}>
                        <Image 
                            source={require('../assets/images/app-logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <Text style={styles.brandName}>Ramesh Aqua</Text>
                        <Text style={styles.tagline}>Join Our Community</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Sign up to get started</Text>

                        {error ? (
                            <View style={styles.errorContainer}>
                                <FontAwesome5 name="exclamation-circle" size={16} color="#d32f2f" />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}

                        <View style={styles.inputContainer}>
                            <FontAwesome5 name="user" size={18} color="#666" style={styles.inputIcon} />
                            <TextInput 
                                placeholder='Full Name' 
                                placeholderTextColor="#999"
                                value={name}
                                onChangeText={setName}
                                autoCapitalize='words'
                                style={styles.input}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <FontAwesome5 name="envelope" size={18} color="#666" style={styles.inputIcon} />
                            <TextInput 
                                placeholder='Email address' 
                                placeholderTextColor="#999"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize='none'
                                keyboardType='email-address'
                                style={styles.input}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <FontAwesome5 name="lock" size={18} color="#666" style={styles.inputIcon} />
                            <TextInput 
                                placeholder='Password' 
                                placeholderTextColor="#999"
                                value={password}
                                onChangeText={handlePasswordChange}
                                secureTextEntry={!showPassword} 
                                style={styles.input}
                            />
                            <TouchableOpacity 
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeIcon}
                            >
                                <FontAwesome5 
                                    name={showPassword ? "eye" : "eye-slash"} 
                                    size={18} 
                                    color="#666" 
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Password Strength Indicator */}
                        {password.length > 0 && (
                            <View style={styles.passwordStrengthContainer}>
                                <Text style={styles.passwordStrengthLabel}>Password Strength:</Text>
                                <View style={styles.strengthBarContainer}>
                                    <View 
                                        style={[
                                            styles.strengthBar,
                                            passwordStrength === 'weak' && styles.strengthWeak,
                                            passwordStrength === 'medium' && styles.strengthMedium,
                                            passwordStrength === 'strong' && styles.strengthStrong,
                                        ]}
                                    />
                                </View>
                                <Text 
                                    style={[
                                        styles.strengthText,
                                        passwordStrength === 'weak' && styles.strengthTextWeak,
                                        passwordStrength === 'medium' && styles.strengthTextMedium,
                                        passwordStrength === 'strong' && styles.strengthTextStrong,
                                    ]}
                                >
                                    {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
                                </Text>
                            </View>
                        )}

                        {/* Password Requirements Hint */}
                        <View style={styles.hintContainer}>
                            <FontAwesome5 name="info-circle" size={12} color="#666" />
                            <Text style={styles.hintText}>
                                Must contain: uppercase, lowercase, number, special character (!@#$%^&*...)
                            </Text>
                        </View>

                        <View style={styles.inputContainer}>
                            <FontAwesome5 name="lock" size={18} color="#666" style={styles.inputIcon} />
                            <TextInput 
                                placeholder='Confirm Password' 
                                placeholderTextColor="#999"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showConfirmPassword} 
                                style={styles.input}
                            />
                            <TouchableOpacity 
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={styles.eyeIcon}
                            >
                                <FontAwesome5 
                                    name={showConfirmPassword ? "eye" : "eye-slash"} 
                                    size={18} 
                                    color="#666" 
                                />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity 
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleSignup}
                            disabled={loading}
                        >
                            <LinearGradient
                                colors={['#0080ff', '#0066cc']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.buttonGradient}
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <>
                                        <Text style={styles.buttonText}>Create Account</Text>
                                        <FontAwesome5 name="user-plus" size={16} color="white" />
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>OR</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <View style={styles.linkContainer}>
                            <Text style={styles.linkText}>Already have an account? </Text>
                            <Link href="/auth" asChild>
                                <TouchableOpacity>
                                    <Text style={styles.link}>Sign In</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Alert Modal */}
            <Modal
                visible={showAlert}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowAlert(false)}
            >
                <View style={styles.modalOverlay}>
                    <AlertCard
                        type="error"
                        title={alertConfig.title}
                        message={alertConfig.message}
                        buttonText="OK"
                        onPress={() => setShowAlert(false)}
                    />
                </View>
            </Modal>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
        paddingTop: 40,
        paddingBottom: 40,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: 12,
    },
    brandName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    tagline: {
        fontSize: 14,
        color: '#b3d9ff',
        fontWeight: '500',
    },
    formContainer: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
        color: '#002147',
    },
    subtitle: {
        fontSize: 15,
        marginBottom: 24,
        textAlign: 'center',
        color: '#666',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 56,
        borderColor: '#e0e0e0',
        borderWidth: 1.5,
        borderRadius: 12,
        marginBottom: 16,
        paddingHorizontal: 16,
        backgroundColor: '#fafafa',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    eyeIcon: {
        padding: 8,
    },
    button: {
        height: 56,
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 8,
    },
    buttonGradient: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffebee',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        gap: 8,
    },
    errorText: {
        color: '#d32f2f',
        fontSize: 14,
        flex: 1,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#e0e0e0',
    },
    dividerText: {
        marginHorizontal: 16,
        color: '#999',
        fontSize: 14,
        fontWeight: '600',
    },
    linkContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    linkText: {
        color: '#666',
        fontSize: 15,
    },
    link: {
        color: '#0080ff',
        fontSize: 15,
        fontWeight: '700',
    },
    // Password Strength Indicator
    passwordStrengthContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    passwordStrengthLabel: {
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
    },
    strengthBarContainer: {
        flex: 1,
        height: 4,
        backgroundColor: '#e0e0e0',
        borderRadius: 2,
        overflow: 'hidden',
    },
    strengthBar: {
        height: '100%',
        borderRadius: 2,
        transition: 'width 0.3s ease',
    },
    strengthWeak: {
        width: '33%',
        backgroundColor: '#d32f2f',
    },
    strengthMedium: {
        width: '66%',
        backgroundColor: '#ff9800',
    },
    strengthStrong: {
        width: '100%',
        backgroundColor: '#4caf50',
    },
    strengthText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        minWidth: 50,
        textAlign: 'right',
    },
    strengthTextWeak: {
        color: '#d32f2f',
    },
    strengthTextMedium: {
        color: '#ff9800',
    },
    strengthTextStrong: {
        color: '#4caf50',
    },
    hintContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#f5f5f5',
        padding: 10,
        borderRadius: 8,
        marginBottom: 16,
        gap: 8,
    },
    hintText: {
        flex: 1,
        fontSize: 11,
        color: '#666',
        lineHeight: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

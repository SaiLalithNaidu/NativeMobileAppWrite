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
    const [alertConfig, setAlertConfig] = useState({ title: '', message: '', type: 'error' });
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const router = useRouter();
    const { signup, resetPassword } = useAuth();

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

    const handleForgotPassword = async () => {
        if (!resetEmail) {
            setAlertConfig({
                title: 'Email Required',
                message: 'Please enter your email address to reset your password.',
                type: 'error'
            });
            setShowAlert(true);
            return;
        }

        if (!isValidEmail(resetEmail)) {
            setAlertConfig({
                title: 'Invalid Email',
                message: 'Please enter a valid email address.',
                type: 'error'
            });
            setShowAlert(true);
            return;
        }

        console.log('Attempting to send password reset email to:', resetEmail);
        setResetLoading(true);
        
        try {
            const result = await resetPassword(resetEmail);
            console.log('Password reset result:', result);
            setResetLoading(false);

            if (result.success) {
                setAlertConfig({
                    title: '✅ Email Sent Successfully!',
                    message: `Password reset email sent to ${resetEmail}!\n\n📧 Please check:\n• Your inbox\n• Spam/Junk folder\n• Promotions tab (Gmail)\n\n💡 If you don't see it, try adding noreply@rameshaqua-1fc5f.firebaseapp.com to your contacts.`,
                    type: 'success'
                });
                setShowAlert(true);
                setShowForgotPassword(false);
                setResetEmail('');
            } else {
                const friendlyMessage = formatAuthError(result.error);
                setAlertConfig({
                    title: 'Reset Failed',
                    message: `Reset failed: ${friendlyMessage}. Please make sure the email address is registered.`,
                    type: 'error'
                });
                setShowAlert(true);
            }
        } catch (error) {
            console.error('Unexpected error in forgot password:', error);
            setResetLoading(false);
            setAlertConfig({
                title: 'Error',
                message: 'An unexpected error occurred. Please try again.',
                type: 'error'
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
                            source={require('../assets/images/app_logo.jpg')}
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

                        <TouchableOpacity 
                            onPress={() => setShowForgotPassword(true)}
                            style={styles.forgotPasswordContainer}
                        >
                            <Text style={styles.forgotPasswordText}>
                                <FontAwesome5 name="key" size={12} color="#0080ff" /> Forgot Password?
                            </Text>
                        </TouchableOpacity>

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
                        type={alertConfig.type}
                        title={alertConfig.title}
                        message={alertConfig.message}
                        buttonText="OK"
                        onPress={() => setShowAlert(false)}
                    />
                </View>
            </Modal>

            {/* Forgot Password Modal */}
            <Modal
                visible={showForgotPassword}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowForgotPassword(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.forgotPasswordModal}>
                        <View style={styles.modalHeader}>
                            <FontAwesome5 name="key" size={24} color="#0080ff" />
                            <Text style={styles.modalTitle}>Reset Password</Text>
                        </View>
                        
                        <Text style={styles.modalDescription}>
                            Enter your email address and we&apos;ll send you instructions to reset your password.
                        </Text>

                        <View style={styles.inputContainer}>
                            <FontAwesome5 name="envelope" size={18} color="#666" style={styles.inputIcon} />
                            <TextInput 
                                placeholder='Enter your email address' 
                                placeholderTextColor="#999"
                                value={resetEmail}
                                onChangeText={setResetEmail}
                                autoCapitalize='none'
                                keyboardType='email-address'
                                style={styles.input}
                            />
                        </View>

                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity 
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => {
                                    setShowForgotPassword(false);
                                    setResetEmail('');
                                }}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={[styles.modalButton, styles.sendButton, resetLoading && styles.buttonDisabled]}
                                onPress={handleForgotPassword}
                                disabled={resetLoading}
                            >
                                <LinearGradient
                                    colors={['#0080ff', '#0066cc']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.buttonGradient}
                                >
                                    {resetLoading ? (
                                        <ActivityIndicator color="white" size="small" />
                                    ) : (
                                        <>
                                            <FontAwesome5 name="paper-plane" size={14} color="white" />
                                            <Text style={styles.sendButtonText}>Send Reset Email</Text>
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
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
        borderRadius: 20,
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
        height: 60,
        borderColor: '#d1d5db',
        borderWidth: 0.5,
        borderRadius: 18,
        marginBottom: 18,
        paddingHorizontal: 20,
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    inputIcon: {
        marginRight: 14,
        opacity: 0.8,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1f2937',
        fontWeight: '500',
    },
    eyeIcon: {
        padding: 8,
    },
    button: {
        height: 60,
        borderRadius: 18,
        overflow: 'hidden',
        marginTop: 12,
        shadowColor: '#0080ff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
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
        backgroundColor: '#fef2f2',
        padding: 16,
        borderRadius: 16,
        marginBottom: 18,
        gap: 10,
        borderWidth: 1,
        borderColor: '#fecaca',
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
        backgroundColor: '#f8fafc',
        padding: 14,
        borderRadius: 16,
        marginBottom: 18,
        gap: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
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
    forgotPasswordContainer: {
        alignSelf: 'center',
        marginTop: 16,
        marginBottom: 8,
    },
    forgotPasswordText: {
        color: '#0080ff',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    forgotPasswordModal: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 28,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        gap: 12,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#002147',
    },
    modalDescription: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    modalButtonContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    modalButton: {
        flex: 1,
        height: 52,
        borderRadius: 16,
        overflow: 'hidden',
    },
    cancelButton: {
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
    sendButton: {
        // Gradient will be applied
    },
    sendButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
});

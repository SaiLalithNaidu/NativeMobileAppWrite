import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import AlertCard from './components/AlertCard';
import { formatAuthError, isValidEmail } from './services/validationService';

export default function AuthScreen()
{
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const router = useRouter();
    const { login } = useAuth();

    const handleLogin = async () => {
        // Validation
        if (!email || !password) {
            setError('Please enter both email and password');
            return;
        }

        // Validate email format
        if (!isValidEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        setError('');

        const result = await login(email, password);

        setLoading(false);

        if (result.success) {
            // Navigate to main screen after successful login
            router.replace('/(tabs)/home');
        } else {
            // Format Firebase error to user-friendly message
            const friendlyMessage = formatAuthError(result.error);
            setError(friendlyMessage);
            
            // Show alert card for critical errors
            setAlertMessage(friendlyMessage);
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
                <View style={styles.logoContainer}>
                    <Image 
                        source={require('../assets/images/app-logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.brandName}>Ramesh Aqua</Text>
                    <Text style={styles.tagline}>Fresh & Quality Seafood</Text>
                </View>

                <View style={styles.formContainer}>
                    <Text style={styles.title}>Welcome Back!</Text>
                    <Text style={styles.subtitle}>Sign in to your account</Text>

                    {error ? (
                        <View style={styles.errorContainer}>
                            <FontAwesome5 name="exclamation-circle" size={16} color="#d32f2f" />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

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
                            onChangeText={setPassword}
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

                    <TouchableOpacity 
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleLogin}
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
                                    <Text style={styles.buttonText}>Sign In</Text>
                                    <FontAwesome5 name="arrow-right" size={16} color="white" />
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
                        <Text style={styles.linkText}>Don&apos;t have an account? </Text>
                        <Link href="/signup" asChild>
                            <TouchableOpacity>
                                <Text style={styles.link}>Sign Up</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>
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
                        title="Sign In Failed"
                        message={alertMessage}
                        buttonText="Try Again"
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
        justifyContent: 'center',
        padding: 20,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: 16,
    },
    brandName: {
        fontSize: 32,
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
        fontSize: 28,
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
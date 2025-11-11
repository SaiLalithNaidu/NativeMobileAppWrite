import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { ActivityIndicator, Image, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AlertCard from './components/AlertCard';
import { useAuthForm } from './hooks/useAuthForm';

export default function AuthScreen() {
    const {
        formState,
        handleLogin,
        handleForgotPassword,
        handleFieldChange,
        togglePasswordVisibility,
        showForgotPasswordModal,
        hideForgotPasswordModal,
        hideAlert
    } = useAuthForm();

    const {
        email,
        password,
        resetEmail,
        loading,
        resetLoading,
        error,
        showPassword,
        showAlert,
        showForgotPassword,
        alertMessage,
        alertType
    } = formState;

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
                        source={require('../assets/images/app_logo.png')}
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
                            onChangeText={(value) => handleFieldChange('email', value)}
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
                            onChangeText={(value) => handleFieldChange('password', value)}
                            secureTextEntry={!showPassword} 
                            style={styles.input}
                        />
                        <TouchableOpacity 
                            onPress={() => togglePasswordVisibility('showPassword')}
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
                        onPress={() => handleLogin(email, password)}
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

                    <TouchableOpacity 
                        onPress={showForgotPasswordModal}
                        style={styles.forgotPasswordContainer}
                    >
                        <Text style={styles.forgotPasswordText}>
                            <FontAwesome5 name="key" size={12} color="#0080ff" /> Forgot Password?
                        </Text>
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
                onRequestClose={hideAlert}
            >
                <View style={styles.modalOverlay}>
                    <AlertCard
                        type={alertType}
                        title={alertType === 'success' ? "Email Sent" : "Sign In Failed"}
                        message={alertMessage}
                        buttonText={alertType === 'success' ? "OK" : "Try Again"}
                        onPress={hideAlert}
                    />
                </View>
            </Modal>

            {/* Forgot Password Modal */}
            <Modal
                visible={showForgotPassword}
                transparent={true}
                animationType="slide"
                onRequestClose={hideForgotPasswordModal}
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
                                onChangeText={(value) => handleFieldChange('resetEmail', value)}
                                autoCapitalize='none'
                                keyboardType='email-address'
                                style={styles.input}
                            />
                        </View>

                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity 
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={hideForgotPasswordModal}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={[styles.modalButton, styles.sendButton, resetLoading && styles.buttonDisabled]}
                                onPress={() => handleForgotPassword(resetEmail)}
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
        height: 60,
        borderColor: '#d1d5db',
        borderWidth: 2,
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
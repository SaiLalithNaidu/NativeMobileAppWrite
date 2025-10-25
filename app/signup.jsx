import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function SignupScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const { signup } = useAuth();

    const handleSignup = async () => {
        // Validation
        if (!name || !email || !password || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
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
            setError(result.error || 'Signup failed');
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"} 
            style={styles.container}
        >
            <ScrollView 
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.formContainer}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Sign up to get started</Text>

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <TextInput 
                        placeholder='Full Name' 
                        value={name}
                        onChangeText={setName}
                        autoCapitalize='words'
                        style={styles.input}
                    />

                    <TextInput 
                        placeholder='Email' 
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize='none'
                        keyboardType='email-address'
                        style={styles.input}
                    />

                    <TextInput 
                        placeholder='Password' 
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={true} 
                        style={styles.input}
                    />

                    <TextInput 
                        placeholder='Confirm Password' 
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={true} 
                        style={styles.input}
                    />

                    <TouchableOpacity 
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleSignup}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.buttonText}>Sign Up</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.linkContainer}>
                        <Text style={styles.linkText}>Already have an account? </Text>
                        <Link href="/auth" style={styles.link}>
                            Login
                        </Link>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5'
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    formContainer: {
        width: '100%',
        maxWidth: 400,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
        color: '#333'
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 24,
        textAlign: 'center',
        color: '#666'
    },
    input: {
        height: 50,
        borderColor: '#ddd',
        borderWidth: 1,
        marginBottom: 16,
        paddingHorizontal: 15,
        borderRadius: 8,
        fontSize: 16,
        backgroundColor: '#fafafa'
    },
    button: {
        backgroundColor: 'coral',
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8
    },
    buttonDisabled: {
        opacity: 0.6
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600'
    },
    errorText: {
        color: 'red',
        marginBottom: 12,
        textAlign: 'center'
    },
    linkContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20
    },
    linkText: {
        color: '#666',
        fontSize: 16
    },
    link: {
        color: 'coral',
        fontSize: 16,
        fontWeight: '600'
    }
});

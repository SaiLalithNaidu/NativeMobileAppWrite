import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function AuthScreen()
{
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const { login } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please enter both email and password');
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
            setError(result.error || 'Login failed');
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"} 
            style={styles.container}
        >
            <View style={styles.formContainer}>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Sign in to continue</Text>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

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

                <TouchableOpacity 
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.buttonText}>Login</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.linkContainer}>
                    <Text style={styles.linkText}>Don't have an account? </Text>
                    <Link href="/signup" style={styles.link}>
                        Sign Up
                    </Link>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#f5f5f5'
    },
    formContainer: {
        width: '85%',
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
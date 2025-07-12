import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useAuth } from '@/context/AuthContext';
// import { Google } from 'lucide-react-native';

export const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async () => {
    setError(null);
    setFormLoading(true);
    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setFormLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setFormLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google sign in failed');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#0C121E" />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Welcome to Nora</Text>
          <Text style={styles.subtitle}>{mode === 'signin' ? 'Sign in to continue' : 'Create your account'}</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.textInput}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!formLoading}
              />
            </View>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.textInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
                editable={!formLoading}
              />
            </View>
          </View>
          {error && <Text style={styles.error}>{error}</Text>}
          <TouchableOpacity
            style={[styles.button, formLoading && styles.buttonDisabled]}
            onPress={handleAuth}
            disabled={formLoading}
          >
            <Text style={styles.buttonText}>{mode === 'signin' ? 'Sign In' : 'Sign Up'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.googleButton} onPress={handleGoogle} disabled={formLoading}>
            {/* <Google size={20} color="#0C121E" style={{ marginRight: 8 }} /> */}
            <Text style={styles.googleButtonText}>Sign in with Google</Text>
          </TouchableOpacity>
          <View style={styles.switchModeRow}>
            <Text style={styles.switchModeText}>
              {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
            </Text>
            <TouchableOpacity onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
              <Text style={styles.switchModeLink}>{mode === 'signin' ? 'Sign Up' : 'Sign In'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  card: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'stretch',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0C121E',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
    marginTop: 8,
  },
  inputBox: {
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#0C121E',
  },
  error: {
    color: '#FF3B30',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#0C121E',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    paddingVertical: 12,
    justifyContent: 'center',
    marginBottom: 12,
  },
  googleButtonText: {
    color: '#0C121E',
    fontSize: 16,
    fontWeight: '600',
  },
  switchModeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  switchModeText: {
    color: '#666666',
    fontSize: 14,
  },
  switchModeLink: {
    color: '#0C121E',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
  },
}); 
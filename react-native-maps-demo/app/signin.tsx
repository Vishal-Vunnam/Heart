import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, Image, SafeAreaView } from 'react-native';
import { signIn, signUp } from '../firebase/auth';
import { router } from 'expo-router';
import { updateProfile } from 'firebase/auth';
import { Keyboard } from 'react-native'
import { addUser } from '../firebase/firestore';
import { ThemedView } from '@/components/ThemedView';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Fix: Add missing value and onChangeText for password and confirmPassword fields
  // Also, updateProfile must be called on the currentUser, not the returned user object from signUp
  // (Firebase v9+ returns userCredential.user, but our signUp returns user, which is correct)
  // But updateProfile expects the user object from getAuth().currentUser in React Native

  const handleAuth = async () => {
    try {
      if (isSignUp) {
        // until i can figure out textinputs to work
        // setUsername("Vishal")
        // setEmail("vunnamvishal@gmail.com")
        // setPassword("test123")
        console.log("Signing up with email: " + email + " and password: " + password);
        const user = await signUp(email, password, username);
        // In React Native, updateProfile must be called on the currentUser from getAuth()
        // See: https://firebase.google.com/docs/reference/js/auth.md#updateprofile
        // and https://github.com/firebase/firebase-js-sdk/issues/7587
        Alert.alert('Success', 'Account created! You can now sign in.');
        setIsSignUp(false);
        router.back();
      } else {
        await signIn(email, password);
        Alert.alert('Success', 'Signed in!');
        router.back();
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || String(error));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Image 
            source={require('../assets/images/polis_logo.png')} 
            style={styles.logo} 
          />
          <Text style={styles.appTitle}>Polis</Text>
        </View>

        {/* Form Container */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>{isSignUp ? 'Create Account' : 'Welcome Back'}</Text>
          <Text style={styles.subtitle}>
            {isSignUp ? 'Join the Polis community' : 'Sign in to your account'}
          </Text>

          {isSignUp && (
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#888"
              secureTextEntry={false}
              value={username}
              onChangeText={setUsername}
              onSubmitEditing={() => Keyboard.dismiss()}
            />
          )}
          
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#888"
            secureTextEntry={false}
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            autoComplete="password-new"
            autoCorrect={false}
            spellCheck={false}
            importantForAutofill="no"
          />

          <TouchableOpacity style={styles.authButton} onPress={handleAuth}>
            <Text style={styles.authButtonText}>
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setIsSignUp((prev) => !prev)}
          >
            <Text style={styles.toggleText}>
              {isSignUp
                ? 'Already have an account? Sign In'
                : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Your map-based social experience</Text>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  logo: {
    width: 42,
    height: 42,
    marginRight: 12,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E3A5F',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E3A5F',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#333',
  },
  authButton: {
    backgroundColor: '#3f68df',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 8,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  authButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  toggleButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  toggleText: {
    color: '#3f68df',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
});

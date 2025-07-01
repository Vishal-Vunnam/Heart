import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { signIn, signUp } from '../firebase/auth';
import { router } from 'expo-router';
import { updateProfile } from 'firebase/auth';
import { Keyboard } from 'react-native'


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
        setUsername("Vishal")
        setEmail("vunnamvishal@gmail.com")
        setPassword("test123")
        console.log("Signing up with email: " + email + " and password: " + password);
        const user = await signUp(email, password);
        // In React Native, updateProfile must be called on the currentUser from getAuth()
        // See: https://firebase.google.com/docs/reference/js/auth.md#updateprofile
        // and https://github.com/firebase/firebase-js-sdk/issues/7587
        if (user && username) {
          await updateProfile(user, { displayName: username });
        }
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
    <View style={styles.container}>
      <Text style={styles.title}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>
      {isSignUp && (
        <TextInput
          style={styles.input}
          textContentType="oneTimeCode"
          placeholder="Username"
          secureTextEntry = {false}
          value={username}
          onChangeText={setUsername}
          onSubmitEditing={()=> Keyboard.dismiss()}
        />
      )}
      <TextInput
        style={styles.input}
        placeholder="Email"
        secureTextEntry = {false}
        autoCapitalize="none"
        textContentType="oneTimeCode"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry = {false}
        textContentType={'oneTimeCode'} // 👈 critical change
        autoComplete="password-new"    // 👈 helps override strong password manager
        autoCorrect={false}
        spellCheck={false}
        importantForAutofill="no"
      />
      <Button title={isSignUp ? 'Sign Up' : 'Sign In'} onPress={handleAuth} />
      <Text
        style={styles.toggle}
        onPress={() => setIsSignUp((prev) => !prev)}
      >
        {isSignUp
          ? 'Already have an account? Sign In'
          : "Don't have an account? Sign Up"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 16 },
  toggle: { color: '#3f68df', marginTop: 16, textAlign: 'center' },
});

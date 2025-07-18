import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, Image, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { updateProfile } from 'firebase/auth';
import { Keyboard } from 'react-native'
import {signIn, signUp} from '@/auth/fireAuth';
import { ThemedView } from '@/components/ThemedView';
// import { uploadToAzureBlob } from '@/backend/blob-storage';
import * as ImagePicker from 'expo-image-picker';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  // Helper to pick an image from the library
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera roll permissions are required to select a profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleAuth = async () => {
    try {
      if (isSignUp) {
        // until i can figure out textinputs to work
        // setUsername("Vishal")
        // setEmail("vunnamvishal@gmail.com")
        // setPassword("test123")
        console.log("Signing up with email: " + email + " and password: " + password);

        // If a photo is selected, upload it to Azure Blob Storage and get the URL
        let photoURL = '';
        if (photoUri) {
          try {
            // Use filename based on email and timestamp for uniqueness
            const fileName = `profile_${email.replace(/[^a-zA-Z0-9]/g, '')}_${Date.now()}.jpg`;
            // Dynamically import to avoid circular deps if not needed
            // photoURL = await uploadToAzureBlob(photoUri, fileName, 'profile-pics');
          } catch (err) {
            console.error('Failed to upload profile picture:', err);
            Alert.alert('Error', 'Failed to upload profile picture. Please try again.');
            return;
          }
        }

        const user = await signUp(email, password, username, photoURL);

        Alert.alert('Success', 'Account created! You can now sign in.');
        setIsSignUp(false);
        setPhotoUri(null);
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
            <>
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#888"
                secureTextEntry={false}
                value={username}
                onChangeText={setUsername}
                onSubmitEditing={() => Keyboard.dismiss()}
              />
              <TouchableOpacity style={styles.photoPickerButton} onPress={pickImage}>
                <Text style={styles.photoPickerButtonText}>
                  {photoUri ? 'Change Profile Picture' : 'Add Profile Picture'}
                </Text>
              </TouchableOpacity>
              {photoUri && (
                <View style={{ alignItems: 'center', marginBottom: 16 }}>
                  <Image
                    source={{ uri: photoUri }}
                    style={styles.profilePreview}
                  />
                </View>
              )}
            </>
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
            onPress={() => {
              setIsSignUp((prev) => !prev);
              setPhotoUri(null);
            }}
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
  photoPickerButton: {
    backgroundColor: '#e0e7ff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  photoPickerButtonText: {
    color: '#3f68df',
    fontSize: 16,
    fontWeight: 'bold',
  },
  profilePreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginTop: 4,
    borderWidth: 2,
    borderColor: '#3f68df',
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

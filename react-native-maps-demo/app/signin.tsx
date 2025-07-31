import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { updateProfile } from 'firebase/auth';
import { createUser } from '@/services/api/user';
import { uploadImageForUser } from '@/services/api/image';
import { Keyboard } from 'react-native'
import {signIn, signUp, updateUserProfile} from '@/services/auth/fireAuth';
import { ThemedView } from '@/components/ThemedView';
// import { uploadToAzureBlob } from '@/backend/blob-storage';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageToPost } from '@/services/api/image';
import { getBase64 } from '@/functions/imageToBase64';

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



        const user = await signUp(email, password);


      if (user.success && user.user) {


          let base64PhotoUri = '';
        if (photoUri) {
          try {
            // Use filename based on email and timestamp for uniqueness
            base64PhotoUri = await getBase64(photoUri);
          } catch (err) {
            console.error('Failed to upload profile picture:', err);
            Alert.alert('Error', 'Failed to upload profile picture. Please try again.');
            return;
          }
        }
        let imageURL: { url: string } | null = null;

        if (base64PhotoUri !== '') {
          imageURL = await uploadImageForUser(base64PhotoUri, user.user.uid);
        }
          await updateUserProfile({
            displayName: username || user.user.displayName,
            photoURL: imageURL?.url || user.user.photoURL,
          });
          console.log("Image URL:", imageURL);
          await createUser({
            uid: user.user.uid,
            email: user.user.email ?? email,
            displayName: user.user.displayName ?? username,
            photoURL: imageURL?.url ??(undefined),
          });
        } else {
          throw new Error(user.error || "Failed to create user.");
        }
      // Wait a little for the `onAuthStateChanged` + reload to run
      setTimeout(() => {
        Alert.alert('Success', 'Account created! You can now sign in.');
        setIsSignUp(false);
        setPhotoUri(null);
        router.back(); // 🟢 After slight delay, user state will be correct
      }, 500);
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
      <Text style={styles.appTitle}>Polis</Text>
    </View>

    {/* Form Container with Scroll */}
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
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
                value={username}
                onChangeText={setUsername}
              />
              <TouchableOpacity style={styles.photoPickerButton} onPress={pickImage}>
                <Text style={styles.photoPickerButtonText}>
                  {photoUri ? 'Change Profile Picture' : 'Add Profile Picture'}
                </Text>
              </TouchableOpacity>
              {photoUri && (
                <View style={{ alignItems: 'center', marginBottom: 16 }}>
                  <Image source={{ uri: photoUri }} style={styles.profilePreview} />
                </View>
              )}
            </>
          )}

          {/* Email + Password Inputs */}
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
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
      </ScrollView>
    </KeyboardAvoidingView>

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
    borderBottomWidth: 3,
    borderBottomColor: 'black',
    paddingBottom: 20,
  },
  scrollContent: {
  flexGrow: 1,
  justifyContent: 'center',
  paddingBottom: 40,
},

  logo: {
    width: 42,
    height: 42,
    marginRight: 12,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: '#000000ff',
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000ff',
    fontFamily: 'Koulen_400Regular',
    letterSpacing: 0.5,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000000ff',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'Anton_400Regular',
    letterSpacing: 0.4,
    textDecorationLine: 'underline',
  },
  subtitle: {
    fontSize: 16,
    color: '#555555',
    marginBottom: 40,
    textAlign: 'center',
    fontFamily: 'Koulen_400Regular',
  },
  input: {
    backgroundColor: '#ffffffff',
    borderWidth: 2,
    borderColor: '#55555534',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#000000ff',
    fontFamily: 'Anton_400Regular',
    elevation: 2,
  },
  inputFocused: {
    borderColor: '#000000ff',
    borderWidth: 3,
  },
  photoPickerButton: {
    backgroundColor: '#ffffffff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#000000ff',
    borderStyle: 'dashed',
    elevation: 2,
  },
  photoPickerButtonText: {
    color: '#000000ff',
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'Anton_400Regular',
    letterSpacing: 0.4,
  },
  profilePreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginTop: 8,
    borderWidth: 3,
    borderColor: '#000000ff',
    alignSelf: 'center',
    elevation: 4,
  },
  authButton: {
    backgroundColor: '#000000ff',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 8,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  authButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Anton_400Regular',
    letterSpacing: 0.5,
    textDecorationLine: 'underline',
  },
  authButtonDisabled: {
    backgroundColor: '#55555534',
    elevation: 2,
  },
  authButtonDisabledText: {
    color: '#555555',
    textDecorationLine: 'none',
  },
  toggleButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#ffffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#55555534',
    marginVertical: 8,
  },
  toggleText: {
    color: '#000000ff',
    fontSize: 16,
    fontFamily: 'Anton_400Regular',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 40,
    borderTopWidth: 3,
    borderTopColor: '#55555534',
    paddingTop: 20,
  },
  footerText: {
    color: '#555555',
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Koulen_400Regular',
    lineHeight: 20,
  },
  errorText: {
    color: '#000000ff',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Anton_400Regular',
    fontWeight: '600',
    backgroundColor: '#ffffffff',
    borderWidth: 2,
    borderColor: '#000000ff',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  loadingSpinner: {
    marginRight: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formSection: {
    marginBottom: 32,
  },
  sectionDivider: {
    height: 2,
    backgroundColor: '#55555534',
    marginVertical: 24,
    marginHorizontal: 40,
  },
  inputLabel: {
    color: '#000000ff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: 'Anton_400Regular',
    letterSpacing: 0.4,
    textDecorationLine: 'underline',
    marginLeft: 4,
  },
  helpText: {
    color: '#555555',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 16,
    marginLeft: 4,
    fontStyle: 'italic',
    fontFamily: 'Koulen_400Regular',
  },
});
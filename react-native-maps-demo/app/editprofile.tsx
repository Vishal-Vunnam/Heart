import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  Image,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import { getCurrentUser, logout, updateUserProfile } from '@/services/auth/fireAuth';
import { updateUser } from '@/services/api/user';
import { getBase64 } from '@/functions/imageToBase64';
import { uploadImageForUser } from '@/services/api/image';
import { UserInfo } from '@/types/types';
import { getRandomColor } from '@/functions/getRandomColor';

export default function EditProfileScreen() {
  const user = getCurrentUser(); 
  const [username, setUsername] = useState(user && user.displayName ? user.displayName : '');
  const [email, setEmail] = useState(user && user.email ? user.email : '');
  const [profilePic, setProfilePic] = useState<string | null>(user && user.photoURL ? user.photoURL : null);
  const [isLoading, setIsLoading] = useState(false); 
  const handleImagePicker = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission required", "You need to allow access to your photos to update your profile picture.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setProfilePic(result.assets[0].uri);
      // You can now upload this URI in your backend logic
    }
  };

// Alternative version with loading state and better UX
const handleSave = async () => {
  console.log("Starting profile update...");
  
  // Add loading state (assuming you have setIsLoading)
  setIsLoading(true);
  
  try {
    // Early validation
    if (!user?.email || !user?.displayName) {
      Alert.alert('Error', 'You must be logged in to edit your profile.');
      return;
    }

    // Check if anything actually changed
    const hasDisplayNameChanged = username && username !== user.displayName;
    const hasEmailChanged = email && email !== user.email;
    const hasPhotoChanged = profilePic && profilePic !== '' && profilePic !== user.photoURL;

    if (!hasDisplayNameChanged && !hasEmailChanged && !hasPhotoChanged) {
      Alert.alert('Info', 'No changes detected.');
      router.back();
      return;
    }

    // Handle image upload if needed
    let newImageUrl = user.photoURL; // Default to current photo
    if (hasPhotoChanged) {
      console.log("Uploading new profile image...");
      try {
        const base64Image = await getBase64(profilePic);
        newImageUrl = await uploadImageForUser(base64Image, username);
        console.log("Image uploaded successfully:", newImageUrl);
      } catch (imageError) {
        console.error('Image upload failed:', imageError);
        Alert.alert('Warning', 'Image upload failed, but other changes will be saved.');
        newImageUrl = user.photoURL; // Keep original photo on upload failure
      }
    }

    // Prepare updated data
    const updatedData = {
      uid: user.uid,
      displayName: username || user.displayName,
      email: email || user.email,
      photoURL: newImageUrl.publicUrl,
    };

    // Update Firebase Auth profile (only displayName and photoURL)
    if (hasDisplayNameChanged || hasPhotoChanged) {
      console.log("Updating Firebase Auth profile...");
      const authUpdateResult = await updateUserProfile({
        email: updatedData.email,
        displayName: updatedData.displayName,
        photoURL: updatedData.photoURL,
      });

      if (!authUpdateResult.success) {
        console.error('Firebase Auth update failed:', authUpdateResult.error);
        throw new Error(authUpdateResult.error || 'Failed to update Firebase profile.');
      }
      console.log("Firebase Auth updated successfully");
    }

    // Update your backend
    console.log("Updating backend user data...");
    await updateUser(updatedData);
    console.log("Backend updated successfully");

    // Update local state only after all successful updates
    setUsername(updatedData.displayName);
    setEmail(updatedData.email);
    setProfilePic(updatedData.photoURL);

    Alert.alert('Success', 'Profile updated successfully!');
    router.back();

  } catch (error) {
    console.error('Error updating profile:', error);
    
    // Enhanced error handling
    let errorMessage = 'Failed to update profile. Please try again later.';
    
    // if (error?.code === 'auth/requires-recent-login') {
    //   errorMessage = 'Please log out and log back in before making changes.';
    // } else if (error?.message) {
    //   errorMessage = error.message;
    // } else if (typeof error === 'string') {
    //   errorMessage = error;
    // }
    
    Alert.alert('Error', errorMessage);
  } finally {
    setIsLoading(false);
  }
};

  const handleBack = () => {
    router.back();
  };

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      router.back();
    } else {
      Alert.alert('Logout Failed', result.error || 'An error occurred during logout.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.appTitle}>Polis</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        {/* Scrollable Content */}
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            {profilePic && (
              <TouchableOpacity onPress={handleImagePicker} style={{ alignItems: 'center', marginBottom: 18 }}>
                <Image
                  source={{ uri: profilePic }}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    borderWidth: 2,
                    borderColor: '#fff',
                    backgroundColor: '#222',
                  }}
                />
                <Text style={{ marginTop: 8, color: '#3f68df', fontWeight: '600' }}>Change Profile Picture</Text>
              </TouchableOpacity>
            )}

            {!profilePic && (
              <TouchableOpacity onPress={handleImagePicker} style={{ alignItems: 'center', marginBottom: 18 }}>
                <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 32, color: '#666' }}>+</Text>
                </View>
                <Text style={{ marginTop: 8, color: '#3f68df', fontWeight: '600' }}>Add Profile Picture</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.title}>Edit Profile</Text>
            <Text style={styles.subtitle}>Update your account information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder={username}
                placeholderTextColor="#888"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
              style={styles.input}
              placeholder={email}
              placeholderTextColor="#888"
              value={email}
              editable={false}
              selectTextOnFocus={false}
              autoCapitalize="none"
              keyboardType="email-address"
              />
            </View>


            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Log Out</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Your profile information is secure</Text>
          </View>
        </ScrollView>
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
    justifyContent: 'space-between',
    paddingVertical: 20,
    borderBottomWidth: 3,
    borderBottomColor: '#000000ff',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    backgroundColor: '#000000ff',
    borderRadius: 12,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'Anton_400Regular',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: 8,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#000000ff',
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000ff',
    fontFamily: 'Koulen_400Regular',
    letterSpacing: 0.3,
  },
  placeholder: {
    width: 40,
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
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000ff',
    marginBottom: 8,
    fontFamily: 'Anton_400Regular',
    letterSpacing: 0.4,
    textDecorationLine: 'underline',
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#ffffffff',
    borderWidth: 2,
    borderColor: '#55555534',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#000000ff',
    fontFamily: 'Anton_400Regular',
    elevation: 2,
  },
  inputFocused: {
    borderColor: '#000000ff',
    borderWidth: 3,
  },
  bioInput: {
    height: 100,
    paddingTop: 16,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: getRandomColor(),
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Anton_400Regular',
    letterSpacing: 0.5,
    textDecorationLine: 'underline',
  },
  saveButtonDisabled: {
    backgroundColor: '#55555534',
    elevation: 2,
  },
  saveButtonDisabledText: {
    color: '#555555',
    textDecorationLine: 'none',
  },
  logoutButton: {
    backgroundColor: '#ffffffff',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginTop: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#55555534',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  logoutButtonText: {
    color: '#000000ff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Anton_400Regular',
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
  profileImageSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#55555534',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#000000ff',
    marginBottom: 16,
    elevation: 4,
  },
  changePhotoButton: {
    backgroundColor: '#ffffffff',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#000000ff',
    borderStyle: 'dashed',
  },
  changePhotoButtonText: {
    color: '#000000ff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Anton_400Regular',
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
  successText: {
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
  sectionDivider: {
    height: 2,
    backgroundColor: '#55555534',
    marginVertical: 24,
    marginHorizontal: 20,
  },
  helpText: {
    color: '#555555',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontStyle: 'italic',
    fontFamily: 'Koulen_400Regular',
  },
  dangerZone: {
    marginTop: 40,
    paddingTop: 24,
    borderTopWidth: 3,
    borderTopColor: '#000000ff',
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000000ff',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Anton_400Regular',
    letterSpacing: 0.4,
    textDecorationLine: 'underline',
  },
});
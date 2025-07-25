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

export default function EditProfileScreen() {
  const user = getCurrentUser(); 
  const [username, setUsername] = useState(user && user.displayName ? user.displayName : '');
  const [email, setEmail] = useState(user && user.email ? user.email : '');
  const [profilePic, setProfilePic] = useState<string | null>(user && user.photoURL ? user.photoURL : null);

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

  const handleSave = async () => {
    console.log("am i here");
    let newImageURl = '';
    if(profilePic !== null && profilePic !== '') {
      const base64Image : string = await getBase64(profilePic); 
      newImageURl = await uploadImageForUser(base64Image, username);
    }
    try {
      if (!user || !user.email || !user.displayName) {
        Alert.alert('Error', 'You must be logged in to edit your profile.');
        return;
      }
      console.log(user.uid);
      const updatedData : UserInfo= {
        uid: user.uid, 
        displayName: username || user.displayName,
        email: email || user.email,
        photoURL: newImageURl !== '' && newImageURl ? newImageURl : user.photoURL,
      };
      // Update Firestore
      await updateUserProfile({
        displayName: updatedData.displayName,
        photoURL: updatedData.photoURL,
      });

      await updateUser(updatedData);

      // Update local state
      setUsername(updatedData.displayName);
      setEmail(updatedData.email);
      setProfilePic(updatedData.photoURL);

      Alert.alert('Success', 'Profile updated successfully!');
      router.back(); 
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again later.');
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
            <Image source={require('../assets/images/polis_logo.png')} style={styles.logo} />
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
    borderBottomWidth: 1,
    borderBottomColor: '#1E3A5F',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#1E3A5F',
    fontWeight: 'bold',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3A5F',
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
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A5F',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
  },
  bioInput: {
    height: 100,
    paddingTop: 16,
  },
  saveButton: {
    backgroundColor: '#3f68df',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginTop: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3f68df',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  logoutButtonText: {
    color: '#3f68df',
    fontSize: 16,
    fontWeight: 'bold',
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

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, Image } from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import { getCurrentUser } from '@/auth/fireAuth';
export default function EditProfileScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [profilePic, setProfilePic] = useState<string | null>(null);

  // React.useEffect(() => {
  //   async function loadUserInfo() {
  //     try {
  //       const user = useCurrentUser();
  //       if (user && typeof user === 'object' && 'uid' in user) {
  //         const firebaseUser = user as FirebaseUser;
  //         setEmail(firebaseUser.email || '');
  //         setUsername(firebaseUser.displayName || '');
  //         setProfilePic(firebaseUser.photoURL || null);
  //         // Fetch Firestore user doc for bio
  //         const db = getFirestore(app);
  //         const usersRef = collection(db, 'users');
  //         const q = query(usersRef, where('uid', '==', firebaseUser.uid));
  //         const querySnapshot = await getDocs(q);
  //         if (!querySnapshot.empty) {
  //           const data = querySnapshot.docs[0].data();
  //           setUsername(data.displayName || '');
  //           setEmail(data.email || '');
  //           setBio(data.bio || '');
  //           setProfilePic(data.photoURL || firebaseUser.photoURL || null);
  //         }
  //       }
  //     } catch (err) {
  //       // Optionally handle error
  //     }
  //   }
  //   loadUserInfo();
  // }, []);

  const handleSave = () => {
    // Placeholder for save logic
    Alert.alert('Profile Updated', `Username: ${username}\nEmail: ${email}\nBio: ${bio}`);
  };

  const handleBack = () => {
    router.back();
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
            <Image 
              source={require('../assets/images/polis_logo.png')} 
              style={styles.logo} 
            />
            <Text style={styles.appTitle}>Polis</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        {/* Form Container */}
        <View style={styles.formContainer}>
          {profilePic && (
            <View style={{ alignItems: 'center', marginBottom: 18 }}>
              <Image
                source={{ uri: profilePic }}
                style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: '#fff', backgroundColor: '#222' }}
              />
            </View>
          )}
          <Text style={styles.title}>Edit Profile</Text>
          <Text style={styles.subtitle}>Update your account information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your username"
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
              placeholder="Enter your email"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Bio</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              placeholder="Tell us about yourself..."
              placeholderTextColor="#888"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Your profile information is secure</Text>
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

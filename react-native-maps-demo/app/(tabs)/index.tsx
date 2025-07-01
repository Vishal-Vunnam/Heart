import React, { useState, useRef, useEffect } from 'react';
import { SafeAreaView, View, TextInput, StyleSheet, TouchableOpacity, Text, Pressable, Linking } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';
import Entypo from '@expo/vector-icons/Entypo';
import { initializeApp } from 'firebase/app';
import MapView, { Marker } from 'react-native-maps';
import { addPost } from '@/firebase/firestore';
import { router,  useRouter } from 'expo-router';


import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { app } from '@/firebase/firebaseConfig'; // adjust path as needed





export default function HomeScreen() {
  const firebaseConfig = {
    apiKey: 'api-key',
    authDomain: 'project-id.firebaseapp.com',
    databaseURL: 'https://project-id.firebaseio.com',
    projectId: 'project-id',
    storageBucket: 'project-id.appspot.com',
    messagingSenderId: 'sender-id',
    appId: 'app-id',
    measurementId: 'G-measurement-id',
  };

  const [user, setUser] = useState<{
    displayName: string;
    email: string;
    uid: string;
  } | null>(null);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          displayName: firebaseUser.displayName ?? "",
          email: firebaseUser.email ?? "",
          uid: firebaseUser.uid,
        });
      } else {
        setUser(null);
      }
    });
    return unsubscribe; // Clean up the listener on unmount
  }, []);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const textInputRef = useRef<TextInput>(null);

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
    textInputRef.current?.blur(); 
  };

  // Sample Post Data
  const locationTitle = "Pin Title";
  const geographicalLocation = "37°25'19.07\"N, 122°05'06.24\"W";
  const locationLink = "https://www.google.com/maps?q=37.4219999,-122.0840575"; // Example link for Google Maps
  const datePosted = "January 9, 2025";
  const author = "John Doe";

  const postLocation = {
    latitude: 0,
    latitudeDelta: 0,
    longitude: 0,
    longitudeDelta: 0,
  }

  const postInfo = {
      title: "Post Title",
      postId: "Post ID",
      location: postLocation,
      authorId: "Post Author ID",
      images: ["Image 1", "Image 2", "Image 3"],
      date: "Post Date",
      description: "Post Description",
      author: "Post Author",
      likes: 0,
      comments: 0,
      views: 0,
      tags: ["Tag 1", "Tag 2", "Tag 3"],
  }
  // Handle the like button action
  const handleLike = () => {
    console.log("Liked!");
  };

  const getCurrentLocation = () => {
    console.log("Getting current location!");
    console.log(currentLocation);
  };

  // Navigates to the SignInScreen using expo-router
  const handleSignIn = () => {
    // If using expo-router, you should push the route as a string path
    // e.g., '/screens/SignInScreen' or the correct route for your app
    router.push('/signin');
  };

  const handlePost = () => {
    const newPostInfo = postInfo;
    newPostInfo.location = currentLocation;
    newPostInfo.postId = "Post ID";
    addPost(newPostInfo);
    console.log("Post added!");
  };

  // Handle the comment button action
  const handleComment = () => {
    console.log("Commented!");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        {/* Navigation Bar */}
        <ThemedView style={styles.navBar}>
          <TouchableOpacity style={styles.navButton} onPress={toggleModal}>
            <Text style={styles.navButtonText}>Polis</Text>
          </TouchableOpacity>
          {user!=null && <TouchableOpacity style={styles.navButton}>
            <Text style={styles.navButtonText}>{user.email}</Text>
            <MaterialIcons name="account-circle" size={24} color="#fff" style={styles.accountIcon} />
          </TouchableOpacity>
          }
          {user==null && <TouchableOpacity style={styles.navButton} onPress={handleSignIn}>
                      <Text style={styles.navButtonText}>Sign In</Text>
                      <MaterialIcons name="account-circle" size={24} color="#fff" style={styles.accountIcon} />
                    </TouchableOpacity>
          }
        </ThemedView>

        {/* Map Placeholder replaced with MapView */}
        <ThemedView style={styles.mapPlaceholder}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: 37.4219999,
              longitude: -122.0840575,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            onRegionChangeComplete={(region) => setCurrentLocation(region)}
          >
            {/* You can still have Markers here if you want */}
          </MapView>

          {/* Center dot overlay */}
          <View pointerEvents="none" style={styles.centerDot} />

          <TouchableOpacity onPress={toggleModal} style={styles.pinButton}>
            <Entypo name="location-pin" size={24} color="black" />
          </TouchableOpacity>
        </ThemedView>

        {/* Search Box */}
        <ThemedView style={styles.searchBoxContainer} >
          <View style={styles.searchBoxWrapper} >
            <EvilIcons name="search" size={24} color="#888" style={styles.icon} />
            <TextInput
              ref={textInputRef}
              style={styles.searchBox}
              placeholder="Search, #tag, location"
              placeholderTextColor="#888"
              onFocus={() => setIsModalVisible(false)}
            />
            
          </View>
        </ThemedView>

        <View style={{ position: 'absolute', top: 200, right: 20, zIndex: 100 }}>
          <TouchableOpacity style={styles.postButton} onPress={handlePost}>
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>
        </View>

        {/* Popup Modal */}
        {isModalVisible && (
      <View style={styles.modalOverlay} pointerEvents="box-none">
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{locationTitle}</Text>
          <Text style={styles.modalMessage}>Location: 
            <Text 
              style={styles.link} 
              onPress={() => Linking.openURL(locationLink)}
            >
              {` ${geographicalLocation}`}
            </Text>
          </Text>
          <Text style={styles.modalMessage}>Date Posted: {datePosted}</Text>
          <Text style={styles.modalMessage}>Author: {author}</Text>
{/*           
          <View >
            <TouchableOpacity style={styles.likeButton} onPress={handleLike}>
              <Text style={styles.buttonText}>Like</Text>
            </TouchableOpacity>
            <TouchableOpacity  onPress={handleComment}>
              <Text style={styles.buttonText}>Comment</Text>
            </TouchableOpacity>
            <Text style={styles.picHeader}>Pictures{"\n"}{"\n"}{"\n"}{"\n"}kj{"\n"}{"\n"}kj</Text>
          </View> */}
          
          <TouchableOpacity style={styles.closeButton} onPress={toggleModal}>
            <Feather name="x" size={20} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.triangle} />
      </View>
    )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  postButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  postButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'black'
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  navButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 4,
  },
  accountIcon: {
    color: '#ffffff',
  },
  searchBoxContainer: {
    position: 'absolute',
    top: 80,
    left: '5%',
    right: '5%',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  searchBoxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 30,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    backgroundColor: 'white',
  },
  icon: {
    marginRight: 8,
  },
  searchBox: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderWidth: 1,
    borderColor: '#ccc',
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  pinButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  modalOverlay: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 80,
    backgroundColor: 'transparent', // Transparent so background is usable
  },
  modalContent: {
    width: '90%',
    height: 273,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    overflow: 'scroll'
  },
  modalTitle: {
    fontSize: 24,
    color: 'black',
    fontWeight: 'bold',
    marginTop: 10,
    marginLeft: 10,
  },  
  link: {
    fontSize: 14,
    color: 'blue',
    textDecorationLine: 'underline',
  },
  triangle: {
    top: -1,
    width: 0,
    height: 0,
    borderLeftWidth: 30, // Adjust width for triangle size
    borderRightWidth: 30, // Adjust width for triangle size
    borderBottomWidth: 15, // Adjust height for triangle size
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'white', // Triangle color
    borderRadius: 10, // Rounds the edges
    transform: [{ rotate: '180deg' }], // Points the triangle downward
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -30 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  
  modalMessage: {
    fontSize: 16,
    color: 'black',
    marginLeft: 10,
  },
  closeButton: {
    position: 'absolute',
    right: -10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  likeButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  commentButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  picHeader: {
    textDecorationLine: 'underline',
    fontSize: 14,
    color: 'black',
    marginTop: 10,
    marginLeft: 10,
  },
  centerDot: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 16,
    height: 16,
    marginLeft: -8, // half of width
    marginTop: -8,  // half of height
    borderRadius: 8,
    backgroundColor: 'transparent', // or any color you like
    borderWidth: 2,
    borderColor: 'black',
    zIndex: 10,
  },
});

// React & React Native core
import React, { useState, useRef, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  Pressable,
  Linking,
  Modal,
  Animated,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';

// Gesture Handler
import { PanGestureHandler, State } from 'react-native-gesture-handler';

// Navigation
import { router, useRouter } from 'expo-router';

// Firebase
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { app } from '@/firebase/firebaseConfig';

// Map & Map Clustering
import MapView from 'react-native-map-clustering';
import { Callout, MapMarker, Marker } from 'react-native-maps';

// Icons
import EvilIcons from '@expo/vector-icons/EvilIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';
import Entypo from '@expo/vector-icons/Entypo';

// Components
import { ThemedView } from '@/components/ThemedView';
import PostModal from '@/components/PostModal';
import DiscoverModal from '@/components/DiscoverModal';

// Firebase Firestore & Storage
import { addPost, getAllPosts, getPostbyAuthorID, getImagesbyUrl } from '@/firebase/firestore';
import { getImageFromBlobUrl, getImageUrlWithSAS } from '@/firebase/blob-storage';

// Types
import { GET_POST_TEMPLATE, Location, PostData, PolisType, PostRequestInfo, UserInfo } from '@/types';

// Styles
import { indexStyles as styles } from '../styles/indexstyles';
// Constants
const FIREBASE_CONFIG = {
  apiKey: 'api-key',
  authDomain: 'project-id.firebaseapp.com',
  databaseURL: 'https://project-id.firebaseio.com',
  projectId: 'project-id',
  storageBucket: 'project-id.appspot.com',
  messagingSenderId: 'sender-id',
  appId: 'app-id',
  measurementId: 'G-measurement-id',
};

const SAMPLE_POST_DATA = {
  locationTitle: "Pin Title",
  geographicalLocation: "37°25'19.07\"N, 122°05'06.24\"W",
  locationLink: "https://www.google.com/maps?q=37.4219999,-122.0840575",
  datePosted: "January 9, 2025",
  author: "John Doe",
};

const INITIAL_MAP_REGION = {
  latitude: 37.4219999,
  longitude: -122.0840575,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

// Posts loaded: [{"author": "Test", "authorId": "test", "comments": 0, "date": "2025-07-04T00:45:48.862Z", "description": "This is a test", "likes": 0, "location": {"latitude": 37.4219999, "latitudeDelta": 0.01, "longitude": -122.0840575, "longitudeDelta": 0.01}, "postId": "post_1751589948869_qz19bdexu"}]

function debugLog(...args: any[]) {
  if (__DEV__) {
    console.log('[DEBUG]', ...args);
  }
}

function ImageLoader({ imageUrl }: { imageUrl: string }) {
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getImageFromBlobUrl(imageUrl)
      .then(blob => {
        const objectUrl = URL.createObjectURL(blob);
        if (isMounted) {
          setLocalUri(objectUrl);
          setLoading(false);
        }
        // Clean up the object URL when the component unmounts
        return () => URL.revokeObjectURL(objectUrl);
      })
      .catch(() => setLoading(false));
    return () => { isMounted = false; };
  }, [imageUrl]);

  if (loading) {
    return <ActivityIndicator size="small" />;
  }

  if (!localUri) {
    return <View style={{ width: 100, height: 100, backgroundColor: '#eee' }} />;
  }

  return (
    <Image
      source={{ uri: localUri }}
      style={{ width: 100, height: 100, marginVertical: 4, borderRadius: 8 }}
      resizeMode="cover"
    />
  );
}

function renderPostImages(images?: string[]) {
  if (!images || images.length === 0) return null;
  return images.map((imageUrl, idx) => (
    <TouchableOpacity
      key={idx}
      onPress={() => {
        // Show image full screen
        Alert.alert(
          'Image',
          'View full screen?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'View', 
              onPress: () => {
                // You can implement a modal or navigation to show full screen image
                // For now, we'll just show an alert with the image URL
                console.log('Full screen image URL:', getImageUrlWithSAS(imageUrl));
              }
            }
          ]
        );
      }}
    >
      <Image
        source={{ uri: getImageUrlWithSAS(imageUrl) }}
        style={{ width: 100, height: 100, marginVertical: 4, borderRadius: 8 }}
        resizeMode="cover"
      />
    </TouchableOpacity>
  ));
}
export default function HomeScreen() {
  // 1. State variables
  const [user, setUser] = useState<{
    displayName: string;
    email: string;
    uid: string;
  } | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPostModalVisible, setIsPostModalVisible] = useState(false);
  const [isDiscoverModalVisible, setIsDiscoverModalVisible] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [posts, setPosts] = useState<GET_POST_TEMPLATE[]>([]);
  const [selectedPolis, setSelectedPolis] = useState<PolisType | null>(null);
  const [currentRegion, setCurrentRegion] = useState(INITIAL_MAP_REGION);
  const markerRefs = useRef<{ [key: string]: MapMarker | null }>({});
  const mapRef = useRef<MapView>(null);
  const textInputRef = useRef<TextInput>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // 2. Effects
  useEffect(() => {
    const auth = getAuth(app);
    // loadPosts();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          displayName: firebaseUser.displayName ?? "",
          email: firebaseUser.email ?? "",
          uid: firebaseUser.uid,
        });
        setSelectedPolis({
          isUser: true,
          userInfo: {
            displayName: firebaseUser.displayName ?? "",
            email: firebaseUser.email ?? "",
            uid: firebaseUser.uid,
          }
        });
      }
      else{
        setUser(null);
      }
    });
    return unsubscribe;
  }, []);


  useEffect(() => {
    if (selectedPolis) {
      if (selectedPolis.isUser) {
        getPostbyAuthorID(selectedPolis.userInfo.uid).then((userPosts) => {
          setPosts(userPosts);

        });
      } else {
        // Tags coming soon 
      }
    }
  }, [selectedPolis]);

  // 3. Event Handlers
  const handleMarkerPress = (post: GET_POST_TEMPLATE) => {
    // Animate to marker
    if (mapRef.current && 'animateCamera' in mapRef.current) {
      // @ts-ignore
      mapRef.current.animateCamera(
        {
          center: {
            latitude: post.location.latitude,
            longitude: post.location.longitude,
          },
          zoom: 16,
        },
        { duration: 500 }
      );
    }

    setTimeout(() => {
      markerRefs.current[post.postId]?.showCallout();
    }, 600); // slightly longer than animation duration
  };

  // Data loading functions
  // const loadPosts = async () => {
  //   try {
  //     const posts = await getAllPosts();
  //     console.log('Posts loaded:', posts);
  //     setPosts(posts);
  //   } catch (error) {
  //     console.error('Error loading posts:', error);
  //   }
  // };

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
    textInputRef.current?.blur();
  };

  const getCurrentLocation = () => {
    console.log("Getting current location!");
    console.log(currentLocation);
  };

  const handleSignIn = () => {
    router.push('/signin');
  };

  const displayAccountInfo = () => {
    if (user) {
      setSelectedPolis({
        isUser: true,
        userInfo: user
      });
      openDiscoverModal();
    }
  };

  // Discover Modal functions
  const openDiscoverModal = () => {
    setIsDiscoverModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeDiscoverModal = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsDiscoverModalVisible(false);
    });
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: slideAnim } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationY } = event.nativeEvent;
      
      if (translationY > 100) {
        // Swipe down - close modal
        closeDiscoverModal();
      } else {
        // Swipe up or small movement - snap back
        Animated.spring(slideAnim, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  const handlePost = () => {
    if (!user) {
      router.push('/signin');
      return;

    }

    if (!currentLocation) {
      console.log("No current location available");
      return;
    }
    setIsPostModalVisible(true);
  };
  const handlePostSubmit = (postData: PostRequestInfo) => {
    if (!user) {
      console.log("No user signed in, cannot submit post.");
      return;
    }
    const newPostInfo = {
      title: postData.title,
      description: postData.description,
      location: postData.location,
      authorId: postData.authorId,
      author: postData.author,
      images: postData.images,
      // Add any other required fields here
    };
    console.log("Attempting to add post with data:", newPostInfo);
    console.log("Current user:", user);
    addPost(newPostInfo);
    console.log("Post added!", postData);
  };

  const handleComment = () => {
    console.log("Commented!");
  };

  // Map zoom functions
  const zoomIn = () => {
    if (mapRef.current && currentLocation) {
      (mapRef.current as any).animateToRegion({
        ...currentLocation,
        latitudeDelta: currentLocation.latitudeDelta * 0.5,
        longitudeDelta: currentLocation.longitudeDelta * 0.5,
      }, 1000);
    }
  };

  const zoomOut = () => {
    if (mapRef.current && currentLocation) {
      (mapRef.current as any).animateToRegion({
        ...currentLocation,
        latitudeDelta: currentLocation.latitudeDelta * 2,
        longitudeDelta: currentLocation.longitudeDelta * 2,
      }, 1000);
    }
  };


  // 4. Utility/Render Helpers
  // const debugLog = (...args: any[]) => { ... };
  // const renderPostImages = (images?: string[]) => { ... };

  // 5. Main JSX
  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        {/* Navigation Bar */}
        <ThemedView style={styles.navBar}>
          <TouchableOpacity style={styles.navButton} onPress={toggleModal}>
            <Image source={require('../../assets/images/polis_logo.png')} style={{ width: 42, height: 42, marginRight: 6 }} />
            <Text style={styles.navButtonText}>Polis</Text>
          </TouchableOpacity>
          {user != null && (
            <TouchableOpacity style={styles.navButton} onPress={displayAccountInfo}>
              <Text style={styles.signInText}>{user.displayName || user.email}</Text>
              <MaterialIcons name="account-circle" size={24} color="#fff" style={styles.accountIcon} />
            </TouchableOpacity>
          )}
          {user == null && (
            <TouchableOpacity style={styles.navButton}   onPress={handleSignIn}>
              <Text style={styles.signInText}>Sign In</Text>
              <MaterialIcons name="account-circle" size={24} color="#fff" style={styles.accountIcon} />
            </TouchableOpacity>
          )}
        </ThemedView>

        {/* Map */}
        <ThemedView style={styles.mapPlaceholder}>
          <MapView
            ref={mapRef}
            style={styles.map}
            clusterColor="grey"
            initialRegion={INITIAL_MAP_REGION}
            onRegionChangeComplete={(region) => setCurrentLocation(region)}
          >
            {posts.map((post, index) => (
              <Marker
                ref={ref => { markerRefs.current[post.postId] = ref; }}
                pinColor="black"
                calloutAnchor={{ x: 0.5, y: 0.5 }}
                key={index}
                coordinate={{
                  latitude: post.location.latitude,
                  longitude: post.location.longitude,
                }}
                // title={post.title || 'Post'}
                // description={post.author + '\n' + post.description || 'No description'}
                onPress={(e) => {
                  e.stopPropagation();
                  handleMarkerPress(post);
                }
                }
              >
                <Callout tooltip>
                  <View style={styles.calloutContainer}>
                    <Text style={styles.calloutTitle}>{post.title + ' - ' + post.author}</Text>
                    <Text style={styles.calloutDescription}>{post.description}</Text>
                    {renderPostImages(post.images)}
                  </View>
                </Callout>
              </Marker>
            ))}
          </MapView>

          {/* Center dot overlay */}
          <View pointerEvents="none" style={styles.centerDot} />

        </ThemedView>

        {/* Action Buttons */}
        <View style={styles.actionButtonContainer}>
          <TouchableOpacity style={styles.iconButton} onPress={handlePost}>
            <Image source={require('../../assets/images/plus.png')} style={styles.iconImage} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={openDiscoverModal}>
            <Image source={require('../../assets/images/binoculars.png')} style={styles.iconImage} />
          </TouchableOpacity>
        </View>

        {/* Location Info Modal */}
        {isModalVisible && (
          <View style={styles.modalOverlay} pointerEvents="box-none">
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{SAMPLE_POST_DATA.locationTitle}</Text>
              <Text style={styles.modalMessage}>
                Location:
                <Text style={styles.link} onPress={() => Linking.openURL(SAMPLE_POST_DATA.locationLink)}>
                  {` ${SAMPLE_POST_DATA.geographicalLocation}`}
                </Text>
              </Text>
              <Text style={styles.modalMessage}>Date Posted: {SAMPLE_POST_DATA.datePosted}</Text>
              <Text style={styles.modalMessage}>Author: {SAMPLE_POST_DATA.author}</Text>
              <TouchableOpacity style={styles.closeButton} onPress={toggleModal}>
                <Feather name="x" size={20} color="white" />
              </TouchableOpacity>
            </View>
            <View style={styles.triangle} />
          </View>
        )}

        {/* Post Modal */}
        <PostModal
          userId={user?.uid || "anonymous"}
          userName={user?.displayName || user?.email || "Anonymous"}
          visible={isPostModalVisible}
          onClose={() => setIsPostModalVisible(false)}
          currentLocation={currentLocation}
          onPost={handlePostSubmit}
        />

        {/* Discover Modal */}
        {isDiscoverModalVisible && (
          <View style={styles.discoverModalOverlay}>
            <PanGestureHandler
              onGestureEvent={onGestureEvent}
              onHandlerStateChange={onHandlerStateChange}
            >
              <Animated.View style={[styles.discoverModalContent, { transform: [{ translateY: slideAnim }] }]}>
                <View style={styles.dragHandle} />
                <DiscoverModal
                  onPostSelect={(post) => {
                    handleMarkerPress(post);
                    setIsDiscoverModalVisible(false);
                  }}
                  onPolisSelect={(polis: PolisType) => {
                    console.log("pospospos");
                    setSelectedPolis(polis);
                    setIsDiscoverModalVisible(false);
                  }}
                  setPolis={selectedPolis != null ? selectedPolis : null}
                />
              </Animated.View>
            </PanGestureHandler>
          </View>
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

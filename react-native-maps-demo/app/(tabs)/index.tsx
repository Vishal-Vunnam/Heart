import React, { useState, useRef, useEffect } from 'react';
import { SafeAreaView, View, TextInput, StyleSheet, TouchableOpacity, Text, Pressable, Linking, Modal, Animated, Image, ActivityIndicator, Alert } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { ThemedView } from '@/components/ThemedView';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';
import Entypo from '@expo/vector-icons/Entypo';
import { initializeApp } from 'firebase/app';
import MapView, { Callout, MapMarker, Marker } from 'react-native-maps';
import { addPost, getAllPosts, getPostbyAuthorID, getImagesbyUrl } from '@/firebase/firestore';
import { router, useRouter } from 'expo-router';
import PostModal from '@/components/PostModal';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { app } from '@/firebase/firebaseConfig';
import DiscoverModal from '@/components/DiscoverModal';
import { GET_POST_TEMPLATE, Location, PostData, PolisType, PostRequestInfo, UserInfo } from '@/types';
import { getImageFromBlobUrl, getImageUrlWithSAS } from '@/firebase/blob-storage';
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

// const POST_MARKER_TEMPLATE = {
//   location: POST_LOCATION_TEMPLATE,
//   postId: "Post ID",
//   title: "Post Title",
//   description: "Post Description",
//   author: "Post Author",
//   date: "Post Date",
//   likes: 0,
//   comments: 0,

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
  // State
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
  const markerRefs = useRef<{ [key: string]: MapMarker | null }>({});
  
  // Discover Modal Animation
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  // Refs 
  const textInputRef = useRef<TextInput>(null);
  const mapRef = useRef<MapView>(null);

  // Effects
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

  const handleMarkerPress = (post: GET_POST_TEMPLATE) => {
    // Animate to marker
    mapRef.current?.animateToRegion(
      {
        latitude: post.location.latitude,
        longitude: post.location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      500 // duration in ms
    );

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



  // Event handlers
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
      // router.push('/signin');
      // return;
      setUser({
        displayName: "Test",
        email: "Test@example.com",
        uid: "test",
      }); 
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
    mapRef.current?.animateToRegion({
      ...currentLocation,
      latitudeDelta: currentLocation.latitudeDelta * 0.5,
      longitudeDelta: currentLocation.longitudeDelta * 0.5,
    }, 1000);
  };

  const zoomOut = () => {
    mapRef.current?.animateToRegion({
      ...currentLocation,
      latitudeDelta: currentLocation.latitudeDelta * 2,
      longitudeDelta: currentLocation.longitudeDelta * 2,
    }, 1000);
  };

  // Render
  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        {/* Navigation Bar */}
        <ThemedView style={styles.navBar}>
          <TouchableOpacity style={styles.navButton} onPress={toggleModal}>
            <Text style={styles.navButtonText}>Polis</Text>
          </TouchableOpacity>
          {user != null && (
            <TouchableOpacity style={styles.navButton} onPress={displayAccountInfo}>
              <Text style={styles.navButtonText}>{user.displayName || user.email}</Text>
              <MaterialIcons name="account-circle" size={24} color="#fff" style={styles.accountIcon} />
            </TouchableOpacity>
          )}
          {user == null && (
            <TouchableOpacity style={styles.navButton}   onPress={handleSignIn}>
              <Text style={styles.navButtonText}>Sign In</Text>
              <MaterialIcons name="account-circle" size={24} color="#fff" style={styles.accountIcon} />
            </TouchableOpacity>
          )}
        </ThemedView>

        {/* Map */}
        <ThemedView style={styles.mapPlaceholder}>
          <MapView
            ref={mapRef}
            style={styles.map}
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

          {/* Zoom Controls
          <View style={styles.zoomContainer}>
            <TouchableOpacity style={styles.zoomButton} onPress={zoomIn}>
              <Text style={styles.zoomButtonText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.zoomButton} onPress={zoomOut}>
              <Text style={styles.zoomButtonText}>-</Text>
            </TouchableOpacity>
          </View> */}

        </ThemedView>

        {/* Action Buttons */}
        <View style={styles.actionButtonContainer}>
          <TouchableOpacity style={styles.iconButton} onPress={handlePost}>
            <Image source={require('../../assets/images/plus.png')} style={styles.iconImage} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={openDiscoverModal}>
            <Image source={require('../../assets/images/glasses.png')} style={styles.iconImage} />
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
                  onPolisSelect={(polis:PolisType) => {
                    console.log("pospospos");
                    setSelectedPolis(polis);
                    setIsDiscoverModalVisible(false);
                  }
                  }
                />
              </Animated.View>
            </PanGestureHandler>
          </View>
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

// Styles
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
  iconImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    backgroundColor: 'transparent',
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
    borderLeftWidth: 30,
    borderRightWidth: 30,
    borderBottomWidth: 15,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'white',
    borderRadius: 10,
    transform: [{ rotate: '180deg' }],
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
    marginLeft: -8,
    marginTop: -8,
    borderRadius: 8,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'black',
    zIndex: 10,
  },
  zoomContainer: {
    position: 'absolute',
    width: 50, 
    height: 100,
    top: 200,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  zoomButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  zoomButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  discoverButton: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 8,
    marginTop: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  discoverButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  discoverModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(32,32,32,0.85)',
    justifyContent: 'flex-end',
  },
  discoverModalContent: {
    backgroundColor: 'rgba(32,32,32,0.8)', // Gray with low opacity
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '70%',
    paddingTop: 10,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  discoverContent: {
    flex: 1,
    // paddingHorizontal: 20,
  },
  discoverTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  discoverSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  discoverItem: {
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    padding: 15,
    // borderRadius: 10,
    // marginBottom: 15,
  },
  discoverItemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  discoverItemText: {
    fontSize: 14,
    color: '#666',
  },
  actionButtonContainer: {
    position: 'absolute',
    top: 100,
    right: 20,
    zIndex: 100,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 1, // or use marginBottom on iconButton if gap is not supported
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12, // for spacing between buttons
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  calloutContainer: {
    backgroundColor: 'rgba(32,32,32,0.95)',
    borderRadius: 12,
    padding: 14,
    minWidth: 340,
    maxWidth: 340,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  calloutTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  calloutDescription: {
    color: '#bbb',
    fontSize: 14,
    marginBottom: 8,
  },
});

// React & React Native core
import React, { useState, useRef, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Linking,
  Animated,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';

// Gesture Handler
import { PanGestureHandler, State } from 'react-native-gesture-handler';

// Navigation
import { router } from 'expo-router';

// Firebase
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '@/backend/firebaseConfig';

// Map & Map Clustering
import MapView from 'react-native-map-clustering';
import { Callout, MapMarker, Marker } from 'react-native-maps';

// Icons
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';

// Components
import { ThemedView } from '@/components/ThemedView';
import PostModal from '@/components/PostModal';
import DiscoverModal from '@/components/DiscoverModal';
import CustomCallout from '@/components/CustomCallout';
import EditPostModal from '@/components/EditPostModal';

// Firebase Firestore & Storage
import { addPost, getAllPosts, getPostbyAuthorID, getPostbyTag } from '@/backend/firestore';
import { getImageFromBlobUrl, getImageUrlWithSAS } from '@/backend/blob-storage';

// Types
import { PolisType, PostDBInfo, PostRequestInfo, UserInfo } from '@/types/types';

// Styles
import { indexStyles as styles } from '../styles/indexstyles';


const INITIAL_MAP_REGION = {
  latitude: 37.4219999,
  longitude: -122.0840575,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

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
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPostModalVisible, setIsPostModalVisible] = useState(false);
  const [isDiscoverModalVisible, setIsDiscoverModalVisible] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [posts, setPosts] = useState<PostDBInfo[]>([]);
  const [selectedPolis, setSelectedPolis] = useState<PolisType | null>(null);
  const markerRefs = useRef<{ [key: string]: MapMarker | null }>({});
  const mapRef = useRef<MapView>(null);
  const textInputRef = useRef<TextInput>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [selectedPost, setSelectedPost] = useState<PostDBInfo | null>(null);
  const [zoomingToMarker, setZoomingToMarker] = useState(false);
  const isProgrammaticMove = useRef(false);
  const [discoverUserId, setDiscoverUserId] = useState<string | null>(null);
  const [showedPostsChanges, setShowedPostsChanges] = useState<boolean> (false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [postToEdit, setPostToEdit] = useState<PostDBInfo | null>(null);

  // Handler to trigger posts refresh after deletion
  const handlePostsChange = () => {
    setShowedPostsChanges(true);
    setSelectedPost(null); // This will close the callout and remove the marker
  };

  // Handler for edit
  const handleEdit = (post: PostDBInfo) => {
    setPostToEdit(post);
    setEditModalVisible(true);
  };
  // Handler for submit
  const handleEditSubmit = (editedPost: PostDBInfo) => {
    // Update the post in posts state (replace by postId)
    setPosts(prevPosts => prevPosts.map(p => p.postId === editedPost.postId ? editedPost : p));
    setEditModalVisible(false);
    setPostToEdit(null);
    setSelectedPost(editedPost); // Optionally show the updated post
  };

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
          photoURL: firebaseUser.photoURL
        });
        setSelectedPolis({
          isUser: true,
          userInfo: {
            displayName: firebaseUser.displayName ?? "",
            email: firebaseUser.email ?? "",
            uid: firebaseUser.uid,
            photoURL: firebaseUser.photoURL
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
        getPostbyTag(selectedPolis.tag).then((tagPosts) => {
          setPosts(tagPosts); 
        })
      }
    }
    setShowedPostsChanges(false);
    console.log("i am here")
  }, [selectedPolis, showedPostsChanges]);



  // 3. Event Handlers
  const handleMarkerPress = async (post: PostDBInfo) => {
    if (!mapRef.current) return;
  
    isProgrammaticMove.current = true;
  
    try {
      // Try animateCamera first (for newer versions)
      if ('animateCamera' in mapRef.current) {
        // @ts-ignore - animateCamera exists on MapView
        mapRef.current.animateCamera(
          {
            center: {
              latitude: post.location.latitude + 0.002, // small vertical offset for callout visibility
              longitude: post.location.longitude,
            },
            zoom: 16,
          },
          { duration: 500 }
        );
      } else {
        // Fallback to animateToRegion for older versions
        // @ts-ignore - animateToRegion exists on MapView
        mapRef.current.animateToRegion(
          {
            latitude: post.location.latitude + 0.002,
            longitude: post.location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          500
        );
      }
    } catch (error) {
      console.error('Map animation error:', error);
    }
  
    // Wait for animation to finish before clearing flag
    setTimeout(() => {
      isProgrammaticMove.current = false;
    }, 600); // a bit longer than animation
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
  const handlePostSubmit = async (postData: PostRequestInfo) => {
    if (!user) {
      console.log("No user signed in, cannot submit post.");
      return;
    }
    try {
      await addPost(postData);
      console.log("Post added!", postData);
      // Reload posts to show the new post on the map
      setSelectedPolis({
        isUser: true,
        userInfo: user})
    } catch (error) {
      console.error("Failed to add post:", error);
    }
  };

  // 4. Utility/Render Helpers
  // const debugLog = (...args: any[]) => { ... };
  // const renderPostImages = (images?: string[]) => { ... };

  // Helper to render the current polis header
  const isPolisDisplayActive = !!selectedPolis;
  const renderPolisHeader = () => {
    if (!selectedPolis) {
      return null;
    }
    if (selectedPolis.isUser) {
      const { displayName, email } = selectedPolis.userInfo;
      return (
        <View style={styles.polisDisplay}>
          {selectedPolis.userInfo.photoURL ? (
            <Image
              source={{ uri: selectedPolis.userInfo.photoURL }}
              style={styles.profilePicPolis}
            />
          ) : null}
          <Text style={styles.polisDisplayText}>
            Viewing {displayName ? displayName : email}'s City
          </Text>
        </View>
      );
    }
    // For tag polis (future)
    if ('tag' in selectedPolis) {
      return (
        <View style={styles.polisDisplay }>
          <Text style={styles.polisDisplayText}>
            Viewing Posts in #{selectedPolis.tag} 
          </Text>
        </View>
      );
    }
    return null;
  };

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
            <>
            <TouchableOpacity onPress={() => router.push('/editprofile')}>
            <Image
              source={require('../../assets/images/Settings.png')}
              style={{ width: 20, height: 20, marginLeft: 120, tintColor: 'white' }}
            />
            </TouchableOpacity>
              <TouchableOpacity style={styles.navButton} onPress={displayAccountInfo}>
                <Text style={styles.signInText}>{user.displayName || user.email}</Text>
                <MaterialIcons name="account-circle" size={24} color="#fff" style={styles.accountIcon} />
              </TouchableOpacity>
            </>
          )}
          {user == null && (
            <TouchableOpacity style={styles.navButton}   onPress={handleSignIn}>
              <Text style={styles.signInText}>Sign In</Text>
              <MaterialIcons name="account-circle" size={24} color="#fff" style={styles.accountIcon} />
            </TouchableOpacity>
          )}
        </ThemedView>

        {/* Polis Header */}
        {renderPolisHeader()}

        {/* Map */}
        <ThemedView style={styles.mapPlaceholder}>
          <MapView
            ref={mapRef}
            style={styles.map}
            clusterColor="grey"
            initialRegion={INITIAL_MAP_REGION}
            onRegionChangeComplete={(region) => {
              setCurrentLocation(region);
              if (!isProgrammaticMove.current && selectedPost) {
                setSelectedPost(null);
                // Close the marker callout as well
                if (selectedPost && markerRefs.current[selectedPost.postId]) {
                  markerRefs.current[selectedPost.postId]?.hideCallout?.();
                }
              }
            }}
          >
            {posts.map((post, index) => (
              <Marker
                ref={ref => { markerRefs.current[post.postId] = ref; }}
                pinColor="black"
                key={index}
                coordinate={{
                  latitude: post.location.latitude,
                  longitude: post.location.longitude,
                }}
                onPress={async (e) => {
                  e.stopPropagation();
                  await handleMarkerPress(post);
                  // Set selected post after animation starts
                  setTimeout(() => setSelectedPost(post), 200);
                }}
              />
            ))}
          </MapView>

          {/* Center dot overlay */}
          <View pointerEvents="none" style={styles.centerDot} />

          {/* Action Buttons and Custom Callout Overlay as siblings */}
          <View style={{ flex: 1 }} pointerEvents="box-none">
            {/* Action Buttons */}
            <View style={styles.actionButtonContainer}>
              <TouchableOpacity style={styles.iconButton} onPress={handlePost}>
                <Image source={require('../../assets/images/plus.png')} style={styles.iconImage} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={openDiscoverModal}>
                <Image source={require('../../assets/images/binoculars.png')} style={styles.iconImage} />
              </TouchableOpacity>
            </View>
            {/* Custom Callout Overlay */}
            {selectedPost && (
              <View style={styles.customCalloutOverlay} pointerEvents="box-none">
                <View style={styles.customCalloutContainer}>
                  <CustomCallout
                    isUserLoggedIn={selectedPost.authorId == user?.uid}
                    post={selectedPost}
                    onLike={() => {
                      console.log("Like post:", selectedPost.postId);
                      // TODO: Implement like functionality
                    }}
                    onComment={() => {
                      console.log("Comment on post:", selectedPost.postId);
                      // TODO: Implement comment functionality
                    }}
                    onShare={() => {
                      console.log("Share post:", selectedPost.postId);
                      // TODO: Implement share functionality
                    }}
                    onViewDetails={() => {
                      handleMarkerPress(selectedPost);
                      setSelectedPost(null);
                    }}
                    onSelectNewPolis={(polis) => {
                      setSelectedPolis(polis);
                      setSelectedPost(null); // close callout marker
                    }}
                    onPostsChange={handlePostsChange}
                    onPostDeleted={() => {
                      setSelectedPost(null); // This will close the callout and remove the marker
                      setShowedPostsChanges(true); // Refresh posts
                    }}
                    onEdit={() => handleEdit(selectedPost)}
                  />
                  <TouchableOpacity 
                    style={styles.closeCalloutButton}
                    onPress={() => {console.log(selectedPost); setSelectedPost(null)}}
                  >
                    <Text style={styles.closeCalloutText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </ThemedView>

        {/* Location Info Modal */}
        {/* {isModalVisible && (
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
        )} */}

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
                    setSelectedPolis(polis);
                    setIsDiscoverModalVisible(false);
                  }}
                  setPolis={
                    discoverUserId
                      ? { isUser: true, userInfo: { uid: discoverUserId, displayName: '', email: '', photoURL: null } }
                      : selectedPolis != null
                        ? selectedPolis
                        : null
                  }
                />
              </Animated.View>
            </PanGestureHandler>
          </View>
        )}

        {/* Edit Post Modal */}
        {editModalVisible && postToEdit && (
          <EditPostModal
            onClose={() => { setEditModalVisible(false); setPostToEdit(null); }}
            oldPostInfo={postToEdit}
            onEdit={handleEditSubmit}
          />
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

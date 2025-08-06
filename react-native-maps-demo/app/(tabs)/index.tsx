// React & React Native core
import React, { useState, useRef, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
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

import * as Font from 'expo-font';
import * as Location from 'expo-location';

// Gesture Handler
import { PanGestureHandler, State } from 'react-native-gesture-handler';

// Navigation
import { router } from 'expo-router';

// Firebase
import { getAuth, onAuthStateChanged } from 'firebase/auth';
// Map & Map Clustering
import MapView from 'react-native-map-clustering';
import { Callout, MapMarker, Marker } from 'react-native-maps';

// Icons
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';

// Components
import { ThemedView } from '@/components/ThemedView';
import PostModal from '@/post/PostModal';
import DiscoverModal from '@/discover/DiscoverModal';
import CustomCallout from '@/map/CustomCallout';
import EditPostModal from '@/post/EditPostModal';

// Functions 
import ProtectedImage from '../../components/ProtectedImage';
import { getRandomColor } from '@/functions/getRandomColor';
// Firebase Firestore & Storage
// import { addPost, getAllPosts, getPostbyAuthorID, getPostbyTag } from '@/backend/firestore';
// import { getImageFromBlobUrl, getImageUrlWithSAS } from '@/backend/blob-storage';
import { getAllPosts, createPost, getPostsByAuthorId, getPostsByTag, getMarkerPostsByAuthorId } from '@/services/api/posts';
import { getImageUrlWithSAS } from '@/services/api/image';
import { getCurrentUser } from '@/services/auth/fireAuth';

// Types
import { PolisType, PostInfo, UserInfo, DisplayPostInfo, MarkerPostInfo } from '@/types/types';

// Styles
import { indexStyles as styles } from '../styles/indexstyles';
import customMapStyle from '../../map/mapstyles';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';


const markerIcons = {
  red: require('../../assets/images/red_marker.png'),
  blue: require('../../assets/images/blue_marker.png'),
  green: require('../../assets/images/green_marker.png'),
  purple: require('../../assets/images/purple_marker.png'),
  orange: require('../../assets/images/orange_marker.png'),
  pink: require('../../assets/images/pink_marker.png'),
  // add more as needed
};
const INITIAL_MAP_REGION = {
  latitude: 37.4219999,
  longitude: -122.0840575,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

export default function HomeScreen() {
  // 1. State variables
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPostModalVisible, setIsPostModalVisible] = useState(false);
  const [isDiscoverModalVisible, setIsDiscoverModalVisible] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [posts, setPosts] = useState<MarkerPostInfo[]>([]);
  const [selectedPolis, setSelectedPolis] = useState<PolisType | null>(null);
  const markerRefs = useRef<{ [key: string]: MapMarker | null }>({});
  const mapRef = useRef<MapView>(null);
  const textInputRef = useRef<TextInput>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [selectedPost, setSelectedPost] = useState<MarkerPostInfo | null >(null);
  const isProgrammaticMove = useRef(false);
  const [discoverUserId, setDiscoverUserId] = useState<string | null>(null);
  const [showedPostsChanges, setShowedPostsChanges] = useState<boolean> (false);
  const [userInfoChange, setUserInfoChange] = useState<boolean> (false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [postIdToEdit, setPostIdToEdit] = useState<string>('');
  const [isChoosingLocation, setIsChoosingLocation] = useState(false);
  

  // Handler to trigger posts refresh after deletion
  const handlePostsChange = () => {
    setShowedPostsChanges(true);
    setSelectedPost(null); // This will close the callout and remove the marker
  };

  // Handler for edit
  const handleEdit = (postId: string) => {
    setPostIdToEdit(postId);
    setEditModalVisible(true);
  };
  // Handler for submit
  const handleEditSubmit = (editedPostId: string) => {
    // Update the post in posts state (replace by postId), preserving DisplayPostInfo structure
    // setPosts(prevPosts =>
    //   prevPosts.map(p =>
    //     p.postInfo.postId === editedPost.postInfo.postId
    //       ? { ...p, postInfo: { ...p.postInfo, ...editedPost } }
    //       : p
    //   )
    // );
    setEditModalVisible(false);
    setPostToEdit(null);
    // setSelectedPost(editedPostId); // Optionally show the updated post
  };

  // export type UserInfo = {
  //   displayName: string; 
  //   email: string;
  //   uid: string;
  //   photoURL: string | null; 
  // };
  
  useFocusEffect(
    React.useCallback(() => {
      const auth = getAuth();

      Font.loadAsync({
      'Koulen-Regular': require('@/assets/fonts/Koulen-Regular.ttf'),
    });

      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          await firebaseUser.reload();
          const refreshedUser = auth.currentUser;
          if (!refreshedUser) return;

          let displayName = "";
          if (refreshedUser.displayName && refreshedUser.displayName.trim() !== "") {
            displayName = refreshedUser.displayName;
          } else if (refreshedUser.email) {
            // Take the part before @
            displayName = refreshedUser.email.split("@")[0];
          } else {
            displayName = "";
          }

          const currUser = {
            displayName,
            email: refreshedUser.email ?? "",
            uid: refreshedUser.uid,
            photoURL: refreshedUser.photoURL ?? null
          };

          setUser(currUser);
          setSelectedPolis({ isUser: true, userInfo: currUser });
        } else {
          setUser(null);
          setSelectedPolis(null);
        }
      });

      return unsubscribe;
    }, [])
  );


  useEffect(() => {
    console.log("please");
    if (selectedPolis) {
      if (selectedPolis.isUser) {
        getMarkerPostsByAuthorId(selectedPolis.userInfo.uid).then((userPosts) => {
          if (userPosts && userPosts.success && Array.isArray(userPosts.posts)) {
            setPosts(userPosts.posts); // set directly
          } else {
            setPosts([]);
          }
        
        });
      } else {
        getPostsByTag(selectedPolis.tag).then((tagPosts) => {
          setPosts(tagPosts); 
        })
      }
    }
    setShowedPostsChanges(false);
  }, [selectedPolis, showedPostsChanges]);

  const goToCurrentLocation = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location permission is required to show your position.');
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    setCurrentLocation({
      latitude,
      longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
    isProgrammaticMove.current = true; 
    if (!mapRef.current) return;
  
    if('animateCamera' in mapRef.current)
        mapRef.current.animateCamera(
          {
            center: {
              latitude: latitude,
              longitude: longitude,
            },
            zoom: 26,
          },
          { duration: 500 }
        );
  } catch (error) {
    console.error('Error getting current location:', error);
    Alert.alert('Error', 'Unable to get current location.');
  }
};



  // 3. Event Handlers
  const handleMarkerPress = async (post: MarkerPostInfo) => {
    if (!mapRef.current) return;
  
    isProgrammaticMove.current = true;
  
    try {
      // Try animateCamera first (for newer versions)
      if ('animateCamera' in mapRef.current) {
        // @ts-ignore - animateCamera exists on MapView
        mapRef.current.animateCamera(
          {
            center: {
              latitude: post.latitude + 0.002, // small vertical offset for callout visibility
              longitude: post.longitude,
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
            latitude: post.latitude + 0.002,
            longitude: post.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          500
        );

        setTimeout(() => {
      isProgrammaticMove.current = false;
    }, 600); 
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
  const handlePostSubmit = async () => {
    if (!user) {
      console.log("No user signed in, cannot submit post.");
      return;
    }
    try {
      // Reload posts to show the new post on the map
      if (selectedPolis?.isUser && selectedPolis.userInfo !== user){
      setSelectedPolis({
        isUser: true,
        userInfo: user})
      }
      else {
        handlePostsChange();
      }
      
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
            Viewing {displayName ? displayName : email}'s City-State
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
            <Text style={styles.navButtonText}>Polis</Text>
          </TouchableOpacity>
              <View style={styles.rightContainer}>
                  {user != null ? (
                    <>
                      <TouchableOpacity onPress={displayAccountInfo}>
                        <Text style={styles.signInText}>{'@' + (user.displayName || user.email)}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => router.push('/editprofile')}>
                      <MaterialIcons
                        name="settings"
                        size={24}
                        color="#000"
                      />
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity style={styles.navButton} onPress={handleSignIn}>
                      <Text style={styles.signInText}>Sign In</Text>
                    </TouchableOpacity>
                  )}
                </View>
        </ThemedView>


        {/* Map */}
        <ThemedView style={styles.mapPlaceholder}>
                  {/* Polis Header */}
        {!isChoosingLocation ?  renderPolisHeader() :     
        <TouchableOpacity
          style={styles.closeChooseLocationButton}
          onPress={() => setIsChoosingLocation(false)}
        >
          <MaterialIcons name="close" size={24} color="#000" />
        </TouchableOpacity>
}
          <MapView
            provider="google"
            mapRef={ref => mapRef.current = ref}
            style={styles.map}
            clusterColor="white"
            initialRegion={INITIAL_MAP_REGION}
            customMapStyle={[]}
            onRegionChangeComplete={(region) => {
              setCurrentLocation(region);
              if (!isProgrammaticMove.current && selectedPost) {
                setSelectedPost(null);
                // Close the marker callout as well
                if (
                  selectedPost !== null &&
                  markerRefs.current[String(selectedPost)]
                ) {
                  markerRefs.current[String(selectedPost)]?.hideCallout?.();
                }
              }
            }}
              renderCluster={(cluster: any) => {
                const {
                  id,
                  geometry: { coordinates },
                  properties: { point_count },
                  onPress,
                } = cluster;

                const coordinate = {
                  latitude: coordinates[1],
                  longitude: coordinates[0],
                };

                return (
                  <Marker
                    key={`cluster-${id}`}
                    coordinate={coordinate}
                    onPress={onPress}
                  >
                    <View
                      style={styles.cluster}
                    >
                      <Text style={styles.clusterText}>
                        {point_count}
                      </Text>
                    </View>
                  </Marker>
                );
              }}


          >
            {!isChoosingLocation && posts.map((post, index) => {
              if (!post.latitude) return null;
              const { postId, latitude, longitude } = post;
              return (
                <Marker
                  ref={ref => { markerRefs.current[String(postId)] = ref; }}
                  key={String(postId)}
                  coordinate={{ latitude, longitude }}
                  onPress={async (e) => {
                    e.stopPropagation();
                    await handleMarkerPress(post);
                    setTimeout(() => setSelectedPost(post), 200);
                  }}
                >
                  <Image
                    source={markerIcons[post.markerColor] || markerIcons.red}
                    style={{
                      width: 40,
                      height: 40,
                    }}
                    resizeMode="contain"
                  />
                </Marker>
              );
            })}
          </MapView>

          {/* Center dot overlay */}
          {isChoosingLocation && <View pointerEvents="none" style={styles.centerDot} />}
        {isChoosingLocation && (
          <View style={styles.chooseLocationButtonRow}>

            <TouchableOpacity
              style={styles.confirmLocationButton}
              onPress={() => {
                setIsPostModalVisible(true);
                setIsChoosingLocation(false);
              }}
            >
              <Text style={styles.confirmLocationText}>Confirm Location</Text>
            </TouchableOpacity>
                  <TouchableOpacity
              style={styles.goToLocationButtonOnFind}
              onPress={goToCurrentLocation}
            >
              <MaterialIcons name="near-me" size={24} color="#000" />
            </TouchableOpacity>

          </View>
        )}



          {/* Action Buttons and Custom Callout Overlay as siblings */}
          <View style={{ flex: 1 }} pointerEvents="box-none">
            {/* Action Buttons */}
         { !isChoosingLocation && <View style={styles.actionButtonContainer}>
           <TouchableOpacity style={styles.iconWrapper1}  onPress={() => {
              // goToCurrentLocation();
            setIsChoosingLocation(true);
            }}>
                    <View style={styles.iconButton1}/>
                    <Text style={styles.iconText}>POST</Text>
         </TouchableOpacity>

              <TouchableOpacity style={styles.iconWrapper2} onPress={openDiscoverModal} >
                <View style={styles.iconButton2}/>

                <Text style={styles.iconText}>SEEK</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.goToLocationButton} onPress={goToCurrentLocation}>
                <MaterialIcons name="near-me" size={24} color="#000" />
              </TouchableOpacity>
          </View>}

            {/* Custom Callout Overlay */}
            {selectedPost && (
              <View style={styles.customCalloutOverlay} pointerEvents="box-none">
                <View style={styles.customCalloutContainer}>
                  <CustomCallout
                    isUserLoggedIn={selectedPost.userId == user?.uid}
                    postId={selectedPost.postId}
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
                    onSelectPost={(post) => {
                      setSelectedPost(post); 
                      setIsDiscoverModalVisible(true); 
                    }}
                    onPostsChange={handlePostsChange}
                    onPostDeleted={() => {
                      setSelectedPost(null); // This will close the callout and remove the marker
                      setShowedPostsChanges(true); // Refresh posts
                    }}
                    
                    onEdit={() => handleEdit(selectedPost.postId)}
                  />
                  <TouchableOpacity 
                    style={styles.closeCalloutButton}
                    onPress={() => {setSelectedPost(null)}}
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
                setPolis={null}
                selectedPostIdFromParent={selectedPost?.postId || ''} // 👈 this is the current value
                setPostId={setSelectedPost?.postId}              // 👈 this is the setter function
              />
              </Animated.View>
            </PanGestureHandler>
          </View>
        )}
        {editModalVisible && postIdToEdit && (
          <EditPostModal
            onClose={() => {
              setEditModalVisible(false);
              setPostIdToEdit('');
            }}
            onEdit={() => { 
              setEditModalVisible(false);
              setPostIdToEdit('')
              setSelectedPost(null);
              setShowedPostsChanges(true);
            }}
            oldPostId={postIdToEdit}
          />
        )}

      </ThemedView>
    </SafeAreaView>
  );
}

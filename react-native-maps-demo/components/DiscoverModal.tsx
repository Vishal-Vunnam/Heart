// =====================
// Imports
// =====================
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Internal imports
import { getPostbyAuthorID, getAllUsers } from '@/firebase/firestore';
import { getImageUrlWithSAS } from '@/firebase/blob-storage';
import { PostView } from './PostView';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { PolisType, PostDBInfo } from '@/types';
import {getCurrentUser} from '@/firebase/auth';
import { router } from 'expo-router';
// =====================
// Constants & Types
// =====================
const SEARCH_HISTORY_KEY = 'search_history';

type User = {
  uid: string;
  email: string;
  displayName?: string;
  [key: string]: any;
};

// =====================
// AsyncStorage Utilities
// =====================
export async function saveSearch(user: User) {
  let history = await getSearchHistory();
  history = [user, ...history.filter((u) => u.uid !== user.uid)];
  history = history.slice(0, 10);
  await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
}


export async function getSearchHistory(): Promise<User[]> {
  const raw = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function clearSearchHistory() {
  await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
}

// =====================
// DiscoverModal Component
// =====================
interface DiscoverModalProps {
  onPostSelect: (post: PostDBInfo) => void;
  onPolisSelect?: (polis: PolisType) => void;
  setPolis: PolisType | null;
}

const DiscoverModal: React.FC<DiscoverModalProps> = ({ onPostSelect, onPolisSelect, setPolis }) => {
  // State
  const [posts, setPosts] = useState<PostDBInfo[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoggedInUser, setIsLoggedInUser] = useState(false);
  const [selectedPolis, setSelectedPolis] = useState<PolisType | null>(null);
  const textInputRef = useRef<TextInput>(null);
  const [searchText, setSearchText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  // Fetch users and set initial polis
  useEffect(() => {
    getAllUsers().then(setUsers);
    setSelectedPolis(setPolis);
    (async () => {
      try {
        const currentUser = await getCurrentUser();
        if (
          currentUser &&
          setPolis &&
          (setPolis as any).isUser &&
          (setPolis as any).userInfo &&
          (setPolis as any).userInfo.uid
        ) {
          setIsLoggedInUser((currentUser as any).uid === (setPolis as any).userInfo.uid);
        } else {
          setIsLoggedInUser(false);
        }
      } catch {
        setIsLoggedInUser(false);
      }
    })();
  }, [setPolis]);

  // Fetch posts for selected polis
  useEffect(() => {
    if (selectedPolis && selectedPolis.isUser) {
      setFilteredUsers([]);
      getPostbyAuthorID(selectedPolis.userInfo.uid).then((userPosts) => {
        setPosts(userPosts);
      });
      getCurrentUser()
        .then((currentUser: any) => {
          if (
            currentUser &&
            selectedPolis &&
            selectedPolis.isUser &&
            selectedPolis.userInfo &&
            selectedPolis.userInfo.uid
          ) {
            setIsLoggedInUser(currentUser.uid === selectedPolis.userInfo.uid);
          } else {
            setIsLoggedInUser(false);
          }
        })
        .catch(() => setIsLoggedInUser(false));
    } else {
      setPosts([]);
      setIsLoggedInUser(false);
    }
  }, [selectedPolis]);

  // Search input handler
  const handleSearchInputChange = (text: string) => {
    setSearchText(text);
    if (text.length > 0) {
      const matches = users.filter(
        (user) =>
          user.email.toLowerCase().includes(text.toLowerCase()) ||
          (user.displayName && user.displayName.toLowerCase().includes(text.toLowerCase()))
      );
      setFilteredUsers(matches);
    } else {
      getSearchHistory().then((searchHistory) => {
        setFilteredUsers(searchHistory);
      });
    }
  };

  // Render
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        style={styles.discoverView}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.postsContainer}>
          {/* Search Box */}
          <ThemedView style={styles.searchBoxContainer}>
            <View style={styles.searchBoxWrapper}>
              <EvilIcons name="search" size={24} color="#888" style={styles.icon} />
              <TextInput
                ref={textInputRef}
                style={styles.searchBox}
                placeholder="Search, #tag, location"
                placeholderTextColor="#888"
                onChangeText={handleSearchInputChange}
                value={searchText}
                onFocus={async () => {
                  const history = await getSearchHistory();
                  setFilteredUsers(history && history.length > 0 ? history : users);
                  setIsTyping(true);
                }}
                onBlur={() => setIsTyping(false)}
              />
            </View>
          </ThemedView>
          {/* Suggestion Dropdown */}
          {isTyping ? (
            <View style={styles.suggestionBox}>
              {filteredUsers.map((user, index) => (
                <TouchableOpacity
                  key={user.uid || index}
                  style={styles.suggestionItem}
                  onPress={() => {
                    setSelectedPolis({
                      isUser: true,
                      userInfo: {
                        displayName: user.displayName ?? '',
                        email: user.email,
                        uid: user.uid,
                      },
                    });
                    saveSearch(user);
                    setSearchText(user.email);
                    setIsTyping(false);
                    textInputRef.current?.blur();
                  }}
                >
                  <Text style={styles.userName}>{user.displayName || 'No name'}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : selectedPolis ? (
            <>
              <ThemedView style={styles.infoDisplay}>
                <View style={styles.infoLeft}>
                  <Text style={styles.displayName}>
                    {selectedPolis.isUser
                      ? selectedPolis.userInfo.displayName || selectedPolis.userInfo.email
                      : selectedPolis.tag}
                  </Text>
                  {isLoggedInUser && (
                    <TouchableOpacity style={styles.settingsButton} onPress={() => router.push('/editprofile')}>
                      <Text style={styles.settingsText}>⚙️ User Settings</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.infoRight}
                  onPress={() => {
                    if (onPolisSelect) {
                      onPolisSelect(selectedPolis);
                    }
                  }}
                >
                  <Text style={{ color: '#007AFF', fontWeight: 'bold', fontSize: 16 }}>
                    View{' '}
                    {isLoggedInUser
                      ? 'My City'
                      : `${selectedPolis.isUser
                          ? selectedPolis.userInfo.displayName || selectedPolis.userInfo.email
                          : selectedPolis.tag}'s City`}
                  </Text>
                </TouchableOpacity>
                <View style={styles.infoRight}>
                  <Text style={styles.infoStatLabel}>Posts</Text>
                  <Text style={styles.infoStatValue}>{posts.length}</Text>
                </View>
              </ThemedView>
              <ThemedView style={styles.postDisplay}>
                {posts.length > 0 ? (
                  posts.map((post, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.postItem}
                      onPress={() => {
                        if (onPolisSelect) onPolisSelect(selectedPolis);
                        if (onPostSelect) onPostSelect(post);
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <ThemedText style={styles.postTitle}>{post.title}</ThemedText>
                        <ThemedText style={styles.postDescription}>{post.description}</ThemedText>
                        <ThemedText style={styles.postDate}>{post.date}</ThemedText>
                        <ThemedText style={styles.postAuthor}>By: {post.author}</ThemedText>
                      </View>
                      {post.images_url_blob && post.images_url_blob.length > 0 && (
                        <ScrollView horizontal style={{ marginLeft: 18 }}>
                          <Image
                            source={{ uri: getImageUrlWithSAS(post.images_url_blob[0]) }}
                            style={{ width: 100, height: 100, borderRadius: 8 }}
                            resizeMode="cover"
                          />
                        </ScrollView>
                      )}
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.noPosts}>No posts found for this user.</Text>
                )}
              </ThemedView>
            </>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Enhanced styles for DiscoverModal component
const styles = StyleSheet.create({
  // Main container with better backdrop
  discoverView: {
    backgroundColor: 'transparent',
    flex: 1,
  },
  
  // Enhanced modal overlay with better backdrop
  discoverModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)', // Darker, more professional backdrop
    justifyContent: 'flex-end',
    zIndex: 100,
    elevation: 100,
  },
  
  // Improved modal content container
  discoverModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '85%', // Increased height for better content display
    paddingTop: 0,
    backgroundColor: '#1a1a1a', // Darker, more modern background
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 16,
  },
  
  // Enhanced drag handle
  dragHandle: {
    width: 50,
    height: 5,
    backgroundColor: '#555',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  
  // Posts container with better spacing
  postsContainer: {
    zIndex: 1,
    flex: 1,
    paddingHorizontal: 0,
  },
  
  // Enhanced search box container
  searchBoxContainer: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 0,
    zIndex: 1000,
    position: 'relative',
    marginBottom: 8,
  },
  
  // Improved search box wrapper
  searchBoxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 44, // Increased height for better touch targets
    borderRadius: 22,
    borderWidth: 0, // Remove border for cleaner look
    paddingHorizontal: 16,
    backgroundColor: '#2a2a2a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  
  // Enhanced search icon
  icon: {
    marginRight: 12,
    color: '#888',
  },
  
  // Improved search input
  searchBox: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    backgroundColor: 'transparent',
    paddingVertical: 0,
  },
  
  // Enhanced suggestion box
  suggestionBox: {
    position: 'absolute',
    top: 68,
    left: 16,
    right: 16,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    marginTop: 4,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    maxHeight: 250,
    overflow: 'hidden',
    zIndex: 1001,
  },
  
  // Improved suggestion items
  suggestionItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: 'transparent',
  },
  
  // Enhanced user name styling
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  
  // Enhanced user email styling
  userEmail: {
    fontSize: 14,
    color: '#888',
  },
  
  // Improved info display
  infoDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    minHeight: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  
  // Enhanced info left section
  infoLeft: {
    flex: 1,
    justifyContent: 'center',
  },
  
  // Improved display name
  displayName: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    fontFamily: 'Averia',
    marginBottom: 4,
  },
  
  // Enhanced settings button
  settingsButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  
  settingsText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  
  // Improved info right section
  infoRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 80,
    marginLeft: 12,
  },
  
  // Enhanced stat labels
  infoStatLabel: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Averia',
    textAlign: 'right',
  },
  
  infoStatValue: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 2,
    fontFamily: 'Averia',
    textAlign: 'right',
  },
  
  // Enhanced post display
  postDisplay: {
    marginTop: 0,
    backgroundColor: 'transparent',
    flex: 1,
  },
  
  // Improved post items
  postItem: {
    backgroundColor: '#2a2a2a',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  
  // Enhanced post titles
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
    lineHeight: 22,
  },
  
  // Improved post descriptions
  postDescription: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 6,
    lineHeight: 18,
  },
  
  // Enhanced post metadata
  postDate: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  
  postAuthor: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  
  // Improved no posts message
  noPosts: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 40,
    fontStyle: 'italic',
  },
  
  // Enhanced view city button
  viewCityButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 8,
  },
  
  viewCityButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
});

// // Additional component improvements
// const DiscoverModalEnhanced = ({
//   onPostSelect,
//   onPolisSelect,
//   setPolis,
//   visible,
//   onClose
// }) => {
//   // ... existing state and logic ...
  
//   const handleBackdropPress = () => {
//     if (onClose) {
//       onClose();
//     }
//   };
  
//   return (
//     <Modal
//       visible={visible}
//       animationType="slide"
//       transparent={true}
//       onRequestClose={onClose}
//     >
//       <TouchableWithoutFeedback onPress={handleBackdropPress}>
//         <View style={styles.discoverModalOverlay}>
//           <TouchableWithoutFeedback onPress={() => {}}>
//             <View style={styles.discoverModalContent}>
//               <View style={styles.dragHandle} />
              
//               {/* Header with close button */}
//               <View style={styles.headerContainer}>
//                 <Text style={styles.modalTitle}>Discover</Text>
//                 <TouchableOpacity onPress={onClose} style={styles.closeButton}>
//                   <Text style={styles.closeButtonText}>✕</Text>
//                 </TouchableOpacity>
//               </View>
              
//               {/* Rest of your existing modal content */}
//               <KeyboardAvoidingView
//                 style={{ flex: 1 }}
//                 behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//                 keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
//               >
//                 {/* Your existing ScrollView and content */}
//               </KeyboardAvoidingView>
//             </View>
//           </TouchableWithoutFeedback>
//         </View>
//       </TouchableWithoutFeedback>
//     </Modal>
//   );
// };

// Additional header styles
const headerStyles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    fontFamily: 'Averia',
  },
  
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  closeButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DiscoverModal;
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
import { getPostsByAuthorId} from '@/api/posts';
import ProtectedImage from '@/components/ProtectedImage';
import { PostView } from './PostView';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { PolisType, PostInfo, UserInfo, DisplayPostInfo, PolisSearchReturn } from '@/types/types';
import { searchPolis } from '@/api/search';
import { router } from 'expo-router';
import { getCurrentUser } from '@/auth/fireAuth';
// =====================
// Constants & Types
// =====================
const SEARCH_HISTORY_KEY = 'search_history';
const user = getCurrentUser(); 

// =====================
// AsyncStorage Utilities
// =====================
export async function saveSearch(user: UserInfo) {
  let history = await getSearchHistory();
  history = [user, ...history.filter((u) => u.uid !== user.uid)];
  history = history.slice(0, 10);
  await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
}


export async function getSearchHistory(): Promise<UserInfo[]> {
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
  onPostSelect: (post: PostInfo) => void;
  onPolisSelect?: (polis: PolisType) => void;
  setPolis: PolisType | null;
}

const DiscoverModal: React.FC<DiscoverModalProps> = ({ onPostSelect, onPolisSelect, setPolis }) => {
  // State
  const [posts, setPosts] = useState<DisplayPostInfo[]>([]);
  const [isLoggedInUser, setIsLoggedInUser] = useState(false);
  const [selectedPolis, setSelectedPolis] = useState<PolisType | null>(null);
  const textInputRef = useRef<TextInput>(null);
  const [searchText, setSearchText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [polisSuggestions, setPolisSuggestions] = useState<PolisSearchReturn[]>([]);
  const [isSearchingPolis, setIsSearchingPolis] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<UserInfo[]>([]); // for search history fallback
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Fetch users and set initial polis
  useEffect(() => {
    setSelectedPolis(setPolis);
    (async () => {
      try {
        const currentUser = await getCurrentUser();
        if (
          currentUser &&
          setPolis &&
          (setPolis as any).isUser &&
          (setPolis as any).userInfo &&
          (setPolis as any).userInfo.uid &&
          (setPolis as any).userInfo.photoURL
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
      getPostsByAuthorId(selectedPolis.userInfo.uid).then((userPosts) => {
        setPosts(userPosts.posts);
      });
      if (
        user &&
        selectedPolis &&
        selectedPolis.isUser &&
        selectedPolis.userInfo &&
        selectedPolis.userInfo.uid
      ) {
        setIsLoggedInUser(user.uid === selectedPolis.userInfo.uid);
      } else {
        setIsLoggedInUser(false);
      }
    }
  }, [selectedPolis]);

  // Debounced polis search
  useEffect(() => {
    if (!isTyping) return;
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    if (searchText.trim().length === 0) {
      // Show search history if no text
      getSearchHistory().then((searchHistory) => {
        setFilteredUsers(searchHistory);
        setPolisSuggestions([]);
      });
      setIsSearchingPolis(false);
      return;
    }
    setIsSearchingPolis(true);
    debounceTimeout.current = setTimeout(async () => {
      try {
        const results = await searchPolis(searchText.trim());
        setPolisSuggestions(results);
      } catch {
        setPolisSuggestions([]);
      }
      setIsSearchingPolis(false);
    }, 600);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, isTyping]);

  // Search input handler
  const handleSearchInputChange = (text: string) => {
    setSearchText(text);
    setIsTyping(true);
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
                  setIsTyping(true);
                  if (searchText.trim().length === 0) {
                    const history = await getSearchHistory();
                    setFilteredUsers(history);
                  }
                }}
                onBlur={() => setIsTyping(false)}
              />
            </View>
          </ThemedView>
          {/* Suggestion Dropdown */}
          {isTyping ? (
            <View style={styles.suggestionBox}>
              {isSearchingPolis && (
                <View style={{ padding: 16, alignItems: 'center' }}>
                  <Text style={{ color: '#888' }}>Searching...</Text>
                </View>
              )}
              {/* Show polis suggestions if searchText, else show search history */}
              {searchText.trim().length > 0 && polisSuggestions.length > 0 ? (
                polisSuggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={suggestion.id || index}
                    style={styles.suggestionItem}
                    onPress={() => {
                      if (suggestion.is_tag) {
                        setSelectedPolis({ isUser: false, tag: suggestion.name });
                        setSearchText(`#${suggestion.name}`);
                      } else {
                        // For user, we only have id and name; fake email/photoURL for now
                        setSelectedPolis({
                          isUser: true,
                          userInfo: {
                            displayName: suggestion.name,
                            email: '',
                            uid: suggestion.id,
                            photoURL: null,
                          },
                        });
                        setSearchText(suggestion.name);
                      }
                      setIsTyping(false);
                      setPolisSuggestions([]);
                      textInputRef.current?.blur();
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {suggestion.is_tag ? (
                        <Text style={{ color: '#FFD700', fontWeight: 'bold', fontSize: 16, marginRight: 8 }}>#</Text>
                      ) : (
                        <EvilIcons name="user" size={24} color="#888" style={{ marginRight: 8 }} />
                      )}
                      <Text style={styles.userName}>{suggestion.name}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : !isSearchingPolis && filteredUsers.length > 0 && searchText.trim().length === 0 ? (
                filteredUsers.map((user, index) => (
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
                          photoURL: user.photoURL,
                        },
                      });
                      saveSearch(user);
                      setSearchText(user.email);
                      setIsTyping(false);
                      textInputRef.current?.blur();
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {user.photoURL ? (
                        <Image
                          source={{ uri: user.photoURL }}
                          style={styles.profilePicSmall}
                        />
                      ) : null}
                      <View>
                        <Text style={styles.userName}>{user.displayName || 'No name'}</Text>
                        <Text style={styles.userEmail}>{user.email}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              ) : null}
            </View>
          ) : selectedPolis ? (
            <>
              <ThemedView style={styles.infoDisplay}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  {selectedPolis.isUser && selectedPolis.userInfo.photoURL ? (
                    <Image
                      source={{ uri: selectedPolis.userInfo.photoURL }}
                      style={styles.profilePicMedium}
                    />
                  ) : null}
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
                        if (onPostSelect) onPostSelect(post.postInfo);
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <ThemedText style={styles.postTitle}>{post.postInfo.title}</ThemedText>
                        <ThemedText style={styles.postDescription}>{post.postInfo.description}</ThemedText>
                        <ThemedText style={styles.postDate}>{post.postInfo.date}</ThemedText>
                        <ThemedText style={styles.postAuthor}>By: {post.postInfo.userId}</ThemedText>
                      </View>
                      {/* {post.images_url_blob && post.images_url_blob.length > 0 && (
                        <ScrollView horizontal style={{ marginLeft: 18 }}>
                          {ProtectedImage}
                        </ScrollView>
                      )} */}
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
  profilePicSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
    backgroundColor: '#222',
    borderWidth: 1,
    borderColor: '#fff',
  },
  profilePicMedium: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 14,
    backgroundColor: '#222',
    borderWidth: 2,
    borderColor: '#fff',
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
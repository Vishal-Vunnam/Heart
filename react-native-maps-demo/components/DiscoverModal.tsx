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
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { PolisType } from '@/types';

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
const DiscoverModal = ({
  onPostSelect,
  onPolisSelect,
  setPolis
}: {
  onPostSelect: (post: any) => void;
  onPolisSelect?: (polis: any) => void;
  setPolis: PolisType | null
}) => {
  // ----- State & Refs -----
  const [posts, setPosts] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedPolis, setSelectedPolis] = useState<PolisType | null>(null);
  const textInputRef = useRef<TextInput>(null);
  const [searchText, setSearchText] = useState('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  // ----- Effects -----
  useEffect(() => {
    // Fetch all users on mount ( THIS IS TEMPORARY #WILLNOTSCALE)
    getAllUsers().then(setUsers);
    setSelectedPolis(setPolis);
  }, []);

  useEffect(() => {
    if (selectedPolis && selectedPolis.isUser) {
      setFilteredUsers([]);
      getPostbyAuthorID(selectedPolis.userInfo.uid).then((userPosts) => {
        setPosts(userPosts);
      });
    } else {
      setPosts([]);
    }
  }, [selectedPolis]);

  // ----- Handlers & Utilities -----
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

  // ----- Render -----
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
            {/* 👇 Suggestion Dropdown */}
          </ThemedView>
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
                        uid: user.uid
                      }
                    })
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
                    {selectedPolis.isUser
                      ? selectedPolis.userInfo.displayName || selectedPolis.userInfo.email
                      : selectedPolis.tag}
                    {"'"}s City
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
                      {post.images && post.images.length > 0 && (
                          <ScrollView horizontal style={{ marginLeft: 18 }}>
                            <Image
                              source={{ uri: getImageUrlWithSAS(post.images[0]) }}
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

// =====================
// Styles
// =====================
const styles = StyleSheet.create({
  infoDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgb(253, 253, 253)',
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 10,
    paddingVertical: 12,
    paddingHorizontal: 18,
    minHeight: 60,
  },
  infoLeft: {
    flex: 1,
    justifyContent: 'center',
  },
  displayName: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    fontFamily: 'Averia',
  },
  infoRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 60,
  },
  infoStatLabel: {
    color: 'black',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Averia',
  },
  infoStatValue: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2,
    fontFamily: 'Averia',
  },
  discoverView: {
    backgroundColor: 'transparent',
    flex: 1,
  },
  email: {
    fontSize: 16,
    color: 'white',
  },
  postsContainer: {
    zIndex: 1,
  },
  postsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  postItem: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row', // Added for horizontal layout
    alignItems: 'center', // Added for vertical alignment
  },
  postTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  postDescription: {
    fontSize: 14,
    color: 'white',
    marginTop: 4,
  },
  postDate: {
    fontSize: 12,
    color: 'white',
    marginTop: 4,
  },
  postDisplay: {
    marginTop: 20,
    backgroundColor: 'transparent',
  },
  postAuthor: {
    color: 'white',
  },
  noPosts: {
    fontSize: 16,
    color: 'white',
  },
  searchBoxContainer: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    padding: 10,
    borderRadius: 12,
    zIndex: 1000,
    position: 'relative',
    backdropFilter: 'blur(6px)',
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
    color: 'black',
    backgroundColor: 'transparent',
  },
  searchButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  usersContainer: {
    marginTop: 60,
    paddingHorizontal: 16,
  },
  usersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: 'white',
  },
  userItem: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  userName: {
    fontSize: 14,
    color: 'white',
  }, 
  suggestionBox: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    color: 'white',
    marginTop: 4,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    maxHeight: 200,
    overflow: 'scroll',
    zIndex: 1001,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    color: 'white',
  },
});

// =====================
// Export
// =====================
export default DiscoverModal;

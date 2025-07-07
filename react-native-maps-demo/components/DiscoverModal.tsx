import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { getPostbyAuthorID, getAllUsers } from '@/firebase/firestore';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from 'react-native';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import { UserInfo, PolisType } from '@/types';


type User = {
  uid: string;
  email: string;
  displayName?: string;
  [key: string]: any;
};

const DiscoverModal = ({
  onPostSelect,
  onPolisSelect,
}: {
  onPostSelect: (post: any) => void;
  onPolisSelect?: (polis: any) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedPolis, setSelectedPolis] = useState<PolisType | null> (null);
  const textInputRef = useRef<TextInput>(null);
  const [searchText, setSearchText] = useState('');
  const [isTyping, setIsTyping] = useState<boolean>(false); 
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  useEffect(() => {
    // Fetch all users on mount
    getAllUsers().then(setUsers);
  }, []); 

  useEffect(() => {
    if (selectedUser && selectedUser.uid) {
      setFilteredUsers([]);
      getPostbyAuthorID(selectedUser.uid).then((userPosts) => {
        setPosts(userPosts);
      });
      const polis: PolisType = {
        isUser: true,
        userInfo: {
          displayName: selectedUser.displayName || "",
          email: selectedUser.email,
          uid: selectedUser.uid,
        }
      };
      setSelectedPolis(polis);

    } else {
      setPosts([]);
    }
  }, [selectedUser]);

  const handleSearchInputChange = (text: string) => {
    setSearchText(text);

    if (text.length > 0) {
      const matches = users.filter(user =>
        user.email.toLowerCase().includes(text.toLowerCase()) ||
        (user.displayName && user.displayName.toLowerCase().includes(text.toLowerCase()))
      );
      setFilteredUsers(matches);
    } else {
      setFilteredUsers([]);
      setSelectedUser(null);
      setPosts([]);
    }
  };

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
                onFocus={() => setIsTyping(true)}
                onBlur={() => setIsTyping(false)}
              />
            </View>
            {/* 👇 Suggestion Dropdown */}
            {filteredUsers.length > 0 && isTyping && (
              <View style={styles.suggestionBox}>
                {filteredUsers.map((user, index) => (
                  <TouchableOpacity
                    key={user.uid || index}
                    style={styles.suggestionItem}
                    onPress={() => {
                      setSelectedUser(user);
                      setSearchText(user.email);
                      setIsTyping(false);
                    }}
                  >
                    <Text style={styles.userName}>{user.displayName || 'No name'}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ThemedView>
          {selectedUser && <ThemedView style={styles.infoDisplay}>
            <View style={styles.infoLeft}>
              <Text style={styles.displayName}>{selectedUser?.displayName || selectedUser?.email}</Text>
            </View>
            <TouchableOpacity
              style={styles.infoRight}
              onPress={() => {
                if (onPolisSelect) {
                  onPolisSelect(selectedPolis);
                }
              }}
            >
              <Text style={{ color: '#007AFF', fontWeight: 'bold', fontSize: 16 }}>View {selectedUser.displayName}'s City</Text>
            </TouchableOpacity>
            <View style={styles.infoRight}>
              <Text style={styles.infoStatLabel}>Posts</Text>
              <Text style={styles.infoStatValue}>{posts.length}</Text>
              {/* Add more stats/info here if needed */}
            </View>
          </ThemedView>}
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
                  <ThemedText style={styles.postTitle}>{post.title}</ThemedText>
                  <ThemedText style={styles.postDescription}>{post.description}</ThemedText>
                  <ThemedText style={styles.postDate}>{post.date}</ThemedText>
                  <ThemedText style={styles.postAuthor}>By: {post.author}</ThemedText>
                </TouchableOpacity>
              ))
            ) : selectedUser ? (
              <Text style={styles.noPosts}>No posts found for this user.</Text>
            ) : null}
          </ThemedView>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default DiscoverModal;

const styles = StyleSheet.create({
  infoDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(32,32,32,0.85)',
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
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  infoRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 60,
  },
  infoStatLabel: {
    color: '#bbb',
    fontSize: 12,
    fontWeight: '600',
  },
  infoStatValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2,
  },
  discoverView: {
    backgroundColor: 'transparent',
    flex: 1,
  },
  email: {
    fontSize: 16,
  },
  postsContainer: {
    zIndex: 1, // Lower than search suggestions
  },
  postsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  postItem: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  
  postTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  postDescription: {
    fontSize: 14,
    color: '#ddd',
    marginTop: 4,
  },
  postDate: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 4,
  },
  
  postDisplay: {
    marginTop: 20,
    backgroundColor: 'transparent',
  },

  postAuthor: {

  },
  noPosts: {
    fontSize: 16,
    color: 'gray',
  },
  searchBoxContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)', // subtle white tint
    padding: 10,
    borderRadius: 12,
    zIndex: 1000,
    position: 'relative',
    backdropFilter: 'blur(6px)', // NOTE: This works only on web/with BlurView on mobile
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
    color: '#333',
  },
  userItem: {
    backgroundColor: 'white',
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
    color: '#333',
    marginBottom: 4,
  },
  userName: {
    fontSize: 14,
    color: '#666',
  }, 
  suggestionBox: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginTop: 4,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    maxHeight: 200,
    overflow: 'scroll',
    zIndex: 1001,
  },
  
  
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
  },
  
  
});

import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { getPostbyAuthorID, getAllUsers } from '@/firebase/firestore';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import { UserInfo } from '@/types';
const DiscoverModal = ({ onPostSelect }: { onPostSelect: (post: any) => void }) => {
  const [open, setOpen] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [userInfoId, setUserInfoId] = useState<string>('');
  const textInputRef = useRef<TextInput>(null);
  const [searchText, setSearchText] = useState('');
  const [isTyping, setIsTyping] = useState<boolean>(false); 
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);

  useEffect(() => {
    console.log('DiscoverModal mounted or shown');
  
    // You can fetch data or run any logic here
    getAllUsers().then(setUsers);
  
  }, []); 

  useEffect(() => {
    if (userInfoId) {
      setFilteredUsers([]);
      getPostbyAuthorID(userInfoId).then((userPosts) => {
        setPosts(userPosts);
        console.log(userPosts);
      });
    }
  }, [userInfoId]);
  
  const handleSearchInputChange = (text: string) => {
    setSearchText(text);
  
    // Simple filter logic — customize as needed
    if (text.length > 0) {
      console.log(users)
      const matches = users.filter(user =>
        user.email.toLowerCase().includes(text.toLowerCase()) ||
        (user.displayName && user.displayName.toLowerCase().includes(text.toLowerCase()))
      );
      setFilteredUsers(matches);
    } else {
      setFilteredUsers([]);
    }
  };

  return (
    <View style={styles.discoverView}>
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
                <TouchableOpacity key={index} style={styles.suggestionItem} onPress={() => {
                  setUserInfoId(user.uid);
                  setSearchText(user.email)
                }}>
                  <Text style={styles.userName}>{user.displayName || 'No name'}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ThemedView >
        <ThemedView style={styles.postDisplay}>
        {posts.length > 0 && (
          posts.map((post, index) => (
            <TouchableOpacity key={index} style={styles.postItem} onPress={() => onPostSelect(post)}>
              <ThemedText style={styles.postTitle}>{post.title}</ThemedText>
              <ThemedText style={styles.postDescription}>{post.description}</ThemedText>
              <ThemedText style={styles.postDate}>{post.date}</ThemedText>
              <ThemedText style={styles.postAuthor}>By: {post.author}</ThemedText>
            </TouchableOpacity>
          ))
        )}
        </ThemedView>
      </View>
    </View>
  );
};

export default DiscoverModal;

const styles = StyleSheet.create({
  discoverView: {
    backgroundColor: 'transparent',
  },
  email: {
    fontSize: 16,
    color: 'blue',
  },
  postsContainer: {
    zIndex: 1, // Lower than search suggestions
  },
  postsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  postItem: {
    borderBottomWidth: 1,
    borderBottomColor: 'black'
  },
  postTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  postDescription: {
    fontSize: 14,
  },
  postDisplay: {
    marginTop: 20,
    backgroundColor: 'transparent',
  },
  postDate: {
    fontSize: 12,
    color: 'gray',
  },
  postAuthor: {

  },
  noPosts: {
    fontSize: 16,
    color: 'gray',
  },
  searchBoxContainer: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    zIndex: 1000,
    position: 'relative',
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
    top: 25, // Position below the search box
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 4,
    elevation: 10, // Android shadow - increased for better overlay
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    maxHeight: 200,
    overflow: 'scroll',
    zIndex: 1001, // Higher than searchBoxContainer
  },
  
  suggestionItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  }
  
});

import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { getPostbyAuthorID, getAllUsers } from '@/firebase/firestore';
import { ThemedView } from '@/components/ThemedView';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import { UserInfo } from '@/types';

const DiscoverModal = () => {
  const [open, setOpen] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [userInfoId, setUserInfoId] = useState(false);
  const textInputRef = useRef<TextInput>(null);
  const [searchText, setSearchText] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);

  useEffect(() => {
    console.log('DiscoverModal mounted or shown');
  
    // You can fetch data or run any logic here
    getAllUsers().then(setUsers);
  
  }, []); 
  
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
    />
  </View>

  {/* 👇 Suggestion Dropdown */}
  {filteredUsers.length > 0 && (
    <View style={styles.suggestionBox}>
      {filteredUsers.map((user, index) => (
        <TouchableOpacity key={index} style={styles.suggestionItem}>
          <Text style={styles.userName}>{user.displayName || 'No name'}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )}
</ThemedView>

  
        {/* Other post content goes here */}
      </View>
    </View>
  );

}

const styles = StyleSheet.create({
  discoverView: {
    backgroundColor: 'transparent',
  },
  email: {
    fontSize: 16,
    color: 'blue',
  },
  postsContainer: {
    marginTop: 20,
  },
  postsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  postItem: {
    marginBottom: 10,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  postDescription: {
    fontSize: 14,
  },
  postDate: {
    fontSize: 12,
    color: 'gray',
  },
  noPosts: {
    fontSize: 16,
    color: 'gray',
  },
  searchBoxContainer: {
    position: 'absolute',
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
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 4,
    elevation: 4, // Android shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxHeight: 200,
    overflow: 'scroll',
  },
  
  suggestionItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  }
  
});

export default DiscoverModal;   
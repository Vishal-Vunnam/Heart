import React, { useState, useRef } from 'react';
import { SafeAreaView, View, TextInput, StyleSheet, TouchableOpacity, Text, Pressable, Linking } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';
import Entypo from '@expo/vector-icons/Entypo';


export default function HomeScreen() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const textInputRef = useRef<TextInput>(null);

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
    textInputRef.current?.blur(); 
  };

  const locationTitle = "Pin Title";
  const geographicalLocation = "37°25'19.07\"N, 122°05'06.24\"W";
  const locationLink = "https://www.google.com/maps?q=37.4219999,-122.0840575"; // Example link for Google Maps
  const datePosted = "January 9, 2025";
  const author = "John Doe";
  
  // Handle the like button action
  const handleLike = () => {
    console.log("Liked!");
  };

  // Handle the comment button action
  const handleComment = () => {
    console.log("Commented!");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        {/* Navigation Bar */}
        <ThemedView style={styles.navBar}>
          <TouchableOpacity style={styles.navButton} onPress={toggleModal}>
            <Text style={styles.navButtonText}>Polis</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton}>
            <Text style={styles.navButtonText}>Vishal Vunnam</Text>
            <MaterialIcons name="account-circle" size={24} color="#fff" style={styles.accountIcon} />
          </TouchableOpacity>
        </ThemedView>

        {/* Map Placeholder */}
        <ThemedView style={styles.mapPlaceholder}>
          <Text style={styles.mapPlaceholderText}></Text>
          <TouchableOpacity onPress={toggleModal}>
            <Entypo name="location-pin" size={24} color="black" />
          </TouchableOpacity>
        </ThemedView>

        {/* Search Box */}
        <ThemedView style={styles.searchBoxContainer} >
          <View style={styles.searchBoxWrapper} >
            <EvilIcons name="search" size={24} color="#888" style={styles.icon} />
            <TextInput
              ref={textInputRef}
              style={styles.searchBox}
              placeholder="Search, #tag, location"
              placeholderTextColor="#888"
              onFocus={() => setIsModalVisible(false)}
            />
            
          </View>
        </ThemedView>

        {/* Popup Modal */}
        {isModalVisible && (
      <View style={styles.modalOverlay} pointerEvents="box-none">
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{locationTitle}</Text>
          <Text style={styles.modalMessage}>Location: 
            <Text 
              style={styles.link} 
              onPress={() => Linking.openURL(locationLink)}
            >
              {` ${geographicalLocation}`}
            </Text>
          </Text>
          <Text style={styles.modalMessage}>Date Posted: {datePosted}</Text>
          <Text style={styles.modalMessage}>Author: {author}</Text>
          
          <View >
            <TouchableOpacity style={styles.likeButton} onPress={handleLike}>
              <Text >Like</Text>
            </TouchableOpacity>
            <TouchableOpacity  onPress={handleComment}>
              <Text >Comment</Text>
            </TouchableOpacity>
            <Text style={styles.picHeader}>Pictures{"\n"}{"\n"}{"\n"}{"\n"}kj{"\n"}{"\n"}kj</Text>
          </View>
          
          <TouchableOpacity style={styles.closeButton} onPress={toggleModal}>
            <Feather name="x" size={20} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.triangle} />
      </View>
    )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: '#3f68df',
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
  },
  mapPlaceholderText: {
    color: '#888',
    fontSize: 18,
    fontWeight: 'bold',
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
    backgroundColor: 'transparent', // Transparent so background is usable
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
    borderLeftWidth: 30, // Adjust width for triangle size
    borderRightWidth: 30, // Adjust width for triangle size
    borderBottomWidth: 15, // Adjust height for triangle size
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'white', // Triangle color
    borderRadius: 10, // Rounds the edges
    transform: [{ rotate: '180deg' }], // Points the triangle downward
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
  }
});

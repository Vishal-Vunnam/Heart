import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import Feather from '@expo/vector-icons/Feather';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

export default function FriendsScreen() {
  const [isTyping, setIsTyping] = useState(false);
  const textInputRef = useRef<TextInput>(null); 

  const handleClearFocus = () => {
    setIsTyping(false);
    textInputRef.current?.blur(); 
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <View style={styles.searchBarContainer}>
          <View style={styles.searchBoxWrapper}>
            <EvilIcons name="search" size={24} color="#888" style={styles.icon} />
            <TextInput
              ref={textInputRef} // Attach ref to TextInput
              style={styles.searchBox}
              placeholder="Search, #tag, location"
              placeholderTextColor="#888"
              onFocus={() => setIsTyping(true)}
            />
            {isTyping && (
              <TouchableOpacity onPress={handleClearFocus} style={styles.closeButton}>
                <Text style={styles.closeButtonText}><Feather name="x-circle" size={24} color="#888" /></Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Function for whether the user is typing or not */}

        {!isTyping ? (
          <View style={styles.content}>
            <ThemedText>List of Friends will go here</ThemedText>
          </View>
        ) : (
          <View style={styles.searchContent}>
            <ThemedText>Search functionality goes here</ThemedText>
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
  searchBarContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  searchBoxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    backgroundColor: 'white',
    height: 40,
  },
  icon: {
    marginRight: 8,
  },
  searchBox: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
  },
  closeButton: {
    marginLeft: 10,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    padding: 10,
  },
});

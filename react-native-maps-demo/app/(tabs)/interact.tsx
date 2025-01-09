import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import your custom components here (use the correct import paths)
import EvilIcons from '@expo/vector-icons/EvilIcons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import  SearchScreen  from './search';  // Assuming search.tsx is in the same folder
import { NativeStackNavigationProp } from '@react-navigation/native-stack'; // Import the navigation types

type RootStackParamList = {
  Friends: undefined;
  SearchPage: undefined;
};

type FriendsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Friends'>;

interface FriendsPageProps {
  navigation: FriendsScreenNavigationProp;
}

const Stack = createNativeStackNavigator();

export default function FriendsScreen() {
  return (
    <NavigationIndependentTree>
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Friends"
          component={FriendsPage}
          options={{ title: 'Friends' }}
        />
        <Stack.Screen name="SearchPage" component={SearchScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    </NavigationIndependentTree>
  );
}

function FriendsPage({ navigation }: FriendsPageProps) {
  return (
    <ThemedView style={styles.container}>
      {/* Search Button at the top */}
      <View style={styles.searchBarContainer}>
        <TouchableOpacity 
          style={styles.searchButton} 
          onPress={() => navigation.navigate('SearchPage')}
        >
          <ThemedView style={styles.searchBoxContainer}>
        <View style={styles.searchBoxWrapper}>
          <EvilIcons name="search" size={24} color="#888" style={styles.icon} />
          <ThemedText style={styles.searchBox} >Search Friends</ThemedText>
        </View>
      </ThemedView>
        </TouchableOpacity>
      </View>

      {/* Friends list or content */}
      <View style={styles.content}>
        <ThemedText>List of Friends will go here</ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: Platform.OS === 'ios' ? 50 : 20, // Status bar space handling
  },
  searchBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchButton: {
    backgroundColor: '#1D3D47',
    borderRadius: 8,
    padding: 10,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
    flex: 1, // Ensures the TextInput takes up the remaining space
    fontSize: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: 20,
  },
});

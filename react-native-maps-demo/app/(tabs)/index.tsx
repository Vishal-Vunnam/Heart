import { SafeAreaView, View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {NavigationContainer} from '@react-navigation/native';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        {/* Navigation Bar */}
        <ThemedView style={styles.navBar}>
          <TouchableOpacity style={styles.navButton}>
            <Text style={styles.navButtonText}>Polis</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton}>
            <Text style={styles.navButtonText}>Vishal Vunnam</Text>
            <MaterialIcons name="account-circle" size={24} color="#fff" style={styles.accountIcon} />
          </TouchableOpacity>
        </ThemedView>


        {/* Empty Square (Map Placeholder) */}

      <ThemedView style={styles.mapPlaceholder}>
          <Text style={styles.mapPlaceholderText}>Map Placeholder</Text>
      </ThemedView>

        {/* Search Box */}
      <ThemedView style={styles.searchBoxContainer}>
        <View style={styles.searchBoxWrapper}>
          <EvilIcons name="search" size={24} color="#888" style={styles.icon} />
          <TextInput
            style={styles.searchBox}
            placeholder="Search, #tag, location"
            placeholderTextColor="#888"
          />
        </View>
      </ThemedView>


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
    marginRight: 4, // Adds spacing between the text and the icon
  },
  accountIcon: {
    color: '#ffffff', // Ensures it matches the theme of the nav bar
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
});

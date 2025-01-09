import { View, TextInput, StyleSheet, TouchableOpacity, Text, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // For navigation to the search page
import { ThemedText } from '@/components/ThemedText';

export default function TabTwoScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBoxWrapper}>
        <TextInput
          style={styles.searchBox}
          placeholder="Search, #tag, location"
          placeholderTextColor="#888"
        />
        <TouchableOpacity onPress={() => navigation.navigate('/search.tsx')} style={styles.searchButton}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Chat Area */}
      <View style={styles.chatArea}>
        <ThemedText>Welcome to the chat page</ThemedText>
        {/* This can be expanded with messages and chat UI */}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchBoxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
  },
  searchBox: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    fontSize: 16,
  },
  searchButton: {
    padding: 8,
    backgroundColor: '#1D3D47',
    borderRadius: 8,
    marginLeft: 8,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  chatArea: {
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

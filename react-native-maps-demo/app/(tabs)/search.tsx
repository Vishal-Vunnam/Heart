import { View, Text, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';

export default function SearchPage() {
  return (
    <ThemedView style={styles.container}>
      <Text style={styles.header}>Search for Friends</Text>
      {/* Implement friend search functionality here */}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

import { Stack, Link } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';
import { ThemedView } from '@/components/ThemedView';

import React from 'react';

export default function HomePage() {
  return (
    <>
      <Stack.Screen options={{ title: 'Welcome' }} />
      <ThemedView style={styles.container}>
        <Text style={styles.title}>Welcome to Heart!</Text>
        <Text style={styles.subtitle}>Your map-based social experience.</Text>
        <Link href="/(tabs)" style={styles.button}>
          <Text style={styles.buttonText}>Enter App</Text>
        </Link>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#3f68df',
  },
  subtitle: {
    fontSize: 18,
    color: '#555',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#3f68df',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 
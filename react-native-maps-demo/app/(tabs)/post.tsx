import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import DropDownPicker from 'react-native-dropdown-picker';

export default function SearchPage() {
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [postVisibility, setPostVisibility] = useState('Public');
  const [open, setOpen] = useState(false);

  const handlePostLocation = () => {
    console.log('Location:', location);
    console.log('Description:', description);
    console.log('Visibility:', postVisibility);

    setLocation('');
    setDescription('');
    setPostVisibility('Public');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <ThemedView style={styles.container}>
            <Text style={styles.header}>New Post</Text>

            <View style={styles.inputCard}>
              <TextInput
                style={styles.input}
                placeholder="Location Title"
                value={location}
                onChangeText={setLocation}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputCard}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description"
                value={description}
                onChangeText={setDescription}
                multiline
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputCard}>
              <Text style={styles.label}>Visibility</Text>
              <DropDownPicker
                open={open}
                value={postVisibility}
                items={[
                  { label: 'Public', value: 'Public' },
                  { label: 'Private', value: 'Private' },
                ]}
                setOpen={setOpen}
                setValue={setPostVisibility}
                style={styles.picker}
                dropDownContainerStyle={styles.dropdownStyle}
                textStyle={{ fontSize: 14 }}
              />
            </View>
          </ThemedView>
        </ScrollView>

        {/* Floating Post Button */}
        <TouchableOpacity style={styles.fab} onPress={handlePostLocation}>
          <Text style={styles.fabText}>Post</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    padding: 20,
  },
  container: {
    flex: 1,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 20,
  },
  inputCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  input: {
    fontSize: 16,
    color: '#222',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: '#444',
  },
  picker: {
    borderColor: '#ccc',
    borderRadius: 8,
  },
  dropdownStyle: {
    borderColor: '#ccc',
    borderRadius: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

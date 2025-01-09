import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, SafeAreaView } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import DropDownPicker from 'react-native-dropdown-picker'; // Import dropdown component

export default function SearchPage() {
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [postVisibility, setPostVisibility] = useState('Public');
  const [open, setOpen] = useState(false);

  const handlePostLocation = () => {
    // Handle location post logic here
    console.log('Location:', location);
    console.log('Description:', description);
    console.log('Visibility:', postVisibility); // Output visibility (Public/Private)
    // Reset fields after posting
    setLocation('');
    setDescription('');
    setPostVisibility('Public'); // Reset to default visibility
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Location Name"
          value={location}
          onChangeText={setLocation}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        
        {/* Dropdown for selecting visibility */}
        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Visibility</Text>
          <DropDownPicker
            open={open} // For dropdown to be closed by default
            value={postVisibility}
            items={[
              { label: 'Public', value: 'Public' },
              { label: 'Private', value: 'Private' },
            ]}
            setOpen={setOpen} // Open and close handling logic can be added here
            setValue={setPostVisibility} // Update the visibility state
            style={styles.picker}
          />
        </View>

        {/* Post Button */}
        <TouchableOpacity style={styles.button} onPress={handlePostLocation}>
          <Text style={styles.buttonText}>Post Location</Text>
        </TouchableOpacity>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1, // Ensures that the view takes up the entire screen
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20, // Padding around the container
    backgroundColor: '#f5f5f5',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    fontSize: 16,
    width: '100%', // Ensures the input fields take the full width
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    marginBottom: 20,
    width: '100%', // Ensures the picker takes full width
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  picker: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: 'white',
    width: '100%', // Ensures the picker takes full width
  },
  dropdownStyle: {
    backgroundColor: '#f9f9f9',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
  },
  button: {
    position: 'absolute',
    backgroundColor: '#007bff',
    paddingVertical: 12,
    bottom: 200,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%', // Ensures button takes full width
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

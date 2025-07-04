import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Modal } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import DropDownPicker from 'react-native-dropdown-picker';

// PostModal Component
interface PostModalProps {
  userId: string;
  userName: string;
  visible: boolean;
  onClose: () => void;
  currentLocation: any;
  onPost: (postData: any) => void;
}

const PostModal = ({userId, userName, visible, onClose, currentLocation, onPost }: PostModalProps) => {
  const [locationTitle, setLocationTitle] = useState('');
  const [description, setDescription] = useState('');
  const [postVisibility, setPostVisibility] = useState('Public');
  const [open, setOpen] = useState(false);

  const handlePostLocation = () => {
    if (!currentLocation) {
      console.error("No location data available");
      return;
    }
    
    const postData = {
      title: locationTitle,
      location: currentLocation,
      authorId: userId,
      date: new Date().toISOString(),
      description: description,
      authorName: userName,
      visibility: postVisibility,
    };
    onPost(postData);
    // Reset fields
    setLocationTitle('');
    setDescription('');
    setPostVisibility('Public');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={modalStyles.overlay}>
        <View style={modalStyles.modalContent}>
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>Create Post</Text>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
              <Feather name="x" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={modalStyles.input}
            placeholder="Location Title"
            value={locationTitle}
            onChangeText={setLocationTitle}
          />
          <TextInput
            style={[modalStyles.input, modalStyles.textArea]}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          
          <View style={modalStyles.pickerContainer}>
            <Text style={modalStyles.label}>Visibility</Text>
            <DropDownPicker
              open={open}
              value={postVisibility}
              items={[
                { label: 'Public', value: 'Public' },
                { label: 'Private', value: 'Private' },
              ]}
              setOpen={setOpen}
              setValue={setPostVisibility}
              style={modalStyles.picker}
            />
          </View>

          <TouchableOpacity style={modalStyles.button} onPress={handlePostLocation}>
            <Text style={modalStyles.buttonText}>Post Location</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    fontSize: 16,
    width: '100%',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    marginBottom: 20,
    width: '100%',
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
    width: '100%',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PostModal; 
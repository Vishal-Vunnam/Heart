import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Modal, Image, Alert } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import DropDownPicker from 'react-native-dropdown-picker';
import * as ImagePicker from 'expo-image-picker';
import type { PostRequestInfo } from '@/types';
// import { uploadImage, generateFileName } from '@/firebase/blob-storage';

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
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const pickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map(asset => asset.uri);
        setSelectedImages(prev => [...prev, ...newImages]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  

  const handlePostLocation = async () => {
    // Example: Gather post data from form state or props
    const postData: PostRequestInfo = {
      title: locationTitle, // assume you have title in state/props
      location: currentLocation, // assume you have location in state/props
      authorId: userId, // assume you have userId in state/props
      author: userName, // assume you have authorName in state/props
      images: selectedImages, // assume you have localImageUris: string[]
      description: description, // assume you have description in state/props
      tags: [], // assume you have tags in state/props (optional)
    };
    try {
      await onPost(postData);
      // Optionally, handle success (e.g., close modal, show message)
      if (typeof onClose === 'function') {
        onClose();
      }
    } catch (error) {
      // Optionally, handle error (e.g., show error message)
      console.error('Failed to add post:', error);
    }
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
          
          {/* Image Upload Section */}
          <View style={modalStyles.imageSection}>
            <Text style={modalStyles.label}>Add Images (Optional)</Text>
            <TouchableOpacity style={modalStyles.imagePickerButton} onPress={pickImage}>
              <MaterialIcons name="add-photo-alternate" size={24} color="#007bff" />
              <Text style={modalStyles.imagePickerText}>Add Images</Text>
            </TouchableOpacity>
            
            {/* Image Preview */}
            {selectedImages.length > 0 && (
              <View style={modalStyles.imagePreviewContainer}>
                {selectedImages.map((uri, index) => (
                  <View key={index} style={modalStyles.imagePreviewWrapper}>
                    <Image source={{ uri }} style={modalStyles.imagePreview} />
                    <TouchableOpacity 
                      style={modalStyles.removeImageButton}
                      onPress={() => removeImage(index)}
                    >
                      <Feather name="x" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
          
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

          <TouchableOpacity 
            style={[modalStyles.button, isUploading && modalStyles.buttonDisabled]} 
            onPress={handlePostLocation}
            disabled={isUploading}
          >
            <Text style={modalStyles.buttonText}>
              {isUploading ? 'Uploading...' : 'Post Location'}
            </Text>
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
    maxHeight: '90%',
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
  imageSection: {
    marginBottom: 20,
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#007bff',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 15,
    marginTop: 5,
  },
  imagePickerText: {
    color: '#007bff',
    fontSize: 16,
    marginLeft: 8,
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 10,
  },
  imagePreviewWrapper: {
    position: 'relative',
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PostModal; 
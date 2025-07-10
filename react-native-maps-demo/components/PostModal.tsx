import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Modal, Image, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
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
  // 1. Add state for tab selection
  const [activeTab, setActiveTab] = useState<'post' | 'event'>('post');

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
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}
        >
          <View style={[modalStyles.modalContent, { padding: 0, maxHeight: '90%', width: '90%' }]}> 
            <ScrollView
              contentContainerStyle={{ padding: 20 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={modalStyles.title}>Create Post</Text>
                <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
                  <Feather name="x" size={24} color="#000" />
                </TouchableOpacity>
              </View>
              {/* Add tab buttons below the header in the modal */}
              <View style={modalStyles.tabContainer}>
                <TouchableOpacity
                  style={[
                    modalStyles.tabButton,
                    activeTab === 'post' && modalStyles.tabButtonActive,
                  ]}
                  onPress={() => setActiveTab('post')}
                >
                  <Text style={[
                    modalStyles.tabButtonText,
                    activeTab === 'post' && modalStyles.tabButtonTextActive,
                  ]}>Post</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    modalStyles.tabButton,
                    activeTab === 'event' && modalStyles.tabButtonActive,
                  ]}
                  onPress={() => setActiveTab('event')}
                >
                  <Text style={[
                    modalStyles.tabButtonText,
                    activeTab === 'event' && modalStyles.tabButtonTextActive,
                  ]}>Event</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={modalStyles.input}
                placeholder="Location Title"
                placeholderTextColor="#888"
                value={locationTitle}
                onChangeText={setLocationTitle}
              />
              <TextInput
                style={[modalStyles.input, modalStyles.textArea]}
                placeholder="Description"
                placeholderTextColor="#888"
                value={description}
                onChangeText={setDescription}
                multiline
              />
              {activeTab == 'event' && (
                <View>
                  <Text style={modalStyles.label}>Event Start Time</Text>
                  <TextInput
                    style={modalStyles.input}
                    placeholder="Start Time (e.g. 2024-07-04 18:00)"
                    placeholderTextColor="#888"
                    // value={eventStartTime}
                    // onChangeText={setEventStartTime}
                  />
                  <Text style={modalStyles.label}>Event End Time</Text>
                  <TextInput
                    style={modalStyles.input}
                    placeholder="End Time (e.g. 2024-07-04 20:00)"
                    placeholderTextColor="#888"
                    // value={eventEndTime}
                    // onChangeText={setEventEndTime}
                  />
                </View>
              )}
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
                <Text style={[modalStyles.label, { color: '#8888' }]}>Visibility</Text>
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
                  textStyle={{ color: '#888' }}
                  dropDownContainerStyle={modalStyles.pickerDropdown}
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
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.36)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'rgb(1, 25, 56)',
    borderRadius: 16,
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
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
  },
  closeButton: {
    padding: 6,
    backgroundColor: 'white',
    borderRadius: 20,
  },
  input: {
    backgroundColor: 'rgb(255, 255, 255)',
    color: 'white',
    height: 44,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  label: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '600',
  },
  pickerContainer: {
    marginBottom: 20,
  },
  picker: {
    backgroundColor: 'white',
    borderColor: '#444',
    color: 'black',
  },
  pickerDropdown: {
    backgroundColor: 'white',
    borderColor: '#444',
    borderRadius: 10,
    marginTop: 2,
    zIndex: 1000,
  },
  imageSection: {
    marginBottom: 24,
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'black',
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginTop: 6,
    backgroundColor: 'white',
  },
  imagePickerText: {
    color: 'black',
    fontSize: 15,
    marginLeft: 8,
    fontWeight: '500',
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 12,
  },
  imagePreviewWrapper: {
    position: 'relative',
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  removeImageButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#ff4444',
    borderRadius: 12,
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 4,
  },
  button: {
    backgroundColor: 'white',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#555',
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '600',
  },
  // Add styles for the tab bar
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    marginTop: 4,
  },
  tabButton: {
    flex: 1,
    backgroundColor: 'rgba(1, 25, 56, 0.55)',
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: 'rgba(1, 25, 56, 0.55)',
    borderColor: 'white',
    borderWidth: 1,
    borderStyle: 'dotted',
  },
  tabButtonText: {
    color: '#aaa',
    fontSize: 16,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: '#fff',
  },
});


export default PostModal; 
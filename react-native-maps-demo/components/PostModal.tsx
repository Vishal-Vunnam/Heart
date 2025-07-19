import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Modal, Image, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import DropDownPicker from 'react-native-dropdown-picker';
import * as ImagePicker from 'expo-image-picker';
import { getBase64 } from '@/functions/imageToBase64';
import type { PostInfo } from '@/types/types';
import { uploadImageToPost } from '@/api/image';
import { getCurrentUser } from '@/auth/fireAuth';
// import { uploadImage, generateFileName } from '@/firebase/blob-storage';
import { createPost } from '@/api/posts';
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

  // Tag input state
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const pickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images.');
        return;
      }
      console.log("[icking image")

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

  // Tag input handlers
  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed.length > 0 && !tags.includes(trimmed)) {
      setTags(prev => [...prev, trimmed]);
      setTagInput('');
    }
  };

  const handleTagInputChange = (text: string) => {
    // If user types comma or space, add tag
    if (text.endsWith(',') || text.endsWith(' ')) {
      const trimmed = text.trim().replace(/,$/, '');
      if (trimmed.length > 0 && !tags.includes(trimmed)) {
        setTags(prev => [...prev, trimmed]);
      }
      setTagInput('');
    } else {
      setTagInput(text);
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(prev => prev.filter((_, i) => i !== index));
  };

  const handlePostLocation = async () => {
    try {
      setIsUploading(true);

      // Get the current user object
      const user = getCurrentUser?.();
      if (!user || !user.uid) {
        Alert.alert('Error', 'You must be logged in to post.');
        setIsUploading(false);
        return;
      }

      Alert.alert("test")

      // Compose the post info object for submission
      const postInfo: PostInfo = {

              title: locationTitle.trim(),
              description: description.trim(),
              latitude: currentLocation?.latitude ?? 0,
              longitude: currentLocation?.longitude ?? 0,
              latitudeDelta: currentLocation?.latitudeDelta ?? 0.01,
              longitudeDelta: currentLocation?.longitudeDelta ?? 0.01,
              date: new Date().toISOString(),
              userId: user.uid,
              type: 'post',
            }
      

      // Create the post
      console.log("Here")
      const createdPost = await createPost(postInfo);
      console.log("HEHEHEHE", selectedImages)
      if (selectedImages.length > 0) {
        for (const imageUri of selectedImages) {
          const base64Image = await getBase64(imageUri);
          await uploadImageToPost(base64Image, createdPost.postId);
        }
      }

      setIsUploading(false);
      Alert.alert('Success', 'Post created successfully!');
      onClose();
      // Optionally, reset form fields here
      setLocationTitle('');
      setDescription('');
      setSelectedImages([]);
      setTags([]);
      setTagInput('');
      // setEventStartTime('');
      // setEventEndTime('');
    } catch (error) {
      setIsUploading(false);
      console.error('Error posting location:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
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
              {/* Tag Input Section */}
              <View style={modalStyles.tagSection}>
                <Text style={modalStyles.label}>Tags (Optional)</Text>
                <View style={modalStyles.tagInputRow}>
                  <TextInput
                    style={[modalStyles.input, modalStyles.tagInput]}
                    placeholder="Add tag and press enter, comma, or space"
                    placeholderTextColor="#888"
                    value={tagInput}
                    onChangeText={handleTagInputChange}
                    onSubmitEditing={handleAddTag}
                    blurOnSubmit={false}
                    returnKeyType="done"
                  />
                  <TouchableOpacity
                    style={modalStyles.addTagButton}
                    onPress={handleAddTag}
                  >
                    <Feather name="plus" size={18} color="#007bff" />
                  </TouchableOpacity>
                </View>
                {/* Tag Chips */}
                <View style={modalStyles.tagChipsContainer}>
                  {tags.map((tag, idx) => (
                    <View key={idx} style={modalStyles.tagChip}>
                      <Text style={modalStyles.tagChipText}>#{tag}</Text>
                      <TouchableOpacity
                        style={modalStyles.removeTagButton}
                        onPress={() => handleRemoveTag(idx)}
                      >
                        <Feather name="x" size={14} color="white" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
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
    color: 'black',
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
    color: 'black'
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
  // Tag input and chips styles
  tagSection: {
    marginBottom: 18,
  },
  tagInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tagInput: {
    flex: 1,
    marginBottom: 0,
    marginRight: 8,
    color: 'black',
  },
  addTagButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  tagChipText: {
    color: 'black',
    fontSize: 14,
    marginRight: 4,
  },
  removeTagButton: {
    backgroundColor: '#ff4444',
    borderRadius: 10,
    padding: 2,
    marginLeft: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PostModal; 
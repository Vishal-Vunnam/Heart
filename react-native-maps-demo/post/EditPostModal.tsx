import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
  Image,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import type { DisplayPostInfo, EventInfo } from '@/types/types';
import { getPost } from '@/services/api/posts';
import { FlipInXDown } from 'react-native-reanimated';
import { getRandomColor } from '@/functions/getRandomColor';
import ProtectedImage from '@/components/ProtectedImage';
import { editPost } from '@/services/api/posts';
import { ImageType } from '@/types/types';
import { deleteImagesFromPost } from '@/services/api/image';
// Placeholder for getImageUrlWithSAS and deleteFromAzureBlob
const getImageUrlWithSAS = (uri: string) => uri;
const deleteFromAzureBlob = async (uri: string) => {};

interface EditPostModalProps {
  onClose: () => void;
  oldPostId: string;
  onEdit: () => void;
}

const EditPostModal: React.FC<EditPostModalProps> = ({
  onClose,
  oldPostId,
  onEdit,
}) => {
  // Form state
  const [locationTitle, setLocationTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedImages, setSelectedImages] = useState<ImageType[]>([]);
  const [newImages, setNewImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'post' | 'event'>('post');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [originalImages, setOriginalImages] = useState<string[]>([]);
  const [eventStartTime, setEventStartTime] = useState('');
  const [eventEndTime, setEventEndTime] = useState('');
  const [deletedImages, setDeletedImages] = useState<ImageType[]>([]);
  // Post data state
  const [oldPostInfo, setOldPostInfo] = useState<DisplayPostInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load existing post data
  useEffect(() => {
    if (oldPostId) {
      const fetchData = async () => {
        try {
          setIsLoading(true);
          setLoadError(null);
          
          const postTemp = await getPost(oldPostId);
          setOldPostInfo(postTemp);
          // Pre-populate form fields with existing data
          if (postTemp) {
            // Basic post info
            setLocationTitle(postTemp.postInfo.title || '');
            setDescription(postTemp.postInfo.description || '');
            console.log("here");
            // Images
            const existingImages = postTemp.images || [];
            setSelectedImages(existingImages);
            setOriginalImages(existingImages);
            
            // Post type
            setActiveTab(postTemp.postInfo.type || 'post');
            
          }
        } catch (error) {
          console.error("Failed to fetch post:", error);
          setLoadError("Failed to load post data. Please try again.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, []);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission needed',
          'Please grant camera roll permissions to upload images.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map((asset) => asset.uri);
        setNewImages((prev) => [...prev, ...newImages]);
        console.log(newImages);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const removeImage = (index: number) => {
    setDeletedImages([...deletedImages, selectedImages[index]]);
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    
  };

  const removeNewImage = (index: number) => { 
        setNewImages((prev) => prev.filter((_, i) => i !== index));
  }

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed.length > 0 && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
      setTagInput('');
    }
  };

  const handleTagInputChange = (text: string) => {
    if (text.endsWith(',') || text.endsWith(' ')) {
      const trimmed = text.trim().replace(/,$/, '');
      if (trimmed.length > 0 && !tags.includes(trimmed)) {
        setTags((prev) => [...prev, trimmed]);
      }
      setTagInput('');
    } else {
      setTagInput(text);
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEditSubmit = async () => {
    if (!oldPostInfo) {
      Alert.alert('Error', 'Post data not loaded. Please try again.');
      return;
    }

    // Basic validation
    if (!locationTitle.trim()) {
      Alert.alert('Error', 'Please enter a location title.');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description.');
      return;
    }

    // Event-specific validation
    if (activeTab === 'event') {
      if (!eventStartTime.trim() || !eventEndTime.trim()) {
        Alert.alert('Error', 'Please enter both start and end times for the event.');
        return;
      }
    }

    setIsUploading(true);

    try {
      // Compose edited post
      const editedPost = {
          postId: oldPostId,
          title: locationTitle.trim() ?  locationTitle.trim() : oldPostInfo.postInfo.title,
          description: description.trim() ? description.trim() : oldPostInfo.postInfo.description,
      }

      // Here you would typically call your API to update the post
      await editPost(editedPost);

      await deleteImagesFromPost(deletedImages);


      Alert.alert('Success', 'Post updated successfully!');
      onEdit(); 
    } catch (error) {
      console.error('Error updating post:', error);
      Alert.alert('Error', 'Failed to update post. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRetryLoad = () => {
    // Trigger re-fetch by updating a dependency
    setLoadError(null);
    setIsLoading(true);
    // The useEffect will run again
  };

  // Loading state
  if (isLoading) {
    return (
      <Modal transparent animationType="fade" visible>
        <View style={modalStyles.overlay}>
          <View style={[modalStyles.modalContent, { justifyContent: 'center', alignItems: 'center' }]}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={[modalStyles.title, { marginTop: 16, textAlign: 'center' }]}>
              Loading post data...
            </Text>
          </View>
        </View>
      </Modal>
    );
  }

  // Error state
  if (loadError || !oldPostInfo) {
    return (
      <Modal transparent animationType="fade" visible>
        <View style={modalStyles.overlay}>
          <View style={modalStyles.modalContent}>
            <View style={modalStyles.header}>
              <Text style={modalStyles.title}>Error</Text>
              <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
                <Feather name="x" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <Text style={[modalStyles.label, { color: '#ff4444', textAlign: 'center', marginBottom: 20 }]}>
              {loadError || 'Failed to load post data'}
            </Text>
            <TouchableOpacity style={modalStyles.button} onPress={handleRetryLoad}>
              <Text style={modalStyles.buttonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal transparent animationType="fade" visible>
      <View style={modalStyles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
          }}
        >
          <View
            style={[
              modalStyles.modalContent,
              { padding: 0, maxHeight: '90%', width: '90%' },
            ]}
          >
            <ScrollView
              contentContainerStyle={{ padding: 20 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={modalStyles.header}>
                <Text style={modalStyles.title}>Edit Post</Text>
                <TouchableOpacity
                  onPress={onClose}
                  style={modalStyles.closeButton}
                >
                  <Feather name="x" size={24} color="#000" />
                </TouchableOpacity>
              </View>

              {/* Tab Buttons */}
              <View style={modalStyles.tabContainer}>
                <TouchableOpacity
                  style={[
                    modalStyles.tabButton,
                    activeTab === 'post' && modalStyles.tabButtonActive,
                  ]}
                  onPress={() => setActiveTab('post')}
                >
                  <Text
                    style={[
                      modalStyles.tabButtonText,
                      activeTab === 'post' && modalStyles.tabButtonTextActive,
                    ]}
                  >
                    Post
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    modalStyles.tabButton,
                    activeTab === 'event' && modalStyles.tabButtonActive,
                  ]}
                  onPress={() => {
                    Alert.alert("Coming Soon", "This feature isn’t available yet.");
                    // setActiveTab('event'); // leave this commented until implemented
                  }}
                >
                  <Text
                    style={[
                      modalStyles.tabButtonText,
                      activeTab === 'event' && modalStyles.tabButtonTextActive,
                    ]}
                  >
                    Event
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={modalStyles.label}>Location Title</Text>
              <TextInput
                style={modalStyles.input}
                placeholder="Location Title"
                placeholderTextColor="#888"
                value={locationTitle}
                onChangeText={setLocationTitle}
              />

              <Text style={modalStyles.label}>Description</Text>
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

              {activeTab === 'event' && (
                <View>
                  <Text style={modalStyles.label}>Event Start Time</Text>
                  <TextInput
                    style={modalStyles.input}
                    placeholder="Start Time (e.g. 2024-07-04 18:00)"
                    placeholderTextColor="#888"
                    value={eventStartTime}
                    onChangeText={setEventStartTime}
                  />
                  <Text style={modalStyles.label}>Event End Time</Text>
                  <TextInput
                    style={modalStyles.input}
                    placeholder="End Time (e.g. 2024-07-04 20:00)"
                    placeholderTextColor="#888"
                    value={eventEndTime}
                    onChangeText={setEventEndTime}
                  />
                </View>
              )}

              {/* Image Upload Section */}
              <View style={modalStyles.imageSection}>
                <Text style={modalStyles.label}>Images ({selectedImages.length})</Text>
                <TouchableOpacity
                  style={modalStyles.imagePickerButton}
                  onPress={pickImage}
                >
                  <MaterialIcons
                    name="add-photo-alternate"
                    size={24}
                    color="#007bff"
                  />
                  <Text style={modalStyles.imagePickerText}>Add Images</Text>
                </TouchableOpacity>
                {/* Image Preview */}
                {(selectedImages.length > 0 || newImages.length > 0) && (
                  <View style={modalStyles.imagePreviewContainer}>
                    {selectedImages.map((image, index) => {
                      console.log("image", image);
                      return (
                        <View key={index} style={modalStyles.imagePreviewWrapper}>
                         <ProtectedImage
                          url= {image.imageUrl}
                          showBorder={true}
                          style={modalStyles.image}
                          >
                          </ProtectedImage>
                          <TouchableOpacity
                            style={modalStyles.removeImageButton}
                            onPress={() => removeImage(index)}
                          >
                            <Feather name="x" size={16} color="white" />
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                {newImages.map((image, index) => {

                  return (
                    <View key={index} style={modalStyles.imagePreviewWrapper}>
                      <Image
                        source={{uri: image}}
                        style={modalStyles.image}
                      />
                      <TouchableOpacity
                        style={modalStyles.removeImageButton}
                        onPress={() => removeNewImage(index)}
                      >
                        <Feather name="x" size={16} color="white" />
                      </TouchableOpacity>
                    </View>
                  );
                })}
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={[
                  modalStyles.button,
                  isUploading && modalStyles.buttonDisabled,
                ]}
                onPress={handleEditSubmit}
                disabled={isUploading}
              >
                <Text style={[
                  modalStyles.buttonText,
                  isUploading && modalStyles.buttonTextDisabled
                ]}>
                  {isUploading ? 'Saving Changes...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};


// Consistent color palette
const COLORS = {
  // Base colors
  white: '#fffdfdff',
  black: '#000000',
  transparent: 'transparent',
  
  // Primary theme colors
  primary: 'rgba(255, 255, 255, 1)',
  primaryTransparent: 'rgba(255, 255, 255, 1)',
  
  // Grays
  lightGray: '#aaa',
  mediumGray: '#555',
  darkGray: '#444',
  
  // Overlay
  modalOverlay: 'rgba(0, 0, 0, 0.36)',
  
  // Accent colors
  accent: '#007bff',
  error: '#ff4444',
  
  // Shadow
  shadowColor: '#000000',
};

// Consistent font families (assuming same as main app)
const FONTS = {
  primary: 'Koulen_400Regular',
  secondary: 'Anton_400Regular',
  system: 'System', // Fallback for inputs
};

// Consistent spacing
const SPACING = {
  xs: 2,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 10,
  xxl: 12,
  xxxl: 14,
  xxxxl: 16,
  xxxxxl: 18,
  xxxxxxl: 20,
  xxxxxxxl: 24,
};

// Consistent border radius
const BORDER_RADIUS = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 16,
  xxl: 20,
  pill: 50,
};

// Consistent sizes
const SIZES = {
  buttonHeight: 44,
  inputHeight: 44,
  textAreaHeight: 100,
  imagePreview: 80,
  closeButton: 40,
  removeButton: 22,
  tagChipHeight: 32,
};

// Consistent elevation/shadows
const ELEVATION = {
  small: {
    shadowColor: COLORS.shadowColor,
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 4,
  },
  medium: {
    shadowColor: COLORS.shadowColor,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
};

const modalStyles = StyleSheet.create({
  // Modal container
  overlay: {
    flex: 1,
    backgroundColor: COLORS.modalOverlay,
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.xl,
    borderColor: COLORS.black,
    borderWidth: 3, 
    padding: SPACING.xxxxxxl,
    width: '90%',
    maxHeight: '90%',
    ...ELEVATION.medium,
  },

  // Header section
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xxxxxxl,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.black,
    fontFamily: FONTS.secondary,
  },

  closeButton: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xxl,
    width: SIZES.closeButton,
    height: SIZES.closeButton,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Form inputs
  label: {
    color: COLORS.black,
    fontSize: 14,
    marginBottom: SPACING.md,
    fontWeight: '600',
    fontFamily: FONTS.secondary,
  },

  input: {
    backgroundColor: COLORS.white,
    color: COLORS.black,
    height: SIZES.inputHeight,
    borderRadius: BORDER_RADIUS.md,
    borderColor: COLORS.black,
    borderWidth: 3, 
    paddingHorizontal: SPACING.xxl,
    marginBottom: SPACING.xxxxl,
    fontSize: 16,
    fontFamily: FONTS.system,
        borderStyle: 'dotted',
  },

  textArea: {
    height: SIZES.textAreaHeight,
    textAlignVertical: 'top',
    paddingTop: SPACING.xxl,
  },

  // Picker styles
  pickerContainer: {
    marginBottom: SPACING.xxxxxxl,
  },

  picker: {
    backgroundColor: COLORS.white,
    
    borderColor: COLORS.darkGray,
    color: COLORS.black,
    borderRadius: BORDER_RADIUS.md,
  },

  pickerDropdown: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.darkGray,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.xs,
    zIndex: 1000,
    ...ELEVATION.small,
  },

  // Image section
  imageSection: {
    marginBottom: SPACING.xxxxxxxl,
  },

  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.black,
    borderStyle: 'dashed',
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.xxxl,
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.md,
    backgroundColor: COLORS.white,
  },

  imagePickerText: {
    color: COLORS.black,
    fontSize: 15,
    marginLeft: SPACING.lg,
    fontWeight: '500',
    fontFamily: FONTS.secondary,
  },

  imagePreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.xxl,
    gap: SPACING.xxl,
  },

  imagePreviewWrapper: {
    position: 'relative',
  },

  imagePreview: {
    width: SIZES.imagePreview,
    height: SIZES.imagePreview,
    borderRadius: BORDER_RADIUS.md,
  },

  removeImageButton: {
    position: 'absolute',
    top: -SPACING.md,
    right: -SPACING.md,
    backgroundColor: COLORS.error,
    borderRadius: SPACING.xxl,
    width: SIZES.removeButton,
    height: SIZES.removeButton,
    justifyContent: 'center',
    alignItems: 'center',
    ...ELEVATION.small,
  },
    image: {
    width: 90,
    height: 90,
    borderRadius: 14,
  },

  // Tab section
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.xxxxl,
    marginTop: SPACING.sm,
  },

  tabButton: {
    flex: 1,
    backgroundColor: COLORS.primaryTransparent,
    paddingVertical: SPACING.xl,
    borderRadius: BORDER_RADIUS.md,
    // borderColor: COLORS.black,
    // borderWidth: 3, 
    marginHorizontal: SPACING.sm,
    alignItems: 'center',
  },

  tabButtonActive: {
    backgroundColor: COLORS.primaryTransparent,
    borderColor: COLORS.black,
    borderWidth: 1,
    borderStyle: 'dotted',
  },

  tabButtonText: {
    color: COLORS.black,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.secondary,
  },

  tabButtonTextActive: {
    color: getRandomColor(),
  },

  // Tag section
  tagSection: {
    marginBottom: SPACING.xxxxxl,
  },

  tagInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },

  tagInput: {
    flex: 1,
    marginBottom: 0,
    marginRight: SPACING.lg,
    color: COLORS.black,
  },

  addTagButton: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: SIZES.buttonHeight,
    height: SIZES.buttonHeight,
  },

  tagChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.lg,
  },

  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    minHeight: SIZES.tagChipHeight,
  },

  tagChipText: {
    color: COLORS.white, // Changed to white for better contrast on accent background
    fontSize: 14,
    marginRight: SPACING.sm,
    fontFamily: FONTS.secondary,
  },

  removeTagButton: {
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.xs,
    marginLeft: SPACING.xs,
    justifyContent: 'center',
    alignItems: 'center',
    width: SPACING.xxxxl,
    height: SPACING.xxxxl,
  },

  // Action buttons
  button: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.xxxl,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    width: '100%',
    marginTop: SPACING.xl,
    height: SIZES.buttonHeight,
    justifyContent: 'center',
    ...ELEVATION.small,
  },

  buttonDisabled: {
    backgroundColor: COLORS.mediumGray,
  },

  buttonText: {
    color: COLORS.black,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.secondary,
  },

  buttonTextDisabled: {
    color: COLORS.lightGray,
  },
});

export default EditPostModal;
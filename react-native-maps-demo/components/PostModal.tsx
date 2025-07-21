import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Modal, Image, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import DropDownPicker from 'react-native-dropdown-picker';
import * as ImagePicker from 'expo-image-picker';
import { getBase64 } from '@/functions/imageToBase64';
import type { PostInfo, UserSearchReturn, PolisSearchReturn } from '@/types/types';
import { uploadImageToPost } from '@/api/image';
import { getCurrentUser } from '@/auth/fireAuth';
import { createPost } from '@/api/posts';
import { searchUsers} from '@/api/search';

interface PostModalProps {
  userId: string;
  userName: string;
  visible: boolean;
  onClose: () => void;
  currentLocation: any;
  onPost: () => void;
}

const PostModal = ({userId, userName, visible, onClose, currentLocation, onPost }: PostModalProps) => {
  const [locationTitle, setLocationTitle] = useState('');
  const [description, setDescription] = useState('');
  const [postVisibility, setPostVisibility] = useState('Public');
  const [open, setOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [page, setPage] = useState<1 | 2>(1);

  // Tag input state
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const [allowedMembers, setAllowedMembers] = useState<UserSearchReturn[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [memberSuggestions, setMemberSuggestions] = useState<UserSearchReturn[]>([]);
  const [isSearchingMembers, setIsSearchingMembers] = useState(false);

  // Debounced member search
  useEffect(() => {
    if (memberSearch.trim().length === 0) {
      setMemberSuggestions([]);
      return;
    }
    setIsSearchingMembers(true);
    const handler = setTimeout(async () => {
      try {
        const results = await searchUsers(memberSearch.trim());
        setMemberSuggestions(results.filter(u => !allowedMembers.some(m => m.id === u.id)));
      } catch {
        setMemberSuggestions([]);
      }
      setIsSearchingMembers(false);
    }, 800);
    return () => clearTimeout(handler);
  }, [memberSearch, allowedMembers]);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images.');
        return;
      }
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

  // Member search logic
  const handleAddMember = (user: UserSearchReturn) => {
    setAllowedMembers(prev => [...prev, user]);
    setMemberSearch('');
    setMemberSuggestions([]);
  };

  const handleRemoveMember = (id: string) => {
    setAllowedMembers(prev => prev.filter(m => m.id !== id));
  };

  const handleNext = () => {
    if (!locationTitle.trim()) {
      Alert.alert('Validation', 'Location title is required.');
      return;
    }
    setPage(2);
  };

  const handleBack = () => {
    setPage(1);
  };

  const handlePostLocation = async () => {
    try {
      setIsUploading(true);
      const user = getCurrentUser?.();
      if (!user || !user.uid) {
        Alert.alert('Error', 'You must be logged in to post.');
        setIsUploading(false);
        return;
      }
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
        private: (postVisibility === 'Private'),
        allowedMembers: postVisibility === 'Private' ? allowedMembers.map(m => m.id) : undefined,
      };
      const allowedMembersId: string[] = postVisibility === 'Private' ? allowedMembers.map(m => m.id) : [];
      const createdPost = await createPost(postInfo, tags, allowedMembersId);
      if (selectedImages.length > 0) {
        for (const imageUri of selectedImages) {
          const base64Image = await getBase64(imageUri);
          await uploadImageToPost(base64Image, createdPost.postId);
        }
      }
      setIsUploading(false);
      onPost();
      handleReset();
      onClose();
    } catch (error) {
      setIsUploading(false);
      console.error('Error posting location:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    }
  };

  const handleReset = () => {
    setLocationTitle('');
    setDescription('');
    setSelectedImages([]);
    setTags([]);
    setTagInput('');
    setAllowedMembers([]);
    setMemberSearch('');
    setMemberSuggestions([]);
    setPage(1);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={modalStyles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={modalStyles.keyboardView}
        >
          <View style={modalStyles.modalContent}> 
            <ScrollView
              contentContainerStyle={modalStyles.scrollContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Header */}
              <View style={modalStyles.header}>
                <Text style={modalStyles.title}>Create Post</Text>
                <TouchableOpacity onPress={handleClose} style={modalStyles.closeButton}>
                  <Feather name="x" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              {/* Page Indicator */}
              <View style={modalStyles.pageIndicator}>
                <View style={[modalStyles.dot, page === 1 && modalStyles.activeDot]} />
                <View style={[modalStyles.dot, page === 2 && modalStyles.activeDot]} />
              </View>

              {page === 1 && (
                <>
                  {/* Location Title */}
                  <View style={modalStyles.inputGroup}>
                    <Text style={modalStyles.label}>Location Title</Text>
                    <TextInput
                      style={modalStyles.input}
                      placeholder="Enter location title"
                      placeholderTextColor="#6B7280"
                      value={locationTitle}
                      onChangeText={setLocationTitle}
                    />
                  </View>

                  {/* Description */}
                  <View style={modalStyles.inputGroup}>
                    <Text style={modalStyles.label}>Description</Text>
                    <TextInput
                      style={[modalStyles.input, modalStyles.textArea]}
                      placeholder="What's special about this place?"
                      placeholderTextColor="#6B7280"
                      value={description}
                      onChangeText={setDescription}
                      multiline
                      textAlignVertical="top"
                    />
                  </View>

                  {/* Tags Section */}
                  <View style={modalStyles.inputGroup}>
                    <Text style={modalStyles.label}>Tags</Text>
                    <View style={modalStyles.tagInputContainer}>
                      <View style={modalStyles.tagInputRow}>
                        <Feather name="hash" size={18} color="#6B7280" style={modalStyles.hashIcon} />
                        <TextInput
                          style={modalStyles.tagInput}
                          placeholder="Add tags (press Enter or comma to add)"
                          placeholderTextColor="#6B7280"
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
                          <Feather name="plus" size={16} color="#3B82F6" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    {/* Tag Chips */}
                    {tags.length > 0 && (
                      <View style={modalStyles.tagChipsContainer}>
                        {tags.map((tag, idx) => (
                          <View key={idx} style={modalStyles.tagChip}>
                            <Text style={modalStyles.tagChipText}>#{tag}</Text>
                            <TouchableOpacity
                              style={modalStyles.removeTagButton}
                              onPress={() => handleRemoveTag(idx)}
                            >
                              <Feather name="x" size={12} color="#6B7280" />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>

                  {/* Visibility */}
                  <View style={modalStyles.inputGroup}>
                    <Text style={modalStyles.label}>Visibility</Text>
                    <DropDownPicker
                      open={open}
                      value={postVisibility}
                      items={[
                        { label: '🌍 Public', value: 'Public' },
                        { label: '🔒 Private', value: 'Private' },
                      ]}
                      setOpen={setOpen}
                      setValue={setPostVisibility}
                      style={modalStyles.picker}
                      textStyle={modalStyles.pickerText}
                      dropDownContainerStyle={modalStyles.pickerDropdown}
                      placeholderStyle={modalStyles.pickerPlaceholder}
                      ArrowDownIconComponent={() => <Feather name="chevron-down" size={18} color="#6B7280" />}
                      ArrowUpIconComponent={() => <Feather name="chevron-up" size={18} color="#6B7280" />}
                    />
                  </View>

                  {/* Private Members Search */}
                  {postVisibility === 'Private' && (
                    <View style={modalStyles.inputGroup}>
                      <Text style={modalStyles.label}>Add Members</Text>
                      <View style={modalStyles.searchContainer}>
                        <Feather name="search" size={18} color="#6B7280" style={modalStyles.searchIcon} />
                        <TextInput
                          style={modalStyles.searchInput}
                          placeholder="Search users by name..."
                          placeholderTextColor="#6B7280"
                          value={memberSearch}
                          onChangeText={setMemberSearch}
                          autoCorrect={false}
                          autoCapitalize="none"
                        />
                        {isSearchingMembers && (
                          <View style={modalStyles.loadingIndicator}>
                            <Text style={modalStyles.loadingText}>...</Text>
                          </View>
                        )}
                      </View>
                      
                      {/* Search Results */}
                      {memberSuggestions.length > 0 && (
                        <View style={modalStyles.searchResults}>
                          {memberSuggestions.map(user => (
                            <TouchableOpacity
                              key={user.id}
                              style={modalStyles.searchResultItem}
                              onPress={() => handleAddMember(user)}
                            >
                              <View style={modalStyles.userAvatar}>
                                <Feather name="user" size={16} color="#6B7280" />
                              </View>
                              <Text style={modalStyles.searchResultText}>{user.displayName}</Text>
                              <Feather name="plus-circle" size={18} color="#3B82F6" />
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}

                      {/* Selected Members */}
                      {allowedMembers.length > 0 && (
                        <View style={modalStyles.selectedMembersContainer}>
                          {allowedMembers.map(member => (
                            <View key={member.id} style={modalStyles.memberChip}>
                              <View style={modalStyles.memberAvatar}>
                                <Feather name="user" size={12} color="#6B7280" />
                              </View>
                              <Text style={modalStyles.memberChipText}>{member.displayName}</Text>
                              <TouchableOpacity
                                style={modalStyles.removeMemberButton}
                                onPress={() => handleRemoveMember(member.id)}
                              >
                                <Feather name="x" size={12} color="#6B7280" />
                              </TouchableOpacity>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  )}

                  {/* Next Button */}
                  <TouchableOpacity 
                    style={modalStyles.primaryButton} 
                    onPress={handleNext}
                  >
                    <Text style={modalStyles.primaryButtonText}>Next</Text>
                    <Feather name="arrow-right" size={18} color="white" />
                  </TouchableOpacity>
                </>
              )}

              {page === 2 && (
                <>
                  {/* Image Section */}
                  <View style={modalStyles.inputGroup}>
                    <Text style={modalStyles.label}>Images (Optional)</Text>
                    <TouchableOpacity style={modalStyles.imagePickerButton} onPress={pickImage}>
                      <MaterialIcons name="add-photo-alternate" size={32} color="#3B82F6" />
                      <Text style={modalStyles.imagePickerText}>Add Images</Text>
                      <Text style={modalStyles.imagePickerSubtext}>Tap to select photos</Text>
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
                              <Feather name="x" size={14} color="white" />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>

                  {/* Action Buttons */}
                  <View style={modalStyles.actionButtons}>
                    <TouchableOpacity 
                      style={modalStyles.secondaryButton} 
                      onPress={handleBack}
                      disabled={isUploading}
                    >
                      <Feather name="arrow-left" size={18} color="#6B7280" />
                      <Text style={modalStyles.secondaryButtonText}>Back</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[modalStyles.primaryButton, isUploading && modalStyles.buttonDisabled, { flex: 1, marginLeft: 12 }]} 
                      onPress={handlePostLocation}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Text style={modalStyles.primaryButtonText}>Publishing...</Text>
                          <View style={modalStyles.spinner} />
                        </>
                      ) : (
                        <>
                          <Text style={modalStyles.primaryButtonText}>Publish Post</Text>
                          <Feather name="send" size={18} color="white" />
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </>
              )}
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  modalContent: {
    backgroundColor: '#1F2937',
    borderRadius: 24,
    width: '92%',
    maxHeight: '90%',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  scrollContainer: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  closeButton: {
    padding: 8,
    backgroundColor: '#374151',
    borderRadius: 12,
  },
  pageIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4B5563',
  },
  activeDot: {
    backgroundColor: '#3B82F6',
    width: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#374151',
    color: 'white',
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  tagInputContainer: {
    backgroundColor: '#374151',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  tagInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  hashIcon: {
    marginRight: 8,
  },
  tagInput: {
    flex: 1,
    color: 'white',
    height: 40,
    fontSize: 16,
  },
  addTagButton: {
    padding: 8,
    backgroundColor: '#1E3A8A',
    borderRadius: 8,
  },
  tagChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E40AF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagChipText: {
    color: 'white',
    fontSize: 14,
    marginRight: 6,
  },
  removeTagButton: {
    backgroundColor: 'rgba(107, 114, 128, 0.3)',
    borderRadius: 10,
    padding: 2,
  },
  picker: {
    backgroundColor: '#374151',
    borderColor: '#4B5563',
    borderRadius: 12,
    height: 48,
  },
  pickerText: {
    color: 'white',
    fontSize: 16,
  },
  pickerPlaceholder: {
    color: '#6B7280',
  },
  pickerDropdown: {
    backgroundColor: '#374151',
    borderColor: '#4B5563',
    borderRadius: 12,
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4B5563',
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
  },
  loadingIndicator: {
    marginLeft: 8,
  },
  loadingText: {
    color: '#3B82F6',
    fontSize: 16,
  },
  searchResults: {
    backgroundColor: '#374151',
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#4B5563',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4B5563',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  searchResultText: {
    flex: 1,
    color: 'white',
    fontSize: 16,
  },
  selectedMembersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  memberChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  memberAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  memberChipText: {
    color: 'white',
    fontSize: 14,
    marginRight: 6,
  },
  removeMemberButton: {
    backgroundColor: 'rgba(107, 114, 128, 0.3)',
    borderRadius: 10,
    padding: 2,
  },
  imagePickerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 32,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  imagePickerText: {
    color: '#3B82F6',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  imagePickerSubtext: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 4,
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  imagePreviewWrapper: {
    position: 'relative',
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    backgroundColor: '#374151',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  secondaryButtonText: {
    color: '#D1D5DB',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#4B5563',
    shadowOpacity: 0,
  },
  spinner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderTopColor: 'white',
  },
});

export default PostModal;
// Remove all image loading state logic and ActivityIndicator

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { ThemedText } from './ThemedText';
import { deletePostById } from '@/services/api/posts';
import { PolisType, DisplayPostInfo } from '@/types/types';
import PostActionSheet from './PostActionSheet';
import ProtectedImage from './ProtectedImage';

interface CustomCalloutProps {
  isUserLoggedIn: boolean; 
  post: DisplayPostInfo;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onViewDetails?: () => void;
  onSelectNewPolis?: (polis: PolisType) => void;
  onPostsChange: () => void; 
  onPostDeleted?: () => void;
  onEdit?: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const CustomCallout: React.FC<CustomCalloutProps> = ({
  isUserLoggedIn,
  post,
  onLike,
  onComment,
  onShare,
  onViewDetails,
  onSelectNewPolis,
  onPostsChange,
  onPostDeleted,
  onEdit
}) => {
  const [showActionSheet, setShowActionSheet] = useState<boolean>(false);
  const [userLiked, setUserLiked] = useState<boolean>(false); 

  const handleDeletePost = async () => {
    if (!isUserLoggedIn || !post.postInfo.postId) return;
    try {
      await deletePostById(post.postInfo.postId);
      if (typeof onViewDetails === 'function') onViewDetails();
      if (typeof onPostDeleted === 'function') onPostDeleted();
      if (typeof onPostsChange === 'function') onPostsChange();
      setShowActionSheet(false);
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };
  const handeLike = () => {
    setUserLiked(!userLiked); 
  }

  return (
    <View style={styles.container} >
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <View style={styles.authorRow}>
            {post.postInfo.userPhotoURL ? (
              <TouchableOpacity style={styles.avatarTouchable}>
                <ProtectedImage
                  url={post.postInfo.userPhotoURL}
                  style={styles.avatar}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.avatarTouchable}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {post.postInfo.userDisplayName?.charAt(0)?.toUpperCase() || 'U'}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            <ThemedText style={styles.authorName} numberOfLines={1} ellipsizeMode="tail">
              {post.postInfo.userDisplayName}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Title and Date Row */}
      <View style={styles.titleDateRow}>
        <ThemedText style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {post.postInfo.title}
        </ThemedText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={styles.dateNextToTitle}>{new Date(post.postInfo.date).toLocaleDateString()}</Text>
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => setShowActionSheet(!showActionSheet)}
          >
            <Text style={styles.moreButtonText}>⋯</Text>
          </TouchableOpacity>
        </View>
        {showActionSheet && (
          <PostActionSheet
            isUserLoggedIn={isUserLoggedIn}
            visible={showActionSheet}
            onDelete={async () => handleDeletePost()}
            onClose={() => setShowActionSheet(false)}
            onEdit={() => {
              setShowActionSheet(false);
              if (onEdit) onEdit();
            }}
          />
        )}
      </View>
      
      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentContainer}
      >
        <View style={styles.content}>
          <ThemedText style={styles.description}>
            {post.postInfo.description}
          </ThemedText>
        </View>

        {/* Multiple Images */}
        {post.images && post.images.length > 0 && (
          <View style={styles.imageContainer}>
            {post.images.slice(0, 2).map((image, index) => {
              const imageUrl = typeof image === 'string'
                ? image
                : (image && typeof image === 'object' && 'imageUrl' in image
                    ? image.imageUrl
                    : '');
              return (
                <View key={index} style={styles.singleImageContainer}>
                  <ProtectedImage
                    url={imageUrl}
                    style={styles.image}
                  />
                </View>
              );
            })}
            {post.images.length > 2 && (
              <Text style={styles.moreImagesText}>+{post.images.length - 2} more images</Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.viewDetailsButton} onPress={onViewDetails}>
          <Text style={styles.viewDetailsText}>View Details</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handeLike}>
          <Text style={styles.actionIcon}>
            {userLiked ? '❤️' : '🩶'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Arrow */}
      <View style={styles.arrow} />
    </View>
  );
};

const styles = StyleSheet.create({
  // ...styles unchanged...
  container: {
    backgroundColor: '#1F2937',
    borderRadius: 24,
    padding: 24,
    width: Math.min(screenWidth * 0.85, 400),
    maxHeight: screenHeight * 0.4,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  scrollContent: {
    flexGrow: 1,
    marginBottom: 12,
  },
  scrollContentContainer: {
    paddingBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  authorInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    letterSpacing: 0.3,
  },
  postDate: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 0,
  },
  moreButton: {
    padding: 8,
    borderRadius: 12,
    minWidth: 36,
    bottom: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreButtonText: {
    color: '#E5E7EB',
    fontSize: 16,
    fontWeight: 'bold',
    transform: [{ rotate: '90deg' }],
  },
  content: {
    marginBottom: 16,
    paddingHorizontal: 4,
    paddingTop: 4,
  },
  title: {
    color: 'white',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: 0.4,
    lineHeight: 26,
    textShadowColor: 'rgba(59, 130, 246, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    overflow: 'hidden',
  },
  description: {
    color: '#E5E7EB',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    fontWeight: '400',
    letterSpacing: 0.2,
    paddingLeft: 4,
    paddingRight: 4,
    opacity: 0.95,
    borderBottomColor: '#374151',
    borderBottomWidth: 1, 
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  singleImageContainer: {
    width: '100%',
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '95%',
    aspectRatio: 1.6,
    maxHeight: 200,
    resizeMode: 'contain',
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 5,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 1,
    paddingHorizontal: 8,
  },
  actionIcon: {
    fontSize: 16,
    marginRight: 1,
  },
  actionText: {
    color: '#555',
    fontSize: 12,
    fontWeight: '500',
  },
  viewDetailsButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 4,
  },
  viewDetailsText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    textDecorationLine: 'underline' 
  },
  arrow: {
    position: 'absolute',
    bottom: -10,
    left: '50%',
    marginLeft: -10,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#1F2937',
  },
  loadingContainer: {
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  hidden: {
    opacity: 0,
  },
  errorContainer: {
    backgroundColor: '#4B5563',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  tagButton: {
    backgroundColor: '#374151',
    borderColor: '#1E40AF',
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 32,
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  tagText: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  noTagText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    width: '100%',
  },
  avatarTouchable: {
    marginRight: 12,
  },
  postInfoRow: {
    flexDirection: 'column',
    marginBottom: 12,
  },
  closeCalloutButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  closeCalloutText: {
    color: '#9CA3AF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  titleDateRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
    gap: 12,
    flexWrap: 'wrap',
  },
  dateNextToTitle: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    bottom: 7,
    backgroundColor: '#374151',
    borderRadius: 8,
    overflow: 'hidden',
  },
  moreImagesText: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#374151',
    borderRadius: 12,
    letterSpacing: 0.3,
  },
});

export default CustomCallout;

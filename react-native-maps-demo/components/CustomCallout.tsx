import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions, ActivityIndicator, ScrollView } from 'react-native';
import { ThemedText } from './ThemedText';
import { getImageUrlWithSAS} from '@/api/image';
import { deletePostById } from '@/api/posts';
import { PolisType, PostInfo} from '@/types/types';
import PostActionSheet from './PostActionSheet';

interface CustomCalloutProps {
  isUserLoggedIn: boolean; 
  post: PostInfo;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onViewDetails?: () => void;
  onSelectNewPolis?: (polis: PolisType) => void;
  onPostsChange: () => void; 
  onPostDeleted?: () => void;
  onEdit?: () => void;
}

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
  const [imageLoadingStates, setImageLoadingStates] = useState<{ [key: number]: boolean }>({});
  const [imageErrorStates, setImageErrorStates] = useState<{ [key: number]: boolean }>({});
  const [showActionSheet, setShowActionSheet] = useState<boolean>(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Handles deleting a post (if user is logged in and postId exists)
  const handleDeletePost = async () => {
    console.log("deleting post");
    if (!isUserLoggedIn || !post.postId) return;
    try {
      await deletePostById(post.postId);
      // Close the modal and reset the map after deleting the post
      if (typeof onViewDetails === 'function') {
        onViewDetails(); // This will close the callout/modal in parent
      }
      if (typeof onPostDeleted === 'function') onPostDeleted();
      if (typeof onPostsChange === 'function') onPostsChange();
      setShowActionSheet(false);
      // Optionally, you can trigger a map reset here if you have a callback for that
      // For example: if (typeof onResetMap === 'function') { onResetMap(); }
    } catch (error) {
      console.error('Failed to delete post:', error);
      // Optionally: show an error message to the user
    }
  };

  return (
    <View style={styles.container} >
      {/* Header - Fixed at top */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <View style={styles.authorRow}>
            <TouchableOpacity
              // onPress={() => {
              //   if (typeof onViewDetails === 'function') {
              //     onViewDetails();
              //   }
              //   if (typeof onAvatarPress === 'function') {
              //     onAvatarPress(post.authorId);
              //   }
              // }}
              style={styles.avatarTouchable}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {post.userId?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
            </TouchableOpacity>
            <ThemedText style={styles.authorName}>{post.userId}</ThemedText>
          </View>
        </View>
      </View>

      {/* Title and Date Row */}
      <View style={styles.titleDateRow}>
        <ThemedText style={styles.title}>{post.title}</ThemedText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={styles.dateNextToTitle}>{formatDate(post.date ?? '')}</Text>
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => {
              setShowActionSheet(!showActionSheet)
            }}
          >
            <Text style={styles.moreButtonText}>⋯</Text>
          </TouchableOpacity>
        </View>
        {showActionSheet && (
          <PostActionSheet
            isUserLoggedIn={isUserLoggedIn}
            visible={showActionSheet}
            onDelete={async () => {
              handleDeletePost()
            }}
            
            onClose={() => setShowActionSheet(false)}
            onEdit={() => {
              setShowActionSheet(false);
              if (onEdit) onEdit();
            }}
            // You can add onEdit, onDelete, onReport handlers here if needed
          />
        )}
      </View>
      

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentContainer}
      >
        {/* Content */}
        <View style={styles.content}>
          <ThemedText style={styles.description}>
            {post.description}
          </ThemedText>
          {/* Tags under description */}
          {/* <View style={styles.tagContainer}>
            {Array.isArray(post.tags) && post.tags.length > 0 ? (
              post.tags.map((tag: string, idx: number) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.tagButton}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (typeof onSelectNewPolis === 'function') {
                      onSelectNewPolis({ isUser: false, tag });
                    }
                  }}
                >
                  <Text style={styles.tagText}>#{tag}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noTagText}>No tags</Text>
            )}
          </View> */}
        </View>

              {/* Multiple Images with loading placeholders */}
      {/* {post.images_url_blob && post.images_url_blob.length > 0 && (
        <View style={styles.imageContainer}>
          {post.images_url_blob.map((imageUrl, index) => (
            <View key={index} style={styles.singleImageContainer}>
              {imageLoadingStates[index] && (
                <View style={[styles.image, styles.loadingContainer]}>
                  <ActivityIndicator size="small" color="#007AFF" />
                </View>
              )}
              <Image
                source={{ uri: getImageUrlWithSAS(imageUrl) }}
                style={[styles.image, imageLoadingStates[index] && styles.hidden]}
                onLoadStart={() => {
                  setImageLoadingStates(prev => ({ ...prev, [index]: true }));
                }}
                onLoadEnd={() => {
                  setImageLoadingStates(prev => ({ ...prev, [index]: false }));
                }}
                onError={() => {
                  setImageLoadingStates(prev => ({ ...prev, [index]: false }));
                  setImageErrorStates(prev => ({ ...prev, [index]: true }));
                }}
              />
              {imageErrorStates[index] && (
                <View style={[styles.image, styles.errorContainer]}>
                  <Text style={styles.errorText}>Failed to load image</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )} */}
      </ScrollView>

      {/* Action Bar - Fixed at bottom */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionButton} onPress={onLike}>
          <Text style={styles.actionIcon}>❤️</Text>
          {/* <Text style={styles.actionText}>{post.likes || 0}</Text> */}
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={onComment}>
          <Text style={styles.actionIcon}>💬</Text>
          {/* <Text style={styles.actionText}>{post.comments || 0}</Text> */}
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={onShare}>
          <Text style={styles.actionIcon}>📤</Text>
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.viewDetailsButton} onPress={onViewDetails}>
          <Text style={styles.viewDetailsText}>View Details</Text>
        </TouchableOpacity>
      </View>

      {/* Arrow */}
      <View style={styles.arrow} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    borderRadius: 16,
    padding: 20,
    minWidth: 380,
    maxWidth: 450,
    maxHeight: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  scrollContent: {
    flex: 1,
    marginBottom: 8,
  },
  scrollContentContainer: {
    paddingBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    color: '#222', // Dark text for white background
    fontSize: 20,
    fontWeight: '600',
  },
  postDate: {
    color: '#888', // Muted gray for date
    fontSize: 12,
    marginTop: 2,
  },
  moreButton: {
    padding: 4,
  },
  moreButtonText: {
    color: '#888', // Muted gray for more button
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    marginBottom: 12,
    paddingHorizontal: 2,
    paddingTop: 2,
  },
  title: {
    color: '#1E293B', // Very dark blue/gray for title
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
    letterSpacing: 0.2,
    textShadowColor: 'rgba(30,58,95,0.10)', // Lighter shadow
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(30,58,95,0.10)', // Subtle blue/gray border
  },
  description: {
    color: '#374151', // Slate gray for description
    fontSize: 16,
    lineHeight: 22,
    marginTop: 8,
    fontWeight: '400',
    letterSpacing: 0.1,
    paddingLeft: 2,
    paddingRight: 2,
  },
  imageContainer: {
    marginBottom: 12,
    overflow: 'hidden',
  },
  singleImageContainer: {
    marginBottom: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    aspectRatio: 1.6,
    height: undefined,
    resizeMode: 'cover',
    borderRadius: 5,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
    backgroundColor: '#F3F4F6', // Light gray for loading/empty state
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(30,58,95,0.08)', // Subtle blue/gray border
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  actionText: {
    color: '#555', // Medium gray for action text
    fontSize: 12,
    fontWeight: '500',
  },
  viewDetailsButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  viewDetailsText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  arrow: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    marginLeft: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(255,255,255,0.97)', // Match container background
  },
  loadingContainer: {
    backgroundColor: 'rgba(30,58,95,0.05)', // Very light blue/gray
    justifyContent: 'center',
    alignItems: 'center',
  },
  hidden: {
    opacity: 0,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.08)', // Softer red
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#B91C1C', // Dark red
    fontSize: 12,
    textAlign: 'center',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  tagButton: {
    backgroundColor: 'transparent', // Light blue/gray for tag
    borderColor: '#1e293b', // lighter polis blue
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 26,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
  },
  tagText: {
    fontSize: 13,
    color: '#1E293B', // Dark blue/gray for tag text
    fontFamily: 'Averia',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  noTagText: {
    fontSize: 12,
    color: '#AAA', // Lighter gray for no tag
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  avatarTouchable: {
    marginRight: 10,
  },
  postInfoRow: {
    flexDirection: 'column',
    marginBottom: 8,
  },
  closeCalloutButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(30, 58, 95, 0.10)', // Very light blue/gray
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 2,
  },
  closeCalloutText: {
    color: '#1E293B', // Dark blue/gray for close icon
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  titleDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    gap: 8,
  },
  dateNextToTitle: {
    color: '#888', // Muted gray for date
    fontSize: 13,
    marginLeft: 10,
    fontWeight: '400',
    marginTop: 2,
  },
});

export default CustomCallout; 
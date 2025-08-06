import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Dimensions, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { DisplayPostInfo } from '@/types/types';
import ProtectedImage from './ProtectedImage';
import { getRandomColor } from '@/functions/getRandomColor';
import { likePost } from '@/services/api/posts';

const { width, height } = Dimensions.get('window');

export const PostView = ({ post }: { post: DisplayPostInfo}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
 const [userLiked, setUserLiked] = useState<boolean>(false);
  const totalImages = post.images?.length || 0;

    const handleLike = () => {
      if(!post) return; 
      if (!isUserLoggedIn || !post.postInfo.postId) return;
      setUserLiked(!userLiked);
      // if (onLike) onLike();
      likePost(post.postInfo.postId)
        .then(() => {
          console.log('Post liked successfully');
        })
        .catch((error) => {
          console.error('Failed to like post:', error);
        });
    }

  return (
    <View style={styles.container}>
      {/* Header - Instagram style */}
      <View style={styles.header}>
        <View style={styles.authorSection}>
          <View style={[styles.authorAvatar, { backgroundColor: getRandomColor() }]}>
            <ThemedText style={styles.authorInitial}>
              {post.postInfo.userDisplayName.charAt(0).toUpperCase()}
            </ThemedText>
          </View>
          <View style={styles.authorInfo}>
            <ThemedText style={styles.authorName}>{post.postInfo.userDisplayName}</ThemedText>
            <ThemedText style={styles.dateText}>{post.postInfo.date}</ThemedText>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <ThemedText style={styles.moreText}>•••</ThemedText>
        </TouchableOpacity>
      </View>

        {post.images && post.images.length > 0 && (
          <View style={styles.imageContainer}>
            {post.images.map((image, index) => {
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
                    resize={'contain'}
                  />
                </View>
              );
            })}
          </View>
        )}

      {/* Action buttons - Instagram style */}
      <View style={styles.actionBar}>
        <View style={styles.leftActions}>
          <TouchableOpacity style={styles.actionButton}>
            <ThemedText style={styles.actionIcon}>♡</ThemedText>
          </TouchableOpacity>

        </View>
        <TouchableOpacity style={styles.actionButton}>
          <ThemedText style={styles.actionIcon}>🔖</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Content Section */}
      <ScrollView style={styles.contentSection} showsVerticalScrollIndicator={false}>
        {/* Likes placeholder */}
        <TouchableOpacity style={styles.likesSection}>
          <ThemedText style={styles.likesText}>Be the first to like this</ThemedText>
        </TouchableOpacity>

        {/* Caption */}
        <View style={styles.captionSection}>
          <ThemedText style={styles.captionAuthor}>{post.postInfo.userDisplayName}</ThemedText>
          <ThemedText style={styles.captionTitle}>{post.postInfo.title}</ThemedText>
          {post.postInfo.description && (
            <ThemedText style={styles.captionDescription}>{post.postInfo.description}</ThemedText>
          )}
        </View>

        {/* Comments placeholder */}
        <TouchableOpacity style={styles.commentsSection}>
          <ThemedText style={styles.commentsText}>View all comments</ThemedText>
        </TouchableOpacity>

        {/* Add some bottom padding for scrolling */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#dbdbdb',
  },
  
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  imagesContainer: {
  // backgroundColor: 'black',
},

  image: {
    width: '95%',
    aspectRatio: 1.6,
    // height: '400',
    resizeMode: 'contain',
    paddingVertical: 0,
    // borderBottomColor: '#55555534',
    // borderBottomWidth: 2, 
  },
  
  authorInitial: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: 'Anton_400Regular',
  },
  
  authorInfo: {
    flex: 1,
  },
  
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Anton_400Regular',
    marginBottom: 2,
  },
  
  dateText: {
    fontSize: 12,
    color: '#8e8e8e',
    fontFamily: 'Koulen_400Regular',
  },
  
  moreButton: {
    padding: 8,
  },
  
  moreText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '600',
  },
  
  
  imageScroll: {
    flex: 1,
  },
  

  
  imageIndicators: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'column',
    alignItems: 'center',
  },
  
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginVertical: 2,
  },
  
  activeIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  
  imageCounter: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
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
  
  counterText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  
  noImagePlaceholder: {
    height: width,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  
  placeholderIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  placeholderText: {
    fontSize: 30,
  },
  
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#dbdbdb',
  },
  
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginRight: 8,
  },
  
  actionIcon: {
    fontSize: 24,
    color: '#000000',
  },
  
  contentSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  
  likesSection: {
    paddingVertical: 8,
  },
  
  likesText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  
  captionSection: {
    paddingVertical: 4,
  },
  
  captionAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Anton_400Regular',
    marginBottom: 4,
  },
  
  captionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'Anton_400Regular',
    marginBottom: 4,
    lineHeight: 20,
  },
  
  captionDescription: {
    fontSize: 14,
    color: '#000000',
    fontFamily: 'Anton_400Regular',
    lineHeight: 18,
  },
  
  commentsSection: {
    paddingVertical: 8,
  },
  
  commentsText: {
    fontSize: 14,
    color: '#8e8e8e',
  },
  
  bottomPadding: {
    height: 20,
  },
});
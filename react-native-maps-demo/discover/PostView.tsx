import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { DisplayPostInfo } from '@/types/types';
import ProtectedImage from '@/components/ProtectedImage';
import { getRandomColor } from '@/functions/getRandomColor';
import { likePost } from '@/services/api/posts';
import { MaterialIcons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

export const PostView = ({ 
  post, 
  isLoggedInUser, 
  onPostSelect, 
  setSelectedPost, 
  setPostId, 
  onBack 
}: { 
  post: DisplayPostInfo;
  isLoggedInUser?: boolean;
  onPostSelect?: (post: DisplayPostInfo) => void;
  setSelectedPost?: (post: DisplayPostInfo | null) => void;
  setPostId?: (postId: string | null) => void;
  onBack?: () => void;
}) => {
  const [userLiked, setUserLiked] = useState(false);

  const handleLike = () => {
    if (!post?.postInfo?.postId) return;
    const prevLiked = userLiked;
    setUserLiked(!prevLiked);
    likePost(post.postInfo.postId).catch(() => setUserLiked(prevLiked));
  };

  useEffect(() => {
    setUserLiked(!!post.postInfo.likedByCurrentUser);
  }, [post]);

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <View style={styles.authorInfo}>
          <ThemedText style={styles.authorName}>{post.postInfo.userDisplayName}</ThemedText>
          <ThemedText style={styles.postDate}>
            {new Date(post.postInfo.date).toLocaleDateString()}
          </ThemedText>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <MaterialIcons name="more-vert" size={20} color="black" />
        </TouchableOpacity>
      </View>

      {/* Title & Description */}
      <View style={styles.content}>
        <ThemedText style={styles.title}>{post.postInfo.title}</ThemedText>
        {post.postInfo.description && (
          <ThemedText style={styles.description}>{post.postInfo.description}</ThemedText>
        )}
      </View>

      {/* Images */}
      {post.images?.length > 0 && (
        <View style={styles.imageContainer}>
          {post.images.map((img, index) => {
            const imageUrl = typeof img === 'string' ? img : img.imageUrl || '';
            return (
              <View key={index} style={styles.singleImageContainer}>
                <ProtectedImage url={imageUrl} style={styles.image} resize="contain" />
              </View>
            );
          })}
        </View>
      )}

      {/* Tags */}
      <View style={styles.tagContainer}>
        {post.postInfo.tag ? (
          <View style={styles.tagButton}>
            <ThemedText style={styles.tagText}>#{post.postInfo.tag}</ThemedText>
          </View>
        ) : (
          <ThemedText style={styles.noTagText}>No tags</ThemedText>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <MaterialIcons
            name={userLiked ? 'favorite' : 'favorite-border'}
            size={20}
            color={userLiked ? '#ff3040' : getRandomColor()}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="bookmark-border" size={20} color={getRandomColor()} />
        </TouchableOpacity>
      </View>

      {/* Likes */}
      <View style={styles.likeSection}>
        <ThemedText style={styles.likeCount}>
          {userLiked ? '1 like' : 'Be the first to like this'}
        </ThemedText>
      </View>

      {/* Extra content to force scrolling */}
      <View style={styles.extraContent}>
        <ThemedText style={styles.extraText}>
          This is additional content to demonstrate scrolling functionality.{'\n\n'}
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.{'\n\n'}
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.{'\n\n'}
          Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.{'\n\n'}
          Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.{'\n\n'}
          Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.{'\n\n'}
          This content should definitely make the view scrollable! If you can see this text, scrolling is working properly.
        </ThemedText>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    width: Math.min(screenWidth * 0.9, 400),
    alignSelf: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderRadius: 8,
    marginVertical: 8,
    // Remove any height constraints - let content flow naturally
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  backButton: {
    padding: 4,
    marginRight: 12,
  },

  authorInfo: {
    flex: 1,
  },

  authorName: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Koulen_400Regular',
  },

  postDate: {
    color: '#666',
    fontSize: 12,
    fontFamily: 'Koulen_400Regular',
    marginTop: 2,
  },

  moreButton: {
    padding: 8,
  },

  content: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  title: {
    color: 'black',
    fontSize: 24,
    fontWeight: '800',
    fontFamily: 'Anton_400Regular',
    marginBottom: 8,
    lineHeight: 30,
  },

  description: {
    color: '#333',
    fontSize: 16,
    fontFamily: 'Anton_400Regular',
    lineHeight: 22,
  },

  imageContainer: {
    paddingHorizontal: 16,
    marginVertical: 12,
  },

  singleImageContainer: {
    width: '100%',
    marginBottom: 12,
  },

  image: {
    width: '100%',
    aspectRatio: 1.6,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },

  tagContainer: {
    paddingHorizontal: 16,
    marginVertical: 8,
  },

  tagButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
  },

  tagText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    fontFamily: 'Koulen_400Regular',
  },

  noTagText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },

  actionBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },

  actionButton: {
    marginRight: 20,
    padding: 4,
  },

  likeSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },

  likeCount: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Koulen_400Regular',
  },

  extraContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },

  extraText: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'justify',
  },
  
});
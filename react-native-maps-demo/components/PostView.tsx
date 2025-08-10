import React, { useState } from 'react';
import { ScrollView, View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { DisplayPostInfo } from '@/types/types';
import ProtectedImage from './ProtectedImage';
import { getRandomColor } from '@/functions/getRandomColor';
import { likePost } from '@/services/api/posts';
import { MaterialIcons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

export const PostView = ({ post }: { post: DisplayPostInfo }) => {
  const [userLiked, setUserLiked] = useState(false);

  const handleLike = () => {
    if (!post?.postInfo?.postId) return;
    const prevLiked = userLiked;
    setUserLiked(!prevLiked);
    likePost(post.postInfo.postId).catch((error) => {
      console.error('Failed to like post:', error);
      setUserLiked(prevLiked);
    });
  };

  return (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
          >
      <ThemedView style={postStyles.container}>
        {/* Header */}
        <View style={postStyles.header}>
          <View style={postStyles.authorInfo}>
            <View>
              <ThemedText style={postStyles.authorName}>{post.postInfo.userDisplayName}</ThemedText>
              <ThemedText style={postStyles.postDate}>
                {new Date(post.postInfo.date).toLocaleDateString()}
              </ThemedText>
            </View>
          </View>
          <TouchableOpacity style={postStyles.moreButton}>
            <MaterialIcons name="more-vert" size={20} color="black" />
          </TouchableOpacity>
        </View>

        {/* Title & Description */}
        <View style={postStyles.content}>
          <ThemedText style={postStyles.title}>{post.postInfo.title}</ThemedText>
          {post.postInfo.description && (
            <ThemedText style={postStyles.description}>{post.postInfo.description}</ThemedText>
          )}
        </View>

        {/* Images */}
        {post.images?.length > 0 && (
          <View style={postStyles.imageContainer}>
            {post.images.map((img, index) => {
              const imageUrl = typeof img === 'string' ? img : img.imageUrl || '';
              return (
                <View key={index} style={postStyles.singleImageContainer}>
                  <ProtectedImage url={imageUrl} style={postStyles.image} resize="contain" />
                </View>
              );
            })}
          </View>
        )}

        {/* Tags */}
        <View style={postStyles.tagContainer}>
          {post.postInfo.tag ? (
            <View style={postStyles.tagButton}>
              <ThemedText style={postStyles.tagText}>#{post.postInfo.tag}</ThemedText>
            </View>
          ) : (
            <ThemedText style={postStyles.noTagText}>No tags</ThemedText>
          )}
        </View>

        {/* Actions */}
        <View style={postStyles.actionBar}>
          <View style={postStyles.likeView}>
            <TouchableOpacity style={postStyles.actionButton} onPress={handleLike}>
              <MaterialIcons
                name={userLiked ? 'favorite' : 'favorite-border'}
                size={20}
                color={userLiked ? '#ff3040' : getRandomColor()}
              />
            </TouchableOpacity>
            <TouchableOpacity style={postStyles.actionButton}>
              <MaterialIcons name="chat-bubble-outline" size={20} color={getRandomColor()} />
            </TouchableOpacity>
            <TouchableOpacity style={postStyles.actionButton}>
              <MaterialIcons name="share" size={20} color={getRandomColor()} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={postStyles.actionButton}>
            <MaterialIcons name="bookmark-border" size={20} color={getRandomColor()} />
          </TouchableOpacity>
        </View>

        {/* Likes */}
        <View style={postStyles.dateAndDescriptionContainer}>
          <ThemedText style={postStyles.likeCount}>
            {userLiked ? '1 like' : 'Be the first to like this'}
          </ThemedText>
        </View>
      </ThemedView>
    </ScrollView>
  );
};

const postStyles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffffff',
    paddingVertical: 8,
    width: Math.min(screenWidth * 0.9, 400),
    elevation: 12,
    marginBottom: 16,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 },
  authorInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  authorName: { color: 'black', fontSize: 30, fontFamily: 'Koulen_400Regular', lineHeight: 46 },
  postDate: { color: 'black', fontSize: 12, fontFamily: 'Koulen_400Regular' },
  moreButton: { borderRadius: 12, minWidth: 36, alignItems: 'center', justifyContent: 'center' },
  imageContainer: { width: '100%', alignItems: 'center', marginBottom: 12 },
  singleImageContainer: { width: '100%', alignItems: 'center', marginBottom: 12 },
  image: { width: '95%', aspectRatio: 1.6, maxHeight: 200, resizeMode: 'contain', borderRadius: 8 },
  content: { paddingHorizontal: 16, paddingBottom: 8 },
  title: { color: 'black', fontSize: 20, fontWeight: '800', fontFamily: 'Anton_400Regular', marginBottom: 4 },
  description: { color: '#000000ff', fontSize: 15, fontFamily: 'Anton_400Regular' },
  tagContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, paddingHorizontal: 16, marginBottom: 8 },
  tagButton: { backgroundColor: '#374151', borderColor: '#1E40AF', borderWidth: 1.5, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  tagText: { fontSize: 13, color: '#3B82F6', fontWeight: '700' },
  noTagText: { fontSize: 12, color: '#6B7280', fontStyle: 'italic' },
  actionBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#374151', paddingHorizontal: 16, paddingVertical: 8 },
  likeView: { flexDirection: 'row', alignItems: 'center' },
  actionButton: { marginRight: 12 },
  dateAndDescriptionContainer: { paddingHorizontal: 16, marginTop: -4, marginBottom: 8 },
  likeCount: { color: getRandomColor(), fontSize: 17, fontWeight: '500', fontFamily: 'Koulen_400Regular' },
});

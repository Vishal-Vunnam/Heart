// Remove all image loading state logic and ActivityIndicator

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView, Image } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { deletePostById, getPost} from '@/services/api/posts';
import { PolisType, DisplayPostInfo } from '@/types/types';
import PostActionSheet from '../post/PostActionSheet';
import ProtectedImage from '../components/ProtectedImage';
import {likePost, unlikePost} from '@/services/api/posts'; // Import likePost function
import { getRandomColor } from '@/functions/getRandomColor'; // Assuming you have a utility function for random colors
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';


interface CustomCalloutProps {
  isUserLoggedIn: boolean; 
  postId: string;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onViewDetails?: () => void;
  onSelectNewPolis?: (polis: PolisType) => void;
  onSelectPost?: (post: DisplayPostInfo) => void;
  onPostsChange: () => void; 
  onPostDeleted?: () => void;
  onEdit?: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const CustomCallout: React.FC<CustomCalloutProps> = ({
  isUserLoggedIn,
  postId,
  onLike,
  onComment,
  onShare,
  onViewDetails,
  onSelectNewPolis,
  onSelectPost,
  onPostsChange,
  onPostDeleted,
  onEdit
}) => {
const [showActionSheet, setShowActionSheet] = useState<boolean>(false);
const [post, setPost] = useState<DisplayPostInfo | null>(null);
const [userLiked, setUserLiked] = useState<boolean>(false);
const [likes, setLikes] = useState<number>(0);
const [likeColor, setLikeColor] = useState<string>(getRandomColor());
useEffect(() => {
  let isMounted = true; // safety flag

  const fetchPost = async () => {
    if (!postId) return;

    try {
      const postInfo = await getPost(postId);
      console.log("Fetched post:", postInfo);
      if (isMounted) {
        setPost(postInfo);
        setUserLiked(postInfo?.postInfo?.likedByCurrentUser ?? false);
        setLikes(postInfo?.postInfo?.likesCount);
      }
    } catch (err) {
      console.error("❌ Failed to fetch post:", err);
    }
  };

  fetchPost();

  return () => {
    isMounted = false;
    console.log("🧹 Cleanup on unmount (modal closed)");
  };
}, []); // ✅ empty deps → runs only once when modal opens


  const handleDeletePost = async () => {
    if(!post) return; 
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

  const handleLike = () => {
    if(!post) return; 
    if ( !post.postInfo.postId) return;
     console.log("here?")
    setUserLiked(!userLiked);
    setLikes
    if (onLike) onLike();
    likePost(post.postInfo.postId)
      .then(() => {
        setUserLiked(!userLiked);
       setLikes(likes => (likes += 1))
         setLikeColor(getRandomColor());
        console.log('Post liked successfully');
      })
      .catch((error) => {
        console.error('Failed to like post:', error);
      });
  }

  const handleUnlike = () => { 
    if(!post) return; 
    if (!post.postInfo.postId) return;
    if (onLike) onLike();
    unlikePost(post.postInfo.postId)
      .then(() => {
        setUserLiked(!userLiked);
       setLikes(likes => (likes -= 1))
         setLikeColor(getRandomColor());
        console.log('Post unliked successfully');
      })
      .catch((error) => {
        console.error('Failed to like post:', error);
      });
  }

  return post ? ( 
    <View style={styles.container} >
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <View style={styles.authorRow}>
            {post.postInfo.userPhotoURL ? (
              <TouchableOpacity style={styles.avatarTouchable}>
                <Image
                  source={{ uri: post.postInfo.userPhotoURL }}
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
            <TouchableOpacity
              onPress={() => {
                if (onSelectNewPolis) {
                  onSelectNewPolis({ isUser: true, userInfo: {
                    displayName: post.postInfo.userDisplayName || '',
                    uid: post.postInfo.userId,
                    photoURL: post.postInfo.userPhotoURL || null,
                  } });
                }
              }}
            >
            <ThemedText style={styles.authorName} numberOfLines={1} ellipsizeMode="tail">
              {post.postInfo.userDisplayName}
            </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Title and Date Row */}
      <View style={styles.titleRow}>
        <ThemedText style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {post.postInfo.title}
        </ThemedText>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {post.postInfo.tag ? (
            <TouchableOpacity
              style={styles.tagButton}
              onPress={() => {
                if (onSelectNewPolis) {
                  onSelectNewPolis({ isUser: false, tag: post.postInfo.tag || '' });
                }
              }}
            >
              {post.postInfo.tag && 
              <ThemedText style={styles.tagText}>#{post.postInfo.tag}</ThemedText>
      }
            </TouchableOpacity>
          ) : null}
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
        <View style={styles.dateAndDescriptionContainer}>
          <Text style={styles.dateNextToTitle}>{new Date(post.postInfo.date).toLocaleDateString()}</Text>
          <ThemedText style={styles.description}>
            {post.postInfo.description}
          </ThemedText>
        </View>

        {/* Multiple Images */}
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
                  />
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.viewDetailsButton}
          onPress={() => {
            if (onSelectPost) {
              onSelectPost(post);
            }
          }}
        >
          <Text style={styles.viewDetailsText}>View Details</Text>
        </TouchableOpacity>
        <View style={styles.likeView}>
        <Text style={[styles.likeCount, { color: likeColor }]}> {likes} </Text>
        <TouchableOpacity style={styles.actionButton} onPress={!userLiked ? handleLike : handleUnlike}>
          <MaterialIcons
            name={userLiked ? 'favorite' : 'favorite-border'}
            size={28}
            color={userLiked ? 'red' : 'black'}
          />
        </TouchableOpacity>
        </View>
      </View>

      {/* Arrow */}
      <View style={styles.arrow} />
    </View>
  ) : null; 
};

const styles = StyleSheet.create({
  // ...styles unchanged...
  container: {
    backgroundColor: '#ffffffff',
    borderRadius: 24,
    paddingHorizontal: 0, 
    paddingVertical: 8, 
    width: Math.min(screenWidth * 0.90, 400),
    height: screenHeight * 0.435,
    elevation: 12,
    borderWidth: 3,
    borderColor: '#000000ff',
  },
  scrollContent: {
    flexGrow: 1,
    marginBottom: 0,
  },
  scrollContentContainer: {
    paddingBottom: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: 'black',
    borderBottomWidth: 3, 
    paddingHorizontal: 16,

  },
  authorInfo: {
    flexDirection: 'row',
    flex: 1,
    
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderColor: 'black',
    borderWidth: 3,
    backgroundColor: getRandomColor(),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
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
      shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowColor: '#rgba(0, 0, 0, 1)',
    fontFamily: 'Anton_400Regular',
    // fontFamily: 'Koulen_400Regular',
  },


  authorName: {
  color: 'black',
  fontSize: 25  ,
  letterSpacing: 0.3,
  fontFamily: 'Koulen_400Regular',
  lineHeight: 45, // Match the font size to reduce extra space
  marginTop: -2, // Slight negative margin to pull it down
  includeFontPadding: false, // Android only - removes extra padding
  textAlignVertical: 'center',
  },
  postDate: {
    color: 'black',
    fontSize: 12,
    marginTop: 0,
  fontFamily: 'Koulen_400Regular',
  },
  moreButton: {
    borderRadius: 12,
    minWidth: 36,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
    transform: [{ rotate: '90deg' }],
  },
  content: {
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  title: {
    color: 'black',
    fontSize: 22,
    // textDecorationLine: 'underline',
    fontWeight: '800',
    letterSpacing: 0.4,
    lineHeight: 26,
    overflow: 'hidden',  
    fontFamily: 'Anton_400Regular',
  },
  description: {
    color: '#000000ff',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
    letterSpacing: 0.2,
    marginTop: -12,
    opacity: 0.95,
    borderBottomColor: '#55555534',
    borderBottomWidth: 2, 
    fontFamily: 'Anton_400Regular',
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
    // paddingVertical: 8,
    // borderBottomColor: '#55555534',
    // borderBottomWidth: 2, 
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    borderTopWidth: 1,
    borderTopColor: '#374151',
    
  },
  likeView: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "space-evenly",
    marginRight: 20, 
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
    elevation: 2,
  },
  tagText: {
    fontSize: 16,
    color: getRandomColor(),
    fontWeight: '700',
    letterSpacing: 0.5,
    fontFamily: 'Koulen_400Regular',
    shadowOffset: { width: 1.2, height: 1.2 },
    shadowOpacity: 1,
    shadowRadius: 0,
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
  titleRow: {
    paddingHorizontal: 16,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    // marginBottom: 4,
    gap: 12,
    flexWrap: 'wrap',
    borderBottomColor: 'black',
    borderBottomWidth: 3,
    // paddingBottom: 8,
  },
  dateNextToTitle: {
    color: '#000000ff',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 46,
    borderRadius: 8,
    overflow: 'hidden',
    fontFamily: 'Koulen_400Regular',
  },
  likeCount: { 
        color: getRandomColor(),
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 46,
    borderRadius: 8,
    overflow: 'hidden',
    fontFamily: 'Koulen_400Regular',
  },
  dateAndDescriptionContainer: {
    paddingHorizontal: 16,
        marginTop: -15,
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

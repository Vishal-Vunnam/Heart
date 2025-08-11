// Extracted from original DiscoverModal.tsx
// DiscoverPolis.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { PolisType, DisplayPostInfo } from '@/types/types';
import { router } from 'expo-router';
import styles from './DiscoverStyles'; // Importing the styles
import ProtectedImage from '@/components/ProtectedImage';
import { MaterialIcons } from '@expo/vector-icons';
import { addFriend, deleteFriend} from '@/services/api/user';
import { getRandomColor } from '@/functions/getRandomColor';

interface DiscoverPolisProps {
  selectedPolis: PolisType;
  isLoggedInUser: boolean;
  isUserFriend: boolean; 
  posts: DisplayPostInfo[];
  onPolisSelect?: (polis: PolisType) => void;
  setSelectedPost: (post: DisplayPostInfo) => void;
  postsPerPage?: number; // Optional prop to control how many posts to show per page
}

export const DiscoverPolis: React.FC<DiscoverPolisProps> = ({
  selectedPolis,
  isLoggedInUser,
  isUserFriend,
  posts,
  onPolisSelect,
  setSelectedPost,
  postsPerPage = 10 // Default to 10 posts per page
}) => {
  const [isFriend, setIsFriend] = useState<boolean | null>(null);
  const [visiblePostsCount, setVisiblePostsCount] = useState<number>(postsPerPage);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsFriend(isUserFriend);
  }, [isUserFriend]);

  // Reset visible posts when posts change (e.g., different polis selected)
  useEffect(() => {
    setVisiblePostsCount(postsPerPage);
  }, [posts, postsPerPage]);

  const handleAddFriend = async () => {
    if(isLoggedInUser || !selectedPolis.isUser) return;
   
    console.log("here")
    try{
      const followeeId = selectedPolis.userInfo.uid;
     
      const addingFriend = await addFriend(followeeId);
      setIsFriend(true);
      console.log(addingFriend);
    }catch (error){
      // Handle error
    }
  }

  const handleRemoveFriend = async () => { 
      if(isLoggedInUser || !selectedPolis.isUser) return;

      try {
          const followeeId = selectedPolis.userInfo.uid;
          const deletingFriend = deleteFriend(followeeId);
          setIsFriend(false);

      } catch (error) { 

      }
   
  }

  const handleLoadMore = () => {
    setIsLoading(true);
    
    // Simulate loading delay (remove this in production if not needed)
    setTimeout(() => {
      setVisiblePostsCount(prev => Math.min(prev + postsPerPage, posts.length));
      setIsLoading(false);
    }, 300);
  };

  // Get only the posts that should be visible
  const visiblePosts = posts.slice(0, visiblePostsCount);
  const hasMorePosts = visiblePostsCount < posts.length;

  return (
    <>
      <ThemedView style={styles.infoDisplay}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          {selectedPolis.isUser && selectedPolis.userInfo.photoURL ? (
            <Image
              source={{ uri: selectedPolis.userInfo.photoURL }}
              style={styles.profilePicMedium}
            />
          ) : null}
     
          <View style={styles.infoLeft}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                     
              <TouchableOpacity
                style={styles.infoRight}
              >
                <Text style={styles.displayName}>
                  {selectedPolis.isUser
                  ? selectedPolis.userInfo.displayName || selectedPolis.userInfo.email
                  : '#' + selectedPolis.tag}
                </Text>
              </TouchableOpacity>
              
              {selectedPolis.isUser && !isLoggedInUser && isFriend!= null && !isFriend && (
                <TouchableOpacity onPress={handleAddFriend}>
                  <MaterialIcons
                    name="person-add"
                    size={20}
                    style={styles.addFriendIcon}
                    color={getRandomColor()} 
                  />
                </TouchableOpacity>
              )}

              {selectedPolis.isUser && !isLoggedInUser && isFriend!= null && isFriend && (
                <TouchableOpacity onPress={handleRemoveFriend}>
                  <MaterialIcons
                    name="person-remove"
                    size={20}
                    style={styles.addFriendIcon}
                    color={getRandomColor()} 
                  />
                </TouchableOpacity>
              )}
            {(
            <TouchableOpacity                 onPress={() => {
                  if (onPolisSelect) onPolisSelect(selectedPolis);
                }}>
                  <MaterialIcons
                    name="place"
                    size={20}
                    style={styles.addFriendIcon}
                    color={getRandomColor()} 
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </ThemedView>

      <ThemedView style={styles.postDisplay}>
        {visiblePosts.map((post, index) => (
          <TouchableOpacity
            key={index}
            style={styles.postItem}
            onPress={() => setSelectedPost(post)}
          >
            <View style={styles.infoContainer}>
              <View style={styles.profileAndTitle}>
              {(!selectedPolis.isUser && post.postInfo.userPhotoURL) ? (
                <Image
                  source={{ uri: post.postInfo.userPhotoURL }}
                  style={[
                    styles.profilePicSmall,
                    { borderColor: '#000000ff', borderWidth: 2 }
                  ]}
                />
              ) : null}
              <Text style={styles.postTitle}>{post.postInfo.title}</Text>
              </View>
              <Text style={styles.postDate}>
                {new Date(post.postInfo.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>
           
            <View style={styles.imageContainer}>
              {post.images?.slice(0, 1).map((img, index) => (
                <ProtectedImage
                  key={index}
                  url={img.imageUrl}
                  style={styles.thumbnail}
                  resizeMode="contain"
                />
              ))}
            </View>
          </TouchableOpacity>
        ))}

        {/* Load More Button */}
        {hasMorePosts && (
          <TouchableOpacity
            style={styles.loadMoreButton}
            onPress={handleLoadMore}
            disabled={isLoading}
          >
            <Text style={styles.loadMoreText}>
              {isLoading ? 'Loading...' : `Load More (${posts.length - visiblePostsCount} remaining)`}
            </Text>
            {!isLoading && (
              <MaterialIcons
                name="expand-more"
                size={20}
                style={styles.loadMoreIcon}
              />
            )}
          </TouchableOpacity>
        )}

        {/* Optional: Show total count */}
        {posts.length > postsPerPage && (
          <Text style={styles.postCountText}>
            Showing {visiblePostsCount} of {posts.length} posts
          </Text>
        )}
      </ThemedView>
    </>
  );
};
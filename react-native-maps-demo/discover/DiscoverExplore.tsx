import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { PolisType, DisplayPostInfo } from '@/types/types';
import ProtectedImage from '@/components/ProtectedImage';
import { MaterialIcons } from '@expo/vector-icons';
import { getExplore } from '@/services/api/posts';
import getTimeSincePosted from '@/functions/getTimeSincePosted';
import styles from '@/discover/ExploreStyles'

interface DiscoverExploreProps {
  onPolisSelect?: (polis: PolisType) => void;
  setSelectedPost: (post: DisplayPostInfo) => void;
  postsPerPage?: number;
}

export const DiscoverExplore: React.FC<DiscoverExploreProps> = ({
  onPolisSelect,
  setSelectedPost,
  postsPerPage = 10,
}) => {
  const [explorePosts, setExplorePosts] = useState<DisplayPostInfo[]>([]);
  const [currOffset, setCurrOffset] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [visiblePostsCount, setVisiblePostsCount] = useState<number>(0);

  // Fetch initial posts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const posts = await getExplore(postsPerPage, 0);
        setExplorePosts(posts);
        setVisiblePostsCount(posts.length);
        setCurrOffset(posts.length);
      } catch (error) {
        console.error("Failed to load explore posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Load more posts
  const handleLoadMore = async () => {
    setIsLoading(true);
    try {
      const morePosts = await getExplore(postsPerPage, currOffset);
      setExplorePosts(prev => [...prev, ...morePosts]);
      setVisiblePostsCount(prev => prev + morePosts.length);
      setCurrOffset(prev => prev + morePosts.length);
    } catch (error) {
      console.error("Failed to load more posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ThemedView style={styles.exploreHeader}>
        <Text style={styles.exploreTitle}>Explore</Text>
      </ThemedView>
      
    <ThemedView style={styles.postDisplay}>
      {explorePosts.slice(0, visiblePostsCount).map((post, index) => (
        <TouchableOpacity
          key={index}
          style={styles.postItem}
          onPress={() => setSelectedPost(post)}
        >
            <View style={styles.infoContainer}>
            <View style={styles.topRow}>
                {post.postInfo.userPhotoURL && (
                <Image
                    source={{ uri: post.postInfo.userPhotoURL }}
                    style={styles.userPhoto}
                />
                )}
                <View style={styles.userDetails}>
                <Text style={styles.userName}>{post.postInfo.userDisplayName}</Text>
                <Text style={styles.postDate}>
                {getTimeSincePosted(post.postInfo.date)}
                </Text>
                </View>
            </View>

            <Text style={styles.postTitle}>{post.postInfo.title}</Text>
            </View>

          <View style={styles.imageContainer}>
            {post.images?.slice(0, 1).map((img, idx) => (
              <ProtectedImage
                key={idx}
                url={img.imageUrl}
                style={styles.thumbnail}
                resizeMode="contain"
              />
            ))}
          </View>
        </TouchableOpacity>
      ))}

      {/* Load More Button */}
      {visiblePostsCount < explorePosts.length || true /* always allow paging in case more exists */ ? (
        <TouchableOpacity
          style={styles.loadMoreButton}
          onPress={handleLoadMore}
          disabled={isLoading}
        >
          <Text style={styles.loadMoreText}>
            {isLoading ? 'Loading...' : `Load More`}
          </Text>
          {!isLoading && (
            <MaterialIcons
              name="expand-more"
              size={20}
              style={styles.loadMoreIcon}
            />
          )}
        </TouchableOpacity>
      ) : null}

      {/* Optional: Post count info */}
      {explorePosts.length > 0 && (
        <Text style={styles.postCountText}>
          Showing {visiblePostsCount} of {explorePosts.length} posts
        </Text>
      )}
    </ThemedView>
    </>
  );
};

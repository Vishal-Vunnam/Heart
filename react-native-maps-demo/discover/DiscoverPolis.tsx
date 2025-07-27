// Extracted from original DiscoverModal.tsx

// DiscoverPolis.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { PolisType, DisplayPostInfo } from '@/types/types';
import { router } from 'expo-router';
import styles from './DiscoverStyles'; // Importing the styles
import ProtectedImage from '@/components/ProtectedImage';

interface DiscoverPolisProps {
  selectedPolis: PolisType;
  isLoggedInUser: boolean;
  posts: DisplayPostInfo[];
  onPolisSelect?: (polis: PolisType) => void;
  setSelectedPost: (post: DisplayPostInfo) => void;
}

export const DiscoverPolis: React.FC<DiscoverPolisProps> = ({
  selectedPolis,
  isLoggedInUser,
  posts,
  onPolisSelect,
  setSelectedPost,
}) => {
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
        <TouchableOpacity
          style={styles.infoRight}
          onPress={() => {
            if (onPolisSelect) onPolisSelect(selectedPolis);
          }}
        >          <View style={styles.infoLeft}>
            <Text style={styles.displayName}>
              {selectedPolis.isUser
                ? selectedPolis.userInfo.displayName || selectedPolis.userInfo.email
                : selectedPolis.tag}
            </Text>
          </View>
        </TouchableOpacity>
        </View>

      </ThemedView>

<ThemedView style={styles.postDisplay}>
  {posts.map((post, index) => (
    <TouchableOpacity
      key={index}
      style={styles.postItem}
      onPress={() => setSelectedPost(post)}
    >
      <View style={styles.infoContainer}>
        <Text style={styles.postTitle}>{post.postInfo.title}</Text>
        <Text style={styles.postDate}>
          {new Date(post.postInfo.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </Text>
      </View>

    <View style={styles.imageContainer}>
      {post.images?.slice(0, 2).map((img, index) => (
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
</ThemedView>

    </>
  );
};

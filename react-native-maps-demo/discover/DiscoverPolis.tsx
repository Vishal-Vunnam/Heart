// Extracted from original DiscoverModal.tsx

// DiscoverPolis.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { PolisType, DisplayPostInfo } from '@/types/types';
import { router } from 'expo-router';
import styles from './DiscoverStyles'; // Importing the styles
import ProtectedImage from '@/components/ProtectedImage';
import { MaterialIcons } from '@expo/vector-icons';
import { addFriend } from '@/services/api/user';
interface DiscoverPolisProps {
  selectedPolis: PolisType;
  isLoggedInUser: boolean;
  isUserFriend: boolean; 
  posts: DisplayPostInfo[];
  onPolisSelect?: (polis: PolisType) => void;
  setSelectedPost: (post: DisplayPostInfo) => void;
}

export const DiscoverPolis: React.FC<DiscoverPolisProps> = ({
  selectedPolis,
  isLoggedInUser,
  isUserFriend,
  posts,
  onPolisSelect,
  setSelectedPost
}) => {
  const [isFriend, setIsFriend] = useState<boolean>(isUserFriend);
const handleAddFriend = async () => {
  if(isLoggedInUser || !selectedPolis.isUser) return; 
  console.log("here")
  try{
    const followeeId = selectedPolis.userInfo.uid; 
    const addingFriend = await addFriend(followeeId);
    setIsFriend(true);
    console.log(addingFriend);
  }catch (error){ 

  }
}
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
          onPress={() => {
            if (onPolisSelect) onPolisSelect(selectedPolis);
          }}
        >     
          <Text style={styles.displayName}>
            {selectedPolis.isUser
              ? selectedPolis.userInfo.displayName || selectedPolis.userInfo.email
              : selectedPolis.tag}
          </Text>

               </TouchableOpacity>
          {selectedPolis.isUser && !isLoggedInUser && !isFriend && (
            <TouchableOpacity onPress={handleAddFriend}>
            <MaterialIcons
              name="person-add"
              size={20}
              style={styles.addFriendIcon}
            />
            </TouchableOpacity>
          )}
        </View>
          </View>
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

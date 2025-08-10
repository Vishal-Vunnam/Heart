import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { PostView } from '@/components/PostView';
import { DisplayPostInfo } from '@/types/types';
import { MaterialIcons } from '@expo/vector-icons';
import styles from './DiscoverStyles'; // Import the same styles as DiscoverPolis
import { getRandomColor } from '@/functions/getRandomColor';

interface DiscoverPostProps {
  post: DisplayPostInfo;
  onBack: () => void;
}

export const DiscoverPost: React.FC<DiscoverPostProps> = ({ post, onBack }) => {
  return (
    <ThemedView style={styles.container}>
      {/* Header section with back button - styled similarly to infoDisplay */}
      <ThemedView style={styles.infoDisplay}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <TouchableOpacity
            onPress={onBack}
            style={[styles.infoRight, { flexDirection: 'row', alignItems: 'center' }]}
            activeOpacity={0.8}
          >
            <MaterialIcons
              name="arrow-back"
              size={20}
              style={styles.addFriendIcon}
              color={getRandomColor()}
            />
            <Text style={[styles.displayName, { marginLeft: 8 }]}>
              Back to Posts
            </Text>
          </TouchableOpacity>
        </View>
      </ThemedView>

      {/* Post content section - styled similarly to postDisplay */}
      <ThemedView style={styles.postDisplay}>
        <PostView post={post} />
      </ThemedView>
    </ThemedView>
  );
};
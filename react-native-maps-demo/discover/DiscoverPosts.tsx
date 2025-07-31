// DiscoverPost.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PostView } from '@/components/PostView';
import { DisplayPostInfo } from '@/types/types';

interface DiscoverPostProps {
  post: DisplayPostInfo;
  onBack: () => void;
}

export const DiscoverPost: React.FC<DiscoverPostProps> = ({ post, onBack }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onBack}
        style={styles.backButton}
        activeOpacity={0.8}
      >
        <Text style={styles.backButtonText}>← Back to Posts</Text>
      </TouchableOpacity>
      <PostView post={post} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  backButton: {
    backgroundColor: '#000000ff',
    borderRadius: 16,
    margin: 16,
    marginBottom: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#000000ff',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: 'Anton_400Regular',
    letterSpacing: 0.5,
    textDecorationLine: 'underline',
  },
});
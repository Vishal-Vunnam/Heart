// DiscoverPost.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { PostView } from '@/components/PostView';
import { DisplayPostInfo } from '@/types/types';

interface DiscoverPostProps {
  post: DisplayPostInfo;
  onBack: () => void;
}

export const DiscoverPost: React.FC<DiscoverPostProps> = ({ post, onBack }) => {
  return (
    <>
      <TouchableOpacity
        onPress={onBack}
        style={{ padding: 12, backgroundColor: '#007AFF', borderRadius: 12, margin: 16 }}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>← Back to Posts</Text>
      </TouchableOpacity>
      <PostView post={post} />
    </>
  );
};

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions, ActivityIndicator, ScrollView } from 'react-native';
import { ThemedText } from './ThemedText';
import { getImageUrlWithSAS } from '@/firebase/blob-storage';
import { PolisType, PostDBInfo } from '@/types';
import DiscoverModal from './DiscoverModal';

interface CustomCalloutProps {
  post: PostDBInfo;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onViewDetails?: () => void;
  onSelectNewPolis?: (polis: PolisType) => void;
}

const CustomCallout: React.FC<CustomCalloutProps> = ({
  post,
  onLike,
  onComment,
  onShare,
  onViewDetails,
  onSelectNewPolis
}) => {
  const [imageLoadingStates, setImageLoadingStates] = useState<{ [key: number]: boolean }>({});
  const [imageErrorStates, setImageErrorStates] = useState<{ [key: number]: boolean }>({});


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      {/* Header - Fixed at top */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <View style={styles.authorRow}>
            <TouchableOpacity
              // onPress={() => {
              //   if (typeof onViewDetails === 'function') {
              //     onViewDetails();
              //   }
              //   if (typeof onAvatarPress === 'function') {
              //     onAvatarPress(post.authorId);
              //   }
              // }}
              style={styles.avatarTouchable}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {post.author?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
            </TouchableOpacity>
            <ThemedText style={styles.authorName}>{post.author}</ThemedText>
          </View>
          <View style={styles.postInfoRow}>
            <Text style={styles.postDate}>{formatDate(post.date)}</Text>
            <View style={styles.tagContainer}>
              {Array.isArray(post.tags) && post.tags.length > 0 ? (
                post.tags.map((tag: string, idx: number) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.tagButton}
                    activeOpacity={0.7}
                    onPress={() => {
                      if (typeof onSelectNewPolis === 'function') {
                        onSelectNewPolis({ isUser: false, tag });
                      }
                    }}
                  >
                    <Text style={styles.tagText}>#{tag}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noTagText}>No tags</Text>
              )}
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Text style={styles.moreButtonText}>⋯</Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentContainer}
      >
        {/* Content */}
        <View style={styles.content}>
          <ThemedText style={styles.title}>{post.title}</ThemedText>
          <ThemedText style={styles.description}>
            {post.description}
          </ThemedText>
        </View>

              {/* Multiple Images with loading placeholders */}
      {post.images_url_blob && post.images_url_blob.length > 0 && (
        <View style={styles.imageContainer}>
          {post.images_url_blob.map((imageUrl, index) => (
            <View key={index} style={styles.singleImageContainer}>
              {imageLoadingStates[index] && (
                <View style={[styles.image, styles.loadingContainer]}>
                  <ActivityIndicator size="small" color="#007AFF" />
                </View>
              )}
              <Image
                source={{ uri: getImageUrlWithSAS(imageUrl) }}
                style={[styles.image, imageLoadingStates[index] && styles.hidden]}
                onLoadStart={() => {
                  setImageLoadingStates(prev => ({ ...prev, [index]: true }));
                }}
                onLoadEnd={() => {
                  setImageLoadingStates(prev => ({ ...prev, [index]: false }));
                }}
                onError={() => {
                  setImageLoadingStates(prev => ({ ...prev, [index]: false }));
                  setImageErrorStates(prev => ({ ...prev, [index]: true }));
                }}
              />
              {imageErrorStates[index] && (
                <View style={[styles.image, styles.errorContainer]}>
                  <Text style={styles.errorText}>Failed to load image</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}
      </ScrollView>

      {/* Action Bar - Fixed at bottom */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionButton} onPress={onLike}>
          <Text style={styles.actionIcon}>❤️</Text>
          {/* <Text style={styles.actionText}>{post.likes || 0}</Text> */}
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={onComment}>
          <Text style={styles.actionIcon}>💬</Text>
          {/* <Text style={styles.actionText}>{post.comments || 0}</Text> */}
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={onShare}>
          <Text style={styles.actionIcon}>📤</Text>
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.viewDetailsButton} onPress={onViewDetails}>
          <Text style={styles.viewDetailsText}>View Details</Text>
        </TouchableOpacity>
      </View>

      {/* Arrow */}
      <View style={styles.arrow} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(32, 32, 32, 0.95)',
    borderRadius: 16,
    padding: 20, // Increased from 16
    minWidth: 380, // Increased from 340
    maxWidth: 450, // Increased from 400
    maxHeight: 400, // Increased from 400
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  scrollContent: {
    flex: 1,
    marginBottom: 8,
  },
  scrollContentContainer: {
    paddingBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    // alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  postDate: {
    color: '#BBB',
    fontSize: 12,
    marginTop: 2,
  },
  moreButton: {
    padding: 4,
  },
  moreButtonText: {
    color: '#BBB',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    marginBottom: 12,
  },
  title: {
    color: 'white',
    fontSize: 18, // Increased from 16
    fontWeight: 'bold',
    marginBottom: 8, // Increased from 6
  },
  description: {
    color: '#DDD',
    fontSize: 16, // Increased from 14
    lineHeight: 22, // Increased from 20
  },
  imageContainer: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  singleImageContainer: {
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 160, // Increased from 120
    borderRadius: 8,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  actionText: {
    color: '#BBB',
    fontSize: 12,
    fontWeight: '500',
  },
  viewDetailsButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  viewDetailsText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  arrow: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    marginLeft: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(32, 32, 32, 0.95)',
  },
  loadingContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hidden: {
    opacity: 0,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    textAlign: 'center',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  tagButton: {
    backgroundColor: 'transparent',
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginRight: 6,
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 24,  
  },
  tagText: {
    fontSize: 12,
    color: 'white',
    fontFamily: 'Averia', // Use Averia font
    fontWeight: 'bold',   // Make it bold
  },
  noTagText: {
    fontSize: 12,
    color: '#888',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    // justifyContent: 'center', // Remove centering
  },
  avatarTouchable: {
    marginRight: 10,
  },
  postInfoRow: {
    flexDirection: 'column',
    // alignItems: 'center', // Remove centering
    marginBottom: 8,
  },
});

export default CustomCallout; 
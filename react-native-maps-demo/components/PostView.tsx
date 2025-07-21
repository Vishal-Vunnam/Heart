import React from 'react';
import { StyleSheet, ScrollView, View, Dimensions } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import ProtectedImage from './ProtectedImage';

const { width } = Dimensions.get('window');

// Define the PostData type to match expected post prop
export type PostData = {
  title: string;
  description: string;
  date: string;
  authorName: string;
  images?: string[];
};

export const PostView = ({ post }: { post: PostData }) => {
  return (
    <View style={styles.container}>
      {/* Header Section with Gradient-like Effect */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <ThemedText style={styles.title}>{post.title}</ThemedText>
          <View style={styles.titleAccent} />
        </View>
        
        {/* Meta Info Row */}
        <View style={styles.metaRow}>
          <View style={styles.authorBadge}>
            <View style={styles.authorAvatar}>
              <ThemedText style={styles.authorInitial}>
                {post.authorName.charAt(0).toUpperCase()}
              </ThemedText>
            </View>
            <ThemedText style={styles.authorName}>{post.authorName}</ThemedText>
          </View>
          
          <View style={styles.dateBadge}>
            <ThemedText style={styles.dateText}>{post.date}</ThemedText>
          </View>
        </View>
      </View>

      {/* Description with Modern Typography */}
      <View style={styles.descriptionContainer}>
        <ThemedText style={styles.description}>{post.description}</ThemedText>
      </View>

      {/* Images Section with Enhanced Design */}
      {post.images && post.images.length > 0 && (
        <View style={styles.imagesSection}>
          <View style={styles.imagesSectionHeader}>
            <View style={styles.imagesDot} />
            <ThemedText style={styles.imagesLabel}>Gallery</ThemedText>
            <View style={styles.imagesCount}>
              <ThemedText style={styles.imagesCountText}>{post.images.length}</ThemedText>
            </View>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.imageScroll}
            contentContainerStyle={styles.imageScrollContent}
          >
            {post.images.map((img, idx) => (
              <View key={idx} style={styles.imageContainer}>
                <ProtectedImage 

                  url={img}
                  style={styles.image}
                />
                {/* Image overlay with subtle gradient effect */}
                <View style={styles.imageOverlay} />
              </View>
            ))}
          </ScrollView>
        </View>
      )}
      
      {/* Bottom accent */}
      <View style={styles.bottomAccent} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1F2937',
    borderRadius: 20,
    margin: 12,
    overflow: 'hidden',
    // Modern shadow for depth
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  
  header: {
    padding: 20,
    paddingBottom: 16,
    backgroundColor: '#374151',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  
  titleContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    lineHeight: 30,
    letterSpacing: -0.5,
  },
  
  titleAccent: {
    position: 'absolute',
    bottom: -4,
    left: 0,
    width: 40,
    height: 3,
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  authorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  
  authorInitial: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
  },
  
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E5E7EB',
  },
  
  dateBadge: {
    backgroundColor: '#4B5563',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  
  descriptionContainer: {
    padding: 20,
    paddingTop: 16,
  },
  
  description: {
    fontSize: 16,
    color: '#E5E7EB',
    lineHeight: 24,
    fontWeight: '400',
  },
  
  imagesSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  
  imagesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  imagesDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
    marginRight: 8,
  },
  
  imagesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D1D5DB',
    flex: 1,
  },
  
  imagesCount: {
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  
  imagesCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
  },
  
  imageScroll: {
    flexDirection: 'row',
  },
  
  imageScrollContent: {
    paddingRight: 20,
  },
  
  imageContainer: {
    position: 'relative',
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  
  image: {
    width: 140,
    height: 140,
    borderRadius: 16,
  },
  
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    borderRadius: 16,
  },
  
  bottomAccent: {
    height: 4,
    backgroundColor: '#3B82F6',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 2,
  },
});
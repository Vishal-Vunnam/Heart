import React from 'react';
import { StyleSheet, ScrollView, View, Dimensions } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { DisplayPostInfo } from '@/types/types';
import ProtectedImage from './ProtectedImage';
import { getRandomColor } from '@/functions/getRandomColor';

const { width } = Dimensions.get('window');

export const PostView = ({ post }: { post: DisplayPostInfo}) => {
  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <ThemedText style={styles.title}>{post.postInfo.title}</ThemedText>
          <View style={styles.titleAccent} />
        </View>
        
        {/* Meta Info Row */}
        <View style={styles.metaRow}>
          <View style={styles.authorBadge}>
            <View style={styles.authorAvatar}>
              <ThemedText style={styles.authorInitial}>
                {post.postInfo.userDisplayName.charAt(0).toUpperCase()}
              </ThemedText>
            </View>
            <ThemedText style={styles.authorName}>{post.postInfo.userDisplayName}</ThemedText>
          </View>
          
          <View style={styles.dateBadge}>
            <ThemedText style={styles.dateText}>{post.postInfo.date}</ThemedText>
          </View>
        </View>
      </View>

      {/* Description with Modern Typography */}
      <View style={styles.descriptionContainer}>
        <ThemedText style={styles.description}>{post.postInfo.description}</ThemedText>
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
                  url={img.url}
                  style={styles.image}
                />
                {/* Image overlay with subtle effect */}
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
    backgroundColor: '#ffffffff',
    borderRadius: 24,
    margin: 12,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#000000ff',
    // Enhanced shadow for depth
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  
  header: {
    padding: 20,
    paddingBottom: 16,
    backgroundColor: '#ffffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomWidth: 3,
    borderBottomColor: '#000000ff',
  },
  
  titleContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#000000ff',
    lineHeight: 32,
    letterSpacing: 0.4,
    fontFamily: 'Anton_400Regular',
    textDecorationLine: 'underline',
  },
  
  titleAccent: {
    position: 'absolute',
    bottom: -6,
    left: 0,
    width: 50,
    height: 4,
    backgroundColor: '#000000ff',
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
    backgroundColor: getRandomColor(),
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
  },
  
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  
  authorInitial: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000ff',
    fontFamily: 'Anton_400Regular',
  },
  
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffffff',
    fontFamily: 'Anton_400Regular',
    letterSpacing: 0.3,
  },
  
  dateBadge: {
    backgroundColor: '#ffffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#55555534',
  },
  
  dateText: {
    fontSize: 12,
    color: '#000000ff',
    fontWeight: '500',
    fontFamily: 'Koulen_400Regular',
  },
  
  descriptionContainer: {
    padding: 20,
    paddingTop: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#55555534',
  },
  
  description: {
    fontSize: 16,
    color: '#000000ff',
    lineHeight: 24,
    fontWeight: '400',
    fontFamily: 'Anton_400Regular',
    letterSpacing: 0.2,
  },
  
  imagesSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  
  imagesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#55555534',
  },
  
  imagesDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000000ff',
    marginRight: 12,
  },
  
  imagesLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000ff',
    flex: 1,
    fontFamily: 'Anton_400Regular',
    letterSpacing: 0.4,
    textDecorationLine: 'underline',
  },
  
  imagesCount: {
    backgroundColor: '#000000ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
    elevation: 2,
  },
  
  imagesCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
    fontFamily: 'Anton_400Regular',
  },
  
  imageScroll: {
    flexDirection: 'row',
  },
  
  imageScrollContent: {
    paddingRight: 20,
  },
  
  imageContainer: {
    position: 'relative',
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#55555534',
    elevation: 4,
  },
  
  image: {
    width: 140,
    height: 140,
    borderRadius: 14,
  },
  
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 14,
  },
  
  bottomAccent: {
    height: 6,
    backgroundColor: '#000000ff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 3,
  },
});
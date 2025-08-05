import { StyleSheet } from 'react-native';
import { getRandomColor } from '@/functions/getRandomColor';

// Consistent color palette
const COLORS = {
  white: '#ffffff',
  black: '#000000',
  gray: '#888888',
  lightGray: '#cccccc',
  darkGray: '#333333',
  error: '#ff4444',
  transparent: 'transparent',
};

// Consistent font families
const FONTS = {
  primary: 'Koulen_400Regular',
  secondary: 'Anton_400Regular',
};

// Consistent spacing
const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 40,
};

// Consistent border radius
const BORDER_RADIUS = {
  sm: 8,
  md: 20,
  lg: 100,
};

// Consistent elevation/shadow
const ELEVATION = {
  card: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
};

export default StyleSheet.create({
  // Main container
  exploreContainer: {
    flex: 1,
    backgroundColor: COLORS.transparent,
  },

  // Header section
  exploreHeader: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
    // ...ELEVATION.card,
  },

  exploreTitle: {
    fontSize: 32,
    textDecorationLine: 'underline',
    fontWeight: 'bold',
    color: COLORS.black,
    fontFamily: FONTS.primary,
    letterSpacing: 1.5,
    textAlign: 'center',
  },

  // Posts display container
  postDisplay: {
    marginTop: 0,
    backgroundColor: COLORS.transparent,
    flex: 1,
  },

  // Individual post item
  postItem: {
    flexDirection: 'column',
    padding: SPACING.lg,
    marginHorizontal: 0,
    marginBottom: SPACING.xxl,
    backgroundColor: COLORS.white,
    borderBottomColor: COLORS.darkGray,
    borderBottomWidth: 1,
    ...ELEVATION.card,
  },

  // Post info container - consistent styling
  infoContainer: {
    padding: 10,
    flexDirection: 'column',
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  // User info styling - made consistent
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  userPhoto: {
    width: SPACING.xxxxl,
    height: SPACING.xxxxl,
    borderRadius: SPACING.md,
    marginRight: SPACING.sm,
  },

  userDetails: {
    flexDirection: 'column',
    flex: 1,
  },

  userName: {
    fontWeight: 'bold',
    fontSize: 14,
    color: COLORS.black,
    fontFamily: FONTS.secondary,
  },

  postDate: {
    fontSize: 12,
    color: getRandomColor(),
    fontFamily: FONTS.secondary,
  },

  // Post content styling - made consistent
  postInfo: {
    alignItems: 'flex-start', // Changed from flex-end for better alignment
    marginTop: SPACING.sm,
  },

  postTitle: {
    fontSize: 18, // Increased for better hierarchy
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: SPACING.xs,
    lineHeight: 22,
    fontFamily: FONTS.secondary,
    textDecorationLine: 'underline',
  },

  postDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 18,
    fontFamily: FONTS.secondary,
  },

  // Post header with bullet and info
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },

  // Bullet point for list style
  bulletPoint: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    minWidth: SPACING.xl,
  },

  bulletText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    lineHeight: 24,
    fontFamily: FONTS.primary,
  },

  // Image container - full width Instagram style
  imageContainer: {
    width: '100%',
    marginTop: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Instagram-style image display
  instagramImageContainer: {
    width: '100%',
    aspectRatio: 1,
    marginBottom: SPACING.sm,
  },

  // Thumbnail styling - full width
  thumbnail: {
    // width: '100%',
    // height: '100%',
    resizeMode: 'contain', // Better for Instagram-like display
    borderRadius: BORDER_RADIUS.sm,
  },

  // Multiple images container
  multipleImagesContainer: {
    width: '100%',
    flexDirection: 'row',
    columnGap: SPACING.xs,
    marginBottom: 10,
  },

  // For when there are 2 images
  halfWidthImage: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: BORDER_RADIUS.sm,
  },

  // Load more button
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    marginTop: SPACING.lg,
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 2,
    borderColor: COLORS.black,
    ...ELEVATION.card,
  },

  // Load more text
  loadMoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginRight: SPACING.sm,
    fontFamily: FONTS.secondary,
    textDecorationLine: 'underline',
  },

  // Load more icon
  loadMoreIcon: {
    color: COLORS.black,
    borderColor: COLORS.black,
    borderWidth: 2,
    borderRadius: BORDER_RADIUS.lg,
    padding: 2,
  },

  // Post count text
  postCountText: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.gray,
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
    fontFamily: FONTS.primary,
  },

  // Loading states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },

  loadingText: {
    fontSize: 16,
    color: COLORS.gray,
    fontFamily: FONTS.secondary,
    textAlign: 'center',
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxxxl,
  },

  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    fontFamily: FONTS.secondary,
    fontStyle: 'italic',
  },

  // Error state
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxxxl,
  },

  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
    fontFamily: FONTS.secondary,
    marginBottom: SPACING.lg,
  },

  retryButton: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 2,
    borderColor: COLORS.black,
    ...ELEVATION.card,
  },

  retryButtonText: {
    color: COLORS.black,
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: FONTS.secondary,
    textAlign: 'center',
  },
  addFriends: { 
    color: getRandomColor(),
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: FONTS.secondary,
    textAlign: 'center',
  }
});
import { StyleSheet } from 'react-native';

// Styles for DiscoverExplore component based on existing theme consensus
export default StyleSheet.create({
  // Main container
  exploreContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
    infoContainer: {
    padding: 10,
    flexDirection: 'column',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  userPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  userDetails: {
    flexDirection: 'column',
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  postDate: {
    fontSize: 12,
    color: 'gray',
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '600',
    
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postInfo: {
    alignItems: 'flex-end',
  },

  // Header section
  exploreHeader: {
    backgroundColor: '#ffffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    elevation: 4,
  },

  exploreTitle: {
    fontSize: 32,
    textDecorationLine: 'underline',
    fontWeight: 'bold',
    color: '#000000ff',
    fontFamily: 'Koulen_400Regular',
    letterSpacing: 1.5,
    textAlign: 'center',
  },

  // Posts display container
  postDisplay: {
    marginTop: 0,
    backgroundColor: 'transparent',
    flex: 1,
  },

  // Individual post item - changed to column layout
  postItem: {
    flexDirection: 'column',
    padding: 16,
    marginHorizontal: 0,
    marginBottom: 24,
    backgroundColor: '#ffffffff',
    borderBottomColor: '#333',
    borderBottomWidth: 1,
    elevation: 4,
  },

  // Post header with bullet and info
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },

  // Bullet point for list style
  bulletPoint: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    minWidth: 20,
  },

  bulletText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000ff',
    lineHeight: 24,
  },

  // Info container for post details
//   infoContainer: {
//     flex: 1,
//     paddingRight: 12,
//   },

//   // Post title styling
//   postTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#000',
//     marginBottom: 4,
//     lineHeight: 22,
//     fontFamily: 'Anton_400Regular',
//     textDecorationLine: 'underline',
//   },
  // Image container - full width Instagram style
  imageContainer: {
    width: '100%',
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Instagram-style image display
  instagramImageContainer: {
    width: '100%',
    aspectRatio: 1, // Square aspect ratio like Instagram
    marginBottom: 8,
  },

  // Thumbnail styling - full width
  thumbnail: {
    resizeMode: 'contain', // Changed to cover for Instagram-like display
    borderRadius: 8,
    marginBottom: 8, 
  },

  // Multiple images container
  multipleImagesContainer: {
    width: '100%',
    flexDirection: 'row',
    columnGap: 4,
    marginBottom: 10, 

  },

  // For when there are 2 images
  halfWidthImage: {
    flex: 1,
    aspectRatio: 1,
  },

  // Load more button
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: '#ffffffff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'black',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  // Load more text
  loadMoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000ff',
    marginRight: 8,
    fontFamily: 'Anton_400Regular',
    textDecorationLine: 'underline',
  },

  // Load more icon
  loadMoreIcon: {
    color: '#000000ff',
    borderColor: 'black',
    borderWidth: 2,
    borderRadius: 100,
    padding: 2,
  },

  // Post count text
  postCountText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#888',
    marginTop: 8,
    marginBottom: 16,
    fontFamily: 'Koulen_400Regular',
  },

  // Loading states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  loadingText: {
    fontSize: 16,
    color: '#888',
    fontFamily: 'Anton_400Regular',
    textAlign: 'center',
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },

  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    fontFamily: 'Anton_400Regular',
    fontStyle: 'italic',
  },

  // Error state
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },

  errorText: {
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
    fontFamily: 'Anton_400Regular',
    marginBottom: 16,
  },

  retryButton: {
    backgroundColor: '#ffffffff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'black',
    elevation: 4,
  },

  retryButtonText: {
    color: '#000000ff',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'Anton_400Regular',
    textAlign: 'center',
  },
});
import { StyleSheet } from 'react-native';

// Enhanced styles for DiscoverModal component
export default StyleSheet.create({
  // Main container with better backdrop
  discoverView: {
    backgroundColor: 'transparent',
    flex: 1,
  },
  
  // Enhanced modal overlay with better backdrop
  discoverModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)', // Darker, more professional backdrop
    justifyContent: 'flex-end',
    zIndex: 100,
    elevation: 100,
    borderTopColor: 'black',
    borderTopWidth: 2, 
  },
  
  // Improved modal content container
  discoverModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
        borderTopColor: 'black',
    borderTopWidth: 2, 
    height: '85%', // Increased height for better content display
    paddingTop: 0,
    backgroundColor: '#1a1a1a', // Darker, more modern background
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 16,
  },
  
  // Enhanced drag handle
  dragHandle: {
    width: 50,
    height: 5,
    
    backgroundColor: '#555',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  
  // Posts container with better spacing
  postsContainer: {
    zIndex: 1,
    flex: 1,
    paddingHorizontal: 0,
  },
  
  // Enhanced search box container
  searchBoxContainer: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 0,
    zIndex: 1000,
    position: 'relative',
    marginBottom: 8,
    borderColor: 'black',
    borderWidth: 2,
  },
  
  // Improved search box wrapper
  searchBoxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: 'black',
    borderWidth: 2,
    width: '100%',
    height: 30, // Increased height for better touch targets
    borderRadius: 22,
    paddingHorizontal: 16,
    backgroundColor: '#ffffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  
  // Enhanced search icon
  icon: {
    marginRight: 12,
    color: '#888',
  },
  
  // Improved search input
  searchBox: {
    flex: 1,
    fontSize: 16,
    color: '#000000ff',
    backgroundColor: 'transparent',
    paddingVertical: 0,
   fontFamily: 'Anton_400Regular'

  },
  addFriendIcon :{ 
  borderColor: 'black',
  borderWidth: 3,
  borderRadius: 100, 
  padding: 3, 
  marginLeft: 8, 


  },
  // Enhanced suggestion box
  suggestionBox: {
    position: 'absolute',
    top: 48,
    left: 16,
    right: 16,
    backgroundColor: '#fffdfdff',
    borderRadius: 12,
    marginTop: 4,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    maxHeight: 250,
    overflow: 'hidden',
    zIndex: 1001,
    borderColor: 'black',
    borderWidth: 2,
  },
  
  // Improved suggestion items
  suggestionItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: 'transparent',
    fontFamily: 'Anton_400Regular'
  },
  
  // Enhanced user name styling
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  
  // Enhanced user email styling
  userEmail: {
    fontSize: 14,
    color: '#888',
  },
  
  // Improved info display
  infoDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffffff',
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 20,
    minHeight: 80,
    shadowColor: '#000',
    elevation: 4,
    borderBottomColor: 'black',
    borderBottomWidth: 2,
  },
  
  // Enhanced info left section
  infoLeft: {
    flex: 1,
    justifyContent: 'center',
  },
  
  // Improved display name
  displayName: {
    color: '#000000ff',
    fontWeight: 'bold',
    letterSpacing: 0.5,
    fontFamily: 'Koulen_400Regular',
    fontSize: 31,
  },
  
  // Enhanced settings button
  settingsButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  
  settingsText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  
  // Improved info right section
  infoRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 80,
    marginLeft: 12,
  },
  
  // Enhanced stat labels
  infoStatLabel: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Averia',
    textAlign: 'right',
  },
  
  infoStatValue: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 2,
    fontFamily: 'Averia',
    textAlign: 'right',
  },
  
postDisplay: {
  marginTop: 0,
  backgroundColor: 'transparent',
  flex: 1,
},

postItem: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: 16,
  marginHorizontal: 16,
  marginBottom: 0,
  borderBottomColor: '#333',
  borderBottomWidth: 1,
  elevation: 4,
},

infoContainer: {
  flex: 1,
  paddingRight: 12,
},

imageContainer: {
  flexDirection: 'row',
  marginLeft: 12,
},
thumbnail: {
  width: 84,
  height: 84,
  resizeMode: 'contain',  // Important: maintain aspect ratio
  overflow: 'hidden',     // Optional: clip anything that bleeds out
  backgroundColor: 'transparent', // Optional: if image doesn't fill the area, gives a fallback
},


postTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#000',
  marginBottom: 4,
  lineHeight: 22,
  fontFamily: 'Anton_400Regular',
  textDecorationLine: 'underline',
},

postDate: {
  fontSize: 12,
  color: '#888',
  marginBottom: 2,
  fontFamily: 'Koulen_400Regular',
},

postAuthor: {
  fontSize: 12,
  color: '#888',
  fontStyle: 'italic',
},

  
  // Improved no posts message
  noPosts: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 40,
    fontStyle: 'italic',
  },
  
  // Enhanced view city button
  viewCityButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 8,
  },
  
  viewCityButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  profilePicSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
    backgroundColor: '#222',
    borderWidth: 1,
    borderColor: '#fff',
  },
  profilePicMedium: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 14,
    backgroundColor: '#222',
    borderWidth: 2,
    borderColor: '#fff',
  },
});

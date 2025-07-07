# Heart - React Native Maps Demo

A React Native application that allows users to create location-based posts with images, view them on an interactive map, and discover content from other users.

## 🚀 Features

- **Interactive Map**: View posts on a map with custom markers
- **Location-Based Posts**: Create posts with titles, descriptions, and images at specific locations
- **Image Upload**: Upload images to Azure Blob Storage with automatic URL generation
- **User Authentication**: Firebase authentication integration
- **Post Discovery**: Browse and discover posts from other users
- **Real-time Updates**: Posts are stored in Firebase Firestore for real-time synchronization

## 🛠️ Tech Stack

- **Frontend**: React Native with Expo
- **Maps**: react-native-maps
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Image Storage**: Azure Blob Storage
- **Navigation**: Expo Router
- **UI Components**: Custom themed components

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)
- Azure Storage Account
- Firebase Project

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd react-native-maps-demo
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure Azure Blob Storage**
   - Copy `azure-config.example.ts` to `azure-config.ts`
   - Fill in your Azure Storage Account details:
     ```typescript
     export const AZURE_CONFIG = {
       STORAGE_ACCOUNT: 'your-storage-account',
       CONTAINER_NAME: 'your-container-name',
       SAS_TOKEN: 'your-sas-token',
     };
     ```

4. **Configure Firebase**
   - Copy `firebase/firebaseConfig.example.ts` to `firebase/firebaseConfig.ts`
   - Add your Firebase configuration:
     ```typescript
     export const firebaseConfig = {
       apiKey: "your-api-key",
       authDomain: "your-project.firebaseapp.com",
       projectId: "your-project-id",
       storageBucket: "your-project.appspot.com",
       messagingSenderId: "your-sender-id",
       appId: "your-app-id"
     };
     ```

5. **Set up Azure Storage**
   - Create a Storage Account in Azure Portal
   - Create a container for storing images
   - Generate a SAS token with Read/Write permissions
   - Configure CORS settings to allow your app domain

6. **Set up Firebase**
   - Create a Firebase project
   - Enable Authentication and Firestore
   - Add your app to the Firebase project
   - Download and add configuration files

## 🚀 Running the App

### Development
```bash
# Start the development server
npx expo start

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android
```

### Production Build
```bash
# Build for iOS
npx expo build:ios

# Build for Android
npx expo build:android
```

## 📱 Usage

### Creating Posts
1. Navigate to the map view
2. Tap the "+" button to create a new post
3. Fill in the post details:
   - Title
   - Description
   - Add images (optional)
   - Set visibility (Public/Private)
4. Tap "Post Location" to save

### Viewing Posts
1. Posts appear as markers on the map
2. Tap a marker to view post details
3. Images in posts are clickable for full-screen view

### Discovering Content
1. Tap the glasses icon to open the discover modal
2. Browse posts from other users
3. Tap on posts to view them on the map

## 🏗️ Project Structure

```
react-native-maps-demo/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Main map view
│   │   ├── post.tsx       # Post creation
│   │   └── interact.tsx   # Interaction features
│   └── signin.tsx         # Authentication
├── components/            # Reusable components
│   ├── PostModal.tsx      # Post creation modal
│   ├── DiscoverModal.tsx  # Content discovery modal
│   └── ThemedView.tsx     # Themed container
├── firebase/              # Firebase configuration
│   ├── firebaseConfig.ts  # Firebase setup
│   ├── firestore.ts       # Database operations
│   └── blob-storage.ts    # Azure blob operations
├── types/                 # TypeScript type definitions
├── constants/             # App constants
└── assets/               # Images and static files
```

## 🔐 Security

- Sensitive configuration files are gitignored
- API keys and secrets are stored in environment variables
- Azure SAS tokens have limited scope and expiration
- Firebase security rules should be configured for production

## 🐛 Troubleshooting

### Common Issues

1. **Images not loading**
   - Check Azure SAS token permissions
   - Verify CORS settings in Azure Storage
   - Ensure image URLs are accessible

2. **Firebase connection issues**
   - Verify Firebase configuration
   - Check network connectivity
   - Ensure Firebase project is properly set up

3. **Map not displaying**
   - Check location permissions
   - Verify API keys for map services
   - Ensure device has internet connection

### Debug Mode
Enable debug logging by setting `__DEV__` to true in your environment.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Expo team for the excellent development platform
- React Native Maps for the mapping functionality
- Firebase for backend services
- Azure for cloud storage solutions

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the documentation

---

**Note**: This is a demo project. For production use, ensure proper security measures, error handling, and performance optimizations are implemented.

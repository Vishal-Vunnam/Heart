// expo-firebase-auth.d.ts
declare module 'expo-firebase-auth' {
  import type { FirebaseApp } from 'firebase/app';
  import type AsyncStorageType from '@react-native-async-storage/async-storage';

  export function initializeAuth(
    app: FirebaseApp,
    options: { persistence: any }
  ): any;

  export function getReactNativePersistence(
    storage: AsyncStorageType
  ): any;
}
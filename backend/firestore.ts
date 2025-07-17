import { getFirestore, updateDoc } from 'firebase/firestore';
import { app } from './firebaseConfig';
import { getDocs, doc, deleteDoc, getDoc, query, where } from 'firebase/firestore';
import { collection, addDoc } from 'firebase/firestore';
import { uploadToAzureBlob, deleteFromAzureBlob } from './src/utils/blobStorage';
import type { PostDBInfo, PostRequestInfo, UserInfo } from '@/types/types';
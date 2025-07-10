// =====================
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Internal imports
import { getPostbyAuthorID, getAllUsers } from '@/firebase/firestore';
import { getImageUrlWithSAS } from '@/firebase/blob-storage';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { PolisType, PostData } from '@/types';
type Post = {
  title: string;
  description: string;
  date: string;
  author: string;
  images?: string[];
};

export const PostView = ({ post }: { post: PostData }) => {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>{post.title}</ThemedText>
      <ThemedText style={styles.description}>{post.description}</ThemedText>
      <ThemedText style={styles.date}>{post.date}</ThemedText>
      <ThemedText style={styles.author}>By: {post.authorName}</ThemedText>
      {post.images && post.images.length > 0 && (
        <ScrollView horizontal style={styles.imageScroll}>
          {post.images.map((img, idx) => (
            <Image
              key={idx}
              source={{ uri: getImageUrlWithSAS(img) }}
              style={styles.image}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 10,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  description: {
    fontSize: 16,
    marginBottom: 6,
  },
  date: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  imageScroll: {
    marginTop: 8,
    flexDirection: 'row',
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 10,
  },
});
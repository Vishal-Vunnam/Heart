
import { View, Text, StyleSheet } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { getPostbyAuthorID } from '@/firebase/firestore';
const UserModal = (userId: string, userName: string, userEmail: string, isUser:boolean) => {
  const [open, setOpen] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    if (isUser) {
      setOpen(true);
    }
  }, [isUser]);

  useEffect(() => {
    if (userId) {
      const fetchUser = async () => {
        const posts = await getPostbyAuthorID(userId);
        setPosts(posts);
      };
      fetchUser();
    }
  }, [userId]);
  return (
    <View>
      <Text>{userName}</Text>
      <Text style={styles.email}>{userEmail}</Text>
      <View style={styles.postsContainer}>
        <Text style={styles.postsTitle}>Posts</Text>
        {posts.map((post, index) => (
          <View key={post.postId || index} style={styles.postItem}>
            <Text style={styles.postTitle}>{post.title}</Text>
            <Text style={styles.postDescription}>{post.description}</Text>
            <Text style={styles.postDate}>{new Date(post.date).toLocaleDateString()}</Text>
          </View>
        ))}
        {posts.length === 0 && (
          <Text style={styles.noPosts}>No posts found</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  email: {
    fontSize: 16,
    color: 'blue',
  },
  postsContainer: {
    marginTop: 20,
  },
  postsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  postItem: {
    marginBottom: 10,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  postDescription: {
    fontSize: 14,
  },
  postDate: {
    fontSize: 12,
    color: 'gray',
  },
  noPosts: {
    fontSize: 16,
    color: 'gray',
  },
});

export default UserModal;   
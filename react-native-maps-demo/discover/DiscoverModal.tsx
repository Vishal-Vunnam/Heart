// DiscoverModal.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
} from 'react-native';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPostsByAuthorId } from '@/services/api/posts';
import { searchPolis } from '@/services/api/search';
import { getCurrentUser } from '@/services/auth/fireAuth';
import { ThemedView } from '@/components/ThemedView';
import { PolisType, PostInfo, UserInfo, DisplayPostInfo, PolisSearchReturn } from '@/types/types';
import { DiscoverPolis } from './DiscoverPolis';
import { DiscoverPost } from './DiscoverPosts';
import styles from './DiscoverStyles';

const SEARCH_HISTORY_KEY = 'search_history';

export async function saveSearch(search: PolisSearchReturn) {
  let history = await getSearchHistory();
  history = [
    search,
    ...history.filter((item) => {
      if (search.is_tag && item.is_tag) {
        return item.name !== search.name;
      }
      if (!search.is_tag && !item.is_tag) {
        return item.id !== search.id;
      }
      return true;
    }),
  ];
  history = history.slice(0, 10);
  await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
}

export async function getSearchHistory(): Promise<PolisSearchReturn[]> {
  const raw = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function clearSearchHistory() {
  await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
}

interface DiscoverModalProps {
  onPostSelect: (post: PostInfo) => void;
  onPolisSelect?: (polis: PolisType) => void;
  setPolis: PolisType | null;
  selectedPostIdFromParent: DisplayPostInfo | null;
  setPostId: (post: DisplayPostInfo | null) => void;
}

const DiscoverModal: React.FC<DiscoverModalProps> = ({ onPostSelect, onPolisSelect, setPolis, selectedPostIdFromParent, setPostId }) => {
  const [posts, setPosts] = useState<DisplayPostInfo[]>([]);
  const [isLoggedInUser, setIsLoggedInUser] = useState(false);
  const [selectedPolis, setSelectedPolis] = useState<PolisType | null>(null);
  const textInputRef = useRef<TextInput>(null);
  const [searchText, setSearchText] = useState('');
  const [selectedPost, setSelectedPost] = useState<DisplayPostInfo | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [polisSuggestions, setPolisSuggestions] = useState<PolisSearchReturn[]>([]);
  const [isSearchingPolis, setIsSearchingPolis] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<PolisSearchReturn[]>([]);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setSelectedPolis(setPolis);
    setSelectedPost(selectedPostFromParent);
    (async () => {
      try {
        const currentUser = await getCurrentUser();
        if (setPolis?.isUser && setPolis.userInfo?.uid) {
          setIsLoggedInUser(currentUser?.uid === setPolis.userInfo.uid);
        } else {
          setIsLoggedInUser(false);
        }
      } catch {
        setIsLoggedInUser(false);
      }
    })();
  }, [setPolis, selectedPostFromParent]);

  useEffect(() => {
    if (selectedPolis?.isUser) {
      setFilteredUsers([]);
      getPostsByAuthorId(selectedPolis.userInfo.uid).then((userPosts) => {
        setPosts(userPosts.posts);
      });
    }
  }, [selectedPolis]);

  useEffect(() => {
    if (!isTyping) return;
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    if (searchText.trim().length === 0) {
      getSearchHistory().then(setFilteredUsers);
      setPolisSuggestions([]);
      setIsSearchingPolis(false);
      return;
    }
    setIsSearchingPolis(true);
    debounceTimeout.current = setTimeout(async () => {
      try {
        const results = await searchPolis(searchText.trim());
        setPolisSuggestions(results);
      } catch {
        setPolisSuggestions([]);
      }
      setIsSearchingPolis(false);
    }, 600);
  }, [searchText, isTyping]);

  const handleSearchInputChange = (text: string) => {
    setSearchText(text);
    setIsTyping(true);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ padding: 16 }}>
          <ThemedView style={styles.searchBoxWrapper}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <EvilIcons name="search" size={20} color="#888" style={{ marginRight: 8 }} />
              <TextInput
                ref={textInputRef}
                style={styles.searchBox}
                placeholder="Search, #tag, location"
                placeholderTextColor="#888"
                onChangeText={handleSearchInputChange}
                value={searchText}
                onFocus={async () => {
                  setIsTyping(true);
                  if (searchText.trim().length === 0) {
                    const history = await getSearchHistory();
                    setFilteredUsers(history);
                  }
                }}
                onBlur={() => setIsTyping(false)}
              />
            </View>
          </ThemedView>

          {/* Suggestions */}
          {isTyping ? (
            <View style= {styles.suggestionBox}>
              {isSearchingPolis && <Text style={{ textAlign: 'center', color: '#888' }}>Searching...</Text>}
              {searchText.trim().length > 0 && polisSuggestions.length > 0
                ? polisSuggestions.map((suggestion, index) => (
                    <TouchableOpacity
                      key={index}
    
                      onPress={() => {
                        if (suggestion.is_tag) {
                          setSelectedPolis({ isUser: false, tag: suggestion.name });
                          setSearchText(`#${suggestion.name}`);
                        } else {
                          setSelectedPolis({
                            isUser: true,
                            userInfo: {
                              displayName: suggestion.name,
                              email: '',
                              uid: suggestion.id,
                              photoURL: null,
                            },
                          });
                          setSearchText(suggestion.name);
                        }
                        setIsTyping(false);
                        setPolisSuggestions([]);
                        textInputRef.current?.blur();
                        saveSearch(suggestion);
                      }}
                    >
                      <Text style={styles.suggestionItem}>{suggestion.is_tag ? `#${suggestion.name}` : suggestion.name}</Text>
                    </TouchableOpacity>
                  ))
                : !isSearchingPolis &&
                  filteredUsers.map((suggestion, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        if (suggestion.is_tag) {
                          setSelectedPolis({ isUser: false, tag: suggestion.name });
                          setSearchText(`#${suggestion.name}`);
                        } else {
                          setSelectedPolis({
                            isUser: true,
                            userInfo: {
                              displayName: suggestion.name,
                              email: '',
                              uid: suggestion.id,
                              photoURL: null,
                            },
                          });
                          setSearchText(suggestion.name);
                        }
                        setIsTyping(false);
                        setPolisSuggestions([]);
                        textInputRef.current?.blur();
                      }}
                    >
                      <Text style={styles.suggestionItem}>{suggestion.is_tag ? `#${suggestion.name}` : suggestion.name}</Text>
                    </TouchableOpacity>
                  ))}
            </View>
          ) : selectedPolis && !selectedPost ? (
            <DiscoverPolis
              selectedPolis={selectedPolis}
              isLoggedInUser={isLoggedInUser}
              posts={posts}
              onPolisSelect={onPolisSelect}
              setSelectedPost={setSelectedPost}
            />
          ) : selectedPost ? (
            <DiscoverPost post={selectedPost} onBack={() => setSelectedPost(null)} />
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default DiscoverModal;

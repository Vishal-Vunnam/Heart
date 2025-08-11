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
  Touchable,
} from 'react-native';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPostsByAuthorId, getPost, getPostsByTag } from '@/services/api/posts';
import { searchPolis } from '@/services/api/search';
import { getCurrentUser } from '@/services/auth/fireAuth';
import { ThemedView } from '@/components/ThemedView';
import { PolisType, PostInfo, UserInfo, DisplayPostInfo, PolisSearchReturn, MarkerPostInfo } from '@/types/types';
import { DiscoverPolis } from './DiscoverPolis';
import { PostView } from '@/discover/PostView';
import styles from './DiscoverStyles';
import { isFriend } from '@/services/api/user';
import { DiscoverExplore } from './DiscoverExplore';
import { MaterialIcons } from '@expo/vector-icons';
import { TouchableWithoutFeedback } from 'react-native';
import { dismiss } from 'expo-router/build/global-state/routing';
import { DisplayPostInfoToMarkerPostInfo } from '@/functions/polisTypeConverter';
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
  onPostSelect: (post: MarkerPostInfo, polis: PolisType) => void;
  onPolisSelect?: (polis: PolisType) => void;
  setPolis: PolisType | null;
  selectedPostIdFromParent: string;
  setPostId: (postId: string | null) => void;
}

const DiscoverModal: React.FC<DiscoverModalProps> = ({ onPostSelect, onPolisSelect, setPolis, selectedPostIdFromParent, setPostId }) => {
  const [posts, setPosts] = useState<DisplayPostInfo[]>([]);
  const [isLoggedInUser, setIsLoggedInUser] = useState(false);
  const [selectedPolis, setSelectedPolis] = useState<PolisType | null>(null);
  const [isUserFriend, setIsUserFriend] = useState<boolean>(false);
  const textInputRef = useRef<TextInput>(null);
  const [searchText, setSearchText] = useState('');
  const [selectedPost, setSelectedPost] = useState<DisplayPostInfo | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [polisSuggestions, setPolisSuggestions] = useState<PolisSearchReturn[]>([]);
  const [isSearchingPolis, setIsSearchingPolis] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<PolisSearchReturn[]>([]);
  // const [userFriend, setUserFriends] = useState<string[]> 
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
  const fetchData = async () => {
    try {
      setSelectedPolis(setPolis);

      if (selectedPostIdFromParent !== "") {
      const postTmp = await getPost(selectedPostIdFromParent);
      setSelectedPost(postTmp);
      }

      // const currentUser = await getCurrentUser();
      // if (setPolis?.isUser && setPolis.userInfo?.uid) {
      //   setIsLoggedInUser(currentUser?.uid === setPolis.userInfo.uid);
      // } else {
      //   setIsLoggedInUser(false);
      // }
    } catch (error) {
      console.error('Error in useEffect:', error);
      setIsLoggedInUser(false);
    }
  };

  fetchData();
}, [setPolis, selectedPostIdFromParent]);


useEffect(() => {
  const fetchData = async () => {
    if (selectedPolis?.isUser) {
      try {
        const currentUser = await getCurrentUser();
        if (selectedPolis.userInfo?.uid) {

          const uid1 = currentUser?.uid ? String(currentUser.uid).trim() : '';
          const uid2 = selectedPolis.userInfo.uid ? String(selectedPolis.userInfo.uid).trim() : '';
          const loggedInUserTemp = uid1 === uid2;
          setIsLoggedInUser(loggedInUserTemp);
          const isItAFriend = await isFriend(uid2)
          console.log(isItAFriend);
          setIsUserFriend(isItAFriend);
          // setUserFriends(friendsTemp.friends);
        } else {
          setIsLoggedInUser(false);
        }


        setFilteredUsers([]);

        const userPosts = await getPostsByAuthorId(selectedPolis.userInfo.uid);
        setPosts(userPosts.posts);
      } catch (error) {
        setIsLoggedInUser(false);
        setPosts([]);
      }
    }
    else if (selectedPolis?.tag) {
      try {
        setIsLoggedInUser(false);
        setIsUserFriend(false);
        setFilteredUsers([]);

        const tagPosts = await getPostsByTag(selectedPolis.tag);
        setPosts(tagPosts.posts);
      } catch (error) {
        console.error("Error in fetchData useEffect:", error);
        setPosts([]);
      }
    } else {
      setPosts([]);
      setIsLoggedInUser(false);
      setIsUserFriend(false);
    }
  };

  fetchData();
}, [selectedPolis]);

const dismissTyping = () => {
  setIsTyping(false);
  setSearchText('');
  setPolisSuggestions([]);
  textInputRef.current?.blur();
}

// export type PolisSearchReturn = {
//     name: string;
//     photoUrl?: string | null;
//     id: string;
//     is_tag: boolean;
// }
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
    <TouchableWithoutFeedback onPress={dismissTyping}>
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
      scrollEnabled={!selectedPost} // <-- DISABLE outer scroll while a post is open
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
                      style={styles.suggestionItemContainer}
                      onPress={() => {
                        if (suggestion.is_tag) {
                          setSelectedPolis({ isUser: false, tag: suggestion.name });
                          setSearchText(`#${suggestion.name}`);
                        } else {
                          setSelectedPolis({
                            isUser: true,
                            userInfo: {
                              displayName: suggestion.name,
                              uid: suggestion.id,
                              photoURL: suggestion.photoUrl || null,
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
                      {suggestion.photoUrl && ( 
                        <Image
                          source={{ uri: suggestion.photoUrl }}
                          style={styles.suggestionImage}
                        />
                      )}
                      <Text style={styles.suggestionItem}>{suggestion.is_tag ? `#${suggestion.name}` : suggestion.name}</Text>
                      <MaterialIcons name="close" size={24} color="#888" />
                    </TouchableOpacity>
                  ))
                : !isSearchingPolis &&
                  filteredUsers.map((suggestion, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.suggestionItemContainer}
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
                              photoURL: suggestion.photoUrl || null,
                            },
                          });
                          setSearchText(suggestion.name);
                        }
                        dismissTyping();
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
              isUserFriend={isUserFriend}
              posts={posts}
              onPolisSelect={onPolisSelect}
              setSelectedPost={(post) => {
              if(selectedPolis && post && post.postInfo && post.postInfo.postId) {
              onPostSelect?.(DisplayPostInfoToMarkerPostInfo(post), selectedPolis); ;
              }}
              }
            />
            ) : selectedPost ? (
            <PostView
              post={selectedPost}
              isLoggedInUser={isLoggedInUser}
              onPostSelect={onPostSelect}
              setSelectedPost={setSelectedPost}
              setPostId={setPostId}
              onBack={() => {
              setSelectedPost(null);
              }}
            />
          ) : null}
          {!selectedPolis && !selectedPost && !selectedPostIdFromParent && (
          <DiscoverExplore
            onPolisSelect={onPolisSelect}
            setSelectedPost={(post, polis) => {
              console.log("Post selected in DiscoverExplore:", post, polis);
              if(polis && post && post.postInfo && post.postInfo.postId) {
                console.log("KSJFKAJSHFKJH");
              onPostSelect?.(DisplayPostInfoToMarkerPostInfo(post), polis); ;
              }}
            }
            postsPerPage={5}
          />
        )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default DiscoverModal;

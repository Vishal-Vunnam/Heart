import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView, FlatList } from 'react-native';
import EvilIcons from '@expo/vector-icons/EvilIcons';
import Feather from '@expo/vector-icons/Feather';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

export default function FriendsScreen() {
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<'Activity' | 'Chat'>('Activity');
  const textInputRef = useRef<TextInput>(null);

  // Sample activity data
  const [activities, setActivities] = useState([
    { id: '1', user: 'John Doe', action: 'liked your pin', time: '2 mins ago' },
    { id: '2', user: 'Jane Smith', action: 'commented on your pin', time: '5 mins ago' },
    { id: '3', user: 'Alice Johnson', action: 'shared your pin', time: '10 mins ago' },
  ]);

  const handleClearFocus = () => {
    setIsTyping(false);
    textInputRef.current?.blur();
  };

  // Render function for activity cards
  const renderActivity = ({ item }: { item: { id: string; user: string; action: string; time: string } }) => (
    <View style={styles.activityCard}>
      <Text style={styles.activityText}>
        <Text style={styles.boldText}>{item.user}</Text> {item.action}
      </Text>
      <Text style={styles.timeText}>{item.time}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <View style={styles.searchBoxWrapper}>
            <EvilIcons name="search" size={24} color="#888" style={styles.icon} />
            <TextInput
              ref={textInputRef}
              style={styles.searchBox}
              placeholder="Find Profiles"
              placeholderTextColor="#888"
              onFocus={() => setIsTyping(true)}
            />
            {isTyping && (
              <TouchableOpacity onPress={handleClearFocus} style={styles.closeButton}>
                <Feather name="x-circle" size={24} color="#888" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Conditional Rendering Based on Typing */}
        {!isTyping ? (
          <View style={styles.content}>
            {/* Tabs */}
            <View style={styles.tabsContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'Activity' && styles.activeTab]}
                onPress={() => setActiveTab('Activity')}
              >
                <ThemedText style={[styles.tabText, activeTab === 'Activity' && styles.activeTabText]}>
                  Activity
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'Chat' && styles.activeTab]}
                onPress={() => setActiveTab('Chat')}
              >
                <ThemedText style={[styles.tabText, activeTab === 'Chat' && styles.activeTabText]}>
                  Chat
                </ThemedText>
              </TouchableOpacity>
            </View>

            {/* Tab Content */}
            <View style={styles.tabContent}>
              {activeTab === 'Activity' ? (
                <FlatList
                  data={activities}
                  renderItem={renderActivity}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.activityList}
                />
              ) : (
                <ThemedText>Chat tab content goes here</ThemedText>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.searchContent}>
            <ThemedText>Search functionality goes here</ThemedText>
          </View>
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchBarContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  searchBoxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    backgroundColor: 'white',
    height: 40,
  },
  icon: {
    marginRight: 8,
  },
  searchBox: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  content: {
    flex: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007bff',
  },
  tabText: {
    fontSize: 16,
    color: '#888',
  },
  activeTabText: {
    color: '#007bff',
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
  },
  closeButton: {
    marginLeft: 10,
  },
  activityList: {
    padding: 10,
  },
  activityCard: {
    padding: 15,
    borderBottomWidth: 1, // Add this line
    borderBottomColor: '#ddd',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  activityText: {
    fontSize: 16,
    color: '#333',
  },
  boldText: {
    fontWeight: 'bold',
  },
  timeText: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  searchContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    padding: 10,
  },
});
import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9fafb',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    maxHeight: 200
  },
  resultItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  resultContent: {
    flex: 1
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151'
  },
  messageText: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2
  },
  highlightText: {
    backgroundColor: '#fef3c7',
    fontWeight: '600'
  },
  emptyContainer: {
    paddingVertical: 16,
    alignItems: 'center'
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 14
  },
  resultCount: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#6b7280',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  }
});

const highlightText = (text, query) => {
  if (!query) return text;
  
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, `***$1***`);
};

export const MessageSearchResults = ({ results, query, onSelectResult }) => {
  if (!query || results.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <Text style={styles.emptyText}>
          {query ? 'No messages found' : 'Type to search messages'}
        </Text>
      </View>
    );
  }

  const renderResult = ({ item, index }) => {
    const parts = item.content.split(new RegExp(`(${query})`, 'gi'));
    
    return (
      <Pressable 
        style={styles.resultItem}
        onPress={() => onSelectResult(item)}
      >
        <MaterialIcons name="mail" size={16} color="#9ca3af" />
        <View style={styles.resultContent}>
          <Text style={styles.senderName}>
            {item.senderId?.username || 'Unknown'}
          </Text>
          <Text 
            style={styles.messageText} 
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {parts.map((part, idx) => 
              part.toLowerCase() === query.toLowerCase() 
                ? <Text key={idx} style={styles.highlightText}>{part}</Text>
                : <Text key={idx}>{part}</Text>
            )}
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={18} color="#d1d5db" />
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.resultCount}>
        {results.length} result{results.length !== 1 ? 's' : ''}
      </Text>
      <FlatList
        data={results}
        renderItem={renderResult}
        keyExtractor={(item, index) => `${item._id}-${index}`}
        scrollEnabled={false}
      />
    </View>
  );
};

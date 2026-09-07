import React, { useState, useCallback } from 'react';
import { View, TextInput, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 8
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  iconButton: {
    padding: 8
  },
  resultCount: {
    fontSize: 12,
    color: '#6b7280',
    paddingHorizontal: 8
  }
});

export const MessageSearchBar = ({ onSearch, onClose, resultCount = 0 }) => {
  const [query, setQuery] = useState('');

  const handleSearchChange = useCallback((text) => {
    setQuery(text);
    onSearch(text);
  }, [onSearch]);

  const handleClear = useCallback(() => {
    setQuery('');
    onSearch('');
  }, [onSearch]);

  return (
    <View style={styles.container}>
      <MaterialIcons name="search" size={20} color="#6b7280" />
      <TextInput
        style={styles.searchInput}
        placeholder="Search messages..."
        value={query}
        onChangeText={handleSearchChange}
        placeholderTextColor="#d1d5db"
      />
      {query.length > 0 && (
        <>
          <Pressable onPress={handleClear} style={styles.iconButton}>
            <MaterialIcons name="close" size={20} color="#6b7280" />
          </Pressable>
        </>
      )}
      {query.length > 0 && resultCount > 0 && (
        <View>
          <Pressable onPress={onClose} style={styles.iconButton}>
            <MaterialIcons name="arrow-upward" size={20} color="#2563eb" />
          </Pressable>
        </View>
      )}
    </View>
  );
};

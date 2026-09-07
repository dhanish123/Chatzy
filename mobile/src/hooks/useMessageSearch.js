import { useState, useCallback } from 'react';
import { searchMessages } from '../utils/messageSearch.js';

export const useMessageSearch = (messages = []) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);

  const performSearch = useCallback((query) => {
    if (!query || query.trim().length === 0) {
      setSearchQuery('');
      setSearchResults([]);
      setCurrentResultIndex(0);
      return;
    }

    const results = searchMessages(messages, query);
    setSearchQuery(query);
    setSearchResults(results);
    setCurrentResultIndex(0);

    // Highlight first result
    if (results.length > 0) {
      setHighlightedMessageId(results[0]._id);
    }
  }, [messages]);

  const moveToNextResult = useCallback(() => {
    if (searchResults.length === 0) return;

    const nextIndex = (currentResultIndex + 1) % searchResults.length;
    setCurrentResultIndex(nextIndex);
    setHighlightedMessageId(searchResults[nextIndex]._id);
  }, [searchResults, currentResultIndex]);

  const moveToPreviousResult = useCallback(() => {
    if (searchResults.length === 0) return;

    const prevIndex = currentResultIndex === 0 ? searchResults.length - 1 : currentResultIndex - 1;
    setCurrentResultIndex(prevIndex);
    setHighlightedMessageId(searchResults[prevIndex]._id);
  }, [searchResults, currentResultIndex]);

  const clearSearch = useCallback(() => {
    setIsSearching(false);
    setSearchQuery('');
    setSearchResults([]);
    setHighlightedMessageId(null);
    setCurrentResultIndex(0);
  }, []);

  const toggleSearchMode = useCallback(() => {
    if (isSearching) {
      clearSearch();
    } else {
      setIsSearching(true);
    }
  }, [isSearching, clearSearch]);

  return {
    isSearching,
    setIsSearching,
    searchQuery,
    searchResults,
    highlightedMessageId,
    currentResultIndex,
    performSearch,
    moveToNextResult,
    moveToPreviousResult,
    clearSearch,
    toggleSearchMode
  };
};

'use client';

import { useState } from 'react';
import { searchSuggestions, Suggestion } from '../services/search';

export const useSearch = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const search = async (query: string, categories?: string[]) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchSuggestions(query, categories as any);
      setSuggestions(results);
    } catch (error) {
      console.error('Search failed:', error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  return {
    suggestions,
    isSearching,
    search,
    selectedCategories,
    setSelectedCategories
  };
};
'use client';

import { useMemo } from 'react';
import { Conversation } from '@/API';
import Fuse from 'fuse.js';

interface UseConversationSearchProps {
  conversations: Conversation[];
  searchQuery: string;
  currentUserId: string;
}

export function useConversationSearch({
  conversations,
  searchQuery,
}: UseConversationSearchProps) {
  const fuse = useMemo(() => {
    const options = {
      keys: [
        { name: 'propertyTitle', weight: 0.6 },
        { name: 'lastMessage', weight: 0.4 },
      ],
      threshold: 0.4,
      distance: 100,
      minMatchCharLength: 1,
      includeScore: true,
      includeMatches: true,
    };

    return new Fuse(conversations, options);
  }, [conversations]);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) {
      return conversations;
    }

    const results = fuse.search(searchQuery.trim());
    return results.map(result => result.item);
  }, [conversations, searchQuery, fuse]);

  return {
    filteredConversations,
    isSearching: false,
  };
}

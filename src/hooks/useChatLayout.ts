'use client';

import { useState, useEffect } from 'react';

export function useChatLayout() {
  const [showConversationList, setShowConversationList] = useState(true);

  const handleSelectConversation = () => {
    if (window.innerWidth < 768) {
      setShowConversationList(false);
    }
  };

  const handleBackToConversations = () => {
    setShowConversationList(true);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && !showConversationList) {
        setShowConversationList(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showConversationList]);

  return {
    showConversationList,
    handleSelectConversation,
    handleBackToConversations,
  };
}

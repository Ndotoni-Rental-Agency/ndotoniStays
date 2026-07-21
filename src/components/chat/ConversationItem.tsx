'use client';

import React from 'react';
import { Conversation } from '@/API';
import { toTitleCase } from '@/lib/utils/common';
import { Home, MessageCircle } from 'lucide-react';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  currentUserId: string;
  onSelect: (conversationId: string) => void;
}

export function ConversationItem({
  conversation,
  isSelected,
  currentUserId,
  onSelect,
}: ConversationItemProps) {
  const displayName = toTitleCase(conversation.otherPartyName) || 'User';
  const profileImage = conversation.otherPartyImage;
  const isDirectChat = conversation.conversationType === 'direct';

  const getInitials = () => {
    const parts = displayName.split(' ');
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return displayName.charAt(0).toUpperCase();
  };

  const unreadCount = conversation.unreadCount || 0;

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    if (diffInHours < 48) return 'Yesterday';
    if (diffInHours < 168) return date.toLocaleDateString('en-US', { weekday: 'short' });
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="px-2 py-0.5">
      <button
        onClick={() => onSelect(conversation.id)}
        className={`w-full p-3 flex items-center gap-3 rounded-xl text-left transition-all duration-150 ${
          isSelected
            ? 'bg-brand-50 dark:bg-brand-900/20 ring-1 ring-brand-200 dark:ring-brand-800'
            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
        }`}
      >
        <div className="flex-shrink-0 relative">
          <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold overflow-hidden ${
            isSelected
              ? 'bg-brand-500 text-white'
              : 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
          }`}>
            {profileImage ? (
              <img src={profileImage} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <span>{getInitials()}</span>
            )}
          </div>
          {unreadCount > 0 && !isSelected && (
            <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-brand-500 rounded-full border-2 border-white dark:border-gray-800" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <h3 className={`text-sm font-semibold truncate ${
              unreadCount > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-200'
            }`}>
              {displayName}
            </h3>
            <span className={`text-[11px] flex-shrink-0 ml-2 ${
              unreadCount > 0 ? 'text-brand-600 dark:text-brand-400 font-medium' : 'text-gray-400 dark:text-gray-500'
            }`}>
              {formatTime(conversation.lastMessageTime)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <p className={`text-[13px] truncate ${
              unreadCount > 0 ? 'font-medium text-gray-800 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
            }`}>
              {conversation.lastMessage || 'No messages yet'}
            </p>
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-bold text-white bg-brand-500 rounded-full">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>

          {conversation.propertyTitle && !isDirectChat && (
            <div className="flex items-center gap-1 mt-1">
              <Home className="w-3 h-3 text-gray-400 dark:text-gray-500 flex-shrink-0" />
              <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
                {conversation.propertyTitle}
              </p>
            </div>
          )}
          {isDirectChat && (
            <div className="flex items-center gap-1 mt-1">
              <MessageCircle className="w-3 h-3 text-brand-400 dark:text-brand-500 flex-shrink-0" />
              <p className="text-[11px] text-brand-500 dark:text-brand-400 truncate">
                Direct message
              </p>
            </div>
          )}
        </div>
      </button>
    </div>
  );
}

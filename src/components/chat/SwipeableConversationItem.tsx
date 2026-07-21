'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Conversation } from '@/API';
import { toTitleCase } from '@/lib/utils/common';

interface SwipeableConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  currentUserId: string;
  onSelect: (conversationId: string) => void;
  onDelete: (conversationId: string) => void;
}

export function SwipeableConversationItem({
  conversation,
  isSelected,
  currentUserId,
  onSelect,
  onDelete,
}: SwipeableConversationItemProps) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);

  const displayName = toTitleCase(conversation.otherPartyName) || 'User';
  const profileImage = conversation.otherPartyImage;

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

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    currentXRef.current = e.touches[0].clientX;
    const deltaX = currentXRef.current - startXRef.current;
    if (deltaX < 0) {
      const maxSwipe = 100;
      let offset = deltaX;
      if (Math.abs(deltaX) > maxSwipe) {
        const excess = Math.abs(deltaX) - maxSwipe;
        offset = -(maxSwipe + Math.min(excess * 0.3, 30));
      }
      setSwipeOffset(offset);
      setShowDeleteButton(Math.abs(offset) > 50);
    } else if (deltaX > 0 && swipeOffset < 0) {
      const newOffset = Math.min(swipeOffset + deltaX, 0);
      setSwipeOffset(newOffset);
      setShowDeleteButton(Math.abs(newOffset) > 50);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (Math.abs(swipeOffset) > 60) {
      setSwipeOffset(-80);
      setShowDeleteButton(true);
    } else {
      setSwipeOffset(0);
      setShowDeleteButton(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(conversation.id);
  };

  const handleClick = () => {
    if (showDeleteButton) {
      setSwipeOffset(0);
      setShowDeleteButton(false);
    } else {
      onSelect(conversation.id);
    }
  };

  useEffect(() => {
    setSwipeOffset(0);
    setShowDeleteButton(false);
  }, [conversation.id]);

  return (
    <div className="relative overflow-hidden">
      <div
        className={`absolute right-0 top-0 bottom-0 flex items-center justify-center transition-all duration-300 ease-out ${
          showDeleteButton ? 'w-20 opacity-100' : 'w-0 opacity-0'
        }`}
        style={{ background: 'linear-gradient(90deg, transparent 0%, #ef4444 20%, #dc2626 100%)' }}
      >
        <button
          onClick={handleDelete}
          className="text-white p-3 rounded-lg hover:bg-red-600/20 transition-colors flex items-center justify-center w-full h-full"
          title="Delete conversation"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <div
        ref={itemRef}
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="bg-white dark:bg-gray-800 relative z-10"
      >
        <button
          onClick={handleClick}
          className={`w-full p-4 flex items-center space-x-3 text-left transition-all duration-200 ${
            isSelected ? 'bg-gray-50 dark:bg-brand-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
          }`}
        >
          <div className="flex-shrink-0">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-semibold overflow-hidden transition-colors ${
              isSelected ? 'bg-gray-900 dark:bg-brand-900' : 'bg-gray-400 dark:bg-gray-600'
            }`}>
              {profileImage ? (
                <img src={profileImage} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <span>{getInitials()}</span>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className={`text-base font-semibold truncate transition-colors ${
                isSelected ? 'text-gray-900 dark:text-brand-400' : 'text-gray-900 dark:text-white'
              }`}>
                {displayName}
              </h3>
              <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTime(conversation.lastMessageTime)}
                </span>
                {unreadCount > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-gray-900 dark:bg-brand-900 rounded-full min-w-[20px] h-5">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <p className={`text-sm truncate ${
                unreadCount > 0 ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
              }`}>
                {conversation.lastMessage || 'No messages yet'}
              </p>
              {conversation.propertyTitle && (
                <div className="flex items-center space-x-1">
                  <svg className="w-3 h-3 text-gray-400 dark:text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{conversation.propertyTitle}</p>
                </div>
              )}
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

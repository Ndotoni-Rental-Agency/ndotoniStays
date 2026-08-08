'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '@/API';
import { renderTextWithLinks } from '@/lib/utils/linkRenderer';
import { toTitleCase } from '@/lib/utils/common';

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];
const EMOJI_PICKER_OPTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🎉', '🔥', '👏', '😍', '🤔', '😡'];

interface MessageBubbleProps {
  message: ChatMessage;
  isOwnMessage: boolean;
  senderName: string;
  senderImage?: string;
  myUserId?: string;
  onDelete?: (messageId: string) => void;
  onReply?: (message: ChatMessage) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onJumpToMessage?: (messageId: string) => void;
  selectionMode?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  onEnterSelectionMode?: () => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
  senderName,
  senderImage,
  myUserId,
  onDelete,
  onReply,
  onReact,
  onJumpToMessage,
  selectionMode = false,
  isSelected = false,
  onSelect,
  onEnterSelectionMode,
}) => {
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const messageRef = useRef<HTMLDivElement>(null);

  const displayName = toTitleCase(senderName);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } else if (diffInHours < 48) {
      return 'Yesterday ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
        date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
  };

  const openActionMenu = () => {
    if (selectionMode) return;
    setShowActionMenu(true);
  };

  const handleTouchStart = () => {
    if (selectionMode) return;
    setIsPressed(true);
    longPressTimer.current = setTimeout(() => {
      openActionMenu();
      if (navigator.vibrate) navigator.vibrate(50);
    }, 500);
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleMouseDown = () => {
    if (selectionMode) return;
    setIsPressed(true);
    longPressTimer.current = setTimeout(() => openActionMenu(), 500);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleClick = () => {
    if (selectionMode && onSelect) onSelect();
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (selectionMode) return;
    openActionMenu();
  };

  const handleDelete = () => {
    if (onDelete) onDelete(message.id);
    setShowActionMenu(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setShowActionMenu(false);
  };

  const handleReply = () => {
    if (onReply) onReply(message);
    setShowActionMenu(false);
  };

  const handleQuickReact = (emoji: string) => {
    if (onReact) onReact(message.id, emoji);
    setShowActionMenu(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (messageRef.current && !messageRef.current.contains(event.target as Node)) {
        setShowActionMenu(false);
      }
    };
    if (showActionMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showActionMenu]);

  useEffect(() => {
    return () => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };
  }, []);

  return (
    <div
      ref={messageRef}
      className={`flex items-end space-x-2 relative ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}
      onClick={handleClick}
    >
      {selectionMode && (
        <div className="flex-shrink-0 mb-1">
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
            isSelected
              ? 'bg-brand-500 border-brand-500'
              : 'border-stone-300 dark:border-gray-600 bg-white dark:bg-gray-700'
          }`}>
            {isSelected && (
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
      )}

      {!isOwnMessage && !selectionMode && (
        <div className="flex-shrink-0 mb-1">
          <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-700 dark:text-brand-300 text-xs font-semibold overflow-hidden">
            {senderImage ? (
              <img src={senderImage} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <span>{displayName.charAt(0).toUpperCase()}</span>
            )}
          </div>
        </div>
      )}

      <div className={`flex flex-col max-w-[75%] sm:max-w-[65%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
        <div className="relative">
          <div
            className={`px-4 py-2.5 rounded-2xl relative transition-all duration-150 ${
              selectionMode ? 'cursor-pointer' : 'select-none'
            } ${isPressed && !selectionMode ? 'scale-95' : 'scale-100'} ${
              isSelected ? 'ring-2 ring-brand-500 ring-offset-2 dark:ring-offset-gray-800' : ''
            } ${
              isOwnMessage
                ? 'bg-brand-500 text-white rounded-br-sm shadow-sm'
                : 'bg-white dark:bg-gray-700 text-ink-900 dark:text-white rounded-bl-sm border border-stone-200 dark:border-gray-600'
            }`}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onContextMenu={handleContextMenu}
          >
            {message.replyToContent && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (message.replyToMessageId && onJumpToMessage) onJumpToMessage(message.replyToMessageId);
                }}
                className={`block w-full text-left mb-1.5 px-2.5 py-1.5 rounded-lg border-l-2 truncate ${
                  isOwnMessage
                    ? 'bg-white/15 border-white/70'
                    : 'bg-black/5 dark:bg-white/10 border-brand-500'
                }`}
              >
                <div className={`text-xs font-semibold truncate ${isOwnMessage ? 'text-white/90' : 'text-brand-600 dark:text-brand-400'}`}>
                  {message.replyToSenderName}
                </div>
                <div className={`text-xs truncate ${isOwnMessage ? 'text-white/75' : 'text-gray-500 dark:text-gray-400'}`}>
                  {message.replyToContent}
                </div>
              </button>
            )}

            <div className="text-sm whitespace-pre-wrap break-words leading-relaxed">
              {renderTextWithLinks(message.content)}
            </div>
          </div>

          {message.reactions && message.reactions.length > 0 && (
            <div className={`flex flex-wrap gap-1 mt-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
              {message.reactions.map(r => (
                <button
                  key={r.emoji}
                  onClick={() => onReact && onReact(message.id, r.emoji)}
                  className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs border transition-colors ${
                    myUserId && r.userIds.includes(myUserId)
                      ? 'bg-brand-50 dark:bg-brand-900/30 border-brand-400'
                      : 'bg-white dark:bg-gray-700 border-stone-200 dark:border-gray-600'
                  }`}
                >
                  <span>{r.emoji}</span>
                  {r.userIds.length > 1 && (
                    <span className="text-gray-500 dark:text-gray-400 font-medium">{r.userIds.length}</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {showActionMenu && !selectionMode && (
            <div className={`absolute top-0 z-50 ${
              isOwnMessage ? 'right-0 transform translate-x-full' : 'left-0 transform -translate-x-full'
            }`}>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-600 overflow-hidden min-w-[180px]">
                <div className="flex items-center justify-between px-2 py-2 border-b border-gray-100 dark:border-gray-700">
                  {QUICK_REACTIONS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => handleQuickReact(emoji)}
                      className="w-8 h-8 flex items-center justify-center text-lg hover:scale-125 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                  <button
                    onClick={() => { setShowEmojiPicker(true); setShowActionMenu(false); }}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    title="More reactions"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
                <div className="py-2">
                  <button
                    onClick={handleReply}
                    className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 w-full text-left transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                    </svg>
                    <span>Reply</span>
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 w-full text-left transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy</span>
                  </button>
                  <button
                    onClick={() => { if (onEnterSelectionMode) onEnterSelectionMode(); setShowActionMenu(false); }}
                    className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 w-full text-left transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Select</span>
                  </button>
                  {onDelete && (
                    <button
                      onClick={handleDelete}
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Delete for me</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {showEmojiPicker && (
            <div className={`absolute top-0 z-50 ${
              isOwnMessage ? 'right-0 transform translate-x-full' : 'left-0 transform -translate-x-full'
            }`}>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-600 p-3 grid grid-cols-4 gap-1 w-[168px]">
                {EMOJI_PICKER_OPTIONS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => { if (onReact) onReact(message.id, emoji); setShowEmojiPicker(false); }}
                    className="w-9 h-9 flex items-center justify-center text-lg rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {!selectionMode && (
          <div className={`flex items-center space-x-2 mt-1 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatTime(message.timestamp)}
            </span>
            {isOwnMessage && (
              <svg
                className={`w-3.5 h-3.5 ${message.readAt ? 'text-brand-500' : 'text-gray-400 dark:text-gray-500'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        )}
      </div>

      {(showActionMenu || showEmojiPicker) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setShowActionMenu(false); setShowEmojiPicker(false); }}
        />
      )}
    </div>
  );
};

export default MessageBubble;

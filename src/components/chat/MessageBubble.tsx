'use client';

import React, { useRef } from 'react';
import { ChatMessage } from '@/API';
import { renderTextWithLinks } from '@/lib/utils/linkRenderer';
import { toTitleCase } from '@/lib/utils/common';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwnMessage: boolean;
  senderName: string;
  senderImage?: string;
  myUserId?: string;
  onOpenActions: (message: ChatMessage) => void;
  onReact: (messageId: string, emoji: string) => void;
  onJumpToMessage?: (messageId: string) => void;
  selectionMode?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
  senderName,
  senderImage,
  myUserId,
  onOpenActions,
  onReact,
  onJumpToMessage,
  selectionMode = false,
  isSelected = false,
  onSelect,
}) => {
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const longPressFired = useRef(false);

  const displayName = toTitleCase(senderName);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const startLongPress = () => {
    if (selectionMode) return;
    longPressFired.current = false;
    longPressTimer.current = setTimeout(() => {
      longPressFired.current = true;
      onOpenActions(message);
      if (navigator.vibrate) navigator.vibrate(50);
    }, 450);
  };

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleClick = () => {
    if (selectionMode && onSelect) {
      onSelect();
      return;
    }
    // Swallow the click that follows a long-press-triggered touch, so it
    // doesn't also register as a tap once the sheet opens.
    if (longPressFired.current) {
      longPressFired.current = false;
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (selectionMode) return;
    onOpenActions(message);
  };

  return (
    <div className={`group flex items-end gap-2 relative ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
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
          <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-700 dark:text-brand-300 text-xs font-semibold overflow-hidden">
            {senderImage ? (
              <img src={senderImage} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <span>{displayName.charAt(0).toUpperCase()}</span>
            )}
          </div>
        </div>
      )}

      {/* Hover action bar — desktop only, in normal flow so it can never be clipped */}
      {!selectionMode && (
        <div className={`hidden sm:flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity mb-1 ${isOwnMessage ? 'order-first' : 'order-last'}`}>
          <button
            onClick={() => onReact(message.id, '👍')}
            className="w-7 h-7 flex items-center justify-center rounded-full text-sm bg-white dark:bg-gray-700 border border-stone-200 dark:border-gray-600 shadow-sm hover:scale-110 transition-transform"
            title="Quick react"
          >
            🙂
          </button>
          <button
            onClick={() => onOpenActions(message)}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-white dark:bg-gray-700 border border-stone-200 dark:border-gray-600 shadow-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            title="More"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v.01M12 12v.01M12 18v.01" />
            </svg>
          </button>
        </div>
      )}

      <div className={`flex flex-col max-w-[75%] sm:max-w-[65%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
        <div
          onClick={handleClick}
          onContextMenu={handleContextMenu}
          onTouchStart={startLongPress}
          onTouchEnd={cancelLongPress}
          onTouchMove={cancelLongPress}
          onMouseDown={startLongPress}
          onMouseUp={cancelLongPress}
          onMouseLeave={cancelLongPress}
          className={`relative px-3.5 py-2 shadow-sm transition-transform ${
            selectionMode ? 'cursor-pointer' : 'cursor-default select-none'
          } ${isSelected ? 'ring-2 ring-brand-500 ring-offset-2 dark:ring-offset-gray-800' : ''} ${
            isOwnMessage
              ? 'bg-brand-500 text-white rounded-2xl rounded-br-md'
              : 'bg-white dark:bg-gray-700 text-ink-900 dark:text-white rounded-2xl rounded-bl-md border border-stone-200 dark:border-gray-600'
          }`}
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

          {!selectionMode && (
            <div className={`flex items-center gap-1 mt-1 ${isOwnMessage ? 'justify-end' : 'justify-end'}`}>
              <span className={`text-[11px] ${isOwnMessage ? 'text-white/70' : 'text-gray-400 dark:text-gray-500'}`}>
                {formatTime(message.timestamp)}
              </span>
              {isOwnMessage && (
                <svg
                  className={`w-3.5 h-3.5 ${message.readAt ? 'text-sky-300' : 'text-white/70'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          )}
        </div>

        {message.reactions && message.reactions.length > 0 && (
          <div className={`flex flex-wrap gap-1 mt-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
            {message.reactions.map(r => (
              <button
                key={r.emoji}
                onClick={() => onReact(message.id, r.emoji)}
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
      </div>
    </div>
  );
};

export default MessageBubble;

'use client';

import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';

interface ReplyPreview {
  senderName: string;
  content: string;
}

interface ChatInputProps {
  onSendMessage: (content: string) => Promise<void>;
  onTextChange?: (text: string) => void;
  replyingTo?: ReplyPreview | null;
  onCancelReply?: () => void;
  disabled?: boolean;
  placeholder?: string;
  initialMessage?: string;
  isEmpty?: boolean;
  messageCount?: number;
  sendingMessage?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onTextChange,
  replyingTo,
  onCancelReply,
  disabled = false,
  placeholder = 'Type your message...',
  initialMessage = '',
  messageCount = 0,
  sendingMessage = false,
}) => {
  const [message, setMessage] = useState('');
  const [lastInitialMessage, setLastInitialMessage] = useState('');
  const [hasSentMessage, setHasSentMessage] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (messageCount > 0) {
      setMessage('');
      setLastInitialMessage('');
      setHasSentMessage(true);
    } else if (initialMessage && initialMessage !== lastInitialMessage && !hasSentMessage) {
      if (!message || message === lastInitialMessage) {
        setMessage(initialMessage);
        setLastInitialMessage(initialMessage);
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
          }
        }, 0);
      }
    } else if (!initialMessage) {
      setMessage('');
      setLastInitialMessage('');
      setHasSentMessage(false);
    }
  }, [initialMessage, hasSentMessage, messageCount]);

  useEffect(() => {
    if (textareaRef.current && messageCount === 0) {
      setTimeout(() => textareaRef.current?.focus(), 500);
    }
  }, [messageCount]);

  useEffect(() => {
    if (textareaRef.current && message) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSend = async () => {
    if (message.trim() && !disabled && !isSending) {
      const messageToSend = message.trim();
      try {
        setIsSending(true);
        setHasSentMessage(true);
        await onSendMessage(messageToSend);
        setMessage('');
        setLastInitialMessage('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
      } catch (error) {
        console.error('Error sending message:', error);
        setHasSentMessage(false);
        const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
        if (errorMessage.includes('External URLs are not allowed')) {
          alert('External URLs are not allowed in messages. Only property links are permitted.');
        } else if (errorMessage.includes('Message content too long')) {
          alert('Message is too long. Please keep messages under 2000 characters.');
        } else {
          alert(`Failed to send message: ${errorMessage}. Please try again.`);
        }
      } finally {
        setIsSending(false);
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setMessage(newValue);
    if (newValue.trim() && onTextChange) onTextChange(newValue);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className="border-t border-stone-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 sm:px-6 py-3">
      {replyingTo && (
        <div className="flex items-center gap-2 mb-2 pl-3 pr-2 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-2 border-brand-500">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 truncate">
              Replying to {replyingTo.senderName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{replyingTo.content}</p>
          </div>
          <button
            onClick={onCancelReply}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <div className="flex-1 flex items-end bg-gray-100 dark:bg-gray-700 rounded-3xl px-4 py-2 focus-within:ring-2 focus-within:ring-brand-500/40 transition-all">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            rows={1}
            className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed py-1"
            style={{ minHeight: '24px', maxHeight: '120px', overflowY: message.length > 100 ? 'auto' : 'hidden' }}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!message.trim() || disabled || isSending || sendingMessage}
          className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-full bg-brand-500 hover:bg-brand-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white transition-colors"
          title="Send message"
        >
          {isSending || sendingMessage ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5 -rotate-45 -translate-x-px" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.94 2.94a1.5 1.5 0 011.61-.35l12.5 5a1.5 1.5 0 010 2.82l-12.5 5a1.5 1.5 0 01-2.02-1.87L4.5 10 2.53 4.46a1.5 1.5 0 01.41-1.52z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatInput;

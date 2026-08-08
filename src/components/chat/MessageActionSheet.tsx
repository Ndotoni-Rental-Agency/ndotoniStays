'use client';

import React, { useState } from 'react';
import { ChatMessage } from '@/API';

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];
const EMOJI_PICKER_OPTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🎉', '🔥', '👏', '😍', '🤔', '😡'];

interface MessageActionSheetProps {
  message: ChatMessage;
  onClose: () => void;
  onReply: (message: ChatMessage) => void;
  onReact: (messageId: string, emoji: string) => void;
  onEnterSelectionMode: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
}

/**
 * Message actions, rendered as a viewport-fixed bottom sheet rather than
 * absolutely positioned next to the triggering bubble. A bubble near the top
 * or edge of a scrollable message list can't reliably host an absolutely
 * positioned popover — it gets clipped by the scroll container or pushed
 * off-screen. Fixed positioning anchored to the viewport can't be clipped.
 */
export function MessageActionSheet({ message, onClose, onReply, onReact, onEnterSelectionMode, onDelete }: MessageActionSheetProps) {
  const [showFullPicker, setShowFullPicker] = useState(false);

  const handleReact = (emoji: string) => {
    onReact(message.id, emoji);
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full sm:w-[360px] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden">
        {!showFullPicker ? (
          <>
            <div className="flex items-center justify-around px-3 py-3 border-b border-gray-100">
              {QUICK_REACTIONS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => handleReact(emoji)}
                  className="w-10 h-10 flex items-center justify-center text-2xl hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
              <button
                onClick={() => setShowFullPicker(true)}
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                title="More reactions"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>

            <div className="py-2">
              <button
                onClick={() => { onReply(message); onClose(); }}
                className="flex items-center gap-3 px-5 py-3.5 text-[15px] text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                </svg>
                <span>Reply</span>
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-3 px-5 py-3.5 text-[15px] text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copy</span>
              </button>
              <button
                onClick={() => { onEnterSelectionMode(message.id); onClose(); }}
                className="flex items-center gap-3 px-5 py-3.5 text-[15px] text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Select</span>
              </button>
              {onDelete && (
                <button
                  onClick={() => { onDelete(message.id); onClose(); }}
                  className="flex items-center gap-3 px-5 py-3.5 text-[15px] text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Delete for me</span>
                </button>
              )}
            </div>

            <button
              onClick={onClose}
              className="hidden sm:block w-full text-center py-3 text-sm font-medium text-gray-500 border-t border-gray-100 hover:bg-gray-50"
            >
              Cancel
            </button>
          </>
        ) : (
          <div className="p-4">
            <p className="text-sm font-semibold text-gray-900 mb-4">React with</p>
            <div className="grid grid-cols-6 gap-2">
              {EMOJI_PICKER_OPTIONS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => handleReact(emoji)}
                  className="w-10 h-10 flex items-center justify-center text-2xl rounded-lg hover:bg-gray-100"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MessageActionSheet;

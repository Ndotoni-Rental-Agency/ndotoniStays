'use client';

import { GraphQLClient } from '@/lib/graphql-client';
import { onNewMessage, onMessageUpdated, onTypingIndicator, onConversationRead } from '@/graphql/subscriptions';

export type ChatChannel = 'onNewMessage' | 'onMessageUpdated' | 'onTypingIndicator' | 'onConversationRead';

const CHANNEL_QUERIES: Record<ChatChannel, string> = {
  onNewMessage,
  onMessageUpdated,
  onTypingIndicator,
  onConversationRead,
};

type EventCallback<T> = (event: T) => void;
type ErrorCallback = (error: Error) => void;

interface SubscriptionOptions<T> {
  onEvent: EventCallback<T>;
  onError?: ErrorCallback;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

/**
 * Manages GraphQL subscriptions for chat events (new messages, message
 * updates/reactions, typing indicators, read receipts). Singleton pattern
 * with automatic reconnection, keyed per channel+conversation so multiple
 * components can share one underlying subscription per (channel, conversation).
 */
export class ChatSubscriptionManager {
  private static instance: ChatSubscriptionManager;
  private subscriptions: Map<string, {
    subscription: any;
    callbacks: Set<EventCallback<any>>;
    errorCallbacks: Set<ErrorCallback>;
    connectCallbacks: Set<() => void>;
    disconnectCallbacks: Set<() => void>;
    isConnected: boolean;
  }> = new Map();

  private constructor() {}

  static getInstance(): ChatSubscriptionManager {
    if (!ChatSubscriptionManager.instance) {
      ChatSubscriptionManager.instance = new ChatSubscriptionManager();
    }
    return ChatSubscriptionManager.instance;
  }

  subscribe<T = any>(channel: ChatChannel, conversationId: string, options: SubscriptionOptions<T>): () => void {
    const key = `${channel}:${conversationId}`;
    const { onEvent, onError, onConnect, onDisconnect } = options;

    let subData = this.subscriptions.get(key);

    if (!subData) {
      subData = {
        subscription: null,
        callbacks: new Set(),
        errorCallbacks: new Set(),
        connectCallbacks: new Set(),
        disconnectCallbacks: new Set(),
        isConnected: false,
      };
      this.subscriptions.set(key, subData);
      this.setupSubscription(channel, conversationId, key);
    }

    subData.callbacks.add(onEvent);
    if (onError) subData.errorCallbacks.add(onError);
    if (onConnect) subData.connectCallbacks.add(onConnect);
    if (onDisconnect) subData.disconnectCallbacks.add(onDisconnect);

    if (subData.isConnected && onConnect) {
      onConnect();
    }

    return () => {
      this.unsubscribe(key, onEvent, onError, onConnect, onDisconnect);
    };
  }

  private unsubscribe(
    key: string,
    onEvent: EventCallback<any>,
    onError?: ErrorCallback,
    onConnect?: () => void,
    onDisconnect?: () => void
  ): void {
    const subData = this.subscriptions.get(key);
    if (!subData) return;

    subData.callbacks.delete(onEvent);
    if (onError) subData.errorCallbacks.delete(onError);
    if (onConnect) subData.connectCallbacks.delete(onConnect);
    if (onDisconnect) subData.disconnectCallbacks.delete(onDisconnect);

    if (subData.callbacks.size === 0) {
      this.cleanupSubscription(key);
    }
  }

  private async setupSubscription(channel: ChatChannel, conversationId: string, key: string): Promise<void> {
    const subData = this.subscriptions.get(key);
    if (!subData) return;

    try {
      const client = GraphQLClient.getRawClient();
      const query = CHANNEL_QUERIES[channel];

      const subscription = client.graphql({
        query,
        variables: { conversationId },
        authMode: 'userPool',
      }).subscribe({
        next: ({ data }: any) => {
          const event = data?.[channel];
          if (!event) return;

          if (!subData.isConnected) {
            subData.isConnected = true;
            subData.connectCallbacks.forEach(cb => cb());
          }

          subData.callbacks.forEach(callback => {
            try {
              callback(event);
            } catch (error) {
              console.error(`Error in ${channel} subscription callback:`, error);
            }
          });
        },
        error: (error: any) => {
          console.error(`Chat subscription error for ${key}:`, error);

          if (subData.isConnected) {
            subData.isConnected = false;
            subData.disconnectCallbacks.forEach(cb => cb());
          }

          const errorObj = error instanceof Error ? error : new Error(error.message || 'Chat subscription error');
          subData.errorCallbacks.forEach(callback => {
            try {
              callback(errorObj);
            } catch (err) {
              console.error('Error in error callback:', err);
            }
          });

          // Attempt reconnection
          setTimeout(() => {
            if (this.subscriptions.has(key)) {
              this.cleanupSubscription(key, false);
              this.setupSubscription(channel, conversationId, key);
            }
          }, 5000);
        },
      });

      subData.subscription = subscription;
    } catch (error) {
      console.error('Failed to setup chat subscription:', error);
      const errorObj = error instanceof Error ? error : new Error('Failed to setup chat subscription');
      subData.errorCallbacks.forEach(callback => {
        try { callback(errorObj); } catch {}
      });
    }
  }

  private cleanupSubscription(key: string, removeFromMap = true): void {
    const subData = this.subscriptions.get(key);
    if (!subData) return;

    if (subData.subscription) {
      try { subData.subscription.unsubscribe(); } catch {}
      subData.subscription = null;
    }

    if (subData.isConnected) {
      subData.disconnectCallbacks.forEach(cb => { try { cb(); } catch {} });
    }

    if (removeFromMap) {
      this.subscriptions.delete(key);
    }
  }

  cleanupAll(): void {
    this.subscriptions.forEach((_, key) => {
      this.cleanupSubscription(key);
    });
    this.subscriptions.clear();
  }
}

export default ChatSubscriptionManager;

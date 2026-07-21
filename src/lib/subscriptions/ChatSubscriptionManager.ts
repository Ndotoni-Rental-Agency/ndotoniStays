'use client';

import { GraphQLClient } from '@/lib/graphql-client';
import { onNewMessage } from '@/graphql/subscriptions';
import type { ChatMessage } from '@/API';

type MessageCallback = (message: ChatMessage) => void;
type ErrorCallback = (error: Error) => void;

interface SubscriptionOptions {
  onMessage: MessageCallback;
  onError?: ErrorCallback;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

/**
 * Manages GraphQL subscriptions for chat messages.
 * Singleton pattern with automatic reconnection.
 */
export class ChatSubscriptionManager {
  private static instance: ChatSubscriptionManager;
  private subscriptions: Map<string, {
    subscription: any;
    callbacks: Set<MessageCallback>;
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

  subscribe(conversationId: string, options: SubscriptionOptions): () => void {
    const { onMessage, onError, onConnect, onDisconnect } = options;

    let subData = this.subscriptions.get(conversationId);

    if (!subData) {
      subData = {
        subscription: null,
        callbacks: new Set(),
        errorCallbacks: new Set(),
        connectCallbacks: new Set(),
        disconnectCallbacks: new Set(),
        isConnected: false,
      };
      this.subscriptions.set(conversationId, subData);
      this.setupSubscription(conversationId);
    }

    subData.callbacks.add(onMessage);
    if (onError) subData.errorCallbacks.add(onError);
    if (onConnect) subData.connectCallbacks.add(onConnect);
    if (onDisconnect) subData.disconnectCallbacks.add(onDisconnect);

    if (subData.isConnected && onConnect) {
      onConnect();
    }

    return () => {
      this.unsubscribe(conversationId, onMessage, onError, onConnect, onDisconnect);
    };
  }

  private unsubscribe(
    conversationId: string,
    onMessage: MessageCallback,
    onError?: ErrorCallback,
    onConnect?: () => void,
    onDisconnect?: () => void
  ): void {
    const subData = this.subscriptions.get(conversationId);
    if (!subData) return;

    subData.callbacks.delete(onMessage);
    if (onError) subData.errorCallbacks.delete(onError);
    if (onConnect) subData.connectCallbacks.delete(onConnect);
    if (onDisconnect) subData.disconnectCallbacks.delete(onDisconnect);

    if (subData.callbacks.size === 0) {
      this.cleanupSubscription(conversationId);
    }
  }

  private async setupSubscription(conversationId: string): Promise<void> {
    const subData = this.subscriptions.get(conversationId);
    if (!subData) return;

    try {
      const client = GraphQLClient.getRawClient();

      const subscription = client.graphql({
        query: onNewMessage,
        variables: { conversationId },
        authMode: 'userPool',
      }).subscribe({
        next: ({ data }: any) => {
          const message = data.onNewMessage as ChatMessage;
          if (!message) return;

          if (!subData.isConnected) {
            subData.isConnected = true;
            subData.connectCallbacks.forEach(cb => cb());
          }

          subData.callbacks.forEach(callback => {
            try {
              callback(message);
            } catch (error) {
              console.error('Error in chat subscription callback:', error);
            }
          });
        },
        error: (error: any) => {
          console.error('Chat subscription error for:', conversationId, error);

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
            if (this.subscriptions.has(conversationId)) {
              this.cleanupSubscription(conversationId, false);
              this.setupSubscription(conversationId);
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

  private cleanupSubscription(conversationId: string, removeFromMap = true): void {
    const subData = this.subscriptions.get(conversationId);
    if (!subData) return;

    if (subData.subscription) {
      try { subData.subscription.unsubscribe(); } catch {}
      subData.subscription = null;
    }

    if (subData.isConnected) {
      subData.disconnectCallbacks.forEach(cb => { try { cb(); } catch {} });
    }

    if (removeFromMap) {
      this.subscriptions.delete(conversationId);
    }
  }

  cleanupAll(): void {
    this.subscriptions.forEach((_, conversationId) => {
      this.cleanupSubscription(conversationId);
    });
    this.subscriptions.clear();
  }
}

export default ChatSubscriptionManager;

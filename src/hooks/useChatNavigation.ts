'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ChatNavigationOptions {
  propertyId?: string;
  landlordId?: string;
  propertyTitle?: string;
  landlordName?: string;
  onAuthRequired?: () => void;
}

export function useChatNavigation() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const navigateToChat = (options: ChatNavigationOptions = {}) => {
    if (!isAuthenticated) {
      if (options.onAuthRequired) {
        options.onAuthRequired();
        return;
      }
      if (options.propertyId) {
        router.push(`/property/${options.propertyId}`);
        return;
      }
      return;
    }

    let chatUrl = '/chat';

    if (options.propertyId && options.propertyTitle && options.landlordName) {
      const params = new URLSearchParams({
        propertyId: options.propertyId,
        propertyTitle: options.propertyTitle,
        landlordName: options.landlordName,
        newPropertyInquiry: 'true',
      });
      chatUrl = `/chat?${params.toString()}`;
    }

    router.push(chatUrl);
  };

  return {
    navigateToChat,
    isAuthenticated,
  };
}

'use client';

import { useState, useCallback } from 'react';
import { GraphQLClient } from '@/lib/graphql-client';
import { updateUser } from '@/graphql/mutations';
import { UpdateUserInput } from '@/API';

interface UpdateProfileResult {
  success: boolean;
  message: string;
}

export function useUpdateProfile() {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateProfile = useCallback(async (input: UpdateUserInput): Promise<UpdateProfileResult> => {
    try {
      setIsUpdating(true);

      const data = await GraphQLClient.executeAuthenticated<{
        updateUser: { success: boolean; message: string };
      }>(updateUser, { input });

      const result = data.updateUser;

      if (result && result.success) {
        return {
          success: true,
          message: result.message || 'Profile updated successfully',
        };
      }

      throw new Error(result?.message || 'Failed to update profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error instanceof Error ? error : new Error('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  }, []);

  return { updateProfile, isUpdating };
}

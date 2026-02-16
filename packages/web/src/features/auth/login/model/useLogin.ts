'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authLib } from '@/shared/lib/auth';
import { ROUTES } from '@/shared/config/constants';

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        authLib.setAuthenticated(username);
        document.cookie = 'auth_token=authenticated; path=/; max-age=86400';
        router.push(ROUTES.DASHBOARD);
        return { success: true };
      }
      
      return { success: false, error: data.error || 'Invalid credentials' };
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  return { login, loading };
};

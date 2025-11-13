'use client';

import { create } from 'zustand';
import { signIn, signOut } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Import stores for clearing on logout (import at bottom to avoid circular deps)
let eventsStoreModule: any = null;
let rsvpsStoreModule: any = null;

// Lazy load stores to avoid circular dependencies
const getStores = async () => {
  if (!eventsStoreModule) {
    eventsStoreModule = await import('./eventsStore');
  }
  if (!rsvpsStoreModule) {
    rsvpsStoreModule = await import('./rsvpsStore');
  }
  return {
    clearEvents: eventsStoreModule.useEventsStore.getState().clearEvents,
    clearRSVPs: rsvpsStoreModule.useRSVPsStore.getState().clearRSVPs,
  };
};

interface AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

/**
 * Simplified auth store that delegates authentication to next-auth
 * This store is primarily used for auth operations and clearing data on logout
 */
export const useAuthStore = create<AuthState>((set) => ({
  login: async (email: string, password: string) => {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      throw new Error(result.error);
    }

    if (!result?.ok) {
      throw new Error('Login failed. Please try again.');
    }
  },

  signup: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Signup failed' }));
      throw new Error(errorData.error || 'Signup failed. Please try again.');
    }

    // Auto-login after successful signup
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (!result?.ok) {
      throw new Error('Account created but login failed. Please try logging in manually.');
    }
  },

  logout: async () => {
    // Clear other stores
    try {
      const { clearEvents, clearRSVPs } = await getStores();
      clearEvents();
      clearRSVPs();
    } catch (err) {
      console.error('Error clearing stores:', err);
    }
    
    // Sign out from NextAuth
    await signOut({ redirect: false });
  },
}));


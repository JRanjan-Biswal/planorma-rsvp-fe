'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
}

export function useAuth() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const user: User | null = useMemo(() => {
    return session?.user
      ? {
          id: session.user.id,
          email: session.user.email || '',
          role: (session.user.role as 'user' | 'admin') || 'user',
        }
      : null;
  }, [session?.user?.id, session?.user?.email, session?.user?.role]);

  const token = (session as any)?.accessToken || null;

  const logout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
    router.refresh();
  };

  return {
    user,
    token,
    isLoading: status === 'loading',
    isAuthenticated: !!user,
    session,
    update,
    signOut: logout,
  };
}

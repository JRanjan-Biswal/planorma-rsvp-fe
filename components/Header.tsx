'use client';

import { ThemeToggle } from './ThemeToggle';
import { Button } from './Button';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/hooks/useAuth';

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header
      className="border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 bg-white dark:bg-[#1a1a1a]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold text-secondary"
          >
            Planorama Events
          </motion.h1>
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-2">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {user.email}
                </div>
                {user.role === 'admin' && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-secondary text-white">
                    Admin
                  </span>
                )}
              </div>
            )}

            <ThemeToggle />
            {user && (
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await signOut();
                  window.location.href = '/login';
                }}
              >
                Sign Out
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}


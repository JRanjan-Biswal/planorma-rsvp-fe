'use client';

import { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './Button';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/hooks/useAuth';

export function Header() {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      className="border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 bg-white dark:bg-[#1a1a1a]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xl sm:text-2xl font-bold text-secondary"
          >
            HappyHosts Events
          </motion.h1>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
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

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 text-gray-600 dark:text-gray-400"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a]"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
              {user && (
                <div className="flex flex-col gap-2 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {user.email}
                  </div>
                  {user.role === 'admin' && (
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-secondary text-white self-start">
                      Admin
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Theme</span>
                <ThemeToggle />
              </div>

              {user && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    await signOut();
                    window.location.href = '/login';
                  }}
                  className="w-full"
                >
                  Sign Out
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}


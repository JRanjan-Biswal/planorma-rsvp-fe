'use client';

import { SelectHTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
}

export function Select({ label, error, className = '', children, ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-2 text-foreground">
          {label}
        </label>
      )}
      <motion.div whileFocus={{ scale: 1.01 }} className="relative">
        <select
          className={`w-full px-4 py-2 rounded-lg border ${
            error
              ? 'border-red-500 focus:border-red-500'
              : 'border-gray-300 dark:border-gray-600 focus:border-secondary'
          } bg-white dark:bg-[#2a2a2a] text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all duration-200 ${className}`}
          {...props}
        >
          {children}
        </select>
      </motion.div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-sm text-red-500"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}


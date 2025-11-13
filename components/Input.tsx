'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { motion } from 'framer-motion';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium mb-2 text-foreground">
            {label}
          </label>
        )}
        <motion.div whileFocus={{ scale: 1.01 }} className="relative">
          <input
            ref={ref}
            className={`w-full px-4 py-2 rounded-lg border ${
              error
                ? 'border-red-500 focus:border-red-500'
                : 'border-gray-300 dark:border-gray-600 focus:border-secondary'
            } bg-white dark:bg-[#2a2a2a] text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all duration-200 ${className}`}
            {...props}
          />
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
);

Input.displayName = 'Input';


'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export function Card({ children, className = '', onClick, hover = true }: CardProps) {
  return (
    <motion.div
      // initial={{ opacity: 0, y: 20 }}
      // animate={{ opacity: 1, y: 0 }}
      // transition={{ duration: 0.3 }}
      whileHover={hover && onClick ? { scale: 1.02, y: -4 } : hover ? { scale: 1.01 } : {}}
      onClick={onClick}
      className={`rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-all duration-300 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </motion.div>
  );
}


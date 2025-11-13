'use client';

import { motion } from 'framer-motion';

export function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary/30 dark:bg-[#1a1a1a]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full"
      />
    </div>
  );
}


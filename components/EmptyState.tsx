'use client';

import { motion } from 'framer-motion';

interface EmptyStateProps {
  hasFilters: boolean;
}

export function EmptyState({ hasFilters }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-12"
    >
      <p className="text-lg text-gray-600 dark:text-gray-400">
        {hasFilters
          ? 'No events match your filters.'
          : 'No events available.'}
      </p>
    </motion.div>
  );
}


'use client';

import { Input } from './Input';
import { Select } from './Select';
import { FilterOption, SortOption } from '@/lib/types';
import { motion } from 'framer-motion';

interface EventFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  filter: FilterOption;
  onFilterChange: (value: FilterOption) => void;
  sort: SortOption;
  onSortChange: (value: SortOption) => void;
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
}

export function EventFilters({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  sort,
  onSortChange,
  categories,
  selectedCategory,
  onCategoryChange,
}: EventFiltersProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 mb-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          placeholder="Search events..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full"
        />

        <Select
          value={filter}
          onChange={(e) => onFilterChange(e.target.value as FilterOption)}
        >
          <option value="all">All Events</option>
          <option value="upcoming">Upcoming</option>
          <option value="past">Past Events</option>
          <option value="today">Today</option>
        </Select>

        <Select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>

        <Select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
        >
          <option value="date-asc">Date: Earliest</option>
          <option value="date-desc">Date: Latest</option>
          <option value="title-asc">Title: A-Z</option>
          <option value="title-desc">Title: Z-A</option>
          <option value="capacity-asc">Capacity: Low to High</option>
          <option value="capacity-desc">Capacity: High to Low</option>
        </Select>
      </div>
    </motion.div>
  );
}


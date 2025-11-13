'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Event, SortOption, FilterOption } from '@/lib/types';
import { EventsTable } from '@/components/EventsTable';
import { EventFilters } from '@/components/EventFilters';
import { Header } from '@/components/Header';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/Button';
import { useAuth } from '@/lib/hooks/useAuth';
import { motion } from 'framer-motion';
import { isToday, isPast, isFuture } from 'date-fns';
import { useEventsStore } from '@/lib/store/eventsStore';

export default function Home() {
  const router = useRouter();
  const { events, loading: eventsLoading, fetchEvents } = useEventsStore();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterOption>('all');
  const [sort, setSort] = useState<SortOption>('date-asc');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch events on mount
  // Token is automatically rehydrated from localStorage by Zustand persist
  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const categories = useMemo(() => {
    const cats = new Set(events.map((e) => e.category));
    return Array.from(cats).sort();
  }, [events]);

  const filteredAndSortedEvents = useMemo(() => {
    let filtered = events.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(search.toLowerCase()) ||
        event.description.toLowerCase().includes(search.toLowerCase()) ||
        event.location.toLowerCase().includes(search.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;

      const eventDate = new Date(event.date);
      let matchesFilter = true;
      if (filter === 'upcoming') {
        matchesFilter = isFuture(eventDate);
      } else if (filter === 'past') {
        matchesFilter = isPast(eventDate);
      } else if (filter === 'today') {
        matchesFilter = isToday(eventDate);
      }

      return matchesSearch && matchesCategory && matchesFilter;
    });

    filtered.sort((a, b) => {
      switch (sort) {
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'capacity-asc':
          return a.capacity - b.capacity;
        case 'capacity-desc':
          return b.capacity - a.capacity;
        default:
          return 0;
      }
    });

    return filtered;
  }, [events, search, filter, sort, selectedCategory]);

  if (eventsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-primary/30">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-secondary">Events</h2>
          <Button
            variant="primary"
            onClick={() => router.push('/create-event')}
          >
            Create Event
          </Button>
        </div>

        <EventFilters
          search={search}
          onSearchChange={setSearch}
          filter={filter}
          onFilterChange={setFilter}
          sort={sort}
          onSortChange={setSort}
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {filteredAndSortedEvents.length === 0 ? (
          <EmptyState
            hasFilters={!!(search || filter !== 'all' || selectedCategory !== 'all')}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <EventsTable
              events={filteredAndSortedEvents}
            />
          </motion.div>
        )}
      </main>
    </div>
  );
}

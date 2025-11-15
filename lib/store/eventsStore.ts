import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { eventsApi } from '../api/client';
import { Event } from '../types';

interface EventsState {
  events: Event[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null; // Timestamp of last fetch
  fetchEvents: (force?: boolean) => Promise<void>;
  createEvent: (eventData: {
    title: string;
    description: string;
    date: string;
    location: string;
    category: string;
    capacity: number;
    allowedCompanions: number;
    hostName: string;
    hostMobile: string;
    hostEmail: string;
  }) => Promise<Event>;
  getEventById: (id: string) => Promise<Event | null>;
  refreshEvents: () => Promise<void>;
  clearEvents: () => void;
}

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

export const useEventsStore = create<EventsState>()(
  persist(
    (set, get) => ({
      events: [],
      loading: false,
      error: null,
      lastFetched: null,

      fetchEvents: async (force = false) => {
        const { lastFetched, events } = get();
        const now = Date.now();
        
        // If we have cached data and it's still fresh, don't fetch again
        if (!force && lastFetched && events.length > 0 && (now - lastFetched) < CACHE_DURATION) {
          console.log('Using cached events data');
          return;
        }

        set({ loading: true, error: null });
        try {
          const events = await eventsApi.getAll();
          set({ events, loading: false, lastFetched: now });
        } catch (error: any) {
          set({ error: error?.message || 'Failed to fetch events', loading: false });
          throw error;
        }
      },

      createEvent: async (eventData) => {
        set({ loading: true, error: null });
        try {
          const newEvent = await eventsApi.create(eventData);
          set((state) => ({
            events: [...state.events, newEvent],
            loading: false,
            lastFetched: Date.now(), // Update cache timestamp
          }));
          return newEvent;
        } catch (error: any) {
          set({ error: error?.message || 'Failed to create event', loading: false });
          throw error;
        }
      },

      getEventById: async (id: string) => {
        // First check if event is in cache
        const { events } = get();
        const cachedEvent = events.find(e => e.id === id);
        if (cachedEvent) {
          console.log('Using cached event data');
          return cachedEvent;
        }

        // If not in cache, fetch from API
        try {
          const event = await eventsApi.getById(id);
          // Optionally update the cache with this event
          if (event) {
            set((state) => {
              const eventExists = state.events.some(e => e.id === id);
              if (!eventExists) {
                return { events: [...state.events, event] };
              }
              return state;
            });
          }
          return event;
        } catch (error: any) {
          set({ error: error?.message || 'Failed to fetch event' });
          return null;
        }
      },

      refreshEvents: async () => {
        await get().fetchEvents(true); // Force refresh
      },

      clearEvents: () => {
        set({ events: [], loading: false, error: null, lastFetched: null });
      },
    }),
    {
      name: 'events-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        events: state.events,
        lastFetched: state.lastFetched,
      }),
    }
  )
);


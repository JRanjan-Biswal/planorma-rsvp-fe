import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { rsvpsApi } from '../api/client';

interface RSVPsState {
  rsvps: Record<string, string | null>; // eventId -> status
  fetchedEventIds: string[]; // Track which events we've already fetched RSVPs for (as array for serialization)
  lastFetched: Record<string, number>; // eventId -> timestamp
  loading: boolean;
  error: string | null;
  fetchRSVP: (eventId: string, force?: boolean) => Promise<string | null>;
  fetchRSVPsForEvents: (eventIds: string[], force?: boolean) => Promise<void>;
  createRSVP: (eventId: string, status: 'going' | 'maybe' | 'not-going') => Promise<void>;
  setRSVP: (eventId: string, status: string | null) => void;
  clearRSVPs: () => void;
}

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

export const useRSVPsStore = create<RSVPsState>()(
  persist(
    (set, get) => ({
      rsvps: {},
      fetchedEventIds: [],
      lastFetched: {},
      loading: false,
      error: null,

      fetchRSVP: async (eventId: string, force = false) => {
        const { fetchedEventIds, lastFetched, rsvps } = get();
        const now = Date.now();
        
        // Check if we have cached data and it's still fresh
        const isCached = fetchedEventIds.includes(eventId);
        const lastFetchTime = lastFetched[eventId];
        
        if (!force && isCached && lastFetchTime && (now - lastFetchTime) < CACHE_DURATION) {
          console.log(`Using cached RSVP data for event ${eventId}`);
          return rsvps[eventId] || null;
        }

        try {
          const rsvp = await rsvpsApi.get(eventId);
          const status = rsvp?.status || null;
          set((state) => ({
            rsvps: { ...state.rsvps, [eventId]: status },
            fetchedEventIds: state.fetchedEventIds.includes(eventId) 
              ? state.fetchedEventIds 
              : [...state.fetchedEventIds, eventId],
            lastFetched: { ...state.lastFetched, [eventId]: now },
          }));
          return status;
        } catch (error: any) {
          set((state) => ({
            rsvps: { ...state.rsvps, [eventId]: null },
            fetchedEventIds: state.fetchedEventIds.includes(eventId) 
              ? state.fetchedEventIds 
              : [...state.fetchedEventIds, eventId],
            lastFetched: { ...state.lastFetched, [eventId]: now },
          }));
          return null;
        }
      },

      fetchRSVPsForEvents: async (eventIds: string[], force = false) => {
        const { fetchedEventIds, lastFetched } = get();
        const now = Date.now();
        
        // Filter out events with fresh cached data
        const unfetchedEventIds = eventIds.filter(id => {
          if (force) return true;
          const isCached = fetchedEventIds.includes(id);
          const lastFetchTime = lastFetched[id];
          return !isCached || !lastFetchTime || (now - lastFetchTime) >= CACHE_DURATION;
        });
        
        if (unfetchedEventIds.length === 0) {
          console.log('All RSVPs already cached');
          return;
        }

        set({ loading: true, error: null });
        try {
          const rsvpPromises = unfetchedEventIds.map(async (eventId) => {
            try {
              const rsvp = await rsvpsApi.get(eventId);
              return { eventId, status: rsvp?.status || null };
            } catch {
              return { eventId, status: null };
            }
          });

          const results = await Promise.all(rsvpPromises);
          
          set((state) => {
            const newRsvps = { ...state.rsvps };
            const newFetchedIds = [...state.fetchedEventIds];
            const newLastFetched = { ...state.lastFetched };
            
            results.forEach(({ eventId, status }) => {
              newRsvps[eventId] = status;
              if (!newFetchedIds.includes(eventId)) {
                newFetchedIds.push(eventId);
              }
              newLastFetched[eventId] = now;
            });

            return { 
              rsvps: newRsvps, 
              fetchedEventIds: newFetchedIds,
              lastFetched: newLastFetched,
              loading: false 
            };
          });
        } catch (error: any) {
          set({ error: error?.message || 'Failed to fetch RSVPs', loading: false });
        }
      },

      createRSVP: async (eventId: string, status: 'going' | 'maybe' | 'not-going') => {
        set({ loading: true, error: null });
        try {
          await rsvpsApi.create(eventId, status);
          set((state) => ({
            rsvps: { ...state.rsvps, [eventId]: status },
            lastFetched: { ...state.lastFetched, [eventId]: Date.now() },
            loading: false,
          }));
        } catch (error: any) {
          set({ error: error?.message || 'Failed to create RSVP', loading: false });
          throw error;
        }
      },

      setRSVP: (eventId: string, status: string | null) => {
        set((state) => ({
          rsvps: { ...state.rsvps, [eventId]: status },
          lastFetched: { ...state.lastFetched, [eventId]: Date.now() },
        }));
      },

      clearRSVPs: () => {
        set({ rsvps: {}, fetchedEventIds: [], lastFetched: {}, loading: false, error: null });
      },
    }),
    {
      name: 'rsvps-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        rsvps: state.rsvps,
        fetchedEventIds: state.fetchedEventIds,
        lastFetched: state.lastFetched,
      }),
    }
  )
);


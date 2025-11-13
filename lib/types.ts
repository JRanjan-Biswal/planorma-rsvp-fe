export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  capacity: number;
  hostName: string;
  hostMobile: string;
  hostEmail: string;
  rsvpCount: number;
  image?: string;
}

export interface RSVP {
  id: string;
  eventId: string;
  userId: string;
  status: 'going' | 'maybe' | 'not-going';
  createdAt: string;
}

export type SortOption = 'date-asc' | 'date-desc' | 'title-asc' | 'title-desc' | 'capacity-asc' | 'capacity-desc';
export type FilterOption = 'all' | 'upcoming' | 'past' | 'today';


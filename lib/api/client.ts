import { useEventsStore } from '../store/eventsStore';
import { useRSVPsStore } from '../store/rsvpsStore';
import { signOut, getSession } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Handle 401 errors by clearing all auth state and redirecting to login
 */
async function handle401Error() {
  // Clear all Zustand stores
  useEventsStore.getState().clearEvents();
  useRSVPsStore.getState().clearRSVPs();
  
  // Sign out from NextAuth
  await signOut({ redirect: false });
  
  // Redirect to login page
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    
    // Handle 401 Unauthorized - clear auth and redirect
    if (response.status === 401) {
      await handle401Error();
      throw new ApiError(
        'Your session has expired. Please login again.',
        response.status,
        errorData
      );
    }
    
    throw new ApiError(
      errorData.error || `HTTP error! status: ${response.status}`,
      response.status,
      errorData
    );
  }
  return response.json();
}

/**
 * Get the access token from next-auth session
 */
async function getAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') {
    // Server-side: return null (API calls should be made client-side)
    return null;
  }
  
  try {
    const session = await getSession();
    return (session as any)?.accessToken || null;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Make an authenticated API request
 * Uses auth token from next-auth session
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Get token from next-auth session
  const token = await getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    cache: 'no-store',
  });

  return handleResponse<T>(response);
}

// Events API
export const eventsApi = {
  getAll: async () => {
    const data = await apiRequest<{ events: any[] }>('/events');
    return data.events;
  },

  getById: async (id: string) => {
    const data = await apiRequest<{ event: any }>(`/events/${id}`);
    return data.event;
  },

  // Public endpoint - no auth required
  getByIdPublic: async (id: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/events/public/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new ApiError(
        errorData.error || `HTTP error! status: ${response.status}`,
        response.status,
        errorData
      );
    }

    const data = await response.json();
    return data.event;
  },

  create: async (eventData: {
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
  }) => {
    const data = await apiRequest<{ event: any }>('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
    return data.event;
  },

  update: async (id: string, eventData: {
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
  }) => {
    const data = await apiRequest<{ event: any }>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
    return data.event;
  },
};

// RSVPs API
export const rsvpsApi = {
  get: async (eventId: string) => {
    const data = await apiRequest<{ rsvp: any | null }>(`/rsvps/${eventId}`);
    return data.rsvp;
  },

  create: async (eventId: string, status: 'going' | 'maybe' | 'not-going') => {
    const data = await apiRequest<{ success: boolean; rsvp: any }>(`/rsvps/${eventId}`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
    return data;
  },

  // Public endpoints for token-based RSVP
  submitWithToken: async (
    token: string,
    status: 'going' | 'not-going',
    companions: number = 0,
    guestName?: string,
    dietaryPreference?: 'nonveg' | 'veg' | 'vegan',
    companionDietaryPreference?: 'nonveg' | 'veg' | 'vegan'
  ) => {
    const body: any = { status, companions };
    
    // Only include optional fields if they have values
    if (guestName && guestName.trim()) {
      body.guestName = guestName.trim();
    }
    if (dietaryPreference) {
      body.dietaryPreference = dietaryPreference;
    }
    if (companionDietaryPreference) {
      body.companionDietaryPreference = companionDietaryPreference;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/rsvps/token/${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      
      // Handle 401 Unauthorized
      if (response.status === 401) {
        await handle401Error();
        throw new ApiError(
          'Your session has expired. Please login again.',
          response.status,
          errorData
        );
      }
      
      throw new ApiError(
        errorData.error || `HTTP error! status: ${response.status}`,
        response.status,
        errorData
      );
    }

    return response.json();
  },

  checkTokenStatus: async (token: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/rsvps/token/${token}/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      
      // Handle 401 Unauthorized
      if (response.status === 401) {
        await handle401Error();
        throw new ApiError(
          'Your session has expired. Please login again.',
          response.status,
          errorData
        );
      }
      
      throw new ApiError(
        errorData.error || `HTTP error! status: ${response.status}`,
        response.status,
        errorData
      );
    }

    return response.json();
  },

  getDietaryStats: async (eventId: string) => {
    const data = await apiRequest<{ nonveg: number; veg: number; vegan: number; notSpecified: number }>(`/rsvps/event/${eventId}/dietary-stats`);
    return data;
  },

  getPublicRSVPs: async (eventId: string) => {
    const data = await apiRequest<{ rsvps: any[] }>(`/rsvps/event/${eventId}/public-rsvps`);
    return data.rsvps;
  },

  // Public RSVP endpoints (no token required)
  submitPublicRSVP: async (
    eventId: string,
    status: 'going' | 'not-going',
    guestName: string,
    guestEmail: string,
    companions: number = 0,
    dietaryPreference?: 'nonveg' | 'veg' | 'vegan',
    companionDietaryPreference?: 'nonveg' | 'veg' | 'vegan'
  ) => {
    const body: any = { 
      status, 
      guestName: guestName.trim(), 
      guestEmail: guestEmail.trim(),
      companions 
    };
    
    // Only include optional fields if they have values
    if (dietaryPreference) {
      body.dietaryPreference = dietaryPreference;
    }
    if (companionDietaryPreference) {
      body.companionDietaryPreference = companionDietaryPreference;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/rsvps/public/${eventId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new ApiError(
        errorData.error || `HTTP error! status: ${response.status}`,
        response.status,
        errorData
      );
    }

    return response.json();
  },

  checkPublicRSVPStatus: async (eventId: string, email: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/rsvps/public/${eventId}/check/${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new ApiError(
        errorData.error || `HTTP error! status: ${response.status}`,
        response.status,
        errorData
      );
    }

    return response.json();
  },
};

// Email Templates API
export const emailTemplatesApi = {
  get: async (eventId?: string) => {
    const query = eventId ? `?eventId=${eventId}` : '';
    const data = await apiRequest<{ template: any }>(`/email-templates${query}`);
    return data.template;
  },

  save: async (templateData: {
    eventId?: string;
    logoUrl?: string;
    hostName: string;
    primaryColor: string;
    secondaryColor: string;
    textColor?: string;
    eventDetailsBackgroundColor?: string;
    fontFamily: string;
    headerText: string;
    sampleEventTitle?: string;
    footerText: string;
    buttonText?: string;
    buttonRadius?: string;
    showEmojis?: boolean;
    descriptionText?: string;
    isDefault?: boolean;
  }) => {
    const data = await apiRequest<{ success: boolean; template: any }>('/email-templates', {
      method: 'POST',
      body: JSON.stringify(templateData),
    });
    return data.template;
  },

  uploadLogo: async (logoData: string) => {
    const data = await apiRequest<{ success: boolean; logoUrl: string }>('/email-templates/upload-logo', {
      method: 'POST',
      body: JSON.stringify({ logoData }),
    });
    return data.logoUrl;
  },
};

// Tokens API
export const tokensApi = {
  getAll: async (
    eventId: string,
    page: number = 1,
    limit: number = 10,
    search: string = '',
    status: string = '',
    inviteType: string = ''
  ) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(status && { status }),
      ...(inviteType && { inviteType }),
    });
    const data = await apiRequest<{ tokens: any[]; pagination: any }>(`/tokens/${eventId}?${params}`);
    return data;
  },

  create: async (eventId: string, email: string, name?: string) => {
    const data = await apiRequest<{ token: any; emailSent: boolean }>(`/tokens/${eventId}`, {
      method: 'POST',
      body: JSON.stringify({ email, name }),
    });
    return data;
  },

  getByToken: async (token: string) => {
    const data = await apiRequest<{ event: any; token: any }>(`/tokens/token/${token}`);
    return data;
  },
};


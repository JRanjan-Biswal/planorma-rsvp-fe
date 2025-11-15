'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { Header } from '@/components/Header';
import { Accordion } from '@/components/Accordion';
import { Modal } from '@/components/Modal';
import { RefreshIcon } from '@/components/RefreshIcon';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { eventsApi, tokensApi, rsvpsApi } from '@/lib/api/client';
import { getEventStatus, isEventExpired } from '@/lib/utils';

interface Event {
  id: string;
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
}

interface UserToken {
  id: string;
  email: string;
  name: string | null;
  token: string | null;
  rsvpStatus: 'going' | 'maybe' | 'not-going' | null;
  companions: number;
  createdAt: string;
  isPrivateInvite: boolean;
}

export default function EventPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const eventId = params.eventId as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [userTokens, setUserTokens] = useState<UserToken[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    category: '',
    capacity: 0,
    allowedCompanions: 0,
    hostName: '',
    hostMobile: '',
    hostEmail: '',
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [dietaryStats, setDietaryStats] = useState<{
    nonveg: number;
    veg: number;
    vegan: number;
    notSpecified: number;
  } | null>(null);

  // Pagination and filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTokens, setTotalTokens] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState(''); // Immediate input value for debouncing
  const [statusFilter, setStatusFilter] = useState('');
  const [inviteTypeFilter, setInviteTypeFilter] = useState(''); // 'private', 'public', or ''
  const [itemsPerPage] = useState(10);

  // Track if we've already fetched for this event to prevent loops
  const hasFetchedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/login');
      return;
    }

    // Only fetch if we haven't fetched for this event yet
    if (user && user.role === 'admin' && hasFetchedRef.current !== eventId) {
      hasFetchedRef.current = eventId;
      fetchEvent();
      fetchDietaryStats();
      fetchUserTokens(); // Initial fetch of tokens (now includes public RSVPs)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, eventId]);

  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1);
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  // Fetch tokens when pagination or filters change
  useEffect(() => {
    if (user && user.role === 'admin' && hasFetchedRef.current === eventId) {
      fetchUserTokens();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery, statusFilter, inviteTypeFilter]);

  const fetchEvent = async () => {
    try {
      const eventData = await eventsApi.getById(eventId);
      setEvent(eventData);
    } catch (err: any) {
      if (err?.status === 404) {
        setError('Event not found or you do not have access to this event');
      } else if (err?.status === 401) {
        setError('Unauthorized - Please login again');
      } else if (err?.status === 403) {
        setError('Forbidden - Admin access required');
      } else {
        setError(`Failed to load event: ${err?.message || 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserTokens = async () => {
    try {
      const data = await tokensApi.getAll(eventId, currentPage, itemsPerPage, searchQuery, statusFilter, inviteTypeFilter);
      setUserTokens(data.tokens);
      setTotalPages(data.pagination.totalPages);
      setTotalTokens(data.pagination.total);
    } catch (err) {
      console.error('Failed to load tokens');
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchUserTokens();
      setSuccessMessage('List refreshed successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to refresh list');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setSearchQuery('');
    setStatusFilter('');
    setInviteTypeFilter('');
    setCurrentPage(1);
    setSuccessMessage('Filters cleared!');
    setTimeout(() => setSuccessMessage(null), 2000);
  };

  const fetchDietaryStats = async () => {
    try {
      const stats = await rsvpsApi.getDietaryStats(eventId);
      setDietaryStats(stats);
    } catch (err) {
      console.error('Failed to load dietary stats');
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await tokensApi.create(eventId, inviteEmail, inviteName || undefined);
      const emailStatus = result.emailSent ? 'Invitation email sent!' : 'Invitation created (email not configured)';
      setSuccessMessage(emailStatus);
      setInviteEmail('');
      setInviteName('');
      setIsInviteModalOpen(false);
      fetchUserTokens();
      fetchDietaryStats();
    } catch (err: any) {
      setError(err?.message || 'Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const handleEditClick = () => {
    if (event) {
      // Parse the date to get the correct format for datetime-local input
      const eventDate = new Date(event.date);
      const formattedDate = eventDate.toISOString().slice(0, 16);

      setEditFormData({
        title: event.title,
        description: event.description,
        date: formattedDate,
        location: event.location,
        category: event.category,
        capacity: event.capacity,
        allowedCompanions: event.allowedCompanions || 0,
        hostName: event.hostName,
        hostMobile: event.hostMobile,
        hostEmail: event.hostEmail,
      });
      setIsEditModalOpen(true);
    }
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Validate that the event date is not in the past
      const eventDateTime = new Date(editFormData.date);
      const now = new Date();
      if (eventDateTime < now) {
        setError('Cannot update event to a past date. Please select a future date and time.');
        setIsUpdating(false);
        return;
      }

      const updatedEvent = await eventsApi.update(eventId, {
        ...editFormData,
        date: eventDateTime.toISOString(),
      });
      setEvent(updatedEvent);
      setSuccessMessage('Event updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      setIsEditModalOpen(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to update event');
    } finally {
      setIsUpdating(false);
    }
  };

  if (authLoading || isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary/30 dark:bg-[#1a1a1a] p-4">
        <Card>
          <div className="text-center">
            <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">
              {error ? 'Error Loading Event' : 'Event Not Found'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error || 'The event you are looking for does not exist.'}
            </p>
            <Button
              variant="primary"
              onClick={() => router.push('/')}
            >
              Back to Events
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const eventDate = new Date(event.date);
  const eventStatus = getEventStatus(event.date);
  const isExpired = isEventExpired(event.date);

  const getStatusBadge = (status: string | null, companions?: number) => {
    if (!status) {
      return (
        <div>
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
            Pending
          </span>
        </div>
      );
    }

    const styles = {
      going: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200',
      maybe: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200',
      'not-going': 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200',
    };

    const labels = {
      going: '✓ Going',
      maybe: '? Maybe',
      'not-going': '✗ Not Going',
    };

    return (
      <div className="flex flex-col gap-1">
        <span className={`px-3 py-1 text-xs font-medium rounded-full inline-block ${styles[status as keyof typeof styles]}`}>
          {labels[status as keyof typeof labels]}
        </span>
        {status === 'going' && companions && companions > 0 ? (
          <span className="text-xs text-gray-600 dark:text-gray-400">
            +{companions} companion{companions > 1 ? 's' : ''}
          </span>
        ) : null}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-primary/30 dark:bg-[#1a1a1a]">
      <Header />
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="outline"
            onClick={() => router.push('/')}
            className="mb-6"
            size="sm"
          >
            ← Back to Events
          </Button>

          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-secondary">{event.title}</h1>
              {eventStatus === 'expired' && (
                <span className="px-3 py-1 text-xs sm:text-sm font-medium rounded-full bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 self-start sm:self-auto">
                  Expired
                </span>
              )}
              {eventStatus === 'active' && (
                <span className="px-3 py-1 text-xs sm:text-sm font-medium rounded-full bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 self-start sm:self-auto">
                  Active
                </span>
              )}
              {eventStatus === 'upcoming' && (
                <span className="px-3 py-1 text-xs sm:text-sm font-medium rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 self-start sm:self-auto">
                  Upcoming
                </span>
              )}
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Manage your event and invitations</p>
          </motion.div>

          {/* Success/Error Messages */}
          {isExpired && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg"
            >
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">Event Has Expired</h3>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    This event has already passed. You can no longer invite new users or accept RSVPs for this event.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg"
            >
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-800 rounded-lg"
            >
              <p className="text-sm text-green-800 dark:text-green-200">{successMessage}</p>
            </motion.div>
          )}

          {/* Event Information Accordion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="mb-6"
          >
            <Accordion title="Event Details" defaultOpen={false}>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Description</h4>
                    <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">{event.description}</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleEditClick}
                    size="sm"
                    className="w-full sm:w-auto sm:ml-4 whitespace-nowrap"
                  >
                    ✏️ Edit Event
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">📅 Date & Time</h4>
                    <p className="text-gray-700 dark:text-gray-300">{format(eventDate, 'PPP p')}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">📍 Location</h4>
                    <p className="text-gray-700 dark:text-gray-300">{event.location}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">🏷️ Category</h4>
                    <p className="text-gray-700 dark:text-gray-300">{event.category}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">👥 Capacity</h4>
                    <p className="text-gray-700 dark:text-gray-300">{event.capacity} people</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">👤 Host Name</h4>
                    <p className="text-gray-700 dark:text-gray-300">{event.hostName}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">📞 Host Mobile</h4>
                    <p className="text-gray-700 dark:text-gray-300">{event.hostMobile}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">📧 Host Email</h4>
                    <p className="text-gray-700 dark:text-gray-300">{event.hostEmail}</p>
                  </div>
                </div>

                {/* Dietary Preferences Section */}
                {dietaryStats && (dietaryStats.nonveg > 0 || dietaryStats.veg > 0 || dietaryStats.vegan > 0) && (
                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Dietary Preferences</h4>
                    <div className="flex gap-6">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Non-Veg: <span className="font-semibold text-gray-900 dark:text-gray-100">{dietaryStats.nonveg}</span></p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Vegetarian: <span className="font-semibold text-gray-900 dark:text-gray-100">{dietaryStats.veg}</span></p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Vegan: <span className="font-semibold text-gray-900 dark:text-gray-100">{dietaryStats.vegan}</span></p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Shareable RSVP Link */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">🔗 Shareable RSVP Link</h4>
                  {isExpired ? (
                    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        Public RSVP link is disabled because this event has expired.
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Share this link with anyone to allow them to RSVP without needing an individual invitation.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-[#2a2a2a] text-gray-900 dark:text-gray-100 text-xs sm:text-sm break-all">
                          {typeof window !== 'undefined' ? `${window.location.origin}/event/${eventId}/rsvp` : ''}
                        </div>
                        <Button
                          variant="primary"
                          onClick={() => {
                            const link = `${window.location.origin}/event/${eventId}/rsvp`;
                            navigator.clipboard.writeText(link);
                            setSuccessMessage('Link copied to clipboard!');
                            setTimeout(() => setSuccessMessage(null), 3000);
                          }}
                          size="sm"
                          className="whitespace-nowrap w-full sm:w-auto"
                        >
                          📋 Copy Link
                        </Button>
                      </div>
                    </>
                  )}
                </div>

                {/* Customize Invite Button */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/email-template?eventId=${eventId}`)}
                    className="w-full sm:w-auto"
                  >
                    🎨 Customize Invite Template
                  </Button>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Personalize your invitation emails with your logo and branding
                  </p>
                </div>
              </div>
            </Accordion>
          </motion.div>

          {/* Invite Users Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-secondary">Invited Users</h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {totalTokens} {totalTokens === 1 ? 'person' : 'people'} total (private invites + public RSVPs)
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    onClick={handleResetFilters}
                    disabled={!searchInput && !statusFilter && !inviteTypeFilter}
                    size="sm"
                    className="flex-1 sm:flex-none text-xs sm:text-sm"
                  >
                    <span className="hidden sm:inline">✕ Clear Filters</span>
                    <span className="sm:hidden">✕ Clear</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    size="sm"
                    className="flex-1 sm:flex-none text-xs sm:text-sm"
                  >
                    {isRefreshing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="hidden sm:inline">Refreshing...</span>
                        <span className="sm:hidden">...</span>
                      </>
                    ) : (
                      <>
                        <RefreshIcon className="w-4 h-4 mr-0 sm:mr-2 inline" />
                        <span className="hidden sm:inline">Refresh</span>
                      </>
                    )}
                  </Button>
                  <div className={`flex-1 sm:flex-none ${isExpired ? 'relative inline-block' : ''}`}>
                    <Button
                      variant="primary"
                      onClick={() => setIsInviteModalOpen(true)}
                      disabled={isExpired}
                      size="sm"
                      className="w-full text-xs sm:text-sm"
                    >
                      <span className="hidden sm:inline">+ Invite User</span>
                      <span className="sm:hidden">+ Invite</span>
                    </Button>
                    {isExpired && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Cannot invite users to expired event
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Input
                  label=""
                  type="text"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                  }}
                  placeholder="Search by name or email..."
                />
                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="going">Going</option>
                    <option value="not-going">Not Going</option>
                  </select>
                </div>
                <div>
                  <select
                    value={inviteTypeFilter}
                    onChange={(e) => {
                      setInviteTypeFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="">All Invites</option>
                    <option value="private">Private Invite</option>
                    <option value="public">Public RSVP</option>
                  </select>
                </div>
              </div>

              {/* Invited Users Table */}
              {userTokens.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">No users invited yet</p>
                  <Button
                    variant="outline"
                    onClick={() => setIsInviteModalOpen(true)}
                  >
                    Invite Your First User
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-[#1f1f1f] border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          Private Invite
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {userTokens.map((token, index) => (
                        <motion.tr
                          key={token.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                          className="hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {token.name || '—'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700 dark:text-gray-300">{token.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(token.rsvpStatus, token.companions)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${token.isPrivateInvite
                                ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
                                : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                              }`}>
                              {token.isPrivateInvite ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            {format(new Date(token.createdAt), 'MMM dd, yyyy')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            {token.isPrivateInvite && token.token ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const url = `${window.location.origin}/event/${eventId}/${token.token}`;
                                  navigator.clipboard.writeText(url);
                                  setSuccessMessage('Invitation link copied to clipboard!');
                                  setTimeout(() => setSuccessMessage(null), 3000);
                                }}
                              >
                                Copy Link
                              </Button>
                            ) : (
                              <span className="text-xs text-gray-500 dark:text-gray-400 italic">Public RSVP</span>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
                    <span className="hidden sm:inline">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalTokens)} of {totalTokens} results
                    </span>
                    <span className="sm:hidden">
                      Page {currentPage} of {totalPages}
                    </span>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="text-xs sm:text-sm px-2 sm:px-3"
                    >
                      <span className="hidden sm:inline">Previous</span>
                      <span className="sm:hidden">Prev</span>
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        // On mobile, show fewer pages: only first, last, current, and immediate neighbors
                        const isMobileView = typeof window !== 'undefined' && window.innerWidth < 640;
                        const shouldShow = isMobileView
                          ? (page === 1 || page === totalPages || page === currentPage)
                          : (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1));
                        
                        if (shouldShow) {
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm min-w-[32px] sm:min-w-[36px] ${currentPage === page
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (
                          (isMobileView && (page === currentPage - 1 || page === currentPage + 1)) ||
                          (!isMobileView && (page === currentPage - 2 || page === currentPage + 2))
                        ) {
                          return <span key={page} className="px-1 text-gray-500 text-xs">...</span>;
                        }
                        return null;
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="text-xs sm:text-sm px-2 sm:px-3"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Invite Modal */}
          <Modal
            isOpen={isInviteModalOpen}
            onClose={() => {
              setIsInviteModalOpen(false);
              setInviteEmail('');
              setInviteName('');
              setError(null);
            }}
            title="Invite User to Event"
          >
            <form onSubmit={handleInvite} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="user@example.com"
                required
              />

              <Input
                label="Name (Optional)"
                type="text"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="John Doe"
              />

              {isExpired ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    ⚠️ This event has expired. You cannot send new invitations.
                  </p>
                </div>
              ) : (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    📧 An invitation email will be sent with a unique RSVP link for this event.
                  </p>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsInviteModalOpen(false)}
                  disabled={isInviting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isInviting || isExpired}
                >
                  {isInviting ? 'Sending...' : 'Send Invitation'}
                </Button>
              </div>
            </form>
          </Modal>

          {/* Edit Event Modal */}
          <Modal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setError(null);
            }}
            title="Edit Event"
          >
            <form onSubmit={handleUpdateEvent} className="space-y-4">
              <Input
                label="Event Title"
                type="text"
                value={editFormData.title}
                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                placeholder="Annual Company Gala"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  placeholder="Describe your event..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <Input
                label="Date & Time"
                type="datetime-local"
                value={editFormData.date}
                onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                min={new Date().toISOString().slice(0, 16)}
                required
              />

              <Input
                label="Location"
                type="text"
                value={editFormData.location}
                onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                placeholder="New York City, NY"
                required
              />

              <Select
                label="Category"
                value={editFormData.category}
                onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                required
              >
                <option value="">Select a category</option>
                <option value="Wedding">Wedding</option>
                <option value="Marriage">Marriage</option>
                <option value="Party">Party</option>
                <option value="Conference">Conference</option>
                <option value="Birthday">Birthday</option>
                <option value="Business">Business</option>
                <option value="Wellness">Wellness</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Social">Social</option>
              </Select>

              <Input
                label="Capacity"
                type="number"
                value={editFormData.capacity.toString()}
                onChange={(e) => setEditFormData({ ...editFormData, capacity: parseInt(e.target.value) || 0 })}
                placeholder="100"
                min="10"
                required
              />

              <Input
                label="Allowed Companions per Guest"
                type="number"
                value={editFormData.allowedCompanions.toString()}
                onChange={(e) => setEditFormData({ ...editFormData, allowedCompanions: parseInt(e.target.value) || 0 })}
                placeholder="0"
                min="0"
                max="10"
                required
              />

              <Input
                label="Host Name"
                type="text"
                value={editFormData.hostName}
                onChange={(e) => setEditFormData({ ...editFormData, hostName: e.target.value })}
                placeholder="John Doe"
                required
              />

              <Input
                label="Host Mobile"
                type="tel"
                value={editFormData.hostMobile}
                onChange={(e) => setEditFormData({ ...editFormData, hostMobile: e.target.value })}
                placeholder="+1 (555) 123-4567"
                required
              />

              <Input
                label="Host Email"
                type="email"
                value={editFormData.hostEmail}
                onChange={(e) => setEditFormData({ ...editFormData, hostEmail: e.target.value })}
                placeholder="host@example.com"
                required
              />

              <div className="flex gap-3 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Updating...' : 'Update Event'}
                </Button>
              </div>
            </form>
          </Modal>
        </div>
      </div>
    </div>
  );
}


'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Header } from '@/components/Header';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { tokensApi, rsvpsApi } from '@/lib/api/client';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  capacity: number;
}

interface TokenData {
  email: string;
  name: string | null;
}

export default function EventRSVPPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const token = params.token as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // RSVP state
  const [hasResponded, setHasResponded] = useState(false);
  const [existingRsvp, setExistingRsvp] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState<'going' | 'not-going' | null>(null);
  const [withCompanion, setWithCompanion] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [dietaryPreference, setDietaryPreference] = useState<'nonveg' | 'veg' | 'vegan' | ''>('');
  const [companionDietaryPreference, setCompanionDietaryPreference] = useState<'nonveg' | 'veg' | 'vegan' | ''>('');

  // Helper to safely format dates
  const safeFormatDate = (dateValue: string | Date | undefined | null, formatStr: string): string => {
    if (!dateValue) return 'N/A';
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return 'Invalid Date';
    try {
      return format(date, formatStr);
    } catch {
      return 'Invalid Date';
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch event and token data
        const data = await tokensApi.getByToken(token);
        setEvent(data.event);
        setTokenData(data.token);
        setGuestName(data.token.name || '');

        // Check if already responded
        const statusResponse = await rsvpsApi.checkTokenStatus(token);
        if (statusResponse.hasResponded) {
          setHasResponded(true);
          setExistingRsvp(statusResponse.rsvp);
        }
      } catch (err: any) {
        if (err?.status === 404) {
          setError('Invalid or expired invitation link');
        } else {
          setError(err?.message || 'Failed to load event details');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleSubmitRSVP = async () => {
    if (!selectedStatus) return;

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const companions = (selectedStatus === 'going' && withCompanion) ? 1 : 0;
      const result = await rsvpsApi.submitWithToken(
        token,
        selectedStatus,
        companions,
        guestName,
        dietaryPreference || undefined,
        companionDietaryPreference || undefined
      );

      setSuccessMessage(result.message);
      setHasResponded(true);
      setExistingRsvp({
        status: selectedStatus,
        companions,
        totalAttendees: result.rsvp.totalAttendees,
        respondedAt: new Date().toISOString(),
        dietaryPreference,
        companionDietaryPreference,
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to submit RSVP');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error && !event) {
    return (
      <div className="min-h-screen bg-primary/30 dark:bg-[#1a1a1a]">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-72px)] p-4">
          <Card>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Error</h2>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
          </div>
        </Card>
        </div>
      </div>
    );
  }

  if (!event) return null;

  const eventDate = new Date(event.date);
  const isPastEvent = !isNaN(eventDate.getTime()) && eventDate < new Date();

  // Already responded view
  if (hasResponded && existingRsvp) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/30 via-purple-50 to-blue-50 dark:from-[#1a1a1a] dark:via-[#1a1a2a] dark:to-[#1a1a3a]">
        <Header />
        <div className="py-12">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 mb-6"
                >
                  <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>

                <h2 className="text-2xl font-bold text-secondary mb-3">
                  {existingRsvp.status === 'going' ? "You're All Set!" : 'Response Recorded'}
                </h2>

                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {existingRsvp.status === 'going' 
                    ? `You've confirmed your attendance${existingRsvp.companions > 0 ? ` with ${existingRsvp.companions} companion${existingRsvp.companions > 1 ? 's' : ''}` : ''}.`
                    : "Thank you for letting us know you can't make it."}
                </p>

                <div className="bg-gray-50 dark:bg-[#2a2a2a] rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-secondary mb-4">{event.title}</h3>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <span>📅</span>
                      <span>{safeFormatDate(event.date, 'PPP p')}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span>📍</span>
                      <span>{event.location}</span>
                    </div>
                    {existingRsvp.status === 'going' && (
                      <div className="flex items-center justify-center gap-2 mt-4 text-green-600 dark:text-green-400 font-medium">
                        <span>👥</span>
                        <span>{existingRsvp.totalAttendees} {existingRsvp.totalAttendees === 1 ? 'person' : 'people'} attending</span>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Responded on {safeFormatDate(existingRsvp.respondedAt, 'PPP')}
                </p>
              </div>
            </Card>
          </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // RSVP Form View
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/30 via-purple-50 to-blue-50 dark:from-[#1a1a1a] dark:via-[#1a1a2a] dark:to-[#1a1a3a]">
      <Header />
      <div className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Event Details Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Card>
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-secondary mb-2">{event.title}</h1>
              <p className="text-gray-600 dark:text-gray-400">You're Invited!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📅</span>
                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Date & Time</p>
                  <p className="text-gray-700 dark:text-gray-300">{safeFormatDate(event.date, 'PPP')}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{safeFormatDate(event.date, 'p')}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">📍</span>
                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Location</p>
                  <p className="text-gray-700 dark:text-gray-300">{event.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">🏷️</span>
                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Category</p>
                  <p className="text-gray-700 dark:text-gray-300">{event.category}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">👥</span>
                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Capacity</p>
                  <p className="text-gray-700 dark:text-gray-300">{event.capacity} people</p>
                </div>
              </div>
            </div>

            {event.description && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-[#2a2a2a] rounded-lg">
                <p className="text-gray-700 dark:text-gray-300">{event.description}</p>
              </div>
            )}

            {isPastEvent && (
              <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">This event has already passed.</p>
              </div>
            )}
          </Card>
        </motion.div>

        {/* RSVP Form Card */}
        {!isPastEvent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <h2 className="text-2xl font-bold text-secondary mb-6 text-center">Will You Attend?</h2>

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

              {/* Guest Name Input */}
              <div className="mb-6">
                <Input
                  label="Your Name"
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Enter your name"
                  required
                />
              </div>

              {/* RSVP Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Button
                  variant="primary"
                  onClick={() => setSelectedStatus('going')}
                  className={`py-6 ${
                    selectedStatus === 'going'
                      ? 'bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700'
                      : ''
                  }`}
                >
                  ✓ Will Join
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedStatus('not-going');
                    setWithCompanion(false);
                  }}
                  className={`py-6 ${
                    selectedStatus === 'not-going'
                      ? 'border-red-500 text-red-600 dark:text-red-400'
                      : ''
                  }`}
                >
                  ✗ Sorry, Can't Join
                </Button>
              </div>

              {/* Companion Toggle and Dietary Preferences (only show if going) */}
              <AnimatePresence>
                {selectedStatus === 'going' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 space-y-4"
                  >
                    {/* Companion Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#2a2a2a] rounded-lg">
                      <div>
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Bringing a companion?
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Toggle on if you're bringing someone with you
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setWithCompanion(!withCompanion)}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                          withCompanion ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                            withCompanion ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* User Dietary Preference */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Your Dietary Preference
                      </label>
                      <select
                        value={dietaryPreference}
                        onChange={(e) => setDietaryPreference(e.target.value as 'nonveg' | 'veg' | 'vegan' | '')}
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary transition-colors"
                      >
                        <option value="">Select preference</option>
                        <option value="nonveg">Non-Vegetarian</option>
                        <option value="veg">Vegetarian</option>
                        <option value="vegan">Vegan</option>
                      </select>
                    </div>

                    {/* Companion Dietary Preference (only show if companion is enabled) */}
                    {withCompanion && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Companion's Dietary Preference
                        </label>
                        <select
                          value={companionDietaryPreference}
                          onChange={(e) => setCompanionDietaryPreference(e.target.value as 'nonveg' | 'veg' | 'vegan' | '')}
                          className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary transition-colors"
                        >
                          <option value="">Select preference</option>
                          <option value="nonveg">Non-Vegetarian</option>
                          <option value="veg">Vegetarian</option>
                          <option value="vegan">Vegan</option>
                        </select>
                      </motion.div>
                    )}

                    {/* Status Summary */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        {withCompanion ? (
                          <>✓ You and 1 companion will attend (2 people total)</>
                        ) : (
                          <>✓ You will attend (1 person)</>
                        )}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <Button
                variant="primary"
                size="lg"
                onClick={handleSubmitRSVP}
                disabled={!selectedStatus || !guestName.trim() || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Submitting...' : 'Confirm RSVP'}
              </Button>

              <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
                Your response will be recorded once. Please choose carefully.
              </p>
            </Card>
          </motion.div>
        )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { Event } from '@/lib/types';
import { Card } from './Card';
import { Button } from './Button';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface EventCardProps {
  event: Event;
  onRSVP: (eventId: string, status: 'going' | 'maybe' | 'not-going') => void;
  currentRSVP?: string | null;
}

export function EventCard({ event, onRSVP, currentRSVP }: EventCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const eventDate = new Date(event.date);
  const isPast = eventDate < new Date();
  const isFull = event.rsvpCount >= event.capacity;
  const spotsLeft = event.capacity - event.rsvpCount;

  const handleRSVP = async (status: 'going' | 'maybe' | 'not-going') => {
    setIsSubmitting(true);
    await onRSVP(event.id, status);
    setIsSubmitting(false);
  };

  return (
    <Card hover className="overflow-hidden">
      <div className="flex flex-col h-full">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-xl font-bold text-secondary dark:text-secondary mb-1">
                {event.title}
              </h3>
              <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-primary text-secondary dark:bg-secondary/20 dark:text-secondary">
                {event.category}
              </span>
            </div>
            {isPast && (
              <span className="px-2 py-1 text-xs font-medium rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                Past
              </span>
            )}
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
            {event.description}
          </p>

          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {format(eventDate, 'PPP p')}
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {event.location}
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              {event.rsvpCount} / {event.capacity} attendees
              {!isFull && (
                <span className="ml-2 text-xs text-secondary">({spotsLeft} spots left)</span>
              )}
            </div>
          </div>

          {isFull && !isPast && (
            <div className="mb-4 px-3 py-2 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">Event is full</p>
            </div>
          )}
        </div>

        {!isPast && (
          <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant={currentRSVP === 'going' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleRSVP('going')}
              disabled={isSubmitting || isFull}
              className="flex-1"
            >
              {currentRSVP === 'going' ? '✓ Going' : 'Going'}
            </Button>
            <Button
              variant={currentRSVP === 'maybe' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleRSVP('maybe')}
              disabled={isSubmitting}
              className="flex-1"
            >
              {currentRSVP === 'maybe' ? '✓ Maybe' : 'Maybe'}
            </Button>
            <Button
              variant={currentRSVP === 'not-going' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleRSVP('not-going')}
              disabled={isSubmitting}
              className="flex-1"
            >
              {currentRSVP === 'not-going' ? '✗ Not Going' : 'Not Going'}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}


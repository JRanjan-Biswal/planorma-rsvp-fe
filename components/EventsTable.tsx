'use client';

import { Event } from '@/lib/types';
import { Button } from './Button';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

interface EventsTableProps {
  events: Event[];
}

export function EventsTable({ events }: EventsTableProps) {

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2a2a2a] shadow-md">
      <table className="w-full min-w-[800px]">
        <thead className="bg-primary/50 dark:bg-secondary/10">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-secondary dark:text-secondary uppercase tracking-wider">
              Event
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-secondary dark:text-secondary uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-secondary dark:text-secondary uppercase tracking-wider">
              Date & Time
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-secondary dark:text-secondary uppercase tracking-wider">
              Location
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-secondary dark:text-secondary uppercase tracking-wider">
              RSVPs
            </th>
            <th className="px-6 py-4 text-center text-xs font-semibold text-secondary dark:text-secondary uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {events.map((event, index) => {
            const eventDate = new Date(event.date);
            const isPast = eventDate < new Date();
            const isFull = event.rsvpCount >= event.capacity;
            const spotsLeft = event.capacity - event.rsvpCount;

            return (
              <motion.tr
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-primary/20 dark:hover:bg-secondary/5 transition-colors duration-200 cursor-pointer"
                onClick={() => window.location.href = `/event/${event.id}`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-secondary dark:text-secondary">
                        {event.title}
                      </h3>
                      {isPast && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                          Past
                        </span>
                      )}
                      {isFull && !isPast && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200">
                          Full
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2 max-w-md">
                      {event.description}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-primary text-secondary dark:bg-secondary/20 dark:text-secondary">
                    {event.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    <div>{format(eventDate, 'MMM dd, yyyy')}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {format(eventDate, 'h:mm a')}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    {event.location}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    <div className="font-medium text-lg">{event.rsvpCount} / {event.capacity}</div>
                    {!isPast && !isFull && (
                      <div className="text-xs text-green-600 dark:text-green-400">
                        {spotsLeft} spots available
                      </div>
                    )}
                    {isFull && !isPast && (
                      <div className="text-xs text-yellow-600 dark:text-yellow-400">
                        Event is full
                      </div>
                    )}
                    {isPast && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Event ended
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={(e) => {
                      e?.stopPropagation();
                      window.location.href = `/event/${event.id}`;
                    }}
                    className="text-xs px-4 py-2"
                  >
                    Manage Event
                  </Button>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}


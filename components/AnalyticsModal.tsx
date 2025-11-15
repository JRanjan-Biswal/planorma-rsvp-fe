'use client';

import { Modal } from './Modal';
import { Button } from './Button';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface RSVPStats {
  going: { count: number; guests: number };
  notGoing: number;
  pending: number;
  totalInvited: number;
}

interface DietaryStats {
  nonveg: number;
  veg: number;
  vegan: number;
  notSpecified: number;
}

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  rsvpStats: RSVPStats | null;
  dietaryStats: DietaryStats | null;
}

export function AnalyticsModal({
  isOpen,
  onClose,
  rsvpStats,
  dietaryStats,
}: AnalyticsModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Event Analytics"
    >
      <div className="space-y-6">
        {/* RSVP Status Statistics */}
        {rsvpStats && (
          <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">RSVP Status</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Going', value: rsvpStats.going.guests, color: '#10b981' },
                        { name: 'Not Going', value: rsvpStats.notGoing, color: '#ef4444' },
                        { name: 'Pending', value: rsvpStats.pending, color: '#6b7280' },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: 'Going', value: rsvpStats.going.guests, color: '#10b981' },
                        { name: 'Not Going', value: rsvpStats.notGoing, color: '#ef4444' },
                        { name: 'Pending', value: rsvpStats.pending, color: '#6b7280' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => [value, 'Guests']}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend 
                      formatter={(value) => {
                        const data = [
                          { name: 'Going', value: rsvpStats.going.guests },
                          { name: 'Not Going', value: rsvpStats.notGoing },
                          { name: 'Pending', value: rsvpStats.pending },
                        ];
                        const item = data.find(d => d.name === value);
                        return `${value} (${item?.value || 0})`;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Invited: <span className="font-semibold text-gray-900 dark:text-gray-100">{rsvpStats.totalInvited}</span>
                  </p>
                  {rsvpStats.going.count > rsvpStats.going.guests && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Total Attendees (with companions): <span className="font-semibold">{rsvpStats.going.count}</span>
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border-2 border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-green-800 dark:text-green-200">Going</h4>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        {rsvpStats.going.guests} {rsvpStats.going.guests === 1 ? 'guest' : 'guests'}
                        {rsvpStats.going.count > rsvpStats.going.guests && ` + ${rsvpStats.going.count - rsvpStats.going.guests} companions`}
                      </p>
                    </div>
                    <span className="text-3xl font-bold text-green-700 dark:text-green-300">{rsvpStats.going.count}</span>
                  </div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border-2 border-red-200 dark:border-red-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-red-800 dark:text-red-200">Not Going</h4>
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        {rsvpStats.notGoing} {rsvpStats.notGoing === 1 ? 'guest' : 'guests'}
                      </p>
                    </div>
                    <span className="text-3xl font-bold text-red-700 dark:text-red-300">{rsvpStats.notGoing}</span>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/20 rounded-lg p-4 border-2 border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Pending</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {rsvpStats.pending} {rsvpStats.pending === 1 ? 'guest' : 'guests'}
                      </p>
                    </div>
                    <span className="text-3xl font-bold text-gray-700 dark:text-gray-300">{rsvpStats.pending}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dietary Preferences Statistics */}
        {dietaryStats && (dietaryStats.nonveg > 0 || dietaryStats.veg > 0 || dietaryStats.vegan > 0) && (
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Dietary Preferences</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Non-Vegetarian', value: dietaryStats.nonveg, color: '#f97316' },
                        { name: 'Vegetarian', value: dietaryStats.veg, color: '#10b981' },
                        { name: 'Vegan', value: dietaryStats.vegan, color: '#059669' },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: 'Non-Vegetarian', value: dietaryStats.nonveg, color: '#f97316' },
                        { name: 'Vegetarian', value: dietaryStats.veg, color: '#10b981' },
                        { name: 'Vegan', value: dietaryStats.vegan, color: '#059669' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => [value, 'People']}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend 
                      formatter={(value) => {
                        const data = [
                          { name: 'Non-Vegetarian', value: dietaryStats.nonveg },
                          { name: 'Vegetarian', value: dietaryStats.veg },
                          { name: 'Vegan', value: dietaryStats.vegan },
                        ];
                        const item = data.find(d => d.name === value);
                        return `${value} (${item?.value || 0})`;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total with Preferences: <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {dietaryStats.nonveg + dietaryStats.veg + dietaryStats.vegan}
                    </span>
                  </p>
                  {dietaryStats.notSpecified > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Not Specified: <span className="font-semibold">{dietaryStats.notSpecified}</span>
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border-2 border-orange-200 dark:border-orange-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-orange-800 dark:text-orange-200 flex items-center gap-2">
                        <span>🍖</span> Non-Vegetarian
                      </h4>
                      <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                        {dietaryStats.nonveg} {dietaryStats.nonveg === 1 ? 'person' : 'people'}
                      </p>
                    </div>
                    <span className="text-3xl font-bold text-orange-700 dark:text-orange-300">{dietaryStats.nonveg}</span>
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border-2 border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-green-800 dark:text-green-200 flex items-center gap-2">
                        <span>🥗</span> Vegetarian
                      </h4>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        {dietaryStats.veg} {dietaryStats.veg === 1 ? 'person' : 'people'}
                      </p>
                    </div>
                    <span className="text-3xl font-bold text-green-700 dark:text-green-300">{dietaryStats.veg}</span>
                  </div>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 border-2 border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                        <span>🌱</span> Vegan
                      </h4>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                        {dietaryStats.vegan} {dietaryStats.vegan === 1 ? 'person' : 'people'}
                      </p>
                    </div>
                    <span className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">{dietaryStats.vegan}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {(!rsvpStats && (!dietaryStats || (dietaryStats.nonveg === 0 && dietaryStats.veg === 0 && dietaryStats.vegan === 0))) && (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">No analytics data available yet.</p>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button
            variant="primary"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}


'use client';

import { useState } from 'react';
import { Input } from './Input';
import { Select } from './Select';
import { Button } from './Button';
import { Card } from './Card';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEventsStore } from '@/lib/store/eventsStore';

interface CreateEventFormProps {
  onSuccess?: () => void;
}

export function CreateEventForm({ onSuccess }: CreateEventFormProps) {
  const router = useRouter();
  const { createEvent } = useEventsStore();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: '',
    capacity: '',
    hostName: '',
    hostMobile: '',
    hostEmail: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      // Combine date and time into ISO 8601 format with timezone
      const dateTime = new Date(`${formData.date}T${formData.time}:00`).toISOString();

      await createEvent({
        title: formData.title,
        description: formData.description,
        date: dateTime,
        location: formData.location,
        category: formData.category,
        capacity: parseInt(formData.capacity),
        hostName: formData.hostName,
        hostMobile: formData.hostMobile,
        hostEmail: formData.hostEmail,
      });

      // Call onSuccess callback first (which will handle navigation)
      if (onSuccess) {
        onSuccess();
      } else {
        // Fallback: redirect to homepage if no callback provided
        router.push('/');
      }
    } catch (error: any) {
      setErrors({ general: error?.message || 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold text-secondary mb-4">Create New Event</h2>
      
      {errors.general && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg"
        >
          <p className="text-sm text-red-800 dark:text-red-200">{errors.general}</p>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Event Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          error={errors.title}
          required
        />

        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all duration-200"
            rows={4}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            error={errors.date}
            required
          />

          <Input
            label="Time"
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            error={errors.time}
            required
          />
        </div>

        <Input
          label="Location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          error={errors.location}
          required
        />

        <Select
          label="Category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          error={errors.category}
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
          value={formData.capacity}
          onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
          error={errors.capacity}
          min="1"
          required
        />

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Host Information</h3>
          
          <Input
            label="Host Name"
            value={formData.hostName}
            onChange={(e) => setFormData({ ...formData, hostName: e.target.value })}
            error={errors.hostName}
            required
          />

          <Input
            label="Host Mobile Number"
            type="tel"
            value={formData.hostMobile}
            onChange={(e) => setFormData({ ...formData, hostMobile: e.target.value })}
            error={errors.hostMobile}
            placeholder="+1 (555) 123-4567"
            required
          />

          <Input
            label="Host Email"
            type="email"
            value={formData.hostEmail}
            onChange={(e) => setFormData({ ...formData, hostEmail: e.target.value })}
            error={errors.hostEmail}
            placeholder="host@example.com"
            required
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Creating Event...' : 'Create Event'}
        </Button>
      </form>
    </Card>
  );
}


'use client';

import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';

interface EditEventFormData {
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

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: EditEventFormData;
  onFormDataChange: (data: EditEventFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  isUpdating: boolean;
}

export function EditEventModal({
  isOpen,
  onClose,
  formData,
  onFormDataChange,
  onSubmit,
  isUpdating,
}: EditEventModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Event"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Event Title"
          type="text"
          value={formData.title}
          onChange={(e) => onFormDataChange({ ...formData, title: e.target.value })}
          placeholder="Annual Company Gala"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
            placeholder="Describe your event..."
            rows={4}
            className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <Input
          label="Date & Time"
          type="datetime-local"
          value={formData.date}
          onChange={(e) => onFormDataChange({ ...formData, date: e.target.value })}
          min={new Date().toISOString().slice(0, 16)}
          required
        />

        <Input
          label="Location"
          type="text"
          value={formData.location}
          onChange={(e) => onFormDataChange({ ...formData, location: e.target.value })}
          placeholder="New York City, NY"
          required
        />

        <Select
          label="Category"
          value={formData.category}
          onChange={(e) => onFormDataChange({ ...formData, category: e.target.value })}
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
          value={formData.capacity.toString()}
          onChange={(e) => onFormDataChange({ ...formData, capacity: parseInt(e.target.value) || 0 })}
          placeholder="100"
          min="10"
          required
        />

        <Input
          label="Allowed Companions per Guest"
          type="number"
          value={formData.allowedCompanions.toString()}
          onChange={(e) => onFormDataChange({ ...formData, allowedCompanions: parseInt(e.target.value) || 0 })}
          placeholder="0"
          min="0"
          max="10"
          required
        />

        <Input
          label="Host Name"
          type="text"
          value={formData.hostName}
          onChange={(e) => onFormDataChange({ ...formData, hostName: e.target.value })}
          placeholder="John Doe"
          required
        />

        <Input
          label="Host Mobile"
          type="tel"
          value={formData.hostMobile}
          onChange={(e) => onFormDataChange({ ...formData, hostMobile: e.target.value })}
          placeholder="+1 (555) 123-4567"
          required
        />

        <Input
          label="Host Email"
          type="email"
          value={formData.hostEmail}
          onChange={(e) => onFormDataChange({ ...formData, hostEmail: e.target.value })}
          placeholder="host@example.com"
          required
        />

        <div className="flex gap-3 justify-end pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
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
  );
}


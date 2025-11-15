'use client';

import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  inviteEmail: string;
  inviteName: string;
  onEmailChange: (email: string) => void;
  onNameChange: (name: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isInviting: boolean;
  isExpired: boolean;
}

export function InviteModal({
  isOpen,
  onClose,
  inviteEmail,
  inviteName,
  onEmailChange,
  onNameChange,
  onSubmit,
  isInviting,
  isExpired,
}: InviteModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invite User to Event"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          value={inviteEmail}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="user@example.com"
          required
        />

        <Input
          label="Name (Optional)"
          type="text"
          value={inviteName}
          onChange={(e) => onNameChange(e.target.value)}
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
            onClick={onClose}
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
  );
}


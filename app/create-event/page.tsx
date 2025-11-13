'use client';

import { useRouter } from 'next/navigation';
import { CreateEventForm } from '@/components/CreateEventForm';
import { Button } from '@/components/Button';
import { Header } from '@/components/Header';
import { motion } from 'framer-motion';
import { useEventsStore } from '@/lib/store/eventsStore';

export default function CreateEventPage() {
  const router = useRouter();
  const { refreshEvents } = useEventsStore();

  const handleSuccess = async () => {
    // Refresh events to ensure homepage shows the new event
    await refreshEvents();
    // Redirect to homepage after successful event creation
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-primary/30">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="outline"
          onClick={() => router.push('/')}
          className="mb-6"
        >
          ← Back to Events
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <CreateEventForm onSuccess={handleSuccess} />
        </motion.div>
      </main>
    </div>
  );
}


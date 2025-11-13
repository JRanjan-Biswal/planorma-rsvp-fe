'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Header } from '@/components/Header';
import { motion } from 'framer-motion';
import { emailTemplatesApi } from '@/lib/api/client';

const FONT_OPTIONS = [
  'Arial, sans-serif',
  'Georgia, serif',
  'Courier New, monospace',
  'Verdana, sans-serif',
  'Times New Roman, serif',
  'Trebuchet MS, sans-serif',
];

function EmailTemplateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');
  const { user, isLoading: authLoading } = useAuth();
  const hasFetchedTemplate = useRef(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    logoUrl: '',
    hostName: '',
    primaryColor: '#4F46E5',
    secondaryColor: '#ffffff',
    textColor: '#374151',
    eventDetailsBackgroundColor: '#f3f4f6',
    fontFamily: 'Arial, sans-serif',
    headerText: "You're Invited!",
    sampleEventTitle: 'Join Us for an Amazing Event',
    footerText: 'We look forward to seeing you!',
    buttonText: 'RSVP Now',
    buttonRadius: '8',
    showEmojis: true,
    descriptionText: 'Join us for an amazing event! This is a preview of how your invitation will look.',
    isDefault: false,
  });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/login');
      return;
    }

    if (user && user.role === 'admin' && !hasFetchedTemplate.current) {
      hasFetchedTemplate.current = true;
      fetchTemplate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role, authLoading, eventId]);

  const fetchTemplate = async () => {
    try {
      setIsLoading(true);
      const template = await emailTemplatesApi.get(eventId || undefined);
      if (template && template.hostName) {
        setFormData(template);
      }
    } catch (err: any) {
      console.error('Failed to load template:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await emailTemplatesApi.save({
        ...formData,
        eventId: eventId || undefined,
      });

      setSuccessMessage('Template saved successfully!');
      setTimeout(() => {
        if (eventId) {
          router.push(`/event/${eventId}`);
        } else {
          router.push('/');
        }
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-primary/30 dark:bg-[#1a1a1a]">
      <Header />
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-6"
        >
          ← Back
        </Button>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <h1 className="text-4xl font-bold text-secondary mb-2">Customize Email Template</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Personalize your invitation emails with your branding
          </p>
        </motion.div>

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Editor Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="lg:sticky lg:top-6"
          >
            <Card className="flex flex-col max-h-[calc(100vh-12rem)]">
              <h2 className="text-2xl font-bold text-secondary mb-6 shrink-0">Template Settings</h2>

              <form onSubmit={handleSave} className="space-y-6 flex-1 overflow-y-auto pr-2 -mr-2">
                {/* Host Name */}
                <Input
                  label="Host Name"
                  type="text"
                  value={formData.hostName}
                  onChange={(e) => setFormData({ ...formData, hostName: e.target.value })}
                  placeholder="Your Name or Organization"
                  required
                />

                {/* Primary Color */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    Primary Color
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="w-16 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      placeholder="#4F46E5"
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Secondary Color */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    Secondary Color (Background)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                      className="w-16 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                      placeholder="#ffffff"
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Text Color */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    Text Color
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={formData.textColor}
                      onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                      className="w-16 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={formData.textColor}
                      onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                      placeholder="#374151"
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Event Details Background Color */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    Event Section Background Color
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={formData.eventDetailsBackgroundColor}
                      onChange={(e) => setFormData({ ...formData, eventDetailsBackgroundColor: e.target.value })}
                      className="w-16 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={formData.eventDetailsBackgroundColor}
                      onChange={(e) => setFormData({ ...formData, eventDetailsBackgroundColor: e.target.value })}
                      placeholder="#f3f4f6"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Background color for event title, details, and button
                  </p>
                </div>

                {/* Font Family */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    Font Family
                  </label>
                  <select
                    value={formData.fontFamily}
                    onChange={(e) => setFormData({ ...formData, fontFamily: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/20"
                  >
                    {FONT_OPTIONS.map((font) => (
                      <option key={font} value={font}>
                        {font.split(',')[0]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Header Text */}
                <Input
                  label="Header Text"
                  type="text"
                  value={formData.headerText}
                  onChange={(e) => setFormData({ ...formData, headerText: e.target.value })}
                  placeholder="You're Invited!"
                  required
                />

                {/* Sample Event Title */}
                <Input
                  label="Sample Event Title (for preview)"
                  type="text"
                  value={formData.sampleEventTitle}
                  onChange={(e) => setFormData({ ...formData, sampleEventTitle: e.target.value })}
                  placeholder="Join Us for an Amazing Event"
                  required
                />

                {/* Footer Text */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    Footer Text
                  </label>
                  <textarea
                    value={formData.footerText}
                    onChange={(e) => setFormData({ ...formData, footerText: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/20"
                    rows={3}
                    placeholder="We look forward to seeing you!"
                  />
                </div>

                {/* Description Text */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    Description Text
                  </label>
                  <textarea
                    value={formData.descriptionText}
                    onChange={(e) => setFormData({ ...formData, descriptionText: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/20"
                    rows={3}
                    placeholder="Join us for an amazing event!"
                  />
                </div>

                {/* Button Text */}
                <Input
                  label="RSVP Button Text"
                  type="text"
                  value={formData.buttonText}
                  onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                  placeholder="RSVP Now"
                  required
                />

                {/* Button Border Radius */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    Button Border Radius (px)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={formData.buttonRadius}
                    onChange={(e) => setFormData({ ...formData, buttonRadius: e.target.value })}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {formData.buttonRadius}px
                  </div>
                </div>

                {/* Show Emojis */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showEmojis"
                    checked={formData.showEmojis}
                    onChange={(e) => setFormData({ ...formData, showEmojis: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-secondary focus:ring-secondary"
                  />
                  <label htmlFor="showEmojis" className="text-sm text-foreground">
                    Show emojis in event details (📅, 📍, 📊)
                  </label>
                </div>

                {/* Is Default */}
                {!eventId && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-secondary focus:ring-secondary"
                    />
                    <label htmlFor="isDefault" className="text-sm text-foreground">
                      Use as default template for all events
                    </label>
                  </div>
                )}

                {/* Save Button */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isSaving}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSaving || !formData.hostName}
                    className="flex-1"
                  >
                    {isSaving ? 'Saving...' : 'Save Template'}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>

          {/* Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="lg:sticky lg:top-6"
          >
            <Card className="flex flex-col max-h-[calc(100vh-12rem)]">
              <h2 className="text-2xl font-bold text-secondary mb-6 shrink-0">Preview</h2>

              <div
                className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-y-auto flex-1"
                style={{
                  backgroundColor: formData.secondaryColor,
                  fontFamily: formData.fontFamily,
                }}
              >
                <div className="p-8">
                  {/* Header */}
                  <div
                    className="text-center mb-6"
                    style={{ color: formData.primaryColor }}
                  >
                    <h1 className="text-3xl font-bold mb-2">{formData.headerText}</h1>
                  </div>

                  {/* Event Content (Sample) */}
                  <div 
                    className="p-6 rounded-lg mb-6"
                    style={{ backgroundColor: formData.eventDetailsBackgroundColor }}
                  >
                    <h2
                      className="text-2xl font-bold mb-4"
                      style={{ color: formData.primaryColor }}
                    >
                      {formData.sampleEventTitle}
                    </h2>

                    <div 
                      className="space-y-2 mb-6" 
                      style={{ 
                        color: formData.textColor
                      }}
                    >
                      <p>
                        <strong>{formData.showEmojis ? '📅 ' : ''}Date:</strong> Saturday, December 25, 2024 at 6:00 PM
                      </p>
                      <p>
                        <strong>{formData.showEmojis ? '📍 ' : ''}Location:</strong> Sample Venue
                      </p>
                      <p>
                        <strong>{formData.showEmojis ? '📊 ' : ''}Capacity:</strong> 100 people
                      </p>
                    </div>

                    <p className="mb-6" style={{ color: formData.textColor }}>
                      {formData.descriptionText}
                    </p>

                    {/* RSVP Button */}
                    <div className="text-center">
                      <div
                        className="inline-block px-8 py-3 text-white font-bold"
                        style={{ 
                          backgroundColor: formData.primaryColor,
                          borderRadius: `${formData.buttonRadius}px`
                        }}
                      >
                        {formData.buttonText}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="text-center text-sm" style={{ color: formData.textColor }}>
                    <p className="mb-2">{formData.footerText}</p>
                    {formData.hostName && (
                      <p className="font-medium">— {formData.hostName}</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
        </div>
      </div>
    </div>
  );
}

export default function EmailTemplatePage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <EmailTemplateContent />
    </Suspense>
  );
}


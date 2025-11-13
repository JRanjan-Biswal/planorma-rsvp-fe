import { z } from 'zod';

// Input sanitization utilities
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>\"']/g, '');
}

export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// Rate limiting helper (in-memory for demo, use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minute
): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

// CSRF token validation
export function validateCSRFToken(token: string, sessionToken: string): boolean {
  // In production, implement proper CSRF token validation
  return token === sessionToken;
}

// Event validation schema
export const eventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(2000, 'Description too long'),
  date: z.string().datetime('Invalid date format'),
  location: z.string().min(1, 'Location is required').max(200, 'Location too long'),
  category: z.string().min(1, 'Category is required'),
  capacity: z.number().int().positive('Capacity must be positive'),
});

// RSVP validation schema
export const rsvpSchema = z.object({
  status: z.enum(['going', 'maybe', 'not-going']),
});


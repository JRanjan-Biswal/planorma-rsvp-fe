# Event Management System - Features

## Overview

This application is a complete event management and RSVP system with role-based access control.

## Features Implemented

### 1. Authentication & Authorization

- **Signup Page** (`/signup`): Users can create accounts (default role: 'user')
- **Login Page** (`/login`): Admin and user login
- **Admin-Only Home Page** (`/`): Only accessible to admin users
- **Role-Based Access**: Admin and user roles managed via Supabase

### 2. Event Management (Admin)

- **Create Events**: Admin can create events with:
  - Title, description, date, time, location
  - Category, capacity
- **Event List**: View all events in a table format
- **Event Details Page** (`/event/[eventId]`): Admin can:
  - View event details
  - Invite users by email
  - Generate unique tokens for each user
  - View list of invited users

### 3. User Invitation System

- **Token Generation**: Each invited user gets a unique token
- **Email Invitation**: Admin can invite users by email (email sending needs to be configured)
- **Unique Links**: Each user receives a link: `/event/[eventId]/[token]`

### 4. User Event Access

- **Token-Based Access** (`/event/[eventId]/[token]`): Users can:
  - View event details
  - Edit their name
  - Edit their email
  - Add/edit dietary preferences
  - Save their information

### 5. Database Schema

- **events**: Stores event information
- **user_tokens**: Stores user invitation tokens and profile data
- **rsvps**: Stores RSVP responses (for future use)
- **user_roles**: Manages admin/user roles

## Setup Instructions

### 1. Database Migration

Run the SQL migrations in your Supabase dashboard:
1. `supabase/migrations/001_create_user_roles.sql`
2. `supabase/migrations/002_create_events_and_tokens.sql`

### 2. Environment Variables

Ensure your `.env.local` has:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Create Admin User

1. Sign up a user through `/signup`
2. Go to Supabase dashboard > Table Editor > `user_roles`
3. Insert a row with the user's UUID and `role: 'admin'`

### 4. Email Configuration (Optional)

To enable email sending for invitations, you'll need to:
1. Set up an email service (Resend, SendGrid, etc.)
2. Add email sending logic to `/api/events/[id]/invite/route.ts`
3. Configure email templates

## User Flow

### Admin Flow:
1. Admin logs in at `/login`
2. Admin sees event list at `/`
3. Admin creates new event
4. Admin goes to event page `/event/[eventId]`
5. Admin invites users by email
6. System generates unique tokens and links

### User Flow:
1. User receives email with link `/event/[eventId]/[token]`
2. User clicks link and accesses event page
3. User can view event details
4. User can edit their name, email, and dietary preferences
5. User saves information

## API Endpoints

- `GET /api/events` - Get all events (admin only)
- `POST /api/events/create` - Create event (admin only)
- `GET /api/events/[id]` - Get event details
- `POST /api/events/[id]/invite` - Invite user (admin only)
- `GET /api/events/[id]/tokens` - Get all tokens for event (admin only)
- `GET /api/events/[id]/token/[token]` - Get event and token info
- `PUT /api/events/[id]/token/[token]` - Update user information

## Security Features

- Row Level Security (RLS) on all tables
- Token-based access for user pages
- Admin-only routes protected
- Input validation and sanitization
- Rate limiting on API endpoints


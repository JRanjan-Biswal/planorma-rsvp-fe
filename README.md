# HappyHosts Events - RSVP Application

A modern, secure event management and RSVP application built with Next.js, featuring authentication, dark/light mode, and comprehensive event filtering capabilities.

## Features

- 🔐 **Authentication**: Secure login using JWT tokens with Express backend
- 🌓 **Dark/Light Mode**: Beautiful theme toggle with smooth transitions
- 🔍 **Search & Filter**: Advanced filtering by date, category, and search terms
- 📊 **Sorting**: Multiple sorting options (date, title, capacity)
- ✨ **Animations**: Smooth, intuitive animations using Framer Motion
- 🎨 **Custom Theme**: Beautiful color scheme (#ffeee1 and #80527a)
- 🔒 **Security**: Input validation, rate limiting, and error handling
- 📱 **Responsive**: Fully responsive design for all devices

## Tech Stack

- **Frontend Framework**: Next.js 16 (App Router)
- **Backend**: Express.js with MongoDB
- **Authentication**: JWT tokens
- **State Management**: Zustand
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **State Management**: React Query (TanStack Query)
- **Theme Management**: next-themes
- **Validation**: Zod
- **Date Handling**: date-fns
- **TypeScript**: Full type safety

## Project Structure

```
happyhosts-rsvp-assignment/
├── frontend/
│   ├── app/
│   │   ├── create-event/
│   │   ├── event/
│   │   ├── login/
│   │   ├── signup/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── providers.tsx
│   ├── components/
│   ├── lib/
│   │   ├── api/
│   │   ├── hooks/
│   │   ├── store/
│   │   └── types.ts
│   └── package.json
└── backend/
    ├── src/
    │   ├── config/
    │   ├── models/
    │   ├── routes/
    │   ├── middleware/
    │   └── server.ts
    └── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database (connection string provided)
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd happyhosts-rsvp-assignment
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Configure environment variables:

**Backend** (`backend/.env`):
```env
PORT=5000
MONGODB_URI=mongodburl
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

5. Start the backend server:
```bash
cd backend
npm run dev
```

6. Start the frontend development server (in a new terminal):
```bash
cd frontend
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Login

- Sign up with your email address and password (minimum 6 characters)
- Sign in with your credentials to access the application
- Admin users have access to create and manage events

### Events

- Browse events on the main page
- Use the search bar to find events by title, description, or location
- Filter events by:
  - **Time**: All, Upcoming, Past, Today
  - **Category**: All categories or specific categories
- Sort events by:
  - Date (Earliest/Latest)
  - Title (A-Z/Z-A)
  - Capacity (Low to High/High to Low)

### RSVP

- Click "Going", "Maybe", or "Not Going" on any event card
- Your RSVP status is saved and displayed on the card
- Past events cannot be RSVP'd to

## Security Features

- ✅ Input validation and sanitization using Zod
- ✅ Rate limiting on API endpoints
- ✅ JWT-based authentication
- ✅ Protected API routes
- ✅ Error handling without information leakage
- ✅ Password hashing with bcrypt

## Customization

### Theme Colors

The application uses custom theme colors defined in `app/globals.css`:
- Primary: `#ffeee1` (light peach)
- Secondary: `#80527a` (purple)

To change colors, update the CSS variables in `globals.css`.

## Production Considerations

Before deploying to production:

1. **Environment Variables**: Set secure JWT secret and MongoDB connection string
2. **Rate Limiting**: Consider using Redis for distributed rate limiting
3. **Error Logging**: Implement proper error logging and monitoring
4. **CORS**: Configure CORS settings properly
5. **HTTPS**: Ensure all connections use HTTPS in production
6. **Database**: Use MongoDB Atlas or similar managed service

## Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server

## License

This project is created for the HappyHosts interview assignment.

## Author

Built as a technical assessment for HappyHosts.

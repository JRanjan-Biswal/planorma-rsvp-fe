import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define public routes that don't require authentication
const publicRoutes = [
  '/login',
  '/signup',
];

// Define regex patterns for dynamic public routes
const publicRoutePatterns = [
  /^\/event\/[^\/]+\/[^\/]+$/, // /event/[eventId]/[token] - token-based RSVP
];

// Check if a path matches any public route or pattern
function isPublicRoute(pathname: string): boolean {
  // Check exact matches
  if (publicRoutes.includes(pathname)) {
    return true;
  }
  
  // Check pattern matches
  return publicRoutePatterns.some(pattern => pattern.test(pathname));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow all API routes and static files to pass through
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // Static files (images, fonts, etc.)
  ) {
    return NextResponse.next();
  }
  
  // Check if the route is public
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }
  
  // For protected routes, check for authentication
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || 'development-secret-key-please-change-in-production',
  });
  
  // If no token and trying to access protected route, redirect to login
  if (!token) {
    const url = new URL('/login', request.url);
    // Add the original URL as a callback parameter
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};


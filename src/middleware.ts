import { NextResponse, type NextRequest } from 'next/server';
import { verifyToken } from './lib/jwt';

const publicRoutes = [
  '/',
  '/sign-in',
  '/sign-up',
  '/api/auth/signin',
  '/api/auth/signup',
  '/api/auth/me',
  '/api/auth/logout',
];

const protectedRoutes = [
  '/(protected)', // All routes under /(protected) are protected
  '/sound-effects',
  '/speech-synthesis',
  '/creative-platform',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // Allow public routes and static files
  const isPublic = 
    publicRoutes.some(route => pathname === route) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.');

  if (isPublic) {
    // Only allow API routes that are explicitly public
    if (pathname.startsWith('/api/auth/') && !publicRoutes.includes(pathname)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // Handle protected routes
  if (isProtectedRoute) {
    if (!token) {
      // For API requests, return 401
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      
      // For page routes, redirect to sign-in with return URL
      const signInUrl = new URL('/sign-in', request.url);
      signInUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Verify token
  try {
    if (!token) {
      throw new Error('No token provided');
    }
    
    const decoded = await verifyToken(token);
    if (!decoded) {
      throw new Error('Invalid token');
    }

    // Add user ID to request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decoded.userId);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Token verification failed:', error);
    // Clear invalid token
    const response = NextResponse.redirect(new URL('/sign-in', request.url));
    response.cookies.delete('token');
    return response;
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

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
  
  // Allow public routes and static files
  const isPublic = 
    publicRoutes.some(route => pathname === route) ||
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico';

  if (isPublic) {
    return NextResponse.next();
  }
  
  // Only validate API routes that are not public
  if (pathname.startsWith('/api/') && !publicRoutes.includes(pathname)) {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    try {
      // Verify token for API routes
      await verifyToken(token);
      return NextResponse.next();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
  }
  
  // For all other routes (including protected ones), we let Next.js handle authentication
  // This allows server components to use the token directly via cookies() API
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

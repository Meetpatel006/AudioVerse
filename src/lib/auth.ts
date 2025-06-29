import { verifyToken } from './jwt';

// API Response Types
interface UserResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
  error?: string;
}

export async function getCurrentUser(request?: Request) {
  // For server components/pages
  if (typeof window === 'undefined' && request) {
    const cookies = request.headers.get('cookie') ?? '';
    // Use RegExp.exec() instead of String.match()
    const tokenRegex = /token=([^;]+)/;
    const tokenMatch = tokenRegex.exec(cookies);
    const token = tokenMatch ? tokenMatch[1] : null;
    
    if (!token) return null;

    try {
      const decoded = await verifyToken(token);
      if (!decoded) return null;

      return {
        id: decoded.userId,
        // Add other user properties as needed
      };
    } catch (error) {
      console.error('Error verifying token:', error);
      return null;
    }
  }

  // For client components
  if (typeof document !== 'undefined') {
    // Use RegExp.exec() instead of String.match()
    const tokenRegex = /token=([^;]+)/;
    const tokenMatch = tokenRegex.exec(document.cookie);
    const token = tokenMatch ? tokenMatch[1] : null;
    
    if (!token) return null;

    try {
      // On client side, we'll make an API call to verify the token
      const response = await fetch('/api/auth/me', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json() as UserResponse;
        return data.user ?? null;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  return null;
}

export async function isAuthenticated(request?: Request) {
  // Fix the misused promise by using a boolean check after awaiting
  const user = await getCurrentUser(request);
  return user !== null;
}

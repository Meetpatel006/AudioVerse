import { type NextRequest } from 'next/server';
import { getHistoryItems } from '~/lib/history-server';
import { verifyToken } from '~/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    // Get the token from cookies
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Verify the token
    const decoded = await verifyToken(token);
    if (!decoded) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const userId = decoded.userId;
    const { searchParams } = new URL(request.url);
    const service = searchParams.get('service');

    if (!service) {
      return new Response(
        JSON.stringify({ error: 'Service parameter is required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const historyItems = await getHistoryItems(userId, service as any);
    
    return new Response(
      JSON.stringify(historyItems),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error fetching history items:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch history items' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
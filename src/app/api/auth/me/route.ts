import { NextResponse } from 'next/server';
import { verifyToken } from '~/lib/jwt';
import connectToDatabase from '~/lib/mongodb';
import { User } from '~/models/User';

export async function GET(request: Request) {
  try {
    // Get token from cookies
    const cookies = request.headers.get('cookie') ?? '';
    const token = cookies
      .split('; ')
      .find(row => row.startsWith('token='))?.split('=')[1];

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = await verifyToken(token);
    if (!decoded?.userId) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Get user data (excluding password)
    const user = await User.findById(decoded.userId).select('-password').lean().exec();
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Ensure we have a proper user object
    const userResponse = {
      id: String(user._id),
      name: user.name,
      email: user.email,
      // Add any other user properties you need
    };

    return NextResponse.json({ user: userResponse }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


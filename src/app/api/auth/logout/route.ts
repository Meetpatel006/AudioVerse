import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Create response with success message
    const response = NextResponse.json(
      { message: 'Logout successful' },
      { status: 200 }
    );

    // Clear the token cookie
    response.cookies.set({
      name: 'token',
      value: '',
      httpOnly: true,
      expires: new Date(0), // Set to past date to delete the cookie
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { 
        error: 'An error occurred during logout',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

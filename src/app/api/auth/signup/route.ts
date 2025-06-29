import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import { User, type IUser } from '../../../../models/User';

export async function POST(request: Request) {
  try {
    const { name, email, password, confirmPassword } = await request.json() as IUser & { confirmPassword: string };

    // Validate input
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'Please fill in all fields' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    if (typeof password === 'string' && password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email }).exec();
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 400 }
      );
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
    });

    // Convert to plain object and remove password
    const userObject = user.toObject();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = userObject;
    
    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: userWithoutPassword 
      },
      { status: 201 }
    );

  } catch (error: unknown) {
    console.error('Signup error:', error);
    const errorMessage = (error instanceof Error) ? error.message : String(error);
    return NextResponse.json(
      { 
        error: 'An error occurred during signup',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

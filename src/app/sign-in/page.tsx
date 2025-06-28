'use client';

import { SignInPage, type Testimonial } from '../../components/ui/sign-in';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

const sampleTestimonials: Testimonial[] = [
  {
    avatarSrc: 'https://randomuser.me/api/portraits/women/57.jpg',
    name: 'Sarah Chen',
    handle: '@sarahdigital',
    text: 'Amazing platform! The user experience is seamless and the features are exactly what I needed.'
  },
  {
    avatarSrc: 'https://randomuser.me/api/portraits/men/64.jpg',
    name: 'Marcus Johnson',
    handle: '@marcustech',
    text: 'This service has transformed how I work. Clean design, powerful features, and excellent support.'
  },
  {
    avatarSrc: 'https://randomuser.me/api/portraits/men/32.jpg',
    name: 'David Martinez',
    handle: '@davidcreates',
    text: 'I\'ve tried many platforms, but this one stands out. Intuitive, reliable, and genuinely helpful for productivity.'
  },
];

export default function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    // Check for redirect URL in query params
    const redirectUrl = searchParams.get('from') || '/dashboard';
    
    // If user is already logged in, redirect them
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          router.push(redirectUrl);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    };

    checkAuth();
  }, [router, searchParams]);

  const handleSignIn = async (email: string, password: string) => {
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    try {
      setIsLoading(true);
      await login(email, password);
      toast.success('Signed in successfully!');
      
      // Redirect to the original URL or dashboard
      const redirectUrl = searchParams.get('from') || '/dashboard';
      router.push(redirectUrl);
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(error.message || 'Failed to sign in');
      throw error; // Re-throw to allow the form to handle the error
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    toast('Google sign in coming soon!');
  };
  
  const handleResetPassword = () => {
    toast('Password reset functionality coming soon!');
  };

  const handleCreateAccount = () => {
    console.log('Create Account clicked');
    router.push('/sign-up'); // Assuming you have a sign-up page
  };

  return (
    <SignInPage
      title={
        <span className="font-light text-foreground tracking-tighter">
          Welcome back to <span className="font-semibold">ElevenLabs</span>
        </span>
      }
      description="Sign in to your account to continue"
      testimonials={sampleTestimonials}
      onSignIn={handleSignIn}
      onGoogleSignIn={handleGoogleSignIn}
      onResetPassword={handleResetPassword}
      onCreateAccount={handleCreateAccount}
      isLoading={isLoading}
      email={email}
      password={password}
      setEmail={setEmail}
      setPassword={setPassword}
      rememberMe={rememberMe}
      setRememberMe={setRememberMe}
    />
  );
}
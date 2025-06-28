'use client';

import { SignUpPage, type Testimonial } from '../../components/ui/sign-up';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';
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

export default function SignUp() {
  const router = useRouter();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      await register(name, email, password);
      toast.success('Account created successfully!');
      router.push('/speech-synthesis/text-to-speech');
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error(error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    // Handle Google sign up logic here
    toast('Google sign up coming soon!');
  };

  const handleSignIn = () => {
    router.push('/sign-in');
  };

  return (
    <SignUpPage
      title={
        <span className="font-light text-foreground tracking-tighter">
          Create your account
        </span>
      }
      description="Fill in your details to get started"
      testimonials={sampleTestimonials}
      onSignUp={handleSignUp}
      onGoogleSignUp={handleGoogleSignUp}
      onSignIn={handleSignIn}
    />
  );
}



'use client'

import { SignUpPage, type Testimonial } from "../../components/ui/sign-up";
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const sampleTestimonials: Testimonial[] = [
  {
    avatarSrc: "https://randomuser.me/api/portraits/women/57.jpg",
    name: "Sarah Chen",
    handle: "@sarahdigital",
    text: "Amazing platform! The user experience is seamless and the features are exactly what I needed."
  },
  {
    avatarSrc: "https://randomuser.me/api/portraits/men/64.jpg",
    name: "Marcus Johnson",
    handle: "@marcustech",
    text: "This service has transformed how I work. Clean design, powerful features, and excellent support."
  },
  {
    avatarSrc: "https://randomuser.me/api/portraits/men/32.jpg",
    name: "David Martinez",
    handle: "@davidcreates",
    text: "I've tried many platforms, but this one stands out. Intuitive, reliable, and genuinely helpful for productivity."
  },
];

const SignUp = () => {
  const router = useRouter();
  const { register } = useAuth();

  const handleSignUp = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (event) {
      try {
        const formData = new FormData(event.currentTarget);
        const data = Object.fromEntries(formData.entries());
        
        if (!data.name || !data.email || !data.password) {
          toast.error('Please fill in all fields');
          return;
        }
        
        await register(
          data.name as string,
          data.email as string,
          data.password as string
        );
        
        toast.success('Account created successfully!');
        router.push('/creative-platform/home');
      } catch (error) {
        console.error('Sign up error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to create account';
        toast.error(errorMessage);
      }
    }
  };

  const handleGoogleSignUp = () => {
    toast('Google sign up coming soon!');
  };

  const handleSignIn = () => {
    console.log("Navigating to sign in page");
    router.push('/sign-in');
  }

  return (
    <div className="bg-white text-foreground">
<SignUpPage
        heroImageSrc="https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=2160&q=80"
        testimonials={sampleTestimonials}
        onSignUp={handleSignUp}
        onGoogleSignUp={handleGoogleSignUp}
        onSignIn={handleSignIn}
      />
    </div>
  );
};

export default SignUp;
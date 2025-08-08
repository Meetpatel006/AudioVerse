// 'use client';

// import { SignUpPage, type Testimonial } from '../../components/ui/sign-up';
// import { useRouter } from 'next/navigation';
// import { useAuth } from '../../contexts/AuthContext';
// import { useState } from 'react';
// import { toast } from 'react-hot-toast';

// const sampleTestimonials: Testimonial[] = [
//   {
//     avatarSrc: 'https://randomuser.me/api/portraits/women/57.jpg',
//     name: 'Sarah Chen',
//     handle: '@sarahdigital',
//     text: 'Amazing platform! The user experience is seamless and the features are exactly what I needed.'
//   },
//   {
//     avatarSrc: 'https://randomuser.me/api/portraits/men/64.jpg',
//     name: 'Marcus Johnson',
//     handle: '@marcustech',
//     text: 'This service has transformed how I work. Clean design, powerful features, and excellent support.'
//   },
//   {
//     avatarSrc: 'https://randomuser.me/api/portraits/men/32.jpg',
//     name: 'David Martinez',
//     handle: '@davidcreates',
//     text: 'I\'ve tried many platforms, but this one stands out. Intuitive, reliable, and genuinely helpful for productivity.'
//   },
// ];

// export default function SignUp() {
//   const router = useRouter();
//   const { register } = useAuth();
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   const [isLoading, setIsLoading] = useState(false);

//   const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
//     event.preventDefault();
//     const formData = new FormData(event.currentTarget);
//     const name = formData.get('name') as string;
//     const email = formData.get('email') as string;
//     const password = formData.get('password') as string;
//     const confirmPassword = formData.get('confirmPassword') as string;

//     if (password !== confirmPassword) {
//       toast.error('Passwords do not match');
//       return;
//     }

//     try {
//       setIsLoading(true);
//       await register(name, email, password);
//       toast.success('Account created successfully!');
//       router.push('/speech-synthesis/text-to-speech');
//     } catch (error) {
//       console.error('Sign up error:', error);
//       const errorMessage = error instanceof Error ? error.message : 'Failed to create account';
//       toast.error(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleGoogleSignUp = () => {
//     // Handle Google sign up logic here
//     toast('Google sign up coming soon!');
//   };

//   const handleSignIn = () => {
//     router.push('/sign-in');
//   };

//   return (
//     <SignUpPage
//       title={
//         <span className="font-light text-foreground tracking-tighter">
//           Create your account
//         </span>
//       }
//       description="Fill in your details to get started"
//       testimonials={sampleTestimonials}
//       onSignUp={handleSignUp}
//       onGoogleSignUp={handleGoogleSignUp}
//       onSignIn={handleSignIn}
//     />
//   );
// }

'use client'

import { SignInPage, Testimonial } from "../../components/ui/sign-up";

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
  const handleSignIn = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    console.log("Sign In submitted:", data);
    alert(`Sign In Submitted! Check the browser console for form data.`);
  };

  const handleGoogleSignIn = () => {
    console.log("Continue with Google clicked");
    alert("Continue with Google clicked");
  };
  
  const handleResetPassword = () => {
    alert("Reset Password clicked");
  }

  const handleCreateAccount = () => {
    alert("Create Account clicked");
  }

  return (
    <div className="bg-background text-foreground">
      <SignInPage
        heroImageSrc="https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=2160&q=80"
        testimonials={sampleTestimonials}
        onSignIn={handleSignIn}
        onGoogleSignIn={handleGoogleSignIn}
        onResetPassword={handleResetPassword}
        onCreateAccount={handleCreateAccount}
      />
    </div>
  );
};

export default SignUp;
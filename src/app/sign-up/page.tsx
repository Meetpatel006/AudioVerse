

'use client'

import { SignUpPage, type Testimonial } from "../../components/ui/sign-up";
import { useRouter } from 'next/navigation';

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
  const handleSignUp = (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (event) {
      const formData = new FormData(event.currentTarget);
      const data = Object.fromEntries(formData.entries());
      console.log("Sign Up submitted:", data);
      alert(`Account created! Check the browser console for form data.`);
    }
  };

  const handleGoogleSignUp = () => {
    console.log("Sign up with Google clicked");
    alert("Redirecting to Google sign up...");
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
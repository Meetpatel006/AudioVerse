// import React, { useState } from 'react';
// import { Eye, EyeOff } from 'lucide-react';
// import Image from 'next/image';

// // --- HELPER COMPONENTS (ICONS) ---

// const GoogleIcon = () => (
//     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
//         <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s12-5.373 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z" />
//         <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
//         <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
//         <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z" />
//     </svg>
// );

// // --- TYPE DEFINITIONS ---

// export interface Testimonial {
//   avatarSrc: string;
//   name: string;
//   handle: string;
//   text: string;
// }

// export interface SignUpPageProps {
//   title?: React.ReactNode;
//   description?: React.ReactNode;
//   heroImageSrc?: string;
//   testimonials?: Testimonial[];
//   onSignUp?: (event: React.FormEvent<HTMLFormElement>) => void;
//   onGoogleSignUp?: () => void;
//   onSignIn?: () => void;
// }

// // --- SUB-COMPONENTS ---

// const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
//   <div className="relative w-full">
//     <div className="pointer-events-none absolute inset-0 rounded-xl bg-white/5 backdrop-blur-sm" />
//     {children}
//   </div>
// );

// const TestimonialCard = ({ testimonial, delay }: { testimonial: Testimonial, delay: string }) => (
//   <div 
//     className="flex flex-col space-y-4 rounded-2xl bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-white/10"
//     style={{ animationDelay: delay }}
//   >
//     <div className="flex items-center space-x-3">
//       <Image 
//         src={testimonial.avatarSrc} 
//         alt={testimonial.name}
//         className="h-10 w-10 rounded-full object-cover"
//         width={40}
//         height={40}
//       />
//       <div>
//         <p className="font-medium text-white">{testimonial.name}</p>
//         <p className="text-sm text-white/60">{testimonial.handle}</p>
//       </div>
//     </div>
//     <p className="text-white/80">{testimonial.text}</p>
//   </div>
// );

// // --- MAIN COMPONENT ---

// export function SignUpPage({
//   title = <span className="font-light text-foreground tracking-tighter">Create Account</span>,
//   description = "Join our community and start your journey with us",
//   testimonials = [],
//   onSignUp = () => { /* noop */ },
//   onGoogleSignUp = () => { /* noop */ },
//   onSignIn = () => { /* noop */ },
// }: SignUpPageProps) {
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//   });

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     onSignUp(e);
//   };

//   return (
//     <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 to-black text-white">
//       {/* Background elements */}
//       <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent"></div>
//       <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent"></div>
      
//       <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-4 py-12 sm:px-6 lg:flex-row lg:px-8 lg:py-24">
//         {/* Left side - Form */}
//         <div className="w-full space-y-8 lg:w-1/2 lg:pr-12">
//           <div className="space-y-4">
//             <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
//               {title}
//             </h1>
//             <p className="text-lg text-gray-300">
//               {description}
//             </p>
//           </div>

//           <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//             <div className="space-y-4">
//               {/* Name Field */}
//               <div className="space-y-2">
//                 <label htmlFor="name" className="text-sm font-medium text-gray-300">
//                   Full Name
//                 </label>
//                 <GlassInputWrapper>
//                   <input
//                     id="name"
//                     name="name"
//                     type="text"
//                     required
//                     value={formData.name}
//                     onChange={handleChange}
//                     className="block w-full rounded-xl border-0 bg-transparent px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
//                     placeholder="John Doe"
//                   />
//                 </GlassInputWrapper>
//               </div>

//               {/* Email Field */}
//               <div className="space-y-2">
//                 <label htmlFor="email" className="text-sm font-medium text-gray-300">
//                   Email address
//                 </label>
//                 <GlassInputWrapper>
//                   <input
//                     id="email"
//                     name="email"
//                     type="email"
//                     autoComplete="email"
//                     required
//                     value={formData.email}
//                     onChange={handleChange}
//                     className="block w-full rounded-xl border-0 bg-transparent px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
//                     placeholder="you@example.com"
//                   />
//                 </GlassInputWrapper>
//               </div>

//               {/* Password Field */}
//               <div className="space-y-2">
//                 <label htmlFor="password" className="text-sm font-medium text-gray-300">
//                   Password
//                 </label>
//                 <GlassInputWrapper>
//                   <div className="relative">
//                     <input
//                       id="password"
//                       name="password"
//                       type={showPassword ? 'text' : 'password'}
//                       autoComplete="new-password"
//                       required
//                       value={formData.password}
//                       onChange={handleChange}
//                       className="block w-full rounded-xl border-0 bg-transparent px-4 py-3 pr-10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
//                       placeholder="••••••••"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowPassword(!showPassword)}
//                       className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
//                     >
//                       {showPassword ? (
//                         <EyeOff className="h-5 w-5" />
//                       ) : (
//                         <Eye className="h-5 w-5" />
//                       )}
//                     </button>
//                   </div>
//                 </GlassInputWrapper>
//               </div>

//               {/* Confirm Password Field */}
//               <div className="space-y-2">
//                 <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-300">
//                   Confirm Password
//                 </label>
//                 <GlassInputWrapper>
//                   <div className="relative">
//                     <input
//                       id="confirmPassword"
//                       name="confirmPassword"
//                       type={showConfirmPassword ? 'text' : 'password'}
//                       autoComplete="new-password"
//                       required
//                       value={formData.confirmPassword}
//                       onChange={handleChange}
//                       className="block w-full rounded-xl border-0 bg-transparent px-4 py-3 pr-10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
//                       placeholder="••••••••"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                       className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
//                     >
//                       {showConfirmPassword ? (
//                         <EyeOff className="h-5 w-5" />
//                       ) : (
//                         <Eye className="h-5 w-5" />
//                       )}
//                     </button>
//                   </div>
//                 </GlassInputWrapper>
//               </div>
//             </div>

//             <div>
//               <button
//                 type="submit"
//                 className="group relative flex w-full justify-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
//               >
//                 <span className="relative flex items-center">
//                   Create Account
//                 </span>
//               </button>
//             </div>
//           </form>

//           <div className="relative">
//             <div className="absolute inset-0 flex items-center">
//               <div className="w-full border-t border-gray-700"></div>
//             </div>
//             <div className="relative flex justify-center text-sm">
//               <span className="bg-transparent px-2 text-gray-400">Or continue with</span>
//             </div>
//           </div>

//           <div>
//             <button
//               onClick={onGoogleSignUp}
//               className="group relative flex w-full justify-center rounded-xl border border-gray-700 bg-white/5 px-4 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-white/10"
//             >
//               <span className="flex items-center space-x-2">
//                 <GoogleIcon />
//                 <span>Sign up with Google</span>
//               </span>
//             </button>
//           </div>

//           <p className="text-center text-sm text-gray-400">
//             Already have an account?{' '}
//             <button
//               onClick={onSignIn}
//               className="font-medium text-blue-400 hover:text-blue-300"
//             >
//               Sign in
//             </button>
//           </p>
//         </div>

//         {/* Right side - Testimonials */}
//         {testimonials.length > 0 && (
//           <div className="mt-16 hidden w-full space-y-8 lg:mt-0 lg:block lg:w-1/2">
//             <div className="relative">
//               <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-purple-500/20 blur-3xl"></div>
//               <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-blue-500/20 blur-3xl"></div>
              
//               <div className="relative space-y-6">
//                 {testimonials.map((testimonial, index) => (
//                   <TestimonialCard 
//                     key={index}
//                     testimonial={testimonial}
//                     delay={`${index * 100}ms`}
//                   />
//                 ))}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// --- HELPER COMPONENTS (ICONS) ---

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s12-5.373 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z" />
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z" />
    </svg>
);


// --- TYPE DEFINITIONS ---

export interface Testimonial {
  avatarSrc: string;
  name: string;
  handle: string;
  text: string;
}

interface SignInPageProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  testimonials?: Testimonial[];
  onSignIn?: (event: React.FormEvent<HTMLFormElement>) => void;
  onGoogleSignIn?: () => void;
  onResetPassword?: () => void;
  onCreateAccount?: () => void;
}

// --- SUB-COMPONENTS ---

const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm transition-colors focus-within:border-violet-400/70 focus-within:bg-violet-500/10">
    {children}
  </div>
);

const TestimonialCard = ({ testimonial, delay }: { testimonial: Testimonial, delay: string }) => (
  <div className={`animate-testimonial ${delay} flex items-start gap-3 rounded-3xl bg-card/40 dark:bg-zinc-800/40 backdrop-blur-xl border border-white/10 p-5 w-64`}>
    <img src={testimonial.avatarSrc} className="h-10 w-10 object-cover rounded-2xl" alt="avatar" />
    <div className="text-sm leading-snug">
      <p className="flex items-center gap-1 font-medium">{testimonial.name}</p>
      <p className="text-muted-foreground">{testimonial.handle}</p>
      <p className="mt-1 text-foreground/80">{testimonial.text}</p>
    </div>
  </div>
);

// --- MAIN COMPONENT ---

export const SignInPage: React.FC<SignInPageProps> = ({
  title = <span className="font-light text-foreground tracking-tighter">Welcome</span>,
  description = "Access your account and continue your journey with us",
  heroImageSrc,
  testimonials = [],
  onSignIn,
  onGoogleSignIn,
  onResetPassword,
  onCreateAccount,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row font-geist w-[100dvw]">
      {/* Left column: sign-in form */}
      <section className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            <h1 className="animate-element animate-delay-100 text-4xl md:text-5xl font-semibold leading-tight">{title}</h1>
            <p className="animate-element animate-delay-200 text-muted-foreground">{description}</p>

            <form className="space-y-5" onSubmit={onSignIn}>
              <div className="animate-element animate-delay-300">
                <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                <GlassInputWrapper>
                  <input name="email" type="email" placeholder="Enter your email address" className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none" />
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-400">
                <label className="text-sm font-medium text-muted-foreground">Password</label>
                <GlassInputWrapper>
                  <div className="relative">
                    <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 flex items-center">
                      {showPassword ? <EyeOff className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" /> : <Eye className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />}
                    </button>
                  </div>
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-500 flex items-center justify-between text-sm">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="rememberMe" className="custom-checkbox" />
                  <span className="text-foreground/90">Keep me signed in</span>
                </label>
                <a href="#" onClick={(e) => { e.preventDefault(); onResetPassword?.(); }} className="hover:underline text-violet-400 transition-colors">Reset password</a>
              </div>

              <button type="submit" className="animate-element animate-delay-600 w-full rounded-2xl bg-primary py-4 font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                Sign In
              </button>
            </form>

            <div className="animate-element animate-delay-700 relative flex items-center justify-center">
              <span className="w-full border-t border-border"></span>
              <span className="px-4 text-sm text-muted-foreground bg-background absolute">Or continue with</span>
            </div>

            <button onClick={onGoogleSignIn} className="animate-element animate-delay-800 w-full flex items-center justify-center gap-3 border border-border rounded-2xl py-4 hover:bg-secondary transition-colors">
                <GoogleIcon />
                Continue with Google
            </button>

            <p className="animate-element animate-delay-900 text-center text-sm text-muted-foreground">
              New to our platform? <a href="#" onClick={(e) => { e.preventDefault(); onCreateAccount?.(); }} className="text-violet-400 hover:underline transition-colors">Create Account</a>
            </p>
          </div>
        </div>
      </section>

      {/* Right column: hero image + testimonials */}
      {heroImageSrc && (
        <section className="hidden md:block flex-1 relative p-4">
          <div className="animate-slide-right animate-delay-300 absolute inset-4 rounded-3xl bg-cover bg-center" style={{ backgroundImage: `url(${heroImageSrc})` }}></div>
          {testimonials.length > 0 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 px-8 w-full justify-center">
              <TestimonialCard testimonial={testimonials[0]} delay="animate-delay-1000" />
              {testimonials[1] && <div className="hidden xl:flex"><TestimonialCard testimonial={testimonials[1]} delay="animate-delay-1200" /></div>}
              {testimonials[2] && <div className="hidden 2xl:flex"><TestimonialCard testimonial={testimonials[2]} delay="animate-delay-1400" /></div>}
            </div>
          )}
        </section>
      )}
    </div>
  );
};  
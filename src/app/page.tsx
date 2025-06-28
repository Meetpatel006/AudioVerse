'use client';

import dynamic from 'next/dynamic';

// Dynamically import the landing page with SSR disabled
const LandingPage = dynamic(() => import('./landing-page'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
    </div>
  ),
});

export default function Home() {
  return <LandingPage />;
}

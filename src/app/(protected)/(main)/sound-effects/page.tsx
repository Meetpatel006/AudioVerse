'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SoundEffectsPage() {
  const router = useRouter();

  // This page is protected by the middleware
  // You can add your sound effects content here
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Sound Effects</h1>
      <p>This is a protected sound effects page. Only authenticated users can see this.</p>
    </div>
  );
}

'use client';

import { useRouter } from 'next/navigation';

export default function SpeechSynthesisPage() {
  const router = useRouter();

  // This page is protected by the middleware
  // You can add your speech synthesis content here
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Speech Synthesis</h1>
      <p>This is a protected speech synthesis page. Only authenticated users can see this.</p>
    </div>
  );
}

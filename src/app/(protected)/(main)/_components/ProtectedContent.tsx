'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // This component will only render if the user is authenticated
    // due to the middleware protection
  }, [router]);


  return <>{children}</>;
}

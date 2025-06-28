'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '../ui/button';
import { useAuth } from '~/contexts/AuthContext';

export function ProtectedNav() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const isActive = (path: string) => {
    return pathname.startsWith(path) ? 'bg-accent' : '';
  };

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      <Link
        href="/speech-synthesis"
        className={`text-sm font-medium transition-colors hover:text-primary px-3 py-2 rounded-md ${isActive('/speech-synthesis')}`}
      >
        Speech Synthesis
      </Link>
      <Link
        href="/sound-effects"
        className={`text-sm font-medium transition-colors hover:text-primary px-3 py-2 rounded-md ${isActive('/sound-effects')}`}
      >
        Sound Effects
      </Link>
      <Button 
        variant="ghost" 
        onClick={() => logout()}
        className="text-sm font-medium text-destructive hover:text-destructive"
      >
        Sign Out
      </Button>
    </nav>
  );
}

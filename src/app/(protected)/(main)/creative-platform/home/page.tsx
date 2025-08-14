'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { SoundEffectIcon } from '~/components/ui/sound-effect-icon';
import { MusicIcon } from '~/components/ui/music-icon';
import { InstantSpeechIcon } from '~/components/ui/instant-speech-icon';
import { MessageSquare, Mic, Music, Clapperboard, Bot, Film } from 'lucide-react';
import { PageLayout } from "~/components/client/page-layout";
import { useAuth } from '~/contexts/AuthContext';
import { useRouter } from 'next/navigation';

const HomePage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return 'Good morning';
      if (hour < 18) return 'Good afternoon';
      return 'Good evening';
    };
    setGreeting(getGreeting());
  }, []);

  // Redirect to sign-in if user is not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/sign-in');
    }
  }, [user, loading, router]);

  // Show loading state while checking auth
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <PageLayout title="Home" service="styletts2" showSidebar={false}>
      <div className="min-h-screen bg-gray-50/50 p-8">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">My Workspace</p>
            <h1 className="text-3xl font-bold text-gray-800">
              {greeting}, {user?.name || 'Guest'}
            </h1>
          </div>
        </header>

        <main className="mt-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-6">
            <FeatureCard icon={<InstantSpeechIcon />} title="Instant speech" />
            {/* <FeatureCard icon={<Bot />} title="Audiobook" /> */}
            {/* <FeatureCard icon={<Mic />} title="Conversational AI" /> */}
            <FeatureCard icon={<MusicIcon />} title="Music" />
            <FeatureCard icon={<SoundEffectIcon />} title="Sound effect" />
            {/* <FeatureCard icon={<Clapperboard />} title="Dubbed video" /> */}
          </div>

          <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold text-gray-800">Latest from the library</h2>
              <div className="mt-4 space-y-4">
                <LibraryItem
                  name="Niraj - Hindi Narrator"
                  description="Niraj is the pen name of a veteran Indian actor. The base and..."
                  avatar="/avatars/01.png"
                />
                <LibraryItem
                  name="Riya Rao - Hindi Conversational Voice"
                  description="Riya is the pen name of one of the most professional voice-over..."
                  avatar="/avatars/02.png"
                />
                <LibraryItem
                  name="Amitabh"
                  description="Casual, warm and relaxed speaking in a clear and natural manner...."
                  avatar="/avatars/03.png"
                />
                <LibraryItem
                  name="Bunty - Reel Perfect Voice"
                  description="A vibrant AI voice crafted for content creators, influencers, and..."
                  avatar="/avatars/04.png"
                />
                <LibraryItem
                  name="Saavi - Recovery & Payment Reminder Voice Agent..."
                  description="A clear, firm, and polite female voice designed for recovery,..."
                  avatar="/avatars/05.png"
                />
              </div>
              <Button variant="outline" className="mt-6">Explore Library</Button>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-800">Create or clone a voice</h2>
              <div className="mt-4 space-y-4">
                <ActionCard
                  title="Voice Design"
                  description="Design an entirely new voice from a text prompt"
                />
                <ActionCard
                  title="Clone your Voice"
                  description="Create a realistic digital clone of your voice"
                />
                <ActionCard
                  title="Voice Collections"
                  description="Curated AI voices for every use case"
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </PageLayout>
  );
};

export default HomePage;

const FeatureCard = ({ icon, title }: { icon: React.ReactNode, title: string }) => (
  <Card className="flex flex-col items-center justify-center p-6 text-center">
    <div className="mb-4 text-gray-600">{icon}</div>
    <p className="font-semibold text-gray-800">{title}</p>
  </Card>
);

const LibraryItem = ({ name, description, avatar }: { name: string, description: string, avatar: string }) => (
  <div className="flex items-start space-x-4">
    <Avatar>
      <AvatarImage src={avatar} />
      <AvatarFallback>{name.charAt(0)}</AvatarFallback>
    </Avatar>
    <div>
      <p className="font-semibold text-gray-800">{name}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  </div>
);

const ActionCard = ({ title, description }: { title: string, description: string }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-gray-500">{description}</p>
    </CardContent>
  </Card>
);

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { SoundEffectIcon } from '~/components/ui/sound-effect-icon';
import { MusicIcon } from '~/components/ui/music-icon';
import { InstantSpeechIcon } from '~/components/ui/instant-speech-icon';
import { PageLayout } from "~/components/client/music-platform/melody-maker/page-layout";
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
    <PageLayout title="Home" service="melody-maker" showSidebar={false}>
      <div className="bg-white p-8 pb-12">
        <header className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-500">My Workspace</p>
              <span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-800">
                AI Music Platform
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mt-1">
              {greeting}, {user?.name || 'Guest'}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              className="border-gray-200 text-gray-700 hover:bg-gray-50"
              onClick={() => window.location.href = "/music-platform/compose"}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              New Composition
            </Button>
            <Button 
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => window.location.href = "/music-platform/library"}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
              My Library
            </Button>
          </div>
        </header>

        <main>
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-gray-800 mb-5">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-3">
              <FeatureCard 
                icon={<MusicIcon />} 
                title="Generate Music" 
                description="Create original AI-generated music based on your description" 
                action="Compose Music"
                link="/music-platform/generate"
              />
              <FeatureCard 
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                } 
                title="Melody Maker" 
                description="Create custom melodies with our intuitive melody creation tools" 
                action="Create Melody"
                link="/music-platform/melody-maker"
              />
              <FeatureCard 
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.828-2.828" />
                  </svg>
                } 
                title="Remix & Edit" 
                description="Edit and remix existing tracks or enhance your recordings" 
                action="Remix Audio"
                link="/music-platform/remix"
              />
            </div>
          </section>
          
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12 mb-16">
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-semibold text-gray-800">Recent Compositions</h2>
                <Button 
                  variant="ghost" 
                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 -mr-2"
                  onClick={() => window.location.href = "/music-platform/library"}
                >
                  View all
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Button>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <MusicItem
                  title="Lo-Fi Study Beat"
                  genre="Lo-Fi / Ambient"
                  duration="2:45"
                  date="Aug 23, 2025"
                  coverImage="/placeholder.png"
                  previewLink="/music-platform/preview/lofi-study-beat"
                  editLink="/music-platform/edit/lofi-study-beat"
                />
                <MusicItem
                  title="Epic Cinematic Theme"
                  genre="Orchestral / Cinematic"
                  duration="3:12"
                  date="Aug 21, 2025"
                  coverImage="/placeholder.png"
                  previewLink="/music-platform/preview/epic-cinematic"
                  editLink="/music-platform/edit/epic-cinematic"
                />
                <MusicItem
                  title="EDM Party Mix"
                  genre="Electronic / Dance"
                  duration="4:30"
                  date="Aug 19, 2025"
                  coverImage="/placeholder.png"
                  previewLink="/music-platform/preview/edm-party-mix"
                  editLink="/music-platform/edit/edm-party-mix"
                />
                <MusicItem
                  title="Acoustic Guitar Melody"
                  genre="Acoustic / Folk"
                  duration="2:18"
                  date="Aug 16, 2025"
                  coverImage="/placeholder.png"
                  previewLink="/music-platform/preview/acoustic-guitar"
                  editLink="/music-platform/edit/acoustic-guitar"
                />
              </div>
              
              <div className="mt-8 mb-12">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-semibold text-gray-800">Usage Statistics</h2>
                  <Button 
                    variant="ghost" 
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 -mr-2"
                    onClick={() => window.location.href = "/music-platform/analytics"}
                  >
                    Full Analytics
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <Card className="overflow-hidden shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Credits Available</p>
                          <p className="text-2xl font-bold text-gray-800">8,750</p>
                        </div>
                        <Button 
                          variant="outline" 
                          className="border-dashed"
                          onClick={() => window.location.href = "/music-platform/credits"}
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                          Buy Credits
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium text-gray-700">Music Generation</span>
                            <span className="text-gray-500">5,250 / 8,000</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '65.6%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium text-gray-700">Stem Separation</span>
                            <span className="text-gray-500">1,800 / 3,000</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '60%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium text-gray-700">Audio Editing</span>
                            <span className="text-gray-500">950 / 2,000</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '47.5%' }}></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="mb-16">
                <h2 className="text-xl font-semibold text-gray-800 mb-5">Music Generation</h2>
                <div className="space-y-4">
                  <ActionCard
                    title="Text-to-Music"
                    description="Generate complete songs from text descriptions"
                    badge="GENERATE"
                    link="/music-platform/generate"
                    icon={
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                    }
                  />
                  <ActionCard
                    title="Stem Separation"
                    description="Split songs into separate instrument tracks"
                    badge="STEMS"
                    link="/music-platform/stems"
                    icon={
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    }
                  />
                  <ActionCard
                    title="Music Library"
                    description="Browse thousands of royalty-free tracks"
                    badge="LIBRARY"
                    link="/music-platform/library"
                    icon={
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    }
                  />
                </div>
              </div>
              
              {/* Additional space at bottom */}
              <div className="py-12"></div>
            </div>
          </div>
        </main>
      </div>
    </PageLayout>
  );
};

export default HomePage;

const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  action,
  link
}: { 
  icon: React.ReactNode, 
  title: string,
  description: string,
  action: string,
  link: string
}) => (
  <Card className="hover:shadow-md transition-shadow overflow-hidden group border border-gray-100">
    <CardContent className="p-6 pt-8">
      <div className="flex flex-col h-full">
        <div className="mb-4 text-purple-600 bg-purple-50 p-3 rounded-lg w-fit">{icon}</div>
        <h3 className="font-semibold text-gray-800 text-lg mb-2">{title}</h3>
        <p className="text-gray-500 text-sm flex-grow mb-4">{description}</p>
        <Button 
          variant="outline" 
          className="w-full justify-center group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors"
          onClick={() => window.location.href = link}
        >
          {action}
          <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Button>
      </div>
    </CardContent>
  </Card>
);

const MusicItem = ({ 
  title, 
  genre, 
  duration,
  date,
  coverImage,
  previewLink,
  editLink
}: { 
  title: string, 
  genre: string, 
  duration: string,
  date: string,
  coverImage: string,
  previewLink: string,
  editLink: string
}) => (
  <Card className="overflow-hidden hover:shadow-md transition-shadow border border-gray-100">
    <CardContent className="p-4">
      <div className="flex items-start space-x-4">
        <div className="h-16 w-16 relative rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
          <img src={coverImage} alt={title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 bg-black/50 text-white hover:bg-black/70"
              onClick={() => window.location.href = previewLink}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Button>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-gray-800">{title}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{genre} • {duration}</p>
            </div>
            <span className="text-xs text-gray-400">{date}</span>
          </div>
          <div className="flex items-center mt-3 space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-3 text-xs text-purple-600 hover:bg-purple-50 hover:text-purple-700"
              onClick={() => window.location.href = previewLink}
            >
              Play
            </Button>
            <Button 
              size="sm" 
              className="h-8 px-3 text-xs"
              onClick={() => window.location.href = editLink}
            >
              Edit
            </Button>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);



const ActionCard = ({ 
  title, 
  description, 
  badge, 
  icon,
  link
}: { 
  title: string, 
  description: string, 
  badge?: string, 
  icon?: React.ReactNode,
  link?: string
}) => (
  <Card className="overflow-hidden hover:shadow-md transition-shadow group border border-gray-100">
    <CardHeader className="p-6 pb-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          {icon && <div>{icon}</div>}
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        {badge && (
          <span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-800">
            {badge}
          </span>
        )}
      </div>
    </CardHeader>
    <CardContent className="p-6 pt-0">
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      <Button 
        variant="outline" 
        className="w-full justify-center group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors"
        onClick={() => link && (window.location.href = link)}
      >
        Get Started
        <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </Button>
    </CardContent>
  </Card>
);

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { SoundEffectIcon } from '~/components/ui/sound-effect-icon';
import { MusicIcon } from '~/components/ui/music-icon';
import { InstantSpeechIcon } from '~/components/ui/instant-speech-icon';
import { PageLayout } from "~/components/client/creative-platform/page-layout";
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
      <div className="min-h-screen bg-white p-8 pb-16">
        <header className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-500">My Workspace</p>
              <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800">
                Creative Platform
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mt-1">
              {greeting}, {user?.name || 'Guest'}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              New Project
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Recent Activity
            </Button>
          </div>
        </header>

        <main>
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-gray-800 mb-5">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-3">
              <FeatureCard 
                icon={<InstantSpeechIcon />} 
                title="Instant Speech" 
                description="Convert text to natural-sounding voice in seconds" 
                action="Create speech"
                link="/creative-platform/text-to-speech"
              />
              <FeatureCard 
                icon={<MusicIcon />} 
                title="Music Generation" 
                description="Generate custom music tracks with AI" 
                action="Create music"
                link="/music-platform/generate"
              />
              <FeatureCard 
                icon={<SoundEffectIcon />} 
                title="Sound Effects" 
                description="Create unique sound effects for your projects" 
                action="Create effect"
                link="/creative-platform/sound-effects"
              />
            </div>
          </section>
          
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-semibold text-gray-800">Latest from the library</h2>
                <Button 
                  variant="ghost" 
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 -mr-2"
                  onClick={() => window.location.href = "/creative-platform/voice-library"}
                >
                  View all
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Button>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <LibraryItem
                  name="Niraj - Hindi Narrator"
                  description="Niraj is the pen name of a veteran Indian actor. The base and expressive voice with perfect pronunciation."
                  avatar="/avatars/01.png"
                  isNew={true}
                  previewLink="/creative-platform/voice-library/niraj-preview"
                  useLink="/creative-platform/text-to-speech?voice=niraj"
                />
                <LibraryItem
                  name="Riya Rao - Hindi Conversational"
                  description="Riya is the pen name of one of the most professional voice-over artists in the industry with natural flow."
                  avatar="/avatars/02.png"
                  previewLink="/creative-platform/voice-library/riya-preview"
                  useLink="/creative-platform/text-to-speech?voice=riya"
                />
                <LibraryItem
                  name="Amitabh - Professional Narrator"
                  description="Casual, warm and relaxed speaking in a clear and natural manner. Perfect for documentaries and audiobooks."
                  avatar="/avatars/03.png"
                  previewLink="/creative-platform/voice-library/amitabh-preview"
                  useLink="/creative-platform/text-to-speech?voice=amitabh"
                />
                <LibraryItem
                  name="Bunty - Reel Perfect Voice"
                  description="A vibrant AI voice crafted for content creators, influencers, and social media platforms."
                  avatar="/avatars/04.png"
                  previewLink="/creative-platform/voice-library/bunty-preview"
                  useLink="/creative-platform/text-to-speech?voice=bunty"
                />
              </div>
              
              <div className="mt-8">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-semibold text-gray-800">Recent Projects</h2>
                  <Button 
                    variant="ghost" 
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 -mr-2"
                    onClick={() => window.location.href = "/creative-platform/projects"}
                  >
                    View all
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </Button>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <ProjectCard
                    title="Product Explainer Video"
                    type="Text-to-Speech"
                    date="Aug 22, 2025"
                    progress={100}
                    link="/creative-platform/projects/explainer-video"
                  />
                  <ProjectCard
                    title="Podcast Introduction"
                    type="Voice Clone"
                    date="Aug 20, 2025"
                    progress={85}
                    link="/creative-platform/projects/podcast-intro"
                  />
                  <ProjectCard
                    title="Game Sound Effects"
                    type="Sound Effects"
                    date="Aug 18, 2025"
                    progress={100}
                    link="/creative-platform/projects/game-sfx"
                  />
                  <ProjectCard
                    title="Background Music"
                    type="Music Generation"
                    date="Aug 15, 2025"
                    progress={100}
                    link="/music-platform/projects/background-music"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-5">Create or clone a voice</h2>
                <div className="space-y-4">
                  <ActionCard
                    title="Voice Design"
                    description="Design an entirely new voice from a text prompt"
                    badge="CREATIVE"
                    link="/creative-platform/voice-design"
                    icon={
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    }
                  />
                  <ActionCard
                    title="Clone your Voice"
                    description="Create a realistic digital clone of your voice"
                    badge="CLONE"
                    link="/creative-platform/voice-clone"
                    icon={
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    }
                  />
                  <ActionCard
                    title="Voice Collections"
                    description="Curated AI voices for every use case"
                    badge="COLLECTION"
                    link="/creative-platform/voice-library"
                    icon={
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    }
                  />
                </div>
              </div>
              
              <div className="mb-12">
                <h2 className="text-xl font-semibold text-gray-800 mb-5">Usage Statistics</h2>
                <Card className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Credits Available</p>
                        <p className="text-2xl font-bold text-gray-800">12,500</p>
                      </div>
                      <Button variant="outline" className="border-dashed">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        Buy Credits
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium text-gray-700">Text-to-Speech</span>
                          <span className="text-gray-500">8,540 / 10,000</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '85.4%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium text-gray-700">Voice Cloning</span>
                          <span className="text-gray-500">2,300 / 5,000</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '46%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium text-gray-700">Music Generation</span>
                          <span className="text-gray-500">1,250 / 3,000</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '41.7%' }}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Additional space at bottom */}
              <div className="py-6"></div>
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
        <div className="mb-4 text-blue-600 bg-blue-50 p-3 rounded-lg w-fit">{icon}</div>
        <h3 className="font-semibold text-gray-800 text-lg mb-2">{title}</h3>
        <p className="text-gray-500 text-sm flex-grow mb-4">{description}</p>
        <Button 
          variant="outline" 
          className="w-full justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors"
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

const LibraryItem = ({ 
  name, 
  description, 
  avatar, 
  isNew,
  previewLink,
  useLink
}: { 
  name: string, 
  description: string, 
  avatar: string,
  isNew?: boolean,
  previewLink?: string,
  useLink?: string
}) => (
  <Card className="overflow-hidden hover:shadow-md transition-shadow border border-gray-100">
    <CardContent className="p-4">
      <div className="flex items-start space-x-4">
        <Avatar className="h-12 w-12 rounded-lg border border-gray-200">
          <AvatarImage src={avatar} />
          <AvatarFallback className="bg-blue-100 text-blue-800 font-semibold">{name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-gray-800">{name}</p>
            {isNew && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">NEW</span>
            )}
          </div>
          <p className="text-sm text-gray-500 line-clamp-2 mt-1">{description}</p>
          <div className="flex items-center mt-3 space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-3 text-xs text-blue-600 hover:bg-blue-50 hover:text-blue-700"
              onClick={() => previewLink && (window.location.href = previewLink)}
            >
              Preview
            </Button>
            <Button 
              size="sm" 
              className="h-8 px-3 text-xs"
              onClick={() => useLink && (window.location.href = useLink)}
            >
              Use Voice
            </Button>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const ProjectCard = ({ 
  title, 
  type, 
  date, 
  progress,
  link
}: { 
  title: string, 
  type: string, 
  date: string, 
  progress: number,
  link?: string
}) => (
  <Card className="overflow-hidden hover:shadow-md transition-shadow border border-gray-100">
    <CardContent className="p-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          type === "Text-to-Speech" ? "bg-blue-100 text-blue-800" :
          type === "Voice Clone" ? "bg-purple-100 text-purple-800" :
          type === "Sound Effects" ? "bg-amber-100 text-amber-800" :
          "bg-green-100 text-green-800"
        }`}>
          {type}
        </span>
      </div>
      <p className="text-sm text-gray-500">Last edited: {date}</p>
      <div className="mt-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-500 text-xs">Completion</span>
          <span className="text-gray-700 text-xs font-medium">{progress}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full ${
              progress === 100 ? "bg-green-500" : "bg-blue-600"
            }`} 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-3 text-xs"
          onClick={() => link && (window.location.href = link)}
        >
          Open Project
        </Button>
        <div className="flex -space-x-2">
          <Avatar className="h-6 w-6 border-2 border-white">
            <AvatarImage src="/avatars/01.png" />
            <AvatarFallback className="bg-blue-500 text-white text-xs">JD</AvatarFallback>
          </Avatar>
          <Avatar className="h-6 w-6 border-2 border-white">
            <AvatarImage src="/avatars/02.png" />
            <AvatarFallback className="bg-green-500 text-white text-xs">MP</AvatarFallback>
          </Avatar>
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
          <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800">
            {badge}
          </span>
        )}
      </div>
    </CardHeader>
    <CardContent className="p-6 pt-0">
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      <Button 
        variant="outline" 
        className="w-full justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors"
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

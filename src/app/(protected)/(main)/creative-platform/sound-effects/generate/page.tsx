import { PageLayout } from "~/components/client/creative-platform/page-layout";
import { SoundEffectsGenerator } from "~/components/client/creative-platform/sound-effects/sound-effects-generator";
import { headers } from 'next/headers';

export default async function SoundEffectsGeneratePage() {
  // Get user ID from headers
  const headersList = await headers();
  const userId = headersList.get('x-user-id');
  
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  // Set a default number of credits or implement your own logic
  const credits = 1000;

  const soundEffectsTabs = [
    {
      name: "Generate",
      path: "/creative-platform/sound-effects/generate",
    },
    {
      name: "History",
      path: "/creative-platform/sound-effects/history",
    },
  ];

  return (
    <PageLayout
      title={"Sound Effects"}
      showSidebar={false}
      tabs={soundEffectsTabs}
      service="make-an-audio"
    >
      <SoundEffectsGenerator credits={credits} userId={userId} />
    </PageLayout>
  );
}

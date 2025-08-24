import { PageLayout } from "~/components/client/creative-platform/page-layout";
import { SoundEffectsGenerator } from "~/components/client/creative-platform/sound-effects/sound-effects-generator";
import { cookies } from "next/headers";
import { verifyToken } from "~/lib/jwt";

export default async function SoundEffectsGeneratePage() {
  const token = (await cookies()).get("token")?.value;
  const user = token ? await verifyToken(token) : null;
  const userId = user?.userId;
  
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
  
  if (!userId) {
    return (
      <PageLayout
        title={"Sound Effects"}
        showSidebar={false}
        tabs={soundEffectsTabs}
        service="make-an-audio"
      >
        <div className="flex h-full items-center justify-center">
          <p>Please sign in to view this page.</p>
        </div>
      </PageLayout>
    );
  }

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

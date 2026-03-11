import { PageLayout } from "~/components/client/creative-platform/page-layout";
import { SoundEffectsGenerator } from "~/components/client/creative-platform/sound-effects/sound-effects-generator";
import { fetchAuthQuery } from "~/lib/auth-server";

export default async function SoundEffectsGeneratePage() {
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

  const credits = 1000;

  const user = await fetchAuthQuery(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((await import("@convex/_generated/api")) as any).api.auth.getCurrentUser,
  );

  const userId = user?.id as string | undefined;

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

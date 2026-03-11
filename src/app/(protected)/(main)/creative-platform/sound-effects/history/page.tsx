import { PageLayout } from "~/components/client/creative-platform/page-layout";
import { HistoryList } from "~/components/client/creative-platform/sound-effects/history-list";
import { fetchAuthQuery } from "~/lib/auth-server";

export default async function SoundEffectsHistoryPage() {
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

  const service = "make-an-audio";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod = (await import("@convex/_generated/api")) as any;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const api = mod.api;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
  const user = await fetchAuthQuery(api.auth.getCurrentUser);
  const userId = user?.id as string | undefined;

  if (!userId) {
    return (
      <PageLayout
        title={"Sound Effects"}
        showSidebar={false}
        tabs={soundEffectsTabs}
        service={service}
      >
        <div className="flex h-full items-center justify-center">
          <p>Please sign in to view your history.</p>
        </div>
      </PageLayout>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
  const historyItems = await fetchAuthQuery(api.audioHistory.getMyHistory, {
    service,
  });

  return (
    <PageLayout
      title={"Sound Effects"}
      showSidebar={false}
      tabs={soundEffectsTabs}
      service={service}
    >
      <HistoryList historyItems={historyItems ?? []} />
    </PageLayout>
  );
}

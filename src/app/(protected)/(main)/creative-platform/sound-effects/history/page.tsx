import { PageLayout } from "~/components/client/creative-platform/page-layout";
import { HistoryList } from "~/components/client/creative-platform/sound-effects/history-list";
import { getHistoryItems } from "~/lib/history-server";
import { cookies } from "next/headers";
import { verifyToken } from "~/lib/jwt";

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
  
  // Get user ID from token
  const token = (await cookies()).get("token")?.value;
  const user = token ? await verifyToken(token) : null;
  const userId = user?.userId;
  
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

  const historyItems = await getHistoryItems(userId, service);

  return (
    <PageLayout
      title={"Sound Effects"}
      showSidebar={false}
      tabs={soundEffectsTabs}
      service={service}
    >
      <HistoryList historyItems={historyItems} />
    </PageLayout>
  );
}

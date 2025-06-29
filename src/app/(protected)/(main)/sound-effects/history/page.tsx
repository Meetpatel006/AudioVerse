import { PageLayout } from "~/components/client/page-layout";
import { HistoryList } from "~/components/client/sound-effects/history-list";
import { getHistoryItems } from "~/lib/history";
import { headers } from 'next/headers';

export default async function SoundEffectsHistoryPage() {
  const soundEffectsTabs = [
    {
      name: "Generate",
      path: "/sound-effects/generate",
    },
    {
      name: "History",
      path: "/sound-effects/history",
    },
  ];

  const service = "make-an-audio";
  
  // Get user ID from headers
  const headersList = await headers();
  const userId = headersList.get('x-user-id');
  
  if (!userId) {
    throw new Error('User not authenticated');
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

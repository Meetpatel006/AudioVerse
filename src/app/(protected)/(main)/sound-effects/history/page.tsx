import { PageLayout } from "~/components/client/page-layout";
import { HistoryList } from "~/components/client/sound-effects/history-list";
import { getHistoryItems } from "~/lib/history";

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

  const historyItems = await getHistoryItems(service);

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

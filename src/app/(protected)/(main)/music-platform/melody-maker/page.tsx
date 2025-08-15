import { PageLayout } from "~/components/client/music-platform/page-layout";
import { MelodyMakerEditor } from "~/components/client/music-platform/melody-maker/melody-maker-editor";
import { getHistoryItems } from "~/lib/history-server";
import { getCurrentUser } from "~/lib/auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export default async function MelodyMakerPage() {
  const service = "melody-maker";
  const user = await getCurrentUser({ headers: headers() } as Request);
  const userId = user?.id;

  if (!userId) {
    return (
      <PageLayout
        title={"Melody Maker"}
        service={service}
        showSidebar={true}
        historyItems={[]}
      >
        <div className="flex h-full items-center justify-center">
          <p>Please sign in to view this page.</p>
        </div>
      </PageLayout>
    );
  }

  const historyItems = await getHistoryItems(userId, service);
  const credits = 1000; // Default value, you might want to fetch this

  async function handleHistoryUpdate() {
    "use server";
    revalidatePath("/music-platform/melody-maker");
  }

  return (
    <PageLayout
      title={"Melody Maker"}
      service={service}
      showSidebar={true}
      historyItems={historyItems}
    >
      <MelodyMakerEditor
        service="melody-maker"
        credits={credits}
        userId={userId}
        onHistoryUpdate={handleHistoryUpdate}
      />
    </PageLayout>
  );
}
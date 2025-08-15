import { PageLayout } from "~/components/client/music-platform/melody-maker/page-layout";
import { MelodyMakerEditor } from "~/components/client/music-platform/melody-maker/melody-maker-editor";
import { getHistoryItems } from "~/lib/history-server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { verifyToken } from "~/lib/jwt";

export default async function MelodyMakerPage() {
  const service = "melody-maker";
  const token = (await cookies()).get("token")?.value;
  const user = token ? await verifyToken(token) : null;
  const userId = user?.userId;

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
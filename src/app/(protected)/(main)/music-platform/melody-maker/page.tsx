import { PageLayout } from "~/components/client/music-platform/melody-maker/page-layout";
import { MelodyMakerEditor } from "~/components/client/music-platform/melody-maker/melody-maker-editor";
import { revalidatePath } from "next/cache";
import { fetchAuthQuery } from "~/lib/auth-server";

export default async function MelodyMakerPage() {
  const service = "melody-maker";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod = (await import("@convex/_generated/api")) as any;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const api = mod.api;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
  const user = await fetchAuthQuery(api.auth.getCurrentUser);
  const userId = user?.id as string | undefined;
  const credits = 1000;

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

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
  const historyItems = await fetchAuthQuery(api.audioHistory.getMyHistory, {
    service,
  });

  async function handleHistoryUpdate() {
    "use server";
    revalidatePath("/music-platform/melody-maker");
  }

  return (
    <PageLayout
      title={"Melody Maker"}
      service={service}
      showSidebar={true}
      historyItems={historyItems ?? []}
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

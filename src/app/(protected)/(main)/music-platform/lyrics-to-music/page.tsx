import { fetchAuthQuery } from "~/lib/auth-server";
import { getHistoryItems } from "~/lib/history-server";
import { LyricsToMusicEditor } from "~/components/client/music-platform/lyrics-to-music/lyrics-to-music-editor";
import { PageLayout } from "~/components/client/music-platform/lyrics-to-music/page-layout";

export default async function LyricsToMusicPage() {
  const service = "lyrics-to-music";

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
        title="Lyrics to Music"
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

  return (
    <PageLayout
      title="Lyrics to Music"
      service={service}
      showSidebar={true}
      historyItems={historyItems}
    >
      <LyricsToMusicEditor
        service={service}
        credits={credits}
        userId={userId}
      />
    </PageLayout>
  );
}

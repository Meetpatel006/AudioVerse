import { cookies } from "next/headers";
import { verifyToken } from "~/lib/jwt";
import { getHistoryItems } from "~/lib/history-server";
import { LyricsToMusicEditor } from "~/components/client/music-platform/lyrics-to-music/lyrics-to-music-editor";
import { PageLayout } from "~/components/client/music-platform/lyrics-to-music/page-layout";

export default async function LyricsToMusicPage() {
  const service = "lyrics-to-music";
  const token = (await cookies()).get("token")?.value;
  const user = token ? await verifyToken(token) : null;
  const userId = user?.userId;

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
  const credits = 1000; // Set a default number of credits or implement your own logic

  return (
    <PageLayout
      title="Lyrics to Music"
      service={service}
      showSidebar={true}
      historyItems={historyItems}
    >
      <LyricsToMusicEditor service={service} credits={credits} userId={userId} />
    </PageLayout>
  );
}
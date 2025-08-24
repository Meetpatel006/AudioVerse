import { LyricsToMusicEditor } from "~/components/client/music-platform/lyrics-to-music/lyrics-to-music-editor";
import { PageLayout } from "~/components/client/music-platform/lyrics-to-music/page-layout";

export default function LyricsToMusicPage() {
  return (
    <PageLayout title="Lyrics to Music" service="lyrics-to-music" showSidebar={true}>
      <LyricsToMusicEditor />
    </PageLayout>
  );
}
import { PageLayout } from "~/components/client/music-platform/melody-maker/page-layout";

export default function LyricsToMusicPage() {
  return (
    <PageLayout title="Lyrics to Music" service="lyrics-to-music" showSidebar={true}>
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-3xl font-bold mb-4">Hello World</h1>
        <p className="text-lg">Welcome to the Lyrics to Music page!</p>
      </div>
    </PageLayout>
  );
}
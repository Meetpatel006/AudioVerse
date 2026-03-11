import { PageLayout } from "~/components/client/creative-platform/page-layout";
import { VoiceChanger } from "~/components/client/creative-platform/speech-synthesis/voice-changer";
import { fetchAuthQuery } from "~/lib/auth-server";
import { getHistoryItems } from "~/lib/history-server";

export default async function SpeechToSpeechPage() {
  const service = "seedvc";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod = (await import("@convex/_generated/api")) as any;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const api = mod.api;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
  const user = await fetchAuthQuery(api.auth.getCurrentUser);
  const userId = user?.id as string | undefined;

  if (!userId) {
    return (
      <PageLayout
        title={"Voice Changer"}
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
  const credits = 1000;

  return (
    <PageLayout
      title={"Voice Changer"}
      service={service}
      showSidebar={true}
      historyItems={historyItems}
    >
      <VoiceChanger credits={credits} service={service} userId={userId} />
    </PageLayout>
  );
}

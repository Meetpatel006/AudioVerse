import { PageLayout } from "~/components/client/creative-platform/page-layout";
import { VoiceChanger } from "~/components/client/creative-platform/speech-synthesis/voice-changer";
import { getHistoryItems } from "~/lib/history-server";
import { cookies } from "next/headers";
import { verifyToken } from "~/lib/jwt";

export default async function SpeechToSpeechPage() {
  const service = "seedvc";
  const token = (await cookies()).get("token")?.value;
  const user = token ? await verifyToken(token) : null;
  const userId = user?.userId;

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
  const credits = 1000; // Set a default number of credits or implement your own logic

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

import { PageLayout } from "~/components/client/creative-platform/page-layout";
import { VoiceChanger } from "~/components/client/creative-platform/speech-synthesis/voice-changer";
import { getHistoryItems } from "~/lib/history-server";
import { headers } from "next/headers";

export default async function SpeechToSpeechPage() {
  const service = "seedvc";
  
  // Get user ID from headers set by middleware
  const headersList = await headers();
  const userId = headersList.get('x-user-id');
  
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  const historyItems = await getHistoryItems(userId, service);
  // Set a default number of credits or implement your own logic
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

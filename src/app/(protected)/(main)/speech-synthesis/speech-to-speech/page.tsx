import { PageLayout } from "~/components/client/page-layout";
import { VoiceChanger } from "~/components/client/speech-synthesis/voice-changer";
import { getHistoryItems } from "~/lib/history";

export default async function SpeechToSpeechPage() {
  const service = "seedvc";
  const historyItems = await getHistoryItems(service);
  // Set a default number of credits or implement your own logic
  const credits = 1000;

  return (
    <PageLayout
      title={"Voice Changer"}
      service={service}
      showSidebar={true}
      historyItems={historyItems}
    >
      <VoiceChanger credits={credits} service={service} />
    </PageLayout>
  );
}

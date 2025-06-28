import { PageLayout } from "~/components/client/page-layout";
import { getHistoryItems } from "~/lib/history";
import { TextToSpeechEditor } from "~/components/client/speech-synthesis/text-to-speech-editor";

export default async function TextToSpeechPage() {
  const service = "styletts2";
  const historyItems = await getHistoryItems(service);
  // Set a default number of credits or implement your own logic
  const credits = 1000;

  return (
    <PageLayout
      title={"Text to Speech"}
      service={service}
      showSidebar={true}
      historyItems={historyItems}
    >
      <TextToSpeechEditor service="styletts2" credits={credits} />
    </PageLayout>
  );
}

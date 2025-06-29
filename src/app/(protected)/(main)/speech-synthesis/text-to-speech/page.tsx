import { PageLayout } from "~/components/client/page-layout";
import { getHistoryItems } from "~/lib/history";
import { TextToSpeechEditor } from "~/components/client/speech-synthesis/text-to-speech-editor";
import { headers } from "next/headers";

export default async function TextToSpeechPage() {
  const service = "styletts2";
  
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
      title={"Text to Speech"}
      service={service}
      showSidebar={true}
      historyItems={historyItems}
    >
      <TextToSpeechEditor service="styletts2" credits={credits} userId={userId} />
    </PageLayout>
  );
}

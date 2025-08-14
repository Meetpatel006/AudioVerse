import { PageLayout } from "~/components/client/creative-platform/page-layout";
import { getHistoryItems, type ClientHistoryItem } from "~/lib/history-server";
import { TextToSpeechEditor } from "~/components/client/creative-platform/speech-synthesis/text-to-speech-editor";
import { headers } from "next/headers";

export default async function TextToSpeechPage() {
  const service = "styletts2";
  
  // Get user ID from headers set by middleware
  const headersList = await headers();
  const userId = headersList.get('x-user-id');
  
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  console.log('Fetching history for user:', userId, 'service:', service);
  
  let historyItems: ClientHistoryItem[] = [];
  try {
    historyItems = await getHistoryItems(userId, service);
    console.log('Successfully fetched history items:', historyItems.length);
  } catch (error) {
    console.error('Error fetching history items:', error);
    historyItems = []; // Fallback to empty array
  }
  
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

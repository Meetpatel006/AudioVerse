import { PageLayout } from "~/components/client/creative-platform/page-layout";
import { TextToSpeechEditor } from "~/components/client/creative-platform/speech-synthesis/text-to-speech-editor";
import { fetchAuthQuery } from "~/lib/auth-server";

export default async function TextToSpeechPage() {
  const service = "styletts2";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod = (await import("@convex/_generated/api")) as any;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const api = mod.api;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
  const user = await fetchAuthQuery(api.auth.getCurrentUser);
  const userId = user?.id as string | undefined;
  const credits = 1000;

  if (!userId) {
    return (
      <PageLayout
        title={"Text to Speech"}
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

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
  const historyItems = await fetchAuthQuery(api.audioHistory.getMyHistory, {
    service,
  });

  return (
    <PageLayout
      title={"Text to Speech"}
      service={service}
      showSidebar={true}
      historyItems={historyItems ?? []}
    >
      <TextToSpeechEditor
        service="styletts2"
        credits={credits}
        userId={userId}
      />
    </PageLayout>
  );
}

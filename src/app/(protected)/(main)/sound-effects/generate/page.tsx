import { PageLayout } from "~/components/client/page-layout";
import { SoundEffectsGenerator } from "~/components/client/sound-effects/sound-effects-generator";

export default function SoundEffectsGeneratePage() {
  // Set a default number of credits or implement your own logic
  const credits = 1000;

  const soundEffectsTabs = [
    {
      name: "Generate",
      path: "/sound-effects/generate",
    },
    {
      name: "History",
      path: "/sound-effects/history",
    },
  ];

  return (
    <PageLayout
      title={"Sound Effects"}
      showSidebar={false}
      tabs={soundEffectsTabs}
      service="make-an-audio"
    >
      <SoundEffectsGenerator credits={credits} />
    </PageLayout>
  );
}

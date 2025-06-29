import { cn } from "~/lib/utils";
import {
  IconVolume,
  IconMicrophone,
  IconMusic,
  IconSettings,
  IconGlobe,
  // IconZap,
  IconShield,
  IconCloud,
} from "@tabler/icons-react";

export function FeaturesSectionWithHoverEffects() {
  const features = [
    {
      title: "Text-to-Speech",
      description:
        "Convert text into natural, expressive speech with AI voices.",
      icon: <IconVolume />,
    },
    {
      title: "Speech-to-Speech",
      description:
        "Transform your voice or clone others with advanced AI conversion.",
      icon: <IconMicrophone />,
    },
    {
      title: "Sound Effects",
      description:
        "Create unique, high-quality sound effects from simple prompts.",
      icon: <IconMusic />,
    },
    {
      title: "Easy API Integration",
      description: "Integrate AI audio into your apps with our robust API.",
      icon: <IconSettings />,
    },
    {
      title: "Multiple Languages",
      description: "Reach a global audience with multilingual support.",
      icon: <IconGlobe />,
    },
    // {
    //   title: "Fast Processing",
    //   description:
    //     "Lightning-fast audio generation with professional-grade quality.",
    //   icon: <IconZap />,
    // },
    {
      title: "High-Quality AI Voices",
      description:
        "Premium, lifelike voices for professional content.",
      icon: <IconShield />,
    },
    {
      title: "Free Tier Available",
      description: "Start creating audio for free—no card required.",
      icon: <IconCloud />,
    },
  ];
  return (
    <div className="relative z-10 py-10 max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Powerful Features for Every Creator</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Whether you&apos;re a developer, content creator, or business, our platform gives you the tools to generate stunning audio with ease.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, index) => (
          <Feature key={feature.title} {...feature} index={index} />
        ))}
      </div>
    </div>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r  py-10 relative group/feature dark:border-neutral-800",
        (index === 0 || index === 4) && "lg:border-l dark:border-neutral-800",
        index < 4 && "lg:border-b dark:border-neutral-800"
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-neutral-600 dark:text-neutral-400">
        {icon}
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-blue-500 transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-800 dark:text-neutral-100">
          {title}
        </span>
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-xs relative z-10 px-10">
        {description}
      </p>
    </div>
  );
};
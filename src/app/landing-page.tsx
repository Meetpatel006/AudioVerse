'use client'
import { HeroSection } from "~/components/ui/hero-section";
import { Footerdemo } from "~/components/ui/footer-section";
import { FeaturesSectionWithHoverEffects } from "~/components/ui/feature-section-with-hover-effects";
import { CTASection } from "~/components/ui/cta-with-rectangle";

export default function LandingPage() {
  return (
    <div>
      <HeroSection />
      <FeaturesSectionWithHoverEffects />
      <div className="mb-16" />
      <CTASection
        badge={{
          text: "AI Voice Generation for Everyone"
        }}
        title="Transform Text and Speech into Stunning Audio"
        description="Empower your content with lifelike AI voices, advanced speech-to-speech, and creative sound effects. Perfect for creators, developers, and businesses. Get started for free—no credit card required!"
        action={{
          text: "Start Free – No Card Needed",
          href: "#",
          variant: "default"
        }}
      />
      <div className="mb-16" />
      <Footerdemo />
    </div>
  );
};

// export default LandingPage;
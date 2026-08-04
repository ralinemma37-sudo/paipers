"use client";

/**
 * Landing publique Paipers — composition des sections vitrine.
 */

import PublicSiteHeader from "@/components/landing/PublicSiteHeader";
import LandingHero from "@/components/landing/LandingHero";
import LandingProblemSection from "@/components/landing/LandingProblemSection";
import LandingFeaturesSection from "@/components/landing/LandingFeaturesSection";
import LandingArchiSection from "@/components/landing/LandingArchiSection";
import LandingProductShowcaseSection from "@/components/landing/LandingProductShowcaseSection";
import LandingAudienceSection from "@/components/landing/LandingAudienceSection";
import LandingHowItWorksSection from "@/components/landing/LandingHowItWorksSection";
import LandingFoundersSection from "@/components/landing/LandingFoundersSection";
import LandingRoadmapSection from "@/components/landing/LandingRoadmapSection";
import LandingSecuritySection from "@/components/landing/LandingSecuritySection";
import LandingPricingSection from "@/components/landing/LandingPricingSection";
import LandingWaitlistSection from "@/components/landing/LandingWaitlistSection";
import LandingFaqSection from "@/components/landing/LandingFaqSection";
import LandingFinalCta from "@/components/landing/LandingFinalCta";
import LandingFooter from "@/components/landing/LandingFooter";
import LandingSmoothAnchorScroll from "@/components/landing/LandingSmoothAnchorScroll";
import { DESKTOP_SURFACES } from "@/lib/desktopSurfaces";

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden" style={{ background: DESKTOP_SURFACES.night }}>
      <LandingSmoothAnchorScroll />
      <PublicSiteHeader />
      <LandingHero />
      <LandingProblemSection />
      <LandingFeaturesSection />
      <LandingArchiSection />
      <LandingProductShowcaseSection />
      <LandingAudienceSection />
      <LandingHowItWorksSection />
      <LandingFoundersSection />
      <LandingRoadmapSection />
      <LandingSecuritySection />
      <LandingPricingSection />
      <LandingWaitlistSection />
      <LandingFaqSection />
      <LandingFinalCta />
      <LandingFooter />
    </div>
  );
}

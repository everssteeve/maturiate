import { PublicHeader } from "@/components/public-header";
import { HeroSection } from "@/components/landing/hero-section";
import { BenefitsSection } from "@/components/landing/benefits-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { StateOfIATeaser } from "@/components/landing/state-of-ia-teaser";
import { CTASection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main className="mx-auto max-w-7xl px-4 sm:px-6">
        <HeroSection />
        <BenefitsSection />
        <HowItWorksSection />
        <StateOfIATeaser />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

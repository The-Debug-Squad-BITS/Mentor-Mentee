import { useEffect } from "react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import HeroSection from "../components/sections/HeroSection";
import DashboardPreview from "../components/sections/DashboardPreview";
import ProblemSection from "../components/sections/ProblemSection";
import FeaturesSection from "../components/sections/FeaturesSection";
import HowItWorksSection from "../components/sections/HowItWorksSection";
import RolesSection from "../components/sections/RolesSection";
import ProductComparisonSection from "../components/sections/ProductComparisonSection";
import FaqSection from "../components/sections/FaqSection";
import FinalCtaSection from "../components/sections/FinalCtaSection";
import useSeo from "../hooks/useSeo";
import { setJsonLd, faqJsonLd, productJsonLd, DEFAULT_DESCRIPTION } from "../lib/seo";
import { faqs } from "../data/LandingData";

/* ==========================================================================
   LandingPage — the public marketing page.
   --------------------------------------------------------------------------
   Narrative order: what it is → what it looks like → why it is needed →
   what it does → how it runs → who it serves → why not a generic tracker →
   open questions → the ask.

   All copy lives in `src/data/landingData.js`.
   ========================================================================== */

export default function LandingPage() {
  useSeo({
    title: "Trellis — Academic Project & Capstone Supervision Platform",
    description: DEFAULT_DESCRIPTION,
    path: "/",
  });

  // Built from the same `faqs` array FaqSection renders, so the structured data
  // always matches the visible answers.
  useEffect(() => {
    setJsonLd("product", productJsonLd());
    setJsonLd("faq", faqJsonLd(faqs));
    return () => {
      setJsonLd("product", null);
      setJsonLd("faq", null);
    };
  }, []);

  return (
    <div id="top" className="min-h-screen bg-canvas font-sans text-slate-900">
      <Header />

      <main>
        {/* Hero sits on white so the page opens bright, then settles onto the canvas. */}
        <div className="border-b border-slate-200/80 bg-white">
          <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-6 sm:py-24 lg:px-8">
            <HeroSection />
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-6xl flex-col gap-24 px-5 py-20 sm:gap-28 sm:px-6 sm:py-24 lg:px-8">
          <DashboardPreview />
          <ProblemSection />
          <FeaturesSection />
          <HowItWorksSection />
          <RolesSection />
          <ProductComparisonSection />
          <FaqSection />
          <FinalCtaSection />
        </div>
      </main>

      <Footer />
    </div>
  );
}

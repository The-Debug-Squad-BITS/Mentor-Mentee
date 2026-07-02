import { useState } from "react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import HeroSection from "../components/sections/HeroSection";
import DashboardPreview from "../components/sections/DashboardPreview";
import FeaturesSection from "../components/sections/FeaturesSection";
import ProductComparisonSection from "../components/sections/ProductComparisonSection";

export default function LandingPage({ initialPage = null }) {
  return (
    <div className="min-h-screen bg-cream font-sans text-ink overflow-x-hidden">
      <div className="max-w-full w-full mx-auto px-6">
        <Header />

        {/* Hero */}
        <main className="sm:mx-0 md:mx-10 lg:mx-12.5 py-20 grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-14 items-center">
          <HeroSection />

          <DashboardPreview />
        </main>

        <FeaturesSection />
        <ProductComparisonSection />
        <Footer />
      </div>
    </div>
  );
}

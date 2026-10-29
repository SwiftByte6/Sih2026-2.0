"use client";

import { HeroSection } from "@/components/landing/HeroSection";
import { CoreFeaturesSection } from "@/components/landing/CoreFeaturesSection";
import { SystemWorkflowSection } from "@/components/landing/SystemWorkflowSection";
import { PlatformPreviewSection } from "@/components/landing/PlatformPreviewSection";
import { FinalCtaSection } from "@/components/landing/FinalCtaSection";
import { CompactFooter } from "@/components/landing/CompactFooter";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#fff] flex flex-col items-center antialiased">
      {/* Thin Pale Outer Frame matching TaskGo reference */}
      <div className="w-full rounded-[24px] sm:rounded-[36px] p-1 sm:p-1.5 shadow-2xl flex flex-col">
        {/* Centered White Page Canvas */}
        <div className="w-full bg-white rounded-[20px] sm:rounded-[30px] overflow-hidden flex flex-col shadow-xl">
          {/* 1. Existing Hero Section (Preserved exactly as implemented) */}
          <HeroSection />

          {/* 2. Core Features Section (Advanced Features Grid) */}
          <CoreFeaturesSection />

          {/* 3. Existing System Workflow Section (Preserved workflow flow) */}
          <SystemWorkflowSection />

          {/* 4. Platform Preview Section (Two-column with 16:9 video placeholder) */}
          <PlatformPreviewSection />

          {/* 5. Final Call-to-Action Section */}
          <FinalCtaSection />

          {/* 6. Compact Understated Footer */}
          <CompactFooter />
        </div>
      </div>
    </div>
  );
}

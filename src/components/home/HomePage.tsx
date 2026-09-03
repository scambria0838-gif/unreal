import { AskTeaser } from "@/components/home/AskTeaser";
import { ConstructionIsEasy } from "@/components/home/ConstructionIsEasy";
import { Experience } from "@/components/home/Experience";
import { Hero } from "@/components/home/Hero";
import { IntelligenceTeaser } from "@/components/home/IntelligenceTeaser";
import { Markets } from "@/components/home/Markets";
import { OwnerBuilder } from "@/components/home/OwnerBuilder";
import { PermitsPlans } from "@/components/home/PermitsPlans";
import { ProblemSelector } from "@/components/home/ProblemSelector";
import { RedTagRescue } from "@/components/home/RedTagRescue";
import { TrustBar } from "@/components/home/TrustBar";
import { WorkPreview } from "@/components/home/WorkPreview";

export function HomePage() {
  return (
    <>
      <Hero />
      <ProblemSelector />
      <ConstructionIsEasy />
      <RedTagRescue />
      <PermitsPlans />
      <OwnerBuilder />
      <Markets />
      <Experience />
      <WorkPreview />
      <IntelligenceTeaser />
      <AskTeaser />
      <TrustBar />
    </>
  );
}

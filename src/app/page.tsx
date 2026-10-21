import {
  AppMapSection,
  BentoSection,
  BorrowVisualSection,
  FeatureArtSection,
  Footer,
  HowSection,
  MarketsSection,
  WhySection,
} from "@/components/sections";
import { Hero } from "@/components/hero";
import { Nav } from "@/components/nav";

export default function HomePage() {
  return (
    <>
      <Nav />
      <main className="flex-1 bg-[#f7f7f5]">
        <Hero />
        <BentoSection />
        <FeatureArtSection />
        <BorrowVisualSection />
        <MarketsSection />
        <WhySection />
        <HowSection />
        <AppMapSection />
      </main>
      <Footer />
    </>
  );
}

import { HeroSection } from '@/components/home/HeroSection';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { LongTermBanner } from '@/components/home/LongTermBanner';
import { TrustSection } from '@/components/home/TrustSection';
import { HowItWorks } from '@/components/home/HowItWorks';
import { CTASection } from '@/components/home/CTASection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoryGrid />
      <LongTermBanner />
      <TrustSection />
      <HowItWorks />
      <CTASection />
    </>
  );
}

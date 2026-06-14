import { InvestHero } from './InvestHero';
import { BackUsSection } from './BackUsSection';
import { ProblemSection } from './ProblemSection';
import { SolutionSection } from './SolutionSection';
import { TractionSection } from './TractionSection';
import { ProjectionsSection } from './ProjectionsSection';
import { MarketSection } from './MarketSection';
import { FundsSection } from './FundsSection';
import { TeamSection } from './TeamSection';
import { PitchDeckSection } from './PitchDeckSection';
import { ContactSection } from './ContactSection';

export function InvestPageContent() {
  return (
    <div className="min-h-screen bg-white text-ink-900">
      <InvestHero />
      <BackUsSection />
      <ProblemSection />
      <SolutionSection />
      <TractionSection />
      <ProjectionsSection />
      <MarketSection />
      <FundsSection />
      <TeamSection />
      <PitchDeckSection />
      <ContactSection />

      {/* ─── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="overflow-hidden border-t border-ink-100 bg-white px-6 py-6">
        <p className="text-center text-sm text-ink-400">
          © {new Date().getFullYear()} Ndotoni Stays. All rights reserved. — ndotonistays.com
        </p>
      </footer>
    </div>
  );
}

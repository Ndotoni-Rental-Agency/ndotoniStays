import { ArrowRight, Rocket } from 'lucide-react';

export function InvestHero() {
  return (
    <section className="relative overflow-hidden bg-white px-6 py-10 sm:py-14">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-brand-50 opacity-60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-brand-50 opacity-40 blur-3xl" />

      <div className="relative mx-auto max-w-4xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700">
          <Rocket className="h-4 w-4" />
          Pre-Seed Equity Round — Now Open
        </div>

        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Back <span className="text-brand-600">Ndotoni Stays</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-ink-500 sm:text-xl">
          Global platforms weren&apos;t built for Tanzania. Ndotoni Stays offers verified spaces
          and local-first booking for stays, events, and short-term rentals.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-8">
          <div className="text-center">
            <p className="text-3xl font-bold text-brand-600">$150K</p>
            <p className="mt-1 text-sm text-ink-500">Raising</p>
          </div>
          <div className="h-10 w-px bg-ink-100" />
          <div className="text-center">
            <p className="text-3xl font-bold text-brand-600">10%</p>
            <p className="mt-1 text-sm text-ink-500">Equity</p>
          </div>
          <div className="h-10 w-px bg-ink-100" />
          <div className="text-center">
            <p className="text-3xl font-bold text-brand-600">18 mo</p>
            <p className="mt-1 text-sm text-ink-500">Runway</p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a
            href="#back-us"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-700"
          >
            Back This Round
            <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="#pitch-deck"
            className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-6 py-3 text-base font-semibold text-ink-700 transition hover:bg-ink-50"
          >
            View Pitch Deck
          </a>
        </div>
      </div>
    </section>
  );
}

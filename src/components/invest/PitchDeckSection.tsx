import { FileText } from 'lucide-react';

export function PitchDeckSection() {
  return (
    <section id="pitch-deck" className="overflow-hidden bg-ink-50 px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold">Pitch Deck</h2>
        <p className="mt-3 text-ink-500">
          See the full story — market, product, traction, and financials.
        </p>
        <a
          href="https://docs.google.com/presentation/d/1example"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-6 py-3 text-base font-semibold text-ink-700 shadow-sm transition hover:bg-ink-50"
        >
          <FileText className="h-5 w-5" />
          Open Pitch Deck
        </a>
      </div>
    </section>
  );
}

import { ShieldCheck, Globe, TrendingUp } from 'lucide-react';

export function ProblemSection() {
  return (
    <section className="overflow-hidden bg-ink-50 px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold">The Problem</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-ink-500">
          Short-term stays in Tanzania are fragmented, untrusted, and hard to book.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: 'No Trust',
              description: 'Guests can\'t verify properties before booking. Scams and misrepresentation are common.',
            },
            {
              icon: Globe,
              title: 'No Local Platform',
              description: 'No Tanzanian-built alternative to Airbnb. International platforms miss local supply and payment methods.',
            },
            {
              icon: TrendingUp,
              title: 'Growing Demand',
              description: '1.5M+ tourists yearly, rising domestic travel, and zero local tech serving the short-stay market.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50">
                <item.icon className="h-6 w-6 text-brand-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-ink-500">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

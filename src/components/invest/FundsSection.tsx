import { Code, Megaphone, Handshake, Target } from 'lucide-react';

export function FundsSection() {
  return (
    <section className="overflow-hidden bg-ink-50 px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold">Use of Funds</h2>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Code, title: 'Product', pct: '40%', desc: 'Engineering, infrastructure, mobile app' },
            { icon: Megaphone, title: 'Marketing', pct: '25%', desc: 'Growth, brand, travel partnerships' },
            { icon: Handshake, title: 'Operations', pct: '20%', desc: 'Host onboarding, support, quality' },
            { icon: Target, title: 'Reserve', pct: '15%', desc: 'Legal, compliance, contingency' },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
                <item.icon className="h-5 w-5 text-brand-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
              <p className="mt-1 text-2xl font-bold text-brand-600">{item.pct}</p>
              <p className="mt-2 text-sm text-ink-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { CheckCircle2, Building2, Eye, MessageSquare } from 'lucide-react';

export function TractionSection() {
  return (
    <section className="overflow-hidden bg-ink-50 px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold">Traction</h2>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {[
            { icon: Building2, stat: '40+', label: 'Landlords onboarded' },
            { icon: Eye, stat: '800+', label: 'Website visitors' },
            { icon: MessageSquare, stat: '160+', label: 'Tenant inquiries' },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-ink-100 bg-white p-6 text-center shadow-sm">
              <item.icon className="mx-auto h-8 w-8 text-brand-500" />
              <p className="mt-3 text-3xl font-bold text-brand-600">{item.stat}</p>
              <p className="mt-1 text-sm text-ink-500">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <h3 className="text-center text-lg font-semibold">What We&apos;ve Built</h3>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              'Full booking platform (Next.js + AWS)',
              'Stripe & M-Pesa payment integration',
              'Host dashboard with calendar management',
              'Guest search, filtering, and instant booking',
              'WhatsApp booking notifications',
              'Review and ratings system',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-lg bg-white p-3 border border-ink-100">
                <CheckCircle2 className="h-4 w-4 text-brand-500" />
                <span className="text-sm text-ink-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

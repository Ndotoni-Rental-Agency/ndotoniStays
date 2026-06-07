import { ShieldCheckIcon, BoltIcon, ChatBubbleLeftRightIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

const TRUST_POINTS = [
  {
    icon: BoltIcon,
    title: 'Instant Booking',
    description: 'No waiting for host approval. Book and get confirmed immediately.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Verified Places',
    description: 'Every listing is reviewed. Real photos, accurate descriptions.',
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'WhatsApp Support',
    description: 'Questions? Chat with us or your host directly on WhatsApp.',
  },
  {
    icon: CurrencyDollarIcon,
    title: 'Fair Pricing',
    description: 'All fees shown upfront. No hidden charges at check-in.',
  },
];

export function TrustSection() {
  return (
    <section className="py-10 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl font-bold text-ink-900">
            Why people choose us
          </h2>
        </div>

        {/* Mobile: compact horizontal list */}
        <div className="sm:hidden space-y-3">
          {TRUST_POINTS.map((point) => (
            <div
              key={point.title}
              className="flex items-start gap-3 p-3 rounded-xl bg-white border border-ink-100"
            >
              <div className="h-9 w-9 shrink-0 rounded-lg bg-brand-50 flex items-center justify-center">
                <point.icon className="h-5 w-5 text-brand-600" />
              </div>
              <div>
                <h3 className="font-semibold text-ink-900 text-sm">{point.title}</h3>
                <p className="text-xs text-ink-500 leading-relaxed mt-0.5">
                  {point.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: grid cards */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_POINTS.map((point) => (
            <div
              key={point.title}
              className="flex flex-col items-center text-center p-6 rounded-2xl bg-white border border-ink-100 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-50 transition-all"
            >
              <div className="h-12 w-12 rounded-xl bg-brand-50 flex items-center justify-center mb-4">
                <point.icon className="h-6 w-6 text-brand-600" />
              </div>
              <h3 className="font-semibold text-ink-900 text-sm">{point.title}</h3>
              <p className="mt-2 text-sm text-ink-500 leading-relaxed">
                {point.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

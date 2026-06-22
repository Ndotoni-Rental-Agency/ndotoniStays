'use client';

import { ShieldCheckIcon, BoltIcon, ChatBubbleLeftRightIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '@/contexts/LanguageContext';

const TRUST_POINTS = [
  { icon: BoltIcon, titleKey: 'trust.instant.title', descKey: 'trust.instant.desc' },
  { icon: ShieldCheckIcon, titleKey: 'trust.verified.title', descKey: 'trust.verified.desc' },
  { icon: ChatBubbleLeftRightIcon, titleKey: 'trust.whatsapp.title', descKey: 'trust.whatsapp.desc' },
  { icon: CurrencyDollarIcon, titleKey: 'trust.pricing.title', descKey: 'trust.pricing.desc' },
];

export function TrustSection() {
  const { t } = useLanguage();

  return (
    <section className="py-10 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl font-bold text-ink-900">
            {t('trust.title')}
          </h2>
        </div>

        {/* Mobile: compact horizontal list */}
        <div className="sm:hidden space-y-3">
          {TRUST_POINTS.map((point) => (
            <div
              key={point.titleKey}
              className="flex items-start gap-3 p-3 rounded-xl bg-white border border-ink-100"
            >
              <div className="h-9 w-9 shrink-0 rounded-lg bg-brand-50 flex items-center justify-center">
                <point.icon className="h-5 w-5 text-brand-600" />
              </div>
              <div>
                <h3 className="font-semibold text-ink-900 text-sm">{t(point.titleKey)}</h3>
                <p className="text-xs text-ink-500 leading-relaxed mt-0.5">
                  {t(point.descKey)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: grid cards */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_POINTS.map((point) => (
            <div
              key={point.titleKey}
              className="flex flex-col items-center text-center p-6 rounded-2xl bg-white border border-ink-100 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-50 transition-all"
            >
              <div className="h-12 w-12 rounded-xl bg-brand-50 flex items-center justify-center mb-4">
                <point.icon className="h-6 w-6 text-brand-600" />
              </div>
              <h3 className="font-semibold text-ink-900 text-sm">{t(point.titleKey)}</h3>
              <p className="mt-2 text-sm text-ink-500 leading-relaxed">
                {t(point.descKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

'use client';

import { ShieldCheckIcon, BoltIcon, ChatBubbleLeftRightIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '@/contexts/LanguageContext';

const TRUST_POINTS = [
  { icon: BoltIcon, titleKey: 'trust.instant.title', descKey: 'trust.instant.desc' },
  { icon: ShieldCheckIcon, titleKey: 'trust.verified.title', descKey: 'trust.verified.desc' },
  { icon: ChatBubbleLeftRightIcon, titleKey: 'trust.whatsapp.title', descKey: 'trust.whatsapp.desc' },
  { icon: DevicePhoneMobileIcon, titleKey: 'trust.pricing.title', descKey: 'trust.pricing.desc' },
];

export function TrustSection() {
  const { t } = useLanguage();

  return (
    <section className="py-8 sm:py-14 border-y border-ink-100 bg-ink-50/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink-900">
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
              className="flex flex-col items-start p-4 lg:p-6"
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

'use client';

import { useStayCopy } from '@/hooks/useStayCopy';
import type { GuestManualPaymentOptions } from '@/lib/guestManualPaymentOptions';

interface ManualAlternativePaymentProps {
  options: GuestManualPaymentOptions;
  className?: string;
}

export function ManualAlternativePayment({ options, className = '' }: ManualAlternativePaymentProps) {
  const { copy } = useStayCopy();
  const ref = options.paymentReference?.trim() || '';

  return (
    <div className={`rounded-2xl border border-ink-200 bg-ink-50/80 p-4 text-left ${className}`}>
      <p className="text-sm font-semibold text-ink-900">{copy('Other way to pay')}</p>
      <p className="mt-2 text-xs text-ink-500">{copy('Lipa number (TIPS — all mobile money)')}</p>
      <p className="mt-1 font-mono text-base font-semibold tracking-wide text-ink-900">{options.lipaNumber}</p>
      <p className="mt-1 text-sm text-ink-600">{options.accountName}</p>
      {ref ? (
        <p className="mt-3 text-xs text-ink-500">
          {copy('Use booking ID as payment reference:')}{' '}
          <span className="font-semibold text-ink-800">{ref}</span>
        </p>
      ) : null}
      <p className="mt-2 text-xs text-ink-400">{copy('After you pay, we will confirm and send your receipt.')}</p>
    </div>
  );
}

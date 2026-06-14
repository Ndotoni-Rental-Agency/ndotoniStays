import { ArrowRight, Phone } from 'lucide-react';
import { STRIPE_LINKS, MPESA_NUMBER } from './investData';

export function BackUsSection() {
  return (
    <section id="back-us" className="overflow-hidden bg-white px-6 py-20">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-ink-100 bg-white p-8 shadow-xl shadow-ink-900/5">
          <h2 className="text-center text-2xl font-bold">Back Us</h2>
          <p className="mt-2 text-center text-ink-500">Choose an amount and invest via Stripe or M-Pesa.</p>

          <div className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-5">
            {Object.entries(STRIPE_LINKS).map(([amount, link]) => (
              <a
                key={amount}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center rounded-xl border-2 border-ink-100 py-3 text-base font-semibold text-ink-800 transition hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700"
              >
                ${amount}
              </a>
            ))}
          </div>

          <a
            href={STRIPE_LINKS[100]}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-700"
          >
            Pay with Stripe
            <ArrowRight className="h-4 w-4" />
          </a>

          <div className="mt-8 border-t border-ink-100 pt-6">
            <p className="text-center text-sm font-medium text-ink-500">Or pay via M-Pesa</p>
            <div className="mt-3 flex items-center justify-center gap-3 rounded-xl bg-brand-50 px-4 py-3">
              <Phone className="h-5 w-5 text-brand-600" />
              <div className="text-center">
                <span className="text-lg font-semibold text-brand-700 block">{MPESA_NUMBER}</span>
                <span className="text-xs text-ink-500">Name: Kelvin Makoye</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

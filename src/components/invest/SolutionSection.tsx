import { CheckCircle2 } from 'lucide-react';

export function SolutionSection() {
  return (
    <section className="overflow-hidden bg-white px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-3xl font-bold">Our Solution</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-ink-500">
          Ndotoni Stays is the booking platform built for East Africa — local payments, verified stays, instant booking.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {[
            'Instant booking with real-time availability',
            'Verified photos and accurate property descriptions',
            'Stripe + M-Pesa payments for guests and hosts',
            'Host dashboard with calendar, pricing, and analytics',
            'Guest reviews and ratings for trust',
            'WhatsApp notifications for bookings and updates',
          ].map((feature) => (
            <div key={feature} className="flex items-start gap-3 rounded-xl bg-brand-50/50 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-500" />
              <span className="text-sm font-medium text-ink-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

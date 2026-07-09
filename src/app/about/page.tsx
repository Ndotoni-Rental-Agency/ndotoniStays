import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us – ndotoni Stays',
  description:
    'ndotoni Stays is Tanzania\'s local booking platform for nightly stays, party venues, photoshoot locations, and event spaces. Built in Dar es Salaam for East Africa.',
  openGraph: {
    title: 'About Us – ndotoni Stays',
    description:
      'Tanzania\'s local booking platform for short-term stays and event spaces.',
  },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero */}
      <section className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold text-ink-900 mb-4">
          About ndotoni Stays
        </h1>
        <p className="text-lg text-ink-600 max-w-2xl mx-auto">
          We&apos;re building the booking platform East Africa deserves — local
          payments, verified stays, and instant booking.
        </p>
      </section>

      {/* Mission */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold text-ink-900 mb-4">Our Mission</h2>
        <p className="text-ink-700 leading-relaxed">
          Short-term stays in Tanzania are fragmented, untrusted, and hard to book.
          Global platforms weren&apos;t built for this market — they miss local supply,
          don&apos;t support mobile money, and leave guests guessing about property
          quality. We&apos;re changing that.
        </p>
        <p className="text-ink-700 leading-relaxed mt-4">
          ndotoni Stays connects guests with verified apartments, villas, party venues,
          photoshoot locations, and event spaces across Tanzania. Every listing is
          reviewed. Every booking is instant. Every payment works with the methods
          people actually use.
        </p>
      </section>

      {/* What We Offer */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold text-ink-900 mb-6">What We Offer</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="rounded-xl border border-ink-100 p-6">
            <p className="text-2xl mb-2">🏠</p>
            <h3 className="font-semibold text-ink-900 mb-1">Nightly Stays</h3>
            <p className="text-ink-600 text-sm">
              Apartments and rooms for a comfortable night in cities across Tanzania.
            </p>
          </div>
          <div className="rounded-xl border border-ink-100 p-6">
            <p className="text-2xl mb-2">🎉</p>
            <h3 className="font-semibold text-ink-900 mb-1">Parties &amp; Events</h3>
            <p className="text-ink-600 text-sm">
              Birthday venues, celebration spaces, and event locations.
            </p>
          </div>
          <div className="rounded-xl border border-ink-100 p-6">
            <p className="text-2xl mb-2">📸</p>
            <h3 className="font-semibold text-ink-900 mb-1">Photoshoots</h3>
            <p className="text-ink-600 text-sm">
              Beautiful backdrops for content creators and photographers.
            </p>
          </div>
          <div className="rounded-xl border border-ink-100 p-6">
            <p className="text-2xl mb-2">🏖️</p>
            <h3 className="font-semibold text-ink-900 mb-1">Beach Getaways</h3>
            <p className="text-ink-600 text-sm">
              Sun, sand, and ocean views in Zanzibar and along the coast.
            </p>
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold text-ink-900 mb-6">Why ndotoni Stays</h2>
        <ul className="space-y-4">
          <li className="flex items-start gap-3">
            <span className="text-xl">⚡</span>
            <div>
              <p className="font-medium text-ink-900">Instant Booking</p>
              <p className="text-ink-600 text-sm">No waiting for host approval. Book and get confirmed immediately.</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-xl">✅</span>
            <div>
              <p className="font-medium text-ink-900">Verified Places</p>
              <p className="text-ink-600 text-sm">Every listing is reviewed. Real photos, accurate descriptions.</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-xl">💬</span>
            <div>
              <p className="font-medium text-ink-900">WhatsApp Support</p>
              <p className="text-ink-600 text-sm">Chat with us or your host directly on WhatsApp.</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-xl">💰</span>
            <div>
              <p className="font-medium text-ink-900">Fair Pricing</p>
              <p className="text-ink-600 text-sm">All fees shown upfront. No hidden charges at check-in.</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-xl">📱</span>
            <div>
              <p className="font-medium text-ink-900">Local Payments</p>
              <p className="text-ink-600 text-sm">Pay with M-Pesa, Stripe, or card — whatever works for you.</p>
            </div>
          </li>
        </ul>
      </section>

      {/* Location */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold text-ink-900 mb-4">Where We Are</h2>
        <p className="text-ink-700 leading-relaxed">
          ndotoni Stays is built from Dar es Salaam, Tanzania. We currently serve
          properties in Dar es Salaam, Arusha, Zanzibar, Morogoro, Mwanza, and more
          regions across the country.
        </p>
      </section>

      {/* Contact */}
      <section className="rounded-xl bg-ink-50 p-8 text-center">
        <h2 className="text-2xl font-semibold text-ink-900 mb-2">Get in Touch</h2>
        <p className="text-ink-600 mb-6">
          Questions, feedback, or partnership inquiries — we&apos;d love to hear from you.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://wa.me/255790720329"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-green-600 px-6 py-3 text-white font-medium hover:bg-green-700 transition-colors"
          >
            💬 WhatsApp Us
          </a>
          <a
            href="mailto:info@ndotoni.com"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-ink-900 px-6 py-3 text-white font-medium hover:bg-ink-800 transition-colors"
          >
            ✉️ info@ndotoni.com
          </a>
        </div>
      </section>
    </div>
  );
}

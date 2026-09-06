import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | ndotoni Stays',
  description: 'Read the terms and conditions for using ndotoni Stays, Tanzania\'s short-term stays platform.',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-ink-50 py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-ink-100 p-8 md:p-12">
          <h1 className="text-4xl font-bold text-ink-900 mb-4">Terms of Service</h1>
          <p className="text-sm text-ink-500 mb-8">Last updated: September 5, 2026</p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-ink-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-ink-700 mb-4">
                By accessing and using ndotoni Stays ("the Platform"), you accept and agree to be bound
                by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not
                use our services.
              </p>
              <p className="text-ink-700 mb-4">
                These Terms constitute a legally binding agreement between you and Ndotoni Technologies
                Limited ("Ndotoni", "we", "us", or "our"), a private limited company registered in Tanzania.
              </p>
              <p className="text-ink-700 mb-4">
                Ndotoni Technologies Limited operates two platforms. These Terms govern your use of{' '}
                <strong>ndotonistays.com</strong>, our short-term stays platform for hosts and guests. Our
                long-term rental platform, <strong>ndotoni.com</strong>, is governed by its own{' '}
                <a href="https://www.ndotoni.com/terms" className="text-brand-600 hover:underline">Terms of Service</a>.
                If you use both platforms, the terms for each apply to your use of that platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-ink-900 mb-4">2. Description of Service</h2>
              <p className="text-ink-700 mb-4">
                ndotoni Stays is an online platform that connects property owners ("hosts") with people
                seeking short-term accommodation ("guests") across Tanzania. We provide:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-ink-700">
                <li>Listing and search for nightly stays, party venues, photoshoot locations, and event spaces</li>
                <li>Instant booking — confirmed immediately, without waiting for host approval</li>
                <li>Messaging and WhatsApp-based communication between hosts and guests</li>
                <li>Booking and payment processing services</li>
                <li>Check-in instructions, house rules, and property management tools for hosts</li>
                <li>User profiles, reviews, and ratings</li>
              </ul>
              <p className="text-ink-700 mt-4">
                Ndotoni acts as an intermediary platform and is not a party to the booking agreement
                between a host and a guest. Long-term rentals (leases, monthly/annual tenancies) are
                handled separately by ndotoni.com.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-ink-900 mb-4">3. Eligibility and Account Registration</h2>

              <h3 className="text-xl font-semibold text-ink-900 mb-3">3.1 Eligibility</h3>
              <p className="text-ink-700 mb-4">To use ndotoni Stays, you must:</p>
              <ul className="list-disc pl-6 space-y-2 text-ink-700 mb-4">
                <li>Be at least 18 years old</li>
                <li>Have the legal capacity to enter into binding contracts</li>
                <li>Not be prohibited from using the service under applicable laws</li>
                <li>Provide accurate and complete registration information</li>
              </ul>

              <h3 className="text-xl font-semibold text-ink-900 mb-3">3.2 Account Security</h3>
              <p className="text-ink-700 mb-4">You are responsible for:</p>
              <ul className="list-disc pl-6 space-y-2 text-ink-700">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized access</li>
                <li>Ensuring your account information is accurate and up-to-date</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-ink-900 mb-4">4. User Responsibilities</h2>

              <h3 className="text-xl font-semibold text-ink-900 mb-3">4.1 For Hosts</h3>
              <p className="text-ink-700 mb-4">As a host, you agree to:</p>
              <ul className="list-disc pl-6 space-y-2 text-ink-700 mb-4">
                <li>Provide accurate and complete listing information, including pricing, house rules, and check-in instructions</li>
                <li>Upload genuine, recent photos of your property</li>
                <li>Honor confirmed bookings — because bookings are instant, you agree not to cancel except for genuine reasons</li>
                <li>Set a clear cancellation policy (Flexible, Moderate, or Strict) for each listing and honor it consistently</li>
                <li>Maintain your property in a safe, clean, and habitable condition</li>
                <li>Disclose any known defects, restrictions, or issues with the property</li>
                <li>Respond to guest inquiries in a timely manner</li>
                <li>Comply with all local short-term-rental laws, permits, and tax obligations that apply to you</li>
                <li>Not discriminate against guests based on protected characteristics</li>
              </ul>

              <h3 className="text-xl font-semibold text-ink-900 mb-3">4.2 For Guests</h3>
              <p className="text-ink-700 mb-4">As a guest, you agree to:</p>
              <ul className="list-disc pl-6 space-y-2 text-ink-700">
                <li>Provide accurate information when booking</li>
                <li>Review and accept the host's house rules and cancellation policy before booking</li>
                <li>Respect the property, its neighbors, and any occupancy or noise limits</li>
                <li>Report any issues or damages to the host and to Ndotoni promptly</li>
                <li>Use the property only for the purpose booked (e.g. not exceeding the agreed guest count)</li>
                <li>Leave the property in the condition you found it</li>
                <li>Pay all amounts due, including the nightly rate, any cleaning fee, and the service fee</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-ink-900 mb-4">5. Prohibited Activities</h2>
              <p className="text-ink-700 mb-4">You may not:</p>
              <ul className="list-disc pl-6 space-y-2 text-ink-700">
                <li>Post false, misleading, or fraudulent information</li>
                <li>Harass, abuse, threaten, or harm other users</li>
                <li>Use the platform for any illegal activity, including hosting events prohibited by local law</li>
                <li>Attempt to circumvent payment systems, fees, or the booking process (e.g. arranging payment off-platform to avoid fees)</li>
                <li>Scrape, copy, or download content without permission</li>
                <li>Impersonate others or create fake accounts</li>
                <li>Spam or send unsolicited messages</li>
                <li>Upload malicious code or interfere with the platform's operation or security</li>
                <li>Use automated systems (bots) without authorization</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-ink-900 mb-4">6. Payments and Fees</h2>

              <h3 className="text-xl font-semibold text-ink-900 mb-3">6.1 Service Fees</h3>
              <p className="text-ink-700 mb-4">
                Guests pay the nightly rate, any cleaning fee set by the host, and a service fee (shown
                as a percentage of the subtotal before you confirm a booking). All fees are disclosed
                upfront — nothing is added at check-in. Ndotoni does not currently charge hosts a
                commission to list or accept bookings, but we may introduce host-side fees in the
                future with prior notice.
              </p>

              <h3 className="text-xl font-semibold text-ink-900 mb-3">6.2 Payment Processing</h3>
              <p className="text-ink-700 mb-4">
                Payments are processed securely through third-party providers, including M-Pesa and
                Stripe. You agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-ink-700">
                <li>Provide accurate payment information</li>
                <li>Pay all amounts when due</li>
                <li>Comply with the payment provider's terms</li>
                <li>Be responsible for any payment processing fees</li>
              </ul>

              <h3 className="text-xl font-semibold text-ink-900 mb-3 mt-4">6.3 Host Payouts</h3>
              <p className="text-ink-700 mb-4">
                Hosts receive payouts for completed bookings via the payout method they set up in their
                host dashboard. Payout timing and method may vary and are subject to verification checks.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-ink-900 mb-4">7. Cancellations and Refunds</h2>
              <p className="text-ink-700 mb-4">
                Each listing has a cancellation policy set by the host — Flexible, Moderate, or Strict.
                The specific policy for a property is shown before you book, and by booking you agree to
                it. Because bookings are confirmed instantly, please review the cancellation policy
                carefully before confirming.
              </p>
              <p className="text-ink-700 mb-4">
                Refunds are calculated according to the applicable cancellation policy. Ndotoni is not
                responsible for issuing refunds outside of that policy but may assist in resolving
                disputes between hosts and guests.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-ink-900 mb-4">8. Content and Intellectual Property</h2>

              <h3 className="text-xl font-semibold text-ink-900 mb-3">8.1 Ndotoni's Content</h3>
              <p className="text-ink-700 mb-4">
                All content on ndotoni Stays (logos, text, graphics, software, design) is owned by
                Ndotoni or its licensors and protected by intellectual property laws. You may not use
                our intellectual property without written permission.
              </p>

              <h3 className="text-xl font-semibold text-ink-900 mb-3">8.2 User Content</h3>
              <p className="text-ink-700 mb-4">
                You retain ownership of content you post (listings, photos, reviews). By posting content,
                you grant Ndotoni a non-exclusive, worldwide, royalty-free license to use, display, and
                distribute your content on the platform.
              </p>
              <p className="text-ink-700 mb-4">
                You represent that you have the right to post your content and that it doesn't violate
                any third-party rights.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-ink-900 mb-4">9. Reviews and Ratings</h2>
              <p className="text-ink-700 mb-4">
                Hosts and guests may leave reviews and ratings about each other after a stay. Reviews must be:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-ink-700">
                <li>Based on genuine experiences</li>
                <li>Honest and factual</li>
                <li>Respectful and not defamatory</li>
                <li>Free from conflicts of interest</li>
              </ul>
              <p className="text-ink-700 mt-4">
                Ndotoni reserves the right to remove reviews that violate these guidelines.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-ink-900 mb-4">10. Disclaimer of Warranties</h2>
              <p className="text-ink-700 mb-4">
                ndotoni Stays is provided "as is" and "as available" without warranties of any kind,
                either express or implied. We do not guarantee:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-ink-700">
                <li>Accuracy or completeness of listings</li>
                <li>Availability of a specific property</li>
                <li>Quality or condition of a property</li>
                <li>Behavior or reliability of other users</li>
                <li>Uninterrupted or error-free service</li>
                <li>Security of data transmission</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-ink-900 mb-4">11. Limitation of Liability</h2>
              <p className="text-ink-700 mb-4">
                To the maximum extent permitted by law, Ndotoni shall not be liable for any indirect,
                incidental, special, consequential, or punitive damages, including but not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-ink-700">
                <li>Loss of profits, revenue, or data</li>
                <li>Property damage or personal injury occurring at a listed property</li>
                <li>Disputes between hosts and guests</li>
                <li>Unauthorized access to your account</li>
                <li>Errors or omissions in content</li>
                <li>Service interruptions or delays</li>
              </ul>
              <p className="text-ink-700 mt-4">
                Our total liability shall not exceed the amount you paid to Ndotoni in the 12 months
                preceding the claim.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-ink-900 mb-4">12. Indemnification</h2>
              <p className="text-ink-700 mb-4">
                You agree to indemnify and hold harmless Ndotoni, its officers, directors, employees,
                and agents from any claims, damages, losses, or expenses arising from:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-ink-700">
                <li>Your use of the platform</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any rights of another party</li>
                <li>Your content, listing, or booking</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-ink-900 mb-4">13. Termination</h2>
              <p className="text-ink-700 mb-4">
                We may suspend or terminate your account at any time if you:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-ink-700 mb-4">
                <li>Violate these Terms</li>
                <li>Engage in fraudulent or illegal activities</li>
                <li>Harm other users or the platform</li>
                <li>Fail to pay fees when due</li>
              </ul>
              <p className="text-ink-700 mb-4">
                You may also delete your account at any time through account settings. Upon termination:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-ink-700">
                <li>Your access to the platform will be revoked</li>
                <li>Your listings will be removed</li>
                <li>Outstanding obligations (including confirmed, unfulfilled bookings) remain in effect</li>
                <li>Certain provisions of these Terms survive termination</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-ink-900 mb-4">14. Dispute Resolution</h2>
              <p className="text-ink-700 mb-4">
                If you have a dispute with another user (for example, a damage claim or a disagreement
                about a cancellation), you agree to first attempt to resolve it directly with that user.
                Ndotoni may provide assistance but is not obligated to do so.
              </p>
              <p className="text-ink-700 mb-4">
                For disputes with Ndotoni, you agree to first attempt informal resolution by contacting
                us at info@ndotoni.com.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-ink-900 mb-4">15. Governing Law and Jurisdiction</h2>
              <p className="text-ink-700 mb-4">
                These Terms are governed by the laws of the United Republic of Tanzania. Any disputes
                shall be resolved in the courts of Tanzania.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-ink-900 mb-4">16. Changes to Terms</h2>
              <p className="text-ink-700 mb-4">
                We may update these Terms from time to time. We will notify you of significant changes
                via email or a prominent notice on the platform. Your continued use of ndotoni Stays
                after changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-ink-900 mb-4">17. Severability</h2>
              <p className="text-ink-700 mb-4">
                If any provision of these Terms is found to be invalid or unenforceable, the remaining
                provisions shall continue in full force and effect.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-ink-900 mb-4">18. Entire Agreement</h2>
              <p className="text-ink-700 mb-4">
                These Terms constitute the entire agreement between you and Ndotoni regarding your use
                of ndotoni Stays.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-ink-900 mb-4">19. Business Information</h2>
              <p className="text-ink-700 mb-4">
                Ndotoni is operated by a legally registered company in Tanzania, operating with full
                compliance to local regulations and business standards. Ndotoni Technologies Limited
                operates both ndotonistays.com (short-term stays) and ndotoni.com (long-term rentals).
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-ink-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-ink-500 mb-2">Legal Business Name</h3>
                  <p className="text-lg font-semibold text-ink-900">NDOTONI TECHNOLOGIES LIMITED</p>
                </div>
                <div className="bg-ink-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-ink-500 mb-2">Company Type</h3>
                  <p className="text-lg font-semibold text-ink-900">Private Limited Company</p>
                </div>
              </div>

              <div className="bg-ink-50 p-4 rounded-lg mb-4">
                <h3 className="text-sm font-medium text-ink-500 mb-2">Principal Place of Business</h3>
                <p className="text-ink-700">
                  Wazo Hill, Kunduchi Ward<br />
                  Kinondoni District, Dar es Salaam<br />
                  P.O. Box 14125<br />
                  Tanzania
                </p>
              </div>

              <div className="bg-ink-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-ink-500 mb-2">Director</h3>
                <p className="text-lg font-semibold text-ink-900">Adam Nzinza</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-ink-900 mb-4">20. Host Listing Service</h2>
              <p className="text-ink-700 mb-4">
                By listing your property with ndotoni Stays, you agree to the following:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-ink-700 mb-4">
                <li>Bookings on your listing are instant — a guest's booking is confirmed automatically, without a host approval step</li>
                <li>You set your own nightly rate, cleaning fee, minimum stay, house rules, check-in instructions, and cancellation policy</li>
                <li>Ndotoni earns revenue by charging guests a service fee. Hosts are not currently charged a commission to list or host</li>
                <li>You confirm that you are the legal owner or an authorized manager of the property being listed</li>
                <li>You agree to keep your listing's availability, pricing, and condition accurate and up to date</li>
                <li>You are responsible for complying with any local permits, licensing, or tax obligations that apply to short-term rentals in your area</li>
                <li>You may connect a WhatsApp number to your listing so guests can reach you directly; you are responsible for responding through that channel</li>
                <li>You may remove your listing at any time from your host dashboard</li>
                <li>Ndotoni does not guarantee a minimum level of bookings or occupancy</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-ink-900 mb-4">21. Contact Us</h2>
              <p className="text-ink-700 mb-4">
                If you have questions about these Terms:
              </p>
              <div className="bg-ink-50 p-4 rounded-lg">
                <p className="text-ink-700"><strong>Email:</strong> <a href="mailto:info@ndotoni.com" className="text-brand-600 hover:underline">info@ndotoni.com</a></p>
                <p className="text-ink-700"><strong>Phone/WhatsApp:</strong> <a href="tel:+255790720329" className="text-brand-600 hover:underline">+255 790 720 329</a></p>
                <p className="text-ink-700 mt-2">
                  <strong>Address:</strong><br />
                  NDOTONI TECHNOLOGIES LIMITED<br />
                  Wazo Hill, Kunduchi Ward<br />
                  Kinondoni District, Dar es Salaam<br />
                  P.O. Box 14125<br />
                  Tanzania
                </p>
              </div>
            </section>

            <div className="bg-brand-50 border-l-4 border-brand-500 p-4 mt-8">
              <p className="text-sm text-ink-700">
                <strong>Note:</strong> By using ndotoni Stays, you acknowledge that you have read,
                understood, and agree to be bound by these Terms of Service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

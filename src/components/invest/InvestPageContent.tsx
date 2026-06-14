'use client';

import { useState } from 'react';
import {
  ArrowRight,
  Mail,
  FileText,
  CheckCircle2,
  ExternalLink,
  CreditCard,
  Smartphone,
  Shield,
  Target,
  Globe,
  Calendar,
  Camera,
  Zap,
} from 'lucide-react';

const STRIPE_LINKS: Record<number, string> = {
  50: 'https://buy.stripe.com/dRm14mcL1cBzbZi67FcQU00',
  100: 'https://buy.stripe.com/3cIdR85iz453d3m67FcQU01',
  300: 'https://buy.stripe.com/aFa6oGbGX597fbuanVcQU02',
  500: 'https://buy.stripe.com/cNi9AS4ev1WV7J22VtcQU03',
  1000: 'https://buy.stripe.com/5kQ3cucL1eJH4wQcw3cQU04',
};

const MPESA_NUMBER = '+255 782 267 121';

const TEAM = [
  { name: 'Emmanuel Makoye', role: 'Founder & CEO', bio: 'Oversees all Ndotoni activities and builds the platform.', company: 'Software Engineer at Amazon, Seattle', education: "BS Computer Science, Case Western Reserve University '25", initials: 'EM', grad: 'from-brand-500 to-emerald-600', image: null as string | null, linkedin: 'https://www.linkedin.com/in/emmanuel-makoye-63a7611b7/', email: 'makoye224@gmail.com' },
  { name: 'Robinson Jackson', role: 'COO', bio: 'Operations, coordination, customer oversight', company: null as string | null, education: null as string | null, initials: 'RJ', grad: 'from-blue-500 to-indigo-600', image: null as string | null, linkedin: null as string | null, email: null as string | null },
  { name: 'Akil Khatri', role: 'Development', bio: 'Referral systems, fraud prevention, tracking', company: null as string | null, education: null as string | null, initials: 'AK', grad: 'from-cyan-500 to-blue-600', image: null as string | null, linkedin: null as string | null, email: null as string | null },
  { name: 'Adam Nzinza', role: 'Marketing', bio: 'Content, distribution, demand generation', company: null as string | null, education: null as string | null, initials: 'AN', grad: 'from-purple-500 to-pink-600', image: null as string | null, linkedin: null as string | null, email: null as string | null },
  { name: 'Paul Lukindo', role: 'Marketing', bio: 'Social media, university outreach', company: null as string | null, education: null as string | null, initials: 'PL', grad: 'from-teal-500 to-emerald-600', image: null as string | null, linkedin: null as string | null, email: null as string | null },
  { name: 'Raymond Maohei', role: 'Customer Relations', bio: 'Lead conversion, landlord onboarding', company: null as string | null, education: null as string | null, initials: 'RM', grad: 'from-orange-500 to-red-600', image: null as string | null, linkedin: null as string | null, email: null as string | null },
  { name: 'Kelvin Makoye', role: 'Customer Relations', bio: 'Landlord engagement, follow-ups', company: null as string | null, education: null as string | null, initials: 'KM', grad: 'from-rose-500 to-pink-600', image: null as string | null, linkedin: null as string | null, email: null as string | null },
  { name: 'Japhet Kabegeje', role: 'Customer Relations', bio: 'Agent onboarding, pipeline management', company: null as string | null, education: null as string | null, initials: 'JK', grad: 'from-amber-500 to-orange-600', image: null as string | null, linkedin: null as string | null, email: null as string | null },
];

export function InvestPageContent() {
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleContact = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent('Investment Inquiry – Ndotoni Stays');
    const body = encodeURIComponent(`Name: ${contactForm.name}\nEmail: ${contactForm.email}\n\n${contactForm.message}`);
    window.open(`mailto:invest@ndotoni.com?subject=${subject}&body=${body}`, '_blank');
    setFormSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-white py-20 sm:py-28 border-b border-gray-100">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-50 rounded-full blur-3xl opacity-40 translate-y-1/2 -translate-x-1/3" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-100 rounded-full px-4 py-1.5 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
            </span>
            <span className="text-sm text-brand-700 font-medium">Seed Round Open</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight">
            Invest in Ndotoni Stays
          </h1>
          <p className="mt-5 text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
            Tanzania has no local Airbnb. We&apos;re building the platform for nightly stays, events, and experiences — and it&apos;s already live.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4 max-w-sm mx-auto">
            <div><div className="text-2xl sm:text-3xl font-bold text-gray-900">$200K</div><div className="text-xs text-gray-400 mt-1">Raising</div></div>
            <div className="border-x border-gray-200"><div className="text-2xl sm:text-3xl font-bold text-gray-900">10–20%</div><div className="text-xs text-gray-400 mt-1">Equity</div></div>
            <div><div className="text-2xl sm:text-3xl font-bold text-gray-900">18mo</div><div className="text-xs text-gray-400 mt-1">Runway</div></div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="#back-us" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-brand-600 text-white font-bold hover:bg-brand-700 hover:shadow-lg hover:scale-[1.02] transition-all">
              Back Us Now <ArrowRight size={16} strokeWidth={2.5} />
            </a>
            <a href="#why" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all">Why Ndotoni Stays</a>
            <a href="#pitch-deck" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all"><FileText size={15} strokeWidth={2} /> Deck</a>
          </div>
        </div>
      </section>

      {/* ===== BACK US ===== */}
      <section id="back-us" className="py-12 sm:py-16 max-w-xl mx-auto px-4 sm:px-6">
        <div className="rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-1">Back Us</h2>
          <p className="text-sm text-gray-500 text-center mb-6">Card, Apple Pay, Google Pay, or M-Pesa.</p>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-5">
            {[50, 100, 300, 500, 1000].map((amt) => (
              <a key={amt} href={STRIPE_LINKS[amt]} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center py-3.5 rounded-lg border border-gray-200 hover:border-gray-900 hover:bg-gray-50 transition-all">
                <span className="text-base font-bold text-gray-900">${amt}</span>
              </a>
            ))}
          </div>

          <a href={STRIPE_LINKS[100]} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm transition-all mb-5">
            <CreditCard size={16} strokeWidth={2} /> Pay with Card / Apple Pay / Google Pay
          </a>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-200" /><span className="text-xs text-gray-400 font-medium">OR</span><div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-4 border border-gray-100">
            <Smartphone size={20} className="text-brand-600 flex-shrink-0" strokeWidth={1.75} />
            <div>
              <p className="text-sm font-bold text-gray-900">M-Pesa</p>
              <p className="text-base font-bold text-gray-900">{MPESA_NUMBER}</p>
              <p className="text-xs text-gray-500">Send any amount · Kelvin Makoye</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 text-center mt-5">🔒 Secure payments via Stripe</p>
        </div>

        <div className="mt-5 flex items-center justify-center gap-4 text-sm">
          <a href="#why" className="text-gray-500 hover:text-gray-900 font-medium transition-colors">Why invest? ↓</a>
          <a href="#pitch-deck" className="text-gray-500 hover:text-gray-900 font-medium transition-colors">Pitch Deck ↓</a>
          <a href="https://wa.me/255782267121?text=Hi%2C%20I'm%20interested%20in%20investing%20in%20Ndotoni%20Stays" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900 font-medium transition-colors">WhatsApp →</a>
        </div>
      </section>

      {/* ===== WHY ===== */}
      <section id="why" className="py-16 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">The Problem</h2>
          <p className="text-gray-500 text-center max-w-2xl mx-auto mb-10">
            No reliable way to book short-term stays in Tanzania. Travelers rely on Instagram DMs, personal contacts, and WhatsApp. No instant booking, no reviews, no accountability.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: Shield, title: 'No Trust', text: 'No way to verify before paying. Scams common. Photos don\'t match.' },
              { icon: Target, title: 'No Platform', text: 'No local Airbnb. International platforms don\'t serve Tanzania well.' },
              { icon: Globe, title: 'Growing Demand', text: '1.5M+ tourists/year, booming domestic travel, young population.' },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-gray-100 p-5">
                <item.icon size={20} className="text-gray-400 mb-3" strokeWidth={1.75} />
                <h3 className="font-bold text-gray-900 mb-1.5">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SOLUTION ===== */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">Our Solution</h2>
          <p className="text-gray-500 text-center max-w-2xl mx-auto mb-8">
            Ndotoni Stays — a booking platform for nightly stays, party venues, photoshoot locations, and event spaces. Instant booking, online payments, verified hosts.
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-10">
            {[{ icon: Calendar, text: 'Instant booking' }, { icon: Camera, text: 'Verified photos' }, { icon: Zap, text: 'Stays + events' }].map((item) => (
              <div key={item.text} className="flex flex-col items-center text-center p-4 rounded-xl border border-gray-200 bg-white">
                <item.icon size={20} className="text-gray-600 mb-2" strokeWidth={1.75} />
                <p className="text-xs text-gray-700 font-medium">{item.text}</p>
              </div>
            ))}
          </div>
          <h3 className="font-bold text-gray-900 mb-4">Already Live</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {['ndotonistays.com — live', 'Instant booking + calendar', 'Stripe + M-Pesa payments', 'Host dashboard + earnings', 'Guest reviews & ratings', 'WhatsApp notifications', 'Property verification', 'Mobile-responsive'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle2 size={13} className="text-brand-500 flex-shrink-0" strokeWidth={2} />{item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MARKET ===== */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8">Market</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[{ s: '65M+', l: 'Population' }, { s: '1.5M+', l: 'Tourists/year' }, { s: '$0', l: 'Local competitor' }, { s: '20%+', l: 'Internet growth YoY' }].map((item) => (
              <div key={item.l} className="rounded-xl border border-gray-200 p-4 text-center">
                <div className="text-xl font-bold text-gray-900">{item.s}</div>
                <div className="text-xs text-gray-500 mt-1">{item.l}</div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 text-center max-w-lg mx-auto">Zanzibar alone draws 500K+ visitors. Domestic tourism booming. No dominant local booking platform.</p>
        </div>
      </section>

      {/* ===== USE OF FUNDS ===== */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8">Use of Funds</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[{ t: 'Host Acquisition', a: '$80K', p: '40%' }, { t: 'Marketing', a: '$50K', p: '25%' }, { t: 'Product', a: '$40K', p: '20%' }, { t: 'Operations', a: '$30K', p: '15%' }].map((f) => (
              <div key={f.t} className="rounded-xl border border-gray-200 bg-white p-4 text-center">
                <div className="text-xl font-bold text-gray-900">{f.a}</div>
                <div className="text-xs text-gray-500 mt-1">{f.t}</div>
                <div className="text-xs text-gray-400">{f.p}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TEAM ===== */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">Team</h2>
          <p className="text-gray-500 text-center max-w-lg mx-auto mb-10">8 people based in Tanzania and the US. Builders, marketers, operators.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {TEAM.map((m) => (
              <div key={m.name} className="rounded-xl border border-gray-200 bg-white p-4 text-center">
                {m.image ? (
                  <img src={m.image} alt={m.name} className="w-14 h-14 mx-auto rounded-full object-cover mb-2" />
                ) : (
                  <div className={`w-14 h-14 mx-auto rounded-full bg-gradient-to-br ${m.grad} flex items-center justify-center text-white text-sm font-bold mb-2`}>{m.initials}</div>
                )}
                <p className="text-sm font-bold text-gray-900 leading-tight">{m.name}</p>
                <p className="text-xs text-brand-600 font-medium mt-0.5">{m.role}</p>
                <p className="text-xs text-gray-500 mt-1 leading-snug">{m.bio}</p>
                {m.company && <p className="text-xs text-gray-600 mt-1 font-medium">{m.company}</p>}
                {m.education && <p className="text-xs text-gray-400 mt-0.5">{m.education}</p>}
                {(m.linkedin || m.email) && (
                  <div className="mt-2 flex items-center justify-center gap-2">
                    {m.linkedin && <a href={m.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 transition-colors" aria-label="LinkedIn"><svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>}
                    {m.email && <a href={`mailto:${m.email}`} className="text-gray-400 hover:text-gray-900 transition-colors" aria-label="Email"><Mail size={13} strokeWidth={2} /></a>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PITCH DECK ===== */}
      <section id="pitch-deck" className="py-14 bg-gray-50 text-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Pitch Deck</h2>
          <p className="text-sm text-gray-500 mb-5">Market, model, traction, roadmap.</p>
          <a href="https://docs.google.com/presentation/d/YOUR_PITCH_DECK_ID/view" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm transition-all">
            <ExternalLink size={15} strokeWidth={2.5} /> View Pitch Deck
          </a>
          <p className="text-xs text-gray-400 mt-3">Or email invest@ndotoni.com</p>
        </div>
      </section>

      {/* ===== CONTACT ===== */}
      <section className="py-14">
        <div className="max-w-md mx-auto px-4 sm:px-6">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-6">Questions?</h2>
          {formSubmitted ? (
            <div className="text-center py-6">
              <CheckCircle2 size={32} className="text-brand-500 mx-auto mb-3" strokeWidth={1.5} />
              <p className="font-bold text-gray-900">Sent!</p>
              <p className="text-sm text-gray-500 mt-1">We&apos;ll reply within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleContact} className="space-y-3">
              <input type="text" required value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900 outline-none" placeholder="Name" aria-label="Name" />
              <input type="email" required value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900 outline-none" placeholder="Email" aria-label="Email" />
              <textarea rows={3} required value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })} className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900 outline-none resize-none" placeholder="Your message..." aria-label="Message" />
              <button type="submit" className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gray-900 text-white font-bold text-sm hover:bg-gray-800 transition-colors">
                <Mail size={14} strokeWidth={2.5} /> Send
              </button>
            </form>
          )}
          <div className="mt-6 text-center text-sm text-gray-500">
            <a href="mailto:invest@ndotoni.com" className="hover:text-gray-900 font-medium transition-colors">invest@ndotoni.com</a>
            <span className="mx-2">·</span>
            <a href="https://wa.me/255782267121?text=Hi%2C%20I'm%20interested%20in%20investing%20in%20Ndotoni%20Stays" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 font-medium transition-colors">WhatsApp →</a>
          </div>
        </div>
      </section>

      <footer className="py-6 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-400">Ndotoni Online Traders · Registered in Tanzania · ndotonistays.com</p>
      </footer>
    </div>
  );
}

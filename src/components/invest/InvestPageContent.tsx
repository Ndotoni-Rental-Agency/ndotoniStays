'use client';

import { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Users,
  Eye,
  MessageSquare,
  ShieldCheck,
  Search,
  Banknote,
  TrendingUp,
  Building2,
  Globe,
  BarChart3,
  Target,
  Megaphone,
  Code,
  Handshake,
  Linkedin,
  Mail,
  Send,
  FileText,
  Phone,
  Wifi,
  Camera,
  CreditCard,
  LayoutDashboard,
} from 'lucide-react';

// ─── DATA ────────────────────────────────────────────────────────────────────

const STRIPE_LINKS: Record<number, string> = {
  50: 'https://buy.stripe.com/dRm14mcL1cBzbZi67FcQU00',
  100: 'https://buy.stripe.com/3cIdR85iz453d3m67FcQU01',
  300: 'https://buy.stripe.com/aFa6oGbGX597fbuanVcQU02',
  500: 'https://buy.stripe.com/cNi9AS4ev1WV7J22VtcQU03',
  1000: 'https://buy.stripe.com/5kQ3cucL1eJH4wQcw3cQU04',
};

const MPESA_NUMBER = '+255 782 267 121';

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  initials: string;
  gradient: string;
  company: string | null;
  education: string | null;
  linkedin: string | null;
  email: string | null;
  image: string | null;
}

const TEAM: TeamMember[] = [
  {
    name: 'Emmanuel Makoye',
    role: 'Founder & CEO',
    bio: 'Oversees all Ndotoni activities and builds the platform.',
    initials: 'EM',
    gradient: 'from-brand-500 to-emerald-600',
    company: 'Software Engineer at Amazon, Seattle',
    education: "BS Computer Science, Case Western Reserve University '25",
    linkedin: 'https://www.linkedin.com/in/emmanuel-makoye-63a7611b7/',
    email: 'makoye224@gmail.com',
    image: null,
  },
  {
    name: 'Robinson Jackson',
    role: 'COO',
    bio: 'Operations, coordination, customer oversight',
    initials: 'RJ',
    gradient: 'from-blue-500 to-indigo-600',
    company: null,
    education: null,
    linkedin: null,
    email: null,
    image: null,
  },
  {
    name: 'Akil Khatri',
    role: 'Development',
    bio: 'Referral systems, fraud prevention, tracking',
    initials: 'AK',
    gradient: 'from-cyan-500 to-blue-600',
    company: null,
    education: null,
    linkedin: null,
    email: null,
    image: null,
  },
  {
    name: 'Adam Nzinza',
    role: 'Marketing',
    bio: 'Content, distribution, demand generation',
    initials: 'AN',
    gradient: 'from-purple-500 to-pink-600',
    company: null,
    education: null,
    linkedin: null,
    email: null,
    image: null,
  },
  {
    name: 'Paul Lukindo',
    role: 'Marketing',
    bio: 'Social media, university outreach',
    initials: 'PL',
    gradient: 'from-teal-500 to-emerald-600',
    company: null,
    education: null,
    linkedin: null,
    email: null,
    image: null,
  },
  {
    name: 'Raymond Maohei',
    role: 'Customer Relations',
    bio: 'Lead conversion, landlord onboarding',
    initials: 'RM',
    gradient: 'from-orange-500 to-red-600',
    company: null,
    education: null,
    linkedin: null,
    email: null,
    image: null,
  },
  {
    name: 'Kelvin Makoye',
    role: 'Customer Relations',
    bio: 'Landlord engagement, follow-ups',
    initials: 'KM',
    gradient: 'from-rose-500 to-pink-600',
    company: null,
    education: null,
    linkedin: null,
    email: null,
    image: null,
  },
  {
    name: 'Japhet Kabegeje',
    role: 'Customer Relations',
    bio: 'Agent onboarding, pipeline management',
    initials: 'JK',
    gradient: 'from-amber-500 to-orange-600',
    company: null,
    education: null,
    linkedin: null,
    email: null,
    image: null,
  },
];

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export function InvestPageContent() {
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Investment Inquiry from ${contactForm.name}`);
    const body = encodeURIComponent(
      `Name: ${contactForm.name}\nEmail: ${contactForm.email}\n\n${contactForm.message}`
    );
    window.location.href = `mailto:makoye224@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-white text-ink-900">
      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white px-6 py-24 sm:py-32">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-brand-50 opacity-60 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-brand-50 opacity-40 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700">
            <TrendingUp className="h-4 w-4" />
            Pre-Seed Round Open
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Invest in <span className="text-brand-600">Ndotoni Stays</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-ink-500 sm:text-xl">
            Tanzania has no local Airbnb. We&apos;re building the platform for short-term stays —
            serving <span className="font-semibold text-secondary-500">1.5M+ tourists</span> and a growing domestic travel market.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-secondary-500">$150K</p>
              <p className="mt-1 text-sm text-ink-500">Raising</p>
            </div>
            <div className="h-10 w-px bg-ink-100" />
            <div className="text-center">
              <p className="text-3xl font-bold text-secondary-500">5%</p>
              <p className="mt-1 text-sm text-ink-500">Equity</p>
            </div>
            <div className="h-10 w-px bg-ink-100" />
            <div className="text-center">
              <p className="text-3xl font-bold text-secondary-500">18 mo</p>
              <p className="mt-1 text-sm text-ink-500">Runway</p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href="#back-us"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-700"
            >
              Back Us Now
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#pitch-deck"
              className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-6 py-3 text-base font-semibold text-ink-700 transition hover:bg-ink-50"
            >
              View Pitch Deck
            </a>
          </div>
        </div>
      </section>

      {/* ─── BACK US ──────────────────────────────────────────────────────── */}
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
                <span className="text-lg font-semibold text-brand-700">{MPESA_NUMBER}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── THE PROBLEM ──────────────────────────────────────────────────── */}
      <section className="overflow-hidden bg-ink-50 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold">The Problem</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-ink-500">
            Short-term stays in Tanzania are fragmented, untrusted, and hard to book.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: 'No Trust',
                description: 'Guests can\'t verify properties before booking. Scams and misrepresentation are common.',
              },
              {
                icon: Globe,
                title: 'No Local Platform',
                description: 'No Tanzanian-built alternative to Airbnb. International platforms miss local supply and payment methods.',
              },
              {
                icon: TrendingUp,
                title: 'Growing Demand',
                description: '1.5M+ tourists yearly, rising domestic travel, and zero local tech serving the short-stay market.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary-50">
                  <item.icon className="h-6 w-6 text-secondary-500" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-ink-500">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── OUR SOLUTION ─────────────────────────────────────────────────── */}
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

      {/* ─── TRACTION ─────────────────────────────────────────────────────── */}
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
                <p className="mt-3 text-3xl font-bold text-secondary-500">{item.stat}</p>
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

      {/* ─── MARKET ───────────────────────────────────────────────────────── */}
      <section className="overflow-hidden bg-white px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold">Market Opportunity</h2>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { stat: '65M', label: 'Population' },
              { stat: '1.5M+', label: 'Tourists yearly' },
              { stat: '$0', label: 'Local competitors' },
              { stat: '20%+', label: 'Internet growth YoY' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-ink-100 bg-ink-50 p-6 text-center shadow-sm">
                <p className="text-2xl font-bold text-secondary-500">{item.stat}</p>
                <p className="mt-2 text-sm text-ink-500">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── USE OF FUNDS ─────────────────────────────────────────────────── */}
      <section className="overflow-hidden bg-ink-50 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold">Use of Funds</h2>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Code, title: 'Product', pct: '40%', desc: 'Engineering, infrastructure, mobile app' },
              { icon: Megaphone, title: 'Marketing', pct: '25%', desc: 'Growth, brand, travel partnerships' },
              { icon: Handshake, title: 'Operations', pct: '20%', desc: 'Host onboarding, support, quality' },
              { icon: Target, title: 'Reserve', pct: '15%', desc: 'Legal, compliance, contingency' },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
                  <item.icon className="h-5 w-5 text-brand-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                <p className="mt-1 text-2xl font-bold text-secondary-500">{item.pct}</p>
                <p className="mt-2 text-sm text-ink-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TEAM ─────────────────────────────────────────────────────────── */}
      <section className="overflow-hidden bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold">Team</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-ink-500">
            A lean, hungry team building from Dar es Salaam and Seattle.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TEAM.map((member) => (
              <div
                key={member.name}
                className="rounded-2xl border border-ink-100 bg-ink-50 p-6 shadow-sm"
              >
                {/* Avatar */}
                <div
                  className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${member.gradient}`}
                >
                  <span className="text-lg font-bold text-white">{member.initials}</span>
                </div>

                <h3 className="mt-4 text-center text-lg font-semibold">{member.name}</h3>
                <p className="text-center text-sm font-medium text-brand-600">{member.role}</p>
                <p className="mt-3 text-center text-sm text-ink-500">{member.bio}</p>

                {member.company && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Work:</p>
                    <p className="mt-0.5 text-sm text-ink-700">{member.company}</p>
                  </div>
                )}

                {member.education && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Edu:</p>
                    <p className="mt-0.5 text-sm text-ink-700">{member.education}</p>
                  </div>
                )}

                {/* Links */}
                {(member.linkedin || member.email) && (
                  <div className="mt-4 flex items-center justify-center gap-3 border-t border-ink-100 pt-4">
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink-500 transition hover:bg-brand-50 hover:text-brand-600"
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                    )}
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink-500 transition hover:bg-brand-50 hover:text-brand-600"
                      >
                        <Mail className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PITCH DECK ───────────────────────────────────────────────────── */}
      <section id="pitch-deck" className="overflow-hidden bg-ink-50 px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold">Pitch Deck</h2>
          <p className="mt-3 text-ink-500">
            See the full story — market, product, traction, and financials.
          </p>
          <a
            href="https://docs.google.com/presentation/d/1example"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-6 py-3 text-base font-semibold text-ink-700 shadow-sm transition hover:bg-ink-50"
          >
            <FileText className="h-5 w-5" />
            Open Pitch Deck
          </a>
        </div>
      </section>

      {/* ─── CONTACT ──────────────────────────────────────────────────────── */}
      <section className="overflow-hidden bg-white px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl font-bold">Get in Touch</h2>

          <div className="mt-12 grid gap-10 sm:grid-cols-2">
            {/* Form */}
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-700">Name</label>
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700">Email</label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700">Message</label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  rows={4}
                  className="mt-1 w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  required
                />
              </div>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                Send Message
                <Send className="h-4 w-4" />
              </button>
            </form>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Quick Links</h3>
              <a
                href="mailto:makoye224@gmail.com"
                className="flex items-center gap-3 rounded-xl border border-ink-100 bg-ink-50 p-4 transition hover:border-brand-200"
              >
                <Mail className="h-5 w-5 text-brand-500" />
                <span className="text-sm font-medium text-ink-700">makoye224@gmail.com</span>
              </a>
              <a
                href="https://www.linkedin.com/in/emmanuel-makoye-63a7611b7/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-ink-100 bg-ink-50 p-4 transition hover:border-brand-200"
              >
                <Linkedin className="h-5 w-5 text-brand-500" />
                <span className="text-sm font-medium text-ink-700">LinkedIn — Emmanuel Makoye</span>
              </a>
              <a
                href="https://ndotonistays.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-ink-100 bg-ink-50 p-4 transition hover:border-brand-200"
              >
                <Globe className="h-5 w-5 text-brand-500" />
                <span className="text-sm font-medium text-ink-700">ndotonistays.com</span>
              </a>
              <a
                href={`tel:${MPESA_NUMBER.replace(/\s/g, '')}`}
                className="flex items-center gap-3 rounded-xl border border-ink-100 bg-ink-50 p-4 transition hover:border-brand-200"
              >
                <Phone className="h-5 w-5 text-brand-500" />
                <span className="text-sm font-medium text-ink-700">{MPESA_NUMBER}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="overflow-hidden border-t border-ink-100 bg-white px-6 py-6">
        <p className="text-center text-sm text-ink-400">
          © {new Date().getFullYear()} Ndotoni Stays. All rights reserved. — ndotonistays.com
        </p>
      </footer>
    </div>
  );
}

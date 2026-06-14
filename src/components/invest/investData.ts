// ─── SHARED DATA ─────────────────────────────────────────────────────────────

export const STRIPE_LINKS: Record<number, string> = {
  50: 'https://buy.stripe.com/dRm14mcL1cBzbZi67FcQU00',
  100: 'https://buy.stripe.com/3cIdR85iz453d3m67FcQU01',
  300: 'https://buy.stripe.com/aFa6oGbGX597fbuanVcQU02',
  500: 'https://buy.stripe.com/cNi9AS4ev1WV7J22VtcQU03',
  1000: 'https://buy.stripe.com/5kQ3cucL1eJH4wQcw3cQU04',
};

export const MPESA_NUMBER = '+255 782 267 121';

export interface TeamMember {
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

export const TEAM: TeamMember[] = [
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

export const PROJECTIONS_BOOKINGS = [
  { year: 'Y1', value: 500 },
  { year: 'Y2', value: 2500 },
  { year: 'Y3', value: 8000 },
  { year: 'Y4', value: 20000 },
  { year: 'Y5', value: 50000 },
];

export const PROJECTIONS_REVENUE = [
  { year: 'Y1', value: 25000 },
  { year: 'Y2', value: 125000 },
  { year: 'Y3', value: 400000 },
  { year: 'Y4', value: 1000000 },
  { year: 'Y5', value: 2500000 },
];

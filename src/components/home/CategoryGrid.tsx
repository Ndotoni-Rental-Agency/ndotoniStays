'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Moon, Waves, Binoculars, PartyPopper, Camera, Briefcase, type LucideIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const CATEGORIES: {
  id: string;
  titleKey: string;
  descKey: string;
  icon: LucideIcon;
  image: string;
  searchParams: string;
}[] = [
  {
    id: 'stays',
    titleKey: 'categories.nightlyStays',
    descKey: 'categories.nightlyStays.desc',
    icon: Moon,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600&auto=format&fit=crop',
    searchParams: 'category=NIGHTLY_STAY',
  },
  {
    id: 'beach',
    titleKey: 'categories.beach',
    descKey: 'categories.beach.desc',
    icon: Waves,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop',
    searchParams: 'category=BEACH',
  },
  {
    id: 'safari',
    titleKey: 'categories.safari',
    descKey: 'categories.safari.desc',
    icon: Binoculars,
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=600&auto=format&fit=crop',
    searchParams: 'category=SAFARI',
  },
  {
    id: 'parties',
    titleKey: 'categories.parties',
    descKey: 'categories.parties.desc',
    icon: PartyPopper,
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=600&auto=format&fit=crop',
    searchParams: 'category=PARTY',
  },
  {
    id: 'photoshoot',
    titleKey: 'categories.photoshoot',
    descKey: 'categories.photoshoot.desc',
    icon: Camera,
    image: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?q=80&w=600&auto=format&fit=crop',
    searchParams: 'category=PHOTOSHOOT',
  },
  {
    id: 'business',
    titleKey: 'categories.business',
    descKey: 'categories.business.desc',
    icon: Briefcase,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600&auto=format&fit=crop',
    searchParams: 'category=MEETING',
  },
];

export function CategoryGrid() {
  const { t } = useLanguage();

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-ink-900">
            {t('categories.title')}
          </h2>
          <p className="mt-3 text-lg text-ink-500 max-w-lg mx-auto">
            {t('categories.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/search?${cat.searchParams}`}
              className="group relative rounded-2xl overflow-hidden aspect-[3/2] sm:aspect-[4/3]"
            >
              <Image
                src={cat.image}
                alt={t(cat.titleKey)}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6">
                <cat.icon className="w-6 h-6 text-white mb-1" />
                <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-brand-300 transition-colors">
                  {t(cat.titleKey)}
                </h3>
                <p className="text-sm text-white/75 mt-0.5">
                  {t(cat.descKey)}
                </p>
              </div>
              <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Moon, Waves, Binoculars, PartyPopper, Camera, Briefcase, type LucideIcon } from 'lucide-react';
import { StayCategory } from '@/API';
import { useLanguage } from '@/contexts/LanguageContext';

const CATEGORIES: {
  id: string;
  titleKey: string;
  descKey: string;
  icon: LucideIcon;
  image: string;
  category: StayCategory;
}[] = [
  {
    id: 'stays',
    titleKey: 'categories.nightlyStays',
    descKey: 'categories.nightlyStays.desc',
    icon: Moon,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600&auto=format&fit=crop',
    category: StayCategory.NIGHTLY_STAY,
  },
  {
    id: 'beach',
    titleKey: 'categories.beach',
    descKey: 'categories.beach.desc',
    icon: Waves,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop',
    category: StayCategory.BEACH,
  },
  {
    id: 'safari',
    titleKey: 'categories.safari',
    descKey: 'categories.safari.desc',
    icon: Binoculars,
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=600&auto=format&fit=crop',
    category: StayCategory.SAFARI,
  },
  {
    id: 'parties',
    titleKey: 'categories.parties',
    descKey: 'categories.parties.desc',
    icon: PartyPopper,
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=600&auto=format&fit=crop',
    category: StayCategory.PARTY,
  },
  {
    id: 'photoshoot',
    titleKey: 'categories.photoshoot',
    descKey: 'categories.photoshoot.desc',
    icon: Camera,
    image: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?q=80&w=600&auto=format&fit=crop',
    category: StayCategory.PHOTOSHOOT,
  },
  {
    id: 'business',
    titleKey: 'categories.business',
    descKey: 'categories.business.desc',
    icon: Briefcase,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600&auto=format&fit=crop',
    category: StayCategory.MEETING,
  },
];

export function CategoryGrid({ availableCategories, searchBase }: { availableCategories: Set<StayCategory>; searchBase: string }) {
  const { t } = useLanguage();
  const visibleCategories = CATEGORIES.filter(category => availableCategories.has(category.category));
  if (!visibleCategories.length) return null;

  return (
    <section className="py-10 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink-900">
            {t('categories.title')}
          </h2>
          <p className="text-sm text-ink-500 max-w-md">
            {t('categories.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {visibleCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`${searchBase}&category=${cat.category}`}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] sm:aspect-[3/2]"
            >
              <Image
                src={cat.image}
                alt={t(cat.titleKey)}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6">
                <cat.icon className="w-6 h-6 text-white mb-1" />
                <h3 className="text-base sm:text-xl font-bold text-white group-hover:text-brand-300 transition-colors">
                  {t(cat.titleKey)}
                </h3>
                <p className="text-xs sm:text-sm text-white/80 mt-0.5">
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

'use client';

import Link from 'next/link';
import Image from 'next/image';

const CATEGORIES = [
  {
    id: 'stays',
    title: 'Nightly Stays',
    description: 'Apartments & rooms for a comfortable night',
    icon: '🏠',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600&auto=format&fit=crop',
    searchParams: 'propertyType=APARTMENT',
  },
  {
    id: 'parties',
    title: 'Parties & Events',
    description: 'Birthday venues & celebration spaces',
    icon: '🎉',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=600&auto=format&fit=crop',
    searchParams: 'propertyType=VILLA',
  },
  {
    id: 'photoshoot',
    title: 'Photoshoots',
    description: 'Beautiful backdrops for your shots',
    icon: '📸',
    image: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?q=80&w=600&auto=format&fit=crop',
    searchParams: 'propertyType=STUDIO',
  },
  {
    id: 'getaways',
    title: 'Beach & Nature',
    description: 'Coastal escapes and serene retreats',
    icon: '🌊',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop',
    searchParams: 'propertyType=COTTAGE',
  },
  {
    id: 'groups',
    title: 'Group Getaways',
    description: 'Villas & guesthouses for the crew',
    icon: '👥',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=600&auto=format&fit=crop',
    searchParams: 'propertyType=GUESTHOUSE',
  },
  {
    id: 'business',
    title: 'Work & Meetings',
    description: 'Quiet spaces for focused work',
    icon: '💼',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600&auto=format&fit=crop',
    searchParams: 'propertyType=HOTEL',
  },
];

export function CategoryGrid() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-ink-900">
            What are you looking for?
          </h2>
          <p className="mt-3 text-lg text-ink-500 max-w-lg mx-auto">
            Every space has a purpose. Find yours.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/search?${cat.searchParams}`}
              className="group relative rounded-2xl overflow-hidden aspect-[3/2] sm:aspect-[4/3]"
            >
              {/* Background image */}
              <Image
                src={cat.image}
                alt={cat.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6">
                <span className="text-2xl mb-1">{cat.icon}</span>
                <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-brand-300 transition-colors">
                  {cat.title}
                </h3>
                <p className="text-sm text-white/75 mt-0.5">
                  {cat.description}
                </p>
              </div>

              {/* Hover arrow indicator */}
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

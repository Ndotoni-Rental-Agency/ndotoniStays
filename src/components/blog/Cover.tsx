import Image from 'next/image';

type Photo = { src: string; alt: string };

// Typographic cover for posts without a dedicated photograph, so real photos are never repeated.
const PALETTES = [
  'bg-brand-800 text-white [--ring:theme(colors.brand.500)]',
  'bg-brand-50 text-brand-900 [--ring:theme(colors.brand.300)]',
  'bg-ink-900 text-white [--ring:theme(colors.brand.500)]',
];

export function Cover({ photo, label, index, sizes, priority, className = '' }: { photo?: Photo; label: string; index: number; sizes: string; priority?: boolean; className?: string }) {
  if (photo) return <div className={`relative overflow-hidden rounded-2xl bg-ink-100 ${className}`}>
    <Image src={photo.src} alt={photo.alt} fill unoptimized priority={priority} sizes={sizes} className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none" />
  </div>;
  return <div aria-hidden="true" className={`relative overflow-hidden rounded-2xl ${PALETTES[index % PALETTES.length]} ${className}`}>
    <svg className="absolute -right-10 -top-10 h-56 w-56 opacity-40 transition-transform duration-700 group-hover:rotate-12 motion-reduce:transition-none" viewBox="0 0 200 200" fill="none" stroke="var(--ring)" strokeWidth="1.5">
      {[30, 50, 70, 90].map(r => <circle key={r} cx="100" cy="100" r={r} />)}
    </svg>
    <div className="absolute inset-0 flex flex-col justify-end p-6">
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] opacity-70">ndotoni Stays</span>
      <span className="text-3xl font-bold tracking-tight sm:text-4xl">{label}</span>
    </div>
  </div>;
}

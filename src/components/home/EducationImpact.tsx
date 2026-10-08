'use client';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { educationImpact } from '@/lib/education-impact';

export function EducationImpact() {
  const { language } = useLanguage();
  const c = educationImpact[language];
  return (
    <section aria-label={c.label} className="mx-auto my-12 max-w-5xl rounded-2xl border border-green-200 bg-green-50 px-6 py-8 text-gray-900">
      <p className="text-sm font-semibold text-green-800">Ndotoni Gives</p>
      <h2 className="mt-2 text-2xl font-semibold">{c.title}</h2>
      <p className="mt-3 max-w-2xl leading-relaxed">{c.promise}</p>
      <Link href="/impact" className="mt-4 inline-block font-semibold text-green-800 underline underline-offset-4">{c.more}</Link>
    </section>
  );
}

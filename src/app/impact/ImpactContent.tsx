'use client';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { educationImpact } from '@/lib/education-impact';

export default function ImpactContent() {
  const { language } = useLanguage();
  const c = educationImpact[language];
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-green-700">Ndotoni Gives</p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight">{c.title}</h1>
      <p className="mt-6 text-xl leading-relaxed">{c.promise}</p>
      <div className="mt-12 space-y-8">
        {[[c.focusTitle, c.focus], [c.bookingTitle, c.booking], [c.givingTitle, c.giving], [c.reportTitle, c.report]].map(([title, body]) => (
          <section key={title} className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="mt-3 leading-relaxed">{body}</p>
            {title === c.givingTitle && <Link href="/donate" className="mt-4 inline-block font-semibold text-green-700 underline">{language === 'sw' ? 'Taarifa za michango' : 'Donation details'}</Link>}
          </section>
        ))}
      </div>
    </main>
  );
}

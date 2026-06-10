'use client';

import { Home, ArrowRight } from 'lucide-react';

export function LongTermBanner() {
  return (
    <section className="py-6 sm:py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="rounded-2xl bg-gradient-to-r from-brand-50 to-brand-100/50 border border-brand-200/60 p-6 sm:p-8 lg:p-10 relative overflow-hidden">
        {/* Decorative */}
        <div className="absolute top-4 right-6 w-20 h-20 rounded-full bg-brand-200/30 blur-2xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-center gap-5 sm:gap-8">
          {/* Icon */}
          <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-brand-100 flex items-center justify-center">
            <Home size={28} className="text-brand-600" strokeWidth={1.75} />
          </div>

          {/* Text */}
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-bold text-ink-900 mb-1.5">
              Unatafuta nyumba ya muda mrefu?
            </h3>
            <p className="text-ink-500 text-sm sm:text-base leading-relaxed max-w-lg">
              Pata nyumba za kupanga kwa mwezi — apartments, nyumba, vyumba, na zaidi kwenye ndotoni.
            </p>
          </div>

          {/* CTA */}
          <div className="flex-shrink-0">
            <a
              href="https://www.ndotoni.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-brand-600/20"
            >
              Tembelea ndotoni
              <ArrowRight size={16} strokeWidth={2.5} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  {
    number: '01',
    title: 'Pick your dates',
    description: 'Choose when you need the space and how many people are coming.',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Book in seconds',
    description: 'No waiting for approvals. Instant confirmation straight to your phone.',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Show up & enjoy',
    description: 'Get check-in directions on WhatsApp. Keys in hand, no hassle.',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
      </svg>
    ),
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 sm:py-24 bg-ink-50/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-600 mb-2">
            Simple as 1-2-3
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-ink-900">
            How it works
          </h2>
          <p className="mt-3 text-lg text-ink-500">
            No phone calls. No back and forth. Just book.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {STEPS.map((step, idx) => (
            <div key={step.number} className="relative text-center group">
              {/* Connector line (desktop) */}
              {idx < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-brand-200 to-brand-100" />
              )}

              {/* Icon circle */}
              <div className="relative inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-white shadow-lg shadow-brand-100/50 border border-brand-100 text-brand-600 mb-5 group-hover:shadow-xl group-hover:scale-105 transition-all">
                {step.icon}
                <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center">
                  {step.number}
                </span>
              </div>

              <h3 className="text-lg font-bold text-ink-900">{step.title}</h3>
              <p className="mt-2 text-sm text-ink-500 max-w-xs mx-auto leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

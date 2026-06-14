import { PROJECTIONS_BOOKINGS, PROJECTIONS_REVENUE } from './investData';

export function ProjectionsSection() {
  return (
    <section className="overflow-hidden bg-white px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold">Projections</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-ink-500">
          Conservative growth starting with Dar es Salaam and Zanzibar, then expanding nationally.
        </p>

        <div className="mt-12 grid gap-12 sm:grid-cols-2">
          {/* Bookings Chart */}
          <div>
            <h3 className="mb-4 text-center text-lg font-semibold">Bookings per Year</h3>
            <div className="flex items-end justify-between gap-2" style={{ height: 200 }}>
              {PROJECTIONS_BOOKINGS.map((item) => {
                const maxVal = PROJECTIONS_BOOKINGS[PROJECTIONS_BOOKINGS.length - 1].value;
                const heightPct = (item.value / maxVal) * 100;
                return (
                  <div key={item.year} className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-xs font-semibold text-ink-700">
                      {item.value >= 1000 ? `${(item.value / 1000).toFixed(0)}K` : item.value}
                    </span>
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-brand-600 to-brand-400"
                      style={{ height: `${Math.max(heightPct, 5)}%` }}
                    />
                    <span className="text-xs font-medium text-ink-500">{item.year}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Revenue Chart */}
          <div>
            <h3 className="mb-4 text-center text-lg font-semibold">Revenue (USD)</h3>
            <div className="flex items-end justify-between gap-2" style={{ height: 200 }}>
              {PROJECTIONS_REVENUE.map((item) => {
                const maxVal = PROJECTIONS_REVENUE[PROJECTIONS_REVENUE.length - 1].value;
                const heightPct = (item.value / maxVal) * 100;
                return (
                  <div key={item.year} className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-xs font-semibold text-ink-700">
                      {item.value >= 1000000
                        ? `$${(item.value / 1000000).toFixed(1)}M`
                        : `$${(item.value / 1000).toFixed(0)}K`}
                    </span>
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-brand-500 to-brand-300"
                      style={{ height: `${Math.max(heightPct, 5)}%` }}
                    />
                    <span className="text-xs font-medium text-ink-500">{item.year}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

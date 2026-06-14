'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PROJECTIONS_BOOKINGS, PROJECTIONS_REVENUE } from './investData';

const bookingsData = PROJECTIONS_BOOKINGS.map((d) => ({
  name: d.year,
  value: d.value,
}));

const revenueData = PROJECTIONS_REVENUE.map((d) => ({
  name: d.year,
  value: d.value,
}));

function formatNumber(val: number) {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`;
  return String(val);
}

function formatRevenue(val: number) {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val}`;
}

export function ProjectionsSection() {
  return (
    <section className="overflow-hidden bg-white px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold">Projections</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-ink-500">
          Conservative growth starting with Dar es Salaam and Zanzibar, then expanding nationally.
        </p>

        <div className="mt-12 grid gap-10 sm:grid-cols-2">
          {/* Bookings Chart */}
          <div>
            <h3 className="mb-6 text-center text-lg font-semibold">Bookings per Year</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bookingsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={formatNumber} width={45} />
                  <Tooltip formatter={(value: number) => [formatNumber(value), 'Bookings']} />
                  <Bar dataKey="value" fill="#16a34a" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue Chart */}
          <div>
            <h3 className="mb-6 text-center text-lg font-semibold">Revenue (USD)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={formatRevenue} width={50} />
                  <Tooltip formatter={(value: number) => [formatRevenue(value), 'Revenue']} />
                  <Bar dataKey="value" fill="#22c55e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

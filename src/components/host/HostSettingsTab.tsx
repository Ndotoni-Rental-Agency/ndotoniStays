'use client';

import { PropertyFormData } from './types';

interface Props {
  form: PropertyFormData;
  onUpdate: (field: string, value: any) => void;
  onSave: () => void;
  saving: boolean;
}

export function HostSettingsTab({ form, onUpdate, onSave, saving }: Props) {
  return (
    <div className="space-y-8 max-w-3xl">
      {/* Booking policies */}
      <section>
        <h2 className="text-lg font-semibold text-ink-900 mb-4">Booking Policies</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Minimum stay (nights)</label>
              <input
                type="number"
                value={form.minimumStay}
                onChange={(e) => onUpdate('minimumStay', e.target.value)}
                className="input"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Maximum stay (nights)</label>
              <input
                type="number"
                value={form.maximumStay}
                onChange={(e) => onUpdate('maximumStay', e.target.value)}
                className="input"
                min="1"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Check-in time</label>
              <input
                type="time"
                value={form.checkInTime}
                onChange={(e) => onUpdate('checkInTime', e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Check-out time</label>
              <input
                type="time"
                value={form.checkOutTime}
                onChange={(e) => onUpdate('checkOutTime', e.target.value)}
                className="input"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Check-in instructions</label>
            <textarea
              value={form.checkInInstructions}
              onChange={(e) => onUpdate('checkInInstructions', e.target.value)}
              className="input min-h-[100px]"
              placeholder="How guests should find and enter the property. E.g. gate code, key location, contact guard."
              rows={4}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Cancellation policy</label>
            <select
              value={form.cancellationPolicy}
              onChange={(e) => onUpdate('cancellationPolicy', e.target.value)}
              className="input"
            >
              <option value="FLEXIBLE">Flexible — Full refund up to 24h before check-in</option>
              <option value="MODERATE">Moderate — Full refund up to 5 days before</option>
              <option value="STRICT">Strict — 50% refund up to 7 days before</option>
            </select>
          </div>
        </div>
      </section>

      {/* House rules */}
      <section>
        <h2 className="text-lg font-semibold text-ink-900 mb-4">House Rules</h2>
        <textarea
          value={form.houseRules}
          onChange={(e) => onUpdate('houseRules', e.target.value)}
          className="input min-h-[120px]"
          placeholder="No smoking indoors&#10;No parties&#10;Quiet hours after 10 PM&#10;Remove shoes at the door"
          rows={5}
        />
        <p className="text-xs text-ink-400 mt-1.5">One rule per line. These are shown to guests before booking.</p>
      </section>

      {/* Instant booking toggle */}
      <section>
        <h2 className="text-lg font-semibold text-ink-900 mb-4">Booking Settings</h2>
        <label className="flex items-center gap-4 p-4 rounded-xl border border-ink-100 hover:border-ink-200 cursor-pointer transition-colors">
          <div className="relative">
            <input
              type="checkbox"
              checked={form.instantBookEnabled}
              onChange={(e) => onUpdate('instantBookEnabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-ink-200 peer-focus:ring-4 peer-focus:ring-brand-100 rounded-full peer peer-checked:bg-brand-600 transition-colors" />
            <div className="absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full shadow transition-transform peer-checked:translate-x-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-ink-800">Instant booking</p>
            <p className="text-xs text-ink-500">Guests book without waiting for your approval. More bookings, less friction.</p>
          </div>
        </label>
      </section>

      {/* Save */}
      <div className="sticky bottom-4 flex justify-end">
        <button
          onClick={onSave}
          disabled={saving}
          className="btn-primary py-3 px-8 shadow-lg"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}

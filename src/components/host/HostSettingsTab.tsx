'use client';

import { useState } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { PropertyFormData } from './types';

interface Props {
  form: PropertyFormData;
  onUpdate: (field: string, value: any) => void;
  onSave: () => void;
  saving: boolean;
  propertyId?: string;
  onDelete?: () => Promise<void>;
}

export function HostSettingsTab({ form, onUpdate, onSave, saving, propertyId, onDelete }: Props) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');

  async function handleDelete() {
    if (!onDelete) return;
    setDeleting(true);
    try {
      await onDelete();
    } finally {
      setDeleting(false);
    }
  }
  return (
    <div className="space-y-8 max-w-3xl pb-24 sm:pb-0">
      {/* Booking policies */}
      <section>
        <h2 className="text-base sm:text-lg font-semibold text-ink-900 mb-3 sm:mb-4">Booking Policies</h2>
        <div className="space-y-4">
          <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Minimum stay (nights)</label>
              <input
                type="number"
                value={form.minimumStay}
                onChange={(e) => onUpdate('minimumStay', e.target.value)}
                className="input text-base"
                min="1"
                inputMode="numeric"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Maximum stay (nights)</label>
              <input
                type="number"
                value={form.maximumStay}
                onChange={(e) => onUpdate('maximumStay', e.target.value)}
                className="input text-base"
                min="1"
                inputMode="numeric"
              />
            </div>
          </div>
          <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Check-in time</label>
              <input
                type="time"
                value={form.checkInTime}
                onChange={(e) => onUpdate('checkInTime', e.target.value)}
                className="input text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Check-out time</label>
              <input
                type="time"
                value={form.checkOutTime}
                onChange={(e) => onUpdate('checkOutTime', e.target.value)}
                className="input text-base"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Cancellation policy</label>
            <select
              value={form.cancellationPolicy}
              onChange={(e) => onUpdate('cancellationPolicy', e.target.value)}
              className="input text-base"
            >
              <option value="FLEXIBLE">Flexible — Full refund 24h before</option>
              <option value="MODERATE">Moderate — Full refund 5 days before</option>
              <option value="STRICT">Strict — 50% refund 7 days before</option>
            </select>
          </div>
        </div>
      </section>

      {/* House rules */}
      <section>
        <h2 className="text-base sm:text-lg font-semibold text-ink-900 mb-3 sm:mb-4">House Rules</h2>
        <textarea
          value={form.houseRules}
          onChange={(e) => onUpdate('houseRules', e.target.value)}
          className="input min-h-[120px] text-base"
          placeholder="No smoking indoors&#10;No parties&#10;Quiet hours after 10 PM&#10;Remove shoes at the door"
          rows={5}
        />
        <p className="text-xs text-ink-400 mt-1.5">One rule per line. Shown to guests before booking.</p>
      </section>

      {/* Instant booking toggle */}
      <section>
        <h2 className="text-base sm:text-lg font-semibold text-ink-900 mb-3 sm:mb-4">Booking Settings</h2>
        <label className="flex items-start gap-3 sm:gap-4 p-4 rounded-xl border border-ink-100 hover:border-ink-200 cursor-pointer transition-colors touch-manipulation active:bg-ink-50">
          <div className="relative shrink-0 mt-0.5">
            <input
              type="checkbox"
              checked={form.instantBookEnabled}
              onChange={(e) => onUpdate('instantBookEnabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-ink-200 peer-focus:ring-4 peer-focus:ring-brand-100 rounded-full peer peer-checked:bg-brand-600 transition-colors" />
            <div className="absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full shadow transition-transform peer-checked:translate-x-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink-800">Instant booking</p>
            <p className="text-xs text-ink-500 mt-0.5 leading-relaxed">Guests book without waiting for your approval. More bookings, less friction.</p>
          </div>
        </label>
      </section>

      {/* Danger Zone */}
      {propertyId && onDelete && (
        <section className="border-t border-red-100 pt-8">
          <h2 className="text-base sm:text-lg font-semibold text-red-700 mb-2">Danger Zone</h2>
          <p className="text-sm text-ink-500 mb-4">Permanently delete this property and all its data. This cannot be undone.</p>

          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-2 text-sm font-medium text-red-600 border border-red-200 rounded-xl px-4 py-2.5 hover:bg-red-50 transition-colors"
            >
              <ExclamationTriangleIcon className="h-4 w-4" />
              Delete This Property
            </button>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
              <p className="text-sm font-medium text-red-800">
                Are you sure? Type <span className="font-bold">DELETE</span> to confirm.
              </p>
              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder="Type DELETE"
                className="input text-sm border-red-200 focus:ring-red-500 focus:border-red-500"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteInput !== 'DELETE' || deleting}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-red-600 rounded-lg px-4 py-2 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {deleting ? (
                    <>
                      <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Permanently'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }}
                  className="text-sm text-ink-500 hover:text-ink-700 px-3 py-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Save — full-width on mobile */}
      <div className="sticky bottom-4">
        <button
          onClick={onSave}
          disabled={saving}
          className="btn-primary w-full sm:w-auto sm:float-right py-3.5 sm:py-3 px-8 shadow-lg text-base sm:text-sm"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}

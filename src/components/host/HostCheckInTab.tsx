'use client';

import { useState } from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { PropertyFormData, CheckInInstructionsForm } from './types';
import { AIService } from '@/lib/ai/AIService';

interface Props {
  form: PropertyFormData;
  onUpdate: (field: string, value: any) => void;
  onSave: () => void;
  saving: boolean;
}

export function HostCheckInTab({ form, onUpdate, onSave, saving }: Props) {
  const [aiGenerating, setAiGenerating] = useState(false);
  const instructions = form.checkInInstructions;

  function updateInstruction(field: keyof CheckInInstructionsForm, value: any) {
    onUpdate('checkInInstructions', { ...instructions, [field]: value });
  }

  async function handleAiSuggest() {
    setAiGenerating(true);
    try {
      const result = await AIService.generateCheckInInstructions({
        title: form.title,
        propertyType: form.propertyType,
        district: form.district,
        region: form.region,
        street: form.street,
        amenities: form.amenities,
        maxGuests: parseInt(form.maxGuests) || undefined,
        checkInTime: form.checkInTime,
        checkOutTime: form.checkOutTime,
      });

      // Merge AI suggestions with existing values (don't overwrite what the host already filled)
      onUpdate('checkInInstructions', {
        ...instructions,
        directions: instructions.directions || result.directions || '',
        parkingInfo: instructions.parkingInfo || result.parkingInfo || '',
        additionalNotes: instructions.additionalNotes || result.additionalNotes || '',
        contactName: instructions.contactName || result.contactName || '',
      });
    } catch (err) {
      console.error('AI suggestion failed:', err);
      // Fallback: basic template
      onUpdate('checkInInstructions', {
        ...instructions,
        directions: instructions.directions || `From the main road in ${form.district}, look for ${form.title}.`,
        additionalNotes: instructions.additionalNotes || 'Please message the host if you have trouble finding the place.',
      });
    } finally {
      setAiGenerating(false);
    }
  }

  const hasContent = Object.values(instructions).some(v =>
    v && (typeof v === 'string' ? v.trim() !== '' : (Array.isArray(v) && v.length > 0))
  );

  return (
    <div className="space-y-8 max-w-3xl pb-24 sm:pb-0">
      {/* Header with AI button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-ink-900">Check-In Instructions</h2>
          <p className="text-sm text-ink-500 mt-1">
            These are sent to guests after payment is confirmed. Fill in what applies.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAiSuggest}
          disabled={aiGenerating}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 bg-brand-50 border border-brand-200 rounded-lg px-3 py-2 hover:bg-brand-100 transition-colors disabled:opacity-50"
        >
          <SparklesIcon className="h-4 w-4" />
          {aiGenerating ? 'Generating...' : 'AI Suggest'}
        </button>
      </div>

      {/* Access & Entry */}
      <section>
        <h3 className="text-sm font-semibold text-ink-700 mb-3 uppercase tracking-wide">Access & Entry</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Access / Gate code</label>
            <input
              type="text"
              value={instructions.accessCode}
              onChange={(e) => updateInstruction('accessCode', e.target.value)}
              className="input text-base"
              placeholder="e.g. Gate code: 1234, or 'Ring bell at gate'"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Directions to the property</label>
            <textarea
              value={instructions.directions}
              onChange={(e) => updateInstruction('directions', e.target.value)}
              className="input min-h-[100px] text-base"
              placeholder="How to find the property from the main road. Landmarks, turns, what to look for..."
              rows={4}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Parking information</label>
            <textarea
              value={instructions.parkingInfo}
              onChange={(e) => updateInstruction('parkingInfo', e.target.value)}
              className="input text-base"
              placeholder="e.g. Free parking inside the compound. Enter through the blue gate."
              rows={2}
            />
          </div>
        </div>
      </section>

      {/* WiFi */}
      <section>
        <h3 className="text-sm font-semibold text-ink-700 mb-3 uppercase tracking-wide">WiFi</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">WiFi name (SSID)</label>
            <input
              type="text"
              value={instructions.wifiName}
              onChange={(e) => updateInstruction('wifiName', e.target.value)}
              className="input text-base"
              placeholder="e.g. Villa-Guest-WiFi"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">WiFi password</label>
            <input
              type="text"
              value={instructions.wifiPassword}
              onChange={(e) => updateInstruction('wifiPassword', e.target.value)}
              className="input text-base"
              placeholder="e.g. welcome2024"
            />
          </div>
        </div>
      </section>

      {/* Contact */}
      <section>
        <h3 className="text-sm font-semibold text-ink-700 mb-3 uppercase tracking-wide">Contact Person</h3>
        <p className="text-xs text-ink-400 mb-3">Who should the guest call/WhatsApp if they need help on arrival?</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Contact name</label>
            <input
              type="text"
              value={instructions.contactName}
              onChange={(e) => updateInstruction('contactName', e.target.value)}
              className="input text-base"
              placeholder="e.g. John (caretaker)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Contact phone</label>
            <input
              type="tel"
              value={instructions.contactPhone}
              onChange={(e) => updateInstruction('contactPhone', e.target.value)}
              className="input text-base"
              placeholder="e.g. +255 7XX XXX XXX"
            />
          </div>
        </div>
      </section>

      {/* Additional notes */}
      <section>
        <h3 className="text-sm font-semibold text-ink-700 mb-3 uppercase tracking-wide">Additional Notes</h3>
        <textarea
          value={instructions.additionalNotes}
          onChange={(e) => updateInstruction('additionalNotes', e.target.value)}
          className="input min-h-[100px] text-base"
          placeholder="Anything else the guest should know before arrival. E.g. 'Water heater switch is behind the bathroom door.'"
          rows={4}
        />
      </section>

      {/* Status indicator */}
      {hasContent && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm text-green-800 font-medium">
            ✅ Check-in instructions are set. They will be sent to guests when you click "Send Instructions" from a paid booking.
          </p>
        </div>
      )}

      {/* Save */}
      <div className="sticky bottom-4">
        <button
          onClick={onSave}
          disabled={saving}
          className="btn-primary w-full sm:w-auto sm:float-right py-3.5 sm:py-3 px-8 shadow-lg text-base sm:text-sm"
        >
          {saving ? 'Saving...' : 'Save Instructions'}
        </button>
      </div>
    </div>
  );
}

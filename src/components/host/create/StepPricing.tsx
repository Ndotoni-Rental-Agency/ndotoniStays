'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { StepProps } from './types';
import { AIService } from '@/lib/ai/AIService';

function formatWithCommas(value: string): string {
  const num = value.replace(/[^0-9]/g, '');
  if (!num) return '';
  return Number(num).toLocaleString('en-US');
}

function stripCommas(value: string): string {
  return value.replace(/,/g, '');
}

export function StepPricing({ form, updateField, setForm }: StepProps) {
  const { t } = useLanguage();
  const [generatingTitle, setGeneratingTitle] = useState(false);
  const [predictingPrice, setPredictingPrice] = useState(false);
  const [priceSuggestion, setPriceSuggestion] = useState<{ suggestedPrice: number; currency: string; reasoning: string; range: { min: number; max: number } } | null>(null);
  const [priceContext, setPriceContext] = useState('');
  const displayPrice = form.nightlyRate ? formatWithCommas(form.nightlyRate) : '';

  function handlePriceChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = stripCommas(e.target.value);
    updateField('nightlyRate', raw);
    setPriceSuggestion(null);
  }

  async function handleGenerateTitle() {
    setGeneratingTitle(true);
    try {
      const title = await AIService.generateTitle({
        propertyType: form.propertyType,
        district: form.district,
        region: form.region,
        maxGuests: form.maxGuests,
        currency: form.currency,
        nightlyRate: form.nightlyRate,
        userContext: form.title || undefined,
      });
      if (title) {
        updateField('title', title);
      }
    } catch (err) {
      console.error('Failed to generate title:', err);
    } finally {
      setGeneratingTitle(false);
    }
  }

  async function handleSuggestPrice() {
    setPredictingPrice(true);
    try {
      const result = await AIService.predictPrice({
        propertyType: form.propertyType,
        district: form.district,
        region: form.region,
        maxGuests: parseInt(form.maxGuests) || 2,
        userContext: priceContext || undefined,
      });
      setPriceSuggestion(result);
    } catch (err) {
      console.error('Failed to predict price:', err);
    } finally {
      setPredictingPrice(false);
    }
  }

  function applyPriceSuggestion() {
    if (priceSuggestion) {
      updateField('nightlyRate', priceSuggestion.suggestedPrice.toString());
      updateField('currency', priceSuggestion.currency || 'TZS');
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-ink-900 mb-2">{t('create.pricing.title')}</h2>
        <p className="text-sm sm:text-base text-ink-500 mb-6">{t('create.pricing.subtitle')}</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-2">{t('create.pricing.name')}</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder={t('create.pricing.namePlaceholder')}
            className="input text-base sm:text-lg py-3.5"
            required
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs sm:text-sm text-ink-400">{t('create.pricing.nameTip')}</p>
            <button
              type="button"
              onClick={handleGenerateTitle}
              disabled={generatingTitle || !form.district}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 disabled:text-ink-300 disabled:cursor-not-allowed transition-colors"
            >
              {generatingTitle ? (
                <>
                  <span className="h-3 w-3 border-2 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
                  {t('create.pricing.generating')}
                </>
              ) : (
                <>{t('create.pricing.suggestTitle')}</>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">{t('create.pricing.pricePerNight')}</label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500 text-sm font-semibold">
                  {form.currency === 'TZS' ? 'TZS' : '$'}
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={displayPrice}
                  onChange={handlePriceChange}
                  placeholder={form.currency === 'TZS' ? '50,000' : '25'}
                  className="input pl-12 text-lg font-semibold py-3.5"
                  required
                />
              </div>
              <select
                value={form.currency}
                onChange={(e) => updateField('currency', e.target.value)}
                className="input w-20 sm:w-24 py-3.5"
              >
                <option value="TZS">TZS</option>
                <option value="USD">USD</option>
              </select>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={handleSuggestPrice}
                disabled={predictingPrice || !form.district}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 disabled:text-ink-300 disabled:cursor-not-allowed transition-colors"
              >
                {predictingPrice ? (
                  <>
                    <span className="h-3 w-3 border-2 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
                    {t('create.pricing.analyzing')}
                  </>
                ) : (
                  <>{t('create.pricing.suggestPrice')}</>
                )}
              </button>
            </div>
            <input
              type="text"
              value={priceContext}
              onChange={(e) => setPriceContext(e.target.value)}
              className="input text-xs mt-1.5 py-1.5 text-ink-500"
              placeholder={t('create.pricing.pricePlaceholder')}
            />

            {priceSuggestion && (
              <div className="mt-3 p-3 rounded-xl bg-brand-50 border border-brand-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-brand-800">
                      {t('create.pricing.suggested')} TZS {priceSuggestion.suggestedPrice.toLocaleString()}/night
                    </p>
                    <p className="text-xs text-brand-600 mt-0.5">
                      {t('create.pricing.range')} TZS {priceSuggestion.range.min.toLocaleString()} – {priceSuggestion.range.max.toLocaleString()}
                    </p>
                    <p className="text-xs text-ink-500 mt-1">{priceSuggestion.reasoning}</p>
                  </div>
                  <button
                    type="button"
                    onClick={applyPriceSuggestion}
                    className="text-xs font-medium text-white bg-brand-600 hover:bg-brand-700 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
                  >
                    {t('create.pricing.useThis')}
                  </button>
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">{t('create.pricing.maxGuests')}</label>
            <select
              value={form.maxGuests}
              onChange={(e) => updateField('maxGuests', e.target.value)}
              className="input text-base py-3.5 w-full"
            >
              {[1, 2, 3, 4, 5, 6, 8, 10, 15, 20, 30, 50].map((n) => (
                <option key={n} value={n}>{n} {n === 1 ? t('create.pricing.guest') : t('create.pricing.guests')}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Bedrooms & Bathrooms */}
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">{t('create.pricing.bedrooms')}</label>
            <select
              value={form.bedrooms}
              onChange={(e) => updateField('bedrooms', e.target.value)}
              className="input text-base py-3.5 w-full"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 10].map((n) => (
                <option key={n} value={n}>{n} {n === 1 ? t('create.pricing.bedroom') : t('create.pricing.bedroomsPlural')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">{t('create.pricing.bathrooms')}</label>
            <select
              value={form.bathrooms}
              onChange={(e) => updateField('bathrooms', e.target.value)}
              className="input text-base py-3.5 w-full"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>{n} {n === 1 ? t('create.pricing.bathroom') : t('create.pricing.bathroomsPlural')}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Instant Book Toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-ink-200 bg-ink-50/50">
          <div>
            <p className="text-sm font-medium text-ink-800">{t('create.pricing.instantBook')}</p>
            <p className="text-xs text-ink-500 mt-0.5">{t('create.pricing.instantBookDesc')}</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={form.instantBookEnabled}
            onClick={() => setForm(prev => ({ ...prev, instantBookEnabled: !prev.instantBookEnabled }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              form.instantBookEnabled ? 'bg-brand-600' : 'bg-ink-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                form.instantBookEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

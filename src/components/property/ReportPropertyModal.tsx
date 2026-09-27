'use client';

import { useEffect, useState } from 'react';
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { GraphQLClient } from '@/lib/graphql-client';
import { reportProperty } from '@/graphql/mutations';
import { useLanguage } from '@/contexts/LanguageContext';

// Reasons are sent to the backend in English (same strings as ndotoniApp) so admins see
// consistent values; only the label is translated.
const REPORT_REASONS = [
  { key: 'inaccurate', value: 'Inaccurate or misleading listing' },
  { key: 'scam', value: 'Fraudulent or scam listing' },
  { key: 'photos', value: 'Inappropriate photos' },
  { key: 'discrimination', value: 'Discriminatory content' },
  { key: 'safety', value: 'Safety concern' },
  { key: 'other', value: 'Other' },
] as const;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyTitle?: string;
}

export function ReportPropertyModal({ isOpen, onClose, propertyId, propertyTitle }: Props) {
  const { t } = useLanguage();
  const [reason, setReason] = useState<string | null>(null);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setReason(null);
    setDetails('');
    setSubmitted(false);
    setError(null);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!reason) return;
    setSubmitting(true);
    setError(null);
    try {
      await GraphQLClient.executeAuthenticated(reportProperty, {
        input: {
          propertyId,
          propertyTitle,
          reason,
          details: details.trim() || undefined,
        },
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Error reporting property:', err);
      setError(t('property.reportError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={submitting ? undefined : onClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-property-title"
        className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200"
      >
        {submitted ? (
          <div className="flex flex-col items-center text-center py-2">
            <CheckCircleIcon className="h-12 w-12 text-brand-600 mb-3" />
            <h3 id="report-property-title" className="text-lg font-semibold text-ink-900">
              {t('property.reportSuccessTitle')}
            </h3>
            <p className="text-sm text-ink-500 mt-2 leading-relaxed">{t('property.reportSuccessMessage')}</p>
            <button type="button" onClick={onClose} className="btn-primary w-full mt-6">
              {t('property.reportClose')}
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4 mb-2">
              <h3 id="report-property-title" className="text-lg font-semibold text-ink-900">
                {t('property.report')}
              </h3>
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="text-ink-400 hover:text-ink-600 transition-colors"
                aria-label={t('property.reportClose')}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-ink-500 mb-4">{t('property.reportIntro')}</p>

            <fieldset>
              <legend className="text-sm font-medium text-ink-900 mb-2">{t('property.reportReason')}</legend>
              <div className="space-y-2">
                {REPORT_REASONS.map(({ key, value }) => (
                  <label
                    key={key}
                    className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 cursor-pointer text-sm transition-colors ${
                      reason === value
                        ? 'border-brand-600 bg-brand-50 text-ink-900'
                        : 'border-ink-200 text-ink-700 hover:border-ink-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="report-reason"
                      value={value}
                      checked={reason === value}
                      onChange={() => setReason(value)}
                      className="accent-brand-600"
                    />
                    {t(`property.reportReason.${key}`)}
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="block mt-4">
              <span className="text-sm font-medium text-ink-900">{t('property.reportDetails')}</span>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                maxLength={1000}
                placeholder={t('property.reportDetailsPlaceholder')}
                className="mt-1.5 w-full rounded-xl border border-ink-200 px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
            </label>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-ink-200 text-ink-700 hover:bg-ink-50 transition-colors disabled:opacity-50"
              >
                {t('property.reportCancel')}
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!reason || submitting}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? t('property.reportSubmitting') : t('property.reportSubmit')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

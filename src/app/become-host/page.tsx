'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { GraphQLClient } from '@/lib/graphql-client';
import { createShortTermPropertyDraft, submitContactInquiry } from '@/graphql/mutations';
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { PartyPopper, Zap } from 'lucide-react';
import Link from 'next/link';
import { AuthModal } from '@/components/auth/AuthModal';
import { generateVideoThumbnail } from '@/lib/video-thumbnail';
import { isValidPhoneNumber } from 'react-phone-number-input';
import {
  StepType,
  StepCategory,
  StepLocation,
  StepPricing,
  StepPhotosContact,
  CreatePropertyFormData,
} from '@/components/host/create';

const STORAGE_KEY = 'ndotoni_create_property_draft';
const PENDING_SUBMIT_KEY = 'ndotoni_create_pending_submit';

const STEPS = [
  { id: 1, labelKey: 'create.step1' },
  { id: 2, labelKey: 'create.step2' },
  { id: 3, labelKey: 'create.step3' },
  { id: 4, labelKey: 'create.step4' },
  { id: 5, labelKey: 'create.step5' },
];
const TOTAL_STEPS = STEPS.length;

export default function ListYourPlacePage() {
  const { user, isAuthenticated, isLoading, refreshUser } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [step, setStep] = useState(1);
  const [stepDirection, setStepDirection] = useState<'forward' | 'back'>('forward');
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdPropertyId, setCreatedPropertyId] = useState<string | null>(null);
  const pendingSubmitRef = useRef(false);

  const [form, setForm] = useState<CreatePropertyFormData>({
    title: '',
    propertyType: 'HOTEL',
    stayCategories: ['NIGHTLY_STAY'],
    region: 'Dar es Salaam',
    district: '',
    ward: '',
    street: '',
    googleMapsLink: '',
    nightlyRate: '',
    currency: 'TZS',
    maxGuests: '2',
    bedrooms: '1',
    bathrooms: '1',
    instantBookEnabled: false,
    images: [],
    videos: [],
    phoneNumber: '',
    lat: 0,
    lng: 0,
  });

  // Let the team know a host started a listing, so they can follow up if it's abandoned.
  // Fires the moment there's a real way to reach them — a valid phone number — or, failing
  // that, when they leave the page, so we still hear about a drop-off even without contact
  // info. Guarded so only one of the two ever actually sends. formRef/userRef exist because
  // the exit path fires from a cleanup function, whose closure would otherwise see stale
  // (mount-time) form/user values instead of what was on screen right before they left.
  const hasNotifiedStartRef = useRef(false);
  const formRef = useRef(form);
  useEffect(() => { formRef.current = form; }, [form]);
  const userRef = useRef(user);
  useEffect(() => { userRef.current = user; }, [user]);

  function notifyListingStarted(reason: 'phone' | 'exit') {
    if (hasNotifiedStartRef.current) return;
    hasNotifiedStartRef.current = true;

    const f = formRef.current;
    const u = userRef.current;
    const name = u ? `${u.firstName} ${u.lastName}`.trim() : '';
    const displayName = name || 'A visitor';
    const details = [
      f.propertyType ? `Type: ${f.propertyType}` : null,
      f.stayCategories.length ? `Categories: ${f.stayCategories.join(', ')}` : null,
      f.region ? `Location: ${[f.region, f.district].filter(Boolean).join(', ')}` : null,
      f.nightlyRate ? `Rate: ${f.nightlyRate} ${f.currency}/night` : null,
      `Guests: ${f.maxGuests} · Bedrooms: ${f.bedrooms} · Bathrooms: ${f.bathrooms}`,
      f.phoneNumber ? `Phone: ${f.phoneNumber}` : null,
      f.images.length ? `Photos:\n${f.images.join('\n')}` : null,
      f.videos.length ? `Videos:\n${f.videos.join('\n')}` : null,
    ].filter(Boolean).join('\n');
    const action = reason === 'phone' ? 'shared a phone number while' : 'left the page while';

    GraphQLClient.execute(submitContactInquiry, {
      input: {
        inquiryType: 'PROPERTY',
        subject: 'New listing started (Website)',
        name: name || 'Anonymous visitor',
        email: u?.email || 'anonymous-lead@ndotonistays.com',
        phone: u?.phoneNumber || f.phoneNumber || undefined,
        message: `${displayName} ${action} creating a new short-term listing on ndotonistays.com.\n\n${details}`,
      },
    }).catch(err => console.error('Failed to notify listing started:', err));
  }

  // Restore draft from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setForm(parsed);
        setStep(TOTAL_STEPS);
        // Resuming an in-progress draft is a continuation, not a start — don't notify.
        hasNotifiedStartRef.current = true;

        // Only auto-submit if returning from OAuth redirect AND not already authenticated.
        // If user is already authenticated, they're just revisiting — show the form normally.
        const pending = localStorage.getItem(PENDING_SUBMIT_KEY);
        if (pending && !isAuthenticated) {
          pendingSubmitRef.current = true;
        } else {
          // Clean up stale pending flag
          localStorage.removeItem(PENDING_SUBMIT_KEY);
        }
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Fire as soon as they've entered a valid phone number.
  useEffect(() => {
    if (form.phoneNumber && isValidPhoneNumber(form.phoneNumber)) {
      notifyListingStarted('phone');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.phoneNumber]);

  // Otherwise, fire when they leave the page without ever giving us a phone number.
  useEffect(() => {
    return () => notifyListingStarted('exit');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pre-fill phone from user profile
  useEffect(() => {
    if (user?.phoneNumber && !form.phoneNumber) {
      setForm(prev => ({ ...prev, phoneNumber: user.phoneNumber || '' }));
    }
  }, [user]);

  // After sign-in, auto-submit if we have a pending draft.
  // This fires when isAuthenticated changes from false → true (user just signed in).
  useEffect(() => {
    if (isAuthenticated && pendingSubmitRef.current) {
      pendingSubmitRef.current = false;
      setShowAuthModal(false);
      localStorage.removeItem('ndotoni_booking_redirect');
      localStorage.removeItem(PENDING_SUBMIT_KEY);
      // Small delay to let auth state fully settle
      setTimeout(() => submitProperty(), 300);
    }
  }, [isAuthenticated]);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function canAdvance(): boolean {
    if (step === 1) return !!form.propertyType;
    if (step === 2) return form.stayCategories.length > 0;
    if (step === 3) return !!form.region && !!form.district;
    if (step === 4) return !!form.nightlyRate && parseFloat(form.nightlyRate) > 0;
    return true;
  }

  function nextStep() {
    if (canAdvance() && step < TOTAL_STEPS) {
      setStepDirection('forward');
      setStep(step + 1);
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 50);
    }
  }

  function prevStep() {
    if (step > 1) {
      setStepDirection('back');
      setStep(step - 1);
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 50);
    }
  }

  async function submitProperty() {
    setLoading(true);
    setError(null);

    try {
      // Generate thumbnail from first video if no images exist
      let thumbnail: string | undefined;
      if (form.images.length === 0 && form.videos.length > 0) {
        thumbnail = (await generateVideoThumbnail(form.videos[0])) || undefined;
      }

      const data = await GraphQLClient.executeAuthenticated<{
        createShortTermPropertyDraft: { propertyId: string; success: boolean; message: string };
      }>(createShortTermPropertyDraft, {
        input: {
          title: form.title,
          propertyType: form.propertyType,
          stayCategories: form.stayCategories,
          region: form.region,
          district: form.district || form.region,
          nightlyRate: parseFloat(form.nightlyRate),
          currency: form.currency,
          maxGuests: parseInt(form.maxGuests),
          bedrooms: parseInt(form.bedrooms) || 1,
          bathrooms: parseInt(form.bathrooms) || 1,
          instantBookEnabled: form.instantBookEnabled,
          images: form.images.length > 0 ? form.images : thumbnail ? [thumbnail] : undefined,
          videos: form.videos.length > 0 ? form.videos : undefined,
          googleMapsLink: form.googleMapsLink || undefined,
          guestPhoneNumber: form.phoneNumber || undefined,
          guestWhatsappNumber: form.phoneNumber || undefined,
        },
      });

      localStorage.removeItem(STORAGE_KEY);

      const propertyId = data.createShortTermPropertyDraft?.propertyId;
      if (propertyId) {
        // Refresh user profile to pick up role/hasProperties changes
        await refreshUser();
        setCreatedPropertyId(propertyId);
        setShowSuccess(true);
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        }, 50);
      } else {
        setError('Property created but no ID returned.');
      }
    } catch (err: any) {
      console.error('Error creating property:', err);
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!isAuthenticated) {
      // Save form to localStorage and prompt sign-in
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
      localStorage.setItem(PENDING_SUBMIT_KEY, 'true');
      // Save current URL for OAuth redirect
      localStorage.setItem('ndotoni_booking_redirect', window.location.href);
      pendingSubmitRef.current = true;
      setShowAuthModal(true);
      return;
    }

    await submitProperty();
  }

  // Success screen with confetti
  if (showSuccess) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-ink-50/50 px-4">
        <div className="text-center max-w-md">
          <div className="relative mb-6 animate-success-pop">
            <div className="animate-bounce">
              <PartyPopper className="w-16 h-16 text-brand-600 mx-auto" />
            </div>
            <SparklesIcon className="absolute -top-2 -left-4 w-7 h-7 text-brand-400 animate-ping opacity-50" />
            <SparklesIcon className="absolute -top-1 -right-3 w-5 h-5 text-brand-400 animate-ping opacity-50" />
            <SparklesIcon className="absolute top-8 -right-6 w-4 h-4 text-brand-300 animate-ping opacity-40" />
            <SparklesIcon className="absolute top-10 -left-5 w-4 h-4 text-brand-300 animate-ping opacity-40" />
          </div>

          <h1
            className="text-2xl sm:text-3xl font-bold text-ink-900 mb-3 animate-fade-in-up opacity-0 [animation-fill-mode:forwards]"
            style={{ animationDelay: '150ms' }}
          >
            {t('create.success.title')}
          </h1>
          <p
            className="text-ink-500 text-base mb-8 animate-fade-in-up opacity-0 [animation-fill-mode:forwards]"
            style={{ animationDelay: '250ms' }}
          >
            {t('create.success.desc')}
          </p>

          <div
            className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-in-up opacity-0 [animation-fill-mode:forwards]"
            style={{ animationDelay: '350ms' }}
          >
            <button
              onClick={() => router.push(`/host/property/${createdPropertyId}/edit`)}
              className="btn-primary px-6 py-3 text-base"
            >
              {t('create.success.addDetails')}
            </button>
            <button
              onClick={() => router.push('/host')}
              className="btn-secondary px-6 py-3 text-base"
            >
              {t('create.success.goToProperties')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-ink-400">Loading...</div>
      </div>
    );
  }

  const stepProps = { form, updateField, setForm };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-ink-50/50">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-ink-100 px-4 sm:px-6 py-3">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-700">
            <ArrowLeftIcon className="h-4 w-4" />
            <span className="hidden sm:inline">{t('create.back')}</span>
          </Link>

          {/* Step indicator */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    if (s.id < step || canAdvance()) {
                      setStepDirection(s.id > step ? 'forward' : 'back');
                      setStep(s.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className="flex items-center gap-1.5"
                >
                  <span
                    className={`flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-[10px] sm:text-xs font-bold transition-all duration-300 ${
                      s.id === step
                        ? 'bg-brand-600 text-white ring-2 ring-brand-200 scale-110'
                        : s.id < step
                        ? 'bg-green-500 text-white'
                        : 'bg-ink-100 text-ink-400'
                    }`}
                  >
                    {s.id < step ? <CheckIcon className="h-3 w-3 animate-step-in-forward" /> : s.id}
                  </span>
                  <span className={`hidden lg:inline text-xs font-medium transition-colors duration-300 ${
                    s.id === step ? 'text-brand-700' : s.id < step ? 'text-green-600' : 'text-ink-400'
                  }`}>
                    {t(s.labelKey)}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className="w-4 sm:w-8 h-0.5 mx-1 rounded bg-ink-100 overflow-hidden">
                    <div
                      className={`h-full bg-green-300 transition-transform duration-500 ease-out origin-left ${
                        s.id < step ? 'scale-x-100' : 'scale-x-0'
                      }`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-xs text-ink-400 hidden sm:block">
            {t('create.step').replace('{current}', String(step)).replace('{total}', String(TOTAL_STEPS))}
          </div>
        </div>

        {/* Overall progress bar (most useful on mobile, where step labels are hidden) */}
        <div className="mt-3 h-1 w-full bg-ink-100 rounded-full overflow-hidden sm:hidden">
          <div
            className="h-full bg-brand-500 rounded-full transition-[width] duration-500 ease-out"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Reassurance banner */}
        <div className="flex items-center gap-3 bg-brand-50 border border-brand-100 rounded-xl px-4 py-3 mb-6">
          <Zap className="w-6 h-6 text-brand-600 shrink-0" />
          <div>
            <p className="text-sm font-medium text-brand-800">{t('create.reassurance')}</p>
            <p className="text-xs text-brand-600">{t('create.reassurance.desc')}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-ink-100 shadow-sm overflow-hidden">
            <div
              key={step}
              className={`p-5 sm:p-8 lg:p-10 ${stepDirection === 'forward' ? 'animate-step-in-forward' : 'animate-step-in-back'}`}
            >
              {step === 1 && <StepType {...stepProps} />}
              {step === 2 && <StepCategory {...stepProps} />}
              {step === 3 && <StepLocation {...stepProps} />}
              {step === 4 && <StepPricing {...stepProps} />}
              {step === 5 && <StepPhotosContact {...stepProps} error={error} />}
            </div>
          </div>

          {/* Navigation — sticky bottom on mobile */}
          <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm border-t border-ink-100 -mx-4 sm:mx-0 px-4 sm:px-0 py-4 sm:py-0 sm:border-0 sm:bg-transparent sm:mt-6 sm:static">
            <div className="flex items-center justify-between max-w-5xl mx-auto">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="inline-flex items-center gap-2 text-sm font-medium text-ink-600 hover:text-ink-900 transition-colors py-3 px-4 -ml-4 rounded-xl hover:bg-ink-50"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  {t('create.back')}
                </button>
              ) : (
                <div />
              )}

              {step < TOTAL_STEPS ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!canAdvance()}
                  className="btn-primary inline-flex items-center gap-2 px-6 sm:px-8 py-3 text-sm sm:text-base disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {t('create.continue')}
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !form.propertyType || !form.title || !form.nightlyRate || (form.images.length === 0 && form.videos.length === 0) || !isValidPhoneNumber(form.phoneNumber)}
                  className="btn-primary inline-flex items-center gap-2 px-6 sm:px-10 py-3 sm:py-3.5 text-sm sm:text-base font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t('create.creating')}
                    </>
                  ) : !isAuthenticated ? (
                    <>
                      <CheckIcon className="h-5 w-5" />
                      {t('create.submitSignIn')}
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-5 w-5" />
                      {t('create.submit')}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          pendingSubmitRef.current = false;
        }}
      />
    </div>
  );
}

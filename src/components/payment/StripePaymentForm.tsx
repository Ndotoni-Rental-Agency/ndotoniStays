'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { GraphQLClient } from '@/lib/graphql-client';
import { createStripePaymentIntent } from '@/graphql/mutations';
import { useAuth } from '@/contexts/AuthContext';

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

interface StripePaymentFormProps {
  bookingId: string;
  amount: number;
  currency: string;
  onSuccess: () => void;
  onError: (message: string) => void;
}

export function StripePaymentForm({ bookingId, amount, currency, onSuccess, onError }: StripePaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!stripePromise) return;
    async function createIntent() {
      try {
        const executeGql = isAuthenticated
          ? GraphQLClient.executeAuthenticated.bind(GraphQLClient)
          : GraphQLClient.executePublic.bind(GraphQLClient);

        const data = await executeGql<{ createStripePaymentIntent: any }>(
          createStripePaymentIntent,
          { bookingId, currency: 'usd' }
        );

        setClientSecret(data.createStripePaymentIntent.clientSecret);
      } catch (err: any) {
        onError(err?.errors?.[0]?.message || err?.message || 'Failed to initialize card payment');
      } finally {
        setLoading(false);
      }
    }

    createIntent();
  }, [bookingId, isAuthenticated]);

  if (!stripePromise) {
    return <p role="status" className="rounded-xl bg-ink-50 p-4 text-sm text-ink-600">Card payments are currently unavailable. Please choose mobile money.</p>;
  }

  if (loading) {
    return (
      <div className="space-y-3 py-4">
        <div className="h-11 bg-ink-100 rounded-lg animate-pulse" />
        <div className="h-11 bg-ink-100 rounded-lg animate-pulse" />
        <div className="h-11 bg-ink-50 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!clientSecret) {
    return null;
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        // Elements render in a separate iframe, so it can't see this page's
        // var(--font-dm-sans) or its already-loaded font file — load it explicitly
        // or Stripe silently falls back to a system font.
        fonts: [{ cssSrc: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap' }],
        appearance: {
          theme: 'flat',
          variables: {
            colorPrimary: '#16a34a', // brand-600
            colorBackground: '#ffffff',
            colorText: '#0f172a', // ink-900
            colorTextSecondary: '#64748b', // ink-500
            colorTextPlaceholder: '#94a3b8', // ink-400
            colorDanger: '#ef4444',
            fontFamily: '"DM Sans", system-ui, sans-serif',
            spacingUnit: '4px',
            borderRadius: '12px', // matches .input / rounded-xl elsewhere on the site
            fontSizeBase: '15px',
          },
          rules: {
            '.Input': {
              border: '1px solid #e2e8f0', // ink-200
              boxShadow: 'none',
              padding: '12px 16px',
            },
            '.Input:focus': {
              border: '1px solid #22c55e', // brand-500
              boxShadow: '0 0 0 3px rgba(34, 197, 94, 0.15)',
            },
            '.Label': {
              fontSize: '13px',
              fontWeight: '500',
              color: '#334155', // ink-700
              marginBottom: '6px',
            },
            '.Tab': {
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '10px 12px',
              boxShadow: 'none',
            },
            '.Tab:hover': {
              border: '1px solid #cbd5e1', // ink-300
            },
            '.Tab--selected': {
              border: '1.5px solid #16a34a',
              backgroundColor: '#f0fdf4', // brand-50
              boxShadow: 'none',
            },
            '.TabIcon--selected': {
              fill: '#16a34a',
            },
            '.TabLabel--selected': {
              color: '#166534', // brand-800
            },
            '.Block': {
              borderRadius: '12px',
            },
          },
        },
      }}
    >
      <CheckoutForm amount={amount} currency={currency} onSuccess={onSuccess} onError={onError} />
    </Elements>
  );
}

function CheckoutForm({
  amount,
  currency,
  onSuccess,
  onError,
}: {
  amount: number;
  currency: string;
  onSuccess: () => void;
  onError: (message: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href,
      },
      redirect: 'if_required',
    });

    if (error) {
      onError(error.message || 'Payment failed');
      setIsProcessing(false);
    } else {
      onSuccess();
    }
  }

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
  }).format(amount);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement
        options={{
          layout: 'tabs',
          wallets: {
            applePay: 'auto',
            googlePay: 'auto',
          },
        }}
      />
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="btn-primary w-full text-base py-4 mt-2"
      >
        {isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            Processing...
          </span>
        ) : (
          `Pay ${currency} ${formattedAmount}`
        )}
      </button>
    </form>
  );
}

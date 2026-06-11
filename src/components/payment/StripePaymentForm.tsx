'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { GraphQLClient } from '@/lib/graphql-client';
import { createStripePaymentIntent } from '@/graphql/mutations';
import { useAuth } from '@/contexts/AuthContext';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

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
        appearance: {
          theme: 'flat',
          variables: {
            colorPrimary: '#2563eb',
            colorBackground: '#ffffff',
            colorText: '#1f2937',
            colorDanger: '#ef4444',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            spacingUnit: '4px',
            borderRadius: '12px',
            fontSizeBase: '15px',
          },
          rules: {
            '.Input': {
              border: '1.5px solid #e5e7eb',
              boxShadow: 'none',
              padding: '12px 14px',
            },
            '.Input:focus': {
              border: '1.5px solid #2563eb',
              boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.1)',
            },
            '.Label': {
              fontSize: '13px',
              fontWeight: '500',
              color: '#6b7280',
              marginBottom: '6px',
            },
            '.Tab': {
              border: '1.5px solid #e5e7eb',
              borderRadius: '12px',
              padding: '12px 16px',
            },
            '.Tab--selected': {
              border: '1.5px solid #2563eb',
              backgroundColor: '#eff6ff',
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

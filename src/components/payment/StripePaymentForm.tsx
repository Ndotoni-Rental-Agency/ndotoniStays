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
          { bookingId }
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
      <div className="animate-pulse space-y-3">
        <div className="h-12 bg-ink-100 rounded-lg" />
        <div className="h-12 bg-ink-100 rounded-lg" />
      </div>
    );
  }

  if (!clientSecret) {
    return null;
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="btn-primary w-full text-base py-4"
      >
        {isProcessing ? 'Processing...' : `Pay ${currency} ${formattedAmount}`}
      </button>
    </form>
  );
}

'use client';

import { useState } from 'react';
import { GraphQLClient } from '@/lib/graphql-client';
import { submitContactInquiry } from '@/graphql/mutations';
import { CheckCircle2, Mail, Linkedin, Globe, Phone, Send } from 'lucide-react';
import { MPESA_NUMBER } from './investData';

export function ContactSection() {
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitState('loading');
    try {
      await GraphQLClient.executePublic(submitContactInquiry, {
        input: {
          name: contactForm.name,
          email: contactForm.email,
          inquiryType: 'PARTNERSHIP',
          subject: 'Investment Inquiry – Ndotoni Stays',
          message: contactForm.message,
        },
      });
      setSubmitState('success');
      setContactForm({ name: '', email: '', message: '' });
    } catch (err) {
      console.error('Failed to submit inquiry:', err);
      setSubmitState('error');
    }
  };

  return (
    <section className="overflow-hidden bg-white px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-3xl font-bold">Get in Touch</h2>

        <div className="mt-12 grid gap-10 sm:grid-cols-2">
          {/* Form */}
          {submitState === 'success' ? (
            <div className="rounded-xl bg-brand-50 border border-brand-100 p-6 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-brand-600" />
              <p className="mt-3 font-semibold text-ink-900">Message sent!</p>
              <p className="mt-1 text-sm text-ink-500">We&apos;ll get back to you within 24 hours.</p>
            </div>
          ) : (
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-700">Name</label>
              <input
                type="text"
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                className="mt-1 w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700">Email</label>
              <input
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                className="mt-1 w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700">Message</label>
              <textarea
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                rows={4}
                className="mt-1 w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                required
              />
            </div>
            {submitState === 'error' && (
              <p className="text-sm text-red-600">Something went wrong. Please try again.</p>
            )}
            <button
              type="submit"
              disabled={submitState === 'loading'}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
            >
              {submitState === 'loading' ? 'Sending...' : 'Send Message'}
              <Send className="h-4 w-4" />
            </button>
          </form>
          )}

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <a
              href="mailto:makoye224@gmail.com"
              className="flex items-center gap-3 rounded-xl border border-ink-100 bg-ink-50 p-4 transition hover:border-brand-200"
            >
              <Mail className="h-5 w-5 text-brand-500" />
              <span className="text-sm font-medium text-ink-700">makoye224@gmail.com</span>
            </a>
            <a
              href="https://www.linkedin.com/in/emmanuel-makoye-63a7611b7/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-ink-100 bg-ink-50 p-4 transition hover:border-brand-200"
            >
              <Linkedin className="h-5 w-5 text-brand-500" />
              <span className="text-sm font-medium text-ink-700">LinkedIn — Emmanuel Makoye</span>
            </a>
            <a
              href="https://ndotonistays.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-ink-100 bg-ink-50 p-4 transition hover:border-brand-200"
            >
              <Globe className="h-5 w-5 text-brand-500" />
              <span className="text-sm font-medium text-ink-700">ndotonistays.com</span>
            </a>
            <a
              href={`tel:${MPESA_NUMBER.replace(/\s/g, '')}`}
              className="flex items-center gap-3 rounded-xl border border-ink-100 bg-ink-50 p-4 transition hover:border-brand-200"
            >
              <Phone className="h-5 w-5 text-brand-500" />
              <span className="text-sm font-medium text-ink-700">{MPESA_NUMBER}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

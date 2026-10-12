'use client';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { GraphQLClient } from '@/lib/graphql-client';
import { rememberReferral, validReferralCode } from '@/lib/referral/attribution';

/** Remembers a shared stay's `?ref=` Link code, so a later booking credits the friend who shared it. */
export function ReferralCapture() {
  const ref = useSearchParams().get('ref');
  useEffect(() => {
    if (!validReferralCode(ref)) return;
    GraphQLClient.executePublic<{ resolveReferralLink: { code: string } | null }>(
      'query ResolveReferralLink($code: String!) { resolveReferralLink(code: $code) { code } }', { code: ref }
    ).then(data => { if (data.resolveReferralLink) rememberReferral(ref); }).catch(() => { /* Optional: the stay still works without it. */ });
  }, [ref]);
  return null;
}

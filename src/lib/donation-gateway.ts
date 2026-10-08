import { NextRequest, NextResponse } from 'next/server';

const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
export async function donationGateway(request: NextRequest, path: string, method: 'GET' | 'POST') {
  const base = process.env.DONATION_API_URL;
  const key = process.env.DONATION_GATEWAY_KEY;
  if (!base || !key) return path === '/donations/config' ? json({ status: 'preparing' }) : json({ error: 'Donations are not open yet.' }, 503);
  try {
    const url = new URL(base);
    if (url.protocol !== 'https:' && !(process.env.NODE_ENV !== 'production' && url.hostname === '127.0.0.1')) throw new Error('Invalid donation API URL');
    const origin = request.headers.get('origin');
    if (method === 'POST' && origin !== new URL(request.url).origin) return json({ error: 'Invalid request origin.' }, 403);
    const body = method === 'POST' ? await request.text() : undefined;
    if (body && Buffer.byteLength(body) > 8192) return json({ error: 'Request too large.' }, 413);
    const token = request.headers.get('x-donation-access-token') || '';
    if (token.length > 100) return json({ error: 'Invalid access token.' }, 400);
    // Use platform-provided client IP, not an arbitrary browser-supplied header.
    const source = request.ip || (process.env.VERCEL === '1' ? request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() : undefined) || 'unknown';
    const response = await fetch(new URL(path, url.origin), {
      method, cache: 'no-store', signal: AbortSignal.timeout(20000), body,
      headers: { 'Content-Type': 'application/json', 'X-Donation-Gateway-Key': key, 'X-Donation-Source': source, 'X-Donation-Access-Token': token },
    });
    const data = await response.json();
    return json(data, response.status);
  } catch {
    return path === '/donations/config' ? json({ status: 'preparing' }) : json({ error: 'Payment verification is unavailable. Retry this request before starting another donation.' }, 503);
  }
}

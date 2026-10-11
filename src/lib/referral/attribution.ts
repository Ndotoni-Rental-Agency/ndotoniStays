const COOKIE = 'ndotoni_referral';
const STORAGE = 'ndotoni:referral';
const DAYS = 30;
export const validReferralCode = (code: unknown): code is string => typeof code === 'string' && /^[a-f0-9]{16}$/.test(code);

export function pendingReferral(): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const cookie = document.cookie.split('; ').find(c => c.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
  if (validReferralCode(cookie)) return cookie;
  try {
    const raw = localStorage.getItem(STORAGE);
    const value = raw ? JSON.parse(raw) : null;
    if (value && validReferralCode(value.code) && value.expiresAt > Date.now()) return value.code;
    localStorage.removeItem(STORAGE);
  } catch { /* Cookies remain available when local storage is disabled. */ }
}

export function rememberReferral(code: string): string | undefined {
  if (!validReferralCode(code)) return undefined;
  const existing = pendingReferral();
  if (existing) return existing;
  document.cookie = `${COOKIE}=${code}; Path=/; Max-Age=${DAYS * 86400}; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
  try { localStorage.setItem(STORAGE, JSON.stringify({ code, expiresAt: Date.now() + DAYS * 86400000 })); }
  catch { /* First-party cookie is the primary store. */ }
  return pendingReferral();
}

export function clearPendingReferral() {
  document.cookie = `${COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  try { localStorage.removeItem(STORAGE); } catch { /* No fallback to clear. */ }
}

export const CLAIM_REFERRAL = 'mutation ClaimReferralLink($code: String!) { claimReferralLink(code: $code) { success message } }';
let claiming: Promise<void> | undefined;
export async function syncReferral(send: (query: string, variables: { code: string }) => Promise<unknown>): Promise<void> {
  const code = pendingReferral();
  if (!code) return;
  if (!claiming) claiming = send(CLAIM_REFERRAL, { code }).then(() => { clearPendingReferral(); }).finally(() => { claiming = undefined; });
  await claiming;
}

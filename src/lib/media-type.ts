/**
 * Standard content type for an upload: 'image/jpeg', never 'image/jpg' (not a real type;
 * WhatsApp rejects photos served with it). Some browsers and pickers report it anyway.
 */
export function normalizeMediaType(type: string): string {
  const t = (type || '').trim().toLowerCase();
  return t === 'image/jpg' || t === 'image/pjpeg' ? 'image/jpeg' : t;
}

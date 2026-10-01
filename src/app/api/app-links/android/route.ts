/**
 * Served at /.well-known/assetlinks.json (rewrite in next.config): tells Android that the Ndotoni
 * app may open this site's links (the app limits it to /link-whatsapp/*). ANDROID_CERT_SHA256 is
 * the app signing certificate's SHA-256 fingerprint (Play Console → App integrity); several can be
 * given, comma-separated. Without it this is a 404 and links simply open the website.
 */

export const dynamic = 'force-static';

export function GET() {
  const fingerprints = (process.env.ANDROID_CERT_SHA256 || '').split(',').map((f) => f.trim()).filter(Boolean);
  if (!fingerprints.length) return new Response('Not found', { status: 404 });
  const body = [
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: { namespace: 'android_app', package_name: 'com.ndotoni.app', sha256_cert_fingerprints: fingerprints },
    },
  ];
  return Response.json(body, { headers: { 'Cache-Control': 'public, max-age=3600' } });
}

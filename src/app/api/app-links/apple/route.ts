/**
 * Served at /.well-known/apple-app-site-association (rewrite in next.config): tells iOS that the
 * Ndotoni app may open /link-whatsapp/* links from this site. APPLE_TEAM_ID is the Apple
 * Developer team ID; without it this is a 404 and links simply open the website.
 */

export const dynamic = 'force-static';

export function GET() {
  const teamId = process.env.APPLE_TEAM_ID;
  if (!teamId) return new Response('Not found', { status: 404 });
  const body = {
    applinks: {
      details: [
        {
          appIDs: [`${teamId}.com.ndotoni.app`],
          components: [{ '/': '/link-whatsapp/*', comment: 'Link a WhatsApp number to an account' }],
        },
      ],
    },
  };
  return Response.json(body, { headers: { 'Cache-Control': 'public, max-age=3600' } });
}

import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/host/', '/profile/', '/edit/', '/bookings/', '/pay/'],
      },
    ],
    sitemap: 'https://ndotonistays.com/sitemap.xml',
  };
}

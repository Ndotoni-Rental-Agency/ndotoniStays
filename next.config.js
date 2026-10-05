/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 640],
  },
  // App links: iOS and Android read these to open /link-whatsapp/* in the Ndotoni app
  async rewrites() {
    return [
      { source: '/.well-known/apple-app-site-association', destination: '/api/app-links/apple' },
      { source: '/.well-known/assetlinks.json', destination: '/api/app-links/android' },
    ];
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'ndotonistays.com' }],
        destination: 'https://www.ndotonistays.com/:path*',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
    domains: [
      'd2bstvyam1bm1f.cloudfront.net',
      'd3qiuw9agheakm.cloudfront.net',
      'images.unsplash.com',
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 640],
    qualities: [75, 85, 95],
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
    domains: [
      'd2bstvyam1bm1f.cloudfront.net',
      'd3qiuw9agheakm.cloudfront.net',
      'images.unsplash.com',
    ],
    formats: ['image/webp', 'image/avif'],
  },
};

module.exports = nextConfig;

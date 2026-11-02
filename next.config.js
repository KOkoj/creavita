/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for Netlify/Vercel. Keep it off in `next dev` so dynamic
  // routes with generateStaticParams work during local testing.
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;

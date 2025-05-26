/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Optimized for hosting platforms
  images: {
    domains: ['localhost'],
    // Add your production domain here when you know it
    // domains: ['localhost', 'your-production-domain.com'],
    unoptimized: process.env.NODE_ENV !== 'production',
  },
  // Disable TypeScript checking during build - rely on your IDE for this
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },
}

module.exports = nextConfig 
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['localhost'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
  outputFileTracingRoot: '/home/shaheennazir/Desktop/prepxiq/.worktrees/nextjs-migration',
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
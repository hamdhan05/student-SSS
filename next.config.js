const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === 'development',
  workboxOptions: {
    disableDevLogs: true,
  },
});

/** @type {import('next').NextConfig} */

// Detect if we are building for GitHub Pages (set in CI workflow)
const isGithubPages = process.env.GITHUB_PAGES === 'true';
const repoName = 'student-SSS';

const nextConfig = {
  reactStrictMode: true,

  // Static export for GitHub Pages only
  ...(isGithubPages && {
    output: 'export',
    basePath: `/${repoName}`,
    assetPrefix: `/${repoName}/`,
  }),

  images: {
    domains: [
      'your-supabase-project.supabase.co',
      'ehvbvzszsexbhzhujacj.supabase.co',
    ],
    // GitHub Pages does not support Next.js image optimization
    ...(isGithubPages && { unoptimized: true }),
  },

  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
};

module.exports = withPWA(nextConfig);

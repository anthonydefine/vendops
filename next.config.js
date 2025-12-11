/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rruuihnwdlyqkhboobgb.supabase.co',
        port: '',
        search: '',
      },
    ],
  },
};

module.exports = nextConfig;

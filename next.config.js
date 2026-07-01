/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: 'build',
  reactStrictMode: true,
  images: {
    domains: ['admin.bookwindow.in','bookwindow.in'],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "admin.bookwindow.in",
      },
    ],
  },
};

module.exports = nextConfig;

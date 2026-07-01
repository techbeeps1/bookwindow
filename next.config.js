/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: "build",
  reactStrictMode: true,

  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    // images.domains is deprecated, so you can remove it
    remotePatterns: [
      {
        protocol: "https",
        hostname: "admin.bookwindow.in",
      },
      {
        protocol: "https",
        hostname: "bookwindow.in",
      },
    ],
  },
};

module.exports = nextConfig;
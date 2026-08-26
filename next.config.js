/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
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

  async redirects() {
    return [
      // Product detail legacy routes
      {
        source: "/product-detail/:slug*",
        destination: "/product/:slug*",
        permanent: true,
      },
      // Terms & Conditions
      {
        source: "/terms-and-conditions",
        destination: "/terms",
        permanent: true,
      },
      {
        source: "/terms-conditions",
        destination: "/terms",
        permanent: true,
      },
      {
        source: "/terms.php",
        destination: "/terms",
        permanent: true,
      },
      // Contact Us
      {
        source: "/contact.php",
        destination: "/contact-us",
        permanent: true,
      },
      {
        source: "/contact-us.php",
        destination: "/contact-us",
        permanent: true,
      },
      // About Us
      {
        source: "/about-us.php",
        destination: "/about-us",
        permanent: true,
      },
      {
        source: "/about.php",
        destination: "/about-us",
        permanent: true,
      },
      // Tutor / Tuitor
      {
        source: "/tuitor.php",
        destination: "/tutor",
        permanent: true,
      },
      {
        source: "/tutor.php",
        destination: "/tutor",
        permanent: true,
      },
      {
        source: "/tuitor",
        destination: "/tutor",
        permanent: true,
      },
      // Enquiry
      {
        source: "/enquiry.php",
        destination: "/contact-us",
        permanent: true,
      },
      {
        source: "/enquiry",
        destination: "/contact-us",
        permanent: true,
      },
      // Category / Author
      {
        source: "/category/author",
        destination: "/publications",
        permanent: true,
      },
      {
        source: "/author",
        destination: "/publications",
        permanent: true,
      },
      {
        source: "/author/:slug*",
        destination: "/publication/:slug*",
        permanent: true,
      },
      // Policies
      {
        source: "/privacy-policy.php",
        destination: "/privacy-policy",
        permanent: true,
      },
      {
        source: "/privacy.php",
        destination: "/privacy-policy",
        permanent: true,
      },
      {
        source: "/return-policy.php",
        destination: "/return-policy",
        permanent: true,
      },
      {
        source: "/returns.php",
        destination: "/return-policy",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
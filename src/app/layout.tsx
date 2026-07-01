import "./globals.css";
import type { Metadata } from "next";

import { Roboto } from "next/font/google";
import { Layout, FixedPlugin } from "@/components";
import Script from "next/script";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bookwindow",
  description: "Bookwindow",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
 
  return (
    <html lang="en">
      <head>
        <script
          defer
          data-site="YOUR_DOMAIN_HERE"
          src="https://api.nepcha.com/js/nepcha-analytics.js"
        ></script>
        {/* Google tag (gtag.js)  */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=G-Q8BCCV1SLL`}
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-Q8BCCV1SLL');
          `}
        </Script>
        <link rel="shortcut icon" href="/favicon.png" type="image/png" />
        <link
          rel="stylesheet"
          href="https://unpkg.com/placeholder-loading/dist/css/placeholder-loading.min.css"
        ></link>
      </head>
      <body className={roboto.className}>
        <Layout>
          {children}
          <FixedPlugin />
        </Layout>
      </body>
    </html>
  );
}

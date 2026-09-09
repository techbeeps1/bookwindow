import "./globals.css";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import Script from "next/script";
import { FixedPlugin } from "@/components";
//import MainWraper from "@/components/MainWraper";
import ReduxProvider from "@/lib/provider";
import AppInitializer from "@/components/AppInitializer";
import { Footer, Navbar } from "@/components";
import config from "@/app/config";
import CartDrawer from "@/components/cart/CartDrawer";
import { Toaster } from "react-hot-toast";

async function getMenu() {
  try {
    const response = await fetch(`${config.apiUrl}api/menus/header_menu`, {
      next: {
        revalidate: 3600,
      },
    });
    if (!response.ok) {
      return { header: [], footer: [] };
    }

    return response.json();
  } catch (err) {
    console.error("Failed to fetch menu:", err);
    return { header: [], footer: [] };
  }
}

async function getGlobalSettings() {
  try {
    const response = await fetch(`${config.apiUrl}api/global-settings`, {
      next: {
        revalidate: 300,
      },
    });
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data?.data || null;
  } catch (error) {
    console.error("Failed to fetch global settings:", error);
    return null;
  }
}

import JsonLd from "@/components/seo/JsonLd";
import { generateOrganizationSchema, generateWebSiteSchema } from "@/helper/schemaHelper";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bookwindow",
  description: "Bookwindow",
  metadataBase: new URL("https://bookwindow.in"),
};


export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menuData, globalSettings] = await Promise.all([
    getMenu(),
    getGlobalSettings(),
  ]);

  const orgSchema = generateOrganizationSchema();
  const webSiteSchema = generateWebSiteSchema();

  const gaId = globalSettings?.scripts?.google_analytics?.measurement_id || "G-Q8BCCV1SLL";
  const pixelId = globalSettings?.scripts?.meta_pixel?.pixel_id;

  return (
    <html lang="en">
      <head>
        {/* Dynamic Favicon */}
        {globalSettings?.branding?.site_favicon && (
          <link rel="icon" href={globalSettings.branding.site_favicon} />
        )}

        {/* Schema.org Global Structured Data */}
        <JsonLd schema={[orgSchema, webSiteSchema]} />

        {/* Google Analytics (Dynamic with fallback) */}
        {gaId && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}');
                `,
              }}
            />
          </>
        )}

        {/* Additional GA snippet if configured */}
        {globalSettings?.scripts?.google_analytics?.script_code && (
          <div
            style={{ display: "contents" }}
            dangerouslySetInnerHTML={{
              __html: globalSettings.scripts.google_analytics.script_code,
            }}
          />
        )}

        {/* Google Tag Manager (Head Script) */}
        {globalSettings?.scripts?.gtm?.head_code && (
          <div
            style={{ display: "contents" }}
            dangerouslySetInnerHTML={{
              __html: globalSettings.scripts.gtm.head_code,
            }}
          />
        )}

        {/* Facebook / Meta Pixel */}
        {pixelId && (
          <Script
            id="meta-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${pixelId}');
                fbq('track', 'PageView');
              `,
            }}
          />
        )}

        {/* Additional Meta Pixel Code if configured */}
        {globalSettings?.scripts?.meta_pixel?.pixel_code && (
          <div
            style={{ display: "contents" }}
            dangerouslySetInnerHTML={{
              __html: globalSettings.scripts.meta_pixel.pixel_code,
            }}
          />
        )}

        {/* Custom Head Scripts (Search Console, Clarity, Custom Meta) */}
        {globalSettings?.scripts?.custom_head_scripts && (
          <div
            style={{ display: "contents" }}
            dangerouslySetInnerHTML={{
              __html: globalSettings.scripts.custom_head_scripts,
            }}
          />
        )}
      </head>
      <body className={roboto.className}>
        {/* GTM Body (NoScript) immediately after <body> */}
        {globalSettings?.scripts?.gtm?.body_code && (
          <div
            style={{ display: "contents" }}
            dangerouslySetInnerHTML={{
              __html: globalSettings.scripts.gtm.body_code,
            }}
          />
        )}

        <ReduxProvider>
          <AppInitializer />
          <Navbar
            menuData={menuData?.header}
            siteLogo={globalSettings?.branding?.site_logo}
          />

          {children}
          <CartDrawer />
          <FixedPlugin />
          <Footer
            menuData={menuData?.footer}
            siteLogo={
              globalSettings?.branding?.site_logo_dark ||
              globalSettings?.branding?.site_logo
            }
          />
          <Toaster position="top-right" reverseOrder={false} />
        </ReduxProvider>

        {/* Custom Footer Scripts (Live Chat, WhatsApp widget, etc.) */}
        {globalSettings?.scripts?.custom_footer_scripts && (
          <div
            style={{ display: "contents" }}
            dangerouslySetInnerHTML={{
              __html: globalSettings.scripts.custom_footer_scripts,
            }}
          />
        )}
      </body>
    </html>
  );
}

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
  const response = await fetch(`${config.apiUrl}api/menus/header_menu`, {
    next: {
      revalidate: 3600,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch menu");
  }

  return response.json();
}

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
  const menuData = await getMenu();
  return (
    <html lang="en">
      <head>
        {/* Google Analytics */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-Q8BCCV1SLL"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-Q8BCCV1SLL');
            `,
          }}
        />
      </head>
      <body className={roboto.className}>
        <ReduxProvider>
          <AppInitializer />
          <Navbar menuData={menuData.header} />

          {children}
          <CartDrawer />
          <FixedPlugin />
          <Footer menuData={menuData.footer} />
          <Toaster position="top-right" reverseOrder={false} />
        </ReduxProvider>
      </body>
    </html>
  );
}

import "./globals.css";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { FixedPlugin } from "@/components";
//import MainWraper from "@/components/MainWraper";
import ReduxProvider from "@/lib/provider";
import AppInitializer from "@/components/AppInitializer";
import { Footer, Navbar } from "@/components";
import config from "@/app/config";
import CartDrawer from "@/components/cart/CartDrawer";

async function getMenu() {
  const response = await fetch(`${config.apiUrl}api/menus/header_menu`, {
    cache: "no-store",
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
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const menuData = await getMenu();
  return (
    <html lang="en">
      <head></head>
      <body className={roboto.className}>
        <ReduxProvider>
          <AppInitializer />
          <Navbar menuData={menuData.header} />

          {children}
           <CartDrawer/>
           <FixedPlugin />
          <Footer menuData={menuData.footer} />
        </ReduxProvider>
      </body>
    </html>
  );
}

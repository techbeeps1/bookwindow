import "./globals.css";
import type { Metadata } from "next";

import { Roboto } from "next/font/google";
import {  FixedPlugin } from "@/components";
import MainWraper from "@/components/MainWraper";


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
      

      </head>
      <body className={roboto.className}>
        <MainWraper>
          {children}
          <FixedPlugin />
        </MainWraper>
      </body>
    </html>
  );
}

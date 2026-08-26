import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Secure Checkout | Bookwindow",
  description: "Complete your book order securely with flexible payment options at Bookwindow.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

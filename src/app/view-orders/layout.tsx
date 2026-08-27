import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Orders & History | Bookwindow",
  description: "Track your book shipments and view your past orders on Bookwindow.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ViewOrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

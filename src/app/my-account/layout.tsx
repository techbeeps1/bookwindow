import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Account & Profile Dashboard | Bookwindow",
  description: "Manage your user profile, delivery addresses, and settings on Bookwindow.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MyAccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Wishlist | Bookwindow",
  description: "View and manage your saved books in your personal wishlist on Bookwindow.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function WishlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

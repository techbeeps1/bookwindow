import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In to Your Account | Bookwindow",
  description: "Sign in to Bookwindow to access your orders, wishlist, and shopping cart.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

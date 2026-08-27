import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create an Account | Bookwindow",
  description: "Create a new Bookwindow account to purchase books, track orders, and save favorites.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

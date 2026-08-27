import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Your Password | Bookwindow",
  description: "Reset and recover your Bookwindow account password.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

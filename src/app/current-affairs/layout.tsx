import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Current Affairs & Daily GK Updates (Hindi & English) | Bookwindow",
  description:
    "Stay informed with daily and monthly current affairs updates, national & international news, and GK modules for competitive examinations at Bookwindow.",
  alternates: {
    canonical: "/current-affairs",
  },
  openGraph: {
    title: "Current Affairs & Daily GK Updates (Hindi & English) | Bookwindow",
    description:
      "Stay informed with daily and monthly current affairs updates, national & international news, and GK modules for competitive examinations at Bookwindow.",
    url: "https://bookwindow.in/current-affairs",
  },
};

export default function CurrentAffairsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

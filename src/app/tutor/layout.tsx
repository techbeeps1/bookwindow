import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tutor & Mentorship Program | Bookwindow",
  description:
    "Join the Bookwindow tutor network or connect with experienced educators and mentors for competitive exam preparation.",
  alternates: {
    canonical: "/tutor",
  },
  openGraph: {
    title: "Tutor & Mentorship Program | Bookwindow",
    description:
      "Join the Bookwindow tutor network or connect with experienced educators and mentors for competitive exam preparation.",
    url: "https://bookwindow.in/tutor",
  },
};

export default function TutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

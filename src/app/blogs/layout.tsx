import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blogs, Articles & Exam Preparation Guides | Bookwindow",
  description:
    "Read comprehensive blogs, study strategies, book reviews, and exam preparation tips for competitive tests at Bookwindow.",
  alternates: {
    canonical: "/blogs",
  },
  openGraph: {
    title: "Blogs, Articles & Exam Preparation Guides | Bookwindow",
    description:
      "Read comprehensive blogs, study strategies, book reviews, and exam preparation tips for competitive tests at Bookwindow.",
    url: "https://bookwindow.in/blogs",
  },
};

export default function BlogsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

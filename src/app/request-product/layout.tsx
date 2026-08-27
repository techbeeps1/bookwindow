import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Request a Book / Product | Bookwindow",
  description:
    "Looking for a book that is not listed on our store? Submit a product request and our team will arrange it for you.",
  alternates: {
    canonical: "/request-product",
  },
  openGraph: {
    title: "Request a Book / Product | Bookwindow",
    description:
      "Looking for a book that is not listed on our store? Submit a product request and our team will arrange it for you.",
    url: "https://bookwindow.in/request-product",
  },
};

export default function RequestProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

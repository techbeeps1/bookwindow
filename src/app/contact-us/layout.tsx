import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - Customer Support & Helpdesk | Bookwindow",
  description:
    "Get in touch with Bookwindow customer support for book orders, shipping queries, and bulk inquiries.",
  alternates: {
    canonical: "/contact-us",
  },
  openGraph: {
    title: "Contact Us - Customer Support & Helpdesk | Bookwindow",
    description:
      "Get in touch with Bookwindow customer support for book orders, shipping queries, and bulk inquiries.",
    url: "https://bookwindow.in/contact-us",
  },
};

export default function ContactUsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

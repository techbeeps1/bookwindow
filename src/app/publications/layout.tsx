import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Publications & Book Publishers Directory | Bookwindow",
  description:
    "Discover verified books directly from renowned Indian publications including Utkarsh, Arihant, Disha, Kiran, and more at Bookwindow.",
  alternates: {
    canonical: "/publications",
  },
  openGraph: {
    title: "Publications & Book Publishers Directory | Bookwindow",
    description:
      "Discover verified books directly from renowned Indian publications including Utkarsh, Arihant, Disha, Kiran, and more at Bookwindow.",
    url: "https://bookwindow.in/publications",
  },
};

export default function PublicationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

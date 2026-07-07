import { Footer, Navbar } from "@/components";
import config from "@/app/config";

async function getMenu() {
  const response = await fetch(
    `${config.apiUrl}api/menus/header_menu`,
    {
      cache: "no-store", // SSR on every request
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch menu");
  }

  return response.json();
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const menuData = await getMenu();

  return (
    <>
      <Navbar menuData={menuData.header} />
      {children}
      <Footer menuData={menuData.footer} />
    </>
  );
}
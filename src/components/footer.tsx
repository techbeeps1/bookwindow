"use client";

import { Typography } from "@material-tailwind/react";
import logo from "../../public/logos/logo.png";
import facebook from "../../public/logos/facebook-1-svgrepo-com.svg";
import instagram from "../../public/logos/instagram-1-svgrepo-com.svg";
import youtube from "../../public/logos/youtube-color-svgrepo-com.svg";
import Image from "next/image";
import React from "react";
import axios from "axios";
import config from "@/app/config";

const LINKS = [
  {
    title: "Product",
    items: [
      { label: "About Us", url: "/about-us" },
      { label: "Contact Us", url: "/contact-us" },
      { label: "Privacy Policy", url: "/privacy-policy" },
      { label: "Returns", url: "/return-policy" },
      { label: "Terms & Conditions", url: "/terms" },
      { label: "Blogs", url: "#" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "Vendor Registration", url: "/registration" },
      { label: "Tutor", url: "/tutor" },
      { label: "Join WhatsApp", url: "https://wa.me/+919602368227" },
      { label: "Promo Code", url: "#" },
      { label: "Request Product", url: "/request-product" },
    ],
  },
  {
    title: "Resource",
    items: [
      { label: "Partners", url: "#" },
      { label: "Special Thanks", url: "#" },
      { label: "Subscription", url: "#" },
      { label: "Enquiry", url: "#" },
    ],
  },
];

// const currentYear = new Date().getFullYear();

export function Footer() {
  const [footerMenu, setFooterMenu] = React.useState([] as any);
  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios({
          method: "get",
          url: `${config.apiUrl}api/menus/Footer_Menu_1`,
          responseType: "json",
        });
        setFooterMenu(response.data);
      } catch (error) {
        console.log("error", error);
      } finally {
        // console.log("An error occured");
      }
    };

    fetchCategories();
  }, []);

  React.useEffect(() => {
    // console.log("footerMenu", footerMenu);
  }, [footerMenu]);
  function chunkArray(array: any[], size: number) {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  }
  const chunkedMenu = chunkArray(
    footerMenu?.data || [],
    Math.ceil((footerMenu?.data?.length || 0) / 3)
  );

  return (
    <footer className="relative w-full bg-gray-200">
      <div className="mx-auto w-full max-w-7xl px-8 pt-8 pb-8">
        <div className="grid justify-between gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:divide-y-0 xl:grid-cols-4">
          <div>
            <a href="/">
              <Image
                src={logo}
                alt={"book window logo"}
                className="h-[55px] w-[215px]"
              />
            </a>
            <div className="flex px-2 py-2">
              <a href="https://m.facebook.com/100064054598576/" target="_blank">
                <div className="bg-white p-2 border rounded-full shadow-lg hover:bg-orange-100">
                  <Image src={facebook} alt="facebook" className="w-10 h-10" />
                </div>
              </a>
              <a
                href="https://www.instagram.com/bookwindow_2.0?igsh=MXV5ZTVmcTIxcGRyNA=="
                target="_blank"
              >
                <div className="bg-white p-2 border rounded-full ml-2 shadow-lg hover:bg-orange-100">
                  <Image
                    src={instagram}
                    alt="instagram"
                    className="w-10 h-10"
                  />
                </div>
              </a>
              <a href="" target="_blank">
                <div className="bg-white p-2 border rounded-full ml-2 shadow-lg hover:bg-orange-100">
                  <Image src={youtube} alt="youtube" className="w-10 h-10" />
                </div>
              </a>
            </div>
          </div>
          {/* Footer menu columns */}
          {chunkedMenu.map((column, colIndex) => (
            <div key={colIndex}>
              <ul>
                {column.map((menu: any) => (
                  <li key={menu.id}>
                    <Typography
                      as="a"
                      href={menu.url}
                      color="gray"
                      className="py-1.5 font-normal transition-colors hover:text-blue-gray-900"
                      {...({} as React.ComponentProps<typeof Typography>)}
                    >
                      {menu.name}
                    </Typography>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
export default Footer;

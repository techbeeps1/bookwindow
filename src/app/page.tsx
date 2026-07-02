"use client";
// components
import { Navbar, Footer } from "@/components";

// sections
import Hero from "../components/hero";
import TopBookCategories from "../components/top-book-categories";
import BrandsCategory from "../components/brands-category";
import PublicationsCategory from "../components/publications-category";
import HobbyCategory from "../components/hobby-category";
import BackToSchoolBooks from "../components/back-to-school-books";
import CarouselFeatures from "../components/carousel-features";
import GetYourBookFromUs from "../components/get-your-book-from-us";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import React from "react";
import axios from "axios";
import config from "./config";

export default function Campaign() {
  const [itemsCount, setItemsCount] = useState<number>(0);
  const [homePageData, setHomePageData] = React.useState([] as any);
  
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  React.useEffect(() => {
    const fetchAboutUsData = async () => {
      try {
        const response = await axios({
          method: "get",
          url: `${config.apiUrl}api/home-page`,
          responseType: "json",
        });
        setHomePageData(response.data);
      } catch (error) {
        console.log("error", error);
      } finally {
        // console.log("An error occured");
      }
    };

    fetchAboutUsData();
  }, []);

  React.useEffect(() => {
    // console.log("homePageData", homePageData);
  }, [homePageData]);

  const handleItemsCountUpdate = (count: number) => {
    setItemsCount(count);
  };

  const [highlightDiv, setHighlightDiv] = useState(false);
  const divRef: any = useRef(null); // Create a reference to the Div

  const handleButtonClick = () => {
    // Scroll to the Div in the topcategory component
    divRef.current.scrollIntoView({ behavior: "smooth", block: "center" });

    // Highlight the div
    setHighlightDiv(true);

    // Reset the highlight after 3 seconds
    setTimeout(() => setHighlightDiv(false), 2000);
  };

  return (
    <>
      <Navbar items_count={itemsCount} />
        <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <Hero
          onButtonClick={handleButtonClick}
          bannerData={homePageData?.banner}
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <TopBookCategories
          highlightDiv={highlightDiv}
          divRef={divRef}
          category_section={homePageData?.category_section}
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.85, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <BrandsCategory />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.88, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <PublicationsCategory />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <HobbyCategory />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.92, ease: "easeOut" }}
        viewport={{ once: true }}
        className="w-full"
      >
        <img
          src="/image/banner-img.jpg"
          alt="Rare & Reloved Banner"
          className="w-full h-[800px] object-cover"
        />
      </motion.div>
      <Footer />
    </>
  );
}

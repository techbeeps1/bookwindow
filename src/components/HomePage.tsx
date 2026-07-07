"use client";

import Hero from "@/components/hero";
import TopBookCategories from "@/components/top-book-categories";


import { useRef, useState } from "react";
import { motion } from "framer-motion";
import React from "react";
import axios from "axios";

import { BestSubjects } from "@/components/BestSubjects";
import PublicationsCategory from "@/components/PublicationsCategory";
import HobbyCategory from "@/components/HobbyCategory";
import config from "../app/config";

export default function HomePage({homePageData}:any) {


  
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);



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
        <BestSubjects/>
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
          src="/image/banner-2-.png"
          alt="Rare & Reloved Banner"
          className="w-full xl:h-[700px] lg:h-[580px] object-cover"
        />
      </motion.div>
     
    </>
  );
}

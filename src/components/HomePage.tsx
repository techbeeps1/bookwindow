"use client";

import Hero from "@/components/hero";
import TopBookCategories from "@/components/top-book-categories";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import React from "react";

import PublicationsCategory from "@/components/PublicationsCategory";
import HobbyCategory from "@/components/HobbyCategory";
import config from "../app/config";
import Image from "next/image";
import Link from "next/link";
import BestSubjects from "./BestSubjects";

export default function HomePage({ homePageData }: any) {

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);



  const [highlightDiv, setHighlightDiv] = useState(false);
  const divRef: any = useRef(null); // Create a reference to the Div


  return (
    <>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <Hero
          bannerData={homePageData?.sldier_section}
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
          category_section={homePageData?.popular_section}
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.85, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <BestSubjects data={homePageData?.mock_test_section} />        
        

      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.88, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <PublicationsCategory data={homePageData?.publication_section} />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <HobbyCategory data={homePageData?.hobby_section} />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.92, ease: "easeOut" }}
        viewport={{ once: true }}
        className="w-full"
      >
        <Link href={homePageData?.banner?.banner_button_url || "#"}>
          <Image

            width={1200}
            height={580}
            src={`${config.apiUrl}storage/app/public/${homePageData?.banner?.images}`}
            alt="Rare & Reloved Banner"
            className="w-full xl:h-[700px] lg:h-[580px] object-cover"
          />
        </Link>
      </motion.div>

    </>
  );
}

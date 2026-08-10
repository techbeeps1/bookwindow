"use client";
import { motion } from "framer-motion";
import CategoryCard from "@/components/category-card";

export interface HobbyItem {
  name: string;
  header: string;
  image: string;
  gradient?: string; // Tailwind bg-gradient classes, e.g. "from-[#dbeafe] to-[#eff6ff]"
  link?: string;
}

export function HobbyCategory({
  data
}: any) {
  return (
    <section className="py-[50px] mt-[50px] bg-[#F8F8F8]">
      {/* Header */}
      <div className="container mx-auto px-8">
        <div className="mb-6 grid place-items-center text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            viewport={{ once: true }}
            className="block antialiased tracking-normal font-sans text-2xl md:text-4xl font-semibold leading-[1.3] text-blue-gray-900"
          >
            {data?.hobby_subtitle}
          </motion.h2>
          <div className="w-20 h-[2px] bg-black my-4 rounded-full" />
        </div>

        {/* Grid Layout (2 columns centered) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-[650px] mx-auto">
          {data?.hobby_category?.map((item: any, index: any) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <CategoryCard
                cat_image={item.cat_image}
                cat_title={item.name}
                cat_slug={item.slug}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HobbyCategory;


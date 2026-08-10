"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import config from "@/app/config";
import Image from "next/image";

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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-[680px] mx-auto">
          {data?.hobby_category?.map((item: any, index: any) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <Link href={`/category/${item.slug}`} className="group block w-full cursor-pointer">
                {/* Card Image Box */}
                <div className="relative w-full px-[20px] py-[25px] rounded-[24px] overflow-hidden bg-gray-50 border border-gray-200 shadow-sm group-hover:shadow-md transition-all duration-300">
                  <Image
                    width={400}
                    height={500}
                    src={`${config.apiUrl}storage/app/public/${item.cat_image}`}
                    alt={item.name || "Category"}
                    className="w-full h-[300px] object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                </div>
                {/* Category Title Below Card */}
                <h3 className="text-center lg:break-keep break-all mt-3 font-semibold text-gray-800 text-sm md:text-[16px] group-hover:text-black transition-colors duration-300">
                  {item.name}
                </h3>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HobbyCategory;


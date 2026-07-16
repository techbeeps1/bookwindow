"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export interface HobbyItem {
  name: string;
  header: string;
  image: string;
  gradient?: string; // Tailwind bg-gradient classes, e.g. "from-[#dbeafe] to-[#eff6ff]"
  link?: string;
}

interface HobbyCategoryProps {
  title?: string;
  items?: HobbyItem[];
}

const DEFAULT_ITEMS: HobbyItem[] = [
  {
    name: "Travel",
    header: "Sara Inspiration",
    image: "/image/NCERT.jpg",    
    link: "/category",
  },
  {
    name: "Fashion",
    header: "Scriptures",
    image: "/image/Engineering.jpg",   
    link: "/category",
  },
];

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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {data?.hobby_category.map((item:any, index:any) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
            viewport={{ once: true }}
            className="bg-black rounded-[28px] p-4 overflow-hidden flex flex-col shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all duration-300 w-full"
          >
            <Link href={item.link || "/category"} className="w-full h-full flex flex-col">
              {/* Header Band */}
              <div className="text-white font-semibold text-base md:text-xl  font-sans text-center mb-4">
                {item.name}
              </div>              
              <div className={`flex-grow rounded-[25px] flex flex-col items-center justify-between aspect-square relative overflow-hidden`}>              
              <div className=" w-full h-full">              
                <div className="relative w-full flex justify-center items-center">
                  <img
                    src={item.cat_image}
                    alt={item.name}
                    className="h-full w-auto z-10 pointer-events-none"
                    draggable={false}
                    loading="lazy"
                  />
                </div>

                {/* Mirrored Reflection Image */}
                <div className="relative w-full h-[25%] overflow-hidden flex justify-center opacity-[0.25] select-none pointer-events-none mt-2">
                  <div className="relative w-full h-full flex justify-center">
                    <img
                      src={item.cat_image}
                      alt={`${item.name} reflection`}
                      className="h-[220%] w-auto max-w-[85%] object-contain transform scale-y-[-1] origin-top pointer-events-none"
                      draggable={false}
                      loading="lazy"
                    />
                  </div>
                  {/* Fade Gradient Overlay over the reflection */}
                  <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>
            </div>
            </Link>
          </motion.div>
        ))}
      </div>
      </div>
    </section>
  );
}

export default HobbyCategory;

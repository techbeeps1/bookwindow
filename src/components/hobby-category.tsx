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
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&h=800&q=80",    
    link: "/category",
  },
  {
    name: "Fashion",
    header: "Scriptures",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&h=800&q=80",   
    link: "/category",
  },
];

export function HobbyCategory({
  title = "Hobby",
  items = DEFAULT_ITEMS,
}: HobbyCategoryProps) {
  return (
    <section className="container mx-auto px-8 pb-20 pt-10">
      {/* Header */}
      <div className="mb-12 grid place-items-center text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          viewport={{ once: true }}
          className="block antialiased tracking-normal font-sans text-4xl font-semibold leading-[1.3] text-blue-gray-900"
        >
          {title}
        </motion.h2>
      </div>

      {/* Grid Layout (2 columns centered) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {items.map((item, index) => (
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
                {item.header}
              </div>              
              <div className={`flex-grow rounded-[25px] flex flex-col items-center justify-between aspect-square relative overflow-hidden`}>              
              <div className=" w-full h-full">              
                <div className="relative w-full flex justify-center items-center">
                  <img
                    src={item.image}
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
                      src={item.image}
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
    </section>
  );
}

export default HobbyCategory;

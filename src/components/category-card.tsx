"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import config from "@/app/config";

interface CategoryCardProps {
  cat_image: string;
  cat_title: string;
  cat_slug?: string;

}

function CategoryCard({
  cat_image,
  cat_title,
  cat_slug
}: CategoryCardProps) {
  // Dynamic slug based on title

  return (
    <Link href={`/category/${cat_slug}`} className="group block w-full cursor-pointer">
      <div className="relative w-full px-[20px] py-[25px] rounded-[24px] overflow-hidden bg-gray-50 border border-gray-200 shadow-sm">
        <Image
          width={400}
          height={500}
          src={`${config.apiUrl}storage/app/public/${cat_image}`}
          alt={cat_title || "Category"}
          className=" w-full h-[165px] object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
        />
      </div>
      <h3 className="text-center md:break-keep break-all mt-3 font-semibold text-gray-800 text-sm md:text-[15px] group-hover:text-black transition-colors duration-300">
        {cat_title}
      </h3>
    </Link>
  );
}

export default CategoryCard;

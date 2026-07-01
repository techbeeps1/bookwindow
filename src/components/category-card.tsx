import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

import { Card, CardBody, Typography } from "@material-tailwind/react";
import config from "@/app/config";

interface CategoryCardProps {
  cat_image: string;
  cat_title: string;
  cat_content: string;
  // cat_icon: React.ElementType;
  cat_icon: any;
}

function CategoryCard({
  cat_image,
  cat_title,
  cat_content,
  cat_icon,
}: CategoryCardProps) {
  return (
    <Card
      className="relative grid min-h-[12rem] w-full overflow-hidden cursor-pointer"
      {...({} as React.ComponentProps<typeof Card>)}
    >
      <Image
        width={768}
        height={768}
        src={`${config.apiUrl}storage/${cat_image}`}
        alt={cat_title}
        className="absolute inset-0 h-full w-full object-contain object-center"
      />
      <div className="absolute inset-0 h-full w-full bg-black/30" />
      <CardBody
        className="relative flex flex-col justify-between"
        {...({} as React.ComponentProps<typeof CardBody>)}
      >
        <Image
          className="h-8 w-8 text-white"
          width={768}
          height={768}
          alt={cat_icon}
          src={`${config.apiUrl}storage/${cat_icon}`}
        />
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <Typography
            as="a"
            href="/category/school-books"
            variant="h5"
            className="mb-1 hover:underline"
            color="white"
            {...({} as React.ComponentProps<typeof Typography>)}
          >
            {cat_title}
          </Typography>
          <Typography
            color="white"
            className="text-xs font-bold opacity-50"
            dangerouslySetInnerHTML={{ __html: cat_content }}
            {...({} as React.ComponentProps<typeof Typography>)}
          >
            {/* {cat_content} */}
          </Typography>
        </motion.div>
      </CardBody>
    </Card>
  );
}
export default CategoryCard;

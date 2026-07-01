"use client";

import { Typography } from "@material-tailwind/react";
import BookCard from "@/components/book-card";
import config from "@/app/config";

const OTHER_BOOKS = [
  {
    img: `/image/books/RectangleBig1.svg`,
    category: "33% off",
    title: "Dr. Bhalla - Contemporary Rajasthan by Kuldeep Publication",
    desc: "Dr. L.R Bhalla",
    price: "₹465 ",
    offPrice: "₹696",
  },
  {
    img: `/image/books/RectangleBig7.svg`,
    category: "33% off",
    title: "Utkarsh - Current Affairs Monthly January 2024 By Kumar Gaurav Sir",
    desc: "GAURAV KUMAR",
    price: "₹465 ",
    offPrice: "₹696",
  },
  {
    img: `/image/books/RectangleBig1.svg`,
    category: "33% off",
    title: "SSC Mathematics 7300+ Typewise Question All TCS Pettern Questions",
    desc: "Rakesh Yadav",
    price: "₹465 ",
    offPrice: "₹696",
  },
];

export function OtherBookOffers({ description, similarProducts, onItemsCountUpdate }: any) {
  return (
    <section className="px-8 pt-28 pb-28">
      <div className="container mx-auto mb-10">
      {description && (<>
        <Typography
          variant="h2"
          color="blue-gray"
          className="mb-2"
          {...({} as React.ComponentProps<typeof Typography>)}
        >
          About this product
        </Typography>
       
          <Typography
            variant="lead"
            className="w-full text-gray-600"
            dangerouslySetInnerHTML={{ __html: description}}
            {...({} as React.ComponentProps<typeof Typography>)}
          >
          </Typography>
          </>) 
        // : (
        //   <>
        //     <Typography
        //       variant="lead"
        //       className="w-full text-gray-600"
        //       {...({} as React.ComponentProps<typeof Typography>)}
        //     >
        //       Escape into{" "}
        //       <strong className="text-gray-700">captivating stories</strong>,
        //       vibrant characters, and enchanting worlds with our extensive
        //       fiction collection. A classic reference book on grammar and
        //       writing skills, essential for high school and college students. A
        //       valuable resource for high school seniors and college freshmen,
        //       offering effective study strategies.A classic reference book on
        //       grammar and writing skills, essential for high school and college
        //       students. A{" "}
        //       <strong className="text-gray-700">valuable resources</strong> for
        //       high school seniors and college freshmen, offering effective study
        //       strategies.A classic reference book on grammar and writing skills,
        //       essential for high school and college students.
        //     </Typography>
        //   </>
        // )
        }
        {similarProducts && similarProducts.length &&( <Typography
          variant="h2"
          color="blue-gray"
          className="mt-8"
          {...({} as React.ComponentProps<typeof Typography>)}
        >
          Similar Products of This Category
        </Typography>)}
       
      </div>
      <div className="container mx-auto grid grid-cols-1 items-start gap-x-6 gap-y-20 md:grid-cols-2 xl:grid-cols-4">
        {similarProducts && similarProducts.length > 0
          && similarProducts.map((product: any) => (
              <BookCard
                key={product.id}
                img={`${config.apiUrl}storage/${product.image}`}
                category={(product?.mrp && product?.price
                  ? ((product?.mrp - product?.price) / product?.mrp) * 100
                  : 0
                ).toFixed(2)}
                title={product.name}
                desc={product.description}
                price={product.mrp}
                offPrice={product.price}
                slug={product.slug}
                id={product.id}
                quantity={product.quantity}
                onItemsCountUpdate={onItemsCountUpdate}
              />
            ))}
          {/* // : OTHER_BOOKS.map((props, key) => <BookCard key={key} {...props} />)} */}
      </div>
    </section>
  );
}

export default OtherBookOffers;

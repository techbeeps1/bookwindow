"use client";

import { Typography } from "@material-tailwind/react";
import BookCard from "@/components/book-card";
import config from "@/app/config";


export function OtherBookOffers({ description, similarProducts, onItemsCountUpdate }: any) {

  console.log("similarProducts:", similarProducts);
  console.log("Length:", similarProducts?.length);

  return (
    
    <section className="px-[20px]  py-[60px]">
      <div className="container mx-auto mb-10">
      {description && (<>
        <Typography
          variant="h2"
          color="blue-gray"
          className="text-2xl md:text-4xl mb-2"
          {...({} as React.ComponentProps<typeof Typography>)}
        >
          About this product
        </Typography>
        <div className="w-20 h-[2px] bg-black my-4 rounded-full" />
       
          <Typography
            variant="lead"
            as="div"
            className="w-full text-gray-600"
            dangerouslySetInnerHTML={{ __html: description}}
            {...({} as React.ComponentProps<typeof Typography>)}
          >
          </Typography>
          </>)
        }
        {similarProducts && similarProducts.length &&( <>
          <Typography
            variant="h2"
            color="blue-gray"
            className="text-2xl md:text-4xl"
            {...({} as React.ComponentProps<typeof Typography>)}
          >
            Similar Products of This Category
          </Typography>
          <div className="w-20 h-[2px] bg-black my-4 rounded-full" />
        </>)}       
      </div>
      <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 items-start md:gap-6 gap-2 lg:grid-cols-3 xl:grid-cols-5">
        
        {similarProducts && similarProducts.length > 0
          && similarProducts.slice(0, 5).map((product: any) => (
              <BookCard
                key={product.id}
                img={`${config.apiUrl}storage/app/public/${product.image}`}
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
      </div>
    </section>
  );
  
}

export default OtherBookOffers;

"use client";
import BookCard from "@/components/book-card";
import config from "@/app/config";
export function FrequentlyBougth({ description, similarProducts, onItemsCountUpdate }: any) {
   const handleItemsCountUpdate = (count: number) => {
   //setItemsCount(3);
  };
  return (
  <section className="px-[20px] mb-[60px]">
        <div className="container mx-auto">
        <h2 className="text-2xl md:text-4xl "> Frequently Bougth Together</h2>
          <div className="w-20 h-[2px] bg-black my-4 rounded-full" />
          <div className="grid grid-cols-1 sm:grid-cols-2 items-start md:gap-6 gap-2 xl:grid-cols-3 mb-10">        
                {similarProducts && similarProducts.length > 0
                  &&  similarProducts.slice(0, 3).map((product: any) => (
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
        </div>
        </div>
      </section>  
  );
}


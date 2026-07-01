"use client";

import React, { act } from "react";
import {
  Button,
  Typography,
  Tabs,
  TabsHeader,
  Tab,
} from "@material-tailwind/react";
import BookCard from "@/components/book-card";
import axios from "axios";
import config from "@/app/config";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function BackToSchoolBooks({ onItemsCountUpdate, category_tabs }: any) {
  const categoryTabs = category_tabs?.cat_tabs;
  const router = useRouter();
  // const [category, setCategory] = React.useState([] as any);
  const [products, setProducts] = React.useState([] as any);
  const [activeTab, setActiveTab] = React.useState<string | undefined>(
    undefined
  );

  React.useEffect(() => {
    if (categoryTabs && categoryTabs[0]?.slug) {
      setActiveTab(categoryTabs[0].slug);
    }
  }, [categoryTabs]);

  React.useEffect(() => {
    const fetchProductsByCategory = async () => {
      try {
        const response = await axios({
          method: "get",
          url: `${config.apiUrl}api/category/${activeTab}`,
          responseType: "json",
        });
        setProducts(response.data?.products);
      } catch (error) {
        console.log("error", error);
      } finally {
        // console.log("An error occured");
      }
    };

    fetchProductsByCategory();
  }, [activeTab]);

  // React.useEffect(() => {
  //   const fetchCategories = async () => {
  //     try {
  //       const response = await axios({
  //         method: "get",
  //         url: `${config.apiUrl}api/category`,
  //         responseType: "json",
  //       });
  //       setCategory(response.data[0]);
  //     } catch (error) {
  //       console.log("error", error);
  //     } finally {
  //       // console.log("An error occured");
  //     }
  //   };

  //   fetchCategories();
  // }, []);

  React.useEffect(() => {}, [products]);

  // const filteredBooks = products?.filter((book: any) => {
  //   // Find the subcategory with the matching name
  //   const matchingSubcategory = category?.child?.find(
  //     (subcategory: any) => subcategory.name === activeTab
  //   );

  //   // Compare sub_category_id of the book to the matching subcategory's id
  //   return book.sub_category_id === matchingSubcategory?.id;
  // });

  const filteredBooks = products?.filter((book: any) => {
    // Find the subcategory with the matching name
    const matchingSubcategory = categoryTabs?.find(
      (subcategory: any) => subcategory.slug === activeTab
    );

    // Compare sub_category_id of the book to the matching subcategory's id
    return book.category_id === matchingSubcategory?.id;
  });
  const shuffledBooks = [...filteredBooks]
    .sort(() => Math.random() - 0.5)
    .slice(0, 8);
  // console.log("shuffledBooks",shuffledBooks);

  return (
    <section className="px-8 pt-20">
      <div className="container mx-auto mb-20 text-center">
        <Typography
          variant="paragraph"
          color="blue-gray"
          className="mb-3 font-bold uppercase"
          {...({} as React.ComponentProps<typeof Typography>)}
        >
          {/* up to 40% OFF */}
          {category_tabs?.cat_tab_subtitle || " "}
        </Typography>
        <Typography
          variant="h1"
          color="blue-gray"
          className="mb-2"
          {...({} as React.ComponentProps<typeof Typography>)}
        >
          {/* Back-to-School Books */}
          {category_tabs?.cat_tab_title || " "}
        </Typography>
        <Typography
          variant="lead"
          className="mx-auto w-full px-4 !text-gray-500 lg:w-9/12"
          {...({} as React.ComponentProps<typeof Typography>)}
        >
          {/* We offer a wide range of study guides, test prep materials, and
          reference books. Whether you&apos;re tackling calculus or diving into
          Shakespeare, we&apos;ve got you covered. */}
          {category_tabs?.cat_tab_description || " "}
        </Typography>
        <div className="mt-20 flex items-center justify-center">
          {activeTab && (
          <Tabs value={activeTab} className="w-full">
            {/* {Array.isArray(category?.child) && category.child.length > 0 && (
            <TabsHeader
              className="h-12 bg-transparent"
              indicatorProps={{
                className: "!bg-gray-900 rounded-lg",
              }}
              {...({} as React.ComponentProps<typeof TabsHeader>)}
            >
              {category?.child?.map((tab: any) => (
                <Tab
                  key={tab.id}
                  value={tab.name}
                  className={`!font-medium capitalize transition-all duration-300 rounded-xl
                    ${
                      activeTab === tab?.name
                        ? "text-white bg-black"
                        : "capitalize"
                    }
                  `}
                  onClick={() => setActiveTab(tab?.name)}
                  {...({} as any)}
                >
                  {tab?.name}
                </Tab>
              ))}
            </TabsHeader>
          )} */}
            {Array.isArray(categoryTabs) && categoryTabs?.length > 0 && (
              <TabsHeader
                className="bg-transparent flex flex-col lg:flex-row"
                indicatorProps={{
                  className: "!bg-gray-900 rounded-lg",
                }}
                {...({} as React.ComponentProps<typeof TabsHeader>)}
              >
                {categoryTabs?.map((tab: any) => (
                  <Tab
                    key={tab.id}
                    value={tab.name}
                    className={`!font-medium capitalize transition-all duration-300 rounded-xl px-4 py-2
                    ${
                      activeTab === tab?.slug
                        ? "text-white bg-black"
                        : "capitalize"
                    }
                    whitespace-nowrap`}
                    onClick={() => setActiveTab(tab?.slug)}
                    {...({} as any)}
                  >
                    {tab?.name}
                  </Tab>
                ))}
              </TabsHeader>
            )}
          </Tabs>
          )}
        </div>
      </div>
      <div className="container mx-auto grid grid-cols-1 items-start gap-x-6 gap-y-10 md:grid-cols-2 xl:grid-cols-4">
        {shuffledBooks.map((product: any) => (
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
      <div className="grid place-items-center">
        <Button
          className="mt-8"
          variant="outlined"
          {...({} as React.ComponentProps<typeof Button>)}
        >
          <Link href={`/category/${activeTab}`}>Show more</Link>
        </Button>
      </div>
    </section>
  );
}

export default BackToSchoolBooks;

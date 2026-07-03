"use client";

import config from "@/app/config";
import {
  Typography,
  Card,
  ListItem,
  List,
  ListItemSuffix,
  Chip,
} from "@material-tailwind/react";
import axios from "axios";
import { useEffect, useState } from "react";

export default function CategoryPublicationSidebar({
  category_id,
  childCategory,
  products,
  onCategorySelect,
  selectedCategoryIds,
  selectedPublicationIds,
  onPublicationSelect,
}: any) {
  const [publications, setPublications] = useState([] as any);
 // const [categories, setCategories] = useState([] as any);
  const [filteredPublicationData, setFilteredPublications] = useState(
    [] as any
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductsByCategoryAndPublication = async () => {
      try {
        const response = await axios({
          method: "get",
          url: `${config.apiUrl}api/publications`,
          responseType: "json",
        });
         setLoading(false);
        setPublications(response.data?.data?.production);
      } catch (error) {
       
        console.log("error", error);
      }
    };

    fetchProductsByCategoryAndPublication();
  }, []);

  // useEffect(() => {
  //   const fetchCategories = async () => {
  //     setLoading(true);
  //     try {
  //       const response = await axios({
  //         method: "get",
  //         url: `${config.apiUrl}api/category`,
  //         responseType: "json",
  //       });
  //       setCategories(response.data);
  //     } catch (error) {
  //       console.log("error", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchCategories();
  // }, []);

  useEffect(() => {
    const publicationIds = products?.map((p: any) => p.production_id);
    const filteredPublications = publications.filter((pub: any) =>
      publicationIds?.includes(pub.id)
    );
    setFilteredPublications(filteredPublications);
  }, [publications, products]);

  useEffect(() => {}, [filteredPublicationData]);

  const displayedCategories = childCategory;
  // childCategory?.length > 0 ? childCategory : categories;
  const displayedPublications =
    filteredPublicationData?.length > 0
      ? filteredPublicationData
      : publications;

  return (
  <div className="md:w-[320px] p-4 space-y-5">

    {/* ================= Categories ================= */}

    <Card
      className="rounded-xl border border-gray-200 shadow-sm overflow-hidden "
      {...({} as React.ComponentProps<typeof Card>)}
    >
      <Typography
        variant="h6"
        color="white"
        className="bg-black text-center py-3 sticky top-0 z-10 tracking-wide"
        {...({} as React.ComponentProps<typeof Typography>)}
      >
        Categories
      </Typography>

      <List
        {...({} as React.ComponentProps<typeof List>)}
        className="h-[30rem] overflow-y-auto p-2"
      >
        <ListItem
          className="rounded-lg mb-2 font-medium hover:bg-gray-100"
          {...({} as React.ComponentProps<typeof ListItem>)}
          onClick={() => {
            onCategorySelect("clear");
            onPublicationSelect("clear");
          }}
        >
          Show All
        </ListItem>

        {loading ? (
          <>
            {[...Array(12)].map((_, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-3 py-3 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded bg-gray-200 animate-pulse"></div>

                  <div className="space-y-2">
                    <div className="h-3 w-36 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>

                <div className="h-6 w-8 rounded-full bg-gray-200 animate-pulse"></div>
              </div>
            ))}
          </>
        ) : displayedCategories?.length > 0 ? (
          displayedCategories.map((category: any) => {
            const isChecked = selectedCategoryIds.includes(category.id);

            return (
              <div key={category.id}>
                <ListItem
                  className="rounded-lg mb-1 hover:bg-gray-100 transition-all"
                  {...({} as React.ComponentProps<typeof ListItem>)}
                >
                  <label className="flex items-center justify-between w-full cursor-pointer">

                    <div className="flex items-center gap-3">

                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onCategorySelect(category.id)}
                        className="h-4 w-4 accent-black"
                      />

                      <span className="text-sm font-medium text-gray-700">
                        {category.name}
                      </span>

                    </div>

                    <ListItemSuffix
                      {...({} as React.ComponentProps<typeof ListItemSuffix>)}
                    >
                      <Chip
                        value={category?.subproducts?.length}
                        variant="ghost"
                        size="sm"
                        className="rounded-full bg-gray-100"
                      />
                    </ListItemSuffix>

                  </label>
                </ListItem>
              </div>
            );
          })
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            No Sub Category Found
          </div>
        )}
      </List>
    </Card>

    {/* ================= Publications ================= */}

    <Card
      className="rounded-xl border border-gray-200 shadow-sm overflow-hidden"
      {...({} as React.ComponentProps<typeof Card>)}
    >
      <Typography
        variant="h6"
        color="white"
        className="bg-black text-center py-3 sticky top-0 z-10 tracking-wide"
        {...({} as React.ComponentProps<typeof Typography>)}
      >
        Publications
      </Typography>

      <List
        {...({} as React.ComponentProps<typeof List>)}
        className="h-[30rem] overflow-y-auto p-2"
      >
        <ListItem
          className="rounded-lg mb-2 font-medium hover:bg-gray-100"
          {...({} as React.ComponentProps<typeof ListItem>)}
          onClick={() => {
            onPublicationSelect("clear");
            onCategorySelect("clear");
          }}
        >
          Show All
        </ListItem>

        {loading ? (
          <>
            {[...Array(12)].map((_, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-3 py-3 rounded-lg"
              >
                <div className="flex items-center gap-3">

                  <div className="h-4 w-4 rounded bg-gray-200 animate-pulse"></div>

                  <div className="h-3 w-40 bg-gray-200 rounded animate-pulse"></div>

                </div>

                <div className="h-6 w-8 rounded-full bg-gray-200 animate-pulse"></div>
              </div>
            ))}
          </>
        ) : (
          displayedPublications.map((publication: any) => {
            const filteredCount = category_id
              ? (publication?.products || []).filter(
                  (product: any) =>
                    String(product?.category_id) === String(category_id)
                ).length
              : 0;

            const isChecked = selectedPublicationIds.includes(publication.id);

            return (
              <div key={publication.id}>
                <ListItem
                  className="rounded-lg mb-1 hover:bg-gray-100 transition-all"
                  {...({} as React.ComponentProps<typeof ListItem>)}
                >
                  <label className="flex items-center justify-between w-full cursor-pointer">

                    <div className="flex items-center gap-3">

                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() =>
                          onPublicationSelect(publication.id)
                        }
                        className="h-4 w-4 accent-black"
                      />

                      <span className="text-sm font-medium text-gray-700">
                        {publication.name}
                      </span>

                    </div>

                    <ListItemSuffix
                      {...({} as React.ComponentProps<typeof ListItemSuffix>)}
                    >
                      <Chip
                        value={filteredCount}
                        variant="ghost"
                        size="sm"
                        className="rounded-full bg-gray-100"
                      />
                    </ListItemSuffix>

                  </label>
                </ListItem>
              </div>
            );
          })
        )}
      </List>
    </Card>
  </div>
);
}

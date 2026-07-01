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
import { usePathname } from "next/navigation";

export default function AllProductSidebar({
  products,
  onCategorySelect,
  selectedCategoryIds,
  selectedPublicationIds,
  onPublicationSelect,
}: any) {
  const [publications, setPublications] = useState([] as any);
  const [categories, setCategories] = useState([] as any);
  const [filteredPublicationData, setFilteredPublications] = useState(
    [] as any
  );
  const [loading, setLoading] = useState(true);

  const pathname = usePathname(); // e.g. "/all-products"
  const lastSegment = pathname.split("/").filter(Boolean).pop(); // "all-products"

  useEffect(() => {
    const fetchProductsByCategoryAndPublication = async () => {
      try {
        const response = await axios({
          method: "get",
          url: `${config.apiUrl}api/publications`,
          responseType: "json",
        });
        setPublications(response.data?.data?.production);
      } catch (error) {
        console.log("error", error);
      }
    };

    fetchProductsByCategoryAndPublication();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await axios({
          method: "get",
          url: `${config.apiUrl}api/category`,
          responseType: "json",
        });
        setCategories(response.data);
      } catch (error) {
        console.log("error", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const publicationIds = products?.map((p: any) => p.production_id);
    const filteredPublications = publications.filter((pub: any) =>
      publicationIds?.includes(pub.id)
    );
    setFilteredPublications(filteredPublications);
  }, [publications, categories, products]);

  useEffect(() => {}, [filteredPublicationData]);

  const displayedCategories = categories;
  const displayedPublications =
    filteredPublicationData?.length > 0
      ? filteredPublicationData
      : publications;

  return (
    <div className="md:columns-[20vw] p-4 mt-4">
      <Card {...({} as React.ComponentProps<typeof Card>)}>
        <Typography
          variant="h6"
          color="white"
          className="text-center bg-black"
          {...({} as React.ComponentProps<typeof Typography>)}
        >
          Categories
        </Typography>
        <List
          {...({} as React.ComponentProps<typeof List>)}
          className="h-[30rem] overflow-y-auto overflow-x-hidden"
        >
          <ListItem
            {...({} as React.ComponentProps<typeof ListItem>)}
            onClick={() => {
              onCategorySelect("clear"), onPublicationSelect("clear");
            }}
          >
            Show All
          </ListItem>
          {loading ? (
            <div
              role="status"
              className="max-w-md p-4 space-y-4 border border-gray-200 divide-y divide-gray-200 rounded-sm shadow-sm animate-pulse dark:divide-gray-700 md:p-6 dark:border-gray-700"
            >
              {[...Array(5)].map((_, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between ${
                    idx !== 0 ? "pt-4" : ""
                  }`}
                >
                  <div>
                    <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-24 mb-2.5"></div>
                    <div className="w-32 h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
                  </div>
                  <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-700 w-12"></div>
                </div>
              ))}
              <span className="sr-only">Loading...</span>
            </div>
          ) : (
            displayedCategories?.map((category: any) => (
              <div key={category?.id}>
                {category &&
                  category?.child?.map((childCategory: any) => {
                    const isChecked = selectedCategoryIds.includes(
                      childCategory.id
                    );
                    const filteredCount = childCategory.id
                    ? (products || []).filter(
                        (product: any) =>
                          String(product?.sub_category_id) === String(childCategory.id)
                      ).length
                    : 0;
                    return (
                      <ListItem
                        {...({} as React.ComponentProps<typeof ListItem>)}
                        key={childCategory?.id}
                      >
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={isChecked}
                          onChange={() => onCategorySelect(childCategory.id)}
                        />{" "}
                        <p className="md:w-[80px]">{childCategory.name}</p>
                        <ListItemSuffix
                          {...({} as React.ComponentProps<
                            typeof ListItemSuffix
                          >)}
                        >
                          <Chip
                            value={filteredCount}
                            variant="ghost"
                            size="sm"
                            className="rounded-full"
                          />
                        </ListItemSuffix>
                      </ListItem>
                    );
                  })}
              </div>
            ))
          )}
        </List>
      </Card>

      <Card className="mt-4" {...({} as React.ComponentProps<typeof Card>)}>
        <Typography
          variant="h6"
          color="white"
          className="text-center bg-black"
          {...({} as React.ComponentProps<typeof Typography>)}
        >
          Publications
        </Typography>
        <List
          {...({} as React.ComponentProps<typeof List>)}
          className="h-[30rem] overflow-y-auto"
        >
          <ListItem
            {...({} as React.ComponentProps<typeof ListItem>)}
            onClick={() => {
              onPublicationSelect("clear"), onCategorySelect("clear");
            }}
          >
            Show All
          </ListItem>
          {displayedPublications?.length === 0 ? (
            <div
              role="status"
              className="max-w-md p-4 space-y-4 border border-gray-200 divide-y divide-gray-200 rounded-sm shadow-sm animate-pulse dark:divide-gray-700 md:p-6 dark:border-gray-700"
            >
              {[...Array(5)].map((_, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between ${
                    idx !== 0 ? "pt-4" : ""
                  }`}
                >
                  <div>
                    <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-24 mb-2.5"></div>
                    <div className="w-32 h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
                  </div>
                  <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-700 w-12"></div>
                </div>
              ))}
              <span className="sr-only">Loading...</span>
            </div>
          ) : (
            displayedPublications.map((publication: any) => {
              const isChecked = selectedPublicationIds.includes(
                publication?.id
              );
              return (
                <ListItem
                  {...({} as React.ComponentProps<typeof ListItem>)}
                  key={publication?.id}
                >
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={isChecked}
                    onChange={() => onPublicationSelect(publication?.id)}
                  />{" "}
                  <p className="md:w-[80px]">{publication?.name}</p>
                  <ListItemSuffix
                    {...({} as React.ComponentProps<typeof ListItemSuffix>)}
                  >
                    <Chip
                      //value={filteredCount || 0}
                      value={publication?.products?.length}
                      variant="ghost"
                      size="sm"
                      className="rounded-full"
                    />
                  </ListItemSuffix>
                </ListItem>
              );
            })
          )}
        </List>
      </Card>
    </div>
  );
}

"use client";

import config from "@/app/config";
import { Navbar, Footer } from "@/components";
import MainNavbar from "@/components/main-navbar";
import { Typography, Card, ListItem, List } from "@material-tailwind/react";
import axios from "axios";
import Link from "next/link";
import React from "react";

export default function Detail({ params }: any) {
  const [currentAffairsData, setCurrentAffairsData] = React.useState({} as any);
  const [currentAffairsList, setCurrentAffairsList] = React.useState([] as any);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  React.useEffect(() => {
    const fetchCurrentAffairsData = async () => {
      try {
        const response = await axios({
          method: "get",
          url: `${config.apiUrl}api/news/${params?.slug}`,
          responseType: "json",
        });

        const data = await response.data;
        setCurrentAffairsData(data);
        const response1 = await axios({
          method: "get",
          url: `${config.apiUrl}api/news`,
          responseType: "json",
        });

        const data1 = await response1.data;
        setCurrentAffairsList(data1);
      } catch (error) {
        console.error("Error fetching current affairs:", error);
      }
    };

    fetchCurrentAffairsData();
  }, [params?.slug]);

  React.useEffect(() => {
    // console.log("currentAffairsData", currentAffairsData);
  }, [currentAffairsData, currentAffairsList]);

  const formatDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    const day = date.getUTCDate();
    const month = date.toLocaleString("default", {
      month: "short",
      timeZone: "UTC",
    });
    const year = date.getUTCFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <>
      <Navbar />
      <MainNavbar />
      <section className="container mx-auto mb-10 mt-10 md:flex min-h-screen">
        {currentAffairsData && currentAffairsList?.length ? (
          <>
            <div className="grid grid-cols-1 gap-x-6 gap-y-20 col-8 p-4 shadow-lg">
              <Typography
                variant="h2"
                color="black"
                className=""
                {...({} as React.ComponentProps<typeof Typography>)}
              >
                {currentAffairsData?.title}
                <Typography
                  className="text-gray-800 mt-2"
                  {...({} as React.ComponentProps<typeof Typography>)}
                >
                  {formatDate(currentAffairsData?.created_at)}
                </Typography>
                <Typography
                  className="text-gray-600 mt-2"
                  {...({} as React.ComponentProps<typeof Typography>)}
                  dangerouslySetInnerHTML={{
                    __html: currentAffairsData?.content,
                  }}
                >
                  {/* The results of the Delhi assembly election 2025 will declared on
              Saturday but predictions are still pouring in before the big day.
              Most exit polls have predicted a big victory for the Bharatiya
              Janata Party (BJP) in the national capital. */}
                </Typography>
              </Typography>
            </div>
            <div className="col-4 p-4">
              <Card {...({} as React.ComponentProps<typeof Card>)}>
                <Typography
                  variant="h6"
                  color="white"
                  className="text-center bg-black"
                  {...({} as React.ComponentProps<typeof Typography>)}
                >
                  others
                </Typography>
                <List {...({} as React.ComponentProps<typeof List>)}>
                  {currentAffairsList?.map(
                    (data: any) =>
                      data?.id !== currentAffairsData?.id && (
                        <ListItem
                          {...({} as React.ComponentProps<typeof ListItem>)}
                          key={data?.id}
                        >
                          <Link href={`/current-affairs/${data?.slug}`}>
                            {data?.title}{" "}
                          </Link>
                        </ListItem>
                      )
                  )}
                </List>
              </Card>
            </div>
          </>
        ) : (
          <div
            role="status"
            className="w-full space-y-8 animate-pulse md:space-y-0 md:space-x-8 rtl:space-x-reverse md:flex md:items-center"
          >
            <div className="w-full">
              <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
              <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[480px] mb-2.5"></div>
              <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
              <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[440px] mb-2.5"></div>
              <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[460px] mb-2.5"></div>
              <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>
            </div>
            <span className="sr-only">Loading...</span>
          </div>
        )}
      </section>
      <Footer />
    </>
  );
}

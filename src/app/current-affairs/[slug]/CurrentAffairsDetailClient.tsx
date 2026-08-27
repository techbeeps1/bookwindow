"use client";

import { Typography, Card, ListItem, List } from "@material-tailwind/react";
import Link from "next/link";
import React from "react";

export default function CurrentAffairsDetailClient({
  currentAffairsData,
  currentAffairsList,
}: {
  currentAffairsData: any;
  currentAffairsList: any[];
}) {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const formatDate = (isoDate: string): string => {
    if (!isoDate) return "";
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
    <section className="container mx-auto mb-10 lg:mt-0 mt-[100px] flex flex-col lg:flex-row px-4 sm:px-6 lg:px-8 gap-6 max-w-full overflow-x-hidden min-h-screen">
      <div className="grid grid-cols-1 gap-x-6 gap-y-20 lg:w-2/3 p-6 bg-white rounded-2xl shadow-sm border border-neutral-100">
        <div>
          <Typography
            variant="h2"
            color="black"
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 tracking-tight"
            {...({} as React.ComponentProps<typeof Typography>)}
          >
            {currentAffairsData?.title}
          </Typography>
          <Typography
            className="text-neutral-500 text-xs sm:text-sm font-medium mt-2"
            {...({} as React.ComponentProps<typeof Typography>)}
          >
            {formatDate(currentAffairsData?.created_at)}
          </Typography>
          <div
            className="text-neutral-700 text-base leading-relaxed mt-6 space-y-4"
            dangerouslySetInnerHTML={{
              __html: currentAffairsData?.content || "",
            }}
          />
        </div>
      </div>

      <div className="lg:w-1/3">
        <Card className="overflow-hidden border border-neutral-100" {...({} as React.ComponentProps<typeof Card>)}>
          <div className="bg-black text-white py-3 px-4 text-center font-bold text-sm tracking-wider uppercase">
            Other Current Affairs
          </div>
          <List className="divide-y divide-neutral-100 p-0" {...({} as React.ComponentProps<typeof List>)}>
            {currentAffairsList?.map(
              (data: any) =>
                data?.id !== currentAffairsData?.id && (
                  <ListItem
                    className="p-3 hover:bg-neutral-50 rounded-none text-xs sm:text-sm font-medium text-neutral-800"
                    {...({} as React.ComponentProps<typeof ListItem>)}
                    key={data?.id}
                  >
                    <Link
                      href={`/current-affairs/${data?.slug}`}
                      className="hover:text-black transition-colors w-full"
                    >
                      {data?.title}
                    </Link>
                  </ListItem>
                )
            )}
          </List>
        </Card>
      </div>
    </section>
  );
}

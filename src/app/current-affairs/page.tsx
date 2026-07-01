"use client";

import {
  Card,
  CardBody,
  Typography,
  CardHeader,
} from "@material-tailwind/react";
import { Navbar, Footer } from "@/components";
import MainNavbar from "@/components/main-navbar";
import React from "react";
import axios from "axios";
import config from "../config";

interface TestimonialCardPropsType {
  img?: string;
  client?: string;
  title: string;
  slug: string;
  clientInfo?: string;
  id?: number;
  news_category_id?: number;
}

function CurrentAffairs({
  id,
  img,
  client,
  title,
  slug,
  clientInfo,
}: TestimonialCardPropsType) {
  return (
    <Card
      shadow={false}
      className="bg-gray-100/50 rounded-2xl p-6"
      {...({} as React.ComponentProps<typeof Card>)}
    >
      <CardHeader
        color="transparent"
        floated={false}
        shadow={false}
        {...({} as React.ComponentProps<typeof CardHeader>)}
      >
        <Typography
          as="a"
          color="blue-gray"
          className="mb-4 text-2xl font-bold cursor-pointer"
          href={`/current-affairs/${slug}`}
          {...({} as React.ComponentProps<typeof Typography>)}
        >
          &quot;{title}&quot;
        </Typography>
      </CardHeader>
      {/* <CardBody
        className="px-4 py-0 flex flex-wrap-reverse gap-x-6 justify-between items-center"
        {...({} as React.ComponentProps<typeof CardBody>)}
      > 
       <div>
          <Typography
            variant="h6"
            color="blue-gray"
            {...({} as React.ComponentProps<typeof Typography>)}
          >
            by {client}
          </Typography>
          <Typography
            variant="paragraph"
            className="font-normal !text-gray-500"
            {...({} as React.ComponentProps<typeof Typography>)}
          >
            {clientInfo}
          </Typography>
        </div> 
     <Image src={img} className="max-w-[8rem]" alt={client} /> 
      {/* </CardBody> */}
    </Card>
  );
}

// const testimonials = [
//   {
//     title:
//       "इंडिया ने तूफानी अंदाज में जीता पहला वनडे, इंग्लैंड को बुरी तरह धोया",
//     slug: "/इंडिया-ने-तूफानी-अंदाज-में-जीता-पहला-वनडे,-इंग्लैंड-को-बुरी-तरह-धोया",
//     client: "Shaheen Mistri",
//     clientInfo: "Full Stack Developer @Netflix",
//     img: "/image/netflix.svg",
//   },
//   {
//     title: "Government vs private schools: What works better?",
//     slug: "/Government-vs-private-schools:-What-works-better?",
//     client: "India Development Review ",
//     clientInfo: "Graphic Designer, @Coinbase",
//     img: "/image/Logo-coinbase.svg",
//   },
//   {
//     title: "राष्ट्रीय नमूना सर्वेक्षण (एनएसएस) की 75वीं वर्षगांठ",
//     slug: "/राष्ट्रीय-नमूना-सर्वेक्षण-(एनएसएस)-की-75वीं-वर्षगांठ",
//     client: "Pankil Goswami ",
//     clientInfo: "Full Stack Developer @Netflix",
//     img: "/image/netflix.svg",
//   },
//   {
//     title: "Can neighbourhood repair shops help in reducing e-waste?",
//     slug: "/Can-neighbourhood-repair-shops-help-in-reducing-e-waste?",
//     client: "Debojit Dutta, Rakesh Swami, Srishti Gupta",
//     clientInfo: "Graphic Designer, @Coinbase",
//     img: "/image/Logo-coinbase.svg",
//   },
// ];

export default function CurrentAffairsPage() {
  const [currentAffairsData, setCurrentAffairsData] = React.useState([] as any);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  React.useEffect(() => {
    const fetchCurrentAffairsData = async () => {
      try {
        const response = await axios({
          method: "get",
          url: `${config.apiUrl}api/news`,
          responseType: "json",
        });

        const data = await response.data;
        setCurrentAffairsData(data);
      } catch (error) {
        console.error("Error fetching current affairs:", error);
      }
    };

    fetchCurrentAffairsData();
  }, []);

  React.useEffect(() => {
    // console.log("currentAffairsData", currentAffairsData);
  }, [currentAffairsData]);

  return (
    <>
      <Navbar />
      <MainNavbar />
      <section className="px-8 py-10 lg:py-28">
        <div className="container mx-auto">
          <Typography
            variant="h2"
            color="blue-gray"
            className="mb-4 !text-2xl lg:!text-4xl"
            {...({} as React.ComponentProps<typeof Typography>)}
          >
            Measure twice, pay once
          </Typography>
          <Typography
            variant="lead"
            className="max-w-3xl !text-gray-500 mb-10 lg:mb-20"
            {...({} as React.ComponentProps<typeof Typography>)}
          >
            Outcomes-based financing demands more than just tracking data—it
            requires a shift in how nonprofits use monitoring and evaluation to
            drive real impact.
          </Typography>

          <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
            {/* {testimonials.map((props, key) => (
              <CurrentAffairs key={key} {...props} />
            ))} */}
            {currentAffairsData && currentAffairsData.length ? (
              <>
                {/* Column 1 - Hindi */}
                <div>
                  <Typography
                    color="blue-gray"
                    className="mb-4 text-2xl font-bold text-center"
                    {...({} as React.ComponentProps<typeof Typography>)}
                  >
                    Hindi
                  </Typography>
                  {currentAffairsData
                    .filter(
                      (data: TestimonialCardPropsType) =>
                        data.news_category_id === 1
                    )
                    .map((data: TestimonialCardPropsType) => (
                      <CurrentAffairs key={data.id} {...data} />
                    ))}
                </div>

                {/* Column 2 - English */}
                <div>
                  <Typography
                    color="blue-gray"
                    className="mb-4 text-2xl font-bold text-center"
                    {...({} as React.ComponentProps<typeof Typography>)}
                  >
                    English
                  </Typography>
                  {currentAffairsData
                    .filter(
                      (data: TestimonialCardPropsType) =>
                        data.news_category_id === 2
                    )
                    .map((data: TestimonialCardPropsType) => (
                      <CurrentAffairs key={data.id} {...data} />
                    ))}
                </div>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>

          <Card
            shadow={false}
            className="mt-8 bg-gray-100/50 text-center rounded-2xl p-6"
            {...({} as React.ComponentProps<typeof Card>)}
          >
            <CardHeader
              color="transparent"
              floated={false}
              shadow={false}
              {...({} as React.ComponentProps<typeof Card>)}
            >
              <Typography
                color="blue-gray"
                className="mb-4 !text-2xl lg:!text-3xl max-w-4xl !leading-snug mx-auto font-bold"
                {...({} as React.ComponentProps<typeof Typography>)}
              >
                &quot;&quot;Activists should go to places where laws are made
                and also where laws are implemented. If you don’t get into
                politics, you won’t be able to save the country.&quot;&quot;
              </Typography>
            </CardHeader>
            <CardBody
              className="items-center mx-auto py-2"
              {...({} as React.ComponentProps<typeof CardBody>)}
            >
              {/* <Image
                src="/image/spotify.svg"
                className="max-w-[8rem] mx-auto grayscale"
                alt="spotify"
              /> */}
              <Typography
                variant="h6"
                color="blue-gray"
                {...({} as React.ComponentProps<typeof Typography>)}
              >
                by Anushree Parekh, Priyanshi Chauhan, Saumya Lashkari | 6 min
                read
              </Typography>
              <Typography
                variant="paragraph"
                className="font-normal !text-gray-500"
                {...({} as React.ComponentProps<typeof Typography>)}
              >
                Chief Executive @Spotify
              </Typography>
            </CardBody>
          </Card>
        </div>
      </section>
      <Footer />
    </>
  );
}

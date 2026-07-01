"use client";

import React, { FormEvent } from "react";
import {
  Button,
  Input,
  Textarea,
  Typography,
  Alert,
} from "@material-tailwind/react";
import { Navbar, Footer } from "@/components";
import MainNavbar from "@/components/main-navbar";
import config from "../config";
import axios from "axios";

export default function ContactSection() {
  const [alertMessage, setAlertMessage] = React.useState("");
  const [alertType, setAlertType] = React.useState<"error" | "success" | "">(
    ""
  );
  const [contactPageData, setContactPageData] = React.useState([] as any);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  React.useEffect(() => {
    const fetchContactData = async () => {
      try {
        const response = await axios({
          method: "get",
          url: `${config.apiUrl}api/contact-page`,
          responseType: "json",
        });
        setContactPageData(response.data?.contact_detials);
      } catch (error) {
        console.log("error", error);
      } finally {
        // console.log("An error occured");
      }
    };

    fetchContactData();
  }, []);

  React.useEffect(() => {}, [contactPageData]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(event.currentTarget);
    const first_name = formData.get("first_name")?.toString().trim() || "";
    const last_name = formData.get("last_name")?.toString().trim() || "";
    const email = formData.get("email")?.toString().trim() || "";
    const subject = formData.get("subject")?.toString().trim() || "";
    const emailMessage = formData.get("emailMessage")?.toString() || "";

    // --- Validation ---
    if (first_name.length > 255) {
      setAlertType("error");
      setAlertMessage("First name cannot be more than 255 characters.");
      return;
    }

    if (last_name.length > 255) {
      setAlertType("error");
      setAlertMessage("Last name cannot be more than 255 characters.");
      return;
    }

    if (subject.length > 255) {
      setAlertType("error");
      setAlertMessage("Subject cannot be more than 255 characters.");
      return;
    }

    if (email.length > 255) {
      setAlertType("error");
      setAlertMessage("Email cannot be more than 255 characters.");
      return;
    }

    try {
      const response = await fetch(`${config.apiUrl}api/contact-form`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name,
          last_name,
          subject,
          email,
          emailMessage,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAlertType("success");
        setAlertMessage("Send mail successful!");
        form.reset();
      } else {
        if (data?.error) {
          setAlertType("error");
          setAlertMessage(data?.error);
        } else {
          setAlertType("error");
          setAlertMessage(data?.error || "Submission failed.");
        }
      }
    } catch (error) {
      console.error("Error during Submission:", error);
      console.log("Error during Submission:", error);
      // alert("Something went wrong. Please try again later.");
    }
  }

  React.useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => {
        setAlertMessage("");
        setAlertType("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  return (
    <>
      <Navbar />
      <MainNavbar />
      <section className="px-8 py-8 lg:py-16">
        <div className="container mx-auto text-center">
          <Typography
            variant="h5"
            color="blue-gray"
            className="mb-4 !text-base lg:!text-2xl"
            {...({} as React.ComponentProps<typeof Typography>)}
          >
            Contact Us
          </Typography>
          <Typography
            variant="h1"
            color="blue-gray"
            className="mb-4 !text-3xl lg:!text-5xl"
            {...({} as React.ComponentProps<typeof Typography>)}
          >
            {/* Our Location */}

            {!contactPageData?.con_title ? (
              <div className="flex items-center justify-center text-center">
                <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-32 mb-2"></div>
                <span className="sr-only">Loading...</span>
              </div>
            ) : (
              contactPageData?.con_title
            )}
          </Typography>

          <div className="mb-10 font-normal !text-lg lg:mb-20 mx-auto max-w-3xl !text-gray-500 grid grid-cols-1 gap-x-12 gap-y-6 lg:grid-cols-3 items-start">
            <div className="">
              <strong className="text-gray-700">Bookwindow: </strong> <br />
              {/* Shop No. 8, Maharani Garden road near by Hotel Dwarika Palace,
              Mangyawas, Jaipur, 302020, Rajasthan */}
              {!contactPageData?.con_address ? (
                <div>
                  <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-32 mb-2 ml-8"></div>
                  <div className="w-48 h-2 bg-gray-200 rounded-full dark:bg-gray-700 ml-8"></div>
                  <span className="sr-only">Loading...</span>
                </div>
              ) : (
                <div
                  dangerouslySetInnerHTML={{
                    __html: contactPageData?.con_address,
                  }}
                ></div>
              )}
            </div>
            <div className="">
              <strong className="text-gray-700">Mobile: </strong> <br />
              {/* +91 96023 68227 */}
              {!contactPageData?.con_phone ? (
                <div>
                  <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-32 mb-2 ml-20"></div>
                  <span className="sr-only">Loading...</span>
                </div>
              ) : (
                <div
                  dangerouslySetInnerHTML={{
                    __html: contactPageData?.con_phone,
                  }}
                ></div>
              )}
            </div>
            <div className="">
              <strong className="text-gray-700">Email: </strong>
              <br />
              {/* info@bookwindow.in */}

              {!contactPageData?.con_email ? (
                <div>
                  <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-32 mb-2 ml-20"></div>
                  <span className="sr-only">Loading...</span>
                </div>
              ) : (
                <div
                  dangerouslySetInnerHTML={{
                    __html: contactPageData?.con_email,
                  }}
                ></div>
              )}
            </div>
          </div>
          {alertMessage && (
            <Alert
              color={alertType === "error" ? "red" : "green"}
              className="mb-4"
              onClose={() => setAlertMessage("")}
            >
              {alertMessage}
            </Alert>
          )}
          <div className="grid grid-cols-1 gap-x-12 gap-y-6 lg:grid-cols-2 items-start">
            {!contactPageData?.con_map ? (
              <div
                role="status"
                className="space-y-8 animate-pulse md:space-y-0 md:space-x-8 rtl:space-x-reverse md:flex md:items-center"
              >
                <div className="flex items-center justify-center w-full h-[30rem] bg-gray-300 rounded-sm sm:w-96 dark:bg-gray-700">
                  <svg
                    className="w-10 h-10 text-gray-200 dark:text-gray-600"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 18"
                  >
                    <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
                  </svg>
                </div>

                <span className="sr-only">Loading...</span>
              </div>
            ) : (
              <div
                dangerouslySetInnerHTML={{ __html: contactPageData?.con_map }}
              ></div>
            )}

            {/* <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d649.1622899692323!2d75.78353552039037!3d26.872709862147758!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396db5759aa54889%3A0x63b0e198923e4670!2sRajesh%20Ramsinghani!5e1!3m2!1sen!2sbd!4v1726603072398!5m2!1sen!2sbd"
              width="100%"
              height="450"
              style={{ border: "0" }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe> */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 lg:max-w-sm"
            >
              <Typography
                variant="small"
                className="text-left !font-semibold !text-gray-600"
                {...({} as React.ComponentProps<typeof Typography>)}
              >
                Contact Form
              </Typography>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Typography
                    variant="small"
                    className="mb-2 text-left font-medium !text-gray-900"
                    {...({} as React.ComponentProps<typeof Typography>)}
                  >
                    First Name
                  </Typography>
                  <Input
                    color="gray"
                    size="lg"
                    placeholder="First Name"
                    name="first_name"
                    className="focus:border-t-gray-900"
                    containerProps={{
                      className: "min-w-full",
                    }}
                    labelProps={{
                      className: "hidden",
                    }}
                    {...({} as React.ComponentProps<typeof Input>)}
                  />
                </div>
                <div>
                  <Typography
                    variant="small"
                    className="mb-2 text-left font-medium !text-gray-900"
                    {...({} as React.ComponentProps<typeof Typography>)}
                  >
                    Last Name
                  </Typography>
                  <Input
                    color="gray"
                    size="lg"
                    placeholder="Last Name"
                    name="last_name"
                    className="focus:border-t-gray-900"
                    containerProps={{
                      className: "!min-w-full",
                    }}
                    labelProps={{
                      className: "hidden",
                    }}
                    {...({} as React.ComponentProps<typeof Input>)}
                    required
                  />
                </div>
              </div>
              <div>
                <Typography
                  variant="small"
                  className="mb-2 text-left font-medium !text-gray-900"
                  {...({} as React.ComponentProps<typeof Typography>)}
                >
                  Your Email
                </Typography>
                <Input
                  color="gray"
                  size="lg"
                  placeholder="name@email.com"
                  name="email"
                  className="focus:border-t-gray-900"
                  containerProps={{
                    className: "!min-w-full",
                  }}
                  labelProps={{
                    className: "hidden",
                  }}
                  {...({} as React.ComponentProps<typeof Input>)}
                  required
                />
              </div>
              <div>
                <Typography
                  variant="small"
                  className="mb-2 text-left font-medium !text-gray-900"
                  {...({} as React.ComponentProps<typeof Typography>)}
                >
                  Subject
                </Typography>
                <Input
                  color="gray"
                  size="lg"
                  placeholder="Enter subject"
                  name="subject"
                  className="focus:border-t-gray-900"
                  containerProps={{
                    className: "!min-w-full",
                  }}
                  labelProps={{
                    className: "hidden",
                  }}
                  {...({} as React.ComponentProps<typeof Input>)}
                  required
                />
              </div>
              <div>
                <Typography
                  variant="small"
                  className="mb-2 text-left font-medium !text-gray-900"
                  {...({} as React.ComponentProps<typeof Typography>)}
                >
                  Your Message
                </Typography>
                <Textarea
                  rows={6}
                  color="gray"
                  placeholder="Message"
                  name="emailMessage"
                  className="focus:border-t-gray-900"
                  containerProps={{
                    className: "!min-w-full",
                  }}
                  labelProps={{
                    className: "hidden",
                  }}
                  {...({} as React.ComponentProps<typeof Textarea>)}
                  required
                />
              </div>
              <Button
                className="w-full"
                color="gray"
                type="submit"
                {...({} as React.ComponentProps<typeof Button>)}
              >
                Send message
              </Button>
            </form>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

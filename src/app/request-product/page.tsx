"use client";

import {
  Card,
  Input,
  Button,
  Typography,
  Textarea,
  Alert,
} from "@material-tailwind/react";
import { Navbar, Footer } from "@/components";
import MainNavbar from "@/components/main-navbar";
import { FormEvent, useState } from "react";
import Image from "next/image";
import React from "react";
import config from "../config";

export default function RequestProduct() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    } else {
      setImage(null);
      setPreview(null);
    }
  };

  const [alertMessage, setAlertMessage] = React.useState("");
  const [alertType, setAlertType] = React.useState<"error" | "success" | "">(
    ""
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name")?.toString().trim() || "";
    const phone = formData.get("phone")?.toString().trim() || "";
    const email = formData.get("email")?.toString().trim() || "";
    const request = formData.get("request")?.toString().trim() || "";
    const remark = formData.get("remark")?.toString() || "";

    // --- Validation ---
    if (name.length > 255) {
      setAlertType("error");
      setAlertMessage("Name cannot be more than 255 characters.");
      return;
    }

    if (phone.length > 10) {
      setAlertType("error");
      setAlertMessage("Last name cannot be more than 10 characters.");
      return;
    }

    if (!request) {
      setAlertType("error");
      setAlertMessage("Please write a request.");
      return;
    }

    if (email.length > 255) {
      setAlertType("error");
      setAlertMessage("Email cannot be more than 255 characters.");
      return;
    }
    const newFormData = new FormData();
    newFormData.append("name", name);
    newFormData.append("phone", phone);
    newFormData.append("email", email);
    newFormData.append("request", request);
    newFormData.append("remark", remark);

    if (image instanceof File) {
      newFormData.append("image", image);
    }
    try {
      const response = await fetch(`${config.apiUrl}api/product-request`, {
        method: "POST",
        body: newFormData,
      });

      const data = await response.json();

      if (response.ok) {
        setAlertType("success");
        setAlertMessage(
          "Thank you 😊!, We'll connect you in 2 to 3 working days."
        );
        form.reset();
        setImage(null);
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
    window.scrollTo(0, 0);
  }, []);

  React.useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => {
        setAlertMessage("");
        setAlertType("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  const placeholderImage = "https://bookwindow.in/assets/images/im-def.png";

  return (
    <>
      <Navbar />
      <MainNavbar />
      <Card
        color="transparent"
        shadow={false}
        className="items-center mb-4 mt-4"
        {...({} as React.ComponentProps<typeof Card>)}
      >
        <Typography
          variant="h4"
          color="blue-gray"
          {...({} as React.ComponentProps<typeof Typography>)}
        >
          Request Product
        </Typography>
        <form
          className="mt-8 mb-2 w-full max-w-screen-lg shadow-xl p-4 ring-2 ring-gray-500/50 rounded-xl"
          onSubmit={handleSubmit}
        >
          <div className="mb-1 flex flex-col gap-6">
            <Typography
              variant="h6"
              color="blue-gray"
              className="-mb-3"
              {...({} as React.ComponentProps<typeof Typography>)}
            >
              Your Name
            </Typography>
            <Input
              size="lg"
              type="text"
              name="name"
              placeholder="your name"
              className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
              {...({} as React.ComponentProps<typeof Input>)}
            />
            <Typography
              variant="h6"
              color="blue-gray"
              className="-mb-3"
              {...({} as React.ComponentProps<typeof Typography>)}
            >
              Your Email
            </Typography>
            <Input
              size="lg"
              type="email"
              name="email"
              placeholder="name@mail.com"
              className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
              {...({} as React.ComponentProps<typeof Input>)}
            />
            <Typography
              variant="h6"
              color="blue-gray"
              className="-mb-3"
              {...({} as React.ComponentProps<typeof Typography>)}
            >
              Your Phone No.
            </Typography>
            <Input
              size="lg"
              type="number"
              name="phone"
              placeholder="9000000033"
              className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
              {...({} as React.ComponentProps<typeof Input>)}
            />

            <Typography
              variant="h6"
              color="blue-gray"
              className="-mb-3"
              {...({} as React.ComponentProps<typeof Typography>)}
            >
              Request
            </Typography>
            <Textarea
              size="lg"
              placeholder="Request"
              name="request"
              className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
              {...({} as React.ComponentProps<typeof Textarea>)}
            />
            <Typography
              variant="h6"
              color="blue-gray"
              className="-mb-3"
              {...({} as React.ComponentProps<typeof Typography>)}
            >
              Remark
            </Typography>
            <Textarea
              size="lg"
              placeholder="Remark"
              name="remark"
              className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
              {...({} as React.ComponentProps<typeof Textarea>)}
            />
            <div className="flex flex-col items-center justify-center p-4">
              <label className="cursor-pointer bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 transition duration-300">
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              <div className="mt-4">
                {preview ? (
                  <Image
                    src={preview}
                    alt="Preview"
                    className="w-64 h-64 object-contain rounded-md shadow-md"
                    width={150}
                    height={200}
                  />
                ) : (
                   <Image
                    src={placeholderImage}
                    alt="placeholder-image"
                    className="w-64 h-64 object-contain rounded-md shadow-md"
                    width={150}
                    height={200}
                  />
                )}
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="mt-6"
            fullWidth
            {...({} as React.ComponentProps<typeof Button>)}
          >
            Request
          </Button>
        </form>
        {alertMessage && (
          <Alert
            color={alertType === "error" ? "red" : "green"}
            className="mb-4"
            onClose={() => setAlertMessage("")}
          >
            {alertMessage}
          </Alert>
        )}
      </Card>
      <Footer />
    </>
  );
}

"use client";

import {
  Card,
  Input,
  Button,
  Typography,
  Select,
  Option,
  Alert,
} from "@material-tailwind/react";
import { Navbar, Footer } from "@/components";
import MainNavbar from "@/components/main-navbar";
import React, { FormEvent } from "react";
import config from "../config";

export default function Tutor() {
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
    const role = formData.get("role")?.toString().trim() || "";
    const locality = formData.get("locality")?.toString() || "";
    const city = formData.get("city")?.toString() || "";

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

    if (!role) {
      setAlertType("error");
      setAlertMessage("Please select a role.");
      return;
    }

    if (email.length > 255) {
      setAlertType("error");
      setAlertMessage("Email cannot be more than 255 characters.");
      return;
    }

    try {
      const response = await fetch(`${config.apiUrl}api/tutor-form`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name,
          phone: phone,
          role: role,
          email: email,
          locality: locality,
          city: city,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAlertType("success");
        setAlertMessage(
          "Thank you 😊!, We'll connect you in 2 to 3 working days."
        );
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
          Tutor
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
              Are You
            </Typography>
            <select
              className="border p-2 rounded w-full border-gray-400"
              name="role"
            >
              <option value="">Select a role</option>
              <option value="Student">Student</option>
              <option value="Teacher">Teacher</option>
              <option value="Parent/Guardian">Parent/Guardian</option>
            </select>
            <Typography
              variant="h6"
              color="blue-gray"
              className="-mb-3"
              {...({} as React.ComponentProps<typeof Typography>)}
            >
              Locality
            </Typography>
            <Input
              size="lg"
              type="text"
              placeholder="your locality"
              name="locality"
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
              City
            </Typography>
            <Input
              size="lg"
              type="text"
              placeholder="your city"
              name="city"
              className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
              {...({} as React.ComponentProps<typeof Input>)}
            />
          </div>

          <Button
            className="mt-6"
            fullWidth
            type="submit"
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

"use client";

import config from "@/app/config";
import { Alert } from "@material-tailwind/react";
import React, { FormEvent } from "react";

const ForgotPassword: React.FC = () => {
  const [alertMessage, setAlertMessage] = React.useState("");
  const [alertType, setAlertType] = React.useState<"error" | "success" | "">(
    ""
  );
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email")?.toString().trim() || "";
    try {
      const response = await fetch(
        `${config.apiUrl}api/customer/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
          }),
        }
      );

      const data = await response.json();
      console.log("data", data);

      if (response.ok) {
        setAlertType("success");
        setAlertMessage("Reset link sent to your email");
        form.reset();
      } else {
        if (data?.error) {
          setAlertType("error");
          setAlertMessage(data?.error);
        } else {
          setAlertType("error");
          setAlertMessage(data?.error || "failed.");
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
    <main id="content" role="main" className="w-full max-w-md mx-auto p-6">
      <div className="mt-7 bg-white rounded-xl shadow-lg dark:bg-gray-800 dark:border-gray-700">
        <div className="p-4 sm:p-7">
          <div className="text-center">
            <h1 className="block text-2xl font-bold text-gray-800 dark:text-white">
              Forgot password?
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Remember your password?{" "}
              <a
                className="text-blue-600 decoration-2 hover:underline font-medium"
                href="/sign-in"
              >
                Login here
              </a>
            </p>
          </div>

          <div className="mt-5">
            <form onSubmit={handleSubmit}>
              <div className="grid gap-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-bold ml-1 mb-2 dark:text-white"
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="py-3 px-4 block w-full border-2 border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                      required
                      aria-describedby="email-error"
                    />
                  </div>
                  <p
                    className="hidden text-xs text-red-600 mt-2"
                    id="email-error"
                  >
                    Please include a valid email address so we can get back to
                    you
                  </p>
                </div>
                <button
                  type="submit"
                  className="py-3 px-4 inline-flex justify-center items-center gap-2 rounded-md border border-transparent font-semibold bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-sm dark:focus:ring-offset-gray-800"
                >
                  Reset password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <p className="mt-3 flex justify-center items-center text-center divide-x divide-gray-300 dark:divide-gray-700">
        <a
          className="pr-3.5 inline-flex items-center gap-x-2 text-sm text-gray-600 decoration-2 hover:underline hover:text-blue-600 dark:text-gray-500 dark:hover:text-gray-200"
          href="/"
          rel="noopener noreferrer"
        >
          View Bookwindow
        </a>
        <a
          className="pl-3 inline-flex items-center gap-x-2 text-sm text-gray-600 decoration-2 hover:underline hover:text-blue-600 dark:text-gray-500 dark:hover:text-gray-200"
          href="/contact-us"
        >
          Contact us!
        </a>
      </p>
      {alertMessage && (
        <Alert
          color={alertType === "error" ? "red" : "green"}
          className="mb-4"
          onClose={() => setAlertMessage("")}
        >
          {alertMessage}
        </Alert>
      )}
    </main>
  );
};

export default ForgotPassword;

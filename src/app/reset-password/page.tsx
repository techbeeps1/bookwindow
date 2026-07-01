"use client";

import config from "@/app/config";
import { Footer, Navbar } from "@/components";
import MainNavbar from "@/components/main-navbar";
import { Alert } from "@material-tailwind/react";
import React, { FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const ResetPassword: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const [alertMessage, setAlertMessage] = React.useState("");
  const [alertType, setAlertType] = React.useState<"error" | "success" | "">(
    ""
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(event.currentTarget);
    const password_confirmation =
      formData.get("password_confirmation")?.toString().trim() || "";
    const password = formData.get("password")?.toString() || "";
    try {
      const response = await fetch(
        `${config.apiUrl}api/customer/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: token,
            email: email,
            password,
            password_confirmation,
          }),
        }
      );

      const data = await response.json();
      console.log("reset", data);

      if (response.ok) {
        setAlertType("success");
        setAlertMessage("Your password is changed successfully");
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
    if(!email && !token){
      router.push('/');
    }
    if (alertMessage) {
      const timer = setTimeout(() => {
        setAlertMessage("");
        setAlertType("");
      }, 3000);
      return () => {
        clearTimeout(timer);
        router.push("/sign-in");
      };
    }
  }, [alertMessage, email, router, token]);

  return (
    <>
      <Navbar />
      <MainNavbar />
      <main
        id="content"
        role="main"
        className="w-full max-w-md mx-auto p-6 mb-7"
      >
        <div className="mt-7 bg-white dark:bg-gray-800 dark:border-gray-700 shadow-xl p-6 ring-2 ring-gray-500/50 rounded-xl">
          <div className="p-4 sm:p-7">
            <div className="text-center">
              <h1 className="block text-2xl font-bold text-gray-800 dark:text-white">
                Change your password
              </h1>
            </div>

            <div className="mt-5">
              <form onSubmit={handleSubmit}>
                <div className="grid gap-y-4">
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-bold ml-1 mb-2 dark:text-white"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        id="password"
                        name="password"
                        className="py-3 px-4 block w-full border-2 border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-bold ml-1 mb-2 dark:text-white"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        id="password"
                        name="password_confirmation"
                        className="py-3 px-4 block w-full border-2 border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="py-3 px-4 inline-flex justify-center items-center gap-2 rounded-md border border-transparent font-semibold bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-sm dark:focus:ring-offset-gray-800"
                  >
                    Change password
                  </button>
                </div>
              </form>
            </div>
          </div>
          <p className="mt-3 flex justify-center items-center text-center divide-x divide-gray-300 dark:divide-gray-700">
            <a
              className="text-blue-600 decoration-2 hover:underline font-medium"
              href="/sign-in"
            >
              Login
            </a>
          </p>
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
      </main>
      <Footer />
    </>
  );
};

export default ResetPassword;

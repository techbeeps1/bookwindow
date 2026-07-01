"use client";

import {
  Card,
  Input,
  Button,
  Typography,
  Alert,
  Tabs,
  TabsHeader,
  Tab,
  Checkbox,
} from "@material-tailwind/react";
import { Navbar, Footer } from "@/components";
import MainNavbar from "@/components/main-navbar";
import config from "../config";
import { useState, useRef, useEffect, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Modal from "@/components/modal";
import ForgotPassword from "@/components/forgot-password";
const generateCaptchaText = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let captcha = "";
  for (let i = 0; i < 6; i++) {
    captcha += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return captcha;
};
export default function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const register = searchParams.get("tab");
  const [customerData, setCustomerData] = useState({} as any);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"error" | "success" | "">("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (register) {
      setActiveTab("register");
    } else {
      setActiveTab("login");
    }
  }, [register]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // const form = event.currentTarget;
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password")?.toString() || "";
    if (!email) {
      setAlertType("error");
      setAlertMessage("Email is required.");
      return;
    }

    if (!password) {
      setAlertType("error");
      setAlertMessage("Password is required.");
      return;
    }

    if (password.length < 8) {
      setAlertType("error");
      setAlertMessage("Password must be at least 8 characters long.");
      return;
    }

    const response = await fetch(`${config.apiUrl}api/v1/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (response.ok) {
      const data = await response.json();
      setCustomerData(data);
      router.push("/my-account");
    } else {
      const data = await response.json();
      // console.log("Login failed", data);
      if (data?.error === "The provided credentials are incorrect.") {
        setAlertType("error");
        setAlertMessage("The provided credentials are incorrect.");
        return;
      } else {
        setAlertType("error");
        setAlertMessage(data?.error);
      }
      console.error("Login failed", response.status);
    }
  }

  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => {
        setAlertMessage("");
        setAlertType("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      customerData?.access_token &&
      customerData?.customer
    ) {
      localStorage.setItem("access_token", customerData.access_token);
      localStorage.setItem("customer", JSON.stringify(customerData.customer));
    }
  }, [customerData]);

  //register
  const canvasRef = useRef(null);
  const [captcha, setCaptcha] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  // const [alertMessage, setAlertMessage] = useState("");
  // const [alertType, setAlertType] = useState<"error" | "success" | "">("");

  // Draw CAPTCHA on Canvas
  const drawCaptcha = (text: string) => {
    const canvas: any = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");

      const letterSpacing = 20;
      const padding = 20;
      canvas.width = text.length * letterSpacing + padding; // <-- dynamic width
      canvas.height = 40;

      ctx.fillStyle = "#f0f0f0";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = "24px Arial";
      ctx.fillStyle = "#333";
      ctx.textBaseline = "middle";

      for (let i = 0; i < text.length; i++) {
        const angle = Math.random() * 0.4 - 0.2;
        ctx.save();
        ctx.translate(letterSpacing * i + 15, 20); // Adjusted a bit
        ctx.rotate(angle);
        ctx.fillText(text[i], 0, 0);
        ctx.restore();
      }

      for (let i = 0; i < 5; i++) {
        ctx.strokeStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${
          Math.random() * 255
        },0.5)`;
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.stroke();
      }
    }
  };

  const refreshCaptcha = () => {
    const newCaptcha = generateCaptchaText();
    setCaptcha(newCaptcha);
    drawCaptcha(newCaptcha);
  };

  useEffect(() => {
    if (activeTab === "register" && canvasRef.current) {
      const newCaptcha = generateCaptchaText();
      setCaptcha(newCaptcha);
      drawCaptcha(newCaptcha);
    }
  }, [activeTab]);

  async function handleSubmit1(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(event.currentTarget);
    const first_name = formData.get("first_name")?.toString().trim() || "";
    const last_name = formData.get("last_name")?.toString().trim() || "";
    const email = formData.get("email")?.toString().trim() || "";
    const phone = formData.get("phone")?.toString().trim() || "";
    const password = formData.get("password")?.toString() || "";

    // --- Validation ---
    if (first_name.length > 255) {
      setAlertType("error");
      setAlertMessage("First name cannot be more than 255 characters.");
      return;
    }

    if (first_name.length > 255) {
      setAlertType("error");
      setAlertMessage("Last name cannot be more than 255 characters.");
      return;
    }

    if (password.length < 8) {
      setAlertType("error");
      setAlertMessage("Password must be at least 8 characters long.");
      return;
    }

    if (!email) {
      setAlertType("error");
      setAlertMessage("Email is required.");
      return;
    }

    if (captchaInput !== captcha) {
      setAlertType("error");
      setAlertMessage("Invalid CAPTCHA. Please try again.");
      refreshCaptcha();
      return;
    }

    try {
      const response = await fetch(`${config.apiUrl}api/v1/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ first_name, last_name, phone, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setAlertType("success");
        setAlertMessage("Registration successful!");
        form.reset();
        setCaptchaInput("");
      } else {
        if (data?.error?.includes("email has already been taken")) {
          setAlertType("error");
          setAlertMessage(
            "Email is already registered. Please use another one."
          );
        } else {
          setAlertType("error");
          setAlertMessage(data?.error || "Registration failed.");
        }
      }
    } catch (error) {
      console.error("Error during registration:", error);
      console.log("Error during registration:", error);
      // alert("Something went wrong. Please try again later.");
    }
  }

  useEffect(() => {
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
        className="items-center mb-4 pt-20 pb-10 min-h-screen"
        {...({} as React.ComponentProps<typeof Card>)}
      >
        {/* <Typography
          variant="h4"
          color="blue-gray"
          {...({} as React.ComponentProps<typeof Typography>)}
        >
          Login
        </Typography> */}
        {alertMessage && (
          <Alert
            color={alertType === "error" ? "red" : "green"}
            className="mb-4"
            onClose={() => setAlertMessage("")}
          >
            {alertMessage}
          </Alert>
        )}
        <div className="flex items-center justify-center border w-96 ring-2 ring-gray-500/50 rounded-xl">
          <Tabs className="w-full" value={activeTab}>
            <TabsHeader
              className="h-12 bg-transparent"
              indicatorProps={{
                className: "!bg-gray-900 rounded-lg",
              }}
              {...({} as React.ComponentProps<typeof TabsHeader>)}
            >
              <Tab
                value="login"
                onClick={() => setActiveTab("login")}
                className={`font-medium capitalize transition-all duration-300 rounded-xl px-4 mr-4 whitespace-nowrap ${
                  activeTab === "login"
                    ? "bg-black text-white"
                    : "bg-transparent text-black"
                }`}
                {...({} as any)}
              >
                Login
              </Tab>
              <Tab
                value="register"
                onClick={() => setActiveTab("register")}
                className={`font-medium capitalize transition-all duration-300 rounded-xl px-4 whitespace-nowrap ${
                  activeTab === "register"
                    ? "bg-black text-white"
                    : "bg-transparent text-black"
                }`}
                {...({} as any)}
              >
                Register
              </Tab>
            </TabsHeader>
          </Tabs>
        </div>
        {activeTab === "login" ? (
          <>
            <form
              className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96 shadow-xl p-4 ring-2 ring-gray-500/50 rounded-xl"
              onSubmit={handleSubmit}
            >
              <div className="mb-1 flex flex-col gap-6">
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
                  Password
                </Typography>
                <Input
                  type="password"
                  name="password"
                  size="lg"
                  placeholder="********"
                  className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                  labelProps={{
                    className: "before:content-none after:content-none",
                  }}
                  {...({} as React.ComponentProps<typeof Input>)}
                />
              </div>
              <Typography
                className="mt-4 text-center text-red-600 font-normal cursor-pointer"
                {...({} as React.ComponentProps<typeof Typography>)}
                onClick={() => setIsModalOpen(true)}
              >
                Forgot Password?
              </Typography>
              <Button
                className="mt-6"
                fullWidth
                {...({} as React.ComponentProps<typeof Button>)}
                type="submit"
              >
                Login
              </Button>
              {/* <Typography
                color="gray"
                className="mt-4 text-center font-normal"
                {...({} as React.ComponentProps<typeof Typography>)}
              >
                Don&apos;t have any account?
                <a href="/registration" className="font-medium text-gray-900">
                  Sign Up
                </a>
              </Typography> */}
            </form>
          </>
        ) : (
          <>
            <form
              className="mt-8 mb-8 w-80 max-w-screen-lg sm:w-96 shadow-xl p-4 ring-2 ring-gray-500/50 rounded-xl"
              onSubmit={handleSubmit1}
            >
              <div className="mb-1 flex flex-col gap-6">
                <Typography
                  variant="h6"
                  color="blue-gray"
                  className="-mb-3"
                  {...({} as React.ComponentProps<typeof Typography>)}
                >
                  First Name
                </Typography>
                <Input
                  size="lg"
                  type="text"
                  name="first_name"
                  placeholder="First Name"
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
                  Last Name
                </Typography>
                <Input
                  size="lg"
                  type="text"
                  name="last_name"
                  placeholder="Last Name"
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
                  Email
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
                  Phone
                </Typography>
                <Input
                  size="lg"
                  type="number"
                  name="phone"
                  placeholder="9836348346"
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
                  Password
                </Typography>
                <Input
                  type="password"
                  size="lg"
                  name="password"
                  placeholder="********"
                  className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                  labelProps={{
                    className: "before:content-none after:content-none",
                  }}
                  {...({} as React.ComponentProps<typeof Input>)}
                />
                {/* CAPTCHA Section */}
                <Typography
                  variant="h6"
                  color="blue-gray"
                  className="-mb-3"
                  {...({} as React.ComponentProps<typeof Typography>)}
                >
                  CAPTCHA
                </Typography>
                <div className="flex items-center gap-2">
                  <canvas
                    ref={canvasRef}
                    className="mb-2 border border-gray-300 w-40"
                  />
                  <button
                    type="button"
                    onClick={refreshCaptcha}
                    className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 border border-black"
                  >
                    Refresh
                  </button>
                </div>

                <Input
                  type="text"
                  placeholder="Enter the above CAPTCHA"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                  {...({} as React.ComponentProps<typeof Input>)}
                />
              </div>
              <Checkbox
                {...({} as React.ComponentProps<typeof Checkbox>)}
                label={
                  <Typography
                    variant="small"
                    color="gray"
                    className="items-center font-normal"
                    {...({} as React.ComponentProps<typeof Typography>)}
                  >
                    By clicking SIGN UP, I agree to Bookwindow&apos;s
                    <a
                      href="terms"
                      className="font-medium transition-colors hover:text-gray-900"
                    >
                      &nbsp;Terms of Use
                    </a>
                    &nbsp;and
                    <a
                      href="privacy-policy"
                      className="font-medium transition-colors hover:text-gray-900"
                    >
                      &nbsp;Privacy Policy
                    </a>
                  </Typography>
                }
                containerProps={{ className: "-ml-2.5" }}
              />
              <Button
                className="mt-6"
                fullWidth
                type="submit"
                {...({} as React.ComponentProps<typeof Button>)}
              >
                sign up
              </Button>
            </form>
          </>
        )}
      </Card>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ForgotPassword />
      </Modal>
      <Footer />
    </>
  );
}

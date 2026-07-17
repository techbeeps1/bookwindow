import config from "@/app/config";
import { NextResponse } from "next/server";


export async function POST(req: Request) {
  try {
    const body = await req.json();

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, 10000); // 10 sec timeout

    const res = await fetch(`${config.apiUrl}api/v1/login`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const data = await res.json();
     
    if (!data.access_token) {
      return NextResponse.json(data, { status: 401 });
    }
  
    const response = NextResponse.json(data.customer);

   
      response.cookies.set("BWAT", data.access_token, {
        httpOnly: true,
        secure: true,
        path: "/",
      });

      response.cookies.set("BWDT", JSON.stringify(data.customer), {
        httpOnly: true,
        secure: true,
        path: "/",
      });
    

    return response;

  } catch (error: unknown) {
  

    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { message: "Server timeout. Please try again later." },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { message: "Unable to connect to server" },
      
      { status: 500 }
    );
  }
}
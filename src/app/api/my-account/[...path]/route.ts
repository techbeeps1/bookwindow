
import config from "@/app/config";
import { NextRequest, NextResponse } from "next/server";

// ---------- GET ----------
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  return handle(request, context);
}

// ---------- POST ----------
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  return handle(request, context);
}

// ---------- PUT ----------
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  return handle(request, context);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  return handle(request, context);
}

// ---------- DELETE ----------
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  return handle(request, context);
}



// ---------- COMMON ----------
async function handle(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  try {

    const { path } = await context.params;
    const search = request.nextUrl.search; // ?id=5&name=test

  
    if (!path || path.length === 0) {
      return NextResponse.json(
        { error: "Invalid API path" },
        { status: 400 }
      );
    }

    const apiPath = path.join("/");

    const token = request.cookies.get("BWAT")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const headers = new Headers(request.headers);
    headers.delete("host");
    headers.delete("content-length");
    headers.set("Authorization", `Bearer ${token}`);
    const url = `${config.apiUrl}api/my-account/${apiPath}${search}`;

    interface NodeRequestInit extends RequestInit {
      duplex?: "half";
    }
  const bodydata = request.method !== "GET" && request.method !== "HEAD" ? request.body : undefined;
    
    const apiRes = await fetch(url, {
    
      method: request.method,
      headers,
      body: bodydata,
      duplex: "half",
    } as NodeRequestInit);


    if (apiRes.status === 401) {
      console.error("Unauthorized - invalid or expired token token - created");

      return NextResponse.json(
        { error: "Unauthorized Access" },
        { status: 401 }
      );
    }

  
    const data = await apiRes.json();
 
    return NextResponse.json(data, {
      status: apiRes.status,
    });

  } catch (err) {
    console.error("Proxy Error:", err);
    return NextResponse.json(
      { error: "Proxy failed" },
      { status: 500 }
    );
  }
}



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

// ---------- PATCH ----------
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

// ---------- COMMON HANDLER ----------
async function handle(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  try {
    const params = await context.params;
    const path = params?.path;
    const search = request.nextUrl.search || "";

    if (!path || path.length === 0) {
      return NextResponse.json(
        { error: "Invalid API path" },
        { status: 400 }
      );
    }

    const apiPath = path.join("/");

    // 1. Token read from Cookie OR Authorization header
    const token =
      request.cookies.get("BWAT")?.value ||
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Clean outgoing headers (Avoid forwarding Cloudflare/Hop-by-hop headers)
    const outgoingHeaders: Record<string, string> = {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    };

    const contentType = request.headers.get("content-type");
    if (contentType) {
      outgoingHeaders["Content-Type"] = contentType;
    }

    // 3. Body formatting (Only for non-GET/HEAD methods)
    let body: any = undefined;
    if (request.method !== "GET" && request.method !== "HEAD") {
      try {
        if (contentType?.includes("application/json")) {
          const jsonBody = await request.json();
          body = JSON.stringify(jsonBody);
        } else if (
          contentType?.includes("multipart/form-data") ||
          contentType?.includes("application/x-www-form-urlencoded")
        ) {
          body = await request.arrayBuffer();
        } else {
          body = await request.text();
        }
      } catch {
        body = undefined;
      }
    }

    const cleanApiUrl = config.apiUrl.replace(/\/+$/, "");
    const url = `${cleanApiUrl}/api/my-account/${apiPath}${search}`;

    const apiRes = await fetch(url, {
      method: request.method,
      headers: outgoingHeaders,
      body,
    });

    const responseText = await apiRes.text();

    let data: any;
    try {
      data = JSON.parse(responseText);
    } catch {
      return NextResponse.json(
        { error: responseText || "Backend returned non-JSON response" },
        { status: apiRes.status || 500 }
      );
    }

    return NextResponse.json(data, {
      status: apiRes.status,
    });
  } catch (err: any) {
    console.error("Proxy Error:", err);
    return NextResponse.json(
      { error: err?.message || "Proxy failed" },
      { status: 500 }
    );
  }
}

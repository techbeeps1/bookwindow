import { NextResponse } from "next/server";
//import { apiRequest } from "@/lib/apiAuth";
import { cookies } from "next/headers";


export async function POST() {

  const cookiesData = await cookies();

  const refresh = cookiesData.get("refresh_token")?.value;

  if (!refresh) {
    return NextResponse.json({}, { status: 401 });
    
  }

  const res = await fetch("/refresh",  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${refresh}`,
    }
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json({}, { status: 401 });
  }

  const response = NextResponse.json({ success: true });

  response.cookies.set("access_token", data.access_token, {
    httpOnly: true,
    path: "/",
  });

  return response;

  
}


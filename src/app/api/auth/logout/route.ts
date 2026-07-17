import { NextResponse } from "next/server";

export async function POST() {
  // Clear cookie
  const response = NextResponse.json({ message: "Logged out" });
  response.cookies.set("BWAT", "", { path: "/", maxAge: 0 });
    response.cookies.set("BWDT", "", { path: "/", maxAge: 0 });
  
  return response;
}
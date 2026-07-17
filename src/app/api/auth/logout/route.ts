import { NextResponse } from "next/server";

export async function POST() {
  // Clear cookie
  const response = NextResponse.json({ message: "Logged out" });
  response.cookies.set("MMMDT", "", { path: "/", maxAge: 0 });
  response.cookies.set("MMMAT", "", { path: "/", maxAge: 0 });
  response.cookies.set("MMMRT", "", { path: "/", maxAge: 0 });
  return response;
}
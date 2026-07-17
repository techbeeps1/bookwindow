import { NextRequest, NextResponse } from "next/server";
import { AUTH_END } from "@/services/api";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const token = req.cookies.get("MMMAT")?.value;
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const res = await fetch(`${AUTH_END}/change-password` ,{
    method: "POST",
    body: JSON.stringify(body),
    headers:{ "Content-Type": "application/json" ,
     "Authorization": `Bearer ${token}`}
    
  });
  const data = await res.json();
  const response = NextResponse.json(data);
  return response;
}

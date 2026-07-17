import { NextRequest, NextResponse } from "next/server";
import { AUTH_END } from "@/services/api";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const res = await fetch(`${AUTH_END}/reset-password` ,{
    method: "POST",
    body: JSON.stringify(body),
    headers:{ "Content-Type": "application/json" }
    
  });
  const data = await res.json();
  const response = NextResponse.json(data);
  return response;
}

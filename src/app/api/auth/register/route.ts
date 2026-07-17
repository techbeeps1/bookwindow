import { NextResponse } from "next/server";
import config from "@/app/config";

export async function POST(req: Request) {
  const body = await req.json();
  const res = await fetch(`${config}/api/register` ,{
    method: "POST",
    body: JSON.stringify(body),
    headers:{ "Content-Type": "application/json" }
  });

  const data = await res.json();
  const response = NextResponse.json(data);
  return response;
}

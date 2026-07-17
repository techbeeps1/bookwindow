import config from "@/app/config";
import { NextResponse } from "next/server";


export async function POST(req: Request) {
  const body = await req.json();
  const res = await fetch(`${config.apiUrl}/forgot-password` ,{
    method: "POST",
    body: JSON.stringify(body),
    headers:{ "Content-Type": "application/json" }
  });

  const data = await res.json();
  const response = NextResponse.json(data);
  return response;
}

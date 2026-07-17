import { NextRequest, NextResponse } from "next/server";
import { AUTH_END } from "@/services/api";

export async function DELETE(req: NextRequest) {
  const MMMData = req.cookies.get("MMMDT")?.value;
  const MMMUserData = MMMData ? JSON.parse(MMMData) : null;
  const id = MMMUserData?.id;
  const token = req.cookies.get("MMMAT")?.value;
  
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(`${AUTH_END}/delete-account/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  return NextResponse.json(data);
}
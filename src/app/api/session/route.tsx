import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/IronSessionData";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: NextRequest) {
  const res = new NextResponse();
 
  const session: any = await getIronSession(req, res, sessionOptions);
  try {
    if (!session.session_id) {
      session.session_id = uuidv4();
    }
    await session.save();
    return NextResponse.json( {session_id: session.session_id },res);
  } catch (error: any) {
    console.error("Session error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

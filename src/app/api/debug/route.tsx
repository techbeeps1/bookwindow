// import { NextRequest, NextResponse } from "next/server";
// import { getIronSession } from "iron-session";
// import { sessionOptions } from "@/app/lib/session";
// import { v4 as uuidv4 } from "uuid"; // 👈 install uuid package

// export async function POST(req: NextRequest) {
//   const res = new NextResponse();

//   const session = await getIronSession(req, res, sessionOptions);

//   try {
//     // Generate session ID only once
//     if (!session.session_id) {
//       session.session_id = uuidv4();
//     }

//     // Initialize or increment count
//     session.count = session.count || 0;
//     session.count += 1;

//     await session.save();

//     return NextResponse.json(
//       {
//         session_id: session.session_id,
//         count: session.count,
//       },
//       res
//     );
//   } catch (error: any) {
//     console.error("Session error:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

// GET
// app/api/debug/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/app/lib/session";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: NextRequest) {
  const res = new NextResponse();

  const session: any = await getIronSession(req, res, sessionOptions);
//   console.log("session", session);
  try {
    if (!session.session_id) {
      session.session_id = uuidv4();
    }
    session.count = session.count || 0;
    session.count += 1;
    await session.save();

    return NextResponse.json(
      {
        session_id: session.session_id,
        count: session.count,
      },
      res
    );
  } catch (error: any) {
    console.error("Session error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

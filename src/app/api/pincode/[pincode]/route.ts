import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ pincode: string }> }
) {
  try {
    const { pincode } = await context.params;

    if (!pincode || !/^\d{6}$/.test(pincode)) {
      return NextResponse.json(
        { success: false, message: "Invalid 6-digit PIN code format." },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://api.postalpincode.in/pincode/${pincode}`,
      {
        next: { revalidate: 2592000 }, // Cache for 30 days (PIN code data rarely changes)
        headers: {
          "Accept": "application/json",
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: `Postal service returned status ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { success: false, message: "No data returned for this PIN code." },
        { status: 404 }
      );
    }

    const record = data[0];
    if (record.Status !== "Success" || !Array.isArray(record.PostOffice) || record.PostOffice.length === 0) {
      return NextResponse.json(
        { success: false, message: record.Message || "PIN code not found." },
        { status: 404 }
      );
    }

    const postOffices = record.PostOffice;
    const primaryState = postOffices[0]?.State || "";
    const primaryDistrict = postOffices[0]?.District || "";
    const primaryBlock = postOffices[0]?.Block && postOffices[0]?.Block !== "NA" ? postOffices[0]?.Block : "";
    const primaryDivision = postOffices[0]?.Division || "";

    // Collect unique city / locality names from Block, PostOffice, District, and Division
    // Prioritize Block first as it represents the local Tehsil/Town/City
    const citySet = new Set<string>();
    if (primaryBlock) citySet.add(primaryBlock);

    for (const po of postOffices) {
      if (po.Block && po.Block !== "NA") {
        citySet.add(po.Block);
      }
      if (po.Name) {
        // Strip out common suffixes like "(Jaipur)", "H.O", "B.O", "S.O"
        const cleanName = po.Name.replace(/\s*\([^)]*\)/g, "").replace(/\s+[HSB]\.O\.?$/i, "").trim();
        if (cleanName && cleanName.length > 2) {
          citySet.add(cleanName);
        }
      }
      if (po.District) citySet.add(po.District);
      if (po.Division) citySet.add(po.Division);
    }

    return NextResponse.json({
      success: true,
      pincode,
      state: primaryState,
      district: primaryDistrict,
      block: primaryBlock,
      division: primaryDivision,
      cities: Array.from(citySet),
      postOffices: postOffices.map((po: any) => ({
        name: po.Name,
        district: po.District,
        block: po.Block,
        division: po.Division,
        state: po.State,
      })),
    });
  } catch (error: any) {
    console.error("Error in pincode lookup route:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error fetching PIN code details." },
      { status: 500 }
    );
  }
}

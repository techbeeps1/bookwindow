export interface PincodeLookupResult {
  success: boolean;
  pincode?: string;
  state?: string;
  district?: string;
  block?: string;
  division?: string;
  cities?: string[];
  message?: string;
}

export interface StateRecord {
  id: number;
  name: string;
  is_active?: boolean | number;
  cities?: CityRecord[];
}

export interface CityRecord {
  id: number | string;
  state_id?: number;
  name: string;
  is_active?: boolean | number;
}

/**
 * Common state name aliases to map India Post names to Bookwindow database names.
 */
const STATE_ALIASES: Record<string, string> = {
  "new delhi": "delhi",
  "delhi ncr": "delhi",
  "national capital territory of delhi": "delhi",
  "orissa": "odisha",
  "jammu & kashmir": "jammu and kashmir",
  "jammu and kashmir": "jammu and kashmir",
  "pondicherry": "puducherry",
  "uttaranchal": "uttarakhand",
  "andaman & nicobar": "andaman and nicobar islands",
  "andaman & nicobar islands": "andaman and nicobar islands",
  "dadra & nagar haveli": "dadra and Nagar Haveli and Daman and Diu",
  "dadra and nagar haveli": "dadra and Nagar Haveli and Daman and Diu",
  "daman and diu": "dadra and Nagar Haveli and Daman and Diu",
  "daman & diu": "dadra and Nagar Haveli and Daman and Diu",
};

/**
 * Fetch PIN code details from our cached Next.js API route,
 * with graceful fallback to India Post public API if needed.
 */
export async function fetchPincodeDetails(pincode: string): Promise<PincodeLookupResult> {
  const cleanPin = pincode.replace(/\D/g, "");
  if (cleanPin.length !== 6) {
    return { success: false, message: "PIN code must be exactly 6 digits." };
  }

  // 1. Try internal cached Next.js API route first
  try {
    const res = await fetch(`/api/pincode/${cleanPin}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.success) {
        return data;
      }
    }
  } catch (err) {
    console.warn("Internal pincode API failed, falling back to direct lookup:", err);
  }

  // 2. Client-side fallback directly to postalpincode.in (in case Next.js BFF is unavailable)
  try {
    const directRes = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`);
    if (directRes.ok) {
      const data = await directRes.json();
      if (Array.isArray(data) && data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
        const postOffices = data[0].PostOffice;
        const primaryDistrict = postOffices[0]?.District || "";
        const primaryState = postOffices[0]?.State || "";
        const primaryBlock = postOffices[0]?.Block && postOffices[0]?.Block !== "NA" ? postOffices[0]?.Block : "";
        const primaryDivision = postOffices[0]?.Division || "";

        const citySet = new Set<string>();
        if (primaryBlock) citySet.add(primaryBlock);

        for (const po of postOffices) {
          if (po.Block && po.Block !== "NA") citySet.add(po.Block);
          if (po.Name) {
            const cleanName = po.Name.replace(/\s*\([^)]*\)/g, "").replace(/\s+[HSB]\.O\.?$/i, "").trim();
            if (cleanName && cleanName.length > 2) citySet.add(cleanName);
          }
          if (po.District) citySet.add(po.District);
          if (po.Division) citySet.add(po.Division);
        }

        return {
          success: true,
          pincode: cleanPin,
          state: primaryState,
          district: primaryDistrict,
          block: primaryBlock,
          division: primaryDivision,
          cities: Array.from(citySet),
        };
      }
    }
  } catch (directErr) {
    console.warn("Direct postal lookup failed:", directErr);
  }

  return { success: false, message: "Location not found for this PIN code." };
}

/**
 * Match the API returned state against the list of database states.
 */
export function matchState(apiState: string, statesList: StateRecord[]): StateRecord | null {
  if (!apiState || !statesList || statesList.length === 0) return null;

  const normalizedInput = apiState.trim().toLowerCase();
  const aliasMapped = STATE_ALIASES[normalizedInput] || normalizedInput;

  // 1. Exact match or alias match
  const exact = statesList.find(
    (s) => s.name.trim().toLowerCase() === normalizedInput || s.name.trim().toLowerCase() === aliasMapped
  );
  if (exact) return exact;

  // 2. Partial match (e.g. "Delhi" in "NCT of Delhi" or vice versa)
  const partial = statesList.find((s) => {
    const sName = s.name.trim().toLowerCase();
    return sName.includes(aliasMapped) || aliasMapped.includes(sName);
  });

  return partial || null;
}

/**
 * Match the API returned district, block, and city names against the cities of the matched state.
 * Prioritizes Block (Tehsil/Sub-division) over District so that specific towns (e.g. Anupgarh vs Ganganagar)
 * are accurately selected.
 */
export function matchCity(
  apiDistrict: string,
  apiCities: string[] = [],
  stateCities: CityRecord[] = [],
  apiBlock: string = ""
): { cityName: string; isPreset: boolean } {
  const cleanBlock = apiBlock && apiBlock !== "NA" ? apiBlock.trim() : "";
  const fallbackCity = cleanBlock || (apiDistrict ? apiDistrict.trim() : (apiCities[0] || ""));

  if (!stateCities || stateCities.length === 0) {
    return { cityName: fallbackCity, isPreset: false };
  }

  // 1. Priority 1: Exact match on Block (Tehsil/Town) - e.g. Anupgarh
  if (cleanBlock) {
    const blockLower = cleanBlock.toLowerCase();
    const exactBlock = stateCities.find((c) => c.name.trim().toLowerCase() === blockLower);
    if (exactBlock) {
      return { cityName: exactBlock.name, isPreset: true };
    }
  }

  // 2. Priority 2: Match against candidate local cities / post offices
  for (const candidate of apiCities) {
    if (!candidate || candidate === "NA") continue;
    const candLower = candidate.trim().toLowerCase();
    const found = stateCities.find((c) => c.name.trim().toLowerCase() === candLower);
    if (found) {
      return { cityName: found.name, isPreset: true };
    }
  }

  // 3. Priority 3: Exact match on primary District (e.g. Ganganagar / Jaipur)
  if (apiDistrict) {
    const districtLower = apiDistrict.trim().toLowerCase();
    const exactDistrict = stateCities.find((c) => c.name.trim().toLowerCase() === districtLower);
    if (exactDistrict) {
      return { cityName: exactDistrict.name, isPreset: true };
    }
  }

  // 4. Priority 4: Partial contains match (e.g. "Anupgarh" inside "Anupgarh Tehsil" or vice-versa)
  if (cleanBlock) {
    const blockLower = cleanBlock.toLowerCase();
    const partialBlock = stateCities.find((c) => {
      const cName = c.name.trim().toLowerCase();
      return cName.includes(blockLower) || blockLower.includes(cName);
    });
    if (partialBlock) {
      return { cityName: partialBlock.name, isPreset: true };
    }
  }

  if (apiDistrict) {
    const districtLower = apiDistrict.trim().toLowerCase();
    const partialDistrict = stateCities.find((c) => {
      const cName = c.name.trim().toLowerCase();
      return cName.includes(districtLower) || districtLower.includes(cName);
    });
    if (partialDistrict) {
      return { cityName: partialDistrict.name, isPreset: true };
    }
  }

  // 5. Fallback to clean Block (if present) or District as custom option
  return { cityName: fallbackCity, isPreset: false };
}

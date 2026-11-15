import { NextRequest, NextResponse } from "next/server";
import { FilterCondition, SortCondition } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const { naturalQuery } = await request.json();
    if (!naturalQuery || typeof naturalQuery !== "string") {
      return NextResponse.json({ error: "Missing natural query" }, { status: 400 });
    }

    const input = naturalQuery.toLowerCase();
    const filters: FilterCondition[] = [];
    const sorting: SortCondition[] = [];
    let textQuery = "";
    const explanations: string[] = [];

    // 1. Status extraction
    if (input.includes("active")) {
      filters.push({ id: `f-${Date.now()}-1`, field: "status", operator: "equals", value: "Active" });
      explanations.push("Filtered by Status = Active");
    } else if (input.includes("pending")) {
      filters.push({ id: `f-${Date.now()}-1`, field: "status", operator: "equals", value: "Pending" });
      explanations.push("Filtered by Status = Pending");
    } else if (input.includes("archived")) {
      filters.push({ id: `f-${Date.now()}-1`, field: "status", operator: "equals", value: "Archived" });
      explanations.push("Filtered by Status = Archived");
    }

    // 2. Country extraction
    const countries = [
      "germany", "united states", "united kingdom", "france", "japan",
      "canada", "australia", "singapore", "brazil", "netherlands", "sweden"
    ];
    for (const c of countries) {
      if (input.includes(c)) {
        const formattedCountry = c.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
        filters.push({ id: `f-${Date.now()}-2`, field: "country", operator: "equals", value: formattedCountry });
        explanations.push(`Filtered by Country = ${formattedCountry}`);
        break;
      }
    }

    // 3. Revenue extraction (e.g. "revenue greater than $10,000", "revenue > 50000")
    const revGreaterMatch = input.match(/revenue\s*(?:greater than|>|more than|over)\s*\$?([\d,]+)/i);
    if (revGreaterMatch && revGreaterMatch[1]) {
      const amount = revGreaterMatch[1].replace(/,/g, "");
      filters.push({ id: `f-${Date.now()}-3`, field: "revenue", operator: "greater_than", value: amount });
      explanations.push(`Filtered by Revenue > $${Number(amount).toLocaleString()}`);
    }

    const revLessMatch = input.match(/revenue\s*(?:less than|<|under)\s*\$?([\d,]+)/i);
    if (revLessMatch && revLessMatch[1]) {
      const amount = revLessMatch[1].replace(/,/g, "");
      filters.push({ id: `f-${Date.now()}-4`, field: "revenue", operator: "less_than", value: amount });
      explanations.push(`Filtered by Revenue < $${Number(amount).toLocaleString()}`);
    }

    // 4. Industry extraction
    const industries = ["technology", "healthcare", "financial services", "finance", "manufacturing", "retail"];
    for (const ind of industries) {
      if (input.includes(ind)) {
        const targetInd = ind === "finance" ? "Financial Services" : ind.charAt(0).toUpperCase() + ind.slice(1);
        filters.push({ id: `f-${Date.now()}-5`, field: "industry", operator: "equals", value: targetInd });
        explanations.push(`Filtered by Industry = ${targetInd}`);
        break;
      }
    }

    // 5. Contract tier extraction
    if (input.includes("enterprise")) {
      filters.push({ id: `f-${Date.now()}-6`, field: "contractTier", operator: "equals", value: "Enterprise" });
      explanations.push("Filtered by Contract Tier = Enterprise");
    } else if (input.includes("startup")) {
      filters.push({ id: `f-${Date.now()}-6`, field: "contractTier", operator: "equals", value: "Startup" });
      explanations.push("Filtered by Contract Tier = Startup");
    }

    // 6. Timeframe extraction
    const lastDaysMatch = input.match(/last\s*(\d+)\s*days/i);
    if (lastDaysMatch && lastDaysMatch[1]) {
      const days = Number(lastDaysMatch[1]);
      filters.push({ id: `f-${Date.now()}-7`, field: "createdAt", operator: "last_n_days", value: String(days) });
      explanations.push(`Filtered by Created Date = Last ${days} Days`);
    }

    // 7. Sorting extraction
    if (input.includes("highest revenue") || input.includes("top revenue") || input.includes("sort by revenue")) {
      sorting.push({ column: "revenue", direction: "desc" });
      explanations.push("Sorted by Revenue (Descending)");
    } else if (input.includes("lowest risk") || input.includes("safest")) {
      sorting.push({ column: "riskScore", direction: "asc" });
      explanations.push("Sorted by Risk Score (Ascending)");
    } else if (input.includes("highest risk")) {
      sorting.push({ column: "riskScore", direction: "desc" });
      explanations.push("Sorted by Risk Score (Descending)");
    }

    // If no specific fields found, use the phrase as a full-text search query
    if (filters.length === 0) {
      textQuery = naturalQuery;
      explanations.push(`Applied as global search term: "${textQuery}"`);
    }

    return NextResponse.json({
      query: textQuery,
      filters,
      sorting: sorting.length ? sorting : [{ column: "recordNumber", direction: "asc" }],
      explanation: explanations.join(" • ") || "Interpreted standard query parameters.",
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: "Failed to parse natural language query", details: String(err) },
      { status: 500 }
    );
  }
}

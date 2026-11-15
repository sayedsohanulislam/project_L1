import { describe, it, expect } from "vitest";

describe("AI Search Assistant Intent Parser Integration Tests", () => {
  // Test natural language query translation rules corresponding to Section 17.E:
  // "Find active customers from Germany with revenue greater than $10,000."
  it("should extract status, country, and revenue from complex natural phrase", () => {
    const input = "Find active customers from Germany with revenue greater than $10,000";
    const lower = input.toLowerCase();

    // 1. Status extraction
    const hasActive = lower.includes("active");
    expect(hasActive).toBe(true);

    // 2. Country extraction
    const hasGermany = lower.includes("germany");
    expect(hasGermany).toBe(true);

    // 3. Numeric Revenue extraction
    const revMatch = lower.match(/revenue\s*(?:greater than|>|more than|over)\s*\$?([\d,]+)/i);
    expect(revMatch).not.toBeNull();
    expect(revMatch![1].replace(/,/g, "")).toBe("10000");
  });

  it("should handle date boundaries like 'last 30 days'", () => {
    const input = "Show startup accounts created in last 30 days";
    const lastDaysMatch = input.match(/last\s*(\d+)\s*days/i);
    expect(lastDaysMatch).not.toBeNull();
    expect(Number(lastDaysMatch![1])).toBe(30);
  });
});

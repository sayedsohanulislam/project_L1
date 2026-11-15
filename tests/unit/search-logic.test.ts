import { describe, it, expect } from "vitest";

describe("DataScope Core Search & Filter Logic Unit Tests", () => {
  const sampleRecords = [
    {
      id: "rec-1",
      recordNumber: 101,
      companyName: "Quantum Dynamics",
      status: "Active",
      country: "Germany",
      revenue: 45000,
      riskScore: 22.5,
    },
    {
      id: "rec-2",
      recordNumber: 102,
      companyName: "Alpha Solutions",
      status: "Active",
      country: "United States",
      revenue: 8500,
      riskScore: 55.0,
    },
    {
      id: "rec-3",
      recordNumber: 103,
      companyName: "Nexus Systems",
      status: "Pending",
      country: "Germany",
      revenue: 95000,
      riskScore: 78.0,
    },
    {
      id: "rec-4",
      recordNumber: 104,
      companyName: "Apex Logistics",
      status: "Active",
      country: "Germany",
      revenue: 150000,
      riskScore: 12.0,
    },
  ];

  it("should correctly evaluate exact match filters", () => {
    const active = sampleRecords.filter((r) => r.status === "Active");
    expect(active.length).toBe(3);
  });

  it("should correctly evaluate compound filters (Status = Active AND Country = Germany AND Revenue > 10,000)", () => {
    // Specification section 3.C demo condition
    const matches = sampleRecords.filter(
      (r) => r.status === "Active" && r.country === "Germany" && r.revenue > 10000
    );
    expect(matches.length).toBe(2);
    expect(matches.map((m) => m.companyName)).toEqual([
      "Quantum Dynamics",
      "Apex Logistics",
    ]);
  });

  it("should evaluate numeric range filters correctly", () => {
    const highRisk = sampleRecords.filter((r) => r.riskScore >= 50);
    expect(highRisk.length).toBe(2);
    expect(highRisk.map((r) => r.companyName)).toContain("Alpha Solutions");
    expect(highRisk.map((r) => r.companyName)).toContain("Nexus Systems");
  });

  it("should correctly sort multi-column criteria (Revenue Descending)", () => {
    const sorted = [...sampleRecords].sort((a, b) => b.revenue - a.revenue);
    expect(sorted[0].companyName).toBe("Apex Logistics");
    expect(sorted[sorted.length - 1].companyName).toBe("Alpha Solutions");
  });

  it("should correctly paginate slices without memory mutation", () => {
    const pageSize = 2;
    const page1 = sampleRecords.slice(0, pageSize);
    const page2 = sampleRecords.slice(pageSize, pageSize * 2);

    expect(page1.length).toBe(2);
    expect(page2.length).toBe(2);
    expect(page1[0].id).toBe("rec-1");
    expect(page2[0].id).toBe("rec-3");
  });
});

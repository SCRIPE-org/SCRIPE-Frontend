import { describe, expect, it, vi } from "vitest";
import { formatSafeCsvCell } from "./useCrmReportsViewModel";
import { CrmOverviewService } from "../../data/services/CrmOverviewService";
import type { IApiService } from "@/core/interfaces/api.interface";

describe("CSV Formula Sanitization & Overview Real Data Mapping", () => {
  it("neutralizes spreadsheet formula prefixes (=, +, -, @, tab, cr, lf) and applies RFC4180 quoting", () => {
    expect(formatSafeCsvCell('=CMD("calc")')).toBe('"\'=CMD(""calc"")"');
    expect(formatSafeCsvCell("+1+1")).toBe('"\'+1+1"');
    expect(formatSafeCsvCell("-2+3")).toBe('"\'-2+3"');
    expect(formatSafeCsvCell("@SUM(A1:A2)")).toBe('"\'@SUM(A1:A2)"');
    expect(formatSafeCsvCell("\t=1+1")).toBe('"\'\t=1+1"');
    expect(formatSafeCsvCell("\r=1+1")).toBe('"\'\r=1+1"');
    expect(formatSafeCsvCell(" =IMPORTXML()")).toBe('"\' =IMPORTXML()"');
    expect(formatSafeCsvCell('Stage "Alpha", Q1')).toBe('"Stage ""Alpha"", Q1"');
  });

  it("maps real partyDisplayName/ownerDisplayName and zero fake 68.4%/24 placeholders in CrmOverviewService", async () => {
    const fakeApi = {
      get: vi.fn(async (url: string) => {
        if (url.startsWith("/v1/crm/pipelines/default")) {
          return { pipelineId: "pipe-1", nameEn: "Standard", stages: [] };
        }
        if (url.startsWith("/v1/crm/opportunities")) {
          return {
            items: [
              {
                id: "opp-1",
                title: "Sponsorship Deal",
                partyId: "enc_party_1",
                partyDisplayName: "Al-Hilal Club",
                ownerDisplayName: "Layla Al-Qahtani",
                stageKey: "default.qualification",
                estimatedAmount: 50000,
                currencyCode: "SAR",
              },
              {
                id: "opp-2",
                title: "Unlinked Deal",
                stageKey: "default.discovery",
                estimatedAmount: 10000,
                currencyCode: "SAR",
              },
            ],
          };
        }
        throw new Error("Report unavailable");
      }),
    } as unknown as IApiService;

    const svc = new CrmOverviewService(fakeApi);
    const overview = await svc.getOverviewData("Hilal");

    expect(overview.recentDeals[0]).toMatchObject({
      partyName: "Al-Hilal Club",
      ownerName: "Layla Al-Qahtani",
    });
    expect(overview.recentDeals[1]).toMatchObject({
      partyName: "",
      ownerName: "",
    });
    expect(overview.recentDeals[1].partyName).not.toBe("Unlinked Deal");
    expect(overview.recentDeals[1].ownerName).not.toBe("Commercial Lead");

    const winRate = overview.stats.find((s) => s.id === "win-rate");
    const avgCycle = overview.stats.find((s) => s.id === "avg-cycle");
    expect(winRate?.value).toBe("0%");
    expect(avgCycle?.value).toBe("0 Days");
    expect(overview.stats.some((s) => s.change.includes("%"))).toBe(false);
  });
});

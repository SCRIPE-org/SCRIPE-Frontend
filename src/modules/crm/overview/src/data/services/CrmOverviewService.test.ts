import { describe, expect, it, vi } from "vitest";
import type { IApiService } from "@/core/interfaces/api.interface";
import { CrmOverviewMapper } from "../mappers/CrmOverviewMapper";
import { CrmOverviewService } from "./CrmOverviewService";

describe("CrmOverviewService & CrmOverviewMapper", () => {
  it("maps real partyDisplayName/ownerDisplayName and zero fake placeholders", async () => {
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
    const dto = await svc.getOverviewData("Hilal");
    const entity = CrmOverviewMapper.toEntity(dto);

    expect(entity.recentDeals[0]).toMatchObject({
      partyName: "Al-Hilal Club",
      ownerName: "Layla Al-Qahtani",
    });
    expect(entity.recentDeals[1]).toMatchObject({
      partyName: "",
      ownerName: "",
    });
    expect(entity.totalDeals).toBe(2);
    expect(entity.totalPipelineValue).toBe(60000);
  });
});

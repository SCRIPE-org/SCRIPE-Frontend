import { describe, it, expect, vi, beforeEach } from "vitest";
import { AcademyFinanceRepository } from "./AcademyFinanceRepository";
import type { IAcademyFinanceService } from "../../domain/interfaces/IAcademyFinanceService";

describe("AcademyFinanceRepository", () => {
  let repository: AcademyFinanceRepository;
  let mockService: {
    getFeesReceivables: ReturnType<typeof vi.fn>;
    getExportUrl: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockService = {
      getFeesReceivables: vi.fn(),
      getExportUrl: vi.fn()
    };
    repository = new AcademyFinanceRepository(mockService as unknown as IAcademyFinanceService);
  });

  it("maps DTO response into domain entities and preserves currency breakdown", async () => {
    const rawDto = {
      items: [
        {
          enrollmentId: "en-101",
          athleteId: "ath-101",
          athleteNameEn: "Tariq Salem",
          programNameEn: "Swimming Elite",
          billingStatus: "PartiallyPaid",
          priceCurrency: "SAR",
          quoteAmount: 2000,
          totalInvoicedAmount: 2000,
          paidAmount: 1000,
          outstandingAmount: 1000,
          isOverdue: true,
          daysOverdue: 14
        }
      ],
      summaries: [
        {
          currencyCode: "SAR",
          invoicedCount: 1,
          paidCount: 0,
          outstandingCount: 1,
          overdueCount: 1,
          waivedCount: 0,
          unbilledCount: 0,
          totalInvoiced: 2000,
          totalPaid: 1000,
          totalOutstanding: 1000,
          totalOverdue: 1000
        }
      ],
      totalCount: 1,
      asOfUtc: "2026-11-08T14:30:00Z",
      blockedCapabilities: ["INSTALLMENTS_SCHEDULE"]
    };

    mockService.getFeesReceivables.mockResolvedValue(rawDto);

    const result = await repository.getFeesReceivables();

    expect(mockService.getFeesReceivables).toHaveBeenCalled();
    expect(result.items.length).toBe(1);
    expect(result.items[0].enrollmentId).toBe("en-101");
    expect(result.items[0].outstandingAmount).toBe(1000);
    expect(result.items[0].isOverdue).toBe(true);
    expect(result.summaries[0].currencyCode).toBe("SAR");
    expect(result.blockedCapabilities).toContain("INSTALLMENTS_SCHEDULE");
  });

  it("delegates getExportUrl to service", () => {
    mockService.getExportUrl.mockReturnValue("/api/v1/academy/finance/fees-receivables/export?currencyCode=SAR");
    const url = repository.getExportUrl({ currencyCode: "SAR" });
    expect(url).toBe("/api/v1/academy/finance/fees-receivables/export?currencyCode=SAR");
  });
});

import { AppPurchase, DeveloperPayout } from "../../domain/entities/FinancialEntities";
import type { PayoutStatus } from "../../domain/entities/FinancialEntities";

/**
 * API response shape for a purchase record.
 * Maps to backend AppPurchaseResponse:
 *   - purchaseDate (not purchasedAt)
 *   - amountPaid (not amount)
 *   - status (payment status string)
 *
 * Note: pricingModel and tenantName are NOT in the backend response;
 * they must be resolved client-side or added to the backend DTO later.
 */
export interface PurchaseDto {
  id: string;
  appListingId: string;
  appName?: string;
  tenantId: string;
  /** Backend field name: PurchaseDate */
  purchaseDate?: string;
  /** Backend field name: AmountPaid */
  amountPaid?: number;
  currency?: string;
  /** Backend field name: Status (payment status) */
  status?: string;
  createdAt?: string;
}

/** API response shape for a developer payout record. */
export interface PayoutDto {
  id: string;
  developerProfileId: string;
  developerName?: string;
  amount?: number;
  currency?: string;
  periodStart?: string;
  periodEnd?: string;
  status?: string;
  stripeTransferId?: string | null;
  createdAt?: string;
}

/**
 * Standalone mappers for financial entities (AppPurchase, DeveloperPayout).
 * Centralizes null-coalescing, field name translation, and type narrowing.
 *
 * IMPORTANT: Backend field names are PascalCase (serialized as camelCase).
 * When the backend DTO differs from the frontend entity, this mapper bridges
 * the field name gap (e.g., amountPaid → amount, purchaseDate → purchasedAt).
 */
export class FinancialMapper {
  /**
   * Maps a backend AppPurchaseResponse to a domain AppPurchase entity.
   * Bridges field name differences:
   *   - amountPaid → amount
   *   - purchaseDate → purchasedAt
   *   - pricingModel is inferred (not available from backend currently)
   *   - tenantName is not in backend response (defaults to empty)
   */
  static toPurchase(d: PurchaseDto): AppPurchase {
    return new AppPurchase({
      id: d.id,
      appListingId: d.appListingId,
      appName: d.appName ?? "",
      tenantId: d.tenantId,
      tenantName: "", // Not in backend AppPurchaseResponse — resolve via tenant lookup
      amount: d.amountPaid ?? 0,
      currency: d.currency ?? "USD",
      pricingModel: FinancialMapper.toPricingModel(d.status), // Infer from status
      purchasedAt: d.purchaseDate ?? d.createdAt ?? new Date().toISOString(),
    });
  }

  /** Maps a backend DeveloperPayoutResponse to a domain DeveloperPayout entity. */
  static toPayout(d: PayoutDto): DeveloperPayout {
    return new DeveloperPayout({
      id: d.id,
      developerProfileId: d.developerProfileId,
      developerName: d.developerName ?? "",
      amount: d.amount ?? 0,
      currency: d.currency ?? "USD",
      periodStart: d.periodStart ?? "",
      periodEnd: d.periodEnd ?? "",
      status: FinancialMapper.toPayoutStatus(d.status),
      stripeTransferId: d.stripeTransferId ?? null,
      createdAt: d.createdAt ?? new Date().toISOString(),
    });
  }

  // ── Private helpers for type-safe enum narrowing ──────────────────

  /** Narrows a raw API string to the AppPurchaseData.pricingModel union. */
  private static toPricingModel(raw?: string): "OneTime" | "Subscription" {
    if (raw === "Subscription") return "Subscription";
    return "OneTime";
  }

  /** Narrows a raw API string to the PayoutStatus union. */
  private static toPayoutStatus(raw?: string): PayoutStatus {
    const valid: PayoutStatus[] = ["Pending", "Processing", "Paid", "Failed"];
    return valid.includes(raw as PayoutStatus) ? (raw as PayoutStatus) : "Pending";
  }
}

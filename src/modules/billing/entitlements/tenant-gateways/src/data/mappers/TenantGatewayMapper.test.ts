import { describe, it, expect } from "vitest";
import { TenantGatewayMapper } from "./TenantGatewayMapper";
import type { TenantGatewayModel } from "../models/TenantGatewayModels";

// Pagination.md §7 "TenantGatewayModel" / task item 3: the DTO+mapper used to
// read gateway/isEnabled/modifiedAt — field names the real backend
// (Entitlements.Application/DTOs/Billing/TenantGatewayResponse.cs) never
// sends; it sends gatewayType/isActive/isDefault/updatedAt. Because
// safeParseApiResponse degrades silently on a schema mismatch instead of
// throwing, every gateway used to render with gateway: '', isEnabled: false
// regardless of the real values — Edit opened nothing (empty gateway type
// couldn't match any AVAILABLE_GATEWAYS entry), Delete hit an empty route
// segment, and the status stripe always showed "disabled". These tests
// build a DTO shaped exactly like the real backend response (per
// TenantGatewayResponse.cs) and assert the mapped entity carries the real
// values through, not the empty-string/false defaults the old field names
// silently produced.

function buildRealBackendShape(overrides: Partial<TenantGatewayModel> = {}): TenantGatewayModel {
  return {
    id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    gatewayType: "Stripe",
    displayLabel: "Primary Stripe",
    merchantId: "acct_123",
    isActive: true,
    isDefault: true,
    isVerified: true,
    isTestMode: false,
    lastVerifiedAt: "2026-08-01T12:00:00Z",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-08-01T12:00:00Z",
    ...overrides,
  };
}

describe("TenantGatewayMapper.toEntity", () => {
  it("maps the real backend wire shape (gatewayType/isActive/updatedAt) to the entity", () => {
    const entity = TenantGatewayMapper.toEntity(buildRealBackendShape());

    expect(entity.gateway).toBe("Stripe");
    expect(entity.isEnabled).toBe(true);
    expect(entity.isVerified).toBe(true);
    expect(entity.modifiedAt).toBe("2026-08-01T12:00:00Z");
  });

  it("does not silently show an active, verified gateway as disabled", () => {
    const entity = TenantGatewayMapper.toEntity(
      buildRealBackendShape({ isActive: true, isVerified: true })
    );

    // Regression guard for the exact reported symptom: the status stripe/badge
    // always read "disabled" because isActive/gatewayType were never read.
    expect(entity.statusText).toBe("entitlements.tenantGateways.status.connected");
    expect(entity.gateway).not.toBe("");
  });

  it("reflects a genuinely disabled gateway correctly (not just always false or always true)", () => {
    const entity = TenantGatewayMapper.toEntity(
      buildRealBackendShape({ isActive: false, isVerified: false })
    );

    expect(entity.isEnabled).toBe(false);
    expect(entity.statusText).toBe("entitlements.tenantGateways.status.disabled");
  });

  it("produces a non-empty gateway type usable as the Edit/Delete/Verify lookup key", () => {
    const entity = TenantGatewayMapper.toEntity(buildRealBackendShape({ gatewayType: "PayPal" }));

    // useTenantGatewaysViewModel/TenantPaymentGatewaysView key Edit, Verify,
    // and Delete off entity.gateway — an empty string here is what made
    // Delete a no-op and Edit render nothing before the fix.
    expect(entity.gateway).toBe("PayPal");
    expect(entity.iconName).toBe("Wallet");
  });
});

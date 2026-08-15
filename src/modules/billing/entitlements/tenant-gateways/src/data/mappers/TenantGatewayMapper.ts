import { TenantGateway } from "../../domain/entities/TenantGateway";
import type { TenantGatewayModel } from "../models/TenantGatewayModels";
import { z } from "zod";
import {
  safeParseApiResponse,
  uuidField,
  optionalString,
  optionalIsoDate,
} from "@core/common/zod-utils";

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const TenantGatewayModelSchema = z.object({
  id: uuidField(),
  gatewayType: optionalString(),
  displayLabel: optionalString(),
  merchantId: optionalString(),
  isActive: z.boolean().optional().default(false),
  isDefault: z.boolean().optional().default(false),
  isVerified: z.boolean().optional().default(false),
  isTestMode: z.boolean().optional().default(false),
  lastVerifiedAt: optionalIsoDate(),
  createdAt: optionalString(),
  updatedAt: z.string().optional().nullable(),
});

/**
 * Bidirectional data mapper orchestrating conversion between database DTO formats and frontend domain entities, enforcing null-safe defaults.
 */
export class TenantGatewayMapper {
  static toEntity(dto: TenantGatewayModel): TenantGateway {
    const validated = safeParseApiResponse(TenantGatewayModelSchema, dto, "TenantGateway");

    return new TenantGateway({
      id: validated.id,
      gateway: validated.gatewayType ?? "",
      displayLabel: validated.displayLabel ?? "",
      merchantId: validated.merchantId ?? "",
      isEnabled: validated.isActive ?? false,
      isVerified: validated.isVerified ?? false,
      isTestMode: validated.isTestMode ?? false,
      lastVerifiedAt: validated.lastVerifiedAt ?? null,
      createdAt: validated.createdAt ?? "",
      modifiedAt: validated.updatedAt ?? null,
    });
  }
}

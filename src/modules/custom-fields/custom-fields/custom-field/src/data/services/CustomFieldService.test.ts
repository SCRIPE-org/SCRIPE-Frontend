// ═══════════════════════════════════════════════════════════════════════════
// CustomFieldService.getAll — paged-response wire-shape contract test
//
// WHY THIS EXISTS
// ----------------
// Core.Application.Common.PagedResult<T> (SCRIPE-Backend/src/Core/Core.Application/
// Common/PagedResult.cs) exposes a `PageNumber` property. ASP.NET Core's
// `AddControllers().AddJsonOptions(...)` (SCRIPE-Backend/src/Host/API/Extensions/
// ServiceExtensions.cs) does not override the Web-defaults naming policy, and every
// explicit `JsonSerializerOptions` in the backend that touches API responses sets
// `PropertyNamingPolicy = JsonNamingPolicy.CamelCase` (see e.g.
// FieldProjectionMiddleware.cs, BaseDbContext.cs) — so the wire key is `pageNumber`,
// not `page`. `CustomFieldListResponseJson` (see ../models/CustomFieldModel.ts)
// previously declared a `page` field, which would silently read as `undefined` from
// a real response. Pinning the actual wire key here so this cannot regress.
// ═══════════════════════════════════════════════════════════════════════════

import { describe, it, expect, vi } from "vitest";
import { CustomFieldService } from "./CustomFieldService";
import type { IApiService } from "@core/interfaces/api.interface";
import type { CustomFieldListResponseJson } from "../models/CustomFieldModel";

function mockApiService(response: CustomFieldListResponseJson): IApiService {
  return {
    get: vi.fn().mockResolvedValue(response),
  } as unknown as IApiService;
}

describe("CustomFieldService.getAll", () => {
  it("reads the current page from the backend's actual `pageNumber` wire key", async () => {
    const wireResponse: CustomFieldListResponseJson = {
      items: [],
      totalCount: 42,
      pageNumber: 2,
      pageSize: 20,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: true,
    };
    const service = new CustomFieldService(mockApiService(wireResponse));

    const result = await service.getAll({ page: 2, pageSize: 20 });

    expect(result.page).toBe(2);
  });
});

/**
 * useRestrictableCustomFieldKeys — Tier 1 slice 7.
 *
 * Every case here pins a decision that had a wrong-but-plausible alternative, because
 * this hook sits between two vocabularies (permission resource vs entity type) and
 * three of the four ways to get it wrong look correct in a screenshot:
 *
 *  - resolving only the FIRST entity type for a resource (the mapping is one-to-many);
 *  - sourcing keys from the values route, which self-censors the caller's own
 *    restricted fields;
 *  - filtering required fields out instead of flagging them;
 *  - firing the query for an admin without `custom-fields.view`.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useRestrictableCustomFieldKeys } from "./useRestrictableCustomFieldKeys";
import { CustomField } from "../../domain/entities/CustomField";
import type { EntityTypeInfo } from "../../domain/entities/CustomField";
import { getCustomFieldsContainer } from "../../../../di";

vi.mock("../../../../di", () => ({ getCustomFieldsContainer: vi.fn() }));

function entityType(key: string, permissionResource?: string): EntityTypeInfo {
  return {
    key,
    owningModule: "PartyKernel",
    displayNameEn: key,
    displayNameAr: key,
    permissionResource,
  };
}

function definition(key: string, isRequired = false) {
  return new CustomField({
    id: `id-${key}`,
    entityTypeKey: "party.person",
    key,
    labelEn: `${key} label`,
    valueType: "Text",
    isRequired,
    sortOrder: 0,
    isActive: true,
    createdAt: "2026-01-01",
  } as never);
}

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

/** @param byEntityType definitions keyed by entity-type key */
function setup(
  entityTypes: EntityTypeInfo[],
  byEntityType: Record<string, { items: CustomField[]; totalCount?: number }>
) {
  const getAll = vi.fn(async ({ entityTypeKey }: { entityTypeKey?: string }) => {
    const found = byEntityType[entityTypeKey ?? ""] ?? { items: [] };
    return {
      items: found.items,
      totalCount: found.totalCount ?? found.items.length,
      page: 1,
      pageSize: 100,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    };
  });
  const getEntityTypes = vi.fn().mockResolvedValue(entityTypes);
  vi.mocked(getCustomFieldsContainer).mockReturnValue({
    customFieldRepository: { getAll, getEntityTypes },
  } as never);
  return { getAll, getEntityTypes };
}

describe("useRestrictableCustomFieldKeys", () => {
  beforeEach(() => vi.clearAllMocks());

  it("offers the keys defined on the entity type behind a permission resource", async () => {
    setup([entityType("party.person", "party-people")], {
      "party.person": { items: [definition("salary"), definition("nickname")] },
    });

    const { result } = renderHook(() => useRestrictableCustomFieldKeys("party-people"), { wrapper });

    await waitFor(() => expect(result.current.keys).toHaveLength(2));
    expect(result.current.keys.map((entry) => entry.key)).toEqual(["nickname", "salary"]);
    expect(result.current.isAvailable).toBe(true);
  });

  it("unions across EVERY entity type sharing the resource, not just the first", async () => {
    // `media.medias` and `media.file` really do share one resource. Resolving only the
    // first match would silently offer half the fields — and look completely normal.
    setup(
      [entityType("media.medias", "medias"), entityType("media.file", "medias")],
      {
        "media.medias": { items: [definition("caption")] },
        "media.file": { items: [definition("checksum")] },
      }
    );

    const { result } = renderHook(() => useRestrictableCustomFieldKeys("medias"), { wrapper });

    await waitFor(() => expect(result.current.keys).toHaveLength(2));
    expect(result.current.keys.map((entry) => entry.key)).toEqual(["caption", "checksum"]);
  });

  it("flags a required field rather than hiding it", async () => {
    // Restricting a required field is refused server-side and takes the WHOLE
    // permissions save down. Hiding it would leave the admin unable to see why their
    // save keeps failing; offering it unmarked would make that failure more likely
    // than blind typing did.
    setup([entityType("party.person", "party-people")], {
      "party.person": { items: [definition("salary", true), definition("nickname", false)] },
    });

    const { result } = renderHook(() => useRestrictableCustomFieldKeys("party-people"), { wrapper });

    await waitFor(() => expect(result.current.keys).toHaveLength(2));
    expect(result.current.keys.find((entry) => entry.key === "salary")?.isRequired).toBe(true);
    expect(result.current.keys.find((entry) => entry.key === "nickname")?.isRequired).toBe(false);
  });

  it("deduplicates the same key across two entity types, and ORs the required flag", async () => {
    // The server matches case-insensitively, so two tags differing only in case are
    // one restriction. And if the key is required on EITHER entity type, restricting
    // it fails — so the warning has to survive the merge.
    setup(
      [entityType("media.medias", "medias"), entityType("media.file", "medias")],
      {
        "media.medias": { items: [definition("caption", false)] },
        "media.file": { items: [definition("Caption", true)] },
      }
    );

    const { result } = renderHook(() => useRestrictableCustomFieldKeys("medias"), { wrapper });

    await waitFor(() => expect(result.current.keys).toHaveLength(1));
    expect(result.current.keys[0].isRequired).toBe(true);
  });

  it("matches the resource case-insensitively", async () => {
    setup([entityType("party.person", "Party-People")], {
      "party.person": { items: [definition("salary")] },
    });

    const { result } = renderHook(() => useRestrictableCustomFieldKeys("party-people"), { wrapper });

    await waitFor(() => expect(result.current.keys).toHaveLength(1));
  });

  it("fires nothing and reports unavailable when the caller cannot read custom fields", async () => {
    const { getEntityTypes, getAll } = setup([entityType("party.person", "party-people")], {
      "party.person": { items: [definition("salary")] },
    });

    const { result } = renderHook(
      () => useRestrictableCustomFieldKeys("party-people", { enabled: false }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    // A role admin holding roles.* without custom-fields.view is an ordinary
    // configuration and must degrade to plain free text, never to a 403 per open.
    expect(getEntityTypes).not.toHaveBeenCalled();
    expect(getAll).not.toHaveBeenCalled();
    expect(result.current.keys).toEqual([]);
    expect(result.current.isAvailable).toBe(false);
  });

  it("reports unavailable when the backend does not send permissionResource yet", async () => {
    // The field was added in slice 7, and both the server response and this client
    // cache are held for an hour — so a warm session keeps serving the resource-less
    // shape well after it ships. The fallback has to be real, not theoretical.
    setup([entityType("party.person", undefined)], {
      "party.person": { items: [definition("salary")] },
    });

    const { result } = renderHook(() => useRestrictableCustomFieldKeys("party-people"), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.keys).toEqual([]);
    expect(result.current.isAvailable).toBe(false);
  });

  it("reports unavailable for a resource no entity type carries", async () => {
    setup([entityType("party.person", "party-people")], {
      "party.person": { items: [definition("salary")] },
    });

    const { result } = renderHook(() => useRestrictableCustomFieldKeys("roles"), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAvailable).toBe(false);
  });

  it("surfaces truncation instead of silently offering a partial list", async () => {
    // A picker that quietly omits a field teaches an admin the field cannot be
    // restricted. The endpoint caps pageSize at 100 server-side.
    setup([entityType("party.person", "party-people")], {
      "party.person": { items: [definition("salary")], totalCount: 250 },
    });

    const { result } = renderHook(() => useRestrictableCustomFieldKeys("party-people"), { wrapper });

    await waitFor(() => expect(result.current.isTruncated).toBe(true));
  });

  it("requests definitions through the admin list endpoint, scoped by entity type", async () => {
    // NOT the values route: that one self-censors, stripping the CALLER's own
    // restricted fields (slice 3's filter), so a restricted admin would find the field
    // simply missing with no explanation and could never restrict it for anyone else.
    const { getAll } = setup([entityType("party.person", "party-people")], {
      "party.person": { items: [definition("salary")] },
    });

    const { result } = renderHook(() => useRestrictableCustomFieldKeys("party-people"), { wrapper });

    await waitFor(() => expect(result.current.keys).toHaveLength(1));
    expect(getAll).toHaveBeenCalledWith(
      expect.objectContaining({ entityTypeKey: "party.person", pageSize: 100 })
    );
  });
});

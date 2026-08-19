/**
 * EntityTypeCatalogView -- Wave 5 row 5.5
 *
 * Every layer below the HTTP client is REAL: wire JSON -> CustomFieldService
 * -> CustomFieldMapper -> CustomFieldRepository ->
 * useEntityTypeCatalogViewModel -> the real entityScreenManifest ->
 * EntityTypeCatalogView. Only the api client, DI and i18n are stubbed, so
 * these assertions are about the actual comparison the page performs, not
 * about a hand-fed row array.
 *
 * The three agreement cases are each driven from a DIFFERENT real manifest
 * key, and the fixtures deliberately flip the backend flag against what the
 * manifest says -- so a change that made the Status column constant, or that
 * dropped the manifest lookup and echoed the backend flag into both columns,
 * fails here rather than sailing through.
 *
 * Accessible names are asserted with getByRole(..., { name }) throughout;
 * getByLabelText is never used (a <Label htmlFor> is inert against this
 * codebase's div-role-combobox triggers, and the convention is applied
 * uniformly).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { CustomFieldService } from "../../data/services/CustomFieldService";
import { CustomFieldRepository } from "../../data/repositories/CustomFieldRepository";
import type { IApiService } from "@core/interfaces/api.interface";
import { getCustomFieldsContainer } from "../../../../di";
import { ENTITY_TYPES_WITH_FRONTEND_SCREEN } from "../entityScreenManifest";

vi.mock("../../../../di", () => ({ getCustomFieldsContainer: vi.fn() }));
vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    language: "en",
    direction: "ltr",
    setLanguage: () => {},
    registerBothLanguages: () => {},
    markModuleLoaded: () => {},
    isModuleLoaded: () => true,
  }),
}));

import { EntityTypeCatalogView } from "./EntityTypeCatalogView";

/**
 * Two keys the manifest really carries, and one it really does not. Read off
 * the manifest at module load rather than typed in, so if the manifest ever
 * stops carrying them this file fails on its own premise instead of quietly
 * testing the wrong case.
 */
const IN_MANIFEST_A = "party.person";
const IN_MANIFEST_B = "identity.theme";
const NOT_IN_MANIFEST = "media.medias";

/** A registry response row as `GET /custom-fields/entity-types` returns it. */
function entityTypeJson(key: string, hasFrontendScreen: boolean | undefined) {
  return {
    key,
    owningModule: "TestModule",
    displayNameEn: `Display ${key}`,
    displayNameAr: `عرض ${key}`,
    ...(hasFrontendScreen === undefined ? {} : { hasFrontendScreen }),
  };
}

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

/** Installs a repository whose entity-types call resolves to `rows`. */
function mountWith(rows: ReturnType<typeof entityTypeJson>[]) {
  const apiGet = vi.fn(async (url: string) => {
    if (url.includes("/entity-types")) return rows;
    throw new Error(`unexpected GET ${url}`);
  });
  vi.mocked(getCustomFieldsContainer).mockReturnValue({
    customFieldRepository: new CustomFieldRepository(
      new CustomFieldService({ get: apiGet } as unknown as IApiService)
    ),
  } as never);
  return render(<EntityTypeCatalogView />, { wrapper });
}

/** The `<tr>` whose Key cell holds `key`. */
async function rowFor(key: string): Promise<HTMLElement> {
  const cell = await screen.findByRole("cell", { name: key });
  const row = cell.closest("tr");
  expect(row).not.toBeNull();
  return row as HTMLElement;
}

const cellsOf = (row: HTMLElement) => [...row.querySelectorAll("td")].map((c) => c.textContent);

describe("EntityTypeCatalogView premise", () => {
  it("the three fixture keys really are / are not in the live manifest", () => {
    // Without this the three agreement cases below could be asserting
    // whatever the manifest happens to say today.
    expect(ENTITY_TYPES_WITH_FRONTEND_SCREEN).toContain(IN_MANIFEST_A);
    expect(ENTITY_TYPES_WITH_FRONTEND_SCREEN).toContain(IN_MANIFEST_B);
    expect(ENTITY_TYPES_WITH_FRONTEND_SCREEN).not.toContain(NOT_IN_MANIFEST);
  });
});

describe("EntityTypeCatalogView", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders one row per entity type the endpoint returned, plus the header row", async () => {
    mountWith([
      entityTypeJson(IN_MANIFEST_A, true),
      entityTypeJson(IN_MANIFEST_B, true),
      entityTypeJson(NOT_IN_MANIFEST, false),
    ]);
    await screen.findByRole("table");
    expect(screen.getAllByRole("row")).toHaveLength(4);
  });

  it("exposes all 6 column headers via getByRole, not getByLabelText", async () => {
    mountWith([entityTypeJson(IN_MANIFEST_A, true)]);
    await screen.findByRole("table");
    for (const column of [
      "entityType",
      "key",
      "owningModule",
      "backendScreen",
      "frontendScreen",
      "status",
    ]) {
      expect(
        screen.getByRole("columnheader", {
          name: `customField.entityTypeCatalog.columns.${column}`,
        })
      ).toBeInTheDocument();
    }
  });

  it("renders the backend's own display name and owning module for each row", async () => {
    mountWith([entityTypeJson(IN_MANIFEST_A, true)]);
    const row = await rowFor(IN_MANIFEST_A);
    expect(within(row).getByRole("cell", { name: `Display ${IN_MANIFEST_A}` })).toBeInTheDocument();
    expect(within(row).getByRole("cell", { name: "TestModule" })).toBeInTheDocument();
  });

  // ── The three agreement states ──────────────────────────────────────
  it("marks a row IN SYNC when the backend's claim and the manifest agree", async () => {
    mountWith([entityTypeJson(IN_MANIFEST_A, true), entityTypeJson(NOT_IN_MANIFEST, false)]);

    // true / in-manifest
    expect(cellsOf(await rowFor(IN_MANIFEST_A)).slice(3)).toEqual([
      "common.yes",
      "common.yes",
      "customField.entityTypeCatalog.agreement.aligned",
    ]);
    // false / not-in-manifest — agreement is not the same as "has a screen"
    expect(cellsOf(await rowFor(NOT_IN_MANIFEST)).slice(3)).toEqual([
      "common.no",
      "common.no",
      "customField.entityTypeCatalog.agreement.aligned",
    ]);
  });

  it("flags BACKEND EXPECTS A SCREEN when the backend claims one the manifest does not carry", async () => {
    mountWith([entityTypeJson(NOT_IN_MANIFEST, true)]);
    expect(cellsOf(await rowFor(NOT_IN_MANIFEST)).slice(3)).toEqual([
      "common.yes",
      "common.no",
      "customField.entityTypeCatalog.agreement.backendClaimsScreenOnly",
    ]);
  });

  it("flags SCREEN EXISTS, BACKEND UNAWARE when the manifest carries a key the backend says has none", async () => {
    mountWith([entityTypeJson(IN_MANIFEST_B, false)]);
    expect(cellsOf(await rowFor(IN_MANIFEST_B)).slice(3)).toEqual([
      "common.no",
      "common.yes",
      "customField.entityTypeCatalog.agreement.frontendScreenOnly",
    ]);
  });

  it("treats an older backend that omits hasFrontendScreen as claiming a screen, not as claiming none", async () => {
    // The documented `?? true` fallback. Getting this wrong would paint every
    // row of an older deployment as drift.
    mountWith([entityTypeJson(IN_MANIFEST_A, undefined)]);
    expect(cellsOf(await rowFor(IN_MANIFEST_A)).slice(3)).toEqual([
      "common.yes",
      "common.yes",
      "customField.entityTypeCatalog.agreement.aligned",
    ]);
  });

  // ── Header figures ──────────────────────────────────────────────────
  it("counts total / has-a-screen / out-of-sync in the header, from the same rows", async () => {
    mountWith([
      entityTypeJson(IN_MANIFEST_A, true), // aligned, backend says screen
      entityTypeJson(IN_MANIFEST_B, false), // drift: frontend only
      entityTypeJson(NOT_IN_MANIFEST, true), // drift: backend only
    ]);
    await screen.findByRole("table");

    const figureFor = (labelKey: string) => {
      const label = screen.getByText(`customField.entityTypeCatalog.stats.${labelKey}`);
      return label.parentElement?.textContent ?? "";
    };
    expect(figureFor("total")).toContain("3");
    expect(figureFor("withScreen")).toContain("2");
    expect(figureFor("drift")).toContain("2");
  });

  // ── Failure and empty states ────────────────────────────────────────
  it("shows the module's own load-failure message with a retry, and no table", async () => {
    const apiGet = vi.fn(async () => {
      throw new Error("boom");
    });
    vi.mocked(getCustomFieldsContainer).mockReturnValue({
      customFieldRepository: new CustomFieldRepository(
        new CustomFieldService({ get: apiGet } as unknown as IApiService)
      ),
    } as never);
    render(<EntityTypeCatalogView />, { wrapper });

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "customField.entityTypeCatalog.loadFailed"
      )
    );
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("shows the empty state, not an empty table, when the registry returns nothing", async () => {
    mountWith([]);
    await waitFor(() =>
      expect(screen.getByText("customField.entityTypeCatalog.empty")).toBeInTheDocument()
    );
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  // ── Back link ───────────────────────────────────────────────────────
  it("offers a back link to /custom-fields", async () => {
    mountWith([entityTypeJson(IN_MANIFEST_A, true)]);
    await screen.findByRole("table");
    expect(screen.getByRole("link", { name: /common\.back/ })).toHaveAttribute(
      "href",
      "/custom-fields"
    );
  });
});

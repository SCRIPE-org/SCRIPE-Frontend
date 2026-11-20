import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { EditionMapper } from "../../data/mappers/EditionMapper";
import type { EditionModel } from "../../data/models/EditionModels";
import type { Edition } from "../../domain/entities/Edition";

const mockPush = vi.hoisted(() => vi.fn());
const mockDetailVm = vi.hoisted(() => ({
  edition: null as Edition | null,
  isLoading: false,
  error: null as Error | null,
  moduleGroups: [],
  getEffectiveValue: vi.fn(),
  getEffectiveLabel: vi.fn(),
  getEffectiveHighlight: vi.fn(),
  setLocalValue: vi.fn(),
  setLocalLabel: vi.fn(),
  setLocalHighlight: vi.fn(),
  removeFeature: vi.fn(),
  isRemovingFeature: false,
  overflowPolicy: "Strict",
  setOverflowPolicy: vi.fn(),
  overflowPolicyChanged: false,
  collapsedModules: new Set<string>(),
  toggleModule: vi.fn(),
  expandAll: vi.fn(),
  collapseAll: vi.fn(),
  hasUnsavedChanges: false,
  modifiedCount: 0,
  isCreatingVersion: false,
  isDirectApplying: false,
  createVersionWithChanges: vi.fn(),
  directApplyChanges: vi.fn(),
  discardChanges: vi.fn(),
}));
const mockEditionsVm = vi.hoisted(() => ({
  items: [] as Edition[],
  deleteItem: vi.fn(),
  navigateToFeatures: vi.fn(),
  allEditionsError: null,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    back: vi.fn(),
  }),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    direction: "ltr" as const,
    language: "en" as const,
    isRtl: false,
    setLanguage: vi.fn(),
  }),
}));

vi.mock("@core/hooks/use-module-locales", () => ({
  useModuleLocales: vi.fn(),
}));

vi.mock("@core/crud/components/generic-crud-view", () => ({
  GenericCrudView: ({ viewModel, config }: { viewModel: any; config: any }) => {
    const actionsFn = config.getActions;
    const tFn = (key: string) => key;
    return (
      <div>
        {(viewModel.items as Edition[]).map((item) => {
          const actions = actionsFn ? actionsFn(viewModel, tFn, vi.fn()) : [];
          return (
            <div key={item.id} data-testid={`edition-row-${item.id}`}>
              {config.columns?.map((col: any) => (
                <span key={col.key}>
                  {col.render ? col.render((item as any)[col.key], item) : (item as any)[col.key]}
                </span>
              ))}
              {actions
                .filter((a: any) => (a.show ? a.show(item) : true))
                .map((a: any) => (
                  <button key={a.label} onClick={() => a.onClick(item)}>
                    {`${item.id}:${a.label}`}
                  </button>
                ))}
            </div>
          );
        })}
      </div>
    );
  },
}));

vi.mock("../viewmodels/useEditionsViewModel", () => ({
  useEditionsViewModel: () => mockEditionsVm,
}));

vi.mock("../viewmodels/useEditionDetailViewModel", () => ({
  useEditionDetailViewModel: () => mockDetailVm,
}));

vi.mock("../components/FeaturesTab", () => ({
  FeaturesTab: () => <div data-testid="features-tab" />,
}));
vi.mock("../components/VersionsTab", () => ({
  VersionsTab: () => <div data-testid="versions-tab" />,
}));
vi.mock("../components/PricingTab", () => ({
  PricingTab: () => <div data-testid="pricing-tab" />,
}));
vi.mock("../components/PromotionsTab", () => ({
  PromotionsTab: () => <div data-testid="promotions-tab" />,
}));
vi.mock("../components/ChangeActionBar", () => ({
  ChangeActionBar: () => <div data-testid="change-action-bar" />,
}));

import { EditionsView } from "../views/EditionsView";
import { EditionDetailView } from "../views/EditionDetailView";

function makeEditionModel(overrides: Partial<EditionModel> = {}): EditionModel {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    name: "pro-club",
    displayNameEn: "Pro Club",
    displayNameAr: "نادي احترافي",
    description: "Commercial club tier",
    isSystem: false,
    isRetired: false,
    tierLevel: 2,
    scope: "Commercial",
    allowMonthly: true,
    allowYearly: true,
    allowLifetime: true,
    allowTrial: true,
    trialDurationDays: 14,
    trialIsFree: true,
    trialDiscountPercent: 100,
    gracePeriodDays: 0,
    isFree: false,
    features: [],
    prices: [],
    createdAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("Editions scope guards & localized detail view", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("EditionMapper maps scope and sets Edition.isInternal accurately", () => {
    const internalByScope = EditionMapper.toEntity(
      makeEditionModel({
        id: "22222222-2222-4222-8222-222222222222",
        name: "internal-custom",
        scope: "Internal",
      })
    );
    expect((internalByScope as any).scope).toBe("Internal");
    expect((internalByScope as any).isInternal).toBe(true);

    const internalByName = EditionMapper.toEntity(
      makeEditionModel({
        id: "33333333-3333-4333-8333-333333333333",
        name: "scripe-internal",
        scope: undefined,
      })
    );
    expect((internalByName as any).isInternal).toBe(true);

    const commercial = EditionMapper.toEntity(makeEditionModel({ scope: "Commercial" }));
    expect((commercial as any).scope).toBe("Commercial");
    expect((commercial as any).isInternal).toBe(false);
  });

  it("EditionsView hides Edit and Delete actions for Internal editions while preserving them for Commercial editions", () => {
    const internalEdition = EditionMapper.toEntity(
      makeEditionModel({
        id: "22222222-2222-4222-8222-222222222222",
        name: "scripe-internal",
        displayNameEn: "SCRIPE Internal",
        isSystem: false,
        scope: "Internal",
      })
    );
    const commercialEdition = EditionMapper.toEntity(
      makeEditionModel({
        id: "11111111-1111-4111-8111-111111111111",
        name: "pro-club",
        isSystem: false,
        scope: "Commercial",
      })
    );

    mockEditionsVm.items = [internalEdition, commercialEdition];
    render(<EditionsView />);

    expect(
      screen.queryByRole("button", { name: `${internalEdition.id}:common.edit` })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: `${internalEdition.id}:common.delete` })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: `${internalEdition.id}:common.view` })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: `${commercialEdition.id}:common.edit` })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: `${commercialEdition.id}:common.delete` })
    ).toBeInTheDocument();
  });

  it("EditionDetailView uses localized editSettings key for Commercial editions and hides commercial tabs/actions for Internal editions", () => {
    const commercial = EditionMapper.toEntity(makeEditionModel({ scope: "Commercial", isFree: false }));
    mockDetailVm.edition = commercial;
    mockDetailVm.hasUnsavedChanges = true;

    const { rerender } = render(<EditionDetailView editionId={commercial.id} />);

    expect(screen.queryByText("Edit Settings")).not.toBeInTheDocument();
    expect(screen.getByText("entitlements.editions.wizard.editSettings")).toBeInTheDocument();
    expect(screen.getByText("entitlements.pricing.title")).toBeInTheDocument();
    expect(screen.getByText("entitlements.promotions.title")).toBeInTheDocument();
    expect(screen.getByTestId("change-action-bar")).toBeInTheDocument();

    const internal = EditionMapper.toEntity(
      makeEditionModel({
        id: "22222222-2222-4222-8222-222222222222",
        name: "scripe-internal",
        scope: "Internal",
        isFree: false,
      })
    );
    mockDetailVm.edition = internal;

    rerender(<EditionDetailView editionId={internal.id} />);
    expect(screen.queryByText("entitlements.editions.wizard.editSettings")).not.toBeInTheDocument();
    expect(screen.queryByText("entitlements.pricing.title")).not.toBeInTheDocument();
    expect(screen.queryByText("entitlements.promotions.title")).not.toBeInTheDocument();
    expect(screen.queryByTestId("change-action-bar")).not.toBeInTheDocument();
    expect(screen.getByText("entitlements.editions.internalBadge")).toBeInTheDocument();
  });
});

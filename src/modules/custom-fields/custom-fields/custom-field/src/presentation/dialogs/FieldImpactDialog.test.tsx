import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { FieldImpactDialog } from "./FieldImpactDialog";
import type { FieldUsage } from "../../domain/entities/FieldInsight";

/**
 * Wave 6 row 6.3's impact dialog.
 *
 * Two of these tests exist because the underlying mistakes are silent and plausible-looking, and both
 * were called out in the endpoint contract before the UI existed:
 *
 * 1. **Counts labelled from the wrong scope.** For a platform-owned field the caller-scoped and
 *    platform-wide totals differ by orders of magnitude, and nothing about the number itself says
 *    which arrived. Labelling it wrong tells an admin their organisation holds 40,000 values when 300
 *    are theirs.
 * 2. **The destructive warning re-derived from the counts** instead of read off
 *    `wouldDestroyDataOnDelete`. That flag is true in cases the visible counts do not show — a
 *    definition whose rows live only in the legacy table reports `totalValueCount: 0` and would still
 *    destroy data.
 */

vi.mock("@core/providers/i18n-provider", () => ({
  // Echoes the key plus any params, so assertions can pin WHICH key rendered without depending on
  // copy. That matters here: the two scope sentences are the thing under test, and asserting on
  // English prose would pass if the two were swapped in the locale file.
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) =>
      params ? `${key}:${JSON.stringify(params)}` : key,
    language: "en",
  }),
}));

const BASE: FieldUsage = {
  totalValueCount: 300,
  byEntityType: [{ entityTypeKey: "staff", count: 300 }],
  legacyValueCount: 0,
  optionCount: 2,
  rulesHidingThisField: 0,
  fieldsDependingOnThisField: 0,
  isPlatformOwned: false,
  isPlatformWideScope: false,
  affectedTenantCount: null,
  wouldDestroyDataOnDelete: true,
};

function renderDialog(usage: Partial<FieldUsage> | null, extra: Record<string, unknown> = {}) {
  return render(
    <FieldImpactDialog
      open
      onOpenChange={vi.fn()}
      fieldLabel="Jersey size"
      usage={usage === null ? null : { ...BASE, ...usage }}
      isLoading={false}
      isError={false}
      {...extra}
    />
  );
}

describe("scope labelling", () => {
  it("says YOUR organisation when the counts are caller-scoped", () => {
    renderDialog({ isPlatformWideScope: false });

    expect(screen.getByText("customField.impact.scopeYourOrganisation")).toBeInTheDocument();
    expect(
      screen.queryByText("customField.impact.scopeAllOrganisations")
    ).not.toBeInTheDocument();
  });

  it("says ALL organisations when the counts are platform-wide", () => {
    renderDialog({ isPlatformWideScope: true, affectedTenantCount: 12 });

    expect(screen.getByText("customField.impact.scopeAllOrganisations")).toBeInTheDocument();
    expect(
      screen.queryByText("customField.impact.scopeYourOrganisation")
    ).not.toBeInTheDocument();
  });

  it("does not label a platform-OWNED field as platform-WIDE", () => {
    // The trap. A tenant admin asking about an inherited field gets `isPlatformOwned: true` with
    // `isPlatformWideScope: false` — their own count, of a field they do not own. Reading ownership
    // as scope would tell them 300 values is the platform total.
    renderDialog({ isPlatformOwned: true, isPlatformWideScope: false });

    expect(screen.getByText("customField.impact.scopeYourOrganisation")).toBeInTheDocument();
  });

  it("hides the affected-organisation count when the scope is caller-scoped", () => {
    // A caller-scoped probe never measured it, so the server sends null. Rendering a number here
    // would be reporting a measurement nobody took.
    renderDialog({ isPlatformWideScope: false, affectedTenantCount: null });

    expect(screen.queryByText(/affectedTenants/)).not.toBeInTheDocument();
  });

  it("hides it even if a number arrives on a caller-scoped response", () => {
    // Defence in depth, and the version of the test above that actually exercises the guard: with
    // affectedTenantCount null, a null-check alone passes and the scope check is never tested.
    // A number alongside "your organisation only" would be self-contradictory -- one sentence saying
    // the counts are yours, one line saying twelve organisations are affected.
    renderDialog({ isPlatformWideScope: false, affectedTenantCount: 12 });

    expect(screen.queryByText(/affectedTenants/)).not.toBeInTheDocument();
  });
});

describe("the destructive warning", () => {
  it("is shown when wouldDestroyDataOnDelete is true", () => {
    renderDialog({ wouldDestroyDataOnDelete: true });

    expect(screen.getByTestId("impact-destructive-warning")).toBeInTheDocument();
  });

  it("is shown even when every visible count is zero", () => {
    // THE CASE THAT PROVES THE FLAG IS READ, NOT DERIVED. A definition whose rows live only in the
    // legacy table reports totalValueCount 0 — deriving the warning from the counts would hide it,
    // and the server would then refuse a delete the UI had presented as free.
    renderDialog({
      totalValueCount: 0,
      byEntityType: [],
      legacyValueCount: 0,
      optionCount: 0,
      wouldDestroyDataOnDelete: true,
    });

    expect(screen.getByTestId("impact-destructive-warning")).toBeInTheDocument();
  });

  it("is hidden when the flag is false, even with values present", () => {
    // The inverse, and it must also hold: the flag is authoritative in both directions.
    renderDialog({ totalValueCount: 4102, wouldDestroyDataOnDelete: false });

    expect(screen.queryByTestId("impact-destructive-warning")).not.toBeInTheDocument();
  });
});

describe("confirm mode", () => {
  it("shows no destructive button when opened informationally", () => {
    // Opened from the row action there is no onConfirmDelete. Attaching a delete button to an
    // informational view is how someone deletes a field they only wanted to inspect.
    renderDialog({});

    expect(screen.queryByText("customField.impact.deleteAnyway")).not.toBeInTheDocument();
    expect(screen.queryByText("customField.impact.deleteConfirm")).not.toBeInTheDocument();
    // getAllBy, not getBy: DialogContent renders its own sr-only close control with the same
    // label, so there are legitimately two. The assertion is that a dismiss affordance exists and
    // no destructive one does.
    expect(screen.getAllByText("common.close").length).toBeGreaterThan(0);
  });

  it("offers 'delete anyway' when the delete would destroy data", () => {
    const onConfirmDelete = vi.fn();
    renderDialog({ wouldDestroyDataOnDelete: true }, { onConfirmDelete });

    expect(screen.getByText("customField.impact.deleteAnyway")).toBeInTheDocument();
  });

  it("offers a plain delete when nothing would be destroyed", () => {
    const onConfirmDelete = vi.fn();
    renderDialog({ wouldDestroyDataOnDelete: false }, { onConfirmDelete });

    expect(screen.getByText("customField.impact.deleteConfirm")).toBeInTheDocument();
  });

  it("blocks confirmation while the counts are still loading", () => {
    // The whole point is that the decision is made against real numbers. Confirming over a skeleton
    // would defeat the dialog.
    const onConfirmDelete = vi.fn();
    render(
      <FieldImpactDialog
        open
        onOpenChange={vi.fn()}
        fieldLabel="Jersey size"
        usage={null}
        isLoading
        isError={false}
        onConfirmDelete={onConfirmDelete}
      />
    );

    expect(screen.getByText("customField.impact.deleteConfirm").closest("button")).toBeDisabled();
  });

  it("blocks confirmation when the counts failed to load", () => {
    // Better to retry than to force a destructive action blind.
    const onConfirmDelete = vi.fn();
    render(
      <FieldImpactDialog
        open
        onOpenChange={vi.fn()}
        fieldLabel="Jersey size"
        usage={null}
        isLoading={false}
        isError
        onConfirmDelete={onConfirmDelete}
      />
    );

    expect(screen.getByText("customField.impact.deleteConfirm").closest("button")).toBeDisabled();
  });
});

describe("count rendering", () => {
  it("omits the legacy row entirely when it is zero", () => {
    // A permanent "0 legacy values" line trains people to ignore the row that is least expected.
    renderDialog({ legacyValueCount: 0 });

    expect(screen.queryByText(/legacyValues/)).not.toBeInTheDocument();
  });

  it("shows the legacy row when it is non-zero", () => {
    renderDialog({ legacyValueCount: 7 });

    expect(screen.getByText(/legacyValues.*7/)).toBeInTheDocument();
  });

  it("spells out the dependent-field consequence rather than showing a bare count", () => {
    renderDialog({ fieldsDependingOnThisField: 2 });

    expect(screen.getByText(/dependentFields.*2/)).toBeInTheDocument();
  });

  it("renders the per-record-type breakdown", () => {
    renderDialog({
      byEntityType: [
        { entityTypeKey: "staff", count: 100 },
        { entityTypeKey: "player", count: 30 },
      ],
    });

    expect(screen.getByText("staff")).toBeInTheDocument();
    expect(screen.getByText("player")).toBeInTheDocument();
  });
});

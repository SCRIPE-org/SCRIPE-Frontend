/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { OptionSetBindingDialog } from "./OptionSetBindingDialog";
import { OptionSet } from "../../../../option-set/src/domain/entities/OptionSet";

/**
 * The dialog that wires the picker to attach/detach -- P-4's missing consumer.
 *
 * WHAT EACH GROUP OF CASES PROTECTS
 * ------------------------------------
 *  - STATE-AWARE, NOT THREE BLIND BUTTONS: `boundSet` (from `FieldVersionSummary.
 *    boundOptionSetVersionId`) drives which action shows. Unbound gets "Attach"; bound gets "Change
 *    option set" and a "Detach" option. There is never a moment where both "Attach" and "Switch" show
 *    at once, because the caller no longer has to guess which applies -- see
 *    `useOptionSetBindingViewModel.attach` for the bind-vs-rebind choice this dialog no longer makes.
 *  - THE PERMISSION GATE disables the action when exactly `.bind` is withheld -- the picker itself
 *    stays usable (an admin who can only VIEW option sets can still see what exists).
 *  - THE CURRENT-STATE BANNER says what's bound today, in real language, not a guess -- this is the
 *    exact fact the pre-fix dialog could never answer.
 */

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) =>
      params ? `${key}:${JSON.stringify(params)}` : key,
    language: "en",
  }),
}));
vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({
    switchStyle: "default",
    fontSize: "default",
    inputStyle: "default",
    badgeStyle: "default",
  }),
}));

if (typeof (globalThis as any).ResizeObserver === "undefined") {
  (globalThis as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
if (typeof Element.prototype.scrollIntoView !== "function") {
  Element.prototype.scrollIntoView = () => {};
}

const SIZES = new OptionSet({
  id: "set-1",
  stableKey: "sizes",
  labelEn: "Sizes",
  labelAr: null,
  description: null,
  isSystemManaged: false,
  isPlatformOwned: false,
  versionCount: 1,
  publishedVersionId: "osv-1",
  publishedVersionNumber: 1,
});

const COLORS = new OptionSet({
  id: "set-2",
  stableKey: "colors",
  labelEn: "Colors",
  labelAr: null,
  description: null,
  isSystemManaged: false,
  isPlatformOwned: false,
  versionCount: 1,
  publishedVersionId: "osv-2",
  publishedVersionNumber: 1,
});

function renderDialog(overrides: Partial<React.ComponentProps<typeof OptionSetBindingDialog>> = {}) {
  const onAttach = vi.fn(async () => true);
  const onDetach = vi.fn(async () => true);
  const onOpenChange = vi.fn();

  render(
    <OptionSetBindingDialog
      open
      onOpenChange={onOpenChange}
      fieldLabel="Jersey size"
      canBind
      bindableSets={[SIZES, COLORS]}
      isSetsLoading={false}
      isSetsError={false}
      onRetrySets={vi.fn()}
      isVersionLoading={false}
      isVersionError={false}
      onRetryVersion={vi.fn()}
      hasActiveVersion
      boundSet={null}
      onAttach={onAttach}
      onDetach={onDetach}
      isAttaching={false}
      isDetaching={false}
      {...overrides}
    />
  );

  return { onAttach, onDetach, onOpenChange };
}

function pickSizes() {
  fireEvent.click(screen.getByRole("combobox"));
  fireEvent.click(screen.getByRole("option", { name: /Sizes/ }));
}

function pickColors() {
  fireEvent.click(screen.getByRole("combobox"));
  fireEvent.click(screen.getByRole("option", { name: /Colors/ }));
}

describe("current binding state", () => {
  it("says the field is unbound when boundSet is null", () => {
    renderDialog({ boundSet: null });

    expect(
      screen.getByText("customField.optionSetBinding.currentlyUnbound")
    ).toBeInTheDocument();
  });

  it("names the bound set when boundSet is provided", () => {
    renderDialog({ boundSet: SIZES });

    expect(
      screen.getByText(
        'customField.optionSetBinding.currentlyBound:{"set":"Sizes"}'
      )
    ).toBeInTheDocument();
  });
});

describe("the action offered depends on binding state, never both at once", () => {
  it("offers Attach and no Detach when unbound", () => {
    renderDialog({ boundSet: null });

    expect(screen.getByText("customField.optionSetBinding.attach.description")).toBeInTheDocument();
    expect(
      screen.queryByText("customField.optionSetBinding.switch.description")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "customField.optionSetBinding.detach.action" })
    ).not.toBeInTheDocument();
  });

  it("offers Change option set and Detach when already bound", () => {
    renderDialog({ boundSet: SIZES });

    expect(screen.getByText("customField.optionSetBinding.switch.description")).toBeInTheDocument();
    expect(
      screen.queryByText("customField.optionSetBinding.attach.description")
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "customField.optionSetBinding.detach.action" })
    ).toBeInTheDocument();
  });
});

describe("the permission gate", () => {
  it("disables the action and detach when canBind is false, EVEN WITH a set already chosen", () => {
    renderDialog({ canBind: false, boundSet: SIZES });
    // The picker itself is not part of the gate -- `.view` alone is enough to browse what exists --
    // so a set can still be picked here. Doing so isolates the assertion below from the SEPARATE,
    // legitimate "no set chosen yet" reason the action also disables for.
    pickColors();

    expect(screen.getByText("customField.optionSetBinding.permissionNote")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "customField.optionSetBinding.switch.action" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "customField.optionSetBinding.detach.action" })).toBeDisabled();
  });

  it("keeps the picker itself open to browsing even when canBind is false", () => {
    renderDialog({ canBind: false });

    fireEvent.click(screen.getByRole("combobox"));

    expect(screen.getByRole("option", { name: /Sizes/ })).toBeInTheDocument();
  });
});

describe("attach requires a chosen DIFFERENT set", () => {
  it("keeps attach disabled until a set is picked", () => {
    renderDialog({ boundSet: null });

    expect(screen.getByRole("button", { name: "customField.optionSetBinding.attach.action" })).toBeDisabled();
  });

  it("attach sends the chosen set's PUBLISHED version id, not the field's own id", async () => {
    const { onAttach } = renderDialog({ boundSet: null });
    pickSizes();

    fireEvent.click(screen.getByRole("button", { name: "customField.optionSetBinding.attach.action" }));

    expect(onAttach).toHaveBeenCalledWith("osv-1");
  });

  it("disables the action when the picked set is already the bound one -- nothing to write", () => {
    renderDialog({ boundSet: SIZES });
    // The dialog pre-selects the current binding on open, so no extra pick is needed here.

    expect(screen.getByRole("button", { name: "customField.optionSetBinding.switch.action" })).toBeDisabled();
  });

  it("enables the action once a genuinely different set is picked", () => {
    renderDialog({ boundSet: SIZES });
    pickColors();

    expect(screen.getByRole("button", { name: "customField.optionSetBinding.switch.action" })).toBeEnabled();
  });

  it("detach calls its own handler with no set argument", async () => {
    const { onDetach } = renderDialog({ boundSet: SIZES });

    fireEvent.click(screen.getByRole("button", { name: "customField.optionSetBinding.detach.action" }));

    expect(onDetach).toHaveBeenCalledWith();
  });
});

describe("the field-version states", () => {
  it("shows a real empty state, not the picker, when the field has no active version", () => {
    renderDialog({ hasActiveVersion: false });

    expect(screen.getByText("customField.optionSetBinding.noActiveVersion")).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("shows a retryable error, distinct from the empty state, when the version fetch fails", () => {
    const onRetryVersion = vi.fn();
    renderDialog({ isVersionError: true, onRetryVersion });

    expect(screen.getByText("customField.optionSetBinding.versionLoadFailed")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "common.retry" }));
    expect(onRetryVersion).toHaveBeenCalledTimes(1);
  });
});

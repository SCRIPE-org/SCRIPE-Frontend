import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { OptionSetBindingDialog } from "./OptionSetBindingDialog";
import { OptionSet } from "../../../../option-set/src/domain/entities/OptionSet";

/**
 * The dialog that wires the picker to bind/rebind/unbind -- P-4's missing consumer.
 *
 * WHAT EACH GROUP OF CASES PROTECTS
 * ------------------------------------
 *  - EACH ACTION RENDERS ITS OWN CONFIRMATION COPY KEY, and only that one -- not a generic shared
 *    "are you sure?" that would let attach's and switch's very different consequences (kept-unless-
 *    colliding vs. deactivated-not-deleted) collapse into the same sentence. What the copy actually
 *    SAYS, word for word against the backend handlers' own doc comments, is pinned separately in
 *    `custom-field.optionSetBinding.locale.test.ts` -- the same split `FieldImpactDialog.test.tsx`
 *    (key-wiring, with `t` mocked to echo the key) and `customField.wave34.locale.test.ts` (real
 *    copy content) already draw for this module.
 *  - THE PERMISSION GATE disables all three actions when exactly `.bind` is withheld -- the picker
 *    itself stays usable (an admin who can only VIEW option sets can still see what exists), which is
 *    what tells this case apart from a blanket "everything disabled" that would pass for the wrong
 *    reason.
 *  - Attach/Switch require a set to be chosen first; Detach does not, because it takes no set.
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

function renderDialog(overrides: Partial<React.ComponentProps<typeof OptionSetBindingDialog>> = {}) {
  const onAttach = vi.fn(async () => true);
  const onSwitch = vi.fn(async () => true);
  const onDetach = vi.fn(async () => true);
  const onOpenChange = vi.fn();

  render(
    <OptionSetBindingDialog
      open
      onOpenChange={onOpenChange}
      fieldLabel="Jersey size"
      canBind
      bindableSets={[SIZES]}
      isSetsLoading={false}
      isSetsError={false}
      onRetrySets={vi.fn()}
      isVersionLoading={false}
      isVersionError={false}
      onRetryVersion={vi.fn()}
      hasActiveVersion
      onAttach={onAttach}
      onSwitch={onSwitch}
      onDetach={onDetach}
      isAttaching={false}
      isSwitching={false}
      isDetaching={false}
      {...overrides}
    />
  );

  return { onAttach, onSwitch, onDetach, onOpenChange };
}

function pickSizes() {
  fireEvent.click(screen.getByRole("combobox"));
  fireEvent.click(screen.getByRole("option", { name: /Sizes/ }));
}

describe("confirmation copy keys", () => {
  it("renders each action's own description key, not a shared generic one", () => {
    renderDialog();

    expect(screen.getByText("customField.optionSetBinding.attach.description")).toBeInTheDocument();
    expect(screen.getByText("customField.optionSetBinding.switch.description")).toBeInTheDocument();
    expect(screen.getByText("customField.optionSetBinding.detach.description")).toBeInTheDocument();
  });
});

describe("the permission gate", () => {
  it("disables attach, switch and detach when canBind is false, EVEN WITH a set already chosen", () => {
    renderDialog({ canBind: false });
    // The picker itself is not part of the gate -- `.view` alone is enough to browse what exists --
    // so a set can still be picked here. Doing so isolates the assertion below from the SEPARATE,
    // legitimate "no set chosen yet" reason attach/switch also disable for: if this test left no
    // set selected, a buggy implementation that dropped the permission check entirely would still
    // show disabled buttons, for the wrong reason, and pass regardless.
    pickSizes();

    expect(screen.getByText("customField.optionSetBinding.permissionNote")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "customField.optionSetBinding.attach.action" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "customField.optionSetBinding.switch.action" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "customField.optionSetBinding.detach.action" })).toBeDisabled();
  });

  it("keeps the picker itself open to browsing even when canBind is false", () => {
    renderDialog({ canBind: false });

    fireEvent.click(screen.getByRole("combobox"));

    // `.view` alone is enough to see what exists; only the write actions need `.bind`. Proven
    // behaviourally (the panel actually opens and offers the set), not by reading an `aria-disabled`
    // attribute a plain `role="combobox"` div could carry without jest-dom's `toBeDisabled()` ever
    // noticing either way.
    expect(screen.getByRole("option", { name: /Sizes/ })).toBeInTheDocument();
  });

  it("enables all three once canBind is true and a set is chosen", () => {
    renderDialog({ canBind: true });
    pickSizes();

    expect(screen.getByRole("button", { name: "customField.optionSetBinding.attach.action" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "customField.optionSetBinding.switch.action" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "customField.optionSetBinding.detach.action" })).toBeEnabled();
  });
});

describe("attach and switch require a chosen set; detach does not", () => {
  it("keeps attach and switch disabled until a set is picked", () => {
    renderDialog();

    expect(screen.getByRole("button", { name: "customField.optionSetBinding.attach.action" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "customField.optionSetBinding.switch.action" })).toBeDisabled();
    // Detach never needed a picker selection -- it takes no set at all.
    expect(screen.getByRole("button", { name: "customField.optionSetBinding.detach.action" })).toBeEnabled();
  });

  it("attach sends the chosen set's PUBLISHED version id, not the field's own id", async () => {
    const { onAttach } = renderDialog();
    pickSizes();

    fireEvent.click(screen.getByRole("button", { name: "customField.optionSetBinding.attach.action" }));

    expect(onAttach).toHaveBeenCalledWith("osv-1");
  });

  it("switch calls its own handler, never attach's", async () => {
    const { onAttach, onSwitch } = renderDialog();
    pickSizes();

    fireEvent.click(screen.getByRole("button", { name: "customField.optionSetBinding.switch.action" }));

    expect(onSwitch).toHaveBeenCalledWith("osv-1");
    expect(onAttach).not.toHaveBeenCalled();
  });

  it("detach calls its own handler with no set argument", async () => {
    const { onDetach } = renderDialog();

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

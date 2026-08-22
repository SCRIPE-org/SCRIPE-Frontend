/**
 * OptionSetEditorDialog -- the set's metadata form, and the four states it has to get right (P-4)
 *
 * WHY THIS DIALOG NEEDS TESTS OF ITS OWN
 * -------------------------------------
 * `OptionSetListView.a11y.test.tsx` mounts this component, but only ever through the CREATE path, and
 * only to assert that the dialog is labelled. The EDIT arm and the READ-ONLY arm were never rendered
 * by any test in the module. Both carry claims a reader cannot check by looking at the screen:
 *
 *   1. THE SCOPE REPORT IS A CLAIM ABOUT WHO INHERITS THE SET. `OptionSetResponse` carries no
 *      `isGlobal`; `isPlatformOwned` (server-derived from `TenantId == null`) is the only scope signal
 *      that exists. A tenant-scoped set reported as "Global" is not a cosmetic bug -- the admin
 *      concludes every tenant already inherits the list and never creates the per-tenant set they
 *      opened the dialog for. Nothing on screen looks broken. So the assertions below pin the ABSENCE
 *      of `optionSet.badge.global` as hard as they pin the presence of `badge.platformOwned`.
 *
 *   2. THE `pattern` ON THE KEY INPUT IS A HARD GATE, NOT A HINT. It sits on a `required` input inside
 *      `<form onSubmit>`, so the browser refuses submit with a generic "match the requested format"
 *      for any key it excludes -- including keys the server accepts (`StableKey` carries `[Required]`
 *      and `[MaxLength(100)]` and no regex at all). The platform's own seeded sets are keyed
 *      `iso-3166-1-countries`, so the pattern is asserted through `validity.patternMismatch`, against
 *      a real key, in both directions: the hyphenated form must pass AND a malformed key must still
 *      fail, so a future "fix" cannot satisfy the first half by deleting the attribute. One assertion
 *      also compiles the shipped pattern under the `v` flag HTML uses, because an unparseable pattern
 *      is IGNORED rather than reported -- the failure mode there is a gate that quietly stops existing.
 *
 *   3. `effectiveReadOnlyReason` OVERRIDES ITS OWN CALLER. A platform-maintained set is refused on all
 *      five mutating paths for everyone, so the component takes the entity's answer over the prop.
 *      That is the module's stated defence against handing an ISO list an editable form, and if it
 *      stopped working the only symptom would be an edit that collects fine and 403s on save.
 *
 *   4. THE RESEED EFFECT IS KEYED ON IDENTITY ON PURPOSE. `[open, optionSet?.id]` rather than the
 *      entity object, so a background refetch producing an equal-but-new `OptionSet` cannot wipe out
 *      typing in progress. Widening those deps is a one-character change with no visible symptom
 *      until an admin loses a sentence they were mid-way through.
 *
 * `t` ECHOES ITS KEY AND CARRIES ITS PARAMS
 * ----------------------------------------
 * Assertions read as the locale path they pin rather than as English prose a translator could reword
 * out from under them. Params are appended rather than discarded, matching the stub in
 * `OptionSetItemsEditor.test.tsx`: a param-discarding stub collapses distinct interpolated strings
 * into one and would silently pass the defects those strings exist to prevent.
 *
 * `@core/providers/settings-provider` is deliberately NOT mocked. `useSettings` falls back to
 * `createFallbackSettings()` with no provider above it, so the primitives render on their real default
 * ladders here -- the same thing `OptionSetListView.a11y.test.tsx` relies on.
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import {
  OPTION_SET_DESCRIPTION_MAX_LENGTH,
  OPTION_SET_LABEL_MAX_LENGTH,
  OPTION_SET_STABLE_KEY_MAX_LENGTH,
  OptionSetEditorDialog,
  type OptionSetEditorDialogProps,
  type OptionSetEditorSubmission,
} from "./OptionSetEditorDialog";
import { OptionSet, type OptionSetData } from "../../domain/entities/OptionSet";

// The scope Switch is a Radix primitive, and Radix measures its thumb with ResizeObserver, which jsdom
// does not implement. Stubbed the same way `generic-form.a11y.test.tsx` stubs it -- every create-arm
// test below renders the switch, so without this they all throw on mount rather than assert anything.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

// Echoes the key, and APPENDS interpolation params as JSON. See this file's header for why the params
// are carried rather than dropped.
vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) =>
      params ? `${key}:${JSON.stringify(params)}` : key,
    language: "en",
    direction: "ltr",
  }),
}));

/* ── Fixtures ─────────────────────────────────────────────────────────────────────────────────── */

/**
 * An ordinary tenant-owned, tenant-editable set: `isSystemManaged` and `isPlatformOwned` both false,
 * which is the combination the scope report used to get backwards.
 */
function optionSetFixture(overrides: Partial<OptionSetData> = {}): OptionSet {
  return new OptionSet({
    id: "set-1",
    stableKey: "training_intensity",
    labelEn: "Training intensity",
    labelAr: "شدة التدريب",
    description: "How hard a session is",
    isSystemManaged: false,
    isPlatformOwned: false,
    versionCount: 2,
    publishedVersionId: "ver-1",
    publishedVersionNumber: 1,
    ...overrides,
  });
}

/**
 * Full props with the create-form defaults, so each test states only the fact it is about.
 *
 * Returned rather than spread inline because the reseed tests below have to `rerender` with the SAME
 * props except one, and a helper is the only way to keep those two calls honestly identical.
 */
function editorProps(overrides: Partial<OptionSetEditorDialogProps> = {}): OptionSetEditorDialogProps {
  return {
    open: true,
    onOpenChange: vi.fn(),
    optionSet: null,
    readOnlyReason: null,
    canChooseScope: true,
    isPlatformContext: false,
    isSaving: false,
    errorMessage: null,
    onSubmit: vi.fn(),
    ...overrides,
  };
}

function renderDialog(overrides: Partial<OptionSetEditorDialogProps> = {}) {
  const onSubmit = vi.fn();
  const props = editorProps({ onSubmit, ...overrides });
  const view = render(<OptionSetEditorDialog {...props} />);

  return {
    ...view,
    props,
    onSubmit,
    /** The single submission emitted. Throws rather than returning undefined on a silent no-op. */
    submitted: (): OptionSetEditorSubmission => {
      const call = onSubmit.mock.calls[0];
      if (call === undefined) throw new Error("onSubmit was never called");
      return call[0] as OptionSetEditorSubmission;
    },
  };
}

const keyInput = () => screen.getByLabelText("optionSet.fields.stableKey") as HTMLInputElement;

/**
 * Types a key and hands back the input, so the caller can read its REAL `ValidityState`.
 *
 * jsdom implements `pattern` for an input attached inside a `<form>`, which is where the portaled
 * dialog puts this one -- so `validity.patternMismatch` below is the same answer a browser gives on
 * submit, not a re-implementation of it. (Detached from a form it silently reports valid for
 * everything, which is why these assertions go through a rendered dialog rather than a bare element.)
 *
 * The `pattern` attribute is asserted present on the way through, deliberately: without that check a
 * future change could satisfy every positive case below by deleting the attribute, gating nothing.
 */
function typeKey(value: string): HTMLInputElement {
  const input = keyInput();
  expect(input).toHaveAttribute("pattern");
  fireEvent.change(input, { target: { value } });
  return input;
}
const labelEnInput = () => screen.getByLabelText("optionSet.fields.labelEn") as HTMLInputElement;
const labelArInput = () => screen.getByLabelText("optionSet.fields.labelAr") as HTMLInputElement;
const descriptionInput = () =>
  screen.getByLabelText("optionSet.fields.description") as HTMLTextAreaElement;
const saveButton = () => screen.getByRole("button", { name: "common.save" });

/* ── Scope, on the edit form ──────────────────────────────────────────────────────────────────── */

describe("scope report on the edit form", () => {
  it("says nothing at all about scope for a tenant-owned set", () => {
    renderDialog({ optionSet: optionSetFixture({ isPlatformOwned: false }) });

    // The defect this replaces: `isPlatformOwned === false` rendered `badge.global` under the
    // "Global (all tenants)" heading -- the exact opposite of the truth. `optionSet.badge` has no
    // tenant key because there is no tenant-scoped badge to render; the row is withheld instead.
    expect(screen.queryByText("optionSet.badge.global")).not.toBeInTheDocument();
    expect(screen.queryByText("optionSet.badge.platformOwned")).not.toBeInTheDocument();
    expect(screen.queryByText("optionSet.fields.isGlobal")).not.toBeInTheDocument();
    expect(screen.queryByText("optionSet.immutable.isGlobal")).not.toBeInTheDocument();
  });

  it("reports platform ownership for a platform-owned set, and never calls it Global", () => {
    renderDialog({ optionSet: optionSetFixture({ isPlatformOwned: true }) });

    expect(screen.getByText("optionSet.badge.platformOwned")).toBeInTheDocument();
    expect(screen.getByText("optionSet.fields.isGlobal")).toBeInTheDocument();
    // The sentence that explains why there is no control here, not just a badge with no context.
    expect(screen.getByText("optionSet.immutable.isGlobal")).toBeInTheDocument();
    expect(screen.queryByText("optionSet.badge.global")).not.toBeInTheDocument();
  });

  it("offers a switch rather than a badge on create, and no badge at all", () => {
    renderDialog({ canChooseScope: true });

    expect(screen.getByRole("switch")).toBeInTheDocument();
    expect(screen.queryByText("optionSet.badge.global")).not.toBeInTheDocument();
    expect(screen.queryByText("optionSet.badge.platformOwned")).not.toBeInTheDocument();
  });

  it("withholds the scope switch entirely when the caller may not choose scope", () => {
    renderDialog({ canChooseScope: false });

    expect(screen.queryByRole("switch")).not.toBeInTheDocument();
    expect(screen.queryByText("optionSet.fields.isGlobal")).not.toBeInTheDocument();
  });

  it("shows the switch on and inert in platform context, because the set is global regardless", () => {
    renderDialog({ isPlatformContext: true });

    const scopeSwitch = screen.getByRole("switch");
    expect(scopeSwitch).toBeChecked();
    expect(scopeSwitch).toBeDisabled();
    expect(screen.getByText("optionSet.isGlobalDescription.platformContext")).toBeInTheDocument();
    expect(screen.getByText("optionSet.platformContext.title")).toBeInTheDocument();
  });
});

/* ── The key input ────────────────────────────────────────────────────────────────────────────── */

describe("stableKey input", () => {
  it("accepts the platform's own hyphenated key convention", () => {
    renderDialog();

    // All three are real seeded platform keys, from PlatformOptionSetCatalog. The pattern used to
    // exclude the hyphen, so the browser hard-blocked submit -- with a generic "match the requested
    // format" -- for keys the server itself uses and would have stored.
    for (const platformKey of ["iso-3166-1-countries", "iso-4217-currencies", "bcp-47-languages"]) {
      const input = typeKey(platformKey);
      expect(input.value).toBe(platformKey);
      expect(input.validity.patternMismatch).toBe(false);
      expect(input.checkValidity()).toBe(true);
    }
  });

  it("ships a pattern the browser can actually compile, so the gate cannot silently vanish", () => {
    renderDialog();
    const pattern = keyInput().getAttribute("pattern");
    expect(pattern).not.toBeNull();

    // HTML compiles `pattern` with the `v` (unicodeSets) flag, and an UNPARSEABLE pattern is ignored
    // rather than reported -- no console error, no failed validation, just no gate. A bare `-` inside
    // a character class is a syntax error under `v`, so `[a-z][a-z0-9_-]*` is not a wider rule than
    // `[a-z][a-z0-9_]*`, it is NO rule. Compiled here exactly the way the spec compiles it, because
    // the escaped form looks like clutter to anyone who does not know this.
    expect(() => new RegExp(`^(?:${pattern})$`, "v")).not.toThrow();
  });

  it("still refuses keys the house convention excludes", () => {
    renderDialog();

    // Asserted in the negative direction too, so allowing the hyphen cannot be "fixed" next time by
    // widening the pattern to everything -- which would pass the test above and gate nothing.
    for (const rejected of ["iso 3166 countries", "3166-countries", "countries.iso", "-countries"]) {
      expect(typeKey(rejected).validity.patternMismatch).toBe(true);
    }
  });

  it("lowercases as it is typed, so the value and the pattern can never disagree", () => {
    renderDialog();

    // Without this the pattern would reject `Training_Intensity` on submit for a reason the admin
    // cannot see, and an import matching on the key would miss a set that looks right on screen.
    const input = typeKey("Training_Intensity");

    expect(input.value).toBe("training_intensity");
    expect(input.validity.patternMismatch).toBe(false);
  });

  it("caps every input at the server's own MaxLength", () => {
    renderDialog();

    // Pinned as the numbers the server enforces, not as whatever the constants happen to say: a drift
    // here is a 400 the admin sees only after typing a full description.
    expect(OPTION_SET_STABLE_KEY_MAX_LENGTH).toBe(100);
    expect(OPTION_SET_LABEL_MAX_LENGTH).toBe(200);
    expect(OPTION_SET_DESCRIPTION_MAX_LENGTH).toBe(1000);

    expect(keyInput()).toHaveAttribute("maxLength", "100");
    expect(labelEnInput()).toHaveAttribute("maxLength", "200");
    expect(labelArInput()).toHaveAttribute("maxLength", "200");
    expect(descriptionInput()).toHaveAttribute("maxLength", "1000");
  });

  it("renders the key as read-only text on edit, with no control to enable", () => {
    renderDialog({ optionSet: optionSetFixture({ stableKey: "iso-3166-1-countries" }) });

    // Text, not a disabled input: exports and bindings quote the key, so it has to stay readable.
    expect(screen.getByText("iso-3166-1-countries")).toBeInTheDocument();
    expect(screen.getByText("optionSet.immutable.stableKey")).toBeInTheDocument();
    expect(screen.queryByLabelText("optionSet.fields.stableKey")).not.toBeInTheDocument();
  });
});

/* ── The read-only arm ────────────────────────────────────────────────────────────────────────── */

describe("read-only arm", () => {
  it("lets a platform-maintained set override the reason its caller passed", () => {
    renderDialog({
      optionSet: optionSetFixture({ isSystemManaged: true }),
      readOnlyReason: "permission",
    });

    // The entity's answer wins: the server refuses all five mutating paths on a system-managed set for
    // every caller, so "you lack permission" would be both wrong and fixable-looking.
    expect(screen.getByText("optionSet.readOnly.systemManaged.title")).toBeInTheDocument();
    expect(screen.getByText("optionSet.readOnly.systemManaged.description")).toBeInTheDocument();
    expect(screen.queryByText("optionSet.permissions.update")).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "common.save" })).not.toBeInTheDocument();
  });

  it("reaches the systemManaged state on its own, with no reason passed at all", () => {
    renderDialog({ optionSet: optionSetFixture({ isSystemManaged: true }), readOnlyReason: null });

    expect(screen.getByText("optionSet.readOnly.systemManaged.title")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("explains platform ownership when that is the reason, since the entity cannot say so", () => {
    renderDialog({
      optionSet: optionSetFixture({ isPlatformOwned: true }),
      readOnlyReason: "platformOwned",
    });

    expect(screen.getByText("optionSet.readOnly.platformOwned.title")).toBeInTheDocument();
    expect(screen.getByText("optionSet.readOnly.platformOwned.description")).toBeInTheDocument();
    expect(screen.queryByText("optionSet.readOnly.systemManaged.title")).not.toBeInTheDocument();
  });

  it("keeps the attempted action as the heading when permission is the reason", () => {
    const { unmount } = renderDialog({
      optionSet: optionSetFixture(),
      readOnlyReason: "permission",
    });

    // Permission is a fact about the viewer, not a property of the set, so the heading stays the
    // action they attempted and the body says why it is unavailable.
    expect(screen.getByText("optionSet.editTitle")).toBeInTheDocument();
    expect(screen.getByText("optionSet.permissions.update")).toBeInTheDocument();
    unmount();

    renderDialog({ optionSet: null, readOnlyReason: "permission" });
    expect(screen.getByText("optionSet.addNew")).toBeInTheDocument();
    expect(screen.getByText("optionSet.permissions.create")).toBeInTheDocument();
  });

  it("still names which set is locked", () => {
    renderDialog({
      optionSet: optionSetFixture({ stableKey: "bcp-47-languages", labelEn: "Languages" }),
      readOnlyReason: "platformOwned",
    });

    // An admin who opened this wants to know WHICH list is off limits, and the key is what a binding
    // and an export quote.
    expect(screen.getByText("bcp-47-languages")).toBeInTheDocument();
    expect(screen.getByText("Languages")).toBeInTheDocument();
  });
});

/* ── Reseeding across openings and refetches ──────────────────────────────────────────────────── */

describe("reseeding when the dialog is reused", () => {
  it("keeps in-flight edits when a refetch produces an equal-but-new entity", () => {
    const props = editorProps({ optionSet: optionSetFixture({ id: "set-1" }) });
    const { rerender } = render(<OptionSetEditorDialog {...props} />);

    expect(labelEnInput()).toHaveValue("Training intensity");
    fireEvent.change(labelEnInput(), { target: { value: "Session intensity" } });

    // A background refetch: same id, brand-new object identity, same server values. Widening the
    // effect deps to the entity (or to the individual fields) discards the admin's typing here.
    rerender(
      <OptionSetEditorDialog {...props} optionSet={optionSetFixture({ id: "set-1" })} />
    );

    expect(labelEnInput()).toHaveValue("Session intensity");
  });

  it("reseeds when pointed at a different set", () => {
    const props = editorProps({ optionSet: optionSetFixture({ id: "set-1" }) });
    const { rerender } = render(<OptionSetEditorDialog {...props} />);

    fireEvent.change(labelEnInput(), { target: { value: "Session intensity" } });

    rerender(
      <OptionSetEditorDialog
        {...props}
        optionSet={optionSetFixture({ id: "set-2", labelEn: "Pitch surface", labelAr: null })}
      />
    );

    expect(labelEnInput()).toHaveValue("Pitch surface");
    // Null from the server has to land as an empty string, not as the previous row's Arabic label.
    expect(labelArInput()).toHaveValue("");
  });

  it("reseeds on reopen, so the second row edited does not show the first row's labels", () => {
    const props = editorProps({ optionSet: optionSetFixture({ id: "set-1" }) });
    const { rerender } = render(<OptionSetEditorDialog {...props} />);

    fireEvent.change(labelEnInput(), { target: { value: "Session intensity" } });

    // The dialog is not remounted between openings, so without the `open` dep the discarded edit
    // would still be sitting in the field on the next open.
    rerender(<OptionSetEditorDialog {...props} open={false} />);
    rerender(<OptionSetEditorDialog {...props} open />);

    expect(labelEnInput()).toHaveValue("Training intensity");
  });
});

/* ── canSave ──────────────────────────────────────────────────────────────────────────────────── */

describe("canSave", () => {
  it("requires both a key and an English label on create", () => {
    renderDialog();

    expect(saveButton()).toBeDisabled();

    fireEvent.change(keyInput(), { target: { value: "training-intensity" } });
    expect(saveButton()).toBeDisabled();

    fireEvent.change(labelEnInput(), { target: { value: "Training intensity" } });
    expect(saveButton()).toBeEnabled();
  });

  it("treats a whitespace-only English label as absent", () => {
    renderDialog({ optionSet: optionSetFixture() });

    expect(saveButton()).toBeEnabled();
    fireEvent.change(labelEnInput(), { target: { value: "   " } });
    expect(saveButton()).toBeDisabled();
  });

  it("does not require a key on edit, because there is no key input", () => {
    renderDialog({ optionSet: optionSetFixture() });

    expect(screen.queryByLabelText("optionSet.fields.stableKey")).not.toBeInTheDocument();
    expect(saveButton()).toBeEnabled();
  });

  it("blocks a second submit while the first is in flight", () => {
    renderDialog({ optionSet: optionSetFixture(), isSaving: true });

    expect(saveButton()).toBeDisabled();
    expect(saveButton()).toHaveAttribute("aria-busy", "true");
  });
});

/* ── What the dialog emits ────────────────────────────────────────────────────────────────────── */

describe("submission shape", () => {
  it("emits a create submission with the key trimmed and lowercased", () => {
    const { onSubmit, submitted } = renderDialog({ isPlatformContext: false });

    fireEvent.change(keyInput(), { target: { value: "ISO-3166-1-Countries" } });
    fireEvent.change(labelEnInput(), { target: { value: "  Countries  " } });
    fireEvent.change(labelArInput(), { target: { value: "  الدول  " } });
    fireEvent.change(descriptionInput(), { target: { value: "  ISO country list  " } });
    fireEvent.click(screen.getByRole("switch"));
    fireEvent.click(saveButton());

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(submitted()).toEqual({
      mode: "create",
      stableKey: "iso-3166-1-countries",
      labelEn: "Countries",
      labelAr: "الدول",
      description: "ISO country list",
      isGlobal: true,
    });
  });

  it("emits an edit submission that physically cannot carry stableKey or isGlobal", () => {
    const { submitted } = renderDialog({
      optionSet: optionSetFixture({ stableKey: "training_intensity", isPlatformOwned: true }),
    });

    fireEvent.change(labelEnInput(), { target: { value: "Session intensity" } });
    fireEvent.click(saveButton());

    const submission = submitted();
    // `toEqual` already proves the absence, but the two explicit checks name the properties a
    // viewmodel must never be able to spread into `UpdateOptionSetRequest` -- the whole reason the
    // submission is a discriminated union rather than one flat shape.
    expect(submission).toEqual({
      mode: "edit",
      labelEn: "Session intensity",
      labelAr: "شدة التدريب",
      description: "How hard a session is",
    });
    expect(Object.keys(submission)).not.toContain("stableKey");
    expect(Object.keys(submission)).not.toContain("isGlobal");
  });

  it("emits empty strings for the optional fields the caller turns into null", () => {
    const { submitted } = renderDialog({
      optionSet: optionSetFixture({ labelAr: null, description: null }),
    });

    fireEvent.click(saveButton());

    expect(submitted()).toEqual({
      mode: "edit",
      labelEn: "Training intensity",
      labelAr: "",
      description: "",
    });
  });
});

/* ── Server refusals ──────────────────────────────────────────────────────────────────────────── */

describe("server refusal", () => {
  it("renders the refusal inside the dialog, announced, beside the key that caused it", () => {
    renderDialog({
      errorMessage: "A set with the key iso-3166-1-countries already exists.",
    });

    // role="alert" because the admin's focus is on Save by the time a 409 arrives, and a toast would
    // outlive the dialog and land next to a form they can no longer see.
    //
    // `getAllBy` rather than `getBy`: `Alert` carries role="alert" on its own wrapper and the dialog
    // puts it on `AlertDescription` too, so the message resolves to two nested nodes. Asserted on the
    // set rather than pinned to one of them, so this test tracks the announcement rather than which
    // element in @core/ui/alert happens to own the role.
    const alerts = screen.getAllByRole("alert");
    expect(
      alerts.some((node) =>
        node.textContent?.includes("A set with the key iso-3166-1-countries already exists.")
      )
    ).toBe(true);
    // The refusal has to be readable BESIDE the key that caused it -- the form is still there.
    expect(keyInput()).toBeInTheDocument();
  });
});

// renderCustomFieldControl -- `referenceTargetEntityTypeKey` precedence (Wave 4 follow-up)
//
// WHY A SEPARATE FILE from renderCustomFieldControl.test.tsx. These tests need to observe WHICH
// entity type the picker is fed, and the only honest observation point for that is the argument the
// control hands `useEntityLookupSearch` -- so this file mocks the two entity-lookup hooks. That mock
// is module-scoped in Vitest, and renderCustomFieldControl.test.tsx deliberately runs the reference
// branch against the UNMOCKED control (its own assertions are about the rendered no-target state, not
// about lookups), so mocking there would silently change what that file proves. One concern, one
// file, matching this module's existing `*.valueType.test.ts` / `*.optionsVisibility.test.tsx` split.
//
// WHAT IS PINNED HERE, in one sentence: the definition's pin decides what the picker OFFERS, the
// stored value decides what the field READS BACK, and when the two disagree the pin wins the offer
// without costing the value its display name.
//
// The lookup hooks are mocked, not the control: the assertion is about end-observable behaviour
// (which type the picker queries, and whether it is operable at all), not about which props this
// branch happens to spell. A prop-capture mock of EntityReferenceCustomFieldControl would still pass
// if the control ignored the prop entirely.
import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom";
import { renderCustomFieldControl } from "./renderCustomFieldControl";
import type { FieldConfig } from "@core/ui/forms/generic-form";

/**
 * Recorded hook arguments. `vi.hoisted` rather than a plain `const`, because `vi.mock` factories are
 * hoisted above module-level declarations -- a plain const would be in its TDZ if a factory ever
 * touched it during module init.
 */
const { searchArgs, resolveArgs } = vi.hoisted(() => ({
  searchArgs: [] as Array<{ entityTypeKey?: string | null; enabled?: boolean }>,
  resolveArgs: [] as unknown[],
}));

vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({ switchStyle: "default", fontSize: "default", inputStyle: "default" }),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({ t: (key: string) => key, language: "en", direction: "ltr" }),
}));

// Same relative specifiers the control itself imports (this file sits beside it), so these mocks
// intercept the real module identity rather than a second copy under a different path.
vi.mock("../../../../entity-lookup/src/presentation/hooks/useEntityLookupSearch", () => ({
  useEntityLookupSearch: (args: { entityTypeKey?: string | null; enabled?: boolean }) => {
    searchArgs.push(args);
    return {
      query: "",
      setQuery: vi.fn(),
      items: [],
      isLoading: false,
      isLoadingMore: false,
      hasNextPage: false,
      loadMore: vi.fn(),
      error: null,
      reload: vi.fn(),
    };
  },
}));

vi.mock("../../../../entity-lookup/src/presentation/hooks/useResolveEntityReference", () => ({
  useResolveEntityReference: (reference: unknown) => {
    resolveArgs.push(reference);
    // A real resolution, so a populated field renders a real display name and the tests can tell
    // "the held value still reads back" apart from "the picker offers type X".
    return {
      item: reference
        ? { id: "ENC-1", displayName: "Nadia Rashed", secondary: null, isActive: true }
        : null,
      status: reference ? "resolved" : "idle",
      retry: vi.fn(),
    };
  },
}));

// jsdom has neither: SelectTrigger measures its own width on mount (for the popover width CSS var)
// regardless of open state, and cmdk calls scrollIntoView on the highlighted row. Same two polyfills
// renderCustomFieldControl.test.tsx installs, for the same reasons.
if (typeof (globalThis as unknown as { ResizeObserver?: unknown }).ResizeObserver === "undefined") {
  (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
if (typeof Element.prototype.scrollIntoView !== "function") {
  Element.prototype.scrollIntoView = () => {};
}

/** Base config for an EntityReference field. Both reference value types share this `type`. */
const FC: FieldConfig = { name: "cf_assignee", type: "entity-reference", label: "Assignee" };

/** A stored reference -- `entityId`, never `encryptedEntityId`, on the way in and back out alike. */
const STAFF_VALUE = { entityTypeKey: "hrms.staff-member", entityId: "ENC-1" };

/** The entity type key the search hook was last given, i.e. what the picker would actually query. */
function lastSearchTarget(): string | null | undefined {
  return searchArgs[searchArgs.length - 1]?.entityTypeKey;
}

const NO_TARGET_TEXT = "customField.entityReference.noTargetConfigured";

beforeEach(() => {
  searchArgs.length = 0;
  resolveArgs.length = 0;
});

afterEach(() => {
  cleanup();
});

describe("renderCustomFieldControl -- referenceTargetEntityTypeKey (definition pin) precedence", () => {
  it("uses referenceTargetEntityTypeKey when the definition pin is PRESENT, so an EMPTY field still offers records", () => {
    render(
      <>
        {renderCustomFieldControl({
          fc: { ...FC, referenceTargetEntityTypeKey: "identity.user" },
          value: null,
          onChange: vi.fn(),
        })}
      </>
    );

    // The whole point of the pin: an empty field is now operable instead of explaining that it has
    // no target. Both halves are asserted -- an operable combobox alone would not prove the
    // no-target branch was left behind.
    expect(lastSearchTarget()).toBe("identity.user");
    expect(screen.getByRole("combobox", { name: "Assignee" })).not.toHaveAttribute(
      "aria-disabled",
      "true"
    );
    expect(screen.queryByText(NO_TARGET_TEXT)).not.toBeInTheDocument();
  });

  it("falls back to the stored value's own entityTypeKey when referenceTargetEntityTypeKey is ABSENT", () => {
    // An unpinned EntityReference is a legitimate, permanent configuration (any registered entity
    // type is a legal target), so this fallback is not a transition state to be removed later.
    render(<>{renderCustomFieldControl({ fc: { ...FC }, value: STAFF_VALUE, onChange: vi.fn() })}</>);

    expect(lastSearchTarget()).toBe("hrms.staff-member");
    expect(screen.getByRole("combobox", { name: "Assignee" })).not.toHaveAttribute(
      "aria-disabled",
      "true"
    );
  });

  it("reaches the no-target state when referenceTargetEntityTypeKey and the stored value are BOTH absent", () => {
    render(<>{renderCustomFieldControl({ fc: { ...FC }, value: null, onChange: vi.fn() })}</>);

    // `null`, not `undefined`: the hook's own contract distinguishes "no target at all" from "a
    // target nobody has asked about yet", and this branch must say the first one.
    expect(lastSearchTarget()).toBeNull();
    expect(screen.getByRole("combobox", { name: "Assignee" })).toHaveAttribute(
      "aria-disabled",
      "true"
    );
    // Never an empty dropdown -- that reads as "the server returned no records" and sends the
    // operator looking in the wrong place.
    expect(screen.getByText(NO_TARGET_TEXT)).toBeInTheDocument();
  });

  it("a definition pinned to identity.user holding a value pointing at hrms.staff-member offers identity.user -- the PIN wins, because it governs what a NEW pick may be", () => {
    // The re-pointed-definition case, and the reason precedence is not arbitrary. If the stored
    // value won here, an admin who re-pointed this field would keep handing staff members to every
    // editor of a record that still holds an old value -- picks the write-side gate then refuses.
    render(
      <>
        {renderCustomFieldControl({
          fc: { ...FC, referenceTargetEntityTypeKey: "identity.user" },
          value: STAFF_VALUE,
          onChange: vi.fn(),
        })}
      </>
    );

    expect(lastSearchTarget()).toBe("identity.user");
    expect(lastSearchTarget()).not.toBe("hrms.staff-member");
  });

  it("the pin winning costs the held value nothing -- resolution is still driven by the VALUE's own entityTypeKey", () => {
    // Why preferring the pin is free: the prop feeds the SEARCH only, while the closed field's label
    // is resolved off `value`. So a value pointing at the old type still reads back correctly.
    render(
      <>
        {renderCustomFieldControl({
          fc: { ...FC, referenceTargetEntityTypeKey: "identity.user" },
          value: STAFF_VALUE,
          onChange: vi.fn(),
        })}
      </>
    );

    expect(resolveArgs[resolveArgs.length - 1]).toEqual(STAFF_VALUE);
    expect(screen.getByText("Nadia Rashed")).toBeInTheDocument();
  });

  it.each([
    ["an empty string", ""],
    ["whitespace only", "   "],
    ["null", null],
    ["undefined", undefined],
  ])(
    "treats a %s referenceTargetEntityTypeKey as no pin and falls through to the stored value",
    (_label, pin) => {
      // Whitespace matters rather than being defensive noise: the control refuses a whitespace key
      // as a target (a picker opened against " " queries a route the server cannot resolve), so a
      // whitespace pin that reached it would have destroyed a perfectly usable value key on the way.
      render(
        <>
          {renderCustomFieldControl({
            fc: { ...FC, referenceTargetEntityTypeKey: pin },
            value: STAFF_VALUE,
            onChange: vi.fn(),
          })}
        </>
      );

      expect(lastSearchTarget()).toBe("hrms.staff-member");
    }
  );
});

describe("renderCustomFieldControl -- UserReference does not depend on the definition pin", () => {
  it("offers identity.user from the SERVER-SUPPLIED pin, with no admin configuration involved", () => {
    // UserReference's allowlist has exactly one member, so the server answers the pin from code
    // (UserReferenceValueTypeHandler.ImplicitTargetEntityTypeKey). It arrives on the same property at
    // the same resolution as a real EntityReference pin, which is why this branch needs no
    // value-type case -- and could not have one anyway: both types share this `fieldConfigType`.
    render(
      <>
        {renderCustomFieldControl({
          fc: { ...FC, name: "cf_owner", label: "Owner", referenceTargetEntityTypeKey: "identity.user" },
          value: null,
          onChange: vi.fn(),
        })}
      </>
    );

    expect(lastSearchTarget()).toBe("identity.user");
    expect(screen.getByRole("combobox", { name: "Owner" })).not.toHaveAttribute(
      "aria-disabled",
      "true"
    );
  });

  it("keeps working with NO pin at all -- a populated UserReference stays operable and readable", () => {
    // The server-predating-the-pin case. UserReference must degrade exactly like every other
    // reference field rather than breaking, so nothing here may require the pin to be present.
    const userValue = { entityTypeKey: "identity.user", entityId: "ENC-9" };
    render(
      <>
        {renderCustomFieldControl({
          fc: { ...FC, name: "cf_owner", label: "Owner" },
          value: userValue,
          onChange: vi.fn(),
        })}
      </>
    );

    expect(lastSearchTarget()).toBe("identity.user");
    expect(screen.getByRole("combobox", { name: "Owner" })).not.toHaveAttribute(
      "aria-disabled",
      "true"
    );
    expect(screen.getByText("Nadia Rashed")).toBeInTheDocument();
  });
});

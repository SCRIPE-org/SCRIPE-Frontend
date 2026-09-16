/**
 * OptionSetStatusBadge -- the two status vocabularies, in words (P-4)
 *
 * This component is the ONLY place an option-set status becomes text, and every screen in the
 * submodule mounts it. Nothing else in the module asserts what it renders: the view tests mount
 * whole screens and query by role, so a badge that printed the wrong word -- or a raw locale path --
 * would still satisfy them as long as some chip existed in the row.
 *
 * WHAT IS PINNED HERE, AND WHY EACH ONE IS A REAL FAILURE MODE
 * -----------------------------------------------------------
 *  1. EVERY MEMBER OF BOTH UNIONS RENDERS. `FieldVersionStatus` (Draft/Published/Deprecated/
 *     Archived) and `FieldOptionStatus` (Active/Deactivated/Deleted) share no member, which is
 *     exactly why a missing row in either tone/label map is invisible: the badge still renders, just
 *     with the wrong word or an unstyled chip. The expectation tables below are typed
 *     `Record<Union, …>`, so a status added to either union is a COMPILE error in this file too.
 *  2. THE TEXT COMES FROM THE DICTIONARY, AT THE RIGHT KEY. `t` here resolves the REAL `en`
 *     dictionary and, like the production translator, returns the KEY on a miss. So a mistyped
 *     locale path renders `optionSet.versions.status.Draft` instead of "Draft" and fails, rather
 *     than passing because "some string appeared".
 *  3. `Deleted` FALLS BACK TO THE WIRE VALUE, NOT TO A LOCALE PATH. `optionSet.items.status` has no
 *     `Deleted` key BY DESIGN -- this UI never authors that status -- so the component guards the
 *     lookup and passes the raw value through. Drop the guard and an admin reading an older version
 *     sees "optionSet.items.status.Deleted", which is the one outcome worse than "Deleted".
 *  4. AN UNKNOWN VALUE STILL RENDERS. Both unions are closed on the wire TODAY. The status arrives
 *     from the network all the same, so a server that ships a fifth version status must not produce
 *     a thrown render; the component's `?? "outline"` tone is what makes that true.
 *  5. THE HINT IS ABSENT, NOT INVENTED, FOR `Deleted`. `OptionSetStatusHint` returns null there
 *     rather than a fallback sentence, because inventing copy would re-introduce the delete
 *     vocabulary the locale layer removed on purpose.
 *
 * Assertions are on TEXT, never on class names. The tone mapping is a design decision documented in
 * the component; the words are the contract with the administrator, and the words are also what a
 * screen reader announces.
 */
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { OptionSetStatusBadge, OptionSetStatusHint } from "./OptionSetStatusBadge";
import type {
  FieldOptionStatus,
  FieldVersionStatus,
} from "../../data/models/OptionSetModel";
import { en } from "../../../locales/option-set.en";

// Badge resolves its shape/radius ladder from the Settings store. Same mock shape the sibling
// OptionSetItemsEditor test uses, for the same reason: the primitive is not what is under test.
vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({
    fontSize: "default",
    inputStyle: "default",
    buttonStyle: "default",
    borderRadius: "default",
    animationLevel: "default",
    badgeStyle: "default",
    spacingSize: "default",
    switchStyle: "default",
  }),
}));

/**
 * Resolves a dotted key against the REAL English dictionary, returning the key on a miss.
 *
 * A key-echoing stub would let a mistyped locale path pass -- the assertion would just be pinning
 * the typo. Resolving the real dictionary means the expected value is the word an administrator
 * actually reads, and a wrong (or deleted) key renders as its own path and fails loudly.
 *
 * Params are appended rather than discarded, matching the sibling view tests. No status or hint key
 * takes one today; a stub that silently dropped them would be the wrong default for the next one.
 */
function translate(key: string, params?: Record<string, string | number>): string {
  const resolved = key
    .split(".")
    .reduce<unknown>(
      (node, segment) =>
        node && typeof node === "object"
          ? (node as Record<string, unknown>)[segment]
          : undefined,
      en
    );

  if (typeof resolved !== "string") return key;
  return params ? `${resolved} ${Object.values(params).join(" ")}` : resolved;
}

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, string | number>) => translate(key, params),
    language: "en",
    direction: "ltr",
  }),
}));

/**
 * Expected badge text for every version status, sourced from the dictionary itself.
 *
 * Typed over the union, so adding a member to `FieldVersionStatus` without deciding what it says
 * fails to compile here as well as in the component's tone map.
 */
const VERSION_STATUS_TEXT: Record<FieldVersionStatus, string> = {
  Draft: en.optionSet.versions.status.Draft,
  Published: en.optionSet.versions.status.Published,
  Deprecated: en.optionSet.versions.status.Deprecated,
  Archived: en.optionSet.versions.status.Archived,
};

/**
 * Expected badge text for every option status.
 *
 * `Deleted` is the literal wire value on purpose -- the dictionary has no entry for it and must not
 * gain one. The other two come from the dictionary, so this table cannot drift from the copy.
 */
const OPTION_STATUS_TEXT: Record<FieldOptionStatus, string> = {
  Active: en.optionSet.items.status.Active,
  Deactivated: en.optionSet.items.status.Deactivated,
  Deleted: "Deleted",
};

describe("OptionSetStatusBadge", () => {
  describe("version vocabulary", () => {
    for (const status of Object.keys(VERSION_STATUS_TEXT) as FieldVersionStatus[]) {
      it(`renders ${status} as its own word`, () => {
        render(<OptionSetStatusBadge kind="version" status={status} />);

        expect(screen.getByText(VERSION_STATUS_TEXT[status])).toBeInTheDocument();
      });
    }

    it("keeps Deprecated and Archived textually DISTINCT, not one shared 'retired' word", () => {
      // The pair the component header calls out: an admin who reads "Deprecated" as "Archived" goes
      // looking for data loss that never happened, because a deprecated version still interprets
      // stored values while an archived one is history only.
      const { unmount } = render(<OptionSetStatusBadge kind="version" status="Deprecated" />);
      const deprecated = screen.getByText(VERSION_STATUS_TEXT.Deprecated).textContent;
      unmount();

      render(<OptionSetStatusBadge kind="version" status="Archived" />);
      const archived = screen.getByText(VERSION_STATUS_TEXT.Archived).textContent;

      expect(deprecated).not.toBe(archived);
    });
  });

  describe("option vocabulary", () => {
    for (const status of Object.keys(OPTION_STATUS_TEXT) as FieldOptionStatus[]) {
      it(`renders ${status} as its own word`, () => {
        render(<OptionSetStatusBadge kind="option" status={status} />);

        expect(screen.getByText(OPTION_STATUS_TEXT[status])).toBeInTheDocument();
      });
    }

    it("shows Deleted as the bare wire value, never as an unresolved locale path", () => {
      // The guard in `optionStatusLabel` is what this pins. Without it the dictionary miss returns
      // the key, and the badge prints `optionSet.items.status.Deleted` to an administrator.
      render(<OptionSetStatusBadge kind="option" status="Deleted" />);

      expect(screen.getByText("Deleted")).toBeInTheDocument();
      expect(screen.queryByText("optionSet.items.status.Deleted")).not.toBeInTheDocument();
    });
  });

  describe("a status this build has never heard of", () => {
    // Both unions are closed on the wire, so these values cannot be produced by the current
    // backend -- the cast is how the test reaches the runtime path a LATER backend would take. The
    // component's `?? "outline"` tone exists for exactly this, and a thrown render here would take
    // the whole version chain down with it rather than showing one odd chip.
    it("still renders an option status the dictionary has no row for", () => {
      render(
        <OptionSetStatusBadge kind="option" status={"Retired" as unknown as FieldOptionStatus} />
      );

      // Raw wire value again: the same guard that saves `Deleted` saves anything else new.
      expect(screen.getByText("Retired")).toBeInTheDocument();
    });

    it("still renders a version status the dictionary has no row for", () => {
      render(
        <OptionSetStatusBadge
          kind="version"
          status={"Superseded" as unknown as FieldVersionStatus}
        />
      );

      // Version statuses have no raw-value fallback -- unlike option statuses they go straight
      // through `t`, which returns the key on a miss. Pinned as the CURRENT behaviour so the
      // asymmetry is visible in a test rather than discovered in production.
      expect(screen.getByText("optionSet.versions.status.Superseded")).toBeInTheDocument();
    });
  });
});

describe("OptionSetStatusHint", () => {
  for (const status of Object.keys(VERSION_STATUS_TEXT) as FieldVersionStatus[]) {
    it(`explains what ${status} means for the choices people see`, () => {
      render(<OptionSetStatusHint kind="version" status={status} />);

      expect(
        screen.getByText(en.optionSet.versions.statusHint[status])
      ).toBeInTheDocument();
    });
  }

  it("explains Active and Deactivated, the two statuses this UI can author", () => {
    const { unmount } = render(<OptionSetStatusHint kind="option" status="Active" />);
    expect(screen.getByText(en.optionSet.items.statusHint.Active)).toBeInTheDocument();
    unmount();

    render(<OptionSetStatusHint kind="option" status="Deactivated" />);
    expect(screen.getByText(en.optionSet.items.statusHint.Deactivated)).toBeInTheDocument();
  });

  it("renders NOTHING for Deleted, rather than inventing a sentence for it", () => {
    // Absence is the contract: `optionSet.items.statusHint` has no `Deleted` key, and a fallback
    // sentence here would put the delete vocabulary back into a UI that deliberately has none.
    const { container } = render(<OptionSetStatusHint kind="option" status="Deleted" />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders NOTHING for an option status the dictionary has never seen", () => {
    const { container } = render(
      <OptionSetStatusHint kind="option" status={"Retired" as unknown as FieldOptionStatus} />
    );

    expect(container).toBeEmptyDOMElement();
  });
});

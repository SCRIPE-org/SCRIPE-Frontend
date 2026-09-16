/**
 * The option-set binding dialog's confirmation copy -- P-4's missing consumer.
 *
 * WHAT THIS PINS, AND AGAINST WHAT
 * ---------------------------------
 * The three action descriptions are not generic "are you sure?" prose; each states what its own
 * backend handler's doc comment says actually happens on that write:
 *
 *  - `BindOptionSetCommandHandler` / `OptionSetBindingApplier`: a hand-authored option survives a
 *    bind UNLESS its key collides with an incoming item, which BLOCKS the bind rather than
 *    overwriting anything (`OptionSetsController`'s and `IOptionSetService.bind`'s own doc comments).
 *  - `RebindOptionSetCommandHandler`: the operation that can DEACTIVATE (never delete) a field's
 *    current options that are absent from the newly chosen set -- values already stored keep
 *    resolving.
 *  - `UnbindOptionSetCommandHandler`: clears the binding and leaves every option row "exactly as it
 *    is", provenance included -- nothing is deactivated, nothing is deleted.
 *
 * A generic "this will change your options, continue?" would pass a naive review and would also be
 * wrong about switch (which DOES deactivate something) and about detach (which changes nothing about
 * the rows at all). This test is what stands between that regression and a green suite.
 *
 * PARITY IS CHECKED BOTH DIRECTIONS, and Arabic is checked for actual Arabic script -- the same two
 * disciplines `customField.wave34.locale.test.ts` established for this module, so a copied-English
 * placeholder in `ar` cannot slip through invisible to this suite.
 */
import { describe, it, expect } from "vitest";
import { en } from "./custom-field.en";
import { ar } from "./custom-field.ar";

const ARABIC_CHAR = /[؀-ۿ]/;

describe("attach", () => {
  it("says a colliding key BLOCKS the attach rather than overwriting the local option", () => {
    const text = en.customField.optionSetBinding.attach.description;
    expect(text).toMatch(/kept/i);
    expect(text).toMatch(/key exactly matches/i);
    expect(text).toMatch(/blocked/i);
  });
});

describe("switch (rebind)", () => {
  it("says non-matching options are DEACTIVATED, and says so as a denial of deletion, not a report of one", () => {
    const text = en.customField.optionSetBinding.switch.description;
    expect(text).toMatch(/are deactivated/i);
    expect(text).toMatch(/not deleted/i);
  });

  it("says records already using a deactivated option keep working", () => {
    const text = en.customField.optionSetBinding.switch.description;
    expect(text).toMatch(/keep working/i);
  });
});

describe("detach (unbind)", () => {
  it("says every option row is left exactly as it is -- nothing deactivated, nothing deleted", () => {
    const text = en.customField.optionSetBinding.detach.description;
    expect(text).toMatch(/exactly as it is/i);
    expect(text).toMatch(/nothing is deactivated or deleted/i);
  });

  it("DENIES deactivation rather than reporting it -- the trap that would make it read like switch's copy", () => {
    // Detach's paragraph and switch's paragraph both contain the word "deactivated" -- one to deny
    // it happens, one to report that it does. Copying switch's sentence onto detach (or the reverse)
    // would keep that word present in both and still be wrong, so the test has to check POLARITY,
    // not presence.
    const detachText = en.customField.optionSetBinding.detach.description;
    const switchText = en.customField.optionSetBinding.switch.description;

    expect(detachText).toMatch(/nothing is deactivated/i);
    expect(switchText).not.toMatch(/nothing is deactivated/i);
    expect(switchText).toMatch(/are deactivated/i);
    expect(detachText).not.toMatch(/are deactivated/i);
  });
});

describe("en/ar parity", () => {
  const leaves = ["attach", "switch", "detach"] as const;

  it("has every leaf in both languages", () => {
    for (const leaf of leaves) {
      expect(en.customField.optionSetBinding[leaf].description.length).toBeGreaterThan(0);
      expect(ar.customField.optionSetBinding[leaf].description.length).toBeGreaterThan(0);
    }
  });

  it("is real Arabic script, not an English placeholder", () => {
    for (const leaf of leaves) {
      expect(ar.customField.optionSetBinding[leaf].description).toMatch(ARABIC_CHAR);
      expect(ar.customField.optionSetBinding[leaf].action).toMatch(ARABIC_CHAR);
    }
    expect(ar.customField.optionSetBinding.noSetsAvailableHint).toMatch(ARABIC_CHAR);
  });
});

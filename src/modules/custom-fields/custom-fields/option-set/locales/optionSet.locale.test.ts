/**
 * Option-set i18n completeness.
 *
 * The translation function in this codebase has NO defaultValue support: a key that exists in `en`
 * and not in `ar` renders as the raw string "optionSet.versions.publishConfirm.title" to an
 * Arabic-speaking administrator. Nothing else in the suite would notice, so STRUCTURAL PARITY is the
 * headline property pinned here.
 *
 * Beyond parity, this file pins the handful of pieces of CONTENT that are promises the UI makes about
 * backend behaviour. Each one would survive a well-meaning copy edit and each one, if broken, would
 * mislead an administrator into an irreversible-looking decision:
 *
 *  1. **Publishing is a swap.** Publishing a version deprecates the incumbent. The confirmation is
 *     the only place anyone is told that, so it must name both versions and must name the state the
 *     incumbent lands in.
 *  2. **Deactivating is not deleting.** A deactivated option stops being offered but still renders on
 *     records that already use it. Copy that read as erasure would stop admins pruning stale lists.
 *  3. **Deleting an option is not on offer at all.** The wire has a `Deleted` option status; this UI
 *     must never send it, because removing a value needs a per-record remap-or-blank decision. The
 *     status map is asserted to hold exactly Active and Deactivated — adding `Deleted` to the
 *     dictionary is the first step towards a UI that sends it.
 *  4. **All four version statuses are translated.** An unmapped status renders the raw wire value.
 *  5. **A read-only set says why.** System-managed sets are refused by the server, not by a UI whim.
 */
import { describe, it, expect } from "vitest";
import { en } from "./option-set.en";
import { ar } from "./option-set.ar";

/**
 * Flattens a nested dictionary to its dotted leaf paths.
 *
 * Deliberately duplicated in each locale test in this module rather than shared: a shared helper
 * would be one more file two parallel agents could both edit, and the function is four lines.
 */
function leafPaths(node: unknown, prefix = ""): string[] {
  if (typeof node !== "object" || node === null) return [prefix];
  return Object.entries(node as Record<string, unknown>).flatMap(([key, value]) =>
    leafPaths(value, prefix ? `${prefix}.${key}` : key)
  );
}

/** Reads a dotted leaf path out of a dictionary, for the per-leaf assertions below. */
function valueAt(dictionary: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>((node, segment) => (node as Record<string, unknown>)[segment], dictionary);
}

describe("optionSet locale parity", () => {
  it("covers exactly the same key set in en and ar", () => {
    expect(leafPaths(ar).sort()).toEqual(leafPaths(en).sort());
  });

  it("has no empty, untrimmed or TODO-marked strings in either language", () => {
    for (const dictionary of [en, ar]) {
      for (const path of leafPaths(dictionary)) {
        const value = valueAt(dictionary, path);
        expect(typeof value, path).toBe("string");
        expect((value as string).trim().length, path).toBeGreaterThan(0);
        expect(value, path).toBe((value as string).trim());
        expect(value, path).not.toMatch(/TODO|FIXME/i);
      }
    }
  });

  it("is actually written in Arabic, not English copied across", () => {
    // Parity only proves the ar dictionary has the right SHAPE. The cheapest way to satisfy it is to
    // copy the English file and rename the export, which passes every other test in this file while
    // shipping English to Arabic users. Requiring Arabic script in every prose leaf closes that.
    //
    // `placeholders` blocks are exempt on purpose: their values are sample inputs demonstrating a
    // FORMAT -- an English label sample, a hex colour, an icon name -- not prose to translate.
    const arabicScript = /[؀-ۿ]/;
    for (const path of leafPaths(ar)) {
      if (path.split(".").includes("placeholders")) continue;
      expect(valueAt(ar, path), path).toMatch(arabicScript);
    }
  });
});

describe("optionSet version statuses", () => {
  it("translates all four FieldVersionStatus members and invents none", () => {
    // The exact member list the backend serialises. A missing key renders the raw wire value; an
    // extra key is dead copy that suggests a status the API cannot return.
    const expected = ["Archived", "Deprecated", "Draft", "Published"];
    expect(Object.keys(en.optionSet.versions.status).sort()).toEqual(expected);
    expect(Object.keys(ar.optionSet.versions.status).sort()).toEqual(expected);
    expect(Object.keys(en.optionSet.versions.statusHint).sort()).toEqual(expected);
    expect(Object.keys(ar.optionSet.versions.statusHint).sort()).toEqual(expected);
  });

  it("gives the four statuses four distinct names in each language", () => {
    for (const dictionary of [en, ar]) {
      const names = Object.values(dictionary.optionSet.versions.status);
      expect(new Set(names).size).toBe(names.length);
    }
  });

  it("tells the reader a deprecated version is still readable, not gone", () => {
    // The one status whose plain-English reading ("removed") is wrong. Records that reference a
    // deprecated version still render, and an admin who believes otherwise will report data loss.
    expect(en.optionSet.versions.statusHint.Deprecated).toMatch(/still readable/i);
    expect(ar.optionSet.versions.statusHint.Deprecated).toContain("لا يزال مقروءًا");
  });
});

describe("optionSet publish confirmation", () => {
  it("names both the incoming and the outgoing version when one is already published", () => {
    // Publishing is a swap, and {current} is the half an admin has not asked for. A translation that
    // dropped it would describe the swap without saying what gets superseded.
    expect(en.optionSet.versions.publishConfirm.description).toContain("{number}");
    expect(en.optionSet.versions.publishConfirm.description).toContain("{current}");
    expect(ar.optionSet.versions.publishConfirm.description).toContain("{number}");
    expect(ar.optionSet.versions.publishConfirm.description).toContain("{current}");
  });

  it("says the incumbent becomes deprecated, using the same word the status badge uses", () => {
    // Asserted against versions.status.Deprecated rather than a hard-coded word, so the confirmation
    // and the badge can never describe the same state with two different terms.
    const enDeprecated = en.optionSet.versions.status.Deprecated.toLowerCase();
    expect(en.optionSet.versions.publishConfirm.description.toLowerCase()).toContain(enDeprecated);
    expect(ar.optionSet.versions.publishConfirm.description).toContain(
      ar.optionSet.versions.status.Deprecated
    );
  });

  it("uses a separate first-publish variant that supersedes nothing", () => {
    // With no incumbent there is nothing to deprecate. Reusing the swap copy would leave a dangling
    // {current} placeholder and claim a deprecation that never happened.
    for (const dictionary of [en, ar]) {
      const first = dictionary.optionSet.versions.publishConfirm.descriptionFirst;
      expect(first).toContain("{number}");
      expect(first).not.toContain("{current}");
      expect(first).not.toBe(dictionary.optionSet.versions.publishConfirm.description);
    }
  });

  it("names the version in the confirmation title", () => {
    expect(en.optionSet.versions.publishConfirm.title).toContain("{number}");
    expect(ar.optionSet.versions.publishConfirm.title).toContain("{number}");
  });
});

describe("optionSet item statuses", () => {
  it("offers Active and Deactivated only — never the wire's Deleted", () => {
    // `Deleted` is a real FieldOptionStatus that this UI must never send: removing an option needs a
    // per-value remap-or-blank decision that no screen can take on an admin's behalf. Copy for it is
    // the first thing a well-meaning contributor would add before wiring the action, so its absence
    // is pinned rather than left to review.
    const expected = ["Active", "Deactivated"];
    expect(Object.keys(en.optionSet.items.status).sort()).toEqual(expected);
    expect(Object.keys(ar.optionSet.items.status).sort()).toEqual(expected);
    expect(Object.keys(en.optionSet.items.statusHint).sort()).toEqual(expected);
    expect(Object.keys(ar.optionSet.items.statusHint).sort()).toEqual(expected);
  });

  it("explains that deactivating withdraws the choice without touching existing records", () => {
    expect(en.optionSet.items.deactivateDescription).toMatch(/keep showing it/i);
    expect(en.optionSet.items.deactivateDescription).toMatch(/no stored value changes/i);
    // "السجلات التي تستخدمه بالفعل" = "the records that already use it".
    expect(ar.optionSet.items.deactivateDescription).toContain("السجلات التي تستخدمه بالفعل");
    expect(ar.optionSet.items.deactivateDescription).toContain("لا تتغيّر أي قيمة مخزّنة");
  });

  it("says the same thing on the status hint, where an admin reads it before acting", () => {
    expect(en.optionSet.items.statusHint.Deactivated).toMatch(/already uses it/i);
    expect(ar.optionSet.items.statusHint.Deactivated).toContain("يستخدمه بالفعل");
  });

  it("points someone looking for a delete button at deactivation instead", () => {
    expect(en.optionSet.items.deleteUnavailable).toMatch(/can't be deleted/i);
    expect(en.optionSet.items.deleteUnavailable).toMatch(/deactivate it instead/i);
    // "أوقف الخيار بدلًا من ذلك" = "deactivate the option instead".
    expect(ar.optionSet.items.deleteUnavailable).toContain("لا يمكن حذف الخيارات");
    expect(ar.optionSet.items.deleteUnavailable).toContain("أوقف الخيار بدلًا من ذلك");
  });
});

describe("optionSet items reorder controls", () => {
  it("gives the two move directions distinct accessible names in both languages", () => {
    // These are the accessible names of the buttons that make ordering possible without dragging
    // (WCAG 2.2 SC 2.5.7). Identical names would leave a screen-reader user unable to tell them
    // apart, and the option order is what an end user sees in the dropdown.
    expect(en.optionSet.items.moveUp).not.toBe(en.optionSet.items.moveDown);
    expect(ar.optionSet.items.moveUp).not.toBe(ar.optionSet.items.moveDown);
  });

  it("keeps the move controls distinct from add and remove", () => {
    for (const dictionary of [en, ar]) {
      const items = dictionary.optionSet.items;
      const names = [items.add, items.remove, items.moveUp, items.moveDown];
      expect(new Set(names).size).toBe(names.length);
    }
  });
});

describe("optionSet items validation", () => {
  it("names the offending key on the duplicate-key message", () => {
    // Two options with the same key is the one validation failure an admin cannot locate by eye in a
    // long list, so the message has to carry the key itself.
    expect(en.optionSet.items.validation.duplicateKey).toContain("{key}");
    expect(ar.optionSet.items.validation.duplicateKey).toContain("{key}");
  });

  it("names the cap on the length messages instead of hard-coding a number", () => {
    // The maxima are the backend's (100 for a key, 200 for a label). Interpolating {max} keeps the
    // copy correct if the server's limits ever move.
    for (const dictionary of [en, ar]) {
      expect(dictionary.optionSet.items.validation.keyTooLong).toContain("{max}");
      expect(dictionary.optionSet.items.validation.labelTooLong).toContain("{max}");
    }
  });
});

describe("optionSet read-only sets", () => {
  it("explains a system-managed set as a server refusal, not a missing feature", () => {
    // All five mutating endpoints refuse a system-managed set. A disabled button with no explanation
    // reads as a defect; this copy is the explanation.
    expect(en.optionSet.readOnly.systemManaged.description).toMatch(/refuses every change/i);
    expect(ar.optionSet.readOnly.systemManaged.description).toContain("يرفض الخادم أي تغيير");
  });

  it("explains a platform-owned set as shared-and-readable, not off limits", () => {
    // Reading platform sets and binding to them is the entire point of the seeded reference data, so
    // the copy must not read as a blanket denial.
    expect(en.optionSet.readOnly.platformOwned.description).toMatch(/bind fields to it/i);
    expect(ar.optionSet.readOnly.platformOwned.description).toContain("ربط الحقول بها");
  });
});

describe("optionSet delete confirmation", () => {
  it("names the set being deleted through the {name} placeholder", () => {
    expect(en.optionSet.deleteConfirm).toContain("{name}");
    expect(ar.optionSet.deleteConfirm).toContain("{name}");
  });

  it("warns that the whole version chain goes and that bound fields break", () => {
    // Deleting a set is not the same shape of action as deleting a field group: the versions go with
    // it and any bound field loses the list it resolves choices from.
    expect(en.optionSet.deleteConfirm).toMatch(/every version/i);
    expect(en.optionSet.deleteConfirm).toMatch(/unbind/i);
    expect(ar.optionSet.deleteConfirm).toContain("كل إصداراتها");
    expect(ar.optionSet.deleteConfirm).toContain("أزل ارتباط");
  });
});

describe("optionSet draft lifecycle copy", () => {
  it("distinguishes saving a draft from publishing it, on the success toast", () => {
    // The moment an admin is most likely to assume the change went live is the moment the save
    // succeeds, so the toast repeats the distinction rather than saying only "saved".
    expect(en.optionSet.toast.versionSaved).toMatch(/isn't live until you publish/i);
    expect(ar.optionSet.toast.versionSaved).toContain("لن تصبح فعّالة قبل نشرها");
  });

  it("promises nothing changed when a draft save fails — the item list is replaced wholesale", () => {
    expect(en.optionSet.toast.versionSaveFailed).toMatch(/nothing was changed/i);
    expect(ar.optionSet.toast.versionSaveFailed).toContain("لم يتغيّر أي شيء");
  });

  it("promises the published version is untouched when publishing fails", () => {
    expect(en.optionSet.toast.publishFailed).toMatch(/unchanged/i);
    expect(ar.optionSet.toast.publishFailed).toContain("ما زال الإصدار المنشور كما هو");
  });

  it("covers one permission message per backend permission", () => {
    // custom-field-option-sets.view / .create / .update / .delete / .publish / .bind -- six keys,
    // because an action gated on a permission with no message would render an unexplained absence.
    const expected = ["bind", "create", "delete", "publish", "update", "view"];
    expect(Object.keys(en.optionSet.permissions).sort()).toEqual(expected);
    expect(Object.keys(ar.optionSet.permissions).sort()).toEqual(expected);
  });
});

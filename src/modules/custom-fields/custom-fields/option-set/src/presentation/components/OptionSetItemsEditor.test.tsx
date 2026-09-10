/**
 * OptionSetItemsEditor -- the draft option table (P-4)
 *
 * WHY THIS COMPONENT IS THE ONE WORTH TESTING IN ISOLATION
 * -------------------------------------------------------
 * Saving a draft version is a FULL REPLACE: the array this table holds becomes the version's entire
 * contents. So every bug here is a data bug, not a layout bug, and three of them are silent:
 *
 *   1. A reorder that does not renumber `sortOrder` persists a gap or a tie. Nothing errors -- the
 *      list just comes back in an order nobody chose. The assertions below check the EMITTED
 *      `sortOrder` values, not the rendered row numbers, because the rendered number is 1-based
 *      display text and the wire value is what the server stores.
 *   2. A duplicate key that reaches the server is a 400 after the admin has typed a whole list. The
 *      backend compares keys CASE-INSENSITIVELY (its validator refuses a list holding both `u18` and
 *      `U18`), so a check that only caught exact matches would look like it worked.
 *   3. `FieldOptionStatus.Deleted` must never leave this UI. Sending it soft-deletes an option row
 *      while stored values may still point at it, which needs a per-value remap-or-blank decision no
 *      screen is entitled to take.
 *
 * These tests drive a STATEFUL HARNESS rather than a static render, the way
 * MultiSelectCustomFieldControl.test.tsx does: the editor is controlled, so proving that two moves
 * compose (or that a reorder survives an edit) requires actually re-rendering with what the component
 * emitted, exactly as a real caller would.
 *
 * Everything is queried by ROLE AND ACCESSIBLE NAME, never by test id -- which doubles as the a11y
 * assertion: a reorder button with no distinct accessible name would make these queries ambiguous and
 * fail, which is the same failure a screen-reader user would hit.
 *
 * The `column hints` cases go one step further and resolve every `aria-describedby` id back to the
 * element it names. Authoring a hint into the locale files is not rendering it, and an id that
 * resolves to nothing is announced as nothing -- both are silent failures that a query by name would
 * never notice.
 */
import React, { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import {
  OPTION_SET_ITEM_KEY_MAX_LENGTH,
  OPTION_SET_ITEM_LABEL_MAX_LENGTH,
  OptionSetItemsEditor,
  collectOptionSetItemIssues,
  newOptionSetDraftItem,
  toOptionSetDraftItems,
  toOptionSetItemInputs,
  type OptionSetDraftItem,
  type OptionSetItemsEditorProps,
} from "./OptionSetItemsEditor";
// The rules module the table re-exports from. Imported separately so the cases below can state that
// this component holds no second copy of the rules -- see "one rule set for both Save paths" in
// useOptionSetVersionEditor.test.tsx for the other half of that pin.
import * as optionSetItemRules from "../form/optionSetItemRules";
import { OptionSetItem } from "../../domain/entities/OptionSetItem";

// The primitives this table is built from (Input, Label, Button, Badge, Table) all read the Settings
// store for their radius/density/size ladders. Same shape the other control tests in this module mock.
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

// Echoes the key, and APPENDS the interpolation params as JSON -- several assertions below have to
// prove the right values reached `t`, not merely that some translated string rendered. The duplicate
// key message is the load-bearing case: it must name the offending key.
vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) =>
      params ? `${key}:${JSON.stringify(params)}` : key,
    language: "en",
    direction: "ltr",
  }),
}));

/** A working row. `newOptionSetDraftItem()` supplies the unique client-only `rowId`. */
function row(overrides: Partial<OptionSetDraftItem> = {}): OptionSetDraftItem {
  return { ...newOptionSetDraftItem(), ...overrides };
}

/** Props the harness owns and a test may not override. */
type HarnessOverrides = Omit<Partial<OptionSetItemsEditorProps>, "items" | "onItemsChange">;

/**
 * Mounts the editor with real state behind it, and records every array it emits.
 *
 * `emitted` is a log rather than a single spy value because several tests perform TWO interactions
 * and need to prove they composed, which a "last call" assertion cannot distinguish from the second
 * interaction having replayed from the original list.
 */
function renderEditor(initial: OptionSetDraftItem[], overrides: HarnessOverrides = {}) {
  const emitted: OptionSetDraftItem[][] = [];

  function Harness() {
    const [items, setItems] = useState<OptionSetDraftItem[]>(initial);
    return (
      <OptionSetItemsEditor
        items={items}
        onItemsChange={(next) => {
          emitted.push(next);
          setItems(next);
        }}
        isEditable
        {...overrides}
      />
    );
  }

  render(<Harness />);

  return {
    emitted,
    /** The most recent emission. Throws rather than returning undefined on a silent no-op. */
    last: () => {
      const value = emitted[emitted.length - 1];
      if (value === undefined) throw new Error("onItemsChange was never called");
      return value;
    },
  };
}

const keys = (rows: readonly OptionSetDraftItem[]) => rows.map((item) => item.key);
const sortOrders = (rows: readonly OptionSetDraftItem[]) => rows.map((item) => item.sortOrder);

describe("adding and removing rows", () => {
  it("appends a blank Active row that has never been persisted", () => {
    const { last } = renderEditor([row({ key: "high", labelEn: "High" })]);

    fireEvent.click(screen.getByRole("button", { name: "optionSet.items.add" }));

    const next = last();
    expect(next).toHaveLength(2);
    // `id: null` is the fact that decides Remove-vs-Deactivate for this row, so it is asserted
    // rather than assumed.
    expect(next[1]).toMatchObject({ id: null, key: "", labelEn: "", status: "Active" });
    expect(sortOrders(next)).toEqual([0, 1]);
  });

  it("removes only the row whose Remove button was pressed", () => {
    const { last } = renderEditor([
      row({ key: "low", labelEn: "Low" }),
      row({ key: "mid", labelEn: "Mid" }),
      row({ key: "high", labelEn: "High" }),
    ]);

    fireEvent.click(screen.getByRole("button", { name: "optionSet.items.remove 2" }));

    expect(keys(last())).toEqual(["low", "high"]);
    // The survivors close the gap the removed row left, or a full replace would persist 0 and 2.
    expect(sortOrders(last())).toEqual([0, 1]);
  });

  it("offers Remove only for rows that exist nowhere but this session", () => {
    renderEditor([
      row({ id: "enc-persisted", key: "low", labelEn: "Low" }),
      row({ key: "mid", labelEn: "Mid" }),
    ]);

    // Row 1 came from the server: it gets the withdrawal action, never a delete.
    expect(screen.queryByRole("button", { name: "optionSet.items.remove 1" })).toBeNull();
    expect(
      screen.getByRole("button", { name: "optionSet.items.deactivate 1" })
    ).toBeInTheDocument();

    // Row 2 exists only here, so removing it cannot orphan a stored value.
    expect(screen.getByRole("button", { name: "optionSet.items.remove 2" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "optionSet.items.deactivate 2" })).toBeNull();
  });
});

describe("reordering without a drag gesture", () => {
  it("moves a row down and swaps it with its successor", () => {
    const { last } = renderEditor([
      row({ key: "a", labelEn: "A" }),
      row({ key: "b", labelEn: "B" }),
      row({ key: "c", labelEn: "C" }),
    ]);

    fireEvent.click(screen.getByRole("button", { name: "optionSet.items.moveDown 1" }));

    expect(keys(last())).toEqual(["b", "a", "c"]);
  });

  it("moves a row up and swaps it with its predecessor", () => {
    const { last } = renderEditor([
      row({ key: "a", labelEn: "A" }),
      row({ key: "b", labelEn: "B" }),
      row({ key: "c", labelEn: "C" }),
    ]);

    fireEvent.click(screen.getByRole("button", { name: "optionSet.items.moveUp 3" }));

    expect(keys(last())).toEqual(["a", "c", "b"]);
  });

  it("composes two moves against the emitted list, not the original one", () => {
    // The regression this catches: an editor that closed over its initial props would apply the
    // second move to the ORIGINAL array and silently discard the first.
    const { emitted, last } = renderEditor([
      row({ key: "a", labelEn: "A" }),
      row({ key: "b", labelEn: "B" }),
      row({ key: "c", labelEn: "C" }),
    ]);

    fireEvent.click(screen.getByRole("button", { name: "optionSet.items.moveDown 1" }));
    fireEvent.click(screen.getByRole("button", { name: "optionSet.items.moveDown 2" }));

    expect(emitted).toHaveLength(2);
    expect(keys(emitted[0])).toEqual(["b", "a", "c"]);
    expect(keys(last())).toEqual(["b", "c", "a"]);
  });

  it("renumbers sortOrder contiguously from zero, discarding whatever the rows arrived with", () => {
    // Seeded with the sparse values a hand-edited or legacy version can carry. A full replace sends
    // these verbatim, so the editor must overwrite them rather than preserve them.
    const { last } = renderEditor([
      row({ key: "a", labelEn: "A", sortOrder: 5 }),
      row({ key: "b", labelEn: "B", sortOrder: 9 }),
      row({ key: "c", labelEn: "C", sortOrder: 12 }),
    ]);

    fireEvent.click(screen.getByRole("button", { name: "optionSet.items.moveUp 2" }));

    expect(keys(last())).toEqual(["b", "a", "c"]);
    expect(sortOrders(last())).toEqual([0, 1, 2]);
  });

  it("renumbers on a plain text edit too, so the invariant never depends on a reorder", () => {
    const { last } = renderEditor([
      row({ key: "a", labelEn: "A", sortOrder: 40 }),
      row({ key: "b", labelEn: "B", sortOrder: 41 }),
    ]);

    fireEvent.change(screen.getByRole("textbox", { name: "optionSet.items.fields.key 1" }), {
      target: { value: "alpha" },
    });

    expect(keys(last())).toEqual(["alpha", "b"]);
    expect(sortOrders(last())).toEqual([0, 1]);
  });

  it("disables the move that would push a row off the end of the list", () => {
    renderEditor([row({ key: "a", labelEn: "A" }), row({ key: "b", labelEn: "B" })]);

    expect(screen.getByRole("button", { name: "optionSet.items.moveUp 1" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "optionSet.items.moveDown 1" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "optionSet.items.moveUp 2" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "optionSet.items.moveDown 2" })).toBeDisabled();
  });
});

describe("duplicate keys", () => {
  it("refuses two rows with the same key, names the key, and marks both inputs invalid", () => {
    renderEditor([
      row({ key: "high", labelEn: "High" }),
      row({ key: "high", labelEn: "Also high" }),
    ]);

    // Both rows are flagged, not just the second: an admin fixes whichever one is wrong, and marking
    // only the later occurrence points at the wrong row half the time.
    const messages = screen.getAllByText('optionSet.items.validation.duplicateKey:{"key":"high"}');
    expect(messages).toHaveLength(2);

    expect(screen.getByRole("textbox", { name: "optionSet.items.fields.key 1" })).toHaveAttribute(
      "aria-invalid",
      "true"
    );
    expect(screen.getByRole("textbox", { name: "optionSet.items.fields.key 2" })).toHaveAttribute(
      "aria-invalid",
      "true"
    );
  });

  it("refuses keys that differ only by case, because the server does", () => {
    renderEditor([row({ key: "u18", labelEn: "U18" }), row({ key: "U18", labelEn: "Under 18" })]);

    // Each message quotes the key AS TYPED in its own row, so the admin can see which spelling is
    // where -- one shared lowercased string would hide that.
    expect(
      screen.getByText('optionSet.items.validation.duplicateKey:{"key":"u18"}')
    ).toBeInTheDocument();
    expect(
      screen.getByText('optionSet.items.validation.duplicateKey:{"key":"U18"}')
    ).toBeInTheDocument();
  });

  it("clears the refusal once one of the keys is changed", () => {
    // Proves the message is derived from the current list rather than latched on first render.
    renderEditor([row({ key: "high", labelEn: "High" }), row({ key: "high", labelEn: "Also" })]);

    fireEvent.change(screen.getByRole("textbox", { name: "optionSet.items.fields.key 2" }), {
      target: { value: "highest" },
    });

    expect(screen.queryByText(/validation\.duplicateKey/)).toBeNull();
  });

  it("does not call two blank keys duplicates of each other", () => {
    renderEditor([row({ labelEn: "First" }), row({ labelEn: "Second" })]);

    expect(screen.queryByText(/validation\.duplicateKey/)).toBeNull();
    expect(screen.getAllByText("optionSet.items.validation.keyRequired")).toHaveLength(2);
  });
});

describe("withdrawing an option", () => {
  it("deactivates a persisted row instead of deleting it, and can reactivate it", () => {
    const { last } = renderEditor([row({ id: "enc-1", key: "high", labelEn: "High" })]);

    fireEvent.click(screen.getByRole("button", { name: "optionSet.items.deactivate 1" }));
    expect(last()[0].status).toBe("Deactivated");

    // The button swaps rather than disappearing -- withdrawal has to be reversible in the same draft.
    fireEvent.click(screen.getByRole("button", { name: "optionSet.items.reactivate 1" }));
    expect(last()[0].status).toBe("Active");
  });

  it("explains the missing delete only when a row that cannot be deleted is present", () => {
    const { unmount } = render(
      <OptionSetItemsEditor
        items={[row({ key: "new", labelEn: "New" })]}
        onItemsChange={vi.fn()}
        isEditable
      />
    );
    expect(screen.queryByText("optionSet.items.deleteUnavailable")).toBeNull();
    unmount();

    render(
      <OptionSetItemsEditor
        items={[row({ id: "enc-1", key: "old", labelEn: "Old" })]}
        onItemsChange={vi.fn()}
        isEditable
      />
    );
    expect(screen.getByText("optionSet.items.deleteUnavailable")).toBeInTheDocument();
  });
});

describe("never emitting FieldOptionStatus.Deleted", () => {
  it("degrades a loaded Deleted item to Deactivated on the way into the working list", () => {
    const loaded = new OptionSetItem({
      id: "enc-deleted",
      key: "retired",
      labelEn: "Retired",
      labelAr: null,
      color: null,
      iconKey: null,
      sortOrder: 3,
      status: "Deleted",
    });

    const rows = toOptionSetDraftItems([loaded]);

    expect(rows[0].status).toBe("Deactivated");
    // And it survives the trip to the save payload -- the degradation is not undone downstream.
    expect(toOptionSetItemInputs(rows)[0].status).toBe("Deactivated");
  });

  it("carries no Deleted status through any interaction the table offers", () => {
    const { last } = renderEditor([
      row({ id: "enc-1", key: "a", labelEn: "A" }),
      row({ id: "enc-2", key: "b", labelEn: "B" }),
    ]);

    fireEvent.click(screen.getByRole("button", { name: "optionSet.items.deactivate 1" }));
    fireEvent.click(screen.getByRole("button", { name: "optionSet.items.moveDown 1" }));

    expect(last().map((item) => item.status)).toEqual(["Active", "Deactivated"]);
  });
});

describe("the save payload", () => {
  it("trims key and label, drops the client-only fields, and re-derives sortOrder", () => {
    const inputs = toOptionSetItemInputs([
      row({ id: "enc-1", key: "  high  ", labelEn: "  High  ", labelAr: "عالية", sortOrder: 99 }),
      row({ key: "low", labelEn: "Low", color: "#2563eb", iconKey: "flame", sortOrder: 99 }),
    ]);

    expect(inputs).toEqual([
      {
        key: "high",
        labelEn: "High",
        labelAr: "عالية",
        color: null,
        iconKey: null,
        sortOrder: 0,
        status: "Active",
      },
      {
        key: "low",
        labelEn: "Low",
        labelAr: null,
        color: "#2563eb",
        iconKey: "flame",
        sortOrder: 1,
        status: "Active",
      },
    ]);
    // `rowId` and `id` have no property on the request and must not ride along.
    expect(Object.keys(inputs[0])).not.toContain("rowId");
    expect(Object.keys(inputs[0])).not.toContain("id");
  });

  it("trims all five text fields, not only the two the request requires", () => {
    // The colour and the icon key are opaque strings to the backend, so `" amber "` is stored WITH
    // its spaces if the payload passes it through -- and then never matches the `amber` an admin
    // typed on the next version. There is one normalisation for all five fields for that reason.
    const inputs = toOptionSetItemInputs([
      row({
        key: " u18 ",
        labelEn: " Under 18 ",
        labelAr: " تحت 18 ",
        color: " amber ",
        iconKey: " flame ",
      }),
    ]);

    expect(inputs[0]).toEqual({
      key: "u18",
      labelEn: "Under 18",
      labelAr: "تحت 18",
      color: "amber",
      iconKey: "flame",
      sortOrder: 0,
      status: "Active",
    });
  });

  it("sends the value its own length gate measured, not a longer one", () => {
    // At the cap once trimmed, one over it with the spaces attached. A gate that measures the trimmed
    // length while the payload sends the raw string accepts this row here and collects a 400 there.
    const labelAr = `${"ع".repeat(OPTION_SET_ITEM_LABEL_MAX_LENGTH)} `;
    const atTheCap = row({ key: "u18", labelEn: "Under 18", labelAr });

    expect(collectOptionSetItemIssues([atTheCap])).toEqual([]);
    expect(toOptionSetItemInputs([atTheCap])[0].labelAr).toHaveLength(
      OPTION_SET_ITEM_LABEL_MAX_LENGTH
    );
  });

  it("collapses a whitespace-only optional to null, the same spelling of absent as an empty one", () => {
    // `""` is a VALUE to the backend, and so is `"   "`. Both mean "not provided" to an admin.
    const inputs = toOptionSetItemInputs([row({ key: "a", labelEn: "A", color: "   " })]);

    expect(inputs[0].color).toBeNull();
  });

  it("stores an emptied optional field as null, never as the empty string", () => {
    // "" is a VALUE to the backend -- it would mean "this option has a colour, and it is blank".
    const { last } = renderEditor([row({ key: "a", labelEn: "A", color: "#fff" })]);

    fireEvent.change(screen.getByRole("textbox", { name: "optionSet.items.fields.color 1" }), {
      target: { value: "" },
    });

    expect(last()[0].color).toBeNull();
  });
});

describe("collectOptionSetItemIssues", () => {
  // The table re-exports the rules rather than owning them: the new-draft Save lives in
  // OptionSetDetailPanel and the opened-version Save lives in useOptionSetVersionEditor, and a rule
  // that applied to only one of them would be invisible from either side.
  it("is the rules module's own function, not a copy of it", () => {
    expect(collectOptionSetItemIssues).toBe(optionSetItemRules.collectOptionSetItemIssues);
    expect(toOptionSetItemInputs).toBe(optionSetItemRules.toOptionSetItemInputs);
  });

  it("reports the empty list as the publish blocker it is, and nothing else", () => {
    expect(collectOptionSetItemIssues([])).toEqual([
      { rowId: null, field: null, code: "atLeastOne" },
    ]);
  });

  it("reports a missing key and a missing English label independently", () => {
    const only = row({ key: "", labelEn: "" });
    const issues = collectOptionSetItemIssues([only]);

    expect(issues).toEqual([
      { rowId: only.rowId, field: "key", code: "keyRequired" },
      { rowId: only.rowId, field: "labelEn", code: "labelEnRequired" },
    ]);
  });

  it("reports over-length values that a maxLength attribute could never have stopped", () => {
    // Reachable from a loaded version whose data predates the cap; typing cannot get here.
    const long = row({
      key: "k".repeat(OPTION_SET_ITEM_KEY_MAX_LENGTH + 1),
      labelEn: "l".repeat(OPTION_SET_ITEM_LABEL_MAX_LENGTH + 1),
      labelAr: "ع".repeat(OPTION_SET_ITEM_LABEL_MAX_LENGTH + 1),
    });

    expect(collectOptionSetItemIssues([long])).toEqual([
      {
        rowId: long.rowId,
        field: "key",
        code: "keyTooLong",
        params: { max: OPTION_SET_ITEM_KEY_MAX_LENGTH },
      },
      {
        rowId: long.rowId,
        field: "labelEn",
        code: "labelTooLong",
        params: { max: OPTION_SET_ITEM_LABEL_MAX_LENGTH },
      },
      {
        rowId: long.rowId,
        field: "labelAr",
        code: "labelTooLong",
        params: { max: OPTION_SET_ITEM_LABEL_MAX_LENGTH },
      },
    ]);
  });

  it("finds nothing wrong with a valid list", () => {
    expect(
      collectOptionSetItemIssues([
        row({ key: "high", labelEn: "High" }),
        row({ key: "low", labelEn: "Low" }),
      ])
    ).toEqual([]);
  });
});

describe("a version nobody may edit", () => {
  it("renders the options as text, with no inputs and no controls", () => {
    render(
      <OptionSetItemsEditor
        items={[row({ id: "enc-1", key: "high", labelEn: "High", color: null })]}
        onItemsChange={vi.fn()}
        isEditable={false}
        readOnlyNote="Only a draft can be edited."
      />
    );

    expect(screen.queryAllByRole("textbox")).toHaveLength(0);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
    // The values are still readable -- a read-only version shows its options exactly as they were.
    expect(screen.getByText("high")).toBeInTheDocument();
    expect(screen.getByText("High")).toBeInTheDocument();
    // And the caller's sentence says WHY, so a control-free table is not read as a defect.
    expect(screen.getByText("Only a draft can be edited.")).toBeInTheDocument();
  });

  it("withholds the withdrawal notes, which describe actions that are not offered", () => {
    render(
      <OptionSetItemsEditor
        items={[row({ id: "enc-1", key: "high", labelEn: "High" })]}
        onItemsChange={vi.fn()}
        isEditable={false}
      />
    );

    // Asserted FIRST, and the reason is that two `queryByText(...).toBeNull()` calls also hold for a
    // component that rendered nothing at all. This is the row, so the absences below are absences
    // from a table that is really there.
    expect(screen.getByText("high")).toBeInTheDocument();

    expect(screen.queryByText("optionSet.items.deactivateDescription")).toBeNull();
    expect(screen.queryByText("optionSet.items.deleteUnavailable")).toBeNull();
  });

  it("withholds the column hints too -- there is nothing to type and nothing to warn about", () => {
    render(
      <OptionSetItemsEditor
        items={[row({ id: "enc-1", key: "high", labelEn: "High" })]}
        onItemsChange={vi.fn()}
        isEditable={false}
      />
    );

    expect(screen.getByText("high")).toBeInTheDocument();
    expect(screen.queryByText("optionSet.items.fields.keyHint")).toBeNull();
    expect(screen.queryByText("optionSet.items.fields.colorHint")).toBeNull();
    expect(screen.queryByText("optionSet.items.fields.iconKeyHint")).toBeNull();
  });
});

describe("the column hints", () => {
  it("renders the key, colour and icon hints an admin needs before typing", () => {
    renderEditor([row({ key: "high", labelEn: "High" })]);

    // The key hint is the one that matters: it is where an admin is told that renaming a key in a
    // later version orphans the values recorded under the old one.
    expect(screen.getByText("optionSet.items.fields.keyHint")).toBeInTheDocument();
    expect(screen.getByText("optionSet.items.fields.colorHint")).toBeInTheDocument();
    expect(screen.getByText("optionSet.items.fields.iconKeyHint")).toBeInTheDocument();
  });

  it("points each input at its column's hint, so a screen reader reaches it", () => {
    renderEditor([row({ key: "high", labelEn: "High" })]);

    const hinted: [string, string][] = [
      ["optionSet.items.fields.key 1", "optionSet.items.fields.keyHint"],
      ["optionSet.items.fields.color 1", "optionSet.items.fields.colorHint"],
      ["optionSet.items.fields.iconKey 1", "optionSet.items.fields.iconKeyHint"],
    ];

    for (const [inputName, hintText] of hinted) {
      const input = screen.getByRole("textbox", { name: inputName });
      const describedBy = input.getAttribute("aria-describedby");
      expect(describedBy).not.toBeNull();
      // The described-by target must be the hint element itself -- an id that resolves to nothing is
      // announced as nothing, which is the state this replaces.
      const ids = (describedBy as string).split(" ");
      const texts = ids.map((id) => document.getElementById(id)?.textContent);
      expect(texts).toContain(hintText);
    }
  });

  it("puts one accessible name on a hinted input, never two", () => {
    // The hint is a DESCRIPTION. Added as a second `<label>` it would be concatenated into the
    // accessible name, and the field would be announced twice over.
    renderEditor([row({ key: "high", labelEn: "High" })]);

    const key = screen.getByRole("textbox", { name: "optionSet.items.fields.key 1" });
    expect(document.querySelectorAll(`label[for="${key.id}"]`)).toHaveLength(1);
    expect(key).not.toHaveAttribute("aria-label");
    expect(key).not.toHaveAttribute("aria-labelledby");
  });

  it("reads the row's own problem before the column's general explanation", () => {
    renderEditor([row({ key: "", labelEn: "High" })]);

    const key = screen.getByRole("textbox", { name: "optionSet.items.fields.key 1" });
    const ids = (key.getAttribute("aria-describedby") as string).split(" ");

    expect(ids.map((id) => document.getElementById(id)?.textContent)).toEqual([
      "optionSet.items.validation.keyRequired",
      "optionSet.items.fields.keyHint",
    ]);
  });

  it("leaves the label columns undescribed -- their headers already say what they are", () => {
    renderEditor([row({ key: "high", labelEn: "High" })]);

    expect(
      screen.getByRole("textbox", { name: "optionSet.items.fields.labelEn 1" })
    ).not.toHaveAttribute("aria-describedby");
    expect(
      screen.getByRole("textbox", { name: "optionSet.items.fields.labelAr 1" })
    ).not.toHaveAttribute("aria-describedby");
  });
});

describe("the empty list", () => {
  it("offers the add action and states the publish blocker", () => {
    renderEditor([]);

    expect(screen.getByRole("button", { name: "optionSet.items.add" })).toBeEnabled();
    expect(screen.getByText("optionSet.items.validation.atLeastOne")).toBeInTheDocument();
  });
});

describe("a save in flight", () => {
  it("keeps the rows readable while blocking every mutation", () => {
    renderEditor([row({ id: "enc-1", key: "a", labelEn: "A" }), row({ key: "b", labelEn: "B" })], {
      isSaving: true,
    });

    expect(screen.getByRole("textbox", { name: "optionSet.items.fields.key 1" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "optionSet.items.add" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "optionSet.items.moveDown 1" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "optionSet.items.deactivate 1" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "optionSet.items.remove 2" })).toBeDisabled();
  });
});

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import {
  BilingualOptionsEditor,
  parseBilingualOptions,
  serializeBilingualOptions,
} from "./bilingual-options-editor";

/**
 * The bilingual options editor — Wave 5 follow-up.
 *
 * The alignment rules carry the risk here: the two stored lists are positionally aligned, so any
 * operation that changes one length without the other silently shifts every later Arabic label onto
 * the wrong option. Those are asserted directly rather than through the DOM.
 */
describe("parse/serialize round trip", () => {
  it("pairs the two lists positionally", () => {
    const rows = parseBilingualOptions("Small\nMedium\nLarge", "صغير\nمتوسط\nكبير");

    expect(rows).toEqual([
      { en: "Small", ar: "صغير" },
      { en: "Medium", ar: "متوسط" },
      { en: "Large", ar: "كبير" },
    ]);
  });

  it("leaves Arabic empty for options past the end of a partial translation", () => {
    // Partial translation is legal on the server too; the untranslated option falls back to English.
    expect(parseBilingualOptions("Small\nMedium", "صغير")).toEqual([
      { en: "Small", ar: "صغير" },
      { en: "Medium", ar: "" },
    ]);
  });

  it("trims and drops blanks exactly as the server parser does", () => {
    // If this split disagreed with CustomFieldOptionsParser, a client could be rejected for
    // submitting precisely what it was shown.
    expect(parseBilingualOptions("  Small  \n\n Medium \n", " صغير \n\n متوسط ")).toEqual([
      { en: "Small", ar: "صغير" },
      { en: "Medium", ar: "متوسط" },
    ]);
  });

  it("drops a row with no English label, and keeps the remaining pairs aligned", () => {
    // THE ALIGNMENT TRAP. An option with no English label cannot be selected, so it is dropped -- and
    // its Arabic label must be dropped WITH it, or every later translation shifts up one option.
    const { en, ar } = serializeBilingualOptions([
      { en: "Small", ar: "صغير" },
      { en: "", ar: "مهمل" },
      { en: "Large", ar: "كبير" },
    ]);

    expect(en).toBe("Small\nLarge");
    expect(ar).toBe("صغير\nكبير");
  });

  it("emits no Arabic string at all when nothing is translated", () => {
    // So a wholly untranslated field stores null rather than a run of empty lines that would parse
    // back as a ragged list.
    expect(serializeBilingualOptions([{ en: "Small", ar: "" }, { en: "Large", ar: "" }])).toEqual({
      en: "Small\nLarge",
      ar: "",
    });
  });

  it("keeps a blank Arabic entry in the middle so later options stay aligned", () => {
    const { en, ar } = serializeBilingualOptions([
      { en: "Small", ar: "صغير" },
      { en: "Medium", ar: "" },
      { en: "Large", ar: "كبير" },
    ]);

    expect(en).toBe("Small\nMedium\nLarge");
    // The middle entry is an EMPTY LINE, not omitted -- omitting it would make "كبير" label "Medium".
    expect(ar.split("\n")).toEqual(["صغير", "", "كبير"]);
  });

  it("round-trips a serialized pair back to the same rows", () => {
    const rows = [
      { en: "Small", ar: "صغير" },
      { en: "Large", ar: "كبير" },
    ];
    const { en, ar } = serializeBilingualOptions(rows);

    expect(parseBilingualOptions(en, ar)).toEqual(rows);
  });
});

describe("BilingualOptionsEditor", () => {
  const props = {
    labelEn: "English label",
    labelAr: "Arabic label",
    addLabel: "Add option",
    removeLabel: "Remove option",
    emptyHint: "No options yet",
  };

  it("renders one empty row and the hint when nothing is stored", () => {
    render(<BilingualOptionsEditor value="" valueAr="" onChange={vi.fn()} {...props} />);

    expect(screen.getByText("No options yet")).toBeInTheDocument();
    // Always something to type into, even with nothing stored.
    expect(screen.getByLabelText("English label 1")).toBeInTheDocument();
  });

  it("writes BOTH halves when an Arabic label is typed", () => {
    const onChange = vi.fn();
    render(
      <BilingualOptionsEditor value="Small" valueAr="" onChange={onChange} {...props} />
    );

    fireEvent.change(screen.getByLabelText("Arabic label 1"), { target: { value: "صغير" } });

    // The English half travels with it -- the two lists are written together or not at all.
    expect(onChange).toHaveBeenCalledWith({ en: "Small", ar: "صغير" });
  });

  it("adds a row without disturbing the existing ones", () => {
    const onChange = vi.fn();
    render(
      <BilingualOptionsEditor value="Small" valueAr="صغير" onChange={onChange} {...props} />
    );

    fireEvent.click(screen.getByRole("button", { name: "Add option" }));

    // The new row has no English label yet, so serialisation drops it -- the stored value is
    // unchanged until the user types, which is correct for an option with no label.
    expect(onChange).toHaveBeenCalledWith({ en: "Small", ar: "صغير" });
  });

  it("removes the right row and re-aligns the Arabic list", () => {
    const onChange = vi.fn();
    render(
      <BilingualOptionsEditor
        value={"Small\nMedium\nLarge"}
        valueAr={"صغير\nمتوسط\nكبير"}
        onChange={onChange}
        {...props}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Remove option 2" }));

    // Both lists lose their MIDDLE entry together.
    expect(onChange).toHaveBeenCalledWith({ en: "Small\nLarge", ar: "صغير\nكبير" });
  });

  it("does not allow removing the last remaining row", () => {
    render(<BilingualOptionsEditor value="Small" valueAr="" onChange={vi.fn()} {...props} />);

    expect(screen.getByRole("button", { name: "Remove option 1" })).toBeDisabled();
  });

  it("pins the Arabic input to RTL even while the surrounding UI is English", () => {
    // The box holds Arabic by definition, so its direction is a property of its CONTENT, not of the
    // app's current language.
    render(<BilingualOptionsEditor value="Small" valueAr="" onChange={vi.fn()} {...props} />);

    expect(screen.getByLabelText("Arabic label 1")).toHaveAttribute("dir", "rtl");
    expect(screen.getByLabelText("English label 1")).toHaveAttribute("dir", "ltr");
  });

  it("hides the add and remove affordances when read-only", () => {
    render(
      <BilingualOptionsEditor value="Small" valueAr="" onChange={vi.fn()} readOnly {...props} />
    );

    expect(screen.queryByRole("button", { name: "Add option" })).not.toBeInTheDocument();
  });
});

// DatePicker / CustomCalendar -- the day grid must be reachable by keyboard.
//
// THE BUG THESE PIN. The grid uses a roving tabindex: `tabIndex={isFocused ? 0
// : -1}`, where `isFocused` derived from `focusedDate` (starts null) or
// `isSelected`. For an EMPTY Date/DateTime field neither holds for any cell, so
// every one of them rendered tabIndex={-1} -- the grid had zero tab stops.
// Nothing focused the panel on open either, and DatePicker portals it to
// document.body, so Tab from the field went to the page behind the calendar.
// CustomCalendar's window keydown listener only reacts to targets already
// inside the calendar, which nothing could ever become. An empty date field was
// not settable by keyboard at all.
//
// A second, quieter defect: `focusedDate === day` compared day NUMBERS with no
// regard for month, so a focusedDate of 3 lit both the current month's 3rd and
// the trailing "3" borrowed from the next month -- two tab stops.
//
// Every open below goes through fireEvent.keyDown. A click-based test cannot
// see any of this: clicking a day cell works fine whether or not the grid is
// ever focusable.
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { DatePicker } from "../date-picker";
import { CustomCalendar } from "../custom-calendar";

vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({
    calendarStyle: "default",
    datePickerStyle: "default",
    borderRadius: "default",
    inputStyle: "default",
  }),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    language: "en",
    direction: "ltr",
  }),
}));

if (typeof Element.prototype.scrollIntoView !== "function") {
  Element.prototype.scrollIntoView = () => {};
}

/** The current-month day cells, i.e. the ones eligible to hold the tab stop. */
function currentMonthCells() {
  return screen.getAllByRole("gridcell").filter((cell) => !cell.hasAttribute("data-other-month"));
}

function tabStops() {
  return screen.getAllByRole("gridcell").filter((cell) => cell.tabIndex === 0);
}

/** Opens the panel the way a keyboard-only user does -- never with a click. */
function openByKeyboard(name = "common.selectDate") {
  const trigger = screen.getByRole("combobox", { name: new RegExp(name) });
  fireEvent.keyDown(trigger, { key: "Enter" });
  return trigger;
}

describe("DatePicker keyboard reachability", () => {
  it("gives an EMPTY field's grid exactly one tab stop, and it is today", () => {
    render(<DatePicker id="d" value="" onChange={vi.fn()} />);
    openByKeyboard();

    const stops = tabStops();
    expect(stops).toHaveLength(1);
    expect(stops[0]).toHaveAttribute("data-day", String(new Date().getDate()));
    expect(stops[0].hasAttribute("data-other-month")).toBe(false);
  });

  it("moves focus INTO that cell on open -- tabIndex alone is not enough for a body portal", () => {
    render(<DatePicker id="d" value="" onChange={vi.fn()} />);
    openByKeyboard();

    expect(tabStops()[0]).toHaveFocus();
  });

  it("seeds the tab stop to the SELECTED day when the field has a value", () => {
    // Parsed exactly the way the component parses it, so the assertion holds in
    // any timezone.
    const value = "2026-03-15";
    const expectedDay = String(new Date(value).getDate());

    render(<DatePicker id="d" value={value} onChange={vi.fn()} />);
    openByKeyboard();

    const stops = tabStops();
    expect(stops).toHaveLength(1);
    expect(stops[0]).toHaveAttribute("data-day", expectedDay);
    expect(stops[0]).toHaveFocus();
  });

  it("never puts a second tab stop on a borrowed other-month cell", () => {
    // The old `focusedDate === day` match was by day NUMBER only, so any month
    // whose trailing cells repeat a low day number produced two tab stops.
    render(<DatePicker id="d" value="2026-03-03" onChange={vi.fn()} />);
    openByKeyboard();

    expect(tabStops()).toHaveLength(1);
    for (const cell of screen.getAllByRole("gridcell")) {
      if (cell.hasAttribute("data-other-month")) expect(cell.tabIndex).toBe(-1);
    }
  });

  it("keeps the tab stop on a SELECTABLE day when the preferred one is blocked", () => {
    // A disabled <button> is not focusable, so a roving target parked on a
    // blocked day would leave the grid unreachable again. Block everything
    // before the 20th of the shown month.
    render(<DatePicker id="d" value="2026-03-05" minDate="2026-03-20" onChange={vi.fn()} />);
    openByKeyboard();

    const stops = tabStops();
    expect(stops).toHaveLength(1);
    expect(stops[0]).not.toBeDisabled();
    expect(Number(stops[0].getAttribute("data-day"))).toBeGreaterThanOrEqual(20);
    expect(stops[0]).toHaveFocus();
  });

  it("still has exactly one tab stop when EVERY day in view is blocked", () => {
    // Deterministic-state check: the grid must not end up with zero or many tab
    // stops just because nothing in the month is selectable. The header and
    // footer controls remain the way out.
    render(<DatePicker id="d" value="2026-03-05" onChange={vi.fn()} isDateDisabled={() => true} />);
    openByKeyboard();

    expect(tabStops()).toHaveLength(1);
  });

  it("keeps DOM focus with the tab stop as the arrows move it", () => {
    // datetime-local so that arrow navigation does not also commit and close.
    const onChange = vi.fn();
    render(
      <DatePicker id="d" type="datetime-local" value="2026-03-15T10:00" onChange={onChange} />
    );
    openByKeyboard();

    const before = tabStops()[0];
    expect(before).toHaveFocus();
    const dayBefore = Number(before.getAttribute("data-day"));

    fireEvent.keyDown(before, { key: "ArrowRight" });

    const after = tabStops()[0];
    expect(Number(after.getAttribute("data-day"))).toBe(dayBefore + 1);
    expect(after).toHaveFocus();
    // The old cell must have given the tab stop up, not kept a duplicate.
    expect(tabStops()).toHaveLength(1);
  });

  it("does not open on a disabled field", () => {
    render(<DatePicker id="d" value="" disabled onChange={vi.fn()} />);
    const trigger = screen.getByRole("combobox");
    fireEvent.keyDown(trigger, { key: "Enter" });

    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });
});

describe("CustomCalendar autoFocus contract", () => {
  it("does NOT take focus when rendered inline (the Settings preview stage)", () => {
    // One consumer renders this calendar permanently as page content. Grabbing
    // focus on mount there would hijack the page on every visit, which is why
    // autoFocus is opt-in and defaults to false.
    render(
      <>
        <button type="button">page control</button>
        <CustomCalendar value="" onChange={vi.fn()} />
      </>
    );
    const outside = screen.getByRole("button", { name: "page control" });
    outside.focus();

    expect(outside).toHaveFocus();
    // ...but the grid is still reachable by Tab, which is the other half of the
    // fix: a tab stop exists whether or not anything auto-focused.
    expect(tabStops()).toHaveLength(1);
  });

  it("takes focus when explicitly asked to", () => {
    render(<CustomCalendar value="" onChange={vi.fn()} autoFocus />);
    expect(tabStops()[0]).toHaveFocus();
  });

  it("exposes a tab stop for an empty value with no autoFocus at all", () => {
    render(<CustomCalendar value="" onChange={vi.fn()} />);
    const stops = tabStops();
    expect(stops).toHaveLength(1);
    expect(stops[0]).toHaveAttribute("data-day", String(new Date().getDate()));
    expect(currentMonthCells()).toContain(stops[0]);
  });
});

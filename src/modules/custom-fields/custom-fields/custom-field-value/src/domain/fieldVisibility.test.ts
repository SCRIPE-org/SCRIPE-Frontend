import { describe, it, expect } from "vitest";
import { isFieldVisible, type FieldVisibilityRuleData } from "./fieldVisibility";

/**
 * Client-side visibility evaluation — Wave 5 row 5.3 slice 7.
 *
 * Dense on purpose: this is a pure function, so it is the one part of slice 7 that can be tested
 * exhaustively, and it mirrors a backend evaluator whose own semantics were settled by 11 mutations.
 * Where the two must agree, the assertion says so.
 */
describe("isFieldVisible", () => {
  const rule = (
    operandFieldKey: string,
    operator: string,
    value?: unknown,
    priority = 0
  ): FieldVisibilityRuleData => ({ operandFieldKey, operator, value, priority });

  /** Reads from a plain object, like the form state does. */
  const from =
    (values: Record<string, unknown>) =>
    (key: string): unknown =>
      key in values ? values[key] : undefined;

  it("shows a field with no rules", () => {
    // The overwhelmingly common case, and it must stay free: no rules means visible, full stop.
    expect(isFieldVisible(undefined, from({}))).toBe(true);
    expect(isFieldVisible(null, from({}))).toBe(true);
    expect(isFieldVisible([], from({}))).toBe(true);
  });

  it("shows the field when the condition is met and hides it otherwise", () => {
    const rules = [rule("status", "equals", "terminated")];
    expect(isFieldVisible(rules, from({ status: "terminated" }))).toBe(true);
    expect(isFieldVisible(rules, from({ status: "active" }))).toBe(false);
  });

  it("compares text case-insensitively and trimmed, matching the backend", () => {
    const rules = [rule("status", "equals", "Terminated")];
    expect(isFieldVisible(rules, from({ status: "  terminated " }))).toBe(true);
  });

  it("hides when the operand is absent, except for isEmpty and notEquals", () => {
    // An absent operand satisfies nothing it is compared FOR, but it genuinely IS empty and genuinely
    // IS not-equal to anything — the same reading the backend takes.
    expect(isFieldVisible([rule("status", "equals", "x")], from({}))).toBe(false);
    expect(isFieldVisible([rule("status", "greaterThan", 1)], from({}))).toBe(false);
    expect(isFieldVisible([rule("status", "isEmpty")], from({}))).toBe(true);
    expect(isFieldVisible([rule("status", "notEquals", "x")], from({}))).toBe(true);
  });

  it("treats blank strings and empty collections as empty", () => {
    const rules = [rule("tags", "isEmpty")];
    expect(isFieldVisible(rules, from({ tags: "" }))).toBe(true);
    expect(isFieldVisible(rules, from({ tags: "   " }))).toBe(true);
    expect(isFieldVisible(rules, from({ tags: [] }))).toBe(true);
    expect(isFieldVisible(rules, from({ tags: [null, "  "] }))).toBe(true);
    expect(isFieldVisible(rules, from({ tags: ["a"] }))).toBe(false);
  });

  it("does not misread a non-empty string as a collection", () => {
    // Kept as a behavioural assertion, but WITHOUT the claim it originally carried. It said the
    // string check must precede the array check "because a string is iterable" — true of the C#
    // evaluator, false here: `Array.isArray` never matches a string, and swapping the two lines
    // fails nothing. Verified by mutation.
    expect(isFieldVisible([rule("s", "isNotEmpty")], from({ s: "abc" }))).toBe(true);
  });

  it("compares booleans whether the form holds a bool or its text form", () => {
    const rules = [rule("flag", "equals", true)];
    expect(isFieldVisible(rules, from({ flag: true }))).toBe(true);
    expect(isFieldVisible(rules, from({ flag: "true" }))).toBe(true);
    expect(isFieldVisible(rules, from({ flag: "True" }))).toBe(true);
    expect(isFieldVisible(rules, from({ flag: false }))).toBe(false);
  });

  it("compares numbers whether the form holds a number or its text form", () => {
    // Form inputs hand back strings even for numeric controls, so this is the normal case, not an edge.
    const rules = [rule("n", "equals", 10)];
    expect(isFieldVisible(rules, from({ n: 10 }))).toBe(true);
    expect(isFieldVisible(rules, from({ n: "10" }))).toBe(true);
    expect(isFieldVisible(rules, from({ n: 11 }))).toBe(false);
  });

  it("orders numbers strictly", () => {
    expect(isFieldVisible([rule("n", "greaterThan", 10)], from({ n: 15 }))).toBe(true);
    expect(isFieldVisible([rule("n", "greaterThan", 10)], from({ n: 10 }))).toBe(false);
    expect(isFieldVisible([rule("n", "lessThan", 10)], from({ n: 5 }))).toBe(true);
  });

  it("never falls back to lexicographic ordering", () => {
    // As text, "9" > "10". As numbers it is not. The backend refuses this fallback and so does this —
    // an unorderable pair hides rather than answering confidently and wrongly.
    expect(isFieldVisible([rule("n", "greaterThan", 10)], from({ n: "9" }))).toBe(false);
    expect(isFieldVisible([rule("n", "greaterThan", 10)], from({ n: "not a number" }))).toBe(false);

    // The case the two assertions above do NOT cover, found by mutation: with a NUMERIC comparand the
    // numeric branch already resolves everything, so a lexicographic fallback further down is
    // unreachable from them. Two plain strings are what actually reach it — and they must hide, not
    // compare alphabetically.
    expect(isFieldVisible([rule("s", "greaterThan", "apple")], from({ s: "banana" }))).toBe(false);
    expect(isFieldVisible([rule("s", "lessThan", "banana")], from({ s: "apple" }))).toBe(false);
  });

  it("compares dates across formats", () => {
    const rules = [rule("d", "equals", "2026-08-19")];
    expect(isFieldVisible(rules, from({ d: "2026-08-19" }))).toBe(true);
    expect(isFieldVisible(rules, from({ d: "2026-08-19T00:00:00.000Z" }))).toBe(true);
    expect(
      isFieldVisible([rule("d", "greaterThan", "2026-01-01")], from({ d: "2026-08-19" }))
    ).toBe(true);
  });

  it("does not probe a numeric operand as a date", () => {
    // A bare number must not switch to date semantics just because some numbers parse as years.
    expect(isFieldVisible([rule("n", "greaterThan", 2020)], from({ n: 2026 }))).toBe(true);
  });

  it("handles in and notIn", () => {
    expect(isFieldVisible([rule("s", "in", ["a", "b"])], from({ s: "B" }))).toBe(true);
    expect(isFieldVisible([rule("s", "in", ["a", "b"])], from({ s: "c" }))).toBe(false);
    expect(isFieldVisible([rule("s", "notIn", ["a", "b"])], from({ s: "c" }))).toBe(true);
    expect(isFieldVisible([rule("s", "notIn", ["a", "b"])], from({ s: "a" }))).toBe(false);
  });

  it("hides on a list operator whose value is not an array", () => {
    // Malformed rather than merely unmatched, so it hides — the fail-closed direction.
    expect(isFieldVisible([rule("s", "in", "a")], from({ s: "a" }))).toBe(false);
  });

  it("hides on an operator this build does not know", () => {
    // A newer backend shipping a ninth operator. Hiding destroys nothing (values are preserved on
    // save) whereas showing would silently defeat a rule an administrator wrote.
    expect(isFieldVisible([rule("s", "matches", "a")], from({ s: "a" }))).toBe(false);
  });

  it("hides when ANY rule is unsatisfied, not only when all are", () => {
    // The combination rule: visibility is the AND of every rule, which makes the feature monotone —
    // adding a rule can only hide more. An OR or first-match reading would let an added rule REVEAL.
    const rules = [rule("status", "equals", "terminated"), rule("region", "equals", "emea")];
    expect(isFieldVisible(rules, from({ status: "terminated", region: "emea" }))).toBe(true);
    expect(isFieldVisible(rules, from({ status: "terminated", region: "apac" }))).toBe(false);
    expect(isFieldVisible(rules, from({ status: "active", region: "emea" }))).toBe(false);
  });

  it("is independent of rule order", () => {
    // AND is commutative, which is why `priority` orders nothing here. If this ever fails, priority
    // has silently acquired precedence semantics that the backend does not give it.
    const a = rule("status", "equals", "terminated", 5);
    const b = rule("region", "equals", "emea", 1);
    const values = from({ status: "active", region: "emea" });
    expect(isFieldVisible([a, b], values)).toBe(isFieldVisible([b, a], values));
  });
});

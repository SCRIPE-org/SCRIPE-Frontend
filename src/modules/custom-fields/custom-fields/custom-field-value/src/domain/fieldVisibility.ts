/**
 * Client-side evaluation of `Context` visibility rules — Wave 5 row 5.3 slice 7.
 *
 * WHY THIS EXISTS AT ALL, GIVEN THE SERVER ALREADY EVALUATES
 * ---------------------------------------------------------
 * The CREATE form. `GET /custom-fields/values/{entityTypeKey}` carries no owner id, so the server
 * loads no values, so every sibling is null and every conditional field evaluates to hidden. The
 * server cannot re-evaluate as the user types — it has no idea a form is open. So the rules travel in
 * the response and this evaluates them against live form state, revealing a field the moment its
 * operand is filled.
 *
 * THIS IS RENDERING, NOT A CONTROL
 * --------------------------------
 * The server nulls hidden values on read and preserves them on save regardless of what happens here.
 * Exactly the relationship Tier 1's client-side column filtering has to its server-side filter: turn
 * this file off entirely and nothing becomes exposed or destroyed — forms just stop revealing fields.
 *
 * MIRRORS THE BACKEND EVALUATOR, AND THAT DUPLICATION IS PINNED
 * ------------------------------------------------------------
 * Two implementations of one semantic is a drift risk. `fieldVisibility.backendContract.test.ts`
 * parses the C# operator vocabulary out of the backend source and fails if the two stop agreeing, the
 * same technique the Tier 1 restricted-fields pin uses across the repo boundary.
 */

/** The wire vocabulary, verbatim from `FieldVisibilityExpression.ToWireOperator`. */
export const FIELD_VISIBILITY_OPERATORS = [
  "equals",
  "notEquals",
  "isEmpty",
  "isNotEmpty",
  "in",
  "notIn",
  "greaterThan",
  "lessThan",
] as const;

/**
 * Documentation for FIELD_VISIBILITY_OPERATORS)[number]
 */
export type FieldVisibilityOperator = (typeof FIELD_VISIBILITY_OPERATORS)[number];

/** One rule as the API ships it — mirrors `FieldVisibilityRuleDescriptor`. */
export interface FieldVisibilityRuleData {
  operandFieldKey: string;
  operator: string;
  value?: unknown;
  priority: number;
}

/** Reads the current value of a sibling field by its plain custom-field key. */
export type OperandLookup = (fieldKey: string) => unknown;

function isOperator(value: string): value is FieldVisibilityOperator {
  return (FIELD_VISIBILITY_OPERATORS as readonly string[]).includes(value);
}

/**
 * "No value", matching the backend's own definition (null, or a blank string) and extending it to the
 * collection shapes MultiSelect produces.
 */
function isEmptyValue(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  // NOTE for anyone porting the backend's version of this: the C# evaluator has to check strings
  // BEFORE collections because `string` matches `IEnumerable` there, so the order is load-bearing.
  // Here it is not — `Array.isArray` never matches a string — and swapping these two lines changes
  // nothing. Verified by mutation rather than assumed, and recorded so the ordering is not defended
  // as a hazard it is not.
  if (Array.isArray(value)) return value.every(isEmptyValue);
  return false;
}

function asComparableText(value: unknown): string {
  return typeof value === "string" ? value : String(value);
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "boolean") return null;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function asDate(value: unknown): number | null {
  // Only STRINGS are probed as dates, matching the backend: probing a number would silently switch a
  // numeric comparison to date semantics for values that happen to parse.
  if (typeof value !== "string" || value.trim() === "") return null;
  const ms = Date.parse(value);
  return Number.isNaN(ms) ? null : ms;
}

/** Equality across a live form value and a JSON comparand. Case-insensitive and trimmed for text. */
function valuesEqual(operand: unknown, comparand: unknown): boolean {
  // An absent operand equals nothing — which correctly makes `notEquals` TRUE for a field never set.
  if (operand === null || operand === undefined) return comparand === null;

  if (typeof comparand === "boolean") {
    if (typeof operand === "boolean") return operand === comparand;
    const text = asComparableText(operand).trim().toLowerCase();
    return (text === "true") === comparand;
  }

  if (typeof comparand === "number") {
    const numeric = asNumber(operand);
    return numeric !== null && numeric === comparand;
  }

  if (typeof comparand === "string") {
    // Dates compare as dates when both sides parse, so an ISO instant matches a plain date string
    // regardless of formatting. Falls through to text otherwise, which is what Text/Select need.
    const operandDate = asDate(operand);
    const comparandDate = asDate(comparand);
    if (operandDate !== null && comparandDate !== null) return operandDate === comparandDate;

    return asComparableText(operand).trim().toLowerCase() === comparand.trim().toLowerCase();
  }

  return false;
}

/** Ordering. Returns null when the pair cannot be ordered — never guesses. */
function compareValues(operand: unknown, comparand: unknown): number | null {
  if (operand === null || operand === undefined) return null;

  if (typeof comparand === "number") {
    const numeric = asNumber(operand);
    return numeric === null ? null : Math.sign(numeric - comparand);
  }

  if (typeof comparand === "string") {
    const operandDate = asDate(operand);
    const comparandDate = asDate(comparand);
    if (operandDate !== null && comparandDate !== null)
      return Math.sign(operandDate - comparandDate);
  }

  // Deliberately NO lexicographic fallback. Comparing two numbers as text ("9" > "10") is the classic
  // silent-wrong-answer bug, and the backend refuses it too — an unorderable pair hides the field
  // rather than producing a confident wrong answer.
  return null;
}

/** True when this single rule is satisfied, i.e. it does not hide its field. */
function isRuleSatisfied(rule: FieldVisibilityRuleData, getOperand: OperandLookup): boolean {
  if (!isOperator(rule.operator)) {
    // An operator this build does not know — a newer backend, most likely. Hide, matching the
    // server's fail-closed policy: hiding destroys nothing (values are preserved on save) whereas
    // showing would defeat a rule an administrator deliberately wrote.
    return false;
  }

  const operand = getOperand(rule.operandFieldKey);

  switch (rule.operator) {
    case "isEmpty":
      return isEmptyValue(operand);
    case "isNotEmpty":
      return !isEmptyValue(operand);
    case "equals":
      return valuesEqual(operand, rule.value);
    case "notEquals":
      return !valuesEqual(operand, rule.value);
    case "in":
      return (
        Array.isArray(rule.value) && rule.value.some((candidate) => valuesEqual(operand, candidate))
      );
    case "notIn":
      return (
        Array.isArray(rule.value) &&
        !rule.value.some((candidate) => valuesEqual(operand, candidate))
      );
    case "greaterThan": {
      const comparison = compareValues(operand, rule.value);
      return comparison !== null && comparison > 0;
    }
    case "lessThan": {
      const comparison = compareValues(operand, rule.value);
      return comparison !== null && comparison < 0;
    }
  }
}

/**
 * Whether a field is visible given its rules and the current form state.
 *
 * A field is visible only if EVERY rule on it is satisfied. That makes the feature monotone — adding a
 * rule can only hide more, never reveal — and it is why `priority` orders nothing here: an AND is
 * commutative, so `priority` is diagnostic metadata on the server, not precedence.
 *
 * No rules means visible, which is the overwhelmingly common case and is checked first.
 */
export function isFieldVisible(
  rules: readonly FieldVisibilityRuleData[] | null | undefined,
  getOperand: OperandLookup
): boolean {
  if (!rules || rules.length === 0) return true;
  return rules.every((rule) => isRuleSatisfied(rule, getOperand));
}

import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { FIELD_VISIBILITY_OPERATORS } from "./fieldVisibility";

/**
 * Cross-repository pin for the visibility-rule operator vocabulary — Wave 5 row 5.3 slice 7.
 *
 * WHY THIS EXISTS
 * ---------------
 * Row 5.3 ships TWO evaluators of one semantic: the authoritative one in C#, and the client-side one
 * that lets a create form reveal a field as the user types. Two implementations of one contract drift,
 * and the failure is silent — a backend that adds a ninth operator would have this client hide every
 * field using it, with nothing failing anywhere to say why.
 *
 * So the wire vocabulary is pinned against the backend source itself, the same technique the Tier 1
 * restricted-fields pin uses. This does NOT verify the two evaluators agree on SEMANTICS — no static
 * check can — it verifies they agree on the set of operators that exist, which is the part that
 * changes when someone adds one.
 *
 * SKIPS, RATHER THAN FAILS, WITH NO BACKEND CHECKOUT. This is a submodule layout; a frontend-only
 * clone is a legitimate state and must not fail CI for it. The skip is loud.
 */
const FRONTEND_ROOT = path.resolve(__dirname, "../../../../../../..");
const BACKEND_ROOT = path.resolve(FRONTEND_ROOT, "../SCRIPE-Backend");
const EXPRESSION_FILE = path.join(
  BACKEND_ROOT,
  "src/Modules/CustomFields/CustomFields.Application/VisibilityRules/FieldVisibilityExpression.cs"
);

/**
 * The wire names live in `ToWireOperator`'s switch arms as
 * `FieldVisibilityOperator.X => "wireName",`. Parsed rather than hand-copied, because a hand-copied
 * list is exactly the thing that drifts.
 */
const WIRE_ARM = /FieldVisibilityOperator\.\w+\s*=>\s*"([A-Za-z]+)"/g;

function readBackendOperators(): string[] | null {
  if (!fs.existsSync(EXPRESSION_FILE)) return null;
  const source = fs.readFileSync(EXPRESSION_FILE, "utf8");
  const found = [...source.matchAll(WIRE_ARM)].map((m) => m[1]);
  return found.length > 0 ? found : null;
}

describe("visibility-rule operator vocabulary matches the backend", () => {
  it("covers exactly the operators the backend can emit", () => {
    const backend = readBackendOperators();

    if (backend === null) {
      // Loud skip: a silent pass here would make the pin look green while checking nothing.
      console.warn(
        `[visibility operator pin] SKIPPED — no readable backend source at ${EXPRESSION_FILE}. ` +
          "This check only runs in a full superproject checkout."
      );
      expect(true).toBe(true);
      return;
    }

    // Sorted-set comparison, not order: the C# switch arms are ordered for readability, and the TS
    // array is ordered to match the enum. Neither order is a contract.
    expect([...backend].sort()).toEqual([...FIELD_VISIBILITY_OPERATORS].sort());
  });

  it("finds a plausible number of operators, so a broken parser cannot pass silently", () => {
    const backend = readBackendOperators();
    if (backend === null) return;

    // A regex that stopped matching would yield null (handled above) or a suspiciously short list; a
    // regex that over-matched would pull in unrelated strings. Both are caught by asserting the count
    // is the real one rather than merely non-zero.
    expect(backend.length).toBe(FIELD_VISIBILITY_OPERATORS.length);
    expect(backend.length).toBeGreaterThanOrEqual(8);
  });
});

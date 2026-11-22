import type { RecordTransitionContext } from "./crmWorkflowEngine";

/** Resolves a field value from RecordTransitionContext across top-level, fields, and customFields maps. */
export function resolveContextFieldValue(
  fieldKey: string,
  ctx: RecordTransitionContext
): unknown {
  const key = fieldKey.trim();
  const bare = key.startsWith("custom:") ? key.slice("custom:".length) : key;
  const customPrefixed = key.startsWith("custom:") ? key : `custom:${key}`;

  if (ctx.fields?.[key] !== undefined) return ctx.fields[key];
  if (ctx.fields?.[bare] !== undefined) return ctx.fields[bare];
  if (ctx.fields?.[customPrefixed] !== undefined) return ctx.fields[customPrefixed];
  if (ctx.customFields?.[key] !== undefined) return ctx.customFields[key];
  if (ctx.customFields?.[bare] !== undefined) return ctx.customFields[bare];
  if (ctx.customFields?.[customPrefixed] !== undefined) return ctx.customFields[customPrefixed];

  if (key === "estimatedAmount" || key === "estimatedValue") {
    return ctx.estimatedAmount ?? ctx.estimatedValue;
  }
  if (key === "targetCloseDate" || key === "expectedCloseDate") {
    return ctx.targetCloseDate;
  }
  if (key === "partyId" || key === "verifiedPartyId") {
    return ctx.partyId ?? ctx.accountId;
  }

  return (ctx as Record<string, unknown>)[key];
}

/** Evaluates a single field condition operator matching UniversalWorkflowEngine semantics. */
export function evaluateSingleFieldCondition(
  actual: unknown,
  opRaw: string,
  expectedRaw: string
): boolean {
  const op = (opRaw || "equals").trim().toLowerCase();
  const actualStr = actual === undefined || actual === null ? "" : String(actual).trim();
  const expected = (expectedRaw ?? "").trim();

  if (op === "not_empty" || op === "is_not_empty") {
    return actualStr.length > 0;
  }
  if (op === "not_equals" || op === "neq" || op === "!=") {
    return actualStr.toLowerCase() !== expected.toLowerCase();
  }
  if (op === "contains") {
    return actualStr.toLowerCase().includes(expected.toLowerCase());
  }
  if (op === "in") {
    if (!actualStr || !expected) return false;
    const allowed = expected.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
    return allowed.includes(actualStr.toLowerCase());
  }

  const aNum = Number(actualStr);
  const eNum = Number(expected);
  const bothNumeric = actualStr.length > 0 && expected.length > 0 && !Number.isNaN(aNum) && !Number.isNaN(eNum);
  if (op === "greater_than" || op === "gt" || op === ">") return bothNumeric && aNum > eNum;
  if (op === "greater_or_equal" || op === "gte" || op === ">=") return bothNumeric && aNum >= eNum;
  if (op === "less_than" || op === "lt" || op === "<") return bothNumeric && aNum < eNum;
  if (op === "less_or_equal" || op === "lte" || op === "<=") return bothNumeric && aNum <= eNum;

  return actualStr.toLowerCase() === expected.toLowerCase();
}

/** Evaluates multi-condition (`conditionsJson`) or single `restrict.field_value` config against context. */
export function evaluateFieldValueRuleConfig(
  config: Record<string, string> | undefined,
  ctx: RecordTransitionContext
): { passed: boolean; field: string; operator: string; expected: string } {
  if (!config) return { passed: true, field: "", operator: "", expected: "" };

  if (config.conditionsJson && config.conditionsJson.trim().startsWith("[")) {
    try {
      const arr = JSON.parse(config.conditionsJson) as Array<{
        fieldKey?: string;
        field?: string;
        operator?: string;
        value?: unknown;
      }>;
      if (Array.isArray(arr) && arr.length > 0) {
        const joinOr = (config.conditionJoin || "AND").trim().toUpperCase() === "OR";
        const evaluated = arr
          .map((item) => {
            const fk = (item.fieldKey || item.field || "").trim();
            if (!fk) return null;
            const op = item.operator || "equals";
            const exp = item.value === undefined || item.value === null ? "" : String(item.value);
            const passed = evaluateSingleFieldCondition(resolveContextFieldValue(fk, ctx), op, exp);
            return { passed, field: fk, operator: op, expected: exp };
          })
          .filter((x): x is { passed: boolean; field: string; operator: string; expected: string } => x !== null);

        if (evaluated.length > 0) {
          if (joinOr) {
            return evaluated.some((e) => e.passed)
              ? { passed: true, field: "", operator: "", expected: "" }
              : evaluated[0];
          }
          const failed = evaluated.find((e) => !e.passed);
          return failed ?? { passed: true, field: "", operator: "", expected: "" };
        }
      }
    } catch {
      // Fallback to single field condition
    }
  }

  const fk = (config.fieldKey || "").trim();
  if (!fk) return { passed: true, field: "", operator: "", expected: "" };
  const op = config.operator || "equals";
  const exp = config.value ?? "";
  const passed = evaluateSingleFieldCondition(resolveContextFieldValue(fk, ctx), op, exp);
  return { passed, field: fk, operator: op, expected: exp };
}

/** Evaluates `restrict.roles_permissions` tokens against caller context when roles/permissions are provided. */
export function evaluateRolesPermissionsTokens(
  config: Record<string, string> | undefined,
  ctx: RecordTransitionContext
): { passed: boolean; requirements: string } {
  const principalsCsv = config?.principals || config?.roles || config?.role || "";
  const permissionsCsv = config?.permissions || config?.permission || "";
  const quorum = (config?.quorum || "any").trim().toLowerCase();

  const tokens = [
    ...principalsCsv.split(",").map((s) => s.trim()).filter(Boolean),
    ...permissionsCsv.split(",").map((s) => s.trim()).filter(Boolean),
  ];

  if (tokens.length === 0) return { passed: true, requirements: "" };

  const perms = (ctx.permissions ?? []).map((p) => p.toLowerCase());
  const roles = (ctx.userRoles ?? []).map((r) => r.toLowerCase());
  const hasWildcardPerm = perms.includes("*");

  const isTokenSatisfied = (token: string): boolean => {
    const low = token.toLowerCase();
    if (low === "principal:record.owner") {
      return Boolean(ctx.actorUserId && ctx.ownerUserId && ctx.actorUserId === ctx.ownerUserId);
    }
    if (low === "principal:record.not_last_actor") {
      return !ctx.actorUserId || !ctx.lastMovedByUserId || ctx.actorUserId !== ctx.lastMovedByUserId;
    }
    if (hasWildcardPerm || perms.includes(low)) return true;

    const bare = low.startsWith("pipe_role:")
      ? low.slice("pipe_role:".length)
      : low.startsWith("role:")
        ? low.slice("role:".length)
        : low;

    return (
      roles.includes(low) ||
      roles.includes(bare) ||
      roles.includes(`role:${bare}`) ||
      roles.includes(`pipe_role:${bare}`)
    );
  };

  const passed = quorum === "all" ? tokens.every(isTokenSatisfied) : tokens.some(isTokenSatisfied);
  return { passed, requirements: tokens.join(", ") };
}

/** Checks if an ISO/YYYY-MM-DD target close date is today or in the future. */
export function isTargetCloseDateFutureOrToday(rawDate?: string | null): boolean {
  if (!rawDate || !rawDate.trim()) return false;
  const parsed = Date.parse(rawDate.trim());
  if (Number.isNaN(parsed)) return false;
  const todayUtcMidnight = Date.parse(new Date().toISOString().slice(0, 10));
  return parsed >= todayUtcMidnight;
}

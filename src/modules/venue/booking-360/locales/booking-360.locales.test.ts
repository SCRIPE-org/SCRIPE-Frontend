import { describe, expect, it } from "vitest";
import { en } from "./booking-360.en";
import { ar } from "./booking-360.ar";

function keys(value: unknown, prefix = ""): string[] {
  if (!value || typeof value !== "object") return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    keys(child, prefix ? `${prefix}.${key}` : key)
  );
}

describe("Booking 360 locales", () => {
  it("keeps English and Arabic keys in parity with native Arabic", () => {
    expect(keys(ar).sort()).toEqual(keys(en).sort());
    expect(JSON.stringify(ar)).toMatch(/[\u0600-\u06ff]/);
  });

  it("defines all refund workflow commercial keys in both English and Arabic", () => {
    expect(en.booking360.commercial.refundRequiredTitle).toBe("Refund Action Required");
    expect(en.booking360.commercial.refundRequiredBadge).toBe("Refund Required");
    expect(en.booking360.commercial.refundedBadge).toBe("Refunded");
    expect(en.booking360.commercial.issueRefundCta).toBe("Issue Refund");

    expect(ar.booking360.commercial.refundRequiredTitle).toBe("مطلوب إجراء استرداد مالي");
    expect(ar.booking360.commercial.refundRequiredBadge).toBe("مطلوب استرداد");
    expect(ar.booking360.commercial.refundedBadge).toBe("مستردة");
    expect(ar.booking360.commercial.issueRefundCta).toBe("إصدار استرداد");
  });
});


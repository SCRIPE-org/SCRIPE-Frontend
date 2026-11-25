import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { en as coreEn } from "@core/locales/en";
import { ar as coreAr } from "@core/locales/ar";
import {
  DEFAULT_PASSWORD_MAX_LENGTH,
  evaluatePasswordPolicy,
  findFirstPolicyViolation,
  mapLegacySetupPolicy,
  mapPasswordPolicyDto,
  type PasswordPolicyModel,
} from "@core/common/password-policy";
import { PasswordWithPolicyField } from "@core/ui/password-policy-field";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    language: "en",
    direction: "ltr",
    t: (key: string, params?: Record<string, string | number>) => {
      if (!params) return key;
      const suffix = Object.entries(params)
        .map(([k, v]) => `${k}=${v}`)
        .join(",");
      return `${key}:${suffix}`;
    },
  }),
}));

describe("PasswordPolicyModel mapping & evaluation", () => {
  it("maps PasswordPolicyDto using requireDigit (and legacy requireNumber) with default maxLength=128", () => {
    const mapped = mapPasswordPolicyDto({
      minLength: 14,
      requireUppercase: true,
      requireLowercase: false,
      requireDigit: true,
      requireSpecial: false,
      historyCount: 5,
      checkBreachedPasswords: true,
      expiryDays: 90,
    });

    expect(mapped).toEqual({
      minLength: 14,
      maxLength: DEFAULT_PASSWORD_MAX_LENGTH,
      requireUppercase: true,
      requireLowercase: false,
      requireNumber: true,
      requireSpecial: false,
      historyCount: 5,
      checkBreachedPasswords: true,
      expiryDays: 90,
    });

    const legacyMapped = mapLegacySetupPolicy({
      passwordMinLength: 10,
      passwordRequireUppercase: true,
      passwordRequireNumber: false,
    });
    expect(legacyMapped).toEqual({
      minLength: 10,
      maxLength: 128,
      requireUppercase: true,
      requireLowercase: false,
      requireNumber: false,
      requireSpecial: false,
      historyCount: 0,
      checkBreachedPasswords: false,
      expiryDays: null,
    });
  });

  it("evaluates ONLY rules enabled in the backend policy (never imposing hidden lowercase/special rules)", () => {
    const policy: PasswordPolicyModel = {
      minLength: 10,
      maxLength: 128,
      requireUppercase: true,
      requireLowercase: false,
      requireNumber: false,
      requireSpecial: false,
      historyCount: 3,
      checkBreachedPasswords: true,
      expiryDays: null,
    };

    const evalResult = evaluatePasswordPolicy("ALLCAPS123", policy);
    expect(evalResult.rules.map((r) => r.key)).toEqual(["minLength", "uppercase"]);
    expect(evalResult.allMet).toBe(true);
    expect(evalResult.strengthTier).toBe("strong");
    expect(findFirstPolicyViolation("ALLCAPS123", policy)).toBeNull();
  });

  it("rejects passwords exceeding maxLength=128 even when all complexity checks pass", () => {
    const policy: PasswordPolicyModel = {
      minLength: 8,
      maxLength: 128,
      requireUppercase: true,
      requireLowercase: true,
      requireNumber: true,
      requireSpecial: false,
      historyCount: 0,
      checkBreachedPasswords: false,
      expiryDays: null,
    };

    const overlong = `Aa1${"x".repeat(126)}`;
    const evaluation = evaluatePasswordPolicy(overlong, policy);
    expect(evaluation.withinMaxLength).toBe(false);
    expect(evaluation.allMet).toBe(false);
    expect(findFirstPolicyViolation(overlong, policy)).toEqual({
      key: "common.passwordPolicy.maxLengthExceeded",
      params: { max: 128 },
    });
  });
});

describe("PasswordWithPolicyField & PasswordPolicyChecklist UI", () => {
  it("renders dynamic checklist rules and governance notices without hardcoded fallbacks", () => {
    const policy: PasswordPolicyModel = {
      minLength: 12,
      maxLength: 128,
      requireUppercase: true,
      requireLowercase: false,
      requireNumber: true,
      requireSpecial: true,
      historyCount: 5,
      checkBreachedPasswords: true,
      expiryDays: 60,
    };

    render(
      <PasswordWithPolicyField
        id="new-password"
        label="New Password"
        value="Abcdefghijk!"
        onValueChange={() => {}}
        policy={policy}
        data-testid="policy-pwd-input"
      />
    );

    expect(screen.getByTestId("policy-pwd-input")).toHaveAttribute("maxLength", "128");
    expect(screen.getByTestId("pwd-rule-minLength")).toHaveAttribute("data-met", "true");
    expect(screen.getByTestId("pwd-rule-uppercase")).toHaveAttribute("data-met", "true");
    expect(screen.queryByTestId("pwd-rule-lowercase")).not.toBeInTheDocument();
    expect(screen.getByTestId("pwd-rule-number")).toHaveAttribute("data-met", "false");
    expect(screen.getByTestId("pwd-rule-special")).toHaveAttribute("data-met", "true");
    expect(screen.getByTestId("pwd-note-history")).toBeInTheDocument();
    expect(screen.getByTestId("pwd-note-breach")).toBeInTheDocument();
    expect(screen.getByTestId("pwd-note-expiry")).toBeInTheDocument();
  });

  it("surfaces explicit fail-closed error and retry action when policy fails to load (never weak 6/8 fallback)", () => {
    const onRetry = vi.fn();

    render(
      <PasswordWithPolicyField
        id="new-password"
        label="New Password"
        value=""
        onValueChange={() => {}}
        policy={null}
        policyError="Failed to resolve policy"
        onRetryPolicy={onRetry}
      />
    );

    expect(screen.getByTestId("password-policy-error")).toHaveTextContent("Failed to resolve policy");
    expect(screen.queryByTestId("password-policy-checklist")).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId("password-policy-retry"));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("maintains full EN/AR parity on common.passwordPolicy keys", () => {
    const enDict = (coreEn.common as Record<string, unknown>).passwordPolicy as Record<
      string,
      string
    >;
    const arDict = (coreAr.common as Record<string, unknown>).passwordPolicy as Record<
      string,
      string
    >;

    expect(Object.keys(arDict).sort()).toEqual(Object.keys(enDict).sort());
    for (const [key, val] of Object.entries(arDict)) {
      expect(val.trim().length, key).toBeGreaterThan(0);
    }
  });
});

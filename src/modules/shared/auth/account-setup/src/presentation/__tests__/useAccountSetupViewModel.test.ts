/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAccountSetupViewModel } from "../viewmodels/useAccountSetupViewModel";
import {
  SetupTokenInfo,
  SetupCustomField,
  AccountActivationResult,
} from "../../domain/entities";

const mockValidateToken = vi.fn<(token: string) => Promise<SetupTokenInfo>>();
const mockGetCustomFields = vi.fn<(token: string) => Promise<SetupCustomField[]>>();
const mockActivateAccount = vi.fn<(req: any) => Promise<AccountActivationResult>>();

vi.mock("@modules/auth/di", () => ({
  getAuthContainer: () => ({
    accountSetupRepository: {
      validateToken: mockValidateToken,
      getCustomFields: mockGetCustomFields,
      activateAccount: mockActivateAccount,
    },
  }),
}));

describe("useAccountSetupViewModel", () => {
  const defaultParams = {
    token: "valid-test-token",
    missingTokenMessage: "Missing token",
    invalidTokenMessage: "Invalid token",
    validationFailedMessage: "Validation failed",
    activationFailedMessage: "Activation failed",
    activationUnexpectedMessage: "Unexpected error",
    passwordValidationMessages: {
      minLength: "At least {{min}} chars",
      hasUpper: "Must have upper",
      hasLower: "Must have lower",
      hasNumber: "Must have number",
      hasSpecial: "Must have special",
      matches: "Must match",
    },
  };

  const sampleTokenData = new SetupTokenInfo({
    isValid: true,
    email: "superadmin@acme.com",
    adminUsername: "acme_admin",
    tenantName: "Acme Sports Academy",
    firstName: "Alexander",
    lastName: "Wright",
    phoneNumber: "+966501234567",
    profileImageUrl: "",
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireNumber: true,
    passwordRequireSpecial: true,
  });

  const sampleCustomFields = [
    new SetupCustomField({
      key: "nationality",
      labelEn: "Nationality",
      valueType: "string",
      isRequired: true,
      sensitivity: 2, // Confidential / Encrypted
      sortOrder: 1,
    }),
    new SetupCustomField({
      key: "emergencyContact",
      labelEn: "Emergency Contact",
      valueType: "string",
      isRequired: false,
      sensitivity: 0,
      sortOrder: 2,
    }),
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockValidateToken.mockResolvedValue(sampleTokenData);
    mockGetCustomFields.mockResolvedValue(sampleCustomFields);
    mockActivateAccount.mockResolvedValue(
      new AccountActivationResult({ success: true, adminUsername: "acme_admin" })
    );
  });

  it("validates token on mount and populates profile and custom fields", async () => {
    const { result } = renderHook(() => useAccountSetupViewModel(defaultParams));

    expect(result.current.pageState).toBe("loading");

    await waitFor(() => {
      expect(result.current.pageState).toBe("valid");
    });

    expect(result.current.tokenData?.adminEmail).toBe("superadmin@acme.com");
    expect(result.current.firstName).toBe("Alexander");
    expect(result.current.lastName).toBe("Wright");
    expect(result.current.phoneNumber).toBe("+966501234567");
    expect(result.current.customFields).toHaveLength(2);
    expect(result.current.currentStep).toBe(1);
  });

  it("evaluates password policies and blocks proceeding until valid", async () => {
    const { result } = renderHook(() => useAccountSetupViewModel(defaultParams));

    await waitFor(() => {
      expect(result.current.pageState).toBe("valid");
    });

    // Initially invalid
    expect(result.current.isPasswordValid).toBe(false);

    act(() => {
      result.current.setPassword("Weak");
      result.current.setConfirmPassword("Weak");
    });

    expect(result.current.isPasswordValid).toBe(false);

    // Try going to next step with weak password
    act(() => {
      result.current.goToNextStep();
    });
    expect(result.current.currentStep).toBe(1); // Stayed on step 1

    // Valid strong password
    act(() => {
      result.current.setPassword("StrongP@ssw0rd123!");
      result.current.setConfirmPassword("StrongP@ssw0rd123!");
    });

    expect(result.current.isPasswordValid).toBe(true);
    expect(result.current.passwordScore).toBe(100);

    // Now go to step 2
    act(() => {
      result.current.goToNextStep();
    });
    expect(result.current.currentStep).toBe(2);
  });

  it("manages step 2 profile edits and advances to step 3", async () => {
    const { result } = renderHook(() => useAccountSetupViewModel(defaultParams));

    await waitFor(() => {
      expect(result.current.pageState).toBe("valid");
    });

    // Advance to step 2
    act(() => {
      result.current.setPassword("StrongP@ssw0rd123!");
      result.current.setConfirmPassword("StrongP@ssw0rd123!");
    });
    act(() => {
      result.current.goToNextStep();
    });
    expect(result.current.currentStep).toBe(2);

    // Modify profile
    act(() => {
      result.current.setFirstName("Tariq");
      result.current.setLastName("Al-Mansoor");
    });
    act(() => {
      result.current.goToNextStep();
    });

    // Has custom fields, so advances to step 3
    expect(result.current.currentStep).toBe(3);
  });

  it("enforces required custom fields before activating", async () => {
    const { result } = renderHook(() => useAccountSetupViewModel(defaultParams));

    await waitFor(() => {
      expect(result.current.pageState).toBe("valid");
    });

    // Advance to step 2
    act(() => {
      result.current.setPassword("StrongP@ssw0rd123!");
      result.current.setConfirmPassword("StrongP@ssw0rd123!");
    });
    act(() => {
      result.current.goToNextStep();
    });
    expect(result.current.currentStep).toBe(2);

    // Advance to step 3
    act(() => {
      result.current.goToNextStep();
    });
    expect(result.current.currentStep).toBe(3);

    // nationality is required and currently empty
    expect(result.current.isAttributesValid).toBe(false);
    expect(result.current.customFieldErrors.nationality).toBe("This field is required");
    expect(result.current.attributesTouched).toBe(false);

    // Attempt activate
    await act(async () => {
      result.current.goToNextStep();
    });
    expect(mockActivateAccount).not.toHaveBeenCalled();
    expect(result.current.attributesTouched).toBe(true);

    // Fill required custom field
    act(() => {
      result.current.setCustomFieldValue("nationality", "Saudi");
    });
    expect(result.current.isAttributesValid).toBe(true);
    expect(result.current.customFieldErrors.nationality).toBeUndefined();

    // Submit activation
    await act(async () => {
      await result.current.activate();
    });

    expect(mockActivateAccount).toHaveBeenCalledWith({
      token: "valid-test-token",
      password: "StrongP@ssw0rd123!",
      confirmPassword: "StrongP@ssw0rd123!",
      firstName: "Alexander",
      lastName: "Wright",
      phoneNumber: "+966501234567",
      profileImageUrl: undefined,
      customFieldValues: {
        nationality: "Saudi",
      },
    });

    expect(result.current.pageState).toBe("success");
    expect(result.current.currentStep).toBe(4);
  });

  it("handles activation failure and retry cleanly restores valid state", async () => {
    mockActivateAccount.mockResolvedValueOnce(
      new AccountActivationResult({ success: false, errorMessage: "Activation server error" })
    );

    const { result } = renderHook(() => useAccountSetupViewModel(defaultParams));

    await waitFor(() => {
      expect(result.current.pageState).toBe("valid");
    });

    // Advance to step 2
    act(() => {
      result.current.setPassword("StrongP@ssw0rd123!");
      result.current.setConfirmPassword("StrongP@ssw0rd123!");
    });
    act(() => {
      result.current.goToNextStep();
    });

    // Advance to step 3
    act(() => {
      result.current.goToNextStep();
    });

    // Set required field
    act(() => {
      result.current.setCustomFieldValue("nationality", "Saudi");
    });

    // Activate - fails
    await act(async () => {
      await result.current.activate();
    });

    expect(result.current.pageState).toBe("error");
    expect(result.current.errorMessage).toBe("Activation server error");
    expect(result.current.currentStep).toBe(3);

    // Click retry
    act(() => {
      result.current.retry();
    });

    expect(result.current.pageState).toBe("valid");
    expect(result.current.errorMessage).toBe("");
    expect(result.current.currentStep).toBe(3);
    expect(result.current.customFieldValues.nationality).toBe("Saudi");
  });

  it("validates avatar file type and size constraints", async () => {
    const { result } = renderHook(() => useAccountSetupViewModel(defaultParams));

    await waitFor(() => {
      expect(result.current.pageState).toBe("valid");
    });

    // Non-image file
    const invalidFile = new File(["dummy content"], "document.pdf", { type: "application/pdf" });
    act(() => {
      result.current.handleAvatarUpload(invalidFile);
    });
    expect(result.current.avatarError).toContain("valid image file");

    // File exceeding 2MB
    const largeFile = new File([new Uint8Array(3 * 1024 * 1024)], "large.png", {
      type: "image/png",
    });
    act(() => {
      result.current.handleAvatarUpload(largeFile);
    });
    expect(result.current.avatarError).toContain("less than 2MB");

    // Remove avatar
    act(() => {
      result.current.removeAvatar();
    });
    expect(result.current.profileImageUrl).toBe("");
    expect(result.current.avatarError).toBeNull();
  });
});

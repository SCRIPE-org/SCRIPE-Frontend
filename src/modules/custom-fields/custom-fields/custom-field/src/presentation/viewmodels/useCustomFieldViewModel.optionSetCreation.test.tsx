/* eslint-disable @typescript-eslint/no-explicit-any */
﻿import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useCustomFieldViewModel } from "./useCustomFieldViewModel";
import { getCustomFieldsContainer } from "../../../../di";

vi.mock("../../../../di", () => ({
  getCustomFieldsContainer: vi.fn(),
}));
vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: () => ({ operationSuccess: vi.fn(), operationError: vi.fn() }),
}));
vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({ t: (key: string) => key, language: "en" }),
}));

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe("useCustomFieldViewModel — option set creation binding", () => {
  const createMock = vi.fn().mockResolvedValue("new-field-id");

  beforeEach(() => {
    createMock.mockClear();
    vi.mocked(getCustomFieldsContainer).mockReturnValue({
      customFieldRepository: {
        getEntityTypes: vi.fn().mockResolvedValue([]),
        getAll: vi.fn().mockResolvedValue({ items: [], totalCount: 0, totalPages: 1 }),
        create: createMock,
        update: vi.fn().mockResolvedValue(undefined),
        delete: vi.fn().mockResolvedValue(undefined),
      } as any,
    } as any);
  });

  it("forwards optionSetVersionId and clears manual options when optionsSource is optionSet", async () => {
    const { result } = renderHook(() => useCustomFieldViewModel(), { wrapper });

    await act(async () => {
      await result.current.vm.createItem({
        entityTypeKey: "party.person",
        key: "jersey_size",
        labelEn: "Jersey Size",
        valueType: "Select",
        optionsSource: "optionSet",
        optionSetVersionId: "encrypted-osv-123",
        options: "S\nM\nL",
        optionsAr: "ص\nم\nك",
      } as any);
    });

    expect(createMock).toHaveBeenCalledTimes(1);
    const payload = createMock.mock.calls[0][0];

    expect(payload.optionSetVersionId).toBe("encrypted-osv-123");
    expect(payload.optionsSource).toBeUndefined();
    expect(payload.options).toBeUndefined();
    expect(payload.optionsAr).toBeUndefined();
  });

  it("does not send optionSetVersionId when optionsSource is custom", async () => {
    const { result } = renderHook(() => useCustomFieldViewModel(), { wrapper });

    await act(async () => {
      await result.current.vm.createItem({
        entityTypeKey: "party.person",
        key: "custom_select",
        labelEn: "Custom Select",
        valueType: "Select",
        optionsSource: "custom",
        optionSetVersionId: "some-id",
        options: "Option 1\nOption 2",
        optionsAr: "خيار 1\nخيار 2",
      } as any);
    });

    expect(createMock).toHaveBeenCalledTimes(1);
    const payload = createMock.mock.calls[0][0];

    expect(payload.optionSetVersionId).toBeUndefined();
    expect(payload.optionsSource).toBeUndefined();
    expect(payload.options).toBe("Option 1\nOption 2");
    expect(payload.optionsAr).toBe("خيار 1\nخيار 2");
  });
});

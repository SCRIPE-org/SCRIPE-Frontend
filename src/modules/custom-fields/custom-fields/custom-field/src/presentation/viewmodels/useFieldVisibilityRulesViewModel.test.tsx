/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  useFieldVisibilityRulesViewModel,
  buildFieldVisibilityExpressionJson,
  parseFieldVisibilityExpressionJson,
} from "./useFieldVisibilityRulesViewModel";

vi.mock("../../../../di", () => ({ getCustomFieldsContainer: vi.fn() }));
vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: () => ({ operationSuccess: vi.fn(), operationError: vi.fn() }),
  toast: { error: vi.fn(), success: vi.fn(), warning: vi.fn(), info: vi.fn() },
}));
vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, string | number>) =>
      params ? `${key} ${Object.values(params).join(" ")}` : key,
    language: "en",
  }),
}));

const permissionState = { granted: new Set<string>() };
vi.mock("@core/hooks/use-permission", () => ({
  usePermission: (permission: string) => permissionState.granted.has(permission),
}));

import { getCustomFieldsContainer } from "../../../../di";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("Expression Serialization & Parsing Helpers", () => {
  it("buildFieldVisibilityExpressionJson creates valid JSON for single-arity operator", () => {
    const json = buildFieldVisibilityExpressionJson({
      operandFieldKey: "status",
      operator: "equals",
      value: "active",
    });
    const parsed = JSON.parse(json);
    expect(parsed).toEqual({
      version: 1,
      visibleWhen: {
        fieldKey: "status",
        operator: "equals",
        value: "active",
      },
    });
  });

  it("buildFieldVisibilityExpressionJson creates valid JSON for zero-arity operator (no value)", () => {
    const json = buildFieldVisibilityExpressionJson({
      operandFieldKey: "notes",
      operator: "isNotEmpty",
    });
    const parsed = JSON.parse(json);
    expect(parsed).toEqual({
      version: 1,
      visibleWhen: {
        fieldKey: "notes",
        operator: "isNotEmpty",
      },
    });
  });

  it("buildFieldVisibilityExpressionJson creates valid JSON for list-arity operator", () => {
    const json = buildFieldVisibilityExpressionJson({
      operandFieldKey: "tier",
      operator: "in",
      value: ["gold", "platinum"],
    });
    const parsed = JSON.parse(json);
    expect(parsed).toEqual({
      version: 1,
      visibleWhen: {
        fieldKey: "tier",
        operator: "in",
        value: ["gold", "platinum"],
      },
    });
  });

  it("parseFieldVisibilityExpressionJson parses valid JSON correctly", () => {
    const json =
      '{"version":1,"visibleWhen":{"fieldKey":"department","operator":"notEquals","value":"HR"}}';
    const parsed = parseFieldVisibilityExpressionJson(json);
    expect(parsed).toEqual({
      version: 1,
      operandFieldKey: "department",
      operator: "notEquals",
      value: "HR",
    });
  });

  it("parseFieldVisibilityExpressionJson gracefully handles unreadable / malformed JSON", () => {
    const json = "{ malformed json ]";
    const parsed = parseFieldVisibilityExpressionJson(json);
    expect(parsed).toBeNull();
  });
});

describe("useFieldVisibilityRulesViewModel", () => {
  let mockRepo: {
    getVisibilityRules: ReturnType<typeof vi.fn>;
    createVisibilityRule: ReturnType<typeof vi.fn>;
    updateVisibilityRule: ReturnType<typeof vi.fn>;
    deleteVisibilityRule: ReturnType<typeof vi.fn>;
    getAll: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    permissionState.granted = new Set([
      "custom-field-visibility-rules.view",
      "custom-field-visibility-rules.create",
      "custom-field-visibility-rules.update",
      "custom-field-visibility-rules.delete",
    ]);

    mockRepo = {
      getVisibilityRules: vi.fn().mockResolvedValue([
        {
          id: "rule-1",
          expressionJson:
            '{"version":1,"visibleWhen":{"fieldKey":"status","operator":"equals","value":"active"}}',
          operandFieldKey: "status",
          operator: "equals",
          priority: 0,
          isUnreadable: false,
        },
      ]),
      createVisibilityRule: vi.fn().mockResolvedValue({ id: "rule-2" }),
      updateVisibilityRule: vi.fn().mockResolvedValue(undefined),
      deleteVisibilityRule: vi.fn().mockResolvedValue(undefined),
      getAll: vi.fn().mockResolvedValue({
        items: [
          { id: "field-1", key: "notes", labelEn: "Notes", isRequired: false },
          { id: "field-2", key: "status", labelEn: "Status", isRequired: false },
          { id: "field-3", key: "category", labelEn: "Category", isRequired: false },
        ],
      }),
    };

    vi.mocked(getCustomFieldsContainer).mockReturnValue({
      customFieldRepository: mockRepo,
    } as any);
  });

  it("queries rules and sibling fields when field is targeted", async () => {
    const { result } = renderHook(() => useFieldVisibilityRulesViewModel(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.openRules({
        id: "field-1",
        key: "notes",
        labelEn: "Notes",
        entityTypeKey: "Admins",
        isRequired: false,
      } as any);
    });

    await waitFor(() => {
      expect(result.current.rules).toHaveLength(1);
    });

    expect(mockRepo.getVisibilityRules).toHaveBeenCalledWith("field-1");
    expect(mockRepo.getAll).toHaveBeenCalledWith({
      entityTypeKey: "Admins",
      page: 1,
      pageSize: 100,
    });
    // Sibling fields filters out the targeted field itself
    expect(result.current.siblingFields).toEqual([
      { id: "field-2", key: "status", labelEn: "Status", isRequired: false },
      { id: "field-3", key: "category", labelEn: "Category", isRequired: false },
    ]);
  });

  it("calls createRule mutation on repository", async () => {
    const { result } = renderHook(() => useFieldVisibilityRulesViewModel(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.openRules({
        id: "field-1",
        key: "notes",
        labelEn: "Notes",
        entityTypeKey: "Admins",
        isRequired: false,
      } as any);
    });

    await waitFor(() => {
      expect(result.current.rules).toHaveLength(1);
    });

    await act(async () => {
      await result.current.createRule(
        '{"version":1,"visibleWhen":{"fieldKey":"category","operator":"equals","value":"vip"}}',
        1
      );
    });

    expect(mockRepo.createVisibilityRule).toHaveBeenCalledWith({
      customFieldId: "field-1",
      expressionJson:
        '{"version":1,"visibleWhen":{"fieldKey":"category","operator":"equals","value":"vip"}}',
      priority: 1,
    });
  });

  it("calls updateRule mutation on repository", async () => {
    const { result } = renderHook(() => useFieldVisibilityRulesViewModel(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.openRules({
        id: "field-1",
        key: "notes",
        labelEn: "Notes",
        entityTypeKey: "Admins",
        isRequired: false,
      } as any);
    });

    await waitFor(() => {
      expect(result.current.rules).toHaveLength(1);
    });

    await act(async () => {
      await result.current.updateRule(
        "rule-1",
        '{"version":1,"visibleWhen":{"fieldKey":"status","operator":"equals","value":"inactive"}}',
        5
      );
    });

    expect(mockRepo.updateVisibilityRule).toHaveBeenCalledWith("rule-1", {
      expressionJson:
        '{"version":1,"visibleWhen":{"fieldKey":"status","operator":"equals","value":"inactive"}}',
      priority: 5,
    });
  });

  it("calls deleteRule mutation on repository", async () => {
    const { result } = renderHook(() => useFieldVisibilityRulesViewModel(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.openRules({
        id: "field-1",
        key: "notes",
        labelEn: "Notes",
        entityTypeKey: "Admins",
        isRequired: false,
      } as any);
    });

    await waitFor(() => {
      expect(result.current.rules).toHaveLength(1);
    });

    await act(async () => {
      await result.current.deleteRule("rule-1");
    });

    expect(mockRepo.deleteVisibilityRule).toHaveBeenCalledWith("rule-1");
  });

  it("respects permission gates correctly", () => {
    permissionState.granted = new Set(["custom-field-visibility-rules.view"]);

    const { result } = renderHook(() => useFieldVisibilityRulesViewModel(), {
      wrapper: createWrapper(),
    });

    expect(result.current.canView).toBe(true);
    expect(result.current.canCreate).toBe(false);
    expect(result.current.canUpdate).toBe(false);
    expect(result.current.canDelete).toBe(false);
  });
});

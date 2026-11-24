/**
 * Template Form Search Params Hydration (Import & Use-as-Template) and Error Handling Tests
 */
import React from "react";
import { fireEvent, render, renderHook, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { registerCustomFieldsExtension } from "@core/crud/customFieldsExtension";

const {
  mockUseParams,
  mockUseSearchParams,
  mockRouterPush,
  mockSuccessToast,
  mockErrorToast,
  mockCreate,
  mockUpdate,
  mockGetById,
} = vi.hoisted(() => ({
  mockUseParams: vi.fn(),
  mockUseSearchParams: vi.fn(),
  mockRouterPush: vi.fn(),
  mockSuccessToast: vi.fn(),
  mockErrorToast: vi.fn(),
  mockCreate: vi.fn(),
  mockUpdate: vi.fn(),
  mockGetById: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: mockUseParams,
  useRouter: () => ({ push: mockRouterPush }),
  useSearchParams: mockUseSearchParams,
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({ t: (key: string) => key, language: "en" }),
}));

vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: () => ({ success: mockSuccessToast, error: mockErrorToast }),
}));

vi.mock("@modules/communication/di", () => ({
  communicationContainer: {
    messageTemplateRepository: {
      getAll: vi.fn().mockResolvedValue({ items: [], totalCount: 0, pageNumber: 1, pageSize: 10 }),
      create: mockCreate,
      update: mockUpdate,
      delete: vi.fn(),
      clone: vi.fn(),
      preview: vi.fn(),
      getById: mockGetById,
    },
  },
}));

vi.mock("@core/crud/components/generic-crud-view", () => ({
  GenericCrudView: () => <div data-testid="templates-crud-view" />,
}));

vi.mock("../components/PreviewDialog", () => ({
  PreviewDialog: () => null,
}));

import { useTemplateFormViewModel } from "../viewmodels/useTemplateFormViewModel";
import { MessageTemplatesView } from "../views/MessageTemplatesView";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useTemplateFormViewModel searchParams hydration in create mode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({});
    mockUseSearchParams.mockReturnValue(new URLSearchParams());
    registerCustomFieldsExtension({
      getFormFields: vi.fn().mockResolvedValue([]),
      saveValues: vi.fn().mockResolvedValue(undefined),
      getBulkColumnValues: vi.fn().mockResolvedValue({ columns: [], valuesByOwnerId: {} }),
      InlineAddTrigger: () => null,
    });
  });

  it("hydrates key, channel, language, subject, body, and description from URL search params when importing or using an email as a template", async () => {
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams({
        key: "imported-welcome",
        channel: "Email",
        language: "ar",
        subject: "مرحباً بك في المنصة",
        body: "<p>أهلاً {{UserName}}</p>",
        description: "Imported Arabic welcome template",
        category: "onboarding",
        imported: "true",
      })
    );

    const wrapper = createWrapper();
    const { result } = renderHook(() => useTemplateFormViewModel(), { wrapper });

    await waitFor(() => {
      expect(result.current.mode).toBe("create");
    });

    expect(result.current.form.key).toBe("imported-welcome");
    expect(result.current.form.channel).toBe("Email");
    expect(result.current.form.language).toBe("ar");
    expect(result.current.form.subject).toBe("مرحباً بك في المنصة");
    expect(result.current.form.body).toBe("<p>أهلاً {{UserName}}</p>");
    expect(result.current.form.description).toBe("Imported Arabic welcome template");
    expect(result.current.form.category).toBe("onboarding");
  });

  it("MessageTemplatesView fires an error toast (never a success toast) when an imported template JSON file is invalid", async () => {
    const Wrapper = createWrapper();
    const { container } = render(
      <Wrapper>
        <MessageTemplatesView />
      </Wrapper>
    );

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeTruthy();

    const invalidFile = new File(["{not-valid-json"], "bad-template.json", {
      type: "application/json",
    });

    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    await waitFor(() => {
      expect(mockErrorToast).toHaveBeenCalledWith({
        title: "messaging.templates.importError",
      });
    });
    expect(mockSuccessToast).not.toHaveBeenCalled();
  });
});

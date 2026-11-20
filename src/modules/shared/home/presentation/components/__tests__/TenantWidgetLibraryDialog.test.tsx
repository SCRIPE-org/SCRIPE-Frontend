import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { TenantWidgetLibraryDialog } from "../tenant-command-center/TenantWidgetLibraryDialog";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    direction: "ltr" as const,
    language: "en" as const,
    isRtl: false,
    setLanguage: vi.fn(),
  }),
}));

vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({
    buttonStyle: "default",
    borderRadius: "default",
    animationLevel: "default",
  }),
}));

describe("TenantWidgetLibraryDialog accessibility labels", () => {
  it("provides accessible names for search input and clear button", () => {
    render(
      <TenantWidgetLibraryDialog
        isOpen={true}
        onClose={vi.fn()}
        currentWidgets={[]}
        onAddWidget={vi.fn()}
      />
    );
    const searchInput = screen.getByRole("textbox", {
      name: "tenantCommandCenter.library.searchPlaceholder",
    });
    fireEvent.change(searchInput, { target: { value: "revenue" } });
    const clearBtn = screen.getByRole("button", { name: "common.clear" });
    fireEvent.click(clearBtn);
    expect(searchInput).toHaveValue("");
  });
});

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { FieldVersionHistoryDrawer } from "./FieldVersionHistoryDrawer";
import type { FieldVersionsResponse } from "../../domain/entities/FieldInsight";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      if (params?.defaultValue) return String(params.defaultValue);
      return key;
    },
    language: "en",
  }),
}));

vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({
    switchStyle: "default",
    fontSize: "default",
    inputStyle: "default",
    badgeStyle: "default",
  }),
}));

if (typeof (globalThis as any).ResizeObserver === "undefined") {
  (globalThis as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

describe("FieldVersionHistoryDrawer", () => {
  const target = {
    fieldId: "f-101",
    fieldLabel: "Jersey Number",
    fieldKey: "jerseyNumber",
    entityTypeKey: "Athlete",
  };

  const sampleVersionsData: FieldVersionsResponse = {
    fieldId: "f-101",
    hasDraft: true,
    publishedVersionNumber: 1,
    versions: [
      {
        id: "v-2",
        versionNumber: 2,
        status: "Draft",
        isPlatformOwned: false,
        effectiveFromUtc: null,
        effectiveToUtc: null,
        publishedAtUtc: null,
        optionCount: 3,
        ruleCount: 1,
      },
      {
        id: "v-1",
        versionNumber: 1,
        status: "Published",
        isPlatformOwned: false,
        effectiveFromUtc: "2026-08-01T00:00:00Z",
        effectiveToUtc: null,
        publishedAtUtc: "2026-08-01T00:00:00Z",
        optionCount: 2,
        ruleCount: 0,
      },
    ],
  };

  it("renders drawer with field details and versions timeline", () => {
    render(
      <FieldVersionHistoryDrawer
        isOpen={true}
        onClose={vi.fn()}
        target={target}
        versionsData={sampleVersionsData}
        isLoading={false}
        isCreatingDraft={false}
        isPublishing={false}
        isDiscarding={false}
        canPublish={true}
        onCreateDraft={vi.fn()}
        onPublish={vi.fn()}
        onDiscard={vi.fn()}
      />
    );

    expect(screen.getByText(/Jersey Number/)).toBeInTheDocument();
    expect(screen.getAllByText(/v1/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/v2/).length).toBeGreaterThanOrEqual(1);
  });

  it("calls onPublish when publish draft button is clicked", () => {
    const onPublish = vi.fn();
    render(
      <FieldVersionHistoryDrawer
        isOpen={true}
        onClose={vi.fn()}
        target={target}
        versionsData={sampleVersionsData}
        isLoading={false}
        isCreatingDraft={false}
        isPublishing={false}
        isDiscarding={false}
        canPublish={true}
        onCreateDraft={vi.fn()}
        onPublish={onPublish}
        onDiscard={vi.fn()}
      />
    );

    const publishBtn = screen.getByRole("button", { name: /publish/i });
    fireEvent.click(publishBtn);
    expect(onPublish).toHaveBeenCalled();
  });

  it("calls onDiscard when discard draft button is clicked", () => {
    const onDiscard = vi.fn();
    render(
      <FieldVersionHistoryDrawer
        isOpen={true}
        onClose={vi.fn()}
        target={target}
        versionsData={sampleVersionsData}
        isLoading={false}
        isCreatingDraft={false}
        isPublishing={false}
        isDiscarding={false}
        canPublish={true}
        onCreateDraft={vi.fn()}
        onPublish={vi.fn()}
        onDiscard={onDiscard}
      />
    );

    const discardBtn = screen.getByRole("button", { name: /discard/i });
    fireEvent.click(discardBtn);
    expect(onDiscard).toHaveBeenCalled();
  });

  it("renders create draft button when there is no draft", () => {
    const onCreateDraft = vi.fn();
    const noDraftData: FieldVersionsResponse = {
      fieldId: "f-101",
      hasDraft: false,
      publishedVersionNumber: 1,
      versions: [
        {
          id: "v-1",
          versionNumber: 1,
          status: "Published",
          isPlatformOwned: false,
          effectiveFromUtc: "2026-08-01T00:00:00Z",
          effectiveToUtc: null,
          publishedAtUtc: "2026-08-01T00:00:00Z",
          optionCount: 2,
          ruleCount: 0,
        },
      ],
    };

    render(
      <FieldVersionHistoryDrawer
        isOpen={true}
        onClose={vi.fn()}
        target={target}
        versionsData={noDraftData}
        isLoading={false}
        isCreatingDraft={false}
        isPublishing={false}
        isDiscarding={false}
        canPublish={true}
        onCreateDraft={onCreateDraft}
        onPublish={vi.fn()}
        onDiscard={vi.fn()}
      />
    );

    const createBtn = screen.getByRole("button", { name: /create draft/i });
    fireEvent.click(createBtn);
    expect(onCreateDraft).toHaveBeenCalled();
  });
});

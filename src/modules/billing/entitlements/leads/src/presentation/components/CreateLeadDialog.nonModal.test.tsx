// CreateLeadDialog -- non-modal container (Wave 5 row 5.6)
//
// Design spec §5.4 / pre-plan analysis R2: one of the four hand-rolled
// dialogs that independently reimplemented the nested-modal defect with a
// default-modal outer `<Dialog>` -- it hosts InlineAddCustomFieldDialog
// (now a modal={false} Sheet) via CreateLeadCustomFieldsSection, and a
// modal={true} outer would `hideOthers()` the rest of the document,
// including anything the inline-add trigger opens.
//
// Direct unit render of the dialog itself (react-hook-form owns its
// fields, no external viewmodel dependency), rather than going through the
// full LeadsView page the way CreateLeadCustomFieldsSection.customfields.test.tsx
// does for its own (unrelated) coverage.
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import {
  registerCustomFieldsExtension,
  type CustomFieldsExtensionApi,
} from "@core/crud/customFieldsExtension";
import { CreateLeadDialog } from "./CreateLeadDialog";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({ t: (key: string) => key, language: "en", direction: "ltr" }),
}));

if (typeof (globalThis as any).ResizeObserver === "undefined") {
  (globalThis as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

function registerFakeCustomFieldsExtension(): CustomFieldsExtensionApi {
  const fake: CustomFieldsExtensionApi = {
    getFormFields: vi.fn().mockResolvedValue([]),
    saveValues: vi.fn().mockResolvedValue(undefined),
    getBulkColumnValues: vi.fn().mockResolvedValue({ columns: [], valuesByOwnerId: {} }),
    InlineAddTrigger: () => null,
  };
  registerCustomFieldsExtension(fake);
  return fake;
}

describe("CreateLeadDialog — non-modal container", () => {
  it("renders as a non-modal dialog: a sentinel outside it stays reachable via getByRole while it is open", () => {
    registerFakeCustomFieldsExtension();

    render(
      <div>
        <button type="button">host-page-sentinel</button>
        <CreateLeadDialog
          open
          onClose={vi.fn()}
          onSubmit={vi.fn().mockResolvedValue(undefined)}
          isSubmitting={false}
          availableEditions={[]}
          customFieldConfigs={[]}
          customFieldsLoading={false}
          customFieldValues={{}}
          onCustomFieldChange={vi.fn()}
          onCustomFieldsCreated={vi.fn()}
        />
      </div>
    );

    // If this were still a Radix-default modal={true} Dialog,
    // DialogContentModal's hideOthers(content) would mark the sentinel
    // aria-hidden="true" and getByRole would fail to find it even though
    // it's live DOM (same mechanism core/ui/__tests__/dialog.test.tsx's own
    // comment documents).
    expect(
      screen.getByRole("dialog", { name: "leads.createDialog.title" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "host-page-sentinel" })).toBeInTheDocument();
  });
});

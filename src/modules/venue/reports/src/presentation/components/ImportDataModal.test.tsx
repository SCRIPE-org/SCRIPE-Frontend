import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ImportDataModal } from "./ImportDataModal";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

describe("ImportDataModal customer retry", () => {
  it("offers a retry action for failed customer rows and invokes the owner callback", async () => {
    const onRetryFailedCustomers = vi.fn().mockResolvedValue(undefined);

    render(
      <ImportDataModal
        isOpen
        onClose={vi.fn()}
        importStep={4}
        setImportStep={vi.fn()}
        importType="customers"
        setImportType={vi.fn()}
        parsedTable={null}
        columnMapping={{}}
        setColumnMapping={vi.fn()}
        validationReport={null}
        isCommitting={false}
        importSummaryResult={{ successCount: 1, errorCount: 1, errors: ["Row 3 failed"] }}
        onFileSelect={vi.fn()}
        onExecuteValidation={vi.fn()}
        onCommitImport={vi.fn().mockResolvedValue(undefined)}
        onRetryFailedCustomers={onRetryFailedCustomers}
        onReset={vi.fn()}
        isRtl={false}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "venueReports.import.retryFailedCustomers" }));

    await waitFor(() => expect(onRetryFailedCustomers).toHaveBeenCalledOnce());
  });

  it("does not offer customer retry for court imports", () => {
    render(
      <ImportDataModal
        isOpen
        onClose={vi.fn()}
        importStep={4}
        setImportStep={vi.fn()}
        importType="courts"
        setImportType={vi.fn()}
        parsedTable={null}
        columnMapping={{}}
        setColumnMapping={vi.fn()}
        validationReport={null}
        isCommitting={false}
        importSummaryResult={{ successCount: 1, errorCount: 1, errors: ["Row 3 failed"] }}
        onFileSelect={vi.fn()}
        onExecuteValidation={vi.fn()}
        onCommitImport={vi.fn().mockResolvedValue(undefined)}
        onRetryFailedCustomers={vi.fn().mockResolvedValue(undefined)}
        onReset={vi.fn()}
        isRtl={false}
      />
    );

    expect(
      screen.queryByRole("button", { name: "venueReports.import.retryFailedCustomers" })
    ).not.toBeInTheDocument();
  });
});

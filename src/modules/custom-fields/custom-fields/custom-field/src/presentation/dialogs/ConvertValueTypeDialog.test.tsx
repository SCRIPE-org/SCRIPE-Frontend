import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { ConvertValueTypeDialog } from "./ConvertValueTypeDialog";
import type {
  ChangeFieldTypeResult,
  RollbackFieldTypeChangeResult,
} from "../../domain/entities/FieldInsight";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) =>
      params ? `${key}:${JSON.stringify(params)}` : key,
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

const mockAvailableTargetTypes = [
  "Text",
  "Number",
  "Date",
  "DateTime",
  "LongText",
  "Percent",
  "Rating",
];

describe("ConvertValueTypeDialog", () => {
  it("renders dialog with field details and available target types", () => {
    render(
      <ConvertValueTypeDialog
        open
        onOpenChange={vi.fn()}
        fieldId="f-1"
        fieldLabel="Biography"
        fieldKey="bio"
        currentType="Text"
        availableTargetTypes={mockAvailableTargetTypes}
        selectedTargetType=""
        onSelectTargetType={vi.fn()}
        confirmDataLoss={false}
        onConfirmDataLossChange={vi.fn()}
        conversionKind={null}
        isLossy={false}
        canExecute={false}
        canUpdate={true}
        isConverting={false}
        onExecuteConvert={vi.fn()}
        lastResult={null}
        isRollingBack={false}
        onExecuteRollback={vi.fn()}
        lastRollbackResult={null}
      />
    );

    expect(screen.getAllByText(/Biography/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("bio")).toBeInTheDocument();
    expect(screen.getByText("Text")).toBeInTheDocument();
  });

  it("shows Lossless banner when conversion is lossless", () => {
    render(
      <ConvertValueTypeDialog
        open
        onOpenChange={vi.fn()}
        fieldId="f-1"
        fieldLabel="Biography"
        fieldKey="bio"
        currentType="Text"
        availableTargetTypes={mockAvailableTargetTypes}
        selectedTargetType="LongText"
        onSelectTargetType={vi.fn()}
        confirmDataLoss={false}
        onConfirmDataLossChange={vi.fn()}
        conversionKind="Lossless"
        isLossy={false}
        canExecute={true}
        canUpdate={true}
        isConverting={false}
        onExecuteConvert={vi.fn()}
        lastResult={null}
        isRollingBack={false}
        onExecuteRollback={vi.fn()}
        lastRollbackResult={null}
      />
    );

    expect(
      screen.getByText("customField.convertValueType.kind.lossless")
    ).toBeInTheDocument();
  });

  it("shows Lossy warning and requires confirmation checkbox", () => {
    const onConfirmChange = vi.fn();
    const { rerender } = render(
      <ConvertValueTypeDialog
        open
        onOpenChange={vi.fn()}
        fieldId="f-1"
        fieldLabel="Bio"
        fieldKey="bio"
        currentType="Text"
        availableTargetTypes={mockAvailableTargetTypes}
        selectedTargetType="Number"
        onSelectTargetType={vi.fn()}
        confirmDataLoss={false}
        onConfirmDataLossChange={onConfirmChange}
        conversionKind="Lossy"
        isLossy={true}
        canExecute={false}
        canUpdate={true}
        isConverting={false}
        onExecuteConvert={vi.fn()}
        lastResult={null}
        isRollingBack={false}
        onExecuteRollback={vi.fn()}
        lastRollbackResult={null}
      />
    );

    expect(
      screen.getByText("customField.convertValueType.kind.lossy")
    ).toBeInTheDocument();

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(onConfirmChange).toHaveBeenCalledWith(true);
  });

  it("renders refusal table when dry-run fails with refusals", () => {
    const refusalResult: ChangeFieldTypeResult = {
      applied: false,
      jobRunId: null,
      kind: "Lossy",
      totalScanned: 5,
      converted: 0,
      totalRefusals: 2,
      refusals: [
        { ownerEntityId: "ath-101", reason: "Value 'invalid' cannot parse as Number" },
        { ownerEntityId: "ath-102", reason: "Value 'N/A' cannot parse as Number" },
      ],
    };

    render(
      <ConvertValueTypeDialog
        open
        onOpenChange={vi.fn()}
        fieldId="f-1"
        fieldLabel="Bio"
        fieldKey="bio"
        currentType="Text"
        availableTargetTypes={mockAvailableTargetTypes}
        selectedTargetType="Number"
        onSelectTargetType={vi.fn()}
        confirmDataLoss={true}
        onConfirmDataLossChange={vi.fn()}
        conversionKind="Lossy"
        isLossy={true}
        canExecute={true}
        canUpdate={true}
        isConverting={false}
        onExecuteConvert={vi.fn()}
        lastResult={refusalResult}
        isRollingBack={false}
        onExecuteRollback={vi.fn()}
        lastRollbackResult={null}
      />
    );

    expect(
      screen.getByText("customField.convertValueType.result.refusedTitle")
    ).toBeInTheDocument();
    expect(screen.getByText(/ath-101/)).toBeInTheDocument();
    expect(
      screen.getByText("Value 'invalid' cannot parse as Number")
    ).toBeInTheDocument();
  });

  it("renders rollback action when conversion is applied with jobRunId", () => {
    const appliedResult: ChangeFieldTypeResult = {
      applied: true,
      jobRunId: "job-run-77",
      kind: "Lossless",
      totalScanned: 25,
      converted: 25,
      totalRefusals: 0,
      refusals: [],
    };
    const onExecuteRollback = vi.fn();

    render(
      <ConvertValueTypeDialog
        open
        onOpenChange={vi.fn()}
        fieldId="f-1"
        fieldLabel="Bio"
        fieldKey="bio"
        currentType="Text"
        availableTargetTypes={mockAvailableTargetTypes}
        selectedTargetType="LongText"
        onSelectTargetType={vi.fn()}
        confirmDataLoss={false}
        onConfirmDataLossChange={vi.fn()}
        conversionKind="Lossless"
        isLossy={false}
        canExecute={true}
        canUpdate={true}
        isConverting={false}
        onExecuteConvert={vi.fn()}
        lastResult={appliedResult}
        isRollingBack={false}
        onExecuteRollback={onExecuteRollback}
        lastRollbackResult={null}
      />
    );

    expect(
      screen.getByText("customField.convertValueType.result.appliedTitle")
    ).toBeInTheDocument();

    const rollbackButton = screen.getByText(
      "customField.convertValueType.rollbackButton"
    );
    fireEvent.click(rollbackButton);

    expect(onExecuteRollback).toHaveBeenCalledWith("job-run-77");
  });
});

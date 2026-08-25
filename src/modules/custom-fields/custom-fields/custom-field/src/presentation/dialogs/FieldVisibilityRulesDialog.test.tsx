import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { FieldVisibilityRulesDialog } from "./FieldVisibilityRulesDialog";
import type { FieldVisibilityRuleAdmin } from "../../domain/entities/FieldInsight";
import type { CustomField } from "../../domain/entities/CustomField";
import { makeCustomField } from "../../testSupport/makeCustomField";

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

const mockRules: FieldVisibilityRuleAdmin[] = [
  {
    id: "rule-1",
    expressionJson: '{"version":1,"visibleWhen":{"fieldKey":"department","operator":"equals","value":"Sales"}}',
    operandFieldKey: "department",
    operator: "equals",
    priority: 1,
    isUnreadable: false,
  },
];

// `siblingFields` is `readonly CustomField[]`, and CustomField is a class reading through `data`,
// so a `{ id, key, labelEn }` literal would leave every getter the dialog calls undefined.
const mockSiblings: readonly CustomField[] = [
  makeCustomField({ id: "f-1", key: "department", labelEn: "Department" }),
  makeCustomField({ id: "f-2", key: "role", labelEn: "Role" }),
];

describe("FieldVisibilityRulesDialog", () => {
  it("renders target field header, rules count badge and rules list", () => {
    render(
      <FieldVisibilityRulesDialog
        open
        onOpenChange={vi.fn()}
        fieldId="f-target"
        fieldLabel="Commission Rate"
        fieldKey="commission_rate"
        isRequired={false}
        canView={true}
        canCreate={true}
        canUpdate={true}
        canDelete={true}
        rules={mockRules}
        isRulesLoading={false}
        isRulesError={false}
        onRetryRules={vi.fn()}
        siblingFields={mockSiblings}
        isSiblingFieldsLoading={false}
        onCreateRule={vi.fn()}
        onUpdateRule={vi.fn()}
        onDeleteRule={vi.fn()}
        isCreating={false}
        isUpdating={false}
        isDeleting={false}
      />
    );

    expect(screen.getByText('customField.visibilityRules.title:{"field":"Commission Rate"}')).toBeInTheDocument();
    expect(screen.getByText("Department (department)")).toBeInTheDocument();
    expect(screen.getByText("equals")).toBeInTheDocument();
  });

  it("shows required field warning alert and prevents rule creation if field isRequired", () => {
    render(
      <FieldVisibilityRulesDialog
        open
        onOpenChange={vi.fn()}
        fieldId="f-target"
        fieldLabel="Full Name"
        fieldKey="full_name"
        isRequired={true}
        canView={true}
        canCreate={true}
        canUpdate={true}
        canDelete={true}
        rules={[]}
        isRulesLoading={false}
        isRulesError={false}
        onRetryRules={vi.fn()}
        siblingFields={mockSiblings}
        isSiblingFieldsLoading={false}
        onCreateRule={vi.fn()}
        onUpdateRule={vi.fn()}
        onDeleteRule={vi.fn()}
        isCreating={false}
        isUpdating={false}
        isDeleting={false}
      />
    );

    expect(screen.getByText("customField.visibilityRules.requiredFieldTitle")).toBeInTheDocument();
    expect(screen.queryByText("customField.visibilityRules.addRule")).not.toBeInTheDocument();
  });

  it("opens create rule form, switches to Advanced JSON and submits valid payload", async () => {
    const onCreate = vi.fn().mockResolvedValue(true);

    render(
      <FieldVisibilityRulesDialog
        open
        onOpenChange={vi.fn()}
        fieldId="f-target"
        fieldLabel="Commission Rate"
        fieldKey="commission_rate"
        isRequired={false}
        canView={true}
        canCreate={true}
        canUpdate={true}
        canDelete={true}
        rules={[]}
        isRulesLoading={false}
        isRulesError={false}
        onRetryRules={vi.fn()}
        siblingFields={mockSiblings}
        isSiblingFieldsLoading={false}
        onCreateRule={onCreate}
        onUpdateRule={vi.fn()}
        onDeleteRule={vi.fn()}
        isCreating={false}
        isUpdating={false}
        isDeleting={false}
      />
    );

    const addBtn = screen.getByText("customField.visibilityRules.addRule");
    fireEvent.click(addBtn);

    // Form is now open
    expect(screen.getByText("customField.visibilityRules.addRuleTitle")).toBeInTheDocument();

    const jsonModeToggle = screen.getByText("customField.visibilityRules.advancedJson");
    fireEvent.click(jsonModeToggle);

    const payload = JSON.stringify({
      version: 1,
      visibleWhen: {
        fieldKey: "role",
        operator: "equals",
        value: "Executive",
      },
    });

    const textarea = screen.getByPlaceholderText('{ "version": 1, "visibleWhen": { ... } }');
    fireEvent.change(textarea, { target: { value: payload } });

    const saveBtn = screen.getByText("customField.visibilityRules.saveRule");
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(onCreate).toHaveBeenCalledWith(payload, 0);
    });
  });

  it("triggers onDeleteRule when delete button is clicked and confirmed", async () => {
    const onDelete = vi.fn().mockResolvedValue(true);

    render(
      <FieldVisibilityRulesDialog
        open
        onOpenChange={vi.fn()}
        fieldId="f-target"
        fieldLabel="Commission Rate"
        fieldKey="commission_rate"
        isRequired={false}
        canView={true}
        canCreate={true}
        canUpdate={true}
        canDelete={true}
        rules={mockRules}
        isRulesLoading={false}
        isRulesError={false}
        onRetryRules={vi.fn()}
        siblingFields={mockSiblings}
        isSiblingFieldsLoading={false}
        onCreateRule={vi.fn()}
        onUpdateRule={vi.fn()}
        onDeleteRule={onDelete}
        isCreating={false}
        isUpdating={false}
        isDeleting={false}
      />
    );

    const deleteBtn = screen.getByLabelText("common.delete");
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith("rule-1");
    });
  });
});

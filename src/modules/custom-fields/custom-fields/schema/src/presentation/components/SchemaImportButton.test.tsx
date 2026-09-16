/**
 * SchemaImportButton — the permission gate (Wave 6 row 6.5's import half)
 *
 * WITHHOLDS EXACTLY ONE OF THE TWO REQUIRED PERMISSIONS AT A TIME
 * -----------------------------------------------------------------
 * Granting every permission (or none) cannot prove this button checks BOTH
 * `custom-field-groups.create` AND `custom-fields.create` rather than either one alone, or neither
 * -- this module's own Wave 5.1 postmortem is explicit that a granting-nothing test cannot
 * distinguish the right gate from a gate that always refuses. So each of the two cases below grants
 * exactly one of the two permissions and confirms the button still does not render, which only a
 * genuine AND of both permissions would produce.
 */
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

const hasAllMock = vi.fn();

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    language: "en",
    direction: "ltr",
    setLanguage: () => {},
    registerBothLanguages: () => {},
    markModuleLoaded: () => {},
    isModuleLoaded: () => true,
  }),
}));

vi.mock("@core/hooks/use-permission", () => ({
  usePermissions: () => ({ hasAll: hasAllMock }),
}));

import { SchemaImportButton } from "./SchemaImportButton";
import { CUSTOM_FIELDS_PERMISSIONS } from "../../../../permission-constants";

/** Real `hasAll` semantics (every one of the required permissions must be present). */
function grant(...permissions: string[]) {
  hasAllMock.mockImplementation((required: string[]) =>
    required.every((r) => permissions.includes(r))
  );
}

describe("SchemaImportButton — permission gate", () => {
  it("does not render when neither required permission is granted", () => {
    grant();
    render(<SchemaImportButton />);
    expect(screen.queryByText("schemaImport.openLabel")).not.toBeInTheDocument();
  });

  it("does not render when only custom-field-groups.create is granted -- custom-fields.create is still missing", () => {
    grant(CUSTOM_FIELDS_PERMISSIONS.FIELD_GROUP_CREATE);
    render(<SchemaImportButton />);
    expect(screen.queryByText("schemaImport.openLabel")).not.toBeInTheDocument();
  });

  it("does not render when only custom-fields.create is granted -- custom-field-groups.create is still missing", () => {
    grant(CUSTOM_FIELDS_PERMISSIONS.CUSTOM_FIELD_CREATE);
    render(<SchemaImportButton />);
    expect(screen.queryByText("schemaImport.openLabel")).not.toBeInTheDocument();
  });

  it("renders once BOTH required permissions are granted", () => {
    grant(CUSTOM_FIELDS_PERMISSIONS.FIELD_GROUP_CREATE, CUSTOM_FIELDS_PERMISSIONS.CUSTOM_FIELD_CREATE);
    render(<SchemaImportButton />);
    expect(screen.getByText("schemaImport.openLabel")).toBeInTheDocument();
  });

  it("checks the endpoint's own two permission strings, not a substitute pair", () => {
    grant("something.else", "custom-fields.view");
    render(<SchemaImportButton />);
    expect(screen.queryByText("schemaImport.openLabel")).not.toBeInTheDocument();
  });
});

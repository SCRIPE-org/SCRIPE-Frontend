/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import React from "react";
import { MaskedCustomFieldCell } from "./MaskedCustomFieldCell";
import { registerCustomFieldsExtension } from "../customFieldsExtension";
import { useAppStore } from "@core/store/useAppStore";

describe("MaskedCustomFieldCell", () => {
  const dummyT = (key: string) => {
    if (key === "customField.sensitive.permissionRequired") {
      return "Requires 'custom-fields.view-sensitive' permission";
    }
    if (key === "common.reveal") return "Reveal sensitive value";
    if (key === "common.hide") return "Hide sensitive value";
    return key;
  };

  beforeEach(() => {
    useAppStore.setState({
      permissions: [],
      user: { isSuperAdmin: false } as any,
    });
  });

  it("renders masked placeholder by default", () => {
    render(
      <MaskedCustomFieldCell
        entityTypeKey="admins"
        ownerId="admin-1"
        fieldKey="nationId"
        initialMaskedValue="••••••••"
        valueType="Text"
        language="en"
        t={dummyT}
      />
    );

    expect(screen.getByText("••••••••")).toBeInTheDocument();
  });

  it("disables reveal button and shows permission tooltip when unauthorized", () => {
    const revealValueMock = vi.fn().mockResolvedValue("123456789");
    registerCustomFieldsExtension({
      revealValue: revealValueMock,
    } as any);

    render(
      <MaskedCustomFieldCell
        entityTypeKey="admins"
        ownerId="admin-1"
        fieldKey="nationId"
        initialMaskedValue="••••••••"
        valueType="Text"
        language="en"
        t={dummyT}
      />
    );

    const button = screen.getByRole("button", {
      name: "Requires 'custom-fields.view-sensitive' permission",
    });
    expect(button).toBeDisabled();

    // Clicking when disabled does not call api
    fireEvent.click(button);
    expect(revealValueMock).not.toHaveBeenCalled();
  });

  it("enables reveal button and reveals plaintext when user has permission", async () => {
    useAppStore.setState({
      permissions: ["custom-fields.view-sensitive"],
      user: { isSuperAdmin: false } as any,
    });

    const revealValueMock = vi.fn().mockResolvedValue("EGY-987654321");
    registerCustomFieldsExtension({
      revealValue: revealValueMock,
    } as any);

    render(
      <MaskedCustomFieldCell
        entityTypeKey="admins"
        ownerId="admin-1"
        fieldKey="nationId"
        initialMaskedValue="••••••••"
        valueType="Text"
        language="en"
        t={dummyT}
      />
    );

    const button = screen.getByRole("button", {
      name: "Reveal sensitive value",
    });
    expect(button).not.toBeDisabled();

    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("EGY-987654321")).toBeInTheDocument();
    });

    // Clicking again hides the value
    fireEvent.click(button);
    expect(screen.getByText("••••••••")).toBeInTheDocument();
  });
});

import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CrmEntitySearchSelect } from "./CrmEntitySearchSelect";

const mockSearchEntities = vi.fn();
const mockQuickCreateEntity = vi.fn();

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, string | number>) => {
      if (params?.defaultValue) return String(params.defaultValue);
      return key;
    },
    language: "en",
  }),
}));

vi.mock("../../../../di", () => ({
  getCrmContainer: () => ({
    entityLookup: {
      searchEntities: mockSearchEntities,
      quickCreateEntity: mockQuickCreateEntity,
    },
  }),
}));

describe("CrmEntitySearchSelect & ICrmEntityLookupProvider", () => {
  beforeEach(() => {
    mockSearchEntities.mockReset();
    mockQuickCreateEntity.mockReset();
    mockSearchEntities.mockResolvedValue([
      {
        id: "enc_party_alhilal",
        partyId: "enc_party_alhilal",
        kind: "account",
        label: "Al-Hilal Club",
        description: "VIP · SAR · billing@alhilal.sa",
        isVerified: true,
      },
    ]);
  });

  it("displays initialLabel instead of raw encrypted ID and avoids showing raw IDs in trigger", async () => {
    render(
      <CrmEntitySearchSelect
        entityKind="party"
        value="enc_party_alhilal"
        initialLabel="Al-Hilal Club"
        onChange={vi.fn()}
        data-testid="party-combo"
      />
    );

    expect(await screen.findByText("Al-Hilal Club")).toBeInTheDocument();
    expect(screen.queryByText("enc_party_alhilal")).not.toBeInTheDocument();
    await waitFor(() => {
      expect(mockSearchEntities).toHaveBeenCalledWith(
        expect.objectContaining({ kind: "party" })
      );
    });
  });

  it("creates and immediately selects a record via inline Quick Create modal", async () => {
    const onChange = vi.fn();
    mockQuickCreateEntity.mockResolvedValueOnce({
      id: "enc_contact_new",
      partyId: "enc_party_new",
      contactId: "enc_contact_new",
      kind: "contact",
      label: "Sara Mansour",
      description: "Commercial Director · sara@club.sa",
      isVerified: true,
    });

    render(
      <CrmEntitySearchSelect
        entityKind="party"
        value=""
        onChange={onChange}
        enableQuickCreate
        data-testid="party-combo"
      />
    );

    fireEvent.click(screen.getByTestId("party-combo-quick-create-btn"));
    fireEvent.change(screen.getByTestId("crm-quick-create-name-en"), {
      target: { value: "Sara Mansour" },
    });
    fireEvent.click(screen.getByTestId("crm-quick-create-submit"));

    await waitFor(() => {
      expect(mockQuickCreateEntity).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: "party",
          entitySubKind: "contact",
          nameEn: "Sara Mansour",
        })
      );
      expect(onChange).toHaveBeenCalledWith(
        "enc_party_new",
        expect.objectContaining({ label: "Sara Mansour", partyId: "enc_party_new" })
      );
    });
  });

  it("prefills Quick Create modal with Lead quickCreateInitialValues (accountNameEn/contactNameEn/email/phone)", async () => {
    render(
      <CrmEntitySearchSelect
        entityKind="party"
        value=""
        onChange={vi.fn()}
        enableQuickCreate
        quickCreateDefaultKind="contact"
        quickCreateInitialValues={{
          accountNameEn: "Al-Nassr Commercial",
          contactNameEn: "Sami Al-Jaber",
          email: "sami@alnassr.example",
          phone: "+966500000001",
        }}
        data-testid="party-prefill-combo"
      />
    );

    fireEvent.click(screen.getByTestId("party-prefill-combo-quick-create-btn"));
    const nameInput = screen.getByTestId("crm-quick-create-name-en") as HTMLInputElement;
    expect(nameInput.value).toBe("Sami Al-Jaber");
    expect((screen.getByDisplayValue("sami@alnassr.example") as HTMLInputElement).value).toBe(
      "sami@alnassr.example"
    );
    expect((screen.getByDisplayValue("+966500000001") as HTMLInputElement).value).toBe(
      "+966500000001"
    );
  });
});

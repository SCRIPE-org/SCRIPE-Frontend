// customFieldsExtension — characterization test for the known create/edit/view
// fetch duplication (design doc recon finding #5).
//
// Pins TODAY's behavior (3 independent useCustomFieldsFormFields instances,
// each calling the registered extension's getFormFields with no caching
// between them) as an explicit baseline. This is a characterization test,
// not a correctness test -- it exists so Wave 2's shared-cache fix has a
// concrete "before" number to compare against, and so this call count
// doesn't silently regress further (e.g. a future change accidentally
// causing 4+ calls) before Wave 2 lands.
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { render, waitFor } from "@testing-library/react";
import {
  registerCustomFieldsExtension,
  useCustomFieldsFormFields,
  type CustomFieldsExtensionApi,
} from "./customFieldsExtension";

function HookProbe({ ownerId }: { ownerId?: string }) {
  useCustomFieldsFormFields("party.person", ownerId);
  return null;
}

describe("useCustomFieldsFormFields call count (characterization)", () => {
  let getFormFields: Mock<CustomFieldsExtensionApi["getFormFields"]>;

  beforeEach(() => {
    getFormFields = vi.fn<CustomFieldsExtensionApi["getFormFields"]>().mockResolvedValue([]);
    const api: CustomFieldsExtensionApi = {
      getFormFields,
      saveValues: vi.fn(),
      getBulkColumnValues: vi.fn(),
      InlineAddTrigger: () => null,
    };
    registerCustomFieldsExtension(api);
  });

  it("calls getFormFields once per hook instance, with no sharing across create/edit/view", async () => {
    // Mirrors GenericCrudView's actual usage: one instance for create
    // (ownerId undefined), one for edit, one for view, all for the same
    // entityTypeKey mounted together.
    render(
      <>
        <HookProbe ownerId={undefined} />
        <HookProbe ownerId="owner-1" />
        <HookProbe ownerId="owner-2" />
      </>
    );

    await waitFor(() => expect(getFormFields).toHaveBeenCalledTimes(3));

    expect(getFormFields).toHaveBeenNthCalledWith(1, "party.person", undefined);
    expect(getFormFields).toHaveBeenNthCalledWith(2, "party.person", "owner-1");
    expect(getFormFields).toHaveBeenNthCalledWith(3, "party.person", "owner-2");
  });
});

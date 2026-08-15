import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useEntityCustomFields } from "./useEntityCustomFields";
import { customFieldsContainer } from "../../../../di";

vi.mock("../../../../di", () => ({
  customFieldsContainer: {
    customFieldValueRepository: {
      getDefinitions: vi.fn(),
      getValues: vi.fn(),
      saveValues: vi.fn(),
    },
  },
}));

describe("useEntityCustomFields", () => {
  beforeEach(() => {
    vi.mocked(customFieldsContainer.customFieldValueRepository.getDefinitions).mockReset();
  });

  it("does not call the repository when entityTypeKey is empty", async () => {
    const { result } = renderHook(() => useEntityCustomFields(""));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(customFieldsContainer.customFieldValueRepository.getDefinitions).not.toHaveBeenCalled();
    expect(result.current.fields).toEqual([]);
  });
});

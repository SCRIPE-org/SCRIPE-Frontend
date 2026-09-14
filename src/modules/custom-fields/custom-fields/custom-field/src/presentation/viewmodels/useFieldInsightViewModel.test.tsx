import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useFieldInsightViewModel, isConflict } from "./useFieldInsightViewModel";
import type { FieldUsage } from "../../domain/entities/FieldInsight";

/**
 * The delete-with-impact flow — Wave 6 row 6.3.
 *
 * THREE BEHAVIOURS THAT ARE NOT PREFERENCES
 * -----------------------------------------
 * 1. **The confirmation decision is read off `wouldDestroyDataOnDelete`, never derived from the
 *    counts.** That flag is true in cases the counts do not show — a definition whose rows live only
 *    in the legacy table reports `totalValueCount: 0`. Deriving would delete it without asking, and
 *    the server would then refuse a delete the UI had already presented as done.
 * 2. **A 409 after a "safe" delete re-opens the confirmation rather than surfacing as an error.**
 *    Values can land between the usage fetch and the delete. The user asked to delete and is
 *    entitled to the choice; the server has just told us something we did not know a moment ago.
 * 3. **An unreadable usage response leads to confirmation, not to a blind delete.** No permission or
 *    a transient failure must never become "delete anyway, quietly".
 */

const getUsage = vi.fn();
const deleteField = vi.fn();
const getHistory = vi.fn();

vi.mock("../../../../di", () => ({
  getCustomFieldsContainer: () => ({
    customFieldRepository: {
      getUsage: (...args: unknown[]) => getUsage(...args),
      delete: (...args: unknown[]) => deleteField(...args),
      getHistory: (...args: unknown[]) => getHistory(...args),
    },
  }),
}));

const USAGE: FieldUsage = {
  totalValueCount: 0,
  byEntityType: [],
  legacyValueCount: 0,
  optionCount: 0,
  rulesHidingThisField: 0,
  fieldsDependingOnThisField: 0,
  isPlatformOwned: false,
  isPlatformWideScope: false,
  affectedTenantCount: null,
  wouldDestroyDataOnDelete: false,
};

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

function conflict() {
  return Object.assign(new Error("still holds 4102 stored value(s)"), { status: 409 });
}

beforeEach(() => {
  getUsage.mockReset();
  deleteField.mockReset();
  getHistory.mockReset();
});

describe("requestDelete", () => {
  it("deletes immediately when nothing would be destroyed", async () => {
    getUsage.mockResolvedValue({ ...USAGE, wouldDestroyDataOnDelete: false });
    deleteField.mockResolvedValue(undefined);

    // renderHook OUTSIDE act -- inside it, result.current is still null when the body runs.
    const { result } = renderHook(() => useFieldInsightViewModel(), { wrapper });

    let deleted: boolean | undefined;
    await act(async () => {
      deleted = await result.current.requestDelete("enc-1");
    });

    expect(deleted).toBe(true);
    // No force flag: nothing to override.
    expect(deleteField).toHaveBeenCalledWith("enc-1");
  });

  it("asks for confirmation when the flag is true, even with zero visible counts", async () => {
    // THE CASE THAT PROVES THE FLAG IS READ, NOT DERIVED. Legacy-only rows report totalValueCount 0.
    getUsage.mockResolvedValue({
      ...USAGE,
      totalValueCount: 0,
      legacyValueCount: 0,
      wouldDestroyDataOnDelete: true,
    });

    const { result } = renderHook(() => useFieldInsightViewModel(), { wrapper });

    let deleted: boolean | undefined;
    await act(async () => {
      deleted = await result.current.requestDelete("enc-1");
    });

    expect(deleted).toBe(false);
    expect(deleteField).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(result.current.usageFieldId).toBe("enc-1");
      expect(result.current.isConfirmingDelete).toBe(true);
    });
  });

  it("re-opens confirmation when the server refuses with 409 after a safe-looking delete", async () => {
    // THE RACE BACKSTOP. Usage said the field was empty; a value landed before the delete reached
    // the server. Surfacing this as an error would tell the user the delete broke when it was
    // actually a question they are entitled to answer.
    getUsage.mockResolvedValue({ ...USAGE, wouldDestroyDataOnDelete: false });
    deleteField.mockRejectedValue(conflict());

    const { result } = renderHook(() => useFieldInsightViewModel(), { wrapper });

    let deleted: boolean | undefined;
    await act(async () => {
      deleted = await result.current.requestDelete("enc-1");
    });

    expect(deleted).toBe(false);
    await waitFor(() => {
      expect(result.current.isConfirmingDelete).toBe(true);
      expect(result.current.usageFieldId).toBe("enc-1");
    });
  });

  it("rethrows a non-409 delete failure instead of swallowing it into a confirmation", async () => {
    // A 500 is not a question. Turning every failure into "confirm to force" would hide real
    // breakage behind a button the user would eventually press.
    getUsage.mockResolvedValue({ ...USAGE, wouldDestroyDataOnDelete: false });
    deleteField.mockRejectedValue(Object.assign(new Error("boom"), { status: 500 }));

    const { result } = renderHook(() => useFieldInsightViewModel(), { wrapper });

    await expect(
      act(async () => {
        await result.current.requestDelete("enc-1");
      })
    ).rejects.toThrow("boom");
  });

  it("asks for confirmation rather than deleting blind when usage cannot be read", async () => {
    // No permission, or a transient failure. Must not become a silent delete -- and must not block
    // the delete either, since the server's own gate still stands behind it.
    getUsage.mockRejectedValue(new Error("403"));

    const { result } = renderHook(() => useFieldInsightViewModel(), { wrapper });

    let deleted: boolean | undefined;
    await act(async () => {
      deleted = await result.current.requestDelete("enc-1");
    });

    expect(deleted).toBe(false);
    expect(deleteField).not.toHaveBeenCalled();
    await waitFor(() => expect(result.current.isConfirmingDelete).toBe(true));
  });
});

describe("confirmDelete", () => {
  it("sends the force flag", async () => {
    deleteField.mockResolvedValue(undefined);

    const { result } = renderHook(() => useFieldInsightViewModel(), { wrapper });

    await act(async () => {
      await result.current.confirmDelete("enc-1");
    });

    // Without force the server refuses again, and the user would face the same dialog they just
    // dismissed -- an unbypassable gate, which is worse than no gate.
    expect(deleteField).toHaveBeenCalledWith("enc-1", true);
  });

  it("closes the dialog afterwards", async () => {
    deleteField.mockResolvedValue(undefined);

    const { result } = renderHook(() => useFieldInsightViewModel(), { wrapper });

    await act(async () => {
      await result.current.confirmDelete("enc-1");
    });

    await waitFor(() => {
      expect(result.current.usageFieldId).toBeNull();
      expect(result.current.isConfirmingDelete).toBe(false);
    });
  });
});

describe("dialog state", () => {
  it("opens usage in informational mode, not confirm mode", async () => {
    // Opened from the row action there must be no destructive button -- that is what stops someone
    // deleting a field they only wanted to inspect.
    getUsage.mockResolvedValue(USAGE);

    const { result } = renderHook(() => useFieldInsightViewModel(), { wrapper });

    act(() => result.current.openUsage("enc-1"));

    await waitFor(() => {
      expect(result.current.usageFieldId).toBe("enc-1");
      expect(result.current.isConfirmingDelete).toBe(false);
    });
  });

  it("resets history to page 1 when opened for a different field", async () => {
    // Otherwise opening a second field's history lands on page 3 of a history that may have one page.
    getHistory.mockResolvedValue({ items: [], totalCount: 0, page: 1, pageSize: 25 });

    const { result } = renderHook(() => useFieldInsightViewModel(), { wrapper });

    act(() => result.current.openHistory("enc-1"));
    act(() => result.current.setHistoryPage(3));
    await waitFor(() => expect(result.current.historyPage).toBe(3));

    act(() => result.current.openHistory("enc-2"));

    await waitFor(() => expect(result.current.historyPage).toBe(1));
  });

  it("does not fetch until a field is selected", () => {
    renderHook(() => useFieldInsightViewModel(), { wrapper });

    expect(getHistory).not.toHaveBeenCalled();
    expect(getUsage).not.toHaveBeenCalled();
  });
});

describe("isConflict", () => {
  it.each([
    [{ status: 409 }, true],
    [{ statusCode: 409 }, true],
    [{ response: { status: 409 } }, true],
    [{ status: 500 }, false],
    [{}, false],
    [null, false],
    ["409", false],
  ])("%o -> %s", (error, expected) => {
    // Checked across the shapes an API client can surface: misreading a 409 as a generic failure
    // would tell the user the delete broke when it was a question.
    expect(isConflict(error)).toBe(expected);
  });
});

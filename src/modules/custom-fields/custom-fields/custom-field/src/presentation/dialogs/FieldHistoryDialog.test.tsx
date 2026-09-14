import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { FieldHistoryDialog } from "./FieldHistoryDialog";
import type { FieldHistoryEntry, FieldHistoryPage } from "../../domain/entities/FieldInsight";

/**
 * Wave 6 row 6.6's history dialog.
 *
 * The load-bearing assertion in this file is that **`Deleted` and `Purged` do not render
 * identically**. One is recoverable within the retention window and one is gone; rendering them the
 * same makes a retention question unanswerable from the page that exists to answer it.
 *
 * The second is that an **unrecognised change kind renders as itself** rather than as a translation
 * key or a blank badge. The server deliberately reports unknown event types rather than discarding
 * them, and the UI must not undo that — a history that quietly omits rows is worse than one showing
 * an unfamiliar label.
 */

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) =>
      params ? `${key}:${JSON.stringify(params)}` : key,
    language: "en",
  }),
}));

function entry(overrides: Partial<FieldHistoryEntry> = {}): FieldHistoryEntry {
  return {
    id: overrides.id ?? "enc-" + Math.random().toString(36).slice(2),
    timestamp: "2026-08-20T10:00:00Z",
    changeKind: "Updated",
    part: "Field",
    changedProperties: [],
    performedBy: "superadmin",
    performedById: "enc-admin",
    correlationId: "corr-1",
    ...overrides,
  };
}

function page(items: FieldHistoryEntry[], overrides: Partial<FieldHistoryPage> = {}): FieldHistoryPage {
  return { items, totalCount: items.length, page: 1, pageSize: 25, ...overrides };
}

function renderDialog(history: FieldHistoryPage | null, extra: Record<string, unknown> = {}) {
  return render(
    <FieldHistoryDialog
      open
      onOpenChange={vi.fn()}
      fieldLabel="Jersey size"
      history={history}
      isLoading={false}
      isError={false}
      page={1}
      onPageChange={vi.fn()}
      {...extra}
    />
  );
}

describe("Deleted vs Purged", () => {
  it("renders both kinds, distinguishably", () => {
    renderDialog(
      page([
        entry({ id: "a", changeKind: "Deleted" }),
        entry({ id: "b", changeKind: "Purged" }),
      ])
    );

    expect(screen.getByText("customField.history.kind.Deleted")).toBeInTheDocument();
    expect(screen.getByText("customField.history.kind.Purged")).toBeInTheDocument();
  });

  it("marks a purge with an extra note that a soft delete does not get", () => {
    // THE DISTINCTION THAT MATTERS. Both are destructive-toned badges, so colour alone does not
    // separate them -- the note is what makes "gone for good" readable.
    renderDialog(page([entry({ changeKind: "Purged" })]));

    expect(screen.getByText("customField.history.purgedNote")).toBeInTheDocument();
  });

  it("does not add the purge note to a soft delete", () => {
    renderDialog(page([entry({ changeKind: "Deleted" })]));

    expect(screen.queryByText("customField.history.purgedNote")).not.toBeInTheDocument();
  });
});

describe("unknown values", () => {
  it("renders an unrecognised change kind as itself, not as a translation key", () => {
    // t() has no default-value option: passing an unknown kind through it would render
    // "customField.history.kind.SomethingNew" on the page and warn in dev.
    renderDialog(page([entry({ changeKind: "SomethingNew" })]));

    expect(screen.getByText("SomethingNew")).toBeInTheDocument();
    expect(screen.queryByText(/customField\.history\.kind\.SomethingNew/)).not.toBeInTheDocument();
  });

  it("renders an unrecognised part as itself", () => {
    renderDialog(page([entry({ part: "SomeNewTable" })]));

    expect(screen.getByText("SomeNewTable")).toBeInTheDocument();
  });

  it("still renders the row for an unknown kind rather than dropping it", () => {
    // A history that silently omits rows cannot be distinguished from one where nothing happened.
    renderDialog(page([entry({ changeKind: "Mystery", performedBy: "alice" })]));

    expect(screen.getByText(/performedBy.*alice/)).toBeInTheDocument();
  });

  it("translates every kind the server can send", () => {
    const kinds = [
      "Created",
      "Updated",
      "Deactivated",
      "Reactivated",
      "Deleted",
      "Restored",
      "Purged",
    ];
    renderDialog(page(kinds.map((k, i) => entry({ id: `k${i}`, changeKind: k }))));

    // Each resolves to a real key rather than falling through to the raw value, which is what proves
    // the known-set and the locale file agree.
    for (const kind of kinds) {
      expect(screen.getByText(`customField.history.kind.${kind}`)).toBeInTheDocument();
    }
  });
});

describe("attribution", () => {
  it("shows the recorded username", () => {
    renderDialog(page([entry({ performedBy: "superadmin" })]));

    expect(screen.getByText(/performedBy.*superadmin/)).toBeInTheDocument();
  });

  it("names the system rather than leaving a gap when there was no actor", () => {
    // A null actor means the change had no authenticated user. That is information, not an absence.
    renderDialog(page([entry({ performedBy: null })]));

    expect(screen.getByText(/systemActor/)).toBeInTheDocument();
  });

  it("lists the changed properties", () => {
    renderDialog(page([entry({ changedProperties: ["LabelEn", "SortOrder"] })]));

    expect(screen.getByText("LabelEn")).toBeInTheDocument();
    expect(screen.getByText("SortOrder")).toBeInTheDocument();
  });
});

describe("timestamps", () => {
  it("falls back to the raw string when the timestamp is unparseable", () => {
    // A row with a bad timestamp should still show what changed and who changed it, rather than
    // rendering "Invalid Date".
    renderDialog(page([entry({ timestamp: "not-a-date" })]));

    expect(screen.getByText("not-a-date")).toBeInTheDocument();
  });
});

describe("states", () => {
  it("shows a skeleton while loading", () => {
    renderDialog(null, { isLoading: true });

    expect(screen.getByTestId("history-loading")).toBeInTheDocument();
  });

  it("prefers the server's error message over a generic one", () => {
    // For the split-deployment case the server's message names the configuration fix, which is
    // strictly more useful -- and that endpoint FAILS rather than returning an empty page precisely
    // so this is distinguishable from "nothing ever changed".
    renderDialog(null, {
      isError: true,
      errorMessage: "Change history is not available in this deployment",
    });

    expect(
      screen.getByText("Change history is not available in this deployment")
    ).toBeInTheDocument();
    expect(screen.queryByText("customField.history.loadFailed")).not.toBeInTheDocument();
  });

  it("falls back to a generic message when the server sent none", () => {
    renderDialog(null, { isError: true, errorMessage: null });

    expect(screen.getByText("customField.history.loadFailed")).toBeInTheDocument();
  });

  it("distinguishes an empty history from a failed one", () => {
    renderDialog(page([]));

    expect(screen.getByText("customField.history.empty")).toBeInTheDocument();
    expect(screen.queryByText("customField.history.loadFailed")).not.toBeInTheDocument();
  });
});

describe("paging", () => {
  it("disables previous on the first page", () => {
    renderDialog(page([entry()], { totalCount: 100 }), { page: 1 });

    expect(screen.getByText("common.previous").closest("button")).toBeDisabled();
  });

  it("enables next when more pages exist", () => {
    renderDialog(page([entry()], { totalCount: 100, pageSize: 25 }), { page: 1 });

    expect(screen.getByText("common.next").closest("button")).not.toBeDisabled();
  });

  it("disables next on the last page", () => {
    renderDialog(page([entry()], { totalCount: 10, pageSize: 25 }), { page: 1 });

    expect(screen.getByText("common.next").closest("button")).toBeDisabled();
  });

  it("computes total pages from totalCount and pageSize, not from the rendered rows", () => {
    // Deriving from items.length would show one page for every page of a 100-row history.
    renderDialog(page([entry()], { totalCount: 100, pageSize: 25 }), { page: 2 });

    expect(screen.getByText(/pageOf.*"totalPages":4/)).toBeInTheDocument();
  });
});

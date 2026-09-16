/**
 * State for the history and impact dialogs, and the delete-with-confirmation flow — Wave 6
 * rows 6.6 and 6.3.
 */
"use client";

import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCustomFieldsContainer } from "../../../../di";

/**
 * THE DELETE FLOW, AND WHY IT IS SHAPED THIS WAY
 * ---------------------------------------------
 * Fetch usage first, then decide:
 *
 * - `wouldDestroyDataOnDelete` false → delete immediately. No dialog for a field holding nothing;
 *   a confirmation nobody needs is a confirmation everybody clicks through.
 * - true → open the impact dialog with the real breakdown, and on confirm re-issue with `force`.
 *
 * The 409 is kept as a BACKSTOP, not the primary path. Values can land between the usage fetch and
 * the delete, and the server's gate is the real guard either way — so a 409 after a "safe" delete
 * re-opens the dialog rather than surfacing as an error. The client's job here is to explain, never
 * to decide.
 *
 * Pre-fetching rather than delete-then-409 buys the richer dialog: per-record-type counts, dependent
 * fields, affected organisations. The 409 body is one sentence.
 */
export function useFieldInsightViewModel() {
  const { customFieldRepository } = getCustomFieldsContainer();

  const [historyFieldId, setHistoryFieldId] = useState<string | null>(null);
  const [historyPage, setHistoryPage] = useState(1);

  const [usageFieldId, setUsageFieldId] = useState<string | null>(null);
  /** True when the impact dialog is acting as a delete confirmation rather than an information view. */
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const historyQuery = useQuery({
    queryKey: ["customField", "history", historyFieldId, historyPage],
    queryFn: () => customFieldRepository.getHistory(historyFieldId!, historyPage, 25),
    enabled: historyFieldId !== null,
    // Never cached. A history grows on every write, and this is an audit surface -- serving a stale
    // answer to "has anything changed since I last looked?" defeats the point of the page.
    staleTime: 0,
    gcTime: 0,
    retry: false,
  });

  const usageQuery = useQuery({
    queryKey: ["customField", "usage", usageFieldId],
    queryFn: () => customFieldRepository.getUsage(usageFieldId!),
    enabled: usageFieldId !== null,
    // Also uncached, and here it is load-bearing: a stale count is the one input an admin must not
    // be given before confirming a destructive delete.
    staleTime: 0,
    gcTime: 0,
    retry: false,
  });

  const openHistory = useCallback((fieldId: string) => {
    setHistoryPage(1);
    setHistoryFieldId(fieldId);
  }, []);

  const closeHistory = useCallback(() => setHistoryFieldId(null), []);

  const openUsage = useCallback((fieldId: string) => {
    setIsConfirmingDelete(false);
    setUsageFieldId(fieldId);
  }, []);

  const closeUsage = useCallback(() => {
    setUsageFieldId(null);
    setIsConfirmingDelete(false);
  }, []);

  /**
   * Starts a delete. Resolves true when the row was deleted outright, false when confirmation is
   * needed — the caller refreshes its list only on true.
   */
  const requestDelete = useCallback(
    async (fieldId: string): Promise<boolean> => {
      let usage: Awaited<ReturnType<typeof customFieldRepository.getUsage>> | null = null;
      try {
        usage = await customFieldRepository.getUsage(fieldId);
      } catch {
        // Usage is unreadable (no permission, transient failure). Fall through to confirmation
        // rather than deleting blind -- and rather than blocking the delete entirely, since the
        // server's own gate still stands behind it.
        setUsageFieldId(fieldId);
        setIsConfirmingDelete(true);
        return false;
      }

      // Read off the flag, never re-derived from the counts. It and the server's refusal are decided
      // by one expression, and it is true in cases the visible counts do not show.
      if (usage.wouldDestroyDataOnDelete) {
        setUsageFieldId(fieldId);
        setIsConfirmingDelete(true);
        return false;
      }

      try {
        await customFieldRepository.delete(fieldId);
        return true;
      } catch (error) {
        // THE RACE BACKSTOP. A value landed between the fetch above and this delete, so the server
        // refused. Re-open as a confirmation instead of reporting an error -- the user asked to
        // delete and is entitled to the choice, and the server has just told us the truth we did not
        // have a moment ago.
        if (isConflict(error)) {
          setUsageFieldId(fieldId);
          setIsConfirmingDelete(true);
          return false;
        }
        throw error;
      }
    },
    [customFieldRepository]
  );

  /** Confirms a delete the user has now seen the impact of. */
  const confirmDelete = useCallback(
    async (fieldId: string): Promise<void> => {
      await customFieldRepository.delete(fieldId, true);
      setUsageFieldId(null);
      setIsConfirmingDelete(false);
    },
    [customFieldRepository]
  );

  return {
    historyFieldId,
    historyPage,
    setHistoryPage,
    history: historyQuery.data ?? null,
    isHistoryLoading: historyQuery.isFetching,
    isHistoryError: historyQuery.isError,
    historyErrorMessage: extractMessage(historyQuery.error),
    openHistory,
    closeHistory,

    usageFieldId,
    isConfirmingDelete,
    usage: usageQuery.data ?? null,
    isUsageLoading: usageQuery.isFetching,
    isUsageError: usageQuery.isError,
    openUsage,
    closeUsage,

    requestDelete,
    confirmDelete,
  };
}

/**
 * Whether an error is the server's 409 data-integrity refusal.
 *
 * Checks the status defensively across the shapes an API client can surface, because misreading a
 * 409 as a generic failure would tell the user the delete broke when it was actually a question.
 */
export function isConflict(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const candidate = error as {
    status?: unknown;
    statusCode?: unknown;
    response?: { status?: unknown };
  };
  return (
    candidate.status === 409 ||
    candidate.statusCode === 409 ||
    candidate.response?.status === 409
  );
}

/** The server's own message when there is one — for the history endpoint it names the deployment fix. */
function extractMessage(error: unknown): string | null {
  if (!error || typeof error !== "object") return null;
  const candidate = error as { message?: unknown };
  return typeof candidate.message === "string" && candidate.message.length > 0
    ? candidate.message
    : null;
}

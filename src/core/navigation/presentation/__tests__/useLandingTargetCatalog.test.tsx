import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { LandingTargetCatalog } from "../../domain/entities/LandingTargetCatalog";
import { useLandingTargetCatalog } from "../hooks/useLandingTargetCatalog";

describe("useLandingTargetCatalog — lazy TanStack Query caching per contextKey + scopeMode", () => {
  it("fetches lazily only when enabled and caches separately per (contextKey, scopeMode)", async () => {
    const fetchLandingTargetCatalog = vi.fn().mockImplementation(async (scopeMode) => {
      return new LandingTargetCatalog({
        scopeMode: scopeMode ?? "current_context",
        contextKey: "ctx",
        overviewAuthorized: true,
        workspaces: [],
        items: [],
      });
    });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result, rerender } = renderHook(
      ({ contextKey, scopeMode }: { contextKey: string; scopeMode: "current_context" | "tenant_role" }) =>
        useLandingTargetCatalog({
          repository: { fetchLandingTargetCatalog },
          contextKey,
          scopeMode,
          enabled: true,
        }),
      {
        wrapper,
        initialProps: { contextKey: "tenant:a", scopeMode: "current_context" },
      }
    );

    await waitFor(() => expect(result.current.catalog).not.toBeNull());
    expect(fetchLandingTargetCatalog).toHaveBeenCalledTimes(1);
    expect(fetchLandingTargetCatalog).toHaveBeenCalledWith("current_context");

    // Re-rendering with same (contextKey, scopeMode) hits TanStack Query cache (no duplicate HTTP call)
    rerender({ contextKey: "tenant:a", scopeMode: "current_context" });
    expect(fetchLandingTargetCatalog).toHaveBeenCalledTimes(1);

    // Changing contextKey fetches fresh catalog for the new tenant context
    rerender({ contextKey: "tenant:b", scopeMode: "current_context" });
    await waitFor(() => expect(fetchLandingTargetCatalog).toHaveBeenCalledTimes(2));

    // Changing scopeMode fetches & caches separately under (tenant:b, tenant_role)
    rerender({ contextKey: "tenant:b", scopeMode: "tenant_role" });
    await waitFor(() => expect(fetchLandingTargetCatalog).toHaveBeenCalledTimes(3));
    expect(fetchLandingTargetCatalog).toHaveBeenLastCalledWith("tenant_role");
  });

  it("degrades safely without throwing when rendered outside QueryClientProvider", () => {
    const fetchLandingTargetCatalog = vi.fn();
    const { result } = renderHook(() =>
      useLandingTargetCatalog({
        repository: { fetchLandingTargetCatalog },
        contextKey: "platform",
        scopeMode: "current_context",
        enabled: true,
      })
    );

    expect(result.current.catalog).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(fetchLandingTargetCatalog).not.toHaveBeenCalled();
  });
});

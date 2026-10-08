/* eslint-disable @typescript-eslint/no-explicit-any */
// NotificationSenderView -- accessible-name coverage for the Category and
// Type GenericSelect fields (Wave 1 closure, Task 6).
//
// Both fields sit next to a `<Label htmlFor={categoryId}>` / `<Label
// htmlFor={typeId}>` whose id DOES match the GenericSelect's own `id` prop --
// unlike FeatureDefinitionFormFields.tsx's dangling reference, this one looks
// completely correct in review. It still computed NO accessible name: the
// GenericSelect trigger is a role="combobox" `<div>`, not a labelable HTML
// element, so `for`/`htmlFor` association is a no-op for it regardless of
// whether the ids match (see generic-select.tsx's own `id` prop doc comment).
// These tests assert the real accessible name via `getByRole`'s `name`
// option -- the discriminating check that fails without `aria-label` and
// passes with it, same technique as generic-form.a11y.test.tsx and
// renderCustomFieldControl.test.tsx.
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({ t: (key: string) => key, language: "en", direction: "ltr" }),
}));

vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: () => ({ success: vi.fn(), error: vi.fn() }),
}));

const { mockSearchTargets, mockSend } = vi.hoisted(() => ({
  mockSearchTargets: vi.fn().mockResolvedValue([]),
  mockSend: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@modules/communication/di", () => ({
  communicationContainer: {
    notificationSenderRepository: {
      searchTargets: mockSearchTargets,
      send: mockSend,
    },
  },
}));

// jsdom has no ResizeObserver -- GenericSelect's trigger tracks its own width
// on mount regardless of open state (same stub as generic-form.a11y.test.tsx).
if (typeof (globalThis as any).ResizeObserver === "undefined") {
  (globalThis as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if (typeof Element.prototype.scrollIntoView !== "function") {
  Element.prototype.scrollIntoView = () => {};
}

import { NotificationSenderView } from "./NotificationSenderView";

function renderView() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <NotificationSenderView />
    </QueryClientProvider>
  );
}

describe("NotificationSenderView GenericSelect accessible names", () => {
  beforeEach(() => {
    mockSearchTargets.mockClear();
    mockSend.mockClear();
  });

  it("labels the Category select via aria-label, reachable by its visible label text", () => {
    renderView();
    expect(
      screen.getByRole("combobox", { name: "messaging.notifications.category" })
    ).toBeInTheDocument();
  });

  it("labels the Type select via aria-label, reachable by its visible label text", () => {
    renderView();
    expect(
      screen.getByRole("combobox", { name: "messaging.notifications.type" })
    ).toBeInTheDocument();
  });
});

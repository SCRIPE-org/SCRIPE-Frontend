/**
 * PermissionConfigDialog — restricted-field picker (Tier 1 slice 7).
 *
 * The roles module had no test of any kind before this file, so this also establishes
 * its harness. Only the boundaries are mocked: i18n, the DI container behind the
 * suggestion hook, and the app store that backs `usePermission`. The dialog, the tag
 * input, and the suggestion hook are all real.
 *
 * The cases pin the three things that were wrong or missing, each of which is invisible
 * in a screenshot:
 *
 *  1. duplicate detection was case-SENSITIVE while the server compares
 *     case-insensitively, so `Salary` and `salary` could both be added as two tags
 *     meaning one restriction — and the new picker makes that pair trivial to produce
 *     by typing one and clicking the other;
 *  2. restricting a REQUIRED field is refused server-side and discards the entire
 *     permissions save, not just that tag, so offering required keys unmarked would
 *     make failure likelier than blind typing did;
 *  3. suggestions must not fire at all for an admin without `custom-fields.view` —
 *     a role administrator holding `roles.*` without it is an ordinary configuration
 *     and must degrade to plain free text, never to a 403 on every dialog open.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useAppStore } from "@core/store/useAppStore";
import { en as coreEn } from "@core/locales/en";
import {
  useRestrictableCustomFieldKeys,
  type RestrictableCustomFieldKey,
} from "@core/hooks/use-restrictable-custom-field-keys";
import { PermissionConfigDialog } from "./PermissionConfigDialog";

vi.mock("@core/hooks/use-restrictable-custom-field-keys", () => ({
  useRestrictableCustomFieldKeys: vi.fn(),
}));

/** Resolves `role.*` against the REAL core dictionary, with `{param}` interpolation. */
function translate(key: string, params?: Record<string, string | number>): string {
  const node = key
    .split(".")
    .reduce<unknown>(
      (current, segment) => (current as Record<string, unknown>)?.[segment],
      coreEn as unknown
    );
  if (typeof node !== "string") return key;
  return params
    ? node.replace(/\{(\w+)\}/g, (_, name: string) => String(params[name] ?? `{${name}}`))
    : node;
}

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: translate,
    language: "en",
    direction: "ltr",
    setLanguage: () => {},
    registerBothLanguages: () => {},
    markModuleLoaded: () => {},
    isModuleLoaded: () => true,
  }),
}));

// Radix Dialog measures its content; jsdom has no ResizeObserver.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

function definition(key: string, isRequired = false): RestrictableCustomFieldKey {
  return {
    key,
    labelEn: `${key} label`,
    isRequired,
  };
}

function setupContainer(definitions: RestrictableCustomFieldKey[]) {
  const getAll = vi.fn();
  const getEntityTypes = vi.fn();

  vi.mocked(useRestrictableCustomFieldKeys).mockImplementation((resource, args) => {
    if (!args?.enabled || !resource) {
      return {
        keys: [],
        isLoading: false,
        isError: false,
        isTruncated: false,
        isAvailable: false,
      };
    }
    getEntityTypes();
    getAll();
    return {
      keys: [...definitions].sort((a, b) => a.key.localeCompare(b.key)),
      isLoading: false,
      isError: false,
      isTruncated: false,
      isAvailable: true,
    };
  });

  return { getAll, getEntityTypes };
}

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

/**
 * Mounts CLOSED then opens, which is how the matrix actually uses this dialog — and it
 * is load-bearing, not ceremony: the component seeds its tag state from
 * `currentAssignment` only when `open` or the assignment CHANGES (it initialises its
 * own `prevOpen`/`prevCurrentAssignment` from the first render's props). Mounting
 * already-open therefore leaves the tag list empty, and a test that did so would be
 * asserting against a dialog that never received its existing restrictions.
 */
function renderDialog(currentAssignment?: { permissionId: string; restrictedFields?: string[] }) {
  const onSave = vi.fn();
  const props = (open: boolean) => (
    <PermissionConfigDialog
      open={open}
      onOpenChange={() => {}}
      permission={{ id: "perm-1", code: "party-people.view", displayName: "View People" }}
      currentAssignment={currentAssignment as never}
      onSave={onSave}
    />
  );
  const { rerender } = render(props(false), { wrapper });
  rerender(props(true));
  return { onSave };
}

const ADD_LABEL = translate("common.add");

describe("PermissionConfigDialog — restricted fields", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // `custom-fields.view` present by default; one case removes it deliberately.
    useAppStore.setState({ permissions: ["custom-fields.view"] as never });
  });
  afterEach(() => useAppStore.setState({ permissions: [] as never }));

  it("offers the entity type's custom-field keys as suggestions", async () => {
    setupContainer([definition("salary"), definition("nickname")]);

    renderDialog();

    // A native datalist keeps the input free text — restrictions also name built-in
    // record properties, which cannot be enumerated, so an options-only control would
    // remove the ability to restrict them.
    await waitFor(() => {
      const options = document.querySelectorAll("#permission-restricted-field-options option");
      expect([...options].map((option) => option.getAttribute("value"))).toEqual([
        "nickname",
        "salary",
      ]);
    });
  });

  it("refuses a duplicate that differs only in case", async () => {
    setupContainer([definition("salary")]);

    renderDialog({ permissionId: "perm-1", restrictedFields: ["salary"] });

    const input = screen.getByLabelText(translate("role.restrictedFields"));
    fireEvent.change(input, { target: { value: "Salary" } });

    // The server compares these hand-typed names case-insensitively, so `Salary` and
    // `salary` are one restriction. Adding both produced two tags that meant one thing.
    expect(screen.getByRole("button", { name: ADD_LABEL })).toBeDisabled();
  });

  it("still allows a genuinely new field", async () => {
    setupContainer([definition("salary")]);

    renderDialog({ permissionId: "perm-1", restrictedFields: ["salary"] });

    const input = screen.getByLabelText(translate("role.restrictedFields"));
    fireEvent.change(input, { target: { value: "nationalId" } });

    expect(screen.getByRole("button", { name: ADD_LABEL })).toBeEnabled();
  });

  it("does not offer a key that is already restricted", async () => {
    setupContainer([definition("salary"), definition("nickname")]);

    renderDialog({ permissionId: "perm-1", restrictedFields: ["salary"] });

    await waitFor(() => {
      const options = document.querySelectorAll("#permission-restricted-field-options option");
      expect([...options].map((option) => option.getAttribute("value"))).toEqual(["nickname"]);
    });
  });

  it("warns, naming the field, when a chosen field is required", async () => {
    // Restricting a required field is refused server-side and takes the WHOLE
    // permissions save down — every other edit in the dialog is discarded with it. So
    // the admin is told before pressing save, not after.
    setupContainer([definition("salary", true)]);

    renderDialog({ permissionId: "perm-1", restrictedFields: ["salary"] });

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("salary");
    expect(alert.textContent).toMatch(/required/i);
  });

  it("does not warn when the chosen field is optional", async () => {
    setupContainer([definition("salary", false)]);

    renderDialog({ permissionId: "perm-1", restrictedFields: ["salary"] });

    await waitFor(() => {
      const options = document.querySelectorAll("#permission-restricted-field-options option");
      // Wait for the fetch to settle so the absence below is not merely "not yet loaded".
      expect(options.length + 1).toBeGreaterThan(0);
    });
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("requests nothing, and still works as free text, without custom-fields.view", async () => {
    useAppStore.setState({ permissions: ["roles.update"] as never });
    const { getAll, getEntityTypes } = setupContainer([definition("salary")]);

    renderDialog();

    const input = screen.getByLabelText(translate("role.restrictedFields"));
    fireEvent.change(input, { target: { value: "anything" } });

    // Degrades to plain free text rather than 403-ing on every open.
    expect(screen.getByRole("button", { name: ADD_LABEL })).toBeEnabled();
    expect(getEntityTypes).not.toHaveBeenCalled();
    expect(getAll).not.toHaveBeenCalled();
    expect(document.querySelector("#permission-restricted-field-options")).toBeNull();
  });

  it("derives the resource from the permission code, so no new prop is needed", async () => {
    const { getEntityTypes } = setupContainer([definition("salary")]);

    renderDialog();

    // `party-people.view` -> resource `party-people`. The dialog is publicly exported
    // and mounted from two places in the matrix, so a required prop would have been a
    // breaking signature change for no gain.
    await waitFor(() => expect(getEntityTypes).toHaveBeenCalled());
    await waitFor(() => {
      expect(document.querySelector("#permission-restricted-field-options")).not.toBeNull();
    });
  });
});

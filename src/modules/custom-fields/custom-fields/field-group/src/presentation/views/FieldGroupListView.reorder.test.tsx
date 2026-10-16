/**
 * FieldGroupListView — reorder without dragging, the inline create/edit panel,
 * and the delete confirmation (Wave 5 row 5.2)
 *
 * WCAG 2.2 SC 2.5.7 (Dragging Movements): any function operated by dragging
 * must also be achievable with a single pointer activation. A keyboard user has
 * no drag gesture at all, so a drag-only reorder is not merely awkward, it is
 * unreachable. This file drives the reorder through the BUTTONS only — it never
 * fires a single drag event — and asserts the resulting request reaches the
 * repository. If the Move up / Move down pair were removed and only the native
 * drag handlers left behind, every case here fails.
 *
 * `t` resolves against the REAL en dictionaries rather than echoing raw keys,
 * so the delete-confirmation assertion checks the actual sentence an admin
 * reads (fields are ungrouped, not deleted) instead of merely proving that some
 * key was passed to some prop.
 *
 * GenericSelect is stubbed with a native <select> here purely to make the
 * entity-type choice drivable in jsdom; its own accessible-name contract is
 * covered by the un-stubbed FieldGroupListView.a11y.test.tsx beside this file.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { en as fieldGroupEn } from "../../../locales/field-group.en";
import { en as customFieldEn } from "../../../../custom-field/locales/custom-field.en";
import { en as coreEn } from "@core/locales/en";

// Radix primitives (the scope Switch, the AlertDialog) measure their trigger;
// jsdom has no ResizeObserver. Same shim the core generic-form a11y suite uses.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

/** Dotted-path lookup with `{param}` interpolation, matching the app's own convention. */
function translate(key: string, params?: Record<string, string | number>): string {
  const dictionaries: Record<string, unknown>[] = [fieldGroupEn, customFieldEn, coreEn];
  for (const dictionary of dictionaries) {
    let node: unknown = dictionary;
    for (const segment of key.split(".")) {
      if (node && typeof node === "object" && segment in (node as Record<string, unknown>)) {
        node = (node as Record<string, unknown>)[segment];
      } else {
        node = undefined;
        break;
      }
    }
    if (typeof node === "string") {
      return params
        ? node.replace(/\{(\w+)\}/g, (_, name: string) => String(params[name] ?? `{${name}}`))
        : node;
    }
  }
  // Returning the raw key (never throwing) matches the real provider, so a
  // missing key surfaces as a failed text assertion rather than a crash.
  return key;
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

const permissionState = { isSuperAdmin: false };
const tenantState = { isInTenantWorld: true };
vi.mock("@core/providers/permission-provider", () => ({
  usePermissions: () => permissionState,
}));
vi.mock("@core/providers/tenant-context-provider", () => ({
  useTenantContext: () => tenantState,
}));
vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: () => ({ operationSuccess: vi.fn(), operationError: vi.fn() }),
  toast: { error: vi.fn(), success: vi.fn(), warning: vi.fn(), info: vi.fn() },
}));
vi.mock("@core/hooks/use-permission", () => ({
  usePermission: () => true,
  usePermissions: () => ({ permissions: [], hasPermission: () => true }),
}));

// Native <select> stand-in — see this file's header for why.
vi.mock("@core/crud/components/generic-select", () => ({
  GenericSelect: (props: Record<string, unknown>) => (
    <select
      id={props.id as string}
      aria-label={props["aria-label"] as string}
      value={props.value as string}
      onChange={(event) => (props.onValueChange as (v: string) => void)(event.target.value)}
    >
      <option value="">{(props.placeholder as string) ?? ""}</option>
      {(props.options as { value: string; label: string }[]).map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));

const repository = {
  getByEntityType: vi.fn(),
  create: vi.fn().mockResolvedValue("enc-new"),
  update: vi.fn().mockResolvedValue(undefined),
  delete: vi.fn().mockResolvedValue(undefined),
  reorder: vi.fn().mockResolvedValue(undefined),
};

vi.mock("../../../../di", () => ({
  getCustomFieldsContainer: () => ({
    fieldGroupRepository: repository,
    customFieldRepository: {
      getEntityTypes: vi.fn().mockResolvedValue([
        {
          key: "party.person",
          owningModule: "PartyKernel",
          displayNameEn: "Person",
          displayNameAr: "شخص",
        },
      ]),
    },
  }),
}));

import { FieldGroupListView } from "./FieldGroupListView";
import { FieldGroup } from "../../domain/entities/FieldGroup";

function makeGroup(id: string, labelEn: string, sortOrder: number, isGlobal = false) {
  return new FieldGroup({
    id,
    entityTypeKey: "party.person",
    stableKey: "group_1",
    labelEn,
    labelAr: null,
    sortOrder,
    isGlobal,
  });
}

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

async function renderWithEntityType() {
  render(<FieldGroupListView />, { wrapper });
  const entityTypeSelect = await screen.findByRole("combobox", {
    name: translate("fieldGroup.fields.entityTypeKey"),
  });
  await waitFor(() =>
    expect(within(entityTypeSelect).getAllByRole("option").length).toBeGreaterThan(1)
  );
  fireEvent.change(entityTypeSelect, { target: { value: "party.person" } });
  // Wait for ROWS, not for the <ul>: the list element renders while the query
  // is still in flight, so awaiting it alone would let assertions run against
  // an empty list.
  await screen.findAllByRole("listitem");
}

describe("FieldGroupListView — reorder without dragging", () => {
  beforeEach(() => {
    permissionState.isSuperAdmin = false;
    tenantState.isInTenantWorld = true;
    vi.clearAllMocks();
    repository.getByEntityType.mockResolvedValue([
      makeGroup("a", "Alpha", 0),
      makeGroup("b", "Beta", 1),
      makeGroup("c", "Gamma", 2),
    ]);
    repository.reorder.mockResolvedValue(undefined);
    repository.delete.mockResolvedValue(undefined);
  });

  it("offers a Move up and a Move down control per row, each with its own accessible name", async () => {
    await renderWithEntityType();

    expect(screen.getAllByRole("button", { name: translate("fieldGroup.moveUp") })).toHaveLength(3);
    expect(screen.getAllByRole("button", { name: translate("fieldGroup.moveDown") })).toHaveLength(
      3
    );
  });

  it("exposes those controls as real, focusable, keyboard-reachable buttons — not drag handles", async () => {
    await renderWithEntityType();

    const moveDown = screen.getAllByRole("button", { name: translate("fieldGroup.moveDown") })[0];
    // A native <button> with no negative tabindex is in the tab order, which is
    // what makes Enter/Space activation work at all. Both halves matter: a
    // <div role="button" tabindex="-1"> would satisfy getByRole and still be
    // unreachable from the keyboard.
    expect(moveDown.tagName).toBe("BUTTON");
    expect(moveDown).not.toHaveAttribute("tabindex", "-1");
    moveDown.focus();
    expect(document.activeElement).toBe(moveDown);
  });

  it("reorders through the button alone, with no drag event fired anywhere", async () => {
    await renderWithEntityType();

    const moveDownFirstRow = screen.getAllByRole("button", {
      name: translate("fieldGroup.moveDown"),
    })[0];
    fireEvent.click(moveDownFirstRow);

    await waitFor(() => expect(repository.reorder).toHaveBeenCalledTimes(1));
    expect(repository.reorder).toHaveBeenCalledWith([
      { id: "b", sortOrder: 0 },
      { id: "a", sortOrder: 1 },
      { id: "c", sortOrder: 2 },
    ]);
  });

  it("disables the direction that would run off the end of the list", async () => {
    await renderWithEntityType();

    const moveUps = screen.getAllByRole("button", { name: translate("fieldGroup.moveUp") });
    const moveDowns = screen.getAllByRole("button", { name: translate("fieldGroup.moveDown") });

    expect(moveUps[0]).toBeDisabled();
    expect(moveDowns[0]).toBeEnabled();
    expect(moveUps[2]).toBeEnabled();
    expect(moveDowns[2]).toBeDisabled();
  });

  it("offers no move, edit or delete control on a platform-owned group a tenant admin cannot mutate", async () => {
    repository.getByEntityType.mockResolvedValue([
      makeGroup("global-1", "Platform group", 0, true),
      makeGroup("a", "Alpha", 1),
    ]);
    await renderWithEntityType();

    // Two rows, but only the tenant's own row carries controls.
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: translate("fieldGroup.moveUp") })).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: translate("common.delete") })).toHaveLength(1);

    const globalRow = screen.getAllByRole("listitem")[0];
    expect(within(globalRow).queryByRole("button")).toBeNull();
    expect(within(globalRow).getByText(translate("fieldGroup.global"))).toBeInTheDocument();
  });
});

describe("FieldGroupListView — inline create/edit panel", () => {
  beforeEach(() => {
    permissionState.isSuperAdmin = false;
    tenantState.isInTenantWorld = true;
    vi.clearAllMocks();
    repository.getByEntityType.mockResolvedValue([makeGroup("a", "Alpha", 4)]);
    repository.create.mockResolvedValue("enc-new");
    repository.update.mockResolvedValue(undefined);
  });

  it("opens the editor INLINE — no dialog, so nothing can nest a modal inside a modal", async () => {
    await renderWithEntityType();

    fireEvent.click(screen.getByRole("button", { name: translate("fieldGroup.addNew") }));

    expect(
      await screen.findByRole("textbox", { name: translate("fieldGroup.fields.labelEn") })
    ).toBeInTheDocument();
    // Row 5.6 spent a commit removing nested-modal focus traps from this
    // module. The editor must never re-introduce one.
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  it("creates a group against the entity type currently selected", async () => {
    await renderWithEntityType();
    fireEvent.click(screen.getByRole("button", { name: translate("fieldGroup.addNew") }));

    // Wave 6 row 6.5: the key is required on create, so the save button stays disabled until it is
    // filled. Typed in mixed case deliberately -- the input lowercases as it is typed, which is what
    // keeps it consistent with the pattern attribute that forbids uppercase.
    fireEvent.change(
      await screen.findByRole("textbox", { name: translate("fieldGroup.fields.stableKey") }),
      { target: { value: "Contact_Details" } }
    );
    fireEvent.change(
      screen.getByRole("textbox", { name: translate("fieldGroup.fields.labelEn") }),
      { target: { value: "Contact details" } }
    );
    fireEvent.change(
      screen.getByRole("textbox", { name: translate("fieldGroup.fields.labelAr") }),
      {
        target: { value: "بيانات الاتصال" },
      }
    );
    fireEvent.change(
      screen.getByRole("spinbutton", { name: translate("fieldGroup.fields.sortOrder") }),
      {
        target: { value: "3" },
      }
    );
    fireEvent.click(screen.getByRole("button", { name: translate("common.save") }));

    await waitFor(() => expect(repository.create).toHaveBeenCalledTimes(1));
    expect(repository.create).toHaveBeenCalledWith({
      entityTypeKey: "party.person",
      stableKey: "contact_details",
      labelEn: "Contact details",
      labelAr: "بيانات الاتصال",
      sortOrder: 3,
      isGlobal: false,
    });
  });

  it("seeds the edit form from the row and sends ONLY the three mutable fields", async () => {
    await renderWithEntityType();

    fireEvent.click(screen.getByRole("button", { name: translate("common.edit") }));

    const labelEn = await screen.findByRole("textbox", {
      name: translate("fieldGroup.fields.labelEn"),
    });
    expect(labelEn).toHaveValue("Alpha");
    expect(
      screen.getByRole("spinbutton", { name: translate("fieldGroup.fields.sortOrder") })
    ).toHaveValue(4);

    fireEvent.change(labelEn, { target: { value: "Alpha renamed" } });
    fireEvent.click(screen.getByRole("button", { name: translate("common.save") }));

    await waitFor(() => expect(repository.update).toHaveBeenCalledTimes(1));
    // entityTypeKey and tenant scope are immutable after creation and
    // UpdateFieldGroupRequest has no property for either. Sending them would
    // be silently ignored today and actively wrong the moment the backend
    // tightens its binding.
    expect(repository.update).toHaveBeenCalledWith("a", {
      labelEn: "Alpha renamed",
      labelAr: null,
      sortOrder: 4,
    });
  });

  it("never offers the scope switch on EDIT, even to a platform principal", async () => {
    permissionState.isSuperAdmin = true;
    tenantState.isInTenantWorld = false;
    await renderWithEntityType();

    fireEvent.click(screen.getByRole("button", { name: translate("fieldGroup.addNew") }));
    expect(
      await screen.findByRole("switch", { name: translate("fieldGroup.fields.isGlobal") })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: translate("common.cancel") }));
    fireEvent.click(screen.getByRole("button", { name: translate("common.edit") }));

    await screen.findByRole("textbox", { name: translate("fieldGroup.fields.labelEn") });
    expect(
      screen.queryByRole("switch", { name: translate("fieldGroup.fields.isGlobal") })
    ).toBeNull();
  });
});

describe("FieldGroupListView — delete confirmation", () => {
  beforeEach(() => {
    permissionState.isSuperAdmin = false;
    tenantState.isInTenantWorld = true;
    vi.clearAllMocks();
    repository.getByEntityType.mockResolvedValue([makeGroup("a", "Alpha", 0)]);
    repository.delete.mockResolvedValue(undefined);
  });

  it("does not delete on the first click — it asks first, naming the group", async () => {
    await renderWithEntityType();

    fireEvent.click(screen.getByRole("button", { name: translate("common.delete") }));

    const dialog = await screen.findByRole("alertdialog");
    expect(within(dialog).getByText(translate("fieldGroup.deleteTitle"))).toBeInTheDocument();
    expect(dialog.textContent).toContain("Alpha");
    expect(repository.delete).not.toHaveBeenCalled();
  });

  it("states what actually happens to the fields inside: they are ungrouped, not deleted", async () => {
    await renderWithEntityType();
    fireEvent.click(screen.getByRole("button", { name: translate("common.delete") }));
    const dialog = await screen.findByRole("alertdialog");

    // The backend ungroups every member field in the same SaveChanges call and
    // never blocks or cascades. An admin who is not told that will reasonably
    // assume the fields go with the group.
    expect(dialog.textContent).toMatch(/not deleted/i);
    expect(dialog.textContent).toMatch(/ungrouped/i);
  });

  it("deletes only after the confirm action is activated", async () => {
    await renderWithEntityType();
    fireEvent.click(screen.getByRole("button", { name: translate("common.delete") }));
    const dialog = await screen.findByRole("alertdialog");

    fireEvent.click(within(dialog).getByRole("button", { name: translate("common.delete") }));

    await waitFor(() => expect(repository.delete).toHaveBeenCalledWith("a"));
  });

  it("closes the editor when the row being edited is the row deleted", async () => {
    // The editor is a PANEL above the list, not a modal over it, so the row's
    // own Delete button stays live while its Edit form is open.
    repository.getByEntityType
      .mockResolvedValueOnce([makeGroup("a", "Alpha", 0)])
      .mockResolvedValue([]);
    await renderWithEntityType();

    fireEvent.click(screen.getByRole("button", { name: translate("common.edit") }));
    await screen.findByRole("textbox", { name: translate("fieldGroup.fields.labelEn") });

    fireEvent.click(screen.getByRole("button", { name: translate("common.delete") }));
    const dialog = await screen.findByRole("alertdialog");
    fireEvent.click(within(dialog).getByRole("button", { name: translate("common.delete") }));

    await waitFor(() => expect(repository.delete).toHaveBeenCalledWith("a"));
    // An "Edit Field Group" form over a group that no longer exists offers an
    // edit for nothing.
    await waitFor(() =>
      expect(
        screen.queryByRole("textbox", { name: translate("fieldGroup.fields.labelEn") })
      ).toBeNull()
    );
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("saves an edit as an UPDATE even when the edited row has vanished from the refetched list", async () => {
    // The identity bug this pins, in full: the editor panel used to resolve its
    // target by looking the id up in `vm.groups`, while the panel's OPEN state
    // and its heading keyed off the id itself. Any refetch that dropped the row
    // — a concurrent delete elsewhere, or the invalidation a reorder fires —
    // left the heading reading "Edit Field Group" while the submit handler took
    // the create branch, so Save wrote a BRAND-NEW group.
    //
    // Reached here without deleting anything: reorder invalidates the list, and
    // the second fetch no longer contains the edited row.
    repository.getByEntityType
      .mockResolvedValueOnce([
        makeGroup("a", "Alpha", 0),
        makeGroup("b", "Beta", 1),
        makeGroup("c", "Gamma", 2),
      ])
      .mockResolvedValue([makeGroup("b", "Beta", 0), makeGroup("c", "Gamma", 1)]);
    repository.reorder.mockResolvedValue(undefined);
    repository.update.mockResolvedValue(undefined);
    await renderWithEntityType();

    // Edit the FIRST row (Alpha), then move the second row down: the reorder
    // invalidation refetches a list Alpha is no longer in.
    fireEvent.click(screen.getAllByRole("button", { name: translate("common.edit") })[0]);
    const labelEn = await screen.findByRole("textbox", {
      name: translate("fieldGroup.fields.labelEn"),
    });
    expect(labelEn).toHaveValue("Alpha");

    fireEvent.click(screen.getAllByRole("button", { name: translate("fieldGroup.moveDown") })[1]);
    await waitFor(() => expect(repository.reorder).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getAllByRole("listitem")).toHaveLength(2));

    // The panel is still open, still headed "Edit", and the admin's typed value
    // is still there — the remount key follows the id, not the resolved row.
    expect(
      screen.getByRole("heading", { name: translate("fieldGroup.editTitle") })
    ).toBeInTheDocument();
    fireEvent.change(labelEn, { target: { value: "Alpha renamed" } });
    fireEvent.click(screen.getByRole("button", { name: translate("common.save") }));

    await waitFor(() => expect(repository.update).toHaveBeenCalledTimes(1));
    expect(repository.update).toHaveBeenCalledWith("a", {
      labelEn: "Alpha renamed",
      labelAr: null,
      sortOrder: 0,
    });
    // The whole point: no spurious row was created under an Edit heading.
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("deletes nothing when the confirmation is cancelled", async () => {
    await renderWithEntityType();
    fireEvent.click(screen.getByRole("button", { name: translate("common.delete") }));
    const dialog = await screen.findByRole("alertdialog");

    fireEvent.click(within(dialog).getByRole("button", { name: translate("common.cancel") }));

    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
    expect(repository.delete).not.toHaveBeenCalled();
  });
});

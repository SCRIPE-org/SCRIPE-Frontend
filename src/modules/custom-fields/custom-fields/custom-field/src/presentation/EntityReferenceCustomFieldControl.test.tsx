// EntityReferenceCustomFieldControl -- Wave 4 item 4.
//
// Mirrors MultiSelectCustomFieldControl.test.tsx's mocking conventions (same
// settings-provider mock, same param-echoing i18n mock, same ResizeObserver /
// scrollIntoView jsdom polyfills the Popover+cmdk stack needs even when a test
// never opens the panel), because this control is built on those same
// primitives.
//
// The two lookup hooks are mocked rather than driven through a fake HTTP layer
// on purpose: they belong to the entity-lookup data layer, which owns its own
// request/cancellation/paging tests. What is under test HERE is the control's
// side of that contract -- that every documented status becomes a distinct,
// localized, accessible rendering, and that a selection leaves this file as
// `{ entityTypeKey, entityId }` and nothing else.
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom";
import { EntityReferenceCustomFieldControl } from "./EntityReferenceCustomFieldControl";

vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({
    switchStyle: "default",
    fontSize: "default",
    inputStyle: "default",
    badgeStyle: "default",
  }),
}));

// Echoes the key, and the interpolation params alongside it, so an assertion
// can prove the RIGHT value reached `t` (the resolved record's name in
// `selectedLabel`, the result count in the live region) rather than merely that
// some translated string rendered.
vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) =>
      params ? `${key}:${JSON.stringify(params)}` : key,
    language: "en",
    direction: "ltr",
  }),
}));

// Swappable per test. `vi.hoisted` so the holder exists before the two
// `vi.mock` factories below are hoisted above the imports.
const hooks = vi.hoisted(() => ({
  search: null as null | ((args: { entityTypeKey: string; enabled: boolean }) => unknown),
  resolve: null as null | ((reference: unknown) => unknown),
}));

vi.mock("../../../entity-lookup/src/presentation/hooks/useEntityLookupSearch", () => ({
  useEntityLookupSearch: (args: { entityTypeKey: string; enabled: boolean }) =>
    (hooks.search as (a: typeof args) => unknown)(args),
}));

vi.mock("../../../entity-lookup/src/presentation/hooks/useResolveEntityReference", () => ({
  useResolveEntityReference: (reference: unknown) =>
    (hooks.resolve as (r: unknown) => unknown)(reference),
}));

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

const USER_TYPE = "identity.user";

const AHMED = { id: "enc-ahmed", displayName: "Ahmed Ali", secondary: "ahmed@club.test", isActive: true };
const DORMANT = { id: "enc-dormant", displayName: "Sara Nabil", secondary: "sara@club.test", isActive: false };

/** Every field of the search hook's contract, with spies for the callables. */
function searchStub(overrides: Record<string, unknown> = {}) {
  return {
    query: "",
    setQuery: vi.fn(),
    items: [] as unknown[],
    isLoading: false,
    isLoadingMore: false,
    hasNextPage: false,
    loadMore: vi.fn(),
    error: null as unknown,
    reload: vi.fn(),
    ...overrides,
  };
}

/** Every field of the resolve hook's contract, for one status. */
function resolveStub(status: string, item: unknown = null) {
  return { item, status, retry: vi.fn() };
}

// Each render re-invokes the mocked hooks, so the objects they return must be
// created ONCE per test and handed back on every render -- a fresh spy per
// render would make "called once" meaningless.
let currentSearch: ReturnType<typeof searchStub>;
let currentResolve: ReturnType<typeof resolveStub>;
let searchArgs: { entityTypeKey: string; enabled: boolean }[];

beforeEach(() => {
  currentSearch = searchStub();
  currentResolve = resolveStub("idle");
  searchArgs = [];
  hooks.search = (args) => {
    searchArgs.push(args);
    return currentSearch;
  };
  hooks.resolve = () => currentResolve;
});

afterEach(() => {
  vi.useRealTimers();
});

type ControlProps = React.ComponentProps<typeof EntityReferenceCustomFieldControl>;

function renderControl(overrides: Partial<ControlProps> = {}) {
  const onChange = vi.fn();
  const utils = render(
    <EntityReferenceCustomFieldControl
      id="cf_owner"
      label="Owner"
      targetEntityTypeKey={USER_TYPE}
      value={null}
      onChange={onChange}
      {...overrides}
    />
  );
  return { ...utils, onChange };
}

/** Opens the panel the way a keyboard-only user does -- never via a click. */
function openPanel(): HTMLElement {
  const trigger = screen.getByRole("combobox");
  trigger.focus();
  fireEvent.keyDown(trigger, { key: "Enter" });
  return trigger;
}

describe("EntityReferenceCustomFieldControl", () => {
  // ── State 1: no target entity type configured ──────────────────────────
  describe("with no target entity type configured", () => {
    it("explains itself and disables the field instead of offering an empty dropdown", () => {
      renderControl({ targetEntityTypeKey: null });

      expect(
        screen.getByText("customField.entityReference.noTargetConfigured")
      ).toBeInTheDocument();

      const trigger = screen.getByRole("combobox", { name: "Owner" });
      expect(trigger).toHaveAttribute("aria-disabled", "true");
      // Out of the tab order too: an "operable" control that cannot be
      // operated is worse than a visibly disabled one.
      expect(trigger).toHaveAttribute("tabindex", "-1");
    });

    it("cannot be opened by keyboard OR pointer, so there is no empty listbox to land in", () => {
      renderControl({ targetEntityTypeKey: undefined });
      const trigger = screen.getByRole("combobox");

      fireEvent.keyDown(trigger, { key: "Enter" });
      fireEvent.keyDown(trigger, { key: "ArrowDown" });
      fireEvent.click(trigger);

      expect(trigger).toHaveAttribute("aria-expanded", "false");
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      expect(document.querySelector("[cmdk-input]")).toBeNull();
    });

    it("treats a whitespace-only key as no key, rather than searching a type the server cannot route", () => {
      renderControl({ targetEntityTypeKey: "   " });
      expect(
        screen.getByText("customField.entityReference.noTargetConfigured")
      ).toBeInTheDocument();
      expect(searchArgs.every((a) => a.enabled === false)).toBe(true);
    });

    it("never enables the lookup search", () => {
      renderControl({ targetEntityTypeKey: null });
      expect(searchArgs.length).toBeGreaterThan(0);
      expect(searchArgs.every((a) => a.enabled === false)).toBe(true);
    });

    it("still renders a value it already holds -- only CHANGING it is disabled", () => {
      // Resolution is keyed off the value's own entityTypeKey, so a definition
      // that lost its pinned target does not hide what the record stores.
      currentResolve = resolveStub("resolved", AHMED);
      renderControl({
        targetEntityTypeKey: null,
        value: { entityTypeKey: USER_TYPE, entityId: AHMED.id },
      });

      expect(screen.getByRole("combobox")).toHaveTextContent("Ahmed Ali");
      expect(screen.getByRole("combobox")).toHaveAttribute("aria-disabled", "true");
    });
  });

  // ── Accessibility ──────────────────────────────────────────────────────
  describe("accessibility", () => {
    it("names the combobox with the label, which <Label htmlFor> alone could not do", () => {
      renderControl();
      // The <label for> is real DOM wiring sighted users benefit from...
      expect(screen.getByText("Owner", { selector: "label" })).toHaveAttribute("for", "cf_owner");
      // ...but the accessible name of a role="combobox" div comes only from
      // aria-label/aria-labelledby.
      expect(screen.getByRole("combobox", { name: "Owner" })).toHaveAttribute("id", "cf_owner");
    });

    it("falls the accessible name back to the id when no label is supplied", () => {
      renderControl({ label: undefined });
      expect(screen.getByRole("combobox", { name: "cf_owner" })).toBeInTheDocument();
    });

    it("sets aria-invalid when the caller marks the field invalid", () => {
      renderControl({ invalid: true });
      expect(screen.getByRole("combobox")).toHaveAttribute("aria-invalid", "true");
    });

    it("keeps the caller's describedBy while adding its own note", () => {
      renderControl({ describedBy: "form-help", targetEntityTypeKey: null });
      const describedBy = screen.getByRole("combobox").getAttribute("aria-describedby") ?? "";
      const ids = describedBy.split(" ").filter(Boolean);

      expect(ids).toContain("form-help");
      // The control's own note is a SECOND id, not a replacement -- the form's
      // help text must survive.
      expect(ids.length).toBe(2);
      const own = ids.find((candidate) => candidate !== "form-help") as string;
      expect(document.getElementById(own)).toHaveTextContent(
        "customField.entityReference.noTargetConfigured"
      );
    });

    it("passes the caller's describedBy through untouched when it has no note of its own", () => {
      currentResolve = resolveStub("loading");
      renderControl({
        describedBy: "form-help",
        value: { entityTypeKey: USER_TYPE, entityId: AHMED.id },
      });
      expect(screen.getByRole("combobox")).toHaveAttribute("aria-describedby", "form-help");
    });

    it("marks the field aria-busy while a held reference is still resolving", () => {
      currentResolve = resolveStub("loading");
      renderControl({ value: { entityTypeKey: USER_TYPE, entityId: AHMED.id } });

      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveAttribute("aria-busy", "true");
      expect(trigger).toHaveTextContent("customField.entityReference.resolving");
    });

    it("drops aria-busy once resolution finishes", () => {
      currentResolve = resolveStub("resolved", AHMED);
      renderControl({ value: { entityTypeKey: USER_TYPE, entityId: AHMED.id } });
      expect(screen.getByRole("combobox")).not.toHaveAttribute("aria-busy");
    });

    it("is fully keyboard operable, and keeps focus inside the control across open and close", async () => {
      currentSearch = searchStub({ items: [AHMED] });
      renderControl();
      const trigger = openPanel();

      expect(trigger).toHaveAttribute("aria-expanded", "true");
      // Focus moves INTO the panel's search box, never to document.body --
      // cmdk's whole keymap only sees keys that bubble through its subtree.
      const panelInput = document.querySelector("[cmdk-input]") as HTMLInputElement;
      expect(panelInput).not.toBeNull();
      expect(panelInput).toHaveFocus();

      // Closing hands focus back to the field the user came from -- never to
      // document.body, which would strand a keyboard user at the top of the
      // page. Awaited because Radix's FocusScope dispatches its
      // unmount-auto-focus on a macrotask, not synchronously with the close.
      fireEvent.keyDown(panelInput, { key: "Escape" });
      expect(trigger).toHaveAttribute("aria-expanded", "false");
      await waitFor(() => expect(trigger).toHaveFocus());
    });

    it("lets a keyboard-only user pick a record end to end", () => {
      currentSearch = searchStub({ items: [AHMED, DORMANT] });
      const { onChange } = renderControl();
      openPanel();

      const panelInput = document.querySelector("[cmdk-input]") as HTMLInputElement;
      // cmdk highlights the first row on open; step to the second and commit.
      fireEvent.keyDown(panelInput, { key: "ArrowDown" });
      fireEvent.keyDown(panelInput, { key: "Enter" });

      expect(onChange).toHaveBeenCalledWith({
        entityTypeKey: USER_TYPE,
        entityId: DORMANT.id,
      });
    });
  });

  // ── Debounce: N keystrokes, ONE request ────────────────────────────────
  describe("search debounce", () => {
    it("collapses a burst of keystrokes into a single lookup request", () => {
      // The debounce itself belongs to useEntityLookupSearch, so it is
      // reconstructed here at the mock boundary exactly as that hook's
      // contract states it (300ms, on the REQUEST, keyed off setQuery). What
      // this pins down is the control's half of that contract, and it fails
      // loudly on both realistic ways of getting it wrong:
      //   * no debounce anywhere (the control driving a request per keystroke,
      //     or an unstable hook argument remounting it per character) -> the
      //     spy has 5 calls before any timer is advanced;
      //   * a SECOND debounce added on this side of the boundary, e.g. by
      //     routing the panel through GenericSelect's own 300ms server-search
      //     timer -> the spy still has 0 calls after 300ms.
      // Only "every keystroke forwarded immediately, request debounced once"
      // passes both halves.
      const requestSpy = vi.fn();
      hooks.search = (args) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks -- this IS a hook body; it stands in for the real one.
        const [query, setQuery] = React.useState("");
        // eslint-disable-next-line react-hooks/rules-of-hooks
        React.useEffect(() => {
          if (!args.enabled || query === "") return;
          const timer = setTimeout(() => requestSpy(query), 300);
          return () => clearTimeout(timer);
        }, [query, args.enabled]);
        return searchStub({ query, setQuery });
      };

      renderControl();
      openPanel();
      const panelInput = document.querySelector("[cmdk-input]") as HTMLInputElement;

      // Fake timers only from here: switching before the panel opens would
      // also freeze the primitives' own mount work.
      vi.useFakeTimers();
      const typed = "ahmed";
      for (let i = 1; i <= typed.length; i += 1) {
        fireEvent.change(panelInput, { target: { value: typed.slice(0, i) } });
      }

      // Nothing has gone out yet -- this is the half that fails if the
      // debounce is removed.
      expect(requestSpy).not.toHaveBeenCalled();

      vi.advanceTimersByTime(300);

      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(requestSpy).toHaveBeenCalledWith("ahmed");
    });

    it("forwards every keystroke to the hook immediately -- the input must never lag behind the typist", () => {
      renderControl();
      openPanel();
      const panelInput = document.querySelector("[cmdk-input]") as HTMLInputElement;

      fireEvent.change(panelInput, { target: { value: "a" } });
      fireEvent.change(panelInput, { target: { value: "ah" } });

      // The REQUEST is debounced; the query handoff is not. A control that
      // debounced this side too would drop characters under a fast typist.
      expect(currentSearch.setQuery).toHaveBeenNthCalledWith(1, "a");
      expect(currentSearch.setQuery).toHaveBeenNthCalledWith(2, "ah");
      expect(panelInput.value).toBe("ah");
    });
  });

  // ── The picker ─────────────────────────────────────────────────────────
  describe("the picker", () => {
    it("does not search until the panel is actually opened", () => {
      renderControl();
      expect(searchArgs.every((a) => a.enabled === false)).toBe(true);

      openPanel();

      const last = searchArgs[searchArgs.length - 1];
      expect(last.enabled).toBe(true);
      expect(last.entityTypeKey).toBe(USER_TYPE);
    });

    it("emits `entityTypeKey` and `entityId`, and no third property", () => {
      currentSearch = searchStub({ items: [AHMED] });
      const { onChange } = renderControl();
      openPanel();

      fireEvent.click(screen.getByRole("option", { name: /Ahmed Ali/ }));

      expect(onChange).toHaveBeenCalledTimes(1);
      const emitted = onChange.mock.calls[0][0] as Record<string, unknown>;
      // `encryptedEntityId` is asserted absent specifically, because it is the
      // name the backend's C# record invites and it is NOT a wire name -- a save
      // carrying it instead of `entityId` is refused as the 422 written for a
      // half-filled reference, after the owner row is already written. There is
      // no translation step downstream to undo it: the emitted shape IS the
      // submitted shape.
      expect(Object.keys(emitted).sort()).toEqual(["entityId", "entityTypeKey"]);
      expect(emitted).not.toHaveProperty("encryptedEntityId");
      expect(emitted).toEqual({ entityTypeKey: USER_TYPE, entityId: AHMED.id });
    });

    it("renders the secondary line as row context rather than dropping it", () => {
      currentSearch = searchStub({ items: [AHMED] });
      renderControl();
      openPanel();
      expect(screen.getByRole("option", { name: /ahmed@club\.test/ })).toBeInTheDocument();
    });

    it("offers a keyboard-reachable load-more only while another page exists", () => {
      currentSearch = searchStub({ items: [AHMED], hasNextPage: true });
      renderControl();
      openPanel();

      const loadMore = screen.getByRole("button", { name: "customField.entityReference.loadMore" });
      // A real Tab stop outside the listbox, not a fake option row.
      expect(loadMore.closest("[role='listbox']")).toBeNull();
      fireEvent.click(loadMore);
      expect(currentSearch.loadMore).toHaveBeenCalledTimes(1);
    });

    it("hides load-more on the last page", () => {
      currentSearch = searchStub({ items: [AHMED], hasNextPage: false });
      renderControl();
      openPanel();
      expect(
        screen.queryByRole("button", { name: "customField.entityReference.loadMore" })
      ).not.toBeInTheDocument();
    });

    it("distinguishes an unmatched search from a failed one", () => {
      currentSearch = searchStub({ items: [] });
      renderControl();
      openPanel();
      expect(screen.getByText("customField.entityReference.noResults")).toBeInTheDocument();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("surfaces a failed lookup with a retry rather than an empty list", () => {
      currentSearch = searchStub({ items: [], error: { status: 500 } });
      renderControl();
      openPanel();

      // searchFailed, NOT resolveFailed. resolveFailed's copy asserts "the reference
      // itself is fine" -- a reassurance about the stored value that a failed search says
      // nothing about, and that would invite an operator to leave a genuinely broken
      // reference alone. The resolve-failure test below asserts the other string, so the
      // two cannot be quietly collapsed back into one.
      expect(screen.getByRole("alert")).toHaveTextContent(
        "customField.entityReference.searchFailed"
      );
      expect(screen.queryByText("customField.entityReference.noResults")).not.toBeInTheDocument();
    });

    it("announces progress and result counts to a screen reader", () => {
      currentSearch = searchStub({ isLoading: true });
      const { rerender } = renderControl();
      openPanel();
      expect(screen.getByText("customField.entityReference.searching")).toBeInTheDocument();

      currentSearch = searchStub({ items: [AHMED, DORMANT] });
      rerender(
        <EntityReferenceCustomFieldControl
          id="cf_owner"
          label="Owner"
          targetEntityTypeKey={USER_TYPE}
          value={null}
          onChange={vi.fn()}
        />
      );
      expect(
        screen.getByText(`components.select.optionsAvailable:${JSON.stringify({ count: 2 })}`)
      ).toBeInTheDocument();
    });
  });

  // ── State 2: resolving / resolved, dormant included ────────────────────
  describe("a resolved reference", () => {
    it("renders the resolved name and its secondary line, never the encrypted id", () => {
      currentResolve = resolveStub("resolved", AHMED);
      renderControl({ value: { entityTypeKey: USER_TYPE, entityId: AHMED.id } });

      expect(screen.getByRole("combobox")).toHaveTextContent("Ahmed Ali");
      expect(screen.getByText("ahmed@club.test")).toBeInTheDocument();
      // The encrypted id is a transport detail; showing it to an operator is
      // indistinguishable from showing them nothing.
      expect(document.body.textContent).not.toContain(AHMED.id);
    });

    it("announces which record is selected, since a combobox's name is its label, not its value", () => {
      currentResolve = resolveStub("resolved", AHMED);
      renderControl({ value: { entityTypeKey: USER_TYPE, entityId: AHMED.id } });

      // selectedLabel takes no interpolation by design (see the locale file's own comment):
      // it names the element that shows the selection, and the resolved name is rendered
      // beside it rather than inside it, so a missed interpolation cannot leak a raw
      // placeholder into the page.
      expect(
        screen.getByText("customField.entityReference.selectedLabel")
      ).toBeInTheDocument();
      expect(screen.getByRole("combobox")).toHaveTextContent("Ahmed Ali");
    });

    it("marks a dormant record visibly while keeping it a perfectly valid value", () => {
      currentResolve = resolveStub("resolved", DORMANT);
      renderControl({ value: { entityTypeKey: USER_TYPE, entityId: DORMANT.id } });

      // isActive:false means present-but-dormant. A deleted row does not
      // resolve at all -- it 404s -- so this must not read as an error.
      expect(screen.getByText("customField.entityReference.inactiveSuffix")).toBeInTheDocument();
      expect(screen.getByRole("combobox")).toHaveTextContent("Sara Nabil");
      expect(screen.getByRole("combobox")).not.toHaveAttribute("aria-invalid");
      expect(screen.getByRole("combobox")).not.toHaveAttribute("aria-readonly");
    });

    it("keeps a dormant record selectable in the list", () => {
      currentSearch = searchStub({ items: [DORMANT] });
      const { onChange } = renderControl();
      openPanel();

      const row = screen.getByRole("option", { name: /Sara Nabil/ });
      expect(row).not.toHaveAttribute("aria-disabled", "true");
      fireEvent.click(row);
      expect(onChange).toHaveBeenCalledWith({ entityTypeKey: USER_TYPE, entityId: DORMANT.id });
    });
  });

  // ── States 3-5: three failures, three sentences ────────────────────────
  describe("resolution failures", () => {
    it("renders 403 as a caller-permission fact, and keeps the field readable but non-editable", () => {
      currentResolve = resolveStub("forbidden");
      renderControl({ value: { entityTypeKey: USER_TYPE, entityId: AHMED.id } });

      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveTextContent("customField.entityReference.forbidden");
      // readOnly, not disabled: the reference is fine, this caller just cannot
      // read the target. Blanking it would invite an overwrite by someone with
      // no visibility into what they are replacing.
      expect(trigger).toHaveAttribute("aria-readonly", "true");
      expect(trigger).not.toHaveAttribute("aria-disabled");
      fireEvent.keyDown(trigger, { key: "Enter" });
      // Pointer too: `PopoverTrigger asChild disabled` is inert over a <div>,
      // so the click path needs its own guard and is asserted separately.
      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute("aria-expanded", "false");
      // ...and it cannot be silently cleared either.
      expect(
        screen.queryByRole("button", { name: "common.clearSelection" })
      ).not.toBeInTheDocument();
    });

    it("renders 404 as a fact about the data, and stays editable so re-picking can fix it", () => {
      currentResolve = resolveStub("missing");
      renderControl({ value: { entityTypeKey: USER_TYPE, entityId: AHMED.id } });

      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveTextContent("customField.entityReference.missing");
      expect(trigger).not.toHaveAttribute("aria-readonly");
      fireEvent.keyDown(trigger, { key: "Enter" });
      expect(trigger).toHaveAttribute("aria-expanded", "true");
    });

    it("renders 400 as a malformed stored id, and says so through aria-invalid", () => {
      currentResolve = resolveStub("invalid");
      renderControl({ value: { entityTypeKey: USER_TYPE, entityId: "tampered" } });

      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveTextContent("customField.entityReference.invalid");
      // Unlike a dangling reference, this is not a value the system ever
      // legitimately produced.
      expect(trigger).toHaveAttribute("aria-invalid", "true");
    });

    it("keeps forbidden, missing and invalid as three DIFFERENT sentences", () => {
      // The regression this guards is collapsing 403 and 404 into one grey
      // dash: the remedies are a role change and a data change, and a shared
      // message hides which one is needed.
      const seen = new Set<string>();
      for (const status of ["forbidden", "missing", "invalid"]) {
        currentResolve = resolveStub(status);
        const { unmount } = renderControl({
          value: { entityTypeKey: USER_TYPE, entityId: AHMED.id },
        });
        seen.add(screen.getByRole("combobox").textContent ?? "");
        unmount();
      }
      expect(seen.size).toBe(3);
    });

    it("offers a retry for a transport failure, which is neither a permission nor a data fact", () => {
      currentResolve = resolveStub("error");
      renderControl({ value: { entityTypeKey: USER_TYPE, entityId: AHMED.id } });

      expect(screen.getByRole("combobox")).toHaveTextContent(
        "customField.entityReference.resolveFailed"
      );
      fireEvent.click(screen.getByRole("button", { name: "customField.entityReference.retry" }));
      expect(currentResolve.retry).toHaveBeenCalledTimes(1);
    });

    it("does not leave a stale failure sentence behind once the value is cleared", () => {
      // Guards against a hook that keeps its last status: an empty field must
      // read as empty, not as "referenced record no longer exists".
      currentResolve = resolveStub("missing");
      renderControl({ value: null });
      expect(screen.getByRole("combobox")).toHaveTextContent(
        "customField.entityReference.placeholder"
      );
      expect(screen.getByRole("combobox")).not.toHaveTextContent(
        "customField.entityReference.missing"
      );
    });
  });

  // ── Clearing ───────────────────────────────────────────────────────────
  describe("clearing", () => {
    it("emits null, never an empty-string husk", () => {
      currentResolve = resolveStub("resolved", AHMED);
      const { onChange } = renderControl({
        value: { entityTypeKey: USER_TYPE, entityId: AHMED.id },
      });

      fireEvent.click(screen.getByRole("button", { name: "common.clearSelection" }));

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(null);
    });

    it("offers no clear affordance on a required field", () => {
      currentResolve = resolveStub("resolved", AHMED);
      renderControl({ required: true, value: { entityTypeKey: USER_TYPE, entityId: AHMED.id } });

      // Clearing a required field only trades a resolvable reference for a
      // validation error, so the control does not offer it.
      expect(
        screen.queryByRole("button", { name: "common.clearSelection" })
      ).not.toBeInTheDocument();
      expect(screen.getByRole("combobox")).toHaveAttribute("aria-required", "true");
    });
  });

  // ── Caller-level disable ───────────────────────────────────────────────
  it("disables the whole control when the caller disables it, target or not", () => {
    currentResolve = resolveStub("resolved", AHMED);
    renderControl({ disabled: true, value: { entityTypeKey: USER_TYPE, entityId: AHMED.id } });

    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveAttribute("aria-disabled", "true");
    fireEvent.keyDown(trigger, { key: "Enter" });
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    // The held value still reads, so a disabled form is not a blank one.
    expect(trigger).toHaveTextContent("Ahmed Ali");
    expect(searchArgs.every((a) => a.enabled === false)).toBe(true);
  });

  it("uses the caller's placeholder over its own default when one is supplied", () => {
    renderControl({ placeholder: "Pick an owner" });
    expect(screen.getByRole("combobox")).toHaveTextContent("Pick an owner");
  });
});

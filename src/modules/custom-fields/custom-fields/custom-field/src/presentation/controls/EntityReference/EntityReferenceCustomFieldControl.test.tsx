/* eslint-disable @typescript-eslint/no-explicit-any */
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
  availableTypes: null as null | (() => unknown),
}));

vi.mock("../../../../../entity-lookup/src/presentation/hooks/useEntityLookupSearch", () => ({
  useEntityLookupSearch: (args: { entityTypeKey: string; enabled: boolean }) =>
    (hooks.search as (a: typeof args) => unknown)(args),
}));

vi.mock("../../../../../entity-lookup/src/presentation/hooks/useResolveEntityReference", () => ({
  useResolveEntityReference: (reference: unknown) =>
    (hooks.resolve as (r: unknown) => unknown)(reference),
}));

// Mocked for the same reason as its two siblings -- it belongs to the lookup
// data layer, which owns its own react-query/caching tests -- and with one extra
// consequence worth naming: the real hook needs a QueryClientProvider, so a call
// count of zero here is genuine evidence that the control never mounted it, not
// an artefact of the mock swallowing the request.
vi.mock(
  "../../../../../entity-lookup/src/presentation/hooks/useEntityLookupAvailableTypes",
  () => ({
    useEntityLookupAvailableTypes: () => (hooks.availableTypes as () => unknown)(),
  })
);

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
const STAFF_TYPE = "hrms.staff-member";

const AHMED = {
  id: "enc-ahmed",
  displayName: "Ahmed Ali",
  secondary: "ahmed@club.test",
  isActive: true,
};
const DORMANT = {
  id: "enc-dormant",
  displayName: "Sara Nabil",
  secondary: "sara@club.test",
  isActive: false,
};

/** Real registry shapes -- the server supplies both names, and neither is a locale key. */
const STAFF_TYPE_META = {
  key: STAFF_TYPE,
  owningModule: "Hrms",
  displayNameEn: "Staff Member",
  displayNameAr: "عضو الفريق",
};
const USER_TYPE_META = {
  key: USER_TYPE,
  owningModule: "Identity",
  displayNameEn: "User",
  displayNameAr: "المستخدم",
};

/**
 * The type selector's accessible name, as the echoing `t` mock renders it.
 *
 * Spelled out rather than matched loosely because it is the a11y claim itself:
 * the second combobox must be nameable, and named after the FIELD it belongs to
 * so two reference fields on one form are told apart.
 */
const TYPE_FIELD_NAME = `customField.entityReference.typeLabelFor:${JSON.stringify({
  field: "Owner",
})}`;

/** The record combobox. Named explicitly -- an unpinned field renders two. */
function recordField(): HTMLElement {
  return screen.getByRole("combobox", { name: "Owner" });
}

/** The type combobox, which exists only for an unpinned definition. */
function typeField(): HTMLElement {
  return screen.getByRole("combobox", { name: TYPE_FIELD_NAME });
}

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

/**
 * Every field of the available-types hook's contract.
 *
 * `isEmpty` is a separate flag from `types.length === 0` in the real hook, and
 * is kept separate here: a stub that derived one from the other could not
 * express "still loading" or "failed", which are the two states that must NOT
 * render as "there is nothing you may reference".
 */
function availableTypesStub(overrides: Record<string, unknown> = {}) {
  return {
    types: [STAFF_TYPE_META, USER_TYPE_META] as unknown[],
    isLoading: false,
    isError: false,
    isEmpty: false,
    refetch: vi.fn(),
    ...overrides,
  };
}

// Each render re-invokes the mocked hooks, so the objects they return must be
// created ONCE per test and handed back on every render -- a fresh spy per
// render would make "called once" meaningless.
let currentSearch: ReturnType<typeof searchStub>;
let currentResolve: ReturnType<typeof resolveStub>;
let currentTypes: ReturnType<typeof availableTypesStub>;
let searchArgs: { entityTypeKey: string; enabled: boolean }[];
/** How many times the control mounted the available-types hook. Zero means "never asked". */
let availableTypesCalls: number;

beforeEach(() => {
  currentSearch = searchStub();
  currentResolve = resolveStub("idle");
  currentTypes = availableTypesStub();
  searchArgs = [];
  availableTypesCalls = 0;
  hooks.search = (args) => {
    searchArgs.push(args);
    return currentSearch;
  };
  hooks.resolve = () => currentResolve;
  hooks.availableTypes = () => {
    availableTypesCalls += 1;
    return currentTypes;
  };
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

/** Opens the RECORD panel the way a keyboard-only user does -- never via a click. */
function openPanel(): HTMLElement {
  const trigger = recordField();
  trigger.focus();
  fireEvent.keyDown(trigger, { key: "Enter" });
  return trigger;
}

/** Opens the TYPE panel, keyboard-only, same as `openPanel`. */
function openTypePanel(): HTMLElement {
  const trigger = typeField();
  trigger.focus();
  fireEvent.keyDown(trigger, { key: "Enter" });
  return trigger;
}

/** The cmdk search box of whichever panel is currently open. Only one ever is. */
function panelInput(): HTMLInputElement {
  return document.querySelector("[cmdk-input]") as HTMLInputElement;
}

describe("EntityReferenceCustomFieldControl", () => {
  // ── State 1: the definition pinned no target (the DEFAULT shape) ────────
  //
  // This is not an edge case: the definition form offers "Not pinned" first and
  // createInitialValues seeds exactly that, so an unpinned EntityReference is
  // what an admin gets by default. It used to render a permanently disabled
  // field -- unfillable, and, when the field was also required, unsatisfiable:
  // isRequiredFieldEmpty reported it empty and blocked the whole record's
  // submit with nothing the operator could do about it. So the assertions here
  // are about the field being COMPLETABLE, in two steps, by keyboard alone.
  describe("with an unpinned definition (no target entity type)", () => {
    it("offers a type selector, and keeps the record field inert until a type is chosen", () => {
      renderControl({ targetEntityTypeKey: null });

      // Step one is operable...
      const type = typeField();
      expect(type).not.toHaveAttribute("aria-disabled");
      expect(type).toHaveAttribute("tabindex", "0");
      expect(type).toHaveTextContent("customField.entityReference.typePlaceholder");

      // ...and step two is not, yet. Out of the tab order too: an "operable"
      // control that cannot be operated is worse than a visibly disabled one.
      const record = recordField();
      expect(record).toHaveAttribute("aria-disabled", "true");
      expect(record).toHaveAttribute("tabindex", "-1");

      // And the note is an instruction about the two steps, not a dead end.
      expect(
        screen.getByText("customField.entityReference.noTargetConfigured")
      ).toBeInTheDocument();
      // Nothing to search until a type exists.
      expect(searchArgs.every((a) => a.enabled === false)).toBe(true);
    });

    it("does not read the available types until the type panel is actually opened", () => {
      renderControl({ targetEntityTypeKey: null });
      // A record form can carry several unpinned reference fields; mounting the
      // list on render would query the lookup registry for panels nobody opens.
      expect(availableTypesCalls).toBe(0);

      openTypePanel();

      expect(availableTypesCalls).toBeGreaterThan(0);
    });

    it("lets a keyboard-only user choose a type and then a record, and stamps THAT type on the value", () => {
      currentSearch = searchStub({ items: [AHMED] });
      const { onChange } = renderControl({ targetEntityTypeKey: null });

      openTypePanel();
      fireEvent.click(screen.getByRole("option", { name: /Staff Member/ }));

      // The closed field shows the server-supplied name, and the record field
      // has come alive.
      expect(typeField()).toHaveTextContent("Staff Member");
      expect(recordField()).not.toHaveAttribute("aria-disabled");

      // The picker now queries the CHOSEN type...
      openPanel();
      expect(searchArgs[searchArgs.length - 1]).toMatchObject({
        entityTypeKey: STAFF_TYPE,
        enabled: true,
      });

      // ...and the emitted value carries it, not the type of some other field.
      fireEvent.click(screen.getByRole("option", { name: /Ahmed Ali/ }));
      expect(onChange).toHaveBeenCalledWith({
        entityTypeKey: STAFF_TYPE,
        entityId: AHMED.id,
      });
    });

    it("keeps the type selector after a choice, so a wrong type can be changed", () => {
      renderControl({ targetEntityTypeKey: null });
      openTypePanel();
      fireEvent.click(screen.getByRole("option", { name: /Staff Member/ }));

      // Derived from the PROP, never from the choice: a selector that vanished
      // on first use would make a mis-pick permanent for the life of the form.
      openTypePanel();
      fireEvent.click(screen.getByRole("option", { name: /^User/ }));
      expect(typeField()).toHaveTextContent("User");
    });

    it("labels the type field for a screen reader, and after the field it belongs to", () => {
      renderControl({ targetEntityTypeKey: null });

      // The visible label is short; the accessible name names the field, so two
      // reference fields on one form do not both announce as "Record type".
      // The short label is a substring of the long one (Label in Name).
      expect(
        screen.getByText("customField.entityReference.typeLabel", { selector: "label" })
      ).toHaveAttribute("for", "cf_owner__type");
      expect(typeField()).toHaveAttribute("id", "cf_owner__type");
      expect(TYPE_FIELD_NAME).toContain("customField.entityReference.typeLabel");
    });

    it("renders an EXPLANATORY state, not an error, when there is nothing the caller may reference", () => {
      // A 200 with an empty array. `GetAvailableTypes` filters on provider
      // composition as well as permission, so this is a legitimate answer and
      // must not be dressed up as a failure -- nor left as a silently empty
      // dropdown, which reads as "the server returned no records".
      currentTypes = availableTypesStub({ types: [], isEmpty: true });
      renderControl({ targetEntityTypeKey: null });
      openTypePanel();

      expect(screen.getByText("customField.entityReference.noTypesAvailable")).toBeInTheDocument();
      expect(
        screen.getByText("customField.entityReference.noTypesAvailableHint")
      ).toBeInTheDocument();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "common.retry" })).not.toBeInTheDocument();
      expect(screen.queryByRole("option")).not.toBeInTheDocument();
    });

    it("offers a retry when the type list could not be fetched at all", () => {
      // The one branch a retry actually fixes, and the one that must NOT share
      // a sentence with "you may not reference anything".
      currentTypes = availableTypesStub({ types: [], isError: true });
      renderControl({ targetEntityTypeKey: null });
      openTypePanel();

      expect(screen.getByRole("alert")).toHaveTextContent(
        "customField.entityReference.typesFailed"
      );
      expect(
        screen.queryByText("customField.entityReference.noTypesAvailable")
      ).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "common.retry" }));
      expect(currentTypes.refetch).toHaveBeenCalledTimes(1);
    });

    it("claims neither emptiness nor failure while the type list is in flight", () => {
      currentTypes = availableTypesStub({ types: [], isLoading: true });
      renderControl({ targetEntityTypeKey: null });
      openTypePanel();

      expect(
        screen.queryByText("customField.entityReference.noTypesAvailable")
      ).not.toBeInTheDocument();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(screen.getByText("common.loading")).toBeInTheDocument();
    });

    it("treats a whitespace-only key as no key, rather than searching a type the server cannot route", () => {
      renderControl({ targetEntityTypeKey: "   " });
      expect(typeField()).toBeInTheDocument();
      expect(searchArgs.every((a) => a.enabled === false)).toBe(true);
    });

    it("still renders a value it already holds while the type is being chosen", () => {
      // Resolution is keyed off the value's own entityTypeKey, so a definition
      // that lost its pinned target does not hide what the record stores.
      currentResolve = resolveStub("resolved", AHMED);
      renderControl({
        targetEntityTypeKey: null,
        value: { entityTypeKey: USER_TYPE, entityId: AHMED.id },
      });

      expect(recordField()).toHaveTextContent("Ahmed Ali");
      expect(recordField()).toHaveAttribute("aria-disabled", "true");
    });

    it("takes the whole control out of action when the caller disables it", () => {
      renderControl({ targetEntityTypeKey: null, disabled: true });

      const type = typeField();
      expect(type).toHaveAttribute("aria-disabled", "true");
      fireEvent.keyDown(type, { key: "Enter" });
      // Pointer too: `PopoverTrigger asChild disabled` is inert over a <div>,
      // so the click path needs its own guard.
      fireEvent.click(type);
      expect(type).toHaveAttribute("aria-expanded", "false");
      expect(availableTypesCalls).toBe(0);
    });
  });

  // ── A pinned definition behaves exactly as it did ───────────────────────
  describe("with a pinned target entity type", () => {
    it("shows NO type selector -- there is nothing to choose", () => {
      renderControl();

      // One combobox, not two. UserReference is permanently in this case: its
      // target is server-resolved to identity.user, so offering a choice would
      // be offering a decision the backend has already made.
      expect(screen.getAllByRole("combobox")).toHaveLength(1);
      expect(screen.queryByRole("combobox", { name: TYPE_FIELD_NAME })).not.toBeInTheDocument();
      expect(
        screen.queryByText("customField.entityReference.noTargetConfigured")
      ).not.toBeInTheDocument();
      // And no available-types request either: a pinned field has no use for
      // that list at all.
      expect(availableTypesCalls).toBe(0);
    });

    it("goes straight to the record picker, with the pin as the search target", () => {
      renderControl();
      openPanel();

      expect(searchArgs[searchArgs.length - 1]).toMatchObject({
        entityTypeKey: USER_TYPE,
        enabled: true,
      });
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
      const describedBy = recordField().getAttribute("aria-describedby") ?? "";
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

    it("hands focus back to the TYPE field after a type is chosen, never to the record field", async () => {
      // Two comboboxes in one control is exactly where focus management breaks,
      // so the contract is asserted rather than assumed: each popover returns
      // focus to its OWN trigger and the control moves focus nowhere itself.
      // Auto-advancing into the record picker would yank focus out from under
      // someone still reading the type they just chose.
      renderControl({ targetEntityTypeKey: null });
      const type = openTypePanel();

      // Focus went INTO the type panel, not to document.body -- cmdk's keymap
      // only sees keys that bubble through its own subtree.
      expect(panelInput()).not.toBeNull();
      expect(panelInput()).toHaveFocus();

      fireEvent.click(screen.getByRole("option", { name: /Staff Member/ }));

      // Awaited because Radix's FocusScope dispatches its unmount-auto-focus on
      // a macrotask rather than synchronously with the close.
      await waitFor(() => expect(type).toHaveFocus());
      expect(recordField()).not.toHaveFocus();
      // ...and the record panel is still shut. Enabled is not the same as open.
      expect(recordField()).toHaveAttribute("aria-expanded", "false");
    });

    it("keeps the two panels' search boxes separate -- opening one closes the other", async () => {
      currentSearch = searchStub({ items: [AHMED] });
      renderControl({ targetEntityTypeKey: null });

      openTypePanel();
      fireEvent.click(screen.getByRole("option", { name: /Staff Member/ }));
      await waitFor(() => expect(typeField()).toHaveFocus());

      openPanel();
      // One cmdk input on the page at a time: two live search boxes would leave
      // a keyboard user typing into whichever one last won focus.
      expect(document.querySelectorAll("[cmdk-input]")).toHaveLength(1);
      expect(panelInput()).toHaveFocus();
      expect(typeField()).toHaveAttribute("aria-expanded", "false");
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
      currentSearch = searchStub({ items: [], error: { kind: "unknown", statusCode: 500 } });
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
      // A transport failure is the one a retry genuinely fixes, so it has one.
      fireEvent.click(screen.getByRole("button", { name: "common.retry" }));
      expect(currentSearch.reload).toHaveBeenCalledTimes(1);
    });

    it("renders a REFUSED search as a permission fact, with no retry to hammer", () => {
      // Newly reachable: a pinned empty field searches the moment its panel
      // opens, so a caller lacking the target type's `.view` lands here. The
      // data layer already classified it -- rendering every failure through one
      // node would throw that away at the last step, and offer a Retry button
      // for a problem no retry can fix.
      currentSearch = searchStub({
        items: [],
        error: { kind: "forbidden", statusCode: 403, errorCode: "AUTH_FORBIDDEN" },
      });
      renderControl();
      openPanel();

      expect(screen.getByText("customField.entityReference.searchForbidden")).toBeInTheDocument();
      expect(
        screen.getByText("customField.entityReference.searchForbiddenHint")
      ).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "common.retry" })).not.toBeInTheDocument();
      // Not the transport sentence, and not an alert: nothing broke.
      expect(
        screen.queryByText("customField.entityReference.searchFailed")
      ).not.toBeInTheDocument();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("renders a type this deployment cannot answer for as its own third thing", () => {
      // An unregistered key, or an owning module not composed into this host.
      // Also un-retryable, and a different remedy again from a permission grant.
      currentSearch = searchStub({
        items: [],
        error: { kind: "unavailable", statusCode: 404, errorCode: "ENTITY_UNKNOWN_TYPE" },
      });
      renderControl();
      openPanel();

      expect(screen.getByText("customField.entityReference.searchUnavailable")).toBeInTheDocument();
      expect(
        screen.getByText("customField.entityReference.searchUnavailableHint")
      ).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "common.retry" })).not.toBeInTheDocument();
    });

    it("keeps the three panel failures as three DIFFERENT renderings", () => {
      // The regression this guards is the one the data layer's taxonomy exists
      // to prevent: a permission change, an install change and a retry are
      // three remedies, and one shared "search failed" hides which is needed.
      const seen = new Set<string>();
      for (const kind of ["forbidden", "unavailable", "unknown"]) {
        currentSearch = searchStub({ items: [], error: { kind, statusCode: 0 } });
        const { unmount } = renderControl();
        openPanel();
        seen.add(document.querySelector("[cmdk-list]")?.textContent ?? "");
        unmount();
      }
      expect(seen.size).toBe(3);
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
      expect(screen.getByText("customField.entityReference.selectedLabel")).toBeInTheDocument();
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

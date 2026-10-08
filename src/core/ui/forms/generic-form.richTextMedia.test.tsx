/* eslint-disable jsx-a11y/role-supports-aria-props */
// GenericForm draws Wave 3.4's three field types through the CustomFields
// extension registry.
//
// THE BLOCKER THIS FILE PINS is the one `"entity-reference"` already taught this
// component once. A custom-field FieldConfig genuinely reaches <GenericForm>:
// generic-crud-view.tsx concatenates `useCustomFieldsFormFields`'s fieldConfigs
// into the `fields` it hands over, and `visibleFields` filters only on
// isVisible/permissions. So a declared-but-undrawn type falls through to the
// switch's default `<Input type={field.type} value={formData[field.name] ?? ""}>`
// -- a text box painting the stored object as `[object Object]`, which the first
// keystroke replaces with a string the server answers with a 422.
//
// AND THE TRAP THIS TIME WAS SHARPER, which is why it is worth naming here: all
// three types had a plausible-looking existing member to reuse. `"file"`,
// `"image"` and `"richtext"` are all real, all rendered, and all produce the
// WRONG VALUE SHAPE -- a browser `File`, a base64 string, and a bare string. So
// reusing any of them would not have fallen through to the default arm at all; it
// would have drawn a working-looking control whose every save is refused. Three
// new members plus three `EXTENSION_DRAWN_FIELD_TYPES` entries is the fix, and
// the tests below assert both halves: the extension is consulted, and this
// component draws nothing itself.
//
// THE EXTENSION IS A FAKE HERE ON PURPOSE. This file's subject is the ROUTING
// contract `core` owns -- that GenericForm hands the registered control its six
// promised props, suppresses its own label, and keeps the raw value. That the
// real controls work is pinned on the module side, by
// GenericFormCustomFieldControl.richTextMedia.test.tsx, which mounts this same
// GenericForm over the real implementations.
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { GenericForm, type FieldConfig } from "./generic-form";
import {
  registerCustomFieldsExtension,
  type CustomFieldFormControlProps,
  type CustomFieldsExtensionApi,
} from "@core/crud/customFieldsExtension";

vi.mock("@core/providers/permission-provider", () => ({
  usePermissions: () => ({
    permissions: [],
    hasPermission: () => true,
    hasAnyPermission: () => true,
    hasAllPermissions: () => true,
    canAccessPage: () => true,
    roleNames: [],
    isSuperAdmin: true,
  }),
  PermissionGate: ({ children }: { children: unknown }) => children,
}));

/** Every prop the fake control was handed, newest last -- the routing contract's observation point. */
let receivedProps: CustomFieldFormControlProps[] = [];

/**
 * Stands in for the CustomFields module's real controls. Renders its OWN label
 * (as all three real controls do, which is why the host must suppress its own)
 * and a `role="group"` region wired to the three host-owned a11y props, so the
 * assertions below are about what GenericForm PASSES rather than about what a
 * stub happens to paint. The "set" button emits a shape decided by the caller,
 * so one stub serves all three field types.
 */
function FakeFieldControl({
  field,
  value,
  onChange,
  disabled,
  invalid,
  describedBy,
}: CustomFieldFormControlProps) {
  receivedProps.push({ field, value, onChange, disabled, invalid, describedBy });
  const emitted =
    field.type === "rich-text"
      ? { html: "<p>typed by the control</p>" }
      : { entityTypeKey: "media.file", entityId: "ENC-9" };
  return (
    <div>
      <label htmlFor={field.name}>{field.label}</label>
      <div
        id={field.name}
        role="group"
        aria-label={field.label ?? field.name}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        aria-disabled={disabled || undefined}
      >
        {value ? "holds a value" : "empty"}
      </div>
      <button type="button" onClick={() => onChange(emitted)}>
        {`set ${field.type}`}
      </button>
    </div>
  );
}

function makeApi(overrides: Partial<CustomFieldsExtensionApi> = {}): CustomFieldsExtensionApi {
  return {
    getFormFields: vi.fn().mockResolvedValue([]),
    saveValues: vi.fn().mockResolvedValue(undefined),
    getBulkColumnValues: vi.fn().mockResolvedValue({ columns: [], valuesByOwnerId: {} }),
    InlineAddTrigger: () => null,
    FieldControl: FakeFieldControl,
    ...overrides,
  };
}

/**
 * The real, namespaced names the extension produces (`encodeCustomFieldName`), so
 * the id/`htmlFor`/`aria-describedby` wiring is exercised on the shape production
 * actually uses.
 */
const MEDIA_FILE: FieldConfig = {
  name: "__cf__waiver",
  label: "Waiver",
  type: "media-file",
  referenceTargetEntityTypeKey: "media.file",
};
const MEDIA_IMAGE: FieldConfig = {
  name: "__cf__photo",
  label: "Photo",
  type: "media-image",
  referenceTargetEntityTypeKey: "media.file",
};
const RICH_TEXT: FieldConfig = {
  name: "__cf__notes",
  label: "Notes",
  type: "rich-text",
  placeholder: "What happened?",
};

const ALL_THREE: readonly (readonly [string, FieldConfig, unknown])[] = [
  ["media-file", MEDIA_FILE, { entityTypeKey: "media.file", entityId: "ENC-1" }],
  ["media-image", MEDIA_IMAGE, { entityTypeKey: "media.file", entityId: "ENC-2" }],
  ["rich-text", RICH_TEXT, { html: "<p>Stored prose</p>" }],
];

beforeEach(() => {
  receivedProps = [];
  // The registry has no unregister; every test re-registers instead. The
  // FieldControl-absent path lives in its own file for exactly that reason.
  registerCustomFieldsExtension(makeApi());
});

describe("GenericForm — Wave 3.4 types route to the extension control", () => {
  it.each(ALL_THREE)(
    "consults the extension for a %s field and draws no input itself",
    (_label, field) => {
      // RED WITHOUT THE FIX, both halves: getByRole("group") throws because the
      // extension is never consulted, and queryByRole("textbox") finds the
      // fallthrough `<Input type={field.type}>`.
      const { container } = render(
        <GenericForm fields={[field]} onSubmit={async () => {}} onCancel={() => {}} />
      );

      expect(screen.getByRole("group", { name: field.label })).toBeInTheDocument();
      expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
      expect(container.querySelector(`input[type="${field.type}"]`)).toBeNull();
    }
  );

  it.each(ALL_THREE)(
    'hands the %s control the RAW stored object, with no `?? ""` normalisation',
    (_label, field, stored) => {
      // The `?? ""` in the fallthrough is precisely what turned an absent object
      // into an empty string the server then refused. Absent must stay absent and
      // present must stay the object -- both asserted, because a control that
      // received `""` for a stored object would satisfy neither.
      render(
        <GenericForm
          fields={[field]}
          initialValues={{ [field.name]: stored }}
          onSubmit={async () => {}}
          onCancel={() => {}}
        />
      );

      expect(receivedProps.at(-1)?.value).toEqual(stored);
    }
  );

  it.each(ALL_THREE)(
    "leaves an absent %s value undefined, not an empty string",
    (_label, field) => {
      render(<GenericForm fields={[field]} onSubmit={async () => {}} onCancel={() => {}} />);
      expect(receivedProps.at(-1)?.value).toBeUndefined();
    }
  );

  it.each(ALL_THREE)(
    "leaves nothing typeable that could overwrite a stored %s value",
    async (_label, field, stored) => {
      // The DATA-LOSS shape, reproduced rather than described. RED WITHOUT THE
      // FIX: the fallthrough renders an `<input>` holding "[object Object]", the
      // keystroke below replaces the whole value with a string, and the submitted
      // value is "typed". With the fix there is no input to find, so the keystroke
      // has nowhere to land and the value survives untouched.
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      const { container } = render(
        <GenericForm
          fields={[field]}
          initialValues={{ [field.name]: stored }}
          onSubmit={onSubmit}
          onCancel={() => {}}
        />
      );

      const stray = container.querySelector<HTMLInputElement>(`input#${CSS.escape(field.name)}`);
      if (stray) fireEvent.change(stray, { target: { value: "typed" } });

      fireEvent.click(screen.getByRole("button", { name: "common.save" }));

      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
      expect(onSubmit.mock.calls[0][0][field.name]).toEqual(stored);
    }
  );

  it.each(ALL_THREE)(
    "routes the %s control's onChange into form state and submits exactly what it emitted",
    async (_label, field) => {
      // No translation anywhere between the control and `onSubmit` -- which is the
      // point for these two envelopes in particular. `{ html }` and
      // `{ entityTypeKey, entityId }` are spelled identically on the wire in both
      // directions, so a rename in this path would be a data-loss bug rather than
      // a style choice.
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      render(<GenericForm fields={[field]} onSubmit={onSubmit} onCancel={() => {}} />);

      fireEvent.click(screen.getByRole("button", { name: `set ${field.type}` }));
      fireEvent.click(screen.getByRole("button", { name: "common.save" }));

      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
      expect(onSubmit.mock.calls[0][0][field.name]).toEqual(
        field.type === "rich-text"
          ? { html: "<p>typed by the control</p>" }
          : { entityTypeKey: "media.file", entityId: "ENC-9" }
      );
    }
  );

  it.each(ALL_THREE)(
    "renders exactly one label for a %s field — the host suppresses its own",
    (_label, field) => {
      // RED IN THE OPPOSITE DIRECTION: with the render arm added but the type left
      // out of `EXTENSION_DRAWN_FIELD_TYPES`'s label-suppression condition, two
      // identical `<label for>` nodes render. Counted on the `for` attribute rather
      // than on visible text, so a control that labels itself differently cannot
      // mask a duplicate.
      const { container } = render(
        <GenericForm fields={[field]} onSubmit={async () => {}} onCancel={() => {}} />
      );
      expect(container.querySelectorAll(`label[for="${field.name}"]`)).toHaveLength(1);
    }
  );

  it("carries the reference target pin through to a media control untouched", () => {
    // `FieldConfig.referenceTargetEntityTypeKey` is a CARRIER this component never
    // reads: the whole `field` is handed across, and the pin is read on the module
    // side. Media needs the same carrier the reference types use, so this asserts
    // it survives the crossing rather than being dropped for a type the property's
    // own doc comment was written before.
    render(<GenericForm fields={[MEDIA_FILE]} onSubmit={async () => {}} onCancel={() => {}} />);
    expect(receivedProps.at(-1)?.field.referenceTargetEntityTypeKey).toBe("media.file");
  });

  it("carries a rich-text field's placeholder through, since the control needs it for the editor", () => {
    render(<GenericForm fields={[RICH_TEXT]} onSubmit={async () => {}} onCancel={() => {}} />);
    expect(receivedProps.at(-1)?.field.placeholder).toBe("What happened?");
  });
});

describe("GenericForm — Wave 3.4 types receive the host-owned a11y facts", () => {
  it.each(ALL_THREE)(
    "passes the form's read-only state to a %s control as disabled",
    (_label, field) => {
      render(
        <GenericForm fields={[field]} onSubmit={async () => {}} onCancel={() => {}} readOnly />
      );
      expect(receivedProps.at(-1)?.disabled).toBe(true);
      expect(screen.getByRole("group", { name: field.label })).toHaveAttribute(
        "aria-disabled",
        "true"
      );
    }
  );

  it.each(ALL_THREE)("passes a per-field disabled flag to a %s control", (_label, field) => {
    render(
      <GenericForm
        fields={[{ ...field, disabled: true }]}
        onSubmit={async () => {}}
        onCancel={() => {}}
      />
    );
    expect(receivedProps.at(-1)?.disabled).toBe(true);
  });

  it.each(ALL_THREE)(
    "passes the host's own validation verdict and hint node to a %s control",
    async (_label, field) => {
      // The verdict only exists after a failed submit, so this drives one. The
      // negative half is asserted first, on the initial render, so the positive
      // half cannot pass against a control that is handed `invalid` unconditionally.
      render(
        <GenericForm
          fields={[{ ...field, required: true }]}
          onSubmit={async () => {}}
          onCancel={() => {}}
        />
      );
      expect(receivedProps.at(-1)?.invalid).toBeFalsy();

      fireEvent.click(screen.getByRole("button", { name: "common.save" }));

      await waitFor(() => expect(receivedProps.at(-1)?.invalid).toBe(true));
      // And the description id is a real node holding the message, not a dangling
      // reference -- an id list pointing at nothing announces nothing and looks
      // identical to correct wiring if only the attribute is checked.
      const describedBy = receivedProps.at(-1)?.describedBy;
      expect(describedBy).toBeTruthy();
      expect(document.getElementById(String(describedBy))?.textContent).toContain(
        "validation.required"
      );
    }
  );
});

/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { act, render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    direction: "ltr",
    language: "en",
  }),
}));

vi.mock("@core/hooks/use-module-locales", () => ({
  useModuleLocales: () => {},
}));

vi.mock("@codemirror/view", () => {
  class MockEditorView {
    static theme() {
      return {};
    }
    static updateListener = { of: () => ({}) };
    static lineWrapping = {};
    state = { doc: { toString: () => "" } };
    dispatch() {}
    destroy() {}
    constructor(_config: any) {}
  }
  return {
    EditorView: MockEditorView,
    keymap: { of: () => ({}) },
    placeholder: () => ({}),
    lineNumbers: () => ({}),
    highlightActiveLine: () => ({}),
    highlightActiveLineGutter: () => ({}),
    drawSelection: () => ({}),
    dropCursor: () => ({}),
  };
});

vi.mock("@codemirror/state", () => ({
  EditorState: {
    create: () => ({}),
  },
}));

vi.mock("@codemirror/lang-html", () => ({ html: () => ({}) }));
vi.mock("@codemirror/lang-css", () => ({ css: () => ({}) }));
vi.mock("@codemirror/theme-one-dark", () => ({ oneDark: {} }));
vi.mock("@codemirror/commands", () => ({
  defaultKeymap: [],
  history: () => ({}),
  historyKeymap: [],
  indentWithTab: {},
}));
vi.mock("@codemirror/language", () => ({
  bracketMatching: () => ({}),
  indentOnInput: () => ({}),
  foldGutter: () => ({}),
  syntaxHighlighting: () => ({}),
  defaultHighlightStyle: {},
}));
vi.mock("@codemirror/autocomplete", () => ({
  autocompletion: () => ({}),
  closeBrackets: () => ({}),
  closeBracketsKeymap: [],
  completionKeymap: [],
}));
vi.mock("@codemirror/search", () => ({
  searchKeymap: [],
  highlightSelectionMatches: () => ({}),
}));

import { CodeEditorField } from "../code-editor-field";

describe("CodeEditorField modal keyboard and focus contracts", () => {
  it("ignores defaultPrevented Escape events (e.g. autocomplete dismissal) and restores focus on close", () => {
    render(
      <CodeEditorField
        tabs={[
          {
            id: "html",
            label: "HTML",
            language: "html",
            value: "<div>hello</div>",
            onChange: vi.fn(),
          },
        ]}
      />
    );

    const openButton = screen.getByRole("button", { name: "studio.builder.openEditor" });
    openButton.focus();
    fireEvent.click(openButton);

    const dialog = screen.getByRole("dialog", { name: "studio.builder.codeEditor" });
    expect(dialog).toBeInTheDocument();

    // Prevented Escape (simulating nested tooltip/autocomplete handling) must NOT close modal.
    const canceledEscape = new KeyboardEvent("keydown", {
      key: "Escape",
      bubbles: true,
      cancelable: true,
    });
    canceledEscape.preventDefault();
    act(() => {
      window.dispatchEvent(canceledEscape);
    });
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // Unhandled Escape closes modal and restores focus to opener.
    const realEscape = new KeyboardEvent("keydown", {
      key: "Escape",
      bubbles: true,
      cancelable: true,
    });
    act(() => {
      window.dispatchEvent(realEscape);
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(openButton).toHaveFocus();
  });
});

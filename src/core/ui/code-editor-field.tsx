/**
 * CodeEditorField — CodeMirror-powered code editor for the Customizer Studio
 *
 * Uses a dual-mode approach:
 * - Compact inline editor in the sidebar (CodeMirror with minimal chrome)
 * - Full-screen modal with tabs, preview, and template snippets
 *
 * Features:
 * - Full syntax highlighting (HTML, CSS)
 * - Line numbers, bracket matching, auto-close
 * - Dark theme matching VS Code
 * - Dual-pane (code + live preview) in modal
 * - Template snippets for quick insertion
 */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/core/common/utils";
import { Code, Eye, X, Maximize2, FileCode2, Copy, Check, Zap } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { createPortal } from "react-dom";

// CodeMirror imports
import {
  EditorView,
  keymap,
  placeholder as cmPlaceholder,
  lineNumbers,
  highlightActiveLine,
  highlightActiveLineGutter,
  drawSelection,
  dropCursor,
} from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { oneDark } from "@codemirror/theme-one-dark";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import {
  bracketMatching,
  indentOnInput,
  foldGutter,
  syntaxHighlighting,
  defaultHighlightStyle,
} from "@codemirror/language";
import {
  closeBrackets,
  closeBracketsKeymap,
  autocompletion,
  completionKeymap,
} from "@codemirror/autocomplete";
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search";

// ── Shared CodeMirror Hook ──────────────────────────────
function useCodeMirrorEditor({
  language,
  value,
  onChange,
  placeholderText,
  minHeight,
}: {
  language: string;
  value: string;
  onChange: (v: string) => void;
  placeholderText?: string;
  minHeight?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  const isExternalUpdate = useRef(false);

  // Create editor on mount
  useEffect(() => {
    if (!containerRef.current) return;

    const langExt = language === "css" ? css() : html();

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged && !isExternalUpdate.current) {
        onChangeRef.current(update.state.doc.toString());
      }
    });

    const theme = EditorView.theme({
      "&": {
        fontSize: "13px",
        ...(minHeight ? { minHeight } : {}),
      },
      ".cm-content": {
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
        padding: "8px 0",
      },
      ".cm-gutters": {
        backgroundColor: "#1e1e1e",
        borderRight: "1px solid #333",
        color: "#666",
      },
      ".cm-activeLineGutter": {
        backgroundColor: "#252526",
      },
      "&.cm-focused .cm-cursor": {
        borderLeftColor: "#007acc",
      },
      ".cm-scroller": {
        overflow: "auto",
      },
    });

    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightActiveLine(),
        history(),
        foldGutter(),
        drawSelection(),
        dropCursor(),
        indentOnInput(),
        bracketMatching(),
        closeBrackets(),
        autocompletion(),
        highlightSelectionMatches(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          ...closeBracketsKeymap,
          ...completionKeymap,
          ...searchKeymap,
          indentWithTab,
        ]),
        langExt,
        oneDark,
        theme,
        updateListener,
        EditorView.lineWrapping,
        ...(placeholderText ? [cmPlaceholder(placeholderText)] : []),
      ],
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // Only recreate on language change, not on value changes
  }, [language, minHeight]);

  // Update value from outside
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      isExternalUpdate.current = true;
      view.dispatch({
        changes: {
          from: 0,
          to: current.length,
          insert: value,
        },
      });
      isExternalUpdate.current = false;
    }
  }, [value]);

  return containerRef;
}

// ── Template Snippets ────────────────────────────────────
const HTML_SNIPPETS = [
  {
    name: "Banner Section",
    code: `<div class="custom-banner">\n  <h2>Welcome to Our Platform</h2>\n  <p>Secure, fast, and beautiful.</p>\n</div>`,
  },
  {
    name: "Feature Card",
    code: `<div class="feature-card">\n  <div class="feature-icon">🔒</div>\n  <h3>Enterprise Security</h3>\n  <p>Bank-grade encryption for all your data.</p>\n</div>`,
  },
  {
    name: "Image + Text",
    code: `<div class="hero-block">\n  <img src="/app-logo.png" alt="Logo" class="hero-img" />\n  <div class="hero-text">\n    <h2>Your Brand Here</h2>\n    <p>Customize everything to match your identity.</p>\n  </div>\n</div>`,
  },
  {
    name: "CTA Section",
    code: `<div class="cta-section">\n  <h3>Need Help?</h3>\n  <p>Contact our support team for assistance.</p>\n  <a href="mailto:support@example.com" class="cta-button">Contact Support</a>\n</div>`,
  },
];

const CSS_SNIPPETS = [
  {
    name: "Banner Styles",
    code: `.custom-banner {\n  text-align: center;\n  padding: 2rem;\n  background: linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1));\n  border-radius: 12px;\n  margin: 1rem 0;\n}\n.custom-banner h2 {\n  font-size: 1.5rem;\n  font-weight: 700;\n  margin-bottom: 0.5rem;\n  color: var(--login-text, #1e293b);\n}\n.custom-banner p {\n  font-size: 0.875rem;\n  color: var(--login-text-muted, #64748b);\n}`,
  },
  {
    name: "Feature Card Styles",
    code: `.feature-card {\n  padding: 1.5rem;\n  border: 1px solid var(--login-border, #e2e8f0);\n  border-radius: 12px;\n  background: var(--login-surface, #f8fafc);\n  text-align: center;\n  transition: transform 0.2s, box-shadow 0.2s;\n}\n.feature-card:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 8px 25px rgba(0,0,0,0.08);\n}\n.feature-icon {\n  font-size: 2rem;\n  margin-bottom: 0.75rem;\n}`,
  },
  {
    name: "Glass Card Effect",
    code: `.login-card {\n  backdrop-filter: blur(16px) saturate(180%);\n  background: rgba(255, 255, 255, 0.12) !important;\n  border: 1px solid rgba(255, 255, 255, 0.18) !important;\n  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15) !important;\n}`,
  },
  {
    name: "Neon Glow Effect",
    code: `.login-card {\n  box-shadow: 0 0 30px rgba(var(--login-primary-rgb, 59,130,246), 0.15),\n             0 0 60px rgba(var(--login-primary-rgb, 59,130,246), 0.08) !important;\n  border-color: rgba(var(--login-primary-rgb, 59,130,246), 0.3) !important;\n}`,
  },
];

interface CodeEditorTab {
  id: string;
  label: string;
  language: string;
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
}

interface CodeEditorFieldProps {
  tabs: CodeEditorTab[];
  /** Height for the inline editor in pixels (default: 120) */
  height?: number;
  /** Label shown above the editor */
  label?: string;
  /** Description shown below label */
  description?: string;
  /** Whether to show the preview toggle in the modal */
  showPreview?: boolean;
  /** Custom preview renderer */
  renderPreview?: () => React.ReactNode;
  /** Additional class names */
  className?: string;
}

// ── Modal Editor ─────────────────────────────────────────
function CodeEditorModal({
  tabs,
  activeTabId,
  onActiveTabChange,
  showPreview,
  renderPreview,
  onClose,
}: {
  tabs: CodeEditorTab[];
  activeTabId: string;
  onActiveTabChange: (id: string) => void;
  showPreview?: boolean;
  renderPreview?: () => React.ReactNode;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [showPreviewPane, setShowPreviewPane] = useState(false);
  const [showSnippets, setShowSnippets] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleInsertSnippet = useCallback(
    (code: string) => {
      if (activeTab) {
        const newValue = activeTab.value ? activeTab.value + "\n\n" + code : code;
        activeTab.onChange(newValue);
        setCopiedSnippet(code);
        setTimeout(() => setCopiedSnippet(null), 1500);
      }
    },
    [activeTab]
  );

  const snippets = activeTab?.language === "css" ? CSS_SNIPPETS : HTML_SNIPPETS;

  const editorRef = useCodeMirrorEditor({
    language: activeTab?.language || "html",
    value: activeTab?.value || "",
    onChange: activeTab?.onChange || (() => {}),
    minHeight: "100%",
  });

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex h-[85vh] max-h-[750px] w-[92vw] max-w-[1100px] flex-col overflow-hidden rounded-xl border border-[#3c3c3c] bg-[#1e1e1e] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#3c3c3c] bg-[#252526] px-4 py-2.5">
          <div className="flex items-center gap-3">
            <FileCode2 className="h-4 w-4 text-[#007acc]" />
            <span className="text-sm font-medium text-[#cccccc]">
              {t("studio.builder.codeEditor") || "Code Editor"}
            </span>
            {/* Tabs */}
            <div className="ml-4 flex items-center gap-0.5">
              {tabs.map((tab) => (
                // UI-EXCEPTION: compact studio layout
                <button
                  key={tab.id}
                  onClick={() => {
                    onActiveTabChange(tab.id);
                    setShowPreviewPane(false);
                  }}
                  className={cn(
                    "rounded-md px-3 py-1 text-xs font-medium transition-all",
                    activeTabId === tab.id
                      ? "bg-[#1e1e1e] text-[#cccccc] shadow-sm"
                      : "text-[#969696] hover:bg-[#2d2d2d] hover:text-[#cccccc]"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Snippets toggle */}
            <button
              onClick={() => setShowSnippets(!showSnippets)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                showSnippets
                  ? "bg-amber-500/20 text-amber-400"
                  : "text-[#969696] hover:bg-[#2d2d2d] hover:text-[#cccccc]"
              )}
            >
              <Zap className="h-3.5 w-3.5" />
              {t("studio.builder.snippets") || "Snippets"}
            </button>
            {showPreview && renderPreview && (
              <button
                onClick={() => setShowPreviewPane(!showPreviewPane)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  showPreviewPane
                    ? "bg-[#007acc]/20 text-[#3794ff]"
                    : "text-[#969696] hover:bg-[#2d2d2d] hover:text-[#cccccc]"
                )}
              >
                {showPreviewPane ? (
                  <>
                    <Code className="h-3.5 w-3.5" /> {t("studio.builder.codeOnly") || "Code"}
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5" /> {t("studio.builder.preview") || "Preview"}
                  </>
                )}
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-md p-1.5 text-[#969696] transition-colors hover:bg-[#3c3c3c] hover:text-[#cccccc]"
              title="Close (Esc)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Snippets Panel */}
          {showSnippets && (
            <div className="w-64 flex-shrink-0 overflow-y-auto border-r border-[#3c3c3c] bg-[#252526]">
              <div className="border-b border-[#3c3c3c] p-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-[#cccccc]">
                  {activeTab?.language === "css" ? "CSS" : "HTML"}{" "}
                  {t("studio.builder.templates") || "Templates"}
                </h3>
              </div>
              <div className="space-y-1.5 p-2">
                {snippets.map((s) => (
                  <button
                    key={s.name}
                    onClick={() => handleInsertSnippet(s.code)}
                    className="group w-full rounded-md px-3 py-2.5 text-left transition-colors hover:bg-[#2d2d2d]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-[#cccccc]">{s.name}</span>
                      {copiedSnippet === s.code ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Copy className="h-3 w-3 text-[#666] transition-colors group-hover:text-[#999]" />
                      )}
                    </div>
                    <pre className="mt-1.5 line-clamp-3 whitespace-pre-wrap font-mono text-[9px] text-[#666]">
                      {s.code.slice(0, 100)}...
                    </pre>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Editor */}
          <div className="min-w-0 flex-1 overflow-hidden">
            {showPreviewPane && renderPreview ? (
              <div className="flex h-full">
                <div
                  ref={editorRef}
                  className="h-full w-1/2 overflow-auto border-r border-[#3c3c3c]"
                />
                <div className="h-full w-1/2 overflow-auto bg-background/95 p-6 text-foreground">
                  {renderPreview()}
                </div>
              </div>
            ) : (
              <div ref={editorRef} className="h-full overflow-auto" />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between bg-[#007acc] px-4 py-2 text-[11px] text-white">
          <span>
            {activeTab?.language.toUpperCase()} • {activeTab?.value?.split("\n").length || 0}{" "}
            {t("studio.builder.lines") || "lines"}
          </span>
          <span className="opacity-70">
            {t("studio.builder.escToClose") || "Press Esc to close"} •{" "}
            {t("studio.builder.autoSave") || "Changes save automatically"}
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Main Component ───────────────────────────────────────
export function CodeEditorField({
  tabs,
  height = 120,
  label,
  description,
  showPreview = false,
  renderPreview,
  className,
}: CodeEditorFieldProps) {
  useModuleLocales(() => import("@modules/customization/studio/locales"), "customization-studio");
  const { t } = useI18n();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || "");

  const activeTabData = tabs.find((tab) => tab.id === activeTab) || tabs[0];

  const editorRef = useCodeMirrorEditor({
    language: activeTabData?.language || "html",
    value: activeTabData?.value || "",
    onChange: activeTabData?.onChange || (() => {}),
    placeholderText:
      activeTabData?.language === "html"
        ? '<div class="my-block">\n  <h2>Hello</h2>\n  <p>World</p>\n</div>'
        : ".my-block {\n  color: #fff;\n  padding: 1rem;\n}",
    minHeight: `${height}px`,
  });

  return (
    <div className={cn("space-y-1.5", className)}>
      {/* Label */}
      {label && <span className="text-[10px] font-medium text-muted-foreground">{label}</span>}
      {description && <p className="text-[9px] text-amber-500/80">{description}</p>}

      {/* Tab Selector (inline) */}
      {tabs.length > 1 && (
        <div className="flex items-center gap-1 rounded-md border border-border/50 bg-muted/30 p-0.5">
          {tabs.map((tab) => (
            // UI-EXCEPTION: compact studio layout
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 rounded px-2 py-1 text-[10px] font-medium transition-all",
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Inline CodeMirror Editor */}
      <div
        ref={editorRef}
        className="w-full overflow-hidden rounded-md border border-border bg-[#1e1e1e]"
        style={{ maxHeight: height * 1.5 }}
      />

      {/* Open Full Editor Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="group flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-primary/30 bg-primary/5 px-3 py-2 text-xs font-medium text-primary transition-all hover:border-primary/50 hover:bg-primary/10"
      >
        <Maximize2 className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
        {t("studio.builder.openEditor") || "Open Full Editor"}
      </button>

      {/* CodeMirror Modal */}
      {isModalOpen && (
        <CodeEditorModal
          tabs={tabs}
          activeTabId={activeTab}
          onActiveTabChange={setActiveTab}
          showPreview={showPreview}
          renderPreview={renderPreview}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

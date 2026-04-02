/**
 * CodeEditorField — Monaco-powered code editor for the Customizer Studio
 *
 * Uses a dual-mode approach:
 * - Compact textarea in the sidebar for quick edits
 * - Full-screen modal with Monaco editor for serious coding
 *
 * This solves the narrow-sidebar problem where Monaco can't render properly.
 */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/core/common/utils";
import { Code, Eye, X, Maximize2, FileCode2 } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { createPortal } from "react-dom";

// Dynamic import — Monaco is heavy, only load when needed
const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((m) => m.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-[#1e1e1e] rounded-lg">
        <div className="flex flex-col items-center gap-2">
          <div className="h-5 w-5 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
          <span className="text-xs text-[#969696]">Loading editor...</span>
        </div>
      </div>
    ),
  }
);

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
  /** Height for the inline textarea in pixels (default: 100) */
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
  const [isPreview, setIsPreview] = useState(false);
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent click propagation to builder canvas
  const stopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (activeTab) {
        activeTab.onChange(value || "");
      }
    },
    [activeTab]
  );

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="w-[90vw] max-w-[900px] h-[80vh] max-h-[700px] bg-[#1e1e1e] rounded-xl shadow-2xl border border-[#3c3c3c] flex flex-col overflow-hidden"
        onClick={stopPropagation}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#252526] border-b border-[#3c3c3c]">
          <div className="flex items-center gap-3">
            <FileCode2 className="h-4 w-4 text-[#007acc]" />
            <span className="text-sm font-medium text-[#cccccc]">
              Code Editor
            </span>
            {/* Tabs */}
            <div className="flex items-center gap-0.5 ml-4">
              {tabs.map((tab) => (
                // UI-EXCEPTION: compact studio layout
                <button
                  key={tab.id}
                  onClick={() => {
                    onActiveTabChange(tab.id);
                    setIsPreview(false);
                  }}
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-md transition-all",
                    activeTabId === tab.id
                      ? "bg-[#1e1e1e] text-[#cccccc] shadow-sm"
                      : "text-[#969696] hover:text-[#cccccc] hover:bg-[#2d2d2d]"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {showPreview && renderPreview && (
              // UI-EXCEPTION: compact studio layout
              <button
                onClick={() => setIsPreview(!isPreview)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                  isPreview
                    ? "bg-[#007acc]/20 text-[#3794ff]"
                    : "text-[#969696] hover:text-[#cccccc] hover:bg-[#2d2d2d]"
                )}
              >
                {isPreview ? (
                  <>
                    <Code className="h-3.5 w-3.5" /> Code
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5" /> Preview
                  </>
                )}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-[#969696] hover:text-[#cccccc] hover:bg-[#3c3c3c] transition-colors"
              title="Close (Esc)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Editor Body */}
        <div className="flex-1 relative">
          {isPreview && renderPreview ? (
            <div className="h-full overflow-auto p-6 bg-background/95 text-foreground">
              {renderPreview()}
            </div>
          ) : (
            <MonacoEditor
              height="100%"
              language={activeTab?.language || "html"}
              value={activeTab?.value || ""}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: true },
                fontSize: 14,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                wordWrap: "on",
                automaticLayout: true,
                tabSize: 2,
                renderLineHighlight: "line",
                matchBrackets: "always",
                folding: true,
                suggestOnTriggerCharacters: true,
                formatOnPaste: true,
                formatOnType: true,
                bracketPairColorization: { enabled: true },
                padding: { top: 12, bottom: 12 },
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on",
                smoothScrolling: true,
                mouseWheelZoom: true,
                scrollbar: {
                  verticalScrollbarSize: 10,
                  horizontalScrollbarSize: 10,
                },
              }}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#007acc] text-white text-[11px]">
          <span>
            {activeTab?.language.toUpperCase()} •{" "}
            {activeTab?.value?.split("\n").length || 0} lines
          </span>
          <span className="opacity-70">
            Press Esc to close • Changes save automatically
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
  height = 100,
  label,
  description,
  showPreview = false,
  renderPreview,
  className,
}: CodeEditorFieldProps) {
  const { t } = useI18n();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || "");

  const activeTabData = tabs.find((tab) => tab.id === activeTab) || tabs[0];

  return (
    <div className={cn("space-y-1.5", className)}>
      {/* Label */}
      {label && (
        <span className="text-[10px] font-medium text-muted-foreground">
          {label}
        </span>
      )}
      {description && (
        <p className="text-[9px] text-amber-500/80">{description}</p>
      )}

      {/* Tab Selector (inline) */}
      {tabs.length > 1 && (
        <div className="flex items-center gap-1 p-0.5 rounded-md bg-muted/30 border border-border/50">
          {tabs.map((tab) => (
            // UI-EXCEPTION: compact studio layout
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 px-2 py-1 rounded text-[10px] font-medium transition-all",
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

      {/* Inline Textarea — for quick edits in sidebar */}
      <textarea
        value={activeTabData?.value || ""}
        onChange={(e) => activeTabData?.onChange(e.target.value)}
        placeholder={
          activeTabData?.language === "html"
            ? '<div class="my-block">\n  <h2>Hello</h2>\n  <p>World</p>\n</div>'
            : ".my-block {\n  color: #fff;\n  padding: 1rem;\n}"
        }
        className="w-full rounded-md border border-border bg-[#1e1e1e] text-[#cccccc] px-3 py-2 text-xs font-mono resize-none focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/30 transition-colors"
        style={{ height }}
        spellCheck={false}
      />

      {/* Open Full Editor Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-dashed border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/50 transition-all text-xs font-medium group"
      >
        <Maximize2 className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
        {t("studio.builder.openEditor") || "Open Full Editor"}
      </button>

      {/* Monaco Modal */}
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

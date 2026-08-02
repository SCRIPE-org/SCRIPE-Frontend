// UI-EXCEPTION: compact studio layout
"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useDocsI18n } from "../../providers/DocsI18nProvider";
import type { SearchResult } from "../../../domain/interfaces/IDocsRepository";
import { Dialog, DialogContent, DialogTitle } from "@core/ui/dialog";
import { Command, CommandInput, CommandList, CommandEmpty, CommandItem } from "@core/ui/command";

interface DocsSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => SearchResult[];
  /** Base path for navigation (e.g. "/docs" or "/commercial") */
  basePath?: string;
}

/**
 * Presentation UI component rendering the docs search palette.
 *
 * Built on the shared Dialog + cmdk Command primitives instead of a hand-cut
 * overlay: a real `role="dialog"`, a real Radix focus trap, and result rows
 * that are real combobox options (role="option", reachable via arrow keys +
 * Enter, not a `<div onClick>` a keyboard/screen-reader user could never
 * reach). The global Cmd+K listener that used to live here (gated on `isOpen`
 * and only ever able to *close*, never open, the palette) has been removed —
 * `useSearchViewModel` already owns the one listener that toggles the
 * palette open, registered once for the lifetime of the docs view regardless
 * of whether this component's own dialog is currently open.
 */
export function DocsSearch({ isOpen, onClose, onSearch, basePath = "/docs" }: DocsSearchProps) {
  const { t } = useDocsI18n();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  // Reset the query/results every time the palette opens fresh.
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setQuery("");
      setResults([]);
    }
  }

  // Re-run the search whenever the query text changes.
  const [prevQuery, setPrevQuery] = useState(query);
  if (query !== prevQuery) {
    setPrevQuery(query);
    setResults(query.trim() ? onSearch(query) : []);
  }

  // Navigate to result
  const navigateToResult = useCallback(
    (result: SearchResult) => {
      // Strip "commercial/" prefix if present, as basePath handles the root
      const cleanSlug = result.slug.replace(/^commercial\//, "");
      const hash = result.sectionId ? `#${result.sectionId}` : "";
      router.push(`${basePath}/${cleanSlug}${hash}`);
      onClose();
    },
    [basePath, router, onClose]
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-lg overflow-hidden p-0"
        onOpenAutoFocus={() => {
          // Deliberately NOT calling preventDefault here. The generic dialog
          // suppresses Radix's default auto-focus so dropdown portals inside
          // a form dialog can grab focus instead — that reasoning does not
          // apply to a search palette, whose entire point is landing the
          // caret in the query field the instant it opens. Leaving this
          // event unprevented lets Radix's own default (focus the first
          // focusable descendant, i.e. the query input below) run.
        }}
        onCloseAutoFocus={() => {
          // Same reasoning in reverse: let Radix restore focus to whatever
          // opened the palette (the header's search trigger, or nothing if
          // opened via Cmd+K) instead of stranding it, which the generic
          // dialog's default suppresses for its own dropdown-in-modal case.
        }}
      >
        <DialogTitle className="sr-only">{t("common.search")}</DialogTitle>
        <Command
          label={t("common.search")}
          shouldFilter={false}
          className="[&_[cmdk-input-wrapper]]:pe-11 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-3 [&_[cmdk-item]]:py-2.5"
        >
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder={t("common.searchPlaceholder")}
          />
          <CommandList className="max-h-[400px]">
            {query.trim() !== "" && <CommandEmpty>{t("common.searchNoResults")}</CommandEmpty>}
            {results.map((result, idx) => (
              <CommandItem
                key={`${result.slug}-${result.sectionId || idx}`}
                value={`${result.slug}-${result.sectionId || idx}`}
                onSelect={() => navigateToResult(result)}
                className="flex-col items-start gap-0.5"
              >
                <span className="text-sm text-nx-ink">{t(result.titleKey)}</span>
                <span className="text-xs text-nx-ink-3">
                  {result.category}
                  {result.matchedHeadingKey && ` → ${t(result.matchedHeadingKey)}`}
                </span>
                {result.snippet && (
                  <span className="line-clamp-1 text-xs text-nx-ink-2">
                    {highlightSnippet(result.snippet, query)}
                  </span>
                )}
              </CommandItem>
            ))}
          </CommandList>

          {/* Keyboard-affordance footer — same hints the old overlay showed,
              now through nx tokens instead of inline hsl(var(--border)) etc. */}
          <div className="flex items-center gap-4 border-t border-nx-line px-3 py-2 text-xs text-nx-ink-3">
            <span className="flex items-center gap-1.5">
              <kbd className="rounded-nx-sm border border-nx-line bg-nx-raised px-1.5 py-0.5 font-mono text-[10px]">
                ↑↓
              </kbd>
              {t("common.searchNavigateHint")}
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="rounded-nx-sm border border-nx-line bg-nx-raised px-1.5 py-0.5 font-mono text-[10px]">
                ↵
              </kbd>
              {t("common.searchSelectHint")}
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="rounded-nx-sm border border-nx-line bg-nx-raised px-1.5 py-0.5 font-mono text-[10px]">
                Esc
              </kbd>
              {t("common.searchCloseHint")}
            </span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Highlight the query match within a snippet.
 */
function highlightSnippet(snippet: string, query: string) {
  const lowerSnippet = snippet.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const idx = lowerSnippet.indexOf(lowerQuery);
  if (idx === -1) return snippet;

  const before = snippet.slice(0, idx);
  const match = snippet.slice(idx, idx + query.length);
  const after = snippet.slice(idx + query.length);

  return (
    <>
      {before}
      <mark className="rounded-nx-sm bg-nx-accent-wash text-nx-accent">{match}</mark>
      {after}
    </>
  );
}

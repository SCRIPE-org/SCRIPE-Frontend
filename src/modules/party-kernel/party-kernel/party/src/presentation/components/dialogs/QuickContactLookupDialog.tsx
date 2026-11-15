"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogPortal,
  NonModalScrim,
} from "@core/ui/dialog";
import { Input } from "@core/ui/input";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { useI18n } from "@core/providers/i18n-provider";
import { usePartyPickerViewModel } from "../../viewmodels/usePartyPickerViewModel";
import {
  Search,
  User,
  Building,
  X,
  ArrowRight,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { cn } from "@core/common/utils";
import type { PartyContactLookup } from "../../../domain/entities/Party";

export interface QuickContactLookupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectContact: (partyId: string) => void;
}

/**
 * Sleek, direct Quick Contact Lookup Command Dialog.
 *
 * Implements non-modal overlay (modal={false} + NonModalScrim) so mouse wheel and
 * trackpad gestures scroll the results freely without Radix/react-remove-scroll locking.
 * Keyboard navigation (ArrowUp/ArrowDown) scrolls highlighted items into view,
 * and Enter or direct click immediately navigates to the contact profile.
 */
export function QuickContactLookupDialog({
  open,
  onOpenChange,
  onSelectContact,
}: QuickContactLookupDialogProps) {
  const { t } = useI18n();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "Person" | "Organization">("all");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Debounce search input to avoid overwhelming backend lookup endpoint
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 200);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Reset state on modal open/close
  useEffect(() => {
    if (!open) {
      setSearchTerm("");
      setDebouncedSearch("");
      setTypeFilter("all");
      setHighlightedIndex(-1);
    }
  }, [open]);

  // Query contacts via PartyPicker lookup viewmodel
  const { data, isLoading, queryError, refetch } = usePartyPickerViewModel({
    debouncedSearch,
    typeFilter,
    isOpen: open,
  });

  const parties: PartyContactLookup[] = data?.items ?? [];

  // Derive effective highlighted index: default to 0 when actively searching, -1 on initial open
  const activeIndex =
    highlightedIndex >= 0 && highlightedIndex < parties.length
      ? highlightedIndex
      : debouncedSearch.trim().length > 0 && parties.length > 0
        ? 0
        : -1;

  // Keep highlighted item in view during arrow key navigation
  useEffect(() => {
    if (activeIndex >= 0) {
      const el = document.getElementById(`quick-lookup-opt-${activeIndex}`);
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  const handleSelect = useCallback(
    (partyId: string) => {
      onOpenChange(false);
      onSelectContact(partyId);
    },
    [onOpenChange, onSelectContact]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onOpenChange(false);
      return;
    }

    if (parties.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const current = prev >= 0 ? prev : activeIndex;
        return current < 0 || current >= parties.length - 1 ? 0 : current + 1;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const current = prev >= 0 ? prev : activeIndex;
        return current <= 0 ? parties.length - 1 : current - 1;
      });
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < parties.length) {
        handleSelect(parties[activeIndex].id);
      } else if (parties.length > 0) {
        handleSelect(parties[0].id);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogPortal>
        <NonModalScrim open={open} />
      </DialogPortal>
      <DialogContent
        className="border-nx-line bg-nx-surface p-0 overflow-hidden sm:max-w-[560px]"
        data-testid="quick-contact-lookup-dialog"
      >
        <DialogTitle className="sr-only">
          {t("party.picker.findExisting") || "Quick Contact Lookup"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {t("party.picker.searchPlaceholder") || "Search contacts by name..."}
        </DialogDescription>

        {/* ── Top Command Bar ────────────────────────────────────────── */}
        <div className="border-b border-nx-line bg-nx-surface p-3 space-y-2.5">
          <div className="relative flex items-center">
            <Search
              className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nx-accent"
              aria-hidden="true"
            />
            <Input
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setHighlightedIndex(-1);
              }}
              onKeyDown={handleKeyDown}
              placeholder={
                t("party.picker.searchPlaceholder") || "Search contacts by name..."
              }
              aria-label={t("party.picker.searchPlaceholder") || "Search contacts by name..."}
              className="border-nx-line bg-nx-raised/40 h-10 pe-9 ps-9 text-sm text-nx-ink placeholder:text-nx-ink-3 focus-visible:ring-1 focus-visible:ring-nx-accent"
              role="combobox"
              aria-expanded={open}
              aria-haspopup="listbox"
              aria-controls="quick-lookup-listbox"
              aria-activedescendant={
                activeIndex >= 0 && activeIndex < parties.length
                  ? `quick-lookup-opt-${activeIndex}`
                  : undefined
              }
            />
            {searchTerm && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={t("party.picker.clearSelection") || "Clear"}
                className="absolute end-2 top-1/2 h-6 w-6 -translate-y-1/2 p-0 text-nx-ink-3 hover:text-nx-ink"
                onClick={() => {
                  setSearchTerm("");
                  setHighlightedIndex(-1);
                }}
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            )}
          </div>

          {/* Type Filter Pills */}
          <div className="flex items-center gap-1.5 pt-0.5">
            <Button
              type="button"
              variant={typeFilter === "all" ? "default" : "outline"}
              size="sm"
              className="h-6 rounded-full px-2.5 text-[11px]"
              onClick={() => setTypeFilter("all")}
            >
              {t("party.picker.typeFilterAll") || "All Contacts"}
            </Button>
            <Button
              type="button"
              variant={typeFilter === "Person" ? "default" : "outline"}
              size="sm"
              className="h-6 gap-1 rounded-full px-2.5 text-[11px]"
              onClick={() => setTypeFilter("Person")}
            >
              <User className="h-3 w-3" />
              <span>{t("party.picker.typeFilterPerson") || "People"}</span>
            </Button>
            <Button
              type="button"
              variant={typeFilter === "Organization" ? "default" : "outline"}
              size="sm"
              className="h-6 gap-1 rounded-full px-2.5 text-[11px]"
              onClick={() => setTypeFilter("Organization")}
            >
              <Building className="h-3 w-3" />
              <span>{t("party.picker.typeFilterOrg") || "Organizations"}</span>
            </Button>
          </div>
        </div>

        {/* ── Scrollable Results List ────────────────────────────────── */}
        <div
          id="quick-lookup-listbox"
          role="listbox"
          className="custom-scrollbar max-h-[340px] divide-y divide-nx-line/40 overflow-y-auto p-1.5"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2.5 p-10 text-xs text-nx-ink-3">
              <Loader2 className="h-4 w-4 animate-spin text-nx-accent" />
              <span>Searching directory...</span>
            </div>
          ) : queryError ? (
            <div className="space-y-2 p-6 text-center">
              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertCircle className="h-4 w-4" />
              </div>
              <p className="text-xs text-destructive">
                {queryError instanceof Error && queryError.message.includes("403")
                  ? t("party.picker.permissionDenied") || "Permission denied"
                  : t("party.picker.searchError") || "Unable to load contacts"}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs border-nx-line"
                onClick={() => refetch()}
              >
                <RefreshCw className="me-1 h-3 w-3" />
                <span>{t("party.picker.retry") || "Retry"}</span>
              </Button>
            </div>
          ) : parties.length === 0 ? (
            <div className="space-y-2 p-8 text-center text-xs text-nx-ink-3">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-nx-raised text-nx-ink-3">
                <Search className="h-5 w-5" />
              </div>
              <p className="font-medium text-nx-ink">
                {t("party.picker.noResults") || "No contacts found"}
              </p>
              <p className="text-[11px] text-nx-ink-3">
                {t("party.picker.noResultsDesc") ||
                  "Try adjusting your query or filter to find matching contacts."}
              </p>
            </div>
          ) : (
            parties.map((p, idx) => {
              const isHighlighted = activeIndex === idx;
              return (
                <Button
                  key={p.id}
                  type="button"
                  variant="ghost"
                  id={`quick-lookup-opt-${idx}`}
                  role="option"
                  aria-selected={isHighlighted}
                  onClick={() => handleSelect(p.id)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={cn(
                    "group flex h-auto w-full items-center justify-between whitespace-normal rounded-xl p-2.5 text-start font-normal transition-colors",
                    isHighlighted
                      ? "border border-nx-accent bg-nx-accent-wash hover:bg-nx-accent-wash"
                      : "hover:bg-nx-raised/60 border border-transparent"
                  )}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="bg-nx-accent-wash flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-nx-accent">
                      {p.type === "Person" ? (
                        <User className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Building className="h-4 w-4" aria-hidden="true" />
                      )}
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold text-nx-ink">
                          {p.displayName || p.fullName || p.legalName || "—"}
                        </span>
                        <Badge
                          variant="outline"
                          className="h-4 border-nx-line px-1 py-0 text-[9px] text-nx-ink-2"
                        >
                          {p.type === "Person"
                            ? t("party.picker.typeFilterPerson") || "Person"
                            : t("party.picker.typeFilterOrg") || "Organization"}
                        </Badge>
                      </div>
                      {p.displayName &&
                        ((p.fullName && p.fullName !== p.displayName) ||
                          (p.legalName && p.legalName !== p.displayName)) && (
                          <span className="truncate text-[11px] text-nx-ink-3">
                            {p.fullName || p.legalName}
                          </span>
                        )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-nx-ink-3 transition-colors group-hover:text-nx-accent group-focus-visible:text-nx-accent">
                    <span className="hidden text-[11px] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 sm:inline">
                      {t("party.directory.viewProfile") || "View Profile"}
                    </span>
                    <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                  </div>
                </Button>
              );
            })
          )}
        </div>

        {/* ── Command Footer Hint Bar ────────────────────────────────── */}
        <div className="flex items-center justify-between border-t border-nx-line bg-nx-raised/40 px-3.5 py-2 text-[11px] text-nx-ink-3">
          <span>
            {parties.length} {t("party.directory.totalParties") || "contacts"}
          </span>
          <div className="flex items-center gap-2.5">
            <span className="hidden sm:inline-flex items-center gap-1">
              <kbd className="rounded border border-nx-line bg-nx-surface px-1 py-0.5 font-mono text-[10px]">
                ↑↓
              </kbd>{" "}
              Navigate
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-nx-line bg-nx-surface px-1 py-0.5 font-mono text-[10px]">
                ↵
              </kbd>{" "}
              Select
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-nx-line bg-nx-surface px-1 py-0.5 font-mono text-[10px]">
                Esc
              </kbd>{" "}
              Close
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

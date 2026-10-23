"use client";

import React, { useState, useEffect } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { PARTY_KERNEL_PERMISSIONS } from "../../../../permission-constants";
import { usePermission } from "@core/hooks/use-permission";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@core/ui/popover";
import { CreatePersonDialog } from "./dialogs/CreatePersonDialog";
import { CreateOrganizationDialog } from "./dialogs/CreateOrganizationDialog";
import { usePartyPickerViewModel } from "../viewmodels/usePartyPickerViewModel";
import {
  User,
  Building,
  Search,
  Check,
  Plus,
  X,
  ChevronDown,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import type { PartyContactLookup } from "../../domain/entities/Party";
import type {
  CreatePersonParams,
  CreateOrganizationParams,
} from "../../domain/interfaces/IPartyRepository";

/**
 * Authoritative selection shape returned by PartyPicker to consumers (CRM, Venue, etc.)
 * Strictly uses canonical encrypted PartyId and safe name projections.
 * Sensitive fields (phone, email, minor status) are stripped.
 */
export interface PartySelectionResult {
  id: string; // Canonical encrypted PartyId
  type: "Person" | "Organization";
  displayName: string;
  fullName?: string | null;
  legalName?: string | null;
}

/**
 * Props for the PartyPicker lookup component
 */
export interface PartyPickerProps {
  value?: PartySelectionResult | null;
  onSelect: (party: PartySelectionResult | null) => void;
  filterType?: "all" | "Person" | "Organization";
  placeholder?: string;
  disabled?: boolean;
  allowCreate?: boolean;
  className?: string;
  label?: string;
  error?: string;
  required?: boolean;
  excludeId?: string;
}

/**
 * Enterprise party picker combobox with search, pagination, and quick-create support.
 */
export const PartyPicker = React.memo(function PartyPicker({
  value,
  onSelect,
  filterType = "all",
  placeholder,
  disabled = false,
  allowCreate = true,
  className = "",
  label,
  error,
  required = false,
  excludeId,
}: PartyPickerProps) {
  const { t } = useI18n();

  // Dialog & popover states
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "Person" | "Organization">(filterType);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isCreatePersonOpen, setIsCreatePersonOpen] = useState(false);
  const [isCreateOrgOpen, setIsCreateOrgOpen] = useState(false);

  // Debounce search term to protect backend query pipeline
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Keep type filter in sync if prop changes
  useEffect(() => {
    setTypeFilter(filterType);
  }, [filterType]);

  // Authorization checks
  const canPartiesCreate = usePermission(PARTY_KERNEL_PERMISSIONS.PARTY_CREATE);
  const canPersonCreate = usePermission(PARTY_KERNEL_PERMISSIONS.PARTY_PERSON_CREATE);
  const canOrgCreate = usePermission(PARTY_KERNEL_PERMISSIONS.PARTY_ORGANIZATION_CREATE);

  const canAddPerson = allowCreate && canPartiesCreate && canPersonCreate && filterType !== "Organization";
  const canAddOrg = allowCreate && canPartiesCreate && canOrgCreate && filterType !== "Person";

  // ViewModel: Search existing contacts via typed lookup endpoints
  const {
    data,
    isLoading,
    queryError,
    refetch,
    createPerson,
    createOrganization,
  } = usePartyPickerViewModel({
    debouncedSearch,
    typeFilter,
    isOpen,
  });

  const rawParties: PartyContactLookup[] = data?.items ?? [];
  const parties = excludeId ? rawParties.filter((p) => p.id !== excludeId) : rawParties;

  // Reset highlighted index on search, filter, open, or data change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [debouncedSearch, typeFilter, isOpen, data]);

  const handleSelectParty = (party: PartyContactLookup) => {
    const result: PartySelectionResult = {
      id: party.id,
      type: party.type,
      displayName: party.displayName,
      fullName: party.fullName ?? undefined,
      legalName: party.legalName ?? undefined,
    };
    onSelect(result);
    setIsOpen(false);
    setSearchTerm("");
    setHighlightedIndex(-1);
  };

  const handleClearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (parties.length === 0) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < 0 || prev >= parties.length - 1 ? 0 : prev + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev <= 0 ? parties.length - 1 : prev - 1));
    } else if (e.key === "Enter") {
      if (highlightedIndex >= 0 && highlightedIndex < parties.length) {
        e.preventDefault();
        handleSelectParty(parties[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  // Creation handlers
  const handleCreatePersonSubmit = async (params: CreatePersonParams): Promise<string> => {
    const partyId = await createPerson(params);
    const newSelection: PartySelectionResult = {
      id: partyId,
      type: "Person",
      displayName: params.displayName?.trim() || params.fullName.trim(),
      fullName: params.fullName.trim(),
    };
    onSelect(newSelection);
    setIsOpen(false);
    return partyId;
  };

  const handleCreateOrgSubmit = async (params: CreateOrganizationParams): Promise<string> => {
    const partyId = await createOrganization(params);
    const newSelection: PartySelectionResult = {
      id: partyId,
      type: "Organization",
      displayName: params.displayName?.trim() || params.legalName.trim(),
      legalName: params.legalName.trim(),
    };
    onSelect(newSelection);
    setIsOpen(false);
    return partyId;
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <Label className="text-xs font-medium text-nx-ink flex items-center gap-1">
          <span>{label}</span>
          {required && <span className="text-destructive">*</span>}
        </Label>
      )}

      {/* ── Trigger / Selected View ───────────────────────────────── */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild disabled={disabled}>
          <div
            tabIndex={disabled ? -1 : 0}
            role="combobox"
            data-testid="party-picker-trigger"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            onKeyDown={(e) => {
              if (disabled) return;
              if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
                if (!isOpen) {
                  e.preventDefault();
                  setIsOpen(true);
                }
              }
            }}
            className={`flex min-h-[42px] w-full items-center justify-between rounded-xl border bg-nx-surface px-3 py-2 text-xs transition-colors cursor-pointer select-none ${
              error
                ? "border-destructive/60 focus:ring-1 focus:ring-destructive"
                : "border-nx-border hover:border-nx-border-hover focus:border-nx-accent"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {value ? (
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                    value.type === "Person"
                      ? "bg-blue-500/10 text-blue-500"
                      : "bg-emerald-500/10 text-emerald-500"
                  }`}
                >
                  {value.type === "Person" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Building className="h-4 w-4" />
                  )}
                </div>
                <div className="flex flex-col min-w-0 flex-1 text-left rtl:text-right">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-semibold text-nx-ink truncate">
                      {value.displayName || value.fullName || value.legalName || "—"}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[9px] px-1 py-0 h-4 border-nx-border"
                    >
                      {value.type === "Person"
                        ? t("party.picker.typeFilterPerson") || "Person"
                        : t("party.picker.typeFilterOrg") || "Organization"}
                    </Badge>
                  </div>
                  {value.displayName &&
                    ((value.fullName && value.fullName !== value.displayName) ||
                      (value.legalName && value.legalName !== value.displayName)) && (
                    <span className="text-[11px] text-nx-ink-3 truncate">
                      {value.fullName || value.legalName}
                    </span>
                  )}
                </div>

                {!disabled && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-nx-ink-3 hover:text-nx-ink rounded-full shrink-0"
                    onClick={handleClearSelection}
                    title={t("party.picker.clearSelection") || "Clear"}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-nx-ink-3">
                <Search className="h-3.5 w-3.5" />
                <span>
                  {placeholder || t("party.picker.searchPlaceholder") || "Search contacts by name..."}
                </span>
              </div>
            )}

            <ChevronDown className="h-4 w-4 text-nx-ink-3 shrink-0 ml-1 rtl:mr-1" />
          </div>
        </PopoverTrigger>

        {/* ── Search & Selection Popover Content ──────────────────────── */}
        <PopoverContent
          align="start"
          className="w-[calc(100vw-2rem)] sm:w-[420px] max-w-[420px] p-0 rounded-2xl border border-nx-border bg-nx-surface shadow-2xl overflow-hidden"
        >
          {/* Header & Search Bar */}
          <div className="p-3 border-b border-nx-border space-y-2 bg-nx-surface-2/30">
            <div className="relative">
              <Search className="absolute left-3 rtl:right-3 top-2.5 h-3.5 w-3.5 text-nx-ink-3" />
              <Input
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setHighlightedIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                placeholder={t("party.picker.searchPlaceholder") || "Search contacts by name..."}
                className="h-9 pl-9 rtl:pr-9 pr-3 rtl:pl-3 text-xs bg-nx-surface border-nx-border"
                autoFocus
                data-testid="party-picker-search-input"
                role="combobox"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                aria-controls="party-picker-listbox"
                aria-activedescendant={
                  highlightedIndex >= 0 && highlightedIndex < parties.length
                    ? `party-option-${highlightedIndex}`
                    : undefined
                }
              />
              {searchTerm && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1.5 rtl:left-1.5 top-1.5 h-6 w-6 p-0 text-nx-ink-3"
                  onClick={() => {
                    setSearchTerm("");
                    setHighlightedIndex(-1);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Filter Pills (if all allowed) */}
            {filterType === "all" && (
              <div className="flex items-center gap-1.5 pt-1">
                <Button
                  type="button"
                  variant={typeFilter === "all" ? "default" : "outline"}
                  size="sm"
                  className="h-6 text-[11px] px-2.5 rounded-full"
                  onClick={() => setTypeFilter("all")}
                >
                  {t("party.picker.typeFilterAll") || "All"}
                </Button>
                <Button
                  type="button"
                  variant={typeFilter === "Person" ? "default" : "outline"}
                  size="sm"
                  className="h-6 text-[11px] px-2.5 rounded-full gap-1"
                  onClick={() => setTypeFilter("Person")}
                >
                  <User className="h-3 w-3" />
                  <span>{t("party.picker.typeFilterPerson") || "People"}</span>
                </Button>
                <Button
                  type="button"
                  variant={typeFilter === "Organization" ? "default" : "outline"}
                  size="sm"
                  className="h-6 text-[11px] px-2.5 rounded-full gap-1"
                  onClick={() => setTypeFilter("Organization")}
                >
                  <Building className="h-3 w-3" />
                  <span>{t("party.picker.typeFilterOrg") || "Organizations"}</span>
                </Button>
              </div>
            )}
          </div>

          {/* Results List or Error State */}
          {queryError ? (
            <div className="p-6 text-center space-y-2.5">
              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertCircle className="h-4 w-4" />
              </div>
              <p className="text-xs text-destructive">
                {queryError instanceof Error && queryError.message.includes("403")
                  ? t("party.picker.permissionDenied") ||
                    "Permission denied: viewing contacts requires parties.view"
                  : t("party.picker.searchError") || "Unable to load contacts"}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1 border-nx-border"
                onClick={() => refetch()}
              >
                <RefreshCw className="h-3 w-3" />
                <span>{t("party.picker.retry") || "Retry"}</span>
              </Button>
            </div>
          ) : (
            <div
              id="party-picker-listbox"
              role="listbox"
              className="max-h-[260px] overflow-y-auto p-1 divide-y divide-nx-border/50"
            >
              {isLoading ? (
                <div className="flex items-center justify-center p-8 text-nx-ink-3 gap-2 text-xs">
                  <Loader2 className="h-4 w-4 animate-spin text-nx-accent" />
                  <span>Searching contacts...</span>
                </div>
              ) : parties.length === 0 ? (
                <div className="p-6 text-center space-y-2">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-nx-surface-2 text-nx-ink-3">
                    <Search className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-nx-ink">
                      {t("party.picker.noResults") || "No contacts found"}
                    </p>
                    <p className="text-[11px] text-nx-ink-3">
                      {t("party.picker.noResultsDesc") ||
                        "Try adjusting your search query or register a new contact below."}
                    </p>
                  </div>
                </div>
              ) : (
                parties.map((p, idx) => {
                  const isSelected = value?.id === p.id;
                  const isHighlighted = highlightedIndex === idx;
                  return (
                    <div
                      key={p.id}
                      id={`party-option-${idx}`}
                      data-testid={`party-option-${idx}`}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelectParty(p)}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                        isHighlighted
                          ? "bg-nx-accent/20 border border-nx-accent/40"
                          : isSelected
                          ? "bg-nx-accent/10 border border-nx-accent/20"
                          : "hover:bg-nx-surface-2 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                            p.type === "Person"
                              ? "bg-blue-500/10 text-blue-500"
                              : "bg-emerald-500/10 text-emerald-500"
                          }`}
                        >
                          {p.type === "Person" ? (
                            <User className="h-3.5 w-3.5" />
                          ) : (
                            <Building className="h-3.5 w-3.5" />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold text-nx-ink truncate">
                            {p.displayName}
                          </span>
                          <div className="flex items-center gap-1.5 text-[10px] text-nx-ink-3">
                            <span>
                              {p.type === "Person"
                                ? t("party.picker.typeFilterPerson") || "Person"
                                : t("party.picker.typeFilterOrg") || "Organization"}
                            </span>
                            {(p.fullName || p.legalName) && (
                              <span className="opacity-70 truncate max-w-[200px]">
                                • {p.type === "Person" ? p.fullName : p.legalName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {isSelected ? (
                        <Check className="h-4 w-4 text-nx-accent shrink-0 ml-2" />
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 text-[11px] px-2 text-nx-accent opacity-0 group-hover:opacity-100"
                        >
                          {t("party.picker.selectAction") || "Select"}
                        </Button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Creation Actions Footer */}
          {(canAddPerson || canAddOrg) && (
            <div className="p-2 border-t border-nx-border bg-nx-surface-2/40 flex items-center gap-2">
              {canAddPerson && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 text-xs gap-1.5 border-nx-border bg-nx-surface"
                  onClick={() => {
                    setIsOpen(false);
                    setIsCreatePersonOpen(true);
                  }}
                >
                  <Plus className="h-3.5 w-3.5 text-blue-500" />
                  <span>{t("party.picker.newPerson") || "New Person"}</span>
                </Button>
              )}

              {canAddOrg && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 text-xs gap-1.5 border-nx-border bg-nx-surface"
                  onClick={() => {
                    setIsOpen(false);
                    setIsCreateOrgOpen(true);
                  }}
                >
                  <Plus className="h-3.5 w-3.5 text-emerald-500" />
                  <span>{t("party.picker.newOrg") || "New Organization"}</span>
                </Button>
              )}
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Field Error State */}
      {error && (
        <div className="flex items-center gap-1 text-[11px] text-destructive pt-0.5">
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Modals for Inline Creation ─────────────────────────────── */}
      <CreatePersonDialog
        open={isCreatePersonOpen}
        onOpenChange={setIsCreatePersonOpen}
        onSubmit={handleCreatePersonSubmit}
      />

      <CreateOrganizationDialog
        open={isCreateOrgOpen}
        onOpenChange={setIsCreateOrgOpen}
        onSubmit={handleCreateOrgSubmit}
      />
    </div>
  );
});

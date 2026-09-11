"use client";

import React, { useEffect, useRef, useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Label } from "@core/ui/label";
import { Input } from "@core/ui/input";
import { Badge } from "@core/ui/badge";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Search, X } from "lucide-react";
import { cn } from "@core/common/utils";
import type { NotificationTarget } from "../../domain/entities/Notification";

/**
 * Props for the NotificationTargetSelector presentation component.
 */
export interface NotificationTargetSelectorProps {
  /** HTML identifier used to associate the search input with its form label. */
  inputId: string;
  /** Collection of currently selected notification target entities. */
  selectedTargets: NotificationTarget[];
  /** Current search query string entered by the operator. */
  searchQuery: string;
  /** Result collection of targets retrieved from the repository search query. */
  searchResults: NotificationTarget[];
  /** Indicates whether an asynchronous target search is currently evaluating. */
  isSearching: boolean;
  /** Indicates whether the target search operation encountered an error. */
  isSearchError: boolean;
  /** Whether the targets field has failed required validation. */
  hasError?: boolean;
  /** Callback fired when the target search input text mutates. */
  onSearchChange: (query: string) => void;
  /** Callback fired when a target candidate is selected from the dropdown. */
  onAddTarget: (target: NotificationTarget) => void;
  /** Callback fired when a target chip is removed from the selected collection. */
  onRemoveTarget: (id: string) => void;
}

/**
 * Component providing an accessible target recipient selector with live search,
 * chip presentation, and keyboard/mouse interaction handling.
 *
 * @param props The notification target selector configuration and callback props.
 * @returns An interactive target selection control.
 */
export function NotificationTargetSelector({
  inputId,
  selectedTargets,
  searchQuery,
  searchResults,
  isSearching,
  isSearchError,
  hasError,
  onSearchChange,
  onAddTarget,
  onRemoveTarget,
}: NotificationTargetSelectorProps): React.JSX.Element {
  const { t } = useI18n();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const noResults =
    searchQuery.length >= 2 && !isSearching && !isSearchError && searchResults.length === 0;

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId} className={cn(hasError && "text-destructive")}>
        {t("messaging.notifications.targets")} *
      </Label>

      {/* Selected Target Chips */}
      {selectedTargets.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {selectedTargets.map((target) => (
            <Badge key={target.id} variant="secondary" className="gap-1">
              {target.name}
              <span className="text-xs text-nx-ink-3">({target.type})</span>
              <button
                type="button"
                onClick={() => onRemoveTarget(target.id)}
                className="rounded-full hover:text-destructive focus-visible:shadow-nx-focus focus-visible:outline-none"
                aria-label={t("messaging.notifications.removeTargetNamed", {
                  name: target.name,
                })}
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Target Search Input and Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <Search
            className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nx-ink-3"
            aria-hidden="true"
          />
          <Input
            id={inputId}
            placeholder={t("messaging.notifications.searchTargets")}
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            className={cn(
              "ps-9",
              hasError && "border-destructive focus-visible:ring-destructive"
            )}
          />
          {isSearching && (
            <LoadingSpinner
              size="inline"
              className="absolute end-3 top-1/2 -translate-y-1/2 text-nx-ink-3"
            />
          )}
        </div>

        {showDropdown && searchQuery.length >= 2 && (
          <div className="absolute top-full z-dropdown mt-1 max-h-48 w-full overflow-y-auto rounded-nx-md border border-nx-line bg-nx-popover shadow-nx-popover">
            {searchResults.length > 0 ? (
              searchResults.map((target) => (
                <button
                  key={`${target.type}-${target.id}`}
                  type="button"
                  className="flex w-full items-center justify-between px-3 py-2 text-start text-sm hover:bg-nx-hover focus-visible:bg-nx-hover focus-visible:outline-none"
                  onClick={() => {
                    onAddTarget(target);
                    setShowDropdown(false);
                  }}
                >
                  <span className="font-medium text-nx-ink">{target.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {target.type}
                  </Badge>
                </button>
              ))
            ) : isSearchError ? (
              <div className="px-3 py-4 text-center text-sm text-destructive">
                {t("common.error")}
              </div>
            ) : (
              noResults && (
                <div className="px-3 py-4 text-center text-sm text-nx-ink-3">
                  <Search className="mx-auto mb-1 h-5 w-5 opacity-40" aria-hidden="true" />
                  {t("messaging.notifications.noTargetsFound")}
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

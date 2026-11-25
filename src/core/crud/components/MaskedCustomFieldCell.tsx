/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@core/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@core/ui/tooltip";
import { useAppStore } from "@core/store/useAppStore";
import {
  hasPermission,
  isPlatformSuperAdminUser,
  CUSTOM_FIELDS_PERMISSIONS,
} from "@core/common/types/permissions";
import { getCustomFieldsExtension, type CustomFieldValueTypeName } from "../customFieldsExtension";

export interface MaskedCustomFieldCellProps {
  entityTypeKey?: string;
  ownerId: string;
  fieldKey: string;
  initialMaskedValue?: string;
  valueType: CustomFieldValueTypeName;
  language: string;
  t: (key: string, params?: Record<string, string | number>) => string;
}

/**
 * Table cell rendering sensitive/masked custom field values.
 * Allows revealing the plaintext value if the user has appropriate permissions
 * via the custom fields extension revealValue API.
 */
export function MaskedCustomFieldCell({
  entityTypeKey,
  ownerId,
  fieldKey,
  initialMaskedValue = "••••••••",
  valueType,
  language,
  t,
}: MaskedCustomFieldCellProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [revealedValue, setRevealedValue] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const permissions = useAppStore((state) => state.permissions);
  const roles = useAppStore((state) => state.roles);
  const user = useAppStore((state) => state.user);

  const isSuperAdmin = isPlatformSuperAdminUser(user, permissions, roles);

  const isAuthorized = Boolean(
    isSuperAdmin || hasPermission(permissions, CUSTOM_FIELDS_PERMISSIONS.VIEW_SENSITIVE)
  );

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthorized) return;

    if (isRevealed) {
      setIsRevealed(false);
      return;
    }

    if (revealedValue !== null) {
      setIsRevealed(true);
      return;
    }

    const api = getCustomFieldsExtension();
    if (!api?.revealValue || !entityTypeKey) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const val = await api.revealValue(entityTypeKey, ownerId, fieldKey);
      setRevealedValue(val);
      setIsRevealed(true);
    } catch (err: any) {
      setError(err?.message || "Failed to reveal");
    } finally {
      setLoading(false);
    }
  };

  const formatted =
    isRevealed && revealedValue !== null
      ? (getCustomFieldsExtension()?.formatValueForDisplay?.(
          valueType,
          revealedValue,
          language,
          t
        ) ?? String(revealedValue))
      : initialMaskedValue;

  const tooltipLabel = !isAuthorized
    ? t("customField.sensitive.permissionRequired") ||
      "Requires 'custom-fields.view-sensitive' permission"
    : loading
      ? t("common.loading") || "Loading..."
      : isRevealed
        ? t("common.hide") || "Hide sensitive value"
        : t("common.reveal") || "Reveal sensitive value";

  return (
    <div className="inline-flex items-center gap-1.5 font-mono text-xs text-nx-ink-3">
      <span
        className={
          isRevealed
            ? "font-sans text-sm text-nx-ink tabular-nums"
            : "select-none tracking-widest"
        }
      >
        {formatted}
      </span>
      {entityTypeKey && getCustomFieldsExtension()?.revealValue && (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleToggle}
                  disabled={loading || !isAuthorized}
                  className="h-8 w-8 rounded-nx-sm p-1 text-nx-ink-3 hover:bg-nx-hover hover:text-nx-ink"
                  aria-label={tooltipLabel}
                >
                  {loading ? (
                    <Loader2
                      className="h-3.5 w-3.5 animate-spin text-nx-accent motion-reduce:animate-none"
                      aria-hidden="true"
                    />
                  ) : isRevealed ? (
                    <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" align="center">
              {tooltipLabel}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      {error && <span className="ms-1 text-[10px] text-nx-danger">{error}</span>}
    </div>
  );
}

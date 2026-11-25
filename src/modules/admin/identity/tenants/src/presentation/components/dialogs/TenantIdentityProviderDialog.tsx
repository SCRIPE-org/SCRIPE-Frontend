/**
 * TenantIdentityProviderDialog — Create/Edit dialog for Platform-Admin Tenant-Scoped IdPs.
 *
 * Supports OIDC, OAuth 2.0, and SAML 2.0 providers with IsActive, TrustIdpMfa,
 * EnabledForAdmins, EnabledForUsers, and optimistic concurrency (RowVersion).
 *
 * @module tenants/presentation/components/dialogs
 */
"use client";

import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { Check, Copy } from "lucide-react";
import type {
  CreateTenantIdentityProviderPayload,
  TenantIdentityProviderDetail,
  TenantIdpProtocol,
  UpdateTenantIdentityProviderPayload,
} from "../../../domain/entities/TenantIdentityProvider";
import {
  buildInitialTenantIdpFormState,
  buildTenantIdpSavePayload,
  toTenantIdpSlug,
  type TenantIdpFormState,
} from "../../utils/tenantIdentityProvider.helpers";
import { TenantIdpProtocolFields } from "./TenantIdpProtocolFields";
import { TenantIdpAccessAppearanceFields } from "./TenantIdpAccessAppearanceFields";

interface TenantIdentityProviderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingProvider: TenantIdentityProviderDetail | null;
  onSave: (
    payload: CreateTenantIdentityProviderPayload | UpdateTenantIdentityProviderPayload
  ) => Promise<void>;
  isSaving: boolean;
}

const CANONICAL_CENTRAL_API_URL = "https://api.scripe.org/api";

function resolveCentralApiOrigin(): string {
  const configured = (process.env.NEXT_PUBLIC_API_URL || "").trim().replace(/\/+$/, "");
  if (/^https?:\/\//i.test(configured)) {
    return configured;
  }
  return CANONICAL_CENTRAL_API_URL;
}

/**
 * Modal dialog for creating or editing a tenant-scoped identity provider (OIDC, OAuth 2.0, SAML 2.0).
 */
export function TenantIdentityProviderDialog({
  open,
  onOpenChange,
  editingProvider,
  onSave,
  isSaving,
}: TenantIdentityProviderDialogProps) {
  const { t, direction } = useI18n();
  const { toast } = useEnhancedToast();
  const isEdit = Boolean(editingProvider);

  const [form, setForm] = useState<TenantIdpFormState>(() =>
    buildInitialTenantIdpFormState(editingProvider)
  );
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [copiedCallback, setCopiedCallback] = useState(false);
  const [prevKey, setPrevKey] = useState(`${open}:${editingProvider?.id ?? "new"}`);

  const currentKey = `${open}:${editingProvider?.id ?? "new"}`;
  if (currentKey !== prevKey) {
    setPrevKey(currentKey);
    if (open) {
      setForm(buildInitialTenantIdpFormState(editingProvider));
      setSlugTouched(Boolean(editingProvider));
      setCopiedCallback(false);
    }
  }

  const updateField = <K extends keyof TenantIdpFormState>(
    field: K,
    value: TenantIdpFormState[K]
  ) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "name" && !slugTouched && !isEdit && typeof value === "string") {
        next.slug = toTenantIdpSlug(value);
      }
      return next;
    });
  };

  const apiBase = resolveCentralApiOrigin();
  const callbackHintUrl =
    form.protocol === "saml"
      ? editingProvider
        ? `${apiBase}/v1/auth/saml/acs/${editingProvider.id}`
        : null
      : `${apiBase}/v1/auth/oidc/callback`;

  const handleCopyCallback = async (url: string) => {
    try {
      await navigator.clipboard?.writeText(url);
      setCopiedCallback(true);
      toast({
        title: t("tenant.domainsCopied"),
        description: url,
      });
      setTimeout(() => setCopiedCallback(false), 2000);
    } catch {
      // Clipboard API unavailable in restricted contexts
    }
  };

  const canSubmit = form.name.trim().length > 0 && form.slug.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await onSave(buildTenantIdpSavePayload(form, editingProvider?.rowVersion));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto" dir={direction}>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("tenant.idpEditTitle") : t("tenant.idpCreateTitle")}
          </DialogTitle>
          <DialogDescription>{t("tenant.idpDialogDesc")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="tenant-idp-name">{t("tenant.idpName")}</Label>
              <Input
                id="tenant-idp-name"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder={t("tenant.idpNamePlaceholder")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tenant-idp-slug">{t("tenant.idpSlug")}</Label>
              <Input
                id="tenant-idp-slug"
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  updateField("slug", e.target.value);
                }}
                placeholder={t("tenant.idpSlugPlaceholder")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tenant-idp-protocol">{t("tenant.idpProtocol")}</Label>
              <Select
                value={form.protocol}
                onValueChange={(val) => updateField("protocol", val as TenantIdpProtocol)}
              >
                <SelectTrigger id="tenant-idp-protocol">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oidc">{t("tenant.idpProtocolOidc")}</SelectItem>
                  <SelectItem value="oauth2">{t("tenant.idpProtocolOAuth2")}</SelectItem>
                  <SelectItem value="saml">{t("tenant.idpProtocolSaml")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tenant-idp-button-label">{t("tenant.idpButtonLabel")}</Label>
              <Input
                id="tenant-idp-button-label"
                value={form.buttonLabel}
                onChange={(e) => updateField("buttonLabel", e.target.value)}
                placeholder={t("tenant.idpButtonLabelPlaceholder")}
              />
            </div>
          </div>

          <div className="rounded-nx-md border border-nx-line bg-nx-raised p-3 text-xs">
            <p className="font-semibold text-nx-ink">{t("tenant.idpCallbackUrlLabel")}</p>
            {callbackHintUrl ? (
              <div className="mt-1.5 flex items-center gap-2">
                <Input
                  type="text"
                  readOnly
                  dir="ltr"
                  value={callbackHintUrl}
                  data-testid="tenant-idp-callback-url-input"
                  className="h-8 flex-1 select-all bg-nx-surface font-mono text-xs text-nx-ink-2"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void handleCopyCallback(callbackHintUrl)}
                  className="h-8 w-8 shrink-0 p-0"
                  aria-label={t("common.copy")}
                  data-testid="tenant-idp-callback-copy-btn"
                >
                  {copiedCallback ? (
                    <Check className="h-4 w-4 text-success" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                </Button>
              </div>
            ) : (
              <p
                className="mt-1 break-all font-mono text-nx-ink-2"
                data-testid="tenant-idp-callback-pending"
              >
                {t("tenant.idpCallbackUrlPending")}
              </p>
            )}
          </div>

          <TenantIdpProtocolFields
            form={form}
            isEdit={isEdit}
            hasClientSecret={Boolean(editingProvider?.hasClientSecret)}
            onUpdateField={updateField}
          />

          <TenantIdpAccessAppearanceFields form={form} onUpdateField={updateField} />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSubmit} loading={isSaving} disabled={!canSubmit}>
            {isEdit ? t("common.save") : t("tenant.idpCreateAction")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

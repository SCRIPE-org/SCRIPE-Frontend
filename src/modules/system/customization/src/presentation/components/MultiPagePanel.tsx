/**
 * MultiPagePanel — Per-auth-page branding overrides
 *
 * Lets admins set page-specific overrides (headline, subtitle, background, etc.)
 * for: login, register, forgot-password, reset-password.
 *
 * Overrides are stored in AuthPagesBrandingJson and deep-merged on the backend
 * with the base login branding — so admins only need to set what differs.
 */
"use client";

import { useState, useCallback, useEffect } from "react";
import { FileText, ChevronRight, RotateCcw, Save, Check, Loader2 } from "lucide-react";
import { cn } from "@/core/common/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { systemContainer } from "@modules/system/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";

// ── Page Definitions ───────────────────────────────────
export type AuthPageId = "login" | "register" | "forgot-password" | "reset-password";

interface AuthPageDef {
  id: AuthPageId;
  labelKey: string;
  descKey: string;
  icon: string;
}

const AUTH_PAGES: AuthPageDef[] = [
  { id: "login",           labelKey: "studio.pages.login",          descKey: "studio.pages.loginDesc",          icon: "🔐" },
  { id: "register",        labelKey: "studio.pages.register",       descKey: "studio.pages.registerDesc",       icon: "📝" },
  { id: "forgot-password", labelKey: "studio.pages.forgotPassword", descKey: "studio.pages.forgotPasswordDesc", icon: "🔑" },
  { id: "reset-password",  labelKey: "studio.pages.resetPassword",  descKey: "studio.pages.resetPasswordDesc",  icon: "🔄" },
];

// ── Override Shape (subset of branding tokens that can differ per page) ──
interface PageOverride {
  headline?: string;
  subtitle?: string;
  logoUrl?: string;
  bgType?: "solid" | "gradient" | "image";
  bgColor?: string;
  bgGradientFrom?: string;
  bgGradientTo?: string;
  bgGradientDirection?: string;
  bgImageUrl?: string;
  primaryColor?: string;
  layout?: string;
  customCss?: string;
}

interface MultiPagePanelProps {
  t: (key: string) => string;
  targetTenantId?: string;
}

export function MultiPagePanel({ t, targetTenantId }: MultiPagePanelProps) {
  const repository = systemContainer.customizationRepository;
  const { success: toastSuccess, error: toastError } = useEnhancedToast();
  const queryClient = useQueryClient();

  const [selectedPage, setSelectedPage] = useState<AuthPageId | null>(null);
  const [overrides, setOverrides] = useState<Record<string, PageOverride>>({});
  const [isDirty, setIsDirty] = useState(false);

  // ── Load existing page overrides ──
  const overridesQuery = useQuery({
    queryKey: ["auth-pages-branding", targetTenantId ?? "self"],
    queryFn: async () => {
      try {
        if (targetTenantId) {
          const entity = await repository.getTenantBrandingById(targetTenantId);
          const raw = (entity.toProps() as any)?.authPagesBrandingJson;
          return raw ? JSON.parse(raw) : {};
        }
        const entity = await repository.getMyBranding();
        const raw = (entity.toProps() as any)?.authPagesBrandingJson;
        return raw ? JSON.parse(raw) : {};
      } catch {
        return {};
      }
    },
    staleTime: 30_000,
  });

  // Initialize from server data
  useEffect(() => {
    if (overridesQuery.data) {
      setOverrides(overridesQuery.data);
    }
  }, [overridesQuery.data]);

  // ── Save overrides ──
  const saveMutation = useMutation({
    mutationFn: async () => {
      const json = JSON.stringify(overrides);
      if (targetTenantId) {
        await repository.updateTenantSettingsById(targetTenantId, {
          draftAuthPagesBrandingJson: json,
        });
      } else {
        await repository.updateMySettings({
          draftAuthPagesBrandingJson: json,
        });
      }
    },
    onSuccess: () => {
      toastSuccess({ title: t("studio.pages.saved") || "Page overrides saved" });
      setIsDirty(false);
      queryClient.invalidateQueries({ queryKey: ["auth-pages-branding"] });
    },
    onError: (error: Error) => {
      toastError({ title: t("studio.pages.saveFailed") || "Save failed", description: error.message });
    },
  });

  // ── Update a field for selected page ──
  const updateField = useCallback((field: keyof PageOverride, value: string) => {
    if (!selectedPage) return;
    setOverrides(prev => ({
      ...prev,
      [selectedPage]: {
        ...(prev[selectedPage] || {}),
        [field]: value || undefined, // Remove empty values
      },
    }));
    setIsDirty(true);
  }, [selectedPage]);

  // ── Clear all overrides for a page ──
  const clearPageOverrides = useCallback(() => {
    if (!selectedPage) return;
    setOverrides(prev => {
      const next = { ...prev };
      delete next[selectedPage];
      return next;
    });
    setIsDirty(true);
  }, [selectedPage]);

  const currentOverride = selectedPage ? (overrides[selectedPage] || {}) : {};
  const hasOverrides = (pageId: string) => overrides[pageId] && Object.keys(overrides[pageId]).length > 0;

  // ── Page List View ──
  if (!selectedPage) {
    return (
      <div className="space-y-4">
        <p className="text-xs text-muted-foreground">
          {t("studio.pages.description") || "Set per-page branding overrides. Each page inherits the base login design — only set what\u2019s different."}
        </p>

        <div className="space-y-2">
          {AUTH_PAGES.map((page) => (
            <button
              key={page.id}
              onClick={() => setSelectedPage(page.id)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-start",
                "hover:bg-muted/50 hover:border-primary/30",
                hasOverrides(page.id)
                  ? "border-primary/40 bg-primary/5"
                  : "border-border bg-background"
              )}
            >
              <span className="text-lg">{page.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">
                  {t(page.labelKey) || page.id}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {hasOverrides(page.id) 
                    ? `${Object.keys(overrides[page.id]).length} ${t("studio.pages.overrideCount") || "overrides"}`
                    : t("studio.pages.inheritsBase") || "Inherits base design"
                  }
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>

        {isDirty && (
          <button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {t("studio.pages.saveAll") || "Save All Overrides"}
          </button>
        )}
      </div>
    );
  }

  // ── Page Detail View ──
  const pageDef = AUTH_PAGES.find(p => p.id === selectedPage)!;

  return (
    <div className="space-y-4">
      {/* Back button */}
      <button
        onClick={() => setSelectedPage(null)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronRight className="h-3 w-3 rotate-180" />
        {t("studio.pages.backToPages") || "Back to pages"}
      </button>

      {/* Page header */}
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <span className="text-lg">{pageDef.icon}</span>
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {t(pageDef.labelKey) || pageDef.id}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t(pageDef.descKey) || "Override specific branding for this page"}
          </p>
        </div>
      </div>

      {/* Override fields */}
      <div className="space-y-3">
        {/* Headline */}
        <OverrideField
          label={t("studio.pages.headline") || "Headline"}
          placeholder={t("studio.pages.inheritPlaceholder") || "Inherited from base"}
          value={currentOverride.headline || ""}
          onChange={(v) => updateField("headline", v)}
        />

        {/* Subtitle */}
        <OverrideField
          label={t("studio.pages.subtitle") || "Subtitle"}
          placeholder={t("studio.pages.inheritPlaceholder") || "Inherited from base"}
          value={currentOverride.subtitle || ""}
          onChange={(v) => updateField("subtitle", v)}
        />

        {/* Logo URL */}
        <OverrideField
          label={t("studio.pages.logoUrl") || "Logo URL"}
          placeholder={t("studio.pages.inheritPlaceholder") || "Inherited from base"}
          value={currentOverride.logoUrl || ""}
          onChange={(v) => updateField("logoUrl", v)}
        />

        {/* Primary Color */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">
            {t("studio.pages.primaryColor") || "Primary Color"}
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={currentOverride.primaryColor || "#3b82f6"}
              onChange={(e) => updateField("primaryColor", e.target.value)}
              className="h-8 w-8 rounded cursor-pointer border border-border"
            />
            <input
              type="text"
              value={currentOverride.primaryColor || ""}
              onChange={(e) => updateField("primaryColor", e.target.value)}
              placeholder={t("studio.pages.inheritPlaceholder") || "Inherited from base"}
              className="flex-1 h-8 px-2 text-xs rounded border border-border bg-background text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Custom CSS */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">
            {t("studio.pages.customCss") || "Page-Specific CSS"}
          </label>
          <textarea
            value={currentOverride.customCss || ""}
            onChange={(e) => updateField("customCss", e.target.value)}
            placeholder={`.login-page { /* ... */ }`}
            rows={3}
            className="w-full px-2 py-1.5 text-xs rounded border border-border bg-background text-foreground font-mono resize-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={clearPageOverrides}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {t("studio.pages.resetPage") || "Reset Page"}
        </button>
        <button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
        >
          {saveMutation.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Check className="h-3.5 w-3.5" />
          )}
          {t("studio.pages.save") || "Save"}
        </button>
      </div>
    </div>
  );
}

// ── Reusable Override Field ──
function OverrideField({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-foreground">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-8 px-2 text-xs rounded border border-border bg-background text-foreground placeholder:text-muted-foreground"
      />
    </div>
  );
}

"use client";

import type { TenantBranding } from "@modules/auth/signin/src/presentation/viewmodels/useTenantResolution";
import { BRAND } from "@core/config/branding";
import { resolveFileUrl } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { SlotRenderer } from "./SlotRenderer";
import type { SlotConfig } from "@modules/auth/core/domain/entities/LoginBrandingTypes";

export interface LoginBrandingProps {
      branding?: TenantBranding | null;
      slotConfig?: SlotConfig;
      position?: "left" | "right";
      transparent?: boolean;
}

/**
 * LoginBranding — Tenant-branded side panel with slot-based content blocks.
 *
 * When custom blocks are provided via SlotConfig, renders them.
 * Otherwise falls back to default feature cards (platform branding).
 * Supports left/right positioning for split-left / split-right layouts.
 */
export function LoginBranding({ branding, slotConfig, position = "left", transparent = false }: LoginBrandingProps) {
      const { t } = useI18n();
      const features = [
            { icon: "🛡️", label: t("auth.branding.featureSecurity"), desc: "Military-grade end-to-end encryption" },
            { icon: "🏢", label: t("auth.branding.featureMultiTenant"), desc: "Complete architectural data isolation" },
            { icon: "⚡", label: t("auth.branding.featureRealtime"), desc: "Instant bi-directional state sync" },
      ];

      // Resolve branding values with fallbacks
      const logoSrc = branding?.logoUrl ? resolveFileUrl(branding.logoUrl) : "/app-logo.png";
      const logoAlt = branding?.companyName ?? branding?.name ?? BRAND.name;
      const headline = branding?.loginHeadline || t("auth.branding.headline");
      const subtitle = branding?.loginSubtitle || t("auth.branding.subtitle");
      const companyName = branding?.companyName ?? branding?.name ?? BRAND.name;

      // Check if we have custom slot content
      const hasCustomSidebarContent = slotConfig?.slots?.["login.sidebar.content"]?.length;
      const hasCustomSidebarTop = slotConfig?.slots?.["login.sidebar.top"]?.length;
      const hasCustomSidebarBottom = slotConfig?.slots?.["login.sidebar.bottom"]?.length;
      const hasAnySlotContent = hasCustomSidebarContent || hasCustomSidebarTop || hasCustomSidebarBottom;

      // Border direction based on panel position
      const borderClass = position === "right" ? "border-l border-border" : "border-r border-border";

      return (
            <div
                  className={`relative hidden w-full lg:flex lg:w-1/2 xl:w-[55%] flex-col justify-between overflow-hidden p-12 lg:p-16 xl:p-24 ${borderClass}`}
                  style={transparent ? {
                  backgroundColor: "transparent",
                  backgroundImage: "none",
            } : {
                  backgroundColor: "var(--login-panel-bg, var(--login-surface, hsl(var(--muted) / 0.4)))",
                  backgroundImage: "var(--login-panel-bg-image, var(--login-bg-image, none))",
                  backgroundSize: "var(--login-panel-bg-image-fit, var(--login-bg-image-fit, cover))",
                  backgroundPosition: "var(--login-panel-bg-image-position, var(--login-bg-image-position, center))",
                  backgroundRepeat: "no-repeat",
            }}
            >

                  {/* ── Panel Overlay (blur + color tint) ── */}
                  {!transparent && (
                        <div className="login-panel-overlay" style={{
                              position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
                              backgroundColor: "var(--login-panel-overlay-color, rgba(0,0,0,0.5))",
                              opacity: "var(--login-panel-overlay-opacity, 0)",
                              backdropFilter: "blur(var(--login-panel-overlay-blur, 0px))",
                        }} />
                  )}

                  {/* ── Theme-Adaptive Background Patterns ── */}
                  <div
                        className="pointer-events-none absolute -left-1/4 -top-1/4 h-[800px] w-[800px] rounded-full blur-[120px]"
                        style={{
                              backgroundColor: branding?.primaryColor
                                    ? `${branding.primaryColor}0D`
                                    : undefined,
                        }}
                  >
                        {!branding?.primaryColor && (
                              <div className="h-full w-full rounded-full bg-primary/5" />
                        )}
                  </div>
                  <div
                        className="pointer-events-none absolute -bottom-1/4 -right-1/4 h-[800px] w-[800px] rounded-full blur-[120px]"
                        style={{
                              backgroundColor: branding?.secondaryColor
                                    ? `${branding.secondaryColor}0D`
                                    : undefined,
                        }}
                  >
                        {!branding?.secondaryColor && (
                              <div className="h-full w-full rounded-full bg-blue-500/5" />
                        )}
                  </div>

                  {/* Subtle Grid overlay */}
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />

                  {/* ── Top: Logo + Sidebar Top Slot ── */}
                  <div className="relative z-10 space-y-6">
                        <div className="flex items-center gap-4">
                              <div className="flex h-20 w-20 overflow-hidden items-center justify-center rounded-2xl bg-[var(--login-surface,hsl(var(--background)))] border border-[var(--login-accent,hsl(var(--border)))] shadow-sm">
                                    <img
                                          src={logoSrc}
                                          alt={`${logoAlt} Logo`}
                                          className="h-full w-full object-cover"
                                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                                    />
                              </div>
                        </div>
                        {slotConfig && (
                              <SlotRenderer slotId="login.sidebar.top" slotConfig={slotConfig} />
                        )}
                  </div>

                  {/* ── Main Content: Headline + Slot Content or Features ── */}
                  <div className="relative z-10 my-auto max-w-xl py-12">
                        <h1 className="login-heading tracking-tight text-[var(--login-text,hsl(var(--foreground)))] leading-[1.12]"
                            style={{ fontSize: "var(--login-size-headline, 3rem)" }}
                        >
                              {headline}
                        </h1>
                        <p className="login-subtitle mt-6 leading-relaxed text-[var(--login-text-muted,hsl(var(--muted-foreground)))] max-w-lg"
                        >
                              {subtitle}
                        </p>

                        {/* Custom slot content OR default feature cards */}
                        {hasAnySlotContent && slotConfig ? (
                              <div className="mt-12">
                                    <SlotRenderer slotId="login.sidebar.content" slotConfig={slotConfig} />
                              </div>
                        ) : !branding ? (
                              <div className="mt-16 grid gap-10">
                                    {features.map((f, i) => (
                                          <div key={i} className="flex items-start gap-5 group">
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--login-accent,hsl(var(--border)))] bg-[var(--login-surface,hsl(var(--background)))] shadow-sm transition-colors group-hover:bg-muted/50">
                                                      <span className="text-xl">{f.icon}</span>
                                                </div>
                                                <div className="pt-1">
                                                      <h3 className="text-base font-medium text-[var(--login-text,hsl(var(--foreground)))]">{f.label}</h3>
                                                      <p className="mt-1.5 text-sm text-[var(--login-text-muted,hsl(var(--muted-foreground)))] font-light">{f.desc}</p>
                                                </div>
                                          </div>
                                    ))}
                              </div>
                        ) : null}
                  </div>

                  {/* ── Footer + Sidebar Bottom Slot ── */}
                  <div className="relative z-10 space-y-4">
                        {slotConfig && (
                              <SlotRenderer slotId="login.sidebar.bottom" slotConfig={slotConfig} />
                        )}
                        <div className="flex items-center gap-4 text-sm font-medium text-[var(--login-text-muted,hsl(var(--muted-foreground)))]">
                              <span>{(branding as any)?.copyrightText || `© ${new Date().getFullYear()} ${companyName}`}</span>
                              <span className="h-1 w-1 rounded-full bg-[var(--login-accent,hsl(var(--border)))]" />
                              <span className="uppercase tracking-widest text-xs opacity-80">{t("auth.branding.trust")}</span>
                        </div>
                  </div>
            </div>
      );
}

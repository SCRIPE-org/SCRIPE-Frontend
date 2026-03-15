"use client";

import type { TenantBranding } from "@modules/auth/hooks/useTenantResolution";

interface LoginBrandingProps {
      t: (key: string) => string;
      branding?: TenantBranding | null;
}

/**
 * LoginBranding — Ultra-premium, theme-adaptive minimalist corporate panel.
 * When tenant branding is provided, displays tenant-specific logo, headline,
 * subtitle, and company name. Falls back to NEXORA defaults otherwise.
 */
export function LoginBranding({ t, branding }: LoginBrandingProps) {
      const features = [
            { icon: "🛡️", label: t("auth.branding.featureSecurity"), desc: "Military-grade end-to-end encryption" },
            { icon: "🏢", label: t("auth.branding.featureMultiTenant"), desc: "Complete architectural data isolation" },
            { icon: "⚡", label: t("auth.branding.featureRealtime"), desc: "Instant bi-directional state sync" },
      ];

      // Resolve branding values with fallbacks
      const logoSrc = branding?.logoUrl || "/app-logo.png";
      const logoAlt = branding?.companyName ?? branding?.name ?? "NEXORA";
      const headline = branding?.loginHeadline || t("auth.branding.headline");
      const subtitle = branding?.loginSubtitle || t("auth.branding.subtitle");
      const companyName = branding?.companyName ?? branding?.name ?? "NEXORA";

      return (
            <div className="relative hidden w-full lg:flex lg:w-1/2 xl:w-[55%] flex-col justify-between overflow-hidden bg-muted/40 p-12 lg:p-16 xl:p-24 border-r border-border">

                  {/* ── Theme-Adaptive Background Patterns ── */}
                  {/* Primary gradient — uses tenant primary color via CSS var if available */}
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
                  {/* Secondary gradient — uses tenant secondary color via CSS var if available */}
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

                  {/* ── Top Header ── */}
                  <div className="relative z-10 flex items-center gap-4">
                        <div className="flex h-20 w-20 overflow-hidden items-center justify-center rounded-2xl bg-background border border-border shadow-sm">
                              <img
                                    src={logoSrc}
                                    alt={`${logoAlt} Logo`}
                                    className="h-full w-full object-cover"
                                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                              />
                        </div>
                  </div>

                  {/* ── Main Content ── */}
                  <div className="relative z-10 my-auto max-w-xl py-20">
                        <h1 className="text-4xl font-semibold tracking-tight text-foreground lg:text-5xl xl:text-6xl leading-[1.12]">
                              {headline}
                        </h1>
                        <p className="mt-6 text-lg leading-relaxed text-muted-foreground font-light max-w-lg">
                              {subtitle}
                        </p>

                        {/* Show feature cards only when using default NEXORA branding */}
                        {!branding && (
                              <div className="mt-16 grid gap-10">
                                    {features.map((f, i) => (
                                          <div key={i} className="flex items-start gap-5 group">
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-background shadow-sm transition-colors group-hover:bg-muted/50">
                                                      <span className="text-xl">{f.icon}</span>
                                                </div>
                                                <div className="pt-1">
                                                      <h3 className="text-base font-medium text-foreground">{f.label}</h3>
                                                      <p className="mt-1.5 text-sm text-muted-foreground font-light">{f.desc}</p>
                                                </div>
                                          </div>
                                    ))}
                              </div>
                        )}
                  </div>

                  {/* ── Footer ── */}
                  <div className="relative z-10 flex items-center gap-4 text-sm font-medium text-muted-foreground">
                        <span>© {new Date().getFullYear()} {companyName}</span>
                        <span className="h-1 w-1 rounded-full bg-border" />
                        <span className="uppercase tracking-widest text-xs opacity-80">{t("auth.branding.trust")}</span>
                  </div>
            </div>
      );
}

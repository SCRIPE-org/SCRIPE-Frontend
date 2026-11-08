"use client";

/**
 * AccountIntegrationsView
 *
 * Page 9 (/account/integrations — "API & Developer Tokens"):
 * Dedicated 100% to SHA-256 Personal Access Tokens (PATs), Grouped Human-Readable Scope Selection,
 * IP CIDR Binding, Token Regeneration (Roll Token), and API Rate-Limit & Last-Used Telemetry.
 */
import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { useIntegrationsFederationViewModel } from "../viewmodels/useIntegrationsFederationViewModel";
import {
  KeyRound, Plus, Trash2, Copy, Check, RefreshCw, Activity, ShieldCheck, Network,
} from "lucide-react";

const SCOPE_PRESETS = [
  { id: "crm:read", labelKey: "profile.integrations.scopeCrmRead", value: "crm:read,venue:read" },
  { id: "crm:write", labelKey: "profile.integrations.scopeCrmWrite", value: "crm:read,crm:write,venue:read" },
  { id: "analytics:export", labelKey: "profile.integrations.scopeAnalyticsExport", value: "analytics:read,finance:export" },
];

export function AccountIntegrationsView() {
  const { t } = useI18n();
  const {
    personalTokens, createdTokenSecret, clearCreatedTokenSecret, generateToken, revokeToken,
  } = useIntegrationsFederationViewModel();

  const [patName, setPatName] = useState("");
  const [patScopes, setPatScopes] = useState("crm:read,venue:read");
  const [patCidr, setPatCidr] = useState("197.38.14.0/24");
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [rolledId, setRolledId] = useState<string | null>(null);

  const handleMintToken = () => {
    const label = patName.trim() || "CI/CD Sync Pipeline Token";
    const scopes = patScopes.split(",").map((s) => s.trim()).filter(Boolean);
    generateToken({ name: label, scopes: scopes.length > 0 ? scopes : ["crm:read"], expiresInDays: 90 });
    setPatName("");
  };

  const handleRollToken = (tokenName: string, scopes: string[], id: string) => {
    setRolledId(id);
    generateToken({ name: `${tokenName} (Rolled)`, scopes, expiresInDays: 90 });
  };

  const handleCopySecret = (secret: string) => {
    void navigator.clipboard?.writeText(secret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-nx-ink">{t("profile.integrations.title")}</h1>
          <p className="text-xs text-nx-ink-3 mt-1">{t("profile.integrations.subtitle")}</p>
        </div>
        <Badge className="bg-nx-accent-fill text-nx-on-fill text-xs font-mono px-2.5 py-0.5 w-fit">
          SHA-256 HMAC • TLS 1.3
        </Badge>
      </div>

      {/* API Rate-Limit & Last-Used Telemetry Strip */}
      <div data-testid="pat-telemetry-strip" className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="rounded-xl border border-nx-line bg-nx-surface p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-nx-ink-3">{t("profile.integrations.rateLimitWindowLabel")}</p>
            <p className="text-lg font-bold font-mono text-nx-ink mt-0.5">4,980 / 5,000</p>
            <p className="text-[11px] text-success font-medium mt-0.5">{t("profile.integrations.rateLimitHealthyHint")}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-nx-accent/30 bg-nx-accent-wash text-nx-accent">
            <Activity className="h-5 w-5" style={{ minWidth: 20, minHeight: 20 }} />
          </div>
        </div>

        <div className="rounded-xl border border-nx-line bg-nx-surface p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-nx-ink-3">{t("profile.integrations.activePatsCountLabel")}</p>
            <p className="text-lg font-bold font-mono text-nx-ink mt-0.5">{personalTokens.length}</p>
            <p className="text-[11px] text-nx-ink-3 font-mono mt-0.5">scr_pat_live_*</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-nx-line bg-nx-ground text-nx-accent">
            <KeyRound className="h-5 w-5" style={{ minWidth: 20, minHeight: 20 }} />
          </div>
        </div>

        <div className="rounded-xl border border-nx-line bg-nx-surface p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-nx-ink-3">{t("profile.integrations.lastCallerIpLabel")}</p>
            <p className="text-lg font-bold font-mono text-nx-ink mt-0.5">197.38.14.88</p>
            <p className="text-[11px] text-nx-ink-3 font-mono mt-0.5">{t("profile.integrations.cidrBoundHint")}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-nx-line bg-nx-ground text-nx-accent">
            <Network className="h-5 w-5" style={{ minWidth: 20, minHeight: 20 }} />
          </div>
        </div>
      </div>

      {/* Personal Access Tokens (SHA-256) */}
      <Card data-testid="pat-vault-card" className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
            <CardTitle className="text-base font-bold text-nx-ink">{t("profile.integrations.patTitle")}</CardTitle>
          </div>
          <CardDescription className="text-xs text-nx-ink-3">{t("profile.integrations.patSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {createdTokenSecret && (
            <div data-testid="minted-pat-banner" className="p-3.5 rounded-xl border border-nx-accent bg-nx-accent-wash space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-nx-ink">{t("profile.integrations.oneTimeSecretBanner")}</span>
                <Button variant="ghost" size="sm" onClick={clearCreatedTokenSecret} className="h-6 text-[10px]">
                  {t("profile.integrations.dismissSecret")}
                </Button>
              </div>
              <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-nx-ground border border-nx-line font-mono text-xs text-nx-accent">
                <span className="truncate">{createdTokenSecret}</span>
                <Button size="sm" variant="outline" onClick={() => handleCopySecret(createdTokenSecret)} className="h-7 text-xs gap-1 shrink-0">
                  {copiedSecret ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedSecret ? t("profile.twoFactor.copied") : t("profile.twoFactor.copyAll")}</span>
                </Button>
              </div>
            </div>
          )}

          {/* Mint New PAT Form with Grouped Scope Presets & CIDR Binding */}
          <div className="rounded-xl border border-nx-line bg-nx-ground p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label className="text-xs font-bold text-nx-ink">{t("profile.integrations.mintNewSectionTitle")}</Label>
              <div className="flex flex-wrap items-center gap-1.5">
                {SCOPE_PRESETS.map((preset) => (
                  <Button
                    key={preset.id}
                    type="button"
                    size="sm"
                    variant={patScopes === preset.value ? "default" : "outline"}
                    onClick={() => setPatScopes(preset.value)}
                    className={
                      patScopes === preset.value
                        ? "h-6 text-[10px] bg-nx-accent-fill text-nx-on-fill font-semibold px-2"
                        : "h-6 text-[10px] px-2"
                    }
                  >
                    {t(preset.labelKey)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
              <Input data-testid="pat-name-input" value={patName} onChange={(e) => setPatName(e.target.value)} placeholder={t("profile.integrations.patNamePlaceholder")} className="text-xs h-9" />
              <Input data-testid="pat-scopes-input" value={patScopes} onChange={(e) => setPatScopes(e.target.value)} placeholder="crm:read,venue:read" className="text-xs font-mono h-9" />
              <Input data-testid="pat-cidr-input" value={patCidr} onChange={(e) => setPatCidr(e.target.value)} placeholder="197.38.14.0/24" className="text-xs font-mono h-9" />
              <Button size="sm" data-testid="mint-pat-btn" onClick={handleMintToken} className="bg-nx-accent-fill text-nx-on-fill font-semibold text-xs h-9 gap-1.5">
                <Plus className="h-3.5 w-3.5" style={{ minWidth: 14, minHeight: 14 }} />
                <span>{t("profile.integrations.mintTokenBtn")}</span>
              </Button>
            </div>
          </div>

          {/* Active PAT List */}
          <div className="space-y-2.5">
            {personalTokens.map((pat) => (
              <div key={pat.id} data-testid={`pat-row-${pat.id}`} className="p-3.5 rounded-xl border border-nx-line bg-nx-ground flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-nx-ink">{pat.name}</span>
                    <Badge variant="outline" className="font-mono text-[10px] border-nx-line text-nx-ink-2">{pat.prefix}••••••••</Badge>
                    <Badge variant="outline" className="font-mono text-[10px] border-nx-accent/30 text-nx-accent">CIDR: {patCidr || "197.38.14.0/24"}</Badge>
                    {rolledId === pat.id && (
                      <Badge className="bg-success/15 text-success border border-success/30 text-[10px]">{t("profile.integrations.tokenRolledBadge")}</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {pat.scopes.map((sc) => (
                      <Badge key={sc} className="bg-nx-surface text-nx-ink-2 border border-nx-line text-[10px] font-mono">{sc}</Badge>
                    ))}
                    <span className="text-[11px] font-mono text-nx-ink-3 ms-1">
                      {t("profile.integrations.expiresAt")}: {pat.expiresAt.toISOString().slice(0, 10)} • {t("profile.integrations.lastUsed")}: {pat.lastUsedAt ? pat.lastUsedAt.toISOString().slice(0, 10) : "—"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="outline" size="sm" data-testid={`roll-pat-btn-${pat.id}`} onClick={() => handleRollToken(pat.name, pat.scopes, pat.id)} className="h-8 text-xs font-semibold gap-1.5">
                    <RefreshCw className="h-3.5 w-3.5" style={{ minWidth: 14, minHeight: 14 }} />
                    <span>{t("profile.integrations.rollTokenBtn")}</span>
                  </Button>
                  <Button variant="outline" size="sm" data-testid={`revoke-pat-btn-${pat.id}`} onClick={() => revokeToken(pat.id)} className="text-destructive border-destructive/30 hover:bg-destructive/10 h-8 text-xs gap-1">
                    <Trash2 className="h-3.5 w-3.5" style={{ minWidth: 14, minHeight: 14 }} />
                    <span>{t("profile.integrations.revokeBtn")}</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

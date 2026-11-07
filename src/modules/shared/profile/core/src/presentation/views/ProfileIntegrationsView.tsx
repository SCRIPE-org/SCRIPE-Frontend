"use client";

/**
 * ProfileIntegrationsView
 *
 * SSO Identity Providers & Developer Personal Access Tokens (PAT) view.
 * Configures enterprise identity federation (Google, Microsoft, Apple, Okta)
 * and cryptographic API tokens for club automation.
 */
import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { useIntegrationsFederationViewModel } from "../viewmodels/useIntegrationsFederationViewModel";
import { PersonalAccessTokenDialog } from "../components/PersonalAccessTokenDialog";
import {
  Network,
  KeyRound,
  Plus,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Code2,
} from "lucide-react";

/**
 * ProfileIntegrationsView Component
 *
 * Renders linked identity providers and personal access token management.
 */
export function ProfileIntegrationsView() {
  const { t } = useI18n();
  const {
    externalLogins,
    unlinkExternalLogin,
    isUnlinking,
    personalTokens,
    createdTokenSecret,
    clearCreatedTokenSecret,
    generateToken,
    revokeToken,
  } = useIntegrationsFederationViewModel();

  const [isPatModalOpen, setIsPatModalOpen] = useState(false);

  const supportedProviders = [
    { id: "google", name: "Google Workspace", desc: t("profile.integrations.googleDesc") },
    { id: "microsoft", name: "Microsoft Entra ID", desc: t("profile.integrations.microsoftDesc") },
    { id: "apple", name: "Apple ID", desc: t("profile.integrations.appleDesc") },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-nx-ink">
          {t("profile.integrations.title")}
        </h1>
        <p className="text-xs text-nx-ink-3 mt-1">
          {t("profile.integrations.description")}
        </p>
      </div>

      {/* ── 1. Connected Identity Providers (SSO) ────────────────── */}
      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Network className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
            <CardTitle className="text-sm font-bold text-nx-ink">
              {t("profile.integrations.ssoSectionTitle")}
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-nx-ink-3">
            {t("profile.integrations.ssoSectionDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {supportedProviders.map((provider) => {
            const linked = externalLogins.find(
              (l) => l.providerName.toLowerCase() === provider.id
            );

            return (
              <div
                key={provider.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-nx-line bg-nx-raised hover:border-nx-line-hi transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="p-2.5 rounded-lg bg-nx-surface border border-nx-line text-nx-ink shrink-0 font-bold text-xs uppercase">
                    {provider.id.slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-nx-ink truncate">
                        {provider.name}
                      </span>
                      {linked ? (
                        <Badge
                          variant="outline"
                          className="border-success/30 text-success bg-success/10 text-[10px] py-0 px-1.5 flex items-center gap-1 font-semibold"
                        >
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          <span>{t("profile.integrations.connected")}</span>
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-nx-line text-nx-ink-3 text-[10px] py-0 px-1.5">
                          {t("profile.integrations.notLinked")}
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-nx-ink-2 mt-0.5 truncate">
                      {linked?.email || provider.desc}
                    </p>
                  </div>
                </div>

                <div>
                  {linked ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => unlinkExternalLogin(linked.id)}
                      disabled={isUnlinking}
                      className="h-8 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                    >
                      {t("profile.integrations.disconnectBtn")}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs gap-1.5"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>{t("profile.integrations.connectBtn")}</span>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* ── 2. Developer Personal Access Tokens (PAT) ─────────────── */}
      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
              <CardTitle className="text-sm font-bold text-nx-ink">
                {t("profile.pat.sectionTitle")}
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-nx-ink-3 mt-1">
              {t("profile.pat.sectionDesc")}
            </CardDescription>
          </div>

          <Button
            size="sm"
            onClick={() => setIsPatModalOpen(true)}
            className="text-xs font-semibold gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{t("profile.pat.createTokenBtn")}</span>
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {personalTokens.length === 0 ? (
            <div className="p-6 rounded-xl border border-nx-line bg-nx-raised text-center space-y-2">
              <div className="h-10 w-10 rounded-full bg-nx-accent-wash text-nx-accent flex items-center justify-center mx-auto">
                <KeyRound className="h-5 w-5" style={{ minWidth: 20, minHeight: 20 }} />
              </div>
              <p className="text-xs font-semibold text-nx-ink">
                {t("profile.pat.noTokensTitle")}
              </p>
              <p className="text-[11px] text-nx-ink-3 max-w-sm mx-auto">
                {t("profile.pat.noTokensDesc")}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {personalTokens.map((token) => (
                <div
                  key={token.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-nx-line bg-nx-raised hover:border-nx-line-hi transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-nx-ink truncate">
                        {token.name}
                      </span>
                      <span className="font-mono text-[10px] text-nx-ink-3 px-1.5 py-0.5 rounded bg-nx-surface border border-nx-line">
                        {token.prefix}••••••••
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      {token.scopes.map((scope) => (
                        <Badge
                          key={scope}
                          variant="outline"
                          className="text-[9px] py-0 px-1 border-nx-accent/30 text-nx-accent bg-nx-accent-wash/30"
                        >
                          {scope}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-nx-ink-3 font-mono">
                      <span>{t("profile.pat.created", { date: token.createdAt.toLocaleDateString() })}</span>
                      <span>{t("profile.pat.expires", { date: token.expiresAt.toLocaleDateString() })}</span>
                      {token.lastUsedAt && (
                        <span>{t("profile.pat.lastUsed", { date: token.lastUsedAt.toLocaleDateString() })}</span>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => revokeToken(token.id)}
                    className="h-8 w-8 p-0 text-nx-ink-3 hover:text-destructive hover:bg-destructive/10"
                    aria-label={t("profile.pat.revokeTokenAria")}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* PAT Modal */}
      <PersonalAccessTokenDialog
        isOpen={isPatModalOpen}
        onClose={() => setIsPatModalOpen(false)}
        onGenerate={generateToken}
        createdSecret={createdTokenSecret}
        onClearSecret={clearCreatedTokenSecret}
      />
    </div>
  );
}

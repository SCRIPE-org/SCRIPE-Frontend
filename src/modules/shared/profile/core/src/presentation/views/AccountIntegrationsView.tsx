"use client";

/**
 * AccountIntegrationsView
 *
 * Page 9 (/account/integrations):
 * Dynamic Connected Enterprise SSO Providers (identity.identity_providers & identity.external_logins)
 * and Database-Backed SHA-256 Personal Access Tokens (identity.personal_access_tokens) with PBAC Scopes.
 */
import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { useAccountIntegrationsSliceViewModel } from "../viewmodels/useSovereignAccountSlicesViewModel";
import { useIntegrationsFederationViewModel } from "../viewmodels/useIntegrationsFederationViewModel";
import { ExternalLoginsSection } from "../components/ExternalLoginsSection";
import { PersonalAccessTokenDialog } from "../components/PersonalAccessTokenDialog";
import {
  Key,
  Plus,
  Trash2,
  ShieldCheck,
  Link2,
  CheckCircle2,
} from "lucide-react";

export function AccountIntegrationsView() {
  const { t } = useI18n();
  const {
    createdTokenSecret,
    clearCreatedTokenSecret,
    generateToken,
  } = useIntegrationsFederationViewModel();

  const {
    integrations,
    deleteIntegrationItem,
    isDeletingItem,
  } = useAccountIntegrationsSliceViewModel();

  const [isPatDialogOpen, setIsPatDialogOpen] = useState(false);

  const idpLinks = integrations?.externalIdpLinks ?? [];
  const pats = integrations?.personalAccessTokens ?? [];
  const availableScopes = integrations?.availableScopes ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-nx-ink">
          {t("profile.integrations.title")}
        </h1>
        <p className="text-xs text-nx-ink-3 mt-1">
          {t("profile.integrations.description")}
        </p>
      </div>

      {/* 1. Dynamic Connected Enterprise SSO Providers */}
      <ExternalLoginsSection />

      {idpLinks.length > 0 && (
        <Card
          data-testid="enterprise-idp-directory-card"
          className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors"
        >
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
              <CardTitle className="text-sm font-bold text-nx-ink">
                {t("profile.integrations.idpDirectoryTitle")}
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-nx-ink-3">
              {t("profile.integrations.idpDirectoryDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {idpLinks.map((idp) => (
              <div
                key={idp.id}
                className="p-3.5 rounded-xl border border-nx-line bg-nx-raised flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-nx-ink truncate">
                      {idp.providerName}
                    </span>
                    {idp.protocolType && (
                      <Badge variant="outline" className="text-[10px] font-mono border-nx-line text-nx-ink-3">
                        {idp.protocolType}
                      </Badge>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-nx-ink-3 truncate block mt-0.5">
                    {idp.externalEmail}
                  </span>
                </div>
                {idp.isConnected ? (
                  <Badge variant="outline" className="border-success/30 text-success bg-success/10 text-[10px] gap-1 shrink-0">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>{t("profile.integrations.idpConnectedBadge")}</span>
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-nx-line text-nx-ink-3 text-[10px] shrink-0">
                    {t("profile.integrations.idpAvailableBadge")}
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 2. SHA-256 Personal Access Tokens (PATs) */}
      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
              <CardTitle className="text-sm font-bold text-nx-ink">
                {t("profile.tokens.sectionTitle")}
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-nx-ink-3 mt-1">
              {t("profile.tokens.sectionDesc")}
            </CardDescription>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => setIsPatDialogOpen(true)}
            data-testid="open-generate-pat-btn"
            className="h-8 text-xs font-semibold gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{t("profile.tokens.generateBtn")}</span>
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {availableScopes.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pb-1">
              <ShieldCheck className="h-3.5 w-3.5 text-nx-accent" />
              <span className="text-[11px] font-semibold text-nx-ink-2">
                {t("profile.integrations.availableScopesLabel")}:
              </span>
              {availableScopes.map((scope) => (
                <Badge
                  key={scope}
                  variant="outline"
                  className="text-[10px] font-mono border-nx-line bg-nx-raised text-nx-ink-2"
                >
                  {scope}
                </Badge>
              ))}
            </div>
          )}

          {pats.length === 0 ? (
            <p className="text-xs text-nx-ink-3">{t("profile.tokens.noTokensTitle")}</p>
          ) : (
            pats.map((tok) => (
              <div
                key={tok.id}
                className="p-3.5 rounded-xl border border-nx-line bg-nx-raised flex items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-nx-ink">{tok.name}</span>
                    <Badge variant="outline" className="text-[10px] font-mono border-nx-line text-nx-ink-3">
                      {tok.tokenPrefix}••••
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {tok.scopes.map((sc) => (
                      <Badge
                        key={sc}
                        variant="outline"
                        className="text-[10px] font-mono border-nx-accent/40 text-nx-accent bg-nx-accent-wash"
                      >
                        {sc}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isDeletingItem}
                  onClick={() => deleteIntegrationItem({ kind: "pat", id: tok.id })}
                  className="h-7 w-7 p-0 text-nx-ink-3 hover:text-destructive shrink-0"
                  aria-label={t("profile.tokens.revokeTokenAria")}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <PersonalAccessTokenDialog
        isOpen={isPatDialogOpen}
        onClose={() => { setIsPatDialogOpen(false); clearCreatedTokenSecret(); }}
        onGenerate={generateToken}
        createdSecret={createdTokenSecret}
        onClearSecret={clearCreatedTokenSecret}
      />
    </div>
  );
}

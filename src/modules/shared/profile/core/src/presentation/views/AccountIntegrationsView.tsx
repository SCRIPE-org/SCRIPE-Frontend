"use client";

/**
 * AccountIntegrationsView
 *
 * Sovereign Slice 15 (/account/integrations):
 * Enterprise SSO Federation, Database-Backed SHA-256 Personal Access Tokens (PATs),
 * Data-Science SSH/GPG Signing Keys, Private iCal/CalDAV Pitch Schedule Feed,
 * and HMAC-SHA256 Personal Webhooks.
 */
import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Badge } from "@core/ui/badge";
import { useAccountIntegrationsSliceViewModel } from "../viewmodels/useSovereignAccountSlicesViewModel";
import { useIntegrationsFederationViewModel } from "../viewmodels/useIntegrationsFederationViewModel";
import { ExternalLoginsSection } from "../components/ExternalLoginsSection";
import { PersonalAccessTokenDialog } from "../components/PersonalAccessTokenDialog";
import {
  Key,
  Terminal,
  Webhook,
  Calendar,
  Plus,
  Trash2,
  Copy,
  CheckCircle2,
} from "lucide-react";

export function AccountIntegrationsView() {
  const { t } = useI18n();
  const {
    externalLogins,
    isLoadingLogins,
    loginsError,
    unlinkExternalLogin,
    isUnlinking,
    createdTokenSecret,
    clearCreatedTokenSecret,
    generateToken,
  } = useIntegrationsFederationViewModel();

  const {
    integrations,
    createIntegrationItem,
    isCreatingItem,
    deleteIntegrationItem,
    isDeletingItem,
  } = useAccountIntegrationsSliceViewModel();

  const [isPatDialogOpen, setIsPatDialogOpen] = useState(false);
  const [sshTitle, setSshTitle] = useState("");
  const [sshMaterial, setSshMaterial] = useState("");
  const [webhookName, setWebhookName] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [copiedFeed, setCopiedFeed] = useState(false);

  const pats = integrations?.personalAccessTokens ?? [];
  const sshKeys = integrations?.sshKeys ?? [];
  const webhooks = integrations?.webhooks ?? [];
  const calDavUrl = integrations?.privateIcalFeedUrl || "";

  const handleAddSshKey = async () => {
    if (!sshTitle.trim() || !sshMaterial.trim()) return;
    await createIntegrationItem({
      itemKind: "ssh",
      name: sshTitle.trim(),
      publicKeyOrTargetUrl: sshMaterial.trim(),
      scopesOrEvents: [],
    });
    setSshTitle("");
    setSshMaterial("");
  };

  const handleAddWebhook = async () => {
    if (!webhookName.trim() || !webhookUrl.trim()) return;
    await createIntegrationItem({
      itemKind: "webhook",
      name: webhookName.trim(),
      publicKeyOrTargetUrl: webhookUrl.trim(),
      scopesOrEvents: ["match.lineup.locked", "security.duress.canary"],
    });
    setWebhookName("");
    setWebhookUrl("");
  };

  const handleCopyCalDav = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard && calDavUrl) {
      void navigator.clipboard.writeText(calDavUrl);
    }
    setCopiedFeed(true);
    setTimeout(() => setCopiedFeed(false), 2000);
  };

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

      {/* 1. Enterprise SSO Federation */}
      <ExternalLoginsSection
        logins={externalLogins}
        isLoading={isLoadingLogins}
        error={loginsError}
        onUnlink={unlinkExternalLogin}
        isUnlinking={isUnlinking}
      />

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
        <CardContent className="space-y-2.5">
          {pats.length === 0 ? (
            <p className="text-xs text-nx-ink-3">{t("profile.tokens.noTokensTitle")}</p>
          ) : (
            pats.map((tok) => (
              <div
                key={tok.id}
                className="p-3 rounded-xl border border-nx-line bg-nx-raised flex items-center justify-between gap-3"
              >
                <div>
                  <span className="text-xs font-bold text-nx-ink block">{tok.name}</span>
                  <span className="text-[11px] font-mono text-nx-ink-3">
                    {tok.tokenPrefix}•••• &bull; {tok.scopes.join(", ")}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isDeletingItem}
                  onClick={() => deleteIntegrationItem({ kind: "pat", id: tok.id })}
                  className="h-7 w-7 p-0 text-nx-ink-3 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* 3. Data-Science SSH/GPG Signing Keys & Personal Webhooks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
              <CardTitle className="text-sm font-bold text-nx-ink">
                {t("profile.integrations.sshKeysTitle")}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {sshKeys.map((k) => (
              <div key={k.id} className="p-2.5 rounded-lg border border-nx-line bg-nx-raised flex items-center justify-between text-xs">
                <div className="min-w-0">
                  <span className="font-bold text-nx-ink block truncate">{k.title}</span>
                  <span className="text-[10px] font-mono text-nx-ink-3 truncate block">{k.fingerprintSha256}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteIntegrationItem({ kind: "ssh", id: k.id })}
                  className="h-7 w-7 p-0 text-nx-ink-3 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            <div className="flex gap-2 pt-1">
              <Input value={sshTitle} onChange={(e) => setSshTitle(e.target.value)} placeholder={t("profile.integrations.sshTitlePlaceholder")} className="h-8 text-xs bg-nx-raised border-nx-line" />
              <Input value={sshMaterial} onChange={(e) => setSshMaterial(e.target.value)} placeholder="ssh-ed25519 AAAA..." className="h-8 text-xs font-mono bg-nx-raised border-nx-line" />
              <Button type="button" size="sm" disabled={isCreatingItem} onClick={handleAddSshKey} data-testid="add-ssh-key-btn" className="h-8 text-xs shrink-0">
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Webhook className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
              <CardTitle className="text-sm font-bold text-nx-ink">
                {t("profile.integrations.webhooksTitle")}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {webhooks.map((wh) => (
              <div key={wh.id} className="p-2.5 rounded-lg border border-nx-line bg-nx-raised flex items-center justify-between text-xs">
                <div className="min-w-0">
                  <span className="font-bold text-nx-ink block truncate">{wh.name}</span>
                  <span className="text-[10px] font-mono text-nx-ink-3 truncate block">{wh.targetUrl}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteIntegrationItem({ kind: "webhook", id: wh.id })}
                  className="h-7 w-7 p-0 text-nx-ink-3 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            <div className="flex gap-2 pt-1">
              <Input value={webhookName} onChange={(e) => setWebhookName(e.target.value)} placeholder={t("profile.integrations.webhookNamePlaceholder")} className="h-8 text-xs bg-nx-raised border-nx-line" />
              <Input value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} placeholder="https://..." className="h-8 text-xs font-mono bg-nx-raised border-nx-line" />
              <Button type="button" size="sm" disabled={isCreatingItem} onClick={handleAddWebhook} data-testid="add-webhook-btn" className="h-8 text-xs shrink-0">
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Private iCal / CalDAV Pitch Schedule Feed */}
      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
            <CardTitle className="text-sm font-bold text-nx-ink">
              {t("profile.integrations.caldavTitle")}
            </CardTitle>
          </div>
          {copiedFeed && (
            <Badge variant="outline" className="border-success/30 text-success bg-success/10 text-[10px] gap-1">
              <CheckCircle2 className="h-3 w-3" />
              <span>{t("profile.common.copied")}</span>
            </Badge>
          )}
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input readOnly value={calDavUrl} className="h-8 text-xs font-mono bg-nx-raised border-nx-line text-nx-ink-2" />
          <Button type="button" variant="outline" size="sm" onClick={handleCopyCalDav} data-testid="copy-caldav-url-btn" className="h-8 text-xs gap-1.5 shrink-0">
            <Copy className="h-3.5 w-3.5" />
            <span>{t("profile.common.copy")}</span>
          </Button>
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

"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { KeyRound, Link2, Tag, Palette } from "lucide-react";
import { GeneralSection } from "./GeneralSection";
import { EndpointsSection } from "./EndpointsSection";
import { ScopesGrantsSection } from "./ScopesGrantsSection";
import { SecuritySection } from "./SecuritySection";
import { TokenConfigSection } from "./TokenConfigSection";
import { BrandingSection } from "./BrandingSection";
import { ClientCredentialsCard } from "./ClientCredentialsCard";
import { OAuthAppMetadataCard } from "./OAuthAppMetadataCard";
import { DangerZoneCard } from "./DangerZoneCard";

import { OAuthAppFormState } from "../viewmodels/useOAuthAppDetailViewModel";

interface OidcEditTabsProps {
  vm: {
    form: OAuthAppFormState;
    updateField: <K extends keyof OAuthAppFormState>(field: K, value: OAuthAppFormState[K]) => void;
    clientTypeOptions: any[];
    isCreateMode: boolean;
    standardScopes: string[];
    standardGrantTypes: string[];
    addRedirectUri: () => void;
    removeRedirectUri: (index: number) => void;
    updateRedirectUri: (index: number, value: string) => void;
    addPostLogoutUri: () => void;
    removePostLogoutUri: (index: number) => void;
    updatePostLogoutUri: (index: number, value: string) => void;
    app: any;
    isSaving: boolean;
    isRegenerating: boolean;
    regenerateSecret: () => void;
    isDeleting: boolean;
    deleteApp: () => void;
  };
  copiedField: string | null;
  copyToClipboard: (text: string, field: string) => void;
}

export function OidcEditTabs({ vm, copiedField, copyToClipboard }: OidcEditTabsProps) {
  const { t } = useI18n();

  const sectionProps = {
    form: vm.form,
    updateField: vm.updateField,
    clientTypeOptions: vm.clientTypeOptions,
    isCreateMode: false,
    standardScopes: vm.standardScopes,
    standardGrantTypes: vm.standardGrantTypes,
    addRedirectUri: vm.addRedirectUri,
    removeRedirectUri: vm.removeRedirectUri,
    updateRedirectUri: vm.updateRedirectUri,
    addPostLogoutUri: vm.addPostLogoutUri,
    removePostLogoutUri: vm.removePostLogoutUri,
    updatePostLogoutUri: vm.updatePostLogoutUri,
  };

  return (
    <Tabs defaultValue="credentials" className="w-full space-y-6">
      <TabsList className="grid w-full grid-cols-4 border bg-muted/40 p-1 md:inline-flex md:w-auto md:grid-cols-none">
        <TabsTrigger value="credentials" className="gap-1.5 text-xs font-semibold">
          <KeyRound className="h-3.5 w-3.5" />
          {t("oauthApps.credentialsSection") || "Credentials"}
        </TabsTrigger>
        <TabsTrigger value="redirects" className="gap-1.5 text-xs font-semibold">
          <Link2 className="h-3.5 w-3.5" />
          {t("oauthApps.endpointsSection") || "Redirects & Security"}
        </TabsTrigger>
        <TabsTrigger value="scopes" className="gap-1.5 text-xs font-semibold">
          <Tag className="h-3.5 w-3.5" />
          {t("oauthApps.scopesGrantsSection") || "Scopes & Grants"}
        </TabsTrigger>
        <TabsTrigger value="branding" className="gap-1.5 text-xs font-semibold">
          <Palette className="h-3.5 w-3.5" />
          {t("oauthApps.brandingSection") || "Branding"}
        </TabsTrigger>
      </TabsList>

      {/* Tab 1: Connection & Credentials */}
      <TabsContent
        value="credentials"
        className="space-y-6 outline-none duration-200 animate-in fade-in"
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <GeneralSection {...sectionProps} />
            <TokenConfigSection {...sectionProps} />
          </div>

          <div className="space-y-6 lg:col-span-1">
            {vm.app && (
              <>
                <ClientCredentialsCard
                  clientId={vm.app.clientId}
                  clientType={vm.app.clientType}
                  copiedField={copiedField}
                  copyToClipboard={copyToClipboard}
                  isRegenerating={vm.isRegenerating}
                  onRegenerate={vm.regenerateSecret}
                />

                <OAuthAppMetadataCard
                  createdAt={vm.app.createdAt}
                  modifiedAt={vm.app.modifiedAt}
                  tenantId={vm.app.tenantId}
                />
              </>
            )}
          </div>
        </div>
      </TabsContent>

      {/* Tab 2: Redirects & Security */}
      <TabsContent
        value="redirects"
        className="space-y-6 outline-none duration-200 animate-in fade-in"
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <EndpointsSection {...sectionProps} />
          </div>
          <div className="space-y-6 lg:col-span-1">
            <SecuritySection {...sectionProps} />
            <DangerZoneCard isDeleting={vm.isDeleting} onDelete={vm.deleteApp} />
          </div>
        </div>
      </TabsContent>

      {/* Tab 3: Scopes & Grant Types */}
      <TabsContent
        value="scopes"
        className="max-w-3xl outline-none duration-200 animate-in fade-in"
      >
        <ScopesGrantsSection {...sectionProps} />
      </TabsContent>

      {/* Tab 4: Branding */}
      <TabsContent
        value="branding"
        className="max-w-2xl space-y-6 outline-none duration-200 animate-in fade-in"
      >
        <BrandingSection {...sectionProps} />
      </TabsContent>
    </Tabs>
  );
}

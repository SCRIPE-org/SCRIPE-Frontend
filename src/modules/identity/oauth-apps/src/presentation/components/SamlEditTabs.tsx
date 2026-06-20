"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { KeyRound, Info, Palette } from "lucide-react";
import { GeneralSection } from "./GeneralSection";
import { SamlSection } from "./SamlSection";
import { BrandingSection } from "./BrandingSection";
import { IdpMetadataSection } from "./IdpMetadataSection";
import { OAuthAppMetadataCard } from "./OAuthAppMetadataCard";
import { DangerZoneCard } from "./DangerZoneCard";

import { OAuthAppFormState } from "../viewmodels/useOAuthAppDetailViewModel";

interface SamlEditTabsProps {
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
    isDeleting: boolean;
    deleteApp: () => void;
  };
}

export function SamlEditTabs({ vm }: SamlEditTabsProps) {
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
    <Tabs defaultValue="saml_config" className="w-full space-y-6">
      <TabsList className="grid w-full grid-cols-3 border bg-muted/40 p-1 md:inline-flex md:w-auto md:grid-cols-none">
        <TabsTrigger value="saml_config" className="gap-1.5 text-xs font-semibold">
          <KeyRound className="h-3.5 w-3.5" />
          {t("oauthApps.samlConfigSection") || "SAML Configuration"}
        </TabsTrigger>
        <TabsTrigger value="idp_metadata" className="gap-1.5 text-xs font-semibold">
          <Info className="h-3.5 w-3.5" />
          {t("oauthApps.idpMetadataSection") || "IdP Metadata"}
        </TabsTrigger>
        <TabsTrigger value="branding" className="gap-1.5 text-xs font-semibold">
          <Palette className="h-3.5 w-3.5" />
          {t("oauthApps.brandingSection") || "Branding"}
        </TabsTrigger>
      </TabsList>

      {/* SAML Settings tab */}
      <TabsContent value="saml_config" className="space-y-6 outline-none animate-in fade-in duration-200">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <GeneralSection {...sectionProps} />
            <SamlSection {...sectionProps} />
          </div>
          <div className="space-y-6 lg:col-span-1">
            {vm.app && (
              <OAuthAppMetadataCard
                createdAt={vm.app.createdAt}
                modifiedAt={vm.app.modifiedAt}
                tenantId={vm.app.tenantId}
              />
            )}
            <DangerZoneCard isDeleting={vm.isDeleting} onDelete={vm.deleteApp} />
          </div>
        </div>
      </TabsContent>

      {/* SAML metadata tab */}
      <TabsContent value="idp_metadata" className="outline-none max-w-3xl animate-in fade-in duration-200">
        <IdpMetadataSection />
      </TabsContent>

      {/* SAML branding tab */}
      <TabsContent value="branding" className="space-y-6 outline-none max-w-2xl animate-in fade-in duration-200">
        <BrandingSection {...sectionProps} />
      </TabsContent>
    </Tabs>
  );
}

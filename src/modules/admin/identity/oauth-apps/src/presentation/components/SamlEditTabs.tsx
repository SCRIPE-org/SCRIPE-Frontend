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

/**
 * Presentation UI component rendering the saml edit tabs.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
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
      <TabsList
        variant="pill"
        className="grid w-full grid-cols-3 md:inline-flex md:w-auto md:grid-cols-none"
      >
        <TabsTrigger value="saml_config" className="gap-1.5 text-xs font-semibold">
          <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
          {t("oauthApps.samlConfigSection")}
        </TabsTrigger>
        <TabsTrigger value="idp_metadata" className="gap-1.5 text-xs font-semibold">
          <Info className="h-3.5 w-3.5" aria-hidden="true" />
          {t("oauthApps.idpMetadataSection")}
        </TabsTrigger>
        <TabsTrigger value="branding" className="gap-1.5 text-xs font-semibold">
          <Palette className="h-3.5 w-3.5" aria-hidden="true" />
          {t("oauthApps.brandingSection")}
        </TabsTrigger>
      </TabsList>

      {/* SAML Settings tab */}
      <TabsContent
        value="saml_config"
        className="space-y-6 outline-none duration-nx-standard animate-in fade-in"
      >
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
      <TabsContent
        value="idp_metadata"
        className="max-w-3xl outline-none duration-nx-standard animate-in fade-in"
      >
        <IdpMetadataSection />
      </TabsContent>

      {/* SAML branding tab */}
      <TabsContent
        value="branding"
        className="max-w-2xl space-y-6 outline-none duration-nx-standard animate-in fade-in"
      >
        <BrandingSection {...sectionProps} />
      </TabsContent>
    </Tabs>
  );
}

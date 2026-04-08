/**
 * Docs Locale Registry — FR
 * Eagerly merges all French docs translations (tech + commercial).
 */
import { fr as common } from "../pages/common.fr";
import { fr as getStarted } from "../pages/get-started.fr";
import { fr as architecture } from "../pages/architecture.fr";
import { fr as features } from "../pages/features.fr";
import { fr as modules } from "../pages/modules.fr";
import { fr as security } from "../pages/security.fr";
import { fr as frontend } from "../pages/frontend.fr";
import { fr as infrastructure } from "../pages/infrastructure.fr";
import { fr as tutorials } from "../pages/tutorials.fr";
import { fr as apiReference } from "../pages/api-reference.fr";

import { fr as commWhyNexora } from "../comm-pages/why-nexora.fr";
import { fr as commPlatform } from "../comm-pages/platform.fr";
import { fr as commEnterprise } from "../comm-pages/enterprise.fr";
import { fr as commSecurity } from "../comm-pages/security.fr";
import { fr as commTechnical } from "../comm-pages/technical.fr";
import { fr as commDeveloper } from "../comm-pages/developer.fr";
import { fr as commIntegration } from "../comm-pages/integration.fr";
import { fr as commPricing } from "../comm-pages/pricing.fr";
import { fr as commModules } from "../comm-pages/modules.fr";
import { fr as commEntitlements } from "../comm-pages/entitlements.fr";
import { fr as commCustomization } from "../comm-pages/customization.fr";

import { mergeAll } from "./utils";

export const allDocsFr: Record<string, any> = mergeAll(
  common, getStarted, architecture, features, modules,
  security, frontend, infrastructure, tutorials, apiReference,
  commWhyNexora, commPlatform, commEnterprise, commSecurity,
  commTechnical, commDeveloper, commIntegration, commPricing,
  commModules, commEntitlements, commCustomization,
);

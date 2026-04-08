/**
 * Docs Locale Registry — ZH
 * Eagerly merges all Chinese docs translations (tech + commercial).
 */
import { zh as common } from "../pages/common.zh";
import { zh as getStarted } from "../pages/get-started.zh";
import { zh as architecture } from "../pages/architecture.zh";
import { zh as features } from "../pages/features.zh";
import { zh as modules } from "../pages/modules.zh";
import { zh as security } from "../pages/security.zh";
import { zh as frontend } from "../pages/frontend.zh";
import { zh as infrastructure } from "../pages/infrastructure.zh";
import { zh as tutorials } from "../pages/tutorials.zh";
import { zh as apiReference } from "../pages/api-reference.zh";

import { zh as commWhyNexora } from "../comm-pages/why-nexora.zh";
import { zh as commPlatform } from "../comm-pages/platform.zh";
import { zh as commEnterprise } from "../comm-pages/enterprise.zh";
import { zh as commSecurity } from "../comm-pages/security.zh";
import { zh as commTechnical } from "../comm-pages/technical.zh";
import { zh as commDeveloper } from "../comm-pages/developer.zh";
import { zh as commIntegration } from "../comm-pages/integration.zh";
import { zh as commPricing } from "../comm-pages/pricing.zh";
import { zh as commModules } from "../comm-pages/modules.zh";
import { zh as commEntitlements } from "../comm-pages/entitlements.zh";
import { zh as commCustomization } from "../comm-pages/customization.zh";

import { mergeAll } from "./utils";

export const allDocsZh: Record<string, any> = mergeAll(
  common, getStarted, architecture, features, modules,
  security, frontend, infrastructure, tutorials, apiReference,
  commWhyNexora, commPlatform, commEnterprise, commSecurity,
  commTechnical, commDeveloper, commIntegration, commPricing,
  commModules, commEntitlements, commCustomization,
);

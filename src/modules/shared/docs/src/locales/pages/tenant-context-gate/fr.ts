// FILE-EXCEPTION: file length
/**
 * Docs page locale — FR
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const fr = {
  "features": {
    "tenantContextGate": {
      "title": "Tenant Context Gate",
      "description": "RequiresTenantContext flag, multi-layer menu visibility defense, drill-down behavior, and impersonation scoping for tenant-only pages.",
      "intro": "The Tenant Context Gate is a security mechanism that prevents system admins from accidentally (or intentionally) accessing tenant-scoped pages when they have no active tenant context. Pages like Tenant Plans, User Subscriptions, and the Customizer Studio only make sense within a specific tenant's context – showing them to a system admin with no tenant would either show incorrect data or expose cross-tenant information.",
      "problemTitle": "The Problem",
      "problemIntro": "System super-admins have a bypass flag (IsSystemProtectedAdmin) that normally grants them access to all pages. Without a gate, a super-admin with no tenant context could navigate to /tenant-plans and see data from all tenants, or crash the page because no TenantId is available.",
      "solutionTitle": "The Solution: RequiresTenantContext",
      "solutionIntro": "We introduced the RequiresTenantContext boolean flag in the DocNavigationItem schema. When this flag is set to true, the frontend actively checks if the current user has a valid tenantId. If they do not, the item is completely stripped from the navigation menu and the route redirects to the overview page.",
      "layersTitle": "Defense In Depth",
      "layersIntro": "The gate operates at three levels:",
      "layer1": "1. Menu Visibility: The navigation builder strips the item from the sidebar if no tenant context is present.",
      "layer2": "2. Route Protection: The page component uses useAppStore to verify the tenant context before attempting to fetch data.",
      "layer3": "3. Backend Gate: The API endpoints themselves throw 403 Forbidden if a system admin attempts to fetch tenant-scoped data without an explicit drill-down tenant ID header.",
      "drillDownTitle": "Drill-Down and Impersonation",
      "drillDownIntro": "System admins can still access these pages, but only through explicit context-switching mechanisms:",
      "drill1": "Enter Tenant World (Drill-Down): The admin clicks \"Enter Tenant World\" on a tenant record. This sets the tenantId in the global state and adds it to the X-Tenant-Id header for all subsequent API requests. The gate now opens, and the admin sees exactly what the tenant sees.",
      "drill2": "User Impersonation: The admin impersonates a specific tenant user. This swaps the JWT entirely, providing a perfect replica of the user's experience, including all tenant-scoped pages.",
      "layer1Title": "Niveau 1: Filtre de Visibilité du Menu Frontend",
      "layer1Intro": "Le pipeline de menu vérifie l'attribut RequiresTenantContext. Si l'utilisateur n'a pas de locataire actif, le lien est totalement purgé de l'arbre de navigation.",
      "layer2Title": "Niveau 2: Gardiens de Routage Côté Client",
      "layer2Intro": "Le middleware Next.js et les wrappers de pages vérifient l'existence d'un contexte actif. Tout accès non autorisé redirige vers le tableau de bord.",
      "layer3Title": "Niveau 3: Pare-feu Contrôleurs et Middleware Backend",
      "layer3Intro": "Les contrôleurs et gestionnaires CQRS valident le contexte de manière indépendante, rejetant les requêtes non qualifiées avec un code 401 ou 403.",
      "drillDownNote": "L'accès en immersion est réservé aux administrateurs dotés de la permission 'tenants.drill_down', avec traçabilité complète dans les journaux d'audit.",
      "impersonationTitle": "Cloisonnement de l'Usurpation d'Identité",
      "impersonationIntro": "Lors d'une usurpation de compte, le pipeline de sécurité génère un jeton de session strictement circonscrit au périmètre du locataire cible.",
      "flaggedPagesTitle": "Pages Réservées aux Locataires Actifs",
      "flaggedPagesIntro": "Les pages administratives suivantes imposent rigoureusement le filtrage de contexte locataire:",
      "flaggedPage1": "Plans d'Abonnement et Paramètres de Facturation Locataire",
      "flaggedPage2": "Abonnements Utilisateurs et Droits Individuels",
      "flaggedPage3": "Studio de Personnalisation Graphique et de Marque",
      "flaggedPage4": "Configuration Système et Domaines Personnalisés",
      "flaggedPage5": "Modèles de Messages et Notifications Locataire",
      "flaggedPage6": "Corbeille de l'Écosystème et Restauration",
      "addingTitle": "Sécurisation de Nouvelles Pages",
      "addingIntro": "Définissez RequiresTenantContext: true sur l'élément de menu pour verrouiller automatiquement l'accès aux seuls utilisateurs rattachés.",
      "addingTip": "Veillez à injecter le middleware TenantContextBehavior dans vos pipelines CQRS backend pour bloquer les appels d'API directs non qualifiés.",
      "seederTitle": "Initialisation et Semence des Drapeaux",
      "seederIntro": "Le composant d'initialisation de base de données applique automatiquement ces restrictions de sécurité lors de la première installation."
    }
  }
};

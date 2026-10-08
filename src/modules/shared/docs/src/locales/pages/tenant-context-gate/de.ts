// FILE-EXCEPTION: file length
/**
 * Docs page locale — DE
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const de = {
  features: {
    tenantContextGate: {
      title: "Tenant Context Gate",
      description:
        "RequiresTenantContext flag, multi-layer menu visibility defense, drill-down behavior, and impersonation scoping for tenant-only pages.",
      intro:
        "The Tenant Context Gate is a security mechanism that prevents system admins from accidentally (or intentionally) accessing tenant-scoped pages when they have no active tenant context. Pages like Tenant Plans, User Subscriptions, and the Customizer Studio only make sense within a specific tenant's context – showing them to a system admin with no tenant would either show incorrect data or expose cross-tenant information.",
      problemTitle: "The Problem",
      problemIntro:
        "System super-admins have a bypass flag (IsSystemProtectedAdmin) that normally grants them access to all pages. Without a gate, a super-admin with no tenant context could navigate to /tenant-plans and see data from all tenants, or crash the page because no TenantId is available.",
      solutionTitle: "The Solution: RequiresTenantContext",
      solutionIntro:
        "We introduced the RequiresTenantContext boolean flag in the DocNavigationItem schema. When this flag is set to true, the frontend actively checks if the current user has a valid tenantId. If they do not, the item is completely stripped from the navigation menu and the route redirects to the overview page.",
      layersTitle: "Defense In Depth",
      layersIntro: "The gate operates at three levels:",
      layer1:
        "1. Menu Visibility: The navigation builder strips the item from the sidebar if no tenant context is present.",
      layer2:
        "2. Route Protection: The page component uses useAppStore to verify the tenant context before attempting to fetch data.",
      layer3:
        "3. Backend Gate: The API endpoints themselves throw 403 Forbidden if a system admin attempts to fetch tenant-scoped data without an explicit drill-down tenant ID header.",
      drillDownTitle: "Drill-Down and Impersonation",
      drillDownIntro:
        "System admins can still access these pages, but only through explicit context-switching mechanisms:",
      drill1:
        'Enter Tenant World (Drill-Down): The admin clicks "Enter Tenant World" on a tenant record. This sets the tenantId in the global state and adds it to the X-Tenant-Id header for all subsequent API requests. The gate now opens, and the admin sees exactly what the tenant sees.',
      drill2:
        "User Impersonation: The admin impersonates a specific tenant user. This swaps the JWT entirely, providing a perfect replica of the user's experience, including all tenant-scoped pages.",
      layer1Title: "Schicht 1: Frontend-Menü-Sicherheitsfilter",
      layer1Intro:
        "Die Menügenerierung prüft das Flag RequiresTenantContext jedes Eintrags. Besitzt der Benutzer keinen aktiven Mandantenkontext, wird der Knoten vor der Auslieferung an den Client vollständig entfernt.",
      layer2Title: "Schicht 2: Clientseitige Routen-Wächter (Route Guards)",
      layer2Intro:
        "Next.js-Middleware und Seiten-Wrapper prüfen den Store auf einen aktiven Mandantenkontext. Unberechtigte Aufrufe leiten automatisch auf die Workspace-Übersicht um.",
      layer3Title: "Schicht 3: Backend-Controller & Middleware-Firewall",
      layer3Intro:
        "Controller und CQRS-Handler validieren den Mandantenkontext unabhängig und verwerfen Anfragen ohne gültigen Kontext mit 401 oder 403.",
      drillDownNote:
        "Drill-Down-Zugriffe sind Systemadministratoren mit der Berechtigung 'tenants.drill_down' vorbehalten und werden manipulationssicher protokolliert.",
      impersonationTitle: "Mandantengebundenes Benutzer-Impersonating",
      impersonationIntro:
        "Beim Identitätswechsel ersetzt die Sicherheits-Pipeline den Principal durch ein mandantenspezifisches Sitzungstoken mit exakten Rechtestufen.",
      flaggedPagesTitle: "Geschützte Mandanten-Seiten",
      flaggedPagesIntro:
        "Die folgenden Verwaltungsseiten erzwingen strikt das Tenant Context Gate:",
      flaggedPage1: "Mandanten-Abonnementpläne & Abrechnungskonfiguration",
      flaggedPage2: "Benutzer-Abonnements & Einzelberechtigungen",
      flaggedPage3: "Customizer-Studio für Theme- und Markenkonfiguration",
      flaggedPage4: "Mandanten-Systemkonfiguration & benutzerdefinierte Domänen",
      flaggedPage5: "Mandantenspezifische Nachrichtenvorlagen",
      flaggedPage6: "Ökosystem-Papierkorb & Wiederherstellungsdaten",
      addingTitle: "Hinzufügen neuer geschützter Seiten",
      addingIntro:
        "Setzen Sie RequiresTenantContext: true in der Navigationskonfiguration, um neue mandantenspezifische Routen abzusichern.",
      addingTip:
        "Aktivieren Sie im Backend stets das TenantContextBehavior in der CQRS-Pipeline, um API-Aufrufe ohne Mandantenkontext zu blockieren.",
      seederTitle: "Initiales Seeding der Sicherheitsflags",
      seederIntro:
        "Der Datenbank-Seeder konfiguriert die Sicherheitsattribute standardmäßig für alle geschützten Menüpunkte beim ersten Systemstart.",
    },
  },
};

export const de = {
  modules: {
    revenueAnalytics: {
      "title": "Revenue-Analytics-Engine",
      "description": "BI-Grade Umsatzintelligenz mit 7-Tab-Dashboard, Echtzeit-KPIs, Kohortenanalyse, LTV-Modellierung, Umsatzprognose, Tenant-Gesundheitsbewertung und automatisierter PDF-Berichtslieferung.",
      "intro": "Die Revenue-Analytics-Engine bietet umfassende Finanzintelligenz für Ihre SaaS-Plattform. Sie aggregiert Abonnementdaten aller Tenants zu umsetzbaren KPIs, Trendvisualisierungen und Vorhersagemodellen. Nächtliche Hintergrundaufgaben erfassen alle Metriken, berechnen Tenant-Gesundheitsbewertungen und erstellen geplante Berichte — eine vollständige BI-Grade-Analysesuite ohne externe Tools.",
      "kpiTitle": "KPI-Übersicht",
      "kpiIntro": "Acht Kern-KPIs werden in Echtzeit aus Abonnement- und Zahlungsdaten berechnet. Jeder KPI unterstützt Datumsbereichsfilterung, Periodenvergleich und Detailanalyse nach Edition oder Tenant.",
      "tabsTitle": "7-Tab-Dashboard",
      "tabsIntro": "Das Analytics-Dashboard ist in 7 lazy-geladene Tabs organisiert, die sich jeweils auf eine bestimmte analytische Dimension konzentrieren. Tabs werden über React.lazy mit Suspense-Fallbacks für optimales Bundle-Splitting gerendert.",
      "snapshotTitle": "AnalyticsSnapshot-Entität",
      "snapshotIntro": "Die AnalyticsSnapshot-Entität speichert tägliche Metrik-Snapshots. Jede Nacht erstellt der AnalyticsSnapshotJob eine aggregierte Zeile (TenantId = null) und eine Zeile pro aktivem Tenant. Dies ermöglicht historische Trendanalysen ohne Abfragen der Live-Abonnementtabellen.",
      "healthTitle": "Tenant-Gesundheitsbewertung",
      "healthIntro": "Der TenantHealthScoreJob berechnet einen zusammengesetzten Gesundheitswert (0–100) für jeden aktiven Tenant mit einer gewichteten Formel, die Zahlungszuverlässigkeit, Plattformaktivität und Abonnementwachstumssignale kombiniert.",
      "jobsTitle": "Hintergrundaufgaben-Pipeline",
      "jobsIntro": "Drei Hintergrundaufgaben werden jede Nacht in strenger Reihenfolge ausgeführt. Sie sind vollständig anbieterunabhängig — konfigurierbar für Native, Hangfire oder Quartz über appsettings.json. Jede Aufgabe implementiert IAutoRegisteredJob für einheitliches Management.",
      "jobsConfig": "Alle drei Aufgaben sind über appsettings.json unter BackgroundJobs:Jobs konfigurierbar. Sie können den CRON-Zeitplan überschreiben, einzelne Aufgaben aktivieren/deaktivieren oder Anbieter (Native/Hangfire/Quartz) ohne Codeänderungen wechseln.",
      "endpointsTitle": "API-Endpunkte",
      "endpointsIntro": "Der AnalyticsController stellt 12 Endpunkte unter /api/v1/analytics bereit. Alle Endpunkte erfordern die SuperAdmin-Rolle und die entsprechende Analytics-Berechtigung.",
      "exportTitle": "Exportsystem",
      "exportIntro": "Analysedaten können in drei Formaten exportiert werden. Jeder Export enthält die aktuelle KPI-Zusammenfassung, MRR-Trends und Abonnementaufschlüsselung. PDF-Exporte enthalten gebrandete Header und Diagramme.",
      "scheduledTitle": "Geplante Berichte",
      "scheduledIntro": "Administratoren können die automatisierte Berichtslieferung konfigurieren. Berichte werden vom AnalyticsReportJob um 6:00 UTC generiert und im gewählten Format per E-Mail an die konfigurierten Empfänger gesendet.",
      "permissionsTitle": "Berechtigungen",
      "permissionsIntro": "Revenue Analytics verwendet vier granulare Berechtigungen, die über das Standard-RBAC-System Rollen zugewiesen werden können.",
      "ep": {
        "summary": "Analytics-Zusammenfassung abrufen (KPI-Karten + Periodenvergleich)",
        "mrr": "MRR-Wasserfall-Bewegungen abrufen (Neu/Erweiterung/Kontraktion/Abwanderung/Reaktivierung)",
        "cohort": "Kohortenretentions-Heatmap-Daten nach monatlichen Kohorten abrufen",
        "ltv": "Lebenszeitwert-Aufschlüsselung nach Editionsstufe abrufen",
        "forecast": "6-Monats-Umsatzprognose mit linearer Regression + Vertrauensbändern abrufen",
        "health": "Tenant-Gesundheitsbewertungen mit Risikoklassifizierung abrufen",
        "snapshots": "Historische tägliche Snapshots für Trenddiagramme abrufen",
        "export": "Analysedaten im angegebenen Format exportieren (csv/excel/pdf)",
        "reportList": "Alle geplanten Berichte auflisten",
        "reportCreate": "Neue geplante Berichtskonfiguration erstellen",
        "reportUpdate": "Geplante Berichtseinstellungen aktualisieren",
        "reportDelete": "Geplanten Bericht löschen"
      }
    }
  }
};

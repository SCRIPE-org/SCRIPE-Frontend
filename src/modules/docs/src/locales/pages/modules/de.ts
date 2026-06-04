/**
 * Docs page locale — DE
 */
export const de = {
  modules: {
    compliance: {
      consent: {
        conn1: "Vorlagen",
        conn2: "generiert bei Änderung",
        conn3: "automatischer Widerruf bei Ablauf",
        descJob: "Täglicher Job widerruft abgelaufene Einwilligungen",
        descPurpose: "Definiert, worin eingewilligt wird (z. B. Marketing)",
        descRecord: "Aktueller Status des Benutzers (Erteilt/Widerrufen) pro Zweck",
        description:
          "Einwilligungen aufzeichnen, verfolgen und prüfen für GDPR-Artikel 6 und CCPA.",
        descSnapshot: "Unveränderliche Momentaufnahme der Erteilung/Widerrufung",
        endpointsTitle: "API Endpoints",
        ep: {
          get: "Einwilligungsdatensatz nach ID abrufen",
          list: "Alle Einwilligungsdatensätze auflisten",
          record: "Neue Einwilligungserteilung aufzeichnen",
          withdraw: "Eine zuvor erteilte Einwilligung widerrufen",
        },
        flowTitle: "Einwilligungs-Status-Flow",
        gdprIntro:
          "Gemäß Artikel 6 DSGVO muss die Einwilligung freiwillig, spezifisch, informiert und unmissverständlich sein. SCRIPE speichert den exakten Text.",
        gdprTitle: "GDPR Rechtsgrundlage",
        immutabilityIntro: "Einwilligungsdatensätze sind unveränderlich.",
        immutabilityTitle: "Unveränderlichkeit",
        intro:
          "Das Einwilligungsmanagement protokolliert jedes Mal, wenn ein Benutzer eine Einwilligung erteilt oder widerruft. SCRIPE speichert den vollständigen Audit-Trail.",
        nodeJob: "Ablauf-Job für Einwilligung",
        nodePurpose: "Zweck der Einwilligung",
        nodeRecord: "Einwilligungsdatensatz",
        nodeSnapshot: "Einwilligungs-Snapshot",
        purpose1: "Marketing — E-Mail-Marketing und werbliche Kommunikation.",
        purpose2: "Analyse — Nutzungsanalysen und Produktverbesserungen.",
        purpose3: "Drittanbieter — Datenfreigabe an Drittanbieter-Dienste.",
        purpose4: "Personalisierung — Personalisierte Inhalte und Empfehlungen.",
        purposesIntro: "Jeder Einwilligungsdatensatz ist an einen bestimmten Zweck gebunden:",
        purposesTitle: "Zwecke der Einwilligung",
        title: "Einwilligungsmanagement",
        withdrawalIntro:
          "Benutzer können ihre Einwilligung jederzeit widerrufen. ConsentRecord wird mit WithdrawnAt aktualisiert.",
        withdrawalTitle: "Widerruf der Einwilligung",
      },
      dsr: {
        codeTitle: "Code-Beispiel",
        conn1: "initiiert",
        conn2: "Hintergrundjob übernimmt",
        conn3: "wenn automatisch verarbeitet (Export)",
        conn4: "wenn nuklear (Löschung)",
        conn5: "Admin bestätigt",
        conn6: "Admin lehnt ab",
        descApproval: "Nukleare Aktionen (Löschung) erfordern manuelle Admin-Bestätigung",
        descCompleted: "Export generiert oder Daten gelöscht; SLA erfüllt",
        descPending: "Anfrage wird protokolliert, SLA-Frist berechnet",
        descProcessing: "DsrExecutionJob beginnt mit der Verarbeitung der Module",
        descRejected: "Anfrage vom Admin mit Lösungsnotizen abgelehnt",
        description:
          "GDPR/CCPA-Rechteanfragen verwalten — Export, Löschung, Berichtigung und Einschränkung.",
        descSubmit: "Betroffener beantragt Export, Löschung oder Berichtigung",
        endpointsIntro: "Der DSR-Controller stellt 6 Endpoints zur Verfügung:",
        endpointsTitle: "API Endpoints",
        entitiesTitle: "Entitäten",
        entityDesc: "Beschreibung",
        entityDsrDesc: "Stellt eine Betroffenenanfrage dar.",
        entityModuleDesc: "Ausführungsstatus eines Moduls.",
        entityName: "Entitätsname",
        entityStatusDesc: "Verlauf der Statusänderungen.",
        ep: {
          assign: "DSR einem Compliance-Beauftragten zuweisen",
          create: "Eine neue DSR einreichen",
          delete: "Soft-Delete einer DSR",
          get: "DSR-Details nach ID abrufen",
          list: "Alle DSRs auflisten (paginiert, filterbar)",
          updateStatus: "DSR-Status aktualisieren",
        },
        intro:
          "Betroffenenanfragen (DSRs) sind formelle Anfragen von Einzelpersonen zur Ausübung ihrer Rechte. Das Modul bietet einen vollständigen DSR-Workflow.",
        lifecycleFlowTitle: "DSR-Lebenszyklus-Flow",
        lifecycleIntro: "DSRs durchlaufen eine definierte Reihe von Statuswerten:",
        lifecycleTitle: "Anfrage-Lebenszyklus",
        nodeApproval: "Auf Admin warten",
        nodeCompleted: "Status: Abgeschlossen",
        nodePending: "Status: Ausstehend",
        nodeProcessing: "Status: In Bearbeitung",
        nodeRejected: "Status: Abgelehnt",
        nodeSubmit: "Anfrage einreichen",
        slasIntro:
          "Gemäß Artikel 12 DSGVO müssen Verantwortliche innerhalb von 30 Tagen auf DSRs reagieren (auf 3 Monate verlängerbar). SCRIPE verfolgt dies.",
        slasTitle: "GDPR SLA-Anforderungen",
        status1: "Ausstehend (Pending) — Anfänglicher Zustand bei Erhalt.",
        status2: "In Bearbeitung (InProgress) — Ein Compliance-Beauftragter wurde zugewiesen.",
        status3: "Abgeschlossen (Completed) — Die Anfrage wurde erfüllt.",
        status4:
          "Abgelehnt (Rejected) — Die Anfrage wurde abgelehnt (z. B. unzureichende Identitätsprüfung).",
        title: "Betroffenenanfragen (DSR)",
        type1: "Export — Recht auf Datenübertragbarkeit. Die betroffene Person wünscht eine Kopie.",
        type2:
          "Löschung — Recht auf Vergessenwerden. Alle personenbezogenen Daten müssen gelöscht oder anonymisiert werden.",
        type3: "Berichtigung — Korrekturanfrage. Ungenaue Daten müssen aktualisiert werden.",
        type4:
          "Einschränkung — Verarbeitungsbeschränkung. Daten können gespeichert, aber nicht aktiv verarbeitet werden.",
        typesIntro: "Das System unterstützt vier DSR-Typen gemäß DSGVO-Artikel 17 und CCPA:",
        typesTitle: "Anfragetypen",
      },
      inventory: {
        description:
          "Ein Register aller verarbeiteten personenbezogenen Datenkategorien — erforderlich für GDPR Artikel 30 (RoPA).",
        endpointsTitle: "API Endpoints",
        ep: {
          create: "Eine neue Datenkategorie zum Inventar hinzufügen",
          delete: "Ein Element aus dem Inventar entfernen",
          get: "Element nach ID abrufen",
          list: "Alle Dateninventarelemente auflisten (paginiert)",
          update: "Ein bestehendes Inventarelement aktualisieren",
        },
        field1: "DataCategory — Lesbarer Name der Kategorie (z. B. 'E-Mail-Adressen').",
        field2:
          "LegalBasis — DSGVO-Rechtsgrundlage für die Verarbeitung (Einwilligung, Vertrag usw.).",
        field3: "DataSubjects — Wem die Daten gehören (z. B. 'Endbenutzer').",
        field4: "ProcessingPurpose — Warum die Daten verarbeitet werden (z. B. 'Marketing').",
        field5: "StorageLocation — Wo die Daten gespeichert sind (Land/Region).",
        field6: "RetentionPeriod — Wie lange die Daten aufbewahrt werden.",
        field7: "ThirdPartySharing — Ob Daten mit Dritten geteilt werden.",
        fieldsIntro: "Jedes Element dokumentiert:",
        fieldsTitle: "Inventarfelder",
        intro:
          "Das Dateninventar ist ein strukturiertes Register. Gemäß Artikel 30 DSGVO müssen Verantwortliche ein Verzeichnis von Verarbeitungstätigkeiten (RoPA) führen.",
        ropaIntro:
          "Organisationen mit 250+ Mitarbeitern müssen ein RoPA führen. Das Inventar von SCRIPE dient als abfragbares RoPA für Inspektionen.",
        ropaTitle: "Artikel 30 Compliance",
        title: "Dateninventar",
      },
      overview: {
        backendIntro:
          "Folgt dem SCRIPE-Standardlayout für 3-Projekt-Module (Domain / Application / Infrastructure) mit ComplianceDbContext.",
        backendTitle: "Backend-Architektur",
        conn1: "initiiert Anfragen",
        conn2: "gewährt/widerruft",
        conn3: "steuert Richtlinien",
        conn4: "leitet Löschung an",
        conn5: "zielt auf Daten",
        conn6: "Audit-Trails",
        conn7: "Audit-Trails",
        descConsent: "Unveränderliche Verfolgung von Einwilligungsstatus und Snapshots",
        descDsr: "Verarbeitet Betroffenenanfragen (Export, Löschung, Berichtigung)",
        descEnt: "Berechtigungsmodul",
        descEntDesc: "Steuert Compliance-Funktionen über Feature-Gates",
        descId: "Identitätsmodul",
        descIdDesc: "Bietet Benutzer-/Admin-Kontext und Authentifizierung",
        descInv: "Ordnet sensible PII-Standorte modulübergreदाताओं zu",
        descRep: "Generiert RoPA- und DPIA-Compliance-Berichte",
        descRet: "Setzt Datenlöschrichtlinien basierend auf dem Alter durch",
        description:
          "GDPR, CCPA und PDPA Compliance-Automatisierung — Richtlinien, DSR-Verarbeitung, Einwilligungsmanagement, Datenaufbewahrung, Inventar und Berichtserstellung.",
        endpointsIntro:
          "Alle Endpoints befinden sich unter /api/v1/compliances/ und erfordern eine Authentifizierung mit compliance.view.",
        endpointsTitle: "API Endpoints Übersicht",
        frontendIntro:
          "Organisiert in sechs unabhängigen Submodulen unter src/modules/compliance/, die dem View/ViewModel-Muster folgen.",
        frontendTitle: "Frontend-Architektur",
        infoContent:
          "Das Modul ist entscheidend für die Einhaltung gesetzlicher Vorschriften und die Vermeidung von Strafen. Stellen Sie sicher, dass alle Funktionen korrekt den Datenverarbeitungsrichtlinien zugeordnet sind.",
        infoTitle: "Compliance-Hinweis",
        intro:
          "Das Compliance-Modul ist die integrierte Regulierungs-Engine von SCRIPE. Es hilft Betreibern und deren Mandanten, Datenschutzgesetze (GDPR, CCPA, PDPA) durch automatisierte Werkzeuge einzuhalten.",
        sub1: "Regulierungsprofile — Speichert die rechtlichen Rahmenbedingungen (GDPR, CCPA, PDPA).",
        sub2: "Betroffenenanfragen (DSR) — Verwaltet Anfragen zu Rechten der Betroffenen (Export, Löschung, Berichtigung, Einschränkung).",
        sub3: "Einwilligungsmanagement — Protokolliert, verfolgt und prüft die Erteilung und den Widerruf von Benutzereinwilligungen.",
        sub4: "Datenaufbewahrungsrichtlinien — Definiert, wie lange Daten aufbewahrt werden und was bei Ablauf geschieht (Löschen oder Anonymisieren).",
        sub5: "Dateninventar — Ein Register aller personenbezogenen Datenkategorien, die die Plattform verarbeitet.",
        sub6: "Compliance-Berichte — Generiert asynchrone, revisionssichere Berichte (GDPR-Übersicht, DSR-Zusammenfassung usw.).",
        subModulesIntro: "Jedes Subsystem behandelt eine bestimmte Compliance-Domäne:",
        subModulesTitle: "Sechs Subsysteme",
        th1: "Komponente",
        th2: "Verantwortung",
        title: "Compliance-Modul",
        tr1_1: "DsrListViewModel",
        tr1_2:
          "Behandelt Paginierung, Filterung und Zuweisung von eingehenden Betroffenenanfragen.",
        tr2_1: "ConsentRecordView",
        tr2_2: "Rendert den unveränderlichen Einwilligungs-Snapshot zusammen mit Metadaten.",
        whatIsIntro:
          "Das Modul bietet sechs miteinander verbundene Subsysteme, die den gesamten Compliance-Lebenszyklus abdecken. Mandanten erhalten ein produktionsbereites System.",
        whatIsTitle: "Was ist das Compliance-Modul?",
      },
      reports: {
        asyncIntro:
          "Berichte werden asynchron erstellt, um HTTP-Anfragen nicht zu blockieren. Das System erstellt einen ComplianceReport (IsReady=false) und reiht den Job ein.",
        asyncTip:
          "Verwenden Sie die Schaltfläche Aktualisieren im UI, um die Bereitschaft zu prüfen (normalerweise 30-60 Sekunden).",
        asyncTitle: "Asynchrone Generierung",
        description:
          "Asynchrone, revisionssichere Berichte generieren (GDPR-Übersicht, DSR-Zusammenfassung, Einwilligungs-Audit, Aufbewahrungsanalyse, Inventar-Export).",
        downloadIntro:
          "Sobald ein Bericht bereit ist (IsReady=true), ist die DownloadUrl verfügbar. Berichte werden 90 Tage lang aufbewahrt.",
        downloadTitle: "Berichte herunterladen",
        endpointsTitle: "API Endpoints",
        ep: {
          download: "Die generierte Berichtsdatei herunterladen",
          generate: "Einen neuen Berichtsgenerierungsjob in die Warteschlange einreihen",
          get: "Berichtsdetails und Download-URL nach ID abrufen",
          list: "Alle Compliance-Berichte auflisten (paginiert)",
        },
        intro:
          "Compliance-Berichte sind asynchron generierte Dokumente, die revisionssichere Zusammenfassungen Ihrer Compliance-Lage bieten. Berichte werden im Hintergrund erstellt und zum Download bereitgestellt.",
        reportTypesIntro: "Fünf Berichtstypen sind verfügbar:",
        reportTypesTitle: "Berichtstypen",
        title: "Compliance-Berichte",
        type1: "GDPR-Übersicht — Zusammenfassung des DSGVO-Compliance-Status.",
        type2:
          "DSR-Aktivitätszusammenfassung — Statistiken zu DSR-Volumen, Typen und SLA-Einhaltung.",
        type3: "Einwilligungs-Audit — Vollständiges Protokoll der Einwilligungen und Widerrufe.",
        type4: "Aufbewahrungsanalyse — Aktueller Durchsetzungsstatus aller aktiven Richtlinien.",
        type5: "Dateninventar-Export — Vollständiger Export des Dateninventars (Artikel 30 RoPA).",
      },
      retention: {
        action1: "Delete — Löscht dauerhaft alle passenden Datensätze.",
        action2: "Anonymize — Ersetzt personenbezogene Daten durch pseudonyme Token.",
        actionsIntro: "Bei Ablauf wendet SCRIPE eine von zwei Aktionen an:",
        actionsTitle: "Ablaufaktionen",
        automationIntro:
          "Der RetentionEnforcementJob läuft täglich um 3:00 Uhr UTC und verarbeitet Richtlinien. Ein Audit-Eintrag RetentionExecution wird erstellt.",
        automationTitle: "Automatisierte Durchsetzung",
        conn1: "gescannt von",
        conn2: "löst aus",
        conn3: "protokolliert",
        descAction: "Endgültige Löschung oder Anonymisierung",
        descEnforcement: "Wöchentlicher Job zur Auswertung der Richtlinien",
        descExecution: "Audit-Trail der Zerstörungsaktion",
        descPolicy: "Definiert Entitätstyp, Altersgrenze und Zerstörungsstrategie",
        description:
          "Definieren Sie Aufbewahrungsfristen und automatische Ablaufaktionen (Löschen oder Anonymisieren) für DSGVO-Artikel 5(1)(e).",
        endpointsTitle: "API Endpoints",
        ep: {
          executions: "Verlauf der Durchsetzungsausführungen auflisten",
          list: "Alle Aufbewahrungsrichtlinien auflisten",
          update: "Eine Aufbewahrungsrichtlinie aktualisieren",
        },
        field1: "DataCategory — Datentyp (z. B. 'Benutzerprofile').",
        field2: "RetentionDays — Wie viele Tage die Daten aufbewahrt werden müssen.",
        field3:
          "ExpiryAction — Was bei Ablauf geschieht: Delete (Löschen) oder Anonymize (Anonymisieren).",
        field4: "RegulationCode — Welche Verordnung dies erfordert (GDPR, CCPA usw.).",
        intro:
          "Aufbewahrungsrichtlinien definieren, wie lange Daten aufbewahrt werden müssen. SCRIPE setzt diese automatisch durch.",
        nodeAction: "Datenzerstörung",
        nodeEnforcement: "Aufbewahrungs-Durchsetzungs-Job",
        nodeExecution: "Aufbewahrungsausführung",
        nodePolicy: "Aufbewahrungsrichtlinie",
        policiesIntro: "Jede Richtlinie legt Folgendes fest:",
        policiesTitle: "Richtlinienkonfiguration",
        title: "Datenaufbewahrungsrichtlinien",
      },
    },
    editions: {
      description:
        "Benannte Abonnementpläne mit Funktionsbündeln, Überlaufrichtlinien (Overflow Policies), Versionierung und Rollout-Strategien.",
      drillDownIntro:
        "Wenn ein Systemadministrator in einen Mandanten absteigt (Drill-Down), wird die Editionsliste automatisch auf die für diesen Mandanten sichtbaren Editionen beschränkt. Das Backend verwendet den X-Tenant-Context-Header zur Filterung: Systemeditionen + Retail-Editionen, die vom ausgewählten Mandanten erstellt wurden. Das Frontend blendet CRUD-Aktionen im Drill-Down-Modus aus.",
      drillDownTitle: "Drill-Down-Verhalten",
      endpointsCreate: "Eine neue Edition erstellen",
      endpointsCreateVersion: "Eine neue Entwurfsversion mit Funktions-Snapshot erstellen",
      endpointsDelete: "Eine Edition weich löschen (Soft-Delete)",
      endpointsDirectApply: "Funktionsänderungen sofort anwenden (keine Versionierung)",
      endpointsGet: "Editionsdetails nach ID abrufen",
      endpointsGetFeatures: "Für diese Edition konfigurierte Funktionen auflisten",
      endpointsGetVersions: "Alle Versionen für diese Edition auflisten",
      endpointsIntro:
        "Der Editions-Controller stellt 11 Endpunkte zur Verwaltung von Editionen, deren Funktionen und dem Versionslebenszyklus bereit:",
      endpointsList: "Alle Editionen auflisten (paginiert, filterbar)",
      endpointsPublishVersion:
        "Eine Entwurfsversion mit gewählter Rollout-Strategie veröffentlichen",
      endpointsSetFeatures: "Funktionen für diese Edition festlegen/aktualisieren",
      endpointsTitle: "API-Endpunkte",
      endpointsUpdate: "Editions-Metadaten aktualisieren",
      entityIntro:
        "Eine Edition ist ein benannter Plan, der Funktionswerte bündelt. Systemeditionen werden von Plattform-Administratoren erstellt; Retail-Editionen werden von Reseller-Mandanten für ihre Unter-Mandanten erstellt.",
      entityTitle: "Editions-Entität",
      featuresIntro:
        "Jede Edition enthält eine Reihe von EditionFeature-Datensätzen, die Funktionen ihren Werten innerhalb dieses Plans zuordnen. Funktionen, die in einer Edition nicht explizit festgelegt sind, greifen auf Feature.DefaultValue zurück.",
      featuresTip:
        "Funktionen, die in einer Edition nicht explizit festgelegt sind, greifen auf Feature.DefaultValue zurück. Sie müssen nur Funktionen konfigurieren, die vom globalen Standard abweichen.",
      featuresTitle: "Editions-Funktionen",
      intro:
        "Editionen sind benannte Pläne (z. B. Basic, Pro, Enterprise), die Funktionswerte bündeln. Jeder Mandant abonniert eine Edition, die seinen Funktionszugriff bestimmt. Editionen unterstützen Versionierung mit kontrollierten Rollout-Strategien für die sichere Bereitstellung von Änderungen.",
      overflowIntro:
        "Wenn ein Mandant auf eine Edition mit niedrigeren Limits herabgestuft wird, können seine vorhandenen Ressourcen die neuen Limits überschreiten. Die Überlaufrichtlinie bestimmt, was passiert:",
      overflowTitle: "Überlaufrichtlinie (Overflow Policy)",
      rolloutIntro:
        "Beim Veröffentlichen einer Editionsversion wählen Administratoren aus, wie die Änderungen für abonnierte Mandanten bereitgestellt werden:",
      rolloutTitle: "Rollout-Strategien",
      scopingIntro:
        "SCRIPE unterstützt zwei Arten von Editionen: Systemeditionen, die von Plattformadministratoren erstellt werden und für alle Mandanten sichtbar sind, und Retail-Editionen, die von Reseller-Mandanten nur für deren Unter-Mandanten erstellt werden.",
      scopingNote:
        "Mandanten-Administratoren sehen nur Systemeditionen sowie ihre eigenen Retail-Editionen. Dies stellt die Editions-Isolation zwischen Reseller-Mandanten sicher.",
      scopingTitle: "System- vs. Retail-Editionen",
      title: "Editionen",
      versionsIntro:
        "Editions-Versionen bieten ein Versionierungs- und Rollout-System für Funktionsänderungen. Anstatt Funktionen direkt zu ändern, können Administratoren eine neue Version (Snapshot) erstellen, eine Rollout-Strategie wählen und diese veröffentlichen.",
      versionsTitle: "Editions-Versionen",
      workflowIntro:
        "SCRIPE bietet zwei Möglichkeiten, Editionsfunktionen zu aktualisieren, die jeweils für unterschiedliche Szenarien geeignet sind:",
      workflowTip:
        "Verwenden Sie 'Jetzt anwenden' für dringende Fehlerbehebungen und kleine Änderungen. Verwenden Sie 'Als Version speichern' für größere Planaktualisierungen, die einen gestaffelten Rollout und einen Audit-Trail benötigen.",
      workflowTitle: "Jetzt anwenden vs. Als Version speichern",
    },
    entitlementsOverview: {
      architectureIntro:
        "Das Berechtigungssystem besteht aus vier miteinander verbundenen Domänen, die zusammenarbeiten, um eine vollständige Feature-Gating-Lösung zu bieten.",
      architectureTitle: "Architektur",
      backendIntro:
        "Das Berechtigungs-Backend folgt SCRIPEs standardmäßigem Clean-Architecture-Modullayout mit Domain-, Application- und Infrastructure-Schichten.",
      backendTitle: "Backend-Struktur",
      comparisonIntro:
        "Die folgende Tabelle zeigt die unterschiedlichen Fähigkeiten, wenn das Berechtigungsmodul aktiviert ist, im Vergleich zum Betrieb ohne dieses Modul:",
      comparisonTitle: "Mit vs. Ohne Berechtigungen",
      contextAwareIntro:
        "Alle Berechtigungsseiten (Funktionen, Editionen, Berechtigungen) sind kontextbezogen. Das Frontend erkennt, ob der Benutzer ein Systemadministrator (tenantId ist null), ein Mandanten-Administrator oder im Drill-Down-Modus ist, und ruft entsprechend verschiedene Backend-Endpunkte auf. Systemadministratoren sehen den vollständigen Katalog mit CRUD; Mandanten-Administratoren sehen nur ihre effektiven Daten im Nur-Lese-Modus.",
      contextAwareTitle: "Kontextbezogene Bereichseinstellung",
      controllersIntro:
        "Das Berechtigungsmodul stellt 31 API-Endpunkte über 4 Controller bereit, die alle mit JWT authentifiziert und durch berechtigungsbasierte Autorisierung geschützt sind.",
      controllersTitle: "API-Controller",
      cqrsMapIntro:
        "Das Berechtigungsmodul registriert 31 AstraFlow mediator-Handler, die sich über die vier Domänen erstrecken. Jeder Befehl hat einen entsprechenden FluentValidation-Validator zur Eingabeüberprüfung.",
      cqrsMapTitle: "CQRS Command & Query Map",
      description:
        "Editionsbasiertes Feature-Gating mit Funktionen, Editionen, Abonnements und mandantenspezifischen Überschreibungen.",
      diIntro:
        "Alle Berechtigungsdienste werden über die Erweiterungsmethode AddEntitlementsModule in DependencyInjection.cs registriert. Das Modul folgt SCRIPEs Standard-Registrierungsmuster.",
      diTitle: "Dependency Injection Registrierung",
      domainsIntro: "Jede Domäne behandelt einen bestimmten Aspekt des Berechtigungslebenszyklus:",
      domainsTitle: "Vier Domänen",
      frontendIntro:
        "Das Frontend spiegelt das Backend mit vier Untermodulen (Editionen, Funktionen, Abonnements, Überschreibungen) wider, die alle dem SOLID View/ViewModel-Muster folgen.",
      frontendTitle: "Frontend-Struktur",
      gettingStartedIntro:
        "Befolgen Sie diese 5 Schritte, um das Berechtigungssystem für Ihre Plattform einzurichten. Jeder Schritt baut auf dem vorherigen auf:",
      gettingStartedTitle: "Erste Schritte",
      intro:
        "Das Berechtigungsmodul (Entitlements) ist SCRIPEs Engine zur Verwaltung von Plänen und Funktionen. Es definiert, welche Fähigkeiten jeder Mandant (Tenant) erhält, wie Pläne (Editionen) diese Fähigkeiten bündeln und wie Abonnements Mandanten mit Plänen verknüpfen.",
      noOpIntro:
        "Wenn das Berechtigungsmodul nicht geladen ist (z. B. in einem Microservice, der keine Entitlements enthält), registriert SCRIPE einen NoOpFeatureCache. Dadurch können IRequireFeature-Befehle fehlerfrei passieren — alle Funktionen werden standardmäßig als aktiviert behandelt.",
      noOpNote:
        "Das NoOp-Fallback stellt sicher, dass Module IRequireFeature ohne eine feste Abhängigkeit vom Berechtigungsmodul verwenden können. Im produktiven Monolith-Modus ist der echte FeatureCache immer verfügbar.",
      noOpTitle: "NoOp-Fallback",
      pipelineIntro:
        "SCRIPE integriert Berechtigungen über das FeatureCheckBehavior direkt in die AstraFlow mediator-CQRS-Pipeline. Befehle und Abfragen, die IRequireFeature implementieren, werden automatisch überwacht — ist der ermittelte Funktionswert des Mandanten deaktiviert, wird die Anfrage abgelehnt, bevor sie den Handler erreicht.",
      pipelineTip:
        "Um einen Befehl hinter einer Funktion zu verbergen, implementieren Sie einfach IRequireFeature und setzen Sie RequiredFeatureName auf den stabilen Systemschlüssel der Funktion (z. B. 'Chat.Enabled'). Es ist kein zusätzlicher Code erforderlich.",
      pipelineTitle: "Pipeline-Integration",
      resolutionIntro:
        "Wenn das System einen Funktionswert für einen Mandanten ermitteln muss, folgt es einer strikten Prioritätskette. Die Quelle mit der höchsten Priorität, die einen Wert liefert, gewinnt.",
      resolutionTip:
        "Die Auflösungskette wird Lazy evaluiert — Werte werden nach der ersten Auflösung zwischengespeichert und invalidiert, wenn sich Abonnements, Editionen oder Überschreibungen ändern.",
      resolutionTitle: "Auflösungskette für Funktionswerte",
      title: "Berechtigungsübersicht",
      whatIsIntro:
        "Berechtigungen ist das Modul, das steuert, auf welche Funktionen ein Mandant basierend auf seiner abonnierten Edition (Plan) zugreifen kann. Es bietet eine dreistufige Auflösungskette: Funktionsstandards → Editions-Werte → Mandantenspezifische Überschreibungen, um maximale Flexibilität für Plattformbetreiber und Reseller-Mandanten zu gewährleisten.",
      whatIsTitle: "Was sind Berechtigungen (Entitlements)?",
    },
    features: {
      cacheIntro:
        "Aufgelöste Funktionswerte werden im IFeatureCache zwischengespeichert, um Datenbankabfragen bei jeder Anfrage zu vermeiden. Der Cache wird invalidiert, wenn sich die Funktionen einer Edition ändern, ein Abonnement geändert wird oder eine Überschreibung festgelegt/entfernt wird. In Microservice-Deployments ohne das Berechtigungsmodul behandelt ein NoOpFeatureCache alle Funktionen als aktiviert.",
      cacheNote:
        "Der Cache wird automatisch invalidiert, wenn: (1) die Funktionen einer Edition geändert werden, (2) ein Abonnement zugewiesen/geändert wird, (3) eine Überschreibung festgelegt/entfernt wird. Ein manuelles Cache-Busting ist nicht erforderlich.",
      cacheTitle: "Feature-Cache",
      contextAwareIntro:
        "Die Funktionsliste ist kontextbezogen. Systemadministratoren sehen den vollständigen Funktionskatalog mit CRUD-Operationen. Mandanten-Administratoren und Drill-Down-Sitzungen sehen nur die effektiven Funktionen des Mandanten (aufgelöst aus Edition + Überschreibungen) im Nur-Lese-Modus. Die gesamte Bereichseinstellung erfolgt backend-seitig über GET /features (Katalog) vs. GET /features/effective (mandantenbezogen).",
      contextAwareTitle: "Kontextbezogene Funktionsanzeige",
      description:
        "Steuerbare Plattformfähigkeiten mit Booleschen, Numerischen und String-Wertetypen.",
      endpointsIntro:
        "Der Features-Controller stellt 5 CRUD-Endpunkte bereit. Systemfunktionen können nicht gelöscht werden:",
      endpointsTitle: "API-Endpunkte",
      entityIntro:
        "Eine Funktion (Feature) definiert eine steuerbare Plattformfähigkeit. Das Feld Name ist ein stabiler Systemschlüssel, der im Code verwendet wird; DisplayNameEn/DisplayNameAr sind benutzerorientierte Bezeichnungen.",
      entityTitle: "Funktions-Entität",
      ep: {
        create: "Eine neue benutzerdefinierte Funktion erstellen",
        delete:
          "Eine benutzerdefinierte Funktion weich löschen (Systemfunktionen können nicht gelöscht werden)",
        get: "Funktionsdetails nach ID abrufen",
        list: "Alle Funktionen auflisten (paginiert, filterbar nach Kategorie/Typ)",
        update:
          "Funktions-Metadaten aktualisieren (Systemfunktionen: nur DefaultValue/Description)",
      },
      intro:
        "Funktionen sind die atomaren Bausteine des Berechtigungssystems. Jede Funktion repräsentiert eine steuerbare Fähigkeit — einen booleschen Schalter, ein numerisches Kontingent (Quota) oder eine String-Konfiguration. Funktionen haben einen stabilen Systemschlüssel (Name), der sich nie ändert, sodass sie sicher im Code referenziert werden können.",
      patternIntro:
        "Um einen beliebigen CQRS-Befehl hinter einer Funktionsprüfung zu verbergen, implementieren Sie einfach die IRequireFeature-Marker-Schnittstelle. Das FeatureCheckBehavior fängt die Anfrage automatisch ab, löst den Funktionswert des Mandanten auf und lehnt sie ab, falls deaktiviert oder über dem Kontingent.",
      patternTitle: "IRequireFeature-Muster",
      quotaIntro:
        "Numerische Funktionen unterstützen die automatische Kontingentdurchsetzung über die QuotaCounter-Entität. Das FeatureCheckBehavior vergleicht die aktuelle Nutzung mit dem ermittelten Limit für jeden IRequireFeature-Befehl, der auf eine numerische Funktion abzielt.",
      quotaTitle: "Kontingentverfolgung (QuotaCounter)",
      requireFeatureIntro:
        "Um einen CQRS-Befehl oder eine Abfrage hinter einer Funktion zu verbergen, implementieren Sie die IRequireFeature-Marker-Schnittstelle. Das FeatureCheckBehavior der Pipeline löst automatisch den aktuellen Wert des Mandanten auf und lehnt die Anfrage ab, wenn die Funktion deaktiviert ist.",
      requireFeatureNote:
        "IRequireFeature funktioniert sowohl für boolesche Funktionen (auf aktiviert/deaktiviert geprüft) als auch für numerische Funktionen (auf verbleibendes Kontingent geprüft). Das Behavior bestimmt die Prüfungsart automatisch anhand des Feature.ValueType.",
      requireFeatureTitle: "IRequireFeature-Schnittstelle",
      seedingIntro:
        "Systemfunktionen werden beim Anwendungsstart automatisch vom EntitlementsStartupSeeder geseeded. Der Seeder prüft, ob jede Systemfunktion bereits existiert (nach Name) und erstellt nur fehlende — vorhandene Funktionen werden niemals überschrieben.",
      seedingTitle: "Feature-Seeding",
      systemVsCustomIntro:
        "SCRIPE unterscheidet zwischen Systemfunktionen (beim Start geseeded, schreibgeschützt) und benutzerdefinierten Funktionen (von Administratoren via API erstellt):",
      systemVsCustomTitle: "System- vs. Benutzerdefinierte Funktionen",
      title: "Funktionen (Features)",
      valueTypesIntro:
        "Funktionswerte werden als Strings gespeichert, aber gemäß ihrem ValueType interpretiert. Das System validiert Werte bei der Erstellung und Aktualisierung gegen den erwarteten Typ.",
      valueTypesTip:
        "Verwenden Sie für numerische Funktionen -1, um 'unbegrenzt' darzustellen. Das FeatureCheckBehavior erkennt -1 als Spezialwert und blockiert niemals Anfragen für Funktionen mit einem unbegrenzten Kontingent.",
      valueTypesTitle: "Wertetypen",
    },
    overrides: {
      auditIntro:
        "Jede Überschreibungsoperation wird mit vollständigen Audit-Informationen verfolgt. Das Feld 'Grund' (Reason) bei jeder Überschreibung liefert den Kontext, warum der benutzerdefinierte Wert angewendet wurde.",
      auditTitle: "Audit-Trail",
      bestPracticesIntro:
        "Befolgen Sie diese Richtlinien, um Ihr Überschreibungssystem wartbar und überprüfbar zu halten.",
      bestPracticesTitle: "Best Practices",
      bestPracticesWarning:
        "Überschreibungen sollten sparsam eingesetzt werden. Wenn viele Mandanten dieselbe Überschreibung benötigen, ziehen Sie in Betracht, eine neue Edition zu erstellen. Übermäßige Überschreibungen machen das System schwerer zu verwalten und verursachen Wartungsschulden.",
      description:
        "Mandantenspezifische Anpassung von Funktionswerten, die die Editions-Standards umgeht.",
      endpointsIntro:
        "Der TenantFeatures-Controller stellt 4 Endpunkte zur Verwaltung von mandantenspezifischen Überschreibungen und aufgelösten Werten bereit:",
      endpointsTitle: "API-Endpunkte",
      entityIntro:
        "Ein TenantFeatureOverride legt einen benutzerdefinierten Wert für eine bestimmte Funktion bei einem bestimmten Mandanten fest. Er enthält ein optionales Feld 'Reason' (Grund) für Prüfzwecke.",
      entityTitle: "Override-Entität",
      ep: {
        list: "Alle Überschreibungen für einen bestimmten Mandanten auflisten",
        remove: "Eine Funktions-Überschreibung entfernen (deaktivieren)",
        resolved:
          "Alle aufgelösten Funktionswerte für einen Mandanten abrufen (zeigt Quelle: Override/Edition/Default)",
        set: "Eine Funktions-Überschreibung für einen Mandanten festlegen oder aktualisieren",
      },
      expiryIntro:
        "Überschreibungen können ein optionales ExpiresAt-Datum (Ablaufdatum) haben. Wenn das Ablaufdatum überschritten ist, wird die Überschreibung automatisch deaktiviert und die Funktion fällt auf den Editionswert (oder den globalen Standard) zurück.",
      expiryNote:
        "Abgelaufene Überschreibungen werden weich deaktiviert (IsActive = false), nicht gelöscht. Dies bewahrt den Audit-Trail und ermöglicht bei Bedarf eine erneute Aktivierung.",
      expiryTitle: "Ablaufende Überschreibungen",
      intro:
        "Funktions-Überschreibungen ermöglichen es Plattform-Administratoren, Funktionswerte für einzelne Mandanten anzupassen, unabhängig von ihrer abonnierten Edition. Überschreibungen haben in der Auflösungskette die höchste Priorität und eignen sich daher perfekt für maßgeschneiderte Vertriebsdeals, spezielle Werbeaktionen oder einmalige Ausnahmen.",
      overuseWarning:
        "Überschreibungen sollten sparsam eingesetzt werden. Wenn viele Mandanten dieselbe Überschreibung benötigen, ziehen Sie in Betracht, eine neue Edition zu erstellen. Übermäßige Überschreibungen machen das System schwerer zu verwalten und zu prüfen.",
      priorityIntro:
        "Überschreibungen stehen ganz oben in der Auflösungskette. Wenn das System einen Funktionswert für einen Mandanten ermittelt, sucht es zuerst nach einer Überschreibung:",
      priorityTitle: "Auflösungspriorität",
      resolvedIntro:
        "Der Endpunkt GET /api/v1/tenants/{tenantId}/features/resolved gibt den endgültigen, effektiven Wert für jede Funktion eines bestimmten Mandanten zurück. Er zeigt für jeden Eintrag die Auflösungsquelle (Override, Edition oder Default) an, was das Debuggen und Auditing erleichtert.",
      resolvedTitle: "Endpunkt für aufgelöste Funktionen",
      scenariosIntro:
        "Die folgenden realen Szenarien zeigen, wann Überschreibungen den größten Wert bieten:",
      scenariosTitle: "Anwendungsszenarien",
      settingIntro:
        "Um eine Überschreibung festzulegen, senden Sie einen POST an den Endpunkt für Mandantenfunktionen mit der Funktions-ID, dem benutzerdefinierten Wert und einem optionalen Grund für Prüfzwecke.",
      settingTip:
        "Geben Sie beim Festlegen von Überschreibungen immer einen Grund an — dies macht Audit-Trails aussagekräftig und hilft zukünftigen Administratoren zu verstehen, warum die Überschreibung angewendet wurde.",
      settingTitle: "Eine Überschreibung festlegen",
      title: "Funktions-Überschreibungen (Overrides)",
      useCase1:
        "Maßgeschneiderte Enterprise-Deals — 'Acme Corp 500 Administratoren statt der standardmäßigen 50 geben'",
      useCase2: "Werbeangebote — 'Premium-Chat für diesen Mandanten für 30 Tage aktivieren'",
      useCase3: "Beta-Tests — 'Das neue Rechnungsmodul für Early Adopters aktivieren'",
      useCase4: "Vorübergehende Erhöhung — 'Datei-Upload-Limit während ihrer Migration erhöhen'",
      whenIntro:
        "Überschreibungen sind für Ausnahmefälle gedacht, in denen ein Mandant einen anderen Wert benötigt, als seine Edition vorgibt:",
      whenTitle: "Wann man Überschreibungen verwendet",
    },
    subscriptions: {
      assignIntro:
        "Erstellen Sie ein neues Abonnement, das einen Mandanten mit einer Edition verknüpft. Wenn der Mandant bereits ein aktives Abonnement hat, wird das vorherige automatisch gekündigt. Unterstützt optionale Parameter für Währung, Promo-Code und Ablaufverhalten.",
      assignTitle: "Abonnement zuweisen",
      concurrencyIntro:
        "Jede TenantSubscription hat einen ConcurrencyStamp (Guid) mit [ConcurrencyCheck]. Der Stempel wird bei jedem Schreibvorgang erneuert. Dies verhindert Race Conditions — z.B. gleichzeitige Kündigung + Abgleichjob — durch Auslösen einer DbUpdateConcurrencyException bei Kollisionen.",
      concurrencyTitle: "Optimistische Nebenläufigkeit (E1)",
      crossModuleIntro:
        "Abonnement-Lebenszyklus-Ereignisse veröffentlichen Domänen-Events, die vom Identitätsmodul konsumiert werden. Bei Aussetzung eines Abonnements werden alle Mandanten-Admins mit DeactivationReason='SubscriptionSuspended' deaktiviert. Bei Wiederaufnahme werden nur die durch Aussetzung deaktivierten Admins reaktiviert.",
      crossModuleReasons:
        "Drei Deaktivierungsgründe: 'Manuell' (wird nie automatisch reaktiviert), 'SubscriptionSuspended' (wird bei Wiederaufnahme reaktiviert), 'SubscriptionExpired' (wird bei Ablauf deaktiviert).",
      crossModuleTitle: "Modulübergreifende Integration (H1)",
      description:
        "Mandanten-zu-Editions-Bindung mit vollständiger Lebenszyklusverwaltung, Mehrwährungs-Preisgestaltung, Werbeaktionen, Testversionen, Herabstufungen, Ablaufverhalten und erweiterten Analyse-Exporten.",
      downgradeIntro:
        "Wenn ein Mandant herabgestuft wird (entweder manuell oder aufgrund von Ablauf), verfolgt das System die ursprünglichen Abonnementdetails für Audits und mögliche Wiederherstellungen. Die Felder DowngradedFromEditionId, DowngradedFromType, DowngradedFromEndDate und DowngradedAt bewahren den kompletten Downgrade-Verlauf.",
      downgradeTitle: "Downgrade-Verfolgung",
      downgradeWarning:
        "Beim Downgrade bestimmt die Überlaufrichtlinie (OverflowPolicy) der Zieledition, was mit Ressourcen geschieht, die die neuen Limits überschreiten. Verwenden Sie immer den Downgrade Impact-Endpunkt, um die Auswirkungen vorab anzuzeigen, bevor Sie Änderungen vornehmen.",
      endpointsIntro:
        "Der Abonnements-Controller bietet 13 Endpunkte, die den gesamten Abonnement-Lebenszyklus abdecken:",
      endpointsTitle: "API-Endpunkte",
      entityIntro:
        "Eine TenantSubscription bindet einen Mandanten an eine Edition mit Lebenszyklusverfolgung. Sie unterstützt mehrere Abonnementtypen und -status für ein umfassendes Lebenszyklusmanagement.",
      entityTitle: "Abonnement-Entität",
      ep: {
        assign: "Ein neues Abonnement erstellen (Mandant einer Edition mit Währung/Promo zuweisen)",
        cancel: "Abonnement dauerhaft kündigen",
        downgrade: "Auf eine niedrigere Edition herabstufen (prüft OverflowPolicy)",
        export: "Abonnements als CSV, Excel oder PDF mit erweiterten Filtern exportieren",
        get: "Abonnementdetails nach ID abrufen",
        impact: "Downgrade-Auswirkungen vor der Ausführung in der Vorschau anzeigen",
        list: "Alle Abonnements auflisten (paginiert, filterbar nach Status/Typ/Mandant)",
        renew: "Ein ablaufendes Abonnement verlängern",
        resume: "Ein gesperrtes Abonnement fortsetzen",
        suspend: "Abonnement sperren (Mandantenzugriff blockieren)",
        tenantActive: "Das aktive Abonnement für einen bestimmten Mandanten abrufen",
        upgrade: "Auf eine höhere Edition hochstufen",
      },
      exchangeRateIntro:
        "Alle Beträge werden über ExchangeRateToUsd für konsistente MRR/ARR-Berichte auf USD normalisiert. Das Feld TotalAmountUsd wird zum Abonnementzeitpunkt berechnet und für historische Genauigkeit gespeichert — Wechselkursschwankungen ändern vergangene Aufzeichnungen nicht rückwirkend.",
      exchangeRateTitle: "USD-Normalisierung",
      expiryIntro:
        "Wenn ein Abonnement abläuft, bestimmt die Einstellung ExpiryBehavior, was als Nächstes passiert:",
      expiryTitle: "Ablaufverhalten",
      exportDaysLeftIntro:
        "Berichte enthalten eine berechnete 'Verbleibende Tage'-Spalte mit bedingter Farbcodierung: Rot (≤7 Tage), Gelb (≤30 Tage), Grün (>30 Tage). Dies ermöglicht die sofortige Identifizierung von Abonnements, die eine Verlängerung benötigen.",
      exportDaysLeftTitle: "Tage bis zum Ablauf",
      exportFilterCurrency: "Währung — Beträge in ausgewählter Währung anzeigen",
      exportFilterDate:
        "Datumsbereich — Filterung nach Abonnement-Erstellungsdatum (letzte 7/30/90 Tage, letztes Jahr oder benutzerdefinierter Bereich)",
      exportFilterEdition: "Edition — Filterung nach spezifischem Plan/Edition",
      exportFilterExpiring:
        "Bald ablaufend — Abonnements finden, die innerhalb von 5/7/14/30/60/90 Tagen ablaufen",
      exportFiltersIntro: "Berichte unterstützen erweiterte Filterung für gezielte Analysen:",
      exportFilterStatus: "Status — Aktiv, Gesperrt, Gekündigt, Abgelaufen",
      exportFiltersTitle: "Export-Filter",
      exportFormatCsv:
        "CSV — leichtgewichtig, in jedes Tabellenkalkulationsprogramm oder BI-Tool importierbar",
      exportFormatExcel:
        "XLSX — professionelle Excel-Arbeitsmappe mit gestalteten Kopfzeilen, Filter-Metadatenblatt, bedingter Formatierung und automatisch dimensionierten Spalten (ClosedXML)",
      exportFormatPdf:
        "PDF — druckfertiges Dokument mit markengebundenem Deckblatt, statistischer Zusammenfassung und paginierten Datentabellen (QuestPDF)",
      exportFormatsTitle: "Exportformat-Details",
      exportIntro:
        "Das Abonnement-Exportsystem generiert umfassende Berichte in den Formaten CSV, Excel (XLSX) und PDF. Jeder Bericht enthält ein Deckblatt mit Filter-Metadaten, farbcodierte Datentabellen und statistische Zusammenfassungen.",
      exportTitle: "Erweiterter Export & Berichterstattung",
      impactIntro:
        "Bevor Sie die Edition eines Mandanten ändern, verwenden Sie den Downgrade Impact-Endpunkt, um in einer Vorschau zu sehen, welche Ressourcen überlaufen würden. Die Antwort listet jede Funktion auf, die die Limits der neuen Edition überschreiten würde, zusammen mit der aktuellen Nutzung vs. neuem Limit.",
      impactTitle: "Downgrade-Auswirkungsanalyse",
      intro:
        "Abonnements verknüpfen Mandanten mit Editionen (Plänen). Jeder Mandant hat ein Basisabonnement, das seine Edition bestimmt, und optional Zusatzabonnements für zusätzliche Fähigkeiten. Das Abonnementsystem verwaltet den gesamten Lebenszyklus von der Zuweisung über Verlängerung, Herabstufung, Sperrung bis hin zur Kündigung — mit integrierter Mehrwährungs-Preisgestaltung und Verfolgung von Werberabatten.",
      lifecycleIntro: "Abonnements durchlaufen während ihres Lebenszyklus eine Reihe von Status:",
      lifecycleTitle: "Status-Lebenszyklus",
      operationsIntro:
        "Das Abonnementmodul unterstützt ein umfassendes Set von Lebenszyklus-Operationen. Jede Operation überführt das Abonnement in einen neuen Zustand mit vollständiger Audit-Verfolgung.",
      operationsTitle: "Abonnement-Operationen",
      pricingIntro:
        "Jedes Abonnement trägt vollständige Preis-Metadaten: Währung (ISO-Code), Basisbetrag, Anpassungsbetrag, Gesamtbetrag, WechselkursZuUsd und GesamtbetragUsd. Dies ermöglicht eine präzise Umsatzverfolgung über 9+ unterstützte Währungen (USD, EUR, GBP, SAR, AED, EGP, TRY, INR und mehr).",
      pricingTitle: "Mehrwährungs-Preisgestaltung",
      promoExpiryIntro:
        "Wenn eine Aktion mit DurationDays > 0 angewendet wird, berechnet das System einen PromotionExpiresAt-Zeitstempel. Bei jeder Verlängerung prüft der Handler, ob UtcNow > PromotionExpiresAt — wenn die Aktion abgelaufen ist, wird der Rabatt entfernt und NICHT in die neue Abonnementzeile übernommen.",
      promoExpiryTitle: "Aktionsablauf-Verfolgung (A1)",
      promotionsIntro:
        "Abonnements unterstützen Promo-Codes über das Feld AppliedPromoCode. Bei Anwendung einer gültigen Werbeaktion wird ein PromotionDiscount-Prozentsatz aufgezeichnet und der Anpassungsbetrag spiegelt den auf den Basisbetrag angewandten Rabatt wider. Promotionen werden pro Abonnement für Audits und Analysen verfolgt.",
      promotionsTitle: "Werberabatte",
      renewalAuditIntro:
        "Jeder Abrechnungszeitraum erzeugt eine unveränderliche Datenbankzeile mit zum Verlängerungszeitpunkt festgeschriebenem Preis. Dies ermöglicht präzise Finanzberichte: MRR-Trends, Abwanderungsanalyse pro Zeitraum und Rückerstattungsverfolgung pro Zyklus.",
      renewalAuditTitle: "Umsatz-Prüfpfad",
      renewalIntro:
        "Verlängerungen erstellen eine NEUE TenantSubscription-Zeile anstatt den bestehenden Datensatz zu überschreiben (Stripe-Muster). Das alte Abonnement wird als abgelaufen markiert (IsActive=false), während eine neue Zeile mit frischer Id, StartDate=UtcNow, neu berechneter Preisgestaltung und übertragenen Aktionsdetails erstellt wird.",
      renewalTitle: "Verlängerung — Neuer-Zeilen-Muster (B2)",
      title: "Abonnements",
      trialIntro:
        "Testabonnements haben ein TrialEndDate. Wenn eine Testversion auf einen kostenpflichtigen Plan hochgestuft wird, wird IsTrialConverted auf true gesetzt und das Abonnement wechselt zum neuen Typ. Wenn die Testversion ohne Konvertierung abläuft, bestimmt ExpiryBehavior, was als Nächstes passiert.",
      trialTitle: "Testversions-Konvertierung",
      typesIntro:
        "Jedes Abonnement hat einen Typ, der seinen Abrechnungszyklus und sein Verhalten bestimmt:",
      typesTitle: "Abonnementtypen",
      upgradeIntro:
        "Mandanten können zwischen Editionen wechseln. Upgrades werden sofort angewendet, wobei die Funktionen der neuen Edition sofort wirksam werden. Downgrades prüfen zuerst die OverflowPolicy, um Ressourcen zu handhaben, die neue Limits überschreiten.",
      upgradeTitle: "Upgrade & Downgrade",
      validationIntro:
        "Alle 8 Abonnement-Befehle haben dedizierte FluentValidation-Validatoren. Validatoren verwenden ILocalizer für lokalisierte Fehlermeldungen (EN + AR). Geschäftsregeln: keine Verlängerung als Testversion, positive Rückerstattungsbeträge, Zeichenlängenbegrenzungen.",
      validationTitle: "Eingabevalidierung (G1)",
    },
  },
};

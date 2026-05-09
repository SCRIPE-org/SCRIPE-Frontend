/**
 * Docs page locale — DE
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const de = {
  modules: {
    entitlementsOverview: {
      title: "Berechtigungsübersicht",
      description:
        "Editionsbasiertes Feature-Gating mit Funktionen, Editionen, Abonnements und mandantenspezifischen Überschreibungen.",
      intro:
        "Das Berechtigungsmodul (Entitlements) ist NEXORAs Engine zur Verwaltung von Plänen und Funktionen. Es definiert, welche Fähigkeiten jeder Mandant (Tenant) erhält, wie Pläne (Editionen) diese Fähigkeiten bündeln und wie Abonnements Mandanten mit Plänen verknüpfen.",
      whatIsTitle: "Was sind Berechtigungen (Entitlements)?",
      whatIsIntro:
        "Berechtigungen ist das Modul, das steuert, auf welche Funktionen ein Mandant basierend auf seiner abonnierten Edition (Plan) zugreifen kann. Es bietet eine dreistufige Auflösungskette: Funktionsstandards → Editions-Werte → Mandantenspezifische Überschreibungen, um maximale Flexibilität für Plattformbetreiber und Reseller-Mandanten zu gewährleisten.",
      architectureTitle: "Architektur",
      architectureIntro:
        "Das Berechtigungssystem besteht aus vier miteinander verbundenen Domänen, die zusammenarbeiten, um eine vollständige Feature-Gating-Lösung zu bieten.",
      domainsTitle: "Vier Domänen",
      domainsIntro: "Jede Domäne behandelt einen bestimmten Aspekt des Berechtigungslebenszyklus:",
      resolutionTitle: "Auflösungskette für Funktionswerte",
      resolutionIntro:
        "Wenn das System einen Funktionswert für einen Mandanten ermitteln muss, folgt es einer strikten Prioritätskette. Die Quelle mit der höchsten Priorität, die einen Wert liefert, gewinnt.",
      pipelineTitle: "Pipeline-Integration",
      pipelineIntro:
        "NEXORA integriert Berechtigungen über das FeatureCheckBehavior direkt in die NEXORA mediator-CQRS-Pipeline. Befehle und Abfragen, die IRequireFeature implementieren, werden automatisch überwacht — ist der ermittelte Funktionswert des Mandanten deaktiviert, wird die Anfrage abgelehnt, bevor sie den Handler erreicht.",
      pipelineTip:
        "Um einen Befehl hinter einer Funktion zu verbergen, implementieren Sie einfach IRequireFeature und setzen Sie RequiredFeatureName auf den stabilen Systemschlüssel der Funktion (z. B. 'Chat.Enabled'). Es ist kein zusätzlicher Code erforderlich.",
      backendTitle: "Backend-Struktur",
      backendIntro:
        "Das Berechtigungs-Backend folgt NEXORAs standardmäßigem Clean-Architecture-Modullayout mit Domain-, Application- und Infrastructure-Schichten.",
      frontendTitle: "Frontend-Struktur",
      frontendIntro:
        "Das Frontend spiegelt das Backend mit vier Untermodulen (Editionen, Funktionen, Abonnements, Überschreibungen) wider, die alle dem SOLID View/ViewModel-Muster folgen.",
      controllersTitle: "API-Controller",
      controllersIntro:
        "Das Berechtigungsmodul stellt 31 API-Endpunkte über 4 Controller bereit, die alle mit JWT authentifiziert und durch berechtigungsbasierte Autorisierung geschützt sind.",
      noOpTitle: "NoOp-Fallback",
      noOpIntro:
        "Wenn das Berechtigungsmodul nicht geladen ist (z. B. in einem Microservice, der keine Entitlements enthält), registriert NEXORA einen NoOpFeatureCache. Dadurch können IRequireFeature-Befehle fehlerfrei passieren — alle Funktionen werden standardmäßig als aktiviert behandelt.",
      noOpNote:
        "Das NoOp-Fallback stellt sicher, dass Module IRequireFeature ohne eine feste Abhängigkeit vom Berechtigungsmodul verwenden können. Im produktiven Monolith-Modus ist der echte FeatureCache immer verfügbar.",
      contextAwareTitle: "Kontextbezogene Bereichseinstellung",
      contextAwareIntro:
        "Alle Berechtigungsseiten (Funktionen, Editionen, Berechtigungen) sind kontextbezogen. Das Frontend erkennt, ob der Benutzer ein Systemadministrator (tenantId ist null), ein Mandanten-Administrator oder im Drill-Down-Modus ist, und ruft entsprechend verschiedene Backend-Endpunkte auf. Systemadministratoren sehen den vollständigen Katalog mit CRUD; Mandanten-Administratoren sehen nur ihre effektiven Daten im Nur-Lese-Modus.",
      resolutionTip:
        "Die Auflösungskette wird Lazy evaluiert — Werte werden nach der ersten Auflösung zwischengespeichert und invalidiert, wenn sich Abonnements, Editionen oder Überschreibungen ändern.",
      cqrsMapTitle: "CQRS Command & Query Map",
      cqrsMapIntro:
        "Das Berechtigungsmodul registriert 31 NEXORA mediator-Handler, die sich über die vier Domänen erstrecken. Jeder Befehl hat einen entsprechenden FluentValidation-Validator zur Eingabeüberprüfung.",
      diTitle: "Dependency Injection Registrierung",
      diIntro:
        "Alle Berechtigungsdienste werden über die Erweiterungsmethode AddEntitlementsModule in DependencyInjection.cs registriert. Das Modul folgt NEXORAs Standard-Registrierungsmuster.",
      comparisonTitle: "Mit vs. Ohne Berechtigungen",
      comparisonIntro:
        "Die folgende Tabelle zeigt die unterschiedlichen Fähigkeiten, wenn das Berechtigungsmodul aktiviert ist, im Vergleich zum Betrieb ohne dieses Modul:",
      gettingStartedTitle: "Erste Schritte",
      gettingStartedIntro:
        "Befolgen Sie diese 5 Schritte, um das Berechtigungssystem für Ihre Plattform einzurichten. Jeder Schritt baut auf dem vorherigen auf:",
    },
    editions: {
      title: "Editionen",
      description:
        "Benannte Abonnementpläne mit Funktionsbündeln, Überlaufrichtlinien (Overflow Policies), Versionierung und Rollout-Strategien.",
      intro:
        "Editionen sind benannte Pläne (z. B. Basic, Pro, Enterprise), die Funktionswerte bündeln. Jeder Mandant abonniert eine Edition, die seinen Funktionszugriff bestimmt. Editionen unterstützen Versionierung mit kontrollierten Rollout-Strategien für die sichere Bereitstellung von Änderungen.",
      entityTitle: "Editions-Entität",
      entityIntro:
        "Eine Edition ist ein benannter Plan, der Funktionswerte bündelt. Systemeditionen werden von Plattform-Administratoren erstellt; Retail-Editionen werden von Reseller-Mandanten für ihre Unter-Mandanten erstellt.",
      overflowTitle: "Überlaufrichtlinie (Overflow Policy)",
      overflowIntro:
        "Wenn ein Mandant auf eine Edition mit niedrigeren Limits herabgestuft wird, können seine vorhandenen Ressourcen die neuen Limits überschreiten. Die Überlaufrichtlinie bestimmt, was passiert:",
      featuresTitle: "Editions-Funktionen",
      featuresIntro:
        "Jede Edition enthält eine Reihe von EditionFeature-Datensätzen, die Funktionen ihren Werten innerhalb dieses Plans zuordnen. Funktionen, die in einer Edition nicht explizit festgelegt sind, greifen auf Feature.DefaultValue zurück.",
      versionsTitle: "Editions-Versionen",
      versionsIntro:
        "Editions-Versionen bieten ein Versionierungs- und Rollout-System für Funktionsänderungen. Anstatt Funktionen direkt zu ändern, können Administratoren eine neue Version (Snapshot) erstellen, eine Rollout-Strategie wählen und diese veröffentlichen.",
      rolloutTitle: "Rollout-Strategien",
      rolloutIntro:
        "Beim Veröffentlichen einer Editionsversion wählen Administratoren aus, wie die Änderungen für abonnierte Mandanten bereitgestellt werden:",
      workflowTitle: "Jetzt anwenden vs. Als Version speichern",
      workflowIntro:
        "NEXORA bietet zwei Möglichkeiten, Editionsfunktionen zu aktualisieren, die jeweils für unterschiedliche Szenarien geeignet sind:",
      workflowTip:
        "Verwenden Sie 'Jetzt anwenden' für dringende Fehlerbehebungen und kleine Änderungen. Verwenden Sie 'Als Version speichern' für größere Planaktualisierungen, die einen gestaffelten Rollout und einen Audit-Trail benötigen.",
      endpointsTitle: "API-Endpunkte",
      endpointsIntro:
        "Der Editions-Controller stellt 11 Endpunkte zur Verwaltung von Editionen, deren Funktionen und dem Versionslebenszyklus bereit:",
      drillDownTitle: "Drill-Down-Verhalten",
      drillDownIntro:
        "Wenn ein Systemadministrator in einen Mandanten absteigt (Drill-Down), wird die Editionsliste automatisch auf die für diesen Mandanten sichtbaren Editionen beschränkt. Das Backend verwendet den X-Tenant-Context-Header zur Filterung: Systemeditionen + Retail-Editionen, die vom ausgewählten Mandanten erstellt wurden. Das Frontend blendet CRUD-Aktionen im Drill-Down-Modus aus.",
      scopingTitle: "System- vs. Retail-Editionen",
      scopingIntro:
        "NEXORA unterstützt zwei Arten von Editionen: Systemeditionen, die von Plattformadministratoren erstellt werden und für alle Mandanten sichtbar sind, und Retail-Editionen, die von Reseller-Mandanten nur für deren Unter-Mandanten erstellt werden.",
      scopingNote:
        "Mandanten-Administratoren sehen nur Systemeditionen sowie ihre eigenen Retail-Editionen. Dies stellt die Editions-Isolation zwischen Reseller-Mandanten sicher.",
      featuresTip:
        "Funktionen, die in einer Edition nicht explizit festgelegt sind, greifen auf Feature.DefaultValue zurück. Sie müssen nur Funktionen konfigurieren, die vom globalen Standard abweichen.",
      endpointsList: "Alle Editionen auflisten (paginiert, filterbar)",
      endpointsGet: "Editionsdetails nach ID abrufen",
      endpointsCreate: "Eine neue Edition erstellen",
      endpointsUpdate: "Editions-Metadaten aktualisieren",
      endpointsDelete: "Eine Edition weich löschen (Soft-Delete)",
      endpointsGetFeatures: "Für diese Edition konfigurierte Funktionen auflisten",
      endpointsSetFeatures: "Funktionen für diese Edition festlegen/aktualisieren",
      endpointsDirectApply: "Funktionsänderungen sofort anwenden (keine Versionierung)",
      endpointsGetVersions: "Alle Versionen für diese Edition auflisten",
      endpointsCreateVersion: "Eine neue Entwurfsversion mit Funktions-Snapshot erstellen",
      endpointsPublishVersion:
        "Eine Entwurfsversion mit gewählter Rollout-Strategie veröffentlichen",
    },
    subscriptions: {
      title: "Abonnements",
      description:
        "Mandanten-zu-Editions-Bindung mit vollständiger Lebenszyklusverwaltung, Mehrwährungs-Preisgestaltung, Werbeaktionen, Testversionen, Herabstufungen, Ablaufverhalten und erweiterten Analyse-Exporten.",
      intro:
        "Abonnements verknüpfen Mandanten mit Editionen (Plänen). Jeder Mandant hat ein Basisabonnement, das seine Edition bestimmt, und optional Zusatzabonnements für zusätzliche Fähigkeiten. Das Abonnementsystem verwaltet den gesamten Lebenszyklus von der Zuweisung über Verlängerung, Herabstufung, Sperrung bis hin zur Kündigung — mit integrierter Mehrwährungs-Preisgestaltung und Verfolgung von Werberabatten.",
      entityTitle: "Abonnement-Entität",
      entityIntro:
        "Eine TenantSubscription bindet einen Mandanten an eine Edition mit Lebenszyklusverfolgung. Sie unterstützt mehrere Abonnementtypen und -status für ein umfassendes Lebenszyklusmanagement.",
      typesTitle: "Abonnementtypen",
      typesIntro:
        "Jedes Abonnement hat einen Typ, der seinen Abrechnungszyklus und sein Verhalten bestimmt:",
      lifecycleTitle: "Status-Lebenszyklus",
      lifecycleIntro: "Abonnements durchlaufen während ihres Lebenszyklus eine Reihe von Status:",
      downgradeTitle: "Downgrade-Verfolgung",
      downgradeIntro:
        "Wenn ein Mandant herabgestuft wird (entweder manuell oder aufgrund von Ablauf), verfolgt das System die ursprünglichen Abonnementdetails für Audits und mögliche Wiederherstellungen. Die Felder DowngradedFromEditionId, DowngradedFromType, DowngradedFromEndDate und DowngradedAt bewahren den kompletten Downgrade-Verlauf.",
      downgradeWarning:
        "Beim Downgrade bestimmt die Überlaufrichtlinie (OverflowPolicy) der Zieledition, was mit Ressourcen geschieht, die die neuen Limits überschreiten. Verwenden Sie immer den Downgrade Impact-Endpunkt, um die Auswirkungen vorab anzuzeigen, bevor Sie Änderungen vornehmen.",
      expiryTitle: "Ablaufverhalten",
      expiryIntro:
        "Wenn ein Abonnement abläuft, bestimmt die Einstellung ExpiryBehavior, was als Nächstes passiert:",
      pricingTitle: "Mehrwährungs-Preisgestaltung",
      pricingIntro:
        "Jedes Abonnement trägt vollständige Preis-Metadaten: Währung (ISO-Code), Basisbetrag, Anpassungsbetrag, Gesamtbetrag, WechselkursZuUsd und GesamtbetragUsd. Dies ermöglicht eine präzise Umsatzverfolgung über 9+ unterstützte Währungen (USD, EUR, GBP, SAR, AED, EGP, TRY, INR und mehr).",
      exchangeRateTitle: "USD-Normalisierung",
      exchangeRateIntro:
        "Alle Beträge werden über ExchangeRateToUsd für konsistente MRR/ARR-Berichte auf USD normalisiert. Das Feld TotalAmountUsd wird zum Abonnementzeitpunkt berechnet und für historische Genauigkeit gespeichert — Wechselkursschwankungen ändern vergangene Aufzeichnungen nicht rückwirkend.",
      promotionsTitle: "Werberabatte",
      promotionsIntro:
        "Abonnements unterstützen Promo-Codes über das Feld AppliedPromoCode. Bei Anwendung einer gültigen Werbeaktion wird ein PromotionDiscount-Prozentsatz aufgezeichnet und der Anpassungsbetrag spiegelt den auf den Basisbetrag angewandten Rabatt wider. Promotionen werden pro Abonnement für Audits und Analysen verfolgt.",
      exportTitle: "Erweiterter Export & Berichterstattung",
      exportIntro:
        "Das Abonnement-Exportsystem generiert umfassende Berichte in den Formaten CSV, Excel (XLSX) und PDF. Jeder Bericht enthält ein Deckblatt mit Filter-Metadaten, farbcodierte Datentabellen und statistische Zusammenfassungen.",
      exportFiltersTitle: "Export-Filter",
      exportFiltersIntro: "Berichte unterstützen erweiterte Filterung für gezielte Analysen:",
      exportFilterDate:
        "Datumsbereich — Filterung nach Abonnement-Erstellungsdatum (letzte 7/30/90 Tage, letztes Jahr oder benutzerdefinierter Bereich)",
      exportFilterExpiring:
        "Bald ablaufend — Abonnements finden, die innerhalb von 5/7/14/30/60/90 Tagen ablaufen",
      exportFilterStatus: "Status — Aktiv, Gesperrt, Gekündigt, Abgelaufen",
      exportFilterEdition: "Edition — Filterung nach spezifischem Plan/Edition",
      exportFilterCurrency: "Währung — Beträge in ausgewählter Währung anzeigen",
      exportDaysLeftTitle: "Tage bis zum Ablauf",
      exportDaysLeftIntro:
        "Berichte enthalten eine berechnete 'Verbleibende Tage'-Spalte mit bedingter Farbcodierung: Rot (≤7 Tage), Gelb (≤30 Tage), Grün (>30 Tage). Dies ermöglicht die sofortige Identifizierung von Abonnements, die eine Verlängerung benötigen.",
      exportFormatsTitle: "Exportformat-Details",
      exportFormatCsv:
        "CSV — leichtgewichtig, in jedes Tabellenkalkulationsprogramm oder BI-Tool importierbar",
      exportFormatExcel:
        "XLSX — professionelle Excel-Arbeitsmappe mit gestalteten Kopfzeilen, Filter-Metadatenblatt, bedingter Formatierung und automatisch dimensionierten Spalten (ClosedXML)",
      exportFormatPdf:
        "PDF — druckfertiges Dokument mit markengebundenem Deckblatt, statistischer Zusammenfassung und paginierten Datentabellen (QuestPDF)",
      renewalTitle: "Verlängerung — Neuer-Zeilen-Muster (B2)",
      renewalIntro:
        "Verlängerungen erstellen eine NEUE TenantSubscription-Zeile anstatt den bestehenden Datensatz zu überschreiben (Stripe-Muster). Das alte Abonnement wird als abgelaufen markiert (IsActive=false), während eine neue Zeile mit frischer Id, StartDate=UtcNow, neu berechneter Preisgestaltung und übertragenen Aktionsdetails erstellt wird.",
      renewalAuditTitle: "Umsatz-Prüfpfad",
      renewalAuditIntro:
        "Jeder Abrechnungszeitraum erzeugt eine unveränderliche Datenbankzeile mit zum Verlängerungszeitpunkt festgeschriebenem Preis. Dies ermöglicht präzise Finanzberichte: MRR-Trends, Abwanderungsanalyse pro Zeitraum und Rückerstattungsverfolgung pro Zyklus.",
      promoExpiryTitle: "Aktionsablauf-Verfolgung (A1)",
      promoExpiryIntro:
        "Wenn eine Aktion mit DurationDays > 0 angewendet wird, berechnet das System einen PromotionExpiresAt-Zeitstempel. Bei jeder Verlängerung prüft der Handler, ob UtcNow > PromotionExpiresAt — wenn die Aktion abgelaufen ist, wird der Rabatt entfernt und NICHT in die neue Abonnementzeile übernommen.",
      concurrencyTitle: "Optimistische Nebenläufigkeit (E1)",
      concurrencyIntro:
        "Jede TenantSubscription hat einen ConcurrencyStamp (Guid) mit [ConcurrencyCheck]. Der Stempel wird bei jedem Schreibvorgang erneuert. Dies verhindert Race Conditions — z.B. gleichzeitige Kündigung + Abgleichjob — durch Auslösen einer DbUpdateConcurrencyException bei Kollisionen.",
      validationTitle: "Eingabevalidierung (G1)",
      validationIntro:
        "Alle 8 Abonnement-Befehle haben dedizierte FluentValidation-Validatoren. Validatoren verwenden ILocalizer für lokalisierte Fehlermeldungen (EN + AR). Geschäftsregeln: keine Verlängerung als Testversion, positive Rückerstattungsbeträge, Zeichenlängenbegrenzungen.",
      crossModuleTitle: "Modulübergreifende Integration (H1)",
      crossModuleIntro:
        "Abonnement-Lebenszyklus-Ereignisse veröffentlichen Domänen-Events, die vom Identitätsmodul konsumiert werden. Bei Aussetzung eines Abonnements werden alle Mandanten-Admins mit DeactivationReason='SubscriptionSuspended' deaktiviert. Bei Wiederaufnahme werden nur die durch Aussetzung deaktivierten Admins reaktiviert.",
      crossModuleReasons:
        "Drei Deaktivierungsgründe: 'Manuell' (wird nie automatisch reaktiviert), 'SubscriptionSuspended' (wird bei Wiederaufnahme reaktiviert), 'SubscriptionExpired' (wird bei Ablauf deaktiviert).",
      impactTitle: "Downgrade-Auswirkungsanalyse",
      impactIntro:
        "Bevor Sie die Edition eines Mandanten ändern, verwenden Sie den Downgrade Impact-Endpunkt, um in einer Vorschau zu sehen, welche Ressourcen überlaufen würden. Die Antwort listet jede Funktion auf, die die Limits der neuen Edition überschreiten würde, zusammen mit der aktuellen Nutzung vs. neuem Limit.",
      endpointsTitle: "API-Endpunkte",
      endpointsIntro:
        "Der Abonnements-Controller bietet 13 Endpunkte, die den gesamten Abonnement-Lebenszyklus abdecken:",
      operationsTitle: "Abonnement-Operationen",
      operationsIntro:
        "Das Abonnementmodul unterstützt ein umfassendes Set von Lebenszyklus-Operationen. Jede Operation überführt das Abonnement in einen neuen Zustand mit vollständiger Audit-Verfolgung.",
      assignTitle: "Abonnement zuweisen",
      assignIntro:
        "Erstellen Sie ein neues Abonnement, das einen Mandanten mit einer Edition verknüpft. Wenn der Mandant bereits ein aktives Abonnement hat, wird das vorherige automatisch gekündigt. Unterstützt optionale Parameter für Währung, Promo-Code und Ablaufverhalten.",
      upgradeTitle: "Upgrade & Downgrade",
      upgradeIntro:
        "Mandanten können zwischen Editionen wechseln. Upgrades werden sofort angewendet, wobei die Funktionen der neuen Edition sofort wirksam werden. Downgrades prüfen zuerst die OverflowPolicy, um Ressourcen zu handhaben, die neue Limits überschreiten.",
      trialTitle: "Testversions-Konvertierung",
      trialIntro:
        "Testabonnements haben ein TrialEndDate. Wenn eine Testversion auf einen kostenpflichtigen Plan hochgestuft wird, wird IsTrialConverted auf true gesetzt und das Abonnement wechselt zum neuen Typ. Wenn die Testversion ohne Konvertierung abläuft, bestimmt ExpiryBehavior, was als Nächstes passiert.",
      ep: {
        list: "Alle Abonnements auflisten (paginiert, filterbar nach Status/Typ/Mandant)",
        get: "Abonnementdetails nach ID abrufen",
        assign: "Ein neues Abonnement erstellen (Mandant einer Edition mit Währung/Promo zuweisen)",
        upgrade: "Auf eine höhere Edition hochstufen",
        downgrade: "Auf eine niedrigere Edition herabstufen (prüft OverflowPolicy)",
        impact: "Downgrade-Auswirkungen vor der Ausführung in der Vorschau anzeigen",
        suspend: "Abonnement sperren (Mandantenzugriff blockieren)",
        resume: "Ein gesperrtes Abonnement fortsetzen",
        cancel: "Abonnement dauerhaft kündigen",
        renew: "Ein ablaufendes Abonnement verlängern",
        tenantActive: "Das aktive Abonnement für einen bestimmten Mandanten abrufen",
        export: "Abonnements als CSV, Excel oder PDF mit erweiterten Filtern exportieren",
      },
    },
    features: {
      title: "Funktionen (Features)",
      description:
        "Steuerbare Plattformfähigkeiten mit Booleschen, Numerischen und String-Wertetypen.",
      intro:
        "Funktionen sind die atomaren Bausteine des Berechtigungssystems. Jede Funktion repräsentiert eine steuerbare Fähigkeit — einen booleschen Schalter, ein numerisches Kontingent (Quota) oder eine String-Konfiguration. Funktionen haben einen stabilen Systemschlüssel (Name), der sich nie ändert, sodass sie sicher im Code referenziert werden können.",
      entityTitle: "Funktions-Entität",
      entityIntro:
        "Eine Funktion (Feature) definiert eine steuerbare Plattformfähigkeit. Das Feld Name ist ein stabiler Systemschlüssel, der im Code verwendet wird; DisplayNameEn/DisplayNameAr sind benutzerorientierte Bezeichnungen.",
      valueTypesTitle: "Wertetypen",
      valueTypesIntro:
        "Funktionswerte werden als Strings gespeichert, aber gemäß ihrem ValueType interpretiert. Das System validiert Werte bei der Erstellung und Aktualisierung gegen den erwarteten Typ.",
      valueTypesTip:
        "Verwenden Sie für numerische Funktionen -1, um 'unbegrenzt' darzustellen. Das FeatureCheckBehavior erkennt -1 als Spezialwert und blockiert niemals Anfragen für Funktionen mit einem unbegrenzten Kontingent.",
      systemVsCustomTitle: "System- vs. Benutzerdefinierte Funktionen",
      systemVsCustomIntro:
        "NEXORA unterscheidet zwischen Systemfunktionen (beim Start geseeded, schreibgeschützt) und benutzerdefinierten Funktionen (von Administratoren via API erstellt):",
      cacheTitle: "Feature-Cache",
      cacheIntro:
        "Aufgelöste Funktionswerte werden im IFeatureCache zwischengespeichert, um Datenbankabfragen bei jeder Anfrage zu vermeiden. Der Cache wird invalidiert, wenn sich die Funktionen einer Edition ändern, ein Abonnement geändert wird oder eine Überschreibung festgelegt/entfernt wird. In Microservice-Deployments ohne das Berechtigungsmodul behandelt ein NoOpFeatureCache alle Funktionen als aktiviert.",
      requireFeatureTitle: "IRequireFeature-Schnittstelle",
      requireFeatureIntro:
        "Um einen CQRS-Befehl oder eine Abfrage hinter einer Funktion zu verbergen, implementieren Sie die IRequireFeature-Marker-Schnittstelle. Das FeatureCheckBehavior der Pipeline löst automatisch den aktuellen Wert des Mandanten auf und lehnt die Anfrage ab, wenn die Funktion deaktiviert ist.",
      requireFeatureNote:
        "IRequireFeature funktioniert sowohl für boolesche Funktionen (auf aktiviert/deaktiviert geprüft) als auch für numerische Funktionen (auf verbleibendes Kontingent geprüft). Das Behavior bestimmt die Prüfungsart automatisch anhand des Feature.ValueType.",
      contextAwareTitle: "Kontextbezogene Funktionsanzeige",
      contextAwareIntro:
        "Die Funktionsliste ist kontextbezogen. Systemadministratoren sehen den vollständigen Funktionskatalog mit CRUD-Operationen. Mandanten-Administratoren und Drill-Down-Sitzungen sehen nur die effektiven Funktionen des Mandanten (aufgelöst aus Edition + Überschreibungen) im Nur-Lese-Modus. Die gesamte Bereichseinstellung erfolgt backend-seitig über GET /features (Katalog) vs. GET /features/effective (mandantenbezogen).",
      endpointsTitle: "API-Endpunkte",
      endpointsIntro:
        "Der Features-Controller stellt 5 CRUD-Endpunkte bereit. Systemfunktionen können nicht gelöscht werden:",
      seedingTitle: "Feature-Seeding",
      seedingIntro:
        "Systemfunktionen werden beim Anwendungsstart automatisch vom EntitlementsStartupSeeder geseeded. Der Seeder prüft, ob jede Systemfunktion bereits existiert (nach Name) und erstellt nur fehlende — vorhandene Funktionen werden niemals überschrieben.",
      quotaTitle: "Kontingentverfolgung (QuotaCounter)",
      quotaIntro:
        "Numerische Funktionen unterstützen die automatische Kontingentdurchsetzung über die QuotaCounter-Entität. Das FeatureCheckBehavior vergleicht die aktuelle Nutzung mit dem ermittelten Limit für jeden IRequireFeature-Befehl, der auf eine numerische Funktion abzielt.",
      cacheNote:
        "Der Cache wird automatisch invalidiert, wenn: (1) die Funktionen einer Edition geändert werden, (2) ein Abonnement zugewiesen/geändert wird, (3) eine Überschreibung festgelegt/entfernt wird. Ein manuelles Cache-Busting ist nicht erforderlich.",
      patternTitle: "IRequireFeature-Muster",
      patternIntro:
        "Um einen beliebigen CQRS-Befehl hinter einer Funktionsprüfung zu verbergen, implementieren Sie einfach die IRequireFeature-Marker-Schnittstelle. Das FeatureCheckBehavior fängt die Anfrage automatisch ab, löst den Funktionswert des Mandanten auf und lehnt sie ab, falls deaktiviert oder über dem Kontingent.",
      ep: {
        list: "Alle Funktionen auflisten (paginiert, filterbar nach Kategorie/Typ)",
        get: "Funktionsdetails nach ID abrufen",
        create: "Eine neue benutzerdefinierte Funktion erstellen",
        update:
          "Funktions-Metadaten aktualisieren (Systemfunktionen: nur DefaultValue/Description)",
        delete:
          "Eine benutzerdefinierte Funktion weich löschen (Systemfunktionen können nicht gelöscht werden)",
      },
    },
    overrides: {
      title: "Funktions-Überschreibungen (Overrides)",
      description:
        "Mandantenspezifische Anpassung von Funktionswerten, die die Editions-Standards umgeht.",
      intro:
        "Funktions-Überschreibungen ermöglichen es Plattform-Administratoren, Funktionswerte für einzelne Mandanten anzupassen, unabhängig von ihrer abonnierten Edition. Überschreibungen haben in der Auflösungskette die höchste Priorität und eignen sich daher perfekt für maßgeschneiderte Vertriebsdeals, spezielle Werbeaktionen oder einmalige Ausnahmen.",
      entityTitle: "Override-Entität",
      entityIntro:
        "Ein TenantFeatureOverride legt einen benutzerdefinierten Wert für eine bestimmte Funktion bei einem bestimmten Mandanten fest. Er enthält ein optionales Feld 'Reason' (Grund) für Prüfzwecke.",
      priorityTitle: "Auflösungspriorität",
      priorityIntro:
        "Überschreibungen stehen ganz oben in der Auflösungskette. Wenn das System einen Funktionswert für einen Mandanten ermittelt, sucht es zuerst nach einer Überschreibung:",
      whenTitle: "Wann man Überschreibungen verwendet",
      whenIntro:
        "Überschreibungen sind für Ausnahmefälle gedacht, in denen ein Mandant einen anderen Wert benötigt, als seine Edition vorgibt:",
      useCase1:
        "Maßgeschneiderte Enterprise-Deals — 'Acme Corp 500 Administratoren statt der standardmäßigen 50 geben'",
      useCase2: "Werbeangebote — 'Premium-Chat für diesen Mandanten für 30 Tage aktivieren'",
      useCase3: "Beta-Tests — 'Das neue Rechnungsmodul für Early Adopters aktivieren'",
      useCase4: "Vorübergehende Erhöhung — 'Datei-Upload-Limit während ihrer Migration erhöhen'",
      overuseWarning:
        "Überschreibungen sollten sparsam eingesetzt werden. Wenn viele Mandanten dieselbe Überschreibung benötigen, ziehen Sie in Betracht, eine neue Edition zu erstellen. Übermäßige Überschreibungen machen das System schwerer zu verwalten und zu prüfen.",
      resolvedTitle: "Endpunkt für aufgelöste Funktionen",
      resolvedIntro:
        "Der Endpunkt GET /api/v1/tenants/{tenantId}/features/resolved gibt den endgültigen, effektiven Wert für jede Funktion eines bestimmten Mandanten zurück. Er zeigt für jeden Eintrag die Auflösungsquelle (Override, Edition oder Default) an, was das Debuggen und Auditing erleichtert.",
      endpointsTitle: "API-Endpunkte",
      endpointsIntro:
        "Der TenantFeatures-Controller stellt 4 Endpunkte zur Verwaltung von mandantenspezifischen Überschreibungen und aufgelösten Werten bereit:",
      scenariosTitle: "Anwendungsszenarien",
      scenariosIntro:
        "Die folgenden realen Szenarien zeigen, wann Überschreibungen den größten Wert bieten:",
      settingTitle: "Eine Überschreibung festlegen",
      settingIntro:
        "Um eine Überschreibung festzulegen, senden Sie einen POST an den Endpunkt für Mandantenfunktionen mit der Funktions-ID, dem benutzerdefinierten Wert und einem optionalen Grund für Prüfzwecke.",
      settingTip:
        "Geben Sie beim Festlegen von Überschreibungen immer einen Grund an — dies macht Audit-Trails aussagekräftig und hilft zukünftigen Administratoren zu verstehen, warum die Überschreibung angewendet wurde.",
      expiryTitle: "Ablaufende Überschreibungen",
      expiryIntro:
        "Überschreibungen können ein optionales ExpiresAt-Datum (Ablaufdatum) haben. Wenn das Ablaufdatum überschritten ist, wird die Überschreibung automatisch deaktiviert und die Funktion fällt auf den Editionswert (oder den globalen Standard) zurück.",
      expiryNote:
        "Abgelaufene Überschreibungen werden weich deaktiviert (IsActive = false), nicht gelöscht. Dies bewahrt den Audit-Trail und ermöglicht bei Bedarf eine erneute Aktivierung.",
      auditTitle: "Audit-Trail",
      auditIntro:
        "Jede Überschreibungsoperation wird mit vollständigen Audit-Informationen verfolgt. Das Feld 'Grund' (Reason) bei jeder Überschreibung liefert den Kontext, warum der benutzerdefinierte Wert angewendet wurde.",
      bestPracticesTitle: "Best Practices",
      bestPracticesIntro:
        "Befolgen Sie diese Richtlinien, um Ihr Überschreibungssystem wartbar und überprüfbar zu halten.",
      bestPracticesWarning:
        "Überschreibungen sollten sparsam eingesetzt werden. Wenn viele Mandanten dieselbe Überschreibung benötigen, ziehen Sie in Betracht, eine neue Edition zu erstellen. Übermäßige Überschreibungen machen das System schwerer zu verwalten und verursachen Wartungsschulden.",
      ep: {
        list: "Alle Überschreibungen für einen bestimmten Mandanten auflisten",
        set: "Eine Funktions-Überschreibung für einen Mandanten festlegen oder aktualisieren",
        remove: "Eine Funktions-Überschreibung entfernen (deaktivieren)",
        resolved:
          "Alle aufgelösten Funktionswerte für einen Mandanten abrufen (zeigt Quelle: Override/Edition/Default)",
      },
    },

    compliance: {
      overview: {
        title: "Compliance-Modul",
        description:
          "GDPR, CCPA und PDPA Compliance-Automatisierung — Richtlinien, DSR-Verarbeitung, Einwilligungsmanagement, Datenaufbewahrung, Inventar und Berichtserstellung.",
        intro:
          "Das Compliance-Modul ist die integrierte Regulierungs-Engine von NEXORA. Es hilft Betreibern und deren Mandanten, Datenschutzgesetze (GDPR, CCPA, PDPA) durch automatisierte Werkzeuge einzuhalten.",
        infoTitle: "Compliance-Hinweis",
        infoContent:
          "Das Modul ist entscheidend für die Einhaltung gesetzlicher Vorschriften und die Vermeidung von Strafen. Stellen Sie sicher, dass alle Funktionen korrekt den Datenverarbeitungsrichtlinien zugeordnet sind.",
        descDsr: "Verarbeitet Betroffenenanfragen (Export, Löschung, Berichtigung)",
        descConsent: "Unveränderliche Verfolgung von Einwilligungsstatus und Snapshots",
        descRet: "Setzt Datenlöschrichtlinien basierend auf dem Alter durch",
        descInv: "Ordnet sensible PII-Standorte modulübergreदाताओं zu",
        descRep: "Generiert RoPA- und DPIA-Compliance-Berichte",
        descId: "Identitätsmodul",
        descIdDesc: "Bietet Benutzer-/Admin-Kontext und Authentifizierung",
        descEnt: "Berechtigungsmodul",
        descEntDesc: "Steuert Compliance-Funktionen über Feature-Gates",
        conn1: "initiiert Anfragen",
        conn2: "gewährt/widerruft",
        conn3: "steuert Richtlinien",
        conn4: "leitet Löschung an",
        conn5: "zielt auf Daten",
        conn6: "Audit-Trails",
        conn7: "Audit-Trails",
        th1: "Komponente",
        th2: "Verantwortung",
        tr1_1: "DsrListViewModel",
        tr1_2:
          "Behandelt Paginierung, Filterung und Zuweisung von eingehenden Betroffenenanfragen.",
        tr2_1: "ConsentRecordView",
        tr2_2: "Rendert den unveränderlichen Einwilligungs-Snapshot zusammen mit Metadaten.",
        whatIsTitle: "Was ist das Compliance-Modul?",
        whatIsIntro:
          "Das Modul bietet sechs miteinander verbundene Subsysteme, die den gesamten Compliance-Lebenszyklus abdecken. Mandanten erhalten ein produktionsbereites System.",
        subModulesTitle: "Sechs Subsysteme",
        subModulesIntro: "Jedes Subsystem behandelt eine bestimmte Compliance-Domäne:",
        sub1: "Regulierungsprofile — Speichert die rechtlichen Rahmenbedingungen (GDPR, CCPA, PDPA).",
        sub2: "Betroffenenanfragen (DSR) — Verwaltet Anfragen zu Rechten der Betroffenen (Export, Löschung, Berichtigung, Einschränkung).",
        sub3: "Einwilligungsmanagement — Protokolliert, verfolgt und prüft die Erteilung und den Widerruf von Benutzereinwilligungen.",
        sub4: "Datenaufbewahrungsrichtlinien — Definiert, wie lange Daten aufbewahrt werden und was bei Ablauf geschieht (Löschen oder Anonymisieren).",
        sub5: "Dateninventar — Ein Register aller personenbezogenen Datenkategorien, die die Plattform verarbeitet.",
        sub6: "Compliance-Berichte — Generiert asynchrone, revisionssichere Berichte (GDPR-Übersicht, DSR-Zusammenfassung usw.).",
        backendTitle: "Backend-Architektur",
        backendIntro:
          "Folgt dem NEXORA-Standardlayout für 3-Projekt-Module (Domain / Application / Infrastructure) mit ComplianceDbContext.",
        frontendTitle: "Frontend-Architektur",
        frontendIntro:
          "Organisiert in sechs unabhängigen Submodulen unter src/modules/compliance/, die dem View/ViewModel-Muster folgen.",
        endpointsTitle: "API Endpoints Übersicht",
        endpointsIntro:
          "Alle Endpoints befinden sich unter /api/v1/compliances/ und erfordern eine Authentifizierung mit compliance.view.",
      },
      dsr: {
        title: "Betroffenenanfragen (DSR)",
        description:
          "GDPR/CCPA-Rechteanfragen verwalten — Export, Löschung, Berichtigung und Einschränkung.",
        intro:
          "Betroffenenanfragen (DSRs) sind formelle Anfragen von Einzelpersonen zur Ausübung ihrer Rechte. Das Modul bietet einen vollständigen DSR-Workflow.",
        typesTitle: "Anfragetypen",
        typesIntro: "Das System unterstützt vier DSR-Typen gemäß DSGVO-Artikel 17 und CCPA:",
        type1: "Export — Recht auf Datenübertragbarkeit. Die betroffene Person wünscht eine Kopie.",
        type2:
          "Löschung — Recht auf Vergessenwerden. Alle personenbezogenen Daten müssen gelöscht oder anonymisiert werden.",
        type3: "Berichtigung — Korrekturanfrage. Ungenaue Daten müssen aktualisiert werden.",
        type4:
          "Einschränkung — Verarbeitungsbeschränkung. Daten können gespeichert, aber nicht aktiv verarbeitet werden.",
        lifecycleTitle: "Anfrage-Lebenszyklus",
        lifecycleIntro: "DSRs durchlaufen eine definierte Reihe von Statuswerten:",
        status1: "Ausstehend (Pending) — Anfänglicher Zustand bei Erhalt.",
        status2: "In Bearbeitung (InProgress) — Ein Compliance-Beauftragter wurde zugewiesen.",
        status3: "Abgeschlossen (Completed) — Die Anfrage wurde erfüllt.",
        status4:
          "Abgelehnt (Rejected) — Die Anfrage wurde abgelehnt (z. B. unzureichende Identitätsprüfung).",
        slasTitle: "GDPR SLA-Anforderungen",
        slasIntro:
          "Gemäß Artikel 12 DSGVO müssen Verantwortliche innerhalb von 30 Tagen auf DSRs reagieren (auf 3 Monate verlängerbar). NEXORA verfolgt dies.",
        lifecycleFlowTitle: "DSR-Lebenszyklus-Flow",
        nodeSubmit: "Anfrage einreichen",
        descSubmit: "Betroffener beantragt Export, Löschung oder Berichtigung",
        nodePending: "Status: Ausstehend",
        descPending: "Anfrage wird protokolliert, SLA-Frist berechnet",
        nodeProcessing: "Status: In Bearbeitung",
        descProcessing: "DsrExecutionJob beginnt mit der Verarbeitung der Module",
        nodeApproval: "Auf Admin warten",
        descApproval: "Nukleare Aktionen (Löschung) erfordern manuelle Admin-Bestätigung",
        nodeCompleted: "Status: Abgeschlossen",
        descCompleted: "Export generiert oder Daten gelöscht; SLA erfüllt",
        nodeRejected: "Status: Abgelehnt",
        descRejected: "Anfrage vom Admin mit Lösungsnotizen abgelehnt",
        conn1: "initiiert",
        conn2: "Hintergrundjob übernimmt",
        conn3: "wenn automatisch verarbeitet (Export)",
        conn4: "wenn nuklear (Löschung)",
        conn5: "Admin bestätigt",
        conn6: "Admin lehnt ab",
        entitiesTitle: "Entitäten",
        entityName: "Entitätsname",
        entityDesc: "Beschreibung",
        entityDsrDesc: "Stellt eine Betroffenenanfrage dar.",
        entityModuleDesc: "Ausführungsstatus eines Moduls.",
        entityStatusDesc: "Verlauf der Statusänderungen.",
        codeTitle: "Code-Beispiel",
        endpointsTitle: "API Endpoints",
        endpointsIntro: "Der DSR-Controller stellt 6 Endpoints zur Verfügung:",
        ep: {
          list: "Alle DSRs auflisten (paginiert, filterbar)",
          get: "DSR-Details nach ID abrufen",
          create: "Eine neue DSR einreichen",
          updateStatus: "DSR-Status aktualisieren",
          assign: "DSR einem Compliance-Beauftragten zuweisen",
          delete: "Soft-Delete einer DSR",
        },
      },
      consent: {
        title: "Einwilligungsmanagement",
        description:
          "Einwilligungen aufzeichnen, verfolgen und prüfen für GDPR-Artikel 6 und CCPA.",
        intro:
          "Das Einwilligungsmanagement protokolliert jedes Mal, wenn ein Benutzer eine Einwilligung erteilt oder widerruft. NEXORA speichert den vollständigen Audit-Trail.",
        purposesTitle: "Zwecke der Einwilligung",
        purposesIntro: "Jeder Einwilligungsdatensatz ist an einen bestimmten Zweck gebunden:",
        purpose1: "Marketing — E-Mail-Marketing und werbliche Kommunikation.",
        purpose2: "Analyse — Nutzungsanalysen und Produktverbesserungen.",
        purpose3: "Drittanbieter — Datenfreigabe an Drittanbieter-Dienste.",
        purpose4: "Personalisierung — Personalisierte Inhalte und Empfehlungen.",
        gdprTitle: "GDPR Rechtsgrundlage",
        gdprIntro:
          "Gemäß Artikel 6 DSGVO muss die Einwilligung freiwillig, spezifisch, informiert und unmissverständlich sein. NEXORA speichert den exakten Text.",
        withdrawalTitle: "Widerruf der Einwilligung",
        withdrawalIntro:
          "Benutzer können ihre Einwilligung jederzeit widerrufen. ConsentRecord wird mit WithdrawnAt aktualisiert.",
        flowTitle: "Einwilligungs-Status-Flow",
        nodePurpose: "Zweck der Einwilligung",
        descPurpose: "Definiert, worin eingewilligt wird (z. B. Marketing)",
        nodeRecord: "Einwilligungsdatensatz",
        descRecord: "Aktueller Status des Benutzers (Erteilt/Widerrufen) pro Zweck",
        nodeSnapshot: "Einwilligungs-Snapshot",
        descSnapshot: "Unveränderliche Momentaufnahme der Erteilung/Widerrufung",
        nodeJob: "Ablauf-Job für Einwilligung",
        descJob: "Täglicher Job widerruft abgelaufene Einwilligungen",
        conn1: "Vorlagen",
        conn2: "generiert bei Änderung",
        conn3: "automatischer Widerruf bei Ablauf",
        immutabilityTitle: "Unveränderlichkeit",
        immutabilityIntro: "Einwilligungsdatensätze sind unveränderlich.",
        endpointsTitle: "API Endpoints",
        ep: {
          list: "Alle Einwilligungsdatensätze auflisten",
          get: "Einwilligungsdatensatz nach ID abrufen",
          record: "Neue Einwilligungserteilung aufzeichnen",
          withdraw: "Eine zuvor erteilte Einwilligung widerrufen",
        },
      },
      retention: {
        title: "Datenaufbewahrungsrichtlinien",
        description:
          "Definieren Sie Aufbewahrungsfristen und automatische Ablaufaktionen (Löschen oder Anonymisieren) für DSGVO-Artikel 5(1)(e).",
        intro:
          "Aufbewahrungsrichtlinien definieren, wie lange Daten aufbewahrt werden müssen. NEXORA setzt diese automatisch durch.",
        policiesTitle: "Richtlinienkonfiguration",
        policiesIntro: "Jede Richtlinie legt Folgendes fest:",
        field1: "DataCategory — Datentyp (z. B. 'Benutzerprofile').",
        field2: "RetentionDays — Wie viele Tage die Daten aufbewahrt werden müssen.",
        field3:
          "ExpiryAction — Was bei Ablauf geschieht: Delete (Löschen) oder Anonymize (Anonymisieren).",
        field4: "RegulationCode — Welche Verordnung dies erfordert (GDPR, CCPA usw.).",
        actionsTitle: "Ablaufaktionen",
        actionsIntro: "Bei Ablauf wendet NEXORA eine von zwei Aktionen an:",
        action1: "Delete — Löscht dauerhaft alle passenden Datensätze.",
        action2: "Anonymize — Ersetzt personenbezogene Daten durch pseudonyme Token.",
        automationTitle: "Automatisierte Durchsetzung",
        automationIntro:
          "Der RetentionEnforcementJob läuft täglich um 3:00 Uhr UTC und verarbeitet Richtlinien. Ein Audit-Eintrag RetentionExecution wird erstellt.",
        nodePolicy: "Aufbewahrungsrichtlinie",
        descPolicy: "Definiert Entitätstyp, Altersgrenze und Zerstörungsstrategie",
        nodeEnforcement: "Aufbewahrungs-Durchsetzungs-Job",
        descEnforcement: "Wöchentlicher Job zur Auswertung der Richtlinien",
        nodeExecution: "Aufbewahrungsausführung",
        descExecution: "Audit-Trail der Zerstörungsaktion",
        nodeAction: "Datenzerstörung",
        descAction: "Endgültige Löschung oder Anonymisierung",
        conn1: "gescannt von",
        conn2: "löst aus",
        conn3: "protokolliert",
        endpointsTitle: "API Endpoints",
        ep: {
          list: "Alle Aufbewahrungsrichtlinien auflisten",
          executions: "Verlauf der Durchsetzungsausführungen auflisten",
          update: "Eine Aufbewahrungsrichtlinie aktualisieren",
        },
      },
      inventory: {
        title: "Dateninventar",
        description:
          "Ein Register aller verarbeiteten personenbezogenen Datenkategorien — erforderlich für GDPR Artikel 30 (RoPA).",
        intro:
          "Das Dateninventar ist ein strukturiertes Register. Gemäß Artikel 30 DSGVO müssen Verantwortliche ein Verzeichnis von Verarbeitungstätigkeiten (RoPA) führen.",
        fieldsTitle: "Inventarfelder",
        fieldsIntro: "Jedes Element dokumentiert:",
        field1: "DataCategory — Lesbarer Name der Kategorie (z. B. 'E-Mail-Adressen').",
        field2:
          "LegalBasis — DSGVO-Rechtsgrundlage für die Verarbeitung (Einwilligung, Vertrag usw.).",
        field3: "DataSubjects — Wem die Daten gehören (z. B. 'Endbenutzer').",
        field4: "ProcessingPurpose — Warum die Daten verarbeitet werden (z. B. 'Marketing').",
        field5: "StorageLocation — Wo die Daten gespeichert sind (Land/Region).",
        field6: "RetentionPeriod — Wie lange die Daten aufbewahrt werden.",
        field7: "ThirdPartySharing — Ob Daten mit Dritten geteilt werden.",
        ropaTitle: "Artikel 30 Compliance",
        ropaIntro:
          "Organisationen mit 250+ Mitarbeitern müssen ein RoPA führen. Das Inventar von NEXORA dient als abfragbares RoPA für Inspektionen.",
        endpointsTitle: "API Endpoints",
        ep: {
          list: "Alle Dateninventarelemente auflisten (paginiert)",
          get: "Element nach ID abrufen",
          create: "Eine neue Datenkategorie zum Inventar hinzufügen",
          update: "Ein bestehendes Inventarelement aktualisieren",
          delete: "Ein Element aus dem Inventar entfernen",
        },
      },
      reports: {
        title: "Compliance-Berichte",
        description:
          "Asynchrone, revisionssichere Berichte generieren (GDPR-Übersicht, DSR-Zusammenfassung, Einwilligungs-Audit, Aufbewahrungsanalyse, Inventar-Export).",
        intro:
          "Compliance-Berichte sind asynchron generierte Dokumente, die revisionssichere Zusammenfassungen Ihrer Compliance-Lage bieten. Berichte werden im Hintergrund erstellt und zum Download bereitgestellt.",
        reportTypesTitle: "Berichtstypen",
        reportTypesIntro: "Fünf Berichtstypen sind verfügbar:",
        type1: "GDPR-Übersicht — Zusammenfassung des DSGVO-Compliance-Status.",
        type2:
          "DSR-Aktivitätszusammenfassung — Statistiken zu DSR-Volumen, Typen und SLA-Einhaltung.",
        type3: "Einwilligungs-Audit — Vollständiges Protokoll der Einwilligungen und Widerrufe.",
        type4: "Aufbewahrungsanalyse — Aktueller Durchsetzungsstatus aller aktiven Richtlinien.",
        type5: "Dateninventar-Export — Vollständiger Export des Dateninventars (Artikel 30 RoPA).",
        asyncTitle: "Asynchrone Generierung",
        asyncIntro:
          "Berichte werden asynchron erstellt, um HTTP-Anfragen nicht zu blockieren. Das System erstellt einen ComplianceReport (IsReady=false) und reiht den Job ein.",
        asyncTip:
          "Verwenden Sie die Schaltfläche Aktualisieren im UI, um die Bereitschaft zu prüfen (normalerweise 30-60 Sekunden).",
        downloadTitle: "Berichte herunterladen",
        downloadIntro:
          "Sobald ein Bericht bereit ist (IsReady=true), ist die DownloadUrl verfügbar. Berichte werden 90 Tage lang aufbewahrt.",
        endpointsTitle: "API Endpoints",
        ep: {
          list: "Alle Compliance-Berichte auflisten (paginiert)",
          get: "Berichtsdetails und Download-URL nach ID abrufen",
          generate: "Einen neuen Berichtsgenerierungsjob in die Warteschlange einreihen",
          download: "Die generierte Berichtsdatei herunterladen",
        },
      },
    },
  },
};

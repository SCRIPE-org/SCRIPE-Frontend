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
        "NEXORA integriert Berechtigungen über das FeatureCheckBehavior direkt in die MediatR-CQRS-Pipeline. Befehle und Abfragen, die IRequireFeature implementieren, werden automatisch überwacht — ist der ermittelte Funktionswert des Mandanten deaktiviert, wird die Anfrage abgelehnt, bevor sie den Handler erreicht.",
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
        "Das Berechtigungsmodul registriert 31 MediatR-Handler, die sich über die vier Domänen erstrecken. Jeder Befehl hat einen entsprechenden FluentValidation-Validator zur Eingabeüberprüfung.",
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
        title: "[DE] Compliance Module",
        description: "[DE] GDPR, CCPA, and PDPA compliance automation — regulations, DSR handling, consent management, data retention, inventory, and report generation.",
        intro: "[DE] The Compliance module is NEXORA's built-in regulatory compliance engine. It helps platform operators and their tenants stay compliant with major data protection laws (GDPR, CCPA, PDPA) through automated tools for managing data subject requests, consent records, retention policies, and generating audit-ready compliance reports.",
        infoTitle: "[DE] Compliance Notice",
        infoContent: "[DE] The Compliance module is critical for maintaining regulatory adherence and avoiding fines. Ensure all features are correctly mapped to data processing policies.",
        descDsr: "[DE] Handles Subject Requests (Export, Erasure, Rectification)",
        descConsent: "[DE] Immutable tracking of consent states & snapshots",
        descRet: "[DE] Enforces data destruction policies based on age",
        descInv: "[DE] Maps sensitive PII locations across modules",
        descRep: "[DE] Generates RoPA and DPIA compliance reports",
        descId: "[DE] Identity Module",
        descIdDesc: "[DE] Provides User/Admin context & Auth",
        descEnt: "[DE] Entitlements Module",
        descEntDesc: "[DE] Feature-gates compliance capabilities",
        conn1: "[DE] initiates requests",
        conn2: "[DE] grants/revokes",
        conn3: "[DE] gates policies",
        conn4: "[DE] guides erasure",
        conn5: "[DE] targets data",
        conn6: "[DE] audit trails",
        conn7: "[DE] audit trails",
        th1: "[DE] Component",
        th2: "[DE] Responsibility",
        tr1_1: "[DE] DsrListViewModel",
        tr1_2: "[DE] Handles the pagination, filtering, and assignment of incoming Data Subject Requests.",
        tr2_1: "[DE] ConsentRecordView",
        tr2_2: "[DE] Renders the immutable consent snapshot alongside user agent and timestamp metadata.",
        whatIsTitle: "[DE] What is the Compliance Module?",
        whatIsIntro: "[DE] The Compliance module provides six interconnected sub-systems that cover the full compliance lifecycle. Instead of building compliance tooling from scratch, NEXORA tenants get a production-ready system that tracks, automates, and reports on their data protection obligations.",
        subModulesTitle: "[DE] Six Sub-Systems",
        subModulesIntro: "[DE] Each sub-system handles a specific compliance domain:",
        sub1: "[DE] Regulation Profiles — Stores the regulatory frameworks (GDPR, CCPA, PDPA) that the platform operates under.",
        sub2: "[DE] Data Subject Requests (DSR) — Manages rights requests from data subjects (export, erasure, rectification, restriction).",
        sub3: "[DE] Consent Management — Records, tracks, and audits user consent grants and withdrawals.",
        sub4: "[DE] Data Retention Policies — Defines how long data is kept and what happens when it expires (delete or anonymize).",
        sub5: "[DE] Data Inventory — A registry of all personal data categories the platform processes.",
        sub6: "[DE] Compliance Reports — Generates async audit-ready reports (GDPR Overview, DSR Summary, Consent Audit, etc.).",
        backendTitle: "[DE] Backend Architecture",
        backendIntro: "[DE] The Compliance backend follows the standard NEXORA 3-project module layout (Domain / Application / Infrastructure) with a dedicated ComplianceDbContext and ComplianceController.",
        frontendTitle: "[DE] Frontend Architecture",
        frontendIntro: "[DE] The frontend is organized as six independent sub-modules under src/modules/compliance/, each with its own domain, data, and presentation layers following the View/ViewModel pattern.",
        endpointsTitle: "[DE] API Endpoints Overview",
        endpointsIntro: "[DE] All endpoints are under /api/v1/compliances/ and require authentication with the compliance.view permission.",
      },
      dsr: {
        title: "[DE] Data Subject Requests (DSR)",
        description: "[DE] Manage GDPR/CCPA rights requests — export, erasure, rectification, and restriction — with full lifecycle tracking.",
        intro: "[DE] Data Subject Requests (DSRs) are formal requests from individuals exercising their rights under data protection laws. The Compliance module provides a complete DSR workflow: submission, assignment, processing, and closure — with full audit trail and SLA tracking.",
        typesTitle: "[DE] Request Types",
        typesIntro: "[DE] The system supports four DSR types as defined by GDPR Article 17 and CCPA:",
        type1: "[DE] Export — Data portability request. The subject wants a copy of their personal data.",
        type2: "[DE] Erasure — Right to be forgotten. All personal data must be deleted or anonymized.",
        type3: "[DE] Rectification — Correction request. Inaccurate personal data must be updated.",
        type4: "[DE] Restriction — Processing restriction. Data can be retained but not actively processed.",
        lifecycleTitle: "[DE] Request Lifecycle",
        lifecycleIntro: "[DE] DSRs move through a defined set of statuses from submission to closure:",
        status1: "[DE] Pending — Initial state when the request is received.",
        status2: "[DE] InProgress — A compliance officer has been assigned and is processing the request.",
        status3: "[DE] Completed — The request has been fulfilled (data exported, erased, corrected, or restricted).",
        status4: "[DE] Rejected — The request was rejected (e.g. insufficient identity verification).",
        slasTitle: "[DE] GDPR SLA Requirements",
        slasIntro: "[DE] Under GDPR Article 12, data controllers must respond to DSRs within 30 days (extendable to 3 months for complex requests). NEXORA tracks the submission date for each DSR to help you meet these deadlines.",
        lifecycleFlowTitle: "[DE] DSR Lifecycle Flow",
        nodeSubmit: "[DE] Submit Request",
        descSubmit: "[DE] Subject requests Export, Erasure, or Rectification",
        nodePending: "[DE] Status: Pending",
        descPending: "[DE] Request is logged, SLA deadline calculated",
        nodeProcessing: "[DE] Status: Processing",
        descProcessing: "[DE] DsrExecutionJob begins processing modules via ISuspendableModule",
        nodeApproval: "[DE] Wait For Admin",
        descApproval: "[DE] Nuclear actions (Erasure) require manual admin confirmation",
        nodeCompleted: "[DE] Status: Completed",
        descCompleted: "[DE] Export generated or data erased; SLA fulfilled",
        nodeRejected: "[DE] Status: Rejected",
        descRejected: "[DE] Request denied by admin with resolution notes",
        conn1: "[DE] initiates",
        conn2: "[DE] background job picks up",
        conn3: "[DE] if auto-processed (Export)",
        conn4: "[DE] if nuclear (Erasure)",
        conn5: "[DE] admin confirms",
        conn6: "[DE] admin rejects",
        entitiesTitle: "[DE] Entities",
        entityName: "[DE] Entity Name",
        entityDesc: "[DE] Description",
        entityDsrDesc: "[DE] Represents a data subject request.",
        entityModuleDesc: "[DE] Execution state of a module.",
        entityStatusDesc: "[DE] History of status changes.",
        codeTitle: "[DE] Code Example",
        endpointsTitle: "[DE] API Endpoints",
        endpointsIntro: "[DE] The DSR controller exposes 6 endpoints for the full DSR lifecycle:",
        ep: {
          list: "[DE] List all DSRs (paginated, filterable by status/type/regulation)",
          get: "[DE] Get DSR details by ID",
          create: "[DE] Submit a new DSR",
          updateStatus: "[DE] Update DSR status (InProgress, Completed, Rejected)",
          assign: "[DE] Assign DSR to a compliance officer",
          delete: "[DE] Soft-delete a DSR",
        },
      },
      consent: {
        title: "[DE] Consent Management",
        description: "[DE] Record, track, and audit user consent grants and withdrawals for GDPR Article 6 and CCPA compliance.",
        intro: "[DE] Consent Management records every time a user grants or withdraws consent for a specific purpose (e.g. marketing emails, analytics tracking). NEXORA stores the full consent audit trail including timestamp, IP address, user agent, and the exact consent version shown.",
        purposesTitle: "[DE] Consent Purposes",
        purposesIntro: "[DE] Each consent record is tied to a specific purpose. Common purposes include:",
        purpose1: "[DE] Marketing — Email marketing and promotional communications.",
        purpose2: "[DE] Analytics — Usage analytics and product improvement.",
        purpose3: "[DE] ThirdParty — Sharing data with third-party services.",
        purpose4: "[DE] Personalization — Personalized content and recommendations.",
        gdprTitle: "[DE] GDPR Lawful Basis",
        gdprIntro: "[DE] Under GDPR Article 6, consent must be: freely given, specific, informed, and unambiguous. NEXORA records the exact consent text version shown to the user and the timestamp it was accepted, providing a legally defensible audit trail.",
        withdrawalTitle: "[DE] Consent Withdrawal",
        withdrawalIntro: "[DE] Users can withdraw consent at any time. When consent is withdrawn, the ConsentRecord is updated with WithdrawnAt timestamp. Downstream systems should be notified via domain events to stop processing data for the withdrawn purpose.",
        flowTitle: "[DE] Consent State Flow",
        nodePurpose: "[DE] Consent Purpose",
        descPurpose: "[DE] Defines what is being consented to (e.g. Marketing)",
        nodeRecord: "[DE] Consent Record",
        descRecord: "[DE] User's current state (Granted/Revoked) per purpose",
        nodeSnapshot: "[DE] Consent Snapshot",
        descSnapshot: "[DE] Immutable point-in-time capture of consent grant/revoke",
        nodeJob: "[DE] Consent Expiry Job",
        descJob: "[DE] Daily job revokes expired consents",
        conn1: "[DE] templates",
        conn2: "[DE] generates on change",
        conn3: "[DE] auto-revokes if expired",
        immutabilityTitle: "[DE] Immutability",
        immutabilityIntro: "[DE] Consent records are immutable and track integrity.",
        endpointsTitle: "[DE] API Endpoints",
        ep: {
          list: "[DE] List all consent records (paginated, filterable by purpose/status)",
          get: "[DE] Get consent record by ID",
          record: "[DE] Record a new consent grant",
          withdraw: "[DE] Withdraw a previously granted consent",
        },
      },
      retention: {
        title: "[DE] Data Retention Policies",
        description: "[DE] Define data retention periods and automated expiry actions (Delete or Anonymize) for GDPR Article 5(1)(e) compliance.",
        intro: "[DE] Data Retention Policies define how long specific categories of data must be kept and what happens when the retention period expires. NEXORA enforces these policies automatically via background jobs, removing the manual overhead of managing data lifecycles.",
        policiesTitle: "[DE] Policy Configuration",
        policiesIntro: "[DE] Each retention policy specifies:",
        field1: "[DE] DataCategory — The type of data (e.g. 'User Profiles', 'Transaction Logs', 'Consent Records').",
        field2: "[DE] RetentionDays — How many days the data must be retained.",
        field3: "[DE] ExpiryAction — What happens when the period expires: Delete or Anonymize.",
        field4: "[DE] RegulationCode — Which regulation requires this retention period (GDPR, CCPA, etc.).",
        actionsTitle: "[DE] Expiry Actions",
        actionsIntro: "[DE] When a retention period expires, NEXORA applies one of two actions:",
        action1: "[DE] Delete — Permanently removes all records matching the data category.",
        action2: "[DE] Anonymize — Replaces personally identifiable information with pseudonymous tokens, preserving aggregate analytics data.",
        automationTitle: "[DE] Automated Enforcement",
        automationIntro: "[DE] The RetentionEnforcementJob runs daily at 3:00 AM UTC, scanning all active retention policies and applying the configured expiry action to eligible records. Each enforcement run creates a RetentionExecution audit record.",
        nodePolicy: "[DE] Retention Policy",
        descPolicy: "[DE] Defines entity type, age limit, and destruction strategy",
        nodeEnforcement: "[DE] Retention Enforcement Job",
        descEnforcement: "[DE] Weekly job to evaluate policies",
        nodeExecution: "[DE] Retention Execution",
        descExecution: "[DE] Audit trail of the destruction action",
        nodeAction: "[DE] Data Destruction",
        descAction: "[DE] Hard deletion or Anonymization via ISuspendableModule",
        conn1: "[DE] scanned by",
        conn2: "[DE] triggers",
        conn3: "[DE] logs",
        endpointsTitle: "[DE] API Endpoints",
        ep: {
          list: "[DE] List all retention policies",
          executions: "[DE] List enforcement execution history",
          update: "[DE] Update a retention policy (days, action, active status)",
        },
      },
      inventory: {
        title: "[DE] Data Inventory",
        description: "[DE] A registry of all personal data categories the platform processes — required for GDPR Article 30 Records of Processing Activities (RoPA).",
        intro: "[DE] The Data Inventory is a structured registry of all personal data categories that the platform processes. Under GDPR Article 30, controllers must maintain Records of Processing Activities (RoPA) — the Data Inventory is NEXORA's implementation of this requirement.",
        fieldsTitle: "[DE] Inventory Fields",
        fieldsIntro: "[DE] Each inventory item documents:",
        field1: "[DE] DataCategory — Human-readable name of the data category (e.g. 'Email Addresses', 'Payment Information').",
        field2: "[DE] LegalBasis — The GDPR lawful basis for processing (Consent, Contract, Legal Obligation, Vital Interests, Public Task, Legitimate Interests).",
        field3: "[DE] DataSubjects — Who the data belongs to (e.g. 'End users', 'Employees', 'Customers').",
        field4: "[DE] ProcessingPurpose — Why the data is processed (e.g. 'Order fulfillment', 'Marketing', 'Legal compliance').",
        field5: "[DE] StorageLocation — Where the data is stored (country/region for cross-border transfer compliance).",
        field6: "[DE] RetentionPeriod — How long the data is retained (linked to the retention policy).",
        field7: "[DE] ThirdPartySharing — Whether the data is shared with third parties and which ones.",
        ropaTitle: "[DE] Article 30 Compliance",
        ropaIntro: "[DE] Organizations with 250+ employees or processing high-risk data must maintain a RoPA under GDPR Article 30. NEXORA's Data Inventory serves as a live, queryable RoPA that can be exported for regulatory inspections.",
        endpointsTitle: "[DE] API Endpoints",
        ep: {
          list: "[DE] List all data inventory items (paginated, searchable)",
          get: "[DE] Get item by ID",
          create: "[DE] Add a new data category to the inventory",
          update: "[DE] Update an existing inventory item",
          delete: "[DE] Remove an item from the inventory",
        },
      },
      reports: {
        title: "[DE] Compliance Reports",
        description: "[DE] Generate async audit-ready compliance reports (GDPR Overview, DSR Summary, Consent Audit, Retention Analysis, Data Inventory Export).",
        intro: "[DE] Compliance Reports are asynchronously generated documents that provide audit-ready summaries of your compliance posture. Reports are generated in the background and stored for download once ready, supporting regulatory inspections, internal audits, and executive reporting.",
        reportTypesTitle: "[DE] Report Types",
        reportTypesIntro: "[DE] Five report types are available:",
        type1: "[DE] GDPR Overview — High-level summary of GDPR compliance status across all sub-modules.",
        type2: "[DE] DSR Activity Summary — Statistics on DSR volume, types, completion rates, and SLA adherence.",
        type3: "[DE] Consent Audit — Full log of consent grants and withdrawals by purpose and time period.",
        type4: "[DE] Retention Analysis — Current enforcement status of all active retention policies.",
        type5: "[DE] Data Inventory Export — Full export of the data inventory (Article 30 RoPA).",
        asyncTitle: "[DE] Asynchronous Generation",
        asyncIntro: "[DE] Reports are generated asynchronously to avoid blocking HTTP requests for large datasets. When you request a report, the system immediately creates a ComplianceReport record with IsReady=false and queues the generation job. Poll the reports list to check when IsReady becomes true.",
        asyncTip: "[DE] Use the Refresh button in the Reports UI to poll for report readiness. Reports typically complete within 30–60 seconds for datasets up to 10,000 records.",
        downloadTitle: "[DE] Downloading Reports",
        downloadIntro: "[DE] Once a report is ready (IsReady=true), a DownloadUrl is available. The download endpoint serves the report file securely. Report files are retained for 90 days before automatic cleanup.",
        endpointsTitle: "[DE] API Endpoints",
        ep: {
          list: "[DE] List all compliance reports (paginated, filterable by type/status)",
          get: "[DE] Get report details and download URL by ID",
          generate: "[DE] Queue a new report generation job",
          download: "[DE] Download the generated report file",
        },
      },
    },
  },
};

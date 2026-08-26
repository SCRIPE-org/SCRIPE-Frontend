// FILE-EXCEPTION: file length
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
        "Das Berechtigungsmodul (Entitlements) ist SCRIPEs Engine zur Verwaltung von Plänen und Funktionen. Es definiert, welche Fähigkeiten jeder Mandant (Tenant) erhält, wie Pläne (Editionen) diese Fähigkeiten bündeln und wie Abonnements Mandanten mit Plänen verknüpfen.",
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
        "SCRIPE integriert Berechtigungen über das FeatureCheckBehavior direkt in die SCRIPE mediator-CQRS-Pipeline. Befehle und Abfragen, die IRequireFeature implementieren, werden automatisch überwacht — ist der ermittelte Funktionswert des Mandanten deaktiviert, wird die Anfrage abgelehnt, bevor sie den Handler erreicht.",
      pipelineTip:
        "Um einen Befehl hinter einer Funktion zu verbergen, implementieren Sie einfach IRequireFeature und setzen Sie RequiredFeatureName auf den stabilen Systemschlüssel der Funktion (z. B. 'Chat.Enabled'). Es ist kein zusätzlicher Code erforderlich.",
      backendTitle: "Backend-Struktur",
      backendIntro:
        "Das Berechtigungs-Backend folgt SCRIPEs standardmäßigem Clean-Architecture-Modullayout mit Domain-, Application- und Infrastructure-Schichten.",
      frontendTitle: "Frontend-Struktur",
      frontendIntro:
        "Das Frontend spiegelt das Backend mit vier Untermodulen (Editionen, Funktionen, Abonnements, Überschreibungen) wider, die alle dem SOLID View/ViewModel-Muster folgen.",
      controllersTitle: "API-Controller",
      controllersIntro:
        "Das Berechtigungsmodul stellt 31 API-Endpunkte über 4 Controller bereit, die alle mit JWT authentifiziert und durch berechtigungsbasierte Autorisierung geschützt sind.",
      noOpTitle: "NoOp-Fallback",
      noOpIntro:
        "Wenn das Berechtigungsmodul nicht geladen ist (z. B. in einem Microservice, der keine Entitlements enthält), registriert SCRIPE einen NoOpFeatureCache. Dadurch können IRequireFeature-Befehle fehlerfrei passieren — alle Funktionen werden standardmäßig als aktiviert behandelt.",
      noOpNote:
        "Das NoOp-Fallback stellt sicher, dass Module IRequireFeature ohne eine feste Abhängigkeit vom Berechtigungsmodul verwenden können. Im produktiven Monolith-Modus ist der echte FeatureCache immer verfügbar.",
      contextAwareTitle: "Kontextbezogene Bereichseinstellung",
      contextAwareIntro:
        "Alle Berechtigungsseiten (Funktionen, Editionen, Berechtigungen) sind kontextbezogen. Das Frontend erkennt, ob der Benutzer ein Systemadministrator (tenantId ist null), ein Mandanten-Administrator oder im Drill-Down-Modus ist, und ruft entsprechend verschiedene Backend-Endpunkte auf. Systemadministratoren sehen den vollständigen Katalog mit CRUD; Mandanten-Administratoren sehen nur ihre effektiven Daten im Nur-Lese-Modus.",
      resolutionTip:
        "Die Auflösungskette wird Lazy evaluiert — Werte werden nach der ersten Auflösung zwischengespeichert und invalidiert, wenn sich Abonnements, Editionen oder Überschreibungen ändern.",
      cqrsMapTitle: "CQRS Command & Query Map",
      cqrsMapIntro:
        "Das Berechtigungsmodul registriert 31 SCRIPE mediator-Handler, die sich über die vier Domänen erstrecken. Jeder Befehl hat einen entsprechenden FluentValidation-Validator zur Eingabeüberprüfung.",
      diTitle: "Dependency Injection Registrierung",
      diIntro:
        "Alle Berechtigungsdienste werden über die Erweiterungsmethode AddEntitlementsModule in DependencyInjection.cs registriert. Das Modul folgt SCRIPEs Standard-Registrierungsmuster.",
      comparisonTitle: "Mit vs. Ohne Berechtigungen",
      comparisonIntro:
        "Die folgende Tabelle zeigt die unterschiedlichen Fähigkeiten, wenn das Berechtigungsmodul aktiviert ist, im Vergleich zum Betrieb ohne dieses Modul:",
      gettingStartedTitle: "Erste Schritte",
      gettingStartedIntro:
        "Befolgen Sie diese 5 Schritte, um das Berechtigungssystem für Ihre Plattform einzurichten. Jeder Schritt baut auf dem vorherigen auf:",
      quotaGatingTitle: "Kontingentprüfung und Slot-Reservierungen",
      quotaGatingIntro:
        "Numerische Funktionen stellen Kontingente dar, die beim Erstellen von Mandantenressourcen erzwungen werden. SCRIPE verwendet ein threadsicheres, atomares Reservierungsmuster, um diese Limits zu verwalten.",
      quotaGatingNote:
        "TryReserveSlotAsync erhöht den reservierten Zähler. Der Handler bestätigt diese Reservierung bei Erfolg oder gibt sie bei Fehlschlag frei.",
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
        "SCRIPE bietet zwei Möglichkeiten, Editionsfunktionen zu aktualisieren, die jeweils für unterschiedliche Szenarien geeignet sind:",
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
        "SCRIPE unterstützt zwei Arten von Editionen: Systemeditionen, die von Plattformadministratoren erstellt werden und für alle Mandanten sichtbar sind, und Retail-Editionen, die von Reseller-Mandanten nur für deren Unter-Mandanten erstellt werden.",
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
      seededTitle: "Standardmäßige System-Editionen",
      seededIntro:
        "Die Plattform initialisiert beim Start zwei Standard-Systemeditionen über den EditionSeeder, um Standardlimits für Funktionen festzulegen.",
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
        assign:
          "Ein neues Abonnement erstellen (Mandant einer Edition mit Währung/Promo zuweisen)",
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
        "SCRIPE unterscheidet zwischen Systemfunktionen (beim Start geseeded, schreibgeschützt) und benutzerdefinierten Funktionen (von Administratoren via API erstellt):",
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
      useCase4:
        "Vorübergehende Erhöhung — 'Datei-Upload-Limit während ihrer Migration erhöhen'",
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

    // ── Plugins Module (Phase 15) ────────────────────────────
    plugins: {
      overview: {
        title: "Compliance-Modul",
        description:
          "Automatisierung der DSGVO-, CCPA- und PDPA-Konformität — Vorschriften, DSR-Bearbeitung, Einwilligungsverwaltung, Datenaufbewahrung, Inventar und Berichtserstellung.",
        intro:
          "Das Compliance-Modul ist die integrierte regulatorische Compliance-Engine von SCRIPE. Es hilft Plattformbetreibern und deren Mandanten, die wichtigsten Datenschutzgesetze (DSGVO, CCPA, PDPA) einzuhalten, indem es automatisierte Tools zur Verwaltung von Betroffenenanfragen, Einwilligungsdatensätzen und Aufbewahrungsrichtlinien sowie zur Erstellung prüfungsbereiter Compliance-Berichte bereitstellt.",
        infoTitle: "Compliance-Hinweis",
        infoContent:
          "Das Compliance-Modul ist entscheidend für die Einhaltung gesetzlicher Vorschriften und die Vermeidung von Geldbußen. Stellen Sie sicher, dass alle Funktionen korrekt den Datenverarbeitungsrichtlinien zugeordnet sind.",
        featureDsr: "Anfragen von Betroffenen (DSR)",
        featureDsrDesc:
          "Bearbeitet Anfragen von Betroffenen, einschließlich Export, Löschung, Berichtigung und Einschränkung, mit vollständiger Lebenszyklusverfolgung und SLA-Überwachung.",
        featureConsent: "Einwilligungsverwaltung",
        featureConsentDesc:
          "Unveränderliche Verfolgung von Einwilligungszuständen, Snapshots und Audit-Trails für die Konformität mit DSGVO Artikel 6 und CCPA.",
        featureRetention: "Aufbewahrungsrichtlinien",
        featureRetentionDesc:
          "Setzt Datenlöschungsrichtlinien basierend auf konfigurierbaren Aufbewahrungsfristen mit automatisierten Lösch- oder Anonymisierungsaktionen durch.",
        featureInventory: "Dateninventar",
        featureInventoryDesc:
          "Ordnet sensible PII-Standorte modulübergreifend zu — erforderlich für das DSGVO-Artikel 30 Verzeichnis von Verarbeitungstätigkeiten (RoPA).",
        featureReports: "Compliance-Berichte",
        featureReportsDesc:
          "Generiert asynchrone prüfungsbereite Berichte (DSGVO-Übersicht, DSR-Zusammenfassung, Einwilligungs-Audit, Aufbewahrungsanalyse, Dateninventar-Export).",
        featureWebhooks: "Webhook-Ereignisse",
        featureWebhooksDesc:
          "11 Echtzeit-Webhook-Ereignisse, die den DSR-Lebenszyklus, Einwilligungsänderungen, die Durchsetzung der Aufbewahrung und die Berichtserstellung abdecken.",
        descDsr: "Bearbeitet Betroffenenanfragen (Export, Löschung, Berichtigung)",
        descConsent: "Unveränderliche Verfolgung von Einwilligungszuständen & Snapshots",
        descRet: "Setzt Datenlöschungsrichtlinien basierend auf dem Alter durch",
        descInv: "Ordnet sensible PII-Standorte modulübergreifend zu",
        descRep: "Erstellt RoPA- und DPIA-Compliance-Berichte",
        descId: "Identitätsmodul",
        descIdDesc: "Stellt Benutzer-/Admin-Kontext & Authentifizierung bereit",
        descEnt: "Berechtigungsmodul",
        descEntDesc: "Steuert Compliance-Funktionen über Feature-Gates",
        conn1: "initiiert Anfragen",
        conn2: "erteilt/widerruft",
        conn3: "steuert Richtlinien",
        conn4: "leitet Löschung an",
        conn5: "zielt auf Daten ab",
        conn6: "Audit-Trails",
        conn7: "Audit-Trails",
        th1: "Komponente",
        th2: "Responsibility",
        tr1_1: "DsrListViewModel",
        tr1_2:
          "Verwaltet die Paginierung, Filterung und Zuweisung eingehender Betroffenenanfragen.",
        tr2_1: "ConsentRecordView",
        tr2_2:
          "Rendert den unveränderlichen Einwilligungs-Snapshot zusammen mit User-Agent und Zeitstempel-Metadaten.",
        whatIsTitle: "Was ist das Compliance-Modul?",
        whatIsIntro:
          "Das Compliance-Modul bietet sechs miteinander verbundene Subsysteme, die den gesamten Compliance-Lebenszyklus abdecken. Anstatt Compliance-Tools von Grund auf neu zu entwickeln, erhalten SCRIPE-Mandanten ein produktionsbereites System, das ihre Datenschutzverpflichtungen verfolgt, automatisiert und darüber berichtet.",
        subModulesTitle: "Sechs Subsysteme",
        subModulesIntro: "Jedes Subsystem verwaltet einen bestimmten Compliance-Bereich:",
        sub1: "Regulierungsprofile — Speichert die regulatorischen Rahmenbedingungen (DSGVO, CCPA, PDPA), unter denen die Plattform betrieben wird.",
        sub2: "Anfragen von Betroffenen (DSR) — Verwaltet Rechteanfragen von Betroffenen (Export, Löschung, Berichtigung, Einschränkung).",
        sub3: "Einwilligungsverwaltung — Erfasst, verfolgt und prüft die Erteilung und den Widerruf von Benutzereinwilligungen.",
        sub4: "Datenaufbewahrungsrichtlinien — Definiert, wie lange Daten aufbewahrt werden und was nach Ablauf geschieht (Löschen oder Anonymisieren).",
        sub5: "Dateninventar — Ein Register aller personenbezogenen Datenkategorien, die die Plattform verarbeitet.",
        sub6: "Compliance-Berichte — Generiert asynchrone prüfungsbereite Berichte (DSGVO-Übersicht, DSR-Zusammenfassung, Einwilligungs-Audit usw.).",
        regulationsTitle: "Unterstützte Vorschriften",
        regulationsIntro:
          "Das Compliance-Modul von SCRIPE unterstützt die Durchsetzung dieser wichtigsten Datenschutzvorschriften. Jede Vorschrift ist mit ihren SLA-Fristen und Strafstrukturen vorab eingerichtet.",
        regName: "Vorschrift",
        regRegion: "Region / Gerichtsbarkeit",
        regSla: "Antwort-SLA",
        regPenalty: "Höchststrafe",
        regGdprRegion: "Europäische Union (EU/EWR)",
        regCcpaRegion: "Kalifornien, USA",
        regLgpdRegion: "Brasilien",
        regPopiaRegion: "Südafrika",
        regPdpaRegion: "Singapur",
        backendTitle: "Backend-Architektur",
        backendIntro:
          "Das Compliance-Backend folgt dem standardmäßigen dreiphasigen SCRIPE-Modullayout (Domain / Application / Infrastructure) mit einem dedizierten ComplianceDbContext und ComplianceController.",
        cqrsTitle: "CQRS-Befehle & -Abfragen",
        cqrsIntro:
          "Das Compliance-Modul verwendet das standardmäßige SCRIPE-Mediator-CQRS-Muster. Befehle verarbeiten Schreibvorgänge und Abfragen verarbeiten Lesevorgänge, jeweils mit dedizierten FluentValidation-Validatoren.",
        cqrsType: "Typ",
        cqrsExample: "Handler",
        cqrsDesc: "Beschreibung",
        cqrsSubmit: "Reicht eine neue Betroffenenanfrage mit Validierung und SLA-Berechnung ein",
        cqrsReview:
          "Überprüft und aktualisiert den Status einer DSR (Genehmigen, Ablehnen, Abschließen)",
        cqrsConsent:
          "Erfasst eine Einwilligungserteilung mit vollständigen Audit-Metadaten (IP, User-Agent, Version)",
        cqrsRetention:
          "Aktualisiert die Konfiguration der Aufbewahrungsrichtlinie (Tage, Aktion, Aktivitätsstatus)",
        cqrsDsrList: "Listet alle DSRs mit Paginierung auf, filterbar nach Status/Typ/Vorschrift",
        cqrsConsentAnalytics: "Aggregiert Einwilligungsstatistiken nach Zweck, Status und Zeitraum",
        cqrsDashboard:
          "Gibt ein Übersichts-Dashboard mit Zählungen über alle Compliance-Subsysteme zurück",
        frontendTitle: "Frontend-Architektur",
        frontendIntro:
          "Das Frontend ist in sechs unabhängige Submodule unter src/modules/compliance/ unterteilt, die jeweils über eigene Domain-, Daten- und Präsentationsschichten verfügen und dem View/ViewModel-Muster folgen.",
        endpointsTitle: "API-Endpunkte Übersicht",
        endpointsIntro:
          "Alle Endpunkte befinden sich unter /api/v1/compliances/ und erfordern eine Authentifizierung mit der Berechtigung compliance.view.",
        apiRegList: "Listet alle für die Plattform konfigurierten Regulierungsprofile auf",
        apiDsrSubmit:
          "Reicht eine neue Betroffenenanfrage ein (Export, Löschung, Berichtigung, Einschränkung)",
        apiDsrList: "Listet alle DSRs mit Paginierung auf, filterbar nach Status/Typ/Vorschrift",
        apiDsrReview:
          "Überprüft eine DSR — genehmigen, ablehnen oder mit Lösungsnotizen als abgeschlossen markieren",
        apiConsentRecord:
          "Erfasst eine neue Einwilligungserteilung mit vollständigen Audit-Metadaten",
        apiConsentAnalytics:
          "Ruft Einwilligungsanalysen ab (Erteilungs-/Widerrufsraten nach Zweck)",
        apiRetentionList: "Listet alle Aufbewahrungsrichtlinien mit Durchsetzungsstatus auf",
        apiRetentionUpdate:
          "Aktualisiert eine Aufbewahrungsrichtlinie (Tage, Aktion, Aktivitätsstatus)",
        apiInventoryList: "Listet alle Dateninventarelemente auf (DSGVO Artikel 30 RoPA)",
        apiReportsList: "Listet alle Compliance-Berichte mit Status- und Typfiltern auf",
        apiReportDownload:
          "Lädt einen generierten Bericht im CSV-, JSON-, XLSX- oder PDF-Format herunter",
        apiReportGenerate:
          "Reiht einen neuen asynchronen Job zur Generierung von Compliance-Berichten ein",
        apiDashboard:
          "Ruft die Zusammenfassung des Compliance-Dashboards ab (Zählungen, SLA-Status, Warnungen)",
        webhooksTitle: "Webhook-Ereignisse",
        webhooksIntro:
          "Das Compliance-Modul löst 11 Echtzeit-Webhook-Ereignisse aus, die externe Systeme abonnieren können. Ereignisse werden automatisch über den ComplianceWebhookEventCatalog registriert und über die IWebhookDispatcher-Pipeline versendet.",
        webhookEvent: "Ereignisschlüssel",
        webhookCategory: "Kategorie",
        webhookDesc: "Beschreibung",
        whDsrSubmitted: "Ausgelöst, wenn eine neue Betroffenenanfrage eingereicht wird",
        whDsrStatusChanged:
          "Ausgelöst, wenn ein DSR-Status wechselt (Ausstehend → In Bearbeitung → Abgeschlossen/Abgelehnt)",
        whDsrCompleted:
          "Ausgelöst, wenn eine DSR vollständig abgeschlossen ist (Daten exportiert, gelöscht oder berichtigt)",
        whDsrErasure:
          "Ausgelöst, wenn eine Löschungs-DSR von einem Admin bestätigt wird (nukleare Aktion)",
        whDsrCancelled: "Ausgelöst, wenn eine DSR vor Abschluss abgebrochen wird",
        whConsentGranted:
          "Ausgelöst, wenn ein Benutzer seine Einwilligung für einen bestimmten Zweck erteilt",
        whConsentWithdrawn:
          "Ausgelöst, wenn ein Benutzer eine zuvor erteilte Einwilligung widerruft",
        whRetentionUpdated:
          "Ausgelöst, wenn die Konfiguration einer Aufbewahrungsrichtlinie aktualisiert wird",
        whRetentionExec:
          "Ausgelöst, wenn ein Aufbewahrungsdurchsetzungsjob die Ausführung abschließt",
        whReportGenerated:
          "Ausgelöst, wenn die Generierung eines Compliance-Berichts erfolgreich abgeschlossen wurde",
        whReportFailed: "Ausgelöst, wenn die Generierung eines Compliance-Berichts fehlschlägt",
        quickStartTitle: "Schnellstartanleitung",
        step1Title: "Compliance-Daten einspielen",
        step1Content:
          "Führen Sie den Entwicklungs-Seeder aus, um Regulierungsprofile, Muster-Einwilligungszwecke und Aufbewahrungsrichtlinien für Ihre Testumgebung zu füllen.",
        step2Title: "Regulierungsprofile konfigurieren",
        step2Content:
          "Navigieren Sie im Admin-Panel zu Compliance → Regulations. Aktivieren Sie die Vorschriften, unter denen Ihre Plattform betrieben wird (DSGVO, CCPA, PDPA). Jede Vorschrift definiert die SLA-Fristen und Strafstrukturen, die durchgesetzt werden.",
        step3Title: "Eine Test-DSR einreichen",
        step3Content:
          "Erstellen Sie eine Betroffenenanfrage, um den gesamten Lebenszyklus zu testen. Das System validiert die Anfrage, berechnet die SLA-Frist und stellt sie zur Zuweisung an einen Compliance-Beauftragten bereit.",
        step4Title: "Einwilligung erfassen & Aufbewahrung konfigurieren",
        step4Content:
          "Richten Sie Einwilligungszwecke ein (Marketing, Analysen, Dritte) und konfigurieren Sie Aufbewahrungsrichtlinien für jede Datenkategorie. Der Aufbewahrungsdurchsetzungsjob wendet automatisch die konfigurierten Aktionen an, wenn Daten das Aufbewahrungsalter überschreiten.",
        step5Title: "Compliance-Bericht generieren",
        step5Content:
          "Reihen Sie einen asynchronen Compliance-Bericht ein. Der Bericht wird im Hintergrund generiert und erscheint in der Berichtsliste, sobald er fertig ist. Laden Sie ihn im CSV-, JSON-, XLSX- oder PDF-Format herunter.",
        securityTitle: "Sicherheitsüberlegungen",
        securityIntro:
          "Compliance-Daten gehören zu den sensibelsten auf der Plattform. Alle Endpunkte sind durch JWT-Authentifizierung, rollenbasierte Autorisierung und verschlüsselte ID-Übertragung geschützt. Personenbezogene Daten in DSRs und Einwilligungsdatensätzen unterliegen Sicherheitsbeschränkungen auf Feldebene.",
        securityWarningTitle: "Datenschutz-Warnung",
        securityWarningContent:
          "Compliance-Daten enthalten personenbezogene Daten (PII). Stellen Sie sicher, dass geeignete Zugriffskontrollen, Audit-Protokollierung und Datenverschlüsselung konfiguriert sind. Legen Sie niemals rohe Compliance-Endpunkte ohne Authentifizierung offen.",
        secDoTitle: "Empfohlene Praktiken",
        secDo1: "Aktivieren Sie die Feldebenen-Sicherheit für PII-Felder in DSR-Antworten",
        secDo2: "Konfigurieren Sie Webhook-Secrets für alle Abonnements von Compliance-Ereignissen",
        secDo3:
          "Legen Sie Aufbewahrungsrichtlinien für Compliance-Daten selbst fest (Meta-Compliance)",
        secDo4: "Überprüfen Sie regelmäßig die Audit-Protokolle auf unbefugte Zugriffsversuche",
        secDontTitle: "Zu vermeidende Anti-Patterns",
        secDont1: "Legen Sie DSR-Endpunkte niemals ohne AdminOnly-Authentifizierung offen",
        secDont2:
          "Überspringen Sie niemals die Einwilligungsversionsverfolgung — dies macht den Audit-Trail ungültig",
        secDont3:
          "Löschen Sie Compliance-Datensätze niemals dauerhaft — verwenden Sie immer Soft-Delete",
        secDont4: "Umgehen Sie niemals den Webhook-Dispatcher für Compliance-Ereignisse",
      },

      dsr: {
        title: "Betroffenenrechte (DSR)",
        description: "Beschreibung",
        intro:
          "Anfragen zu Betroffenenrechten (DSRs) sind formelle Anfragen von Personen, die ihre Rechte gemäß den Datenschutzgesetzen ausüben. Das Compliance-Modul bietet einen strukturierten, vollständigen DSR-Workflow: Einreichung, Zuweisung, Überprüfung, Verarbeitung und Abschluss — mit einem vollständigen, reinen Append-Only-Audit-Trail und SLA-Verfolgung.",
        typesTitle: "Anfragetypen",
        typesIntro:
          "Das System unterstützt fünf DSR-Typen, die durch GDPR- und CCPA-Vorschriften definiert sind:",
        typesType: "Anfragetyp",
        typesDesc: "Beschreibung",
        typesGdpr: "GDPR-Referenz",
        typesAccessDesc:
          "Recht auf Auskunft (Artikel 15). Die betroffene Person fordert eine Liste der Verarbeitungszwecke, Kategorien personenbezogener Daten und Empfänger an.",
        typesExportDesc:
          "Recht auf Datenübertragbarkeit (Artikel 20). Die betroffene Person fordert eine maschinenlesbare Kopie ihrer personenbezogenen Daten an.",
        typesErasureDesc:
          "Recht auf Löschung / Recht auf Vergessenwerden (Artikel 17). Die betroffene Person fordert die dauerhafte Löschung oder Anonymisierung ihrer PII.",
        typesRectificationDesc:
          "Recht auf Berichtigung (Artikel 16). Die betroffene Person fordert die Berichtigung unrichtiger oder unvollständiger personenbezogener Daten.",
        typesRestrictionDesc:
          "Recht auf Einschränkung der Verarbeitung (Artikel 18). Die betroffene Person fordert die Aussetzung der Datenverarbeitung bei gleichzeitiger Aufrechterhaltung der Datenspeicherung.",
        lifecycleTitle: "Lebenszyklus von Anfragen",
        lifecycleIntro:
          "DSR-Tickets werden als Statusübergänge mit einem Überprüfungszyklus und Sicherheitsbestätigungsgates modelliert, um versehentliche und unwiderrufliche Löschungen zu verhindern:",
        lifecycleFlowTitle: "Lebenszyklus von DSR-Anfragen & Sicherheitsgates",
        nodeSubmit: "1. Anfrage einreichen",
        descSubmit:
          "Die Person reicht die Anfrage über SubmitDsrCommand ein. Der Status wird auf Ausstehend gesetzt und die SLA-Frist berechnet.",
        nodeReview: "2. Admin-Überprüfung",
        descReview:
          "Der Admin überprüft die Anfrage über ReviewDsrCommand und ändert den Status auf Genehmigt oder Abgelehnt.",
        nodeConfirm: "3. Löschung bestätigen",
        descConfirm:
          "Löschungsanfragen erfordern eine manuelle Bestätigung über ConfirmErasureCommand, wodurch der Wert ErasureConfirmed = true gesetzt wird.",
        nodeProcessing: "4. DSR-Ausführungsjob",
        descProcessing:
          "Der DsrExecutionJob, der alle 5 Minuten ausgeführt wird, verarbeitet bestätigte/genehmigte Anfragen in Chargen von bis zu 50 Elementen.",
        nodeCompleted: "5. Status: Abgeschlossen",
        descCompleted:
          "Erfolgreich in allen Modulen ausgeführt, wobei der Endzeitstempel gespeichert wird.",
        nodeRejected: "Status: Abgelehnt",
        descRejected:
          "Die Anfrage wird vom Admin während der Überprüfung abgelehnt. Die Lösungsnotizen werden gespeichert.",
        nodeCancelled: "Status: Storniert",
        descCancelled:
          "Ausstehende, in Überprüfung befindliche oder genehmigte Anfragen können jederzeit manuell storniert werden.",
        nodePartial: "6. Teilweise abgeschlossen",
        descPartial:
          "Wenn ein Modul fehlschlägt, wechselt DSR zu TeilweiseAbgeschlossen und erhöht den Zähler RetryCount (max 3).",
        connSubmitReview: "Weist zu und wechselt zu InÜberprüfung",
        connReviewApprove: "Genehmigt die Anfrage",
        connReviewReject: "Lehnt die Anfrage ab",
        connApproveConfirm: "Erforderlich für Löschung",
        connConfirmExec: "Übernimmt zur Verarbeitung",
        connExecComplete: "Alle Module sind erfolgreich",
        connExecPartial: "Ein Modul schlägt fehl",
        connPartialRetry: "Wiederholt fehlgeschlagene Module",
        connCancel: "Storniert die Anfrage",
        executionFlowTitle: "Ausführungsfluss der DSR-Anonymisierung",
        nodeExecJob: "DsrExecutionJob-Auslösung",
        descExecJob:
          "Wird alle 5 Minuten ausgeführt und ruft genehmigte Löschungsanfragen ab, die zur Verarbeitung bereit sind.",
        nodeCheckSafety: "Sicherheitskontrollgate",
        descCheckSafety:
          "Überprüft, ob ErasureConfirmed = true und ob die Kulanzzeit von ErasureExecuteAfter abgelaufen ist.",
        nodeGenToken: "Anonymisierungstoken generieren",
        descGenToken:
          "Generiert ein sicheres SHA-256-Anonymisierungstoken basierend auf der Betroffenen-ID.",
        nodeFanOut: "Modul-Verteilung",
        descFanOut:
          "Durchläuft alle registrierten Compliance-Anbieter, die IUserDataAnonymizer implementieren.",
        nodeModuleExec: "Speicherallokationsfreie Ausführung",
        descModuleExec:
          "Führt Datenbankaktualisierungen über ExecuteUpdateAsync von EF Core aus, um PII-Felder zu löschen.",
        nodeEvalStatus: "Ergebnisse auswerten",
        descEvalStatus: "Überprüft die Modulausführungsberichte, um den Erfolg zu bestätigen.",
        nodeComplete: "Status festlegen: Abgeschlossen",
        descComplete:
          "Das DSR-Ticket wird als Abgeschlossen markiert und der Zeitstempel CompletedAt gespeichert.",
        nodePartialLimit: "Status festlegen: Teilweise abgeschlossen",
        descPartialLimit:
          "Protokolliert den Fehler, erhöht RetryCount und stellt fehlgeschlagene Module zur Wiederholung in die Warteschlange (max 3).",
        connJobCheck: "ruft die Charge ab",
        connCheckGen: "wenn Sicherheitsgates passiert wurden",
        connGenFan: "erzeugt das Token",
        connFanMod: "ruft die Anonymisierer auf",
        connModEval: "sammelt die Statusinformationen",
        connEvalComplete: "wenn alle erfolgreich waren",
        connEvalPartial: "wenn eines fehlschlägt",
        slaTitle: "SLA-Verfolgung und Fristberechnungen",
        slaIntro:
          "Compliance-Vorschriften schreiben strenge Antwortzeiten vor. SCRIPE berechnet und verfolgt SLA-Metriken automatisch auf dem Admin-Dashboard:",
        slaWarningTitle: "SLA-Fristlogik",
        slaWarningContent:
          "Fristen werden bei der Einreichung berechnet, indem das aktive RegulationProfile gelesen wird (GDPR: 30 Tage, CCPA: 45 Tage). Der SLA-Fortschritt wird dynamisch als Prozentsatz berechnet: (Aktuelle Zeit - CreatedAt) / (Frist - CreatedAt) * 100.",
        escalationTitle: "Eskalations-Engine und Warnungen",
        escalationIntro:
          "Der DsrEscalationJob wird täglich um 08:00 UTC ausgeführt, um den SLA-Verbrauch zu bewerten und überfällige Tickets zu eskalieren:",
        escalationTier1:
          "Stufe 1 (50% des SLA) — Standard-Erinnerungswarnung, die an den zugewiesenen Admin gesendet wird. Protokolliert den Statushistorien-Eintrag: [SLA-ESCALATION-50%].",
        escalationTier2:
          "Stufe 2 (75% des SLA) — Warnungseskalation. Protokolliert den Statushistorien-Eintrag: [SLA-ESCALATION-75%] und löst den Webhook compliance.dsr_sla_escalated aus.",
        escalationTier3:
          "Stufe 3 (90% des SLA) — Kritische Eskalation. Protokolliert den Statushistorien-Eintrag: [SLA-ESCALATION-90%], warnt Systemmanager und sendet kritischen Webhook.",
        providerTitle: "Erweiterbare Anbieterarchitektur",
        providerIntro:
          "Um eine lose Kopplung beizubehalten, kommuniziert das Compliance-Modul mit anderen Modulen über die Abstraktionen IUserDataProvider und IUserDataAnonymizer:",
        providerIdentityTitle: "Integration des Identitätsmoduls",
        providerIdentityContent:
          "IdentityUserDataProvider exporter profile-Metadaten, aktive Login-Sitzungen und verknüpfte externe Logins. IdentityUserDataAnonymizer verwendet leistungsstarke, speicherallokationsfreie Datenbankaktualisierungen, um Namen durch das Anonymisierungstoken zu ersetzen, E-Mails als {token}@anonymized.invalid zu formatieren, Telefonnummern auf null zu setzen und aktive Sitzungs-IPs als 'ANONYMIZED' zu markieren.",
        providerComplianceTitle: "Integration des Compliance-Moduls",
        providerComplianceContent:
          "ComplianceUserDataProvider exportiert Anfrageprotokolle und Einwilligungseinträge. ComplianceUserDataAnonymizer löscht persönliche Informationen aus früheren DSRs (SubjectEmail und RequesterNotes) und Einwilligungsprotokollen (IpAddress und UserAgent).",
        entitiesTitle: "Entitätsreferenz",
        entityName: "Entitätsname",
        entityDesc: "Beschreibung",
        entityDsrDesc:
          "Repräsentiert eine Betroffenenanfrage, die Typ, Status, SLA-Frist und Ausführungsparameter enthält.",
        entityModuleDesc:
          "Verfolgt den Ausführungsstatus und die Wiederholungsversuche der verteilten DSR-Ausführung für jeden Modulanbieter.",
        entityStatusDesc:
          "Reines Append-Only-Register zur Verfolgung von DSR-Statusübergängen, Lösungsnotizen und SLA-Eskalationen.",
        codeTitle: "Code-Implementierung",
        endpointsTitle: "API-Endpunkte",
        endpointsIntro:
          "Der DSR-Controller macht die folgenden Endpunkte für die Einreichung, Überprüfung und Ausführungssteuerung von Anfragen verfügbar:",
        ep: {
          list: "Alle DSR auflisten (paginiert, filterbar nach Status/Typ/Verordnung)",
          get: "DSR-Details nach ID abrufen",
          create: "Neue DSR einreichen (berechnet SLA-Frist)",
          updateStatus: "DSR-Status aktualisieren (InBearbeitung, Abgeschlossen, Abgelehnt)",
          assign: "DSR einem Compliance-Beauftragten zuweisen",
          delete: "DSR vorübergehend löschen (soft-delete)",
          confirm:
            "Ausdrückliche Bestätigung einer genehmigten Löschungs-DSR zur Freigabe der Ausführung",
        },
        field: "Feld",
        type: "Typ",
        fId: "Eindeutiger Bezeichner für die DSR-Anfrage.",
        fTenantId: "Fremdschlüssel, der auf den Mandantenkontext verweist.",
        fSubjectEmail: "E-Mail-Adresse der betroffenen Person (wird bei Löschung anonymisiert).",
        fRequestType: "DSR-Typ (Auskunft, Export, Löschung, Berichtigung, Einschränkung).",
        fStatus: "Aktueller Lebenszyklusstatus der Anfrage.",
        fDeadline: "Berechnete SLA-Antwortfrist.",
        fErasureConfirmed: "Logisches Flag zur Freigabe von Löschungsanfragen für Hintergrundjobs.",
        fErasureExecuteAfter: "Ausführungsschwelle, die die adaptive Kulanzzeit erzwingt.",
        fExportFileUrl: "URL zum Herunterladen der gepackten Exportdaten.",
        fAssignedTo: "Fremdschlüssel, der auf den zugewiesenen Admin-Benutzer verweist.",
        fRetryCount:
          "Aktuelle Anzahl der Wiederholungsversuche für fehlgeschlagene Modulausführungen.",
        fCompletedAt: "Zeitstempel, der angibt, wann die DSR abgeschlossen wurde.",
        quickStartTitle: "Schnellstartanleitung",
        step1Title: "Compliance-Profile seeden",
        step1Content:
          "Führen Sie den Entwicklungs-Seeder aus, um GDPR- und CCPA-Verordnungsprofile mit SLA-Tagen zu füllen.",
        step2Title: "Betroffenenanfrage einreichen",
        step2Content:
          "Verwenden Sie den POST-Endpunkt, um eine neue Anfrage zu protokollieren. Das System überprüft die Eingabebeschränkungen und berechnet die Frist.",
        step3Title: "Überprüfen und genehmigen",
        step3Content:
          "Der zugewiesene Compliance-Beauftragte überprüft das Ticket. Die Genehmigung einer Löschungs-DSR legt die Kulanzzeit fest und wartet auf die endgültige Bestätigung.",
        executionFlowIntro:
          "Die Ausführung von Löschungsanfragen anonymisiert personenbezogene Daten asynchron über Module hinweg mittels verteilter Anbieter-Implementierungen:",
      },
      consent: {
        title: "Einwilligungsverwaltung",
        description: "Beschreibung",
        intro:
          "Die Einwilligungsverwaltung bietet eine unveränderliche Aufzeichnung der Einwilligungsstatus von Benutzern. Um performante Abfragen bei gleichzeitig rechtlich robuster Revisionssicherheit zu gewährleisten, verwendet SCRIPE eine Zwei-Tabellen-Architektur, aufgeteilt in ein reines Append-Only-Transaktionsregister und eine zwischengespeicherte materialisierte Ansicht.",
        purposesTitle: "Einwilligungszwecke und -einstellungen",
        purposesIntro:
          "Die Einwilligungsverfolgung wird durch globale Profile und strukturierte Einwilligungszwecke geregelt, die beim Anwendungsstart geseedet werden:",
        purposesKey: "Zweckschlüssel",
        purposesBasis: "Rechtsgrundlage",
        purposesRequired: "Erforderlich",
        purposesSort: "Sortierreihenfolge",
        purposesActive: "Aktiv",
        purposesEssentialDesc:
          "Wesentliche Funktionen, die für den Betrieb der Plattform erforderlich sind. (Erforderlich, vertragliche Rechtsgrundlage).",
        purposesMarketingDesc:
          "Werbe-Newsletter, E-Mails und Kampagnenkommunikation. (Optional, Einwilligung als Rechtsgrundlage).",
        purposesAnalyticsDesc:
          "Nutzungsanalysen, Verfolgung des Benutzerverhaltens und Produktverbesserungs-Telemetrie. (Optional, Einwilligung als Rechtsgrundlage).",
        basisContract: "Vertrag",
        basisConsent: "Einwilligung",
        basisLegitimate: "Berechtigtes Interesse",
        basisObligation: "Rechtliche Verpflichtung",
        flowTitle: "Erfassungs- und Überprüfungsfluss der Einwilligung",
        nodeSubmit: "Einwilligungseinreichung",
        descSubmit:
          "Der Benutzer aktualisiert seine Einstellungen oder reicht ein Einwilligungsformular ein.",
        nodeValidate: "FluentValidation-Prüfung",
        descValidate:
          "Validiert regulatorische Einschränkungen und die Syntax des Zweckschlüssels.",
        nodeLedger: "Registereintrag hinzufügen",
        descLedger:
          "Schreibt eine unveränderliche ConsentRecord-Transaktion mit IP-Adresse, User Agent, Version und Aktion.",
        nodeUpsert: "Instantane Aktualisierung",
        descUpsert:
          "Materialisiert den aktuellen Status im ConsentSnapshot-Cache für performante Berechtigungsprüfungen.",
        nodeEvents: "Domänenereignisse",
        descEvents: "Veröffentlicht ConsentGrantedEvent oder ConsentWithdrawnEvent über MediatR.",
        nodeExpiry: "Einwilligungsablaufjob",
        descExpiry:
          "Der wöchentliche Hintergrundjob analysiert Versionsunterschiede und markiert veraltete Aufzeichnungen für die erneute Einwilligung.",
        connSubmitValidate: "übermittelt Details an",
        connValidateLedger: "fügt Transaktion hinzu, wenn gültig",
        connLedgerUpsert: "aktualisiert den aktuellen Cache-Status aus",
        connUpsertEvents: "verteilt Ereignisse bei Erfolg",
        connExpiryUpsert: "markiert RequiresReConsent = true in",
        immutabilityTitle: "Zwei-Tabellen-Datenbankarchitektur",
        immutabilityIntro:
          "Um sowohl Datenbankleistung als auch Compliance-Revisionssicherheit zu garantieren, trennt die Einwilligungsverfolgung schreibintensive Transaktionen von leseintensiven Autorisierungsprüfungen:",
        entitiesTitle: "Entitätsreferenz",
        entitiesIntro:
          "Die folgenden Tabellen definieren die Schemaeigenschaften für das Append-only-Register und die Snapshots des aktuellen Cache-Status:",
        field: "Feld",
        type: "Typ",
        fId: "Eindeutiger Bezeichner für den Datensatz.",
        fTenantId: "Fremdschlüssel, der auf den Mandantenkontext verweist.",
        fSubjectId: "Fremdschlüssel, der auf die betroffene Person (Benutzer) verweist.",
        fPurposeId: "Fremdschlüssel, der auf die ConsentPurpose-Konfiguration verweist.",
        fAction: "Erfasste Einwilligungserteilung oder -widerruf (Erteilt oder Widerrufen).",
        fCurrentAction:
          "Letzter zwischengespeicherter Einwilligungsstatus für Betroffenen und Zweck.",
        fRequiresReConsent:
          "Flag, das angibt, dass der Benutzer aufgrund eines Richtlinien-Versionsupdates erneut einwilligen muss.",
        fLastUpdatedAt: "Zeitstempel, der die letzte Änderung des Snapshots darstellt.",
        fRecordedAt: "Zeitstempel, der angibt, wann die Registertransaktion stattgefunden hat.",
        fIpAddress: "Bei der Registrierung erfasste Client-IP-Adresse.",
        fUserAgent: "Bei der Registrierung erfasster Browser-User-Agent.",
        fRegulationBasis:
          "Regulatorischer Kontext (GDPR, CCPA), der bei der Einreichung aktiv war.",
        fCollectionMethod: "Methode zur Einwilligungserfassung (Webformular, Mobile App, API).",
        fConsentVersion:
          "Version des Einwilligungsrichtlinien-Dokuments, die bei der Einreichung aktiv war.",
        bestPracticesTitle: "Empfehlungen",
        doTitle: "Empfohlene Praktiken",
        dontTitle: "Zu vermeidende Praktiken",
        do1: "Überprüfen Sie, ob der Zweckschlüssel mit dem kleingeschriebenen alphanumerischen Regex-Muster übereinstimmt.",
        do2: "Führen Sie den wöchentlichen ConsentExpiryJob immer aus, um die erneute Einwilligung bei Versionsupdates zu erzwingen.",
        do3: "Nutzen Sie MediatR ConsentWithdrawnEvents, um die nachgelagerte Datenverarbeitung einzuschränken.",
        dont1:
          "Ändern Sie ConsentRecord-Zeilen niemals direkt, um den unveränderlichen Revisionspfad nicht zu beschädigen.",
        dont2:
          "Führen Sie keine direkten SQL-Abfragen auf ConsentRecord für Berechtigungsprüfungen im Frontend aus; lesen Sie immer ConsentSnapshot.",
        dont3:
          "Geben Sie ungeschützte Endpunkte zur Einwilligungserfassung niemals unauthentifiziert frei.",
        endpointsTitle: "API-Endpunkte",
        ep: {
          list: "Alle Registerdatensätze auflisten (nur Admins, filterbar mit Paginierung)",
          get: "Datensatzdetails nach ID abrufen",
          record: "Neue Einwilligungserteilung oder -widerruf aufzeichnen (Benutzer/Admin)",
          withdraw: "Zuvor erteilte Einwilligung widerrufen (Benutzer/Admin)",
          getMy: "Aktive Einwilligungssnapshots des aktuell authentifizierten Benutzers abrufen",
          analytics: "Einwilligungsstatistiken nach Zweck und Status abrufen (nur Admins)",
        },
        entitiesLedgerTitle: "ConsentRecord (Append-Only-Register)",
        entitiesSnapshotTitle: "ConsentSnapshot (Materialisierte Cache-Ansicht)",
        epWithdraw: "Zuvor erteilte Einwilligung widerrufen",
      },

      retention: {
        title: "Datenaufbewahrungsrichtlinien",
        description:
          "Definieren Sie Aufbewahrungsfristen und automatische Ablaufaktionen (Löschen oder Anonymisieren) für DSGVO-Artikel 5(1)(e).",
        intro:
          "Aufbewahrungsrichtlinien definieren, wie lange Daten aufbewahrt werden müssen. SCRIPE setzt diese automatisch durch.",
        policiesTitle: "Richtlinienkonfiguration",
        policiesIntro: "Jede Richtlinie legt Folgendes fest:",
        field1: "DataCategory — Datentyp (z. B. 'Benutzerprofile').",
        field2: "RetentionDays — Wie viele Tage die Daten aufbewahrt werden müssen.",
        field3:
          "ExpiryAction — Was bei Ablauf geschieht: Delete (Löschen) oder Anonymize (Anonymisieren).",
        field4: "RegulationCode — Welche Verordnung dies erfordert (GDPR, CCPA usw.).",
        actionsTitle: "Ablaufaktionen",
        actionsIntro: "Bei Ablauf wendet SCRIPE eine von zwei Aktionen an:",
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
          "Organisationen mit 250+ Mitarbeitern müssen ein RoPA führen. Das Inventar von SCRIPE dient als abfragbares RoPA für Inspektionen.",
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
        type5:
          "Dateninventar-Export — Vollständiger Export des Dateninventars (Artikel 30 RoPA).",
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
    hrms: {
      overview: {
        title: "HRMS-Modul",
        description:
          "Human Resource Management System zur Verwaltung von Mitarbeiterprofilen, Beschäftigungsverhältnissen, Qualifikationen, Zertifizierungen, Verfügbarkeit und Zuweisungen.",
        intro:
          "Das HRMS-Modul ist die Quelle der Wahrheit für die Belegschaftsressourcen der Plattform. Es verwaltet Mitarbeiterprofile, Beschäftigungsnachweise, Qualifikationen, professionelle Zertifizierungen, Verfügbarkeiten und Zuweisungen.",
        infoTitle: "Designprinzip",
        infoContent:
          "HRMS-Datensätze verweisen auf Identity-Akteure über stabile ID-Referenzen, nicht über Datenbank-Fremdschlüssel.",
        whatIsTitle: "Was ist HRMS?",
        whatIsIntro: "Es ist der administrative Kern für Manager, Trainer und Mitarbeiter.",
        featureStaff: "Mitarbeiterprofile",
        featureStaffDesc:
          "Persönliche und berufliche Details, einschließlich Notfallkontakte und Beschäftigungsstatus.",
        featureCompliance: "Qualifikationen & Zertifizierungen",
        featureComplianceDesc:
          "Zweisprachige Zertifikate, Überprüfungsdaten und Compliance-Validierung.",
        modelTitle: "Datenmodell",
        modelIntro:
          "Verwaltet Entitäten wie StaffMember, EmploymentRecord, Qualification, Certification, StaffAvailability und StaffAssignment.",
        permsTitle: "Berechtigungen",
        permsIntro:
          "Der Zugriff wird über Berechtigungen gesteuert: hrms.staff.view, hrms.staff.create, hrms.staff.update und hrms.staff.delete.",
      },
    },
    partyKernel: {
      overview: {
        title: "Party-Kernel-Modul",
        description:
          "Das zentrale Geschäftsverzeichnis zur Verwaltung von Personen, Organisationen, Kontaktpunkten, Beziehungen und Zusammenführungskandidaten.",
        intro:
          "Das Party-Kernel-Modul ist das primäre Register für Geschäftsentitäten wie Personen und Organisationen, deren Kontaktdaten und Beziehungen.",
        infoTitle: "Designprinzip",
        infoContent:
          "Party Kernel verwendet ein neutrales Schema, das alle Geschäftsakteure (Kunden, Vormünder, Mitarbeiter) als generische Parteien darstellt.",
        whatIsTitle: "Was ist Party Kernel?",
        whatIsIntro: "Es bildet die Grundlage für CRM und Abrechnung.",
        featureParties: "Generische Parteien",
        featurePartiesDesc:
          "Einheitliche Darstellung von Einzelpersonen und juristischen Personen.",
        featureMerge: "Datenbereinigung",
        featureMergeDesc:
          "Identifiziert doppelte Datensätze und erleichtert deren saubere Zusammenführung.",
        modelTitle: "Datenmodell",
        modelIntro:
          "Verwaltet Entitäten wie Party, PartyPerson, PartyOrganization, PartyRole, PartyRelationship und ContactPoint.",
        permsTitle: "Berechtigungen",
        permsIntro: "Geschützt durch party.view, party.create, party.update und party.delete.",
      },
    },
    organizationCore: {
      overview: {
        title: "Organization-Core-Modul",
        description:
          "Definiert die physische und rechtliche Hierarchie der Mandanten, einschließlich Geschäftseinheiten, Niederlassungen, Standorten und Abteilungen.",
        intro: "Organization Core modelliert das Organigramm und die Anlagentopologie.",
        infoTitle: "Designprinzip",
        infoContent:
          "Die Organisationsstruktur ist hierarchisch aufgebaut und ermöglicht Eltern-Kind-Beziehungen.",
        whatIsTitle: "Was ist Organization Core?",
        whatIsIntro: "Es strukturiert, wo und wie Geschäfte getätigt werden.",
        featureStructure: "Organisationshierarchie",
        featureStructureDesc:
          "Flexible Verschachtelung von juristischen Personen, Niederlassungen und Abteilungen.",
        featureNodes: "Stabile Referenzen",
        featureNodesDesc:
          "Stabile Organisations-IDs werden von Planungs- und Buchungsmodulen referenziert.",
        modelTitle: "Datenmodell",
        modelIntro: "Verwaltet Entitäten wie BusinessUnit, Branch, Site und Department.",
        permsTitle: "Berechtigungen",
        permsIntro:
          "Verwaltet über organization.view, organization.create, organization.update und organization.delete.",
      },
    },
    customFields: {
      overview: {
        title: "Modul für benutzerdefinierte Felder",
        description:
          "Mandantenkonfigurierbare Definitionen benutzerdefinierter Felder, die per stabilem Schlüssel an jeden registrierten Entitätstyp angehängt werden — ohne Schemaänderungen, ohne modulübergreifende Kopplung.",
        intro:
          "Das Modul für benutzerdefinierte Felder ermöglicht es jedem Mandanten, die Datensätze der Plattform um eigene typisierte Felder zu erweitern — zum Beispiel eine „Konfektionsgröße\" bei einer Person oder einen „bevorzugten Fuß\" bei einem Spieler — ganz ohne Datenbankmigration oder Codeänderung. Feldefinitionen sind mandantenbezogen und werden über das modulübergreifende Entitätstyp-Register an eine Basis-Entität angehängt, nicht über einen Fremdschlüssel, sodass sich das Modul niemals an das Schema eines anderen Moduls koppelt.",
        infoTitle: "Designprinzip",
        infoContent:
          'Benutzerdefinierte Felder werden über einen stabilen Entitätstyp-Schlüssel angehängt (z. B. "party.person") und gegen das Entitätstyp-Register validiert, nicht über einen Datenbank-Fremdschlüssel. Das hält das Modul vollständig entkoppelt und sicher unabhängig weiterentwickelbar.',
        whatIsTitle: "Was sind benutzerdefinierte Felder?",
        whatIsIntro:
          "Ein benutzerdefiniertes Feld ist eine vom Mandanten definierte Erweiterung einer bestehenden Entität. Jede Definition trägt einen maschinellen Schlüssel (eindeutig je Mandant und Entitätstyp), zweisprachige Beschriftungen, einen Werttyp, ein optionales Pflichtfeld-Flag, eine optionale Liste zulässiger Optionen für Auswahlfelder sowie eine Sortierreihenfolge. Werte werden typisiert gespeichert statt in einem untypisierten JSON-Blob.",
        featureTenant: "Mandantenbezogen",
        featureTenantDesc:
          "Jede Definition gehört einem Mandanten und wird durch den globalen Mandanten-Abfragefilter isoliert. Systemweite (gemeinsame) Definitionen werden für Plattformbetreiber unterstützt.",
        featureRegistry: "Registerbasierte Anbindung",
        featureRegistryDesc:
          "Felder werden über ihren kanonischen Entitätstyp-Schlüssel an eine Basis-Entität angehängt, validiert gegen das modulübergreifende Entitätstyp-Register — niemals über einen Fremdschlüssel.",
        featureTyped: "Typisierte Werte",
        featureTypedDesc:
          "Jedes Feld deklariert einen von zweiundzwanzig Werttypen — von einfachem Text und Zahlen über Referenzen bis hin zu einer hochgeladenen Datei oder einem Bild sowie formatiertem Rich-Text —, wodurch ein untypisierter Metadaten-Blob vermieden und eine ordnungsgemäße Validierung ermöglicht wird.",
        featureIsolation: "Unveränderliche Schlüssel",
        featureIsolationDesc:
          "Der Entitätstyp-Schlüssel und der maschinelle Schlüssel sind nach der Erstellung unveränderlich, sodass bereits gespeicherte Werte adressierbar bleiben; nur Anzeige- und Verhaltensmetadaten können bearbeitet werden.",
        valueTypesTitle: "Werttypen",
        valueTypesIntro:
          "Zweiundzwanzig Werttypen werden durchgängig unterstützt — die vollständige Liste findet sich auf der Seite „Werttypen\" der Bedienerdokumentation. Auswahl- und Mehrfachauswahlfelder tragen eine durch Zeilenumbrüche getrennte Liste zulässiger Optionen; andere Typen dürfen keine Optionen tragen. Die API erzwingt dies sowohl bei der Erstellung als auch bei der Aktualisierung.",
        modelTitle: "Datenmodell",
        modelIntro:
          "Ein CustomField trägt: EntityTypeKey (registriert), Key (maschineller Schlüssel, eindeutig je Mandant + Entitätstyp), LabelEn / LabelAr, ValueType, IsRequired, Options (nur Auswahl), SortOrder und IsActive. Die Eindeutigkeit wird je (TenantId, EntityTypeKey, Key) erzwungen.",
        isolationTitle: "Mandantenisolation",
        isolationIntro:
          "Lesevorgänge laufen unter dem globalen Mandantenfilter des Moduls, sodass ein Mandant nur seine eigenen Definitionen sowie gemeinsame systemweite sieht. Die Erstellung stempelt automatisch den aktuellen Mandanten. Aktualisierung und Löschung erzwingen eine Eigentümerprüfung, sodass ein Mandanten-Administrator niemals eine gemeinsame oder die Definition eines anderen Mandanten ändern oder entfernen kann.",
        isolationWarnTitle: "Systemweite Felder",
        isolationWarnContent:
          "Definitionen ohne Mandanten gelten als gemeinsam/global und sind für jeden Mandanten sichtbar. Nur Systemprinzipale (ohne Mandantenkontext) dürfen sie ändern oder löschen; mandantenbezogene Administratoren werden durch die Eigentümerprüfung blockiert.",
        permsTitle: "Berechtigungen",
        permsIntro:
          "Das Modul besitzt die Ressource custom-fields mit den Standard-CRUD-Aktionen: custom-fields.view, custom-fields.create, custom-fields.update und custom-fields.delete.",
      },
    },
  },
};

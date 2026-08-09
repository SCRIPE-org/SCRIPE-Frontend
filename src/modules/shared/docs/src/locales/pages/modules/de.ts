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
        "Das Berechtigungssystem besteht aus vier miteinander verbundenen DomÃ¤nen, die zusammenarbeiten, um eine vollstÃ¤ndige Feature-Gating-LÃ¶sung zu bieten.",
      domainsTitle: "Vier DomÃ¤nen",
      domainsIntro: "Jede DomÃ¤ne behandelt einen bestimmten Aspekt des Berechtigungslebenszyklus:",
      resolutionTitle: "AuflÃ¶sungskette fÃ¼r Funktionswerte",
      resolutionIntro:
        "Wenn das System einen Funktionswert fÃ¼r einen Mandanten ermitteln muss, folgt es einer strikten PrioritÃ¤tskette. Die Quelle mit der hÃ¶chsten PrioritÃ¤t, die einen Wert liefert, gewinnt.",
      pipelineTitle: "Pipeline-Integration",
      pipelineIntro:
        "SCRIPE integriert Berechtigungen Ã¼ber das FeatureCheckBehavior direkt in die SCRIPE mediator-CQRS-Pipeline. Befehle und Abfragen, die IRequireFeature implementieren, werden automatisch Ã¼berwacht — ist der ermittelte Funktionswert des Mandanten deaktiviert, wird die Anfrage abgelehnt, bevor sie den Handler erreicht.",
      pipelineTip:
        "Um einen Befehl hinter einer Funktion zu verbergen, implementieren Sie einfach IRequireFeature und setzen Sie RequiredFeatureName auf den stabilen SystemschlÃ¼ssel der Funktion (z. B. 'Chat.Enabled'). Es ist kein zusÃ¤tzlicher Code erforderlich.",
      backendTitle: "Backend-Struktur",
      backendIntro:
        "Das Berechtigungs-Backend folgt SCRIPEs standardmÃ¤ÃŸigem Clean-Architecture-Modullayout mit Domain-, Application- und Infrastructure-Schichten.",
      frontendTitle: "Frontend-Struktur",
      frontendIntro:
        "Das Frontend spiegelt das Backend mit vier Untermodulen (Editionen, Funktionen, Abonnements, Ãœberschreibungen) wider, die alle dem SOLID View/ViewModel-Muster folgen.",
      controllersTitle: "API-Controller",
      controllersIntro:
        "Das Berechtigungsmodul stellt 31 API-Endpunkte Ã¼ber 4 Controller bereit, die alle mit JWT authentifiziert und durch berechtigungsbasierte Autorisierung geschÃ¼tzt sind.",
      noOpTitle: "NoOp-Fallback",
      noOpIntro:
        "Wenn das Berechtigungsmodul nicht geladen ist (z. B. in einem Microservice, der keine Entitlements enthÃ¤lt), registriert SCRIPE einen NoOpFeatureCache. Dadurch kÃ¶nnen IRequireFeature-Befehle fehlerfrei passieren — alle Funktionen werden standardmÃ¤ÃŸig als aktiviert behandelt.",
      noOpNote:
        "Das NoOp-Fallback stellt sicher, dass Module IRequireFeature ohne eine feste AbhÃ¤ngigkeit vom Berechtigungsmodul verwenden kÃ¶nnen. Im produktiven Monolith-Modus ist der echte FeatureCache immer verfÃ¼gbar.",
      contextAwareTitle: "Kontextbezogene Bereichseinstellung",
      contextAwareIntro:
        "Alle Berechtigungsseiten (Funktionen, Editionen, Berechtigungen) sind kontextbezogen. Das Frontend erkennt, ob der Benutzer ein Systemadministrator (tenantId ist null), ein Mandanten-Administrator oder im Drill-Down-Modus ist, und ruft entsprechend verschiedene Backend-Endpunkte auf. Systemadministratoren sehen den vollstÃ¤ndigen Katalog mit CRUD; Mandanten-Administratoren sehen nur ihre effektiven Daten im Nur-Lese-Modus.",
      resolutionTip:
        "Die AuflÃ¶sungskette wird Lazy evaluiert — Werte werden nach der ersten AuflÃ¶sung zwischengespeichert und invalidiert, wenn sich Abonnements, Editionen oder Ãœberschreibungen Ã¤ndern.",
      cqrsMapTitle: "CQRS Command & Query Map",
      cqrsMapIntro:
        "Das Berechtigungsmodul registriert 31 SCRIPE mediator-Handler, die sich Ã¼ber die vier DomÃ¤nen erstrecken. Jeder Befehl hat einen entsprechenden FluentValidation-Validator zur EingabeÃ¼berprÃ¼fung.",
      diTitle: "Dependency Injection Registrierung",
      diIntro:
        "Alle Berechtigungsdienste werden Ã¼ber die Erweiterungsmethode AddEntitlementsModule in DependencyInjection.cs registriert. Das Modul folgt SCRIPEs Standard-Registrierungsmuster.",
      comparisonTitle: "Mit vs. Ohne Berechtigungen",
      comparisonIntro:
        "Die folgende Tabelle zeigt die unterschiedlichen FÃ¤higkeiten, wenn das Berechtigungsmodul aktiviert ist, im Vergleich zum Betrieb ohne dieses Modul:",
      gettingStartedTitle: "Erste Schritte",
      gettingStartedIntro:
        "Befolgen Sie diese 5 Schritte, um das Berechtigungssystem fÃ¼r Ihre Plattform einzurichten. Jeder Schritt baut auf dem vorherigen auf:",
      quotaGatingTitle: "Kontingentprüfung und Slot-Reservierungen",
      quotaGatingIntro:
        "Numerische Funktionen stellen Kontingente dar, die beim Erstellen von Mandantenressourcen erzwungen werden. SCRIPE verwendet ein threadsicheres, atomares Reservierungsmuster, um diese Limits zu verwalten.",
      quotaGatingNote:
        "TryReserveSlotAsync erhöht den reservierten Zähler. Der Handler bestätigt diese Reservierung bei Erfolg oder gibt sie bei Fehlschlag frei.",
    },
    editions: {
      title: "Editionen",
      description:
        "Benannte AbonnementplÃ¤ne mit FunktionsbÃ¼ndeln, Ãœberlaufrichtlinien (Overflow Policies), Versionierung und Rollout-Strategien.",
      intro:
        "Editionen sind benannte PlÃ¤ne (z. B. Basic, Pro, Enterprise), die Funktionswerte bÃ¼ndeln. Jeder Mandant abonniert eine Edition, die seinen Funktionszugriff bestimmt. Editionen unterstÃ¼tzen Versionierung mit kontrollierten Rollout-Strategien fÃ¼r die sichere Bereitstellung von Ã„nderungen.",
      entityTitle: "Editions-EntitÃ¤t",
      entityIntro:
        "Eine Edition ist ein benannter Plan, der Funktionswerte bÃ¼ndelt. Systemeditionen werden von Plattform-Administratoren erstellt; Retail-Editionen werden von Reseller-Mandanten fÃ¼r ihre Unter-Mandanten erstellt.",
      overflowTitle: "Ãœberlaufrichtlinie (Overflow Policy)",
      overflowIntro:
        "Wenn ein Mandant auf eine Edition mit niedrigeren Limits herabgestuft wird, kÃ¶nnen seine vorhandenen Ressourcen die neuen Limits Ã¼berschreiten. Die Ãœberlaufrichtlinie bestimmt, was passiert:",
      featuresTitle: "Editions-Funktionen",
      featuresIntro:
        "Jede Edition enthÃ¤lt eine Reihe von EditionFeature-DatensÃ¤tzen, die Funktionen ihren Werten innerhalb dieses Plans zuordnen. Funktionen, die in einer Edition nicht explizit festgelegt sind, greifen auf Feature.DefaultValue zurÃ¼ck.",
      versionsTitle: "Editions-Versionen",
      versionsIntro:
        "Editions-Versionen bieten ein Versionierungs- und Rollout-System fÃ¼r FunktionsÃ¤nderungen. Anstatt Funktionen direkt zu Ã¤ndern, kÃ¶nnen Administratoren eine neue Version (Snapshot) erstellen, eine Rollout-Strategie wÃ¤hlen und diese verÃ¶ffentlichen.",
      rolloutTitle: "Rollout-Strategien",
      rolloutIntro:
        "Beim VerÃ¶ffentlichen einer Editionsversion wÃ¤hlen Administratoren aus, wie die Ã„nderungen fÃ¼r abonnierte Mandanten bereitgestellt werden:",
      workflowTitle: "Jetzt anwenden vs. Als Version speichern",
      workflowIntro:
        "SCRIPE bietet zwei MÃ¶glichkeiten, Editionsfunktionen zu aktualisieren, die jeweils fÃ¼r unterschiedliche Szenarien geeignet sind:",
      workflowTip:
        "Verwenden Sie 'Jetzt anwenden' fÃ¼r dringende Fehlerbehebungen und kleine Ã„nderungen. Verwenden Sie 'Als Version speichern' fÃ¼r grÃ¶ÃŸere Planaktualisierungen, die einen gestaffelten Rollout und einen Audit-Trail benÃ¶tigen.",
      endpointsTitle: "API-Endpunkte",
      endpointsIntro:
        "Der Editions-Controller stellt 11 Endpunkte zur Verwaltung von Editionen, deren Funktionen und dem Versionslebenszyklus bereit:",
      drillDownTitle: "Drill-Down-Verhalten",
      drillDownIntro:
        "Wenn ein Systemadministrator in einen Mandanten absteigt (Drill-Down), wird die Editionsliste automatisch auf die fÃ¼r diesen Mandanten sichtbaren Editionen beschrÃ¤nkt. Das Backend verwendet den X-Tenant-Context-Header zur Filterung: Systemeditionen + Retail-Editionen, die vom ausgewÃ¤hlten Mandanten erstellt wurden. Das Frontend blendet CRUD-Aktionen im Drill-Down-Modus aus.",
      scopingTitle: "System- vs. Retail-Editionen",
      scopingIntro:
        "SCRIPE unterstÃ¼tzt zwei Arten von Editionen: Systemeditionen, die von Plattformadministratoren erstellt werden und fÃ¼r alle Mandanten sichtbar sind, und Retail-Editionen, die von Reseller-Mandanten nur fÃ¼r deren Unter-Mandanten erstellt werden.",
      scopingNote:
        "Mandanten-Administratoren sehen nur Systemeditionen sowie ihre eigenen Retail-Editionen. Dies stellt die Editions-Isolation zwischen Reseller-Mandanten sicher.",
      featuresTip:
        "Funktionen, die in einer Edition nicht explizit festgelegt sind, greifen auf Feature.DefaultValue zurÃ¼ck. Sie mÃ¼ssen nur Funktionen konfigurieren, die vom globalen Standard abweichen.",
      endpointsList: "Alle Editionen auflisten (paginiert, filterbar)",
      endpointsGet: "Editionsdetails nach ID abrufen",
      endpointsCreate: "Eine neue Edition erstellen",
      endpointsUpdate: "Editions-Metadaten aktualisieren",
      endpointsDelete: "Eine Edition weich lÃ¶schen (Soft-Delete)",
      endpointsGetFeatures: "FÃ¼r diese Edition konfigurierte Funktionen auflisten",
      endpointsSetFeatures: "Funktionen fÃ¼r diese Edition festlegen/aktualisieren",
      endpointsDirectApply: "FunktionsÃ¤nderungen sofort anwenden (keine Versionierung)",
      endpointsGetVersions: "Alle Versionen fÃ¼r diese Edition auflisten",
      endpointsCreateVersion: "Eine neue Entwurfsversion mit Funktions-Snapshot erstellen",
      endpointsPublishVersion:
        "Eine Entwurfsversion mit gewÃ¤hlter Rollout-Strategie verÃ¶ffentlichen",
      seededTitle: "Standardmäßige System-Editionen",
      seededIntro:
        "Die Plattform initialisiert beim Start zwei Standard-Systemeditionen über den EditionSeeder, um Standardlimits für Funktionen festzulegen.",
    },
    subscriptions: {
      title: "Abonnements",
      description:
        "Mandanten-zu-Editions-Bindung mit vollstÃ¤ndiger Lebenszyklusverwaltung, MehrwÃ¤hrungs-Preisgestaltung, Werbeaktionen, Testversionen, Herabstufungen, Ablaufverhalten und erweiterten Analyse-Exporten.",
      intro:
        "Abonnements verknÃ¼pfen Mandanten mit Editionen (PlÃ¤nen). Jeder Mandant hat ein Basisabonnement, das seine Edition bestimmt, und optional Zusatzabonnements fÃ¼r zusÃ¤tzliche FÃ¤higkeiten. Das Abonnementsystem verwaltet den gesamten Lebenszyklus von der Zuweisung Ã¼ber VerlÃ¤ngerung, Herabstufung, Sperrung bis hin zur KÃ¼ndigung — mit integrierter MehrwÃ¤hrungs-Preisgestaltung und Verfolgung von Werberabatten.",
      entityTitle: "Abonnement-EntitÃ¤t",
      entityIntro:
        "Eine TenantSubscription bindet einen Mandanten an eine Edition mit Lebenszyklusverfolgung. Sie unterstÃ¼tzt mehrere Abonnementtypen und -status fÃ¼r ein umfassendes Lebenszyklusmanagement.",
      typesTitle: "Abonnementtypen",
      typesIntro:
        "Jedes Abonnement hat einen Typ, der seinen Abrechnungszyklus und sein Verhalten bestimmt:",
      lifecycleTitle: "Status-Lebenszyklus",
      lifecycleIntro: "Abonnements durchlaufen wÃ¤hrend ihres Lebenszyklus eine Reihe von Status:",
      downgradeTitle: "Downgrade-Verfolgung",
      downgradeIntro:
        "Wenn ein Mandant herabgestuft wird (entweder manuell oder aufgrund von Ablauf), verfolgt das System die ursprÃ¼nglichen Abonnementdetails fÃ¼r Audits und mÃ¶gliche Wiederherstellungen. Die Felder DowngradedFromEditionId, DowngradedFromType, DowngradedFromEndDate und DowngradedAt bewahren den kompletten Downgrade-Verlauf.",
      downgradeWarning:
        "Beim Downgrade bestimmt die Ãœberlaufrichtlinie (OverflowPolicy) der Zieledition, was mit Ressourcen geschieht, die die neuen Limits Ã¼berschreiten. Verwenden Sie immer den Downgrade Impact-Endpunkt, um die Auswirkungen vorab anzuzeigen, bevor Sie Ã„nderungen vornehmen.",
      expiryTitle: "Ablaufverhalten",
      expiryIntro:
        "Wenn ein Abonnement ablÃ¤uft, bestimmt die Einstellung ExpiryBehavior, was als NÃ¤chstes passiert:",
      pricingTitle: "MehrwÃ¤hrungs-Preisgestaltung",
      pricingIntro:
        "Jedes Abonnement trÃ¤gt vollstÃ¤ndige Preis-Metadaten: WÃ¤hrung (ISO-Code), Basisbetrag, Anpassungsbetrag, Gesamtbetrag, WechselkursZuUsd und GesamtbetragUsd. Dies ermÃ¶glicht eine prÃ¤zise Umsatzverfolgung Ã¼ber 9+ unterstÃ¼tzte WÃ¤hrungen (USD, EUR, GBP, SAR, AED, EGP, TRY, INR und mehr).",
      exchangeRateTitle: "USD-Normalisierung",
      exchangeRateIntro:
        "Alle BetrÃ¤ge werden Ã¼ber ExchangeRateToUsd fÃ¼r konsistente MRR/ARR-Berichte auf USD normalisiert. Das Feld TotalAmountUsd wird zum Abonnementzeitpunkt berechnet und fÃ¼r historische Genauigkeit gespeichert — Wechselkursschwankungen Ã¤ndern vergangene Aufzeichnungen nicht rÃ¼ckwirkend.",
      promotionsTitle: "Werberabatte",
      promotionsIntro:
        "Abonnements unterstÃ¼tzen Promo-Codes Ã¼ber das Feld AppliedPromoCode. Bei Anwendung einer gÃ¼ltigen Werbeaktion wird ein PromotionDiscount-Prozentsatz aufgezeichnet und der Anpassungsbetrag spiegelt den auf den Basisbetrag angewandten Rabatt wider. Promotionen werden pro Abonnement fÃ¼r Audits und Analysen verfolgt.",
      exportTitle: "Erweiterter Export & Berichterstattung",
      exportIntro:
        "Das Abonnement-Exportsystem generiert umfassende Berichte in den Formaten CSV, Excel (XLSX) und PDF. Jeder Bericht enthÃ¤lt ein Deckblatt mit Filter-Metadaten, farbcodierte Datentabellen und statistische Zusammenfassungen.",
      exportFiltersTitle: "Export-Filter",
      exportFiltersIntro: "Berichte unterstÃ¼tzen erweiterte Filterung fÃ¼r gezielte Analysen:",
      exportFilterDate:
        "Datumsbereich — Filterung nach Abonnement-Erstellungsdatum (letzte 7/30/90 Tage, letztes Jahr oder benutzerdefinierter Bereich)",
      exportFilterExpiring:
        "Bald ablaufend — Abonnements finden, die innerhalb von 5/7/14/30/60/90 Tagen ablaufen",
      exportFilterStatus: "Status — Aktiv, Gesperrt, GekÃ¼ndigt, Abgelaufen",
      exportFilterEdition: "Edition — Filterung nach spezifischem Plan/Edition",
      exportFilterCurrency: "WÃ¤hrung — BetrÃ¤ge in ausgewÃ¤hlter WÃ¤hrung anzeigen",
      exportDaysLeftTitle: "Tage bis zum Ablauf",
      exportDaysLeftIntro:
        "Berichte enthalten eine berechnete 'Verbleibende Tage'-Spalte mit bedingter Farbcodierung: Rot (â‰¤7 Tage), Gelb (â‰¤30 Tage), GrÃ¼n (>30 Tage). Dies ermÃ¶glicht die sofortige Identifizierung von Abonnements, die eine VerlÃ¤ngerung benÃ¶tigen.",
      exportFormatsTitle: "Exportformat-Details",
      exportFormatCsv:
        "CSV — leichtgewichtig, in jedes Tabellenkalkulationsprogramm oder BI-Tool importierbar",
      exportFormatExcel:
        "XLSX — professionelle Excel-Arbeitsmappe mit gestalteten Kopfzeilen, Filter-Metadatenblatt, bedingter Formatierung und automatisch dimensionierten Spalten (ClosedXML)",
      exportFormatPdf:
        "PDF — druckfertiges Dokument mit markengebundenem Deckblatt, statistischer Zusammenfassung und paginierten Datentabellen (QuestPDF)",
      renewalTitle: "VerlÃ¤ngerung — Neuer-Zeilen-Muster (B2)",
      renewalIntro:
        "VerlÃ¤ngerungen erstellen eine NEUE TenantSubscription-Zeile anstatt den bestehenden Datensatz zu Ã¼berschreiben (Stripe-Muster). Das alte Abonnement wird als abgelaufen markiert (IsActive=false), wÃ¤hrend eine neue Zeile mit frischer Id, StartDate=UtcNow, neu berechneter Preisgestaltung und Ã¼bertragenen Aktionsdetails erstellt wird.",
      renewalAuditTitle: "Umsatz-PrÃ¼fpfad",
      renewalAuditIntro:
        "Jeder Abrechnungszeitraum erzeugt eine unverÃ¤nderliche Datenbankzeile mit zum VerlÃ¤ngerungszeitpunkt festgeschriebenem Preis. Dies ermÃ¶glicht prÃ¤zise Finanzberichte: MRR-Trends, Abwanderungsanalyse pro Zeitraum und RÃ¼ckerstattungsverfolgung pro Zyklus.",
      promoExpiryTitle: "Aktionsablauf-Verfolgung (A1)",
      promoExpiryIntro:
        "Wenn eine Aktion mit DurationDays > 0 angewendet wird, berechnet das System einen PromotionExpiresAt-Zeitstempel. Bei jeder VerlÃ¤ngerung prÃ¼ft der Handler, ob UtcNow > PromotionExpiresAt — wenn die Aktion abgelaufen ist, wird der Rabatt entfernt und NICHT in die neue Abonnementzeile Ã¼bernommen.",
      concurrencyTitle: "Optimistische NebenlÃ¤ufigkeit (E1)",
      concurrencyIntro:
        "Jede TenantSubscription hat einen ConcurrencyStamp (Guid) mit [ConcurrencyCheck]. Der Stempel wird bei jedem Schreibvorgang erneuert. Dies verhindert Race Conditions — z.B. gleichzeitige KÃ¼ndigung + Abgleichjob — durch AuslÃ¶sen einer DbUpdateConcurrencyException bei Kollisionen.",
      validationTitle: "Eingabevalidierung (G1)",
      validationIntro:
        "Alle 8 Abonnement-Befehle haben dedizierte FluentValidation-Validatoren. Validatoren verwenden ILocalizer fÃ¼r lokalisierte Fehlermeldungen (EN + AR). GeschÃ¤ftsregeln: keine VerlÃ¤ngerung als Testversion, positive RÃ¼ckerstattungsbetrÃ¤ge, ZeichenlÃ¤ngenbegrenzungen.",
      crossModuleTitle: "ModulÃ¼bergreifende Integration (H1)",
      crossModuleIntro:
        "Abonnement-Lebenszyklus-Ereignisse verÃ¶ffentlichen DomÃ¤nen-Events, die vom IdentitÃ¤tsmodul konsumiert werden. Bei Aussetzung eines Abonnements werden alle Mandanten-Admins mit DeactivationReason='SubscriptionSuspended' deaktiviert. Bei Wiederaufnahme werden nur die durch Aussetzung deaktivierten Admins reaktiviert.",
      crossModuleReasons:
        "Drei DeaktivierungsgrÃ¼nde: 'Manuell' (wird nie automatisch reaktiviert), 'SubscriptionSuspended' (wird bei Wiederaufnahme reaktiviert), 'SubscriptionExpired' (wird bei Ablauf deaktiviert).",
      impactTitle: "Downgrade-Auswirkungsanalyse",
      impactIntro:
        "Bevor Sie die Edition eines Mandanten Ã¤ndern, verwenden Sie den Downgrade Impact-Endpunkt, um in einer Vorschau zu sehen, welche Ressourcen Ã¼berlaufen wÃ¼rden. Die Antwort listet jede Funktion auf, die die Limits der neuen Edition Ã¼berschreiten wÃ¼rde, zusammen mit der aktuellen Nutzung vs. neuem Limit.",
      endpointsTitle: "API-Endpunkte",
      endpointsIntro:
        "Der Abonnements-Controller bietet 13 Endpunkte, die den gesamten Abonnement-Lebenszyklus abdecken:",
      operationsTitle: "Abonnement-Operationen",
      operationsIntro:
        "Das Abonnementmodul unterstÃ¼tzt ein umfassendes Set von Lebenszyklus-Operationen. Jede Operation Ã¼berfÃ¼hrt das Abonnement in einen neuen Zustand mit vollstÃ¤ndiger Audit-Verfolgung.",
      assignTitle: "Abonnement zuweisen",
      assignIntro:
        "Erstellen Sie ein neues Abonnement, das einen Mandanten mit einer Edition verknÃ¼pft. Wenn der Mandant bereits ein aktives Abonnement hat, wird das vorherige automatisch gekÃ¼ndigt. UnterstÃ¼tzt optionale Parameter fÃ¼r WÃ¤hrung, Promo-Code und Ablaufverhalten.",
      upgradeTitle: "Upgrade & Downgrade",
      upgradeIntro:
        "Mandanten kÃ¶nnen zwischen Editionen wechseln. Upgrades werden sofort angewendet, wobei die Funktionen der neuen Edition sofort wirksam werden. Downgrades prÃ¼fen zuerst die OverflowPolicy, um Ressourcen zu handhaben, die neue Limits Ã¼berschreiten.",
      trialTitle: "Testversions-Konvertierung",
      trialIntro:
        "Testabonnements haben ein TrialEndDate. Wenn eine Testversion auf einen kostenpflichtigen Plan hochgestuft wird, wird IsTrialConverted auf true gesetzt und das Abonnement wechselt zum neuen Typ. Wenn die Testversion ohne Konvertierung ablÃ¤uft, bestimmt ExpiryBehavior, was als NÃ¤chstes passiert.",
      ep: {
        list: "Alle Abonnements auflisten (paginiert, filterbar nach Status/Typ/Mandant)",
        get: "Abonnementdetails nach ID abrufen",
        assign:
          "Ein neues Abonnement erstellen (Mandant einer Edition mit WÃ¤hrung/Promo zuweisen)",
        upgrade: "Auf eine hÃ¶here Edition hochstufen",
        downgrade: "Auf eine niedrigere Edition herabstufen (prÃ¼ft OverflowPolicy)",
        impact: "Downgrade-Auswirkungen vor der AusfÃ¼hrung in der Vorschau anzeigen",
        suspend: "Abonnement sperren (Mandantenzugriff blockieren)",
        resume: "Ein gesperrtes Abonnement fortsetzen",
        cancel: "Abonnement dauerhaft kÃ¼ndigen",
        renew: "Ein ablaufendes Abonnement verlÃ¤ngern",
        tenantActive: "Das aktive Abonnement fÃ¼r einen bestimmten Mandanten abrufen",
        export: "Abonnements als CSV, Excel oder PDF mit erweiterten Filtern exportieren",
      },
    },
    features: {
      title: "Funktionen (Features)",
      description:
        "Steuerbare PlattformfÃ¤higkeiten mit Booleschen, Numerischen und String-Wertetypen.",
      intro:
        "Funktionen sind die atomaren Bausteine des Berechtigungssystems. Jede Funktion reprÃ¤sentiert eine steuerbare FÃ¤higkeit — einen booleschen Schalter, ein numerisches Kontingent (Quota) oder eine String-Konfiguration. Funktionen haben einen stabilen SystemschlÃ¼ssel (Name), der sich nie Ã¤ndert, sodass sie sicher im Code referenziert werden kÃ¶nnen.",
      entityTitle: "Funktions-EntitÃ¤t",
      entityIntro:
        "Eine Funktion (Feature) definiert eine steuerbare PlattformfÃ¤higkeit. Das Feld Name ist ein stabiler SystemschlÃ¼ssel, der im Code verwendet wird; DisplayNameEn/DisplayNameAr sind benutzerorientierte Bezeichnungen.",
      valueTypesTitle: "Wertetypen",
      valueTypesIntro:
        "Funktionswerte werden als Strings gespeichert, aber gemÃ¤ÃŸ ihrem ValueType interpretiert. Das System validiert Werte bei der Erstellung und Aktualisierung gegen den erwarteten Typ.",
      valueTypesTip:
        "Verwenden Sie fÃ¼r numerische Funktionen -1, um 'unbegrenzt' darzustellen. Das FeatureCheckBehavior erkennt -1 als Spezialwert und blockiert niemals Anfragen fÃ¼r Funktionen mit einem unbegrenzten Kontingent.",
      systemVsCustomTitle: "System- vs. Benutzerdefinierte Funktionen",
      systemVsCustomIntro:
        "SCRIPE unterscheidet zwischen Systemfunktionen (beim Start geseeded, schreibgeschÃ¼tzt) und benutzerdefinierten Funktionen (von Administratoren via API erstellt):",
      cacheTitle: "Feature-Cache",
      cacheIntro:
        "AufgelÃ¶ste Funktionswerte werden im IFeatureCache zwischengespeichert, um Datenbankabfragen bei jeder Anfrage zu vermeiden. Der Cache wird invalidiert, wenn sich die Funktionen einer Edition Ã¤ndern, ein Abonnement geÃ¤ndert wird oder eine Ãœberschreibung festgelegt/entfernt wird. In Microservice-Deployments ohne das Berechtigungsmodul behandelt ein NoOpFeatureCache alle Funktionen als aktiviert.",
      requireFeatureTitle: "IRequireFeature-Schnittstelle",
      requireFeatureIntro:
        "Um einen CQRS-Befehl oder eine Abfrage hinter einer Funktion zu verbergen, implementieren Sie die IRequireFeature-Marker-Schnittstelle. Das FeatureCheckBehavior der Pipeline lÃ¶st automatisch den aktuellen Wert des Mandanten auf und lehnt die Anfrage ab, wenn die Funktion deaktiviert ist.",
      requireFeatureNote:
        "IRequireFeature funktioniert sowohl fÃ¼r boolesche Funktionen (auf aktiviert/deaktiviert geprÃ¼ft) als auch fÃ¼r numerische Funktionen (auf verbleibendes Kontingent geprÃ¼ft). Das Behavior bestimmt die PrÃ¼fungsart automatisch anhand des Feature.ValueType.",
      contextAwareTitle: "Kontextbezogene Funktionsanzeige",
      contextAwareIntro:
        "Die Funktionsliste ist kontextbezogen. Systemadministratoren sehen den vollstÃ¤ndigen Funktionskatalog mit CRUD-Operationen. Mandanten-Administratoren und Drill-Down-Sitzungen sehen nur die effektiven Funktionen des Mandanten (aufgelÃ¶st aus Edition + Ãœberschreibungen) im Nur-Lese-Modus. Die gesamte Bereichseinstellung erfolgt backend-seitig Ã¼ber GET /features (Katalog) vs. GET /features/effective (mandantenbezogen).",
      endpointsTitle: "API-Endpunkte",
      endpointsIntro:
        "Der Features-Controller stellt 5 CRUD-Endpunkte bereit. Systemfunktionen kÃ¶nnen nicht gelÃ¶scht werden:",
      seedingTitle: "Feature-Seeding",
      seedingIntro:
        "Systemfunktionen werden beim Anwendungsstart automatisch vom EntitlementsStartupSeeder geseeded. Der Seeder prÃ¼ft, ob jede Systemfunktion bereits existiert (nach Name) und erstellt nur fehlende — vorhandene Funktionen werden niemals Ã¼berschrieben.",
      quotaTitle: "Kontingentverfolgung (QuotaCounter)",
      quotaIntro:
        "Numerische Funktionen unterstÃ¼tzen die automatische Kontingentdurchsetzung Ã¼ber die QuotaCounter-EntitÃ¤t. Das FeatureCheckBehavior vergleicht die aktuelle Nutzung mit dem ermittelten Limit fÃ¼r jeden IRequireFeature-Befehl, der auf eine numerische Funktion abzielt.",
      cacheNote:
        "Der Cache wird automatisch invalidiert, wenn: (1) die Funktionen einer Edition geÃ¤ndert werden, (2) ein Abonnement zugewiesen/geÃ¤ndert wird, (3) eine Ãœberschreibung festgelegt/entfernt wird. Ein manuelles Cache-Busting ist nicht erforderlich.",
      patternTitle: "IRequireFeature-Muster",
      patternIntro:
        "Um einen beliebigen CQRS-Befehl hinter einer FunktionsprÃ¼fung zu verbergen, implementieren Sie einfach die IRequireFeature-Marker-Schnittstelle. Das FeatureCheckBehavior fÃ¤ngt die Anfrage automatisch ab, lÃ¶st den Funktionswert des Mandanten auf und lehnt sie ab, falls deaktiviert oder Ã¼ber dem Kontingent.",
      ep: {
        list: "Alle Funktionen auflisten (paginiert, filterbar nach Kategorie/Typ)",
        get: "Funktionsdetails nach ID abrufen",
        create: "Eine neue benutzerdefinierte Funktion erstellen",
        update:
          "Funktions-Metadaten aktualisieren (Systemfunktionen: nur DefaultValue/Description)",
        delete:
          "Eine benutzerdefinierte Funktion weich lÃ¶schen (Systemfunktionen kÃ¶nnen nicht gelÃ¶scht werden)",
      },
    },
    overrides: {
      title: "Funktions-Ãœberschreibungen (Overrides)",
      description:
        "Mandantenspezifische Anpassung von Funktionswerten, die die Editions-Standards umgeht.",
      intro:
        "Funktions-Ãœberschreibungen ermÃ¶glichen es Plattform-Administratoren, Funktionswerte fÃ¼r einzelne Mandanten anzupassen, unabhÃ¤ngig von ihrer abonnierten Edition. Ãœberschreibungen haben in der AuflÃ¶sungskette die hÃ¶chste PrioritÃ¤t und eignen sich daher perfekt fÃ¼r maÃŸgeschneiderte Vertriebsdeals, spezielle Werbeaktionen oder einmalige Ausnahmen.",
      entityTitle: "Override-EntitÃ¤t",
      entityIntro:
        "Ein TenantFeatureOverride legt einen benutzerdefinierten Wert fÃ¼r eine bestimmte Funktion bei einem bestimmten Mandanten fest. Er enthÃ¤lt ein optionales Feld 'Reason' (Grund) fÃ¼r PrÃ¼fzwecke.",
      priorityTitle: "AuflÃ¶sungsprioritÃ¤t",
      priorityIntro:
        "Ãœberschreibungen stehen ganz oben in der AuflÃ¶sungskette. Wenn das System einen Funktionswert fÃ¼r einen Mandanten ermittelt, sucht es zuerst nach einer Ãœberschreibung:",
      whenTitle: "Wann man Ãœberschreibungen verwendet",
      whenIntro:
        "Ãœberschreibungen sind fÃ¼r AusnahmefÃ¤lle gedacht, in denen ein Mandant einen anderen Wert benÃ¶tigt, als seine Edition vorgibt:",
      useCase1:
        "MaÃŸgeschneiderte Enterprise-Deals — 'Acme Corp 500 Administratoren statt der standardmÃ¤ÃŸigen 50 geben'",
      useCase2: "Werbeangebote — 'Premium-Chat fÃ¼r diesen Mandanten fÃ¼r 30 Tage aktivieren'",
      useCase3: "Beta-Tests — 'Das neue Rechnungsmodul fÃ¼r Early Adopters aktivieren'",
      useCase4:
        "VorÃ¼bergehende ErhÃ¶hung — 'Datei-Upload-Limit wÃ¤hrend ihrer Migration erhÃ¶hen'",
      overuseWarning:
        "Ãœberschreibungen sollten sparsam eingesetzt werden. Wenn viele Mandanten dieselbe Ãœberschreibung benÃ¶tigen, ziehen Sie in Betracht, eine neue Edition zu erstellen. ÃœbermÃ¤ÃŸige Ãœberschreibungen machen das System schwerer zu verwalten und zu prÃ¼fen.",
      resolvedTitle: "Endpunkt fÃ¼r aufgelÃ¶ste Funktionen",
      resolvedIntro:
        "Der Endpunkt GET /api/v1/tenants/{tenantId}/features/resolved gibt den endgÃ¼ltigen, effektiven Wert fÃ¼r jede Funktion eines bestimmten Mandanten zurÃ¼ck. Er zeigt fÃ¼r jeden Eintrag die AuflÃ¶sungsquelle (Override, Edition oder Default) an, was das Debuggen und Auditing erleichtert.",
      endpointsTitle: "API-Endpunkte",
      endpointsIntro:
        "Der TenantFeatures-Controller stellt 4 Endpunkte zur Verwaltung von mandantenspezifischen Ãœberschreibungen und aufgelÃ¶sten Werten bereit:",
      scenariosTitle: "Anwendungsszenarien",
      scenariosIntro:
        "Die folgenden realen Szenarien zeigen, wann Ãœberschreibungen den grÃ¶ÃŸten Wert bieten:",
      settingTitle: "Eine Ãœberschreibung festlegen",
      settingIntro:
        "Um eine Ãœberschreibung festzulegen, senden Sie einen POST an den Endpunkt fÃ¼r Mandantenfunktionen mit der Funktions-ID, dem benutzerdefinierten Wert und einem optionalen Grund fÃ¼r PrÃ¼fzwecke.",
      settingTip:
        "Geben Sie beim Festlegen von Ãœberschreibungen immer einen Grund an — dies macht Audit-Trails aussagekrÃ¤ftig und hilft zukÃ¼nftigen Administratoren zu verstehen, warum die Ãœberschreibung angewendet wurde.",
      expiryTitle: "Ablaufende Ãœberschreibungen",
      expiryIntro:
        "Ãœberschreibungen kÃ¶nnen ein optionales ExpiresAt-Datum (Ablaufdatum) haben. Wenn das Ablaufdatum Ã¼berschritten ist, wird die Ãœberschreibung automatisch deaktiviert und die Funktion fÃ¤llt auf den Editionswert (oder den globalen Standard) zurÃ¼ck.",
      expiryNote:
        "Abgelaufene Ãœberschreibungen werden weich deaktiviert (IsActive = false), nicht gelÃ¶scht. Dies bewahrt den Audit-Trail und ermÃ¶glicht bei Bedarf eine erneute Aktivierung.",
      auditTitle: "Audit-Trail",
      auditIntro:
        "Jede Ãœberschreibungsoperation wird mit vollstÃ¤ndigen Audit-Informationen verfolgt. Das Feld 'Grund' (Reason) bei jeder Ãœberschreibung liefert den Kontext, warum der benutzerdefinierte Wert angewendet wurde.",
      bestPracticesTitle: "Best Practices",
      bestPracticesIntro:
        "Befolgen Sie diese Richtlinien, um Ihr Ãœberschreibungssystem wartbar und Ã¼berprÃ¼fbar zu halten.",
      bestPracticesWarning:
        "Ãœberschreibungen sollten sparsam eingesetzt werden. Wenn viele Mandanten dieselbe Ãœberschreibung benÃ¶tigen, ziehen Sie in Betracht, eine neue Edition zu erstellen. ÃœbermÃ¤ÃŸige Ãœberschreibungen machen das System schwerer zu verwalten und verursachen Wartungsschulden.",
      ep: {
        list: "Alle Ãœberschreibungen fÃ¼r einen bestimmten Mandanten auflisten",
        set: "Eine Funktions-Ãœberschreibung fÃ¼r einen Mandanten festlegen oder aktualisieren",
        remove: "Eine Funktions-Ãœberschreibung entfernen (deaktivieren)",
        resolved:
          "Alle aufgelÃ¶sten Funktionswerte fÃ¼r einen Mandanten abrufen (zeigt Quelle: Override/Edition/Default)",
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
          "Definieren Sie Aufbewahrungsfristen und automatische Ablaufaktionen (LÃ¶schen oder Anonymisieren) fÃ¼r DSGVO-Artikel 5(1)(e).",
        intro:
          "Aufbewahrungsrichtlinien definieren, wie lange Daten aufbewahrt werden mÃ¼ssen. SCRIPE setzt diese automatisch durch.",
        policiesTitle: "Richtlinienkonfiguration",
        policiesIntro: "Jede Richtlinie legt Folgendes fest:",
        field1: "DataCategory — Datentyp (z. B. 'Benutzerprofile').",
        field2: "RetentionDays — Wie viele Tage die Daten aufbewahrt werden mÃ¼ssen.",
        field3:
          "ExpiryAction — Was bei Ablauf geschieht: Delete (LÃ¶schen) oder Anonymize (Anonymisieren).",
        field4: "RegulationCode — Welche Verordnung dies erfordert (GDPR, CCPA usw.).",
        actionsTitle: "Ablaufaktionen",
        actionsIntro: "Bei Ablauf wendet SCRIPE eine von zwei Aktionen an:",
        action1: "Delete — LÃ¶scht dauerhaft alle passenden DatensÃ¤tze.",
        action2: "Anonymize — Ersetzt personenbezogene Daten durch pseudonyme Token.",
        automationTitle: "Automatisierte Durchsetzung",
        automationIntro:
          "Der RetentionEnforcementJob lÃ¤uft tÃ¤glich um 3:00 Uhr UTC und verarbeitet Richtlinien. Ein Audit-Eintrag RetentionExecution wird erstellt.",
        nodePolicy: "Aufbewahrungsrichtlinie",
        descPolicy: "Definiert EntitÃ¤tstyp, Altersgrenze und ZerstÃ¶rungsstrategie",
        nodeEnforcement: "Aufbewahrungs-Durchsetzungs-Job",
        descEnforcement: "WÃ¶chentlicher Job zur Auswertung der Richtlinien",
        nodeExecution: "AufbewahrungsausfÃ¼hrung",
        descExecution: "Audit-Trail der ZerstÃ¶rungsaktion",
        nodeAction: "DatenzerstÃ¶rung",
        descAction: "EndgÃ¼ltige LÃ¶schung oder Anonymisierung",
        conn1: "gescannt von",
        conn2: "lÃ¶st aus",
        conn3: "protokolliert",
        endpointsTitle: "API Endpoints",
        ep: {
          list: "Alle Aufbewahrungsrichtlinien auflisten",
          executions: "Verlauf der DurchsetzungsausfÃ¼hrungen auflisten",
          update: "Eine Aufbewahrungsrichtlinie aktualisieren",
        },
      },
      inventory: {
        title: "Dateninventar",
        description:
          "Ein Register aller verarbeiteten personenbezogenen Datenkategorien — erforderlich fÃ¼r GDPR Artikel 30 (RoPA).",
        intro:
          "Das Dateninventar ist ein strukturiertes Register. GemÃ¤ÃŸ Artikel 30 DSGVO mÃ¼ssen Verantwortliche ein Verzeichnis von VerarbeitungstÃ¤tigkeiten (RoPA) fÃ¼hren.",
        fieldsTitle: "Inventarfelder",
        fieldsIntro: "Jedes Element dokumentiert:",
        field1: "DataCategory — Lesbarer Name der Kategorie (z. B. 'E-Mail-Adressen').",
        field2:
          "LegalBasis — DSGVO-Rechtsgrundlage fÃ¼r die Verarbeitung (Einwilligung, Vertrag usw.).",
        field3: "DataSubjects — Wem die Daten gehÃ¶ren (z. B. 'Endbenutzer').",
        field4: "ProcessingPurpose — Warum die Daten verarbeitet werden (z. B. 'Marketing').",
        field5: "StorageLocation — Wo die Daten gespeichert sind (Land/Region).",
        field6: "RetentionPeriod — Wie lange die Daten aufbewahrt werden.",
        field7: "ThirdPartySharing — Ob Daten mit Dritten geteilt werden.",
        ropaTitle: "Artikel 30 Compliance",
        ropaIntro:
          "Organisationen mit 250+ Mitarbeitern mÃ¼ssen ein RoPA fÃ¼hren. Das Inventar von SCRIPE dient als abfragbares RoPA fÃ¼r Inspektionen.",
        endpointsTitle: "API Endpoints",
        ep: {
          list: "Alle Dateninventarelemente auflisten (paginiert)",
          get: "Element nach ID abrufen",
          create: "Eine neue Datenkategorie zum Inventar hinzufÃ¼gen",
          update: "Ein bestehendes Inventarelement aktualisieren",
          delete: "Ein Element aus dem Inventar entfernen",
        },
      },
      reports: {
        title: "Compliance-Berichte",
        description:
          "Asynchrone, revisionssichere Berichte generieren (GDPR-Ãœbersicht, DSR-Zusammenfassung, Einwilligungs-Audit, Aufbewahrungsanalyse, Inventar-Export).",
        intro:
          "Compliance-Berichte sind asynchron generierte Dokumente, die revisionssichere Zusammenfassungen Ihrer Compliance-Lage bieten. Berichte werden im Hintergrund erstellt und zum Download bereitgestellt.",
        reportTypesTitle: "Berichtstypen",
        reportTypesIntro: "FÃ¼nf Berichtstypen sind verfÃ¼gbar:",
        type1: "GDPR-Ãœbersicht — Zusammenfassung des DSGVO-Compliance-Status.",
        type2:
          "DSR-AktivitÃ¤tszusammenfassung — Statistiken zu DSR-Volumen, Typen und SLA-Einhaltung.",
        type3: "Einwilligungs-Audit — VollstÃ¤ndiges Protokoll der Einwilligungen und Widerrufe.",
        type4: "Aufbewahrungsanalyse — Aktueller Durchsetzungsstatus aller aktiven Richtlinien.",
        type5:
          "Dateninventar-Export — VollstÃ¤ndiger Export des Dateninventars (Artikel 30 RoPA).",
        asyncTitle: "Asynchrone Generierung",
        asyncIntro:
          "Berichte werden asynchron erstellt, um HTTP-Anfragen nicht zu blockieren. Das System erstellt einen ComplianceReport (IsReady=false) und reiht den Job ein.",
        asyncTip:
          "Verwenden Sie die SchaltflÃ¤che Aktualisieren im UI, um die Bereitschaft zu prÃ¼fen (normalerweise 30-60 Sekunden).",
        downloadTitle: "Berichte herunterladen",
        downloadIntro:
          "Sobald ein Bericht bereit ist (IsReady=true), ist die DownloadUrl verfÃ¼gbar. Berichte werden 90 Tage lang aufbewahrt.",
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
  },
};

/**
 * Docs page locale â€” DE
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const de = {
  modules: {
    entitlementsOverview: {
      title: "BerechtigungsÃ¼bersicht",
      description:
        "Editionsbasiertes Feature-Gating mit Funktionen, Editionen, Abonnements und mandantenspezifischen Ãœberschreibungen.",
      intro:
        "Das Berechtigungsmodul (Entitlements) ist UISs Engine zur Verwaltung von PlÃ¤nen und Funktionen. Es definiert, welche FÃ¤higkeiten jeder Mandant (Tenant) erhÃ¤lt, wie PlÃ¤ne (Editionen) diese FÃ¤higkeiten bÃ¼ndeln und wie Abonnements Mandanten mit PlÃ¤nen verknÃ¼pfen.",
      whatIsTitle: "Was sind Berechtigungen (Entitlements)?",
      whatIsIntro:
        "Berechtigungen ist das Modul, das steuert, auf welche Funktionen ein Mandant basierend auf seiner abonnierten Edition (Plan) zugreifen kann. Es bietet eine dreistufige AuflÃ¶sungskette: Funktionsstandards â†’ Editions-Werte â†’ Mandantenspezifische Ãœberschreibungen, um maximale FlexibilitÃ¤t fÃ¼r Plattformbetreiber und Reseller-Mandanten zu gewÃ¤hrleisten.",
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
        "SCRIPE integriert Berechtigungen Ã¼ber das FeatureCheckBehavior direkt in die SCRIPE mediator-CQRS-Pipeline. Befehle und Abfragen, die IRequireFeature implementieren, werden automatisch Ã¼berwacht â€” ist der ermittelte Funktionswert des Mandanten deaktiviert, wird die Anfrage abgelehnt, bevor sie den Handler erreicht.",
      pipelineTip:
        "Um einen Befehl hinter einer Funktion zu verbergen, implementieren Sie einfach IRequireFeature und setzen Sie RequiredFeatureName auf den stabilen SystemschlÃ¼ssel der Funktion (z. B. 'Chat.Enabled'). Es ist kein zusÃ¤tzlicher Code erforderlich.",
      backendTitle: "Backend-Struktur",
      backendIntro:
        "Das Berechtigungs-Backend folgt UISs standardmÃ¤ÃŸigem Clean-Architecture-Modullayout mit Domain-, Application- und Infrastructure-Schichten.",
      frontendTitle: "Frontend-Struktur",
      frontendIntro:
        "Das Frontend spiegelt das Backend mit vier Untermodulen (Editionen, Funktionen, Abonnements, Ãœberschreibungen) wider, die alle dem SOLID View/ViewModel-Muster folgen.",
      controllersTitle: "API-Controller",
      controllersIntro:
        "Das Berechtigungsmodul stellt 31 API-Endpunkte Ã¼ber 4 Controller bereit, die alle mit JWT authentifiziert und durch berechtigungsbasierte Autorisierung geschÃ¼tzt sind.",
      noOpTitle: "NoOp-Fallback",
      noOpIntro:
        "Wenn das Berechtigungsmodul nicht geladen ist (z. B. in einem Microservice, der keine Entitlements enthÃ¤lt), registriert SCRIPE einen NoOpFeatureCache. Dadurch kÃ¶nnen IRequireFeature-Befehle fehlerfrei passieren â€” alle Funktionen werden standardmÃ¤ÃŸig als aktiviert behandelt.",
      noOpNote:
        "Das NoOp-Fallback stellt sicher, dass Module IRequireFeature ohne eine feste AbhÃ¤ngigkeit vom Berechtigungsmodul verwenden kÃ¶nnen. Im produktiven Monolith-Modus ist der echte FeatureCache immer verfÃ¼gbar.",
      contextAwareTitle: "Kontextbezogene Bereichseinstellung",
      contextAwareIntro:
        "Alle Berechtigungsseiten (Funktionen, Editionen, Berechtigungen) sind kontextbezogen. Das Frontend erkennt, ob der Benutzer ein Systemadministrator (tenantId ist null), ein Mandanten-Administrator oder im Drill-Down-Modus ist, und ruft entsprechend verschiedene Backend-Endpunkte auf. Systemadministratoren sehen den vollstÃ¤ndigen Katalog mit CRUD; Mandanten-Administratoren sehen nur ihre effektiven Daten im Nur-Lese-Modus.",
      resolutionTip:
        "Die AuflÃ¶sungskette wird Lazy evaluiert â€” Werte werden nach der ersten AuflÃ¶sung zwischengespeichert und invalidiert, wenn sich Abonnements, Editionen oder Ãœberschreibungen Ã¤ndern.",
      cqrsMapTitle: "CQRS Command & Query Map",
      cqrsMapIntro:
        "Das Berechtigungsmodul registriert 31 SCRIPE mediator-Handler, die sich Ã¼ber die vier DomÃ¤nen erstrecken. Jeder Befehl hat einen entsprechenden FluentValidation-Validator zur EingabeÃ¼berprÃ¼fung.",
      diTitle: "Dependency Injection Registrierung",
      diIntro:
        "Alle Berechtigungsdienste werden Ã¼ber die Erweiterungsmethode AddEntitlementsModule in DependencyInjection.cs registriert. Das Modul folgt UISs Standard-Registrierungsmuster.",
      comparisonTitle: "Mit vs. Ohne Berechtigungen",
      comparisonIntro:
        "Die folgende Tabelle zeigt die unterschiedlichen FÃ¤higkeiten, wenn das Berechtigungsmodul aktiviert ist, im Vergleich zum Betrieb ohne dieses Modul:",
      gettingStartedTitle: "Erste Schritte",
      gettingStartedIntro:
        "Befolgen Sie diese 5 Schritte, um das Berechtigungssystem fÃ¼r Ihre Plattform einzurichten. Jeder Schritt baut auf dem vorherigen auf:",
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
    },
    subscriptions: {
      title: "Abonnements",
      description:
        "Mandanten-zu-Editions-Bindung mit vollstÃ¤ndiger Lebenszyklusverwaltung, MehrwÃ¤hrungs-Preisgestaltung, Werbeaktionen, Testversionen, Herabstufungen, Ablaufverhalten und erweiterten Analyse-Exporten.",
      intro:
        "Abonnements verknÃ¼pfen Mandanten mit Editionen (PlÃ¤nen). Jeder Mandant hat ein Basisabonnement, das seine Edition bestimmt, und optional Zusatzabonnements fÃ¼r zusÃ¤tzliche FÃ¤higkeiten. Das Abonnementsystem verwaltet den gesamten Lebenszyklus von der Zuweisung Ã¼ber VerlÃ¤ngerung, Herabstufung, Sperrung bis hin zur KÃ¼ndigung â€” mit integrierter MehrwÃ¤hrungs-Preisgestaltung und Verfolgung von Werberabatten.",
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
        "Alle BetrÃ¤ge werden Ã¼ber ExchangeRateToUsd fÃ¼r konsistente MRR/ARR-Berichte auf USD normalisiert. Das Feld TotalAmountUsd wird zum Abonnementzeitpunkt berechnet und fÃ¼r historische Genauigkeit gespeichert â€” Wechselkursschwankungen Ã¤ndern vergangene Aufzeichnungen nicht rÃ¼ckwirkend.",
      promotionsTitle: "Werberabatte",
      promotionsIntro:
        "Abonnements unterstÃ¼tzen Promo-Codes Ã¼ber das Feld AppliedPromoCode. Bei Anwendung einer gÃ¼ltigen Werbeaktion wird ein PromotionDiscount-Prozentsatz aufgezeichnet und der Anpassungsbetrag spiegelt den auf den Basisbetrag angewandten Rabatt wider. Promotionen werden pro Abonnement fÃ¼r Audits und Analysen verfolgt.",
      exportTitle: "Erweiterter Export & Berichterstattung",
      exportIntro:
        "Das Abonnement-Exportsystem generiert umfassende Berichte in den Formaten CSV, Excel (XLSX) und PDF. Jeder Bericht enthÃ¤lt ein Deckblatt mit Filter-Metadaten, farbcodierte Datentabellen und statistische Zusammenfassungen.",
      exportFiltersTitle: "Export-Filter",
      exportFiltersIntro: "Berichte unterstÃ¼tzen erweiterte Filterung fÃ¼r gezielte Analysen:",
      exportFilterDate:
        "Datumsbereich â€” Filterung nach Abonnement-Erstellungsdatum (letzte 7/30/90 Tage, letztes Jahr oder benutzerdefinierter Bereich)",
      exportFilterExpiring:
        "Bald ablaufend â€” Abonnements finden, die innerhalb von 5/7/14/30/60/90 Tagen ablaufen",
      exportFilterStatus: "Status â€” Aktiv, Gesperrt, GekÃ¼ndigt, Abgelaufen",
      exportFilterEdition: "Edition â€” Filterung nach spezifischem Plan/Edition",
      exportFilterCurrency: "WÃ¤hrung â€” BetrÃ¤ge in ausgewÃ¤hlter WÃ¤hrung anzeigen",
      exportDaysLeftTitle: "Tage bis zum Ablauf",
      exportDaysLeftIntro:
        "Berichte enthalten eine berechnete 'Verbleibende Tage'-Spalte mit bedingter Farbcodierung: Rot (â‰¤7 Tage), Gelb (â‰¤30 Tage), GrÃ¼n (>30 Tage). Dies ermÃ¶glicht die sofortige Identifizierung von Abonnements, die eine VerlÃ¤ngerung benÃ¶tigen.",
      exportFormatsTitle: "Exportformat-Details",
      exportFormatCsv:
        "CSV â€” leichtgewichtig, in jedes Tabellenkalkulationsprogramm oder BI-Tool importierbar",
      exportFormatExcel:
        "XLSX â€” professionelle Excel-Arbeitsmappe mit gestalteten Kopfzeilen, Filter-Metadatenblatt, bedingter Formatierung und automatisch dimensionierten Spalten (ClosedXML)",
      exportFormatPdf:
        "PDF â€” druckfertiges Dokument mit markengebundenem Deckblatt, statistischer Zusammenfassung und paginierten Datentabellen (QuestPDF)",
      renewalTitle: "VerlÃ¤ngerung â€” Neuer-Zeilen-Muster (B2)",
      renewalIntro:
        "VerlÃ¤ngerungen erstellen eine NEUE TenantSubscription-Zeile anstatt den bestehenden Datensatz zu Ã¼berschreiben (Stripe-Muster). Das alte Abonnement wird als abgelaufen markiert (IsActive=false), wÃ¤hrend eine neue Zeile mit frischer Id, StartDate=UtcNow, neu berechneter Preisgestaltung und Ã¼bertragenen Aktionsdetails erstellt wird.",
      renewalAuditTitle: "Umsatz-PrÃ¼fpfad",
      renewalAuditIntro:
        "Jeder Abrechnungszeitraum erzeugt eine unverÃ¤nderliche Datenbankzeile mit zum VerlÃ¤ngerungszeitpunkt festgeschriebenem Preis. Dies ermÃ¶glicht prÃ¤zise Finanzberichte: MRR-Trends, Abwanderungsanalyse pro Zeitraum und RÃ¼ckerstattungsverfolgung pro Zyklus.",
      promoExpiryTitle: "Aktionsablauf-Verfolgung (A1)",
      promoExpiryIntro:
        "Wenn eine Aktion mit DurationDays > 0 angewendet wird, berechnet das System einen PromotionExpiresAt-Zeitstempel. Bei jeder VerlÃ¤ngerung prÃ¼ft der Handler, ob UtcNow > PromotionExpiresAt â€” wenn die Aktion abgelaufen ist, wird der Rabatt entfernt und NICHT in die neue Abonnementzeile Ã¼bernommen.",
      concurrencyTitle: "Optimistische NebenlÃ¤ufigkeit (E1)",
      concurrencyIntro:
        "Jede TenantSubscription hat einen ConcurrencyStamp (Guid) mit [ConcurrencyCheck]. Der Stempel wird bei jedem Schreibvorgang erneuert. Dies verhindert Race Conditions â€” z.B. gleichzeitige KÃ¼ndigung + Abgleichjob â€” durch AuslÃ¶sen einer DbUpdateConcurrencyException bei Kollisionen.",
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
        "Funktionen sind die atomaren Bausteine des Berechtigungssystems. Jede Funktion reprÃ¤sentiert eine steuerbare FÃ¤higkeit â€” einen booleschen Schalter, ein numerisches Kontingent (Quota) oder eine String-Konfiguration. Funktionen haben einen stabilen SystemschlÃ¼ssel (Name), der sich nie Ã¤ndert, sodass sie sicher im Code referenziert werden kÃ¶nnen.",
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
        "Systemfunktionen werden beim Anwendungsstart automatisch vom EntitlementsStartupSeeder geseeded. Der Seeder prÃ¼ft, ob jede Systemfunktion bereits existiert (nach Name) und erstellt nur fehlende â€” vorhandene Funktionen werden niemals Ã¼berschrieben.",
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
        "MaÃŸgeschneiderte Enterprise-Deals â€” 'Acme Corp 500 Administratoren statt der standardmÃ¤ÃŸigen 50 geben'",
      useCase2: "Werbeangebote â€” 'Premium-Chat fÃ¼r diesen Mandanten fÃ¼r 30 Tage aktivieren'",
      useCase3: "Beta-Tests â€” 'Das neue Rechnungsmodul fÃ¼r Early Adopters aktivieren'",
      useCase4:
        "VorÃ¼bergehende ErhÃ¶hung â€” 'Datei-Upload-Limit wÃ¤hrend ihrer Migration erhÃ¶hen'",
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
        "Geben Sie beim Festlegen von Ãœberschreibungen immer einen Grund an â€” dies macht Audit-Trails aussagekrÃ¤ftig und hilft zukÃ¼nftigen Administratoren zu verstehen, warum die Ãœberschreibung angewendet wurde.",
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

    compliance: {
      overview: {
        title: "Compliance-Modul",
        description:
          "GDPR, CCPA und PDPA Compliance-Automatisierung â€” Richtlinien, DSR-Verarbeitung, Einwilligungsmanagement, Datenaufbewahrung, Inventar und Berichtserstellung.",
        intro:
          "Das Compliance-Modul ist die integrierte Regulierungs-Engine von SCRIPE. Es hilft Betreibern und deren Mandanten, Datenschutzgesetze (GDPR, CCPA, PDPA) durch automatisierte Werkzeuge einzuhalten.",
        infoTitle: "Compliance-Hinweis",
        infoContent:
          "Das Modul ist entscheidend fÃ¼r die Einhaltung gesetzlicher Vorschriften und die Vermeidung von Strafen. Stellen Sie sicher, dass alle Funktionen korrekt den Datenverarbeitungsrichtlinien zugeordnet sind.",
        descDsr: "Verarbeitet Betroffenenanfragen (Export, LÃ¶schung, Berichtigung)",
        descConsent: "UnverÃ¤nderliche Verfolgung von Einwilligungsstatus und Snapshots",
        descRet: "Setzt DatenlÃ¶schrichtlinien basierend auf dem Alter durch",
        descInv: "Ordnet sensible PII-Standorte modulÃ¼bergreà¤¦à¤¾à¤¤à¤¾à¤“à¤‚ zu",
        descRep: "Generiert RoPA- und DPIA-Compliance-Berichte",
        descId: "IdentitÃ¤tsmodul",
        descIdDesc: "Bietet Benutzer-/Admin-Kontext und Authentifizierung",
        descEnt: "Berechtigungsmodul",
        descEntDesc: "Steuert Compliance-Funktionen Ã¼ber Feature-Gates",
        conn1: "initiiert Anfragen",
        conn2: "gewÃ¤hrt/widerruft",
        conn3: "steuert Richtlinien",
        conn4: "leitet LÃ¶schung an",
        conn5: "zielt auf Daten",
        conn6: "Audit-Trails",
        conn7: "Audit-Trails",
        th1: "Komponente",
        th2: "Verantwortung",
        tr1_1: "DsrListViewModel",
        tr1_2:
          "Behandelt Paginierung, Filterung und Zuweisung von eingehenden Betroffenenanfragen.",
        tr2_1: "ConsentRecordView",
        tr2_2: "Rendert den unverÃ¤nderlichen Einwilligungs-Snapshot zusammen mit Metadaten.",
        whatIsTitle: "Was ist das Compliance-Modul?",
        whatIsIntro:
          "Das Modul bietet sechs miteinander verbundene Subsysteme, die den gesamten Compliance-Lebenszyklus abdecken. Mandanten erhalten ein produktionsbereites System.",
        subModulesTitle: "Sechs Subsysteme",
        subModulesIntro: "Jedes Subsystem behandelt eine bestimmte Compliance-DomÃ¤ne:",
        sub1: "Regulierungsprofile â€” Speichert die rechtlichen Rahmenbedingungen (GDPR, CCPA, PDPA).",
        sub2: "Betroffenenanfragen (DSR) â€” Verwaltet Anfragen zu Rechten der Betroffenen (Export, LÃ¶schung, Berichtigung, EinschrÃ¤nkung).",
        sub3: "Einwilligungsmanagement â€” Protokolliert, verfolgt und prÃ¼ft die Erteilung und den Widerruf von Benutzereinwilligungen.",
        sub4: "Datenaufbewahrungsrichtlinien â€” Definiert, wie lange Daten aufbewahrt werden und was bei Ablauf geschieht (LÃ¶schen oder Anonymisieren).",
        sub5: "Dateninventar â€” Ein Register aller personenbezogenen Datenkategorien, die die Plattform verarbeitet.",
        sub6: "Compliance-Berichte â€” Generiert asynchrone, revisionssichere Berichte (GDPR-Ãœbersicht, DSR-Zusammenfassung usw.).",
        backendTitle: "Backend-Architektur",
        backendIntro:
          "Folgt dem SCRIPE-Standardlayout fÃ¼r 3-Projekt-Module (Domain / Application / Infrastructure) mit ComplianceDbContext.",
        frontendTitle: "Frontend-Architektur",
        frontendIntro:
          "Organisiert in sechs unabhÃ¤ngigen Submodulen unter src/modules/compliance/, die dem View/ViewModel-Muster folgen.",
        endpointsTitle: "API Endpoints Ãœbersicht",
        endpointsIntro:
          "Alle Endpoints befinden sich unter /api/v1/compliances/ und erfordern eine Authentifizierung mit compliance.view.",
      },
      dsr: {
        title: "Betroffenenanfragen (DSR)",
        description:
          "GDPR/CCPA-Rechteanfragen verwalten â€” Export, LÃ¶schung, Berichtigung und EinschrÃ¤nkung.",
        intro:
          "Betroffenenanfragen (DSRs) sind formelle Anfragen von Einzelpersonen zur AusÃ¼bung ihrer Rechte. Das Modul bietet einen vollstÃ¤ndigen DSR-Workflow.",
        typesTitle: "Anfragetypen",
        typesIntro: "Das System unterstÃ¼tzt vier DSR-Typen gemÃ¤ÃŸ DSGVO-Artikel 17 und CCPA:",
        type1:
          "Export â€” Recht auf DatenÃ¼bertragbarkeit. Die betroffene Person wÃ¼nscht eine Kopie.",
        type2:
          "LÃ¶schung â€” Recht auf Vergessenwerden. Alle personenbezogenen Daten mÃ¼ssen gelÃ¶scht oder anonymisiert werden.",
        type3: "Berichtigung â€” Korrekturanfrage. Ungenaue Daten mÃ¼ssen aktualisiert werden.",
        type4:
          "EinschrÃ¤nkung â€” VerarbeitungsbeschrÃ¤nkung. Daten kÃ¶nnen gespeichert, aber nicht aktiv verarbeitet werden.",
        lifecycleTitle: "Anfrage-Lebenszyklus",
        lifecycleIntro: "DSRs durchlaufen eine definierte Reihe von Statuswerten:",
        status1: "Ausstehend (Pending) â€” AnfÃ¤nglicher Zustand bei Erhalt.",
        status2: "In Bearbeitung (InProgress) â€” Ein Compliance-Beauftragter wurde zugewiesen.",
        status3: "Abgeschlossen (Completed) â€” Die Anfrage wurde erfÃ¼llt.",
        status4:
          "Abgelehnt (Rejected) â€” Die Anfrage wurde abgelehnt (z. B. unzureichende IdentitÃ¤tsprÃ¼fung).",
        slasTitle: "GDPR SLA-Anforderungen",
        slasIntro:
          "GemÃ¤ÃŸ Artikel 12 DSGVO mÃ¼ssen Verantwortliche innerhalb von 30 Tagen auf DSRs reagieren (auf 3 Monate verlÃ¤ngerbar). SCRIPE verfolgt dies.",
        lifecycleFlowTitle: "DSR-Lebenszyklus-Flow",
        nodeSubmit: "Anfrage einreichen",
        descSubmit: "Betroffener beantragt Export, LÃ¶schung oder Berichtigung",
        nodePending: "Status: Ausstehend",
        descPending: "Anfrage wird protokolliert, SLA-Frist berechnet",
        nodeProcessing: "Status: In Bearbeitung",
        descProcessing: "DsrExecutionJob beginnt mit der Verarbeitung der Module",
        nodeApproval: "Auf Admin warten",
        descApproval: "Nukleare Aktionen (LÃ¶schung) erfordern manuelle Admin-BestÃ¤tigung",
        nodeCompleted: "Status: Abgeschlossen",
        descCompleted: "Export generiert oder Daten gelÃ¶scht; SLA erfÃ¼llt",
        nodeRejected: "Status: Abgelehnt",
        descRejected: "Anfrage vom Admin mit LÃ¶sungsnotizen abgelehnt",
        conn1: "initiiert",
        conn2: "Hintergrundjob Ã¼bernimmt",
        conn3: "wenn automatisch verarbeitet (Export)",
        conn4: "wenn nuklear (LÃ¶schung)",
        conn5: "Admin bestÃ¤tigt",
        conn6: "Admin lehnt ab",
        entitiesTitle: "EntitÃ¤ten",
        entityName: "EntitÃ¤tsname",
        entityDesc: "Beschreibung",
        entityDsrDesc: "Stellt eine Betroffenenanfrage dar.",
        entityModuleDesc: "AusfÃ¼hrungsstatus eines Moduls.",
        entityStatusDesc: "Verlauf der StatusÃ¤nderungen.",
        codeTitle: "Code-Beispiel",
        endpointsTitle: "API Endpoints",
        endpointsIntro: "Der DSR-Controller stellt 6 Endpoints zur VerfÃ¼gung:",
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
          "Einwilligungen aufzeichnen, verfolgen und prÃ¼fen fÃ¼r GDPR-Artikel 6 und CCPA.",
        intro:
          "Das Einwilligungsmanagement protokolliert jedes Mal, wenn ein Benutzer eine Einwilligung erteilt oder widerruft. SCRIPE speichert den vollstÃ¤ndigen Audit-Trail.",
        purposesTitle: "Zwecke der Einwilligung",
        purposesIntro: "Jeder Einwilligungsdatensatz ist an einen bestimmten Zweck gebunden:",
        purpose1: "Marketing â€” E-Mail-Marketing und werbliche Kommunikation.",
        purpose2: "Analyse â€” Nutzungsanalysen und Produktverbesserungen.",
        purpose3: "Drittanbieter â€” Datenfreigabe an Drittanbieter-Dienste.",
        purpose4: "Personalisierung â€” Personalisierte Inhalte und Empfehlungen.",
        gdprTitle: "GDPR Rechtsgrundlage",
        gdprIntro:
          "GemÃ¤ÃŸ Artikel 6 DSGVO muss die Einwilligung freiwillig, spezifisch, informiert und unmissverstÃ¤ndlich sein. SCRIPE speichert den exakten Text.",
        withdrawalTitle: "Widerruf der Einwilligung",
        withdrawalIntro:
          "Benutzer kÃ¶nnen ihre Einwilligung jederzeit widerrufen. ConsentRecord wird mit WithdrawnAt aktualisiert.",
        flowTitle: "Einwilligungs-Status-Flow",
        nodePurpose: "Zweck der Einwilligung",
        descPurpose: "Definiert, worin eingewilligt wird (z. B. Marketing)",
        nodeRecord: "Einwilligungsdatensatz",
        descRecord: "Aktueller Status des Benutzers (Erteilt/Widerrufen) pro Zweck",
        nodeSnapshot: "Einwilligungs-Snapshot",
        descSnapshot: "UnverÃ¤nderliche Momentaufnahme der Erteilung/Widerrufung",
        nodeJob: "Ablauf-Job fÃ¼r Einwilligung",
        descJob: "TÃ¤glicher Job widerruft abgelaufene Einwilligungen",
        conn1: "Vorlagen",
        conn2: "generiert bei Ã„nderung",
        conn3: "automatischer Widerruf bei Ablauf",
        immutabilityTitle: "UnverÃ¤nderlichkeit",
        immutabilityIntro: "EinwilligungsdatensÃ¤tze sind unverÃ¤nderlich.",
        endpointsTitle: "API Endpoints",
        ep: {
          list: "Alle EinwilligungsdatensÃ¤tze auflisten",
          get: "Einwilligungsdatensatz nach ID abrufen",
          record: "Neue Einwilligungserteilung aufzeichnen",
          withdraw: "Eine zuvor erteilte Einwilligung widerrufen",
        },
      },
      retention: {
        title: "Datenaufbewahrungsrichtlinien",
        description:
          "Definieren Sie Aufbewahrungsfristen und automatische Ablaufaktionen (LÃ¶schen oder Anonymisieren) fÃ¼r DSGVO-Artikel 5(1)(e).",
        intro:
          "Aufbewahrungsrichtlinien definieren, wie lange Daten aufbewahrt werden mÃ¼ssen. SCRIPE setzt diese automatisch durch.",
        policiesTitle: "Richtlinienkonfiguration",
        policiesIntro: "Jede Richtlinie legt Folgendes fest:",
        field1: "DataCategory â€” Datentyp (z. B. 'Benutzerprofile').",
        field2: "RetentionDays â€” Wie viele Tage die Daten aufbewahrt werden mÃ¼ssen.",
        field3:
          "ExpiryAction â€” Was bei Ablauf geschieht: Delete (LÃ¶schen) oder Anonymize (Anonymisieren).",
        field4: "RegulationCode â€” Welche Verordnung dies erfordert (GDPR, CCPA usw.).",
        actionsTitle: "Ablaufaktionen",
        actionsIntro: "Bei Ablauf wendet SCRIPE eine von zwei Aktionen an:",
        action1: "Delete â€” LÃ¶scht dauerhaft alle passenden DatensÃ¤tze.",
        action2: "Anonymize â€” Ersetzt personenbezogene Daten durch pseudonyme Token.",
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
          "Ein Register aller verarbeiteten personenbezogenen Datenkategorien â€” erforderlich fÃ¼r GDPR Artikel 30 (RoPA).",
        intro:
          "Das Dateninventar ist ein strukturiertes Register. GemÃ¤ÃŸ Artikel 30 DSGVO mÃ¼ssen Verantwortliche ein Verzeichnis von VerarbeitungstÃ¤tigkeiten (RoPA) fÃ¼hren.",
        fieldsTitle: "Inventarfelder",
        fieldsIntro: "Jedes Element dokumentiert:",
        field1: "DataCategory â€” Lesbarer Name der Kategorie (z. B. 'E-Mail-Adressen').",
        field2:
          "LegalBasis â€” DSGVO-Rechtsgrundlage fÃ¼r die Verarbeitung (Einwilligung, Vertrag usw.).",
        field3: "DataSubjects â€” Wem die Daten gehÃ¶ren (z. B. 'Endbenutzer').",
        field4: "ProcessingPurpose â€” Warum die Daten verarbeitet werden (z. B. 'Marketing').",
        field5: "StorageLocation â€” Wo die Daten gespeichert sind (Land/Region).",
        field6: "RetentionPeriod â€” Wie lange die Daten aufbewahrt werden.",
        field7: "ThirdPartySharing â€” Ob Daten mit Dritten geteilt werden.",
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
        type1: "GDPR-Ãœbersicht â€” Zusammenfassung des DSGVO-Compliance-Status.",
        type2:
          "DSR-AktivitÃ¤tszusammenfassung â€” Statistiken zu DSR-Volumen, Typen und SLA-Einhaltung.",
        type3: "Einwilligungs-Audit â€” VollstÃ¤ndiges Protokoll der Einwilligungen und Widerrufe.",
        type4: "Aufbewahrungsanalyse â€” Aktueller Durchsetzungsstatus aller aktiven Richtlinien.",
        type5:
          "Dateninventar-Export â€” VollstÃ¤ndiger Export des Dateninventars (Artikel 30 RoPA).",
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
  },
};

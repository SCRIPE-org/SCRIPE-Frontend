/**
 * Docs page locale — DE
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const de = {
  commercial: {
    entOverview: {
      title: "Berechtigungsübersicht",
      description:
        "Eine vollständige, unternehmenstaugliche Berechtigungs-Engine, die Ihre Plattform in ein differenziertes SaaS-Produkt mit Editionen, Abonnements und mandantenspezifischer Funktionssteuerung verwandelt.",
      intro:
        "Hören Sie auf, Planprüfungen in Ihrer Codebasis fest zu verdrahten. Das Berechtigungsmodul von SCRIPE bietet eine Full-Stack-Feature-Gating-Engine auf API-Ebene, die automatisch durchsetzt, was jeder Mandant tun darf und was nicht — basierend auf seiner abonnierten Edition, aktiven Überschreibungen und Echtzeit-Kontingentzählern.",
      whyTitle: "Warum integrierte Berechtigungen?",
      whyContent:
        "Die meisten SaaS-Plattformen flanschen Feature-Flags als nachträglichen Gedanken an. SCRIPE integriert Berechtigungen über die IRequireFeature-Schnittstelle direkt in die CQRS-Pipeline, was bedeutet, dass jeder Befehl automatisch überwacht werden kann, ohne eine einzige Zeile benutzerdefinierter Middleware.",
      fgEditions: "Editionen (Pläne)",
      fgEditionsDesc:
        "Benannte Funktionsbündel wie Basic, Pro, Enterprise, die definieren, was jeder Plan beinhaltet.",
      fgSubscriptions: "Abonnement-Lebenszyklus",
      fgSubscriptionsDesc:
        "Weisen Sie Mandantenabonnements zu, stufen Sie sie hoch, stufen Sie sie herab, sperren und verlängern Sie sie mit vollständigen Audit-Trails.",
      fgFeatures: "Funktionskatalog",
      fgFeaturesDesc:
        "Boolesche, numerische und String-Funktionstypen mit systemseitig geseedeten Standards und benutzerdefinierter Erweiterbarkeit.",
      fgOverrides: "Mandantenspezifische Überschreibungen",
      fgOverridesDesc:
        "Passen Sie jeden Funktionswert für einzelne Mandanten an — perfekt für Enterprise-Deals oder Beta-Zugang.",
      fgQuotas: "Kontingentdurchsetzung",
      fgQuotasDesc:
        "Numerische Funktionen mit QuotaCounter-Entitäten werden automatisch auf Pipeline-Ebene durchgesetzt.",
      fgVersioning: "Versionierung & Rollout",
      fgVersioningDesc:
        "Stellen Sie Editionsänderungen über sofortige, Canary- oder geplante Rollout-Strategien bereit.",
      howTitle: "Wie es funktioniert",
      howContent:
        "Jeder API-Befehl, der IRequireFeature implementiert, wird von der FeatureCheckBehavior-Pipeline abgefangen. Das System ermittelt die effektiven Funktionswerte des Mandanten (Überschreibungen → Edition → Standards) und erlaubt entweder die Ausführung oder gibt eine klare 'Funktion deaktiviert'-Antwort zurück.",
      resolutionTitle: "Auflösungspriorität",
      resolutionContent:
        "Wenn das System einen Funktionswert für einen Mandanten auflöst, prüft es die Quellen in strikter Prioritätsreihenfolge. Die erste Quelle, die einen Wert liefert, gewinnt.",
      tblResH1: "Priorität",
      tblResH2: "Quelle",
      tblResH3: "Anwendungsfall",
      tblResR1C1: "1 (Höchste)",
      tblResR1C2: "Mandanten-Überschreibung",
      tblResR1C3: "Maßgeschneiderte Enterprise-Deals, Promotionen, Beta-Tests",
      tblResR2C1: "2",
      tblResR2C2: "Aktives Abonnement → Edition",
      tblResR2C3: "Standardmäßiger planbasierter Funktionszugriff",
      tblResR3C1: "3",
      tblResR3C2: "Zusatzabonnements",
      tblResR3C3: "Separat erworbene optionale Funktionspakete",
      tblResR4C1: "4 (Niedrigste)",
      tblResR4C2: "Funktions-Standardwert",
      tblResR4C3: "Fallback, wenn keine andere Quelle zutrifft",
      valueTitle: "Geschäftswert",
      tblValH1: "Herausforderung",
      tblValH2: "Ohne SCRIPE",
      tblValH3: "Mit SCRIPE-Berechtigungen",
      tblValR1C1: "Plan-Differenzierung",
      tblValR1C2: "Fest verdrahtete if/else-Prüfungen überall verstreut",
      tblValR1C3: "Automatisches Pipeline-Gating pro Edition",
      tblValR2C1: "Individuelle Enterprise-Deals",
      tblValR2C2: "Code-Deployments für jeden Sonderfall",
      tblValR2C3: "Mandantenspezifische Überschreibungen per API in Sekunden",
      tblValR3C1: "Nutzungslimits",
      tblValR3C2: "Manuelles Zählen und Validieren",
      tblValR3C3: "Automatische QuotaCounter-Durchsetzung",
      tblValR4C1: "Planänderungen",
      tblValR4C2: "Riskante Datenbankmigrationen",
      tblValR4C3: "Echtzeit-Upgrade/Downgrade mit Auswirkungsanalyse",
      tblValR5C1: "Funktions-Rollouts",
      tblValR5C2: "Big-Bang-Deployments, die alle Mandanten gefährden",
      tblValR5C3: "Canary- und geplante Rollout-Strategien",
      tip: "Das Berechtigungsmodul ist vollständig in die AstraFlow mediator-Pipeline integriert. Befehle, die IRequireFeature implementieren, werden automatisch überwacht — Ihre Geschäftslogik bleibt sauber und fokussiert.",
    },
    entEditions: {
      title: "Editionen & Pläne",
      description:
        "Definieren, verwalten und versionieren Sie Ihre SaaS-Produktpläne mit der leistungsstarken Editions-Engine von SCRIPE.",
      intro:
        "Editionen sind die Bausteine Ihrer SaaS-Preisstrategie. Jede Edition bündelt eine spezifische Gruppe von Funktionswerten (boolesche Schalter, numerische Limits, String-Konfigurationen) in einen benannten Plan, der Mandanten über Abonnements zugewiesen werden kann.",
      whatTitle: "Was sind Editionen?",
      whatContent:
        "Eine Edition ist ein benannter Plan (z. B. 'Basic', 'Pro', 'Enterprise'), der eine bestimmte Kombination von Funktionswerten definiert. Wenn ein Mandant eine Edition abonniert, erhält er automatisch Zugriff auf genau die Funktionen, die diese Edition definiert — nicht mehr und nicht weniger.",
      scopeTitle: "System- vs. Retail-Editionen",
      tblScopeH1: "Bereich",
      tblScopeH2: "Erstellt von",
      tblScopeH3: "Anwendungsfall",
      tblScopeR1C1: "System",
      tblScopeR1C2: "Plattformbesitzer (Root-Mandant)",
      tblScopeR1C3:
        "Globale Pläne, die allen Mandanten zur Verfügung stehen (Basic, Pro, Enterprise)",
      tblScopeR2C1: "Retail",
      tblScopeR2C2: "Reseller-Mandanten",
      tblScopeR2C3: "Benutzerdefinierte Pläne für Unter-Mandanten (White-Label-Reselling)",
      overflowTitle: "Überlaufrichtlinien (Overflow Policies)",
      overflowContent:
        "Wenn ein Mandant die Limits seiner Edition überschreitet, bestimmt die Überlaufrichtlinie das Verhalten. Dies schafft natürliche Upsell-Pfade, ohne die Benutzererfahrung zu beeinträchtigen.",
      overflowUpgrade: "Upgrade vorschlagen",
      overflowUpgradeDesc:
        "Wenn Limits erreicht sind, gibt das System einen Upgrade-Vorschlag zurück, der auf die Überlauf-Edition verweist — und schafft so einen nahtlosen Upsell-Pfad.",
      overflowBlock: "Harte Blockade (Hard Block)",
      overflowBlockDesc:
        "Limit strikt durchsetzen. Befehle werden mit einer klaren Fehlermeldung abgelehnt, die anzeigt, dass die Funktion für den aktuellen Plan ausgelastet ist.",
      versionTitle: "Versionierung & Rollouts",
      versionContent:
        "Editionsversionen ermöglichen es Ihnen, Planfunktionen zu ändern, ohne bestehende Abonnenten zu stören. Erstellen Sie eine neue Version mit aktualisierten Funktionswerten und wählen Sie dann Ihre Rollout-Strategie.",
      tblRollH1: "Strategie",
      tblRollH2: "Verhalten",
      tblRollH3: "Am besten für",
      tblRollR1C1: "Sofortig",
      tblRollR1C2: "Alle abonnierten Mandanten werden sofort aktualisiert",
      tblRollR1C3: "Fehlerbehebungen, Sicherheitspatches",
      tblRollR2C1: "Canary",
      tblRollR2C2: "Prozentbasierter, schrittweiser Rollout",
      tblRollR2C3: "Funktionsexperimente, Risikominderung",
      tblRollR3C1: "Geplant",
      tblRollR3C2: "Bereitstellung zu einem bestimmten Datum/Uhrzeit",
      tblRollR3C3: "Abgestimmte Produkteinführungen, Abrechnungszyklen",
      apiTitle: "API-Endpunkte",
      tip: "Editionen werden niemals aus der Datenbank gelöscht — sie werden weich gelöscht (soft-deleted), um den Abonnementverlauf und die Audit-Trails zu erhalten. Aktive Abonnements verhindern das Löschen von Editionen vollständig.",
    },
    entSubscriptions: {
      title: "Abonnementverwaltung",
      description:
        "Vollständige Lebenszyklusverwaltung für Mandantenabonnements mit Mehrwährungspreisen, Aktionsrabatten, Analyse der Upgrade-/Downgrade-Auswirkungen, Testversionen, Ablaufbehandlung und umfassendem Analytik-Export.",
      intro:
        "Abonnements sind die Brücke zwischen Mandanten und Editionen. Sie definieren, in welchem Plan sich ein Mandant befindet, wann er beginnt und abläuft, und wie sich das System verhält, wenn sich der Abonnement-Lebenszyklus ändert. Mit integrierter Mehrwährungspreisgestaltung und Aktionsrabatt-Tracking bietet SCRIPE alles, was Sie für die Monetarisierung benötigen.",
      lifecycleTitle: "Abonnement-Lebenszyklus",
      lifecycleContent:
        "Jedes Abonnement folgt einem klar definierten Zustandsautomaten. Das System erzwingt automatisch gültige Übergänge und gibt in jeder Phase Domänenereignisse für Audit- und Integrationszwecke aus.",
      typesTitle: "Abonnementtypen",
      tblTypeH1: "Typ",
      tblTypeH2: "Dauer",
      tblTypeH3: "Anwendungsfall",
      tblTypeR1C1: "Standard",
      tblTypeR1C2: "Fester Zeitraum mit Ablaufdatum",
      tblTypeR1C3: "Reguläre kommerzielle Abonnements",
      tblTypeR2C1: "Testversion (Trial)",
      tblTypeR2C2: "Kurzfristiger Evaluierungszeitraum",
      tblTypeR2C3: "Kostenlose Testversionen, die automatisch konvertiert werden oder ablaufen",
      tblTypeR3C1: "Add-on",
      tblTypeR3C2: "Ergänzung zum Hauptabonnement",
      tblTypeR3C3: "Zusätzliche Funktionspakete (z. B. zusätzlicher Speicher)",
      pricingTitle: "Mehrwährungs-Preis-Engine",
      pricingContent:
        "Jedes Abonnement speichert seine Preise in der lokalen Währung des Mandanten und normalisiert automatisch auf USD für einheitliche Umsatzanalysen. Unterstützung für 9+ Währungen sofort einsatzbereit — USD, EUR, GBP, SAR, AED, EGP, TRY, INR und mehr.",
      tblPriceH1: "Feld",
      tblPriceH2: "Zweck",
      tblPriceH3: "Beispiel",
      tblPriceR1C1: "Currency",
      tblPriceR1C2: "ISO 4217-Währungscode für dieses Abonnement",
      tblPriceR1C3: "SAR, USD, EUR",
      tblPriceR2C1: "BaseAmount",
      tblPriceR2C2: "Originalpreis vor Anpassungen",
      tblPriceR2C3: "499.00",
      tblPriceR3C1: "AdjustmentAmount",
      tblPriceR3C2: "Angewandter Rabatt oder Zuschlag",
      tblPriceR3C3: "-49.90 (10% Aktion)",
      tblPriceR4C1: "TotalAmount",
      tblPriceR4C2: "Endbetrag in lokaler Währung",
      tblPriceR4C3: "449.10",
      tblPriceR5C1: "ExchangeRateToUsd",
      tblPriceR5C2: "Kurs zur Normalisierung auf USD",
      tblPriceR5C3: "0.2667",
      tblPriceR6C1: "TotalAmountUsd",
      tblPriceR6C2: "Normalisierter USD-Wert für Analytik",
      tblPriceR6C3: "119.76",
      promoTitle: "Aktionsrabatte",
      promoContent:
        "Fördern Sie Akquise und Kundenbindung mit integrierter Aktionscode-Unterstützung in jedem Abonnement. Angewandte Aktionen werden mit Codename und Rabattprozentsatz für volle Audit- und Analytik-Transparenz verfolgt.",
      fgPromoCode: "Aktionscode-Tracking",
      fgPromoCodeDesc:
        "Jedes Abonnement zeichnet seinen AppliedPromoCode und den PromotionDiscount-Prozentsatz auf. Analytik-Dashboards zeigen, welche Aktionen die meisten Konversionen generieren.",
      fgPromoAdjust: "Automatische Anpassung",
      fgPromoAdjustDesc:
        "Wenn eine Aktion angewendet wird, wird AdjustmentAmount automatisch aus BaseAmount × PromotionDiscount berechnet, um konsistente Preisgestaltung über alle Abonnements zu gewährleisten.",
      opsTitle: "Schlüsseloperationen",
      opsAssign: "Abonnement zuweisen",
      opsAssignDesc:
        "Verknüpfen Sie einen Mandanten mit einer Edition mit Startdatum, Dauer, Währung, optionalem Aktionscode und automatischer Verlängerungskonfiguration.",
      opsUpgrade: "Plan-Upgrade",
      opsUpgradeDesc:
        "Mandanten in eine höhere Edition verschieben. Neue Funktionen sind sofort verfügbar und die Abonnementlaufzeit kann angepasst werden.",
      opsDowngrade: "Plan-Downgrade",
      opsDowngradeDesc:
        "In eine niedrigere Edition wechseln. Das System bietet eine vollständige Auswirkungsanalyse, die zeigt, welche Funktionen vor der Bestätigung verloren gehen.",
      opsImpact: "Auswirkungsanalyse",
      opsImpactDesc:
        "Vor jedem Downgrade liefert die API eine detaillierte Analyse der betroffenen Funktionen und der aktuellen Nutzung — um überraschenden Datenverlust zu vermeiden.",
      expiryTitle: "Ablaufverhalten",
      tblExpH1: "Richtlinie",
      tblExpH2: "Verhalten",
      tblExpH3: "Anwendungsfall",
      tblExpR1C1: "Nachfrist (Grace Period)",
      tblExpR1C2: "Funktionen bleiben nach Ablauf für N Tage aktiv",
      tblExpR1C3: "Kunden Zeit zur Verlängerung geben",
      tblExpR2C1: "Sofortige Blockade",
      tblExpR2C2: "Funktionen werden deaktiviert, sobald das Abonnement abläuft",
      tblExpR2C3: "Strikte Kontingentdurchsetzung",
      tblExpR3C1: "Fallback-Edition",
      tblExpR3C2: "Automatisch auf die Standard-Edition (kostenlos) herabstufen",
      tblExpR3C3: "Freemium-Modelle mit kostenpflichtigen Upgrades",
      exportTitle: "Erweiterter Analytik-Export",
      exportContent:
        "Erstellen Sie umfassende Abonnement-Analytikberichte in den Formaten CSV, Excel und PDF. Berichte enthalten erweiterte Filterung (Datumsbereich, bald ablaufend, Status, Edition), Mehrwährungsanzeige und farbcodierte Ablaufindikatoren.",
      fgExportCsv: "CSV-Export",
      fgExportCsvDesc:
        "Leichtes kommagetrennntes Format, ideal für Datenanalyse und Import in BI-Tools wie Power BI, Tableau oder Google Sheets.",
      fgExportExcel: "Excel-Export",
      fgExportExcelDesc:
        "Professionelle XLSX-Arbeitsmappe mit gestylten Kopfzeilen, Filter-Metadaten, bedingter Formatierung für Ablaufdaten und automatisch angepassten Spalten — betrieben von ClosedXML.",
      fgExportPdf: "PDF-Export",
      fgExportPdfDesc:
        "Druckfertiges Dokument mit gebrandetem Deckblatt, statistischer Zusammenfassung und paginierten Datentabellen mit farbcodierter 'Verbleibende Tage'-Spalte — betrieben von QuestPDF.",
      enterpriseTitle: "Enterprise-Abonnementverwaltung",
      renewalTitle: "Unveränderlicher Umsatz-Prüfpfad",
      renewalDesc:
        "Verlängerungen erstellen NEUE Abonnementzeilen statt bestehende Datensätze zu überschreiben. Jeder Abrechnungszyklus bewahrt festgeschriebene Preise für präzise MRR-Trends und Finanzprüfungen.",
      promoExpiryTitle: "Intelligente Aktionsablauf-Verwaltung",
      promoExpiryDesc:
        "Zeitgebundene Aktionen werden automatisch über PromotionExpiresAt verfolgt. Bei Verlängerung werden abgelaufene Aktionen entfernt — neue Preise gelten nahtlos.",
      concurrencyTitle: "Schutz vor Race Conditions",
      concurrencyDesc:
        "Optimistische Nebenläufigkeitsstempel auf jedem Abonnement verhindern Kollisionen zwischen parallelen Operationen. Unternehmenstaugliche Datenintegrität ohne Leistungseinbußen.",
      validationTitle: "Eingabevalidierung auf Pipeline-Ebene",
      validationDesc:
        "Alle 8 Abonnement-Befehle sind durch FluentValidation-Validatoren mit vollständig lokalisierten Fehlermeldungen in Englisch und Arabisch geschützt.",
      crossModuleTitle: "Modulübergreifende Admin-Integration",
      crossModuleDesc:
        "Abonnement-Lebenszyklus-Ereignisse kaskadieren automatisch zur Identitätsverwaltung. Bei Aussetzung werden alle Mandanten-Admins sicher deaktiviert. Bei Wiederaufnahme werden nur aussetzungsbedingt deaktivierte Admins reaktiviert.",
      apiTitle: "API-Endpunkte",
      tip: "Die API zur Analyse der Downgrade-Auswirkungen ist ein leistungsstarkes Tool zur Kundenbindung. Zeigen Sie Kunden genau, was sie verlieren, bevor sie ein Downgrade durchführen — so entstehen natürliche Bindungsmomente.",
    },
    entFeatures: {
      title: "Funktionsverwaltung (Feature Management)",
      description:
        "Definieren, kategorisieren und erzwingen Sie boolesche, numerische und String-Funktionen mit automatischer Kontingentverfolgung und hochleistungsfähigem Caching.",
      intro:
        "Funktionen sind die atomaren Bausteine Ihres Berechtigungssystems. Jede Fähigkeit, die pro Plan umgeschaltet, begrenzt oder konfiguriert werden kann, wird als Funktion definiert. Das System unterstützt drei Wertetypen, automatisches Seeding und Kontingentdurchsetzung in Echtzeit.",
      typesTitle: "Funktionswertetypen",
      typesContent:
        "Jede Funktion hat einen bestimmten Wertetyp, der bestimmt, wie sie über Editionen und Überschreibungen hinweg evaluiert, gespeichert und durchgesetzt wird.",
      tblTypeH1: "Typ",
      tblTypeH2: "Werte",
      tblTypeH3: "Beispiel",
      tblTypeH4: "Durchsetzung",
      tblTypeR1C1: "Boolesch",
      tblTypeR1C2: "true / false",
      tblTypeR1C3: "ApiAccess, CustomDomain, SSO",
      tblTypeR1C4: "Feature-Gate: Zulassen oder blockieren",
      tblTypeR2C1: "Numerisch",
      tblTypeR2C2: "Ganzzahliger Wert",
      tblTypeR2C3: "MaxUsers: 50, StorageGB: 100",
      tblTypeR2C4: "QuotaCounter: Automatisch ablehnen, wenn überschritten",
      tblTypeR3C1: "String",
      tblTypeR3C2: "Freitext",
      tblTypeR3C3: "SupportTier: 'Priority', Theme: 'dark'",
      tblTypeR3C4: "Konfigurationswert, keine Durchsetzung",
      systemTitle: "System- vs. Benutzerdefinierte Funktionen",
      fgSystem: "Systemfunktionen",
      fgSystemDesc:
        "Beim Anwendungsstart vorab geseedet. Unveränderlich und immer vorhanden. Definieren Sie die Kernfunktionen Ihrer Plattform (z. B. MaxUsers, ApiAccess).",
      fgCustom: "Benutzerdefinierte Funktionen",
      fgCustomDesc:
        "Werden von Administratoren zur Laufzeit über die API erstellt. Perfekt für modulspezifische Funktionen, die sich mit dem Wachstum Ihres Produkts entwickeln.",
      quotaTitle: "Automatische Kontingentdurchsetzung",
      quotaContent:
        "Numerische Funktionen können zugehörige QuotaCounter-Entitäten haben, die die Nutzung in Echtzeit verfolgen. Wenn ein Befehl IRequireFeature für eine numerische Funktion implementiert, vergleicht die FeatureCheckBehavior-Pipeline automatisch die aktuelle Anzahl mit dem zulässigen Limit.",
      cacheTitle: "Hochleistungs-Feature-Caching",
      cacheContent:
        "Aufgelöste Funktionswerte werden pro Mandant aggressiv zwischengespeichert, um Autorisierungsprüfungen ohne Latenz zu gewährleisten. Der Cache wird automatisch invalidiert, wenn sich Editionen, Abonnements oder Überschreibungen ändern.",
      cachePerf: "Sub-Millisekunden-Lookups",
      cachePerfDesc:
        "Aufgelöste Funktionen werden pro Mandant im Speicher (In-Memory) zwischengespeichert. Pipeline-Prüfungen dauern Mikrosekunden, nicht Millisekunden.",
      cacheInv: "Automatische Invalidierung",
      cacheInvDesc:
        "Jede Änderung an Editionen, Abonnements oder Überschreibungen macht den Feature-Cache des betroffenen Mandanten sofort ungültig.",
      apiTitle: "API-Endpunkte",
      tip: "Systemfunktionen werden bei jedem Anwendungsstart automatisch aus Ihrem Code geseedet. Das bedeutet, dass Ihr Funktionskatalog perfekt mit Ihrer tatsächlichen Codebasis synchronisiert bleibt — keine manuelle Datenbankverwaltung erforderlich.",
    },
    entOverrides: {
      title: "Mandantenspezifische Überschreibungen",
      description:
        "Passen Sie Funktionswerte für einzelne Mandanten unabhängig von ihrem abonnierten Plan an, mit vollständigen Audit-Trails und optionalem Ablaufdatum.",
      intro:
        "Überschreibungen sind das Notventil, das Ihr Berechtigungssystem flexibel genug für die reale Welt macht. Enterprise-Deals, Werbeangebote, Beta-Tests und regulatorische Ausnahmen erfordern alle die Möglichkeit, Funktionen mandantenspezifisch anzupassen, ohne den zugrunde liegenden Plan zu ändern.",
      priorityTitle: "Auflösungsprioritätskette",
      priorityContent:
        "Überschreibungen stehen an der Spitze der Auflösungsprioritätskette. Wenn das System einen Funktionswert für einen Mandanten auflöst, gewinnt immer eine Überschreibung — unabhängig davon, was die Edition oder der Standardwert besagt.",
      useCasesTitle: "Praxisnahe Anwendungsfälle",
      ucEnterprise: "Maßgeschneiderte Enterprise-Deals",
      ucEnterpriseDesc:
        "Ein Fortune-500-Kunde benötigt 10.000 Benutzer in einem Pro-Plan, der normalerweise bei 500 begrenzt ist. Legen Sie eine Überschreibung fest — keine Codeänderungen, keine Custom-Builds.",
      ucPromo: "Promotion-Upgrades",
      ucPromoDesc:
        "Geben Sie einem Mandanten für 30 Tage Premium-Funktionen als Werbeangebot. Legen Sie eine ablaufende Überschreibung fest, die nach dem Aktionszeitraum automatisch zurückgesetzt wird.",
      ucBeta: "Beta-Funktionszugang",
      ucBetaDesc:
        "Aktivieren Sie eine experimentelle Funktion für ausgewählte Mandanten, bevor Sie sie für alle Pläne ausrollen. Überschreiben Sie die Funktion für bestimmte Mandanten während der Beta-Phase.",
      ucExpiring: "Zeitlich begrenzte Ausnahmen",
      ucExpiringDesc:
        "Gesetzliche Anforderungen können einen vorübergehenden Funktionszugang erfordern. Legen Sie eine Überschreibung mit Ablaufdatum fest — das System setzt sie nach Ablauf automatisch zurück.",
      settingTitle: "Eine Überschreibung festlegen",
      settingContent:
        "Überschreibungen werden über einen einfachen API-Aufruf festgelegt. Jede Überschreibung umfasst die Funktion, den benutzerdefinierten Wert, ein optionales Ablaufdatum und einen Grund für Prüfzwecke.",
      auditTitle: "Audit-Trail",
      auditContent:
        "Jede Überschreibungsaktion wird vollständig geprüft. Das System verfolgt, wer die Überschreibung festgelegt hat, wann sie festgelegt wurde, den vorherigen Wert und den angegebenen Grund.",
      tblAuditH1: "Ereignis",
      tblAuditH2: "Verfolgte Daten",
      tblAuditH3: "Zweck",
      tblAuditR1C1: "Überschreibung erstellt",
      tblAuditR1C2: "Funktion, Mandant, Wert, Grund, Akteur, Zeitstempel",
      tblAuditR1C3: "Compliance und Verantwortlichkeit",
      tblAuditR2C1: "Überschreibung aktualisiert",
      tblAuditR2C2: "Vorheriger Wert, neuer Wert, Grund, Akteur",
      tblAuditR2C3: "Änderungshistorienverfolgung",
      tblAuditR3C1: "Überschreibung abgelaufen/entfernt",
      tblAuditR3C2: "Funktion, Mandant, Endwert, Akteur",
      tblAuditR3C3: "Rücksetzungsprüfung",
      apiTitle: "API-Endpunkte",
      tip: "Überschreibungen sind das stärkste Werkzeug in Ihrem Vertriebsarsenal. Sie ermöglichen es Ihrem Vertriebsteam, Enterprise-Deals in Minuten abzuschließen — nicht in Engineering-Sprints.",
    },
  },
};

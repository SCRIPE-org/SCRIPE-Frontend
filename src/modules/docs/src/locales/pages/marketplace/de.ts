export const de = {
  commercial: {
    marketplace: {
      financials: {
        description:
          "Monetarisieren Sie Entwicklerintegrationen von Drittanbietern mit flexiblen Preismodellen.",
        intro:
          "Der Marktplatz monetarisiert Drittanbieter-Integrationen mit Provisionen, flexiblen Entwicklerpreisen und automatisierter Auszahlungsbündelung.",
        revenueIntro:
          "Wählen Sie die kommerziellen Bedingungen, die zu Ihrer Ökosystemstrategie passen.",
        revenueTitle: "Monetarisierungsmodelle",
        revOneItem1:
          "Konfigurieren Sie eine prozentuale Provision für alle kostenpflichtigen Angebote.",
        revOneItem2: "Erheben Sie pauschale Transaktionsgebühren pro Kauf.",
        revOneItem3: "Sammeln Sie Provisionen automatisch beim Kunden-Checkout.",
        revOneTitle: "Provisionsaufteilung",
        revTwoItem1:
          "Unterstützt kostenlose, monatliche Pauschalpreise oder nutzungsbasierte Preise.",
        revTwoItem2: "Unterstützt standardmäßig die Abrechnung in mehreren Währungen.",
        revTwoItem3:
          "Vollständig verwaltete Checkout-Sitzungen und automatische Rechnungsstellung.",
        revTwoTitle: "Preisflexibilität",
        splitIntro:
          "Durch die Nutzung von Stripe Connect werden Transaktionseinnahmen sofort aufgeteilt. Die Plattformprovision wird direkt auf Ihr Firmenkonto überwiesen und der Rest auf dem Guthaben des Entwicklers gutgeschrieben, wodurch eine manuelle Buchhaltung entfällt.",
        splitTitle: "Geteilte Zahlungen & Abrechnung",
        title: "Finanzen & Monetarisierung",
      },
      overview: {
        description:
          "Erweitern Sie Ihr Plattform-Ökosystem mit einem integrierten Erweiterungsshop.",
        intro:
          "Der SCRIPE App-Marktplatz ermöglicht es Ihnen, einen integrierten Erweiterungsshop zu starten. Kunden können Integrationen von Drittanbietern entdecken, installieren und kaufen, um den Nutzen der Plattform zu steigern.",
        title: "App-Marktplatz",
        val1: "Ökosystem-Erweiterung",
        val1Desc:
          "Ermöglichen Sie Drittentwicklern, Integrationen zu erstellen und so den Nutzen Ihrer Plattform zu steigern.",
        val2: "Neue Einnahmequelle",
        val2Desc:
          "Monetarisieren Sie das Entwickler-Ökosystem, indem Sie Plattformprovisionen für kostenpflichtige Apps erheben.",
        val3: "Kundenbindung",
        val3Desc:
          "Höhere Plattformbindung, da Kunden tiefgreifende Tools in ihre Workflows integrieren.",
        val4: "Onboarding-Automatisierung",
        val4Desc:
          "Self-Service-Entwickler-Onboarding und Sandbox-Prüfungen reduzieren den administrativen Aufwand.",
        valueIntro: "Der Start eines App-Marktplatzes bietet erhebliche kommerzielle Vorteile.",
        valueTitle: "Wichtige geschäftliche Vorteile",
      },
    },
  },
  marketplace: {
    catalog: {
      apiCategories: "Aktive Kategorien für Katalogfilterung auflisten",
      apiDetails:
        "Vollständige Metadaten, Preise, Screenshots und Bewertungen für ein Angebot abrufen",
      apiInstall: "Anwendungsinstallation und Entitlement-Update auslösen",
      apiList: "Aktiven Katalog mit Paginierung, Suche und Kategoriefiltern abrufen",
      apiReviewCreate: "Bewertung und Rezension für ein bestimmtes App-Angebot hinzufügen",
      apiReviewReply: "Entwicklern erlauben, auf Benutzerbewertungen zu antworten",
      apiUninstall: "Anwendungsdeinstallation und Bereinigung von Abhängigkeiten auslösen",
      controllerIntro:
        "Katalog-Endpunkte werden von AppCatalogController, AppCategoryController und AppReviewController verwaltet.",
      controllerTitle: "Katalog-Endpunkte",
      description:
        "Durchsuchen des App-Katalogs, Kategorien, Installation und Benutzerbewertungen.",
      installationIntro: "Die Anwendungsinstallation folgt einer mehrstufigen Überprüfungssequenz.",
      installationTitle: "Installations-Workflow",
      intro:
        "Das Katalog-Teilsystem zeigt aktive App-Angebote an. Es unterstützt Kategoriegruppierung, Textsuche, Installations-/Deinstallationsaufgaben und Benutzerbewertungen.",
      step1Content:
        "Das System prüft Mandanten-Abonnement-Editionen, um zu überprüfen, ob benutzerdefinierte Integrationen zulässig sind und Quoten nicht überschritten werden.",
      step1Title: "Entitlement-Schutz",
      step2Content:
        "Wenn die Anwendung kostenpflichtig ist, überprüft das System eine aktive Lizenz oder leitet zum Checkout weiter, bevor die App als gekauft markiert wird.",
      step2Title: "Zahlungsvalidierung",
      step3Content:
        "Die App wird für den Mandanten als aktiv markiert, was Webhook-Ereignishandler auslöst, um Umgebungsvariablen zu konfigurieren.",
      step3Title: "Mandantenaktivierung",
      title: "App-Katalog",
    },
    financials: {
      apiEarnings: "Entwicklerguthaben, Gesamteinnahmen und unbezahltes Guthaben abrufen",
      apiPayoutProcess: "Admin-Endpunkt zum Ausführen der Batch-Auszahlungsverarbeitung",
      apiPayoutRequest: "Eine manuelle Auszahlungsanforderung für unbezahlte Einnahmen auslösen",
      apiPayouts: "Auszahlungsverlauf für den angemeldeten Entwickler auflisten",
      controllerIntro:
        "Marktplatzfinanzen werden von AppFinancialsController und automatisierten Hintergrundaufgaben abgewickelt.",
      controllerTitle: "Finanz-Endpunkte",
      description: "Marktplatzkaufabwicklung, Guthabenberechnung und Entwicklerauszahlungen.",
      intro:
        "Das Finanzteilsystem verfolgt App-Käufe, verwaltet Entwicklerguthaben, zieht Plattformprovisionen ein und plant Auszahlungen.",
      payoutIntro: "Die Auszahlungsabwicklung rechnet Einnahmen und Auszahlungen sicher ab.",
      payoutTitle: "Auszahlungsverarbeitungs-Workflow",
      step1Content:
        "Wenn ein Mandant eine App kauft, wird ein Kaufbuchdatensatz erstellt. Die Plattformprovision wird aufgeteilt und der Rest dem Entwicklerguthaben gutgeschrieben.",
      step1Title: "Transaktionsaufzeichnung",
      step2Content:
        "Der PayoutBatchJob wird planmäßig ausgeführt, um alle genehmigten Auszahlungsanforderungen zu sammeln und in einem Abrechnungslauf zusammenzufassen.",
      step2Title: "Auszahlungs-Batching",
      step3Content:
        "Zahlungen werden über Stripe Connect abgewickelt, wobei abgerechnete Guthaben auf das Bankkonto des Entwicklers überwiesen werden und das unbezahlte Guthaben zurückgesetzt wird.",
      step3Title: "Abrechnungsfreigabe",
      title: "Marktplatz-Finanzen",
    },
    overview: {
      backendIntro:
        "Die Marktplatzfunktionalität wird durch einen dedizierten DbContext und Entitäten unterstützt.",
      backendTitle: "Backend-Architektur",
      conn1: "Veröffentlicht genehmigte Apps",
      conn2: "Rechnet Zahlungen ab",
      conn3: "Bewertet gelistete Apps",
      conn4: "Prüft Quoten",
      cqrsCatalogQuery: "Ruft paginierte und gefilterte Katalogangebote ab",
      cqrsDesc: "Beschreibung der Operation",
      cqrsDetailsQuery: "Ruft detaillierte Angebotsmetadaten und Bewertungen ab",
      cqrsDevProfile: "Registriert ein Entwicklerprofil mit Unternehmensdetails",
      cqrsEarningsQuery: "Berechnet unbezahlte Entwicklerguthaben und Verlauf",
      cqrsExample: "AstraFlow-Anforderung",
      cqrsIntro: "Das Modul verwendet Standardbefehle und -abfragen für alle Aktionen.",
      cqrsPurchase: "Initiiert Checkout für kostenpflichtige Integrationen",
      cqrsReview: "Reicht Bewertung und Kommentar für eine App ein",
      cqrsSubmitListing: "Reicht ein App-Angebot zur Sandbox-Prüfung ein",
      cqrsTitle: "CQRS-Befehle & Abfragen",
      cqrsType: "Typ",
      descCatalog: "Verwaltet globale App-Details, Tags und Kategoriestrukturen.",
      descEnt: "Entitlements-Gate",
      descEntDesc: "Validiert Mandanteneditionslimits und Lizenzen während der Installation.",
      descFinancials: "Berechnet Plattformprovisionen, Entwicklerguthaben und Auszahlungen.",
      descReviews: "Verwaltet Benutzerbewertungen, Missbrauchsmeldungen und Entwicklerantworten.",
      description: "Übersicht über das SCRIPE-Erweiterungs- und Anwendungsmarktplatzsystem.",
      descSubmissions: "Orchestriert Sandbox-Prüfungen, Versionierung und Statusübergänge.",
      featureCatalog: "App-Katalog",
      featureCatalogDesc: "Suchen, durchsuchen und filtern Sie global gelistete Integrationen.",
      featureFinancials: "Einnahmen & Auszahlungen",
      featureFinancialsDesc: "Preisdefinitionen, Checkout-Sitzungen und Auszahlungs-Batching.",
      featureReviews: "Bewertungen & Rezensionen",
      featureReviewsDesc: "Mandanten-Feedback, Sternebewertungen und Antworten von Entwicklern.",
      featureSubmissions: "Angebote einreichen",
      featureSubmissionsDesc:
        "Entwickler-Onboarding, Profilerstellung und Lebenszyklus von Angeboten.",
      infoContent:
        "Während der Marktplatzkatalog global geteilt wird, sind Installationen, Konfigurationszustände und Käufe auf der Ebene des Mandantenkontexts streng isoliert.",
      infoTitle: "Mandantenisolation",
      intro:
        "Das Marktplatz-Modul ermöglicht es Mandanten, Integrationen und Erweiterungen von Drittanbietern zu entdecken, zu installieren und zu kaufen. Es bietet außerdem ein Entwicklerportal für die Profileinrichtung, das Einreichen von Angeboten, Überprüfungszyklen und die Auszahlungsabwicklung.",
      sub1: "App-Angebote & Katalog",
      sub2: "Einreichungs-Lebenszyklus",
      sub3: "Finanzielle Abrechnung",
      sub4: "Bewertungen & Rezensionen",
      subModulesIntro:
        "Das Marktplatz-Modul besteht aus mehreren Untermodulen, die untereinander und mit Entitlements kommunizieren.",
      subModulesTitle: "Architektur der Untermodule",
      title: "Marktplatz-Übersicht",
      whatIsIntro:
        "Die Marktplatz-Engine orchestriert Katalog-Browsing, Entwickler-Onboarding, Bewertungen und Auszahlungs-Batching.",
      whatIsTitle: "Hauptfunktionen",
    },
    submissions: {
      apiApprove: "Admin-Endpunkt zum Genehmigen einer Einreichung und Veröffentlichen im Katalog",
      apiCreateProfile: "Entwicklerkontodetails erstellen oder aktualisieren",
      apiCreateSubmission: "Einen neuen App-Einreichungsdatensatz erstellen und Assets hochladen",
      apiListSubmissions: "Aktiven Einreichungsverlauf für den angemeldeten Entwickler abrufen",
      apiReject: "Admin-Endpunkt zum Ablehnen einer Einreichung mit Feedback-Kommentaren",
      controllerIntro:
        "Entwickler-Onboarding und -Einreichungen werden von DeveloperProfileController und AppSubmissionController verwaltet.",
      controllerTitle: "Einreichungs-Endpunkte",
      description: "Entwicklerprofileinrichtung, Angebotserstellung und Überprüfungs-Workflow.",
      intro:
        "Drittentwickler können sich registrieren, Profile erstellen und App-Angebote zur Sandbox-Überprüfung einreichen.",
      step1Content:
        "Entwickler registrieren ein Profil, richten Auszahlungsbedingungen ein und konfigurieren Sandbox-Umgebungen.",
      step1Title: "Entwickler-Onboarding",
      step2Content:
        "Entwickler definieren Anwendungsname, Beschreibung, Tags, Preise, Screenshots und Sicherheitsdetails.",
      step2Title: "Angebotsgerüst",
      step3Content:
        "SCRIPE-Administratoren testen die Integration in einer sicheren Mandanten-Sandbox, um die Einhaltung der Sicherheitsrichtlinien zu überprüfen.",
      step3Title: "Sandbox-Überprüfung",
      step4Content:
        "Nach der Genehmigung generiert das System das Angebot, richtet Preisreferenzen ein und veröffentlicht es im globalen Katalog.",
      step4Title: "Katalogveröffentlichung",
      title: "App-Einreichungen",
      workflowIntro: "Alle Angebotsabgaben durchlaufen eine geschützte Überprüfungspipeline.",
      workflowTitle: "Lebenszyklus der Einreichung",
    },
  },
};

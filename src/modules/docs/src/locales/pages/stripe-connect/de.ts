export const de = {
  commercial: {
    stripeConnect: {
      ben1: "Reibungslose Abrechnung",
      ben1Desc:
        "Ermöglichen Sie Ihren Mandanten, Kundenzahlungen weltweit zu akzeptieren, während Sie automatisch Ihren Anteil einbehalten.",
      ben2: "Reduziertes finanzielles Risiko",
      ben2Desc:
        "Gelder fließen direkt über Stripe, wodurch komplexe regulatorische Compliance- oder Treuhandanforderungen vermieden werden.",
      ben3: "Automatische Provisionen",
      ben3Desc:
        "Berechnen Sie prozentuale oder feste Gebühren pro Transaktion und schaffen Sie so eine starke Einnahmequelle.",
      benefitsIntro:
        "Die Aktivierung von geteilten Zahlungen über Stripe Connect bietet einen enormen geschäftlichen Nutzen.",
      benefitsTitle: "Warum geteilte Zahlungen?",
      commissionIntro:
        "Jede von Ihren Mandanten verarbeitete Transaktion kann auf Gateway-Ebene aufgeteilt werden. Wenn beispielsweise ein Mandant eine Dienstleistung für 100 $ mit einer Provision von 5 % verkauft, verteilt Stripe Connect 95 $ an den Mandanten und 5 $ direkt auf Ihr Firmenkonto.",
      commissionTitle: "Aufteilung der Plattformgebühren",
      intro:
        "Monetarisieren Sie Ihre Plattformtransaktionen sofort mit einem integrierten Split-Payment- und Provisionserfassungsgateway powered by Stripe Connect.",
    },
  },
  stripeConnect: {
    apiAccountStatus:
      "Aktuellen Status des verbundenen Mandantenkontos und Auszahlungsstatus abrufen",
    apiCommissionsDashboard:
      "Globale Statistiken, Trends und Summen für Plattformprovisionen abrufen",
    apiCommissionsInvoices: "Systemprovisionsrechnungen mit Statusfiltern auflisten",
    apiOnboard: "Mandanten-Stripe Connect-Onboarding-Sitzung initiieren",
    apiRetryCharge:
      "Sofortigen manuellen Abbuchungsversuch für eine Mandantenprovisionsrechnung auslösen",
    apiWaiveInvoice: "Eine bestimmte Mandantenprovisionsrechnung erlassen (als bezahlt markieren)",
    commissionIntro:
      "Erheben Sie Transaktionsgebühren für Mandantenverkäufe dynamisch über ein Ledger-basiertes Buchhaltungssystem.",
    commissionTitle: "Plattformprovisions-Engine",
    controllerIntro:
      "Endpunkte für Stripe Connect und Plattformprovisionen werden von StripeConnectController, TenantStripeConnectController und CommissionsController verwaltet.",
    controllerTitle: "Zahlungs-Hub-Endpunkte",
    description:
      "Detaillierte Dokumentation für Mandanten-Onboarding, benutzerdefinierte Konten, geteilte Zahlungen und Plattformprovisionsverwaltung.",
    flowIntro:
      "Mandanten steigen über einen Self-Service-OAuth- oder benutzerdefinierten Onboarding-Workflow in das Zahlungs-Hub ein.",
    flowTitle: "Mandanten-Onboarding-Workflow",
    intro:
      "Das Stripe Connect-Modul bietet Funktionen für mandantenfähige Abrechnungen. Es ermöglicht Mandanten der Plattform, ihre eigenen Stripe-Konten zu verknüpfen, um Zahlungen von ihren Kunden zu empfangen. Es unterstützt außerdem eine automatisierte Plattformprovisions-Engine zur Erhebung von Gebühren auf Mandantentransaktionen.",
    step1Content:
      "Der Mandanten-Admin klickt im Zahlungs-Dashboard auf 'Stripe verbinden', wodurch ein Befehl zum Abrufen einer einmaligen Onboarding-URL gesendet wird.",
    step1Title: "Onboarding-Auslöser",
    step2Content:
      "Der Mandant wird zum Onboarding-Portal von Stripe weitergeleitet, um seine Geschäftsdaten, Bankkonten und den Compliance-Status zu überprüfen.",
    step2Title: "Stripe-Überprüfung",
    step3Content:
      "Nach Abschluss leitet Stripe zurück zu SCRIPE weiter. Der Webhook-Handler erfasst Kontoaktualisierungen und aktiviert den Zahlungsgateway-Status des Mandanten.",
    step3Title: "Kontoaktivierung",
    title: "Stripe Connect & Provisionen",
  },
};

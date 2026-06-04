export const de = {
  modules: {
    billingEngine: {
      abstractionIntro:
        "Das Zahlungssystem basiert auf einer IPaymentGateway-Schnittstelle in Core.Application mit einem IPaymentGatewayResolver, der dynamisch den richtigen Anbieter pro Mandant auswählt. Drei Implementierungen sind aktiv: StripePaymentGateway (global, wiederkehrend, Abrechnungsportal), PayPalPaymentGateway (international, OAuth2-basiert) und PaymobPaymentGateway (MENA-Region, Karten-Tokenisierung). Gateways werden als Keyed DI-Dienste registriert und zur Laufzeit aufgelöst.",
      abstractionTitle: "IPaymentGateway-Abstraktion",
      configIntro:
        "Jedes Gateway wird in der appsettings.json unter seinem eigenen Abschnitt (Stripe, PayPal, Paymob) konfiguriert. Der Abschnitt PaymentGateways steuert, welche Gateways aktiviert sind, welches der globale Standard ist und ob Mandanten die Gateway-Auswahl überschreiben können. Verwenden Sie Sandbox-/Testschlüssel für die Entwicklung.",
      configTitle: "Konfiguration",
      currencyIntro:
        "SCRIPE enthält einen CurrencyHelper, der Beträge für nullstellige Währungen (JPY, KWD, BHD usw.) korrekt umrechnet. Reguläre Währungen (USD, EUR, SAR usw.) werden mit 100 multipliziert, um in die kleinsten Einheiten umgerechnet zu werden. Nullstellige Währungen werden unverändert übergeben. Dies gilt für alle Gateways.",
      currencyTitle: "Handhabung von nullstelligen Währungen",
      description:
        "Multi-Gateway-Zahlungsabwicklung mit Unterstützung für Stripe, PayPal und Paymob, inklusive Self-Service-Checkout, Zahlungslinks, Kundenportal und webhook-gesteuerter Statussynchronisierung.",
      endpointsIntro:
        "Der BillingController stellt 5 Endpunkte unter /api/v1/billing bereit, plus Gateway-Management unter /api/v1/payment-gateways:",
      endpointsTitle: "API-Endpunkte",
      ep: {
        cancel:
          "Gateway-Abonnement kündigen (ermittelt das richtige Gateway aus dem Feld PaymentGateway des Abonnements)",
        checkout:
          "Checkout-Sitzung über das ermittelte Zahlungsgateway erstellen (unterstützt den Parameter GatewayOverride)",
        dashboard:
          "Umsatz-Dashboard abrufen (MRR, ARR, Churn, Trends — aggregiert über alle Gateways)",
        gateways:
          "GET /api/v1/payment-gateways — Aktivierte Gateways und ihre Funktionsunterstützungsmatrix abfragen",
        paymentLink:
          "Zahlungslink über das ermittelte Gateway generieren (Ablauf 'Vertrieb kontaktieren')",
        portal:
          "Sitzung für das Stripe-Kundenportal erstellen (nur Stripe, gibt bei anderen Gateways einen Fehler zurück)",
      },
      gatewayIntro:
        "SCRIPE unterstützt drei Zahlungsgateways gleichzeitig. Der IPaymentGatewayResolver ermittelt das korrekte Gateway pro Mandant anhand einer Prioritätskette: explizite Admin-Überschreibung, Konfiguration auf Mandantenebene, dann globaler Standard. Jedes Abonnement erfasst im Feld PaymentGateway, welches Gateway die Zahlung verarbeitet hat.",
      gatewayPaymob:
        "Paymob Accept — MENA-Spezialist: Checkout, tokenisierte wiederkehrende Zahlungen (über gespeicherte Karten-Token), mobile Geldbörsen. Unterstützt die Währungen EGP, SAR, AED, PKR. HMAC-SHA512-Webhook-Verifizierung.",
      gatewayPaypal:
        "PayPal — Internationale Reichweite: Checkout, wiederkehrende Abrechnung, Rückerstattungen, mehrere Währungen. OAuth2-basiert mit Sandbox-Unterstützung. Kein Abrechnungsportal (Verwaltung über paypal.com).",
      gatewayStripe:
        "Stripe — Vollwertig: Checkout, wiederkehrende Abrechnung, Abrechnungsportal, Zahlungslinks, Rückerstattungen, 3D Secure, mehrere Währungen. Ideal als globaler Standard.",
      gatewayTitle: "Multi-Gateway-Architektur",
      idempotencyIntro:
        "Alle Webhook-Handler sind idempotent — die zweimalige Verarbeitung desselben Ereignisses hat keine Nebenwirkungen. Gateway-Transaktions-IDs werden überprüft, bevor neue Datensätze erstellt werden. Dies schützt vor den 'At-least-once'-Liefergarantien (mindestens einmal) aller Anbieter.",
      idempotencyTitle: "Idempotenz",
      intro:
        "Die Billing Engine steuert den Abonnement-Lebenszyklus von SCRIPE mit einer anbieterunabhängigen Zahlungsarchitektur. Sie unterstützt drei Zahlungsgateways (Stripe, PayPal, Paymob) und drei Abonnementmodelle: Self-Service (der Mandant wählt einen Plan und bezahlt über das konfigurierte Gateway), Vertrieb kontaktieren (Admin generiert einen Zahlungslink für Enterprise-Deals) und Manuelle Zuweisung (Admin weist einen Plan ohne Zahlung zu). Alle Zahlungsereignisse werden über gateway-spezifische Webhooks synchronisiert.",
      mode1Intro:
        "Der Mandant wählt im Admin-Panel eine Edition und einen Abrechnungszyklus aus. SCRIPE ermittelt das korrekte Zahlungsgateway (über eine mandantenspezifische Überschreibung oder den globalen Standard), erstellt eine Checkout-Sitzung, setzt die TenantSubscription auf PendingPayment und leitet den Mandanten auf die gehostete Checkout-Seite des Gateways weiter. Bei erfolgreicher Zahlung wird der Gateway-Webhook ausgelöst und SCRIPE aktiviert das Abonnement automatisch.",
      mode1Title: "Self-Service (Automatisiert)",
      mode2Intro:
        "Für Enterprise- oder individuell bepreiste Deals erstellt der Admin ein Abonnement mit einem Zahlungslink über das ermittelte Gateway. SCRIPE generiert eine wiederverwendbare Zahlungslink-URL, die der Admin an den Kunden sendet. Derselbe Webhook-Ablauf aktiviert das Abonnement, sobald der Kunde bezahlt hat.",
      mode2Title: "Vertrieb kontaktieren (Admin-unterstützt)",
      mode3Intro:
        "Für Partner, interne Konten oder kostenlose Testversionen weist der Admin direkt eine Edition zu. Es findet keine Gateway-Interaktion statt — das Abonnement wird sofort auf Active gesetzt. Verwenden Sie dies für kostenlose Editionen, interne Mandanten oder manuell ausgehandelte Deals.",
      mode3Title: "Manuelle Zuweisung (Zahlung überspringen)",
      modesIntro:
        "Jedes Mandanten-Onboarding folgt einem von drei Wegen. Das Modell wird danach ausgewählt, ob in der Edition IsSelfServiceEnabled oder IsContactSalesOnly gesetzt ist.",
      modesTitle: "Drei Abonnementmodelle",
      portalIntro:
        "Sobald ein Mandant ein aktives Stripe-Abonnement hat, kann er die Abrechnung über das gehostete Kundenportal von Stripe verwalten. Diese Funktion ist exklusiv für Stripe — bei PayPal- und Paymob-Abonnements werden stattdessen gateway-spezifische Verwaltungsanweisungen angezeigt. Die Benutzeroberfläche blendet die Portal-Schaltfläche für Nicht-Stripe-Gateways automatisch aus.",
      portalTitle: "Abrechnungsportal (nur Stripe)",
      selfServiceIntro:
        "Zwei Felder der Entität Edition steuern, welcher Zahlungsmodus verfügbar ist: IsSelfServiceEnabled (Mandant kann zur Kasse gehen, ohne den Vertrieb zu kontaktieren) und IsContactSalesOnly (die Checkout-Schaltfläche zeigt 'Vertrieb kontaktieren' und löst stattdessen den Zahlungslink-Ablauf aus).",
      selfServiceTitle: "Edition Self-Service-Felder",
      title: "Billing Engine",
      webhookEvents:
        "Stripe: checkout.session.completed, invoice.paid, invoice.payment_failed, customer.subscription.updated, customer.subscription.deleted, charge.refunded. PayPal: BILLING.SUBSCRIPTION.ACTIVATED, PAYMENT.SALE.COMPLETED, BILLING.SUBSCRIPTION.CANCELLED. Paymob: transaction.success, transaction.failed, transaction.refunded.",
      webhookIntro:
        "Jedes Gateway hat seinen eigenen Webhook-Endpunkt mit anbieterspezifischer Signaturverifizierung. Stripe verwendet HMAC-SHA256 bei POST /api/stripe-webhooks, PayPal verwendet die Transmission-Signaturverifizierung bei POST /api/paypal-webhooks und Paymob verwendet HMAC-SHA512 bei POST /api/paymob-webhooks. Alle Handler leiten zur Verarbeitung an AstraFlow-Mediatorbefehle weiter.",
      webhookTitle: "Webhook-Handler",
    },
  },
};

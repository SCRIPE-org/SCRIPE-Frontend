/**
 * Documentation for module export
 */
export const de = {
  modules: {
    webhooks: {
      title: "Webhooks",
      description:
        "Gateway-unabhängiger Webhook-Verteiler mit sicheren HMAC-Signaturen und automatischen exponentiellen Wiederholungswarteschlangen.",
      intro:
        "Asynchrones Webhook-Ausführungssystem, das die Payload-Integrität über HMAC-SHA256-Header mit konfigurierbaren Wiederholungsrichtlinien überprüft.",
      engineTitle: "Webhook-Versand-Engine",
      engineContent:
        "Die Webhook-Versand-Engine verarbeitet Domänenereignisse asynchron. Sie fungiert als Outbox-Consumer, der auf Ereignisse lauscht, diese mit Webhook-Abonnements von Mandanten abgleicht und sie für die Zustellung einreiht. Der Prozess ist vollständig vom Haupt-HTTP-Anforderungsthread entkoppelt, wodurch sichergestellt wird, dass langsame Server von Drittanbietern die Plattformleistung nicht beeinträchtigen.",
      payloadTitle: "Payload-Struktur und -Format",
      payloadContent:
        "Alle von SCRIPE gesendeten Webhook-Benachrichtigungen sind HTTP-POST-Anforderungen, die einen standardmäßigen JSON-Payload-Umschlag enthalten. Der Umschlag enthält Metadaten über das Ereignis, und der Payload-Text innerhalb von 'data' enthält den serialisierten Zustand der geänderten Ressource.",
      retryTitle: "Automatische Wiederholung und Backoff",
      retryContent:
        "Wenn ein externer Webhook-Endpunkt einen Nicht-2xx-Statuscode zurückgibt oder eine Zeitüberschreitung auftritt, reiht die Versand-Engine ihn für eine Wiederholung ein. Sie verwendet eine exponentielle Backoff-Strategie, um zwischen aufeinanderfolgenden Versuchen länger zu warten und eine Überlastung des Zielservers zu verhindern.",
      securityTitle: "HMAC-SHA256-Signatursicherheit",
      securityContent:
        "Um Spoofing-Angriffe zu verhindern, enthalten alle Webhook-Anforderungen einen X-Scripe-Signature-Header. Dieser Header enthält die HMAC-SHA256-Signatur des rohen JSON-Anforderungstexts, die unter Verwendung des geheimen Webhook-Schlüssels berechnet wurde. Empfänger müssen die Signatur des empfangenen Texts berechnen und diese mithilfe eines Hilfsprogramms für zeitkonstante Vergleiche vergleichen.",
      signatureWarning:
        "Sicherheitshinweis: Überprüfen Sie Webhook-Signaturen immer vor der Verarbeitung von Payloads, um die Authentizität zu garantieren und unbefugten Zugriff oder Spoofing zu verhindern.",
      registeringTitle: "Webhook-Verwaltungs-APIs",
    },
  },
};

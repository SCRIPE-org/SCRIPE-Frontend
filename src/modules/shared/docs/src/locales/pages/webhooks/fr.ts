/**
 * Documentation for module export
 */
export const fr = {
  modules: {
    webhooks: {
      title: "Webhooks",
      description:
        "Distributeur de webhooks indépendant doté de signatures HMAC et de files de retentatives exponentielles.",
      intro:
        "Sous-système d'exécution asynchrone des webhooks sortants vérifiant l'intégrité via HMAC-SHA256 avec politiques de backoff configurables.",
      engineTitle: "Moteur d'Envoi de Webhooks",
      engineContent:
        "Le moteur d'envoi de webhooks traite les événements de domaine de manière asynchrone. Il agit comme un consommateur de boîte d'envoi qui écoute les événements, les fait correspondre aux abonnements de webhooks des locataires et les met en file d'attente pour livraison. Le processus est entièrement découplé du thread de requête HTTP principal, garantissant que les serveurs tiers lents n'affectent pas les performances de la plateforme.",
      payloadTitle: "Structure et Format du Payload",
      payloadContent:
        "Toutes les notifications de webhooks envoyées par SCRIPE sont des requêtes HTTP POST contenant une enveloppe de payload JSON standard. L'enveloppe contient des métadonnées sur l'événement, et le corps du payload à l'intérieur de 'data' contient l'état sérialisé de la ressource modifiée.",
      retryTitle: "Tentative Automatique et Backoff",
      retryContent:
        "Lorsqu'un point de terminaison de webhook externe renvoie un code d'état autre que 2xx ou expire, le moteur d'envoi le met en file d'attente pour une nouvelle tentative. Il utilise une stratégie de backoff exponentiel pour attendre plus longtemps entre les tentatives suivantes, évitant ainsi de surcharger le serveur cible.",
      securityTitle: "Sécurité de Signature HMAC-SHA256",
      securityContent:
        "Pour empêcher les attaques d'usurpation d'identité, toutes les requêtes de webhooks incluent un en-tête X-Scripe-Signature. Cet en-tête contient la signature HMAC-SHA256 du corps brut de la requête JSON, calculée à l'aide de la clé secrète du webhook. Les récepteurs doivent calculer la signature du corps reçu et la comparer à l'aide d'un assistant de comparaison en temps constant.",
      signatureWarning:
        "Avis de sécurité : Vérifiez toujours les signatures de webhook avant de traiter les payloads pour garantir l'authenticité et empêcher tout accès non autorisé ou usurpation d'identité.",
      registeringTitle: "APIs de Gestion de Webhooks",
    },
  },
};

/**
 * Documentation for module export
 */
export const fr = {
  commercial: {
    entitlementsUserSubscriptions: {
      title: "Abonnements Utilisateurs",
      description:
        "Gestion des abonnements utilisateur-forfait de niveau 2 avec cycle de vie complet, rapprochement automatique, contrôle d'accès aux fonctionnalités et libre-service.",
      fullLifecycleTitle: "Cycle de Vie Complet",
      fullLifecycleDesc:
        "Gratuit → Essai → Actif → En retard → Annulé → Expiré avec transitions automatiques.",
      autoReconciliationTitle: "Rapprochement Automatique",
      autoReconciliationDesc:
        "Une tâche d'arrière-plan quotidienne gère automatiquement l'expiration des essais, le renouvellement et l'échéance.",
      featureGatingTitle: "Filtrage des Fonctionnalités",
      featureGatingDesc:
        "UserFeatureCheckerService détermine à quelles fonctionnalités chaque utilisateur accède selon son forfait.",
      selfServiceTitle: "Libre-Service",
      selfServiceDesc:
        "Les utilisateurs peuvent consulter l'état de leur abonnement via le point de terminaison /me.",
      auditTrailTitle: "Piste d'Audit",
      auditTrailDesc:
        "Le modèle immuable Cancel+Replace conserve un historique complet par cycle de facturation.",
      domainEventsTitle: "Événements de Domaine",
      domainEventsDesc:
        "Les événements Created, Cancelled et Renewed alimentent les webhooks et les systèmes de notification.",
      lifecycleTitle: "Cycle de Vie de l'Abonnement",
      reconciliationTitle: "Rapprochement Automatique",
    },
  },
};

export const fr = {
  modules: {
    revenueAnalytics: {
      "title": "Moteur d'Analytique des Revenus",
      "description": "Intelligence des revenus de niveau BI avec tableau de bord à 7 onglets, KPIs en temps réel, analyse de cohortes, modélisation LTV, prévision des revenus, scoring de santé des locataires et livraison automatisée de rapports PDF.",
      "intro": "Le moteur d'analytique des revenus fournit une intelligence financière complète pour votre plateforme SaaS. Il agrège les données d'abonnement de tous les locataires en KPIs exploitables, visualisations de tendances et modèles prédictifs. Des tâches de fond nocturnes capturent toutes les métriques, calculent les scores de santé des locataires et génèrent des rapports planifiés — offrant une suite analytique complète de niveau BI sans outils externes.",
      "kpiTitle": "Vue d'ensemble des KPIs",
      "kpiIntro": "Huit KPIs fondamentaux sont calculés en temps réel à partir des données d'abonnement et de paiement. Chaque KPI prend en charge le filtrage par plage de dates, la comparaison période par période et l'analyse détaillée par édition ou locataire.",
      "tabsTitle": "Tableau de bord à 7 onglets",
      "tabsIntro": "Le tableau de bord analytique est organisé en 7 onglets chargés paresseusement, chacun se concentrant sur une dimension analytique spécifique. Les onglets sont rendus via React.lazy avec des fallbacks Suspense pour un découpage optimal des bundles.",
      "snapshotTitle": "Entité AnalyticsSnapshot",
      "snapshotIntro": "L'entité AnalyticsSnapshot stocke les captures quotidiennes des métriques. Chaque nuit, le AnalyticsSnapshotJob crée une ligne agrégée (TenantId = null) et une ligne par locataire actif. Cela permet l'analyse des tendances historiques sans interroger les tables d'abonnement en direct.",
      "healthTitle": "Scoring de Santé des Locataires",
      "healthIntro": "Le TenantHealthScoreJob calcule un score de santé composite (0-100) pour chaque locataire actif en utilisant une formule pondérée qui combine la fiabilité des paiements, l'activité de la plateforme et les signaux de croissance des abonnements.",
      "jobsTitle": "Pipeline de Tâches de Fond",
      "jobsIntro": "Trois tâches de fond s'exécutent en séquence stricte chaque nuit. Elles sont entièrement agnostiques du fournisseur — configurables pour fonctionner sous Native, Hangfire ou Quartz via appsettings.json. Chaque tâche implémente IAutoRegisteredJob pour une gestion unifiée.",
      "jobsConfig": "Les trois tâches sont configurables via appsettings.json sous BackgroundJobs:Jobs. Vous pouvez remplacer le planning CRON, activer/désactiver des tâches individuelles ou changer de fournisseur (Native/Hangfire/Quartz) sans modification du code.",
      "endpointsTitle": "Points de terminaison API",
      "endpointsIntro": "L'AnalyticsController expose 12 points de terminaison sous /api/v1/analytics. Tous les points de terminaison nécessitent le rôle SuperAdmin et la permission analytique correspondante.",
      "exportTitle": "Système d'Exportation",
      "exportIntro": "Les données analytiques peuvent être exportées dans trois formats. Chaque exportation inclut le résumé KPI actuel, les tendances MRR et la répartition des abonnements. Les exportations PDF incluent des en-têtes et graphiques de marque.",
      "scheduledTitle": "Rapports Planifiés",
      "scheduledIntro": "Les administrateurs peuvent configurer la livraison automatisée de rapports. Les rapports sont générés par le AnalyticsReportJob à 6h00 UTC et envoyés par email aux destinataires configurés dans le format choisi.",
      "permissionsTitle": "Permissions",
      "permissionsIntro": "L'analytique des revenus utilise quatre permissions granulaires qui peuvent être assignées aux rôles via le système RBAC standard.",
      "ep": {
        "summary": "Obtenir le résumé analytique (cartes KPI + comparaison de périodes)",
        "mrr": "Obtenir les mouvements en cascade du MRR (nouveau/expansion/contraction/attrition/réactivation)",
        "cohort": "Obtenir les données de carte thermique de rétention de cohortes par cohortes mensuelles",
        "ltv": "Obtenir la répartition de la valeur vie par niveau d'édition",
        "forecast": "Obtenir la prévision de revenus sur 6 mois avec régression linéaire + bandes de confiance",
        "health": "Obtenir les scores de santé des locataires avec classification des risques",
        "snapshots": "Obtenir les captures quotidiennes historiques pour les graphiques de tendance",
        "export": "Exporter les données analytiques au format spécifié (csv/excel/pdf)",
        "reportList": "Lister tous les rapports planifiés",
        "reportCreate": "Créer une nouvelle configuration de rapport planifié",
        "reportUpdate": "Mettre à jour les paramètres du rapport planifié",
        "reportDelete": "Supprimer un rapport planifié"
      }
    }
  }
};

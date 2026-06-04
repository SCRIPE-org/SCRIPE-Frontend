export const fr = {
  infrastructure: {
    auditTrail: {
      architectureTitle: "Architecture de la Piste d'Audit",
      description:
        "Journalisation d'audit complète avec détection automatique de module, suivi de corrélation, diffusion en temps réel SignalR et plus de 45 types d'événements.",
      entityIntro:
        "L'entité AuditLog capture un contexte complet pour chaque événement auditable. Les anciennes et nouvelles valeurs sont stockées en tant qu'instantanés JSON.",
      entityTitle: "Schéma de l'Entité AuditLog",
      eventTypesTitle: "Types d'Événements d'Audit (45+)",
      intro:
        "La piste d'audit entreprise de SCRIPE capture chaque action significative sur la plateforme — des événements d'authentification aux mutations d'entités en passant par les changements de permissions et les incidents de sécurité.",
      moduleDetectionIntro:
        "L'AuditService détermine automatiquement quel module a généré chaque événement d'audit en analysant le chemin de l'endpoint API ou le nom du type d'entité.",
      moduleDetectionTitle: "Détection Automatique de Module",
      queryIntro:
        "L'endpoint de requête des logs d'audit supporte un filtrage exhaustif avec 12 paramètres. Tous les filtres sont optionnels et combinables. Les résultats sont paginés (défaut : 20 éléments, maximum : 100) et triés par horodatage décroissant.",
      queryTip:
        "Conseil professionnel : Utilisez CorrelationId pour tracer le cycle de vie complet d'une requête HTTP à travers toutes les entrées d'audit.",
      queryTitle: "API de Requête des Logs d'Audit",
      realtimeIntro:
        "Les événements d'audit (hors logs de requêtes HTTP routinières) sont diffusés via SignalR aux clients connectés. Les événements sont délimités par locataire via des groupes spécifiques.",
      realtimeTitle: "Diffusion en Temps Réel",
      title: "Piste d'Audit Entreprise",
    },
    backgroundJobs: {
      architectureFlowTitle: "Pipeline d'Auto-Découverte",
      architectureIntro:
        "Au démarrage, BackgroundJobsConfiguration lit le fournisseur actif depuis appsettings.json et appelle GetServices<IAutoRegisteredJob>() pour découvrir chaque tâche enregistrée depuis le conteneur DI. Pour chaque tâche, il vérifie un remplacement appsettings par tâche, résout Enabled et CronExpression, puis planifie la tâche avec l'API du fournisseur. La tâche elle-même ne contient aucun code spécifique au fournisseur.",

      // Architecture
      architectureTitle: "Aperçu de l'Architecture",
      conn1: "[FR] drives",
      conn2: "[FR] triggers",
      conn3: "[FR] for each job",
      conn4: "[FR] on cron tick",
      connBuilds: "construit la requête",
      connOrders: "ordonne",
      connRemoves: "supprime",
      connStarts: "démarre",
      connTriggers: "déclenche",
      contractIntro:
        "Chaque tâche en arrière-plan récurrente dans SCRIPE implémente une interface : IAutoRegisteredJob. Ceci est le contrat complet — trois propriétés et une méthode. L'interface exclut délibérément tout concept spécifique au fournisseur (pas d'attributs Hangfire, pas d'annotations Quartz). La tâche n'a aucune connaissance du fournisseur qui l'exécute.",
      contractTitle: "Contrat IAutoRegisteredJob",
      descConfig:
        "[FR] Provider: Native | Hangfire | Quartz\nJobs: { id: { Enabled, CronExpression } }",
      descDiscovery: "[FR] Scans DI container for every registered IAutoRegisteredJob",
      descExecute: "[FR] Provider-agnostic - job has zero knowledge of which provider runs it",
      description:
        "Tâches récurrentes auto-découvertes et agnostiques du fournisseur (Native, Hangfire, Quartz.NET) — 31 tâches à travers 6 modules, aucun câblage manuel.",
      descSchedule: "[FR] Uses CronExpression from appsettings override or job default",
      descStartup: "[FR] Reads provider, discovers all jobs, schedules them",
      diIntro:
        "Chaque tâche nécessite exactement deux enregistrements DI dans le DependencyInjection.cs de son module. Omettre la deuxième ligne rend la tâche complètement invisible à tous les fournisseurs — elle ne sera jamais découverte ni planifiée, sans erreur ni avertissement.",

      // DI Registration
      diTitle: "Enregistrement DI — Le Modèle Critique à Deux Lignes",
      diWarning:
        "Le délégué d'usine IAutoRegisteredJob (ligne 2) est ce qui fait fonctionner l'auto-découverte. GetServices<IAutoRegisteredJob>() retourne uniquement les tâches enregistrées EN TANT QUE IAutoRegisteredJob. Une tâche enregistrée uniquement par son type concret est invisible pour les trois fournisseurs.",
      diWarningTitle: "Ne Sautez Jamais la Ligne 2",
      flowCascadeDesc:
        "Gère les contraintes de clés étrangères dans l'ordre de suppression correct",
      flowCascadeLabel: "Cascade sensible aux FK",
      flowCronDesc: "Cron par défaut pour les tâches de suppression douce",
      flowCronLabel: "Tick Cron (3h00)",
      flowExecuteDesc:
        "Exécuter SQL natif pour la suppression en masse, en contournant le suivi des modifications EF",
      flowExecuteLabel: "Suppression définitive",
      flowFilterDesc:
        "Trouver les enregistrements où IsDeleted = true ET DeletedAt < DateTime.UtcNow.AddDays(-30)",
      flowFilterLabel: "Filtrer les entités expirées",
      flowInitDesc: "Instancié par le conteneur DI",
      flowInitLabel: "SoftDeleteCleanupJob<TContext>",
      flowScanDesc: "Scan de réflexion sur DbContext pour les entités implémentant ISoftDeletable",
      flowScanLabel: "Découvrir ISoftDeletable",
      hierarchyColClass: "Classe",
      hierarchyColGets: "Ce que Vous Obtenez",
      hierarchyColUseWhen: "Utiliser Quand",
      hierarchyIntro:
        "Trois options existent selon la structure dont vous avez besoin. Les tâches légères implémentent IAutoRegisteredJob directement. Les tâches qui nécessitent des journaux de minutage structurés étendent RecurringJobBase. Les tâches qui nettoient les entités supprimées logiquement étendent SoftDeleteCleanupJob<TContext>.",
      hierarchyRow1Gets: "Juste le contrat — contrôle total, aucun supplément",
      hierarchyRow1When: "La tâche est simple, peu de code boilerplate nécessaire",
      hierarchyRow2Gets: "Journaux de démarrage/achèvement/erreur automatiques avec temps écoulé",
      hierarchyRow2When: "Vous voulez des journaux de minutage et d'erreurs structurés",
      hierarchyRow3Gets:
        "Découverte automatique des entités, suppression ordonnée par FK, traitement par lots",
      hierarchyRow3When:
        "Le module a besoin d'une tâche de nettoyage permanent des suppressions logiques",

      // Class Hierarchy
      hierarchyTitle: "Hiérarchie des Classes — Choisissez Votre Base",
      identityNote:
        "EmailProcessingJob et WebhookRetryJob/WebhookLogCleanupJob sont des tâches d'infrastructure de base enregistrées dans l'injection de dépendances du module Identity car elles dépendent de services de l'Identity.",
      intro:
        "Le système de tâches en arrière-plan de SCRIPE repose sur un principe : écrire une fois, exécuter sur n'importe quel fournisseur. Chaque tâche implémente IAutoRegisteredJob et est découverte automatiquement au démarrage. Basculer entre Native, Hangfire ou Quartz est un simple changement de configuration dans appsettings.json — aucune modification de code n'est requise.",
      inventoryColPurpose: "Objectif",
      inventoryComplianceTitle: "Module Compliance (7 tâches)",
      inventoryCoreTitle: "Module Core (5 tâches)",
      inventoryEntitlementsTitle: "Module Entitlements (12 tâches)",
      inventoryIdentityTitle: "Module Identity (2 tâches)",
      inventoryIntro:
        "Les 33 tâches en arrière-plan récurrentes à travers les six modules. Chaque tâche implémente IAutoRegisteredJob. Le Cron par défaut peut être remplacé par environnement dans appsettings.json.",
      inventoryMarketplaceTitle: "Module Marketplace (4 tâches)",
      inventoryPluginsTitle: "Module Plugins (3 tâches)",

      // Jobs Inventory
      inventoryTitle: "Inventaire Complet des Tâches — 33 Tâches",
      jobAnalyticsReport: "Génération de rapport d'analyse hebdomadaire",
      jobAnalyticsSnapshot: "Agrégation quotidienne des instantanés de revenus/MRR/ARR",
      jobAuthSessionCleanup:
        "Nettoie les sessions d'authentification expirées et les jetons de rafraîchissement",
      jobCommissionAutoCharge: "Relance les frais automatiques de commission échoués",
      jobCommissionInvoicing: "Consolidation de la facture de commission mensuelle",
      jobComplianceSoftDelete:
        "Supprime définitivement les entités Compliance supprimées logiquement",
      jobConsentExpiry: "Expire les consentements utilisateurs périmés",
      jobDsrEscalation: "Alerte sur les DSR approchant de leur délai SLA",
      jobDsrExecution:
        "Exécute les Demandes de Personnes Concernées en attente toutes les 5 minutes",
      jobDsrExportCleanup: "Supprime les fichiers d'exportation DSR expirés",
      jobDunningNotification: "Avis d'échec de paiement avec urgence croissante",
      jobEditionRollout: "Applique les mises à niveau et rétrogradations d'édition planifiées",
      jobEmailProcessing: "Interroge et envoie les emails différés via EmailJobProcessor",
      jobEntitlementsSoftDelete:
        "Supprime définitivement les entités Entitlements supprimées logiquement",
      jobIdentitySoftDelete: "Supprime définitivement les entités Identity supprimées logiquement",
      jobInstallCountAggregation:
        "Agrège les nombres d'installations transitoires dans les compteurs d'annonces d'applications statiques",
      jobMarketplaceSoftDelete:
        "Supprime définitivement les annonces, soumissions, profils et avis supprimés logiquement après le délai de rétention",
      jobOutboxCleanup: "Supprime les messages outbox traités de plus de 7 jours",

      // Job purpose descriptions
      jobOutboxProcessor: "Traite les messages outbox en attente et les transmet à AstraFlow",
      jobPaymobRecurringBilling: "Frais récurrents de carte au dossier Paymob",
      jobPayoutBatch:
        "Assemble les gains en attente dans des transferts groupés et exécute les paiements via Stripe Connect",
      jobPluginDataCleanup:
        "Purge les clés de stockage de base de données temporaires expirées créées par les plugins",
      jobPluginHealthCheck:
        "Sonde les environnements de bac à sable de plugins actifs et signale leur état de santé",
      jobPluginsSoftDelete:
        "Supprime définitivement les plugins, définitions et journaux d'exécution supprimés logiquement après le délai de rétention",
      jobReportGeneration:
        "Interroge et génère les rapports de conformité en attente toutes les 2 min",
      jobRetentionEnforcement: "Applique les politiques de rétention des données",
      jobStaleSubmissionReminder:
        "Recherche les soumissions d'applications en attente de révision depuis plus de 7 jours et alerte les administrateurs",
      jobSubscriptionReconciliation: "Expire les essais, renouvelle les abonnements actifs",
      jobTenantHealthScore: "Recalcule le score de santé pour tous les locataires actifs",
      jobTrialNotification: "Envoie des rappels pour les essais expirant dans 7, 3 ou 1 jour",
      jobUserSubscriptionReconciliation: "Réconciliation d'abonnement au niveau utilisateur Tier 2",
      jobWebhookLogCleanup: "Supprime les journaux de livraison webhook de plus de 90 jours",
      jobWebhookRetry: "Traite la file d'attente de relance de webhook persistant par lots de 50",
      newJobIntro:
        "Suivez exactement ces quatre étapes. Les seuls fichiers obligatoires sont la classe de tâche elle-même et les deux lignes d'enregistrement DI. Tout le reste est câblé automatiquement.",
      newJobStep1Desc:
        "Créez un nouveau fichier dans {Module}.Infrastructure/BackgroundJobs/. Utilisez la convention JobId : '{module}-{purpose}' en kebab-case. Implémentez ExecuteAsync de manière idempotente.",
      newJobStep1Title: "Étape 1 — Créer la Classe de Tâche",
      newJobStep2Desc:
        "Dans DependencyInjection.cs du module, ajoutez exactement deux enregistrements. La ligne 1 active l'injection de constructeur. La ligne 2 active l'auto-découverte. Ne sautez jamais la ligne 2.",
      newJobStep2Title: "Étape 2 — Enregistrer les DEUX Lignes DI",
      newJobStep3Desc:
        "Pour un calendrier spécifique à l'environnement ou pour désactiver la tâche, ajoutez un remplacement sous BackgroundJobs.Jobs en utilisant le JobId comme clé.",
      newJobStep3Title: "Étape 3 — Ajouter un Remplacement appsettings (Facultatif)",
      newJobStep4Desc:
        "Exécutez la compilation du backend. Zéro erreur signifie que la tâche est prête. L'auto-découverte gère le reste — aucune inscription manuelle nulle part.",
      newJobStep4Title: "Étape 4 — Compiler et Vérifier",

      // Creating a New Job
      newJobTitle: "Créer une Nouvelle Tâche en Arrière-plan",

      // IAutoRegisteredJob Contract
      nodeConfig: "[FR] appsettings.json\nProvider + Per-Job Overrides",
      nodeDiscovery: "[FR] Auto-Discovery Loop\nGetServices<IAutoRegisteredJob>()",
      nodeExecute: "[FR] job.ExecuteAsync(ct)\nAt every cron tick",
      nodeSchedule: "[FR] Schedule Each Job\nIf Enabled -> Register with provider API",
      nodeStartup: "[FR] BackgroundJobsConfiguration\nAddBackgroundJobsConfiguration()",
      providerColFeature: "Fonctionnalité",
      providerColHangfire: "Hangfire",
      providerColNative: "Native",
      providerColQuartz: "Quartz",
      providerHangfireBest: "Production avec SQL Server",
      providerHangfireDash: "/hangfire (SuperAdmin uniquement)",
      providerHangfireRetry: "Oui (tentatives configurables)",
      providerHangfireYes: "Sauvegardé sur SQL — survit aux redémarrages",
      providerNativeBest: "Développement local, tests unitaires",
      providerNativeDash: "Aucun",
      providerNativeNo: "En mémoire uniquement — perdu au redémarrage",
      providerNativeRetry: "Non",
      providerQuartzBest: "Production avec Oracle ou PostgreSQL",
      providerQuartzDash: "Aucun (Quartz.UI disponible séparément)",
      providerQuartzOptional: "En mémoire (stockage DB en option)",
      providerQuartzRetry: "Oui (via politique de misfire)",
      providerRowBestFor: "Idéal Pour",
      providerRowDashboard: "Tableau de Bord",
      providerRowPersistence: "Persistance des Tâches",
      providerRowRetry: "Nouvelle Tentative Auto",
      providersIntro:
        "Les trois fournisseurs utilisent exactement la même interface IAutoRegisteredJob. La seule différence réside dans la manière dont ils planifient et persistent les tâches. Configurez le fournisseur dans appsettings.json — aucune modification de code requise pour basculer.",

      // Providers
      providersTitle: "Comparaison des Fournisseurs",
      ruleMust1: "Une classe par fichier dans le dossier BackgroundJobs/",
      ruleMust2: "Enregistrer les DEUX lignes DI (concret + délégué d'usine)",
      ruleMust3: "Utiliser CRON à 5 champs (pas de format Quartz à 6 champs)",
      ruleMust4: "Rendre ExecuteAsync idempotent",
      ruleMust5: "Compiler après chaque changement — scripe build backend",
      ruleNever1: "Ne jamais importer les espaces de noms Hangfire ou Quartz dans les tâches",
      ruleNever2:
        "Ne jamais utiliser [AutomaticRetry] — la relance globale est dans BackgroundJobsConfiguration",
      ruleNever3: "Ne jamais appeler RecurringJob.AddOrUpdate<T>() dans le code du module",
      ruleNever4: "Ne jamais placer de tâches dans Services/ ou tout autre dossier",
      ruleNever5: "Ne jamais enregistrer en tant que Singleton — toujours AddScoped",
      rulesMustTitle: "✅ À Faire Obligatoirement",
      rulesNeverTitle: "❌ À Ne Jamais Faire",
      rulesTitle: "Règles",
      softDeleteFlowTitle: "Flux d'exécution de suppression douce",
      softDeleteIntro:
        "La classe de base SoftDeleteCleanupJob<TContext> est l'option la plus sophistiquée. Elle découvre automatiquement tous les types d'entités ISoftDeletable dans le DbContext, les trie topologiquement et supprime par lots.",
      softDeleteTip:
        "La commande CLI 'scripe add-bg-service {Module}' génère le fichier de tâche et ajoute les deux enregistrements DI en une seule étape. C'est la méthode recommandée pour ajouter un SoftDeleteCleanupJob.",

      // SoftDelete
      softDeleteTitle: "SoftDeleteCleanupJob — Suppression Automatique Ordonnée par FK",

      tenantWarning:
        "Les tâches en arrière-plan s'exécutent en dehors du contexte HTTP — il n'y a pas de contexte de locataire disponible. Les tâches qui traitent des données spécifiques au locataire doivent créer une portée explicite à l'aide de IServiceScopeFactory.",
      title: "Tâches en Arrière-plan (Background Jobs)",
    },
    databaseMigrations: {
      architectureContent:
        "La classe centrale reste agnostique, tandis que des classes dérivées distinctes appliquent la syntaxe spécifique du fournisseur.",
      architectureTitle: "Topologie des DbContext Dérivés",
      cliContent:
        "L'outil scripe-cli exécute des processus parallèles pour compiler 3 dossiers de migrations simultanés sans effort manuel.",
      cliRemoveContent:
        "Répare proprement des fusions (merges) ou des déploiements défectueux sur les 3 moteurs de bases de données en une seule commande.",
      cliRemoveTitle: "Retrait Forcé Intelligent (Smart Force Removal)",
      cliTitle: "Génération de Migrations Multi-Fournisseurs",
      cliUpdateContent:
        "Le CLI de mise à jour lit dynamiquement l'environnement (SQL Server ou Oracle) et sélectionne la bonne migration à pousser au serveur.",
      cliUpdateTitle: "Mise à jour Automatique des Moteurs",
      cliWarning:
        "Important : Ne manipulez jamais les fichiers ModelSnapshot manuellement. Cela créera une désynchronisation irrémédiable de l'infrastructure.",
      description: "Architecture EF Core auto-adaptative pour SQL Server, Oracle et PostgreSQL.",
      diContent:
        "Le moteur est sélectionné par simple variable de configuration. La collection de l'Injection de Dépendances (DI) s'occupe de lier le bon connecteur de base de données à la volée.",
      diTitle: "Injection Dynamique du Fournisseur",
      intro:
        "Les différents moteurs SQL gérant les types de données de manière divergente, SCRIPE s'assure d'une séparation absolue en compilant un ModelSnapshot unique pour chaque technologie SQL supportée.",
      newProviderContent:
        "Processus d'extension Clean Architecture pour brancher une technologie non native (ex: SQLite).",
      newProviderStep1: "Héritez et scellez la classe DbContext (sealed class).",
      newProviderStep2: "Implémentez l'usine (Factory) de conception à froid.",
      newProviderStep3: "Déclarez le nouveau fournisseur dans le tableau InfrastructureDI.cs.",
      newProviderStep4: "Initialisez le premier instantané avec scripe db add-migration.",
      newProviderTitle: "Ajout d'un Nouveau Moteur de Base de Données",
      title: "Migrations de Bases de Données d'Entreprise",
    },
    fileStorage: {
      architectureTitle: "Architecture de Stockage",
      configTitle: "Configuration",
      description: "Modèle de stratégie prenant en charge Local, Azure Blob, AWS S3 et MinIO.",
      intro:
        "SCRIPE change de fournisseur d'hébergement de fichiers dynamiquement en modifiant simplement les variables d'environnement.",
      providersTitle: "Fournisseurs de Stockage",
      tenantScopingTitle: "Stockage Cloisonné par Locataire",
      title: "Stockage de Fichiers (File Storage)",
      validationTitle: "Validation des Fichiers",
    },
    gatewayDeployment: {
      description:
        "Passerelle inverse YARP, système de modules paramétrable et mise en production sous IIS ou Kestrel.",
      iisStep1Desc: "Générez la distribution finale via la commande dotnet publish.",
      iisStep1Title: "1. Publier l'Application",
      iisStep2Desc: "Faire pointer le répertoire physique vers le dossier compilé.",
      iisStep2Title: "2. Configurer le site IIS",
      iisStep3Desc: "Renseigner la chaîne de connexion SQL au niveau du serveur.",
      iisStep3Title: "3. Définir les Variables d'Environnement",
      iisStep4Desc:
        "Sélectionnez impérativement 'No Managed Code' pour permettre le fonctionnement optimal de l'Out-of-Process de .NET Core.",
      iisStep4Title: "4. Configurer l'App Pool",
      iisTitle: "Déploiement sous IIS (Windows Server)",
      intro:
        "Explication de la façon dont le Monolithe Modulaire est réparti sur les serveurs physiques et exposé au monde extérieur.",
      kestrelTitle: "Configuration sous Kestrel (Linux)",
      microservicesTitle: "Mode Microservices",
      modesTitle: "Modes de Déploiement",
      moduleIntro:
        "La variable MODULE_NAME allège la charge de RAM en indiquant au binaire de ne charger en mémoire que le code de son microservice attribué.",
      moduleTitle: "Système de Modules",
      monolithTitle: "Mode Monolithe",
      portNote:
        "Sous le mode Microservices, chaque sous-réseau utilise une écoute de port dédiée pour l'acheminement des requêtes réseau.",
      title: "Passerelle et Déploiement (Gateway & Deployment)",
      yarpIntro:
        "Agit comme un pare-feu et un routeur qui transmet de manière intelligente la requête API au bon sous-module.",
      yarpTitle: "Passerelle YARP (API Gateway)",
    },
    healthChecks: {
      architectureTitle: "Architecture des Endpoints de Santé",
      checksIntro:
        "Chaque vérification valide une dépendance d'infrastructure spécifique. Les vérifications s'exécutent en parallèle pour une latence minimale. Les vérifications échouées renvoient des informations d'erreur détaillées sans divulguer les chaînes de connexion sensibles. L'état d'échec est configurable par vérification — les échecs de Base de données et Startup renvoient Unhealthy, tandis que Redis, SMTP et Storage renvoient Degraded.",
      checksTitle: "Vérifications Individuelles",
      description:
        "Points de terminaison de santé d'entreprise pour les probes liveness, readiness et startup de Kubernetes avec 5 vérifications individuelles.",
      dockerIntro:
        "Pour les déploiements Docker Compose, configurez les vérifications de santé dans la définition de service. Utilisez /health/live pour le liveness de base et /health/ready pour le readiness. Définissez start_period pour permettre le temps de migration de base de données.",
      dockerTip:
        "Pour les déploiements IIS : configurez la sonde de santé Application Request Routing (ARR) avec /health/ready comme URL de vérification. Pour Azure App Service : configurez le chemin de vérification de santé = /health/ready.",
      dockerTitle: "Vérification de Santé Docker Compose",
      endpointsTitle: "Endpoints de Santé",
      environmentsTitle: "Guide Spécifique par Environnement",
      intro:
        "SCRIPE fournit 5 points de terminaison de santé d'entreprise conçus pour l'orchestration Kubernetes, l'intégration des équilibreurs de charge et la surveillance opérationnelle. Chaque endpoint valide des dépendances d'infrastructure spécifiques et renvoie des réponses JSON structurées.",
      k8sIntro:
        "Les endpoints de santé de SCRIPE correspondent directement aux types de probes Kubernetes. Le probe de startup permet jusqu'à 5 minutes (30 échecs × 10s intervalle) pour la migration de base de données lors du premier déploiement.",
      k8sTitle: "Configuration des Probes Kubernetes",
      registrationIntro:
        "Les vérifications de santé sont enregistrées centralement dans HealthCheckExtensions.cs avec des tags explicites et des statuts d'échec. Les tags déterminent quel endpoint inclut chaque vérification.",
      registrationTitle: "Enregistrement des Vérifications de Santé",
      responseIntro:
        "SCRIPE supporte deux formats de réponse selon l'endpoint. Les endpoints de sonde publics renvoient un JSON minimal. Les endpoints authentifiés renvoient une réponse détaillée incluant les durées par vérification, tags, données de charge et détails d'exception.",
      responseTitle: "Format de Réponse",
      title: "Vérifications de Santé et Probes K8s",
    },
    loadTesting: {
      authFlowIntro:
        "Le test auth-flow.js simule des patterns d'authentification réalistes : connexion, accès aux endpoints protégés avec jeton JWT et vérification du health check. Des métriques personnalisées (scr_login_duration, scr_login_fail_rate) suivent les SLAs d'authentification.",
      authFlowTitle: "Script de Test du Flux d'Authentification",
      backupIntro:
        "SCRIPE prend en charge des stratégies de sauvegarde multi-fournisseur avec des outils et fréquences spécifiques pour chaque moteur de base de données.",
      backupTitle: "Sauvegarde et Reprise après Sinistre",
      cicdIntro:
        "k6 s'intègre avec GitHub Actions, GitLab CI et Azure Pipelines. Les tests s'exécutent contre une instance backend conteneurisée avec attente de readiness de santé. Le pipeline échoue automatiquement si un seuil SLA est dépassé.",
      cicdTitle: "Intégration CI/CD",
      description:
        "Suites de tests de performance k6 avec seuils SLA, intégration CI/CD et stratégie de sauvegarde multi-fournisseur.",
      drWarning:
        "Critique : Testez vos procédures de reprise après sinistre trimestriellement. Une sauvegarde jamais restaurée n'est pas une sauvegarde — c'est un espoir.",
      intro:
        "SCRIPE inclut des scripts de test de charge k6 pour valider les SLAs de performance ainsi qu'une stratégie complète de sauvegarde et de reprise après sinistre.",
      overviewIntro:
        "Deux suites de tests k6 préconstruites couvrent les parcours utilisateur critiques : flux d'authentification et opérations CRUD.",
      overviewTitle: "Suites de Tests k6",
      runningTitle: "Exécuter les Tests de Charge",
      thresholdsTitle: "Seuils SLA",
      title: "Tests de Charge et Sauvegarde",
    },
    observability: {
      alertsIntro:
        "Des règles d'alerte Prometheus préconfigurées détectent les conditions critiques et d'avertissement. Les alertes critiques se déclenchent pour des taux d'erreur élevés, des pannes de base de données et une latence extrême.",
      alertsTitle: "Règles d'Alerte",
      configTitle: "Configuration de l'Observabilité",
      description:
        "Traçage distribué OpenTelemetry, métriques Prometheus, journalisation centralisée Grafana Loki et règles d'alerte préconfigurées.",
      intro:
        "SCRIPE implémente une pile d'observabilité complète construite sur des standards ouverts : OpenTelemetry pour le traçage distribué, Prometheus pour la collecte de métriques, Grafana Loki pour la journalisation centralisée et Jaeger pour la visualisation des traces.",
      loggingIntro:
        "Serilog enrichit chaque entrée de journal avec le nom de machine, l'environnement, l'ID de corrélation, l'ID de locataire et le tag de module. Lorsque Loki est configuré, les journaux sont poussés en temps réel.",
      loggingTitle: "Journalisation Centralisée (Serilog + Loki)",
      monitoringStackIntro:
        "Un fichier Docker Compose préconstruit lance la pile de surveillance complète avec des sources de données, tableaux de bord et règles d'alerte provisionnés automatiquement.",
      monitoringStackTitle: "Pile de Surveillance Docker",
      productionWarning:
        "En production : définissez TraceSampleRatio à 0.1, changez le mot de passe Grafana par défaut, restreignez l'accès à /metrics via une liste blanche IP de proxy inverse.",
      prometheusIntro:
        "L'endpoint /metrics expose les métriques OpenTelemetry au format texte Prometheus. Prometheus scrape cet endpoint toutes les 15 secondes.",
      prometheusTitle: "Métriques Prometheus",
      stackTitle: "Architecture de la Pile d'Observabilité",
      title: "Observabilité et Surveillance",
      tracingIntro:
        "Le TracingBehavior crée un span OpenTelemetry pour chaque handler de commande et de requête avec détection automatique du module, type de demande et mesures de durée.",
      tracingTitle: "Traçage Distribué (OpenTelemetry)",
    },
    resilience: {
      architectureTitle: "Architecture de Résilience",
      circuitBreakerIntro:
        "Si l'API tierce échoue 5 fois de suite, le circuit s'ouvre : les appels suivants sont instantanément bloqués pendant 30 secondes pour laisser le temps au service de récupérer.",
      circuitBreakerTitle: "Disjoncteur (Circuit Breaker)",
      configTitle: "Configuration",
      description:
        "Politiques Polly pour les nouvelles tentatives (retries), les disjoncteurs (circuit breakers) et les délais d'attente (timeouts).",
      intro:
        "La stratégie pour s'assurer qu'une défaillance temporaire du réseau n'effondre pas l'entièreté de l'application.",
      retryTitle: "Politique de Nouvelle Tentative (Retry)",
      timeoutTitle: "Politique de Délai d'Attente (Timeout)",
      title: "Modèles de Résilience",
      usageTitle: "Utilisation dans le HttpClient",
    },
    scripeCli: {
      autoWiringIntro:
        "La véritable valeur de l'outil : écrire le code est simple, l'insérer dans l'écosystème de 1000 fichiers sans erreur l'est moins. La CLI gère les enregistrements cruciaux :",
      autoWiringTitle: "Cblage Automatique (Auto-Wiring)",
      bgJobsIntro: "Intègre des classes et squelettes pour la file d'attente de tches Hangfire.",
      bgJobsTitle: "Générateurs de Services d'Arrière-plan",
      commandsIntro: "Les opérations pivots qui produisent le volume principal de la base de code.",
      commandsReferenceIntro:
        "L'interface CLI SCRIPE propose 123 commandes réparties dans 10 catégories distinctes, couvrant tous les aspects du cycle de vie du développement et des opérations. Ci-dessous se trouve le tableau de référence complet.",
      commandsReferenceTitle: "Référence Complète des Commandes (v4.0)",
      commandsTitle: "Commandes de Scaffolding de Base",
      configIntro:
        "S'appuie sur le fichier scripe.config.json à la racine du monorepo pour découvrir les chemins cibles.",
      configTitle: "Configuration Globale CLI",
      dbCliCmd:
        "Encapsule les exécutions complexes d'Entity Framework pour manipuler et migrer 3 dialectes SQL différents sans heurt.",
      dbSyncIntro:
        "Commandes haut-niveau liant les couches physiques des infrastructures C# et React.",
      dbSyncTitle: "Synchronisation de la Base de Données et de l'API",
      description:
        "Générateur productif via 79 modèles de scaffolding, commandes de multi-base de données et inter-câblage automatique.",
      destructionIntro:
        "Permet de revenir en arrière instantanément si vous n'êtes pas satisfait d'un module généré en nettoyant proprement les références.",
      destructionTitle: "Outils de Destruction (Rollback)",
      dslIntro:
        "Via le paramètre -p, un simple format texte compile les classes C# en même temps que les validateurs React côté client.",
      dslSyntaxInfo: "Règles de Syntaxe : NomPropriété:Type[:Modificateur1][:Modificateur2]",
      dslTitle: "Syntaxe DSL pour Définir les Propriétés",
      intro:
        "La CLI Node.js propriétaire de SCRIPE résout le problème de répétition inhérent aux architectures propres. Elle conçoit des modules full-stack complets qui traversent de React à SQL.",
      namingIntro:
        "Traite une variable et la pluralise, la transforme en PascalCase, kebab-case et en constante SNAKE_CASE infailliblement.",
      namingTitle: "Mutations Intelligentes des Noms",
      newFeatureIntro:
        "Crée 26 fichiers parfaitement reliés pour des opérations CRUD (APIs, Interfaces REST, Handlers AstraFlow mediator, Zod) en utilisant un DSL.",
      newFeatureTitle: "Génération de Fonctionnalités : new-feature",
      newModuleIntro:
        "Crée des partitions logiques isolées DDD en Backend (Application, Domain, Infrastructure) et le squelette en Frontend simultanément.",
      newModuleTitle: "Génération de Modules : new-module",
      revertSafely:
        "L'annulation d'une création récure parfaitement les cblages de manière indolore.",
      securityIntro:
        "Les contrôleurs générés par CLI naissent sécurisés, incluant automatiquement les balises de permissions RBAC.",
      securityTitle: "Défense Automatisée en Profondeur",
      syncApiCmd:
        "Consomme à la volée le Swagger (OpenAPI) distant et écrit les contrats de types TypeScript Zod automatiquement.",
      templatesIntro:
        "Plutôt que d'écrire des architectures standards à la main, la CLI impose une architecture propre (Clean Architecture) pure grâce à 79 modèles Handlebars précis répartis sur 54 fichiers backend et 25 configurations frontend, garantissant ainsi la qualité.",
      templatesTitle: "79 Modèles Immuables (Templates)",
      title: "L'Outil SCRIPE CLI",
      utilityIntro:
        "Démarre les environnements Node.js et les projets .NET en simultané depuis une invite de commande unique.",
      utilityTitle: "Outils Utilitaires d'Écosystème",
      wiringDocker: "Création des alias DNS réseau dans docker-compose.yml.",
      wiringFrontendApp: "Ancrage des routes Server-Routing dans Next.js.",
      wiringFrontEnv: "Mise à jour des mandataires proxy d'environnement.",
      wiringPermissions: "Création des constantes React d'autorisations (permissions.ts).",
      wiringProgram: "Inscriptions à l'intérieur de Program.cs.",
      wiringSettings: "Extension des chaînes de connexion dans appsettings.json.",
      wiringSln: "Injection directe de GUID dans les solutions .sln.",
    },
    scripeStudio: {
      architectureIntro:
        "Le Studio se compose de deux composants : le Moteur (Express + Socket.io + SQLite sur le port 4201) gère les requêtes API, l'exécution des commandes et le streaming en temps réel. L'UI (Next.js sur le port 4200) offre 19 pages couvrant tous les aspects du workflow de développement.",
      architectureTitle: "Architecture du Studio",
      cliCommandsIntro:
        "Le Studio est entièrement lancé et géré via la CLI SCRIPE. La commande scripe studio supporte le mode dev (--dev), le mode production, le mode build uniquement (studio build), les ports personnalisés (--port, --engine-port) et le mode headless (--no-browser).",
      cliCommandsTitle: "Commandes CLI du Studio",
      description:
        "Tableau de bord visuel pour développeurs avec gestion de modules en temps réel, générateurs de code, contrôles de serveurs de développement et terminal intégré.",
      featureConfig:
        "Éditeur de Configuration — Afficher et modifier les variables d'environnement dans .env, appsettings.json et scripe.config.json.",
      featureDashboard:
        "Dashboard — Score de santé, flux d'activité, statistiques des modules et vue d'ensemble du système.",
      featureDatabase:
        "Base de Données — Exécuter des migrations, initialiser des données, vérifier le statut des migrations, sauvegarder et réinitialiser les modules.",
      featureDevServers:
        "Serveurs de Développement — Démarrer, arrêter et redémarrer les serveurs backend et frontend en un clic.",
      featureDocker:
        "Docker — Gérer les services Docker Compose, consulter les logs, vérifier la santé des conteneurs.",
      featureGenerators:
        "Générateurs de Code — Générer des événements, spécifications, validateurs, enums, hooks, composants et pages via des formulaires.",
      featureModules:
        "Gestionnaire de Modules — Créer, supprimer, inspecter et parcourir les modules avec une UI visuelle et un retour en temps réel.",
      featurePackages:
        "Gestionnaire de Paquets — Ajouter, supprimer et mettre à jour les paquets npm et NuGet pour le frontend et le backend.",
      featureSecurity:
        "Outils de Sécurité — Générer des secrets JWT/AES, exécuter des audits de vulnérabilités et valider la complétude de l'environnement.",
      featuresTitle: "Fonctionnalités du Studio",
      featureTerminal:
        "Terminal — Terminal intégré avec historique des commandes, rendu de sortie ANSI et streaming via WebSocket.",
      intro:
        "SCRIPE Studio est un tableau de bord visuel complet pour développeurs offrant une interface web en temps réel pour la gestion des modules, l'exécution de générateurs de code, le contrôle des serveurs de développement, les opérations de base de données, la gestion Docker et plus encore — le tout depuis un seul onglet de navigateur.",
      securityIntro:
        "Sécurité de défense en profondeur : authentification par jeton (généré à chaque démarrage), validation de liste blanche de commandes, assainissement centralisé des entrées, limitation de débit (200 req/min par IP), liste blanche CORS (localhost uniquement) et validation d'URL.",
      securityTitle: "Modèle de Sécurité",
      title: "SCRIPE Studio",
    },
  },
};

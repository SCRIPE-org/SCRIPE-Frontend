// FILE-EXCEPTION: file length
/**
 * Docs page locale — FR
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const fr = {
  infrastructure: {
    backgroundJobs: {
      title: "Tâches en Arrière-plan (Background Jobs)",
      description:
        "Tâches récurrentes auto-découvertes et agnostiques du fournisseur (Native, Hangfire, Quartz.NET) — 24 tâches à travers 4 modules, aucun câblage manuel.",
      intro:
        "Le système de tâches en arrière-plan de SCRIPE repose sur un principe : écrire une fois, exécuter sur n'importe quel fournisseur. Chaque tâche implémente IAutoRegisteredJob et est découverte automatiquement au démarrage. Basculer entre Native, Hangfire ou Quartz est un simple changement de configuration dans appsettings.json — aucune modification de code n'est reqscripee.",

      // Architecture
      architectureTitle: "Aperçu de l'Architecture",
      architectureIntro:
        "Au démarrage, BackgroundJobsConfiguration lit le fournisseur actif depscripe appsettings.json et appelle GetServices<IAutoRegisteredJob>() pour découvrir chaque tâche enregistrée depscripe le conteneur DI. Pour chaque tâche, il vérifie un remplacement appsettings par tâche, résout Enabled et CronExpression, pscripe planifie la tâche avec l'API du fournisseur. La tâche elle-même ne contient aucun code spécifique au fournisseur.",
      architectureFlowTitle: "Pipeline d'Auto-Découverte",

      // IAutoRegisteredJob Contract
      nodeConfig: "Fichier appsettings.json\nFournisseur & Remplacements par Job",
      descConfig:
        "Fournisseur : Native | Hangfire | Quartz\nJobs : { id : { Enabled, CronExpression } }",
      nodeStartup: "Configuration de BackgroundJobs\nAddBackgroundJobsConfiguration()",
      descStartup: "Lit le fournisseur, découvre toutes les tâches, les planifie",
      nodeDiscovery: "Boucle d'Auto-Découverte\nGetServices<IAutoRegisteredJob>()",
      descDiscovery: "Parcourt le conteneur DI pour chaque IAutoRegisteredJob enregistré",
      nodeSchedule:
        "Planification de Chaque Tâche\nSi activé -> Enregistrer via l'API du fournisseur",
      descSchedule: "Utilise la CronExpression du remplacement appsettings ou celle par défaut",
      nodeExecute: "job.ExecuteAsync(ct)\nÀ chaque tick de cron",
      descExecute: "Agnostique du fournisseur - la tâche ignore quel fournisseur l'exécute",
      conn1: "pilote",
      conn2: "déclenche",
      conn3: "pour chaque tâche",
      conn4: "au tick de cron",
      contractTitle: "Contrat IAutoRegisteredJob",
      contractIntro:
        "Chaque tâche en arrière-plan récurrente dans SCRIPE implémente une interface : IAutoRegisteredJob. Ceci est le contrat complet — trois propriétés et une méthode. L'interface exclut délibérément tout concept spécifique au fournisseur (pas d'attributs Hangfire, pas d'annotations Quartz). La tâche n'a aucune connaissance du fournisseur qui l'exécute.",

      // DI Registration
      diTitle: "Enregistrement DI — Le Modèle Critique à Deux Lignes",
      diIntro:
        "Chaque tâche nécessite exactement deux enregistrements DI dans le DependencyInjection.cs de son module. Omettre la deuxième ligne rend la tâche complètement invisible à tous les fournisseurs — elle ne sera jamais découverte ni planifiée, sans erreur ni avertissement.",
      diWarningTitle: "Ne Sautez Jamais la Ligne 2",
      diWarning:
        "Le délégué d'usine IAutoRegisteredJob (ligne 2) est ce qui fait fonctionner l'auto-découverte. GetServices<IAutoRegisteredJob>() retourne uniquement les tâches enregistrées EN TANT QUE IAutoRegisteredJob. Une tâche enregistrée uniquement par son type concret est invisible pour les trois fournisseurs.",

      // Class Hierarchy
      hierarchyTitle: "Hiérarchie des Classes — Choisissez Votre Base",
      hierarchyIntro:
        "Trois options existent selon la structure dont vous avez besoin. Les tâches légères implémentent IAutoRegisteredJob directement. Les tâches qui nécessitent des journaux de minutage structurés étendent RecurringJobBase. Les tâches qui nettoient les entités supprimées logiquement étendent SoftDeleteCleanupJob<TContext>.",
      hierarchyColClass: "Classe",
      hierarchyColUseWhen: "Utiliser Quand",
      hierarchyColGets: "Ce que Vous Obtenez",
      hierarchyRow1When: "La tâche est simple, peu de code boilerplate nécessaire",
      hierarchyRow1Gets: "Juste le contrat — contrôle total, aucun supplément",
      hierarchyRow2When: "Vous voulez des journaux de minutage et d'erreurs structurés",
      hierarchyRow2Gets: "Journaux de démarrage/achèvement/erreur automatiques avec temps écoulé",
      hierarchyRow3When:
        "Le module a besoin d'une tâche de nettoyage permanent des suppressions logiques",
      hierarchyRow3Gets:
        "Découverte automatique des entités, suppression ordonnée par FK, traitement par lots",

      // Providers
      providersTitle: "Comparaison des Fournisseurs",
      providersIntro:
        "Les trois fournisseurs utilisent exactement la même interface IAutoRegisteredJob. La seule différence réside dans la manière dont ils planifient et persistent les tâches. Configurez le fournisseur dans appsettings.json — aucune modification de code reqscripee pour basculer.",
      providerColFeature: "Fonctionnalité",
      providerColNative: "Native",
      providerColHangfire: "Hangfire",
      providerColQuartz: "Quartz",
      providerRowPersistence: "Persistance des Tâches",
      providerNativeNo: "En mémoire uniquement — perdu au redémarrage",
      providerHangfireYes: "Sauvegardé sur SQL — survit aux redémarrages",
      providerQuartzOptional: "En mémoire (stockage DB en option)",
      providerRowDashboard: "Tableau de Bord",
      providerNativeDash: "Aucun",
      providerHangfireDash: "/hangfire (SuperAdmin uniquement)",
      providerQuartzDash: "Aucun (Quartz.UI disponible séparément)",
      providerRowRetry: "Nouvelle Tentative Auto",
      providerNativeRetry: "Non",
      providerHangfireRetry: "Oui (tentatives configurables)",
      providerQuartzRetry: "Oui (via politique de misfire)",
      providerRowBestFor: "Idéal Pour",
      providerNativeBest: "Développement local, tests unitaires",
      providerHangfireBest: "Production avec SQL Server",
      providerQuartzBest: "Production avec Oracle ou PostgreSQL",

      // Jobs Inventory
      inventoryTitle: "Inventaire Complet des Tâches — 24 Tâches",
      inventoryIntro:
        "Les 24 tâches en arrière-plan récurrentes à travers les quatre modules. Chaque tâche implémente IAutoRegisteredJob. Le Cron par défaut peut être remplacé par environnement dans appsettings.json.",
      inventoryColPurpose: "Objectif",
      inventoryCoreTitle: "Module Core (1 tâche)",
      inventoryIdentityTitle: "Module Identity (4 tâches)",
      inventoryEntitlementsTitle: "Module Entitlements (12 tâches)",
      inventoryComplianceTitle: "Module Compliance (7 tâches)",

      // Job purpose descriptions
      jobOutboxCleanup: "Supprime les messages outbox traités de plus de 7 jours",
      jobIdentitySoftDelete: "Supprime définitivement les entités Identity supprimées logiquement",
      jobEmailProcessing: "Interroge et envoie les emails différés via EmailJobProcessor",
      jobWebhookRetry: "Traite la file d'attente de relance de webhook persistant par lots de 50",
      jobWebhookLogCleanup: "Supprime les journaux de livraison webhook de plus de 90 jours",
      identityNote:
        "EmailProcessingJob et WebhookRetryJob/WebhookLogCleanupJob sont des tâches d'infrastructure de base enregistrées dans l'injection de dépendances du module Identity car elles dépendent de services de l'Identity.",
      jobEntitlementsSoftDelete:
        "Supprime définitivement les entités Entitlements supprimées logiquement",
      jobSubscriptionReconciliation: "Expire les essais, renouvelle les abonnements actifs",
      jobTrialNotification: "Envoie des rappels pour les essais expirant dans 7, 3 ou 1 jour",
      jobDunningNotification: "Avis d'échec de paiement avec urgence croissante",
      jobEditionRollout: "Applique les mises à niveau et rétrogradations d'édition planifiées",
      jobUserSubscriptionReconciliation: "Réconciliation d'abonnement au niveau utilisateur Tier 2",
      jobAnalyticsSnapshot: "Agrégation quotidienne des instantanés de revenus/MRR/ARR",
      jobTenantHealthScore: "Recalcule le score de santé pour tous les locataires actifs",
      jobAnalyticsReport: "Génération de rapport d'analyse hebdomadaire",
      jobCommissionInvoicing: "Consolidation de la facture de commission mensuelle",
      jobCommissionAutoCharge: "Relance les frais automatiques de commission échoués",
      jobPaymobRecurringBilling: "Frais récurrents de carte au dossier Paymob",
      jobComplianceSoftDelete:
        "Supprime définitivement les entités Compliance supprimées logiquement",
      jobDsrExecution:
        "Exécute les Demandes de Personnes Concernées en attente toutes les 5 minutes",
      jobDsrEscalation: "Alerte sur les DSR approchant de leur délai SLA",
      jobDsrExportCleanup: "Supprime les fichiers d'exportation DSR expirés",
      jobRetentionEnforcement: "Applique les politiques de rétention des données",
      jobConsentExpiry: "Expire les consentements utilisateurs périmés",
      jobReportGeneration:
        "Interroge et génère les rapports de conformité en attente toutes les 2 min",

      // Creating a New Job
      newJobTitle: "Créer une Nouvelle Tâche en Arrière-plan",
      newJobIntro:
        "Suivez exactement ces quatre étapes. Les seuls fichiers obligatoires sont la classe de tâche elle-même et les deux lignes d'enregistrement DI. Tout le reste est câblé automatiquement.",
      newJobStep1Title: "Étape 1 — Créer la Classe de Tâche",
      newJobStep1Desc:
        "Créez un nouveau fichier dans {Module}.Infrastructure/BackgroundJobs/. Utilisez la convention JobId : '{module}-{purpose}' en kebab-case. Implémentez ExecuteAsync de manière idempotente.",
      newJobStep2Title: "Étape 2 — Enregistrer les DEUX Lignes DI",
      newJobStep2Desc:
        "Dans DependencyInjection.cs du module, ajoutez exactement deux enregistrements. La ligne 1 active l'injection de constructeur. La ligne 2 active l'auto-découverte. Ne sautez jamais la ligne 2.",
      newJobStep3Title: "Étape 3 — Ajouter un Remplacement appsettings (Facultatif)",
      newJobStep3Desc:
        "Pour un calendrier spécifique à l'environnement ou pour désactiver la tâche, ajoutez un remplacement sous BackgroundJobs.Jobs en utilisant le JobId comme clé.",
      newJobStep4Title: "Étape 4 — Compiler et Vérifier",
      newJobStep4Desc:
        "Exécutez la compilation du backend. Zéro erreur signifie que la tâche est prête. L'auto-découverte gère le reste — aucune inscription manuelle nulle part.",

      // SoftDelete
      softDeleteTitle: "SoftDeleteCleanupJob — Suppression Automatique Ordonnée par FK",
      softDeleteIntro:
        "La classe de base SoftDeleteCleanupJob<TContext> est l'option la plus sophistiquée. Elle découvre automatiquement tous les types d'entités ISoftDeletable dans le DbContext, les trie topologiquement et supprime par lots.",
      softDeleteTip:
        "La commande CLI 'scripe add-bg-service {Module}' génère le fichier de tâche et ajoute les deux enregistrements DI en une seule étape. C'est la méthode recommandée pour ajouter un SoftDeleteCleanupJob.",
      softDeleteFlowTitle: "Flux d'exécution de suppression douce",
      flowCronLabel: "Tick Cron (3h00)",
      flowCronDesc: "Cron par défaut pour les tâches de suppression douce",
      flowInitLabel: "SoftDeleteCleanupJob<TContext>",
      flowInitDesc: "Instancié par le conteneur DI",
      flowScanLabel: "Découvrir ISoftDeletable",
      flowScanDesc: "Scan de réflexion sur DbContext pour les entités implémentant ISoftDeletable",
      flowFilterLabel: "Filtrer les entités expirées",
      flowFilterDesc:
        "Trouver les enregistrements où IsDeleted = true ET DeletedAt < DateTime.UtcNow.AddDays(-30)",
      flowCascadeLabel: "Cascade sensible aux FK",
      flowCascadeDesc:
        "Gère les contraintes de clés étrangères dans l'ordre de suppression correct",
      flowExecuteLabel: "Suppression définitive",
      flowExecuteDesc:
        "Exécuter SQL natif pour la suppression en masse, en contournant le suivi des modifications EF",
      connTriggers: "déclenche",
      connStarts: "démarre",
      connBuilds: "construit la requête",
      connOrders: "ordonne",
      connRemoves: "supprime",
      rulesTitle: "Règles",
      rulesMustTitle: "✅ À Faire Obligatoirement",
      rulesNeverTitle: "❌ À Ne Jamais Faire",
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

      tenantWarning:
        "Les tâches en arrière-plan s'exécutent en dehors du contexte HTTP — il n'y a pas de contexte de locataire disponible. Les tâches qui traitent des données spécifiques au locataire doivent créer une portée explicite à l'aide de IServiceScopeFactory.",
    },
    fileStorage: {
      title: "Stockage de Fichiers (File Storage)",
      description: "Modèle de stratégie prenant en charge Local, Azure Blob, AWS S3 et MinIO.",
      intro:
        "SCRIPE change de fournisseur d'hébergement de fichiers dynamiquement en modifiant simplement les variables d'environnement.",
      architectureTitle: "Architecture de Stockage",
      providersTitle: "Fournisseurs de Stockage",
      validationTitle: "Validation des Fichiers",
      tenantScopingTitle: "Stockage Cloisonné par Locataire",
      configTitle: "Configuration",
    },
    resilience: {
      title: "Modèles de Résilience",
      description:
        "Politiques Polly pour les nouvelles tentatives (retries), les disjoncteurs (circuit breakers) et les délais d'attente (timeouts).",
      intro:
        "La stratégie pour s'assurer qu'une défaillance temporaire du réseau n'effondre pas l'entièreté de l'application.",
      architectureTitle: "Architecture de Résilience",
      retryTitle: "Politique de Nouvelle Tentative (Retry)",
      circuitBreakerTitle: "Disjoncteur (Circuit Breaker)",
      circuitBreakerIntro:
        "Si l'API tierce échoue 5 fois de suite, le circuit s'ouvre : les appels suivants sont instantanément bloqués pendant 30 secondes pour laisser le temps au service de récupérer.",
      timeoutTitle: "Politique de Délai d'Attente (Timeout)",
      usageTitle: "Utilisation dans le HttpClient",
      configTitle: "Configuration",
    },
    gatewayDeployment: {
      title: "Passerelle et Déploiement (Gateway & Deployment)",
      description:
        "Passerelle inverse YARP, système de modules paramétrable et mise en production sous IIS ou Kestrel.",
      intro:
        "Explication de la façon dont le Monolithe Modulaire est réparti sur les serveurs physiques et exposé au monde extérieur.",
      yarpTitle: "Passerelle YARP (API Gateway)",
      yarpIntro:
        "Agit comme un pare-feu et un routeur qui transmet de manière intelligente la requête API au bon sous-module.",
      moduleTitle: "Système de Modules",
      moduleIntro:
        "La variable MODULE_NAME allège la charge de RAM en indiquant au binaire de ne charger en mémoire que le code de son microservice attribué.",
      modesTitle: "Modes de Déploiement",
      monolithTitle: "Mode Monolithe",
      microservicesTitle: "Mode Microservices",
      portNote:
        "Sous le mode Microservices, chaque sous-réseau utilise une écoute de port dédiée pour l'acheminement des requêtes réseau.",
      iisTitle: "Déploiement sous IIS (Windows Server)",
      iisStep1Title: "1. Publier l'Application",
      iisStep1Desc: "Générez la distribution finale via la commande dotnet publish.",
      iisStep2Title: "2. Configurer le site IIS",
      iisStep2Desc: "Faire pointer le répertoire physique vers le dossier compilé.",
      iisStep3Title: "3. Définir les Variables d'Environnement",
      iisStep3Desc: "Renseigner la chaîne de connexion SQL au niveau du serveur.",
      iisStep4Title: "4. Configurer l'App Pool",
      iisStep4Desc:
        "Sélectionnez impérativement 'No Managed Code' pour permettre le fonctionnement optimal de l'Out-of-Process de .NET Core.",
      kestrelTitle: "Configuration sous Kestrel (Linux)",
    },
    databaseMigrations: {
      title: "Migrations de Bases de Données d'Entreprise",
      description: "Architecture EF Core auto-adaptative pour SQL Server, Oracle et PostgreSQL.",
      intro:
        "Les différents moteurs SQL gérant les types de données de manière divergente, SCRIPE s'assure d'une séparation absolue en compilant un ModelSnapshot unique pour chaque technologie SQL supportée.",
      architectureTitle: "Topologie des DbContext Dérivés",
      architectureContent:
        "La classe centrale reste agnostique, tandis que des classes dérivées distinctes appliquent la syntaxe spécifique du fournisseur.",
      diTitle: "Injection Dynamique du Fournisseur",
      diContent:
        "Le moteur est sélectionné par simple variable de configuration. La collection de l'Injection de Dépendances (DI) s'occupe de lier le bon connecteur de base de données à la volée.",
      cliTitle: "Génération de Migrations Multi-Fournisseurs",
      cliContent:
        "L'outil scripe-cli exécute des processus parallèles pour compiler 3 dossiers de migrations simultanés sans effort manuel.",
      cliWarning:
        "Important : Ne manipulez jamais les fichiers ModelSnapshot manuellement. Cela créera une désynchronisation irrémédiable de l'infrastructure.",
      cliUpdateTitle: "Mise à jour Automatique des Moteurs",
      cliUpdateContent:
        "Le CLI de mise à jour lit dynamiquement l'environnement (SQL Server ou Oracle) et sélectionne la bonne migration à pousser au serveur.",
      cliRemoveTitle: "Retrait Forcé Intelligent (Smart Force Removal)",
      cliRemoveContent:
        "Répare proprement des fusions (merges) ou des déploiements défectueux sur les 3 moteurs de bases de données en une seule commande.",
      newProviderTitle: "Ajout d'un Nouveau Moteur de Base de Données",
      newProviderContent:
        "Processus d'extension Clean Architecture pour brancher une technologie non native (ex: SQLite).",
      newProviderStep1: "Héritez et scellez la classe DbContext (sealed class).",
      newProviderStep2: "Implémentez l'usine (Factory) de conception à froid.",
      newProviderStep3: "Déclarez le nouveau fournisseur dans le tableau InfrastructureDI.cs.",
      newProviderStep4: "Initialisez le premier instantané avec scripe db add-migration.",
    },
    scripeCli: {
      title: "L'Outil SCRIPE CLI",
      description:
        "Générateur productif via 66 modèles de scaffolding, commandes de multi-base de données et inter-cblage automatique.",
      intro:
        "La CLI Node.js propriétaire de SCRIPE résout le problème de répétition inhérent aux architectures propres. Elle conçoit des modules full-stack complets qui traversent de React à SQL.",
      commandsTitle: "Commandes de Scaffolding de Base",
      commandsIntro: "Les opérations pivots qui prodscripeent le volume principal de la base de code.",
      newModuleTitle: "Génération de Modules : new-module",
      newModuleIntro:
        "Crée des partitions logiques isolées DDD en Backend (Application, Domain, Infrastructure) et le squelette en Frontend simultanément.",
      newFeatureTitle: "Génération de Fonctionnalités : new-feature",
      newFeatureIntro:
        "Crée 26 fichiers parfaitement reliés pour des opérations CRUD (APIs, Interfaces REST, Handlers SCRIPE mediator, Zod) en utilisant un DSL.",
      destructionTitle: "Outils de Destruction (Rollback)",
      destructionIntro:
        "Permet de revenir en arrière instantanément si vous n'êtes pas satisfait d'un module généré en nettoyant proprement les références.",
      bgJobsTitle: "Générateurs de Services d'Arrière-plan",
      bgJobsIntro: "Intègre des classes et squelettes pour la file d'attente de tches Hangfire.",
      dslTitle: "Syntaxe DSL pour Définir les Propriétés",
      dslIntro:
        "Via le paramètre -p, un simple format texte compile les classes C# en même temps que les validateurs React côté client.",
      dslSyntaxInfo: "Règles de Syntaxe : NomPropriété:Type[:Modificateur1][:Modificateur2]",
      templatesTitle: "66 Modèles Immuables (Templates)",
      templatesIntro:
        "Alimenté par des modèles Handlebars pour garantir que chaque développeur produit un code 100% conforme aux conventions internes.",
      securityTitle: "Défense Automatisée en Profondeur",
      securityIntro:
        "Les contrôleurs générés par CLI naissent sécurisés, incluant automatiquement les balises de permissions RBAC.",
      autoWiringTitle: "Cblage Automatique (Auto-Wiring)",
      autoWiringIntro:
        "La véritable valeur de l'outil : écrire le code est simple, l'insérer dans l'écosystème de 1000 fichiers sans erreur l'est moins. La CLI gère les enregistrements cruciaux :",
      wiringSln: "Injection directe de GUID dans les solutions .sln.",
      wiringProgram: "Inscriptions à l'intérieur de Program.cs.",
      wiringSettings: "Extension des chaînes de connexion dans appsettings.json.",
      wiringDocker: "Création des alias DNS réseau dans docker-compose.yml.",
      wiringPermissions: "Création des constantes React d'autorisations (permissions.ts).",
      wiringFrontendApp: "Ancrage des routes Server-Routing dans Next.js.",
      wiringFrontEnv: "Mise à jour des mandataires proxy d'environnement.",
      revertSafely:
        "L'annulation d'une création récure parfaitement les cblages de manière indolore.",
      dbSyncTitle: "Synchronisation de la Base de Données et de l'API",
      dbSyncIntro:
        "Commandes haut-niveau liant les couches physiques des infrastructures C# et React.",
      dbCliCmd:
        "Encapsule les exécutions complexes d'Entity Framework pour manipuler et migrer 3 dialectes SQL différents sans heurt.",
      syncApiCmd:
        "Consomme à la volée le Swagger (OpenAPI) distant et écrit les contrats de types TypeScript Zod automatiquement.",
      configTitle: "Configuration Globale CLI",
      configIntro:
        "S'appuie sur le fichier scripe.config.json à la racine du monorepo pour découvrir les chemins cibles.",
      namingTitle: "Mutations Intelligentes des Noms",
      namingIntro:
        "Traite une variable et la pluralise, la transforme en PascalCase, kebab-case et en constante SNAKE_CASE infailliblement.",
      utilityTitle: "Outils Utilitaires d'Écosystème",
      utilityIntro:
        "Démarre les environnements Node.js et les projets .NET en simultané depscripe une invite de commande unique.",
    },
    scripeStudio: {
      title: "SCRIPE Studio",
      description:
        "Tableau de bord visuel pour développeurs avec gestion de modules en temps réel, générateurs de code, contrôles de serveurs de développement et terminal intégré.",
      intro:
        "SCRIPE Studio est un tableau de bord visuel complet pour développeurs offrant une interface web en temps réel pour la gestion des modules, l'exécution de générateurs de code, le contrôle des serveurs de développement, les opérations de base de données, la gestion Docker et plus encore — le tout depscripe un seul onglet de navigateur.",
      architectureTitle: "Architecture du Studio",
      architectureIntro:
        "Le Studio se compose de deux composants : le Moteur (Express + Socket.io + SQLite sur le port 4201) gère les requêtes API, l'exécution des commandes et le streaming en temps réel. L'UI (Next.js sur le port 4200) offre 19 pages couvrant tous les aspects du workflow de développement.",
      securityTitle: "Modèle de Sécurité",
      securityIntro:
        "Sécurité de défense en profondeur : authentification par jeton (généré à chaque démarrage), validation de liste blanche de commandes, assainissement centralisé des entrées, limitation de débit (200 req/min par IP), liste blanche CORS (localhost uniquement) et validation d'URL.",
      featuresTitle: "Fonctionnalités du Studio",
      featureDashboard:
        "Dashboard — Score de santé, flux d'activité, statistiques des modules et vue d'ensemble du système.",
      featureModules:
        "Gestionnaire de Modules — Créer, supprimer, inspecter et parcourir les modules avec une UI visuelle et un retour en temps réel.",
      featureGenerators:
        "Générateurs de Code — Générer des événements, spécifications, validateurs, enums, hooks, composants et pages via des formulaires.",
      featureDevServers:
        "Serveurs de Développement — Démarrer, arrêter et redémarrer les serveurs backend et frontend en un clic.",
      featureDatabase:
        "Base de Données — Exécuter des migrations, initialiser des données, vérifier le statut des migrations, sauvegarder et réinitialiser les modules.",
      featureDocker:
        "Docker — Gérer les services Docker Compose, consulter les logs, vérifier la santé des conteneurs.",
      featureTerminal:
        "Terminal — Terminal intégré avec historique des commandes, rendu de sortie ANSI et streaming via WebSocket.",
      featureConfig:
        "Éditeur de Configuration — Afficher et modifier les variables d'environnement dans .env, appsettings.json et scripe.config.json.",
      featurePackages:
        "Gestionnaire de Paquets — Ajouter, supprimer et mettre à jour les paquets npm et NuGet pour le frontend et le backend.",
      featureSecurity:
        "Outils de Sécurité — Générer des secrets JWT/AES, exécuter des audits de vulnérabilités et valider la complétude de l'environnement.",
      cliCommandsTitle: "Commandes CLI du Studio",
      cliCommandsIntro:
        "Le Studio est entièrement lancé et géré via la CLI SCRIPE. La commande scripe studio supporte le mode dev (--dev), le mode production, le mode build uniquement (studio build), les ports personnalisés (--port, --engine-port) et le mode headless (--no-browser).",
    },
    healthChecks: {
      title: "Vérifications de Santé et Probes K8s",
      description:
        "Points de terminaison de santé d'entreprise pour les probes liveness, readiness et startup de Kubernetes avec 5 vérifications individuelles.",
      intro:
        "SCRIPE fournit 5 points de terminaison de santé d'entreprise conçus pour l'orchestration Kubernetes, l'intégration des équilibreurs de charge et la surveillance opérationnelle. Chaque endpoint valide des dépendances d'infrastructure spécifiques et renvoie des réponses JSON structurées.",
      architectureTitle: "Architecture des Endpoints de Santé",
      endpointsTitle: "Endpoints de Santé",
      checksTitle: "Vérifications Individuelles",
      checksIntro:
        "Chaque vérification valide une dépendance d'infrastructure spécifique. Les vérifications s'exécutent en parallèle pour une latence minimale. Les vérifications échouées renvoient des informations d'erreur détaillées sans divulguer les chaînes de connexion sensibles. L'état d'échec est configurable par vérification — les échecs de Base de données et Startup renvoient Unhealthy, tandis que Redis, SMTP et Storage renvoient Degraded.",
      registrationTitle: "Enregistrement des Vérifications de Santé",
      registrationIntro:
        "Les vérifications de santé sont enregistrées centralement dans HealthCheckExtensions.cs avec des tags explicites et des statuts d'échec. Les tags déterminent quel endpoint inclut chaque vérification.",
      k8sTitle: "Configuration des Probes Kubernetes",
      k8sIntro:
        "Les endpoints de santé de SCRIPE correspondent directement aux types de probes Kubernetes. Le probe de startup permet jusqu'à 5 minutes (30 échecs × 10s intervalle) pour la migration de base de données lors du premier déploiement.",
      dockerTitle: "Vérification de Santé Docker Compose",
      dockerIntro:
        "Pour les déploiements Docker Compose, configurez les vérifications de santé dans la définition de service. Utilisez /health/live pour le liveness de base et /health/ready pour le readiness. Définissez start_period pour permettre le temps de migration de base de données.",
      responseTitle: "Format de Réponse",
      responseIntro:
        "SCRIPE supporte deux formats de réponse selon l'endpoint. Les endpoints de sonde publics renvoient un JSON minimal. Les endpoints authentifiés renvoient une réponse détaillée incluant les durées par vérification, tags, données de charge et détails d'exception.",
      environmentsTitle: "Guide Spécifique par Environnement",
      dockerTip:
        "Pour les déploiements IIS : configurez la sonde de santé Application Request Routing (ARR) avec /health/ready comme URL de vérification. Pour Azure App Service : configurez le chemin de vérification de santé = /health/ready.",
    },
    observability: {
      title: "Observabilité et Surveillance",
      description:
        "Traçage distribué OpenTelemetry, métriques Prometheus, journalisation centralisée Grafana Loki et règles d'alerte préconfigurées.",
      intro:
        "SCRIPE implémente une pile d'observabilité complète construite sur des standards ouverts : OpenTelemetry pour le traçage distribué, Prometheus pour la collecte de métriques, Grafana Loki pour la journalisation centralisée et Jaeger pour la visualisation des traces.",
      stackTitle: "Architecture de la Pile d'Observabilité",
      tracingTitle: "Traçage Distribué (OpenTelemetry)",
      tracingIntro:
        "Le TracingBehavior crée un span OpenTelemetry pour chaque handler de commande et de requête avec détection automatique du module, type de demande et mesures de durée.",
      prometheusTitle: "Métriques Prometheus",
      prometheusIntro:
        "L'endpoint /metrics expose les métriques OpenTelemetry au format texte Prometheus. Prometheus scrape cet endpoint toutes les 15 secondes.",
      loggingTitle: "Journalisation Centralisée (Serilog + Loki)",
      loggingIntro:
        "Serilog enrichit chaque entrée de journal avec le nom de machine, l'environnement, l'ID de corrélation, l'ID de locataire et le tag de module. Lorsque Loki est configuré, les journaux sont poussés en temps réel.",
      alertsTitle: "Règles d'Alerte",
      alertsIntro:
        "Des règles d'alerte Prometheus préconfigurées détectent les conditions critiques et d'avertissement. Les alertes critiques se déclenchent pour des taux d'erreur élevés, des pannes de base de données et une latence extrême.",
      monitoringStackTitle: "Pile de Surveillance Docker",
      monitoringStackIntro:
        "Un fichier Docker Compose préconstruit lance la pile de surveillance complète avec des sources de données, tableaux de bord et règles d'alerte provisionnés automatiquement.",
      configTitle: "Configuration de l'Observabilité",
      productionWarning:
        "En production : définissez TraceSampleRatio à 0.1, changez le mot de passe Grafana par défaut, restreignez l'accès à /metrics via une liste blanche IP de proxy inverse.",
    },
    auditTrail: {
      title: "Piste d'Audit Entreprise",
      description:
        "Journalisation d'audit complète avec détection automatique de module, suivi de corrélation, diffusion en temps réel SignalR et plus de 45 types d'événements.",
      intro:
        "La piste d'audit entreprise de SCRIPE capture chaque action significative sur la plateforme — des événements d'authentification aux mutations d'entités en passant par les changements de permissions et les incidents de sécurité.",
      architectureTitle: "Architecture de la Piste d'Audit",
      entityTitle: "Schéma de l'Entité AuditLog",
      entityIntro:
        "L'entité AuditLog capture un contexte complet pour chaque événement auditable. Les anciennes et nouvelles valeurs sont stockées en tant qu'instantanés JSON.",
      moduleDetectionTitle: "Détection Automatique de Module",
      moduleDetectionIntro:
        "L'AuditService détermine automatiquement quel module a généré chaque événement d'audit en analysant le chemin de l'endpoint API ou le nom du type d'entité.",
      eventTypesTitle: "Types d'Événements d'Audit (45+)",
      realtimeTitle: "Diffusion en Temps Réel",
      realtimeIntro:
        "Les événements d'audit (hors logs de requêtes HTTP routinières) sont diffusés via SignalR aux clients connectés. Les événements sont délimités par locataire via des groupes spécifiques.",
      queryTitle: "API de Requête des Logs d'Audit",
      queryIntro:
        "L'endpoint de requête des logs d'audit supporte un filtrage exhaustif avec 12 paramètres. Tous les filtres sont optionnels et combinables. Les résultats sont paginés (défaut : 20 éléments, maximum : 100) et triés par horodatage décroissant.",
      queryTip:
        "Conseil professionnel : Utilisez CorrelationId pour tracer le cycle de vie complet d'une requête HTTP à travers toutes les entrées d'audit.",
    },
    loadTesting: {
      title: "Tests de Charge et Sauvegarde",
      description:
        "Suites de tests de performance k6 avec seuils SLA, intégration CI/CD et stratégie de sauvegarde multi-fournisseur.",
      intro:
        "SCRIPE inclut des scripts de test de charge k6 pour valider les SLAs de performance ainsi qu'une stratégie complète de sauvegarde et de reprise après sinistre.",
      overviewTitle: "Suites de Tests k6",
      overviewIntro:
        "Deux suites de tests k6 préconstruites couvrent les parcours utilisateur critiques : flux d'authentification et opérations CRUD.",
      thresholdsTitle: "Seuils SLA",
      authFlowTitle: "Script de Test du Flux d'Authentification",
      authFlowIntro:
        "Le test auth-flow.js simule des patterns d'authentification réalistes : connexion, accès aux endpoints protégés avec jeton JWT et vérification du health check. Des métriques personnalisées (scripe_login_duration, scripe_login_fail_rate) suivent les SLAs d'authentification.",
      runningTitle: "Exécuter les Tests de Charge",
      cicdTitle: "Intégration CI/CD",
      cicdIntro:
        "k6 s'intègre avec GitHub Actions, GitLab CI et Azure Pipelines. Les tests s'exécutent contre une instance backend conteneurisée avec attente de readiness de santé. Le pipeline échoue automatiquement si un seuil SLA est dépassé.",
      backupTitle: "Sauvegarde et Reprise après Sinistre",
      backupIntro:
        "SCRIPE prend en charge des stratégies de sauvegarde multi-fournisseur avec des outils et fréquences spécifiques pour chaque moteur de base de données.",
      drWarning:
        "Critique : Testez vos procédures de reprise après sinistre trimestriellement. Une sauvegarde jamais restaurée n'est pas une sauvegarde — c'est un espoir.",
    },
  },
};

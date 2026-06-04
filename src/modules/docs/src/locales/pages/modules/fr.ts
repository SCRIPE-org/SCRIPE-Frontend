/**
 * Docs page locale — FR
 */
export const fr = {
  modules: {
    compliance: {
      consent: {
        conn1: "modèles",
        conn2: "génère au changement",
        conn3: "auto-révoque si expiré",
        descJob: "Tâche quotidienne révoquant les consentements expirés",
        descPurpose: "Définit à quoi on consent (ex: Marketing)",
        descRecord: "État actuel (Accordé/Révoqué) par objectif",
        description:
          "Enregistrer, suivre et auditer les consentements pour la conformité à l'Article 6 du RGPD et au CCPA.",
        descSnapshot: "Capture immuable à l'instant T de l'accord/révocation",
        endpointsTitle: "Endpoints API",
        ep: {
          get: "Obtenir le consentement par ID",
          list: "Lister tous les consentements (paginé, filtrable)",
          record: "Enregistrer un nouveau consentement",
          withdraw: "Révoquer un consentement précédemment accordé",
        },
        flowTitle: "Flux de l'état du consentement",
        gdprIntro:
          "L'Article 6 du RGPD exige que le consentement soit libre, spécifique, éclairé et univoque. SCRIPE enregistre la version exacte du texte de consentement affiché à l'utilisateur.",
        gdprTitle: "Base légale du RGPD",
        immutabilityIntro: "Les enregistrements de consentement sont immuables.",
        immutabilityTitle: "Immuabilité",
        intro:
          "La gestion du consentement enregistre chaque fois qu'un utilisateur accorde ou révoque son consentement pour un objectif spécifique. SCRIPE stocke la piste d'audit complète.",
        nodeJob: "Tâche d'expiration du consentement",
        nodePurpose: "Objectif de consentement",
        nodeRecord: "Registre de consentement",
        nodeSnapshot: "Snapshot de consentement",
        purpose1: "Marketing — Emails marketing et communications promotionnelles.",
        purpose2: "Analytique — Analyse d'utilisation et amélioration du produit.",
        purpose3: "Tiers — Partage de données avec des services tiers.",
        purpose4: "Personnalisation — Contenu personnalisé et recommandations.",
        purposesIntro: "Chaque consentement est lié à un objectif spécifique :",
        purposesTitle: "Objectifs du consentement",
        title: "Gestion du consentement",
        withdrawalIntro:
          "Les utilisateurs peuvent révoquer leur consentement à tout moment. ConsentRecord est mis à jour avec WithdrawnAt.",
        withdrawalTitle: "Révocation du consentement",
      },
      dsr: {
        codeTitle: "Exemple de code",
        conn1: "initie",
        conn2: "la tâche en arrière-plan prend le relais",
        conn3: "si auto-traité (Export)",
        conn4: "si radical (Effacement)",
        conn5: "admin confirme",
        conn6: "admin rejette",
        descApproval: "L'effacement nécessite une confirmation manuelle de l'administrateur",
        descCompleted: "Export généré ou données effacées ; SLA respecté",
        descPending: "Demande enregistrée, délai SLA calculé",
        descProcessing: "DsrExecutionJob commence le traitement via ISuspendableModule",
        descRejected: "Demande refusée par l'administrateur avec notes de résolution",
        description:
          "Gérer les demandes de droits RGPD/CCPA (export, effacement, rectification, restriction) avec suivi du cycle de vie.",
        descSubmit: "Demande d'Export, d'Effacement ou de Rectification",
        endpointsIntro: "Le contrôleur DSR expose 6 endpoints pour le cycle complet :",
        endpointsTitle: "Endpoints API",
        entitiesTitle: "Entités",
        entityDesc: "Description",
        entityDsrDesc: "Représente une demande d'un sujet de données.",
        entityModuleDesc: "État d'exécution d'un module.",
        entityName: "Nom de l'entité",
        entityStatusDesc: "Historique des changements de statut.",
        ep: {
          assign: "Assigner un DSR à un responsable",
          create: "Soumettre un nouveau DSR",
          delete: "Suppression logique d'un DSR",
          get: "Obtenir les détails d'un DSR par ID",
          list: "Lister tous les DSR (paginé, filtrable)",
          updateStatus: "Mettre à jour le statut du DSR",
        },
        intro:
          "Les DSR sont des demandes formelles des individus exerçant leurs droits. Le module fournit un flux de travail DSR complet : soumission, assignation, traitement et clôture.",
        lifecycleFlowTitle: "Flux du cycle de vie DSR",
        lifecycleIntro: "Les DSR passent par un ensemble défini de statuts :",
        lifecycleTitle: "Cycle de vie de la demande",
        nodeApproval: "Attente de l'Admin",
        nodeCompleted: "Statut : Terminé",
        nodePending: "Statut : En attente",
        nodeProcessing: "Statut : En cours",
        nodeRejected: "Statut : Rejeté",
        nodeSubmit: "Soumettre la demande",
        slasIntro:
          "Selon l'Article 12 du RGPD, les responsables doivent répondre aux DSR dans les 30 jours (extensible à 3 mois).",
        slasTitle: "Exigences SLA du RGPD",
        status1: "En attente (Pending) — État initial lors de la réception.",
        status2: "En cours (InProgress) — Un responsable de conformité est assigné.",
        status3: "Terminé (Completed) — La demande a été satisfaite.",
        status4: "Rejeté (Rejected) — La demande a été rejetée (ex: vérification insuffisante).",
        title: "Demandes des sujets de données (DSR)",
        type1:
          "Export — Demande de portabilité. Le sujet souhaite une copie de ses données personnelles.",
        type2:
          "Effacement — Droit à l'oubli. Toutes les données doivent être supprimées ou anonymisées.",
        type3:
          "Rectification — Demande de correction. Les données inexactes doivent être mises à jour.",
        type4: "Restriction — Les données peuvent être conservées mais non traitées activement.",
        typesIntro:
          "Le système prend en charge quatre types de DSR définis par l'Article 17 du RGPD et le CCPA :",
        typesTitle: "Types de demandes",
      },
      inventory: {
        description:
          "Un registre de toutes les catégories de données personnelles traitées — requis pour les Registres d'activités de traitement (RoPA) Article 30 du RGPD.",
        endpointsTitle: "Endpoints API",
        ep: {
          create: "Ajouter une nouvelle catégorie de données",
          delete: "Supprimer un élément de l'inventaire",
          get: "Obtenir l'élément par ID",
          list: "Lister tous les éléments de l'inventaire (paginé, cherchable)",
          update: "Mettre à jour un élément existant",
        },
        field1: "DataCategory — Nom lisible (ex: 'Adresses e-mail').",
        field2: "LegalBasis — Base légale du RGPD (Consentement, Contrat, etc.).",
        field3: "DataSubjects — À qui appartiennent les données.",
        field4: "ProcessingPurpose — Pourquoi les données sont traitées.",
        field5: "StorageLocation — Où les données sont stockées.",
        field6: "RetentionPeriod — Durée de conservation (lié à la politique).",
        field7: "ThirdPartySharing — Si partagé avec des tiers.",
        fieldsIntro: "Chaque élément documente :",
        fieldsTitle: "Champs de l'inventaire",
        intro:
          "L'inventaire des données est un registre structuré de toutes les catégories de données personnelles que la plateforme traite.",
        ropaIntro:
          "Les organisations de plus de 250 employés doivent maintenir un RoPA. L'inventaire sert de RoPA en direct et interrogeable.",
        ropaTitle: "Conformité à l'Article 30",
        title: "Inventaire des données",
      },
      overview: {
        backendIntro:
          "Suit la structure SCRIPE à 3 projets (Domain / Application / Infrastructure) avec un ComplianceDbContext.",
        backendTitle: "Architecture Backend",
        conn1: "initie les demandes",
        conn2: "accorde/révoque",
        conn3: "contrôle les politiques",
        conn4: "guide l'effacement",
        conn5: "cible les données",
        conn6: "pistes d'audit",
        conn7: "pistes d'audit",
        descConsent: "Suivi immuable des états de consentement",
        descDsr: "Gère les demandes des sujets (Export, Effacement, Rectification)",
        descEnt: "Module des droits",
        descEntDesc: "Contrôle l'accès aux capacités de conformité",
        descId: "Module d'identité",
        descIdDesc: "Fournit le contexte Utilisateur/Admin et Auth",
        descInv: "Cartographie les PII sensibles dans les modules",
        descRep: "Génère les rapports RoPA et DPIA",
        descRet: "Applique les politiques de destruction des données",
        description:
          "Automatisation de la conformité RGPD, CCPA et PDPA : profils, gestion DSR, consentement, conservation, inventaire et rapports.",
        endpointsIntro:
          "Tous les endpoints sont sous /api/v1/compliances/ et nécessitent l'authentification.",
        endpointsTitle: "Aperçu des Endpoints API",
        frontendIntro:
          "Organisé en six sous-modules indépendants dans src/modules/compliance/ suivant le modèle View/ViewModel.",
        frontendTitle: "Architecture Frontend",
        infoContent:
          "Ce module est essentiel pour maintenir la conformité et éviter les amendes. Assurez-vous que toutes les fonctionnalités sont mappées correctement.",
        infoTitle: "Avis de conformité",
        intro:
          "Le module Conformité est le moteur de conformité réglementaire intégré à SCRIPE. Il aide les opérateurs et locataires à respecter les principales lois (RGPD, CCPA, PDPA) via des outils automatisés.",
        sub1: "Profils de réglementation — Stocke les cadres réglementaires (RGPD, CCPA, PDPA).",
        sub2: "Demandes des sujets de données (DSR) — Gère les demandes de droits (export, effacement, rectification, restriction).",
        sub3: "Gestion du consentement — Enregistre, suit et audite les consentements accordés et révoqués.",
        sub4: "Politiques de conservation — Définit la durée de conservation et l'action à l'expiration (supprimer ou anonymiser).",
        sub5: "Inventaire des données — Un registre de toutes les catégories de données personnelles.",
        sub6: "Rapports de conformité — Génère des rapports asynchrones (Aperçu RGPD, Résumé DSR, Audit des consentements, etc.).",
        subModulesIntro: "Chaque sous-système gère un domaine de conformité spécifique :",
        subModulesTitle: "Six Sous-systèmes",
        th1: "Composant",
        th2: "Responsabilité",
        title: "Module de conformité",
        tr1_1: "DsrListViewModel",
        tr1_2: "Gère la pagination, le filtrage et l'assignation des demandes (DSR).",
        tr2_1: "ConsentRecordView",
        tr2_2: "Affiche le snapshot immuable du consentement avec les métadonnées.",
        whatIsIntro:
          "Le module offre six sous-systèmes couvrant tout le cycle de conformité. Les locataires SCRIPE obtiennent un système prêt pour la production.",
        whatIsTitle: "Qu'est-ce que le module Conformité ?",
      },
      reports: {
        asyncIntro:
          "Les rapports sont asynchrones pour éviter de bloquer les requêtes HTTP. Le système crée immédiatement un ComplianceReport (IsReady=false) et met la tâche en file d'attente.",
        asyncTip:
          "Utilisez le bouton Rafraîchir pour vérifier si le rapport est prêt (généralement 30-60 secondes).",
        asyncTitle: "Génération asynchrone",
        description:
          "Générer des rapports asynchrones prêts pour l'audit (Aperçu RGPD, Résumé DSR, Audit Consentement, Analyse Conservation, Export Inventaire).",
        downloadIntro:
          "Une fois prêt (IsReady=true), DownloadUrl est disponible. Les fichiers sont conservés 90 jours.",
        downloadTitle: "Téléchargement des rapports",
        endpointsTitle: "Endpoints API",
        ep: {
          download: "Télécharger le fichier généré",
          generate: "Mettre en file d'attente une nouvelle génération de rapport",
          get: "Obtenir les détails du rapport et l'URL de téléchargement",
          list: "Lister tous les rapports de conformité",
        },
        intro:
          "Les rapports de conformité sont générés de manière asynchrone et fournissent des résumés prêts pour l'audit. Ils sont générés en arrière-plan et stockés pour le téléchargement.",
        reportTypesIntro: "Cinq types sont disponibles :",
        reportTypesTitle: "Types de rapports",
        title: "Rapports de conformité",
        type1: "Aperçu RGPD — Résumé de haut niveau du statut RGPD.",
        type2:
          "Résumé de l'activité DSR — Statistiques sur les volumes DSR, types, taux d'achèvement.",
        type3: "Audit du consentement — Journal complet des accords et révocations.",
        type4: "Analyse de la conservation — État d'application actuel des politiques actives.",
        type5:
          "Export de l'inventaire des données — Export complet de l'inventaire (Article 30 RoPA).",
      },
      retention: {
        action1: "Delete — Supprime définitivement tous les enregistrements correspondants.",
        action2: "Anonymize — Remplace les PII par des jetons pseudonymes.",
        actionsIntro: "À l'expiration, SCRIPE applique l'une des deux actions :",
        actionsTitle: "Actions d'expiration",
        automationIntro:
          "La tâche RetentionEnforcementJob s'exécute quotidiennement à 3h00 UTC, scannant toutes les politiques actives et appliquant l'action configurée.",
        automationTitle: "Application automatisée",
        conn1: "scanné par",
        conn2: "déclenche",
        conn3: "enregistre",
        descAction: "Suppression définitive ou Anonymisation",
        descEnforcement: "Tâche hebdomadaire évaluant les politiques",
        descExecution: "Piste d'audit de l'action de destruction",
        descPolicy: "Définit le type d'entité, la durée de vie et la stratégie",
        description:
          "Définir les périodes de conservation et les actions d'expiration (Suppression ou Anonymisation) pour l'Article 5(1)(e) du RGPD.",
        endpointsTitle: "Endpoints API",
        ep: {
          executions: "Lister l'historique d'exécution",
          list: "Lister toutes les politiques de conservation",
          update: "Mettre à jour une politique (jours, action, état)",
        },
        field1: "DataCategory — Le type de données (ex: 'Profils Utilisateurs').",
        field2: "RetentionDays — Combien de jours les données doivent être conservées.",
        field3:
          "ExpiryAction — Ce qui se passe à l'expiration : Delete (Supprimer) ou Anonymize (Anonymiser).",
        field4: "RegulationCode — Quelle réglementation l'exige (RGPD, CCPA, etc.).",
        intro:
          "Définissez la durée de conservation de catégories de données et ce qui se passe à l'expiration. SCRIPE applique cela automatiquement via des tâches en arrière-plan.",
        nodeAction: "Destruction des données",
        nodeEnforcement: "Tâche d'application de la conservation",
        nodeExecution: "Exécution de la conservation",
        nodePolicy: "Politique de conservation",
        policiesIntro: "Chaque politique de conservation spécifie :",
        policiesTitle: "Configuration de la politique",
        title: "Politiques de conservation des données",
      },
    },
    editions: {
      description:
        "Plans d'abonnement nommés avec regroupements de fonctionnalités, politiques de dépassement (overflow), versionnage et stratégies de déploiement.",
      drillDownIntro:
        "Lorsqu'un administrateur système descend dans un locataire (drill-down), la liste des éditions est automatiquement limitée aux éditions visibles par ce locataire. Le backend utilise l'en-tête X-Tenant-Context pour le filtrage : éditions système + éditions de détail créées par le locataire sélectionné. Le frontend masque les actions CRUD en mode drill-down.",
      drillDownTitle: "Comportement du Drill-Down",
      endpointsCreate: "Créer une nouvelle édition",
      endpointsCreateVersion:
        "Créer un nouveau brouillon de version avec un instantané des fonctionnalités",
      endpointsDelete: "Suppression logique (soft-delete) d'une édition",
      endpointsDirectApply:
        "Appliquer les changements de fonctionnalités immédiatement (sans versionnage)",
      endpointsGet: "Obtenir les détails de l'édition par ID",
      endpointsGetFeatures: "Lister les fonctionnalités configurées pour cette édition",
      endpointsGetVersions: "Lister toutes les versions pour cette édition",
      endpointsIntro:
        "Le contrôleur des Éditions expose 11 endpoints pour gérer les éditions, leurs fonctionnalités et le cycle de vie des versions :",
      endpointsList: "Lister toutes les éditions (paginé, filtrable)",
      endpointsPublishVersion:
        "Publier une version brouillon avec la stratégie de déploiement choisie",
      endpointsSetFeatures: "Définir/mettre à jour les fonctionnalités pour cette édition",
      endpointsTitle: "Points de terminaison API (Endpoints)",
      endpointsUpdate: "Mettre à jour les métadonnées de l'édition",
      entityIntro:
        "Une Édition est un plan nommé qui regroupe des valeurs de fonctionnalités. Les éditions système sont créées par les administrateurs de la plateforme ; les éditions de détail (retail) sont créées par les locataires revendeurs pour leurs sous-locataires.",
      entityTitle: "Entité Édition",
      featuresIntro:
        "Chaque édition contient un ensemble d'enregistrements EditionFeature qui associent les fonctionnalités à leurs valeurs au sein de ce plan. Les fonctionnalités qui ne sont pas explicitement définies dans une édition reviennent à Feature.DefaultValue.",
      featuresTip:
        "Les fonctionnalités non définies explicitement dans une édition reviennent à Feature.DefaultValue. Vous n'avez besoin de configurer que les fonctionnalités qui diffèrent de la valeur par défaut globale.",
      featuresTitle: "Fonctionnalités de l'Édition",
      intro:
        "Les Éditions sont des plans nommés (ex. Basic, Pro, Enterprise) qui regroupent des valeurs de fonctionnalités. Chaque locataire souscrit à une édition, ce qui détermine son accès aux fonctionnalités. Les éditions prennent en charge le versionnage avec des stratégies de déploiement contrôlées pour une mise en production sécurisée des changements.",
      overflowIntro:
        "Lorsqu'un locataire passe à une édition avec des limites inférieures (rétrogradation), ses ressources existantes peuvent dépasser les nouvelles limites. La politique de dépassement détermine ce qui se passe :",
      overflowTitle: "Politique de Dépassement (Overflow Policy)",
      rolloutIntro:
        "Lors de la publication d'une version d'édition, les administrateurs choisissent comment les changements sont déployés pour les locataires abonnés :",
      rolloutTitle: "Stratégies de Déploiement",
      scopingIntro:
        "SCRIPE prend en charge deux types d'éditions : Les éditions Système, créées par les administrateurs de la plateforme et visibles par tous les locataires, et les éditions de Détail (Retail), créées par les locataires revendeurs uniquement pour leurs sous-locataires.",
      scopingNote:
        "Les administrateurs de locataires ne voient que les éditions système plus leurs propres éditions de détail. Cela garantit l'isolation des éditions entre les locataires revendeurs.",
      scopingTitle: "Éditions Système vs Détail (Retail)",
      title: "Éditions",
      versionsIntro:
        "Les Versions d'Édition fournissent un système de versionnage et de déploiement pour les changements de fonctionnalités. Au lieu de modifier les fonctionnalités directement, les administrateurs peuvent créer une nouvelle version (instantané), choisir une stratégie de déploiement et la publier.",
      versionsTitle: "Versions de l'Édition",
      workflowIntro:
        "SCRIPE offre deux façons de mettre à jour les fonctionnalités d'une édition, chacune adaptée à des scénarios différents :",
      workflowTip:
        "Utilisez 'Appliquer Maintenant' pour les correctifs urgents et les petits changements. Utilisez 'Enregistrer comme Version' pour les mises à jour majeures du plan qui nécessitent un déploiement progressif et une piste d'audit.",
      workflowTitle: "Appliquer Maintenant vs Enregistrer comme Version",
    },
    entitlementsOverview: {
      architectureIntro:
        "Le système de Droits est composé de quatre domaines interconnectés qui travaillent ensemble pour fournir une solution complète de contrôle des fonctionnalités.",
      architectureTitle: "Architecture",
      backendIntro:
        "Le backend des Droits suit l'architecture standard des modules Clean Architecture de SCRIPE avec les couches Domain, Application et Infrastructure.",
      backendTitle: "Structure du Backend",
      comparisonIntro:
        "Le tableau suivant montre la différence de capacités lorsque le module des Droits est activé par rapport à une exécution sans celui-ci :",
      comparisonTitle: "Avec vs Sans Droits",
      contextAwareIntro:
        "Toutes les pages de droits (Fonctionnalités, Éditions, Permissions) sont contextuelles. Le frontend détecte si l'utilisateur est un administrateur système (tenantId est null), un administrateur de locataire ou en mode drill-down, et appelle des endpoints backend différents en conséquence. Les administrateurs système voient le catalogue complet avec CRUD ; les administrateurs de locataires voient uniquement leurs données effectives en mode lecture seule.",
      contextAwareTitle: "Filtrage contextuel des périmètres",
      controllersIntro:
        "Le module des Droits expose 31 points de terminaison (endpoints) API répartis sur 4 contrôleurs, tous authentifiés par JWT et protégés par une autorisation basée sur les permissions.",
      controllersTitle: "Contrôleurs API",
      cqrsMapIntro:
        "Le module des Droits enregistre 31 gestionnaires (handlers) AstraFlow mediator couvrant les quatre domaines. Chaque commande possède un validateur FluentValidation correspondant pour la validation des entrées.",
      cqrsMapTitle: "Carte des Commandes et Requêtes CQRS",
      description:
        "Contrôle d'accès aux fonctionnalités basé sur les éditions avec Fonctionnalités, Éditions, Abonnements et Surcharges par locataire.",
      diIntro:
        "Tous les services de Droits sont enregistrés via la méthode d'extension AddEntitlementsModule dans DependencyInjection.cs. Le module suit le modèle d'enregistrement standard de SCRIPE.",
      diTitle: "Enregistrement de l'Injection de Dépendances",
      domainsIntro: "Chaque domaine gère un aspect spécifique du cycle de vie des droits :",
      domainsTitle: "Quatre Domaines",
      frontendIntro:
        "Le frontend reflète le backend avec quatre sous-modules (éditions, fonctionnalités, abonnements, surcharges), chacun suivant le modèle SOLID View/ViewModel.",
      frontendTitle: "Structure du Frontend",
      gettingStartedIntro:
        "Suivez ces 5 étapes pour configurer le système de Droits pour votre plateforme. Chaque étape s'appuie sur la précédente :",
      gettingStartedTitle: "Premiers Pas",
      intro:
        "Le module des Droits (Entitlements) est le moteur de gestion des plans et des fonctionnalités de SCRIPE. Il définit les capacités que chaque locataire (tenant) obtient, comment les plans (éditions) regroupent ces capacités, et comment les abonnements lient les locataires aux plans.",
      noOpIntro:
        "Lorsque le module des Droits n'est pas chargé (ex. dans un microservice qui n'inclut pas les Droits), SCRIPE enregistre un NoOpFeatureCache. Cela permet aux commandes IRequireFeature de passer sans erreur — toutes les fonctionnalités sont traitées comme activées par défaut.",
      noOpNote:
        "La solution de repli NoOp garantit que les modules peuvent utiliser IRequireFeature sans dépendance stricte au module des Droits. En mode monolithe de production, le véritable FeatureCache est toujours disponible.",
      noOpTitle: "Solution de repli NoOp (Fallback)",
      pipelineIntro:
        "SCRIPE intègre les droits directement dans le pipeline CQRS de AstraFlow mediator via FeatureCheckBehavior. Les commandes et requêtes (queries) qui implémentent IRequireFeature sont automatiquement contrôlées — si la valeur résolue de la fonctionnalité pour le locataire est désactivée, la requête est rejetée avant d'atteindre le gestionnaire (handler).",
      pipelineTip:
        "Pour conditionner une commande à une fonctionnalité, implémentez simplement IRequireFeature et définissez RequiredFeatureName sur la clé système stable de la fonctionnalité (ex. 'Chat.Enabled'). Aucun code supplémentaire n'est nécessaire.",
      pipelineTitle: "Intégration au Pipeline",
      resolutionIntro:
        "Lorsque le système a besoin de déterminer la valeur d'une fonctionnalité pour un locataire, il suit une chaîne de priorité stricte. La source de priorité la plus élevée qui fournit une valeur l'emporte.",
      resolutionTip:
        "La chaîne de résolution est évaluée de manière paresseuse (lazy) — les valeurs sont mises en cache après la première résolution et invalidées lorsque les abonnements, les éditions ou les surcharges changent.",
      resolutionTitle: "Chaîne de Résolution des Valeurs de Fonctionnalité",
      title: "Aperçu des Droits (Entitlements)",
      whatIsIntro:
        "Les Droits sont le module responsable de contrôler à quelles fonctionnalités un locataire peut accéder en fonction de son édition (plan) souscrite. Il fournit une chaîne de résolution à trois niveaux : Valeurs par défaut de la fonctionnalité → Valeurs de l'édition → Surcharges par locataire, garantissant une flexibilité maximale pour les opérateurs de la plateforme et les locataires revendeurs.",
      whatIsTitle: "Que sont les Droits ?",
    },
    features: {
      cacheIntro:
        "Les valeurs de fonctionnalités résolues sont mises en cache dans le IFeatureCache pour éviter des requêtes à la base de données à chaque demande. Le cache est invalidé chaque fois que les fonctionnalités d'une édition changent, qu'un abonnement est modifié ou qu'une surcharge est définie/supprimée. Dans les déploiements de microservices sans le module des Droits, un NoOpFeatureCache traite toutes les fonctionnalités comme activées.",
      cacheNote:
        "Le cache est automatiquement invalidé lorsque : (1) les fonctionnalités d'une édition sont modifiées, (2) un abonnement est attribué/modifié, (3) une surcharge est définie/supprimée. Aucune purge manuelle du cache n'est nécessaire.",
      cacheTitle: "Cache des Fonctionnalités",
      contextAwareIntro:
        "La liste des fonctionnalités est contextuelle. Les administrateurs système voient le catalogue complet des fonctionnalités avec les opérations CRUD. Les administrateurs de locataires et les sessions en drill-down ne voient que les fonctionnalités effectives du locataire (résolues à partir de l'édition + surcharges) en mode lecture seule. Tout le filtrage de périmètre se fait côté backend via GET /features (catalogue) vs GET /features/effective (scoped au locataire).",
      contextAwareTitle: "Affichage contextuel des fonctionnalités",
      description:
        "Capacités contrôlables de la plateforme avec des types de valeurs Booléen, Numérique et Chaîne de caractères.",
      endpointsIntro:
        "Le contrôleur des Fonctionnalités expose 5 endpoints CRUD. Les fonctionnalités système ne peuvent pas être supprimées :",
      endpointsTitle: "Points de terminaison API (Endpoints)",
      entityIntro:
        "Une Fonctionnalité (Feature) définit une capacité contrôlable de la plateforme. Le champ Name est une clé système stable utilisée dans le code ; DisplayNameEn/DisplayNameAr sont des libellés destinés aux utilisateurs.",
      entityTitle: "Entité Fonctionnalité",
      ep: {
        create: "Créer une nouvelle fonctionnalité personnalisée",
        delete:
          "Suppression logique d'une fonctionnalité personnalisée (les fonctionnalités système ne peuvent pas être supprimées)",
        get: "Obtenir les détails de la fonctionnalité par ID",
        list: "Lister toutes les fonctionnalités (paginé, filtrable par catégorie/type)",
        update:
          "Mettre à jour les métadonnées de la fonctionnalité (fonctionnalités système : DefaultValue/Description uniquement)",
      },
      intro:
        "Les fonctionnalités sont les éléments de base atomiques du système de Droits. Chaque fonctionnalité représente une capacité contrôlable — un commutateur booléen, un quota numérique ou une configuration textuelle. Les fonctionnalités ont une clé système stable (Name) qui ne change jamais, ce qui permet de les référencer en toute sécurité dans le code.",
      patternIntro:
        "Pour conditionner n'importe quelle commande CQRS derrière une vérification de fonctionnalité, implémentez simplement l'interface de marquage IRequireFeature. Le FeatureCheckBehavior intercepte automatiquement la requête, résout la valeur de la fonctionnalité pour le locataire, et la rejette si elle est désactivée ou si le quota est dépassé.",
      patternTitle: "Modèle IRequireFeature",
      quotaIntro:
        "Les fonctionnalités numériques prennent en charge l'application automatique des quotas via l'entité QuotaCounter. Le FeatureCheckBehavior vérifie l'utilisation actuelle par rapport à la limite résolue pour chaque commande IRequireFeature ciblant une fonctionnalité numérique.",
      quotaTitle: "Suivi des Quotas (QuotaCounter)",
      requireFeatureIntro:
        "Pour conditionner une commande ou une requête CQRS à une fonctionnalité, implémentez l'interface de marquage IRequireFeature. Le comportement du pipeline FeatureCheckBehavior résout automatiquement la valeur actuelle pour le locataire et rejette la requête si la fonctionnalité est désactivée.",
      requireFeatureNote:
        "IRequireFeature fonctionne à la fois pour les fonctionnalités Booléennes (vérifiées comme activées/désactivées) et les fonctionnalités Numériques (vérifiées selon le quota restant). Le comportement détermine automatiquement le type de vérification à partir du Feature.ValueType.",
      requireFeatureTitle: "Interface IRequireFeature",
      seedingIntro:
        "Les fonctionnalités système sont automatiquement initialisées (seeded) au démarrage de l'application par EntitlementsStartupSeeder. L'initialiseur vérifie si chaque fonctionnalité système existe déjà (par son Nom) et ne crée que celles qui manquent — les fonctionnalités existantes ne sont jamais écrasées.",
      seedingTitle: "Initialisation des Fonctionnalités (Seeding)",
      systemVsCustomIntro:
        "SCRIPE fait la distinction entre les fonctionnalités système (insérées au démarrage, en lecture seule) et les fonctionnalités personnalisées (créées par les administrateurs via l'API) :",
      systemVsCustomTitle: "Fonctionnalités Système vs Personnalisées",
      title: "Fonctionnalités (Features)",
      valueTypesIntro:
        "Les valeurs des fonctionnalités sont stockées sous forme de chaînes (strings) mais interprétées selon leur ValueType. Le système valide les valeurs par rapport au type attendu lors de la création et de la mise à jour.",
      valueTypesTip:
        "Pour les fonctionnalités Numériques, utilisez -1 pour représenter 'illimité'. Le FeatureCheckBehavior reconnaît -1 comme une valeur spéciale et ne bloque jamais les requêtes pour les fonctionnalités ayant un quota illimité.",
      valueTypesTitle: "Types de Valeurs",
    },
    overrides: {
      auditIntro:
        "Chaque opération de surcharge est suivie avec des informations d'audit complètes. Le champ Raison (Reason) de chaque surcharge fournit le contexte expliquant pourquoi la valeur personnalisée a été appliquée.",
      auditTitle: "Piste d'Audit",
      bestPracticesIntro:
        "Suivez ces directives pour garder votre système de surcharges maintenable et auditable.",
      bestPracticesTitle: "Bonnes Pratiques",
      bestPracticesWarning:
        "Les surcharges doivent être utilisées avec parcimonie. Si de nombreux locataires ont besoin de la même surcharge, envisagez plutôt de créer une nouvelle édition. L'abus de surcharges rend le système plus difficile à gérer et crée une dette technique de maintenance.",
      bulkIntro:
        "Les administrateurs peuvent appliquer des surcharges à plusieurs locataires simultanément pour des mises à jour rapides à l'échelle de la plateforme.",
      bulkTitle: "Gestion en Masse",
      description:
        "Personnalisation des valeurs de fonctionnalités par locataire qui contourne les valeurs par défaut de l'édition.",
      endpointsIntro:
        "Le contrôleur TenantFeatures expose 4 endpoints pour gérer les surcharges par locataire et les valeurs résolues :",
      endpointsTitle: "Points de terminaison API (Endpoints)",
      entityIntro:
        "Un TenantFeatureOverride définit une valeur personnalisée pour une fonctionnalité spécifique sur un locataire spécifique. Il inclut un champ optionnel Reason (Raison) à des fins d'audit.",
      entityTitle: "Entité Surcharge",
      ep: {
        list: "Lister toutes les dérogations pour un locataire spécifique",
        remove: "Supprimer (désactiver) une dérogation de fonctionnalité",
        resolved:
          "Obtenir toutes les valeurs de fonctionnalités résolues pour un locataire (affiche la source : Dérogation/Édition/Défaut)",
        set: "Définir ou mettre à jour une dérogation de fonctionnalité pour un locataire",
      },
      errorIntro:
        "Les erreurs de résolution des surcharges sont journalisées avec des détails sur la fonctionnalité en conflit et le contexte du locataire pour un dépannage rapide.",
      errorTitle: "Gestion des Erreurs",
      expiryIntro:
        "Les surcharges peuvent avoir une date d'expiration (ExpiresAt) optionnelle. Lorsque la date d'expiration est passée, la surcharge est automatiquement désactivée et la fonctionnalité revient à la valeur de l'édition (ou à la valeur par défaut globale).",
      expiryNote:
        "Les surcharges expirées sont désactivées de manière logique (IsActive = false), et non supprimées. Cela préserve la piste d'audit et permet une réactivation si nécessaire.",
      expiryTitle: "Surcharges Expirables",
      historyIntro:
        "Le système conserve un historique complet des modifications de surcharges, permettant d'identifier qui a effectué une modification et pourquoi.",
      historyTitle: "Historique des Surcharges",
      importIntro:
        "Prise en charge de l'importation de surcharges via des fichiers CSV pour les configurations complexes nécessitant une préparation hors ligne.",
      importTitle: "Import/Export de Surcharges",
      intro:
        "Les Surcharges (Overrides) de fonctionnalités permettent aux administrateurs de la plateforme de personnaliser les valeurs des fonctionnalités pour des locataires individuels, indépendamment de leur édition souscrite. Les surcharges ont la plus haute priorité dans la chaîne de résolution, ce qui les rend parfaites pour des accords commerciaux sur mesure, des promotions spéciales ou des exceptions ponctuelles.",
      overuseWarning:
        "Les surcharges doivent être utilisées avec parcimonie. Si de nombreux locataires ont besoin de la même surcharge, envisagez plutôt de créer une nouvelle édition. Des surcharges excessives rendent le système plus difficile à gérer et à auditer.",
      priorityIntro:
        "Les surcharges se trouvent en haut de la chaîne de résolution. Lorsque le système résout une valeur de fonctionnalité pour un locataire, il vérifie d'abord l'existence d'une surcharge :",
      priorityTitle: "Priorité de Résolution",
      resolvedIntro:
        "L'endpoint GET /api/v1/tenants/{tenantId}/features/resolved renvoie la valeur finale et effective de chaque fonctionnalité pour un locataire donné. Il affiche la source de résolution (Surcharge, Édition ou Défaut) pour chaque entrée, facilitant ainsi le débogage et l'audit.",
      resolvedTitle: "Endpoint des Fonctionnalités Résolues",
      scenariosIntro:
        "Les scénarios réels suivants montrent quand les surcharges apportent le plus de valeur :",
      scenariosTitle: "Scénarios d'Utilisation",
      settingIntro:
        "Pour définir une surcharge, envoyez une requête POST à l'endpoint des fonctionnalités du locataire avec l'ID de la fonctionnalité, la valeur personnalisée et une raison optionnelle à des fins d'audit.",
      settingTip:
        "Incluez toujours une raison lors de la définition des surcharges — cela donne du sens aux pistes d'audit et aide les futurs administrateurs à comprendre pourquoi la surcharge a été appliquée.",
      settingTitle: "Définir une Surcharge",
      title: "Surcharges de Fonctionnalités (Overrides)",
      useCase1:
        "Accords d'entreprise personnalisés — 'Donner à Acme Corp 500 administrateurs au lieu des 50 standards'",
      useCase2:
        "Offres promotionnelles — 'Activer le Chat Premium pour ce locataire pendant 30 jours'",
      useCase3:
        "Tests Bêta — 'Activer le nouveau module de Facturation pour les premiers adoptants (early adopters)'",
      useCase4:
        "Augmentation temporaire — 'Augmenter la limite de téléchargement de fichiers pendant leur migration'",
      validationIntro:
        "Les nouvelles surcharges sont validées par rapport aux limites de l'édition actuelle pour prévenir toute configuration invalide.",
      validationTitle: "Validation des Surcharges",
      whenIntro:
        "Les surcharges sont conçues pour des cas exceptionnels où un locataire a besoin d'une valeur différente de celle fournie par son édition :",
      whenTitle: "Quand utiliser les Surcharges",
    },
    subscriptions: {
      assignIntro:
        "Créer un nouvel abonnement liant un locataire à une édition. Si le locataire a déjà un abonnement actif, le précédent est automatiquement annulé. Prend en charge les paramètres optionnels de devise, code promo et comportement d'expiration.",
      assignTitle: "Attribuer un Abonnement",
      concurrencyIntro:
        "Chaque TenantSubscription possède un ConcurrencyStamp (Guid) avec [ConcurrencyCheck]. Le tampon est renouvelé à chaque opération d'écriture. Cela prévient les conditions de course — par exemple, une annulation concurrente + un travail de rapprochement — en levant une DbUpdateConcurrencyException en cas de collision.",
      concurrencyTitle: "Concurrence Optimiste (E1)",
      crossModuleIntro:
        "Les événements du cycle de vie d'abonnement publient des événements de domaine consommés par le module Identité. Lors de la suspension d'un abonnement, tous les administrateurs du locataire sont désactivés avec DeactivationReason='SubscriptionSuspended'. À la reprise, seuls les administrateurs désactivés par suspension sont réactivés.",
      crossModuleReasons:
        "Trois raisons de désactivation : 'Manuel' (jamais réactivé automatiquement), 'SubscriptionSuspended' (réactivé à la reprise), 'SubscriptionExpired' (désactivé à l'expiration).",
      crossModuleTitle: "Intégration Inter-Modules (H1)",
      description:
        "Liaison locataire-édition avec gestion complète du cycle de vie, tarification multi-devises, promotions, essais, rétrogradations (downgrades), comportement d'expiration et export analytique avancé.",
      downgradeIntro:
        "Lorsqu'un locataire est rétrogradé (manuellement ou en raison d'une expiration), le système conserve les détails de l'abonnement d'origine pour l'audit et une éventuelle restauration. Les champs DowngradedFromEditionId, DowngradedFromType, DowngradedFromEndDate et DowngradedAt préservent l'historique complet de la rétrogradation.",
      downgradeTitle: "Suivi des Rétrogradations (Downgrades)",
      downgradeWarning:
        "Lors d'une rétrogradation, la Politique de Dépassement (OverflowPolicy) de l'édition cible détermine ce qu'il advient des ressources qui dépassent les nouvelles limites. Utilisez toujours l'endpoint d'Impact de Rétrogradation pour prévisualiser les effets avant d'effectuer des changements.",
      endpointsIntro:
        "Le contrôleur des Abonnements fournit 13 endpoints couvrant l'ensemble du cycle de vie de l'abonnement :",
      endpointsTitle: "Points de terminaison API (Endpoints)",
      entityIntro:
        "Une TenantSubscription (Abonnement Locataire) lie un locataire à une édition avec un suivi du cycle de vie. Elle prend en charge plusieurs types et statuts d'abonnement pour une gestion complète du cycle de vie.",
      entityTitle: "Entité Abonnement",
      ep: {
        assign:
          "Créer un nouvel abonnement (attribuer un locataire à une édition avec devise/promo)",
        cancel: "Annuler définitivement l'abonnement",
        downgrade: "Rétrograder vers une édition inférieure (vérifie la OverflowPolicy)",
        export: "Exporter les abonnements en CSV, Excel ou PDF avec des filtres avancés",
        get: "Obtenir les détails de l'abonnement par ID",
        impact: "Prévisualiser l'impact de la rétrogradation avant exécution",
        list: "Lister tous les abonnements (paginé, filtrable par statut/type/locataire)",
        renew: "Renouveler un abonnement arrivant à expiration",
        resume: "Reprendre un abonnement suspendu",
        suspend: "Suspendre l'abonnement (bloquer l'accès du locataire)",
        tenantActive: "Obtenir l'abonnement actif pour un locataire spécifique",
        upgrade: "Mettre à niveau vers une édition supérieure",
      },
      exchangeRateIntro:
        "Tous les montants sont normalisés en USD via ExchangeRateToUsd pour des rapports MRR/ARR cohérents. Le champ TotalAmountUsd est calculé au moment de l'abonnement et stocké pour une précision historique — les fluctuations de taux de change ne modifient pas rétroactivement les enregistrements passés.",
      exchangeRateTitle: "Normalisation en USD",
      expiryIntro:
        "Lorsqu'un abonnement expire, le paramètre ExpiryBehavior détermine ce qui se passe ensuite :",
      expiryTitle: "Comportement d'Expiration",
      exportDaysLeftIntro:
        "Les rapports incluent une colonne 'Jours Restants' calculée avec un codage couleur conditionnel : rouge (≤7 jours), jaune (≤30 jours), vert (>30 jours). Cela permet d'identifier en un coup d'œil les abonnements nécessitant une attention de renouvellement.",
      exportDaysLeftTitle: "Jours Restants Avant Expiration",
      exportFilterCurrency: "Devise — afficher les montants dans la devise sélectionnée",
      exportFilterDate:
        "Plage de dates — filtrer par date de création de l'abonnement (7/30/90 derniers jours, dernière année ou plage personnalisée)",
      exportFilterEdition: "Édition — filtrer par plan/édition spécifique",
      exportFilterExpiring:
        "Expire bientôt — trouver les abonnements expirant dans 5/7/14/30/60/90 jours",
      exportFiltersIntro:
        "Les rapports prennent en charge des filtres avancés pour des analyses ciblées :",
      exportFilterStatus: "Statut — Actif, Suspendu, Annulé, Expiré",
      exportFiltersTitle: "Filtres d'Export",
      exportFormatCsv: "CSV — léger, importable dans tout tableur ou outil BI",
      exportFormatExcel:
        "XLSX — classeur Excel professionnel avec en-têtes stylisés, feuille de métadonnées de filtre, mise en forme conditionnelle et colonnes à taille automatique (ClosedXML)",
      exportFormatPdf:
        "PDF — document prêt à imprimer avec page de couverture associée à la marque, résumé statistique et tableaux de données paginés (QuestPDF)",
      exportFormatsTitle: "Détails des Formats d'Export",
      exportIntro:
        "Le système d'export des abonnements génère des rapports complets aux formats CSV, Excel (XLSX) et PDF. Chaque rapport comprend une page de couverture avec les métadonnées de filtrage, des tableaux de données colorés et des résumés statistiques.",
      exportTitle: "Export et Reporting Avancés",
      impactIntro:
        "Avant de modifier l'édition d'un locataire, utilisez l'endpoint d'Impact de Rétrogradation pour prévisualiser quelles ressources seraient en dépassement. La réponse liste chaque fonctionnalité qui dépasserait les limites de la nouvelle édition, ainsi que l'utilisation actuelle par rapport à la nouvelle limite.",
      impactTitle: "Analyse d'Impact de la Rétrogradation",
      intro:
        "Les abonnements lient les locataires aux éditions (plans). Chaque locataire a un abonnement de base qui détermine son édition, et éventuellement des abonnements complémentaires pour des capacités supplémentaires. Le système d'abonnement gère l'ensemble du cycle de vie, de l'attribution au renouvellement, en passant par la rétrogradation, la suspension et l'annulation — avec une tarification multi-devises intégrée et un suivi des remises promotionnelles.",
      lifecycleIntro:
        "Les abonnements passent par une série de statuts au cours de leur cycle de vie :",
      lifecycleTitle: "Cycle de vie des Statuts",
      operationsIntro:
        "Le module d'abonnement prend en charge un ensemble complet d'opérations de cycle de vie. Chaque opération fait passer l'abonnement à un nouvel état avec un suivi d'audit complet.",
      operationsTitle: "Opérations sur les Abonnements",
      pricingIntro:
        "Chaque abonnement porte des métadonnées de tarification complètes : Devise (code ISO), MontantDeBase, MontantAjustement, MontantTotal, TauxDeChangeEnUsd et MontantTotalUsd. Cela permet un suivi précis des revenus à travers 9+ devises prises en charge (USD, EUR, GBP, SAR, AED, EGP, TRY, INR, et plus).",
      pricingTitle: "Tarification Multi-Devises",
      promoExpiryIntro:
        "Lorsqu'une promotion avec DurationDays > 0 est appliquée, le système calcule un horodatage PromotionExpiresAt. À chaque renouvellement, le gestionnaire vérifie si UtcNow > PromotionExpiresAt — si la promotion a expiré, la remise est supprimée et NON reportée sur la nouvelle ligne d'abonnement.",
      promoExpiryTitle: "Suivi d'Expiration des Promotions (A1)",
      promotionsIntro:
        "Les abonnements prennent en charge les codes promo via le champ AppliedPromoCode. Lorsqu'une promotion valide est appliquée, un pourcentage PromotionDiscount est enregistré et le MontantAjustement reflète la remise appliquée au MontantDeBase. Les promotions sont suivies par abonnement pour l'audit et l'analyse.",
      promotionsTitle: "Remises Promotionnelles",
      renewalAuditIntro:
        "Chaque cycle de facturation produit sa propre ligne immuable en base de données avec une tarification figée au moment du renouvellement. Cela permet des rapports financiers précis : tendances MRR, analyse du taux d'attrition par période et suivi des remboursements par cycle.",
      renewalAuditTitle: "Piste d'Audit des Revenus",
      renewalIntro:
        "Les renouvellements créent une NOUVELLE ligne TenantSubscription au lieu d'écraser l'enregistrement existant (modèle Stripe). L'ancien abonnement est marqué Expiré (IsActive=false), tandis qu'une nouvelle ligne est créée avec un nouvel Id, StartDate=UtcNow, une tarification recalculée et les détails promotionnels reportés.",
      renewalTitle: "Renouvellement — Modèle Nouvelle Ligne (B2)",
      title: "Abonnements",
      trialIntro:
        "Les abonnements d'essai ont une TrialEndDate (Date de fin d'essai). Lorsqu'un essai est mis à niveau vers un plan payant, IsTrialConverted est défini sur true et l'abonnement passe au nouveau type. Si l'essai expire sans conversion, ExpiryBehavior détermine ce qui se passe ensuite.",
      trialTitle: "Conversion d'Essai",
      typesIntro:
        "Chaque abonnement a un type qui détermine son cycle de facturation et son comportement :",
      typesTitle: "Types d'Abonnements",
      upgradeIntro:
        "Les locataires peuvent passer d'une édition à l'autre. Les mises à niveau s'appliquent immédiatement et les fonctionnalités de la nouvelle édition prennent effet sur-le-champ. Les rétrogradations vérifient d'abord la OverflowPolicy pour gérer les ressources qui dépassent les nouvelles limites.",
      upgradeTitle: "Mise à niveau (Upgrade) & Rétrogradation (Downgrade)",
      validationIntro:
        "Les 8 commandes d'abonnement disposent de validateurs FluentValidation dédiés. Les validateurs utilisent ILocalizer pour des messages d'erreur localisés (EN + AR). Règles métier : pas de renouvellement en essai, montants de remboursement positifs, limites de longueur de texte.",
      validationTitle: "Validation des Entrées (G1)",
    },
  },
};

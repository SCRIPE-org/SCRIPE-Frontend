export const fr = {
  commercial: {
    marketplace: {
      financials: {
        description:
          "Monétisez les intégrations tierces avec des modèles de tarification flexibles.",
        intro:
          "La place de marché monétise les applications grâce à des commissions, des tarifs flexibles et des virements automatisés.",
        revenueIntro:
          "Sélectionnez les conditions commerciales qui correspondent le mieux à votre stratégie.",
        revenueTitle: "Modèles de Revenus",
        revOneItem1: "Configurez une commission en pourcentage sur toutes les fiches payantes.",
        revOneItem2: "Appliquez des frais fixes par transaction d'achat.",
        revOneItem3: "Collectez les commissions automatiquement lors du paiement du client.",
        revOneTitle: "Division des Commissions",
        revTwoItem1:
          "Prend en charge les applications gratuites, les abonnements mensuels ou le paiement à l'usage.",
        revTwoItem2: "Prend en charge la facturation multi-devises de manière native.",
        revTwoItem3: "Sessions de paiement entièrement gérées et facturation automatique.",
        revTwoTitle: "Flexibilité des Tarifs",
        splitIntro:
          "Avec Stripe Connect, les revenus sont divisés instantanément. La commission de la plateforme va sur votre compte et le solde restant au développeur, sans comptabilité manuelle.",
        splitTitle: "Paiements Divisés",
        title: "Finances et Monétisation",
      },
      overview: {
        description: "Développez l'écosystème de votre plateforme avec une boutique intégrée.",
        intro:
          "La Place de Marché SCRIPE vous permet de lancer une boutique d'extensions intégrée. Les clients peuvent découvrir, installer et acheter des intégrations tierces.",
        title: "Place de Marché d'Apps",
        val1: "Expansion de l'Écosystème",
        val1Desc:
          "Permettez à des tiers de créer des intégrations, augmentant la valeur de votre plateforme.",
        val2: "Nouvelle Source de Revenus",
        val2Desc:
          "Monétisez la plateforme en prélevant des commissions sur les applications payantes.",
        val3: "Rétention des Clients",
        val3Desc:
          "Plus grande fidélité des clients en intégrant des outils clés dans leurs processus.",
        val4: "Inscription Automatisée",
        val4Desc:
          "L'inscription en libre-service des développeurs et les vérifications réduisent la charge administrative.",
        valueIntro:
          "Lancer une place de marché d'applications apporte des avantages commerciaux majeurs.",
        valueTitle: "Avantages Commerciaux Clés",
      },
    },
  },
  marketplace: {
    catalog: {
      apiCategories: "Liste les catégories actives pour le filtrage du catalogue",
      apiDetails:
        "Obtient les détails complets, les prix, les captures et les avis de l'application",
      apiInstall: "Initie l'installation de l'application et la mise à jour des droits",
      apiList: "Obtient le catalogue actif avec pagination, recherche et filtres",
      apiReviewCreate: "Ajoute une évaluation et un avis pour une application",
      apiReviewReply: "Permet aux développeurs de répondre aux avis",
      apiUninstall: "Initie la désinstallation et le nettoyage des dépendances",
      controllerIntro:
        "Les points de terminaison du catalogue sont gérés par AppCatalogController, AppCategoryController et AppReviewController.",
      controllerTitle: "Endpoints du Catalogue",
      description:
        "Recherche dans le catalogue d'applications, catégories, installation et évaluations des utilisateurs.",
      installationIntro:
        "L'installation de l'application suit une séquence de vérification en plusieurs étapes.",
      installationTitle: "Flux d'Installation",
      intro:
        "Le sous-système de catalogue affiche les listes actives. Il prend en charge le regroupement par catégories, la recherche textuelle, l'installation et les avis.",
      step1Content:
        "Le système vérifie les éditions d'abonnement du locataire pour confirmer si les intégrations personnalisées sont autorisées.",
      step1Title: "Filtre des Droits",
      step2Content:
        "Si l'application est payante, la licence est vérifiée ou l'utilisateur est redirigé vers le paiement avant activation.",
      step2Title: "Validation du Paiement",
      step3Content:
        "L'application est marquée comme active pour le locataire, déclenchant des webhooks pour configurer l'environnement.",
      step3Title: "Activation du Locataire",
      title: "Catalogue d'Apps",
    },
    financials: {
      apiEarnings: "Obtient le solde du développeur et l'historique des revenus",
      apiPayoutProcess: "Endpoint d'administration pour traiter les paiements par lots",
      apiPayoutRequest: "Demande un paiement manuel pour les revenus accumulés",
      apiPayouts: "Liste l'historique des transferts effectués",
      controllerIntro:
        "Les finances de la place de marché sont contrôlées par AppFinancialsController et des tâches en arrière-plan.",
      controllerTitle: "Endpoints Financiers",
      description: "Traitement des achats, calcul des soldes et transferts aux développeurs.",
      intro:
        "Le sous-système financier enregistre les achats, gère les soldes des développeurs et traite les paiements.",
      payoutIntro: "Le traitement des transferts liquide les soldes de manière sécurisée.",
      payoutTitle: "Flux de Traitement des Paiements",
      step1Content:
        "Lorsqu'un locataire achète une application, la transaction est enregistrée, la commission est séparée et le solde restant est crédité au développeur.",
      step1Title: "Enregistrement de Transaction",
      step2Content:
        "La tâche PayoutBatchJob rassemble les demandes de paiement approuvées et les regroupe pour liquidation.",
      step2Title: "Traitement par Lots",
      step3Content:
        "Les paiements sont traités via Stripe Connect, transférant les soldes sur le compte du développeur.",
      step3Title: "Transfert de Fonds",
      title: "Finances de la Place de Marché",
    },
    overview: {
      backendIntro:
        "La place de marché s'appuie sur un DbContext dédié et des entités spécifiques.",
      backendTitle: "Architecture du Backend",
      conn1: "Publie les applications approuvées",
      conn2: "Traite les paiements",
      conn3: "Évalue les applications",
      conn4: "Vérifie les quotas",
      cqrsCatalogQuery: "Obtient les listes du catalogue paginées et filtrées",
      cqrsDesc: "Description du processus",
      cqrsDetailsQuery: "Obtient les détails et les avis sur l'application",
      cqrsDevProfile: "Enregistre un profil de développeur avec les détails de l'entreprise",
      cqrsEarningsQuery: "Calcule les soldes impayés et l'historique du développeur",
      cqrsExample: "Requête AstraFlow",
      cqrsIntro: "Le module utilise des commandes et requêtes standard pour toutes les opérations.",
      cqrsPurchase: "Initie le paiement pour les intégrations payantes",
      cqrsReview: "Soumet une évaluation et un commentaire pour une application",
      cqrsSubmitListing: "Soumet une fiche d'application pour examen dans le bac à sable",
      cqrsTitle: "Commandes et Requêtes CQRS",
      cqrsType: "Type",
      descCatalog: "Gère les détails globaux des applications, les balises et les catégories.",
      descEnt: "Contrôle des Droits",
      descEntDesc:
        "Valide les limites de l'édition du locataire et les licences pendant l'installation.",
      descFinancials:
        "Calcule les commissions de la plateforme, les soldes des développeurs et les virements.",
      descReviews:
        "Gère les avis des utilisateurs, les rapports d'abus et les réponses des développeurs.",
      description:
        "Présentation de la place de marché des extensions et des applications de SCRIPE.",
      descSubmissions: "Gère les tests en bac à sable, les versions et les changements d'état.",
      featureCatalog: "Catalogue d'Apps",
      featureCatalogDesc:
        "Recherchez, parcourez et filtrez les intégrations répertoriées globalement.",
      featureFinancials: "Revenus et Paiements",
      featureFinancialsDesc:
        "Définition des prix, sessions de paiement et traitement des paiements par lots.",
      featureReviews: "Avis et Évaluations",
      featureReviewsDesc: "Commentaires des locataires, évaluations et réponses des développeurs.",
      featureSubmissions: "Soumissions d'Apps",
      featureSubmissionsDesc:
        "Inscription des développeurs, création de profils et cycle de vie des soumissions.",
      infoContent:
        "Bien que le catalogue d'applications soit partagé globalement, les installations, configurations et achats sont strictement isolés au niveau du locataire.",
      infoTitle: "Isolation des Locataires",
      intro:
        "Le module Place de marché permet aux locataires de découvrir, d'installer et d'acheter des intégrations et des extensions tierces. Il fournit également un portail pour les développeurs pour configurer le profil, soumettre des applications, les cycles de révision et le traitement des paiements.",
      sub1: "Fiches d'Apps et Catalogue",
      sub2: "Cycle de vie de la Soumission",
      sub3: "Compensation Financière",
      sub4: "Avis et Évaluations",
      subModulesIntro:
        "Le module Place de marché se compose de plusieurs sous-modules qui communiquent entre eux et avec le système de droits.",
      subModulesTitle: "Architecture des Sous-modules",
      title: "Présentation de la Place de Marché",
      whatIsIntro:
        "Le moteur de la place de marché gère le catalogue, l'inscription des développeurs, les avis et le traitement des paiements.",
      whatIsTitle: "Fonctionnalités Clés",
    },
    submissions: {
      apiApprove: "Endpoint d'administration pour approuver et publier l'application",
      apiCreateProfile: "Crée ou met à jour les informations du développeur",
      apiCreateSubmission: "Crée une nouvelle soumission d'application et télécharge des fichiers",
      apiListSubmissions: "Obtient l'historique des soumissions du développeur connecté",
      apiReject: "Endpoint d'administration pour rejeter l'application avec des commentaires",
      controllerIntro:
        "La gestion des développeurs et des soumissions est contrôlée par DeveloperProfileController et AppSubmissionController.",
      controllerTitle: "Endpoints de Soumission",
      description:
        "Configuration du profil du développeur, création de fiches et flux de révision.",
      intro:
        "Les développeurs externes peuvent s'inscrire, configurer des profils et soumettre des fiches d'applications pour révision.",
      step1Content:
        "Le développeur crée un profil, configure les informations de paiement et les environnements de test.",
      step1Title: "Inscription du Développeur",
      step2Content:
        "Le développeur définit le nom, la description, les prix, les captures et les informations de sécurité.",
      step2Title: "Création de la Fiche",
      step3Content:
        "Les administrateurs de SCRIPE testent l'intégration dans un bac à sable sécurisé pour valider la conformité.",
      step3Title: "Vérification en Sandbox",
      step4Content: "Après approbation, le système publie l'application dans le catalogue global.",
      step4Title: "Publication au Catalogue",
      title: "Soumissions d'Apps",
      workflowIntro: "Toutes les demandes passent par un pipeline de révision sécurisé.",
      workflowTitle: "Ciclo de vie de la Soumission",
    },
  },
};

/**
 * Docs page locale — FR
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const fr = {
  tutorials: {
    addModule: {
      title: "Ajouter un Module Frontend",
      description:
        "Guide étape par étape pour créer un nouveau module frontend suivant le modèle SOLID View/ViewModel.",
      intro:
        "Ce tutoriel vous accompagne dans la création d'un module complet en assurant une qualité conforme aux architectures de la plateforme.",
      prerequisitesTitle: "Prérequis",
      stepsTitle: "Guide Étape par Étape",
      step1Title: "1. Créer la Structure du Module",
      step1Desc:
        "Préparez les répertoires standards avec les couches Domaine, Données et Présentation.",
      step2Title: "2. Définir l'Entité de Domaine",
      step2Desc: "Créez un schéma Zod couplé avec le typage statique TypeScript de votre entité.",
      step3Title: "3. Créer le Référentiel (Repository)",
      step3Desc:
        "Implémentez la couche d'appel réseau et interceptez les données API via TanStack.",
      step4Title: "4. Configurer le Conteneur DI",
      step4Desc: "Enregistrez votre référentiel au sein de l'injection de dépendances React.",
      step5Title: "5. Construire le ViewModel",
      step5Desc:
        "Construisez le chef d'orchestre principal des opérations CRUD en appelant useCrudViewModel.",
      step6Title: "6. Créer la Vue (View)",
      step6Desc:
        "Construisez le composant visuel de pure interface utilisateur consommant le ViewModel (moins de 60 lignes de code).",
      step7Title: "7. Ajouter la Route et la Navigation",
      step7Desc:
        "Déclarez la page connectrice (page.tsx) de Next.js pour brancher le visuel à l'arborescence URL.",
      structureTitle: "Structure du Module",
      entityTitle: "Entité du Domaine",
      repoTitle: "Couche Référentiel",
      diTitle: "Conteneur DI",
      viewModelTitle: "Modèle de Vue (ViewModel)",
      viewTitle: "Composant de la Vue",
      routeTitle: "Routage et Navigation",
      checklist:
        "Avant la soumission du code (Pull Request), vérifiez la règle des 60 lignes et l'absence totale d'importations interdites inter-modules.",
    },
    addBackendModule: {
      title: "Ajouter un Module Backend",
      description:
        "Guide complet pour créer un module de microservice C# avec Clean Architecture et CQRS.",
      intro:
        "Ce guide expose comment déployer une API complète de la base de données au contrôleur REST public en respectant les standards de l'entreprise.",
      prerequisitesTitle: "Prérequis",
      stepsTitle: "Guide Étape par Étape",
      step1Title: "1. Créer la Structure du Projet",
      step1Desc: "Générez les bibliothèques de classes C# conformes aux couches du DDD.",
      step2Title: "2. Définir l'Entité de Domaine",
      step2Desc:
        "Héritez de la classe de base AuditableEntity et fixez les règles de validation du modèle.",
      step3Title: "3. Créer les Commandes (Commands)",
      step3Desc:
        "Prodscripeez les modèles de requête de mutation (Créer, Mettre à jour, Supprimer) et couvrez-les par FluentValidation.",
      step4Title: "4. Créer les Requêtes (Queries)",
      step4Desc:
        "Prodscripeez les modèles de lecture (GetById, GetPaged) avec mapping rapide et sécurisé DTO.",
      step5Title: "5. Implémenter le Référentiel",
      step5Desc:
        "Appuyez-vous sur les classes de base génériques de EF Core au sein de la couche infrastructure.",
      step6Title: "6. Enregistrement des Dépendances (DI)",
      step6Desc:
        "Ajoutez la signature dans l'extension du Module DI pour informer le serveur de son existence.",
      step7Title: "7. Ajouter le Contrôleur d'API",
      step7Desc:
        "Instanciez le contrôleur RESTful, décorez-le avec les exigences de permissions et documentez le Swagger XML.",
      step8Title: "8. Enregistrement du Déploiement",
      step8Desc:
        "Vérifiez que le YARP Gateway l'intègre, et générez la migration finale vers le DbContext.",
      structureTitle: "Architecture des Projets",
      entityTitle: "Entités Flexibles",
      commandTitle: "Silos de Commandes CQRS",
      diTitle: "Cblage des Injections",
      controllerTitle: "Sortie Contrôleur de l'API",
      registerTitle: "Branchement et Compilation",
      migrationNote:
        "Vérifiez méticuleusement que vous avez exécuté 'scripe db add-migration AddYourEntity -m Inventory' et 'scripe db update -m Inventory' en local avant de pousser vos changements.",
    },
    ujGettingStarted: {
      title: "Configuration Développeur à l'Intégration Entreprise",
      description:
        "Guide complet depuis l'utilisation de SCRIPE CLI et des outils dev jusqu'à la configuration du premier tenant et de la marque.",
      intro:
        "Bienvenue dans l'aventure SCRIPE du développement à la production. Ce tutoriel détaille la configuration locale, l'exploration OpenAPI et l'initialisation de votre premier tenant.",
      infoTitle: "Stack Développeur Entreprise",
      infoContent:
        "Tous les services SCRIPE intègrent nativement le multi-tenant strict, l'autorisation zero-trust et l'audit immuable.",
      step1Title: "Étape 1 : CLI Développeur & Lancement Local",
      step1Desc:
        "Initialisez l'infrastructure locale avec Docker, injectez les données de test et démarrez les services frontend et backend.",
      step2Title: "Étape 2 : Swagger, API Playground & Outils CLI",
      step2Desc:
        "Exploitez les outils de développement : documentation Swagger, schémas OpenAPI et sondes de santé.",
      toolCli: "CLI Développeur",
      toolCliDesc:
        "Outil en ligne de commande pour les migrations, le seeding et l'inspection des tenants.",
      toolSwagger: "Swagger UI",
      toolSwaggerDesc:
        "Documentation interactive OpenAPI 3.0 pour l'ensemble des points d'accès REST.",
      toolHealth: "Sondes de Santé",
      toolHealthDesc:
        "Vérifications approfondies de disponibilité pour PostgreSQL, Redis et RabbitMQ.",
      step3Title: "Étape 3 : Première Connexion Super-Admin & MFA",
      step3Desc:
        "Connectez-vous avec les identifiants par défaut et configurez l'authentification multifacteur obligatoire.",
      mfaNoticeTitle: "Exigence de Sécurité",
      mfaNoticeContent:
        "Les comptes super-administrateur requièrent impérativement un enregistrement TOTP avant d'accéder aux paramètres du tenant.",
      stepEditionsTitle:
        "Prérequis : Créer les Éditions Commerciales et la Matrice de Fonctionnalités",
      stepEditionsDesc:
        "Avant d'allouer un locataire, le module Entitlements requiert au moins une définition d'Édition. Une Édition établit les fonctionnalités contractuelles, les limites de quotas et la tarification. Un locataire ne peut exister sans rattachement à une Édition.",
      step4Title: "Étape 4 : Déploiement de l'Organisation & du Tenant",
      step4Desc:
        "Créez votre tenant racine, configurez les slugs d'URL, les domaines personnalisés et les frontières d'isolation.",
      step5Title: "Étape 5 : Thèmes, Marque du Portail & Créateur de Login",
      step5Desc:
        "Définissez les logos d'entreprise, les palettes de couleurs et concevez des interfaces de connexion sur mesure.",

      stepOrgCoreTitle: "Étape 5 : Mise en Place de la Hiérarchie Organisationnelle à 5 Niveaux",
      stepOrgCoreDesc:
        "Structurez la gouvernance opérationnelle du locataire en Organisation, Unités Commerciales, Départements, Centres de Coûts et Équipes via le module Organization Core.",
      step6Title: "Étape 6: Personnalisation Graphique et Studio de Connexion",
      step6Desc:
        "Appliquez les logos de l'entreprise, les palettes de couleurs et publiez des mises en page de connexion personnalisées grâce au générateur Studio.",
    },
    ujVenueBooking: {
      title: "Hiérarchie des Complexes & Réservations Parallèles",
      description:
        "Parcours complet de configuration des infrastructures sportives, ressources réservables, plannings et verrous 2-phases.",
      intro:
        "Apprenez à structurer des complexes multisites, gérer les ressources réservables, définir les plages de maintenance et traiter les réservations concurrentes.",
      infoTitle: "Contrôle de Concurrence",
      infoContent:
        "Le moteur de réservation en 2 phases de SCRIPE prévient les doubles réservations grâce aux verrous mutex distribués sous Redis.",
      step1Title: "Étape 1 : Structuration des Complexes Multisites",
      step1Desc:
        "Définissez les sites géographiques, bâtiments et zones sportives avec coordonnées GPS et équipements.",
      step2Title: "Étape 2 : Création des Ressources Réservables",
      step2Desc:
        "Configurez terrains, courts et matériels comme actifs atomiques ou composites avec limites de capacité.",
      step3Title: "Étape 3 : Horaires d'Ouverture & Fermetures",
      step3Desc:
        "Paramétrez les horaires hebdomadaires récurrents, jours fériés et créneaux de maintenance.",
      step4Title: "Étape 4 : Moteur de Verrouillage Concurrentiel en 2 Phases",
      step4Desc:
        "Posez une option de réservation atomique de 15 minutes durant le paiement avec expiration TTL automatique.",
      step5Title: "Étape 5 : Planning Opérationnel & Vue Réservation 360",
      step5Desc:
        "Pilotez le tableau de bord de répartition, suivez les cycles de vie des réservations et traitez les modifications.",
    },
    ujPricingFinance: {
      title: "Tarification Dynamique & Comptabilité en Partie Double",
      description:
        "Guide pour configurer grilles tarifaires, suppléments d'heures de pointe, devis cryptographiques et règlements du grand livre.",
      intro:
        "Reliez votre catalogue aux algorithmes de tarification dynamique, générez des devis infalsifiables et équilibrez vos comptes.",
      infoTitle: "Intégrité Financière",
      infoContent:
        "L'équilibre invariable débit-crédit garantit une conformité d'audit totale sur toutes les écritures comptables.",
      step1Title: "Étape 1 : Grilles Tarifaires & Livres Multi-Devises",
      step1Desc:
        "Définissez les tarifs horaires de base, devises régionales et paliers pour vos espaces et prestations.",
      step2Title: "Étape 2 : Règles Dynamiques & Heures Pleines",
      step2Desc:
        "Appliquez des majorations ou remises conditionnelles selon l'heure, le statut client et l'anticipation.",
      step3Title: "Étape 3 : Devis Cryptographiques & Paiement",
      step3Desc:
        "Générez des devis scellés par signature HMAC-SHA256 protégeant les tarifs contre toute falsification pendant l'achat.",
      step4Title: "Étape 4 : Grand Livre & Plan Comptable",
      step4Desc:
        "Enregistrez les débits et crédits dans des comptes généraux ségrégués avec contrôle d'équilibre automatique.",
      step5Title: "Étape 5 : Facturation, Encaissements & Reversements",
      step5Desc:
        "Émettez des factures fiscales certifiées, encaissez les paiements et procédez au partage de revenus automatisé.",
    },
    ujWorkforceCrm: {
      title: "Gestion du Personnel & Fiche Client 360",
      description:
        "Guide pour administrer compétences du personnel, plannings de vacations, graphes relationnels et déduplication.",
      intro:
        "Optimisez l'allocation de vos ressources humaines et la relation client à travers toutes les filiales de votre réseau.",
      infoTitle: "Identité Polymorphe",
      infoContent:
        "L'architecture polymorphe permet à une entité d'agir simultanément comme client, coach sportif ou contact d'entreprise.",
      step1Title: "Étape 1 : Répertoire du Personnel & Compétences",
      step1Desc:
        "Intégrez vos collaborateurs, suivez leurs certifications, rôles et diplômes d'encadrement.",
      step2Title: "Étape 2 : Plannings de Vacations & Disponibilités",
      step2Desc:
        "Créez des modèles de rotation, gérez les absences et évitez les dépassements de temps de travail.",
      step3Title: "Étape 3 : Fiche Client 360 & Tiers Polymorphes",
      step3Desc:
        "Rassemblez fiches personnelles, comptes d'entreprises, échanges et historiques de réservations dans une vue unifiée.",
      step4Title: "Étape 4 : Graphe Relationnel & Comptes B2B",
      step4Desc:
        "Modélisez les liens familiaux, tuteurs légaux et rattachements d'entreprises partenaires.",
      step5Title: "Étape 5 : Déduplication Automatisée & Fusion",
      step5Desc:
        "Identifiez les doublons par correspondance phonétique et fusionnez les dossiers en toute sécurité sans perte de données.",
    },
    ujCustomFieldsPlugins: {
      title: "Étendre SCRIPE : Champs Personnalisés & Plugins",
      description:
        "Extension des schémas d'entités avec des champs EAV et installation d'extensions isolées du marketplace.",
      intro:
        "Personnalisez la plateforme sans modifier le code source grâce au moteur de champs EAV et aux extensions certifiées.",
      infoTitle: "Extensibilité Sans Interruption",
      infoContent:
        "Les modifications de champs s'appliquent instantanément sur l'UI et les API sans migration de base de données.",
      step1Title: "Étape 1 : Groupes de Champs & Types de Données",
      step1Desc:
        "Associez des champs texte, numériques, dates ou sélecteurs aux réservations et fiches clients.",
      step2Title: "Étape 2 : Validation & Chiffrement AES-256",
      step2Desc:
        "Configurez expressions régulières, champs obligatoires et chiffrez les données sensibles au niveau champ.",
      step3Title: "Étape 3 : Découverte & Installation de Plugins",
      step3Desc:
        "Parcourez le catalogue d'extensions, vérifiez les autorisations de sécurité et installez en un clic.",
      step4Title: "Étape 4 : Intégration Webhooks & Événements",
      step4Desc:
        "Interconnectez vos applications externes en souscrivant aux événements temps réel vérifiés par signature HMAC.",
    },
    ujComplianceGovernance: {
      title: "Gouvernance d'Entreprise, Conformité & BI",
      description:
        "Alertes de sécurité temps réel, journaux d'audit immuables, droits RGPD et tableaux de bord analytiques.",
      intro:
        "Assurez la conformité réglementaire internationale, surveillez les accès au système et pilotez vos indicateurs clés.",
      infoTitle: "Conformité Réglementaire",
      infoContent:
        "Les purges automatisées et pistes d'audit cryptographiques garantissent votre préparation aux audits SOC2, ISO 27001 et RGPD.",
      step1Title: "Étape 1 : Surveillance Sécurité & Alertes Temps Réel",
      step1Desc:
        "Paramétrez des notifications lors de connexions suspectes ou d'élévations de privilèges imprévues.",
      step2Title: "Étape 2 : Pistes d'Audit Infalsifiables",
      step2Desc:
        "Consultez les journaux d'activité immuables consignant identifiant utilisateur, adresse IP, horodatage et diffs.",
      step3Title: "Étape 3 : Traitement des Demandes RGPD (DSR)",
      step3Desc:
        "Automatisez les exports de données personnelles, révocations de consentement et suppressions pour droit à l'oubli.",
      step4Title: "Étape 4 : Tableaux de Bord Décisionnels & Métriques",
      step4Desc:
        "Suivez en direct les taux d'occupation des terrains, la vélocité financière et l'efficacité opérationnelle des équipes.",
    },
  },
};

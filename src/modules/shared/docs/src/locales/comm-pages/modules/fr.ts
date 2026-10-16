// FILE-EXCEPTION: file length
/**
 * Docs commercial page locale — FR
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const fr = {
  commercial: {
    moduleCatalog: {
      tblCoreR7C1: "Droits",
      tblCoreR7C2:
        "Contrôle d'accès aux fonctionnalités basé sur les éditions et gestion des plans",
      tblCoreR7C3:
        "Fonctionnalités, éditions, abonnements, surcharges, application des quotas, déploiements versionnés, portée revendeur",
      businessContent:
        "SCRIPE n'est pas une coquille vide ; c'est un écosystème d'entreprise fonctionnel dès le premier jour. Utilisez nos modules métier existants — tels que la gestion des utilisateurs, les journaux d'audit et les notifications — comme points de départ immédiats, ou clonez-les pour construire rapidement des fonctionnalités propriétaires.",
      businessTitle: "Logique Métier Accélérée",
      commTitle: "Communication & Webhooks",
      coreContent:
        "La couche Fondation fournit les éléments absolument non négociables : le fournisseur d'identité, les stratégies de résolution multi-tenant, les abstractions de contexte EF Core et le répartiteur centralisé SCRIPE mediator. C'est le socle solide sur lequel repose l'ensemble de votre application.",
      coreTitle: "Le Cœur de Fondation",
      crmModule: "Module CRM Headless",
      crmModuleDesc:
        "Gérez les hiérarchies organisationnelles, les relations clients et les attributs personnalisés avec une architecture CRM entièrement pilotée par API.",
      customModule: "Module d'Intégration Propriétaire",
      customModuleDesc:
        "Une sandbox immaculée utilisant exactement les mêmes frontières de la Clean Architecture pour héberger votre logique industrielle unique.",
      dataTitle: "Données & Audit",
      description:
        "Un répertoire complet des contextes délimités (Bounded Contexts) d'entreprise pré-construits et prêts pour la production inclus dans la plateforme SCRIPE.",
      financeModule: "Moteur de Facturation",
      financeModuleDesc:
        "Générez des factures PDF, gérez les localités fiscales et intégrez Stripe ou des passerelles de paiement personnalisées.",
      hrModule: "Gestion des Identités et des Accès (IAM)",
      hrModuleDesc:
        "Contrôlez les autorisations granulaires basées sur les rôles, les durées de vie des JWT et les synchronisations d'annuaires.",
      independenceContent:
        "Chaque module du catalogue est strictement isolé. Le module de Notification ne partage aucun état avec le module de Gestion des Utilisateurs. Ils communiquent purement par des événements asynchrones, garantissant qu'une défaillance catastrophique dans un domaine ne se répercute jamais sur un autre.",
      independenceTitle: "Isolation Cryptographique des Modules",
      intro:
        "SCRIPE est livré avec une bibliothèque massive de contextes délimités testés et de qualité professionnelle. Dès le premier jour, vous possédez la maturité opérationnelle d'une application SaaS vieille de 5 ans.",
      inventoryModule: "Module de Suivi des Actifs",
      inventoryModuleDesc:
        "Cartographiez des inventaires hiérarchiques complexes et suivez les changements d'état grce à des événements de domaine strictement appliqués.",
      projectModule: "Module de Projets & Workflows",
      projectModuleDesc:
        "Gérez des machines à états complexes et des flux de travail d'approbation organisationnelle à plusieurs étapes.",
      title: "Catalogue de Modules d'Entreprise",
      tblCoreHeader1: "Module",
      tblCoreHeader2: "Description",
      tblCoreHeader3: "Capacités Clés",
      tblCoreR1C1: "Identité & Authentification",
      tblCoreR1C2: "Authentification complète et gestion des utilisateurs",
      tblCoreR1C3: "JWT, 2FA, gestion des sessions, suivi des appareils, login social",
      tblCoreR2C1: "Multi-Tenant",
      tblCoreR2C2: "Isolation des locataires et organisation hiérarchique",
      tblCoreR2C3:
        "Isolation des lignes, locataires parents/enfants, paramètres par locataire, marque blanche",
      tblCoreR3C1: "Rôles & Permissions",
      tblCoreR3C2: "Contrôle d'accès à grain fin",
      tblCoreR3C3:
        "RBAC, restrictions au niveau des champs, catégories de permissions, clonage de rôles",
      tblCoreR4C1: "Système d'Audit",
      tblCoreR4C2: "Suivi complet des activités",
      tblCoreR4C3:
        "Pipeline à 4 sources : API, changements d'entités, événements de sécurité, opérations métier",
      tblCoreR5C1: "Système de Menus",
      tblCoreR5C2: "Gestion de navigation dynamique",
      tblCoreR5C3: "Arbre auto-référencé, surcharges par locataire, visibilité basée sur les rôles",
      tblCoreR6C1: "Groupes d'Utilisateurs",
      tblCoreR6C2: "Attribution par lots de rôles et de restrictions",
      tblCoreR6C3:
        "RBAC basé sur les groupes, restrictions de champs, gestion des membres, groupes limités au locataire",
      tblCommHeader1: "Module",
      tblCommHeader2: "Description",
      tblCommHeader3: "Capacités Clés",
      tblCommR1C1: "Notifications",
      tblCommR1C2: "Notifications push en temps réel",
      tblCommR1C3:
        "SignalR WebSockets, adhésion automatique par locataire, marquer lu/non lu, UI de cloche",
      tblCommR2C1: "Système d'E-mail",
      tblCommR2C2: "Pipeline d'e-mails transactionnels",
      tblCommR2C3:
        "Envoi basé sur file d'attente, modèles Scriban, réessai avec délai, SMTP/SendGrid",
      tblCommR3C1: "Webhooks",
      tblCommR3C2: "Intégrations pilotées par les événements",
      tblCommR3C3:
        "Signé HMAC-SHA256, réessai exponentiel, gestion des abonnements, catalogue d'événements",
      tblCommR4C1: "Modèles de Messages",
      tblCommR4C2: "Rendu de messages bilingues",
      tblCommR4C3: "Syntaxe Scriban, aperçu des variables, 6 modèles intégrés, entité bilingue",
      tblDataHeader1: "Module",
      tblDataHeader2: "Description",
      tblDataHeader3: "Capacités Clés",
      tblDataR1C1: "Téléchargement de Fichiers",
      tblDataR1C2: "Gestion sécurisée des fichiers",
      tblDataR1C3:
        "Pipeline de traitement d'images, prêt pour analyse antivirus, stockage par locataire, 4 backends",
      tblDataR2C1: "Téléchargement & Exportation",
      tblDataR2C2: "Exportation de données et livraison de fichiers",
      tblDataR2C3:
        "Téléchargements reprenables (Range), mise en cache ETag, basé sur session, prévention du Path Traversal",
      tblDataR3C1: "Corbeille",
      tblDataR3C2: "Gestion de suppression douce (Soft-delete)",
      tblDataR3C3:
        "Restauration avec dépendances, purge planifiée, restauration en cascade, politiques par entité",
      tblDataR4C1: "Gestion des Utilisateurs",
      tblDataR4C2: "Opérations administratives sur les utilisateurs",
      tblDataR4C3:
        "27 points de terminaison, opérations en masse (bulk), opérations d'entreprise, règles d'admin protégées",
      tblAnalyticsHeader1: "Module",
      tblAnalyticsHeader2: "Description",
      tblAnalyticsHeader3: "Capacités Clés",
      tblAnalyticsR1C1: "Analytique des Revenus",
      tblAnalyticsR1C2: "Tableau de bord d'intelligence des revenus de niveau BI",
      tblAnalyticsR1C3:
        "Suivi MRR/ARR, analyse de cohortes, modélisation LTV, prévision des revenus, scoring de santé, rapports PDF",
      analyticsTitle: "Intelligence des Revenus",
      analyticsContent:
        "Le moteur d'analytique des revenus transforme les données brutes d'abonnement en intelligence décisionnelle actionnable. Avec 7 onglets spécialisés, des captures nocturnes automatisées et des prévisions prédictives, les opérateurs obtiennent une visibilité de niveau CFO sans outils BI externes. Le scoring de santé des locataires identifie proactivement les risques d'attrition avant qu'ils ne se matérialisent.",
      dbAgnosticTip:
        "La couche d'abstraction de données de SCRIPE prend en charge PostgreSQL, SQL Server et SQLite sans modification du code applicatif.",
    },
    complianceOverview: {
      title: "Conformité et Protection des Données",
      description:
        "Automatisation native pour RGPD, CCPA et PDPA — Protégez les droits de données de vos clients sans recruter une équipe d'ingénieurs juridiques.",
      intro:
        "Le module de Conformité de SCRIPE offre à chaque locataire de votre plateforme une protection des données d'entreprise dès le premier jour, sans écrire une seule ligne de code.",
      valueTitle: "Pourquoi la conformité est essentielle",
      valueIntro:
        "Les réglementations sur la vie privée imposent des sanctions sévères : jusqu'à 20 millions d'euros ou 4 % du chiffre d'affaires mondial annuel selon le RGPD.",
      capabilitiesTitle: "Capacités Principales",
      cap1: "Gestion des DSR — Flux automatisés pour l'exportation, la suppression, la rectification et la limitation des données avec suivi strict des SLA.",
      cap2: "Piste d'Audit des Consentements — Historique immuable de chaque consentement ou retrait avec horodatage, adresse IP et version de politique.",
      cap3: "Politiques de Rétention — Application automatique des délais de conservation avec purge définitive ou anonymisation irréversible.",
      cap4: "Registre des Traitements — Inventaire des activités conforme à l'Article 30 du RGPD (RoPA) avec export immédiat.",
      cap5: "Rapports d'Audit — Génération asynchrone de bilans RGPD, statistiques DSR et registres de consentement.",
      targetTitle: "À qui cela s'adresse",
      target1:
        "Plateformes SaaS opérant dans l'UE et au Royaume-Uni nécessitant des outils RGPD intégrés.",
      target2: "Entreprises en Californie assujetties aux exigences du CCPA.",
      target3:
        "Organisations sportives, médicales et financières soumises à de strictes obligations légales d'archivage.",
      benefitsTitle: "Avantages de Conformité Entreprise",
      featureAutomatedDsrTitle: "Traitement Automatisé des Demandes DSR",
      featureAutomatedDsrDesc:
        "Réduisez le temps de traitement des requêtes RGPD de plusieurs semaines à quelques minutes grâce aux workflows automatisés.",
      featureConsentTitle: "Registre Inaltérable des Consentements",
      featureConsentDesc:
        "Conservez des preuves de consentement opposables et infalsifiables en cas de contrôle des autorités de protection des données.",
      featureRetentionTitle: "Application Automatique des Durées de Conservation",
      featureRetentionDesc:
        "Programmez l'archivage et la purge des données pour éliminer tout risque de conservation illicite.",
    },
    complianceGdpr: {
      title: "Conformité au RGPD",
      description:
        "Comment SCRIPE aide votre plateforme et vos locataires à honorer les exigences du RGPD à travers six domaines clés.",
      intro:
        "Le Règlement Général sur la Protection des Données (RGPD) s'applique à toute entité traitant des données de résidents européens. SCRIPE en automatise l'application.",
      articlesTitle: "Articles Fondamentaux Couverts",
      art12:
        "Articles 12–14 — Transparence, politiques d'information claires et traçabilité des accords.",
      art15:
        "Articles 15–22 — Prise en charge intégrale des huit droits des personnes concernées (DSR).",
      art25:
        "Article 25 — Protection des données dès la conception et par défaut dans toute l'architecture.",
      art30: "Article 30 — Registre automatisé des activités de traitement (RoPA).",
      art32:
        "Article 32 — Sécurité du traitement, chiffrement complet des données au repos et en transit.",
      mappingTitle: "Registre et Cartographie des Traitements RGPD",
      articleCol: "Article du RGPD / Exigence Légale",
      scripeFeatureCol: "Fonctionnalité Native SCRIPE",
      featureAccess:
        "Article 15 (Droit d'Accès): export en un clic d'archives complètes de données",
      featureErasure:
        "Article 17 (Droit à l'Effacement): suppression en cascade et anonymisation automatique",
      featureRopa:
        "Article 30 (Registre des Traitements): inventaire et génération du registre en direct",
    },
    complianceDsr: {
      title: "Droits des Personnes Concernées (DSR)",
      description:
        "Orchestration complète des demandes d'accès, d'effacement et de rectification conformément aux articles 15–22 du RGPD.",
      intro:
        "Les organisations disposent d'un délai légal de 30 jours pour répondre aux demandes DSR. SCRIPE automatise ce cycle pour éliminer les retards.",
      workflowTitle: "Cycle de Traitement des DSR",
      step1:
        "L'utilisateur soumet sa requête (exportation, suppression, rectification ou limitation).",
      step2: "Le système enregistre une fiche immuable à l'état 'En attente'.",
      step3: "Un délégué à la protection des données est affecté ; l'état passe à 'En cours'.",
      step4:
        "La demande est exécutée et classée formellement comme 'Finalisée' ou 'Refusée' avec motif légal.",
      slaTitle: "Contrôle des Délais et Respect des SLA",
      slaIntro:
        "Suivi précis de la fenêtre des 30 jours avec alertes proactives pour prévenir tout dépassement.",
      automationTitle: "Automatisation des Droits des Personnes (DSR)",
      automationIntro:
        "Exécution instantanée des droits d'accès, d'effacement et de portabilité sur l'ensemble des modules en un seul clic.",
    },
    complianceRoi: {
      title: "Rentabilité et ROI de la Conformité",
      description:
        "Économies directes, atténuation des risques juridiques et atout commercial grâce à l'automatisation de la conformité.",
      intro:
        "Avec SCRIPE, la conformité légale devient un levier de différenciation stratégique lors de la signature de contrats grands comptes.",
      savingsTitle: "Gains Financiers Mesurables",
      savings1:
        "Évitez les amendes réglementaires majeures grâce à une stricte exécution automatisée.",
      savings2:
        "Économisez plus de 200 heures d'ingénierie par an par rapport au développement de solutions DSR internes.",
      savings3:
        "Réduisez drastiquement vos dépenses de conseil juridique grâce à des rapports prêts pour audit.",
      competitiveTitle: "Avantages Concurrentiels",
      competitive1:
        "Concluez vos ventes entreprises plus vite en prouvant votre conformité dès la première démonstration.",
      competitive2:
        "Accélérez votre expansion internationale vers l'Europe, le Royaume-Uni et les États-Unis.",
      competitive3:
        "Instaurez une confiance solide auprès des sportifs, des familles et des usagers.",
      metricCol: "Domaine de Risque & Coût de Conformité",
      impactCol: "Impact Opérationnel de SCRIPE",
      metricManualDsr: "Traitement Manuel des Demandes DSR",
      impactManualDsr:
        "Réduction de 85 % de la charge de travail via l'automatisation de la découverte",
      metricFines: "Risque de Sanctions Pécuniaires Réglementaires",
      impactFines:
        "Risque quasi nul grâce aux contrôles RGPD intégrés et aux pistes d'audit immuables",
    },
    pluginsOverview: {
      title: "Plateforme d'Extensions et Écosystème",
      description:
        "Extensibilité de niveau entreprise : plugins en processus pour une vitesse optimale ou plugins en sandbox pour la place de marché.",
      intro:
        "Le système de plugins de SCRIPE offre une modularité totale sans jamais compromettre la sécurité ni la stabilité du cœur applicatif.",
      valueTitle: "Valeur Stratégique",
      featureExtTitle: "Évolutivité sans Limite",
      featureExtDesc:
        "Déployez de nouvelles fonctionnalités — passerelles CRM, assistants IA, tableaux de bord — sans modifier le code source de base.",
      featureSandboxTitle: "Isolation Sécurisée en Sandbox",
      featureSandboxDesc:
        "Les plugins Tier 2 fonctionnent dans un environnement isolé via une passerelle REST protégée, sans accès direct à la base de données.",
      featureMarketTitle: "Prêt pour Place de Marché",
      featureMarketDesc:
        "Catalogue intégré, gestion des installations/désinstallations et habilitations pour les éditeurs partenaires.",
      featureFastTitle: "Intégration Fluide",
      featureFastDesc:
        "Injectez facilement des éléments de menu, des écrans de configuration et des tâches d'arrière-plan grâce au SDK standardisé.",
      featureLogsTitle: "Journaux d'Exécution Détaillés",
      featureLogsDesc:
        "Traçabilité complète de chaque appel API avec latence, code statut HTTP et contexte locataire pour un dépannage rapide.",
      featureI18nTitle: "Multilingue et Support RTL",
      featureI18nDesc:
        "Transmission automatique de la langue, du sens d'écriture (LTR/RTL) et de la charte graphique à toutes les interfaces d'extension.",
      tiersTitle: "Comparaison Tier 1 vs Tier 2",
      tiersIntro:
        "Tier 1 pour les modules certifiés à haute performance ; Tier 2 pour les plugins tiers et communautaires.",
      tier1Title: "Tier 1 — Certifié et en Processus",
      tier1Point1:
        "Exécution dans le même processus — latence ultra-faible inférieure à 1 milliseconde",
      tier1Point2:
        "Accès complet à l'injection de dépendances, Entity Framework et événements de domaine",
      tier1Point3: "Intégration d'interface utilisateur via Module Federation",
      tier1Point4: "Implémente le contrat de cycle de vie IPluginStartup",
      tier2Title: "Tier 2 — Place de Marché en Sandbox",
      tier2Point1: "Parfaitement isolé — aucun accès aux secrets système de l'hôte",
      tier2Point2: "Limitation de débit (60 requêtes/minute par installation)",
      tier2Point3: "Intégration en iframe sécurisée avec SDK typé basé sur postMessage",
      tier2Point4: "Magasin de données clé-valeur isolé par locataire et installation",
      audienceTitle: "Bénéfices par Rôle",
      audienceIntro:
        "L'écosystème d'extensions génère une valeur immédiate pour l'ensemble des acteurs de la plateforme.",
      audRole: "Rôle",
      audBenefit: "Avantage Clé",
      audPlatform: "Opérateur de Plateforme",
      audPlatformBenefit:
        "Lancez de nouveaux services sans déployer le noyau et monétisez votre place de marché.",
      audTenant: "Administrateur Locataire",
      audTenantBenefit:
        "Activez des fonctionnalités sur mesure pour votre club ou enceinte en quelques clics.",
      audPartner: "Éditeurs Partenaires",
      audPartnerBenefit:
        "Distribuez et valorisez vos créations sur un écosystème robuste et pérenne.",
      audDeveloper: "Développeur Cœur",
      audDeveloperBenefit:
        "Gardez le socle technique propre en déléguant les spécificités à des contrats modulaires.",
      securityTitle: "Architecture de Sécurité",
      securityIntro:
        "Sécurité dès la conception : chiffrement des clés, validation des origines et étanchéité stricte des données locataires.",
      securityNoteTitle: "Protection par Défaut",
      securityNoteContent:
        "Les plugins ne touchent jamais aux données d'autres locataires ; les clés API sont enregistrées sous forme de condensats SHA-256.",
    },
    venueOperations: {
      title: "Gestion des Installations et Complexes Sportifs",
      description:
        "Optimisation de l'occupation des terrains et salles, garantie zéro double réservation via des verrous atomiques et gestion des plannings.",
      intro:
        "Transformez vos complexes sportifs et gymnases en sources de revenus automatisées grâce à la synchronisation en temps réel et à la réservation intelligente.",
      statConflicts: "Garantie Zéro Conflit",
      statUtilization: "Hausse du Taux d'Occupation",
      statHoldTtl: "Verrouillage Atomique de Créneau",
      statSync: "Synchronisation Multicanale Temps Réel",
      valueTitle: "Pourquoi les grands exploitants choisissent SCRIPE",
      featMultiFacility: "Topologie Multi-Installations",
      featMultiFacilityDesc:
        "Modélisez des infrastructures vastes avec terrains complets, demi-terrains, pistes et matériel depuis une vue unique.",
      featHoldEngine: "Moteur de Verrouillage Atomique",
      featHoldEngineDesc:
        "Un verrou temporaire de 15 minutes évite toute collision entre les réservations sur application mobile et au guichet d'accueil.",
      featDynamicSchedules: "Plannings d'Exploitation Intelligents",
      featDynamicSchedulesDesc:
        "Automatisez les horaires d'éclairage, les créneaux d'entretien et les jours fériés sans intervention manuelle.",
      featBlackouts: "Blocages Immédiats d'Urgence",
      featBlackoutsDesc:
        "Fermez instantanément un terrain en cas d'intempéries ou de tournoi avec avertissement automatique des utilisateurs impactés.",
      featMonetization: "Liaison Tarifaire Directe",
      featMonetizationDesc:
        "Connexion native au moteur de tarification pour appliquer des tarifs d'heures de pointe et facturer automatiquement.",
      featMobileReady: "Libre-Service pour Pratiquants",
      featMobileReadyDesc:
        "Les sportifs consultent les disponibilités, réservent et paient leur créneau sur mobile en moins de 30 secondes.",
      roiTitle: "Impact Économique Mesurable",
      tableHeaderMetric: "Indicateur d'Exploitation",
      tableHeaderTraditional: "Logiciels Obsolètes / Feuilles Excel",
      tableHeaderScripe: "Moteur d'Installations SCRIPE",
      metricBookingLatency: "Délai de Réservation en Ligne",
      tradBookingLatency:
        "Planification manuelle par téléphone/mail prenant 15 à 45 minutes par réservation",
      scripeBookingLatency:
        "Libre-service instantané en moins d'une seconde avec confirmation automatique",
      metricDoubleBookings: "Incidents de Double Réservation",
      tradDoubleBookings: "2 à 5 % des réservations mensuelles",
      scripeDoubleBookings: "0 % (Garantie de verrou atomique)",
      metricUnsoldSlots: "Taux d'Occupation en Heures Creuses",
      tradUnsoldSlots:
        "Forte vacance (35 à 50 % inoccupés) due à des tarifs fixes et un manque de visibilité",
      scripeUnsoldSlots:
        "Tarification dynamique et promotions automatisées réduisant la vacance sous 12 %",
      metricAdminLabor: "Charge Administrative des Équipes",
      tradAdminLabor:
        "Plus de 25 heures hebdomadaires passées sur les plannings, paiements et relances",
      scripeAdminLabor:
        "Moins de 3 heures par semaine: 90 % d'automatisation des factures et contrats",
      ctaTitle: "Prêt à optimiser la gestion de vos installations ?",
      ctaSubtitle:
        "Consultez nos forfaits d'abonnement ou explorez la documentation d'architecture technique.",
      ctaPrimary: "Découvrir les Tarifs",
      ctaSecondary: "Consulter la Documentation",
    },
    catalogPricing: {
      title: "Catalogue et Moteur de Tarification Dynamique",
      description:
        "Protection des marges, contrats d'entreprise automatisés et tarifs d'heures de pointe pour tous vos services et abonnements.",
      intro:
        "Transformez vos grilles tarifaires figées en moteurs de vente performants grâce aux barèmes versionnés et aux remises échelonnées.",
      statAuditability: "Instantanés de Prix Immuables",
      statQuotingSpeed: "Devis Calculés en Millisecondes",
      statCurrencies: "Prêt pour le Multi-Devises",
      statDiscounts: "Protection Automatique des Marges",
      valueTitle: "Avantages Commerciaux Stratégiques",
      featPriceBooks: "Barèmes de Prix Versionnés",
      featPriceBooksDesc:
        "Programmez vos évolutions de prix avec date d'effet, grilles saisonnières et déclinaisons par complexe.",
      featQuotation: "Devis Instantanés",
      featQuotationDesc:
        "Calcul immédiat des lignes, remises quantitatives, taxes et promotions avec délai d'expiration précis.",
      featDiscounts: "Règles de Remises Cumulables",
      featDiscountsDesc:
        "Créez des offres de réservation anticipée et des forfaits de fidélité avec garde-fous de marge minimale.",
      featAgreements: "Accords d'Entreprise B2B",
      featAgreementsDesc:
        "Appliquez automatiquement les tarifs conventionnés des comités d'entreprise et sponsors lors du règlement.",
      featTaxes: "Conformité Fiscale Rigoureuse",
      featTaxesDesc:
        "Application déterministe des taux de TVA territorialisés sur chaque ligne du devis.",
      featVersioning: "Instantanés Fiscaux Immuables",
      featVersioningDesc:
        "Un devis validé fige les prix ; les modifications ultérieures du catalogue ne modifient jamais les factures passées.",
      roiTitle: "Comparatif de Rentabilité Commerciale",
      tableHeaderMetric: "Critère Commercial",
      tableHeaderTraditional: "Calculs Manuels / Tableurs",
      tableHeaderScripe: "Moteur de Prix SCRIPE",
      metricTurnaround: "Délai d'Émission d'un Devis",
      tradTurnaround: "15 à 45 minutes de traitement",
      scripeTurnaround: "< 10 millisecondes en temps réel",
      metricMarginLeakage: "Pertes de Marges par Remises",
      tradMarginLeakage: "3 à 8 % de dérogations incontrôlées",
      scripeMarginLeakage: "0 % grâce aux règles système strictes",
      metricTaxCompliance: "Erreurs de Calcul de Taxes",
      tradTaxCompliance: "Anomalies récurrentes lors des audits",
      scripeTaxCompliance: "100 % de conformité déterministe",
      ctaTitle: "Boostez Votre Croissance Commerciale",
      ctaSubtitle:
        "Découvrez comment les grilles tarifaires dynamiques augmentent votre marge nette.",
      ctaPrimary: "Explorer les Forfaits",
      ctaSecondary: "Spécifications Techniques",
    },
    financeSettlement: {
      title: "Finances et Rapprochement Multi-Canaux",
      description:
        "Accélérez votre trésorerie, éliminez les écarts manuels et profitez d'une comptabilité en partie double certifiable pour commissaires aux comptes.",
      intro:
        "En finissez avec les casse-têtes de fin de mois : SCRIPE Finance assure la facturation automatisée, l'encaissement tous canaux et l'affectation FIFO des règlements.",
      statAuditability: "Piste d'Audit Comptable Intégrale",
      statUnreconciled: "Écritures Non Rapprochées",
      statAllocation: "Lettrage Automatisé des Règlements",
      statChannels: "Unification Complète des Encaissements",
      valueTitle: "Gouvernance Financière d'Entreprise",
      featInvoices: "Facturation Automatisée",
      featInvoicesDesc:
        "Génération de factures PDF bilingues pour les locations de terrains, cotisations annuelles et articles de boutique.",
      featPayments: "Encaissements Multi-Canaux",
      featPaymentsDesc:
        "Enregistrez les flux issus des terminaux TPV de caisse, des passerelles de paiement en ligne, des virements et des espèces.",
      featAllocation: "Lettrage Atomique des Paiements",
      featAllocationDesc:
        "Dissociez règlements et factures, puis affectez les fonds avec exactitude au centime près selon la règle FIFO ou manuellement.",
      featRefunds: "Remboursements Sécurisés et Tracés",
      featRefundsDesc:
        "Reversions partielles ou totales associées à l'opération de paiement d'origine pour éviter tout double remboursement.",
      featAdjustments: "Avoirs et Régularisations",
      featAdjustmentsDesc:
        "Émettez des avoirs commerciaux et traitez les litiges en exigeant un motif formel d'audit.",
      featLedgerSync: "Export pour Logiciels Comptables",
      featLedgerSyncDesc:
        "Générez des écritures structurées prêtes à être intégrées dans Sage, SAP, QuickBooks, Xero et Cegid.",
      roiTitle: "Indicateurs d'Efficacité Comptable",
      tableHeaderMetric: "Processus Financier",
      tableHeaderTraditional: "Comptabilité Manuelle / Outils Isolés",
      tableHeaderScripe: "Moteur Financier SCRIPE",
      metricDaysSalesOutstanding: "Délai Moyen de Recouvrement (DSO)",
      tradDso: "45 à 60 jours en moyenne",
      scripeDso: "14 jours grâce aux relances automatiques",
      metricReconciliationTime: "Durée de Clôture Mensuelle",
      tradReconTime: "4 à 6 jours de rapprochement fastidieux",
      scripeReconTime: "< 2 heures de manière automatisée",
      metricManualErrors: "Écarts de Caisse et de Rapprochement",
      tradErrors: "3 à 7 % d'anomalies entre canaux",
      scripeErrors: "0 % grâce à la partie double stricte",
      ctaTitle: "Pilotez Vos Finances Sportives en Toute Sérénité",
      ctaSubtitle:
        "Développez votre activité avec une rigueur comptable irréprochable et zéro perte de chiffre d'affaires.",
      ctaPrimary: "Découvrir le Module Finance",
      ctaSecondary: "Détails Techniques",
    },
    workforceHrms: {
      title: "Gestion du Personnel et Conformité des Entraîneurs",
      description:
        "Vérification automatisée des diplômes d'État, suppression des risques juridiques et gestion fluide des plannings sur tous vos sites.",
      intro:
        "Protégez vos pratiquants et garantissez la qualité de l'encadrement en suivant en continu les diplômes d'animation, brevets de secourisme et disponibilités.",
      statCompliance: "Séances Conformes aux Normes",
      statExpiredCerts: "Incidents pour Diplômes Périmés",
      statRosterSync: "Synchronisation Mobile des Plannings",
      statSchedulingLabor: "Temps de Planification des Équipes",
      valueTitle: "Pourquoi les directeurs sportifs font confiance à SCRIPE HRMS",
      featStaffProfiles: "Dossiers Complets des Éducateurs",
      featStaffProfilesDesc:
        "Centralisation des diplômes sportifs, contrats de travail, compétences spécifiques et contacts d'urgence.",
      featCertTracking: "Alertes d'Expiration Anticipées",
      featCertTrackingDesc:
        "Notifications automatiques avant l'échéance des cartes professionnelles, brevets de secourisme et casiers judiciaires.",
      featRosters: "Affectation Optimisée aux Séances",
      featRostersDesc:
        "Attribuez les éducateurs aux créneaux et terrains en vérifiant le respect des temps de repos et l'absence de chevauchements.",
      featSkillMatching: "Correspondance par Qualification",
      featSkillMatchingDesc:
        "Assurez-vous que les cours compétition ou enfants ne soient confiés qu'à des éducateurs disposant du niveau de brevet requis.",
      featMobileAccess: "Portail Mobile pour Éducateurs",
      featMobileAccessDesc:
        "Les entraîneurs consultent leur planning, saisissent leurs indisponibilités et reçoivent les changements par notification push.",
      featContractTypes: "Gestion Multi-Statuts",
      featContractTypesDesc:
        "Suivez salariés, prestataires indépendants, auto-entrepreneurs et intervenants bénévoles dans un cadre unifié.",
      roiTitle: "Performance des Ressources Humaines",
      tableHeaderMetric: "Opération RH",
      tableHeaderTraditional: "Classeurs Papier / Groupes WhatsApp",
      tableHeaderScripe: "SCRIPE HRMS",
      metricAuditReadiness: "Contrôle des Diplômes par les Tutelles",
      tradAuditReadiness: "Des jours à rechercher des justificatifs",
      scripeAuditReadiness: "Preuve de conformité en 5 secondes",
      metricSchedulingHours: "Temps Hebdomadaire de Planning",
      tradSchedulingHours: "8 à 12 heures pour les coordinateurs",
      scripeSchedulingHours: "< 1 heure grâce aux modèles réutilisables",
      metricLiabilityRisk: "Risque Juridique d'Encadrement Non Certifié",
      tradLiabilityRisk: "Élevé faute de contrôle régulier",
      scripeLiabilityRisk: "0 % grâce aux blocages préventifs",
      ctaTitle: "Structurez Votre Équipe Technique dès Aujourd'hui",
      ctaSubtitle:
        "Associez plannings de cours, affectations de terrains et conformité des certifications en un seul outil.",
      ctaPrimary: "Explorer le Module RH",
      ctaSecondary: "Consulter l'Architecture",
      featCertificationTracking: "Suivi des Habilitations et Certifications",
      featCertificationTrackingDesc:
        "Gestion des diplômes d'encadrement, visites médicales et cartes professionnelles avec alertes d'expiration.",
      featAvailabilityEngine: "Moteur de Disponibilité et Congés",
      featAvailabilityEngineDesc:
        "Planification des créneaux, souhaits d'affectation et périodes d'absence pour éviter tout conflit d'agenda.",
      featShiftRostering: "Planification et Gestion des Rotations",
      featShiftRosteringDesc:
        "Conception de plannings complexes et affectation optimisée des équipes aux installations sportives.",
      featComplianceGates: "Verrous Automatisés de Conformité",
      featComplianceGatesDesc:
        "Interdiction automatique d'affecter un intervenant dont les titres requis ou les assurances sont caducs.",
      featCoachAppIntegration: "Connexion Directe à l'App Entraîneurs",
      featCoachAppIntegrationDesc:
        "Synchronisation instantanée des emplois du temps et missions directement sur les smartphones des encadrants.",
    },
    customer360: {
      title: "Vision Client 360° et Party-Kernel",
      description:
        "Fiches uniques pour adhérents, liens de parenté dynamiques et déduplication intelligente des coordonnées.",
      intro:
        "Dites adieu aux annuaires éparpillés : le Party-Kernel rassemble sportifs, parents tuteurs, entreprises partenaires et fournisseurs dans un graphe relationnel cohérent.",
      statDuplication: "Taux de Doublons dans l'Annuaire",
      statProfileTime: "Temps d'Affichage du Profil",
      statRelations: "Types de Relations Prises en Charge",
      statMergeSafety: "Fusion sans Perte d'Historique",
      valueTitle: "La Pierre Angulaire de Votre Référentiel Client",
      featPolymorphic: "Modèle d'Acteur Polymorphe",
      featPolymorphicDesc:
        "Socle commun unifiant personnes physiques, sociétés morales, écoles et partenaires financiers.",
      featFamilyGraph: "Graphe Familial et Tuteurs",
      featFamilyGraphDesc:
        "Reliez parents et enfants, entreprises et collaborateurs, avec gestion déléguée de la facturation.",
      featMultiRole: "Gestion Multi-Rôles Simultanés",
      featMultiRoleDesc:
        "Une même personne peut être joueur le samedi, éducateur bénévole et parent payeur sans multiplier les fiches.",
      featDeduplication: "Déduplication Phonétique Intelligente",
      featDeduplicationDesc:
        "Détection des noms similaires et fusion sécurisée préservant l'intégralité des historiques d'achats.",
      featTimeline: "Fil d'Activité Chronologique Global",
      featTimelineDesc:
        "Visualisez toutes les réservations, factures, réclamations et communications de chaque contact sur un écran unique.",
      featPrivacy: "Conformité RGPD Intégrée",
      featPrivacyDesc:
        "Anonymisation sécurisée et extraction des données personnelles en un clic sur demande du client.",
      roiTitle: "Qualité des Données Clients",
      tableHeaderMetric: "Critère de Qualité",
      tableHeaderTraditional: "Bases de Données Silotées",
      tableHeaderScripe: "SCRIPE Customer 360",
      metricDuplicates: "Comptes Clients en Doublon",
      tradDuplicates: "12 à 25 % d'entrées polluées",
      scripeDuplicates: "< 1 % grâce au filtrage phonétique",
      metricServiceSpeed: "Renseignement Téléphonique ou à l'Accueil",
      tradServiceSpeed: "3 à 5 minutes à chercher entre logiciels",
      scripeServiceSpeed: "< 5 secondes sur un écran synthétique",
      metricMarketingPrecision: "Pertinence des Communications",
      tradMarketingPrecision: "Faible avec messages redondants",
      scripeMarketingPrecision: "Maximale grâce au ciblage par rôle",
      ctaTitle: "Obtenez une Vision Complète de Vos Adhérents",
      ctaSubtitle:
        "Renforcez la satisfaction de vos usagers grâce à un accompagnement personnalisé d'exception.",
      ctaPrimary: "Découvrir la Vision 360",
      ctaSecondary: "Détails Techniques",
      featUnifiedParties: "Modèle Centralisé des Acteurs (Party Core)",
      featUnifiedPartiesDesc:
        "Répertoire unifié fusionnant adhérents, partenaires, entreprises et familles au sein d'une fiche maîtresse.",
      featRelationships: "Cartographie des Liens et Rôles",
      featRelationshipsDesc:
        "Modélisation précise des liens de parenté, affiliations de clubs et conventions de parrainage.",
      featDynamicRoles: "Attribution Dynamique de Rôles",
      featDynamicRolesDesc:
        "Une même personne peut combiner plusieurs casquettes (ex: éducateur, parent, bénévole) sans compte doublon.",
      featSmartDeduplication: "Dédoublonnage Intelligent des Contacts",
      featSmartDeduplicationDesc:
        "Algorithmes de détection évitant la prolifération de fiches redondantes et garantissant la netteté de la base.",
      featOmniContacts: "Historique Multicanal des Coordonnées",
      featOmniContactsDesc:
        "Consolidation des numéros de téléphone, e-mails et adresses de facturation avec contrôle de validité.",
      featGdprReadiness: "Conformité Native à la Vie Privée",
      featGdprReadinessDesc:
        "Liaison immédiate aux procédures d'export et d'effacement prévues par la réglementation sur les données.",
    },
    organizationCore: {
      title: "Hiérarchie d'Organisation et Multi-Sites",
      description:
        "Modélisez holdings, filiales régionales, complexes sportifs et départements avec étanchéité stricte des accès.",
      intro:
        "Du groupe d'exploitation au terrain d'entraînement : SCRIPE reflète les structures d'entreprise multi-sites et délègue l'exploitation quotidienne avec rigueur.",
      statTiers: "Paliers Hiérarchiques Disponibles",
      statIsolation: "Cloisonnement des Données Locataires",
      statRollup: "Consolidation Comptable Instantanée",
      statPermissions: "Droits Précis par Établissement",
      valueTitle: "Gouvernance Maîtrisée pour Structures en Plein Essor",
      featTiers: "Arborescence à 6 Niveaux",
      featTiersDesc:
        "Entité Légale → Pôle d'Activité → Direction Régionale → Complexe Sportif → Département → Équipe Opérationnelle.",
      featScoping: "Filtrage Contextuel des Accès",
      featScopingDesc:
        "Les directeurs de complexe pilotent uniquement leur site, tandis que la direction générale suit l'ensemble des indicateurs.",
      featLegalEntities: "Personnes Morales Indépendantes",
      featLegalEntitiesDesc:
        "Définissez numéros de SIRET, raisons sociales et coordonnées bancaires distinctes pour chaque filiale.",
      featBranding: "Identité Visuelle par Établissement",
      featBrandingDesc:
        "Personnalisez logos, chartes graphiques et en-têtes d'e-mails pour chaque centre sportif de votre réseau.",
      featResourceSharing: "Accès Multi-Centres pour Pratiquants",
      featResourceSharingDesc:
        "Permettez à vos adhérents de fréquenter plusieurs complexes grâce à un abonnement inter-sites.",
      featAudit: "Historique des Évolutions de Structure",
      featAuditDesc:
        "Traçabilité des réorganisations internes pour les besoins d'audit juridique et financier.",
      roiTitle: "Performance d'Organisation Comparée",
      tableHeaderMetric: "Axe Opérationnel",
      tableHeaderTraditional: "Outils Locaux Éparpillés",
      tableHeaderScripe: "SCRIPE Organization Core",
      metricMultiSiteSetup: "Intégration d'un Nouveau Complexe",
      tradMultiSiteSetup: "Des semaines de configuration",
      scripeMultiSiteSetup: "< 10 minutes depuis la console centrale",
      metricReportingEffort: "Reporting Consolidé du Réseau",
      tradReportingEffort: "Des jours à consolider des fichiers Excel",
      scripeReportingEffort: "Tableaux de bord consolidés en temps réel",
      metricComplianceOverhead: "Harmonisation des Établissements",
      tradComplianceOverhead: "Forte hétérogénéité des pratiques",
      scripeComplianceOverhead: "100 % aligné sur les standards de l'enseigne",
      ctaTitle: "Bâtissez une Organisation Sportive Solide et Modulaire",
      ctaSubtitle: "Posez les bases d'un développement multi-sites performant et pérenne.",
      ctaPrimary: "Explorer le Module Organisation",
      ctaSecondary: "Consulter le Guide d'Architecture",
      featBusinessUnits: "Unités Opérationnelles et Métiers",
      featBusinessUnitsDesc:
        "Structurez votre organisation en divisions autonomes avec gestion budgétaire et opérationnelle propre.",
      featRegionalBranches: "Antennes et Directions Régionales",
      featRegionalBranchesDesc:
        "Pilotage des implantations locales en tenant compte des particularités territoriales et réglementaires.",
      featCampusesSites: "Infrastructures et Complexes Sportifs",
      featCampusesSitesDesc:
        "Recensement des terrains, stades et salles d'entraînement rattachés aux antennes de tutelle.",
      featOperationalTeams: "Équipes et Groupes Mixtes",
      featOperationalTeamsDesc:
        "Mobilisation de compétences transversales entre différentes structures pour de grands rassemblements.",
      featCrossBranchGovernance: "Gouvernance et Sécurité Centralisées",
      featCrossBranchGovernanceDesc:
        "Application uniforme des règles de conformité et des habilitations à l'ensemble du réseau.",
    },
    mediaDam: {
      title: "Gestion des Actifs Numériques (DAM)",
      description:
        "Téléversement par fragments avec reprise, stockage dans le cloud, analyse antivirus ClamAV et URLs temporaires sécurisées.",
      intro:
        "Centralisez photos de sportifs, justificatifs médicaux, captations vidéo et reçus comptables avec un niveau de sécurité digne d'un établissement bancaire.",
      statUploadSpeed: "Téléversements Reprenables",
      statSecurity: "Inspection Antivirus Automatique",
      statBackends: "Connecteurs de Stockage Cloud",
      statAccess: "URLs avec Signature Temporaire",
      valueTitle: "Hébergement Multimédia sans Faiblesse de Sécurité",
      featChunked: "Transferts Multipart Résilients",
      featChunkedDesc:
        "Envoyez des vidéos haute définition et des fichiers lourds sans interruption, même sur des réseaux mobiles instables.",
      featAntiVirus: "Analyse Malware ClamAV en Continu",
      featAntiVirusDesc:
        "Chaque document envoyé fait l'objet d'un scan automatique avant d'être validé pour l'usage opérationnel.",
      featStorage: "Stockage Cloud Flexible",
      featStorageDesc:
        "Compatible avec AWS S3, Azure Blob, MinIO et stockage disque local avec isolation absolue entre locataires.",
      featSignedUrls: "Téléchargements Protégés par Signature HMAC",
      featSignedUrlsDesc:
        "Les documents confidentiels ne sont diffusés que par des liens temporaires infalsifiables.",
      featThumbnails: "Création Automatique de Miniatures",
      featThumbnailsDesc:
        "Génération de versions adaptées pour le web et les applications mobiles afin d'économiser la bande passante.",
      featFolderTaxonomy: "Organisation Hiérarchique Sécurisée",
      featFolderTaxonomyDesc:
        "Classez vos médias par complexe, équipe ou saison avec héritage strict des droits de consultation.",
      roiTitle: "Infrastructure Multimédia Comparée",
      tableHeaderMetric: "Aspect Technique",
      tableHeaderTraditional: "Serveurs de Fichiers Non Sécurisés",
      tableHeaderScripe: "SCRIPE Media DAM",
      metricUploadReliability: "Fiabilité sur Fichiers Volumineux",
      tradUploadReliability: "Échecs répétés dès 100 Mo",
      scripeUploadReliability: "100 % de réussite avec reprise sur coupure",
      metricSecurityStandard: "Contrôle des Cybermenaces",
      tradSecurityStandard: "Absent dans la quasi-totalité des outils",
      scripeSecurityStandard: "Inspection automatique native via ClamAV",
      metricHotlinking: "Protection des Fichiers Privés",
      tradHotlinking: "Liens publics statiques vulnérables",
      scripeHotlinking: "Liens sécurisés HMAC-SHA256 à durée limitée",
      ctaTitle: "Sécurisez les Médias et Documents de Votre Réseau",
      ctaSubtitle: "Alliez fluidité de manipulation des fichiers et sécurité informatique absolue.",
      ctaPrimary: "Découvrir le Module Media",
      ctaSecondary: "Spécifications de l'API",
      featResumableUploads: "Téléversement Reprenable en Continu (TUS)",
      featResumableUploadsDesc:
        "Envoi fiable de vidéos lourdes et d'albums haute résolution avec reprise automatique après incident réseau.",
      featAutomatedSecurity: "Analyse Antivirus Automatisée",
      featAutomatedSecurityDesc:
        "Contrôle immédiat de tout fichier entrant pour éradiquer les malwares et mettre en quarantaine les menaces.",
      featDelegatedGrants: "Liens d'Accès Éphémères",
      featDelegatedGrantsDesc:
        "Génération d'adresses de téléchargement temporaires pour empêcher la fuite et le partage de documents sensibles.",
      featMultiCloudStorage: "Compatibilité Multi-Cloud Souple",
      featMultiCloudStorageDesc:
        "Prise en charge directe d'Azure Blob, AWS S3 et d'architectures de stockage interne sur site.",
      featBrandedDelivery: "Réseau CDN sous Marque Dédiée",
      featBrandedDeliveryDesc:
        "Distribution mondiale à très haute vitesse des contenus multimédias sous le domaine de votre structure.",
    },
    communication: {
      title: "Communication Omnicanale et Notifications",
      description:
        "Distribution garantie par SMS, e-mail, WhatsApp et push avec basculement automatique de routeur et modèles dynamiques bilingues.",
      intro:
        "Communiquez avec vos sportifs, adhérents et collaborateurs en toute fiabilité : SCRIPE Communication combine routage multi-opérateurs et accusés de réception certifiés.",
      statChannels: "Canaux Pris en Charge",
      statFailover: "Basculement Automatique de Passerelle",
      statDelivery: "Taux de Distribution Garanti",
      statTemplates: "Modèles Bilingues Prêts pour l'Arabe (RTL)",
      valueTitle: "Diffusion Critique qui Ne Manque Jamais sa Cible",
      featOmnichannel: "Couverture Complète Tous Canaux",
      featOmnichannelDesc:
        "Diffusez des notifications simultanées par SMS, courriel, WhatsApp Business et notifications push mobiles.",
      featFailover: "Bascule Intelligente en Cas de Panne",
      featFailoverDesc:
        "En cas d'incident sur un opérateur SMS ou courriel, la plateforme bascule instantanément vers un itinéraire secondaire.",
      featTemplates: "Moteur Avancé de Gabarits",
      featTemplatesDesc:
        "Créez des messages dynamiques avec prévisualisation en direct et prise en charge des langues occidentales et sémitiques (RTL).",
      featReceipts: "Accusés de Réception Inaltérables",
      featReceiptsDesc:
        "Consignation précise de la date, des identifiants d'opérateur, des statuts de lecture et des codes d'erreur.",
      featPreferences: "Gestion des Choix des Utilisateurs",
      featPreferencesDesc:
        "Chaque destinataire configure ses canaux de préférence pour recevoir convocations, factures ou alertes météo.",
      featHighThroughput: "Débit Massif pour Périodes de Pointe",
      featHighThroughputDesc:
        "Conçu pour absorber les pics de trafic lors d'annulations soudaines ou d'ouvertures d'inscriptions.",
      roiTitle: "Qualité de Transmission Comparée",
      tableHeaderMetric: "Critère de Diffusion",
      tableHeaderTraditional: "Outils d'Envoi Isolés",
      tableHeaderScripe: "SCRIPE Communication",
      metricDeliveryRate: "Taux de Réception des Messages Urgents",
      tradDeliveryRate: "85 à 92 % (Pertes lors des pannes)",
      scripeDeliveryRate: "99,9 % grâce au routage de secours",
      metricTemplateMaintenance: "Mise à Jour des Gabarits",
      tradTemplateMaintenance: "Des heures passées dans le code HTML",
      scripeTemplateMaintenance: "Quelques minutes dans l'éditeur visuel",
      metricDisputeProof: "Force Probante en Cas de Litige",
      tradDisputeProof: "Aucun registre fiable",
      scripeDisputeProof: "Piste d'audit avec accusé opérateur certifié",
      ctaTitle: "Maintenez Votre Communauté Toujours Connectée",
      ctaSubtitle:
        "Évitez les absences aux cours et les retards de paiement grâce à des rappels ciblés.",
      ctaPrimary: "Tester le Module Communication",
      ctaSecondary: "Consulter l'API",
      featMultiGateway: "Passerelle d'Envoi Multi-Opérateurs",
      featMultiGatewayDesc:
        "Intégration transparente avec les routeurs e-mail et SMS de référence (Twilio, SendGrid et relais locaux).",
      featIntelligentFailover: "Bascule Automatique en Cas d'Échec",
      featIntelligentFailoverDesc:
        "Routage de secours instantané vers un prestataire secondaire pour garantir la délivrance des messages critiques.",
      featBilingualTemplates: "Modèles Dynamiques Bilingues",
      featBilingualTemplatesDesc:
        "Création et gestion centralisée des maquettes e-mail et notifications avec variables contextuelles.",
      featReceiptAuditability: "Traçabilité et Preuves de Réception",
      featReceiptAuditabilityDesc:
        "Suivi chronologique des remises, ouvertures et clics consigné dans des journaux d'audit opposables.",
      featRealtimePush: "Diffusion Push et Événements en Direct",
      featRealtimePushDesc:
        "Distribution instantanée des messages sur les postes de travail et téléphones via SignalR et WebSockets.",
      featSpamCompliance: "Conformité Anti-Spam et Désabonnements",
      featSpamComplianceDesc:
        "Traitement automatique des désinscriptions pour préserver la réputation de vos adresses d'expédition.",
    },
    integrationsEcosystem: {
      title: "Passerelle API et Intégrations Développeurs",
      description:
        "Attribution sécurisée de clés API, contrôle cryptographique SHA-256 en temps constant, limitation de débit distribuée sur Redis et webhooks.",
      intro:
        "Connectez vos applications mobiles, sites web de réservation et logiciels partenaires via une passerelle d'API robuste à latence ultra-faible.",
      statLatency: "Temps de Contrôle d'Accès",
      statProtection: "Protection SHA-256 en Temps Constant",
      statRateLimit: "Régulation Distribuée sur Redis",
      statWebhooks: "Webhooks avec Signature Numérique",
      valueTitle: "Connectivité d'Entreprise sans Compromis de Sécurité",
      featApiKeys: "Clés d'API Préfixées et Traçables",
      featApiKeysDesc:
        "Générez des clés horodatées avec préfixes normalisés (sk_live_..., sk_test_...) et date d'expiration.",
      featScopes: "Permissions Granulaires par Domaine",
      featScopesDesc:
        "Définissez des périmètres précis (ex. venue:read, billing:write) pour interdire les accès non autorisés.",
      featRateLimiting: "Limitation de Requêtes Décentralisée",
      featRateLimitingDesc:
        "Protégez vos serveurs contre les attaques par déni de service grâce aux algorithmes Token Bucket adossés à Redis.",
      featConstantTime: "Comparaison Cryptographique en Temps Fixe",
      featConstantTimeDesc:
        "Immunité totale contre les attaques par analyse temporelle lors de la vérification des condensats SHA-256.",
      featTelemetry: "Télémétrie des Appels en Temps Réel",
      featTelemetryDesc:
        "Tableau de bord visualisant le volume de requêtes, le taux d'erreur, les adresses IP clientes et les temps de réponse.",
      featWebhooks: "Webhooks Signés avec HMAC",
      featWebhooksDesc:
        "Notifiez en temps réel les événements d'exploitation (réservations, paiements) vers vos systèmes tiers.",
      roiTitle: "Performance de l'Infrastructure API",
      tableHeaderMetric: "Critère Technique",
      tableHeaderTraditional: "Jetons Faits Maison Non Régulés",
      tableHeaderScripe: "Passerelle API SCRIPE",
      metricAuthOverhead: "Latence d'Authentification",
      tradAuthOverhead: "15 à 45 ms d'interrogations SQL",
      scripeAuthOverhead: "< 1 ms grâce aux condensats en mémoire",
      metricAbuseProtection: "Résistance aux Surcharges de Trafic",
      tradAbuseProtection: "Saturation rapide des serveurs",
      scripeAbuseProtection: "Régulation immédiate par Redis",
      metricSideChannel: "Protection contre les Attaques Temporelles",
      tradSideChannel: "Vulnérable aux comparaisons de chaînes",
      scripeSideChannel: "Invulnérable par égalité en temps fixe",
      ctaTitle: "Construisez un Réseau Solide d'Intégrations Partenaires",
      ctaSubtitle:
        "Accélérez vos déploiements avec des outils conçus pour les développeurs exigeants.",
      ctaPrimary: "Ouvrir l'Espace Développeurs",
      ctaSecondary: "Lire le Dossier Sécurité",
      featKeyManagement: "Gestion Sécurisée des Clés d'API",
      featKeyManagementDesc:
        "Production et rotation de clés d'accès cryptées avec limitation stricte de durée de validité.",
      featScopeDelegation: "Délégation Précise des Permissions",
      featScopeDelegationDesc:
        "Attribution ciblée des périmètres d'accès pour chaque logiciel tiers afin de cloisonner les flux.",
      featQuotaEnforcement: "Régulation des Débits et Quotas",
      featQuotaEnforcementDesc:
        "Plafonnement des sollicitations pour immuniser la plateforme contre les pics de charge anormaux.",
      featApiTelemetry: "Télémétrie et Analyse des Flux d'API",
      featApiTelemetryDesc:
        "Tableau de bord de surveillance des temps de réponse, taux de succès et volumes de données échangés.",
      featPartnerEcosystem: "Espace Intégrateurs et Partenaires",
      featPartnerEcosystemDesc:
        "Environnements de bac à sable et documentation claire pour connecter des solutions métiers en un temps record.",
      featIpWhitelisting: "Filtrage des Adresses IP Autorisées",
      featIpWhitelistingDesc:
        "Contrôle strict restreignant les appels de programmation aux seuls serveurs certifiés.",
    },
    customFields: {
      title: "Champs Personnalisés et Données Métier",
      description:
        "Définition de métadonnées propres à chaque locataire pour toute entité du système — sans toucher au schéma de base de données ni au code.",
      intro:
        "Offrez à chaque club ou entreprise la possibilité d'ajouter des attributs spécifiques — taille d'équipement, pied fort, référent légal — sans développement sur mesure.",
      valueTitle: "Souplesse Fonctionnelle sans Dette Technique",
      featNoMigrationTitle: "Zéro Migration de Base de Données",
      featNoMigrationDesc:
        "Les nouveaux champs sont utilisables instantanément sans redémarrer les services ni altérer les tables SQL.",
      featTypedTitle: "22 Types de Données Rigoureux",
      featTypedDesc:
        "Support complet pour textes, valeurs numériques, dates, listes déroulantes, pièces jointes et texte enrichi avec validation stricte.",
      featTenantTitle: "Étanchéité Totale par Locataire",
      featTenantDesc:
        "Chaque champ appartient exclusivement au locataire qui l'a créé. Des champs globaux sont réservés à l'opérateur.",
      featApiTitle: "Restitution Automatisée dans l'API",
      featApiDesc:
        "Les informations personnalisées sont directement incluses dans les objets de données renvoyés par l'API.",
      targetTitle: "Exemples d'Usage Fréquents",
      target1:
        "Clubs Sportifs : Enregistrement du poste de jeu, de la pointure et des allergies sur la fiche de l'athlète.",
      target2:
        "Centres d'Affaires : Renseignement des codes analytiques et numéros de bons de commande sur les réservations.",
      target3:
        "Académies : Suivi des autorisations parentales, niveaux de brevet et régimes alimentaires.",
      feat22Types: "22 Typologies de Champs Disponibles",
      feat22TypesDesc:
        "Des montants monétaires aux dates, listes déroulantes, textes enrichis Markdown et coordonnées GPS.",
      featEncryption: "Chiffrement des Données Sensibles",
      featEncryptionDesc:
        "Sécurisation automatique des mentions médicales et informations financières par chiffrement AES-256 en base.",
      featFieldGroups: "Organisation par Onglets Thématiques",
      featFieldGroupsDesc:
        "Regroupement des attributs dans l'interface avec ordres de tri et libellés bilingues sur mesure.",
      featValidationRules: "Contrôles de Saisie Personnalisés",
      featValidationRulesDesc:
        "Obligation de saisie, formules d'expressions régulières, plages numériques et contrôle d'unicité.",
      featReferences: "Liens Directs entre Enregistrements",
      featReferencesDesc:
        "Établissez des relations entre champs et entités du système sans contrainte de clé étrangère rigide.",
      featTenantScoping: "Personnalisation par Organisation",
      featTenantScopingDesc:
        "Chaque organisation configure ses propres attributs, tandis que l'administrateur peut imposer des schémas communs.",
      ctaTitle: "Adaptez la Plateforme à Vos Métiers Sans Code",
      ctaSubtitle:
        "Permettez aux équipes opérationnelles de capturer exactement les données nécessaires sans friction d'ingénierie.",
      ctaPrimary: "Voir la Matrice des Fonctionnalités",
      ctaSecondary: "Lire la Documentation Technique",
    },
    workManagement: {
      title: "Gestion des Tâches et Projets",
      description:
        "Tableaux Kanban intégrés, planification de cycles de travail, pointage des heures et suivi des jalons d'exploitation.",
      intro:
        "Coordonnez les opérations du terrain avec les objectifs du club : gestion des interventions d'entretien, préparatifs d'événements et projets d'équipe.",
      valueTitle: "Organisation et Productivité Décuplées",
      featKanbanTitle: "Vues Kanban et Listes de Tâches",
      featKanbanDesc:
        "Visualisez les étapes d'avancement, déplacez les cartes par glisser-déposer et identifiez immédiatement les goulets d'étranglement.",
      featSprintsTitle: "Planification par Sprints et Jalons",
      featSprintsDesc:
        "Structurez les tâches sur des périodes définies pour préparer les tournois ou les rentrées de saison.",
      featTimeTitle: "Suivi du Temps Passé",
      featTimeDesc:
        "Les intervenants enregistrent leurs heures sur chaque tâche pour faciliter la comptabilité analytique.",
      featCollabTitle: "Travail d'Équipe Transparent",
      featCollabDesc:
        "Commentaires, pièces jointes et désignations de responsables pour garantir la bonne exécution des consignes.",
      targetTitle: "Profils Utilisateurs Clés",
      target1:
        "Responsables de Maintenance : Supervision de l'entretien des pelouses, de l'éclairage et des vestiaires.",
      target2:
        "Comités de Tournoi : Coordination des plannings logistiques et des bénévoles lors des événements.",
      target3:
        "Pôle Administratif : Traitement des bordereaux de licences et des conventions de partenariat.",
      featPolymorphicTasks: "Rattachement Universel des Tâches",
      featPolymorphicTasksDesc:
        "Associez des fiches d'intervention à n'importe quel élément (terrain, dossier d'athlète, facture) sans surcoût technique.",
      featSlaTracking: "Surveillance des Délais et Engagements SLA",
      featSlaTrackingDesc:
        "Définition de plages cibles de résolution avec décompte visuel et escalade des priorités en cas de retard.",
      featTeamAssignment: "Affectation Interdisciplinaire des Missions",
      featTeamAssignmentDesc:
        "Délégation de tâches aux éducateurs, régisseurs ou équipes financières avec notifications directes.",
      featPriorityEscalation: "Pilotage Dynamique des Urgences",
      featPriorityEscalationDesc:
        "Hiérarchisation des urgences réordonnant automatiquement les listes de travail des intervenants.",
      featLifecycleStates: "Étapes de Cycle de Vie Paramétrables",
      featLifecycleStatesDesc:
        "Cheminement maîtrisé entre Brouillon, En Cours, En Attente, Traité et Contrôlé.",
      featWorkloadMetrics: "Indicateurs de Charge et Disponibilité",
      featWorkloadMetricsDesc:
        "Suivi du volume des dossiers pendants, des temps moyens d'exécution et de la capacité de traitement des équipes.",
      ctaTitle: "Accélérez l'Efficience de Votre Gestion Quotidienne",
      ctaSubtitle:
        "Assurez-vous que rien ne soit négligé grâce à une gestion des tâches polymorphe guidée par les SLA.",
      ctaPrimary: "Explorer les Outils de Productivité",
      ctaSecondary: "Lire la Documentation Technique",
    },
    analytics: {
      title: "Analytique des Revenus et Décisionnel",
      description:
        "Suivi des revenus récurrents MRR/ARR, analyses de cohortes, prévisions d'attrition et indices de santé des comptes clients.",
      intro:
        "Fondez votre stratégie sur des faits : le module Décisionnel transforme les réservations et abonnements en prévisions précises de croissance.",
      valueTitle: "Clarté Stratégique pour les Dirigeants",
      featMrrTitle: "Indicateurs MRR et ARR en Direct",
      featMrrDesc:
        "Ventilation détaillée des revenus récurrents mensuels et annuels par formule, complexe sportif et cohorte.",
      featCohortTitle: "Analyse de Rétention et de Cohortes",
      featCohortDesc:
        "Mesurez la fidélité des adhérents dans la durée et comprenez les causes de désabonnement.",
      featHealthTitle: "Indice de Santé des Locataires",
      featHealthDesc:
        "Algorithme d'analyse de l'activité, de la récurrence des paiements et de l'usage pour prévenir les résiliations.",
      featForecastTitle: "Projections Budgétaires Prédictives",
      featForecastDesc:
        "Modélisation statistique estimant les recettes futures en fonction des tendances d'occupation et de la saisonnalité.",
      targetTitle: "Destinataires Principaux",
      target1:
        "Directions Générales et Financières : Pilotage du chiffre d'affaires, de la rentabilité et de la trésorerie.",
      target2:
        "Gestionnaires d'Installations : Analyse des plages horaires et activités générant la plus forte marge.",
      target3:
        "Actionnaires et Investisseurs : Données financières fiables et certifiables pour les assemblées générales.",
      featEventStream: "Flux d'Événements Métiers Inaltérable",
      featEventStreamDesc:
        "Traçabilité chronologique complète enregistrée une seule fois, constituant une piste d'audit irréprochable.",
      featDailyRollups: "Consolidation Quotidienne des Indicateurs",
      featDailyRollupsDesc:
        "Supprimez la lenteur des requêtes massives grâce à des agrégations nocturnes prêtes à l'emploi.",
      featInProcessRecording: "Captation Instantanée en Transaction",
      featInProcessRecordingDesc:
        "Enregistrement direct des faits dans la transaction applicative sans dépendance à un courtier externe.",
      featTenantIsolation: "Cloisonnement Absolu des Organisations",
      featTenantIsolationDesc:
        "Chaque indicateur et chaque événement est strictement circonscrit à l'organisation concernée.",
      featExecutiveMetrics: "Tableaux de Bord Stratégiques de Direction",
      featExecutiveMetricsDesc:
        "Analyse croisée de la fréquentation des créneaux, de la dynamique de facturation et de l'occupation des complexes.",
      featZeroLatencyDashboards: "Affichage Fluide et Sans Délais",
      featZeroLatencyDashboardsDesc:
        "Rapports volumineux s'ouvrant en moins de 300 millisecondes pour éclairer immédiatement les décisions.",
      ctaTitle: "Activez le Pilotage Décisionnel en Temps Réel",
      ctaSubtitle:
        "Donnez à votre direction des tableaux de bord instantanés et des flux d'événements fiables.",
      ctaPrimary: "Explorer les Éditions Analytics",
      ctaSecondary: "Lire la Documentation Technique",
    },
  },
};

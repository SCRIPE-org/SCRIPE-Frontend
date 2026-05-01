/**
 * Docs page locale — FR
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
        "NEXORA n'est pas une coquille vide ; c'est un écosystème d'entreprise fonctionnel dès le premier jour. Utilisez nos modules métier existants — tels que la gestion des utilisateurs, les journaux d'audit et les notifications — comme points de départ immédiats, ou clonez-les pour construire rapidement des fonctionnalités propriétaires.",
      businessTitle: "Logique Métier Accélérée",
      commTitle: "Communication & Webhooks",
      coreContent:
        "La couche Fondation fournit les éléments absolument non négociables : le fournisseur d'identité, les stratégies de résolution multi-tenant, les abstractions de contexte EF Core et le répartiteur centralisé MediatR. C'est le socle solide sur lequel repose l'ensemble de votre application.",
      coreTitle: "Le Cœur de Fondation",
      crmModule: "Module CRM Headless",
      crmModuleDesc:
        "Gérez les hiérarchies organisationnelles, les relations clients et les attributs personnalisés avec une architecture CRM entièrement pilotée par API.",
      customModule: "Module d'Intégration Propriétaire",
      customModuleDesc:
        "Une sandbox immaculée utilisant exactement les mêmes frontières de la Clean Architecture pour héberger votre logique industrielle unique.",
      dataTitle: "Données & Audit",
      description:
        "Un répertoire complet des contextes délimités (Bounded Contexts) d'entreprise pré-construits et prêts pour la production inclus dans la plateforme NEXORA.",
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
        "NEXORA est livré avec une bibliothèque massive de contextes délimités testés et de qualité professionnelle. Dès le premier jour, vous possédez la maturité opérationnelle d'une application SaaS vieille de 5 ans.",
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
    },
  },
};

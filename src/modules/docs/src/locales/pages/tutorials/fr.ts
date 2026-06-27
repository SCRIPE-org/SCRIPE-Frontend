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
        "Produisez les modèles de requête de mutation (Créer, Mettre à jour, Supprimer) et couvrez-les par FluentValidation.",
      step4Title: "4. Créer les Requêtes (Queries)",
      step4Desc:
        "Produisez les modèles de lecture (GetById, GetPaged) avec mapping rapide et sécurisé DTO.",
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
  },
};

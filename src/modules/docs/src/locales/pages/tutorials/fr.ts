/**
 * Docs page locale — FR
 */
export const fr = {
  tutorials: {
    addBackendModule: {
      commandTitle: "Silos de Commandes CQRS",
      controllerTitle: "Sortie Contrôleur de l'API",
      description:
        "Guide complet pour créer un module de microservice C# avec Clean Architecture et CQRS.",
      diTitle: "Cblage des Injections",
      entityTitle: "Entités Flexibles",
      intro:
        "Ce guide expose comment déployer une API complète de la base de données au contrôleur REST public en respectant les standards de l'entreprise.",
      migrationNote:
        "Vérifiez méticuleusement que vous avez passé 'dotnet ef database update' et examiné les modifications SQL en local avant de pousser vos changements.",
      prerequisitesTitle: "Prérequis",
      registerTitle: "Branchement et Compilation",
      step1Desc: "Générez les bibliothèques de classes C# conformes aux couches du DDD.",
      step1Title: "1. Créer la Structure du Projet",
      step2Desc:
        "Héritez de la classe de base AuditableEntity et fixez les règles de validation du modèle.",
      step2Title: "2. Définir l'Entité de Domaine",
      step3Desc:
        "Produisez les modèles de requête de mutation (Créer, Mettre à jour, Supprimer) et couvrez-les par FluentValidation.",
      step3Title: "3. Créer les Commandes (Commands)",
      step4Desc:
        "Produisez les modèles de lecture (GetById, GetPaged) avec mapping rapide et sécurisé DTO.",
      step4Title: "4. Créer les Requêtes (Queries)",
      step5Desc:
        "Appuyez-vous sur les classes de base génériques de EF Core au sein de la couche infrastructure.",
      step5Title: "5. Implémenter le Référentiel",
      step6Desc:
        "Ajoutez la signature dans l'extension du Module DI pour informer le serveur de son existence.",
      step6Title: "6. Enregistrement des Dépendances (DI)",
      step7Desc:
        "Instanciez le contrôleur RESTful, décorez-le avec les exigences de permissions et documentez le Swagger XML.",
      step7Title: "7. Ajouter le Contrôleur d'API",
      step8Desc:
        "Vérifiez que le YARP Gateway l'intègre, et générez la migration finale vers le DbContext.",
      step8Title: "8. Enregistrement du Déploiement",
      stepsTitle: "Guide Étape par Étape",
      structureTitle: "Architecture des Projets",
      title: "Ajouter un Module Backend",
    },
    addModule: {
      checklist:
        "Avant la soumission du code (Pull Request), vérifiez la règle des 60 lignes et l'absence totale d'importations interdites inter-modules.",
      description:
        "Guide étape par étape pour créer un nouveau module frontend suivant le modèle SOLID View/ViewModel.",
      diTitle: "Conteneur DI",
      entityTitle: "Entité du Domaine",
      intro:
        "Ce tutoriel vous accompagne dans la création d'un module complet en assurant une qualité conforme aux architectures de la plateforme.",
      prerequisitesTitle: "Prérequis",
      repoTitle: "Couche Référentiel",
      routeTitle: "Routage et Navigation",
      step1Desc:
        "Préparez les répertoires standards avec les couches Domaine, Données et Présentation.",
      step1Title: "1. Créer la Structure du Module",
      step2Desc: "Créez un schéma Zod couplé avec le typage statique TypeScript de votre entité.",
      step2Title: "2. Définir l'Entité de Domaine",
      step3Desc:
        "Implémentez la couche d'appel réseau et interceptez les données API via TanStack.",
      step3Title: "3. Créer le Référentiel (Repository)",
      step4Desc: "Enregistrez votre référentiel au sein de l'injection de dépendances React.",
      step4Title: "4. Configurer le Conteneur DI",
      step5Desc:
        "Construisez le chef d'orchestre principal des opérations CRUD en appelant useCrudViewModel.",
      step5Title: "5. Construire le ViewModel",
      step6Desc:
        "Construisez le composant visuel de pure interface utilisateur consommant le ViewModel (moins de 60 lignes de code).",
      step6Title: "6. Créer la Vue (View)",
      step7Desc:
        "Déclarez la page connectrice (page.tsx) de Next.js pour brancher le visuel à l'arborescence URL.",
      step7Title: "7. Ajouter la Route et la Navigation",
      stepsTitle: "Guide Étape par Étape",
      structureTitle: "Structure du Module",
      title: "Ajouter un Module Frontend",
      viewModelTitle: "Modèle de Vue (ViewModel)",
      viewTitle: "Composant de la Vue",
    },
  },
};

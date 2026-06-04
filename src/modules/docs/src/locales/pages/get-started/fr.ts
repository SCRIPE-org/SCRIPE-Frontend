/**
 * Docs page locale — FR
 */
export const fr = {
  getStarted: {
    overview: {
      architectureIntro:
        "SCRIPE fonctionne selon trois modes de déploiement entièrement contrôlés par une seule variable d'environnement. Le même binaire compilé peut s'exécuter en tant que monolithe (tous les modules), microservice (un seul module) ou passerelle API (proxy YARP).",
      architectureTitle: "Topologie de l'Architecture",
      deploymentModesIntro:
        "La variable d'environnement MODULE_NAME détermine quels modules se chargent au démarrage. Lorsqu'elle est vide, tous les modules s'enregistrent (mode monolithe). Lorsqu'elle contient un nom de module, seul ce module est chargé (mode microservice). Lorsqu'elle est définie sur 'Gateway', le proxy inverse YARP est activé.",
      deploymentModesTitle: "Modes de Déploiement",
      description:
        "Introduction à l'architecture, aux capacités et à la stack technologique de la plateforme Enterprise SCRIPE.",
      environmentProfilesTitle: "Profils d'Environnement",
      envVarPrefixTip:
        "Seules les variables d'environnement commençant par SCRIPE_ sont chargées. Par exemple, SCRIPE_ConnectionStrings__DefaultConnection remplace la chaîne de connexion. Les doubles traits de soulignement (__) représentent l'imbrication dans la configuration JSON.",
      featureCQRS: "CQRS + AstraFlow mediator",
      featureCQRSDesc:
        "Séparation des Commandes/Requêtes avec un pipeline à 6 comportements : journalisation (logging), journalisation de flux (stream logging), validation, feature gating (contrôle des fonctionnalités), envoi de webhooks et mise en cache.",
      featureDeployment: "Déploiement Flexible",
      featureDeploymentDesc:
        "Déployez en tant que monolithe, microservices ou hybride via une seule variable d'environnement MODULE_NAME.",
      featureModular: "Monolithe Modulaire",
      featureModularDesc:
        "Modules isolés avec des frontières claires : développez, testez et déployez indépendamment. Même binaire, déploiement flexible.",
      featureMultiDB: "Base de données flexible",
      featureMultiDBDesc:
        "Basculez entre SQL Server, PostgreSQL ou Oracle. Exécutez tous les modules dans une seule base de données partagée (mode Single) ou attribuez à chaque module sa propre base de données (mode Multi) — contrôlé par une seule option de configuration.",
      featureMultiTenant: "Multi-locataire (Multi-Tenancy)",
      featureMultiTenantDesc:
        "Isolation des locataires (tenants) au niveau des lignes avec les filtres de requêtes globaux d'EF Core. Paramètres par locataire, branding personnalisé et portée des données.",
      featureSecurity: "Sécurité d'Entreprise",
      featureSecurityDesc:
        "Moteur unifié de contrôle d'accès basé sur les politiques (PBAC) réunissant RBAC, GBAC et ABAC. Inclut la 2FA, des restrictions au niveau des champs, la limitation de débit (rate limiting), la gestion des sessions et des pistes d'audit immuables.",
      featureSSO: "SSO d'Entreprise et Fournisseur d'Identité",
      featureSSODesc:
        "Fournisseur d'identité OIDC/OAuth2 natif permettant une véritable authentification unique sur l'ensemble de votre écosystème. Agissez comme un IDP principal (comme Keycloak) gérant de manière transparente les applications clientes externes.",
      intro:
        "SCRIPE est une plateforme d'entreprise prête pour la production, construite avec une architecture de Monolithe Modulaire. Elle fournit tout ce dont vous avez besoin pour créer des applications métiers évolutives : authentification, autorisation, architecture multi-locataire (multi-tenancy), journaux d'audit, événements en temps réel et un panneau d'administration complet, prêts à l'emploi. La plateforme s'exécute comme un binaire unique qui peut être déployé en tant que monolithe ou décomposé en microservices sans modification du code.",
      registrationOrderWarning:
        "NE modifiez PAS l'ordre des enregistrements de services dans Program.cs. AddCoreInfrastructure doit précéder les modules (ils dépendent de ICurrentUser), et AddCoreApplication doit suivre les modules (AstraFlow mediator a besoin de leurs assemblages).",
      serviceRegistrationIntro:
        "L'ordre d'enregistrement des services dans Program.cs a une importance architecturale capitale. Modifier cet ordre peut provoquer des erreurs d'exécution. L'infrastructure de base doit être enregistrée avant les modules, et AstraFlow mediator a besoin que les marqueurs d'assemblage des modules soient collectés en premier.",
      serviceRegistrationTitle: "Ordre d'Enregistrement des Services",
      techStackTitle: "Stack Technologique",
      title: "Vue d'ensemble",
    },
    prerequisites: {
      databaseIntro:
        "SCRIPE prend en charge trois fournisseurs de bases de données de manière native : SQL Server, PostgreSQL et Oracle. Le fournisseur est configuré via Database.Provider dans appsettings.json. De plus, le paramètre Database.Mode contrôle l'isolation de la base de données : 'Single' place toutes les tables des modules dans une seule base de données partagée, tandis que 'Multi' (par défaut) permet à chaque module d'avoir sa propre base de données avec des chaînes de connexion séparées.",
      databaseTip:
        "Pour le développement local, SQL Server avec Docker est la configuration la plus rapide. Utilisez le fichier Docker Compose ci-dessous pour lancer SQL Server et Redis en quelques secondes.",
      databaseTitle: "Prise en Charge des Bases de Données",
      description:
        "Outils requis, configuration de la base de données et de l'environnement pour le développement.",
      dockerNote:
        "Le fichier Docker Compose ci-dessus configure SQL Server 2022 et Redis 7 pour le développement local. Le service scripe-api est construit à partir du Dockerfile du backend et se connecte automatiquement aux deux services.",
      dockerTitle: "Démarrage Rapide Docker",
      envSetupTitle: "Configuration de l'Environnement",
      intro:
        "Avant de commencer à développer avec SCRIPE, assurez-vous que votre machine de développement dispose des outils requis. Cette page couvre les exigences exactes de version, la prise en charge des bases de données, la configuration étape par étape et le démarrage rapide avec Docker.",
      requiredToolsTitle: "Outils Requis",
      step1Content:
        "Assurez-vous que tous les outils requis sont installés et répondent aux exigences minimales de version.",
      step1Title: "Vérifier les Versions des Outils",
      step2Content: "Clonez le monorepo avec les sous-modules Git pour le backend et le frontend.",
      step2Title: "Cloner le Référentiel",
      step3Content:
        "Mettez à jour la chaîne de connexion (connection string) pour pointer vers votre instance de base de données locale.",
      step3Title: "Configurer la Chaîne de Connexion",
      step4Content:
        "Restaurez les packages NuGet et appliquez les migrations Entity Framework pour créer le schéma de la base de données.",
      step4Title: "Configuration du Backend",
      step5Content:
        "Installez les dépendances npm et créez votre fichier de configuration d'environnement local.",
      step5Title: "Configuration du Frontend",
      title: "Prérequis",
    },
    projectStructure: {
      allowedImports: "Importations Autorisées",
      backendTitle: "Structure du Backend",
      boundaryWarning:
        "Les limites des modules sont une règle absolue. Les modules NE PEUVENT PAS importer de code les uns des autres. Si du code doit être partagé, il doit être déplacé vers @core/. Les données inter-modules sont transmises uniquement via des paramètres d'URL ou des ID partagés.",
      description:
        "Disposition complète des répertoires du monorepo SCRIPE : racine, backend, frontend et anatomie des modules.",
      forbiddenImports: "Importations Interdites",
      frontendTitle: "Structure du Frontend",
      intro:
        "SCRIPE est organisé comme un monorepo de sous-modules Git composé de trois parties principales : le référentiel racine, le sous-module backend et le sous-module frontend. Comprendre cette structure est essentiel pour naviguer dans la base de code.",
      moduleAnatomyIntro:
        "Chaque module frontend suit une structure identique. Cette cohérence permet de naviguer facilement dans n'importe quel module une fois que vous en avez compris un. Chaque couche a des responsabilités strictes et des règles d'importation.",
      moduleAnatomyTitle: "Anatomie d'un Module",
      rootTitle: "Monorepo Racine",
      title: "Structure du Projet",
      toolsIntro:
        "Le répertoire tools/ contient la CLI SCRIPE et le Studio. La CLI fournit 123 commandes pour le scaffolding, les compilations, les migrations et le déploiement. Studio est un tableau de bord visuel pour développeurs construit avec Express (moteur) et Next.js (UI).",
      toolsTitle: "Outils de Développement",
    },
    quickStart: {
      backendRunningTip:
        "Le serveur API démarrera sur https://localhost:5001 par défaut. L'interface Swagger est disponible sur /swagger en mode développement.",
      backendStep1Content: "Restaurez tous les packages NuGet pour la solution.",
      backendStep1Title: "Restaurer les Dépendances",
      backendStep2Content:
        "Exécutez les migrations Entity Framework pour créer ou mettre à jour le schéma de la base de données.",
      backendStep2Title: "Appliquer les Migrations",
      backendStep3Content: "Démarrez le serveur API backend sur https://localhost:5001.",
      backendStep3Title: "Exécuter le Serveur API",
      backendTitle: "Démarrer le Backend",
      cliDevAllCmd:
        "scripe dev all — Démarrer les deux serveurs simultanément avec une sortie étiquetée et ouverture automatique du navigateur.",
      cliDevBackendCmd: "scripe dev backend — Démarrer le backend .NET en mode développement.",
      cliDevFrontendCmd:
        "scripe dev frontend — Démarrer le serveur de développement Next.js avec détection automatique du port et lancement du navigateur.",
      cliDevIntro:
        "Au lieu de démarrer manuellement les serveurs backend et frontend, utilisez la CLI SCRIPE pour une expérience de développement optimisée. La CLI gère automatiquement la résolution des ports, le lancement du navigateur et la gestion concurrente des serveurs.",
      cliDevNoBrowser:
        "Ajoutez --no-browser à tout commande dev pour empêcher l'ouverture automatique du navigateur (utile pour les environnements CI/headless).",
      cliDevTitle: "Développement avec la CLI",
      credentialsWarning:
        "Modifiez ces mots de passe immédiatement en production ! Les identifiants par défaut sont générés par la migration de la base de données et ne doivent être utilisés que pour le développement local.",
      defaultCredentialsTitle: "Identifiants par Défaut",
      description:
        "Faites fonctionner SCRIPE localement en moins de 5 minutes avec le backend, le frontend et les étapes de vérification.",
      frontendStep1Content:
        "Installez toutes les dépendances npm en utilisant pnpm pour une installation plus rapide et économe en espace disque.",
      frontendStep1Title: "Installer les Dépendances",
      frontendStep2Content:
        "Créez un fichier .env.local avec l'URL de l'API et le nom de l'application.",
      frontendStep2Title: "Configurer l'Environnement",
      frontendStep3Content:
        "Démarrez le serveur de développement Next.js sur http://localhost:3000.",
      frontendStep3Title: "Démarrer le Serveur de Développement",
      frontendTitle: "Démarrer le Frontend",
      intro:
        "Ce guide vous accompagne dans le démarrage du serveur API backend et du serveur de développement frontend, puis dans la vérification de leur bon fonctionnement.",
      prodBuildAllCmd:
        "scripe build all — Compiler le backend et le frontend pour le déploiement en production.",
      prodNoBrowser:
        "Ajoutez --no-browser pour empêcher l'ouverture automatique du navigateur en mode production.",
      prodStartAllCmd:
        "scripe start all — Démarrer le backend (mode Release) et le frontend (next start) simultanément. Ouvre automatiquement le navigateur.",
      prodStartBackendCmd:
        "scripe start backend — Démarrer uniquement le serveur backend de production (dotnet run --configuration Release).",
      prodStartFrontendCmd:
        "scripe start frontend — Démarrer uniquement le serveur frontend de production.",
      prodStartPublishedCmd:
        "scripe start all --published — Exécuter depuis le DLL pré-compilé pour le démarrage le plus rapide. Nécessite scripe build backend d'abord.",
      productionIntro:
        "Pour le déploiement en production, utilisez la commande scripe start qui exécute les serveurs en mode release/production avec des performances optimisées.",
      productionTitle: "Serveurs de Production",
      scripeCliIntro:
        "L'outil SCRIPE CLI (scripe-cli) fournit des commandes de scaffolding pour générer des modules, des entités, des commandes, des requêtes, etc. Il suit automatiquement les conventions d'architecture du projet.",
      scripeCliTitle: "SCRIPE CLI",
      studioBuildCmd:
        "scripe studio build — Pré-compiler le moteur du Studio (TypeScript) et l'UI (Next.js) sans démarrer.",
      studioDevCmd:
        "scripe studio --dev — Lancer le Studio en mode développement avec rechargement à chaud. Ouvre automatiquement le navigateur sur le port 4200.",
      studioIntro:
        "SCRIPE Studio est un tableau de bord visuel pour développeurs offrant une interface utilisateur en temps réel pour gérer l'ensemble de votre flux de travail de développement. Il comprend la gestion des modules, les générateurs de code, les contrôles de serveurs de développement, les opérations de base de données, l'accès au terminal et plus encore.",
      studioPortCmd:
        "Utilisez --port et --engine-port pour personnaliser les ports de l'UI (défaut : 4200) et du moteur (défaut : 4201).",
      studioProdCmd:
        "scripe studio — Lancer le Studio en mode production. Compile le moteur et l'UI s'ils ne sont pas encore construits.",
      studioTitle: "SCRIPE Studio",
      title: "Démarrage Rapide",
      verifyInstallIntro:
        "Une fois que les deux serveurs sont en cours d'exécution, vérifiez l'installation à l'aide de ces tests.",
      verifyInstallTitle: "Vérifier l'Installation",
    },
  },
};

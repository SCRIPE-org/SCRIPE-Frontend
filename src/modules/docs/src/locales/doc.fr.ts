/**
 * French locale for the Documentation Portal.
 * Contains all UI strings and content translations.
 */
import type { DocTranslations } from './doc.en';

export const docFr: DocTranslations = {
      // ─── Common UI ──────────────────────────────────────────────
      common: {
            search: 'Rechercher dans la doc...',
            searchPlaceholder: 'Tapez pour rechercher...',
            searchShortcut: '⌘K',
            searchNoResults: 'Aucun résultat trouvé',
            searchResultsTitle: 'Résultats de recherche',
            copyCode: 'Copier',
            codeCopied: 'Copié !',
            onThisPage: 'Sur cette page',
            relatedDocs: 'Documents associés',
            lastUpdated: 'Dernière mise à jour',
            previous: 'Précédent',
            next: 'Suivant',
            backToTop: 'Retour en haut',
            expandAll: 'Tout développer',
            collapseAll: 'Tout réduire',
            menu: 'Menu',
            closeMenu: 'Fermer le menu',
            tableOfContents: 'Table des matières',
            readingTime: '{{min}} min de lecture',
            home: 'Accueil',
            editPage: 'Modifier cette page',
            version: 'Version',
            language: 'Langue',
      },

      // ─── Info Blocks ────────────────────────────────────────────
      info: {
            note: 'Note',
            tip: 'Conseil',
            warning: 'Avertissement',
            danger: 'Danger',
      },

      // ─── API Table ──────────────────────────────────────────────
      api: {
            method: 'Méthode',
            endpoint: 'Endpoint',
            description: 'Description',
            auth: 'Auth',
            authRequired: 'Requise',
            noAuth: 'Public',
            permission: 'Permission',
      },

      // ─── Navigation Categories ──────────────────────────────────
      nav: {
            getStarted: 'Démarrer',
            tutorials: 'Tutoriels',
            architecture: 'Architecture',
            features: 'Fonctionnalités',
            frontend: 'Modules Frontend',
            security: 'Sécurité',
            apiReference: 'Référence API',
            infrastructure: 'Infrastructure',
      },

      // ─── Get Started ────────────────────────────────────────────
      getStarted: {
            overview: {
                  title: 'Vue d\'ensemble',
                  description: 'Bienvenue dans la documentation de la plateforme Verified ERP.',
                  hero: 'Développez des applications d\'entreprise plus rapidement',
                  heroSub: 'Une plateforme Modular Monolith prête pour la production avec un backend .NET 10, un frontend Next.js et tout ce dont vous avez besoin pour créer des applications d\'entreprise évolutives.',
                  whatIs: 'Qu\'est-ce que la plateforme Verified ?',
                  whatIsText: 'Verified est une plateforme ERP de niveau entreprise construite avec une architecture Modular Monolith. Elle fournit une base éprouvée pour des applications métier complexes avec authentification, autorisation, multi-tenancy, journalisation d\'audit et un panneau d\'administration complet — le tout prêt à l\'emploi.',
                  keyFeatures: 'Fonctionnalités clés',
                  keyFeaturesText: 'La plateforme comprend un ensemble complet de fonctionnalités conçues pour les applications d\'entreprise.',
                  feature1Title: 'Architecture Modular Monolith',
                  feature1Text: 'Séparation claire des responsabilités avec des modules isolés pouvant être développés et testés indépendamment. Le backend utilise CQRS avec MediatR, le frontend suit le pattern SOLID View/ViewModel.',
                  feature2Title: 'Sécurité entreprise',
                  feature2Text: 'Contrôle d\'accès basé sur les rôles (RBAC) avec mise en cache côté serveur des permissions, sécurité au niveau des champs, portée des données, 2FA, gestion des sessions et pistes d\'audit complètes.',
                  feature3Title: 'Multi-tenancy',
                  feature3Text: 'Gestion intégrée des locataires avec structures hiérarchiques, données isolées, paramètres par locataire et permissions à portée de locataire.',
                  feature4Title: 'Solution Full-Stack',
                  feature4Text: 'Backend .NET 10 avec EF Core, frontend Next.js 16 avec TanStack Query v5, gestion d\'état Zustand et un puissant moteur CRUD générique.',
                  techStack: 'Stack technologique',
                  backendStack: 'Backend',
                  frontendStack: 'Frontend',
                  quickLinks: 'Liens rapides',
                  quickLink1: 'Guide de démarrage rapide',
                  quickLink2: 'Aperçu de l\'architecture',
                  quickLink3: 'Premier tutoriel',
            },
            prerequisites: {
                  title: 'Prérequis',
                  description: 'Exigences et outils nécessaires avant de commencer.',
                  intro: 'Avant de commencer, assurez-vous que les outils suivants sont installés sur votre machine de développement.',
                  required: 'Outils requis',
                  dotnet: '.NET 10 SDK',
                  dotnetText: 'Nécessaire pour compiler et exécuter le backend. Téléchargez depuis le site officiel .NET.',
                  nodejs: 'Node.js 20+ et npm',
                  nodejsText: 'Nécessaire pour le frontend. Nous recommandons la dernière version LTS.',
                  database: 'SQL Server (ou PostgreSQL/Oracle)',
                  databaseText: 'Le backend supporte plusieurs fournisseurs de bases de données. SQL Server est le choix par défaut.',
                  ide: 'IDE / Éditeur de code',
                  ideText: 'Visual Studio 2022+ ou VS Code avec l\'extension C# pour le backend. VS Code recommandé pour le frontend.',
                  optional: 'Outils optionnels',
                  git: 'Git',
                  gitText: 'Pour le contrôle de version et le clonage du dépôt.',
                  docker: 'Docker',
                  dockerText: 'Pour exécuter la base de données dans un conteneur (optionnel mais recommandé).',
                  postman: 'Postman / Thunder Client',
                  postmanText: 'Pour tester manuellement les endpoints de l\'API.',
            },
            quickStart: {
                  title: 'Démarrage rapide',
                  description: 'Lancez la plateforme en 5 minutes.',
                  intro: 'Suivez ces étapes pour cloner, configurer et exécuter la plateforme sur votre machine locale.',
                  step1Title: 'Cloner le dépôt',
                  step1Content: 'Clonez le dépôt sur votre machine locale avec Git.',
                  step2Title: 'Configurer la base de données',
                  step2Content: 'Mettez à jour la chaîne de connexion dans le fichier de configuration du backend.',
                  step3Title: 'Exécuter les migrations',
                  step3Content: 'Appliquez les migrations du schéma de base de données pour créer toutes les tables.',
                  step4Title: 'Démarrer le backend',
                  step4Content: 'Lancez le serveur API du backend.',
                  step5Title: 'Démarrer le frontend',
                  step5Content: 'Installez les dépendances et lancez le serveur de développement frontend.',
                  step6Title: 'Accéder à l\'application',
                  step6Content: 'Ouvrez votre navigateur et accédez à l\'application. Utilisez les identifiants admin par défaut pour vous connecter.',
                  defaultCredentials: 'Identifiants par défaut',
                  successTip: 'Si tout est correctement configuré, vous devriez voir le tableau de bord admin. L\'administrateur par défaut dispose de toutes les permissions.',
            },
            projectStructure: {
                  title: 'Structure du projet',
                  description: 'Comprendre l\'arborescence des deux projets.',
                  intro: 'La plateforme Verified est organisée en monorepo avec deux projets principaux. Chacun suit une architecture modulaire.',
                  backendTitle: 'Structure du backend',
                  backendText: 'Le backend suit une architecture Modular Monolith avec le pattern CQRS.',
                  frontendTitle: 'Structure du frontend',
                  frontendText: 'Le frontend suit une architecture modulaire avec le pattern SOLID View/ViewModel.',
                  keyDirectories: 'Répertoires clés expliqués',
            },
      },

      // ─── Tutorials ──────────────────────────────────────────────
      tutorials: {
            firstBackendModule: {
                  title: 'Créer votre premier module (Backend)',
                  description: 'Guide étape par étape pour créer un nouveau module backend avec CQRS.',
            },
            firstFrontendModule: {
                  title: 'Créer votre premier module (Frontend)',
                  description: 'Construisez un module frontend suivant le pattern SOLID View/ViewModel.',
            },
            addEntity: {
                  title: 'Ajouter une entité de domaine',
                  description: 'Créez une nouvelle entité de domaine avec validation et support d\'audit.',
            },
            addCommand: {
                  title: 'Ajouter une Command (CQRS)',
                  description: 'Créez une command avec handler, validation et behaviors de pipeline.',
            },
            addQuery: {
                  title: 'Ajouter une Query (CQRS)',
                  description: 'Créez une query avec handler et mapping de réponse.',
            },
            addPermissions: {
                  title: 'Ajouter des permissions',
                  description: 'Insérer des permissions et protéger les endpoints avec RBAC.',
            },
            addApiEndpoint: {
                  title: 'Ajouter un endpoint API',
                  description: 'Créez un endpoint de contrôleur avec documentation Swagger et authentification.',
            },
            apiIntegration: {
                  title: 'Intégration API frontend',
                  description: 'Connectez votre module frontend à l\'API backend.',
            },
      },

      // ─── Architecture ───────────────────────────────────────────
      architecture: {
            overview: {
                  title: 'Aperçu de l\'architecture',
                  description: 'Vue de haut niveau de l\'architecture de la plateforme.',
            },
            backend: {
                  title: 'Architecture backend',
                  description: '.NET 10 Modular Monolith avec CQRS et DDD.',
            },
            frontend: {
                  title: 'Architecture frontend',
                  description: 'Next.js monolithe modulaire avec patterns SOLID.',
            },
            cqrs: {
                  title: 'Pattern CQRS',
                  description: 'Implémentation du Command Query Responsibility Segregation.',
            },
            modules: {
                  title: 'Système de modules',
                  description: 'Comment les modules sont structurés et isolés.',
            },
            solidPattern: {
                  title: 'SOLID View/ViewModel',
                  description: 'Le pattern SOLID pour les vues et view models du frontend.',
            },
            stateManagement: {
                  title: 'Gestion de l\'état',
                  description: 'TanStack Query pour l\'état serveur, Zustand pour l\'état UI.',
            },
            dataFlow: {
                  title: 'Flux de données',
                  description: 'Comment les données circulent de l\'UI à la base de données et inversement.',
            },
      },

      // ─── Features ───────────────────────────────────────────────
      features: {
            authentication: {
                  title: 'Authentification',
                  description: 'Connexion admin et utilisateur, tokens JWT, flux de rafraîchissement.',
                  overview: 'Vue d\'ensemble',
                  overviewText: 'Le système d\'authentification fournit une connexion sécurisée pour les administrateurs et les utilisateurs réguliers. Il utilise des tokens d\'accès JWT avec mise en cache côté serveur des permissions pour l\'autorisation.',
                  flowTitle: 'Flux d\'authentification',
                  loginFlow: 'Flux de connexion',
                  loginFlowText: 'Lorsqu\'un admin se connecte, le système valide les identifiants, vérifie la 2FA, génère les tokens JWT et met en cache les permissions côté serveur.',
                  endpoints: 'Endpoints de l\'API',
                  backendImpl: 'Implémentation backend',
                  frontendImpl: 'Intégration frontend',
                  securityFeatures: 'Fonctionnalités de sécurité',
                  tipSecurity: 'Les permissions sont mises en cache côté serveur (pas dans le JWT). Les changements de permissions prennent effet immédiatement sans nécessiter de rafraîchissement du token.',
                  accountLockout: 'Verrouillage de compte',
                  accountLockoutText: 'Après 5 tentatives de connexion échouées, le compte est verrouillé pendant 15 minutes. Cela prévient les attaques par force brute.',
            },
            twoFactorAuth: {
                  title: 'Authentification à deux facteurs',
                  description: 'Configuration 2FA basée sur TOTP, vérification et récupération.',
            },
            sessionManagement: {
                  title: 'Gestion des sessions',
                  description: 'Suivi des sessions actives, informations sur l\'appareil et révocation de session.',
            },
            profileManagement: {
                  title: 'Gestion du profil',
                  description: 'Mises à jour du profil, upload d\'avatar, changement de mot de passe.',
            },
            adminManagement: {
                  title: 'Gestion des administrateurs',
                  description: 'CRUD admin, attribution de rôles, usurpation d\'identité et opérations en masse.',
            },
            roleManagement: {
                  title: 'Gestion des rôles',
                  description: 'CRUD des rôles avec attribution de permissions et clonage.',
            },
            permissionSystem: {
                  title: 'Système de permissions',
                  description: 'RBAC avec mise en cache côté serveur et sécurité au niveau des champs.',
            },
            tenantManagement: {
                  title: 'Gestion des locataires',
                  description: 'CRUD multi-locataire, hiérarchie, paramètres et logos.',
            },
            menuSystem: {
                  title: 'Système de menus',
                  description: 'Gestion dynamique des menus avec réorganisation et contrôles de visibilité.',
            },
            dashboardAnalytics: {
                  title: 'Tableau de bord et analyses',
                  description: 'KPI, graphiques, événements de sécurité et export de données.',
            },
            auditLogging: {
                  title: 'Journalisation d\'audit',
                  description: 'Piste d\'audit complète avec pipeline à 4 sources.',
            },
            recycleBin: {
                  title: 'Corbeille',
                  description: 'Visualiseur d\'enregistrements supprimés avec capacité de restauration.',
            },
            fileManagement: {
                  title: 'Gestion de fichiers',
                  description: 'Upload par morceaux, téléchargement reprise, validation ETag.',
            },
            userAuthentication: {
                  title: 'Authentification utilisateur',
                  description: 'Inscription, vérification email/téléphone, OAuth.',
            },
      },

      // ─── Frontend Modules ───────────────────────────────────────
      frontend: {
            authModule: {
                  title: 'Module d\'authentification',
                  description: 'Flux de connexion, vérification 2FA, gestion des tokens et guards de route.',
            },
            profileModule: {
                  title: 'Module de profil',
                  description: 'Profil admin, paramètres de sécurité, sessions et activité.',
            },
            systemModule: {
                  title: 'Module système',
                  description: 'Les 12 sous-modules système : admin, rôles, permissions, locataires, etc.',
            },
            crudEngine: {
                  title: 'Moteur CRUD',
                  description: 'GenericCrudView, DataTable, formulaires et helpers de colonnes.',
            },
      },

      // ─── Security ───────────────────────────────────────────────
      security: {
            rbac: {
                  title: 'RBAC et permissions',
                  description: 'Contrôle d\'accès basé sur les rôles avec mise en cache côté serveur.',
            },
            fieldLevel: {
                  title: 'Sécurité au niveau des champs',
                  description: 'Restreindre l\'accès à des champs spécifiques par rôle.',
            },
            idEncryption: {
                  title: 'Chiffrement d\'ID',
                  description: 'Obfuscation AES-256 des ID d\'entité pour les APIs publiques.',
            },
            tokens: {
                  title: 'Sécurité des tokens',
                  description: 'Structure JWT, rotation des refresh tokens et révocation de tokens.',
            },
      },

      // ─── API Reference ──────────────────────────────────────────
      apiReference: {
            adminAuth: {
                  title: 'API Auth Admin',
                  description: 'Connexion, rafraîchissement, déconnexion, 2FA, sessions.',
            },
            userAuth: {
                  title: 'API Auth Utilisateur',
                  description: 'Inscription, vérification, connexion, réinitialisation du mot de passe, OAuth.',
            },
            adminManagement: {
                  title: 'API de gestion admin',
                  description: 'CRUD, opérations en masse, attribution de rôles, usurpation.',
            },
            adminManagementApi: {
                  title: 'API de gestion admin',
                  description: 'Opérations CRUD complètes pour la gestion des utilisateurs admin.',
            },
            roles: {
                  title: 'API des rôles',
                  description: 'CRUD des rôles et attribution de permissions.',
            },
            tenants: {
                  title: 'API des locataires',
                  description: 'CRUD des locataires, hiérarchie, paramètres.',
            },
            menus: {
                  title: 'API des menus',
                  description: 'CRUD des menus, réorganisation, visibilité.',
            },
            audit: {
                  title: 'API d\'audit',
                  description: 'Liste des logs d\'audit, détails et export.',
            },
      },

      // ─── Infrastructure ─────────────────────────────────────────
      infrastructure: {
            database: {
                  title: 'Configuration de la base de données',
                  description: 'Configurer SQL Server, PostgreSQL ou Oracle.',
            },
            multiDatabase: {
                  title: 'Support multi-bases de données',
                  description: 'Basculer entre les fournisseurs de bases de données.',
            },
            migrations: {
                  title: 'Migrations',
                  description: 'Exécuter et gérer les migrations de base de données.',
            },
            caching: {
                  title: 'Stratégie de cache',
                  description: 'Cache des permissions, cache des requêtes et invalidation du cache.',
            },
      },
};

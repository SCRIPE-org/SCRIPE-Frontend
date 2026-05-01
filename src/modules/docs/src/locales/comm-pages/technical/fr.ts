/**
 * Docs page locale — FR
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const fr = {
  commercial: {
    performanceBenchmarks: {
      apiIntro:
        "Notre architecture privilégie la vitesse sans sacrifier l'abstraction. Chaque couche de l'API est rigoureusement évaluée pour garantir une allocation minimale et un débit maximal.",
      apiTitle: "Vitesse Soutenue de l'API",
      cachingContent:
        "Nous n'interrogeons pas la base de données à moins que cela ne soit légalement (logiquement) requis. NEXORA met en œuvre une stratégie de mise en cache sophistiquée à plusieurs niveaux. Des caches en mémoire L1 à courte durée de vie interceptent les requêtes simultanées identiques, tandis que le cache Redis L2 distribué fournit un débit de lecture croisé de nœuds massif.",
      cachingTitle: "Mise en Cache Agressive Multi-Niveaux",
      dbTitle: "Optimisation d'Entity Framework",
      description:
        "Des métriques de performances réelles et transparentes, des stratégies d'optimisation et des capacités de mise à l'échelle horizontale.",
      frontendTitle: "Moteur de Rendu Next.js",
      intro:
        "NEXORA n'est pas seulement évolutif ; il est explosivement rapide. En utilisant les dernières améliorations de performances de .NET 9 et une mise en cache distribuée agressive, la plateforme gère des charges simultanées massives avec une efficacité de niveau matériel.",
      scaleTitle: "Échelle Horizontale Infinie",
      tip: "Note de performance : Les Dockerfiles multi-étapes inclus garantissent les empreintes de conteneur les plus réduites possibles, permettant aux clusters d'instances de s'adapter automatiquement en quelques millisecondes.",
      title: "Benchmarks de Performances",
    },
    realTimeCapabilities: {
      dashboardsContent:
        "Arrêtez d'obliger vos utilisateurs à rafraîchir la page. Les tableaux de bord opérationnels se redessinent dynamiquement à la milliseconde exacte où les métriques de base de données sous-jacentes changent, offrant un avantage concurrentiel massif pour les applications d'expédition (dispatch), de trading et de surveillance.",
      dashboardsTitle: "Tableaux de Bord en Direct (Sub-Seconde)",
      description:
        "Intégration de WebSockets de pointe permettant des tableaux de bord en direct sous la seconde, une diffusion à l'échelle du système et un suivi de présence collaboratif.",
      intro:
        "Les applications d'entreprise modernes doivent être vivantes. NEXORA intègre nativement un fond de panier (backplane) SignalR WebSocket distribué et hautement optimisé, fournissant une communication bidirectionnelle en temps réel à des millions de clients simultanés.",
      liveAudit: "Streaming Forensique en Temps Réel",
      liveAuditDesc:
        "Diffusez les journaux de sécurité et d'audit critiques directement vers les tableaux de bord des administrateurs dès qu'ils se produisent globalement.",
      liveCharts: "Rendu Télémétrique Dynamique",
      liveChartsDesc:
        "Les points de données des graphiques s'animent à l'écran au moment même où un événement backend est publié.",
      notificationsContent:
        "Le hub de notification unifié de la plateforme peut transmettre instantanément des alertes transactionnelles, des demandes d'approbation et des avertissements système directement dans l'interface utilisateur React sans interroger le serveur en boucle (polling), réduisant considérablement la charge de la base de données et la consommation de la batterie sur les clients mobiles.",
      notificationsTitle: "Notifications Globales Instantanées",
      presenceTrack: "Suivi de Présence & Verrouillage",
      presenceTrackDesc:
        "Indiquez visuellement lorsqu'un collègue modifie activement une entité spécifique pour éviter les écrasements logiques.",
      scaleTitle: "Échelle Globale Soutenue par Redis",
      securityAlert: "Diffusion Instantanée des Menaces",
      securityAlertDesc:
        "Diffusez les modifications critiques du protocole de sécurité forçant la ré-authentification immédiate des clients.",
      signalrContent:
        "Vous exécutez plusieurs nœuds d'API ? Aucun problème. Notre fond de panier Redis préconfiguré synchronise de manière transparente les messages WebSocket sur l'ensemble de votre cluster Kubernetes, garantissant qu'un utilisateur connecté au nœud A reçoit un message généré par le nœud B.",
      signalrTitle: "Backplane WebSocket Distribué",
      title: "Réactivité en Temps Réel",
    },
    resiliencePatterns: {
      circuitContent:
        "Si une passerelle de paiement tierce se déconnecte, les disjoncteurs (circuit breakers) de NEXORA se 'déclenchent' instantanément après un seuil d'échecs configuré. Cela empêche physiquement votre application d'envoyer des milliers de requêtes vouées à l'échec, laissant au service externe le temps de récupérer tout en permettant à votre application d'échouer rapidement (fail-fast).",
      circuitTitle: "Disjoncteurs Automatisés (Circuit Breakers)",
      configTitle: "Configuration Dynamique des Politiques",
      degradationContent:
        "Lorsqu'une dépendance externe échoue, le système ne plante pas, il se dégrade avec élégance. Si l'API des tarifs d'expédition en direct est inaccessible, NEXORA sert automatiquement les derniers tarifs connus mis en cache, garantissant que les flux de paiement ne sont pas interrompus.",
      degradationTitle: "Dégradation Gracieuse et Élégante",
      description:
        "Tolérance aux pannes de niveau militaire utilisant des pipelines de réessai intelligents, des disjoncteurs automatisés et des stratégies de repli gracieuses.",
      healthContent:
        "NEXORA n'attend pas qu'un utilisateur signale un bug. Le système exécute en permanence des contrôles de santé proactifs sur les bases de données, les caches et les API tierces. Si une dégradation est détectée, il tente automatiquement d'y remédier ou alerte immédiatement DevOps.",
      healthTitle: "Télémétrie de Santé Proactive",
      intro:
        "Dans un environnement d'entreprise distribué, les pannes de réseau ne sont pas une possibilité, elles sont une certitude mathématique. NEXORA est conçu pour survivre à des pannes externes catastrophiques sans compromettre l'expérience utilisateur principale.",
      retryTitle: "Retrait Exponentiel avec Jitter",
      tip: "Conseil Architectural : N'écrivez jamais de blocs try/catch standards pour les appels réseau. Utilisez toujours les intercepteurs HTTP centralisés de Polly injectés dans toute la plateforme.",
      title: "Architecture de Résilience Défensive",
    },
    observabilityMonitoring: {
      alertingContent:
        "Les tableaux de bord visuels ne signifient rien si personne ne les regarde. Configurez des seuils de référence stricts—par exemple, si les erreurs 500 augmentent de manière fulgurante ou si le processeur de la base de données dépasse 80 %—et déclenchez automatiquement les protocoles de réponse aux incidents via Slack ou PagerDuty.",
      alertingTitle: "Alertes Basées sur des Seuils",
      cacheMetrics: "Efficacité du Cache Redis",
      cacheMetricsDesc:
        "Surveillez en permanence la fragmentation de la mémoire, les ratios succès/échecs et les métriques d'éviction pour ajuster les performances.",
      dbMetrics: "Épuisement du Pool de Base de Données",
      dbMetricsDesc:
        "Suivez les connexions actives, les exécutions de requêtes lentes et les temps de compilation des commandes directement depuis EF Core.",
      description:
        "Journalisation structurée forensique, sondes d'intégrité sans temps d'arrêt, métriques Prometheus et traçage distribué OpenTelemetry.",
      healthContent:
        "Sondes de vivacité (liveness) et de préparation (readiness) natives de Kubernetes prêtes à l'emploi. L'API s'auto-rapporte en permanence sur l'état de fonctionnement de la base de données SQL, du cache Redis et des dépendances externes. Si un nœud tombe en panne, l'orchestrateur le retire instantanément de la rotation de l'équilibreur de charge.",
      healthTitle: "Sondes Natives Kubernetes",
      intro:
        "Vous ne pouvez pas gérer ce que vous ne pouvez pas mesurer. NEXORA intègre une pile d'observabilité d'élite, offrant aux ingénieurs SRE et aux équipes DevSecOps des informations médico-légales (forensics) en temps réel sur le comportement distribué de la plateforme.",
      loggingContent:
        "Les journaux textuels traditionnels sont inutiles à grande échelle. NEXORA utilise Serilog pour générer des journaux d'événements JSON profondément structurés, les enrichissant automatiquement avec des ID de corrélation, des contextes de locataire et des noms de machines pour une interrogation immédiate dans Datadog ou ELK.",
      loggingTitle: "Journalisation Forensique Structurée",
      metricsIntro:
        "En intégrant les protocoles standards OpenTelemetry, NEXORA expose des milliers de métriques de plateforme internes directement à vos tableaux de bord Prometheus et Grafana existants.",
      metricsTitle: "Intégration OpenTelemetry",
      requestMetrics: "Débit des Requêtes API",
      requestMetricsDesc:
        "Surveillez les centiles de latence (p95, p99), les tailles de la charge utile et les durées d'exécution précises par point de terminaison.",
      tip: "Conseil Exécutif : Implémentez le traçage distribué pour suivre le parcours d'une seule requête utilisateur de manière transparente à travers tous les microservices déployés.",
      title: "Observabilité & Télémétrie",
      tracingContent:
        "Dans un déploiement de microservices, un seul clic peut traverser cinq services isolés. Le traçage distribué injecte et propage des ID de corrélation via les en-têtes HTTP, vous permettant de cartographier visuellement des parcours de requêtes complexes et d'identifier instantanément le service créant le goulot d'étranglement.",
      tracingTitle: "Traçage Distribué Inter-Services",
      userMetrics: "Vélocité d'Authentification",
      userMetricsDesc:
        "Suivez les connexions réussies, les tentatives de force brute et l'activité de locataires spécifiques en temps réel.",
    },
    testingStrategy: {
      ci1Content:
        "Isolation absolue de l'environnement d'exécution. À chaque Pull Request, le pipeline d'intégration continue (CI) restaure de manière déterministe les chaînes d'outils du compilateur à l'intérieur d'un conteneur Linux stérile et hermétiquement fermé, s'assurant que l'excuse 'ça marche sur ma machine' est mathématiquement éradiquée.",
      ci1Title: "1. Initialisation d'Environnement Stérile",
      ci2Content:
        "Exécutez la suite xUnit à une vitesse fulgurante en utilisant des référentiels intelligemment simulés (mocked). Cela garantit que la logique métier CQRS pure de la couche Application est examinée et certifiée en quelques millisecondes sans établir de connexion physique à la base de données.",
      ci2Title: "2. Validation de la Logique Pure",
      ci3Content:
        "Injectez des bases de données Docker éphémères à l'aide de Testcontainers. Cela garantit que les projections LINQ d'EF Core, les filtres de requête globaux et les migrations physiques de base de données s'exécutent de manière irréprochable sur de véritables moteurs SQL avant de s'autodétruire.",
      ci3Title: "3. Télémétrie d'Intégration Éphémère",
      ci4Content:
        "Déclenchez des clusters massifs de navigateurs Playwright. Des travailleurs Chromium (sans interface / headless) s'attaquent sans relche à l'interface utilisateur Next.js compilée, interagissant agressivement avec chaque composant React pour certifier définitivement le parcours utilisateur (user journey) de bout en bout.",
      ci4Title: "4. Automatisation Cross-Browser Automatisée",
      ciContent:
        "Tester sans automatisation absolue est une responsabilité (liability). Le dépôt inclus est livré nativement avec un pipeline GitHub Actions / GitLab CI massivement parallélisé. Il barricade activement la branche `main`, rejetant physiquement tout code qui viole les limites du domaine, échoue aux assertions mathématiques ou déclenche une régression.",
      ciTitle: "Pipelines de Sécurité & d'Intégrité Continus",
      description:
        "Une analyse profonde de la pyramide de tests NEXORA : assertions unitaires CQRS ultra-rapides, intégrations de bases de données Docker éphémères et automatisation impitoyable de l'interface utilisateur avec Playwright.",
      e2eContent:
        "Les tests d'acceptation par les utilisateurs (UAT) ne doivent pas reposer sur l'erreur humaine. Nous intégrons Playwright pour lancer des clusters d'exécution Chromium headless. Ces clusters simulent des interactions utilisateurs massives et très complexes—exécutant des flux complets d'intégration multi-tenant, validant l'état des composants React, et s'assurant que l'interface utilisateur reste parfaitement résiliente dans des conditions chaotiques agressives avant que l'assurance qualité (QA) manuelle n'y touche.",
      e2eTitle: "Automatisation de Navigateur (E2E) Implacable",
      integrationContent:
        "Simuler (Mocker) massivement la base de données conduit à de faux positifs dangereux. NEXORA déploie Testcontainers pour provisionner, exécuter et détruire dynamiquement des instances physiques réelles de PostgreSQL et Redis spécifiquement pour chaque suite de tests. Cela garantit que vos schémas EF Core sont testés sur une véritable infrastructure plutôt que sur des simulations (mocks) en mémoire fragiles.",
      integrationTitle: "Tests d'Infrastructure Éphémère",
      intro:
        "Un bug d'entreprise en cascade coûte des centaines de milliers de dollars en temps d'arrêt systémique. NEXORA impose une stratégie de test impitoyable et mathématiquement étanche. Des tests logiques isolés de Clean Architecture à l'automatisation destructrice de navigateurs headless, chaque octet de code est agressivement examiné et certifié avant d'être fusionné (mergé).",
      pyramidTitle: "La Pyramide Stratifiée de Certification de Code",
      pyramidLvl: "Strate de Certification",
      pyramidTech: "Moteur d'Exécution",
      pyramidScope: "Périmètre de Validation",
      pyrE2E: "Simulation de Bout en Bout (E2E)",
      pyrE2ETech: "Playwright / Travailleurs Chromium",
      pyrE2EScope: "Validation du Parcours Complet (UI à BDD)",
      pyrInt: "Intégration Éphémère",
      pyrIntTech: "WebApplicationFactory + Testcontainers",
      pyrIntScope: "Points de terminaison API & SQL Physique",
      pyrUnit: "Logique Métier Pure",
      pyrUnitTech: "xUnit + Moq + FluentAssertions",
      pyrUnitScope: "Couches Domaine + Application",
      pyrStatic: "Analyse de Code Statique",
      pyrStaticTech: "TypeScript + ESLint + Roslyn",
      pyrStaticScope: "Syntaxe, Règles & Types",
      summaryTitle: "Certitude de Test Mathématique",
      tip: "Directive Architecturale : Ne visez pas les métriques de vanité. Appliquez une ligne de base absolue de 100 % de couverture pour les Entités de Domaine de base et les Gestionnaires CQRS, en utilisant des clusters d'UI Playwright pour couvrir la surface de Présentation.",
      title: "Résilience & Tests Automatisés",
      unitContent:
        "En adhérant rigoureusement aux principes de la Clean Architecture, la logique métier de NEXORA reste physiquement isolée des contextes HTTP et des schémas SQL. Votre équipe d'ingénierie peut exécuter instantanément des milliers de suites de tests xUnit contre les Gestionnaires (Handlers) de base et les Entités de Domaine en quelques millisecondes, maximisant ainsi la vélocité des développeurs et la confiance dans le déploiement.",
      unitTitle: "Exécution Unitaire Isolée Ultra-Rapide",
      lstIntI1: "WebApplicationFactory pour des tests de pipeline HTTP réalistes",
      lstIntI2: "TestContainers pour des instances de bases de données jetables",
      lstIntI3: "Ensemencement (seeding) de données de test et nettoyage automatiques",
      lstIntI4: "Exécution parallèle des tests avec bases de données isolées",
      lstIntI5: "Simulation d'authentification avec des jetons JWT de test",
      tblSumHeader1: "Type de Test",
      tblSumHeader2: "Framework",
      tblSumHeader3: "Cible de Couverture",
      tblSumHeader4: "Fréquence d'Exécution",
      tblSumR1C1: "Unitaire (Backend)",
      tblSumR1C2: "xUnit + FluentAssertions",
      tblSumR1C3: "Couches Domaine + Application",
      tblSumR1C4: "À chaque commit",
      tblSumR2C1: "Unitaire (Frontend)",
      tblSumR2C2: "Vitest + Testing Library",
      tblSumR2C3: "ViewModels + utilitaires",
      tblSumR2C4: "À chaque commit",
      tblSumR3C1: "Intégration",
      tblSumR3C2: "WebApplicationFactory",
      tblSumR3C3: "Points de terminaison API + base de données",
      tblSumR3C4: "À la fusion des PR",
      tblSumR4C1: "E2E (Bout en bout)",
      tblSumR4C2: "Playwright",
      tblSumR4C3: "Flux utilisateurs critiques",
      tblSumR4C4: "Chaque nuit / pré-version",
      tblSumR5C1: "Analyse Statique",
      tblSumR5C2: "ESLint + TypeScript + Roslyn",
      tblSumR5C3: "100% de la base de code",
      tblSumR5C4: "À chaque sauvegarde",
      tblSumR6C1: "Performance",
      tblSumR6C2: "k6 / Artillery",
      tblSumR6C3: "Tests de charge des endpoints",
      tblSumR6C4: "Pré-version",
    },
    storageBackends: {
      configTitle: "Configuration Dynamique des Fournisseurs",
      description:
        "Matrices de stockage binaire abstraites et hyper-évolutives prenant en charge de manière transparente les backends Disque Local, AWS S3, Azure Blob et MinIO.",
      featuresTitle: "Fonctionnalités du Sous-Système de Stockage",
      handlingTitle: "Transmission Sécurisée des Fichiers",
      imageProcessing: "Optimisation d'Image à la Volée (On-The-Fly)",
      imageProcessingDesc:
        "Compressez, redimensionnez et convertissez automatiquement les images téléchargées vers les formats modernes WebP.",
      intro:
        "Les applications d'entreprise génèrent des téraoctets de données binaires. NEXORA abstrait entièrement l'emplacement de stockage physique. Vous pouvez commencer sur un disque local pendant l'incubation et migrer vers des buckets mondiaux AWS S3 en production via une seule chaîne de configuration, sans réécrire un seul module.",
      mig1Content: "Développez à une vitesse fulgurante en utilisant le système de fichiers local.",
      mig1Title: "1. Développement Local",
      mig2Content:
        "Déployez de manière transparente sur l'environnement de préproduction (staging) à l'aide de conteneurs MinIO open-source.",
      mig2Title: "2. Infrastructure de Préproduction",
      mig3Content: "Évoluez à l'infini en production en utilisant AWS S3 ou Azure Blob Storage.",
      mig3Title: "3. Échelle de Production Infinie",
      migrationContent:
        "L'interface `IStorageService` dissocie absolument votre logique métier du fournisseur de cloud. Changer de fournisseur est strictement une opération de configuration d'infrastructure, vous isolant complètement du verrouillage propriétaire (vendor lock-in).",
      migrationTitle: "Indépendance Absolue Vis-à-Vis des Fournisseurs",
      pluggable: "Agnosticisme des Fournisseurs",
      pluggableDesc:
        "Basculez les paradigmes de stockage de manière transparente via des abstractions d'interfaces strictement standardisées.",
      providersIntro:
        "La plateforme injecte dynamiquement le fournisseur de stockage approprié via l'Injection de Dépendances en fonction des variables d'environnement.",
      providersTitle: "Backends de Stockage Pris en Charge",
      resumableDownload: "Téléchargements Multi-Parties",
      resumableDownloadDesc:
        "Diffusez de manière fiable des fichiers massifs à l'échelle du gigaoctet sans planter les nœuds d'API ni épuiser la mémoire.",
      tenantIsolation: "Isolation Cryptographique des Chemins",
      tenantIsolationDesc:
        "Les fichiers sont physiquement regroupés (bucketed) par `[TenantId]`, garantissant une sécurité massive des données.",
      title: "Infrastructure de Stockage Abstraite",
    },
  },
};

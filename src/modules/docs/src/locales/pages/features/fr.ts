/**
 * Docs features — FR
 * Auto-filled 264 keys from EN.
 */
export const fr = {
  features: {
    auditSystem: {
      adminEventsTitle: "Événements de Gestion des Admins",
      architectureTitle: "Architecture d'Audit",
      authEventsTitle: "Événements d'Authentification",
      bulkEventsTitle: "Événements d'Opérations en Lot (Bulk)",
      description:
        "Pipeline à 4 sources, plus de 35 types d'événements, 7 événements Guardian, SignalR en temps réel et export CSV/PDF.",
      endpointsTitle: "Endpoints API d'Audit",
      eventTypesTitle: "Types d'Événements (Plus de 35 Catégories)",
      exportIntro:
        "Les journaux peuvent être exportés en formats CSV, Excel ou PDF avec filtrage de dates et de locataires.",
      exportTitle: "Exportation d'Audit",
      guardianIntro:
        "Les événements Guardian sont des journaux de sécurité créés lorsque le système BLOQUE une opération dangereuse.",
      guardianTitle: "Événements de Protection Guardian",
      intro:
        "SCRIPE capture chaque action significative dans le journal d'audit via AstraFlow mediator, EF Core, les middlewares et les appels de services.",
      rbacEventsTitle: "Événements RBAC",
      realTimeIntro:
        "Chaque événement d'audit est diffusé en temps réel via SignalR aux clients connectés regroupés par leur locataire.",
      realTimeTitle: "Diffusion en Temps Réel (SignalR)",
      retentionTip:
        "Les journaux d'audit sont conservés selon TenantSettings.AuditRetentionDays. Un travail en arrière-plan purge les anciens enregistrements.",
      serviceMethodsIntro:
        "L'interface IAuditService expose 5 méthodes de journalisation asynchrones qui ne bloquent jamais la requête principale.",
      serviceMethodsTitle: "Méthodes de AuditService",
      sessionEventsTitle: "Événements de Session",
      tenantEventsTitle: "Événements des Locataires",
      title: "Système d'Audit",
      twoFactorEventsTitle: "Événements 2FA",
    },
    authentication: {
      adminEntityIntro:
        "L'entité Admin possède plusieurs champs de sécurité critiques contrôlant le verrouillage et la protection du compte.",
      adminEntityTitle: "Entité Admin (Sécurité)",
      description:
        "Authentification double (Admin + Utilisateur), jetons JWT, 2FA avec codes de secours et politique de mot de passe par locataire.",
      dualAuthIntro:
        "SCRIPE dispose de deux pipelines d'authentification distincts : AdminAuthController et UserAuthController, émettant des revendications (claims) différentes.",
      dualAuthTitle: "Double Authentification (Admin et Utilisateur)",
      endpointsAdminTitle: "Endpoints d'Authentification Admin",
      endpointsTitle: "Endpoints API d'Authentification",
      endpointsUserTitle: "Endpoints d'Authentification Utilisateur",
      flowTitle: "Flux d'Authentification",
      intro:
        "SCRIPE fournit un système d'authentification sécurisé avec des jetons (tokens) d'accès JWT, une rotation des jetons d'actualisation (refresh tokens) et une 2FA.",
      jwtIntro:
        "Le système utilise des jetons d'accès de courte durée (15 minutes) avec des jetons d'actualisation de longue durée (7 jours) pivotés à chaque utilisation.",
      jwtTitle: "Configuration des Jetons JWT",
      lockoutWarning:
        "Après 5 tentatives de connexion échouées, le compte est verrouillé pendant 15 minutes.",
      passwordPolicyIntro:
        "Les exigences de mot de passe sont configurables par locataire via TenantSettings.",
      passwordPolicyTitle: "Politique de Mot de Passe par Locataire",
      rateLimitingIntro:
        "Les endpoints d'authentification sont protégés par plusieurs politiques de limitation de débit pour empêcher les attaques par force brute.",
      rateLimitingTitle: "Limitation de Débit (Rate Limiting)",
      title: "Authentification",
      twoFactorIntro:
        "La 2FA est implémentée avec TOTP. Les codes de secours sont hachés avec une protection anti-replay.",
      twoFactorTitle: "Authentification à Deux Facteurs (2FA)",
    },
    dashboardBuilder: {
      archIntro:
        "Le Constructeur de Tableau de Bord est implémenté en 7 fichiers dans la couche Core, suivant le modèle d'architecture basé sur les fournisseurs de SCRIPE.",
      archTip:
        "Pour ajouter un nouveau paramètre, étendez l'interface Settings et defaultSettings dans settings-provider.tsx.",
      archTitle: "Architecture et Cartographie des Fichiers",
      description:
        "Préférences admin synchronisées avec le serveur via un moteur de fusion 4 couches, 61 paramètres configurables, prévention FOUC, résolution de conflits 409 et contrôle de fonctionnalités basé sur les éditions.",
      edgeCasesIntro:
        "Le système de synchronisation gère 5 cas limites critiques couramment rencontrés dans les environnements d'entreprise.",
      edgeCasesTitle: "Protections contre les Cas Limites",
      edgeCasesWarning:
        "La clé PENDING_SETTINGS_FLUSH survit intentionnellement à la déconnexion pour effectuer le flush des paramètres lors de la prochaine connexion.",
      intro:
        "Le Constructeur de Tableau de Bord est le système de préférences d'administration de niveau entreprise de SCRIPE. Il synchronise 61 paramètres de tableau de bord configurables entre le navigateur et le serveur, utilisant un moteur de fusion à 4 couches (Plateforme → Locataire → Admin → Exécution) pour la résolution des paramètres avec contrôle de remplacement basé sur le locataire, persistance inter-appareils via AdminSettingsJson et 5 protections contre les cas limites.",
      mergeEngineIntro:
        "Les paramètres suivent une chaîne de priorité stricte à 4 couches. Chaque couche peut remplacer la précédente, avec un contrôle d'accès optionnel basé sur les chemins au niveau du locataire.",
      mergeEngineNote:
        "La Couche 2 (Restrictions d'Édition) est gérée côté serveur via le pipeline FeatureCheckBehavior.",
      mergeEngineTitle: "Moteur de Fusion à 4 Couches",
      overrideControlIntro:
        "Les administrateurs de locataires peuvent contrôler quels paramètres les administrateurs individuels peuvent personnaliser.",
      overrideControlTitle: "Contrôle de Remplacement Admin",
      overviewIntro:
        "Le Constructeur de Tableau de Bord fournit un cycle de vie complet pour les préférences d'administration — du rendu immédiat depuis le cache à la réconciliation en arrière-plan avec le serveur.",
      overviewTip:
        "Les paramètres sont rendus immédiatement depuis le cache localStorage au chargement de la page. La récupération depuis le serveur s'effectue en arrière-plan.",
      overviewTitle: "Vue d'Ensemble du Système",
      securityIntro:
        "Le Constructeur de Tableau de Bord implémente une sécurité de défense en profondeur pour prévenir les fuites de données entre administrateurs et les dépassements de charge utile.",
      securityTitle: "Modèle de Sécurité",
      settingsRefIntro:
        "Les 61 paramètres sont organisés en 9 sections. Chaque paramètre a un type défini, une valeur par défaut, un attribut de données DOM et un contrôle d'édition optionnel.",
      settingsRefTitle: "Référence des Paramètres (61 Paramètres)",
      syncHookIntro:
        "Le hook useAdminSettingsSync gère le cycle de vie complet des préférences d'administration : chargement initial depuis le cache, flush différé, récupération serveur en arrière-plan et réconciliation silencieuse.",
      syncHookTitle: "Hook de Synchronisation Serveur",
      title: "Constructeur de Tableau de Bord",
    },
    dashboardHub: {
      archIntro:
        "Le Hub du Tableau de Bord utilise un modèle Hub-and-Spoke où la DashboardView principale sert de hub central affichant une barre d'onglets, et chaque onglet charge de manière différée une vue indépendante spécifique au domaine (spoke). L'onglet Vue d'ensemble est intégré pour un rendu instantané. Les onglets Audit, Sécurité et Analytique sont chargés à la demande via React.lazy avec des fallbacks Suspense.",
      archTip:
        "Les sous-vues ne sont chargées de manière différée que lors de la première activation de leur onglet. Cela réduit le bundle initial du tableau de bord d'environ 60% par rapport au chargement eager des quatre vues.",
      archTitle: "Architecture Hub-and-Spoke",
      cachingIntro:
        "Toutes les clés TanStack Query à travers le hub incluent le tenantId actuel comme clé de partition. Cela garantit que lors du changement de locataire, toutes les données du tableau de bord sont automatiquement invalidées et re-récupérées pour le nouveau contexte de locataire.",
      cachingTitle: "Mise en Cache Consciente du Locataire",
      compatIntro:
        "Pour éviter les erreurs de build pendant la migration, DashboardEntities.ts conserve des alias de type dépréciés qui ré-exportent les types des nouveaux modules spécifiques au domaine.",
      compatTitle: "Compatibilité Ascendante",
      compatWarning:
        "Les alias dépréciés doivent être supprimés lors d'une future passe de nettoyage une fois que tous les composants consommateurs auront migré vers l'import depuis leur module de domaine respectif (audit/security/analytics).",
      description:
        "Tableau de bord modulaire à onglets avec sous-modules séparés par domaine (Audit, Sécurité, Analytique), architecture propre en 6 couches par module, interfaces conformes au ISP, chargement différé et visibilité des onglets contrôlée par les permissions.",
      diIntro:
        "Les trois nouveaux modules sont enregistrés dans le SystemContainer (modules/system/di.ts). Chaque module suit le modèle : Service (reçoit IApiService) → Dépôt (reçoit Service) → Déclaration d'interface SystemContainer → Export de getter lazy. Les ViewModels consomment les dépôts exclusivement à travers le conteneur DI.",
      diTip:
        "Les getters lazy dans l'accesseur systemContainer assurent que les services et dépôts ne sont instanciés que lors du premier accès, évitant une surcharge réseau inutile pour les onglets jamais ouverts.",
      diTitle: "Câblage du Conteneur DI",
      domainIntro:
        "Auparavant, toutes les données du tableau de bord transitaient par un seul DashboardRepository (Interface Dieu) avec plus de 8 méthodes couvrant l'audit, la sécurité et l'analytique. L'architecture refactorisée extrait chaque domaine dans un module indépendant avec sa propre interface de dépôt, éliminant le couplage monolithique et respectant le Principe de Ségrégation des Interfaces (ISP).",
      domainNote:
        "Des alias de type rétrocompatibles sont maintenus dans DashboardEntities.ts pour les composants hérités. Ces alias sont marqués @deprecated pour guider le nettoyage futur.",
      domainTitle: "Ségrégation des Domaines (Principe de Ségrégation des Interfaces)",
      hubIntro:
        "Le composant DashboardView sert de hub, affichant une TabsList avec 4 éléments TabsTrigger (Vue d'ensemble, Audit, Sécurité, Analytique). Les onglets Audit et Sécurité sont affichés conditionnellement en fonction des permissions de l'administrateur actuel via le hook usePermission.",
      hubNote:
        "La visibilité des onglets est contrôlée par les permissions côté frontend uniquement à des fins UX. Les endpoints backend imposent la frontière de sécurité réelle — les vérifications frontend sont complémentaires, non autoritatives.",
      hubTitle: "Implémentation du Hub à Onglets",
      intro:
        "Le Hub du Tableau de Bord est le centre de commande opérationnel principal de SCRIPE — une interface à onglets qui agrège quatre vues spécifiques au domaine (Vue d'ensemble, Audit, Sécurité, Analytique) dans un hub unifié. Chaque module de domaine suit une architecture propre stricte en 6 couches (Modèles → Entités → Interfaces → Services → Dépôts → Mappeurs) avec un enregistrement DI dédié. Les sous-vues sont chargées de manière différée via React.lazy et protégées par les permissions.",
      layersIntro:
        "Chaque module extrait (Audit, Sécurité, Analytique) implémente la pile complète d'architecture propre du frontend SCRIPE. Les 6 couches assurent une séparation stricte des responsabilités : les Modèles contiennent les formes de réponse API brutes, les Entités sont des objets de domaine riches avec des propriétés calculées, les Interfaces définissent les contrats, les Services gèrent les appels HTTP via IApiService, les Dépôts orchestrent les services et les mappeurs pour retourner des entités de domaine, et les Mappeurs effectuent la conversion DTO-vers-entité avec coalescence de null.",
      layersTitle: "Architecture Propre en 6 Couches",
      sourceIntro:
        "Le Hub du Tableau de Bord refactorisé s'étend sur 4 modules (dashboard, audit, security, analytics), chacun avec sa propre pile complète de 6 couches.",
      sourceTitle: "Référence des Fichiers Source",
      title: "Hub du Tableau de Bord (Hub-and-Spoke)",
      viewmodelIntro:
        "Chaque hook ViewModel importe maintenant son dépôt dédié du conteneur DI au lieu de partager un unique dépôt de tableau de bord. Cela élimine le couplage inter-domaines : useAuditViewModel consomme uniquement auditRepository, useSecurityDashboardViewModel consomme uniquement securityRepository, et useTenantAnalyticsViewModel consomme uniquement analyticsRepository.",
      viewmodelTitle: "Découplage des ViewModels",
    },
    downloadExport: {
      architectureIntro:
        "Prend en charge les téléchargements par jetons (JWT) ou par sessions (URLs temporaires sans authentification).",
      architectureTitle: "Architecture de Téléchargement",
      description:
        "Téléchargements authentifiés et basés sur des sessions avec prise en charge de Range, cache ETag et protection Path Traversal.",
      endpointsTitle: "Endpoints de Téléchargement",
      etagNote:
        "Si l'ETag correspond, le serveur renvoie 304 Not Modified, économisant ainsi la bande passante.",
      etagTitle: "Mise en Cache ETag",
      pathTraversalNote:
        "Les chemins de fichiers sont aseptisés en supprimant les séquences '..' afin de sécuriser le serveur.",
      pathTraversalTitle: "Prévention contre la Traversée de Répertoire (Path Traversal)",
      resumableIntro:
        "Supporte les en-têtes Range HTTP permettant la mise en pause et la reprise de fichiers partiels (code 206).",
      resumableTitle: "Téléchargements Reprenables (En-têtes Range)",
      sessionIntro:
        "Permet le partage d'URL de téléchargement temporaires aux utilisateurs externes.",
      sessionTitle: "Téléchargements Basés sur Session",
      sessionWarning: "Les sessions de téléchargement expirent et ne peuvent pas être renouvelées.",
      streamConfigTitle: "Configuration FileStream",
      title: "Système de Téléchargement et Exportation",
    },
    emailSystem: {
      architectureIntro:
        "Utilise InMemoryQueue pour le développement et HangfireQueue en production pour garantir l'envoi asynchrone.",
      architectureTitle: "Architecture du Pipeline d'E-mail",
      backgroundIntro:
        "Hangfire crée un travail (job) pour chaque e-mail, rendant le modèle et expédiant le courrier.",
      backgroundTitle: "Modèle de Travailleur d'Arrière-plan (Background Worker)",
      description:
        "Pipeline de distribution d'e-mails enfichable avec stratégies de file d'attente et traitement en arrière-plan.",
      endpointsTitle: "Endpoints du Contrôleur d'E-mails",
      errorIntro:
        "Les e-mails sont nettoyés contre les failles XSS avant envoi. Les échecs entraînent des tentatives répétées avec un délai exponentiel.",
      errorTitle: "Gestion des Erreurs & Nettoyage",
      queueIntro:
        "Détermine comment les e-mails sont mis en attente et traités sans bloquer la requête HTTP de l'utilisateur.",
      queueTitle: "Implémentations de File d'Attente (Queues)",
      senderIntro:
        "ConsoleSender imprime dans le terminal (Dev), tandis que SmtpSender s'occupe de la vraie livraison.",
      senderTitle: "Stratégies d'Envoi",
      title: "Système d'E-mail",
    },
    fileUpload: {
      architectureIntro:
        "Le système sépare le traitement des images (redimensionnement, rognage) du traitement des documents génériques.",
      architectureTitle: "Architecture de Téléchargement",
      description:
        "Pipeline de téléchargement double pour les images et documents avec validation et stockage cloisonné.",
      generalTitle: "Téléchargement de Fichiers Génériques",
      imagePipelineTitle: "Pipeline de Téléchargement d'Images",
      servingNote:
        "Les fichiers téléchargés sont servis via un middleware statique. Les types inconnus sont renvoyés en tant qu'application/octet-stream.",
      servingTitle: "Service de Fichiers Statiques",
      tenantScopedTitle: "Stockage Cloisonné par Locataire",
      title: "Système de Téléchargement de Fichiers (File Upload)",
      validationTitle: "Règles de Validation des Fichiers",
    },
    loginCustomizer: {
      a11yAuditIntro:
        "Le hook useAccessibilityChecker exécute 4 vérifications automatisées en temps réel sur les paramètres du brouillon : validation du Ratio de Contraste (4.5:1 pour le texte, 3:1 pour les grands textes), dimensionnement des Cibles Tactiles (minimum 44×44px), Lisibilité de la Superposition (vérifie que l'opacité n'obscurcit pas le contenu), et paramètres de Mouvement (valide la configuration reduced-motion). Chaque vérification renvoie un niveau de sévérité réussi/avertissement/échec avec des messages actionnables.",
      a11yAuditTitle: "Moteur d'Audit WCAG en Temps Réel",
      a11yAutoFixIntro:
        "Le moteur d'audit inclut une fonction autoFix qui résout automatiquement les vérifications échouées en ajustant les paramètres du brouillon à la conformité WCAG AA. Par exemple, si le ratio de contraste échoue, il ajuste la couleur du texte ; si les cibles tactiles sont trop petites, il augmente la hauteur des boutons à 44px.",
      a11yAutoFixTitle: "Mécanisme de Correction Automatique",
      a11yCat1:
        "Indicateurs de Focus — Couleur personnalisée de l'anneau de focus, largeur (1–5px), décalage et style pour tous les éléments interactifs.",
      a11yCat2:
        "Contraste Élevé — Bascule mode contraste élevé avec remplacements configurables de contraste texte/fond.",
      a11yCat3:
        "Lisibilité du Texte — Mise à l'échelle de la taille de police (80–200%), ajustement de la hauteur de ligne (1.0–2.5), espacement des lettres et des mots.",
      a11yCat4:
        "Mouvement & Animation — Respect de prefers-reduced-motion, contrôle des durées de transition, désactivation indépendante des animations décoratives.",
      a11yCat5:
        "Cibles Tactiles — Application de hauteurs minimales pour boutons et champs (44px minimum WCAG), ajustement du padding des éléments interactifs.",
      a11yCat6:
        "Couleur & Vision — Mode compatible daltonisme, couleurs de liens personnalisées, soulignement permanent des liens et étiquetage des icônes.",
      a11yCat7:
        "Lecteur d'Écran — Injection de landmarks ARIA, annonces de régions dynamiques, liens de navigation rapide et amélioration des labels de formulaires.",
      a11yCat8:
        "Assistance à la Lecture — Guide de lecture configurable, surbrillance de lignes, masque de texte et bascule police adaptée aux dyslexiques.",
      a11yCategoriesTitle: "8 Catégories de Paramètres",
      a11yCssIntro:
        "Le hook useLoginBrandingTokens émet 23+ règles CSS spécifiques à l'accessibilité via une injection de balise <style> unique. Les règles incluent le style des anneaux de focus (--login-focus-ring-*), les remplacements de contraste élevé, la mise à l'échelle des polices, les minimums de cibles tactiles, les superpositions de guide de lecture et les remplacements de la media query reduced-motion. Tous les CSS d'accessibilité se superposent correctement aux styles de marque de base.",
      a11yCssTitle: "Pipeline d'Injection CSS",
      a11yIntro:
        "L'onglet Accessibilité fournit une suite complète de 32 paramètres répartis en 8 catégories, conçue pour rendre la page de connexion entièrement conforme WCAG AA. Tous les paramètres sont stockés dans l'entité StudioDraft et injectés dans la page en direct via le pipeline de jetons CSS. La suite comprend une validation en temps réel, des profils en un clic et un moteur d'audit WCAG automatisé.",
      a11yPreviewIntro:
        "Le LoginPreviewShell affiche les fonctionnalités d'accessibilité en temps réel : les superpositions de guide de lecture/masque se rendent visuellement dans l'iframe de prévisualisation, et un badge d'accessibilité affiche le nombre de fonctionnalités actives. L'aperçu est totalement isolé du système d'authentification.",
      a11yPreviewTitle: "Intégration de l'Aperçu",
      a11yProfile1:
        "Base WCAG AA — Applique les exigences minimales WCAG AA : contraste 4.5:1, cibles tactiles 44px, anneaux de focus visibles.",
      a11yProfile2:
        "Basse Vision — Grandes polices (140%), contraste élevé, texte gras, espacement supplémentaire, indicateurs de focus épais.",
      a11yProfile3:
        "Déficience Motrice — Cibles tactiles surdimensionnées (56px), padding supplémentaire, aucune animation, navigation optimisée clavier.",
      a11yProfile4:
        "Cognitif — Mise en page simplifiée, mouvement réduit, espacement augmenté, guide de lecture, indicateurs de focus clairs.",
      a11yProfile5:
        "Optimisé Lecteur d'Écran — Landmarks ARIA améliorés, régions dynamiques, labels de formulaires, liens de navigation rapide, structure sémantique des titres.",
      a11yProfile6:
        "Réinitialisation — Restaure tous les paramètres d'accessibilité à leurs valeurs par défaut WCAG AA.",
      a11yProfilesIntro:
        "Les profils d'accessibilité préconfigurés appliquent des paramètres par lots instantanément. Chaque profil cible un besoin utilisateur spécifique et peut être personnalisé davantage après application.",
      a11yProfilesTitle: "6 Profils en Un Clic",
      a11yTitle: "Suite d'Accessibilité (WCAG AA)",
      accessIntro:
        "La personnalisation du login suit le modèle de contrôle d'accès basé sur les rôles de SCRIPE. L'ouverture du Studio de Personnalisation nécessite la permission branding.manage. Les Administrateurs Système et les Administrateurs de Locataires avec la permission appropriée peuvent éditer et publier. Les administrateurs réguliers ne peuvent basculer que les préférences personnelles comme le mode clair/sombre. L'activation du mode sécurisé est réservée aux Administrateurs Système uniquement.",
      accessTitle: "Contrôle d'Accès",
      archIntro:
        "Le Personnalisateur de Login suit l'architecture modulaire propre standard de SCRIPE avec les couches domaine, données et présentation. La couche présentation contient le composant StylePanel (UI de configuration), LoginPreviewShell (gestion de l'iframe), le AccessibilityPanel (paramètres et profils WCAG) et le hook useLoginBrandingTokens (pipeline token-vers-CSS). Les composants sont extraits au niveau du module pour prévenir les problèmes de perte de focus lors des re-rendus React.",
      archTip:
        "Les composants BgControls et PresetDots sont intentionnellement définis au niveau du module (pas en ligne) pour empêcher React de démonter/remonter les champs de saisie lors des re-rendus, ce qui causerait une perte de focus à chaque frappe.",
      archTitle: "Architecture du Module",
      bgOverlayIntro:
        "Les contrôles d'arrière-plan et de superposition s'adaptent au type de mise en page sélectionné. Les mises en page pleine page appliquent les arrière-plans et superpositions au conteneur wrapper, tandis que les mises en page divisées limitent les arrière-plans au panneau de marque avec des superpositions de section formulaire indépendantes. Les contrôles de superposition incluent couleur, opacité (0–100%) et flou (0–20px).",
      bgOverlayTitle: "Contrôles d'Arrière-plan & Superposition",
      bgOverlayWarning:
        "Pour les mises en page divisées, la superposition est limitée à la section du formulaire et au panneau de marque indépendamment. Les variables CSS avec une valeur de 0 (ex. opacité) sont correctement émises — le système utilise des vérifications != null plutôt que des vérifications de véracité pour éviter de supprimer les valeurs zéro valides.",
      brandingIntro:
        "Le Panneau de Marque (visible dans les mises en page divisées) fournit des contrôles dédiés pour le côté marque de la page de connexion. Il prend en charge un logo personnalisé, le nom de l'entreprise, le texte d'en-tête, le sous-titre et des contrôles indépendants d'arrière-plan/superposition. La superposition du panneau de marque utilise son propre ensemble de variables CSS (--login-panel-overlay-*) pour un contrôle granulaire séparé de la section formulaire.",
      brandingTitle: "Panneau de Marque",
      description:
        "Personnalisation visuelle de la page de connexion avec 22 mises en page, jetons de design, contrôles de superposition/flou, thèmes clair/sombre, suite d'accessibilité WCAG AA et aperçu en direct isolé — sans aucun code.",
      draftIntro:
        "Le studio implémente un flux de travail sécurisé Brouillon → Aperçu → Publication utilisant le contrôle de concurrence optimiste. Toutes les modifications sont enregistrées comme brouillons (DraftBrandingJson) jusqu'à ce que l'administrateur les publie explicitement. La publication incrémente le compteur SettingsVersion — les publications concurrentes d'autres administrateurs sont rejetées avec un conflit 409. Toute version publiée peut être restaurée depuis les snapshots du journal d'audit.",
      draftNote:
        "La concurrence optimiste empêche la perte de données lors de l'édition simultanée. Si un autre administrateur publie pendant votre édition, votre publication sera rejetée (409), et vous devrez rafraîchir et fusionner vos modifications.",
      draftTitle: "Brouillon / Publier / Revenir",
      intro:
        "Le Studio de Personnalisation du Login de SCRIPE est un puissant éditeur visuel qui permet aux administrateurs de locataires de personnaliser entièrement l'expérience de la page de connexion sans écrire de code. Le studio fournit une interface à panneaux divisés avec des panneaux de configuration à gauche et un aperçu iframe isolé à droite, offrant un retour visuel en temps réel. Le studio comprend 8 onglets de configuration : Apparence, Couleurs, Typographie, Arrière-plan, Superposition, Panneau de Marque, Accessibilité et Avancé. Toutes les modifications sont basées sur des brouillons, nécessitant une publication explicite avant mise en production.",
      layoutsIntro:
        "SCRIPE est livré avec 22 mises en page de connexion prêtes pour la production, organisées en quatre niveaux : les mises en page T1 divisées (6) comportent un panneau de marque dédié à côté du formulaire, les mises en page T2 pleine page (8) utilisent tout le viewport pour des expériences immersives, les mises en page T3 centrées (4) offrent des designs compacts en cartes, et les mises en page T4 spéciales (4) proposent des traitements cinématographiques et artistiques. Chaque mise en page prend en charge des contrôles indépendants d'arrière-plan, de superposition et d'accessibilité.",
      layoutsNote:
        "Les mises en page divisées affichent le composant LoginBranding avec des contrôles indépendants de superposition/flou sur le panneau de marque. Les mises en page pleine page appliquent l'arrière-plan et la superposition à l'ensemble du conteneur. Les mises en page centrées et spéciales ont chacune leurs propres stratégies de rendu. Le changement de mise en page préserve toute la configuration — seule la structure de rendu change.",
      layoutsTitle: "22 Mises en Page de Connexion",
      relatedBuilder:
        "Login Page Builder — Drag-and-drop visual canvas for building custom login page layouts with 14 component types.",
      relatedIntro:
        "The Login Customizer Studio is part of a larger customization ecosystem. See these companion features for complete coverage:",
      relatedMarketplace:
        "Theme Marketplace — Browse, preview, and apply 40 premium branding packages with per-page overrides.",
      relatedMultiPage:
        "Multi-Page Branding — Configure independent branding for Login, Forgot Password, and Reset Password pages.",
      relatedTitle: "Related Features",
      safeModeIntro:
        "Le Mode Sécurisé est un mécanisme de secours d'urgence qui contourne toute la personnalisation de marque du locataire et restaure les paramètres par défaut de la plateforme pour la page de connexion. Lorsque IsSafeMode est défini sur true dans TenantSettings, la page de connexion s'affiche avec le thème SCRIPE par défaut quelle que soit la personnalisation. Cela garantit une expérience de connexion fonctionnelle même si la configuration de marque est corrompue.",
      safeModeTitle: "Mode Sécurisé",
      studioIntro:
        "Le Studio utilise une architecture à panneaux divisés : le panneau gauche contient 8 sections de configuration par onglets (Apparence, Couleurs, Typographie, Arrière-plan, Superposition, Panneau de Marque, Accessibilité, Avancé) tandis que le panneau droit fournit un iframe isolé qui rend la page de connexion avec injection de variables CSS en temps réel via postMessage. Les bascules d'appareils permettent de prévisualiser sur les breakpoints bureau, tablette et mobile.",
      studioTip:
        "Toutes les modifications du studio fonctionnent en mode brouillon. La page de connexion en production n'est jamais affectée jusqu'à ce que vous cliquiez explicitement sur Publier. Vous pouvez expérimenter en toute sécurité avec n'importe quelle combinaison de paramètres.",
      studioTitle: "Vue d'Ensemble du Studio",
      themeIntro:
        "Le Personnalisateur de Login prend en charge des configurations indépendantes pour les modes clair et sombre. Lorsque le mode sombre est activé, un ensemble séparé de variables CSS est émis pour le panneau sombre (--login-dark-*), contrôlant le fond du formulaire, la couleur du texte, le style des champs et la superposition. La bascule mode sombre dans le panneau Apparence permet un contrôle complet du thème sombre sans affecter la configuration claire.",
      themeTitle: "Architecture Thème Clair/Sombre",
      title: "Studio de Personnalisation du Login",
      tokensIntro:
        "Le système de personnalisation repose sur un pipeline complet de jetons de design. Les paramètres du locataire stockés en JSON sont transformés en jetons de design sémantiques, puis émis comme propriétés CSS personnalisées et injectés dans le DOM en direct. Cette architecture assure un style cohérent et typé sur les 22 mises en page, incluant 23+ règles CSS spécifiques à l'accessibilité.",
      tokensTitle: "Pipeline de Jetons de Design",
    },
    loginPageBuilder: {
      archIntro:
        "The Login Page Builder follows SCRIPE's standard modular clean architecture. The builder/ directory contains: BuilderCanvas.tsx (main canvas), ComponentPalette.tsx (sidebar palette), PropertiesPanel.tsx (property editor), GridOverlay.tsx (grid visualization), and BuilderToolbar.tsx (mode switcher, undo/redo, zoom controls). State management uses the useBuilderState hook integrated into useStudioViewModel.",
      archTip:
        "The builder components are intentionally defined as stable, memoized React components to prevent re-renders during drag operations. Each canvas component is wrapped in React.memo with custom equality checks on position and properties.",
      archTitle: "Module Architecture",
      bundleComponentsIntro:
        "BundleGalleryTab (5.6KB) — Gallery tab with type filters (Login, Dashboard, Complete), search, grid, pagination. BundleCard (12.8KB) — Card with accent preview, pricing tier, metadata. BundleDetailModal (8.5KB) — Full detail with apply button. SaveBundleDialog (7.6KB) — Dialog for saving current studio state as a new bundle.",
      bundleComponentsTitle: "Bundle Components",
      bundleIntro:
        "The Bundle Marketplace allows tenants to save their complete studio configuration (login theme + builder layout + dashboard settings + per-page overrides) as a named bundle, and browse/apply bundles created by other tenants or the system. Bundles are displayed in a dedicated tab within the Theme Gallery.",
      bundleTitle: "Bundle Marketplace (Related Feature)",
      bundleTypesIntro:
        "Login Bundle — Contains only login branding (theme tokens + builder layout). Dashboard Bundle — Contains only dashboard settings. Complete Bundle — Contains everything: login branding, builder layout, per-page overrides, dashboard settings, and accessibility configuration. Complete bundles provide one-click full-workspace setup.",
      bundleTypesTitle: "Bundle Types",
      compBadge:
        "Badge — Small label/tag element. Properties: text, variant (default, success, warning, destructive), size.",
      compButton:
        "Button — Clickable action button. Properties: text, variant (primary, secondary, outline, ghost), size, width (auto, full), icon, link URL, border radius.",
      compCard:
        "Card — Container with background, border, and shadow. Properties: background color, border radius, shadow, padding. Can contain other components (nested layout).",
      compDivider:
        "Divider — Visual separator line. Properties: color, thickness, width, margin, style (solid, dashed, dotted, gradient).",
      compFooter:
        "Footer — Page footer with links and copyright text. Properties: links array, copyright text, alignment, font size, color.",
      compForm:
        "Form — The login form component containing email/password inputs and submit button. Properties: show labels, show placeholders, input style, button text, remember me checkbox, forgot password link.",
      compHeading:
        "Heading — Large display text for page titles and headlines. Properties: text content, font size, font weight, color, alignment, HTML tag (h1–h6). Supports dynamic variables ({tenantName}).",
      compIcon:
        "Icon — SVG icon from the built-in icon library. Properties: icon name, size, color, rotation, link URL.",
      compImage:
        "Image — Display any image on the canvas. Properties: src (URL), alt text, width, height, object-fit, border radius, shadow. Supports all web image formats.",
      compLogo:
        "Logo — Displays the tenant's logo image. Properties: src (URL), alt text, width, height, alignment, link URL. Supports SVG, PNG, and WebP formats.",
      compSocialLogin:
        "Social Login — Pre-built social authentication buttons (Google, Microsoft, Apple, GitHub). Properties: providers (multi-select), layout (horizontal, vertical, icon-only), separator text.",
      compSpacer:
        "Spacer — Invisible spacing element. Properties: height (in px). Used to create vertical gaps between components without manual positioning.",
      compTermsLink:
        "Terms & Privacy — Pre-built links to Terms of Service and Privacy Policy pages. Properties: terms URL, privacy URL, text template, font size, color.",
      compText:
        "Text — General-purpose paragraph text. Properties: content, font size, color, line height, alignment, max width. Supports rich text with bold, italic, and links.",
      dashboardColorsIntro:
        "Default, Zinc, Slate, Stone, Neutral, Red, Rose, Orange, Green, Blue, Violet, and Yellow. Each color theme defines the dashboard's accent color palette applied to the sidebar, headers, buttons, and active states.",
      dashboardColorsTitle: "12 Color Themes",
      dashboardIntro:
        "The Dashboard Theming panel in the Customizer Studio allows tenants to configure their admin dashboard's visual defaults. Settings include layout template (8 options), color theme (12 options), theme mode (light/dark/system), default language, and sidebar default state. Dashboard theming uses the same draft/publish workflow as login branding.",
      dashboardLayoutsIntro:
        "Default, Navigation, Classic, Compact, Elegant, Floating, Modern, and Minimal. Each template defines the dashboard shell structure: sidebar position, header style, content width, and navigation pattern.",
      dashboardLayoutsTitle: "8 Layout Templates",
      dashboardStorageIntro:
        "Dashboard settings are stored in the dashboardThemeJson field of DraftBrandingJson as a JSON object: { layoutTemplate, colorTheme, mode, language, sidebarDefaultState }. On publish, the settings are promoted to the tenant's live configuration.",
      dashboardStorageTitle: "Storage Format",
      dashboardTitle: "Dashboard Theming (Related Feature)",
      description:
        "No-code drag-and-drop visual canvas with 3 design modes (Freeform, Grid, Builder), 14 component types, a 12-column responsive grid system, real-time preview sync, and JSON serialization.",
      dndIntro:
        "The builder uses @dnd-kit/core (not react-beautiful-dnd) for drag-and-drop interactions. Components are dragged from the palette sidebar and dropped onto the canvas. The DragOverlay renders a ghost preview of the component during drag. Drop zones are highlighted with blue outlines when a draggable component hovers over them.",
      dndPaletteIntro:
        "1. User drags a component type from the palette sidebar. 2. @dnd-kit creates a DragOverlay with a preview of the component. 3. The canvas renders drop zone indicators (grid cells in Grid mode, free areas in Freeform mode). 4. On drop, a new component instance is created with default properties and added to the builder state. 5. The component is rendered on the canvas at the drop position.",
      dndPaletteTitle: "Palette → Canvas Flow",
      dndReorderIntro:
        "Existing components on the canvas can be reordered by dragging. In Grid mode, components snap to grid cells. In Builder mode, components reorder within their section (header/body/footer). In Freeform mode, components move to the exact drop coordinates.",
      dndReorderTitle: "Canvas Reordering",
      dndSelectIntro:
        "Clicking a component on the canvas selects it, displaying a blue selection border and resize handles. The Properties Panel on the right sidebar loads the selected component's editable properties. Pressing Delete/Backspace removes the selected component. Escape deselects.",
      dndSelectTitle: "Component Selection",
      dndTitle: "Drag-and-Drop Architecture",
      gridGapIntro:
        "The grid gap (spacing between cells) is configurable globally: columnGap and rowGap properties, each accepting pixel values (default: 16px). This ensures consistent spacing across all grid items without manual padding on individual components.",
      gridGapTitle: "Gap Configuration",
      gridIntro:
        "The Grid Mode uses a responsive 12-column CSS grid layout. Each component occupies a configurable number of columns (1–12) and rows. The grid supports gap spacing, column alignment (start, center, end, stretch), and row alignment. The grid is fully responsive — column spans can be configured independently for desktop (lg), tablet (md), and mobile (sm) breakpoints.",
      gridPropsIntro:
        "Each component in Grid mode has additional grid-specific properties: colSpan (1–12 columns), rowSpan (number of rows), colStart (starting column), rowStart (starting row), alignment (start/center/end/stretch), and responsive overrides (sm/md/lg column spans). These properties are configured via the Properties Panel.",
      gridPropsTitle: "Grid Component Properties",
      gridResponsiveIntro:
        "The grid supports 3 breakpoints: Desktop (lg, ≥1024px), Tablet (md, 768–1023px), and Mobile (sm, <768px). Each component can have independent column spans per breakpoint. For example, a logo might span 4 columns on desktop but 12 columns (full width) on mobile. The preview iframe respects these breakpoints when device toggles are used.",
      gridResponsiveTitle: "Responsive Breakpoints",
      gridTitle: "12-Column Grid System",
      intro:
        "The Login Page Builder is SCRIPE's most advanced customization tool — a fully visual, drag-and-drop canvas that allows tenant administrators to build custom login page layouts without writing any code. The builder provides 3 design modes (Freeform, Grid, and Builder), a palette of 14 pre-built component types (from logos and headings to social login buttons and footer links), a responsive 12-column CSS grid system, real-time two-way sync with the preview iframe, and full JSON serialization for persistence. The builder integrates seamlessly with the Login Customizer Studio's design token pipeline, ensuring that builder-created layouts inherit all theme colors, typography, and accessibility settings.",
      modeBuilderIntro:
        "Structured block-based layout with predefined sections. Components are organized into vertical sections (header, body, footer) with automatic stacking and reordering via drag-and-drop. Best for quick layout assembly with predictable, clean results. Builder mode enforces structural constraints — components snap to section boundaries and maintain consistent spacing.",
      modeBuilderTitle: "Builder Mode",
      modeFreeformIntro:
        "Absolute positioning with pixel-level control. Components can be placed anywhere on the canvas and dragged to exact coordinates. Best for creative, non-standard layouts where design freedom is paramount. Components have x/y position, width, height, and z-index properties.",
      modeFreeformTitle: "Freeform Mode",
      modeGridIntro:
        "Responsive 12-column CSS grid layout. Components are placed into grid cells with configurable column span (1–12), row positioning, alignment, and gap spacing. The grid ensures consistent, responsive layouts that adapt to desktop, tablet, and mobile breakpoints. This is the recommended mode for enterprise deployments where cross-device consistency is critical.",
      modeGridTitle: "Grid Mode (12-Column)",
      modesIntro:
        "The builder offers three distinct canvas modes, each providing a different level of control over layout positioning. Users can switch between modes at any time — components are preserved during mode switches.",
      modesNote:
        "Grid mode is the default for new configurations. It provides the best balance between design flexibility and responsive consistency. Freeform mode is intended for advanced users who need pixel-perfect control.",
      modesTitle: "3 Canvas Modes",
      paletteIntro:
        "The component palette provides 14 pre-built, configurable UI components that can be dragged onto the canvas. Each component has a set of editable properties (text content, styling, behavior) accessible via the Properties Panel when selected.",
      paletteTitle: "14 Component Types",
      previewIntro:
        "Every canvas change is immediately reflected in the sandboxed preview iframe. The builder emits postMessage events containing the current component array and canvas mode. The preview page receives these events, reconstructs the layout, and renders the components with live CSS variable injection from the active theme.",
      previewSyncIntro:
        "The sync is bidirectional: canvas changes propagate to preview (via postMessage), and device toggle changes in the preview header propagate back to the builder (updating responsive breakpoint indicators). This ensures the builder canvas accurately reflects how the layout will appear at each breakpoint.",
      previewSyncTitle: "Two-Way Sync",
      previewTitle: "Real-Time Preview Sync",
      propsContentIntro:
        "Text inputs for content: headline text, paragraph text, button labels, URLs, alt text. Supports variable interpolation with {variableName} syntax for dynamic tenant data.",
      propsContentTitle: "Content Properties",
      propsGridIntro:
        "Grid-specific layout controls (Grid mode only): column span slider (1–12), row span, column start, row start, alignment select, and responsive breakpoint overrides. A visual grid preview shows the component's position within the 12-column grid.",
      propsGridTitle: "Grid Properties",
      propsIntro:
        "The Properties Panel is a contextual sidebar that appears when a component is selected on the canvas. It displays all editable properties for the selected component type, organized into sections: Content (text, URLs), Layout (width, height, alignment), Style (colors, borders, shadows), and Grid (column span, row span, responsive breakpoints). Changes in the Properties Panel update the canvas in real-time.",
      propsStyleIntro:
        "Visual styling controls: color pickers, border radius sliders, shadow toggles, opacity controls, font size selectors. Style properties that overlap with theme tokens (e.g., primaryColor) can be set to 'inherit from theme' to maintain consistency.",
      propsStyleTitle: "Style Properties",
      propsTitle: "Properties Panel",
      securityIframeIntro:
        "The preview iframe uses the sandbox attribute with restricted permissions: allow-scripts (for CSS variable injection), allow-same-origin (for postMessage). Forms are non-functional — the preview renders visual-only representations of auth components.",
      securityIframeTitle: "Iframe Sandboxing",
      securityIntro:
        "The Login Page Builder enforces strict security constraints on user-generated content. All text content is HTML-sanitized before rendering (no script injection). Image URLs are validated to prevent SSRF. The builder canvas runs in a sandboxed iframe with restrictive CSP headers. Custom CSS injection is not supported — styling is controlled exclusively through the design token pipeline.",
      securitySanitizeIntro:
        "All text properties (headings, paragraphs, button labels) are sanitized using DOMPurify before rendering in the preview. HTML tags are stripped — only plain text is stored. URLs are validated against a whitelist of allowed protocols (https, http) to prevent javascript: and data: injection.",
      securitySanitizeTitle: "Input Sanitization",
      securityTitle: "Security Constraints",
      serializationIntro:
        "The builder state is serialized as a JSON array and stored in the builderComponentsJson field of the tenant's DraftBrandingJson. The canvasMode (freeform/grid/builder) is stored as a separate field. On publish, the builder state is promoted to LiveBrandingJson alongside all other branding tokens.",
      serializationSchemaIntro:
        "The stored JSON follows this structure: { canvasMode: 'freeform' | 'grid' | 'builder', gridConfig: { columns: 12, columnGap: 16, rowGap: 16 }, components: [ { id, type, props, position, gridPosition, section, order, responsive } ] }. The schema is versioned for forward compatibility.",
      serializationSchemaTitle: "Serialized Schema",
      serializationSizeIntro:
        "Default property values are NOT stored — only properties that differ from the component type's defaults are serialized. This keeps the JSON payload compact (typically 2–5KB for a complex layout with 10+ components).",
      serializationSizeTitle: "Storage Optimization",
      serializationTitle: "JSON Serialization & Persistence",
      stateComponentIntro:
        "Each BuilderComponent is a serializable object: { id: string, type: ComponentType, props: Record<string, unknown>, position: { x: number, y: number }, gridPosition: { colSpan: number, rowSpan: number, colStart: number, rowStart: number }, section: 'header' | 'body' | 'footer', order: number, responsive: { sm: GridOverride, md: GridOverride } }.",
      stateComponentTitle: "BuilderComponent Schema",
      stateIntro:
        "The builder maintains a flat array of BuilderComponent objects in the StudioDraft. Each component has: id (unique UUID), type (one of 14 types), properties (key-value map), position (x, y for Freeform), gridPosition (col, row, colSpan, rowSpan for Grid), and section (header/body/footer for Builder mode). The entire array is serialized as JSON in the builderComponentsJson field of DraftBrandingJson.",
      stateTitle: "Canvas State Management",
      stateUndoIntro:
        "The builder maintains a history stack for undo/redo operations. Each action (add, move, resize, delete, property change) pushes a snapshot to the stack. Ctrl+Z undoes the last action, Ctrl+Shift+Z redoes. The history stack has a configurable depth limit (default: 50 actions).",
      stateUndoTitle: "Undo/Redo Support",
      title: "Login Page Builder",
    },
    menuSystem: {
      architectureIntro:
        "Structure en arbre autoréférencée. Les menus passent par 6 filtres successifs avant d'être renvoyés au frontend.",
      architectureTitle: "Architecture des Menus",
      description:
        "Arbre de menus dynamique avec filtrage de permissions, visibilité des rôles et réorganisation par glisser-déposer.",
      endpointsTitle: "Endpoints API des Menus",
      entityTitle: "Entité MenuItem",
      filteringIntro:
        "S'assure que les administrateurs ne voient que les menus auxquels leur rôle et leur locataire leur donnent accès.",
      filteringTitle: "Pipeline de Filtrage des Menus",
      overrideNote:
        "Les remplacements spécifiques aux utilisateurs sont prioritaires sur ceux du locataire.",
      overrideTitle: "Système de Remplacement (Override)",
      reorderTitle: "Réorganisation par Glisser-Déposer",
      title: "Système de Menus",
    },
    messageTemplates: {
      architectureIntro:
        "Gère les e-mails, les notifications et les webhooks à l'aide de la syntaxe Scriban (similaire à Liquid).",
      architectureTitle: "Architecture des Modèles",
      builtInTitle: "Modèles Intégrés",
      description:
        "Modèles bilingues basés sur Scriban avec aperçu de données et schémas d'espaces réservés.",
      endpointsTitle: "Endpoints API des Modèles",
      entityTitle: "Entité MessageTemplate",
      previewIntro:
        "Rend la conception HTML/texte avec de fausses données pour tester la forme visuelle avant l'envoi de l'e-mail.",
      previewTitle: "Fonctionnalité d'Aperçu",
      rendererTitle: "Moteur de Rendu des Modèles",
      syntaxTitle: "Syntaxe des Modèles Scriban",
      title: "Modèles de Messages (Templates)",
    },
    multiPageBranding: {
      conflictIntro:
        "Multi-Page Branding includes safeguards to prevent visual inconsistency. When the global design changes (e.g., a new font family), all pages that inherit from the global automatically update — only explicitly overridden tokens remain unchanged. The studio displays a 'Customized' badge on page tabs that have overrides, making it clear which pages have independent configurations.",
      conflictTitle: "Conflict Prevention & Consistency",
      conflictWarning:
        "When a global token is changed (e.g., primaryColor), pages with overrides that include the same token will NOT update — the override takes precedence. This is intentional. To propagate a global change to overridden pages, use the 'Reset to Global' action on those pages first.",
      description:
        "Independent visual customization for Login, Forgot Password, and Reset Password pages — shared design tokens with per-page overrides, isolated preview, and theme integration.",
      intro:
        "Multi-Page Branding extends SCRIPE's Login Customizer Studio to support independent visual configurations for all three authentication pages: Login, Forgot Password, and Reset Password. Instead of forcing a single visual identity across all auth flows, Multi-Page Branding allows tenants to present context-appropriate messaging, layouts, and visual treatments for each page. A shared global design provides consistency, while per-page overrides enable targeted differentiation — all managed through the same zero-code studio interface.",
      pageForgot:
        "Forgot Password Page — The password recovery entry point. Users enter their email to receive a reset link. This page benefits from reassuring messaging ('We'll help you get back in') and softer visual treatments that convey trust and care.",
      pageLogin:
        "Login Page — The primary authentication entry point. Users enter their credentials (email + password) to access the platform. This page receives the most visual attention as it creates the first impression of the tenant's brand.",
      pageReset:
        "Reset Password Page — The password change confirmation page. Users set a new password using the link from their email. This page benefits from action-oriented messaging ('Create your new password') and clear, focused layouts that minimize distraction.",
      pagesIntro:
        "SCRIPE's authentication system exposes three distinct pages, each serving a different user intent. Multi-Page Branding allows independent customization of all three while maintaining visual consistency through shared design tokens.",
      pagesNote:
        "Each page can independently configure: layout, headline, subtitle, background, overlay, and any design token. Tokens not explicitly overridden inherit from the global configuration — enabling 'configure once, override selectively' workflow.",
      pagesTitle: "Supported Authentication Pages",
      previewIntro:
        "Each auth page is previewed in the same sandboxed iframe used by the Login Customizer Studio. When the user switches to a different page tab, the preview URL changes to the corresponding auth route, and new CSS variables (merged from global + page override) are injected via postMessage. The preview supports desktop, tablet, and mobile breakpoints for all three pages.",
      previewIsolationIntro:
        "The preview iframe runs in a completely isolated context — separate from the admin panel's authentication state. This prevents the preview from triggering real login/logout actions. The preview pages are purpose-built components that render the auth UI with injected CSS variables but no authentication logic.",
      previewIsolationTitle: "Preview Isolation",
      previewTitle: "Sandboxed Preview Architecture",
      serializationIntro:
        "Per-page overrides are stored in the tenant's DraftBrandingJson alongside the global configuration. The JSON structure contains a top-level 'pageOverrides' object with 'login', 'forgotPassword', and 'resetPassword' keys. Each key maps to a flat token object. On publish, the entire structure (global + pageOverrides) is promoted to LiveBrandingJson.",
      serializationSchemaIntro:
        "The DraftBrandingJson stores: { selectedLayout, primaryColor, ...(all global tokens), pageOverrides: { login: { panelHeadline, panelSubtitle, ... }, forgotPassword: { selectedLayout, panelHeadline, overlayColor, ... }, resetPassword: { selectedLayout, panelHeadline, ... } } }. Only non-null override tokens are persisted — empty pages are not stored to save space.",
      serializationSchemaTitle: "Stored JSON Schema",
      serializationTitle: "Data Serialization & Persistence",
      sourceComponents:
        "Components: AuthPageTabs.tsx (tab strip), StylePanel.tsx (sidebar with per-page routing)",
      sourceSeeder:
        "Backend: LoginThemeSeeder.cs (PageOverrideDesign records, BuildFullThemeJson pages serialization)",
      sourceStudio: "Studio: useStudioViewModel.ts (page state, merge logic, previewTheme())",
      sourceTitle: "Source File Reference",
      sourceTypes:
        "Types: StudioDraft.ts (pageOverrides interface), ThemeTypes.ts (page override type definitions)",
      stateGlobalIntro:
        "The global layer contains all 50+ design tokens: colors, typography, spacing, overlay, dark mode, and branding panel settings. These tokens apply to ALL auth pages by default. The global layer is always defined — it is never empty.",
      stateGlobalTitle: "Global Layer (Shared Tokens)",
      stateIntro:
        "Multi-Page Branding uses a layered state model. The global StudioDraft contains the base configuration for all pages. Each page has an optional override object (pageOverrides.login, pageOverrides.forgotPassword, pageOverrides.resetPassword) that stores only the tokens that differ from the global. This minimizes storage and simplifies diff tracking.",
      stateMergeIntro:
        "When the studio switches to a specific page tab, the effective configuration is computed as: effectiveConfig = { ...globalDraft, ...pageOverrides[currentPage] }. This spread-merge ensures that page-specific overrides take precedence while all unspecified tokens fall through to the global values. The merge is performed in the previewTheme() function and in the CSS token emission pipeline.",
      stateMergeNote:
        "The merge is a shallow spread — nested objects (like darkColors or overlay) are replaced entirely, not deep-merged. This is intentional: if a page overrides the overlay, it should control the complete overlay configuration, not inherit partial values from the global.",
      stateMergeTitle: "Runtime Merge Strategy",
      stateOverrideIntro:
        "Each page's override layer contains ONLY the tokens that differ from the global configuration. For example, if the Forgot Password page has a different headline and subtitle but shares all colors and typography, only panelHeadline and panelSubtitle are stored in the override. Empty fields inherit from the global layer.",
      stateOverrideTitle: "Page Override Layer (Per-Page Tokens)",
      stateTitle: "State Isolation Model",
      studioEditIntro:
        "When a user modifies a setting while a non-login page is active (e.g., Forgot Password), the change is saved to pageOverrides.forgotPassword — not to the global draft. The studio tracks which page is active and routes edits accordingly. This ensures that changing the forgot-password headline does not affect the login page's headline.",
      studioEditTitle: "Per-Page Editing",
      studioIntro:
        "The Customizer Studio sidebar includes a page tab strip (AuthPageTabs component) that allows switching between Login, Forgot Password, and Reset Password. When the active tab changes, the studio loads the corresponding page override (if any) and merges it with the global draft for preview. The preview iframe navigates to the selected auth page route.",
      studioResetIntro:
        "Each page tab includes a 'Reset to Global' action that removes all per-page overrides for that page, reverting it to the global configuration. This is useful when a tenant wants to undo page-specific customizations and restore visual consistency across all auth pages.",
      studioResetTitle: "Reset to Global",
      studioSwitchIntro:
        "When a user switches tabs: 1. The activePage state is updated to 'login', 'forgotPassword', or 'resetPassword'. 2. The sidebar panels reload with merged values (global + page override). 3. The preview iframe receives an updated postMessage with the merged CSS variables. 4. The iframe URL changes to the corresponding auth route (e.g., /login-preview, /forgot-password-preview, /reset-password-preview). 5. Any changes made in the sidebar are saved to the page override, not the global draft.",
      studioSwitchTitle: "Tab Switching Flow",
      studioTabsIntro:
        "The AuthPageTabs component renders a horizontal tab bar with 3 tabs (Login, Forgot Password, Reset Password). Each tab displays the page name and an optional 'Customized' badge if per-page overrides exist. Clicking a tab updates the activePage state in the studio, triggers a preview refresh, and loads the page-specific sidebar panel settings.",
      studioTabsTitle: "AuthPageTabs Component",
      studioTitle: "Studio Integration — Page Tabs",
      themeCompatIntro:
        "Themes without a 'pages' block are fully backward-compatible. The absence of page overrides means all three auth pages use the global design — the same behavior as themes created before the Multi-Page Branding feature. No migration is required for existing themes.",
      themeCompatTitle: "Backward Compatibility",
      themeImportIntro:
        "The previewTheme() function checks for the 'pages' key in the theme's ThemeDataJson. If found, it extracts the forgotPassword and resetPassword objects and stores them as pageOverrides. If the theme does not include page overrides, the existing pageOverrides are preserved (or cleared, depending on the apply mode).",
      themeImportTitle: "Page Override Import",
      themeIntro:
        "When a marketplace theme includes per-page overrides (pages.forgotPassword, pages.resetPassword), the previewTheme() function in useStudioViewModel.ts automatically imports those overrides into the studio's pageOverrides state. This means applying a theme with per-page branding instantly populates all three auth pages with the theme's intended visual treatment.",
      themeTitle: "Theme Marketplace Integration",
      title: "Multi-Page Branding",
    },
    multiTenancy: {
      architectureTitle: "Architecture",
      auditGroup: "Configuration d'Audit",
      autoRoleIntro:
        "Lorsqu'un nouveau locataire est créé, le système crée automatiquement les rôles Super Admin et Default.",
      autoRoleTitle: "Création Automatique de Rôles",
      brandingGroup: "Image de Marque (Branding)",
      cascadeDeleteIntro:
        "La suppression d'un locataire impacte l'arbre entier. Un endpoint permet de chiffrer les descendants impactés avant l'action.",
      cascadeDeleteTitle: "Protection contre la Suppression en Cascade",
      description:
        "Isolation des données au niveau des lignes, locataires hiérarchiques, paramètres par locataire et image de marque personnalisée.",
      domainArchIntro:
        "Lorsqu'une requête arrive, le système résout le locataire en recherchant le nom d'hôte dans la table TenantDomain. Les domaines générés automatiquement (ex. sofa.scripe.com) sont toujours vérifiés et résolus immédiatement. Les domaines personnalisés doivent d'abord passer la vérification DNS. Un mécanisme de repli utilisant le paramètre de requête ?code= est disponible pour les environnements de développement où le DNS n'est pas configuré.",
      domainArchTitle: "Architecture de Résolution de Domaines",
      domainConfigIntro:
        "Chaque valeur liée aux domaines est configurable via la section Tenancy dans appsettings.json. Cela signifie que vous pouvez renommer entièrement la plateforme — en changeant le domaine de base, la cible CNAME, le préfixe de vérification et le préfixe de jeton — en éditant un seul bloc de configuration. Aucun changement de code requis. Le backend injecte TenancySettings via IOptions<T>, et le frontend reçoit la cible CNAME et le préfixe de vérification de la réponse API GET /domains.",
      domainConfigTip:
        "Pour déployer sur un domaine complètement différent (ex. myplatform.io au lieu de scripe.com), mettez simplement à jour les 4 valeurs dans appsettings.json. Tous les sous-domaines générés automatiquement, les instructions DNS et les jetons de vérification utiliseront automatiquement les nouvelles valeurs.",
      domainConfigTitle: "Domaine de Plateforme Configurable",
      domainDnsIntro:
        "Les domaines personnalisés nécessitent une vérification DNS pour prouver la propriété. Lorsqu'un administrateur ajoute un domaine personnalisé, le système génère un jeton de vérification unique. L'administrateur configure ensuite deux enregistrements DNS : un enregistrement CNAME pointant le domaine vers le CnameTarget de la plateforme, et un enregistrement TXT à {VerificationPrefix}.{domain} contenant le jeton de vérification. Une fois configuré, cliquer sur 'Vérifier' déclenche une requête DNS pour confirmer la présence des deux enregistrements.",
      domainDnsNote:
        "La vérification DNS est actuellement un processus piloté par l'interface utilisateur où l'administrateur clique sur 'Vérifier' pour déclencher la vérification. Le backend est prêt pour l'intégration complète de la résolution DNS. Les domaines générés automatiquement ignorent complètement la vérification — ils sont toujours fiables.",
      domainDnsTitle: "Flux de Vérification DNS",
      domainEndpointsTitle: "Points d'Accès API de Domaines",
      domainIntro:
        "Chaque locataire peut avoir plusieurs domaines — un sous-domaine généré automatiquement lors de la création du locataire, plus des domaines personnalisés optionnels ajoutés par les administrateurs. Le système prend en charge la vérification de domaine basée sur DNS pour prouver la propriété des domaines personnalisés avant qu'ils ne deviennent actifs. Toute la configuration liée aux domaines est entièrement externalisée dans appsettings.json, permettant un rebranding transparent et des configurations multi-déploiement.",
      domainTitle: "Gestion des Domaines",
      domainTypesTitle: "Types de Domaines",
      endpointsCrudTitle: "Endpoints CRUD",
      endpointsDrilldownTitle: "Endpoints d'Analyse (Drill-Down)",
      endpointsHierarchyTitle: "Endpoints de Hiérarchie",
      endpointsPermissionsTitle: "Endpoints de Permissions",
      endpointsSettingsTitle: "Endpoints de Paramètres",
      endpointsTitle: "Endpoints API des Locataires",
      featureBranding: "Image de Marque (Branding)",
      featureBrandingDesc: "Logo, couleurs et personnalisation d'interface propre à chaque entité.",
      featureDataScoping: "Portée des Données",
      featureDataScopingDesc:
        "Toutes les données métier sont automatiquement liées au locataire, sans risque de fuite.",
      featureIsolation: "Isolation des Données",
      featureIsolationDesc:
        "Isolation au niveau des lignes ajoutant automatiquement WHERE TenantId = @CurrentTenant.",
      featureRoleScoping: "Portée des Rôles",
      featureRoleScopingDesc: "Les rôles créés sont cloisonnés au locataire.",
      featureSettings: "Paramètres par Locataire",
      featureSettingsDesc:
        "Quotas, politiques de sécurité et audits indépendants pour chaque locataire.",
      featuresTitle: "Fonctionnalités du Locataire (Tenant)",
      featureUserScoping: "Portée des Utilisateurs",
      featureUserScopingDesc:
        "Les administrateurs d'un locataire ne voient et ne gèrent que leurs propres utilisateurs.",
      hierarchyIntro:
        "Les locataires forment une structure arborescente (Parent/Enfant), permettant de gérer des succursales et des départements.",
      hierarchyTitle: "Hiérarchie des Locataires",
      intro:
        "SCRIPE prend en charge une architecture multi-locataire complète avec isolation des données à l'aide des filtres de requêtes globaux d'EF Core.",
      logoTip:
        "Les logos des locataires sont servis via le middleware de fichiers statiques sur /storage/tenants/{tenantId}/logo.{ext}.",
      permissionInheritanceIntro:
        "Lors de la création d'un locataire enfant, le parent ne peut accorder que les permissions qu'il possède déjà.",
      permissionInheritanceTitle: "Héritage des Permissions",
      quotaGroup: "Paramètres de Quotas",
      securityGroup: "Politiques de Sécurité",
      settingsIntro:
        "Chaque locataire possède une entité TenantSettings 1:1 avec 4 groupes de configuration.",
      settingsTitle: "Paramètres du Locataire",
      title: "Multi-locataire (Multi-Tenancy)",
    },
    notificationSystem: {
      architectureIntro:
        "Les notifications sont persistées en base de données et poussées instantanément au navigateur de l'utilisateur via le NotificationHub.",
      architectureTitle: "Architecture des Notifications",
      autoJoinTitle: "Modèle de Rejoignement Automatique (Auto-Join)",
      clientInterfaceTitle: "Interface Client du Hub",
      description:
        "Livraison de notifications en temps réel via SignalR avec auto-rejoignement de groupes et historique.",
      endpointsTitle: "Endpoints API de Notifications",
      hubIntro:
        "Le hub SignalR fortement typé connecte automatiquement l'utilisateur à son propre canal sécurisé.",
      hubTitle: "NotificationHub",
      serviceTitle: "Méthodes de NotificationService",
      title: "Système de Notifications",
    },
    recycleBin: {
      cascadeIntro:
        "Restaure en masse une entité et ses descendants (ex: un locataire et ses administrateurs) en utilisant ExecuteUpdateAsync.",
      cascadeTitle: "Restauration en Cascade",
      description:
        "Gestion de la suppression logique (soft-delete) avec restauration en cascade et purge permanente.",
      endpointsTitle: "Endpoints API de la Corbeille",
      executeUpdateTitle: "ExecuteUpdateAsync vs EF Classique",
      ignoreFiltersTitle: "Modèle IgnoreQueryFilters",
      ignoreFiltersWarning:
        "Il contourne TOUS les filtres globaux (y compris le filtre du locataire). Combinez-le toujours avec une clause Where de filtrage du locataire.",
      interceptorNote:
        "Cette opération ultra-rapide contourne le mécanisme EF classique et ne génère donc pas de journaux d'audit automatiques.",
      purgeVsRestoreTitle: "Purger vs Restaurer",
      purgeWarning: "La purge est une opération destructrice et irréversible (DELETE SQL réel).",
      softDeleteIntro:
        "La colonne IsDeleted est passée à vrai, et l'entité est masquée par les filtres de requête globaux de la base de données.",
      softDeleteTitle: "Comment fonctionne la Suppression Logique",
      title: "Corbeille (Recycle Bin)",
    },
    rolePermissions: {
      authPipelineIntro:
        "Le DynamicPermissionPolicyProvider crée des politiques d'autorisation ASP.NET Core à la volée à partir des attributs.",
      authPipelineTitle: "Pipeline d'Autorisation",
      cloneRoleIntro:
        "Pour éviter l'escalade de privilèges, un rôle cloné ne reçoit que les permissions que l'administrateur clonateur possède également.",
      cloneRoleTitle: "Clonage de Rôle (Anti-Escalade)",
      description:
        "Système RBAC avec remplacement de portée (scope override), restrictions au niveau des champs et rôles cloisonnés par locataire.",
      endpointsMyTenantTitle: "Endpoints de Mon Locataire",
      endpointsPermissionsTitle: "Endpoints des Permissions",
      endpointsTitle: "Endpoints API des Rôles",
      hierarchyTitle: "Hiérarchie des Permissions",
      intro:
        "SCRIPE met en œuvre un système complet de contrôle d'accès basé sur les rôles (RBAC) mis en cache côté serveur pour des performances optimales.",
      restrictedFieldsIntro:
        "Les rôles peuvent restreindre l'accès à des champs spécifiques (ex: masquer 'salaire' ou 'numéro de sécurité sociale') dans les réponses de l'API.",
      restrictedFieldsTitle: "Restrictions au Niveau des Champs",
      rolePropertiesIntro:
        "Le comportement et la protection des rôles sont gérés par des drapeaux (flags) du système.",
      rolePropertiesTitle: "Propriétés de l'Entité Rôle",
      scopeOverrideIntro:
        "Chaque RolePermission peut remplacer la portée par défaut, contrôlant l'accès aux données de manière fine.",
      scopeOverrideTitle: "Remplacement de Portée (Scope Override)",
      systemIntro:
        "Les permissions sont organisées en catégories suivant le modèle {resource}.{action}.",
      systemTitle: "Système de Permissions",
      tenantScopingNote:
        "Les rôles sont automatiquement cloisonnés au locataire de l'utilisateur actuel.",
      title: "Rôles et Permissions (RBAC)",
      userGroupEndpointsTitle: "Endpoints API des Groupes d'Utilisateurs",
      userGroupsIntro:
        "Les Groupes d'Utilisateurs permettent l'affectation par lots de rôles et de restrictions à plusieurs administrateurs à la fois.",
      userGroupsNote:
        "Les groupes d'utilisateurs sont additifs : les permissions effectives sont l'UNION des rôles directs et des rôles hérités des groupes.",
      userGroupsTitle: "Groupes d'Utilisateurs",
    },
    ssoOauth: {
      config1Content:
        "Accédez à /settings/identity-providers. Entrez l'URL d'autorité, le Client ID et le Secret Azure AD ou Google. SCRIPE négocie automatiquement la configuration OIDC.",
      config1Title: "1. Associer un Fournisseur d'Identité Externe",
      config2Content:
        "Configurez les scopes demandés (openid, profile, email). SCRIPE mappe automatiquement les claims JWT externes vers les profils internes sans saisie manuelle.",
      config2Title: "2. Mappage Automatique des Claims",
      config3Content:
        "Décidez si le fournisseur est pour les Administrateurs (back-office) ou Les Utilisateurs (front-office). Les liaisons d'identité empêchent une élévation de privilèges externe.",
      config3Title: "3. Appliquer les Politiques IAM",
      config4Content:
        "Accédez à /settings/oauth-apps pour faire de SCRIPE le fournisseur SSO de logiciels externes. Définissez des profils Public (SPA) ou Confidentiel (Backend).",
      config4Title: "4. Enregistrer des Applications Tiers",
      config5Content:
        "Les applications externes pointent simplement leur Autorité sur `https://votre-instance-scripe.com`. SCRIPE expose automatiquement les terminaux `/.well-known/openid-configuration` et `/.well-known/jwks`.",
      config5Title: "5. Découverte et Uri Jwks",
      configContent: "Configuration de SCRIPE comme passerelle d'authentification principale :",
      configTitle: "Guide de Configuration IAM",
      description:
        "Serveur d'authentification de niveau entreprise capable de remplacer Keycloak, Okta et Auth0. Fournisseurs d'identité OIDC natifs, enregistrement d'applications OAuth, application de PKCE et fédérations de locataires isolées.",
      feat1Desc:
        "Associez instantanément des fournisseurs d'identité OIDC/OAuth2 externes à des locataires spécifiques. Intégration sans code pour Azure AD, Google, Okta, Auth0, AWS Cognito ou tout système compatible OIDC.",
      feat1Title: "Fournisseurs d'Identité Fédérés (IdP)",
      feat2Desc:
        "Remplacez Keycloak. Enregistrez des systèmes métiers tiers directement dans SCRIPE. Générez des identifiants et des secrets clients, contrôlez les scopes et émettez des JWT d'entreprise adossés au stockage d'identité de SCRIPE.",
      feat2Title: "SCRIPE en tant que Serveur (Apps OAuth)",
      feat3Desc:
        "Le Flux Implicite est éradiqué. Toute l'authentification (interne et externe) est strictement appliquée via Proof Key for Code Exchange (PKCE) sur des flux de code d'autorisation. Les secrets ne fuient jamais vers le navigateur.",
      feat3Title: "PKCE et Sécurité Stricts",
      feat4Desc:
        "Chaque locataire est son propre royaume IAM isolé. Les locataires gèrent leurs propres fournisseurs SSO externes et émettent des informations d'identification pour leurs propres applications OAuth sans toucher à l'infrastructure racine mondiale.",
      feat4Title: "Isolement IAM Multi-Locataires",
      intro:
        "SCRIPE n'est pas seulement une application ; c'est un serveur de gestion des identités et des accès (IAM) d'entreprise basé sur OpenIddict. Il fonctionne de manière équivalente à Keycloak, agissant à la fois comme client OIDC et comme serveur d'autorisation actif OAuth2/OIDC. Les locataires peuvent s'authentifier vers l'extérieur avec Azure AD/Google, ou vers l'intérieur en enregistrant des systèmes tiers qui s'authentifient auprès de SCRIPE.",
      loginFlowContent:
        "Lors de la connexion via Azure AD: SCRIPE agit en tant que Client. Il redirige l'utilisateur vers Azure, accepte le retour, valide le JWT externe puis émet SON PROPRE JWT interne, déconnectant l'autorisation interne du fournisseur externe.",
      loginFlowTitle: "Architecture OIDC",
      managementContent:
        "SCRIPE propose un Centre de Contrôle IAM dédié au sein des Paramètres Système pour l'agrégation OIDC et la configuration de l'émission des serveurs.",
      managementTitle: "Centre de Contrôle IAM",
      overviewTitle: "Fonctionnalités IAM d'Entreprise",
      scopingContent:
        "SCRIPE reproduit le concept de Realm de Keycloak via les Partitions de Locataires. Les fournisseurs d'identité et applications OAuth sont formellement liés à leur TenantId. Les SuperAdmins gèrent tous les royaumes via 'Entrer dans le monde du Locataire'.",
      scopingTip:
        "Contrairement aux produits SaaS classiques, SCRIPE ne mélange pas les configurations. Si le Locataire A se connecte à son Azure AD corporatif, le Locataire B n'a aucune visibilité sur cette infrastructure.",
      scopingTitle: "Partitionnement du Royaume (Locataires)",
      title: "Serveur SSO et OAuth (Alternative à Keycloak)",
    },
    themeMarketplace: {
      applyIntro:
        "Applying a marketplace theme follows a 5-step pipeline: 1. User clicks Apply on a theme. 2. Frontend reads the theme's ThemeDataJson. 3. previewTheme() in useStudioViewModel merges the design tokens (including per-page overrides) into the current StudioDraft. 4. The merged draft is saved to the tenant's DraftBrandingJson via PUT /tenants/{id}/settings. 5. Admin publishes the draft to make it live.",
      applyTitle: "Theme Application Flow",
      archDataFlowIntro:
        "1. LoginThemeSeeder.cs seeds 40 themes at application startup (upsert-safe). 2. ThemesController exposes GET /themes (list), GET /themes/{id} (detail), POST /themes/{id}/apply (apply). 3. Frontend ThemeMarketplaceService calls the API via IApiService. 4. ThemeMarketplaceMapper converts DTOs to domain entities. 5. ThemeMarketplaceRepository orchestrates services + mappers. 6. useThemeMarketplace hook provides ViewModel state. 7. ThemeGalleryView renders the marketplace UI.",
      archDataFlowTitle: "Data Flow Pipeline",
      archIntro:
        "The Theme Marketplace follows a pipeline architecture: backend seeder populates the LoginTheme table with 40 records → API exposes paginated list, detail, and apply endpoints → frontend gallery renders themes with advanced filtering → apply action snapshots the ThemeDataJson into tenant's DraftBrandingJson → publish propagates to LiveBrandingJson. Each layer is fully decoupled.",
      archLayersIntro:
        "The marketplace follows SCRIPE's standard 3-layer module structure: Domain layer (ThemeDetail entity, IThemeMarketplaceRepository, IThemeMarketplaceService interfaces), Data layer (ThemeMarketplaceService, ThemeMarketplaceRepository, ThemeMarketplaceMapper, ThemeMarketplaceTypes models), and Presentation layer (ThemeGalleryView, ThemeManagementView, ThemeDetailModal, ThemeCard, useThemeMarketplace hook).",
      archLayersTitle: "Clean Architecture Layers",
      archTitle: "Marketplace Architecture",
      catalogDiversityIntro:
        "The 40-theme catalog achieves maximum diversity across multiple axes: each theme uses a unique Google Font pairing, no two themes share the same color palette, all 7 categories are represented, and the layout distribution covers T1 Split (16), T2 Full-Page (12), T3 Centered (6), and T4 Special (6). This ensures every tenant can find a theme that matches their brand identity.",
      catalogDiversityTitle: "Design Diversity Matrix",
      catalogIntro:
        "SCRIPE ships with 40 meticulously designed branding packages. Each theme is a unique visual identity crafted for a specific market segment or brand aesthetic. Themes span 7 categories, use 30+ different Google Fonts, cover all 22 layouts, and include per-page branding overrides for Login, Forgot Password, and Reset Password.",
      catalogTitle: "40-Theme Catalog Overview",
      catCorporate:
        "Corporate — Professional business identity. Clean lines, serif/sans-serif font pairs, subtle gradients, blue/navy/gray palettes. Designed for financial services, consulting, law firms.",
      catCreative:
        "Creative — Bold, expressive identity. Vibrant colors, playful typography (Poppins, Quicksand), animated gradients, modern card layouts. Designed for agencies, startups, tech companies.",
      catDark:
        "Dark — Sophisticated dark-mode-first identity. Deep backgrounds (slate, zinc, charcoal), accent-driven highlights (cyan, amber, rose), premium glass effects. Designed for developer tools, media, gaming.",
      categoriesIntro:
        "Every theme belongs to exactly one category. Categories enable intuitive gallery browsing and filtering. The distribution ensures broad coverage: Corporate (8), Creative (6), Dark (6), Minimal (5), Elegant (5), Luxury (5), Nature (5).",
      categoriesTitle: "7 Theme Categories",
      catElegant:
        "Elegant — Refined, luxurious identity. Rose gold, champagne, pearl gradients, serif typography (Playfair Display, Cormorant), delicate overlays. Designed for beauty, fashion, hospitality.",
      catLuxury:
        "Luxury — Ultra-premium brand identity. Black/gold/platinum palettes, display typography (Italiana, Cinzel Decorative), full-bleed imagery, art-directed layouts. Designed for high-end brands, private banking, exclusive services.",
      catMinimal:
        "Minimal — Reductive, content-focused identity. Monochromatic palettes, generous whitespace, thin borders, system-optimized typography. Designed for productivity tools, documentation, SaaS platforms.",
      catNature:
        "Nature — Organic, earth-inspired identity. Forest greens, terracotta, ocean blues, botanical accents, rounded shapes, warm serif typography. Designed for sustainability, wellness, organic brands.",
      compDetailModal:
        "ThemeDetailModal (28KB) — Richly detailed theme preview modal. Contains: full-size preview image, design token summary (colors, fonts, spacing), feature matrix (dark mode, per-page, overlay), category/tier badges, Apply button with confirmation dialog, and like/favorite toggles.",
      compGalleryView:
        "ThemeGalleryView (26KB) — Full-page marketplace with animated hero section, category filter chips, search bar, grid/list view toggle, tier filter tabs, sort controls (popular/newest/name), infinite scroll pagination, and a responsive 3-column grid of ThemeCard components.",
      compManagementView:
        "ThemeManagementView (12KB) — Admin CRUD page for managing system themes. DataTable with columns: thumbnail, name, category, tier, status, likes, applies, actions. Supports create, edit, activate/deactivate, and bulk operations.",
      compMarketplacePanel:
        "ThemeMarketplacePanel — Inline panel within the Customizer Studio sidebar. Shows a compact gallery of themes with quick-apply functionality. Allows browsing and applying themes without leaving the studio.",
      componentsIntro:
        "The Theme Marketplace frontend consists of 8 purpose-built components spanning 3 pages and 1 modal. Each component follows SCRIPE's presentation-layer patterns using domain entities (never DTOs) and consuming data exclusively through the DI container.",
      componentsTitle: "Frontend Component Inventory",
      compThemeCard:
        "ThemeCard — Gallery grid item. Displays: thumbnail, name, category badge, tier badge, color palette strip (5 primary colors), font family name, like count, apply count, and hover-to-preview animation.",
      copyOnApplyIntro:
        "When a theme is applied, the ThemeDataJson is COPIED into the tenant's DraftBrandingJson — not linked. This means the tenant's branding is permanently isolated from future marketplace updates. If the theme is updated in v2.0, existing tenants who applied v1.0 retain their v1.0 snapshot. This prevents unexpected visual changes to production login pages.",
      copyOnApplyNote:
        "Copy-on-apply is a deliberate architectural decision. It trades storage efficiency for deployment safety — a critical requirement for enterprise tenants who negotiate specific branding contracts.",
      copyOnApplyTitle: "Copy-on-Apply Snapshot Semantics",
      description:
        "40 premium branding packages, 7 categories, 5 pricing tiers, per-page overrides, copy-on-apply snapshot semantics, and a full clean-architecture data layer — all seeded and ready to browse.",
      endpointApply:
        "POST /api/v1/themes/{id}/apply — Apply theme to the current tenant's draft settings. Copies ThemeDataJson to DraftBrandingJson.",
      endpointDetail:
        "GET /api/v1/themes/{id} — Full theme detail including ThemeDataJson, metadata, and engagement counters.",
      endpointLike:
        "POST /api/v1/themes/{id}/like — Toggle like/favorite for the current admin. Increments/decrements LikesCount.",
      endpointList:
        "GET /api/v1/themes — Paginated list of active themes with category, tier, and search filters.",
      endpointManage:
        "POST/PUT/DELETE /api/v1/themes — System admin CRUD for managing theme catalog (create, update, deactivate).",
      endpointsIntro:
        "The theme marketplace exposes endpoints through the existing TenantSettings and Themes controllers. Theme data is served as part of the branding configuration pipeline.",
      endpointsTitle: "Theme API Endpoints",
      entityFieldApplied:
        "AppliedCount — Usage counter. Tracks how many tenants have applied this theme.",
      entityFieldAuthor: "Author — Creator identifier (e.g., 'SCRIPE Design Team').",
      entityFieldCategory:
        "Category — Classification tag (corporate, creative, dark, elegant, luxury, minimal, nature). Used for gallery filtering.",
      entityFieldDescription:
        "Description — Marketing-quality description of the theme's visual identity and design philosophy.",
      entityFieldIsActive:
        "IsActive — Boolean flag. Inactive themes are hidden from the gallery but preserved in the database.",
      entityFieldIsSystem:
        "IsSystemTheme — Boolean flag. System themes are seeded at startup and cannot be deleted by tenants.",
      entityFieldLikes:
        "LikesCount — Engagement counter. Tracks how many tenants have favorited this theme.",
      entityFieldName:
        "Name — Human-readable theme name (e.g., 'Midnight Aurora', 'Sakura Bloom'). Unique per system.",
      entityFieldPreviewUrl:
        "PreviewUrl — Optional full-size preview image URL for the detail modal.",
      entityFieldsTitle: "Entity Fields",
      entityFieldTag:
        "Tags — Optional comma-separated tags for search (e.g., 'gradient, glass, modern, dark').",
      entityFieldThemeData:
        "ThemeDataJson — JSON column containing the complete design specification (50+ tokens). This is the heart of each theme.",
      entityFieldThumbnail: "ThumbnailUrl — Optional preview image URL for gallery cards.",
      entityFieldTier:
        "Tier — Pricing/access tier (Free, Starter, Professional, Enterprise, StandaloneAddon). Controls edition-based access gating.",
      entityFieldVersion:
        "Version — Semantic version string (e.g., '1.0.0'). Incremented when the theme design is updated.",
      entityIntro:
        "Each marketplace theme is stored as a LoginTheme entity in the Identity module's database. The entity extends AuditableEntity, providing soft-delete, audit trail, and optimistic concurrency. The core data is stored in ThemeDataJson — a JSON column containing the full design specification.",
      entityTitle: "LoginTheme Entity",
      governanceEditionIntro:
        "Each theme's Tier field maps to an edition level. The frontend gallery marks themes above the tenant's edition with an 'Upgrade Required' badge and disables the Apply button. The backend apply endpoint verifies the tenant's active subscription against the theme's tier before allowing application.",
      governanceEditionTitle: "Edition-Based Tier Enforcement",
      governanceIntro:
        "Theme access is controlled by a combination of edition-based tier enforcement and permission-based administrative access. The marketplace respects SCRIPE's multi-tenancy model — themes are globally visible but apply operations are scoped to the current tenant.",
      governancePermissionIntro:
        "Browsing the marketplace requires the branding.view permission. Applying a theme requires branding.manage. Managing system themes (CRUD) requires the themes.manage permission, which is restricted to System Admins.",
      governancePermissionTitle: "Permission Requirements",
      governanceTenantIntro:
        "When a theme is applied, it modifies only the current tenant's DraftBrandingJson. The apply operation is scoped via the JWT tenant_id claim. SuperAdmins can apply themes on behalf of any tenant via the 'Enter Tenant World' drill-down capability.",
      governanceTenantTitle: "Tenant Isolation",
      governanceTitle: "Marketplace Governance",
      intro:
        "The Theme Marketplace is SCRIPE's curated catalog of 40 production-ready branding packages. Each theme is a comprehensive visual identity — not just a color swap — containing 50+ design tokens spanning colors, typography, spacing, overlay, dark mode, branding panel, and per-page overrides for Login, Forgot Password, and Reset Password pages. Themes are stored as structured JSON in the LoginTheme entity, browsable via a full-page gallery with rich filtering, and applied to tenant settings with copy-on-apply snapshot semantics that permanently isolate applied configurations from future marketplace updates.",
      perPageIntro:
        "Each theme can define independent visual overrides for three authentication pages: Login, Forgot Password, and Reset Password. The 'pages' block in ThemeDataJson contains page-specific layout, headline, subtitle, overlay, and background settings that are merged on top of the global design when that page is active. This enables a single theme to present different messaging and visual treatments for different auth flows.",
      perPageIsolationNote:
        "Each auth page can have its own layout, headline, subtitle, and overlay without affecting the other pages. The Login page might use a full-image corporate layout while Forgot Password uses a clean centered card — all within the same theme.",
      perPageIsolationTitle: "State Isolation",
      perPageMergeIntro:
        "When a tenant previews a theme's Forgot Password page, the frontend merges the global design tokens with the forgotPassword override using spread semantics: { ...globalTokens, ...pages.forgotPassword }. This means any token not specified in the page override inherits from the global design — only the explicitly overridden values change. The merge happens in the previewTheme() function in useStudioViewModel.ts.",
      perPageMergeTitle: "Merge Strategy",
      perPageStructIntro:
        "The 'pages' object in ThemeDataJson contains three optional keys: 'login', 'forgotPassword', and 'resetPassword'. Each key maps to a page override object with fields: selectedLayout, panelHeadline, panelSubtitle, overlayColor, overlayOpacity, backgroundType, backgroundValue, and any other token that should differ from the global configuration.",
      perPageStructTitle: "Pages Block Structure",
      perPageTitle: "Per-Page Branding Architecture",
      previewFlowIntro:
        "The previewTheme() function in useStudioViewModel.ts performs a non-destructive preview by temporarily injecting theme tokens into the draft state. The preview is displayed in the sandboxed iframe via postMessage CSS variable injection. The draft is NOT saved until the user explicitly confirms the application. Canceling the preview restores the previous draft state.",
      previewFlowTitle: "Preview Before Apply",
      schemaColorsIntro:
        "The colors section defines the complete light-mode palette: primaryColor (brand accent), secondaryColor (complementary), backgroundColor (page background), formBackground (form card), textColor (primary text), secondaryTextColor (muted text), inputBackground (form input fields), inputBorderColor, inputTextColor, buttonColor (primary CTA), buttonTextColor, buttonHoverColor, linkColor, linkHoverColor, borderColor (general borders), and accentColor (highlights/badges).",
      schemaColorsTitle: "Color System (16 Tokens)",
      schemaDarkIntro:
        "Independent dark-mode palette: darkEnabled (boolean toggle), darkFormBackground, darkTextColor, darkInputBackground, darkInputBorderColor, darkInputTextColor, darkButtonColor, darkButtonTextColor, darkSecondaryTextColor, and darkBorderColor. These tokens are emitted as --login-dark-* CSS variables and activated via the [data-theme='dark'] selector.",
      schemaDarkTitle: "Dark Mode Color System (10 Tokens)",
      schemaIntro:
        "The ThemeDataJson column stores a comprehensive JSON object containing every visual parameter needed to fully render a branded login page. The schema is versioned and contains 7 major sections: layout, colors, dark mode colors, typography, spacing, overlay, and branding panel. Each token maps directly to a CSS custom property via the useLoginBrandingTokens pipeline.",
      schemaLayoutIntro:
        "Controls the page structure: selectedLayout (one of 22 layout identifiers), loginPosition (left/center/right), formWidth, formMaxWidth, containerPadding, and formAlignment. Layout selection determines which rendering strategy the LoginPage component uses.",
      schemaLayoutTitle: "Layout Configuration",
      schemaOverlayIntro:
        "Controls visual effects layered on backgrounds: overlayColor (RGBA), overlayOpacity (0–100%), overlayBlur (0–20px in Gaussian blur), backgroundType ('color', 'gradient', 'image'), backgroundValue (CSS gradient string or image URL), backgroundSize, backgroundPosition, and backgroundRepeat. Overlay settings can be scoped to the form section or branding panel independently.",
      schemaOverlayTitle: "Overlay & Effects (8 Tokens)",
      schemaPanelIntro:
        "Controls the branding side of split layouts: panelLogo (URL), panelHeadline (heading text), panelSubtitle (subheading text), panelHeadlineColor, panelSubtitleColor, panelBackgroundType, panelBackgroundValue, panelOverlayColor, panelOverlayOpacity, panelOverlayBlur, panelLogoSize (small/medium/large), and panelAlignment (left/center/right). These tokens are only rendered in T1 Split layouts.",
      schemaPanelTitle: "Branding Panel Configuration (12 Tokens)",
      schemaSpacingIntro:
        "Controls layout geometry: borderRadius (global border-radius in px), inputBorderRadius, buttonBorderRadius, inputHeight (in px), buttonHeight, and gap (spacing between form elements). These values are emitted as CSS custom properties and applied uniformly across all 22 layouts.",
      schemaSpacingTitle: "Spacing & Dimensions (6 Tokens)",
      schemaTitle: "ThemeDataJson Schema (50+ Design Tokens)",
      schemaTypographyIntro:
        "Controls all text rendering: fontFamily (Google Fonts name, e.g., 'Playfair Display'), headingFontFamily (optional separate heading font), fontSize (base size in px), headingSize, labelSize, inputFontSize, fontWeight (normal/medium/semibold/bold), and letterSpacing. Fonts are loaded dynamically via the Google Fonts CDN.",
      schemaTypographyTitle: "Typography Configuration (8 Tokens)",
      schemaVersionIntro:
        "The root 'version' field tracks the JSON schema version. Current version is '2.0'. The frontend handles backward compatibility — older schemas are normalized at read time.",
      schemaVersionTitle: "Schema Version",
      seedHelperIntro:
        "The seeder uses a fluent Build() helper with ThemeMeta and ThemeDesign records for clean theme definition. ThemeMeta contains name, category, tier, description, author, version, and tags. ThemeDesign contains all 50+ design tokens plus per-page overrides (PageOverrideDesign records for ForgotPassword and ResetPassword). The BuildFullThemeJson() method serializes the ThemeDesign record into the JSON format expected by the frontend.",
      seedHelperTitle: "Build() Helper Architecture",
      seedingIntro:
        "All 40 themes are seeded at application startup by LoginThemeSeeder.cs. The seeder uses an upsert-safe strategy: it checks for existing themes by Name and only inserts new ones — existing themes are never overwritten. This ensures idempotent deployment across environments.",
      seedingTitle: "Backend Seeding Architecture",
      seedUpsertIntro:
        "The seeder queries all existing theme names before processing. For each of the 40 themes, it checks the existing set — if the name exists, the theme is skipped. New themes are added to the DbContext in a single batch and saved with one SaveChangesAsync call. This makes the seeder safe to run repeatedly without duplicating themes or losing manual edits.",
      seedUpsertTitle: "Upsert-Safe Strategy",
      sourceBackend:
        "Backend: LoginThemeSeeder.cs (seeder), LoginTheme.cs (entity), ThemeConfiguration.cs (EF config)",
      sourceData:
        "Data Layer: ThemeMarketplaceService.ts, ThemeMarketplaceRepository.ts, ThemeMarketplaceMapper.ts, ThemeMarketplaceTypes.ts",
      sourceDomain:
        "Domain Layer: ThemeDetail.ts (entity), IThemeMarketplaceService.ts, IThemeMarketplaceRepository.ts",
      sourceFrontend:
        "Frontend: ThemeGalleryView.tsx, ThemeManagementView.tsx, ThemeDetailModal.tsx, ThemeCard.tsx",
      sourceTitle: "Source File Reference",
      sourceViewModel:
        "ViewModel: useThemeMarketplace.ts (gallery state), useStudioViewModel.ts (preview/apply integration)",
      tierEnterpriseIntro:
        "Premium branding packages for Enterprise-edition tenants. Ultra-premium designs with cinematic layouts, luxury typography (Cormorant Garamond, Italiana, Cinzel Decorative), and exclusive dark-mode treatments.",
      tierEnterpriseTitle: "Enterprise Tier (8 Themes)",
      tierFreeIntro:
        "Essential branding packages available to all tenants regardless of edition. Clean, professional designs suitable for quick deployment. Includes Starter themes across corporate, minimal, and creative categories.",
      tierFreeTitle: "Free Tier (8 Themes)",
      tierIntro:
        "Themes are organized into 5 pricing tiers that align with SCRIPE's edition system. Each tier provides increasing design sophistication and customization depth. Tier enforcement is handled by the theme marketplace frontend — themes from higher tiers display an 'Upgrade Required' badge and disable the Apply button for tenants on lower editions.",
      tierProIntro:
        "Advanced branding packages for Professional-edition tenants. Sophisticated visual treatments with glass-morphism effects, editorial typography, and multi-tone overlays. Includes the most diverse category coverage.",
      tierProTitle: "Professional Tier (10 Themes)",
      tierStandaloneIntro:
        "Ultra-exclusive standalone branding packages available as individual add-on purchases. These represent the most unique and specialized designs — botanical illustrations, art deco, brutalist, vaporwave, and zen-inspired themes that make a bold brand statement.",
      tierStandaloneTitle: "Standalone Add-on Tier (6 Themes)",
      tierStarterIntro:
        "Enhanced branding packages for Starter-edition tenants. Richer color palettes, premium font pairings, and gradient backgrounds. Includes Starter-exclusive designs across corporate, dark, and elegant categories.",
      tierStarterTitle: "Starter Tier (8 Themes)",
      tierTitle: "5-Tier Pricing Model",
      title: "Theme Marketplace",
    },
    userGroups: {
      architectureIntro:
        "Chaque UserGroup appartient à un locataire unique et contient trois collections : Membres, Rôles et Restrictions.",
      architectureTitle: "Architecture",
      cascadeIntro:
        "Les opérations de groupe massives peuvent éventuellement déclencher une suppression logique (soft-delete) en cascade de tous les administrateurs exclusifs.",
      cascadeNote:
        "Les opérations en cascade ignorent automatiquement les Administrateurs Protégés (propriétaire du locataire).",
      cascadeTitle: "Opérations en Cascade",
      description:
        "Affectation de rôles et de restrictions basée sur les groupes avec fusion additive lors de la connexion.",
      domainModelIntro:
        "La fonctionnalité ajoute 4 entités au domaine d'Identité pour lier dynamiquement les groupes aux administrateurs.",
      domainModelTitle: "Modèle de Domaine",
      endpointsTitle: "Endpoints de l'API (12)",
      frontendIntro:
        "Utilise le GenericCrudView avec 3 onglets pour gérer les membres, les rôles et les restrictions indépendamment.",
      frontendTitle: "Module Frontend",
      howItWorksIntro:
        "Les permissions effectives dans le JWT sont l'UNION des rôles directs et de tous les rôles hérités via les groupes.",
      howItWorksTitle: "Fonctionnement lors de la Connexion",
      intro:
        "Fournit un moyen évolutif d'affecter des rôles et des restrictions au niveau des champs à un grand nombre d'administrateurs.",
      memberManagementIntro:
        "Endpoints de type PUT idempotents pour ajouter et supprimer des membres.",
      memberManagementTitle: "Gestion des Membres",
      mergeNote:
        "Les rôles et restrictions de groupe sont additifs : ils ne peuvent qu'ÉTENDRE les restrictions (principe 'deny wins' ou le refus l'emporte).",
      restrictionsIntro:
        "Les restrictions de groupes s'additionnent dynamiquement avec les autres restrictions directes de l'administrateur.",
      restrictionsTitle: "Restrictions de Champs",
      roleAssignmentIntro:
        "Les rôles de groupe utilisent le modèle Nuke & Pave (le PUT remplace tout) pour une synchronisation stricte avec l'interface utilisateur.",
      roleAssignmentTitle: "Affectation des Rôles",
      securityNote:
        "Les groupes d'utilisateurs sont cloisonnés par locataire. Les SuperAdmins ont une vue globale de l'ensemble.",
      title: "Groupes d'Utilisateurs (User Groups)",
    },
    userManagement: {
      accountOpsTitle: "Opérations sur les Comptes",
      adminVsUserIntro:
        "SCRIPE sépare les administrateurs du panneau système des utilisateurs finaux de l'application.",
      adminVsUserTitle: "Modèle Admin vs Utilisateur",
      bulkOpsTitle: "Opérations en Lot (Bulk)",
      crudTitle: "Endpoints CRUD des Administrateurs",
      description:
        "Cycle de vie complet des administrateurs/utilisateurs, opérations en lot, usurpation d'identité et règles de protection.",
      enterpriseOpsTitle: "Opérations Enterprise",
      nukePaveTip:
        "L'affectation des rôles détruit et recrée l'association de manière transactionnelle pour correspondre exactement à l'état de l'interface utilisateur.",
      nukePaveTitle: "Modèle Nuke & Pave (Remplacement Total)",
      protectedIntro:
        "Le créateur initial d'un locataire reçoit une protection empêchant sa suppression accidentelle.",
      protectedTitle: "Règles des Admins Protégés",
      roleMgmtTitle: "Gestion des Rôles",
      title: "Gestion des Utilisateurs",
    },
    webhookSystem: {
      architectureIntro:
        "Permet aux intégrations externes de recevoir des charges utiles (payloads) d'événements signées via HMAC-SHA256.",
      architectureTitle: "Architecture des Webhooks",
      circuitBreakerIntro:
        "Après des échecs consécutifs, l'abonnement est désactivé automatiquement pour éviter de bombarder un endpoint défaillant.",
      circuitBreakerTitle: "Disjoncteur (Auto-Désactivation)",
      deliveryLogsIntro:
        "Garde une trace du code d'état, du corps de réponse et du temps de chaque tentative.",
      deliveryLogsTitle: "Journaux de Livraison",
      description:
        "Webhooks basés sur des événements avec rotation HMAC, abonnements de hiérarchie de locataires et disjoncteur (circuit breaker).",
      endpointsManagementTitle: "Gestion des Abonnements",
      endpointsOperationsTitle: "Opérations et Surveillance",
      endpointsTitle: "Endpoints API des Webhooks",
      entityTitle: "Entité WebhookSubscription",
      eventsTitle: "Types d'Événements de Webhooks",
      hmacIntro:
        "La signature sécurisée permet au récepteur de certifier l'origine de la charge utile.",
      hmacTitle: "Signature HMAC",
      includeChildrenIntro:
        "Si activé, un locataire parent recevra les événements de webhooks de lui-même ET de toutes ses succursales.",
      includeChildrenTitle: "Abonnements des Locataires Enfants",
      retryIntro:
        "Les échecs de livraison sont relancés avec un délai d'attente exponentiel (exponential backoff).",
      retryTitle: "Politique de Nouvelle Tentative (Retry)",
      secretRotationIntro:
        "Permet de générer une nouvelle clé HMAC tout en acceptant l'ancienne pendant 24 heures sans interruption de service.",
      secretRotationTitle: "Rotation des Secrets (Délai de Grce de 24h)",
      title: "Système de Webhooks",
    },
  },
};

/**
 * Docs page locale — FR
 */
export const fr = {
  apiReference: {
    adminApi: {
      actionsTitle: "Actions Instantanées sur les Comptes",
      activateDesc: "Rallume la permission de génération d'accès (IsActive = vrai).",
      blockDesc:
        "Sceau de sécurité : applique un verrou infranchissable (Bloqué Manuellement) sur un compte jugé suspect.",
      bulkActivateDesc: "Activation groupée des cibles fournies.",
      bulkDeactivateDesc: "Arrêt groupé des cibles fournies.",
      bulkDeleteAllDesc:
        "Filtrage et anéantissement global basé sur une requête avec des exceptions d'ID (ExcludeIds) pour éviter de toucher certains administrateurs.",
      bulkDeleteDesc: "Passage collectif à la corbeille de recyclage.",
      bulkIntro:
        "Envoie un tableau d'instructions et gère les mises à jour en une seule transaction monolithique sur la base de données SQL.",
      bulkTitle: "Armes à Déploiement Massif (Opérations Bulk)",
      createDesc:
        "Création d'une nouvelle identité avec intégration d'un Rôle et d'une dépendance hiérarchique au locataire cible.",
      crudTitle: "Endpoints CRUD Administrateur",
      deactivateDesc:
        "Coupe brutalement l'autorisation de renouvellement des accès sans détruire le profil.",
      deleteDesc:
        "Suppression asynchrone (soft-delete) transférant le dossier vers la corbeille de recyclage.",
      description:
        "Système de contrôle du personnel : création, opérations massives (bulk), droits d'usurpation (impersonation).",
      getByIdDesc: "Analyse profonde de la fiche de registre d'un profil.",
      impersonateDesc:
        "Actionne la matrice : réécrit un JWT temporaire pour observer le système complet à travers les yeux (rôles) d'un opérateur de niveau inférieur.",
      impersonationTitle: "Télescopage et Usurpation d'Identité (Impersonation)",
      impersonationWarning:
        "Toute action de modification effectuée sous l'imposture génère une empreinte double dans les bases de données d'audit liant de manière irrévocable le modificateur fantôme.",
      intro:
        "Ces requêtes sont limitées aux utilisateurs dotés de privilèges supérieurs d'affectation des ressources au sein d'un locataire (Tenant).",
      listDesc:
        "Moteur de pagination, tri multi-colonnes et filtres granulaires sur la base des administrateurs internes.",
      protectDesc:
        "Basculer la balise IsProtected empêchant l'élimination ou le verrouillage dudit compte de façon native par la base de données.",
      queryParamsTitle: "Opérations de Chaînes de Requêtes Avancées (Query Params)",
      resetPasswordDesc:
        "Forçage asymétrique de mot de passe envoyant un courriel temporaire, et coupant la clé existante de l'utilisateur visé.",
      stopImpersonateDesc:
        "Coupe l'identité de substitution pour revenir à l'identité originelle du SuperAdmin.",
      title: "API de Gestion des Administrateurs",
      transferDesc:
        "Passation absolue des pouvoirs : transfert des attributs intouchables du Propriétaire vers une nouvelle entité élue (Non réversible sans l'aval de cette nouvelle entité).",
      unblockDesc: "Opération de libération à discrétion d'un SuperAdmin.",
      unlockDesc:
        "Révocation du chronomètre de verrouillage automatique après de trop nombreuses tentatives de piratage du mot de passe.",
      updateDesc: "Mise à jour des champs autorisés.",
    },
    authApi: {
      changePasswordDesc:
        "Opération de renouvellement de mot de passe impliquant une vérification croisée de l'ancien mot de passe.",
      configTitle: "Configuration de Base",
      description:
        "L'entrée principale du tableau de bord : gestion de profil, rotation de jetons, MFA et déconnexions.",
      intro:
        "Cette interface gère exclusivement l'accès privilégié des opérateurs internes. Les requêtes s'exécutent sur la racine /api/v1/auth.",
      loginDesc:
        "Processus d'identification initial. Retourne le jeton d'accès et le jeton de rafraîchissement (refresh token).",
      loginTitle: "Connexion (Login)",
      logoutDesc: "Détruit tous les jetons persistants et déconnecte les services actifs associés.",
      logoutTitle: "Déconnexion (Logout)",
      meDesc:
        "Récupération profonde de l'identité, des permissions croisées et du contexte locataire du JWT courant.",
      profileTitle: "Gestion de Profil",
      refreshDesc:
        "Consomme le Refresh Token valide stocké et émet une nouvelle paire cryptographique.",
      refreshTitle: "Rafraîchissement des Jetons",
      removeAvatarDesc: "Retour au profil générique avec les lettres d'initiales automatiques.",
      revokeSessionDesc:
        "Éjection distante : révoque un jeton actif sur un appareil particulier forçant une reconnexion.",
      securityLogDesc:
        "Historique restreint des connexions et des changements majeurs survenus sur le compte personnel de cet administrateur.",
      securityTip:
        "Ces données sont nettoyées au bout de 90 jours (rétention par défaut de conformité d'audit).",
      securityTitle: "Endpoints de Surveillance de Sécurité",
      sessionsDesc:
        "Scan complet des appareils connectés avec l'IP et la date d'activité associées au Refresh Token.",
      tfaBackupDesc:
        "Génération de codes imprimables d'urgence et écrasement de la liste de secours précédente.",
      tfaConfirmDesc: "Consolide le réglage initial en validant le premier code entré.",
      tfaDisableDesc:
        "Suspension manuelle et désactivation des sécurités du compte de cet administrateur.",
      tfaEnableDesc: "Émission du Secret aléatoire codé en URI QR Code pour initialisation.",
      tfaIntro:
        "Les protocoles TOTP intégrés aux applications d'authentification classiques (Google, Microsoft, Authy).",
      tfaTitle: "Authentification à Deux Facteurs (2FA)",
      tfaVerifyDesc:
        "Poursuite du processus de connexion lorsqu'un jeton Session-2FA a été fourni à l'étape 1.",
      title: "API d'Authentification (Console d'Administration)",
      updateProfileDesc: "Modification des noms et numéros de téléphone.",
      uploadAvatarDesc:
        "Stockage asynchrone d'une nouvelle photo de profil (formats JPG/PNG/WEBP, max 2 Mo).",
    },
    overview: {
      adminEndpointsTitle: "Endpoints de Gestion des Administrateurs",
      authEndpointsTitle: "Endpoints d'Authentification",
      baseInfoTitle: "Renseignements de Base",
      description:
        "Documentation exhaustive de l'API REST : endpoints, exemples de requêtes et de réponses, modèles d'authentification.",
      intro:
        "L'API SCRIPE est une API JSON RESTful complète. À l'exception des terminaux publics, toutes les routes nécessitent un jeton d'authentification Bearer (JWT).",
      otherEndpointsTitle: "Autres Endpoints Périphériques",
      responseFormatTitle: "Format Standard de l'Enveloppe de Réponse",
      roleEndpointsTitle: "Endpoints des Rôles et Permissions",
      swaggerTip:
        "Pour interagir graphiquement et tester la connectivité à ces API, consultez le visualisateur en direct fourni à l'adresse URL locale /swagger.",
      tenantEndpointsTitle: "Endpoints de Gestion des Locataires",
      title: "Référence de l'API",
      userEndpointsTitle: "Endpoints de Gestion des Utilisateurs",
    },
    rolePermissionApi: {
      assignPermDesc:
        "Bomba Nuke & Pave (Remplacement destructif absolu) ! Cette commande écrase tous les réglages passés pour resynchroniser avec l'état voulu, incluant les Restrictions de Champs JSON associées à chaque droit.",
      assignTitle: "Attribution de Compétences (Assignation)",
      availableForTenantDesc:
        "Rendu de sécurité lors du montage/édition parent-enfant de capacités par l'entité SuperAdmin.",
      availablePermDesc:
        "Le vivier (Pool) total de compétences mis à la disposition du créateur du Rôle dans ce locataire particulier.",
      categoriesDesc:
        "Formate les clés de permissions regroupées par Famille Logicielle (ex: 'users', 'roles', 'settings') pour peupler le visuel modulaire du Frontend UI.",
      cloneRoleDesc:
        "L'option rapide de création. Copie 100% de la matrice des droits sous une nouvelle identité pour créer un poste hiérarchiquement dérivé (ex : Admin HR vs Assistant HR).",
      createRoleDesc: "Matérialise le Rôle.",
      deleteRoleDesc:
        "Empêche la suppression catastrophique si au moins un profil Administrateur repose encore sur cette structure (Erreur de clé relationnelle).",
      description:
        "Ingénierie des Profils Métiers (Roles), remplacement destructif de JSONs de permission et isolation fine des champs de base de données.",
      getPermByIdDesc: "Extraction détaillée.",
      getPermDesc:
        "Retourne les clés physiques activées pour ce Rôle, prêtes à être décodées sur les cases à cocher du Frontend.",
      getRoleDesc:
        "Extraction de l'entité globale, comprenant les autorisations RBAC ainsi que les matrices de visibilité du Menu de Barre Latérale du Frontend.",
      intro:
        "Dans SCRIPE, les humains n'ont pas de droits ; ils n'ont que des Rôles, lesquels sont détenteurs d'une copie paramétrée et restreinte des clés du système de l'entreprise.",
      listPermissionsDesc: "Lecture de l'index complet de permissions connues du moteur C#.",
      listRolesDesc:
        "Exploration des Rôles et affichage analytique du nombre de personnes assujetties à chacun d'entre eux.",
      myPermissionsDesc: "L'intersection des permissions de l'utilisateur.",
      myTenantRolesDesc: "Exploration autorisée locale.",
      permissionsIntro:
        "Les permissions (Actions) ne peuvent pas être ajoutées au runtime via la base de données. Elles sont compilées en dur sur le code source de l'API via les attributs C# et ensemencées (Seeded) de manière autoritaire par la réflexion au démarrage de l'infrastructure.",
      permissionsTitle: "Le Catalogue Immuable des Permissions (Lecture Seule)",
      rolesCrudTitle: "Endpoints CRUD du Rôle",
      seededNote:
        "L'architecture rejette les créations/suppressions virtuelles. L'unique façon de rayer un droit du système est que les ingénieurs retirent ledit attribut du code Backend C# source et redéploient la solution sur le serveur de production.",
      syncScopesDesc:
        "Les contrôles transfrontaliers (Scoping) exigent parfois des rafraîchissements dynamiques afin que la structure de l'arbre père redescende vers les Rôles de l'enfant.",
      tenantScopedIntro:
        "Rend mathématiquement impossible pour une sous-branche d'une compagnie de se doter par elle-même de pouvoirs administratifs que la branche maître ne lui a pas concédés explicitement.",
      tenantScopedTitle: "Conteneurisation Multi-locataire du RBAC",
      title: "API de Rôles et Permissions (Cœur RBAC)",
      updateRoleDesc:
        "Modificatifs de description et paramétrages des drapeaux d'accès au menu principal.",
    },
    systemApi: {
      blockedIpsDesc:
        "Classement (Top N) des adresses réseaux cibles repoussées par la fonction intégrée du limiteur de requêtes système (Rate Limiting HTTP).",
      createMenuDesc:
        "Permet l'ajout à chaud d'une nouvelle URL d'une nouvelle fonctionnalité sans compiler, ni redéployer NPM, tout en étant connectée instantanément aux groupes RBAC.",
      dashboardExportTitle: "Rapports Formels de l'Entreprise (Export)",
      dashboardIntro:
        "Toutes les informations envoyées au Dashboard sont filtrées nativement par l'API pour qu'aucun administrateur de l'entreprise Enfant ne reçoive par mégarde les statistiques de ses voisins du logiciel.",
      dashboardTitle: "Analytique et Graphiques Décisionnels (Dashboard)",
      deleteFileDesc:
        "Purger un fichier de la table SQL ainsi que l'interpellation du prestataire Cloud de le radier des disques durs à distance.",
      deleteMenuDesc:
        "Processus destructif global : si la fonction détruit le nœud parent (Ex: Paramètres), elle détruira également tous les sous-menus dépendants existants en dessous.",
      description:
        "Le centre d'analyse du tableau de bord (Dashboard), les configurations globales matérielles, la barre de navigation logicielle et la poubelle à restauration temporelle.",
      downloadDesc:
        "Terminal d'expédition sécurisée téléchargeable ou de flux (Streaming) par ID vérifiable.",
      eventDistDesc:
        "Classification mathématique pure formatée pour être injectée dans des contrôles graphiques en secteur ou camemberts (Pie / Doughnut Chart).",
      exportAnalyticsDesc:
        "Rapport chiffré des détails analytiques, y compris la conversion d'images et tableaux des flux temporels (PDFs visuels).",
      exportOverviewDesc:
        "L'API crée sur son serveur le fichier (PDF, Excel, CSV) correspondant aux KPIs de l'écran avec une typographie formelle de direction.",
      exportSecurityDesc:
        "Émission formelle du registre d'attaques orientée pour les auditeurs cyber de conformité légale (Blue Teams).",
      filesTitle: "API Fichiers : Uploader et Servir les Ressources",
      getSettingsDesc:
        "Le méga-document central lu à l'allumage comprenant tous les choix techniques du système (Fournisseurs de courriels, options multi-tenants générales, seuils, clés).",
      intro:
        "Regroupe tout ce qui touche à l'essence de la machinerie et au squelette sur lequel s'exécutent les fonctions de métiers.",
      listDeletedDesc:
        "Ajuste les requêtes EF Core à ignorer les filtres SQL pour fouiller dans les couches masquées (Tombstones/Ghosts) de la base de données qui détiennent la marque d'un effacement.",
      listMenusDesc:
        "Exploration complète de l'arborescence (référence circulaire Parents/Enfants) des menus.",
      loginActivityDesc:
        "Fournit une série chronologique (Time series) pour peupler les bibliothèques graphiques des historiques de trafic / connexions échouées vs réussies.",
      menuTitle: "Contrôleur Dynamique de Barre de Navigation (Menus)",
      myMenuDesc:
        "Requête exclusive (la plus utilisée par Next JS) : récupère uniquement la partie du squelette de navigation à laquelle mon JWT me donne accès (masquage par Permission et Rôle des URLs du panneau de gauche).",
      myOverridesDesc: "Fournit ces exceptions en liste condensée.",
      purgeDesc:
        "Opération nucléaire : DELETE absolu au niveau de la table. Irréversible même pour le technicien de base de données, servant essentiellement à se plier aux obligations légales du respect du droit à l'effacement définitif.",
      readinessDesc:
        "Probe (Sonde) Endpoint pour conteneurs Docker/Kubernetes de type /health/ready : effectue un Ping asynchrone profond à la base Redis, à Hangfire et la BD relationnelle. Si le cluster répond un 200 OK, la plateforme signale aux répartiteurs (Load Balancers) d'orchestration que les requêtes peuvent passer.",
      recentChangesDesc:
        "Flux RSS dynamique (Activity Feed) des activités de mutations détectées par l'audit, afin que le dirigeant consulte le dynamisme de la plateforme dès la connexion.",
      recycleBinTitle: "Garde-Fou Global : La Corbeille de Recyclage",
      reorderMenuDesc:
        "Endpoint massif recevant un tableau dynamique (Array) d'indices depuis l'interface Drag & Drop du Frontend et l'imprimant instantanément de manière ordonnée en base de données.",
      resetSettingsDesc:
        "Recharge le fichier de paramètres depuis le code source originel pur pour annuler un dysfonctionnement humain fatal.",
      restoreDesc:
        "Processus magique révoquant le drapeau d'effacement en ramassant le nœud complet pour le relancer dans la zone visuelle sans laisser de séquelles.",
      roleVisibilityDesc:
        "Endpoint d'interconnexion liant tel Menu spécifique à l'affichage pour tel ou tel Rôle de travail (Visibilité).",
      securityEventsDesc:
        "Journal d'alertes restreint : montre le haut du tableau concernant les actions rouges d'attaques à la force brute, des mots de passe compromis et des verrouillages brutaux.",
      settingsTitle: "Configurateurs de Variables Globales Applicatives",
      summaryDesc:
        "KPI (Indicateurs clés de performance) globaux condensés. Fournit des comptages bruts (Admins / Utilisation / Stockages) en un seul objet condensé.",
      tenantOverrideDesc:
        "Force la substitution contextuelle : la société 'A' a le droit de renommer la navigation 'Produits' en 'Voitures' sur son compte personnel, ce qui enregistre une surcharge isolée de l'interface qui n'affectera jamais le reste des sociétés hébergées.",
      title: "API du Système, Entorno, Santé et Fichiers",
      updateMenuDesc:
        "Modifications légères (Renommer, Mettre à jour les bibliothèques d'Icônes, Changement de chemin).",
      updateSettingsDesc:
        "Mise à jour transactionnelle du fichier d'application de base poussée en live sans nécessiter le redémarrage (Reboot) du Service / IIS Container.",
      uploadDesc:
        "Traitement des requêtes POST de type Mutlipart/form-data. Intercepte le fichier, le vérifie, le redirige au sous-réseau (S3 Bucket / Azure / Local) et émet la nouvelle route externe et sécurisée au client frontal.",
    },
    tenantApi: {
      adminsDesc: "Dérivation des employés isolés par la balise du locataire cible.",
      childrenDesc: "Descend à la première rangée sous l'ID sélectionné.",
      createDesc:
        "Inaugure un conteneur enfant (sous-branche) lié au locataire exécutant la commande.",
      crudTitle: "CRUD du Locataire Central",
      deleteDesc:
        "L'option nucléaire de la base de données : arrête et bascule l'entier du locataire et tous ses utilisateurs et droits associés en mode Soft-Delete global.",
      description:
        "Endpoints pour isoler, créer, étager, limiter les quotas et brasser la hiérarchie commerciale de l'application.",
      getByIdDesc: "Extraction complète comprenant les statistiques des composants liés.",
      getSettingsDesc:
        "Objet massif contenant les tableaux de quotas (-1 valant ressource illimitée), l'esthétique et l'audit.",
      hierarchyDesc:
        "Traduit la base SQL à l'algorithme d'arbre hiérarchique imbriqué au format JSON.",
      hierarchyIntro:
        "Le système n'est pas plat. Il maintient une trace en profondeur des parents et petits-enfants (Niveaux / Profondeurs).",
      hierarchyTitle: "Métriques et Arbres Hiérarchiques",
      intro:
        "La fondation du Monolithe : SCRIPE traite les entreprises et les branches départementales en tant que locataires (Tenants).",
      listDesc:
        "Exécution de requêtes par l'Administrateur actuel limitées à son niveau de visionnage des locataires enfants et de la racine.",
      myChildrenDesc:
        "Actionne une requête basée sur le contexte d'isolation du JWT (les enfants appartenant à MON locataire courant).",
      mySettingsDesc: "Équivalent orienté vers le locataire personnel de l'Administrateur.",
      permissionsDesc:
        "Vérifie les droits que la plateforme a bien voulu transmettre à cette entreprise.",
      rolesDesc: "Extrait le système RBAC circonscrit au niveau de l'entreprise cible.",
      settingsNote:
        "Les réglages du locataire sont un mécanisme asymétrique. Un parent peut forcer des conditions que le locataire enfant ne peut écraser, formant une cascade d'obéissance des règles de sécurité.",
      settingsTitle: "Configurations et Réglages du Locataire",
      statsDesc:
        "Appels Count() asynchrones rapides sur les tables de métriques de consommation de stockage, et quotas d'administrateurs.",
      title: "API de Gestion des Locataires (Multi-Tenancy)",
      updateDesc:
        "Modificatifs des slugs de routage et variables générales de l'instance d'entreprise.",
      updateSettingsDesc:
        "Pousse les réglages de gestion d'état sur le moteur (ex : refuser que les locataires invitent des utilisateurs, obliger des mots de passe plus complexes).",
      uploadLogoDesc:
        "Génère et rogne l'emblème de la marque (White label), mis à disposition par la suite par l'API FileSystem public de la plateforme.",
    },
    userAuthApi: {
      changePasswordDesc: "Renouvellement du mot de passe direct.",
      configTitle: "Configuration de Base",
      description:
        "Processus de libre-service (Self-Service) : inscription externe, SSO OAuth, activation de téléphone, et réinitialisations de clés.",
      diffNote:
        "Alerte de Sécurité Architecturale : La base de données rejette les JWT d'utilisateurs sur les points de terminaison d'administration. Une tentative de substitution retournera une violation du protocole d'authentification 401.",
      externalIntro: "Prend en charge les jetons d'identité de fournisseurs extérieurs.",
      externalLoginDesc:
        "Mappage ou création automatique de compte via la validation SSL d'un jeton externe social.",
      externalTitle: "Authentification via Tiers (OAuth)",
      forgotPasswordDesc:
        "Le système renvoie systématiquement un HTTP 200 Succès pour éviter la révélation et l'énumération par des attaquants.",
      intro:
        "API spécialisée pour la couche frontale des clients finaux. L'accès à cette API est catégoriquement refusé aux opérateurs administratifs internes.",
      loginDesc: "Retourne les clés JWT cloisonnées aux rôles clients.",
      loginTitle: "Connexion",
      logoutDesc: "Arrêt de la session et purge du Refresh Token des bases de données de l'API.",
      meDesc: "Récupération des métadonnées liées à son identité de domaine public.",
      passwordResetTitle: "Processus de Réinitialisation des Mots de Passe",
      profileTitle: "Opérations de Profil Utilisateur",
      refreshDesc: "Appel de rotation silencieuse invisible pour le client Web.",
      registerDesc:
        "Création autonome d'un nouvel utilisateur rattaché au locataire de la plateforme.",
      registerTitle: "Inscription (Registration)",
      resetPasswordDesc:
        "Action finale qui clôture l'OTP émis et le remplace par un nouveau condensé BCrypt.",
      sendVerificationDesc: "Déclenche l'envoi de l'OTP. Sévèrement protégé par le Rate Limiting.",
      summaryTitle: "Résumé des Interfaces de Sécurité",
      tfaBackupDesc: "Générer une nouvelle carte de secours imprimable.",
      tfaConfirmDesc: "Émission des jetons de récupération hors-ligne.",
      tfaDisableDesc: "Abolition de l'authentification 2FA personnelle.",
      tfaEnableDesc: "QR générateur de la graine secrète du client.",
      tfaTitle: "2FA Utilisateur Final",
      tfaVerifyDesc: "Seconde étape du blocage de connexion.",
      title: "API d'Authentification des Utilisateurs (Clients)",
      tokenTitle: "Gestion des Accès",
      updateProfileDesc: "Modification des champs signalétiques mineurs.",
      verificationTitle: "Vérification E-Mail et Téléphone (OTP)",
      verifyEmailDesc:
        "Validation définitive d'une adresse de contact à l'aide du code à 6 chiffres.",
      verifyPhoneDesc: "Procédé de validation via un appel d'API SMS externe.",
    },
    userGroupsApi: {
      addMembersDesc:
        "L'action d'association qui accepte un array et fonctionne silencieusement (Idempotence) si un ID se trouve déjà présent pour s'affranchir des erreurs bloquantes d'insertion (Duplicate Key Exception).",
      bulkActivateDesc:
        "Remise en service d'un tableau ou liste de Groupes. L'option de Cascade peut éveiller de nouveau tous les administrateurs y appartenant de manière exclusive.",
      bulkCascadeIntro:
        "Commandes terrifiantes destinées à paralyser, réactiver ou éliminer simultanément de multiples groupes entiers et leurs opérateurs sous-jacents de la plateforme de production en un clic.",
      bulkCascadeTitle: "Armement Lourd (Masse & Actions en Cascade)",
      bulkDeactivateDesc:
        "Verrouillage absolu. Plonge dans l'obscurité l'entièreté d'un département ou liste de Groupes. Cascade coupe l'accès physique à la plateforme via le booléen des Administrateurs concernés.",
      bulkDeleteDesc:
        "Hécatombe de bases de données gérée en Soft Delete. L'ordre raye de la carte les groupes donnés avec la possibilité que la Cascade réduise aussi en suppression logique chaque opérateur lié.",
      cascadeWarningNode:
        "Alerte Automatisée d'Exclusion : le pare-feu du script de Cascade détectera tout membre détenant la balise de Protect System Owner et la contournera pour éviter d'effacer le propriétaire légitime de l'entreprise lors d'un massacre massif de base de données.",
      createGroupDesc:
        "Injection de registre qui protège également des vecteurs d'attaque : si vous injectez de faux RoleIds extérieurs à votre propre Inquilino, le parseur validera et déclenchera une faille d'isolation avant d'écrire en DB.",
      createGroupMyTenantDesc:
        "Injection rapide ne nécessitant aucun passage du paramètre de l'identifiant du locataire, géré silencieusement via le middleware JWT de la requête contextuelle.",
      crudTitle: "CRUD du Groupe d'Utilisateur",
      deleteGroupDesc:
        "Appel de fin de vie. Le logiciel bascule la balise, mais surtout brise les liaisons de dépendance et orphelinise gracieusement les administrateurs pour qu'ils ne soient pas bloqués ni détruits.",
      description:
        "Silos de gestion des effectifs pour opérer un RBAC asymétrique en lot (Bulk) sur des centaines d'administrateurs simultanément.",
      getGroupDesc:
        "Fouille profonde et agrégation (Include) de tous les Administrateurs connectés (Membres), les Rôles (Roles) et les Restrictions au format JSON en base de données.",
      groupMembersIntro:
        "Liaisons (Junction tables) pour attacher l'opérateur physique à l'infrastructure logique du Groupe.",
      groupMembersTitle: "Acheminement et Connexion des Profils (Membres)",
      groupRolesRestrictionsIntro:
        "La gestion centrale de l'ingénierie des restrictions, qui dicte ce qui va être imposé ou caché à tout le monde lors du calcul UNION de connexion.",
      groupRolesRestrictionsTitle: "Les Matrices de Pouvoir du Groupe d'Utilisateur",
      groupsByTenantDesc:
        "Vue omnisciente pour le SuperAdmin voulant isoler et espionner comment une autre compagnie du système opère sa hiérarchie de groupes.",
      intro:
        "Alternative massive à l'administration individuelle : lorsqu'un département obtient de nouvelles prérogatives, mettez à jour la définition du groupe pour que 300 utilisateurs soient autorisés immédiatement lors de leur prochaine actualisation de jeton.",
      listGroupsDesc: "Récupération avec filtres et délimitation de base de données.",
      myTenantGroupsDesc:
        "Points finaux hyper optimisés renvoyant une charge minimale d'objets pour instancier rapidement les listes de sélection Frontend.",
      removeMemberDesc:
        "Efface le pont de liaison ; l'opérateur conserve tout ce qui lui a été donné en son nom propre mais perd tous ses privilèges tirés du groupe.",
      setGroupRestrictionsDesc:
        "Mise à jour Nuke-and-Pave des colonnes JSON des limitations de champs (ex : cacher le mot de passe aux RH), répliquant les règles de manière implacable au conteneur groupe.",
      setGroupRolesDesc:
        "Synchronisation Nuke-and-Pave exclusive à la table de jointure des Rôles de Groupe, recréant l'état voulu par l'administrateur en une opération SQL en lot isolée.",
      title: "API de Groupes d'Utilisateurs (User Groups)",
      updateGroupDesc:
        "Opération destructive qui non seulement change le titre ou la description du groupe, mais force la synchronisation (Nuke and Pave) de l'array de rôles en un seul appel REST.",
    },
    webhookEmailApi: {
      cancelEmailDesc:
        "Mécanisme de sauvetage qui peut attraper et anéantir un job e-mail encore en file d'attente (Pending) de la base de données avant sa phase de tir (Dispatch).",
      createTemplateDesc:
        "Saisie d'un nouveau code formel ou d'un rendu brut pour les avertissements d'applications.",
      createWebhookDesc:
        "Déclare la route distante, la clé secrète partagée, et la collection de mots clés d'événements déclencheurs désirés.",
      deleteNotifDesc: "Annihilation pure du message depuis le visuel de la table SQL.",
      deleteTemplateDesc: "Retrait et nettoyage.",
      deleteWebhookDesc:
        "Destruction de la passerelle de communication événementielle (Event Dispatcher).",
      description:
        "Le cblage sortant de l'application vers les CRM, passerelles SMS et boîtes e-mail via des événements d'observabilité système.",
      emailIntro:
        "Plateforme robuste intégrée au serveur avec rétentions, annulations programmées, sondages d'échec d'envoi et file d'attente (Queue) robuste.",
      emailStatsDesc:
        "Exploitation du log : crée des statistiques mathématiques (Échecs, Réussites, Taux d'Attente).",
      emailTitle: "Le Hub Central d'E-mail",
      getTemplateDesc: "Ouvrir les codes et variables sources.",
      intro:
        "Ce compartiment assure que SCRIPE ne se fatigue pas de requêtes lentes, en externalisant tout le réseau distant sur les processus (Workers) en tche de fond Hangfire.",
      listEmailsDesc:
        "Exploration des journaux : renvoie les rapports et compte-rendu SMTP (ex: Erreurs 500, Adresses Introuvables, Blocage Anti-Spam).",
      listNotificationsDesc:
        "Historique et paginations des messages non gérés du panneau supérieur déroulant (Drawer).",
      listTemplatesDesc: "Recueil central des gabarits du logiciel.",
      listWebhooksDesc: "Consultation paginée.",
      markAllReadDesc:
        "Opération destructive qui transforme l'ensemble du compteur à zéro (0) d'une seule rafale SQL sans avoir à renvoyer chaque identifiant de message depuis l'UI React.",
      markReadDesc: "Évite l'entassement des messages d'alerte avec une mise à jour d'état de vue.",
      notificationsTitle: "Hub de Notifications In-App (Socket Push)",
      previewTemplateDesc:
        "Mécanisme de sécurité visuelle où l'API génère un modèle falsifié en remplaçant la variable de l'utilisateur par de faux noms afin de vous permettre de visualiser le rendu visuel exact du modèle en mode web Frontend.",
      renderTemplateDesc:
        "Machine d'export qui transforme la chaîne Scriban en sortie HTML absolue et pure et qui dissocie automatiquement la version Fallback texte brut pour la conformité e-mail antispam.",
      resendEmailDesc:
        "Commande de forçage qui attrape le rapport de crash et réintroduit l'envoi vers le moteur SMTP de façon impérative.",
      searchRecipientsDesc:
        "Point d'accroche pour les champs Autocomplete du Frontend permettant aux administrateurs de ne pas avoir à écrire de mémoire un contact.",
      searchTargetsDesc:
        "Recherche sur les UID de tous les administrateurs / employés / contacts pour permettre le tir de notifications personnalisées à une entité externe ou distante de votre compagnie.",
      sendBulkDesc:
        "Envoie d'alertes groupées ; un array JSON d'e-mails cible une même matrice de gabarit pour générer une émission (Broadcast) massive sans ralentissement.",
      sendEmailDesc:
        "Remplissage instantané d'un modèle (Template) et injection dans la pile d'exécution d'envoi en une étape d'API.",
      signalrTip:
        "Les requêtes de type 'Notification' n'attendent pas la fin de la demande : elles sont diffusées sur le flux asynchrone WebSocket (SignalR). Par conséquent, si le bénéficiaire a sa fenêtre Web ouverte, l'alerte surgit organiquement sans devoir exécuter des rafraîchissements continus de pages (Polling).",
      templatesIntro:
        "Fini les chaînes de caractères brutes d'e-mails : conception de textes ou HTML structurés dotés du moteur de rendu Liquid / Scriban (variables, boucles intégrées de remplacement).",
      templatesTitle: "Éditeur Logique de Gabarit (Scriban Templates)",
      testWebhookDesc:
        "Un 'Ping' formel qui simule une attaque de webhook factice pour vous garantir l'ouverture réseau des pares-feux de vos serveurs de réception clients.",
      title: "API de Webhooks et de Messagerie Asynchrone",
      unreadCountDesc:
        "Endpoint rapide qui renvoie le simple nombre atomique (Integer) pour peindre le point rouge (Badge) sur la clochette d'interface utilisateur en moins d'une fraction de seconde.",
      updateTemplateDesc: "Modification orthographique, textuelle et codage HTML du corps (Body).",
      updateWebhookDesc:
        "Sert de levier d'interruption temporaire pour geler l'abonnement du webhook aux événements (Pause/Actif).",
      webhooksIntro:
        "Inverser l'API : SCRIPE devient l'émetteur HTTP. Les systèmes externes (Serveurs de vos clients) consomment ces Post signés par sécurité cryptographique (HMAC) en cas d'événements de vie (Créations, Mises à jour, Activations).",
      webhooksTitle: "Points de Terminaison Webhook",
    },
  },
};

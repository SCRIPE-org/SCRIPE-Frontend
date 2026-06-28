/**
 * Docs security — FR
 * Auto-filled 25 keys from EN.
 */
export const fr = {
  security: {
    overview: {
      title: "Vue d'ensemble de la Sécurité",
      description:
        "Stratégie de défense à 5 couches, configuration CORS, limitation de débit et politiques de mots de passe.",
      intro:
        "SCRIPE met en œuvre une stratégie de sécurité de défense en profondeur (defense-in-depth).",
      layersTitle: "Couches de Défense de Sécurité",
      featuresTitle: "Fonctionnalités de Sécurité",
      featureJwt: "Authentification JWT",
      featureJwtDesc: "Jetons de courte durée avec actualisation et signature HMAC-SHA256.",
      feature2fa: "Double Authentification (2FA)",
      feature2faDesc: "Application 2FA basée sur TOTP (Google Authenticator) ou clés de secours.",
      featureRbac: "Permissions RBAC",
      featureRbacDesc: "Moteur de contrôle d'accès instantané basé sur les politiques (PBAC).",
      featureRateLimit: "Limitation de Débit (Rate Limiting)",
      featureRateLimitDesc:
        "Limitation globale DDoS, par IP, par point final et spécifique à l'authentification.",
      featureAudit: "Journaux d'Audit",
      featureAuditDesc:
        "Chaque action enregistre le qui, le quoi, le quand et le où en temps réel.",
      featureCors: "Configuration CORS",
      featureCorsDesc:
        "Validation d'origine stricte en production et ouverte sur localhost en développement.",
      corsTitle: "Configuration CORS",
      corsIntro:
        "Les stratégies diffèrent pour empêcher les attaques inter-origines non autorisées.",
      rateLimitTitle: "Politiques de Limitation de Débit",
      passwordTitle: "Politiques de Mots de Passe",
      securityWarning:
        "Revoyez toujours les paramètres de sécurité avant le déploiement en production.",
    },
    authDeep: {
      title: "Authentification en Profondeur",
      description:
        "Cycle de vie des JWT, hachage BCrypt, verrouillage de compte, 2FA, OAuth, OTP et gestion de session.",
      intro: "Analyse approfondie de tous les mécanismes d'authentification de la plateforme.",
      jwtLifecycleTitle: "Cycle de vie des Jetons JWT",
      jwtLifecycleIntro:
        "Les jetons d'accès ont une durée de vie très courte et sont renouvelés via un processus de rotation à usage unique.",
      tokenStructureTitle: "Structure des Jetons JWT",
      bcryptTitle: "Hachage de Mot de Passe BCrypt",
      bcryptIntro:
        "Chaque vérification prend intentionnellement environ 250 ms (facteur de charge : 12) pour anéantir les attaques par force brute.",
      lockoutTitle: "Verrouillage de Compte",
      lockoutIntro: "Après 5 tentatives infructueuses, le compte est verrouillé pour 15 minutes.",
      tfaTitle: "Authentification à Deux Facteurs (TOTP)",
      tfaIntro: "Les jetons de session 2FA temporaires exigent une validation TOTP finale.",
      externalAuthTitle: "Authentification Externe (OAuth)",
      externalAuthIntro: "S'intègre avec Google, Facebook, Apple et Microsoft.",
      otpTitle: "Système OTP (Mots de Passe à Usage Unique)",
      otpIntro:
        "Codes à 6 chiffres pour les réinitialisations et vérifications d'e-mail/téléphone.",
      impersonationTitle: "Usurpation d'Identité (Impersonation)",
      impersonationIntro:
        "Les SuperAdmins peuvent usurper l'identité d'autres comptes pour le support technique, tout en conservant une trace d'audit détaillée.",
      impersonationWarning:
        "Opération hautement privilégiée. Le système bloque l'usurpation d'identité sur les comptes de niveau égal ou supérieur.",
      sessionTitle: "Gestion des Sessions",
      sessionIntro:
        "Modèle sans état (stateless). Les jetons JWT gèrent l'autorisation client sans saturer le serveur.",
      cookieAuthTip:
        "Pour une sécurité maximale, configurez les jetons d'actualisation pour qu'ils soient envoyés en tant que cookies HttpOnly, Secure et SameSite=Strict.",
    },
    sso: {
      title: "Authentification Unique (SSO)",
      description: "Authentification OIDC, liaison d'identité externe et applications OAuth.",
      intro:
        "Le système SCRIPE prend en charge l'authentification via des fournisseurs externes sur la base du protocole OIDC et la provision d'identifiants via des applications OAuth. Le système tient compte des locataires, avec une sécurité PKCE stricte.",
      architectureTitle: "Architecture d'Authentification OIDC / OAuth",
      endpointsTitle: "Points de Terminaux (Endpoints) et Flux",
      flowIntro:
        "Le processus d'authentification SSO implique un flux en plusieurs étapes pour garantir une sécurité extrême :",
      authEndpointTitle: "1. Endpoint d'Autorisation",
      authEndpointDesc:
        "Redirige l'utilisateur vers la page de connexion de l'IdP externe. Intègre la vérification PKCE et le transfert du jeton d'état.",
      callbackEndpointTitle: "2. Endpoint de Retour (Callback)",
      callbackEndpointDesc:
        "Réceptionne l'utilisateur après une authentification réussie et échange le code d'autorisation contre des jetons (tokens) côté serveur – sans aucune implication du navigateur.",
      linkingTitle: "Liaison et Traitement des Identités",
      linkingIntro:
        "À l'issue de la connexion, l'e-mail est vérifié par rapport à la base de données. S'il s'agit d'une première connexion, l'enregistrement OIDC est lié au compte SCRIPE interne afin d'éviter les doublons.",
      pkceWarning:
        "La prise en charge des flux OAuth implicites obsolètes est supprimée. Le protocole PKCE est exigé dans toutes les variantes.",
      howItWorksTitle: "How SSO Works",
      howItWorksContent:
        "SCRIPE uses the Authorization Code Flow with PKCE (Proof Key for Code Exchange) for SSO. This is the most secure OAuth2 flow, recommended by the OAuth 2.1 specification for all client types.",
      step1Title: "1. Provider Discovery",
      step1Content:
        "The login page fetches available SSO providers via GET /auth/oidc/providers/admin. Only enabled providers for the current login context (admin/user) are returned.",
      step2Title: "2. PKCE Challenge",
      step2Content:
        "When the user clicks an SSO button, the frontend calls POST /auth/oidc/challenge. The backend generates a code_verifier, computes the code_challenge (SHA-256), and returns the authorization URL.",
      step3Title: "3. IdP Redirect",
      step3Content:
        "The frontend stores PKCE state (code_verifier, state, providerId) in sessionStorage, then redirects the user to the external IdP's authorization endpoint.",
      step4Title: "4. User Authentication",
      step4Content:
        "The user authenticates at the external IdP (Azure AD, Google, Okta, etc.) and grants consent for the requested scopes.",
      step5Title: "5. Callback & Token Exchange",
      step5Content:
        "The IdP redirects to /sso/callback with an authorization code. The frontend retrieves PKCE state from sessionStorage, validates the state parameter, and calls POST /auth/oidc/callback. The backend exchanges the code for tokens using the code_verifier.",
      pkceTitle: "PKCE Security Model",
      pkceContent:
        "PKCE prevents authorization code interception attacks by ensuring that only the client that initiated the flow can exchange the code. The code_verifier is never sent over the network — only its SHA-256 hash (code_challenge) is sent during the challenge step.",
      entityModelTitle: "Identity Provider Entity",
      entityModelContent:
        "The IdentityProvider entity stores all OIDC configuration for an external IdP. Each provider is optionally scoped to a tenant (TenantId = null means system-wide).",
      linkingContent:
        "Before SSO login works, a SCRIPE admin/user must link their account to the external identity. This creates an ExternalLogin record mapping the provider's subject ID to the SCRIPE account.",
      oauthAppsTitle: "OAuth Applications",
      oauthAppsContent:
        "OAuth Applications are third-party apps that authenticate against SCRIPE as an OIDC server. Each app gets a Client ID and Client Secret, with configurable redirect URIs, scopes, and PKCE enforcement.",
      claimMappingTitle: "Claim Mapping",
      claimMappingContent:
        "When an external IdP uses non-standard claim names, the ClaimMappingJson field maps them to SCRIPE's expected claims. If null, standard OIDC claim names (sub, email, name) are used.",
      tenantScopingTitle: "Tenant Scoping",
      tenantScopingContent:
        "Identity Providers are tenant-scoped via the TenantId column. Providers with null TenantId are system-wide (available to all tenants). The backend automatically filters providers by the current admin's tenant context.",
      tenantScopingNote:
        "Host admins can manage any tenant's SSO providers by using the 'Enter Tenant World' feature from the Tenants page. This scopes all API calls to the target tenant without needing to log in as that tenant's admin.",
      apiTitle: "API Endpoints",
    },
    dataProtection: {
      title: "Protection des Données",
      description:
        "Isolation des locataires, cryptage des données au repos et en transit, champs restreints et conformité RGPD.",
      intro: "SCRIPE protège les données à chaque couche de la base de données au réseau.",
      tenantIsolationTitle: "Isolation des Données des Locataires",
      tenantIsolationIntro:
        "Les données sont isolées via le filtre global d'EF Core appliqué dynamiquement à chaque requête LINQ.",
      tenantScopingTitle: "Ciblage du Filtre de Requête",
      tenantServicesTitle: "Services Sensibles aux Locataires (Tenant-Aware)",
      tenantServicesIntro:
        "Les services injectent IDataScopeService pour récupérer l'ID du locataire à la volée depscripe le JWT.",
      dataAtRestTitle: "Chiffrement des Données au Repos",
      dataAtRestIntro:
        "Utilisation du TDE au niveau de la base de données et de l'API de Protection des Données ASP.NET Core.",
      dataInTransitTitle: "Chiffrement des Données en Transit",
      dataInTransitIntro:
        "Toutes les communications en production passent par TLS 1.2+ ou supérieur avec en-têtes HSTS.",
      restrictedFieldsTitle: "Champs Restreints (Sécurité au Niveau des Champs)",
      restrictedFieldsIntro:
        "La FieldProjectionMiddleware filtre le JSON sortant pour supprimer les champs sensibles non autorisés pour ce rôle.",
      idEncryptionTitle: "Chiffrement des ID",
      idEncryptionIntro:
        "Possibilité de chiffrer les ID (Guid) des entités en AES-256 dans les réponses API pour prévenir les attaques d'énumération.",
      gdprTitle: "Conformité RGPD",
      gdprIntro:
        "SCRIPE gère la portabilité, le consentement et le droit à l'oubli des utilisateurs (right to delete).",
      rightToDeleteTitle: "Droit à l'Effacement",
      dataPortabilityTitle: "Portabilité des Données",
      consentTitle: "Gestion du Consentement",
      retentionTitle: "Politiques de Conservation des Données",
      auditTrailTitle: "Piste d'Audit pour la Conformité",
      bypassWarning:
        "L'appel de IgnoreQueryFilters() court-circuite TOUS les filtres. Ajoutez toujours un .Where() limitant au locataire dans vos requêtes pour empêcher les fuites de données.",
    },
    apiSecurity: {
      title: "Sécurité de l'API",
      description:
        "Limitation de débit, configuration CORS, validation des entrées, protection CSRF et prévention des attaques par rejeu.",
      intro:
        "SCRIPE applique plusieurs couches de sécurité directement sur les terminaux (endpoints) HTTP de l'API REST.",
      rateLimitTitle: "Limitation de Débit (Rate Limiting)",
      rateLimitIntro:
        "Implémentée via le limiteur intégré d'ASP.NET Core (IP, endpoint, et DDoS général).",
      corsTitle: "Configuration CORS",
      corsIntro:
        "Les origines non reconnues voient leurs requêtes bloquées par le navigateur en environnement de production.",
      inputValidationTitle: "Validation des Entrées",
      inputValidationIntro:
        "Interception à 100% des mauvaises données via FluentValidation avant même de lancer le traitement du gestionnaire.",
      csrfTitle: "Protection CSRF",
      csrfIntro:
        "SCRIPE s'appuie sur la nature des jetons Bearer et la configuration SameSite des cookies pour rendre les requêtes insensibles aux CSRF.",
      headersTitle: "En-têtes de Sécurité (Security Headers)",
      headersIntro:
        "Inclut Content-Security-Policy, X-Content-Type-Options et X-Frame-Options par défaut.",
      headersTip:
        "Vérifiez vos en-têtes via securityheaders.com pour obtenir le score maximal (A+).",
      replayTitle: "Prévention des Attaques par Rejeu (Replay Attacks)",
      replayIntro:
        "L'horodatage strict et la rotation systématique des jetons d'actualisation annihilent les attaques par rejeu.",
    },
    middlewarePipeline: {
      title: "Pipeline de Middlewares",
      description:
        "11 composants middleware exécutés dans un ordre strict allant de la gestion des exceptions au contexte du locataire.",
      intro:
        "Le pipeline de requêtes HTTP de SCRIPE garantit que chaque flux subit le bon traitement contextuel avant d'atteindre votre code métier.",
      overviewTitle: "Aperçu du Pipeline",
      overviewIntro:
        "L'ordre d'exécution (de haut en bas) est primordial et un court-circuit empêche les couches suivantes d'être exécutées.",
      globalExceptionTitle: "1. Gestionnaire d'Exceptions Global",
      globalExceptionIntro:
        "Capture tous les crashs 500 pour envoyer un JSON propre sans exposer de détails en production.",
      correlationIdTitle: "2. ID de Corrélation",
      correlationIdIntro:
        "Génère un UUID commun injecté à la fois dans les requêtes API et les journaux de la base de données pour la traçabilité.",
      requestLoggingTitle: "3. Journalisation des Requêtes (Request Logging)",
      requestLoggingIntro:
        "Journalise via Serilog en masquant dynamiquement le corps des requêtes liées à des mots de passe.",
      cookieAuthTitle: "4. Conversion de Cookie à Bearer",
      cookieAuthIntro:
        "Permet aux navigateurs front-end d'envoyer un cookie HttpOnly tout en laissant l'API travailler en Bearer token pur.",
      tenantContextTitle: "5. Contexte du Locataire (Tenant Context)",
      tenantContextIntro:
        "Le middleware le plus important : extrait l'ID du locataire et l'affecte au scope de la base de données de la requête en cours.",
      tenantContextNote:
        "Le contexte du locataire DOIT fonctionner APRÈS l'authentification et AVANT la base de données.",
      cacheHeadersTitle: "6. En-têtes de Cache",
      cacheHeadersIntro:
        "Force les API à utiliser le no-cache et les fichiers statiques à utiliser les règles max-age/ETag.",
      fieldProjectionTitle: "7. Projection de Champs",
      fieldProjectionIntro:
        "Détruit silencieusement les propriétés (mise à null) du JSON de réponse si le rôle de l'utilisateur l'interdit.",
      observabilityTitle: "Middleware d'Observabilité",
      observabilityIntro:
        "Expose des métriques structurées OpenTelemetry au format Prometheus sur l'endpoint /metrics.",
      registrationTitle: "Ordre d'Enregistrement",
      registrationIntro: "Défini dans la classe Program.cs principale.",
      summaryTitle: "Résumé des Middlewares",
      orderWarning:
        "La modification de cet ordre déclenchera probablement des pannes critiques ou des failles de sécurité.",
    },
    auditCompliance: {
      title: "Audit et Conformité",
      description:
        "Pipeline d'audit complet, suivi des entités, streaming SignalR, export CSV/Excel/PDF et fonctionnalités de conformité.",
      intro: "Un journal complet de chaque modification de données et de chaque requête API.",
      architectureTitle: "Architecture d'Audit",
      architectureIntro:
        "Le système d'audit comprend la journalisation des requêtes HTTP et l'interception des mutations d'entités en base de données. Les métadonnées de requête sont enregistrées de manière asynchrone au niveau de l'hôte via le RequestLoggingMiddleware, tandis que les modifications en base de données sont capturées par l'AuditableEntityInterceptor avant SaveChanges.",
      interceptorTitle: "Intercepteur de Changement d'Entité",
      interceptorIntro:
        "L'AuditableEntityInterceptor se branche sur le pipeline SaveChangesAsync d'EF Core. Pour chaque entité ajoutée, modifiée ou supprimée (y compris les suppressions logiques), il capture les anciennes et nouvelles valeurs sous format JSON, l'utilisateur auteur du changement et le timestamp. Il ignore les entités AuditLog pour éviter une récursion infinie.",
      auditLogEntityTitle: "Structure de l'Entité AuditLog",
      signalrTitle: "Diffusion SignalR en Temps Réel",
      signalrIntro:
        "Les journaux d'audit sont diffusés en temps réel via le hub SignalR AuditHub. Les clients administrateurs connectés reçoivent des notifications instantanées lors de toute modification de données, ce qui permet des tableaux de bord de surveillance en direct.",
      exportTitle: "Capacités d'Exportation",
      exportIntro: "Fichiers PDF à des fins légales ou Excel/CSV pour un retraitement Big Data.",
      exportDetail:
        "L'AuditExportService fournit des exports multi-formats. L'export CSV utilise CsvHelper en forçant les guillemets (RFC 4180) pour éviter l'injection CSV, avec un préambule UTF-8 BOM pour Excel. L'export Excel génère un classeur ClosedXML avec trois onglets : Executive Summary (statistiques/KPI), Audit Data (avec filtres automatiques, en-têtes figés et mise en forme conditionnelle vert/rouge) et Security Analysis. L'export PDF utilise le moteur QuestPDF, marqué comme obsolète pour les grands jeux de données en raison de sa consommation mémoire. Pour protéger les ressources, les exports sont limités à 10 000 lignes et chargés entièrement en mémoire avant l'envoi.",
      queryApiTitle: "API de Requête et Exportation",
      queryApiIntro:
        "L'API d'audit offre des fonctionnalités de recherche, de filtrage et d'exportation pour les journaux d'audit. Tous les endpoints nécessitent une authentification administrateur et la permission audit.view ou audit.export.",
      querySearchDesc: "Rechercher et filtrer les journaux.",
      queryExportCsvDesc: "Exporter sous format fichier CSV.",
      queryExportExcelDesc: "Exporter sous tableur Excel.",
      queryExportPdfDesc: "Exporter sous document PDF.",
      scopingTitle: "Ciblage hiérarchique des locataires et isolation de sécurité",
      scopingDetail:
        "L'isolation des données est appliquée dynamiquement lors de l'exécution des requêtes. Le DataScopeService résout la portée effective de l'administrateur selon une chaîne de priorité stricte : ContextTenant (impersonnalisation via des en-têtes chiffrés AES), surcharges de permission, SystemProtectedAdmin, Hierarchy (incluant les enfants) ou OwnTenant. Les descendants sont parcourus en temps fixe via des chemins matérialisés, traduits en requêtes SQL LIKE indexées. Le dépôt applique AuditByTenantScopeSpec pour assurer le filtre 'WHERE TenantId IN (...)', tandis que l'accès direct par identifiant est vérifié par GetAuditLogDetailQueryHandler afin d'éviter toute escalade horizontale de privilèges.",
      complianceTitle: "Fonctionnalités de Conformité",
      immutableTitle: "Journaux Immuables",
      immutableDesc:
        "Les journaux sont verrouillés et stored en lecture seule, empêchant toute suppression ou mise à jour après validation.",
      fullTraceTitle: "Traçabilité Totale",
      fullTraceDesc:
        "Capture les en-têtes HTTP, le contexte de requête et les mutations d'entité pour garantir une traçabilité complète.",
      searchableTitle: "Facilement Consultable",
      searchableDesc:
        "Des index optimisés sur Timestamp, UserId, EventType et CorrelationId permettent des recherches instantanées.",
      tenantScopedTitle: "Cloisonné par Locataire",
      tenantScopedDesc:
        "Les journaux sont isolés automatiquement par TenantId et arborescence de descendants, évitant toute fuite.",
      realtimeTitle: "Temps Réel",
      realtimeDesc:
        "Diffusez les événements de sécurité en direct vers des tableaux de bord SignalR isolés par locataire.",
      retentionTitle: "Politique de Rétention",
      retentionDesc:
        "Les périodes de rétention configurées purgent automatiquement les journaux expirés via des tâches de fond.",
    },
  },
};

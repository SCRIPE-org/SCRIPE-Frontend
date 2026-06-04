/**
 * Docs security — FR
 * Auto-filled 25 keys from EN.
 */
export const fr = {
  security: {
    apiSecurity: {
      corsIntro:
        "Les origines non reconnues voient leurs requêtes bloquées par le navigateur en environnement de production.",
      corsTitle: "Configuration CORS",
      csrfIntro:
        "SCRIPE s'appuie sur la nature des jetons Bearer et la configuration SameSite des cookies pour rendre les requêtes insensibles aux CSRF.",
      csrfTitle: "Protection CSRF",
      description:
        "Limitation de débit, configuration CORS, validation des entrées, protection CSRF et prévention des attaques par rejeu.",
      headersIntro:
        "Inclut Content-Security-Policy, X-Content-Type-Options et X-Frame-Options par défaut.",
      headersTip:
        "Vérifiez vos en-têtes via securityheaders.com pour obtenir le score maximal (A+).",
      headersTitle: "En-têtes de Sécurité (Security Headers)",
      inputValidationIntro:
        "Interception à 100% des mauvaises données via FluentValidation avant même de lancer le traitement du gestionnaire.",
      inputValidationTitle: "Validation des Entrées",
      intro:
        "SCRIPE applique plusieurs couches de sécurité directement sur les terminaux (endpoints) HTTP de l'API REST.",
      rateLimitIntro:
        "Implémentée via le limiteur intégré d'ASP.NET Core (IP, endpoint, et DDoS général).",
      rateLimitTitle: "Limitation de Débit (Rate Limiting)",
      replayIntro:
        "L'horodatage strict et la rotation systématique des jetons d'actualisation annihilent les attaques par rejeu.",
      replayTitle: "Prévention des Attaques par Rejeu (Replay Attacks)",
      title: "Sécurité de l'API",
    },
    auditCompliance: {
      architectureIntro:
        "Combine l'AuditableEntityInterceptor d'EF Core et le RequestLoggingMiddleware (qui capture également les mutations de modification d'état pour le journal d'audit).",
      architectureTitle: "Architecture d'Audit",
      auditLogEntityTitle: "Structure de l'Entité AuditLog",
      complianceTitle: "Fonctionnalités de Conformité",
      description:
        "Pipeline de journalisation immuable interceptant les changements de la base de données et exportant vers Excel/PDF.",
      exportIntro: "Fichiers PDF à des fins légales ou Excel/CSV pour un retraitement Big Data.",
      exportTitle: "Capacités d'Exportation",
      fullTraceTitle: "Traçabilité Totale",
      immutableTitle: "Journaux Immuables",
      interceptorIntro:
        "S'exécute à l'intérieur de l'ORM, calculant l'ancienne et la nouvelle valeur, l'auteur de l'action, puis sérialise le tout en JSON.",
      interceptorTitle: "Intercepteur de Changement d'Entité",
      intro: "SCRIPE est dotée d'une suite permettant une piste d'audit juridique inaltérable.",
      queryApiIntro:
        "Permet des recherches extrêmement rapides combinées au système RBAC pour le filtrage.",
      queryApiTitle: "API de Requête et Exportation",
      queryExportCsvDesc: "Exporter sous format fichier CSV.",
      queryExportExcelDesc: "Exporter sous tableur Excel.",
      queryExportPdfDesc: "Exporter sous document PDF.",
      querySearchDesc: "Rechercher et filtrer les journaux.",
      realtimeTitle: "Temps Réel",
      retentionTitle: "Politique de Rétention",
      searchableTitle: "Facilement Consultable",
      signalrIntro:
        "Les journaux d'audit sont envoyés aux écrans de la salle de contrôle via le canal AuditHub de SignalR dès que l'événement se produit.",
      signalrTitle: "Diffusion SignalR en Temps Réel",
      tenantScopedTitle: "Cloisonné par Locataire",
      title: "Audit et Conformité",
    },
    authDeep: {
      bcryptIntro:
        "Chaque vérification prend intentionnellement environ 250 ms (facteur de charge : 12) pour anéantir les attaques par force brute.",
      bcryptTitle: "Hachage de Mot de Passe BCrypt",
      cookieAuthTip:
        "Pour une sécurité maximale, configurez les jetons d'actualisation pour qu'ils soient envoyés en tant que cookies HttpOnly, Secure et SameSite=Strict.",
      description:
        "Cycle de vie des JWT, hachage BCrypt, verrouillage de compte, 2FA, OAuth, OTP et gestion de session.",
      externalAuthIntro: "S'intègre avec Google, Facebook, Apple et Microsoft.",
      externalAuthTitle: "Authentification Externe (OAuth)",
      impersonationIntro:
        "Les SuperAdmins peuvent usurper l'identité d'autres comptes pour le support technique, tout en conservant une trace d'audit détaillée.",
      impersonationTitle: "Usurpation d'Identité (Impersonation)",
      impersonationWarning:
        "Opération hautement privilégiée. Le système bloque l'usurpation d'identité sur les comptes de niveau égal ou supérieur.",
      intro: "Analyse approfondie de tous les mécanismes d'authentification de la plateforme.",
      jwtLifecycleIntro:
        "Les jetons d'accès ont une durée de vie très courte et sont renouvelés via un processus de rotation à usage unique.",
      jwtLifecycleTitle: "Cycle de vie des Jetons JWT",
      lockoutIntro: "Après 5 tentatives infructueuses, le compte est verrouillé pour 15 minutes.",
      lockoutTitle: "Verrouillage de Compte",
      otpIntro:
        "Codes à 6 chiffres pour les réinitialisations et vérifications d'e-mail/téléphone.",
      otpTitle: "Système OTP (Mots de Passe à Usage Unique)",
      passkeysIntro:
        "Les clés d'accès (Passkeys) fournissent un mécanisme d'authentification sans mot de passe utilisant la cryptographie sur clé publique. Lors de l'enregistrement, le navigateur génère une paire de clés publique-privée, envoie la clé publique et l'identifiant d'identification au serveur et conserve la clé privée en toute sécurité dans l'authentificateur de l'appareil. Lors de la connexion, le serveur émet un défi que l'authentificateur signe à l'aide de la clé privée.",
      passkeysTitle: "Passkeys (WebAuthn / FIDO2)",
      qrIntro:
        "La connexion par code QR permet aux utilisateurs de s'authentifier instantanément sur un client Web en scannant un code QR avec leur application mobile déjà authentifiée. Le client Web interroge l'état de la session jusqu'à ce que l'application mobile confirme la session en signant le jeton de session et en le soumettant avec les informations d'identification de session actives de l'utilisateur.",
      qrTitle: "Handshake de Connexion par Code QR",
      samlIntro:
        "SAML 2.0 permet l'authentification unique (SSO) d'entreprise en fédérant l'authentification entre SCRIPE (agissant en tant que fournisseur de services) et les fournisseurs d'identité d'entreprise (IdP) comme Okta ou Active Directory. Le handshake utilise des assertions XML signées avec des certificats X.509 pour vérifier l'identité et mapper les rôles.",
      samlTitle: "Fédération d'Entreprise SAML 2.0",
      sessionIntro:
        "Modèle sans état (stateless). Les jetons JWT gèrent l'autorisation client sans saturer le serveur.",
      sessionTitle: "Gestion des Sessions",
      ssoSuspensionIntro:
        "Le ExternalLoginCommandHandler inclut désormais une porte de sécurité pour la suspension du locataire. Avant de délivrer un JWT après une authentification SSO/OIDC, le gestionnaire vérifie le statut du locataire de l'administrateur. Si le locataire est suspendu ou annulé, la connexion est rejetée avec une erreur localisée, empêchant les utilisateurs désactivés de contourner les contrôles de connexion standard via SSO.",
      ssoSuspensionTitle: "Porte de Suspension de Locataire SSO",
      ssoSuspensionWarning:
        "Sans cette porte, les utilisateurs SSO pourraient s'authentifier via un IdP externe (par exemple, Google, Azure AD) et recevoir un JWT SCRIPE valide même si leur locataire a été suspendu ou annulé. Il s'agissait d'une faille de sécurité critique qui a été corrigée.",
      tfaIntro: "Les jetons de session 2FA temporaires exigent une validation TOTP finale.",
      tfaTitle: "Authentification à Deux Facteurs (TOTP)",
      title: "Authentification en Profondeur",
      tokenStructureTitle: "Structure des Jetons JWT",
    },
    dataProtection: {
      auditTrailTitle: "Piste d'Audit pour la Conformité",
      bypassWarning:
        "L'appel de IgnoreQueryFilters() court-circuite TOUS les filtres. Ajoutez toujours un .Where() limitant au locataire dans vos requêtes pour empêcher les fuites de données.",
      consentTitle: "Gestion du Consentement",
      dataAtRestIntro:
        "Utilisation du TDE au niveau de la base de données et de l'API de Protection des Données ASP.NET Core.",
      dataAtRestTitle: "Chiffrement des Données au Repos",
      dataInTransitIntro:
        "Toutes les communications en production passent par TLS 1.2+ ou supérieur avec en-têtes HSTS.",
      dataInTransitTitle: "Chiffrement des Données en Transit",
      dataPortabilityTitle: "Portabilité des Données",
      description:
        "Isolation des locataires, cryptage des données au repos et en transit, champs restreints et conformité RGPD.",
      gdprIntro:
        "SCRIPE gère la portabilité, le consentement et le droit à l'oubli des utilisateurs (right to delete).",
      gdprTitle: "Conformité RGPD",
      idEncryptionIntro:
        "Possibilité de chiffrer les ID (Guid) des entités en AES-256 dans les réponses API pour prévenir les attaques d'énumération.",
      idEncryptionTitle: "Chiffrement des ID",
      intro: "SCRIPE protège les données à chaque couche de la base de données au réseau.",
      restrictedFieldsIntro:
        "La FieldProjectionMiddleware filtre le JSON sortant pour supprimer les champs sensibles non autorisés pour ce rôle.",
      restrictedFieldsTitle: "Champs Restreints (Sécurité au Niveau des Champs)",
      retentionTitle: "Politiques de Conservation des Données",
      rightToDeleteTitle: "Droit à l'Effacement",
      tenantIsolationIntro:
        "Les données sont isolées via le filtre global d'EF Core appliqué dynamiquement à chaque requête LINQ.",
      tenantIsolationTitle: "Isolation des Données des Locataires",
      tenantScopingTitle: "Ciblage du Filtre de Requête",
      tenantServicesIntro:
        "Les services injectent IDataScopeService pour récupérer l'ID du locataire à la volée depuis le JWT.",
      tenantServicesTitle: "Services Sensibles aux Locataires (Tenant-Aware)",
      title: "Protection des Données",
    },
    middlewarePipeline: {
      cacheHeadersIntro:
        "Force les API à utiliser le no-cache et les fichiers statiques à utiliser les règles max-age/ETag.",
      cacheHeadersTitle: "6. En-têtes de Cache",
      cookieAuthIntro:
        "Permet aux navigateurs front-end d'envoyer un cookie HttpOnly tout en laissant l'API travailler en Bearer token pur.",
      cookieAuthTitle: "4. Conversion de Cookie à Bearer",
      correlationIdIntro:
        "Génère un UUID commun injecté à la fois dans les requêtes API et les journaux de la base de données pour la traçabilité.",
      correlationIdTitle: "2. ID de Corrélation",
      description:
        "11 composants middleware exécutés dans un ordre strict allant de la gestion des exceptions au contexte du locataire.",
      fieldProjectionIntro:
        "Détruit silencieusement les propriétés (mise à null) du JSON de réponse si le rôle de l'utilisateur l'interdit.",
      fieldProjectionTitle: "7. Projection de Champs",
      globalExceptionIntro:
        "Capture tous les crashs 500 pour envoyer un JSON propre sans exposer de détails en production.",
      globalExceptionTitle: "1. Gestionnaire d'Exceptions Global",
      intro:
        "Le pipeline de requêtes HTTP de SCRIPE garantit que chaque flux subit le bon traitement contextuel avant d'atteindre votre code métier.",
      observabilityIntro:
        "Expose des métriques structurées OpenTelemetry au format Prometheus sur l'endpoint /metrics.",
      observabilityTitle: "Middleware d'Observabilité",
      orderWarning:
        "La modification de cet ordre déclenchera probablement des pannes critiques ou des failles de sécurité.",
      overviewIntro:
        "L'ordre d'exécution (de haut en bas) est primordial et un court-circuit empêche les couches suivantes d'être exécutées.",
      overviewTitle: "Aperçu du Pipeline",
      registrationIntro: "Défini dans la classe Program.cs principale.",
      registrationTitle: "Ordre d'Enregistrement",
      requestLoggingIntro:
        "Journalise via Serilog en masquant dynamiquement le corps des requêtes liées à des mots de passe.",
      requestLoggingTitle: "3. Journalisation des Requêtes (Request Logging)",
      summaryTitle: "Résumé des Middlewares",
      tenantContextIntro:
        "Le middleware le plus important : extrait l'ID du locataire et l'affecte au scope de la base de données de la requête en cours.",
      tenantContextNote:
        "Le contexte du locataire DOIT fonctionner APRÈS l'authentification et AVANT la base de données.",
      tenantContextTitle: "5. Contexte du Locataire (Tenant Context)",
      title: "Pipeline de Middlewares",
    },
    overview: {
      corsIntro:
        "Les stratégies diffèrent pour empêcher les attaques inter-origines non autorisées.",
      corsTitle: "Configuration CORS",
      description:
        "Stratégie de défense à 5 couches, configuration CORS, limitation de débit et politiques de mots de passe.",
      feature2fa: "Double Authentification (2FA)",
      feature2faDesc: "Application 2FA basée sur TOTP (Google Authenticator) ou clés de secours.",
      featureAudit: "Journaux d'Audit",
      featureAuditDesc:
        "Chaque action enregistre le qui, le quoi, le quand et le où en temps réel.",
      featureCors: "Configuration CORS",
      featureCorsDesc:
        "Validation d'origine stricte en production et ouverte sur localhost en développement.",
      featureJwt: "Authentification JWT",
      featureJwtDesc: "Jetons de courte durée avec actualisation et signature HMAC-SHA256.",
      featureRateLimit: "Limitation de Débit (Rate Limiting)",
      featureRateLimitDesc:
        "Limitation globale DDoS, par IP, par point final et spécifique à l'authentification.",
      featureRbac: "Permissions RBAC",
      featureRbacDesc: "Moteur de contrôle d'accès instantané basé sur les politiques (PBAC).",
      featuresTitle: "Fonctionnalités de Sécurité",
      intro:
        "SCRIPE met en œuvre une stratégie de sécurité de défense en profondeur (defense-in-depth).",
      layersTitle: "Couches de Défense de Sécurité",
      passwordTitle: "Politiques de Mots de Passe",
      rateLimitTitle: "Politiques de Limitation de Débit",
      securityWarning:
        "Revoyez toujours les paramètres de sécurité avant le déploiement en production.",
      title: "Vue d'ensemble de la Sécurité",
    },
    sso: {
      apiTitle: "API Endpoints",
      architectureTitle: "Architecture d'Authentification OIDC / OAuth",
      authEndpointDesc:
        "Redirige l'utilisateur vers la page de connexion de l'IdP externe. Intègre la vérification PKCE et le transfert du jeton d'état.",
      authEndpointTitle: "1. Endpoint d'Autorisation",
      callbackEndpointDesc:
        "Réceptionne l'utilisateur après une authentification réussie et échange le code d'autorisation contre des jetons (tokens) côté serveur – sans aucune implication du navigateur.",
      callbackEndpointTitle: "2. Endpoint de Retour (Callback)",
      claimMappingContent:
        "When an external IdP uses non-standard claim names, the ClaimMappingJson field maps them to SCRIPE's expected claims. If null, standard OIDC claim names (sub, email, name) are used.",
      claimMappingTitle: "Claim Mapping",
      description: "Authentification OIDC, liaison d'identité externe et applications OAuth.",
      endpointsTitle: "Points de Terminaux (Endpoints) et Flux",
      entityModelContent:
        "The IdentityProvider entity stores all OIDC configuration for an external IdP. Each provider is optionally scoped to a tenant (TenantId = null means system-wide).",
      entityModelTitle: "Identity Provider Entity",
      flowIntro:
        "Le processus d'authentification SSO implique un flux en plusieurs étapes pour garantir une sécurité extrême :",
      howItWorksContent:
        "SCRIPE uses the Authorization Code Flow with PKCE (Proof Key for Code Exchange) for SSO. This is the most secure OAuth2 flow, recommended by the OAuth 2.1 specification for all client types.",
      howItWorksTitle: "How SSO Works",
      intro:
        "Le système SCRIPE prend en charge l'authentification via des fournisseurs externes sur la base du protocole OIDC et la provision d'identifiants via des applications OAuth. Le système tient compte des locataires, avec une sécurité PKCE stricte.",
      linkingContent:
        "Before SSO login works, a SCRIPE admin/user must link their account to the external identity. This creates an ExternalLogin record mapping the provider's subject ID to the SCRIPE account.",
      linkingIntro:
        "À l'issue de la connexion, l'e-mail est vérifié par rapport à la base de données. S'il s'agit d'une première connexion, l'enregistrement OIDC est lié au compte SCRIPE interne afin d'éviter les doublons.",
      linkingTitle: "Liaison et Traitement des Identités",
      oauthAppsContent:
        "OAuth Applications are third-party apps that authenticate against SCRIPE as an OIDC server. Each app gets a Client ID and Client Secret, with configurable redirect URIs, scopes, and PKCE enforcement.",
      oauthAppsTitle: "OAuth Applications",
      pkceContent:
        "PKCE prevents authorization code interception attacks by ensuring that only the client that initiated the flow can exchange the code. The code_verifier is never sent over the network — only its SHA-256 hash (code_challenge) is sent during the challenge step.",
      pkceTitle: "PKCE Security Model",
      pkceWarning:
        "La prise en charge des flux OAuth implicites obsolètes est supprimée. Le protocole PKCE est exigé dans toutes les variantes.",
      step1Content:
        "The login page fetches available SSO providers via GET /auth/oidc/providers/admin. Only enabled providers for the current login context (admin/user) are returned.",
      step1Title: "1. Provider Discovery",
      step2Content:
        "When the user clicks an SSO button, the frontend calls POST /auth/oidc/challenge. The backend generates a code_verifier, computes the code_challenge (SHA-256), and returns the authorization URL.",
      step2Title: "2. PKCE Challenge",
      step3Content:
        "The frontend stores PKCE state (code_verifier, state, providerId) in sessionStorage, then redirects the user to the external IdP's authorization endpoint.",
      step3Title: "3. IdP Redirect",
      step4Content:
        "The user authenticates at the external IdP (Azure AD, Google, Okta, etc.) and grants consent for the requested scopes.",
      step4Title: "4. User Authentication",
      step5Content:
        "The IdP redirects to /sso/callback with an authorization code. The frontend retrieves PKCE state from sessionStorage, validates the state parameter, and calls POST /auth/oidc/callback. The backend exchanges the code for tokens using the code_verifier.",
      step5Title: "5. Callback & Token Exchange",
      tenantScopingContent:
        "Identity Providers are tenant-scoped via the TenantId column. Providers with null TenantId are system-wide (available to all tenants). The backend automatically filters providers by the current admin's tenant context.",
      tenantScopingNote:
        "Host admins can manage any tenant's SSO providers by using the 'Enter Tenant World' feature from the Tenants page. This scopes all API calls to the target tenant without needing to log in as that tenant's admin.",
      tenantScopingTitle: "Tenant Scoping",
      title: "Authentification Unique (SSO)",
    },
  },
};

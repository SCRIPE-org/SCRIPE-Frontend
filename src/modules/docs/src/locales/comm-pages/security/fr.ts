/**
 * Docs page locale — FR
 */
export const fr = {
  commercial: {
    auditCompliance: {
      alerting: "Alertes en Temps Réel",
      alertingDesc:
        "Automatisez les alertes de sécurité via des webhooks ou Slack lorsque des seuils d'audit spécifiques à hauts privilèges sont franchis.",
      complianceContent:
        "SCRIPE offre une voie clé en main vers la conformité ISO 27001, SOC 2, HIPAA et RGPD. Avec une capture d'événements immuable, une attribution garantie et une isolation stricte, les auditeurs peuvent vérifier instantanément l'intégrité des données de votre locataire (tenant).",
      complianceTitle: "Conçu pour la Conformité",
      dashboard: "Tableau de Bord Visuel",
      dashboardDesc:
        "Explorez instantanément des gigaoctets de données d'audit à l'aide de nos tableaux de bord de reporting Vue/Next.js hautes performances.",
      description:
        "Un pipeline d'audit de qualité légale capturant les requêtes HTTP, les instantanés d'entités et les opérations de sécurité sans aucune perte de données.",
      exportContent:
        "Exportez des ensembles de données d'audit massifs directement vers des formats CSV ou Excel chiffrés, ou diffusez-les de manière sécurisée vers vos solutions SIEM existantes comme Splunk ou Datadog.",
      exportTitle: "Exportation Légal & SIEM",
      intro:
        "La gouvernance des données n'est pas négociable. SCRIPE dispose d'un système de journalisation d'audit de niveau militaire exécuté en arrière-plan, qui capture chaque mutation, tentative d'authentification et lecture critique à travers tout le monolithe sans dégrader les performances de l'API.",
      liveStream: "Flux SignalR en Direct",
      liveStreamDesc:
        "Observez les événements administratifs et de sécurité circuler en temps réel à travers la plateforme via des WebSockets protégés.",
      pipelineContent:
        "Construit sur le modèle de contrainte des intercepteurs d'Entity Framework Core, le pipeline d'audit prend un instantané temporel de vos entités avant et après mutation. Les changements sont sérialisés en JSON et stockés de manière immuable.",
      pipelineTitle: "Pipeline de Capture Asynchrone",
      realTimeContent:
        "Regardez votre système fonctionner avec une observabilité transparente. L'intégration de Webhooks et les flux SignalR fournissent des informations judiciaires instantanées, permettant à vos équipes DevSecOps de réagir de manière proactive plutôt que réactive.",
      realTimeTitle: "Observabilité en Temps Réel",
      retention: "Rétention Adaptative",
      retentionDesc:
        "Configurez des politiques de stockage à froid (cold-storage) qui archivent ou purgent automatiquement les journaux d'audit en fonction de vos limites temporelles de conformité spécifiques.",
      sourcesTitle: "Les Quatre Piliers de la Capture",
      title: "Moteur d'Audit & Conformité",
    },
    authSecurity: {
      apiTitle: "Gestion des Clés API",
      description:
        "Authentification JWT avancée, protection contre la force brute, sécurité multi-facteurs et politiques de mots de passe renforcées.",
      intro:
        "La sécurité est inscrite dans l'ADN de SCRIPE. Notre architecture d'identité Zero-Trust exploite une cryptographie de pointe, des politiques de mots de passe hautement configurables et une validation JWT stricte pour défendre votre application contre les vecteurs modernes.",
      jwtContent:
        "Nous utilisons des JSON Web Tokens (JWT) rapides et sans état, signés à l'aide de clés RSA asymétriques. Les jetons d'accès ont une courte durée de vie, tandis que les jetons d'actualisation (refresh tokens) sécurisés et HTTP-only garantissent des expériences utilisateur sans friction et sans compromettre la sécurité.",
      jwtTitle: "Protocole JWT Asymétrique",
      passwordContent:
        "Appliquez la complexité des mots de passe conforme au NIST. Dictez les longueurs requises, les combinaisons de caractères spéciaux et empêchez la réutilisation des mots de passe historiques sur des périodes configurables.",
      passwordTitle: "Politiques de Mots de Passe Adaptatives",
      sessionTitle: "Contrôle des Sessions Simultanées",
      title: "Authentification & Sécurité",
      twoFa1Content:
        "Intégrez de manière transparente des applications TOTP standard comme Google Authenticator ou Authy à l'aide de l'approvisionnement standard par code QR.",
      twoFa1Title: "OTP Basé sur le Temps (TOTP)",
      twoFa2Content:
        "Basculez sur la vérification par SMS sécurisée gérée par des intégrateurs tiers robustes (Twilio, Nexmo).",
      twoFa2Title: "Vérification par SMS",
      twoFa3Content:
        "Envoyez des codes de défi à usage unique via des solutions de messagerie SMTP intégrées avec des modèles Scriban personnalisables.",
      twoFa3Title: "OTP par E-mail",
      twoFa4Content:
        "Fournissez des codes de récupération imprimables et cryptographiquement sécurisés pour les scénarios de reprise après sinistre.",
      twoFa4Title: "Codes de Récupération Sécurisés",
      twoFaContent:
        "Les mots de passe seuls sont insuffisants. SCRIPE exige nativement des barrières de vérification secondaire dynamiques, protégeant vos utilisateurs même en cas de bourrage d'identifiants (credential stuffing) ou de phishing.",
      twoFaTitle: "Authentification Multi-Facteurs (MFA)",
    },
    complianceReadiness: {
      auditReadyContent:
        "Les auditeurs ne veulent pas de promesses ; ils veulent des preuves. SCRIPE fournit des journaux exportables et inviolables de chaque invocation d'API, escalade de privilèges et mutation de données, transformant une préparation SOC 2 de 6 mois en une formalité de 2 semaines.",
      auditReadyTitle: "Artefacts de Preuve Instantanés",
      checklistTitle: "La Voie Rapide vers la Conformité",
      consentMgmt: "Gestion Avancée du Consentement",
      consentMgmtDesc:
        "Suivez, versionnez et appliquez par programme le consentement de l'utilisateur à travers plusieurs politiques de confidentialité et itérations des conditions d'utilisation.",
      dataMinimization: "Minimisation Intelligente des Données",
      dataMinimizationDesc:
        "Expirez ou masquez automatiquement les IPI (Informations Personnelles Identifiables) de vos bases de données lorsque les politiques de rétention sont atteintes.",
      dataPortability: "Portabilité Instantanée des Données",
      dataPortabilityDesc:
        "Permettez aux utilisateurs de télécharger en toute sécurité une archive cryptographique de l'intégralité de leur empreinte de données dans des formats JSON lisibles par machine.",
      description:
        "Des contrôles techniques préconfigurés permettant une certification extrêmement rapide pour les normes ISO 27001, SOC 2 et RGPD.",
      disclaimer:
        "Avertissement : SCRIPE fournit la base technique ; consultez un conseiller juridique pour la conformité procédurale.",
      frameworkIntro:
        "Atteindre la conformité fait généralement dérailler les feuilles de route d'ingénierie pendant des mois. SCRIPE raccourcit considérablement cette courbe en intégrant les contrôles techniques les plus difficiles directement dans le framework de base.",
      frameworkTitle: "Support Accéléré du Framework",
      gdprTitle: "Natif RGPD & CCPA",
      intro:
        "Les cadres réglementaires exigent une gouvernance rigoureuse des données. SCRIPE accélère votre chemin vers la certification en intégrant des contrôles d'audit, de chiffrement et de confidentialité de niveau militaire au cœur même de l'architecture de l'application.",
      rightToErasure: "Droit à l'Oubli Orchestré",
      rightToErasureDesc:
        "Exécutez des suppressions douces (soft) ou définitives (hard) à l'échelle de la plateforme qui se propagent automatiquement sur toutes les tables relationnelles.",
      securityControlsTitle: "Contrôles de Sécurité Mappés",
      title: "Préparation à la Conformité",
    },
    dataProtection: {
      csrfContent:
        "Stoppez net les failles inter-origines. Tous les points de terminaison d'API mutables nécessitent des jetons anti-falsification cryptographiques. En liant automatiquement les assertions CSRF au JWT de l'utilisateur et à des cookies SameSite sécurisés, SCRIPE élimine complètement les vecteurs de falsification de requêtes intersites.",
      csrfTitle: "Défense CSRF Impénétrable",
      description:
        "Sauvegardes cryptographiques, stratégies de chiffrement au repos et contrôles de confidentialité complets.",
      encryptionTitle: "Architecture de Chiffrement de Bout en Bout",
      fieldProjectionContent:
        "Arrêtez la sur-récupération de données (over-fetching). Notre mappage de projection dynamique garantit que les API interrogent et sérialisent uniquement les colonnes exactes demandées par le frontend, empêchant l'exposition accidentelle de champs backend sensibles tels que les hachages de mots de passe ou les données salariales.",
      fieldProjectionTitle: "Projection Stricte des Données",
      idEncContent:
        "Nous utilisons des UUID (v7) robustes et séquentiels ainsi que des Hashids pour empêcher que des entiers séquentiels facilement devinables n'exposent la vélocité de l'entreprise. Les ID d'objets sont intrinsèquement obscurs et découplés de l'identité physique de la base de données.",
      idEncTitle: "Génération d'ID Opaques",
      intro:
        "La protection des données des utilisateurs est primordiale. SCRIPE emploie des stratégies de défense en profondeur, utilisant une cryptographie de qualité militaire et des barrières logiques pour garantir que l'accès non autorisé aux données est mathématiquement impossible.",
      replayContent:
        "En appliquant une validation stricte du nonce JWT, de l'expiration du jeton et des horodatages signés cryptographiquement, notre passerelle API rejette automatiquement les charges utiles de requêtes interceptées ou dupliquées.",
      replayTitle: "Prévention des Attaques par Rejeu",
      title: "Protection des Données & Confidentialité",
    },
    infraSecurity: {
      corsContent:
        "Stoppez net les failles d'origine croisée (cross-origin). Les politiques CORS par défaut de SCRIPE sont verrouillées par un paradigme strict de liste blanche (whitelist), rejetant instantanément toute requête de pré-vérification (pre-flight) non autorisée du navigateur provenant de domaines malveillants.",
      corsTitle: "Politiques Cross-Origin Strictes (CORS)",
      cspContent:
        "Nos en-têtes de politique de sécurité de contenu (CSP) préconfigurés éliminent mathématiquement des classes massives de vulnérabilités XSS en dictant exactement quels scripts externes, polices et feuilles de style le navigateur est légalement autorisé à exécuter.",
      cspTitle: "En-têtes CSP Impénétrables",
      description:
        "Plongée au cœur du périmètre défensif extérieur : limitation de débit, CORS, validation des entrées et durcissement de l'infrastructure physique.",
      intro:
        "La sécurité ne peut pas être une réflexion après coup ajoutée à la couche applicative. SCRIPE renforce le périmètre au niveau de l'infrastructure, établissant un bouclier redoutable contre les attaques DDoS volumétriques, le cross-site scripting (XSS) et les traversées de réseau non autorisées.",
      ipFiltering: "Filtrage IP de Couche 4",
      ipFilteringDesc:
        "Restreignez les points de terminaison administratifs hautement sensibles au trafic provenant strictement de votre VPN d'entreprise ou des sous-réseaux physiques de vos bureaux.",
      networkSegment: "Micro-Segmentation",
      networkSegmentDesc:
        "Isolez les bases de données et les processus d'arrière-plan dans des sous-réseaux privés, non routables et complètement déconnectés de l'internet public.",
      networkTitle: "Bouclier Topologique",
      rateLimitContent:
        "Survivez aux pics de trafic soudains et aux balayages par force brute. SCRIPE inclut une limitation de débit (rate limiting) distribuée, soutenue par Redis, qui limite dynamiquement les adresses IP abusives ou les JWT spécifiques avant qu'ils ne puissent épuiser les pools de connexions de la base de données.",
      rateLimitTitle: "Limitation de Débit Distribuée (Throttling)",
      reverseProxy: "Validation de l'En-tête du Proxy",
      reverseProxyDesc:
        "Résolvez en toute sécurité les adresses IP clientes originales derrière les équilibreurs de charge à l'aide d'en-têtes X-Forwarded-For rigoureusement validés, empêchant ainsi l'usurpation d'IP.",
      secretsContent:
        "Les mots de passe codés en dur (hardcoded) constituent une vulnérabilité catastrophique. Le pipeline de configuration de SCRIPE intercepte et injecte dynamiquement des chaînes sécurisées au moment du démarrage directement depuis les gestionnaires de secrets d'entreprise.",
      secretsTitle: "Gestion des Secrets Zero-Trust",
      title: "Sécurité du Périmètre & de l'Infrastructure",
      tlsInspection: "TLS 1.3 Obligatoire",
      tlsInspectionDesc:
        "Imposez les suites de chiffrement cryptographique les plus élevées tout en rejetant agressivement les protocoles obsolètes et non sécurisés comme TLS 1.1 ou SSLv3.",
      warningNote:
        "Avertissement : Désactiver ces mécanismes de défense par défaut sans consulter votre RSSI (CISO) augmente considérablement la surface d'attaque de votre organisation.",
    },
    securityOverview: {
      complianceTitle: "Fondation pour la Conformité",
      description:
        "Une répartition complète du périmètre de sécurité multi-couches de défense en profondeur de SCRIPE, protégeant tout, de la couche de routage à la couche de persistance.",
      gdpr: "Droit à l'Oubli RGPD (Let-To-Forget)",
      gdprDesc:
        "Prise en charge native de l'anonymisation stricte des IPI et des protocoles de suppression définitive (hard-deletion).",
      headersTitle: "En-têtes HTTP Défensifs",
      intro:
        "Nous ne faisons pas confiance au réseau, nous ne faisons pas confiance au client, et nous ne faisons pas confiance à la charge utile. SCRIPE est construit sur une méthodologie architecturale Zero-Trust, imposant des protocoles de sécurité agressifs à chaque frontière de la matrice de l'application.",
      modelContent:
        "Chaque requête API est immédiatement évaluée par le moteur FluentValidation. Si une charge utile viole les contraintes du domaine (par exemple, formats d'e-mails invalides, nombres hors limites), le pipeline rejette instantanément la charge utile avec un 400 Bad Request avant même qu'un contrôleur ne soit instancié.",
      modelTitle: "Validation Stricte du Pipeline",
      soc2: "Préparation SOC 2 Type II",
      soc2Desc:
        "Les pistes d'audit médico-légales intégrées et l'isolation stricte des données accélèrent le succès des audits SOC 2.",
      sox: "Déclencheurs de Conformité SOX",
      soxDesc:
        "Immuabilité mathématique dans les journaux d'audit financier pour prendre en charge les environnements hautement réglementés.",
      summaryTitle: "Matrice de Défense en Profondeur",
      title: "Posture de Sécurité Zero-Trust",
    },
  },
};

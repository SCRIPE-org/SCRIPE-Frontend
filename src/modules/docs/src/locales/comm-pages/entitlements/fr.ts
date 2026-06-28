// FILE-EXCEPTION: file length
/**
 * Docs page locale — FR
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const fr = {
  commercial: {
    entOverview: {
      title: "Aperçu des Droits (Entitlements)",
      description:
        "Un moteur de droits complet, de niveau entreprise, qui transforme votre plateforme en un produit SaaS différencié avec des éditions, des abonnements et un contrôle des fonctionnalités par locataire.",
      intro:
        "Arrêtez de coder en dur (hardcoding) les vérifications de plans dans votre base de code. Le module de Droits de SCRIPE fournit un moteur de contrôle d'accès aux fonctionnalités (feature gating) full-stack au niveau de l'API qui applique automatiquement ce que chaque locataire peut et ne peut pas faire — en fonction de son édition souscrite, des surcharges actives et des compteurs de quotas en temps réel.",
      whyTitle: "Pourquoi des Droits Intégrés ?",
      whyContent:
        "La plupart des plateformes SaaS ajoutent des feature flags après coup. SCRIPE intègre les droits directement dans le pipeline CQRS via l'interface IRequireFeature, ce qui signifie que chaque commande peut être automatiquement contrôlée sans une seule ligne de middleware personnalisé.",
      fgEditions: "Éditions (Plans)",
      fgEditionsDesc:
        "Des ensembles de fonctionnalités nommés comme Basic, Pro, Enterprise qui définissent ce que chaque plan inclut.",
      fgSubscriptions: "Cycle de Vie des Abonnements",
      fgSubscriptionsDesc:
        "Attribuez, mettez à niveau, rétrogradez, suspendez et renouvelez les abonnements des locataires avec des pistes d'audit complètes.",
      fgFeatures: "Catalogue de Fonctionnalités",
      fgFeaturesDesc:
        "Types de fonctionnalités Booléennes, Numériques et Chaînes avec des valeurs par défaut initialisées par le système et une extensibilité personnalisée.",
      fgOverrides: "Surcharges par Locataire",
      fgOverridesDesc:
        "Personnalisez n'importe quelle valeur de fonctionnalité pour des locataires individuels — parfait pour les accords d'entreprise ou l'accès bêta.",
      fgQuotas: "Application des Quotas",
      fgQuotasDesc:
        "Les fonctionnalités numériques avec des entités QuotaCounter sont automatiquement appliquées au niveau du pipeline.",
      fgVersioning: "Versionnage & Déploiement",
      fgVersioningDesc:
        "Déployez les modifications d'édition via des stratégies de déploiement immédiat, canary ou planifié.",
      howTitle: "Comment Ça Marche",
      howContent:
        "Chaque commande API qui implémente IRequireFeature est interceptée par le pipeline FeatureCheckBehavior. Le système résout les valeurs de fonctionnalités effectives du locataire (surcharges → édition → défauts) et autorise l'exécution ou renvoie une réponse claire 'fonctionnalité désactivée'.",
      resolutionTitle: "Priorité de Résolution",
      resolutionContent:
        "Lorsque le système résout une valeur de fonctionnalité pour un locataire, il vérifie les sources dans un ordre de priorité strict. La première source qui fournit une valeur l'emporte.",
      tblResH1: "Priorité",
      tblResH2: "Source",
      tblResH3: "Cas d'Utilisation",
      tblResR1C1: "1 (Plus haute)",
      tblResR1C2: "Surcharge du Locataire",
      tblResR1C3: "Accords d'entreprise sur mesure, promotions, tests bêta",
      tblResR2C1: "2",
      tblResR2C2: "Abonnement Actif → Édition",
      tblResR2C3: "Accès aux fonctionnalités standard basé sur le plan",
      tblResR3C1: "3",
      tblResR3C2: "Abonnements Complémentaires (Add-ons)",
      tblResR3C3: "Packs de fonctionnalités optionnels achetés séparément",
      tblResR4C1: "4 (Plus basse)",
      tblResR4C2: "Valeur par Défaut de la Fonctionnalité",
      tblResR4C3: "Solution de repli lorsqu'aucune autre source ne s'applique",
      valueTitle: "Valeur Commerciale",
      tblValH1: "Défi",
      tblValH2: "Sans SCRIPE",
      tblValH3: "Avec les Droits SCRIPE",
      tblValR1C1: "Différenciation des plans",
      tblValR1C2: "Vérifications if/else codées en dur dispersées partout",
      tblValR1C3: "Contrôle automatique au niveau du pipeline par édition",
      tblValR2C1: "Accords d'entreprise personnalisés",
      tblValR2C2: "Déploiements de code pour chaque cas particulier",
      tblValR2C3: "Surcharges par locataire via API en quelques secondes",
      tblValR3C1: "Limites d'utilisation",
      tblValR3C2: "Comptage et validation manuels",
      tblValR3C3: "Application automatique des QuotaCounter",
      tblValR4C1: "Changements de plan",
      tblValR4C2: "Migrations de base de données risquées",
      tblValR4C3: "Upgrade/Downgrade en temps réel avec analyse d'impact",
      tblValR5C1: "Déploiements de fonctionnalités",
      tblValR5C2: "Déploiements massifs risquant d'impacter tous les locataires",
      tblValR5C3: "Stratégies de déploiement canary et planifié",
      tip: "Le module de Droits est entièrement intégré au pipeline SCRIPE mediator. Les commandes implémentant IRequireFeature sont automatiquement contrôlées — votre logique métier reste propre et concentrée.",
    },
    entEditions: {
      title: "Éditions & Plans",
      description:
        "Définissez, gérez et versionnez les plans de vos produits SaaS à l'aide du pscripesant moteur d'Éditions de SCRIPE.",
      intro:
        "Les éditions sont les éléments constitutifs de votre stratégie de tarification SaaS. Chaque édition regroupe un ensemble spécifique de valeurs de fonctionnalités (commutateurs booléens, limites numériques, configurations textuelles) dans un plan nommé qui peut être attribué aux locataires via des abonnements.",
      whatTitle: "Que sont les Éditions ?",
      whatContent:
        "Une Édition est un plan nommé (ex. 'Basic', 'Pro', 'Enterprise') qui définit une combinaison spécifique de valeurs de fonctionnalités. Lorsqu'un locataire souscrit à une édition, il a automatiquement accès à exactement les fonctionnalités que cette édition définit — ni plus, ni moins.",
      scopeTitle: "Éditions Système vs Détail (Retail)",
      tblScopeH1: "Portée",
      tblScopeH2: "Créé Par",
      tblScopeH3: "Cas d'Utilisation",
      tblScopeR1C1: "Système",
      tblScopeR1C2: "Propriétaire de la plateforme (locataire racine)",
      tblScopeR1C3: "Plans globaux disponibles pour tous les locataires (Basic, Pro, Enterprise)",
      tblScopeR2C1: "Détail (Retail)",
      tblScopeR2C2: "Locataires revendeurs",
      tblScopeR2C3: "Plans personnalisés pour les sous-locataires (revente en marque blanche)",
      overflowTitle: "Politiques de Dépassement (Overflow Policies)",
      overflowContent:
        "Lorsqu'un locataire dépasse les limites de son édition, la politique de dépassement détermine le comportement. Cela crée des chemins naturels de montée en gamme (upsell) sans briser l'expérience utilisateur.",
      overflowUpgrade: "Suggérer une Mise à Niveau",
      overflowUpgradeDesc:
        "Lorsque les limites sont atteintes, le système renvoie une suggestion de mise à niveau pointant vers l'édition de dépassement — créant ainsi un chemin d'upsell fluide.",
      overflowBlock: "Blocage Strict (Hard Block)",
      overflowBlockDesc:
        "Appliquer strictement la limite. Les commandes sont rejetées avec un message d'erreur clair indiquant que la fonctionnalité est à sa capacité maximale pour le plan actuel.",
      versionTitle: "Versionnage & Déploiements",
      versionContent:
        "Les versions d'édition vous permettent de modifier les fonctionnalités d'un plan sans perturber les abonnés existants. Créez une nouvelle version avec des valeurs de fonctionnalités mises à jour, pscripe choisissez votre stratégie de déploiement.",
      tblRollH1: "Stratégie",
      tblRollH2: "Comportement",
      tblRollH3: "Idéal Pour",
      tblRollR1C1: "Immédiat",
      tblRollR1C2: "Tous les locataires abonnés sont mis à jour instantanément",
      tblRollR1C3: "Correctifs de bugs, patchs de sécurité",
      tblRollR2C1: "Canary",
      tblRollR2C2: "Déploiement graduel basé sur des pourcentages",
      tblRollR2C3: "Expérimentations de fonctionnalités, atténuation des risques",
      tblRollR3C1: "Planifié",
      tblRollR3C2: "Déployer à une date/heure spécifique",
      tblRollR3C3: "Lancements de produits alignés, cycles de facturation",
      apiTitle: "Points de terminaison API (Endpoints)",
      tip: "Les éditions ne sont jamais supprimées de la base de données — elles subissent une suppression logique (soft-delete) pour préserver l'historique des abonnements et les pistes d'audit. Les abonnements actifs empêchent totalement la suppression d'une édition.",
    },
    entSubscriptions: {
      title: "Gestion des Abonnements",
      description:
        "Gestion complète du cycle de vie des abonnements des locataires avec tarification multi-devises, remises promotionnelles, analyse d'impact des mises à niveau/rétrogradations, essais, gestion des expirations et export analytique complet.",
      intro:
        "Les abonnements sont le pont entre les locataires et les éditions. Ils définissent sur quel plan se trouve un locataire, quand il commence et expire, et comment le système se comporte lorsque le cycle de vie de l'abonnement change. Avec la tarification multi-devises intégrée et le suivi des remises promotionnelles, SCRIPE fournit tout ce dont vous avez besoin pour la monétisation.",
      lifecycleTitle: "Cycle de Vie des Abonnements",
      lifecycleContent:
        "Chaque abonnement suit une machine à états bien définie. Le système impose automatiquement des transitions valides et émet des événements de domaine à chaque étape à des fins d'audit et d'intégration.",
      typesTitle: "Types d'Abonnements",
      tblTypeH1: "Type",
      tblTypeH2: "Durée",
      tblTypeH3: "Cas d'Utilisation",
      tblTypeR1C1: "Standard",
      tblTypeR1C2: "Période fixe avec date d'expiration",
      tblTypeR1C3: "Abonnements commerciaux réguliers",
      tblTypeR2C1: "Essai (Trial)",
      tblTypeR2C2: "Période d'évaluation à court terme",
      tblTypeR2C3: "Essais gratuits qui se convertissent automatiquement ou expirent",
      tblTypeR3C1: "Module Complémentaire (Add-on)",
      tblTypeR3C2: "Supplémentaire à l'abonnement principal",
      tblTypeR3C3: "Packs de fonctionnalités supplémentaires (ex. stockage extra)",
      pricingTitle: "Moteur de Tarification Multi-Devises",
      pricingContent:
        "Chaque abonnement stocke sa tarification dans la devise native du locataire tout en normalisant automatiquement en USD pour des analyses de revenus unifiées. Prise en charge de 9+ devises prêtes à l'emploi — USD, EUR, GBP, SAR, AED, EGP, TRY, INR, et plus.",
      tblPriceH1: "Champ",
      tblPriceH2: "Objectif",
      tblPriceH3: "Exemple",
      tblPriceR1C1: "Currency",
      tblPriceR1C2: "Code devise ISO 4217 pour cet abonnement",
      tblPriceR1C3: "SAR, USD, EUR",
      tblPriceR2C1: "BaseAmount",
      tblPriceR2C2: "Prix d'origine avant tout ajustement",
      tblPriceR2C3: "499.00",
      tblPriceR3C1: "AdjustmentAmount",
      tblPriceR3C2: "Remise ou surcharge appliquée",
      tblPriceR3C3: "-49.90 (promo 10%)",
      tblPriceR4C1: "TotalAmount",
      tblPriceR4C2: "Montant final facturé en devise locale",
      tblPriceR4C3: "449.10",
      tblPriceR5C1: "ExchangeRateToUsd",
      tblPriceR5C2: "Taux utilisé pour normaliser en USD",
      tblPriceR5C3: "0.2667",
      tblPriceR6C1: "TotalAmountUsd",
      tblPriceR6C2: "Valeur normalisée en USD pour l'analytique",
      tblPriceR6C3: "119.76",
      promoTitle: "Remises Promotionnelles",
      promoContent:
        "Stimulez l'acqscripeition et la fidélisation avec la prise en charge des codes promotionnels intégrée dans chaque abonnement. Les promotions appliquées sont suivies avec le nom du code et le pourcentage de remise pour une visibilité complète d'audit et d'analytique.",
      fgPromoCode: "Suivi des Codes Promotionnels",
      fgPromoCodeDesc:
        "Chaque abonnement enregistre son AppliedPromoCode et son pourcentage PromotionDiscount. Les tableaux de bord analytiques montrent quelles promotions génèrent le plus de conversions.",
      fgPromoAdjust: "Ajustement Automatique",
      fgPromoAdjustDesc:
        "Lorsqu'une promotion est appliquée, AdjustmentAmount est calculé automatiquement à partir de BaseAmount × PromotionDiscount, garantissant une tarification cohérente sur tous les abonnements.",
      opsTitle: "Opérations Clés",
      opsAssign: "Attribuer un Abonnement",
      opsAssignDesc:
        "Lier un locataire à une édition avec une date de début, une durée, une devise, un code promotionnel optionnel et une configuration de renouvellement automatique.",
      opsUpgrade: "Mettre à Niveau le Plan (Upgrade)",
      opsUpgradeDesc:
        "Déplacer un locataire vers une édition supérieure. Les nouvelles fonctionnalités sont disponibles immédiatement et la période d'abonnement peut être ajustée.",
      opsDowngrade: "Rétrograder le Plan (Downgrade)",
      opsDowngradeDesc:
        "Passer à une édition inférieure. Le système fournit une analyse d'impact complète montrant quelles fonctionnalités seront perdues avant confirmation.",
      opsImpact: "Analyse d'Impact",
      opsImpactDesc:
        "Avant toute rétrogradation, l'API renvoie une analyse détaillée des fonctionnalités affectées et de l'utilisation actuelle — évitant ainsi une perte de données inattendue.",
      expiryTitle: "Comportement d'Expiration",
      tblExpH1: "Politique",
      tblExpH2: "Comportement",
      tblExpH3: "Cas d'Utilisation",
      tblExpR1C1: "Délai de Grce",
      tblExpR1C2: "Les fonctionnalités restent actives pendant N jours après l'expiration",
      tblExpR1C3: "Donner aux clients le temps de renouveler",
      tblExpR2C1: "Blocage Immédiat",
      tblExpR2C2: "Fonctionnalités désactivées dès l'expiration de l'abonnement",
      tblExpR2C3: "Application stricte des quotas",
      tblExpR3C1: "Édition de Repli (Fallback)",
      tblExpR3C2: "Rétrograder automatiquement vers l'édition par défaut (gratuite)",
      tblExpR3C3: "Modèles Freemium avec mises à niveau payantes",
      exportTitle: "Export Analytique Avancé",
      exportContent:
        "Générez des rapports analytiques complets d'abonnements aux formats CSV, Excel et PDF. Les rapports incluent un filtrage avancé (plage de dates, expirant bientôt, statut, édition), l'affichage multi-devises et des indicateurs d'expiration à code couleur.",
      fgExportCsv: "Export CSV",
      fgExportCsvDesc:
        "Format léger séparé par des virgules, idéal pour l'analyse de données et l'importation dans des outils BI comme Power BI, Tableau ou Google Sheets.",
      fgExportExcel: "Export Excel",
      fgExportExcelDesc:
        "Classeur XLSX professionnel avec en-têtes stylisés, métadonnées de filtres, formatage conditionnel pour les dates d'expiration et colonnes auto-dimensionnées — propulsé par ClosedXML.",
      fgExportPdf: "Export PDF",
      fgExportPdfDesc:
        "Document prêt à imprimer avec page de couverture personnalisée, résumé statistique et tableaux de données paginés avec colonne 'Jours Restants' à code couleur — propulsé par QuestPDF.",
      enterpriseTitle: "Gestion des Abonnements d'Entreprise",
      renewalTitle: "Piste d'Audit de Revenus Immuable",
      renewalDesc:
        "Les renouvellements créent de NOUVELLES lignes d'abonnement au lieu d'écraser les enregistrements existants. Chaque cycle de facturation préserve les prix figés pour des tendances MRR précises et des audits financiers.",
      promoExpiryTitle: "Expiration Intelligente des Promotions",
      promoExpiryDesc:
        "Les promotions à durée limitée sont automatiquement suivies via PromotionExpiresAt. Lors du renouvellement, les promotions expirées sont supprimées — les nouveaux prix s'appliquent de manière transparente.",
      concurrencyTitle: "Protection contre les Conditions de Course",
      concurrencyDesc:
        "Des tampons de concurrence optimiste sur chaque abonnement empêchent les collisions entre opérations parallèles. Intégrité des données de niveau entreprise sans pénalité de performance.",
      validationTitle: "Validation au Niveau du Pipeline",
      validationDesc:
        "Les 8 commandes d'abonnement sont protégées par des validateurs FluentValidation avec des messages d'erreur entièrement localisés en anglais et en arabe.",
      crossModuleTitle: "Intégration Inter-Modules Administrateurs",
      crossModuleDesc:
        "Les événements du cycle de vie des abonnements se propagent automatiquement à la gestion des identités. Lors d'une suspension, tous les administrateurs du locataire sont désactivés en toute sécurité. Lors d'une reprise, seuls les administrateurs désactivés par suspension sont réactivés.",
      apiTitle: "Points de terminaison API (Endpoints)",
      tip: "L'API d'analyse d'impact de rétrogradation est un pscripesant outil de fidélisation commerciale. Montrez aux clients exactement ce qu'ils vont perdre avant qu'ils ne rétrogradent — créant ainsi des moments naturels de rétention.",
    },
    entFeatures: {
      title: "Gestion des Fonctionnalités (Features)",
      description:
        "Définissez, catégorisez et appliquez des fonctionnalités Booléennes, Numériques et Textuelles avec un suivi automatique des quotas et un cache haute performance.",
      intro:
        "Les fonctionnalités sont les éléments de base atomiques de votre système de droits. Chaque capacité qui peut être activée, limitée ou configurée par plan est définie comme une Fonctionnalité. Le système prend en charge trois types de valeurs, une initialisation automatique et l'application des quotas en temps réel.",
      typesTitle: "Types de Valeurs de Fonctionnalités",
      typesContent:
        "Chaque fonctionnalité a un type de valeur spécifique qui détermine comment elle est évaluée, stockée et appliquée à travers les éditions et les surcharges.",
      tblTypeH1: "Type",
      tblTypeH2: "Valeurs",
      tblTypeH3: "Exemple",
      tblTypeH4: "Application (Enforcement)",
      tblTypeR1C1: "Booléen",
      tblTypeR1C2: "true / false",
      tblTypeR1C3: "ApiAccess, CustomDomain, SSO",
      tblTypeR1C4: "Contrôle d'accès : autoriser ou bloquer",
      tblTypeR2C1: "Numérique",
      tblTypeR2C2: "Valeur entière",
      tblTypeR2C3: "MaxUsers: 50, StorageGB: 100",
      tblTypeR2C4: "QuotaCounter : rejet automatique si dépassé",
      tblTypeR3C1: "Chaîne (String)",
      tblTypeR3C2: "Texte libre",
      tblTypeR3C3: "SupportTier: 'Priority', Theme: 'dark'",
      tblTypeR3C4: "Valeur de configuration, aucune application stricte",
      systemTitle: "Fonctionnalités Système vs Personnalisées",
      fgSystem: "Fonctionnalités Système",
      fgSystemDesc:
        "Pré-initialisées au démarrage de l'application. Immuables et toujours présentes. Elles définissent les capacités de base de votre plateforme (ex. MaxUsers, ApiAccess).",
      fgCustom: "Fonctionnalités Personnalisées",
      fgCustomDesc:
        "Créées par les administrateurs au moment de l'exécution via l'API. Parfait pour les fonctionnalités spécifiques aux modules qui évoluent au fur et à mesure que votre produit se développe.",
      quotaTitle: "Application Automatique des Quotas",
      quotaContent:
        "Les fonctionnalités numériques peuvent avoir des entités QuotaCounter associées qui suivent l'utilisation en temps réel. Lorsqu'une commande implémente IRequireFeature pour une fonctionnalité numérique, le pipeline FeatureCheckBehavior compare automatiquement le compte actuel avec la limite autorisée.",
      cacheTitle: "Cache de Fonctionnalités Haute Performance",
      cacheContent:
        "Les valeurs de fonctionnalités résolues sont mises en cache de manière agressive par locataire pour garantir des vérifications d'autorisation sans latence. Le cache est automatiquement invalidé chaque fois que les éditions, les abonnements ou les surcharges changent.",
      cachePerf: "Recherches Sous-Milliseconde",
      cachePerfDesc:
        "Les fonctionnalités résolues sont mises en cache en mémoire (in-memory) par locataire. Les vérifications du pipeline s'effectuent en microsecondes, et non en millisecondes.",
      cacheInv: "Invalidation Automatique",
      cacheInvDesc:
        "Toute modification des éditions, des abonnements ou des surcharges invalide immédiatement le cache de fonctionnalités du locataire concerné.",
      apiTitle: "Points de terminaison API (Endpoints)",
      tip: "Les fonctionnalités système sont automatiquement initialisées (seeded) à partir de votre code à chaque démarrage de l'application. Cela signifie que votre catalogue de fonctionnalités reste parfaitement synchronisé avec votre base de code réelle — aucune gestion manuelle de la base de données n'est reqscripee.",
    },
    entOverrides: {
      title: "Surcharges par Locataire",
      description:
        "Personnalisez les valeurs des fonctionnalités pour des locataires individuels, indépendamment de leur plan souscrit, avec des pistes d'audit complètes et une expiration facultative.",
      intro:
        "Les surcharges sont la porte de sortie qui rend votre système de droits suffisamment flexible pour le monde réel. Les accords d'entreprise, les offres promotionnelles, les tests bêta et les exceptions réglementaires nécessitent tous la capacité de personnaliser les fonctionnalités par locataire sans modifier le plan sous-jacent.",
      priorityTitle: "Chaîne de Priorité de Résolution",
      priorityContent:
        "Les surcharges se situent en haut de la chaîne de priorité de résolution. Lorsque le système résout une valeur de fonctionnalité pour un locataire, une surcharge l'emporte toujours — peu importe ce que dit l'édition ou la valeur par défaut.",
      useCasesTitle: "Cas d'Utilisation dans le Monde Réel",
      ucEnterprise: "Accords d'Entreprise sur Mesure",
      ucEnterpriseDesc:
        "Un client Fortune 500 a besoin de 10 000 utilisateurs sur un plan Pro qui est normalement plafonné à 500. Définissez une surcharge — aucune modification de code, aucune version personnalisée.",
      ucPromo: "Mises à Niveau Promotionnelles",
      ucPromoDesc:
        "Offrez à un locataire des fonctionnalités Premium pendant 30 jours à titre promotionnel. Définissez une surcharge avec expiration qui se rétablit automatiquement après la période de promotion.",
      ucBeta: "Accès Bêta aux Fonctionnalités",
      ucBetaDesc:
        "Activez une fonctionnalité expérimentale pour certains locataires avant de la déployer sur tous les plans. Surchargez la fonctionnalité pour des locataires spécifiques pendant la bêta.",
      ucExpiring: "Exceptions Limitées dans le Temps",
      ucExpiringDesc:
        "Les exigences réglementaires peuvent nécessiter un accès temporaire aux fonctionnalités. Définissez une surcharge avec une date d'expiration — le système la rétablit automatiquement à son expiration.",
      settingTitle: "Définir une Surcharge",
      settingContent:
        "Les surcharges sont définies via un simple appel API. Chaque surcharge comprend la fonctionnalité, la valeur personnalisée, une date d'expiration facultative et une raison à des fins d'audit.",
      auditTitle: "Piste d'Audit",
      auditContent:
        "Chaque action de surcharge est entièrement auditée. Le système trace qui a défini la surcharge, quand elle a été définie, la valeur précédente et la raison fournie.",
      tblAuditH1: "Événement",
      tblAuditH2: "Données Suivies",
      tblAuditH3: "Objectif",
      tblAuditR1C1: "Surcharge Créée",
      tblAuditR1C2: "Fonctionnalité, locataire, valeur, raison, acteur, horodatage",
      tblAuditR1C3: "Conformité et responsabilité",
      tblAuditR2C1: "Surcharge Mise à Jour",
      tblAuditR2C2: "Valeur précédente, nouvelle valeur, raison, acteur",
      tblAuditR2C3: "Suivi de l'historique des modifications",
      tblAuditR3C1: "Surcharge Expirée/Supprimée",
      tblAuditR3C2: "Fonctionnalité, locataire, valeur finale, acteur",
      tblAuditR3C3: "Vérification de la réversion",
      apiTitle: "Points de terminaison API (Endpoints)",
      tip: "Les surcharges sont l'outil le plus pscripesant de votre arsenal de vente. Elles permettent à votre équipe commerciale de conclure des accords d'entreprise en quelques minutes — pas en sprints de développement.",
    },
  },
};

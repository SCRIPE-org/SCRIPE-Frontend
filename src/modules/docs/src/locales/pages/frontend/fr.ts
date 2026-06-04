
export const fr = {
  frontend: {
    crudSystem: {
      title: "Système CRUD",
      description:
        "Hook useCrudViewModel, GenericCrudView, DataTable, assistants de colonnes, et gestion des formulaires.",
      intro:
        "Le système CRUD permet de générer des listes et des écrans interactifs connectés au serveur avec très peu de code côté client.",
      architectureTitle: "Aperçu de l'Architecture",
      viewModelTitle: "Hook useCrudViewModel",
      viewModelIntro:
        "Un hook générique qui encapsule l'intégralité de l'état (Paginage, Tri, Recherches et Mutations).",
      genericCrudViewTitle: "Composant GenericCrudView",
      genericCrudViewIntro:
        "Prend en charge l'orchestration des données, les formulaires, et la table sans code redondant.",
      columnsTitle: "Système de Colonnes",
      dataTableTitle: "Fonctionnalités du DataTable",
      searchTitle: "Recherche Globale",
      searchDesc:
        "La recherche globale inclut un anti-rebond (debounce) pour épargner le backend HTTP.",
      sortingTitle: "Tri des Colonnes",
      sortingDesc: "Prise en charge du tri asynchrone multi-colonnes en cliquant sur les en-têtes.",
      paginationTitle: "Pagination",
      paginationDesc: "Pagination pilotée par le serveur de 10 à 100 enregistrements par page.",
      selectionTitle: "Sélection de Lignes",
      selectionDesc:
        "Prend en charge la sélection de lignes via case à cocher pour les opérations en lot.",
      responsiveTitle: "Mise en Page Réactive",
      responsiveDesc: "Masquage intelligent des colonnes pour s'adapter aux écrans des mobiles.",
      rtlTitle: "Support RTL",
      rtlDesc:
        "Le tableau entier se retourne nativement lorsque la langue choisie s'écrit de droite à gauche.",
      formTitle: "Système de Formulaires",
      formIntro:
        "Utilise GenericForm et s'intègre avec Zod pour des validations puissantes sans efforts.",
      extensionTip:
        "N'essayez jamais de modifier le GenericCrudView lui-même : englobez-le ou passez des propriétés de surcharge pour vos besoins spécifiques.",
    },
    stateManagement: {
      title: "Gestion de l'État (Frontend)",
      description:
        "TanStack Query pour l'état du serveur, Zustand pour l'état global et useState local.",
      intro:
        "Évitez le code spaghetti en stockant l'information au bon endroit en fonction de sa nature.",
      categoriesTitle: "Catégories d'État",
      tanstackTitle: "TanStack Query (État du Serveur)",
      tanstackIntro:
        "Doit gérer 100% des appels API et gère automatiquement l'invalidation des anciens états en cache.",
      mutationsTitle: "Mutations et Invalidation du Cache",
      zustandTitle: "Zustand (État Global UI)",
      zustandIntro:
        "Gère les petites informations purement locales à l'application web (Thèmes, Alertes/Toasts, Barres latérales).",
      languageTitle: "État de Localisation",
      languageIntro:
        "Le Context LanguageProvider sauvegarde et rafraîchit la langue depuis le localStorage sans recharger la page web.",
      antiPatternsTitle: "Anti-Modèles (Anti-Patterns)",
    },
    localization: {
      title: "Localisation (i18n)",
      description: "LanguageProvider, fonction t(), support RTL et structure du dictionnaire.",
      intro:
        "SCRIPE utilise un système de localisation à l'échelle du module. Les clés partagées (~1 156) résident dans core/locales/. Chaque module possède ses traductions dans un répertoire locales/ co-localisé, importé de manière anticipée au moment de la construction via le module-registry.ts pour des chargements de page sans flash. Prend en charge l'arabe (RTL) et l'anglais (LTR) avec commutation de direction automatique, changements de police et persistance dans localStorage.",
      architectureTitle: "Architecture",
      dictionaryTitle: "Structure du Dictionnaire",
      tFunctionTitle: "Utilisation de la Fonction t()",
      rtlTitle: "Support RTL/LTR",
      rtlIntro:
        "La détection bascule dynamiquement les styles, classes CSS et polices entre les modes LTR et RTL.",
      addingKeysTitle: "Ajout de Nouvelles Clés de Traduction",
      step1Title: "1. Créer ou Mettre à Jour les Locales du Module",
      step1Desc:
        "Ajoutez de nouvelles clés aux fichiers locales/{module}.en.ts et {module}.ar.ts de votre module. N'ajoutez à core/locales/ que si la clé est réellement partagée (validation, navigation, interface utilisateur commune).",
      step2Title: "2. Enregistrer dans le Registre de Modules",
      step2Desc:
        "Enregistrez les locales de votre module dans core/locales/module-registry.ts. Les nouveaux modules créés via scripe new-module sont automatiquement enregistrés par le CLI.",
      step3Title: "3. Utiliser t() avec l'Espace de Noms du Module",
      step3Desc:
        "Appelez t('nomModule.cheminCle') en utilisant l'espace de noms de votre fichier de langue. Pour l'interpolation, utilisez la syntaxe {{variable}} et transmettez les variables en deuxième argument.",
      noLocaleRoutes:
        "L'application évite volontairement l'enrutement basé sur la langue (type /fr/page) afin de réduire massivement les temps de rendu serveur (SSR).",
      moduleLocaleNote:
        "The scripe CLI automatically scaffolds locales/ when creating new modules via scripe new-module. Each locale file contains both EN and AR translations, bundled in a single chunk for instant language switching.",
    },
    formValidation: {
      title: "Validation de Formulaires",
      description:
        "Schémas Zod, intégration React Hook Form, FluentValidation côté serveur et gestion des erreurs.",
      intro:
        "Une approche double-couche garantit une interface utilisateur réactive combinée à un serveur intouchable.",
      architectureTitle: "Architecture de Validation",
      zodTitle: "Schémas Zod (Côté Client)",
      rhfTitle: "Intégration React Hook Form",
      rulesTitle: "Référence des Règles de Validation",
      serverErrorTitle: "Gestion des Erreurs côté Serveur",
      serverErrorIntro:
        "L'API intercepte les requêtes malveillantes avec FluentValidation et retourne des objets que React Hook Form colorie instantanément en rouge sur l'interface du client.",
    },
    componentLibrary: {
      title: "Bibliothèque de Composants",
      description:
        "Fondation shadcn/ui, utilitaire cn(), GenericSelect, système de thèmes et règles de placement.",
      intro:
        "La bibliothèque UI partagée qui assure un design d'entreprise cohésif sur l'intégralité du produit.",
      shadcnTitle: "Fondation shadcn/ui",
      shadcnIntro:
        "Installe des composants primitifs qui nous laissent un contrôle absolu de personnalisation via Tailwind CSS.",
      categoriesTitle: "Catégories de Composants",
      formsTitle: "Composants de Formulaire",
      feedbackTitle: "Composants de Rétroaction (Feedback)",
      layoutTitle: "Composants de Mise en Page (Layout)",
      chartsTitle: "Composants Graphiques (Charts)",
      genericSelectTitle: "Composant GenericSelect",
      genericSelectIntro:
        "Notre composant propriétaire de sélection avec arborescence et pagination asynchrone intégrée.",
      themeTitle: "Système de Thème",
      responsiveTitle: "Conception Réactive (Responsive)",
      a11yTitle: "Accessibilité (A11y)",
      placementTitle: "Règles de Placement des Composants",
      architectureTitle: "Architecture des Composants",
      neverInApp:
        "Règle stricte de Next.js App Router : NE PLACEZ JAMAIS de composants purement visuels ou de logique à l'intérieur de l'arborescence des dossiers src/app/.",
    },
    realtime: {
      title: "Temps Réel (SignalR)",
      description:
        "Hubs SignalR (AuditHub, NotificationHub), Hooks React et gestion des connexions.",
      intro:
        "Évite l'utilisation de sondages réseau coûteux (polling) via des sockets connectés en permanence au serveur.",
      architectureTitle: "Architecture en Temps Réel",
      hubsTitle: "Hubs SignalR",
      hooksTitle: "Hooks React",
      providerTitle: "Fournisseur SignalR",
      connectionStatesTitle: "États de Connexion",
      tenantGroupNote:
        "Les signaux d'événements sont multiplexés et scellés cryptographiquement. Jamais un locataire ne recevra par accident les pings en direct d'un autre locataire.",
    },
  },
};

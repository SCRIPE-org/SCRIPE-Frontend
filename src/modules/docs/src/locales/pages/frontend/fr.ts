export const fr = {
  frontend: {
    componentLibrary: {
      a11yTitle: "Accessibilité (A11y)",
      architectureTitle: "Architecture des Composants",
      categoriesTitle: "Catégories de Composants",
      chartsTitle: "Composants Graphiques (Charts)",
      description:
        "Fondation shadcn/ui, utilitaire cn(), GenericSelect, système de thèmes et règles de placement.",
      feedbackTitle: "Composants de Rétroaction (Feedback)",
      formsTitle: "Composants de Formulaire",
      genericSelectIntro:
        "Notre composant propriétaire de sélection avec arborescence et pagination asynchrone intégrée.",
      genericSelectTitle: "Composant GenericSelect",
      intro:
        "La bibliothèque UI partagée qui assure un design d'entreprise cohésif sur l'intégralité du produit.",
      layoutTitle: "Composants de Mise en Page (Layout)",
      neverInApp:
        "Règle stricte de Next.js App Router : NE PLACEZ JAMAIS de composants purement visuels ou de logique à l'intérieur de l'arborescence des dossiers src/app/.",
      placementTitle: "Règles de Placement des Composants",
      responsiveTitle: "Conception Réactive (Responsive)",
      shadcnIntro:
        "Installe des composants primitifs qui nous laissent un contrôle absolu de personnalisation via Tailwind CSS.",
      shadcnTitle: "Fondation shadcn/ui",
      themeTitle: "Système de Thème",
      title: "Bibliothèque de Composants",
    },
    crudSystem: {
      architectureTitle: "Aperçu de l'Architecture",
      columnsTitle: "Système de Colonnes",
      dataTableTitle: "Fonctionnalités du DataTable",
      description:
        "Hook useCrudViewModel, GenericCrudView, DataTable, assistants de colonnes, et gestion des formulaires.",
      extensionTip:
        "N'essayez jamais de modifier le GenericCrudView lui-même : englobez-le ou passez des propriétés de surcharge pour vos besoins spécifiques.",
      formIntro:
        "Utilise GenericForm et s'intègre avec Zod pour des validations puissantes sans efforts.",
      formTitle: "Système de Formulaires",
      genericCrudViewIntro:
        "Prend en charge l'orchestration des données, les formulaires, et la table sans code redondant.",
      genericCrudViewTitle: "Composant GenericCrudView",
      intro:
        "Le système CRUD permet de générer des listes et des écrans interactifs connectés au serveur avec très peu de code côté client.",
      paginationDesc: "Pagination pilotée par le serveur de 10 à 100 enregistrements par page.",
      paginationTitle: "Pagination",
      responsiveDesc: "Masquage intelligent des colonnes pour s'adapter aux écrans des mobiles.",
      responsiveTitle: "Mise en Page Réactive",
      rtlDesc:
        "Le tableau entier se retourne nativement lorsque la langue choisie s'écrit de droite à gauche.",
      rtlTitle: "Support RTL",
      searchDesc:
        "La recherche globale inclut un anti-rebond (debounce) pour épargner le backend HTTP.",
      searchTitle: "Recherche Globale",
      selectionDesc:
        "Prend en charge la sélection de lignes via case à cocher pour les opérations en lot.",
      selectionTitle: "Sélection de Lignes",
      sortingDesc: "Prise en charge du tri asynchrone multi-colonnes en cliquant sur les en-têtes.",
      sortingTitle: "Tri des Colonnes",
      title: "Système CRUD",
      viewModelIntro:
        "Un hook générique qui encapsule l'intégralité de l'état (Paginage, Tri, Recherches et Mutations).",
      viewModelTitle: "Hook useCrudViewModel",
    },
    formValidation: {
      architectureTitle: "Architecture de Validation",
      description:
        "Schémas Zod, intégration React Hook Form, FluentValidation côté serveur et gestion des erreurs.",
      intro:
        "Une approche double-couche garantit une interface utilisateur réactive combinée à un serveur intouchable.",
      rhfTitle: "Intégration React Hook Form",
      rulesTitle: "Référence des Règles de Validation",
      serverErrorIntro:
        "L'API intercepte les requêtes malveillantes avec FluentValidation et retourne des objets que React Hook Form colorie instantanément en rouge sur l'interface du client.",
      serverErrorTitle: "Gestion des Erreurs côté Serveur",
      title: "Validation de Formulaires",
      zodTitle: "Schémas Zod (Côté Client)",
    },
    localization: {
      addingKeysTitle: "Ajout de Nouvelles Clés de Traduction",
      architectureTitle: "Architecture",
      description: "LanguageProvider, fonction t(), support RTL et structure du dictionnaire.",
      dictionaryTitle: "Structure du Dictionnaire",
      intro:
        "SCRIPE utilise un système de localisation à l'échelle du module. Les clés partagées (~1 156) résident dans core/locales/. Chaque module possède ses traductions dans un répertoire locales/ co-localisé, importé de manière anticipée au moment de la construction via le module-registry.ts pour des chargements de page sans flash. Prend en charge l'arabe (RTL) et l'anglais (LTR) avec commutation de direction automatique, changements de police et persistance dans localStorage.",
      moduleLocaleNote:
        "The scripe CLI automatically scaffolds locales/ when creating new modules via scripe new-module. Each locale file contains both EN and AR translations, bundled in a single chunk for instant language switching.",
      noLocaleRoutes:
        "L'application évite volontairement l'enrutement basé sur la langue (type /fr/page) afin de réduire massivement les temps de rendu serveur (SSR).",
      rtlIntro:
        "La détection bascule dynamiquement les styles, classes CSS et polices entre les modes LTR et RTL.",
      rtlTitle: "Support RTL/LTR",
      step1Desc:
        "Ajoutez de nouvelles clés aux fichiers locales/{module}.en.ts et {module}.ar.ts de votre module. N'ajoutez à core/locales/ que si la clé est réellement partagée (validation, navigation, interface utilisateur commune).",
      step1Title: "1. Créer ou Mettre à Jour les Locales du Module",
      step2Desc:
        "Enregistrez les locales de votre module dans core/locales/module-registry.ts. Les nouveaux modules créés via scripe new-module sont automatiquement enregistrés par le CLI.",
      step2Title: "2. Enregistrer dans le Registre de Modules",
      step3Desc:
        "Appelez t('nomModule.cheminCle') en utilisant l'espace de noms de votre fichier de langue. Pour l'interpolation, utilisez la syntaxe {{variable}} et transmettez les variables en deuxième argument.",
      step3Title: "3. Utiliser t() avec l'Espace de Noms du Module",
      tFunctionTitle: "Utilisation de la Fonction t()",
      title: "Localisation (i18n)",
    },
    realtime: {
      architectureTitle: "Architecture en Temps Réel",
      connectionStatesTitle: "États de Connexion",
      description:
        "Hubs SignalR (AuditHub, NotificationHub), Hooks React et gestion des connexions.",
      hooksTitle: "Hooks React",
      hubsTitle: "Hubs SignalR",
      intro:
        "Évite l'utilisation de sondages réseau coûteux (polling) via des sockets connectés en permanence au serveur.",
      providerTitle: "Fournisseur SignalR",
      tenantGroupNote:
        "Les signaux d'événements sont multiplexés et scellés cryptographiquement. Jamais un locataire ne recevra par accident les pings en direct d'un autre locataire.",
      title: "Temps Réel (SignalR)",
    },
    stateManagement: {
      antiPatternsTitle: "Anti-Modèles (Anti-Patterns)",
      categoriesTitle: "Catégories d'État",
      description:
        "TanStack Query pour l'état du serveur, Zustand pour l'état global et useState local.",
      intro:
        "Évitez le code spaghetti en stockant l'information au bon endroit en fonction de sa nature.",
      languageIntro:
        "Le Context LanguageProvider sauvegarde et rafraîchit la langue depuis le localStorage sans recharger la page web.",
      languageTitle: "État de Localisation",
      mutationsTitle: "Mutations et Invalidation du Cache",
      tanstackIntro:
        "Doit gérer 100% des appels API et gère automatiquement l'invalidation des anciens états en cache.",
      tanstackTitle: "TanStack Query (État du Serveur)",
      title: "Gestion de l'État (Frontend)",
      zustandIntro:
        "Gère les petites informations purement locales à l'application web (Thèmes, Alertes/Toasts, Barres latérales).",
      zustandTitle: "Zustand (État Global UI)",
    },
  },
};

export const es = {
  frontend: {
    componentLibrary: {
      a11yTitle: "Accesibilidad (A11y)",
      architectureTitle: "Arquitectura de Componentes",
      categoriesTitle: "Categorías de Componentes",
      chartsTitle: "Componentes Analíticos (Gráficos)",
      description:
        "Integración de shadcn/ui, fusión mediante utilidades cn() y reglas organizativas.",
      feedbackTitle: "Componentes de Feedback",
      formsTitle: "Componentes de Formulario",
      genericSelectIntro:
        "Nuestro propio selector multinivel con paginación optimizada para enormes catálogos de datos corporativos.",
      genericSelectTitle: "Componente GenericSelect",
      intro:
        "Garantiza que toda la plataforma visual tenga un diseño corporativo cohesivo sin reinventar la rueda.",
      layoutTitle: "Componentes de Diseño (Layout)",
      neverInApp:
        "Evitar estrictamente situar componentes compartidos o lógica en el subdirectorio de enrutamiento Next.js (app).",
      placementTitle: "Reglas de Ubicación de Componentes",
      responsiveTitle: "Diseño Responsivo",
      shadcnIntro:
        "Componentes crudos instalados e inyectados para tener absoluto dominio del renderizado nativo.",
      shadcnTitle: "Fundación shadcn/ui",
      themeTitle: "Sistema de Tema (Theming)",
      title: "Biblioteca de Componentes",
    },
    crudSystem: {
      architectureTitle: "Visión General de la Arquitectura",
      columnsTitle: "Sistema de Columnas",
      dataTableTitle: "Características del DataTable",
      description:
        "Hook useCrudViewModel, GenericCrudView, DataTable y el sistema generalizado de recolección de entrada.",
      extensionTip:
        "Nunca modifiques los componentes Generic. Deben envolverse o sobreescribirse parcialmente para extenderlos.",
      formIntro:
        "Integrado en Zod. Utiliza GenricForm sobre un diálogo o página completa para operar validaciones precisas.",
      formTitle: "Sistema de Formularios",
      genericCrudViewIntro:
        "Ensambla mágicamente la tabla de datos, los modales y el título general pasando únicamente un ViewModel configurado.",
      genericCrudViewTitle: "Componente GenericCrudView",
      intro:
        "Es la espina dorsal del frontend, permitiendo levantar pantallas funcionales al instante conectadas al backend.",
      paginationDesc:
        "Las consultas se limitan en el servidor directamente garantizando alto desempeño UI.",
      paginationTitle: "Paginación",
      responsiveDesc:
        "Se adapta elegantemente a móviles colapsando las columnas en base a la prioridad.",
      responsiveTitle: "Layout Responsivo",
      rtlDesc: "Se autogira bidireccionalmente dependiendo del lenguaje seleccionado.",
      rtlTitle: "Soporte RTL",
      searchDesc: "Entrada que reacciona con debounce evitando sobrecarga al Servidor Backend.",
      searchTitle: "Búsqueda Global",
      selectionDesc: "Manejo con exclusión y select-all optimizado.",
      selectionTitle: "Selección de Filas",
      sortingDesc: "Permite múltiples ordenamientos asíncronos.",
      sortingTitle: "Ordenamiento de Columnas",
      title: "Sistema CRUD",
      viewModelIntro: "Maneja todo el estado base del servidor y mutaciones del lado del cliente.",
      viewModelTitle: "Hook useCrudViewModel",
    },
    formValidation: {
      architectureTitle: "Arquitectura de Validación",
      description:
        "Esquemas Zod en el Cliente combinados con respuestas FluentValidation en el Servidor.",
      intro:
        "Garantiza un formulario sano desde el momento de tipeo antes de llegar a sobrecargar la red.",
      rhfTitle: "Integración con React Hook Form",
      rulesTitle: "Referencia de Reglas de Validación",
      serverErrorIntro:
        "Traduce y mapea los errores FluentValidation y los pinta directamente sobre la entrada (input) roja de React Hook Form.",
      serverErrorTitle: "Manejo de Errores del Lado Servidor",
      title: "Validación de Formularios",
      zodTitle: "Esquemas Zod (Lado Cliente)",
    },
    localization: {
      addingKeysTitle: "Añadir Nuevas Claves de Traducción",
      architectureTitle: "Arquitectura",
      description:
        "La función t(), el manejador RTL, los diccionarios y cómo internacionalizar un módulo.",
      dictionaryTitle: "Estructura de Diccionarios",
      intro:
        "SCRIPE utiliza un sistema de localización con alcance de módulo. Las claves compartidas (~1,156) residen en core/locales/. Cada módulo posee sus traducciones en un directorio locales/ co-localizado, importado ansiosamente en tiempo de compilación a través de module-registry.ts para cargas de página sin parpadeos. Admite árabe (RTL) e inglés (LTR) con cambio de dirección automático, cambios de fuente y persistencia en localStorage.",
      moduleLocaleNote:
        "The scripe CLI automatically scaffolds locales/ when creating new modules via scripe new-module. Each locale file contains both EN and AR translations, bundled in a single chunk for instant language switching.",
      noLocaleRoutes:
        "No utilizamos sistema de enrutamiento basado en archivos ([locale]) por temas drásticos de desempeño Server-Side.",
      rtlIntro:
        "Interviene la etiqueta principal de HTML autoconfigurando CSS flexbox para funcionar de derecha a izquierda si se elige Árabe.",
      rtlTitle: "Soporte de RTL / LTR",
      step1Desc:
        "Añada nuevas claves a los archivos locales/{module}.en.ts y {module}.ar.ts de su módulo. Solo añádalas a core/locales/ si la clave es realmente compartida (validación, navegación, interfaz de usuario común).",
      step1Title: "1. Crear o Actualizar el Local del Módulo",
      step2Desc:
        "Registra los locales de tu módulo en core/locales/module-registry.ts. Los nuevos módulos creados a través de scripe new-module se registran automáticamente mediante la CLI.",
      step2Title: "2. Registrar en el Registro de Módulos",
      step3Desc:
        "Llame a t('nombreModulo.rutaClave') usando el espacio de nombres de su archivo de localización. Para la interpolación, use la sintaxis {{variable}} y pase las variables como segundo argumento.",
      step3Title: "3. Usar t() con el Espacio de Nombres del Módulo",
      tFunctionTitle: "Uso de la Función t()",
      title: "Localización (i18n)",
    },
    realtime: {
      architectureTitle: "Arquitectura en Tiempo Real",
      connectionStatesTitle: "Estados de Conexión (Reconexión automática)",
      description: "Hubs del Backend y hooks de React conectados persistentemente.",
      hooksTitle: "Hooks de React para SignalR",
      hubsTitle: "Hubs de SignalR",
      intro:
        "SCRIPE respira en el navegador: actualiza sin pedir autorización al usuario las grillas y campanillas de notificaciones.",
      providerTitle: "Proveedor SignalR Global",
      tenantGroupNote:
        "La multiplexación del Hub separa los eventos a nivel de Servidor, por tanto la UI jamás recive alertas que pertenecen a inquilinos ajenos.",
      title: "Tiempo Real (SignalR)",
    },
    stateManagement: {
      antiPatternsTitle: "Anti-Patrones Comunes",
      categoriesTitle: "Categorías de Estado",
      description:
        "TanStack, Zustand y la toma de decisiones correcta sobre dónde almacenar qué en React.",
      intro:
        "La principal causa del código espagueti resuelta a través del aislamiento del origen de los datos.",
      languageIntro: "Manejado por un contexto personalizado apoyado en localStorage.",
      languageTitle: "Estado de Localización",
      mutationsTitle: "Mutaciones e Invalidación de Caché",
      tanstackIntro: "Espejo directo de la API. Cachea las respuestas HTTP para la aplicación UI.",
      tanstackTitle: "TanStack Query (Estado del Servidor)",
      title: "Gestión de Estado (Frontend)",
      zustandIntro:
        "Ligero y poderoso, enfocado únicamente a controles compartidos que la API desconoce.",
      zustandTitle: "Zustand (Estado Global UI)",
    },
  },
};

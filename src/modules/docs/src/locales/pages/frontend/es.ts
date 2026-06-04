
export const es = {
  frontend: {
    crudSystem: {
      title: "Sistema CRUD",
      description:
        "Hook useCrudViewModel, GenericCrudView, DataTable y el sistema generalizado de recolección de entrada.",
      intro:
        "Es la espina dorsal del frontend, permitiendo levantar pantallas funcionales al instante conectadas al backend.",
      architectureTitle: "Visión General de la Arquitectura",
      viewModelTitle: "Hook useCrudViewModel",
      viewModelIntro: "Maneja todo el estado base del servidor y mutaciones del lado del cliente.",
      genericCrudViewTitle: "Componente GenericCrudView",
      genericCrudViewIntro:
        "Ensambla mágicamente la tabla de datos, los modales y el título general pasando únicamente un ViewModel configurado.",
      columnsTitle: "Sistema de Columnas",
      dataTableTitle: "Características del DataTable",
      searchTitle: "Búsqueda Global",
      searchDesc: "Entrada que reacciona con debounce evitando sobrecarga al Servidor Backend.",
      sortingTitle: "Ordenamiento de Columnas",
      sortingDesc: "Permite múltiples ordenamientos asíncronos.",
      paginationTitle: "Paginación",
      paginationDesc:
        "Las consultas se limitan en el servidor directamente garantizando alto desempeño UI.",
      selectionTitle: "Selección de Filas",
      selectionDesc: "Manejo con exclusión y select-all optimizado.",
      responsiveTitle: "Layout Responsivo",
      responsiveDesc:
        "Se adapta elegantemente a móviles colapsando las columnas en base a la prioridad.",
      rtlTitle: "Soporte RTL",
      rtlDesc: "Se autogira bidireccionalmente dependiendo del lenguaje seleccionado.",
      formTitle: "Sistema de Formularios",
      formIntro:
        "Integrado en Zod. Utiliza GenricForm sobre un diálogo o página completa para operar validaciones precisas.",
      extensionTip:
        "Nunca modifiques los componentes Generic. Deben envolverse o sobreescribirse parcialmente para extenderlos.",
    },
    stateManagement: {
      title: "Gestión de Estado (Frontend)",
      description:
        "TanStack, Zustand y la toma de decisiones correcta sobre dónde almacenar qué en React.",
      intro:
        "La principal causa del código espagueti resuelta a través del aislamiento del origen de los datos.",
      categoriesTitle: "Categorías de Estado",
      tanstackTitle: "TanStack Query (Estado del Servidor)",
      tanstackIntro: "Espejo directo de la API. Cachea las respuestas HTTP para la aplicación UI.",
      mutationsTitle: "Mutaciones e Invalidación de Caché",
      zustandTitle: "Zustand (Estado Global UI)",
      zustandIntro:
        "Ligero y poderoso, enfocado únicamente a controles compartidos que la API desconoce.",
      languageTitle: "Estado de Localización",
      languageIntro: "Manejado por un contexto personalizado apoyado en localStorage.",
      antiPatternsTitle: "Anti-Patrones Comunes",
    },
    localization: {
      title: "Localización (i18n)",
      description:
        "La función t(), el manejador RTL, los diccionarios y cómo internacionalizar un módulo.",
      intro:
        "SCRIPE utiliza un sistema de localización con alcance de módulo. Las claves compartidas (~1,156) residen en core/locales/. Cada módulo posee sus traducciones en un directorio locales/ co-localizado, importado ansiosamente en tiempo de compilación a través de module-registry.ts para cargas de página sin parpadeos. Admite árabe (RTL) e inglés (LTR) con cambio de dirección automático, cambios de fuente y persistencia en localStorage.",
      architectureTitle: "Arquitectura",
      dictionaryTitle: "Estructura de Diccionarios",
      tFunctionTitle: "Uso de la Función t()",
      rtlTitle: "Soporte de RTL / LTR",
      rtlIntro:
        "Interviene la etiqueta principal de HTML autoconfigurando CSS flexbox para funcionar de derecha a izquierda si se elige Árabe.",
      addingKeysTitle: "Añadir Nuevas Claves de Traducción",
      step1Title: "1. Crear o Actualizar el Local del Módulo",
      step1Desc:
        "Añada nuevas claves a los archivos locales/{module}.en.ts y {module}.ar.ts de su módulo. Solo añádalas a core/locales/ si la clave es realmente compartida (validación, navegación, interfaz de usuario común).",
      step2Title: "2. Registrar en el Registro de Módulos",
      step2Desc:
        "Registra los locales de tu módulo en core/locales/module-registry.ts. Los nuevos módulos creados a través de scripe new-module se registran automáticamente mediante la CLI.",
      step3Title: "3. Usar t() con el Espacio de Nombres del Módulo",
      step3Desc:
        "Llame a t('nombreModulo.rutaClave') usando el espacio de nombres de su archivo de localización. Para la interpolación, use la sintaxis {{variable}} y pase las variables como segundo argumento.",
      noLocaleRoutes:
        "No utilizamos sistema de enrutamiento basado en archivos ([locale]) por temas drásticos de desempeño Server-Side.",
      moduleLocaleNote:
        "The scripe CLI automatically scaffolds locales/ when creating new modules via scripe new-module. Each locale file contains both EN and AR translations, bundled in a single chunk for instant language switching.",
    },
    formValidation: {
      title: "Validación de Formularios",
      description:
        "Esquemas Zod en el Cliente combinados con respuestas FluentValidation en el Servidor.",
      intro:
        "Garantiza un formulario sano desde el momento de tipeo antes de llegar a sobrecargar la red.",
      architectureTitle: "Arquitectura de Validación",
      zodTitle: "Esquemas Zod (Lado Cliente)",
      rhfTitle: "Integración con React Hook Form",
      rulesTitle: "Referencia de Reglas de Validación",
      serverErrorTitle: "Manejo de Errores del Lado Servidor",
      serverErrorIntro:
        "Traduce y mapea los errores FluentValidation y los pinta directamente sobre la entrada (input) roja de React Hook Form.",
    },
    componentLibrary: {
      title: "Biblioteca de Componentes",
      description:
        "Integración de shadcn/ui, fusión mediante utilidades cn() y reglas organizativas.",
      intro:
        "Garantiza que toda la plataforma visual tenga un diseño corporativo cohesivo sin reinventar la rueda.",
      shadcnTitle: "Fundación shadcn/ui",
      shadcnIntro:
        "Componentes crudos instalados e inyectados para tener absoluto dominio del renderizado nativo.",
      categoriesTitle: "Categorías de Componentes",
      formsTitle: "Componentes de Formulario",
      feedbackTitle: "Componentes de Feedback",
      layoutTitle: "Componentes de Diseño (Layout)",
      chartsTitle: "Componentes Analíticos (Gráficos)",
      genericSelectTitle: "Componente GenericSelect",
      genericSelectIntro:
        "Nuestro propio selector multinivel con paginación optimizada para enormes catálogos de datos corporativos.",
      themeTitle: "Sistema de Tema (Theming)",
      responsiveTitle: "Diseño Responsivo",
      a11yTitle: "Accesibilidad (A11y)",
      placementTitle: "Reglas de Ubicación de Componentes",
      architectureTitle: "Arquitectura de Componentes",
      neverInApp:
        "Evitar estrictamente situar componentes compartidos o lógica en el subdirectorio de enrutamiento Next.js (app).",
    },
    realtime: {
      title: "Tiempo Real (SignalR)",
      description: "Hubs del Backend y hooks de React conectados persistentemente.",
      intro:
        "SCRIPE respira en el navegador: actualiza sin pedir autorización al usuario las grillas y campanillas de notificaciones.",
      architectureTitle: "Arquitectura en Tiempo Real",
      hubsTitle: "Hubs de SignalR",
      hooksTitle: "Hooks de React para SignalR",
      providerTitle: "Proveedor SignalR Global",
      connectionStatesTitle: "Estados de Conexión (Reconexión automática)",
      tenantGroupNote:
        "La multiplexación del Hub separa los eventos a nivel de Servidor, por tanto la UI jamás recive alertas que pertenecen a inquilinos ajenos.",
    },
  },
};

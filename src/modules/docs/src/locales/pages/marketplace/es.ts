export const es = {
  commercial: {
    marketplace: {
      financials: {
        description: "Monetice las integraciones de terceros con modelos de precios flexibles.",
        intro:
          "El mercado monetiza las aplicaciones mediante comisiones, precios flexibles y transferencias automatizadas.",
        revenueIntro:
          "Seleccione las condiciones comerciales que mejor se adapten a su estrategia.",
        revenueTitle: "Modelos de Ingresos",
        revOneItem1: "Configure una comisión porcentual sobre todos los listados de pago.",
        revOneItem2: "Aplique tarifas fijas por cada transacción de compra.",
        revOneItem3: "Cobre comisiones automáticamente durante el pago del cliente.",
        revOneTitle: "División de Comisiones",
        revTwoItem1: "Soporta aplicaciones gratuitas, suscripciones mensuales o pago por uso.",
        revTwoItem2: "Soporta facturación multi-moneda de forma nativa.",
        revTwoItem3: "Sesiones de pago totalmente gestionadas y facturación automática.",
        revTwoTitle: "Flexibilidad de Precios",
        splitIntro:
          "Con Stripe Connect, los ingresos se dividen al instante. La comisión de la plataforma va a su cuenta y el saldo restante al desarrollador, sin contabilidad manual.",
        splitTitle: "Pagos Divididos",
        title: "Finanzas y Monetización",
      },
      overview: {
        description: "Haga crecer el ecosistema de su plataforma con una tienda integrada.",
        intro:
          "El Mercado de Apps de SCRIPE le permite lanzar una tienda de extensiones integrada. Los clientes pueden descubrir, instalar y comprar integraciones de terceros.",
        title: "Mercado de Apps",
        val1: "Expansión del Ecosistema",
        val1Desc: "Permita que terceros creen integraciones, aumentando el valor de su plataforma.",
        val2: "Nueva Fuente de Ingresos",
        val2Desc: "Monetice la plataforma cobrando comisiones sobre las aplicaciones de pago.",
        val3: "Retención de Clientes",
        val3Desc: "Mayor fidelidad de los clientes al integrar herramientas clave en sus procesos.",
        val4: "Registro Automatizado",
        val4Desc:
          "El registro autoservicio de desarrolladores y revisiones reduce la carga administrativa.",
        valueIntro: "Lanzar un mercado de aplicaciones aporta beneficios comerciales importantes.",
        valueTitle: "Ventajas Comerciales Clave",
      },
    },
  },
  marketplace: {
    catalog: {
      apiCategories: "Lista categorías activas para el filtrado del catálogo",
      apiDetails: "Obtiene detalles completos, precios, capturas y opiniones de la aplicación",
      apiInstall: "Inicia la instalación de la aplicación y actualización de derechos",
      apiList: "Obtiene el catálogo activo con paginación, búsqueda y filtros",
      apiReviewCreate: "Añade calificación y opinión para un listado de aplicación",
      apiReviewReply: "Permite a los desarrolladores responder a las opiniones",
      apiUninstall: "Inicia la desinstalación y limpieza de dependencias",
      controllerIntro:
        "Los endpoints del catálogo están gestionados por AppCatalogController, AppCategoryController y AppReviewController.",
      controllerTitle: "Endpoints del Catálogo",
      description:
        "Búsqueda en el catálogo de aplicaciones, categorías, instalación y calificaciones de usuarios.",
      installationIntro:
        "La instalación de la aplicación sigue una secuencia de verificación de varios pasos.",
      installationTitle: "Flujo de Instalación",
      intro:
        "El subsistema del catálogo muestra los listados activos. Soporta la agrupación por categorías, búsqueda de texto, instalación y opiniones.",
      step1Content:
        "El sistema verifica las ediciones de suscripción del inquilino para confirmar si se permiten integraciones personalizadas.",
      step1Title: "Filtro de Derechos",
      step2Content:
        "Si la aplicación es de pago, se verifica la licencia o se redirige a la sesión de pago antes de activarla.",
      step2Title: "Validación de Pago",
      step3Content:
        "La aplicación se marca como activa para el inquilino, activando eventos webhook para configurar el entorno.",
      step3Title: "Activación del Inquilino",
      title: "Catálogo de Apps",
    },
    financials: {
      apiEarnings: "Obtiene el saldo del desarrollador y el historial de ingresos",
      apiPayoutProcess: "Endpoint de administrador para procesar pagos en lote",
      apiPayoutRequest: "Solicita un pago manual para ingresos acumulados",
      apiPayouts: "Lista el historial de transferencias realizadas",
      controllerIntro:
        "Las finanzas del mercado están controladas por AppFinancialsController y tareas en segundo plano.",
      controllerTitle: "Endpoints Financieros",
      description:
        "Procesamiento de compras, cálculo de saldos y transferencias a desarrolladores.",
      intro:
        "El subsistema financiero registra compras, gestiona los saldos de los desarrolladores y procesa los pagos.",
      payoutIntro: "El procesamiento de transferencias liquida los saldos de forma segura.",
      payoutTitle: "Flujo de Procesamiento de Pagos",
      step1Content:
        "Cuando un inquilino compra una aplicación, se registra la transacción, se separa la comisión y se acredita el saldo al desarrollador.",
      step1Title: "Registro de Transacción",
      step2Content:
        "La tarea PayoutBatchJob reúne las solicitudes de pago aprobadas y las agrupa para su liquidación.",
      step2Title: "Procesamiento por Lotes",
      step3Content:
        "Los pagos se procesan vía Stripe Connect, transfiriendo los saldos a la cuenta del desarrollador.",
      step3Title: "Transferencia de Fondos",
      title: "Finanzas del Mercado",
    },
    overview: {
      backendIntro: "El mercado se apoya en un DbContext dedicado y entidades específicas.",
      backendTitle: "Arquitectura del Backend",
      conn1: "Publica aplicaciones aprobadas",
      conn2: "Procesa pagos",
      conn3: "Califica aplicaciones",
      conn4: "Verifica cuotas",
      cqrsCatalogQuery: "Obtiene listados del catálogo paginados y filtrados",
      cqrsDesc: "Descripción del proceso",
      cqrsDetailsQuery: "Obtiene detalles y comentarios de la aplicación",
      cqrsDevProfile: "Registra un perfil de desarrollador con los detalles de la empresa",
      cqrsEarningsQuery: "Calcula los saldos pendientes y el historial del desarrollador",
      cqrsExample: "Solicitud AstraFlow",
      cqrsIntro: "El módulo utiliza comandos y consultas estándar para todas las operaciones.",
      cqrsPurchase: "Inicia el pago para integraciones pagadas",
      cqrsReview: "Envía calificación y comentario para una aplicación",
      cqrsSubmitListing: "Envía un listado de aplicación para revisión en el entorno de pruebas",
      cqrsTitle: "Comandos y Consultas CQRS",
      cqrsType: "Tipo",
      descCatalog: "Gestiona los detalles globales de las aplicaciones, etiquetas y categorías.",
      descEnt: "Control de Derechos",
      descEntDesc:
        "Valida los límites de la edición del inquilino y licencias durante la instalación.",
      descFinancials:
        "Calcula las comisiones de la plataforma, saldos de desarrolladores y transferencias.",
      descReviews:
        "Gestiona las opiniones de los usuarios, reportes y respuestas de desarrolladores.",
      description: "Resumen del sistema de extensiones y aplicaciones de SCRIPE.",
      descSubmissions:
        "Gestiona las pruebas en el entorno de pruebas, versiones y cambios de estado.",
      featureCatalog: "Catálogo de Apps",
      featureCatalogDesc: "Busque, navegue y filtre integraciones listadas globalmente.",
      featureFinancials: "Ingresos y Pagos",
      featureFinancialsDesc:
        "Definición de precios, sesiones de pago y procesamiento de pagos por lotes.",
      featureReviews: "Revisiones y Calificaciones",
      featureReviewsDesc:
        "Comentarios de los inquilinos, calificaciones y respuestas de los desarrolladores.",
      featureSubmissions: "Envíos de Apps",
      featureSubmissionsDesc:
        "Registro de desarrolladores, creación de perfiles y ciclo de vida de los envíos.",
      infoContent:
        "Aunque el catálogo de aplicaciones se comparte globalmente, las instalaciones, configuraciones y compras están estrictamente aisladas a nivel de inquilino.",
      infoTitle: "Aislamiento de Inquilinos",
      intro:
        "El módulo de Mercado permite a los inquilinos descubrir, instalar y comprar integraciones y extensiones de terceros. También proporciona un portal para desarrolladores para la configuración del perfil, el envío de aplicaciones, los ciclos de revisión y el procesamiento de pagos.",
      sub1: "Listados de Apps y Catálogo",
      sub2: "Ciclo de vida del Envío",
      sub3: "Compensación Financiera",
      sub4: "Revisiones y Calificaciones",
      subModulesIntro:
        "El módulo de Mercado consta de varios submódulos que se comunican entre sí y con el sistema de derechos.",
      subModulesTitle: "Arquitectura de Submódulos",
      title: "Resumen del Mercado",
      whatIsIntro:
        "El motor del mercado gestiona el catálogo, el registro de desarrolladores, las revisiones y el procesamiento de pagos.",
      whatIsTitle: "Capacidades Clave",
    },
    submissions: {
      apiApprove: "Endpoint de administrador para aprobar y publicar la aplicación",
      apiCreateProfile: "Crea o actualiza los datos del desarrollador",
      apiCreateSubmission: "Crea una nueva solicitud de aplicación y sube recursos",
      apiListSubmissions: "Obtiene el historial de solicitudes del desarrollador",
      apiReject: "Endpoint de administrador para rechazar la aplicación con comentarios",
      controllerIntro:
        "La gestión de desarrolladores y envíos está controlada por DeveloperProfileController y AppSubmissionController.",
      controllerTitle: "Endpoints de Envío",
      description:
        "Configuración del perfil del desarrollador, creación de listados y flujo de revisión.",
      intro:
        "Los desarrolladores externos pueden registrarse, configurar perfiles y enviar listados de aplicaciones para revisión.",
      step1Content:
        "El desarrollador crea un perfil, configura datos de pago y entornos de prueba.",
      step1Title: "Registro de Desarrollador",
      step2Content:
        "El desarrollador define el nombre, descripción, precios, capturas y datos de seguridad.",
      step2Title: "Creación del Listado",
      step3Content:
        "Los administradores de SCRIPE prueban la integración en un entorno sandbox seguro para validar la seguridad.",
      step3Title: "Revisión en Sandbox",
      step4Content: "Tras la aprobación, el sistema publica la aplicación en el catálogo global.",
      step4Title: "Publicación en el Catálogo",
      title: "Envíos de Apps",
      workflowIntro: "Todas las solicitudes pasan por un pipeline de revisión seguro.",
      workflowTitle: "Ciclo de vida del Envío",
    },
  },
};

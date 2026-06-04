/**
 * Docs page locale — ES
 */
export const es = {
  modules: {
    compliance: {
      consent: {
        conn1: "plantillas",
        conn2: "genera al cambiar",
        conn3: "auto-revoca si expiró",
        descJob: "Tarea diaria que revoca consentimientos expirados",
        descPurpose: "Define a qué se está consintiendo (ej. Marketing)",
        descRecord: "Estado actual (Otorgado/Revocado) por propósito",
        description:
          "Registrar, rastrear y auditar los consentimientos de los usuarios para cumplir con el Artículo 6 de GDPR y CCPA.",
        descSnapshot: "Captura inmutable del otorgamiento/revocación",
        endpointsTitle: "Endpoints API",
        ep: {
          get: "Obtener registro de consentimiento por ID",
          list: "Listar registros de consentimiento",
          record: "Registrar un nuevo otorgamiento de consentimiento",
          withdraw: "Retirar un consentimiento previamente otorgado",
        },
        flowTitle: "Flujo de Estado de Consentimiento",
        gdprIntro:
          "El Artículo 6 de GDPR establece que el consentimiento debe ser: libremente dado, específico, informado e inequívoco. SCRIPE registra el texto exacto mostrado al usuario.",
        gdprTitle: "Base Legal GDPR",
        immutabilityIntro: "Los registros de consentimiento son inmutables.",
        immutabilityTitle: "Inmutabilidad",
        intro:
          "La Gestión de Consentimiento registra cada vez que un usuario otorga o revoca su consentimiento. SCRIPE almacena toda la pista de auditoría.",
        nodeJob: "Tarea de Expiración",
        nodePurpose: "Propósito del Consentimiento",
        nodeRecord: "Registro de Consentimiento",
        nodeSnapshot: "Captura de Consentimiento",
        purpose1: "Marketing — Emails de marketing y comunicaciones promocionales.",
        purpose2: "Analítica — Análisis de uso y mejora del producto.",
        purpose3: "Terceros — Compartición de datos con servicios de terceros.",
        purpose4: "Personalización — Contenido personalizado y recomendaciones.",
        purposesIntro: "Cada registro de consentimiento está vinculado a un propósito específico:",
        purposesTitle: "Propósitos del Consentimiento",
        title: "Gestión de Consentimiento",
        withdrawalIntro:
          "Los usuarios pueden retirar su consentimiento en cualquier momento. El ConsentRecord se actualiza con WithdrawnAt.",
        withdrawalTitle: "Retirada del Consentimiento",
      },
      dsr: {
        codeTitle: "Ejemplo de Código",
        conn1: "inicia",
        conn2: "tarea en segundo plano recoge",
        conn3: "si es auto-procesada (Exportación)",
        conn4: "si es nuclear (Borrado)",
        conn5: "admin confirma",
        conn6: "admin rechaza",
        descApproval:
          "Acciones nucleares (Borrado) requieren confirmación manual del administrador",
        descCompleted: "Exportación generada o datos borrados; SLA cumplido",
        descPending: "Solicitud registrada, plazo de SLA calculado",
        descProcessing: "DsrExecutionJob procesa los módulos vía ISuspendableModule",
        descRejected: "Solicitud denegada por el admin con notas de resolución",
        description:
          "Gestión de solicitudes de derechos GDPR/CCPA — exportación, borrado, rectificación y restricción — con seguimiento del ciclo de vida.",
        descSubmit: "El sujeto solicita Exportación, Borrado o Rectificación",
        endpointsIntro: "El controlador de DSR expone 6 endpoints:",
        endpointsTitle: "Endpoints API",
        entitiesTitle: "Entidades",
        entityDesc: "Descripción",
        entityDsrDesc: "Representa una solicitud de sujeto de datos.",
        entityModuleDesc: "Estado de ejecución de un módulo.",
        entityName: "Nombre de la Entidad",
        entityStatusDesc: "Historial de cambios de estado.",
        ep: {
          assign: "Asignar DSR a un oficial de cumplimiento",
          create: "Enviar una nueva DSR",
          delete: "Borrado lógico de una DSR",
          get: "Obtener detalles de la DSR por ID",
          list: "Listar todas las DSR (paginado, filtrable)",
          updateStatus: "Actualizar estado de la DSR (InProgress, Completed, Rejected)",
        },
        intro:
          "Las Solicitudes de Sujetos de Datos (DSR) son peticiones formales de individuos que ejercen sus derechos. El módulo proporciona un flujo de trabajo DSR completo: envío, asignación, procesamiento y cierre.",
        lifecycleFlowTitle: "Flujo de Vida DSR",
        lifecycleIntro: "Las DSR pasan por un conjunto definido de estados:",
        lifecycleTitle: "Ciclo de vida de la solicitud",
        nodeApproval: "Esperar a Admin",
        nodeCompleted: "Estado: Completada",
        nodePending: "Estado: Pendiente",
        nodeProcessing: "Estado: En Progreso",
        nodeRejected: "Estado: Rechazada",
        nodeSubmit: "Enviar solicitud",
        slasIntro:
          "Bajo el Artículo 12 de GDPR, los controladores deben responder a las DSR dentro de los 30 días (extensible a 3 meses para casos complejos). SCRIPE rastrea esto.",
        slasTitle: "Requisitos de SLA de GDPR",
        status1: "Pendiente (Pending) — Estado inicial cuando se recibe la solicitud.",
        status2: "En Progreso (InProgress) — Un oficial de cumplimiento ha sido asignado.",
        status3:
          "Completada (Completed) — La solicitud ha sido cumplida (datos exportados, borrados, corregidos o restringidos).",
        status4:
          "Rechazada (Rejected) — La solicitud fue rechazada (ej. insuficiente verificación de identidad).",
        title: "Solicitudes de Sujetos de Datos (DSR)",
        type1:
          "Exportación — Solicitud de portabilidad de datos. El sujeto desea una copia de sus datos personales.",
        type2:
          "Borrado — Derecho al olvido. Todos los datos personales deben ser eliminados o anonimizados.",
        type3: "Rectification — Solicitud de corrección. Los datos inexactos deben actualizarse.",
        type4:
          "Restricción — Restricción del procesamiento. Los datos pueden conservarse pero no procesarse activamente.",
        typesIntro:
          "El sistema soporta cuatro tipos de DSR como se define en el Artículo 17 de GDPR y CCPA:",
        typesTitle: "Tipos de Solicitud",
      },
      inventory: {
        description:
          "Un registro de todas las categorías de datos personales procesadas — requerido por el Artículo 30 del GDPR (RoPA).",
        endpointsTitle: "Endpoints API",
        ep: {
          create: "Agregar una nueva categoría de datos al inventario",
          delete: "Eliminar un elemento del inventario",
          get: "Obtener elemento por ID",
          list: "Listar elementos del inventario (paginado, buscable)",
          update: "Actualizar un elemento del inventario existente",
        },
        field1: "DataCategory — Nombre legible de la categoría (ej. 'Direcciones de Email').",
        field2: "LegalBasis — La base legal del GDPR (Consentimiento, Contrato, etc.).",
        field3: "DataSubjects — A quién pertenecen los datos (ej. 'Usuarios finales').",
        field4: "ProcessingPurpose — Por qué se procesan los datos (ej. 'Marketing').",
        field5: "StorageLocation — Dónde se almacenan (país/región).",
        field6: "RetentionPeriod — Cuánto tiempo se conservan.",
        field7: "ThirdPartySharing — Si los datos se comparten con terceros.",
        fieldsIntro: "Cada elemento documenta:",
        fieldsTitle: "Campos del Inventario",
        intro:
          "El Inventario de Datos es un registro estructurado. Según el Artículo 30 del GDPR, los controladores deben mantener un Registro de Actividades de Procesamiento (RoPA).",
        ropaIntro:
          "Organizaciones con más de 250 empleados deben mantener un RoPA. El inventario de SCRIPE sirve como un RoPA en vivo y exportable.",
        ropaTitle: "Cumplimiento del Artículo 30",
        title: "Inventario de Datos",
      },
      overview: {
        backendIntro:
          "Sigue la disposición estándar de 3 proyectos de SCRIPE (Domain / Application / Infrastructure) con ComplianceDbContext.",
        backendTitle: "Arquitectura Backend",
        conn1: "inicia solicitudes",
        conn2: "otorga/revoca",
        conn3: "controla políticas",
        conn4: "guía el borrado",
        conn5: "apunta a datos",
        conn6: "pistas de auditoría",
        conn7: "pistas de auditoría",
        descConsent: "Seguimiento inmutable de los estados y capturas de consentimiento",
        descDsr: "Maneja las Solicitudes de Sujetos (Exportación, Borrado, Rectificación)",
        descEnt: "Módulo de Derechos",
        descEntDesc: "Controla las capacidades de cumplimiento por funciones",
        descId: "Módulo de Identidad",
        descIdDesc: "Proporciona contexto de Usuario/Admin y Autorización",
        descInv: "Mapea ubicaciones sensibles de PII en los módulos",
        descRep: "Genera informes de cumplimiento de RoPA y DPIA",
        descRet: "Hace cumplir las políticas de destrucción de datos según la antigüedad",
        description:
          "Automatización de cumplimiento de GDPR, CCPA y PDPA — regulaciones, manejo de DSR, gestión de consentimiento, retención de datos, inventario y reportes.",
        endpointsIntro:
          "Todos los endpoints están bajo /api/v1/compliances/ y requieren autenticación con el permiso compliance.view.",
        endpointsTitle: "Resumen de Endpoints API",
        frontendIntro:
          "El frontend está organizado como seis submódulos independientes bajo src/modules/compliance/, cada uno con sus propias capas.",
        frontendTitle: "Arquitectura Frontend",
        infoContent:
          "El módulo de Cumplimiento es crítico para mantener la adherencia regulatoria y evitar multas. Asegúrese de que todas las funciones estén mapeadas correctamente a las políticas de procesamiento de datos.",
        infoTitle: "Aviso de Cumplimiento",
        intro:
          "El módulo de Cumplimiento es el motor regulatorio integrado de SCRIPE. Ayuda a los operadores de la plataforma y a sus inquilinos a cumplir con las principales leyes de protección de datos (GDPR, CCPA, PDPA) mediante herramientas automatizadas para gestionar solicitudes de sujetos de datos, registros de consentimiento, políticas de retención y la generación de reportes listos para auditorías.",
        sub1: "Perfiles de Regulación — Almacena los marcos regulatorios (GDPR, CCPA, PDPA) bajo los cuales opera la plataforma.",
        sub2: "Solicitudes de Sujetos de Datos (DSR) — Gestiona solicitudes de derechos (exportación, borrado, rectificación, restricción).",
        sub3: "Gestión de Consentimiento — Registra, rastrea y audita las concesiones y revocaciones de consentimiento de los usuarios.",
        sub4: "Políticas de Retención de Datos — Define cuánto tiempo se mantienen los datos y qué sucede cuando expiran (eliminar o anonimizar).",
        sub5: "Inventario de Datos — Un registro de todas las categorías de datos personales que la plataforma procesa.",
        sub6: "Reportes de Cumplimiento — Genera reportes asíncronos listos para auditorías (Resumen GDPR, Resumen DSR, Auditoría de Consentimiento, etc.).",
        subModulesIntro: "Cada subsistema maneja un dominio de cumplimiento específico:",
        subModulesTitle: "Seis Subsistemas",
        th1: "Componente",
        th2: "Responsabilidad",
        title: "Módulo de Cumplimiento",
        tr1_1: "DsrListViewModel",
        tr1_2:
          "Maneja la paginación, filtrado y asignación de las Solicitudes de Sujetos de Datos entrantes.",
        tr2_1: "ConsentRecordView",
        tr2_2:
          "Representa la captura de consentimiento inmutable junto con metadatos del agente de usuario y de fecha y hora.",
        whatIsIntro:
          "El módulo de Cumplimiento proporciona seis subsistemas interconectados que cubren todo el ciclo de vida de cumplimiento. En lugar de construir herramientas desde cero, los inquilinos de SCRIPE obtienen un sistema listo para producción.",
        whatIsTitle: "¿Qué es el Módulo de Cumplimiento?",
      },
      reports: {
        asyncIntro:
          "Los reportes se generan de forma asíncrona para no bloquear las peticiones HTTP. Cuando solicita un reporte, el sistema crea un registro ComplianceReport (IsReady=false) y encola la generación.",
        asyncTip:
          "Use el botón de Actualizar para comprobar cuándo está listo (generalmente 30-60 segundos).",
        asyncTitle: "Generación Asíncrona",
        description:
          "Generar reportes asíncronos listos para auditorías (Resumen GDPR, DSR, Auditoría de Consentimiento, Retención, Inventario).",
        downloadIntro:
          "Una vez que un reporte está listo (IsReady=true), el DownloadUrl está disponible. Los reportes se retienen por 90 días.",
        downloadTitle: "Descarga de Reportes",
        endpointsTitle: "Endpoints API",
        ep: {
          download: "Descargar el archivo del reporte generado",
          generate: "Encolar la generación de un nuevo reporte",
          get: "Obtener detalles del reporte y URL de descarga por ID",
          list: "Listar todos los reportes de cumplimiento (paginado)",
        },
        intro:
          "Los Reportes de Cumplimiento son documentos generados de forma asíncrona que proporcionan resúmenes para inspecciones regulatorias o auditorías internas.",
        reportTypesIntro: "Hay cinco tipos de reportes disponibles:",
        reportTypesTitle: "Tipos de Reportes",
        title: "Reportes de Cumplimiento",
        type1: "Resumen GDPR — Resumen de alto nivel del estado de cumplimiento de GDPR.",
        type2:
          "Resumen de Actividad DSR — Estadísticas sobre volumen, tipos y tasas de cumplimiento de DSR.",
        type3:
          "Auditoría de Consentimiento — Registro completo de consentimientos otorgados y retirados.",
        type4:
          "Análisis de Retención — Estado actual de cumplimiento de todas las políticas activas.",
        type5:
          "Exportación de Inventario de Datos — Exportación completa del inventario (RoPA Artículo 30).",
      },
      retention: {
        action1: "Eliminar (Delete) — Elimina permanentemente todos los registros.",
        action2: "Anonimizar (Anonymize) — Reemplaza la PII con tokens seudónimos.",
        actionsIntro: "Al expirar, SCRIPE aplica una de dos acciones:",
        actionsTitle: "Acciones de Expiración",
        automationIntro:
          "La tarea RetentionEnforcementJob se ejecuta diariamente escaneando políticas y aplicando la acción. Se crea un registro de auditoría RetentionExecution.",
        automationTitle: "Aplicación Automatizada",
        conn1: "escaneado por",
        conn2: "desencadena",
        conn3: "registra",
        descAction: "Eliminación forzada o Anonimización",
        descEnforcement: "Tarea semanal para evaluar políticas",
        descExecution: "Pista de auditoría de la acción de destrucción",
        descPolicy: "Define el tipo de entidad, límite de edad y estrategia",
        description:
          "Definir periodos de retención de datos y acciones automatizadas de expiración para el cumplimiento del Artículo 5(1)(e) del GDPR.",
        endpointsTitle: "Endpoints API",
        ep: {
          executions: "Listar historial de ejecuciones de retención",
          list: "Listar todas las políticas de retención",
          update: "Actualizar una política de retención",
        },
        field1:
          "DataCategory — El tipo de datos (ej. 'Perfiles de Usuario', 'Registros de Consentimiento').",
        field2: "RetentionDays — Cuántos días deben conservarse los datos.",
        field3:
          "ExpiryAction — Qué ocurre cuando el periodo expira: Eliminar (Delete) o Anonimizar (Anonymize).",
        field4: "RegulationCode — Qué regulación exige esto (GDPR, CCPA, etc.).",
        intro:
          "Las Políticas de Retención de Datos definen cuánto tiempo se deben conservar las categorías de datos. SCRIPE hace cumplir estas políticas automáticamente a través de trabajos en segundo plano.",
        nodeAction: "Destrucción de Datos",
        nodeEnforcement: "Tarea de Aplicación de Retención",
        nodeExecution: "Ejecución de Retención",
        nodePolicy: "Política de Retención",
        policiesIntro: "Cada política de retención especifica:",
        policiesTitle: "Configuración de la Política",
        title: "Políticas de Retención de Datos",
      },
    },
    editions: {
      description:
        "Planes de suscripción con nombre, paquetes de funciones, políticas de desbordamiento, versionado y estrategias de implementación.",
      drillDownIntro:
        "Cuando un administrador del sistema hace drill-down en un inquilino, la lista de ediciones se limita automáticamente a mostrar solo las ediciones visibles para ese inquilino. El backend usa el encabezado X-Tenant-Context para filtrar: ediciones del sistema + ediciones minoristas creadas por el inquilino en drill-down. El frontend oculta las acciones CRUD en el modo drill-down.",
      drillDownTitle: "Comportamiento de Drill-Down",
      endpointsCreate: "Crear una nueva edición",
      endpointsCreateVersion: "Crear una nueva versión borrador con una instantánea de funciones",
      endpointsDelete: "Eliminado lógico (soft-delete) de una edición",
      endpointsDirectApply: "Aplicar cambios de funciones inmediatamente (sin versionado)",
      endpointsGet: "Obtener detalles de la edición por ID",
      endpointsGetFeatures: "Listar las funciones configuradas para esta edición",
      endpointsGetVersions: "Listar todas las versiones para esta edición",
      endpointsIntro:
        "El controlador de Ediciones expone 11 endpoints para gestionar las ediciones, sus funciones y el ciclo de vida de las versiones:",
      endpointsList: "Listar todas las ediciones (paginado, filtrable)",
      endpointsPublishVersion:
        "Publicar una versión borrador con la estrategia de implementación elegida",
      endpointsSetFeatures: "Establecer/actualizar funciones para esta edición",
      endpointsTitle: "Puntos de Conexión API (Endpoints)",
      endpointsUpdate: "Actualizar metadatos de la edición",
      entityIntro:
        "Una Edición es un plan con nombre que agrupa valores de funciones. Las ediciones del sistema son creadas por los administradores de la plataforma; las ediciones minoristas (retail) son creadas por los inquilinos revendedores para sus inquilinos secundarios.",
      entityTitle: "Entidad de Edición",
      featuresIntro:
        "Cada edición contiene un conjunto de registros EditionFeature que mapean las funciones a sus valores dentro de ese plan. Las funciones que no se establecen explícitamente en una edición recurren al valor de Feature.DefaultValue.",
      featuresTip:
        "Las funciones no establecidas explícitamente en una edición recurren a Feature.DefaultValue. Solo necesita configurar las funciones que difieren del valor predeterminado global.",
      featuresTitle: "Funciones de la Edición",
      intro:
        "Las Ediciones son planes con nombre (ej. Básico, Pro, Enterprise) que agrupan valores de funciones. Cada inquilino se suscribe a una edición, lo que determina su acceso a las funciones. Las ediciones admiten el control de versiones con estrategias de implementación controladas para un despliegue seguro de los cambios.",
      overflowIntro:
        "Cuando un inquilino baja a una edición con límites inferiores (downgrade), sus recursos existentes pueden superar los nuevos límites. La Política de Desbordamiento determina qué sucede:",
      overflowTitle: "Política de Desbordamiento (Overflow Policy)",
      rolloutIntro:
        "Al publicar una versión de edición, los administradores eligen cómo se implementan los cambios en los inquilinos suscritos:",
      rolloutTitle: "Estrategias de Implementación",
      scopingIntro:
        "SCRIPE admite dos tipos de ediciones: las ediciones del Sistema, creadas por administradores de la plataforma y visibles para todos los inquilinos, y las ediciones Minoristas, creadas por inquilinos revendedores solo para sus inquilinos secundarios.",
      scopingNote:
        "Los administradores de inquilinos solo ven las ediciones del sistema más sus propias ediciones minoristas. Esto garantiza el aislamiento de la edición entre los inquilinos revendedores.",
      scopingTitle: "Ediciones del Sistema vs Minoristas (Retail)",
      title: "Ediciones",
      versionsIntro:
        "Las Versiones de la Edición proporcionan un sistema de versionado e implementación para los cambios en las funciones. En lugar de modificar las funciones directamente, los administradores pueden crear una nueva versión (instantánea), elegir una estrategia de implementación y publicarla.",
      versionsTitle: "Versiones de la Edición",
      workflowIntro:
        "SCRIPE ofrece dos formas de actualizar las funciones de la edición, cada una adecuada para diferentes escenarios:",
      workflowTip:
        "Utilice 'Aplicar Ahora' para correcciones urgentes y pequeños cambios. Utilice 'Guardar como Versión' para actualizaciones importantes del plan que necesiten una implementación gradual y un registro de auditoría.",
      workflowTitle: "Aplicar Ahora vs Guardar como Versión",
    },
    entitlementsOverview: {
      architectureIntro:
        "El sistema de Derechos está compuesto por cuatro dominios interconectados que trabajan juntos para proporcionar una solución completa de control de funciones.",
      architectureTitle: "Arquitectura",
      backendIntro:
        "El backend de Derechos sigue el diseño estándar de módulos de Arquitectura Limpia de SCRIPE con capas de Dominio, Aplicación e Infraestructura.",
      backendTitle: "Estructura del Backend",
      comparisonIntro:
        "La siguiente tabla muestra la diferencia de capacidades cuando el módulo de Derechos está habilitado frente a cuando se ejecuta sin él:",
      comparisonTitle: "Con vs Sin Derechos",
      contextAwareIntro:
        "Todas las páginas de Derechos (Funciones, Ediciones, Permisos) son contextuales. El frontend detecta si el usuario es un administrador del sistema (tenantId es null), un administrador de inquilino o está en modo drill-down, y llama a diferentes endpoints del backend en consecuencia. Los administradores del sistema ven el catálogo completo con CRUD; los administradores de inquilinos ven solo sus datos efectivos en modo de solo lectura.",
      contextAwareTitle: "Alcance Contextual",
      controllersIntro:
        "El módulo de Derechos expone 31 puntos de conexión (endpoints) API a través de 4 controladores, todos autenticados con JWT y protegidos por autorización basada en permisos.",
      controllersTitle: "Controladores API",
      cqrsMapIntro:
        "El módulo de Derechos registra 31 manejadores AstraFlow mediator que abarcan los cuatro dominios. Cada comando tiene un validador FluentValidation correspondiente para la validación de entrada.",
      cqrsMapTitle: "Mapa de Comandos y Consultas CQRS",
      description:
        "Control de acceso a funciones basado en ediciones mediante Funciones, Ediciones, Suscripciones y Sobreescrituras por inquilino.",
      diIntro:
        "Todos los servicios de Derechos se registran a través del método de extensión AddEntitlementsModule en DependencyInjection.cs. El módulo sigue el patrón de registro estándar de SCRIPE.",
      diTitle: "Registro de Inyección de Dependencias",
      domainsIntro: "Cada dominio maneja un aspecto específico del ciclo de vida de los derechos:",
      domainsTitle: "Cuatro Dominios",
      frontendIntro:
        "El frontend refleja el backend con cuatro submódulos (ediciones, funciones, suscripciones, sobreescrituras), cada uno siguiendo el patrón SOLID View/ViewModel.",
      frontendTitle: "Estructura del Frontend",
      gettingStartedIntro:
        "Siga estos 5 pasos para configurar el sistema de Derechos para su plataforma. Cada paso se basa en el anterior:",
      gettingStartedTitle: "Primeros Pasos",
      intro:
        "El módulo de Derechos (Entitlements) es el motor de gestión de planes y funciones de SCRIPE. Define qué capacidades obtiene cada inquilino (tenant), cómo los planes (ediciones) agrupan esas capacidades y cómo las suscripciones vinculan a los inquilinos con los planes.",
      noOpIntro:
        "Cuando el módulo de Derechos no está cargado (por ejemplo, en un microservicio que no incluye Derechos), SCRIPE registra un NoOpFeatureCache. Esto permite que los comandos IRequireFeature pasen sin errores: todas las funciones se tratan como habilitadas de forma predeterminada.",
      noOpNote:
        "El fallback NoOp garantiza que los módulos puedan usar IRequireFeature sin una fuerte dependencia del módulo de Derechos. En el modo monolito de producción, el FeatureCache real siempre está disponible.",
      noOpTitle: "Fallback NoOp",
      pipelineIntro:
        "SCRIPE integra los derechos directamente en la pipeline CQRS de AstraFlow mediator a través de FeatureCheckBehavior. Los comandos y consultas que implementan IRequireFeature se controlan automáticamente: si el valor de la función resuelta del inquilino está desactivado, la solicitud se rechaza antes de llegar al manejador.",
      pipelineTip:
        "Para restringir un comando detrás de una función, simplemente implemente IRequireFeature y establezca RequiredFeatureName en la clave de sistema estable de la función (ej. 'Chat.Enabled'). No se necesita código adicional.",
      pipelineTitle: "Integración de la Pipeline",
      resolutionIntro:
        "Cuando el sistema necesita determinar un valor de función para un inquilino, sigue una estricta cadena de prioridad. Gana la fuente de mayor prioridad que proporciona un valor.",
      resolutionTip:
        "La cadena de resolución se evalúa de forma diferida (lazy): los valores se almacenan en caché después de la primera resolución y se invalidan cuando cambian las suscripciones, las ediciones o las sobreescrituras.",
      resolutionTitle: "Cadena de Resolución de Valores de Funciones",
      title: "Resumen de Derechos",
      whatIsIntro:
        "Derechos es el módulo responsable de controlar a qué funciones puede acceder un inquilino en función de su edición (plan) suscrita. Proporciona una cadena de resolución de tres niveles: Valores predeterminados de la función → Valores de la edición → Sobreescrituras por inquilino, lo que garantiza la máxima flexibilidad tanto para los operadores de la plataforma como para los inquilinos revendedores.",
      whatIsTitle: "¿Qué son los Derechos?",
    },
    features: {
      cacheIntro:
        "Los valores de las funciones resueltas se almacenan en caché en IFeatureCache para evitar consultas a la base de datos en cada solicitud. La caché se invalida cada vez que cambian las funciones de una edición, se modifica una suscripción o se establece/elimina una sobreescritura. En implementaciones de microservicios sin el módulo de Derechos, un NoOpFeatureCache trata todas las funciones como habilitadas.",
      cacheNote:
        "La caché se invalida automáticamente cuando: (1) se modifican las funciones de una edición, (2) se asigna/cambia una suscripción, (3) se establece/elimina una sobreescritura. No se necesita limpieza manual de caché.",
      cacheTitle: "Caché de Funciones",
      contextAwareIntro:
        "La página de lista de funciones es contextual. Los administradores del sistema ven el catálogo completo de funciones con operaciones CRUD. Los administradores de inquilinos y las sesiones de drill-down ven solo las funciones efectivas del inquilino (resueltas a partir de la edición + sobreescrituras) en modo de solo lectura. Todo el alcance se gestiona desde el backend mediante GET /features (catálogo) vs GET /features/effective (ámbito de inquilino).",
      contextAwareTitle: "Visualización Contextual de Funciones",
      description:
        "Capacidades de la plataforma controlables con tipos de valor Booleanos, Numéricos y de Cadena (String).",
      endpointsIntro:
        "El controlador de Funciones expone 5 endpoints CRUD. Las funciones del sistema no se pueden eliminar:",
      endpointsTitle: "Puntos de Conexión API (Endpoints)",
      entityIntro:
        "Una Función define una capacidad controlable de la plataforma. El campo Name es una clave de sistema estable utilizada en el código; DisplayNameEn/DisplayNameAr son etiquetas orientadas al usuario.",
      entityTitle: "Entidad de Función",
      ep: {
        create: "Crear una nueva función personalizada",
        delete:
          "Eliminado lógico de una función personalizada (las funciones del sistema no se pueden eliminar)",
        get: "Obtener detalles de la función por ID",
        list: "Listar todas las funciones (paginado, filtrable por categoría/tipo)",
        update:
          "Actualizar metadatos de la función (funciones del sistema: solo DefaultValue/Description)",
      },
      intro:
        "Las Funciones son los bloques de construcción básicos del sistema de Derechos. Cada función representa una capacidad controlable: un interruptor booleano, una cuota numérica o una configuración de cadena. Las funciones tienen una clave de sistema estable (Name) que nunca cambia, lo que las hace seguras para referenciarlas en el código.",
      patternIntro:
        "Para restringir cualquier comando CQRS detrás de una verificación de función, simplemente implemente la interfaz de marcado IRequireFeature. El FeatureCheckBehavior intercepta automáticamente la solicitud, resuelve el valor de la función del inquilino y la rechaza si está deshabilitada o supera la cuota.",
      patternTitle: "Patrón IRequireFeature",
      quotaIntro:
        "Las funciones numéricas admiten la aplicación automática de cuotas a través de la entidad QuotaCounter. El FeatureCheckBehavior verifica el uso actual frente al límite resuelto para cada comando IRequireFeature que se dirija a una función numérica.",
      quotaTitle: "Seguimiento de Cuotas (QuotaCounter)",
      requireFeatureIntro:
        "Para restringir un comando o consulta CQRS detrás de una función, implemente la interfaz de marcado IRequireFeature. El comportamiento de la pipeline FeatureCheckBehavior resuelve automáticamente el valor actual del inquilino y rechaza la solicitud si la función está deshabilitada.",
      requireFeatureNote:
        "IRequireFeature funciona tanto para funciones Booleanas (comprobadas como habilitadas/deshabilitadas) como para funciones Numéricas (comprobadas como cuota restante). El comportamiento determina automáticamente el tipo de comprobación a partir del Feature.ValueType.",
      requireFeatureTitle: "Interfaz IRequireFeature",
      seedingIntro:
        "Las funciones del sistema se siembran automáticamente al inicio de la aplicación mediante EntitlementsStartupSeeder. El sembrador verifica si cada función del sistema ya existe (por Nombre) y solo crea las que faltan: las funciones existentes nunca se sobrescriben.",
      seedingTitle: "Sembrado de Funciones (Seeding)",
      systemVsCustomIntro:
        "SCRIPE distingue entre funciones del sistema (creadas al inicio, de solo lectura) y funciones personalizadas (creadas por los administradores a través de la API):",
      systemVsCustomTitle: "Funciones del Sistema vs Personalizadas",
      title: "Funciones (Features)",
      valueTypesIntro:
        "Los valores de las funciones se almacenan como cadenas (strings) pero se interpretan según su ValueType. El sistema valida los valores frente al tipo esperado en el momento de la creación y actualización.",
      valueTypesTip:
        "Para funciones Numéricas, use -1 para representar 'ilimitado'. FeatureCheckBehavior reconoce -1 como un valor especial y nunca bloquea las solicitudes de funciones con una cuota ilimitada.",
      valueTypesTitle: "Tipos de Valor",
    },
    overrides: {
      auditIntro:
        "Cada operación de sobreescritura se rastrea con información de auditoría completa. El campo Reason (Motivo) en cada sobreescritura proporciona el contexto de por qué se aplicó el valor personalizado.",
      auditTitle: "Registro de Auditoría (Audit Trail)",
      bestPracticesIntro:
        "Siga estas pautas para mantener su sistema de sobreescrituras fácil de mantener y auditar.",
      bestPracticesTitle: "Mejores Prácticas",
      bestPracticesWarning:
        "Las sobreescrituras deben usarse con moderación. Si muchos inquilinos necesitan la misma sobreescritura, considere crear una nueva edición en su lugar. El uso excesivo de sobreescrituras hace que el sistema sea más difícil de gestionar y crea una deuda de mantenimiento.",
      description:
        "Personalización del valor de la función por inquilino que omite los valores predeterminados de la edición.",
      endpointsIntro:
        "El controlador TenantFeatures expone 4 endpoints para gestionar las sobreescrituras por inquilino y los valores resueltos:",
      endpointsTitle: "Puntos de Conexión API (Endpoints)",
      entityIntro:
        "Un TenantFeatureOverride establece un valor personalizado para una función específica en un inquilino específico. Incluye un campo opcional 'Reason' (Motivo) para fines de auditoría.",
      entityTitle: "Entidad de Sobreescritura (Override)",
      ep: {
        list: "Listar todas las sobreescrituras para un inquilino específico",
        remove: "Eliminar (desactivar) una sobreescritura de función",
        resolved:
          "Obtener todos los valores de funciones resueltas para un inquilino (muestra la fuente: Sobreescritura/Edición/Predeterminado)",
        set: "Establecer o actualizar una sobreescritura de función para un inquilino",
      },
      expiryIntro:
        "Las sobreescrituras pueden tener una fecha opcional de expiración (ExpiresAt). Cuando pasa la fecha de expiración, la sobreescritura se desactiva automáticamente y la función vuelve al valor de la edición (o al predeterminado global).",
      expiryNote:
        "Las sobreescrituras expiradas se desactivan de forma lógica (IsActive = false), no se eliminan. Esto conserva el registro de auditoría y permite reactivarlas si es necesario.",
      expiryTitle: "Expiración de Sobreescrituras",
      intro:
        "Las Sobreescrituras de funciones permiten a los administradores de la plataforma personalizar los valores de las funciones para inquilinos individuales, independientemente de su edición suscrita. Las sobreescrituras tienen la máxima prioridad en la cadena de resolución, lo que las hace perfectas para acuerdos de ventas personalizados, promociones especiales o excepciones puntuales.",
      overuseWarning:
        "Las sobreescrituras deben usarse con moderación. Si muchos inquilinos necesitan la misma sobreescritura, considere crear una nueva edición. El exceso de sobreescrituras hace que el sistema sea más difícil de gestionar y auditar.",
      priorityIntro:
        "Las sobreescrituras se sitúan en la parte superior de la cadena de resolución. Cuando el sistema resuelve un valor de función para un inquilino, primero busca una sobreescritura:",
      priorityTitle: "Prioridad de Resolución",
      resolvedIntro:
        "El endpoint GET /api/v1/tenants/{tenantId}/features/resolved devuelve el valor final y efectivo de cada función para un inquilino determinado. Muestra la fuente de resolución (Sobreescritura, Edición o Predeterminado) para cada entrada, lo que facilita la depuración y auditoría.",
      resolvedTitle: "Endpoint de Funciones Resueltas",
      scenariosIntro:
        "Los siguientes escenarios del mundo real demuestran cuándo las sobreescrituras aportan más valor:",
      scenariosTitle: "Escenarios de Casos de Uso",
      settingIntro:
        "Para establecer una sobreescritura, envíe una solicitud POST al endpoint de funciones del inquilino con el ID de la función, el valor personalizado y un motivo opcional para fines de auditoría.",
      settingTip:
        "Siempre incluya un motivo al establecer sobreescrituras: hace que los registros de auditoría tengan sentido y ayuda a los futuros administradores a comprender por qué se aplicó la sobreescritura.",
      settingTitle: "Establecer una Sobreescritura",
      title: "Sobreescritura de Funciones (Overrides)",
      useCase1:
        "Acuerdos empresariales personalizados — 'Dar a Acme Corp 500 administradores en lugar de los 50 estándar'",
      useCase2:
        "Ofertas promocionales — 'Habilitar el Chat Premium para este inquilino durante 30 días'",
      useCase3:
        "Pruebas Beta — 'Habilitar el nuevo módulo de Facturación para los primeros usuarios'",
      useCase4: "Aumento temporal — 'Aumentar el límite de carga de archivos durante su migración'",
      whenIntro:
        "Las sobreescrituras están diseñadas para casos excepcionales en los que un inquilino necesita un valor diferente al que proporciona su edición:",
      whenTitle: "Cuándo Usar Sobreescrituras",
    },
    subscriptions: {
      assignIntro:
        "Crear una nueva suscripción vinculando a un inquilino a una edición. Si el inquilino ya tiene una suscripción activa, la anterior se cancela automáticamente. Admite parámetros opcionales de moneda, código promocional y comportamiento de expiración.",
      assignTitle: "Asignar Suscripción",
      concurrencyIntro:
        "Cada TenantSubscription tiene un ConcurrencyStamp (Guid) con [ConcurrencyCheck]. El sello se renueva en cada operación de escritura. Esto previene condiciones de carrera — por ejemplo, cancelación concurrente + trabajo de reconciliación — lanzando DbUpdateConcurrencyException en colisiones.",
      concurrencyTitle: "Concurrencia Optimista (E1)",
      crossModuleIntro:
        "Los eventos del ciclo de vida de suscripción publican eventos de dominio consumidos por el módulo de Identidad. Al suspender una suscripción, todos los administradores del inquilino se desactivan con DeactivationReason='SubscriptionSuspended'. Al reanudar, solo se reactivan los administradores desactivados por suspensión.",
      crossModuleReasons:
        "Tres razones de desactivación: 'Manual' (nunca se reactiva automáticamente), 'SubscriptionSuspended' (se reactiva al reanudar), 'SubscriptionExpired' (se desactiva al expirar).",
      crossModuleTitle: "Integración Entre Módulos (H1)",
      description:
        "Vinculación de inquilinos a ediciones con gestión completa del ciclo de vida, precios multidivisa, promociones, pruebas, descensos de plan (downgrades), comportamiento de expiración y exportación analítica avanzada.",
      downgradeIntro:
        "Cuando se baja de plan a un inquilino (ya sea manualmente o por expiración), el sistema rastrea los detalles de la suscripción original para auditoría y posible restauración. Los campos DowngradedFromEditionId, DowngradedFromType, DowngradedFromEndDate y DowngradedAt conservan el historial completo del downgrade.",
      downgradeTitle: "Seguimiento de Descenso de Plan (Downgrade)",
      downgradeWarning:
        "Al bajar de plan, la Política de Desbordamiento de la edición de destino determina qué sucede con los recursos que exceden los nuevos límites. Utilice siempre el endpoint de Impacto del Downgrade para previsualizar los efectos antes de realizar cambios.",
      endpointsIntro:
        "El controlador de Suscripciones proporciona 13 endpoints que cubren todo el ciclo de vida de la suscripción:",
      endpointsTitle: "Puntos de Conexión API (Endpoints)",
      entityIntro:
        "Una TenantSubscription vincula a un inquilino a una edición con seguimiento del ciclo de vida. Admite múltiples tipos de suscripción y estados para una gestión completa del ciclo de vida.",
      entityTitle: "Entidad de Suscripción",
      ep: {
        assign: "Crear una nueva suscripción (asignar inquilino a edición con moneda/promo)",
        cancel: "Cancelar suscripción permanentemente",
        downgrade: "Bajar a una edición inferior (Downgrade) (verifica OverflowPolicy)",
        export: "Exportar suscripciones como CSV, Excel o PDF con filtros avanzados",
        get: "Obtener detalles de la suscripción por ID",
        impact: "Previsualizar el impacto del downgrade antes de ejecutarlo",
        list: "Listar todas las suscripciones (paginado, filtrable por estado/tipo/inquilino)",
        renew: "Renovar una suscripción a punto de expirar",
        resume: "Reanudar una suscripción suspendida",
        suspend: "Suspender suscripción (bloquear el acceso del inquilino)",
        tenantActive: "Obtener la suscripción activa para un inquilino específico",
        upgrade: "Mejorar a una edición superior (Upgrade)",
      },
      exchangeRateIntro:
        "Todos los montos se normalizan a USD a través de ExchangeRateToUsd para informes MRR/ARR consistentes. El campo TotalAmountUsd se calcula en el momento de la suscripción y se almacena para precisión histórica — las fluctuaciones del tipo de cambio no modifican retroactivamente los registros anteriores.",
      exchangeRateTitle: "Normalización en USD",
      expiryIntro:
        "Cuando expira una suscripción, la configuración ExpiryBehavior determina qué sucede a continuación:",
      expiryTitle: "Comportamiento de Expiración",
      exportDaysLeftIntro:
        "Los informes incluyen una columna 'Días Restantes' calculada con codificación de colores condicional: rojo (≤7 días), amarillo (≤30 días), verde (>30 días). Esto permite identificar de un vistazo las suscripciones que requieren atención de renovación.",
      exportDaysLeftTitle: "Días Restantes para la Expiración",
      exportFilterCurrency: "Moneda — mostrar montos en la moneda seleccionada",
      exportFilterDate:
        "Rango de fechas — filtrar por fecha de creación de suscripción (últimos 7/30/90 días, último año o rango personalizado)",
      exportFilterEdition: "Edición — filtrar por plan/edición específica",
      exportFilterExpiring:
        "Expira pronto — encontrar suscripciones que expiran dentro de 5/7/14/30/60/90 días",
      exportFiltersIntro: "Los informes admiten filtros avanzados para análisis específicos:",
      exportFilterStatus: "Estado — Activo, Suspendido, Cancelado, Expirado",
      exportFiltersTitle: "Filtros de Exportación",
      exportFormatCsv: "CSV — ligero, importable en cualquier hoja de cálculo o herramienta BI",
      exportFormatExcel:
        "XLSX — libro de Excel profesional con encabezados estilizados, hoja de metadatos de filtro, formato condicional y columnas de tamaño automático (ClosedXML)",
      exportFormatPdf:
        "PDF — documento listo para imprimir con página de portada con marca, resumen estadístico y tablas de datos paginadas (QuestPDF)",
      exportFormatsTitle: "Detalles de Formatos de Exportación",
      exportIntro:
        "El sistema de exportación de suscripciones genera informes completos en formatos CSV, Excel (XLSX) y PDF. Cada informe incluye una página de portada con metadatos de filtro, tablas de datos con código de colores y resúmenes estadísticos.",
      exportTitle: "Exportación y Reportes Avanzados",
      impactIntro:
        "Antes de cambiar la edición de un inquilino, utilice el endpoint de Impacto del Downgrade para previsualizar qué recursos se desbordarían. La respuesta enumera cada función que excedería los límites de la nueva edición, junto con el uso actual frente al nuevo límite.",
      impactTitle: "Análisis de Impacto del Downgrade",
      intro:
        "Las suscripciones vinculan a los inquilinos con las ediciones (planes). Cada inquilino tiene una suscripción base que determina su edición y, opcionalmente, suscripciones complementarias para capacidades adicionales. El sistema de suscripción maneja todo el ciclo de vida, desde la asignación hasta la renovación, el descenso de plan, la suspensión y la cancelación — con precios multidivisa integrados y seguimiento de descuentos promocionales.",
      lifecycleIntro: "Las suscripciones pasan por una serie de estados durante su ciclo de vida:",
      lifecycleTitle: "Ciclo de Vida del Estado",
      operationsIntro:
        "El módulo de suscripción admite un conjunto completo de operaciones de ciclo de vida. Cada operación hace que la suscripción pase a un nuevo estado con un seguimiento de auditoría completo.",
      operationsTitle: "Operaciones de Suscripción",
      pricingIntro:
        "Cada suscripción lleva metadatos completos de precios: Moneda (código ISO), MontoBase, MontoAjuste, MontoTotal, TipoDeCambioAUsd y MontoTotalUsd. Esto permite un seguimiento preciso de los ingresos en más de 9 monedas compatibles (USD, EUR, GBP, SAR, AED, EGP, TRY, INR y más).",
      pricingTitle: "Precios Multidivisa",
      promoExpiryIntro:
        "Cuando se aplica una promoción con DurationDays > 0, el sistema calcula una marca temporal PromotionExpiresAt. En cada renovación, el manejador verifica si UtcNow > PromotionExpiresAt — si la promoción ha expirado, el descuento se elimina y NO se transfiere a la nueva fila de suscripción.",
      promoExpiryTitle: "Seguimiento de Caducidad de Promociones (A1)",
      promotionsIntro:
        "Las suscripciones admiten códigos promocionales a través del campo AppliedPromoCode. Cuando se aplica una promoción válida, se registra un porcentaje PromotionDiscount y el MontoAjuste refleja el descuento aplicado al MontoBase. Las promociones se rastrean por suscripción para auditoría y análisis.",
      promotionsTitle: "Descuentos Promocionales",
      renewalAuditIntro:
        "Cada ciclo de facturación produce su propia fila inmutable en la base de datos con precios fijados al momento de la renovación. Esto permite informes financieros precisos: tendencias de MRR, análisis de cancelaciones por período y seguimiento de reembolsos por ciclo.",
      renewalAuditTitle: "Pista de Auditoría de Ingresos",
      renewalIntro:
        "Las renovaciones crean una NUEVA fila de TenantSubscription en lugar de sobrescribir el registro existente (patrón Stripe). La suscripción antigua se marca como Expirada (IsActive=false), mientras se crea una nueva fila con Id fresco, StartDate=UtcNow, precios recalculados y detalles de promoción transferidos.",
      renewalTitle: "Renovación — Patrón de Fila Nueva (B2)",
      title: "Suscripciones",
      trialIntro:
        "Las suscripciones de prueba tienen una fecha de finalización (TrialEndDate). Cuando una prueba se actualiza a un plan de pago, IsTrialConverted se establece en true y la suscripción pasa al nuevo tipo. Si la prueba expira sin conversión, ExpiryBehavior determina qué sucede a continuación.",
      trialTitle: "Conversión de Prueba (Trial)",
      typesIntro:
        "Cada suscripción tiene un tipo que determina su ciclo de facturación y comportamiento:",
      typesTitle: "Tipos de Suscripción",
      upgradeIntro:
        "Los inquilinos pueden moverse entre ediciones. Los Upgrades se aplican de inmediato y las funciones de la nueva edición entran en vigencia al instante. Los Downgrades verifican primero la OverflowPolicy para manejar los recursos que exceden los nuevos límites.",
      upgradeTitle: "Mejora (Upgrade) y Descenso (Downgrade)",
      validationIntro:
        "Los 8 comandos de suscripción tienen validadores FluentValidation dedicados. Los validadores usan ILocalizer para mensajes de error localizados (EN + AR). Reglas de negocio: no renovar como prueba, montos de reembolso positivos, límites de longitud de texto.",
      validationTitle: "Validación de Entrada (G1)",
    },
  },
};

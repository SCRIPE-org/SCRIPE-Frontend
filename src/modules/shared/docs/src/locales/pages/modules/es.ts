// FILE-EXCEPTION: file length
/**
 * Docs page locale — ES
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const es = {
  modules: {
    entitlementsOverview: {
      title: "Resumen de Derechos",
      description:
        "Control de acceso a funciones basado en ediciones mediante Funciones, Ediciones, Suscripciones y Sobreescrituras por inquilino.",
      intro:
        "El módulo de Derechos (Entitlements) es el motor de gestión de planes y funciones de SCRIPE. Define qué capacidades obtiene cada inquilino (tenant), cómo los planes (ediciones) agrupan esas capacidades y cómo las suscripciones vinculan a los inquilinos con los planes.",
      whatIsTitle: "¿Qué son los Derechos?",
      whatIsIntro:
        "Derechos es el módulo responsable de controlar a qué funciones puede acceder un inquilino en función de su edición (plan) suscrita. Proporciona una cadena de resolución de tres niveles: Valores predeterminados de la función → Valores de la edición → Sobreescrituras por inquilino, lo que garantiza la máxima flexibilidad tanto para los operadores de la plataforma como para los inquilinos revendedores.",
      architectureTitle: "Arquitectura",
      architectureIntro:
        "El sistema de Derechos está compuesto por cuatro dominios interconectados que trabajan juntos para proporcionar una solución completa de control de funciones.",
      domainsTitle: "Cuatro Dominios",
      domainsIntro: "Cada dominio maneja un aspecto específico del ciclo de vida de los derechos:",
      resolutionTitle: "Cadena de Resolución de Valores de Funciones",
      resolutionIntro:
        "Cuando el sistema necesita determinar un valor de función para un inquilino, sigue una estricta cadena de prioridad. Gana la fuente de mayor prioridad que proporciona un valor.",
      pipelineTitle: "Integración de la Pipeline",
      pipelineIntro:
        "SCRIPE integra los derechos directamente en la pipeline CQRS de SCRIPE mediator a través de FeatureCheckBehavior. Los comandos y consultas que implementan IRequireFeature se controlan automáticamente: si el valor de la función resuelta del inquilino está desactivado, la solicitud se rechaza antes de llegar al manejador.",
      pipelineTip:
        "Para restringir un comando detrás de una función, simplemente implemente IRequireFeature y establezca RequiredFeatureName en la clave de sistema estable de la función (ej. 'Chat.Enabled'). No se necesita código adicional.",
      backendTitle: "Estructura del Backend",
      backendIntro:
        "El backend de Derechos sigue el diseño estándar de módulos de Arquitectura Limpia de SCRIPE con capas de Dominio, Aplicación e Infraestructura.",
      frontendTitle: "Estructura del Frontend",
      frontendIntro:
        "El frontend refleja el backend con cuatro submódulos (ediciones, funciones, suscripciones, sobreescrituras), cada uno siguiendo el patrón SOLID View/ViewModel.",
      controllersTitle: "Controladores API",
      controllersIntro:
        "El módulo de Derechos expone 31 puntos de conexión (endpoints) API a través de 4 controladores, todos autenticados con JWT y protegidos por autorización basada en permisos.",
      noOpTitle: "Fallback NoOp",
      noOpIntro:
        "Cuando el módulo de Derechos no está cargado (por ejemplo, en un microservicio que no incluye Derechos), SCRIPE registra un NoOpFeatureCache. Esto permite que los comandos IRequireFeature pasen sin errores: todas las funciones se tratan como habilitadas de forma predeterminada.",
      noOpNote:
        "El fallback NoOp garantiza que los módulos puedan usar IRequireFeature sin una fuerte dependencia del módulo de Derechos. En el modo monolito de producción, el FeatureCache real siempre está disponible.",
      contextAwareTitle: "Alcance Contextual",
      contextAwareIntro:
        "Todas las páginas de Derechos (Funciones, Ediciones, Permisos) son contextuales. El frontend detecta si el usuario es un administrador del sistema (tenantId es null), un administrador de inquilino o está en modo drill-down, y llama a diferentes endpoints del backend en consecuencia. Los administradores del sistema ven el catálogo completo con CRUD; los administradores de inquilinos ven solo sus datos efectivos en modo de solo lectura.",
      resolutionTip:
        "La cadena de resolución se evalúa de forma diferida (lazy): los valores se almacenan en caché después de la primera resolución y se invalidan cuando cambian las suscripciones, las ediciones o las sobreescrituras.",
      cqrsMapTitle: "Mapa de Comandos y Consultas CQRS",
      cqrsMapIntro:
        "El módulo de Derechos registra 31 manejadores SCRIPE mediator que abarcan los cuatro dominios. Cada comando tiene un validador FluentValidation correspondiente para la validación de entrada.",
      diTitle: "Registro de Inyección de Dependencias",
      diIntro:
        "Todos los servicios de Derechos se registran a través del método de extensión AddEntitlementsModule en DependencyInjection.cs. El módulo sigue el patrón de registro estándar de SCRIPE.",
      comparisonTitle: "Con vs Sin Derechos",
      comparisonIntro:
        "La siguiente tabla muestra la diferencia de capacidades cuando el módulo de Derechos está habilitado frente a cuando se ejecuta sin él:",
      gettingStartedTitle: "Primeros Pasos",
      gettingStartedIntro:
        "Siga estos 5 pasos para configurar el sistema de Derechos para su plataforma. Cada paso se basa en el anterior:",
      quotaGatingTitle: "Control de cuotas y reservas de espacios",
      quotaGatingIntro:
        "Las funciones numéricas representan cuotas que se aplican al crear recursos del inquilino. SCRIPE utiliza un patrón de reserva atómico y seguro para gestionar estos límites.",
      quotaGatingNote:
        "TryReserveSlotAsync incrementa el contador reservado. El controlador confirma esta reserva en caso de éxito o la libera en caso de fallo.",
    },
    editions: {
      title: "Ediciones",
      description:
        "Planes de suscripción con nombre, paquetes de funciones, políticas de desbordamiento, versionado y estrategias de implementación.",
      intro:
        "Las Ediciones son planes con nombre (ej. Básico, Pro, Enterprise) que agrupan valores de funciones. Cada inquilino se suscribe a una edición, lo que determina su acceso a las funciones. Las ediciones admiten el control de versiones con estrategias de implementación controladas para un despliegue seguro de los cambios.",
      entityTitle: "Entidad de Edición",
      entityIntro:
        "Una Edición es un plan con nombre que agrupa valores de funciones. Las ediciones del sistema son creadas por los administradores de la plataforma; las ediciones minoristas (retail) son creadas por los inquilinos revendedores para sus inquilinos secundarios.",
      overflowTitle: "Política de Desbordamiento (Overflow Policy)",
      overflowIntro:
        "Cuando un inquilino baja a una edición con límites inferiores (downgrade), sus recursos existentes pueden superar los nuevos límites. La Política de Desbordamiento determina qué sucede:",
      featuresTitle: "Funciones de la Edición",
      featuresIntro:
        "Cada edición contiene un conjunto de registros EditionFeature que mapean las funciones a sus valores dentro de ese plan. Las funciones que no se establecen explícitamente en una edición recurren al valor de Feature.DefaultValue.",
      versionsTitle: "Versiones de la Edición",
      versionsIntro:
        "Las Versiones de la Edición proporcionan un sistema de versionado e implementación para los cambios en las funciones. En lugar de modificar las funciones directamente, los administradores pueden crear una nueva versión (instantánea), elegir una estrategia de implementación y publicarla.",
      rolloutTitle: "Estrategias de Implementación",
      rolloutIntro:
        "Al publicar una versión de edición, los administradores eligen cómo se implementan los cambios en los inquilinos suscritos:",
      workflowTitle: "Aplicar Ahora vs Guardar como Versión",
      workflowIntro:
        "SCRIPE ofrece dos formas de actualizar las funciones de la edición, cada una adecuada para diferentes escenarios:",
      workflowTip:
        "Utilice 'Aplicar Ahora' para correcciones urgentes y pequeños cambios. Utilice 'Guardar como Versión' para actualizaciones importantes del plan que necesiten una implementación gradual y un registro de auditoría.",
      endpointsTitle: "Puntos de Conexión API (Endpoints)",
      endpointsIntro:
        "El controlador de Ediciones expone 11 endpoints para gestionar las ediciones, sus funciones y el ciclo de vida de las versiones:",
      drillDownTitle: "Comportamiento de Drill-Down",
      drillDownIntro:
        "Cuando un administrador del sistema hace drill-down en un inquilino, la lista de ediciones se limita automáticamente a mostrar solo las ediciones visibles para ese inquilino. El backend usa el encabezado X-Tenant-Context para filtrar: ediciones del sistema + ediciones minoristas creadas por el inquilino en drill-down. El frontend oculta las acciones CRUD en el modo drill-down.",
      scopingTitle: "Ediciones del Sistema vs Minoristas (Retail)",
      scopingIntro:
        "SCRIPE admite dos tipos de ediciones: las ediciones del Sistema, creadas por administradores de la plataforma y visibles para todos los inquilinos, y las ediciones Minoristas, creadas por inquilinos revendedores solo para sus inquilinos secundarios.",
      scopingNote:
        "Los administradores de inquilinos solo ven las ediciones del sistema más sus propias ediciones minoristas. Esto garantiza el aislamiento de la edición entre los inquilinos revendedores.",
      featuresTip:
        "Las funciones no establecidas explícitamente en una edición recurren a Feature.DefaultValue. Solo necesita configurar las funciones que difieren del valor predeterminado global.",
      endpointsList: "Listar todas las ediciones (paginado, filtrable)",
      endpointsGet: "Obtener detalles de la edición por ID",
      endpointsCreate: "Crear una nueva edición",
      endpointsUpdate: "Actualizar metadatos de la edición",
      endpointsDelete: "Eliminado lógico (soft-delete) de una edición",
      endpointsGetFeatures: "Listar las funciones configuradas para esta edición",
      endpointsSetFeatures: "Establecer/actualizar funciones para esta edición",
      endpointsDirectApply: "Aplicar cambios de funciones inmediatamente (sin versionado)",
      endpointsGetVersions: "Listar todas las versiones para esta edición",
      endpointsCreateVersion: "Crear una nueva versión borrador con una instantánea de funciones",
      endpointsPublishVersion:
        "Publicar una versión borrador con la estrategia de implementación elegida",
      seededTitle: "Ediciones del sistema preconfiguradas",
      seededIntro:
        "La plataforma inicializa dos ediciones estándar del sistema al arrancar mediante EditionSeeder, estableciendo los límites por defecto.",
    },
    subscriptions: {
      title: "Suscripciones",
      description:
        "Vinculación de inquilinos a ediciones con gestión completa del ciclo de vida, precios multidivisa, promociones, pruebas, descensos de plan (downgrades), comportamiento de expiración y exportación analítica avanzada.",
      intro:
        "Las suscripciones vinculan a los inquilinos con las ediciones (planes). Cada inquilino tiene una suscripción base que determina su edición y, opcionalmente, suscripciones complementarias para capacidades adicionales. El sistema de suscripción maneja todo el ciclo de vida, desde la asignación hasta la renovación, el descenso de plan, la suspensión y la cancelación — con precios multidivisa integrados y seguimiento de descuentos promocionales.",
      entityTitle: "Entidad de Suscripción",
      entityIntro:
        "Una TenantSubscription vincula a un inquilino a una edición con seguimiento del ciclo de vida. Admite múltiples tipos de suscripción y estados para una gestión completa del ciclo de vida.",
      typesTitle: "Tipos de Suscripción",
      typesIntro:
        "Cada suscripción tiene un tipo que determina su ciclo de facturación y comportamiento:",
      lifecycleTitle: "Ciclo de Vida del Estado",
      lifecycleIntro: "Las suscripciones pasan por una serie de estados durante su ciclo de vida:",
      downgradeTitle: "Seguimiento de Descenso de Plan (Downgrade)",
      downgradeIntro:
        "Cuando se baja de plan a un inquilino (ya sea manualmente o por expiración), el sistema rastrea los detalles de la suscripción original para auditoría y posible restauración. Los campos DowngradedFromEditionId, DowngradedFromType, DowngradedFromEndDate y DowngradedAt conservan el historial completo del downgrade.",
      downgradeWarning:
        "Al bajar de plan, la Política de Desbordamiento de la edición de destino determina qué sucede con los recursos que exceden los nuevos límites. Utilice siempre el endpoint de Impacto del Downgrade para previsualizar los efectos antes de realizar cambios.",
      expiryTitle: "Comportamiento de Expiración",
      expiryIntro:
        "Cuando expira una suscripción, la configuración ExpiryBehavior determina qué sucede a continuación:",
      pricingTitle: "Precios Multidivisa",
      pricingIntro:
        "Cada suscripción lleva metadatos completos de precios: Moneda (código ISO), MontoBase, MontoAjuste, MontoTotal, TipoDeCambioAUsd y MontoTotalUsd. Esto permite un seguimiento preciso de los ingresos en más de 9 monedas compatibles (USD, EUR, GBP, SAR, AED, EGP, TRY, INR y más).",
      exchangeRateTitle: "Normalización en USD",
      exchangeRateIntro:
        "Todos los montos se normalizan a USD a través de ExchangeRateToUsd para informes MRR/ARR consistentes. El campo TotalAmountUsd se calcula en el momento de la suscripción y se almacena para precisión histórica — las fluctuaciones del tipo de cambio no modifican retroactivamente los registros anteriores.",
      promotionsTitle: "Descuentos Promocionales",
      promotionsIntro:
        "Las suscripciones admiten códigos promocionales a través del campo AppliedPromoCode. Cuando se aplica una promoción válida, se registra un porcentaje PromotionDiscount y el MontoAjuste refleja el descuento aplicado al MontoBase. Las promociones se rastrean por suscripción para auditoría y análisis.",
      exportTitle: "Exportación y Reportes Avanzados",
      exportIntro:
        "El sistema de exportación de suscripciones genera informes completos en formatos CSV, Excel (XLSX) y PDF. Cada informe incluye una página de portada con metadatos de filtro, tablas de datos con código de colores y resúmenes estadísticos.",
      exportFiltersTitle: "Filtros de Exportación",
      exportFiltersIntro: "Los informes admiten filtros avanzados para análisis específicos:",
      exportFilterDate:
        "Rango de fechas — filtrar por fecha de creación de suscripción (últimos 7/30/90 días, último año o rango personalizado)",
      exportFilterExpiring:
        "Expira pronto — encontrar suscripciones que expiran dentro de 5/7/14/30/60/90 días",
      exportFilterStatus: "Estado — Activo, Suspendido, Cancelado, Expirado",
      exportFilterEdition: "Edición — filtrar por plan/edición específica",
      exportFilterCurrency: "Moneda — mostrar montos en la moneda seleccionada",
      exportDaysLeftTitle: "Días Restantes para la Expiración",
      exportDaysLeftIntro:
        "Los informes incluyen una columna 'Días Restantes' calculada con codificación de colores condicional: rojo (≤7 días), amarillo (≤30 días), verde (>30 días). Esto permite identificar de un vistazo las suscripciones que requieren atención de renovación.",
      exportFormatsTitle: "Detalles de Formatos de Exportación",
      exportFormatCsv: "CSV — ligero, importable en cualquier hoja de cálculo o herramienta BI",
      exportFormatExcel:
        "XLSX — libro de Excel profesional con encabezados estilizados, hoja de metadatos de filtro, formato condicional y columnas de tamaño automático (ClosedXML)",
      exportFormatPdf:
        "PDF — documento listo para imprimir con página de portada con marca, resumen estadístico y tablas de datos paginadas (QuestPDF)",
      renewalTitle: "Renovación — Patrón de Fila Nueva (B2)",
      renewalIntro:
        "Las renovaciones crean una NUEVA fila de TenantSubscription en lugar de sobrescribir el registro existente (patrón Stripe). La suscripción antigua se marca como Expirada (IsActive=false), mientras se crea una nueva fila con Id fresco, StartDate=UtcNow, precios recalculados y detalles de promoción transferidos.",
      renewalAuditTitle: "Pista de Auditoría de Ingresos",
      renewalAuditIntro:
        "Cada ciclo de facturación produce su propia fila inmutable en la base de datos con precios fijados al momento de la renovación. Esto permite informes financieros precisos: tendencias de MRR, análisis de cancelaciones por período y seguimiento de reembolsos por ciclo.",
      promoExpiryTitle: "Seguimiento de Caducidad de Promociones (A1)",
      promoExpiryIntro:
        "Cuando se aplica una promoción con DurationDays > 0, el sistema calcula una marca temporal PromotionExpiresAt. En cada renovación, el manejador verifica si UtcNow > PromotionExpiresAt — si la promoción ha expirado, el descuento se elimina y NO se transfiere a la nueva fila de suscripción.",
      concurrencyTitle: "Concurrencia Optimista (E1)",
      concurrencyIntro:
        "Cada TenantSubscription tiene un ConcurrencyStamp (Guid) con [ConcurrencyCheck]. El sello se renueva en cada operación de escritura. Esto previene condiciones de carrera — por ejemplo, cancelación concurrente + trabajo de reconciliación — lanzando DbUpdateConcurrencyException en colisiones.",
      validationTitle: "Validación de Entrada (G1)",
      validationIntro:
        "Los 8 comandos de suscripción tienen validadores FluentValidation dedicados. Los validadores usan ILocalizer para mensajes de error localizados (EN + AR). Reglas de negocio: no renovar como prueba, montos de reembolso positivos, límites de longitud de texto.",
      crossModuleTitle: "Integración Entre Módulos (H1)",
      crossModuleIntro:
        "Los eventos del ciclo de vida de suscripción publican eventos de dominio consumidos por el módulo de Identidad. Al suspender una suscripción, todos los administradores del inquilino se desactivan con DeactivationReason='SubscriptionSuspended'. Al reanudar, solo se reactivan los administradores desactivados por suspensión.",
      crossModuleReasons:
        "Tres razones de desactivación: 'Manual' (nunca se reactiva automáticamente), 'SubscriptionSuspended' (se reactiva al reanudar), 'SubscriptionExpired' (se desactiva al expirar).",
      impactTitle: "Análisis de Impacto del Downgrade",
      impactIntro:
        "Antes de cambiar la edición de un inquilino, utilice el endpoint de Impacto del Downgrade para previsualizar qué recursos se desbordarían. La respuesta enumera cada función que excedería los límites de la nueva edición, junto con el uso actual frente al nuevo límite.",
      endpointsTitle: "Puntos de Conexión API (Endpoints)",
      endpointsIntro:
        "El controlador de Suscripciones proporciona 13 endpoints que cubren todo el ciclo de vida de la suscripción:",
      operationsTitle: "Operaciones de Suscripción",
      operationsIntro:
        "El módulo de suscripción admite un conjunto completo de operaciones de ciclo de vida. Cada operación hace que la suscripción pase a un nuevo estado con un seguimiento de auditoría completo.",
      assignTitle: "Asignar Suscripción",
      assignIntro:
        "Crear una nueva suscripción vinculando a un inquilino a una edición. Si el inquilino ya tiene una suscripción activa, la anterior se cancela automáticamente. Admite parámetros opcionales de moneda, código promocional y comportamiento de expiración.",
      upgradeTitle: "Mejora (Upgrade) y Descenso (Downgrade)",
      upgradeIntro:
        "Los inquilinos pueden moverse entre ediciones. Los Upgrades se aplican de inmediato y las funciones de la nueva edición entran en vigencia al instante. Los Downgrades verifican primero la OverflowPolicy para manejar los recursos que exceden los nuevos límites.",
      trialTitle: "Conversión de Prueba (Trial)",
      trialIntro:
        "Las suscripciones de prueba tienen una fecha de finalización (TrialEndDate). Cuando una prueba se actualiza a un plan de pago, IsTrialConverted se establece en true y la suscripción pasa al nuevo tipo. Si la prueba expira sin conversión, ExpiryBehavior determina qué sucede a continuación.",
      ep: {
        list: "Listar todas las suscripciones (paginado, filtrable por estado/tipo/inquilino)",
        get: "Obtener detalles de la suscripción por ID",
        assign: "Crear una nueva suscripción (asignar inquilino a edición con moneda/promo)",
        upgrade: "Mejorar a una edición superior (Upgrade)",
        downgrade: "Bajar a una edición inferior (Downgrade) (verifica OverflowPolicy)",
        impact: "Previsualizar el impacto del downgrade antes de ejecutarlo",
        suspend: "Suspender suscripción (bloquear el acceso del inquilino)",
        resume: "Reanudar una suscripción suspendida",
        cancel: "Cancelar suscripción permanentemente",
        renew: "Renovar una suscripción a punto de expirar",
        tenantActive: "Obtener la suscripción activa para un inquilino específico",
        export: "Exportar suscripciones como CSV, Excel o PDF con filtros avanzados",
      },
    },
    features: {
      title: "Funciones (Features)",
      description:
        "Capacidades de la plataforma controlables con tipos de valor Booleanos, Numéricos y de Cadena (String).",
      intro:
        "Las Funciones son los bloques de construcción básicos del sistema de Derechos. Cada función representa una capacidad controlable: un interruptor booleano, una cuota numérica o una configuración de cadena. Las funciones tienen una clave de sistema estable (Name) que nunca cambia, lo que las hace seguras para referenciarlas en el código.",
      entityTitle: "Entidad de Función",
      entityIntro:
        "Una Función define una capacidad controlable de la plataforma. El campo Name es una clave de sistema estable utilizada en el código; DisplayNameEn/DisplayNameAr son etiquetas orientadas al usuario.",
      valueTypesTitle: "Tipos de Valor",
      valueTypesIntro:
        "Los valores de las funciones se almacenan como cadenas (strings) pero se interpretan según su ValueType. El sistema valida los valores frente al tipo esperado en el momento de la creación y actualización.",
      valueTypesTip:
        "Para funciones Numéricas, use -1 para representar 'ilimitado'. FeatureCheckBehavior reconoce -1 como un valor especial y nunca bloquea las solicitudes de funciones con una cuota ilimitada.",
      systemVsCustomTitle: "Funciones del Sistema vs Personalizadas",
      systemVsCustomIntro:
        "SCRIPE distingue entre funciones del sistema (creadas al inicio, de solo lectura) y funciones personalizadas (creadas por los administradores a través de la API):",
      cacheTitle: "Caché de Funciones",
      cacheIntro:
        "Los valores de las funciones resueltas se almacenan en caché en IFeatureCache para evitar consultas a la base de datos en cada solicitud. La caché se invalida cada vez que cambian las funciones de una edición, se modifica una suscripción o se establece/elimina una sobreescritura. En implementaciones de microservicios sin el módulo de Derechos, un NoOpFeatureCache trata todas las funciones como habilitadas.",
      requireFeatureTitle: "Interfaz IRequireFeature",
      requireFeatureIntro:
        "Para restringir un comando o consulta CQRS detrás de una función, implemente la interfaz de marcado IRequireFeature. El comportamiento de la pipeline FeatureCheckBehavior resuelve automáticamente el valor actual del inquilino y rechaza la solicitud si la función está deshabilitada.",
      requireFeatureNote:
        "IRequireFeature funciona tanto para funciones Booleanas (comprobadas como habilitadas/deshabilitadas) como para funciones Numéricas (comprobadas como cuota restante). El comportamiento determina automáticamente el tipo de comprobación a partir del Feature.ValueType.",
      contextAwareTitle: "Visualización Contextual de Funciones",
      contextAwareIntro:
        "La página de lista de funciones es contextual. Los administradores del sistema ven el catálogo completo de funciones con operaciones CRUD. Los administradores de inquilinos y las sesiones de drill-down ven solo las funciones efectivas del inquilino (resueltas a partir de la edición + sobreescrituras) en modo de solo lectura. Todo el alcance se gestiona desde el backend mediante GET /features (catálogo) vs GET /features/effective (ámbito de inquilino).",
      endpointsTitle: "Puntos de Conexión API (Endpoints)",
      endpointsIntro:
        "El controlador de Funciones expone 5 endpoints CRUD. Las funciones del sistema no se pueden eliminar:",
      seedingTitle: "Sembrado de Funciones (Seeding)",
      seedingIntro:
        "Las funciones del sistema se siembran automáticamente al inicio de la aplicación mediante EntitlementsStartupSeeder. El sembrador verifica si cada función del sistema ya existe (por Nombre) y solo crea las que faltan: las funciones existentes nunca se sobrescriben.",
      quotaTitle: "Seguimiento de Cuotas (QuotaCounter)",
      quotaIntro:
        "Las funciones numéricas admiten la aplicación automática de cuotas a través de la entidad QuotaCounter. El FeatureCheckBehavior verifica el uso actual frente al límite resuelto para cada comando IRequireFeature que se dirija a una función numérica.",
      cacheNote:
        "La caché se invalida automáticamente cuando: (1) se modifican las funciones de una edición, (2) se asigna/cambia una suscripción, (3) se establece/elimina una sobreescritura. No se necesita limpieza manual de caché.",
      patternTitle: "Patrón IRequireFeature",
      patternIntro:
        "Para restringir cualquier comando CQRS detrás de una verificación de función, simplemente implemente la interfaz de marcado IRequireFeature. El FeatureCheckBehavior intercepta automáticamente la solicitud, resuelve el valor de la función del inquilino y la rechaza si está deshabilitada o supera la cuota.",
      ep: {
        list: "Listar todas las funciones (paginado, filtrable por categoría/tipo)",
        get: "Obtener detalles de la función por ID",
        create: "Crear una nueva función personalizada",
        update:
          "Actualizar metadatos de la función (funciones del sistema: solo DefaultValue/Description)",
        delete:
          "Eliminado lógico de una función personalizada (las funciones del sistema no se pueden eliminar)",
      },
    },
    overrides: {
      title: "Sobreescritura de Funciones (Overrides)",
      description:
        "Personalización del valor de la función por inquilino que omite los valores predeterminados de la edición.",
      intro:
        "Las Sobreescrituras de funciones permiten a los administradores de la plataforma personalizar los valores de las funciones para inquilinos individuales, independientemente de su edición suscrita. Las sobreescrituras tienen la máxima prioridad en la cadena de resolución, lo que las hace perfectas para acuerdos de ventas personalizados, promociones especiales o excepciones puntuales.",
      entityTitle: "Entidad de Sobreescritura (Override)",
      entityIntro:
        "Un TenantFeatureOverride establece un valor personalizado para una función específica en un inquilino específico. Incluye un campo opcional 'Reason' (Motivo) para fines de auditoría.",
      priorityTitle: "Prioridad de Resolución",
      priorityIntro:
        "Las sobreescrituras se sitúan en la parte superior de la cadena de resolución. Cuando el sistema resuelve un valor de función para un inquilino, primero busca una sobreescritura:",
      whenTitle: "Cuándo Usar Sobreescrituras",
      whenIntro:
        "Las sobreescrituras están diseñadas para casos excepcionales en los que un inquilino necesita un valor diferente al que proporciona su edición:",
      useCase1:
        "Acuerdos empresariales personalizados — 'Dar a Acme Corp 500 administradores en lugar de los 50 estándar'",
      useCase2:
        "Ofertas promocionales — 'Habilitar el Chat Premium para este inquilino durante 30 días'",
      useCase3:
        "Pruebas Beta — 'Habilitar el nuevo módulo de Facturación para los primeros usuarios'",
      useCase4:
        "Aumento temporal — 'Aumentar el límite de carga de archivos durante su migración'",
      overuseWarning:
        "Las sobreescrituras deben usarse con moderación. Si muchos inquilinos necesitan la misma sobreescritura, considere crear una nueva edición. El exceso de sobreescrituras hace que el sistema sea más difícil de gestionar y auditar.",
      resolvedTitle: "Endpoint de Funciones Resueltas",
      resolvedIntro:
        "El endpoint GET /api/v1/tenants/{tenantId}/features/resolved devuelve el valor final y efectivo de cada función para un inquilino determinado. Muestra la fuente de resolución (Sobreescritura, Edición o Predeterminado) para cada entrada, lo que facilita la depuración y auditoría.",
      endpointsTitle: "Puntos de Conexión API (Endpoints)",
      endpointsIntro:
        "El controlador TenantFeatures expone 4 endpoints para gestionar las sobreescrituras por inquilino y los valores resueltos:",
      scenariosTitle: "Escenarios de Casos de Uso",
      scenariosIntro:
        "Los siguientes escenarios del mundo real demuestran cuándo las sobreescrituras aportan más valor:",
      settingTitle: "Establecer una Sobreescritura",
      settingIntro:
        "Para establecer una sobreescritura, envíe una solicitud POST al endpoint de funciones del inquilino con el ID de la función, el valor personalizado y un motivo opcional para fines de auditoría.",
      settingTip:
        "Siempre incluya un motivo al establecer sobreescrituras: hace que los registros de auditoría tengan sentido y ayuda a los futuros administradores a comprender por qué se aplicó la sobreescritura.",
      expiryTitle: "Expiración de Sobreescrituras",
      expiryIntro:
        "Las sobreescrituras pueden tener una fecha opcional de expiración (ExpiresAt). Cuando pasa la fecha de expiración, la sobreescritura se desactiva automáticamente y la función vuelve al valor de la edición (o al predeterminado global).",
      expiryNote:
        "Las sobreescrituras expiradas se desactivan de forma lógica (IsActive = false), no se eliminan. Esto conserva el registro de auditoría y permite reactivarlas si es necesario.",
      auditTitle: "Registro de Auditoría (Audit Trail)",
      auditIntro:
        "Cada operación de sobreescritura se rastrea con información de auditoría completa. El campo Reason (Motivo) en cada sobreescritura proporciona el contexto de por qué se aplicó el valor personalizado.",
      bestPracticesTitle: "Mejores Prácticas",
      bestPracticesIntro:
        "Siga estas pautas para mantener su sistema de sobreescrituras fácil de mantener y auditar.",
      bestPracticesWarning:
        "Las sobreescrituras deben usarse con moderación. Si muchos inquilinos necesitan la misma sobreescritura, considere crear una nueva edición en su lugar. El uso excesivo de sobreescrituras hace que el sistema sea más difícil de gestionar y crea una deuda de mantenimiento.",
      ep: {
        list: "Listar todas las sobreescrituras para un inquilino específico",
        set: "Establecer o actualizar una sobreescritura de función para un inquilino",
        remove: "Eliminar (desactivar) una sobreescritura de función",
        resolved:
          "Obtener todos los valores de funciones resueltas para un inquilino (muestra la fuente: Sobreescritura/Edición/Predeterminado)",
      },
    },

    // ── Plugins Module ───────────────────────────────────────
    plugins: {
      overview: {
        title: "Módulo de Cumplimiento",
        description:
          "Automatización del cumplimiento de RGPD, CCPA y PDPA: regulaciones, procesamiento de DSR, gestión de consentimiento, retención de datos, inventario y generación de informes.",
        intro:
          "El módulo de Cumplimiento es el motor integrado de cumplimiento normativo de SCRIPE. Ayuda a los operadores de la plataforma y a sus inquilinos a cumplir con las principales leyes de protección de datos (RGPD, CCPA, PDPA) mediante herramientas automatizadas para gestionar las solicitudes de los interesados, los registros de consentimiento, las políticas de retención y la generación de informes listos para auditorías.",
        infoTitle: "Aviso de Cumplimiento",
        infoContent:
          "El módulo de Cumplimiento es fundamental para mantener el cumplimiento normativo y evitar multas. Asegúrese de que todas las funciones estén mapeadas correctamente a las políticas de procesamiento de datos.",
        featureDsr: "Solicitudes de Derechos de los Interesados (DSR)",
        featureDsrDesc:
          "Gestiona las solicitudes de los interesados, incluyendo Exportación, Eliminación, Rectificación y Restricción con seguimiento de ciclo de vida completo y monitoreo de SLA.",
        featureConsent: "Gestión de Consentimiento",
        featureConsentDesc:
          "Seguimiento inmutable de los estados de consentimiento, capturas y pistas de auditoría para el cumplimiento del Artículo 6 del RGPD y CCPA.",
        featureRetention: "Políticas de Retención",
        featureRetentionDesc:
          "Aplica políticas de destrucción de datos basadas en períodos de retención configurables con acciones automatizadas de Eliminación o Anonimización.",
        featureInventory: "Inventario de Datos",
        featureInventoryDesc:
          "Mapea ubicaciones sensibles de PII en todos los módulos, necesario para el Registro de Actividades de Tratamiento (RoPA) del Artículo 30 del RGPD.",
        featureReports: "Informes de Cumplimiento",
        featureReportsDesc:
          "Genera informes asincrónicos listos para auditorías (Resumen RGPD, Resumen DSR, Auditoría de Consentimiento, Análisis de Retención, Exportación de Inventario).",
        featureWebhooks: "Eventos de Webhook",
        featureWebhooksDesc:
          "11 eventos de webhook en tiempo real que cubren el ciclo de vida de DSR, cambios de consentimiento, aplicación de retención y generación de informes.",
        descDsr:
          "Gestiona las solicitudes de los interesados (Exportación, Eliminación, Rectificación)",
        descConsent: "Seguimiento inmutable de estados de consentimiento y capturas",
        descRet: "Aplica políticas de destrucción de datos según la antigüedad",
        descInv: "Mapea ubicaciones sensibles de PII en todos los módulos",
        descRep: "Genera informes de cumplimiento RoPA y DPIA",
        descId: "Módulo de Identidad",
        descIdDesc: "Proporciona contexto de Usuario/Administrador y Autenticación",
        descEnt: "Módulo de Autorizaciones",
        descEntDesc: "Controla las capacidades de cumplimiento a través de puertas de funciones",
        conn1: "inicia solicitudes",
        conn2: "otorga/revoca",
        conn3: "controla políticas",
        conn4: "guía la eliminación",
        conn5: "apunta a los datos",
        conn6: "pistas de auditoría",
        conn7: "pistas de auditoría",
        th1: "Componente",
        th2: "Responsabilidad",
        tr1_1: "DsrListViewModel",
        tr1_2:
          "Gestiona la paginación, filtrado y asignación de solicitudes entrantes de derechos de interesados.",
        tr2_1: "ConsentRecordView",
        tr2_2:
          "Muestra la captura de consentimiento inmutable junto con el agente de usuario y los metadatos de marca de tiempo.",
        whatIsTitle: "¿Qué es el Módulo de Cumplimiento?",
        whatIsIntro:
          "El módulo de Cumplimiento proporciona seis sub-sistemas interconectados que cubren el ciclo de vida completo de cumplimiento. En lugar de crear herramientas de cumplimiento desde cero, los inquilinos de SCRIPE obtienen un sistema listo para producción que rastrea, automatiza e informa sobre sus obligaciones de protección de datos.",
        subModulesTitle: "Seis Sub-Sistemas",
        subModulesIntro: "Cada sub-sistema maneja un dominio de cumplimiento específico:",
        sub1: "Perfiles Regulatorios: Almacena los marcos regulatorios (RGPD, CCPA, PDPA) bajo los cuales opera la plataforma.",
        sub2: "Solicitudes de Derechos de los Interesados (DSR): Gestiona las solicitudes de derechos de los interesados (exportación, eliminación, rectificación, restricción).",
        sub3: "Gestión de Consentimiento: Registra, rastrea y audita las concesiones y retiros de consentimiento de los usuarios.",
        sub4: "Políticas de Retención de Datos: Define cuánto tiempo se conservan los datos y qué sucede cuando expiran (eliminar o anonimizar).",
        sub5: "Inventario de Datos: Un registro de todas las categorías de datos personales que procesa la plataforma.",
        sub6: "Informes de Cumplimiento: Genera informes asincrónicos listos para auditorías (Resumen RGPD, Resumen DSR, Auditoría de Consentimiento, etc.).",
        regulationsTitle: "Regulaciones Soportadas",
        regulationsIntro:
          "El módulo de Cumplimiento de SCRIPE soporta la aplicación de estas principales regulaciones de protección de datos. Cada regulación viene preconfigurada con sus plazos de SLA y estructuras de sanciones.",
        regName: "Regulación",
        regRegion: "Región / Jurisdicción",
        regSla: "SLA de Respuesta",
        regPenalty: "Sanción Máxima",
        regGdprRegion: "Unión Europea (UE/EEE)",
        regCcpaRegion: "California, EE. UU.",
        regLgpdRegion: "Brasil",
        regPopiaRegion: "Sudáfrica",
        regPdpaRegion: "Singapur",
        backendTitle: "Arquitectura del Backend",
        backendIntro:
          "El backend de cumplimiento sigue el diseño estándar de módulo de 3 proyectos de SCRIPE (Domain / Application / Infrastructure) con un ComplianceDbContext y ComplianceController dedicados.",
        cqrsTitle: "Comandos y Consultas CQRS",
        cqrsIntro:
          "El módulo de Cumplimiento utiliza el patrón mediador CQRS estándar de SCRIPE. Los comandos manejan operaciones de escritura y las consultas manejan operaciones de lectura, cada uno con validadores dedicados de FluentValidation.",
        cqrsType: "Tipo",
        cqrsExample: "Controlador",
        cqrsDesc: "Descripción",
        cqrsSubmit:
          "Envía una nueva solicitud de derechos del interesado con validación y cálculo de SLA",
        cqrsReview: "Revisa y actualiza el estado de una DSR (aprobar, rechazar, completar)",
        cqrsConsent:
          "Registra una concesión de consentimiento con metadatos completos de auditoría (IP, agente de usuario, versión)",
        cqrsRetention:
          "Actualiza la configuración de la política de retención (días, acción, estado activo)",
        cqrsDsrList: "Lista todas las DSR con paginación, filtrado por estado/tipo/regulación",
        cqrsConsentAnalytics:
          "Agrega estadísticas de consentimiento por propósito, estado y período de tiempo",
        cqrsDashboard:
          "Devuelve un panel de resumen con recuentos de todos los sub-sistemas de cumplimiento",
        frontendTitle: "Arquitectura del Frontend",
        frontendIntro:
          "El frontend está organizado como seis sub-módulos independientes bajo src/modules/compliance/, cada uno con sus propias capas de dominio, datos y presentación siguiendo el patrón View/ViewModel.",
        endpointsTitle: "Resumen de Endpoints de API",
        endpointsIntro:
          "Todos los endpoints están bajo /api/v1/compliances/ y requieren autenticación con el permiso compliance.view.",
        apiRegList: "Lista todos los perfiles regulatorios configurados para la plataforma",
        apiDsrSubmit:
          "Envía una nueva solicitud de derechos del interesado (Exportación, Eliminación, Rectificación, Restricción)",
        apiDsrList: "Lista todas las DSR con paginación, filtrado por estado/tipo/regulación",
        apiDsrReview:
          "Revisa una DSR: aprueba, rechaza o marca como completada con notas de resolución",
        apiConsentRecord:
          "Registra una nueva concesión de consentimiento con metadatos completos de auditoría",
        apiConsentAnalytics:
          "Recupera análisis de consentimiento (tasas de otorgamiento/retiro por propósito)",
        apiRetentionList: "Lista todas las políticas de retención con el estado de cumplimiento",
        apiRetentionUpdate: "Actualiza una política de retención (días, acción, estado activo)",
        apiInventoryList:
          "Lista todos los elementos del inventario de datos (RGPD Artículo 30 RoPA)",
        apiReportsList: "Lista todos los informes de cumplimiento con filtros de estado y tipo",
        apiReportDownload: "Descarga un informe generado en formato CSV, JSON, XLSX o PDF",
        apiReportGenerate:
          "Encola un nuevo trabajo de generación de informes de cumplimiento asincrónicos",
        apiDashboard:
          "Recupera el resumen del panel de cumplimiento (recuentos, estado de SLA, alertas)",
        webhooksTitle: "Eventos de Webhook",
        webhooksIntro:
          "El módulo de Cumplimiento activa 11 eventos de webhook en tiempo real a los que se pueden suscribir sistemas externos. Los eventos se registran automáticamente a través de ComplianceWebhookEventCatalog y se distribuyen a través de la tubería IWebhookDispatcher.",
        webhookEvent: "Clave de Evento",
        webhookCategory: "Categoría",
        webhookDesc: "Descripción",
        whDsrSubmitted: "Se activa cuando se envía una nueva solicitud de derechos del interesado",
        whDsrStatusChanged:
          "Se activa cuando cambia el estado de una DSR (Pendiente → En progreso → Completado/Rechazado)",
        whDsrCompleted:
          "Se activa cuando una DSR se completa por completo (datos exportados, eliminados o rectificados)",
        whDsrErasure:
          "Se activa cuando un administrador confirma una solicitud de eliminación DSR (acción nuclear)",
        whDsrCancelled: "Se activa cuando se cancela una DSR antes de completarse",
        whConsentGranted:
          "Se activa cuando un usuario otorga el consentimiento para un propósito específico",
        whConsentWithdrawn:
          "Se activa cuando un usuario retira el consentimiento previamente otorgado",
        whRetentionUpdated:
          "Se activa cuando se actualiza la configuración de una política de retención",
        whRetentionExec:
          "Se activa cuando se completa la ejecución de un trabajo de aplicación de retención",
        whReportGenerated:
          "Se activa cuando la generación de un informe de cumplimiento se completa con éxito",
        whReportFailed: "Se activa cuando falla la generación de un informe de cumplimiento",
        quickStartTitle: "Guía de Inicio Rápido",
        step1Title: "Sembrar Datos de Cumplimiento",
        step1Content:
          "Ejecute el sembrador de desarrollo para rellenar perfiles regulatorios, propósitos de consentimiento de muestra y políticas de retención para su entorno de prueba.",
        step2Title: "Configurar Perfiles Regulatorios",
        step2Content:
          "Vaya a Cumplimiento → Regulaciones en el panel de administración. Habilite las regulaciones bajo las cuales opera su plataforma (RGPD, CCPA, PDPA). Cada regulación define los plazos de SLA y las estructuras de sanciones que se aplicarán.",
        step3Title: "Enviar un DSR de Prueba",
        step3Content:
          "Cree una solicitud de derechos del interesado para probar el ciclo de vida completo. El sistema validará la solicitud, calculará el plazo de SLA y la pondrá a disposición para su asignación a un oficial de cumplimiento.",
        step4Title: "Registrar Consentimiento y Configurar Retención",
        step4Content:
          "Configure los propósitos del consentimiento (Marketing, Análisis, Terceros) y configure las políticas de retención para cada categoría de datos. El trabajo de aplicación de retención aplicará automáticamente las acciones configuradas cuando los datos superen el período de retención.",
        step5Title: "Generar un Informe de Cumplimiento",
        step5Content:
          "Encole un informe de cumplimiento asincrónico. El informe se generará en segundo paso y aparecerá en la lista de informes una vez que esté listo. Descárguelo en formato CSV, JSON, XLSX o PDF.",
        securityTitle: "Consideraciones de Seguridad",
        securityIntro:
          "Los datos de cumplimiento se encuentran entre los más sensibles de la plataforma. Todos los endpoints están protegidos por autenticación JWT, autorización basada en roles y tránsito cifrado de ID. Los datos personales en DSR y registros de consentimiento están sujetos a restricciones de seguridad a nivel de campo.",
        securityWarningTitle: "Advertencia de Protección de Datos",
        securityWarningContent:
          "Los datos de cumplimiento contienen información de identificación personal (PII). Asegúrese de configurar los controles de acceso adecuados, el registro de auditoría y el cifrado de datos. Nunca exponga endpoints de cumplimiento sin procesar sin autenticación.",
        secDoTitle: "Prácticas Recomendadas",
        secDo1: "Habilite la seguridad a nivel de campo para los campos PII en las respuestas DSR",
        secDo2:
          "Configure secretos de webhook para todas las suscripciones a eventos de cumplimiento",
        secDo3:
          "Establezca políticas de retención para los mismos datos de cumplimiento (meta-cumplimiento)",
        secDo4:
          "Revise los registros de auditoría regularmente para detectar intentos de acceso no autorizados",
        secDontTitle: "Antipatrones a Evitar",
        secDont1:
          "Nunca exponga los endpoints de DSR sin autenticación de solo administrador (AdminOnly)",
        secDont2:
          "Nunca omita el seguimiento de la versión del consentimiento: invalida la pista de auditoría",
        secDont3:
          "Nunca elimine permanentemente los registros de cumplimiento; use siempre la eliminación lógica (soft-delete)",
        secDont4: "Nunca omita el despachador de webhooks para los eventos de cumplimiento",
      },

      dsr: {
        title: "Derechos de los interesados (DSR)",
        description: "Descripción",
        intro:
          "Las solicitudes de derechos de los interesados (DSR) son solicitudes formales de personas que ejercen sus derechos en virtud de las leyes de protección de datos. El módulo de cumplimiento proporciona un flujo de trabajo DSR estructurado y completo: envío, asignación, revisión, procesamiento y cierre, con un registro de auditoría completo de solo adición y seguimiento de SLA.",
        typesTitle: "Tipos de solicitudes",
        typesIntro:
          "El sistema admite cinco tipos de DSR definidos por las regulaciones GDPR y CCPA:",
        typesType: "Tipo de solicitud",
        typesDesc: "Descripción",
        typesGdpr: "Referencia GDPR",
        typesAccessDesc:
          "Derecho de acceso (Artículo 15). El interesado solicita la lista de fines de tratamiento, categorías de datos personales y destinatarios.",
        typesExportDesc:
          "Derecho a la portabilidad de datos (Artículo 20). El interesado solicita una copia legible por máquina de sus datos personales.",
        typesErasureDesc:
          "Derecho de supresión / Derecho al olvido (Artículo 17). El interesado solicita la eliminación permanente o anonimización de sus PII.",
        typesRectificationDesc:
          "Derecho de rectificación (Artículo 16). El interesado solicita la corrección de datos personales inexactos o incompletos.",
        typesRestrictionDesc:
          "Derecho a la limitación del tratamiento (Artículo 18). El interesado solicita la suspensión del tratamiento conservando el almacenamiento de los datos.",
        lifecycleTitle: "Ciclo de vida de las solicitudes",
        lifecycleIntro:
          "Las solicitudes DSR se modelan como transiciones de estado con un ciclo de revisión y puertas de confirmación de seguridad para evitar eliminaciones accidentales e irrecuperables:",
        lifecycleFlowTitle: "Ciclo de vida de solicitudes DSR y puertas de seguridad",
        nodeSubmit: "1. Enviar solicitud",
        descSubmit:
          "El interesado envía su solicitud mediante SubmitDsrCommand. El estado cambia a Pendiente y se calcula el plazo del SLA.",
        nodeReview: "2. Revisión del administrador",
        descReview:
          "El administrador revisa la solicitud mediante ReviewDsrCommand, cambiando el estado a Aprobado o Rechazado.",
        nodeConfirm: "3. Confirmar eliminación",
        descConfirm:
          "Las solicitudes de eliminación requieren confirmación manual mediante ConfirmErasureCommand, estableciendo ErasureConfirmed = true.",
        nodeProcessing: "4. Tarea de ejecución DSR",
        descProcessing:
          "La tarea DsrExecutionJob, ejecutada cada 5 minutos, procesa las solicitudes confirmadas/aprobadas en lotes de 50.",
        nodeCompleted: "5. Estado: Completado",
        descCompleted:
          "Ejecutado correctamente en todos los módulos, registrando la marca de tiempo de finalización.",
        nodeRejected: "Estado: Rechazado",
        descRejected:
          "La solicitud es rechazada por el administrador durante la revisión. Se guardan las notas de resolución.",
        nodeCancelled: "Estado: Cancelado",
        descCancelled:
          "Las solicitudes pendientes, en revisión o aprobadas pueden cancelarse manualmente en cualquier momento.",
        nodePartial: "6. Parcialmente completado",
        descPartial:
          "Si algún módulo falla, el DSR pasa a Parcialmente completado e incrementa el contador RetryCount (máx 3).",
        connSubmitReview: "Asigna y pasa a En revisión",
        connReviewApprove: "Aprueba la solicitud",
        connReviewReject: "Rechaza la solicitud",
        connApproveConfirm: "Requerido para eliminación",
        connConfirmExec: "Toma para procesamiento",
        connExecComplete: "Todos los módulos tienen éxito",
        connExecPartial: "Cualquier módulo falla",
        connPartialRetry: "Reintenta los módulos fallidos",
        connCancel: "Cancela la solicitud",
        executionFlowTitle: "Flujo de ejecución de la anonimización DSR",
        nodeExecJob: "Activación de DsrExecutionJob",
        descExecJob:
          "Se ejecuta cada 5 minutos y recupera las solicitudes de eliminación aprobadas listas para su ejecución.",
        nodeCheckSafety: "Puerta de control de seguridad",
        descCheckSafety:
          "Verifica que ErasureConfirmed = true y que el período de gracia ErasureExecuteAfter haya pasado.",
        nodeGenToken: "Generar token de anonimización",
        descGenToken:
          "Genera un token de anonimización SHA-256 seguro basado en el ID del interesado.",
        nodeFanOut: "Distribución a módulos",
        descFanOut:
          "Itera a través de todos los proveedores de cumplimiento registrados que implementan IUserDataAnonymizer.",
        nodeModuleExec: "Ejecución sin asignación de memoria",
        descModuleExec:
          "Ejecuta actualizaciones de base de datos a través de ExecuteUpdateAsync de EF Core para borrar los campos PII.",
        nodeEvalStatus: "Evaluar resultados",
        descEvalStatus:
          "Verifica los registros de ejecución del módulo para confirmar que se completaron con éxito.",
        nodeComplete: "Establecer estado: Completado",
        descComplete:
          "El ticket DSR se marca como Completado y se guarda la marca de tiempo CompletedAt.",
        nodePartialLimit: "Establecer estado: Parcialmente completado",
        descPartialLimit:
          "Registra el error, incrementa RetryCount y pone en cola los módulos fallidos para reintento (máx 3).",
        connJobCheck: "recupera el lote",
        connCheckGen: "si se superan las puertas de seguridad",
        connGenFan: "genera el token",
        connFanMod: "invoca a los anonimizadores",
        connModEval: "recopila los estados",
        connEvalComplete: "si todos tienen éxito",
        connEvalPartial: "si alguno falla",
        slaTitle: "Seguimiento de SLA y cálculo de plazos",
        slaIntro:
          "Las regulaciones de cumplimiento imponen plazos de respuesta estrictos. SCRIPE calcula y realiza el seguimiento automático de las métricas de SLA en el panel de administración:",
        slaWarningTitle: "Lógica de plazo de SLA",
        slaWarningContent:
          "Los plazos se calculan al enviar la solicitud leyendo el perfil de regulación activo (GDPR: 30 días, CCPA: 45 días). El progreso del SLA se calcula dinámicamente como un porcentaje: (Hora actual - CreatedAt) / (Plazo - CreatedAt) * 100.",
        escalationTitle: "Motor de escalada y alertas",
        escalationIntro:
          "La tarea DsrEscalationJob se ejecuta diariamente a las 08:00 UTC para evaluar el consumo del SLA y escalar los tickets atrasados:",
        escalationTier1:
          "Nivel 1 (50% del SLA) — Alerta de recordatorio estándar enviada al administrador asignado. Registra la nota de historial: [SLA-ESCALATION-50%].",
        escalationTier2:
          "Nivel 2 (75% del SLA) — Escalada de advertencia. Registra la nota de historial: [SLA-ESCALATION-75%] y envía el webhook compliance.dsr_sla_escalated.",
        escalationTier3:
          "Nivel 3 (90% del SLA) — Escalada crítica. Registra la nota de historial: [SLA-ESCALATION-90%], alerta a los administradores del sistema y envía el webhook crítico.",
        providerTitle: "Arquitectura de proveedores extensible",
        providerIntro:
          "Para mantener un acoplamiento débil, el módulo de cumplimiento se comunica con otros módulos utilizando las abstracciones IUserDataProvider y IUserDataAnonymizer:",
        providerIdentityTitle: "Integración del módulo de identidad",
        providerIdentityContent:
          "IdentityUserDataProvider exporta metadatos de perfil, sesiones de inicio de sesión activas y cuentas externas vinculadas. IdentityUserDataAnonymizer utiliza actualizaciones de base de datos de alto rendimiento y sin asignación de memoria para reemplazar nombres con el token de anonimización, formatear correos electrónicos como {token}@anonymized.invalid, establecer números de teléfono en null y marcar las IP de sesión activas como 'ANONYMIZED'.",
        providerComplianceTitle: "Integración del módulo de cumplimiento",
        providerComplianceContent:
          "ComplianceUserDataProvider exporta registros de solicitudes y entradas del registro de consentimiento. ComplianceUserDataAnonymizer borra la información personal de las DSR anteriores (SubjectEmail y RequesterNotes) y de los registros de consentimiento (IpAddress y UserAgent).",
        entitiesTitle: "Referencia de entidades",
        entityName: "Nombre de la entidad",
        entityDesc: "Descripción",
        entityDsrDesc:
          "Representa una solicitud de interesado que contiene el tipo, estado, plazo del SLA y parámetros de ejecución.",
        entityModuleDesc:
          "Realiza el seguimiento del estado de ejecución y los intentos de reintento de la ejecución de DSR fanned-out para cada proveedor de módulo.",
        entityStatusDesc:
          "Registro de solo adición que realiza el seguimiento de las transiciones de estado de DSR, comentarios de resolución y escaladas de SLA.",
        codeTitle: "Implementación del código",
        endpointsTitle: "Puntos de acceso API",
        endpointsIntro:
          "El controlador DSR expone los siguientes puntos de acceso para el envío, revisión y control de la ejecución de solicitudes:",
        ep: {
          list: "Listar todas las DSR (paginado, filtrable por estado/tipo/regulación)",
          get: "Obtener detalles de una DSR por ID",
          create: "Enviar una nueva DSR (calcula el plazo del SLA)",
          updateStatus: "Actualizar el estado de una DSR (En progreso, Completado, Rechazado)",
          assign: "Asignar la DSR a un agente de cumplimiento",
          delete: "Eliminar temporalmente (soft-delete) una DSR",
          confirm:
            "Confirmar explícitamente una DSR de eliminación aprobada para desbloquear la ejecución",
        },
        field: "Campo",
        type: "Tipo",
        fId: "Identificador único de la solicitud DSR.",
        fTenantId: "Clave externa que hace referencia al contexto del inquilino.",
        fSubjectEmail:
          "Dirección de correo electrónico del interesado (anonimizada tras la eliminación).",
        fRequestType: "Tipo de DSR (Acceso, Exportación, Eliminación, Rectificación, Limitación).",
        fStatus: "Estado actual del ciclo de vida de la solicitud.",
        fDeadline: "Plazo de respuesta SLA calculado.",
        fErasureConfirmed:
          "Bandera lógica que desbloquea las solicitudes de eliminación para las tareas en segundo plano.",
        fErasureExecuteAfter: "Umbral de ejecución que impone el período de gracia adaptativo.",
        fExportFileUrl: "URL para descargar el archivo zip de los datos exportados fanned-out.",
        fAssignedTo: "Clave externa que hace referencia al administrador asignado.",
        fRetryCount:
          "Número actual de intentos de reintento para las ejecuciones de módulos fallidas.",
        fCompletedAt: "Marca de tiempo que indica cuándo se completó la DSR.",
        quickStartTitle: "Guía de inicio rápido",
        step1Title: "Sembrar perfiles de cumplimiento",
        step1Content:
          "Ejecute el seeder de desarrollo para rellenar los perfiles de regulación GDPR y CCPA con los días de SLA.",
        step2Title: "Enviar una solicitud de interesado",
        step2Content:
          "Utilice el punto de acceso POST para registrar una nueva solicitud. El sistema valida las restricciones de entrada y calcula el plazo.",
        step3Title: "Revisar y aprobar",
        step3Content:
          "El agente de cumplimiento asignado revisa el ticket. Aprobar una DSR de eliminación establece el período de gracia y espera la confirmación final.",
        executionFlowIntro:
          "La ejecución de la solicitud de eliminación anonimiza los datos personales de forma asíncrona a través de los módulos mediante implementaciones de proveedores distribuidas:",
      },
      consent: {
        title: "Gestión del consentimiento",
        description: "Descripción",
        intro:
          "La gestión del consentimiento proporciona un registro inmutable de los estados de consentimiento del usuario. Para admitir búsquedas de alto rendimiento junto con un registro de auditoría legalmente defendible, SCRIPE utiliza una arquitectura de doble tabla dividida entre un registro de transacciones de solo adición y una vista materializada almacenada en caché.",
        purposesTitle: "Fines de consentimiento y configuración",
        purposesIntro:
          "El seguimiento del consentimiento está regulado por perfiles globales y fines de consentimiento estructurales sembrados al iniciar la aplicación:",
        purposesKey: "Clave del fin",
        purposesBasis: "Base legal",
        purposesRequired: "Obligatorio",
        purposesSort: "Orden de clasificación",
        purposesActive: "Activo",
        purposesEssentialDesc:
          "Capacidades esenciales requeridas para el funcionamiento de la plataforma. (Obligatorio, base legal contractual).",
        purposesMarketingDesc:
          "Boletines promocionales, correos electrónicos y comunicaciones de campaña. (Opcional, base legal de consentimiento).",
        purposesAnalyticsDesc:
          "Análisis de uso, seguimiento del comportamiento de los usuarios y telemetría de mejora del producto. (Opcional, base legal de consentimiento).",
        basisContract: "Contrato",
        basisConsent: "Consentimiento",
        basisLegitimate: "Interés legítimo",
        basisObligation: "Obligación legal",
        flowTitle: "Flujo de registro y verificación del consentimiento",
        nodeSubmit: "Envío de consentimiento",
        descSubmit:
          "El usuario actualiza sus preferencias o envía un formulario de consentimiento.",
        nodeValidate: "Control FluentValidation",
        descValidate: "Valida las restricciones regulatorias y la sintaxis de la clave del fin.",
        nodeLedger: "Agregar al registro",
        descLedger:
          "Escribe una transacción ConsentRecord inmutable que contiene la dirección IP, el agente de usuario, la versión y la acción.",
        nodeUpsert: "Actualizar instantánea",
        descUpsert:
          "Materializa el estado actual en la caché ConsentSnapshot para verificaciones de permisos de alto rendimiento.",
        nodeEvents: "Eventos de dominio",
        descEvents: "Publica ConsentGrantedEvent o ConsentWithdrawnEvent a través de MediatR.",
        nodeExpiry: "Tarea de expiración de consentimiento",
        descExpiry:
          "La tarea semanal en segundo plano analiza los desfases de versión y marca los registros obsoletos para el re-consentimiento.",
        connSubmitValidate: "envía los detalles a",
        connValidateLedger: "agrega la transacción si es válida",
        connLedgerUpsert: "actualiza el estado de la caché desde",
        connUpsertEvents: "distribuye los eventos en caso de éxito",
        connExpiryUpsert: "marca RequiresReConsent = true en",
        immutabilityTitle: "Arquitectura de base de datos de doble tabla",
        immutabilityIntro:
          "Para garantizar tanto el rendimiento de la base de datos como la integridad de la auditoría de cumplimiento, el seguimiento del consentimiento separa las transacciones de escritura intensa de las verificaciones de permisos de lectura intensa:",
        entitiesTitle: "Referencia de entidades",
        entitiesIntro:
          "Las siguientes tablas definen las propiedades del esquema tanto para el registro de solo adición como para las instantáneas de caché de estado actuales:",
        field: "Campo",
        type: "Type",
        fId: "Identificador único del registro.",
        fTenantId: "Clave externa que hace referencia al contexto del inquilino.",
        fSubjectId: "Clave externa que hace referencia al interesado (usuario).",
        fPurposeId: "Clave externa que hace referencia a la configuración de ConsentPurpose.",
        fAction: "Acción de consentimiento registrada (Concedido o Retirado).",
        fCurrentAction:
          "Último estado de consentimiento almacenado en caché para el sujeto y el fin.",
        fRequiresReConsent:
          "Bandera que indica que el usuario debe volver a consentir debido a una actualización de versión de la política.",
        fLastUpdatedAt: "Marca de tiempo que representa la última modificación de la instantánea.",
        fRecordedAt: "Marca de tiempo que representa cuándo ocurrió la transacción del registro.",
        fIpAddress: "Dirección IP del cliente capturada en el momento del registro.",
        fUserAgent: "Agente de usuario del navegador capturado en el momento del registro.",
        fRegulationBasis: "Contexto regulatorio (GDPR, CCPA) activo durante el envío.",
        fCollectionMethod:
          "Método utilizado para recopilar el consentimiento (Formulario web, App móvil, API).",
        fConsentVersion:
          "Versión del documento de política de consentimiento activa durante el envío.",
        bestPracticesTitle: "Mejores prácticas",
        doTitle: "Prácticas recomendadas",
        dontTitle: "Prácticas a evitar",
        do1: "Verificar que la clave del fin coincida con la restricción regex alfanumérica en minúsculas.",
        do2: "Ejecutar siempre la tarea semanal ConsentExpiryJob para imponer el re-consentimiento en las actualizaciones de versión.",
        do3: "Consumir los eventos MediatR ConsentWithdrawnEvents para restringir el procesamiento de datos posterior.",
        dont1:
          "No modificar directamente las filas de ConsentRecord para evitar romper el historial inmutable.",
        dont2:
          "No ejecutar consultas SQL directas en ConsentRecord para verificaciones de permisos del frontend; leer siempre ConsentSnapshot.",
        dont3:
          "No exponer puntos de acceso de registro de consentimiento brutos y no autenticados.",
        endpointsTitle: "Puntos de acceso API",
        ep: {
          list: "Listar todos los registros del registro (solo administradores, filtrable con paginación)",
          get: "Obtener detalles de un registro por ID",
          record:
            "Registrar una nueva concesión o retirada de consentimiento (usuario/administrador)",
          withdraw: "Retirar un consentimiento previamente concedido (usuario/administrador)",
          getMy:
            "Recuperar las instantáneas de consentimiento activas del usuario autenticado actual",
          analytics:
            "Obtener estadísticas de consentimiento por fin y estado (solo administradores)",
        },
        entitiesLedgerTitle: "ConsentRecord (Registro de solo adición)",
        entitiesSnapshotTitle: "ConsentSnapshot (Instantánea de caché materializada)",
        epWithdraw: "Retirar un consentimiento previamente concedido",
      },

      retention: {
        title: "Políticas de Retención de Datos",
        description:
          "Definir periodos de retención de datos y acciones automatizadas de expiración para el cumplimiento del Artículo 5(1)(e) del GDPR.",
        intro:
          "Las Políticas de Retención de Datos definen cuánto tiempo se deben conservar las categorías de datos. SCRIPE hace cumplir estas políticas automáticamente a través de trabajos en segundo plano.",
        policiesTitle: "Configuración de la Política",
        policiesIntro: "Cada política de retención especifica:",
        field1:
          "DataCategory — El tipo de datos (ej. 'Perfiles de Usuario', 'Registros de Consentimiento').",
        field2: "RetentionDays — Cuántos días deben conservarse los datos.",
        field3:
          "ExpiryAction — Qué ocurre cuando el periodo expira: Eliminar (Delete) o Anonimizar (Anonymize).",
        field4: "RegulationCode — Qué regulación exige esto (GDPR, CCPA, etc.).",
        actionsTitle: "Acciones de Expiración",
        actionsIntro: "Al expirar, SCRIPE aplica una de dos acciones:",
        action1: "Eliminar (Delete) — Elimina permanentemente todos los registros.",
        action2: "Anonimizar (Anonymize) — Reemplaza la PII con tokens seudónimos.",
        automationTitle: "Aplicación Automatizada",
        automationIntro:
          "La tarea RetentionEnforcementJob se ejecuta diariamente escaneando políticas y aplicando la acción. Se crea un registro de auditoría RetentionExecution.",
        nodePolicy: "Política de Retención",
        descPolicy: "Define el tipo de entidad, límite de edad y estrategia",
        nodeEnforcement: "Tarea de Aplicación de Retención",
        descEnforcement: "Tarea semanal para evaluar políticas",
        nodeExecution: "Ejecución de Retención",
        descExecution: "Pista de auditoría de la acción de destrucción",
        nodeAction: "Destrucción de Datos",
        descAction: "Eliminación forzada o Anonimización",
        conn1: "escaneado por",
        conn2: "desencadena",
        conn3: "registra",
        endpointsTitle: "Endpoints API",
        ep: {
          list: "Listar todas las políticas de retención",
          executions: "Listar historial de ejecuciones de retención",
          update: "Actualizar una política de retención",
        },
      },
      inventory: {
        title: "Inventario de Datos",
        description:
          "Un registro de todas las categorías de datos personales procesadas — requerido por el Artículo 30 del GDPR (RoPA).",
        intro:
          "El Inventario de Datos es un registro estructurado. Según el Artículo 30 del GDPR, los controladores deben mantener un Registro de Actividades de Procesamiento (RoPA).",
        fieldsTitle: "Campos del Inventario",
        fieldsIntro: "Cada elemento documenta:",
        field1: "DataCategory — Nombre legible de la categoría (ej. 'Direcciones de Email').",
        field2: "LegalBasis — La base legal del GDPR (Consentimiento, Contrato, etc.).",
        field3: "DataSubjects — A quién pertenecen los datos (ej. 'Usuarios finales').",
        field4: "ProcessingPurpose — Por qué se procesan los datos (ej. 'Marketing').",
        field5: "StorageLocation — Dónde se almacenan (país/región).",
        field6: "RetentionPeriod — Cuánto tiempo se conservan.",
        field7: "ThirdPartySharing — Si los datos se comparten con terceros.",
        ropaTitle: "Cumplimiento del Artículo 30",
        ropaIntro:
          "Organizaciones con más de 250 empleados deben mantener un RoPA. El inventario de SCRIPE sirve como un RoPA en vivo y exportable.",
        endpointsTitle: "Endpoints API",
        ep: {
          list: "Listar elementos del inventario (paginado, buscable)",
          get: "Obtener elemento por ID",
          create: "Agregar una nueva categoría de datos al inventario",
          update: "Actualizar un elemento del inventario existente",
          delete: "Eliminar un elemento del inventario",
        },
      },
      reports: {
        title: "Reportes de Cumplimiento",
        description:
          "Generar reportes asíncronos listos para auditorías (Resumen GDPR, DSR, Auditoría de Consentimiento, Retención, Inventario).",
        intro:
          "Los Reportes de Cumplimiento son documentos generados de forma asíncrona que proporcionan resúmenes para inspecciones regulatorias o auditorías internas.",
        reportTypesTitle: "Tipos de Reportes",
        reportTypesIntro: "Hay cinco tipos de reportes disponibles:",
        type1: "Resumen GDPR — Resumen de alto nivel del estado de cumplimiento de GDPR.",
        type2:
          "Resumen de Actividad DSR — Estadísticas sobre volumen, tipos y tasas de cumplimiento de DSR.",
        type3:
          "Auditoría de Consentimiento — Registro completo de consentimientos otorgados y retirados.",
        type4:
          "Análisis de Retención — Estado actual de cumplimiento de todas las políticas activas.",
        type5:
          "Exportación de Inventario de Datos — Exportación completa del inventario (RoPA Artículo 30).",
        asyncTitle: "Generación Asíncrona",
        asyncIntro:
          "Los reportes se generan de forma asíncrona para no bloquear las peticiones HTTP. Cuando solicita un reporte, el sistema crea un registro ComplianceReport (IsReady=false) y encola la generación.",
        asyncTip:
          "Use el botón de Actualizar para comprobar cuándo está listo (generalmente 30-60 segundos).",
        downloadTitle: "Descarga de Reportes",
        downloadIntro:
          "Una vez que un reporte está listo (IsReady=true), el DownloadUrl está disponible. Los reportes se retienen por 90 días.",
        endpointsTitle: "Endpoints API",
        ep: {
          list: "Listar todos los reportes de cumplimiento (paginado)",
          get: "Obtener detalles del reporte y URL de descarga por ID",
          generate: "Encolar la generación de un nuevo reporte",
          download: "Descargar el archivo del reporte generado",
        },
      },
    },
    hrms: {
      overview: {
        title: "Módulo HRMS",
        description:
          "Human Resource Management System que rige los perfiles del personal, empleo, calificaciones, certificaciones, disponibilidad y asignaciones.",
        intro:
          "El módulo HRMS es la fuente de verdad para los recursos laborales de la plataforma. Gestiona perfiles de miembros del personal, contratos de empleo, calificaciones, certificaciones profesionales, disponibilidades y asignaciones.",
        infoTitle: "Principio de Diseño",
        infoContent:
          "Los registros de HRMS apuntan a los actores de Identity mediante referencias de ID estables, no mediante claves foráneas en la base de datos.",
        whatIsTitle: "¿Qué es HRMS?",
        whatIsIntro: "Es el núcleo administrativo para administradores, entrenadores y personal.",
        featureStaff: "Perfiles de Personal",
        featureStaffDesc:
          "Detalles personales y profesionales, incluyendo contactos de emergencia y estado de empleo.",
        featureCompliance: "Calificaciones y Certificaciones",
        featureComplianceDesc:
          "Certificados bilingües, fechas de verificación y validación de cumplimiento para sesiones de entrenamiento.",
        modelTitle: "Modelo de Datos",
        modelIntro:
          "Rige entidades como StaffMember, EmploymentRecord, Qualification, Certification, StaffAvailability y StaffAssignment.",
        permsTitle: "Permisos",
        permsIntro:
          "El acceso se controla mediante permisos: hrms.staff.view, hrms.staff.create, hrms.staff.update y hrms.staff.delete.",
      },
    },
    partyKernel: {
      overview: {
        title: "Módulo Party Kernel",
        description:
          "El directorio comercial central que gestiona personas, organizaciones, puntos de contacto, relaciones y candidatos para fusión de datos.",
        intro:
          "El módulo Party Kernel es el registro principal para las entidades comerciales. Realiza el seguimiento de personas y organizaciones, sus detalles de contacto y relaciones.",
        infoTitle: "Principio de Diseño",
        infoContent:
          "Party Kernel utiliza un esquema neutral que representa a todos los actores comerciales (Clientes, Tutores, Personal) como Partes genéricas.",
        whatIsTitle: "¿Qué es Party Kernel?",
        whatIsIntro: "Forma la base de CRM y facturación.",
        featureParties: "Partes Genéricas",
        featurePartiesDesc: "Representación uniforme de personas físicas y entidades legales.",
        featureMerge: "Deduplicación de Datos",
        featureMergeDesc: "Identifica registros duplicados y facilita su fusión limpia.",
        modelTitle: "Modelo de Datos",
        modelIntro:
          "Rige entidades como Party, PartyPerson, PartyOrganization, PartyRole, PartyRelationship y ContactPoint.",
        permsTitle: "Permisos",
        permsIntro: "Protegido por party.view, party.create, party.update y party.delete.",
      },
    },
    organizationCore: {
      overview: {
        title: "Módulo Organization Core",
        description:
          "Define la jerarquía física y legal de los inquilinos, incluyendo unidades de negocio, sucursales, sitios y departamentos.",
        intro: "Organization Core modela el organigrama y la topología de las instalaciones.",
        infoTitle: "Principio de Diseño",
        infoContent:
          "La estructura organizativa es jerárquica, permitiendo relaciones padre-hijo para sucursales regionales y sitios.",
        whatIsTitle: "¿Qué es Organization Core?",
        whatIsIntro: "Estructura dónde y cómo se llevan a cabo los negocios.",
        featureStructure: "Jerarquía Organizativa",
        featureStructureDesc:
          "Anidamiento flexible de entidades legales, sucursales regionales, sitios y departamentos.",
        featureNodes: "Referencias Estables",
        featureNodesDesc:
          "Los IDs de organización estables son referenciados por los módulos de programación, reservas y academia.",
        modelTitle: "Modelo de Datos",
        modelIntro: "Rige entidades como BusinessUnit, Branch, Site y Department.",
        permsTitle: "Permisos",
        permsIntro:
          "Administrado mediante organization.view, organization.create, organization.update y organization.delete.",
      },
    },
    customFields: {
      overview: {
        title: "Módulo de Campos Personalizados",
        description:
          "Definiciones de campos personalizados configurables por inquilino, adjuntas a cualquier tipo de entidad registrado mediante una clave estable — sin cambios de esquema, sin acoplamiento entre módulos.",
        intro:
          "El módulo de Campos Personalizados permite que cada inquilino amplíe los registros de la plataforma con sus propios campos tipados — por ejemplo, una «talla de camiseta» en una persona o un «pie preferido» en un jugador — sin ninguna migración de base de datos ni cambio de código. Las definiciones de campo están delimitadas por inquilino y se adjuntan a una entidad anfitriona a través del Registro de Tipos de Entidad, compartido entre módulos, en lugar de una clave foránea, de modo que el módulo nunca se acopla al esquema de otro módulo.",
        infoTitle: "Principio de Diseño",
        infoContent:
          'Los campos personalizados se adjuntan mediante una clave de tipo de entidad estable (p. ej., "party.person"), validada contra el Registro de Tipos de Entidad, no mediante una clave foránea de base de datos. Esto mantiene el módulo completamente desacoplado y seguro para evolucionar de forma independiente.',
        whatIsTitle: "¿Qué son los Campos Personalizados?",
        whatIsIntro:
          "Un campo personalizado es una extensión definida por el inquilino sobre una entidad existente. Cada definición lleva una clave de máquina (única por inquilino y tipo de entidad), etiquetas bilingües, un tipo de valor, un indicador opcional de obligatoriedad, una lista opcional de opciones permitidas para campos de selección y un orden de clasificación. Los valores se almacenan tipados en lugar de en un bloque JSON sin tipo.",
        featureTenant: "Delimitado por Inquilino",
        featureTenantDesc:
          "Cada definición pertenece a un inquilino y está aislada mediante el filtro de consulta global de inquilino. Se admiten definiciones a nivel de sistema (compartidas) para los operadores de la plataforma.",
        featureRegistry: "Vinculación Validada por Registro",
        featureRegistryDesc:
          "Los campos se adjuntan a una entidad anfitriona mediante su clave de tipo de entidad canónica, validada contra el Registro de Tipos de Entidad compartido entre módulos — nunca mediante una clave foránea.",
        featureTyped: "Valores Tipados",
        featureTypedDesc:
          "Cada campo declara uno de veintidós tipos de valor — desde texto plano y números hasta referencias, un archivo o imagen cargados, y texto enriquecido con formato — evitando un bloque de metadatos sin tipo y permitiendo una validación adecuada.",
        featureIsolation: "Claves Inmutables",
        featureIsolationDesc:
          "La clave de tipo de entidad y la clave de máquina son inmutables tras la creación, de modo que los valores ya almacenados permanecen direccionables; solo pueden editarse los metadatos de visualización y comportamiento.",
        valueTypesTitle: "Tipos de Valor",
        valueTypesIntro:
          "Se admiten veintidós tipos de valor de extremo a extremo — consulte la página «Tipos de Valor» de la documentación del operador para ver la lista completa. Los campos de Selección y Selección Múltiple llevan una lista de opciones permitidas separadas por saltos de línea; los demás tipos no deben llevar opciones. La API impone esto tanto en la creación como en la actualización.",
        modelTitle: "Modelo de Datos",
        modelIntro:
          "Un CustomField lleva: EntityTypeKey (registrado), Key (clave de máquina, única por inquilino + tipo de entidad), LabelEn / LabelAr, ValueType, IsRequired, Options (solo Selección), SortOrder e IsActive. La unicidad se aplica por (TenantId, EntityTypeKey, Key).",
        isolationTitle: "Aislamiento de Inquilino",
        isolationIntro:
          "Las lecturas se ejecutan bajo el filtro global de inquilino del módulo, de modo que un inquilino solo ve sus propias definiciones más las compartidas a nivel de sistema. La creación marca automáticamente el inquilino actual. La actualización y la eliminación imponen una comprobación de propiedad, de modo que un administrador de inquilino nunca pueda modificar o eliminar una definición compartida o de otro inquilino.",
        isolationWarnTitle: "Campos a Nivel de Sistema",
        isolationWarnContent:
          "Las definiciones sin inquilino se tratan como compartidas/globales y son visibles para todos los inquilinos. Solo los principales del sistema (sin contexto de inquilino) pueden modificarlas o eliminarlas; los administradores delimitados por inquilino son bloqueados por la comprobación de propiedad.",
        permsTitle: "Permisos",
        permsIntro:
          "El módulo posee el recurso custom-fields con las acciones CRUD estándar: custom-fields.view, custom-fields.create, custom-fields.update y custom-fields.delete.",
      },
    },
  },
};

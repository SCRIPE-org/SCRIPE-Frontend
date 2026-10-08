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
      useCase4: "Aumento temporal — 'Aumentar el límite de carga de archivos durante su migración'",
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
      mergingTitle: "Fusión de Permisos y Reglas Particulares",
      mergingIntro:
        "El motor de seguridad combina las directivas base con las excepciones de cada inquilino para obtener la matriz final.",
      permissionsSyncTitle: "Sincronización Inmediata de Permisos",
      permissionsSyncIntro:
        "Cualquier actualización de excepciones invalida la memoria caché y refresca las sesiones de usuario activas.",
    },
    compliance: {
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
        infoTitle: "Política de Ejecución de DSR",
        infoContent:
          "Cada solicitud de derechos del interesado se registra de forma inmutable con validación criptográfica, plazos de SLA y aprobación escalonada antes del borrado.",
        entitiesIntro:
          "El agregado central de DSR almacena metadatos, estado de tramitación, identificadores verificados y marcas temporales.",
        handlersTitle: "Gestores CQRS y Eventos de Dominio",
        handlersIntro:
          "Procesamiento basado en comandos y consultas CQRS que desencadena tareas de anonimización entre módulos.",
        epSubmit:
          "Presentar una nueva solicitud de derechos del interesado (Acceso, Rectificación, Supresión).",
        epList: "Listar solicitudes de interesados con indicadores de estado y seguimiento de SLA.",
        epGet:
          "Obtener ciclo de vida completo, registros de descubrimiento y artefactos del ticket.",
        epReview: "Pasar solicitud a revisión y registrar notas del responsable de cumplimiento.",
        epConfirm: "Ejecutar acciones automatizadas y confirmar la finalización del ticket.",
        epAssign: "Asignar un ticket DSR a un revisor de cumplimiento o DPO designado.",
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
        infoTitle: "Gobernanza del Consentimiento",
        infoContent:
          "Otorgamientos y revocaciones se registran en modo append-only con huella digital del dispositivo, finalidad y versión de directiva.",
        flowIntro:
          "Coordina la autorización expresa, actualizaciones de políticas y revocación en cascada en los subsistemas integrados.",
        epRecord: "Registrar evento explícito de consentimiento o rechazo con marca temporal e IP.",
        epGetMy: "Obtener las elecciones de consentimiento activas del usuario autenticado.",
        epList: "Listar transacciones de consentimiento del arrendatario con filtros de finalidad.",
        epAnalytics:
          "Consultar métricas agregadas de adopción de consentimiento y distribución de fines.",
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
        warningTitle: "Aviso: Operación Irreversible",
        warningContent:
          "La ejecución de reglas de custodia elimina o anonimiza datos definitivamente. Revise las políticas antes de activarlas en modo automático.",
        flowTitle: "Flujo de Evaluación de Custodia",
        flowIntro:
          "El motor automatizado inspecciona las tablas periódicamente cotejando la antigüedad con los límites fijados.",
        codeTitle: "Registro del Servicio de Retención",
        codeIntro:
          "Definición de evaluadores personalizados y programación periódica de tareas con Hangfire.",
        entitiesTitle: "Modelo de Datos de Retención",
        entitiesIntro:
          "Reglas configurables con entidades de destino, plazos en días y acción de descarte (anonimizar o purgar).",
        nodeTrigger: "Disparador Cron",
        descTrigger: "Trabajo programado en segundo plano que evalúa las políticas de retención.",
        nodeFetch: "Obtención de Políticas",
        descFetch:
          "Consulta las políticas de retención activas y los perfiles legales del arrendatario.",
        nodeLoop: "Iterador por Lotes",
        descLoop: "Itera sobre entidades expiradas en lotes transaccionales controlados.",
        nodeAnonymizers: "Motor de Anonimización",
        descAnonymizers:
          "Aplica enmascaramiento criptográfico o seudonimización a datos sensibles.",
        nodeDestruct: "Ejecutor de Destrucción",
        descDestruct:
          "Aplica eliminación física en cascada a los registros que superan la retención máxima.",
        nodeComplete: "Finalización del Ciclo",
        descComplete: "Cierra el estado de ejecución, actualiza métricas y libera bloqueos.",
        nodeAudit: "Registro de Auditoría",
        descAudit: "Agrega comprobante de ejecución inmutable al historial de cumplimiento.",
        connTriggerFetch: "Disparador a Obtención de Políticas",
        connFetchLoop: "Políticas a Iterador por Lotes",
        connLoopExec: "Lote a Ejecución",
        connExecAnon: "Ejecución a Anonimización",
        connAnonDestruct: "Anonimización a Destrucción",
        connDestructComplete: "Destrucción a Finalización",
        connCompleteAudit: "Finalización a Auditoría",
        actionType: "Tipo de Acción",
        actionDesc: "Descripción",
        actionUseCases: "Casos de Uso Principales",
        actionDeleteDesc:
          "Elimina de forma permanente y física los registros coincidentes y dependencias.",
        actionDeleteUses:
          "Supresión obligatoria por ley, archivos temporales de caché, sesiones caducadas.",
        actionSoftDesc:
          "Marca registros como inactivos y los excluye de consultas conservando historial.",
        actionSoftUses:
          "Entidades comerciales sujetas a retención legal o desactivación de cuentas.",
        actionAnonDesc: "Reemplaza datos personales por tokens conservando agregados estadísticos.",
        actionAnonUses:
          "Transacciones financieras, analítica, historial de compras, libros de facturación.",
        field: "Nombre del Campo",
        type: "Tipo de Datos",
        fTenantId:
          "Espacio de trabajo del arrendatario al que pertenece esta política de retención.",
        fRegulationProfileId:
          "Perfil regulatorio jurisdiccional que rige esta política de retención.",
        fName: "Nombre descriptivo de la política de retención.",
        fDescription: "Justificación operativa detallada y ámbito de la política de retención.",
        fCategory: "Categoría de datos regulada por este calendario de retención.",
        fRetentionDays: "Duración predeterminada del periodo de retención en días antes de actuar.",
        fMinRetentionDays: "Periodo mínimo de conservación legal antes de permitir la eliminación.",
        fMaxRetentionDays:
          "Plazo máximo admisible conforme al principio de limitación del plazo de conservación.",
        fExpiryAction:
          "Acción automática al vencer (Eliminación dura, baja lógica o anonimización).",
        fNextEvaluationAt: "Marca de tiempo programada para la próxima evaluación automática.",
        fIsActive: "Indica si la política de retención está activa y se ejecuta en segundo plano.",
        epList:
          "Listar todas las políticas y calendarios de retención configurados para el arrendatario.",
        epUpdate: "Actualizar plazos de retención, acciones de vencimiento o estado activo.",
        epExecutions: "Consultar registros históricos de ejecución de retención y volumen purgado.",
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
        infoTitle: "Registro de Actividades de Tratamiento (RAT)",
        infoContent:
          "Inventario centralizado de categorías de datos personales conforme al artículo 30 del RGPD.",
        flowTitle: "Flujo de Identificación y Mapeo",
        flowIntro:
          "Workflows automáticos y manuales para catalogar campos confidenciales, niveles de sensibilidad y transferencias internacionales.",
        sensitivityTitle: "Clasificación de Sensibilidad",
        sensitivityIntro:
          "Categorización en Público, Interno, Confidencial y Restringido para aplicar controles de cifrado proporcionales.",
        structureTitle: "Esquema del Diccionario de Datos",
        structureIntro:
          "Detalle técnico de campos, almacenes de destino, bases jurídicas de tratamiento y plazos de conservación.",
        entitiesTitle: "Entidades del Inventario",
        nodeSeed: "Semilla del Módulo",
        descSeed:
          "Esquemas de inventario base preconfigurados cargados en la instalación del módulo.",
        nodeDiscover: "Descubrimiento Automático",
        descDiscover:
          "Escanea catálogos y metadatos de bases de datos para detectar campos de datos personales.",
        nodeMatching: "Coincidencia de Patrones",
        descMatching:
          "Aplica clasificadores heurísticos y de expresiones regulares sobre patrones PII conocidos.",
        nodeClassify: "Clasificación",
        descClassify: "Etiqueta los campos identificados con niveles de sensibilidad y categorías.",
        nodeLegal: "Base Jurídica",
        descLegal:
          "Asigna fundamentos legales de tratamiento (Art. 6 RGPD: Consentimiento, Contrato, Obligación).",
        nodeLink: "Vinculación de Políticas",
        descLink:
          "Asocia los campos del inventario con calendarios de retención y destrucción aplicables.",
        nodeRopa: "Generación del RAT",
        descRopa:
          "Compila la documentación del Registro de Actividades de Tratamiento según el Artículo 30.",
        nodeExport: "Exportación y Auditoría",
        descExport: "Genera paquetes de auditoría inmutables e informes de cumplimiento.",
        connSeedDiscover: "Semilla a Descubrimiento",
        connDiscoverMatching: "Descubrimiento a Coincidencia",
        connMatchingClassify: "Coincidencia a Clasificación",
        connClassifyLegal: "Clasificación a Base Jurídica",
        connLegalLink: "Base a Vinculación de Retención",
        connLinkRopa: "Vinculación a Compilación RAT",
        connRopaExport: "RAT a Exportación de Auditoría",
        sensLevel: "Nivel de Sensibilidad",
        sensDesc: "Descripción",
        sensExamples: "Campos de Datos Típicos",
        sensPublicDesc: "Información empresarial accesible al público sin riesgos de privacidad.",
        sensPublicEx:
          "Nombre de la empresa, correo público, teléfono corporativo, dirección publicada.",
        sensInternalDesc:
          "Datos operativos accesibles a empleados autorizados sin riesgos elevados.",
        sensInternalEx:
          "ID de usuario interno, credencial de empleado, código de equipo, metadatos del sistema.",
        sensConfDesc:
          "Datos de carácter personal (PII) que requieren estrictos controles de acceso y base legal.",
        sensConfEx:
          "Correo electrónico personal, móvil, domicilio, identificadores de dispositivo, IP.",
        sensRestDesc: "Categorías especiales de datos sujetas a estrictas salvaguardas normativas.",
        sensRestEx:
          "Documentos de identidad nacional, contraseñas, datos financieros, firmas biométricas.",
        field: "Nombre del Campo",
        type: "Tipo de Datos",
        fTenantId: "Identificador único del arrendatario propietario del registro del inventario.",
        fModuleName: "Módulo o contexto delimitado de origen donde reside el campo.",
        fEntityName: "Entidad de dominio o tabla relacional que contiene los datos personales.",
        fFieldName: "Columna de base de datos o propiedad que almacena los datos.",
        fDescription: "Descripción funcional del propósito del campo y su necesidad operativa.",
        fNote: "Citas normativas, referencias legales o anotaciones del equipo de cumplimiento.",
        fDataCategory: "Clasificación principal (ej. Identidad, Financiera, Contacto, Telemetría).",
        fIsAnonymizedOnErasure:
          "Indica si el campo se anonimiza o sobrescribe al ejecutar una supresión DSR.",
        fIsIncludedInExport:
          "Indica si el campo se incluye en paquetes de portabilidad de datos del Artículo 15.",
        fLegalBasis: "Fundamento legal de tratamiento conforme al Artículo 6 del RGPD.",
        fIsActive: "Indica si la definición del inventario se audita y aplica activamente.",
        epList:
          "Obtener lista paginada de registros del inventario de datos personales con filtros.",
        epCreate: "Registrar una nueva definición de campo de datos personales en el inventario.",
        epUpdate: "Actualizar metadatos, sensibilidad o base legal de un elemento del inventario.",
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
        infoTitle: "Informes de Cumplimiento Certificados",
        infoContent:
          "Emisión de informes con validez forense que acreditan la atención de DSR, registros de consentimiento y depuración de datos.",
        generationTitle: "Proceso de Elaboración de Informes",
        generationIntro:
          "Compilación asíncrona de evidencias extraídas de todos los subsistemas en formatos estándar de auditoría.",
        formatsTitle: "Formatos de Exportación Disponibles",
        formatsContent:
          "Generación de informes en JSON, CSV, PDF y contenedores comprimidos con firma digital.",
        asyncFlowTitle: "Arquitectura de Exportación Desacoplada",
        codeTitle: "Comando de Generación de Informes",
        codeIntro:
          "Ejecución de órdenes de generación con filtrado temporal, perfiles normativos y selección de formato.",
        reportType: "Tipo de Informe",
        reportDesc: "Alcance y Descripción",
        reportAudience: "Destinatarios",
        gdprDesc:
          "Instantánea exhaustiva de cumplimiento que cubre consentimientos, DSR e inventario.",
        gdprAudience:
          "Delegados de Protección de Datos, autoridades de control, auditores externos.",
        dsrDesc:
          "Desglose estadístico de solicitudes de ejercicio de derechos recibidas y gestionadas.",
        dsrAudience: "Responsables de cumplimiento, asesores jurídicos, directores de operaciones.",
        consentAuditDesc:
          "Registro cronológico detallado de eventos de consentimiento, finalidades y revocaciones.",
        consentAudience:
          "Reguladores de privacidad, comités de auditoría interna, directores de seguridad.",
        retentionLogDesc:
          "Pista de auditoría del cumplimiento que detalla registros purgados y marcas temporales.",
        retentionAudience:
          "Administradores de sistemas, auditores de bases de datos, responsables del tratamiento.",
        inventoryDesc:
          "Registro de Actividades de Tratamiento (Artículo 30) de todos los datos catalogados.",
        inventoryAudience:
          "Autoridades supervisoras, directores de cumplimiento corporativo, analistas.",
        nodeQueue: "En Cola",
        nodeJob: "Ejecución del Trabajo",
        nodeReady: "Informe Generado",
        nodeDownload: "Descarga Segura",
        epGenerate: "Encolar trabajo asíncrono para generar informe de auditoría de cumplimiento.",
        epList: "Listar todos los informes de cumplimiento generados y exportaciones pendientes.",
        epGet: "Consultar metadatos, estado de ejecución y validez de descarga de un informe.",
        epDownload: "Descargar de forma segura y cifrada el archivo del informe de cumplimiento.",
      },
      regulationProfiles: {
        title: "Perfiles de Regulación",
        description:
          "Configure las regulaciones de protección de datos (RGPD, CCPA, LGPD, PDPA) de su plataforma: plazos DSR, retención predeterminada y versiones de consentimiento.",
        intro:
          "Los perfiles de regulación constituyen la base del módulo de cumplimiento de SCRIPE, gestionando plazos legales de respuesta DSR y políticas de retención.",
        whatIsTitle: "¿Qué son los Perfiles de Regulación?",
        whatIsIntro:
          "Cada perfil define los plazos legales, la vigencia de los consentimientos y las reglas de conservación documental aplicables.",
        entityTitle: "Entidad RegulationProfile",
        seededTitle: "Perfiles Preconfigurados",
        consentVersionTitle: "Versionado de Consentimientos",
        retentionJsonTitle: "Políticas de Retención en JSON",
        endpointsTitle: "Endpoints de Cumplimiento",
        bestPracticesTitle: "Mejores Prácticas de Regulación",
        entityIntro:
          "Cada perfil almacena las directrices requeridas para el cumplimiento de una normativa en DSR, consentimiento y retención.",
        seededIntro:
          "SCRIPE inicializa normativas internacionales al arrancar, ampliables desde la consola de cumplimiento.",
        consentVersionIntro:
          "CurrentConsentVersion gestiona la versión formal del texto legal; al incrementarse obliga a todos los usuarios a renovar su consentimiento.",
        consentVersionWarning:
          "Modificar CurrentConsentVersion invalida los consentimientos activos; requiere validación previa con asesoría jurídica.",
        retentionJsonIntro:
          "DefaultRetentionJson preconfigura plazos por defecto en días; el valor -1 define conservación indefinida.",
        retentionJsonNote:
          "DefaultRetentionJson sirve como plantilla inicial; la aplicación real se rige por las reglas de RetentionPolicy por inquilino.",
        endpointsIntro:
          "Puntos de conexión API para consultar y parametrizar los marcos normativos aplicados.",
        bestPracticesTip:
          "Actualice la versión de consentimiento ante reformas sustanciales para contar con un registro de auditoría legalmente sólido.",
        ep: {
          list: "Listar todos los perfiles normativos activos aplicables al arrendatario.",
          get: "Obtener detalles y plazos legales de un perfil normativo específico.",
          create: "Crear un perfil normativo personalizado para una jurisdicción.",
          update: "Actualizar umbrales y ajustes de alertas de un perfil normativo existente.",
          delete: "Eliminar o archivar un perfil normativo personalizado.",
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
        archTitle: "Arquitectura de Gestión de Personal",
        archIntro:
          "Diseñada para coordinar cuadrantes deportivos, licencias federativas y disponibilidades en múltiples sedes.",
        featureEmployment: "Historial de Contratación",
        featureEmploymentDesc:
          "Registro auditable de acuerdos laborales, períodos de prueba, revisiones salariales y vigencias contractuales.",
        featureQualifications: "Titulaciones y Licencias Técnicas",
        featureQualificationsDesc:
          "Inventario de certificaciones deportivas, acreditaciones de socorrismo y competencias validadas.",
        featureAvailability: "Motor de Disponibilidad Horaria",
        featureAvailabilityDesc:
          "Definición de turnos semanales, jornadas de descanso y calendarios de disponibilidad dinámica.",
        featureAssignments: "Cuadrante de Sesiones y Guardias",
        featureAssignmentsDesc:
          "Asignación en tiempo real de entrenadores y personal auxiliar a entrenamientos y partidos.",
        complianceFlowTitle: "Verificación y Acreditación de Técnicos",
        complianceFlowIntro:
          "Control preventivo que bloquea la asignación de técnicos con titulaciones o seguros caducados:",
        apiTitle: "API Principal de Recursos Humanos",
        apiIntro:
          "Controladores para tramitar altas de plantilla, auditar certificaciones y generar cuadrantes.",
      },
      staff: {
        title: "Directorio de personal y marcos de competencias",
        description:
          "Perfiles de empleados y entrenadores, matrices de habilidades, antecedentes y asignaciones organizacionales.",
        intro:
          "El directorio de personal mantiene perfiles de la fuerza laboral, certificaciones y vinculaciones de sedes operativas.",
        infoTitle: "Gestión de personal basada en roles",
        infoContent:
          "Los perfiles unificados vinculan cuentas de seguridad del sistema, contratos y etiquetas de capacidad operativa.",
        profileTitle: "Perfil de personal y matriz de competencias",
        profileDesc:
          "Seguimiento de licencias técnicas, primeros auxilios, competencias lingüísticas y especialidades deportivas.",
        assignmentsTitle: "Asignaciones de instalaciones y sucursales",
        assignmentsDesc:
          "Asignación de personal a centros deportivos primarios y secundarios con permisos de programación por sede.",
        apiTitle: "APIs del directorio de personal",
        apiDesc:
          "Endpoints para incorporación de personal, actualización de habilidades y gestión de asignaciones de sede.",
        apiList: "Listar personal con filtros de competencia y sede",
        apiCreate: "Registrar nuevo perfil de empleado con parámetros contractuales",
      },
      scheduling: {
        title: "Programación de turnos y matrices de disponibilidad",
        description:
          "Patrones de cuadrante, control de horas extras, intercambios de turnos y cumplimiento de jornada laboral.",
        intro:
          "La programación de turnos coordina el despliegue del personal entre sedes, cuadrando credenciales con requisitos de sesión.",
        infoTitle: "Legislación laboral y cumplimiento",
        infoContent:
          "Reglas automatizadas que previenen conflictos de horarios, exceso de horas continuas y descansos obligatorios.",
        rosterTitle: "Generación de cuadrante semanal",
        rosterDesc:
          "Cuadrícula visual que cruza disponibilidad del personal con horarios de apertura y sesiones reservadas.",
        availabilityTitle: "Intercambio de turnos y gestión de ausencias",
        availabilityDesc:
          "Autoservicio para empleados para solicitar permisos, registrar disponibilidad e intercambiar turnos.",
        apiTitle: "APIs de programación de turnos",
        apiDesc:
          "Endpoints para publicar cuadrantes, registrar fichajes y aprobar intercambios de turnos.",
        apiAvailList: "Consultar disponibilidad de personal para el intervalo requerido",
        apiAssign: "Asignar empleado a un turno o sesión programada",
      },
      certs: {
        title: "Seguimiento de certificaciones y cumplimiento",
        description:
          "Licencias deportivas, RCP/primeros auxilios, vigencia de antecedentes y alertas de caducidad.",
        intro:
          "El seguimiento de certificaciones asegura que todo el personal en servicio mantenga credenciales regulatorias vigentes.",
        infoTitle: "Cumplimiento normativo continuo de seguridad",
        infoContent:
          "Alertas automáticas notifican a supervisores 60, 30 y 7 días antes del vencimiento de cualquier credencial.",
        trackingTitle: "Flujo de verificación de credenciales",
        trackingDesc:
          "Carga de documentación, validación administrativa y cotejo con registros oficiales externos.",
        alertsTitle: "Avisos automáticos de vencimiento",
        alertsDesc:
          "Notificaciones programadas y bloqueos de asignación que descalifican al personal con credenciales vencidas.",
        apiTitle: "APIs de certificaciones",
        apiDesc:
          "Endpoints para presentar credenciales, verificar documentos y comprobar estado de cumplimiento.",
        apiList: "Listar certificaciones de personal con estado de caducidad",
        apiCreate: "Registrar nueva certificación con justificante de validación",
      },
      api: {
        listStaff: "Listar miembros del personal con filtros de rol, departamento y estado laboral",
        createStaff: "Dar de alta un nuevo perfil de entrenador o empleado",
        listCertifications:
          "Recuperar licencias y certificaciones profesionales verificadas de un empleado",
        addCertification:
          "Enviar un nuevo documento de certificación para verificación administrativa",
        verifyCertification:
          "Verificar y aprobar una licencia de entrenador con fecha de vencimiento",
        getAvailability:
          "Consultar horarios laborales y disponibilidad de turnos para programación",
        createAssignment:
          "Asignar un entrenador verificado a una reserva de sede o sesión de academia",
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
        archTitle: "Arquitectura del Repositorio de Actores",
        archIntro:
          "Especializada en grafos de relaciones masivos, aislamiento multiinquilino y cotejo fonético de duplicados.",
        featureRelationships: "Grafo Relacional de Sujetos",
        featureRelationshipsDesc:
          "Vínculos dirigidos como Tutor-Deportista, Empresa-Filial o Entidad-Patrocinador.",
        featureRoles: "Delimitación Dinámica de Roles",
        featureRolesDesc:
          "Capacidad de un mismo actor para desempeñar funciones simultáneas sin multiplicar perfiles.",
        featureContacts: "Canales de Contacto Multicanal",
        featureContactsDesc:
          "Gestión centralizada de teléfonos, direcciones y correos con marcas de verificación.",
        featureDataPrivacy: "Privacidad y Adecuación al RGPD",
        featureDataPrivacyDesc:
          "Puntos de anclaje para anonimización y auditoría continua de información sensible.",
        mergeFlowTitle: "Fusión y Desduplicación de Registros",
        mergeFlowIntro:
          "Reconciliación de contactos duplicados procedentes de inscripciones web y cargas masivas:",
        apiTitle: "API del Núcleo de Actores",
        apiIntro:
          "Consultas de directorio, creación de entidades maestras y depuración de redundancias.",
      },
      polymorphic: {
        title: "Modelo polimórfico de partes y gestión de contactos",
        description:
          "Identidad unificada para personas, empresas y proveedores con gestión multicanal de puntos de contacto.",
        intro:
          "El Party Kernel ofrece una identidad centralizada para personas y organizaciones a lo largo de todo el sistema.",
        infoTitle: "Separación de identidad y roles",
        infoContent:
          "Una misma entidad puede desempeñar simultáneamente roles de cliente, entrenador y proveedor corporativo.",
        modelTitle: "Arquitectura Persona vs. Organización",
        modelDesc:
          "Clase base polimórfica que separa datos demográficos individuales de estructuras societarias mercantiles.",
        contactTitle: "Gestión de puntos de contacto multicanal",
        contactDesc:
          "Datos de contacto omnicanal (correo, teléfono, SMS, WhatsApp) con indicadores de canal principal y verificación.",
        apiTitle: "APIs del modelo de partes",
        apiDesc:
          "Endpoints para crear partes, gestionar puntos de contacto y consultar perfiles polimórficos.",
        apiList: "Buscar partes en tipos Persona y Organización",
        apiCreatePerson: "Registrar perfil individual de persona",
      },
      relationships: {
        title: "Grafo de relaciones y cuentas corporativas B2B",
        description: "Relaciones jerárquicas, cuentas B2B matriz-filial y tutelas familiares.",
        intro:
          "El grafo de relaciones enlaza partes mediante conexiones dirigidas: empleador/empleado, tutor/menor, patrocinador/equipo.",
        infoTitle: "Topología de cuentas basada en grafos",
        infoContent:
          "Los registros bidireccionales permiten facturación corporativa B2B compleja y gestión agrupada familiar.",
        graphTitle: "Arquitectura de relaciones dirigidas",
        graphDesc:
          "Relaciones tipadas con vigencia temporal, permisos de rol e indicadores de delegación de facturación.",
        b2bTitle: "Cuentas B2B y facturación corporativa unificada",
        b2bDesc:
          "Vinculación de deportistas y trabajadores a cuentas de empresa para facturación mensual consolidada.",
        apiTitle: "APIs del grafo de relaciones",
        apiDesc:
          "Endpoints para enlazar partes, establecer tutelas y consultar listas de miembros de organizaciones.",
        apiList: "Consultar relaciones activas para una parte determinada",
        apiCreate: "Crear nueva relación entre dos partes",
      },
      dedup: {
        title: "Motor de deduplicación y fusión de registros",
        description:
          "Cotejo fonético difuso, puntuación de confianza y procedimiento seguro de fusión.",
        intro:
          "El motor de deduplicación identifica registros duplicados originados por reservas web, registros presenciales y apps.",
        infoTitle: "Fusión no destructiva de registros",
        infoContent:
          "La fusión reasigna reservas, pagos e historial al registro superviviente, archivando el duplicado.",
        scoringTitle: "Algoritmo de puntuación por coincidencia difusa",
        scoringDesc:
          "Puntuación multifactorial que combina distancia Levenshtein, normalización telefónica, hash de email y fecha de nacimiento.",
        mergeTitle: "Flujo de resolución y selección de datos supervivientes",
        mergeDesc:
          "Pantalla de conciliación guiada para revisar campos en conflicto y elegir valores definitivos.",
        apiTitle: "APIs de deduplicación",
        apiDesc:
          "Endpoints para ejecutar escaneos de duplicados, revisar candidatos y confirmar fusiones.",
        apiCandidates: "Consultar parejas de partes sospechosas de duplicidad",
        apiExecuteMerge: "Fusionar parte duplicada en el registro superviviente",
      },
      api: {
        listParties: "Buscar y filtrar partes entre personas físicas y organizaciones",
        createPerson: "Registrar una persona individual con datos de contacto primarios",
        createOrganization: "Registrar una organización corporativa o institucional",
        createRelationship: "Establecer una relación tipificada entre dos entidades de parte",
        assignRole: "Asignar un rol operativo o comercial a un registro de parte",
        listMergeCandidates:
          "Revisar posibles registros duplicados identificados por el motor difuso",
        executeMerge: "Ejecutar fusión atómica, consolidando historiales en el registro objetivo",
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
        archTitle: "Arquitectura Organizacional y Territorial",
        archIntro:
          "Concebida para reflejar estructuras corporativas complejas, franquicias y redes de complejos deportivos.",
        featureLegalEntities: "Sociedades y Entidades Jurídicas",
        featureLegalEntitiesDesc:
          "Sociedades mercantiles con CIF independiente, registro mercantil y marcos fiscales propios.",
        featureBusinessUnits: "Unidades Estratégicas de Negocio",
        featureBusinessUnitsDesc:
          "Divisiones operativas (formación élite, eventos, instalaciones) para la imputación de costes e ingresos.",
        featureBranches: "Delegaciones y Sedes Territoriales",
        featureBranchesDesc:
          "Centros de coordinación regional responsables de logística, cuadrantes y liquidaciones.",
        featureSites: "Instalaciones y Complejos Físicos",
        featureSitesDesc:
          "Estadios, pabellones y zonas de entrenamiento georreferenciadas con precisión GPS.",
        featureDepartments: "Departamentos y Áreas Funcionales",
        featureDepartmentsDesc:
          "Grupos de especialidad (cuerpo técnico, servicios médicos, logística) para asignaciones operativas.",
        featureTeams: "Equipos Operativos y de Trabajo",
        featureTeamsDesc:
          "Grupos de trabajo constituidos para torneos, categorías de edad o proyectos estacionales.",
        treeFlowTitle: "Resolución del Árbol Jerárquico en 6 Niveles",
        treeFlowIntro:
          "Propagación descendente de directivas y privilegios a través de la estructura empresarial:",
        apiTitle: "API de Estructura Organizativa",
        apiIntro:
          "Endpoints para definir sociedades, dependencias entre delegaciones y recintos deportivos.",
      },
      hierarchy: {
        title: "Árbol de organización multinivel",
        description:
          "Entidades legales, unidades estratégicas de negocio, sedes regionales y campus deportivos.",
        intro:
          "Organization Core define la estructura maestra de la empresa en 5 niveles operativos jerárquicos.",
        infoTitle: "Aislamiento estricto de ámbito",
        infoContent:
          "Cada registro operativo descendente hereda los límites organizacionales de su nodo superior.",
        treeTitle: "Jerarquía organizativa de 5 niveles",
        treeDesc:
          "Holding corporativo -> Entidad legal -> Unidad de negocio -> Sede regional -> Campus físico.",
        fiscalTitle: "Delimitación fiscal y territorial",
        fiscalDesc:
          "Vinculación de entidades legales con identificaciones fiscales, regímenes de IVA y jurisdicciones mercantiles.",
        apiTitle: "APIs del árbol organizativo",
        apiDesc:
          "Endpoints para gestionar nodos organizativos, asignar sedes y consultar organigramas.",
        apiBranches: "Listar sucursales operativas dentro de una entidad legal",
        apiEntities: "Consultar configuraciones de entidades legales societarias",
      },
      governance: {
        title: "Gobernanza y delegación entre sucursales",
        description:
          "Controles corporativos centralizados, autonomía de sede local y herencia de normativas operativas.",
        intro:
          "La gobernanza entre sedes concilia el cumplimiento normativo corporativo con la flexibilidad operativa de cada recinto.",
        infoTitle: "Gobernanza federada de inquilinos",
        infoContent:
          "Las directrices definidas en nodos raíz se heredan en cascada con permisos de excepción local configurables.",
        delegationTitle: "Arquitectura de delegación de directrices",
        delegationDesc:
          "Delegar gestión de instalaciones, excepciones tarifarias y contratación en directores de sede.",
        scopesTitle: "Fronteras de datos y ámbito operativo",
        scopesDesc:
          "Evita fugas de datos entre sucursales facilitando al mismo tiempo la consolidación de informes ejecutivos.",
      },
      api: {
        listLegalEntities: "Listar entidades legales registradas con configuraciones fiscales",
        createLegalEntity: "Constituir una nueva entidad legal dentro del alcance del inquilino",
        listBusinessUnits: "Consultar unidades estratégicas de negocio y divisiones operativas",
        listBranches: "Recuperar sucursales operativas con mapeo de sedes regionales",
        createBranch: "Registrar una nueva sucursal vinculada a una entidad legal existente",
        listSites:
          "Listar sedes de campus físicos, centros de entrenamiento y complejos deportivos",
      },
    },
    orgCore: {
      hierarchy: {
        title: "Árbol de organización multinivel",
        description:
          "Entidades legales, unidades estratégicas de negocio, sedes regionales y campus deportivos.",
        intro:
          "Organization Core define la estructura maestra de la empresa en 5 niveles operativos jerárquicos.",
        infoTitle: "Aislamiento estricto de ámbito",
        infoContent:
          "Cada registro operativo descendente hereda los límites organizacionales de su nodo superior.",
        treeTitle: "Jerarquía organizativa de 5 niveles",
        treeDesc:
          "Holding corporativo -> Entidad legal -> Unidad de negocio -> Sede regional -> Campus físico.",
        fiscalTitle: "Delimitación fiscal y territorial",
        fiscalDesc:
          "Vinculación de entidades legales con identificaciones fiscales, regímenes de IVA y jurisdicciones mercantiles.",
        apiTitle: "APIs del árbol organizativo",
        apiDesc:
          "Endpoints para gestionar nodos organizativos, asignar sedes y consultar organigramas.",
        apiBranches: "Listar sucursales operativas dentro de una entidad legal",
        apiEntities: "Consultar configuraciones de entidades legales societarias",
      },
      governance: {
        title: "Gobernanza y delegación entre sucursales",
        description:
          "Controles corporativos centralizados, autonomía de sede local y herencia de normativas operativas.",
        intro:
          "La gobernanza entre sedes concilia el cumplimiento normativo corporativo con la flexibilidad operativa de cada recinto.",
        infoTitle: "Gobernanza federada de inquilinos",
        infoContent:
          "Las directrices definidas en nodos raíz se heredan en cascada con permisos de excepción local configurables.",
        delegationTitle: "Arquitectura de delegación de directrices",
        delegationDesc:
          "Delegar gestión de instalaciones, excepciones tarifarias y contratación en directores de sede.",
        scopesTitle: "Fronteras de datos y ámbito operativo",
        scopesDesc:
          "Evita fugas de datos entre sucursales facilitando al mismo tiempo la consolidación de informes ejecutivos.",
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
    plugins: {
      overview: {
        title: "Visión General del Sistema de Plugins",
        description:
          "Plataforma de plugins de dos niveles con plugins certificados en proceso y plugins aislados para marketplace.",
        intro:
          "El sistema de plugins es el motor de extensibilidad de SCRIPE. Permite a los operadores instalar plugins Tier 1 en el mismo proceso con acceso total a la infraestructura, y plugins Tier 2 de terceros en un gateway REST aislado.",
        infoTitle: "Plataforma de Plugins Empresarial",
        infoContent:
          "Cubre el ciclo de vida completo: definición, instalación, activación, actualización, comprobación de estado, registros de auditoría y SDK de frontend mediante postMessage.",
        whatIsTitle: "¿Qué es el Sistema de Plugins?",
        whatIsIntro:
          "Proporciona una arquitectura de dos niveles para ampliar la plataforma. Los plugins Tier 1 se integran directamente en el runtime de .NET vía IPluginStartup. Los Tier 2 se comunican a través de un gateway REST y un SDK postMessage.",
        featureTier1: "Tier 1 — Plugins Certificados",
        featureTier1Desc:
          "Plugins en proceso con acceso total a inyección de dependencias, Module Federation y contrato IPluginStartup.",
        featureTier2: "Tier 2 — Plugins en Sandbox",
        featureTier2Desc:
          "Plugins aislados vía REST gateway con limitación de frecuencia, tokens específicos y almacén clave-valor exclusivo.",
        featureSDK: "SDK de Plugins",
        featureSDKDesc:
          "Protocolo de comunicación seguro por postMessage con adaptadores tipados para temas, autenticación y navegación.",
        featureGateway: "API Gateway",
        featureGatewayDesc:
          "Gateway autenticado con cuotas de uso por inquilino, registro de actividad y gestión de claves API.",
        featureLogs: "Registros de Ejecución",
        featureLogsDesc:
          "Historial inmutable por instalación que almacena punto final, duración, código HTTP y resultado.",
        featureWebhooks: "Eventos de Webhook",
        featureWebhooksDesc:
          "7 eventos del sistema (instalación, desinstalación, activación, desactivación, actualización, error de salud, limitación).",
        tiersTitle: "Comparativa de Niveles",
        tiersIntro:
          "El modelo separa las funciones internas críticas de los complementos de terceros con barreras de seguridad infranqueables.",
        thAspect: "Aspecto",
        thTier1: "Tier 1 (Certificado)",
        thTier2: "Tier 2 (Marketplace)",
        rowWho: "Responsable",
        rowWhoT1: "Equipo interno / Socios certificados",
        rowWhoT2: "Desarrolladores terceros / Comunidad",
        rowRuntime: "Entorno",
        rowRuntimeT1: "En proceso (mismo runtime .NET)",
        rowRuntimeT2: "Sandbox REST aislado",
        rowFrontend: "Frontend",
        rowFrontendT1: "Module Federation (React compartido)",
        rowFrontendT2: "iframe + SDK postMessage",
        rowData: "Acceso a Datos",
        rowDataT1: "Acceso total a DI y base de datos",
        rowDataT2: "Exclusivamente almacén clave-valor",
        rowAuth: "Autenticación",
        rowAuthT1: "JWT del Host",
        rowAuthT2: "Token restringido del plugin",
        rowQuota: "Cuota",
        rowQuotaT1: "Sin límite (confianza total)",
        rowQuotaT2: "60 peticiones/minuto por instalación",
        architectureTitle: "Arquitectura del Sistema",
        architectureIntro:
          "Orquesta desde el registro en el catálogo hasta la auditoría continua de ejecuciones.",
        backendTitle: "Arquitectura Backend",
        backendIntro:
          "Sigue el esquema de Clean Architecture de 3 capas: Plugins.Domain → Plugins.Application → Plugins.Infrastructure.",
        cqrsTitle: "Comandos y Consultas CQRS",
        cqrsIntro:
          "Registra controladores MediatR con validadores FluentValidation para cada operación de ciclo de vida.",
        registrationTitle: "Ciclo de Vida de Registro de Extensiones",
        registrationIntro:
          "Las extensiones transitan desde la validación del manifiesto y pruebas en sandbox hasta su publicación productiva.",
        entitiesTitle: "Entidades del Dominio de Extensiones",
        entitiesIntro:
          "Comprende 8 entidades; los registros de ejecución son append-only, mientras las demás admiten borrado lógico.",
        frontendTitle: "Arquitectura Frontend de Extensiones",
        frontendIntro:
          "Patrón MVVM estricto donde los ViewModels gestionan el estado y las mutaciones mediante TanStack Query.",
        sdkTitle: "Kit de Desarrollo de Extensiones (SDK)",
        sdkIntro:
          "Ubicado en src/core/plugins/, facilita la comunicación anfitrión-extensión mediante postMessage o Module Federation.",
        endpointsTitle: "Puntos de Entrada API",
        endpointsIntro:
          "Rutas administrativas bajo /api/v1/plugins/ y pasarela de sandbox aislada bajo /api/v1/plugin-api/v1/.",
        webhooksTitle: "Eventos de Notificación Webhook",
        webhooksIntro:
          "Emite 7 eventos clave para alertar a sistemas integradores sobre cambios en las extensiones.",
        jobsTitle: "Tareas en Segundo Plano",
        jobsIntro:
          "Monitorizan la operatividad de los complementos, sanean datos temporales y depuran registros descartados.",
        permissionsTitle: "Matriz de Permisos de Extensiones",
        permissionsIntro:
          "Todas las operaciones están resguardadas por autorizaciones granulares sembradas en el arranque.",
        quickStartTitle: "Guía de Inicio Rápido",
        securityTitle: "Seguridad y Blindaje de Extensiones",
        securityIntro:
          "Múltiples perímetros de defensa para aislar a las organizaciones frente a complementos defectuosos.",
        securityWarningTitle: "Extensiones Tier 1 en el Proceso Principal",
        securityWarningContent:
          "Las extensiones Tier 1 acceden al contenedor DI y base de datos; instale únicamente código corporativo homologado.",
        secDoTitle: "Prácticas Recomendadas",
        secDontTitle: "Patrones Desaconsejados",
        nodeRegRegister: "Registrar Complemento",
        nodeRegRegisterDesc: "Envío del manifiesto del plugin, esquema del paquete y permisos.",
        nodeRegPublish: "Publicar en el Registro",
        nodeRegPublishDesc: "Validación de firmas digitales y publicación en el marketplace.",
        nodeRegVersion: "Versión SemVer",
        nodeRegVersionDesc: "Etiquetado inmutable de versiones con scripts de migración de datos.",
        nodeRegInstall: "Instalación en Inquilino",
        nodeRegInstallDesc:
          "Aprovisionamiento de sandbox aislada, cuotas de almacenamiento y webhooks.",
        nodeRegUpgrade: "Actualización Sin Interrupciones",
        nodeRegUpgradeDesc:
          "Migración de esquemas automática y sustitución transparente de iframe.",
        nodeRegUninstall: "Desinstalación Limpia",
        nodeRegUninstallDesc: "Archivado del almacén de datos y revocación de alcances de acceso.",
        connRegDraft: "Borrador a Revisión",
        connRegPublish: "Revisión a Publicación",
        connRegVersion: "Publicación a Versionado",
        connRegActive: "Versión a Instalación Activa",
        connRegChange: "Activo a Actualización",
        nodeCatalog: "Catálogo de Plugins",
        nodeCatalogDesc:
          "Registro de todas las definiciones de plugins disponibles con nivel, estado y manifiesto.",
        nodeInstall: "Instalación",
        nodeInstallDesc:
          "Registro de instalación del inquilino con JSON de configuración y estado de salud.",
        nodeTier1Host: "Host de Nivel 1",
        nodeTier1HostDesc:
          "IPluginHost — detecta IPluginStartup y activa plugins dentro del proceso.",
        nodeTier2Gateway: "Pasarela de Nivel 2",
        nodeTier2GatewayDesc:
          "IPluginGateway — reenvía HTTP a la BaseUrl del plugin con autenticación.",
        nodeSandbox: "Limitador de Frecuencia",
        nodeSandboxDesc:
          "PluginSandbox — ventana deslizante de 60 peticiones/min por inquilino e instalación.",
        nodeLogs: "Registros de Ejecución",
        nodeLogsDesc:
          "Registros inmutables PluginExecutionLog por cada llamada a través de la pasarela.",
        connInstall: "instalar",
        connTier1: "Nivel 1",
        connTier2: "Nivel 2",
        connRate: "control de tasa",
        connLog: "registrar resultado",
        cqrsType: "Tipo",
        cqrsName: "Manejador",
        cqrsDesc: "Descripción",
        cqrsInstall: "Instalar una definición de plugin para un inquilino",
        cqrsUninstall: "Eliminar una instalación de plugin y limpiar datos asociados",
        cqrsActivate: "Establecer estado de instalación en 'Activo'",
        cqrsDeactivate: "Establecer estado de instalación en 'Desactivado'",
        cqrsUpgrade: "Actualizar a una nueva versión del plugin",
        cqrsSettings: "Actualizar el JSON de configuración de la instalación",
        cqrsRegister: "Registrar una nueva definición de plugin en el catálogo",
        cqrsSetData: "Insertar o actualizar entrada clave-valor en el almacén de datos del plugin",
        cqrsGrant: "Conceder un permiso a una instalación de plugin",
        cqrsSubscribe: "Suscribirse a un evento de webhook de la plataforma",
        cqrsCatalog: "Listar todos los plugins publicados en el catálogo",
        cqrsInstalled: "Listar todas las instalaciones de un inquilino",
        cqrsDetails: "Obtener detalles completos de una definición de plugin",
        cqrsGetData: "Leer entradas del almacén de datos para un espacio de nombres",
        cqrsLogs: "Obtener registros de ejecución paginados para una instalación",
        entityName: "Entidad",
        entityBase: "Clase Base",
        entityPurpose: "Propósito",
        entityDefPurpose: "Entrada del catálogo de plugins — global, no restringida al inquilino",
        entityVerPurpose: "Historial de versiones por definición de plugin",
        entityInstPurpose: "Registro de instalación por inquilino con JSON de configuración",
        entityGrantPurpose: "Registro de consentimiento para un permiso otorgado al plugin",
        entityDataPurpose:
          "Almacén clave-valor de Nivel 2 (espacio de nombres + clave + valor JSON)",
        entityKeyPurpose: "Clave de API con hash SHA-256 para autenticación en la pasarela",
        entityWebhookPurpose: "Suscripción a webhooks para eventos de la plataforma",
        entityLogPurpose: "Registro inmutable de llamadas de pasarela (sin borrado suave)",
        apiCatalog: "Explorar plugins publicados en el catálogo",
        apiCatalogId: "Obtener detalles completos de una definición de plugin específica",
        apiInstalled: "Listar todos los plugins instalados para un inquilino",
        apiInstall: "Instalar un plugin para un inquilino",
        apiUninstall: "Desinstalar un plugin e iniciar limpieza de datos",
        apiActivate: "Activar una instalación de plugin desactivada",
        apiDeactivate: "Desactivar una instalación de plugin activa",
        apiUpgrade: "Actualizar una instalación a una nueva versión",
        apiSettings: "Actualizar la configuración JSON de una instalación",
        apiLogs: "Obtener registros de ejecución paginados (page + pageSize)",
        apiDefinitions: "Registrar una nueva definición de plugin (solo superadministrador)",
        apiContextTenant:
          "Obtener perfil del inquilino y funciones habilitadas para contexto del plugin",
        apiWebhookSub: "Suscribir una instalación a un evento de webhook de la plataforma",
        apiWebhookUnsub: "Cancelar suscripción a un evento de webhook",
        apiTokenExchange:
          "Intercambiar clave de API por token de acceso temporal con alcance delimitado",
        apiDataGet: "Listar todas las entradas clave-valor en un espacio de nombres de datos",
        apiDataSet: "Crear o actualizar un valor en el almacén de datos (máx. 64 KB)",
        apiDataDelete: "Eliminar una entrada clave-valor del almacén de datos",
        webhookEvent: "Evento",
        webhookTrigger: "Disparador",
        webhookDesc: "Descripción",
        whInstalled: "Éxito de InstallPluginCommandHandler",
        whInstalledDesc: "Se dispara tras instalar con éxito un plugin para un inquilino",
        whUninstalled: "UninstallPluginCommandHandler + limpieza",
        whUninstalledDesc:
          "Se dispara tras desinstalar y completar la limpieza del almacén de datos",
        whActivated: "Éxito de ActivatePluginCommand",
        whActivatedDesc: "Se dispara cuando el estado de una instalación cambia a 'Activo'",
        whDeactivated: "Éxito de DeactivatePluginCommand",
        whDeactivatedDesc: "Se dispara cuando el estado de una instalación cambia a 'Desactivado'",
        whUpgraded: "Éxito de UpgradePluginCommand",
        whUpgradedDesc: "Se dispara al actualizar una instalación a una nueva versión",
        whHealthFailed: "PluginHealthCheckJob",
        whHealthFailedDesc:
          "Se dispara cuando la comprobación de salud devuelve un código no 2xx en plugin activo",
        whRateLimit: "PluginSandbox.IsAllowed() = false",
        whRateLimitDesc:
          "Se dispara cuando un plugin de Nivel 2 supera la cuota de 60 peticiones/min",
        jobId: "ID de Tarea",
        jobSchedule: "Frecuencia",
        jobDesc: "Descripción",
        jobSched1: "Diariamente a las 03:00",
        jobDesc1:
          "Elimina definitivamente entidades de plugins con borrado suave con más de 30 días",
        jobSched2: "Cada 5 minutos",
        jobDesc2: "Llama a GET {baseUrl}/health para cada instalación activa de Nivel 2",
        jobSched3: "Diariamente a las 02:00",
        jobDesc3: "Limpia entradas huérfanas en almacén de datos de plugins desinstalados",
        permKey: "Clave de Permiso",
        permGrants: "Otorga Acceso A",
        permCatalogView: "Explorar catálogo de plugins publicados",
        permCatalogInstall: "Instalar plugins para un inquilino",
        permCatalogUninstall: "Desinstalar plugins de un inquilino",
        permInstalledView: "Ver lista de plugins instalados",
        permInstalledManage: "Activar, desactivar, actualizar y modificar configuraciones",
        permLogs: "Consultar registros de ejecución de una instalación",
        permDefCreate: "Registrar nuevas definiciones de plugins (administrador de plataforma)",
        permPermManage: "Conceder y revocar permisos de plugins",
        permWebhooks: "Suscribirse y cancelar suscripciones a eventos de webhook",
        step1Title: "Ejecutar Migración de Base de Datos",
        step1Content:
          "Cree la base de datos del módulo Plugins y aplique migraciones mediante la CLI de SCRIPE.",
        step2Title: "Registrar Definición de Plugin",
        step2Content:
          "Registre su plugin en el catálogo invocando el endpoint de definiciones como superadministrador.",
        step3Title: "Instalar para un Inquilino",
        step3Content:
          "Instale el plugin para un inquilino específico a través del endpoint de instalación.",
        step4Title: "Activar la Instalación",
        step4Content: "Active la instalación para que esté disponible para los usuarios.",
        step5Title: "Abrir la Interfaz del Plugin",
        step5Content:
          "Navegue a /plugins/installed en la interfaz. Verá el plugin con su indicador de salud y accesos a Configuración y Registros.",
      },
      sdk: {
        title: "Referencia del SDK de Plugins",
        description:
          "Referencia exhaustiva del SDK de comunicación entre host y plugins: PluginBridge, tipos de mensajes, clases puente y guías de desarrollo Tier 1/2.",
        intro:
          "El SDK de plugins proporciona toda la infraestructura para la comunicación bidireccional entre la aplicación anfitriona y los frontends de los plugins.",
        infoTitle: "Ubicación del SDK",
        infoContent:
          "El SDK reside en src/core/plugins/ y es agnóstico del framework frontend a nivel de protocolo.",
        protocolTitle: "Protocolo de Mensajes",
        protocolIntro:
          "Toda la comunicación se realiza mediante uniones tipadas de mensajes validados.",
        bridgeTitle: "PluginBridge",
        bridgeIntro:
          "Canal seguro de comunicación que valida event.origin en cada mensaje entrante.",
        frameTitle: "Componente PluginFrame",
        frameIntro:
          "Renderiza plugins Tier 2 en un iframe aislado con soporte para READY, RESIZE y navegación.",
        bridgesTitle: "Clases Puente",
        bridgesIntro:
          "Clases modulares para sincronización de tema, tokens de autenticación, rutas y notificaciones.",
        bridgeClass: "Clase",
        bridgeRole: "Responsabilidad",
        bridgeMsg: "Mensaje Manejado",
        roleTheme: "Enviar tema del anfitrión (modo, acento, dirección) al iframe",
        roleAuth: "Servir tokens acotados cuando el iframe solicita credenciales",
        roleNav: "Permitir al iframe activar navegación en la ventana anfitriona",
        roleToast: "Reenviar solicitudes de toast al sistema de notificaciones global",
        providerTitle: "PluginHostProvider",
        providerIntro: "Contexto React que conecta puentes y relés para las vistas de plugins.",
        eventBusTitle: "PluginEventBus",
        eventBusIntro: "Bus de eventos en memoria para notificaciones internas de plugins.",
        executionTitle: "Ciclo de Ejecución en Aislamiento (Sandbox)",
        executionIntro:
          "Entorno confinado con límites infranqueables de procesador, memoria, tráfico de red y permisos.",
        tier1Title: "Desarrollo de Extensiones Tier 1",
        tier1Intro:
          "Integración profunda en backend vía IPluginStartup y frontend compartido vía Module Federation.",
        tier2Title: "Desarrollo de Extensiones Tier 2",
        tier2Intro:
          "Aplicaciones web autónomas incrustadas en iframes con comunicación gobernada por postMessage.",
        dataStoreTitle: "API de Almacenamiento Aislado",
        dataStoreIntro:
          "Depósito clave-valor independiente por instalación y espacio de nombres con un máximo de 64 KB por clave.",
        dataStoreWarningTitle: "Límites de Peticiones en el Almacén",
        dataStoreWarningContent:
          "Las lecturas y escrituras consumen cuota de la pasarela Tier 2 (hasta 60 solicitudes por minuto).",
        nodeExecMount: "Montaje de Sandbox Iframe",
        nodeExecMountDesc:
          "Inicializar contenedor de aislamiento seguro dentro del viewport principal.",
        nodeExecReady: "Negociación PostMessage",
        nodeExecReadyDesc: "Establecer protocolo de puente bidireccional con validación de origen.",
        nodeExecToken: "Token de Acceso Limitado",
        nodeExecTokenDesc: "Emitir token temporal de OAuth restringido a los permisos del plugin.",
        nodeExecGateway: "Proxy de Pasarela",
        nodeExecGatewayDesc:
          "Enrutar peticiones autenticadas a través del proxy con limitación de tasa.",
        nodeExecSandbox: "Aplicación de Sandbox",
        nodeExecSandboxDesc: "Restricciones CSP y sandbox para evitar accesos no autorizados.",
        nodeExecLog: "Telemetría y Auditoría",
        nodeExecLogDesc: "Registrar métricas de ejecución y eventos en el flujo de auditoría.",
        connExecFrame: "Marco a Negociación",
        connExecReady: "Negociación a Emisión de Token",
        connExecRequest: "Token a Proxy de Pasarela",
        connExecForward: "Proxy a Verificación de Sandbox",
        connExecCheck: "Verificación a Registro de Auditoría",
      },
    },
    venue: {
      overview: {
        title: "Gestión de Instalaciones y Sedes Deportivas",
        description:
          "Planificación de recursos en tiempo real, bloqueos atómicos sin conflictos, horarios y ventanas de cierre por mantenimiento.",
        intro:
          "El módulo Venue gobierna campos de fútbol, pistas de pádel, pabellones y recursos reservables en organizaciones multisede, con bloqueos atómicos e integración con precios y cobros.",
        infoTitle: "Concurrencia y Mutex de Bloqueo",
        infoContent:
          "Para eliminar reservas duplicadas entre web, móvil y mostrador, implementa un bloqueo en dos fases con bloqueos distribuidos y expiración automática en 15 minutos.",
        archTitle: "Capacidades de Arquitectura",
        archIntro:
          "Diseñado para entornos de alta concurrencia, estricto aislamiento entre inquilinos y búsquedas de disponibilidad inmediatas.",
        featureVenues: "Sedes Multicomplejo",
        featureVenuesDesc:
          "Estructura jerárquica de sedes, recintos, pistas y zonas reservables con geolocalización y servicios.",
        featureAvailability: "Cálculo Dinámico de Disponibilidad",
        featureAvailabilityDesc:
          "Evaluación en tiempo real que tiene en cuenta horarios de apertura, mantenimiento y días festivos.",
        featureHolds: "Bloqueos Atómicos de Reserva",
        featureHoldsDesc:
          "Bloqueo provisional de 15 minutos durante la pasarela de pago para evitar condiciones de carrera.",
        featureReservations: "Ciclo de Vida de la Reserva",
        featureReservationsDesc:
          "Máquina de estados completa: Borrador, Provisional, Confirmada, Completada y Cancelada.",
        featureResources: "Recursos Planificables",
        featureResourcesDesc:
          "Gestión granular de pistas completas, medias canchas, monitores y material.",
        featureBlackouts: "Ventanas de Cierre y Mantenimiento",
        featureBlackoutsDesc:
          "Cancelaciones operativas inmediatas por obras, competiciones o inclemencias climáticas.",
        modelTitle: "Raíz de Agregado: Reservation",
        modelIntro:
          "Garantiza la integridad horaria, el aislamiento de inquilino, la validez del bloqueo y emite eventos de dominio.",
        bookingFlowTitle: "Ciclo de Reserva y Bloqueo en Dos Fases",
        bookingFlowIntro:
          "Desde la selección del turno horario hasta la confirmación de pago y anotación contable:",
        apiTitle: "Puntos de Entrada API Principales",
        apiIntro:
          "Endpoints REST de VenueControllers para consulta de disponibilidad, bloqueos y gestión de reservas.",
      },
      api: {
        listVenues: "Consultar sedes e instalaciones filtrando por delegación y servicios",
        createVenue: "Dar de alta un nuevo complejo deportivo con sus parámetros",
        listFacilities: "Listar pistas y recintos dentro de una sede específica",
        listResources: "Obtener recursos reservables y granularidad de turnos",
        checkAvailability: "Comprobar huecos libres para una fecha y recurso",
        acquireHold: "Adquirir un bloqueo atómico de 15 minutos sobre una pista",
        createReservation: "Crear una reserva provisional vinculada a un bloqueo activo",
        confirmReservation: "Confirmar la reserva tras la validación de pago",
        createBlackout: "Programar un cierre temporal por obras o torneos",
        getCalendar: "Obtener el cuadrante horario unificado de todos los recursos",
      },
      resources: {
        title: "Recursos Programables y Árboles Compuestos",
        description:
          "Modelado jerárquico de recursos, reglas de reserva compuesta padre-hijo y asignación de capacidad.",
        intro:
          "Los recursos programables representan los activos físicos atómicos y compuestos disponibles para reserva en todas las instalaciones.",
        infoTitle: "Bloqueo de Recursos Compuestos",
        infoContent:
          "Reservar un recurso padre bloquea automáticamente todos los activos hijos para evitar conflictos y reservas dobles.",
        hierarchyTitle: "Arquitectura de Jerarquía Compuesta",
        hierarchyDesc:
          "Representación visual del desglose de instalaciones deportivas desde complejos hasta sectores de pista.",
        capacityTitle: "Límites de Capacidad y Granularidad",
        capacityDesc:
          "Control de aforo máximo, duración de turnos (15m, 30m, 60m) e intervalos de cortesía entre reservas.",
        apiTitle: "APIs de Gestión de Recursos",
        apiDesc:
          "Endpoints para dar de alta unidades reservables, definir etiquetas y consultar jerarquías compuestas.",
        apiList: "Listar activos programables de una instalación con filtros de capacidad",
        apiCreate: "Registrar un nuevo recurso atómico o compuesto",
        apiUpdate: "Modificar capacidad, tiempos de cortesía y equipamiento asociado",
        apiDelete: "Desactivar un recurso y archivar calendarios futuros",
        modelTitle: "Modelo de Árbol de Recursos Reservables",
        modelDesc:
          "Activos atómicos y compuestos estructurados en árboles de reserva con dependencias.",
        checklistTitle: "Lista de Verificación de Publicación",
        checklistDesc:
          "Verificar precios, horarios de apertura y capacidad antes de activar la reserva pública.",
        apiPublish: "Publicar recurso para permitir reservas de clientes",
      },
      availability: {
        title: "Motor de Disponibilidad y Árboles de Intervalos",
        description:
          "Cálculo rápido de turnos libres, ventanas de mantenimiento, cierres y restricciones horarias.",
        intro:
          "El motor de disponibilidad calcula los turnos libres cruzando horarios de apertura, reservas activas e intervalos de cierre.",
        infoTitle: "Cálculo de Intervalos de Alta Velocidad",
        infoContent:
          "Búsquedas en memoria mediante árboles de intervalos resuelven la disponibilidad en fracciones de milisegundo.",
        calculationTitle: "Canal de Resolución Dinámica de Turnos",
        calculationDesc:
          "Cómo concilia el motor los horarios habituales, festivos y reservas para generar turnos disponibles.",
        blackoutTitle: "Cierres por Mantenimiento y Torneos",
        blackoutDesc:
          "Bloqueos operativos que retiran de inmediato la disponibilidad en los periodos indicados.",
        apiTitle: "APIs de Resolución de Disponibilidad",
        apiDesc:
          "Endpoints de alto rendimiento consultados por widgets de reserva y pantallas de control.",
        apiQuery: "Evaluar turnos libres para un recurso y rango de fechas",
        apiBatchQuery: "Consultas masivas de disponibilidad en múltiples instalaciones",
        apiCreateBlackout: "Imponer un cierre por mantenimiento o torneo",
        algoTitle: "Cálculo por Árbol de Intervalos",
        algoDesc: "Matemática de intervalos en memoria que garantiza respuestas inmediatas.",
        blackoutsTitle: "Ventanas de Cierre y Mantenimiento",
        blackoutsDesc: "Cancelación operativa inmediata de turnos para reparaciones imprevistas.",
        apiBlackout: "Crear periodo de cierre por mantenimiento",
      },
      booking: {
        title: "Espacio de Reserva y Bloqueos en 2 Fases",
        description:
          "Bloqueos mutex distribuidos, concurrencia optimista y reservas temporales de 15 minutos en checkout.",
        intro:
          "El espacio de reserva gestiona el flujo en tiempo real adquiriendo bloqueos atómicos que evitan colisiones.",
        infoTitle: "Protocolo de Bloqueo en Dos Fases",
        infoContent:
          "El Paso 1 establece un bloqueo temporal de 15 minutos en Redis; el Paso 2 consolida la reserva fija tras recibir el webhook de pago.",
        holdEngineTitle: "Arquitectura de Bloqueo Mutex Distribuido",
        holdEngineDesc:
          "Análisis exhaustivo de bloqueos distribuidos en Redis con liberación automática por TTL.",
        clientSyncTitle: "Concurrencia Optimista y Estado del Cliente",
        clientSyncDesc:
          "Sincronización de estado que refleja de inmediato el bloqueo de turnos en múltiples sesiones abiertas.",
        apiTitle: "APIs de Bloqueos de Reserva",
        apiDesc:
          "Endpoints clave para adquirir, prorrogar y consolidar bloqueos temporales en reservas firmes.",
        apiHold: "Adquirir bloqueo atómico de 15 minutos en un turno",
        apiRelease: "Liberar voluntariamente un bloqueo no finalizado",
        apiCommit: "Confirmar bloqueo y convertir en reserva definitiva",
        holdLifecycleTitle: "Ciclo de Vida del Bloqueo en 2 Fases",
        holdLifecycleDesc:
          "Retenciones temporales de 15 minutos que protegen el turno durante la pasarela de pago.",
        reducerTitle: "Reductor de Estado en Cliente",
        reducerDesc:
          "Actualizaciones reactivas en interfaz para mantener los turnos sincronizados entre navegadores.",
        apiConfirm: "Confirmar reserva tras cobro satisfactorio",
      },
      calendar: {
        title: "Calendario Operativo y Cuadrícula de Despacho",
        description:
          "Cronogramas Gantt en tiempo real, mapas térmicos de ocupación, visualización de conflictos y ajustes.",
        intro:
          "El calendario operativo proporciona a los gestores visibilidad total sobre pistas, partidos en curso y mantenimientos.",
        infoTitle: "Renderizado de Cronograma en Tiempo Real",
        infoContent:
          "Lienzo virtualizado capaz de mover miles de bloques de reserva diarios a 60 FPS sin retrasos.",
        gridTitle: "Cuadrícula de Asignación Multipista",
        gridDesc:
          "Interfaz visual de arrastrar y soltar para reprogramar turnos con detección instantánea de conflictos.",
        heatmapTitle: "Mapas Térmicos de Capacidad y Ocupación",
        heatmapDesc:
          "Métricas agregadas que señalan las horas punta y los periodos con baja afluencia.",
        apiTitle: "APIs de Calendario y Despacho",
        apiDesc:
          "Endpoints que suministran eventos, traslados de reservas y chequeo de solapamientos.",
        apiFeed: "Obtener bloques de eventos para la cuadrícula operativa",
        apiReschedule: "Mover bloque de reserva validando colisiones",
        realtimeTitle: "Cronograma Gantt en Tiempo Real",
        realtimeDesc: "Visualización optimizada de cientos de reservas concurrentes en pantalla.",
        apiGet: "Consultar bloques del calendario de una instalación",
      },
      res360: {
        title: "Reserva 360 y Máquina de Estados",
        description:
          "Ciclo de vida completo de reservas, modificaciones operativas, check-in de asistentes y auditoría.",
        intro:
          "Reserva 360 unifica los datos del cliente, cobros, cambios de horario y permisos de acceso al recinto.",
        infoTitle: "Máquina de Estados Finitos",
        infoContent:
          "Transiciones estrictas controlan la reserva desde Borrador hasta Finalizada o Cancelada.",
        stateTitle: "Transiciones de Estados Válidas",
        stateDesc:
          "Flujos admitidos: Borrador -> En Espera -> Confirmada -> En Curso -> Completada (o Cancelada).",
        alterationsTitle: "Modificaciones Operativas y Suplementos",
        alterationsDesc:
          "Ampliaciones de tiempo, cambio de pista y alquiler de material con recálculo automático.",
        apiTitle: "APIs de Reserva 360",
        apiDesc:
          "Endpoints completos para gestionar expedientes de reserva, control de asistencia y cancelaciones.",
        apiGet: "Consultar ficha completa de la reserva y línea temporal",
        apiAlter: "Modificar horarios, pistas asignadas o suplementos",
        apiCancel: "Cancelar reserva y calcular devolución económica",
        apiCheckIn: "Registrar llegada física del participante al centro",
        lifecycleTitle: "Ciclo Completo de Estados de Reserva",
        lifecycleDesc:
          "Trazabilidad íntegra desde la reserva inicial hasta el cierre del servicio.",
        apiReschedule: "Reprogramar reserva a un nuevo turno horario",
      },
      attention: {
        title: "Centro de Atención y Limpieza de Excepciones",
        description:
          "Detección automática de checkouts parados, desajustes de pago, bloqueos caducados y solapamientos.",
        intro:
          "El Centro de Atención alerta al personal sobre incidencias operativas que precisan intervención humana.",
        infoTitle: "Detección Proactiva de Anomalías",
        infoContent:
          "Procesos en segundo plano identifican anomalías antes de que generen conflictos o pérdidas económicas.",
        rulesTitle: "Reglas de Detección de Anomalías",
        rulesDesc:
          "Condiciones supervisadas: pagos abandonados, fallos de webhook y solapamientos indebidos.",
        sweeperTitle: "Motor de Limpieza de Bloqueos Caducados",
        sweeperDesc:
          "Servicio que libera bloqueos huérfanos en Redis y purga registros temporales cada 60 segundos.",
        apiTitle: "APIs del Centro de Atención",
        apiDesc:
          "Endpoints para revisar alertas operativas, desestimar avisos y resolver expedientes.",
        apiAlerts: "Listar incidencias operativas pendientes de atención",
        apiResolve: "Marcar incidencia como resuelta con nota de auditoría",
        apiDismiss: "Descartar aviso informativo no crítico",
        classTitle: "Clasificación de Incidencias Operativas",
        classDesc: "Categorización automática por gravedad e impacto en la operativa.",
        apiGet: "Obtener detalle de la alerta por identificador",
      },
      facility: {
        title: "Gestión de Instalaciones y Geometría",
        description:
          "Complejos deportivos multisede, mapeo GIS perimetral, zonas de acceso y equipamiento.",
        intro:
          "Gestión de instalaciones organiza los recintos en unidades operativas jerárquicas con geolocalización.",
        infoTitle: "Jerarquía Geoespacial",
        infoContent:
          "Polígonos GeoJSON delimitan perímetros de campus, plantas de edificios y pistas individuales.",
        zonesTitle: "Zonas Operativas y Etiquetas de Servicios",
        zonesDesc:
          "Clasificación según disciplina, superficie (césped natural, artificial, parqué) e iluminación.",
        perimeterTitle: "Accesos Físicos y Perímetros de Seguridad",
        perimeterDesc:
          "Integración con tornos y teclados numéricos sincronizados con reservas activas.",
        apiTitle: "APIs de Configuración de Instalaciones",
        apiDesc: "Endpoints para dar de alta campus, definir zonas de juego y asociar comodidades.",
        apiCampuses: "Consultar catálogo de sedes y árbol de zonas",
        apiCreateZone: "Crear nueva zona deportiva con polígono GeoJSON",
        apiAmenities: "Gestionar catálogo de comodidades y características",
        archTitle: "Arquitectura Física de Instalaciones",
        archDesc: "Modelado de complejos deportivos con desglose detallado de áreas y pistas.",
        apiList: "Listar centros deportivos y pabellones registrados",
        apiCreate: "Dar de alta un nuevo complejo deportivo",
      },
    },
    catalogPricing: {
      overview: {
        title: "Catálogo y Motor de Precios Dinámico",
        description:
          "Libros de precios multitarifa, cálculo instantáneo de cotizaciones, descuentos acumulables y cumplimiento fiscal.",
        intro:
          "El módulo de Catálogo y Precios actúa como núcleo comercial de SCRIPE, gestionando servicios, alquileres y membresías con tarifas dinámicas y reglas de descuento.",
        infoTitle: "Instantáneas Inmutables de Precios",
        infoContent:
          "Las cotizaciones aceptadas generan registros inmutables PriceSnapshots para garantizar la trazabilidad contable ante futuras variaciones del catálogo.",
        archTitle: "Arquitectura Comercial",
        archIntro:
          "Capaz de gestionar desde ventas directas en mostrador hasta contratos corporativos complejos en milisegundos.",
        featureCatalog: "Catálogo Unificado de Ofertas",
        featureCatalogDesc:
          "Modelo polimórfico para alquiler de pistas, entrenamientos personales, abonos y artículos de tienda.",
        featurePriceBooks: "Libros de Precios con Vigencia",
        featurePriceBooksDesc:
          "Tarifas sujetas a fechas para precios de temporada, suplementos de festivos y variaciones por sede.",
        featureDynamicPricing: "Tarificación Dinámica",
        featureDynamicPricingDesc:
          "Multiplicadores por franja horaria (valle / punta) calculados automáticamente al elegir la hora.",
        featureDiscounts: "Reglas de Descuento Combinables",
        featureDiscountsDesc:
          "Descuentos por volumen, códigos promocionales y ofertas especiales con salvaguarda de margen.",
        featureQuotes: "Cotizaciones Vinculantes",
        featureQuotesDesc:
          "Cálculo previo al pago con detalle de conceptos, impuestos aplicados y fecha de caducidad.",
        featureAgreements: "Acuerdos Comerciales B2B",
        featureAgreementsDesc:
          "Condiciones contractuales específicas vinculadas a empresas, colegios o patrocinadores.",
        modelTitle: "Raíz de Agregado: PriceQuote",
        modelIntro:
          "Encapsula líneas cotizadas, descuentos, acuerdos aplicados e impuestos antes de confirmar la compra.",
        pricingFlowTitle: "Motor de Resolución de Precios Multitarifa",
        pricingFlowIntro:
          "Cómo calcula SCRIPE el precio definitivo a partir de tarifas base, acuerdos, rebajas y tributos:",
        apiTitle: "Puntos de Entrada API Principales",
        apiIntro:
          "Endpoints de CatalogPricingControllers para gestión del catálogo, libros de tarifas y cálculo de ofertas.",
      },
      api: {
        listItems: "Recuperar artículos y servicios del catálogo por categoría y sede",
        createItem: "Registrar un nuevo servicio, recurso de alquiler o producto",
        listOfferings: "Listar servicios reservables con precios base y condiciones",
        listPriceBooks: "Consultar libros de precios vigentes y programados",
        calculateQuote: "Simular el cálculo de una cotización sin guardar estado",
        createQuote: "Generar y guardar una cotización formal con plazo de validez",
      },
      rateCards: {
        title: "Listas de Tarifas y Matrices Multidivisa",
        description:
          "Tarificación base por hora, libros de divisas, factores estacionales y tramos de volumen.",
        intro:
          "Las listas de tarifas fijan el precio unitario estándar de pistas, sesiones de entrenamiento y alquileres.",
        infoTitle: "Libros de Tarifas Multidivisa",
        infoContent:
          "Soporte de monedas locales con conversión automática o precios fijos específicos por región.",
        matrixTitle: "Arquitectura de Matriz de Tarifas",
        matrixDesc:
          "Configuración de tarifas base, recargos de fin de semana y ajustes en festivos.",
        currencyTitle: "Estructura de Libros de Moneda Extranjera",
        currencyDesc:
          "Soporte a inquilinos multirregionales con libros aislados en EUR, USD, MXN y GBP.",
        apiTitle: "APIs de Listas de Tarifas",
        apiDesc:
          "Endpoints para crear listas de precios, publicar revisiones y consultar vigencias.",
        apiList: "Listar tarifas activas por instalación y tipo de recurso",
        apiCreate: "Crear nueva lista de tarifas con calendario de precios",
        apiUpdate: "Publicar tramos de precios actualizados con fecha efectiva",
        unitRatesTitle: "Tarifas Unitarias y Tramos",
        unitRatesDesc: "Configuración detallada por horas, medias horas y días para cada activo.",
      },
      dynamicRules: {
        title: "Reglas Dinámicas y Recargos",
        description:
          "Motor de evaluación de reglas, multiplicadores en horas punta, descuentos anticipados y clima.",
        intro:
          "Las reglas dinámicas ajustan el precio base según demanda en tiempo real, franja horaria y perfil del cliente.",
        infoTitle: "Evaluación Funcional Pura",
        infoContent:
          "Las canalizaciones de precios operan como funciones deterministas sin efectos secundarios.",
        pipelineTitle: "Canal de Evaluación de Reglas",
        pipelineDesc:
          "Secuencia ordenada: Tarifa base -> Recargo horario -> Descuento cliente -> Límite final.",
        triggersTitle: "Condiciones y Disparadores de Reglas",
        triggersDesc:
          "Configuración de franjas vespertinas, alta ocupación de pistas o incentivos de última hora.",
        apiTitle: "APIs de Reglas Dinámicas",
        apiDesc:
          "Endpoints para definir condiciones de precio, simular cotizaciones y medir rendimiento.",
        apiList: "Consultar reglas de tarificación activas y su prioridad",
        apiCreate: "Registrar nueva regla condicional de precios",
        apiSimulate: "Simular aplicación de reglas sobre reservas de prueba",
        temporalTitle: "Recargos Temporales y Horas Punta",
        temporalDesc: "Factores de incremento dinámico aplicables en tardes y fines de semana.",
        tieredTitle: "Tramos Progresivos por Volumen",
        tieredDesc: "Precios escalonados con descuentos automáticos al aumentar horas contratadas.",
      },
      priceQuotes: {
        title: "Cotizaciones Criptográficas y Checkout",
        description:
          "Sellos de precio HMAC-SHA256, validación segura en pasarela y caducidad a los 15 minutos.",
        intro:
          "Las cotizaciones bloquean el precio calculado durante el proceso de pago, evitando fraudes por manipulación.",
        infoTitle: "Sellado Criptográfico de Precios",
        infoContent:
          "Cada presupuesto genera una firma HMAC-SHA256 que vincula importe, recurso, fecha y clave del inquilino.",
        sealTitle: "Verificación de Firma HMAC",
        sealDesc:
          "Comprobación exhaustiva de que el importe no ha sido modificado al llegar a la pasarela.",
        expiryTitle: "Caducidad y Renovación del Presupuesto",
        expiryDesc:
          "Caducan automáticamente a los 15 minutos para evitar tarifas obsoletas ante cambios de catálogo.",
        apiTitle: "APIs de Cotizaciones de Precio",
        apiDesc:
          "Endpoints para emitir presupuestos, validar sellos y convertirlos en facturas firmes.",
        apiGenerate: "Calcular importe final y devolver presupuesto firmado",
        apiValidate: "Verificar autenticidad de la firma de la cotización",
        apiAccept: "Aceptar presupuesto y vincular a la pasarela de pago",
        sealsTitle: "Sellado Criptográfico HMAC-SHA256",
        sealsDesc:
          "Firma digital en cada cotización que impide modificaciones de tarifas en el navegador.",
        verificationTitle: "Entrega Segura a la Pasarela",
        verificationDesc:
          "La pasarela valida la firma y el sello horario antes de realizar el cobro.",
        apiCalculate: "Calcular presupuesto aplicando las reglas dinámicas activas",
        apiGet: "Obtener cotización existente mediante su identificador",
      },
    },
    finance: {
      overview: {
        title: "Finanzas y Conciliación Multicanal",
        description:
          "Ciclo de asignación contable de partida doble, facturación de clientes, registro de cobros, notas de crédito y abonos.",
        intro:
          "Gestiona la facturación integral, cobros y conciliación de saldos para instalaciones deportivas y entidades corporativas multisede.",
        infoTitle: "Partida Doble Estricta",
        infoContent:
          "Los cobros y las facturas operan desacoplados: los pagos se distribuyen atómicamente entre facturas pendientes mediante registros PaymentAllocation. Los excedentes quedan como saldo a favor.",
        archTitle: "Infraestructura Financiera",
        archIntro:
          "Diseñada para cumplir con estándares de auditoría contable, facturación multimoneda y liquidación de impuestos.",
        featureInvoices: "Facturación a Clientes",
        featureInvoicesDesc:
          "Generación automática y manual con desglose de conceptos, tipos de IVA y exportación a PDF.",
        featurePayments: "Cobros Multicanal",
        featurePaymentsDesc:
          "Recepción de pagos a través de pasarelas electrónicas, terminales TPV, transferencias y efectivo.",
        featureAllocations: "Asignación Atómica de Fondos",
        featureAllocationsDesc:
          "Imputación determinista (FIFO o manual) de cobros a facturas abiertas con actualización de saldos.",
        featureRefunds: "Reversiones y Reembolsos",
        featureRefundsDesc:
          "Reembolsos auditados asociados a la transacción de origen para evitar duplicidades.",
        featureAdjustments: "Notas de Crédito y Regularizaciones",
        featureAdjustmentsDesc:
          "Compensaciones comerciales y correcciones de disputas con registro obligatorio de motivos.",
        featureAudit: "Pista de Auditoría Financiera",
        featureAuditDesc:
          "Registro inmutable de eventos económicos apto para inspecciones tributarias.",
        modelTitle: "Raíz de Agregado: CustomerInvoice",
        modelIntro:
          "Controla el importe de la factura, el saldo pendiente, los pagos aplicados y el estado de mora.",
        flowTitle: "Flujo de Asignación Contable y Conciliación",
        flowIntro:
          "Cómo se verifican, asientan y distribuyen los cobros sobre las obligaciones de los clientes:",
        apiTitle: "Puntos de Entrada API Principales",
        apiIntro:
          "Endpoints de FinanceControllers para facturación, cobros, liquidaciones e informes.",
      },
      api: {
        listInvoices: "Filtrar facturas de clientes por estado, titular y fecha",
        createInvoice: "Emitir una nueva factura de cliente con desglose fiscal",
        createAdjustment: "Anotar una nota de crédito o rectificación en una factura",
        listPayments: "Consultar cobros registrados en todos los canales",
        recordPayment: "Anotar una nueva transacción procedente de pasarela o caja",
        allocatePayment: "Distribuir el importe de un cobro entre facturas abiertas",
        refundPayment: "Procesar un reembolso total o parcial de un cobro",
      },
      ledger: {
        title: "Libro Mayor por Partida Doble y Plan Contable",
        description:
          "Diario contable inmutable, invariante débito/crédito equilibrada y asientos contables aislados.",
        intro:
          "El libro mayor registra todas las operaciones económicas con estricto balance matemático entre debe y haber.",
        infoTitle: "Invarianza de Suma Cero",
        infoContent:
          "Cada asiento contable cumple la ecuación fundamental: Total Debe debe ser exactamente igual a Total Haber.",
        coaTitle: "Estructura del Plan General Contable",
        coaDesc:
          "Jerarquía reglamentaria: Activo (1000), Pasivo (2000), Patrimonio Neto (3000), Ingresos (4000) y Gastos (5000).",
        journalTitle: "Arquitectura de Diario Inmutable",
        journalDesc:
          "Asientos contables de solo anexado que no admiten borrado; los ajustes exigen asientos de rectificación.",
        apiTitle: "APIs de Contabilidad General",
        apiDesc:
          "Endpoints para asentar operaciones, consultar saldos y generar balances de comprobación.",
        apiPost: "Registrar asiento contable equilibrado en el libro mayor",
        apiBalance: "Consultar saldo actual y extracto de movimientos de una cuenta",
        apiTrialBalance: "Generar balance de sumas y saldos del inquilino",
        invarianceTitle: "Matemática de Partida Doble",
        invarianceDesc:
          "Regla inquebrantable: La resta entre cargos y abonos debe ser exactamente cero.",
        auditTitle: "Historial de Asientos Inmutable",
        auditDesc: "Los registros contables no pueden ser editados ni eliminados.",
      },
      invoices: {
        title: "Facturación a Clientes y Cobros",
        description:
          "Cálculo de impuestos e IVA, expedición de facturas en PDF, imputación de cobros y abonos.",
        intro:
          "Gestiona el ciclo de vida de cobro emitiendo facturas y conciliando cobros bancarios con cuentas de clientes.",
        infoTitle: "Cumplimiento Fiscal e IVA",
        infoContent:
          "Motores fiscales configurables para adaptarse a las normativas de IVA e impuestos locales.",
        invoiceTitle: "Gestión del Ciclo de Facturas",
        invoiceDesc:
          "Estados estructurados: Borrador -> Emitida -> Parcialmente pagada -> Pagada -> Rectificada.",
        paymentTitle: "Imputación y Conciliación de Pagos",
        paymentDesc:
          "Cobros multicanal (tarjeta, transferencia, TPV) con asignación automática a líneas de factura.",
        apiTitle: "APIs de Facturación y Cobros",
        apiDesc:
          "Endpoints para emitir facturas, apuntar cobros y generar extractos de facturación para clientes.",
        apiCreate: "Generar nueva factura detallando importes e impuestos",
        apiRecordPayment: "Imputar cobro bancario recibido a una factura pendiente",
        apiDownloadPdf: "Descargar documento legal de factura en PDF firmado",
        lifecycleTitle: "Estados de Factura y Gestión de Deuda",
        lifecycleDesc: "Seguimiento automático de vencimientos y reclamación de impagados.",
        allocationTitle: "Motor de Imputación de Cobros",
        allocationDesc: "Asignación exacta de cobros a partidas concretas de la factura.",
        apiList: "Consultar facturas de clientes con filtros de estado",
      },
      settlements: {
        title: "Liquidaciones Multipartitas y Reparto de Ingresos",
        description:
          "Reparto de ingresos de marketplace, comisiones de entrenadores y pagos automáticos a propietarios.",
        intro:
          "Calcula y distribuye las liquidaciones entre propietarios de pistas, entrenadores y el operador del servicio.",
        infoTitle: "Reparto Automático de Fondos",
        infoContent:
          "Comisiones de plataforma, alquiler de pista y honorarios técnicos se dividen de inmediato al cobrar.",
        splitTitle: "Matriz de Distribución de Ingresos",
        splitDesc:
          "Porcentajes o importes fijos configurables aplicados por transacción o acumulados periódicamente.",
        payoutsTitle: "Emisión de Transferencias y Remesas Bancarias",
        payoutsDesc:
          "Generación de remesas para Stripe Connect, transferencias SEPA y liquidaciones bancarias.",
        apiTitle: "APIs de Liquidaciones y Pagos",
        apiDesc:
          "Endpoints para calcular repartos, auditar lotes de liquidación y ordenar transferencias.",
        apiCalculate: "Calcular desglose de liquidación para una reserva completada",
        apiExecuteBatch: "Lanzar remesa de transferencias automáticas a cuentas conectadas",
      },
    },
    media: {
      overview: {
        title: "Gestión de Archivos Digitales (DAM)",
        description:
          "Subida reanudable por fragmentos, almacenamiento en la nube, análisis antivirus ClamAV y enlaces temporales protegidos.",
        intro:
          "Servicio de gestión de activos multimedia para perfiles de deportistas, carnets federativos, vídeos de partidos y recibos contables.",
        infoTitle: "Protocolo de Seguridad y Antivirus",
        infoContent:
          "Cada binario subido es procesado mediante: detección de tipo MIME, verificación de integridad SHA-256, escaneo ClamAV y almacenamiento en carpetas aisladas por inquilino.",
        archTitle: "Arquitectura Multimedia",
        archIntro:
          "Conectores desacoplados (Disco local, AWS S3, Azure Blob, MinIO) y generación automática de miniaturas.",
        featureFolders: "Estructura Jerárquica de Carpetas",
        featureFoldersDesc:
          "Directorios clasificados por inquilino con herencia de permisos de acceso.",
        featureFiles: "Metadatos Exhaustivos",
        featureFilesDesc:
          "Control del nombre original, proveedor de almacenamiento, formato MIME, peso y hash criptográfico.",
        featureGrants: "Autorizaciones Granulares de Acceso",
        featureGrantsDesc:
          "Permisos temporales o restringidos por rol para documentos sensibles y contratos.",
        featureMultipart: "Subidas en Fragmentos Reanudables",
        featureMultipartDesc:
          "Protocolo de carga fiable para vídeos de gran tamaño incluso con conexiones móviles inestables.",
        featureVirusScan: "Escaneo Automático de Malware",
        featureVirusScanDesc:
          "Inspección previa a la publicación para certificar que el archivo está limpio.",
        featureCDN: "Enlaces de Descarga Protegidos",
        featureCDNDesc:
          "URLs firmadas con HMAC-SHA256 y caducidad para prevenir accesos no autorizados.",
        modelTitle: "Raíz de Agregado: MediaFile",
        modelIntro:
          "Gestiona la ubicación física, los permisos de consulta y la emisión de enlaces temporales seguros.",
        uploadFlowTitle: "Proceso de Carga y Validación",
        uploadFlowIntro:
          "Desde el envío inicial desde el navegador hasta su disponibilidad final en la CDN:",
        apiTitle: "Puntos de Entrada API Principales",
        apiIntro:
          "Endpoints de MediaControllers para carpetas, sesiones de subida y distribución de ficheros.",
      },
      api: {
        listFolders: "Listar carpetas de medios dentro del ámbito del inquilino",
        createFolder: "Crear una nueva carpeta para organizar archivos",
        listFiles: "Buscar archivos subidos filtrando por metadatos",
        uploadFile: "Iniciar sesión multipart o subir un archivo directamente",
        createGrant: "Otorgar acceso temporal o permanente a un archivo restringido",
        downloadFile: "Descargar un archivo mediante token de autorización o URL firmada",
      },
    },
    communication: {
      overview: {
        title: "Comunicación Omnicanal y Notificaciones",
        description:
          "Envío de SMS, correo, WhatsApp y notificaciones push con tolerancia a fallos, plantillas dinámicas y acuses de recibo.",
        intro:
          "Plataforma centralizada de notificaciones transaccionales y operativas con conmutación automática de proveedores y registro de entrega.",
        infoTitle: "Conmutación Inteligente ante Caídas",
        infoContent:
          "Si el proveedor principal de SMS o correo sufre una interrupción, el motor redirige el mensaje a rutas secundarias sin perder información.",
        archTitle: "Arquitectura de Comunicaciones",
        archIntro:
          "Diseñada para absorber picos repentinos de tráfico durante aperturas de inscripciones o alertas meteorológicas.",
        featureChannels: "Adaptadores Multiproveedor",
        featureChannelsDesc:
          "Conexión nativa con Twilio, SendGrid, Unifonic, AWS SES y servidores SMTP/SMPP.",
        featureEmail: "Correo Transaccional",
        featureEmailDesc:
          "Envío en HTML/texto con seguimiento de rebotes y firma digital DKIM/SPF.",
        featureSms: "SMS de Alto Rendimiento",
        featureSmsDesc:
          "Distribución global de mensajes con formato E.164 y optimización de caracteres GSM-7.",
        featureTemplates: "Plantillas Dinámicas Bilingües",
        featureTemplatesDesc:
          "Inyección de variables en tiempo real con soporte completo para idiomas LTR y RTL.",
        featureFailover: "Conmutación Automática",
        featureFailoverDesc:
          "Reintento inmediato por canal secundario ante errores de red o códigos HTTP 5xx.",
        featureDeliveryReceipts: "Acuses de Recibo Inmutables",
        featureDeliveryReceiptsDesc:
          "Historial contrastable con identificadores de operadora, fecha y confirmación de lectura.",
        modelTitle: "Raíz de Agregado: ChannelConfiguration",
        modelIntro:
          "Gestiona credenciales de conexión, límites de cadencia, prioridades y telemetría de envío.",
        dispatchFlowTitle: "Circuito de Envío y Conmutación por Fallo",
        dispatchFlowIntro:
          "Ciclo vital de un aviso transaccional desde el evento disparador hasta la confirmación de recepción:",
        apiTitle: "Puntos de Entrada API Principales",
        apiIntro:
          "Endpoints de CommunicationControllers para configurar canales, diseñar plantillas y ordenar envíos.",
      },
      api: {
        listChannels: "Consultar canales de comunicación y su estado de servicio",
        createChannel: "Configurar un nuevo proveedor de SMS, correo o WhatsApp",
        listTemplates: "Obtener plantillas de mensajes y esquemas de variables",
        renderPreview: "Previsualizar el mensaje final con datos de prueba",
        sendSms: "Enviar un mensaje SMS urgente a uno o varios teléfonos",
        listSmsLogs: "Consultar el registro histórico de entregas y estados",
      },
    },
    integrations: {
      overview: {
        title: "Ecosistema de Integraciones y API Gateway",
        description:
          "Emisión de claves API, comprobación en tiempo constante SHA-256, límites de peticiones en Redis y webhooks seguros.",
        intro:
          "Permite la conexión segura de socios, aplicaciones móviles y servicios externos con la plataforma SCRIPE mediante controles estrictos de seguridad.",
        infoTitle: "Seguridad en Tiempo Constante",
        infoContent:
          "Para anular ataques de temporización, las claves no se guardan en texto claro. La validación compara hashes SHA-256 en tiempo uniforme.",
        archTitle: "Arquitectura de Integraciones",
        archIntro:
          "Latencia mínima (< 1 ms en autenticación) y rigurosa separación de datos por inquilino.",
        featureApiKeys: "Claves API Delimitadas",
        featureApiKeysDesc:
          "Generación de credenciales con prefijos (sk_live_..., sk_test_...) y caducidad configurable.",
        featureScopes: "Permisos Específicos por Ámbito",
        featureScopesDesc:
          "Delegación controlada de privilegios para evitar que servicios externos accedan a datos innecesarios.",
        featureRateLimits: "Límites de Uso Distribuidos",
        featureRateLimitsDesc:
          "Control de frecuencia mediante Redis Token-Bucket para preservar la estabilidad de la plataforma.",
        featureTelemetry: "Telemetría en Vivo",
        featureTelemetryDesc:
          "Registro continuo de procedencia de peticiones, IPs, demoras de red y respuestas del servidor.",
        featureHashing: "Almacenamiento Criptográfico",
        featureHashingDesc:
          "Protección de credenciales mediante hashes SHA-256 comparados en tiempo constante.",
        featureConnectors: "Conectores para Terceros",
        featureConnectorsDesc:
          "Recepción y emisión de webhooks hacia plataformas de analítica, CRM y facturación externa.",
        modelTitle: "Raíz de Agregado: ApiKey",
        modelIntro:
          "Controla el ciclo de vida de la clave, la validación criptográfica, los permisos y las listas de IPs autorizadas.",
        authFlowTitle: "Flujo de Autenticación y Control de Frecuencia",
        authFlowIntro:
          "El circuito de validación de llamadas externas ejecutado en fracciones de milisegundo:",
        apiTitle: "Puntos de Entrada API Principales",
        apiIntro:
          "Endpoints de IntegrationsControllers para gestionar claves, definir permisos y consultar telemetría.",
      },
      api: {
        listKeys: "Listar claves API activas y caducadas del inquilino",
        createKey: "Generar una nueva clave con permisos y límites definidos",
        revokeKey: "Revocar de inmediato una clave invalidando sus conexiones",
        getKeyStats: "Consultar estadísticas de llamadas y errores de una clave",
        updateScopes: "Modificar los permisos y las IPs permitidas para una clave",
      },
    },
    workManagement: {
      overview: {
        title: "Gestión del Trabajo y Tareas",
        description:
          "Tableros Kanban, sprints, control de tiempos de dedicación y seguimiento de objetivos de equipo.",
        intro:
          "El módulo de Gestión del Trabajo organiza las tareas operativas, mantenimientos preventivos y proyectos de equipo dentro de la propia plataforma.",
        infoTitle: "Flujos de Trabajo Integrados",
        infoContent:
          "Asocie tareas directamente a canchas deportivas, expedientes de socios o alertas de mantenimiento.",
        featureKanban: "Vistas Kanban y Listados",
        featureKanbanDesc:
          "Organización visual de tareas mediante arrastrar y soltar con columnas de estado configurables.",
        featureSprints: "Planificación por Sprints",
        featureSprintsDesc:
          "Agrupación temporal de tareas para inauguraciones de temporada o torneos.",
        featureTime: "Control Horario",
        featureTimeDesc:
          "Cómputo exacto de tiempo dedicado a cada labor para análisis de rentabilidad.",
        featureCollab: "Trabajo en Equipo",
        featureCollabDesc:
          "Asignaciones, fechas límite, adjuntos y debates en un entorno compartido.",
        whatIsTitle: "¿Qué es el Módulo de Gestión de Trabajo?",
        whatIsIntro:
          "Un motor polimórfico para asignar, coordinar y auditar tareas operativas asociadas a cualquier registro del sistema.",
        featurePolymorphic: "Vinculación Universal de Entidades",
        featurePolymorphicDesc:
          "Asocie tareas a pistas, contratos, deportistas o facturas sin requerir nuevas tablas en la base de datos.",
        featureSla: "Control de Plazos y Acuerdos SLA",
        featureSlaDesc:
          "Supervisión automatizada de ventanas de resolución con escalamiento de prioridad ante demoras.",
        featureAssignments: "Asignación Interdepartamental",
        featureAssignmentsDesc:
          "Delegación a entrenadores, técnicos de mantenimiento o administración con avisos en tiempo real.",
        featureLifecycle: "Ciclos de Vida Estructurados",
        featureLifecycleDesc: "Flujo guiado desde Borrador y En Curso hasta Resuelto y Auditado.",
        modelTitle: "Modelo de Gestión Operativa",
        modelIntro:
          "Contiene entidad vinculada, título, descripción, prioridad, estado y registro cronológico de acciones.",
        slaTitle: "Gestión de Tiempos de Respuesta",
        slaIntro:
          "Monitoreo proactivo para asegurar el cumplimiento de estándares de servicio acordados.",
        isolationTitle: "Aislamiento por Inquilino",
        isolationIntro:
          "Todas las tareas e historiales de resolución permanecen estrictamente confinados a la empresa propietaria.",
        permsTitle: "Control de Permisos de Tareas",
        permsIntro:
          "Permisos detallados para alta, modificación, delegación y cierre de intervenciones de trabajo.",
        featureTenant: "Ámbito de Inquilino (Tenant-Scoped)",
        featureTenantDesc:
          "Cada elemento de trabajo pertenece a un inquilino y está aislado por el filtro global del módulo; la creación estampa automáticamente el inquilino activo.",
        featureStatus: "Estado del Ciclo de Vida",
        featureStatusDesc:
          "Los elementos avanzan por Todo → InProgress → Blocked hasta alcanzar el estado terminal Done o Cancelled, que fija la fecha de finalización.",
        featureAssignee: "Asignación de Actores",
        featureAssigneeDesc:
          "Una tarea puede asignarse a un actor de Identidad mediante referencia por id (sin clave foránea rígida) o dejarse sin asignar.",
      },
      items: {
        title: "Elementos de trabajo y esquemas de campos dinámicos",
        description:
          "Estructura jerárquica de tareas, asignación, enlace de campos personalizados y control de dependencias.",
        intro:
          "Work Management organiza tareas operativas, órdenes de mantenimiento y solicitudes de asistencia en ítems trazables.",
        infoTitle: "Esquemas polimórficos de elementos de trabajo",
        infoContent:
          "Los elementos de trabajo se adaptan según su tipología, cargando campos específicos y esquemas de validación.",
        hierarchyTitle: "Estructura de descomposición del trabajo (EDT)",
        hierarchyDesc:
          "Jerarquía multiescala que soporta iniciativas, épicas, tareas, subtareas y listas de comprobación.",
        customFieldsTitle: "Integración de grupos de campos dinámicos",
        customFieldsDesc:
          "Inclusión fluida de campos personalizados para números de serie de equipos, costes de reparación y prioridades.",
        apiTitle: "APIs de elementos de trabajo",
        apiDesc:
          "Endpoints para crear tareas, actualizar progresos y consultar dependencias de ejecución.",
        apiList: "Listar elementos de trabajo con filtros multifactoriales",
        apiCreate: "Crear nuevo elemento de trabajo con campos personalizados asignados",
      },
      boards: {
        title: "Tableros Kanban y máquinas de estados",
        description:
          "Tableros Kanban interactivos y automatización de transiciones de estado para operativas.",
        intro:
          "Los tableros Kanban gestionan el ciclo de vida de las tareas a través de fases configuradas con transiciones automáticas.",
        infoTitle: "Controladores estrictos de transición de estado",
        infoContent:
          "Las transiciones exigen completar campos preceptivos y verificar roles antes de mover de columna un ítem.",
        stateMachineTitle: "Arquitectura de máquina de estados de flujo",
        stateMachineDesc:
          "Definición de circuitos de estado (Pendiente -> En progreso -> Revisión -> Bloqueado -> Completado).",
        kanbanTitle: "Mecánica del tablero visual Kanban",
        kanbanDesc:
          "Arrastre de tarjetas, carriles swimlane por responsable o prioridad y avisos por límites de trabajo en curso (WIP).",
      },
      sla: {
        title: "Políticas de SLA y escalamiento de alertas",
        description:
          "Acuerdos de nivel de servicio automatizados, plazos de resolución y elevación de prioridades.",
        intro:
          "La automatización de SLA garantiza respuesta oportuna en incidencias de mantenimiento y solicitudes de clientes.",
        infoTitle: "Cronómetros de SLA automatizados",
        infoContent:
          "Los contadores de SLA pausan fuera de jornada laboral y elevan automáticamente a supervisores las tareas vencidas.",
        policyTitle: "Configuración de directivas de SLA",
        policyDesc:
          "Definición de ventanas de respuesta y resolución según categoría de cliente, criticidad de sede y gravedad de la tarea.",
        escalationTitle: "Escalamiento automático de prioridad",
        escalationDesc:
          "Alertas automáticas a responsables, avisos vía Slack/correo y elevación de prioridad ante incumplimientos de SLA.",
      },
    },
    analytics: {
      overview: {
        title: "Analítica de Ingresos e Inteligencia de Negocio",
        description:
          "Seguimiento de MRR/ARR, análisis de cohortes, modelos de predicción de bajas y puntuación de salud de clientes.",
        intro:
          "Transforme los datos operativos de reservas y suscripciones en conclusiones estratégicas para la toma de decisiones directivas.",
        infoTitle: "Métricas BI sin Herramientas Externas",
        infoContent:
          "Instantáneas automáticas nocturnas que generan informes precisos sin sobrecargar la base de datos de producción.",
        featureMrr: "Control de MRR y ARR",
        featureMrrDesc:
          "Evolución mensual y anual de ingresos recurrentes segmentados por plan y centro deportivo.",
        featureCohort: "Análisis de Cohortes",
        featureCohortDesc:
          "Evolución de la fidelización y pérdida de clientes agrupados por fecha de alta.",
        featureHealth: "Puntuación de Salud del Inquilino",
        featureHealthDesc:
          "Detección temprana de clientes en riesgo de abandono mediante indicadores de uso y pago.",
        featureForecast: "Previsiones de Facturación",
        featureForecastDesc:
          "Proyecciones estadísticas de ingresos para facilitar la presupuestación de la temporada.",
        whatIsTitle: "¿Qué es la Base de Eventos de Analítica?",
        whatIsIntro:
          "Un evento métrico es un hecho inmutable con nombre, módulo de origen, entidad opcional, marca UTC y valor. Los eventos se registran en modo append-only y se agregan diariamente para lecturas ultrarrápidas.",
        featureAppendOnly: "Solo Adición (Append-Only)",
        featureAppendOnlyDesc:
          "Hechos inmutables registrados una sola vez que nunca se modifican ni eliminan desde la interfaz.",
        featureTenant: "Ámbito de Inquilino Aislado",
        featureTenantDesc:
          "Todos los eventos e indicadores están protegidos por el filtro global de aislamiento de inquilinos.",
        featureProjection: "Proyección Diaria Operativa",
        featureProjectionDesc:
          "Los eventos se compilan automáticamente en agregados diarios para alimentar cuadros de mando sin consultas masivas.",
        featureIdempotent: "Registro Idempotente Seguro",
        featureIdempotentDesc:
          "Claves de idempotencia que evitan duplicaciones en caso de reenvío accidental de eventos.",
        modelTitle: "Modelo de Datos de Eventos",
        modelIntro:
          "Estructura que almacena identificador de inquilino, módulo emisor, fecha y valor. Las métricas diarias consolidan recuentos y sumas por fecha.",
        recorderTitle: "Captura de Eventos en Proceso",
        recorderIntro:
          "Los módulos invocan IAnalyticsRecorder en su propia transacción para registrar y consolidar datos de forma atómica.",
        isolationTitle: "Aislamiento Estricto de Métricas",
        isolationIntro:
          "El flujo de datos y las proyecciones están estrictamente circunscritos al inquilino correspondiente.",
        permsTitle: "Permisos y Acceso",
        permsIntro:
          "Requiere únicamente el permiso analytics-events.view para la consulta visual de métricas e historiales.",
      },
    },
    identityAuthSessions: {
      title: "Sesiones de Autenticación y Gestión de Tokens",
      description:
        "Documentación detallada de las seis entidades de sesión y autenticación: RefreshToken, OtpCode, QrLoginSession, WebAuthnChallenge, AdminPasskey y ExternalLogin.",
      intro:
        "SCRIPE supports multiple concurrent authentication mechanisms. Each mechanism has a dedicated entity in the Identity module. RefreshToken manages sliding session windows. OtpCode handles time-limited one-time codes. QrLoginSession enables cross-device login via QR scanning. WebAuthnChallenge powers FIDO2 passkey ceremonies. AdminPasskey stores registered FIDO2 credentials. ExternalLogin links third-party identity providers to Admin and User accounts.",
      refreshTokenTitle: "Sesiones de Autenticación y Gestión de Tokens — RefreshToken Entity",
      refreshTokenIntro:
        "RefreshToken stores a long-lived opaque token issued alongside a JWT access token. Tokens are rotated on each use — the old token is revoked with a ReplacedByToken pointer, and a new token is issued. Impersonation sessions are tracked via ImpersonatorAdminId, enabling the StopImpersonation flow to restore the original admin's session.",
      otpCodeTitle: "Sesiones de Autenticación y Gestión de Tokens — OtpCode Entity",
      otpCodeIntro:
        "OtpCode is a polymorphic one-time code that serves both users and admins. The Purpose integer maps to an enum (email verification, password reset, 2FA, etc.). Codes are invalidated via Invalidate() after successful use. The Attempts / MaxAttempts pair implements brute-force protection.",
      otpCodeNote:
        "OtpCode.Purpose is stored as an integer for database efficiency. The application-layer enum is defined in Identity.Application. Always check IsUsed and ExpiresAt before trusting a code — do NOT rely solely on the code value.",
      qrLoginTitle: "Sesiones de Autenticación y Gestión de Tokens — QrLoginSession Entity",
      qrLoginIntro:
        "QrLoginSession orchestrates cross-device login: a desktop browser creates a session (status = Pending) and displays a QR code containing the SessionToken. An authenticated mobile device scans the QR (Scanned), the user approves (Approved), the backend generates tokens, and the polling desktop browser consumes them (Consumed). Sessions are cleaned up by QrSessionCleanupJob after the 5-minute TTL.",
      qrLoginWarning:
        "QR session tokens are single-use. Once Consumed or Rejected, the session cannot be reused. The desktop browser must create a new session. Never cache or re-display a QR code after its session has advanced past Pending — it provides no security value and may confuse users.",
      webAuthnChallengeTitle:
        "Sesiones de Autenticación y Gestión de Tokens — WebAuthnChallenge Entity",
      webAuthnChallengeIntro:
        "WebAuthnChallenge is a short-lived (5-minute) server-side nonce generated at the start of each WebAuthn ceremony (registration or authentication). The challenge is sent to the browser, signed by the authenticator, and verified on return. IsUsed = true prevents replay attacks. Origin binding prevents cross-origin ceremony hijacking.",
      adminPasskeyTitle: "Sesiones de Autenticación y Gestión de Tokens — AdminPasskey Entity",
      adminPasskeyIntro:
        "AdminPasskey stores a registered FIDO2/WebAuthn credential for an admin. Each admin can have multiple passkeys (Touch ID, YubiKey, Windows Hello, etc.). The SignatureCounter is incremented by the authenticator on each use — a counter that goes backwards indicates a cloned credential. IsDiscoverable = true enables true passwordless login (no username entry required).",
      adminPasskeyNote:
        "The PublicKey field stores the COSE-encoded public key (not a PEM certificate). Never confuse it with a TLS certificate. Authenticators with Aaguid all-zeros (00000000-0000-0000-0000-000000000000) are privacy-preserving — the authenticator model is deliberately not disclosed.",
      externalLoginTitle: "Sesiones de Autenticación y Gestión de Tokens — ExternalLogin Entity",
      externalLoginIntro:
        "ExternalLogin creates a polymorphic link between an external identity (any OAuth / OIDC / SAML provider) and an Admin or User. AdminId and UserId are mutually exclusive — an external login linked to an Admin cannot authenticate a User. IdentityProviderId is null for built-in social providers (Google, Facebook, Apple, Microsoft) and set for custom OIDC/SAML providers configured per-tenant.",
      externalLoginNote:
        "The ProviderKey (the OIDC 'sub' claim) combined with ProviderName forms a globally unique external identity. Never rely on the Email field alone for matching — emails can change in external providers. Always use ProviderName + ProviderKey as the stable identity.",
    },
    identityAccessControlDeep: {
      title: "Control de Acceso en Detalle",
      description:
        "Documentación a nivel de entidad para AdminRole, AdminUserGroup y UserGroupRestriction con ámbito de inquilino.",
      intro:
        "SCRIPE's access control system is built on three junction/restriction entities. AdminRole links an admin to a role, optionally scoped to a specific tenant with an optional expiry date. AdminUserGroup links an admin to a user group, granting all roles inherited by that group. UserGroupRestriction defines field-level restrictions that are applied additively (UNION) to all group members' API responses. These three entities work together to produce a fine-grained, auditable access control model.",
      adminRoleTitle: "Control de Acceso en Detalle — AdminRole Entity",
      adminRoleIntro:
        "AdminRole is the junction entity between Admin and Role. TenantId scoping enables a single admin to have different roles across different tenants — a common pattern where a platform admin has SuperAdmin at platform level but only ReadOnly when drilling into a specific tenant. InheritToChildren cascades the role to all child tenants in a hierarchy. ExpiresAt enables time-limited role grants for contractors or temporary access.",
      adminRoleNote:
        "Expired AdminRole records (ExpiresAt < UtcNow) are treated as inactive by the AuthorizationBehavior pipeline without requiring deletion. A daily cleanup job removes expired records after a grace period. AssignedBy is kept alongside AuditableEntity.CreatedBy for explicit tracking in permission audit reports.",
      adminUserGroupTitle: "Control de Acceso en Detalle — AdminUserGroup Entity",
      adminUserGroupIntro:
        "AdminUserGroup is the membership junction between Admin and UserGroup. An admin inherits all roles assigned to a group via RolePermission records. Groups simplify bulk role management — instead of assigning roles individually, assign them to a group and add admins to that group. AdminUserGroup is auditable via AuditableEntity.",
      adminUserGroupNote:
        "Role inheritance through groups is additive: an admin's effective permissions are the UNION of their direct AdminRole assignments and all roles inherited through every group they belong to. Removing an admin from a group immediately revokes group-inherited permissions.",
      userGroupRestrictionTitle: "Control de Acceso en Detalle — UserGroupRestriction Entity",
      userGroupRestrictionIntro:
        "UserGroupRestriction defines field-level data restrictions for a user group. When an admin belongs to a group with restrictions, the listed fields are nullified in API responses for that resource. Restrictions are additive — group restrictions UNION with role-level restrictions, never override or reduce them. This means belonging to more groups can only increase restrictions, never decrease them.",
      userGroupRestrictionWarning:
        "Field restrictions are enforced server-side in the FieldProjection pipeline behavior — they are NOT a client-side UI feature. However, restrictions only nullify field values in responses; they do not prevent create/update operations on those fields. Use role permissions to control write access, and UserGroupRestriction to control read visibility.",
      restrictionFlowTitle: "Control de Acceso en Detalle — Restriction Evaluation Flow",
      restrictionFlowIntro:
        "When an admin makes an API request for a restricted resource, SCRIPE evaluates all applicable restrictions and applies them as a UNION to the response payload.",
      restrictionFlowNote:
        "Restriction evaluation is lazy — it runs per-request, not at login time. This means adding a restriction to a group takes effect immediately on the next API call without requiring a session refresh. The UNION merge strategy guarantees restrictions only accumulate — an admin who belongs to two groups with overlapping restrictions sees both restriction sets applied.",
    },
    crmLeads: {
      title: "Prospectos CRM y Embudo de Ventas",
      description:
        "Embudo de ventas corporativo: captura, calificación, asignación y conversión de prospectos en inquilinos.",
      intro:
        "The CRM Leads module is SCRIPE's built-in sales pipeline. It captures prospects who submit the Contact Sales form during the signup wizard, enriches each lead with discovery intelligence (business type, team size, priorities, recommended tier), and provides a full admin CRM workflow: list, detail drawer, status transitions, assignment, and one-click tenant conversion.",
      ingestionTitle: "Ingestion and Deduplication Lifecycle",
      ingestionIntro:
        "When a prospect submits a lead via the website signup wizard, the system performs validation and deduplication before creating a PlatformLead record. This includes checking for workspace subdomain conflicts, identifying colleague submissions for ABM targeting, and enforcing a daily lead registration cap.",
      whatIsTitle: "Prospectos CRM y Embudo de Ventas — What is the Leads CRM?",
      whatIsIntro:
        "A Lead represents a prospective customer who has expressed interest in the platform. Each lead carries contact info, discovery context from the signup wizard, and a lifecycle status that tracks the sales engagement from first contact to conversion. All data is soft-deleted, fully audited, and accessible only to admins with the appropriate permissions.",
      lifecycleTitle: "Prospectos CRM y Embudo de Ventas — Lead Lifecycle",
      lifecycleIntro:
        "Leads move through a defined set of statuses. Status transitions are tracked in the activity timeline so the entire team can see the history of each opportunity.",
      discoveryTitle: "Prospectos CRM y Embudo de Ventas — Discovery Intelligence",
      discoveryIntro:
        "Every lead captured via the signup wizard Contact Sales form is enriched with five discovery fields that the prospect answered during the onboarding questionnaire. These fields give the sales team instant context without requiring a follow-up call.",
      discoveryTip:
        "The RecommendedTier field is computed by the signup wizard's recommendation engine based on the prospect's answers. It provides a data-driven starting point for the sales conversation and pre-fills the tier selection in the Convert to Tenant dialog.",
      backendTitle: "Prospectos CRM y Embudo de Ventas — Backend Architecture",
      backendIntro:
        "The Leads feature follows the standard SCRIPE 3-project module layout. The PlatformLead entity lives in the Entitlements domain and is managed via a dedicated repository and CQRS command/query pipeline.",
      entityTitle: "Prospectos CRM y Embudo de Ventas — PlatformLead Entity",
      entityIntro:
        "PlatformLead inherits from AuditableEntity (CreatedBy, CreatedAt, UpdatedBy, UpdatedAt, IsDeleted, RowVersion). All IDs are AES-encrypted in API transit. The entity is designed to hold both CRM lifecycle data and the discovery intelligence gathered during the signup wizard questionnaire.",
      endpointsTitle: "Prospectos CRM y Embudo de Ventas — API Endpoints",
      endpointsIntro:
        "The LeadsController exposes 9 endpoints covering the full lead lifecycle. All endpoints require AdminOnly JWT authentication. The contact-sales submission endpoint is the only public route.",
      endpointsNote:
        "All entity IDs returned by the API are AES-encrypted via IdEncryptionHelper. The frontend should never construct or manipulate raw GUIDs — always use the encrypted strings returned from the API.",
      convertTitle: "Prospectos CRM y Embudo de Ventas — Convert to Tenant",
      convertIntro:
        "The ConvertLeadToTenant command is an atomic operation that creates a live tenant from a qualified lead. The handler orchestrates tenant provisioning, edition assignment, activity logging, and status update in a single database transaction. If any step fails, the entire operation rolls back.",
      emailsTitle: "Prospectos CRM y Embudo de Ventas — Email Notifications",
      emailsIntro:
        "When a Contact Sales form is submitted, two branded HTML emails are dispatched asynchronously (fire-and-forget via Task.Run) to avoid blocking the API response. Both templates use inline CSS for maximum email client compatibility.",
      emailsTip:
        "Configure Leads:SalesNotificationEmail in appsettings.json to set the inbox that receives sales alerts. The SMTP settings use the shared SmtpSettings block. Emails are dispatched fire-and-forget — a delivery failure does not fail the lead creation.",
      frontendTitle: "Prospectos CRM y Embudo de Ventas — Frontend Architecture",
      frontendIntro:
        "The frontend leads sub-module follows the strict SCRIPE sub-module pattern: domain entities, data layer (service → mapper → repository), and presentation layer (viewmodel → view → components). All HTTP calls go through IApiService via DI — never directly in hooks.",
      frontendEntityTitle: "PlatformLead Entity (Frontend)",
      frontendEntityIntro:
        "The PlatformLead domain entity wraps the raw DTO data with computed getters and display logic. The relativeTime getter uses Intl.RelativeTimeFormat for locale-aware relative timestamps. The discoveryTags getter aggregates the three discovery fields into a tag array for the drawer's discovery intelligence section.",
      permissionsTitle: "Prospectos CRM y Embudo de Ventas — Permissions",
      permissionsIntro:
        "Leads are gated behind five granular permissions following the standard SCRIPE permission format (module.action). Assign the leads.convert permission only to senior sales admins — it triggers tenant provisioning which is a high-impact operation.",
      permissionsTip:
        "Frontend permission checks (usePermission, PermissionGate) are UX-only. The backend always enforces the permission check via the AuthorizationBehavior pipeline regardless of what the UI shows.",
      quickStartTitle: "Prospectos CRM y Embudo de Ventas — Quick Start",
      quickStartIntro:
        "The typical CRM flow from prospect submission to live tenant takes 5 steps. Conversion is the only step requiring senior admin permissions — all other transitions can be performed by any admin with leads.update.",
    },
    stripeConnect: {
      title: "Stripe Connect y División de Pagos",
      description:
        "División de pagos de marketplace mediante Stripe Connect Express, libro mayor de comisiones y cuentas de inquilinos.",
      intro:
        "Stripe Connect enables SCRIPE's marketplace payment splitting model. When a tenant processes a user payment, the platform automatically deducts a commission via Stripe's application_fee_amount and routes the net amount to the tenant's Stripe Express account. This page covers the full domain model, commission resolution chain, and operational tooling.",
      whatIsTitle: "Stripe Connect y División de Pagos — What Is Stripe Connect?",
      whatIsIntro:
        "Stripe Connect is Stripe's multi-party payment infrastructure. In SCRIPE, it powers the B2B2C marketplace: tenants sell plans to their end-users, Stripe routes payments, and SCRIPE's commission engine deducts the platform fee automatically on each charge without requiring tenant cooperation.",
      architectureTitle: "Stripe Connect y División de Pagos — Payment Split Architecture",
      architectureIntro:
        "Every user payment flows through Stripe, which instantly splits it between the tenant and the platform based on the resolved commission rate.",
      accountEntityTitle: "Stripe Connect y División de Pagos — TenantStripeAccount Entity",
      accountEntityIntro:
        "One TenantStripeAccount row exists per tenant. It tracks the Stripe account ID, onboarding lifecycle, charge/payout capability, commission rate override, and cumulative payout statistics.",
      onboardingTitle: "Stripe Connect y División de Pagos — Onboarding Status Lifecycle",
      onboardingIntro:
        "Tenant accounts go through a Stripe-managed KYC/identity verification process before they can accept charges or receive payouts.",
      commissionTitle: "Commission Rate Resolution Chain",
      commissionIntro:
        "The effective commission rate is resolved from most-specific to most-general. The first non-null value in the chain wins.",
      commChain1: "Per-tenant override — set by platform admin in the Stripe Connect admin panel.",
      commChain2:
        "Per-edition rate — configured on the Edition entity via ConnectCommissionRate field.",
      commChain3: "Platform-wide default — stored in the ConnectPlatformSettings singleton row.",
      commChain4: "Hardcoded safety fallback — 10% — only used if the singleton row is missing.",
      settingsTitle: "ConnectPlatformSettings (Singleton)",
      settingsIntro:
        "A single row (ID: 00000001-0000-0000-0000-000000000001) stores platform-wide Connect defaults. Always access via ConnectPlatformSettings.SingletonId — never insert a second row.",
      settingsSingletonNote:
        "ConnectPlatformSettings uses the Singleton pattern: exactly ONE row always exists, identified by the well-known SingletonId constant. The admin UI surfaces it as an editable settings form rather than a list.",
      ledgerTitle: "Stripe Connect y División de Pagos — Commission Ledger & Invoicing",
      ledgerIntro:
        "Three entities form the commission accounting system. For Stripe Connect payments, commissions are collected instantly via application_fee_amount. For non-Connect gateways (PayPal, Paymob), commissions are tracked in CommissionLedgerEntry and billed monthly or on threshold.",
      invoiceTriggerTitle: "Stripe Connect y División de Pagos — Commission Invoice Triggers",
      invoiceTriggerIntro:
        "CommissionInvoice rows are generated by one of three triggers, configurable in ConnectPlatformSettings.",
      promoTitle: "Promotion Redemption (FirstTimeOnly Enforcement)",
      promoIntro:
        "PromotionRedemption records each promotional code usage at signup activation. Because SCRIPE creates a new Stripe Customer per signup, Stripe's first_time_transaction flag is unreliable. SCRIPE instead stores a SHA-256 hash of the subscriber's email to enforce FirstTimeOnly promotions locally for up to 12 months.",
      promoNote:
        "PromotionRedemption rows are hard-deleted after 12 months (not soft-deleted — accepted v1 trade-off). FirstTimeOnly enforcement weakens past this horizon. Raw email addresses are never stored — only the SHA-256 hex hash.",
      alertsTitle: "Stripe Connect y División de Pagos — Operational Alerts",
      alertsIntro:
        "OperationalAlert is a dead-letter table for events requiring human review. Every alert also triggers an ops notification email via the email outbox. Alerts are visible in the admin panel where operators can acknowledge and resolve them inline.",
      configTitle: "Stripe Connect y División de Pagos — Configuration",
      configIntro:
        "Stripe Connect requires two webhook secrets: the standard webhook secret for SaaS subscription events, and a Connect webhook secret for account-level events (charges, payouts, account.updated).",
      endpointsTitle: "Stripe Connect y División de Pagos — API Endpoints",
      endpointsIntro:
        "Connect management endpoints are restricted to super-admin roles. Tenant-facing onboarding links are generated per-tenant and are single-use.",
      ep: {
        create: "Registrar una nueva cuenta Stripe Connect Express para un arrendatario",
        get: "Obtener estado y detalles de registro de la cuenta Stripe del arrendatario",
        onboardingLink: "Generar enlace de incorporación de Stripe Connect de un solo uso",
        ledger:
          "Listar asientos del libro de comisiones (filtrado por arrendatario, estado, pasarela)",
        invoices: "Listar facturas de comisión (filtrado por arrendatario, estado, desencadenante)",
        invoiceGenerate: "Generar manualmente una factura de comisión para un arrendatario",
        settings: "Obtener la configuración singleton de ConnectPlatformSettings",
        settingsUpdate: "Actualizar ajustes de Stripe Connect a nivel de plataforma",
        alerts: "Listar todas las alertas operativas (filtrado por tipo, estado, gravedad)",
        alertResolve: "Reconocer o resolver una alerta operativa con nota de resolución",
      },
    },
    signupCustomization: {
      title: "Personalización del Registro y Onboarding",
      description:
        "Motor de inteligencia para registro de autoservicio con lógica de bifurcación y recomendaciones de edición.",
      intro:
        "The Signup Customization system is SCRIPE's Intelligence Engine for the self-service signup flow. Platform administrators define a question tree, each answer option carries a signal weight, and declarative RecommendationRules map answer patterns to specific editions — automatically guiding users to the plan best suited to their needs.",
      whatIsTitle: "What Is the Intelligence Engine?",
      whatIsIntro:
        "The Intelligence Engine is the recommendation system behind SCRIPE's self-service signup. Instead of presenting a static pricing table, users answer a short onboarding questionnaire. The engine matches their answers against RecommendationRules and presents a personalized edition recommendation with a localized reason. Administrators configure questions, options, and rules without code changes.",
      flowTitle: "Personalización del Registro y Onboarding — Signup Flow Overview",
      flowIntro: "The full signup flow from category selection through recommendation.",
      questionTitle: "Personalización del Registro y Onboarding — OnboardingQuestion Entity",
      questionIntro:
        "Each OnboardingQuestion represents a single step in the onboarding flow. Questions can be global (shown to all users) or scoped to an EditionCategory. Question-level branching is supported via DependsOnQuestionKey + DependsOnAnswerValue.",
      optionTitle: "Personalización del Registro y Onboarding — OnboardingAnswerOption Entity",
      optionIntro:
        "Each OnboardingAnswerOption is a selectable answer choice for a question. Options carry scoring signals (SignalWeight) for the recommendation engine and optional visibility relevance boosts (RelevanceBoost) that re-rank options based on earlier answers.",
      conditionTitle: "Option-Level Visibility Conditions",
      conditionIntro:
        "OnboardingAnswerOptionCondition enables fine-grained client-side visibility control at the individual option level. Unlike question-level branching (which shows/hides entire questions), option conditions show/hide specific answer choices based on earlier answers.",
      sessionAnswerTitle: "Personalización del Registro y Onboarding — SignupSessionAnswer Entity",
      sessionAnswerIntro:
        "SignupSessionAnswer persists each user's answer during an in-progress signup. It deliberately uses SignupSessionRef (a plain string) instead of a FK to the SignupSession entity to avoid cross-module coupling — the Entitlements module never imports Identity session types.",
      ruleTitle: "Personalización del Registro y Onboarding — RecommendationRule Entity",
      ruleIntro:
        "RecommendationRules are the declarative matching engine. Each rule defines a ConditionJson predicate, a target edition (by tier level or specific ID), and a ScoreBonus. Rules evaluated in Priority order accumulate scores per candidate edition — the highest-scoring edition wins.",
      scoringTitle: "Personalización del Registro y Onboarding — Scoring Algorithm",
      scoringIntro:
        "The recommendation engine evaluates all active rules, accumulates scores, and returns the top-scoring edition with the reason from the highest-priority matching rule.",
      endpointsTitle: "Personalización del Registro y Onboarding — API Endpoints",
      endpointsIntro:
        "Admin endpoints for question/rule management require entitlements.manage permission. Flow and answer endpoints are public — no authentication required during signup.",
      conditionNote:
        "Las condiciones definen la visibilidad de los pasos del formulario de registro según las opciones elegidas.",
      sessionAnswerTip:
        "Las respuestas del proceso de registro se almacenan cifradas hasta la confirmación de la cuenta.",
      ep: {
        questions: "Listar todas las preguntas de incorporación con sus opciones y condiciones",
        createQuestion: "Crear una nueva pregunta de registro con opciones de respuesta",
        updateQuestion: "Actualizar pregunta existente (etiqueta, ayuda, orden y ramificación)",
        deleteQuestion: "Eliminar una pregunta de registro no perteneciente al sistema",
        flow: "Obtener el flujo de incorporación completo para una categoría (público en registro)",
        submitAnswers: "Enviar respuestas de un paso de la sesión de registro (público)",
        recommend: "Obtener recomendación de edición basada en respuestas (público)",
        rules: "Listar todas las reglas de recomendación",
        createRule: "Crear o actualizar regla de recomendación mediante slug de nombre estable",
      },
    },
    platformManagement: {
      title: "Gestión de Plataforma y Cuotas",
      description:
        "Contadores de cuotas con control de concurrencia, instantáneas de prueba y libro de comisiones externas.",
      intro:
        "Platform Management covers the operational infrastructure that keeps SCRIPE's multi-tenant platform numerically consistent: quota counters that prevent resource over-provisioning, trial snapshots that enable accurate downgrade enforcement, and the commission ledger that tracks platform revenue from non-Stripe-Connect payment gateways.",
      whatIsTitle: "Gestión de Plataforma y Cuotas — What Is Platform Management?",
      whatIsIntro:
        "Platform Management is the collection of domain entities responsible for enforcing tenant resource limits (quotas), capturing resource state at trial start, and tracking platform commissions from PayPal and Paymob gateway payments. These components work together to ensure billing integrity and fair resource allocation across the multi-tenant hierarchy.",
      quotaTitle: "Gestión de Plataforma y Cuotas — QuotaCounter Entity",
      quotaIntro:
        "QuotaCounter tracks resource usage per tenant with optional pooled enforcement. One row exists per tenant per resource type (admin, role, subtenant, usergroup). The reservation pattern prevents race conditions under concurrent creation requests.",
      reservationTitle: "Gestión de Plataforma y Cuotas — Atomic Reservation Pattern",
      reservationIntro:
        "The reservation pattern is a three-phase protocol that prevents quota over-provisioning even under high concurrency.",
      reservationNote:
        "TryReserveSlotAsync uses a database-level atomic increment of Reserved. On failure (e.g. database exception), the strategy is fail-open to preserve availability — the reservation is released and the creation is allowed with a warning logged. This matches the quota enforcement philosophy: approximate limits are preferable to service unavailability.",
      pooledTitle: "Gestión de Plataforma y Cuotas — Quota Enforcement Modes",
      pooledIntro:
        "QuotaCounter supports two enforcement modes controlled by PoolRootTenantId. Per-tenant enforcement is the default; pooled enforcement enables resource sharing across a tenant hierarchy (e.g. a parent tenant that allocates admins across its sub-tenants).",
      trialSnapshotTitle: "Gestión de Plataforma y Cuotas — TrialSnapshot Entity",
      trialSnapshotIntro:
        "A TrialSnapshot captures the resource counts (admin, role, sub-tenant, user-group) at the exact moment a trial subscription begins. At trial expiry, the system compares current counts against the snapshot to determine if the tenant provisioned resources beyond the base edition's limits during the trial period.",
      trialSnapshotTip:
        "TrialSnapshot enables the trial downgrade safety check: if AdminCount grew from 2 (snapshot) to 8 (current) and the post-trial edition allows only 5, the system can trigger the OverflowPolicy action (Freeze or Notify) before activating the downgraded subscription.",
      ledgerEntryTitle: "Gestión de Plataforma y Cuotas — CommissionLedgerEntry Entity",
      ledgerEntryIntro:
        "CommissionLedgerEntry records commissions from non-Connect gateway payments (PayPal, Paymob). For Stripe Connect payments, commissions are collected instantly via application_fee_amount — this entity is only for post-billing gateway flows that require deferred commission collection.",
      revenueTitle: "Gestión de Plataforma y Cuotas — Revenue Analytics Integration",
      revenueIntro:
        "The commission ledger feeds directly into the Revenue Analytics module for platform-wide financial reporting.",
      endpointsTitle: "Gestión de Plataforma y Cuotas — API Endpoints",
      endpointsIntro:
        "Platform management endpoints are restricted to super-admin roles. Quota data is read-only for standard platform admins.",
      ep: {
        quotaList: "Listar todos los contadores de cuota (filtrado por arrendatario y recurso)",
        quotaGet: "Obtener el contador de cuota para un arrendatario y tipo de recurso",
        quotaReset: "Restablecer contador de cuota a cero o a un límite base",
        trialSnapshot: "Obtener instantánea de recursos capturada al inicio de la prueba",
        ledger:
          "Listar asientos del libro de comisiones (filtrado por arrendatario, pasarela, estado)",
        waive: "Exonerar un asiento del libro de comisiones con nota de administración",
        dashboard: "Obtener métricas resumen del panel de control de la plataforma",
      },
    },
    pluginEntities: {
      title: "Definición y Versionado de Plugins",
      description:
        "PluginDefinition y PluginVersion: las dos entidades fundamentales que definen la identidad y versiones de un plugin.",
      intro:
        "Every plugin in the SCRIPE ecosystem starts with a PluginDefinition — the immutable identity record. Versions are snapshotted releases of that definition. Together they form the foundation that installations, API keys, and data stores build upon.",
      definitionTitle: "Definición y Versionado de Plugins — PluginDefinition Entity",
      definitionIntro:
        "Core entity representing a registered plugin in the platform. Contains metadata (name, description, icon), configuration (manifest, tier, scope), and developer association. Supports both Tier 1 (embedded .NET assembly) and Tier 2 (external HTTP service) plugin architectures.",
      definitionNote:
        "Tier 1 plugins use AssemblyName + EntryPointType to locate the .NET class loaded into the host process. Tier 2 plugins use BaseUrl + FrontendUrl + WebhookUrl to communicate with an external service. Fields for the other tier are left null.",
      codeTitle: "Definición y Versionado de Plugins — Entity Source",
      versionTitle: "Definición y Versionado de Plugins — PluginVersion Entity",
      versionIntro:
        "Represents a specific release version of a PluginDefinition. Tracks version number, bilingual release notes, manifest snapshot, and whether this is the latest active version. Each installation pins to a specific version at install time.",
      versionLifecycleTitle: "Definición y Versionado de Plugins — Version Lifecycle",
      versionLifecycleIntro:
        "When a new version is published, it becomes IsLatest = true and the previous version is demoted to IsLatest = false. Existing installations remain pinned to their installed version until an admin explicitly runs the upgrade command.",
    },
    pluginInstallation: {
      title: "Instalación y Seguridad de Plugins",
      description:
        "PluginInstallation, PluginApiKey y PluginPermissionGrant para despliegue y control de accesos.",
      intro:
        "When a tenant installs a plugin, three core entities are created: a PluginInstallation record tracking deployment state, a PluginApiKey for secure plugin-to-platform API calls, and PluginPermissionGrant records for each platform capability the plugin is allowed to access.",
      installationTitle: "Instalación y Seguridad de Plugins — PluginInstallation Entity",
      installationIntro:
        "Represents a tenant's installation of a specific PluginDefinition at a particular PluginVersion. A tenant can install the same plugin only once — enforced by a unique constraint on (TenantId + PluginDefinitionId).",
      installationNote:
        "ConsecutiveHealthCheckFails is incremented by the plugins-health-check background job on each failed check and reset to 0 when the health check passes again. The Status is automatically transitioned to Error after a configurable failure threshold.",
      lifecycleTitle: "Instalación y Seguridad de Plugins — Installation Lifecycle",
      lifecycleIntro:
        "A PluginInstallation starts in Installing status while the platform provisions resources, then transitions to Active. Admins can deactivate/reactivate it. Persistent health-check failures move it to Error.",
      apiKeyTitle: "Instalación y Seguridad de Plugins — PluginApiKey Entity",
      apiKeyIntro:
        "Represents an API key issued to a plugin installation for authenticating plugin-to-platform API calls. Stores the hashed key value, a human-readable prefix for identification, activation status, and optional expiration.",
      apiKeyWarning:
        "The raw API key value is shown only once at creation time and is never stored — only the hash is persisted. Plugins must store the key securely in their own secrets management system.",
      permGrantTitle: "Instalación y Seguridad de Plugins — PluginPermissionGrant Entity",
      permGrantIntro:
        "Records an explicit permission grant to a plugin installation within a tenant. Each grant authorizes the plugin to access a specific platform capability. Platform admins must explicitly approve each permission during the installation setup wizard.",
    },
    pluginRuntime: {
      title: "Tiempo de Ejecución y Datos de Plugins",
      description:
        "PluginDataStore, PluginExecutionLog y PluginWebhookSubscription para persistencia y auditoría de ejecución.",
      intro:
        "Once a plugin is installed and active, three runtime entities handle its ongoing operation: PluginDataStore for persisting plugin state, PluginExecutionLog for monitoring API call health, and PluginWebhookSubscription for receiving platform events.",
      dataStoreTitle: "Tiempo de Ejecución y Datos de Plugins — PluginDataStore Entity",
      dataStoreIntro:
        "Key-value data store entry scoped to a plugin installation and tenant. Plugins use this to persist arbitrary JSON data organized by namespace and key. Tracks the serialized size for quota enforcement.",
      dataStoreNote:
        "Data isolation is enforced at two levels: the unique constraint on (PluginInstallationId + TenantId + Namespace + Key) prevents collisions, and TenantId is always required to prevent cross-tenant data leakage. Plugins cannot read another tenant's data store entries.",
      execLogTitle: "Tiempo de Ejecución y Datos de Plugins — PluginExecutionLog Entity",
      execLogIntro:
        "Immutable audit log entry recording a single plugin API execution. Captures the HTTP method, endpoint, response status code, duration in milliseconds, and success/failure status. Used for monitoring plugin health and debugging.",
      execLogTip:
        "The plugins-health-check background job queries PluginExecutionLog to compute ConsecutiveHealthCheckFails and update HealthCheckPassing on PluginInstallation. High DurationMs values are flagged as performance warnings.",
      webhookTitle: "PluginWebhookSubscription Entity",
      webhookIntro:
        "Represents a webhook subscription registered by a plugin installation. When the specified platform event type fires, the system dispatches an HTTP POST to the callback URL. Subscriptions can be deactivated (IsActive=false) without deletion.",
      webhookFlowTitle: "Tiempo de Ejecución y Datos de Plugins — Webhook Delivery Flow",
      webhookFlowIntro:
        "The platform uses an outbox pattern for reliable webhook delivery. Events are first written to the outbox, then delivered asynchronously to the plugin's CallbackUrl with exponential backoff retries.",
    },
    marketplaceOverview: {
      title: "Visión General del Marketplace",
      description:
        "El ecosistema SCRIPE de aplicaciones instalables, perfiles de desarrolladores y modelo de 13 entidades.",
      intro:
        "The Marketplace module powers SCRIPE's app ecosystem: developers publish plugins as commercial listings, tenants browse and purchase them, and the platform enforces a multi-stage review pipeline before any app goes live. This page covers the full entity map and the two organizational entities — AppCategory and AppCategoryMapping.",
      infoTitle: "Visión General del Marketplace — Marketplace + Plugins",
      infoContent:
        "The Marketplace module builds on top of the Plugins module. An AppListing is the commercial 'face' of a PluginDefinition. Tenants install the underlying plugin; the marketplace handles discovery, pricing, and payments.",
      featuresTitle: "Visión General del Marketplace — Key Capabilities",
      featurePublish: "App Publishing",
      featurePublishDesc:
        "Developers create AppListings that link PluginDefinitions to a storefront presence with name, tagline, screenshots, and pricing.",
      featureInstall: "One-Click Install",
      featureInstallDesc:
        "Tenants browse the catalog, purchase or trial apps, and trigger plugin installation in a single flow.",
      featureReview: "Ratings & Reviews",
      featureReviewDesc:
        "Users submit 1–5 star ratings with review text. Developers can reply once per review. AverageRating is denormalized on AppListing for fast catalog queries.",
      featurePricing: "Flexible Pricing",
      featurePricingDesc:
        "Six pricing models: Free, PaidOnce, Subscription, Freemium, PerSeat, UsageBased — all configured via AppPricing with trial-day support.",
      featureAnalytics: "Install Analytics",
      featureAnalyticsDesc:
        "Daily AppInstallCount snapshots power developer dashboards showing install trends, growth rates, and active install counts.",
      featureReviewGate: "Submission Review Gate",
      featureReviewGateDesc:
        "Every new version goes through automated scan → manual admin review (AppSubmission + AppReviewTask) before it can be published.",
      entitiesTitle: "Visión General del Marketplace — Domain Entity Map",
      entitiesIntro:
        "The Marketplace module contains 13 domain entities across five functional areas: listings, developer portal, purchases, analytics, and reviews.",
      categoryTitle: "Visión General del Marketplace — AppCategory Entity",
      mappingTitle: "Visión General del Marketplace — AppCategoryMapping Entity",
      mappingIntro:
        "Join entity implementing the many-to-many relationship between AppListing and AppCategory. An app can belong to multiple categories, and a category can contain multiple apps.",
      architectureTitle: "Visión General del Marketplace — Entity Relationship Overview",
      architectureIntro:
        "The diagram below shows how the 13 Marketplace entities relate. DeveloperProfile is the root — it owns AppListings, which are the hub connecting pricing, submissions, purchases, reviews, screenshots, and analytics.",
      categoryIntro:
        "Explore extensiones y módulos complementarios certificados para potenciar su entorno de trabajo.",
    },
    marketplaceListings: {
      title: "Listados de Aplicaciones y Capturas",
      description:
        "AppListing y AppScreenshot para la presencia comercial y galería de imágenes en la tienda.",
      intro:
        "An AppListing is the storefront face of a Plugin. It carries everything a tenant sees in the catalog: name, tagline, icon, version, ratings, and install counts. Screenshots provide the visual gallery on the listing detail page.",
      listingTitle: "Listados de Aplicaciones y Capturas — AppListing Entity",
      listingIntro:
        "The central entity of the Marketplace module. It connects a Plugin to its commercial presence including pricing, reviews, screenshots, and install metrics. AverageRating and ReviewCount are denormalized for query performance and recalculated whenever a review is added or updated.",
      listingNote:
        "AverageRating and ReviewCount are denormalized on AppListing for catalog query performance. They are recalculated atomically by the domain logic every time an AppReview is created, updated, or deleted.",
      codeTitle: "Listados de Aplicaciones y Capturas — Entity Source",
      screenshotTitle: "Listados de Aplicaciones y Capturas — AppScreenshot Entity",
      screenshotIntro:
        "Represents a screenshot image for an app listing's detail page. Screenshots are ordered by SortOrder and displayed in a carousel on the storefront.",
      statusTitle: "Listados de Aplicaciones y Capturas — Listing Status Lifecycle",
      statusIntro:
        "An AppListing moves through several states from first draft to public visibility. The IsPublished flag controls storefront visibility; IsFeatured promotes a listing to the hero section.",
    },
    marketplaceDeveloper: {
      title: "Portal de Desarrolladores",
      description:
        "DeveloperProfile, AppSubmission y DeveloperPayout para registro de desarrolladores y liquidaciones.",
      intro:
        "The developer portal covers everything from registering a developer account to publishing apps and receiving revenue-sharing payouts. Three entities work together: DeveloperProfile (identity and payment details), AppSubmission (version review pipeline), and DeveloperPayout (settlement records).",
      profileTitle: "Portal de Desarrolladores — DeveloperProfile Entity",
      profileIntro:
        "Represents a developer (tenant) registered to publish apps on the marketplace. Each tenant can have at most one developer profile. Admin verification is required before the developer can publish paid apps.",
      profileNote:
        "StripeConnectAccountId links the developer's marketplace earnings to their Stripe Connect account. Payouts are transferred via Stripe's Connect Transfers API. IsVerified must be true before paid listings are accepted.",
      submissionTitle: "Portal de Desarrolladores — AppSubmission Entity",
      submissionIntro:
        "Represents a version submission of an app listing for marketplace review. Each submission goes through a lifecycle: Submitted → InAutomatedScan → InManualReview → Approved/Rejected. Only approved submissions result in the listing being published.",
      payoutTitle: "Portal de Desarrolladores — DeveloperPayout Entity",
      payoutIntro:
        "Records a revenue-sharing payout to a developer for a specific period. Payouts are calculated from purchase commissions and transferred to the developer's Stripe Connect account.",
      onboardingTitle: "Portal de Desarrolladores — Developer Onboarding Flow",
      onboardingIntro:
        "The end-to-end onboarding flow from profile creation to receiving first payout.",
    },
    marketplacePurchases: {
      title: "Compras y Análisis de Aplicaciones",
      description:
        "AppPricing, AppPurchase y AppInstallCount para modelos de precios, transacciones e instalaciones.",
      intro:
        "Purchases and analytics form the commercial backbone of the Marketplace. AppPricing defines how an app is monetized; AppPurchase records each transaction; AppInstallCount provides daily snapshots for developer analytics dashboards.",
      pricingTitle: "Compras y Análisis de Aplicaciones — AppPricing Entity",
      pricingIntro:
        "Defines the pricing configuration for an app listing. One AppPricing record exists per listing (one-to-one relationship). Supports six pricing models.",
      pricingNote:
        "PricingModel options: Free (Price=0, no purchase needed), PaidOnce (single payment, permanent access), Subscription (recurring billing), Freemium (free tier + paid upgrades), PerSeat (price × admin count), UsageBased (metered via Stripe Meters).",
      purchaseTitle: "Compras y Análisis de Aplicaciones — AppPurchase Entity",
      purchaseIntro:
        "Records a purchase transaction when a tenant buys or installs a paid app. Tracks the amount paid, currency, and transaction status for financial reporting and developer payout calculations.",
      installCountTitle: "Compras y Análisis de Aplicaciones — AppInstallCount Entity",
      installCountIntro:
        "Daily snapshot of installation metrics for an app listing. Used by the analytics dashboard to display install trend charts and calculate growth rates over time.",
      installCountTip:
        "AppInstallCount records are created by a nightly background job that calculates NetInstalls (installs - uninstalls) and TotalActiveInstalls from AppPurchase and plugin installation data for each listing.",
      flowTitle: "Compras y Análisis de Aplicaciones — Purchase Flow",
      flowIntro:
        "The end-to-end flow from browsing the catalog to a plugin being installed and analytics being updated.",
    },
    marketplaceReviews: {
      title: "Calificaciones y Reseñas",
      description:
        "AppReview, AppReviewReply y AppReviewTask para valoraciones de usuarios y moderación de contenido.",
      intro:
        "The review system serves two purposes: user-facing ratings and text reviews that appear on listing pages, and the admin review pipeline that gates new app versions before publication.",
      reviewTitle: "Calificaciones y Reseñas — AppReview Entity",
      reviewIntro:
        "Represents a user-submitted rating and review for an app listing. Each tenant user can leave one review per app. Reviews include a 1–5 star rating and optional text content. Developers can reply via AppReviewReply.",
      reviewNote:
        "Each user (UserId) can submit at most one AppReview per AppListing. A unique constraint on (AppListingId, UserId) enforces this at the database level. Updating a review recalculates AverageRating on the parent AppListing.",
      replyTitle: "Calificaciones y Reseñas — AppReviewReply Entity",
      replyIntro:
        "Represents a developer's reply to a user review on their app listing. Each review can have at most one reply from the developer.",
      taskTitle: "Calificaciones y Reseñas — AppReviewTask Entity",
      taskIntro:
        "Represents an admin review task assigned to evaluate an app submission. Tracks the assigned reviewer, current review status (Pending → InProgress → Approved/Rejected/Escalated), and feedback provided to the developer during the review process.",
      moderationTitle: "Calificaciones y Reseñas — Submission Review Pipeline",
      moderationIntro:
        "Every app version submission passes through an automated scan followed by manual admin review before it can be published to the storefront.",
    },
    auditLogs: {
      architectureTitle: "Arquitectura de Auditoría Forense",
      architectureContent:
        "Registro asíncrono e inmutable de eventos críticos, solicitudes web y operaciones sobre la base de datos.",
      entityTitle: "Auditoría de Modificación de Entidades",
      entityContent:
        "Comparación detallada de valores previos y posteriores con sello temporal e identificación de autor.",
      searchTitle: "Motor de Búsqueda y Filtrado de Logs",
      searchContent:
        "Filtrado granular por inquilino, rango de fechas, usuario responsable y tipo de operación.",
      retentionTitle: "Políticas de Retención de Auditoría",
      retentionContent:
        "Archivado y depuración sistemática conforme a normativas vigentes del sector.",
      retentionWarning:
        "Los registros forenses no pueden ser manipulados ni borrados por ningún usuario de la plataforma.",
    },
    tenantPlans: {
      entityNote:
        "Los planes de inquilino se basan en ediciones publicadas y aplican límites y cuotas mediante la canalización CQRS.",
    },
    identityMenuSystem: {
      title: "Sistema de Menús y Navegación de Identidad",
      description:
        "Gestión avanzada de opciones de menú, herencia de permisos y personalizaciones por inquilino.",
      intro:
        "Adapta la estructura de navegación en tiempo real según el rol, los permisos y el contexto corporativo del usuario.",
      menuItemTitle: "Modelo de Elementos de Menú",
      menuItemIntro:
        "Define rutas de destino, iconos, etiquetas traducidas y requisitos de contexto de inquilino.",
      roleMenuItemTitle: "Visibilidad Basada en Roles",
      roleMenuItemIntro:
        "Filtra en el servidor los accesos disponibles de acuerdo con los privilegios asignados.",
      roleMenuItemNote:
        "Los accesos restringidos se eliminan del menú antes de su entrega al navegador del cliente.",
      menuOverrideScopeTitle: "Alcance de Sobrescritura de Menús",
      menuOverrideScopeIntro:
        "Permite cambiar títulos, iconos y orden de navegación a nivel de organización o perfil.",
      menuOverrideScopeNote:
        "Facilita la adaptación de los términos de navegación al vocabulario interno de cada corporación.",
      tenantMenuOverrideTitle: "Menús Personalizados por Organización",
      tenantMenuOverrideIntro:
        "Navegación adaptada a cada empresa preservando la compatibilidad con futuras versiones del sistema.",
      resolutionFlowTitle: "Resolución de la Estructura de Navegación",
      resolutionFlowIntro:
        "Compone el menú definitivo combinando la configuración base con las reglas específicas del inquilino.",
      resolutionNote:
        "La estructura final se almacena en caché de alta velocidad para lograr una navegación instantánea.",
    },
    identityTenantConfig: {
      title: "Configuración Avanzada de Inquilinos",
      description:
        "Gestión de dominios corporativos, asignación de permisos, parámetros del sistema y auditoría de cambios.",
      intro:
        "Panel central para definir el comportamiento, las políticas de seguridad y los parámetros de cada organización.",
      tenantDomainTitle: "Asociación de Dominios Personalizados",
      tenantDomainIntro:
        "Vinculación de dominios propios con provisión automática de certificados SSL y validación CNAME.",
      tenantDomainNote:
        "Admite subdominios y dominios principales independientes para cada espacio empresarial.",
      tenantPermissionTitle: "Asignación Precisa de Permisos",
      tenantPermissionIntro:
        "Delimitación de funcionalidades contratadas según el plan y los paquetes de módulos activos.",
      tenantPermissionNote:
        "Las restricciones se aplican de forma inmediata en las canalizaciones de backend.",
      systemSettingsTitle: "Parámetros Generales de la Organización",
      systemSettingsIntro:
        "Ajuste de pasarelas de correo, husos horarios, caducidad de contraseñas y duración de sesiones.",
      systemSettingsNote:
        "Los valores predeterminados del sistema se heredan y pueden personalizarse según las necesidades operativas.",
      settingsAuditLogTitle: "Registro de Auditoría de Configuraciones",
      settingsAuditLogIntro:
        "Histórico completo de modificaciones en los parámetros del sistema con identificación del administrador.",
      settingsAuditLogWarning:
        "Los cambios en parámetros de seguridad o enrutamiento de dominios se catalogan como eventos críticos.",
    },
    identityThemesWorkspace: {
      title: "Personalización Visual y Espacios de Trabajo",
      description:
        "Gestión de temas visuales, pantallas de acceso, favoritos, espacios fijados y plantillas de panel.",
      intro:
        "Permite configurar la estética y los escritorios de trabajo para reforzar la identidad corporativa de la entidad.",
      loginThemePurchaseTitle: "Catálogo de Temas de Inicio de Sesión",
      loginThemePurchaseIntro:
        "Selección de diseños modernos para las pantallas de acceso de colaboradores y clientes.",
      loginThemePurchaseNote:
        "Los temas elegidos se despliegan de inmediato en el dominio asignado a la empresa.",
      tenantThemeFavoriteTitle: "Temas Preferidos por la Empresa",
      tenantThemeFavoriteIntro:
        "Almacenamiento de paletas de color institucionales para transiciones de imagen rápidas.",
      themeApplyLogTitle: "Historial de Cambios de Diseño",
      themeApplyLogIntro:
        "Registro pormenorizado de las modificaciones estéticas aplicadas en el entorno.",
      workspaceTitle: "Gestión de Espacios de Trabajo",
      workspaceIntro:
        "Organización de escritorios, paneles y accesos directos para agilizar el trabajo diario.",
      adminWorkspacePinTitle: "Fijación Rápida de Espacios",
      adminWorkspacePinIntro:
        "Anclaje de organizaciones de uso frecuente en la barra de herramientas principal.",
      adminWorkspacePinNote:
        "Optimiza la supervisión simultánea de múltiples sedes o divisiones por parte de la administración.",
      dashboardPresetTitle: "Plantillas de Panel Prediseñadas",
      dashboardPresetIntro:
        "Configuraciones predeterminadas de indicadores e informes asignables según el cargo del usuario.",
    },
  },
};

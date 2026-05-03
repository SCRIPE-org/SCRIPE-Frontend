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
        "El módulo de Derechos (Entitlements) es el motor de gestión de planes y funciones de NEXORA. Define qué capacidades obtiene cada inquilino (tenant), cómo los planes (ediciones) agrupan esas capacidades y cómo las suscripciones vinculan a los inquilinos con los planes.",
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
        "NEXORA integra los derechos directamente en la pipeline CQRS de MediatR a través de FeatureCheckBehavior. Los comandos y consultas que implementan IRequireFeature se controlan automáticamente: si el valor de la función resuelta del inquilino está desactivado, la solicitud se rechaza antes de llegar al manejador.",
      pipelineTip:
        "Para restringir un comando detrás de una función, simplemente implemente IRequireFeature y establezca RequiredFeatureName en la clave de sistema estable de la función (ej. 'Chat.Enabled'). No se necesita código adicional.",
      backendTitle: "Estructura del Backend",
      backendIntro:
        "El backend de Derechos sigue el diseño estándar de módulos de Arquitectura Limpia de NEXORA con capas de Dominio, Aplicación e Infraestructura.",
      frontendTitle: "Estructura del Frontend",
      frontendIntro:
        "El frontend refleja el backend con cuatro submódulos (ediciones, funciones, suscripciones, sobreescrituras), cada uno siguiendo el patrón SOLID View/ViewModel.",
      controllersTitle: "Controladores API",
      controllersIntro:
        "El módulo de Derechos expone 31 puntos de conexión (endpoints) API a través de 4 controladores, todos autenticados con JWT y protegidos por autorización basada en permisos.",
      noOpTitle: "Fallback NoOp",
      noOpIntro:
        "Cuando el módulo de Derechos no está cargado (por ejemplo, en un microservicio que no incluye Derechos), NEXORA registra un NoOpFeatureCache. Esto permite que los comandos IRequireFeature pasen sin errores: todas las funciones se tratan como habilitadas de forma predeterminada.",
      noOpNote:
        "El fallback NoOp garantiza que los módulos puedan usar IRequireFeature sin una fuerte dependencia del módulo de Derechos. En el modo monolito de producción, el FeatureCache real siempre está disponible.",
      contextAwareTitle: "Alcance Contextual",
      contextAwareIntro:
        "Todas las páginas de Derechos (Funciones, Ediciones, Permisos) son contextuales. El frontend detecta si el usuario es un administrador del sistema (tenantId es null), un administrador de inquilino o está en modo drill-down, y llama a diferentes endpoints del backend en consecuencia. Los administradores del sistema ven el catálogo completo con CRUD; los administradores de inquilinos ven solo sus datos efectivos en modo de solo lectura.",
      resolutionTip:
        "La cadena de resolución se evalúa de forma diferida (lazy): los valores se almacenan en caché después de la primera resolución y se invalidan cuando cambian las suscripciones, las ediciones o las sobreescrituras.",
      cqrsMapTitle: "Mapa de Comandos y Consultas CQRS",
      cqrsMapIntro:
        "El módulo de Derechos registra 31 manejadores MediatR que abarcan los cuatro dominios. Cada comando tiene un validador FluentValidation correspondiente para la validación de entrada.",
      diTitle: "Registro de Inyección de Dependencias",
      diIntro:
        "Todos los servicios de Derechos se registran a través del método de extensión AddEntitlementsModule en DependencyInjection.cs. El módulo sigue el patrón de registro estándar de NEXORA.",
      comparisonTitle: "Con vs Sin Derechos",
      comparisonIntro:
        "La siguiente tabla muestra la diferencia de capacidades cuando el módulo de Derechos está habilitado frente a cuando se ejecuta sin él:",
      gettingStartedTitle: "Primeros Pasos",
      gettingStartedIntro:
        "Siga estos 5 pasos para configurar el sistema de Derechos para su plataforma. Cada paso se basa en el anterior:",
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
        "NEXORA ofrece dos formas de actualizar las funciones de la edición, cada una adecuada para diferentes escenarios:",
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
        "NEXORA admite dos tipos de ediciones: las ediciones del Sistema, creadas por administradores de la plataforma y visibles para todos los inquilinos, y las ediciones Minoristas, creadas por inquilinos revendedores solo para sus inquilinos secundarios.",
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
        "NEXORA distingue entre funciones del sistema (creadas al inicio, de solo lectura) y funciones personalizadas (creadas por los administradores a través de la API):",
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
    },

    compliance: {
      overview: {
        title: "[ES] Compliance Module",
        description: "[ES] GDPR, CCPA, and PDPA compliance automation — regulations, DSR handling, consent management, data retention, inventory, and report generation.",
        intro: "[ES] The Compliance module is NEXORA's built-in regulatory compliance engine. It helps platform operators and their tenants stay compliant with major data protection laws (GDPR, CCPA, PDPA) through automated tools for managing data subject requests, consent records, retention policies, and generating audit-ready compliance reports.",
        infoTitle: "[ES] Compliance Notice",
        infoContent: "[ES] The Compliance module is critical for maintaining regulatory adherence and avoiding fines. Ensure all features are correctly mapped to data processing policies.",
        descDsr: "[ES] Handles Subject Requests (Export, Erasure, Rectification)",
        descConsent: "[ES] Immutable tracking of consent states & snapshots",
        descRet: "[ES] Enforces data destruction policies based on age",
        descInv: "[ES] Maps sensitive PII locations across modules",
        descRep: "[ES] Generates RoPA and DPIA compliance reports",
        descId: "[ES] Identity Module",
        descIdDesc: "[ES] Provides User/Admin context & Auth",
        descEnt: "[ES] Entitlements Module",
        descEntDesc: "[ES] Feature-gates compliance capabilities",
        conn1: "[ES] initiates requests",
        conn2: "[ES] grants/revokes",
        conn3: "[ES] gates policies",
        conn4: "[ES] guides erasure",
        conn5: "[ES] targets data",
        conn6: "[ES] audit trails",
        conn7: "[ES] audit trails",
        th1: "[ES] Component",
        th2: "[ES] Responsibility",
        tr1_1: "[ES] DsrListViewModel",
        tr1_2: "[ES] Handles the pagination, filtering, and assignment of incoming Data Subject Requests.",
        tr2_1: "[ES] ConsentRecordView",
        tr2_2: "[ES] Renders the immutable consent snapshot alongside user agent and timestamp metadata.",
        whatIsTitle: "[ES] What is the Compliance Module?",
        whatIsIntro: "[ES] The Compliance module provides six interconnected sub-systems that cover the full compliance lifecycle. Instead of building compliance tooling from scratch, NEXORA tenants get a production-ready system that tracks, automates, and reports on their data protection obligations.",
        subModulesTitle: "[ES] Six Sub-Systems",
        subModulesIntro: "[ES] Each sub-system handles a specific compliance domain:",
        sub1: "[ES] Regulation Profiles — Stores the regulatory frameworks (GDPR, CCPA, PDPA) that the platform operates under.",
        sub2: "[ES] Data Subject Requests (DSR) — Manages rights requests from data subjects (export, erasure, rectification, restriction).",
        sub3: "[ES] Consent Management — Records, tracks, and audits user consent grants and withdrawals.",
        sub4: "[ES] Data Retention Policies — Defines how long data is kept and what happens when it expires (delete or anonymize).",
        sub5: "[ES] Data Inventory — A registry of all personal data categories the platform processes.",
        sub6: "[ES] Compliance Reports — Generates async audit-ready reports (GDPR Overview, DSR Summary, Consent Audit, etc.).",
        backendTitle: "[ES] Backend Architecture",
        backendIntro: "[ES] The Compliance backend follows the standard NEXORA 3-project module layout (Domain / Application / Infrastructure) with a dedicated ComplianceDbContext and ComplianceController.",
        frontendTitle: "[ES] Frontend Architecture",
        frontendIntro: "[ES] The frontend is organized as six independent sub-modules under src/modules/compliance/, each with its own domain, data, and presentation layers following the View/ViewModel pattern.",
        endpointsTitle: "[ES] API Endpoints Overview",
        endpointsIntro: "[ES] All endpoints are under /api/v1/compliances/ and require authentication with the compliance.view permission.",
      },
      dsr: {
        title: "[ES] Data Subject Requests (DSR)",
        description: "[ES] Manage GDPR/CCPA rights requests — export, erasure, rectification, and restriction — with full lifecycle tracking.",
        intro: "[ES] Data Subject Requests (DSRs) are formal requests from individuals exercising their rights under data protection laws. The Compliance module provides a complete DSR workflow: submission, assignment, processing, and closure — with full audit trail and SLA tracking.",
        typesTitle: "[ES] Request Types",
        typesIntro: "[ES] The system supports four DSR types as defined by GDPR Article 17 and CCPA:",
        type1: "[ES] Export — Data portability request. The subject wants a copy of their personal data.",
        type2: "[ES] Erasure — Right to be forgotten. All personal data must be deleted or anonymized.",
        type3: "[ES] Rectification — Correction request. Inaccurate personal data must be updated.",
        type4: "[ES] Restriction — Processing restriction. Data can be retained but not actively processed.",
        lifecycleTitle: "[ES] Request Lifecycle",
        lifecycleIntro: "[ES] DSRs move through a defined set of statuses from submission to closure:",
        status1: "[ES] Pending — Initial state when the request is received.",
        status2: "[ES] InProgress — A compliance officer has been assigned and is processing the request.",
        status3: "[ES] Completed — The request has been fulfilled (data exported, erased, corrected, or restricted).",
        status4: "[ES] Rejected — The request was rejected (e.g. insufficient identity verification).",
        slasTitle: "[ES] GDPR SLA Requirements",
        slasIntro: "[ES] Under GDPR Article 12, data controllers must respond to DSRs within 30 days (extendable to 3 months for complex requests). NEXORA tracks the submission date for each DSR to help you meet these deadlines.",
        lifecycleFlowTitle: "[ES] DSR Lifecycle Flow",
        nodeSubmit: "[ES] Submit Request",
        descSubmit: "[ES] Subject requests Export, Erasure, or Rectification",
        nodePending: "[ES] Status: Pending",
        descPending: "[ES] Request is logged, SLA deadline calculated",
        nodeProcessing: "[ES] Status: Processing",
        descProcessing: "[ES] DsrExecutionJob begins processing modules via ISuspendableModule",
        nodeApproval: "[ES] Wait For Admin",
        descApproval: "[ES] Nuclear actions (Erasure) require manual admin confirmation",
        nodeCompleted: "[ES] Status: Completed",
        descCompleted: "[ES] Export generated or data erased; SLA fulfilled",
        nodeRejected: "[ES] Status: Rejected",
        descRejected: "[ES] Request denied by admin with resolution notes",
        conn1: "[ES] initiates",
        conn2: "[ES] background job picks up",
        conn3: "[ES] if auto-processed (Export)",
        conn4: "[ES] if nuclear (Erasure)",
        conn5: "[ES] admin confirms",
        conn6: "[ES] admin rejects",
        entitiesTitle: "[ES] Entities",
        entityName: "[ES] Entity Name",
        entityDesc: "[ES] Description",
        entityDsrDesc: "[ES] Represents a data subject request.",
        entityModuleDesc: "[ES] Execution state of a module.",
        entityStatusDesc: "[ES] History of status changes.",
        codeTitle: "[ES] Code Example",
        endpointsTitle: "[ES] API Endpoints",
        endpointsIntro: "[ES] The DSR controller exposes 6 endpoints for the full DSR lifecycle:",
        ep: {
          list: "[ES] List all DSRs (paginated, filterable by status/type/regulation)",
          get: "[ES] Get DSR details by ID",
          create: "[ES] Submit a new DSR",
          updateStatus: "[ES] Update DSR status (InProgress, Completed, Rejected)",
          assign: "[ES] Assign DSR to a compliance officer",
          delete: "[ES] Soft-delete a DSR",
        },
      },
      consent: {
        title: "[ES] Consent Management",
        description: "[ES] Record, track, and audit user consent grants and withdrawals for GDPR Article 6 and CCPA compliance.",
        intro: "[ES] Consent Management records every time a user grants or withdraws consent for a specific purpose (e.g. marketing emails, analytics tracking). NEXORA stores the full consent audit trail including timestamp, IP address, user agent, and the exact consent version shown.",
        purposesTitle: "[ES] Consent Purposes",
        purposesIntro: "[ES] Each consent record is tied to a specific purpose. Common purposes include:",
        purpose1: "[ES] Marketing — Email marketing and promotional communications.",
        purpose2: "[ES] Analytics — Usage analytics and product improvement.",
        purpose3: "[ES] ThirdParty — Sharing data with third-party services.",
        purpose4: "[ES] Personalization — Personalized content and recommendations.",
        gdprTitle: "[ES] GDPR Lawful Basis",
        gdprIntro: "[ES] Under GDPR Article 6, consent must be: freely given, specific, informed, and unambiguous. NEXORA records the exact consent text version shown to the user and the timestamp it was accepted, providing a legally defensible audit trail.",
        withdrawalTitle: "[ES] Consent Withdrawal",
        withdrawalIntro: "[ES] Users can withdraw consent at any time. When consent is withdrawn, the ConsentRecord is updated with WithdrawnAt timestamp. Downstream systems should be notified via domain events to stop processing data for the withdrawn purpose.",
        flowTitle: "[ES] Consent State Flow",
        nodePurpose: "[ES] Consent Purpose",
        descPurpose: "[ES] Defines what is being consented to (e.g. Marketing)",
        nodeRecord: "[ES] Consent Record",
        descRecord: "[ES] User's current state (Granted/Revoked) per purpose",
        nodeSnapshot: "[ES] Consent Snapshot",
        descSnapshot: "[ES] Immutable point-in-time capture of consent grant/revoke",
        nodeJob: "[ES] Consent Expiry Job",
        descJob: "[ES] Daily job revokes expired consents",
        conn1: "[ES] templates",
        conn2: "[ES] generates on change",
        conn3: "[ES] auto-revokes if expired",
        immutabilityTitle: "[ES] Immutability",
        immutabilityIntro: "[ES] Consent records are immutable and track integrity.",
        endpointsTitle: "[ES] API Endpoints",
        ep: {
          list: "[ES] List all consent records (paginated, filterable by purpose/status)",
          get: "[ES] Get consent record by ID",
          record: "[ES] Record a new consent grant",
          withdraw: "[ES] Withdraw a previously granted consent",
        },
      },
      retention: {
        title: "[ES] Data Retention Policies",
        description: "[ES] Define data retention periods and automated expiry actions (Delete or Anonymize) for GDPR Article 5(1)(e) compliance.",
        intro: "[ES] Data Retention Policies define how long specific categories of data must be kept and what happens when the retention period expires. NEXORA enforces these policies automatically via background jobs, removing the manual overhead of managing data lifecycles.",
        policiesTitle: "[ES] Policy Configuration",
        policiesIntro: "[ES] Each retention policy specifies:",
        field1: "[ES] DataCategory — The type of data (e.g. 'User Profiles', 'Transaction Logs', 'Consent Records').",
        field2: "[ES] RetentionDays — How many days the data must be retained.",
        field3: "[ES] ExpiryAction — What happens when the period expires: Delete or Anonymize.",
        field4: "[ES] RegulationCode — Which regulation requires this retention period (GDPR, CCPA, etc.).",
        actionsTitle: "[ES] Expiry Actions",
        actionsIntro: "[ES] When a retention period expires, NEXORA applies one of two actions:",
        action1: "[ES] Delete — Permanently removes all records matching the data category.",
        action2: "[ES] Anonymize — Replaces personally identifiable information with pseudonymous tokens, preserving aggregate analytics data.",
        automationTitle: "[ES] Automated Enforcement",
        automationIntro: "[ES] The RetentionEnforcementJob runs daily at 3:00 AM UTC, scanning all active retention policies and applying the configured expiry action to eligible records. Each enforcement run creates a RetentionExecution audit record.",
        nodePolicy: "[ES] Retention Policy",
        descPolicy: "[ES] Defines entity type, age limit, and destruction strategy",
        nodeEnforcement: "[ES] Retention Enforcement Job",
        descEnforcement: "[ES] Weekly job to evaluate policies",
        nodeExecution: "[ES] Retention Execution",
        descExecution: "[ES] Audit trail of the destruction action",
        nodeAction: "[ES] Data Destruction",
        descAction: "[ES] Hard deletion or Anonymization via ISuspendableModule",
        conn1: "[ES] scanned by",
        conn2: "[ES] triggers",
        conn3: "[ES] logs",
        endpointsTitle: "[ES] API Endpoints",
        ep: {
          list: "[ES] List all retention policies",
          executions: "[ES] List enforcement execution history",
          update: "[ES] Update a retention policy (days, action, active status)",
        },
      },
      inventory: {
        title: "[ES] Data Inventory",
        description: "[ES] A registry of all personal data categories the platform processes — required for GDPR Article 30 Records of Processing Activities (RoPA).",
        intro: "[ES] The Data Inventory is a structured registry of all personal data categories that the platform processes. Under GDPR Article 30, controllers must maintain Records of Processing Activities (RoPA) — the Data Inventory is NEXORA's implementation of this requirement.",
        fieldsTitle: "[ES] Inventory Fields",
        fieldsIntro: "[ES] Each inventory item documents:",
        field1: "[ES] DataCategory — Human-readable name of the data category (e.g. 'Email Addresses', 'Payment Information').",
        field2: "[ES] LegalBasis — The GDPR lawful basis for processing (Consent, Contract, Legal Obligation, Vital Interests, Public Task, Legitimate Interests).",
        field3: "[ES] DataSubjects — Who the data belongs to (e.g. 'End users', 'Employees', 'Customers').",
        field4: "[ES] ProcessingPurpose — Why the data is processed (e.g. 'Order fulfillment', 'Marketing', 'Legal compliance').",
        field5: "[ES] StorageLocation — Where the data is stored (country/region for cross-border transfer compliance).",
        field6: "[ES] RetentionPeriod — How long the data is retained (linked to the retention policy).",
        field7: "[ES] ThirdPartySharing — Whether the data is shared with third parties and which ones.",
        ropaTitle: "[ES] Article 30 Compliance",
        ropaIntro: "[ES] Organizations with 250+ employees or processing high-risk data must maintain a RoPA under GDPR Article 30. NEXORA's Data Inventory serves as a live, queryable RoPA that can be exported for regulatory inspections.",
        endpointsTitle: "[ES] API Endpoints",
        ep: {
          list: "[ES] List all data inventory items (paginated, searchable)",
          get: "[ES] Get item by ID",
          create: "[ES] Add a new data category to the inventory",
          update: "[ES] Update an existing inventory item",
          delete: "[ES] Remove an item from the inventory",
        },
      },
      reports: {
        title: "[ES] Compliance Reports",
        description: "[ES] Generate async audit-ready compliance reports (GDPR Overview, DSR Summary, Consent Audit, Retention Analysis, Data Inventory Export).",
        intro: "[ES] Compliance Reports are asynchronously generated documents that provide audit-ready summaries of your compliance posture. Reports are generated in the background and stored for download once ready, supporting regulatory inspections, internal audits, and executive reporting.",
        reportTypesTitle: "[ES] Report Types",
        reportTypesIntro: "[ES] Five report types are available:",
        type1: "[ES] GDPR Overview — High-level summary of GDPR compliance status across all sub-modules.",
        type2: "[ES] DSR Activity Summary — Statistics on DSR volume, types, completion rates, and SLA adherence.",
        type3: "[ES] Consent Audit — Full log of consent grants and withdrawals by purpose and time period.",
        type4: "[ES] Retention Analysis — Current enforcement status of all active retention policies.",
        type5: "[ES] Data Inventory Export — Full export of the data inventory (Article 30 RoPA).",
        asyncTitle: "[ES] Asynchronous Generation",
        asyncIntro: "[ES] Reports are generated asynchronously to avoid blocking HTTP requests for large datasets. When you request a report, the system immediately creates a ComplianceReport record with IsReady=false and queues the generation job. Poll the reports list to check when IsReady becomes true.",
        asyncTip: "[ES] Use the Refresh button in the Reports UI to poll for report readiness. Reports typically complete within 30–60 seconds for datasets up to 10,000 records.",
        downloadTitle: "[ES] Downloading Reports",
        downloadIntro: "[ES] Once a report is ready (IsReady=true), a DownloadUrl is available. The download endpoint serves the report file securely. Report files are retained for 90 days before automatic cleanup.",
        endpointsTitle: "[ES] API Endpoints",
        ep: {
          list: "[ES] List all compliance reports (paginated, filterable by type/status)",
          get: "[ES] Get report details and download URL by ID",
          generate: "[ES] Queue a new report generation job",
          download: "[ES] Download the generated report file",
        },
      },
    },
  },
};

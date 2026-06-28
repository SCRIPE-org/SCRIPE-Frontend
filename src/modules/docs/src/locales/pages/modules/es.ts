// FILE-EXCEPTION: file length
/**
 * Docs page locale â€” ES
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const es = {
  modules: {
    entitlementsOverview: {
      title: "Resumen de Derechos",
      description:
        "Control de acceso a funciones basado en ediciones mediante Funciones, Ediciones, Suscripciones y Sobreescrituras por inquilino.",
      intro:
        "El mÃ³dulo de Derechos (Entitlements) es el motor de gestiÃ³n de planes y funciones de SCRIPE. Define quÃ© capacidades obtiene cada inquilino (tenant), cÃ³mo los planes (ediciones) agrupan esas capacidades y cÃ³mo las suscripciones vinculan a los inquilinos con los planes.",
      whatIsTitle: "Â¿QuÃ© son los Derechos?",
      whatIsIntro:
        "Derechos es el mÃ³dulo responsable de controlar a quÃ© funciones puede acceder un inquilino en funciÃ³n de su ediciÃ³n (plan) suscrita. Proporciona una cadena de resoluciÃ³n de tres niveles: Valores predeterminados de la funciÃ³n â†’ Valores de la ediciÃ³n â†’ Sobreescrituras por inquilino, lo que garantiza la mÃ¡xima flexibilidad tanto para los operadores de la plataforma como para los inquilinos revendedores.",
      architectureTitle: "Arquitectura",
      architectureIntro:
        "El sistema de Derechos estÃ¡ compuesto por cuatro dominios interconectados que trabajan juntos para proporcionar una soluciÃ³n completa de control de funciones.",
      domainsTitle: "Cuatro Dominios",
      domainsIntro: "Cada dominio maneja un aspecto especÃ­fico del ciclo de vida de los derechos:",
      resolutionTitle: "Cadena de ResoluciÃ³n de Valores de Funciones",
      resolutionIntro:
        "Cuando el sistema necesita determinar un valor de funciÃ³n para un inquilino, sigue una estricta cadena de prioridad. Gana la fuente de mayor prioridad que proporciona un valor.",
      pipelineTitle: "IntegraciÃ³n de la Pipeline",
      pipelineIntro:
        "SCRIPE integra los derechos directamente en la pipeline CQRS de SCRIPE mediator a travÃ©s de FeatureCheckBehavior. Los comandos y consultas que implementan IRequireFeature se controlan automÃ¡ticamente: si el valor de la funciÃ³n resuelta del inquilino estÃ¡ desactivado, la solicitud se rechaza antes de llegar al manejador.",
      pipelineTip:
        "Para restringir un comando detrÃ¡s de una funciÃ³n, simplemente implemente IRequireFeature y establezca RequiredFeatureName en la clave de sistema estable de la funciÃ³n (ej. 'Chat.Enabled'). No se necesita cÃ³digo adicional.",
      backendTitle: "Estructura del Backend",
      backendIntro:
        "El backend de Derechos sigue el diseÃ±o estÃ¡ndar de mÃ³dulos de Arquitectura Limpia de SCRIPE con capas de Dominio, AplicaciÃ³n e Infraestructura.",
      frontendTitle: "Estructura del Frontend",
      frontendIntro:
        "El frontend refleja el backend con cuatro submÃ³dulos (ediciones, funciones, suscripciones, sobreescrituras), cada uno siguiendo el patrÃ³n SOLID View/ViewModel.",
      controllersTitle: "Controladores API",
      controllersIntro:
        "El mÃ³dulo de Derechos expone 31 puntos de conexiÃ³n (endpoints) API a travÃ©s de 4 controladores, todos autenticados con JWT y protegidos por autorizaciÃ³n basada en permisos.",
      noOpTitle: "Fallback NoOp",
      noOpIntro:
        "Cuando el mÃ³dulo de Derechos no estÃ¡ cargado (por ejemplo, en un microservicio que no incluye Derechos), SCRIPE registra un NoOpFeatureCache. Esto permite que los comandos IRequireFeature pasen sin errores: todas las funciones se tratan como habilitadas de forma predeterminada.",
      noOpNote:
        "El fallback NoOp garantiza que los mÃ³dulos puedan usar IRequireFeature sin una fuerte dependencia del mÃ³dulo de Derechos. En el modo monolito de producciÃ³n, el FeatureCache real siempre estÃ¡ disponible.",
      contextAwareTitle: "Alcance Contextual",
      contextAwareIntro:
        "Todas las pÃ¡ginas de Derechos (Funciones, Ediciones, Permisos) son contextuales. El frontend detecta si el usuario es un administrador del sistema (tenantId es null), un administrador de inquilino o estÃ¡ en modo drill-down, y llama a diferentes endpoints del backend en consecuencia. Los administradores del sistema ven el catÃ¡logo completo con CRUD; los administradores de inquilinos ven solo sus datos efectivos en modo de solo lectura.",
      resolutionTip:
        "La cadena de resoluciÃ³n se evalÃºa de forma diferida (lazy): los valores se almacenan en cachÃ© despuÃ©s de la primera resoluciÃ³n y se invalidan cuando cambian las suscripciones, las ediciones o las sobreescrituras.",
      cqrsMapTitle: "Mapa de Comandos y Consultas CQRS",
      cqrsMapIntro:
        "El mÃ³dulo de Derechos registra 31 manejadores SCRIPE mediator que abarcan los cuatro dominios. Cada comando tiene un validador FluentValidation correspondiente para la validaciÃ³n de entrada.",
      diTitle: "Registro de InyecciÃ³n de Dependencias",
      diIntro:
        "Todos los servicios de Derechos se registran a travÃ©s del mÃ©todo de extensiÃ³n AddEntitlementsModule en DependencyInjection.cs. El mÃ³dulo sigue el patrÃ³n de registro estÃ¡ndar de SCRIPE.",
      comparisonTitle: "Con vs Sin Derechos",
      comparisonIntro:
        "La siguiente tabla muestra la diferencia de capacidades cuando el mÃ³dulo de Derechos estÃ¡ habilitado frente a cuando se ejecuta sin Ã©l:",
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
        "Planes de suscripciÃ³n con nombre, paquetes de funciones, polÃ­ticas de desbordamiento, versionado y estrategias de implementaciÃ³n.",
      intro:
        "Las Ediciones son planes con nombre (ej. BÃ¡sico, Pro, Enterprise) que agrupan valores de funciones. Cada inquilino se suscribe a una ediciÃ³n, lo que determina su acceso a las funciones. Las ediciones admiten el control de versiones con estrategias de implementaciÃ³n controladas para un despliegue seguro de los cambios.",
      entityTitle: "Entidad de EdiciÃ³n",
      entityIntro:
        "Una EdiciÃ³n es un plan con nombre que agrupa valores de funciones. Las ediciones del sistema son creadas por los administradores de la plataforma; las ediciones minoristas (retail) son creadas por los inquilinos revendedores para sus inquilinos secundarios.",
      overflowTitle: "PolÃ­tica de Desbordamiento (Overflow Policy)",
      overflowIntro:
        "Cuando un inquilino baja a una ediciÃ³n con lÃ­mites inferiores (downgrade), sus recursos existentes pueden superar los nuevos lÃ­mites. La PolÃ­tica de Desbordamiento determina quÃ© sucede:",
      featuresTitle: "Funciones de la EdiciÃ³n",
      featuresIntro:
        "Cada ediciÃ³n contiene un conjunto de registros EditionFeature que mapean las funciones a sus valores dentro de ese plan. Las funciones que no se establecen explÃ­citamente en una ediciÃ³n recurren al valor de Feature.DefaultValue.",
      versionsTitle: "Versiones de la EdiciÃ³n",
      versionsIntro:
        "Las Versiones de la EdiciÃ³n proporcionan un sistema de versionado e implementaciÃ³n para los cambios en las funciones. En lugar de modificar las funciones directamente, los administradores pueden crear una nueva versiÃ³n (instantÃ¡nea), elegir una estrategia de implementaciÃ³n y publicarla.",
      rolloutTitle: "Estrategias de ImplementaciÃ³n",
      rolloutIntro:
        "Al publicar una versiÃ³n de ediciÃ³n, los administradores eligen cÃ³mo se implementan los cambios en los inquilinos suscritos:",
      workflowTitle: "Aplicar Ahora vs Guardar como VersiÃ³n",
      workflowIntro:
        "SCRIPE ofrece dos formas de actualizar las funciones de la ediciÃ³n, cada una adecuada para diferentes escenarios:",
      workflowTip:
        "Utilice 'Aplicar Ahora' para correcciones urgentes y pequeÃ±os cambios. Utilice 'Guardar como VersiÃ³n' para actualizaciones importantes del plan que necesiten una implementaciÃ³n gradual y un registro de auditorÃ­a.",
      endpointsTitle: "Puntos de ConexiÃ³n API (Endpoints)",
      endpointsIntro:
        "El controlador de Ediciones expone 11 endpoints para gestionar las ediciones, sus funciones y el ciclo de vida de las versiones:",
      drillDownTitle: "Comportamiento de Drill-Down",
      drillDownIntro:
        "Cuando un administrador del sistema hace drill-down en un inquilino, la lista de ediciones se limita automÃ¡ticamente a mostrar solo las ediciones visibles para ese inquilino. El backend usa el encabezado X-Tenant-Context para filtrar: ediciones del sistema + ediciones minoristas creadas por el inquilino en drill-down. El frontend oculta las acciones CRUD en el modo drill-down.",
      scopingTitle: "Ediciones del Sistema vs Minoristas (Retail)",
      scopingIntro:
        "SCRIPE admite dos tipos de ediciones: las ediciones del Sistema, creadas por administradores de la plataforma y visibles para todos los inquilinos, y las ediciones Minoristas, creadas por inquilinos revendedores solo para sus inquilinos secundarios.",
      scopingNote:
        "Los administradores de inquilinos solo ven las ediciones del sistema mÃ¡s sus propias ediciones minoristas. Esto garantiza el aislamiento de la ediciÃ³n entre los inquilinos revendedores.",
      featuresTip:
        "Las funciones no establecidas explÃ­citamente en una ediciÃ³n recurren a Feature.DefaultValue. Solo necesita configurar las funciones que difieren del valor predeterminado global.",
      endpointsList: "Listar todas las ediciones (paginado, filtrable)",
      endpointsGet: "Obtener detalles de la ediciÃ³n por ID",
      endpointsCreate: "Crear una nueva ediciÃ³n",
      endpointsUpdate: "Actualizar metadatos de la ediciÃ³n",
      endpointsDelete: "Eliminado lÃ³gico (soft-delete) de una ediciÃ³n",
      endpointsGetFeatures: "Listar las funciones configuradas para esta ediciÃ³n",
      endpointsSetFeatures: "Establecer/actualizar funciones para esta ediciÃ³n",
      endpointsDirectApply: "Aplicar cambios de funciones inmediatamente (sin versionado)",
      endpointsGetVersions: "Listar todas las versiones para esta ediciÃ³n",
      endpointsCreateVersion: "Crear una nueva versiÃ³n borrador con una instantÃ¡nea de funciones",
      endpointsPublishVersion:
        "Publicar una versiÃ³n borrador con la estrategia de implementaciÃ³n elegida",
      seededTitle: "Ediciones del sistema preconfiguradas",
      seededIntro:
        "La plataforma inicializa dos ediciones estándar del sistema al arrancar mediante EditionSeeder, estableciendo los límites por defecto.",
    },
    subscriptions: {
      title: "Suscripciones",
      description:
        "VinculaciÃ³n de inquilinos a ediciones con gestiÃ³n completa del ciclo de vida, precios multidivisa, promociones, pruebas, descensos de plan (downgrades), comportamiento de expiraciÃ³n y exportaciÃ³n analÃ­tica avanzada.",
      intro:
        "Las suscripciones vinculan a los inquilinos con las ediciones (planes). Cada inquilino tiene una suscripciÃ³n base que determina su ediciÃ³n y, opcionalmente, suscripciones complementarias para capacidades adicionales. El sistema de suscripciÃ³n maneja todo el ciclo de vida, desde la asignaciÃ³n hasta la renovaciÃ³n, el descenso de plan, la suspensiÃ³n y la cancelaciÃ³n â€” con precios multidivisa integrados y seguimiento de descuentos promocionales.",
      entityTitle: "Entidad de SuscripciÃ³n",
      entityIntro:
        "Una TenantSubscription vincula a un inquilino a una ediciÃ³n con seguimiento del ciclo de vida. Admite mÃºltiples tipos de suscripciÃ³n y estados para una gestiÃ³n completa del ciclo de vida.",
      typesTitle: "Tipos de SuscripciÃ³n",
      typesIntro:
        "Cada suscripciÃ³n tiene un tipo que determina su ciclo de facturaciÃ³n y comportamiento:",
      lifecycleTitle: "Ciclo de Vida del Estado",
      lifecycleIntro: "Las suscripciones pasan por una serie de estados durante su ciclo de vida:",
      downgradeTitle: "Seguimiento de Descenso de Plan (Downgrade)",
      downgradeIntro:
        "Cuando se baja de plan a un inquilino (ya sea manualmente o por expiraciÃ³n), el sistema rastrea los detalles de la suscripciÃ³n original para auditorÃ­a y posible restauraciÃ³n. Los campos DowngradedFromEditionId, DowngradedFromType, DowngradedFromEndDate y DowngradedAt conservan el historial completo del downgrade.",
      downgradeWarning:
        "Al bajar de plan, la PolÃ­tica de Desbordamiento de la ediciÃ³n de destino determina quÃ© sucede con los recursos que exceden los nuevos lÃ­mites. Utilice siempre el endpoint de Impacto del Downgrade para previsualizar los efectos antes de realizar cambios.",
      expiryTitle: "Comportamiento de ExpiraciÃ³n",
      expiryIntro:
        "Cuando expira una suscripciÃ³n, la configuraciÃ³n ExpiryBehavior determina quÃ© sucede a continuaciÃ³n:",
      pricingTitle: "Precios Multidivisa",
      pricingIntro:
        "Cada suscripciÃ³n lleva metadatos completos de precios: Moneda (cÃ³digo ISO), MontoBase, MontoAjuste, MontoTotal, TipoDeCambioAUsd y MontoTotalUsd. Esto permite un seguimiento preciso de los ingresos en mÃ¡s de 9 monedas compatibles (USD, EUR, GBP, SAR, AED, EGP, TRY, INR y mÃ¡s).",
      exchangeRateTitle: "NormalizaciÃ³n en USD",
      exchangeRateIntro:
        "Todos los montos se normalizan a USD a travÃ©s de ExchangeRateToUsd para informes MRR/ARR consistentes. El campo TotalAmountUsd se calcula en el momento de la suscripciÃ³n y se almacena para precisiÃ³n histÃ³rica â€” las fluctuaciones del tipo de cambio no modifican retroactivamente los registros anteriores.",
      promotionsTitle: "Descuentos Promocionales",
      promotionsIntro:
        "Las suscripciones admiten cÃ³digos promocionales a travÃ©s del campo AppliedPromoCode. Cuando se aplica una promociÃ³n vÃ¡lida, se registra un porcentaje PromotionDiscount y el MontoAjuste refleja el descuento aplicado al MontoBase. Las promociones se rastrean por suscripciÃ³n para auditorÃ­a y anÃ¡lisis.",
      exportTitle: "ExportaciÃ³n y Reportes Avanzados",
      exportIntro:
        "El sistema de exportaciÃ³n de suscripciones genera informes completos en formatos CSV, Excel (XLSX) y PDF. Cada informe incluye una pÃ¡gina de portada con metadatos de filtro, tablas de datos con cÃ³digo de colores y resÃºmenes estadÃ­sticos.",
      exportFiltersTitle: "Filtros de ExportaciÃ³n",
      exportFiltersIntro: "Los informes admiten filtros avanzados para anÃ¡lisis especÃ­ficos:",
      exportFilterDate:
        "Rango de fechas â€” filtrar por fecha de creaciÃ³n de suscripciÃ³n (Ãºltimos 7/30/90 dÃ­as, Ãºltimo aÃ±o o rango personalizado)",
      exportFilterExpiring:
        "Expira pronto â€” encontrar suscripciones que expiran dentro de 5/7/14/30/60/90 dÃ­as",
      exportFilterStatus: "Estado â€” Activo, Suspendido, Cancelado, Expirado",
      exportFilterEdition: "EdiciÃ³n â€” filtrar por plan/ediciÃ³n especÃ­fica",
      exportFilterCurrency: "Moneda â€” mostrar montos en la moneda seleccionada",
      exportDaysLeftTitle: "DÃ­as Restantes para la ExpiraciÃ³n",
      exportDaysLeftIntro:
        "Los informes incluyen una columna 'DÃ­as Restantes' calculada con codificaciÃ³n de colores condicional: rojo (â‰¤7 dÃ­as), amarillo (â‰¤30 dÃ­as), verde (>30 dÃ­as). Esto permite identificar de un vistazo las suscripciones que requieren atenciÃ³n de renovaciÃ³n.",
      exportFormatsTitle: "Detalles de Formatos de ExportaciÃ³n",
      exportFormatCsv: "CSV â€” ligero, importable en cualquier hoja de cÃ¡lculo o herramienta BI",
      exportFormatExcel:
        "XLSX â€” libro de Excel profesional con encabezados estilizados, hoja de metadatos de filtro, formato condicional y columnas de tamaÃ±o automÃ¡tico (ClosedXML)",
      exportFormatPdf:
        "PDF â€” documento listo para imprimir con pÃ¡gina de portada con marca, resumen estadÃ­stico y tablas de datos paginadas (QuestPDF)",
      renewalTitle: "RenovaciÃ³n â€” PatrÃ³n de Fila Nueva (B2)",
      renewalIntro:
        "Las renovaciones crean una NUEVA fila de TenantSubscription en lugar de sobrescribir el registro existente (patrÃ³n Stripe). La suscripciÃ³n antigua se marca como Expirada (IsActive=false), mientras se crea una nueva fila con Id fresco, StartDate=UtcNow, precios recalculados y detalles de promociÃ³n transferidos.",
      renewalAuditTitle: "Pista de AuditorÃ­a de Ingresos",
      renewalAuditIntro:
        "Cada ciclo de facturaciÃ³n produce su propia fila inmutable en la base de datos con precios fijados al momento de la renovaciÃ³n. Esto permite informes financieros precisos: tendencias de MRR, anÃ¡lisis de cancelaciones por perÃ­odo y seguimiento de reembolsos por ciclo.",
      promoExpiryTitle: "Seguimiento de Caducidad de Promociones (A1)",
      promoExpiryIntro:
        "Cuando se aplica una promociÃ³n con DurationDays > 0, el sistema calcula una marca temporal PromotionExpiresAt. En cada renovaciÃ³n, el manejador verifica si UtcNow > PromotionExpiresAt â€” si la promociÃ³n ha expirado, el descuento se elimina y NO se transfiere a la nueva fila de suscripciÃ³n.",
      concurrencyTitle: "Concurrencia Optimista (E1)",
      concurrencyIntro:
        "Cada TenantSubscription tiene un ConcurrencyStamp (Guid) con [ConcurrencyCheck]. El sello se renueva en cada operaciÃ³n de escritura. Esto previene condiciones de carrera â€” por ejemplo, cancelaciÃ³n concurrente + trabajo de reconciliaciÃ³n â€” lanzando DbUpdateConcurrencyException en colisiones.",
      validationTitle: "ValidaciÃ³n de Entrada (G1)",
      validationIntro:
        "Los 8 comandos de suscripciÃ³n tienen validadores FluentValidation dedicados. Los validadores usan ILocalizer para mensajes de error localizados (EN + AR). Reglas de negocio: no renovar como prueba, montos de reembolso positivos, lÃ­mites de longitud de texto.",
      crossModuleTitle: "IntegraciÃ³n Entre MÃ³dulos (H1)",
      crossModuleIntro:
        "Los eventos del ciclo de vida de suscripciÃ³n publican eventos de dominio consumidos por el mÃ³dulo de Identidad. Al suspender una suscripciÃ³n, todos los administradores del inquilino se desactivan con DeactivationReason='SubscriptionSuspended'. Al reanudar, solo se reactivan los administradores desactivados por suspensiÃ³n.",
      crossModuleReasons:
        "Tres razones de desactivaciÃ³n: 'Manual' (nunca se reactiva automÃ¡ticamente), 'SubscriptionSuspended' (se reactiva al reanudar), 'SubscriptionExpired' (se desactiva al expirar).",
      impactTitle: "AnÃ¡lisis de Impacto del Downgrade",
      impactIntro:
        "Antes de cambiar la ediciÃ³n de un inquilino, utilice el endpoint de Impacto del Downgrade para previsualizar quÃ© recursos se desbordarÃ­an. La respuesta enumera cada funciÃ³n que excederÃ­a los lÃ­mites de la nueva ediciÃ³n, junto con el uso actual frente al nuevo lÃ­mite.",
      endpointsTitle: "Puntos de ConexiÃ³n API (Endpoints)",
      endpointsIntro:
        "El controlador de Suscripciones proporciona 13 endpoints que cubren todo el ciclo de vida de la suscripciÃ³n:",
      operationsTitle: "Operaciones de SuscripciÃ³n",
      operationsIntro:
        "El mÃ³dulo de suscripciÃ³n admite un conjunto completo de operaciones de ciclo de vida. Cada operaciÃ³n hace que la suscripciÃ³n pase a un nuevo estado con un seguimiento de auditorÃ­a completo.",
      assignTitle: "Asignar SuscripciÃ³n",
      assignIntro:
        "Crear una nueva suscripciÃ³n vinculando a un inquilino a una ediciÃ³n. Si el inquilino ya tiene una suscripciÃ³n activa, la anterior se cancela automÃ¡ticamente. Admite parÃ¡metros opcionales de moneda, cÃ³digo promocional y comportamiento de expiraciÃ³n.",
      upgradeTitle: "Mejora (Upgrade) y Descenso (Downgrade)",
      upgradeIntro:
        "Los inquilinos pueden moverse entre ediciones. Los Upgrades se aplican de inmediato y las funciones de la nueva ediciÃ³n entran en vigencia al instante. Los Downgrades verifican primero la OverflowPolicy para manejar los recursos que exceden los nuevos lÃ­mites.",
      trialTitle: "ConversiÃ³n de Prueba (Trial)",
      trialIntro:
        "Las suscripciones de prueba tienen una fecha de finalizaciÃ³n (TrialEndDate). Cuando una prueba se actualiza a un plan de pago, IsTrialConverted se establece en true y la suscripciÃ³n pasa al nuevo tipo. Si la prueba expira sin conversiÃ³n, ExpiryBehavior determina quÃ© sucede a continuaciÃ³n.",
      ep: {
        list: "Listar todas las suscripciones (paginado, filtrable por estado/tipo/inquilino)",
        get: "Obtener detalles de la suscripciÃ³n por ID",
        assign: "Crear una nueva suscripciÃ³n (asignar inquilino a ediciÃ³n con moneda/promo)",
        upgrade: "Mejorar a una ediciÃ³n superior (Upgrade)",
        downgrade: "Bajar a una ediciÃ³n inferior (Downgrade) (verifica OverflowPolicy)",
        impact: "Previsualizar el impacto del downgrade antes de ejecutarlo",
        suspend: "Suspender suscripciÃ³n (bloquear el acceso del inquilino)",
        resume: "Reanudar una suscripciÃ³n suspendida",
        cancel: "Cancelar suscripciÃ³n permanentemente",
        renew: "Renovar una suscripciÃ³n a punto de expirar",
        tenantActive: "Obtener la suscripciÃ³n activa para un inquilino especÃ­fico",
        export: "Exportar suscripciones como CSV, Excel o PDF con filtros avanzados",
      },
    },
    features: {
      title: "Funciones (Features)",
      description:
        "Capacidades de la plataforma controlables con tipos de valor Booleanos, NumÃ©ricos y de Cadena (String).",
      intro:
        "Las Funciones son los bloques de construcciÃ³n bÃ¡sicos del sistema de Derechos. Cada funciÃ³n representa una capacidad controlable: un interruptor booleano, una cuota numÃ©rica o una configuraciÃ³n de cadena. Las funciones tienen una clave de sistema estable (Name) que nunca cambia, lo que las hace seguras para referenciarlas en el cÃ³digo.",
      entityTitle: "Entidad de FunciÃ³n",
      entityIntro:
        "Una FunciÃ³n define una capacidad controlable de la plataforma. El campo Name es una clave de sistema estable utilizada en el cÃ³digo; DisplayNameEn/DisplayNameAr son etiquetas orientadas al usuario.",
      valueTypesTitle: "Tipos de Valor",
      valueTypesIntro:
        "Los valores de las funciones se almacenan como cadenas (strings) pero se interpretan segÃºn su ValueType. El sistema valida los valores frente al tipo esperado en el momento de la creaciÃ³n y actualizaciÃ³n.",
      valueTypesTip:
        "Para funciones NumÃ©ricas, use -1 para representar 'ilimitado'. FeatureCheckBehavior reconoce -1 como un valor especial y nunca bloquea las solicitudes de funciones con una cuota ilimitada.",
      systemVsCustomTitle: "Funciones del Sistema vs Personalizadas",
      systemVsCustomIntro:
        "SCRIPE distingue entre funciones del sistema (creadas al inicio, de solo lectura) y funciones personalizadas (creadas por los administradores a travÃ©s de la API):",
      cacheTitle: "CachÃ© de Funciones",
      cacheIntro:
        "Los valores de las funciones resueltas se almacenan en cachÃ© en IFeatureCache para evitar consultas a la base de datos en cada solicitud. La cachÃ© se invalida cada vez que cambian las funciones de una ediciÃ³n, se modifica una suscripciÃ³n o se establece/elimina una sobreescritura. En implementaciones de microservicios sin el mÃ³dulo de Derechos, un NoOpFeatureCache trata todas las funciones como habilitadas.",
      requireFeatureTitle: "Interfaz IRequireFeature",
      requireFeatureIntro:
        "Para restringir un comando o consulta CQRS detrÃ¡s de una funciÃ³n, implemente la interfaz de marcado IRequireFeature. El comportamiento de la pipeline FeatureCheckBehavior resuelve automÃ¡ticamente el valor actual del inquilino y rechaza la solicitud si la funciÃ³n estÃ¡ deshabilitada.",
      requireFeatureNote:
        "IRequireFeature funciona tanto para funciones Booleanas (comprobadas como habilitadas/deshabilitadas) como para funciones NumÃ©ricas (comprobadas como cuota restante). El comportamiento determina automÃ¡ticamente el tipo de comprobaciÃ³n a partir del Feature.ValueType.",
      contextAwareTitle: "VisualizaciÃ³n Contextual de Funciones",
      contextAwareIntro:
        "La pÃ¡gina de lista de funciones es contextual. Los administradores del sistema ven el catÃ¡logo completo de funciones con operaciones CRUD. Los administradores de inquilinos y las sesiones de drill-down ven solo las funciones efectivas del inquilino (resueltas a partir de la ediciÃ³n + sobreescrituras) en modo de solo lectura. Todo el alcance se gestiona desde el backend mediante GET /features (catÃ¡logo) vs GET /features/effective (Ã¡mbito de inquilino).",
      endpointsTitle: "Puntos de ConexiÃ³n API (Endpoints)",
      endpointsIntro:
        "El controlador de Funciones expone 5 endpoints CRUD. Las funciones del sistema no se pueden eliminar:",
      seedingTitle: "Sembrado de Funciones (Seeding)",
      seedingIntro:
        "Las funciones del sistema se siembran automÃ¡ticamente al inicio de la aplicaciÃ³n mediante EntitlementsStartupSeeder. El sembrador verifica si cada funciÃ³n del sistema ya existe (por Nombre) y solo crea las que faltan: las funciones existentes nunca se sobrescriben.",
      quotaTitle: "Seguimiento de Cuotas (QuotaCounter)",
      quotaIntro:
        "Las funciones numÃ©ricas admiten la aplicaciÃ³n automÃ¡tica de cuotas a travÃ©s de la entidad QuotaCounter. El FeatureCheckBehavior verifica el uso actual frente al lÃ­mite resuelto para cada comando IRequireFeature que se dirija a una funciÃ³n numÃ©rica.",
      cacheNote:
        "La cachÃ© se invalida automÃ¡ticamente cuando: (1) se modifican las funciones de una ediciÃ³n, (2) se asigna/cambia una suscripciÃ³n, (3) se establece/elimina una sobreescritura. No se necesita limpieza manual de cachÃ©.",
      patternTitle: "PatrÃ³n IRequireFeature",
      patternIntro:
        "Para restringir cualquier comando CQRS detrÃ¡s de una verificaciÃ³n de funciÃ³n, simplemente implemente la interfaz de marcado IRequireFeature. El FeatureCheckBehavior intercepta automÃ¡ticamente la solicitud, resuelve el valor de la funciÃ³n del inquilino y la rechaza si estÃ¡ deshabilitada o supera la cuota.",
      ep: {
        list: "Listar todas las funciones (paginado, filtrable por categorÃ­a/tipo)",
        get: "Obtener detalles de la funciÃ³n por ID",
        create: "Crear una nueva funciÃ³n personalizada",
        update:
          "Actualizar metadatos de la funciÃ³n (funciones del sistema: solo DefaultValue/Description)",
        delete:
          "Eliminado lÃ³gico de una funciÃ³n personalizada (las funciones del sistema no se pueden eliminar)",
      },
    },
    overrides: {
      title: "Sobreescritura de Funciones (Overrides)",
      description:
        "PersonalizaciÃ³n del valor de la funciÃ³n por inquilino que omite los valores predeterminados de la ediciÃ³n.",
      intro:
        "Las Sobreescrituras de funciones permiten a los administradores de la plataforma personalizar los valores de las funciones para inquilinos individuales, independientemente de su ediciÃ³n suscrita. Las sobreescrituras tienen la mÃ¡xima prioridad en la cadena de resoluciÃ³n, lo que las hace perfectas para acuerdos de ventas personalizados, promociones especiales o excepciones puntuales.",
      entityTitle: "Entidad de Sobreescritura (Override)",
      entityIntro:
        "Un TenantFeatureOverride establece un valor personalizado para una funciÃ³n especÃ­fica en un inquilino especÃ­fico. Incluye un campo opcional 'Reason' (Motivo) para fines de auditorÃ­a.",
      priorityTitle: "Prioridad de ResoluciÃ³n",
      priorityIntro:
        "Las sobreescrituras se sitÃºan en la parte superior de la cadena de resoluciÃ³n. Cuando el sistema resuelve un valor de funciÃ³n para un inquilino, primero busca una sobreescritura:",
      whenTitle: "CuÃ¡ndo Usar Sobreescrituras",
      whenIntro:
        "Las sobreescrituras estÃ¡n diseÃ±adas para casos excepcionales en los que un inquilino necesita un valor diferente al que proporciona su ediciÃ³n:",
      useCase1:
        "Acuerdos empresariales personalizados â€” 'Dar a Acme Corp 500 administradores en lugar de los 50 estÃ¡ndar'",
      useCase2:
        "Ofertas promocionales â€” 'Habilitar el Chat Premium para este inquilino durante 30 dÃ­as'",
      useCase3:
        "Pruebas Beta â€” 'Habilitar el nuevo mÃ³dulo de FacturaciÃ³n para los primeros usuarios'",
      useCase4:
        "Aumento temporal â€” 'Aumentar el lÃ­mite de carga de archivos durante su migraciÃ³n'",
      overuseWarning:
        "Las sobreescrituras deben usarse con moderaciÃ³n. Si muchos inquilinos necesitan la misma sobreescritura, considere crear una nueva ediciÃ³n. El exceso de sobreescrituras hace que el sistema sea mÃ¡s difÃ­cil de gestionar y auditar.",
      resolvedTitle: "Endpoint de Funciones Resueltas",
      resolvedIntro:
        "El endpoint GET /api/v1/tenants/{tenantId}/features/resolved devuelve el valor final y efectivo de cada funciÃ³n para un inquilino determinado. Muestra la fuente de resoluciÃ³n (Sobreescritura, EdiciÃ³n o Predeterminado) para cada entrada, lo que facilita la depuraciÃ³n y auditorÃ­a.",
      endpointsTitle: "Puntos de ConexiÃ³n API (Endpoints)",
      endpointsIntro:
        "El controlador TenantFeatures expone 4 endpoints para gestionar las sobreescrituras por inquilino y los valores resueltos:",
      scenariosTitle: "Escenarios de Casos de Uso",
      scenariosIntro:
        "Los siguientes escenarios del mundo real demuestran cuÃ¡ndo las sobreescrituras aportan mÃ¡s valor:",
      settingTitle: "Establecer una Sobreescritura",
      settingIntro:
        "Para establecer una sobreescritura, envÃ­e una solicitud POST al endpoint de funciones del inquilino con el ID de la funciÃ³n, el valor personalizado y un motivo opcional para fines de auditorÃ­a.",
      settingTip:
        "Siempre incluya un motivo al establecer sobreescrituras: hace que los registros de auditorÃ­a tengan sentido y ayuda a los futuros administradores a comprender por quÃ© se aplicÃ³ la sobreescritura.",
      expiryTitle: "ExpiraciÃ³n de Sobreescrituras",
      expiryIntro:
        "Las sobreescrituras pueden tener una fecha opcional de expiraciÃ³n (ExpiresAt). Cuando pasa la fecha de expiraciÃ³n, la sobreescritura se desactiva automÃ¡ticamente y la funciÃ³n vuelve al valor de la ediciÃ³n (o al predeterminado global).",
      expiryNote:
        "Las sobreescrituras expiradas se desactivan de forma lÃ³gica (IsActive = false), no se eliminan. Esto conserva el registro de auditorÃ­a y permite reactivarlas si es necesario.",
      auditTitle: "Registro de AuditorÃ­a (Audit Trail)",
      auditIntro:
        "Cada operaciÃ³n de sobreescritura se rastrea con informaciÃ³n de auditorÃ­a completa. El campo Reason (Motivo) en cada sobreescritura proporciona el contexto de por quÃ© se aplicÃ³ el valor personalizado.",
      bestPracticesTitle: "Mejores PrÃ¡cticas",
      bestPracticesIntro:
        "Siga estas pautas para mantener su sistema de sobreescrituras fÃ¡cil de mantener y auditar.",
      bestPracticesWarning:
        "Las sobreescrituras deben usarse con moderaciÃ³n. Si muchos inquilinos necesitan la misma sobreescritura, considere crear una nueva ediciÃ³n en su lugar. El uso excesivo de sobreescrituras hace que el sistema sea mÃ¡s difÃ­cil de gestionar y crea una deuda de mantenimiento.",
      ep: {
        list: "Listar todas las sobreescrituras para un inquilino especÃ­fico",
        set: "Establecer o actualizar una sobreescritura de funciÃ³n para un inquilino",
        remove: "Eliminar (desactivar) una sobreescritura de funciÃ³n",
        resolved:
          "Obtener todos los valores de funciones resueltas para un inquilino (muestra la fuente: Sobreescritura/EdiciÃ³n/Predeterminado)",
      },
    },

    // ── Plugins Module (Phase 15) ────────────────────────────
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
        title: "PolÃ­ticas de RetenciÃ³n de Datos",
        description:
          "Definir periodos de retenciÃ³n de datos y acciones automatizadas de expiraciÃ³n para el cumplimiento del ArtÃ­culo 5(1)(e) del GDPR.",
        intro:
          "Las PolÃ­ticas de RetenciÃ³n de Datos definen cuÃ¡nto tiempo se deben conservar las categorÃ­as de datos. SCRIPE hace cumplir estas polÃ­ticas automÃ¡ticamente a travÃ©s de trabajos en segundo plano.",
        policiesTitle: "ConfiguraciÃ³n de la PolÃ­tica",
        policiesIntro: "Cada polÃ­tica de retenciÃ³n especifica:",
        field1:
          "DataCategory â€” El tipo de datos (ej. 'Perfiles de Usuario', 'Registros de Consentimiento').",
        field2: "RetentionDays â€” CuÃ¡ntos dÃ­as deben conservarse los datos.",
        field3:
          "ExpiryAction â€” QuÃ© ocurre cuando el periodo expira: Eliminar (Delete) o Anonimizar (Anonymize).",
        field4: "RegulationCode â€” QuÃ© regulaciÃ³n exige esto (GDPR, CCPA, etc.).",
        actionsTitle: "Acciones de ExpiraciÃ³n",
        actionsIntro: "Al expirar, SCRIPE aplica una de dos acciones:",
        action1: "Eliminar (Delete) â€” Elimina permanentemente todos los registros.",
        action2: "Anonimizar (Anonymize) â€” Reemplaza la PII con tokens seudÃ³nimos.",
        automationTitle: "AplicaciÃ³n Automatizada",
        automationIntro:
          "La tarea RetentionEnforcementJob se ejecuta diariamente escaneando polÃ­ticas y aplicando la acciÃ³n. Se crea un registro de auditorÃ­a RetentionExecution.",
        nodePolicy: "PolÃ­tica de RetenciÃ³n",
        descPolicy: "Define el tipo de entidad, lÃ­mite de edad y estrategia",
        nodeEnforcement: "Tarea de AplicaciÃ³n de RetenciÃ³n",
        descEnforcement: "Tarea semanal para evaluar polÃ­ticas",
        nodeExecution: "EjecuciÃ³n de RetenciÃ³n",
        descExecution: "Pista de auditorÃ­a de la acciÃ³n de destrucciÃ³n",
        nodeAction: "DestrucciÃ³n de Datos",
        descAction: "EliminaciÃ³n forzada o AnonimizaciÃ³n",
        conn1: "escaneado por",
        conn2: "desencadena",
        conn3: "registra",
        endpointsTitle: "Endpoints API",
        ep: {
          list: "Listar todas las polÃ­ticas de retenciÃ³n",
          executions: "Listar historial de ejecuciones de retenciÃ³n",
          update: "Actualizar una polÃ­tica de retenciÃ³n",
        },
      },
      inventory: {
        title: "Inventario de Datos",
        description:
          "Un registro de todas las categorÃ­as de datos personales procesadas â€” requerido por el ArtÃ­culo 30 del GDPR (RoPA).",
        intro:
          "El Inventario de Datos es un registro estructurado. SegÃºn el ArtÃ­culo 30 del GDPR, los controladores deben mantener un Registro de Actividades de Procesamiento (RoPA).",
        fieldsTitle: "Campos del Inventario",
        fieldsIntro: "Cada elemento documenta:",
        field1: "DataCategory â€” Nombre legible de la categorÃ­a (ej. 'Direcciones de Email').",
        field2: "LegalBasis â€” La base legal del GDPR (Consentimiento, Contrato, etc.).",
        field3: "DataSubjects â€” A quiÃ©n pertenecen los datos (ej. 'Usuarios finales').",
        field4: "ProcessingPurpose â€” Por quÃ© se procesan los datos (ej. 'Marketing').",
        field5: "StorageLocation â€” DÃ³nde se almacenan (paÃ­s/regiÃ³n).",
        field6: "RetentionPeriod â€” CuÃ¡nto tiempo se conservan.",
        field7: "ThirdPartySharing â€” Si los datos se comparten con terceros.",
        ropaTitle: "Cumplimiento del ArtÃ­culo 30",
        ropaIntro:
          "Organizaciones con mÃ¡s de 250 empleados deben mantener un RoPA. El inventario de SCRIPE sirve como un RoPA en vivo y exportable.",
        endpointsTitle: "Endpoints API",
        ep: {
          list: "Listar elementos del inventario (paginado, buscable)",
          get: "Obtener elemento por ID",
          create: "Agregar una nueva categorÃ­a de datos al inventario",
          update: "Actualizar un elemento del inventario existente",
          delete: "Eliminar un elemento del inventario",
        },
      },
      reports: {
        title: "Reportes de Cumplimiento",
        description:
          "Generar reportes asÃ­ncronos listos para auditorÃ­as (Resumen GDPR, DSR, AuditorÃ­a de Consentimiento, RetenciÃ³n, Inventario).",
        intro:
          "Los Reportes de Cumplimiento son documentos generados de forma asÃ­ncrona que proporcionan resÃºmenes para inspecciones regulatorias o auditorÃ­as internas.",
        reportTypesTitle: "Tipos de Reportes",
        reportTypesIntro: "Hay cinco tipos de reportes disponibles:",
        type1: "Resumen GDPR â€” Resumen de alto nivel del estado de cumplimiento de GDPR.",
        type2:
          "Resumen de Actividad DSR â€” EstadÃ­sticas sobre volumen, tipos y tasas de cumplimiento de DSR.",
        type3:
          "AuditorÃ­a de Consentimiento â€” Registro completo de consentimientos otorgados y retirados.",
        type4:
          "AnÃ¡lisis de RetenciÃ³n â€” Estado actual de cumplimiento de todas las polÃ­ticas activas.",
        type5:
          "ExportaciÃ³n de Inventario de Datos â€” ExportaciÃ³n completa del inventario (RoPA ArtÃ­culo 30).",
        asyncTitle: "GeneraciÃ³n AsÃ­ncrona",
        asyncIntro:
          "Los reportes se generan de forma asÃ­ncrona para no bloquear las peticiones HTTP. Cuando solicita un reporte, el sistema crea un registro ComplianceReport (IsReady=false) y encola la generaciÃ³n.",
        asyncTip:
          "Use el botÃ³n de Actualizar para comprobar cuÃ¡ndo estÃ¡ listo (generalmente 30-60 segundos).",
        downloadTitle: "Descarga de Reportes",
        downloadIntro:
          "Una vez que un reporte estÃ¡ listo (IsReady=true), el DownloadUrl estÃ¡ disponible. Los reportes se retienen por 90 dÃ­as.",
        endpointsTitle: "Endpoints API",
        ep: {
          list: "Listar todos los reportes de cumplimiento (paginado)",
          get: "Obtener detalles del reporte y URL de descarga por ID",
          generate: "Encolar la generaciÃ³n de un nuevo reporte",
          download: "Descargar el archivo del reporte generado",
        },
      },
    },
  },
};

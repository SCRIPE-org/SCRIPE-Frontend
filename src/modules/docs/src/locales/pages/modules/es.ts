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

    compliance: {
      overview: {
        title: "MÃ³dulo de Cumplimiento",
        description:
          "AutomatizaciÃ³n de cumplimiento de GDPR, CCPA y PDPA â€” regulaciones, manejo de DSR, gestiÃ³n de consentimiento, retenciÃ³n de datos, inventario y reportes.",
        intro:
          "El mÃ³dulo de Cumplimiento es el motor regulatorio integrado de SCRIPE. Ayuda a los operadores de la plataforma y a sus inquilinos a cumplir con las principales leyes de protecciÃ³n de datos (GDPR, CCPA, PDPA) mediante herramientas automatizadas para gestionar solicitudes de sujetos de datos, registros de consentimiento, polÃ­ticas de retenciÃ³n y la generaciÃ³n de reportes listos para auditorÃ­as.",
        infoTitle: "Aviso de Cumplimiento",
        infoContent:
          "El mÃ³dulo de Cumplimiento es crÃ­tico para mantener la adherencia regulatoria y evitar multas. AsegÃºrese de que todas las funciones estÃ©n mapeadas correctamente a las polÃ­ticas de procesamiento de datos.",
        descDsr: "Maneja las Solicitudes de Sujetos (ExportaciÃ³n, Borrado, RectificaciÃ³n)",
        descConsent: "Seguimiento inmutable de los estados y capturas de consentimiento",
        descRet: "Hace cumplir las polÃ­ticas de destrucciÃ³n de datos segÃºn la antigÃ¼edad",
        descInv: "Mapea ubicaciones sensibles de PII en los mÃ³dulos",
        descRep: "Genera informes de cumplimiento de RoPA y DPIA",
        descId: "MÃ³dulo de Identidad",
        descIdDesc: "Proporciona contexto de Usuario/Admin y AutorizaciÃ³n",
        descEnt: "MÃ³dulo de Derechos",
        descEntDesc: "Controla las capacidades de cumplimiento por funciones",
        conn1: "inicia solicitudes",
        conn2: "otorga/revoca",
        conn3: "controla polÃ­ticas",
        conn4: "guÃ­a el borrado",
        conn5: "apunta a datos",
        conn6: "pistas de auditorÃ­a",
        conn7: "pistas de auditorÃ­a",
        th1: "Componente",
        th2: "Responsabilidad",
        tr1_1: "DsrListViewModel",
        tr1_2:
          "Maneja la paginaciÃ³n, filtrado y asignaciÃ³n de las Solicitudes de Sujetos de Datos entrantes.",
        tr2_1: "ConsentRecordView",
        tr2_2:
          "Representa la captura de consentimiento inmutable junto con metadatos del agente de usuario y de fecha y hora.",
        whatIsTitle: "Â¿QuÃ© es el MÃ³dulo de Cumplimiento?",
        whatIsIntro:
          "El mÃ³dulo de Cumplimiento proporciona seis subsistemas interconectados que cubren todo el ciclo de vida de cumplimiento. En lugar de construir herramientas desde cero, los inquilinos de SCRIPE obtienen un sistema listo para producciÃ³n.",
        subModulesTitle: "Seis Subsistemas",
        subModulesIntro: "Cada subsistema maneja un dominio de cumplimiento especÃ­fico:",
        sub1: "Perfiles de RegulaciÃ³n â€” Almacena los marcos regulatorios (GDPR, CCPA, PDPA) bajo los cuales opera la plataforma.",
        sub2: "Solicitudes de Sujetos de Datos (DSR) â€” Gestiona solicitudes de derechos (exportaciÃ³n, borrado, rectificaciÃ³n, restricciÃ³n).",
        sub3: "GestiÃ³n de Consentimiento â€” Registra, rastrea y audita las concesiones y revocaciones de consentimiento de los usuarios.",
        sub4: "PolÃ­ticas de RetenciÃ³n de Datos â€” Define cuÃ¡nto tiempo se mantienen los datos y quÃ© sucede cuando expiran (eliminar o anonimizar).",
        sub5: "Inventario de Datos â€” Un registro de todas las categorÃ­as de datos personales que la plataforma procesa.",
        sub6: "Reportes de Cumplimiento â€” Genera reportes asÃ­ncronos listos para auditorÃ­as (Resumen GDPR, Resumen DSR, AuditorÃ­a de Consentimiento, etc.).",
        backendTitle: "Arquitectura Backend",
        backendIntro:
          "Sigue la disposiciÃ³n estÃ¡ndar de 3 proyectos de SCRIPE (Domain / Application / Infrastructure) con ComplianceDbContext.",
        frontendTitle: "Arquitectura Frontend",
        frontendIntro:
          "El frontend estÃ¡ organizado como seis submÃ³dulos independientes bajo src/modules/compliance/, cada uno con sus propias capas.",
        endpointsTitle: "Resumen de Endpoints API",
        endpointsIntro:
          "Todos los endpoints estÃ¡n bajo /api/v1/compliances/ y requieren autenticaciÃ³n con el permiso compliance.view.",
      },
      dsr: {
        title: "Solicitudes de Sujetos de Datos (DSR)",
        description:
          "GestiÃ³n de solicitudes de derechos GDPR/CCPA â€” exportaciÃ³n, borrado, rectificaciÃ³n y restricciÃ³n â€” con seguimiento del ciclo de vida.",
        intro:
          "Las Solicitudes de Sujetos de Datos (DSR) son peticiones formales de individuos que ejercen sus derechos. El mÃ³dulo proporciona un flujo de trabajo DSR completo: envÃ­o, asignaciÃ³n, procesamiento y cierre.",
        typesTitle: "Tipos de Solicitud",
        typesIntro:
          "El sistema soporta cuatro tipos de DSR como se define en el ArtÃ­culo 17 de GDPR y CCPA:",
        type1:
          "ExportaciÃ³n â€” Solicitud de portabilidad de datos. El sujeto desea una copia de sus datos personales.",
        type2:
          "Borrado â€” Derecho al olvido. Todos los datos personales deben ser eliminados o anonimizados.",
        type3:
          "Rectification â€” Solicitud de correcciÃ³n. Los datos inexactos deben actualizarse.",
        type4:
          "RestricciÃ³n â€” RestricciÃ³n del procesamiento. Los datos pueden conservarse pero no procesarse activamente.",
        lifecycleTitle: "Ciclo de vida de la solicitud",
        lifecycleIntro: "Las DSR pasan por un conjunto definido de estados:",
        status1: "Pendiente (Pending) â€” Estado inicial cuando se recibe la solicitud.",
        status2: "En Progreso (InProgress) â€” Un oficial de cumplimiento ha sido asignado.",
        status3:
          "Completada (Completed) â€” La solicitud ha sido cumplida (datos exportados, borrados, corregidos o restringidos).",
        status4:
          "Rechazada (Rejected) â€” La solicitud fue rechazada (ej. insuficiente verificaciÃ³n de identidad).",
        slasTitle: "Requisitos de SLA de GDPR",
        slasIntro:
          "Bajo el ArtÃ­culo 12 de GDPR, los controladores deben responder a las DSR dentro de los 30 dÃ­as (extensible a 3 meses para casos complejos). SCRIPE rastrea esto.",
        lifecycleFlowTitle: "Flujo de Vida DSR",
        nodeSubmit: "Enviar solicitud",
        descSubmit: "El sujeto solicita ExportaciÃ³n, Borrado o RectificaciÃ³n",
        nodePending: "Estado: Pendiente",
        descPending: "Solicitud registrada, plazo de SLA calculado",
        nodeProcessing: "Estado: En Progreso",
        descProcessing: "DsrExecutionJob procesa los mÃ³dulos vÃ­a ISuspendableModule",
        nodeApproval: "Esperar a Admin",
        descApproval:
          "Acciones nucleares (Borrado) requieren confirmaciÃ³n manual del administrador",
        nodeCompleted: "Estado: Completada",
        descCompleted: "ExportaciÃ³n generada o datos borrados; SLA cumplido",
        nodeRejected: "Estado: Rechazada",
        descRejected: "Solicitud denegada por el admin con notas de resoluciÃ³n",
        conn1: "inicia",
        conn2: "tarea en segundo plano recoge",
        conn3: "si es auto-procesada (ExportaciÃ³n)",
        conn4: "si es nuclear (Borrado)",
        conn5: "admin confirma",
        conn6: "admin rechaza",
        entitiesTitle: "Entidades",
        entityName: "Nombre de la Entidad",
        entityDesc: "DescripciÃ³n",
        entityDsrDesc: "Representa una solicitud de sujeto de datos.",
        entityModuleDesc: "Estado de ejecuciÃ³n de un mÃ³dulo.",
        entityStatusDesc: "Historial de cambios de estado.",
        codeTitle: "Ejemplo de CÃ³digo",
        endpointsTitle: "Endpoints API",
        endpointsIntro: "El controlador de DSR expone 6 endpoints:",
        ep: {
          list: "Listar todas las DSR (paginado, filtrable)",
          get: "Obtener detalles de la DSR por ID",
          create: "Enviar una nueva DSR",
          updateStatus: "Actualizar estado de la DSR (InProgress, Completed, Rejected)",
          assign: "Asignar DSR a un oficial de cumplimiento",
          delete: "Borrado lÃ³gico de una DSR",
        },
      },
      consent: {
        title: "GestiÃ³n de Consentimiento",
        description:
          "Registrar, rastrear y auditar los consentimientos de los usuarios para cumplir con el ArtÃ­culo 6 de GDPR y CCPA.",
        intro:
          "La GestiÃ³n de Consentimiento registra cada vez que un usuario otorga o revoca su consentimiento. SCRIPE almacena toda la pista de auditorÃ­a.",
        purposesTitle: "PropÃ³sitos del Consentimiento",
        purposesIntro:
          "Cada registro de consentimiento estÃ¡ vinculado a un propÃ³sito especÃ­fico:",
        purpose1: "Marketing â€” Emails de marketing y comunicaciones promocionales.",
        purpose2: "AnalÃ­tica â€” AnÃ¡lisis de uso y mejora del producto.",
        purpose3: "Terceros â€” ComparticiÃ³n de datos con servicios de terceros.",
        purpose4: "PersonalizaciÃ³n â€” Contenido personalizado y recomendaciones.",
        gdprTitle: "Base Legal GDPR",
        gdprIntro:
          "El ArtÃ­culo 6 de GDPR establece que el consentimiento debe ser: libremente dado, especÃ­fico, informado e inequÃ­voco. SCRIPE registra el texto exacto mostrado al usuario.",
        withdrawalTitle: "Retirada del Consentimiento",
        withdrawalIntro:
          "Los usuarios pueden retirar su consentimiento en cualquier momento. El ConsentRecord se actualiza con WithdrawnAt.",
        flowTitle: "Flujo de Estado de Consentimiento",
        nodePurpose: "PropÃ³sito del Consentimiento",
        descPurpose: "Define a quÃ© se estÃ¡ consintiendo (ej. Marketing)",
        nodeRecord: "Registro de Consentimiento",
        descRecord: "Estado actual (Otorgado/Revocado) por propÃ³sito",
        nodeSnapshot: "Captura de Consentimiento",
        descSnapshot: "Captura inmutable del otorgamiento/revocaciÃ³n",
        nodeJob: "Tarea de ExpiraciÃ³n",
        descJob: "Tarea diaria que revoca consentimientos expirados",
        conn1: "plantillas",
        conn2: "genera al cambiar",
        conn3: "auto-revoca si expirÃ³",
        immutabilityTitle: "Inmutabilidad",
        immutabilityIntro: "Los registros de consentimiento son inmutables.",
        endpointsTitle: "Endpoints API",
        ep: {
          list: "Listar registros de consentimiento",
          get: "Obtener registro de consentimiento por ID",
          record: "Registrar un nuevo otorgamiento de consentimiento",
          withdraw: "Retirar un consentimiento previamente otorgado",
        },
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

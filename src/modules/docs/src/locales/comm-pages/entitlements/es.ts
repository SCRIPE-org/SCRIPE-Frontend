/**
 * Docs page locale — ES
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const es = {
  commercial: {
    entOverview: {
      title: "Resumen de Derechos",
      description:
        "Un motor de derechos completo de nivel empresarial que transforma su plataforma en un producto SaaS diferenciado con ediciones, suscripciones y control de funciones por inquilino.",
      intro:
        "Deje de codificar (hardcoding) las comprobaciones de planes en su código. El módulo de Derechos de NEXORA proporciona un motor de control de funciones (feature gating) de pila completa a nivel de API que aplica automáticamente lo que cada inquilino puede y no puede hacer, según su edición suscrita, sobreescrituras activas y contadores de cuota en tiempo real.",
      whyTitle: "¿Por qué Derechos Integrados?",
      whyContent:
        "La mayoría de las plataformas SaaS añaden feature flags (indicadores de funciones) como una idea de último momento. NEXORA integra los derechos directamente en la pipeline CQRS a través de la interfaz IRequireFeature, lo que significa que cada comando puede ser controlado automáticamente sin una sola línea de middleware personalizado.",
      fgEditions: "Ediciones (Planes)",
      fgEditionsDesc:
        "Paquetes de funciones con nombre como Básico, Pro, Enterprise que definen lo que incluye cada plan.",
      fgSubscriptions: "Ciclo de Vida de Suscripciones",
      fgSubscriptionsDesc:
        "Asigne, mejore, baje de plan, suspenda y renueve las suscripciones de los inquilinos con registros de auditoría completos.",
      fgFeatures: "Catálogo de Funciones",
      fgFeaturesDesc:
        "Tipos de funciones Booleanas, Numéricas y de Cadena (String) con valores predeterminados del sistema y extensibilidad personalizada.",
      fgOverrides: "Sobreescrituras por Inquilino",
      fgOverridesDesc:
        "Personalice cualquier valor de función para inquilinos individuales: perfecto para acuerdos empresariales o accesos beta.",
      fgQuotas: "Aplicación de Cuotas",
      fgQuotasDesc:
        "Las funciones numéricas con entidades QuotaCounter se aplican automáticamente a nivel de la pipeline.",
      fgVersioning: "Versionado e Implementación",
      fgVersioningDesc:
        "Implemente cambios en las ediciones mediante estrategias de implementación inmediata, canary o programada.",
      howTitle: "Cómo Funciona",
      howContent:
        "Cada comando de API que implementa IRequireFeature es interceptado por la pipeline FeatureCheckBehavior. El sistema resuelve los valores de las funciones efectivas del inquilino (sobreescrituras → edición → predeterminados) y permite la ejecución o devuelve una respuesta clara de 'función deshabilitada'.",
      resolutionTitle: "Prioridad de Resolución",
      resolutionContent:
        "Cuando el sistema resuelve un valor de función para un inquilino, verifica las fuentes en estricto orden de prioridad. Gana la primera fuente que proporciona un valor.",
      tblResH1: "Prioridad",
      tblResH2: "Fuente",
      tblResH3: "Caso de Uso",
      tblResR1C1: "1 (Más alta)",
      tblResR1C2: "Sobreescritura del Inquilino",
      tblResR1C3: "Acuerdos empresariales personalizados, promociones, pruebas beta",
      tblResR2C1: "2",
      tblResR2C2: "Suscripción Activa → Edición",
      tblResR2C3: "Acceso a funciones estándar basado en el plan",
      tblResR3C1: "3",
      tblResR3C2: "Suscripciones Complementarias (Add-ons)",
      tblResR3C3: "Paquetes de funciones opcionales comprados por separado",
      tblResR4C1: "4 (Más baja)",
      tblResR4C2: "Valor Predeterminado de la Función",
      tblResR4C3: "Fallback cuando no se aplica ninguna otra fuente",
      valueTitle: "Valor Comercial",
      tblValH1: "Desafío",
      tblValH2: "Sin NEXORA",
      tblValH3: "Con Derechos de NEXORA",
      tblValR1C1: "Diferenciación de planes",
      tblValR1C2: "Comprobaciones if/else hardcodeadas dispersas por todas partes",
      tblValR1C3: "Control automático a nivel de pipeline por edición",
      tblValR2C1: "Acuerdos personalizados empresariales",
      tblValR2C2: "Implementaciones de código para cada caso especial",
      tblValR2C3: "Sobreescrituras por inquilino vía API en segundos",
      tblValR3C1: "Límites de uso",
      tblValR3C2: "Conteo y validación manuales",
      tblValR3C3: "Aplicación automática de QuotaCounter",
      tblValR4C1: "Cambios de plan",
      tblValR4C2: "Migraciones de bases de datos arriesgadas",
      tblValR4C3: "Upgrade/Downgrade en tiempo real con análisis de impacto",
      tblValR5C1: "Lanzamiento de funciones",
      tblValR5C2: "Implementaciones masivas que ponen en riesgo a todos los inquilinos",
      tblValR5C3: "Estrategias de implementación canary y programadas",
      tip: "El módulo de Derechos está completamente integrado en la pipeline de NEXORA mediator. Los comandos que implementan IRequireFeature se controlan automáticamente: su lógica de negocio se mantiene limpia y enfocada.",
    },
    entEditions: {
      title: "Ediciones y Planes",
      description:
        "Defina, gestione y versione los planes de sus productos SaaS utilizando el potente motor de Ediciones de NEXORA.",
      intro:
        "Las ediciones son los bloques de construcción de su estrategia de precios SaaS. Cada edición agrupa un conjunto específico de valores de funciones (interruptores booleanos, límites numéricos, configuraciones de cadena) en un plan con nombre que se puede asignar a los inquilinos a través de suscripciones.",
      whatTitle: "¿Qué son las Ediciones?",
      whatContent:
        "Una Edición es un plan con nombre (p. ej., 'Básico', 'Pro', 'Enterprise') que define una combinación específica de valores de funciones. Cuando un inquilino se suscribe a una edición, obtiene acceso automáticamente a exactamente las funciones que define esa edición: ni más, ni menos.",
      scopeTitle: "Ediciones del Sistema vs Minoristas (Retail)",
      tblScopeH1: "Alcance",
      tblScopeH2: "Creado Por",
      tblScopeH3: "Caso de Uso",
      tblScopeR1C1: "Sistema",
      tblScopeR1C2: "Propietario de la plataforma (inquilino raíz)",
      tblScopeR1C3:
        "Planes globales disponibles para todos los inquilinos (Básico, Pro, Enterprise)",
      tblScopeR2C1: "Minorista (Retail)",
      tblScopeR2C2: "Inquilinos revendedores",
      tblScopeR2C3: "Planes personalizados para inquilinos secundarios (reventa de marca blanca)",
      overflowTitle: "Políticas de Desbordamiento (Overflow Policies)",
      overflowContent:
        "Cuando un inquilino excede los límites de su edición, la política de desbordamiento determina el comportamiento. Esto crea caminos naturales de ventas adicionales (upsell) sin romper la experiencia del usuario.",
      overflowUpgrade: "Sugerir Upgrade",
      overflowUpgradeDesc:
        "Cuando se alcanzan los límites, el sistema devuelve una sugerencia de mejora (upgrade) apuntando a la edición de desbordamiento, creando una ruta de upsell perfecta.",
      overflowBlock: "Bloqueo Duro (Hard Block)",
      overflowBlockDesc:
        "Aplicar estrictamente el límite. Los comandos se rechazan con un mensaje de error claro que indica que la función está al máximo de su capacidad para el plan actual.",
      versionTitle: "Versionado e Implementaciones",
      versionContent:
        "Las versiones de edición le permiten modificar las funciones del plan sin interrumpir a los suscriptores existentes. Cree una nueva versión con valores de funciones actualizados y luego elija su estrategia de implementación.",
      tblRollH1: "Estrategia",
      tblRollH2: "Comportamiento",
      tblRollH3: "Mejor Para",
      tblRollR1C1: "Inmediata",
      tblRollR1C2: "Todos los inquilinos suscritos se actualizan al instante",
      tblRollR1C3: "Corrección de errores, parches de seguridad",
      tblRollR2C1: "Canary",
      tblRollR2C2: "Implementación gradual basada en porcentajes",
      tblRollR2C3: "Experimentos de funciones, mitigación de riesgos",
      tblRollR3C1: "Programada",
      tblRollR3C2: "Implementar en una fecha/hora específica",
      tblRollR3C3: "Lanzamientos de productos alineados, ciclos de facturación",
      apiTitle: "Puntos de Conexión API (Endpoints)",
      tip: "Las ediciones nunca se eliminan de la base de datos: se eliminan lógicamente (soft-delete) para preservar el historial de suscripciones y los registros de auditoría. Las suscripciones activas impiden por completo la eliminación de la edición.",
    },
    entSubscriptions: {
      title: "Gestión de Suscripciones",
      description:
        "Gestión completa del ciclo de vida de las suscripciones de los inquilinos con precios multidivisa, descuentos promocionales, análisis de impacto de upgrade/downgrade, pruebas, manejo de expiraciones y exportación analítica integral.",
      intro:
        "Las suscripciones son el puente entre los inquilinos y las ediciones. Definen en qué plan se encuentra un inquilino, cuándo comienza y expira, y cómo se comporta el sistema cuando cambia el ciclo de vida de la suscripción. Con precios multidivisa integrados y seguimiento de descuentos promocionales, NEXORA proporciona todo lo necesario para la monetización.",
      lifecycleTitle: "Ciclo de Vida de la Suscripción",
      lifecycleContent:
        "Toda suscripción sigue una máquina de estados bien definida. El sistema impone automáticamente transiciones válidas y emite eventos de dominio en cada etapa para fines de auditoría e integración.",
      typesTitle: "Tipos de Suscripción",
      tblTypeH1: "Tipo",
      tblTypeH2: "Duración",
      tblTypeH3: "Caso de Uso",
      tblTypeR1C1: "Estándar",
      tblTypeR1C2: "Período fijo con fecha de expiración",
      tblTypeR1C3: "Suscripciones comerciales regulares",
      tblTypeR2C1: "Prueba (Trial)",
      tblTypeR2C2: "Período de evaluación a corto plazo",
      tblTypeR2C3: "Pruebas gratuitas que se auto-convierten o expiran",
      tblTypeR3C1: "Complemento (Add-on)",
      tblTypeR3C2: "Suplementario a la suscripción principal",
      tblTypeR3C3: "Paquetes de funciones adicionales (p. ej., almacenamiento extra)",
      pricingTitle: "Motor de Precios Multidivisa",
      pricingContent:
        "Cada suscripción almacena sus precios en la divisa nativa del inquilino mientras normaliza automáticamente a USD para análisis de ingresos unificados. Soporte para 9+ divisas listas para usar — USD, EUR, GBP, SAR, AED, EGP, TRY, INR, y más.",
      tblPriceH1: "Campo",
      tblPriceH2: "Propósito",
      tblPriceH3: "Ejemplo",
      tblPriceR1C1: "Currency",
      tblPriceR1C2: "Código de divisa ISO 4217 para esta suscripción",
      tblPriceR1C3: "SAR, USD, EUR",
      tblPriceR2C1: "BaseAmount",
      tblPriceR2C2: "Precio original antes de cualquier ajuste",
      tblPriceR2C3: "499.00",
      tblPriceR3C1: "AdjustmentAmount",
      tblPriceR3C2: "Descuento o recargo aplicado",
      tblPriceR3C3: "-49.90 (promo 10%)",
      tblPriceR4C1: "TotalAmount",
      tblPriceR4C2: "Monto final cobrado en divisa local",
      tblPriceR4C3: "449.10",
      tblPriceR5C1: "ExchangeRateToUsd",
      tblPriceR5C2: "Tasa utilizada para normalizar a USD",
      tblPriceR5C3: "0.2667",
      tblPriceR6C1: "TotalAmountUsd",
      tblPriceR6C2: "Valor normalizado en USD para analítica",
      tblPriceR6C3: "119.76",
      promoTitle: "Descuentos Promocionales",
      promoContent:
        "Impulse la adquisición y retención con soporte de códigos promocionales integrado en cada suscripción. Las promociones aplicadas se rastrean con el nombre del código y el porcentaje de descuento para visibilidad completa de auditoría y analítica.",
      fgPromoCode: "Seguimiento de Códigos Promocionales",
      fgPromoCodeDesc:
        "Cada suscripción registra su AppliedPromoCode y su porcentaje PromotionDiscount. Los paneles analíticos muestran qué promociones generan más conversiones.",
      fgPromoAdjust: "Ajuste Automático",
      fgPromoAdjustDesc:
        "Cuando se aplica una promoción, AdjustmentAmount se calcula automáticamente a partir de BaseAmount × PromotionDiscount, garantizando precios consistentes en todas las suscripciones.",
      opsTitle: "Operaciones Clave",
      opsAssign: "Asignar Suscripción",
      opsAssignDesc:
        "Vincular un inquilino a una edición con fecha de inicio, duración, divisa, código promocional opcional y configuración de renovación automática.",
      opsUpgrade: "Mejorar Plan (Upgrade)",
      opsUpgradeDesc:
        "Mover un inquilino a una edición superior. Las nuevas funciones están disponibles inmediatamente y el período de suscripción se puede ajustar.",
      opsDowngrade: "Bajar Plan (Downgrade)",
      opsDowngradeDesc:
        "Mover a una edición inferior. El sistema proporciona un análisis de impacto completo que muestra qué funciones se perderán antes de confirmar.",
      opsImpact: "Análisis de Impacto",
      opsImpactDesc:
        "Antes de cualquier downgrade, la API devuelve un análisis detallado de las funciones afectadas y el uso actual, evitando la pérdida de datos por sorpresa.",
      expiryTitle: "Comportamiento de Expiración",
      tblExpH1: "Política",
      tblExpH2: "Comportamiento",
      tblExpH3: "Caso de Uso",
      tblExpR1C1: "Período de Gracia",
      tblExpR1C2: "Las funciones permanecen activas durante N días después de la expiración",
      tblExpR1C3: "Dar tiempo a los clientes para renovar",
      tblExpR2C1: "Bloqueo Inmediato",
      tblExpR2C2: "Funciones deshabilitadas en el momento en que expira la suscripción",
      tblExpR2C3: "Aplicación estricta de cuotas",
      tblExpR3C1: "Edición Fallback",
      tblExpR3C2: "Bajar automáticamente a la edición predeterminada (gratuita)",
      tblExpR3C3: "Modelos Freemium con upgrades de pago",
      exportTitle: "Exportación Analítica Avanzada",
      exportContent:
        "Genere informes analíticos completos de suscripciones en formatos CSV, Excel y PDF. Los informes incluyen filtrado avanzado (rango de fechas, próximos a expirar, estado, edición), visualización multidivisa e indicadores de expiración con código de colores.",
      fgExportCsv: "Exportación CSV",
      fgExportCsvDesc:
        "Formato ligero separado por comas, ideal para análisis de datos e importación en herramientas BI como Power BI, Tableau o Google Sheets.",
      fgExportExcel: "Exportación Excel",
      fgExportExcelDesc:
        "Libro de trabajo XLSX profesional con encabezados estilizados, metadatos de filtros, formato condicional para fechas de expiración y columnas auto-dimensionadas — impulsado por ClosedXML.",
      fgExportPdf: "Exportación PDF",
      fgExportPdfDesc:
        "Documento listo para imprimir con portada personalizada, resumen estadístico y tablas de datos paginadas con columna 'Días Restantes' con código de colores — impulsado por QuestPDF.",
      enterpriseTitle: "Gestión de Suscripciones Empresariales",
      renewalTitle: "Pista de Auditoría de Ingresos Inmutable",
      renewalDesc:
        "Las renovaciones crean NUEVAS filas de suscripción en lugar de sobrescribir registros existentes. Cada ciclo de facturación preserva los precios fijados para tendencias de MRR precisas y auditorías financieras.",
      promoExpiryTitle: "Caducidad de Promociones Inteligente",
      promoExpiryDesc:
        "Las promociones con límite de tiempo se rastrean automáticamente vía PromotionExpiresAt. Al renovar, las promociones expiradas se eliminan — los nuevos precios entran en vigor sin intervención.",
      concurrencyTitle: "Protección contra Condiciones de Carrera",
      concurrencyDesc:
        "Sellos de concurrencia optimista en cada suscripción previenen colisiones entre operaciones paralelas. Integridad de datos empresarial sin penalizaciones de rendimiento.",
      validationTitle: "Validación a Nivel de Pipeline",
      validationDesc:
        "Los 8 comandos de suscripción están protegidos por validadores FluentValidation con mensajes de error completamente localizados en inglés y árabe.",
      crossModuleTitle: "Integración Inter-Módulos con Administradores",
      crossModuleDesc:
        "Los eventos del ciclo de vida se propagan automáticamente a la gestión de identidad. Al suspender, todos los administradores del inquilino se desactivan. Al reanudar, solo se reactivan los desactivados por suspensión.",
      apiTitle: "Puntos de Conexión API (Endpoints)",
      tip: "La API de análisis de impacto de downgrade es una poderosa herramienta de retención de ventas. Muestre a los clientes exactamente lo que perderán antes de que bajen de plan, creando momentos naturales de retención.",
    },
    entFeatures: {
      title: "Gestión de Funciones (Features)",
      description:
        "Defina, categorice y aplique funciones booleanas, numéricas y de cadena (string) con seguimiento automático de cuotas y almacenamiento en caché de alto rendimiento.",
      intro:
        "Las funciones son los bloques de construcción atómicos de su sistema de derechos. Cada capacidad que se puede alternar, limitar o configurar por plan se define como una Función. El sistema admite tres tipos de valores, sembrado automático y aplicación de cuotas en tiempo real.",
      typesTitle: "Tipos de Valores de Funciones",
      typesContent:
        "Cada función tiene un tipo de valor específico que determina cómo se evalúa, almacena y aplica en las ediciones y sobreescrituras.",
      tblTypeH1: "Tipo",
      tblTypeH2: "Valores",
      tblTypeH3: "Ejemplo",
      tblTypeH4: "Aplicación (Enforcement)",
      tblTypeR1C1: "Booleano",
      tblTypeR1C2: "true / false",
      tblTypeR1C3: "ApiAccess, CustomDomain, SSO",
      tblTypeR1C4: "Control de funciones (gate): permitir o bloquear",
      tblTypeR2C1: "Numérico",
      tblTypeR2C2: "Valor entero",
      tblTypeR2C3: "MaxUsers: 50, StorageGB: 100",
      tblTypeR2C4: "QuotaCounter: auto-rechazar cuando se excede",
      tblTypeR3C1: "Cadena (String)",
      tblTypeR3C2: "Texto libre",
      tblTypeR3C3: "SupportTier: 'Priority', Theme: 'dark'",
      tblTypeR3C4: "Valor de configuración, sin aplicación estricta",
      systemTitle: "Funciones del Sistema vs Personalizadas",
      fgSystem: "Funciones del Sistema",
      fgSystemDesc:
        "Sembradas previamente al inicio de la aplicación. Inmutables y siempre presentes. Definen las capacidades principales de su plataforma (p. ej., MaxUsers, ApiAccess).",
      fgCustom: "Funciones Personalizadas",
      fgCustomDesc:
        "Creadas por administradores en tiempo de ejecución a través de la API. Perfectas para funciones específicas de módulos que evolucionan a medida que su producto crece.",
      quotaTitle: "Aplicación Automática de Cuotas",
      quotaContent:
        "Las funciones numéricas pueden tener entidades QuotaCounter asociadas que rastrean el uso en tiempo real. Cuando un comando implementa IRequireFeature para una función numérica, la pipeline FeatureCheckBehavior compara automáticamente el conteo actual con el límite permitido.",
      cacheTitle: "Almacenamiento en Caché de Alto Rendimiento",
      cacheContent:
        "Los valores de las funciones resueltas se almacenan agresivamente en caché por inquilino para garantizar verificaciones de autorización sin latencia. La caché se invalida automáticamente cada vez que cambian las ediciones, suscripciones o sobreescrituras.",
      cachePerf: "Búsquedas Sub-Milisegundo",
      cachePerfDesc:
        "Las funciones resueltas se almacenan en la memoria (in-memory) por inquilino. Las verificaciones de la pipeline se completan en microsegundos, no en milisegundos.",
      cacheInv: "Invalidación Automática",
      cacheInvDesc:
        "Cualquier cambio en las ediciones, suscripciones o sobreescrituras invalida inmediatamente la caché de funciones del inquilino afectado.",
      apiTitle: "Puntos de Conexión API (Endpoints)",
      tip: "Las funciones del sistema se siembran automáticamente desde su código en cada inicio de la aplicación. Esto significa que su catálogo de funciones se mantiene perfectamente sincronizado con su base de código real: no se requiere gestión manual de la base de datos.",
    },
    entOverrides: {
      title: "Sobreescrituras por Inquilino",
      description:
        "Personalice los valores de las funciones para inquilinos individuales independientemente de su plan suscrito, con registros de auditoría completos y expiración opcional.",
      intro:
        "Las sobreescrituras son la vía de escape que hace que su sistema de derechos sea lo suficientemente flexible para el mundo real. Los acuerdos empresariales, las ofertas promocionales, las pruebas beta y las excepciones regulatorias requieren la capacidad de personalizar las funciones por inquilino sin cambiar el plan subyacente.",
      priorityTitle: "Cadena de Prioridad de Resolución",
      priorityContent:
        "Las sobreescrituras se sitúan en la parte superior de la cadena de prioridad de resolución. Cuando el sistema resuelve un valor de función para un inquilino, una sobreescritura siempre gana, independientemente de lo que diga la edición o el valor predeterminado.",
      useCasesTitle: "Casos de Uso en el Mundo Real",
      ucEnterprise: "Acuerdos Empresariales Personalizados",
      ucEnterpriseDesc:
        "Un cliente Fortune 500 necesita 10,000 usuarios en un plan Pro que normalmente tiene un límite de 500. Establezca una sobreescritura: sin cambios de código, sin compilaciones personalizadas.",
      ucPromo: "Upgrades Promocionales",
      ucPromoDesc:
        "Dé a un inquilino funciones Premium durante 30 días como oferta promocional. Establezca una sobreescritura con expiración que se revierte automáticamente después del período de promoción.",
      ucBeta: "Acceso a Funciones Beta",
      ucBetaDesc:
        "Habilite una función experimental para inquilinos seleccionados antes de implementarla en todos los planes. Sobreescriba la función para inquilinos específicos durante la versión beta.",
      ucExpiring: "Excepciones de Tiempo Limitado",
      ucExpiringDesc:
        "Los requisitos normativos pueden exigir un acceso temporal a funciones. Establezca una sobreescritura con una fecha de expiración: el sistema la revierte automáticamente cuando expira.",
      settingTitle: "Establecer una Sobreescritura",
      settingContent:
        "Las sobreescrituras se establecen a través de una simple llamada a la API. Cada sobreescritura incluye la función, el valor personalizado, una fecha de expiración opcional y un motivo con fines de auditoría.",
      auditTitle: "Registro de Auditoría",
      auditContent:
        "Cada acción de sobreescritura está totalmente auditada. El sistema rastrea quién estableció la sobreescritura, cuándo se estableció, el valor anterior y el motivo proporcionado.",
      tblAuditH1: "Evento",
      tblAuditH2: "Datos Rastreados",
      tblAuditH3: "Propósito",
      tblAuditR1C1: "Sobreescritura Creada",
      tblAuditR1C2: "Función, inquilino, valor, motivo, actor, marca de tiempo",
      tblAuditR1C3: "Cumplimiento y responsabilidad",
      tblAuditR2C1: "Sobreescritura Actualizada",
      tblAuditR2C2: "Valor anterior, nuevo valor, motivo, actor",
      tblAuditR2C3: "Seguimiento del historial de cambios",
      tblAuditR3C1: "Sobreescritura Expirada/Eliminada",
      tblAuditR3C2: "Función, inquilino, valor final, actor",
      tblAuditR3C3: "Verificación de reversión",
      apiTitle: "Puntos de Conexión API (Endpoints)",
      tip: "Las sobreescrituras son la herramienta más poderosa de su arsenal de ventas. Permiten a su equipo de ventas cerrar acuerdos empresariales en minutos, no en sprints de ingeniería.",
    },
  },
};

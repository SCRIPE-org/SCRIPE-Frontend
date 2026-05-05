/**
 * Docs page locale — ES
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const es = {
  architecture: {
    overview: {
      title: "Visión General de la Arquitectura",
      description:
        "Capas de Clean Architecture, pipeline backend, flujo SOLID frontend y reglas de límites de módulos.",
      intro:
        "NEXORA sigue una Clean Architecture estricta con cuatro capas: Presentación, Aplicación, Dominio e Infraestructura. La regla de dependencias garantiza que las capas internas nunca dependan de las externas. Esta arquitectura se aplica al backend y al frontend.",
      layersTitle: "Capas de Arquitectura Limpia",
      backendArchTitle: "Arquitectura del Backend",
      backendArchIntro:
        "El backend sigue una arquitectura de pipeline de solicitudes donde cada solicitud HTTP fluye a través de middlewares, controladores, comportamientos (behaviors) de NEXORA mediator y, finalmente, el manejador CQRS. Esto garantiza validación, auditoría y manejo de errores consistentes.",
      frontendArchTitle: "Arquitectura del Frontend",
      frontendArchIntro:
        "El frontend utiliza un patrón SOLID View/ViewModel donde las Vistas son UI pura (sin estado ni lógica) y los ViewModels contienen toda la lógica de negocio. El patrón conector separa el enrutamiento de Next.js (Server Components) de la lógica de la aplicación (Client Components).",
      moduleBoundariesTitle: "Límites de los Módulos",
      moduleBoundariesIntro:
        "Los módulos son islas aisladas. No pueden importar dependencias entre sí. Esto permite un desarrollo independiente, contención de fallos y la capacidad de extraer módulos a repositorios separados.",
      withBoundaries: "Con Límites de Módulo",
      withoutBoundaries: "Sin Límites de Módulo",
      communicationPatternsTitle: "Comunicación entre Módulos",
      crossModuleNote:
        "El patrón de Bus de Eventos (Event Bus) está planeado para futuras versiones. Actualmente, los módulos se comunican exclusivamente mediante navegación por URL e IDs compartidos.",
    },
    backend: {
      title: "Arquitectura del Backend",
      description:
        "Anatomía de Program.cs, pipeline de middlewares, mapa de inyección de dependencias (DI), patrón de registro de módulos y catálogo de controladores.",
      intro:
        "El backend de NEXORA es un Monolito Modular en .NET 10 con 288 líneas en Program.cs que conectan 16 registros de servicios, 10 componentes de middleware y 18 controladores REST. Esta página desglosa cada capa de la arquitectura del backend.",
      programCsTitle: "Anatomía de Program.cs",
      programCsIntro:
        "Program.cs es el punto de entrada de la aplicación y el centro de cableado. Detecta el modo de despliegue, registra servicios en un orden específico y construye el pipeline de middleware. El archivo sigue una clara estructura de 5 secciones.",
      middlewarePipelineTitle: "Pipeline de Middleware",
      middlewarePipelineIntro:
        "El pipeline de middleware procesa cada solicitud HTTP en un orden específico. Cada middleware puede interrumpir el flujo (ej. el limitador de tasa devuelve 429, la autenticación devuelve 401). El orden importa: alterarlo puede romper la seguridad.",
      diMapTitle: "Mapa de Servicios DI",
      diMapIntro:
        "La siguiente tabla muestra todas las interfaces de servicios principales, sus implementaciones, ciclos de vida (lifetimes) y dónde se registran. Entender este mapa es fundamental para depurar y extender el sistema.",
      modulePatternTitle: "Patrón de Registro de Módulos",
      modulePatternIntro:
        "Cada nuevo módulo sigue el mismo patrón de registro de Inyección de Dependencias. El método de extensión AddXxxModule() registra el DbContext del módulo, repositorios, servicios y el marcador de registro del módulo.",
      controllersTitle: "Controladores",
      controllerTip:
        "Todos los controladores heredan de un ApiController base que proporciona un mapeo de respuesta estandarizado Result<T>. Los controladores deben ser ligeros: solo validan el modelo de solicitud y delegan el trabajo a NEXORA mediator.",
    },
    frontend: {
      title: "Arquitectura del Frontend",
      description:
        "Patrón SOLID View/ViewModel, estructura de módulos y el patrón conector para la integración con Next.js.",
      intro:
        "El frontend de NEXORA está construido con Next.js 16 (App Router) siguiendo un estricto patrón SOLID View/ViewModel. Cada página está compuesta por una Vista (View) de UI pura que delega toda la lógica a los hooks del ViewModel. Esta separación garantiza la testeabilidad, reutilización y mantenibilidad.",
      solidPatternTitle: "Patrón SOLID View/ViewModel",
      solidPatternIntro:
        "El patrón SOLID asegura que cada pieza de la UI tenga una sola responsabilidad. Las Vistas renderizan JSX, los ViewModels administman el estado y la lógica, y los Componentes proporcionan secciones de UI reutilizables.",
      viewRulesTitle: "Reglas de la Vista (View)",
      viewDo: "Una Vista DEBE",
      viewDont: "Una Vista NO DEBE",
      viewExampleTitle: "Ejemplo de Vista",
      viewModelRulesTitle: "Reglas del ViewModel",
      viewModelRulesIntro:
        "Los ViewModels son hooks de React que contienen toda la lógica de negocio. Componen ViewModels específicos de la sección (estadísticas, filtros, tablas) y devuelven interfaces tipadas consumidas por las Vistas.",
      moduleStructureTitle: "Estructura de Archivos del Módulo",
      connectorPatternTitle: "Patrón Conector",
      connectorPatternIntro:
        "El patrón conector separa las páginas del App Router de Next.js (Server Components) de las Vistas del módulo (Client Components). Las páginas en src/app/ son conectores delgados que importan y renderizan las Vistas del módulo. Solo manejan enrutamiento, metadatos y parámetros de URL.",
      connectorWarning:
        "NUNCA pongas lógica de negocio, peticiones de datos, formularios o gestión de estado en los archivos de src/app/. Estos son Server Components que solo conectan las rutas a las Vistas del módulo.",
    },
    cqrs: {
      title: "Patrón CQRS",
      description:
        "Separación de Responsabilidad de Comandos y Consultas con pipeline de NEXORA mediator, comportamientos (behaviors), validación y caché.",
      intro:
        "NEXORA usa el patrón CQRS (Command Query Responsibility Segregation) para separar las operaciones de lectura y escritura. Los comandos mutan el estado y pasan por comportamientos de validación y auditoría. Las consultas leen el estado y pueden aprovechar la caché. NEXORA mediator actúa como el mediador entre los controladores y los manejadores.",
      whatIsCqrsTitle: "¿Qué es CQRS?",
      whatIsCqrsIntro:
        "CQRS separa tu aplicación en dos lados: Comandos (escrituras) y Consultas (lecturas). Cada lado puede optimizarse de forma independiente: los comandos se centran en la integridad y validación de los datos, mientras que las consultas se centran en el rendimiento y la caché.",
      commandSide: "Lado de Comandos (Escritura)",
      querySide: "Lado de Consultas (Lectura)",
      pipelineTitle: "Pipeline de NEXORA mediator",
      validationBehaviorTitle: "Comportamiento de Validación",
      commandExampleTitle: "Ejemplo de Comando",
      queryExampleTitle: "Ejemplo de Consulta",
      cachingTip:
        "Las consultas pueden usar caché del lado del servidor para evitar consultar la base de datos en cada solicitud. La clave de la caché debe incluir todos los parámetros de la consulta para garantizar su unicidad. La caché se invalida automáticamente cuando los comandos relacionados tienen éxito.",
    },
    modules: {
      title: "Sistema de Módulos",
      description:
        "Reglas de aislamiento de módulos, plantillas backend/frontend, registro de módulos y comunicación entre módulos.",
      intro:
        "NEXORA utiliza un estricto sistema de módulos donde cada módulo es una isla aislada con límites claros. Los módulos no pueden importar código entre sí; solo se comunican a través de URLs, IDs compartidos o el bus de eventos central. Esto garantiza la independencia, testeabilidad y la capacidad de extraer módulos a repositorios separados.",
      isolationRulesTitle: "Reglas de Aislamiento de Módulos",
      allowedImportsTitle: "Importaciones Permitidas",
      forbiddenImportsTitle: "Importaciones Prohibidas",
      backendModuleTitle: "Plantilla de Módulo Backend",
      backendModuleIntro:
        "Cada módulo del backend sigue DDD (Domain-Driven Design) con tres proyectos: Dominio, Aplicación e Infraestructura. El Dominio es C# puro sin dependencias externas.",
      frontendModuleTitle: "Plantilla de Módulo Frontend",
      registryTitle: "Registro de Módulos",
      registryIntro:
        "El registro de módulos rastrea todos los módulos activos en tiempo de ejecución. Se popula durante el inicio de la aplicación cuando se resuelve y registra la implementación IModuleRegistration de cada módulo.",
      communicationTitle: "Patrones de Comunicación entre Módulos",
      pattern1Title: "Patrón 1: Navegación por URL",
      pattern1Content:
        "Navegar a la página de otro módulo mediante enlaces URL estándar. No se necesitan importaciones.",
      pattern2Title: "Patrón 2: Solo IDs Compartidos",
      pattern2Content:
        "Almacenar solo el ID de la entidad del módulo externo. Nunca incrustar la entidad completa.",
      pattern3Title: "Patrón 3: Bus de Eventos Central (Core Event Bus)",
      pattern3Content:
        "Publicar y suscribirse a eventos a través de un bus de eventos compartido en @core/. (Patrón futuro, aún no implementado).",
      boundaryWarning:
        "Los límites de los módulos son ley absoluta. Si necesitas compartir código entre módulos, DEBE ir en @core/. Cualquier importación desde @modules/{other}/ es una violación y será rechazada en la revisión de código.",
    },
    solidPattern: {
      title: "SOLID View/ViewModel",
      description:
        "Escenarios de tipos de página: Listas CRUD, paneles (dashboards), perfiles, ajustes, asistentes (wizards) y constructores de reportes.",
      intro:
        "El patrón SOLID View/ViewModel es obligatorio para todas las páginas en src/modules/. Esta guía cubre 7 escenarios de tipos de página con sus estructuras de directorios exactas, patrones de ViewModel y ejemplos de código.",
      principlesTitle: "Principios SOLID Aplicados",
      scenariosTitle: "Escenarios de Tipos de Página",
      scenariosIntro:
        "Elige el escenario que coincida con tu tipo de página. Cada uno proporciona una estructura probada que garantiza consistencia en toda la aplicación.",
      scenario1Title: "Escenario 1: Página de Lista CRUD",
      scenario1Intro:
        "Usado para gestionar colecciones de entidades (Usuarios, Productos, Pedidos). El orquestador compone los ViewModels de estadísticas, filtros y la tabla.",
      scenario2Title: "Escenario 2: Dashboard / Analítica",
      scenario2Intro:
        "Usado para KPIs, gráficos y métricas. Cada sección de gráfico o tarjeta tiene su propio ViewModel con selección de período y transformación de datos.",
      scenario3Title: "Escenario 3: Página de Detalle / Perfil",
      scenario3Intro:
        "Usado para ver una sola entidad con pestañas y secciones. El orquestador obtiene la entidad principal y compone los ViewModels de las pestañas.",
      scenario4Title: "Escenario 4: Página de Configuración",
      scenario4Intro:
        "Usado para múltiples secciones de formulario que se guardan independientemente. Cada sección tiene su propio ViewModel con el estado del formulario y la mutación de guardado.",
      scenario5Title: "Escenario 5: Asistente (Wizard) / Formulario Multipaso",
      scenario5Intro:
        "Usado para flujos complejos de varios pasos como el onboarding o checkout. El ViewModel del wizard coordina la navegación de los pasos, las validaciones y el envío combinado.",
      rulesTitle: "Reglas de Oro",
      antiPatternWarning:
        "Anti-patrón: Poner useState, useEffect o useQuery directamente en un componente Vista. TODO el estado y la lógica deben vivir en los ViewModels. Las Vistas son solo para la composición pura de la UI.",
    },
    stateManagement: {
      title: "Gestión de Estado (State Management)",
      description:
        "TanStack Query para el estado del servidor, Zustand para el estado global de UI y LanguageProvider para localización.",
      intro:
        "NEXORA utiliza tres herramientas de gestión de estado, cada una para una categoría específica: TanStack Query para datos del servidor (resultados de API), Zustand para el estado global de UI (autenticación, barra lateral, tema) y useState para el estado local del componente (formularios, interruptores).",
      decisionTitle: "Matriz de Decisión",
      tanstackTitle: "TanStack Query (Estado del Servidor)",
      tanstackIntro:
        "Usa TanStack Query para cualquier dato que provenga de la API. Maneja caché, recargas en segundo plano, paginación, actualizaciones optimistas y deduplicación de solicitudes automáticamente.",
      zustandTitle: "Zustand (Estado Global de UI)",
      zustandIntro:
        "Usa Zustand para el estado global de la UI que necesita ser compartido entre componentes pero que no proviene del servidor. Hay exactamente 3 stores aprobados.",
      antiPatternsTitle: "Anti-Patrones",
      doTitle: " SÍ HACER",
      dontTitle: " NO HACER",
      localizationTitle: "Localización (LanguageProvider)",
      localizationIntro:
        "La localización usa un LanguageProvider personalizado con persistencia en localStorage. Soporta 7 idiomas, detección automática de RTL/LTR y claves de traducción con notación de puntos (dot-notation) e interpolación.",
      noLocaleFoldersWarning:
        "¡NO uses carpetas [locale] en src/app/! La localización se maneja mediante el contexto de LanguageProvider, no a través de enrutamiento basado en archivos. Ni next-intl, ni next-i18next, ni URLs basadas en idioma (/en/, /es/).",
    },
    dataFlow: {
      title: "Flujo de Datos",
      description:
        "Diagramas de flujo de datos de extremo a extremo: consulta, mutación, pipeline backend, manejo de errores y estrategia de caché.",
      intro:
        "Entender cómo fluyen los datos a través de NEXORA es esencial para depurar y extender el sistema. Esta página rastrea los datos desde un clic en la UI hasta la base de datos y de regreso.",
      queryFlowTitle: "Flujo de Consulta (Lectura)",
      queryFlowIntro:
        "Cuando un usuario ve datos (ej. abrir la página de Usuarios), el flujo comienza en la Vista, pasa por el ViewModel, TanStack Query, el Repositorio, el Servicio API y finalmente la API del backend.",
      mutationFlowTitle: "Flujo de Mutación (Escritura)",
      backendPipelineTitle: "Pipeline de Solicitudes Backend",
      backendPipelineIntro:
        "Cada solicitud al backend pasa por 10 componentes de middleware y 3 comportamientos (behaviors) del pipeline de NEXORA mediator antes de llegar al manejador. Esto asegura una auditoría, autenticación, autorización y validación consistentes.",
      errorFlowTitle: "Manejo de Errores",
      errorFlowIntro:
        "Los errores se manejan en múltiples niveles. Cada origen de error tiene un manejador específico, código de respuesta y estrategia de manejo en el frontend.",
      cachingFlowTitle: "Estrategia de Caché",
      cachingFlowIntro:
        "El backend utiliza una estrategia de caché de dos niveles: L1 (IMemoryCache en proceso) y L2 (Redis distribuido). El frontend utiliza la caché integrada de TanStack Query con un staleTime configurable.",
      cacheTip:
        "Establece el staleTime en 5 minutos para datos que cambian con poca frecuencia (roles, permisos). Usa 0 para datos que cambian a menudo (logs de auditoría, notificaciones). Siempre invalida las consultas relacionadas después de mutaciones exitosas.",
    },
    domainModel: {
      title: "Modelo de Dominio (Domain Model)",
      description:
        "Jerarquía de herencia de entidades, AuditableEntity, ITenantAwareEntity, ciclo de vida del borrado lógico (soft-delete), abstracciones de repositorio y filtros de consulta globales.",
      intro:
        "El modelo de dominio de NEXORA sigue una estricta jerarquía de herencia donde todas las entidades de negocio heredan de AuditableEntity, lo que proporciona campos de auditoría y soporte para borrado lógico. Las entidades vinculadas a inquilinos implementan adicionalmente ITenantAwareEntity para el aislamiento automático a nivel de fila.",
      entityHierarchyTitle: "Jerarquía de Herencia de Entidades",
      entityHierarchyIntro:
        "Todas las entidades de dominio siguen una cadena de herencia de tres niveles: IEntity (interfaz marcadora) → Entity<TId> (identidad + igualdad + eventos de dominio) → AuditableEntity (campos de auditoría + borrado lógico). Las entidades que pertenecen a un inquilino específico también implementan la interfaz ITenantAwareEntity.",
      ientityTitle: "Interfaz IEntity",
      entityBaseTitle: "Clase Base Entity<TId>",
      entityBaseIntro:
        "La clase base Entity<TId> proporciona igualdad de identidad, generación de código hash y soporte para eventos de dominio.",
      entityDomainEventNote:
        "Los eventos de dominio emitidos a través de RaiseDomainEvent() son recolectados por el OutboxInterceptor durante SaveChanges y persistidos en la misma transacción.",
      auditableEntityTitle: "AuditableEntity (Entidad Auditable)",
      auditableEntityIntro:
        "AuditableEntity añade 7 campos de auditoría y borrado lógico a la Entidad base. Estos campos se llenan automáticamente por el AuditableEntityInterceptor; nunca se establecen manualmente en tu código.",
      tenantAwareTitle: "ITenantAwareEntity",
      tenantAwareIntro:
        "Las entidades que implementan ITenantAwareEntity están automáticamente limitadas al inquilino actual mediante los filtros de consulta globales de EF Core.",
      tenantIsolationWarning:
        "Nunca evites el aislamiento del inquilino sin autorización explícita. Usar IgnoreQueryFilters() elimina TODOS los filtros, incluyendo el alcance del inquilino.",
      softDeleteTitle: "Ciclo de Vida del Borrado Lógico (Soft-Delete)",
      softDeleteIntro:
        "Todas las entidades usan borrado lógico mediante la bandera IsDeleted. Cuando se llama a un endpoint DELETE, se convierte en un borrado lógico ocultando el registro de las consultas normales.",
      repositoryTitle: "Abstracciones de Repositorio",
      repositoryIntro:
        "NEXORA define tres interfaces de repositorio: IReadRepository<T> para consultas, IWriteRepository<T> para mutaciones e IRepository<T> que combina ambos.",
      concreteEntitiesTitle: "Registro de Entidades Concretas",
      queryFiltersTitle: "Filtros de Consulta Globales",
      queryFiltersIntro:
        "Los filtros de consulta globales de EF Core se aplican a todas las entidades que heredan de AuditableEntity y/o ITenantAwareEntity de forma automática en todas las consultas LINQ.",
      ignoreFiltersTip:
        "Usa IgnoreQueryFilters() solo en operaciones de la Papelera de Reciclaje y consultas trans-inquilino de SuperAdmins. Acompáñalo siempre con un filtro manual de inquilino para prevenir fugas de datos.",
      bestPracticesTitle: "Mejores Prácticas",
      doTitle: "✅ SÍ HACER",
      dontTitle: "❌ NO HACER",
    },
    domainEvents: {
      title: "Eventos de Dominio (Domain Events)",
      description:
        "Interfaz IDomainEvent, patrón Outbox, OutboxInterceptor, OutboxProcessor y entrega garantizada de eventos.",
      intro:
        "Los eventos de dominio representan sucesos significativos en el dominio del negocio. NEXORA utiliza el Patrón Outbox para garantizar la entrega confiable de los eventos: estos se persisten en la misma transacción de la base de datos que los cambios de la entidad y son procesados de manera asíncrona.",
      interfaceTitle: "Interfaz IDomainEvent",
      interfaceIntro:
        "Todos los eventos de dominio implementan la interfaz IDomainEvent, que hereda de INotification de NEXORA mediator. Esto permite publicador/suscriptor en proceso donde múltiples manejadores pueden suscribirse al mismo evento.",
      publishingTitle: "Flujo de Publicación y Manejo",
      publishingIntro:
        "Los eventos de dominio siguen un ciclo de vida de 6 pasos: se emite el evento, OutboxInterceptor lo captura, se persiste como OutboxMessage, OutboxProcessor lo sondea y finalmente se publica.",
      publisherTitle: "IDomainEventPublisher",
      outboxTitle: "Patrón Outbox",
      outboxIntro:
        "El patrón Outbox resuelve el problema de la doble escritura: cómo actualizar atómicamente la base de datos Y publicar un evento al mismo tiempo.",
      outboxWarning:
        "El patrón Outbox proporciona una entrega de 'al menos una vez' (at-least-once), no 'exactamente una vez'. Los manejadores de eventos deben ser idempotentes.",
      outboxMessageTitle: "Entidad OutboxMessage",
      outboxInterceptorTitle: "OutboxInterceptor",
      outboxInterceptorIntro:
        "OutboxInterceptor es un interceptor de SaveChanges de EF Core que se ejecuta ANTES de que la transacción se confirme, serializando los eventos en la misma transacción.",
      outboxProcessorTitle: "OutboxProcessor",
      outboxProcessorIntro:
        "Un servicio en segundo plano (BackgroundService) que revisa la tabla OutboxMessage cada 5 segundos buscando mensajes no procesados.",
      outboxCleanupTitle: "Trabajo de Limpieza del Outbox",
      outboxCleanupIntro:
        "Un trabajo recurrente en Hangfire que se ejecuta diariamente para eliminar mensajes de Outbox procesados que tienen más de 7 días.",
      architectureSummaryTitle: "Resumen de la Arquitectura Outbox",
      customEventsTitle: "Creación de Eventos de Dominio Personalizados",
      customEventsIntro: "Sigue estos 3 pasos para agregar un nuevo evento de dominio a NEXORA.",
      step1Title: "1. Definir el Evento",
      step1Content:
        "Crea un 'record' que implemente IDomainEvent en el directorio Domain/Events/ del módulo.",
      step2Title: "2. Emitir desde el Manejador del Comando",
      step2Content:
        "Llama a entity.RaiseDomainEvent() en el manejador del comando, luego llama a SaveChangesAsync.",
      step3Title: "3. Crear Manejadores del Evento",
      step3Content:
        "Implementa INotificationHandler<DomainEventNotification> para reaccionar al evento.",
      reliabilityTitle: "Garantías de Confiabilidad",
      withOutboxTitle: "✅ Con Patrón Outbox",
      withoutOutboxTitle: "❌ Sin Patrón Outbox",
    },
    cqrsPipeline: {
      title: "Pipeline CQRS",
      description:
        "Comportamientos del pipeline del mediador NEXORA: LoggingBehavior, ValidationBehavior, FeatureCheckBehavior, WebhookDispatchBehavior, CachingBehavior, patrón Result y mapa completo de comandos/consultas.",
      intro:
        "Cada comando y consulta en NEXORA pasa por un pipeline configurable del mediador NEXORA con 5 comportamientos integrados: LoggingBehavior, ValidationBehavior, FeatureCheckBehavior, WebhookDispatchBehavior y CachingBehavior. El orden se administra desde appsettings o variables de entorno y se valida al iniciar.",
      overviewTitle: "Visión General del Pipeline",
      overviewIntro:
        "El orden predeterminado es Logging -> Validation -> FeatureCheck -> WebhookDispatch -> Caching -> Handler. La validación y las verificaciones de funciones se ejecutan antes de leer caché, y la invalidación de caché se completa antes del envío de webhooks tras mutaciones exitosas.",
      separationTitle: "Separación de Comandos y Consultas",
      separationIntro:
        "CQRS separa la aplicación en dos rutas distintas: Comandos (escrituras) que mutan el estado y Consultas (lecturas) optimizadas para el rendimiento.",
      commandsTitle: "Comandos (Escritura)",
      queriesTitle: "Consultas (Lectura)",
      resultPatternTitle: "Patrón Result",
      resultPatternIntro:
        "Todos los manejadores devuelven Result<T> en lugar de lanzar excepciones para los fallos esperados. Esto elimina los bloques try-catch en los controladores.",
      validationTitle: "Comportamiento de Validación (ValidationBehavior)",
      validationIntro:
        "ValidationBehavior se ejecuta justo después del logging. Reúne todos los validadores IValidator<TRequest>, devuelve errores Result estructurados para solicitudes inválidas e impide que lleguen al handler o a la caché.",
      validatorExampleTitle: "Ejemplos de Validadores",
      loggingTitle: "Comportamiento de Registro (LoggingBehavior)",
      loggingIntro:
        "Registra cada solicitud de NEXORA mediator con el ID del usuario, ID del inquilino, tipo de solicitud y tiempo de ejecución.",
      cachingTitle: "Comportamiento de Caché (CachingBehavior)",
      cachingIntro:
        "Intercepta las consultas que implementan la interfaz ICacheable. Verifica la caché antes de ejecutar el manejador.",
      commandMapTitle: "Catálogo de Comandos y Consultas",
      commandMapIntro:
        "La siguiente tabla enumera cada comando, consulta y validador registrado en el sistema.",
      registrationTitle: "Registro del Pipeline",
      registrationIntro:
        "AddCoreApplication() registra los comportamientos del pipeline desde las opciones de Mediator. El escaneo de handlers, la validación de cobertura, la política de fallo de notificaciones y el orden del pipeline se controlan desde configuración.",
      behaviorOrderTip:
        "La validación de seguridad predeterminada rechaza órdenes donde Caching se ejecuta antes que Validation o FeatureCheck. Desactiva Mediator__EnforceSecurityPipelineOrder solo si controlas completamente el riesgo.",
      featureCheckTitle: "FeatureCheckBehavior",
      featureCheckIntro:
        "El FeatureCheckBehavior intercepta los comandos que implementan IRequireFeature. Verifica si la Edición del inquilino permite la funcionalidad solicitada llamando a IFeatureChecker.IsEnabledAsync. Si la funcionalidad está deshabilitada, devuelve un error Forbidden sin ejecutar el manejador. Las operaciones a nivel de sistema (sin TenantId) omiten esta verificación.",
      featureCheckMarkerTitle: "Marcador IRequireFeature",
      featureCheckMarkerIntro:
        "Los comandos optan por el control de funcionalidades implementando la interfaz IRequireFeature con una propiedad RequiredFeatureName. Cuando el módulo de Entitlements no está desplegado, NoOpFeatureChecker devuelve true para todas las verificaciones, convirtiendo este comportamiento en un paso silencioso.",
    },
    dependencyInjection: {
      title: "Inyección de Dependencias (DI)",
      description:
        "Flujo de registro de Program.cs, patrón DI de módulos, descubrimiento de servicios, mapas de servicios, reglas de ciclo de vida (lifetimes) y Gateway YARP.",
      intro:
        "NEXORA utiliza el contenedor de Inyección de Dependencias integrado de .NET con un patrón de registro estructurado.",
      architectureTitle: "Arquitectura de Registro DI",
      architectureIntro:
        "Program.cs sigue un estricto orden de registro de 4 fases: (1) Infraestructura Central, (2) CORS y Limitación de Tasa, (3) Módulos, (4) Capa de Aplicación.",
      moduleRegTitle: "Patrón de Registro de Módulos",
      moduleRegIntro:
        "Cada módulo expone un método de extensión AddXxxModule() que registra todos sus servicios dependiendo de la variable MODULE_NAME.",
      monolithNote:
        "En modo monolito, TODOS los módulos se cargan. En modo microservicio, cada módulo se ejecuta como un proceso independiente.",
      controllerProviderTitle: "Proveedor de Características de Controlador de Módulo",
      controllerProviderIntro:
        "Filtra qué controladores se cargan en el inicio basándose en MODULE_NAME.",
      serviceDiscoveryTitle: "Descubrimiento de Servicios (Service Discovery)",
      serviceDiscoveryIntro:
        "NEXORA usa un descubrimiento de servicios basado en configuración para resolver nombres de servicios a URLs en entornos de microservicios.",
      coreServicesTitle: "Servicios de Infraestructura Central",
      coreServicesIntro:
        "Los siguientes servicios son registrados por AddCoreInfrastructure() y están disponibles para todos los módulos.",
      identityModuleTitle: "Servicios del Módulo de Identidad",
      identityModuleIntro:
        "El módulo Identity registra múltiples repositorios e interfaces de servicio bajo el alcance (Scoped) HTTP.",
      lifetimeTitle: "Reglas de Ciclo de Vida de los Servicios (Lifetimes)",
      singletonTitle: "Ciclo de Vida Singleton",
      scopedTitle: "Ciclo de Vida Scoped (Por Solicitud)",
      gatewayTitle: "Configuración del Gateway YARP",
      gatewayIntro:
        "Cuando MODULE_NAME=Gateway, la aplicación actúa como un proxy inverso YARP que enruta solicitudes a los microservicios.",
      bestPracticesTitle: "Mejores Prácticas de DI",
      captiveTip:
        "Evita las dependencias cautivas (Captive Dependencies), que ocurren cuando un servicio Singleton inyecta un servicio Scoped. Usa IServiceScopeFactory en su lugar.",
    },
  },
};

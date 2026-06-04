export const es = {
  architecture: {
    backend: {
      controllersTitle: "Controladores",
      controllerTip:
        "Todos los controladores heredan de un ApiController base que proporciona un mapeo de respuesta estandarizado Result<T>. Los controladores deben ser ligeros: solo validan el modelo de solicitud y delegan el trabajo a AstraFlow mediator.",
      description:
        "Anatomía de Program.cs, pipeline de middlewares, mapa de inyección de dependencias (DI), patrón de registro de módulos y catálogo de controladores.",
      diMapIntro:
        "La siguiente tabla muestra todas las interfaces de servicios principales, sus implementaciones, ciclos de vida (lifetimes) y dónde se registran. Entender este mapa es fundamental para depurar y extender el sistema.",
      diMapTitle: "Mapa de Servicios DI",
      intro:
        "El backend de SCRIPE es un Monolito Modular en .NET 10 con 30 líneas en Program.cs que delegan la configuración de inicio a extensiones dedicadas. Esta página desglosa cada capa de la arquitectura del backend.",
      middlewarePipelineIntro:
        "El pipeline de middleware procesa cada solicitud HTTP en un orden específico. Cada middleware puede interrumpir el flujo (ej. el limitador de tasa devuelve 429, la autenticación devuelve 401). El orden importa: alterarlo puede romper la seguridad.",
      middlewarePipelineTitle: "Pipeline de Middleware",
      modulePatternIntro:
        "Cada nuevo módulo sigue el mismo patrón de registro de Inyección de Dependencias. El método de extensión AddXxxModule() registra el DbContext del módulo, repositorios, servicios y el marcador de registro del módulo.",
      modulePatternTitle: "Patrón de Registro de Módulos",
      programCsIntro:
        "Program.cs es el punto de entrada de la aplicación y el centro de cableado. Detecta el modo de despliegue, registra servicios en un orden específico y construye el pipeline de middleware. El archivo sigue una clara estructura de 5 secciones.",
      programCsTitle: "Anatomía de Program.cs",
      title: "Arquitectura del Backend",
    },
    cqrs: {
      cachingTip:
        "Las consultas pueden usar caché del lado del servidor para evitar consultar la base de datos en cada solicitud. La clave de la caché debe incluir todos los parámetros de la consulta para garantizar su unicidad. La caché se invalida automáticamente cuando los comandos relacionados tienen éxito.",
      commandExampleTitle: "Ejemplo de Comando",
      commandSide: "Lado de Comandos (Escritura)",
      description:
        "Separación de Responsabilidad de Comandos y Consultas con pipeline de AstraFlow mediator, comportamientos (behaviors), validación y caché.",
      intro:
        "SCRIPE usa el patrón CQRS (Command Query Responsibility Segregation) para separar las operaciones de lectura y escritura. Los comandos mutan el estado y pasan por comportamientos de validación y auditoría. Las consultas leen el estado y pueden aprovechar la caché. AstraFlow mediator actúa como el mediador entre los controladores y los manejadores.",
      pipelineTitle: "Pipeline de AstraFlow mediator",
      queryExampleTitle: "Ejemplo de Consulta",
      querySide: "Lado de Consultas (Lectura)",
      title: "Patrón CQRS",
      validationBehaviorTitle: "Comportamiento de Validación",
      whatIsCqrsIntro:
        "CQRS separa tu aplicación en dos lados: Comandos (escrituras) y Consultas (lecturas). Cada lado puede optimizarse de forma independiente: los comandos se centran en la integridad y validación de los datos, mientras que las consultas se centran en el rendimiento y la caché.",
      whatIsCqrsTitle: "¿Qué es CQRS?",
    },
    cqrsPipeline: {
      behaviorOrderTip:
        "La validación de seguridad predeterminada rechaza órdenes donde Caching se ejecuta antes que Validation o FeatureCheck. Desactiva Mediator__EnforceSecurityPipelineOrder solo si controlas completamente el riesgo.",
      cachingIntro:
        "Intercepta las consultas que implementan la interfaz ICacheable. Verifica la caché antes de ejecutar el manejador.",
      cachingTitle: "Comportamiento de Caché (CachingBehavior)",
      commandMapIntro:
        "La siguiente tabla enumera cada comando, consulta y validador registrado en el sistema.",
      commandMapTitle: "Catálogo de Comandos y Consultas",
      commandsTitle: "Comandos (Escritura)",
      description:
        "Comportamientos del pipeline del mediador SCRIPE: LoggingBehavior, ValidationBehavior, FeatureCheckBehavior, WebhookDispatchBehavior, CachingBehavior, patrón Result y mapa completo de comandos/consultas.",
      featureCheckIntro:
        "El FeatureCheckBehavior intercepta los comandos que implementan IRequireFeature. Verifica si la Edición del inquilino permite la funcionalidad solicitada llamando a IFeatureChecker.IsEnabledAsync. Si la funcionalidad está deshabilitada, devuelve un error Forbidden sin ejecutar el manejador. Las operaciones a nivel de sistema (sin TenantId) omiten esta verificación.",
      featureCheckMarkerIntro:
        "Los comandos optan por el control de funcionalidades implementando la interfaz IRequireFeature con una propiedad RequiredFeatureName. Cuando el módulo de Entitlements no está desplegado, NoOpFeatureChecker devuelve true para todas las verificaciones, convirtiendo este comportamiento en un paso silencioso.",
      featureCheckMarkerTitle: "Marcador IRequireFeature",
      featureCheckTitle: "FeatureCheckBehavior",
      intro:
        "Cada comando y consulta en SCRIPE pasa por un pipeline configurable del mediador SCRIPE con 5 comportamientos integrados: LoggingBehavior, ValidationBehavior, FeatureCheckBehavior, WebhookDispatchBehavior y CachingBehavior. El orden se administra desde appsettings o variables de entorno y se valida al iniciar.",
      loggingIntro:
        "Registra cada solicitud de AstraFlow mediator con el ID del usuario, ID del inquilino, tipo de solicitud y tiempo de ejecución.",
      loggingTitle: "Comportamiento de Registro (LoggingBehavior)",
      overviewIntro:
        "El orden predeterminado es Logging -> Validation -> FeatureCheck -> WebhookDispatch -> Caching -> Handler. La validación y las verificaciones de funciones se ejecutan antes de leer caché, y la invalidación de caché se completa antes del envío de webhooks tras mutaciones exitosas.",
      overviewTitle: "Visión General del Pipeline",
      queriesTitle: "Consultas (Lectura)",
      registrationIntro:
        "AddCoreApplication() registra los comportamientos del pipeline desde las opciones de Mediator. El escaneo de handlers, la validación de cobertura, la política de fallo de notificaciones y el orden del pipeline se controlan desde configuración.",
      registrationTitle: "Registro del Pipeline",
      resultPatternIntro:
        "Todos los manejadores devuelven Result<T> en lugar de lanzar excepciones para los fallos esperados. Esto elimina los bloques try-catch en los controladores.",
      resultPatternTitle: "Patrón Result",
      separationIntro:
        "CQRS separa la aplicación en dos rutas distintas: Comandos (escrituras) que mutan el estado y Consultas (lecturas) optimizadas para el rendimiento.",
      separationTitle: "Separación de Comandos y Consultas",
      title: "Pipeline CQRS",
      validationIntro:
        "ValidationBehavior se ejecuta justo después del logging. Reúne todos los validadores IValidator<TRequest>, devuelve errores Result estructurados para solicitudes inválidas e impide que lleguen al handler o a la caché.",
      validationTitle: "Comportamiento de Validación (ValidationBehavior)",
      validatorExampleTitle: "Ejemplos de Validadores",
    },
    dataFlow: {
      backendPipelineIntro:
        "Cada solicitud al backend pasa por 10 componentes de middleware y 3 comportamientos (behaviors) del pipeline de AstraFlow mediator antes de llegar al manejador. Esto asegura una auditoría, autenticación, autorización y validación consistentes.",
      backendPipelineTitle: "Pipeline de Solicitudes Backend",
      cacheTip:
        "Establece el staleTime en 5 minutos para datos que cambian con poca frecuencia (roles, permisos). Usa 0 para datos que cambian a menudo (logs de auditoría, notificaciones). Siempre invalida las consultas relacionadas después de mutaciones exitosas.",
      cachingFlowIntro:
        "El backend utiliza una estrategia de caché de dos niveles: L1 (IMemoryCache en proceso) y L2 (Redis distribuido). El frontend utiliza la caché integrada de TanStack Query con un staleTime configurable.",
      cachingFlowTitle: "Estrategia de Caché",
      description:
        "Diagramas de flujo de datos de extremo a extremo: consulta, mutación, pipeline backend, manejo de errores y estrategia de caché.",
      errorFlowIntro:
        "Los errores se manejan en múltiples niveles. Cada origen de error tiene un manejador específico, código de respuesta y estrategia de manejo en el frontend.",
      errorFlowTitle: "Manejo de Errores",
      intro:
        "Entender cómo fluyen los datos a través de SCRIPE es esencial para depurar y extender el sistema. Esta página rastrea los datos desde un clic en la UI hasta la base de datos y de regreso.",
      mutationFlowTitle: "Flujo de Mutación (Escritura)",
      queryFlowIntro:
        "Cuando un usuario ve datos (ej. abrir la página de Usuarios), el flujo comienza en la Vista, pasa por el ViewModel, TanStack Query, el Repositorio, el Servicio API y finalmente la API del backend.",
      queryFlowTitle: "Flujo de Consulta (Lectura)",
      title: "Flujo de Datos",
    },
    dependencyInjection: {
      architectureIntro:
        "Program.cs sigue un estricto orden de registro de 4 fases: (1) Infraestructura Central, (2) CORS y Limitación de Tasa, (3) Módulos, (4) Capa de Aplicación.",
      architectureTitle: "Arquitectura de Registro DI",
      bestPracticesTitle: "Mejores Prácticas de DI",
      captiveTip:
        "Evita las dependencias cautivas (Captive Dependencies), que ocurren cuando un servicio Singleton inyecta un servicio Scoped. Usa IServiceScopeFactory en su lugar.",
      controllerProviderIntro:
        "Filtra qué controladores se cargan en el inicio basándose en MODULE_NAME.",
      controllerProviderTitle: "Proveedor de Características de Controlador de Módulo",
      coreServicesIntro:
        "Los siguientes servicios son registrados por AddCoreInfrastructure() y están disponibles para todos los módulos.",
      coreServicesTitle: "Servicios de Infraestructura Central",
      description:
        "Flujo de registro de Program.cs, patrón DI de módulos, descubrimiento de servicios, mapas de servicios, reglas de ciclo de vida (lifetimes) y Gateway YARP.",
      gatewayIntro:
        "Cuando MODULE_NAME=Gateway, la aplicación actúa como un proxy inverso YARP que enruta solicitudes a los microservicios.",
      gatewayTitle: "Configuración del Gateway YARP",
      identityModuleIntro:
        "El módulo Identity registra múltiples repositorios e interfaces de servicio bajo el alcance (Scoped) HTTP.",
      identityModuleTitle: "Servicios del Módulo de Identidad",
      intro:
        "SCRIPE utiliza el contenedor de Inyección de Dependencias integrado de .NET con un patrón de registro estructurado.",
      lifetimeTitle: "Reglas de Ciclo de Vida de los Servicios (Lifetimes)",
      moduleRegIntro:
        "Cada módulo expone un método de extensión AddXxxModule() que registra todos sus servicios dependiendo de la variable MODULE_NAME.",
      moduleRegTitle: "Patrón de Registro de Módulos",
      monolithNote:
        "En modo monolito, TODOS los módulos se cargan. En modo microservicio, cada módulo se ejecuta como un proceso independiente.",
      scopedTitle: "Ciclo de Vida Scoped (Por Solicitud)",
      serviceDiscoveryIntro:
        "SCRIPE usa un descubrimiento de servicios basado en configuración para resolver nombres de servicios a URLs en entornos de microservicios.",
      serviceDiscoveryTitle: "Descubrimiento de Servicios (Service Discovery)",
      singletonTitle: "Ciclo de Vida Singleton",
      title: "Inyección de Dependencias (DI)",
    },
    domainEvents: {
      architectureSummaryTitle: "Resumen de la Arquitectura Outbox",
      customEventsIntro: "Sigue estos 3 pasos para agregar un nuevo evento de dominio a SCRIPE.",
      customEventsTitle: "Creación de Eventos de Dominio Personalizados",
      description:
        "Interfaz IDomainEvent, patrón Outbox, OutboxInterceptor, OutboxProcessor y entrega garantizada de eventos.",
      interfaceIntro:
        "Todos los eventos de dominio implementan la interfaz IDomainEvent, que hereda de INotification de AstraFlow mediator. Esto permite publicador/suscriptor en proceso donde múltiples manejadores pueden suscribirse al mismo evento.",
      interfaceTitle: "Interfaz IDomainEvent",
      intro:
        "Los eventos de dominio representan sucesos significativos en el dominio del negocio. SCRIPE utiliza el Patrón Outbox para garantizar la entrega confiable de los eventos: estos se persisten en la misma transacción de la base de datos que los cambios de la entidad y son procesados de manera asíncrona.",
      outboxCleanupIntro:
        "Un trabajo recurrente en Hangfire que se ejecuta diariamente para eliminar mensajes de Outbox procesados que tienen más de 7 días.",
      outboxCleanupTitle: "Trabajo de Limpieza del Outbox",
      outboxInterceptorIntro:
        "OutboxInterceptor es un interceptor de SaveChanges de EF Core que se ejecuta ANTES de que la transacción se confirme, serializando los eventos en la misma transacción.",
      outboxInterceptorTitle: "OutboxInterceptor",
      outboxIntro:
        "El patrón Outbox resuelve el problema de la doble escritura: cómo actualizar atómicamente la base de datos Y publicar un evento al mismo tiempo.",
      outboxMessageTitle: "Entidad OutboxMessage",
      outboxProcessorIntro:
        "Un servicio en segundo plano (BackgroundService) que revisa la tabla OutboxMessage cada 5 segundos buscando mensajes no procesados.",
      outboxProcessorTitle: "OutboxProcessor",
      outboxTitle: "Patrón Outbox",
      outboxWarning:
        "El patrón Outbox proporciona una entrega de 'al menos una vez' (at-least-once), no 'exactamente una vez'. Los manejadores de eventos deben ser idempotentes.",
      publisherTitle: "IDomainEventPublisher",
      publishingIntro:
        "Los eventos de dominio siguen un ciclo de vida de 6 pasos: se emite el evento, OutboxInterceptor lo captura, se persiste como OutboxMessage, OutboxProcessor lo sondea y finalmente se publica.",
      publishingTitle: "Flujo de Publicación y Manejo",
      reliabilityTitle: "Garantías de Confiabilidad",
      step1Content:
        "Crea un 'record' que implemente IDomainEvent en el directorio Domain/Events/ del módulo.",
      step1Title: "1. Definir el Evento",
      step2Content:
        "Llama a entity.RaiseDomainEvent() en el manejador del comando, luego llama a SaveChangesAsync.",
      step2Title: "2. Emitir desde el Manejador del Comando",
      step3Content:
        "Implementa INotificationHandler<DomainEventNotification> para reaccionar al evento.",
      step3Title: "3. Crear Manejadores del Evento",
      title: "Eventos de Dominio (Domain Events)",
      withOutboxTitle: "✅ Con Patrón Outbox",
      withoutOutboxTitle: "❌ Sin Patrón Outbox",
    },
    domainModel: {
      auditableEntityIntro:
        "AuditableEntity añade 7 campos de auditoría y borrado lógico a la Entidad base. Estos campos se llenan automáticamente por el AuditableEntityInterceptor; nunca se establecen manualmente en tu código.",
      auditableEntityTitle: "AuditableEntity (Entidad Auditable)",
      bestPracticesTitle: "Mejores Prácticas",
      concreteEntitiesTitle: "Registro de Entidades Concretas",
      description:
        "Jerarquía de herencia de entidades, AuditableEntity, ITenantAwareEntity, ciclo de vida del borrado lógico (soft-delete), abstracciones de repositorio y filtros de consulta globales.",
      dontTitle: "❌ NO HACER",
      doTitle: "✅ SÍ HACER",
      entityBaseIntro:
        "La clase base Entity<TId> proporciona igualdad de identidad, generación de código hash y soporte para eventos de dominio.",
      entityBaseTitle: "Clase Base Entity<TId>",
      entityDomainEventNote:
        "Los eventos de dominio emitidos a través de RaiseDomainEvent() son recolectados por el OutboxInterceptor durante SaveChanges y persistidos en la misma transacción.",
      entityHierarchyIntro:
        "Todas las entidades de dominio siguen una cadena de herencia de tres niveles: IEntity (interfaz marcadora) → Entity<TId> (identidad + igualdad + eventos de dominio) → AuditableEntity (campos de auditoría + borrado lógico). Las entidades que pertenecen a un inquilino específico también implementan la interfaz ITenantAwareEntity.",
      entityHierarchyTitle: "Jerarquía de Herencia de Entidades",
      ientityTitle: "Interfaz IEntity",
      ignoreFiltersTip:
        "Usa IgnoreQueryFilters() solo en operaciones de la Papelera de Reciclaje y consultas trans-inquilino de SuperAdmins. Acompáñalo siempre con un filtro manual de inquilino para prevenir fugas de datos.",
      intro:
        "El modelo de dominio de SCRIPE sigue una estricta jerarquía de herencia donde todas las entidades de negocio heredan de AuditableEntity, lo que proporciona campos de auditoría y soporte para borrado lógico. Las entidades vinculadas a inquilinos implementan adicionalmente ITenantAwareEntity para el aislamiento automático a nivel de fila.",
      queryFiltersIntro:
        "Los filtros de consulta globales de EF Core se aplican a todas las entidades que heredan de AuditableEntity y/o ITenantAwareEntity de forma automática en todas las consultas LINQ.",
      queryFiltersTitle: "Filtros de Consulta Globales",
      repositoryIntro:
        "SCRIPE define tres interfaces de repositorio: IReadRepository<T> para consultas, IWriteRepository<T> para mutaciones e IRepository<T> que combina ambos.",
      repositoryTitle: "Abstracciones de Repositorio",
      softDeleteIntro:
        "Todas las entidades usan borrado lógico mediante la bandera IsDeleted. Cuando se llama a un endpoint DELETE, se convierte en un borrado lógico ocultando el registro de las consultas normales.",
      softDeleteTitle: "Ciclo de Vida del Borrado Lógico (Soft-Delete)",
      tenantAwareIntro:
        "Las entidades que implementan ITenantAwareEntity están automáticamente limitadas al inquilino actual mediante los filtros de consulta globales de EF Core.",
      tenantAwareTitle: "ITenantAwareEntity",
      tenantIsolationWarning:
        "Nunca evites el aislamiento del inquilino sin autorización explícita. Usar IgnoreQueryFilters() elimina TODOS los filtros, incluyendo el alcance del inquilino.",
      title: "Modelo de Dominio (Domain Model)",
    },
    frontend: {
      connectorPatternIntro:
        "El patrón conector separa las páginas del App Router de Next.js (Server Components) de las Vistas del módulo (Client Components). Las páginas en src/app/ son conectores delgados que importan y renderizan las Vistas del módulo. Solo manejan enrutamiento, metadatos y parámetros de URL.",
      connectorPatternTitle: "Patrón Conector",
      connectorWarning:
        "NUNCA pongas lógica de negocio, peticiones de datos, formularios o gestión de estado en los archivos de src/app/. Estos son Server Components que solo conectan las rutas a las Vistas del módulo.",
      description:
        "Patrón SOLID View/ViewModel, estructura de módulos y el patrón conector para la integración con Next.js.",
      intro:
        "El frontend de SCRIPE está construido con Next.js 16 (App Router) siguiendo un estricto patrón SOLID View/ViewModel. Cada página está compuesta por una Vista (View) de UI pura que delega toda la lógica a los hooks del ViewModel. Esta separación garantiza la testeabilidad, reutilización y mantenibilidad.",
      moduleStructureTitle: "Estructura de Archivos del Módulo",
      solidPatternIntro:
        "El patrón SOLID asegura que cada pieza de la UI tenga una sola responsabilidad. Las Vistas renderizan JSX, los ViewModels administman el estado y la lógica, y los Componentes proporcionan secciones de UI reutilizables.",
      solidPatternTitle: "Patrón SOLID View/ViewModel",
      title: "Arquitectura del Frontend",
      viewDo: "Una Vista DEBE",
      viewDont: "Una Vista NO DEBE",
      viewExampleTitle: "Ejemplo de Vista",
      viewModelRulesIntro:
        "Los ViewModels son hooks de React que contienen toda la lógica de negocio. Componen ViewModels específicos de la sección (estadísticas, filtros, tablas) y devuelven interfaces tipadas consumidas por las Vistas.",
      viewModelRulesTitle: "Reglas del ViewModel",
      viewRulesTitle: "Reglas de la Vista (View)",
    },
    modules: {
      allowedImportsTitle: "Importaciones Permitidas",
      backendModuleIntro:
        "Cada módulo del backend sigue DDD (Domain-Driven Design) con tres proyectos: Dominio, Aplicación e Infraestructura. El Dominio es C# puro sin dependencias externas.",
      backendModuleTitle: "Plantilla de Módulo Backend",
      boundaryWarning:
        "Los límites de los módulos son ley absoluta. Si necesitas compartir código entre módulos, DEBE ir en @core/. Cualquier importación desde @modules/{other}/ es una violación y será rechazada en la revisión de código.",
      communicationTitle: "Patrones de Comunicación entre Módulos",
      description:
        "Reglas de aislamiento de módulos, plantillas backend/frontend, registro de módulos y comunicación entre módulos.",
      forbiddenImportsTitle: "Importaciones Prohibidas",
      frontendModuleTitle: "Plantilla de Módulo Frontend",
      intro:
        "SCRIPE utiliza un estricto sistema de módulos donde cada módulo es una isla aislada con límites claros. Los módulos no pueden importar código entre sí; solo se comunican a través de URLs, IDs compartidos o el bus de eventos central. Esto garantiza la independencia, testeabilidad y la capacidad de extraer módulos a repositorios separados.",
      isolationRulesTitle: "Reglas de Aislamiento de Módulos",
      pattern1Content:
        "Navegar a la página de otro módulo mediante enlaces URL estándar. No se necesitan importaciones.",
      pattern1Title: "Patrón 1: Navegación por URL",
      pattern2Content:
        "Almacenar solo el ID de la entidad del módulo externo. Nunca incrustar la entidad completa.",
      pattern2Title: "Patrón 2: Solo IDs Compartidos",
      pattern3Content:
        "Publicar y suscribirse a eventos a través de un bus de eventos compartido en @core/. (Patrón futuro, aún no implementado).",
      pattern3Title: "Patrón 3: Bus de Eventos Central (Core Event Bus)",
      registryIntro:
        "El registro de módulos rastrea todos los módulos activos en tiempo de ejecución. Se popula durante el inicio de la aplicación cuando se resuelve y registra la implementación IModuleRegistration de cada módulo.",
      registryTitle: "Registro de Módulos",
      title: "Sistema de Módulos",
    },
    overview: {
      backendArchIntro:
        "El backend sigue una arquitectura de pipeline de solicitudes donde cada solicitud HTTP fluye a través de middlewares, controladores, comportamientos (behaviors) de AstraFlow mediator y, finalmente, el manejador CQRS. Esto garantiza validación, auditoría y manejo de errores consistentes.",
      backendArchTitle: "Arquitectura del Backend",
      communicationPatternsTitle: "Comunicación entre Módulos",
      crossModuleNote:
        "El patrón de Bus de Eventos (Event Bus) está planeado para futuras versiones. Actualmente, los módulos se comunican exclusivamente mediante navegación por URL e IDs compartidos.",
      description:
        "Capas de Clean Architecture, pipeline backend, flujo SOLID frontend y reglas de límites de módulos.",
      frontendArchIntro:
        "El frontend utiliza un patrón SOLID View/ViewModel donde las Vistas son UI pura (sin estado ni lógica) y los ViewModels contienen toda la lógica de negocio. El patrón conector separa el enrutamiento de Next.js (Server Components) de la lógica de la aplicación (Client Components).",
      frontendArchTitle: "Arquitectura del Frontend",
      intro:
        "SCRIPE sigue una Clean Architecture estricta con cuatro capas: Presentación, Aplicación, Dominio e Infraestructura. La regla de dependencias garantiza que las capas internas nunca dependan de las externas. Esta arquitectura se aplica al backend y al frontend.",
      layersTitle: "Capas de Arquitectura Limpia",
      moduleBoundariesIntro:
        "Los módulos son islas aisladas. No pueden importar dependencias entre sí. Esto permite un desarrollo independiente, contención de fallos y la capacidad de extraer módulos a repositorios separados.",
      moduleBoundariesTitle: "Límites de los Módulos",
      title: "Visión General de la Arquitectura",
      withBoundaries: "Con Límites de Módulo",
      withoutBoundaries: "Sin Límites de Módulo",
    },
    solidPattern: {
      antiPatternWarning:
        "Anti-patrón: Poner useState, useEffect o useQuery directamente en un componente Vista. TODO el estado y la lógica deben vivir en los ViewModels. Las Vistas son solo para la composición pura de la UI.",
      description:
        "Escenarios de tipos de página: Listas CRUD, paneles (dashboards), perfiles, ajustes, asistentes (wizards) y constructores de reportes.",
      intro:
        "El patrón SOLID View/ViewModel es obligatorio para todas las páginas en src/modules/. Esta guía cubre 7 escenarios de tipos de página con sus estructuras de directorios exactas, patrones de ViewModel y ejemplos de código.",
      principlesTitle: "Principios SOLID Aplicados",
      rulesTitle: "Reglas de Oro",
      scenario1Intro:
        "Usado para gestionar colecciones de entidades (Usuarios, Productos, Pedidos). El orquestador compone los ViewModels de estadísticas, filtros y la tabla.",
      scenario1Title: "Escenario 1: Página de Lista CRUD",
      scenario2Intro:
        "Usado para KPIs, gráficos y métricas. Cada sección de gráfico o tarjeta tiene su propio ViewModel con selección de período y transformación de datos.",
      scenario2Title: "Escenario 2: Dashboard / Analítica",
      scenario3Intro:
        "Usado para ver una sola entidad con pestañas y secciones. El orquestador obtiene la entidad principal y compone los ViewModels de las pestañas.",
      scenario3Title: "Escenario 3: Página de Detalle / Perfil",
      scenario4Intro:
        "Usado para múltiples secciones de formulario que se guardan independientemente. Cada sección tiene su propio ViewModel con el estado del formulario y la mutación de guardado.",
      scenario4Title: "Escenario 4: Página de Configuración",
      scenario5Intro:
        "Usado para flujos complejos de varios pasos como el onboarding o checkout. El ViewModel del wizard coordina la navegación de los pasos, las validaciones y el envío combinado.",
      scenario5Title: "Escenario 5: Asistente (Wizard) / Formulario Multipaso",
      scenariosIntro:
        "Elige el escenario que coincida con tu tipo de página. Cada uno proporciona una estructura probada que garantiza consistencia en toda la aplicación.",
      scenariosTitle: "Escenarios de Tipos de Página",
      title: "SOLID View/ViewModel",
    },
    stateManagement: {
      antiPatternsTitle: "Anti-Patrones",
      decisionTitle: "Matriz de Decisión",
      description:
        "TanStack Query para el estado del servidor, Zustand para el estado global de UI y LanguageProvider para localización.",
      dontTitle: " NO HACER",
      doTitle: " SÍ HACER",
      intro:
        "SCRIPE utiliza tres herramientas de gestión de estado, cada una para una categoría específica: TanStack Query para datos del servidor (resultados de API), Zustand para el estado global de UI (autenticación, barra lateral, tema) y useState para el estado local del componente (formularios, interruptores).",
      localizationIntro:
        "La localización usa un LanguageProvider personalizado con persistencia en localStorage más un sistema de configuración regional con alcance de módulo. Las claves compartidas (~1,156) viven en core/locales/. Las claves específicas del módulo se ubican en el directorio locales/ de cada módulo y se importan con entusiasmo en el momento de la compilación a través de module-registry.ts para cargas de página sin parpadeos.",
      localizationTitle: "Localización (LanguageProvider)",
      noLocaleFoldersWarning:
        "¡NO uses carpetas [locale] en src/app/! La localización se maneja mediante el contexto de LanguageProvider, no a través de enrutamiento basado en archivos. Ni next-intl, ni next-i18next, ni URLs basadas en idioma (/en/, /es/).",
      tanstackIntro:
        "Usa TanStack Query para cualquier dato que provenga de la API. Maneja caché, recargas en segundo plano, paginación, actualizaciones optimistas y deduplicación de solicitudes automáticamente.",
      tanstackTitle: "TanStack Query (Estado del Servidor)",
      title: "Gestión de Estado (State Management)",
      zustandIntro:
        "Usa Zustand para el estado global de la UI que necesita ser compartido entre componentes pero que no proviene del servidor. Hay exactamente 3 stores aprobados.",
      zustandTitle: "Zustand (Estado Global de UI)",
    },
  },
};

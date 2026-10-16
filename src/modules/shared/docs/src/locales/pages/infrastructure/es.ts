// FILE-EXCEPTION: file length
/**
 * Docs page locale — ES
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const es = {
  infrastructure: {
    backgroundJobs: {
      title: "Trabajos en Segundo Plano (Background Jobs)",
      description:
        "Trabajos recurrentes autodescubiertos, independientes del proveedor (Native, Hangfire, Quartz.NET) — 24 trabajos en 4 módulos sin cableado manual.",
      intro:
        "El sistema de trabajos en segundo plano de SCRIPE se basa en un principio: escribir una vez, ejecutar en cualquier proveedor. Cada trabajo implementa IAutoRegisteredJob y se descubre automáticamente al inicio. Cambiar entre Native, Hangfire o Quartz es solo un cambio de configuración en appsettings.json — cero cambios de código.",
      architectureTitle: "Visión General de la Arquitectura",
      architectureIntro:
        "Al inicio, BackgroundJobsConfiguration lee el proveedor activo de appsettings.json y llama a GetServices<IAutoRegisteredJob>() para descubrir cada trabajo registrado en el contenedor DI. Para cada trabajo, verifica si hay anulaciones de appsettings por trabajo, analiza Enabled y CronExpression, y luego programa el trabajo utilizando la API del proveedor. Los trabajos en sí no contienen código específico del proveedor.",
      architectureFlowTitle: "El Pipeline de Autodescubrimiento",
      nodeConfig: "Archivo appsettings.json\nProveedor + Anulaciones por Trabajo",
      descConfig:
        "Proveedor: Native | Hangfire | Quartz\nJobs: { id: { Enabled, CronExpression } }",
      nodeStartup: "Configuración de BackgroundJobs\nAddBackgroundJobsConfiguration()",
      descStartup: "Lee el proveedor, descubre todos los trabajos, los programa",
      nodeDiscovery: "Bucle de Autodescubrimiento\nGetServices<IAutoRegisteredJob>()",
      descDiscovery: "Escanea el contenedor DI para cada IAutoRegisteredJob registrado",
      nodeSchedule:
        "Programar Cada Trabajo\nSi está habilitado -> Registrar con la API del proveedor",
      descSchedule:
        "Usa la CronExpression de la anulación de appsettings o la predeterminada del trabajo",
      nodeExecute: "job.ExecuteAsync(ct)\nEn cada tick de cron",
      descExecute: "Agnóstico del proveedor - el trabajo no sabe qué proveedor lo ejecuta",
      conn1: "impulsa",
      conn2: "desencadena",
      conn3: "para cada trabajo",
      conn4: "en el tick de cron",
      contractTitle: "El Contrato IAutoRegisteredJob",
      contractIntro:
        "Cada trabajo recurrente en segundo plano en SCRIPE implementa una única interfaz: IAutoRegisteredJob. Ese es todo el contrato — tres propiedades y un método. La interfaz excluye intencionalmente cualquier concepto específico del proveedor (sin atributos de Hangfire, sin anotaciones de Quartz). El trabajo no sabe qué proveedor lo está ejecutando.",
      diTitle: "Registro DI — El Patrón Crítico de Dos Líneas",
      diIntro:
        "Cada trabajo requiere exactamente dos líneas de registro DI en el DependencyInjection.cs de su módulo. Omitir la segunda línea hace que el trabajo sea completamente invisible para todos los proveedores — nunca será descubierto ni programado, y no habrá error ni advertencia.",
      diWarningTitle: "NUNCA Omitas la Línea 2",
      diWarning:
        "El delegado de fábrica de IAutoRegisteredJob (Línea 2) es la clave que hace que funcione el autodescubrimiento. GetServices<IAutoRegisteredJob>() solo devuelve trabajos registrados como IAutoRegisteredJob. Los trabajos registrados solo por su tipo concreto son invisibles para los tres proveedores.",
      hierarchyTitle: "Jerarquía de Clases — Elige tu Clase Base",
      hierarchyIntro:
        "Tienes tres opciones dependiendo de la estructura que necesites. Los trabajos ligeros implementan IAutoRegisteredJob directamente. Los trabajos que necesitan registros estructurados de tiempo heredan RecurringJobBase. Los trabajos de limpieza para entidades eliminadas lógicamente heredan SoftDeleteCleanupJob<TContext>.",
      hierarchyColClass: "Clase",
      hierarchyColUseWhen: "Cuándo usar",
      hierarchyColGets: "Qué obtienes",
      hierarchyRow1When: "El trabajo es simple y no necesita estructura",
      hierarchyRow1Gets: "Solo el contrato — control total, nada extra",
      hierarchyRow2When: "Necesitas registros estructurados de tiempo y errores",
      hierarchyRow2Gets: "Registros automáticos de inicio/completado/error con tiempo",
      hierarchyRow3When: "El módulo necesita limpieza permanente de eliminación lógica",
      hierarchyRow3Gets: "Descubrimiento automático de entidades, eliminación ordenada FK, lotes",
      providersTitle: "Comparación de Proveedores",
      providersIntro:
        "Los tres proveedores usan exactamente la misma interfaz IAutoRegisteredJob. La única diferencia es cómo programan y persisten los trabajos. Configure el proveedor en appsettings.json — el cambio requiere cero cambios de código.",
      providerColFeature: "Característica",
      providerColNative: "Nativo",
      providerColHangfire: "Hangfire",
      providerColQuartz: "Quartz",
      providerRowPersistence: "Persistencia de Trabajos",
      providerNativeNo: "Solo memoria — perdido en reinicio",
      providerHangfireYes: "Guardado en SQL — sobrevive reinicios",
      providerQuartzOptional: "Memoria (almacenamiento en base de datos opcional)",
      providerRowDashboard: "Dashboard",
      providerNativeDash: "Ninguno",
      providerHangfireDash: "/hangfire (Solo SuperAdministrador)",
      providerQuartzDash: "Ninguno (Quartz.UI por separado)",
      providerRowRetry: "Reintentos Automáticos",
      providerNativeRetry: "No",
      providerHangfireRetry: "Sí (conteo de reintentos configurable)",
      providerQuartzRetry: "Sí (vía políticas misfire)",
      providerRowBestFor: "Mejor Para",
      providerNativeBest: "Desarrollo local, pruebas unitarias",
      providerHangfireBest: "Producción con SQL Server",
      providerQuartzBest: "Producción con Oracle o PostgreSQL",
      inventoryTitle: "Inventario Completo de Trabajos — Todos los 24",
      inventoryIntro:
        "Los 24 trabajos recurrentes en segundo plano en los cuatro módulos. Cada trabajo implementa IAutoRegisteredJob. Los Cron predeterminados se pueden anular por entorno en appsettings.json.",
      inventoryColPurpose: "Propósito",
      inventoryCoreTitle: "Módulo Core (1 Trabajo)",
      inventoryIdentityTitle: "Módulo Identity (4 Trabajos)",
      inventoryEntitlementsTitle: "Módulo Entitlements (12 Trabajos)",
      inventoryComplianceTitle: "Módulo Compliance (7 Trabajos)",
      jobOutboxCleanup: "Elimina mensajes outbox procesados de más de 7 días",
      jobIdentitySoftDelete: "Elimina permanentemente entidades Identity eliminadas lógicamente",
      jobEmailProcessing:
        "Consulta y envía correos electrónicos retrasados a través de EmailJobProcessor",
      jobWebhookRetry: "Procesa la cola de reintentos de webhooks guardados en lotes de 50",
      jobWebhookLogCleanup: "Elimina registros de entrega de webhooks de más de 90 días",
      identityNote:
        "EmailProcessingJob y WebhookRetryJob/WebhookLogCleanupJob son trabajos de infraestructura subyacente registrados en DI del módulo Identity porque dependen de los servicios de Identity.",
      jobEntitlementsSoftDelete:
        "Elimina permanentemente entidades Entitlements eliminadas lógicamente",
      jobSubscriptionReconciliation: "Expira pruebas, renueva suscripciones activas de usuarios",
      jobTrialNotification: "Envía recordatorios de fin de prueba a 7, 3 o 1 días de la expiración",
      jobDunningNotification: "Envía notificaciones de pago fallido cada vez más urgentes",
      jobEditionRollout: "Aplica subidas y bajadas de categoría programadas",
      jobUserSubscriptionReconciliation: "Conciliación de suscripciones a nivel de usuario Nivel 2",
      jobAnalyticsSnapshot: "Agregación de instantáneas diarias de Ingresos/MRR/ARR",
      jobTenantHealthScore: "Recalcula puntajes de salud para todos los inquilinos activos",
      jobAnalyticsReport: "Generación de informes de análisis semanales",
      jobCommissionInvoicing: "Generación consolidada de facturas de comisiones mensuales",
      jobCommissionAutoCharge: "Reintentos de autodescargas fallidas de comisiones",
      jobPaymobRecurringBilling: "Cargos recurrentes guardados en tarjetas de crédito Paymob",
      jobComplianceSoftDelete:
        "Elimina permanentemente entidades Compliance eliminadas lógicamente",
      jobDsrExecution: "Ejecuta solicitudes DSR pendientes cada 5 minutos",
      jobDsrEscalation: "Advierte sobre plazos SLA de DSR próximos",
      jobDsrExportCleanup: "Elimina exportaciones DSR expiradas",
      jobRetentionEnforcement: "Aplica políticas de retención de datos",
      jobConsentExpiry: "Invalida el consentimiento de usuario expirado",
      jobReportGeneration: "Consulta y genera informes de cumplimiento pendientes cada 2 minutos",
      newJobTitle: "Creación de un Nuevo Trabajo",
      newJobIntro:
        "Siga estos cuatro pasos exactamente. Los únicos archivos requeridos son la clase del trabajo en sí y las dos líneas de registro DI. Todo lo demás se conecta automáticamente.",
      newJobStep1Title: "Paso 1 — Crear la Clase del Trabajo",
      newJobStep1Desc:
        "Cree un nuevo archivo en {Module}.Infrastructure/BackgroundJobs/. Utilice la convención kebab-case de JobId: '{module}-{purpose}'. Haga que ExecuteAsync sea idempotente.",
      newJobStep2Title: "Paso 2 — Registrar DI de Dos Líneas",
      newJobStep2Desc:
        "En el DependencyInjection.cs del módulo, agregue las dos líneas exactas de registro. La línea 1 habilita la inyección en el constructor. La línea 2 habilita el autodescubrimiento. NUNCA omita la línea 2.",
      newJobStep3Title: "Paso 3 — Agregar anulación appsettings (Opcional)",
      newJobStep3Desc:
        "Para horarios específicos del entorno o para deshabilitar el trabajo, agregue una anulación en BackgroundJobs.Jobs utilizando el JobId como clave.",
      newJobStep4Title: "Paso 4 — Compilar y Verificar",
      newJobStep4Desc:
        "Ejecute scripe build backend. Cero errores significa que el trabajo está listo. El autodescubrimiento maneja todo lo demás — no es necesario ningún registro manual en ningún lugar.",
      softDeleteTitle: "SoftDeleteCleanupJob — Eliminación Automática Ordenada por FK",
      softDeleteIntro:
        "La clase base SoftDeleteCleanupJob<TContext> es la opción más avanzada. Descubre automáticamente todos los tipos de entidades ISoftDeletable en el DbContext, los clasifica topológicamente y los elimina en lotes.",
      softDeleteTip:
        "El comando CLI 'scripe add-bg-service {Module}' genera el archivo de trabajo y agrega los dos registros DI en un solo paso. Esta es la forma recomendada de agregar un SoftDeleteCleanupJob.",
      softDeleteFlowTitle: "Flujo de ejecución de eliminación suave",
      flowCronLabel: "Tick Cron (3:00 AM)",
      flowCronDesc: "Cron predeterminado para tareas de eliminación suave",
      flowInitLabel: "SoftDeleteCleanupJob<TContext>",
      flowInitDesc: "Instanciado por el contenedor DI",
      flowScanLabel: "Descubrir ISoftDeletable",
      flowScanDesc:
        "Escaneo de reflexión en DbContext para entidades que implementan ISoftDeletable",
      flowFilterLabel: "Filtrar entidades caducadas",
      flowFilterDesc:
        "Buscar registros donde IsDeleted = true Y DeletedAt < DateTime.UtcNow.AddDays(-30)",
      flowCascadeLabel: "Cascada consciente de FK",
      flowCascadeDesc:
        "Maneja las restricciones de clave externa en el orden de eliminación correcto",
      flowExecuteLabel: "Eliminación definitiva",
      flowExecuteDesc:
        "Ejecutar SQL nativo para la eliminación masiva, evitando el seguimiento de cambios de EF",
      connTriggers: "desencadena",
      connStarts: "inicia",
      connBuilds: "construye consulta",
      connOrders: "ordena",
      connRemoves: "elimina",
      rulesTitle: "Las Reglas Inquebrantables",
      rulesMustTitle: "✅ DEBE HACER",
      rulesNeverTitle: "❌ NUNCA",
      ruleMust1: "Una clase por archivo en la carpeta BackgroundJobs/",
      ruleMust2: "Registre DOS líneas en DI (tipo concreto + delegado de fábrica)",
      ruleMust3: "Use CRON de 5 campos (NO use el formato Quartz de 6 campos)",
      ruleMust4: "Haga ExecuteAsync idempotente",
      ruleMust5: "Compile después de cada cambio — scripe build backend",
      ruleNever1: "Nunca importe namespaces de Hangfire o Quartz en trabajos",
      ruleNever2: "Nunca use [AutomaticRetry] — los reintentos globales se configuran centralmente",
      ruleNever3: "Nunca llame a RecurringJob.AddOrUpdate<T>() en el código del módulo",
      ruleNever4: "Nunca ponga trabajos en Services/ ni en ninguna otra carpeta",
      ruleNever5: "Nunca registre como Singleton — use siempre AddScoped",
      tenantWarning:
        "Los trabajos en segundo plano se ejecutan FUERA del contexto HTTP — no hay contexto de inquilino disponible. Los trabajos que manipulan datos específicos del inquilino DEBEN usar IServiceScopeFactory para crear un alcance (scope) de inquilino explícito.",
    },
    fileStorage: {
      title: "Almacenamiento de Archivos (Storage)",
      description:
        "Patrón de Estrategia para rotar entre Azure, S3 de Amazon, MinIO, o un FileSystem Local.",
      intro:
        "La plataforma cambia de un proveedor de Storage a otro únicamente modificando la variable appsettings.json, sin cambios en el código de compilación.",
      architectureTitle: "Arquitectura de Almacenamiento",
      providersTitle: "Proveedores",
      validationTitle: "Validación y Sanidad de Archivos",
      tenantScopingTitle: "Carpetización obligatoria por Inquilino",
      configTitle: "Configuraciones del Proveedor",
      interfaceTitle: "Interfaz del Servicio IFileStorageService",
      providerTitle: "Implementaciones de Proveedores de Almacenamiento",
      uploadTitle: "Canalización de Subida y Procesamiento de Archivos",
      tenantIsolationTip:
        "Los activos cargados se particionan automáticamente por ID de inquilino en contenedores aislados, garantizando un aislamiento estricto.",
    },
    resilience: {
      title: "Patrones de Resiliencia",
      description:
        "Estrategias de supervivencia de Polly contra fallas transitivas de la red y APIs de terceros caídas.",
      intro:
        "Garantiza que SCRIPE no sufra fallas en cascada y asfixie los servidores esperando llamadas que van a morir.",
      architectureTitle: "Arquitectura de Resiliencia",
      retryTitle: "Política de Reintentos",
      circuitBreakerTitle: "Interruptor de Circuito (Circuit Breaker)",
      circuitBreakerIntro:
        "Si la red paralela se cae después de N intentos, el circuito se abre y descarta las llamadas futuras inmediatamente por 30 segundos dando tiempo a la recuperación.",
      timeoutTitle: "Política de Límite de Tiempo (Timeout)",
      usageTitle: "Aplicación sobre clientes HttpClient",
      configTitle: "Configuraciones Dinámicas",
      usageTip:
        "Vincule siempre los controladores de resiliencia de Polly a clientes HttpClient con nombre mediante AddResilienceHandler() en lugar de envolver llamadas manualmente.",
    },
    gatewayDeployment: {
      title: "Gateway y Despliegue (Deployment)",
      description:
        "Proxy inverso YARP de alto nivel, sistema adaptativo de módulos y puestas a producción en IIS o Kestrel.",
      intro:
        "Cubre cómo las piezas compiladas del Monolito Modular convergen y cómo se despliegan en el mundo real.",
      yarpTitle: "Gateway API con YARP",
      yarpIntro:
        "YARP is registered only when Architecture:Mode=Microservice, MODULE_NAME=Gateway, and ServiceDiscovery has services. Gateway exposes no business controllers; it proxies to configured backend roles.",
      moduleTitle: "Sistema de Módulos (Runtime)",
      moduleIntro:
        "MODULE_NAME now represents a server role, not always a pure module. Empty MODULE_NAME loads the full modular monolith. Identity/Auth are composite roles that load Identity plus Entitlements for signup. Gateway loads no business modules.",
      modesTitle: "Modos de Operación y Despliegue",
      monolithTitle: "Modo Monolítico",
      microservicesTitle: "Server Roles / Future Microservices",
      portNote:
        "Do not claim true microservices readiness until RabbitMQ/distributed event delivery replaces the current in-process fallback and startup tests prove the topology.",
      iisTitle: "Despliegue a Producción (IIS / Windows Server)",
      iisStep1Title: "1. Publicar los Archivos Binarios",
      iisStep1Desc: "Correr el dotnet publish con la configuración final en Release.",
      iisStep2Title: "2. Preparación de IIS",
      iisStep2Desc: "El sitio se asocia a la carpeta compilada de salida.",
      iisStep3Title: "3. Perfilado del Entorno",
      iisStep3Desc: "Inyectar la conexión SQL dentro del servidor para la aplicación ASP.NET.",
      iisStep4Title: "4. Reglas del Pool (App Pool)",
      iisStep4Desc:
        "Obligatorio fijarlo a 'No Managed Code' usando el módulo Out-of-process de Core.",
      kestrelTitle: "Configuración en Kestrel (Linux/Docker)",
      microserviceTitle: "Arquitectura de Pasarela y Enrutamiento de Servicios",
      iisStep1: "1. Publicar la aplicación",
      iisStep2: "2. Configurar sitio en IIS",
      iisStep3: "3. Establecer variables de entorno",
      iisStep4: "4. Configurar App Pool",
    },
    databaseMigrations: {
      title: "Migraciones de Bases de Datos",
      description:
        "Generación múltiple para proveer esquemas en PostgreSQL, Oracle, o SQL Server de manera independiente.",
      intro:
        "Resolución del clásico problema de choques de esquemas y tipos de datos en la sintaxis SQL. La arquitectura SCRIPE resuelve esto compilando un ModelSnapshot por motor de manera exclusiva.",
      architectureTitle: "Topología Derived DbContext",
      architectureContent:
        "La clase Base no posee el generador principal, heredamos a implementaciones puras aisladas por motor.",
      diTitle: "Inyección de Proveedor a Nivel Binario",
      diContent:
        "Las capas de datos consumen DbContext base, al arrancar el contenedor DI inyecta la versión de PostgreSQL, Oracle, o SQL Server mágicamente en el constructor de la interfaz.",
      cliTitle: "Generación de Migraciones con SCRIPE-CLI",
      cliContent:
        "Un comando corre scripts hijos en paralelo y compila las 3 versiones de migraciones exactas del ORM con sintaxis del dialecto original.",
      cliWarning:
        "Nota: Intentar alterar la carpeta de Migraciones de EF de forma manual destruirá la cohesión.",
      cliUpdateTitle: "Autodetección al Actualizar la Base (Update)",
      cliUpdateContent:
        "La CLI lee de manera inteligente si tu appsettings te dice que operes en Oracle, o en SQLServer, y lanza la migración update adecuada sin que debas decírselo.",
      cliRemoveTitle: "Smart Force Removal",
      cliRemoveContent:
        "Retroceso (Rollback) de esquemas dañado para recuperar la base estable de código en las 3 bases en paralelo.",
      newProviderTitle: "Adición de un Proveedor de Motor Nuevo",
      newProviderContent: "Explicado con el uso de un cuarto motor ligero, como SQLite.",
      newProviderStep1: "Heredar del núcleo a una clase exclusiva Sealed Sqlite.",
      newProviderStep2: "Implementación de Factory Design Time.",
      newProviderStep3: "Inyección al InfrastructureDI de la arquitectura principal.",
      newProviderStep4: "Correr la CLI y generar el ModelSnapshot cero.",
    },
    scripeCli: {
      title: "Herramientas SCRIPE CLI",
      description:
        "Productividad inmensa con andamiaje de 66 archivos generados de golpe y conexiones automatizadas al ecosistema.",
      intro:
        "La CLI basada en Node que elimina por completo la repetición del código en arquitecturas limpias y enlaza Frontend y Backend.",
      commandsTitle: "Comandos Base de Andamiaje",
      commandsIntro: "La piedra angular para crear cualquier funcionalidad.",
      newModuleTitle: "Andamiaje de Módulos (new-module)",
      newModuleIntro:
        "Crea la partición de microservicio base y las carpetas de negocio en React y .NET en un solo pulso.",
      newFeatureTitle: "Andamiaje de Operaciones (new-feature)",
      newFeatureIntro:
        "Dispara la lógica CRUD generando las llamadas de Red, la UI, los Controladores, SCRIPE mediator, y EF Core Configurations.",
      destructionTitle: "Herramientas de Reversión",
      destructionIntro:
        "Desandamiaje perfecto. Destruye los archivos y retira los links sin romper las compilaciones.",
      bgJobsTitle: "Generador de Hangfire Jobs",
      bgJobsIntro: "Esqueleto de proceso programado integrado al contenedor y a los permisos.",
      dslTitle: "Sintaxis DSL para Propiedades",
      dslIntro: "Mediante -p se declara un objeto a lo largo del stack de la aplicación.",
      dslSyntaxInfo: "Sintaxis: NombreCampo:TipoC#[:modificador1][:modificador]",
      templatesTitle: "Motor de Plantillas con Handlebars",
      templatesIntro: "66 archivos perfectos asegurados por plantillas de arquitectura invariable.",
      securityTitle: "Automapeo de Seguridad",
      securityIntro:
        "La CLI protege los controladores autogenerados para requerir perfiles de autenticación automáticamente.",
      autoWiringTitle: "Auto-Conexión (Auto-Wiring) Profunda",
      autoWiringIntro:
        "El verdadero valor del CLI no es generar texto, sino insertarlo en un monstruo de 1000 archivos donde debe encajar exactamente.",
      wiringSln: "Integración nativa del compilador SLN.",
      wiringProgram: "Modifica Program.cs a tu nombre.",
      wiringSettings: "Interviene los JSON base.",
      wiringDocker: "Extiende el docker-compose.",
      wiringPermissions: "Añade constantes React al árbol de RBAC.",
      wiringFrontendApp: "Anidado del Router del frontend.",
      wiringFrontEnv: "Actualiza variables env.",
      revertSafely: "Limpia y purga las inyecciones al hacer rollback.",
      dbSyncTitle: "Operaciones de Base de Datos Remota",
      dbSyncIntro: "Operaciones de sincronismo y parseo generalizado a Zod y Swagger.",
      dbCliCmd: "Administra comandos EF Core nativos envueltos en lógica amigable.",
      syncApiCmd:
        "Copia una respuesta remota de OpenAPI y la transfiere a modelos completos de Typescript listos para consumirse.",
      configTitle: "Fichero de Configuración CLI",
      configIntro:
        "Lógica para detectar y encontrar la carpeta raíz del Monorepo basándose en scripe.config.json.",
      namingTitle: "Inteligencia de Pluralización de Nombres",
      namingIntro:
        "No importa si pasas el nombre en minúscula, guion o Pascal: lo transforma correctamente.",
      utilityTitle: "Aceleradores de Flujo",
      utilityIntro: "Comandos de arranque npm y dotnet unificados.",
    },
    scripeStudio: {
      title: "SCRIPE Studio",
      description:
        "Panel de control visual para desarrolladores con gestión de módulos en tiempo real, generadores de código, controles de servidor de desarrollo y terminal integrado.",
      intro:
        "SCRIPE Studio es un panel visual completo para desarrolladores que proporciona una interfaz web en tiempo real para gestionar módulos, ejecutar generadores de código, controlar servidores de desarrollo, realizar operaciones de base de datos, gestionar contenedores Docker y más — todo desde una sola pestaña del navegador.",
      architectureTitle: "Arquitectura del Studio",
      architectureIntro:
        "El Studio consta de dos componentes: el Motor (Express + Socket.io + SQLite en el puerto 4201) maneja solicitudes API, ejecución de comandos y streaming en tiempo real. La UI (Next.js en el puerto 4200) ofrece 19 páginas que cubren todos los aspectos del flujo de trabajo de desarrollo.",
      securityTitle: "Modelo de Seguridad",
      securityIntro:
        "Seguridad de defensa en profundidad: autenticación por token (generado por inicio), validación de lista blanca de comandos, sanitización centralizada de entrada, limitación de tasa (200 req/min por IP), lista blanca CORS (solo localhost) y validación de URL.",
      featuresTitle: "Funcionalidades del Studio",
      featureDashboard:
        "Dashboard — Puntuación de salud, feed de actividad, estadísticas de módulos y visión general del sistema.",
      featureModules:
        "Gestor de Módulos — Crear, eliminar, inspeccionar y explorar módulos con UI visual y retroalimentación en tiempo real.",
      featureGenerators:
        "Generadores de Código — Generar eventos, especificaciones, validadores, enums, hooks, componentes y páginas mediante formularios.",
      featureDevServers:
        "Servidores de Desarrollo — Iniciar, detener y reiniciar servidores backend y frontend con controles de un clic.",
      featureDatabase:
        "Base de Datos — Ejecutar migraciones, sembrar datos, verificar estado de migración, realizar backups y resetear módulos.",
      featureDocker:
        "Docker — Gestionar servicios Docker Compose, ver logs, verificar salud de contenedores.",
      featureTerminal:
        "Terminal — Terminal integrado con historial de comandos, renderizado de salida ANSI y streaming via WebSocket.",
      featureConfig:
        "Editor de Configuración — Ver y editar variables de entorno en .env, appsettings.json y scripe.config.json.",
      featurePackages:
        "Gestor de Paquetes — Agregar, eliminar y actualizar paquetes npm y NuGet para frontend y backend.",
      featureSecurity:
        "Herramientas de Seguridad — Generar secretos JWT/AES, ejecutar auditorías de vulnerabilidades y validar completitud del entorno.",
      cliCommandsTitle: "Comandos CLI del Studio",
      cliCommandsIntro:
        "El Studio se lanza y gestiona completamente a través de la CLI de SCRIPE. El comando scripe studio soporta modo desarrollo (--dev), modo producción, modo solo compilación (studio build), puertos personalizados (--port, --engine-port) y modo headless (--no-browser).",
    },
    healthChecks: {
      title: "Comprobaciones de Salud y Probes K8s",
      description:
        "Endpoints de salud empresariales para probes de liveness, readiness y startup de Kubernetes con 5 comprobaciones individuales.",
      intro:
        "SCRIPE proporciona 5 endpoints de salud empresariales diseñados para la orquestación de Kubernetes, integración con balanceadores de carga y monitoreo operacional. Cada endpoint valida dependencias de infraestructura específicas y devuelve respuestas JSON estructuradas.",
      architectureTitle: "Arquitectura de Endpoints de Salud",
      endpointsTitle: "Endpoints de Salud",
      checksTitle: "Comprobaciones Individuales",
      checksIntro:
        "Cada verificación valida una dependencia de infraestructura específica. Las verificaciones se ejecutan en paralelo para una latencia mínima. Las verificaciones fallidas devuelven información detallada del error sin filtrar cadenas de conexión sensibles. El estado de fallo es configurable por verificación — fallos de Base de Datos y Startup devuelven Unhealthy, mientras que Redis, SMTP y Storage devuelven Degraded.",
      registrationTitle: "Registro de Verificaciones de Salud",
      registrationIntro:
        "Las verificaciones de salud se registran centralmente en HealthCheckExtensions.cs con etiquetas explícitas y estados de fallo. Las etiquetas determinan qué endpoint incluye cada verificación.",
      k8sTitle: "Configuración de Sondas de Kubernetes",
      k8sIntro:
        "Los endpoints de salud de SCRIPE se corresponden directamente con los tipos de sondas de Kubernetes. La sonda de inicio permite hasta 5 minutos (30 fallos × 10s intervalo) para la migración de base de datos en el primer despliegue.",
      dockerTitle: "Verificación de Salud Docker Compose",
      dockerIntro:
        "Para despliegues Docker Compose, configure verificaciones de salud en la definición del servicio. Use /health/live para liveness básico y /health/ready para readiness. Establezca start_period para permitir tiempo para migraciones de base de datos.",
      responseTitle: "Formato de Respuesta",
      responseIntro:
        "SCRIPE soporta dos formatos de respuesta según el endpoint. Los endpoints de sonda públicos devuelven JSON mínimo. Los endpoints autenticados devuelven respuesta detallada con duraciones, etiquetas, datos de carga y detalles de excepciones.",
      environmentsTitle: "Guía Específica por Entorno",
      dockerTip:
        "Para despliegues IIS: configure la sonda de salud Application Request Routing (ARR) con /health/ready como URL de verificación. Para Azure App Service: configure la ruta de verificación de salud = /health/ready.",
    },
    observability: {
      title: "Observabilidad y Monitoreo",
      description:
        "Trazado distribuido con OpenTelemetry, métricas Prometheus, logging centralizado con Grafana Loki y reglas de alerta preconfiguradas.",
      intro:
        "SCRIPE implementa un stack de observabilidad completo construido sobre estándares abiertos: OpenTelemetry para trazado distribuido, Prometheus para recolección de métricas, Grafana Loki para logging centralizado y Jaeger para visualización de trazas.",
      stackTitle: "Arquitectura del Stack de Observabilidad",
      tracingTitle: "Trazado Distribuido (OpenTelemetry)",
      tracingIntro:
        "El TracingBehavior crea un span de OpenTelemetry para cada handler de comando y consulta con detección automática de módulo, tipo de petición y mediciones de duración.",
      prometheusTitle: "Métricas de Prometheus",
      prometheusIntro:
        "El endpoint /metrics expone métricas de OpenTelemetry en formato texto de Prometheus. Prometheus recolecta este endpoint cada 15 segundos.",
      loggingTitle: "Logging Centralizado (Serilog + Loki)",
      loggingIntro:
        "Serilog enriquece cada entrada de log con nombre de máquina, entorno, ID de correlación, ID de inquilino y etiqueta de módulo. Cuando Loki está configurado, los logs se envían en tiempo real.",
      alertsTitle: "Reglas de Alerta",
      alertsIntro:
        "Reglas de alerta de Prometheus preconfiguradas detectan condiciones críticas y de advertencia. Las alertas críticas se disparan por altas tasas de error, caídas de base de datos y latencia extrema.",
      monitoringStackTitle: "Stack de Monitoreo Docker",
      monitoringStackIntro:
        "Un archivo Docker Compose preconstruido lanza el stack de monitoreo completo con fuentes de datos, dashboards y reglas de alerta aprovisionados automáticamente.",
      configTitle: "Configuración de Observabilidad",
      productionWarning:
        "En producción: establezca TraceSampleRatio en 0.1, cambie la contraseña predeterminada de Grafana, restrinja el acceso a /metrics mediante whitelist de IP en proxy inverso.",
    },
    auditTrail: {
      title: "Registro de Auditoría Empresarial",
      description:
        "Registro de auditoría completo con autodetección de módulo, seguimiento de correlación, transmisión en tiempo real por SignalR y más de 45 tipos de eventos.",
      intro:
        "El registro de auditoría empresarial de SCRIPE captura cada acción significativa en la plataforma — desde eventos de autenticación y mutaciones de entidades hasta cambios de permisos e incidentes de seguridad.",
      architectureTitle: "Arquitectura del Registro de Auditoría",
      entityTitle: "Esquema de Entidad AuditLog",
      entityIntro:
        "La entidad AuditLog captura contexto integral para cada evento auditable. Los valores antiguos y nuevos se almacenan como instantáneas JSON.",
      moduleDetectionTitle: "Autodetección de Módulo",
      moduleDetectionIntro:
        "El AuditService determina automáticamente qué módulo generó cada evento de auditoría analizando la ruta del endpoint API o el nombre del tipo de entidad.",
      eventTypesTitle: "Tipos de Eventos de Auditoría (45+)",
      realtimeTitle: "Transmisión en Tiempo Real",
      realtimeIntro:
        "Los eventos de auditoría (excluyendo logs de solicitudes HTTP rutinarias) se transmiten vía SignalR a los clientes conectados. Los eventos están delimitados por inquilino a través de grupos específicos.",
      queryTitle: "API de Consulta del Registro de Auditoría",
      queryIntro:
        "El endpoint de consulta del registro de auditoría soporta filtrado exhaustivo con 12 parámetros. Todos los filtros son opcionales y combinables. Los resultados están paginados (predeterminado: 20 elementos, máximo: 100) y ordenados por marca de tiempo descendente.",
      queryTip:
        "Consejo profesional: Use CorrelationId para rastrear el ciclo de vida completo de una solicitud HTTP a través de todas las entradas de auditoría.",
    },
    loadTesting: {
      title: "Pruebas de Carga y Respaldo",
      description:
        "Suites de pruebas de rendimiento k6 con umbrales SLA, integración CI/CD y estrategia de respaldo multi-proveedor.",
      intro:
        "SCRIPE incluye scripts de prueba de carga k6 para validar SLAs de rendimiento junto con una estrategia integral de respaldo y recuperación ante desastres.",
      overviewTitle: "Suites de Prueba k6",
      overviewIntro:
        "Dos suites de prueba k6 preconstruidas cubren los recorridos críticos del usuario: flujos de autenticación y operaciones CRUD.",
      thresholdsTitle: "Umbrales SLA",
      authFlowTitle: "Script de Prueba de Flujo de Autenticación",
      authFlowIntro:
        "La prueba auth-flow.js simula patrones de autenticación de usuario realistas: inicio de sesión, acceso a endpoints protegidos con token JWT y verificación de health check. Métricas personalizadas (scripe_login_duration, scripe_login_fail_rate) rastrean SLAs de autenticación.",
      runningTitle: "Ejecutar Pruebas de Carga",
      cicdTitle: "Integración CI/CD",
      cicdIntro:
        "k6 se integra con GitHub Actions, GitLab CI y Azure Pipelines. Las pruebas se ejecutan contra una instancia backend contenedorizada con espera de readiness de salud. El pipeline falla automáticamente si se supera cualquier umbral SLA.",
      backupTitle: "Respaldo y Recuperación ante Desastres",
      backupIntro:
        "SCRIPE soporta estrategias de respaldo multi-proveedor con herramientas y frecuencias específicas para cada motor de base de datos.",
      drWarning:
        "Crítico: Pruebe sus procedimientos de recuperación ante desastres trimestralmente. Un respaldo que nunca se ha restaurado no es un respaldo — es una esperanza.",
    },
    cacheInvalidation: {
      title: "Invalidación de Caché",
      description:
        "Caché por capas de ICacheService, patrón IInvalidatesCache, convenciones de claves de caché, arquitectura Redis con respaldo en memoria y caché HTTP basado en ETag.",
      intro:
        "El sistema de caché de SCRIPE es una arquitectura de dos capas: Redis como caché distribuida para implementaciones multi-instancia, con respaldo en memoria para desarrollo y escenarios sin conexión.",
      architectureTitle: "Arquitectura de Caché de Dos Capas",
      architectureContent:
        "ICacheService es el único punto de entrada para todas las operaciones de caché. En producción delega en RedisCache con IMemoryCache como respaldo. En desarrollo se utiliza InMemoryOnlyCache sin dependencias externas.",
      keyConventionsTitle: "Convenciones de Claves de Caché",
      keyConventionsContent:
        "Las claves siguen un formato jerárquico estricto: {EntityType}:{TenantId}:{Qualifier}. El aislamiento por TenantId previene fugas de datos entre inquilinos.",
      iInvalidatesCacheTitle: "IInvalidatesCache — Invalidación Declarativa",
      iInvalidatesCacheContent:
        "Los comandos que modifican datos declaran sus efectos de invalidación implementando IInvalidatesCache. CachingBehavior ejecuta RemoveByPrefixAsync para cada prefijo tras el éxito del comando.",
      etagTitle: "Caché HTTP Basado en ETag",
      etagContent:
        "Las respuestas GET incluyen un encabezado ETag. Los clientes pueden enviar If-None-Match; si la respuesta no cambió, el servidor devuelve 304 Not Modified sin cuerpo.",
      etagTip:
        "Los ETags funcionan independientemente de Redis. Combinar ambos optimiza el cálculo del backend y reduce la transferencia de red.",
      invalidationWarning:
        "La invalidación de prefijos usa SCAN + DEL en Redis. Evite prefijos genéricos en escenarios de alto tráfico.",
    },
    outboxPattern: {
      title: "Patrón Outbox",
      description:
        "Garantía de entrega de eventos de dominio exactamente una vez mediante EF Core OutboxInterceptor, tabla OutboxMessage y trabajo en segundo plano OutboxProcessor.",
      intro:
        "El patrón Outbox resuelve el problema de la doble escritura: persistir una entidad y emitir efectos secundarios (emails, webhooks, permisos) de forma atómica en una sola transacción.",
      dualWriteProblemTitle: "El Problema de la Doble Escritura",
      dualWriteProblemContent:
        "Sin el patrón Outbox, un fallo entre la persistencia y la llamada al servicio externo deja el sistema incoherente. El patrón garantiza consistencia transaccional absoluta.",
      implementationTitle: "Implementación de Outbox en SCRIPE",
      implementationContent:
        "El OutboxInterceptor intercepta eventos de dominio en SaveChangesAsync, los serializa a JSON e inserta en OutboxMessage en la misma transacción. OutboxProcessor los despacha de forma asíncrona.",
      flowTitle: "Flujo del Patrón Outbox",
      outboxMessageTitle: "Entidad OutboxMessage",
      processorTitle: "OutboxProcessor — El Despachador Confiable",
      processorContent:
        "OutboxProcessor se ejecuta cada 30 segundos, despachando mensajes no procesados a través de IMediator.Publish con reintentos exponenciales.",
      idempotencyTitle: "Requisitos de Idempotencia",
      idempotencyContent:
        "OutboxMessage.Id actúa como clave de idempotencia. Todos los manejadores que procesen eventos despachados deben ser idempotentes.",
      idempotencyTip:
        "OutboxProcessor garantiza entrega al menos una vez; la idempotencia de los manejadores proporciona la semántica de exactamente una vez.",
    },
    communication: {
      title: "Communication Module",
      description:
        "Horizontal message delivery service - email, SMS, in-app notifications, templates, delivery audit for all modules.",
      intro:
        "The Communication module owns ALL message delivery in SCRIPE. Every module dispatches messages through IMessageDispatcher - never directly via SMTP or Twilio.",
      architectureTitle: "Architecture",
      architectureIntro:
        "Identity and other modules call IMessageDispatcher in Core.Application. The Communication module implements this via SendEmailCommandHandler / SendSmsCommandHandler.",
      templatesTitle: "Message Templates",
      templatesIntro:
        "Templates are versioned, multi-channel records (Email/SMS/InApp/Push). Each template has a draft to published lifecycle rendered with Scriban.",
      jobsTitle: "Background Jobs",
      jobsIntro:
        "MessageRetryJob retries every 5 minutes. CommunicationSoftDeleteCleanupJob runs nightly at 3 AM to purge soft-deleted records older than 30 days.",
      permissionsTitle: "Permissions",
      permissionsContent:
        "communication.templates.view/create/update/delete | communication.send.email/sms/notification/bulk | communication.logs.view | communication.preferences.manage",
    },
    integrations: {
      title: "Integrations Module",
      description:
        "Machine-to-machine integration layer - outgoing webhooks with HMAC-SHA256 signing, API key management.",
      intro:
        "The Integrations module owns all machine-to-machine integration concerns. Webhooks notify external systems when SCRIPE events occur. API keys allow external API access without OAuth.",
      webhooksTitle: "Webhook System",
      webhooksIntro:
        "WebhookSubscription stores endpoint URL, subscribed event types, and HMAC-SHA256 signing secret. On domain events, WebhookDispatcher posts to matching subscriptions with X-SCRIPE-Signature-256 header.",
      apiKeysTitle: "API Key Management",
      apiKeysIntro:
        "API keys are tenant-scoped with comma-separated permission scopes. Key values are NEVER stored - only a bcrypt hash (KeyHash) is persisted after generation.",
      securityTitle: "Security",
      securityContent:
        "All webhook payloads are signed with HMAC-SHA256. Receivers MUST validate X-SCRIPE-Signature-256. A circuit breaker disables subscriptions after 10 consecutive failures.",
      permissionsTitle: "Permissions",
      permissionsContent:
        "integrations.connections.view/create/update/delete | integrations.apikeys.view/create/revoke | integrations.webhooks.view/create/update/delete",
    },
    media: {
      title: "Media Module",
      description:
        "Raw binary file storage - chunked upload, download sessions, temporary access grants, storage quota enforcement.",
      intro:
        "The Media module owns raw binary file storage. It provides chunked upload, temporary download links (MediaAccessGrant), folder organization, and storage quota checks via IFeatureChecker.",
      chunkedUploadTitle: "Chunked Upload",
      chunkedUploadIntro:
        "Large files are uploaded in chunks via StartUploadSessionCommand followed by UploadChunkCommand calls. On final chunk, the file is assembled and hash-verified.",
      accessGrantsTitle: "Temporary Access Grants",
      accessGrantsIntro:
        "MediaAccessGrant generates time-limited download URLs. DownloadsController validates the grant token and streams the file.",
      quotasTitle: "Storage Quotas",
      quotasContent:
        "Upload requests check the tenant's Media.StorageQuotaGb feature gate in Entitlements via IFeatureChecker.",
      permissionsTitle: "Permissions",
      permissionsContent:
        "media.files.view/upload/delete | media.folders.create/update/delete | media.access.grant | media.admin | media.export",
    },
    enterpriseConfig: {
      title: "Configuración de Plataforma Enterprise (appsettings.json)",
      description:
        "Especificación arquitectónica integral de la configuración host de SCRIPE, parámetros de seguridad, límites de tasa distribuidos, diagnósticos AstraFlow y proveedores de base de datos.",
      intro:
        "El host de SCRIPE se rige por una matriz de configuración empresarial en appsettings.json. Cubre cabeceras de seguridad en profundidad, limitadores de tasa distribuidos respaldados por Redis, diagnósticos de cobertura de pruebas AstraFlow, verificación de origen GeoIP y soporte de múltiples bases de datos con EF Core.",
      infoTitle: "Inyección de Variables de Entorno",
      infoContent:
        "En producción, los tokens sensibles (como InternalApiKey, OriginVerificationSecret y cadenas de conexión a bases de datos) se inyectan mediante variables de entorno del contenedor utilizando el formato estándar de doble guión bajo de ASP.NET Core.",
      archTitle: "Arquitectura y Topología de Configuración",
      archIntro:
        "Diseñado para cumplir con normativas SOC2, ISO 27001 y estándares de seguridad bancaria en entornos multi-inquilino.",
      featSecurity: "Seguridad en Profundidad",
      featSecurityDesc:
        "HSTS obligatorio, cabeceras Content-Security-Policy estrictas, bloqueo de cuentas (5 intentos fallidos / 15 min de bloqueo) y políticas de expiración de OTP.",
      featRateLimiting: "Límites de Tasa Multinivel",
      featRateLimitingDesc:
        "Algoritmos token-bucket respaldados por Redis con techos diferenciados por endpoint: 10/min para inicios de sesión, 30/min para mutaciones, 5/min para exportaciones pesadas y 3/min para envíos de OTP telefónico.",
      featGeoIp: "Verificación de Origen GeoIP y Cloudflare",
      featGeoIpDesc:
        "Cabeceras de verificación de origen que impiden el bypass directo a la IP, integradas con búsqueda de GeoIP en caché y listas de control de acceso CIDR.",
      featAstraFlow: "Diagnósticos AstraFlow",
      featAstraFlowDesc:
        "Verificación automatizada en el inicio de la cobertura de pruebas de solicitudes, integridad de catálogos de mapeo DTO y diagnósticos de contratos de API.",
      featDatabases: "Estrategia Multi-Base de Datos",
      featDatabasesDesc:
        "Proveedores EF Core conectables compatibles con PostgreSQL, Oracle y Microsoft SQL Server sin requerir cambios en el código de la aplicación.",
      featSweepers: "Procesos Automáticos de Limpieza",
      featSweepersDesc:
        "Tareas programadas en segundo plano que eliminan registros huérfanos de inquilinos, TTL de registros pendientes (24 horas) y purgas de eliminación lógica expiradas.",
      schemaTitle: "Matriz Canónica appsettings.json",
      schemaIntro:
        "El esquema empresarial central de src/Host/API/appsettings.json que demuestra los parámetros de seguridad y diagnóstico en producción:",
      pipelineTitle: "Canal de Seguridad y Gobernanza de Solicitudes Entrantes",
      pipelineIntro:
        "El flujo de ejecución de extremo a extremo a través de las capas de infraestructura de SCRIPE antes de alcanzar los manejadores de dominio:",
    },
  },
};

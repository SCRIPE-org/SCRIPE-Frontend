export const es = {
  infrastructure: {
    auditTrail: {
      architectureTitle: "Arquitectura del Registro de Auditoría",
      description:
        "Registro de auditoría completo con autodetección de módulo, seguimiento de correlación, transmisión en tiempo real por SignalR y más de 45 tipos de eventos.",
      entityIntro:
        "La entidad AuditLog captura contexto integral para cada evento auditable. Los valores antiguos y nuevos se almacenan como instantáneas JSON.",
      entityTitle: "Esquema de Entidad AuditLog",
      eventTypesTitle: "Tipos de Eventos de Auditoría (45+)",
      intro:
        "El registro de auditoría empresarial de SCRIPE captura cada acción significativa en la plataforma — desde eventos de autenticación y mutaciones de entidades hasta cambios de permisos e incidentes de seguridad.",
      moduleDetectionIntro:
        "El AuditService determina automáticamente qué módulo generó cada evento de auditoría analizando la ruta del endpoint API o el nombre del tipo de entidad.",
      moduleDetectionTitle: "Autodetección de Módulo",
      queryIntro:
        "El endpoint de consulta del registro de auditoría soporta filtrado exhaustivo con 12 parámetros. Todos los filtros son opcionales y combinables. Los resultados están paginados (predeterminado: 20 elementos, máximo: 100) y ordenados por marca de tiempo descendente.",
      queryTip:
        "Consejo profesional: Use CorrelationId para rastrear el ciclo de vida completo de una solicitud HTTP a través de todas las entradas de auditoría.",
      queryTitle: "API de Consulta del Registro de Auditoría",
      realtimeIntro:
        "Los eventos de auditoría (excluyendo logs de solicitudes HTTP rutinarias) se transmiten vía SignalR a los clientes conectados. Los eventos están delimitados por inquilino a través de grupos específicos.",
      realtimeTitle: "Transmisión en Tiempo Real",
      title: "Registro de Auditoría Empresarial",
    },
    backgroundJobs: {
      architectureFlowTitle: "El Pipeline de Autodescubrimiento",
      architectureIntro:
        "Al inicio, BackgroundJobsConfiguration lee el proveedor activo de appsettings.json y llama a GetServices<IAutoRegisteredJob>() para descubrir cada trabajo registrado en el contenedor DI. Para cada trabajo, verifica si hay anulaciones de appsettings por trabajo, analiza Enabled y CronExpression, y luego programa el trabajo utilizando la API del proveedor. Los trabajos en sí no contienen código específico del proveedor.",

      // Architecture
      architectureTitle: "Visión General de la Arquitectura",
      conn1: "[ES] drives",
      conn2: "[ES] triggers",
      conn3: "[ES] for each job",
      conn4: "[ES] on cron tick",
      connBuilds: "construye consulta",
      connOrders: "ordena",
      connRemoves: "elimina",
      connStarts: "inicia",
      connTriggers: "desencadena",
      contractIntro:
        "Cada trabajo recurrente en segundo plano en SCRIPE implementa una única interfaz: IAutoRegisteredJob. Ese es todo el contrato — tres propiedades y un método. La interfaz excluye intencionalmente cualquier concepto específico del proveedor (sin atributos de Hangfire, sin anotaciones de Quartz). El trabajo no sabe qué proveedor lo está ejecutando.",
      contractTitle: "El Contrato IAutoRegisteredJob",
      descConfig:
        "[ES] Provider: Native | Hangfire | Quartz\nJobs: { id: { Enabled, CronExpression } }",
      descDiscovery: "[ES] Scans DI container for every registered IAutoRegisteredJob",
      descExecute: "[ES] Provider-agnostic - job has zero knowledge of which provider runs it",
      description:
        "Trabajos recurrentes autodescubiertos, independientes del proveedor (Native, Hangfire, Quartz.NET) — 31 trabajos en 6 módulos sin cableado manual.",
      descSchedule: "[ES] Uses CronExpression from appsettings override or job default",
      descStartup: "[ES] Reads provider, discovers all jobs, schedules them",
      diIntro:
        "Cada trabajo requiere exactamente dos líneas de registro DI en el DependencyInjection.cs de su módulo. Omitir la segunda línea hace que el trabajo sea completamente invisible para todos los proveedores — nunca será descubierto ni programado, y no habrá error ni advertencia.",

      // DI Registration
      diTitle: "Registro DI — El Patrón Crítico de Dos Líneas",
      diWarning:
        "El delegado de fábrica de IAutoRegisteredJob (Línea 2) es la clave que hace que funcione el autodescubrimiento. GetServices<IAutoRegisteredJob>() solo devuelve trabajos registrados como IAutoRegisteredJob. Los trabajos registrados solo por su tipo concreto son invisibles para los tres proveedores.",
      diWarningTitle: "NUNCA Omitas la Línea 2",
      flowCascadeDesc:
        "Maneja las restricciones de clave externa en el orden de eliminación correcto",
      flowCascadeLabel: "Cascada consciente de FK",
      flowCronDesc: "Cron predeterminado para tareas de eliminación suave",
      flowCronLabel: "Tick Cron (3:00 AM)",
      flowExecuteDesc:
        "Ejecutar SQL nativo para la eliminación masiva, evitando el seguimiento de cambios de EF",
      flowExecuteLabel: "Eliminación definitiva",
      flowFilterDesc:
        "Buscar registros donde IsDeleted = true Y DeletedAt < DateTime.UtcNow.AddDays(-30)",
      flowFilterLabel: "Filtrar entidades caducadas",
      flowInitDesc: "Instanciado por el contenedor DI",
      flowInitLabel: "SoftDeleteCleanupJob<TContext>",
      flowScanDesc:
        "Escaneo de reflexión en DbContext para entidades que implementan ISoftDeletable",
      flowScanLabel: "Descubrir ISoftDeletable",
      hierarchyColClass: "Clase",
      hierarchyColGets: "Qué obtienes",
      hierarchyColUseWhen: "Cuándo usar",
      hierarchyIntro:
        "Tienes tres opciones dependiendo de la estructura que necesites. Los trabajos ligeros implementan IAutoRegisteredJob directamente. Los trabajos que necesitan registros estructurados de tiempo heredan RecurringJobBase. Los trabajos de limpieza para entidades eliminadas lógicamente heredan SoftDeleteCleanupJob<TContext>.",
      hierarchyRow1Gets: "Solo el contrato — control total, nada extra",
      hierarchyRow1When: "El trabajo es simple y no necesita estructura",
      hierarchyRow2Gets: "Registros automáticos de inicio/completado/error con tiempo",
      hierarchyRow2When: "Necesitas registros estructurados de tiempo y errores",
      hierarchyRow3Gets: "Descubrimiento automático de entidades, eliminación ordenada FK, lotes",
      hierarchyRow3When: "El módulo necesita limpieza permanente de eliminación lógica",

      // Class Hierarchy
      hierarchyTitle: "Jerarquía de Clases — Elige tu Clase Base",
      identityNote:
        "EmailProcessingJob y WebhookRetryJob/WebhookLogCleanupJob son trabajos de infraestructura subyacente registrados en DI del módulo Identity porque dependen de los servicios de Identity.",
      intro:
        "El sistema de trabajos en segundo plano de SCRIPE se basa en un principio: escribir una vez, ejecutar en cualquier proveedor. Cada trabajo implementa IAutoRegisteredJob y se descubre automáticamente al inicio. Cambiar entre Native, Hangfire o Quartz es solo un cambio de configuración en appsettings.json — cero cambios de código.",
      inventoryColPurpose: "Propósito",
      inventoryComplianceTitle: "Módulo Compliance (7 Trabajos)",
      inventoryCoreTitle: "Módulo Core (5 Trabajos)",
      inventoryEntitlementsTitle: "Módulo Entitlements (12 Trabajos)",
      inventoryIdentityTitle: "Módulo Identity (2 Trabajos)",
      inventoryIntro:
        "Los 33 trabajos recurrentes en segundo plano en los seis módulos. Cada trabajo implementa IAutoRegisteredJob. Los Cron predeterminados se pueden anular por entorno en appsettings.json.",
      inventoryMarketplaceTitle: "Módulo Marketplace (4 Trabajos)",
      inventoryPluginsTitle: "Módulo Plugins (3 Trabajos)",

      // Jobs Inventory
      inventoryTitle: "Inventario Completo de Trabajos — Todos los 33",
      jobAnalyticsReport: "Generación de informes de análisis semanales",
      jobAnalyticsSnapshot: "Agregación de instantáneas diarias de Ingresos/MRR/ARR",
      jobAuthSessionCleanup: "Limpia sesiones de autenticación caducadas y tokens de actualización",
      jobCommissionAutoCharge: "Reintentos de autodescargas fallidas de comisiones",
      jobCommissionInvoicing: "Generación consolidada de facturas de comisiones mensuales",
      jobComplianceSoftDelete:
        "Elimina permanentemente entidades Compliance eliminadas lógicamente",
      jobConsentExpiry: "Invalida el consentimiento de usuario expirado",
      jobDsrEscalation: "Advierte sobre plazos SLA de DSR próximos",
      jobDsrExecution: "Ejecuta solicitudes DSR pendientes cada 5 minutos",
      jobDsrExportCleanup: "Elimina exportaciones DSR expiradas",
      jobDunningNotification: "Envía notificaciones de pago fallido cada vez más urgentes",
      jobEditionRollout: "Aplica subidas y bajadas de categoría programadas",
      jobEmailProcessing:
        "Consulta y envía correos electrónicos retrasados a través de EmailJobProcessor",
      jobEntitlementsSoftDelete:
        "Elimina permanentemente entidades Entitlements eliminadas lógicamente",
      jobIdentitySoftDelete: "Elimina permanentemente entidades Identity eliminadas lógicamente",
      jobInstallCountAggregation:
        "Agrega recuentos de instalación transitorios en contadores estáticos de listados de aplicaciones",
      jobMarketplaceSoftDelete:
        "Elimina permanentemente listados, envíos, perfiles y reseñas eliminados lógicamente después del período de retención",
      jobOutboxCleanup: "Elimina mensajes outbox procesados de más de 7 días",

      // Job purpose descriptions
      jobOutboxProcessor: "Procesa mensajes outbox pendientes y los envía a AstraFlow",
      jobPaymobRecurringBilling: "Cargos recurrentes guardados en tarjetas de crédito Paymob",
      jobPayoutBatch:
        "Reúne ganancias pendientes en transferencias por lotes y ejecuta pagos a través de Stripe Connect",
      jobPluginDataCleanup:
        "Limpia las claves de almacenamiento temporal de bases de datos caducadas creadas por los plugins",
      jobPluginHealthCheck:
        "Sondea entornos sandbox de plugins activos e informa su estado de salud",
      jobPluginsSoftDelete:
        "Elimina permanentemente plugins, definiciones y registros de ejecución eliminados lógicamente después del período de retención",
      jobReportGeneration: "Consulta y genera informes de cumplimiento pendientes cada 2 minutos",
      jobRetentionEnforcement: "Aplica políticas de retención de datos",
      jobStaleSubmissionReminder:
        "Busca envíos de aplicaciones pendientes de revisión por más de 7 días y alerta a los administradores",
      jobSubscriptionReconciliation: "Expira pruebas, renueva suscripciones activas de usuarios",
      jobTenantHealthScore: "Recalcula puntajes de salud para todos los inquilinos activos",
      jobTrialNotification: "Envía recordatorios de fin de prueba a 7, 3 o 1 días de la expiración",
      jobUserSubscriptionReconciliation: "Conciliación de suscripciones a nivel de usuario Nivel 2",
      jobWebhookLogCleanup: "Elimina registros de entrega de webhooks de más de 90 días",
      jobWebhookRetry: "Procesa la cola de reintentos de webhooks guardados en lotes de 50",
      newJobIntro:
        "Siga estos cuatro pasos exactamente. Los únicos archivos requeridos son la clase del trabajo en sí y las dos líneas de registro DI. Todo lo demás se conecta automáticamente.",
      newJobStep1Desc:
        "Cree un nuevo archivo en {Module}.Infrastructure/BackgroundJobs/. Utilice la convención kebab-case de JobId: '{module}-{purpose}'. Haga que ExecuteAsync sea idempotente.",
      newJobStep1Title: "Paso 1 — Crear la Clase del Trabajo",
      newJobStep2Desc:
        "En el DependencyInjection.cs del módulo, agregue las dos líneas exactas de registro. La línea 1 habilita la inyección en el constructor. La línea 2 habilita el autodescubrimiento. NUNCA omita la línea 2.",
      newJobStep2Title: "Paso 2 — Registrar DI de Dos Líneas",
      newJobStep3Desc:
        "Para horarios específicos del entorno o para deshabilitar el trabajo, agregue una anulación en BackgroundJobs.Jobs utilizando el JobId como clave.",
      newJobStep3Title: "Paso 3 — Agregar anulación appsettings (Opcional)",
      newJobStep4Desc:
        "Ejecute scripe build backend. Cero errores significa que el trabajo está listo. El autodescubrimiento maneja todo lo demás — no es necesario ningún registro manual en ningún lugar.",
      newJobStep4Title: "Paso 4 — Compilar y Verificar",

      // Creating a New Job
      newJobTitle: "Creación de un Nuevo Trabajo",

      // IAutoRegisteredJob Contract
      nodeConfig: "[ES] appsettings.json\nProvider + Per-Job Overrides",
      nodeDiscovery: "[ES] Auto-Discovery Loop\nGetServices<IAutoRegisteredJob>()",
      nodeExecute: "[ES] job.ExecuteAsync(ct)\nAt every cron tick",
      nodeSchedule: "[ES] Schedule Each Job\nIf Enabled -> Register with provider API",
      nodeStartup: "[ES] BackgroundJobsConfiguration\nAddBackgroundJobsConfiguration()",
      providerColFeature: "Característica",
      providerColHangfire: "Hangfire",
      providerColNative: "Nativo",
      providerColQuartz: "Quartz",
      providerHangfireBest: "Producción con SQL Server",
      providerHangfireDash: "/hangfire (Solo SuperAdministrador)",
      providerHangfireRetry: "Sí (conteo de reintentos configurable)",
      providerHangfireYes: "Guardado en SQL — sobrevive reinicios",
      providerNativeBest: "Desarrollo local, pruebas unitarias",
      providerNativeDash: "Ninguno",
      providerNativeNo: "Solo memoria — perdido en reinicio",
      providerNativeRetry: "No",
      providerQuartzBest: "Producción con Oracle o PostgreSQL",
      providerQuartzDash: "Ninguno (Quartz.UI por separado)",
      providerQuartzOptional: "Memoria (almacenamiento en base de datos opcional)",
      providerQuartzRetry: "Sí (vía políticas misfire)",
      providerRowBestFor: "Mejor Para",
      providerRowDashboard: "Dashboard",
      providerRowPersistence: "Persistencia de Trabajos",
      providerRowRetry: "Reintentos Automáticos",
      providersIntro:
        "Los tres proveedores usan exactamente la misma interfaz IAutoRegisteredJob. La única diferencia es cómo programan y persisten los trabajos. Configure el proveedor en appsettings.json — el cambio requiere cero cambios de código.",

      // Providers
      providersTitle: "Comparación de Proveedores",
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
      rulesMustTitle: "✅ DEBE HACER",
      rulesNeverTitle: "❌ NUNCA",

      // Rules
      rulesTitle: "Las Reglas Inquebrantables",
      softDeleteFlowTitle: "Flujo de ejecución de eliminación suave",
      softDeleteIntro:
        "La clase base SoftDeleteCleanupJob<TContext> es la opción más avanzada. Descubre automáticamente todos los tipos de entidades ISoftDeletable en el DbContext, los clasifica topológicamente y los elimina en lotes.",
      softDeleteTip:
        "El comando CLI 'scripe add-bg-service {Module}' genera el archivo de trabajo y agrega los dos registros DI en un solo paso. Esta es la forma recomendada de agregar un SoftDeleteCleanupJob.",

      // SoftDelete
      softDeleteTitle: "SoftDeleteCleanupJob — Eliminación Automática Ordenada por FK",

      tenantWarning:
        "Los trabajos en segundo plano se ejecutan FUERA del contexto HTTP — no hay contexto de inquilino disponible. Los trabajos que manipulan datos específicos del inquilino DEBEN usar IServiceScopeFactory para crear un alcance (scope) de inquilino explícito.",
      title: "Trabajos en Segundo Plano (Background Jobs)",
    },
    databaseMigrations: {
      architectureContent:
        "La clase Base no posee el generador principal, heredamos a implementaciones puras aisladas por motor.",
      architectureTitle: "Topología Derived DbContext",
      cliContent:
        "Un comando corre scripts hijos en paralelo y compila las 3 versiones de migraciones exactas del ORM con sintaxis del dialecto original.",
      cliRemoveContent:
        "Retroceso (Rollback) de esquemas dañado para recuperar la base estable de código en las 3 bases en paralelo.",
      cliRemoveTitle: "Smart Force Removal",
      cliTitle: "Generación de Migraciones con SCRIPE-CLI",
      cliUpdateContent:
        "La CLI lee de manera inteligente si tu appsettings te dice que operes en Oracle, o en SQLServer, y lanza la migración update adecuada sin que debas decírselo.",
      cliUpdateTitle: "Autodetección al Actualizar la Base (Update)",
      cliWarning:
        "Nota: Intentar alterar la carpeta de Migraciones de EF de forma manual destruirá la cohesión.",
      description:
        "Generación múltiple para proveer esquemas en PostgreSQL, Oracle, o SQL Server de manera independiente.",
      diContent:
        "Las capas de datos consumen DbContext base, al arrancar el contenedor DI inyecta la versión de PostgreSQL, Oracle, o SQL Server mágicamente en el constructor de la interfaz.",
      diTitle: "Inyección de Proveedor a Nivel Binario",
      intro:
        "Resolución del clásico problema de choques de esquemas y tipos de datos en la sintaxis SQL. La arquitectura SCRIPE resuelve esto compilando un ModelSnapshot por motor de manera exclusiva.",
      newProviderContent: "Explicado con el uso de un cuarto motor ligero, como SQLite.",
      newProviderStep1: "Heredar del núcleo a una clase exclusiva Sealed Sqlite.",
      newProviderStep2: "Implementación de Factory Design Time.",
      newProviderStep3: "Inyección al InfrastructureDI de la arquitectura principal.",
      newProviderStep4: "Correr la CLI y generar el ModelSnapshot cero.",
      newProviderTitle: "Adición de un Proveedor de Motor Nuevo",
      title: "Migraciones de Bases de Datos",
    },
    fileStorage: {
      architectureTitle: "Arquitectura de Almacenamiento",
      configTitle: "Configuraciones del Proveedor",
      description:
        "Patrón de Estrategia para rotar entre Azure, S3 de Amazon, MinIO, o un FileSystem Local.",
      intro:
        "La plataforma cambia de un proveedor de Storage a otro únicamente modificando la variable appsettings.json, sin cambios en el código de compilación.",
      providersTitle: "Proveedores",
      tenantScopingTitle: "Carpetización obligatoria por Inquilino",
      title: "Almacenamiento de Archivos (Storage)",
      validationTitle: "Validación y Sanidad de Archivos",
    },
    gatewayDeployment: {
      description:
        "Proxy inverso YARP de alto nivel, sistema adaptativo de módulos y puestas a producción en IIS o Kestrel.",
      iisStep1Desc: "Correr el dotnet publish con la configuración final en Release.",
      iisStep1Title: "1. Publicar los Archivos Binarios",
      iisStep2Desc: "El sitio se asocia a la carpeta compilada de salida.",
      iisStep2Title: "2. Preparación de IIS",
      iisStep3Desc: "Inyectar la conexión SQL dentro del servidor para la aplicación ASP.NET.",
      iisStep3Title: "3. Perfilado del Entorno",
      iisStep4Desc:
        "Obligatorio fijarlo a 'No Managed Code' usando el módulo Out-of-process de Core.",
      iisStep4Title: "4. Reglas del Pool (App Pool)",
      iisTitle: "Despliegue a Producción (IIS / Windows Server)",
      intro:
        "Cubre cómo las piezas compiladas del Monolito Modular convergen y cómo se despliegan en el mundo real.",
      kestrelTitle: "Configuración en Kestrel (Linux/Docker)",
      microservicesTitle: "Modo de Microservicios Distribuidos",
      modesTitle: "Modos de Operación y Despliegue",
      moduleIntro:
        "El núcleo que en base a un string (MODULE_NAME) determina si debe correr pesado o liviano en la RAM.",
      moduleTitle: "Sistema de Módulos (Runtime)",
      monolithTitle: "Modo Monolítico",
      portNote:
        "El enrutamiento sabe direccionar los puertos del local host dinámicamente entre el Proxy y el servicio que los arranca.",
      title: "Gateway y Despliegue (Deployment)",
      yarpIntro:
        "El portero de la API que dirige todo el tráfico y resuelve en qué instancia reside el módulo, terminando los certificados SSL.",
      yarpTitle: "Gateway API con YARP",
    },
    healthChecks: {
      architectureTitle: "Arquitectura de Endpoints de Salud",
      checksIntro:
        "Cada verificación valida una dependencia de infraestructura específica. Las verificaciones se ejecutan en paralelo para una latencia mínima. Las verificaciones fallidas devuelven información detallada del error sin filtrar cadenas de conexión sensibles. El estado de fallo es configurable por verificación — fallos de Base de Datos y Startup devuelven Unhealthy, mientras que Redis, SMTP y Storage devuelven Degraded.",
      checksTitle: "Comprobaciones Individuales",
      description:
        "Endpoints de salud empresariales para probes de liveness, readiness y startup de Kubernetes con 5 comprobaciones individuales.",
      dockerIntro:
        "Para despliegues Docker Compose, configure verificaciones de salud en la definición del servicio. Use /health/live para liveness básico y /health/ready para readiness. Establezca start_period para permitir tiempo para migraciones de base de datos.",
      dockerTip:
        "Para despliegues IIS: configure la sonda de salud Application Request Routing (ARR) con /health/ready como URL de verificación. Para Azure App Service: configure la ruta de verificación de salud = /health/ready.",
      dockerTitle: "Verificación de Salud Docker Compose",
      endpointsTitle: "Endpoints de Salud",
      environmentsTitle: "Guía Específica por Entorno",
      intro:
        "SCRIPE proporciona 5 endpoints de salud empresariales diseñados para la orquestación de Kubernetes, integración con balanceadores de carga y monitoreo operacional. Cada endpoint valida dependencias de infraestructura específicas y devuelve respuestas JSON estructuradas.",
      k8sIntro:
        "Los endpoints de salud de SCRIPE se corresponden directamente con los tipos de sondas de Kubernetes. La sonda de inicio permite hasta 5 minutos (30 fallos × 10s intervalo) para la migración de base de datos en el primer despliegue.",
      k8sTitle: "Configuración de Sondas de Kubernetes",
      registrationIntro:
        "Las verificaciones de salud se registran centralmente en HealthCheckExtensions.cs con etiquetas explícitas y estados de fallo. Las etiquetas determinan qué endpoint incluye cada verificación.",
      registrationTitle: "Registro de Verificaciones de Salud",
      responseIntro:
        "SCRIPE soporta dos formatos de respuesta según el endpoint. Los endpoints de sonda públicos devuelven JSON mínimo. Los endpoints autenticados devuelven respuesta detallada con duraciones, etiquetas, datos de carga y detalles de excepciones.",
      responseTitle: "Formato de Respuesta",
      title: "Comprobaciones de Salud y Probes K8s",
    },
    loadTesting: {
      authFlowIntro:
        "La prueba auth-flow.js simula patrones de autenticación de usuario realistas: inicio de sesión, acceso a endpoints protegidos con token JWT y verificación de health check. Métricas personalizadas (scr_login_duration, scr_login_fail_rate) rastrean SLAs de autenticación.",
      authFlowTitle: "Script de Prueba de Flujo de Autenticación",
      backupIntro:
        "SCRIPE soporta estrategias de respaldo multi-proveedor con herramientas y frecuencias específicas para cada motor de base de datos.",
      backupTitle: "Respaldo y Recuperación ante Desastres",
      cicdIntro:
        "k6 se integra con GitHub Actions, GitLab CI y Azure Pipelines. Las pruebas se ejecutan contra una instancia backend contenedorizada con espera de readiness de salud. El pipeline falla automáticamente si se supera cualquier umbral SLA.",
      cicdTitle: "Integración CI/CD",
      description:
        "Suites de pruebas de rendimiento k6 con umbrales SLA, integración CI/CD y estrategia de respaldo multi-proveedor.",
      drWarning:
        "Crítico: Pruebe sus procedimientos de recuperación ante desastres trimestralmente. Un respaldo que nunca se ha restaurado no es un respaldo — es una esperanza.",
      intro:
        "SCRIPE incluye scripts de prueba de carga k6 para validar SLAs de rendimiento junto con una estrategia integral de respaldo y recuperación ante desastres.",
      overviewIntro:
        "Dos suites de prueba k6 preconstruidas cubren los recorridos críticos del usuario: flujos de autenticación y operaciones CRUD.",
      overviewTitle: "Suites de Prueba k6",
      runningTitle: "Ejecutar Pruebas de Carga",
      thresholdsTitle: "Umbrales SLA",
      title: "Pruebas de Carga y Respaldo",
    },
    observability: {
      alertsIntro:
        "Reglas de alerta de Prometheus preconfiguradas detectan condiciones críticas y de advertencia. Las alertas críticas se disparan por altas tasas de error, caídas de base de datos y latencia extrema.",
      alertsTitle: "Reglas de Alerta",
      configTitle: "Configuración de Observabilidad",
      description:
        "Trazado distribuido con OpenTelemetry, métricas Prometheus, logging centralizado con Grafana Loki y reglas de alerta preconfiguradas.",
      intro:
        "SCRIPE implementa un stack de observabilidad completo construido sobre estándares abiertos: OpenTelemetry para trazado distribuido, Prometheus para recolección de métricas, Grafana Loki para logging centralizado y Jaeger para visualización de trazas.",
      loggingIntro:
        "Serilog enriquece cada entrada de log con nombre de máquina, entorno, ID de correlación, ID de inquilino y etiqueta de módulo. Cuando Loki está configurado, los logs se envían en tiempo real.",
      loggingTitle: "Logging Centralizado (Serilog + Loki)",
      monitoringStackIntro:
        "Un archivo Docker Compose preconstruido lanza el stack de monitoreo completo con fuentes de datos, dashboards y reglas de alerta aprovisionados automáticamente.",
      monitoringStackTitle: "Stack de Monitoreo Docker",
      productionWarning:
        "En producción: establezca TraceSampleRatio en 0.1, cambie la contraseña predeterminada de Grafana, restrinja el acceso a /metrics mediante whitelist de IP en proxy inverso.",
      prometheusIntro:
        "El endpoint /metrics expone métricas de OpenTelemetry en formato texto de Prometheus. Prometheus recolecta este endpoint cada 15 segundos.",
      prometheusTitle: "Métricas de Prometheus",
      stackTitle: "Arquitectura del Stack de Observabilidad",
      title: "Observabilidad y Monitoreo",
      tracingIntro:
        "El TracingBehavior crea un span de OpenTelemetry para cada handler de comando y consulta con detección automática de módulo, tipo de petición y mediciones de duración.",
      tracingTitle: "Trazado Distribuido (OpenTelemetry)",
    },
    resilience: {
      architectureTitle: "Arquitectura de Resiliencia",
      circuitBreakerIntro:
        "Si la red paralela se cae después de N intentos, el circuito se abre y descarta las llamadas futuras inmediatamente por 30 segundos dando tiempo a la recuperación.",
      circuitBreakerTitle: "Interruptor de Circuito (Circuit Breaker)",
      configTitle: "Configuraciones Dinámicas",
      description:
        "Estrategias de supervivencia de Polly contra fallas transitivas de la red y APIs de terceros caídas.",
      intro:
        "Garantiza que SCRIPE no sufra fallas en cascada y asfixie los servidores esperando llamadas que van a morir.",
      retryTitle: "Política de Reintentos",
      timeoutTitle: "Política de Límite de Tiempo (Timeout)",
      title: "Patrones de Resiliencia",
      usageTitle: "Aplicación sobre clientes HttpClient",
    },
    scripeCli: {
      autoWiringIntro:
        "El verdadero valor del CLI no es generar texto, sino insertarlo en un monstruo de 1000 archivos donde debe encajar exactamente.",
      autoWiringTitle: "Auto-Conexión (Auto-Wiring) Profunda",
      bgJobsIntro: "Esqueleto de proceso programado integrado al contenedor y a los permisos.",
      bgJobsTitle: "Generador de Hangfire Jobs",
      commandsIntro: "La piedra angular para crear cualquier funcionalidad.",
      commandsReferenceIntro:
        "La CLI de SCRIPE cuenta con 123 comandos en 10 categorías distintas, que cubren todos los aspectos del ciclo de vida del desarrollo y las operaciones. A continuación se muestra la tabla de referencia completa.",
      commandsReferenceTitle: "Referencia Completa de Comandos (v4.0)",
      commandsTitle: "Comandos Base de Andamiaje",
      configIntro:
        "Lógica para detectar y encontrar la carpeta raíz del Monorepo basándose en scripe.config.json.",
      configTitle: "Fichero de Configuración CLI",
      dbCliCmd: "Administra comandos EF Core nativos envueltos en lógica amigable.",
      dbSyncIntro: "Operaciones de sincronismo y parseo generalizado a Zod y Swagger.",
      dbSyncTitle: "Operaciones de Base de Datos Remota",
      description:
        "Productividad inmensa con andamiaje de 79 plantillas generadas de golpe y conexiones automatizadas al ecosistema.",
      destructionIntro:
        "Desandamiaje perfecto. Destruye los archivos y retira los links sin romper las compilaciones.",
      destructionTitle: "Herramientas de Reversión",
      dslIntro: "Mediante -p se declara un objeto a lo largo del stack de la aplicación.",
      dslSyntaxInfo: "Sintaxis: NombreCampo:TipoC#[:modificador1][:modificador]",
      dslTitle: "Sintaxis DSL para Propiedades",
      intro:
        "La CLI basada en Node que elimina por completo la repetición del código en arquitecturas limpias y enlaza Frontend y Backend.",
      namingIntro:
        "No importa si pasas el nombre en minúscula, guion o Pascal: lo transforma correctamente.",
      namingTitle: "Inteligencia de Pluralización de Nombres",
      newFeatureIntro:
        "Dispara la lógica CRUD generando las llamadas de Red, la UI, los Controladores, AstraFlow mediator, y EF Core Configurations.",
      newFeatureTitle: "Andamiaje de Operaciones (new-feature)",
      newModuleIntro:
        "Crea la partición de microservicio base y las carpetas de negocio en React y .NET en un solo pulso.",
      newModuleTitle: "Andamiaje de Módulos (new-module)",
      revertSafely: "Limpia y purga las inyecciones al hacer rollback.",
      securityIntro:
        "La CLI protege los controladores autogenerados para requerir perfiles de autenticación automáticamente.",
      securityTitle: "Automapeo de Seguridad",
      syncApiCmd:
        "Copia una respuesta remota de OpenAPI y la transfiere a modelos completos de Typescript listos para consumirse.",
      templatesIntro:
        "En lugar de escribir arquitecturas estándar a mano, la CLI aplica una Arquitectura Limpia pura a través de 79 plantillas precisas de Handlebars que abarcan 54 archivos de backend y 25 configuraciones de frontend, garantizando la calidad.",
      templatesTitle: "79 Plantillas Inmutables",
      title: "Herramientas SCRIPE CLI",
      utilityIntro: "Comandos de arranque npm y dotnet unificados.",
      utilityTitle: "Aceleradores de Flujo",
      wiringDocker: "Extiende el docker-compose.",
      wiringFrontendApp: "Anidado del Router del frontend.",
      wiringFrontEnv: "Actualiza variables env.",
      wiringPermissions: "Añade constantes React al árbol de RBAC.",
      wiringProgram: "Modifica Program.cs a tu nombre.",
      wiringSettings: "Interviene los JSON base.",
      wiringSln: "Integración nativa del compilador SLN.",
    },
    scripeStudio: {
      architectureIntro:
        "El Studio consta de dos componentes: el Motor (Express + Socket.io + SQLite en el puerto 4201) maneja solicitudes API, ejecución de comandos y streaming en tiempo real. La UI (Next.js en el puerto 4200) ofrece 19 páginas que cubren todos los aspectos del flujo de trabajo de desarrollo.",
      architectureTitle: "Arquitectura del Studio",
      cliCommandsIntro:
        "El Studio se lanza y gestiona completamente a través de la CLI de SCRIPE. El comando scripe studio soporta modo desarrollo (--dev), modo producción, modo solo compilación (studio build), puertos personalizados (--port, --engine-port) y modo headless (--no-browser).",
      cliCommandsTitle: "Comandos CLI del Studio",
      description:
        "Panel de control visual para desarrolladores con gestión de módulos en tiempo real, generadores de código, controles de servidor de desarrollo y terminal integrado.",
      featureConfig:
        "Editor de Configuración — Ver y editar variables de entorno en .env, appsettings.json y scripe.config.json.",
      featureDashboard:
        "Dashboard — Puntuación de salud, feed de actividad, estadísticas de módulos y visión general del sistema.",
      featureDatabase:
        "Base de Datos — Ejecutar migraciones, sembrar datos, verificar estado de migración, realizar backups y resetear módulos.",
      featureDevServers:
        "Servidores de Desarrollo — Iniciar, detener y reiniciar servidores backend y frontend con controles de un clic.",
      featureDocker:
        "Docker — Gestionar servicios Docker Compose, ver logs, verificar salud de contenedores.",
      featureGenerators:
        "Generadores de Código — Generar eventos, especificaciones, validadores, enums, hooks, componentes y páginas mediante formularios.",
      featureModules:
        "Gestor de Módulos — Crear, eliminar, inspeccionar y explorar módulos con UI visual y retroalimentación en tiempo real.",
      featurePackages:
        "Gestor de Paquetes — Agregar, eliminar y actualizar paquetes npm y NuGet para frontend y backend.",
      featureSecurity:
        "Herramientas de Seguridad — Generar secretos JWT/AES, ejecutar auditorías de vulnerabilidades y validar completitud del entorno.",
      featuresTitle: "Funcionalidades del Studio",
      featureTerminal:
        "Terminal — Terminal integrado con historial de comandos, renderizado de salida ANSI y streaming via WebSocket.",
      intro:
        "SCRIPE Studio es un panel visual completo para desarrolladores que proporciona una interfaz web en tiempo real para gestionar módulos, ejecutar generadores de código, controlar servidores de desarrollo, realizar operaciones de base de datos, gestionar contenedores Docker y más — todo desde una sola pestaña del navegador.",
      securityIntro:
        "Seguridad de defensa en profundidad: autenticación por token (generado por inicio), validación de lista blanca de comandos, sanitización centralizada de entrada, limitación de tasa (200 req/min por IP), lista blanca CORS (solo localhost) y validación de URL.",
      securityTitle: "Modelo de Seguridad",
      title: "SCRIPE Studio",
    },
  },
};

/**
 * Docs page locale — ES
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const es = {
  infrastructure: {
    backgroundJobs: {
      title: "Trabajos en Segundo Plano (Background Jobs)",
      description:
        "Motor de procesamiento Hangfire: limpieza, procesadores de Outbox y el propio panel de supervisión.",
      intro:
        "Asegura la operatividad asincrónica evitando penalizar los tiempos de la API principal.",
      architectureTitle: "Arquitectura de Hangfire",
      recurringTitle: "Trabajos Recurrentes Cron",
      softDeleteTitle: "Trabajo de Limpieza de Soft-Delete",
      softDeleteIntro:
        "Busca registros viejos pasados de su ventana de retención y lanza los verdaderos DELETE respetando llaves foráneas.",
      dashboardTitle: "Dashboard Hangfire",
      dashboardIntro:
        "Panel nativo de monitoreo de trabajos. Accesible únicamente en NEXORA bajo tokens SuperAdmin.",
      configTitle: "Configuración",
      tenantWarning:
        "Los trabajos (Jobs) de fondo se levantan sin la firma de ningún inquilino, la lógica del código del Job asume un cambio artificial de inquilino al correr la acción.",
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
    },
    resilience: {
      title: "Patrones de Resiliencia",
      description:
        "Estrategias de supervivencia de Polly contra fallas transitivas de la red y APIs de terceros caídas.",
      intro:
        "Garantiza que NEXORA no sufra fallas en cascada y asfixie los servidores esperando llamadas que van a morir.",
      architectureTitle: "Arquitectura de Resiliencia",
      retryTitle: "Política de Reintentos",
      circuitBreakerTitle: "Interruptor de Circuito (Circuit Breaker)",
      circuitBreakerIntro:
        "Si la red paralela se cae después de N intentos, el circuito se abre y descarta las llamadas futuras inmediatamente por 30 segundos dando tiempo a la recuperación.",
      timeoutTitle: "Política de Límite de Tiempo (Timeout)",
      usageTitle: "Aplicación sobre clientes HttpClient",
      configTitle: "Configuraciones Dinámicas",
    },
    gatewayDeployment: {
      title: "Gateway y Despliegue (Deployment)",
      description:
        "Proxy inverso YARP de alto nivel, sistema adaptativo de módulos y puestas a producción en IIS o Kestrel.",
      intro:
        "Cubre cómo las piezas compiladas del Monolito Modular convergen y cómo se despliegan en el mundo real.",
      yarpTitle: "Gateway API con YARP",
      yarpIntro:
        "El portero de la API que dirige todo el tráfico y resuelve en qué instancia reside el módulo, terminando los certificados SSL.",
      moduleTitle: "Sistema de Módulos (Runtime)",
      moduleIntro:
        "El núcleo que en base a un string (MODULE_NAME) determina si debe correr pesado o liviano en la RAM.",
      modesTitle: "Modos de Operación y Despliegue",
      monolithTitle: "Modo Monolítico",
      microservicesTitle: "Modo de Microservicios Distribuidos",
      portNote:
        "El enrutamiento sabe direccionar los puertos del local host dinámicamente entre el Proxy y el servicio que los arranca.",
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
    },
    databaseMigrations: {
      title: "Migraciones de Bases de Datos",
      description:
        "Generación múltiple para proveer esquemas en PostgreSQL, Oracle, o SQL Server de manera independiente.",
      intro:
        "Resolución del clásico problema de choques de esquemas y tipos de datos en la sintaxis SQL. La arquitectura NEXORA resuelve esto compilando un ModelSnapshot por motor de manera exclusiva.",
      architectureTitle: "Topología Derived DbContext",
      architectureContent:
        "La clase Base no posee el generador principal, heredamos a implementaciones puras aisladas por motor.",
      diTitle: "Inyección de Proveedor a Nivel Binario",
      diContent:
        "Las capas de datos consumen DbContext base, al arrancar el contenedor DI inyecta la versión de PostgreSQL, Oracle, o SQL Server mágicamente en el constructor de la interfaz.",
      cliTitle: "Generación de Migraciones con NEXORA-CLI",
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
    nexoraCli: {
      title: "Herramientas NEXORA CLI",
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
        "Dispara la lógica CRUD generando las llamadas de Red, la UI, los Controladores, MediatR, y EF Core Configurations.",
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
        "Lógica para detectar y encontrar la carpeta raíz del Monorepo basándose en nexora.config.json.",
      namingTitle: "Inteligencia de Pluralización de Nombres",
      namingIntro:
        "No importa si pasas el nombre en minúscula, guion o Pascal: lo transforma correctamente.",
      utilityTitle: "Aceleradores de Flujo",
      utilityIntro: "Comandos de arranque npm y dotnet unificados.",
    },
    nexoraStudio: {
      title: "NEXORA Studio",
      description:
        "Panel de control visual para desarrolladores con gestión de módulos en tiempo real, generadores de código, controles de servidor de desarrollo y terminal integrado.",
      intro:
        "NEXORA Studio es un panel visual completo para desarrolladores que proporciona una interfaz web en tiempo real para gestionar módulos, ejecutar generadores de código, controlar servidores de desarrollo, realizar operaciones de base de datos, gestionar contenedores Docker y más — todo desde una sola pestaña del navegador.",
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
        "Editor de Configuración — Ver y editar variables de entorno en .env, appsettings.json y nexora.config.json.",
      featurePackages:
        "Gestor de Paquetes — Agregar, eliminar y actualizar paquetes npm y NuGet para frontend y backend.",
      featureSecurity:
        "Herramientas de Seguridad — Generar secretos JWT/AES, ejecutar auditorías de vulnerabilidades y validar completitud del entorno.",
      cliCommandsTitle: "Comandos CLI del Studio",
      cliCommandsIntro:
        "El Studio se lanza y gestiona completamente a través de la CLI de NEXORA. El comando nexora studio soporta modo desarrollo (--dev), modo producción, modo solo compilación (studio build), puertos personalizados (--port, --engine-port) y modo headless (--no-browser).",
    },
    healthChecks: {
      title: "Comprobaciones de Salud y Probes K8s",
      description:
        "Endpoints de salud empresariales para probes de liveness, readiness y startup de Kubernetes con 5 comprobaciones individuales.",
      intro:
        "NEXORA proporciona 5 endpoints de salud empresariales diseñados para la orquestación de Kubernetes, integración con balanceadores de carga y monitoreo operacional. Cada endpoint valida dependencias de infraestructura específicas y devuelve respuestas JSON estructuradas.",
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
        "Los endpoints de salud de NEXORA se corresponden directamente con los tipos de sondas de Kubernetes. La sonda de inicio permite hasta 5 minutos (30 fallos × 10s intervalo) para la migración de base de datos en el primer despliegue.",
      dockerTitle: "Verificación de Salud Docker Compose",
      dockerIntro:
        "Para despliegues Docker Compose, configure verificaciones de salud en la definición del servicio. Use /health/live para liveness básico y /health/ready para readiness. Establezca start_period para permitir tiempo para migraciones de base de datos.",
      responseTitle: "Formato de Respuesta",
      responseIntro:
        "NEXORA soporta dos formatos de respuesta según el endpoint. Los endpoints de sonda públicos devuelven JSON mínimo. Los endpoints autenticados devuelven respuesta detallada con duraciones, etiquetas, datos de carga y detalles de excepciones.",
      environmentsTitle: "Guía Específica por Entorno",
      dockerTip:
        "Para despliegues IIS: configure la sonda de salud Application Request Routing (ARR) con /health/ready como URL de verificación. Para Azure App Service: configure la ruta de verificación de salud = /health/ready.",
    },
    observability: {
      title: "Observabilidad y Monitoreo",
      description:
        "Trazado distribuido con OpenTelemetry, métricas Prometheus, logging centralizado con Grafana Loki y reglas de alerta preconfiguradas.",
      intro:
        "NEXORA implementa un stack de observabilidad completo construido sobre estándares abiertos: OpenTelemetry para trazado distribuido, Prometheus para recolección de métricas, Grafana Loki para logging centralizado y Jaeger para visualización de trazas.",
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
        "El registro de auditoría empresarial de NEXORA captura cada acción significativa en la plataforma — desde eventos de autenticación y mutaciones de entidades hasta cambios de permisos e incidentes de seguridad.",
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
        "NEXORA incluye scripts de prueba de carga k6 para validar SLAs de rendimiento junto con una estrategia integral de respaldo y recuperación ante desastres.",
      overviewTitle: "Suites de Prueba k6",
      overviewIntro:
        "Dos suites de prueba k6 preconstruidas cubren los recorridos críticos del usuario: flujos de autenticación y operaciones CRUD.",
      thresholdsTitle: "Umbrales SLA",
      authFlowTitle: "Script de Prueba de Flujo de Autenticación",
      authFlowIntro:
        "La prueba auth-flow.js simula patrones de autenticación de usuario realistas: inicio de sesión, acceso a endpoints protegidos con token JWT y verificación de health check. Métricas personalizadas (nexora_login_duration, nexora_login_fail_rate) rastrean SLAs de autenticación.",
      runningTitle: "Ejecutar Pruebas de Carga",
      cicdTitle: "Integración CI/CD",
      cicdIntro:
        "k6 se integra con GitHub Actions, GitLab CI y Azure Pipelines. Las pruebas se ejecutan contra una instancia backend contenedorizada con espera de readiness de salud. El pipeline falla automáticamente si se supera cualquier umbral SLA.",
      backupTitle: "Respaldo y Recuperación ante Desastres",
      backupIntro:
        "NEXORA soporta estrategias de respaldo multi-proveedor con herramientas y frecuencias específicas para cada motor de base de datos.",
      drWarning:
        "Crítico: Pruebe sus procedimientos de recuperación ante desastres trimestralmente. Un respaldo que nunca se ha restaurado no es un respaldo — es una esperanza.",
    },
  },
};

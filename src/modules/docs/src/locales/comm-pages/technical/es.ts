/**
 * Docs page locale — ES
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const es = {
  commercial: {
    performanceBenchmarks: {
      apiIntro:
        "Nuestra arquitectura prioriza la velocidad sin sacrificar la abstracción. Cada capa de la API se somete a evaluaciones comparativas rigurosas para garantizar una asignación (allocation) mínima y un rendimiento máximo.",
      apiTitle: "Velocidad Sostenida de la API",
      cachingContent:
        "No consultamos la base de datos a menos que sea estrictamente necesario. NEXORA implementa una estrategia de almacenamiento en caché agresiva y de múltiples niveles. Las cachés de memoria L1 de corta duración interceptan peticiones concurrentes idénticas, mientras que la caché Redis L2 distribuida proporciona un rendimiento de lectura masivo entre nodos.",
      cachingTitle: "Caché Agresivo de Múltiples Niveles",
      dbTitle: "Optimización de Entity Framework",
      description:
        "Métricas de rendimiento transparentes en el mundo real, estrategias de optimización y capacidades de escalado horizontal.",
      frontendTitle: "Motor de Renderizado Next.js",
      intro:
        "NEXORA no es solo escalable; es explosivamente rápida. Al utilizar las últimas mejoras de rendimiento de .NET 9 y el agresivo almacenamiento en caché distribuido, la plataforma maneja cargas concurrentes masivas con eficiencia a nivel de hardware.",
      scaleTitle: "Escala Horizontal Infinita",
      tip: "Nota de rendimiento: Los Dockerfiles de múltiples etapas incluidos garantizan la huella de contenedor absolutamente más pequeña, permitiendo que los clústeres de instancias se escalen automáticamente en milisegundos.",
      title: "Métricas de Rendimiento",
    },
    realTimeCapabilities: {
      dashboardsContent:
        "Deje de obligar a sus usuarios a actualizar la página. Los paneles operativos se vuelven a renderizar dinámicamente en el milisegundo exacto en que cambian las métricas de la base de datos subyacente, proporcionando una ventaja competitiva masiva para aplicaciones de despacho, comercio (trading) y monitoreo.",
      dashboardsTitle: "Paneles en Vivo en Fracciones de Segundo",
      description:
        "Integración de WebSockets de última generación que permite paneles en vivo en fracciones de segundo, transmisiones (broadcasting) en todo el sistema y seguimiento de presencia colaborativa.",
      intro:
        "Las aplicaciones empresariales modernas deben estar vivas. NEXORA integra un backplane SignalR WebSocket distribuido y altamente optimizado desde el primer momento, entregando comunicación bidireccional en tiempo real a millones de clientes simultáneos.",
      liveAudit: "Transmisión Forense en Tiempo Real",
      liveAuditDesc:
        "Transmita registros críticos de seguridad y auditoría directamente a los paneles de los administradores a medida que ocurren globalmente.",
      liveCharts: "Renderizado de Telemetría Dinámica",
      liveChartsDesc:
        "Los puntos de datos de los gráficos se animan en la pantalla en el momento en que se publica un evento en el backend.",
      notificationsContent:
        "El centro de notificaciones unificado de la plataforma puede impulsar alertas transaccionales, solicitudes de aprobación y advertencias del sistema directamente a la interfaz de usuario de React sin hacer sondeos (polling) en el servidor, lo que reduce drásticamente la carga de la base de datos y el consumo de batería en los clientes móviles.",
      notificationsTitle: "Notificaciones Globales Instantáneas",
      presenceTrack: "Seguimiento de Presencia y Bloqueo",
      presenceTrackDesc:
        "Indique visualmente cuando un colega está editando activamente una entidad específica para evitar sobrescrituras lógicas.",
      scaleTitle: "Escala Global Respaldada por Redis",
      securityAlert: "Transmisión Instantánea de Amenazas",
      securityAlertDesc:
        "Emita cambios críticos en los protocolos de seguridad forzando reautenticaciones inmediatas en los clientes.",
      signalrContent:
        "¿Ejecutando múltiples nodos de API? No hay problema. Nuestro backplane de Redis preconfigurado sincroniza de manera transparente los mensajes de WebSocket en todo su clúster de Kubernetes, garantizando que un usuario conectado al Nodo A reciba un mensaje generado por el Nodo B.",
      signalrTitle: "Backplane WebSocket Distribuido",
      title: "Reactividad en Tiempo Real",
    },
    resiliencePatterns: {
      circuitContent:
        "Si una pasarela de pago de un tercero se desconecta, los interruptores de circuito (circuit breakers) de NEXORA se 'disparan' instantáneamente después de un umbral configurado de fallas. Esto evita físicamente que su aplicación envíe miles de solicitudes condenadas al fracaso, dando tiempo al servicio externo para que se recupere mientras su aplicación falla de forma rápida (fail fast).",
      circuitTitle: "Interruptores de Circuito Automatizados (Circuit Breakers)",
      configTitle: "Configuración Dinámica de Políticas",
      degradationContent:
        "Cuando falla una dependencia externa, el sistema no colapsa, sino que se degrada de forma elegante (graceful degradation). Si la API de tarifas de envío en vivo es inalcanzable, NEXORA sirve automáticamente las últimas tarifas conocidas almacenadas en caché, asegurando que los flujos de pago no se interrumpan.",
      degradationTitle: "Degradación Elegante",
      description:
        "Tolerancia a fallos de grado militar mediante el uso de canalizaciones de reintento inteligentes, interruptores de circuito automatizados y estrategias elegantes de respaldo (fallback).",
      healthContent:
        "NEXORA no espera a que un usuario reporte un error. El sistema ejecuta continuamente comprobaciones de estado proactivas (health checks) contra bases de datos, cachés y API de terceros. Si se detecta degradación, intenta automáticamente una solución o alerta a DevOps de inmediato.",
      healthTitle: "Telemetría de Estado Proactiva",
      intro:
        "En un entorno empresarial distribuido, los fallos de red no son una posibilidad; son una certeza matemática. NEXORA está diseñado para sobrevivir a interrupciones externas catastróficas sin comprometer la experiencia central del usuario.",
      retryTitle: "Retroceso Exponencial con Fluctuación (Jittered)",
      tip: "Consejo Arquitectónico: Nunca escriba bloques try/catch estándar para llamadas de red. Utilice siempre los interceptores HTTP centralizados de Polly inyectados en toda la plataforma.",
      title: "Arquitectura de Resiliencia Defensiva",
    },
    observabilityMonitoring: {
      alertingContent:
        "Los paneles visuales no significan nada si nadie está mirando. Configure umbrales de referencia estrictos (por ejemplo, si los errores 500 aumentan, o si la CPU de la base de datos supera el 80%) y active automáticamente protocolos de respuesta a incidentes en Slack o PagerDuty.",
      alertingTitle: "Alertas Basadas en Umbrales",
      cacheMetrics: "Eficacia de Caché de Redis",
      cacheMetricsDesc:
        "Supervise de forma continua la fragmentación de la memoria, las proporciones de aciertos/errores (hit/miss) y las métricas de expulsión para ajustar el rendimiento.",
      dbMetrics: "Agotamiento del Grupo (Pool) de la Base de Datos",
      dbMetricsDesc:
        "Haga un seguimiento de las conexiones activas, las ejecuciones lentas de consultas y los tiempos de compilación de comandos directamente desde EF Core.",
      description:
        "Registro estructurado forense, sondas de salud con cero tiempo de inactividad, métricas de Prometheus y rastreo distribuido de OpenTelemetry.",
      healthContent:
        "Sondas de vitalidad (liveness) y disponibilidad (readiness) nativas de Kubernetes listas para usar. La API autoinforma de manera continua el estado operativo de la base de datos SQL, la memoria caché de Redis y las dependencias externas. Si un nodo falla, el orquestador lo retira instantáneamente de la rotación del equilibrador de carga.",
      healthTitle: "Sondas Nativas de Kubernetes",
      intro:
        "No se puede administrar lo que no se puede medir. NEXORA integra un stack de observabilidad de élite, proporcionando a los equipos de SRE y DevSecOps información forense y en tiempo real sobre el comportamiento distribuido de la plataforma.",
      loggingContent:
        "Los registros de texto tradicionales son inútiles a gran escala. NEXORA utiliza Serilog para generar registros de eventos JSON profundamente estructurados, enriqueciéndolos automáticamente con ID de correlación, Contextos de Inquilino y Nombres de Máquina para consultas inmediatas en Datadog o ELK.",
      loggingTitle: "Registro Forense Estructurado",
      metricsIntro:
        "Al integrar protocolos estándar de OpenTelemetry, NEXORA expone miles de métricas internas de la plataforma directamente a sus paneles de control existentes de Prometheus y Grafana.",
      metricsTitle: "Integración con OpenTelemetry",
      requestMetrics: "Rendimiento de Peticiones a la API",
      requestMetricsDesc:
        "Supervise los percentiles de latencia (p95, p99), los tamaños de carga útil y las duraciones precisas de ejecución por endpoint.",
      tip: "Consejo Ejecutivo: Implemente el rastreo distribuido para rastrear el recorrido de una sola solicitud de usuario a la perfección en todos los microservicios implementados.",
      title: "Observabilidad y Telemetría",
      tracingContent:
        "En un despliegue de microservicios, un solo clic podría atravesar cinco servicios aislados. El rastreo distribuido inyecta y propaga las ID de correlación a través de los encabezados HTTP, lo que le permite mapear visualmente recorridos de solicitudes complejos e identificar instantáneamente el servicio con cuello de botella.",
      tracingTitle: "Rastreo Distribuido entre Servicios",
      userMetrics: "Velocidad de Autenticación",
      userMetricsDesc:
        "Realice un seguimiento de los inicios de sesión exitosos, los intentos de fuerza bruta y la actividad específica de los inquilinos en tiempo real.",
    },
    testingStrategy: {
      ci1Content:
        "Aislamiento absoluto del entorno de ejecución. Con cada Pull Request, la canalización de CI (Integración Continua) restaura de forma determinista las cadenas de herramientas de los compiladores dentro de un contenedor Linux herméticamente sellado y estéril, asegurando que las excusas de 'funciona en mi máquina' se erradiquen matemáticamente.",
      ci1Title: "1. Inicialización de Entorno Estéril",
      ci2Content:
        "Ejecute el conjunto xUnit increíblemente rápido utilizando repositorios simulados (mocked) de forma inteligente. Esto garantiza que la lógica empresarial CQRS pura de la capa de Aplicación sea analizada y certificada en milisegundos sin establecer una conexión física a la base de datos.",
      ci2Title: "2. Validación Lógica Pura",
      ci3Content:
        "Inyecte bases de datos Docker efímeras utilizando Testcontainers. Esto garantiza que las proyecciones LINQ de EF Core, los filtros de consulta globales y las migraciones físicas de bases de datos se ejecuten sin problemas contra motores SQL reales antes de que se autodestruyan.",
      ci3Title: "3. Telemetría de Integración Efímera",
      ci4Content:
        "Active clústeres masivos de navegadores Playwright. Los trabajadores de Chromium (headless - sin interfaz gráfica) abusan implacablemente de la interfaz compilada de Next.js, interactuando agresivamente con cada componente de React para certificar de forma definitiva el viaje (journey) del usuario de extremo a extremo.",
      ci4Title: "4. Automatización Cruzada entre Navegadores",
      ciContent:
        "Probar sin una automatización absoluta es una responsabilidad (liability). El repositorio incluido viene de forma nativa con una canalización masivamente paralelizada de GitHub Actions / GitLab CI. Esta levanta activamente una barricada en la rama `main`, rechazando físicamente cualquier código que viole los límites del dominio, falle las aserciones matemáticas o desencadene una regresión.",
      ciTitle: "Canalizaciones Continuas de Seguridad e Integridad",
      description:
        "Un análisis profundo de la pirámide de pruebas de NEXORA: Aserciones unitarias CQRS ultrarrápidas, integraciones efímeras de bases de datos Docker y automatización de interfaz de usuario (UI) implacable con Playwright.",
      e2eContent:
        "Las Pruebas de Aceptación del Usuario (UAT) no deben depender del error humano. Integramos Playwright para poner en marcha clústeres de ejecución Chromium 'headless'. Estos clústeres simulan interacciones de usuario masivas y altamente complejas: ejecutan flujos completos de inducción de múltiples inquilinos, validan el estado de los componentes de React y garantizan que la interfaz de usuario se mantenga perfectamente resistente en condiciones agresivas y caóticas antes de que el equipo de control de calidad (QA) manual la toque.",
      e2eTitle: "Automatización de Navegador (E2E) Implacable",
      integrationContent:
        "Simular (Mocking) extensamente la base de datos conduce a falsos positivos peligrosos. NEXORA implementa Testcontainers para aprovisionar, ejecutar y destruir dinámicamente instancias físicas reales de PostgreSQL y Redis específicamente para cada conjunto de pruebas. Esto garantiza que sus esquemas de EF Core se prueben en un entorno de infraestructura verdadera en lugar de simulaciones en memoria frágiles.",
      integrationTitle: "Pruebas de Infraestructura Efímera",
      intro:
        "Un error empresarial en cascada cuesta cientos de miles de dólares en tiempo de inactividad sistémico. NEXORA impone una estrategia de pruebas despiadada y matemáticamente hermética. Desde pruebas lógicas de Arquitectura Limpia aisladas hasta automatización de navegadores destructiva, cada byte de código se analiza y certifica agresivamente antes de fusionarse (merge).",
      pyramidTitle: "La Pirámide Estratificada de Certificación de Código",
      pyramidLvl: "Estrato de Certificación",
      pyramidTech: "Motor de Ejecución",
      pyramidScope: "Alcance de Validación",
      pyrE2E: "Simulación de Extremo a Extremo (E2E)",
      pyrE2ETech: "Playwright / Trabajadores de Chromium",
      pyrE2EScope: "Validación Viaje Completo (Desde UI hasta DB)",
      pyrInt: "Integración Efímera",
      pyrIntTech: "WebApplicationFactory + Testcontainers",
      pyrIntScope: "Endpoints API y SQL Físico",
      pyrUnit: "Lógica de Negocio Pura",
      pyrUnitTech: "xUnit + Moq + FluentAssertions",
      pyrUnitScope: "Dominio + Capas de Aplicación",
      pyrStatic: "Análisis de Código Estático",
      pyrStaticTech: "TypeScript + ESLint + Roslyn",
      pyrStaticScope: "Sintaxis, Reglas y Tipos",
      summaryTitle: "Certeza Matemática en las Pruebas",
      tip: "Directiva Arquitectónica: No apunte a métricas de vanidad. Aplique una línea base absoluta de cobertura del 100% para las Entidades de Dominio principales y los Manejadores CQRS, utilizando clústeres de UI Playwright para cubrir la superficie de Presentación.",
      title: "Resiliencia y Pruebas Automatizadas",
      unitContent:
        "Al adherirse rigurosamente a los principios de Arquitectura Limpia, la lógica comercial de NEXORA permanece físicamente aislada de los contextos HTTP y esquemas SQL. Su equipo de ingeniería puede ejecutar instantáneamente miles de conjuntos de pruebas xUnit contra Manejadores (Handlers) principales y Entidades de Dominio en solo milisegundos, maximizando la velocidad del desarrollador y la confianza en la implementación.",
      unitTitle: "Ejecución Unitaria Aislada Ultrarrápida",
      lstIntI1: "WebApplicationFactory para pruebas de canalización HTTP realistas",
      lstIntI2: "TestContainers para instancias de bases de datos desechables",
      lstIntI3: "Siembra (seeding) de datos de prueba y limpieza automáticas",
      lstIntI4: "Ejecución de pruebas en paralelo con bases de datos aisladas",
      lstIntI5: "Simulación de autenticación con tokens JWT de prueba",
      tblSumHeader1: "Tipo de Prueba",
      tblSumHeader2: "Framework",
      tblSumHeader3: "Objetivo de Cobertura",
      tblSumHeader4: "Frecuencia de Ejecución",
      tblSumR1C1: "Unitaria (Backend)",
      tblSumR1C2: "xUnit + FluentAssertions",
      tblSumR1C3: "Capas Dominio + Aplicación",
      tblSumR1C4: "Cada commit",
      tblSumR2C1: "Unitaria (Frontend)",
      tblSumR2C2: "Vitest + Testing Library",
      tblSumR2C3: "ViewModels + utilidades",
      tblSumR2C4: "Cada commit",
      tblSumR3C1: "Integración",
      tblSumR3C2: "WebApplicationFactory",
      tblSumR3C3: "Endpoints API + base de datos",
      tblSumR3C4: "Fusiones de PRs (Merges)",
      tblSumR4C1: "E2E",
      tblSumR4C2: "Playwright",
      tblSumR4C3: "Flujos de usuario críticos",
      tblSumR4C4: "Nocturno / pre-release",
      tblSumR5C1: "Análisis Estático",
      tblSumR5C2: "ESLint + TypeScript + Roslyn",
      tblSumR5C3: "100% de la base de código",
      tblSumR5C4: "Cada vez que se guarda",
      tblSumR6C1: "Rendimiento",
      tblSumR6C2: "k6 / Artillery",
      tblSumR6C3: "Pruebas de carga a endpoints",
      tblSumR6C4: "Pre-release",
    },
    storageBackends: {
      configTitle: "Configuración Dinámica de Proveedores",
      description:
        "Matrices de almacenamiento de archivos binarios abstractas e hiperescalables que soportan a la perfección sistemas locales (Local Disk), AWS S3, Azure Blob y backends MinIO.",
      featuresTitle: "Características del Subsistema de Almacenamiento",
      handlingTitle: "Transmisión Segura de Archivos",
      imageProcessing: "Optimización de Imágenes al Vuelo (On-The-Fly)",
      imageProcessingDesc:
        "Comprima, redimensione y convierta automáticamente las imágenes cargadas a formatos WebP modernos.",
      intro:
        "Las aplicaciones empresariales generan terabytes de datos binarios. NEXORA abstrae por completo la ubicación de almacenamiento físico. Puede comenzar en un disco local durante la incubación y migrar a buckets globales de AWS S3 en producción a través de una sola cadena de configuración, sin reescribir un solo módulo.",
      mig1Content:
        "Desarrolle a una velocidad vertiginosa utilizando el sistema de archivos local.",
      mig1Title: "1. Desarrollo Local",
      mig2Content:
        "Despliegue a la perfección en entornos de preproducción (staging) utilizando contenedores MinIO open-source.",
      mig2Title: "2. Infraestructura de Preproducción (Staging)",
      mig3Content: "Escale de forma infinita en producción utilizando AWS S3 o Azure Blob Storage.",
      mig3Title: "3. Escala Infinita en Producción",
      migrationContent:
        "La interfaz `IStorageService` desacopla absolutamente su lógica de negocio del proveedor de la nube. Cambiar de proveedor es estrictamente una operación de configuración de infraestructura, lo que lo aísla por completo del 'vendor lock-in'.",
      migrationTitle: "Independencia Absoluta de Proveedores",
      pluggable: "Agnosticismo de Proveedores",
      pluggableDesc:
        "Cambie los paradigmas de almacenamiento de forma transparente a través de abstracciones de interfaz estrictamente estandarizadas.",
      providersIntro:
        "La plataforma inyecta dinámicamente el proveedor de almacenamiento adecuado mediante la Inyección de Dependencias según las variables de entorno.",
      providersTitle: "Backends de Almacenamiento Soportados",
      resumableDownload: "Subidas Multiparte (Multi-Part Uploads)",
      resumableDownloadDesc:
        "Transmita de manera confiable archivos masivos a escala de gigabytes sin bloquear los nodos de la API ni agotar la memoria.",
      tenantIsolation: "Aislamiento Criptográfico de Rutas",
      tenantIsolationDesc:
        "Los archivos se agrupan (bucketed) físicamente mediante el identificador `[TenantId]`, lo que garantiza una seguridad de datos masiva.",
      title: "Infraestructura de Almacenamiento Abstraída",
    },
  },
};

/**
 * Docs page locale — ES
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const es = {
  tutorials: {
    addModule: {
      title: "Agregar un Módulo Frontend",
      description:
        "Paso a paso para integrar un nuevo Módulo Frontend con patrón SOLID View/ViewModel.",
      intro:
        "Este tutorial garantiza que evites el código espagueti guiándote en la construcción exacta validada por las reglas arquitectónicas de SCRIPE.",
      prerequisitesTitle: "Requisitos Previos",
      stepsTitle: "Guía Paso a Paso",
      step1Title: "1. Crear Estructura",
      step1Desc: "Creación de carpetas Domain, Presentation, Data.",
      step2Title: "2. Definir la Entidad",
      step2Desc: "Tipos de TypeScript fuertemente acoplados a reglas de negocio Zod.",
      step3Title: "3. Crear el Repositorio",
      step3Desc: "Promesas asincrónicas y capturas de excepciones en la capa de Datos.",
      step4Title: "4. Establecer Inyección de Dependencias",
      step4Desc: "Declarar tu proveedor para el contenedor de servicios de React.",
      step5Title: "5. Construir ViewModel",
      step5Desc: "Enlazar CRUD genérico al contexto local y prepararlo para la Vista.",
      step6Title: "6. Crear Vista Pura (View)",
      step6Desc:
        "Componente React tonto que solo pinta lo que ViewModel demanda. (Aprox 60 líneas).",
      step7Title: "7. Enrutador y Navegación",
      step7Desc:
        "Poner a disposición el page.tsx dentro del layout y conectarlo a la barra de menú.",
      structureTitle: "Estructura Base",
      entityTitle: "Entidad Zod de Dominio",
      repoTitle: "Capa Repositorio",
      diTitle: "Contenedor de Inyección",
      viewModelTitle: "Hook de ViewModel",
      viewTitle: "Componente Vista",
      routeTitle: "Entrada de Ruta y Red",
      checklist:
        "Antes de lanzar tu Pull Request comprueba la regla de separación absoluta y traducción internacional.",
    },
    addBackendModule: {
      title: "Agregar un Módulo Backend",
      description:
        "El flujo de datos completo a través de Arquitectura Limpia, conectando el patrón CQRS.",
      intro:
        "Cubrimos cómo exponer datos de C# fuertemente seguros y auditados en una API lista para producción.",
      prerequisitesTitle: "Requisitos Previos",
      stepsTitle: "Guía Paso a Paso",
      step1Title: "1. Crear Estructura",
      step1Desc:
        "Establecer librerías de clase separando Dominio, Capa de Aplicación e Infraestructura.",
      step2Title: "2. Establecer Entidad (Domain)",
      step2Desc: "Configurar modelo y validar requerimientos heredados desde AuditableEntity.",
      step3Title: "3. Comandos de Escritura",
      step3Desc:
        "Manejadores SCRIPE mediator enfocados únicamente a crear, mutar o destruir registros.",
      step4Title: "4. Consultas (Queries)",
      step4Desc: "Lecturas ultrarrápidas con uso intensivo de mapeo y proyecciones No-Tracking.",
      step5Title: "5. Capa Repositorio",
      step5Desc: "Implementar abstracciones EF Core para el control del contexto.",
      step6Title: "6. Modificar Inyección de Dependencias",
      step6Desc:
        "Avisarle al núcleo de la aplicación de las clases implementadas y los Behaviors requeridos.",
      step7Title: "7. Exponer Controlador API",
      step7Desc: "Decoradores de Autorización, Rutas REST y documentación XML de Swagger.",
      step8Title: "8. Compilar el Migrations",
      step8Desc: "Integración final al DbContext y creación en físico de las tablas SQL.",
      structureTitle: "Estructura Base de C#",
      entityTitle: "Configuraciones Fluentes de Entidad",
      commandTitle: "Aislar Funciones CQRS",
      diTitle: "Cableado de Dependencia",
      controllerTitle: "Diseño de la Interfaz REST",
      registerTitle: "Modificación de Compilación General",
      migrationNote:
        "Siempre realizar el test 'scripe db update -m Inventory' y 'scripe db add-migration AddYourEntity -m Inventory' localmente antes del commit principal a la rama.",
    },
    ujGettingStarted: {
      title: "Configuración del Desarrollador a Incorporación Empresarial",
      description:
        "Guía completa desde el uso de SCRIPE CLI y herramientas de desarrollo hasta la configuración del primer inquilino y marca corporativa.",
      intro:
        "Bienvenido al viaje de desarrollo a producción de SCRIPE. Este tutorial le guía en la configuración local, inspección de OpenAPI y creación de su primer inquilino.",
      infoTitle: "Pila de Desarrollo Empresarial",
      infoContent:
        "Todos los servicios de SCRIPE cuentan con aislamiento multi-inquilino estricto, autorización zero-trust y auditoría inmutable.",
      step1Title: "Paso 1: CLI de Desarrollador e Inicio Local",
      step1Desc:
        "Inicialice infraestructura local con Docker, cargue datos de prueba y arranque servicios frontend y backend.",
      step2Title: "Paso 2: Swagger, API Playground y Herramientas CLI",
      step2Desc:
        "Aproveche las utilidades de desarrollo que incluyen Swagger, esquemas OpenAPI y sondas de salud.",
      toolCli: "CLI para Desarrolladores",
      toolCliDesc:
        "Herramienta de línea de comandos para migraciones, datos de prueba e inspección de inquilinos.",
      toolSwagger: "Interfaz Swagger UI",
      toolSwaggerDesc: "Documentación interactiva OpenAPI 3.0 para todos los endpoints REST.",
      toolHealth: "Sondas de Salud",
      toolHealthDesc: "Verificaciones exhaustivas de estado para PostgreSQL, Redis y RabbitMQ.",
      step3Title: "Paso 3: Primer Acceso Super-Admin y MFA",
      step3Desc:
        "Inicie sesión con credenciales por defecto y configure la autenticación multifactor obligatoria.",
      mfaNoticeTitle: "Requisito de Seguridad",
      mfaNoticeContent:
        "Las cuentas de superadministrador requieren registro TOTP antes de acceder a la configuración del inquilino.",
      stepEditionsTitle: "Requisito Previo: Crear Ediciones Comerciales y Matriz de Funciones",
      stepEditionsDesc:
        "Antes de aprovisionar cualquier inquilino, el módulo de Derechos requiere al menos una definición de Edición. Una Edición establece los flags de funciones contractuales, límites de cuotas y precios de facturación. Un inquilino no puede existir sin una referencia de Edición.",
      step4Title: "Paso 4: Aprovisionar Organización e Inquilino",
      step4Desc:
        "Cree su inquilino raíz, configure rutas slug, dominios personalizados y límites de aislamiento.",
      step5Title: "Paso 5: Temas, Marca del Portal y Creador de Login",
      step5Desc:
        "Aplique logotipos corporativos, paletas de colores y personalice las pantallas de inicio de sesión.",

      stepOrgCoreTitle: "Paso 5: Establecimiento de la Jerarquía Organizacional de 5 Niveles",
      stepOrgCoreDesc:
        "Estructure la gobernanza operativa del inquilino en Organización, Unidades de Negocio, Departamentos, Centros de Costos y Equipos mediante el módulo Organization Core.",
      step6Title: "Paso 6: Identidad Visual y Personalización de Inicio de Sesión",
      step6Desc:
        "Aplique logotipos corporativos, tokens de color personalizados y publique diseños de inicio de sesión con el generador de temas integrado.",
    },
    ujVenueBooking: {
      title: "Jerarquía de Instalaciones y Reservas Concurrentes",
      description:
        "Viaje integral configurando instalaciones deportivas, recursos reservables, horarios operativos y bloqueos en 2 fases.",
      intro:
        "Aprenda a configurar complejos multisede, gestionar recursos reservables, definir ventanas de mantenimiento y procesar reservas masivas.",
      infoTitle: "Control de Concurrencia",
      infoContent:
        "El motor de bloqueo en dos fases de SCRIPE previene reservas duplicadas mediante bloqueos mutex distribuidos en Redis.",
      step1Title: "Paso 1: Estructuración de Sedes Complejas",
      step1Desc:
        "Defina recintos geográficos, edificios y zonas deportivas con coordenadas y etiquetas de servicios.",
      step2Title: "Paso 2: Creación de Recursos Reservables",
      step2Desc:
        "Configure canchas, pistas y equipamiento como recursos atómicos o compuestos con límites de aforo.",
      step3Title: "Paso 3: Horarios Operativos y Mantenimientos",
      step3Desc:
        "Establezca horarios semanales, excepciones festivas e intervalos de cierre por mantenimiento.",
      step4Title: "Paso 4: Motor de Bloqueo Concurrente en 2 Fases",
      step4Desc:
        "Adquiera bloqueos atómicos de 15 minutos durante el checkout con expiración automática por tiempo.",
      step5Title: "Paso 5: Calendario Operativo y Reserva 360",
      step5Desc:
        "Gestione la cuadrícula de despacho, audite ciclos de vida de reservas y aplique modificaciones operativas.",
    },
    ujPricingFinance: {
      title: "Tarificación Dinámica y Contabilidad por Partida Doble",
      description:
        "Guía para configurar matrices de tarifas, recargos por horas punta, cotizaciones criptográficas y liquidaciones de libro mayor.",
      intro:
        "Vincule su catálogo a algoritmos de precios dinámicos, emita cotizaciones a prueba de manipulaciones y liquide cuentas de forma equilibrada.",
      infoTitle: "Integridad Financiera",
      infoContent:
        "El balance invariable débito-crédito asegura total conformidad y auditoría en todas las transacciones financieras.",
      step1Title: "Paso 1: Creación de Listas de Tarifas y Multidivisa",
      step1Desc:
        "Defina precios base por hora, libros de divisas y estructuras de niveles para espacios y servicios.",
      step2Title: "Paso 2: Reglas Dinámicas y Horas Punta",
      step2Desc:
        "Aplique recargos y descuentos según franja horaria, nivel del cliente y anticipación de reserva.",
      step3Title: "Paso 3: Cotizaciones Criptográficas Seguras",
      step3Desc:
        "Genere cotizaciones firmadas con HMAC-SHA256 que bloquean el precio durante el pago evitando fraudes.",
      step4Title: "Paso 4: Libro Mayor y Plan de Cuentas",
      step4Desc:
        "Registre asientos contables de débito y crédito en cuentas segregadas con balance automático.",
      step5Title: "Paso 5: Facturación, Pagos y Liquidaciones Partidas",
      step5Desc:
        "Genere facturas fiscales reglamentarias, cobre pagos y ejecute transferencias divididas a socios.",
    },
    ujWorkforceCrm: {
      title: "Gestión de Personal y Visión Cliente 360",
      description:
        "Guía para gestionar competencias del personal, turnos rotativos, grafos de relaciones y desduplicación de clientes.",
      intro:
        "Domine la asignación de recursos humanos y la gestión integral de clientes en todas sus sucursales.",
      infoTitle: "Identidad Polimórfica",
      infoContent:
        "La arquitectura polimórfica permite a una entidad actuar a la vez como cliente, entrenador o contacto corporativo.",
      step1Title: "Paso 1: Directorio de Personal y Competencias",
      step1Desc:
        "Registre empleados, supervise certificaciones, asigne roles y valide credenciales técnicas.",
      step2Title: "Paso 2: Planificación de Turnos y Disponibilidad",
      step2Desc:
        "Cree plantillas de turnos, gestione permisos y evite sobrecargas de horas de trabajo.",
      step3Title: "Paso 3: Cliente 360 y Entidades Polimórficas",
      step3Desc:
        "Consolide perfiles personales, empresas, registros de contacto e historial de reservas en una sola vista.",
      step4Title: "Paso 4: Grafo de Relaciones y Cuentas B2B",
      step4Desc:
        "Modele relaciones familiares, tutores legales y cuentas corporativas de empresas patrocinadoras.",
      step5Title: "Paso 5: Desduplicación Automática y Fusión",
      step5Desc:
        "Detecte registros duplicados mediante coincidencia fonética difusa y fusiónelos de forma segura sin pérdida de datos.",
    },
    ujCustomFieldsPlugins: {
      title: "Extensión de SCRIPE: Campos Personalizados y Plugins",
      description:
        "Ampliación de esquemas con campos EAV personalizados e instalación de plugins aislados del marketplace.",
      intro:
        "Personalice su plataforma sin modificar código backend utilizando campos EAV e instalando extensiones del marketplace.",
      infoTitle: "Extensibilidad sin Interrupciones",
      infoContent:
        "Los cambios en los campos personalizados entran en vigor de inmediato en la interfaz y la API sin migraciones.",
      step1Title: "Paso 1: Grupos de Campos y Tipos de Datos",
      step1Desc:
        "Agregue campos de texto, números, fechas o listas de selección a reservas y perfiles.",
      step2Title: "Paso 2: Validación y Cifrado AES-256",
      step2Desc:
        "Configure validaciones regex, obligatoriedad y cifre campos sensibles para máxima confidencialidad.",
      step3Title: "Paso 3: Descubrimiento e Instalación de Plugins",
      step3Desc:
        "Explore el catálogo de plugins, audite permisos de seguridad e instale extensiones con un clic.",
      step4Title: "Paso 4: Integración con Webhooks y Eventos",
      step4Desc:
        "Conecte aplicaciones externas suscribiéndose a eventos en tiempo real con verificación de firma HMAC.",
    },
    ujComplianceGovernance: {
      title: "Gobernanza Empresarial, Cumplimiento y Analítica",
      description:
        "Alertas de seguridad en tiempo real, registros de auditoría inmutables, derechos GDPR y cuadros de mando BI.",
      intro:
        "Garantice cumplimiento normativo internacional, audite accesos al sistema y genere informes de inteligencia empresarial.",
      infoTitle: "Preparación Regulatoria",
      infoContent:
        "Reglas de retención automatizadas y pistas criptográficas facilitan auditorías continuas SOC2, ISO 27001 y GDPR.",
      step1Title: "Paso 1: Monitorización de Seguridad y Alertas",
      step1Desc:
        "Configure alertas ante inicios de sesión sospechosos o escaladas no autorizadas de privilegios.",
      step2Title: "Paso 2: Pistas de Auditoría Inmutables",
      step2Desc:
        "Consulte registros inalterables que registran usuario, dirección IP, fecha y diferencias de datos.",
      step3Title: "Paso 3: Tramitación de Solicitudes GDPR (DSR)",
      step3Desc:
        "Procese exportaciones de datos, revocaciones de consentimiento y solicitudes de derecho al olvido.",
      step4Title: "Paso 4: Paneles de Control BI y Métricas",
      step4Desc:
        "Visualice ocupación de pistas, velocidad de ingresos y productividad de personal en tiempo real.",
    },
  },
};

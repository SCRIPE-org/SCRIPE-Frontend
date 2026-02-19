/**
 * Spanish locale for the Documentation Portal.
 * Contains all UI strings and content translations.
 */
import type { PartialDocTranslations } from "./doc.en";

export const docEs: PartialDocTranslations = {
  // ─── Common UI ──────────────────────────────────────────────
  common: {
    search: "Buscar en la documentación...",
    searchPlaceholder: "Escribe para buscar...",
    searchShortcut: "⌘K",
    searchNoResults: "No se encontraron resultados",
    searchResultsTitle: "Resultados de búsqueda",
    copyCode: "Copiar",
    codeCopied: "¡Copiado!",
    onThisPage: "En esta página",
    relatedDocs: "Documentos relacionados",
    lastUpdated: "Última actualización",
    previous: "Anterior",
    next: "Siguiente",
    backToTop: "Volver arriba",
    expandAll: "Expandir todo",
    collapseAll: "Contraer todo",
    menu: "Menú",
    closeMenu: "Cerrar menú",
    tableOfContents: "Tabla de contenidos",
    readingTime: "{{min}} min de lectura",
    home: "Inicio",
    editPage: "Editar esta página",
    version: "Versión",
    language: "Idioma",
  },

  // ─── Info Blocks ────────────────────────────────────────────
  info: {
    note: "Nota",
    tip: "Consejo",
    warning: "Advertencia",
    danger: "Peligro",
  },

  // ─── API Table ──────────────────────────────────────────────
  api: {
    method: "Método",
    endpoint: "Endpoint",
    description: "Descripción",
    auth: "Auth",
    authRequired: "Requerida",
    noAuth: "Público",
    permission: "Permiso",
  },

  // ─── Navigation Categories ──────────────────────────────────
  nav: {
    getStarted: "Primeros pasos",
    tutorials: "Tutoriales",
    architecture: "Arquitectura",
    features: "Características",
    frontend: "Módulos Frontend",
    security: "Seguridad",
    apiReference: "Referencia API",
    infrastructure: "Infraestructura",
  },

  // ─── Get Started ────────────────────────────────────────────
  getStarted: {
    overview: {
      title: "Descripción general",
      description: "Bienvenido a la documentación de la plataforma Verified ERP.",
      hero: "Desarrolla aplicaciones empresariales más rápido",
      heroSub:
        "Una plataforma Modular Monolith lista para producción con backend .NET 10, frontend Next.js y todo lo que necesitas para crear aplicaciones empresariales escalables.",
      whatIs: "¿Qué es la plataforma Verified?",
      whatIsText:
        "Verified es una plataforma ERP de nivel empresarial construida con una arquitectura Modular Monolith. Proporciona una base probada para aplicaciones empresariales complejas con autenticación, autorización, multi-tenencia, registro de auditoría y un panel de administración completo — todo listo para usar.",
      keyFeatures: "Características principales",
      keyFeaturesText:
        "La plataforma incluye un conjunto completo de funcionalidades diseñadas para aplicaciones empresariales.",
      feature1Title: "Arquitectura Modular Monolith",
      feature1Text:
        "Clara separación de responsabilidades con módulos aislados que se pueden desarrollar y probar de forma independiente. El backend usa CQRS con MediatR, el frontend sigue el patrón SOLID View/ViewModel.",
      feature2Title: "Seguridad empresarial",
      feature2Text:
        "Control de acceso basado en roles (RBAC) con caché de permisos del lado del servidor, seguridad a nivel de campo, alcance de datos, 2FA, gestión de sesiones y registros de auditoría completos.",
      feature3Title: "Multi-tenencia",
      feature3Text:
        "Gestión de inquilinos integrada con estructuras jerárquicas, datos aislados, configuraciones por inquilino y permisos con alcance de inquilino.",
      feature4Title: "Solución Full-Stack",
      feature4Text:
        "Backend .NET 10 con EF Core, frontend Next.js 16 con TanStack Query v5, gestión de estado con Zustand y un potente motor CRUD genérico.",
      techStack: "Stack tecnológico",
      backendStack: "Backend",
      frontendStack: "Frontend",
      quickLinks: "Enlaces rápidos",
      quickLink1: "Guía de inicio rápido",
      quickLink2: "Descripción de la arquitectura",
      quickLink3: "Primer tutorial",
    },
    prerequisites: {
      title: "Requisitos previos",
      description: "Requisitos y herramientas necesarias antes de empezar.",
      intro:
        "Antes de comenzar, asegúrate de tener las siguientes herramientas instaladas en tu máquina de desarrollo.",
      required: "Herramientas requeridas",
      dotnet: ".NET 10 SDK",
      dotnetText:
        "Necesario para compilar y ejecutar el backend. Descárgalo desde el sitio oficial de .NET.",
      nodejs: "Node.js 20+ y npm",
      nodejsText: "Necesario para el frontend. Recomendamos usar la última versión LTS.",
      database: "SQL Server (o PostgreSQL/Oracle)",
      databaseText:
        "El backend soporta múltiples proveedores de bases de datos. SQL Server es el predeterminado.",
      ide: "IDE / Editor de código",
      ideText:
        "Visual Studio 2022+ o VS Code con la extensión de C# para el backend. Se recomienda VS Code para el frontend.",
      optional: "Herramientas opcionales",
      git: "Git",
      gitText: "Para control de versiones y clonar el repositorio.",
      docker: "Docker",
      dockerText: "Para ejecutar la base de datos en un contenedor (opcional pero recomendado).",
      postman: "Postman / Thunder Client",
      postmanText: "Para probar endpoints de la API manualmente.",
    },
    quickStart: {
      title: "Inicio rápido",
      description: "Pon la plataforma en marcha en 5 minutos.",
      intro:
        "Sigue estos pasos para clonar, configurar y ejecutar la plataforma en tu máquina local.",
      step1Title: "Clonar el repositorio",
      step1Content: "Clona el repositorio en tu máquina local usando Git.",
      step2Title: "Configurar la base de datos",
      step2Content: "Actualiza la cadena de conexión en el archivo de configuración del backend.",
      step3Title: "Ejecutar migraciones",
      step3Content:
        "Aplica las migraciones del esquema de base de datos para crear todas las tablas.",
      step4Title: "Iniciar el backend",
      step4Content: "Ejecuta el servidor API del backend.",
      step5Title: "Iniciar el frontend",
      step5Content: "Instala las dependencias e inicia el servidor de desarrollo del frontend.",
      step6Title: "Acceder a la aplicación",
      step6Content:
        "Abre tu navegador y navega a la aplicación. Usa las credenciales de administrador predeterminadas para iniciar sesión.",
      defaultCredentials: "Credenciales predeterminadas",
      successTip:
        "Si todo está configurado correctamente, deberías ver el panel de administración. El administrador predeterminado tiene permisos completos.",
    },
    projectStructure: {
      title: "Estructura del proyecto",
      description: "Comprende la estructura de directorios de ambos proyectos.",
      intro:
        "La plataforma Verified está organizada como un monorepo con dos proyectos principales. Cada uno sigue una arquitectura modular.",
      backendTitle: "Estructura del backend",
      backendText: "El backend sigue una arquitectura Modular Monolith con patrón CQRS.",
      frontendTitle: "Estructura del frontend",
      frontendText: "El frontend sigue una arquitectura modular con patrón SOLID View/ViewModel.",
      keyDirectories: "Directorios clave explicados",
    },
  },

  // ─── Tutorials ──────────────────────────────────────────────
  tutorials: {
    firstBackendModule: {
      title: "Crear tu primer módulo (Backend)",
      description: "Guía paso a paso para crear un nuevo módulo backend con CQRS.",
    },
    firstFrontendModule: {
      title: "Crear tu primer módulo (Frontend)",
      description: "Construye un módulo frontend siguiendo el patrón SOLID View/ViewModel.",
    },
    addEntity: {
      title: "Agregar una entidad de dominio",
      description: "Crea una nueva entidad de dominio con validación y soporte de auditoría.",
    },
    addCommand: {
      title: "Agregar un Command (CQRS)",
      description: "Crea un command con handler, validación y behaviors de pipeline.",
    },
    addQuery: {
      title: "Agregar una Query (CQRS)",
      description: "Crea una query con handler y mapeo de respuesta.",
    },
    addPermissions: {
      title: "Agregar permisos",
      description: "Insertar permisos y proteger endpoints con RBAC.",
    },
    addApiEndpoint: {
      title: "Agregar un endpoint API",
      description: "Crea un endpoint de controlador con documentación Swagger y autenticación.",
    },
    apiIntegration: {
      title: "Integración API del frontend",
      description: "Conecta tu módulo frontend con la API del backend.",
    },
  },

  // ─── Architecture ───────────────────────────────────────────
  architecture: {
    overview: {
      title: "Descripción de la arquitectura",
      description: "Vista de alto nivel de la arquitectura de la plataforma.",
    },
    backend: {
      title: "Arquitectura del backend",
      description: ".NET 10 Modular Monolith con CQRS y DDD.",
    },
    frontend: {
      title: "Arquitectura del frontend",
      description: "Next.js monolito modular con patrones SOLID.",
    },
    cqrs: {
      title: "Patrón CQRS",
      description: "Implementación de Command Query Responsibility Segregation.",
    },
    modules: {
      title: "Sistema de módulos",
      description: "Cómo se estructuran y aíslan los módulos.",
    },
    solidPattern: {
      title: "SOLID View/ViewModel",
      description: "El patrón SOLID para vistas y view models del frontend.",
    },
    stateManagement: {
      title: "Gestión de estado",
      description: "TanStack Query para estado del servidor, Zustand para estado de UI.",
    },
    dataFlow: {
      title: "Flujo de datos",
      description: "Cómo fluyen los datos desde la UI hasta la base de datos y viceversa.",
    },
  },

  // ─── Features ───────────────────────────────────────────────
  features: {
    authentication: {
      title: "Autenticación",
      description: "Inicio de sesión de admin y usuario, tokens JWT, flujo de actualización.",
      overview: "Descripción general",
      overviewText:
        "El sistema de autenticación proporciona inicio de sesión seguro para administradores y usuarios regulares. Usa tokens de acceso JWT con caché de permisos del lado del servidor para autorización.",
      flowTitle: "Flujo de autenticación",
      loginFlow: "Flujo de inicio de sesión",
      loginFlowText:
        "Cuando un administrador inicia sesión, el sistema valida las credenciales, verifica 2FA, genera tokens JWT y cachea los permisos del lado del servidor.",
      endpoints: "Endpoints de la API",
      backendImpl: "Implementación del backend",
      frontendImpl: "Integración del frontend",
      securityFeatures: "Características de seguridad",
      tipSecurity:
        "Los permisos se cachean del lado del servidor (no en el JWT). Los cambios de permisos surten efecto inmediatamente sin necesidad de actualizar el token.",
      accountLockout: "Bloqueo de cuenta",
      accountLockoutText:
        "Después de 5 intentos fallidos de inicio de sesión, la cuenta se bloquea durante 15 minutos. Esto previene ataques de fuerza bruta.",
    },
    twoFactorAuth: {
      title: "Autenticación de dos factores",
      description: "Configuración 2FA basada en TOTP, verificación y recuperación.",
    },
    sessionManagement: {
      title: "Gestión de sesiones",
      description:
        "Seguimiento de sesiones activas, información del dispositivo y revocación de sesiones.",
    },
    profileManagement: {
      title: "Gestión de perfil",
      description: "Actualizaciones de perfil, carga de avatar, cambio de contraseña.",
    },
    adminManagement: {
      title: "Gestión de administradores",
      description: "CRUD de admin, asignación de roles, suplantación y operaciones masivas.",
    },
    roleManagement: {
      title: "Gestión de roles",
      description: "CRUD de roles con asignación de permisos y clonación.",
    },
    permissionSystem: {
      title: "Sistema de permisos",
      description: "RBAC con caché del lado del servidor y seguridad a nivel de campo.",
    },
    tenantManagement: {
      title: "Gestión de inquilinos",
      description: "CRUD multi-inquilino, jerarquía, configuración y logos.",
    },
    menuSystem: {
      title: "Sistema de menús",
      description: "Gestión dinámica de menús con reordenación y controles de visibilidad.",
    },
    dashboardAnalytics: {
      title: "Dashboard y análisis",
      description: "KPIs, gráficos, eventos de seguridad y exportación de datos.",
    },
    auditLogging: {
      title: "Registro de auditoría",
      description: "Registro de auditoría completo con pipeline de 4 fuentes.",
    },
    recycleBin: {
      title: "Papelera de reciclaje",
      description: "Visor de registros eliminados con capacidad de restauración.",
    },
    fileManagement: {
      title: "Gestión de archivos",
      description: "Carga por fragmentos, descarga reanudable, validación ETag.",
    },
    userAuthentication: {
      title: "Autenticación de usuario",
      description: "Registro de usuario, verificación de email/teléfono, OAuth.",
    },
  },

  // ─── Frontend Modules ───────────────────────────────────────
  frontend: {
    authModule: {
      title: "Módulo de autenticación",
      description: "Flujo de login, verificación 2FA, gestión de tokens y guards de ruta.",
    },
    profileModule: {
      title: "Módulo de perfil",
      description: "Perfil de admin, configuración de seguridad, sesiones y actividad.",
    },
    systemModule: {
      title: "Módulo del sistema",
      description: "Los 12 sub-módulos del sistema: admin, roles, permisos, inquilinos, etc.",
    },
    crudEngine: {
      title: "Motor CRUD",
      description: "GenericCrudView, DataTable, formularios y helpers de columnas.",
    },
  },

  // ─── Security ───────────────────────────────────────────────
  security: {
    rbac: {
      title: "RBAC y permisos",
      description: "Control de acceso basado en roles con caché del lado del servidor.",
    },
    fieldLevel: {
      title: "Seguridad a nivel de campo",
      description: "Restringir acceso a campos específicos de entidad por rol.",
    },
    idEncryption: {
      title: "Encriptación de ID",
      description: "Ofuscación de ID de entidad AES-256 para APIs públicas.",
    },
    tokens: {
      title: "Seguridad de tokens",
      description: "Estructura JWT, rotación de refresh token y revocación de tokens.",
    },
  },

  // ─── API Reference ──────────────────────────────────────────
  apiReference: {
    adminAuth: {
      title: "API de Auth de Admin",
      description: "Login, actualización, logout, 2FA, sesiones.",
    },
    userAuth: {
      title: "API de Auth de Usuario",
      description: "Registro, verificación, login, restablecimiento de contraseña, OAuth.",
    },
    adminManagement: {
      title: "API de gestión de admin",
      description: "CRUD, operaciones masivas, asignación de roles, suplantación.",
    },
    adminManagementApi: {
      title: "API de gestión de admin",
      description: "Operaciones CRUD completas para gestión de usuarios admin.",
    },
    roles: {
      title: "API de roles",
      description: "CRUD de roles y asignación de permisos.",
    },
    tenants: {
      title: "API de inquilinos",
      description: "CRUD de inquilinos, jerarquía, configuración.",
    },
    menus: {
      title: "API de menús",
      description: "CRUD de menús, reordenación, visibilidad.",
    },
    audit: {
      title: "API de auditoría",
      description: "Listado de logs de auditoría, detalle y exportación.",
    },
  },

  // ─── Infrastructure ─────────────────────────────────────────
  infrastructure: {
    database: {
      title: "Configuración de base de datos",
      description: "Configurar SQL Server, PostgreSQL u Oracle.",
    },
    multiDatabase: {
      title: "Soporte multi-base de datos",
      description: "Cambiar entre proveedores de base de datos.",
    },
    migrations: {
      title: "Migraciones",
      description: "Ejecutar y gestionar migraciones de base de datos.",
    },
    caching: {
      title: "Estrategia de caché",
      description: "Caché de permisos, caché de consultas e invalidación de caché.",
    },
  },
};

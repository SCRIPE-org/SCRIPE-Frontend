/**
 * Docs page locale — ES
 */
export const es = {
  getStarted: {
    overview: {
      architectureIntro:
        "SCRIPE opera en tres modos de despliegue controlados completamente por una sola variable de entorno. El mismo binario compilado puede ejecutarse como un monolito (todos los módulos), un microservicio (un solo módulo) o un API gateway (proxy YARP).",
      architectureTitle: "Topología de Arquitectura",
      deploymentModesIntro:
        "La variable de entorno MODULE_NAME determina qué módulos se cargan al inicio. Cuando está vacía, se registran todos los módulos (modo monolito). Cuando se establece un nombre de módulo, solo se carga ese módulo (modo microservicio). Cuando se establece en 'Gateway', se activa el proxy inverso YARP.",
      deploymentModesTitle: "Modos de Despliegue",
      description:
        "Introducción a la arquitectura, capacidades y stack tecnológico de la Plataforma Enterprise SCRIPE.",
      environmentProfilesTitle: "Perfiles de Entorno",
      envVarPrefixTip:
        "Solo se cargan las variables de entorno que comienzan con SCRIPE_. Por ejemplo, SCRIPE_ConnectionStrings__DefaultConnection anula la cadena de conexión. Los guiones bajos dobles (__) representan anidamiento en la configuración JSON.",
      featureCQRS: "CQRS + AstraFlow mediator",
      featureCQRSDesc:
        "Separación de Comandos/Consultas con un pipeline de 6 comportamientos: registro (logging), registro de flujo (stream logging), validación, feature gating (control de funciones), envío de webhooks y caché.",
      featureDeployment: "Despliegue Flexible",
      featureDeploymentDesc:
        "Despliega como monolito, microservicios o híbrido a través de una única variable de entorno MODULE_NAME.",
      featureModular: "Monolito Modular",
      featureModularDesc:
        "Módulos aislados con límites claros: desarrolla, prueba y despliega de forma independiente. Mismo binario, despliegue flexible.",
      featureMultiDB: "Base de Datos Flexible",
      featureMultiDBDesc:
        "Cambie entre SQL Server, PostgreSQL u Oracle. Ejecute todos los módulos en una sola base de datos compartida (modo Single) o asigne a cada módulo su propia base de datos (modo Multi) — controlado por una única opción de configuración.",
      featureMultiTenant: "Multitenencia (Multi-Tenancy)",
      featureMultiTenantDesc:
        "Aislamiento de inquilinos (tenants) a nivel de fila con filtros de consulta globales de EF Core. Configuraciones por inquilino, personalización de marca y alcance de datos.",
      featureSecurity: "Seguridad Enterprise",
      featureSecurityDesc:
        "Motor unificado de Control de Acceso Basado en Políticas (PBAC) que une RBAC, GBAC y ABAC. Incluye 2FA, restricciones a nivel de campo, limitación de tasa (rate limiting), gestión de sesiones y pistas de auditoría inmutables.",
      featureSSO: "SSO Empresarial y Proveedor de Identidad",
      featureSSODesc:
        "Proveedor de identidad nativo OIDC/OAuth2 que permite un verdadero inicio de sesión único en todo su ecosistema. Actúe como un IDP primario (como Keycloak) gestionando aplicaciones cliente externas sin problemas.",
      intro:
        "SCRIPE es una plataforma enterprise lista para producción, construida con una arquitectura de Monolito Modular. Proporciona todo lo necesario para crear aplicaciones de negocio escalables: autenticación, autorización, multitenencia (multi-tenancy), registros de auditoría, eventos en tiempo real y un panel de administración completo, todo listo para usar. La plataforma se ejecuta como un binario único que puede desplegarse como un monolito o descomponerse en microservicios sin cambiar el código.",
      registrationOrderWarning:
        "NO reordene los registros de servicios en Program.cs. AddCoreInfrastructure debe ir antes que los módulos (dependen de ICurrentUser), y AddCoreApplication debe ir después de los módulos (AstraFlow mediator necesita sus ensamblados).",
      serviceRegistrationIntro:
        "El orden del registro de servicios en Program.cs es arquitectónicamente significativo. Alterar el orden puede causar fallos en tiempo de ejecución. La infraestructura central debe registrarse antes que los módulos, y AstraFlow mediator necesita que se recopilen primero los marcadores de ensamblado de los módulos.",
      serviceRegistrationTitle: "Orden de Registro de Servicios",
      techStackTitle: "Stack Tecnológico",
      title: "Visión General",
    },
    prerequisites: {
      databaseIntro:
        "SCRIPE soporta tres proveedores de bases de datos de forma nativa: SQL Server, PostgreSQL y Oracle. El proveedor se configura a través de Database.Provider en appsettings.json. Además, la configuración Database.Mode controla el aislamiento de la base de datos: 'Single' coloca todas las tablas de los módulos en una base de datos compartida, mientras que 'Multi' (predeterminado) permite que cada módulo tenga su propia base de datos con cadenas de conexión separadas.",
      databaseTip:
        "Para desarrollo local, SQL Server con Docker es la configuración más rápida. Usa el archivo Docker Compose a continuación para levantar SQL Server y Redis en segundos.",
      databaseTitle: "Soporte de Bases de Datos",
      description:
        "Herramientas requeridas, configuración de la base de datos y del entorno para el desarrollo.",
      dockerNote:
        "El archivo Docker Compose configura SQL Server 2022 y Redis 7 para desarrollo local. El servicio scripe-api se construye desde el Dockerfile del backend y se conecta automáticamente a ambos servicios.",
      dockerTitle: "Inicio Rápido con Docker",
      envSetupTitle: "Configuración del Entorno",
      intro:
        "Antes de comenzar a desarrollar con SCRIPE, asegúrate de que tu máquina tenga instaladas las herramientas necesarias. Esta página cubre los requisitos exactos de versión, soporte de base de datos, configuración paso a paso y el inicio rápido con Docker.",
      requiredToolsTitle: "Herramientas Requeridas",
      step1Content:
        "Asegúrate de que todas las herramientas estén instaladas y cumplan con los requisitos mínimos de versión.",
      step1Title: "Verificar Versiones de Herramientas",
      step2Content: "Clona el monorepo con submódulos de Git para el backend y el frontend.",
      step2Title: "Clonar el Repositorio",
      step3Content:
        "Actualiza la cadena de conexión para que apunte a tu instancia de base de datos local.",
      step3Title: "Configurar Cadena de Conexión",
      step4Content:
        "Restaura los paquetes NuGet y aplica las migraciones (migrations) de Entity Framework para crear el esquema de la base de datos.",
      step4Title: "Configuración del Backend",
      step5Content:
        "Instala las dependencias de npm y crea tu archivo de configuración de entorno local.",
      step5Title: "Configuración del Frontend",
      title: "Requisitos Previos",
    },
    projectStructure: {
      allowedImports: "Importaciones Permitidas",
      backendTitle: "Estructura del Backend",
      boundaryWarning:
        "Los límites de los módulos son ley absoluta. Los módulos NO PUEDEN importar código entre sí. Si se necesita compartir código, debe moverse a @core/. Los datos entre módulos se pasan únicamente a través de parámetros de ruta (URL) o IDs compartidos.",
      description:
        "Diseño completo de directorios del monorepo SCRIPE: raíz, backend, frontend y anatomía de los módulos.",
      forbiddenImports: "Importaciones Prohibidas",
      frontendTitle: "Estructura del Frontend",
      intro:
        "SCRIPE está organizado como un monorepo de submódulos de Git con tres partes principales: el repositorio raíz, el submódulo backend y el submódulo frontend. Entender esta estructura es esencial para navegar por el código fuente.",
      moduleAnatomyIntro:
        "Cada módulo del frontend sigue una estructura idéntica. Esta consistencia facilita la navegación por cualquier módulo una vez que entiendes uno. Cada capa tiene responsabilidades estrictas y reglas de importación.",
      moduleAnatomyTitle: "Anatomía del Módulo",
      rootTitle: "Monorepo Raíz",
      title: "Estructura del Proyecto",
      toolsIntro:
        "El directorio tools/ contiene la CLI de SCRIPE y el Studio. La CLI proporciona 123 comandos para scaffolding, compilaciones, migraciones y despliegue. Studio es un panel visual para desarrolladores construido con Express (motor) y Next.js (UI).",
      toolsTitle: "Herramientas de Desarrollo",
    },
    quickStart: {
      backendRunningTip:
        "El servidor API iniciará en https://localhost:5001 por defecto. La interfaz de Swagger está disponible en /swagger en modo de desarrollo.",
      backendStep1Content: "Restaura todos los paquetes NuGet de la solución.",
      backendStep1Title: "Restaurar Dependencias",
      backendStep2Content:
        "Ejecuta las migraciones de Entity Framework para actualizar el esquema de la base de datos.",
      backendStep2Title: "Aplicar Migraciones",
      backendStep3Content: "Inicia el servidor API backend en https://localhost:5001.",
      backendStep3Title: "Ejecutar el Servidor API",
      backendTitle: "Iniciar el Backend",
      cliDevAllCmd:
        "scripe dev all — Iniciar ambos servidores simultáneamente con salida etiquetada y apertura automática del navegador.",
      cliDevBackendCmd: "scripe dev backend — Iniciar el backend .NET en modo de desarrollo.",
      cliDevFrontendCmd:
        "scripe dev frontend — Iniciar el servidor de desarrollo de Next.js con detección automática de puertos y lanzamiento del navegador.",
      cliDevIntro:
        "En lugar de iniciar manualmente los servidores del backend y frontend, utilice la CLI de SCRIPE para una experiencia de desarrollo optimizada. La CLI gestiona automáticamente la resolución de puertos, el lanzamiento del navegador y la gestión concurrente de servidores.",
      cliDevNoBrowser:
        "Agregue --no-browser a cualquier comando dev para evitar la apertura automática del navegador (útil para entornos CI/headless).",
      cliDevTitle: "Desarrollo con la CLI",
      credentialsWarning:
        "¡Cambia estas contraseñas inmediatamente en producción! Las credenciales predeterminadas se generan mediante la migración de la base de datos y solo deben usarse para desarrollo local.",
      defaultCredentialsTitle: "Credenciales por Defecto",
      description:
        "Pon a funcionar SCRIPE localmente en menos de 5 minutos con backend, frontend y validaciones.",
      frontendStep1Content:
        "Instala todas las dependencias de npm usando pnpm para una instalación más rápida y eficiente.",
      frontendStep1Title: "Instalar Dependencias",
      frontendStep2Content:
        "Crea un archivo .env.local con la URL de la API y el nombre de la app.",
      frontendStep2Title: "Configurar Entorno",
      frontendStep3Content: "Inicia el servidor de desarrollo de Next.js en http://localhost:3000.",
      frontendStep3Title: "Iniciar Servidor de Desarrollo",
      frontendTitle: "Iniciar el Frontend",
      intro:
        "Esta guía te llevará a través del inicio del servidor API del backend y del servidor de desarrollo del frontend, para luego verificar que todo funcione con pruebas de API.",
      prodBuildAllCmd:
        "scripe build all — Compilar backend y frontend para el despliegue en producción.",
      prodNoBrowser:
        "Agregue --no-browser para evitar la apertura automática del navegador en modo producción.",
      prodStartAllCmd:
        "scripe start all — Iniciar backend (modo Release) y frontend (next start) simultáneamente. Abre automáticamente el navegador.",
      prodStartBackendCmd:
        "scripe start backend — Iniciar solo el servidor backend de producción (dotnet run --configuration Release).",
      prodStartFrontendCmd:
        "scripe start frontend — Iniciar solo el servidor frontend de producción.",
      prodStartPublishedCmd:
        "scripe start all --published — Ejecutar desde DLL pre-compilada para el inicio más rápido. Requiere scripe build backend primero.",
      productionIntro:
        "Para el despliegue en producción, utilice el comando scripe start que ejecuta servidores en modo release/producción con rendimiento optimizado.",
      productionTitle: "Servidores de Producción",
      scripeCliIntro:
        "La herramienta CLI de SCRIPE (scripe-cli) proporciona comandos de andamiaje (scaffolding) para generar módulos, entidades, comandos y consultas, siguiendo automáticamente las convenciones de la arquitectura.",
      scripeCliTitle: "CLI de SCRIPE",
      studioBuildCmd:
        "scripe studio build — Pre-compilar el motor del Studio (TypeScript) y la UI (Next.js) sin iniciar.",
      studioDevCmd:
        "scripe studio --dev — Lanzar Studio en modo desarrollo con recarga en caliente. Abre automáticamente el navegador en el puerto 4200.",
      studioIntro:
        "SCRIPE Studio es un panel de control visual para desarrolladores que proporciona una interfaz de usuario en tiempo real para gestionar todo su flujo de trabajo de desarrollo. Incluye gestión de módulos, generadores de código, controles de servidores de desarrollo, operaciones de base de datos, acceso a terminal y más.",
      studioPortCmd:
        "Use --port y --engine-port para personalizar los puertos de la UI (predeterminado: 4200) y del motor (predeterminado: 4201).",
      studioProdCmd:
        "scripe studio — Lanzar Studio en modo producción. Compila el motor y la UI si aún no están compilados.",
      studioTitle: "SCRIPE Studio",
      title: "Inicio Rápido",
      verifyInstallIntro:
        "Una vez que ambos servidores estén funcionando, verifica la instalación mediante estas comprobaciones.",
      verifyInstallTitle: "Verificar Instalación",
    },
  },
};

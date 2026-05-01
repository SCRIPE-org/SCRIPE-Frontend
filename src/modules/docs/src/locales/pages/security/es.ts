/**
 * Docs security — ES
 * Auto-filled 25 keys from EN.
 */
export const es = {
  security: {
    overview: {
      title: "Visión General de la Seguridad",
      description:
        "Estrategia de defensa en 5 capas, características de seguridad, configuración CORS, limitación de tasa y políticas de contraseñas.",
      intro:
        "NEXORA implementa una defensa en profundidad con cinco capas: protección de red, autenticación, autorización, aislamiento de datos y registros de auditoría.",
      layersTitle: "Capas de Defensa de Seguridad",
      featuresTitle: "Características de Seguridad",
      featureJwt: "Autenticación JWT",
      featureJwtDesc: "Tokens de corta duración con rotación automática, firmados por HMAC-SHA256.",
      feature2fa: "Autenticación 2FA",
      feature2faDesc:
        "Doble factor obligatorio por inquilino basado en aplicaciones TOTP (Google Authenticator).",
      featureRbac: "Permisos RBAC",
      featureRbacDesc:
        "Motor de control (PBAC/ABAC/RBAC) almacenado dinámicamente en el servidor en cada token refresh.",
      featureRateLimit: "Limitación de Tasa (Rate Limiting)",
      featureRateLimitDesc:
        "4 niveles: DDoS, IP individual, Endpoint individual, y rutas de inicio de sesión.",
      featureAudit: "Auditoría Continua",
      featureAuditDesc: "Broadcasting asíncrono en tiempo real del 'quién, qué y dónde'.",
      featureCors: "Configuración CORS",
      featureCorsDesc:
        "Reglas estrictas de validación de orígenes controladas por los archivos appsettings.",
      corsTitle: "Configuración CORS",
      corsIntro:
        "Desarrollo permite todo origen Localhost. Producción usa la política estricta de orígenes declarados.",
      rateLimitTitle: "Políticas de Limitación de Tasa",
      passwordTitle: "Políticas de Contraseñas",
      securityWarning:
        "Antes del pase a producción, configura tus cadenas de orígenes, cambia las contraseñas base e impulsa la obligación del 2FA.",
    },
    authDeep: {
      title: "Autenticación a Fondo",
      description:
        "Ciclo de vida del JWT, hash BCrypt, bloqueo de cuentas, 2FA, OAuth, OTP, suplantación y gestión de sesiones.",
      intro: "Exploración exhaustiva de los mecanismos de identidad de NEXORA.",
      jwtLifecycleTitle: "Ciclo de Vida del Token JWT",
      jwtLifecycleIntro:
        "Acceso ultracorto (15 min) respaldado por refrescos (7 días) que se destruyen y renuevan en cada solicitud exitosa.",
      tokenStructureTitle: "Estructura del JWT",
      bcryptTitle: "Hash de Contraseña BCrypt",
      bcryptIntro:
        "Uso de factor de trabajo de carga (work factor = 12) intencionalmente lento para rechazar la fuerza bruta masiva (tarda ~250ms por verificación).",
      lockoutTitle: "Bloqueo de Cuentas",
      lockoutIntro:
        "5 intentos de contraseña fallidos generan 15 minutos de bloqueo ineludible o hasta ser liberado manualmente.",
      tfaTitle: "Autenticación de Dos Factores (TOTP)",
      tfaIntro:
        "Mecanismo estándar con comprobación de la ventana temporal de autenticadores (Google, Authy).",
      externalAuthTitle: "Autenticación Externa (OAuth)",
      externalAuthIntro:
        "Soporte oficial y validación en servidor para tokens recibidos de Google, Facebook, Microsoft y Apple.",
      otpTitle: "Sistema OTP (Contraseñas de Un Solo Uso)",
      otpIntro:
        "Códigos de 6 dígitos con hash BCrypt transitorio para confirmación de correos, SMS o resets de contraseñas.",
      impersonationTitle: "Suplantación de Administrador (Impersonation)",
      impersonationIntro:
        "Tokens especiales emitidos a un SuperAdmin para visualizar y depurar el panel como otro usuario, con rastreo en auditoría adjunto.",
      impersonationWarning:
        "Una función altamente privilegiada de uso temporal (máximo 1 hora). No puede usarse sobre usuarios protegidos ni SuperAdmins homólogos.",
      sessionTitle: "Gestión de Sesiones",
      sessionIntro:
        "Modelo sin estado (Stateless), donde el acceso vive en la memoria y el token de refresco en la Base de Datos o Cookie Segura.",
      cookieAuthTip:
        "Para el máximo nivel de seguridad, los JWT de actualización (refresh) deben enviarse a través de cookies HttpOnly y SameSite=Strict en el frontend.",
    },
    sso: {
      title: "Single Sign-On (SSO)",
      description: "Autenticación OIDC, vinculación de identidad externa y aplicaciones OAuth.",
      intro:
        "El sistema NEXORA soporta autenticación mediante proveedores externos basándose en el protocolo OIDC, y el suministro de credenciales a través de Aplicaciones OAuth. El sistema es consciente del inquilino, con un enfoque contundente en la seguridad PKCE.",
      architectureTitle: "Arquitectura de Autenticación OIDC / OAuth",
      endpointsTitle: "Endpoints y Flujo Operacional",
      flowIntro:
        "El proceso de autenticación SSO requiere un flujo de múltiples pasos para garantizar una seguridad extrema:",
      authEndpointTitle: "1. Endpoint de Autorización",
      authEndpointDesc:
        "Redirige a la página de inicio de sesión del IdP externo. Incluye verificación PKCE y paso de token de estado.",
      callbackEndpointTitle: "2. Endpoint de Retorno (Callback)",
      callbackEndpointDesc:
        "Recibe al usuario después de una autenticación exitosa e intercambia el código de autorización por tokens de seguridad, ejecutado enteramente del lado del servidor sin intervención del navegador.",
      linkingTitle: "Vinculación y Manejo de Identidades",
      linkingIntro:
        "Cuando el usuario completa el inicio de sesión, el correo electrónico se verifica con la base de datos de usuarios existentes. Si es su primer inicio de sesión, el registro OIDC se vincula de manera opaca al registro interno de NEXORA, evitando conflictos de duplicidad.",
      pkceWarning:
        "Soporte para flujos implícitos (Implicit flow) obsoleto de OAuth eliminado. Se exige PKCE obligatorio en todas las variantes.",
      howItWorksTitle: "How SSO Works",
      howItWorksContent:
        "NEXORA uses the Authorization Code Flow with PKCE (Proof Key for Code Exchange) for SSO. This is the most secure OAuth2 flow, recommended by the OAuth 2.1 specification for all client types.",
      step1Title: "1. Provider Discovery",
      step1Content:
        "The login page fetches available SSO providers via GET /auth/oidc/providers/admin. Only enabled providers for the current login context (admin/user) are returned.",
      step2Title: "2. PKCE Challenge",
      step2Content:
        "When the user clicks an SSO button, the frontend calls POST /auth/oidc/challenge. The backend generates a code_verifier, computes the code_challenge (SHA-256), and returns the authorization URL.",
      step3Title: "3. IdP Redirect",
      step3Content:
        "The frontend stores PKCE state (code_verifier, state, providerId) in sessionStorage, then redirects the user to the external IdP's authorization endpoint.",
      step4Title: "4. User Authentication",
      step4Content:
        "The user authenticates at the external IdP (Azure AD, Google, Okta, etc.) and grants consent for the requested scopes.",
      step5Title: "5. Callback & Token Exchange",
      step5Content:
        "The IdP redirects to /sso/callback with an authorization code. The frontend retrieves PKCE state from sessionStorage, validates the state parameter, and calls POST /auth/oidc/callback. The backend exchanges the code for tokens using the code_verifier.",
      pkceTitle: "PKCE Security Model",
      pkceContent:
        "PKCE prevents authorization code interception attacks by ensuring that only the client that initiated the flow can exchange the code. The code_verifier is never sent over the network — only its SHA-256 hash (code_challenge) is sent during the challenge step.",
      entityModelTitle: "Identity Provider Entity",
      entityModelContent:
        "The IdentityProvider entity stores all OIDC configuration for an external IdP. Each provider is optionally scoped to a tenant (TenantId = null means system-wide).",
      linkingContent:
        "Before SSO login works, a NEXORA admin/user must link their account to the external identity. This creates an ExternalLogin record mapping the provider's subject ID to the NEXORA account.",
      oauthAppsTitle: "OAuth Applications",
      oauthAppsContent:
        "OAuth Applications are third-party apps that authenticate against NEXORA as an OIDC server. Each app gets a Client ID and Client Secret, with configurable redirect URIs, scopes, and PKCE enforcement.",
      claimMappingTitle: "Claim Mapping",
      claimMappingContent:
        "When an external IdP uses non-standard claim names, the ClaimMappingJson field maps them to NEXORA's expected claims. If null, standard OIDC claim names (sub, email, name) are used.",
      tenantScopingTitle: "Tenant Scoping",
      tenantScopingContent:
        "Identity Providers are tenant-scoped via the TenantId column. Providers with null TenantId are system-wide (available to all tenants). The backend automatically filters providers by the current admin's tenant context.",
      tenantScopingNote:
        "Host admins can manage any tenant's SSO providers by using the 'Enter Tenant World' feature from the Tenants page. This scopes all API calls to the target tenant without needing to log in as that tenant's admin.",
      apiTitle: "API Endpoints",
    },
    dataProtection: {
      title: "Protección de Datos",
      description:
        "Aislamiento de inquilinos, encriptación en reposo y tránsito, campos restringidos y cumplimiento GDPR.",
      intro:
        "Toda la infraestructura de protección detrás de la manipulación interna de la información en NEXORA.",
      tenantIsolationTitle: "Aislamiento de Datos de Inquilinos",
      tenantIsolationIntro:
        "El middleware contextual del JWT impone el aislamiento desde el nivel más bajo (EF Core Global Filters).",
      tenantScopingTitle: "Alcance de Filtros de Consulta",
      tenantServicesTitle: "Servicios Conscientes del Inquilino (Tenant-Aware)",
      tenantServicesIntro:
        "Uso de la inyección de la interfaz IDataScopeService para extraer el inquilino sin acoplarse al Request HTTP general.",
      dataAtRestTitle: "Encriptación de Datos en Reposo (Data at Rest)",
      dataAtRestIntro:
        "Las bases utilizan TDE (Transparent Data Encryption), mientras que secretos específicos se encriptan bajo la API Data Protection de ASP.NET Core.",
      dataInTransitTitle: "Encriptación de Datos en Tránsito (Data in Transit)",
      dataInTransitIntro:
        "Comunicación obligatoria sobre túneles TLS 1.2+ y encabezados HSTS en despliegue productivo.",
      restrictedFieldsTitle: "Restricción de Campos Sensibles",
      restrictedFieldsIntro:
        "Saneamiento dinámico en el middleware antes de lanzar el JSON de respuesta si el rol carece de los privilegios exactos de visibilidad del campo.",
      idEncryptionTitle: "Cifrado de IDs",
      idEncryptionIntro:
        "Las IDs base pueden empaquetarse con AES-256 en salida hacia las APIs públicas para frustrar el rasgueo o adivinación de recursos.",
      gdprTitle: "Cumplimiento de la Normativa GDPR",
      gdprIntro:
        "Soporta nativamente las leyes de Portabilidad y Derecho al Olvido (Right to delete).",
      rightToDeleteTitle: "Derecho a ser Borrado",
      dataPortabilityTitle: "Portabilidad de Datos",
      consentTitle: "Gestión del Consentimiento",
      retentionTitle: "Políticas de Retención de Datos",
      auditTrailTitle: "Trazabilidad para la Auditoría Normativa",
      bypassWarning:
        "Al llamar a IgnoreQueryFilters(), anulas la defensa básica del ORM contra el aislamiento del inquilino, asegurate de acotarlo a mano en el LINQ.",
    },
    apiSecurity: {
      title: "Seguridad de la API",
      description:
        "Limitación de tasa, CORS, validación de entrada, protección CSRF y prevención contra ataques de repetición.",
      intro: "El escudo defensivo del canal de comunicación del Backend NEXORA.",
      rateLimitTitle: "Limitación de Tasa (Rate Limiting)",
      rateLimitIntro:
        "La limitación del servidor protege por IP e incluso ajusta las ráfagas sobre operaciones criptográficas densas (logins).",
      corsTitle: "Configuración CORS",
      corsIntro: "Solo dominios conocidos y encabezados controlados.",
      inputValidationTitle: "Validación de Entradas (Input Validation)",
      inputValidationIntro:
        "Se realiza a través del marco de validación FluentValidation en un paso que intercepta (Behavior) MediatR.",
      csrfTitle: "Protección CSRF",
      csrfIntro: "Manejo inteligente del Token Bearer y las directivas SameSite Strict.",
      headersTitle: "Encabezados de Seguridad (Security Headers)",
      headersIntro:
        "Emisión automática de reglas como X-Content-Type-Options: nosniff, y CSP (Content Security Policy) restrictivo.",
      headersTip:
        "Obtén siempre calificación A+ verificando tu dominio en portales estandarizados de prueba de seguridad.",
      replayTitle: "Prevención de Ataques de Repetición (Replay Attacks)",
      replayIntro:
        "Imposible de replicar gracias a la vigencia minúscula del JWT y los usos únicos transaccionales en las ventanas temporales del 2FA.",
    },
    middlewarePipeline: {
      title: "Pipeline de Middleware",
      description:
        "11 componentes ejecutados en riguroso orden para orquestar de manera limpia cada solicitud al servidor.",
      intro: "La cinta transportadora del sistema en ASP.NET Core y el corazón de NEXORA.",
      overviewTitle: "Visión General del Pipeline",
      overviewIntro:
        "El proceso es de caída libre: un error superior cancelará la ejecución de las capas subyacentes.",
      globalExceptionTitle: "1. Manejador de Excepciones Global",
      globalExceptionIntro:
        "Atrapa cualquier crash 500 y retorna JSON seguro que no detalla la infraestructura si estás en producción.",
      correlationIdTitle: "2. ID de Correlación (Correlation ID)",
      correlationIdIntro:
        "Firma única asignada al instante 0 del request y traspasada al log, a la base de datos y a las integraciones.",
      requestLoggingTitle: "3. Registro de Solicitud (Request Logging)",
      requestLoggingIntro:
        "Registros estructurados que oscurecen automáticamente campos prohibidos (como contraseñas) dentro de la carga útil del request.",
      cookieAuthTitle: "4. Conversión de Cookie a Bearer",
      cookieAuthIntro:
        "Traduce una Cookie de autenticación a un JWT nativo sobre el encabezado HTTP para su posterior consumo limpio en el Backend.",
      tenantContextTitle: "5. Contexto de Inquilino (Tenant Context)",
      tenantContextIntro:
        "Busca y planta el ID de Inquilino extraído del Request en la variable IDataScopeService de alcance general.",
      tenantContextNote:
        "Se destruye el sistema si este middleware se registra antes de la Autenticación o después de iniciar transacciones de DB.",
      cacheHeadersTitle: "6. Encabezados de Caché",
      cacheHeadersIntro:
        "Impone cabeceras 'no-store, no-cache' en rutas API y otorga ETags para rutas estáticas.",
      fieldProjectionTitle: "7. Proyección de Campos",
      fieldProjectionIntro:
        "Destruye (hace nulas) propiedades enteras del JSON de retorno antes de llegar al usuario, protegiendo datos con control ABAC.",
      observabilityTitle: "Middleware de Observabilidad",
      observabilityIntro: "Levanta métricas con OpenTelemetry y Prometheus.",
      registrationTitle: "Orden de Registro de Middleware",
      registrationIntro:
        "Alterar el Program.cs requiere validación profunda del comportamiento del Pipeline.",
      summaryTitle: "Resumen del Middleware",
      orderWarning:
        "Mueve el registro bajo tu propio riesgo: esto causará fallas en cascada y comportamientos impredecibles.",
    },
    auditCompliance: {
      title: "Auditoría y Cumplimiento",
      description:
        "El pipeline de captura y exportación más robusto posible sobre el modelo transaccional de la empresa.",
      intro: "Proporciona pruebas periciales de quién hizo qué, y a qué hora precisa.",
      architectureTitle: "Arquitectura de Auditoría",
      architectureIntro:
        "El sistema no depende del programador sino de Interceptores a bajo nivel del ORM.",
      interceptorTitle: "Interceptor de Cambios de Entidad",
      interceptorIntro:
        "Calcula los deltas del valor Viejo -> Nuevo automáticamente y lo convierte a formato JSON persistido.",
      auditLogEntityTitle: "Estructura de la Entidad AuditLog",
      signalrTitle: "Transmisión (Streaming) en Tiempo Real",
      signalrIntro:
        "SignalR emite el evento al navegador del auditor milisegundos después de ocurrir el cambio en la base de datos.",
      exportTitle: "Capacidades de Exportación",
      exportIntro:
        "Saca los datos fuera del sistema mediante formatos corporativos CSV y Excel, listos para la autoridad correspondiente.",
      queryApiTitle: "API de Consultas y Exportaciones",
      queryApiIntro:
        "Totalmente enlazada al sistema de RBAC y filtrada mediante los límites del inquilino respectivo.",
      querySearchDesc: "Busca con indexación profunda y paginación rápida.",
      queryExportCsvDesc: "Generación asincrónica en formato CSV.",
      queryExportExcelDesc: "Exportación empaquetada XLSX.",
      queryExportPdfDesc: "Exportación legal sellada en PDF.",
      complianceTitle: "Características de Cumplimiento",
      immutableTitle: "Registros Inmutables",
      fullTraceTitle: "Trazabilidad Completa",
      searchableTitle: "Altamente Consultable",
      tenantScopedTitle: "Alcance Separado por Inquilino",
      realtimeTitle: "Vigilancia en Tiempo Real",
      retentionTitle: "Políticas Configurables de Retención",
    },
  },
};

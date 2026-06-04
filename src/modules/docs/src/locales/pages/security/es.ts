/**
 * Docs security — ES
 * Auto-filled 25 keys from EN.
 */
export const es = {
  security: {
    apiSecurity: {
      corsIntro: "Solo dominios conocidos y encabezados controlados.",
      corsTitle: "Configuración CORS",
      csrfIntro: "Manejo inteligente del Token Bearer y las directivas SameSite Strict.",
      csrfTitle: "Protección CSRF",
      description:
        "Limitación de tasa, CORS, validación de entrada, protección CSRF y prevención contra ataques de repetición.",
      headersIntro:
        "Emisión automática de reglas como X-Content-Type-Options: nosniff, y CSP (Content Security Policy) restrictivo.",
      headersTip:
        "Obtén siempre calificación A+ verificando tu dominio en portales estandarizados de prueba de seguridad.",
      headersTitle: "Encabezados de Seguridad (Security Headers)",
      inputValidationIntro:
        "Se realiza a través del marco de validación FluentValidation en un paso que intercepta (Behavior) AstraFlow mediator.",
      inputValidationTitle: "Validación de Entradas (Input Validation)",
      intro: "El escudo defensivo del canal de comunicación del Backend SCRIPE.",
      rateLimitIntro:
        "La limitación del servidor protege por IP e incluso ajusta las ráfagas sobre operaciones criptográficas densas (logins).",
      rateLimitTitle: "Limitación de Tasa (Rate Limiting)",
      replayIntro:
        "Imposible de replicar gracias a la vigencia minúscula del JWT y los usos únicos transaccionales en las ventanas temporales del 2FA.",
      replayTitle: "Prevención de Ataques de Repetición (Replay Attacks)",
      title: "Seguridad de la API",
    },
    auditCompliance: {
      architectureIntro:
        "El sistema no depende del programador sino de Interceptores a bajo nivel del ORM.",
      architectureTitle: "Arquitectura de Auditoría",
      auditLogEntityTitle: "Estructura de la Entidad AuditLog",
      complianceTitle: "Características de Cumplimiento",
      description:
        "El pipeline de captura y exportación más robusto posible sobre el modelo transaccional de la empresa.",
      exportIntro:
        "Saca los datos fuera del sistema mediante formatos corporativos CSV y Excel, listos para la autoridad correspondiente.",
      exportTitle: "Capacidades de Exportación",
      fullTraceTitle: "Trazabilidad Completa",
      immutableTitle: "Registros Inmutables",
      interceptorIntro:
        "Calcula los deltas del valor Viejo -> Nuevo automáticamente y lo convierte a formato JSON persistido.",
      interceptorTitle: "Interceptor de Cambios de Entidad",
      intro: "Proporciona pruebas periciales de quién hizo qué, y a qué hora precisa.",
      queryApiIntro:
        "Totalmente enlazada al sistema de RBAC y filtrada mediante los límites del inquilino respectivo.",
      queryApiTitle: "API de Consultas y Exportaciones",
      queryExportCsvDesc: "Generación asincrónica en formato CSV.",
      queryExportExcelDesc: "Exportación empaquetada XLSX.",
      queryExportPdfDesc: "Exportación legal sellada en PDF.",
      querySearchDesc: "Busca con indexación profunda y paginación rápida.",
      realtimeTitle: "Vigilancia en Tiempo Real",
      retentionTitle: "Políticas Configurables de Retención",
      searchableTitle: "Altamente Consultable",
      signalrIntro:
        "SignalR emite el evento al navegador del auditor milisegundos después de ocurrir el cambio en la base de datos.",
      signalrTitle: "Transmisión (Streaming) en Tiempo Real",
      tenantScopedTitle: "Alcance Separado por Inquilino",
      title: "Auditoría y Cumplimiento",
    },
    authDeep: {
      bcryptIntro:
        "Uso de factor de trabajo de carga (work factor = 12) intencionalmente lento para rechazar la fuerza bruta masiva (tarda ~250ms por verificación).",
      bcryptTitle: "Hash de Contraseña BCrypt",
      cookieAuthTip:
        "Para el máximo nivel de seguridad, los JWT de actualización (refresh) deben enviarse a través de cookies HttpOnly y SameSite=Strict en el frontend.",
      description:
        "Ciclo de vida del JWT, hash BCrypt, bloqueo de cuentas, 2FA, OAuth, OTP, suplantación y gestión de sesiones.",
      externalAuthIntro:
        "Soporte oficial y validación en servidor para tokens recibidos de Google, Facebook, Microsoft y Apple.",
      externalAuthTitle: "Autenticación Externa (OAuth)",
      impersonationIntro:
        "Tokens especiales emitidos a un SuperAdmin para visualizar y depurar el panel como otro usuario, con rastreo en auditoría adjunto.",
      impersonationTitle: "Suplantación de Administrador (Impersonation)",
      impersonationWarning:
        "Una función altamente privilegiada de uso temporal (máximo 1 hora). No puede usarse sobre usuarios protegidos ni SuperAdmins homólogos.",
      intro: "Exploración exhaustiva de los mecanismos de identidad de SCRIPE.",
      jwtLifecycleIntro:
        "Acceso ultracorto (15 min) respaldado por refrescos (7 días) que se destruyen y renuevan en cada solicitud exitosa.",
      jwtLifecycleTitle: "Ciclo de Vida del Token JWT",
      lockoutIntro:
        "5 intentos de contraseña fallidos generan 15 minutos de bloqueo ineludible o hasta ser liberado manualmente.",
      lockoutTitle: "Bloqueo de Cuentas",
      otpIntro:
        "Códigos de 6 dígitos con hash BCrypt transitorio para confirmación de correos, SMS o resets de contraseñas.",
      otpTitle: "Sistema OTP (Contraseñas de Un Solo Uso)",
      passkeysIntro:
        "Las llaves de paso proporcionan un mecanismo de autenticación sin contraseña mediante criptografía de clave pública. Durante el registro, el navegador genera un par de claves pública y privada, envía la clave pública y el ID de credencial al servidor, y mantiene la clave privada segura en el autenticador del dispositivo. Durante el inicio de sesión, el servidor emite un desafío que el autenticador firma con la clave privada.",
      passkeysTitle: "Llaves de paso (Passkeys / WebAuthn)",
      qrIntro:
        "El inicio de sesión con código QR permite a los usuarios autenticarse instantáneamente en un cliente web escaneando un código QR con su aplicación móvil ya autenticada. El cliente web sondea el estado de la sesión hasta que la aplicación móvil confirma la sesión firmando el token de sesión y enviándolo junto con las credenciales de sesión activas del usuario.",
      qrTitle: "Handshake de Inicio de Sesión con Código QR",
      samlIntro:
        "SAML 2.0 permite el inicio de sesión único (SSO) empresarial al federar la autenticación entre SCRIPE (que actúa como proveedor de servicios) y los proveedores de identidad corporativos (IdP) como Okta o Active Directory. El intercambio utiliza aserciones basadas en XML firmadas con certificados X.509 para verificar la identidad y mapear roles.",
      samlTitle: "Federación Empresarial SAML 2.0",
      sessionIntro:
        "Modelo sin estado (Stateless), donde el acceso vive en la memoria y el token de refresco en la Base de Datos o Cookie Segura.",
      sessionTitle: "Gestión de Sesiones",
      ssoSuspensionIntro:
        "El ExternalLoginCommandHandler ahora incluye una puerta de seguridad para la suspensión del inquilino. Antes de emitir un JWT después de la autenticación SSO/OIDC, el controlador verifica el estado del inquilino del administrador. Si el inquilino está Suspendido o Cancelado, el inicio de sesión se rechaza con un error localizado, lo que evita que los usuarios desactivados eviten los controles de inicio de sesión estándar a través de SSO.",
      ssoSuspensionTitle: "Puerta de Suspensión de Inquilino SSO",
      ssoSuspensionWarning:
        "Sin esta puerta, los usuarios de SSO podrían autenticarse a través de un IdP externo (por ejemplo, Google, Azure AD) y recibir un JWT de SCRIPE válido incluso si su inquilino ha sido suspendido o cancelado. Esta era una brecha de seguridad crítica que ha sido remediada.",
      tfaIntro:
        "Mecanismo estándar con comprobación de la ventana temporal de autenticadores (Google, Authy).",
      tfaTitle: "Autenticación de Dos Factores (TOTP)",
      title: "Autenticación a Fondo",
      tokenStructureTitle: "Estructura del JWT",
    },
    dataProtection: {
      auditTrailTitle: "Trazabilidad para la Auditoría Normativa",
      bypassWarning:
        "Al llamar a IgnoreQueryFilters(), anulas la defensa básica del ORM contra el aislamiento del inquilino, asegurate de acotarlo a mano en el LINQ.",
      consentTitle: "Gestión del Consentimiento",
      dataAtRestIntro:
        "Las bases utilizan TDE (Transparent Data Encryption), mientras que secretos específicos se encriptan bajo la API Data Protection de ASP.NET Core.",
      dataAtRestTitle: "Encriptación de Datos en Reposo (Data at Rest)",
      dataInTransitIntro:
        "Comunicación obligatoria sobre túneles TLS 1.2+ y encabezados HSTS en despliegue productivo.",
      dataInTransitTitle: "Encriptación de Datos en Tránsito (Data in Transit)",
      dataPortabilityTitle: "Portabilidad de Datos",
      description:
        "Aislamiento de inquilinos, encriptación en reposo y tránsito, campos restringidos y cumplimiento GDPR.",
      gdprIntro:
        "Soporta nativamente las leyes de Portabilidad y Derecho al Olvido (Right to delete).",
      gdprTitle: "Cumplimiento de la Normativa GDPR",
      idEncryptionIntro:
        "Las IDs base pueden empaquetarse con AES-256 en salida hacia las APIs públicas para frustrar el rasgueo o adivinación de recursos.",
      idEncryptionTitle: "Cifrado de IDs",
      intro:
        "Toda la infraestructura de protección detrás de la manipulación interna de la información en SCRIPE.",
      restrictedFieldsIntro:
        "Saneamiento dinámico en el middleware antes de lanzar el JSON de respuesta si el rol carece de los privilegios exactos de visibilidad del campo.",
      restrictedFieldsTitle: "Restricción de Campos Sensibles",
      retentionTitle: "Políticas de Retención de Datos",
      rightToDeleteTitle: "Derecho a ser Borrado",
      tenantIsolationIntro:
        "El middleware contextual del JWT impone el aislamiento desde el nivel más bajo (EF Core Global Filters).",
      tenantIsolationTitle: "Aislamiento de Datos de Inquilinos",
      tenantScopingTitle: "Alcance de Filtros de Consulta",
      tenantServicesIntro:
        "Uso de la inyección de la interfaz IDataScopeService para extraer el inquilino sin acoplarse al Request HTTP general.",
      tenantServicesTitle: "Servicios Conscientes del Inquilino (Tenant-Aware)",
      title: "Protección de Datos",
    },
    middlewarePipeline: {
      cacheHeadersIntro:
        "Impone cabeceras 'no-store, no-cache' en rutas API y otorga ETags para rutas estáticas.",
      cacheHeadersTitle: "6. Encabezados de Caché",
      cookieAuthIntro:
        "Traduce una Cookie de autenticación a un JWT nativo sobre el encabezado HTTP para su posterior consumo limpio en el Backend.",
      cookieAuthTitle: "4. Conversión de Cookie a Bearer",
      correlationIdIntro:
        "Firma única asignada al instante 0 del request y traspasada al log, a la base de datos y a las integraciones.",
      correlationIdTitle: "2. ID de Correlación (Correlation ID)",
      description:
        "11 componentes ejecutados en riguroso orden para orquestar de manera limpia cada solicitud al servidor.",
      fieldProjectionIntro:
        "Destruye (hace nulas) propiedades enteras del JSON de retorno antes de llegar al usuario, protegiendo datos con control ABAC.",
      fieldProjectionTitle: "7. Proyección de Campos",
      globalExceptionIntro:
        "Atrapa cualquier crash 500 y retorna JSON seguro que no detalla la infraestructura si estás en producción.",
      globalExceptionTitle: "1. Manejador de Excepciones Global",
      intro: "La cinta transportadora del sistema en ASP.NET Core y el corazón de SCRIPE.",
      observabilityIntro: "Levanta métricas con OpenTelemetry y Prometheus.",
      observabilityTitle: "Middleware de Observabilidad",
      orderWarning:
        "Mueve el registro bajo tu propio riesgo: esto causará fallas en cascada y comportamientos impredecibles.",
      overviewIntro:
        "El proceso es de caída libre: un error superior cancelará la ejecución de las capas subyacentes.",
      overviewTitle: "Visión General del Pipeline",
      registrationIntro:
        "Alterar el Program.cs requiere validación profunda del comportamiento del Pipeline.",
      registrationTitle: "Orden de Registro de Middleware",
      requestLoggingIntro:
        "Registros estructurados que oscurecen automáticamente campos prohibidos (como contraseñas) dentro de la carga útil del request.",
      requestLoggingTitle: "3. Registro de Solicitud (Request Logging)",
      summaryTitle: "Resumen del Middleware",
      tenantContextIntro:
        "Busca y planta el ID de Inquilino extraído del Request en la variable IDataScopeService de alcance general.",
      tenantContextNote:
        "Se destruye el sistema si este middleware se registra antes de la Autenticación o después de iniciar transacciones de DB.",
      tenantContextTitle: "5. Contexto de Inquilino (Tenant Context)",
      title: "Pipeline de Middleware",
    },
    overview: {
      corsIntro:
        "Desarrollo permite todo origen Localhost. Producción usa la política estricta de orígenes declarados.",
      corsTitle: "Configuración CORS",
      description:
        "Estrategia de defensa en 5 capas, características de seguridad, configuración CORS, limitación de tasa y políticas de contraseñas.",
      feature2fa: "Autenticación 2FA",
      feature2faDesc:
        "Doble factor obligatorio por inquilino basado en aplicaciones TOTP (Google Authenticator).",
      featureAudit: "Auditoría Continua",
      featureAuditDesc: "Broadcasting asíncrono en tiempo real del 'quién, qué y dónde'.",
      featureCors: "Configuración CORS",
      featureCorsDesc:
        "Reglas estrictas de validación de orígenes controladas por los archivos appsettings.",
      featureJwt: "Autenticación JWT",
      featureJwtDesc: "Tokens de corta duración con rotación automática, firmados por HMAC-SHA256.",
      featureRateLimit: "Limitación de Tasa (Rate Limiting)",
      featureRateLimitDesc:
        "4 niveles: DDoS, IP individual, Endpoint individual, y rutas de inicio de sesión.",
      featureRbac: "Permisos RBAC",
      featureRbacDesc:
        "Motor de control (PBAC/ABAC/RBAC) almacenado dinámicamente en el servidor en cada token refresh.",
      featuresTitle: "Características de Seguridad",
      intro:
        "SCRIPE implementa una defensa en profundidad con cinco capas: protección de red, autenticación, autorización, aislamiento de datos y registros de auditoría.",
      layersTitle: "Capas de Defensa de Seguridad",
      passwordTitle: "Políticas de Contraseñas",
      rateLimitTitle: "Políticas de Limitación de Tasa",
      securityWarning:
        "Antes del pase a producción, configura tus cadenas de orígenes, cambia las contraseñas base e impulsa la obligación del 2FA.",
      title: "Visión General de la Seguridad",
    },
    sso: {
      apiTitle: "API Endpoints",
      architectureTitle: "Arquitectura de Autenticación OIDC / OAuth",
      authEndpointDesc:
        "Redirige a la página de inicio de sesión del IdP externo. Incluye verificación PKCE y paso de token de estado.",
      authEndpointTitle: "1. Endpoint de Autorización",
      callbackEndpointDesc:
        "Recibe al usuario después de una autenticación exitosa e intercambia el código de autorización por tokens de seguridad, ejecutado enteramente del lado del servidor sin intervención del navegador.",
      callbackEndpointTitle: "2. Endpoint de Retorno (Callback)",
      claimMappingContent:
        "When an external IdP uses non-standard claim names, the ClaimMappingJson field maps them to SCRIPE's expected claims. If null, standard OIDC claim names (sub, email, name) are used.",
      claimMappingTitle: "Claim Mapping",
      description: "Autenticación OIDC, vinculación de identidad externa y aplicaciones OAuth.",
      endpointsTitle: "Endpoints y Flujo Operacional",
      entityModelContent:
        "The IdentityProvider entity stores all OIDC configuration for an external IdP. Each provider is optionally scoped to a tenant (TenantId = null means system-wide).",
      entityModelTitle: "Identity Provider Entity",
      flowIntro:
        "El proceso de autenticación SSO requiere un flujo de múltiples pasos para garantizar una seguridad extrema:",
      howItWorksContent:
        "SCRIPE uses the Authorization Code Flow with PKCE (Proof Key for Code Exchange) for SSO. This is the most secure OAuth2 flow, recommended by the OAuth 2.1 specification for all client types.",
      howItWorksTitle: "How SSO Works",
      intro:
        "El sistema SCRIPE soporta autenticación mediante proveedores externos basándose en el protocolo OIDC, y el suministro de credenciales a través de Aplicaciones OAuth. El sistema es consciente del inquilino, con un enfoque contundente en la seguridad PKCE.",
      linkingContent:
        "Before SSO login works, a SCRIPE admin/user must link their account to the external identity. This creates an ExternalLogin record mapping the provider's subject ID to the SCRIPE account.",
      linkingIntro:
        "Cuando el usuario completa el inicio de sesión, el correo electrónico se verifica con la base de datos de usuarios existentes. Si es su primer inicio de sesión, el registro OIDC se vincula de manera opaca al registro interno de SCRIPE, evitando conflictos de duplicidad.",
      linkingTitle: "Vinculación y Manejo de Identidades",
      oauthAppsContent:
        "OAuth Applications are third-party apps that authenticate against SCRIPE as an OIDC server. Each app gets a Client ID and Client Secret, with configurable redirect URIs, scopes, and PKCE enforcement.",
      oauthAppsTitle: "OAuth Applications",
      pkceContent:
        "PKCE prevents authorization code interception attacks by ensuring that only the client that initiated the flow can exchange the code. The code_verifier is never sent over the network — only its SHA-256 hash (code_challenge) is sent during the challenge step.",
      pkceTitle: "PKCE Security Model",
      pkceWarning:
        "Soporte para flujos implícitos (Implicit flow) obsoleto de OAuth eliminado. Se exige PKCE obligatorio en todas las variantes.",
      step1Content:
        "The login page fetches available SSO providers via GET /auth/oidc/providers/admin. Only enabled providers for the current login context (admin/user) are returned.",
      step1Title: "1. Provider Discovery",
      step2Content:
        "When the user clicks an SSO button, the frontend calls POST /auth/oidc/challenge. The backend generates a code_verifier, computes the code_challenge (SHA-256), and returns the authorization URL.",
      step2Title: "2. PKCE Challenge",
      step3Content:
        "The frontend stores PKCE state (code_verifier, state, providerId) in sessionStorage, then redirects the user to the external IdP's authorization endpoint.",
      step3Title: "3. IdP Redirect",
      step4Content:
        "The user authenticates at the external IdP (Azure AD, Google, Okta, etc.) and grants consent for the requested scopes.",
      step4Title: "4. User Authentication",
      step5Content:
        "The IdP redirects to /sso/callback with an authorization code. The frontend retrieves PKCE state from sessionStorage, validates the state parameter, and calls POST /auth/oidc/callback. The backend exchanges the code for tokens using the code_verifier.",
      step5Title: "5. Callback & Token Exchange",
      tenantScopingContent:
        "Identity Providers are tenant-scoped via the TenantId column. Providers with null TenantId are system-wide (available to all tenants). The backend automatically filters providers by the current admin's tenant context.",
      tenantScopingNote:
        "Host admins can manage any tenant's SSO providers by using the 'Enter Tenant World' feature from the Tenants page. This scopes all API calls to the target tenant without needing to log in as that tenant's admin.",
      tenantScopingTitle: "Tenant Scoping",
      title: "Single Sign-On (SSO)",
    },
  },
};

// FILE-EXCEPTION: file length
/**
 * Docs page locale — ES
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const es = {
  features: {
    authentication: {
      title: "Autenticación",
      description:
        "Autenticación dual (Admin + Usuario), enrutamiento multi-espacio de trabajo, tokens JWT, 2FA con códigos de respaldo, aplicación de expiración de contraseña, puerta de suspensión SSO y política de contraseñas por inquilino.",
      intro:
        "SCRIPE proporciona un sistema de autenticación seguro con tokens de acceso JWT, rotación de tokens de refresco, autenticación de dos factores opcional, descubrimiento de inicio de sesión multi-espacio de trabajo, aplicación de expiración de contraseña y limitación de tasa integral. El sistema admite canales de autenticación independientes para administradores y usuarios con diferentes reclamaciones JWT y permisos.",
      flowTitle: "Flujo de Autenticación",
      workspaceTitle: "Descubrimiento de Espacios de Trabajo en el Acceso",
      workspaceIntro:
        "Al iniciar sesión desde el dominio global, un algoritmo de enrutamiento identifica las organizaciones asociadas al usuario y presenta un selector si existen múltiples cuentas.",
      workspaceNote:
        "La bandera isPlatformAdmin evita bucles infinitos al dirigir a los administradores de la plataforma directamente a su panel.",
      passwordExpiryTitle: "Expiración Forzada de Contraseñas",
      passwordExpiryIntro:
        "El sistema comprueba la directiva PasswordExpiryDays. Al caducar, obliga al usuario a actualizar su clave antes de acceder.",
      ssoSuspensionTitle: "Bloqueo de Inquilinos Suspendidos en SSO",
      ssoSuspensionIntro:
        "Tras validar el proveedor externo, se verifica el estado de la organización; si está suspendida, se impide el acceso de inmediato.",
      ssoSuspensionWarning:
        "Evita que miembros de organizaciones suspendidas eludan restricciones mediante proveedores como Google o Azure AD.",
      jwtTitle: "Configuración de Tokens JWT",
      jwtIntro:
        "El sistema utiliza tokens de acceso de corta duración (15 minutos) con tokens de refresco de larga duración (7 días). Los tokens de refresco se rotan en cada uso para evitar ataques de repetición.",
      dualAuthTitle: "Autenticación Dual (Admin y Usuario)",
      dualAuthIntro:
        "SCRIPE tiene dos pipelines de autenticación separados. La autenticación de administrador (AdminAuthController) emite JWT con reclamaciones específicas de administrador (TenantId, IsSuperAdmin, Roles). La autenticación de usuario (UserAuthController) emite JWT con reclamaciones específicas de usuario (NationalId, Gender, Country). Cada uno tiene sus propios endpoints de inicio de sesión, registro y actualización de tokens.",
      adminEntityTitle: "Entidad Admin (Características de Seguridad)",
      adminEntityIntro:
        "La entidad Admin tiene varios campos críticos de seguridad que controlan el comportamiento y la protección de la cuenta.",
      twoFactorTitle: "Autenticación de Dos Factores (2FA)",
      twoFactorIntro:
        "El 2FA se implementa con TOTP (Time-based One-Time Password) utilizando un secreto TwoFactorSecret por administrador. Los códigos de respaldo se cifran y almacenan en BackupCodesJson. La protección anti-repetición garantiza que el mismo código no se pueda usar dos veces a través de las marcas de tiempo LastTwoFactorCodeUsed y LastTwoFactorCodeUsedAt.",
      passwordPolicyTitle: "Política de Contraseñas por Inquilino",
      passwordPolicyIntro:
        "Los requisitos de la contraseña son configurables por inquilino a través de TenantSettings. Cada inquilino puede establecer la longitud mínima, requisitos de mayúsculas, números, caracteres especiales y duración de vencimiento. El campo PasswordLastChanged en la entidad Admin se verifica con PasswordExpiryDays del inquilino para exigir la rotación de contraseñas.",
      endpointsTitle: "Endpoints de la API de Autenticación",
      endpointsAdminTitle: "Endpoints de Auth para Admin",
      endpointsUserTitle: "Endpoints de Auth para Usuario",
      rateLimitingTitle: "Limitación de Tasa (Rate Limiting)",
      rateLimitingIntro:
        "Los endpoints de autenticación están protegidos por múltiples políticas de limitación de tasa para prevenir ataques de fuerza bruta y abusos.",
      lockoutWarning:
        "Después de 5 intentos fallidos de inicio de sesión, la cuenta se bloquea durante 15 minutos. El contador de bloqueo se restablece después de un inicio de sesión exitoso. Los administradores pueden desbloquear cuentas manualmente desde el panel de administración.",
      tokenValidationTitle: "Validación Criptográfica de Tokens",
      tokenValidationIntro:
        "Comprobación estricta de firmas, vigencia y huellas digitales del dispositivo para evitar secuestros de sesión.",
      mcpMiddlewareTitle: "Middleware de Seguridad para MCP",
      mcpMiddlewareIntro:
        "Aislamiento y autorización rigurosa de llamadas basadas en Model Context Protocol para integraciones de IA.",
      ssoCallbackTitle: "Canalización de Respuestas SSO",
      ssoCallbackIntro:
        "Intercambio seguro de tokens y vinculación automática de cuentas basada en direcciones de correo verificadas.",
      antiReplayTitle: "Mecanismo Contra Ataques de Reproducción",
      antiReplayIntro:
        "Uso de números aleatorios de un solo uso (nonces) y marcas de tiempo para invalidar tokens interceptados.",
      lockoutPolicyTitle: "Política de Bloqueo Automático por Intentos Fallidos",
      lockoutPolicyIntro:
        "Bloqueo de cuenta durante 15 minutos tras 5 intentos fallidos consecutivos para mitigar ataques de fuerza bruta.",
    },
    multiTenancy: {
      title: "Multitenencia (Multi-Tenancy)",
      description:
        "Aislamiento de datos a nivel de fila, inquilinos jerárquicos, configuración por inquilino, personalización de marca y arquitectura de alcance.",
      intro:
        "SCRIPE soporta multitenencia completa con aislamiento de datos a nivel de fila utilizando filtros de consulta globales de EF Core.",
      architectureTitle: "Arquitectura",
      isolationIntro:
        "El aislamiento de datos a nivel de fila se logra dinámicamente mediante los filtros de consulta globales de EF Core. El contexto de base de datos base crea dinámicamente filtros que restringen el acceso al inquilino activo (`CurrentTenantId`) o a registros a nivel de plataforma (`TenantId == null`). En lugar de capturar un valor estático durante la compilación, EF Core evalúa dinámicamente el contexto del inquilino activo en cada ejecución de consulta.",
      drilldownIntro:
        "Los administradores del sistema no omiten los límites de datos de los inquilinos de forma implícita. La omisión requiere una acción de desglose (drill-down) donde la aplicación cliente adjunta el ID del inquilino cifrado en la cabecera `X-Tenant-Context`. El cortafuegos del middleware intercepta la solicitud, verifica el permiso `tenants.drill_down`, descifra la cabecera mediante AES y anula el contexto del inquilino activo durante la solicitud.",
      featuresTitle: "Características del Inquilino (Tenant)",
      featureIsolation: "Aislamiento de Datos",
      featureIsolationDesc:
        "Aislamiento a nivel de fila que incluye automáticamente WHERE TenantId = @CurrentTenant.",
      featureSettings: "Configuraciones por Inquilino",
      featureSettingsDesc:
        "Cuotas, políticas de seguridad y de auditoría configuradas individualmente para cada inquilino.",
      featureBranding: "Marca Personalizada",
      featureBrandingDesc: "Subida de logos y personalización de interfaz por inquilino.",
      featureUserScoping: "Alcance de Usuarios",
      featureUserScopingDesc:
        "Los administradores de inquilinos solo pueden ver y gestionar a sus propios usuarios.",
      featureRoleScoping: "Alcance de Roles",
      featureRoleScopingDesc: "Los roles se crean con permisos limitados al inquilino.",
      featureDataScoping: "Alcance de Datos",
      featureDataScopingDesc:
        "Todos los datos de negocio se restringen automáticamente al inquilino, sin riesgo de fugas de datos cruzadas.",
      hierarchyTitle: "Jerarquía de Inquilinos",
      hierarchyIntro:
        "Los inquilinos forman una estructura de árbol a través de ParentTenantId, lo que permite ramas, sucursales y departamentos.",
      hierarchyQueriesIntro:
        "En lugar de depender de consultas CTE recursivas complejas específicas de cada base de datos, SCRIPE construye la jerarquía de inquilinos al crear un inquilino hijo concatenando rutas materializadas (`HierarchyPath`) como `/{grandparent-id}/{parent-id}/`. Las comprobaciones de ascendencia y las consultas del subárbol de descendientes se ejecutan en tiempo constante mediante comprobaciones de cadenas indexadas de tipo starts-with/contains, que se traducen en consultas SQL `LIKE` de alto rendimiento.",
      settingsTitle: "Configuraciones del Inquilino",
      settingsIntro:
        "Cada inquilino tiene una entidad TenantSettings 1:1 con 4 grupos de configuración.",
      quotaGroup: "Configuraciones de Cuotas",
      securityGroup: "Política de Seguridad",
      auditGroup: "Configuración de Auditoría",
      brandingGroup: "Personalización de Marca (Branding)",
      autoRoleTitle: "Creación Automática de Roles",
      autoRoleIntro:
        "La creación de un inquilino aprovisiona dinámicamente roles y una cuenta de administrador dentro de una transacción atómica. Los roles creados son `{CODE}_SUPER_ADMIN` y `{CODE}_DEFAULT`. El rol Super Admin sigue una transición de estado de bloqueo: durante el aprovisionamiento, se desbloquea (`IsPermissionLocked = false`) para configurar los permisos iniciales a través de la asignación de la edición del plan antes de pasar a un estado bloqueado (`IsPermissionLocked = true`) que impide modificaciones posteriores.",
      cascadeDeleteTitle: "Protección contra Borrado en Cascada",
      cascadeDeleteIntro:
        "La eliminación del inquilino aplica estrictos filtros de seguridad. Si existen descendientes, la eliminación se bloquea a menos que la solicitud establezca `CascadeChildren` en `true`. La ejecución valida la regla del plan `Identity.CascadeDelete.Enabled`, el permiso RBAC `tenants.cascade_delete`, y realiza una eliminación ascendente en orden inverso (los hijos más profundos primero) junto con eliminaciones lógicas en bloque y limpieza inmediata de tablas de unión (dominios, permisos directos) para evitar dominios huérfanos, seguido de la reconciliación de cuotas del padre.",
      permissionInheritanceTitle: "Herencia de Permisos",
      permissionInheritanceIntro:
        "Un inquilino hijo nunca puede tener más permisos que su inquilino padre; la lista disponible se filtra en cascada.",
      endpointsTitle: "Endpoints de Inquilinos",
      endpointsCrudTitle: "Endpoints CRUD",
      endpointsHierarchyTitle: "Endpoints de Jerarquía",
      endpointsSettingsTitle: "Endpoints de Configuración",
      endpointsPermissionsTitle: "Endpoints de Permisos",
      endpointsDrilldownTitle: "Endpoints de Desglose (Drill-Down)",
      logoTip:
        "Los logos de los inquilinos se sirven a través del middleware de archivos estáticos en /storage/tenants/{tenantId}/logo.{ext}.",
      domainTitle: "Gestión de Dominios",
      domainIntro:
        "Cada inquilino puede tener múltiples dominios — un subdominio generado automáticamente al crear el inquilino, además de dominios personalizados opcionales agregados por los administradores. El sistema soporta verificación de dominio basada en DNS para probar la propiedad de dominios personalizados antes de que se activen. Toda la configuración relacionada con dominios está completamente externalizada en appsettings.json, permitiendo rebranding sin fricciones y configuraciones de multi-despliegue.",
      domainTypesTitle: "Tipos de Dominio",
      domainArchTitle: "Arquitectura de Resolución de Dominios",
      domainArchIntro:
        "Las solicitudes entrantes resuelven el contexto del inquilino a través del hook cliente `useTenantResolution` y el manejador de consultas del servidor `ResolveTenantByDomainQueryHandler`. El cliente comprueba si el nombre de host es un dominio local/de plataforma, o en su defecto consulta la API. El servidor busca en la tabla TenantDomain, verifica `IsVerified == true`, realiza una fusión de la marca de inicio de sesión del inquilino, o recurre a los parámetros de consulta `?code=` en modo desarrollo.",
      domainDnsTitle: "Flujo de Verificación DNS",
      domainDnsIntro:
        "Los dominios personalizados requieren verificación DNS para probar la propiedad. Cuando un administrador agrega un dominio personalizado, el sistema genera un token de verificación único. El administrador configura dos registros DNS: un registro CNAME apuntando el dominio al CnameTarget del plataforma, y un registro TXT en {VerificationPrefix}.{domain} conteniendo el token de verificación. Una vez configurado, hacer clic en 'Verificar' activa una consulta DNS para confirmar que ambos registros están presentes.",
      domainDnsNote:
        "La verificación DNS es actualmente un proceso dirigido por la interfaz de usuario donde el administrador hace clic en 'Verificar' para activar la comprobación. El backend está listo para la integración completa de resolución DNS. Los dominios generados automáticamente omiten la verificación por completo — siempre son de confianza.",
      domainConfigTitle: "Dominio de Plataforma Configurable",
      domainConfigIntro:
        "Cada valor relacionado con dominios es configurable a través de la sección Tenancy en appsettings.json. Esto significa que puede cambiar la marca de toda la plataforma — cambiando el dominio base, el destino CNAME, el prefijo de verificación y el prefijo de token — editando un solo bloque de configuración. Cero cambios de código requeridos. El backend inyecta TenancySettings a través de IOptions<T>, y el frontend recibe el destino CNAME y el prefijo de verificación de la respuesta API GET /domains.",
      domainConfigTip:
        "Para desplegar en un dominio completamente diferente (ej. myplatform.io en lugar de scripe.com), simplemente actualice los 4 valores en appsettings.json. Todos los subdominios generados automáticamente, instrucciones DNS y tokens de verificación usarán automáticamente los nuevos valores.",
      domainEndpointsTitle: "Endpoints de API de Dominios",
    },
    rolePermissions: {
      title: "Roles y Permisos (RBAC)",
      description:
        "Sistema RBAC con sobreescritura de alcance (scope override), restricciones a nivel de campo, anti-escalada y roles a nivel de inquilino.",
      intro:
        "SCRIPE implementa un sistema RBAC (Control de Acceso Basado en Roles) completo y altamente optimizado con permisos modulares basados en categorías, sobreescrituras de alcance, restricciones a nivel de campo (FLS) y delimitación por inquilino. Los permisos se cargan dinámicamente desde proveedores, se almacenan en caché del lado del servidor usando IMemoryCache y se validan mediante verificadores programáticos.",
      hierarchyTitle: "Jerarquía de Permisos",
      systemTitle: "Sistema de Permisos",
      systemIntro:
        "Los permisos siguen una convención de nomenclatura estricta {Resource}.{Action}. En lugar de declaraciones estáticas, cada módulo de backend define sus permisos implementando IModulePermissionProvider (por ejemplo, IdentityPermissionProvider, CompliancePermissionProvider). Al iniciar la aplicación, estos proveedores se descubren automáticamente y el DatabaseSeeder utiliza PermissionSeeder.SyncFromProvidersAsync para sincronizar e inicializar los permisos en la base de datos.",
      scopeOverrideTitle: "Sobreescritura de Alcance (Control de Acceso a Datos)",
      scopeOverrideIntro:
        "Cada RolePermission puede sobreescribir el alcance predeterminado de un permiso a través del campo ScopeOverride. El DataScopeService resuelve el alcance efectivo utilizando una lista de prioridad estricta: 1) Contexto de exploración (claim ContextTenantId), 2) Sobreescritura de alcance de RolePermission, 3) Verificación de modo Dios (SystemProtectedAdmin), 4) Bandera de jerarquía (IncludeChildTenants), 5) Inquilino asignado, 6) Reserva global. Cuando se asignan múltiples roles, AdminSecurityService.GetWidestScope resuelve el alcance más amplio: all_tenants > hierarchy > own_tenant > own. Para evitar fugas de privilegios, los administradores de inquilinos están estrictamente limitados a su propia subjerarquía durante la resolución del alcance.",
      authPipelineTitle: "Pipeline de Autorización",
      authPipelineIntro:
        "La autorización está desacoplada de las configuraciones estáticas. El DynamicPermissionPolicyProvider construye dinámicamente políticas de autorización de ASP.NET Core para rutas que contienen el atributo [PermissionRequired]. Para mantener el tamaño del token JWT por debajo de los 400 bytes, los permisos de los usuarios no se almacenan en los claims, sino que se guardan en el caché del servidor mediante AdminPermissionCache (con una expiración deslizante de 10 minutos). El almacenamiento en caché utiliza un CancellationTokenSource central para una invalidación global segura entre hilos ante cualquier modificación de roles. Las verificaciones programáticas se realizan en los controladores y servicios a través de la interfaz IPermissionChecker.",
      restrictedFieldsTitle: "Restricciones a Nivel de Campo",
      restrictedFieldsIntro:
        'La seguridad a nivel de campo (FLS) permite a los administradores restringir campos específicos de una entidad para roles determinados. Los campos restringidos se configuran como un arreglo JSON de rutas de cadenas (por ejemplo, ["salary", "ssn"]) y se almacenan en la columna RestrictedFieldsJson (varchar/nvarchar/VARCHAR2 de hasta 2000 caracteres) de la tabla RolePermission. Durante la ejecución, el RestrictedFieldsAuthorizationFilter identifica el recurso de destino y establece HttpContext.Items["RestrictedFields"]. El FieldProjectionMiddleware intercepta las respuestas JSON HTTP 2xx, analiza el cuerpo en un árbol de JsonNode y anula recursivamente las propiedades restringidas que coincidan con la ruta exacta o relativa (por ejemplo, address.street) para evitar la sobrecarga de reflexión.',
      cloneRoleTitle: "Clonar Rol (Anti-Escalada)",
      cloneRoleIntro:
        "Para evitar la escalada de privilegios, el CloneRoleCommandHandler filtra la lista de permisos copiados frente a los propios permisos activos del clonador, descartando silenciosamente los permisos no poseídos. En el comando de asignación de permisos, intentar agregar explícitamente permisos que el administrador no posee arroja un error Forbidden role.permissionEscalation. Además, el TenantGuardianService valida todas las actualizaciones de roles y bloquea cualquier cambio en los roles críticos del sistema bloqueados (IsPermissionLocked == true).",
      rolePropertiesTitle: "Propiedades de la Entidad Rol",
      rolePropertiesIntro:
        "Cada rol tiene banderas del sistema que controlan su comportamiento (IsSuperAdmin, IsDefaultRole).",
      endpointsTitle: "Endpoints de Roles",
      endpointsMyTenantTitle: "Endpoints de Mi Inquilino",
      endpointsPermissionsTitle: "Endpoints de Permisos",
      tenantScopingNote:
        "Los roles están automáticamente limitados al inquilino del usuario actual.",
      userGroupsTitle: "Grupos de Usuarios",
      userGroupsIntro:
        "Los Grupos de Usuarios permiten la asignación por lotes de roles y restricciones de campo a múltiples administradores a la vez.",
      userGroupEndpointsTitle: "Endpoints de Grupos de Usuarios",
      userGroupsNote:
        "Los grupos de usuarios son aditivos: los permisos efectivos son la UNIÓN de los roles directos y los heredados por el grupo.",
    },
    auditSystem: {
      title: "Sistema de Auditoría",
      description:
        "Pipeline de múltiples fuentes, mapeos de rastreadores de cambios, índices de base de datos, SignalR en tiempo real y exportación en CSV/Excel/PDF.",
      intro:
        "SCRIPE captura cada acción significativa en el registro de auditoría a través de un pipeline desacoplado de solicitudes y bases de datos, que incluye registro de solicitudes HTTP, seguimiento de mutaciones de EF Core y registro de seguridad. Todos los eventos se transmiten en tiempo real a los clientes conectados por SignalR a grupos con ámbito de inquilino.",
      architectureTitle: "Arquitectura de Auditoría",
      pipelineDetail:
        "La auditoría de solicitudes HTTP es manejada por el RequestLoggingMiddleware. Captura el contexto de la solicitud (método HTTP, ruta, IP remota, User-Agent, reclamos de usuario e ID de correlación) de forma síncrona en el hilo de solicitud antes de que se recicle el HttpContext, y luego invoca el AuditService de forma asíncrona en una tarea en segundo plano Task.Run para evitar bloquear solicitudes. Se omiten las rutas de infraestructura y se suprimen las solicitudes GET exitosas por defecto a menos que se configure lo contrario.",
      changeTrackingTitle: "Interceptación de mutaciones de entidades",
      changeTrackingDetail:
        "El AuditableEntityInterceptor rastrea los cambios a nivel de base de datos antes de que se guarden. Intercepta SaveChangesAsync y escanea el ChangeTracker en busca de entidades que implementen IAuditable o ISoftDeletable. Para las creaciones, captura todos los campos. Para las modificaciones, realiza un diff de propiedades, guardando solo los campos modificados. Para eliminaciones físicas, captura todos los valores originales. Para eliminaciones lógicas (Soft Delete), intercepta la entidad antes de que sea modificada por el DbContext y registra un evento de eliminación especial. También ignora la entidad AuditLog en sí para evitar recursividad infinita.",
      databaseSchemaTitle: "Esquema de base de datos e índices de múltiples proveedores",
      databaseSchemaDetail:
        "La entidad AuditLog está respaldada por índices de alto rendimiento en Timestamp, UserId, EventType, CorrelationId, TenantId y claves compuestas para consultas comunes (Endpoint+Timestamp, EventType+Timestamp y TenantId+Timestamp). Los tipos de datos se asignan correctamente en SQL Server, PostgreSQL y Oracle (usando bit/boolean/NUMBER(1) y Guid/uuid/RAW(16) respectivamente).",
      eventTypesTitle: "Tipos de Eventos (Más de 35 Categorías)",
      authEventsTitle: "Eventos de Autenticación",
      rbacEventsTitle: "Eventos RBAC",
      twoFactorEventsTitle: "Eventos 2FA",
      sessionEventsTitle: "Eventos de Sesión",
      adminEventsTitle: "Eventos de Gestión de Admins",
      bulkEventsTitle: "Eventos de Operaciones en Lote (Bulk)",
      tenantEventsTitle: "Eventos de Inquilinos",
      guardianTitle: "Eventos de Protección Guardian",
      guardianIntro:
        "Los eventos Guardian son registros creados cuando el sistema BLOQUEA una operación peligrosa, como borrar al último super administrador.",
      serviceMethodsTitle: "Métodos del AuditService",
      serviceMethodsIntro:
        "La interfaz IAuditService expone 3 métodos de registro especializados que recopilan métricas de solicitudes, mutaciones a nivel de base de datos y registros de seguridad de forma asíncrona para evitar bloquear el pipeline.",
      realTimeTitle: "Transmisión en Tiempo Real (SignalR)",
      realTimeIntro:
        "Cada evento de auditoría se transmite en tiempo real a los clientes conectados agrupados por su inquilino, habilitando dashboards en vivo. Los eventos se envían tanto al grupo del inquilino como a un grupo global para superadministradores.",
      exportTitle: "Exportación de Auditoría",
      exportIntro:
        "Exportación en formatos CSV, Excel y PDF de los registros filtrados, respetando la seguridad multitenencia.",
      exportDetail:
        "El AuditExportService proporciona exportaciones multiformato. La exportación CSV utiliza CsvHelper con comillas forzadas alrededor de todos los campos para evitar la inyección de CSV (RFC 4180) y un prefijo UTF-8 BOM para Excel. La exportación a Excel genera un libro de ClosedXML con tres hojas detalladas: Executive Summary (KPI y estadísticas), Audit Data (con filtros automáticos, cabeceras congeladas y formato condicional verde/rojo) y Security Analysis. La exportación PDF utiliza el motor de QuestPDF, el cual está marcado como Obsoleto para grandes conjuntos de datos debido al consumo de memoria. Para proteger los recursos, todas las exportaciones están limitadas a un máximo de 10,000 filas y se cargan en memoria antes de la transmisión.",
      endpointsTitle: "Endpoints de Auditoría",
      retentionTip:
        "Los registros se retienen por inquilino. Un proceso en segundo plano de Hangfire los purga automáticamente según la configuración.",
    },
    notificationSystem: {
      title: "Sistema de Notificaciones",
      description:
        "Entrega de notificaciones en tiempo real vía SignalR con unión automática a grupos y recuento de no leídos.",
      architectureTitle: "Arquitectura de Notificaciones",
      architectureIntro:
        "Persistencia en la base de datos simultánea con el envío (push) instantáneo al navegador del usuario a través del NotificationHub.",
      hubTitle: "NotificationHub",
      hubIntro:
        "Hub fuertemente tipado de SignalR que agrupa a los usuarios en su espacio personal y actualiza los recuentos al instante.",
      autoJoinTitle: "Patrón de Unión Automática (Auto-Join)",
      clientInterfaceTitle: "Interfaz del Cliente del Hub",
      serviceTitle: "Métodos del NotificationService",
      endpointsTitle: "Endpoints de Notificaciones",
    },
    emailSystem: {
      title: "Sistema de Correo Electrónico",
      description:
        "Pipeline conectable de envío de correos con estrategias de cola, procesamiento en segundo plano y saneamiento HTML.",
      architectureTitle: "Arquitectura del Pipeline de Correos",
      architectureIntro:
        "Usa InMemoryQueue para desarrollo local y HangfireQueue para entornos de producción para garantizar entregas en segundo plano.",
      endpointsTitle: "Endpoints del Controlador de Correos",
      queueTitle: "Implementaciones de Colas (Queues)",
      queueIntro:
        "La estrategia de cola determina cómo se procesan y encolan los correos para evitar bloqueos del servidor API.",
      senderTitle: "Estrategias de Envío",
      senderIntro:
        "El SmtpSender entrega a la red real, mientras el ConsoleSender simplemente los imprime para las pruebas locales.",
      backgroundTitle: "Patrón de Trabajador en Segundo Plano (Background Worker)",
      backgroundIntro:
        "Cada correo encolado crea un trabajo en Hangfire con su propio renderizado de plantillas y reintentos automáticos.",
      errorTitle: "Manejo de Errores y Saneamiento",
      errorIntro:
        "Los correos electrónicos se sanean para prevenir ataques XSS antes del envío, utilizando retroceso exponencial (exponential backoff) en fallos.",
      pipelineTitle: "Canalización de Envío de Correo Electrónico",
      pipelineIntro:
        "Arquitectura asíncrona de distribución con soporte multiproveedor y conmutación automática por fallo.",
      inMemoryTitle: "Simulador de Correo en Memoria para Desarrollo",
      hangfireTitle: "Gestión de Trabajos en Segundo Plano con Hangfire",
      sendersTitle: "Proveedores de Envío Compatibles",
      senderNote: "Compatibilidad nativa con servidores SMTP, SendGrid, Mailgun y Amazon SES.",
      workerTitle: "Procesadores en Segundo Plano",
      sanitizerTitle: "Desinfección de Plantillas y Protección XSS",
      sanitizerIntro:
        "Limpieza automática de scripts y etiquetas peligrosas en los correos antes de proceder al despacho.",
    },
    webhookSystem: {
      title: "Sistema de Webhooks",
      description:
        "Webhooks impulsados por eventos con rotación HMAC (24h de gracia), suscripciones jerárquicas y prevención de fallos (Circuit Breaker).",
      architectureTitle: "Arquitectura de Webhooks",
      architectureIntro:
        "Permite integraciones externas entregando cargas (payloads) de eventos. Cada carga está firmada con HMAC-SHA256.",
      entityTitle: "Entidad WebhookSubscription",
      hmacTitle: "Firma HMAC",
      hmacIntro:
        "El receptor puede verificar la autenticidad validando el encabezado X-Webhook-Signature.",
      secretRotationTitle: "Rotación de Secretos (Período de Gracia de 24h)",
      secretRotationIntro:
        "Mantiene el secreto antiguo válido por 24 horas mientras usa el nuevo, para evitar interrupciones durante la migración de claves.",
      includeChildrenTitle: "Suscripciones de Jerarquía de Inquilinos",
      includeChildrenIntro:
        "Si se habilita IncludeChildren, un inquilino padre recibe webhooks de su propia actividad y de todas sus sucursales.",
      circuitBreakerTitle: "Interruptor de Circuito (Desactivación Automática)",
      circuitBreakerIntro:
        "Si la URL de destino falla demasiadas veces seguidas, la suscripción se desactiva automáticamente para proteger el sistema.",
      retryTitle: "Política de Reintentos",
      retryIntro: "Retroceso exponencial en los reintentos tras un fallo de entrega (400s y 500s).",
      deliveryLogsTitle: "Registros de Entrega",
      deliveryLogsIntro:
        "Cada intento de entrega de Webhook se registra en detalle (estado, duración, respuesta) para propósitos de depuración.",
      eventsTitle: "Tipos de Eventos de Webhook",
      endpointsTitle: "Endpoints de Webhooks",
      endpointsManagementTitle: "Gestión de Suscripciones",
      endpointsOperationsTitle: "Operaciones y Monitoreo",
    },
    menuSystem: {
      title: "Sistema de Menú",
      description:
        "Árbol de menú dinámico con filtrado de permisos, alcance por inquilino, visibilidad por rol y reordenamiento de arrastrar y soltar.",
      architectureTitle: "Arquitectura del Menú",
      architectureIntro:
        "Estructura de árbol autorreferenciada (ParentMenuItemId) que pasa por un pipeline de 6 filtros de seguridad.",
      entityTitle: "Entidad MenuItem",
      endpointsTitle: "Endpoints de Menú",
      filteringTitle: "Pipeline de Filtrado de Menú",
      filteringIntro:
        "Al solicitar su menú (/menus/my), un usuario pasa por 6 filtros estrictos que aseguran que solo vea lo permitido por su rol.",
      overrideTitle: "Sistema de Sobreescritura (Override)",
      overrideNote:
        "Las anulaciones/sobreescrituras del usuario tienen prioridad sobre las configuraciones del inquilino, permitiendo personalizar la barra lateral libremente.",
      reorderTitle: "Reordenar con Arrastrar y Soltar (Drag & Drop)",
      customDomainTitle: "Compatibilidad con Dominios Personalizados en Menús",
      customDomainIntro:
        "Adaptación en tiempo real de hipervínculos y rutas internas al navegar mediante dominios propios de cada inquilino.",
    },
    recycleBin: {
      title: "Papelera de Reciclaje",
      description:
        "Gestión de borrado lógico (soft-delete) con restauración en cascada, operaciones masivas y limpieza permanente (purge).",
      softDeleteTitle: "Cómo funciona el Borrado Lógico",
      softDeleteIntro:
        "La bandera IsDeleted se activa y los filtros globales de EF Core ocultan la entidad, dejándola segura en la base de datos.",
      ignoreFiltersTitle: "Patrón IgnoreQueryFilters",
      ignoreFiltersWarning:
        "Usar IgnoreQueryFilters() salta todos los filtros. Si se usa, SIEMPRE acompáñalo de .Where(t => t.TenantId) para no filtrar datos de otros inquilinos.",
      cascadeTitle: "Restauración en Cascada",
      cascadeIntro:
        "Al restaurar un elemento principal (como un inquilino), todas sus entidades dependientes se restauran ágilmente mediante ExecuteUpdateAsync.",
      executeUpdateTitle: "ExecuteUpdateAsync vs EF Tradicional",
      interceptorNote:
        "ExecuteUpdateAsync evita cargar entidades en la RAM, lo que hace que sea muy rápido, pero los logs de auditoría deben registrarse manualmente.",
      endpointsTitle: "Endpoints de Papelera de Reciclaje",
      purgeVsRestoreTitle: "Purgar vs Restaurar",
      purgeWarning:
        "Purgar es irreversible (DELETE real) usado principalmente para cumplimiento GDPR o cuando se tiene certeza de la destrucción del dato.",
      restorationTitle: "Recuperación Íntegra de Registros Eliminados",
      restorationIntro:
        "Restauración de entidades manteniendo sus relaciones intactas y registrando la acción en el registro de auditoría.",
    },
    userManagement: {
      title: "Gestión de Usuarios",
      description:
        "Ciclo de vida completo de admins/usuarios con operaciones masivas, suplantación (impersonation) y reglas de protección.",
      adminVsUserTitle: "Modelo de Admin vs Usuario",
      adminVsUserIntro:
        "Separación estricta de cuentas: Administradores (gestionan la plataforma) frente a Usuarios (consumen la app del inquilino).",
      crudTitle: "Endpoints CRUD de Administradores",
      accountOpsTitle: "Operaciones de la Cuenta",
      roleMgmtTitle: "Gestión de Roles",
      bulkOpsTitle: "Operaciones Masivas (Bulk)",
      enterpriseOpsTitle: "Operaciones Enterprise",
      protectedTitle: "Reglas de Administradores Protegidos",
      protectedIntro:
        "Cada inquilino tiene un administrador de recuperación protegido contra borrados y bloqueos accidentales.",
      nukePaveTitle: "Patrón Nuke & Pave",
      nukePaveTip:
        "Usar PUT /admins/{id}/roles/sync reemplaza todo de un golpe, eliminando problemas de sincronización de la base de datos con la UI de casillas de verificación.",
      registerValidationTitle: "Validación Rigurosa de Registro",
      registerValidationIntro:
        "Comprobación de unicidad de cuentas, robustez de claves y políticas del inquilino antes del alta.",
      invitationTitle: "Invitaciones con Caducidad Temporal",
      invitationIntro:
        "Enlaces seguros con token de expiración para que los nuevos colaboradores configuren su contraseña.",
    },
    fileUpload: {
      title: "Sistema de Subida de Archivos",
      description:
        "Pipeline de subida dual para imágenes y documentos con validación, procesamiento y almacenamiento vinculado al inquilino.",
      architectureTitle: "Arquitectura de Subidas",
      architectureIntro:
        "El sistema separa las rutas de ImageUploadController (redimensionado, formato) de UploadsController (archivos generales, adjuntos).",
      imagePipelineTitle: "Pipeline de Subida de Imágenes",
      validationTitle: "Reglas de Validación de Archivos",
      generalTitle: "Subida de Archivos Generales",
      servingTitle: "Servicio de Archivos Estáticos",
      servingNote:
        "Los archivos estáticos usan StaticFileMiddleware devolviendo application/octet-stream para tipos desconocidos, previniendo ataques MIME-sniffing.",
      tenantScopedTitle: "Almacenamiento por Inquilino",
      chunkedUploadsTitle: "Carga Segmentada de Archivos Pesados",
      chunkedUploadsIntro:
        "División de archivos grandes en bloques con reanudación automática ante microcortes de conexión.",
      storageProvidersTitle: "Sistemas de Almacenamiento Adaptables",
      storageProvidersIntro:
        "Integración directa con Azure Blob Storage, AWS S3 y almacenamiento local cifrado.",
    },
    downloadExport: {
      title: "Sistema de Descarga y Exportación",
      description:
        "Descargas autenticadas y basadas en sesión con soporte Range, almacenamiento en caché ETag y prevención de salto de directorios.",
      architectureTitle: "Arquitectura de Descargas",
      architectureIntro:
        "Soporta enlaces de descarga autenticados por JWT y enlaces temporales de sesión externa sin autenticación.",
      endpointsTitle: "Endpoints de Descarga",
      resumableTitle: "Descargas Reanudables (Cabeceras Range)",
      resumableIntro:
        "El soporte Range permite descargas pausables (código 206) enviando byte ranges en lugar del archivo completo a la vez.",
      etagTitle: "Almacenamiento en Caché ETag",
      etagNote:
        "Evita transferir archivos que el cliente ya tiene descargados y sin modificar, ahorrando ancho de banda (304 Not Modified).",
      sessionTitle: "Descargas basadas en Sesión",
      sessionIntro:
        "Genera una URL compartible de validez temporal (por ejemplo, 1 hora) para usuarios externos.",
      sessionWarning:
        "Las sesiones expiran y no son renovables; debes crear una nueva URL de sesión si caduca.",
      pathTraversalTitle: "Prevención de Path Traversal",
      pathTraversalNote:
        "Todos los nombres de archivos pasan por un saneamiento riguroso para evitar ataques de salto de directorio (..).",
      streamConfigTitle: "Configuración de FileStream",
      sessionTokenTitle: "Tokens Temporales de Descarga Segura",
      sessionTokenIntro:
        "Generación de enlaces de acceso de corta duración para evitar filtraciones de documentos protegidos.",
      exportEnginesTitle: "Motores de Exportación Multiformato",
      exportEnginesIntro:
        "Generación eficiente de archivos Excel, CSV y PDF aplicando los filtros de permisos del usuario.",
    },
    messageTemplates: {
      title: "Plantillas de Mensajes",
      description:
        "Plantillas bilingües impulsadas por Scriban con vista previa y esquemas de variables de posición.",
      architectureTitle: "Arquitectura de Plantillas",
      architectureIntro:
        "Proporciona una forma centralizada de definir y reemplazar variables para correos electrónicos, Webhooks y Notificaciones usando el motor Scriban (sintaxis similar a Liquid).",
      syntaxTitle: "Sintaxis de Plantillas Scriban",
      builtInTitle: "Plantillas Integradas",
      entityTitle: "Entidad MessageTemplate",
      rendererTitle: "Renderizador de Plantillas",
      endpointsTitle: "Endpoints de Plantillas",
      previewTitle: "Función de Vista Previa",
      previewIntro:
        "Inyecta datos falsos en la plantilla para validar que la sustitución de variables y el estilo HTML se vean correctamente antes de cualquier envío masivo.",
      placeholderTitle: "Marcadores Dinámicos en Plantillas",
      placeholderIntro:
        "Reemplazo contextual de variables como nombres, fechas y enlaces en el momento del envío.",
      versionTitle: "Historial de Versiones y Reversión",
      versionIntro:
        "Seguimiento exhaustivo de modificaciones en plantillas con opción de restaurar versiones previas al instante.",
    },
    userGroups: {
      title: "Grupos de Usuarios (User Groups)",
      description:
        "Asignación de roles y restricciones basada en grupos con delimitación de inquilino (tenant), gestión de miembros y fusión aditiva al iniciar sesión.",
      intro:
        "Los grupos de usuarios proporcionan una forma escalable de asignar roles y restricciones a nivel de campo a una gran cantidad de administradores. En lugar de asignar roles individualmente a cada administrador, usted crea un grupo, le agrega roles y restricciones, y luego agrega administradores como miembros. Todos los miembros heredan automáticamente los roles y restricciones del grupo en su próximo inicio de sesión.",
      architectureTitle: "Arquitectura",
      architectureIntro:
        "Cada UserGroup pertenece a un inquilino y tiene enlaces de unión: AdminUserGroup para miembros, UserGroupRole para roles y UserGroupRestriction para la seguridad a nivel de campo (FLS). Las relaciones están configuradas con Cascade Delete en el lado de UserGroup, por lo que eliminar un grupo elimina automáticamente los enlaces de miembros, roles y restricciones. Sin embargo, un Restrict Delete en el lado de Tenant evita la eliminación de un inquilino que contenga grupos de usuarios activos.",
      domainModelTitle: "Modelo de Dominio & Configuraciones",
      domainModelIntro:
        "La funcionalidad de grupos de usuarios utiliza cuatro entidades de dominio: UserGroup (raíz agregada), AdminUserGroup (unión de muchos a muchos), UserGroupRole (unión de muchos a muchos) y UserGroupRestriction (restricciones de campo). Las configuraciones de la base de datos imponen índices compuestos únicos en {TenantId, Code} para UserGroup, {AdminId, UserGroupId} para AdminUserGroup y {UserGroupId, RoleId} para UserGroupRole para evitar mapeos duplicados.",
      howItWorksTitle: "Cómo Funciona al Iniciar Sesión",
      howItWorksIntro:
        "Durante la autenticación, el AdminRepository implementa un patrón de proyección de consulta única (GetWithRolesAsync) para recuperar roles y restricciones directos y heredados de grupos en un solo viaje de ida y vuelta a la base de datos. Los roles heredados de grupos se proyectan en instancias sintéticas de AdminRole (con Id = Guid.Empty) y se añaden a la colección de roles del administrador. Luego, el AdminSecurityService realiza una fusión de unión aditiva de las restricciones de campo a nivel de rol y de grupo (donde 'el rechazo gana' para FLS).",
      mergeNote:
        "Los roles y restricciones de grupo son aditivos: solo pueden expandir las restricciones efectivas de un administrador, nunca eliminar las asignaciones de roles directas. Esto coincide con el principio de seguridad 'el rechazo gana' (Deny Wins).",
      memberManagementTitle: "Gestión de Miembros",
      memberManagementIntro:
        "Agregar miembros es idempotente: enviar un ID de administrador que ya es miembro tiene éxito silenciosamente. Eliminar un miembro elimina el registro de unión; el administrador conserva todos los roles asignados directamente. La lista de miembros se puede consultar con los metadatos del administrador (nombre, correo electrónico, estado).",
      roleAssignmentTitle: "Asignación de Roles",
      roleAssignmentIntro:
        "Los roles de grupo utilizan un patrón de reemplazo total (PUT reemplaza todo). Esto garantiza que la base de datos coincida exactamente con el estado de la interfaz de usuario. Cada rol debe pertenecer al mismo inquilino que el grupo. Los roles asignados a través de grupos aparecen junto a los roles directamente asignados en el conjunto de permisos efectivos del administrador.",
      restrictionsTitle: "Restricciones de Campo",
      restrictionsIntro:
        "Las restricciones de grupo siguen el mismo modelo que RestrictedFields a nivel de rol. Cada restricción se dirige a un código de permiso específico y enumera los campos a ocultar. Al iniciar sesión, el sistema realiza la UNIÓN de todos los campos restringidos a través de los roles directos y todos los grupos miembros: si cualquier fuente restringe 'salary', se restringirá independientemente de otras asignaciones.",
      cascadeTitle: "Operaciones en Cascada",
      cascadeIntro:
        "Los grupos de usuarios admiten operaciones masivas (activar, desactivar, eliminar y sus variantes -all basadas en filtros). Si cascadeAdmins está habilitado, la desactivación o eliminación lógica (Soft Delete) se extiende a los miembros del grupo. Las operaciones en cascada omiten automáticamente a los administradores protegidos (como el creador del inquilino). Si cascadeAdmins es false, cualquier administrador huérfano que pierda todas las asignaciones de roles se transfiere automáticamente al rol de respaldo SYSTEM_DEFAULT.",
      cascadeNote:
        "Las operaciones en cascada omiten automáticamente a los administradores protegidos (como el creador del inquilino). Esto garantiza que una eliminación masiva de grupos no pueda borrar accidentalmente la cuenta de recuperación principal del inquilino.",
      endpointsTitle: "Endpoints de la API (18)",
      frontendTitle: "Módulo Frontend",
      frontendIntro:
        "El frontend utiliza un patrón MVVM limpio. UserGroupService se comunica con el backend, UserGroupRepository valida los contratos con la verificación del esquema Zod (UserGroupModelSchema) y UserGroupMapper mapea los DTO de respuesta. El useUserGroupsViewModel coordina los estados CRUD, incluidos los controladores de estado personalizados deleteDialog y statusDialog para acciones en cascada.",
      securityNote:
        "Los grupos de usuarios están delimitados por inquilino. Los SuperAdmins ven todos los grupos de todos los inquilinos. Los administradores de inquilino solo pueden administrar grupos dentro de su propio inquilino. Todas las mutaciones se auditan y requieren el conjunto de permisos user_groups.*.",
    },
    ssoOauth: {
      samlTitle: "Autenticación Empresarial SAML 2.0",
      samlContent:
        "Acceso único empresarial (SSO) compatible con proveedores de identidad corporativos.",
      oidcCallbackTitle: "Gestión de Respuestas OpenID Connect",
      oidcCallbackContent:
        "Validación segura de tokens de identidad e intercambio criptográfico de códigos de autorización.",
      oauthMirroringTitle: "Sincronización de Perfiles OAuth",
      oauthMirroringContent:
        "Actualización automática de nombres y avatares del usuario desde el proveedor externo al iniciar sesión.",
      title: "Servidor SSO y OAuth (Alternativa a Keycloak)",
      description:
        "Servidor de autenticación de nivel empresarial capaz de reemplazar a Keycloak, Okta y Auth0. Proveedores de identidad OIDC nativos, registro de aplicaciones OAuth, aplicación de PKCE y federaciones de inquilinos aisladas.",
      intro:
        "SCRIPE no es solo una aplicación; es un servidor de administración de identidad y acceso (IAM) empresarial basado en OpenIddict. Opera de manera equivalente a Keycloak, actuando tanto como parte usuaria (cliente) OIDC y como servidor de autorización activo OAuth2/OIDC. Los inquilinos pueden autenticarse hacia el exterior con Azure AD/Google, o hacia el interior registrando sistemas de terceros que se autentican contra SCRIPE.",
      overviewTitle: "Características Empresariales IAM",
      feat1Title: "Proveedores de Identidad Federados (IdP)",
      feat1Desc:
        "Vincule de inmediato proveedores de identidad OIDC/OAuth2 externos a inquilinos específicos. Integración sin código para Azure AD, Google, Okta, Auth0, AWS Cognito o cualquier sistema compatible con OIDC personalizado.",
      feat2Title: "SCRIPE como Servidor (Apps OAuth)",
      feat2Desc:
        "Reemplace Keycloak. Registre sistemas de negocio de terceros directamente en SCRIPE. Genere identificadores de cliente y secretos, controle los alcances y emita JWT de nivel empresarial respaldados por el almacén de identidades de SCRIPE.",
      feat3Title: "Seguridad y PKCE Estrictos",
      feat3Desc:
        "El Flujo Implícito ha sido erradicado. Toda la autenticación, tanto interna como externa, se aplica estrictamente mediante Proof Key for Code Exchange (PKCE) en Flujos de Código de Autorización. Los secretos nunca se exponen al navegador.",
      feat4Title: "Aislamiento IAM Multi-Inquilino",
      feat4Desc:
        "Cada inquilino es su propio reino IAM aislado. Los inquilinos administran sus propios proveedores SSO externos y emiten credenciales para sus propias aplicaciones OAuth sin tocar la infraestructura raíz global.",
      configTitle: "Guía de Configuración IAM",
      configContent: "Configurando SCRIPE como su puerta de enlace principal de autenticación:",
      config1Title: "1. Vincular un Proveedor de Identidad Externo",
      config1Content:
        "Vaya a /settings/identity-providers. Ingrese la URL de Authority, Client ID y Client Secret de Azure AD o Google. SCRIPE negocia automáticamente la configuración y los metadatos de OIDC.",
      config2Title: "2. Mapeo Automático de Claims",
      config2Content:
        "Configure los alcances solicitados (openid, profile, email). SCRIPE mapea automáticamente los claims del JWT externo (como preferred_username, picture, given_name) a perfiles de Administrador/Usuario internos sin ingreso manual de datos.",
      config3Title: "3. Aplicar Políticas IAM",
      config3Content:
        "Decida si el proveedor es para Administradores (back-office) o Usuarios (front-office). Las vinculaciones de identidad están estrictamente tipadas, evitando que un usuario externo escale a una sesión de administrador.",
      config4Title: "4. Registrar Apps de Terceros",
      config4Content:
        "Vaya a /settings/oauth-apps para convertir a SCRIPE en el proveedor SSO para software externo (ej. su aplicación móvil o CRM). Defina perfiles Públicos (SPA) o Confidentiel (Backend).",
      config5Title: "5. Descubrimiento y Jwks Uri",
      config5Content:
        "Las aplicaciones externas simplemente apuntan su URL Authority a `https://su-instancia-scripe.com`. SCRIPE expone automáticamente los puntos finales `/.well-known/openid-configuration` y `/.well-known/jwks`.",
      managementTitle: "Centro de Control IAM",
      managementContent:
        "SCRIPE proporciona un Centro de Control IAM dedicado dentro de la Configuración del Sistema para la agregación de clientes OIDC y configuración de emisión del Servidor.",
      loginFlowTitle: "Arquitectura OIDC",
      loginFlowContent:
        "Al iniciar sesión en SCRIPE a través de Azure AD: SCRIPE actúa como cliente. Redirige al usuario a Azure, acepta la devolución de llamada, valida el JWT externo y luego emite SU PROPIO JWT interno, desvinculando completamente la autorización interna del proveedor externo.",
      scopingTitle: "Partición de Reinos (Inquilinos)",
      scopingContent:
        "SCRIPE iguala el concepto de Reino de Keycloak a través de las Particiones de Inquilinos. Los proveedores de identidad y las aplicaciones OAuth están estrictamente vinculados a su TenantId. Los SuperAdministradores manejan todos los reinos mediante la capacidad de 'Ingresar al Mundo del Inquilino'.",
      scopingTip:
        "A diferencia de los productos SaaS básicos, SCRIPE no mezcla configuraciones de identidad. Si el Inquilino A se conecta a su Azure AD corporativo, el Inquilino B no tiene visibilidad alguna de esa infraestructura.",
    },
    loginCustomizer: {
      title: "Estudio de Personalización de Login",
      description:
        "Personalización visual de la página de inicio de sesión con 22 diseños, tokens de diseño, controles de superposición/desenfoque, temas claro/oscuro, suite de accesibilidad WCAG AA y vista previa en vivo aislada — sin escribir código.",
      intro:
        "El Estudio de Personalización de Login de SCRIPE es un potente editor visual que permite a los administradores de inquilinos personalizar completamente la experiencia de la página de inicio de sesión sin escribir código. El estudio proporciona una interfaz de panel dividido con paneles de configuración a la izquierda y una vista previa iframe aislada a la derecha, permitiendo retroalimentación visual en tiempo real. El estudio incluye 8 pestañas de configuración: Apariencia, Colores, Tipografía, Fondo, Superposición, Panel de Marca, Accesibilidad y Avanzado. Todas las modificaciones se basan en borradores, requiriendo publicación explícita antes de ir a producción.",
      studioTitle: "Descripción General del Estudio",
      studioIntro:
        "El Estudio utiliza una arquitectura de panel dividido: el panel izquierdo contiene 8 secciones de configuración con pestañas (Apariencia, Colores, Tipografía, Fondo, Superposición, Panel de Marca, Accesibilidad, Avanzado) mientras que el panel derecho proporciona un iframe aislado que renderiza la página de login con inyección de variables CSS en tiempo real vía postMessage. Los controles de dispositivo permiten previsualizar en breakpoints de escritorio, tableta y móvil.",
      studioTip:
        "Todos los cambios del estudio operan en modo borrador. La página de login en producción nunca se ve afectada hasta que haga clic explícitamente en Publicar. Puede experimentar de forma segura con cualquier combinación de configuraciones.",
      layoutsTitle: "22 Diseños de Login",
      layoutsIntro:
        "SCRIPE incluye 22 diseños de login listos para producción organizados en cuatro niveles: los diseños T1 divididos (6) cuentan con un panel de marca dedicado junto al formulario, los diseños T2 de página completa (8) utilizan toda la ventana para experiencias inmersivas, los diseños T3 centrados (4) ofrecen diseños compactos basados en tarjetas, y los diseños T4 especiales (4) proporcionan tratamientos cinematográficos y artísticos. Cada diseño soporta controles independientes de fondo, superposición y accesibilidad.",
      layoutsNote:
        "Los diseños divididos renderizan el componente LoginBranding con controles independientes de superposición/desenfoque en el panel de marca. Los diseños de página completa aplican fondo y superposición al contenedor completo. Los diseños centrados y especiales tienen sus propias estrategias de renderizado. Cambiar de diseño preserva toda la configuración — solo cambia la estructura de renderizado.",
      tokensTitle: "Pipeline de Tokens de Diseño",
      tokensIntro:
        "El sistema de personalización está construido sobre un pipeline completo de tokens de diseño. Las configuraciones del inquilino almacenadas como JSON se transforman en tokens de diseño semánticos, que luego se emiten como propiedades CSS personalizadas y se inyectan en el DOM en vivo. Esta arquitectura asegura estilizado consistente y tipado a través de los 22 diseños, incluyendo 23+ reglas CSS específicas de accesibilidad.",
      bgOverlayTitle: "Controles de Fondo y Superposición",
      bgOverlayIntro:
        "Los controles de fondo y superposición se adaptan según el tipo de diseño seleccionado. Los diseños de página completa aplican fondos y superposiciones al contenedor envolvente, mientras que los diseños divididos limitan los fondos al panel de marca con superposiciones independientes de sección de formulario. Los controles de superposición incluyen color, opacidad (0–100%) y desenfoque (0–20px).",
      bgOverlayWarning:
        "Para diseños divididos, la superposición se limita a la sección del formulario y al panel de marca de forma independiente. Las variables CSS con valor 0 (ej. opacidad) se emiten correctamente — el sistema usa verificaciones != null en lugar de verificaciones de veracidad para evitar eliminar valores cero válidos.",
      themeTitle: "Arquitectura de Tema Claro/Oscuro",
      themeIntro:
        "El Personalizador de Login soporta configuraciones independientes para modo claro y oscuro. Cuando el modo oscuro está activado, se emite un conjunto separado de variables CSS para el panel oscuro (--login-dark-*), controlando fondo del formulario, color del texto, estilo de inputs y superposición. El control de modo oscuro en el panel Apariencia permite control completo del tema oscuro sin afectar la configuración clara.",
      brandingTitle: "Panel de Marca",
      brandingIntro:
        "El Panel de Marca (visible en diseños divididos) proporciona controles dedicados para el lado de marca de la página de login. Soporta logo personalizado, nombre de empresa, texto de encabezado, subtítulo y controles independientes de fondo/superposición. La superposición del panel de marca usa su propio conjunto de variables CSS (--login-panel-overlay-*) para control granular separado de la sección del formulario.",
      draftTitle: "Borrador / Publicar / Revertir",
      draftIntro:
        "El estudio implementa un flujo seguro de Borrador → Vista Previa → Publicar utilizando control de concurrencia optimista. Todos los cambios se guardan como borradores (DraftBrandingJson) hasta que el administrador los publique explícitamente. La publicación incrementa el contador SettingsVersion — las publicaciones concurrentes de otros administradores se rechazan con un conflicto 409. Cualquier versión publicada puede restaurarse desde las instantáneas del registro de auditoría.",
      draftNote:
        "La concurrencia optimista previene la pérdida de datos por edición simultánea. Si otro administrador publica mientras usted edita, su publicación será rechazada (409), y necesitará refrescar y fusionar sus cambios.",
      safeModeTitle: "Modo Seguro",
      safeModeIntro:
        "El Modo Seguro es un respaldo de emergencia que omite toda la marca del inquilino y restaura los valores predeterminados de la plataforma para la página de login. Cuando IsSafeMode está en true en TenantSettings, la página de login se renderiza con el tema SCRIPE predeterminado sin importar la personalización. Esto garantiza una experiencia de login funcional incluso si la configuración de marca se corrompe.",
      accessTitle: "Control de Acceso",
      accessIntro:
        "La personalización del login sigue el modelo de control de acceso basado en roles de SCRIPE. Abrir el Estudio de Personalización requiere el permiso branding.manage. Los Administradores de Sistema y los Administradores de Inquilinos con el permiso apropiado pueden editar y publicar. Los administradores regulares solo pueden alternar preferencias personales como modo claro/oscuro. La activación del modo seguro está restringida solo a Administradores de Sistema.",
      a11yTitle: "Suite de Accesibilidad (WCAG AA)",
      a11yIntro:
        "La pestaña Accesibilidad proporciona una suite completa de 32 configuraciones en 8 categorías, diseñada para hacer la página de login completamente compatible con WCAG AA. Todas las configuraciones se almacenan en la entidad StudioDraft y se inyectan en la página en vivo a través del pipeline de tokens CSS. La suite incluye validación en tiempo real, perfiles de un clic y un motor de auditoría WCAG automatizado.",
      a11yCategoriesTitle: "8 Categorías de Configuración",
      a11yCat1:
        "Indicadores de Enfoque — Color personalizado del anillo de enfoque, ancho (1–5px), desplazamiento y estilo para todos los elementos interactivos.",
      a11yCat2:
        "Alto Contraste — Activar modo alto contraste con anulaciones configurables de contraste texto/fondo.",
      a11yCat3:
        "Legibilidad del Texto — Escalado de tamaño de fuente (80–200%), ajuste de altura de línea (1.0–2.5), espaciado entre letras y palabras.",
      a11yCat4:
        "Movimiento y Animación — Respetar prefers-reduced-motion, controlar duraciones de transición y desactivar animaciones decorativas independientemente.",
      a11yCat5:
        "Objetivos Táctiles — Aplicar alturas mínimas para botones y campos (44px mínimo WCAG), ajustar padding de elementos interactivos.",
      a11yCat6:
        "Color y Visión — Modo seguro para daltonismo, colores de enlaces personalizados, subrayado permanente para enlaces y etiquetado de íconos.",
      a11yCat7:
        "Lector de Pantalla — Inyección de landmarks ARIA, anuncios de regiones activas, enlaces de navegación rápida y mejora de etiquetas de formularios.",
      a11yCat8:
        "Asistencia de Lectura — Guía de lectura configurable, resaltado de líneas, máscara de texto y fuente adaptada para dislexia.",
      a11yProfilesTitle: "6 Perfiles en Un Clic",
      a11yProfilesIntro:
        "Los perfiles de accesibilidad preconfigurados aplican configuraciones por lotes instantáneamente. Cada perfil apunta a una necesidad de usuario específica y puede personalizarse después de la aplicación.",
      a11yProfile1:
        "Base WCAG AA — Aplica requisitos mínimos WCAG AA: contraste 4.5:1, objetivos táctiles 44px, anillos de enfoque visibles.",
      a11yProfile2:
        "Baja Visión — Fuentes grandes (140%), alto contraste, texto en negrita, espaciado extra, indicadores de enfoque gruesos.",
      a11yProfile3:
        "Discapacidad Motriz — Objetivos táctiles sobredimensionados (56px), padding extra, sin animaciones, navegación optimizada para teclado.",
      a11yProfile4:
        "Cognitivo — Diseño simplificado, movimiento reducido, espaciado aumentado, guía de lectura, indicadores de enfoque claros.",
      a11yProfile5:
        "Optimizado para Lector de Pantalla — Landmarks ARIA mejorados, regiones activas, etiquetas de formularios, enlaces de navegación rápida, estructura semántica de encabezados.",
      a11yProfile6:
        "Restablecer Valores — Restaura todas las configuraciones de accesibilidad a sus valores predeterminados WCAG AA.",
      a11yAuditTitle: "Motor de Auditoría WCAG en Tiempo Real",
      a11yAuditIntro:
        "El hook useAccessibilityChecker ejecuta 4 verificaciones automatizadas en tiempo real sobre las configuraciones del borrador: validación de Ratio de Contraste (4.5:1 para texto, 3:1 para texto grande), dimensionamiento de Objetivos Táctiles (mínimo 44×44px), Legibilidad de Superposición (verifica que la opacidad no oscurezca el contenido) y configuraciones de Movimiento (valida la configuración reduced-motion). Cada verificación devuelve severidad aprobado/advertencia/fallo con mensajes accionables.",
      a11yAutoFixTitle: "Mecanismo de Auto-Corrección",
      a11yAutoFixIntro:
        "El motor de auditoría incluye una función autoFix que resuelve automáticamente las verificaciones fallidas ajustando las configuraciones del borrador a la conformidad WCAG AA. Por ejemplo, si el ratio de contraste falla, ajusta el color del texto; si los objetivos táctiles son demasiado pequeños, aumenta la altura de los botones a 44px.",
      a11yCssTitle: "Pipeline de Inyección CSS",
      a11yCssIntro:
        "El hook useLoginBrandingTokens emite 23+ reglas CSS específicas de accesibilidad mediante una inyección de etiqueta <style> única. Las reglas incluyen estilo de anillos de enfoque (--login-focus-ring-*), anulaciones de alto contraste, escalado de fuentes, mínimos de objetivos táctiles, superposiciones de guía de lectura y anulaciones de media query reduced-motion. Todos los CSS de accesibilidad se superponen correctamente sobre los estilos de marca base.",
      a11yPreviewTitle: "Integración de Vista Previa",
      a11yPreviewIntro:
        "El LoginPreviewShell muestra las características de accesibilidad en tiempo real: las superposiciones de guía de lectura/máscara se renderizan visualmente en el iframe de vista previa, y un badge de accesibilidad muestra el conteo de características activas. La vista previa está completamente aislada del sistema de autenticación.",
      archTitle: "Arquitectura del Módulo",
      archIntro:
        "El Personalizador de Login sigue la arquitectura modular limpia estándar de SCRIPE con capas de dominio, datos y presentación. La capa de presentación contiene el componente StylePanel (UI de configuración), LoginPreviewShell (gestión de iframe), el AccessibilityPanel (configuraciones y perfiles WCAG) y el hook useLoginBrandingTokens (pipeline token-a-CSS). Los componentes se extraen a nivel de módulo para prevenir problemas de pérdida de enfoque en re-renderizados React.",
      archTip:
        "Los componentes BgControls y PresetDots están definidos intencionalmente a nivel de módulo (no en línea) para evitar que React desmonte/remonte campos de entrada durante los re-renderizados, lo que causaría pérdida de enfoque en cada pulsación de tecla.",
      relatedTitle: "Related Features",
      relatedIntro:
        "The Login Customizer Studio is part of a larger customization ecosystem. See these companion features for complete coverage:",
      relatedMarketplace:
        "Theme Marketplace — Browse, preview, and apply 40 premium branding packages with per-page overrides.",
      relatedMultiPage:
        "Multi-Page Branding — Configure independent branding for Login, Forgot Password, and Reset Password pages.",
      relatedBuilder:
        "Login Page Builder — Drag-and-drop visual canvas for building custom login page layouts with 14 component types.",
      logoPathsTitle: "Rutas de Logotipo y Resolución",
      logoPathsIntro:
        "Los recursos de logotipo del inquilino se almacenan en un directorio dedicado de almacenamiento local o en la nube (predeterminado: 'FileHost/TenantLogos/') estructurado mediante el esquema de almacenamiento de archivos 'tenant-logo'. Los archivos almacenados se denominan '{TenantCode}_logo.{extension}' para evitar colisiones de nombres y hacer cumplir el aislamiento del inquilino. Las rutas de solicitud de logotipo servidas se enrutan a través de '/api/files/tenant-logos/{filename}', que valida las extensiones de medios (JPG, PNG, WEBP, GIF, SVG) y aplica un límite de tamaño de archivo de 10 MB.",
      cssPreviewsTitle: "Canalización de Vista Previa de CSS en Vivo",
      cssPreviewsIntro:
        "El marco de Vista Previa en Vivo en Customizer Studio se comunica a través de un canal postMessage seguro y validado por origen utilizando el gancho useStudioBridge. Cuando un administrador modifica cualquier token de diseño en el panel de la barra lateral, la ventana principal envía un evento postMessage en tiempo real que contiene el objeto StudioDraft serializado completo. El iframe de vista previa (por ejemplo, LoginPreviewShell) intercepta el mensaje e invoca useLoginBrandingTokens para actualizar instantáneamente las variables personalizadas de CSS (--login-*) en el elemento document :root, lo que proporciona redibujados del DOM sin latencia sin activar actualizaciones completas de la página.",
    },
    dashboardBuilder: {
      title: "Constructor de Dashboard",
      description:
        "Preferencias de administrador sincronizadas con el servidor con motor de fusión de 4 capas, 61 ajustes configurables, prevención de FOUC, resolución de conflictos 409 y control de características basado en ediciones.",
      intro:
        "El Constructor de Dashboard es el sistema de preferencias de administrador de nivel empresarial de SCRIPE que sincroniza 61 ajustes de dashboard configurables entre el navegador y el servidor. Utiliza un motor de fusión de 4 capas (Plataforma → Inquilino → Admin → Tiempo de ejecución) para la resolución de ajustes con control de anulación basado en inquilino, persistencia entre dispositivos a través de AdminSettingsJson y 5 protecciones contra casos extremos.",
      overviewTitle: "Visión General del Sistema",
      overviewIntro:
        "El Constructor de Dashboard proporciona un ciclo de vida completo para las preferencias del administrador — desde el renderizado inmediato cache-first hasta la reconciliación en segundo plano con el servidor.",
      overviewTip:
        "Los ajustes se renderizan inmediatamente desde la caché de localStorage al cargar la página. La obtención del servidor ocurre en segundo plano.",
      mergeEngineTitle: "Motor de Fusión de 4 Capas",
      mergeEngineIntro:
        "Los ajustes siguen una cadena de prioridad estricta de 4 capas. Cada capa puede anular la anterior, con control de acceso opcional basado en rutas a nivel de inquilino.",
      mergeEngineNote:
        "La Capa 2 (Restricciones de Edición) se maneja del lado del servidor a través del pipeline FeatureCheckBehavior.",
      syncHookTitle: "Hook de Sincronización con el Servidor",
      syncHookIntro:
        "El hook useAdminSettingsSync gestiona el ciclo de vida completo de las preferencias del administrador: carga inicial desde caché, flush diferido, obtención del servidor en segundo plano y reconciliación silenciosa.",
      edgeCasesTitle: "Protecciones contra Casos Extremos",
      edgeCasesIntro:
        "El sistema de sincronización maneja 5 casos extremos críticos que ocurren comúnmente en entornos empresariales.",
      edgeCasesWarning:
        "La clave PENDING_SETTINGS_FLUSH sobrevive intencionalmente al cierre de sesión para realizar el flush de ajustes en el próximo inicio de sesión.",
      settingsRefTitle: "Referencia de Ajustes (61 Ajustes)",
      settingsRefIntro:
        "Los 61 ajustes están organizados en 9 secciones. Cada ajuste tiene un tipo definido, valor predeterminado, atributo de datos DOM y control de edición opcional.",
      overrideControlTitle: "Control de Anulación de Admin",
      overrideControlIntro:
        "Los administradores de inquilinos pueden controlar qué ajustes pueden personalizar los administradores individuales.",
      securityTitle: "Modelo de Seguridad",
      securityIntro:
        "El Constructor de Dashboard implementa seguridad de defensa en profundidad para prevenir filtraciones de datos entre administradores y desbordamientos de payload.",
      archTitle: "Arquitectura y Mapa de Archivos",
      archIntro:
        "El Constructor de Dashboard está implementado en 7 archivos en la capa Core, siguiendo el patrón de arquitectura basado en proveedores de SCRIPE.",
      archTip:
        "Para agregar un nuevo ajuste, extienda la interfaz Settings y defaultSettings en settings-provider.tsx.",
      widgetConfigTitle: "Esquema de configuración de widgets y cuadrícula",
      widgetConfigIntro:
        "Cada widget colocado en el lienzo del constructor de paneles es un bloque posicionado en una cuadrícula CSS de 12 columnas. El constructor configura sus columnas, filas, alineación, propiedades específicas, zIndex y visibilidad, y los serializa en DashboardThemeJson junto con los tokens de tema existentes.",
    },
    themeMarketplace: {
      title: "Theme Marketplace",
      description:
        "40 premium branding packages, 7 categories, 5 pricing tiers, per-page overrides, copy-on-apply snapshot semantics, and a full clean-architecture data layer — all seeded and ready to browse.",
      intro:
        "The Theme Marketplace is SCRIPE's curated catalog of 40 production-ready branding packages. Each theme is a comprehensive visual identity — not just a color swap — containing 50+ design tokens spanning colors, typography, spacing, overlay, dark mode, branding panel, and per-page overrides for Login, Forgot Password, and Reset Password pages. Themes are stored as structured JSON in the LoginTheme entity, browsable via a full-page gallery with rich filtering, and applied to tenant settings with copy-on-apply snapshot semantics that permanently isolate applied configurations from future marketplace updates.",
      archTitle: "Marketplace Architecture",
      archIntro:
        "The Theme Marketplace follows a pipeline architecture: backend seeder populates the LoginTheme table with 40 records → API exposes paginated list, detail, and apply endpoints → frontend gallery renders themes with advanced filtering → apply action snapshots the ThemeDataJson into tenant's DraftBrandingJson → publish propagates to LiveBrandingJson. Each layer is fully decoupled.",
      archDataFlowTitle: "Data Flow Pipeline",
      archDataFlowIntro:
        "1. LoginThemeSeeder.cs seeds 40 themes at application startup (upsert-safe). 2. ThemesController exposes GET /themes (list), GET /themes/{id} (detail), POST /themes/{id}/apply (apply). 3. Frontend ThemeMarketplaceService calls the API via IApiService. 4. ThemeMarketplaceMapper converts DTOs to domain entities. 5. ThemeMarketplaceRepository orchestrates services + mappers. 6. useThemeMarketplace hook provides ViewModel state. 7. ThemeGalleryView renders the marketplace UI.",
      archLayersTitle: "Clean Architecture Layers",
      archLayersIntro:
        "The marketplace follows SCRIPE's standard 3-layer module structure: Domain layer (ThemeDetail entity, IThemeMarketplaceRepository, IThemeMarketplaceService interfaces), Data layer (ThemeMarketplaceService, ThemeMarketplaceRepository, ThemeMarketplaceMapper, ThemeMarketplaceTypes models), and Presentation layer (ThemeGalleryView, ThemeManagementView, ThemeDetailModal, ThemeCard, useThemeMarketplace hook).",
      entityTitle: "LoginTheme Entity",
      entityIntro:
        "Each marketplace theme is stored as a LoginTheme entity in the Identity module's database. The entity extends AuditableEntity, providing soft-delete, audit trail, and optimistic concurrency. The core data is stored in ThemeDataJson — a JSON column containing the full design specification.",
      entityFieldsTitle: "Entity Fields",
      entityFieldName:
        "Name — Human-readable theme name (e.g., 'Midnight Aurora', 'Sakura Bloom'). Unique per system.",
      entityFieldCategory:
        "Category — Classification tag (corporate, creative, dark, elegant, luxury, minimal, nature). Used for gallery filtering.",
      entityFieldDescription:
        "Description — Marketing-quality description of the theme's visual identity and design philosophy.",
      entityFieldThumbnail: "ThumbnailUrl — Optional preview image URL for gallery cards.",
      entityFieldPreviewUrl:
        "PreviewUrl — Optional full-size preview image URL for the detail modal.",
      entityFieldThemeData:
        "ThemeDataJson — JSON column containing the complete design specification (50+ tokens). This is the heart of each theme.",
      entityFieldTier:
        "Tier — Pricing/access tier (Free, Starter, Professional, Enterprise, StandaloneAddon). Controls edition-based access gating.",
      entityFieldIsSystem:
        "IsSystemTheme — Boolean flag. System themes are seeded at startup and cannot be deleted by tenants.",
      entityFieldIsActive:
        "IsActive — Boolean flag. Inactive themes are hidden from the gallery but preserved in the database.",
      entityFieldTag:
        "Tags — Optional comma-separated tags for search (e.g., 'gradient, glass, modern, dark').",
      entityFieldVersion:
        "Version — Semantic version string (e.g., '1.0.0'). Incremented when the theme design is updated.",
      entityFieldAuthor: "Author — Creator identifier (e.g., 'SCRIPE Design Team').",
      entityFieldLikes:
        "LikesCount — Engagement counter. Tracks how many tenants have favorited this theme.",
      entityFieldApplied:
        "AppliedCount — Usage counter. Tracks how many tenants have applied this theme.",
      schemaTitle: "ThemeDataJson Schema (50+ Design Tokens)",
      schemaIntro:
        "The ThemeDataJson column stores a comprehensive JSON object containing every visual parameter needed to fully render a branded login page. The schema is versioned and contains 7 major sections: layout, colors, dark mode colors, typography, spacing, overlay, and branding panel. Each token maps directly to a CSS custom property via the useLoginBrandingTokens pipeline.",
      schemaVersionTitle: "Schema Version",
      schemaVersionIntro:
        "The root 'version' field tracks the JSON schema version. Current version is '2.0'. The frontend handles backward compatibility — older schemas are normalized at read time.",
      schemaLayoutTitle: "Layout Configuration",
      schemaLayoutIntro:
        "Controls the page structure: selectedLayout (one of 22 layout identifiers), loginPosition (left/center/right), formWidth, formMaxWidth, containerPadding, and formAlignment. Layout selection determines which rendering strategy the LoginPage component uses.",
      schemaColorsTitle: "Color System (16 Tokens)",
      schemaColorsIntro:
        "The colors section defines the complete light-mode palette: primaryColor (brand accent), secondaryColor (complementary), backgroundColor (page background), formBackground (form card), textColor (primary text), secondaryTextColor (muted text), inputBackground (form input fields), inputBorderColor, inputTextColor, buttonColor (primary CTA), buttonTextColor, buttonHoverColor, linkColor, linkHoverColor, borderColor (general borders), and accentColor (highlights/badges).",
      schemaDarkTitle: "Dark Mode Color System (10 Tokens)",
      schemaDarkIntro:
        "Independent dark-mode palette: darkEnabled (boolean toggle), darkFormBackground, darkTextColor, darkInputBackground, darkInputBorderColor, darkInputTextColor, darkButtonColor, darkButtonTextColor, darkSecondaryTextColor, and darkBorderColor. These tokens are emitted as --login-dark-* CSS variables and activated via the [data-theme='dark'] selector.",
      schemaTypographyTitle: "Typography Configuration (8 Tokens)",
      schemaTypographyIntro:
        "Controls all text rendering: fontFamily (Google Fonts name, e.g., 'Playfair Display'), headingFontFamily (optional separate heading font), fontSize (base size in px), headingSize, labelSize, inputFontSize, fontWeight (normal/medium/semibold/bold), and letterSpacing. Fonts are loaded dynamically via the Google Fonts CDN.",
      schemaSpacingTitle: "Spacing & Dimensions (6 Tokens)",
      schemaSpacingIntro:
        "Controls layout geometry: borderRadius (global border-radius in px), inputBorderRadius, buttonBorderRadius, inputHeight (in px), buttonHeight, and gap (spacing between form elements). These values are emitted as CSS custom properties and applied uniformly across all 22 layouts.",
      schemaOverlayTitle: "Overlay & Effects (8 Tokens)",
      schemaOverlayIntro:
        "Controls visual effects layered on backgrounds: overlayColor (RGBA), overlayOpacity (0–100%), overlayBlur (0–20px in Gaussian blur), backgroundType ('color', 'gradient', 'image'), backgroundValue (CSS gradient string or image URL), backgroundSize, backgroundPosition, and backgroundRepeat. Overlay settings can be scoped to the form section or branding panel independently.",
      schemaPanelTitle: "Branding Panel Configuration (12 Tokens)",
      schemaPanelIntro:
        "Controls the branding side of split layouts: panelLogo (URL), panelHeadline (heading text), panelSubtitle (subheading text), panelHeadlineColor, panelSubtitleColor, panelBackgroundType, panelBackgroundValue, panelOverlayColor, panelOverlayOpacity, panelOverlayBlur, panelLogoSize (small/medium/large), and panelAlignment (left/center/right). These tokens are only rendered in T1 Split layouts.",
      perPageTitle: "Per-Page Branding Architecture",
      perPageIntro:
        "Each theme can define independent visual overrides for three authentication pages: Login, Forgot Password, and Reset Password. The 'pages' block in ThemeDataJson contains page-specific layout, headline, subtitle, overlay, and background settings that are merged on top of the global design when that page is active. This enables a single theme to present different messaging and visual treatments for different auth flows.",
      perPageStructTitle: "Pages Block Structure",
      perPageStructIntro:
        "The 'pages' object in ThemeDataJson contains three optional keys: 'login', 'forgotPassword', and 'resetPassword'. Each key maps to a page override object with fields: selectedLayout, panelHeadline, panelSubtitle, overlayColor, overlayOpacity, backgroundType, backgroundValue, and any other token that should differ from the global configuration.",
      perPageMergeTitle: "Merge Strategy",
      perPageMergeIntro:
        "When a tenant previews a theme's Forgot Password page, the frontend merges the global design tokens with the forgotPassword override using spread semantics: { ...globalTokens, ...pages.forgotPassword }. This means any token not specified in the page override inherits from the global design — only the explicitly overridden values change. The merge happens in the previewTheme() function in useStudioViewModel.ts.",
      perPageIsolationTitle: "State Isolation",
      perPageIsolationNote:
        "Each auth page can have its own layout, headline, subtitle, and overlay without affecting the other pages. The Login page might use a full-image corporate layout while Forgot Password uses a clean centered card — all within the same theme.",
      catalogTitle: "40-Theme Catalog Overview",
      catalogIntro:
        "SCRIPE ships with 40 meticulously designed branding packages. Each theme is a unique visual identity crafted for a specific market segment or brand aesthetic. Themes span 7 categories, use 30+ different Google Fonts, cover all 22 layouts, and include per-page branding overrides for Login, Forgot Password, and Reset Password.",
      catalogDiversityTitle: "Design Diversity Matrix",
      catalogDiversityIntro:
        "The 40-theme catalog achieves maximum diversity across multiple axes: each theme uses a unique Google Font pairing, no two themes share the same color palette, all 7 categories are represented, and the layout distribution covers T1 Split (16), T2 Full-Page (12), T3 Centered (6), and T4 Special (6). This ensures every tenant can find a theme that matches their brand identity.",
      tierTitle: "5-Tier Pricing Model",
      tierIntro:
        "Themes are organized into 5 pricing tiers that align with SCRIPE's edition system. Each tier provides increasing design sophistication and customization depth. Tier enforcement is handled by the theme marketplace frontend — themes from higher tiers display an 'Upgrade Required' badge and disable the Apply button for tenants on lower editions.",
      tierFreeTitle: "Free Tier (8 Themes)",
      tierFreeIntro:
        "Essential branding packages available to all tenants regardless of edition. Clean, professional designs suitable for quick deployment. Includes Starter themes across corporate, minimal, and creative categories.",
      tierStarterTitle: "Starter Tier (8 Themes)",
      tierStarterIntro:
        "Enhanced branding packages for Starter-edition tenants. Richer color palettes, premium font pairings, and gradient backgrounds. Includes Starter-exclusive designs across corporate, dark, and elegant categories.",
      tierProTitle: "Professional Tier (10 Themes)",
      tierProIntro:
        "Advanced branding packages for Professional-edition tenants. Sophisticated visual treatments with glass-morphism effects, editorial typography, and multi-tone overlays. Includes the most diverse category coverage.",
      tierEnterpriseTitle: "Enterprise Tier (8 Themes)",
      tierEnterpriseIntro:
        "Premium branding packages for Enterprise-edition tenants. Ultra-premium designs with cinematic layouts, luxury typography (Cormorant Garamond, Italiana, Cinzel Decorative), and exclusive dark-mode treatments.",
      tierStandaloneTitle: "Standalone Add-on Tier (6 Themes)",
      tierStandaloneIntro:
        "Ultra-exclusive standalone branding packages available as individual add-on purchases. These represent the most unique and specialized designs — botanical illustrations, art deco, brutalist, vaporwave, and zen-inspired themes that make a bold brand statement.",
      categoriesTitle: "7 Theme Categories",
      categoriesIntro:
        "Every theme belongs to exactly one category. Categories enable intuitive gallery browsing and filtering. The distribution ensures broad coverage: Corporate (8), Creative (6), Dark (6), Minimal (5), Elegant (5), Luxury (5), Nature (5).",
      catCorporate:
        "Corporate — Professional business identity. Clean lines, serif/sans-serif font pairs, subtle gradients, blue/navy/gray palettes. Designed for financial services, consulting, law firms.",
      catCreative:
        "Creative — Bold, expressive identity. Vibrant colors, playful typography (Poppins, Quicksand), animated gradients, modern card layouts. Designed for agencies, startups, tech companies.",
      catDark:
        "Dark — Sophisticated dark-mode-first identity. Deep backgrounds (slate, zinc, charcoal), accent-driven highlights (cyan, amber, rose), premium glass effects. Designed for developer tools, media, gaming.",
      catMinimal:
        "Minimal — Reductive, content-focused identity. Monochromatic palettes, generous whitespace, thin borders, system-optimized typography. Designed for productivity tools, documentation, SaaS platforms.",
      catElegant:
        "Elegant — Refined, luxurious identity. Rose gold, champagne, pearl gradients, serif typography (Playfair Display, Cormorant), delicate overlays. Designed for beauty, fashion, hospitality.",
      catLuxury:
        "Luxury — Ultra-premium brand identity. Black/gold/platinum palettes, display typography (Italiana, Cinzel Decorative), full-bleed imagery, art-directed layouts. Designed for high-end brands, private banking, exclusive services.",
      catNature:
        "Nature — Organic, earth-inspired identity. Forest greens, terracotta, ocean blues, botanical accents, rounded shapes, warm serif typography. Designed for sustainability, wellness, organic brands.",
      componentsTitle: "Frontend Component Inventory",
      componentsIntro:
        "The Theme Marketplace frontend consists of 8 purpose-built components spanning 3 pages and 1 modal. Each component follows SCRIPE's presentation-layer patterns using domain entities (never DTOs) and consuming data exclusively through the DI container.",
      compGalleryView:
        "ThemeGalleryView (26KB) — Full-page marketplace with animated hero section, category filter chips, search bar, grid/list view toggle, tier filter tabs, sort controls (popular/newest/name), infinite scroll pagination, and a responsive 3-column grid of ThemeCard components.",
      compManagementView:
        "ThemeManagementView (12KB) — Admin CRUD page for managing system themes. DataTable with columns: thumbnail, name, category, tier, status, likes, applies, actions. Supports create, edit, activate/deactivate, and bulk operations.",
      compDetailModal:
        "ThemeDetailModal (28KB) — Richly detailed theme preview modal. Contains: full-size preview image, design token summary (colors, fonts, spacing), feature matrix (dark mode, per-page, overlay), category/tier badges, Apply button with confirmation dialog, and like/favorite toggles.",
      compThemeCard:
        "ThemeCard — Gallery grid item. Displays: thumbnail, name, category badge, tier badge, color palette strip (5 primary colors), font family name, like count, apply count, and hover-to-preview animation.",
      compMarketplacePanel:
        "ThemeMarketplacePanel — Inline panel within the Customizer Studio sidebar. Shows a compact gallery of themes with quick-apply functionality. Allows browsing and applying themes without leaving the studio.",
      applyTitle: "Theme Application Flow",
      applyIntro:
        "Applying a marketplace theme follows a 5-step pipeline: 1. User clicks Apply on a theme. 2. Frontend reads the theme's ThemeDataJson. 3. previewTheme() in useStudioViewModel merges the design tokens (including per-page overrides) into the current StudioDraft. 4. The merged draft is saved to the tenant's DraftBrandingJson via PUT /tenants/{id}/settings. 5. Admin publishes the draft to make it live.",
      copyOnApplyTitle: "Copy-on-Apply Snapshot Semantics",
      copyOnApplyIntro:
        "When a theme is applied, the ThemeDataJson is COPIED into the tenant's DraftBrandingJson — not linked. This means the tenant's branding is permanently isolated from future marketplace updates. If the theme is updated in v2.0, existing tenants who applied v1.0 retain their v1.0 snapshot. This prevents unexpected visual changes to production login pages.",
      copyOnApplyNote:
        "Copy-on-apply is a deliberate architectural decision. It trades storage efficiency for deployment safety — a critical requirement for enterprise tenants who negotiate specific branding contracts.",
      previewFlowTitle: "Preview Before Apply",
      previewFlowIntro:
        "The previewTheme() function in useStudioViewModel.ts performs a non-destructive preview by temporarily injecting theme tokens into the draft state. The preview is displayed in the sandboxed iframe via postMessage CSS variable injection. The draft is NOT saved until the user explicitly confirms the application. Canceling the preview restores the previous draft state.",
      seedingTitle: "Backend Seeding Architecture",
      seedingIntro:
        "All 40 themes are seeded at application startup by LoginThemeSeeder.cs. The seeder uses an upsert-safe strategy: it checks for existing themes by Name and only inserts new ones — existing themes are never overwritten. This ensures idempotent deployment across environments.",
      seedHelperTitle: "Build() Helper Architecture",
      seedHelperIntro:
        "The seeder uses a fluent Build() helper with ThemeMeta and ThemeDesign records for clean theme definition. ThemeMeta contains name, category, tier, description, author, version, and tags. ThemeDesign contains all 50+ design tokens plus per-page overrides (PageOverrideDesign records for ForgotPassword and ResetPassword). The BuildFullThemeJson() method serializes the ThemeDesign record into the JSON format expected by the frontend.",
      seedUpsertTitle: "Upsert-Safe Strategy",
      seedUpsertIntro:
        "The seeder queries all existing theme names before processing. For each of the 40 themes, it checks the existing set — if the name exists, the theme is skipped. New themes are added to the DbContext in a single batch and saved with one SaveChangesAsync call. This makes the seeder safe to run repeatedly without duplicating themes or losing manual edits.",
      governanceTitle: "Marketplace Governance",
      governanceIntro:
        "Theme access is controlled by a combination of edition-based tier enforcement and permission-based administrative access. The marketplace respects SCRIPE's multi-tenancy model — themes are globally visible but apply operations are scoped to the current tenant.",
      governanceEditionTitle: "Edition-Based Tier Enforcement",
      governanceEditionIntro:
        "Each theme's Tier field maps to an edition level. The frontend gallery marks themes above the tenant's edition with an 'Upgrade Required' badge and disables the Apply button. The backend apply endpoint verifies the tenant's active subscription against the theme's tier before allowing application.",
      governancePermissionTitle: "Permission Requirements",
      governancePermissionIntro:
        "Browsing the marketplace requires the branding.view permission. Applying a theme requires branding.manage. Managing system themes (CRUD) requires the themes.manage permission, which is restricted to System Admins.",
      governanceTenantTitle: "Tenant Isolation",
      governanceTenantIntro:
        "When a theme is applied, it modifies only the current tenant's DraftBrandingJson. The apply operation is scoped via the JWT tenant_id claim. SuperAdmins can apply themes on behalf of any tenant via the 'Enter Tenant World' drill-down capability.",
      endpointsTitle: "Theme API Endpoints",
      endpointsIntro:
        "The theme marketplace exposes endpoints through the existing TenantSettings and Themes controllers. Theme data is served as part of the branding configuration pipeline.",
      endpointList:
        "GET /api/v1/themes — Paginated list of active themes with category, tier, and search filters.",
      endpointDetail:
        "GET /api/v1/themes/{id} — Full theme detail including ThemeDataJson, metadata, and engagement counters.",
      endpointApply:
        "POST /api/v1/themes/{id}/apply — Apply theme to the current tenant's draft settings. Copies ThemeDataJson to DraftBrandingJson.",
      endpointLike:
        "POST /api/v1/themes/{id}/like — Toggle like/favorite for the current admin. Increments/decrements LikesCount.",
      endpointManage:
        "POST/PUT/DELETE /api/v1/themes — System admin CRUD for managing theme catalog (create, update, deactivate).",
      sourceTitle: "Source File Reference",
      sourceBackend:
        "Backend: LoginThemeSeeder.cs (seeder), LoginTheme.cs (entity), ThemeConfiguration.cs (EF config)",
      sourceFrontend:
        "Frontend: ThemeGalleryView.tsx, ThemeManagementView.tsx, ThemeDetailModal.tsx, ThemeCard.tsx",
      sourceData:
        "Data Layer: ThemeMarketplaceService.ts, ThemeMarketplaceRepository.ts, ThemeMarketplaceMapper.ts, ThemeMarketplaceTypes.ts",
      sourceDomain:
        "Domain Layer: ThemeDetail.ts (entity), IThemeMarketplaceService.ts, IThemeMarketplaceRepository.ts",
      sourceViewModel:
        "ViewModel: useThemeMarketplace.ts (gallery state), useStudioViewModel.ts (preview/apply integration)",
      devProfilesTitle: "Portal y Perfiles de Desarrolladores de Temas",
      devProfilesIntro:
        "El mercado de temas permite a los desarrolladores de temas registrados publicar sus diseños. Los perfiles de desarrollador se registran y administran a través de DeveloperProfileController y se almacenan como entidades DeveloperProfile vinculadas al inquilino. La verificación de perfiles está restringida a los administradores de la plataforma (VerifyDeveloperCommand), mientras que los pagos y las tasas de comisión se controlan a través de AppFinancialsController (que requiere permisos como developerprofiles.verify y developerpayouts.process) y pasarelas de pago (Stripe Connect).",
      purchaseVerifyTitle: "Secuencia de Verificación de Compra",
      purchaseVerifyIntro:
        "Los temas premium y solo independientes requieren una compra explícita antes de que un inquilino pueda aplicarlos. El sistema verifica el nivel del inquilino y las compras existentes (GetPurchasedThemeIdsAsync) en la base de datos. Si se requiere una compra, el sistema redirige al administrador a una sesión segura de Stripe Checkout. Tras un pago exitoso, Stripe emite un webhook checkout.session.completed que contiene el ID de correlación, creando un registro LoginThemePurchase en la base de datos que otorga acceso permanente a ese tema.",
      downloadsVerifyTitle: "Verificación de Descargas de Temas",
      downloadsVerifyIntro:
        "Para descargar de forma segura preajustes de temas personalizados o activos de configuración sin conexión, el sistema implementa un marco de descarga de archivos vinculado a la sesión. El controlador de descargas de medios genera una sessionId de duración limitada y criptográficamente aleatoria a través de IDownloadService. El usuario descarga el paquete a través de una solicitud GET segura a /api/v1/downloads/session/{sessionId}, lo que evita la necesidad de encabezados de autenticación del lado del cliente en el enlace de descarga mientras protege los archivos del acceso no autorizado.",
    },
    multiPageBranding: {
      title: "Multi-Page Branding",
      description:
        "Independent visual customization for Login, Forgot Password, and Reset Password pages — shared design tokens with per-page overrides, isolated preview, and theme integration.",
      intro:
        "Multi-Page Branding extends SCRIPE's Login Customizer Studio to support independent visual configurations for all three authentication pages: Login, Forgot Password, and Reset Password. Instead of forcing a single visual identity across all auth flows, Multi-Page Branding allows tenants to present context-appropriate messaging, layouts, and visual treatments for each page. A shared global design provides consistency, while per-page overrides enable targeted differentiation — all managed through the same zero-code studio interface.",
      pagesTitle: "Supported Authentication Pages",
      pagesIntro:
        "SCRIPE's authentication system exposes three distinct pages, each serving a different user intent. Multi-Page Branding allows independent customization of all three while maintaining visual consistency through shared design tokens.",
      pageLogin:
        "Login Page — The primary authentication entry point. Users enter their credentials (email + password) to access the platform. This page receives the most visual attention as it creates the first impression of the tenant's brand.",
      pageForgot:
        "Forgot Password Page — The password recovery entry point. Users enter their email to receive a reset link. This page benefits from reassuring messaging ('We'll help you get back in') and softer visual treatments that convey trust and care.",
      pageReset:
        "Reset Password Page — The password change confirmation page. Users set a new password using the link from their email. This page benefits from action-oriented messaging ('Create your new password') and clear, focused layouts that minimize distraction.",
      pagesNote:
        "Each page can independently configure: layout, headline, subtitle, background, overlay, and any design token. Tokens not explicitly overridden inherit from the global configuration — enabling 'configure once, override selectively' workflow.",
      stateTitle: "State Isolation Model",
      stateIntro:
        "Multi-Page Branding uses a layered state model. The global StudioDraft contains the base configuration for all pages. Each page has an optional override object (pageOverrides.login, pageOverrides.forgotPassword, pageOverrides.resetPassword) that stores only the tokens that differ from the global. This minimizes storage and simplifies diff tracking.",
      stateGlobalTitle: "Global Layer (Shared Tokens)",
      stateGlobalIntro:
        "The global layer contains all 50+ design tokens: colors, typography, spacing, overlay, dark mode, and branding panel settings. These tokens apply to ALL auth pages by default. The global layer is always defined — it is never empty.",
      stateOverrideTitle: "Page Override Layer (Per-Page Tokens)",
      stateOverrideIntro:
        "Each page's override layer contains ONLY the tokens that differ from the global configuration. For example, if the Forgot Password page has a different headline and subtitle but shares all colors and typography, only panelHeadline and panelSubtitle are stored in the override. Empty fields inherit from the global layer.",
      stateMergeTitle: "Runtime Merge Strategy",
      stateMergeIntro:
        "When the studio switches to a specific page tab, the effective configuration is computed as: effectiveConfig = { ...globalDraft, ...pageOverrides[currentPage] }. This spread-merge ensures that page-specific overrides take precedence while all unspecified tokens fall through to the global values. The merge is performed in the previewTheme() function and in the CSS token emission pipeline.",
      stateMergeNote:
        "The merge is a shallow spread — nested objects (like darkColors or overlay) are replaced entirely, not deep-merged. This is intentional: if a page overrides the overlay, it should control the complete overlay configuration, not inherit partial values from the global.",
      studioTitle: "Studio Integration — Page Tabs",
      studioIntro:
        "The Customizer Studio sidebar includes a page tab strip (AuthPageTabs component) that allows switching between Login, Forgot Password, and Reset Password. When the active tab changes, the studio loads the corresponding page override (if any) and merges it with the global draft for preview. The preview iframe navigates to the selected auth page route.",
      studioTabsTitle: "AuthPageTabs Component",
      studioTabsIntro:
        "The AuthPageTabs component renders a horizontal tab bar with 3 tabs (Login, Forgot Password, Reset Password). Each tab displays the page name and an optional 'Customized' badge if per-page overrides exist. Clicking a tab updates the activePage state in the studio, triggers a preview refresh, and loads the page-specific sidebar panel settings.",
      studioSwitchTitle: "Tab Switching Flow",
      studioSwitchIntro:
        "When a user switches tabs: 1. The activePage state is updated to 'login', 'forgotPassword', or 'resetPassword'. 2. The sidebar panels reload with merged values (global + page override). 3. The preview iframe receives an updated postMessage with the merged CSS variables. 4. The iframe URL changes to the corresponding auth route (e.g., /login-preview, /forgot-password-preview, /reset-password-preview). 5. Any changes made in the sidebar are saved to the page override, not the global draft.",
      studioEditTitle: "Per-Page Editing",
      studioEditIntro:
        "When a user modifies a setting while a non-login page is active (e.g., Forgot Password), the change is saved to pageOverrides.forgotPassword — not to the global draft. The studio tracks which page is active and routes edits accordingly. This ensures that changing the forgot-password headline does not affect the login page's headline.",
      studioResetTitle: "Reset to Global",
      studioResetIntro:
        "Each page tab includes a 'Reset to Global' action that removes all per-page overrides for that page, reverting it to the global configuration. This is useful when a tenant wants to undo page-specific customizations and restore visual consistency across all auth pages.",
      themeTitle: "Theme Marketplace Integration",
      themeIntro:
        "When a marketplace theme includes per-page overrides (pages.forgotPassword, pages.resetPassword), the previewTheme() function in useStudioViewModel.ts automatically imports those overrides into the studio's pageOverrides state. This means applying a theme with per-page branding instantly populates all three auth pages with the theme's intended visual treatment.",
      themeImportTitle: "Page Override Import",
      themeImportIntro:
        "The previewTheme() function checks for the 'pages' key in the theme's ThemeDataJson. If found, it extracts the forgotPassword and resetPassword objects and stores them as pageOverrides. If the theme does not include page overrides, the existing pageOverrides are preserved (or cleared, depending on the apply mode).",
      themeCompatTitle: "Backward Compatibility",
      themeCompatIntro:
        "Themes without a 'pages' block are fully backward-compatible. The absence of page overrides means all three auth pages use the global design — the same behavior as themes created before the Multi-Page Branding feature. No migration is required for existing themes.",
      serializationTitle: "Data Serialization & Persistence",
      serializationIntro:
        "Per-page overrides are stored in the tenant's DraftBrandingJson alongside the global configuration. The JSON structure contains a top-level 'pageOverrides' object with 'login', 'forgotPassword', and 'resetPassword' keys. Each key maps to a flat token object. On publish, the entire structure (global + pageOverrides) is promoted to LiveBrandingJson.",
      serializationSchemaTitle: "Stored JSON Schema",
      serializationSchemaIntro:
        "The DraftBrandingJson stores: { selectedLayout, primaryColor, ...(all global tokens), pageOverrides: { login: { panelHeadline, panelSubtitle, ... }, forgotPassword: { selectedLayout, panelHeadline, overlayColor, ... }, resetPassword: { selectedLayout, panelHeadline, ... } } }. Only non-null override tokens are persisted — empty pages are not stored to save space.",
      previewTitle: "Sandboxed Preview Architecture",
      previewIntro:
        "Each auth page is previewed in the same sandboxed iframe used by the Login Customizer Studio. When the user switches to a different page tab, the preview URL changes to the corresponding auth route, and new CSS variables (merged from global + page override) are injected via postMessage. The preview supports desktop, tablet, and mobile breakpoints for all three pages.",
      previewIsolationTitle: "Preview Isolation",
      previewIsolationIntro:
        "The preview iframe runs in a completely isolated context — separate from the admin panel's authentication state. This prevents the preview from triggering real login/logout actions. The preview pages are purpose-built components that render the auth UI with injected CSS variables but no authentication logic.",
      conflictTitle: "Conflict Prevention & Consistency",
      conflictIntro:
        "Multi-Page Branding includes safeguards to prevent visual inconsistency. When the global design changes (e.g., a new font family), all pages that inherit from the global automatically update — only explicitly overridden tokens remain unchanged. The studio displays a 'Customized' badge on page tabs that have overrides, making it clear which pages have independent configurations.",
      conflictWarning:
        "When a global token is changed (e.g., primaryColor), pages with overrides that include the same token will NOT update — the override takes precedence. This is intentional. To propagate a global change to overridden pages, use the 'Reset to Global' action on those pages first.",
      sourceTitle: "Source File Reference",
      sourceStudio: "Studio: useStudioViewModel.ts (page state, merge logic, previewTheme())",
      sourceComponents:
        "Components: AuthPageTabs.tsx (tab strip), StylePanel.tsx (sidebar with per-page routing)",
      sourceTypes:
        "Types: StudioDraft.ts (pageOverrides interface), ThemeTypes.ts (page override type definitions)",
      sourceSeeder:
        "Backend: LoginThemeSeeder.cs (PageOverrideDesign records, BuildFullThemeJson pages serialization)",
      domainMatchingTitle: "Coincidencia de Dominio y Aislamiento de Inquilinos",
      domainMatchingIntro:
        "Para resolver el contexto correcto del inquilino en tiempo de ejecución, la puerta de enlace de la API y el TenantContextMiddleware del backend inspeccionan los encabezados de las solicitudes entrantes. Cuando un SuperAdmin desciende a un espacio de trabajo de inquilino específico, la aplicación cliente transmite el ID del inquilino cifrado en el encabezado 'X-Tenant-Context'. El middleware intercepta la solicitud, verifica el permiso tenants.drill_down, descifra el encabezado utilizando AES y lo asigna a CurrentUserService.TenantId. Para el tráfico de clientes estándar que llega a dominios personalizados, la resolución del nombre de host hace coincidir los encabezados de host con las asignaciones de dominio del inquilino.",
      dnsCnameTitle: "Validación de CNAME de DNS de Dominio Personalizado",
      dnsCnameIntro:
        "Los administradores pueden configurar dominios personalizados (por ejemplo, login.acme.com) a través de los puntos de conexión de TenantDomain. El dominio debe pasar las validaciones de RFC 1123 y mantenerse dentro de la cuota Tenancy.MaxCustomDomains del inquilino. Para verificar la propiedad del dominio, el sistema genera un token de verificación único con el prefijo 'scr_'. El administrador debe crear un registro CNAME que apunte su dominio al punto de conexión de la plataforma, y un registro TXT para '_scr-verify.{domain}' que contenga el token. DnsClient.NET consulta los registros TXT para confirmar la coincidencia antes de activar el dominio.",
    },
    loginPageBuilder: {
      title: "Login Page Builder",
      description:
        "No-code drag-and-drop visual canvas with 3 design modes (Freeform, Grid, Builder), 14 component types, a 12-column responsive grid system, real-time preview sync, and JSON serialization.",
      intro:
        "The Login Page Builder is SCRIPE's most advanced customization tool — a fully visual, drag-and-drop canvas that allows tenant administrators to build custom login page layouts without writing any code. The builder provides 3 design modes (Freeform, Grid, and Builder), a palette of 14 pre-built component types (from logos and headings to social login buttons and footer links), a responsive 12-column CSS grid system, real-time two-way sync with the preview iframe, and full JSON serialization for persistence. The builder integrates seamlessly with the Login Customizer Studio's design token pipeline, ensuring that builder-created layouts inherit all theme colors, typography, and accessibility settings.",
      modesTitle: "3 Canvas Modes",
      modesIntro:
        "The builder offers three distinct canvas modes, each providing a different level of control over layout positioning. Users can switch between modes at any time — components are preserved during mode switches.",
      modeFreeformTitle: "Freeform Mode",
      modeFreeformIntro:
        "Absolute positioning with pixel-level control. Components can be placed anywhere on the canvas and dragged to exact coordinates. Best for creative, non-standard layouts where design freedom is paramount. Components have x/y position, width, height, and z-index properties.",
      modeGridTitle: "Grid Mode (12-Column)",
      modeGridIntro:
        "Responsive 12-column CSS grid layout. Components are placed into grid cells with configurable column span (1–12), row positioning, alignment, and gap spacing. The grid ensures consistent, responsive layouts that adapt to desktop, tablet, and mobile breakpoints. This is the recommended mode for enterprise deployments where cross-device consistency is critical.",
      modeBuilderTitle: "Builder Mode",
      modeBuilderIntro:
        "Structured block-based layout with predefined sections. Components are organized into vertical sections (header, body, footer) with automatic stacking and reordering via drag-and-drop. Best for quick layout assembly with predictable, clean results. Builder mode enforces structural constraints — components snap to section boundaries and maintain consistent spacing.",
      modesNote:
        "Grid mode is the default for new configurations. It provides the best balance between design flexibility and responsive consistency. Freeform mode is intended for advanced users who need pixel-perfect control.",
      paletteTitle: "14 Component Types",
      paletteIntro:
        "The component palette provides 14 pre-built, configurable UI components that can be dragged onto the canvas. Each component has a set of editable properties (text content, styling, behavior) accessible via the Properties Panel when selected.",
      compLogo:
        "Logo — Displays the tenant's logo image. Properties: src (URL), alt text, width, height, alignment, link URL. Supports SVG, PNG, and WebP formats.",
      compHeading:
        "Heading — Large display text for page titles and headlines. Properties: text content, font size, font weight, color, alignment, HTML tag (h1–h6). Supports dynamic variables ({tenantName}).",
      compText:
        "Text — General-purpose paragraph text. Properties: content, font size, color, line height, alignment, max width. Supports rich text with bold, italic, and links.",
      compDivider:
        "Divider — Visual separator line. Properties: color, thickness, width, margin, style (solid, dashed, dotted, gradient).",
      compSpacer:
        "Spacer — Invisible spacing element. Properties: height (in px). Used to create vertical gaps between components without manual positioning.",
      compImage:
        "Image — Display any image on the canvas. Properties: src (URL), alt text, width, height, object-fit, border radius, shadow. Supports all web image formats.",
      compButton:
        "Button — Clickable action button. Properties: text, variant (primary, secondary, outline, ghost), size, width (auto, full), icon, link URL, border radius.",
      compSocialLogin:
        "Social Login — Pre-built social authentication buttons (Google, Microsoft, Apple, GitHub). Properties: providers (multi-select), layout (horizontal, vertical, icon-only), separator text.",
      compForm:
        "Form — The login form component containing email/password inputs and submit button. Properties: show labels, show placeholders, input style, button text, remember me checkbox, forgot password link.",
      compFooter:
        "Footer — Page footer with links and copyright text. Properties: links array, copyright text, alignment, font size, color.",
      compBadge:
        "Badge — Small label/tag element. Properties: text, variant (default, success, warning, destructive), size.",
      compCard:
        "Card — Container with background, border, and shadow. Properties: background color, border radius, shadow, padding. Can contain other components (nested layout).",
      compIcon:
        "Icon — SVG icon from the built-in icon library. Properties: icon name, size, color, rotation, link URL.",
      compTermsLink:
        "Terms & Privacy — Pre-built links to Terms of Service and Privacy Policy pages. Properties: terms URL, privacy URL, text template, font size, color.",
      gridTitle: "12-Column Grid System",
      gridIntro:
        "The Grid Mode uses a responsive 12-column CSS grid layout. Each component occupies a configurable number of columns (1–12) and rows. The grid supports gap spacing, column alignment (start, center, end, stretch), and row alignment. The grid is fully responsive — column spans can be configured independently for desktop (lg), tablet (md), and mobile (sm) breakpoints.",
      gridPropsTitle: "Grid Component Properties",
      gridPropsIntro:
        "Each component in Grid mode has additional grid-specific properties: colSpan (1–12 columns), rowSpan (number of rows), colStart (starting column), rowStart (starting row), alignment (start/center/end/stretch), and responsive overrides (sm/md/lg column spans). These properties are configured via the Properties Panel.",
      gridResponsiveTitle: "Responsive Breakpoints",
      gridResponsiveIntro:
        "The grid supports 3 breakpoints: Desktop (lg, ≥1024px), Tablet (md, 768–1023px), and Mobile (sm, <768px). Each component can have independent column spans per breakpoint. For example, a logo might span 4 columns on desktop but 12 columns (full width) on mobile. The preview iframe respects these breakpoints when device toggles are used.",
      gridGapTitle: "Gap Configuration",
      gridGapIntro:
        "The grid gap (spacing between cells) is configurable globally: columnGap and rowGap properties, each accepting pixel values (default: 16px). This ensures consistent spacing across all grid items without manual padding on individual components.",
      dndTitle: "Drag-and-Drop Architecture",
      dndIntro:
        "The builder uses @dnd-kit/core (not react-beautiful-dnd) for drag-and-drop interactions. Components are dragged from the palette sidebar and dropped onto the canvas. The DragOverlay renders a ghost preview of the component during drag. Drop zones are highlighted with blue outlines when a draggable component hovers over them.",
      dndPaletteTitle: "Palette → Canvas Flow",
      dndPaletteIntro:
        "1. User drags a component type from the palette sidebar. 2. @dnd-kit creates a DragOverlay with a preview of the component. 3. The canvas renders drop zone indicators (grid cells in Grid mode, free areas in Freeform mode). 4. On drop, a new component instance is created with default properties and added to the builder state. 5. The component is rendered on the canvas at the drop position.",
      dndReorderTitle: "Canvas Reordering",
      dndReorderIntro:
        "Existing components on the canvas can be reordered by dragging. In Grid mode, components snap to grid cells. In Builder mode, components reorder within their section (header/body/footer). In Freeform mode, components move to the exact drop coordinates.",
      dndSelectTitle: "Component Selection",
      dndSelectIntro:
        "Clicking a component on the canvas selects it, displaying a blue selection border and resize handles. The Properties Panel on the right sidebar loads the selected component's editable properties. Pressing Delete/Backspace removes the selected component. Escape deselects.",
      propsTitle: "Properties Panel",
      propsIntro:
        "The Properties Panel is a contextual sidebar that appears when a component is selected on the canvas. It displays all editable properties for the selected component type, organized into sections: Content (text, URLs), Layout (width, height, alignment), Style (colors, borders, shadows), and Grid (column span, row span, responsive breakpoints). Changes in the Properties Panel update the canvas in real-time.",
      propsContentTitle: "Content Properties",
      propsContentIntro:
        "Text inputs for content: headline text, paragraph text, button labels, URLs, alt text. Supports variable interpolation with {variableName} syntax for dynamic tenant data.",
      propsStyleTitle: "Style Properties",
      propsStyleIntro:
        "Visual styling controls: color pickers, border radius sliders, shadow toggles, opacity controls, font size selectors. Style properties that overlap with theme tokens (e.g., primaryColor) can be set to 'inherit from theme' to maintain consistency.",
      propsGridTitle: "Grid Properties",
      propsGridIntro:
        "Grid-specific layout controls (Grid mode only): column span slider (1–12), row span, column start, row start, alignment select, and responsive breakpoint overrides. A visual grid preview shows the component's position within the 12-column grid.",
      stateTitle: "Canvas State Management",
      stateIntro:
        "The builder maintains a flat array of BuilderComponent objects in the StudioDraft. Each component has: id (unique UUID), type (one of 14 types), properties (key-value map), position (x, y for Freeform), gridPosition (col, row, colSpan, rowSpan for Grid), and section (header/body/footer for Builder mode). The entire array is serialized as JSON in the builderComponentsJson field of DraftBrandingJson.",
      stateComponentTitle: "BuilderComponent Schema",
      stateComponentIntro:
        "Each BuilderComponent is a serializable object: { id: string, type: ComponentType, props: Record<string, unknown>, position: { x: number, y: number }, gridPosition: { colSpan: number, rowSpan: number, colStart: number, rowStart: number }, section: 'header' | 'body' | 'footer', order: number, responsive: { sm: GridOverride, md: GridOverride } }.",
      stateUndoTitle: "Undo/Redo Support",
      stateUndoIntro:
        "The builder maintains a history stack for undo/redo operations. Each action (add, move, resize, delete, property change) pushes a snapshot to the stack. Ctrl+Z undoes the last action, Ctrl+Shift+Z redoes. The history stack has a configurable depth limit (default: 50 actions).",
      serializationTitle: "JSON Serialization & Persistence",
      serializationIntro:
        "The builder state is serialized as a JSON array and stored in the builderComponentsJson field of the tenant's DraftBrandingJson. The canvasMode (freeform/grid/builder) is stored as a separate field. On publish, the builder state is promoted to LiveBrandingJson alongside all other branding tokens.",
      serializationSchemaTitle: "Serialized Schema",
      serializationSchemaIntro:
        "The stored JSON follows this structure: { canvasMode: 'freeform' | 'grid' | 'builder', gridConfig: { columns: 12, columnGap: 16, rowGap: 16 }, components: [ { id, type, props, position, gridPosition, section, order, responsive } ] }. The schema is versioned for forward compatibility.",
      serializationSizeTitle: "Storage Optimization",
      serializationSizeIntro:
        "Default property values are NOT stored — only properties that differ from the component type's defaults are serialized. This keeps the JSON payload compact (typically 2–5KB for a complex layout with 10+ components).",
      previewTitle: "Real-Time Preview Sync",
      previewIntro:
        "Every canvas change is immediately reflected in the sandboxed preview iframe. The builder emits postMessage events containing the current component array and canvas mode. The preview page receives these events, reconstructs the layout, and renders the components with live CSS variable injection from the active theme.",
      previewSyncTitle: "Two-Way Sync",
      previewSyncIntro:
        "The sync is bidirectional: canvas changes propagate to preview (via postMessage), and device toggle changes in the preview header propagate back to the builder (updating responsive breakpoint indicators). This ensures the builder canvas accurately reflects how the layout will appear at each breakpoint.",
      securityTitle: "Security Constraints",
      securityIntro:
        "The Login Page Builder enforces strict security constraints on user-generated content. All text content is HTML-sanitized before rendering (no script injection). Image URLs are validated to prevent SSRF. The builder canvas runs in a sandboxed iframe with restrictive CSP headers. Custom CSS injection is not supported — styling is controlled exclusively through the design token pipeline.",
      securitySanitizeTitle: "Input Sanitization",
      securitySanitizeIntro:
        "All text properties (headings, paragraphs, button labels) are sanitized using DOMPurify before rendering in the preview. HTML tags are stripped — only plain text is stored. URLs are validated against a whitelist of allowed protocols (https, http) to prevent javascript: and data: injection.",
      securityIframeTitle: "Iframe Sandboxing",
      securityIframeIntro:
        "The preview iframe uses the sandbox attribute with restricted permissions: allow-scripts (for CSS variable injection), allow-same-origin (for postMessage). Forms are non-functional — the preview renders visual-only representations of auth components.",
      dashboardTitle: "Dashboard Theming (Related Feature)",
      dashboardIntro:
        "The Dashboard Theming panel in the Customizer Studio allows tenants to configure their admin dashboard's visual defaults. Settings include layout template (8 options), color theme (12 options), theme mode (light/dark/system), default language, and sidebar default state. Dashboard theming uses the same draft/publish workflow as login branding.",
      dashboardLayoutsTitle: "8 Layout Templates",
      dashboardLayoutsIntro:
        "Default, Navigation, Classic, Compact, Elegant, Floating, Modern, and Minimal. Each template defines the dashboard shell structure: sidebar position, header style, content width, and navigation pattern.",
      dashboardColorsTitle: "12 Color Themes",
      dashboardColorsIntro:
        "Default, Zinc, Slate, Stone, Neutral, Red, Rose, Orange, Green, Blue, Violet, and Yellow. Each color theme defines the dashboard's accent color palette applied to the sidebar, headers, buttons, and active states.",
      dashboardStorageTitle: "Storage Format",
      dashboardStorageIntro:
        "Dashboard settings are stored in the dashboardThemeJson field of DraftBrandingJson as a JSON object: { layoutTemplate, colorTheme, mode, language, sidebarDefaultState }. On publish, the settings are promoted to the tenant's live configuration.",
      bundleTitle: "Bundle Marketplace (Related Feature)",
      bundleIntro:
        "The Bundle Marketplace allows tenants to save their complete studio configuration (login theme + builder layout + dashboard settings + per-page overrides) as a named bundle, and browse/apply bundles created by other tenants or the system. Bundles are displayed in a dedicated tab within the Theme Gallery.",
      bundleComponentsTitle: "Bundle Components",
      bundleComponentsIntro:
        "BundleGalleryTab (5.6KB) — Gallery tab with type filters (Login, Dashboard, Complete), search, grid, pagination. BundleCard (12.8KB) — Card with accent preview, pricing tier, metadata. BundleDetailModal (8.5KB) — Full detail with apply button. SaveBundleDialog (7.6KB) — Dialog for saving current studio state as a new bundle.",
      bundleTypesTitle: "Bundle Types",
      bundleTypesIntro:
        "Login Bundle — Contains only login branding (theme tokens + builder layout). Dashboard Bundle — Contains only dashboard settings. Complete Bundle — Contains everything: login branding, builder layout, per-page overrides, dashboard settings, and accessibility configuration. Complete bundles provide one-click full-workspace setup.",
      archTitle: "Module Architecture",
      archIntro:
        "The Login Page Builder follows SCRIPE's standard modular clean architecture. The builder/ directory contains: BuilderCanvas.tsx (main canvas), ComponentPalette.tsx (sidebar palette), PropertiesPanel.tsx (property editor), GridOverlay.tsx (grid visualization), and BuilderToolbar.tsx (mode switcher, undo/redo, zoom controls). State management uses the useBuilderState hook integrated into useStudioViewModel.",
      archTip:
        "The builder components are intentionally defined as stable, memoized React components to prevent re-renders during drag operations. Each canvas component is wrapped in React.memo with custom equality checks on position and properties.",
    },
    dashboardHub: {
      title: "Centro del Panel (Hub-and-Spoke)",
      description:
        "Panel modular con pestañas y sub-módulos segregados por dominio (Auditoría, Seguridad, Analítica), arquitectura limpia de 6 capas por módulo, interfaces compatibles con ISP, carga diferida y visibilidad de pestañas protegida por permisos.",
      intro:
        "El Centro del Panel es el centro de comando operativo principal de SCRIPE — una interfaz con pestañas que agrega cuatro vistas específicas de dominio (Vista General, Auditoría, Seguridad, Analítica) en un hub unificado. Cada módulo de dominio sigue una estricta arquitectura limpia de 6 capas (Modelos → Entidades → Interfaces → Servicios → Repositorios → Mapeadores) con registro DI dedicado. Las sub-vistas se cargan de forma diferida mediante React.lazy y están protegidas por permisos para garantizar que los usuarios solo vean las pestañas a las que están autorizados.",
      archTitle: "Arquitectura Hub-and-Spoke",
      archIntro:
        "El Centro del Panel utiliza un patrón Hub-and-Spoke donde la vista principal DashboardView sirve como hub central renderizando una barra de pestañas, y cada pestaña carga de forma diferida una vista independiente específica del dominio (spoke). La pestaña de Vista General está integrada para renderizado instantáneo. Las pestañas de Auditoría, Seguridad y Analítica se cargan bajo demanda mediante React.lazy con fallbacks de Suspense.",
      archTip:
        "Las sub-vistas se cargan de forma diferida solo cuando su pestaña se activa por primera vez. Esto reduce el bundle inicial del panel en ~60% comparado con la carga eager de las cuatro vistas.",
      domainTitle: "Segregación de Dominios (Principio de Segregación de Interfaces)",
      domainIntro:
        "Anteriormente, todos los datos del panel fluían a través de un único DashboardRepository (Interfaz Dios) con más de 8 métodos que abarcaban auditoría, seguridad y analítica. La arquitectura refactorizada extrae cada dominio en un módulo independiente con su propia interfaz de repositorio, eliminando el acoplamiento monolítico y adhiriéndose al Principio de Segregación de Interfaces (ISP).",
      domainNote:
        "Se mantienen alias de tipo retrocompatibles en DashboardEntities.ts para componentes heredados que aún no han migrado a las nuevas importaciones específicas del dominio. Estos alias están marcados como @deprecated para guiar la limpieza futura.",
      layersTitle: "Arquitectura Limpia de 6 Capas",
      layersIntro:
        "Cada módulo extraído (Auditoría, Seguridad, Analítica) implementa la pila completa de arquitectura limpia del frontend de SCRIPE. Las 6 capas aseguran una estricta separación de responsabilidades: los Modelos contienen las formas de respuesta raw de la API, las Entidades son objetos de dominio enriquecidos con propiedades computadas, las Interfaces definen contratos, los Servicios manejan llamadas HTTP vía IApiService, los Repositorios orquestan servicios y mapeadores para retornar entidades de dominio, y los Mapeadores realizan la conversión DTO-a-entidad con coalescencia de nulos.",
      diTitle: "Cableado del Contenedor DI",
      diIntro:
        "Los tres nuevos módulos están registrados en el SystemContainer (modules/system/di.ts). Cada módulo sigue el patrón: Servicio (recibe IApiService) → Repositorio (recibe Servicio) → Declaración de interfaz SystemContainer → Exportación de getter lazy. Los ViewModels consumen repositorios exclusivamente a través del contenedor DI.",
      diTip:
        "Los getters lazy en el accessor de systemContainer aseguran que los servicios y repositorios solo se instancian cuando se acceden por primera vez, previniendo sobrecarga de red innecesaria para pestañas que nunca se abren.",
      viewmodelTitle: "Desacoplamiento de ViewModels",
      viewmodelIntro:
        "Cada hook de ViewModel ahora importa su repositorio dedicado del contenedor DI en lugar de compartir un único repositorio del panel. Esto elimina el acoplamiento entre dominios: useAuditViewModel consume solo auditRepository, useSecurityDashboardViewModel consume solo securityRepository, y useTenantAnalyticsViewModel consume solo analyticsRepository.",
      hubTitle: "Implementación del Hub con Pestañas",
      hubIntro:
        "El componente DashboardView sirve como hub, renderizando un TabsList con 4 elementos TabsTrigger (Vista General, Auditoría, Seguridad, Analítica). Las pestañas de Auditoría y Seguridad se renderizan condicionalmente basándose en los permisos del administrador actual usando el hook usePermission.",
      hubNote:
        "La visibilidad de pestañas está protegida por permisos en el frontend solo con fines de UX (ocultar pestañas que el usuario no puede acceder). Los endpoints del backend imponen la frontera de seguridad real — las verificaciones del frontend son complementarias, no autoritativas.",
      cachingTitle: "Cacheo Consciente del Inquilino",
      cachingIntro:
        "Todas las claves de TanStack Query a lo largo del hub incluyen el tenantId actual como clave de partición. Esto asegura que al cambiar de inquilino se invaliden y re-obtengan automáticamente todos los datos del panel para el nuevo contexto de inquilino.",
      compatTitle: "Compatibilidad con Versiones Anteriores",
      compatIntro:
        "Para prevenir errores de compilación durante la migración, DashboardEntities.ts mantiene alias de tipo deprecados que re-exportan tipos de los nuevos módulos específicos del dominio. Los componentes que aún importan del archivo de entidades del módulo dashboard continuarán funcionando, pero recibirán advertencias de deprecación de TypeScript.",
      compatWarning:
        "Los alias deprecados deben eliminarse en una futura pasada de limpieza una vez que todos los componentes consumidores hayan migrado a importar de su respectivo módulo de dominio (audit/security/analytics).",
      sourceTitle: "Referencia de Archivos Fuente",
      sourceIntro:
        "El Centro del Panel refactorizado abarca 4 módulos (dashboard, audit, security, analytics), cada uno con su propia pila completa de 6 capas.",
      realtimeTitle: "Actualizaciones de SignalR en tiempo real",
      realtimeIntro:
        "El centro de control de paneles se integra con SignalR para proporcionar actualizaciones en tiempo real e invalidación de caché. Comparte la conexión con el oyente del registro de auditoría, invalidando la caché de consultas de 'dashboard' cada vez que se reciben nuevos eventos de auditoría. Esto activa actualizaciones automáticas de consultas de TanStack sin recargar la página ni realizar sondeos basados en intervalos.",
    },
    selfServiceSignup: {
      title: "Registro de autoservicio e incorporación B2B2C",
      description:
        "Saga automatizada de incorporación de múltiples inquilinos con OTP de verificación, resolución de moneda regional e integración de Stripe.",
      intro:
        "SCRIPE cuenta con un completo motor de incorporación de inquilinos de autoservicio B2B2C orquestado a través de una sólida saga de dos fases. Coordina las transacciones de la base de datos, la configuración de la suscripción, las conexiones de facturación y proporciona reversiones de compensación automáticas si se abandonan los pagos.",
      flowTitle: "Flujo de incorporación",
      phase1Title: "Fase 1: Transacción de identidad y aprovisionamiento",
      phase1Intro:
        "Fase 1 se ejecuta en una única transacción de base de datos. Genera el espacio de trabajo del inquilino, conecta el subdominio predeterminado, aprovisiona la configuración, crea los roles de seguridad predeterminados y crea la cuenta del usuario administrador propietario.",
      validationTitle: "Validación de subdominio e identidad",
      validationIntro:
        "Para mantener la seguridad y evitar conflictos de enrutamiento, el sistema de incorporación aplica reglas de formato estrictas y verifica la disponibilidad del subdominio frente a una lista negra de palabras reservadas.",
      tableConstraint: "Restricción",
      tableRule: "Regla / Patrón",
      tableReason: "Razón de seguridad",
      emailVerificationTitle: "Tickets de verificación de correo electrónico",
      emailVerificationIntro:
        "Antes de que pueda comenzar una saga, se debe verificar el correo electrónico del cliente potencial. El sistema emite un boleto firmado criptográficamente con HMAC-SHA256 con un tiempo de vencimiento de 15 minutos.",
      phase2Title: "Fase 2: Derechos y transferencia de facturación",
      phase2Intro:
        "La Fase 2 vincula al inquilino recién creado con el módulo Entitlements. Si la edición elegida es de pago, el sistema genera una sesión de pago de Stripe y redirige al usuario.",
      compensationWarning:
        "Si el usuario abandona una sesión de pago de pago o no se inicializa, el sistema ejecuta un flujo de compensación automática (CompensatePhase1Async) para revertir las creaciones del inquilino y del administrador, evitando cuentas huérfanas.",
    },
    view: "Ver características",
    create: "Crear característica",
    update: "Actualizar característica",
    delete: "Eliminar característica",
    "*": "Todos los permisos de características",
  },
};

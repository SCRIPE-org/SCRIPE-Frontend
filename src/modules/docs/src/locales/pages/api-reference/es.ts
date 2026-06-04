/**
 * Docs page locale — ES
 */
export const es = {
  apiReference: {
    adminApi: {
      actionsTitle: "Cortes Rápidos (Account Actions)",
      activateDesc:
        "Permitir la reactivación instantánea y normalización de labores del administrador.",
      blockDesc:
        "Operación de seguridad alta para reprimir e impedir físicamente cualquier validación en progreso (Suspicious behavior block).",
      bulkActivateDesc: "Reactivación masiva.",
      bulkDeactivateDesc: "Desactivación selectiva paralela de cientos de operadores.",
      bulkDeleteAllDesc:
        "Filtrar por 'Todos los del Role A' y aniquilarlos ignorando los excluidos en el listado negro (ExcludeIds).",
      bulkDeleteDesc: "Disparar borrado de la lista seleccionada.",
      bulkIntro:
        "En vez de recorrer un bucle en Frontend, el Backend se ocupa en bloque y transacción SQL unitaria sobre todo el array de datos.",
      bulkTitle: "Armas de Acción Masiva (Bulk)",
      createDesc:
        "Insertar a una persona a la lista de nómina u operarios técnicos, asociándolo a un Rol Base y enrutando a un inquilino.",
      crudTitle: "Comandos CRUD Directos",
      deactivateDesc: "Quitar el switch IsActive a False congelando su AccessToken en la red.",
      deleteDesc:
        "Matar la entidad del Admin pero no destruirla completamente por resiliencia histórica.",
      description:
        "Operaciones de CRUD de personas, congelamiento, expulsiones masivas y la arquitectura de suplantación técnica.",
      getByIdDesc: "Exposición masiva de la ficha del administrador.",
      impersonateDesc:
        "Convertirte en ese usuario y emitir las mismas credenciales pero atadas en Log a ti como actor responsable original. Facilita ver fallas de UI del operario inferior.",
      impersonationTitle: "Técnicas de Suplantación (Impersonation)",
      impersonationWarning:
        "Toda alteración mientras estés en 'Impersonation' deja rastro en auditoría para certificar la manipulación del SuperAdmin y no culpar al Admin original de un daño causado en este estado.",
      intro:
        "Motor de búsqueda, control y represión/ayuda a los operadores integrados a un Inquilino de SCRIPE.",
      listDesc:
        "Motor de búsqueda con parámetros y proyecciones acotadas de todos los miembros del equipo.",
      protectDesc:
        "Evitar que el usuario sufra borrados o bloqueos masivos por error inyectándole protección al sistema principal de bases de datos.",
      queryParamsTitle: "Acerca de la Manipulación de Filtros URL",
      resetPasswordDesc: "Envíale una bomba de reseteo para forzar un olvido sin consultarle.",
      stopImpersonateDesc: "Cerrar la sesión falsa del usuario al que simulabas.",
      title: "API de Administración (Directorio Interno)",
      transferDesc:
        "La acción de coronar a otro Admin protegido (Owner). Te desvincula de tu propiedad irreversiblemente a nivel de Sistema.",
      unblockDesc: "Quitar bloqueo tras investigación técnica.",
      unlockDesc:
        "Perdonar de antemano el bloqueo automático de 15 minutos por ataques de contraseñas equivocadas.",
      updateDesc: "Ajustar nombres o estados del administrador.",
    },
    authApi: {
      changePasswordDesc: "Autocambio transaccional de contraseña desde la configuración.",
      configTitle: "Puntos de Operación (Base)",
      description: "Login para Operadores, gestión 2FA, perfiles y bitácora criptográfica.",
      intro: "El portal general para acceso al panel administrativo de la consola de SCRIPE.",
      loginDesc:
        "Entrega un Access y un Refresh Token validando credenciales y reglas del Inquilino.",
      loginTitle: "Login (Ingreso)",
      logoutDesc:
        "Desvincula las cookies y desautoriza inmediatamente el Refresh Token desde la base de datos.",
      logoutTitle: "Cierre de Sesión",
      meDesc: "Datos adjuntos y generales de la estructura del admin en su contexto JWT.",
      profileTitle: "Autocontrol del Perfil",
      refreshDesc: "Entrega un nuevo Access token en vida rotando la credencial a la par.",
      refreshTitle: "Refresco del Access Token",
      removeAvatarDesc: "Regresa a las iniciales genéricas.",
      revokeSessionDesc: "Expulsar remotamente una sesión y colapsar su navegación.",
      securityLogDesc:
        "Resumen de acceso físico del usuario extraído directamente de la colección de Auditoría.",
      securityTip:
        "A diferencia del histórico de seguridad de todo el sistema, estos endpoints le permiten al administrador normal ver solo las interacciones de su cuenta específica.",
      securityTitle: "Inspecciones de Seguridad",
      sessionsDesc:
        "Búsqueda completa de dispositivos y navegadores activos con tu credencial conectada a Internet.",
      tfaBackupDesc:
        "Reseteo exhaustivo de claves de respaldo (Anula las impresas y crea una colección distinta).",
      tfaConfirmDesc:
        "Prueba definitiva para dar de alta un dispositivo celular y obtener la impresión de Backups.",
      tfaDisableDesc: "Desecha y retira la protección de la bóveda del administrador.",
      tfaEnableDesc: "Emite el Código semilla y formato de Imagen QR.",
      tfaIntro:
        "Mecanismo para evitar suplantaciones de identidades a niveles super-administrativos.",
      tfaTitle: "Validación y Operación 2FA",
      tfaVerifyDesc:
        "Continuación del endpoint de Login si la cuenta está amarrada a un dispositivo TOTP.",
      title: "API de Autenticación (Admin)",
      updateProfileDesc: "Suministración de teléfonos y correcciones menores.",
      uploadAvatarDesc:
        "Inyección de foto o gráfica para mostrar arriba a la derecha en el Panel (max 2 MB).",
    },
    overview: {
      adminEndpointsTitle: "Endpoints del Panel Administrativo",
      authEndpointsTitle: "Endpoints de Identidad",
      baseInfoTitle: "Formato y Consideraciones Base",
      description:
        "Documentación completa de REST con endpoints, ejemplos e instrucciones de Autorización.",
      intro:
        "Todos los llamados del servidor exigen JWT (Bearer) a excepción de las rutas transaccionales declaradas como públicas (por ejemplo Login y ForgotPassword).",
      otherEndpointsTitle: "Agrupación de Sistemas Auxiliares",
      responseFormatTitle: "Estándar de Sobre de Respuesta",
      roleEndpointsTitle: "Endpoints del Control RBAC",
      swaggerTip:
        "Las pruebas interactivas deben ser ejecutadas desde la ruta /swagger bajo tu ambiente local (localhost).",
      tenantEndpointsTitle: "Endpoints de Gestión de Inquilinos",
      title: "Referencia de la API",
      userEndpointsTitle: "Endpoints de Clientes Finales",
    },
    rolePermissionApi: {
      assignPermDesc:
        "Bomba Nuke and Pave. Toma un Array de IDs de permiso y proyecciones de ocultamiento de campos JSON y pisa los datos completos de manera atómica transaccional.",
      assignTitle: "Adherir Capacidades e Incrustar Privilegios",
      availableForTenantDesc: "Vista general a disposición de inquilino objetivo.",
      availablePermDesc:
        "Las llaves físicas de funciones de Backend a las que este inquilino realmente está suscrito (Pool de capacidades).",
      categoriesDesc:
        "Agrupador natural (Users.*, Audits.*, Payments.*) para pintarlo en checkboxes de React organizados visualmente.",
      cloneRoleDesc:
        "Acelera el despliegue creando algo idéntico como base ('Admin de Nivel 2' basado en 'Admin de Nivel 1' para ajustar pequeñas cosas).",
      createRoleDesc: "Agrupa una nueva denominación, como 'Revisor Fiscal'.",
      deleteRoleDesc:
        "Frena su propio borrado si existen administradores que quedarían huérfanos sin Rol de sistema asociado.",
      description:
        "Generación de entidades de rol (Job Titles), incrustación destructiva de JSONs y el inventario sembrado del código fuente.",
      getPermByIdDesc: "Pide detalles puros.",
      getPermDesc:
        "Trae los switches marcados y campos bloqueados en un Rol determinado en un formato de grilla para interfaces de React UI.",
      getRoleDesc:
        "Pide el bloque con las llaves autorizadas en ese Perfil y también los menús prohibidos / visibles en la barra lateral.",
      intro:
        "SCRIPE usa perfiles en lugar de permisos directos a las personas, las personas heredan el Perfil (Rol) atado al Inquilino, el cual lleva todas las llaves y candados.",
      listPermissionsDesc: "Devuelve todos los puntos compilados descubiertos por Reflexión de C#.",
      listRolesDesc: "Buscador de los Títulos de Trabajo dentro del Inquilino.",
      myPermissionsDesc:
        "Trae exactamente a qué estás autorizado desde el scope generalizado de tu JWT.",
      myTenantRolesDesc: "La colección local permitida.",
      permissionsIntro:
        "Ningún Inquilino puede inyectar nuevos Permisos (Actions) vía POST de API. Tienen que estar declarados en código fuente, compilados en los ensamblados en C# a manera física como Atributos.",
      permissionsTitle: "Las Llaves Madres (Read-Only)",
      rolesCrudTitle: "Comandos CRUD del Rol (Job Title)",
      seededNote:
        "Los Permisos Base de Código no pueden borrarse por API. Tienes que ir al archivo Backend y eliminar el método API. Al volver a correr, la base de datos se sincriniza destruyendo el permiso.",
      syncScopesDesc:
        "Refuerza que un permiso especial (Scopes o Filtros por ramas) se valide y se obligue al hijo de acuerdo al perfil paterno original.",
      tenantScopedIntro:
        "Asegura la protección de la plataforma previniendo que Inquilinos inferiores se inventen roles para otorgarse privilegios de sistema maestros.",
      tenantScopedTitle: "Contención y Visualización RBAC por Inquilino",
      title: "API de Permisos y Roles (El Núcleo RBAC)",
      updateRoleDesc: "Renombra o altera la descripción del Perfil o el MenuVisible.",
    },
    systemApi: {
      blockedIpsDesc: "Estadísticas del Rate Limiting nativo.",
      createMenuDesc:
        "Alta desde la Base de datos sin requerir redespliegue de NPM de Next JS para añadir pantallas operativas nuevas al Sidebar.",
      dashboardExportTitle: "Capturadores Oficiales PDF del Dashboard (Export)",
      dashboardIntro:
        "Secciones que levantan la cuenta general de entidades por inquilino y miden su vida global.",
      dashboardTitle: "Información e Inteligencia de Negocio (Dashboard Analytics)",
      deleteFileDesc: "Matar un documento del disco y la tabla.",
      deleteMenuDesc:
        "Destruir una pantalla y su ramificación de URLs hijas al momento de desautorizar una feature corporativa para que el Sidebar oculte y enrute a Forbidden.",
      description:
        "Recolección de las pantallas gerenciales, controles de árboles dinámicos del MenuSidebar y revisiones médicas generales de Infraestructura de la base.",
      downloadDesc:
        "Recepción segura para traer un archivo validado o un chorro (Stream) grande si es película.",
      eventDistDesc:
        "Generador de proporciones en crudo procesadas a nivel C# para armar el Pie Chart.",
      exportAnalyticsDesc: "Adjuntos PDF para métricas puras.",
      exportOverviewDesc:
        "Lleva el resumen tabular al reporte Excel plano y PDF visual del Director General de Operaciones sin que este tenga clave.",
      exportSecurityDesc:
        "Reporte con base legal para equipos azules (Blue teams / Security Center).",
      filesTitle: "Gestor y Disparadores del Storage File System Local/S3",
      getSettingsDesc:
        "Lo que usa toda la maquinaria del Scripe. El token Master que el sistema trae del Redis o la DB en milisegundos al levantar.",
      intro:
        "La conexión de inteligencia con datos vivos procesados en RAM por C# antes de servirse al dashboard y a los enrutamientos maestros.",
      listDeletedDesc:
        "El Inquilino usa IgnoreFilters para recuperar la lista que yace latente marcada como borrada en las tripas de la base con su ID, Fechas y Tiempos de Gracia de Salvación.",
      listMenusDesc:
        "La lectura inicial de React FrontEnd que hace anidado para mostrar o apagar árboles del Drawer Izquierdo.",
      loginActivityDesc:
        "Señal cronológica para el componente de gráficos de serie y línea del login y su salud.",
      menuTitle: "Modelado Dinámico de Barra Sidebar (Menu Control)",
      myMenuDesc:
        "El Front pide en la raíz el Menú y cruza contra las autorizaciones del Inquilino. Se suprimen URLs y grupos que el Admin no puede tener.",
      myOverridesDesc: "Saca los Overrides permitidos en esa instancia.",
      purgeDesc:
        "DELETE verdadero para destruir las reliquias. Purga atómica irreversible por cumplimiento de Leyes del Privacidad (Data Annihilation).",
      readinessDesc:
        "Probe especial del /Health API ASP.NET Core nativo para el orquestador Docker o IIS. Retorna status 200 OK si y solo si bases de datos y caché y Hangfire responden. Sirve de salvavidas en balanceos de carga automatizados para decirle a la red si este Nodo sigue vivo y puede procesar.",
      recentChangesDesc:
        "Tabla Feed que lee los registros top desc de Auditoría para que el líder de equipo vea movimiento sin bucear a páginas de log.",
      recycleBinTitle: "API de la Bóveda de Borrado o Papelera Global",
      reorderMenuDesc:
        "Endpoint masivo que lee Drag and Drop array position 0 a N del JSON en Frontend y repisa en DB transaccional el índice de Orden para que el sistema aprenda.",
      resetSettingsDesc:
        "Volver al Appsettings JSON o variables de Factory limpias del día del Despliegue, eliminando errores por modificaciones humanas graves.",
      restoreDesc: "Orden milagrosa de anular IsDeleted en milisegundos sin arrastre.",
      roleVisibilityDesc:
        "Acople que niega la URL al Sidebar Menu según la clase u oficio del Administrador (Role mapping de Menú a permisos).",
      securityEventsDesc:
        "Los 5 ataques peores a logins o alteraciones raras del mes condensado en Alertas Rojas (Red Flags).",
      settingsTitle: "Inyección al Core de Parámetros Generales. (Global Settings)",
      summaryDesc:
        "Bloques (Cards) de arriba del dashboard en React. Conteos ligeros en C# con agrupaciones.",
      tenantOverrideDesc:
        "Excepción del Sistema: la empresa central modifica el Título 'Usuarios' a 'Doctores' para el inquilino 'Hospital Norte' sin romper la plataforma en los demás Inquilinos.",
      title: "API del Sistema Core de Control y Entorno (Global & Dashboard)",
      updateMenuDesc: "Edición dinámica (Ej. Cambiar de ícono 'User' a 'Users').",
      updateSettingsDesc:
        "Sobreescritura en caliente. Un Save apaga configuraciones globales al segundo.",
      uploadDesc:
        "Pide el Binario en formData, la capa de infraestructura lo avienta al S3 MinIO o Azure Blob y contesta la URL y GUID resuelto de éxito.",
    },
    tenantApi: {
      adminsDesc:
        "Retorna un array de la nómina de administradores del inquilino objetivo en específico.",
      childrenDesc: "Busca 1 nivel descendente sobre el inquilino indicado.",
      createDesc: "Añade un hijo directo al inquilino que hizo la llamada.",
      crudTitle: "Comandos CRUD del Inquilino",
      deleteDesc:
        "Operación pesada que hace de baja en cascada para apagar inquilinos que anulen suscripciones (Baja de sistema completa de Tenant y todo lo que albergaba internamente).",
      description:
        "CRUD de empresas, gestión de configuraciones internas, límites numéricos y visibilidad del árbol de dependencias.",
      getByIdDesc: "Pide metadatos de cuotas y propiedades del inquilino objetivo.",
      getSettingsDesc: "Accede al objeto TenantSettings (las políticas, la estética de marca).",
      hierarchyDesc: "Retorna el objeto JSON del árbol.",
      hierarchyIntro:
        "Saca al padre, sucursal, hijos y hojas finales en formato de objeto de árbol jerárquico estricto.",
      hierarchyTitle: "Lectura del Árbol (Hierarchy)",
      intro:
        "La orquestación de la arquitectura SCRIPE donde los inquilinos tienen a sus operarios bajo la sombrilla del tenant. Soporta sucursales anidadas al infinito.",
      listDesc: "Busca con indexación todos los hijos y los lista al árbol en modo tabla general.",
      myChildrenDesc: "Busca tu nivel descendente inmediato basándose en tu propio Scope del JWT.",
      mySettingsDesc:
        "Edición rápida referenciada al inquilino original tuyo, sin tener que inyectar el parámetro GUID UUID del tenant.",
      permissionsDesc: "Permisos crudos en formato plano.",
      rolesDesc:
        "Extrae el esquema RBAC de ese contenedor de empresa para clonaciones y visualizaciones.",
      settingsNote:
        "Si una empresa matriz decide restringir algo, la rama (Tenant-hijo) no podrá sobrescribirlo jamás a no ser que el control general lo apruebe desde arriba de la estructura.",
      settingsTitle: "Configuraciones Profundas por Inquilino",
      statsDesc: "Datos agrupados o Count de lo albergado por este contenedor de empresa.",
      title: "API de Inquilinos (Gestión Multitenant)",
      updateDesc: "Modifica información básica.",
      updateSettingsDesc:
        "Modificación a las políticas de seguridad y topes de almacenamiento permitidos en ese inquilino.",
      uploadLogoDesc:
        "Fija de forma estática la foto del logo del inquilino, útil para pantallas de Login Blancas Customizadas (White-Label UI).",
    },
    userAuthApi: {
      changePasswordDesc: "Control general de clave activa.",
      configTitle: "Puntos de Operación (Base)",
      description:
        "Login autoservicio (Self-Service) para las personas que consumen al inquilino, reseteo, OAuth y 2FA móvil.",
      diffNote:
        "NUNCA debes cruzar y solicitar un Refresh Token Administrativo en un endpoint de usuario común. Ambos arrojan 401 entre sí para aislar a los clientes y administradores totalmente a nivel físico de base de datos.",
      externalIntro:
        "Derivaciones de Tokens a proveedores sociales. SCRIPE validará que Apple o Google no emitan tokens falsos y los enlazará.",
      externalLoginDesc: "Firma única, asocia a la cuenta un perfil social externo.",
      externalTitle: "OAuth Externos (SSO)",
      forgotPasswordDesc:
        "Dispara un OTP a la cuenta registrada. Siempre da 200 OK para prevenir la enumeración de cuentas por atacantes.",
      intro:
        "La entrada para los clientes o usuarios comunes externos al personal corporativo SCRIPE.",
      loginDesc: "Expide la cadena JWT exclusiva para permisos y tokens de usuario común.",
      loginTitle: "Ingreso",
      logoutDesc: "Expulsa la firma.",
      meDesc: "Información y banderas de verificación de estados.",
      passwordResetTitle: "Reseteo y Olvido de Claves",
      profileTitle: "Perfil de Cliente (Usuario Común)",
      refreshDesc:
        "Igual que el sistema admin, rota las llaves expiradas en milisegundos sin cerrar la pantalla.",
      registerDesc: "Darse de alta. Envía correo en automático tras almacenar contraseña cifrada.",
      registerTitle: "Registro Autoservicio",
      resetPasswordDesc: "Sello final para quemar el OTP y fijar una clave de reemplazo válida.",
      sendVerificationDesc:
        "Pide el envío de la constancia (sujeto a límite de tasa antispam severo).",
      summaryTitle: "Aclaratoria de Rutas",
      tfaBackupDesc: "Revolución de nuevos códigos impresos.",
      tfaConfirmDesc: "Emisor de Tokens de respaldo.",
      tfaDisableDesc: "Sacar protección del usuario.",
      tfaEnableDesc: "QR generador.",
      tfaTitle: "2FA para Usuarios Comunes",
      tfaVerifyDesc: "Completar la conexión del login bloqueado.",
      title: "API de Autenticación de Usuario",
      tokenTitle: "Controles de Accesibilidad",
      updateProfileDesc: "Edición simple.",
      verificationTitle: "Activación (Correo y SMS)",
      verifyEmailDesc:
        "Inyectar el código para validar propiedad del email y quitar banderas rojas en la base de datos.",
      verifyPhoneDesc: "Inyectar código OTP SMS.",
    },
    userGroupsApi: {
      addMembersDesc:
        "Dispara la creación de relaciones Junction ignorando colisiones si el Admin ya formaba parte de esto en un ciclo previo para no crashear (Idempotencia en POST).",
      bulkActivateDesc: "Re-encendido generalizado. Reaviva grupos.",
      bulkCascadeIntro:
        "Potencializa a SuperAdmin y Tenant-Admins operando sobre múltiples grupos. Puedes decidir si la orden baja y contamina a los miembros y no solo al esqueleto vacío del Grupo.",
      bulkCascadeTitle: "Armas en Cascada Masivas e Instantáneas",
      bulkDeactivateDesc:
        "Re-apagado de Grupos. Anula en bloque los grupos desabilitando el ingreso al App Front para todo el esquema inferior.",
      bulkDeleteDesc:
        "Eliminación paralela al basurero con modo optativo en cascada arrasador a operarios.",
      cascadeWarningNode:
        "Aviso de Seguridad en Pipeline: Si decides arrastrar cascada destructiva a Admins, el sistema buscará el atributo Protected (isProtectedFlag=True del SystemOwner) y se brincará silenciosamente el comando hacia este humano salvando su cuenta y aniquilando al resto del grupo.",
      createGroupDesc:
        "Post de creación que hace doble check verificando si los RolIDs enviados también son parte integral de ese mismo inquilino para no permitir contaminación de IDs de Rol falsificados externos.",
      createGroupMyTenantDesc: "Formato de Inserción rápido local al JWT Context.",
      crudTitle: "Comandos CRUD del Grupo",
      deleteGroupDesc:
        "Acabar la estructura (El sistema saca a los Admins sin afectarlos, y deja el Grupo en estado IsDeleted=true).",
      description:
        "Orquestación en masa y plantillas operativas. Simplifica el mantenimiento conectando a cientos de operarios a plantillas de reglas y roles en un paso.",
      getGroupDesc:
        "Expande profundamente. Retorna sus Administradores y sus esquemas de restricciones del Array Roles de JSON incrustados en su interior.",
      groupMembersIntro:
        "Modificadores de la tabla Junction entre Admins y su Grupo Contenedor Principal.",
      groupMembersTitle: "Adición e Interfaz de Recursos a Grupos",
      groupRolesRestrictionsIntro:
        "Endpoint centralizado de control de inyecciones RBAC y JSON Proyections para el conglomerado de gente dependiente a esta entidad.",
      groupRolesRestrictionsTitle:
        "Edición Quirúrgica a las Partes Integrantes del Contenedor de Grupo",
      groupsByTenantDesc:
        "Herramienta que salta la arquitectura Inquilina actual para auditar a otra empresa mediante SuperAdmin.",
      intro:
        "Si deseas promover a un grupo de la sucursal de 'Ventas' dándoles privilegios nuevos, alterar el grupo actualizará sin fisuras a los 100 operarios sin tener que hacerlo uno a uno en la base de datos.",
      listGroupsDesc: "Manejador Paginado para grillas.",
      myTenantGroupsDesc:
        "Formato recortado para alimentar Auto-Completes y Dropdowns nativos en la interfaz.",
      removeMemberDesc:
        "Aísla a la persona del grupo destruyendo sus roles extra en la unión sin intervenir roles nativos del operario en particular.",
      setGroupRestrictionsDesc:
        "Destruir y recrear el Objeto de proyecciones RestrictedFields y FieldLevels para el Grupo atómico.",
      setGroupRolesDesc:
        "Destruir y recrear arreglo del JunctionGroupRole completo de nuevo a modo transaccional.",
      title: "API de Grupos de Usuarios",
      updateGroupDesc:
        "Operación de reemplazo a metadatos sumada a la alteración Nuke and Pave de Roles al mismo instante de DB Saving.",
    },
    webhookEmailApi: {
      cancelEmailDesc:
        "Interceptar y matar la orden de envío encolada antes que Hangfire la despache si es que estás a tiempo.",
      createTemplateDesc:
        "Suministro e integración desde el Front de HTML enriquecido e importación de la plantilla base.",
      createWebhookDesc:
        "Crear suscripción de Webhook que emite el HASH Seed originario de seguridad.",
      deleteNotifDesc: "Botar definitivamente a la papelera oculta.",
      deleteTemplateDesc: "Borrado de base de datos.",
      deleteWebhookDesc: "Matar suscripción (desvincula a tus sistemas externos de eventos).",
      description:
        "Puentes asíncronos para sistemas, integraciones a CRMs y motores transaccionales directos para usuarios.",
      emailIntro:
        "Canalizado con protección de repetición y reintentos (SMTP Protocol) blindado con encolador. Cero atascos en el cliente Frontend Web que generó la llamada.",
      emailStatsDesc: "Gráficas operativas sobre caídas en red o porcentajes de error (Bounces).",
      emailTitle: "Motor de Email Centralizado",
      getTemplateDesc: "Código interno de la plantilla solicitada.",
      intro:
        "No se interviene con la carga de la API, estas operaciones se meten a túneles asíncronos respaldados por colas de eventos (Hangfire).",
      listEmailsDesc:
        "Histórico general log de operaciones que fallaron (Bad Request, SMTP Error, Spam filter).",
      listNotificationsDesc:
        "Saca los históricos locales no vistos de la barra superior del usuario.",
      listTemplatesDesc: "Catálogo General de plantillas.",
      listWebhooksDesc: "Paginador estándar.",
      markAllReadDesc:
        "Actualización UPDATE atómica y asíncrona a todos los hijos sin tener que llamar la lista entera y matarla individualmente desde el cliente.",
      markReadDesc: "Poner False a bandera isUnread de la alerta específica elegida con un Click.",
      notificationsTitle: "Hub de Notificaciones En Sistema (In-App Push)",
      previewTemplateDesc:
        "Forzamiento de Render en línea contra un modelo de objeto crudo simulado que te arroja cómo luce verdaderamente antes del guardado.",
      renderTemplateDesc:
        "Salida definitiva del motor (Output) separando la capa texto en bruto (Fallback text) y el HTML completo procesado a la perfección.",
      resendEmailDesc: "Levantar el log fallido y empujar al retry del encolador.",
      searchRecipientsDesc:
        "Autocompletar barra del UI del Front para no inventar destinatarios y cruzarlo a la BD limpia.",
      searchTargetsDesc:
        "Encuentra la UID al momento de programar alertas personalizadas que requieran cruces específicos entre el Backoffice y usuarios finales.",
      sendBulkDesc:
        "Mandar en un batacazo un evento masivo por array JSON con variables sustitutivas y un ID plantilla particular para Mail-marketing o alertas masivas (Emergency Push).",
      sendEmailDesc:
        "Dispara el servicio para reemplazar una plantilla general con el nombre puntual y mandar al SMTP de salida con un objeto Payload JSON.",
      signalrTip:
        "Toda alerta generada internamente entra a una doble canalización: Graba permanentemente el mensaje y manda un pulso por Sockets que, si tu usuario casualmente está en la web navegando su dashboard, se le aparecerá sin tener que refrescar el Explorer en un milisegundo.",
      templatesIntro:
        "Paredes de texto y HTML base inyectado de plantillas Liquid donde las llaves de C# entran y sustituyen variables crudas (Hi {{UserName}}, Your Token is {{ActivationToken}}!).",
      templatesTitle: "Construcción de Piezas Liquid Scriban (Templates)",
      testWebhookDesc:
        "Validar ping entre tu servidor y SCRIPE para descartar bloqueos de firewall antes de usarlo.",
      title: "API de Comunicación Externa: Webhooks y Mensajería",
      unreadCountDesc:
        "El pequeño globito de alarma numérico. Trae el Int32 bruto para evitar conteos gigantescos de UI Client-Side.",
      updateTemplateDesc: "Mejora de plantillas / actualización gramatical.",
      updateWebhookDesc:
        "Alteración transitoria (poner en pausa / cambiar la URL objetivo de envío).",
      webhooksIntro:
        "Tiras un evento, SCRIPE tira un POST JSON con la información en bruto con firma HMAC al servidor de tu cliente para actualizar sus inventarios automáticos fuera de SCRIPE.",
      webhooksTitle: "Suscripciones (Webhooks)",
    },
  },
};

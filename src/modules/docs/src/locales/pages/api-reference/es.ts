/**
 * Docs page locale — ES
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const es = {
  apiReference: {
    overview: {
      title: "Referencia de la API",
      description:
        "Documentación completa de REST con endpoints, ejemplos e instrucciones de Autorización.",
      intro:
        "Todos los llamados del servidor exigen JWT (Bearer) a excepción de las rutas transaccionales declaradas como públicas (por ejemplo Login y ForgotPassword).",
      baseInfoTitle: "Formato y Consideraciones Base",
      authEndpointsTitle: "Endpoints de Identidad",
      adminEndpointsTitle: "Endpoints del Panel Administrativo",
      userEndpointsTitle: "Endpoints de Clientes Finales",
      roleEndpointsTitle: "Endpoints del Control RBAC",
      tenantEndpointsTitle: "Endpoints de Gestión de Inquilinos",
      otherEndpointsTitle: "Agrupación de Sistemas Auxiliares",
      responseFormatTitle: "Estándar de Sobre de Respuesta",
      swaggerTip:
        "Las pruebas interactivas deben ser ejecutadas desde la ruta /swagger bajo tu ambiente local (localhost).",
    },
    authApi: {
      title: "API de Autenticación (Admin)",
      description: "Login para Operadores, gestión 2FA, perfiles y bitácora criptográfica.",
      intro: "El portal general para acceso al panel administrativo de la consola de NEXORA.",
      configTitle: "Puntos de Operación (Base)",
      loginTitle: "Login (Ingreso)",
      loginDesc:
        "Entrega un Access y un Refresh Token validando credenciales y reglas del Inquilino.",
      refreshTitle: "Refresco del Access Token",
      refreshDesc: "Entrega un nuevo Access token en vida rotando la credencial a la par.",
      logoutTitle: "Cierre de Sesión",
      logoutDesc:
        "Desvincula las cookies y desautoriza inmediatamente el Refresh Token desde la base de datos.",
      tfaTitle: "Validación y Operación 2FA",
      tfaIntro:
        "Mecanismo para evitar suplantaciones de identidades a niveles super-administrativos.",
      tfaEnableDesc: "Emite el Código semilla y formato de Imagen QR.",
      tfaConfirmDesc:
        "Prueba definitiva para dar de alta un dispositivo celular y obtener la impresión de Backups.",
      tfaVerifyDesc:
        "Continuación del endpoint de Login si la cuenta está amarrada a un dispositivo TOTP.",
      tfaDisableDesc: "Desecha y retira la protección de la bóveda del administrador.",
      tfaBackupDesc:
        "Reseteo exhaustivo de claves de respaldo (Anula las impresas y crea una colección distinta).",
      profileTitle: "Autocontrol del Perfil",
      meDesc: "Datos adjuntos y generales de la estructura del admin en su contexto JWT.",
      updateProfileDesc: "Suministración de teléfonos y correcciones menores.",
      changePasswordDesc: "Autocambio transaccional de contraseña desde la configuración.",
      uploadAvatarDesc:
        "Inyección de foto o gráfica para mostrar arriba a la derecha en el Panel (max 2 MB).",
      removeAvatarDesc: "Regresa a las iniciales genéricas.",
      securityTitle: "Inspecciones de Seguridad",
      securityLogDesc:
        "Resumen de acceso físico del usuario extraído directamente de la colección de Auditoría.",
      sessionsDesc:
        "Búsqueda completa de dispositivos y navegadores activos con tu credencial conectada a Internet.",
      revokeSessionDesc: "Expulsar remotamente una sesión y colapsar su navegación.",
      securityTip:
        "A diferencia del histórico de seguridad de todo el sistema, estos endpoints le permiten al administrador normal ver solo las interacciones de su cuenta específica.",
    },
    userAuthApi: {
      title: "API de Autenticación de Usuario",
      description:
        "Login autoservicio (Self-Service) para las personas que consumen al inquilino, reseteo, OAuth y 2FA móvil.",
      intro:
        "La entrada para los clientes o usuarios comunes externos al personal corporativo NEXORA.",
      configTitle: "Puntos de Operación (Base)",
      registerTitle: "Registro Autoservicio",
      registerDesc: "Darse de alta. Envía correo en automático tras almacenar contraseña cifrada.",
      loginTitle: "Ingreso",
      loginDesc: "Expide la cadena JWT exclusiva para permisos y tokens de usuario común.",
      externalTitle: "OAuth Externos (SSO)",
      externalIntro:
        "Derivaciones de Tokens a proveedores sociales. NEXORA validará que Apple o Google no emitan tokens falsos y los enlazará.",
      externalLoginDesc: "Firma única, asocia a la cuenta un perfil social externo.",
      verificationTitle: "Activación (Correo y SMS)",
      verifyEmailDesc:
        "Inyectar el código para validar propiedad del email y quitar banderas rojas en la base de datos.",
      verifyPhoneDesc: "Inyectar código OTP SMS.",
      sendVerificationDesc:
        "Pide el envío de la constancia (sujeto a límite de tasa antispam severo).",
      passwordResetTitle: "Reseteo y Olvido de Claves",
      forgotPasswordDesc:
        "Dispara un OTP a la cuenta registrada. Siempre da 200 OK para prevenir la enumeración de cuentas por atacantes.",
      resetPasswordDesc: "Sello final para quemar el OTP y fijar una clave de reemplazo válida.",
      tokenTitle: "Controles de Accesibilidad",
      refreshDesc:
        "Igual que el sistema admin, rota las llaves expiradas en milisegundos sin cerrar la pantalla.",
      logoutDesc: "Expulsa la firma.",
      tfaTitle: "2FA para Usuarios Comunes",
      tfaEnableDesc: "QR generador.",
      tfaConfirmDesc: "Emisor de Tokens de respaldo.",
      tfaVerifyDesc: "Completar la conexión del login bloqueado.",
      tfaDisableDesc: "Sacar protección del usuario.",
      tfaBackupDesc: "Revolución de nuevos códigos impresos.",
      profileTitle: "Perfil de Cliente (Usuario Común)",
      meDesc: "Información y banderas de verificación de estados.",
      updateProfileDesc: "Edición simple.",
      changePasswordDesc: "Control general de clave activa.",
      summaryTitle: "Aclaratoria de Rutas",
      diffNote:
        "NUNCA debes cruzar y solicitar un Refresh Token Administrativo en un endpoint de usuario común. Ambos arrojan 401 entre sí para aislar a los clientes y administradores totalmente a nivel físico de base de datos.",
    },
    adminApi: {
      title: "API de Administración (Directorio Interno)",
      description:
        "Operaciones de CRUD de personas, congelamiento, expulsiones masivas y la arquitectura de suplantación técnica.",
      intro:
        "Motor de búsqueda, control y represión/ayuda a los operadores integrados a un Inquilino de NEXORA.",
      crudTitle: "Comandos CRUD Directos",
      listDesc:
        "Motor de búsqueda con parámetros y proyecciones acotadas de todos los miembros del equipo.",
      getByIdDesc: "Exposición masiva de la ficha del administrador.",
      createDesc:
        "Insertar a una persona a la lista de nómina u operarios técnicos, asociándolo a un Rol Base y enrutando a un inquilino.",
      updateDesc: "Ajustar nombres o estados del administrador.",
      deleteDesc:
        "Matar la entidad del Admin pero no destruirla completamente por resiliencia histórica.",
      actionsTitle: "Cortes Rápidos (Account Actions)",
      activateDesc:
        "Permitir la reactivación instantánea y normalización de labores del administrador.",
      deactivateDesc: "Quitar el switch IsActive a False congelando su AccessToken en la red.",
      blockDesc:
        "Operación de seguridad alta para reprimir e impedir físicamente cualquier validación en progreso (Suspicious behavior block).",
      unblockDesc: "Quitar bloqueo tras investigación técnica.",
      unlockDesc:
        "Perdonar de antemano el bloqueo automático de 15 minutos por ataques de contraseñas equivocadas.",
      resetPasswordDesc: "Envíale una bomba de reseteo para forzar un olvido sin consultarle.",
      bulkTitle: "Armas de Acción Masiva (Bulk)",
      bulkIntro:
        "En vez de recorrer un bucle en Frontend, el Backend se ocupa en bloque y transacción SQL unitaria sobre todo el array de datos.",
      bulkActivateDesc: "Reactivación masiva.",
      bulkDeactivateDesc: "Desactivación selectiva paralela de cientos de operadores.",
      bulkDeleteDesc: "Disparar borrado de la lista seleccionada.",
      bulkDeleteAllDesc:
        "Filtrar por 'Todos los del Role A' y aniquilarlos ignorando los excluidos en el listado negro (ExcludeIds).",
      impersonationTitle: "Técnicas de Suplantación (Impersonation)",
      impersonateDesc:
        "Convertirte en ese usuario y emitir las mismas credenciales pero atadas en Log a ti como actor responsable original. Facilita ver fallas de UI del operario inferior.",
      stopImpersonateDesc: "Cerrar la sesión falsa del usuario al que simulabas.",
      transferDesc:
        "La acción de coronar a otro Admin protegido (Owner). Te desvincula de tu propiedad irreversiblemente a nivel de Sistema.",
      protectDesc:
        "Evitar que el usuario sufra borrados o bloqueos masivos por error inyectándole protección al sistema principal de bases de datos.",
      impersonationWarning:
        "Toda alteración mientras estés en 'Impersonation' deja rastro en auditoría para certificar la manipulación del SuperAdmin y no culpar al Admin original de un daño causado en este estado.",
      queryParamsTitle: "Acerca de la Manipulación de Filtros URL",
    },
    tenantApi: {
      title: "API de Inquilinos (Gestión Multitenant)",
      description:
        "CRUD de empresas, gestión de configuraciones internas, límites numéricos y visibilidad del árbol de dependencias.",
      intro:
        "La orquestación de la arquitectura NEXORA donde los inquilinos tienen a sus operarios bajo la sombrilla del tenant. Soporta sucursales anidadas al infinito.",
      crudTitle: "Comandos CRUD del Inquilino",
      listDesc: "Busca con indexación todos los hijos y los lista al árbol en modo tabla general.",
      getByIdDesc: "Pide metadatos de cuotas y propiedades del inquilino objetivo.",
      createDesc: "Añade un hijo directo al inquilino que hizo la llamada.",
      updateDesc: "Modifica información básica.",
      deleteDesc:
        "Operación pesada que hace de baja en cascada para apagar inquilinos que anulen suscripciones (Baja de sistema completa de Tenant y todo lo que albergaba internamente).",
      hierarchyTitle: "Lectura del Árbol (Hierarchy)",
      hierarchyIntro:
        "Saca al padre, sucursal, hijos y hojas finales en formato de objeto de árbol jerárquico estricto.",
      hierarchyDesc: "Retorna el objeto JSON del árbol.",
      childrenDesc: "Busca 1 nivel descendente sobre el inquilino indicado.",
      myChildrenDesc: "Busca tu nivel descendente inmediato basándose en tu propio Scope del JWT.",
      statsDesc: "Datos agrupados o Count de lo albergado por este contenedor de empresa.",
      adminsDesc:
        "Retorna un array de la nómina de administradores del inquilino objetivo en específico.",
      rolesDesc:
        "Extrae el esquema RBAC de ese contenedor de empresa para clonaciones y visualizaciones.",
      permissionsDesc: "Permisos crudos en formato plano.",
      settingsTitle: "Configuraciones Profundas por Inquilino",
      getSettingsDesc: "Accede al objeto TenantSettings (las políticas, la estética de marca).",
      updateSettingsDesc:
        "Modificación a las políticas de seguridad y topes de almacenamiento permitidos en ese inquilino.",
      mySettingsDesc:
        "Edición rápida referenciada al inquilino original tuyo, sin tener que inyectar el parámetro GUID UUID del tenant.",
      uploadLogoDesc:
        "Fija de forma estática la foto del logo del inquilino, útil para pantallas de Login Blancas Customizadas (White-Label UI).",
      settingsNote:
        "Si una empresa matriz decide restringir algo, la rama (Tenant-hijo) no podrá sobrescribirlo jamás a no ser que el control general lo apruebe desde arriba de la estructura.",
    },
    rolePermissionApi: {
      title: "API de Permisos y Roles (El Núcleo RBAC)",
      description:
        "Generación de entidades de rol (Job Titles), incrustación destructiva de JSONs y el inventario sembrado del código fuente.",
      intro:
        "NEXORA usa perfiles en lugar de permisos directos a las personas, las personas heredan el Perfil (Rol) atado al Inquilino, el cual lleva todas las llaves y candados.",
      rolesCrudTitle: "Comandos CRUD del Rol (Job Title)",
      listRolesDesc: "Buscador de los Títulos de Trabajo dentro del Inquilino.",
      getRoleDesc:
        "Pide el bloque con las llaves autorizadas en ese Perfil y también los menús prohibidos / visibles en la barra lateral.",
      createRoleDesc: "Agrupa una nueva denominación, como 'Revisor Fiscal'.",
      updateRoleDesc: "Renombra o altera la descripción del Perfil o el MenuVisible.",
      deleteRoleDesc:
        "Frena su propio borrado si existen administradores que quedarían huérfanos sin Rol de sistema asociado.",
      cloneRoleDesc:
        "Acelera el despliegue creando algo idéntico como base ('Admin de Nivel 2' basado en 'Admin de Nivel 1' para ajustar pequeñas cosas).",
      assignTitle: "Adherir Capacidades e Incrustar Privilegios",
      assignPermDesc:
        "Bomba Nuke and Pave. Toma un Array de IDs de permiso y proyecciones de ocultamiento de campos JSON y pisa los datos completos de manera atómica transaccional.",
      getPermDesc:
        "Trae los switches marcados y campos bloqueados en un Rol determinado en un formato de grilla para interfaces de React UI.",
      syncScopesDesc:
        "Refuerza que un permiso especial (Scopes o Filtros por ramas) se valide y se obligue al hijo de acuerdo al perfil paterno original.",
      tenantScopedTitle: "Contención y Visualización RBAC por Inquilino",
      tenantScopedIntro:
        "Asegura la protección de la plataforma previniendo que Inquilinos inferiores se inventen roles para otorgarse privilegios de sistema maestros.",
      myTenantRolesDesc: "La colección local permitida.",
      availablePermDesc:
        "Las llaves físicas de funciones de Backend a las que este inquilino realmente está suscrito (Pool de capacidades).",
      permissionsTitle: "Las Llaves Madres (Read-Only)",
      permissionsIntro:
        "Ningún Inquilino puede inyectar nuevos Permisos (Actions) vía POST de API. Tienen que estar declarados en código fuente, compilados en los ensamblados en C# a manera física como Atributos.",
      listPermissionsDesc: "Devuelve todos los puntos compilados descubiertos por Reflexión de C#.",
      myPermissionsDesc:
        "Trae exactamente a qué estás autorizado desde el scope generalizado de tu JWT.",
      getPermByIdDesc: "Pide detalles puros.",
      categoriesDesc:
        "Agrupador natural (Users.*, Audits.*, Payments.*) para pintarlo en checkboxes de React organizados visualmente.",
      availableForTenantDesc: "Vista general a disposición de inquilino objetivo.",
      seededNote:
        "Los Permisos Base de Código no pueden borrarse por API. Tienes que ir al archivo Backend y eliminar el método API. Al volver a correr, la base de datos se sincriniza destruyendo el permiso.",
    },
    userGroupsApi: {
      title: "API de Grupos de Usuarios",
      description:
        "Orquestación en masa y plantillas operativas. Simplifica el mantenimiento conectando a cientos de operarios a plantillas de reglas y roles en un paso.",
      intro:
        "Si deseas promover a un grupo de la sucursal de 'Ventas' dándoles privilegios nuevos, alterar el grupo actualizará sin fisuras a los 100 operarios sin tener que hacerlo uno a uno en la base de datos.",
      crudTitle: "Comandos CRUD del Grupo",
      listGroupsDesc: "Manejador Paginado para grillas.",
      myTenantGroupsDesc:
        "Formato recortado para alimentar Auto-Completes y Dropdowns nativos en la interfaz.",
      getGroupDesc:
        "Expande profundamente. Retorna sus Administradores y sus esquemas de restricciones del Array Roles de JSON incrustados en su interior.",
      groupsByTenantDesc:
        "Herramienta que salta la arquitectura Inquilina actual para auditar a otra empresa mediante SuperAdmin.",
      createGroupDesc:
        "Post de creación que hace doble check verificando si los RolIDs enviados también son parte integral de ese mismo inquilino para no permitir contaminación de IDs de Rol falsificados externos.",
      createGroupMyTenantDesc: "Formato de Inserción rápido local al JWT Context.",
      updateGroupDesc:
        "Operación de reemplazo a metadatos sumada a la alteración Nuke and Pave de Roles al mismo instante de DB Saving.",
      deleteGroupDesc:
        "Acabar la estructura (El sistema saca a los Admins sin afectarlos, y deja el Grupo en estado IsDeleted=true).",
      groupMembersTitle: "Adición e Interfaz de Recursos a Grupos",
      groupMembersIntro:
        "Modificadores de la tabla Junction entre Admins y su Grupo Contenedor Principal.",
      addMembersDesc:
        "Dispara la creación de relaciones Junction ignorando colisiones si el Admin ya formaba parte de esto en un ciclo previo para no crashear (Idempotencia en POST).",
      removeMemberDesc:
        "Aísla a la persona del grupo destruyendo sus roles extra en la unión sin intervenir roles nativos del operario en particular.",
      groupRolesRestrictionsTitle:
        "Edición Quirúrgica a las Partes Integrantes del Contenedor de Grupo",
      groupRolesRestrictionsIntro:
        "Endpoint centralizado de control de inyecciones RBAC y JSON Proyections para el conglomerado de gente dependiente a esta entidad.",
      setGroupRolesDesc:
        "Destruir y recrear arreglo del JunctionGroupRole completo de nuevo a modo transaccional.",
      setGroupRestrictionsDesc:
        "Destruir y recrear el Objeto de proyecciones RestrictedFields y FieldLevels para el Grupo atómico.",
      bulkCascadeTitle: "Armas en Cascada Masivas e Instantáneas",
      bulkCascadeIntro:
        "Potencializa a SuperAdmin y Tenant-Admins operando sobre múltiples grupos. Puedes decidir si la orden baja y contamina a los miembros y no solo al esqueleto vacío del Grupo.",
      bulkActivateDesc: "Re-encendido generalizado. Reaviva grupos.",
      bulkDeactivateDesc:
        "Re-apagado de Grupos. Anula en bloque los grupos desabilitando el ingreso al App Front para todo el esquema inferior.",
      bulkDeleteDesc:
        "Eliminación paralela al basurero con modo optativo en cascada arrasador a operarios.",
      cascadeWarningNode:
        "Aviso de Seguridad en Pipeline: Si decides arrastrar cascada destructiva a Admins, el sistema buscará el atributo Protected (isProtectedFlag=True del SystemOwner) y se brincará silenciosamente el comando hacia este humano salvando su cuenta y aniquilando al resto del grupo.",
    },
    webhookEmailApi: {
      title: "API de Comunicación Externa: Webhooks y Mensajería",
      description:
        "Puentes asíncronos para sistemas, integraciones a CRMs y motores transaccionales directos para usuarios.",
      intro:
        "No se interviene con la carga de la API, estas operaciones se meten a túneles asíncronos respaldados por colas de eventos (Hangfire).",
      webhooksTitle: "Suscripciones (Webhooks)",
      webhooksIntro:
        "Tiras un evento, NEXORA tira un POST JSON con la información en bruto con firma HMAC al servidor de tu cliente para actualizar sus inventarios automáticos fuera de NEXORA.",
      listWebhooksDesc: "Paginador estándar.",
      createWebhookDesc:
        "Crear suscripción de Webhook que emite el HASH Seed originario de seguridad.",
      updateWebhookDesc:
        "Alteración transitoria (poner en pausa / cambiar la URL objetivo de envío).",
      deleteWebhookDesc: "Matar suscripción (desvincula a tus sistemas externos de eventos).",
      testWebhookDesc:
        "Validar ping entre tu servidor y NEXORA para descartar bloqueos de firewall antes de usarlo.",
      emailTitle: "Motor de Email Centralizado",
      emailIntro:
        "Canalizado con protección de repetición y reintentos (SMTP Protocol) blindado con encolador. Cero atascos en el cliente Frontend Web que generó la llamada.",
      listEmailsDesc:
        "Histórico general log de operaciones que fallaron (Bad Request, SMTP Error, Spam filter).",
      sendEmailDesc:
        "Dispara el servicio para reemplazar una plantilla general con el nombre puntual y mandar al SMTP de salida con un objeto Payload JSON.",
      sendBulkDesc:
        "Mandar en un batacazo un evento masivo por array JSON con variables sustitutivas y un ID plantilla particular para Mail-marketing o alertas masivas (Emergency Push).",
      cancelEmailDesc:
        "Interceptar y matar la orden de envío encolada antes que Hangfire la despache si es que estás a tiempo.",
      resendEmailDesc: "Levantar el log fallido y empujar al retry del encolador.",
      emailStatsDesc: "Gráficas operativas sobre caídas en red o porcentajes de error (Bounces).",
      searchRecipientsDesc:
        "Autocompletar barra del UI del Front para no inventar destinatarios y cruzarlo a la BD limpia.",
      templatesTitle: "Construcción de Piezas Liquid Scriban (Templates)",
      templatesIntro:
        "Paredes de texto y HTML base inyectado de plantillas Liquid donde las llaves de C# entran y sustituyen variables crudas (Hi {{UserName}}, Your Token is {{ActivationToken}}!).",
      listTemplatesDesc: "Catálogo General de plantillas.",
      getTemplateDesc: "Código interno de la plantilla solicitada.",
      createTemplateDesc:
        "Suministro e integración desde el Front de HTML enriquecido e importación de la plantilla base.",
      updateTemplateDesc: "Mejora de plantillas / actualización gramatical.",
      deleteTemplateDesc: "Borrado de base de datos.",
      previewTemplateDesc:
        "Forzamiento de Render en línea contra un modelo de objeto crudo simulado que te arroja cómo luce verdaderamente antes del guardado.",
      renderTemplateDesc:
        "Salida definitiva del motor (Output) separando la capa texto en bruto (Fallback text) y el HTML completo procesado a la perfección.",
      notificationsTitle: "Hub de Notificaciones En Sistema (In-App Push)",
      listNotificationsDesc:
        "Saca los históricos locales no vistos de la barra superior del usuario.",
      unreadCountDesc:
        "El pequeño globito de alarma numérico. Trae el Int32 bruto para evitar conteos gigantescos de UI Client-Side.",
      markReadDesc: "Poner False a bandera isUnread de la alerta específica elegida con un Click.",
      markAllReadDesc:
        "Actualización UPDATE atómica y asíncrona a todos los hijos sin tener que llamar la lista entera y matarla individualmente desde el cliente.",
      deleteNotifDesc: "Botar definitivamente a la papelera oculta.",
      searchTargetsDesc:
        "Encuentra la UID al momento de programar alertas personalizadas que requieran cruces específicos entre el Backoffice y usuarios finales.",
      signalrTip:
        "Toda alerta generada internamente entra a una doble canalización: Graba permanentemente el mensaje y manda un pulso por Sockets que, si tu usuario casualmente está en la web navegando su dashboard, se le aparecerá sin tener que refrescar el Explorer en un milisegundo.",
    },
    systemApi: {
      title: "API del Sistema Core de Control y Entorno (Global & Dashboard)",
      description:
        "Recolección de las pantallas gerenciales, controles de árboles dinámicos del MenuSidebar y revisiones médicas generales de Infraestructura de la base.",
      intro:
        "La conexión de inteligencia con datos vivos procesados en RAM por C# antes de servirse al dashboard y a los enrutamientos maestros.",
      dashboardTitle: "Información e Inteligencia de Negocio (Dashboard Analytics)",
      dashboardIntro:
        "Secciones que levantan la cuenta general de entidades por inquilino y miden su vida global.",
      summaryDesc:
        "Bloques (Cards) de arriba del dashboard en React. Conteos ligeros en C# con agrupaciones.",
      loginActivityDesc:
        "Señal cronológica para el componente de gráficos de serie y línea del login y su salud.",
      recentChangesDesc:
        "Tabla Feed que lee los registros top desc de Auditoría para que el líder de equipo vea movimiento sin bucear a páginas de log.",
      eventDistDesc:
        "Generador de proporciones en crudo procesadas a nivel C# para armar el Pie Chart.",
      securityEventsDesc:
        "Los 5 ataques peores a logins o alteraciones raras del mes condensado en Alertas Rojas (Red Flags).",
      blockedIpsDesc: "Estadísticas del Rate Limiting nativo.",
      dashboardExportTitle: "Capturadores Oficiales PDF del Dashboard (Export)",
      exportOverviewDesc:
        "Lleva el resumen tabular al reporte Excel plano y PDF visual del Director General de Operaciones sin que este tenga clave.",
      exportAnalyticsDesc: "Adjuntos PDF para métricas puras.",
      exportSecurityDesc:
        "Reporte con base legal para equipos azules (Blue teams / Security Center).",
      menuTitle: "Modelado Dinámico de Barra Sidebar (Menu Control)",
      listMenusDesc:
        "La lectura inicial de React FrontEnd que hace anidado para mostrar o apagar árboles del Drawer Izquierdo.",
      myMenuDesc:
        "El Front pide en la raíz el Menú y cruza contra las autorizaciones del Inquilino. Se suprimen URLs y grupos que el Admin no puede tener.",
      createMenuDesc:
        "Alta desde la Base de datos sin requerir redespliegue de NPM de Next JS para añadir pantallas operativas nuevas al Sidebar.",
      updateMenuDesc: "Edición dinámica (Ej. Cambiar de ícono 'User' a 'Users').",
      deleteMenuDesc:
        "Destruir una pantalla y su ramificación de URLs hijas al momento de desautorizar una feature corporativa para que el Sidebar oculte y enrute a Forbidden.",
      reorderMenuDesc:
        "Endpoint masivo que lee Drag and Drop array position 0 a N del JSON en Frontend y repisa en DB transaccional el índice de Orden para que el sistema aprenda.",
      roleVisibilityDesc:
        "Acople que niega la URL al Sidebar Menu según la clase u oficio del Administrador (Role mapping de Menú a permisos).",
      tenantOverrideDesc:
        "Excepción del Sistema: la empresa central modifica el Título 'Usuarios' a 'Doctores' para el inquilino 'Hospital Norte' sin romper la plataforma en los demás Inquilinos.",
      myOverridesDesc: "Saca los Overrides permitidos en esa instancia.",
      recycleBinTitle: "API de la Bóveda de Borrado o Papelera Global",
      listDeletedDesc:
        "El Inquilino usa IgnoreFilters para recuperar la lista que yace latente marcada como borrada en las tripas de la base con su ID, Fechas y Tiempos de Gracia de Salvación.",
      restoreDesc: "Orden milagrosa de anular IsDeleted en milisegundos sin arrastre.",
      purgeDesc:
        "DELETE verdadero para destruir las reliquias. Purga atómica irreversible por cumplimiento de Leyes del Privacidad (Data Annihilation).",
      filesTitle: "Gestor y Disparadores del Storage File System Local/S3",
      uploadDesc:
        "Pide el Binario en formData, la capa de infraestructura lo avienta al S3 MinIO o Azure Blob y contesta la URL y GUID resuelto de éxito.",
      downloadDesc:
        "Recepción segura para traer un archivo validado o un chorro (Stream) grande si es película.",
      deleteFileDesc: "Matar un documento del disco y la tabla.",
      settingsTitle: "Inyección al Core de Parámetros Generales. (Global Settings)",
      getSettingsDesc:
        "Lo que usa toda la maquinaria del Nexora. El token Master que el sistema trae del Redis o la DB en milisegundos al levantar.",
      updateSettingsDesc:
        "Sobreescritura en caliente. Un Save apaga configuraciones globales al segundo.",
      resetSettingsDesc:
        "Volver al Appsettings JSON o variables de Factory limpias del día del Despliegue, eliminando errores por modificaciones humanas graves.",
      readinessDesc:
        "Probe especial del /Health API ASP.NET Core nativo para el orquestador Docker o IIS. Retorna status 200 OK si y solo si bases de datos y caché y Hangfire responden. Sirve de salvavidas en balanceos de carga automatizados para decirle a la red si este Nodo sigue vivo y puede procesar.",
    },
  },
};

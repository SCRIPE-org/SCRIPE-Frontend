/**
 * Docs page locale — ES
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const es = {
  commercial: {
    moduleCatalog: {
      tblCoreR7C1: "Derechos",
      tblCoreR7C2: "Control de acceso a funciones basado en ediciones y gestión de planes",
      tblCoreR7C3:
        "Funciones, ediciones, suscripciones, sobreescrituras, aplicación de cuotas, implementaciones versionadas, alcance de revendedores",
      businessContent:
        "SCRIPE no es un cascarón vacío; es un ecosistema empresarial en funcionamiento desde el primer día. Utilice nuestros módulos de negocio existentes —como Gestión de Usuarios, Registro de Auditoría y Notificaciones— como puntos de partida inmediatos, o clónelos para construir características propietarias rápidamente.",
      businessTitle: "Lógica de Negocio Acelerada",
      commTitle: "Comunicación y Webhooks",
      coreContent:
        "La capa Fundacional proporciona lo absoluto no negociable: el Proveedor de Identidad, estrategias de resolución de múltiples inquilinos, abstracciones de contexto de EF Core y el despachador SCRIPE mediator centralizado. Es el lecho de roca sólido sobre el cual escala toda su aplicación.",
      coreTitle: "La Fundación Central (Core)",
      crmModule: "Módulo CRM Headless",
      crmModuleDesc:
        "Gestione jerarquías organizativas, relaciones con clientes y atributos personalizados con una arquitectura CRM totalmente impulsada por API.",
      customModule: "Módulo de Integración Propietario",
      customModuleDesc:
        "Un entorno de pruebas (sandbox) prístino que utiliza exactamente los mismos límites de Arquitectura Limpia para albergar su lógica industrial única.",
      dataTitle: "Datos y Auditoría",
      description:
        "Un directorio completo de los Contextos Delimitados (Bounded Contexts) empresariales preconstruidos y listos para producción incluidos dentro de la plataforma SCRIPE.",
      financeModule: "Motor de Facturación",
      financeModuleDesc:
        "Genere facturas en PDF, gestione localidades fiscales e intégrese con Stripe o pasarelas de pago personalizadas.",
      hrModule: "Gestión de Identidad y Acceso (IAM)",
      hrModuleDesc:
        "Controle los permisos granulares basados en roles, los tiempos de vida de los JWT y las sincronizaciones de directorios.",
      independenceContent:
        "Cada módulo del catálogo está estrictamente aislado. El módulo de Notificaciones no comparte ningún estado con el módulo de Gestión de Usuarios. Se comunican puramente a través de eventos asíncronos, lo que garantiza que una falla catastrófica en un dominio nunca se extienda en cascada a otro.",
      independenceTitle: "Aislamiento Criptográfico de Módulos",
      intro:
        "SCRIPE se envía con una biblioteca masiva de Contextos Delimitados preprobados y de grado empresarial. Desde el primer día, usted posee la madurez operativa de una aplicación SaaS de 5 años de antigüedad.",
      inventoryModule: "Módulo de Seguimiento de Activos",
      inventoryModuleDesc:
        "Mapee inventarios jerárquicos complejos y rastree los cambios de estado a través de eventos de dominio estrictamente aplicados.",
      projectModule: "Módulo de Proyectos y Flujo de Trabajo",
      projectModuleDesc:
        "Gestione máquinas de estado complejas y flujos de trabajo de aprobación organizativa de múltiples pasos.",
      title: "Catálogo de Módulos Empresariales",
      tblCoreHeader1: "Módulo",
      tblCoreHeader2: "Descripción",
      tblCoreHeader3: "Capacidades Clave",
      tblCoreR1C1: "Identidad y Autenticación",
      tblCoreR1C2: "Autenticación completa y gestión de usuarios",
      tblCoreR1C3: "JWT, 2FA, gestión de sesiones, seguimiento de dispositivos, login social",
      tblCoreR2C1: "Multitenencia",
      tblCoreR2C2: "Aislamiento de inquilinos y organización jerárquica",
      tblCoreR2C3:
        "Aislamiento a nivel de fila, inquilinos padre/hijo, ajustes por inquilino, marca blanca",
      tblCoreR3C1: "Roles y Permisos",
      tblCoreR3C2: "Control de acceso de grano fino",
      tblCoreR3C3:
        "RBAC, restricciones a nivel de campo, categorías de permisos, clonación de roles",
      tblCoreR4C1: "Sistema de Auditoría",
      tblCoreR4C2: "Seguimiento exhaustivo de la actividad",
      tblCoreR4C3:
        "Canalización de 4 fuentes: API, cambios de entidad, eventos de seguridad, operaciones de negocio",
      tblCoreR5C1: "Sistema de Menús",
      tblCoreR5C2: "Gestión dinámica de la navegación",
      tblCoreR5C3:
        "Árbol autorreferenciado, anulaciones por inquilino, visibilidad basada en roles",
      tblCoreR6C1: "Grupos de Usuarios",
      tblCoreR6C2: "Asignación masiva (batch) de roles y restricciones",
      tblCoreR6C3:
        "RBAC basado en grupos, restricciones a nivel de campo, gestión de miembros, grupos con ámbito de inquilino",
      tblCommHeader1: "Módulo",
      tblCommHeader2: "Descripción",
      tblCommHeader3: "Capacidades Clave",
      tblCommR1C1: "Notificaciones",
      tblCommR1C2: "Notificaciones push en tiempo real",
      tblCommR1C3:
        "SignalR WebSockets, unión automática por inquilino, marcar leído/no leído, interfaz de campana",
      tblCommR2C1: "Sistema de Correo Electrónico",
      tblCommR2C2: "Canalización de correo transaccional",
      tblCommR2C3:
        "Envío basado en colas, plantillas Scriban, reintento con retroceso, SMTP/SendGrid",
      tblCommR3C1: "Webhooks",
      tblCommR3C2: "Integraciones impulsadas por eventos",
      tblCommR3C3:
        "Firmado HMAC-SHA256, reintento exponencial, gestión de suscripciones, catálogo de eventos",
      tblCommR4C1: "Plantillas de Mensajes",
      tblCommR4C2: "Renderizado de mensajes bilingües",
      tblCommR4C3:
        "Sintaxis Scriban, vista previa de variables, 6 plantillas integradas, entidad bilingüe",
      tblDataHeader1: "Módulo",
      tblDataHeader2: "Descripción",
      tblDataHeader3: "Capacidades Clave",
      tblDataR1C1: "Carga de Archivos",
      tblDataR1C2: "Manejo seguro de archivos",
      tblDataR1C3:
        "Canalización de procesamiento de imágenes, listo para escaneo de virus, almacenamiento con ámbito de inquilino, 4 backends",
      tblDataR2C1: "Descarga y Exportación",
      tblDataR2C2: "Exportación de datos y entrega de archivos",
      tblDataR2C3:
        "Descargas reanudables (Rango), almacenamiento en caché ETag, basado en sesiones, prevención de Path Traversal",
      tblDataR3C1: "Papelera de Reciclaje",
      tblDataR3C2: "Gestión de eliminación suave (soft-delete)",
      tblDataR3C3:
        "Restauración con dependencias, purga programada, restauración en cascada, políticas por entidad",
      tblDataR4C1: "Gestión de Usuarios",
      tblDataR4C2: "Operaciones administrativas de usuarios",
      tblDataR4C3:
        "27 endpoints, operaciones masivas (bulk), operaciones empresariales, reglas de administración protegidas",
      tblAnalyticsHeader1: "Módulo",
      tblAnalyticsHeader2: "Descripción",
      tblAnalyticsHeader3: "Capacidades Clave",
      tblAnalyticsR1C1: "Analítica de Ingresos",
      tblAnalyticsR1C2: "Panel de inteligencia de ingresos de nivel BI",
      tblAnalyticsR1C3:
        "Seguimiento MRR/ARR, análisis de cohortes, modelado LTV, pronóstico de ingresos, puntuación de salud, informes PDF",
      analyticsTitle: "Inteligencia de Ingresos",
      analyticsContent:
        "El motor de analítica de ingresos transforma datos brutos de suscripción en inteligencia empresarial accionable. Con 7 pestañas especializadas, capturas nocturnas automatizadas y pronósticos predictivos, los operadores obtienen visibilidad de nivel CFO sin herramientas BI externas. La puntuación de salud del inquilino identifica proactivamente los riesgos de abandono antes de que se materialicen.",
    },
  },
};

// FILE-EXCEPTION: file length
/**
 * Docs page locale — ES
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const es = {
  features: {
    tenantContextGate: {
      title: "Tenant Context Gate",
      description:
        "RequiresTenantContext flag, multi-layer menu visibility defense, drill-down behavior, and impersonation scoping for tenant-only pages.",
      intro:
        "The Tenant Context Gate is a security mechanism that prevents system admins from accidentally (or intentionally) accessing tenant-scoped pages when they have no active tenant context. Pages like Tenant Plans, User Subscriptions, and the Customizer Studio only make sense within a specific tenant's context – showing them to a system admin with no tenant would either show incorrect data or expose cross-tenant information.",
      problemTitle: "The Problem",
      problemIntro:
        "System super-admins have a bypass flag (IsSystemProtectedAdmin) that normally grants them access to all pages. Without a gate, a super-admin with no tenant context could navigate to /tenant-plans and see data from all tenants, or crash the page because no TenantId is available.",
      solutionTitle: "The Solution: RequiresTenantContext",
      solutionIntro:
        "We introduced the RequiresTenantContext boolean flag in the DocNavigationItem schema. When this flag is set to true, the frontend actively checks if the current user has a valid tenantId. If they do not, the item is completely stripped from the navigation menu and the route redirects to the overview page.",
      layersTitle: "Defense In Depth",
      layersIntro: "The gate operates at three levels:",
      layer1:
        "1. Menu Visibility: The navigation builder strips the item from the sidebar if no tenant context is present.",
      layer2:
        "2. Route Protection: The page component uses useAppStore to verify the tenant context before attempting to fetch data.",
      layer3:
        "3. Backend Gate: The API endpoints themselves throw 403 Forbidden if a system admin attempts to fetch tenant-scoped data without an explicit drill-down tenant ID header.",
      drillDownTitle: "Drill-Down and Impersonation",
      drillDownIntro:
        "System admins can still access these pages, but only through explicit context-switching mechanisms:",
      drill1:
        'Enter Tenant World (Drill-Down): The admin clicks "Enter Tenant World" on a tenant record. This sets the tenantId in the global state and adds it to the X-Tenant-Id header for all subsequent API requests. The gate now opens, and the admin sees exactly what the tenant sees.',
      drill2:
        "User Impersonation: The admin impersonates a specific tenant user. This swaps the JWT entirely, providing a perfect replica of the user's experience, including all tenant-scoped pages.",
      layer1Title: "Capa 1: Filtro de Visibilidad en Menú Frontend",
      layer1Intro:
        "La canalización del menú inspecciona el indicador RequiresTenantContext. Si el usuario no tiene un inquilino activo, el nodo se elimina del árbol antes de enviarlo al cliente.",
      layer2Title: "Capa 2: Guardas de Enrutamiento en Cliente",
      layer2Intro:
        "El middleware de Next.js y los contenedores de página verifican el contexto de inquilino activo. Los intentos no autorizados redirigen al panel general.",
      layer3Title: "Capa 3: Firewall de Controladores y Middleware Backend",
      layer3Intro:
        "Los controladores y gestores CQRS validan de forma independiente el contexto, respondiendo con 401 o 403 ante solicitudes sin inquilino válido.",
      drillDownNote:
        "El acceso de inmersión está restringido a administradores con el permiso 'tenants.drill_down' y genera registros de auditoría detallados.",
      impersonationTitle: "Ámbito de Suplantación de Usuarios",
      impersonationIntro:
        "Durante la suplantación, la canalización de seguridad intercambia el token por uno acotado al inquilino, heredando estrictamente sus permisos.",
      flaggedPagesTitle: "Páginas Exclusivas de Inquilino Protegidas",
      flaggedPagesIntro:
        "Las siguientes vistas administrativas aplican estrictamente el filtro de inquilino:",
      flaggedPage1: "Planes de Suscripción y Facturación de Inquilinos",
      flaggedPage2: "Suscripciones de Usuarios y Permisos Individuales",
      flaggedPage3: "Estudio de Personalización Visual y Marca",
      flaggedPage4: "Configuración General y Dominios del Inquilino",
      flaggedPage5: "Plantillas de Notificaciones y Mensajes Propios",
      flaggedPage6: "Papelera de Reciclaje y Restauración de Datos",
      addingTitle: "Protección de Nuevas Páginas",
      addingIntro:
        "Agregue RequiresTenantContext: true en la definición de navegación para restringir nuevas páginas a inquilinos activos.",
      addingTip:
        "Verifique que el validador TenantContextBehavior esté activo en la canalización CQRS para bloquear accesos directos por API.",
      seederTitle: "Inicialización y Sembrado de Permisos",
      seederIntro:
        "El sembrador de base de datos establece las banderas de protección para todos los elementos críticos durante el arranque inicial.",
    },
  },
};

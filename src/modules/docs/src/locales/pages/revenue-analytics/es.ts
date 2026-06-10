export const es = {
  modules: {
    revenueAnalytics: {
      title: "Motor de Analítica de Ingresos",
      description:
        "Inteligencia de ingresos de nivel BI con panel de 7 pestañas, KPIs en tiempo real, análisis de cohortes, modelado de LTV, pronóstico de ingresos, puntuación de salud de inquilinos y entrega automatizada de informes PDF.",
      intro:
        "El motor de analítica de ingresos proporciona inteligencia financiera integral para su plataforma SaaS. Agrega datos de suscripción de todos los inquilinos en KPIs accionables, visualizaciones de tendencias y modelos predictivos. Las tareas nocturnas en segundo plano capturan todas las métricas, calculan las puntuaciones de salud de los inquilinos y generan informes programados — ofreciendo un conjunto completo de analítica de nivel BI sin herramientas externas.",
      kpiTitle: "Resumen de KPIs",
      kpiIntro:
        "Ocho KPIs fundamentales se calculan en tiempo real a partir de los datos de suscripción y pago. Cada KPI admite filtrado por rango de fechas, comparación período a período y desglose por edición o inquilino.",
      tabsTitle: "Panel de 7 Pestañas",
      tabsIntro:
        "El panel de analítica está organizado en 7 pestañas de carga diferida, cada una enfocada en una dimensión analítica específica. Las pestañas se renderizan mediante React.lazy con fallbacks de Suspense para una división óptima de paquetes.",
      snapshotTitle: "Entidad AnalyticsSnapshot",
      snapshotIntro:
        "La entidad AnalyticsSnapshot almacena capturas diarias de métricas. Cada noche, el AnalyticsSnapshotJob crea una fila agregada (TenantId = null) y una fila por inquilino activo. Esto permite el análisis de tendencias históricas sin consultar las tablas de suscripción en vivo.",
      healthTitle: "Puntuación de Salud de Inquilinos",
      healthIntro:
        "El TenantHealthScoreJob calcula una puntuación de salud compuesta (0-100) para cada inquilino activo utilizando una fórmula ponderada que combina la fiabilidad de pago, la actividad de la plataforma y las señales de crecimiento de suscripciones.",
      jobsTitle: "Pipeline de Tareas en Segundo Plano",
      jobsIntro:
        "Tres tareas en segundo plano se ejecutan en secuencia estricta cada noche. Son completamente agnósticas del proveedor — configurables para ejecutarse bajo Native, Hangfire o Quartz a través de appsettings.json. Cada tarea implementa IAutoRegisteredJob para gestión unificada.",
      jobsConfig:
        "Las tres tareas son configurables vía appsettings.json bajo BackgroundJobs:Jobs. Puede anular el horario CRON, habilitar/deshabilitar tareas individuales o cambiar de proveedor (Native/Hangfire/Quartz) sin cambios de código.",
      endpointsTitle: "Endpoints de API",
      endpointsIntro:
        "El AnalyticsController expone 12 endpoints bajo /api/v1/analytics. Todos los endpoints requieren el rol SuperAdmin y el permiso de analítica correspondiente.",
      exportTitle: "Sistema de Exportación",
      exportIntro:
        "Los datos analíticos pueden exportarse en tres formatos. Cada exportación incluye el resumen actual de KPIs, tendencias de MRR y desglose de suscripciones. Las exportaciones PDF incluyen encabezados y gráficos de marca.",
      scheduledTitle: "Informes Programados",
      scheduledIntro:
        "Los administradores pueden configurar la entrega automatizada de informes. Los informes son generados por el AnalyticsReportJob a las 6:00 AM UTC y enviados por correo electrónico a los destinatarios configurados en el formato elegido.",
      permissionsTitle: "Permisos",
      permissionsIntro:
        "La analítica de ingresos utiliza cuatro permisos granulares que pueden asignarse a roles a través del sistema RBAC estándar.",
      ep: {
        summary: "Obtener resumen analítico (tarjetas KPI + comparación de períodos)",
        mrr: "Obtener movimientos en cascada de MRR (nuevo/expansión/contracción/abandono/reactivación)",
        cohort: "Obtener datos de mapa de calor de retención de cohortes por cohortes mensuales",
        ltv: "Obtener desglose de valor de vida por nivel de edición",
        forecast:
          "Obtener pronóstico de ingresos a 6 meses con regresión lineal + bandas de confianza",
        health: "Obtener puntuaciones de salud de inquilinos con clasificación de riesgo",
        snapshots: "Obtener capturas diarias históricas para gráficos de tendencia",
        export: "Exportar datos analíticos en formato especificado (csv/excel/pdf)",
        reportList: "Listar todos los informes programados",
        reportCreate: "Crear una nueva configuración de informe programado",
        reportUpdate: "Actualizar la configuración del informe programado",
        reportDelete: "Eliminar un informe programado",
      },
    },
  },
};

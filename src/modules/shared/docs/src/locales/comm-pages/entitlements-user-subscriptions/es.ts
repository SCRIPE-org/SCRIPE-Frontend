/**
 * Documentation for module export
 */
export const es = {
  commercial: {
    entitlementsUserSubscriptions: {
        "title": "Suscripciones de Usuario",
        "description": "Gestión de suscripciones de usuario a plan de nivel 2 con ciclo de vida completo, conciliación automática, control de acceso a funciones y autoservicio.",
        "fullLifecycleTitle": "Ciclo de Vida Completo",
        "fullLifecycleDesc": "Gratis → Prueba → Activo → Vencido → Cancelado → Expirado con transiciones automáticas.",
        "autoReconciliationTitle": "Conciliación Automática",
        "autoReconciliationDesc": "El trabajo en segundo plano diario gestiona automáticamente la expiración de la prueba, la renovación automática y la expiración.",
        "featureGatingTitle": "Control de Funciones",
        "featureGatingDesc": "UserFeatureCheckerService resuelve a qué funciones puede acceder cada usuario según su plan.",
        "selfServiceTitle": "Autoservicio",
        "selfServiceDesc": "Los usuarios pueden consultar el estado de su suscripción mediante el punto de conexión /me.",
        "auditTrailTitle": "Pista de Auditoría",
        "auditTrailDesc": "El patrón inmutable Cancel+Replace mantiene un historial completo por ciclo de facturación.",
        "domainEventsTitle": "Eventos de Dominio",
        "domainEventsDesc": "Los eventos Created, Cancelled y Renewed alimentan los sistemas de webhooks y notificaciones.",
        "lifecycleTitle": "Ciclo de Vida de Suscripción",
        "reconciliationTitle": "Conciliación Automática"
    }
  }
};

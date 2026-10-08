/**
 * Documentation for module export
 */
export const ru = {
  commercial: {
    entitlementsUserSubscriptions: {
        "title": "Подписки Пользователей",
        "description": "Управление подписками пользователей на планы уровня 2 с полным жизненным циклом, автоматической сверкой, разграничением доступа к функциям и самообслуживанием.",
        "fullLifecycleTitle": "Полный жизненный цикл",
        "fullLifecycleDesc": "Free → Trial → Active → PastDue → Cancelled → Expired с автоматическими переходами статусов.",
        "autoReconciliationTitle": "Автоматическая сверка",
        "autoReconciliationDesc": "Ежедневное фоновое задание автоматически обрабатывает окончание пробного периода, автопродление и истечение срока.",
        "featureGatingTitle": "Разграничение функций",
        "featureGatingDesc": "Сервис UserFeatureCheckerService определяет доступные пользователю функции на основе его плана.",
        "selfServiceTitle": "Самообслуживание",
        "selfServiceDesc": "Пользователи могут просматривать статус своей подписки через эндпоинт /me.",
        "auditTrailTitle": "Журнал аудита",
        "auditTrailDesc": "Неизменяемый паттерн Cancel+Replace сохраняет полную историю для каждого платежного цикла.",
        "domainEventsTitle": "События домена",
        "domainEventsDesc": "События Created, Cancelled и Renewed передаются в вебхуки и системы уведомлений.",
        "lifecycleTitle": "Жизненный цикл подписки",
        "reconciliationTitle": "Автоматическая сверка"
    }
  }
};

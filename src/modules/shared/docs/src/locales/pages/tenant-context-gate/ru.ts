// FILE-EXCEPTION: file length
/**
 * Docs page locale — RU
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const ru = {
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
      layer1Title: "Уровень 1: Фильтр Отображения Меню во Фронтенде",
      layer1Intro:
        "Конвейер меню проверяет флаг RequiresTenantContext для каждого пункта. Если у пользователя нет активного тенанта, узел удаляется из дерева до отправки клиенту.",
      layer2Title: "Уровень 2: Клиентские Защитные Ограничители Маршрутов",
      layer2Intro:
        "Middleware Next.js и обертки страниц проверяют активный контекст тенанта перед монтированием. Неавторизованные попытки перенаправляются в обзор воркспейса.",
      layer3Title: "Уровень 3: Брандмауэр Контроллеров и Middleware Бэкенда",
      layer3Intro:
        "Контроллеры и обработчики CQRS независимо валидируют контекст, возвращая статус 401 или 403 при отсутствии валидного идентификатора организации.",
      drillDownNote:
        "Режим углубленного доступа (Drill-Down) разрешен только администраторам с привилегией 'tenants.drill_down' и полностью фиксируется в журналах аудита.",
      impersonationTitle: "Изоляция при Имперсонации Пользователей",
      impersonationIntro:
        "При переключении под учетную запись пользователя подсистема безопасности заменяет токен на сессионный токен с жестко заданными границами тенанта.",
      flaggedPagesTitle: "Защищенные Страницы Только для Организаций",
      flaggedPagesIntro:
        "Следующие административные экраны строго требуют активного контекста организации:",
      flaggedPage1: "Планы Подписки Организации и Настройки Биллинга",
      flaggedPage2: "Подписки Пользователей и Персональные Права",
      flaggedPage3: "Студия Кастомизации Тем и Брендинга",
      flaggedPage4: "Конфигурация Параметров и Пользовательских Доменов",
      flaggedPage5: "Локальные Шаблоны Сообщений и Оповещений",
      flaggedPage6: "Корзина Экосистемы и Восстановление Данных",
      addingTitle: "Добавление Новых Защищенных Страниц",
      addingIntro:
        "Установите флаг RequiresTenantContext: true в реестре навигации для автоматической защиты новых маршрутов тенанта.",
      addingTip:
        "Обязательно подключайте поведение TenantContextBehavior в конвейер CQRS на сервере для предотвращения прямых несанкционированных вызовов API.",
      seederTitle: "Начальное Формирование Флагов Безопасности",
      seederIntro:
        "Модуль первоначального заполнения базы данных автоматически размечает защитные атрибуты для ключевых разделов при развертывании системы.",
    },
  },
};

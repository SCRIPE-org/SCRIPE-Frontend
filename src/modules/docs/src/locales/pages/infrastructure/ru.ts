export const ru = {
  infrastructure: {
    auditTrail: {
      architectureTitle: "Архитектура аудиторского следа",
      description:
        "Полное ведение аудита с автоматическим определением модуля, отслеживанием корреляции, трансляцией в реальном времени через SignalR и более 45 типами событий.",
      entityIntro:
        "Сущность AuditLog фиксирует полный контекст для каждого проверяемого события. Старые и новые значения сохраняются как JSON-снимки.",
      entityTitle: "Схема сущности AuditLog",
      eventTypesTitle: "Типы событий аудита (45+)",
      intro:
        "Корпоративный аудиторский след SCRIPE фиксирует каждое значимое действие на платформе — от событий аутентификации и мутаций сущностей до изменений разрешений и инцидентов безопасности.",
      moduleDetectionIntro:
        "AuditService автоматически определяет, какой модуль сгенерировал каждое событие аудита, анализируя путь API-эндпоинта или имя типа сущности.",
      moduleDetectionTitle: "Автоматическое определение модуля",
      queryIntro:
        "Эндпоинт запросов аудиторского лога поддерживает комплексную фильтрацию с 12 параметрами. Все фильтры опциональны и могут комбинироваться. Результаты пагинированы (по умолчанию: 20 записей, максимум: 100) и отсортированы по временной метке по убыванию.",
      queryTip:
        "Профессиональный совет: Используйте CorrelationId для отслеживания полного жизненного цикла одного HTTP-запроса через все записи аудита.",
      queryTitle: "API запросов аудиторского лога",
      realtimeIntro:
        "События аудита (исключая рутинные HTTP-запросы) транслируются через SignalR подключенным клиентам. События ограничены по арендатору через специфические группы.",
      realtimeTitle: "Трансляция в реальном времени",
      title: "Корпоративный аудиторский след",
    },
    backgroundJobs: {
      architectureFlowTitle: "Пайплайн автоматического обнаружения",
      architectureIntro:
        "При запуске BackgroundJobsConfiguration считывает активный провайдер из appsettings.json и вызывает GetServices<IAutoRegisteredJob>() для обнаружения каждой зарегистрированной задачи из DI-контейнера. Для каждой задачи проверяется переопределение настроек (appsettings), разрешаются Enabled и CronExpression, затем задача планируется с использованием API провайдера. Сама задача не содержит кода, специфичного для провайдера.",

      // Architecture
      architectureTitle: "Обзор архитектуры",
      conn1: "[RU] drives",
      conn2: "[RU] triggers",
      conn3: "[RU] for each job",
      conn4: "[RU] on cron tick",
      connBuilds: "строит запрос",
      connOrders: "упорядочивает",
      connRemoves: "удаляет",
      connStarts: "начинает",
      connTriggers: "запускает",
      contractIntro:
        "Каждая повторяющаяся фоновая задача в SCRIPE реализует один интерфейс: IAutoRegisteredJob. Это весь контракт — три свойства и один метод. Интерфейс намеренно исключает любые концепции, специфичные для провайдера (никаких атрибутов Hangfire или аннотаций Quartz). Задача ничего не знает о провайдере, который ее запускает.",
      contractTitle: "Контракт IAutoRegisteredJob",
      descConfig:
        "[RU] Provider: Native | Hangfire | Quartz\nJobs: { id: { Enabled, CronExpression } }",
      descDiscovery: "[RU] Scans DI container for every registered IAutoRegisteredJob",
      descExecute: "[RU] Provider-agnostic - job has zero knowledge of which provider runs it",
      description:
        "Автоматически обнаруживаемые, независимые от провайдера (Native, Hangfire, Quartz.NET) повторяющиеся задачи — 31 задача в 6 модулях, без ручного связывания.",
      descSchedule: "[RU] Uses CronExpression from appsettings override or job default",
      descStartup: "[RU] Reads provider, discovers all jobs, schedules them",
      diIntro:
        "Каждая задача требует ровно двух регистраций DI в файле DependencyInjection.cs ее модуля. Отсутствие второй строки делает задачу полностью невидимой для всех провайдеров — она никогда не будет обнаружена или запланирована, и при этом не будет никаких ошибок или предупреждений.",

      // DI Registration
      diTitle: "Регистрация DI — критический шаблон из двух строк",
      diWarning:
        "Делегат фабрики IAutoRegisteredJob (Строка 2) — это то, что обеспечивает автоматическое обнаружение. GetServices<IAutoRegisteredJob>() возвращает только задачи, зарегистрированные КАК IAutoRegisteredJob. Задача, зарегистрированная только по ее конкретному типу, невидима для всех трех провайдеров.",
      diWarningTitle: "Никогда не пропускайте строку 2",
      flowCascadeDesc: "Обрабатывает ограничения внешних ключей в правильном порядке удаления",
      flowCascadeLabel: "Каскадирование с учетом FK",
      flowCronDesc: "Cron по умолчанию для задач мягкого удаления",
      flowCronLabel: "Тик Cron (3:00)",
      flowExecuteDesc:
        "Выполнение нативного SQL для массового удаления в обход отслеживания изменений EF",
      flowExecuteLabel: "Жесткое удаление",
      flowFilterDesc:
        "Поиск записей, где IsDeleted = true И DeletedAt < DateTime.UtcNow.AddDays(-30)",
      flowFilterLabel: "Фильтрация просроченных сущностей",
      flowInitDesc: "Создается контейнером DI",
      flowInitLabel: "SoftDeleteCleanupJob<TContext>",
      flowScanDesc: "Рефлексивное сканирование DbContext для сущностей, реализующих ISoftDeletable",
      flowScanLabel: "Обнаружение ISoftDeletable",
      hierarchyColClass: "Класс",
      hierarchyColGets: "Что вы получаете",
      hierarchyColUseWhen: "Использовать когда",
      hierarchyIntro:
        "В зависимости от необходимой структуры существуют три варианта. Легковесные задачи реализуют IAutoRegisteredJob напрямую. Задачи, которым нужны структурированные журналы тайминга, расширяют RecurringJobBase. Задачи, очищающие мягко удаленные сущности, расширяют SoftDeleteCleanupJob<TContext>.",
      hierarchyRow1Gets: "Только контракт — полный контроль, никаких дополнений",
      hierarchyRow1When: "Задача проста, не требует много шаблонного кода",
      hierarchyRow2Gets:
        "Автоматические журналы запуска/завершения/ошибок с указанием затраченного времени",
      hierarchyRow2When: "Нужны структурированные журналы времени и ошибок",
      hierarchyRow3Gets:
        "Автоматическое обнаружение сущностей, удаление с учетом внешних ключей, пакетная обработка",
      hierarchyRow3When: "Модулю нужна задача окончательной очистки мягко удаленных записей",

      // Class Hierarchy
      hierarchyTitle: "Иерархия классов — Выберите свою базу",
      identityNote:
        "EmailProcessingJob и WebhookRetryJob/WebhookLogCleanupJob являются базовыми инфраструктурными задачами, зарегистрированными в DI-контейнере модуля Identity, так как они зависят от сервисов Identity.",
      intro:
        "Система фоновых задач SCRIPE построена на принципе: написать один раз, запустить на любом провайдере. Каждая задача реализует интерфейс IAutoRegisteredJob и автоматически обнаруживается при запуске. Переключение между Native, Hangfire или Quartz — это просто изменение конфигурации в appsettings.json, без необходимости изменения кода.",
      inventoryColPurpose: "Назначение",
      inventoryComplianceTitle: "Модуль Compliance (7 задач)",
      inventoryCoreTitle: "Модуль Core (5 задач)",
      inventoryEntitlementsTitle: "Модуль Entitlements (12 задач)",
      inventoryIdentityTitle: "Модуль Identity (2 задачи)",
      inventoryIntro:
        "Все 33 повторяющаяся фоновая задача в шести модулях. Каждая задача реализует IAutoRegisteredJob. Cron по умолчанию можно переопределить для каждого окружения в appsettings.json.",
      inventoryMarketplaceTitle: "Модуль Marketplace (4 задачи)",
      inventoryPluginsTitle: "Модуль Plugins (3 задачи)",

      // Jobs Inventory
      inventoryTitle: "Полный реестр задач — 33 задачи",
      jobAnalyticsReport: "Еженедельная генерация аналитических отчетов",
      jobAnalyticsSnapshot: "Ежедневная агрегация снимков дохода/MRR/ARR",
      jobAuthSessionCleanup: "Очищает просроченные сессии аутентификации и токены обновления",
      jobCommissionAutoCharge:
        "Повторные попытки списания неудачных автоматических платежей по комиссиям",
      jobCommissionInvoicing: "Ежемесячная консолидация счетов по комиссиям",
      jobComplianceSoftDelete: "Навсегда удаляет мягко удаленные сущности Compliance",
      jobConsentExpiry: "Завершает срок действия просроченных согласий пользователей",
      jobDsrEscalation: "Создает оповещения для DSR, приближающихся к крайнему сроку SLA",
      jobDsrExecution: "Выполняет ожидающие запросы субъектов данных (DSR) каждые 5 минут",
      jobDsrExportCleanup: "Удаляет просроченные файлы экспорта DSR",
      jobDunningNotification: "Уведомления об ошибках платежей с нарастающей срочностью",
      jobEditionRollout: "Применяет запланированные обновления и понижения редакций",
      jobEmailProcessing: "Опрашивает и отправляет отложенные email через EmailJobProcessor",
      jobEntitlementsSoftDelete: "Навсегда удаляет мягко удаленные сущности Entitlements",
      jobIdentitySoftDelete: "Навсегда удаляет мягко удаленные сущности Identity",
      jobInstallCountAggregation:
        "Агрегирует временные показатели установок в статические счетчики объявлений приложений",
      jobMarketplaceSoftDelete:
        "Навсегда удаляет мягко удаленные объявления, заявки, профили и отзывы после периода хранения",
      jobOutboxCleanup: "Удаляет обработанные сообщения outbox старше 7 дней",

      // Job purpose descriptions
      jobOutboxProcessor:
        "Обрабатывает входящую очередь (outbox) сообщений и отправляет их в AstraFlow",
      jobPaymobRecurringBilling: "Регулярные платежи по сохраненным картам Paymob",
      jobPayoutBatch:
        "Собирает ожидающие доходы в пакетные переводы и выполняет выплаты через Stripe Connect",
      jobPluginDataCleanup:
        "Очищает просроченные временные ключи хранения базы данных, созданные плагинами",
      jobPluginHealthCheck:
        "Опрашивает активные среды песочниц плагинов и сообщает об их состоянии",
      jobPluginsSoftDelete:
        "Навсегда удаляет мягко удаленные плагины, определения и журналы выполнения после периода хранения",
      jobReportGeneration: "Опрашивает и генерирует ожидающие отчеты соответствия каждые 2 минуты",
      jobRetentionEnforcement: "Обеспечивает соблюдение политик хранения данных",
      jobStaleSubmissionReminder:
        "Сканирует заявки на приложения, ожидающие проверки более 7 дней, и предупреждает администраторов",
      jobSubscriptionReconciliation: "Завершает пробные периоды, продлевает активные подписки",
      jobTenantHealthScore:
        "Пересчитывает оценку здоровья (health score) для всех активных арендаторов",
      jobTrialNotification:
        "Отправляет напоминания о пробных периодах, истекающих через 7, 3 или 1 день",
      jobUserSubscriptionReconciliation: "Сверка пользовательских подписок уровня 2",
      jobWebhookLogCleanup: "Удаляет журналы доставки вебхуков старше 90 дней",
      jobWebhookRetry: "Обрабатывает постоянную очередь повторных попыток вебхуков порциями по 50",
      newJobIntro:
        "Выполните ровно эти четыре шага. Единственные обязательные файлы — это сам класс задачи и две строки регистрации DI. Все остальное подключается автоматически.",
      newJobStep1Desc:
        "Создайте новый файл в {Module}.Infrastructure/BackgroundJobs/. Используйте соглашение об именовании JobId: '{module}-{purpose}' (kebab-case). Реализуйте ExecuteAsync как идемпотентный метод.",
      newJobStep1Title: "Шаг 1 — Создание класса задачи",
      newJobStep2Desc:
        "В DependencyInjection.cs модуля добавьте ровно две регистрации. Строка 1 обеспечивает внедрение зависимостей через конструктор. Строка 2 обеспечивает автоматическое обнаружение. Никогда не пропускайте строку 2.",
      newJobStep2Title: "Шаг 2 — Регистрация ДВУХ строк DI",
      newJobStep3Desc:
        "Для расписания, зависящего от окружения, или для отключения задачи, добавьте переопределение в раздел BackgroundJobs.Jobs, используя JobId в качестве ключа.",
      newJobStep3Title: "Шаг 3 — Добавление переопределения appsettings (Необязательно)",
      newJobStep4Desc:
        "Выполните сборку бэкенда. Отсутствие ошибок означает, что задача готова. Автоматическое обнаружение позаботится обо всем остальном — никакой ручной регистрации нигде не требуется.",
      newJobStep4Title: "Шаг 4 — Сборка и проверка",

      // Creating a New Job
      newJobTitle: "Создание новой фоновой задачи",

      // IAutoRegisteredJob Contract
      nodeConfig: "[RU] appsettings.json\nProvider + Per-Job Overrides",
      nodeDiscovery: "[RU] Auto-Discovery Loop\nGetServices<IAutoRegisteredJob>()",
      nodeExecute: "[RU] job.ExecuteAsync(ct)\nAt every cron tick",
      nodeSchedule: "[RU] Schedule Each Job\nIf Enabled -> Register with provider API",
      nodeStartup: "[RU] BackgroundJobsConfiguration\nAddBackgroundJobsConfiguration()",
      providerColFeature: "Функция",
      providerColHangfire: "Hangfire",
      providerColNative: "Native",
      providerColQuartz: "Quartz",
      providerHangfireBest: "Продакшн с SQL Server",
      providerHangfireDash: "/hangfire (только для SuperAdmin)",
      providerHangfireRetry: "Да (настраиваемые попытки)",
      providerHangfireYes: "Сохраняется в SQL — сохраняется при перезапусках",
      providerNativeBest: "Локальная разработка, модульные тесты",
      providerNativeDash: "Нет",
      providerNativeNo: "Только в памяти — теряется при перезапуске",
      providerNativeRetry: "Нет",
      providerQuartzBest: "Продакшн с Oracle или PostgreSQL",
      providerQuartzDash: "Нет (Quartz.UI доступен отдельно)",
      providerQuartzOptional: "В памяти (дополнительно хранилище БД)",
      providerQuartzRetry: "Да (через политику misfire)",
      providerRowBestFor: "Лучше всего для",
      providerRowDashboard: "Панель управления",
      providerRowPersistence: "Сохранение задач",
      providerRowRetry: "Автоматические повторные попытки",
      providersIntro:
        "Все три провайдера используют один и тот же интерфейс IAutoRegisteredJob. Единственное отличие заключается в том, как они планируют и сохраняют задачи. Настройте провайдера в appsettings.json — для переключения не требуется никаких изменений кода.",

      // Providers
      providersTitle: "Сравнение провайдеров",
      ruleMust1: "Один класс на файл в папке BackgroundJobs/",
      ruleMust2: "Регистрировать ОБЕ строки DI (конкретный тип + делегат фабрики)",
      ruleMust3: "Использовать 5-полевой CRON (не 6-полевой формат Quartz)",
      ruleMust4: "Сделать ExecuteAsync идемпотентным",
      ruleMust5: "Выполнять сборку после каждого изменения — scripe build backend",
      ruleNever1: "Никогда не импортировать пространства имен Hangfire или Quartz в задачи",
      ruleNever2:
        "Никогда не использовать [AutomaticRetry] — глобальные повторные попытки находятся в BackgroundJobsConfiguration",
      ruleNever3: "Никогда не вызывать RecurringJob.AddOrUpdate<T>() в коде модуля",
      ruleNever4: "Никогда не размещать задачи в Services/ или любой другой папке",
      ruleNever5: "Никогда не регистрировать как Singleton — всегда AddScoped",
      rulesMustTitle: "✅ Обязательно к выполнению",
      rulesNeverTitle: "❌ Никогда не делать",
      rulesTitle: "Правила",
      softDeleteFlowTitle: "Поток выполнения мягкого удаления",
      softDeleteIntro:
        "Базовый класс SoftDeleteCleanupJob<TContext> — это наиболее продвинутый вариант. Он автоматически обнаруживает все типы сущностей ISoftDeletable в DbContext, выполняет топологическую сортировку и пакетное удаление.",
      softDeleteTip:
        "Команда CLI 'scripe add-bg-service {Module}' генерирует файл задачи и добавляет обе регистрации DI за один шаг. Это рекомендуемый способ добавления SoftDeleteCleanupJob.",

      // SoftDelete
      softDeleteTitle: "SoftDeleteCleanupJob — Автоматическое удаление с учетом внешних ключей",

      tenantWarning:
        "Фоновые задачи выполняются вне контекста HTTP — контекст арендатора (tenant context) недоступен. Задачи, обрабатывающие данные арендаторов, должны создавать явную область действия (scope) с использованием IServiceScopeFactory.",
      title: "Фоновые задачи (Background Jobs)",
    },
    databaseMigrations: {
      architectureContent:
        "Абстрактный DbContext содержит бизнес-логику, а производные (Derived) контексты реализуют специфику SQL-провайдера.",
      architectureTitle: "Топология производных DbContext",
      cliContent: "CLI scripe-cli генерирует параллельные миграции для 3-х СУБД одной командой.",
      cliRemoveContent: "Удаление ошибочных миграций параллельно для всех СУБД.",
      cliRemoveTitle: "Безопасный откат (Smart Force Removal)",
      cliTitle: "Генерация мульти-провайдерных миграций",
      cliUpdateContent: "Инструмент автоматически применяет миграцию к активной базе данных.",
      cliUpdateTitle: "Авто-обновление провайдера",
      cliWarning: "Внимание: Никогда не редактируйте ModelSnapshot вручную.",
      description: "Адаптивная архитектура EF Core для SQL Server, Oracle и PostgreSQL.",
      diContent:
        "DI-контейнер динамически подключает нужный Derived DbContext, читая appsettings.json.",
      diTitle: "Внедрение провайдера во время выполнения",
      intro:
        "SCRIPE генерирует отдельные файлы ModelSnapshot для каждого типа СУБД, избегая конфликтов синтаксиса.",
      newProviderContent: "Процесс расширения чистой архитектуры (например, добавление SQLite).",
      newProviderStep1: "1. Создать закрытый (sealed) производный контекст.",
      newProviderStep2: "2. Реализовать Factory.",
      newProviderStep3: "3. Зарегистрировать в InfrastructureDI.cs.",
      newProviderStep4: "4. Выполнить команду scripe db add-migration.",
      newProviderTitle: "Добавление нового движка БД",
      title: "Миграции баз данных Enterprise-уровня",
    },
    fileStorage: {
      architectureTitle: "Архитектура хранилища",
      configTitle: "Конфигурация",
      description: "Паттерн Strategy для поддержки Local, Azure Blob, AWS S3 и MinIO.",
      intro: "Простая смена облачного хранилища изменением переменных среды.",
      providersTitle: "Провайдеры хранения",
      tenantScopingTitle: "Изоляция папок по тенантам",
      title: "Файловое хранилище (File Storage)",
      validationTitle: "Валидация файлов",
    },
    gatewayDeployment: {
      description:
        "Обратный прокси YARP, модульная система, развертывание в IIS и конфигурация Kestrel.",
      iisStep1Desc: "Запустите dotnet publish.",
      iisStep1Title: "1. Публикация приложения",
      iisStep2Desc: "Укажите путь к папке публикации.",
      iisStep2Title: "2. Настройка сайта IIS",
      iisStep3Desc: "Укажите строки подключения и MODULE_NAME.",
      iisStep3Title: "3. Настройка переменных",
      iisStep4Desc: "Установите 'No Managed Code' для out-of-process хостинга ASP.NET Core.",
      iisStep4Title: "4. Настройка пула приложений (App Pool)",
      iisTitle: "Развертывание в IIS (Windows Server)",
      intro: "Как SCRIPE развертывается и маршрутизирует трафик в производственной среде.",
      kestrelTitle: "Конфигурация Kestrel (Linux / Docker)",
      microservicesTitle: "Режим микросервисов",
      modesTitle: "Режимы развертывания",
      moduleIntro: "Переменная MODULE_NAME контролирует запуск: монолит, микросервис или шлюз.",
      moduleTitle: "Система модулей",
      monolithTitle: "Режим монолита",
      portNote: "В режиме микросервисов каждый модуль слушает свой уникальный сетевой порт.",
      title: "Шлюз и развертывание (Gateway & Deployment)",
      yarpIntro:
        "Маршрутизирует API-запросы к нужным бэкенд-модулям, обрабатывает SSL и буферизацию.",
      yarpTitle: "Шлюз YARP (API Gateway)",
    },
    healthChecks: {
      architectureTitle: "Архитектура эндпоинтов здоровья",
      checksIntro:
        "Каждая проверка валидирует конкретную зависимость инфраструктуры. Проверки выполняются параллельно для минимальной задержки. Неудачные проверки возвращают детальную информацию об ошибке без утечки конфиденциальных строк подключения. Статус отказа настраивается для каждой проверки — отказы Базы данных и Запуска возвращают Unhealthy, тогда как Redis, SMTP и Хранилище возвращают Degraded.",
      checksTitle: "Индивидуальные проверки здоровья",
      description:
        "Корпоративные эндпоинты здоровья для проб liveness, readiness и startup Kubernetes с 5 индивидуальными проверками.",
      dockerIntro:
        "Для развертываний Docker Compose настройте проверки здоровья в определении сервиса. Используйте /health/live для базового liveness и /health/ready для readiness. Установите start_period для предоставления времени на миграции базы данных.",
      dockerTip:
        "Для развертываний IIS: настройте пробу здоровья Application Request Routing (ARR) с использованием /health/ready в качестве URL проверки. Для Azure App Service: настройте путь проверки здоровья = /health/ready.",
      dockerTitle: "Проверка здоровья Docker Compose",
      endpointsTitle: "Эндпоинты здоровья",
      environmentsTitle: "Руководство по конкретным средам",
      intro:
        "SCRIPE предоставляет 5 корпоративных эндпоинтов здоровья, разработанных для оркестрации Kubernetes, интеграции с балансировщиками нагрузки и операционного мониторинга. Каждый эндпоинт проверяет конкретные зависимости инфраструктуры и возвращает структурированные JSON-ответы.",
      k8sIntro:
        "Эндпоинты здоровья SCRIPE напрямую соответствуют типам проб Kubernetes. Проба стартапа допускает до 5 минут (30 неудач × 10с интервал) для миграции базы данных при первом развертывании.",
      k8sTitle: "Конфигурация проб Kubernetes",
      registrationIntro:
        "Проверки здоровья регистрируются централизованно в HealthCheckExtensions.cs с явными тегами и статусами отказа. Теги определяют, какой эндпоинт включает каждую проверку.",
      registrationTitle: "Регистрация проверок здоровья",
      responseIntro:
        "SCRIPE поддерживает два формата ответа в зависимости от эндпоинта. Публичные эндпоинты проб возвращают минимальный JSON. Аутентифицированные эндпоинты возвращают детальный ответ с длительностями каждой проверки, тегами, данными нагрузки и деталями исключений.",
      responseTitle: "Формат ответа",
      title: "Проверки здоровья и пробы K8s",
    },
    loadTesting: {
      authFlowIntro:
        "Тест auth-flow.js моделирует реалистичные паттерны аутентификации: вход с учетными данными, доступ к защищенным эндпоинтам с JWT-токеном и проверка health check. Пользовательские метрики (scr_login_duration, scr_login_fail_rate) отслеживают SLA аутентификации.",
      authFlowTitle: "Скрипт теста потока аутентификации",
      backupIntro:
        "SCRIPE поддерживает стратегии резервного копирования для нескольких провайдеров с конкретными инструментами и частотой для каждого движка базы данных.",
      backupTitle: "Резервное копирование и аварийное восстановление",
      cicdIntro:
        "k6 интегрируется с GitHub Actions, GitLab CI и Azure Pipelines. Тесты запускаются против контейнеризированного экземпляра бэкенда с ожиданием готовности здоровья. Пайплайн автоматически проваливается при превышении любого порога SLA.",
      cicdTitle: "Интеграция CI/CD",
      description:
        "Наборы тестов производительности k6 с порогами SLA, интеграцией CI/CD и стратегией резервного копирования для нескольких провайдеров.",
      drWarning:
        "Критично: Проводите тестирование процедур аварийного восстановления ежеквартально. Резервная копия, которая никогда не восстанавливалась — это не резервная копия, а надежда.",
      intro:
        "SCRIPE включает скрипты нагрузочного тестирования k6 для проверки SLA производительности вместе с комплексной стратегией резервного копирования и аварийного восстановления.",
      overviewIntro:
        "Два предварительно подготовленных набора тестов k6 покрывают критические пользовательские маршруты: потоки аутентификации и CRUD-операции.",
      overviewTitle: "Наборы тестов k6",
      runningTitle: "Запуск нагрузочных тестов",
      thresholdsTitle: "Пороги SLA",
      title: "Нагрузочное тестирование и резервное копирование",
    },
    observability: {
      alertsIntro:
        "Предварительно настроенные правила оповещений Prometheus обнаруживают критические и предупреждающие состояния. Критические оповещения срабатывают при высоких показателях ошибок, падениях базы данных и экстремальной задержке.",
      alertsTitle: "Правила оповещений",
      configTitle: "Конфигурация наблюдаемости",
      description:
        "Распределенная трассировка OpenTelemetry, метрики Prometheus, централизованное логирование Grafana Loki и предварительно настроенные правила оповещений.",
      intro:
        "SCRIPE реализует полный стек наблюдаемости на основе открытых стандартов: OpenTelemetry для распределенной трассировки, Prometheus для сбора метрик, Grafana Loki для централизованного логирования и Jaeger для визуализации трасс.",
      loggingIntro:
        "Serilog обогащает каждую запись лога именем машины, окружением, идентификатором корреляции, идентификатором арендатора и тегом модуля. При настроенном Loki логи передаются в реальном времени.",
      loggingTitle: "Централизованное логирование (Serilog + Loki)",
      monitoringStackIntro:
        "Предварительно подготовленный файл Docker Compose запускает полный стек мониторинга с автоматически настроенными источниками данных, дашбордами и правилами оповещений.",
      monitoringStackTitle: "Docker-стек мониторинга",
      productionWarning:
        "В продакшене: установите TraceSampleRatio на 0.1, измените пароль Grafana по умолчанию, ограничьте доступ к /metrics через белый список IP обратного прокси.",
      prometheusIntro:
        "Эндпоинт /metrics предоставляет метрики OpenTelemetry в текстовом формате Prometheus. Prometheus собирает данные с этого эндпоинта каждые 15 секунд.",
      prometheusTitle: "Метрики Prometheus",
      stackTitle: "Архитектура стека наблюдаемости",
      title: "Наблюдаемость и мониторинг",
      tracingIntro:
        "TracingBehavior создает span OpenTelemetry для каждого обработчика команд и запросов с автоматическим обнаружением модуля, типа запроса и измерениями длительности.",
      tracingTitle: "Распределенная трассировка (OpenTelemetry)",
    },
    resilience: {
      architectureTitle: "Архитектура отказоустойчивости",
      circuitBreakerIntro:
        "После 5 сбоев подряд вызовы к внешнему сервису блокируются на 30 секунд для восстановления.",
      circuitBreakerTitle: "Паттерн Circuit Breaker (Прерыватель цепи)",
      configTitle: "Конфигурация",
      description:
        "Политики Polly: повторные попытки (retry), автоматическое отключение (circuit breaker) и таймауты.",
      intro: "Предотвращает каскадные сбои при интеграции с нестабильными внешними API.",
      retryTitle: "Политика повторных попыток",
      timeoutTitle: "Политика таймаутов",
      title: "Паттерны отказоустойчивости (Resilience)",
      usageTitle: "Использование с HttpClient",
    },
    scripeCli: {
      autoWiringIntro:
        "Главная ценность CLI — автоматическое внесение сгенерированного кода в системные файлы.",
      autoWiringTitle: "Автоматическое связывание (Auto-Wiring)",
      bgJobsIntro: "Создает шаблоны Hangfire-работников.",
      bgJobsTitle: "Генерация фоновых задач",
      commandsIntro: "Фундаментальные инструменты для генерации архитектуры.",
      commandsReferenceIntro:
        "Интерфейс командной строки (CLI) SCRIPE предлагает 123 команды в 10 различных категориях, охватывающих все аспекты жизненного цикла разработки и эксплуатации. Ниже представлена полная справочная таблица.",
      commandsReferenceTitle: "Полный справочник команд (v4.0)",
      commandsTitle: "Основные команды скаффолдинга",
      configIntro: "Файл scripe.config.json в корне монорепозитория.",
      configTitle: "Конфигурация проекта CLI",
      dbCliCmd: "Бесшовное управление EF Core и 3-мя типами баз данных одновременно.",
      dbSyncIntro: "Интеллектуальные функции синхронизации инфраструктуры.",
      dbSyncTitle: "Синхронизация БД и API",
      description:
        "Генерация кода (scaffolding), 79 шаблонов, работа с БД и автоматическая связка (Auto-Wiring).",
      destructionIntro: "Безопасное удаление сгенерированных модулей без разрушения компиляции.",
      destructionTitle: "Инструменты уничтожения (Откат)",
      dslIntro: "Определение свойств моделей прямо в командной строке.",
      dslSyntaxInfo: "Синтаксис: ИмяСвойства:Тип[:Модификатор1][:Модификатор2]",
      dslTitle: "Синтаксис Property DSL",
      intro:
        "Собственный CLI на Node.js, который генерирует full-stack модули и выполняет «хирургическое» внедрение кода в сотни файлов проекта.",
      namingIntro:
        "Автоматическое склонение и преобразование в PascalCase, kebab-case, SNAKE_CASE.",
      namingTitle: "Умные мутации имен",
      newFeatureIntro:
        "Создает полноценный CRUD-цикл (26 файлов: контроллеры, AstraFlow mediator, UI, схемы Zod).",
      newFeatureTitle: "Генерация функции: new-feature",
      newModuleIntro: "Создает 3-х уровневую DDD-структуру бэкенда и скелет фронтенда.",
      newModuleTitle: "Генерация модуля: new-module",
      revertSafely: "Операции отката чисто вычищают все внедрения (injections).",
      securityIntro: "Сгенерированные REST API автоматически снабжаются строгими атрибутами RBAC.",
      securityTitle: "Автоматизированная защита (Security)",
      syncApiCmd: "Считывает удаленный Swagger (OpenAPI) и переписывает Zod и TypeScript-модели.",
      templatesIntro:
        "Вместо ручного написания стандартных архитектур CLI обеспечивает соблюдение чистой архитектуры (Clean Architecture) с помощью 79 точных шаблонов Handlebars, охватывающих 54 файла бэкенда и 25 конфигураций фронтенда, гарантируя высокое качество.",
      templatesTitle: "79 неизменяемых шаблонов",
      title: "Инструментарий SCRIPE CLI",
      utilityIntro: "Управление пайплайнами сборок (npm, dotnet) из одной консоли.",
      utilityTitle: "Утилиты экосистемы",
      wiringDocker: "Ссылки в docker-compose.yml.",
      wiringFrontendApp: "Внедрение серверных маршрутов Next.js.",
      wiringFrontEnv: "Маппинг переменных .env.",
      wiringPermissions: "Генерация констант разрешений для TypeScript (permissions.ts).",
      wiringProgram: "Регистрация в Program.cs.",
      wiringSettings: "Интеграция строк в appsettings.json.",
      wiringSln: "Внедрение в .sln файлы.",
    },
    scripeStudio: {
      architectureIntro:
        "Studio состоит из двух компонентов: Движок (Express + Socket.io + SQLite на порту 4201) обрабатывает API-запросы, выполнение команд и потоковую передачу в реальном времени. UI (Next.js на порту 4200) предоставляет 19 страниц, охватывающих все аспекты рабочего процесса разработки.",
      architectureTitle: "Архитектура Studio",
      cliCommandsIntro:
        "Studio полностью управляется через CLI SCRIPE. Команда scripe studio поддерживает режим разработки (--dev), продакшн-режим, режим только сборки (studio build), пользовательские порты (--port, --engine-port) и безголовый режим (--no-browser).",
      cliCommandsTitle: "CLI-команды Studio",
      description:
        "Визуальная панель разработчика с управлением модулями в реальном времени, генераторами кода, управлением dev-серверами и встроенным терминалом.",
      featureConfig:
        "Редактор конфигурации — Просмотр и редактирование переменных окружения в .env, appsettings.json и scripe.config.json.",
      featureDashboard:
        "Dashboard — Оценка здоровья, лента активности, статистика модулей и обзор системы.",
      featureDatabase:
        "База данных — Миграции, сидинг данных, проверка статуса миграций, резервное копирование и сброс модулей.",
      featureDevServers:
        "Dev-серверы — Запуск, остановка и перезапуск серверов бэкенда и фронтенда одним кликом.",
      featureDocker:
        "Docker — Управление сервисами Docker Compose, просмотр логов, проверка здоровья контейнеров.",
      featureGenerators:
        "Генераторы кода — Генерация событий, спецификаций, валидаторов, перечислений, хуков, компонентов и страниц через формы.",
      featureModules:
        "Менеджер модулей — Создание, удаление, инспекция и просмотр модулей с визуальным интерфейсом и обратной связью в реальном времени.",
      featurePackages:
        "Менеджер пакетов — Добавление, удаление и обновление пакетов npm и NuGet для фронтенда и бэкенда.",
      featureSecurity:
        "Инструменты безопасности — Генерация секретов JWT/AES, аудит уязвимостей и проверка полноты окружения.",
      featuresTitle: "Функции Studio",
      featureTerminal:
        "Терминал — Встроенный терминал с историей команд, рендерингом ANSI-вывода и потоковой передачей через WebSocket.",
      intro:
        "SCRIPE Studio — это полнофункциональная визуальная панель разработчика, предоставляющая веб-интерфейс в реальном времени для управления модулями, запуска генераторов кода, управления dev-серверами, выполнения операций с базой данных, управления Docker и многого другого — всё из одной вкладки браузера.",
      securityIntro:
        "Многоуровневая защита: аутентификация по токену (генерируется при каждом запуске), валидация белого списка команд, централизованная санитизация ввода, ограничение частоты запросов (200 req/мин на IP), белый список CORS (только localhost) и валидация URL.",
      securityTitle: "Модель безопасности",
      title: "SCRIPE Studio",
    },
  },
};

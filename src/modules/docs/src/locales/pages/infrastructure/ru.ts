/**
 * Docs page locale — RU
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const ru = {
  infrastructure: {
    backgroundJobs: {
      title: "Фоновые задачи (Background Jobs)",
      description:
        "Автоматически обнаруживаемые, независимые от провайдера (Native, Hangfire, Quartz.NET) повторяющиеся задачи — 24 задачи в 4 модулях, без ручного связывания.",
      intro:
        "Система фоновых задач NEXORA построена на принципе: написать один раз, запустить на любом провайдере. Каждая задача реализует интерфейс IAutoRegisteredJob и автоматически обнаруживается при запуске. Переключение между Native, Hangfire или Quartz — это просто изменение конфигурации в appsettings.json, без необходимости изменения кода.",

      // Architecture
      architectureTitle: "Обзор архитектуры",
      architectureIntro:
        "При запуске BackgroundJobsConfiguration считывает активный провайдер из appsettings.json и вызывает GetServices<IAutoRegisteredJob>() для обнаружения каждой зарегистрированной задачи из DI-контейнера. Для каждой задачи проверяется переопределение настроек (appsettings), разрешаются Enabled и CronExpression, затем задача планируется с использованием API провайдера. Сама задача не содержит кода, специфичного для провайдера.",
      architectureFlowTitle: "Пайплайн автоматического обнаружения",

      // IAutoRegisteredJob Contract
      nodeConfig: "[RU] appsettings.json\nProvider + Per-Job Overrides",
      descConfig:
        "[RU] Provider: Native | Hangfire | Quartz\nJobs: { id: { Enabled, CronExpression } }",
      nodeStartup: "[RU] BackgroundJobsConfiguration\nAddBackgroundJobsConfiguration()",
      descStartup: "[RU] Reads provider, discovers all jobs, schedules them",
      nodeDiscovery: "[RU] Auto-Discovery Loop\nGetServices<IAutoRegisteredJob>()",
      descDiscovery: "[RU] Scans DI container for every registered IAutoRegisteredJob",
      nodeSchedule: "[RU] Schedule Each Job\nIf Enabled -> Register with provider API",
      descSchedule: "[RU] Uses CronExpression from appsettings override or job default",
      nodeExecute: "[RU] job.ExecuteAsync(ct)\nAt every cron tick",
      descExecute: "[RU] Provider-agnostic - job has zero knowledge of which provider runs it",
      conn1: "[RU] drives",
      conn2: "[RU] triggers",
      conn3: "[RU] for each job",
      conn4: "[RU] on cron tick",
      contractTitle: "Контракт IAutoRegisteredJob",
      contractIntro:
        "Каждая повторяющаяся фоновая задача в NEXORA реализует один интерфейс: IAutoRegisteredJob. Это весь контракт — три свойства и один метод. Интерфейс намеренно исключает любые концепции, специфичные для провайдера (никаких атрибутов Hangfire или аннотаций Quartz). Задача ничего не знает о провайдере, который ее запускает.",

      // DI Registration
      diTitle: "Регистрация DI — критический шаблон из двух строк",
      diIntro:
        "Каждая задача требует ровно двух регистраций DI в файле DependencyInjection.cs ее модуля. Отсутствие второй строки делает задачу полностью невидимой для всех провайдеров — она никогда не будет обнаружена или запланирована, и при этом не будет никаких ошибок или предупреждений.",
      diWarningTitle: "Никогда не пропускайте строку 2",
      diWarning:
        "Делегат фабрики IAutoRegisteredJob (Строка 2) — это то, что обеспечивает автоматическое обнаружение. GetServices<IAutoRegisteredJob>() возвращает только задачи, зарегистрированные КАК IAutoRegisteredJob. Задача, зарегистрированная только по ее конкретному типу, невидима для всех трех провайдеров.",

      // Class Hierarchy
      hierarchyTitle: "Иерархия классов — Выберите свою базу",
      hierarchyIntro:
        "В зависимости от необходимой структуры существуют три варианта. Легковесные задачи реализуют IAutoRegisteredJob напрямую. Задачи, которым нужны структурированные журналы тайминга, расширяют RecurringJobBase. Задачи, очищающие мягко удаленные сущности, расширяют SoftDeleteCleanupJob<TContext>.",
      hierarchyColClass: "Класс",
      hierarchyColUseWhen: "Использовать когда",
      hierarchyColGets: "Что вы получаете",
      hierarchyRow1When: "Задача проста, не требует много шаблонного кода",
      hierarchyRow1Gets: "Только контракт — полный контроль, никаких дополнений",
      hierarchyRow2When: "Нужны структурированные журналы времени и ошибок",
      hierarchyRow2Gets:
        "Автоматические журналы запуска/завершения/ошибок с указанием затраченного времени",
      hierarchyRow3When: "Модулю нужна задача окончательной очистки мягко удаленных записей",
      hierarchyRow3Gets:
        "Автоматическое обнаружение сущностей, удаление с учетом внешних ключей, пакетная обработка",

      // Providers
      providersTitle: "Сравнение провайдеров",
      providersIntro:
        "Все три провайдера используют один и тот же интерфейс IAutoRegisteredJob. Единственное отличие заключается в том, как они планируют и сохраняют задачи. Настройте провайдера в appsettings.json — для переключения не требуется никаких изменений кода.",
      providerColFeature: "Функция",
      providerColNative: "Native",
      providerColHangfire: "Hangfire",
      providerColQuartz: "Quartz",
      providerRowPersistence: "Сохранение задач",
      providerNativeNo: "Только в памяти — теряется при перезапуске",
      providerHangfireYes: "Сохраняется в SQL — сохраняется при перезапусках",
      providerQuartzOptional: "В памяти (дополнительно хранилище БД)",
      providerRowDashboard: "Панель управления",
      providerNativeDash: "Нет",
      providerHangfireDash: "/hangfire (только для SuperAdmin)",
      providerQuartzDash: "Нет (Quartz.UI доступен отдельно)",
      providerRowRetry: "Автоматические повторные попытки",
      providerNativeRetry: "Нет",
      providerHangfireRetry: "Да (настраиваемые попытки)",
      providerQuartzRetry: "Да (через политику misfire)",
      providerRowBestFor: "Лучше всего для",
      providerNativeBest: "Локальная разработка, модульные тесты",
      providerHangfireBest: "Продакшн с SQL Server",
      providerQuartzBest: "Продакшн с Oracle или PostgreSQL",

      // Jobs Inventory
      inventoryTitle: "Полный реестр задач — 24 задачи",
      inventoryIntro:
        "Все 24 повторяющиеся фоновые задачи в четырех модулях. Каждая задача реализует IAutoRegisteredJob. Cron по умолчанию можно переопределить для каждого окружения в appsettings.json.",
      inventoryColPurpose: "Назначение",
      inventoryCoreTitle: "Модуль Core (1 задача)",
      inventoryIdentityTitle: "Модуль Identity (4 задачи)",
      inventoryEntitlementsTitle: "Модуль Entitlements (12 задач)",
      inventoryComplianceTitle: "Модуль Compliance (7 задач)",

      // Job purpose descriptions
      jobOutboxCleanup: "Удаляет обработанные сообщения outbox старше 7 дней",
      jobIdentitySoftDelete: "Навсегда удаляет мягко удаленные сущности Identity",
      jobEmailProcessing: "Опрашивает и отправляет отложенные email через EmailJobProcessor",
      jobWebhookRetry: "Обрабатывает постоянную очередь повторных попыток вебхуков порциями по 50",
      jobWebhookLogCleanup: "Удаляет журналы доставки вебхуков старше 90 дней",
      identityNote:
        "EmailProcessingJob и WebhookRetryJob/WebhookLogCleanupJob являются базовыми инфраструктурными задачами, зарегистрированными в DI-контейнере модуля Identity, так как они зависят от сервисов Identity.",
      jobEntitlementsSoftDelete: "Навсегда удаляет мягко удаленные сущности Entitlements",
      jobSubscriptionReconciliation: "Завершает пробные периоды, продлевает активные подписки",
      jobTrialNotification:
        "Отправляет напоминания о пробных периодах, истекающих через 7, 3 или 1 день",
      jobDunningNotification: "Уведомления об ошибках платежей с нарастающей срочностью",
      jobEditionRollout: "Применяет запланированные обновления и понижения редакций",
      jobUserSubscriptionReconciliation: "Сверка пользовательских подписок уровня 2",
      jobAnalyticsSnapshot: "Ежедневная агрегация снимков дохода/MRR/ARR",
      jobTenantHealthScore:
        "Пересчитывает оценку здоровья (health score) для всех активных арендаторов",
      jobAnalyticsReport: "Еженедельная генерация аналитических отчетов",
      jobCommissionInvoicing: "Ежемесячная консолидация счетов по комиссиям",
      jobCommissionAutoCharge:
        "Повторные попытки списания неудачных автоматических платежей по комиссиям",
      jobPaymobRecurringBilling: "Регулярные платежи по сохраненным картам Paymob",
      jobComplianceSoftDelete: "Навсегда удаляет мягко удаленные сущности Compliance",
      jobDsrExecution: "Выполняет ожидающие запросы субъектов данных (DSR) каждые 5 минут",
      jobDsrEscalation: "Создает оповещения для DSR, приближающихся к крайнему сроку SLA",
      jobDsrExportCleanup: "Удаляет просроченные файлы экспорта DSR",
      jobRetentionEnforcement: "Обеспечивает соблюдение политик хранения данных",
      jobConsentExpiry: "Завершает срок действия просроченных согласий пользователей",
      jobReportGeneration: "Опрашивает и генерирует ожидающие отчеты соответствия каждые 2 минуты",

      // Creating a New Job
      newJobTitle: "Создание новой фоновой задачи",
      newJobIntro:
        "Выполните ровно эти четыре шага. Единственные обязательные файлы — это сам класс задачи и две строки регистрации DI. Все остальное подключается автоматически.",
      newJobStep1Title: "Шаг 1 — Создание класса задачи",
      newJobStep1Desc:
        "Создайте новый файл в {Module}.Infrastructure/BackgroundJobs/. Используйте соглашение об именовании JobId: '{module}-{purpose}' (kebab-case). Реализуйте ExecuteAsync как идемпотентный метод.",
      newJobStep2Title: "Шаг 2 — Регистрация ДВУХ строк DI",
      newJobStep2Desc:
        "В DependencyInjection.cs модуля добавьте ровно две регистрации. Строка 1 обеспечивает внедрение зависимостей через конструктор. Строка 2 обеспечивает автоматическое обнаружение. Никогда не пропускайте строку 2.",
      newJobStep3Title: "Шаг 3 — Добавление переопределения appsettings (Необязательно)",
      newJobStep3Desc:
        "Для расписания, зависящего от окружения, или для отключения задачи, добавьте переопределение в раздел BackgroundJobs.Jobs, используя JobId в качестве ключа.",
      newJobStep4Title: "Шаг 4 — Сборка и проверка",
      newJobStep4Desc:
        "Выполните сборку бэкенда. Отсутствие ошибок означает, что задача готова. Автоматическое обнаружение позаботится обо всем остальном — никакой ручной регистрации нигде не требуется.",

      // SoftDelete
      softDeleteTitle: "SoftDeleteCleanupJob — Автоматическое удаление с учетом внешних ключей",
      softDeleteIntro:
        "Базовый класс SoftDeleteCleanupJob<TContext> — это наиболее продвинутый вариант. Он автоматически обнаруживает все типы сущностей ISoftDeletable в DbContext, выполняет топологическую сортировку и пакетное удаление.",
      softDeleteTip:
        "Команда CLI 'nexora add-bg-service {Module}' генерирует файл задачи и добавляет обе регистрации DI за один шаг. Это рекомендуемый способ добавления SoftDeleteCleanupJob.",
      softDeleteFlowTitle: "Поток выполнения мягкого удаления",
      flowCronLabel: "Тик Cron (3:00)",
      flowCronDesc: "Cron по умолчанию для задач мягкого удаления",
      flowInitLabel: "SoftDeleteCleanupJob<TContext>",
      flowInitDesc: "Создается контейнером DI",
      flowScanLabel: "Обнаружение ISoftDeletable",
      flowScanDesc: "Рефлексивное сканирование DbContext для сущностей, реализующих ISoftDeletable",
      flowFilterLabel: "Фильтрация просроченных сущностей",
      flowFilterDesc:
        "Поиск записей, где IsDeleted = true И DeletedAt < DateTime.UtcNow.AddDays(-30)",
      flowCascadeLabel: "Каскадирование с учетом FK",
      flowCascadeDesc: "Обрабатывает ограничения внешних ключей в правильном порядке удаления",
      flowExecuteLabel: "Жесткое удаление",
      flowExecuteDesc:
        "Выполнение нативного SQL для массового удаления в обход отслеживания изменений EF",
      connTriggers: "запускает",
      connStarts: "начинает",
      connBuilds: "строит запрос",
      connOrders: "упорядочивает",
      connRemoves: "удаляет",
      rulesTitle: "Правила",
      rulesMustTitle: "✅ Обязательно к выполнению",
      rulesNeverTitle: "❌ Никогда не делать",
      ruleMust1: "Один класс на файл в папке BackgroundJobs/",
      ruleMust2: "Регистрировать ОБЕ строки DI (конкретный тип + делегат фабрики)",
      ruleMust3: "Использовать 5-полевой CRON (не 6-полевой формат Quartz)",
      ruleMust4: "Сделать ExecuteAsync идемпотентным",
      ruleMust5: "Выполнять сборку после каждого изменения — nexora build backend",
      ruleNever1: "Никогда не импортировать пространства имен Hangfire или Quartz в задачи",
      ruleNever2:
        "Никогда не использовать [AutomaticRetry] — глобальные повторные попытки находятся в BackgroundJobsConfiguration",
      ruleNever3: "Никогда не вызывать RecurringJob.AddOrUpdate<T>() в коде модуля",
      ruleNever4: "Никогда не размещать задачи в Services/ или любой другой папке",
      ruleNever5: "Никогда не регистрировать как Singleton — всегда AddScoped",

      tenantWarning:
        "Фоновые задачи выполняются вне контекста HTTP — контекст арендатора (tenant context) недоступен. Задачи, обрабатывающие данные арендаторов, должны создавать явную область действия (scope) с использованием IServiceScopeFactory.",
    },
    fileStorage: {
      title: "Файловое хранилище (File Storage)",
      description: "Паттерн Strategy для поддержки Local, Azure Blob, AWS S3 и MinIO.",
      intro: "Простая смена облачного хранилища изменением переменных среды.",
      architectureTitle: "Архитектура хранилища",
      providersTitle: "Провайдеры хранения",
      validationTitle: "Валидация файлов",
      tenantScopingTitle: "Изоляция папок по тенантам",
      configTitle: "Конфигурация",
    },
    resilience: {
      title: "Паттерны отказоустойчивости (Resilience)",
      description:
        "Политики Polly: повторные попытки (retry), автоматическое отключение (circuit breaker) и таймауты.",
      intro: "Предотвращает каскадные сбои при интеграции с нестабильными внешними API.",
      architectureTitle: "Архитектура отказоустойчивости",
      retryTitle: "Политика повторных попыток",
      circuitBreakerTitle: "Паттерн Circuit Breaker (Прерыватель цепи)",
      circuitBreakerIntro:
        "После 5 сбоев подряд вызовы к внешнему сервису блокируются на 30 секунд для восстановления.",
      timeoutTitle: "Политика таймаутов",
      usageTitle: "Использование с HttpClient",
      configTitle: "Конфигурация",
    },
    gatewayDeployment: {
      title: "Шлюз и развертывание (Gateway & Deployment)",
      description:
        "Обратный прокси YARP, модульная система, развертывание в IIS и конфигурация Kestrel.",
      intro: "Как NEXORA развертывается и маршрутизирует трафик в производственной среде.",
      yarpTitle: "Шлюз YARP (API Gateway)",
      yarpIntro:
        "Маршрутизирует API-запросы к нужным бэкенд-модулям, обрабатывает SSL и буферизацию.",
      moduleTitle: "Система модулей",
      moduleIntro: "Переменная MODULE_NAME контролирует запуск: монолит, микросервис или шлюз.",
      modesTitle: "Режимы развертывания",
      monolithTitle: "Режим монолита",
      microservicesTitle: "Режим микросервисов",
      portNote: "В режиме микросервисов каждый модуль слушает свой уникальный сетевой порт.",
      iisTitle: "Развертывание в IIS (Windows Server)",
      iisStep1Title: "1. Публикация приложения",
      iisStep1Desc: "Запустите dotnet publish.",
      iisStep2Title: "2. Настройка сайта IIS",
      iisStep2Desc: "Укажите путь к папке публикации.",
      iisStep3Title: "3. Настройка переменных",
      iisStep3Desc: "Укажите строки подключения и MODULE_NAME.",
      iisStep4Title: "4. Настройка пула приложений (App Pool)",
      iisStep4Desc: "Установите 'No Managed Code' для out-of-process хостинга ASP.NET Core.",
      kestrelTitle: "Конфигурация Kestrel (Linux / Docker)",
    },
    databaseMigrations: {
      title: "Миграции баз данных Enterprise-уровня",
      description: "Адаптивная архитектура EF Core для SQL Server, Oracle и PostgreSQL.",
      intro:
        "NEXORA генерирует отдельные файлы ModelSnapshot для каждого типа СУБД, избегая конфликтов синтаксиса.",
      architectureTitle: "Топология производных DbContext",
      architectureContent:
        "Абстрактный DbContext содержит бизнес-логику, а производные (Derived) контексты реализуют специфику SQL-провайдера.",
      diTitle: "Внедрение провайдера во время выполнения",
      diContent:
        "DI-контейнер динамически подключает нужный Derived DbContext, читая appsettings.json.",
      cliTitle: "Генерация мульти-провайдерных миграций",
      cliContent: "CLI nexora-cli генерирует параллельные миграции для 3-х СУБД одной командой.",
      cliWarning: "Внимание: Никогда не редактируйте ModelSnapshot вручную.",
      cliUpdateTitle: "Авто-обновление провайдера",
      cliUpdateContent: "Инструмент автоматически применяет миграцию к активной базе данных.",
      cliRemoveTitle: "Безопасный откат (Smart Force Removal)",
      cliRemoveContent: "Удаление ошибочных миграций параллельно для всех СУБД.",
      newProviderTitle: "Добавление нового движка БД",
      newProviderContent: "Процесс расширения чистой архитектуры (например, добавление SQLite).",
      newProviderStep1: "1. Создать закрытый (sealed) производный контекст.",
      newProviderStep2: "2. Реализовать Factory.",
      newProviderStep3: "3. Зарегистрировать в InfrastructureDI.cs.",
      newProviderStep4: "4. Выполнить команду nexora db add-migration.",
    },
    nexoraCli: {
      title: "Инструментарий NEXORA CLI",
      description:
        "Генерация кода (scaffolding), 66 шаблонов, работа с БД и автоматическая связка (Auto-Wiring).",
      intro:
        "Собственный CLI на Node.js, который генерирует full-stack модули и выполняет «хирургическое» внедрение кода в сотни файлов проекта.",
      commandsTitle: "Основные команды скаффолдинга",
      commandsIntro: "Фундаментальные инструменты для генерации архитектуры.",
      newModuleTitle: "Генерация модуля: new-module",
      newModuleIntro: "Создает 3-х уровневую DDD-структуру бэкенда и скелет фронтенда.",
      newFeatureTitle: "Генерация функции: new-feature",
      newFeatureIntro:
        "Создает полноценный CRUD-цикл (26 файлов: контроллеры, NEXORA mediator, UI, схемы Zod).",
      destructionTitle: "Инструменты уничтожения (Откат)",
      destructionIntro: "Безопасное удаление сгенерированных модулей без разрушения компиляции.",
      bgJobsTitle: "Генерация фоновых задач",
      bgJobsIntro: "Создает шаблоны Hangfire-работников.",
      dslTitle: "Синтаксис Property DSL",
      dslIntro: "Определение свойств моделей прямо в командной строке.",
      dslSyntaxInfo: "Синтаксис: ИмяСвойства:Тип[:Модификатор1][:Модификатор2]",
      templatesTitle: "66 неизменяемых шаблонов",
      templatesIntro:
        "Шаблоны Handlebars обеспечивают абсолютное соответствие стандартам чистой архитектуры.",
      securityTitle: "Автоматизированная защита (Security)",
      securityIntro: "Сгенерированные REST API автоматически снабжаются строгими атрибутами RBAC.",
      autoWiringTitle: "Автоматическое связывание (Auto-Wiring)",
      autoWiringIntro:
        "Главная ценность CLI — автоматическое внесение сгенерированного кода в системные файлы.",
      wiringSln: "Внедрение в .sln файлы.",
      wiringProgram: "Регистрация в Program.cs.",
      wiringSettings: "Интеграция строк в appsettings.json.",
      wiringDocker: "Ссылки в docker-compose.yml.",
      wiringPermissions: "Генерация констант разрешений для TypeScript (permissions.ts).",
      wiringFrontendApp: "Внедрение серверных маршрутов Next.js.",
      wiringFrontEnv: "Маппинг переменных .env.",
      revertSafely: "Операции отката чисто вычищают все внедрения (injections).",
      dbSyncTitle: "Синхронизация БД и API",
      dbSyncIntro: "Интеллектуальные функции синхронизации инфраструктуры.",
      dbCliCmd: "Бесшовное управление EF Core и 3-мя типами баз данных одновременно.",
      syncApiCmd: "Считывает удаленный Swagger (OpenAPI) и переписывает Zod и TypeScript-модели.",
      configTitle: "Конфигурация проекта CLI",
      configIntro: "Файл nexora.config.json в корне монорепозитория.",
      namingTitle: "Умные мутации имен",
      namingIntro:
        "Автоматическое склонение и преобразование в PascalCase, kebab-case, SNAKE_CASE.",
      utilityTitle: "Утилиты экосистемы",
      utilityIntro: "Управление пайплайнами сборок (npm, dotnet) из одной консоли.",
    },
    nexoraStudio: {
      title: "NEXORA Studio",
      description:
        "Визуальная панель разработчика с управлением модулями в реальном времени, генераторами кода, управлением dev-серверами и встроенным терминалом.",
      intro:
        "NEXORA Studio — это полнофункциональная визуальная панель разработчика, предоставляющая веб-интерфейс в реальном времени для управления модулями, запуска генераторов кода, управления dev-серверами, выполнения операций с базой данных, управления Docker и многого другого — всё из одной вкладки браузера.",
      architectureTitle: "Архитектура Studio",
      architectureIntro:
        "Studio состоит из двух компонентов: Движок (Express + Socket.io + SQLite на порту 4201) обрабатывает API-запросы, выполнение команд и потоковую передачу в реальном времени. UI (Next.js на порту 4200) предоставляет 19 страниц, охватывающих все аспекты рабочего процесса разработки.",
      securityTitle: "Модель безопасности",
      securityIntro:
        "Многоуровневая защита: аутентификация по токену (генерируется при каждом запуске), валидация белого списка команд, централизованная санитизация ввода, ограничение частоты запросов (200 req/мин на IP), белый список CORS (только localhost) и валидация URL.",
      featuresTitle: "Функции Studio",
      featureDashboard:
        "Dashboard — Оценка здоровья, лента активности, статистика модулей и обзор системы.",
      featureModules:
        "Менеджер модулей — Создание, удаление, инспекция и просмотр модулей с визуальным интерфейсом и обратной связью в реальном времени.",
      featureGenerators:
        "Генераторы кода — Генерация событий, спецификаций, валидаторов, перечислений, хуков, компонентов и страниц через формы.",
      featureDevServers:
        "Dev-серверы — Запуск, остановка и перезапуск серверов бэкенда и фронтенда одним кликом.",
      featureDatabase:
        "База данных — Миграции, сидинг данных, проверка статуса миграций, резервное копирование и сброс модулей.",
      featureDocker:
        "Docker — Управление сервисами Docker Compose, просмотр логов, проверка здоровья контейнеров.",
      featureTerminal:
        "Терминал — Встроенный терминал с историей команд, рендерингом ANSI-вывода и потоковой передачей через WebSocket.",
      featureConfig:
        "Редактор конфигурации — Просмотр и редактирование переменных окружения в .env, appsettings.json и nexora.config.json.",
      featurePackages:
        "Менеджер пакетов — Добавление, удаление и обновление пакетов npm и NuGet для фронтенда и бэкенда.",
      featureSecurity:
        "Инструменты безопасности — Генерация секретов JWT/AES, аудит уязвимостей и проверка полноты окружения.",
      cliCommandsTitle: "CLI-команды Studio",
      cliCommandsIntro:
        "Studio полностью управляется через CLI NEXORA. Команда nexora studio поддерживает режим разработки (--dev), продакшн-режим, режим только сборки (studio build), пользовательские порты (--port, --engine-port) и безголовый режим (--no-browser).",
    },
    healthChecks: {
      title: "Проверки здоровья и пробы K8s",
      description:
        "Корпоративные эндпоинты здоровья для проб liveness, readiness и startup Kubernetes с 5 индивидуальными проверками.",
      intro:
        "NEXORA предоставляет 5 корпоративных эндпоинтов здоровья, разработанных для оркестрации Kubernetes, интеграции с балансировщиками нагрузки и операционного мониторинга. Каждый эндпоинт проверяет конкретные зависимости инфраструктуры и возвращает структурированные JSON-ответы.",
      architectureTitle: "Архитектура эндпоинтов здоровья",
      endpointsTitle: "Эндпоинты здоровья",
      checksTitle: "Индивидуальные проверки здоровья",
      checksIntro:
        "Каждая проверка валидирует конкретную зависимость инфраструктуры. Проверки выполняются параллельно для минимальной задержки. Неудачные проверки возвращают детальную информацию об ошибке без утечки конфиденциальных строк подключения. Статус отказа настраивается для каждой проверки — отказы Базы данных и Запуска возвращают Unhealthy, тогда как Redis, SMTP и Хранилище возвращают Degraded.",
      registrationTitle: "Регистрация проверок здоровья",
      registrationIntro:
        "Проверки здоровья регистрируются централизованно в HealthCheckExtensions.cs с явными тегами и статусами отказа. Теги определяют, какой эндпоинт включает каждую проверку.",
      k8sTitle: "Конфигурация проб Kubernetes",
      k8sIntro:
        "Эндпоинты здоровья NEXORA напрямую соответствуют типам проб Kubernetes. Проба стартапа допускает до 5 минут (30 неудач × 10с интервал) для миграции базы данных при первом развертывании.",
      dockerTitle: "Проверка здоровья Docker Compose",
      dockerIntro:
        "Для развертываний Docker Compose настройте проверки здоровья в определении сервиса. Используйте /health/live для базового liveness и /health/ready для readiness. Установите start_period для предоставления времени на миграции базы данных.",
      responseTitle: "Формат ответа",
      responseIntro:
        "NEXORA поддерживает два формата ответа в зависимости от эндпоинта. Публичные эндпоинты проб возвращают минимальный JSON. Аутентифицированные эндпоинты возвращают детальный ответ с длительностями каждой проверки, тегами, данными нагрузки и деталями исключений.",
      environmentsTitle: "Руководство по конкретным средам",
      dockerTip:
        "Для развертываний IIS: настройте пробу здоровья Application Request Routing (ARR) с использованием /health/ready в качестве URL проверки. Для Azure App Service: настройте путь проверки здоровья = /health/ready.",
    },
    observability: {
      title: "Наблюдаемость и мониторинг",
      description:
        "Распределенная трассировка OpenTelemetry, метрики Prometheus, централизованное логирование Grafana Loki и предварительно настроенные правила оповещений.",
      intro:
        "NEXORA реализует полный стек наблюдаемости на основе открытых стандартов: OpenTelemetry для распределенной трассировки, Prometheus для сбора метрик, Grafana Loki для централизованного логирования и Jaeger для визуализации трасс.",
      stackTitle: "Архитектура стека наблюдаемости",
      tracingTitle: "Распределенная трассировка (OpenTelemetry)",
      tracingIntro:
        "TracingBehavior создает span OpenTelemetry для каждого обработчика команд и запросов с автоматическим обнаружением модуля, типа запроса и измерениями длительности.",
      prometheusTitle: "Метрики Prometheus",
      prometheusIntro:
        "Эндпоинт /metrics предоставляет метрики OpenTelemetry в текстовом формате Prometheus. Prometheus собирает данные с этого эндпоинта каждые 15 секунд.",
      loggingTitle: "Централизованное логирование (Serilog + Loki)",
      loggingIntro:
        "Serilog обогащает каждую запись лога именем машины, окружением, идентификатором корреляции, идентификатором арендатора и тегом модуля. При настроенном Loki логи передаются в реальном времени.",
      alertsTitle: "Правила оповещений",
      alertsIntro:
        "Предварительно настроенные правила оповещений Prometheus обнаруживают критические и предупреждающие состояния. Критические оповещения срабатывают при высоких показателях ошибок, падениях базы данных и экстремальной задержке.",
      monitoringStackTitle: "Docker-стек мониторинга",
      monitoringStackIntro:
        "Предварительно подготовленный файл Docker Compose запускает полный стек мониторинга с автоматически настроенными источниками данных, дашбордами и правилами оповещений.",
      configTitle: "Конфигурация наблюдаемости",
      productionWarning:
        "В продакшене: установите TraceSampleRatio на 0.1, измените пароль Grafana по умолчанию, ограничьте доступ к /metrics через белый список IP обратного прокси.",
    },
    auditTrail: {
      title: "Корпоративный аудиторский след",
      description:
        "Полное ведение аудита с автоматическим определением модуля, отслеживанием корреляции, трансляцией в реальном времени через SignalR и более 45 типами событий.",
      intro:
        "Корпоративный аудиторский след NEXORA фиксирует каждое значимое действие на платформе — от событий аутентификации и мутаций сущностей до изменений разрешений и инцидентов безопасности.",
      architectureTitle: "Архитектура аудиторского следа",
      entityTitle: "Схема сущности AuditLog",
      entityIntro:
        "Сущность AuditLog фиксирует полный контекст для каждого проверяемого события. Старые и новые значения сохраняются как JSON-снимки.",
      moduleDetectionTitle: "Автоматическое определение модуля",
      moduleDetectionIntro:
        "AuditService автоматически определяет, какой модуль сгенерировал каждое событие аудита, анализируя путь API-эндпоинта или имя типа сущности.",
      eventTypesTitle: "Типы событий аудита (45+)",
      realtimeTitle: "Трансляция в реальном времени",
      realtimeIntro:
        "События аудита (исключая рутинные HTTP-запросы) транслируются через SignalR подключенным клиентам. События ограничены по арендатору через специфические группы.",
      queryTitle: "API запросов аудиторского лога",
      queryIntro:
        "Эндпоинт запросов аудиторского лога поддерживает комплексную фильтрацию с 12 параметрами. Все фильтры опциональны и могут комбинироваться. Результаты пагинированы (по умолчанию: 20 записей, максимум: 100) и отсортированы по временной метке по убыванию.",
      queryTip:
        "Профессиональный совет: Используйте CorrelationId для отслеживания полного жизненного цикла одного HTTP-запроса через все записи аудита.",
    },
    loadTesting: {
      title: "Нагрузочное тестирование и резервное копирование",
      description:
        "Наборы тестов производительности k6 с порогами SLA, интеграцией CI/CD и стратегией резервного копирования для нескольких провайдеров.",
      intro:
        "NEXORA включает скрипты нагрузочного тестирования k6 для проверки SLA производительности вместе с комплексной стратегией резервного копирования и аварийного восстановления.",
      overviewTitle: "Наборы тестов k6",
      overviewIntro:
        "Два предварительно подготовленных набора тестов k6 покрывают критические пользовательские маршруты: потоки аутентификации и CRUD-операции.",
      thresholdsTitle: "Пороги SLA",
      authFlowTitle: "Скрипт теста потока аутентификации",
      authFlowIntro:
        "Тест auth-flow.js моделирует реалистичные паттерны аутентификации: вход с учетными данными, доступ к защищенным эндпоинтам с JWT-токеном и проверка health check. Пользовательские метрики (nexora_login_duration, nexora_login_fail_rate) отслеживают SLA аутентификации.",
      runningTitle: "Запуск нагрузочных тестов",
      cicdTitle: "Интеграция CI/CD",
      cicdIntro:
        "k6 интегрируется с GitHub Actions, GitLab CI и Azure Pipelines. Тесты запускаются против контейнеризированного экземпляра бэкенда с ожиданием готовности здоровья. Пайплайн автоматически проваливается при превышении любого порога SLA.",
      backupTitle: "Резервное копирование и аварийное восстановление",
      backupIntro:
        "NEXORA поддерживает стратегии резервного копирования для нескольких провайдеров с конкретными инструментами и частотой для каждого движка базы данных.",
      drWarning:
        "Критично: Проводите тестирование процедур аварийного восстановления ежеквартально. Резервная копия, которая никогда не восстанавливалась — это не резервная копия, а надежда.",
    },
  },
};

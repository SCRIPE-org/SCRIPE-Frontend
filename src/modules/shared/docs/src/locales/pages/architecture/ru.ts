// FILE-EXCEPTION: file length
/**
 * Docs page locale — RU
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const ru = {
  architecture: {
    overview: {
      title: "Обзор архитектуры",
      description:
        "Слои Clean Architecture, backend-конвейер, frontend SOLID-поток и правила границ модулей.",
      intro:
        "SCRIPE следует строгой Clean Architecture с четырьмя слоями: Presentation, Application, Domain и Infrastructure. Правило зависимостей гарантирует, что внутренние слои не зависят от внешних. Этот подход применяется и в backend, и во frontend.",
      layersTitle: "Слои чистой архитектуры",
      backendArchTitle: "Архитектура бэкенда",
      backendArchIntro:
        "Бэкенд следует архитектуре конвейера запросов (pipeline), где каждый HTTP-запрос проходит через middleware, контроллеры, поведения (behaviors) SCRIPE mediator и, наконец, обработчик CQRS. Это обеспечивает согласованную валидацию, аудит и обработку ошибок.",
      frontendArchTitle: "Архитектура фронтенда",
      frontendArchIntro:
        "Во фронтенде используется паттерн SOLID View/ViewModel, где Views (представления) — это чистый UI (без состояния и логики), а ViewModels содержат всю бизнес-логику. Паттерн коннектора отделяет маршрутизацию Next.js (Server Components) от логики приложения (Client Components).",
      moduleBoundariesTitle: "Границы модулей",
      moduleBoundariesIntro:
        "Modules have strict code boundaries. This supports future extraction, but extraction is not the same as proven production microservices readiness.",
      withBoundaries: "С границами модулей",
      withoutBoundaries: "Без границ модулей",
      communicationPatternsTitle: "Кросс-модульная коммуникация",
      crossModuleNote:
        "Паттерн Event Bus (шина событий) запланирован для будущих релизов. В настоящее время модули общаются исключительно через навигацию по URL и общие ID.",
    },
    backend: {
      title: "Архитектура бэкенда",
      description:
        "Анатомия Program.cs, конвейер middleware, карта DI-сервисов, паттерн регистрации модулей и каталог контроллеров.",
      intro:
        "Бэкенд SCRIPE — это модульный монолит на .NET 10, содержащий 288 строк в Program.cs, которые связывают 16 регистраций сервисов, 10 компонентов middleware и 18 REST-контроллеров. Эта страница разбирает каждый уровень архитектуры бэкенда.",
      programCsTitle: "Анатомия Program.cs",
      programCsIntro:
        "Program.cs — это точка входа в приложение и центр его сборки. Он определяет режим развертывания, регистрирует сервисы в определенном порядке и строит конвейер middleware. Файл имеет четкую структуру из 5 разделов.",
      middlewarePipelineTitle: "Конвейер Middleware",
      middlewarePipelineIntro:
        "Пайплайн промежуточного ПО обрабатывает каждый HTTP-запрос в строгом порядке. Каждое middleware может прервать конвейер (например, rate limiter возвращает 429, auth возвращает 401). Порядок важен — его изменение может нарушить безопасность.",
      diMapTitle: "Карта внедрения зависимостей (DI)",
      diMapIntro:
        "В следующей таблице показаны все основные интерфейсы сервисов, их реализации, время жизни (lifetimes) и места регистрации. Понимание этой карты необходимо для отладки и расширения системы.",
      modulePatternTitle: "Паттерн регистрации модулей",
      modulePatternIntro:
        "Каждый новый модуль следует одному и тому же паттерну регистрации DI. Метод расширения AddXxxModule() регистрирует DbContext модуля, репозитории, сервисы и маркер регистрации модуля.",
      controllersTitle: "Контроллеры",
      controllerTip:
        "Все контроллеры наследуются от базового ApiController, который обеспечивает стандартизированное форматирование ответа Result<T>. Контроллеры должны быть тонкими — они только проверяют модель запроса и делегируют работу в SCRIPE mediator.",
    },
    frontend: {
      title: "Архитектура фронтенда",
      description:
        "Паттерн SOLID View/ViewModel, структура модулей и паттерн коннектора для интеграции с Next.js.",
      intro:
        "Фронтенд SCRIPE построен на Next.js 16 (App Router) с соблюдением строгого паттерна SOLID View/ViewModel. Каждая страница состоит из чистой UI-компоненты View, которая делегирует всю логику хукам ViewModel. Такое разделение обеспечивает тестируемость, переиспользуемость и поддерживаемость.",
      solidPatternTitle: "Паттерн SOLID View/ViewModel",
      solidPatternIntro:
        "Паттерн SOLID гарантирует, что каждая часть UI имеет единую зону ответственности. Views (Представления) рендерят JSX, ViewModels управляют состоянием и логикой, а Components предоставляют переиспользуемые секции UI.",
      viewRulesTitle: "Правила View (Представления)",
      viewDo: "Представление (View) ДОЛЖНО",
      viewDont: "Представление НЕ ДОЛЖНО",
      viewExampleTitle: "Пример View",
      viewModelRulesTitle: "Правила ViewModel",
      viewModelRulesIntro:
        "ViewModels — это React-хуки, содержащие всю бизнес-логику. Они компонуют специфичные для секций ViewModels (статистика, фильтры, таблица) и возвращают типизированные интерфейсы, потребляемые Views.",
      moduleStructureTitle: "Файловая структура модуля",
      connectorPatternTitle: "Паттерн коннектора (Connector)",
      connectorPatternIntro:
        "Паттерн коннектора отделяет страницы Next.js App Router (Server Components) от Views модулей (Client Components). Страницы в src/app/ — это тонкие коннекторы, которые импортируют и рендерят Views. Они обрабатывают только маршрутизацию, метаданные и параметры URL.",
      connectorWarning:
        "НИКОГДА не помещайте бизнес-логику, запросы данных, формы или управление состоянием в файлы src/app/. Это Server Components, которые только связывают маршруты с Views модуля.",
    },
    cqrs: {
      title: "Паттерн CQRS",
      description:
        "Разделение ответственности команд и запросов (CQRS) с пайплайном SCRIPE mediator, поведениями, валидацией и кэшированием.",
      intro:
        "SCRIPE использует паттерн CQRS для разделения операций чтения и записи. Команды (Commands) изменяют состояние и проходят через валидацию и аудит. Запросы (Queries) читают состояние и могут использовать кэширование. SCRIPE mediator выступает в качестве посредника между контроллерами и обработчиками.",
      whatIsCqrsTitle: "Что такое CQRS?",
      whatIsCqrsIntro:
        "CQRS разделяет ваше приложение на две части: Команды (запись) и Запросы (чтение). Каждая сторона может быть оптимизирована независимо: команды фокусируются на целостности данных и валидации, а запросы — на производительности и кэшировании.",
      commandSide: "Сторона команд (Запись)",
      querySide: "Сторона запросов (Чтение)",
      pipelineTitle: "Пайплайн SCRIPE mediator",
      validationBehaviorTitle: "Поведение валидации (Validation Behavior)",
      commandExampleTitle: "Пример команды",
      queryExampleTitle: "Пример запроса",
      cachingTip:
        "Запросы могут использовать серверное кэширование, чтобы избежать обращений к базе данных при каждом запросе. Ключ кэша должен включать все параметры запроса для обеспечения уникальности. Кэш автоматически инвалидируется при успешном выполнении связанных команд.",
    },
    modules: {
      title: "Система модулей",
      description:
        "Правила изоляции модулей, шаблоны бэкенда/фронтенда, реестр модулей и кросс-модульная коммуникация.",
      intro:
        "SCRIPE использует строгую систему модулей, где каждый модуль — это изолированный остров с четкими границами. Модули не могут импортировать друг друга — они общаются только через URL, общие ID или ядро шины событий (Event Bus). Это обеспечивает независимость, тестируемость и возможность вынесения модулей в отдельные репозитории.",
      isolationRulesTitle: "Правила изоляции модулей",
      allowedImportsTitle: "Разрешенные импорты",
      forbiddenImportsTitle: "Запрещенные импорты",
      backendModuleTitle: "Шаблон бэкенд-модуля",
      backendModuleIntro:
        "Каждый бэкенд-модуль следует подходу DDD (Domain-Driven Design) с тремя проектами: Domain, Application и Infrastructure. Domain — это чистый C# без внешних зависимостей.",
      frontendModuleTitle: "Шаблон фронтенд-модуля",
      registryTitle: "Реестр модулей",
      registryIntro:
        "The current backend modules verified in code are Identity, Entitlements, Compliance, Plugins, and Marketplace, plus host controller labels such as Auth, System, Communication, Media, and Customization. CRM, HRMS, Inventory, Finance, Documents, Workflow, and Service Management are future modules, not current backend modules.",
      communicationTitle: "Паттерны кросс-модульной коммуникации",
      pattern1Title: "Паттерн 1: URL-навигация",
      pattern1Content:
        "Переход на страницу другого модуля по стандартным URL-ссылкам. Импорты не нужны.",
      pattern2Title: "Паттерн 2: Только общие ID",
      pattern2Content:
        "Храните только ID сущности внешнего модуля. Никогда не встраивайте сущность целиком.",
      pattern3Title: "Паттерн 3: Core Event Bus",
      pattern3Content:
        "Domain events currently dispatch in-process. RabbitMQ is a placeholder fallback, so do not use this as proof of true distributed microservices.",
      boundaryWarning:
        "Границы модулей — абсолютный закон. Если вам нужно поделиться кодом между модулями, он ДОЛЖЕН быть размещен в @core/. Любой импорт из @modules/{other}/ является нарушением и будет отклонен при код-ревью.",
    },
    solidPattern: {
      title: "Паттерн SOLID View/ViewModel",
      description:
        "Сценарии типов страниц: CRUD-списки, дашборды, профили, настройки, мастера (wizards) и генераторы отчетов.",
      intro:
        "Паттерн SOLID View/ViewModel обязателен для всех страниц в src/modules/. В этом руководстве рассматриваются 7 сценариев типов страниц с их точной структурой каталогов, паттернами ViewModel и примерами кода.",
      principlesTitle: "Применение принципов SOLID",
      scenariosTitle: "Сценарии типов страниц",
      scenariosIntro:
        "Выберите сценарий, который соответствует вашему типу страницы. Каждый из них предлагает проверенную структуру, обеспечивающую согласованность во всем приложении.",
      scenario1Title: "Сценарий 1: Страница CRUD-списка",
      scenario1Intro:
        "Используется для управления коллекциями сущностей (пользователи, продукты, заказы). Оркестратор объединяет ViewModels статистики, фильтров и таблицы.",
      scenario2Title: "Сценарий 2: Дашборд / Аналитика",
      scenario2Intro:
        "Используется для KPI, графиков и метрик. Каждая секция диаграммы или карточки получает свою собственную ViewModel с выбором периода и преобразованием данных.",
      scenario3Title: "Сценарий 3: Страница деталей / Профиль",
      scenario3Intro:
        "Используется для просмотра одной сущности с вкладками и разделами. Оркестратор загружает основную сущность и компонует ViewModels вкладок.",
      scenario4Title: "Сценарий 4: Страница настроек",
      scenario4Intro:
        "Используется для нескольких разделов форм, сохраняемых независимо. Каждая секция настроек получает свою собственную ViewModel с состоянием формы и мутацией сохранения.",
      scenario5Title: "Сценарий 5: Мастер (Wizard) / Многошаговая форма",
      scenario5Intro:
        "Используется для сложных многошаговых процессов, таких как онбординг или оформление заказа. ViewModel мастера координирует навигацию по шагам, валидацию и совместную отправку данных.",
      rulesTitle: "Золотые правила",
      antiPatternWarning:
        "Анти-паттерн: размещение useState, useEffect или useQuery непосредственно в компоненте View. ВСЕ состояния и логика должны жить во ViewModels. Views предназначены только для чистой композиции UI.",
    },
    stateManagement: {
      title: "Управление состоянием (State Management)",
      description:
        "TanStack Query для серверного состояния, Zustand для глобального состояния UI и LanguageProvider для локализации.",
      intro:
        "SCRIPE использует три инструмента управления состоянием, каждый для определенной категории: TanStack Query для данных сервера (результаты API), Zustand для глобального состояния UI (авторизация, сайдбар, тема) и useState для локального состояния компонентов.",
      decisionTitle: "Матрица принятия решений",
      tanstackTitle: "TanStack Query (Состояние сервера)",
      tanstackIntro:
        "Используйте TanStack Query для любых данных, поступающих из API. Он автоматически обрабатывает кэширование, фоновое обновление, пагинацию, оптимистичные обновления и дедупликацию запросов.",
      zustandTitle: "Zustand (Глобальное состояние UI)",
      zustandIntro:
        "Используйте Zustand для глобального состояния UI, которое необходимо разделять между компонентами, но которое не поступает с сервера. Одобрено ровно 3 хранилища (stores).",
      antiPatternsTitle: "Анти-паттерны",
      doTitle: " ПРАВИЛЬНО",
      dontTitle: " НЕПРАВИЛЬНО",
      localizationTitle: "Локализация (LanguageProvider)",
      localizationIntro:
        "Для локализации используется кастомный LanguageProvider с сохранением в localStorage. Поддерживает 7 языков, автоматическое определение RTL/LTR и ключи перевода с точечной нотацией и интерполяцией.",
      noLocaleFoldersWarning:
        "НЕ используйте папки [locale] в src/app/! Локализация обрабатывается через контекст LanguageProvider, а не через маршрутизацию на основе файлов. Никакого next-intl, next-i18next или URL-зависимого языка (/en/, /ru/).",
    },
    dataFlow: {
      title: "Поток данных (Data Flow)",
      description:
        "Сквозные диаграммы потока данных: запрос, мутация, конвейер бэкенда, обработка ошибок и стратегия кэширования.",
      intro:
        "Понимание того, как данные проходят через SCRIPE, необходимо для отладки и расширения системы. На этой странице прослеживается путь данных от клика по кнопке в UI до базы данных и обратно.",
      queryFlowTitle: "Поток запроса (Чтение)",
      queryFlowIntro:
        "Когда пользователь просматривает данные (например, открывает страницу пользователей), поток начинается в View, проходит через ViewModel, TanStack Query, Repository, API Service и, наконец, API бэкенда.",
      mutationFlowTitle: "Поток мутации (Запись)",
      backendPipelineTitle: "Конвейер запросов бэкенда",
      backendPipelineIntro:
        "Каждый backend-запрос проходит через middleware и behaviors медиатора SCRIPE перед обработчиком. Это гарантирует согласованные аудит, аутентификацию, авторизацию, валидацию, feature-gating и Webhook-dispatch после успеха.",
      errorFlowTitle: "Обработка ошибок",
      errorFlowIntro:
        "Ошибки обрабатываются на нескольких уровнях. Каждый источник ошибки имеет конкретный обработчик, код ответа и стратегию обработки во фронтенде.",
      cachingFlowTitle: "Стратегия кэширования",
      cachingFlowIntro:
        "В бэкенде используется двухуровневая стратегия кэширования: L1 (in-process IMemoryCache) и L2 (распределенный Redis). Фронтенд использует встроенный кэш TanStack Query с настраиваемым параметром staleTime.",
      cacheTip:
        "Установите staleTime на 5 минут для данных, которые меняются редко (роли, права). Используйте 0 для данных, которые часто меняются (журналы аудита, уведомления). Всегда инвалидируйте связанные запросы после успешных мутаций.",
    },
    domainModel: {
      title: "Доменная модель (Domain Model)",
      description:
        "Иерархия наследования сущностей, AuditableEntity, ITenantAwareEntity, жизненный цикл мягкого удаления, абстракции репозиториев и глобальные фильтры запросов.",
      intro:
        "Доменная модель SCRIPE следует строгой иерархии наследования, где все бизнес-сущности наследуются от AuditableEntity (предоставляет поля аудита и поддержку мягкого удаления). Сущности, привязанные к тенантам, дополнительно реализуют ITenantAwareEntity для автоматической изоляции на уровне строк.",
      entityHierarchyTitle: "Иерархия наследования сущностей",
      entityHierarchyIntro:
        "Все сущности домена следуют трехуровневой цепи наследования: IEntity -> Entity<TId> -> AuditableEntity. Сущности, принадлежащие определенному тенанту, также реализуют интерфейс ITenantAwareEntity.",
      ientityTitle: "Интерфейс IEntity",
      entityBaseTitle: "Базовый класс Entity<TId>",
      entityBaseIntro:
        "Обеспечивает равенство идентичности, генерацию хэш-кода и поддержку событий домена.",
      entityDomainEventNote:
        "События домена, вызываемые через RaiseDomainEvent(), собираются перехватчиком OutboxInterceptor во время SaveChanges и сохраняются в той же транзакции.",
      auditableEntityTitle: "AuditableEntity (Аудируемая сущность)",
      auditableEntityIntro:
        "AuditableEntity добавляет к базовой Entity 7 полей аудита и мягкого удаления. Они автоматически заполняются перехватчиком AuditableEntityInterceptor; вы никогда не устанавливаете их вручную.",
      tenantAwareTitle: "ITenantAwareEntity",
      tenantAwareIntro:
        "Сущности, реализующие этот интерфейс, автоматически ограничиваются текущим тенантом с помощью глобальных фильтров запросов EF Core.",
      tenantIsolationWarning:
        "Никогда не обходите изоляцию тенантов без явной авторизации. Использование IgnoreQueryFilters() удаляет ВСЕ фильтры, включая ограничения тенанта.",
      softDeleteTitle: "Жизненный цикл мягкого удаления (Soft-Delete)",
      softDeleteIntro:
        "Все сущности используют мягкое удаление через флаг IsDeleted. При вызове эндпоинта DELETE запись не удаляется из БД, а скрывается от обычных запросов.",
      repositoryTitle: "Абстракции репозиториев",
      repositoryIntro:
        "Определены три интерфейса репозитория: IReadRepository<T> для запросов, IWriteRepository<T> для мутаций и IRepository<T>, объединяющий оба.",
      concreteEntitiesTitle: "Реестр конкретных сущностей",
      queryFiltersTitle: "Глобальные фильтры запросов",
      queryFiltersIntro:
        "Глобальные фильтры EF Core применяются ко всем сущностям, наследующим AuditableEntity или ITenantAwareEntity, автоматически добавляясь к каждому LINQ-запросу.",
      ignoreFiltersTip:
        "Используйте IgnoreQueryFilters() только в корзине (Recycle Bin) и межтенантных запросах SuperAdmin. Всегда сочетайте его с явным фильтром по тенанту.",
      bestPracticesTitle: "Лучшие практики",
      doTitle: "✅ ПРАВИЛЬНО",
      dontTitle: "❌ НЕПРАВИЛЬНО",
    },
    domainEvents: {
      title: "События домена (Domain Events)",
      description:
        "Интерфейс IDomainEvent, паттерн Outbox, OutboxInterceptor, OutboxProcessor и надежная доставка событий.",
      intro:
        "События домена представляют важные происшествия в бизнес-домене. SCRIPE использует паттерн Outbox для гарантии надежной доставки: события сохраняются в той же транзакции БД, что и изменения сущности, и публикуются асинхронно.",
      interfaceTitle: "Интерфейс IDomainEvent",
      interfaceIntro:
        "Все события домена реализуют этот интерфейс, наследующий INotification от SCRIPE mediator. Это обеспечивает Pub/Sub в рамках одного процесса.",
      publishingTitle: "Поток публикации и обработки",
      publishingIntro:
        "События следуют жизненному циклу из 6 шагов: вызов события, перехват через OutboxInterceptor, сохранение в таблицу OutboxMessage, опрос через OutboxProcessor и публикация.",
      publisherTitle: "IDomainEventPublisher",
      outboxTitle: "Паттерн Outbox",
      outboxIntro:
        "Паттерн Outbox решает проблему двойной записи (dual-write): как атомарно обновить базу данных И опубликовать событие.",
      outboxWarning:
        "Паттерн Outbox обеспечивает доставку «как минимум один раз» (at-least-once). Обработчики событий должны быть идемпотентными.",
      outboxMessageTitle: "Сущность OutboxMessage",
      outboxInterceptorTitle: "OutboxInterceptor",
      outboxInterceptorIntro:
        "Перехватчик EF Core SaveChanges, который собирает все события домена и сериализует их в записи OutboxMessage до фиксации транзакции.",
      outboxProcessorTitle: "OutboxProcessor",
      outboxProcessorIntro:
        "Фоновый сервис (BackgroundService), который каждые 5 секунд опрашивает таблицу OutboxMessage на наличие необработанных сообщений.",
      outboxCleanupTitle: "Задание очистки Outbox",
      outboxCleanupIntro:
        "Периодическое задание Hangfire ежедневно удаляет обработанные сообщения Outbox старше 7 дней.",
      architectureSummaryTitle: "Резюме архитектуры Outbox",
      customEventsTitle: "Создание пользовательских событий домена",
      customEventsIntro: "Выполните 3 шага, чтобы добавить новое событие домена в SCRIPE.",
      step1Title: "1. Определение события",
      step1Content:
        "Создайте запись (record), реализующую IDomainEvent, в директории Domain/Events/.",
      step2Title: "2. Вызов из обработчика команд",
      step2Content: "Вызовите entity.RaiseDomainEvent(), затем SaveChangesAsync.",
      step3Title: "3. Создание обработчиков",
      step3Content: "Реализуйте INotificationHandler<DomainEventNotification>.",
      reliabilityTitle: "Гарантии надежности",
      withOutboxTitle: "✅ С паттерном Outbox",
      withoutOutboxTitle: "❌ Без паттерна Outbox",
    },
    cqrsPipeline: {
      title: "Пайплайн CQRS",
      description:
        "Поведения конвейера медиатора SCRIPE: LoggingBehavior, ValidationBehavior, FeatureCheckBehavior, WebhookDispatchBehavior, CachingBehavior, паттерн Result и полный каталог команд/запросов.",
      intro:
        "Каждая команда и запрос в SCRIPE проходит через настраиваемый конвейер медиатора SCRIPE с 5 встроенными behaviors: LoggingBehavior, ValidationBehavior, FeatureCheckBehavior, WebhookDispatchBehavior и CachingBehavior. Порядок задается через appsettings или переменные окружения и проверяется при запуске.",
      overviewTitle: "Обзор пайплайна",
      overviewIntro:
        "Порядок по умолчанию: Logging -> Validation -> FeatureCheck -> WebhookDispatch -> Caching -> Handler. Валидация и проверки функций намеренно выполняются до чтения кэша, а инвалидация кэша завершается до отправки webhook после успешных мутаций.",
      separationTitle: "Разделение команд и запросов",
      separationIntro:
        "Команды (запись) изменяют состояние и проходят полную проверку; Запросы (чтение) оптимизированы для производительности.",
      commandsTitle: "Команды (Запись)",
      queriesTitle: "Запросы (Чтение)",
      resultPatternTitle: "Паттерн Result",
      resultPatternIntro:
        "Все обработчики возвращают Result<T> вместо выброса исключений для ожидаемых ошибок. Это устраняет блоки try-catch в контроллерах.",
      validationTitle: "ValidationBehavior",
      validationIntro:
        "ValidationBehavior выполняется сразу после логирования. Он собирает все валидаторы IValidator<TRequest>, возвращает структурированные ошибки Result для невалидных запросов и не допускает их до обработчиков или кэша.",
      validatorExampleTitle: "Примеры валидаторов",
      loggingTitle: "LoggingBehavior",
      loggingIntro:
        "Логирует каждый запрос SCRIPE mediator с ID пользователя, ID тенанта и временем выполнения.",
      cachingTitle: "CachingBehavior",
      cachingIntro:
        "Поведение CachingBehavior перехватывает запросы, реализующие интерфейс ICacheable, выполняя поиск в кэше с ограничением по тенанту. Для предотвращения одновременной лавины кэша (Cache Stampede) при высокой нагрузке оно использует блокировки SemaphoreSlim для конкретных ключей для сериализации чтения из базы данных при промахе. Оно также обрабатывает инвалидацию кэша мутаций через IInvalidatesCache, удаляя точные ключи или префиксные пространства имен. Кроме того, оно включает вытеснение ключей для ограничения роста и связывает конфигурации функций с глобальным источником токенов вытеснения для мгновенной очистки кэша в потокобезопасном режиме.",
      cachingStampedeTitle: "Параллелизм кэша и предотвращение Cache Stampede",
      cachingStampedeIntro:
        "Для предотвращения снижения производительности при высокой нагрузке система кэширования реализует предотвращение лавины кэша (Cache Stampede). Семафоры для конкретных ключей гарантируют, что если несколько параллельных запросов запрашивают отсутствующий или истекший ключ, только первый поток выполняет запрос к базе данных/API, в то время как последующие запросы ожидают семафора и получают кэшированное значение. Кроме того, неограниченный рост предотвращается путем отслеживания ключей кэша и случайного удаления 50% из них при превышении 10 000 отслеживаемых ключей. Записи кэша функций также привязаны к глобальному токену удаления для мгновенной очистки.",
      outboxTitle: "События домена и конвейер системы Outbox",
      outboxIntro:
        "Для гарантии транзакционной согласованности и предотвращения проблемы двойной записи SCRIPE использует паттерн Outbox. События домена создаются внутри Aggregate Roots, перехватываются EF Core SaveChangesInterceptor, сериализуются в JSON и сохраняются как сущности OutboxMessage в той же транзакции базы данных. Фоновая задача (OutboxProcessorJob) запускается каждую минуту для опроса необработанных сообщений и их публикации локально (через посредник AstraFlow) или внешне (через EventBus). Наконец, ежедневная задача OutboxCleanupJob запускается в 5:00 утра для удаления обработанных сообщений старше 7 дней.",
      flowStampedeTitle: "Последовательность блокировки лавины кэша",
      flowStampedeRequest: "Запрос клиента\nGetOrCreateAsync(key)",
      flowStampedeMiss: "Промах кэша?\nПроверка InMemory/Redis",
      flowStampedeLock: "Получение блокировки\nSemaphoreSlim(1,1)",
      flowStampedeCheck: "Двойная проверка\nВалидация внутри блокировки",
      flowStampedeFound: "Попадание в кэш\nЗначение заполнено другим потоком",
      flowStampedeFactory: "Выполнение фабрики\nЗапрос к БД / API",
      flowStampedeWrite: "Запись в кэш\nДобавление PostEvictionCallback",
      flowStampedeRelease: "Освобождение блокировки\nВозврат значения всем потокам",
      flowOutboxTitle: "Конвейер обработки сообщений Outbox",
      flowOutboxRaise: "Создание события\nAggregateRoot.AddDomainEvent()",
      flowOutboxIntercept: "Перехват SaveChanges\nOutboxInterceptor сканирует ChangeTracker",
      flowOutboxSerialize: "Сериализация события\nПреобразование в JSON и упаковка в OutboxMessage",
      flowOutboxCommit: "Атомарная транзакция\nСохранение сущностей + OutboxMessage",
      flowOutboxPoll: "OutboxProcessorJob\nОпрос необработанных каждую минуту",
      flowOutboxDispatch: "Публикация события\nЛокальный Mediator + Внешний EventBus",
      flowOutboxComplete: "Отметка об обработке\nУстановка ProcessedOnUtc = UtcNow",
      flowOutboxCleanup: "OutboxCleanupJob\nУдаление обработанных записей > 7 дней",
      connCacheQuery: "запрашивает ключ",
      connCacheMiss: "промах кэша",
      connAcquireLock: "получает блокировку",
      connDoubleCheck: "попадание в кэш",
      connCacheHit: "возвращает значение",
      connDbQuery: "выполняет запрос",
      connCacheWrite: "обновляет кэш",
      connLockRelease: "освобождает блокировку",
      connRaise: "запускает перехватчик",
      connIntercept: "сканирует события",
      connSerialize: "сериализует",
      connCommit: "фиксирует атомарно",
      connPoll: "опрашивает пачку из 50",
      connDispatch: "отправляет событие",
      connComplete: "сохраняет статус",
      connCleanup: "ежедневная очистка",
      commandMapTitle: "Каталог команд и запросов",
      commandMapIntro:
        "Полный список всех команд, запросов и валидаторов, зарегистрированных в системе.",
      registrationTitle: "Регистрация пайплайна",
      registrationIntro:
        "AddCoreApplication() регистрирует поведения конвейера из настроек Mediator. Сканирование handlers, проверка покрытия запросов, политика ошибок notifications и порядок конвейера управляются конфигурацией.",
      behaviorOrderTip:
        "Проверка безопасности по умолчанию запрещает порядок, при котором Caching выполняется раньше Validation или FeatureCheck. Отключайте Mediator__EnforceSecurityPipelineOrder только если полностью контролируете риск.",
      featureCheckTitle: "FeatureCheckBehavior",
      featureCheckIntro:
        "FeatureCheckBehavior перехватывает команды, реализующие IRequireFeature. Он проверяет, разрешает ли Редакция (Edition) тенанта запрошенную функциональность, вызывая IFeatureChecker.IsEnabledAsync. Если функция отключена, возвращается ошибка Forbidden без выполнения обработчика. Операции системного уровня (без TenantId) обходят эту проверку.",
      featureCheckMarkerTitle: "Маркер IRequireFeature",
      featureCheckMarkerIntro:
        "Команды подключают контроль функций, реализуя интерфейс IRequireFeature со свойством RequiredFeatureName. Когда модуль Entitlements не развернут, NoOpFeatureChecker возвращает true для всех проверок, превращая это поведение в прозрачный проход.",
    },
    dependencyInjection: {
      title: "Внедрение зависимостей (DI)",
      description:
        "Поток регистрации Program.cs, DI-паттерн модулей, Service Discovery, карты сервисов и шлюз YARP.",
      intro:
        "SCRIPE использует встроенный DI-контейнер .NET со структурированным паттерном регистрации.",
      architectureTitle: "Архитектура регистрации DI",
      architectureIntro:
        "Program.cs следует строгому 4-этапному порядку: (1) Основная инфраструктура. (2) CORS и Rate Limiting. (3) Модули. (4) Прикладной уровень (SCRIPE mediator).",
      moduleRegTitle: "Паттерн регистрации модулей",
      moduleRegIntro:
        "Каждый модуль предоставляет метод расширения AddXxxModule(), который регистрирует все его сервисы. Переменная MODULE_NAME управляет загрузкой модулей.",
      monolithNote:
        "В режиме монолита загружаются ВСЕ модули. В режиме микросервисов каждый модуль запускается как независимый процесс.",
      controllerProviderTitle: "Module Controller Feature Provider",
      controllerProviderIntro:
        "Фильтрует загружаемые API-контроллеры при запуске в зависимости от режима развертывания.",
      serviceDiscoveryTitle: "Обнаружение сервисов (Service Discovery)",
      serviceDiscoveryIntro:
        "SCRIPE использует обнаружение сервисов на основе конфигурации для разрешения имен в URL-адреса в режиме микросервисов.",
      coreServicesTitle: "Сервисы базовой инфраструктуры",
      coreServicesIntro: "Регистрируются методом AddCoreInfrastructure() и доступны всем модулям.",
      identityModuleTitle: "Сервисы модуля Identity",
      identityModuleIntro:
        "Модуль Identity регистрирует множество репозиториев и сервисов с временем жизни Scoped.",
      lifetimeTitle: "Правила времени жизни сервисов (Lifetimes)",
      singletonTitle: "Время жизни Singleton",
      scopedTitle: "Время жизни Scoped (на HTTP-запрос)",
      gatewayTitle: "Конфигурация YARP Gateway",
      gatewayIntro:
        "В режиме Gateway приложение действует как обратный прокси YARP, маршрутизирующий запросы к бэкенд-микросервисам.",
      bestPracticesTitle: "Лучшие практики DI",
      captiveTip:
        "Опасайтесь «плененных зависимостей» (Captive Dependencies), когда сервис Singleton инжектит сервис Scoped. Используйте IServiceScopeFactory.",
    },
    moduleCollab: {
      title: "Глубокое Погружение в Межмодульную Коллаборацию",
      description: "Реальный анализ межмодульной коммуникации в монолитной архитектуре SCRIPE.",
      intro:
        "Модули Identity и Entitlements не могут импортировать друг друга (циклическая зависимость). Они взаимодействуют через слой Core — общие абстракции, доменные события и пайплайн Mediator.",
      coreBridgeTitle: "Мост Слоя Core",
      coreBridgeIntro:
        "Вся межмодульная коллаборация проходит через Core.Application.Abstractions. Каждый модуль реализует интерфейсы, определённые в Core, и потребляет интерфейсы других модулей через внедрение зависимостей.",
      catalogTitle: "Полный Каталог Интерфейсов",
      catalogIntro:
        "Эти интерфейсы — полный контракт между модулями. Все определены в Core.Application.Abstractions, реализованы инфраструктурой модулей и зарегистрированы по умолчанию с NoOp в Core.Infrastructure.",
      noopTitle: "Паттерн Безопасности NoOp",
      noopIntro:
        "Каждый межмодульный интерфейс имеет реализацию NoOp в Core.Infrastructure. Когда модуль отсутствует, NoOp гарантирует корректную работу системы в деградированном режиме.",
      noopWarning:
        "NoOp — это страховочные сети, а не постоянные значения по умолчанию. В продакшне со всеми загруженными модулями ни один NoOp не должен быть активен.",
      noopRegistrationTitle: "Регистрация NoOp — TryAddScoped vs AddScoped",
      noopRegistrationIntro:
        "Механизм замены NoOp зависит от одного критического правила: Core.Infrastructure регистрирует NoOp с TryAddScoped. Реальные модули регистрируются с AddScoped.",
      startupDiagnosticsTitle: "Диагностика Запуска — Обнаружение NoOp",
      startupDiagnosticsIntro:
        "PostBuildInitialization.cs выполняется после построения DI-контейнера и проверяет критические интерфейсы на наличие активных NoOp реализаций.",
      featureCheckTitle: "FeatureCheckBehavior — Детальный Анализ",
      featureCheckIntro:
        "FeatureCheckBehavior — поведение пайплайна AstraFlow, перехватывающее все команды, реализующие IRequireFeature.",
      requireFeatureInterfaceTitle: "IRequireFeature — Интерфейс-Маркер Opt-In",
      requireFeatureInterfaceIntro:
        "IRequireFeature — интерфейс-маркер без накладных расходов. Команды, реализующие его, включают проверку функциональности через FeatureCheckBehavior.",
      subscriptionEventTitle: "SubscriptionChangedEvent",
      subscriptionEventIntro:
        "SubscriptionChangedEvent — наиболее критическое доменное событие в системе. Публикуется Entitlements при изменении подписки тенанта.",
      eventTriggersTitle: "Все Команды, Публикующие SubscriptionChangedEvent",
      eventTriggersIntro:
        "SubscriptionChangedEvent публикуется любой командой или сервисом Entitlements, изменяющим статус подписки тенанта.",
      permSyncTitle: "Жизненный Цикл Синхронизации Прав",
      permSyncIntro:
        "При обработке SubscriptionChangedEvent в Identity выполняется полная синхронизация прав для затронутого тенанта.",
      permSyncStep1Title: "Шаг 1: Разрешение Карты Функций",
      permSyncStep1Content:
        "Обработчик Entitlements разрешает полную карту эффективных функций: функции издания, объединённые с переопределениями тенанта.",
      permSyncStep2Title: "Шаг 2: Публикация Доменного События",
      permSyncStep2Content:
        "SubscriptionChangedEvent публикуется как доменное событие, перехватывается OutboxInterceptor и сохраняется в таблице OutboxMessages.",
      permSyncStep3Title: "Шаг 3: Обработчик Событий Identity",
      permSyncStep3Content:
        "SubscriptionChangedEventHandler Identity получает событие и делегирует ITenantPermissionManager для синхронизации прав.",
      permSyncStep4Title: "Шаг 4: Дифф и Применение Прав",
      permSyncStep4Content:
        "TenantPermissionManager читает ID прав по модулю, сравнивает с текущими правами тенанта и добавляет или удаляет по необходимости.",
      permSyncStep5Title: "Шаг 5: Инвалидация Кеша",
      permSyncStep5Content:
        "После синхронизации все кеши прав администраторов для этого тенанта инвалидируются. Следующий запрос перезагружает права из БД.",
      loginEnrichTitle: "Обогащение Ответа Входа",
      loginEnrichIntro:
        "LoginCommandHandler Identity обогащает JWT-ответ статусом подписки без прямого импорта Entitlements.",
      loginEnrichNote:
        "Если Entitlements не загружен, ISubscriptionStatusProvider возвращает null. JWT-токен всё равно выдаётся, но без данных подписки.",
      deployTopologyTitle: "Влияние Топологии Развёртывания",
      deployTopologyIntro:
        "Паттерн межмодульной коллаборации работает по-разному в режиме монолита и микросервисов.",
      monolithMode: "Режим Монолита",
      microserviceMode: "Режим Микросервиса",
      moduleNameEnvTitle: "Справочник Переменной MODULE_NAME",
      moduleNameEnvIntro:
        "Переменная окружения MODULE_NAME задаётся при запуске контейнера и определяет, какие модули загружаются в процесс.",
      microserviceCaution:
        "НИКОГДА не развёртывайте Identity и Entitlements в отдельных процессах без реализации шины сообщений для доменных событий.",
      coDependencyTitle: "Карта Взаимозависимостей Модулей",
      coDependencyIntro: "Эта таблица документирует каждую межмодульную зависимость в системе.",
      signupSagaTitle: "Сага Самостоятельной Регистрации",
      signupSagaIntro:
        "Самостоятельная регистрация — наиболее сложный пример межмодульной коллаборации.",
      signupMonolithOnly:
        "Самостоятельная регистрация поддерживается ТОЛЬКО в режиме монолита. В режиме микросервиса охранник G15 блокирует запуск.",
      signupStep1Title: "Фаза 1: Создание Тенанта (Identity)",
      signupStep1Content:
        "RegisterTenantSelfServiceCommand создаёт тенанта, администратора, роли и публикует SignupPhase1CompletedEvent в одной транзакции.",
      signupStep2Title: "Фаза 2: Привязка Подписки (Entitlements)",
      signupStep2Content:
        "SignupPhase1CompletedEventHandler создаёт подписку. Для бесплатных изданий — немедленная активация. Для платных — создание Stripe-сессии.",
      signupStep3Title: "Фаза 3: Подтверждение Оплаты (Stripe)",
      signupStep3Content:
        "Webhook Stripe обрабатывает подтверждение оплаты и активирует подписку, публикуя SubscriptionChangedEvent.",
      signupStep4Title: "Фаза 4: Компенсация (при отказе)",
      signupStep4Content:
        "Если Stripe-checkout отменён, CompensatePhase1Async удаляет тенанта и администратора для предотвращения осиротевших аккаунтов.",
      signupEventChainTitle: "Цепочка Событий Регистрации",
      signupEventChainIntro:
        "Сага регистрации пересекает границы модулей через три внутрипроцессных доменных события.",
      bundleExpansionTitle: "Расширение Бандла — Детальные Гранты Прав",
      bundleExpansionIntro:
        "Расширение бандла позволяет изданию предоставлять или запрещать конкретные коды прав помимо активации на уровне модуля.",
      bundleExpansionNote:
        "Расширения бандла обрабатываются ПОСЛЕ основной синхронизации прав модуля.",
      adminPermCacheTitle: "IAdminPermissionCache — Кеш Авторизации",
      adminPermCacheIntro:
        "IAdminPermissionCache — серверный Redis-кеш, используемый AuthorizationBehavior для проверки прав без обращения к БД на каждый запрос.",
      currentUserTitle: "ICurrentUser — Универсальный Сквозной Интерфейс",
      currentUserIntro:
        "ICurrentUser — единственный интерфейс, используемый всеми модулями напрямую. Заполняется JWT-мидлварой Identity при каждом аутентифицированном запросе.",
      currentUserNote:
        "ICurrentUser отличается от других межмодульных интерфейсов. Он не требует NoOp-фолбека — всегда реализован JWT-мидлварой Core.Infrastructure.",
      featureResolutionTitle: "Цепочка Разрешения Значений Функций",
      featureResolutionIntro:
        "При вызове IFeatureChecker.IsEnabledAsync() Entitlements разрешает значение через цепочку приоритетов.",
      devChecklistTitle: "Чеклист Разработчика",
      devChecklistIntro:
        "Выполняйте эти шаги каждый раз при добавлении новой межмодульной зависимости.",
      checkStep1Title: "Шаг 1: Определить Интерфейс в Core.Application",
      checkStep1Content:
        "Определите контракт в Core.Application.Abstractions. Никакой логики реализации, только определение интерфейса.",
      checkStep2Title: "Шаг 2: Зарегистрировать NoOp-фолбек",
      checkStep2Content:
        "Создайте NoOp реализацию в Core.Infrastructure и зарегистрируйте через TryAddScoped.",
      checkStep3Title: "Шаг 3: Реализовать в Модуле-Владельце",
      checkStep3Content:
        "Создайте реальную реализацию в модуле-владельце и зарегистрируйте через AddScoped (не TryAddScoped).",
      checkStep4Title: "Шаг 4: Добавить Диагностику Запуска",
      checkStep4Content:
        "Добавьте проверку в PostBuildInitialization.cs для обнаружения активного NoOp.",
      addScopedTip:
        "Всегда используйте AddScoped (без Try) в реальных модулях для гарантии замены NoOp из Core.Infrastructure.",
      archRulesTitle: "Правила Архитектуры — Сводка",
      archRulesIntro:
        "Эти обязательные правила применяются ко всей межмодульной коммуникации в SCRIPE.",
      doTitle: "Делать",
      dontTitle: "Никогда Не Делать",
      securityBoundaryTitle: "Обеспечение Границ Безопасности",
      securityBoundaryIntro:
        "Правила изоляции модулей — это не просто архитектурное предпочтение, это границы безопасности.",
      archCheckCaution:
        "Запускайте scripe arch-check перед каждым PR, затрагивающим межмодульный код.",
    },
  },
};

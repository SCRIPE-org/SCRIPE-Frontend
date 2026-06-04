export const ru = {
  architecture: {
    backend: {
      controllersTitle: "Контроллеры",
      controllerTip:
        "Все контроллеры наследуются от базового ApiController, который обеспечивает стандартизированное форматирование ответа Result<T>. Контроллеры должны быть тонкими — они только проверяют модель запроса и делегируют работу в AstraFlow mediator.",
      description:
        "Анатомия Program.cs, конвейер middleware, карта DI-сервисов, паттерн регистрации модулей и каталог контроллеров.",
      diMapIntro:
        "В следующей таблице показаны все основные интерфейсы сервисов, их реализации, время жизни (lifetimes) и места регистрации. Понимание этой карты необходимо для отладки и расширения системы.",
      diMapTitle: "Карта внедрения зависимостей (DI)",
      intro:
        "Бэкенд SCRIPE — это модульный монолит на .NET 10, содержащий 30 строк в Program.cs, которые делегируют конфигурацию запуска выделенным расширениям. Эта страница разбирает каждый уровень архитектуры бэкенда.",
      middlewarePipelineIntro:
        "Пайплайн промежуточного ПО обрабатывает каждый HTTP-запрос в строгом порядке. Каждое middleware может прервать конвейер (например, rate limiter возвращает 429, auth возвращает 401). Порядок важен — его изменение может нарушить безопасность.",
      middlewarePipelineTitle: "Конвейер Middleware",
      modulePatternIntro:
        "Каждый новый модуль следует одному и тому же паттерну регистрации DI. Метод расширения AddXxxModule() регистрирует DbContext модуля, репозитории, сервисы и маркер регистрации модуля.",
      modulePatternTitle: "Паттерн регистрации модулей",
      programCsIntro:
        "Program.cs — это точка входа в приложение и центр его сборки. Он определяет режим развертывания, регистрирует сервисы в определенном порядке и строит конвейер middleware. Файл имеет четкую структуру из 5 разделов.",
      programCsTitle: "Анатомия Program.cs",
      title: "Архитектура бэкенда",
    },
    cqrs: {
      cachingTip:
        "Запросы могут использовать серверное кэширование, чтобы избежать обращений к базе данных при каждом запросе. Ключ кэша должен включать все параметры запроса для обеспечения уникальности. Кэш автоматически инвалидируется при успешном выполнении связанных команд.",
      commandExampleTitle: "Пример команды",
      commandSide: "Сторона команд (Запись)",
      description:
        "Разделение ответственности команд и запросов (CQRS) с пайплайном AstraFlow mediator, поведениями, валидацией и кэшированием.",
      intro:
        "SCRIPE использует паттерн CQRS для разделения операций чтения и записи. Команды (Commands) изменяют состояние и проходят через валидацию и аудит. Запросы (Queries) читают состояние и могут использовать кэширование. AstraFlow mediator выступает в качестве посредника между контроллерами и обработчиками.",
      pipelineTitle: "Пайплайн AstraFlow mediator",
      queryExampleTitle: "Пример запроса",
      querySide: "Сторона запросов (Чтение)",
      title: "Паттерн CQRS",
      validationBehaviorTitle: "Поведение валидации (Validation Behavior)",
      whatIsCqrsIntro:
        "CQRS разделяет ваше приложение на две части: Команды (запись) и Запросы (чтение). Каждая сторона может быть оптимизирована независимо: команды фокусируются на целостности данных и валидации, а запросы — на производительности и кэшировании.",
      whatIsCqrsTitle: "Что такое CQRS?",
    },
    cqrsPipeline: {
      behaviorOrderTip:
        "Проверка безопасности по умолчанию запрещает порядок, при котором Caching выполняется раньше Validation или FeatureCheck. Отключайте Mediator__EnforceSecurityPipelineOrder только если полностью контролируете риск.",
      cachingIntro:
        "Перехватывает запросы (ICacheable), проверяет кэш на наличие результатов перед выполнением и сохраняет новый результат при промахе.",
      cachingTitle: "CachingBehavior",
      commandMapIntro:
        "Полный список всех команд, запросов и валидаторов, зарегистрированных в системе.",
      commandMapTitle: "Каталог команд и запросов",
      commandsTitle: "Команды (Запись)",
      description:
        "Поведения конвейера медиатора SCRIPE: LoggingBehavior, ValidationBehavior, FeatureCheckBehavior, WebhookDispatchBehavior, CachingBehavior, паттерн Result и полный каталог команд/запросов.",
      featureCheckIntro:
        "FeatureCheckBehavior перехватывает команды, реализующие IRequireFeature. Он проверяет, разрешает ли Редакция (Edition) тенанта запрошенную функциональность, вызывая IFeatureChecker.IsEnabledAsync. Если функция отключена, возвращается ошибка Forbidden без выполнения обработчика. Операции системного уровня (без TenantId) обходят эту проверку.",
      featureCheckMarkerIntro:
        "Команды подключают контроль функций, реализуя интерфейс IRequireFeature со свойством RequiredFeatureName. Когда модуль Entitlements не развернут, NoOpFeatureChecker возвращает true для всех проверок, превращая это поведение в прозрачный проход.",
      featureCheckMarkerTitle: "Маркер IRequireFeature",
      featureCheckTitle: "FeatureCheckBehavior",
      intro:
        "Каждая команда и запрос в SCRIPE проходит через настраиваемый конвейер медиатора SCRIPE с 5 встроенными behaviors: LoggingBehavior, ValidationBehavior, FeatureCheckBehavior, WebhookDispatchBehavior и CachingBehavior. Порядок задается через appsettings или переменные окружения и проверяется при запуске.",
      loggingIntro:
        "Логирует каждый запрос AstraFlow mediator с ID пользователя, ID тенанта и временем выполнения.",
      loggingTitle: "LoggingBehavior",
      overviewIntro:
        "Порядок по умолчанию: Logging -> Validation -> FeatureCheck -> WebhookDispatch -> Caching -> Handler. Валидация и проверки функций намеренно выполняются до чтения кэша, а инвалидация кэша завершается до отправки webhook после успешных мутаций.",
      overviewTitle: "Обзор пайплайна",
      queriesTitle: "Запросы (Чтение)",
      registrationIntro:
        "AddCoreApplication() регистрирует поведения конвейера из настроек Mediator. Сканирование handlers, проверка покрытия запросов, политика ошибок notifications и порядок конвейера управляются конфигурацией.",
      registrationTitle: "Регистрация пайплайна",
      resultPatternIntro:
        "Все обработчики возвращают Result<T> вместо выброса исключений для ожидаемых ошибок. Это устраняет блоки try-catch в контроллерах.",
      resultPatternTitle: "Паттерн Result",
      separationIntro:
        "Команды (запись) изменяют состояние и проходят полную проверку; Запросы (чтение) оптимизированы для производительности.",
      separationTitle: "Разделение команд и запросов",
      title: "Пайплайн CQRS",
      validationIntro:
        "ValidationBehavior выполняется сразу после логирования. Он собирает все валидаторы IValidator<TRequest>, возвращает структурированные ошибки Result для невалидных запросов и не допускает их до обработчиков или кэша.",
      validationTitle: "ValidationBehavior",
      validatorExampleTitle: "Примеры валидаторов",
    },
    dataFlow: {
      backendPipelineIntro:
        "Каждый backend-запрос проходит через middleware и behaviors медиатора SCRIPE перед обработчиком. Это гарантирует согласованные аудит, аутентификацию, авторизацию, валидацию, feature-gating и Webhook-dispatch после успеха.",
      backendPipelineTitle: "Конвейер запросов бэкенда",
      cacheTip:
        "Установите staleTime на 5 минут для данных, которые меняются редко (роли, права). Используйте 0 для данных, которые часто меняются (журналы аудита, уведомления). Всегда инвалидируйте связанные запросы после успешных мутаций.",
      cachingFlowIntro:
        "В бэкенде используется двухуровневая стратегия кэширования: L1 (in-process IMemoryCache) и L2 (распределенный Redis). Фронтенд использует встроенный кэш TanStack Query с настраиваемым параметром staleTime.",
      cachingFlowTitle: "Стратегия кэширования",
      description:
        "Сквозные диаграммы потока данных: запрос, мутация, конвейер бэкенда, обработка ошибок и стратегия кэширования.",
      errorFlowIntro:
        "Ошибки обрабатываются на нескольких уровнях. Каждый источник ошибки имеет конкретный обработчик, код ответа и стратегию обработки во фронтенде.",
      errorFlowTitle: "Обработка ошибок",
      intro:
        "Понимание того, как данные проходят через SCRIPE, необходимо для отладки и расширения системы. На этой странице прослеживается путь данных от клика по кнопке в UI до базы данных и обратно.",
      mutationFlowTitle: "Поток мутации (Запись)",
      queryFlowIntro:
        "Когда пользователь просматривает данные (например, открывает страницу пользователей), поток начинается в View, проходит через ViewModel, TanStack Query, Repository, API Service и, наконец, API бэкенда.",
      queryFlowTitle: "Поток запроса (Чтение)",
      title: "Поток данных (Data Flow)",
    },
    dependencyInjection: {
      architectureIntro:
        "Program.cs следует строгому 4-этапному порядку: (1) Основная инфраструктура. (2) CORS и Rate Limiting. (3) Модули. (4) Прикладной уровень (AstraFlow mediator).",
      architectureTitle: "Архитектура регистрации DI",
      bestPracticesTitle: "Лучшие практики DI",
      captiveTip:
        "Опасайтесь «плененных зависимостей» (Captive Dependencies), когда сервис Singleton инжектит сервис Scoped. Используйте IServiceScopeFactory.",
      controllerProviderIntro:
        "Фильтрует загружаемые API-контроллеры при запуске в зависимости от режима развертывания.",
      controllerProviderTitle: "Module Controller Feature Provider",
      coreServicesIntro: "Регистрируются методом AddCoreInfrastructure() и доступны всем модулям.",
      coreServicesTitle: "Сервисы базовой инфраструктуры",
      description:
        "Поток регистрации Program.cs, DI-паттерн модулей, Service Discovery, карты сервисов и шлюз YARP.",
      gatewayIntro:
        "В режиме Gateway приложение действует как обратный прокси YARP, маршрутизирующий запросы к бэкенд-микросервисам.",
      gatewayTitle: "Конфигурация YARP Gateway",
      identityModuleIntro:
        "Модуль Identity регистрирует множество репозиториев и сервисов с временем жизни Scoped.",
      identityModuleTitle: "Сервисы модуля Identity",
      intro:
        "SCRIPE использует встроенный DI-контейнер .NET со структурированным паттерном регистрации.",
      lifetimeTitle: "Правила времени жизни сервисов (Lifetimes)",
      moduleRegIntro:
        "Каждый модуль предоставляет метод расширения AddXxxModule(), который регистрирует все его сервисы. Переменная MODULE_NAME управляет загрузкой модулей.",
      moduleRegTitle: "Паттерн регистрации модулей",
      monolithNote:
        "В режиме монолита загружаются ВСЕ модули. В режиме микросервисов каждый модуль запускается как независимый процесс.",
      scopedTitle: "Время жизни Scoped (на HTTP-запрос)",
      serviceDiscoveryIntro:
        "SCRIPE использует обнаружение сервисов на основе конфигурации для разрешения имен в URL-адреса в режиме микросервисов.",
      serviceDiscoveryTitle: "Обнаружение сервисов (Service Discovery)",
      singletonTitle: "Время жизни Singleton",
      title: "Внедрение зависимостей (DI)",
    },
    domainEvents: {
      architectureSummaryTitle: "Резюме архитектуры Outbox",
      customEventsIntro: "Выполните 3 шага, чтобы добавить новое событие домена в SCRIPE.",
      customEventsTitle: "Создание пользовательских событий домена",
      description:
        "Интерфейс IDomainEvent, паттерн Outbox, OutboxInterceptor, OutboxProcessor и надежная доставка событий.",
      interfaceIntro:
        "Все события домена реализуют этот интерфейс, наследующий INotification от AstraFlow mediator. Это обеспечивает Pub/Sub в рамках одного процесса.",
      interfaceTitle: "Интерфейс IDomainEvent",
      intro:
        "События домена представляют важные происшествия в бизнес-домене. SCRIPE использует паттерн Outbox для гарантии надежной доставки: события сохраняются в той же транзакции БД, что и изменения сущности, и публикуются асинхронно.",
      outboxCleanupIntro:
        "Периодическое задание Hangfire ежедневно удаляет обработанные сообщения Outbox старше 7 дней.",
      outboxCleanupTitle: "Задание очистки Outbox",
      outboxInterceptorIntro:
        "Перехватчик EF Core SaveChanges, который собирает все события домена и сериализует их в записи OutboxMessage до фиксации транзакции.",
      outboxInterceptorTitle: "OutboxInterceptor",
      outboxIntro:
        "Паттерн Outbox решает проблему двойной записи (dual-write): как атомарно обновить базу данных И опубликовать событие.",
      outboxMessageTitle: "Сущность OutboxMessage",
      outboxProcessorIntro:
        "Фоновый сервис (BackgroundService), который каждые 5 секунд опрашивает таблицу OutboxMessage на наличие необработанных сообщений.",
      outboxProcessorTitle: "OutboxProcessor",
      outboxTitle: "Паттерн Outbox",
      outboxWarning:
        "Паттерн Outbox обеспечивает доставку «как минимум один раз» (at-least-once). Обработчики событий должны быть идемпотентными.",
      publisherTitle: "IDomainEventPublisher",
      publishingIntro:
        "События следуют жизненному циклу из 6 шагов: вызов события, перехват через OutboxInterceptor, сохранение в таблицу OutboxMessage, опрос через OutboxProcessor и публикация.",
      publishingTitle: "Поток публикации и обработки",
      reliabilityTitle: "Гарантии надежности",
      step1Content:
        "Создайте запись (record), реализующую IDomainEvent, в директории Domain/Events/.",
      step1Title: "1. Определение события",
      step2Content: "Вызовите entity.RaiseDomainEvent(), затем SaveChangesAsync.",
      step2Title: "2. Вызов из обработчика команд",
      step3Content: "Реализуйте INotificationHandler<DomainEventNotification>.",
      step3Title: "3. Создание обработчиков",
      title: "События домена (Domain Events)",
      withOutboxTitle: "✅ С паттерном Outbox",
      withoutOutboxTitle: "❌ Без паттерна Outbox",
    },
    domainModel: {
      auditableEntityIntro:
        "AuditableEntity добавляет к базовой Entity 7 полей аудита и мягкого удаления. Они автоматически заполняются перехватчиком AuditableEntityInterceptor; вы никогда не устанавливаете их вручную.",
      auditableEntityTitle: "AuditableEntity (Аудируемая сущность)",
      bestPracticesTitle: "Лучшие практики",
      concreteEntitiesTitle: "Реестр конкретных сущностей",
      description:
        "Иерархия наследования сущностей, AuditableEntity, ITenantAwareEntity, жизненный цикл мягкого удаления, абстракции репозиториев и глобальные фильтры запросов.",
      dontTitle: "❌ НЕПРАВИЛЬНО",
      doTitle: "✅ ПРАВИЛЬНО",
      entityBaseIntro:
        "Обеспечивает равенство идентичности, генерацию хэш-кода и поддержку событий домена.",
      entityBaseTitle: "Базовый класс Entity<TId>",
      entityDomainEventNote:
        "События домена, вызываемые через RaiseDomainEvent(), собираются перехватчиком OutboxInterceptor во время SaveChanges и сохраняются в той же транзакции.",
      entityHierarchyIntro:
        "Все сущности домена следуют трехуровневой цепи наследования: IEntity -> Entity<TId> -> AuditableEntity. Сущности, принадлежащие определенному тенанту, также реализуют интерфейс ITenantAwareEntity.",
      entityHierarchyTitle: "Иерархия наследования сущностей",
      ientityTitle: "Интерфейс IEntity",
      ignoreFiltersTip:
        "Используйте IgnoreQueryFilters() только в корзине (Recycle Bin) и межтенантных запросах SuperAdmin. Всегда сочетайте его с явным фильтром по тенанту.",
      intro:
        "Доменная модель SCRIPE следует строгой иерархии наследования, где все бизнес-сущности наследуются от AuditableEntity (предоставляет поля аудита и поддержку мягкого удаления). Сущности, привязанные к тенантам, дополнительно реализуют ITenantAwareEntity для автоматической изоляции на уровне строк.",
      queryFiltersIntro:
        "Глобальные фильтры EF Core применяются ко всем сущностям, наследующим AuditableEntity или ITenantAwareEntity, автоматически добавляясь к каждому LINQ-запросу.",
      queryFiltersTitle: "Глобальные фильтры запросов",
      repositoryIntro:
        "Определены три интерфейса репозитория: IReadRepository<T> для запросов, IWriteRepository<T> для мутаций и IRepository<T>, объединяющий оба.",
      repositoryTitle: "Абстракции репозиториев",
      softDeleteIntro:
        "Все сущности используют мягкое удаление через флаг IsDeleted. При вызове эндпоинта DELETE запись не удаляется из БД, а скрывается от обычных запросов.",
      softDeleteTitle: "Жизненный цикл мягкого удаления (Soft-Delete)",
      tenantAwareIntro:
        "Сущности, реализующие этот интерфейс, автоматически ограничиваются текущим тенантом с помощью глобальных фильтров запросов EF Core.",
      tenantAwareTitle: "ITenantAwareEntity",
      tenantIsolationWarning:
        "Никогда не обходите изоляцию тенантов без явной авторизации. Использование IgnoreQueryFilters() удаляет ВСЕ фильтры, включая ограничения тенанта.",
      title: "Доменная модель (Domain Model)",
    },
    frontend: {
      connectorPatternIntro:
        "Паттерн коннектора отделяет страницы Next.js App Router (Server Components) от Views модулей (Client Components). Страницы в src/app/ — это тонкие коннекторы, которые импортируют и рендерят Views. Они обрабатывают только маршрутизацию, метаданные и параметры URL.",
      connectorPatternTitle: "Паттерн коннектора (Connector)",
      connectorWarning:
        "НИКОГДА не помещайте бизнес-логику, запросы данных, формы или управление состоянием в файлы src/app/. Это Server Components, которые только связывают маршруты с Views модуля.",
      description:
        "Паттерн SOLID View/ViewModel, структура модулей и паттерн коннектора для интеграции с Next.js.",
      intro:
        "Фронтенд SCRIPE построен на Next.js 16 (App Router) с соблюдением строгого паттерна SOLID View/ViewModel. Каждая страница состоит из чистой UI-компоненты View, которая делегирует всю логику хукам ViewModel. Такое разделение обеспечивает тестируемость, переиспользуемость и поддерживаемость.",
      moduleStructureTitle: "Файловая структура модуля",
      solidPatternIntro:
        "Паттерн SOLID гарантирует, что каждая часть UI имеет единую зону ответственности. Views (Представления) рендерят JSX, ViewModels управляют состоянием и логикой, а Components предоставляют переиспользуемые секции UI.",
      solidPatternTitle: "Паттерн SOLID View/ViewModel",
      title: "Архитектура фронтенда",
      viewDo: "Представление (View) ДОЛЖНО",
      viewDont: "Представление НЕ ДОЛЖНО",
      viewExampleTitle: "Пример View",
      viewModelRulesIntro:
        "ViewModels — это React-хуки, содержащие всю бизнес-логику. Они компонуют специфичные для секций ViewModels (статистика, фильтры, таблица) и возвращают типизированные интерфейсы, потребляемые Views.",
      viewModelRulesTitle: "Правила ViewModel",
      viewRulesTitle: "Правила View (Представления)",
    },
    modules: {
      allowedImportsTitle: "Разрешенные импорты",
      backendModuleIntro:
        "Каждый бэкенд-модуль следует подходу DDD (Domain-Driven Design) с тремя проектами: Domain, Application и Infrastructure. Domain — это чистый C# без внешних зависимостей.",
      backendModuleTitle: "Шаблон бэкенд-модуля",
      boundaryWarning:
        "Границы модулей — абсолютный закон. Если вам нужно поделиться кодом между модулями, он ДОЛЖЕН быть размещен в @core/. Любой импорт из @modules/{other}/ является нарушением и будет отклонен при код-ревью.",
      communicationTitle: "Паттерны кросс-модульной коммуникации",
      description:
        "Правила изоляции модулей, шаблоны бэкенда/фронтенда, реестр модулей и кросс-модульная коммуникация.",
      forbiddenImportsTitle: "Запрещенные импорты",
      frontendModuleTitle: "Шаблон фронтенд-модуля",
      intro:
        "SCRIPE использует строгую систему модулей, где каждый модуль — это изолированный остров с четкими границами. Модули не могут импортировать друг друга — они общаются только через URL, общие ID или ядро шины событий (Event Bus). Это обеспечивает независимость, тестируемость и возможность вынесения модулей в отдельные репозитории.",
      isolationRulesTitle: "Правила изоляции модулей",
      pattern1Content:
        "Переход на страницу другого модуля по стандартным URL-ссылкам. Импорты не нужны.",
      pattern1Title: "Паттерн 1: URL-навигация",
      pattern2Content:
        "Храните только ID сущности внешнего модуля. Никогда не встраивайте сущность целиком.",
      pattern2Title: "Паттерн 2: Только общие ID",
      pattern3Content:
        "Публикация и подписка на события через общую шину событий в @core/. Будущий паттерн — еще не реализован.",
      pattern3Title: "Паттерн 3: Core Event Bus",
      registryIntro:
        "Реестр модулей отслеживает все активные модули во время выполнения. Он заполняется при запуске приложения, когда разрешается и регистрируется реализация IModuleRegistration каждого модуля.",
      registryTitle: "Реестр модулей",
      title: "Система модулей",
    },
    overview: {
      backendArchIntro:
        "Бэкенд следует архитектуре конвейера запросов (pipeline), где каждый HTTP-запрос проходит через middleware, контроллеры, поведения (behaviors) AstraFlow mediator и, наконец, обработчик CQRS. Это обеспечивает согласованную валидацию, аудит и обработку ошибок.",
      backendArchTitle: "Архитектура бэкенда",
      communicationPatternsTitle: "Кросс-модульная коммуникация",
      crossModuleNote:
        "Паттерн Event Bus (шина событий) запланирован для будущих релизов. В настоящее время модули общаются исключительно через навигацию по URL и общие ID.",
      description:
        "Слои Clean Architecture, backend-конвейер, frontend SOLID-поток и правила границ модулей.",
      frontendArchIntro:
        "Во фронтенде используется паттерн SOLID View/ViewModel, где Views (представления) — это чистый UI (без состояния и логики), а ViewModels содержат всю бизнес-логику. Паттерн коннектора отделяет маршрутизацию Next.js (Server Components) от логики приложения (Client Components).",
      frontendArchTitle: "Архитектура фронтенда",
      intro:
        "SCRIPE следует строгой Clean Architecture с четырьмя слоями: Presentation, Application, Domain и Infrastructure. Правило зависимостей гарантирует, что внутренние слои не зависят от внешних. Этот подход применяется и в backend, и во frontend.",
      layersTitle: "Слои чистой архитектуры",
      moduleBoundariesIntro:
        "Модули — это изолированные острова. Они не могут импортировать друг друга. Это позволяет осуществлять независимую разработку, изолировать сбои и извлекать модули в отдельные репозитории.",
      moduleBoundariesTitle: "Границы модулей",
      title: "Обзор архитектуры",
      withBoundaries: "С границами модулей",
      withoutBoundaries: "Без границ модулей",
    },
    solidPattern: {
      antiPatternWarning:
        "Анти-паттерн: размещение useState, useEffect или useQuery непосредственно в компоненте View. ВСЕ состояния и логика должны жить во ViewModels. Views предназначены только для чистой композиции UI.",
      description:
        "Сценарии типов страниц: CRUD-списки, дашборды, профили, настройки, мастера (wizards) и генераторы отчетов.",
      intro:
        "Паттерн SOLID View/ViewModel обязателен для всех страниц в src/modules/. В этом руководстве рассматриваются 7 сценариев типов страниц с их точной структурой каталогов, паттернами ViewModel и примерами кода.",
      principlesTitle: "Применение принципов SOLID",
      rulesTitle: "Золотые правила",
      scenario1Intro:
        "Используется для управления коллекциями сущностей (пользователи, продукты, заказы). Оркестратор объединяет ViewModels статистики, фильтров и таблицы.",
      scenario1Title: "Сценарий 1: Страница CRUD-списка",
      scenario2Intro:
        "Используется для KPI, графиков и метрик. Каждая секция диаграммы или карточки получает свою собственную ViewModel с выбором периода и преобразованием данных.",
      scenario2Title: "Сценарий 2: Дашборд / Аналитика",
      scenario3Intro:
        "Используется для просмотра одной сущности с вкладками и разделами. Оркестратор загружает основную сущность и компонует ViewModels вкладок.",
      scenario3Title: "Сценарий 3: Страница деталей / Профиль",
      scenario4Intro:
        "Используется для нескольких разделов форм, сохраняемых независимо. Каждая секция настроек получает свою собственную ViewModel с состоянием формы и мутацией сохранения.",
      scenario4Title: "Сценарий 4: Страница настроек",
      scenario5Intro:
        "Используется для сложных многошаговых процессов, таких как онбординг или оформление заказа. ViewModel мастера координирует навигацию по шагам, валидацию и совместную отправку данных.",
      scenario5Title: "Сценарий 5: Мастер (Wizard) / Многошаговая форма",
      scenariosIntro:
        "Выберите сценарий, который соответствует вашему типу страницы. Каждый из них предлагает проверенную структуру, обеспечивающую согласованность во всем приложении.",
      scenariosTitle: "Сценарии типов страниц",
      title: "Паттерн SOLID View/ViewModel",
    },
    stateManagement: {
      antiPatternsTitle: "Анти-паттерны",
      decisionTitle: "Матрица принятия решений",
      description:
        "TanStack Query для серверного состояния, Zustand для глобального состояния UI и LanguageProvider для локализации.",
      dontTitle: " НЕПРАВИЛЬНО",
      doTitle: " ПРАВИЛЬНО",
      intro:
        "SCRIPE использует три инструмента управления состоянием, каждый для определенной категории: TanStack Query для данных сервера (результаты API), Zustand для глобального состояния UI (авторизация, сайдбар, тема) и useState для локального состояния компонентов.",
      localizationIntro:
        "Локализация использует кастомный LanguageProvider с сохранением в localStorage и локальную систему на уровне модулей. Общие ключи (~1,156) находятся в core/locales/. Ключи конкретных модулей размещены в их каталогах locales/ и заблаговременно импортируются при сборке через module-registry.ts для загрузки страниц без мерцания.",
      localizationTitle: "Локализация (LanguageProvider)",
      noLocaleFoldersWarning:
        "НЕ используйте папки [locale] в src/app/! Локализация обрабатывается через контекст LanguageProvider, а не через маршрутизацию на основе файлов. Никакого next-intl, next-i18next или URL-зависимого языка (/en/, /ru/).",
      tanstackIntro:
        "Используйте TanStack Query для любых данных, поступающих из API. Он автоматически обрабатывает кэширование, фоновое обновление, пагинацию, оптимистичные обновления и дедупликацию запросов.",
      tanstackTitle: "TanStack Query (Состояние сервера)",
      title: "Управление состоянием (State Management)",
      zustandIntro:
        "Используйте Zustand для глобального состояния UI, которое необходимо разделять между компонентами, но которое не поступает с сервера. Одобрено ровно 3 хранилища (stores).",
      zustandTitle: "Zustand (Глобальное состояние UI)",
    },
  },
};

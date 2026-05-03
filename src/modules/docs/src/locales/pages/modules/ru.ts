/**
 * Docs page locale — RU
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const ru = {
  modules: {
    entitlementsOverview: {
      title: "Обзор прав доступа",
      description:
        "Управление доступом к функциям на основе редакций с помощью функций, редакций, подписок и переопределений для каждого тэнанта.",
      intro:
        "Модуль прав доступа (Entitlements) — это механизм управления планами и функциями в NEXORA. Он определяет, какие возможности получает каждый тэнант, как планы (редакции) группируют эти возможности и как подписки связывают тэнантов с планами.",
      whatIsTitle: "Что такое права доступа?",
      whatIsIntro:
        "Права доступа — это модуль, отвечающий за контроль того, к каким функциям тэнант может получить доступ на основе его подписки на редакцию (план). Он обеспечивает трехуровневую цепочку разрешения: Значения функций по умолчанию → Значения редакции → Переопределения для конкретного тэнанта, обеспечивая максимальную гибкость как для операторов платформы, так и для тэнантов-реселлеров.",
      architectureTitle: "Архитектура",
      architectureIntro:
        "Система прав доступа состоит из четырех взаимосвязанных доменов, которые работают вместе, чтобы обеспечить комплексное решение для контроля доступа к функциям (feature-gating).",
      domainsTitle: "Четыре домена",
      domainsIntro: "Каждый домен управляет определенным аспектом жизненного цикла прав доступа:",
      resolutionTitle: "Цепочка разрешения значений функций",
      resolutionIntro:
        "Когда системе нужно определить значение функции для тэнанта, она следует строгой цепочке приоритетов. Побеждает источник с наивысшим приоритетом, предоставляющий значение.",
      pipelineTitle: "Интеграция с пайплайном",
      pipelineIntro:
        "NEXORA интегрирует права доступа непосредственно в CQRS-пайплайн MediatR через FeatureCheckBehavior. Команды и запросы, реализующие IRequireFeature, автоматически проверяются — если разрешенное значение функции для тэнанта отключено, запрос отклоняется до того, как достигнет обработчика.",
      pipelineTip:
        "Чтобы скрыть команду за функцией, просто реализуйте IRequireFeature и установите RequiredFeatureName равным стабильному системному ключу функции (например, 'Chat.Enabled'). Дополнительный код не требуется.",
      backendTitle: "Структура бэкенда",
      backendIntro:
        "Бэкенд прав доступа следует стандартной структуре модулей Clean Architecture NEXORA со слоями Domain, Application и Infrastructure.",
      frontendTitle: "Структура фронтенда",
      frontendIntro:
        "Фронтенд зеркально отражает бэкенд с четырьмя подмодулями (редакции, функции, подписки, переопределения), каждый из которых следует паттерну SOLID View/ViewModel.",
      controllersTitle: "API Контроллеры",
      controllersIntro:
        "Модуль прав доступа предоставляет 31 API-эндпоинт в 4 контроллерах, все они аутентифицируются с помощью JWT и защищены авторизацией на основе разрешений.",
      noOpTitle: "NoOp Фолбэк",
      noOpIntro:
        "Когда модуль прав доступа не загружен (например, в микросервисе, который не включает Entitlements), NEXORA регистрирует NoOpFeatureCache. Это позволяет командам IRequireFeature проходить без ошибок — все функции по умолчанию считаются включенными.",
      noOpNote:
        "NoOp фолбэк гарантирует, что модули могут использовать IRequireFeature без жесткой зависимости от модуля прав доступа. В рабочем режиме монолита всегда доступен настоящий FeatureCache.",
      contextAwareTitle: "Контекстно-зависимая фильтрация области",
      contextAwareIntro:
        "Все страницы прав доступа (Функции, Редакции, Разрешения) являются контекстно-зависимыми. Фронтенд определяет, является ли пользователь системным администратором (tenantId равен null), администратором тэнанта или находится в режиме drill-down, и вызывает соответствующие бэкенд-эндпоинты. Системные администраторы видят полный каталог с CRUD; администраторы тэнантов видят только свои эффективные данные в режиме только для чтения.",
      resolutionTip:
        "Цепочка разрешения вычисляется лениво (lazy) — значения кэшируются после первого разрешения и инвалидируются при изменении подписок, редакций или переопределений.",
      cqrsMapTitle: "Карта команд и запросов CQRS",
      cqrsMapIntro:
        "Модуль прав доступа регистрирует 31 обработчик MediatR, охватывающий четыре домена. Каждая команда имеет соответствующий валидатор FluentValidation для проверки ввода.",
      diTitle: "Регистрация внедрения зависимостей (DI)",
      diIntro:
        "Все сервисы прав доступа регистрируются через метод расширения AddEntitlementsModule в DependencyInjection.cs. Модуль следует стандартному паттерну регистрации NEXORA.",
      comparisonTitle: "С правами доступа и без них",
      comparisonIntro:
        "В следующей таблице показана разница в возможностях при включенном модуле прав доступа по сравнению с работой без него:",
      gettingStartedTitle: "С чего начать",
      gettingStartedIntro:
        "Выполните эти 5 шагов, чтобы настроить систему прав доступа для вашей платформы. Каждый шаг основывается на предыдущем:",
    },
    editions: {
      title: "Редакции",
      description:
        "Именованные планы подписки с пакетами функций, политиками переполнения (overflow policies), версионированием и стратегиями развертывания.",
      intro:
        "Редакции — это именованные планы (например, Basic, Pro, Enterprise), которые объединяют значения функций. Каждый тэнант подписывается на редакцию, которая определяет его доступ к функциям. Редакции поддерживают версионирование с контролируемыми стратегиями развертывания для безопасного внедрения изменений.",
      entityTitle: "Сущность 'Редакция'",
      entityIntro:
        "Редакция — это именованный план, объединяющий значения функций. Системные редакции создаются администраторами платформы; розничные (retail) редакции создаются тэнантами-реселлерами для своих дочерних тэнантов.",
      overflowTitle: "Политика переполнения",
      overflowIntro:
        "Когда тэнант переходит на редакцию с более низкими лимитами (даунгрейд), его существующие ресурсы могут превысить новые лимиты. Политика переполнения определяет, что произойдет:",
      featuresTitle: "Функции редакции",
      featuresIntro:
        "Каждая редакция содержит набор записей EditionFeature, которые сопоставляют функции с их значениями в рамках этого плана. Функции, явно не заданные в редакции, возвращаются к значению Feature.DefaultValue.",
      versionsTitle: "Версии редакции",
      versionsIntro:
        "Версии редакции обеспечивают систему версионирования и развертывания для изменения функций. Вместо того чтобы изменять функции напрямую, администраторы могут создать новую версию (снапшот), выбрать стратегию развертывания и опубликовать ее.",
      rolloutTitle: "Стратегии развертывания",
      rolloutIntro:
        "При публикации версии редакции администраторы выбирают, как изменения будут развернуты для подписанных тэнантов:",
      workflowTitle: "Применить сейчас vs Сохранить как версию",
      workflowIntro:
        "NEXORA предоставляет два способа обновления функций редакции, каждый из которых подходит для различных сценариев:",
      workflowTip:
        "Используйте 'Применить сейчас' для срочных исправлений и небольших изменений. Используйте 'Сохранить как версию' для крупных обновлений плана, требующих поэтапного развертывания и журнала аудита.",
      endpointsTitle: "API Эндпоинты",
      endpointsIntro:
        "Контроллер Editions предоставляет 11 эндпоинтов для управления редакциями, их функциями и жизненным циклом версий:",
      drillDownTitle: "Поведение при Drill-Down",
      drillDownIntro:
        "Когда системный администратор спускается в тэнант (drill-down), список редакций автоматически ограничивается редакциями, видимыми для этого тэнанта. Бэкенд использует заголовок X-Tenant-Context для фильтрации: системные редакции + розничные редакции, созданные выбранным тэнантом. Фронтенд скрывает CRUD-действия в режиме drill-down.",
      scopingTitle: "Системные vs Розничные редакции",
      scopingIntro:
        "NEXORA поддерживает два типа редакций: системные редакции, созданные администраторами платформы и видимые всем тэнантам, и розничные редакции, созданные тэнантами-реселлерами только для своих дочерних тэнантов.",
      scopingNote:
        "Администраторы тэнантов видят только системные редакции плюс свои собственные розничные редакции. Это обеспечивает изоляцию редакций между тэнантами-реселлерами.",
      featuresTip:
        "Функции, не заданные явно в редакции, принимают значение Feature.DefaultValue. Вам нужно настроить только те функции, которые отличаются от глобального значения по умолчанию.",
      endpointsList: "Получить список всех редакций (с пагинацией и фильтрацией)",
      endpointsGet: "Получить детали редакции по ID",
      endpointsCreate: "Создать новую редакцию",
      endpointsUpdate: "Обновить метаданные редакции",
      endpointsDelete: "Мягкое удаление (soft-delete) редакции",
      endpointsGetFeatures: "Получить список функций, настроенных для этой редакции",
      endpointsSetFeatures: "Задать/обновить функции для этой редакции",
      endpointsDirectApply: "Применить изменения функций немедленно (без версионирования)",
      endpointsGetVersions: "Получить список всех версий для этой редакции",
      endpointsCreateVersion: "Создать новую черновую версию со снапшотом функций",
      endpointsPublishVersion: "Опубликовать черновую версию с выбранной стратегией развертывания",
    },
    subscriptions: {
      title: "Подписки",
      description:
        "Привязка тэнанта к редакции с полным управлением жизненным циклом, мультивалютным ценообразованием, промоакциями, триалами, даунгрейдами, поведением при истечении срока действия и расширенным аналитическим экспортом.",
      intro:
        "Подписки связывают тэнантов с редакциями (планами). Каждый тэнант имеет базовую подписку, определяющую его редакцию, и, при необходимости, дополнительные подписки для расширения возможностей. Система подписок управляет всем жизненным циклом: от назначения до продления, понижения версии, приостановки и отмены — со встроенным мультивалютным ценообразованием и отслеживанием промо-скидок.",
      entityTitle: "Сущность 'Подписка'",
      entityIntro:
        "TenantSubscription связывает тэнанта с редакцией с отслеживанием жизненного цикла. Она поддерживает несколько типов подписок и статусов для комплексного управления жизненным циклом.",
      typesTitle: "Типы подписок",
      typesIntro:
        "Каждая подписка имеет тип, который определяет ее цикл выставления счетов и поведение:",
      lifecycleTitle: "Жизненный цикл статусов",
      lifecycleIntro: "Подписки проходят через серию статусов в течение своего жизненного цикла:",
      downgradeTitle: "Отслеживание даунгрейдов",
      downgradeIntro:
        "Когда тэнант переходит на более низкую редакцию (вручную или из-за истечения срока), система сохраняет исходные данные подписки для аудита и возможного восстановления. Поля DowngradedFromEditionId, DowngradedFromType, DowngradedFromEndDate и DowngradedAt сохраняют полную историю даунгрейда.",
      downgradeWarning:
        "При понижении версии Политика переполнения (OverflowPolicy) целевой редакции определяет, что произойдет с ресурсами, превышающими новые лимиты. Всегда используйте эндпоинт 'Анализ последствий даунгрейда', чтобы предварительно оценить эффект перед внесением изменений.",
      expiryTitle: "Поведение при истечении срока",
      expiryIntro:
        "Когда срок действия подписки истекает, настройка ExpiryBehavior определяет, что произойдет дальше:",
      pricingTitle: "Мультивалютное ценообразование",
      pricingIntro:
        "Каждая подписка содержит полные метаданные ценообразования: Валюта (ISO-код), БазоваяСумма, СуммаКорректировки, ИтоговаяСумма, КурсОбменаНаUsd и ИтоговаяСуммаUsd. Это обеспечивает точное отслеживание доходов по 9+ поддерживаемым валютам (USD, EUR, GBP, SAR, AED, EGP, TRY, INR и другие).",
      exchangeRateTitle: "Нормализация в USD",
      exchangeRateIntro:
        "Все суммы нормализуются в USD через ExchangeRateToUsd для согласованных отчётов MRR/ARR. Поле TotalAmountUsd рассчитывается при создании подписки и сохраняется для исторической точности — колебания курсов валют не изменяют прошлые записи ретроактивно.",
      promotionsTitle: "Промо-скидки",
      promotionsIntro:
        "Подписки поддерживают промо-коды через поле AppliedPromoCode. При применении действующей акции фиксируется процент PromotionDiscount, а СуммаКорректировки отражает скидку, применённую к БазовойСумме. Промоакции отслеживаются по каждой подписке для аудита и аналитики.",
      exportTitle: "Расширенный экспорт и отчётность",
      exportIntro:
        "Система экспорта подписок генерирует комплексные отчёты в форматах CSV, Excel (XLSX) и PDF. Каждый отчёт включает титульную страницу с метаданными фильтров, цветные таблицы данных и статистические сводки.",
      exportFiltersTitle: "Фильтры экспорта",
      exportFiltersIntro: "Отчёты поддерживают расширенную фильтрацию для целевой аналитики:",
      exportFilterDate:
        "Диапазон дат — фильтрация по дате создания подписки (последние 7/30/90 дней, последний год или пользовательский диапазон)",
      exportFilterExpiring:
        "Скоро истекающие — поиск подписок, истекающих в течение 5/7/14/30/60/90 дней",
      exportFilterStatus: "Статус — Активная, Приостановленная, Отменённая, Истёкшая",
      exportFilterEdition: "Редакция — фильтрация по конкретному плану/редакции",
      exportFilterCurrency: "Валюта — отображение сумм в выбранной валюте",
      exportDaysLeftTitle: "Дней до истечения",
      exportDaysLeftIntro:
        "Отчёты включают вычисляемый столбец 'Осталось дней' с условной цветовой маркировкой: красный (≤7 дней), жёлтый (≤30 дней), зелёный (>30 дней). Это позволяет мгновенно выявлять подписки, требующие внимания к продлению.",
      exportFormatsTitle: "Детали форматов экспорта",
      exportFormatCsv: "CSV — лёгкий, импортируемый в любую таблицу или BI-инструмент",
      exportFormatExcel:
        "XLSX — профессиональная рабочая книга Excel со стилизованными заголовками, листом метаданных фильтров, условным форматированием и автоматически подобранной шириной столбцов (ClosedXML)",
      exportFormatPdf:
        "PDF — готовый к печати документ с брендированной титульной страницей, статистической сводкой и пагинированными таблицами данных (QuestPDF)",
      renewalTitle: "Продление — Паттерн новой строки (B2)",
      renewalIntro:
        "Продления создают НОВУЮ строку TenantSubscription вместо перезаписи существующей записи (паттерн Stripe). Старая подписка помечается как Истекшая (IsActive=false), а создаётся новая строка с новым Id, StartDate=UtcNow, пересчитанным ценообразованием и перенесёнными деталями акции.",
      renewalAuditTitle: "Аудиторский след доходов",
      renewalAuditIntro:
        "Каждый биллинговый цикл создаёт собственную неизменяемую строку в БД с зафиксированным ценообразованием на момент продления. Это обеспечивает точную финансовую отчётность: тренды MRR, анализ оттока по периодам и отслеживание возвратов по циклам.",
      promoExpiryTitle: "Отслеживание истечения промоакции (A1)",
      promoExpiryIntro:
        "Когда промоакция с DurationDays > 0 применяется, система рассчитывает временную метку PromotionExpiresAt. При каждом продлении обработчик проверяет, если UtcNow > PromotionExpiresAt — если акция истекла, скидка удаляется и НЕ переносится в новую строку подписки.",
      concurrencyTitle: "Оптимистичная конкурентность (E1)",
      concurrencyIntro:
        "Каждая TenantSubscription имеет ConcurrencyStamp (Guid) с [ConcurrencyCheck]. Штамп обновляется при каждой операции записи. Это предотвращает состояния гонки — например, параллельная отмена + задача сверки — выбрасывая DbUpdateConcurrencyException при коллизиях.",
      validationTitle: "Валидация входных данных (G1)",
      validationIntro:
        "Все 8 команд подписки имеют выделенные валидаторы FluentValidation. Валидаторы используют ILocalizer для локализованных сообщений об ошибках (EN + AR). Бизнес-правила: нельзя продлить как пробную, положительные суммы возвратов, ограничения длины строк.",
      crossModuleTitle: "Межмодульная интеграция (H1)",
      crossModuleIntro:
        "События жизненного цикла подписки публикуют доменные события, потребляемые модулем Идентификации. При приостановке подписки все администраторы арендатора деактивируются с DeactivationReason='SubscriptionSuspended'. При возобновлении реактивируются только администраторы, деактивированные из-за приостановки.",
      crossModuleReasons:
        "Три причины деактивации: 'Manual' (никогда не реактивируется автоматически), 'SubscriptionSuspended' (реактивируется при возобновлении), 'SubscriptionExpired' (деактивируется при истечении).",
      impactTitle: "Анализ последствий даунгрейда",
      impactIntro:
        "Перед изменением редакции тэнанта используйте эндпоинт анализа последствий даунгрейда, чтобы предварительно просмотреть, какие ресурсы выйдут за пределы лимитов. В ответе перечисляются все функции, которые превысят лимиты новой редакции, а также текущее использование по сравнению с новым лимитом.",
      endpointsTitle: "API Эндпоинты",
      endpointsIntro:
        "Контроллер Subscriptions предоставляет 13 эндпоинтов, охватывающих весь жизненный цикл подписки:",
      operationsTitle: "Операции с подписками",
      operationsIntro:
        "Модуль подписок поддерживает полный набор операций жизненного цикла. Каждая операция переводит подписку в новое состояние с полным отслеживанием аудита.",
      assignTitle: "Назначить подписку",
      assignIntro:
        "Создать новую подписку, связывающую тэнанта с редакцией. Если у тэнанта уже есть активная подписка, предыдущая автоматически отменяется. Поддерживает необязательные параметры валюты, промо-кода и поведения при истечении.",
      upgradeTitle: "Апгрейд и даунгрейд",
      upgradeIntro:
        "Тэнанты могут перемещаться между редакциями. Апгрейды применяются немедленно, и функции новой редакции вступают в силу сразу. Даунгрейды сначала проверяют OverflowPolicy для обработки ресурсов, превышающих новые лимиты.",
      trialTitle: "Конвертация триала",
      trialIntro:
        "У пробных подписок (триалов) есть TrialEndDate. Когда триал повышается до платного плана, IsTrialConverted устанавливается в true, и подписка переходит в новый тип. Если триал истекает без конвертации, ExpiryBehavior определяет, что произойдет дальше.",
      ep: {
        list: "Получить список всех подписок (с пагинацией, фильтрацией по статусу/типу/тэнанту)",
        get: "Получить детали подписки по ID",
        assign: "Создать новую подписку (назначить тэнанта на редакцию с валютой/промо)",
        upgrade: "Повысить до более высокой редакции (апгрейд)",
        downgrade: "Понизить до более низкой редакции (даунгрейд, проверяет OverflowPolicy)",
        impact: "Предварительный просмотр последствий даунгрейда перед его выполнением",
        suspend: "Приостановить подписку (заблокировать доступ тэнанту)",
        resume: "Возобновить приостановленную подписку",
        cancel: "Окончательно отменить подписку",
        renew: "Продлить истекающую подписку",
        tenantActive: "Получить активную подписку для конкретного тэнанта",
        export: "Экспорт подписок в CSV, Excel или PDF с расширенными фильтрами",
      },
    },
    features: {
      title: "Функции (Features)",
      description:
        "Управляемые возможности платформы с логическими, числовыми и строковыми типами значений.",
      intro:
        "Функции — это атомарные строительные блоки системы прав доступа. Каждая функция представляет собой управляемую возможность — логический переключатель, числовую квоту или строковую конфигурацию. Функции имеют стабильный системный ключ (Name), который никогда не меняется, что делает их безопасными для использования в коде.",
      entityTitle: "Сущность 'Функция'",
      entityIntro:
        "Функция определяет управляемую возможность платформы. Поле Name — это стабильный системный ключ, используемый в коде; DisplayNameEn/DisplayNameAr — это пользовательские метки.",
      valueTypesTitle: "Типы значений",
      valueTypesIntro:
        "Значения функций хранятся как строки, но интерпретируются в соответствии с их ValueType. Система проверяет значения на соответствие ожидаемому типу во время создания и обновления.",
      valueTypesTip:
        "Для числовых функций используйте -1, чтобы обозначить 'без ограничений'. FeatureCheckBehavior распознает -1 как специальное значение и никогда не блокирует запросы для функций с безлимитной квотой.",
      systemVsCustomTitle: "Системные vs Пользовательские функции",
      systemVsCustomIntro:
        "NEXORA различает системные функции (инициализируются при запуске, доступны только для чтения) и пользовательские функции (создаются администраторами через API):",
      cacheTitle: "Кэш функций",
      cacheIntro:
        "Разрешенные значения функций кэшируются в IFeatureCache, чтобы избежать запросов к базе данных при каждом обращении. Кэш инвалидируется всякий раз, когда изменяются функции редакции, модифицируется подписка или устанавливается/удаляется переопределение. В развертываниях микросервисов без модуля прав доступа NoOpFeatureCache считает все функции включенными.",
      requireFeatureTitle: "Интерфейс IRequireFeature",
      requireFeatureIntro:
        "Чтобы скрыть CQRS команду или запрос за функцией, реализуйте маркерный интерфейс IRequireFeature. Пайплайн-поведение FeatureCheckBehavior автоматически разрешает текущее значение тэнанта и отклоняет запрос, если функция отключена.",
      requireFeatureNote:
        "IRequireFeature работает как для логических функций (проверяется как включено/отключено), так и для числовых функций (проверяется как оставшаяся квота). Поведение автоматически определяет тип проверки на основе Feature.ValueType.",
      contextAwareTitle: "Контекстно-зависимое отображение функций",
      contextAwareIntro:
        "Список функций является контекстно-зависимым. Системные администраторы видят полный каталог функций с CRUD-операциями. Администраторы тэнантов и drill-down сессии видят только эффективные функции тэнанта (разрешенные из редакции + переопределений) в режиме только для чтения. Вся фильтрация области выполняется на стороне бэкенда через GET /features (каталог) vs GET /features/effective (привязка к тэнанту).",
      endpointsTitle: "API Эндпоинты",
      endpointsIntro:
        "Контроллер Features предоставляет 5 CRUD эндпоинтов. Системные функции не могут быть удалены:",
      seedingTitle: "Инициализация функций (Seeding)",
      seedingIntro:
        "Системные функции автоматически инициализируются при запуске приложения с помощью EntitlementsStartupSeeder. Сидер проверяет, существует ли уже каждая системная функция (по имени), и создает только недостающие — существующие функции никогда не перезаписываются.",
      quotaTitle: "Отслеживание квот (QuotaCounter)",
      quotaIntro:
        "Числовые функции поддерживают автоматический контроль квот через сущность QuotaCounter. FeatureCheckBehavior проверяет текущее использование относительно разрешенного лимита для каждой команды IRequireFeature, нацеленной на числовую функцию.",
      cacheNote:
        "Кэш автоматически инвалидируется, когда: (1) изменяются функции редакции, (2) назначается/изменяется подписка, (3) устанавливается/удаляется переопределение. Ручная очистка кэша не требуется.",
      patternTitle: "Паттерн IRequireFeature",
      patternIntro:
        "Чтобы скрыть любую CQRS команду за проверкой функции, просто реализуйте маркерный интерфейс IRequireFeature. FeatureCheckBehavior автоматически перехватывает запрос, разрешает значение функции тэнанта и отклоняет его, если функция отключена или квота превышена.",
      ep: {
        list: "Получить список всех функций (с пагинацией, фильтрацией по категории/типу)",
        get: "Получить детали функции по ID",
        create: "Создать новую пользовательскую функцию",
        update: "Обновить метаданные функции (системные функции: только DefaultValue/Description)",
        delete: "Мягкое удаление пользовательской функции (системные функции удалить нельзя)",
      },
    },
    overrides: {
      title: "Переопределения функций (Overrides)",
      description:
        "Персонализация значений функций для конкретного тэнанта, которая обходит настройки редакции по умолчанию.",
      intro:
        "Переопределения функций позволяют администраторам платформы настраивать значения функций для отдельных тэнантов, независимо от их подписки на редакцию. Переопределения имеют наивысший приоритет в цепочке разрешения, что делает их идеальными для индивидуальных сделок, специальных акций или разовых исключений.",
      entityTitle: "Сущность 'Переопределение'",
      entityIntro:
        "TenantFeatureOverride устанавливает пользовательское значение для определенной функции конкретного тэнанта. Включает необязательное поле Reason (Причина) для целей аудита.",
      priorityTitle: "Приоритет разрешения",
      priorityIntro:
        "Переопределения находятся на самом верху цепочки разрешения. Когда система определяет значение функции для тэнанта, она сначала проверяет наличие переопределения:",
      whenTitle: "Когда использовать переопределения",
      whenIntro:
        "Переопределения предназначены для исключительных случаев, когда тэнанту требуется значение, отличное от того, которое предоставляет его редакция:",
      useCase1:
        "Индивидуальные корпоративные сделки — 'Предоставить Acme Corp 500 администраторов вместо стандартных 50'",
      useCase2: "Рекламные предложения — 'Включить Premium Chat для этого тэнанта на 30 дней'",
      useCase3: "Бета-тестирование — 'Включить новый модуль Invoicing для первых пользователей'",
      useCase4: "Временное расширение — 'Увеличить лимит загрузки файлов во время их миграции'",
      overuseWarning:
        "Переопределения следует использовать экономно. Если многим тэнантам требуется одно и то же переопределение, подумайте о создании новой редакции. Избыток переопределений усложняет управление системой и аудит.",
      resolvedTitle: "Эндпоинт разрешенных функций",
      resolvedIntro:
        "Эндпоинт GET /api/v1/tenants/{tenantId}/features/resolved возвращает конечное, действующее значение для каждой функции данного тэнанта. Он показывает источник разрешения (Override, Edition или Default) для каждой записи, что упрощает отладку и аудит.",
      endpointsTitle: "API Эндпоинты",
      endpointsIntro:
        "Контроллер TenantFeatures предоставляет 4 эндпоинта для управления переопределениями тэнантов и разрешенными значениями:",
      scenariosTitle: "Сценарии использования",
      scenariosIntro:
        "Следующие реальные сценарии демонстрируют, когда переопределения приносят наибольшую пользу:",
      settingTitle: "Установка переопределения",
      settingIntro:
        "Чтобы установить переопределение, отправьте POST-запрос на эндпоинт функций тэнанта с ID функции, пользовательским значением и необязательной причиной для целей аудита.",
      settingTip:
        "Всегда указывайте причину при установке переопределений — это делает журналы аудита осмысленными и помогает будущим администраторам понять, почему было применено переопределение.",
      expiryTitle: "Истекающие переопределения",
      expiryIntro:
        "Переопределения могут иметь необязательную дату истечения (ExpiresAt). По истечении этой даты переопределение автоматически отключается, и функция возвращается к значению редакции (или глобальному значению по умолчанию).",
      expiryNote:
        "Просроченные переопределения отключаются программно (IsActive = false), а не удаляются. Это сохраняет след аудита и позволяет активировать их повторно при необходимости.",
      auditTitle: "Журнал аудита",
      auditIntro:
        "Каждая операция переопределения отслеживается с полной информацией для аудита. Поле Reason (Причина) в каждом переопределении предоставляет контекст того, почему было применено пользовательское значение.",
      bestPracticesTitle: "Лучшие практики",
      bestPracticesIntro:
        "Следуйте этим рекомендациям, чтобы система переопределений оставалась легко поддерживаемой и проверяемой.",
      bestPracticesWarning:
        "Переопределения следует использовать экономно. Если многим тэнантам требуется одно и то же переопределение, подумайте о создании новой редакции. Чрезмерное использование переопределений усложняет систему и создает технический долг (maintenance debt).",
      ep: {
        list: "Получить список всех переопределений для конкретного тэнанта",
        set: "Установить или обновить переопределение функции для тэнанта",
        remove: "Удалить (отключить) переопределение функции",
        resolved:
          "Получить все разрешенные значения функций для тэнанта (показывает источник: Override/Edition/Default)",
      },
    },

    compliance: {
      overview: {
        title: "[RU] Compliance Module",
        description: "[RU] GDPR, CCPA, and PDPA compliance automation — regulations, DSR handling, consent management, data retention, inventory, and report generation.",
        intro: "[RU] The Compliance module is NEXORA's built-in regulatory compliance engine. It helps platform operators and their tenants stay compliant with major data protection laws (GDPR, CCPA, PDPA) through automated tools for managing data subject requests, consent records, retention policies, and generating audit-ready compliance reports.",
        infoTitle: "[RU] Compliance Notice",
        infoContent: "[RU] The Compliance module is critical for maintaining regulatory adherence and avoiding fines. Ensure all features are correctly mapped to data processing policies.",
        descDsr: "[RU] Handles Subject Requests (Export, Erasure, Rectification)",
        descConsent: "[RU] Immutable tracking of consent states & snapshots",
        descRet: "[RU] Enforces data destruction policies based on age",
        descInv: "[RU] Maps sensitive PII locations across modules",
        descRep: "[RU] Generates RoPA and DPIA compliance reports",
        descId: "[RU] Identity Module",
        descIdDesc: "[RU] Provides User/Admin context & Auth",
        descEnt: "[RU] Entitlements Module",
        descEntDesc: "[RU] Feature-gates compliance capabilities",
        conn1: "[RU] initiates requests",
        conn2: "[RU] grants/revokes",
        conn3: "[RU] gates policies",
        conn4: "[RU] guides erasure",
        conn5: "[RU] targets data",
        conn6: "[RU] audit trails",
        conn7: "[RU] audit trails",
        th1: "[RU] Component",
        th2: "[RU] Responsibility",
        tr1_1: "[RU] DsrListViewModel",
        tr1_2: "[RU] Handles the pagination, filtering, and assignment of incoming Data Subject Requests.",
        tr2_1: "[RU] ConsentRecordView",
        tr2_2: "[RU] Renders the immutable consent snapshot alongside user agent and timestamp metadata.",
        whatIsTitle: "[RU] What is the Compliance Module?",
        whatIsIntro: "[RU] The Compliance module provides six interconnected sub-systems that cover the full compliance lifecycle. Instead of building compliance tooling from scratch, NEXORA tenants get a production-ready system that tracks, automates, and reports on their data protection obligations.",
        subModulesTitle: "[RU] Six Sub-Systems",
        subModulesIntro: "[RU] Each sub-system handles a specific compliance domain:",
        sub1: "[RU] Regulation Profiles — Stores the regulatory frameworks (GDPR, CCPA, PDPA) that the platform operates under.",
        sub2: "[RU] Data Subject Requests (DSR) — Manages rights requests from data subjects (export, erasure, rectification, restriction).",
        sub3: "[RU] Consent Management — Records, tracks, and audits user consent grants and withdrawals.",
        sub4: "[RU] Data Retention Policies — Defines how long data is kept and what happens when it expires (delete or anonymize).",
        sub5: "[RU] Data Inventory — A registry of all personal data categories the platform processes.",
        sub6: "[RU] Compliance Reports — Generates async audit-ready reports (GDPR Overview, DSR Summary, Consent Audit, etc.).",
        backendTitle: "[RU] Backend Architecture",
        backendIntro: "[RU] The Compliance backend follows the standard NEXORA 3-project module layout (Domain / Application / Infrastructure) with a dedicated ComplianceDbContext and ComplianceController.",
        frontendTitle: "[RU] Frontend Architecture",
        frontendIntro: "[RU] The frontend is organized as six independent sub-modules under src/modules/compliance/, each with its own domain, data, and presentation layers following the View/ViewModel pattern.",
        endpointsTitle: "[RU] API Endpoints Overview",
        endpointsIntro: "[RU] All endpoints are under /api/v1/compliances/ and require authentication with the compliance.view permission.",
      },
      dsr: {
        title: "[RU] Data Subject Requests (DSR)",
        description: "[RU] Manage GDPR/CCPA rights requests — export, erasure, rectification, and restriction — with full lifecycle tracking.",
        intro: "[RU] Data Subject Requests (DSRs) are formal requests from individuals exercising their rights under data protection laws. The Compliance module provides a complete DSR workflow: submission, assignment, processing, and closure — with full audit trail and SLA tracking.",
        typesTitle: "[RU] Request Types",
        typesIntro: "[RU] The system supports four DSR types as defined by GDPR Article 17 and CCPA:",
        type1: "[RU] Export — Data portability request. The subject wants a copy of their personal data.",
        type2: "[RU] Erasure — Right to be forgotten. All personal data must be deleted or anonymized.",
        type3: "[RU] Rectification — Correction request. Inaccurate personal data must be updated.",
        type4: "[RU] Restriction — Processing restriction. Data can be retained but not actively processed.",
        lifecycleTitle: "[RU] Request Lifecycle",
        lifecycleIntro: "[RU] DSRs move through a defined set of statuses from submission to closure:",
        status1: "[RU] Pending — Initial state when the request is received.",
        status2: "[RU] InProgress — A compliance officer has been assigned and is processing the request.",
        status3: "[RU] Completed — The request has been fulfilled (data exported, erased, corrected, or restricted).",
        status4: "[RU] Rejected — The request was rejected (e.g. insufficient identity verification).",
        slasTitle: "[RU] GDPR SLA Requirements",
        slasIntro: "[RU] Under GDPR Article 12, data controllers must respond to DSRs within 30 days (extendable to 3 months for complex requests). NEXORA tracks the submission date for each DSR to help you meet these deadlines.",
        lifecycleFlowTitle: "[RU] DSR Lifecycle Flow",
        nodeSubmit: "[RU] Submit Request",
        descSubmit: "[RU] Subject requests Export, Erasure, or Rectification",
        nodePending: "[RU] Status: Pending",
        descPending: "[RU] Request is logged, SLA deadline calculated",
        nodeProcessing: "[RU] Status: Processing",
        descProcessing: "[RU] DsrExecutionJob begins processing modules via ISuspendableModule",
        nodeApproval: "[RU] Wait For Admin",
        descApproval: "[RU] Nuclear actions (Erasure) require manual admin confirmation",
        nodeCompleted: "[RU] Status: Completed",
        descCompleted: "[RU] Export generated or data erased; SLA fulfilled",
        nodeRejected: "[RU] Status: Rejected",
        descRejected: "[RU] Request denied by admin with resolution notes",
        conn1: "[RU] initiates",
        conn2: "[RU] background job picks up",
        conn3: "[RU] if auto-processed (Export)",
        conn4: "[RU] if nuclear (Erasure)",
        conn5: "[RU] admin confirms",
        conn6: "[RU] admin rejects",
        entitiesTitle: "[RU] Entities",
        entityName: "[RU] Entity Name",
        entityDesc: "[RU] Description",
        entityDsrDesc: "[RU] Represents a data subject request.",
        entityModuleDesc: "[RU] Execution state of a module.",
        entityStatusDesc: "[RU] History of status changes.",
        codeTitle: "[RU] Code Example",
        endpointsTitle: "[RU] API Endpoints",
        endpointsIntro: "[RU] The DSR controller exposes 6 endpoints for the full DSR lifecycle:",
        ep: {
          list: "[RU] List all DSRs (paginated, filterable by status/type/regulation)",
          get: "[RU] Get DSR details by ID",
          create: "[RU] Submit a new DSR",
          updateStatus: "[RU] Update DSR status (InProgress, Completed, Rejected)",
          assign: "[RU] Assign DSR to a compliance officer",
          delete: "[RU] Soft-delete a DSR",
        },
      },
      consent: {
        title: "[RU] Consent Management",
        description: "[RU] Record, track, and audit user consent grants and withdrawals for GDPR Article 6 and CCPA compliance.",
        intro: "[RU] Consent Management records every time a user grants or withdraws consent for a specific purpose (e.g. marketing emails, analytics tracking). NEXORA stores the full consent audit trail including timestamp, IP address, user agent, and the exact consent version shown.",
        purposesTitle: "[RU] Consent Purposes",
        purposesIntro: "[RU] Each consent record is tied to a specific purpose. Common purposes include:",
        purpose1: "[RU] Marketing — Email marketing and promotional communications.",
        purpose2: "[RU] Analytics — Usage analytics and product improvement.",
        purpose3: "[RU] ThirdParty — Sharing data with third-party services.",
        purpose4: "[RU] Personalization — Personalized content and recommendations.",
        gdprTitle: "[RU] GDPR Lawful Basis",
        gdprIntro: "[RU] Under GDPR Article 6, consent must be: freely given, specific, informed, and unambiguous. NEXORA records the exact consent text version shown to the user and the timestamp it was accepted, providing a legally defensible audit trail.",
        withdrawalTitle: "[RU] Consent Withdrawal",
        withdrawalIntro: "[RU] Users can withdraw consent at any time. When consent is withdrawn, the ConsentRecord is updated with WithdrawnAt timestamp. Downstream systems should be notified via domain events to stop processing data for the withdrawn purpose.",
        flowTitle: "[RU] Consent State Flow",
        nodePurpose: "[RU] Consent Purpose",
        descPurpose: "[RU] Defines what is being consented to (e.g. Marketing)",
        nodeRecord: "[RU] Consent Record",
        descRecord: "[RU] User's current state (Granted/Revoked) per purpose",
        nodeSnapshot: "[RU] Consent Snapshot",
        descSnapshot: "[RU] Immutable point-in-time capture of consent grant/revoke",
        nodeJob: "[RU] Consent Expiry Job",
        descJob: "[RU] Daily job revokes expired consents",
        conn1: "[RU] templates",
        conn2: "[RU] generates on change",
        conn3: "[RU] auto-revokes if expired",
        immutabilityTitle: "[RU] Immutability",
        immutabilityIntro: "[RU] Consent records are immutable and track integrity.",
        endpointsTitle: "[RU] API Endpoints",
        ep: {
          list: "[RU] List all consent records (paginated, filterable by purpose/status)",
          get: "[RU] Get consent record by ID",
          record: "[RU] Record a new consent grant",
          withdraw: "[RU] Withdraw a previously granted consent",
        },
      },
      retention: {
        title: "[RU] Data Retention Policies",
        description: "[RU] Define data retention periods and automated expiry actions (Delete or Anonymize) for GDPR Article 5(1)(e) compliance.",
        intro: "[RU] Data Retention Policies define how long specific categories of data must be kept and what happens when the retention period expires. NEXORA enforces these policies automatically via background jobs, removing the manual overhead of managing data lifecycles.",
        policiesTitle: "[RU] Policy Configuration",
        policiesIntro: "[RU] Each retention policy specifies:",
        field1: "[RU] DataCategory — The type of data (e.g. 'User Profiles', 'Transaction Logs', 'Consent Records').",
        field2: "[RU] RetentionDays — How many days the data must be retained.",
        field3: "[RU] ExpiryAction — What happens when the period expires: Delete or Anonymize.",
        field4: "[RU] RegulationCode — Which regulation requires this retention period (GDPR, CCPA, etc.).",
        actionsTitle: "[RU] Expiry Actions",
        actionsIntro: "[RU] When a retention period expires, NEXORA applies one of two actions:",
        action1: "[RU] Delete — Permanently removes all records matching the data category.",
        action2: "[RU] Anonymize — Replaces personally identifiable information with pseudonymous tokens, preserving aggregate analytics data.",
        automationTitle: "[RU] Automated Enforcement",
        automationIntro: "[RU] The RetentionEnforcementJob runs daily at 3:00 AM UTC, scanning all active retention policies and applying the configured expiry action to eligible records. Each enforcement run creates a RetentionExecution audit record.",
        nodePolicy: "[RU] Retention Policy",
        descPolicy: "[RU] Defines entity type, age limit, and destruction strategy",
        nodeEnforcement: "[RU] Retention Enforcement Job",
        descEnforcement: "[RU] Weekly job to evaluate policies",
        nodeExecution: "[RU] Retention Execution",
        descExecution: "[RU] Audit trail of the destruction action",
        nodeAction: "[RU] Data Destruction",
        descAction: "[RU] Hard deletion or Anonymization via ISuspendableModule",
        conn1: "[RU] scanned by",
        conn2: "[RU] triggers",
        conn3: "[RU] logs",
        endpointsTitle: "[RU] API Endpoints",
        ep: {
          list: "[RU] List all retention policies",
          executions: "[RU] List enforcement execution history",
          update: "[RU] Update a retention policy (days, action, active status)",
        },
      },
      inventory: {
        title: "[RU] Data Inventory",
        description: "[RU] A registry of all personal data categories the platform processes — required for GDPR Article 30 Records of Processing Activities (RoPA).",
        intro: "[RU] The Data Inventory is a structured registry of all personal data categories that the platform processes. Under GDPR Article 30, controllers must maintain Records of Processing Activities (RoPA) — the Data Inventory is NEXORA's implementation of this requirement.",
        fieldsTitle: "[RU] Inventory Fields",
        fieldsIntro: "[RU] Each inventory item documents:",
        field1: "[RU] DataCategory — Human-readable name of the data category (e.g. 'Email Addresses', 'Payment Information').",
        field2: "[RU] LegalBasis — The GDPR lawful basis for processing (Consent, Contract, Legal Obligation, Vital Interests, Public Task, Legitimate Interests).",
        field3: "[RU] DataSubjects — Who the data belongs to (e.g. 'End users', 'Employees', 'Customers').",
        field4: "[RU] ProcessingPurpose — Why the data is processed (e.g. 'Order fulfillment', 'Marketing', 'Legal compliance').",
        field5: "[RU] StorageLocation — Where the data is stored (country/region for cross-border transfer compliance).",
        field6: "[RU] RetentionPeriod — How long the data is retained (linked to the retention policy).",
        field7: "[RU] ThirdPartySharing — Whether the data is shared with third parties and which ones.",
        ropaTitle: "[RU] Article 30 Compliance",
        ropaIntro: "[RU] Organizations with 250+ employees or processing high-risk data must maintain a RoPA under GDPR Article 30. NEXORA's Data Inventory serves as a live, queryable RoPA that can be exported for regulatory inspections.",
        endpointsTitle: "[RU] API Endpoints",
        ep: {
          list: "[RU] List all data inventory items (paginated, searchable)",
          get: "[RU] Get item by ID",
          create: "[RU] Add a new data category to the inventory",
          update: "[RU] Update an existing inventory item",
          delete: "[RU] Remove an item from the inventory",
        },
      },
      reports: {
        title: "[RU] Compliance Reports",
        description: "[RU] Generate async audit-ready compliance reports (GDPR Overview, DSR Summary, Consent Audit, Retention Analysis, Data Inventory Export).",
        intro: "[RU] Compliance Reports are asynchronously generated documents that provide audit-ready summaries of your compliance posture. Reports are generated in the background and stored for download once ready, supporting regulatory inspections, internal audits, and executive reporting.",
        reportTypesTitle: "[RU] Report Types",
        reportTypesIntro: "[RU] Five report types are available:",
        type1: "[RU] GDPR Overview — High-level summary of GDPR compliance status across all sub-modules.",
        type2: "[RU] DSR Activity Summary — Statistics on DSR volume, types, completion rates, and SLA adherence.",
        type3: "[RU] Consent Audit — Full log of consent grants and withdrawals by purpose and time period.",
        type4: "[RU] Retention Analysis — Current enforcement status of all active retention policies.",
        type5: "[RU] Data Inventory Export — Full export of the data inventory (Article 30 RoPA).",
        asyncTitle: "[RU] Asynchronous Generation",
        asyncIntro: "[RU] Reports are generated asynchronously to avoid blocking HTTP requests for large datasets. When you request a report, the system immediately creates a ComplianceReport record with IsReady=false and queues the generation job. Poll the reports list to check when IsReady becomes true.",
        asyncTip: "[RU] Use the Refresh button in the Reports UI to poll for report readiness. Reports typically complete within 30–60 seconds for datasets up to 10,000 records.",
        downloadTitle: "[RU] Downloading Reports",
        downloadIntro: "[RU] Once a report is ready (IsReady=true), a DownloadUrl is available. The download endpoint serves the report file securely. Report files are retained for 90 days before automatic cleanup.",
        endpointsTitle: "[RU] API Endpoints",
        ep: {
          list: "[RU] List all compliance reports (paginated, filterable by type/status)",
          get: "[RU] Get report details and download URL by ID",
          generate: "[RU] Queue a new report generation job",
          download: "[RU] Download the generated report file",
        },
      },
    },
  },
};

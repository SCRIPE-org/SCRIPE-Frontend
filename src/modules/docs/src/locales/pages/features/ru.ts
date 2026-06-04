/**
 * Docs features — RU
 * Auto-filled 264 keys from EN.
 */
export const ru = {
  features: {
    auditSystem: {
      adminEventsTitle: "События управления админами",
      architectureTitle: "Архитектура аудита",
      authEventsTitle: "События аутентификации",
      bulkEventsTitle: "События массовых операций (Bulk)",
      description:
        "Пайплайн из 4 источников, 35+ типов событий, события-защитники (Guardian), SignalR в реальном времени и экспорт в CSV/PDF.",
      endpointsTitle: "API-эндпоинты аудита",
      eventTypesTitle: "Типы событий (35+ категорий)",
      exportIntro: "Экспорт в форматы CSV, Excel и PDF с сохранением изоляции тенантов.",
      exportTitle: "Экспорт аудита",
      guardianIntro:
        "Записи аудита, создаваемые, когда система БЛОКИРУЕТ опасную операцию (например, удаление последнего суперадмина).",
      guardianTitle: "События-защитники (Guardian)",
      intro:
        "SCRIPE фиксирует все значимые действия в журнале аудита через AstraFlow mediator, перехватчики EF Core, middleware и прямые вызовы сервисов.",
      rbacEventsTitle: "События RBAC",
      realTimeIntro:
        "Каждое событие транслируется в реальном времени через SignalR в группы, ограниченные тенантом (Tenant-Scoped).",
      realTimeTitle: "Широковещание в реальном времени",
      retentionTip:
        "Срок хранения логов настраивается в TenantSettings. Фоновая задача Hangfire автоматически очищает устаревшие записи.",
      serviceMethodsIntro:
        "Методы асинхронны (fire-and-forget) и никогда не блокируют основной конвейер запросов.",
      serviceMethodsTitle: "Методы AuditService",
      sessionEventsTitle: "События сессий",
      tenantEventsTitle: "События тенантов",
      title: "Система аудита",
      twoFactorEventsTitle: "События 2FA",
    },
    authentication: {
      adminEntityIntro:
        "Сущность Admin содержит ряд критически важных для безопасности полей, контролирующих поведение учетной записи.",
      adminEntityTitle: "Сущность Admin (Особенности безопасности)",
      description:
        "Двойная аутентификация (Админ + Пользователь), JWT-токены, 2FA с резервными кодами и политики паролей для тенантов.",
      dualAuthIntro:
        "Отдельные конвейеры: AdminAuthController для панели управления и UserAuthController для конечных пользователей.",
      dualAuthTitle: "Двойная аутентификация (Админ и Пользователь)",
      endpointsAdminTitle: "Эндпоинты аутентификации админов",
      endpointsTitle: "API-эндпоинты аутентификации",
      endpointsUserTitle: "Эндпоинты аутентификации пользователей",
      flowTitle: "Процесс аутентификации",
      intro:
        "SCRIPE предоставляет безопасную систему аутентификации с короткими JWT access-токенами, ротацией refresh-токенов, 2FA и ограничением скорости запросов (rate limiting).",
      jwtIntro:
        "Используются короткоживущие access-токены (15 минут) и долгоживущие refresh-токены (7 дней), которые ротируются при каждом использовании.",
      jwtTitle: "Конфигурация JWT",
      lockoutWarning:
        "После 5 неудачных попыток входа учетная запись временно блокируется на 15 минут.",
      passwordPolicyIntro:
        "Требования к паролю (длина, спецсимволы, срок действия) настраиваются для каждого тенанта через TenantSettings.",
      passwordPolicyTitle: "Политика паролей тенанта",
      rateLimitingIntro:
        "Защита от брутфорса и злоупотреблений с помощью строгих политик лимитирования.",
      rateLimitingTitle: "Лимитирование запросов (Rate Limiting)",
      title: "Аутентификация",
      twoFactorIntro:
        "Реализована через TOTP. Резервные коды хэшируются. Имеется защита от атак повторного воспроизведения (anti-replay).",
      twoFactorTitle: "Двухфакторная аутентификация (2FA)",
    },
    dashboardBuilder: {
      archIntro:
        "Конструктор Дашборда реализован в 7 файлах в Core-слое, следуя провайдерной архитектуре SCRIPE.",
      archTip:
        "Для добавления новой настройки расширьте интерфейс Settings и defaultSettings в settings-provider.tsx.",
      archTitle: "Архитектура и карта файлов",
      description:
        "Серверно-синхронизированные Admin-настройки с 4-слойным движком слияния, 61 настраиваемым параметром, предотвращением FOUC, разрешением конфликтов 409 и контролем функций на основе редакций.",
      edgeCasesIntro:
        "Система синхронизации обрабатывает 5 критических граничных случаев, типичных для корпоративных сред.",
      edgeCasesTitle: "Защита от граничных случаев",
      edgeCasesWarning:
        "Ключ PENDING_SETTINGS_FLUSH намеренно сохраняется после выхода из системы для выполнения flush при следующем логине.",
      intro:
        "Конструктор Дашборда — это корпоративная система предпочтений администратора SCRIPE, которая синхронизирует 61 настраиваемый параметр панели управления между браузером и сервером. Система использует 4-слойный движок слияния (Платформа → Тенант → Админ → Рантайм) для разрешения настроек с контролем переопределений на уровне тенанта, кросс-девайсной персистенцией через AdminSettingsJson и 5 защитами от граничных случаев.",
      mergeEngineIntro:
        "Настройки следуют строгой 4-слойной цепочке приоритетов. Каждый слой может переопределить предыдущий, с опциональным контролем доступа по путям на уровне тенанта.",
      mergeEngineNote:
        "Слой 2 (Ограничения редакции) обрабатывается на стороне сервера через пайплайн FeatureCheckBehavior.",
      mergeEngineTitle: "4-слойный движок слияния",
      overrideControlIntro:
        "Администраторы тенантов могут контролировать, какие настройки доступны для персонализации индивидуальным админам.",
      overrideControlTitle: "Контроль переопределений Admin",
      overviewIntro:
        "Конструктор Дашборда обеспечивает полный жизненный цикл предпочтений — от мгновенного рендеринга из кэша до фоновой сверки с сервером.",
      overviewTip:
        "Настройки рендерятся мгновенно из кэша localStorage при загрузке страницы. Запрос к серверу выполняется в фоне.",
      overviewTitle: "Обзор системы",
      securityIntro:
        "Конструктор Дашборда реализует многоуровневую защиту для предотвращения утечек данных между админами и переполнения payload.",
      securityTitle: "Модель безопасности",
      settingsRefIntro:
        "Все 61 настройка организованы в 9 секций. Каждая настройка имеет определённый тип, значение по умолчанию, DOM data-атрибут и опциональный контроль редакции.",
      settingsRefTitle: "Справочник настроек (61 параметр)",
      syncHookIntro:
        "Хук useAdminSettingsSync управляет полным жизненным циклом предпочтений администратора: первоначальная загрузка из кэша, отложенный flush, фоновый запрос к серверу и тихая сверка.",
      syncHookTitle: "Хук синхронизации с сервером",
      title: "Конструктор Дашборда",
    },
    dashboardHub: {
      archIntro:
        "Хаб Панели Управления использует паттерн Hub-and-Spoke, где основной DashboardView служит центральным хабом, отображающим полосу вкладок, а каждая вкладка лениво загружает независимое доменно-специфичное представление (spoke). Вкладка Обзор встроена для мгновенного рендеринга. Вкладки Аудит, Безопасность и Аналитика загружаются по требованию через React.lazy с fallback-компонентами Suspense.",
      archTip:
        "Подпредставления загружаются лениво только при первой активации их вкладки. Это уменьшает начальный бандл панели управления примерно на 60% по сравнению с нетерпеливой загрузкой всех четырёх представлений.",
      archTitle: "Архитектура Hub-and-Spoke",
      cachingIntro:
        "Все ключи TanStack Query в хабе включают текущий tenantId в качестве ключа разделения. Это гарантирует, что при переключении арендатора все данные панели управления автоматически инвалидируются и повторно запрашиваются для нового контекста арендатора.",
      cachingTitle: "Кэширование с Учётом Арендатора",
      compatIntro:
        "Для предотвращения ошибок сборки во время миграции DashboardEntities.ts сохраняет устаревшие псевдонимы типов, которые ре-экспортируют типы из новых доменно-специфических модулей. Компоненты, всё ещё импортирующие из файла сущностей модуля dashboard, продолжат работать, но получат предупреждения TypeScript об устаревании.",
      compatTitle: "Обратная Совместимость",
      compatWarning:
        "Устаревшие псевдонимы должны быть удалены в будущей итерации очистки после того, как все потребляющие компоненты мигрируют на импорт из соответствующего доменного модуля (audit/security/analytics).",
      description:
        "Модульная панель с вкладками и доменно-сегрегированными субмодулями (Аудит, Безопасность, Аналитика), 6-слойная чистая архитектура для каждого модуля, ISP-совместимые интерфейсы, ленивая загрузка и управление видимостью вкладок через разрешения.",
      diIntro:
        "Все три новых модуля зарегистрированы в SystemContainer (modules/system/di.ts). Каждый модуль следует паттерну: Сервис (принимает IApiService) → Репозиторий (принимает Сервис) → Объявление интерфейса SystemContainer → Экспорт ленивого геттера. ViewModel-ы потребляют репозитории исключительно через DI-контейнер.",
      diTip:
        "Ленивые геттеры в аксессоре systemContainer гарантируют, что сервисы и репозитории инстанцируются только при первом доступе, предотвращая ненужные сетевые накладные расходы для вкладок, которые никогда не открываются.",
      diTitle: "Подключение DI-Контейнера",
      domainIntro:
        "Ранее все данные панели управления проходили через единый DashboardRepository (Бог-интерфейс) с более чем 8 методами, охватывающими аудит, безопасность и аналитику. Рефакторизованная архитектура извлекает каждый домен в независимый модуль с собственным интерфейсом репозитория, устраняя монолитную связанность и соблюдая Принцип Разделения Интерфейсов (ISP).",
      domainNote:
        "Обратно совместимые псевдонимы типов сохраняются в DashboardEntities.ts для устаревших компонентов. Эти псевдонимы помечены как @deprecated для направления будущей очистки.",
      domainTitle: "Сегрегация Доменов (Принцип Разделения Интерфейсов)",
      hubIntro:
        "Компонент DashboardView служит хабом, отображая TabsList с 4 элементами TabsTrigger (Обзор, Аудит, Безопасность, Аналитика). Вкладки Аудит и Безопасность отображаются условно на основе разрешений текущего администратора с использованием хука usePermission.",
      hubNote:
        "Видимость вкладок управляется разрешениями на фронтенде только для целей UX (скрытие вкладок, к которым пользователь не имеет доступа). Эндпоинты бэкенда обеспечивают реальную границу безопасности — проверки фронтенда являются дополнительными, не авторитетными.",
      hubTitle: "Реализация Хаба со Вкладками",
      intro:
        "Хаб Панели Управления — это главный операционный центр SCRIPE — интерфейс с вкладками, объединяющий четыре доменно-специфичных представления (Обзор, Аудит, Безопасность, Аналитика) в единый хаб. Каждый доменный модуль следует строгой 6-слойной чистой архитектуре (Модели → Сущности → Интерфейсы → Сервисы → Репозитории → Маперы) с отдельной регистрацией в DI. Подпредставления загружаются лениво через React.lazy и защищены разрешениями.",
      layersIntro:
        "Каждый извлечённый модуль (Аудит, Безопасность, Аналитика) реализует полный стек чистой архитектуры фронтенда SCRIPE. 6 слоёв обеспечивают строгое разделение ответственностей: Модели содержат формы ответов API, Сущности — это богатые доменные объекты с вычисляемыми свойствами, Интерфейсы определяют контракты, Сервисы обрабатывают HTTP-вызовы через IApiService, Репозитории оркестрируют сервисы и маперы для возврата доменных сущностей, а Маперы выполняют преобразование DTO-в-сущность с коалесценцией null.",
      layersTitle: "6-Слойная Чистая Архитектура",
      sourceIntro:
        "Рефакторизованный Хаб Панели Управления охватывает 4 модуля (dashboard, audit, security, analytics), каждый с собственным полным 6-слойным стеком.",
      sourceTitle: "Справочник Исходных Файлов",
      title: "Хаб Панели Управления (Hub-and-Spoke)",
      viewmodelIntro:
        "Каждый хук ViewModel теперь импортирует свой выделенный репозиторий из DI-контейнера вместо разделения единого репозитория панели управления. Это устраняет меж-доменную связанность: useAuditViewModel потребляет только auditRepository, useSecurityDashboardViewModel потребляет только securityRepository, а useTenantAnalyticsViewModel потребляет только analyticsRepository.",
      viewmodelTitle: "Развязка ViewModel-ов",
    },
    downloadExport: {
      architectureIntro:
        "Поддерживает аутентифицированные скачивания (требуется JWT) и скачивания на основе сессий (временный URL без JWT).",
      architectureTitle: "Архитектура скачивания",
      description:
        "Аутентифицированные и сессионные скачивания с поддержкой Range, кэшированием ETag и защитой от Path Traversal.",
      endpointsTitle: "Эндпоинты скачивания",
      etagNote:
        "Возвращает 304 Not Modified, если файл не изменился, экономя пропускную способность.",
      etagTitle: "Кэширование ETag",
      pathTraversalNote:
        "Пути файлов тщательно очищаются от последовательностей '..' для предотвращения выхода за пределы рабочей директории.",
      pathTraversalTitle: "Защита от Path Traversal",
      resumableIntro:
        "Система поддерживает HTTP-заголовки Range (код 206) для скачивания файлов по частям.",
      resumableTitle: "Возобновляемые скачивания (Range Headers)",
      sessionIntro:
        "Генерация временной URL-ссылки (например, на 1 час) для обмена файлами с внешними пользователями.",
      sessionTitle: "Скачивание на основе сессии",
      sessionWarning:
        "Сессии не продлеваются. По истечении срока необходимо генерировать новую ссылку.",
      streamConfigTitle: "Конфигурация FileStream",
      title: "Система скачивания и экспорта",
    },
    emailSystem: {
      architectureIntro:
        "Использует InMemoryQueue для разработки и HangfireQueue для надежной асинхронной обработки в продакшене.",
      architectureTitle: "Архитектура почтового конвейера",
      backgroundIntro:
        "Hangfire создает фоновую задачу для каждого письма, обеспечивая рендеринг шаблона и автоматические повторные попытки (retries).",
      backgroundTitle: "Паттерн фонового работника (Background Worker)",
      description:
        "Пайплайн доставки почты со стратегиями очередей, фоновой обработкой и HTML-санитизацией.",
      endpointsTitle: "Эндпоинты EmailController",
      errorIntro:
        "Письма очищаются от возможных XSS-уязвимостей. Неудачные отправки повторяются с экспоненциальной задержкой (exponential backoff).",
      errorTitle: "Обработка ошибок и санитизация",
      queueIntro:
        "Стратегия очереди определяет, как обрабатываются письма (сразу или откладываются в фон).",
      queueTitle: "Реализации очередей",
      senderIntro:
        "SmtpSender осуществляет реальную доставку, ConsoleSender просто логирует письмо для нужд разработки.",
      senderTitle: "Стратегии отправки",
      title: "Система E-mail",
    },
    fileUpload: {
      architectureIntro:
        "Разделение путей для изображений (изменение размера, обрезка, формат) и обычных документов.",
      architectureTitle: "Архитектура загрузки",
      description:
        "Двойной пайплайн загрузки (изображения и документы) с валидацией, обработкой и хранением с учетом тенанта.",
      generalTitle: "Общая загрузка файлов",
      imagePipelineTitle: "Пайплайн загрузки изображений",
      servingNote:
        "Неизвестные типы файлов возвращаются как application/octet-stream для предотвращения MIME-sniffing атак.",
      servingTitle: "Раздача статических файлов",
      tenantScopedTitle: "Изолированное хранилище тенанта",
      title: "Система загрузки файлов",
      validationTitle: "Правила валидации файлов",
    },
    loginCustomizer: {
      a11yAuditIntro:
        "Хук useAccessibilityChecker выполняет 4 автоматизированные проверки в реальном времени на настройках черновика: Валидация коэффициента контрастности (4.5:1 для текста, 3:1 для крупного текста), Размер целей касания (минимум 44×44px), Читаемость наложения (проверяет, что прозрачность не скрывает контент) и настройки Движения (валидирует конфигурацию reduced-motion). Каждая проверка возвращает уровень серьёзности (успех/предупреждение/ошибка) с рекомендациями к действию.",
      a11yAuditTitle: "Движок Аудита WCAG в Реальном Времени",
      a11yAutoFixIntro:
        "Движок аудита включает функцию autoFix, которая автоматически устраняет проваленные проверки, настраивая параметры черновика до соответствия WCAG AA. Например, при провале контраста он корректирует цвет текста; при слишком маленьких целях касания увеличивает высоту кнопок до 44px.",
      a11yAutoFixTitle: "Механизм Автоисправления",
      a11yCat1:
        "Индикаторы фокуса — Пользовательский цвет кольца фокуса, ширина (1–5px), смещение и стиль для всех интерактивных элементов.",
      a11yCat2:
        "Высокий контраст — Переключение режима высокого контраста с настраиваемыми переопределениями контраста текста/фона.",
      a11yCat3:
        "Читаемость текста — Масштабирование размера шрифта (80–200%), настройка высоты строки (1.0–2.5), межбуквенное и межсловное расстояние.",
      a11yCat4:
        "Движение и анимация — Учёт prefers-reduced-motion, управление длительностью переходов, независимое отключение декоративных анимаций.",
      a11yCat5:
        "Цели касания — Обеспечение минимальной высоты кнопок и полей (44px минимум WCAG), настройка padding интерактивных элементов.",
      a11yCat6:
        "Цвет и зрение — Режим для дальтоников, пользовательские цвета ссылок, постоянное подчёркивание ссылок и маркировка иконок.",
      a11yCat7:
        "Скринридер — Инъекция ARIA-ориентиров, объявления живых регионов, ссылки пропуска навигации и улучшение меток форм.",
      a11yCat8:
        "Помощь при чтении — Настраиваемая направляющая чтения, подсветка строк, маска текста и переключатель шрифта для дислексиков.",
      a11yCategoriesTitle: "8 Категорий Настроек",
      a11yCssIntro:
        "Хук useLoginBrandingTokens выпускает 23+ CSS-правил, специфичных для доступности, через единичную инъекцию тега <style>. Правила включают стилизацию колец фокуса (--login-focus-ring-*), переопределения высокого контраста, масштабирование шрифтов, минимумы целей касания, наложения направляющей чтения и переопределения media query reduced-motion. Все CSS доступности корректно каскадируются поверх базовых стилей бренда.",
      a11yCssTitle: "Пайплайн Инъекции CSS",
      a11yIntro:
        "Вкладка Доступность предоставляет комплексную сюиту из 32 настроек в 8 категориях, предназначенную для обеспечения полного соответствия страницы входа WCAG AA. Все настройки хранятся в сущности StudioDraft и инъецируются в живую страницу через пайплайн CSS-токенов. Сюита включает валидацию в реальном времени, профили в один клик и автоматизированный движок аудита WCAG.",
      a11yPreviewIntro:
        "LoginPreviewShell отображает функции доступности в реальном времени: наложения направляющей чтения/маски визуально рендерятся в iframe предпросмотра, а бейдж доступности показывает количество активных функций. Предпросмотр полностью изолирован от системы аутентификации.",
      a11yPreviewTitle: "Интеграция Предпросмотра",
      a11yProfile1:
        "Базовый WCAG AA — Применяет минимальные требования WCAG AA: контраст 4.5:1, цели касания 44px, видимые кольца фокуса.",
      a11yProfile2:
        "Слабое зрение — Крупные шрифты (140%), высокий контраст, жирный текст, увеличенные интервалы, толстые индикаторы фокуса.",
      a11yProfile3:
        "Моторные нарушения — Увеличенные цели касания (56px), дополнительный padding, без анимаций, навигация оптимизирована для клавиатуры.",
      a11yProfile4:
        "Когнитивный — Упрощённый макет, уменьшенное движение, увеличенные интервалы, направляющая чтения, чёткие индикаторы фокуса.",
      a11yProfile5:
        "Оптимизированный для скринридера — Улучшенные ARIA-ориентиры, живые регионы, метки форм, ссылки пропуска навигации, семантическая структура заголовков.",
      a11yProfile6:
        "Сброс к значениям по умолчанию — Восстанавливает все настройки доступности к значениям по умолчанию WCAG AA.",
      a11yProfilesIntro:
        "Преднастроенные профили доступности мгновенно применяют пакетные настройки. Каждый профиль нацелен на конкретную потребность пользователя и может быть дополнительно настроен после применения.",
      a11yProfilesTitle: "6 Профилей в Один Клик",
      a11yTitle: "Комплект Доступности (WCAG AA)",
      accessIntro:
        "Кастомизация логина следует модели контроля доступа на основе ролей SCRIPE. Открытие Студии Кастомизации требует разрешения branding.manage. Системные администраторы и администраторы тенантов с соответствующим разрешением могут редактировать и публиковать. Обычные администраторы могут только переключать личные предпочтения (светлый/тёмный режим). Активация безопасного режима ограничена только системными администраторами.",
      accessTitle: "Контроль Доступа",
      archIntro:
        "Кастомизатор Логина следует стандартной модульной чистой архитектуре SCRIPE с уровнями домена, данных и представления. Уровень представления содержит компонент StylePanel (UI конфигурации), LoginPreviewShell (управление iframe), AccessibilityPanel (настройки и профили WCAG) и хук useLoginBrandingTokens (пайплайн токен-в-CSS). Компоненты извлечены на уровень модуля для предотвращения проблем потери фокуса при ре-рендерах React.",
      archTip:
        "Компоненты BgControls и PresetDots намеренно определены на уровне модуля (не inline), чтобы предотвратить размонтирование/ремонтирование полей ввода React при ре-рендерах, что вызвало бы потерю фокуса при каждом нажатии клавиши.",
      archTitle: "Архитектура Модуля",
      bgOverlayIntro:
        "Элементы управления фоном и наложением адаптируются в зависимости от выбранного типа макета. Полностраничные макеты применяют фоны и наложения к контейнеру-обёртке, а разделённые макеты ограничивают фоны панелью бренда с независимыми наложениями секции формы. Управление наложением включает цвет, прозрачность (0–100%) и размытие (0–20px).",
      bgOverlayTitle: "Управление Фоном и Наложением",
      bgOverlayWarning:
        "Для разделённых макетов наложение ограничено секцией формы и панелью бренда независимо. CSS-переменные со значением 0 (напр. прозрачность) корректно выпускаются — система использует проверки != null вместо проверок на истинность для предотвращения удаления валидных нулевых значений.",
      brandingIntro:
        "Панель Бренда (видна в разделённых макетах) предоставляет выделенные элементы управления для брендовой стороны страницы входа. Поддерживает пользовательский логотип, название компании, текст заголовка, подзаголовок и независимые элементы управления фоном/наложением. Наложение панели бренда использует собственный набор CSS-переменных (--login-panel-overlay-*) для гранулярного управления отдельно от секции формы.",
      brandingTitle: "Панель Бренда",
      description:
        "Визуальная настройка страницы входа с 22 макетами, дизайн-токенами, управлением наложением/размытием, светлой/тёмной темами, комплектом доступности WCAG AA и изолированным предпросмотром в реальном времени — без единой строки кода.",
      draftIntro:
        "Студия реализует безопасный рабочий процесс Черновик → Предпросмотр → Публикация с оптимистичным контролем конкурентности. Все изменения сохраняются как черновики (DraftBrandingJson) до явной публикации администратором. Публикация инкрементирует счётчик SettingsVersion — конкурентные публикации от других администраторов отклоняются с конфликтом 409. Любая ранее опубликованная версия может быть откачена из снимков журнала аудита.",
      draftNote:
        "Оптимистичный контроль конкурентности предотвращает потерю данных при одновременном редактировании. Если другой администратор опубликует во время вашего редактирования, ваша публикация будет отклонена (409), и вам нужно будет обновить и объединить ваши изменения.",
      draftTitle: "Черновик / Публикация / Откат",
      intro:
        "Студия Кастомизации Логина SCRIPE — это мощный визуальный редактор, позволяющий администраторам тенантов полностью настраивать страницу входа без написания кода. Студия предоставляет разделённый интерфейс с панелями конфигурации слева и изолированным iframe-предпросмотром справа для визуальной обратной связи в реальном времени. Студия включает 8 вкладок конфигурации: Внешний вид, Цвета, Типографика, Фон, Наложение, Панель бренда, Доступность и Расширенные. Все изменения основаны на черновиках, требующих явной публикации перед выходом в продакшен.",
      layoutsIntro:
        "SCRIPE поставляется с 22 готовыми к продакшену макетами входа в четырёх уровнях: T1 разделённые макеты (6) имеют выделенную панель бренда рядом с формой входа, T2 полностраничные макеты (8) используют весь viewport для иммерсивного входа, T3 центрированные макеты (4) предлагают компактные дизайны на основе карточек, T4 специальные макеты (4) предоставляют кинематографические и художественные обработки. Каждый макет поддерживает независимые настройки фона, наложения и доступности.",
      layoutsNote:
        "Разделённые макеты отображают компонент LoginBranding с независимым управлением наложением/размытием на панели бренда. Полностраничные макеты применяют фон и наложение ко всему контейнеру. Центрированные и специальные макеты имеют собственные стратегии рендеринга. Переключение макетов сохраняет всю конфигурацию — меняется только структура рендеринга.",
      layoutsTitle: "22 Макета Входа",
      relatedBuilder:
        "Login Page Builder — Drag-and-drop visual canvas for building custom login page layouts with 14 component types.",
      relatedIntro:
        "The Login Customizer Studio is part of a larger customization ecosystem. See these companion features for complete coverage:",
      relatedMarketplace:
        "Theme Marketplace — Browse, preview, and apply 40 premium branding packages with per-page overrides.",
      relatedMultiPage:
        "Multi-Page Branding — Configure independent branding for Login, Forgot Password, and Reset Password pages.",
      relatedTitle: "Related Features",
      safeModeIntro:
        "Безопасный Режим — это аварийный механизм отката, который обходит все настройки бренда тенанта и восстанавливает значения по умолчанию платформы для страницы входа. Когда IsSafeMode установлен в true в TenantSettings, страница входа отображается с темой SCRIPE по умолчанию независимо от любой кастомизации. Это гарантирует рабочий вход даже при повреждении конфигурации бренда.",
      safeModeTitle: "Безопасный Режим",
      studioIntro:
        "Студия использует архитектуру с разделёнными панелями: левая панель содержит 8 вкладок конфигурации (Внешний вид, Цвета, Типографика, Фон, Наложение, Панель бренда, Доступность, Расширенные), а правая панель предоставляет изолированный iframe, отображающий страницу входа с живой инъекцией CSS-переменных через postMessage. Переключатели устройств позволяют предпросмотр на брейкпоинтах десктопа, планшета и мобильного.",
      studioTip:
        "Все изменения в студии работают в режиме черновика. Рабочая страница входа никогда не затрагивается, пока вы явно не нажмёте Опубликовать. Вы можете безопасно экспериментировать с любой комбинацией настроек.",
      studioTitle: "Обзор Студии",
      themeIntro:
        "Кастомизатор Логина поддерживает независимые конфигурации для светлого и тёмного режимов. При включении тёмного режима выпускается отдельный набор CSS-переменных для тёмной панели (--login-dark-*), управляющий фоном формы, цветом текста, стилем полей и наложением. Переключатель тёмного режима во вкладке Внешний вид обеспечивает полный контроль над тёмной темой без влияния на светлую конфигурацию.",
      themeTitle: "Архитектура Светлой/Тёмной Темы",
      title: "Студия Кастомизации Логина",
      tokensIntro:
        "Система кастомизации построена на комплексном пайплайне дизайн-токенов. Настройки тенанта, хранящиеся в JSON, преобразуются в семантические дизайн-токены, которые затем выпускаются как CSS-переменные и инъецируются в живой DOM. Эта архитектура обеспечивает консистентное, типобезопасное стилевое оформление по всем 22 макетам, включая 23+ CSS-правил, специфичных для доступности.",
      tokensTitle: "Пайплайн Дизайн-Токенов",
    },
    loginPageBuilder: {
      archIntro:
        "The Login Page Builder follows SCRIPE's standard modular clean architecture. The builder/ directory contains: BuilderCanvas.tsx (main canvas), ComponentPalette.tsx (sidebar palette), PropertiesPanel.tsx (property editor), GridOverlay.tsx (grid visualization), and BuilderToolbar.tsx (mode switcher, undo/redo, zoom controls). State management uses the useBuilderState hook integrated into useStudioViewModel.",
      archTip:
        "The builder components are intentionally defined as stable, memoized React components to prevent re-renders during drag operations. Each canvas component is wrapped in React.memo with custom equality checks on position and properties.",
      archTitle: "Module Architecture",
      bundleComponentsIntro:
        "BundleGalleryTab (5.6KB) — Gallery tab with type filters (Login, Dashboard, Complete), search, grid, pagination. BundleCard (12.8KB) — Card with accent preview, pricing tier, metadata. BundleDetailModal (8.5KB) — Full detail with apply button. SaveBundleDialog (7.6KB) — Dialog for saving current studio state as a new bundle.",
      bundleComponentsTitle: "Bundle Components",
      bundleIntro:
        "The Bundle Marketplace allows tenants to save their complete studio configuration (login theme + builder layout + dashboard settings + per-page overrides) as a named bundle, and browse/apply bundles created by other tenants or the system. Bundles are displayed in a dedicated tab within the Theme Gallery.",
      bundleTitle: "Bundle Marketplace (Related Feature)",
      bundleTypesIntro:
        "Login Bundle — Contains only login branding (theme tokens + builder layout). Dashboard Bundle — Contains only dashboard settings. Complete Bundle — Contains everything: login branding, builder layout, per-page overrides, dashboard settings, and accessibility configuration. Complete bundles provide one-click full-workspace setup.",
      bundleTypesTitle: "Bundle Types",
      compBadge:
        "Badge — Small label/tag element. Properties: text, variant (default, success, warning, destructive), size.",
      compButton:
        "Button — Clickable action button. Properties: text, variant (primary, secondary, outline, ghost), size, width (auto, full), icon, link URL, border radius.",
      compCard:
        "Card — Container with background, border, and shadow. Properties: background color, border radius, shadow, padding. Can contain other components (nested layout).",
      compDivider:
        "Divider — Visual separator line. Properties: color, thickness, width, margin, style (solid, dashed, dotted, gradient).",
      compFooter:
        "Footer — Page footer with links and copyright text. Properties: links array, copyright text, alignment, font size, color.",
      compForm:
        "Form — The login form component containing email/password inputs and submit button. Properties: show labels, show placeholders, input style, button text, remember me checkbox, forgot password link.",
      compHeading:
        "Heading — Large display text for page titles and headlines. Properties: text content, font size, font weight, color, alignment, HTML tag (h1–h6). Supports dynamic variables ({tenantName}).",
      compIcon:
        "Icon — SVG icon from the built-in icon library. Properties: icon name, size, color, rotation, link URL.",
      compImage:
        "Image — Display any image on the canvas. Properties: src (URL), alt text, width, height, object-fit, border radius, shadow. Supports all web image formats.",
      compLogo:
        "Logo — Displays the tenant's logo image. Properties: src (URL), alt text, width, height, alignment, link URL. Supports SVG, PNG, and WebP formats.",
      compSocialLogin:
        "Social Login — Pre-built social authentication buttons (Google, Microsoft, Apple, GitHub). Properties: providers (multi-select), layout (horizontal, vertical, icon-only), separator text.",
      compSpacer:
        "Spacer — Invisible spacing element. Properties: height (in px). Used to create vertical gaps between components without manual positioning.",
      compTermsLink:
        "Terms & Privacy — Pre-built links to Terms of Service and Privacy Policy pages. Properties: terms URL, privacy URL, text template, font size, color.",
      compText:
        "Text — General-purpose paragraph text. Properties: content, font size, color, line height, alignment, max width. Supports rich text with bold, italic, and links.",
      dashboardColorsIntro:
        "Default, Zinc, Slate, Stone, Neutral, Red, Rose, Orange, Green, Blue, Violet, and Yellow. Each color theme defines the dashboard's accent color palette applied to the sidebar, headers, buttons, and active states.",
      dashboardColorsTitle: "12 Color Themes",
      dashboardIntro:
        "The Dashboard Theming panel in the Customizer Studio allows tenants to configure their admin dashboard's visual defaults. Settings include layout template (8 options), color theme (12 options), theme mode (light/dark/system), default language, and sidebar default state. Dashboard theming uses the same draft/publish workflow as login branding.",
      dashboardLayoutsIntro:
        "Default, Navigation, Classic, Compact, Elegant, Floating, Modern, and Minimal. Each template defines the dashboard shell structure: sidebar position, header style, content width, and navigation pattern.",
      dashboardLayoutsTitle: "8 Layout Templates",
      dashboardStorageIntro:
        "Dashboard settings are stored in the dashboardThemeJson field of DraftBrandingJson as a JSON object: { layoutTemplate, colorTheme, mode, language, sidebarDefaultState }. On publish, the settings are promoted to the tenant's live configuration.",
      dashboardStorageTitle: "Storage Format",
      dashboardTitle: "Dashboard Theming (Related Feature)",
      description:
        "No-code drag-and-drop visual canvas with 3 design modes (Freeform, Grid, Builder), 14 component types, a 12-column responsive grid system, real-time preview sync, and JSON serialization.",
      dndIntro:
        "The builder uses @dnd-kit/core (not react-beautiful-dnd) for drag-and-drop interactions. Components are dragged from the palette sidebar and dropped onto the canvas. The DragOverlay renders a ghost preview of the component during drag. Drop zones are highlighted with blue outlines when a draggable component hovers over them.",
      dndPaletteIntro:
        "1. User drags a component type from the palette sidebar. 2. @dnd-kit creates a DragOverlay with a preview of the component. 3. The canvas renders drop zone indicators (grid cells in Grid mode, free areas in Freeform mode). 4. On drop, a new component instance is created with default properties and added to the builder state. 5. The component is rendered on the canvas at the drop position.",
      dndPaletteTitle: "Palette → Canvas Flow",
      dndReorderIntro:
        "Existing components on the canvas can be reordered by dragging. In Grid mode, components snap to grid cells. In Builder mode, components reorder within their section (header/body/footer). In Freeform mode, components move to the exact drop coordinates.",
      dndReorderTitle: "Canvas Reordering",
      dndSelectIntro:
        "Clicking a component on the canvas selects it, displaying a blue selection border and resize handles. The Properties Panel on the right sidebar loads the selected component's editable properties. Pressing Delete/Backspace removes the selected component. Escape deselects.",
      dndSelectTitle: "Component Selection",
      dndTitle: "Drag-and-Drop Architecture",
      gridGapIntro:
        "The grid gap (spacing between cells) is configurable globally: columnGap and rowGap properties, each accepting pixel values (default: 16px). This ensures consistent spacing across all grid items without manual padding on individual components.",
      gridGapTitle: "Gap Configuration",
      gridIntro:
        "The Grid Mode uses a responsive 12-column CSS grid layout. Each component occupies a configurable number of columns (1–12) and rows. The grid supports gap spacing, column alignment (start, center, end, stretch), and row alignment. The grid is fully responsive — column spans can be configured independently for desktop (lg), tablet (md), and mobile (sm) breakpoints.",
      gridPropsIntro:
        "Each component in Grid mode has additional grid-specific properties: colSpan (1–12 columns), rowSpan (number of rows), colStart (starting column), rowStart (starting row), alignment (start/center/end/stretch), and responsive overrides (sm/md/lg column spans). These properties are configured via the Properties Panel.",
      gridPropsTitle: "Grid Component Properties",
      gridResponsiveIntro:
        "The grid supports 3 breakpoints: Desktop (lg, ≥1024px), Tablet (md, 768–1023px), and Mobile (sm, <768px). Each component can have independent column spans per breakpoint. For example, a logo might span 4 columns on desktop but 12 columns (full width) on mobile. The preview iframe respects these breakpoints when device toggles are used.",
      gridResponsiveTitle: "Responsive Breakpoints",
      gridTitle: "12-Column Grid System",
      intro:
        "The Login Page Builder is SCRIPE's most advanced customization tool — a fully visual, drag-and-drop canvas that allows tenant administrators to build custom login page layouts without writing any code. The builder provides 3 design modes (Freeform, Grid, and Builder), a palette of 14 pre-built component types (from logos and headings to social login buttons and footer links), a responsive 12-column CSS grid system, real-time two-way sync with the preview iframe, and full JSON serialization for persistence. The builder integrates seamlessly with the Login Customizer Studio's design token pipeline, ensuring that builder-created layouts inherit all theme colors, typography, and accessibility settings.",
      modeBuilderIntro:
        "Structured block-based layout with predefined sections. Components are organized into vertical sections (header, body, footer) with automatic stacking and reordering via drag-and-drop. Best for quick layout assembly with predictable, clean results. Builder mode enforces structural constraints — components snap to section boundaries and maintain consistent spacing.",
      modeBuilderTitle: "Builder Mode",
      modeFreeformIntro:
        "Absolute positioning with pixel-level control. Components can be placed anywhere on the canvas and dragged to exact coordinates. Best for creative, non-standard layouts where design freedom is paramount. Components have x/y position, width, height, and z-index properties.",
      modeFreeformTitle: "Freeform Mode",
      modeGridIntro:
        "Responsive 12-column CSS grid layout. Components are placed into grid cells with configurable column span (1–12), row positioning, alignment, and gap spacing. The grid ensures consistent, responsive layouts that adapt to desktop, tablet, and mobile breakpoints. This is the recommended mode for enterprise deployments where cross-device consistency is critical.",
      modeGridTitle: "Grid Mode (12-Column)",
      modesIntro:
        "The builder offers three distinct canvas modes, each providing a different level of control over layout positioning. Users can switch between modes at any time — components are preserved during mode switches.",
      modesNote:
        "Grid mode is the default for new configurations. It provides the best balance between design flexibility and responsive consistency. Freeform mode is intended for advanced users who need pixel-perfect control.",
      modesTitle: "3 Canvas Modes",
      paletteIntro:
        "The component palette provides 14 pre-built, configurable UI components that can be dragged onto the canvas. Each component has a set of editable properties (text content, styling, behavior) accessible via the Properties Panel when selected.",
      paletteTitle: "14 Component Types",
      previewIntro:
        "Every canvas change is immediately reflected in the sandboxed preview iframe. The builder emits postMessage events containing the current component array and canvas mode. The preview page receives these events, reconstructs the layout, and renders the components with live CSS variable injection from the active theme.",
      previewSyncIntro:
        "The sync is bidirectional: canvas changes propagate to preview (via postMessage), and device toggle changes in the preview header propagate back to the builder (updating responsive breakpoint indicators). This ensures the builder canvas accurately reflects how the layout will appear at each breakpoint.",
      previewSyncTitle: "Two-Way Sync",
      previewTitle: "Real-Time Preview Sync",
      propsContentIntro:
        "Text inputs for content: headline text, paragraph text, button labels, URLs, alt text. Supports variable interpolation with {variableName} syntax for dynamic tenant data.",
      propsContentTitle: "Content Properties",
      propsGridIntro:
        "Grid-specific layout controls (Grid mode only): column span slider (1–12), row span, column start, row start, alignment select, and responsive breakpoint overrides. A visual grid preview shows the component's position within the 12-column grid.",
      propsGridTitle: "Grid Properties",
      propsIntro:
        "The Properties Panel is a contextual sidebar that appears when a component is selected on the canvas. It displays all editable properties for the selected component type, organized into sections: Content (text, URLs), Layout (width, height, alignment), Style (colors, borders, shadows), and Grid (column span, row span, responsive breakpoints). Changes in the Properties Panel update the canvas in real-time.",
      propsStyleIntro:
        "Visual styling controls: color pickers, border radius sliders, shadow toggles, opacity controls, font size selectors. Style properties that overlap with theme tokens (e.g., primaryColor) can be set to 'inherit from theme' to maintain consistency.",
      propsStyleTitle: "Style Properties",
      propsTitle: "Properties Panel",
      securityIframeIntro:
        "The preview iframe uses the sandbox attribute with restricted permissions: allow-scripts (for CSS variable injection), allow-same-origin (for postMessage). Forms are non-functional — the preview renders visual-only representations of auth components.",
      securityIframeTitle: "Iframe Sandboxing",
      securityIntro:
        "The Login Page Builder enforces strict security constraints on user-generated content. All text content is HTML-sanitized before rendering (no script injection). Image URLs are validated to prevent SSRF. The builder canvas runs in a sandboxed iframe with restrictive CSP headers. Custom CSS injection is not supported — styling is controlled exclusively through the design token pipeline.",
      securitySanitizeIntro:
        "All text properties (headings, paragraphs, button labels) are sanitized using DOMPurify before rendering in the preview. HTML tags are stripped — only plain text is stored. URLs are validated against a whitelist of allowed protocols (https, http) to prevent javascript: and data: injection.",
      securitySanitizeTitle: "Input Sanitization",
      securityTitle: "Security Constraints",
      serializationIntro:
        "The builder state is serialized as a JSON array and stored in the builderComponentsJson field of the tenant's DraftBrandingJson. The canvasMode (freeform/grid/builder) is stored as a separate field. On publish, the builder state is promoted to LiveBrandingJson alongside all other branding tokens.",
      serializationSchemaIntro:
        "The stored JSON follows this structure: { canvasMode: 'freeform' | 'grid' | 'builder', gridConfig: { columns: 12, columnGap: 16, rowGap: 16 }, components: [ { id, type, props, position, gridPosition, section, order, responsive } ] }. The schema is versioned for forward compatibility.",
      serializationSchemaTitle: "Serialized Schema",
      serializationSizeIntro:
        "Default property values are NOT stored — only properties that differ from the component type's defaults are serialized. This keeps the JSON payload compact (typically 2–5KB for a complex layout with 10+ components).",
      serializationSizeTitle: "Storage Optimization",
      serializationTitle: "JSON Serialization & Persistence",
      stateComponentIntro:
        "Each BuilderComponent is a serializable object: { id: string, type: ComponentType, props: Record<string, unknown>, position: { x: number, y: number }, gridPosition: { colSpan: number, rowSpan: number, colStart: number, rowStart: number }, section: 'header' | 'body' | 'footer', order: number, responsive: { sm: GridOverride, md: GridOverride } }.",
      stateComponentTitle: "BuilderComponent Schema",
      stateIntro:
        "The builder maintains a flat array of BuilderComponent objects in the StudioDraft. Each component has: id (unique UUID), type (one of 14 types), properties (key-value map), position (x, y for Freeform), gridPosition (col, row, colSpan, rowSpan for Grid), and section (header/body/footer for Builder mode). The entire array is serialized as JSON in the builderComponentsJson field of DraftBrandingJson.",
      stateTitle: "Canvas State Management",
      stateUndoIntro:
        "The builder maintains a history stack for undo/redo operations. Each action (add, move, resize, delete, property change) pushes a snapshot to the stack. Ctrl+Z undoes the last action, Ctrl+Shift+Z redoes. The history stack has a configurable depth limit (default: 50 actions).",
      stateUndoTitle: "Undo/Redo Support",
      title: "Login Page Builder",
    },
    menuSystem: {
      architectureIntro:
        "Использует самоссылающуюся древовидную структуру (ParentMenuItemId), проходящую через конвейер из 6 фильтров безопасности.",
      architectureTitle: "Архитектура меню",
      description:
        "Динамическое дерево меню с фильтрацией прав, ограничением по тенантам, видимостью ролей и сортировкой Drag & Drop.",
      endpointsTitle: "API-эндпоинты меню",
      entityTitle: "Сущность MenuItem",
      filteringIntro:
        "Обеспечивает отображение только тех пунктов меню, к которым у пользователя есть доступ.",
      filteringTitle: "Конвейер фильтрации меню",
      overrideNote: "Пользовательские переопределения имеют приоритет над настройками тенанта.",
      overrideTitle: "Система переопределений (Override)",
      reorderTitle: "Сортировка Drag-and-Drop",
      title: "Система меню (Menu System)",
    },
    messageTemplates: {
      architectureIntro:
        "Централизованное управление контентом email, уведомлений и webhook. Движок Scriban (похож на Liquid) поддерживает циклы, переменные и условия.",
      architectureTitle: "Архитектура шаблонов",
      builtInTitle: "Встроенные шаблоны",
      description:
        "Двуязычные шаблоны на основе Scriban для email и уведомлений, с предварительным просмотром.",
      endpointsTitle: "API-эндпоинты шаблонов",
      entityTitle: "Сущность MessageTemplate",
      previewIntro:
        "Рендеринг шаблона с фиктивными данными для визуальной проверки форматирования перед реальной отправкой.",
      previewTitle: "Функция предпросмотра (Preview)",
      rendererTitle: "Рендерер шаблонов",
      syntaxTitle: "Синтаксис шаблонов Scriban",
      title: "Шаблоны сообщений",
    },
    multiPageBranding: {
      conflictIntro:
        "Multi-Page Branding includes safeguards to prevent visual inconsistency. When the global design changes (e.g., a new font family), all pages that inherit from the global automatically update — only explicitly overridden tokens remain unchanged. The studio displays a 'Customized' badge on page tabs that have overrides, making it clear which pages have independent configurations.",
      conflictTitle: "Conflict Prevention & Consistency",
      conflictWarning:
        "When a global token is changed (e.g., primaryColor), pages with overrides that include the same token will NOT update — the override takes precedence. This is intentional. To propagate a global change to overridden pages, use the 'Reset to Global' action on those pages first.",
      description:
        "Independent visual customization for Login, Forgot Password, and Reset Password pages — shared design tokens with per-page overrides, isolated preview, and theme integration.",
      intro:
        "Multi-Page Branding extends SCRIPE's Login Customizer Studio to support independent visual configurations for all three authentication pages: Login, Forgot Password, and Reset Password. Instead of forcing a single visual identity across all auth flows, Multi-Page Branding allows tenants to present context-appropriate messaging, layouts, and visual treatments for each page. A shared global design provides consistency, while per-page overrides enable targeted differentiation — all managed through the same zero-code studio interface.",
      pageForgot:
        "Forgot Password Page — The password recovery entry point. Users enter their email to receive a reset link. This page benefits from reassuring messaging ('We'll help you get back in') and softer visual treatments that convey trust and care.",
      pageLogin:
        "Login Page — The primary authentication entry point. Users enter their credentials (email + password) to access the platform. This page receives the most visual attention as it creates the first impression of the tenant's brand.",
      pageReset:
        "Reset Password Page — The password change confirmation page. Users set a new password using the link from their email. This page benefits from action-oriented messaging ('Create your new password') and clear, focused layouts that minimize distraction.",
      pagesIntro:
        "SCRIPE's authentication system exposes three distinct pages, each serving a different user intent. Multi-Page Branding allows independent customization of all three while maintaining visual consistency through shared design tokens.",
      pagesNote:
        "Each page can independently configure: layout, headline, subtitle, background, overlay, and any design token. Tokens not explicitly overridden inherit from the global configuration — enabling 'configure once, override selectively' workflow.",
      pagesTitle: "Supported Authentication Pages",
      previewIntro:
        "Each auth page is previewed in the same sandboxed iframe used by the Login Customizer Studio. When the user switches to a different page tab, the preview URL changes to the corresponding auth route, and new CSS variables (merged from global + page override) are injected via postMessage. The preview supports desktop, tablet, and mobile breakpoints for all three pages.",
      previewIsolationIntro:
        "The preview iframe runs in a completely isolated context — separate from the admin panel's authentication state. This prevents the preview from triggering real login/logout actions. The preview pages are purpose-built components that render the auth UI with injected CSS variables but no authentication logic.",
      previewIsolationTitle: "Preview Isolation",
      previewTitle: "Sandboxed Preview Architecture",
      serializationIntro:
        "Per-page overrides are stored in the tenant's DraftBrandingJson alongside the global configuration. The JSON structure contains a top-level 'pageOverrides' object with 'login', 'forgotPassword', and 'resetPassword' keys. Each key maps to a flat token object. On publish, the entire structure (global + pageOverrides) is promoted to LiveBrandingJson.",
      serializationSchemaIntro:
        "The DraftBrandingJson stores: { selectedLayout, primaryColor, ...(all global tokens), pageOverrides: { login: { panelHeadline, panelSubtitle, ... }, forgotPassword: { selectedLayout, panelHeadline, overlayColor, ... }, resetPassword: { selectedLayout, panelHeadline, ... } } }. Only non-null override tokens are persisted — empty pages are not stored to save space.",
      serializationSchemaTitle: "Stored JSON Schema",
      serializationTitle: "Data Serialization & Persistence",
      sourceComponents:
        "Components: AuthPageTabs.tsx (tab strip), StylePanel.tsx (sidebar with per-page routing)",
      sourceSeeder:
        "Backend: LoginThemeSeeder.cs (PageOverrideDesign records, BuildFullThemeJson pages serialization)",
      sourceStudio: "Studio: useStudioViewModel.ts (page state, merge logic, previewTheme())",
      sourceTitle: "Source File Reference",
      sourceTypes:
        "Types: StudioDraft.ts (pageOverrides interface), ThemeTypes.ts (page override type definitions)",
      stateGlobalIntro:
        "The global layer contains all 50+ design tokens: colors, typography, spacing, overlay, dark mode, and branding panel settings. These tokens apply to ALL auth pages by default. The global layer is always defined — it is never empty.",
      stateGlobalTitle: "Global Layer (Shared Tokens)",
      stateIntro:
        "Multi-Page Branding uses a layered state model. The global StudioDraft contains the base configuration for all pages. Each page has an optional override object (pageOverrides.login, pageOverrides.forgotPassword, pageOverrides.resetPassword) that stores only the tokens that differ from the global. This minimizes storage and simplifies diff tracking.",
      stateMergeIntro:
        "When the studio switches to a specific page tab, the effective configuration is computed as: effectiveConfig = { ...globalDraft, ...pageOverrides[currentPage] }. This spread-merge ensures that page-specific overrides take precedence while all unspecified tokens fall through to the global values. The merge is performed in the previewTheme() function and in the CSS token emission pipeline.",
      stateMergeNote:
        "The merge is a shallow spread — nested objects (like darkColors or overlay) are replaced entirely, not deep-merged. This is intentional: if a page overrides the overlay, it should control the complete overlay configuration, not inherit partial values from the global.",
      stateMergeTitle: "Runtime Merge Strategy",
      stateOverrideIntro:
        "Each page's override layer contains ONLY the tokens that differ from the global configuration. For example, if the Forgot Password page has a different headline and subtitle but shares all colors and typography, only panelHeadline and panelSubtitle are stored in the override. Empty fields inherit from the global layer.",
      stateOverrideTitle: "Page Override Layer (Per-Page Tokens)",
      stateTitle: "State Isolation Model",
      studioEditIntro:
        "When a user modifies a setting while a non-login page is active (e.g., Forgot Password), the change is saved to pageOverrides.forgotPassword — not to the global draft. The studio tracks which page is active and routes edits accordingly. This ensures that changing the forgot-password headline does not affect the login page's headline.",
      studioEditTitle: "Per-Page Editing",
      studioIntro:
        "The Customizer Studio sidebar includes a page tab strip (AuthPageTabs component) that allows switching between Login, Forgot Password, and Reset Password. When the active tab changes, the studio loads the corresponding page override (if any) and merges it with the global draft for preview. The preview iframe navigates to the selected auth page route.",
      studioResetIntro:
        "Each page tab includes a 'Reset to Global' action that removes all per-page overrides for that page, reverting it to the global configuration. This is useful when a tenant wants to undo page-specific customizations and restore visual consistency across all auth pages.",
      studioResetTitle: "Reset to Global",
      studioSwitchIntro:
        "When a user switches tabs: 1. The activePage state is updated to 'login', 'forgotPassword', or 'resetPassword'. 2. The sidebar panels reload with merged values (global + page override). 3. The preview iframe receives an updated postMessage with the merged CSS variables. 4. The iframe URL changes to the corresponding auth route (e.g., /login-preview, /forgot-password-preview, /reset-password-preview). 5. Any changes made in the sidebar are saved to the page override, not the global draft.",
      studioSwitchTitle: "Tab Switching Flow",
      studioTabsIntro:
        "The AuthPageTabs component renders a horizontal tab bar with 3 tabs (Login, Forgot Password, Reset Password). Each tab displays the page name and an optional 'Customized' badge if per-page overrides exist. Clicking a tab updates the activePage state in the studio, triggers a preview refresh, and loads the page-specific sidebar panel settings.",
      studioTabsTitle: "AuthPageTabs Component",
      studioTitle: "Studio Integration — Page Tabs",
      themeCompatIntro:
        "Themes without a 'pages' block are fully backward-compatible. The absence of page overrides means all three auth pages use the global design — the same behavior as themes created before the Multi-Page Branding feature. No migration is required for existing themes.",
      themeCompatTitle: "Backward Compatibility",
      themeImportIntro:
        "The previewTheme() function checks for the 'pages' key in the theme's ThemeDataJson. If found, it extracts the forgotPassword and resetPassword objects and stores them as pageOverrides. If the theme does not include page overrides, the existing pageOverrides are preserved (or cleared, depending on the apply mode).",
      themeImportTitle: "Page Override Import",
      themeIntro:
        "When a marketplace theme includes per-page overrides (pages.forgotPassword, pages.resetPassword), the previewTheme() function in useStudioViewModel.ts automatically imports those overrides into the studio's pageOverrides state. This means applying a theme with per-page branding instantly populates all three auth pages with the theme's intended visual treatment.",
      themeTitle: "Theme Marketplace Integration",
      title: "Multi-Page Branding",
    },
    multiTenancy: {
      architectureTitle: "Архитектура",
      auditGroup: "Конфигурация аудита",
      autoRoleIntro:
        "При создании нового тенанта автоматически создаются роли Super Admin и Default.",
      autoRoleTitle: "Автоматическое создание ролей",
      brandingGroup: "Брендирование",
      cascadeDeleteIntro:
        "Специальный эндпоинт позволяет подсчитать всех потомков, которые будут затронуты удалением.",
      cascadeDeleteTitle: "Защита от каскадного удаления",
      description:
        "Изоляция данных на уровне строк, иерархия тенантов, настройки каждого тенанта и брендирование.",
      domainArchIntro:
        "При поступлении запроса система определяет арендатора, выполняя поиск имени хоста в таблице TenantDomain. Автоматически сгенерированные домены (например sofa.scripe.com) всегда верифицированы и разрешаются мгновенно. Пользовательские домены должны сначала пройти DNS-верификацию. Резервный механизм с параметром запроса ?code= доступен для сред разработки, где DNS не настроен.",
      domainArchTitle: "Архитектура разрешения доменов",
      domainConfigIntro:
        "Каждое значение, связанное с доменами, настраивается через секцию Tenancy в appsettings.json. Это означает, что вы можете полностью провести ребрендинг платформы — изменить базовый домен, цель CNAME, префикс верификации и префикс токена — отредактировав один блок конфигурации. Изменений кода не требуется. Бэкенд инжектирует TenancySettings через IOptions<T>, а фронтенд получает цель CNAME и префикс верификации из ответа API GET /domains.",
      domainConfigTip:
        "Для развёртывания на совершенно другом домене (например myplatform.io вместо scripe.com) просто обновите 4 значения в appsettings.json. Все автоматически сгенерированные поддомены, DNS-инструкции и токены верификации автоматически будут использовать новые значения.",
      domainConfigTitle: "Настраиваемый домен платформы",
      domainDnsIntro:
        "Пользовательские домены требуют DNS-верификации для подтверждения владения. Когда администратор добавляет пользовательский домен, система генерирует уникальный токен верификации. Затем администратор настраивает две DNS-записи: запись CNAME, указывающую домен на CnameTarget платформы, и запись TXT на {VerificationPrefix}.{domain}, содержащую токен верификации. После настройки нажатие кнопки 'Проверить' запускает DNS-запрос для подтверждения наличия обеих записей.",
      domainDnsNote:
        "DNS-верификация в настоящее время является процессом, управляемым через UI, где администратор нажимает 'Проверить' для запуска проверки. Бэкенд-заглушка готова к полной интеграции DNS-разрешения. Автоматически сгенерированные домены полностью пропускают верификацию — они всегда доверены.",
      domainDnsTitle: "Процесс DNS-верификации",
      domainEndpointsTitle: "API-эндпоинты доменов",
      domainIntro:
        "Каждый арендатор может иметь несколько доменов — один автоматически сгенерированный поддомен, создаваемый при создании арендатора, плюс необязательные пользовательские домены, добавляемые администраторами. Система поддерживает верификацию домена на основе DNS для подтверждения владения пользовательскими доменами перед их активацией. Вся конфигурация, связанная с доменами, полностью вынесена в appsettings.json, что обеспечивает гибкий ребрендинг и настройки мульти-развёртывания.",
      domainTitle: "Управление доменами",
      domainTypesTitle: "Типы доменов",
      endpointsCrudTitle: "CRUD эндпоинты",
      endpointsDrilldownTitle: "Эндпоинты детализации (Drill-Down)",
      endpointsHierarchyTitle: "Эндпоинты иерархии",
      endpointsPermissionsTitle: "Эндпоинты прав",
      endpointsSettingsTitle: "Эндпоинты настроек",
      endpointsTitle: "API-эндпоинты тенантов",
      featureBranding: "Брендирование",
      featureBrandingDesc:
        "Загрузка логотипов тенанта, настройка основных цветов и названия компании.",
      featureDataScoping: "Скоупинг данных",
      featureDataScopingDesc:
        "Все бизнес-данные автоматически ограничиваются текущим тенантом без риска утечек.",
      featureIsolation: "Изоляция данных",
      featureIsolationDesc:
        "Изоляция на уровне строк: к каждому запросу автоматически добавляется условие WHERE TenantId = @CurrentTenant.",
      featureRoleScoping: "Скоупинг ролей",
      featureRoleScopingDesc: "Роли создаются и действуют в рамках конкретного тенанта.",
      featureSettings: "Настройки тенанта",
      featureSettingsDesc:
        "Независимая конфигурация: квоты, политики безопасности, настройки аудита и брендирование.",
      featuresTitle: "Возможности тенанта",
      featureUserScoping: "Скоупинг пользователей",
      featureUserScopingDesc:
        "Администраторы тенанта могут видеть и управлять только своими пользователями.",
      hierarchyIntro:
        "Тенанты формируют древовидную структуру (ParentTenantId), что позволяет создавать филиалы и дочерние компании.",
      hierarchyTitle: "Иерархия тенантов",
      intro:
        "SCRIPE поддерживает полную мультитенантность с изоляцией данных на уровне строк с использованием глобальных фильтров запросов EF Core.",
      logoTip:
        "Логотипы раздаются через middleware статических файлов по пути /storage/tenants/{tenantId}/logo.{ext}.",
      permissionInheritanceIntro:
        "При создании дочернего тенанта родитель может передать только те права, которыми обладает сам.",
      permissionInheritanceTitle: "Наследование прав (Permissions)",
      quotaGroup: "Настройки квот (Quotas)",
      securityGroup: "Политики безопасности",
      settingsIntro:
        "Каждый тенант имеет сущность TenantSettings 1:1 с 4 группами настроек. Значение -1 означает отсутствие ограничений.",
      settingsTitle: "Настройки тенанта (TenantSettings)",
      title: "Мультитенантность (Multi-Tenancy)",
    },
    notificationSystem: {
      architectureIntro:
        "Уведомления сохраняются в базу данных и одновременно отправляются (push) в браузер пользователя.",
      architectureTitle: "Архитектура уведомлений",
      autoJoinTitle: "Паттерн авто-подключения (Auto-Join)",
      clientInterfaceTitle: "Интерфейс клиента хаба",
      description:
        "Мгновенная доставка уведомлений через SignalR с авто-подключением к группам и отслеживанием непрочитанных.",
      endpointsTitle: "API-эндпоинты уведомлений",
      hubIntro: "Строго типизированный хаб SignalR для безопасной рассылки.",
      hubTitle: "NotificationHub",
      serviceTitle: "Методы NotificationService",
      title: "Система уведомлений",
    },
    recycleBin: {
      cascadeIntro:
        "При восстановлении родителя (например, тенанта) все дочерние сущности восстанавливаются массово через ExecuteUpdateAsync.",
      cascadeTitle: "Каскадное восстановление",
      description:
        "Управление мягким удалением (soft-delete) с каскадным восстановлением, массовыми операциями и полным уничтожением (purge).",
      endpointsTitle: "API-эндпоинты корзины",
      executeUpdateTitle: "ExecuteUpdateAsync против традиционного EF",
      ignoreFiltersTitle: "Паттерн IgnoreQueryFilters",
      ignoreFiltersWarning:
        "Обходит ВСЕ глобальные фильтры (включая фильтр тенанта). Обязательно добавляйте явный фильтр .Where() по тенанту для предотвращения утечек данных.",
      interceptorNote:
        "Этот сверхбыстрый подход обходит Change Tracker, поэтому записи аудита должны создаваться вручную в контроллере.",
      purgeVsRestoreTitle: "Полное удаление (Purge) vs Восстановление",
      purgeWarning:
        "Очистка (Purge) — это деструктивная, необратимая операция жесткого удаления (hard DELETE).",
      softDeleteIntro:
        "Устанавливается флаг IsDeleted=true, после чего запись скрывается глобальными фильтрами EF Core, но остается в БД.",
      softDeleteTitle: "Как работает мягкое удаление",
      title: "Корзина (Recycle Bin)",
    },
    rolePermissions: {
      authPipelineIntro:
        "Провайдер политик динамически генерирует политики ASP.NET Core из атрибутов.",
      authPipelineTitle: "Конвейер авторизации (Authorization Pipeline)",
      cloneRoleIntro:
        "При клонировании роли в новую включаются только те права, которые уже есть у создателя (администратора), предотвращая повышение привилегий.",
      cloneRoleTitle: "Клонирование роли (Анти-эскалация)",
      description:
        "Система RBAC с переопределением области видимости, ограничениями на уровне полей, защитой от эскалации привилегий и тенантными ролями.",
      endpointsMyTenantTitle: "Эндпоинты моего тенанта",
      endpointsPermissionsTitle: "Эндпоинты прав",
      endpointsTitle: "API-эндпоинты ролей",
      hierarchyTitle: "Иерархия прав",
      intro:
        "В SCRIPE реализована комплексная система управления доступом на основе ролей (RBAC) с кэшированием на сервере для мгновенного применения политик.",
      restrictedFieldsIntro:
        "Позволяет скрыть определенные поля сущностей (например, зарплату или СНИЛС) из ответов API для конкретной роли.",
      restrictedFieldsTitle: "Ограничения на уровне полей",
      rolePropertiesIntro:
        "Каждая роль имеет системные флаги, управляющие ее поведением (IsSuperAdmin, IsDefaultRole).",
      rolePropertiesTitle: "Свойства сущности Role",
      scopeOverrideIntro:
        "RolePermission может переопределять стандартную область видимости, тонко контролируя доступ к данным.",
      scopeOverrideTitle: "Переопределение области видимости (Scope Override)",
      systemIntro: "Права сгруппированы по категориям по шаблону: {ресурс}.{действие}.",
      systemTitle: "Система прав (Permissions)",
      tenantScopingNote: "Роли автоматически ограничиваются тенантом текущего пользователя.",
      title: "Роли и права (RBAC)",
      userGroupEndpointsTitle: "API-эндпоинты групп пользователей",
      userGroupsIntro:
        "Позволяют массово назначать роли и ограничения на уровне полей нескольким администраторам одновременно.",
      userGroupsNote:
        "Права групп суммируются (аддитивность): эффективные права администратора — это ОБЪЕДИНЕНИЕ (UNION) его прямых ролей и ролей группы.",
      userGroupsTitle: "Группы пользователей (User Groups)",
    },
    ssoOauth: {
      config1Content:
        "Перейдите в /settings/identity-providers. Введите Discovery/Authority URL, Client ID и Secret от Azure AD или Google. SCRIPE автоматически настраивает метаданные OIDC.",
      config1Title: "1. Привязать внешнего провайдера",
      config2Content:
        "Настройте нужные scopes (openid, profile, email). SCRIPE автоматически преобразует внешние JWT claims (такие как preferred_username, picture, given_name) во внутренние профили Администратора/Пользователя.",
      config2Title: "2. Автоматический маппинг Claims",
      config3Content:
        "Укажите, предназначен ли провайдер для Администраторов (back-office) или Пользователей (front-office). Привязки строго типизированы, что предотвращает эскалацию пользователя в сеанс администратора.",
      config3Title: "3. Политики IAM",
      config4Content:
        "Перейдите в /settings/oauth-apps, чтобы SCRIPE выступала как SSO для стороннего софта (например, вашей CRM или мобильного приложения). Выберите тип: Public (SPA) или Confidential (Backend).",
      config4Title: "4. Регистрация сторонних приложений",
      config5Content:
        "Внешние приложения просто указывают Authority на `https://ваш-домен-scripe.com`. SCRIPE автоматически обрабатывает эндпоинты `/.well-known/openid-configuration` и `/.well-known/jwks`.",
      config5Title: "5. Jwks Uri & Discovery",
      configContent: "Настройка SCRIPE в качестве вашего основного шлюза аутентификации:",
      configTitle: "Руководство по настройке IAM",
      description:
        "Сервер аутентификации корпоративного уровня, способный заменить Keycloak, Okta и Auth0. Встроенные OIDC Провайдеры, регистрация OAuth-приложений, принудительный PKCE и изолированные федерации тенантов.",
      feat1Desc:
        "Мгновенно подключайте внешних OIDC/OAuth2 провайдеров к конкретным тенантам. Интеграция без кода для Azure AD, Google, Okta, Auth0, AWS Cognito или любого OIDC-провайдера.",
      feat1Title: "Объединенные провайдеры (IdP)",
      feat2Desc:
        "Замените Keycloak. Регистрируйте сторонние системы напрямую в SCRIPE. Генерируйте Client ID и Secrets, управляйте Scope и выпускайте корпоративные JWT, подкрепленные хранилищем идентификационных данных SCRIPE.",
      feat2Title: "SCRIPE как Сервер (OAuth Приложения)",
      feat3Desc:
        "Устаревший Implicit Flow удален. Вся аутентификация — как внутренняя, так и внешняя — строго осуществляется через Proof Key for Code Exchange (PKCE) в Authorization Code Flow. Секреты никогда не попадают в браузер.",
      feat3Title: "Строгий PKCE и Безопасность",
      feat4Desc:
        "Каждый тенант — это свой изолированный IAM Realm. Тенанты управляют своими внешними SSO-провайдерами и выпускают учетные данные для своих собственных OAuth-приложений автономно.",
      feat4Title: "Мультитенантная IAM-изоляция",
      intro:
        "SCRIPE — это не просто приложение; это сервер IAM (Идентификации и управления доступом) корпоративного уровня на базе OpenIddict. Он работает эквивалентно Keycloak — выступая одновременно как OIDC клиент (Relying Party) и активный OAuth2/OIDC сервер авторизации. Тенанты могут аутентифицироваться наружу через Azure AD/Google или внутрь путем регистрации сторонних систем.",
      loginFlowContent:
        "При логине через Azure AD: SCRIPE выступает как Клиент. Перенаправляет пользователя в Azure, принимает ответ, валидирует внешний JWT, и затем выпускает СВОЙ внутренний JWT, полностью отвязывая авторизацию от внешнего провайдера.",
      loginFlowTitle: "Архитектура OIDC",
      managementContent:
        "SCRIPE предлагает Центр Управления IAM в настройках системы как для агрегации OIDC-клиентов, так и для конфигурации выдачи на стороне сервера.",
      managementTitle: "Центр управления IAM",
      overviewTitle: "Возможности IAM",
      scopingContent:
        "Концепция Realm из Keycloak реализована через партиционирование тенантов. Identity Провайдеры и OAuth Приложения строго связаны с TenantId. СуперАдмины управляют всеми Realms через функцию «Вход в мир тенанта».",
      scopingTip:
        "В отличие от базовых SaaS, SCRIPE не смешивает настройки Идентификации. Если Тенант А использует свой Azure AD, Тенант Б не имеет никакого доступа к этой инфраструктуре.",
      scopingTitle: "Партиционирование Realm (Тенанты)",
      title: "Сервер SSO и OAuth (Альтернатива Keycloak)",
    },
    themeMarketplace: {
      applyIntro:
        "Applying a marketplace theme follows a 5-step pipeline: 1. User clicks Apply on a theme. 2. Frontend reads the theme's ThemeDataJson. 3. previewTheme() in useStudioViewModel merges the design tokens (including per-page overrides) into the current StudioDraft. 4. The merged draft is saved to the tenant's DraftBrandingJson via PUT /tenants/{id}/settings. 5. Admin publishes the draft to make it live.",
      applyTitle: "Theme Application Flow",
      archDataFlowIntro:
        "1. LoginThemeSeeder.cs seeds 40 themes at application startup (upsert-safe). 2. ThemesController exposes GET /themes (list), GET /themes/{id} (detail), POST /themes/{id}/apply (apply). 3. Frontend ThemeMarketplaceService calls the API via IApiService. 4. ThemeMarketplaceMapper converts DTOs to domain entities. 5. ThemeMarketplaceRepository orchestrates services + mappers. 6. useThemeMarketplace hook provides ViewModel state. 7. ThemeGalleryView renders the marketplace UI.",
      archDataFlowTitle: "Data Flow Pipeline",
      archIntro:
        "The Theme Marketplace follows a pipeline architecture: backend seeder populates the LoginTheme table with 40 records → API exposes paginated list, detail, and apply endpoints → frontend gallery renders themes with advanced filtering → apply action snapshots the ThemeDataJson into tenant's DraftBrandingJson → publish propagates to LiveBrandingJson. Each layer is fully decoupled.",
      archLayersIntro:
        "The marketplace follows SCRIPE's standard 3-layer module structure: Domain layer (ThemeDetail entity, IThemeMarketplaceRepository, IThemeMarketplaceService interfaces), Data layer (ThemeMarketplaceService, ThemeMarketplaceRepository, ThemeMarketplaceMapper, ThemeMarketplaceTypes models), and Presentation layer (ThemeGalleryView, ThemeManagementView, ThemeDetailModal, ThemeCard, useThemeMarketplace hook).",
      archLayersTitle: "Clean Architecture Layers",
      archTitle: "Marketplace Architecture",
      catalogDiversityIntro:
        "The 40-theme catalog achieves maximum diversity across multiple axes: each theme uses a unique Google Font pairing, no two themes share the same color palette, all 7 categories are represented, and the layout distribution covers T1 Split (16), T2 Full-Page (12), T3 Centered (6), and T4 Special (6). This ensures every tenant can find a theme that matches their brand identity.",
      catalogDiversityTitle: "Design Diversity Matrix",
      catalogIntro:
        "SCRIPE ships with 40 meticulously designed branding packages. Each theme is a unique visual identity crafted for a specific market segment or brand aesthetic. Themes span 7 categories, use 30+ different Google Fonts, cover all 22 layouts, and include per-page branding overrides for Login, Forgot Password, and Reset Password.",
      catalogTitle: "40-Theme Catalog Overview",
      catCorporate:
        "Corporate — Professional business identity. Clean lines, serif/sans-serif font pairs, subtle gradients, blue/navy/gray palettes. Designed for financial services, consulting, law firms.",
      catCreative:
        "Creative — Bold, expressive identity. Vibrant colors, playful typography (Poppins, Quicksand), animated gradients, modern card layouts. Designed for agencies, startups, tech companies.",
      catDark:
        "Dark — Sophisticated dark-mode-first identity. Deep backgrounds (slate, zinc, charcoal), accent-driven highlights (cyan, amber, rose), premium glass effects. Designed for developer tools, media, gaming.",
      categoriesIntro:
        "Every theme belongs to exactly one category. Categories enable intuitive gallery browsing and filtering. The distribution ensures broad coverage: Corporate (8), Creative (6), Dark (6), Minimal (5), Elegant (5), Luxury (5), Nature (5).",
      categoriesTitle: "7 Theme Categories",
      catElegant:
        "Elegant — Refined, luxurious identity. Rose gold, champagne, pearl gradients, serif typography (Playfair Display, Cormorant), delicate overlays. Designed for beauty, fashion, hospitality.",
      catLuxury:
        "Luxury — Ultra-premium brand identity. Black/gold/platinum palettes, display typography (Italiana, Cinzel Decorative), full-bleed imagery, art-directed layouts. Designed for high-end brands, private banking, exclusive services.",
      catMinimal:
        "Minimal — Reductive, content-focused identity. Monochromatic palettes, generous whitespace, thin borders, system-optimized typography. Designed for productivity tools, documentation, SaaS platforms.",
      catNature:
        "Nature — Organic, earth-inspired identity. Forest greens, terracotta, ocean blues, botanical accents, rounded shapes, warm serif typography. Designed for sustainability, wellness, organic brands.",
      compDetailModal:
        "ThemeDetailModal (28KB) — Richly detailed theme preview modal. Contains: full-size preview image, design token summary (colors, fonts, spacing), feature matrix (dark mode, per-page, overlay), category/tier badges, Apply button with confirmation dialog, and like/favorite toggles.",
      compGalleryView:
        "ThemeGalleryView (26KB) — Full-page marketplace with animated hero section, category filter chips, search bar, grid/list view toggle, tier filter tabs, sort controls (popular/newest/name), infinite scroll pagination, and a responsive 3-column grid of ThemeCard components.",
      compManagementView:
        "ThemeManagementView (12KB) — Admin CRUD page for managing system themes. DataTable with columns: thumbnail, name, category, tier, status, likes, applies, actions. Supports create, edit, activate/deactivate, and bulk operations.",
      compMarketplacePanel:
        "ThemeMarketplacePanel — Inline panel within the Customizer Studio sidebar. Shows a compact gallery of themes with quick-apply functionality. Allows browsing and applying themes without leaving the studio.",
      componentsIntro:
        "The Theme Marketplace frontend consists of 8 purpose-built components spanning 3 pages and 1 modal. Each component follows SCRIPE's presentation-layer patterns using domain entities (never DTOs) and consuming data exclusively through the DI container.",
      componentsTitle: "Frontend Component Inventory",
      compThemeCard:
        "ThemeCard — Gallery grid item. Displays: thumbnail, name, category badge, tier badge, color palette strip (5 primary colors), font family name, like count, apply count, and hover-to-preview animation.",
      copyOnApplyIntro:
        "When a theme is applied, the ThemeDataJson is COPIED into the tenant's DraftBrandingJson — not linked. This means the tenant's branding is permanently isolated from future marketplace updates. If the theme is updated in v2.0, existing tenants who applied v1.0 retain their v1.0 snapshot. This prevents unexpected visual changes to production login pages.",
      copyOnApplyNote:
        "Copy-on-apply is a deliberate architectural decision. It trades storage efficiency for deployment safety — a critical requirement for enterprise tenants who negotiate specific branding contracts.",
      copyOnApplyTitle: "Copy-on-Apply Snapshot Semantics",
      description:
        "40 premium branding packages, 7 categories, 5 pricing tiers, per-page overrides, copy-on-apply snapshot semantics, and a full clean-architecture data layer — all seeded and ready to browse.",
      endpointApply:
        "POST /api/v1/themes/{id}/apply — Apply theme to the current tenant's draft settings. Copies ThemeDataJson to DraftBrandingJson.",
      endpointDetail:
        "GET /api/v1/themes/{id} — Full theme detail including ThemeDataJson, metadata, and engagement counters.",
      endpointLike:
        "POST /api/v1/themes/{id}/like — Toggle like/favorite for the current admin. Increments/decrements LikesCount.",
      endpointList:
        "GET /api/v1/themes — Paginated list of active themes with category, tier, and search filters.",
      endpointManage:
        "POST/PUT/DELETE /api/v1/themes — System admin CRUD for managing theme catalog (create, update, deactivate).",
      endpointsIntro:
        "The theme marketplace exposes endpoints through the existing TenantSettings and Themes controllers. Theme data is served as part of the branding configuration pipeline.",
      endpointsTitle: "Theme API Endpoints",
      entityFieldApplied:
        "AppliedCount — Usage counter. Tracks how many tenants have applied this theme.",
      entityFieldAuthor: "Author — Creator identifier (e.g., 'SCRIPE Design Team').",
      entityFieldCategory:
        "Category — Classification tag (corporate, creative, dark, elegant, luxury, minimal, nature). Used for gallery filtering.",
      entityFieldDescription:
        "Description — Marketing-quality description of the theme's visual identity and design philosophy.",
      entityFieldIsActive:
        "IsActive — Boolean flag. Inactive themes are hidden from the gallery but preserved in the database.",
      entityFieldIsSystem:
        "IsSystemTheme — Boolean flag. System themes are seeded at startup and cannot be deleted by tenants.",
      entityFieldLikes:
        "LikesCount — Engagement counter. Tracks how many tenants have favorited this theme.",
      entityFieldName:
        "Name — Human-readable theme name (e.g., 'Midnight Aurora', 'Sakura Bloom'). Unique per system.",
      entityFieldPreviewUrl:
        "PreviewUrl — Optional full-size preview image URL for the detail modal.",
      entityFieldsTitle: "Entity Fields",
      entityFieldTag:
        "Tags — Optional comma-separated tags for search (e.g., 'gradient, glass, modern, dark').",
      entityFieldThemeData:
        "ThemeDataJson — JSON column containing the complete design specification (50+ tokens). This is the heart of each theme.",
      entityFieldThumbnail: "ThumbnailUrl — Optional preview image URL for gallery cards.",
      entityFieldTier:
        "Tier — Pricing/access tier (Free, Starter, Professional, Enterprise, StandaloneAddon). Controls edition-based access gating.",
      entityFieldVersion:
        "Version — Semantic version string (e.g., '1.0.0'). Incremented when the theme design is updated.",
      entityIntro:
        "Each marketplace theme is stored as a LoginTheme entity in the Identity module's database. The entity extends AuditableEntity, providing soft-delete, audit trail, and optimistic concurrency. The core data is stored in ThemeDataJson — a JSON column containing the full design specification.",
      entityTitle: "LoginTheme Entity",
      governanceEditionIntro:
        "Each theme's Tier field maps to an edition level. The frontend gallery marks themes above the tenant's edition with an 'Upgrade Required' badge and disables the Apply button. The backend apply endpoint verifies the tenant's active subscription against the theme's tier before allowing application.",
      governanceEditionTitle: "Edition-Based Tier Enforcement",
      governanceIntro:
        "Theme access is controlled by a combination of edition-based tier enforcement and permission-based administrative access. The marketplace respects SCRIPE's multi-tenancy model — themes are globally visible but apply operations are scoped to the current tenant.",
      governancePermissionIntro:
        "Browsing the marketplace requires the branding.view permission. Applying a theme requires branding.manage. Managing system themes (CRUD) requires the themes.manage permission, which is restricted to System Admins.",
      governancePermissionTitle: "Permission Requirements",
      governanceTenantIntro:
        "When a theme is applied, it modifies only the current tenant's DraftBrandingJson. The apply operation is scoped via the JWT tenant_id claim. SuperAdmins can apply themes on behalf of any tenant via the 'Enter Tenant World' drill-down capability.",
      governanceTenantTitle: "Tenant Isolation",
      governanceTitle: "Marketplace Governance",
      intro:
        "The Theme Marketplace is SCRIPE's curated catalog of 40 production-ready branding packages. Each theme is a comprehensive visual identity — not just a color swap — containing 50+ design tokens spanning colors, typography, spacing, overlay, dark mode, branding panel, and per-page overrides for Login, Forgot Password, and Reset Password pages. Themes are stored as structured JSON in the LoginTheme entity, browsable via a full-page gallery with rich filtering, and applied to tenant settings with copy-on-apply snapshot semantics that permanently isolate applied configurations from future marketplace updates.",
      perPageIntro:
        "Each theme can define independent visual overrides for three authentication pages: Login, Forgot Password, and Reset Password. The 'pages' block in ThemeDataJson contains page-specific layout, headline, subtitle, overlay, and background settings that are merged on top of the global design when that page is active. This enables a single theme to present different messaging and visual treatments for different auth flows.",
      perPageIsolationNote:
        "Each auth page can have its own layout, headline, subtitle, and overlay without affecting the other pages. The Login page might use a full-image corporate layout while Forgot Password uses a clean centered card — all within the same theme.",
      perPageIsolationTitle: "State Isolation",
      perPageMergeIntro:
        "When a tenant previews a theme's Forgot Password page, the frontend merges the global design tokens with the forgotPassword override using spread semantics: { ...globalTokens, ...pages.forgotPassword }. This means any token not specified in the page override inherits from the global design — only the explicitly overridden values change. The merge happens in the previewTheme() function in useStudioViewModel.ts.",
      perPageMergeTitle: "Merge Strategy",
      perPageStructIntro:
        "The 'pages' object in ThemeDataJson contains three optional keys: 'login', 'forgotPassword', and 'resetPassword'. Each key maps to a page override object with fields: selectedLayout, panelHeadline, panelSubtitle, overlayColor, overlayOpacity, backgroundType, backgroundValue, and any other token that should differ from the global configuration.",
      perPageStructTitle: "Pages Block Structure",
      perPageTitle: "Per-Page Branding Architecture",
      previewFlowIntro:
        "The previewTheme() function in useStudioViewModel.ts performs a non-destructive preview by temporarily injecting theme tokens into the draft state. The preview is displayed in the sandboxed iframe via postMessage CSS variable injection. The draft is NOT saved until the user explicitly confirms the application. Canceling the preview restores the previous draft state.",
      previewFlowTitle: "Preview Before Apply",
      schemaColorsIntro:
        "The colors section defines the complete light-mode palette: primaryColor (brand accent), secondaryColor (complementary), backgroundColor (page background), formBackground (form card), textColor (primary text), secondaryTextColor (muted text), inputBackground (form input fields), inputBorderColor, inputTextColor, buttonColor (primary CTA), buttonTextColor, buttonHoverColor, linkColor, linkHoverColor, borderColor (general borders), and accentColor (highlights/badges).",
      schemaColorsTitle: "Color System (16 Tokens)",
      schemaDarkIntro:
        "Independent dark-mode palette: darkEnabled (boolean toggle), darkFormBackground, darkTextColor, darkInputBackground, darkInputBorderColor, darkInputTextColor, darkButtonColor, darkButtonTextColor, darkSecondaryTextColor, and darkBorderColor. These tokens are emitted as --login-dark-* CSS variables and activated via the [data-theme='dark'] selector.",
      schemaDarkTitle: "Dark Mode Color System (10 Tokens)",
      schemaIntro:
        "The ThemeDataJson column stores a comprehensive JSON object containing every visual parameter needed to fully render a branded login page. The schema is versioned and contains 7 major sections: layout, colors, dark mode colors, typography, spacing, overlay, and branding panel. Each token maps directly to a CSS custom property via the useLoginBrandingTokens pipeline.",
      schemaLayoutIntro:
        "Controls the page structure: selectedLayout (one of 22 layout identifiers), loginPosition (left/center/right), formWidth, formMaxWidth, containerPadding, and formAlignment. Layout selection determines which rendering strategy the LoginPage component uses.",
      schemaLayoutTitle: "Layout Configuration",
      schemaOverlayIntro:
        "Controls visual effects layered on backgrounds: overlayColor (RGBA), overlayOpacity (0–100%), overlayBlur (0–20px in Gaussian blur), backgroundType ('color', 'gradient', 'image'), backgroundValue (CSS gradient string or image URL), backgroundSize, backgroundPosition, and backgroundRepeat. Overlay settings can be scoped to the form section or branding panel independently.",
      schemaOverlayTitle: "Overlay & Effects (8 Tokens)",
      schemaPanelIntro:
        "Controls the branding side of split layouts: panelLogo (URL), panelHeadline (heading text), panelSubtitle (subheading text), panelHeadlineColor, panelSubtitleColor, panelBackgroundType, panelBackgroundValue, panelOverlayColor, panelOverlayOpacity, panelOverlayBlur, panelLogoSize (small/medium/large), and panelAlignment (left/center/right). These tokens are only rendered in T1 Split layouts.",
      schemaPanelTitle: "Branding Panel Configuration (12 Tokens)",
      schemaSpacingIntro:
        "Controls layout geometry: borderRadius (global border-radius in px), inputBorderRadius, buttonBorderRadius, inputHeight (in px), buttonHeight, and gap (spacing between form elements). These values are emitted as CSS custom properties and applied uniformly across all 22 layouts.",
      schemaSpacingTitle: "Spacing & Dimensions (6 Tokens)",
      schemaTitle: "ThemeDataJson Schema (50+ Design Tokens)",
      schemaTypographyIntro:
        "Controls all text rendering: fontFamily (Google Fonts name, e.g., 'Playfair Display'), headingFontFamily (optional separate heading font), fontSize (base size in px), headingSize, labelSize, inputFontSize, fontWeight (normal/medium/semibold/bold), and letterSpacing. Fonts are loaded dynamically via the Google Fonts CDN.",
      schemaTypographyTitle: "Typography Configuration (8 Tokens)",
      schemaVersionIntro:
        "The root 'version' field tracks the JSON schema version. Current version is '2.0'. The frontend handles backward compatibility — older schemas are normalized at read time.",
      schemaVersionTitle: "Schema Version",
      seedHelperIntro:
        "The seeder uses a fluent Build() helper with ThemeMeta and ThemeDesign records for clean theme definition. ThemeMeta contains name, category, tier, description, author, version, and tags. ThemeDesign contains all 50+ design tokens plus per-page overrides (PageOverrideDesign records for ForgotPassword and ResetPassword). The BuildFullThemeJson() method serializes the ThemeDesign record into the JSON format expected by the frontend.",
      seedHelperTitle: "Build() Helper Architecture",
      seedingIntro:
        "All 40 themes are seeded at application startup by LoginThemeSeeder.cs. The seeder uses an upsert-safe strategy: it checks for existing themes by Name and only inserts new ones — existing themes are never overwritten. This ensures idempotent deployment across environments.",
      seedingTitle: "Backend Seeding Architecture",
      seedUpsertIntro:
        "The seeder queries all existing theme names before processing. For each of the 40 themes, it checks the existing set — if the name exists, the theme is skipped. New themes are added to the DbContext in a single batch and saved with one SaveChangesAsync call. This makes the seeder safe to run repeatedly without duplicating themes or losing manual edits.",
      seedUpsertTitle: "Upsert-Safe Strategy",
      sourceBackend:
        "Backend: LoginThemeSeeder.cs (seeder), LoginTheme.cs (entity), ThemeConfiguration.cs (EF config)",
      sourceData:
        "Data Layer: ThemeMarketplaceService.ts, ThemeMarketplaceRepository.ts, ThemeMarketplaceMapper.ts, ThemeMarketplaceTypes.ts",
      sourceDomain:
        "Domain Layer: ThemeDetail.ts (entity), IThemeMarketplaceService.ts, IThemeMarketplaceRepository.ts",
      sourceFrontend:
        "Frontend: ThemeGalleryView.tsx, ThemeManagementView.tsx, ThemeDetailModal.tsx, ThemeCard.tsx",
      sourceTitle: "Source File Reference",
      sourceViewModel:
        "ViewModel: useThemeMarketplace.ts (gallery state), useStudioViewModel.ts (preview/apply integration)",
      tierEnterpriseIntro:
        "Premium branding packages for Enterprise-edition tenants. Ultra-premium designs with cinematic layouts, luxury typography (Cormorant Garamond, Italiana, Cinzel Decorative), and exclusive dark-mode treatments.",
      tierEnterpriseTitle: "Enterprise Tier (8 Themes)",
      tierFreeIntro:
        "Essential branding packages available to all tenants regardless of edition. Clean, professional designs suitable for quick deployment. Includes Starter themes across corporate, minimal, and creative categories.",
      tierFreeTitle: "Free Tier (8 Themes)",
      tierIntro:
        "Themes are organized into 5 pricing tiers that align with SCRIPE's edition system. Each tier provides increasing design sophistication and customization depth. Tier enforcement is handled by the theme marketplace frontend — themes from higher tiers display an 'Upgrade Required' badge and disable the Apply button for tenants on lower editions.",
      tierProIntro:
        "Advanced branding packages for Professional-edition tenants. Sophisticated visual treatments with glass-morphism effects, editorial typography, and multi-tone overlays. Includes the most diverse category coverage.",
      tierProTitle: "Professional Tier (10 Themes)",
      tierStandaloneIntro:
        "Ultra-exclusive standalone branding packages available as individual add-on purchases. These represent the most unique and specialized designs — botanical illustrations, art deco, brutalist, vaporwave, and zen-inspired themes that make a bold brand statement.",
      tierStandaloneTitle: "Standalone Add-on Tier (6 Themes)",
      tierStarterIntro:
        "Enhanced branding packages for Starter-edition tenants. Richer color palettes, premium font pairings, and gradient backgrounds. Includes Starter-exclusive designs across corporate, dark, and elegant categories.",
      tierStarterTitle: "Starter Tier (8 Themes)",
      tierTitle: "5-Tier Pricing Model",
      title: "Theme Marketplace",
    },
    userGroups: {
      architectureIntro:
        "Группа содержит: Членов (Members), Роли (Roles) и Ограничения полей (Restrictions). Группы привязаны к тенантам.",
      architectureTitle: "Архитектура",
      cascadeIntro:
        "При удалении или отключении группы можно дополнительно инициировать каскадное мягкое удаление (soft-delete) всех ее эксклюзивных участников.",
      cascadeNote:
        "Защищенные администраторы (Tenant Owner) автоматически игнорируются при каскадных операциях во избежание потери доступа к платформе.",
      cascadeTitle: "Каскадные операции",
      description:
        "Назначение ролей и ограничений на основе групп с аддитивным объединением (merge) при входе в систему.",
      domainModelIntro: "Добавляет 4 сущности связей в базу данных модуля Identity.",
      domainModelTitle: "Доменная модель",
      endpointsTitle: "API-эндпоинты (12)",
      frontendIntro:
        "Страница деталей содержит 3 независимые вкладки для управления участниками, ролями и ограничениями.",
      frontendTitle: "Frontend-модуль",
      howItWorksIntro:
        "При генерации JWT система вычисляет ОБЪЕДИНЕНИЕ (UNION) всех прямых ролей и ролей, унаследованных от групп.",
      howItWorksTitle: "Как это работает при входе",
      intro:
        "Обеспечивает масштабируемый способ массового назначения ролей и ограничений на уровне полей для больших команд администраторов.",
      memberManagementIntro: "Операции добавления идемпотентны (безопасны при повторных вызовах).",
      memberManagementTitle: "Управление участниками",
      mergeNote:
        "Роли групп являются аддитивными — они могут только РАСШИРЯТЬ ограничения или права, но никогда не удаляют прямые назначения (принцип 'deny wins').",
      restrictionsIntro:
        "Комбинируются аддитивно: если хотя бы один источник ограничивает поле 'salary', оно будет скрыто.",
      restrictionsTitle: "Ограничения полей (Restrictions)",
      roleAssignmentIntro:
        "Использует паттерн полной замены (Nuke and Pave) для строгого соответствия состоянию базы данных.",
      roleAssignmentTitle: "Назначение ролей",
      securityNote:
        "Управление группами доступно SuperAdmin глобально, а администраторы тенантов ограничены только своей компанией.",
      title: "Группы пользователей (User Groups)",
    },
    userManagement: {
      accountOpsTitle: "Операции с учетной записью",
      adminVsUserIntro:
        "SCRIPE разделяет администраторов (управляют платформой) и обычных конечных пользователей.",
      adminVsUserTitle: "Модель Админ vs Пользователь",
      bulkOpsTitle: "Массовые операции (Bulk)",
      crudTitle: "CRUD эндпоинты администраторов",
      description:
        "Полный жизненный цикл админов/пользователей, массовые операции, Impersonation (узурпация) и правила защищенных админов.",
      enterpriseOpsTitle: "Операции Enterprise",
      nukePaveTip:
        "Полная замена ролей (PUT) вместо индивидуального добавления/удаления исключает состояние гонки (race conditions) при обновлении из UI.",
      nukePaveTitle: "Паттерн Nuke & Pave",
      protectedIntro:
        "Создатель тенанта (Owner) имеет флаг защиты, предотвращающий случайное удаление или блокировку главного аккаунта восстановления.",
      protectedTitle: "Правила защищенного админа",
      roleMgmtTitle: "Управление ролями",
      title: "Управление пользователями",
    },
    webhookSystem: {
      architectureIntro:
        "Обеспечивает интеграцию с внешними системами путем отправки полезной нагрузки (payload) событий. Каждый запрос подписывается HMAC-SHA256.",
      architectureTitle: "Архитектура Webhook",
      circuitBreakerIntro:
        "Если внешний URL возвращает ошибки слишком много раз подряд, подписка автоматически отключается для предотвращения спама запросами.",
      circuitBreakerTitle: "Circuit Breaker (Авто-отключение)",
      deliveryLogsIntro: "Фиксируется каждый статус HTTP-кода, тело ответа и время каждой попытки.",
      deliveryLogsTitle: "Журналы доставки",
      description:
        "Событийно-ориентированные вебхуки с ротацией HMAC, подписками по иерархии тенантов и автоматическим отключением (Circuit Breaker).",
      endpointsManagementTitle: "Управление подписками",
      endpointsOperationsTitle: "Операции и мониторинг",
      endpointsTitle: "API-эндпоинты Webhook",
      entityTitle: "Сущность WebhookSubscription",
      eventsTitle: "Типы событий Webhook",
      hmacIntro: "Получатель может проверить подлинность, сравнив заголовок X-Webhook-Signature.",
      hmacTitle: "HMAC подпись",
      includeChildrenIntro:
        "Если параметр IncludeChildren включен, webhook получает события от текущего тенанта и всех его дочерних филиалов.",
      includeChildrenTitle: "Подписки на дочерних тенантов",
      retryIntro: "Повторная отправка с экспоненциальной задержкой при неудаче.",
      retryTitle: "Политика повторных попыток",
      secretRotationIntro:
        "Позволяет сгенерировать новый секрет, сохраняя валидность старого на 24 часа для плавного перехода.",
      secretRotationTitle: "Ротация секретов (24 часа переходного периода)",
      title: "Система Webhook",
    },
  },
};

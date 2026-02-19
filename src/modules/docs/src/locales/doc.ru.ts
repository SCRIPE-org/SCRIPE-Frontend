/**
 * Russian locale for the Documentation Portal.
 */
import type { PartialDocTranslations } from "./doc.en";

export const docRu: PartialDocTranslations = {
  common: {
    search: "Поиск по документации...",
    searchPlaceholder: "Введите для поиска...",
    searchShortcut: "⌘K",
    searchNoResults: "Ничего не найдено",
    searchResultsTitle: "Результаты поиска",
    copyCode: "Копировать",
    codeCopied: "Скопировано!",
    onThisPage: "На этой странице",
    relatedDocs: "Связанные документы",
    lastUpdated: "Последнее обновление",
    previous: "Назад",
    next: "Далее",
    backToTop: "Наверх",
    expandAll: "Развернуть всё",
    collapseAll: "Свернуть всё",
    menu: "Меню",
    closeMenu: "Закрыть меню",
    tableOfContents: "Содержание",
    readingTime: "{{min}} мин. чтения",
    home: "Главная",
    editPage: "Редактировать страницу",
    version: "Версия",
    language: "Язык",
  },
  info: {
    note: "Примечание",
    tip: "Совет",
    warning: "Предупреждение",
    danger: "Опасность",
  },
  api: {
    method: "Метод",
    endpoint: "Эндпоинт",
    description: "Описание",
    auth: "Авторизация",
    authRequired: "Обязательна",
    noAuth: "Публичный",
    permission: "Разрешение",
  },
  nav: {
    getStarted: "Начало работы",
    tutorials: "Руководства",
    architecture: "Архитектура",
    features: "Возможности",
    frontend: "Модули фронтенда",
    security: "Безопасность",
    apiReference: "Справочник API",
    infrastructure: "Инфраструктура",
  },
  getStarted: {
    overview: {
      title: "Обзор",
      description: "Добро пожаловать в документацию платформы Verified ERP.",
      hero: "Разрабатывайте корпоративные приложения быстрее",
      heroSub:
        "Готовая к продакшену платформа Modular Monolith с бэкендом на .NET 10, фронтендом на Next.js и всем необходимым для масштабируемых корпоративных приложений.",
      whatIs: "Что такое платформа Verified?",
      whatIsText:
        "Verified — это ERP-платформа корпоративного класса с архитектурой Modular Monolith. Она предоставляет проверенную основу для сложных бизнес-приложений с аутентификацией, авторизацией, мультитенантностью, аудит-логированием и панелью администрирования — всё из коробки.",
      keyFeatures: "Ключевые возможности",
      keyFeaturesText: "Платформа включает полный набор функций для корпоративных приложений.",
      feature1Title: "Архитектура Modular Monolith",
      feature1Text:
        "Чёткое разделение ответственности с изолированными модулями. Бэкенд использует CQRS с MediatR, фронтенд следует паттерну SOLID View/ViewModel.",
      feature2Title: "Корпоративная безопасность",
      feature2Text:
        "RBAC с серверным кэшированием разрешений, безопасность на уровне полей, 2FA, управление сессиями и полный аудит.",
      feature3Title: "Мультитенантность",
      feature3Text:
        "Встроенное управление арендаторами с иерархическими структурами, изолированными данными и настройками по арендаторам.",
      feature4Title: "Full-Stack решение",
      feature4Text:
        "Бэкенд .NET 10 с EF Core, фронтенд Next.js 16 с TanStack Query v5, Zustand и универсальный CRUD-движок.",
      techStack: "Технологический стек",
      backendStack: "Бэкенд",
      frontendStack: "Фронтенд",
      quickLinks: "Быстрые ссылки",
      quickLink1: "Быстрый старт",
      quickLink2: "Обзор архитектуры",
      quickLink3: "Первое руководство",
    },
    prerequisites: {
      title: "Предварительные требования",
      description: "Требования и инструменты перед началом работы.",
      intro: "Убедитесь, что на вашей машине установлены следующие инструменты.",
      required: "Необходимые инструменты",
      dotnet: ".NET 10 SDK",
      dotnetText: "Необходим для сборки и запуска бэкенда. Скачайте с официального сайта .NET.",
      nodejs: "Node.js 20+ и npm",
      nodejsText: "Необходим для фронтенда. Рекомендуем последнюю LTS-версию.",
      database: "SQL Server (или PostgreSQL/Oracle)",
      databaseText: "Бэкенд поддерживает несколько провайдеров БД. SQL Server по умолчанию.",
      ide: "IDE / Редактор кода",
      ideText:
        "Visual Studio 2022+ или VS Code с расширением C# для бэкенда. VS Code рекомендуется для фронтенда.",
      optional: "Дополнительные инструменты",
      git: "Git",
      gitText: "Для управления версиями и клонирования репозитория.",
      docker: "Docker",
      dockerText: "Для запуска БД в контейнере (необязательно, но рекомендуется).",
      postman: "Postman / Thunder Client",
      postmanText: "Для ручного тестирования API-эндпоинтов.",
    },
    quickStart: {
      title: "Быстрый старт",
      description: "Запустите платформу за 5 минут.",
      intro: "Следуйте этим шагам, чтобы клонировать, настроить и запустить платформу.",
      step1Title: "Клонировать репозиторий",
      step1Content: "Клонируйте репозиторий на локальную машину с помощью Git.",
      step2Title: "Настроить базу данных",
      step2Content: "Обновите строку подключения в конфигурационном файле бэкенда.",
      step3Title: "Запустить миграции",
      step3Content: "Примените миграции схемы БД для создания всех таблиц.",
      step4Title: "Запустить бэкенд",
      step4Content: "Запустите сервер API бэкенда.",
      step5Title: "Запустить фронтенд",
      step5Content: "Установите зависимости и запустите сервер разработки фронтенда.",
      step6Title: "Открыть приложение",
      step6Content:
        "Откройте браузер и перейдите к приложению. Используйте учётные данные админа по умолчанию.",
      defaultCredentials: "Учётные данные по умолчанию",
      successTip:
        "Если всё настроено правильно, вы увидите панель администрирования. Админ по умолчанию имеет полные права.",
    },
    projectStructure: {
      title: "Структура проекта",
      description: "Понимание структуры каталогов обоих проектов.",
      intro: "Платформа Verified организована как монорепозиторий с двумя основными проектами.",
      backendTitle: "Структура бэкенда",
      backendText: "Бэкенд следует архитектуре Modular Monolith с паттерном CQRS.",
      frontendTitle: "Структура фронтенда",
      frontendText: "Фронтенд следует модульной архитектуре с паттерном SOLID View/ViewModel.",
      keyDirectories: "Основные каталоги",
    },
  },
  tutorials: {
    firstBackendModule: {
      title: "Создание первого модуля (Бэкенд)",
      description: "Пошаговое руководство по созданию модуля бэкенда с CQRS.",
    },
    firstFrontendModule: {
      title: "Создание первого модуля (Фронтенд)",
      description: "Создайте модуль фронтенда по паттерну SOLID View/ViewModel.",
    },
    addEntity: {
      title: "Добавить доменную сущность",
      description: "Создайте новую доменную сущность с валидацией и аудитом.",
    },
    addCommand: {
      title: "Добавить команду (CQRS)",
      description: "Создайте команду с обработчиком, валидацией и поведениями конвейера.",
    },
    addQuery: {
      title: "Добавить запрос (CQRS)",
      description: "Создайте запрос с обработчиком и маппингом ответа.",
    },
    addPermissions: {
      title: "Добавить разрешения",
      description: "Заполнить разрешения и защитить эндпоинты с помощью RBAC.",
    },
    addApiEndpoint: {
      title: "Добавить API-эндпоинт",
      description: "Создайте эндпоинт контроллера с документацией Swagger и авторизацией.",
    },
    apiIntegration: {
      title: "Интеграция API фронтенда",
      description: "Подключите ваш модуль фронтенда к API бэкенда.",
    },
  },
  architecture: {
    overview: {
      title: "Обзор архитектуры",
      description: "Высокоуровневое представление архитектуры платформы.",
    },
    backend: {
      title: "Архитектура бэкенда",
      description: ".NET 10 Modular Monolith с CQRS и DDD.",
    },
    frontend: {
      title: "Архитектура фронтенда",
      description: "Next.js модульный монолит с паттернами SOLID.",
    },
    cqrs: {
      title: "Паттерн CQRS",
      description: "Реализация Command Query Responsibility Segregation.",
    },
    modules: { title: "Система модулей", description: "Как модули структурированы и изолированы." },
    solidPattern: {
      title: "SOLID View/ViewModel",
      description: "Паттерн SOLID для представлений и моделей представлений.",
    },
    stateManagement: {
      title: "Управление состоянием",
      description: "TanStack Query для серверного состояния, Zustand для UI.",
    },
    dataFlow: {
      title: "Поток данных",
      description: "Как данные перемещаются от UI к базе данных и обратно.",
    },
  },
  features: {
    authentication: {
      title: "Аутентификация",
      description: "Вход для админов и пользователей, JWT-токены, поток обновления.",
      overview: "Обзор",
      overviewText:
        "Система аутентификации обеспечивает безопасный вход для администраторов и пользователей. Используются JWT-токены с серверным кэшированием разрешений.",
      flowTitle: "Поток аутентификации",
      loginFlow: "Поток входа",
      loginFlowText:
        "При входе админа система проверяет учётные данные, 2FA, генерирует JWT-токены и кэширует разрешения.",
      endpoints: "API-эндпоинты",
      backendImpl: "Реализация бэкенда",
      frontendImpl: "Интеграция фронтенда",
      securityFeatures: "Функции безопасности",
      tipSecurity:
        "Разрешения кэшируются на сервере (не в JWT). Изменения вступают в силу немедленно без обновления токена.",
      accountLockout: "Блокировка учётной записи",
      accountLockoutText: "После 5 неудачных попыток входа учётная запись блокируется на 15 минут.",
    },
    twoFactorAuth: {
      title: "Двухфакторная аутентификация",
      description: "Настройка 2FA на основе TOTP, верификация и восстановление.",
    },
    sessionManagement: {
      title: "Управление сессиями",
      description: "Отслеживание активных сессий, информация об устройстве и отзыв сессий.",
    },
    profileManagement: {
      title: "Управление профилем",
      description: "Обновление профиля, загрузка аватара, смена пароля.",
    },
    adminManagement: {
      title: "Управление администраторами",
      description: "CRUD админов, назначение ролей, имперсонация и массовые операции.",
    },
    roleManagement: {
      title: "Управление ролями",
      description: "CRUD ролей с назначением разрешений и клонированием.",
    },
    permissionSystem: {
      title: "Система разрешений",
      description: "RBAC с серверным кэшированием и безопасностью на уровне полей.",
    },
    tenantManagement: {
      title: "Управление арендаторами",
      description: "Мультитенантный CRUD, иерархия, настройки и логотипы.",
    },
    menuSystem: {
      title: "Система меню",
      description: "Динамическое управление меню с перестановкой и контролем видимости.",
    },
    dashboardAnalytics: {
      title: "Панель мониторинга и аналитика",
      description: "KPI, графики, события безопасности и экспорт данных.",
    },
    auditLogging: {
      title: "Журналирование аудита",
      description: "Полный аудит-трейл с 4-источниковым конвейером.",
    },
    recycleBin: {
      title: "Корзина",
      description: "Просмотр мягко удалённых записей с возможностью восстановления.",
    },
    fileManagement: {
      title: "Управление файлами",
      description: "Загрузка частями, возобновляемое скачивание, валидация ETag.",
    },
    userAuthentication: {
      title: "Аутентификация пользователей",
      description: "Регистрация, верификация email/телефона, OAuth.",
    },
  },
  frontend: {
    authModule: {
      title: "Модуль аутентификации",
      description: "Поток входа, верификация 2FA, управление токенами и защита маршрутов.",
    },
    profileModule: {
      title: "Модуль профиля",
      description: "Профиль админа, настройки безопасности, сессии и активность.",
    },
    systemModule: {
      title: "Системный модуль",
      description: "Все 12 системных подмодулей: админы, роли, разрешения, арендаторы и др.",
    },
    crudEngine: {
      title: "CRUD-движок",
      description: "GenericCrudView, DataTable, формы и хелперы столбцов.",
    },
  },
  security: {
    rbac: {
      title: "RBAC и разрешения",
      description: "Управление доступом на основе ролей с серверным кэшированием.",
    },
    fieldLevel: {
      title: "Безопасность на уровне полей",
      description: "Ограничение доступа к полям сущности по ролям.",
    },
    idEncryption: {
      title: "Шифрование ID",
      description: "Обфускация ID сущностей AES-256 для публичных API.",
    },
    tokens: {
      title: "Безопасность токенов",
      description: "Структура JWT, ротация refresh-токенов и отзыв токенов.",
    },
  },
  apiReference: {
    adminAuth: {
      title: "API аутентификации админа",
      description: "Вход, обновление, выход, 2FA, сессии.",
    },
    userAuth: {
      title: "API аутентификации пользователя",
      description: "Регистрация, верификация, вход, сброс пароля, OAuth.",
    },
    adminManagement: {
      title: "API управления администраторами",
      description: "CRUD, массовые операции, назначение ролей, имперсонация.",
    },
    adminManagementApi: {
      title: "API управления администраторами",
      description: "Полные CRUD-операции для управления администраторами.",
    },
    roles: { title: "API ролей", description: "CRUD ролей и назначение разрешений." },
    tenants: { title: "API арендаторов", description: "CRUD арендаторов, иерархия, настройки." },
    menus: { title: "API меню", description: "CRUD меню, перестановка, видимость." },
    audit: { title: "API аудита", description: "Список записей аудита, детали и экспорт." },
  },
  infrastructure: {
    database: {
      title: "Конфигурация базы данных",
      description: "Настройка SQL Server, PostgreSQL или Oracle.",
    },
    multiDatabase: {
      title: "Поддержка нескольких БД",
      description: "Переключение между провайдерами баз данных.",
    },
    migrations: { title: "Миграции", description: "Запуск и управление миграциями базы данных." },
    caching: {
      title: "Стратегия кэширования",
      description: "Кэширование разрешений, запросов и инвалидация кэша.",
    },
  },
};

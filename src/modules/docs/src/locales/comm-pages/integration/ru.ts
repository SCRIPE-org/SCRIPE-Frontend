/**
 * Docs integration — RU
 * Auto-filled 28 keys from EN.
 */
export const ru = {
  commercial: {
    apiDesign: {
      conventionsTitle: "Корпоративные стандарты",
      description:
        "Ознакомьтесь с безупречными принципами проектирования RESTful API, строгим версионированием и предсказуемыми соглашениями, на которых работает SCRIPE.",
      errorTitle: "Стандартизированная обработка ошибок",
      intro:
        "API SCRIPE спроектировано для масштабирования и предсказуемости. От согласованных правил именования до стандартизированной пагинации и формата ошибок RFC 7807 — наша RESTful-архитектура без состояния (stateless) гарантирует бесшовную интеграцию для конечных потребителей.",
      pipelineContent:
        "Пайплайн API использует высокооптимизированный жизненный цикл запросов AstraFlow mediator. Каждый эндпоинт автоматически наследует валидацию, отслеживание производительности, кэширование и аудит-логирование еще до выполнения первой строки бизнес-логики.",
      pipelineTitle: "Надежный пайплайн запросов",
      resultContent:
        "SCRIPE устраняет «ад» блоков try-catch благодаря единому паттерну Result. Каждый ответ API строго типизирован и математически предсказуем, гарантируя, что потребители получают стандартные HTTP-коды состояния, оборачивающие идентичную JSON-структуру ответа независимо от используемого модуля.",
      resultTitle: "Предсказуемый паттерн Result",
      statusCodesTitle: "Семантические коды состояния",
      swaggerContent:
        "Изучите живую документацию Swagger/OpenAPI 3.0, чтобы мгновенно взаимодействовать с более чем 400 преднастроенными эндпоинтами. Мы генерируем строгие спецификации OpenAPI, что позволяет бесшовно создавать SDK для фронтенда и мобильных платформ.",
      swaggerTitle: "Интерактивный Swagger UI",
      title: "Дизайн и архитектура API",
    },
    emailIntegration: {
      bilingual: "Двуязычный роутинг шаблонов",
      bilingualDesc:
        "Автоматически определяйте локаль тенанта и отправляйте глубоко персонализированные HTML-письма на арабском (RTL) или английском (LTR) из строго категоризированных шаблонов.",
      configTitle: "Динамические конфигурации SMTP",
      description:
        "Асинхронная доставка транзакционных писем на основе очередей с богатыми настраиваемыми шаблонами Scriban.",
      featuresTitle: "Фичи Enterprise-доставки",
      intro:
        "Транзакционные коммуникации никогда не должны блокировать API-запрос. SCRIPE включает систему отправки на основе паттерна outbox и очередей, использующую фоновые воркеры (background workers), чтобы гарантировать сверхбыструю, надежную доставку email через стандартный SMTP или прямые REST API (SendGrid, Mailgun).",
      pipelineTitle: "Транзакционный пайплайн",
      providersTitle: "Агностичные провайдеры транспорта",
      queueBased: "Фоновые отправки",
      queueBasedDesc:
        "API отвечают строго менее чем за 50 мс, в то время как тяжелые манипуляции со строками и внешние сетевые вызовы делегируются постоянным фоновым сервисам.",
      retryLogic: "Экспоненциальная задержка (Exponential Backoff)",
      retryLogicDesc:
        "Изящно обрабатывайте временные сетевые сбои или лимиты запросов от внешних провайдеров с помощью встроенных, настраиваемых и отказоустойчивых политик повторных попыток.",
      templatesContent:
        "Пишите логику прямо внутри ваших email-макетов. Используя молниеносный язык шаблонов Scriban, вы можете выполнять условные блоки if/else, итерироваться по элементам и идеально форматировать даты, не допуская утечки бизнес-логики в слой приложения.",
      templatesTitle: "Интеллектуальные шаблоны Scriban",
      title: "Отказоустойчивая инфраструктура Email",
      tracking: "Аудит и трекинг доставки",
      trackingDesc:
        "Записывайте ID отправки, точный timestamp и ответ провайдера для каждого отправленного письма, создавая неопровержимый audit trail.",
    },
    messageTemplates: {
      bilingualContent:
        "Каждый шаблон нативно понимает контекст пользователя. Отправьте точно такой же транзакционный payload, и движок оценит предпочтительную локаль получателя, мгновенно сгенерировав красиво отформатированные коммуникации на арабском (RTL) или английском (LTR).",
      bilingualTitle: "Интеллектуальный контекстный рендеринг",
      builtInTitle: "Предустановленные системные шаблоны",
      description:
        "Тьюринг-полный движок динамических шаблонов на базе Scriban для локализованных писем, SMS, уведомлений и генерации PDF-документов.",
      engineContent:
        "Зачем перекомпилировать код, чтобы изменить тему письма? SCRIPE использует Scriban — молниеносно быстрый язык шаблонов, совместимый с Liquid. Он безопасно вычисляет логику if/else, манипуляции со строками и циклы данных непосредственно внутри контента, выполняясь менее чем за миллисекунду.",
      engineTitle: "Тьюринг-полный движок шаблонов (Turing-Complete)",
      intro:
        "Коммуникации с клиентами должны быть динамичными, глубоко персонализированными и мгновенно развертываемыми. SCRIPE отделяет разметку сообщений от базовой логики приложения, используя высокозащищенный шаблонизатор (sandboxed template engine).",
      managementTitle: "Централизованный хаб шаблонов",
      previewContent:
        "Разработчики и Product Owners могут мгновенно итерировать дизайн шаблонов через встроенный интерфейс live-превью. Инжектируйте моковые JSON payload'ы, чтобы протестировать сложные логические циклы и обработку ошибок, даже не деплоя код.",
      previewLive: "Инъекция payload'а в реальном времени",
      previewLiveDesc:
        "Визуализируйте точный отрендеренный результат, скармливая в sandbox динамические объекты данных.",
      previewTitle: "Живая Sandbox среда",
      previewVariables: "Безопасный Model Binding",
      previewVariablesDesc:
        "Только явно разрешенные ViewModels могут быть доступны из шаблона, что гарантирует безопасность данных.",
      title: "Динамическая шаблонизация сообщений",
    },
    restApiOverview: {
      authContent:
        "Абсолютно каждый контроллер по умолчанию заблокирован. SCRIPE использует надежную валидацию токенов JWT, требуя точных гранулярных разрешений и подтвержденных claims тенанта до того, как будет возвращен хотя бы один байт JSON.",
      authTitle: "Строгая криптографическая авторизация",
      controllersTitle: "Строгая топология контроллеров",
      description:
        "Безупречная, полностью документированная поверхность RESTful API с динамической фильтрацией, пагинацией на основе курсора (cursor-based) и богатыми HATEOAS ответами.",
      intro:
        "Бэкенд — это не просто обертка над базой данных (database wrapper); это тщательно продуманная HTTP-поверхность. SCRIPE открывает безупречный RESTful API, который строго придерживается стандартных HTTP-методов (verbs), кодов состояния и конвенций гипермедиа.",
      lstSwagI1: "Автогенерируется из атрибутов контроллера и XML-документации",
      lstSwagI2: "Режим «Try-it-out» для тестирования эндпоинтов напрямую",
      lstSwagI3: "Поддержка JWT-аутентификации прямо в Swagger UI",
      lstSwagI4: "Документация схем запросов/ответов с примерами",
      lstSwagI5: "Сгруппировано по контроллерам для удобной навигации",
      lstSwagI6: "Доступно по адресу /swagger в режиме разработки (development mode)",
      paginationTitle: "Пагинация Cursor и Offset",
      responseContent:
        "Больше никакого парсинга случайных строк с ошибками. Каждый ответ API — будь то успех или катастрофический сбой — обернут в нашу стандартизированную структуру Problem Details (паттерн `Result<T>`), гарантируя абсолютную предсказуемость для фронтенда и сторонних потребителей.",
      responseTitle: "Стандартизированные предсказуемые Payload'ы",
      swaggerContent:
        "Мы генерируем подробную, глубоко аннотированную документацию Swagger (OpenAPI 3.0) напрямую из C#-кода во время выполнения (runtime). Разработчики могут интерактивно тестировать аутентифицированные payload'ы прямо из браузера в ту же секунду, когда система запускается.",
      swaggerTitle: "Интерактивные порталы OpenAPI",
      tblCtrlHeader1: "Контроллер",
      tblCtrlHeader2: "Эндпоинты",
      tblCtrlHeader3: "Описание",
      tblCtrlR10C1: "SettingsController",
      tblCtrlR10C2: "4",
      tblCtrlR10C3: "Системные настройки, настройки тенанта",
      tblCtrlR11C1: "DashboardController",
      tblCtrlR11C2: "3",
      tblCtrlR11C3: "Данные KPI, данные графиков (charts), саммари",
      tblCtrlR12C1: "WebhookController",
      tblCtrlR12C2: "5",
      tblCtrlR12C3: "Управление подписками, каталог событий (events)",
      tblCtrlR13C1: "RecycleBinController",
      tblCtrlR13C2: "4",
      tblCtrlR13C3: "Soft-удаленные элементы, восстановление, окончательная очистка (purge)",
      tblCtrlR14C1: "EditionsController",
      tblCtrlR14C2: "11",
      tblCtrlR14C3: "CRUD редакций, функции, версионирование, развертывание",
      tblCtrlR15C1: "FeaturesController",
      tblCtrlR15C2: "5",
      tblCtrlR15C3: "CRUD функций, типы значений, системные функции",
      tblCtrlR16C1: "SubscriptionsController",
      tblCtrlR16C2: "12",
      tblCtrlR16C3: "Назначение, апгрейд, даунгрейд, жизненный цикл, анализ последствий",
      tblCtrlR17C1: "TenantFeaturesController",
      tblCtrlR17C2: "4",
      tblCtrlR17C3: "Переопределения тэнантов, разрешенные функции",
      tblCtrlR1C1: "AuthController",
      tblCtrlR1C2: "8",
      tblCtrlR1C3: "Логин, регистрация, 2FA, сброс пароля, управление сессиями",
      tblCtrlR2C1: "UserController",
      tblCtrlR2C2: "27",
      tblCtrlR2C3: "CRUD, bulk-операции, enterprise-действия",
      tblCtrlR3C1: "RoleController",
      tblCtrlR3C2: "12",
      tblCtrlR3C3: "Управление ролями, назначение разрешений",
      tblCtrlR4C1: "TenantController",
      tblCtrlR4C2: "10",
      tblCtrlR4C3: "Жизненный цикл тенанта, настройки, активация",
      tblCtrlR5C1: "AuditController",
      tblCtrlR5C2: "6",
      tblCtrlR5C3: "Запросы логов аудита, экспорт, стриминг",
      tblCtrlR6C1: "NotificationController",
      tblCtrlR6C2: "5",
      tblCtrlR6C3: "Push-уведомления, отметить прочитанным, настройки (preferences)",
      tblCtrlR7C1: "FileController",
      tblCtrlR7C2: "4",
      tblCtrlR7C3: "Загрузка (Upload/Download), удаление, метаданные",
      tblCtrlR8C1: "TemplateController",
      tblCtrlR8C2: "5",
      tblCtrlR8C3: "CRUD email/message шаблонов, превью",
      tblCtrlR9C1: "MenuController",
      tblCtrlR9C2: "6",
      tblCtrlR9C3: "Динамическое управление меню, переопределения (overrides)",
      title: "Поверхность RESTful API",
    },
    ssoEnterprise: {
      brandingContent:
        "Deliver a seamless, uncompromising login aesthetic. Tenant administrators simply configure their external SSO within the UI, and the login interface autonomously generates flawlessly styled, tenant-bound SSO buttons ensuring user trust.",
      brandingTitle: "Architected for Corporate Branding",
      comparisonTitle: "How SCRIPE Compares",
      description:
        "Централизуйте доступ к учетным записям. Подключайте корпоративные каталоги напрямую к мультитенантной аутентификации SCRIPE с нулевым (zero-friction) трением.",
      intro:
        "Безопасность корпоративного масштаба требует централизованного доверия. SSO SCRIPE позволяет вашим клиентам делегировать аутентификацию их существующим провайдерам идентичности (IdP), сохраняя при этом нашу строгую изоляцию тенантов и распределение ролей.",
      linkingContent:
        "Забудьте о ручных приглашениях по email. Когда ваши сотрудники впервые входят через корпоративный SSO, SCRIPE мгновенно сверяет их email и аккуратно привязывает их к профилям и локальным административным ролям (RBAC) без какого-либо трения.",
      linkingTitle: "Автоматическая привязка идентичности",
      multiIdpContent:
        "Legacy platforms often bind identity to the root infrastructure, forcing all tenants to share an IdP, or requiring massively complex infrastructure scaling. SCRIPE natively supports infinite, uniquely mapped Identity Providers per tenant—all governed through the integrated Admin UI without touching the deployment pipeline.",
      multiIdpTitle: "Infinite Multi-IdP Per Tenant",
      oauth1Desc:
        "Server-side applications with secure backend storage for client secrets. Perfect for B2B API integrations enforcing the full Authorization Code flow with PKCE.",
      oauth1Title: "Confidential Clients (Backend)",
      oauth2Desc:
        "React, Vue, iOS, and Android applications that cannot securely store static secrets. Strictly leverages the PKCE-only flow, ensuring access tokens are generated flawlessly without risking a compromised client secret.",
      oauth2Title: "Public Clients (SPA & Mobile)",
      oauthAppsContent:
        "Дайте программной экосистеме ваших клиентов возможность безопасной интеграции с SCRIPE. Регистрируйте неограниченное количество OAuth приложений (Web, Desktop или SPA) и программно управляйте доступом (scopes) и жизненным циклом токенов.",
      oauthAppsTitle: "Шлюз сторонних OAuth приложений",
      oauthContent:
        "Invert the identity paradigm. By registering third-party software as OAuth Applications within SCRIPE, you instantly transform your application into a centralized enterprise Identity Provider. Mobile applications, partner portals, and decoupled internal microservices can all aggressively rely on SCRIPE for unified identity resolution.",
      oauthTitle: "OAuth Application Registry (SCRIPE as Server)",
      oidcContent:
        "Легко подключайтесь к Azure Active Directory (Entra ID), Okta, Auth0, Google Workspace или любому другому провайдеру с поддержкой OpenID Connect (OIDC). Мы берем на себя криптографический обмен; ваши пользователи получают доступ в один клик.",
      oidcTitle: "Универсальная интеграция OIDC",
      pkceSecurityContent:
        "Мы полностью отказываемся от устаревших и уязвимых потоков аутентификации. Абсолютно все OAuth транзакции SCRIPE обязывают использовать протокол PKCE, обеспечивая полный иммунитет к атакам перехвата кода авторизации, даже для нативных мобильных клиентов или SPA фреймворков (JavaScript).",
      pkceSecurityTitle: "Proof Key for Code Exchange (PKCE)",
      protocolsContent:
        "SCRIPE mandates adherence to immutable industry standards, ensuring frictionless topological compatibility with every major identity provider globally.",
      protocolsTitle: "Supported Authentication Protocols",
      securityModelContent:
        "The deprecated Implicit Flow is eradicated. Every SSO login flows exclusively through PKCE (Proof Key for Code Exchange), the definitive standard dictated by OAuth 2.1. Authorization codes are strictly one-time-use, instantly exchanged server-side, with full discovery document caching.",
      securityModelTitle: "PKCE Security Architecture",
      tenantIsolationContent:
        "SCRIPE строго привязывает каждую конфигурацию SSO к ее тенанту. Тенант A может аутентифицироваться через Entra ID, в то время как Тенант B использует Okta — на одной платформе, с нулевым риском перекрестного доступа к данным.",
      tenantIsolationTitle: "Изолированные службы идентичности тенанта",
      title: "Корпоративный Единый Вход (Enterprise SSO)",
      val1Desc:
        "Every authentication flow is fortified with stringent PKCE (Proof Key for Code Exchange) validation. We enforce strict state-checking to thwart CSRF attacks and encrypt all latent client secrets at rest. Secret keys never touch the browser.",
      val1Title: "Zero-Trust Identity Protocol",
      val2Desc:
        "Employees and B2B clients sign in instantly with their existing corporate credentials. Connect Azure AD, Google Workspace, Okta, or AWS Cognito directly from the Admin Panel in exactly 30 seconds—no custom backend middleware required.",
      val2Title: "Zero-Code Federation (IdP)",
      val3Desc:
        "Why pay for Auth0 or deploy Keycloak? Turn SCRIPE into your primary authentication broker. Register distinct OAuth applications (SPAs, Mobile Apps, external dashboards) to securely consume SCRIPE's JWTs.",
      val3Title: "SCRIPE as the Identity Server",
      val4Desc:
        "B2B SaaS superpower: Every single tenant can configure their own isolated SSO providers. Tenant A's Azure AD is mathematically invisible to Tenant B's Google Workspace. SuperAdmins can also provide Global SSO fallbacks.",
      val4Title: "Absolute Tenant IAM Isolation",
      val5Desc:
        "Every configured Identity Provider dynamically renders on the login screen with custom hex colors, branded labels, and distinct vectorized SVGs perfectly matching the tenant's brand identity.",
      val5Title: "White-Labeled Login Experience",
      val6Desc:
        "SCRIPE relies entirely on the battle-tested OpenIddict framework for robust OIDC and OAuth 2.0 compliance, with planned architecture expansions into SAML 2.0 for legacy government system compliance.",
      val6Title: "Future-Proof Standardization",
      valueTitle: "Strategic IAM Value",
    },
    webhookIntegration: {
      description:
        "Массивно отказоустойчивый, асинхронный, event-driven диспетчер вебхуков, обеспечивающий безопасную мгновенную синхронизацию данных с огромными внешними API.",
      eventsTitle: "Глобально транслируемые поддерживаемые события",
      intro:
        "Современные enterprise системы обязаны общаться. Вместо того чтобы заставлять клиентов агрессивно пуллить (polling) ваш REST API, SCRIPE включает нативный, массово эффективный диспетчер исходящих вебхуков. Пушьте критические события домена мгновенно в любую внешнюю систему по безопасному протоколу HTTPS.",
      logsTitle: "Форензик-аудит диспетчеризации",
      managementTitle: "Динамическое управление подписками",
      retryContent:
        "Если сервер подписчика уходит в офлайн, SCRIPE не удаляет payload. Используя интеллектуальный паттерн persistent outbox (надежной исходящей очереди) с экспоненциальной задержкой (exponential backoff), система математически повторяет запрос (например, через 5 секунд, 1 минуту, 1 час, 1 день) до тех пор, пока получение не будет подтверждено HTTP-статусом 2xx.",
      retryTitle: "Персистентный Exponential Backoff",
      securityContent:
        "Каждый исходящий payload надежно подписан подписью HMAC-SHA256, сгенерированной на основе secret key тенанта. Сторонние интеграции могут окончательно проверить, что вебхук произошел с ваших серверов SCRIPE и что payload не был перехвачен или глобально изменен.",
      securityTitle: "Криптографические подписи HMAC",
      title: "Высоконагруженная диспетчеризация Webhook'ов",
    },
  },
};

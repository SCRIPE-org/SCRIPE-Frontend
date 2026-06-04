/**
 * Docs security — RU
 * Auto-filled 25 keys from EN.
 */
export const ru = {
  security: {
    apiSecurity: {
      corsIntro: "Ограничивает возможность выполнения кросс-доменных запросов в браузере.",
      corsTitle: "Настройка CORS",
      csrfIntro:
        "Bear-токены в сочетании с директивой SameSite делают API невосприимчивым к подделке межсайтовых запросов (CSRF).",
      csrfTitle: "Защита от CSRF",
      description:
        "Rate Limiting, CORS, валидация входных данных, защита от CSRF и атак повторного воспроизведения (Replay Attacks).",
      headersIntro:
        "Платформа выдает заголовки, предотвращающие XSS, MIME-sniffing и Clickjacking.",
      headersTip: "Оценка конфигурации по умолчанию на securityheaders.com — A+.",
      headersTitle: "Заголовки безопасности (Security Headers)",
      inputValidationIntro:
        "FluentValidation в пайплайне AstraFlow mediator отклоняет вредоносные или некорректные payload-ы до выполнения логики.",
      inputValidationTitle: "Валидация входных данных",
      intro: "Многоуровневая защита API SCRIPE от распространенных веб-уязвимостей.",
      rateLimitIntro: "4 уровня защиты от DDoS и брутфорса, встроенные в ASP.NET Core.",
      rateLimitTitle: "Ограничение скорости (Rate Limiting)",
      replayIntro:
        "Одноразовые токены обновления, короткоживущие токены доступа и временные окна TOTP сводят на нет replay-атаки.",
      replayTitle: "Предотвращение атак повторного воспроизведения",
      title: "Безопасность API",
    },
    auditCompliance: {
      architectureIntro:
        "Основана на AuditableEntityInterceptor в EF Core и логировании команд CQRS.",
      architectureTitle: "Архитектура аудита",
      auditLogEntityTitle: "Структура сущности AuditLog",
      complianceTitle: "Возможности для комплаенса",
      description:
        "Абсолютная прозрачность: перехватчики БД, потоковое вещание SignalR и экспорт CSV/Excel/PDF.",
      exportIntro: "Экспорт записей аудита в форматы CSV, Excel, PDF.",
      exportTitle: "Возможности экспорта",
      fullTraceTitle: "Полная трассировка",
      immutableTitle: "Неизменяемые логи",
      interceptorIntro:
        "Вычисляет старые и новые значения в формате JSON при каждом вызове SaveChanges.",
      interceptorTitle: "Перехватчик изменений сущностей",
      intro:
        "SCRIPE предоставляет комплексную систему аудита, отслеживающую каждое изменение данных (кто, что, когда).",
      queryApiIntro: "Мощная система поиска и фильтрации журналов аудита, ограниченная тенантом.",
      queryApiTitle: "API запросов и экспорта",
      queryExportCsvDesc: "Экспорт в файл CSV.",
      queryExportExcelDesc: "Экспорт в Excel-таблицу.",
      queryExportPdfDesc: "Экспорт в PDF-документ.",
      querySearchDesc: "Поиск с пагинацией.",
      realtimeTitle: "Реальное время",
      retentionTitle: "Политика хранения (Retention Policy)",
      searchableTitle: "Удобный поиск",
      signalrIntro: "Журналы аудита транслируются в панели администратора мгновенно.",
      signalrTitle: "Вещание через SignalR в реальном времени",
      tenantScopedTitle: "Изоляция по тенантам",
      title: "Аудит и комплаенс (Compliance)",
    },
    authDeep: {
      bcryptIntro:
        "Умышленно медленный алгоритм (work factor = 12) делает атаки перебором нерентабельными (каждый хэш занимает ~250 мс).",
      bcryptTitle: "Хэширование паролей BCrypt",
      cookieAuthTip:
        "Для максимальной безопасности настройте отправку refresh-токенов как HttpOnly, Secure, SameSite=Strict cookies.",
      description:
        "Жизненный цикл JWT, хэширование BCrypt, блокировка (Lockout), 2FA, OAuth, OTP и управление сессиями.",
      externalAuthIntro:
        "Интеграция с Google, Facebook, Apple и Microsoft с серверной валидацией токенов.",
      externalAuthTitle: "Внешняя аутентификация (OAuth)",
      impersonationIntro:
        "SuperAdmin может временно переключиться в профиль другого администратора для техподдержки.",
      impersonationTitle: "Имперсонация (Impersonation)",
      impersonationWarning:
        "Все действия при имперсонации логируются с двойной идентичностью (Оригинал + Имитатор). Нельзя имитировать аккаунты с равными или высшими правами.",
      intro: "Подробный обзор всех механизмов аутентификации SCRIPE.",
      jwtLifecycleIntro:
        "Refresh-токены одноразовые и ротируются (обновляются) при каждом использовании для предотвращения кражи.",
      jwtLifecycleTitle: "Жизненный цикл токенов JWT",
      lockoutIntro: "5 последовательных неудачных попыток входа блокируют аккаунт на 15 минут.",
      lockoutTitle: "Блокировка аккаунта (Account Lockout)",
      otpIntro:
        "6-значные коды для подтверждения почты, телефона и сброса пароля (живут 15 минут).",
      otpTitle: "Система OTP (Одноразовые пароли)",
      passkeysIntro:
        "Ключи доступа обеспечивают беспарольный механизм аутентификации с использованием криптографии с открытым ключом. При регистрации браузер генерирует пару открытого и закрытого ключей, отправляет открытый ключ и идентификатор учетных данных на сервер, а закрытый ключ надежно хранит в аутентификаторе устройства. При входе сервер выдает запрос, который аутентификатор подписывает закрытым ключом.",
      passkeysTitle: "Ключи доступа (Passkeys / WebAuthn)",
      qrIntro:
        "Вход по QR-коду позволяет пользователям мгновенно аутентифицироваться в веб-клиенте, отсканировав QR-код с помощью уже аутентифицированного мобильного приложения. Веб-клиент опрашивает состояние сессии до тех пор, пока мобильное приложение не подтвердит сессию, подписав токен сессии и отправив его вместе с учетными данными активной сессии пользователя.",
      qrTitle: "Авторизация по QR-коду",
      samlIntro:
        "SAML 2.0 обеспечивает единый вход (SSO) для предприятий путем федерации аутентификации между SCRIPE (выступающим в качестве поставщика услуг) и корпоративными поставщиками удостоверений (IdP), такими как Okta или Active Directory. Рукопожатие использует утверждения на основе XML, подписанные сертификатами X.509, для проверки личности и сопоставления ролей.",
      samlTitle: "Корпоративная федерация SAML 2.0",
      sessionIntro: "Stateless (без сохранения состояния) архитектура. JWT хранятся на клиенте.",
      sessionTitle: "Управление сессиями",
      ssoSuspensionIntro:
        "ExternalLoginCommandHandler теперь включает шлюз безопасности для проверки блокировки арендатора. Перед выдачей JWT после аутентификации SSO/OIDC обработчик проверяет статус арендатора администратора. Если арендатор заблокирован или аннулирован, вход отклоняется с локализованной ошибкой, что предотвращает обход заблокированными пользователями стандартных проверок входа через SSO.",
      ssoSuspensionTitle: "Шлюз блокировки арендатора при SSO",
      ssoSuspensionWarning:
        "Без этого шлюза пользователи SSO могли бы аутентифицироваться через внешнего провайдера (например, Google, Azure AD) и получать действительный JWT SCRIPE, даже если их арендатор был заблокирован или аннулирован. Эта критическая уязвимость в безопасности была устранена.",
      tfaIntro: "Генерация секретов и интеграция с приложениями-аутентификаторами.",
      tfaTitle: "Двухфакторная аутентификация (TOTP)",
      title: "Углубленная аутентификация",
      tokenStructureTitle: "Структура токена JWT",
    },
    dataProtection: {
      auditTrailTitle: "Журналы аудита для комплаенса",
      bypassWarning:
        "Использование IgnoreQueryFilters() снимает ВСЕ барьеры изоляции ORM. Будьте крайне осторожны.",
      consentTitle: "Управление согласием",
      dataAtRestIntro:
        "Используется TDE (Transparent Data Encryption) на уровне БД и Data Protection API ASP.NET Core для чувствительных ключей.",
      dataAtRestTitle: "Шифрование данных в покое",
      dataInTransitIntro: "Все коммуникации используют TLS 1.2+; HSTS включен для production.",
      dataInTransitTitle: "Шифрование данных при передаче",
      dataPortabilityTitle: "Переносимость данных",
      description:
        "Изоляция тенантов, шифрование в покое и при передаче, скрытие полей и соблюдение GDPR.",
      gdprIntro:
        "Механизмы для портативности данных, управления согласием и права быть забытым (удаление данных).",
      gdprTitle: "Соблюдение GDPR (Защита персональных данных)",
      idEncryptionIntro:
        "Скрывает внутренние Guid-идентификаторы от внешних клиентов с помощью алгоритма AES-256.",
      idEncryptionTitle: "Шифрование ID",
      intro:
        "SCRIPE защищает данные на всех уровнях: от сети (TLS) до конкретных строк и ячеек базы данных.",
      restrictedFieldsIntro:
        "FieldProjectionMiddleware автоматически удаляет (зануляет) свойства в ответах API, если роль не имеет прав на их просмотр.",
      restrictedFieldsTitle: "Скрытые поля (Field-Level Security)",
      retentionTitle: "Политики хранения данных",
      rightToDeleteTitle: "Право на удаление",
      tenantIsolationIntro:
        "Глобальные фильтры запросов EF Core обеспечивают изоляцию на самом низком уровне ORM.",
      tenantIsolationTitle: "Изоляция данных тенантов",
      tenantScopingTitle: "Скоупинг фильтров запросов",
      tenantServicesIntro:
        "Службы, которым нужен доступ к данным тенанта, внедряют IDataScopeService.",
      tenantServicesTitle: "Сервисы с учетом тенантов (Tenant-Aware Services)",
      title: "Защита данных",
    },
    middlewarePipeline: {
      cacheHeadersIntro: "Расставляет no-cache для API и max-age для статических файлов.",
      cacheHeadersTitle: "6. Заголовки кэширования",
      cookieAuthIntro:
        "Позволяет фронтенду использовать HttpOnly cookies, прозрачно преобразуя их в Bearer-токен для авторизации API.",
      cookieAuthTitle: "4. Конвертация Cookie-to-Bearer",
      correlationIdIntro:
        "Генерирует X-Correlation-ID для распределенной трассировки и логирования.",
      correlationIdTitle: "2. Идентификатор корреляции (Correlation ID)",
      description:
        "11 компонентов middleware, выполняемых в строгом порядке, от перехвата исключений до контекста тенанта.",
      fieldProjectionIntro:
        "Очищает (nullifies) запрещенные поля JSON-ответа на основе роли пользователя.",
      fieldProjectionTitle: "7. Проекция полей (Field Projection)",
      globalExceptionIntro:
        "Перехватывает ошибки 500 и возвращает чистый JSON без деталей стека вызовов (stack trace) в production.",
      globalExceptionTitle: "1. Глобальный обработчик исключений",
      intro:
        "Пайплайн запросов SCRIPE — это сердце приложения. Порядок исполнения имеет критическое значение.",
      observabilityIntro: "Сбор метрик OpenTelemetry и экспорт в Prometheus (/metrics).",
      observabilityTitle: "Middleware наблюдаемости (Observability)",
      orderWarning: "Не меняйте порядок Middleware, это приведет к каскадным сбоям и уязвимостям.",
      overviewIntro:
        "Каждый компонент выполняет единственную ответственность и может «замкнуть» (Short-circuit) запрос.",
      overviewTitle: "Обзор пайплайна",
      registrationIntro: "Файл Program.cs организует этот строгий порядок.",
      registrationTitle: "Порядок регистрации",
      requestLoggingIntro: "Скрывает пароли из лог-файлов Serilog для чувствительных маршрутов.",
      requestLoggingTitle: "3. Логирование запросов",
      summaryTitle: "Резюме Middleware",
      tenantContextIntro:
        "Извлекает ID тенанта из JWT-токена и инициализирует глобальные фильтры ORM.",
      tenantContextNote:
        "Middleware контекста тенанта ДОЛЖЕН запускаться ПОСЛЕ аутентификации, но ДО любых операций с БД.",
      tenantContextTitle: "5. Контекст тенанта (Tenant Context)",
      title: "Конвейер промежуточного ПО (Middleware Pipeline)",
    },
    overview: {
      corsIntro: "Политики различаются в зависимости от среды.",
      corsTitle: "Конфигурация CORS",
      description:
        "5-уровневая стратегия защиты, настройки CORS, ограничение скорости (rate limiting) и политики паролей.",
      feature2fa: "Двухфакторная аутентификация (2FA)",
      feature2faDesc: "TOTP-аутентификатор (Google Authenticator) и резервные коды.",
      featureAudit: "Журналирование (Аудит)",
      featureAuditDesc: "Broadcasting всех изменений в реальном времени.",
      featureCors: "Настройка CORS",
      featureCorsDesc:
        "Строгие политики происхождения для production, открытый CORS для localhost.",
      featureJwt: "Аутентификация JWT",
      featureJwtDesc:
        "Короткоживущие access-токены с автоматическим обновлением и подписью HMAC-SHA256.",
      featureRateLimit: "Rate Limiting",
      featureRateLimitDesc:
        "4 уровня: глобальная DDoS-защита, по IP, по эндпоинтам и лимиты авторизации.",
      featureRbac: "Права доступа (RBAC)",
      featureRbacDesc: "Полный движок PBAC/ABAC/RBAC, кэшируемый на стороне сервера.",
      featuresTitle: "Функции безопасности",
      intro:
        "SCRIPE реализует стратегию глубокой защиты (defense-in-depth) на пяти уровнях: сеть, аутентификация, авторизация, изоляция данных и аудит.",
      layersTitle: "Слои безопасности (Defense Layers)",
      passwordTitle: "Политики паролей",
      rateLimitTitle: "Политики Rate Limiting",
      securityWarning: "Всегда проверяйте настройки безопасности перед развертыванием в продакшен.",
      title: "Обзор безопасности",
    },
    sso: {
      apiTitle: "API Endpoints",
      architectureTitle: "Архитектура аутентификации OIDC / OAuth",
      authEndpointDesc:
        "Перенаправляет пользователя на страницу входа внешнего IdP. Включает верификацию PKCE и передачу токена состояния (state).",
      authEndpointTitle: "1. Эндпоинт авторизации (Authorize)",
      callbackEndpointDesc:
        "Принимает пользователя после успешной аутентификации и обменивает код авторизации на токены на стороне сервера — без участия браузера.",
      callbackEndpointTitle: "2. Эндпоинт обратного вызова (Callback)",
      claimMappingContent:
        "When an external IdP uses non-standard claim names, the ClaimMappingJson field maps them to SCRIPE's expected claims. If null, standard OIDC claim names (sub, email, name) are used.",
      claimMappingTitle: "Claim Mapping",
      description: "Аутентификация OIDC, привязка внешней идентичности и приложения OAuth.",
      endpointsTitle: "Эндпоинты и потоки (Flows)",
      entityModelContent:
        "The IdentityProvider entity stores all OIDC configuration for an external IdP. Each provider is optionally scoped to a tenant (TenantId = null means system-wide).",
      entityModelTitle: "Identity Provider Entity",
      flowIntro:
        "Процесс входа SSO включает многоступенчатый поток для обеспечения максимальной безопасности:",
      howItWorksContent:
        "SCRIPE uses the Authorization Code Flow with PKCE (Proof Key for Code Exchange) for SSO. This is the most secure OAuth2 flow, recommended by the OAuth 2.1 specification for all client types.",
      howItWorksTitle: "How SSO Works",
      intro:
        "Система SCRIPE поддерживает аутентификацию через внешних провайдеров на базе протокола OIDC и предоставление учетных данных через приложения OAuth. Система учитывает разделение тенантов со строгой защитой PKCE.",
      linkingContent:
        "Before SSO login works, a SCRIPE admin/user must link their account to the external identity. This creates an ExternalLogin record mapping the provider's subject ID to the SCRIPE account.",
      linkingIntro:
        "После успешного входа email проверяется по базе данных. Если это первый вход пользователя, запись OIDC привязывается к внутреннему аккаунту SCRIPE для предотвращения дублирования данных.",
      linkingTitle: "Привязка и обработка идентичности",
      oauthAppsContent:
        "OAuth Applications are third-party apps that authenticate against SCRIPE as an OIDC server. Each app gets a Client ID and Client Secret, with configurable redirect URIs, scopes, and PKCE enforcement.",
      oauthAppsTitle: "OAuth Applications",
      pkceContent:
        "PKCE prevents authorization code interception attacks by ensuring that only the client that initiated the flow can exchange the code. The code_verifier is never sent over the network — only its SHA-256 hash (code_challenge) is sent during the challenge step.",
      pkceTitle: "PKCE Security Model",
      pkceWarning:
        "Поддержка устаревших потоков Implicit OAuth удалена. Протокол PKCE обязателен для всех вариантов авторизации.",
      step1Content:
        "The login page fetches available SSO providers via GET /auth/oidc/providers/admin. Only enabled providers for the current login context (admin/user) are returned.",
      step1Title: "1. Provider Discovery",
      step2Content:
        "When the user clicks an SSO button, the frontend calls POST /auth/oidc/challenge. The backend generates a code_verifier, computes the code_challenge (SHA-256), and returns the authorization URL.",
      step2Title: "2. PKCE Challenge",
      step3Content:
        "The frontend stores PKCE state (code_verifier, state, providerId) in sessionStorage, then redirects the user to the external IdP's authorization endpoint.",
      step3Title: "3. IdP Redirect",
      step4Content:
        "The user authenticates at the external IdP (Azure AD, Google, Okta, etc.) and grants consent for the requested scopes.",
      step4Title: "4. User Authentication",
      step5Content:
        "The IdP redirects to /sso/callback with an authorization code. The frontend retrieves PKCE state from sessionStorage, validates the state parameter, and calls POST /auth/oidc/callback. The backend exchanges the code for tokens using the code_verifier.",
      step5Title: "5. Callback & Token Exchange",
      tenantScopingContent:
        "Identity Providers are tenant-scoped via the TenantId column. Providers with null TenantId are system-wide (available to all tenants). The backend automatically filters providers by the current admin's tenant context.",
      tenantScopingNote:
        "Host admins can manage any tenant's SSO providers by using the 'Enter Tenant World' feature from the Tenants page. This scopes all API calls to the target tenant without needing to log in as that tenant's admin.",
      tenantScopingTitle: "Tenant Scoping",
      title: "Единый вход (SSO)",
    },
  },
};
